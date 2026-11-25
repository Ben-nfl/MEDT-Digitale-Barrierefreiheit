// routes/prices.js – Kursabfragen über CoinGecko API
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const fetch   = require('node-fetch');

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

// GET /api/prices/current – Aktuelle Preise aller Coins in der Watchlist
router.get('/current', async (req, res) => {
  try {
    const watchlist = await db.alleCoinsHolen();

    if (!watchlist.length) {
      return res.json({ success: true, data: {} }); // leere Watchlist = keine Preise
    }

    // Symbole zusammenbauen: ["bitcoin", "ethereum"] → "bitcoin,ethereum"
    const symbolListe = watchlist.map(coin => coin.symbol).join(',');

    const antwort = await fetch(
      `${COINGECKO_URL}/simple/price?ids=${symbolListe}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    if (!antwort.ok) {
      return res.json({ success: false, error: `CoinGecko Fehler: ${antwort.status}` });
    }

    const preise = await antwort.json();
    res.json({ success: true, data: preise });

  } catch (fehler) {
    res.json({ success: false, error: fehler.message });
  }
});

// GET /api/prices/history/:symbol – Kursverlauf der letzten N Tage
// Beispiel: /api/prices/history/bitcoin?days=30
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

    // CoinGecko schickt sehr viele Punkte – wir nehmen nur jeden 6. damit der Chart nicht überladen ist
    // rohdaten.prices = [[zeitstempel, preis], [zeitstempel, preis], ...]
    const gefiltert = rohdaten.prices
      .filter((_, index) => index % 6 === 0)
      .map(([ts, preis]) => ({ timestamp: ts, price: preis }));

    res.json({ success: true, data: gefiltert });

  } catch (fehler) {
    res.json({ success: false, error: fehler.message });
  }
});

// GET /api/prices/search?q=bitcoin – Coins bei CoinGecko suchen
router.get('/search', async (req, res) => {
  try {
    const suchbegriff = req.query.q;

    if (!suchbegriff) {
      return res.status(400).json({ success: false, error: 'Suchbegriff fehlt' });
    }

    const antwort = await fetch(
      `${COINGECKO_URL}/search?query=${encodeURIComponent(suchbegriff)}`
      // encodeURIComponent macht Sonderzeichen URL-sicher (Leerzeichen → %20 usw.)
    );

    if (!antwort.ok) {
      return res.json({ success: false, error: antwort.status });
    }

    const daten = await antwort.json();

    // Nur die ersten 8 Treffer, und nur die Felder die wir brauchen
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

// GET /api/prices/demo – Festcodierte Demo-Daten, kein Internet nötig
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

module.exports = router;
