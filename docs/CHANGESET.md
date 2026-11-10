# CHANGESET — Tranche 1

## Files Created

### New files
- `test/TypewriterIntro.test.js` — tests for TypewriterIntro start/skip/introCompleted behaviour

## Files Modified

- `src/campaigns/darkplace/narrative/intro.js` — replaced stub with a 3-4 sentence institutional intro string (`export const intro`)
- `src/engine/scenes/SceneManager.js` — implemented `init(canvasId)` (Three.js WebGLRenderer + OrthographicCamera), window resize handling, `startRenderLoop()`/`stopRenderLoop()`
- `src/engine/ui/FadeOverlay.js` — implemented fixed black HTML overlay with `fadeOut(ms)`/`fadeIn(ms)` returning promises backed by CSS transitions and transitionend
- `src/engine/ui/TypewriterIntro.js` — implemented `start(text, options)` (character-by-character typing, default 30ms interval), `skip()`, click/Enter/Space bindings, `introCompleted` EventBus emission, DOM cleanup
- `src/main.js` — orchestrates SceneManager, FadeOverlay, and TypewriterIntro; on `introCompleted` runs fadeOut(500) → emit `sceneChanged('map')` → log "Map loading placeholder…" → set DOM text "Map ready" → fadeIn(500)
- `eslint.config.js` — added browser globals (`setTimeout`, `clearTimeout`, `requestAnimationFrame`, `cancelAnimationFrame`, `console`)

## Assumptions
- `EventBus` remains the single non-throwing module (implemented for real in Tranche 0) so the EventBus test passes; all other Tranche 0 stubs still throw `not implemented`.
- `SceneManager` imports and uses Three.js in Tranche 1 (per spec requirement to instantiate the renderer), superseding the Tranche 0 "do not import three" rule for stubs.
- `fadeOut(ms)` makes the overlay opaque (scene fades out); `fadeIn(ms)` makes it transparent (scene fades in). This matches the Tranche 1 main.js sequence: fadeOut to cover, set content, fadeIn to reveal.
- TypewriterIntro removes its DOM element on completion (per spec: "clean up the HTML elements"); tests account for this by asserting element absence after skip/natural completion.
- A transitionend timeout fallback (`ms + 50`) is used in FadeOverlay so the promise always resolves even if the browser does not fire transitionend (e.g. when opacity already equals target).

## Deviations from ARCHITECTURE.md
- None. No `.glb` loading, no MapData parsing, no player character, no puzzle logic — all out-of-scope items are honoured. Three.js renderer is used only for a blank orthographic scene, not for map rendering.

## Questions / Uncertainties
- None.

## Testing Notes

### Desktop
`npm run test` — verbatim output:
```
> darklib@0.0.1 test
> vitest run

 RUN  v2.1.9 /home/ghaigh/github/DarkLib

 ✓ test/EventBus.test.js (3 tests) 3ms
 ✓ test/TypewriterIntro.test.js (4 tests) 31ms

 Test Files  2 passed (2)
      Tests  7 passed (7)
   Start at 15:30:34
   Duration 550ms (transform 31ms, setup 0ms, collect 32ms, tests 35ms, environment 451ms, prepare 166ms)
```
Result: PASS — all 7 tests pass (3 EventBus + 4 TypewriterIntro).

`npm run lint` — verbatim output:
```
> darklib@0.0.1 lint
> eslint .

(zero errors)
```
Result: PASS — zero lint errors.

`npm run dev` — Vite server starts successfully on http://localhost:5173/ (long-running process, booted without errors).

### Mobile
Not tested in Tranche 1 (no device-specific code implemented).

### Event reporting
Not in scope for Tranche 1 (`RemoteReporter` remains a stub from Tranche 0).
