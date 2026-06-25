require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Create a .env file with DATABASE_URL=postgresql://localhost:5432/ironlog"
  );
}

// AWS RDS requires TLS. Enable SSL automatically when connecting to an RDS
// endpoint, or explicitly via DATABASE_SSL=true. Local/dev Postgres stays
// plaintext. (rejectUnauthorized:false trusts the RDS-managed certificate
// without bundling the AWS CA — fine for free-tier dev; tighten for prod.)
const connectionString = process.env.DATABASE_URL || "";
const useSSL =
  process.env.DATABASE_SSL === "true" ||
  /\.rds\.amazonaws\.com/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
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
