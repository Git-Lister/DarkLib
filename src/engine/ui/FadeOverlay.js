/**
 * FadeOverlay is a fixed black HTML overlay used for scene transitions.
 * fadeOut(ms) makes the overlay opaque (fading the scene out);
 * fadeIn(ms) makes it transparent (fading the scene in).
 */
export default class FadeOverlay {
  constructor() {
    /** @type {HTMLElement|null} */
    this.element = null;
    this.createElement();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'fade-overlay';
    this.element.style.position = 'fixed';
    this.element.style.top = '0';
    this.element.style.left = '0';
    this.element.style.width = '100%';
    this.element.style.height = '100%';
    this.element.style.backgroundColor = '#000000';
    this.element.style.opacity = '0';
    this.element.style.transition = 'opacity 300ms ease';
    this.element.style.zIndex = '9999';
    this.element.style.pointerEvents = 'none';

    const root = document.getElementById('ui-root');
    if (root) {
      root.appendChild(this.element);
    } else {
      document.body.appendChild(this.element);
    }
  }

  /**
   * Fade the overlay out (make it opaque) over ms milliseconds.
   * Resolves when the transition completes.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  fadeOut(ms) {
    return this.setOpacity(1, ms);
  }

  /**
   * Fade the overlay in (make it transparent) over ms milliseconds.
   * Resolves when the transition completes.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  fadeIn(ms) {
    return this.setOpacity(0, ms);
  }

  /**
   * Transition the overlay opacity to a target value over ms milliseconds.
   * @param {number} target
   * @param {number} ms
   * @returns {Promise<void>}
   */
  setOpacity(target, ms) {
    return new Promise((resolve) => {
      if (!this.element) {
        resolve();
        return;
      }

      this.element.style.transition = `opacity ${ms}ms ease`;
      this.element.style.opacity = String(target);

      const handler = () => {
        this.element.removeEventListener('transitionend', handler);
        clearTimeout(timeout);
        resolve();
      };

      const timeout = setTimeout(handler, ms + 50);
      this.element.addEventListener('transitionend', handler);
    });
  }
}
