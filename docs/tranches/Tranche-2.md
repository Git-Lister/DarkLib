# TRANCHE 2 — The Flat Map & Navigation

## Goal
Render the 3D map scene using an orthographic camera. Implement the MapData node graph with placeholder buildings. Implement click-picking raycasting and a player character that moves between nodes along paths. 

## Read first
- `docs/ARCHITECTURE.md` (interfaces are binding)
- `docs/AESTHETIC-SPEC.md` (constraints are binding)
- `docs/WORKFLOW.md` (contract rules)

## 1. Map Data & Assets
- **`src/engine/map/MapData.js`**:
  - Export a constant `MAP_NODES` array. Define 4 nodes using simple X, Z coordinates (e.g., `{ id: 'library', x: 0, z: 0, name: 'Dalton Library' }`, plus nodes for 'john-dalton', 'arts-humanities', and 'all-saints-park').
  - Export a constant `MAP_EDGES` array defining which nodes connect (e.g., `{ a: 'library', b: 'john-dalton' }`).
- **`src/engine/map/MapAssets.js`**:
  - Create a function `createBuildingMesh(color)` that returns a `THREE.Mesh` using `BoxGeometry` and `MeshLambertMaterial` with `flatShading: true`. 
  - Create a function `createTreeMesh()` returning a simple `CylinderGeometry` (trunk) and `ConeGeometry` (canopy) merged or grouped, using flat shading.
  - Create a `createGroundMesh()` returning a large `PlaneGeometry` with a simple grey/brown procedural color (or basic hex color).

## 2. Map Scene Rendering
- **`src/engine/map/MapScene.js`**:
  - Implement `init(renderer)`: 
    - Create a `THREE.Scene`.
    - Create an `OrthographicCamera` configured to look down at a 15-20 degree tilt (per AESTHETIC-SPEC).
    - Add a directional light and ambient light.
    - Instantiate the ground, place the building boxes at the coordinates defined in `MapData.js`, and scatter a few trees.
    - Add the `PlayerController` to the scene.
  - Implement `update(dt)`: update the player controller.
  - Implement `dispose()`: properly clean up geometries and materials.

## 3. Player & Navigation
- **`src/engine/player/PlayerController.js`**:
  - The player should be a simple distinguishable `Mesh` (e.g., a capsule or a brightly colored box).
  - Implement `init(scene, camera, domElement)`.
  - Implement click/touch detection using `THREE.Raycaster`. 
  - **Raycasting logic**: When the user clicks, cast a ray from the camera. If it hits the ground plane, find the nearest `MAP_NODES` entry. If the player is already at a node, find the shortest path along `MAP_EDGES` to the clicked node.
  - Implement `update(dt)`: move the player smoothly (lerp) along the path from their current position to the target node. 
  - When a node is reached, update `GameState` (e.g., `GameState.setCurrentNode(nodeId)`) and emit `nodeArrived`.
  - *Mobile parity*: Ensure touch events trigger the same raycasting logic.

## 4. Main Orchestration
- **`src/main.js`**:
  - Update the `introCompleted` event handler: instead of logging "Map ready", trigger `SceneManager.loadMap()`.
  - Ensure `SceneManager` correctly initializes the `MapScene` and switches the render loop over to it.

## 5. Testing & Verification
- Add a test in `test/MapData.test.js` to verify that the graph structure is valid (e.g., every edge references an existing node).
- OpenCode MUST run `npm run test` and `npm run lint` and append the verbatim output to `docs/CHANGESET.md`.

## Out of Scope
- No actual interior scenes yet (Library interior is Tranche 3).
- No puzzle modals or interaction with buildings (just walking up to them).
- No external 3D models (`.glb`). All geometry must be Three.js primitives.