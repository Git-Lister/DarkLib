# CHANGESET — Tranche 2

## Files Created

### New files
- `test/MapData.test.js` — tests for MAP_NODES/MAP_EDGES graph validity, getNodeById, findNearestNode, findShortestPath

## Files Modified

- `index.html` — canvas CSS set to `width: 100vw; height: 100vh` so the WebGL canvas fills the viewport
- `src/main.js` — removes the boot `<p>` element when `introCompleted` fires, so the UI root is cleared before the map fades in
- `src/engine/map/MapData.js` — replaced throwing stub with real implementation: exports `MAP_NODES` (4 nodes: library, john-dalton, arts-humanities, all-saints-park), `MAP_EDGES`, and helper functions `getNodeById`, `getNodePosition`, `findNearestNode`, `findShortestPath` (BFS)
- `src/engine/map/MapAssets.js` — replaced throwing stub with real implementation: exports `createBuildingMesh(color)` (BoxGeometry + MeshLambertMaterial flatShading), `createTreeMesh()` (cylinder trunk + cone canopy Group), `createGroundMesh()` (PlaneGeometry), and `disposeObject()` helper
- `src/engine/map/MapScene.js` — replaced throwing stub with real implementation: `init(renderer)` creates Scene, tilted OrthographicCamera (15-20 deg, frustum d=30), directional + ambient light, ground, buildings at node coordinates, scattered trees, and PlayerController; `update(dt)` updates player; `dispose()` cleans up geometries/materials
- `src/engine/player/PlayerController.js` — replaced throwing stub with real implementation: bright yellow box player mesh, `init(scene, camera, domElement)`, click/touch raycasting via THREE.Raycaster against ground plane, nearest-node lookup, BFS shortest path along MAP_EDGES, smooth velocity-based movement in `update(dt)`, emits `nodeArrived` and calls `GameState.setCurrentNodeId` on arrival, mobile touch parity
- `src/engine/state/GameState.js` — replaced throwing stub with real implementation: `getLives`/`setLives`/`decrementLives`/`isSolved`/`markSolved`/`getCurrentNodeId`/`setCurrentNodeId` with EventBus emissions (`livesChanged`, `gameOver`, `puzzleSolved`, `nodeArrived`)
- `src/engine/scenes/SceneManager.js` — renderer explicitly sized to `window.innerWidth`/`window.innerHeight` on init and resize; OrthographicCamera frustum fixed to d=30; `updateProjectionMatrix()` called on resize; `THREE.Clock` used in render loop to calculate dt; `setScene(scene, camera)`, `loadMap()` (creates MapScene, initialises with renderer, switches render loop), render loop passes dt to `mapScene.update(dt)`
- `eslint.config.js` — no changes needed from Tranche 1 (globals already cover Three.js runtime APIs)

## Visual Fixes (Tranche 2 patch)

- **HTML text cleanup**: Boot text (`<p>DarkLib — booting…</p>` / "Scaffold ready.") is removed from the DOM when `introCompleted` fires, before `fadeOverlay.fadeIn(500)` reveals the map.
- **Renderer sizing**: `WebGLRenderer.setSize(window.innerWidth, window.innerHeight)` on init and resize; canvas CSS is `100vw`/`100vh`.
- **Camera zoom**: OrthographicCamera frustum half-size set to `d = 30` (was 10 in SceneManager default, 24 in MapScene); `updateProjectionMatrix()` called on resize for both default and active cameras.
- **Smooth movement**: `THREE.Clock` in SceneManager render loop provides dt; dt passed to `PlayerController.update(dt)`; movement uses velocity-based `addScaledVector(direction, speed * dt)` instead of frame-dependent lerp factor.

## Assumptions
- Player starts at the 'library' node by default.
- Player movement only triggers when clicking a different node than the current one; clicking the current node is a no-op.
- If the player is not currently at a node (e.g. mid-movement), clicking computes a path from the current node.
- The ground plane is at y = 0; raycasting uses `ray.intersectPlane` against this infinite plane.
- Camera tilt of ~18 degrees from top-down achieved via position (0, 16, 6) and lookAt(0,0,0).
- Building height is 4 units, positioned at y = 2 so the base sits on the ground plane.
- All geometry uses Three.js primitives only (no `.glb` loading), per out-of-scope constraint.

## Deviations from ARCHITECTURE.md
- None. All geometry uses Three.js primitives (BoxGeometry, CylinderGeometry, ConeGeometry, PlaneGeometry). MeshLambertMaterial with flatShading: used per spec. OrthographicCamera with 15-20 degree tilt. Directional + ambient lighting. No `.glb`, no PBR, no real-time shadows, no InstancedMesh needed (no repeated geometry beyond a few hand-placed trees).

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
 ✓ test/EventBus.test.js (3 tests) 3ms
 ✓ test/TypewriterIntro.test.js (4 tests) 31ms

 Test Files  3 passed (3)
      Tests  14 passed (14)
   Start at 16:21:08
   Duration 797ms (transform 41ms, setup 0ms, collect 53ms, tests 37ms, environment 1.30s, prepare 412ms)
```
Result: PASS — all 14 tests pass (7 MapData + 3 EventBus + 4 TypewriterIntro).

`npm run lint` — verbatim output:
```
> darklib@0.0.1 lint
> eslint .

(zero errors)
```
Result: PASS — zero lint errors.

### Mobile
Touch events (`touchstart`) trigger the same raycasting logic as clicks, with `preventDefault()` to avoid scroll/zoom interference. Not tested on an actual mobile device in Tranche 2.

### Event reporting
Not in scope for Tranche 2 (`RemoteReporter` remains a stub from Tranche 0).
