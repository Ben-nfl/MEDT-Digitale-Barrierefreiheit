// seed.js 

'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'db',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'coinfinder',
  user:     process.env.DB_USER     || 'coinfinder',
  password: process.env.DB_PASSWORD || 'coinfinder123',
});

// Diese Coins kommen in die Watchlist
const startCoins = [
  { symbol: 'bitcoin',     name: 'Bitcoin',  type: 'crypto' },
  { symbol: 'ethereum',    name: 'Ethereum', type: 'crypto' },
  { symbol: 'solana',      name: 'Solana',   type: 'crypto' },
  { symbol: 'binancecoin', name: 'BNB',      type: 'crypto' },
  { symbol: 'ripple',      name: 'XRP',      type: 'crypto' },
];

// Und diese Alarme werden angelegt
const startAlarme = [
  { symbol: 'bitcoin',  zielpreis: 100000, richtung: 'above' },
  { symbol: 'ethereum', zielpreis: 2000,   richtung: 'below' },
];

async function datenbefuellen() {
  const client = await pool.connect();

  try {
    // Zuerst prüfen ob Tabellen schon existieren, falls nicht anlegen
    await client.query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id          SERIAL PRIMARY KEY,
        symbol      VARCHAR(100) UNIQUE NOT NULL,
        name        VARCHAR(255) NOT NULL,
        type        VARCHAR(50)  NOT NULL DEFAULT 'crypto',
        erstellt_am TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS alarme (
        id            SERIAL PRIMARY KEY,
        symbol        VARCHAR(100) NOT NULL,
        zielpreis     NUMERIC(20,8) NOT NULL,
        richtung      VARCHAR(10) NOT NULL CHECK (richtung IN ('above','below')),
        status        VARCHAR(20) NOT NULL DEFAULT 'active',
        erstellt_am   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ausgeloest_am TIMESTAMPTZ
      );
    `);

    // Schauen ob schon Einträge vorhanden sind
    const { rows } = await client.query('SELECT COUNT(*) FROM watchlist');
    const anzahl   = parseInt(rows[0].count);

    if (anzahl > 0) {
      console.log('[SEED] Daten sind schon da, überspringe...');
      return;
    }

    console.log('[SEED] Schreibe Demo-Daten...');

    for (const coin of startCoins) {
      await client.query(
        'INSERT INTO watchlist (symbol, name, type) VALUES ($1, $2, $3) ON CONFLICT (symbol) DO NOTHING',
        [coin.symbol, coin.name, coin.type]
        // ON CONFLICT DO NOTHING = bei doppeltem Symbol einfach überspringen
      );
    }
    console.log(`[SEED] ${startCoins.length} Coins hinzugefügt`);

    for (const alarm of startAlarme) {
      await client.query(
        'INSERT INTO alarme (symbol, zielpreis, richtung) VALUES ($1, $2, $3)',
        [alarm.symbol, alarm.zielpreis, alarm.richtung]
      );
    }
    console.log(`[SEED] ${startAlarme.length} Alarme angelegt`);
    console.log('[SEED] ✅ Fertig!');

  } catch (fehler) {
    console.error('[SEED] Fehler:', fehler.message);
  } finally {
    client.release();
    await pool.end();
  }
}

datenbefuellen();
