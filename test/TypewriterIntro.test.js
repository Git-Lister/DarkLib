import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TypewriterIntro from '../src/engine/ui/TypewriterIntro.js';
import EventBus from '../src/engine/events/EventBus.js';

describe('TypewriterIntro', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    document.body.innerHTML = '<div id="ui-root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('start() returns a promise that skip() resolves immediately', async () => {
    const intro = new TypewriterIntro(eventBus);
    let resolved = false;

    const promise = intro.start('Hello world', { interval: 1000 });
    promise.then(() => {
      resolved = true;
    });

    await intro.skip();
    expect(resolved).toBe(true);
  });

  it('skip() removes the element from the DOM', async () => {
    const intro = new TypewriterIntro(eventBus);

    intro.start('Hello world', { interval: 1000 });
    await intro.skip();

    const el = document.querySelector('.typewriter-intro');
    expect(el).toBeNull();
  });

  it('emits introCompleted via EventBus on skip', async () => {
    const intro = new TypewriterIntro(eventBus);
    const handler = vi.fn();
    eventBus.on('introCompleted', handler);

    intro.start('Hello world', { interval: 1000 });
    await intro.skip();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emits introCompleted when typing completes naturally', async () => {
    const intro = new TypewriterIntro(eventBus);
    const handler = vi.fn();
    eventBus.on('introCompleted', handler);

    await intro.start('Hi', { interval: 5 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.typewriter-intro')).toBeNull();
  });
});
