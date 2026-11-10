import * as THREE from 'three';

/**
 * SceneManager owns the Three.js renderer, camera, and scene for DarkLib.
 * It renders a blank orthographic scene until the map is built in Tranche 2.
 */
export default class SceneManager {
  constructor() {
    /** @type {THREE.WebGLRenderer|null} */
    this.renderer = null;
    /** @type {THREE.OrthographicCamera|null} */
    this.camera = null;
    /** @type {THREE.Scene|null} */
    this.scene = null;
    /** @type {HTMLCanvasElement|null} */
    this.canvas = null;
    /** @type {number|null} */
    this.animationFrameId = null;
  }

  /**
   * Instantiate a Three.js WebGLRenderer attached to the given canvas and
   * set up an OrthographicCamera for a blank scene.
   * @param {string} canvasId
   * @returns {void}
   */
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`SceneManager.init: canvas '${canvasId}' not found`);
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: false });
    this.renderer.setClearColor(0x1a1a1a, 1);

    this.updateCamera();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Recompute the orthographic camera frustum based on canvas size.
   * @returns {void}
   */
  updateCamera() {
    if (!this.camera || !this.canvas) return;
    const d = 10;
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.near = -100;
    this.camera.far = 100;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Handle window resize by updating renderer size and camera frustum.
   * @returns {void}
   */
  onResize() {
    if (!this.renderer || !this.canvas || !this.camera) return;
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.updateCamera();
  }

  /**
   * Start the requestAnimationFrame render loop for the blank scene.
   * @returns {void}
   */
  startRenderLoop() {
    const animate = () => {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop the render loop.
   * @returns {void}
   */
  stopRenderLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
