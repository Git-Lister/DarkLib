/**
 * RemoteReporter posts game events to a serverless endpoint using a shared
 * token. No external server or Google login is required.
 */
export default class RemoteReporter {
  constructor() {
    /** @type {string|null} */
    this.endpoint = null;
    /** @type {string|null} */
    this.token = null;
  }

  /**
   * Configures the reporting endpoint and auth token.
   * @param {string} endpoint
   * @param {string} token
   * @returns {void}
   */
  configure(endpoint, token) {
    throw new Error('RemoteReporter.configure not implemented');
  }

  /**
   * Posts a single event to the endpoint.
   * @param {Object} event
   * @returns {Promise<void>}
   */
  postEvent(event) {
    throw new Error('RemoteReporter.postEvent not implemented');
  }
}
