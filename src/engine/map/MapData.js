/**
 * MapData describes the static campus map: nodes (buildings), paths between
 * them, and coordinates for each node. Staff edit this data; the engine reads
 * it at load time.
 */
export default class MapData {
  constructor() {
    /** @type {Array<{id: string, x: number, z: number, kind: 'puzzle'|'interior'}>} */
    this.nodes = [];
    /** @type {Array<{from: string, to: string}>} */
    this.paths = [];
  }

  /**
   * Returns all campus nodes.
   * @returns {Array<{id: string, x: number, z: number, kind: string}>}
   */
  getNodes() {
    throw new Error('MapData.getNodes not implemented');
  }

  /**
   * Returns all path edges between nodes.
   * @returns {Array<{from: string, to: string}>}
   */
  getPaths() {
    throw new Error('MapData.getPaths not implemented');
  }

  /**
   * Returns a single node by id.
   * @param {string} nodeId
   * @returns {{id: string, x: number, z: number, kind: string}|undefined}
   */
  getNodeById(nodeId) {
    throw new Error('MapData.getNodeById not implemented');
  }
}
