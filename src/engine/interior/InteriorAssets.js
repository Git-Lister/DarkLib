/**
 * InteriorAssets declares static interior geometry and texture handles. No
 * assets are loaded in Tranche 0.
 */
export default class InteriorAssets {
  /**
   * Resolves geometry/textures for a room.
   * @param {string} roomId
   * @returns {Promise<void>}
   */
  loadRoomAssets(roomId) {
    throw new Error('InteriorAssets.loadRoomAssets not implemented');
  }
}
