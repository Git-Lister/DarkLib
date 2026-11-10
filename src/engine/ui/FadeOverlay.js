/**
 * FadeOverlay performs 300ms black overlay fade transitions between scenes.
 */
export default class FadeOverlay {
  /**
   * Fades the overlay in over 300ms.
   * @returns {Promise<void>}
   */
  fadeIn() {
    throw new Error('FadeOverlay.fadeIn not implemented');
  }

  /**
   * Fades the overlay out over 300ms.
   * @returns {Promise<void>}
   */
  fadeOut() {
    throw new Error('FadeOverlay.fadeOut not implemented');
  }
}
