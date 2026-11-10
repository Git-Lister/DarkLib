import * as THREE from 'three';

/**
 * Creates a building mesh as a flat-shaded box.
 * @param {number|string} color - hex color or CSS color string
 * @returns {THREE.Mesh}
 */
export function createBuildingMesh(color) {
  const geometry = new THREE.BoxGeometry(2, 4, 2);
  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Creates a tree mesh: brown trunk (cylinder) + flat green canopy (cone).
 * Returned as a Group so trunk and canopy can be transformed independently.
 * @returns {THREE.Group}
 */
export function createTreeMesh() {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 1.8, 6),
    new THREE.MeshLambertMaterial({ color: 0x5d4037, flatShading: true })
  );
  trunk.position.y = 0.9;
  group.add(trunk);

  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 2.2, 4),
    new THREE.MeshLambertMaterial({ color: 0x388e3c, flatShading: true })
  );
  canopy.position.y = 2.2;
  group.add(canopy);

  return group;
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
