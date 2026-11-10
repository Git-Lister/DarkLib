/**
 * GameState holds the transient state of a DarkLib session: lives, solved
 * puzzles, and the current campus node. It publishes domain events through
 * the injected EventBus.
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
    return this.lives;
  }

  /**
   * Sets lives to a value and emits livesChanged.
   * @param {number} value
   * @returns {void}
   */
  setLives(value) {
    this.lives = Math.max(0, Math.min(this.maxLives, value));
    if (this.eventBus) {
      this.eventBus.emit('livesChanged', { lives: this.lives });
    }
    if (this.lives === 0 && this.eventBus) {
      this.eventBus.emit('gameOver', null);
    }
  }

  /**
   * Decrements lives by one and emits livesChanged. Emits gameOver when 0.
   * @returns {void}
   */
  decrementLives() {
    this.setLives(this.lives - 1);
  }

  /**
   * Checks whether a puzzle id is solved.
   * @param {string} puzzleId
   * @returns {boolean}
   */
  isSolved(puzzleId) {
    return this.solvedPuzzles.has(puzzleId);
  }

  /**
   * Marks a puzzle as solved and emits puzzleSolved.
   * @param {string} puzzleId
   * @returns {void}
   */
  markSolved(puzzleId) {
    this.solvedPuzzles.add(puzzleId);
    if (this.eventBus) {
      this.eventBus.emit('puzzleSolved', { puzzleId });
    }
  }

  /**
   * Returns the id of the current campus node.
   * @returns {string|null}
   */
  getCurrentNodeId() {
    return this.currentNodeId;
  }

  /**
   * Sets the current campus node id and emits nodeArrived.
   * @param {string} nodeId
   * @returns {void}
   */
  setCurrentNodeId(nodeId) {
    this.currentNodeId = nodeId;
    if (this.eventBus) {
      this.eventBus.emit('nodeArrived', { nodeId });
    }
  }
}
