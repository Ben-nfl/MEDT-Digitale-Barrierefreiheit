// diese routen holen preise, kursverläufe und suchtreffer von coingecko.
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const fetch   = require('node-fetch');

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

// lädt nur die preise der gespeicherten coins. bei einer leeren liste sparen wir uns die externe anfrage.
router.get('/current', async (req, res) => {
  try {
    const watchlist = await db.alleCoinsHolen();

    if (!watchlist.length) {
      return res.json({ success: true, data: {} }); // leere watchlist = keine preise
    }

    // baut aus den coin-ids eine liste mit kommas, damit eine einzige anfrage für alle reicht.
    const symbolListe = watchlist.map(coin => coin.symbol).join(',');

    const antwort = await fetch(
      `${COINGECKO_URL}/simple/price?ids=${symbolListe}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    if (!antwort.ok) {
      return res.json({ success: false, error: `CoinGecko Fehler: ${antwort.status}` });
    }

    // liest die antwort als datenobjekt und reicht es an das frontend weiter.
    const preise = await antwort.json();
    res.json({ success: true, data: preise });

  } catch (fehler) {
    res.json({ success: false, error: fehler.message });
  }
});

// holt den kursverlauf für einen coin. ohne angabe des zeitraums nehmen wir sieben tage.
router.get('/history/:symbol', async (req, res) => {
  try {
    const tage = req.query.days || 7;

    const antwort = await fetch(
      `${COINGECKO_URL}/coins/${req.params.symbol}/market_chart?vs_currency=usd&days=${tage}`
    );

    if (!antwort.ok) {
      return res.json({ success: false, error: antwort.status });
    }

    const rohdaten = await antwort.json();

    // die antwort enthält paare aus zeitpunkt und preis. wir behalten jeden sechsten punkt,
    // damit das diagramm nicht so voll wird. danach geben wir den beiden werten verständliche namen.
    const gefiltert = rohdaten.prices
      .filter((_, index) => index % 6 === 0)
      .map(([ts, preis]) => ({ timestamp: ts, price: preis }));

    res.json({ success: true, data: gefiltert });

  } catch (fehler) {
    res.json({ success: false, error: fehler.message });
  }
});

// sucht nach dem text hinter q in der adresse, zum beispiel nach bitcoin.
router.get('/search', async (req, res) => {
  try {
    const suchbegriff = req.query.q;

    if (!suchbegriff) {
      return res.status(400).json({ success: false, error: 'Suchbegriff fehlt' });
    }

    const antwort = await fetch(
      `${COINGECKO_URL}/search?query=${encodeURIComponent(suchbegriff)}`
      // verpackt leerzeichen und sonderzeichen so, dass sie in der adresse nicht falsch gelesen werden.
    );

    if (!antwort.ok) {
      return res.json({ success: false, error: antwort.status });
    }

    const daten = await antwort.json();

    // nimmt höchstens acht treffer und entfernt infos, die unsere vorschlagsliste nicht braucht.
    // die id wird später gespeichert, das kurze symbol ist nur für die anzeige.
    const ergebnisse = (daten.coins || []).slice(0, 8).map(coin => ({
      id:     coin.id,
      name:   coin.name,
      symbol: coin.symbol.toUpperCase(),
      thumb:  coin.thumb,
    }));

    res.json({ success: true, data: ergebnisse });

  } catch (fehler) {
    res.json({ success: false, error: fehler.message });
  }
});

// diese festen beispielpreise kann man auch ohne verbindung zu coingecko abrufen.
// sie werden durch diese route angeboten, aber nicht automatisch bei jeder fehlgeschlagenen abfrage eingesetzt.
router.get('/demo', (req, res) => {
  res.json({
    success: true,
    data: {
      bitcoin:     { usd: 67420,  usd_24h_change: 2.34,  usd_market_cap: 1320000000000 },
      ethereum:    { usd: 3521.5, usd_24h_change: -1.12, usd_market_cap: 423000000000  },
      solana:      { usd: 182.3,  usd_24h_change: 5.67,  usd_market_cap: 85000000000   },
      binancecoin: { usd: 608.4,  usd_24h_change: 0.89,  usd_market_cap: 89000000000   },
      ripple:      { usd: 0.5821, usd_24h_change: -0.45, usd_market_cap: 32000000000   },
    },
  });
});

// der server hängt diese preisanfragen unter /api/prices ein.
module.exports = router;
