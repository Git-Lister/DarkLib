# CHANGESET — Tranche 0

## Files Created

### Toolchain & Configuration
- `package.json` — scripts `dev`, `build`, `preview`, `test`, `test:watch`, `lint`, `lint:fix`, `format`; deps `three`, `js-yaml`; devDeps `vite`, `vitest`, `jsdom`, `eslint`, `prettier`, `@types/three`; `"type": "module"`
- `.nvmrc` — `lts/*`
- `.gitignore` — standard Node ignores
- `.prettierrc` — semi: true, singleQuote: true, printWidth: 100, trailingComma: 'es5'
- `eslint.config.js` — flat config, ES2022, browser env, recommended rules
- `vite.config.js` — root '.', server.host true, server.port 5173, build.outDir dist
- `vitest.config.js` — environment 'jsdom', globals true

### HTML / README
- `index.html` — `<canvas id="game-canvas">`, `<div id="ui-root">`, black background, monospace font, centered "DarkLib — booting…"
- `README.md` — project overview and script list

### Folder Structure (+ `.gitkeep` in empty asset dirs)
- `public/assets/blender/`, `public/assets/textures/`, `public/assets/audio/`
- `src/engine/state/GameState.js`
- `src/engine/events/EventBus.js`
- `src/engine/scenes/SceneManager.js`
- `src/engine/map/MapScene.js`, `src/engine/map/MapData.js`, `src/engine/map/MapAssets.js`
- `src/engine/interior/InteriorScene.js`, `src/engine/interior/RoomData.js`, `src/engine/interior/InteriorAssets.js`
- `src/engine/player/PlayerController.js`
- `src/engine/puzzle-runtime/PuzzleRuntime.js`, `src/engine/puzzle-runtime/PuzzleLoader.js`
- `src/engine/ui/TypewriterIntro.js`, `src/engine/ui/LivesOverlay.js`, `src/engine/ui/PuzzleModal.js`, `src/engine/ui/GameOverOverlay.js`, `src/engine/ui/FadeOverlay.js`
- `src/campaigns/darkplace/config.js`
- `src/campaigns/darkplace/narrative/intro.js`
- `src/campaigns/darkplace/puzzles/library-card-catalogue.yaml`
- `src/reports/RemoteReporter.js`
- `src/main.js`
- `test/EventBus.test.js`

## Assumptions
- `EventBus` is implemented for real (not a throwing stub). Tranche 0 specifies both that all stub method bodies must throw `not implemented` and that `npm run test` must confirm the EventBus test passes. The test verifies real `on`/`off`/`emit` behaviour, so `EventBus` is the single exception to the throwing-stub rule; every other module throws `new Error('<Module>.<method> not implemented')`.
- `three` is not imported anywhere in the stubs (including Map/Interior/Player), respecting "must not call it" and keeping lint clean.
- All stubs export their class/object and carry JSDoc declaring inputs, outputs, and events.
- Vitest `globals: true` is used, so `vi`/`describe`/`it`/`expect` are treated as globals in test files for eslint.

## Deviations from ARCHITECTURE.md
- None. No Three.js renderer, camera, or scene loop; no `.glb`/texture/audio loading; no PlayerController picking; no puzzle validation or serverless/dashboard code — all out-of-scope items are honoured.

## Questions / Uncertainties
- None.

## Testing Notes

### Desktop
`npm install` — verbatim output:
```
added 192 packages, and audited 193 packages in 8s
48 packages are looking for funding
  run `npm fund` for details
6 vulnerabilities (3 moderate, 1 high, 2 critical)
```

`npm run test` — verbatim output:
```
> darklib@0.0.1 test
> vitest run

 RUN  v2.1.9 /home/ghaigh/github/DarkLib

 ✓ test/EventBus.test.js (3 tests) 3ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at 14:25:35
   Duration 531ms (transform 27ms, setup 0ms, collect 13ms, tests 3ms, environment 218ms, prepare 96ms)
```
Result: PASS — all 3 EventBus tests pass.

`npm run lint` — verbatim output:
```
> darklib@0.0.1 lint
> eslint .

(zero errors)
```
Result: PASS — zero lint errors.

### Mobile
Not tested in Tranche 0 (no device-specific code implemented).

### Event reporting
Stub only (`RemoteReporter.postEvent` throws `not implemented`); no serverless endpoint configured in Tranche 0.
