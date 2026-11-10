import * as THREE from 'three';
import { MAP_NODES } from './MapData.js';
import {
  createBuildingMesh,
  createTreeMesh,
  createGroundMesh,
  disposeObject
} from './MapAssets.js';
import PlayerController from '../player/PlayerController.js';

/**
 * MapScene renders the flat orthographic campus map: ground, building boxes
 * at node coordinates, scattered trees, and the player character.
 */
export default class MapScene {
  constructor() {
    /** @type {THREE.Scene|null} */
    this.scene = null;
    /** @type {THREE.OrthographicCamera|null} */
    this.camera = null;
    /** @type {THREE.WebGLRenderer|null} */
    this.renderer = null;
    /** @type {PlayerController|null} */
    this.playerController = null;
  }

  /**
   * Initialise the map scene: scene, orthographic camera (tilted 15-20 deg
   * from top-down), lights, ground, buildings, trees, and player controller.
   * @param {THREE.WebGLRenderer} renderer
   * @returns {void}
   */
  init(renderer) {
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x263238);

    // Orthographic camera, tilted 15-20 degrees from top-down.
    const d = 30;
    const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight || 1;
    this.camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      0.1,
      100
    );
    this.camera.position.set(0, 16, 6);
    this.camera.lookAt(0, 0, 0);

    // Lights: one directional + low ambient.
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.75);
    directional.position.set(10, 20, 10);
    directional.castShadow = false;
    this.scene.add(directional);

    // Ground plane.
    const ground = createGroundMesh();
    this.scene.add(ground);

    // Building boxes at node coordinates.
    for (const node of MAP_NODES) {
      const building = createBuildingMesh(0x8d6e63);
      building.position.set(node.x, 2, node.z);
      this.scene.add(building);
    }

    // Scatter a few trees.
    const treePositions = [
      { x: -14, z: -8 },
      { x: 14, z: -12 },
      { x: -8, z: 14 },
      { x: 20, z: 6 },
      { x: 0, z: -18 }
    ];
    for (const pos of treePositions) {
      const tree = createTreeMesh();
      tree.position.set(pos.x, 0, pos.z);
      this.scene.add(tree);
    }

    // Player controller.
    this.playerController = new PlayerController();
    this.playerController.init(this.scene, this.camera, renderer.domElement);
  }

  /**
   * Update the player controller each frame.
   * @param {number} dt - delta time in seconds
   * @returns {void}
   */
  update(dt) {
    if (this.playerController) {
      this.playerController.update(dt);
    }
  }

  /**
   * Dispose of all geometries, materials, and remove children from the scene.
   * @returns {void}
   */
  dispose() {
    if (this.playerController) {
      this.playerController.dispose();
      this.playerController = null;
    }
    if (this.scene) {
      while (this.scene.children.length > 0) {
        const child = this.scene.children[0];
        this.scene.remove(child);
        disposeObject(child);
      }
    }
  }
}
