import { SchrodingerExplainerEngine, SCHRODINGER_CONFIG } from './schrodingerExplainerEngine.js';

const container = document.getElementById('video-container');
const engine = new SchrodingerExplainerEngine(container);

// Exporta sob todas as convenções para compatibilidade total com Puppeteer / CDP / Headless
window.engine = engine;
window.__engine = engine;
window.schrodingerEngine = engine;
window.seekToScene = (idx) => engine.seekToScene(idx);

// Em modo de captura ou headless, remove compulsoriamente nós de interface
if (new URLSearchParams(window.location.search).has('capture') || window.location.hash.includes('capture')) {
  document.querySelectorAll('#controls, #time-display, #scene-label, button').forEach(el => el.remove());
}

const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const timeDisplay = document.getElementById('time-display');
const sceneLabel = document.getElementById('scene-label');

let isPlaying = false;
let animFrameId = null;
let lastTime = performance.now();

function animate(now) {
  if (isPlaying) {
    const dt = (now - lastTime) / 1000;
    engine.time += dt;
    if (engine.time >= SCHRODINGER_CONFIG.duration) {
      engine.time = SCHRODINGER_CONFIG.duration;
      isPlaying = false;
      if (btnPlay) btnPlay.textContent = '▶ Replay';
    }
    const currentFrame = Math.floor(engine.time * SCHRODINGER_CONFIG.fps);
    engine.renderFrame(currentFrame, SCHRODINGER_CONFIG.fps);

    if (timeDisplay) {
      timeDisplay.textContent = `${engine.time.toFixed(1)}s / ${SCHRODINGER_CONFIG.duration}s`;
    }
    if (sceneLabel) {
      sceneLabel.textContent = `Cena ${engine.currentSceneIndex + 1}`;
    }
  }
  lastTime = now;
  animFrameId = requestAnimationFrame(animate);
}

if (btnPlay) {
  btnPlay.addEventListener('click', () => {
    if (engine.time >= SCHRODINGER_CONFIG.duration) engine.time = 0;
    isPlaying = true;
    lastTime = performance.now();
  });
}
if (btnPause) {
  btnPause.addEventListener('click', () => {
    isPlaying = false;
  });
}
if (btnReset) {
  btnReset.addEventListener('click', () => {
    isPlaying = false;
    engine.time = 0;
    engine.renderFrame(0, SCHRODINGER_CONFIG.fps);
    if (timeDisplay) {
      timeDisplay.textContent = `0.0s / ${SCHRODINGER_CONFIG.duration}s`;
    }
    if (btnPlay) btnPlay.textContent = '▶ Iniciar';
  });
}

if (container) {
  container.style.cursor = 'pointer';
  container.addEventListener('click', () => {
    if (isPlaying) {
      isPlaying = false;
    } else {
      if (engine.time >= SCHRODINGER_CONFIG.duration) engine.time = 0;
      isPlaying = true;
      lastTime = performance.now();
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (isPlaying) {
      isPlaying = false;
    } else {
      if (engine.time >= SCHRODINGER_CONFIG.duration) engine.time = 0;
      isPlaying = true;
      lastTime = performance.now();
    }
  } else if (e.code === 'KeyR') {
    isPlaying = false;
    engine.time = 0;
    engine.renderFrame(0, SCHRODINGER_CONFIG.fps);
  }
});

// Inicia no frame 0
engine.renderFrame(0, SCHRODINGER_CONFIG.fps);
animFrameId = requestAnimationFrame(animate);
