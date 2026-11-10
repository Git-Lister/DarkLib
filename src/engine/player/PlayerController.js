/**
 * PlayerController drives the player character along campus paths and handles
 * input picking. Stub only in Tranche 0; no picking logic yet.
 */
export default class PlayerController {
  constructor() {
    /** @type {string|null} */
    this.currentNodeId = null;
  }

  /**
   * Initialises the player at a starting node.
   * @param {string} startNodeId
   * @returns {void}
   */
  init(startNodeId) {
    throw new Error('PlayerController.init not implemented');
  }

  /**
   * Moves the player along a path to a target node.
   * @param {string} targetNodeId
   * @returns {void}
   */
  moveTo(targetNodeId) {
    throw new Error('PlayerController.moveTo not implemented');
  }

  /**
   * Handles click/tap input for picking nodes.
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  onInput(x, y) {
    throw new Error('PlayerController.onInput not implemented');
  }
}
