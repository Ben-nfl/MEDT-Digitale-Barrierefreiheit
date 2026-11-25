// server.js
const express      = require('express');
const http         = require('http');
const WebSocket    = require('ws');
const cors         = require('cors');
const path         = require('path');
const fetch        = require('node-fetch');
const jwt          = require('jsonwebtoken');
const swaggerUi    = require('swagger-ui-express');
const YAML         = require('yamljs');

const db = require('./db');
const { router: authRouter, SECRET } = require('./routes/auth');

// App und Server erstellen
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

const PORT          = process.env.PORT || 3001;
const POLLING_PAUSE = 60000;  // 60 Sekunden zwischen CoinGecko-Anfragen
const HEARTBEAT     = 30000;  // alle 30s prüfen ob Clients noch da sind

// Middleware – läuft bei JEDER Anfrage
app.use(cors());
app.use(express.json());
const { existsSync } = require('fs');
const staticPfad = existsSync(path.join(__dirname, 'public/index.html')) ? path.join(__dirname, 'public') : path.join(__dirname, '../frontend/public');
app.use(express.static(staticPfad));

// API-Routen registrieren – jede Datei kümmert sich um ihren Bereich
app.use('/api/auth',      authRouter);
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/prices',    require('./routes/prices'));

// Health-Check – damit Docker weiß ob der Server noch lebt
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', zeitstempel: new Date().toISOString() });
});

// Swagger UI – erreichbar unter /api-docs
// Hier kann man alle Endpunkte direkt im Browser testen
const swaggerDokument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDokument, {
  customSiteTitle: 'CoinFinder API Docs',
  customCss: `
    .swagger-ui .topbar { background: #1a1d27; border-bottom: 1px solid #2a2d3e; }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .topbar-wrapper::before { content: '🪙 CoinFinder API'; color: #f97316; font-size: 18px; font-weight: 700; }
    body { background: #0f1117 !important; }
    .swagger-ui { filter: invert(0); }
  `,
}));

// Alle anderen URLs → Frontend schicken (Single Page App)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPfad, 'index.html'));
});

// ===== WebSocket: Neue Verbindung =====
wss.on('connection', (ws, req) => {
  const url   = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(1008, 'Kein Token angegeben');
    return;
  }

  try {
    ws.benutzer  = jwt.verify(token, SECRET);
    ws.nochAktiv = true;
    console.log(`[WS] Verbunden: ${ws.benutzer.username}`);
  } catch (e) {
    ws.close(1008, 'Token ungültig');
    return;
  }

  // Begrüßungsnachricht an den neuen Client
  ws.send(JSON.stringify({
    type: 'verbunden',
    payload: { zeitstempel: new Date().toISOString(), benutzer: ws.benutzer.username }
  }));

  // Wenn wir schon Preise gecacht haben, sofort schicken (kein unnötiges Warten)
  if (Object.keys(letztePreise).length > 0) {
    ws.send(JSON.stringify({
      type: 'price_update',
      payload: { prices: letztePreise, timestamp: new Date().toISOString(), cached: true }
    }));
  }

  // Nachrichten vom Client empfangen
  ws.on('message', (nachricht) => {
    try {
      const daten = JSON.parse(nachricht.toString());

      if (daten.type === 'pong') {
        ws.nochAktiv = true; // Client hat geantwortet, Verbindung lebt
        return;
      }

      if (daten.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', payload: { zeit: new Date().toISOString() } }));
        return;
      }

      // Token erneuern falls er bald abläuft
      if (daten.type === 'token_refresh') {
        try {
          ws.benutzer  = jwt.verify(daten.token, SECRET);
          ws.nochAktiv = true;
          ws.send(JSON.stringify({ type: 'token_ok', payload: { benutzer: ws.benutzer.username } }));
        } catch {
          ws.close(1008, 'Token Refresh fehlgeschlagen');
        }
        return;
      }

      // Admin kann Nachrichten an alle schicken
      if (daten.type === 'admin_broadcast') {
        if (ws.benutzer.role !== 'admin') {
          ws.send(JSON.stringify({ type: 'fehler', payload: { message: 'Keine Berechtigung' } }));
          return;
        }
        anAlle({ type: 'admin_message', payload: { text: daten.message, von: ws.benutzer.username } });
      }

    } catch (e) {
      console.error('[WS] Nachricht konnte nicht gelesen werden:', e.message);
    }
  });

  ws.on('close', () => console.log(`[WS] Getrennt: ${ws.benutzer?.username || 'unbekannt'}`));
  ws.on('error', (e) => console.error('[WS] Fehler:', e.message));
});

// ===== Heartbeat: Zombie-Verbindungen rausschmeißen =====
// Manche Clients trennen sich ohne es zu sagen – das erkennen wir hiermit
const heartbeatIntervall = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.nochAktiv) {
      console.log(`[WS] Zombie entfernt: ${ws.benutzer?.username}`);
      ws.terminate();
      return;
    }
    ws.nochAktiv = false; // auf false – wird durch 'pong' wieder true
    ws.ping();
  });
}, HEARTBEAT);

wss.on('close', () => clearInterval(heartbeatIntervall));

// Hilfsfunktion: Nachricht an alle offenen Verbindungen schicken
function anAlle(nachricht) {
  const text = JSON.stringify(nachricht);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(text);
    }
  });
}

// ===== Preis-Polling =====
let letztePreise = {};
let wartepause   = POLLING_PAUSE; // wird bei Rate-Limit erhöht

async function preiseAktualisieren() {
  try {
    const watchlist = await db.alleCoinsHolen();

    if (!watchlist.length) return; // nichts zu holen

    const symbolListe = watchlist.map(coin => coin.symbol).join(',');

    const antwort = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolListe}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    // Rate Limit: CoinGecko mag es nicht wenn wir zu oft fragen
    if (antwort.status === 429) {
      wartepause = Math.min(wartepause * 2, 300000); // max 5 Minuten warten
      console.warn('[POLLING] Rate Limit! Warte', wartepause / 1000, 'Sekunden');
      if (Object.keys(letztePreise).length > 0) {
        anAlle({ type: 'price_update', payload: { prices: letztePreise, timestamp: new Date().toISOString(), cached: true } });
      }
      return;
    }

    if (!antwort.ok) return;

    wartepause   = POLLING_PAUSE; // zurücksetzen nach erfolgreichem Aufruf
    const preise = await antwort.json();
    letztePreise = preise;

    anAlle({ type: 'price_update', payload: { prices: preise, timestamp: new Date().toISOString() } });

    // Gleichzeitig prüfen ob Alarme ausgelöst werden müssen
    await alarmeUeberpruefen(preise);

    console.log('[POLLING] Preise aktualisiert:', Object.keys(preise).join(', '));

  } catch (fehler) {
    console.error('[POLLING] Fehler:', fehler.message);
  }
}

// Prüft alle aktiven Alarme gegen die aktuellen Preise
async function alarmeUeberpruefen(preise) {
  const aktiveAlarme = await db.aktiveAlarmeHolen();

  for (const alarm of aktiveAlarme) {
    // Hier holen wir den aktuellen Preis für das Symbol des Alarms
    // ?. = optional chaining: kein Absturz wenn das Symbol nicht in den Preisen ist
    const aktuellerPreis = preise[alarm.symbol]?.usd;

    if (!aktuellerPreis) continue; // Symbol hat keinen Preis → überspringen

    const hatAusgeloest =
      (alarm.richtung === 'above' && aktuellerPreis >= alarm.zielpreis) ||
      (alarm.richtung === 'below' && aktuellerPreis <= alarm.zielpreis);

    if (hatAusgeloest) {
      await db.alarmAusloesen(alarm.id, new Date().toISOString());
      anAlle({
        type: 'price_alert_triggered',
        payload: {
          alert_id:      alarm.id,
          symbol:        alarm.symbol,
          target_price:  alarm.zielpreis,
          current_price: aktuellerPreis,
          direction:     alarm.richtung,
        }
      });
      console.log(`[ALARM] Ausgelöst! ${alarm.symbol} bei ${aktuellerPreis}`);
    }
  }
}

// ===== Server starten =====
async function starten() {
  // DB-Verbindung aufbauen – bei Docker kann die DB noch nicht bereit sein
  let versuche = 10;
  while (versuche > 0) {
    try {
      await db.datenbankStarten();
      break;
    } catch (fehler) {
      versuche--;
      console.warn(`[DB] Noch nicht bereit... (${versuche} Versuche übrig)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (versuche === 0) {
    console.error('[DB] Datenbank nicht erreichbar, Abbruch!');
    process.exit(1);
  }

  // Sofort einmal Preise holen, dann alle 60s wiederholen
  preiseAktualisieren();
  setInterval(preiseAktualisieren, POLLING_PAUSE);

  server.listen(PORT, () => {
    console.log(`\n🚀 CoinFinder läuft auf http://localhost:${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`📖 Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`🔐 Login: admin/admin123  oder  user/user123\n`);
  });
}

starten();

process.on('SIGINT', () => {
  clearInterval(heartbeatIntervall);
  server.close(() => process.exit(0));
});
