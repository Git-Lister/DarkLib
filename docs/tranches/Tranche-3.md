# TRANCHE 3 — The Library Interior & Portals

## Goal
Implement the interior scene for the Dalton Library. Add the ability for the player to click the Library building on the map, trigger a fade transition, and arrive inside. Provide basic navigation inside the library and a way to exit back to the map.

## Read first
- `docs/ARCHITECTURE.md` (interfaces are binding)
- `docs/AESTHETIC-SPEC.md` (constraints are binding)
- `docs/WORKFLOW.md` (contract rules)

## 1. Interior Data & Assets
- **`src/engine/interior/RoomData.js`**:
  - Define an array of room objects (e.g., `{ id: 'entrance', x: 0, z: 0, w: 10, d: 10 }`, `{ id: 'stacks', x: 0, z: -15, w: 20, d: 20 }`). 
  - Define portal triggers (doors) connecting these rooms.
- **`src/engine/interior/InteriorAssets.js`**:
  - Create functions for interior primitives: `createFloor(width, depth, color)`, `createWall(width, height, depth, color)`, and `createBookshelf(width, height, depth)`. Use `MeshLambertMaterial` with flat shading.

## 2. Interior Scene Rendering
- **`src/engine/interior/InteriorScene.js`**:
  - Implement `init(renderer)`: Create a `THREE.Scene`. Use a similar orthographic camera as the map, but zoomed in tighter. Add lighting (slightly dimmer/greener than outside). Build the rooms using the assets from `InteriorAssets.js`.
  - Implement `update(dt)`: Update the `PlayerController`.
  - Implement `dispose()`: Clean up geometry and materials.

## 3. Player & Portal Transitions
- **`src/engine/player/PlayerController.js`**:
  - Update the player to handle interior mode. The player should be able to click on the floor to move freely within the current room's bounds, or click a door to move to the next room.
  - Emit `portalEntered` when the player clicks a door.
- **`src/engine/scenes/SceneManager.js`**:
  - Implement `loadInterior()`: Switch the active scene to `InteriorScene`.
  - Implement the transition logic: When `nodeArrived` fires with `nodeId === 'library'`, trigger `FadeOverlay.fadeOut(500)`, swap to `InteriorScene`, and `FadeOverlay.fadeIn(500)`.
- **`src/main.js`**:
  - Listen for `portalEntered`. If the player clicks the "exit" door inside the library, trigger the reverse fade and `SceneManager.loadMap()`.

## 4. Testing & Verification
- Add a test in `test/RoomData.test.js` to verify that all portals in `RoomData.js` reference valid room IDs.
- OpenCode MUST run `npm run test` and `npm run lint` and append the verbatim output to `docs/CHANGESET.md`.

## Out of Scope
- No actual `.glb` models yet (keep using primitives).
- No puzzle logic or UI (still Tranche 4).
- No serverless code.