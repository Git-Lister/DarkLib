/**
 * EventBus is a minimal publish/subscribe bus used by DarkLib modules to
 * communicate without direct dependencies. Handlers receive the event payload.
 *
 * @template {string} TEvent
 * @typedef {(payload: any) => void} Handler
 */

/**
 * @typedef {Map<string, Set<Handler>>} ListenerMap
 */
export default class EventBus {
  constructor() {
    /** @type {ListenerMap} */
    this.listeners = new Map();
  }

  /**
   * Registers a handler for an event.
   * @param {TEvent} event
   * @param {Handler} handler
   * @returns {void}
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
  }

  /**
   * Removes a previously registered handler for an event.
   * @param {TEvent} event
   * @param {Handler} handler
   * @returns {void}
   */
  off(event, handler) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Synchronously invokes all handlers registered for an event.
   * @param {TEvent} event
   * @param {any} payload
   * @returns {void}
   */
  emit(event, payload) {
    const set = this.listeners.get(event);
    if (set) {
      for (const handler of set) {
        handler(payload);
      }
    }
  }
}
