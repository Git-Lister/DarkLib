/**
 * RemoteReporter posts game events to a local reporting endpoint. It subscribes
 * to domain events on the event bus and forwards them as JSON via fetch.
 * Network failures are logged and never break the game.
 */

/**
 * @typedef {import('../events/EventBus.js').default} EventBus
 */

const ENDPOINT = 'http://localhost:3000/events';

export default class RemoteReporter {
  constructor() {
    /** @type {string|null} */
    this.endpoint = null;
    /** @type {string|null} */
    this.token = null;
    /** @type {EventBus|null} */
    this.eventBus = null;
  }

  /**
   * Configures the reporting endpoint and auth token.
   * @param {string} endpoint
   * @param {string} token
   * @returns {void}
   */
  configure(endpoint, token) {
    this.endpoint = endpoint;
    this.token = token;
  }

  /**
   * Subscribes to game events and forwards them to the reporting endpoint.
   * @param {EventBus} eventBus
   * @returns {void}
   */
  init(eventBus) {
    this.eventBus = eventBus;
    this.endpoint = ENDPOINT;

    const report = (eventName) => (payload) => {
      this.postEvent({ event: eventName, payload });
    };

    this.eventBus.on('nodeArrived', report('nodeArrived'));
    this.eventBus.on('puzzleSolved', report('puzzleSolved'));
    this.eventBus.on('puzzleFailed', report('puzzleFailed'));
    this.eventBus.on('gameOver', report('gameOver'));
  }

  /**
   * Posts a single event to the endpoint. Network errors are logged to the
   * console and swallowed so the game keeps running.
   * @param {Object} event
   * @returns {Promise<void>}
   */
  async postEvent(event) {
    if (!this.endpoint) {
      return;
    }
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Network errors must not break the game.
      console.error('RemoteReporter: failed to post event', error);
    }
  }
}
