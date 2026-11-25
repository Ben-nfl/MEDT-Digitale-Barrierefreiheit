// db.js 
const { Pool } = require('pg');

// Verbindungsdaten – kommen aus Docker-Umgebungsvariablen oder haben Standardwerte
const datenbankVerbindung = new Pool({
  host:     process.env.DB_HOST     || 'db',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'coinfinder',
  user:     process.env.DB_USER     || 'coinfinder',
  password: process.env.DB_PASSWORD || 'coinfinder123',
});

// Tabellen anlegen beim ersten Start – IF NOT EXISTS verhindert Fehler bei erneutem Aufruf
async function datenbankStarten() {
  const client = await datenbankVerbindung.connect();
  try {
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
    // WICHTIG: Verbindung immer zurückgeben, sonst gibt es irgendwann keine mehr
    client.release();
  }
}

// ===== Watchlist-Funktionen =====

async function alleCoinsHolen() {
  const { rows } = await datenbankVerbindung.query('SELECT * FROM watchlist ORDER BY id DESC');
  return rows;
}

async function coinNachSymbolSuchen(symbol) {
  const { rows } = await datenbankVerbindung.query(
    'SELECT * FROM watchlist WHERE symbol = $1',
    [symbol]
    // $1 ist ein Platzhalter – so verhindern wir SQL-Injection (böse Eingaben)
  );
  return rows[0] || null;
}

async function coinHinzufuegen(symbol, name, type) {
  const { rows } = await datenbankVerbindung.query(
    'INSERT INTO watchlist (symbol, name, type) VALUES ($1, $2, $3) RETURNING *',
    [symbol, name, type]
  );
  return rows[0];
}

async function coinLoeschen(symbol) {
  const { rowCount } = await datenbankVerbindung.query(
    'DELETE FROM watchlist WHERE symbol = $1',
    [symbol]
  );
  return rowCount > 0; // true = war vorhanden und wurde gelöscht
}

// ===== Alarm-Funktionen =====

async function alleAlarmeHolen() {
  const { rows } = await datenbankVerbindung.query('SELECT * FROM alarme ORDER BY id DESC');
  return rows;
}

async function alarmNachIdSuchen(id) {
  const { rows } = await datenbankVerbindung.query(
    'SELECT * FROM alarme WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function alarmErstellen(symbol, zielpreis, richtung) {
  const { rows } = await datenbankVerbindung.query(
    'INSERT INTO alarme (symbol, zielpreis, richtung) VALUES ($1, $2, $3) RETURNING *',
    [symbol, zielpreis, richtung]
  );
  return rows[0];
}

async function alarmLoeschen(id) {
  const { rowCount } = await datenbankVerbindung.query(
    'DELETE FROM alarme WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

async function alarmAusloesen(id, zeitstempel) {
  await datenbankVerbindung.query(
    "UPDATE alarme SET status = 'triggered', ausgeloest_am = $1 WHERE id = $2",
    [zeitstempel, id]
  );
}

async function alarmZuruecksetzen(id) {
  await datenbankVerbindung.query(
    "UPDATE alarme SET status = 'active', ausgeloest_am = NULL WHERE id = $1",
    [id]
  );
}

// Nur aktive Alarme – die brauchen wir für den automatischen Preischeck
async function aktiveAlarmeHolen() {
  const { rows } = await datenbankVerbindung.query(
    "SELECT * FROM alarme WHERE status = 'active'"
  );
  return rows;
}

// Alles exportieren damit andere Dateien diese Funktionen nutzen können
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
  // Diese alten Namen brauchen wir noch für server.js-Kompatibilität
  getAllWatchlist: alleCoinsHolen,
  getActiveAlerts: aktiveAlarmeHolen,
  triggerAlert: alarmAusloesen,
  initDb: datenbankStarten,
};
