import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, 'db.sqlite'));
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    event TEXT,
    payload TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/** POST /events — receive a game event and store it. */
app.post('/events', (req, res) => {
  const { event, payload } = req.body;
  if (!event) {
    return res.status(400).json({ error: 'event is required' });
  }
  db.prepare('INSERT INTO events (event, payload) VALUES (?, ?)').run(
    event,
    JSON.stringify(payload)
  );
  res.status(201).json({ ok: true });
});

/** GET /events — return all stored events (for dashboard polling). */
app.get('/events', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM events ORDER BY timestamp DESC')
    .all();
  res.json(rows);
});

/** GET /dashboard — serve the staff dashboard. */
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`DarkLib server listening on http://localhost:${PORT}`);
});
