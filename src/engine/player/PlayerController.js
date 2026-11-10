import * as THREE from 'three';
import {
  getNodeById,
  findNearestNode,
  findShortestPath
} from '../map/MapData.js';
import GameState from '../state/GameState.js';
import EventBus from '../events/EventBus.js';

/**
 * PlayerController drives a simple distinguishable player mesh between campus
 * nodes using click/touch raycasting and smooth linear interpolation.
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

    this._onClick = this._onClick.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
  }

  /**
   * Create the player mesh and attach pointer/touch listeners.
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   * @returns {void}
   */
  init(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({
      color: 0xffeb3b,
      flatShading: true
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.5, 0);
    scene.add(this.mesh);

    this.currentNodeId = 'library';
    this.mesh.position.set(0, 0.5, 0);

    domElement.addEventListener('click', this._onClick);
    domElement.addEventListener('touchstart', this._onTouchStart, {
      passive: false
    });
  }

  /**
   * Handle a mouse click: raycast to the ground, find the nearest node, and
   * plot a path along MAP_EDGES.
   * @param {MouseEvent} event
   * @returns {void}
   */
  _onClick(event) {
    this._pointerFromEvent(event.clientX, event.clientY);
    this._handlePointer();
  }

  /**
   * Handle a touch start: raycast to the ground, find the nearest node, and
   * plot a path along MAP_EDGES.
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
   * Raycast from the camera through the pointer position against the ground
   * plane (y = 0), find the nearest map node, and start moving along the
   * shortest path.
   * @returns {void}
   */
  _handlePointer() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(groundPlane, target);

    if (!target) return;

    const nearestNode = findNearestNode(target.x, target.z);
    if (!nearestNode) return;
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
   * Move the player smoothly along the current path via velocity-based
   * movement scaled by dt.
   * @param {number} dt - delta time in seconds
   * @returns {void}
   */
  update(dt) {
    if (!this.isMoving || this.path.length === 0 || !this.mesh) return;

    const targetNode = getNodeById(this.path[this.pathIndex]);
    if (!targetNode) return;

    const targetPos = new THREE.Vector3(targetNode.x, 0.5, targetNode.z);
    const direction = new THREE.Vector3()
      .subVectors(targetPos, this.mesh.position)
      .normalize();

    this.mesh.position.addScaledVector(direction, this.speed * dt);

    if (this.mesh.position.distanceTo(targetPos) < 0.05) {
      this.mesh.position.copy(targetPos);
      this.pathIndex++;

      if (this.pathIndex >= this.path.length) {
        this.isMoving = false;
        this.currentNodeId = this.targetNodeId;
        this.path = [];

        GameState.setCurrentNodeId(this.currentNodeId);
        EventBus.emit('nodeArrived', { nodeId: this.currentNodeId });
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
