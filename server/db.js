require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Create a .env file with DATABASE_URL=postgresql://localhost:5432/ironlog"
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sets (
      id SERIAL PRIMARY KEY,
      tab VARCHAR(10),
      exercise VARCHAR(100),
      weight NUMERIC,
      reps INTEGER,
      logged_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS runs (
      id SERIAL PRIMARY KEY,
      distance NUMERIC,
      duration INTEGER,
      logged_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initSchema };
