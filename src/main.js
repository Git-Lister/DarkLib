import EventBus from '../events/EventBus.js';
import GameState from '../state/GameState.js';

/**
 * Entry point for the DarkLib scaffold.
 * Replaces the boot text once the DOM is ready. Does not instantiate Three.js.
 */
function main() {
  const bootText = document.querySelector('p');
  if (bootText) {
    bootText.textContent = 'Scaffold ready.';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export { EventBus, GameState };
