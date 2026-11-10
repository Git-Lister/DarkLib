/**
 * LivesOverlay displays the player's remaining lives and updates in response
 * to livesChanged events.
 */
export default class LivesOverlay {
  constructor() {
    /** @type {number} */
    this.lives = 3;
  }

  /**
   * Renders the lives overlay into the UI root.
   * @returns {void}
   */
  render() {
    throw new Error('LivesOverlay.render not implemented');
  }

  /**
   * Updates the displayed lives count.
   * @param {number} lives
   * @returns {void}
   */
  update(lives) {
    throw new Error('LivesOverlay.update not implemented');
  }
}
