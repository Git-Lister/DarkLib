import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventBus from '../src/engine/events/EventBus.js';
import GameState from '../src/engine/state/GameState.js';

describe('GameState', () => {
  let eventBus;
  let gameState;

  beforeEach(() => {
    eventBus = new EventBus();
    gameState = new GameState(eventBus, { initialLives: 3, maxLives: 3 });
  });

  it('starts with the configured initial lives', () => {
    expect(gameState.getLives()).toBe(3);
  });

  it('decrementLives decrements lives and emits livesChanged', () => {
    const handler = vi.fn();
    eventBus.on('livesChanged', handler);

    gameState.decrementLives();

    expect(gameState.getLives()).toBe(2);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ lives: 2 });
  });

  it('decrementLives triggers gameOver when lives reach 0', () => {
    const gameOverHandler = vi.fn();
    const livesHandler = vi.fn();
    eventBus.on('gameOver', gameOverHandler);
    eventBus.on('livesChanged', livesHandler);

    gameState.decrementLives();
    gameState.decrementLives();
    gameState.decrementLives();

    expect(gameState.getLives()).toBe(0);
    expect(gameOverHandler).toHaveBeenCalledTimes(1);
    expect(livesHandler).toHaveBeenCalledTimes(3);
  });

  it('does not emit gameOver more than once at zero lives', () => {
    const handler = vi.fn();
    eventBus.on('gameOver', handler);

    gameState.decrementLives();
    gameState.decrementLives();
    gameState.decrementLives();
    gameState.decrementLives(); // clamped at 0 by setLives

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('resetLives restores lives and emits livesChanged', () => {
    const handler = vi.fn();
    eventBus.on('livesChanged', handler);

    gameState.decrementLives();
    gameState.decrementLives();
    gameState.resetLives();

    expect(gameState.getLives()).toBe(3);
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('inventory is reactive via inventoryChanged', () => {
    const handler = vi.fn();
    eventBus.on('inventoryChanged', handler);

    expect(gameState.hasItem('library-card')).toBe(false);

    gameState.addToInventory('library-card');

    expect(gameState.hasItem('library-card')).toBe(true);
    expect(gameState.getInventory()).toEqual(['library-card']);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      inventory: ['library-card'],
      item: 'library-card',
    });

    gameState.addToInventory('library-card'); // duplicate, no change
    expect(handler).toHaveBeenCalledTimes(1);

    gameState.removeFromInventory('library-card');

    expect(gameState.hasItem('library-card')).toBe(false);
    expect(gameState.getInventory()).toEqual([]);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
