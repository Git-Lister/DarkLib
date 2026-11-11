import * as THREE from 'three';
import { getNodeById, findNearestNode, findShortestPath } from '../map/MapData.js';

/**
 * PlayerController drives a simple distinguishable player mesh. In map mode it
 * moves between campus nodes via click/touch raycasting. In interior mode it
 * moves freely within the current room's bounds and can click door portals,
 * emitting `portalEntered` on the event bus.
 */
export default class PlayerController {
  constructor() {
    /** @type {THREE.Mesh|null} */
    this.mesh = null;
    /** @type {THREE.Scene|null} */
    this.scene = null;
    /** @type {THREE.Camera|null} */
    this.camera = null;
    /** @type {HTMLElement|null} */
    this.domElement = null;
    /** @type {THREE.Raycaster} */
    this.raycaster = new THREE.Raycaster();
    /** @type {THREE.Vector2} */
    this.mouse = new THREE.Vector2();
    /** @type {import('../events/EventBus.js').default|null} */
    this.eventBus = null;
    /** @type {import('../state/GameState.js').default|null} */
    this.gameState = null;
    /** @type {string|null} */
    this.currentNodeId = null;
    /** @type {string|null} */
    this.targetNodeId = null;
    /** @type {string[]} */
    this.path = [];
    /** @type {number} */
    this.pathIndex = 0;
    /** @type {boolean} */
    this.isMoving = false;
    /** @type {number} - units per second */
    this.speed = 6;
    /** @type {'map'|'interior'} */
    this.mode = 'map';
    /** @type {{id:string,x:number,z:number,w:number,d:number}|null} */
    this.currentRoom = null;
    /** @type {THREE.Vector3|null} */
    this.targetPos = null;
    /** @type {THREE.Mesh[]} */
    this.doors = [];
    /** @type {THREE.Mesh[]} */
    this.interactables = [];

    this._onClick = this._onClick.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
  }

  /**
   * Create the player mesh and attach pointer/touch listeners.
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   * @param {import('../events/EventBus.js').default} eventBus
   * @param {import('../state/GameState.js').default} gameState
   * @returns {void}
   */
  init(scene, camera, domElement, eventBus, gameState) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.eventBus = eventBus;
    this.gameState = gameState;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({
      color: 0xffeb3b,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.5, 0);
    scene.add(this.mesh);

    this.currentNodeId = 'library';
    this.mesh.position.set(0, 0.5, 0);

    domElement.addEventListener('click', this._onClick);
    domElement.addEventListener('touchstart', this._onTouchStart, {
      passive: false,
    });
  }

  /**
   * Set the current mode: 'map' (node-to-node movement) or 'interior'
   * (free movement within a room).
   * @param {string} mode
   * @returns {void}
   */
  setMode(mode) {
    this.mode = mode;
    this.targetPos = null;
    this.path = [];
    this.pathIndex = 0;
    this.isMoving = false;
  }

  /**
   * Set the current room, used to clamp interior floor movement.
   * @param {{id:string,x:number,z:number,w:number,d:number}|null} room
   * @returns {void}
   */
  setCurrentRoom(room) {
    this.currentRoom = room;
  }

  /**
   * Register door meshes so clicks on them trigger portal transitions.
   * @param {THREE.Mesh[]} doors
   * @returns {void}
   */
  setDoors(doors) {
    this.doors = doors;
  }

  /**
   * Register interactive meshes so clicks on them trigger puzzle
   * interactions via the `interacted` event.
   * @param {THREE.Mesh[]} interactables
   * @returns {void}
   */
  setInteractables(interactables) {
    this.interactables = interactables;
  }

  /**
   * Handle a mouse click: raycast against doors (interior) or the ground
   * plane, then move or trigger a portal.
   * @param {MouseEvent} event
   * @returns {void}
   */
  _onClick(event) {
    this._pointerFromEvent(event.clientX, event.clientY);
    this._handlePointer();
  }

  /**
   * Handle a touch start: raycast against doors (interior) or the ground
   * plane, then move or trigger a portal.
   * @param {TouchEvent} event
   * @returns {void}
   */
  _onTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this._pointerFromEvent(touch.clientX, touch.clientY);
    this._handlePointer();
  }

  /**
   * Convert screen coordinates to normalized device coordinates.
   * @param {number} clientX
   * @param {number} clientY
   * @returns {void}
   */
  _pointerFromEvent(clientX, clientY) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Raycast from the camera through the pointer position. If a door is hit,
   * emit `portalEntered`. Otherwise move to the ground intersection point.
   * @returns {void}
   */
  _handlePointer() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.mode === 'interior') {
      const targets = [...this.doors, ...this.interactables];
      if (targets.length > 0) {
        const hits = this.raycaster.intersectObjects(targets);
        if (hits.length > 0) {
          const hit = hits[0];
          const userData = hit.object.userData || {};
          if (userData.isDoor && this.eventBus) {
            this.eventBus.emit('portalEntered', {
              doorId: userData.doorId,
              target: userData.target,
            });
            return;
          }
          if (userData.isTerminal && this.eventBus) {
            this.eventBus.emit('interacted', { puzzleId: userData.puzzleId });
            return;
          }
        }
      }
    }

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(groundPlane, target)) return;

    if (this.mode === 'interior') {
      this._moveTo(target);
      return;
    }

    // Map mode: click on the library building enters the interior. Any other
    // node plots a path along MAP_EDGES.
    const nearestNode = findNearestNode(target.x, target.z);
    if (!nearestNode) return;

    if (nearestNode.id === 'library') {
      if (this.gameState) {
        this.gameState.setCurrentNodeId('library');
      }
      return;
    }

    if (this.currentNodeId === nearestNode.id) return;

    const path = this.currentNodeId
      ? findShortestPath(this.currentNodeId, nearestNode.id)
      : [nearestNode.id];

    if (!path || path.length === 0) return;

    this.path = path;
    this.pathIndex = 0;
    this.isMoving = true;
    this.targetNodeId = nearestNode.id;
  }

  /**
   * Start moving the player toward a world position (interior free movement).
   * @param {THREE.Vector3} pos
   * @returns {void}
   */
  _moveTo(pos) {
    if (!this.mesh) return;
    const clamped = pos.clone();
    if (this.mode === 'interior' && this.currentRoom) {
      const { x, z, w, d } = this.currentRoom;
      clamped.x = Math.max(x - w / 2, Math.min(x + w / 2, clamped.x));
      clamped.z = Math.max(z - d / 2, Math.min(z + d / 2, clamped.z));
    }
    this.targetPos = clamped;
    this.isMoving = true;
    this.path = [];
    this.pathIndex = 0;
  }

  /**
   * Move the player smoothly via velocity-based movement scaled by dt.
   * @param {number} dt - delta time in seconds
   * @returns {void}
   */
  update(dt) {
    if (!this.isMoving || !this.mesh) return;

    if (this.mode === 'interior') {
      if (!this.targetPos) return;
      const direction = new THREE.Vector3()
        .subVectors(this.targetPos, this.mesh.position)
        .normalize();
      this.mesh.position.addScaledVector(direction, this.speed * dt);
      if (this.mesh.position.distanceTo(this.targetPos) < 0.05) {
        this.mesh.position.copy(this.targetPos);
        this.isMoving = false;
        this.targetPos = null;
      }
      return;
    }

    const targetNode = getNodeById(this.path[this.pathIndex]);
    if (!targetNode) return;

    const targetPos = new THREE.Vector3(targetNode.x, 0.5, targetNode.z);
    const direction = new THREE.Vector3().subVectors(targetPos, this.mesh.position).normalize();

    this.mesh.position.addScaledVector(direction, this.speed * dt);

    if (this.mesh.position.distanceTo(targetPos) < 0.05) {
      this.mesh.position.copy(targetPos);
      this.pathIndex++;

      if (this.pathIndex >= this.path.length) {
        this.isMoving = false;
        this.currentNodeId = this.targetNodeId;
        this.path = [];

        if (this.gameState) {
          this.gameState.setCurrentNodeId(this.currentNodeId);
        }
      }
    }
  }

  /**
   * Remove listeners and dispose of the player mesh.
   * @returns {void}
   */
  dispose() {
    if (this.domElement) {
      this.domElement.removeEventListener('click', this._onClick);
      this.domElement.removeEventListener('touchstart', this._onTouchStart);
    }
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}
