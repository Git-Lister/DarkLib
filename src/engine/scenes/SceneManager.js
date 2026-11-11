import * as THREE from 'three';
import MapScene from '../map/MapScene.js';
import InteriorScene from '../interior/InteriorScene.js';
import FadeOverlay from '../ui/FadeOverlay.js';

/**
 * SceneManager owns the Three.js renderer and the render loop. It can switch
 * between the MapScene (campus exterior) and the InteriorScene (library
 * interior), with fade transitions between them.
 */
export default class SceneManager {
  constructor(eventBus, gameState) {
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
    /** @type {THREE.Scene|null} */
    this.activeScene = null;
    /** @type {THREE.Camera|null} */
    this.activeCamera = null;
    /** @type {MapScene|null} */
    this.mapScene = null;
    /** @type {InteriorScene|null} */
    this.interiorScene = null;
    /** @type {FadeOverlay|null} */
    this.fadeOverlay = null;
    /** @type {THREE.Clock|null} */
    this.clock = null;
    /** @type {import('../events/EventBus.js').default} */
    this.eventBus = eventBus;
    /** @type {import('../state/GameState.js').default} */
    this.gameState = gameState;
    /** @type {boolean} */
    this.isTransitioning = false;

    this._onNodeArrived = this._onNodeArrived.bind(this);
  }

  /**
   * Instantiate a Three.js WebGLRenderer attached to the given canvas and set
   * up an OrthographicCamera for a blank scene. Creates the shared FadeOverlay
   * used for scene transitions.
   * @param {string} canvasId
   * @returns {void}
   */
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`SceneManager.init: canvas '${canvasId}' not found`);
    }

    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: false });
    this.renderer.setClearColor(0x1a1a1a, 1);

    this.fadeOverlay = new FadeOverlay();

    this.clock = new THREE.Clock();

    this.resize();
    window.addEventListener('resize', this.onResize.bind(this));

    // Arriving at the library node on the map transitions into the interior.
    this.eventBus.on('nodeArrived', this._onNodeArrived);
  }

  /**
   * Recompute the orthographic camera frustum based on canvas size.
   * @returns {void}
   */
  updateCamera() {
    if (!this.camera || !this.canvas) return;
    const d = 30;
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Handle window resize by updating renderer size and camera frustum.
   * @returns {void}
   */
  onResize() {
    if (!this.renderer || !this.canvas) return;
    this.resize();
    this.updateCamera();
    if (this.activeCamera && this.activeCamera.isOrthographicCamera) {
      const d = 30;
      const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
      this.activeCamera.left = -d * aspect;
      this.activeCamera.right = d * aspect;
      this.activeCamera.top = d;
      this.activeCamera.bottom = -d;
      this.activeCamera.updateProjectionMatrix();
    }
  }

  /**
   * Set the renderer size to match the window dimensions.
   * @returns {void}
   */
  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Switch the active scene and camera used by the render loop.
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @returns {void}
   */
  setScene(scene, camera) {
    this.activeScene = scene;
    this.activeCamera = camera;
  }

  /**
   * Handle the nodeArrived event. Arriving at the library triggers the fade
   * transition into the library interior.
   * @param {any} payload
   * @returns {void}
   */
  _onNodeArrived(payload) {
    if (this.isTransitioning) return;
    if (payload && payload.nodeId === 'library') {
      this._enterLibrary();
    }
  }

  /**
   * Fade out, swap to the interior scene, then fade in.
   * @returns {void}
   */
  _enterLibrary() {
    this.isTransitioning = true;
    this.fadeOverlay
      .fadeOut(500)
      .then(() => {
        this.loadInterior();
        return this.fadeOverlay.fadeIn(500);
      })
      .then(() => {
        this.isTransitioning = false;
      });
  }

  /**
   * Load the campus map: create a MapScene, initialise it with the renderer,
   * and switch the render loop over to it.
   * @returns {void}
   */
  loadMap() {
    if (!this.renderer) {
      throw new Error('SceneManager.loadMap: renderer not initialised');
    }
    this.mapScene = new MapScene(this.eventBus, this.gameState);
    this.mapScene.init(this.renderer);
    this.setScene(this.mapScene.scene, this.mapScene.camera);
  }

  /**
   * Switch the active scene to the library interior.
   * @returns {void}
   */
  loadInterior() {
    if (!this.renderer) {
      throw new Error('SceneManager.loadInterior: renderer not initialised');
    }
    this.interiorScene = new InteriorScene(this.eventBus, this.gameState);
    this.interiorScene.init(this.renderer);
    this.setScene(this.interiorScene.scene, this.interiorScene.camera);
  }

  /**
   * Start the requestAnimationFrame render loop. Uses THREE.Clock for dt and
   * passes it to the active scene.
   * @returns {void}
   */
  startRenderLoop() {
    const animate = () => {
      const dt = this.clock ? this.clock.getDelta() : 0;

      if (this.mapScene) {
        this.mapScene.update(dt);
      }
      if (this.interiorScene) {
        this.interiorScene.update(dt);
      }

      const scene = this.activeScene || this.scene;
      const camera = this.activeCamera || this.camera;
      if (this.renderer && scene && camera) {
        this.renderer.render(scene, camera);
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
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
