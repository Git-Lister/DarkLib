/**
 * RemoteReporter posts game events to a local reporting endpoint. It subscribes
 * to domain events on the event bus and forwards them as JSON via fetch.
 * Network failures are logged and never break the game.
 */

/**
 * @typedef {import('../events/EventBus.js').default} EventBus
 */

const DEFAULT_ENDPOINT = 'http://localhost:8787/events';

export default class RemoteReporter {
  constructor() {
    /** @type {string|null} */
    this.endpoint = null;
    /** @type {EventBus|null} */
    this.eventBus = null;
  }

  /**
   * Configures the reporting endpoint.
   * @param {string} [url] - Endpoint URL. Defaults to `http://localhost:8787/events`.
   * @returns {void}
   */
  init(url) {
    this.endpoint = url ?? DEFAULT_ENDPOINT;
  }

  /**
   * Subscribes to game events and forwards them to the reporting endpoint.
   * @param {EventBus} eventBus
   * @returns {void}
   */
  start(eventBus) {
    if (!eventBus) {
      return;
    }
    this.eventBus = eventBus;

    const report = (eventName) => (payload) => {
      this.postEvent({ event: eventName, payload });
    };

    this.eventBus.on('nodeArrived', report('nodeArrived'));
    this.eventBus.on('puzzleSolved', report('puzzleSolved'));
    this.eventBus.on('puzzleFailed', report('puzzleFailed'));
    this.eventBus.on('gameOver', report('gameOver'));
  }

  /**
   * Posts a single event to the endpoint. Network errors are logged as a
   * warning and swallowed so the game keeps running.
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
        body: JSON.stringify({
          event: event.event,
          payload: event.payload,
          timestamp: Date.now(),
          playerId: 'guest'
        })
      });
    } catch (error) {
      // Network errors must not break the game.
      console.warn('RemoteReporter: failed to post event', error);
    }
  }
}
