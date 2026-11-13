# TRANCHE 6A — The Blender Pipeline & GLTF Loading

## Goal
Establish the 3D asset pipeline. Replace the primitive `BoxGeometry` buildings and `CylinderGeometry` trees with actual `.glb` models loaded via `GLTFLoader`. 

## Read first
- `docs/ARCHITECTURE.md`
- `docs/AESTHETIC-SPEC.md`
- `docs/WORKFLOW.md`

## 1. Asset Loading Strategy
- Create `src/engine/map/AssetLoader.js`:
  - Implement a `GLTFLoader` instance.
  - Create an async `loadAsset(path)` function that returns a Promise resolving to the loaded `gltf.scene`.
  - Create a caching mechanism so if we load `tree.glb` 10 times, it only fetches it once and clones the mesh.
- Ensure Vite correctly serves the files from `public/assets/blender/`. The paths should be absolute (e.g., `/assets/blender/tree.glb`).

## 2. Updating MapAssets.js
- Refactor `src/engine/map/MapAssets.js`:
  - Change `createTreeMesh()` to be async. It should call `AssetLoader.loadAsset('/assets/blender/tree.glb')`, scale it to an appropriate size (e.g., `0.5`), and return it.
  - Change `createBuildingMesh(color)` to accept an `assetPath` parameter. If provided, load and return the model. If not, fall back to the primitive `BoxGeometry` (so we don't break other buildings).

## 3. Updating MapScene.js
- Refactor `src/engine/map/MapScene.js`:
  - The `init()` function is currently synchronous. Change it to `async init()`.
  - When placing buildings and trees, use `await` to load the new `.glb` assets. 
  - Ensure the `SceneManager` waits for `MapScene.init()` to resolve before starting the render loop (or simply let it populate asynchronously if it doesn't block gameplay).
  - Apply the flat-shaded `MeshLambertMaterial` to the loaded `.glb` meshes to ensure they match the aesthetic (traverse the loaded scene and override materials).

## 4. File Structure
- Assume the following files exist in `public/assets/blender/`:
  - `tree.glb` (a low-poly tree)
  - `library.glb` (the main library building)

## 5. Testing & Verification
- Tests cannot easily load WebGL contexts in Vitest. Add a basic test in `test/AssetLoader.test.js` that mocks the `GLTFLoader` and verifies the caching mechanism returns the same object for the same path.
- OpenCode MUST run `npm run test` and `npm run lint` and append the verbatim output to `docs/CHANGESET.md`.

## Out of Scope
- No Toon shading or outlines yet (Tranche 6B).
- No post-processing or audio (Tranche 6C).
🚀 Run It