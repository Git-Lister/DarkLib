import EventBus from './engine/events/EventBus.js';
import SceneManager from './engine/scenes/SceneManager.js';
import FadeOverlay from './engine/ui/FadeOverlay.js';
import TypewriterIntro from './engine/ui/TypewriterIntro.js';
import { intro } from './campaigns/darkplace/narrative/intro.js';

const eventBus = new EventBus();

function main() {
  const bootText = document.querySelector('p');
  if (bootText) {
    bootText.textContent = 'Scaffold ready.';
  }

  const sceneManager = new SceneManager();
  sceneManager.init('game-canvas');
  sceneManager.startRenderLoop();

  const fadeOverlay = new FadeOverlay();
  const typewriter = new TypewriterIntro(eventBus);

  typewriter.start(intro).then(() => {
    fadeOverlay.fadeOut(500).then(() => {
      eventBus.emit('sceneChanged', 'map');

      console.log('Map loading placeholder...');

      const bt = document.querySelector('p');
      if (bt) {
        bt.textContent = 'Map ready';
      }

      return fadeOverlay.fadeIn(500);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export { EventBus };
