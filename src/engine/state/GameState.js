/**
 * GameState holds the transient state of a DarkLib session: lives, solved
 * puzzles, and the current campus node. It emits domain events through the
 * injected EventBus but does not depend on it directly.
 *
 * @typedef {Object} GameStateConfig
 * @property {number} maxLives - maximum lives (default 3)
 * @property {number} initialLives - starting lives (default 3)
 */

/**
 * @param {import('../events/EventBus.js').default} eventBus - event bus to publish on
 * @param {GameStateConfig} [config]
 */
export default class GameState {
  /**
   * @param {import('../events/EventBus.js').default} eventBus
   * @param {GameStateConfig} [config]
   */
  constructor(eventBus, config = {}) {
    this.eventBus = eventBus;
    this.maxLives = config.maxLives ?? 3;
    this.initialLives = config.initialLives ?? 3;
    this.lives = this.initialLives;
    this.solvedPuzzles = new Set();
    this.currentNodeId = null;
  }

  /**
   * Returns the current lives count.
   * @returns {number}
   */
  getLives() {
    throw new Error('GameState.getLives not implemented');
  }

  /**
   * Sets lives to a value and emits livesChanged.
   * @param {number} value
   * @returns {void}
   */
  setLives(value) {
    throw new Error('GameState.setLives not implemented');
  }

  /**
   * Decrements lives by one and emits livesChanged. Emits gameOver when 0.
   * @returns {void}
   */
  decrementLives() {
    throw new Error('GameState.decrementLives not implemented');
  }

  /**
   * Checks whether a puzzle id is solved.
   * @param {string} puzzleId
   * @returns {boolean}
   */
  isSolved(puzzleId) {
    throw new Error('GameState.isSolved not implemented');
  }

  /**
   * Marks a puzzle as solved and emits puzzleSolved.
   * @param {string} puzzleId
   * @returns {void}
   */
  markSolved(puzzleId) {
    throw new Error('GameState.markSolved not implemented');
  }

  /**
   * Returns the id of the current campus node.
   * @returns {string|null}
   */
  getCurrentNodeId() {
    throw new Error('GameState.getCurrentNodeId not implemented');
  }

  /**
   * Sets the current campus node id and emits nodeArrived.
   * @param {string} nodeId
   * @returns {void}
   */
  setCurrentNodeId(nodeId) {
    throw new Error('GameState.setCurrentNodeId not implemented');
  }
}
