# TRANCHE 4 — The Puzzle Loop, UI, and Game State

## Goal
Implement the core gameplay loop. Load a puzzle from the YAML file, display it in a UI modal when a specific interactive object is clicked, validate the answer, and handle lives/penalties.

## Read first
- `docs/ARCHITECTURE.md` (interfaces are binding)
- `docs/AESTHETIC-SPEC.md` (constraints are binding)
- `docs/WORKFLOW.md` (contract rules)

## 1. Game State & Puzzle Loading
- **`src/engine/state/GameState.js`**:
  - Ensure `lives`, `solvedPuzzles`, and `inventory` are fully reactive via the `EventBus`. 
  - Implement `decrementLives()`. If lives reach 0, emit `gameOver`.
  - Implement `resetLives()` for the retry mechanic.
- **`src/engine/puzzle-runtime/PuzzleLoader.js`**:
  - Implement `loadPuzzles()`: Use Vite's `?raw` import to load `src/campaigns/darkplace/puzzles/library-card-catalogue.yaml` and parse it using `js-yaml`. Return an object mapping puzzle IDs to their definitions.
- **`src/engine/puzzle-runtime/PuzzleRuntime.js`**:
  - Implement `init()`: Call `PuzzleLoader.loadPuzzles()`.
  - Implement `openPuzzle(puzzleId)`: Fetches the puzzle definition, emits `puzzleOpened` (which the UI will listen to).
  - Implement `submitAnswer(puzzleId, answer)`: Validates the answer against the YAML `validation` rules (exact match or regex).
    - If correct: `GameState.markSolved(puzzleId)`, emit `puzzleSolved`, close the modal.
    - If incorrect and `penalty: true`: `GameState.decrementLives()`, emit `puzzleFailed` (with the `failText`).
    - If incorrect and `penalty: false`: emit `puzzleFailed` (with the `failText`).

## 2. UI Overlays
- **`src/engine/ui/LivesOverlay.js`**:
  - Implement `render()` to create a fixed HTML `<div>` in the top right corner.
  - Listen to `livesChanged` and update the display (e.g., "LIVES: ♥♥♥").
- **`src/engine/ui/PuzzleModal.js`**:
  - Implement `open(puzzle)`: Create a centered HTML modal with the puzzle `title`, `prompt`, an `<input>` field, and a Submit button.
  - Listen for the Submit click (and Enter key) to call `PuzzleRuntime.submitAnswer()`.
  - Handle `puzzleFailed`: Display the `failText` below the input in red, allowing the user to try again (unless it triggers a game over).
- **`src/engine/ui/GameOverOverlay.js`**:
  - Listen for `gameOver`. Show a full-screen black overlay with red text "SYSTEM FAILURE" and a "RETRY" button.
  - On click, call `GameState.resetLives()`, hide the overlay, and reopen the current puzzle.

## 3. 3D Interactive Object (The Trigger)
- **`src/engine/interior/InteriorScene.js` & `PlayerController.js`**:
  - Add a single interactive mesh to the `entrance` room (e.g., a `BoxGeometry` styled as a terminal/desk). Make it visually distinct.
  - When the player clicks this specific mesh, trigger `PuzzleRuntime.openPuzzle('library-card-catalogue')`.

## 4. Testing & Verification
- Add a test in `test/GameState.test.js` to verify that `decrementLives()` emits `livesChanged`, and triggers `gameOver` at 0.
- OpenCode MUST run `npm run test` and `npm run lint` and append the verbatim output to `docs/CHANGESET.md`.

## Out of Scope
- No serverless reporting (Tranche 5).
- No `.glb` models or advanced shading (Tranche 6).