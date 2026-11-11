import EventBus from './engine/events/EventBus.js';
import SceneManager from './engine/scenes/SceneManager.js';
import GameState from './engine/state/GameState.js';
import TypewriterIntro from './engine/ui/TypewriterIntro.js';
import PuzzleRuntime from './engine/puzzle-runtime/PuzzleRuntime.js';
import LivesOverlay from './engine/ui/LivesOverlay.js';
import GameOverOverlay from './engine/ui/GameOverOverlay.js';
import RemoteReporter from './reports/RemoteReporter.js';
import { intro } from './campaigns/darkplace/narrative/intro.js';

const eventBus = new EventBus();
const gameState = new GameState(eventBus);

// Forward game events to the local reporting endpoint.
const reporter = new RemoteReporter();
reporter.init(eventBus);

async function main() {
  const bootText = document.querySelector('p');
  if (bootText) {
    bootText.textContent = 'Scaffold ready.';
  }

  const sceneManager = new SceneManager(eventBus, gameState);
  sceneManager.init('game-canvas');
  sceneManager.startRenderLoop();

  const puzzleRuntime = new PuzzleRuntime(eventBus, gameState);
  await puzzleRuntime.init();

  const livesOverlay = new LivesOverlay(eventBus);
  livesOverlay.render();

  // Self-registers its `gameOver` listener on the event bus.
  new GameOverOverlay(eventBus, gameState, () => {
    puzzleRuntime.openPuzzle(puzzleRuntime.getCurrentPuzzleId());
  });

  // Clicking the terminal in the entrance room opens its puzzle.
  eventBus.on('interacted', (payload) => {
    if (payload && payload.puzzleId) {
      puzzleRuntime.openPuzzle(payload.puzzleId);
    }
  });

  const fadeOverlay = sceneManager.fadeOverlay;
  const typewriter = new TypewriterIntro(eventBus);

  typewriter.start(intro).then(() => {
    const bootText = document.querySelector('p');
    if (bootText) {
      bootText.remove();
    }
    fadeOverlay.fadeOut(500).then(() => {
      eventBus.emit('sceneChanged', 'map');

      sceneManager.loadMap();

      return fadeOverlay.fadeIn(500);
    });
  });

  // Exit the library interior back to the map when the exit door is clicked.
  eventBus.on('portalEntered', (payload) => {
    if (payload && payload.target === 'exit') {
      fadeOverlay.fadeOut(500).then(() => {
        sceneManager.loadMap();
        return fadeOverlay.fadeIn(500);
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export { EventBus };
