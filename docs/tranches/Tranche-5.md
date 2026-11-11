# TRANCHE 5 — Remote Reporting & Admin Dashboard

## Goal
Implement the live event reporting system. Create a lightweight Node/Express server with SQLite to receive events, build the `RemoteReporter` client to send them, and create a static HTML staff dashboard to view them.

## Read first
- `docs/ARCHITECTURE.md` (interfaces are binding)
- `docs/AESTHETIC-SPEC.md` (constraints are binding)
- `docs/WORKFLOW.md` (contract rules)

## 0. Housekeeping (Linting)
- Update `eslint.config.js` to ignore the `dist` directory (and any other build artifacts) so `npm run lint` only checks source code.

## 1. Serverless / Backend (Local Development)
- **`server/index.js`**:
  - Create an Express server (add `express` and `cors` to dependencies).
  - Use `better-sqlite3` (add as dependency) to initialize a simple SQLite database in `server/db.sqlite`.
  - Create a table `events (id INTEGER PRIMARY KEY, event TEXT, payload TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`.
  - `POST /events`: Receives `{ event, payload }`, writes it to the database.
  - `GET /events`: Returns all events (for polling).
- **`package.json`**:
  - Add a script `"server": "node server/index.js"`.

## 2. Client-Side Reporter
- **`src/reports/RemoteReporter.js`**:
  - Implement `init(eventBus)`: Subscribe to `nodeArrived`, `puzzleSolved`, `puzzleFailed`, `gameOver`.
  - On event, POST to `http://localhost:3000/events`.
  - Handle network errors gracefully (log to console, do not break the game).
- **`src/main.js`**: Initialize `RemoteReporter`.

## 3. Staff Dashboard
- **`server/dashboard.html`**:
  - A static HTML page served by Express at `GET /dashboard`.
  - Use vanilla JS to poll `GET /events` every 5 seconds.
  - Render a simple table of the events: `[Timestamp] Event Name | Payload`.
  - Style it with basic CSS (monospace font, black background, green text).

## 4. Testing & Verification
- Add a test in `test/RemoteReporter.test.js` mocking `fetch` to verify the correct payload is sent.
- OpenCode MUST run `npm run test` and `npm run lint` and append the verbatim output to `docs/CHANGESET.md`.

## Out of Scope
- No production deployment (Cloudflare/Turso) yet. Local Node/Express is sufficient for now.
- No changes to the game logic or UI.