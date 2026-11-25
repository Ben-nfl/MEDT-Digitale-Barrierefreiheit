// hier laufen die web-app, die anfragen ans backend und die live-verbindung zusammen.
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

// express nimmt normale web-anfragen an. die live-verbindung benutzt denselben server und port.
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

const PORT          = process.env.PORT || 3001;
const POLLING_PAUSE = 60000;  // der feste zeitabstand für die wiederholte preisabfrage
const HEARTBEAT     = 30000;  // alle 30 sekunden wird der verbindungszustand kontrolliert

// diese vorbereitung erlaubt anfragen von anderen ursprüngen und liest geschickte json-daten ein.
app.use(cors());
app.use(express.json());
const { existsSync } = require('fs');
// sucht den ordner mit der gebauten webseite. express liefert daraus html, bilder und skripte aus.
const staticPfad = existsSync(path.join(__dirname, 'public/index.html')) ? path.join(__dirname, 'public') : path.join(__dirname, '../frontend/public');
app.use(express.static(staticPfad));

// je nach anfang der adresse wird die anfrage an die passende routendatei weitergegeben.
app.use('/api/auth',      authRouter);
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/prices',    require('./routes/prices'));

// diese kleine antwort zeigt docker, ob der webserver noch anfragen beantwortet.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', zeitstempel: new Date().toISOString() });
});

// unter /api-docs wird die beschreibung aus der yaml-datei als testoberfläche angezeigt.
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

// bei anderen adressen schicken wir die startdatei der app.
// angular entscheidet dann im browser, welche seite zu dieser adresse gehört.
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPfad, 'index.html'));
});

// bei einer neuen live-verbindung lesen wir den token aus der adresse.
// ohne gültigen nachweis wird die verbindung sofort wieder geschlossen.
wss.on('connection', (ws, req) => {
  const url   = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(1008, 'Kein Token angegeben');
    return;
  }

  try {
    // prüft den token und merkt sich, zu welchem benutzer diese verbindung gehört.
    ws.benutzer  = jwt.verify(token, SECRET);
    ws.nochAktiv = true;
    console.log(`[WS] Verbunden: ${ws.benutzer.username}`);
  } catch (e) {
    ws.close(1008, 'Token ungültig');
    return;
  }

  // schickt dem frisch verbundenen browser eine bestätigung mit benutzername und zeitpunkt.
  ws.send(JSON.stringify({
    type: 'verbunden',
    payload: { zeitstempel: new Date().toISOString(), benutzer: ws.benutzer.username }
  }));

  // falls schon preise im speicher sind, schicken wir sie sofort. so muss der browser nicht auf die nächste abfrage warten.
  if (Object.keys(letztePreise).length > 0) {
    ws.send(JSON.stringify({
      type: 'price_update',
      payload: { prices: letztePreise, timestamp: new Date().toISOString(), cached: true }
    }));
  }

  // nachrichten kommen als text an. erst nach dem einlesen können wir ihren typ prüfen.
  ws.on('message', (nachricht) => {
    try {
      const daten = JSON.parse(nachricht.toString());

      if (daten.type === 'pong') {
        ws.nochAktiv = true; // die textantwort zeigt, dass diese verbindung noch reagiert
        return;
      }

      // auf eine nachfrage vom browser antworten wir mit pong. das ist hier eine eigene textnachricht.
      if (daten.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', payload: { zeit: new Date().toISOString() } }));
        return;
      }

      // wenn der browser einen anderen token schickt, wird dieser geprüft und als benutzernachweis übernommen.
      // ein neuer token wird hier nicht selbst ausgestellt.
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

      // nur die rolle admin darf diese nachricht an alle verbundenen browser weitergeben.
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

// alle 30 sekunden prüfen wir das merkerfeld der verbindungen.
// wurde es seit der letzten prüfung nicht wieder gesetzt, wird die verbindung beendet.
// das ping hier ist ein websocket-steuersignal. es ist nicht dieselbe nachricht wie unser json-ping oben.
const heartbeatIntervall = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.nochAktiv) {
      console.log(`[WS] Zombie entfernt: ${ws.benutzer?.username}`);
      ws.terminate();
      return;
    }
    ws.nochAktiv = false; // bis zur nächsten prüfung muss eine passende textantwort oder token-nachricht das feld wieder setzen
    ws.ping();
  });
}, HEARTBEAT);

// wenn der live-server geschlossen wird, soll seine regelmäßige prüfung nicht weiterlaufen.
wss.on('close', () => clearInterval(heartbeatIntervall));

// wandelt eine nachricht einmal in text um und schickt sie nur an noch offene verbindungen.
function anAlle(nachricht) {
  const text = JSON.stringify(nachricht);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(text);
    }
  });
}

// hier werden die letzten preise im arbeitsspeicher behalten und regelmäßig neu abgefragt.
let letztePreise = {};
let wartepause   = POLLING_PAUSE; // merkt sich die erhöhte pause bei zu vielen anfragen

// liest die watchlist und fragt die aktuellen dollarpreise samt tagesänderung und marktwert ab.
async function preiseAktualisieren() {
  try {
    const watchlist = await db.alleCoinsHolen();

    if (!watchlist.length) return; // nichts zu holen

    const symbolListe = watchlist.map(coin => coin.symbol).join(',');

    const antwort = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolListe}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    // status 429 heißt, dass coingecko zu viele anfragen bekommen hat.
    // dann behalten wir die alten preise und schicken sie, falls vorhanden, noch einmal weiter.
    // die pausenvariable wird hier erhöht, aber das feste intervall beim start benutzt sie bisher nicht.
    if (antwort.status === 429) {
      wartepause = Math.min(wartepause * 2, 300000); // die gespeicherte pause wird höchstens fünf minuten groß
      console.warn('[POLLING] Rate Limit! Warte', wartepause / 1000, 'Sekunden');
      if (Object.keys(letztePreise).length > 0) {
        anAlle({ type: 'price_update', payload: { prices: letztePreise, timestamp: new Date().toISOString(), cached: true } });
      }
      return;
    }

    if (!antwort.ok) return;

    wartepause   = POLLING_PAUSE; // nach einer erfolgreichen antwort bekommt die variable wieder den normalen wert
    const preise = await antwort.json();
    letztePreise = preise;

    anAlle({ type: 'price_update', payload: { prices: preise, timestamp: new Date().toISOString() } });

    // mit den neuen preisen werden danach auch die aktiven alarme geprüft.
    await alarmeUeberpruefen(preise);

    console.log('[POLLING] Preise aktualisiert:', Object.keys(preise).join(', '));

  } catch (fehler) {
    console.error('[POLLING] Fehler:', fehler.message);
  }
}

// geht aktive alarme einzeln durch und vergleicht ihren zielpreis mit den geladenen preisen.
async function alarmeUeberpruefen(preise) {
  const aktiveAlarme = await db.aktiveAlarmeHolen();

  for (const alarm of aktiveAlarme) {
    // sucht den dollarpreis für den coin dieses alarms.
    // das fragezeichen verhindert einen fehler, falls zu diesem coin keine preisdaten vorhanden sind.
    const aktuellerPreis = preise[alarm.symbol]?.usd;

    if (!aktuellerPreis) continue; // fehlende preise und auch der wert null werden hier übersprungen

    // above löst beim erreichen oder überschreiten aus, below beim erreichen oder unterschreiten.
    // die beiden vergleiche sind mit oder verbunden, deshalb reicht einer davon aus.
    const hatAusgeloest =
      (alarm.richtung === 'above' && aktuellerPreis >= alarm.zielpreis) ||
      (alarm.richtung === 'below' && aktuellerPreis <= alarm.zielpreis);

    if (hatAusgeloest) {
      // speichert zuerst den ausgelösten zustand. danach bekommen die verbundenen browser die meldung.
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

// erst wenn die datenbank bereit ist, starten die preisabfragen und der webserver.
async function starten() {
  // versucht die tabellen bis zu zehnmal vorzubereiten.
  // zwischen fehlversuchen warten wir drei sekunden, weil die datenbank beim start noch laden kann.
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

  // wenn kein versuch klappt, wird der prozess mit einem fehlercode beendet.
  if (versuche === 0) {
    console.error('[DB] Datenbank nicht erreichbar, Abbruch!');
    process.exit(1);
  }

  // stößt sofort eine abfrage an und dann alle 60 sekunden eine weitere.
  // hier wird der feste zeitabstand verwendet, nicht die oben berechnete pausenvariable.
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

// beim beenden mit der tastatur wird die verbindungsprüfung gestoppt und der webserver geschlossen.
process.on('SIGINT', () => {
  clearInterval(heartbeatIntervall);
  server.close(() => process.exit(0));
});
