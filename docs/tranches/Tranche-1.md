# TRANCHE 1 — The Interactive Shell (Typewriter & Scene Manager)

## Goal
Establish the front-end flow. Instantiate the Three.js renderer, build the typewriter intro with skip functionality, implement the fade overlay for transitions, and wire the intro completion to a placeholder "map ready" state. No 3D map assets or actual gameplay yet.

## Read first
- `docs/ARCHITECTURE.md` (interfaces are binding)
- `docs/AESTHETIC-SPEC.md` (constraints are binding)
- `docs/WORKFLOW.md` (contract rules)

## 1. Narrative Content
- Update `src/campaigns/darkplace/narrative/intro.js` to export a string of text (approx. 3-4 sentences) that will serve as the typewriter intro. It should have an institutional, slightly ominous tone (e.g., "Welcome to the Darkplace Library. Please ensure your terminal is secure. The archives are waiting...").

## 2. Core Engine Updates
- **`src/engine/scenes/SceneManager.js`**:
  - Implement `init(canvasId)`: Instantiate a Three.js `WebGLRenderer` attached to the canvas. Set clear color to a dark grey/black.
  - Implement a basic `OrthographicCamera` (even though the map isn't built yet, set it up so the canvas renders a blank scene).
  - Handle window resize to update renderer and camera.
  - Implement `startRenderLoop()`: A `requestAnimationFrame` loop that renders the blank scene.
- **`src/engine/ui/FadeOverlay.js`**:
  - Implement HTML/CSS overlay (a fixed, black `<div>`).
  - Implement `fadeOut(ms)` and `fadeIn(ms)` using CSS transitions to toggle opacity.
- **`src/engine/ui/TypewriterIntro.js`**:
  - Implement `start(text, options)`: Create a `<div>` in `#ui-root` with monospace text. Type out the text character by character (default interval ~30ms). 
  - Implement `skip()`: Instantly complete the text and resolve the promise.
  - Bind click, Enter, and Space to trigger `skip()`.
  - When typing completes (or skips), emit `introCompleted` via the `EventBus` and clean up the HTML elements.

## 3. Main Orchestration
- **`src/main.js`**:
  - On `DOMContentLoaded`, initialize the `SceneManager` and `FadeOverlay`.
  - Start the `SceneManager` render loop.
  - Use the `TypewriterIntro` to type the text from `narrative/intro.js`.
  - Listen for `introCompleted`. When it fires:
    1. Trigger `FadeOverlay.fadeOut(500)`.
    2. Emit `sceneChanged` with payload `'map'`.
    3. Wait for the fade to complete, then log `"Map loading placeholder..."` to the console and set the DOM text to `"Map ready"` (as a placeholder for Tranche 2).
    4. Trigger `FadeOverlay.fadeIn(500)` to reveal the placeholder.

## 4. Testing & Verification
- Add a basic test in `test/TypewriterIntro.test.js` to verify that `start()` types text and `skip()` immediately resolves the promise.
- OpenCode MUST run `npm run test` and `npm run lint` and append the verbatim output to `docs/CHANGESET.md`.

## Out of Scope
- No actual 3D map rendering (no `.glb` loading, no MapData parsing).
- No player character.
- No puzzle logic or UI (the `PuzzleModal` remains a stub).