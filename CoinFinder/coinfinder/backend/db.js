// diese datei kümmert sich um die datenbank, damit die routen kein eigenes sql brauchen.
const { Pool } = require('pg');

// die zugangsdaten kommen aus der umgebung, zum beispiel von docker.
// der pool hält verbindungen bereit, damit nicht jede abfrage eine neue aufbauen muss.
const datenbankVerbindung = new Pool({
  host:     process.env.DB_HOST     || 'db',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'coinfinder',
  user:     process.env.DB_USER     || 'coinfinder',
  password: process.env.DB_PASSWORD || 'coinfinder123',
});

// beim starten werden die tabellen angelegt, falls sie noch fehlen.
// vorhandene tabellen und ihre einträge bleiben dabei erhalten.
async function datenbankStarten() {
  const client = await datenbankVerbindung.connect();
  try {
    // die watchlist speichert coins, die alarmtabelle speichert preisgrenzen.
    // die nummer wird automatisch vergeben. ein coin-symbol darf in der watchlist nur einmal vorkommen.
    // bei alarmen erlaubt die datenbank nur die richtungen above und below.
    await client.query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id         SERIAL PRIMARY KEY,
        symbol     VARCHAR(100) UNIQUE NOT NULL,
        name       VARCHAR(255) NOT NULL,
        type       VARCHAR(50)  NOT NULL DEFAULT 'crypto',
        erstellt_am TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS alarme (
        id           SERIAL PRIMARY KEY,
        symbol       VARCHAR(100) NOT NULL,
        zielpreis    NUMERIC(20,8) NOT NULL,
        richtung     VARCHAR(10) NOT NULL CHECK (richtung IN ('above','below')),
        status       VARCHAR(20) NOT NULL DEFAULT 'active',
        erstellt_am  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ausgeloest_am TIMESTAMPTZ
      );
    `);
    console.log('[DB] Tabellen sind bereit!');
  } finally {
    // auch bei einem fehler geben wir die verbindung zurück, damit andere abfragen sie wieder benutzen kann.
    client.release();
  }
}

// hier kommen die abfragen für die gemeinsame watchlist.

// holt alle coins, die zuletzt eingefügten stehen durch die sortierung zuerst.
// rows enthält nur die gefundenen zeilen und nicht die restlichen infos zur abfrage.
async function alleCoinsHolen() {
  const { rows } = await datenbankVerbindung.query('SELECT * FROM watchlist ORDER BY id DESC');
  return rows;
}

// sucht genau einen coin. wenn keiner gefunden wird, geben wir null zurück.
async function coinNachSymbolSuchen(symbol) {
  const { rows } = await datenbankVerbindung.query(
    'SELECT * FROM watchlist WHERE symbol = $1',
    [symbol]
    // der wert wird getrennt vom sql-befehl übergeben. dadurch wird eine eingabe nicht als befehl ausgeführt.
  );
  return rows[0] || null;
}

// speichert einen coin. die platzhalter bekommen die werte aus der liste in derselben reihenfolge.
// mit returning bekommen wir den gespeicherten eintrag samt neuer nummer zurück.
async function coinHinzufuegen(symbol, name, type) {
  const { rows } = await datenbankVerbindung.query(
    'INSERT INTO watchlist (symbol, name, type) VALUES ($1, $2, $3) RETURNING *',
    [symbol, name, type]
  );
  return rows[0];
}

// löscht den coin mit diesem symbol. an der anzahl gelöschter zeilen erkennt die route, ob es ihn gab.
async function coinLoeschen(symbol) {
  const { rowCount } = await datenbankVerbindung.query(
    'DELETE FROM watchlist WHERE symbol = $1',
    [symbol]
  );
  return rowCount > 0; // true bedeutet, dass mindestens ein eintrag gelöscht wurde
}

// diese abfragen lesen und ändern die gespeicherten preisalarme.

// lädt die alarm-liste mit den neuesten einträgen zuerst.
async function alleAlarmeHolen() {
  const { rows } = await datenbankVerbindung.query('SELECT * FROM alarme ORDER BY id DESC');
  return rows;
}

// sucht einen alarm über seine nummer, etwa nach dem zurücksetzen.
async function alarmNachIdSuchen(id) {
  const { rows } = await datenbankVerbindung.query(
    'SELECT * FROM alarme WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

// speichert coin, zielpreis und richtung. der neue alarm ist durch den standardwert zunächst aktiv.
async function alarmErstellen(symbol, zielpreis, richtung) {
  const { rows } = await datenbankVerbindung.query(
    'INSERT INTO alarme (symbol, zielpreis, richtung) VALUES ($1, $2, $3) RETURNING *',
    [symbol, zielpreis, richtung]
  );
  return rows[0];
}

// entfernt einen alarm über seine nummer. false heißt, dass kein passender eintrag da war.
async function alarmLoeschen(id) {
  const { rowCount } = await datenbankVerbindung.query(
    'DELETE FROM alarme WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

// merkt sich, dass der alarm ausgelöst wurde, und speichert den zeitpunkt dazu.
// so wird er bei der nächsten prüfung der aktiven alarme nicht noch einmal ausgelöst.
async function alarmAusloesen(id, zeitstempel) {
  await datenbankVerbindung.query(
    "UPDATE alarme SET status = 'triggered', ausgeloest_am = $1 WHERE id = $2",
    [zeitstempel, id]
  );
}

// setzt den alarm wieder auf aktiv und entfernt den alten auslösezeitpunkt.
async function alarmZuruecksetzen(id) {
  await datenbankVerbindung.query(
    "UPDATE alarme SET status = 'active', ausgeloest_am = NULL WHERE id = $1",
    [id]
  );
}

// für die automatische preisprüfung brauchen wir nur alarme, die noch aktiv sind.
async function aktiveAlarmeHolen() {
  const { rows } = await datenbankVerbindung.query(
    "SELECT * FROM alarme WHERE status = 'active'"
  );
  return rows;
}

// damit können server und routen die funktionen aus dieser datei aufrufen.
module.exports = {
  datenbankStarten,
  alleCoinsHolen,
  coinNachSymbolSuchen,
  coinHinzufuegen,
  coinLoeschen,
  alleAlarmeHolen,
  alarmNachIdSuchen,
  alarmErstellen,
  alarmLoeschen,
  alarmAusloesen,
  alarmZuruecksetzen,
  aktiveAlarmeHolen,
  // die gleichen funktionen werden zusätzlich unter ihren alten namen angeboten.
  getAllWatchlist: alleCoinsHolen,
  getActiveAlerts: aktiveAlarmeHolen,
  triggerAlert: alarmAusloesen,
  initDb: datenbankStarten,
};
