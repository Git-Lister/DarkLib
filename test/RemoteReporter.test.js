import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventBus from '../src/engine/events/EventBus.js';
import RemoteReporter from '../src/reports/RemoteReporter.js';

describe('RemoteReporter', () => {
  let eventBus;
  let reporter;
  let fetchMock;

  beforeEach(() => {
    eventBus = new EventBus();
    reporter = new RemoteReporter();
    fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 200 })));
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('subscribes to nodeArrived and posts the payload', async () => {
    reporter.init(eventBus);

    eventBus.emit('nodeArrived', { nodeId: 'library' });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3000/events');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({
      event: 'nodeArrived',
      payload: { nodeId: 'library' }
    });
  });

  it('posts puzzleSolved with the puzzle id', async () => {
    reporter.init(eventBus);

    eventBus.emit('puzzleSolved', { puzzleId: 'library-card-catalogue' });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      event: 'puzzleSolved',
      payload: { puzzleId: 'library-card-catalogue' }
    });
  });

  it('posts puzzleFailed with puzzle id and fail text', async () => {
    reporter.init(eventBus);

    eventBus.emit('puzzleFailed', {
      puzzleId: 'library-card-catalogue',
      failText: 'The drawer jams harder.'
    });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      event: 'puzzleFailed',
      payload: {
        puzzleId: 'library-card-catalogue',
        failText: 'The drawer jams harder.'
      }
    });
  });

  it('posts gameOver with a null payload', async () => {
    reporter.init(eventBus);

    eventBus.emit('gameOver', null);

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      event: 'gameOver',
      payload: null
    });
  });

  it('does not break the game when the network fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    reporter.init(eventBus);
    eventBus.emit('nodeArrived', { nodeId: 'library' });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
    expect(eventBus.listeners.size).toBeGreaterThan(0);
  });

  it('does not post when endpoint is not configured', async () => {
    const unconfigured = new RemoteReporter();
    const postSpy = vi.spyOn(unconfigured, 'postEvent');

    // init is what sets the endpoint; without it, nothing is subscribed, so
    // emitting events does nothing.
    eventBus.emit('nodeArrived', { nodeId: 'library' });

    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(postSpy).not.toHaveBeenCalled();
  });
});
