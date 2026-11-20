import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * AssetLoader manages asynchronous loading of .glb / .gltf assets.
 *
 * A single GLTFLoader instance is shared across the game. Every successfully
 * loaded scene is cached in a Map keyed by asset path, so requesting the same
 * asset (e.g. tree.glb for several trees) clones the cached scene instead of
 * refetching it from the network.
 */
const loader = new GLTFLoader();
const cache = new Map();

/**
 * Load a glTF asset asynchronously.
 * @param {string} path - URL of the .glb or .gltf asset
 * @returns {Promise<THREE.Scene>} a Promise resolving to the loaded
 *   `gltf.scene`. When the asset is already cached, a clone of the cached
 *   scene is returned so callers can position each instance independently.
 */
export async function loadAsset(path) {
  if (cache.has(path)) {
    return cache.get(path).clone();
  }

  const gltf = await loader.loadAsync(path);
  cache.set(path, gltf.scene);
  return gltf.scene;
}

/**
 * Drop every cached asset. Intended for tests and scene teardown.
 * @returns {void}
 */
export function clearAssetCache() {
  cache.clear();
}
