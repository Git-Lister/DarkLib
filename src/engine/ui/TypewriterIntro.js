/**
 * TypewriterIntro renders the HTML typewriter intro overlay: monospace text
 * revealed at a character interval, skippable on click or key.
 */
export default class TypewriterIntro {
  /**
   * Starts the typewriter intro.
   * @param {string} text
   * @param {{interval?: number, container?: HTMLElement}} [options]
   * @returns {Promise<void>}
   */
  start(text, options = {}) {
    throw new Error('TypewriterIntro.start not implemented');
  }

  /**
   * Skips the intro and resolves immediately.
   * @returns {void}
   */
  skip() {
    throw new Error('TypewriterIntro.skip not implemented');
  }
}
