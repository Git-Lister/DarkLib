import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

/**
 * Local mock backend for DarkLib remote reporting.
 *
 * Uses only Node's built-in `http` module (no Express). Listens on port 8787.
 * Stores events in memory and optionally persists them to `events.json` next
 * to this file so events survive a restart.
 */

const PORT = 8787;
const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_FILE = join(__dirname, 'events.json');

/** In-memory store of received events. */
let events = [];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

async function loadEvents() {
  try {
    const data = await readFile(EVENTS_FILE, 'utf8');
    events = JSON.parse(data);
    console.log(`Loaded ${events.length} events from ${EVENTS_FILE}`);
  } catch {
    events = [];
  }
}

async function saveEvents() {
  try {
    await writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('event-receiver: failed to persist events', error);
  }
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...corsHeaders
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const { url } = req;
  const method = req.method;

  // CORS preflight so the Vite dev server can talk to this backend.
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (url === '/events' && method === 'GET') {
    sendJson(res, 200, events);
    return;
  }

  if (url === '/events' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const event = JSON.parse(body || '{}');
        events.push(event);
        void saveEvents();
        sendJson(res, 200, { ok: true });
      } catch {
        sendJson(res, 400, { ok: false, error: 'invalid JSON body' });
      }
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'not found' });
});

loadEvents().then(() => {
  server.listen(PORT, () => {
    console.log(`Event receiver listening on http://localhost:${PORT}`);
  });
});
