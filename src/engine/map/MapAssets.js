import * as THREE from 'three';
import { loadAsset } from './AssetLoader.js';

/**
 * Applies a flat-shaded MeshLambertMaterial to every mesh in `object`,
 * preserving each mesh's original colour where one is defined. Used to force
 * loaded .glb assets onto the project's flat-shaded aesthetic.
 * @param {THREE.Object3D} object
 */
export function applyFlatShadedMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    const source = child.material;
    let color = 0x8d6e63;
    if (source && source.color && source.color.isColor) {
      color = source.color.clone();
    }
    child.material = new THREE.MeshLambertMaterial({ color, flatShading: true });
  });
}

/**
 * Creates a tree mesh from the generated tree.glb asset.
 * @returns {Promise<THREE.Group>}
 */
export async function createTreeMesh() {
  const scene = await loadAsset('/assets/blender/tree.glb');
  const group = new THREE.Group();
  scene.traverse((child) => {
    if (child.isMesh) {
      group.add(child.clone());
    }
  });
  return group;
}

/**
 * Creates a building mesh. When `assetPath` is provided, loads the .glb model;
 * otherwise falls back to a flat-shaded BoxGeometry.
 * @param {number|string} color - hex color or CSS color string
 * @param {string} [assetPath] - optional path to a .glb/.gltf building asset
 * @returns {Promise<THREE.Object3D>}
 */
export async function createBuildingMesh(color, assetPath) {
  if (assetPath) {
    const scene = await loadAsset(assetPath);
    const group = new THREE.Group();
    scene.traverse((child) => {
      if (child.isMesh) {
        group.add(child.clone());
      }
    });
    return group;
  }

  const geometry = new THREE.BoxGeometry(2, 4, 2);
  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Creates a large flat ground plane with a grey/brown color.
 * @returns {THREE.Mesh}
 */
export function createGroundMesh() {
  const geometry = new THREE.PlaneGeometry(200, 200);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshLambertMaterial({
    color: 0x795548,
    flatShading: true
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Recursively disposes geometries and materials of a mesh or group.
 * @param {THREE.Object3D} object
 */
export function disposeObject(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}
