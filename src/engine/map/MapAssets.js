/**
 * MapAssets declares the static geometry and texture handles for campus
 * buildings and props. No assets are loaded in Tranche 0.
 */
export default class MapAssets {
  /**
   * Resolves the geometry/texture for a building node.
   * @param {string} nodeId
   * @returns {Promise<void>}
   */
  loadBuilding(nodeId) {
    throw new Error('MapAssets.loadBuilding not implemented');
  }

  /**
   * Resolves a repeated prop asset (e.g. tree) using InstancedMesh.
   * @param {string} propId
   * @returns {Promise<void>}
   */
  loadProp(propId) {
    throw new Error('MapAssets.loadProp not implemented');
  }
}
