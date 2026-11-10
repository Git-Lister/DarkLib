# TRANCHE 0 — Repo Scaffold and Contract Stubs

## Goal
Create a fully installed, linted, tested, and runnable scaffold. No feature implementation. Only interface stubs that match `docs/ARCHITECTURE.md`. Establish the exact folder structure so Tranche 1 can begin without refactoring.

## 1. Toolchain and Configuration
- `package.json`: 
  - Scripts: `dev` (vite), `build` (vite build), `preview` (vite preview --host), `test` (vitest run), `test:watch` (vitest), `lint` (eslint .), `lint:fix` (eslint . --fix), `format` (prettier --write .).
  - Dependencies: `three`, `js-yaml`.
  - DevDependencies: `vite`, `vitest`, `jsdom`, `eslint`, `prettier`, `@types/three`.
- `.nvmrc`: contain `lts/*`
- `.gitignore`: standard Node (node_modules, dist, .vite, *.log, .DS_Store, .env)
- `.prettierrc`: semi: true, singleQuote: true, printWidth: 100, trailingComma: 'es5'
- `eslint.config.js`: Flat config, ES2022, browser env, recommended rules.
- `vite.config.js`: root '.', server.host true, server.port 5173, build.outDir dist
- `vitest.config.js`: environment 'jsdom', globals true

## 2. Folder Structure
Create the following exact structure. Add `.gitkeep` to empty asset directories.

```text
/
├── .gitignore
├── .nvmrc
├── .prettierrc
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── README.md
├── docs/
├── public/
│   └── assets/
│       ├── blender/ (.gitkeep)
│       ├── textures/ (.gitkeep)
│       └── audio/ (.gitkeep)
└── src/
    ├── main.js
    ├── engine/
    │   ├── state/GameState.js
    │   ├── events/EventBus.js
    │   ├── scenes/SceneManager.js
    │   ├── map/MapScene.js
    │   ├── map/MapData.js
    │   ├── map/MapAssets.js
    │   ├── interior/InteriorScene.js
    │   ├── interior/RoomData.js
    │   ├── interior/InteriorAssets.js
    │   ├── player/PlayerController.js
    │   ├── puzzle-runtime/PuzzleRuntime.js
    │   ├── puzzle-runtime/PuzzleLoader.js
    │   └── ui/
    │       ├── TypewriterIntro.js
    │       ├── LivesOverlay.js
    │       ├── PuzzleModal.js
    │       ├── GameOverOverlay.js
    │       └── FadeOverlay.js
    ├── campaigns/
    │   └── darkplace/
    │       ├── config.js
    │       ├── narrative/intro.js
    │       └── puzzles/library-card-catalogue.yaml
    └── reports/RemoteReporter.js
3. Content of Core Files
index.html: Minimal HTML page. Includes <canvas id="game-canvas"> and <div id="ui-root">. Black background, monospace font. Contains centered text "DarkLib — booting…".

src/main.js: Imports EventBus and GameState. On DOMContentLoaded, replaces the boot text with "Scaffold ready." Does not instantiate Three.js yet.

Engine & Campaign Modules: Every .js file in src/engine/, src/reports/, and src/campaigns/ must export its class or object with method signatures matching docs/ARCHITECTURE.md.

Add JSDoc comments stating inputs, outputs, and events emitted.

The method bodies must throw new Error('<ModuleName>.<method> not implemented').

Do not import three inside these stubs except in Map, Interior, and Player files, where you may import it for future typing, but must not call it.

src/campaigns/darkplace/puzzles/library-card-catalogue.yaml: Create a valid sample puzzle matching the schema in docs/ARCHITECTURE.md (id, title, prompt, validation, penalty, failText, onSolve).

4. Testing Setup
Create test/EventBus.test.js. It should test that on, off, and emit correctly register, trigger, and remove a handler.

Ensure npm run test runs this via Vitest.

5. Acceptance Criteria
Run npm install and confirm no errors.

Run npm run test and confirm the EventBus test passes.

Run npm run lint and confirm zero errors.

Update docs/CHANGESET.md with: files created, assumptions, deviations from ARCHITECTURE.md (should be none), and the verbatim output of the test/lint commands.

Out of Scope
No Three.js renderer, camera, or scene loops.

No .glb, texture, or audio loading.

No PlayerController picking logic.

No puzzle validation or serverless/dashboard code.

text

### 4. The Correct OpenCode Prompt

Now, open OpenCode (`opencode`), and paste this **short** prompt:

> Read `docs/tranches/Tranche-0.md`, `docs/ARCHITECTURE.md`, `docs/AESTHETIC-SPEC.md`, and `docs/WORKFLOW.md`. 
> Implement Tranche 0 exactly as specified. 
> Run the verification steps in the spec and update `docs/CHANGESET.md` with your results. 
> Do not implement any feature beyond what Tranche 0 lists. If you hit ambiguity, stop and add it to the questions list rather than guessing.

This is much better. The files in `docs/` serve as the permanent memory of the project, and OpenCode reads them natively like a human developer would.