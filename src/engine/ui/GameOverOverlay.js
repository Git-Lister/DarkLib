/**
 * GameOverOverlay is shown when lives reach 0. It offers a retry that restores
 * lives and reopens the current puzzle while keeping solved puzzles.
 */

/**
 * @typedef {import('../events/EventBus.js').default} EventBus
 * @typedef {import('../state/GameState.js').default} GameState
 */

export default class GameOverOverlay {
  /**
   * @param {EventBus} eventBus
   * @param {GameState} gameState
   * @param {() => void} onRetry
   */
  constructor(eventBus, gameState, onRetry) {
    /** @type {EventBus} */
    this.eventBus = eventBus;
    /** @type {GameState} */
    this.gameState = gameState;
    /** @type {() => void|null} */
    this.onRetry = onRetry ?? null;
    /** @type {HTMLElement|null} */
    this.element = null;
    this._onGameOver = this._onGameOver.bind(this);
    this._onRetryClick = this._onRetryClick.bind(this);
    this.eventBus.on('gameOver', this._onGameOver);
  }

  _onGameOver() {
    this.show();
  }

  /**
   * Shows the game-over overlay.
   * @returns {void}
   */
  show() {
    this.hide();

    const root = document.getElementById('ui-root') || document.body;
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.inset = '0';
    element.style.background = '#000000';
    element.style.color = '#b00020';
    element.style.display = 'flex';
    element.style.flexDirection = 'column';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.zIndex = '200';
    element.style.pointerEvents = 'auto';
    element.style.fontFamily = 'Courier New, Courier, monospace';
    element.style.fontSize = '32px';

    const title = document.createElement('div');
    title.textContent = 'SYSTEM FAILURE';
    title.style.marginBottom = '24px';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'RETRY';
    button.style.padding = '12px 28px';
    button.style.font = 'inherit';
    button.style.cursor = 'pointer';
    button.style.background = '#000000';
    button.style.color = '#b00020';
    button.style.border = '2px solid #b00020';
    button.addEventListener('click', this._onRetryClick);

    element.appendChild(title);
    element.appendChild(button);
    root.appendChild(element);

    this.element = element;
  }

  /**
   * Hides the game-over overlay.
   * @returns {void}
   */
  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  /**
   * Handles retry: restores lives, hides the overlay, and reopens the current
   * puzzle.
   * @returns {void}
   */
  retry() {
    this._onRetryClick();
  }

  _onRetryClick() {
    this.gameState.resetLives();
    this.hide();
    if (this.onRetry) {
      this.onRetry();
    }
  }
}
