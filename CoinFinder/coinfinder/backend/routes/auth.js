// hier wird die anmeldung geprüft und ein token als nachweis ausgestellt.
// der server unterschreibt diesen nachweis, damit er spätere änderungen daran erkennt.
// die zwei passwörter stehen für diese demo direkt im code. bei einer echten app wäre das so nicht geeignet.

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');

// mit diesem schlüssel wird der token unterschrieben. gültig bleibt er für zwei stunden.
const GEHEIM_SCHLUESSEL = process.env.JWT_SECRET || 'coinfinder-geheim-2024';
const TOKEN_LAUFZEIT    = '2h';

// die zwei testkonten ersetzen hier eine benutzertabelle in der datenbank.
const benutzerListe = [
  { id: 1, username: 'admin', passwort: 'admin123', rolle: 'admin', name: 'Administrator' },
  { id: 2, username: 'user',  passwort: 'user123',  rolle: 'user',  name: 'Demo User'     },
];

// bei einer anmeldungsanfrage lesen wir name und passwort aus den geschickten daten.
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // ohne beide angaben brechen wir ab. status 400 heißt, dass die anfrage unvollständig ist.
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Benutzername und Passwort angeben!' });
  }

  // sucht das erste konto, bei dem name und passwort zusammenpassen.
  // wird nichts gefunden, verweigern wir die anmeldung mit status 401.
  const gefundenerUser = benutzerListe.find(
    u => u.username === username && u.passwort === password
  );

  if (!gefundenerUser) {
    return res.status(401).json({ success: false, error: 'Falsche Zugangsdaten' });
  }

  // in den nachweis kommen nur benutzerdaten und rolle, das passwort wird nicht mitgeschickt.
  const tokenInhalt = {
    id:       gefundenerUser.id,
    username: gefundenerUser.username,
    role:     gefundenerUser.rolle,
    name:     gefundenerUser.name,
  };

  // erst hier wird der nachweis unterschrieben und seine ablaufzeit festgelegt.
  const token = jwt.sign(tokenInhalt, GEHEIM_SCHLUESSEL, { expiresIn: TOKEN_LAUFZEIT });

  console.log(`[AUTH] ${gefundenerUser.username} hat sich eingeloggt`);
  res.json({ success: true, token, user: tokenInhalt });
});

// hier kann der browser seine benutzerdaten mit einem gültigen token erneut abfragen.
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Kein Token angegeben' });
  }

  try {
    // entfernt das wort bearer samt leerzeichen und prüft unterschrift und ablaufzeit des restlichen tokens.
    const benutzer = jwt.verify(authHeader.slice(7), GEHEIM_SCHLUESSEL);
    res.json({ success: true, user: benutzer });
  } catch (fehler) {
    res.status(401).json({ success: false, error: 'Token ungültig oder abgelaufen' });
  }
});

// stellt die anmelderouten und den prüfschlüssel auch dem server zur verfügung.
module.exports = { router, SECRET: GEHEIM_SCHLUESSEL };
