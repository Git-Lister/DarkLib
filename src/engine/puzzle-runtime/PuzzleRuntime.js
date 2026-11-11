/**
 * PuzzleRuntime loads puzzle definitions, presents them through a modal, and
 * validates the player's answer, applying penalties where configured.
 */
import PuzzleLoader from './PuzzleLoader.js';
import PuzzleModal from '../ui/PuzzleModal.js';

/**
 * @typedef {import('../events/EventBus.js').default} EventBus
 * @typedef {import('../state/GameState.js').default} GameState
 */

export default class PuzzleRuntime {
  /**
   * @param {EventBus} eventBus
   * @param {GameState} gameState
   */
  constructor(eventBus, gameState) {
    /** @type {EventBus} */
    this.eventBus = eventBus;
    /** @type {GameState} */
    this.gameState = gameState;
    /** @type {Object<string, Object>} */
    this.puzzles = {};
    /** @type {string|null} */
    this.currentPuzzleId = null;
    this.loader = new PuzzleLoader();
    this.modal = new PuzzleModal(eventBus);
    this.modal.onSubmit = (answer) => {
      if (this.currentPuzzleId) {
        this.submitAnswer(this.currentPuzzleId, answer);
      }
    };
  }

  /**
   * Loads all puzzle definitions from YAML.
   * @returns {Promise<void>}
   */
  async init() {
    this.puzzles = await this.loader.loadPuzzles();
  }

  /**
   * Returns the id of the puzzle currently open, or null.
   * @returns {string|null}
   */
  getCurrentPuzzleId() {
    return this.currentPuzzleId;
  }

  /**
   * Opens a puzzle by id: emits puzzleOpened (which the UI listens to) and
   * shows the puzzle modal.
   * @param {string} puzzleId
   * @returns {void}
   */
  openPuzzle(puzzleId) {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle) {
      return;
    }
    this.currentPuzzleId = puzzleId;
    this.eventBus.emit('puzzleOpened', puzzle);
    this.modal.open(puzzle);
  }

  /**
   * Validates the player's answer against the puzzle's validation rules
   * (exact match or regex) and applies the outcome.
   * @param {string} puzzleId
   * @param {any} answer
   * @returns {void}
   */
  submitAnswer(puzzleId, answer) {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle) return;

    const validation = puzzle.validation || {};
    let correct = false;
    if (validation.type === 'regex') {
      correct = new RegExp(validation.pattern).test(String(answer));
    } else {
      correct = String(answer).trim() === String(validation.answer).trim();
    }

    if (correct) {
      this.gameState.markSolved(puzzleId); // emits puzzleSolved
      this.modal.close();
      return;
    }

    if (validation.penalty === true) {
      this.gameState.decrementLives(); // emits livesChanged, possibly gameOver
    }
    this.eventBus.emit('puzzleFailed', {
      puzzleId,
      failText: puzzle.failText ?? null,
    });
  }
}
