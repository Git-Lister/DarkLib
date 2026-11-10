import { describe, it, expect } from 'vitest';
import EventBus from '../src/engine/events/EventBus.js';

describe('EventBus', () => {
  it('registers and triggers a handler', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test-event', handler);
    bus.emit('test-event', { payload: true });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ payload: true });
  });

  it('removes a handler with off', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test-event', handler);
    bus.off('test-event', handler);
    bus.emit('test-event', { payload: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not affect other events when removing a handler', () => {
    const bus = new EventBus();
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    bus.on('event-a', handlerA);
    bus.on('event-b', handlerB);
    bus.off('event-a', handlerA);
    bus.emit('event-a', null);
    bus.emit('event-b', null);
    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalledTimes(1);
  });
});
