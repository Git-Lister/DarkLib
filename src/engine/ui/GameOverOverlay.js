/**
 * GameOverOverlay is shown when lives reach 0. It offers a retry that restores
 * lives and reopens the current puzzle while keeping solved puzzles.
 */
export default class GameOverOverlay {
  /**
   * Shows the game-over overlay.
   * @returns {void}
   */
  show() {
    throw new Error('GameOverOverlay.show not implemented');
  }

  /**
   * Hides the game-over overlay.
   * @returns {void}
   */
  hide() {
    throw new Error('GameOverOverlay.hide not implemented');
  }

  /**
   * Handles retry: restores lives and reopens the current puzzle.
   * @returns {void}
   */
  retry() {
    throw new Error('GameOverOverlay.retry not implemented');
  }
}
