/**
 * SceneManager owns the active Three.js scene lifecycle: switching between
 * exterior map and interior rooms, fading, and disposing of geometries,
 * materials, and textures when a scene is torn down.
 */
export default class SceneManager {
  constructor() {
    /** @type {string|null} */
    this.currentSceneId = null;
  }

  /**
   * Switches to a named scene with a 300ms fade transition.
   * @param {string} sceneId
   * @returns {void}
   */
  switchScene(sceneId) {
    throw new Error('SceneManager.switchScene not implemented');
  }

  /**
   * Disposes geometries, materials, and textures of the current scene.
   * @returns {void}
   */
  dispose() {
    throw new Error('SceneManager.dispose not implemented');
  }
}
