/**
 * InteriorScene renders a single interior room in the same orthographic 3/4
 * view as the exterior map. Stub only in Tranche 0.
 */
export default class InteriorScene {
  constructor() {
    /** @type {string|null} */
    this.currentRoomId = null;
  }

  /**
   * Initialises the interior scene (future Three.js setup).
   * @returns {void}
   */
  init() {
    throw new Error('InteriorScene.init not implemented');
  }

  /**
   * Loads room geometry and door portal triggers.
   * @param {string} roomId
   * @returns {void}
   */
  loadRoom(roomId) {
    throw new Error('InteriorScene.loadRoom not implemented');
  }

  /**
   * Enters a room via a door portal with a fade transition.
   * @param {string} roomId
   * @returns {void}
   */
  enterRoom(roomId) {
    throw new Error('InteriorScene.enterRoom not implemented');
  }

  /**
   * Exits the current room back to the map or previous room.
   * @returns {void}
   */
  exitRoom() {
    throw new Error('InteriorScene.exitRoom not implemented');
  }
}
