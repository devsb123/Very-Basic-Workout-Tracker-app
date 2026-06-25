require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { pool, initSchema } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const VALID_TABS = ["push", "pull", "legs"];

// --- Sets ---------------------------------------------------------------

// Log a set
app.post("/api/sets", async (req, res) => {
  const { tab, exercise, weight, reps } = req.body;
  if (!VALID_TABS.includes(tab)) {
    return res.status(400).json({ error: "Invalid tab" });
  }
  if (!exercise || typeof exercise !== "string") {
    return res.status(400).json({ error: "Exercise is required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO sets (tab, exercise, weight, reps)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tab, exercise.trim(), weight, reps]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/sets failed:", err);
    res.status(500).json({ error: "Failed to log set" });
  }
});

// Get all sets for a tab
app.get("/api/sets", async (req, res) => {
  const { tab } = req.query;
  if (!VALID_TABS.includes(tab)) {
    return res.status(400).json({ error: "Invalid or missing tab" });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM sets WHERE tab = $1 ORDER BY logged_at DESC`,
      [tab]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/sets failed:", err);
    res.status(500).json({ error: "Failed to fetch sets" });
  }
});

// Delete a set
app.delete("/api/sets/:id", async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM sets WHERE id = $1`, [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Set not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/sets/:id failed:", err);
    res.status(500).json({ error: "Failed to delete set" });
  }
});

// --- Runs ---------------------------------------------------------------

// Log a run
app.post("/api/runs", async (req, res) => {
  const { distance, duration } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO runs (distance, duration)
       VALUES ($1, $2)
       RETURNING *`,
      [distance, duration]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/runs failed:", err);
    res.status(500).json({ error: "Failed to log run" });
  }
});

// Get all runs
app.get("/api/runs", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM runs ORDER BY logged_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/runs failed:", err);
    res.status(500).json({ error: "Failed to fetch runs" });
  }
});

// Delete a run
app.delete("/api/runs/:id", async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM runs WHERE id = $1`, [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Run not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/runs/:id failed:", err);
    res.status(500).json({ error: "Failed to delete run" });
  }
});

// --- Static (production) ------------------------------------------------

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// --- Start --------------------------------------------------------------

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

initSchema()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`IronLog server running on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database schema:", err);
    process.exit(1);
  });
