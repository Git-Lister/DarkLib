/**
 * TypewriterIntro renders a monospace typewriter effect in an HTML overlay.
 * Text is typed character by character and can be skipped via click, Enter,
 * or Space. When typing completes (or is skipped), it emits `introCompleted`
 * via the EventBus and removes its DOM elements.
 */
export default class TypewriterIntro {
  /**
   * @param {import('../events/EventBus.js').default} eventBus
   */
  constructor(eventBus) {
    this.eventBus = eventBus;
    /** @type {HTMLElement|null} */
    this.element = null;
    /** @type {number|null} */
    this.timer = null;
    /** @type {Function|null} */
    this.resolveFn = null;
    /** @type {Promise<void>|null} */
    this.promise = null;
    /** @type {string} */
    this.fullText = '';
    /** @type {Function|null} */
    this.boundSkip = null;
    /** @type {Function|null} */
    this.boundKeyDown = null;
  }

  /**
   * Start typing the given text into a new div inside #ui-root.
   * @param {string} text
   * @param {{interval?: number}} [options]
   * @returns {Promise<void>} Resolves when typing completes or is skipped.
   */
  start(text, options = {}) {
    const interval = options.interval ?? 30;

    this.cleanup();

    this.fullText = text;

    this.element = document.createElement('div');
    this.element.className = 'typewriter-intro';
    this.element.style.fontFamily = 'monospace';
    this.element.style.whiteSpace = 'pre-wrap';

    const root = document.getElementById('ui-root');
    if (root) {
      root.appendChild(this.element);
    } else {
      document.body.appendChild(this.element);
    }

    this.boundSkip = () => this.skip();
    this.boundKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        this.skip();
      }
    };
    document.addEventListener('click', this.boundSkip);
    document.addEventListener('keydown', this.boundKeyDown);

    this.promise = new Promise((resolve) => {
      this.resolveFn = resolve;
    });

    let i = 0;
    const type = () => {
      if (i >= this.fullText.length) {
        this.complete();
        return;
      }
      if (this.element) {
        this.element.textContent += this.fullText[i];
      }
      i++;
      this.timer = setTimeout(type, interval);
    };

    type();

    return this.promise;
  }

  /**
   * Instantly complete the displayed text and resolve the start() promise.
   * @returns {void}
   */
  skip() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.element) {
      this.element.textContent = this.fullText;
    }
    this.complete();
  }

  /**
   * Finalise the intro: remove listeners, emit introCompleted, resolve the
   * promise, and remove the DOM element.
   * @returns {void}
   */
  complete() {
    document.removeEventListener('click', this.boundSkip);
    document.removeEventListener('keydown', this.boundKeyDown);

    if (this.eventBus) {
      this.eventBus.emit('introCompleted');
    }

    if (this.resolveFn) {
      this.resolveFn();
      this.resolveFn = null;
    }

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  /**
   * Remove the DOM element and clear any pending timer without resolving.
   * @returns {void}
   */
  cleanup() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
