import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventBus from '../src/engine/events/EventBus.js';
import RemoteReporter from '../src/reports/RemoteReporter.js';

const ENDPOINT = 'http://localhost:8787/events';

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

  it('defaults the endpoint to http://localhost:8787/events', () => {
    reporter.init();
    expect(reporter.endpoint).toBe(ENDPOINT);
  });

  it('stores a custom endpoint URL', () => {
    reporter.init('http://example.com/events');
    expect(reporter.endpoint).toBe('http://example.com/events');
  });

  it('posts nodeArrived with timestamp and playerId', async () => {
    reporter.init(ENDPOINT);
    reporter.start(eventBus);

    eventBus.emit('nodeArrived', { nodeId: 'library' });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({
      event: 'nodeArrived',
      payload: { nodeId: 'library' },
      timestamp: expect.any(Number),
      playerId: 'guest'
    });
  });

  it('posts puzzleSolved with the puzzle id', async () => {
    reporter.init(ENDPOINT);
    reporter.start(eventBus);

    eventBus.emit('puzzleSolved', { puzzleId: 'library-card-catalogue' });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      event: 'puzzleSolved',
      payload: { puzzleId: 'library-card-catalogue' },
      timestamp: expect.any(Number),
      playerId: 'guest'
    });
  });

  it('posts puzzleFailed with puzzle id and fail text', async () => {
    reporter.init(ENDPOINT);
    reporter.start(eventBus);

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
      },
      timestamp: expect.any(Number),
      playerId: 'guest'
    });
  });

  it('posts gameOver with a null payload', async () => {
    reporter.init(ENDPOINT);
    reporter.start(eventBus);

    eventBus.emit('gameOver', null);

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      event: 'gameOver',
      payload: null,
      timestamp: expect.any(Number),
      playerId: 'guest'
    });
  });

  it('logs a warning and does not break the game when the network fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    reporter.init(ENDPOINT);
    reporter.start(eventBus);
    eventBus.emit('nodeArrived', { nodeId: 'library' });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalled();
    // The event bus is still wired up, so the game keeps running.
    expect(eventBus.listeners.size).toBeGreaterThan(0);
  });
});
