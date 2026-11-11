# TRANCHE 5 — Remote Reporting & Staff Dashboard

## Goal
Implement the `RemoteReporter` to send puzzle events to a backend. Build a local mock backend server (Node.js) to receive and store these events, and a standalone HTML staff dashboard to view them live.

## Read first
- `docs/ARCHITECTURE.md` (interfaces are binding)
- `docs/AESTHETIC-SPEC.md` (constraints are binding)
- `docs/WORKFLOW.md` (contract rules)

## 1. Game Client Reporting
- **`src/reports/RemoteReporter.js`**:
  - Implement `init(url)`: Store the endpoint URL (default to `http://localhost:8787/events`).
  - Implement `start()`: Subscribe to the `EventBus` for `nodeArrived`, `puzzleSolved`, `puzzleFailed`, and `gameOver`.
  - When an event fires, `POST` a JSON payload to the endpoint: `{ event: 'puzzleSolved', payload: { puzzleId }, timestamp: Date.now(), playerId: 'guest' }`. 
  - Use `fetch` with a try/catch block. If the server is down, log a warning to the console but **do not crash the game**.
- **`src/main.js`**: Instantiate and `start()` the `RemoteReporter`.

## 2. Local Backend Server (Mock Cloud)
- Create a new folder `/serverless`.
- Create `/serverless/event-receiver.js`:
  - Use Node's built-in `http` module (do not add Express as a dependency). Listen on port `8787`.
  - Enable CORS headers (`Access-Control-Allow-Origin: *`, handle `OPTIONS` requests) so the Vite dev server can talk to it.
  - Handle `POST /events`: Parse the JSON body, append it to an array in memory (and optionally write to a `events.json` file for persistence).
  - Handle `GET /events`: Return the array of events as JSON.
- Add a script to `package.json`: `"server": "node serverless/event-receiver.js"`.

## 3. Staff Dashboard
- Create `/serverless/dashboard.html`.
- A simple, standalone HTML page (no React/Vite build step needed) with an institutional monospace style.
- On load, use `setInterval` to fetch `http://localhost:8787/events` every 3 seconds.
- Render the events in a simple HTML `<table>` (Time, Event, Puzzle ID).
- Add a simple prompt at the top: "Enter Staff Token:" (just a hardcoded check for `"darkplace"` in JS to hide the table until entered, simulating basic auth).

## 4. Testing & Verification
- Add a test in `test/RemoteReporter.test.js` mocking `fetch` to ensure it handles network failures gracefully.
- OpenCode MUST run `npm run test` and `npm run lint` (ensure `dist/` is ignored) and update `docs/CHANGESET.md`.

## Out of Scope
- No actual database (Turso/Supabase) yet; in-memory/file storage in the mock server is sufficient.
- No real authentication (hardcoded JS check is fine for the mock).