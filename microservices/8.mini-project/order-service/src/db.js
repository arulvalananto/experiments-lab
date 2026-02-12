const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initDB() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      user_id VARCHAR(255),
      amount NUMERIC,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS outbox (
      id UUID PRIMARY KEY,
      event_type VARCHAR(255),
      payload JSONB,
      processed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

    console.log('DB Initialized');
}

module.exports = { pool, initDB };
