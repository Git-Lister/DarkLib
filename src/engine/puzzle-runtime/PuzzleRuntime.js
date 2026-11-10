/**
 * PuzzleRuntime loads a puzzle definition, presents it through a modal, and
 * validates the player's answer, applying penalties where configured.
 */
export default class PuzzleRuntime {
  constructor() {
    /** @type {Object|null} */
    this.currentPuzzle = null;
  }

  /**
   * Loads a puzzle definition by id.
   * @param {string} puzzleId
   * @returns {Promise<Object>}
   */
  loadPuzzle(puzzleId) {
    throw new Error('PuzzleRuntime.loadPuzzle not implemented');
  }

  /**
   * Validates an answer against the puzzle's validation rule.
   * @param {any} answer
   * @returns {{correct: boolean, penalty: boolean, failText: string|null}}
   */
  validateAnswer(answer) {
    throw new Error('PuzzleRuntime.validateAnswer not implemented');
  }

  /**
   * Emits a penalty event if the puzzle is configured with penalty: true.
   * @returns {void}
   */
  emitPenalty() {
    throw new Error('PuzzleRuntime.emitPenalty not implemented');
  }
}
