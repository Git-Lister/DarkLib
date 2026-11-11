import * as THREE from 'three';
import RoomData from './RoomData.js';
import {
  createFloor,
  createWall,
  createBookshelf
} from './InteriorAssets.js';
import PlayerController from '../player/PlayerController.js';

/**
 * InteriorScene renders the Dalton Library interior: rooms, walls, floors,
 * bookshelves and door portals, in a tight orthographic 3/4 view.
 */
export default class InteriorScene {
  constructor(eventBus, gameState) {
    /** @type {import('../events/EventBus.js').default} */
    this.eventBus = eventBus;
    /** @type {import('../state/GameState.js').default} */
    this.gameState = gameState;
    /** @type {THREE.Scene|null} */
    this.scene = null;
    /** @type {THREE.OrthographicCamera|null} */
    this.camera = null;
    /** @type {THREE.WebGLRenderer|null} */
    this.renderer = null;
    /** @type {PlayerController|null} */
    this.playerController = null;
    /** @type {THREE.Group|null} */
    this.roomRoot = null;
    /** @type {string|null} */
    this.currentRoomId = null;
    /** @type {Array<{id: string, x: number, z: number, w: number, d: number}>} */
    this.rooms = [];
    /** @type {THREE.Mesh[]} */
    this.doorMeshes = [];
    this._onPortalEntered = this._onPortalEntered.bind(this);
  }

  /**
   * Initialise the interior scene: scene, tighter orthographic camera, dimmer
   * greener lighting, the entrance room, and the player controller.
   * @param {THREE.WebGLRenderer} renderer
   * @returns {void}
   */
  init(renderer) {
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1f2a24);

    // Tighter orthographic camera than the map.
    const d = 14;
    const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight || 1;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    this.camera.position.set(0, 14, 6);
    this.camera.lookAt(0, 0, 0);

    // Lighting: dimmer and greener than the exterior.
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0x8fae8f, 0.5);
    directional.position.set(10, 20, 10);
    this.scene.add(directional);

    const roomData = new RoomData();
    this.rooms = roomData.getRooms();

    // Holds all room geometry so it can be cleared and rebuilt on room change.
    this.roomRoot = new THREE.Group();
    this.scene.add(this.roomRoot);

    this.playerController = new PlayerController();
    this.playerController.init(
      this.scene,
      this.camera,
      renderer.domElement,
      this.eventBus,
      this.gameState
    );
    this.playerController.setMode('interior');

    this.loadRoom('entrance');

    this.eventBus.on('portalEntered', this._onPortalEntered);
    this.currentRoomId = 'entrance';
  }

  /**
   * Build the geometry for a single room into this.roomRoot.
   * @param {{id: string, x: number, z: number, w: number, d: number}} room
   * @returns {void}
   */
  _buildRoom(room) {
    const wallHeight = 4;
    const wallThickness = 0.4;
    const floorColor = 0x8d6e63;
    const wallColor = 0xe0e0e0;

    // Floor.
    const floor = createFloor(room.w, room.d, floorColor);
    floor.position.set(room.x, 0, room.z);
    this.roomRoot.add(floor);

    // Four walls around the room footprint.
    const { x, z, w, d } = room;
    const walls = [
      createWall(w, wallHeight, wallThickness, wallColor), // north
      createWall(w, wallHeight, wallThickness, wallColor), // south
      createWall(wallThickness, wallHeight, d, wallColor), // west
      createWall(wallThickness, wallHeight, d, wallColor) // east
    ];
    walls[0].position.set(x, wallHeight / 2, z - d / 2); // north
    walls[1].position.set(x, wallHeight / 2, z + d / 2); // south
    walls[2].position.set(x - w / 2, wallHeight / 2, z); // west
    walls[3].position.set(x + w / 2, wallHeight / 2, z); // east
    walls.forEach((wall) => this.roomRoot.add(wall));

    // Bookshelves along the north and south walls.
    const shelves = [
      createBookshelf(4, 3, 1),
      createBookshelf(4, 3, 1),
      createBookshelf(4, 3, 1)
    ];
    shelves[0].position.set(x - 3, 0, z - d / 2 - 0.51);
    shelves[1].position.set(x + 3, 0, z - d / 2 - 0.51);
    shelves[2].position.set(x - 3, 0, z + d / 2 + 0.51);
    shelves.forEach((shelf) => this.roomRoot.add(shelf));

    // Door portals.
    this._addDoor(room, 'door-entrance-stacks', 'stacks', x, z - d / 2 - 0.21, 0, Math.PI);
    this._addDoor(room, 'door-stacks-entrance', 'entrance', x, z + d / 2 + 0.21, 0, 0);
    // Exit door back to the map, on the east wall of the entrance.
    if (room.id === 'entrance') {
      this._addDoor(room, 'door-exit', 'exit', x + w / 2 + 0.21, z, Math.PI / 2, 0);
    }
  }

  /**
   * Add a door mesh to the room with portal userData.
   * @param {{id: string, x: number, z: number, w: number, d: number}} room
   * @param {string} doorId
   * @param {string} target - room id or 'exit'
   * @param {number} wx
   * @param {number} wz
   * @param {number} rx
   * @param {number} ry
   * @returns {void}
   */
  _addDoor(room, doorId, target, wx, wz, rx, ry) {
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.4, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x5d4037, flatShading: true })
    );
    door.position.set(wx, 1.2, wz);
    door.rotation.set(rx, ry, 0);
    door.userData = { isDoor: true, doorId, target };
    this.roomRoot.add(door);
    this.doorMeshes.push(door);
  }

  /**
   * Load a room: clear existing room geometry, rebuild the requested room and
   * re-position the player at the room centre.
   * @param {string} roomId
   * @returns {void}
   */
  loadRoom(roomId) {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) return;

    // Clear previous room geometry.
    while (this.roomRoot.children.length > 0) {
      const child = this.roomRoot.children[0];
      this.roomRoot.remove(child);
      this._disposeObject(child);
    }
    this.doorMeshes = [];

    this._buildRoom(room);
    this.currentRoomId = roomId;

    // Re-position the player at the room centre.
    if (this.playerController && this.playerController.mesh) {
      this.playerController.mesh.position.set(room.x, 0.5, room.z);
    }
    this.playerController.setCurrentRoom(room);
    this.playerController.setDoors(this.doorMeshes);

    this.gameState.setCurrentNodeId(roomId);
  }

  /**
   * Handle a portalEntered event: switch rooms for room targets; 'exit' is
   * handled by the application layer (main.js).
   * @param {any} payload
   * @returns {void}
   */
  _onPortalEntered(payload) {
    if (!payload) return;
    if (payload.target === 'exit') return;
    const target = payload.target || payload.to;
    if (typeof target === 'string' && target !== this.currentRoomId) {
      this.loadRoom(target);
    }
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
   * Recursively dispose of geometries and materials of a mesh or group.
   * @param {THREE.Object3D} object
   * @returns {void}
   */
  _disposeObject(object) {
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

  /**
   * Dispose of all geometries, materials, and remove children from the scene.
   * @returns {void}
   */
  dispose() {
    this.eventBus.off('portalEntered', this._onPortalEntered);
    if (this.playerController) {
      this.playerController.dispose();
      this.playerController = null;
    }
    if (this.roomRoot) {
      while (this.roomRoot.children.length > 0) {
        const child = this.roomRoot.children[0];
        this.roomRoot.remove(child);
        this._disposeObject(child);
      }
    }
    this.doorMeshes = [];
  }
}
