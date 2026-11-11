import * as THREE from 'three';

/**
 * Creates a flat floor plane.
 * @param {number} width
 * @param {number} depth
 * @param {number|string} color
 * @returns {THREE.Mesh}
 */
export function createFloor(width, depth, color) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Creates a flat-shaded wall box.
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 * @param {number|string} color
 * @returns {THREE.Mesh}
 */
export function createWall(width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true
  });
  const wall = new THREE.Mesh(geometry, material);
  wall.position.y = height / 2;
  return wall;
}

/**
 * Creates a bookshelf: back frame + horizontal shelves.
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 * @returns {THREE.Group}
 */
export function createBookshelf(width, height, depth) {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({
    color: 0x5d4037,
    flatShading: true
  });

  const shelfCount = 4;
  const shelfHeight = height / shelfCount;
  for (let i = 0; i < shelfCount; i++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.1, depth),
      material
    );
    shelf.position.y = i * shelfHeight + shelfHeight / 2;
    group.add(shelf);
  }

  const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.2), material);
  frame.position.set(0, height / 2, depth / 2 + 0.1);
  group.add(frame);

  return group;
}
