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
