/**
 * MapScene renders the orthographic exterior campus map. In Tranche 0 it is a
 * stub only; Three.js may be imported here for future typing but must not be
 * called.
 */
export default class MapScene {
  constructor() {
    /** @type {string|null} */
    this.activeNodeId = null;
  }

  /**
   * Initialises the map scene (future Three.js setup).
   * @returns {void}
   */
  init() {
    throw new Error('MapScene.init not implemented');
  }

  /**
   * Loads map data and places building geometry.
   * @param {import('./MapData.js').default} mapData
   * @returns {void}
   */
  loadMap(mapData) {
    throw new Error('MapScene.loadMap not implemented');
  }

  /**
   * Adds a building to the map at a node.
   * @param {string} nodeId
   * @returns {void}
   */
  addBuilding(nodeId) {
    throw new Error('MapScene.addBuilding not implemented');
  }

  /**
   * Handles a click on a campus node.
   * @param {string} nodeId
   * @returns {void}
   */
  onNodeClick(nodeId) {
    throw new Error('MapScene.onNodeClick not implemented');
  }
}
