// diese routen laden, ergänzen und löschen coins in der gemeinsamen watchlist.
// ein bestehender coin wird hier nicht bearbeitet, dafür gibt es keine eigene route.

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// lädt die liste aus der datenbank und schickt sie als antwort an das frontend.
router.get('/', async (req, res) => {
  try {
    const coins = await db.alleCoinsHolen();
    res.json({ success: true, data: coins });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// zum hinzufügen braucht die anfrage ein symbol und einen namen.
// fehlt der typ, wird automatisch crypto verwendet.
router.post('/', async (req, res) => {
  try {
    const { symbol, name, type = 'crypto' } = req.body;

    if (!symbol || !name) {
      return res.status(400).json({ success: false, error: 'Symbol und Name sind Pflichtfelder' });
    }

    // schreibt das symbol klein und entfernt leerzeichen am rand, damit wir es gleich vergleichen können.
    const sauberesSymbol = symbol.toLowerCase().trim();

    // schaut nach, ob der coin schon gespeichert ist. status 409 meldet einen doppelten eintrag.
    const bereitsVorhanden = await db.coinNachSymbolSuchen(sauberesSymbol);
    if (bereitsVorhanden) {
      return res.status(409).json({ success: false, error: 'Coin ist schon in deiner Watchlist' });
    }

    // speichert den coin und gibt mit status 201 zurück, dass ein neuer eintrag erstellt wurde.
    const neuerCoin = await db.coinHinzufuegen(sauberesSymbol, name.trim(), type);
    res.status(201).json({ success: true, data: neuerCoin });

  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// das symbol steht hier direkt in der adresse, zum beispiel am ende von /api/watchlist/bitcoin.
// wenn es dazu keinen coin gibt, schicken wir status 404 statt einer erfolgsmeldung.
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

// gibt die routensammlung zurück, die der server unter /api/watchlist einhängt.
module.exports = router;
