// routes/watchlist.js – Coins zur Watchlist hinzufügen und löschen
//
// CRUD = Create, Read, Update, Delete – die vier Grundoperationen
// In diesem Fall brauchen wir kein Update, nur Hinzufügen und Löschen

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/watchlist – Alle Coins aus der Watchlist laden
router.get('/', async (req, res) => {
  try {
    const coins = await db.alleCoinsHolen();
    res.json({ success: true, data: coins });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// POST /api/watchlist – Neuen Coin hinzufügen
// Body muss enthalten: { symbol: "bitcoin", name: "Bitcoin", type: "crypto" }
router.post('/', async (req, res) => {
  try {
    const { symbol, name, type = 'crypto' } = req.body;

    if (!symbol || !name) {
      return res.status(400).json({ success: false, error: 'Symbol und Name sind Pflichtfelder' });
    }

    // Einheitliches Format: alles kleinschreiben, keine Leerzeichen am Rand
    const sauberesSymbol = symbol.toLowerCase().trim();

    // Prüfen ob der Coin schon drin ist – doppelte Einträge wollen wir nicht
    const bereitsVorhanden = await db.coinNachSymbolSuchen(sauberesSymbol);
    if (bereitsVorhanden) {
      return res.status(409).json({ success: false, error: 'Coin ist schon in deiner Watchlist' });
    }

    const neuerCoin = await db.coinHinzufuegen(sauberesSymbol, name.trim(), type);
    res.status(201).json({ success: true, data: neuerCoin });

  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// DELETE /api/watchlist/:symbol – Coin entfernen
// Beispiel: DELETE /api/watchlist/bitcoin
router.delete('/:symbol', async (req, res) => {
  try {
    const wurdeGeloescht = await db.coinLoeschen(req.params.symbol.toLowerCase());

    if (!wurdeGeloescht) {
      return res.status(404).json({ success: false, error: 'Coin nicht gefunden' });
    }

    res.json({ success: true });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

module.exports = router;
