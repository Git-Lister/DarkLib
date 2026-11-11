/**
 * LivesOverlay displays the player's remaining lives and updates in response
 * to livesChanged events.
 */

/**
 * @typedef {import('../events/EventBus.js').default} EventBus
 */

export default class LivesOverlay {
  /**
   * @param {EventBus} eventBus
   */
  constructor(eventBus) {
    /** @type {EventBus} */
    this.eventBus = eventBus;
    /** @type {number} */
    this.lives = 3;
    /** @type {HTMLElement|null} */
    this.element = null;
    this._onLivesChanged = this._onLivesChanged.bind(this);
  }

  /**
   * Renders the lives overlay into the UI root.
   * @returns {void}
   */
  render() {
    const root = document.getElementById('ui-root') || document.body;
    const element = document.createElement('div');
    element.id = 'lives-overlay';
    element.style.position = 'fixed';
    element.style.top = '16px';
    element.style.right = '16px';
    element.style.zIndex = '100';
    element.style.pointerEvents = 'none';
    element.style.color = '#e0e0e0';
    element.style.fontFamily = 'Courier New, Courier, monospace';
    element.style.fontSize = '16px';
    element.textContent = this._formatLives(this.lives);
    root.appendChild(element);
    this.element = element;
    this.eventBus.on('livesChanged', this._onLivesChanged);
  }

  /**
   * Updates the displayed lives count.
   * @param {number} lives
   * @returns {void}
   */
  update(lives) {
    this.lives = Math.max(0, lives);
    if (this.element) {
      this.element.textContent = this._formatLives(this.lives);
    }
  }

  _onLivesChanged(payload) {
    if (payload && typeof payload.lives === 'number') {
      this.update(payload.lives);
    }
  }

  _formatLives(lives) {
    return `LIVES: ${'♥'.repeat(Math.max(0, lives))}`;
  }
}
