/**
 * Operation: Rescue Motku - Main Entry Point
 * Initializes GameEngine, UIManager, and runs the high-performance animation loop.
 */

import { GameEngine } from './game/gameEngine.js';
import { UIManager } from './ui/uiManager.js';
import { soundManager } from './audio/soundManager.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  const ui = new UIManager(game);
  game.setUIManager(ui);

  // Play intro ambient melody on first user interaction
  const initAudioOnFirstGesture = () => {
    soundManager.init();
    soundManager.startBgm('intro');
    window.removeEventListener('pointerdown', initAudioOnFirstGesture);
    window.removeEventListener('keydown', initAudioOnFirstGesture);
  };
  window.addEventListener('pointerdown', initAudioOnFirstGesture);
  window.addEventListener('keydown', initAudioOnFirstGesture);

  // Game Animation Loop
  let lastTime = performance.now();

  function animate(currentTime) {
    requestAnimationFrame(animate);

    const delta = Math.min((currentTime - lastTime) / 1000, 0.1); // Clamp delta to avoid huge spikes
    lastTime = currentTime;

    game.update(delta);
    game.render();
  }

  requestAnimationFrame(animate);
});
