// routes/auth.js – Login-Logik
//
// JWT = JSON Web Token. Nach dem Login bekommt der User einen "Ausweis"
// den er bei jeder weiteren Anfrage mitschickt. So weiß der Server wer fragt.
// In echten Apps würde man Passwörter NIEMALS im Klartext speichern – hier ist
// es nur ein Demo-Projekt, daher machen wir das vereinfacht.

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');

const GEHEIM_SCHLUESSEL = process.env.JWT_SECRET || 'coinfinder-geheim-2024';
const TOKEN_LAUFZEIT    = '2h';

// Demo-Benutzer – normalerweise käme das aus einer Datenbank
const benutzerListe = [
  { id: 1, username: 'admin', passwort: 'admin123', rolle: 'admin', name: 'Administrator' },
  { id: 2, username: 'user',  passwort: 'user123',  rolle: 'user',  name: 'Demo User'     },
];

// POST /api/auth/login – Benutzer einloggen
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Benutzername und Passwort angeben!' });
  }

  // find() gibt das erste Element zurück das die Bedingung erfüllt, sonst undefined
  const gefundenerUser = benutzerListe.find(
    u => u.username === username && u.passwort === password
  );

  if (!gefundenerUser) {
    return res.status(401).json({ success: false, error: 'Falsche Zugangsdaten' });
  }

  const tokenInhalt = {
    id:       gefundenerUser.id,
    username: gefundenerUser.username,
    role:     gefundenerUser.rolle,
    name:     gefundenerUser.name,
  };

  const token = jwt.sign(tokenInhalt, GEHEIM_SCHLUESSEL, { expiresIn: TOKEN_LAUFZEIT });

  console.log(`[AUTH] ${gefundenerUser.username} hat sich eingeloggt`);
  res.json({ success: true, token, user: tokenInhalt });
});

// GET /api/auth/me – Eigene Userdaten abrufen (Token muss im Header sein)
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Kein Token angegeben' });
  }

  try {
    // "Bearer <token>" → wir nehmen nur den Teil ab Zeichen 7
    const benutzer = jwt.verify(authHeader.slice(7), GEHEIM_SCHLUESSEL);
    res.json({ success: true, user: benutzer });
  } catch (fehler) {
    res.status(401).json({ success: false, error: 'Token ungültig oder abgelaufen' });
  }
});

module.exports = { router, SECRET: GEHEIM_SCHLUESSEL };
