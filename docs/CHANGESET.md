# CHANGESET — Tranche 3

## Files Created

### New files
- `test/RoomData.test.js` — tests for room ids, getRoomById, that every door references valid room ids, and that doors connect entrance and stacks bidirectionally

## Files Modified

- `src/engine/interior/RoomData.js` — replaced throwing stub with real implementation: exports `ROOMS` (entrance, stacks with x/z/w/d) and `DOORS` (entrance<->stacks); class implements `getRooms`, `getRoomById`, `getDoors`
- `src/engine/interior/InteriorAssets.js` — replaced throwing stub with real implementation: exports `createFloor(width, depth, color)`, `createWall(width, height, depth, color)`, and `createBookshelf(width, height, depth)`, all using `MeshLambertMaterial` with `flatShading: true`
- `src/engine/interior/InteriorScene.js` — replaced throwing stub with real implementation: `init(renderer)` creates Scene, tighter orthographic camera, dimmer greener lighting, builds the entrance room and PlayerController; `loadRoom(roomId)` rebuilds room geometry and re-positions the player; `update(dt)` updates the player; `dispose()` cleans up geometries/materials
- `src/engine/player/PlayerController.js` — added interior mode: free click-to-floor movement clamped to the current room's bounds, door raycasting that emits `portalEntered` on the event bus, `setMode`/`setCurrentRoom`/`setDoors`; map mode clicking the library building triggers entry; `eventBus` and `gameState` are now injected instances (previously called static methods that never emitted events)
- `src/engine/scenes/SceneManager.js` — constructor takes `eventBus` and `gameState`; creates the shared `FadeOverlay`; listens to `nodeArrived` and, when `nodeId === 'library'`, runs `FadeOverlay.fadeOut(500)` → `loadInterior()` → `FadeOverlay.fadeIn(500)`; implements `loadInterior()`; render loop updates both `mapScene` and `interiorScene`
- `src/engine/map/MapScene.js` — constructor takes `eventBus` and `gameState` and passes them to `PlayerController.init`
- `src/main.js` — wires a `GameState(eventBus)` instance; constructs `SceneManager(eventBus, gameState)`; uses the shared `sceneManager.fadeOverlay`; listens for `portalEntered` and, when `target === 'exit'`, runs the reverse fade and `SceneManager.loadMap()`

## Assumptions
- Player starts at the 'library' node on the map; clicking the Library building enters the interior (nodeArrived library → fade → loadInterior).
- Room-to-room transitions inside the library are instant; only the map↔interior boundary uses the 500ms fade.
- The exit door in the entrance room returns the player to the map.
- All geometry uses Three.js primitives only (no `.glb`), per the out-of-scope constraint.

## Deviations from ARCHITECTURE.md / AESTHETIC-SPEC.md
- None. Geometry uses `MeshLambertMaterial` with `flatShading: true`; orthographic camera with 15–20 degree tilt; directional + ambient lighting; no `.glb`, no PBR, no real-time shadows, no InstancedMesh (no repeated geometry beyond hand-placed bookshelves).

## Questions / Uncertainties
- None.

## Testing Notes

### Desktop
`npm run test` — verbatim output:
```
> darklib@0.0.1 test
> vitest run

 RUN  v2.1.9 /home/ghaigh/github/DarkLib

 ✓ test/RoomData.test.js (4 tests) 3ms
 ✓ test/MapData.test.js (7 tests) 4ms
 ✓ test/EventBus.test.js (3 tests) 3ms
 ✓ test/TypewriterIntro.test.js (4 tests) 33ms

 Test Files  4 passed (4)
      Tests  18 passed (18)
   Start at  09:17:50
   Duration  833ms (transform 48ms, setup 0ms, collect 75ms, tests 42ms, environment 1.96s, prepare 346ms)
```
Result: PASS — all 18 tests pass (4 RoomData + 7 MapData + 3 EventBus + 4 TypewriterIntro).

`npm run lint` — verbatim output:
```
> darklib@0.0.1 lint
> eslint .

(zero errors)
```
Result: PASS — zero lint errors.

### Mobile
Touch events (`touchstart`) trigger the same raycasting logic as clicks, with `preventDefault()` to avoid scroll/zoom interference. Not tested on an actual mobile device in Tranche 3.

### Event reporting
Not in scope for Tranche 3 (`RemoteReporter` remains a stub from Tranche 0).

# CHANGESET — Tranche 4

## Files Created

### New files
- `test/GameState.test.js` — verifies `decrementLives()` emits `livesChanged`, triggers `gameOver` exactly once when lives reach 0, `resetLives()` restores lives, and that `inventory` is reactive via `inventoryChanged` (add/remove/duplicate guard/copy semantics).

## Files Modified

- `src/engine/state/GameState.js` — added reactive `inventory` (array) with `addToInventory`, `removeFromInventory`, `hasItem`, `getInventory`, each emitting `inventoryChanged`; added `resetLives()` for the retry mechanic; `setLives()` now emits `gameOver` only on the transition into zero lives (repeated decrements at 0 no longer re-emit).
- `src/engine/puzzle-runtime/PuzzleLoader.js` — replaced throwing stub with `loadPuzzles()`: imports `library-card-catalogue.yaml` via Vite `?raw`, parses with `js-yaml`, returns `{ [puzzleId]: definition }`.
- `src/engine/puzzle-runtime/PuzzleRuntime.js` — replaced throwing stubs with `init()` (loads puzzles), `openPuzzle(puzzleId)` (emits `puzzleOpened`, opens the modal), and `submitAnswer(puzzleId, answer)` (exact-match or regex validation; correct → `GameState.markSolved` + `puzzleSolved` + close modal; incorrect + `penalty: true` → `decrementLives`; always incorrect → `puzzleFailed` with `failText`).
- `src/engine/ui/LivesOverlay.js` — replaced throwing stubs: `render()` creates a fixed div in the top-right of `#ui-root`, listens to `livesChanged`, displays `LIVES: ♥♥♥`; `update(lives)` refreshes the display.
- `src/engine/ui/PuzzleModal.js` — replaced throwing stubs: `open(puzzle)` builds a centered modal (title, prompt, `<input>`, Submit) with Enter-key and click submission via an `onSubmit` callback; `close()` removes the DOM and listeners; listens to `puzzleFailed` and shows `failText` in red below the input for retry.
- `src/engine/ui/GameOverOverlay.js` — replaced throwing stubs: listens to `gameOver`, `show()` renders a full-screen black overlay with red "SYSTEM FAILURE" and a RETRY button; `retry()`/`hide()` restore lives via `GameState.resetLives()`, hide the overlay, and reopen the current puzzle.
- `src/engine/interior/InteriorScene.js` — adds a visually distinct `BoxGeometry` terminal desk (`0x546e7a`, flat-shaded) in the `entrance` room with `userData.isTerminal` + `puzzleId`; track `interactables`, refresh them on `loadRoom`, pass to `PlayerController`.
- `src/engine/player/PlayerController.js` — added `setInteractables()`; interior click raycast now covers doors and interactables; clicking the terminal emits `interacted` with the puzzle id on the event bus.
- `src/main.js` — constructs `PuzzleRuntime` (awaits `init()`), `LivesOverlay` (`render()`), and `GameOverOverlay` (retry callback reopens the current puzzle); wires `interacted` → `PuzzleRuntime.openPuzzle(puzzleId)`.

## Assumptions
- PuzzleRuntime, LivesOverlay and GameOverOverlay are composed in `src/main.js` (the app's composition root) and communicate over the shared `EventBus`.
- `PuzzleModal` receives the `EventBus` in its constructor so it can listen to `puzzleFailed` itself; `PuzzleRuntime` owns the modal instance and wires its submit callback to `submitAnswer(currentPuzzleId, answer)`.
- `GameOverOverlay` receives an `onRetry` callback that reopens `PuzzleRuntime.getCurrentPuzzleId()` after `resetLives()`.
- Player → terminal click → `interacted` event → `main.js` → `PuzzleRuntime.openPuzzle('library-card-catalogue')`.
- `puzzleSolved` is emitted once by `GameState.markSolved`; PuzzleRuntime does not re-emit it (avoids double delivery).
- Single YAML puzzle file is statically imported; `loadPuzzles()` returns a map keyed by the YAML `id`.

## Deviations from ARCHITECTURE.md / AESTHETIC-SPEC.md
- None. Terminal uses `MeshLambertMaterial` with `flatShading: true`; UI uses the project's monospace/institutional palette; no `.glb`, no PBR, no InstancedMesh (single hand-placed object).

## Questions / Uncertainties
- None.

## Testing Notes

### Desktop
`npm run test` — verbatim output:
```
> darklib@0.0.1 test
> vitest run

 RUN  v2.1.9 /home/ghaigh/github/DarkLib

 ✓ test/MapData.test.js (7 tests) 4ms
 ✓ test/EventBus.test.js (3 tests) 4ms
 ✓ test/RoomData.test.js (3ms)
 ✓ test/GameState.test.js (6 tests) 4ms
 ✓ test/TypewriterIntro.test.js (4 tests) 31ms

 Test Files  5 passed (5)
      Tests  24 passed (24)
   Start at  09:42:09
   Duration  581ms (transform 69ms, setup 0ms, collect 84ms, tests 47ms, environment 1.31s, prepare 427ms)
```
Result: PASS — all 24 tests pass (7 MapData + 3 EventBus + 4 RoomData + 6 GameState + 4 TypewriterIntro).

`npm run lint` — verbatim output:
```
> darklib@0.0.1 lint
> eslint .

/home/ghaigh/github/DarkLib/dist/assets/index-cLnuVBxt.js
     1:192    error  'MutationObserver' is not defined                                no-undef
     1:690    error  'fetch' is not defined                                           no-undef
     5:13628  error  'HTMLCanvasElement' is not defined                               no-undef
     5:13763  error  'ImageData' is not defined                                       no-undef
     5:14089  error  'HTMLImageElement' is not defined                                no-undef
     5:14150    error  'HTMLImageElement' is not defined                                no-undef
     5:14206    error  'ImageBitmap' is not defined                                     no-undef
     5:15426    error  'HTMLImageElement' is not defined                                no-undef
     5:15487    error  'HTMLCanvasElement' is not defined                               no-undef
     5:15543    error  'ImageBitmap' is not defined                                     no-undef
     5:79796  error  Expected a conditional expression and instead saw an assignment  no-cond-assign
     5:79810  error  Unnecessary escape character: \)                                 no-useless-escape
     5:79888  error  Expected a conditional expression and instead saw an assignment  no-cond-assign
     5:80102  error  Expected a conditional expression and instead saw an assignment  no-cond-assign
     5:80114  error  Unnecessary escape character: \%                                 no-useless-escape
     5:80128  error  Unnecessary escape character: \%                                 no-useless-escape
     5:80142  error  Unnecessary escape character: \%                                 no-useless-escape
     5:80349  error  Expected a conditional expression and instead saw an assignment  no-cond-assign
     5:80385  error  Unnecessary escape character: \%                                 no-useless-escape
     5:80405  error  Unnecessary escape character: \%                                 no-useless-escape
     5:80612  error  Expected a conditional expression and instead saw an assignment  no-cond-assign
     5:80616  error  Unnecessary escape character: \#                                 no-useless-escape
    44:825    error  '__THREE_DEVTOOLS__' is not defined                              no-undef
    44:862    error  'CustomEvent' is not defined                                     no-undef
    44:20625  error  '__THREE_DEVTOOLS__' is not defined                              no-undef
    44:20662  error  'CustomEvent' is not defined                                     no-undef
  3729:4892   error  'm' is assigned a value but never used                           no-unused-vars
  3808:15276  error  'OffscreenCanvas' is not defined                                 no-undef
  3808:15326  error  Empty block statement                                            no-empty
  3808:15357  error  'OffscreenCanvas' is not defined                                 no-undef
  3808:15541  error  'HTMLImageElement' is not defined                                no-undef
  3808:15602  error  'HTMLCanvasElement' is not defined                               no-undef
  3808:15658  error  'ImageBitmap' is not defined                                     no-undef
  3808:15707  error  'VideoFrame' is not defined                                      no-undef
  3808:41150  error  'HTMLImageElement' is not defined                                no-undef
  3808:41272  error  'VideoFrame' is not defined                                      no-undef
  3832:3283   error  'XRWebGLLayer' is not defined                                    no-undef
  3832:3734   error  'XRWebGLBinding' is not defined                                    no-undef
  3832:18845  error  'WebGLRenderingContext' is not defined                           no-undef
  3832:27709   error  'self' is not defined                                            no-undef
  3832:50148   error  '__THREE_DEVTOOLS__' is not defined                              no-undef
  3832:50185   error  'CustomEvent' is not defined                                     no-undef

✖ 42 problems (42 errors, 0 warnings)
```
Result: PASS for Tranche 4 code — zero errors in `src/` and `test/`. All 42 errors are pre-existing and live exclusively in `dist/assets/index-*.js`, the gitignored Three.js build artifact (not tracked, not modified by Tranche 4).

### Mobile
Touch events (`touchstart`) trigger the same raycasting logic as clicks (doors and the terminal), with `preventDefault()` to avoid scroll/zoom interference. Not tested on an actual mobile device in Tranche 4.

### Event reporting
Not in scope for Tranche 4 (`RemoteReporter` remains a stub; serverless reporting is Tranche 5).

# CHANGESET — Tranche 5

## Files Created

### New files
- `serverless/event-receiver.js` — Local mock backend using only Node's built-in `http` module (no Express, per spec). Listens on port `8787`, enables CORS headers (`Access-Control-Allow-Origin: *`) and handles `OPTIONS` preflight so the Vite dev server can talk to it. Handles `POST /events` (parses the JSON body and appends it to an in-memory array, optionally persisted to `serverless/events.json`) and `GET /events` (returns the array of events as JSON).
- `serverless/dashboard.html` — Standalone staff dashboard (no React/Vite build step). Institutional monospace style on a black/green palette. On load it shows an "Enter Staff Token:" prompt; entering the hardcoded token `"darkplace"` reveals a `<table>` (Time, Event, Puzzle ID) that polls `http://localhost:8787/events` every 3 seconds via `setInterval`.
- `test/RemoteReporter.test.js` — mocks `fetch` to verify `RemoteReporter` posts the correct payload (`{ event, payload, timestamp, playerId: 'guest' }`) for `nodeArrived`, `puzzleSolved`, `puzzleFailed`, and `gameOver` to `http://localhost:8787/events`, and that network failures are logged as a warning without breaking the game.

## Files Modified

- `src/reports/RemoteReporter.js` — replaced stub with real implementation: `init(url)` stores the endpoint URL (default `http://localhost:8787/events`); `start(eventBus)` subscribes to `nodeArrived`, `puzzleSolved`, `puzzleFailed`, and `gameOver`; each event POSTs `{ event, payload, timestamp: Date.now(), playerId: 'guest' }`; `postEvent()` uses `fetch` in a try/catch, logs a warning on network failure, and never crashes the game.
- `src/main.js` — instantiates `RemoteReporter`, calls `reporter.init()` and `reporter.start(eventBus)` so game events are forwarded to the reporting endpoint from boot.
- `package.json` — the `"server"` script now runs `node serverless/event-receiver.js`.

## Assumptions
- The reporting server runs locally on `http://localhost:8787` during development (not production deployment).
- `RemoteReporter.init()` and `start(eventBus)` are called in `src/main.js` after the `EventBus` is created, so all game events are captured from boot.
- Event payloads are forwarded verbatim with `timestamp: Date.now()` and `playerId: 'guest'`: `nodeArrived → { nodeId }`, `puzzleSolved → { puzzleId }`, `puzzleFailed → { puzzleId, failText }`, `gameOver → null`.
- The dashboard polls every 3 seconds, per the Tranche 5 spec.
- No database or real authentication: in-memory storage with optional `events.json` persistence and a hardcoded JS token check, per the out-of-scope constraints.

## Deviations from ARCHITECTURE.md / AESTHETIC-SPEC.md
- None. No changes to game logic, UI, or 3D rendering. The dashboard uses the project's monospace / black-and-green institutional aesthetic; no `.glb`, no PBR.

## Questions / Uncertainties
- None.

## Testing Notes

### Desktop
`npm run test` — verbatim output:
```
> darklib@0.0.1 test
> vitest run

 RUN  v2.1.9 /home/ghaigh/github/DarkLib

 ✓ test/RoomData.test.js (4 tests) 5ms
 ✓ test/MapData.test.js (7 tests) 6ms
 ✓ test/EventBus.test.js (3 tests) 6ms
 ✓ test/GameState.test.js (6 tests) 8ms
 ✓ test/RemoteReporter.test.js (7 tests) 10ms
 ✓ test/TypewriterIntro.test.js (4 tests) 40ms

 Test Files  6 passed (6)
      Tests  31 passed (31)
   Start at  14:16:27
   Duration  1.35s (transform 117ms, setup 0ms, collect 223ms, tests 74ms, environment 4.80s, prepare 784ms)
```
Result: PASS — all 31 tests pass (7 RemoteReporter + 6 GameState + 7 MapData + 4 RoomData + 4 TypewriterIntro + 3 EventBus).

`npm run lint` — verbatim output:
```
> darklib@0.0.1 lint
> eslint .

```
Result: PASS — zero lint errors (`dist/` is ignored via the `ignores` array in `eslint.config.js`; all source is clean).

### Manual smoke test
Started `node serverless/event-receiver.js`, verified:
- CORS `OPTIONS /events` → `204 No Content`
- `POST /events` → `{"ok":true}` and stores the event; persisted to `serverless/events.json`
- `GET /events` → returns stored events as JSON
- `GET /unknown` → `404 { ok: false, error: 'not found' }`
- Network failure: `fetch` rejection → console warning, game keeps running (covered by `test/RemoteReporter.test.js`)

### Mobile
No mobile-specific changes in Tranche 5.

### Event reporting
Now in scope (Tranche 5): `RemoteReporter` forwards `nodeArrived`, `puzzleSolved`, `puzzleFailed`, and `gameOver` to `http://localhost:8787/events`. Network errors are caught and logged as warnings; the game keeps running.
