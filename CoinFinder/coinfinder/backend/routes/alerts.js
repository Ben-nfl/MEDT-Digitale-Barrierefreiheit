// hier kann das frontend preisalarme laden, anlegen, löschen und zurücksetzen.
// ob der zielpreis erreicht ist, prüft der server beim laden neuer preise, nicht diese route.

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// holt die gespeicherten alarme, damit sie im frontend als liste angezeigt werden können.
router.get('/', async (req, res) => {
  try {
    const alarme = await db.alleAlarmeHolen();
    res.json({ success: true, data: alarme });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// ein neuer alarm braucht coin-symbol, zielpreis und die gewünschte richtung.
router.post('/', async (req, res) => {
  try {
    const { symbol, target_price, direction } = req.body;

    // prüft zuerst, ob alle benötigten angaben in der anfrage vorhanden sind.
    if (!symbol || target_price == null || !direction) {
      return res.status(400).json({ success: false, error: 'Symbol, Zielpreis und Richtung sind Pflicht' });
    }

    // above bedeutet über dem zielpreis, below bedeutet darunter. andere werte werden abgelehnt.
    if (!['above', 'below'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Richtung muss "above" oder "below" sein' });
    }

    // wandelt die eingabe in eine zahl um. ein ungültiger oder nicht positiver preis wird abgelehnt.
    const zielpreis = parseFloat(target_price);
    if (isNaN(zielpreis) || zielpreis <= 0) {
      return res.status(400).json({ success: false, error: 'Zielpreis muss eine positive Zahl sein' });
    }

    // speichert die geprüften angaben und schickt den neuen alarm an den browser zurück.
    const neuerAlarm = await db.alarmErstellen(symbol.toLowerCase(), zielpreis, direction);
    res.status(201).json({ success: true, data: neuerAlarm });

  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// die nummer aus der adresse bestimmt, welcher alarm gelöscht werden soll.
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

// beim zurücksetzen wird nur der zustand geändert, coin und zielpreis bleiben gleich.
// danach laden wir den eintrag noch einmal, damit das frontend den neuen stand bekommt.
router.patch('/:id/reset', async (req, res) => {
  try {
    await db.alarmZuruecksetzen(req.params.id);
    const aktualisierterAlarm = await db.alarmNachIdSuchen(req.params.id);
    res.json({ success: true, data: aktualisierterAlarm });
  } catch (fehler) {
    res.status(500).json({ success: false, error: fehler.message });
  }
});

// macht diese alarmrouten für den server verfügbar.
module.exports = router;
