// routes/alerts.js – Preisalarme erstellen und verwalten
//
// Ein Alarm feuert wenn ein Coin einen bestimmten Preis über- oder unterschreitet.
// Die eigentliche Prüfung passiert in server.js (beim Polling), hier ist nur die CRUD-API.

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/alerts – Alle Alarme abrufen
router.get('/', async (req, res) => {
  try {
    const alarme = await db.alleAlarmeHolen();
    res.json({ success: true, data: alarme });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// POST /api/alerts – Neuen Alarm erstellen
// Body: { symbol: "bitcoin", target_price: 100000, direction: "above" }
router.post('/', async (req, res) => {
  try {
    const { symbol, target_price, direction } = req.body;

    if (!symbol || target_price == null || !direction) {
      return res.status(400).json({ success: false, error: 'Symbol, Zielpreis und Richtung sind Pflicht' });
    }

    // Nur "above" oder "below" sind erlaubt
    if (!['above', 'below'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Richtung muss "above" oder "below" sein' });
    }

    const zielpreis = parseFloat(target_price);
    if (isNaN(zielpreis) || zielpreis <= 0) {
      return res.status(400).json({ success: false, error: 'Zielpreis muss eine positive Zahl sein' });
    }

    const neuerAlarm = await db.alarmErstellen(symbol.toLowerCase(), zielpreis, direction);
    res.status(201).json({ success: true, data: neuerAlarm });

  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// DELETE /api/alerts/:id – Alarm löschen
router.delete('/:id', async (req, res) => {
  try {
    const wurdeGeloescht = await db.alarmLoeschen(req.params.id);

    if (!wurdeGeloescht) {
      return res.status(404).json({ success: false, error: 'Alarm nicht gefunden' });
    }

    res.json({ success: true });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// PATCH /api/alerts/:id/reset – Ausgelösten Alarm zurücksetzen auf "active"
// PATCH bedeutet: nur ein Teil des Datensatzes wird geändert (nicht der ganze)
router.patch('/:id/reset', async (req, res) => {
  try {
    await db.alarmZuruecksetzen(req.params.id);
    const aktualisierterAlarm = await db.alarmNachIdSuchen(req.params.id);
    res.json({ success: true, data: aktualisierterAlarm });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

module.exports = router;
