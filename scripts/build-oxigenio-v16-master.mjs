import { writeFileSync, readFileSync, copyFileSync } from 'node:fs';

const timingData = JSON.parse(readFileSync('src/oxigenioTiming.json', 'utf-8'));

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>E Se a Terra Perdesse o Oxigênio por 5 Segundos?! — 12 Cenários 3D</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Syne:wght@700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-void: #02040a;
      --surface-glass: rgba(7, 12, 26, 0.85);
      --border-light: rgba(255, 255, 255, 0.16);
      --accent-cyan: #00f2fe;
      --accent-gold: #fbbf24;
      --accent-orange: #ff6b00;
      --accent-violet: #a855f7;
      --accent-red: #f43f5e;
      --accent-green: #10b981;
      --text-main: #f8fafc;
      --text-dim: #94a3b8;
      --font-display: 'Syne', sans-serif;
      --font-sans: 'Plus Jakarta Sans', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }

    html, body {
      width: 100%; height: 100%;
      background: radial-gradient(circle at 50% 50%, #061024 0%, #010206 100%);
      color: var(--text-main);
      font-family: var(--font-sans);
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }

    #stage {
      position: relative;
      width: 100%; height: 100%;
      max-width: calc(100vh * 9 / 16);
      max-height: 100vh;
      aspect-ratio: 9 / 16;
      background: #010308;
      overflow: hidden;
      box-shadow: 0 0 90px rgba(0, 242, 254, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    @media (max-aspect-ratio: 9/16) {
      #stage { max-width: 100vw; max-height: calc(100vw * 16 / 9); }
    }

    #webgl-container { position: absolute; inset: 0; z-index: 1; }
    canvas { display: block; width: 100%; height: 100%; outline: none; }

    #flash-overlay {
      position: absolute; inset: 0;
      background: radial-gradient(circle, rgba(180,245,255,0.7) 0%, rgba(244,63,94,0.3) 50%, transparent 80%);
      opacity: 0; pointer-events: none; z-index: 12; mix-blend-mode: screen;
      transition: opacity 0.12s ease-out;
    }

    #transition-overlay {
      position: absolute; inset: 0; z-index: 13; pointer-events: none;
      opacity: 0;
      background: radial-gradient(ellipse at center, rgba(2, 6, 16, 0.05) 0%, rgba(1, 3, 10, 0.45) 100%);
      will-change: opacity;
    }

    #labels-container { position: absolute; inset: 0; pointer-events: none; z-index: 15; overflow: hidden; }

    .float-label {
      position: absolute;
      transform: translate(-50%, -100%);
      display: flex; flex-direction: column; align-items: center;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: left, top, opacity;
    }

    .float-label.visible { opacity: 1; }

    .float-pill {
      padding: 6px 13px; border-radius: 999px;
      font-family: var(--font-sans); font-size: 0.72rem; font-weight: 800;
      letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;
      display: inline-flex; align-items: center; gap: 6px;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.85), 0 0 16px rgba(0,0,0,0.5);
      border: 1.5px solid rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(10px);
    }

    .float-stem { width: 2px; height: 16px; background: currentColor; opacity: 0.9; }
    .float-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; box-shadow: 0 0 10px currentColor; }

    .pill-cyan   { background: rgba(0, 242, 254, 0.22); color: #00f2fe; border-color: rgba(0, 242, 254, 0.85); text-shadow: 0 0 12px rgba(0,242,254,0.8); }
    .pill-gold   { background: rgba(251, 191, 36, 0.22); color: #fbbf24; border-color: rgba(251, 191, 36, 0.85); text-shadow: 0 0 12px rgba(251,191,36,0.8); }
    .pill-orange { background: rgba(255, 107, 0, 0.22); color: #ff6b00; border-color: rgba(255, 107, 0, 0.85); text-shadow: 0 0 12px rgba(255,107,0,0.8); }
    .pill-red    { background: rgba(244, 63, 94, 0.25); color: #f43f5e; border-color: rgba(244, 63, 94, 0.9); text-shadow: 0 0 12px rgba(244,63,94,0.8); }
    .pill-violet { background: rgba(168, 85, 247, 0.25); color: #c084fc; border-color: rgba(168, 85, 247, 0.85); text-shadow: 0 0 12px rgba(168,85,247,0.8); }
    .pill-green  { background: rgba(16, 185, 129, 0.22); color: #10b981; border-color: rgba(16, 185, 129, 0.85); text-shadow: 0 0 12px rgba(16,185,129,0.8); }

    /* HUD ELEGANTE E MINIMALISTA — SEM LEGENDAS DOM E SEM BARRAS INFERIORES POLUÍDAS */
    #hud {
      position: absolute; inset: 0; pointer-events: none; z-index: 10;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 18px 16px 20px;
    }

    .top-bar { display: flex; flex-direction: column; gap: 8px; }

    .story-progress {
      display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px;
      width: 100%; height: 3.5px;
    }
    .story-seg {
      background: rgba(255, 255, 255, 0.16); border-radius: 2px; overflow: hidden;
      position: relative;
    }
    .story-fill {
      width: 100%; height: 100%; background: var(--accent-cyan);
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.08s linear;
      box-shadow: 0 0 8px var(--accent-cyan);
    }

    .header-row {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--surface-glass);
      border: 1px solid var(--border-light);
      border-radius: 14px; padding: 7px 12px;
      backdrop-filter: blur(14px);
    }

    .phase-badge {
      display: inline-flex; align-items: center; gap: 7px;
      font-family: var(--font-sans); font-size: 0.72rem; font-weight: 800;
      letter-spacing: 0.04em; text-transform: uppercase; color: #fff;
    }
    .phase-dot {
      width: 8px; height: 8px; border-radius: 50%; background: var(--accent-cyan);
      box-shadow: 0 0 10px var(--accent-cyan);
    }

    /* CRONÔMETRO DE CONTAGEM REGRESSIVA VISÍVEL — GERA RETENÇÃO MÁXIMA */
    .timer-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(244, 63, 94, 0.18);
      border: 1px solid rgba(244, 63, 94, 0.45);
      border-radius: 999px; padding: 4px 10px;
      font-family: var(--font-mono); font-size: 0.75rem; font-weight: 800;
      color: #fda4af;
      letter-spacing: 0.04em;
    }
    .timer-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #f43f5e;
      box-shadow: 0 0 8px #f43f5e;
      animation: pulse 1s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* CONTROLE MINIMALISTA DE PLAY/PAUSE (AUTO-HIDE EM CAPTURE-MODE) */
    .play-pill {
      position: absolute; bottom: 18px; right: 16px; pointer-events: auto;
      background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.72rem; font-weight: 800; color: #fff; cursor: pointer;
      backdrop-filter: blur(10px); transition: all 0.2s;
    }
    .play-pill:hover { background: rgba(0, 242, 254, 0.25); border-color: var(--accent-cyan); }

    body.capture-mode .play-pill { display: none !important; }
  </style>

  <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      }
    }
  </script>
</head>
<body>
  <div id="stage">
    <div id="webgl-container"></div>
    <div id="flash-overlay"></div>
    <div id="transition-overlay"></div>

    <!-- PINS FLUTUANTES 3D ANTI-COLISÃO -->
    <div id="labels-container">
      <div id="lbl-primary" class="float-label">
        <div id="lbl-primary-pill" class="float-pill pill-cyan">E SE O OXIGÊNIO SUMISSE?</div>
        <div id="lbl-primary-stem" class="float-stem" style="color: #00f2fe;"></div>
        <div id="lbl-primary-dot" class="float-dot" style="color: #00f2fe;"></div>
      </div>
      <div id="lbl-secondary" class="float-label">
        <div id="lbl-secondary-pill" class="float-pill pill-gold">PERSONAGEM</div>
        <div id="lbl-secondary-stem" class="float-stem" style="color: #fbbf24;"></div>
        <div id="lbl-secondary-dot" class="float-dot" style="color: #fbbf24;"></div>
      </div>
    </div>

    <!-- HUD SUPERIOR LIMPO (ZERO LEGENDAS NO DOM, ZERO BARRAS INFERIORES) -->
    <div id="hud">
      <div class="top-bar">
        <div class="story-progress" id="story-progress"></div>
        <div class="header-row">
          <div class="phase-badge">
            <span class="phase-dot" id="phase-dot"></span>
            <span id="phase-title">1. A PERGUNTA IMPOSSÍVEL</span>
          </div>
          <div class="timer-badge" id="timer-badge">
            <span class="timer-dot"></span>
            <span id="timer-val">05.00s</span>
          </div>
        </div>
      </div>

      <div class="play-pill" id="btn-play">
        <span>▶ Tocar com Áudio</span>
      </div>
    </div>
  </div>

  <!-- ÁUDIO MASTER EMBUTIDO PARA SINCRONIA 100% PERFEITA -->
  <audio id="master-audio" src="output/oxigenio_audio.mp3" preload="auto"></audio>

  <script type="module">
    import * as THREE from 'three';

    const params = new URLSearchParams(window.location.search);
    if (params.get('capture') === '1') {
      document.body.classList.add('capture-mode');
    }

    // =========================================================================
    // 1. TIMING E CONFIGURAÇÃO DOS 12 CENÁRIOS DISTINTOS
    // =========================================================================
    const TOTAL_DURATION = ${timingData.totalDuration};
    const BASE_SCALE = 0.52;

    const BEATS = [
      {
        index: 0,
        id: 'hookScene',
        title: '1. A PERGUNTA IMPOSSÍVEL',
        timer: '05.00s',
        color: '#00f2fe',
        start: ${timingData.beats[0].start},
        end: ${timingData.beats[0].end},
        label1: { text: '🤔 AGUENTA 5 SEGUNDOS?', style: 'pill-cyan', color: '#00f2fe', target: 'head' },
        label2: { text: '☀️ MEIO-DIA ENSOLARADO', style: 'pill-gold', color: '#fbbf24', target: 'sunAnchor' }
      },
      {
        index: 1,
        id: 'skyBlackout',
        title: '2. O CÉU APAGA NO MEIO-DIA',
        timer: '04.90s',
        color: '#38bdf8',
        start: ${timingData.beats[1].start},
        end: ${timingData.beats[1].end},
        label1: { text: '🌌 VÁCUO ESPACIAL ÀS 12H', style: 'pill-cyan', color: '#00f2fe', target: 'skyAnchor' },
        label2: { text: '👀 PUPILAS DILATADAS NO SUSTO', style: 'pill-gold', color: '#fbbf24', target: 'head' }
      },
      {
        index: 2,
        id: 'earPopPressure',
        title: '3. TÍMPANOS EXPLODEM (-21% PRESSÃO)',
        timer: '04.50s',
        color: '#f43f5e',
        start: ${timingData.beats[2].start},
        end: ${timingData.beats[2].end},
        label1: { text: '💥 DESCOMPRESSÃO DE GOLPE', style: 'pill-red', color: '#f43f5e', target: 'head' },
        label2: { text: '🩸 TÍMPANOS ROMPIDOS PELO VÁCUO', style: 'pill-orange', color: '#ff6b00', target: 'chest' }
      },
      {
        index: 3,
        id: 'crumblingConcrete',
        title: '4. CONCRETO VIRA AREIA',
        timer: '03.80s',
        color: '#fbbf24',
        start: ${timingData.beats[3].start},
        end: ${timingData.beats[3].end},
        label1: { text: '🌪️ CONCRETO DESMANCHA (O2 É COLA)', style: 'pill-gold', color: '#fbbf24', target: 'buildingTop' },
        label2: { text: '🏃 SPRINT DESESPERADO NA POEIRA', style: 'pill-red', color: '#f43f5e', target: 'feet' }
      },
      {
        index: 4,
        id: 'deadEnginesFallingPlanes',
        title: '5. MOTORES MORREM & AVIÕES CAEM',
        timer: '03.20s',
        color: '#ff6b00',
        start: ${timingData.beats[4].start},
        end: ${timingData.beats[4].end},
        label1: { text: '✈️ AVIÃO EM PARAFUSO MORTAL', style: 'pill-orange', color: '#ff6b00', target: 'planeAnchor' },
        label2: { text: '🚗 CARROS PARAM NO SECO', style: 'pill-red', color: '#f43f5e', target: 'carAnchor' }
      },
      {
        index: 5,
        id: 'uvRadiationBurn',
        title: '6. SEM OZÔNIO: RADIAÇÃO UV SEVERA',
        timer: '02.50s',
        color: '#a855f7',
        start: ${timingData.beats[5].start},
        end: ${timingData.beats[5].end},
        label1: { text: '🔥 UV ULTRAVIOLETA CRUA', style: 'pill-violet', color: '#a855f7', target: 'sunAnchor' },
        label2: { text: '🛡️ PELE EM CHAMAS INVISÍVEIS', style: 'pill-red', color: '#f43f5e', target: 'chest' }
      },
      {
        index: 6,
        id: 'oceansBoilHydrogen',
        title: '7. OCEANOS VIRAM GÁS HIDROGÊNIO',
        timer: '02.00s',
        color: '#00f2fe',
        start: ${timingData.beats[6].start},
        end: ${timingData.beats[6].end},
        label1: { text: '🌊 MARES VIRAM HIDROGÊNIO GASOSO', style: 'pill-cyan', color: '#00f2fe', target: 'oceanAnchor' },
        label2: { text: '💨 MURALHA DE GÁS NO HORIZONTE', style: 'pill-gold', color: '#fbbf24', target: 'head' }
      },
      {
        index: 7,
        id: 'coldWeldingMetals',
        title: '8. SOLDA A FRIO: METAIS SE FUNDEM',
        timer: '01.50s',
        color: '#38bdf8',
        start: ${timingData.beats[7].start},
        end: ${timingData.beats[7].end},
        label1: { text: '⚡ METAIS COLIDEM E SOLDAM', style: 'pill-cyan', color: '#00f2fe', target: 'metalRailing' },
        label2: { text: '🧤 RECUO BRUSCO DE REFLEXO', style: 'pill-orange', color: '#ff6b00', target: 'hands' }
      },
      {
        index: 8,
        id: 'crustCollapseFissure',
        title: '9. 45% DO SOLO É O2: O CHÃO SOME',
        timer: '01.00s',
        color: '#f43f5e',
        start: ${timingData.beats[8].start},
        end: ${timingData.beats[8].end},
        label1: { text: '🌋 CROSTA SE DESINTEGRA', style: 'pill-red', color: '#f43f5e', target: 'feet' },
        label2: { text: '🔥 FENDA DIRETO PARA O MAGMA', style: 'pill-orange', color: '#ff6b00', target: 'lavaAnchor' }
      },
      {
        index: 9,
        id: 'magmaAbyssFreefall',
        title: '10. QUEDA LIVRE NO ABISMO DE MAGMA',
        timer: '00.50s',
        color: '#ff6b00',
        start: ${timingData.beats[9].start},
        end: ${timingData.beats[9].end},
        label1: { text: '🪂 QUEDA LIVRE A 300 KM/H', style: 'pill-orange', color: '#ff6b00', target: 'head' },
        label2: { text: '🌡️ 2.000°C NO MANTO DA TERRA', style: 'pill-red', color: '#f43f5e', target: 'feet' }
      },
      {
        index: 10,
        id: 'shockwaveReturn',
        title: '11. O RETORNO: ONDA DE CHOQUE SÔNICA',
        timer: '00.00s ⚡',
        color: '#00f2fe',
        start: ${timingData.beats[10].start},
        end: ${timingData.beats[10].end},
        label1: { text: '💥 ONDA DE CHOQUE MONUMENTAL', style: 'pill-cyan', color: '#00f2fe', target: 'shockwave' },
        label2: { text: '🌈 O CÉU VOLTA A SER AZUL!', style: 'pill-green', color: '#10b981', target: 'skyAnchor' }
      },
      {
        index: 11,
        id: 'earthSavedHeroic',
        title: '12. A TERRA SOBREVIVEU!',
        timer: 'SALVO! 🌿',
        color: '#10b981',
        start: ${timingData.beats[11].start},
        end: ${timingData.beats[11].end},
        label1: { text: '😮‍💨 RESPIRAÇÃO DE ALÍVIO (GASP)', style: 'pill-green', color: '#10b981', target: 'head' },
        label2: { text: '💬 VOCÊ AGUENTARIA? COMENTA!', style: 'pill-gold', color: '#fbbf24', target: 'chest' }
      }
    ];

    // =========================================================================
    // 2. ELEMENTOS DE UI E PROGRESSO
    // =========================================================================
    const progressContainer = document.getElementById('story-progress');
    const progressFills = [];
    BEATS.forEach(() => {
      const seg = document.createElement('div');
      seg.className = 'story-seg';
      const fill = document.createElement('div');
      fill.className = 'story-fill';
      seg.appendChild(fill);
      progressContainer.appendChild(seg);
      progressFills.push(fill);
    });

    const phaseTitle = document.getElementById('phase-title');
    const phaseDot = document.getElementById('phase-dot');
    const timerVal = document.getElementById('timer-val');

    const lblPrimary = document.getElementById('lbl-primary');
    const lblPrimaryPill = document.getElementById('lbl-primary-pill');
    const lblPrimaryStem = document.getElementById('lbl-primary-stem');
    const lblPrimaryDot = document.getElementById('lbl-primary-dot');

    const lblSecondary = document.getElementById('lbl-secondary');
    const lblSecondaryPill = document.getElementById('lbl-secondary-pill');
    const lblSecondaryStem = document.getElementById('lbl-secondary-stem');
    const lblSecondaryDot = document.getElementById('lbl-secondary-dot');

    const flashOverlay = document.getElementById('flash-overlay');
    const transitionOverlay = document.getElementById('transition-overlay');

    // =========================================================================
    // 3. CENA THREE.JS, RENDERER E CÂMERA DINÂMICA
    // =========================================================================
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.015);

    const camera = new THREE.PerspectiveCamera(50, 9 / 16, 0.1, 400);
    camera.position.set(0, 1.4, 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(6, 14, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const uvRimLight = new THREE.PointLight(0xa855f7, 0.0, 30);
    uvRimLight.position.set(0, 4, 3);
    scene.add(uvRimLight);

    const lavaLight = new THREE.PointLight(0xff4500, 0.0, 40);
    lavaLight.position.set(0, -2, 0);
    scene.add(lavaLight);

    // =========================================================================
    // 4. TEXTURAS E MATERIAIS PROCEDURAIS RICOS
    // =========================================================================
    function createGlowTexture(cInner, cMid, cOuter) {
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
      const ctx = cv.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      g.addColorStop(0, cInner); g.addColorStop(0.4, cMid); g.addColorStop(1, cOuter);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(cv); tex.needsUpdate = true; return tex;
    }
    const sunGlowTex = createGlowTexture('rgba(255,255,255,1)', 'rgba(255,240,180,0.8)', 'rgba(255,180,50,0)');
    const cyanShockTex = createGlowTexture('rgba(255,255,255,1)', 'rgba(0,242,254,0.8)', 'rgba(2,132,199,0)');
    const redGlowTex = createGlowTexture('rgba(255,255,255,1)', 'rgba(244,63,94,0.8)', 'rgba(159,18,57,0)');

    // =========================================================================
    // 5. PERSONAGEM ANATÔMICO COM ARTICULAÇÃO E EXPRESSÕES
    // =========================================================================
    function buildCharacter() {
      const root = new THREE.Group();

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6d5bc, roughness: 0.65 });
      const clothMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.55 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x331e13, roughness: 0.8 });

      const bodyGroup = new THREE.Group();
      root.add(bodyGroup);

      // Torso
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 12, 16), clothMat);
      torso.position.y = 0.85;
      bodyGroup.add(torso);

      // Pescoço e Cabeça
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.20, 16), skinMat);
      neck.position.y = 1.25;
      bodyGroup.add(neck);

      const headGroup = new THREE.Group();
      headGroup.position.y = 1.55;
      bodyGroup.add(headGroup);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), skinMat);
      head.scale.set(1.0, 1.05, 0.98);
      headGroup.add(head);

      // Cabelo
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.355, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hair.rotation.x = -0.25; hair.position.y = 0.05;
      headGroup.add(hair);

      // Olhos Pixar
      function createEye(sign) {
        const eyeG = new THREE.Group();
        eyeG.position.set(sign * 0.12, 0.04, 0.30);
        const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        sclera.scale.set(1.0, 1.15, 0.5);
        eyeG.add(sclera);
        const irisG = new THREE.Group();
        eyeG.add(irisG);
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 16), new THREE.MeshBasicMaterial({ color: 0x0369a1 }));
        iris.position.z = 0.035; irisG.add(iris);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), new THREE.MeshBasicMaterial({ color: 0x0a0f1d }));
        pupil.position.z = 0.052; irisG.add(pupil);
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), hairMat);
        brow.position.set(0, 0.12, 0.02); eyeG.add(brow);
        return { eyeG, irisG, brow };
      }
      const eyeL = createEye(-1);
      const eyeR = createEye(1);
      headGroup.add(eyeL.eyeG, eyeR.eyeG);

      // Boca
      const mouthSmile = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.018, 8, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0x991b1b }));
      mouthSmile.rotation.x = Math.PI; mouthSmile.position.set(0, -0.13, 0.31);
      headGroup.add(mouthSmile);

      const mouthShock = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), new THREE.MeshBasicMaterial({ color: 0x7f1d1d }));
      mouthShock.scale.set(0.8, 1.3, 0.3); mouthShock.position.set(0, -0.13, 0.31);
      mouthShock.visible = false;
      headGroup.add(mouthShock);

      // Braços Articulados (ombro -> cotovelo -> mão)
      function createArm(sign) {
        const pivot = new THREE.Group();
        pivot.position.set(sign * 0.42, 1.12, 0);
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), clothMat);
        pivot.add(shoulder);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.55, 16), clothMat);
        arm.position.y = -0.28; pivot.add(arm);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), skinMat);
        hand.position.y = -0.62; pivot.add(hand);
        return { pivot, hand };
      }
      const armL = createArm(-1);
      const armR = createArm(1);
      bodyGroup.add(armL.pivot, armR.pivot);

      // Pernas Articuladas
      function createLeg(sign) {
        const pivot = new THREE.Group();
        pivot.position.set(sign * 0.18, 0.55, 0);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.65, 16), darkMat);
        leg.position.y = -0.32; pivot.add(leg);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.28), shoeMat);
        shoe.position.set(0, -0.68, 0.05); pivot.add(shoe);
        return pivot;
      }
      const legL = createLeg(-1);
      const legR = createLeg(1);
      bodyGroup.add(legL, legR);

      // Âncoras 3D para Pins Flutuantes
      const headAnchor = new THREE.Object3D(); headAnchor.position.set(0, 1.95, 0); bodyGroup.add(headAnchor);
      const chestAnchor = new THREE.Object3D(); chestAnchor.position.set(0, 0.95, 0.4); bodyGroup.add(chestAnchor);
      const feetAnchor = new THREE.Object3D(); feetAnchor.position.set(0, -0.2, 0); bodyGroup.add(feetAnchor);
      const handsAnchor = new THREE.Object3D(); handsAnchor.position.set(0.35, 0.8, 0.4); bodyGroup.add(handsAnchor);

      function setExpression(mode) {
        if (mode === 'happy' || mode === 'calm') {
          mouthSmile.visible = true; mouthShock.visible = false;
          eyeL.irisG.scale.set(1, 1, 1); eyeR.irisG.scale.set(1, 1, 1);
          eyeL.brow.rotation.z = 0; eyeR.brow.rotation.z = 0;
        } else if (mode === 'shock' || mode === 'pain') {
          mouthSmile.visible = false; mouthShock.visible = true;
          eyeL.irisG.scale.set(0.65, 0.65, 1); eyeR.irisG.scale.set(0.65, 0.65, 1);
          eyeL.brow.rotation.z = 0.35; eyeR.brow.rotation.z = -0.35;
        }
      }

      return {
        root, bodyGroup, headGroup, armL, armR, legL, legR,
        headAnchor, chestAnchor, feetAnchor, handsAnchor,
        skinMat, clothMat, setExpression
      };
    }

    const char = buildCharacter();
    char.root.scale.setScalar(BASE_SCALE);
    char.root.position.set(0, 0, 0);
    scene.add(char.root);

    // =========================================================================
    // 6. OS 12 CENÁRIOS 3D DISTINTOS
    // =========================================================================

    // CENÁRIO 1: RUA ENSOLARADA COM CASAS E ÁRVORES
    const envStreet = new THREE.Group(); scene.add(envStreet);
    const streetGround = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }));
    streetGround.rotation.x = -Math.PI * 0.5; envStreet.add(streetGround);
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 30), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }));
    sidewalk.position.set(0, 0.075, 0); envStreet.add(sidewalk);

    // Árvores Lowpoly
    for (let i = 0; i < 6; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.2), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      trunk.position.y = 0.6; tree.add(trunk);
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
      foliage.position.y = 1.8; tree.add(foliage);
      tree.position.set((i % 2 === 0 ? -2.2 : 2.2), 0, -4 + i * 2.8);
      envStreet.add(tree);
    }

    // Âncoras do Sol e Céu
    const sunAnchor = new THREE.Object3D(); sunAnchor.position.set(4, 10, 6); scene.add(sunAnchor);
    const skyAnchor = new THREE.Object3D(); skyAnchor.position.set(0, 12, -8); scene.add(skyAnchor);

    // CENÁRIO 2: CÉU ESCURO COM ESTRELAS E SOL INTENSO
    const envStars = new THREE.Group(); scene.add(envStars);
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 1200; i++) {
      starPos.push((Math.random() - 0.5) * 160, Math.random() * 80 + 5, (Math.random() - 0.5) * 160);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.0 }));
    envStars.add(starPoints);

    // Sol Cru do Vácuo
    const rawSunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, color: 0xffffff, transparent: true, opacity: 0.0 }));
    rawSunSprite.scale.set(6, 6, 1); rawSunSprite.position.set(5, 12, -4);
    envStars.add(rawSunSprite);

    // CENÁRIO 3: ONDAS DE CHOQUE DE PRESSÃO NOS TÍMPANOS
    const envEarPressure = new THREE.Group(); scene.add(envEarPressure);
    const shockRings = [];
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3 + i * 0.25, 0.02, 16, 32), new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.0 }));
      ring.position.set(0, 1.5, 0);
      envEarPressure.add(ring);
      shockRings.push(ring);
    }

    // CENÁRIO 4: PRÉDIOS DE CONCRETO ESFARELANDO EM AREIA
    const envCrumble = new THREE.Group(); scene.add(envCrumble);
    const debrisBlocks = [];
    for (let i = 0; i < 40; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.5, 0.3 + Math.random() * 0.4), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }));
      b.position.set((Math.random() - 0.5) * 8, 4 + Math.random() * 8, -2 - Math.random() * 6);
      debrisBlocks.push(b);
      envCrumble.add(b);
    }
    const buildingTop = new THREE.Object3D(); buildingTop.position.set(-2.5, 7, -4); scene.add(buildingTop);

    // CENÁRIO 5: MOTORES MORREM E AVIÃO EM QUEDA LIVRE
    const envPlanes = new THREE.Group(); scene.add(envPlanes);
    const carMesh1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 3.2), new THREE.MeshStandardMaterial({ color: 0xe11d48 }));
    carMesh1.position.set(-2, 0.4, -1); carMesh1.rotation.y = 0.45;
    envPlanes.add(carMesh1);
    const carMesh2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 3.2), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
    carMesh2.position.set(1.8, 0.4, 2); carMesh2.rotation.y = -0.3;
    envPlanes.add(carMesh2);

    const carAnchor = new THREE.Object3D(); carAnchor.position.set(-2, 0.8, -1); scene.add(carAnchor);

    // Modelo de Avião Comercial
    const planeModel = new THREE.Group();
    const planeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.8, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    planeBody.rotation.x = Math.PI * 0.5; planeModel.add(planeBody);
    const planeWing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.8), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    planeModel.add(planeWing);
    planeModel.position.set(2, 14, -8);
    envPlanes.add(planeModel);
    const planeAnchor = new THREE.Object3D(); planeModel.add(planeAnchor);

    // CENÁRIO 6: FEIXES DE RADIAÇÃO UV SEVERA
    const envUV = new THREE.Group(); scene.add(envUV);
    const uvBeams = [];
    for (let i = 0; i < 6; i++) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 16, 12), new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.0 }));
      beam.position.set((i - 2.5) * 1.4, 8, -1);
      beam.rotation.z = (Math.random() - 0.5) * 0.15;
      envUV.add(beam);
      uvBeams.push(beam);
    }

    // CENÁRIO 7: OCEANOS FERVENTES DE GÁS HIDROGÊNIO
    const envOcean = new THREE.Group(); scene.add(envOcean);
    const oceanPlane = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8 }));
    oceanPlane.rotation.x = -Math.PI * 0.5; oceanPlane.position.y = -0.1;
    envOcean.add(oceanPlane);
    const steamClouds = [];
    for (let i = 0; i < 18; i++) {
      const steam = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random() * 1.5, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 }));
      steam.position.set((Math.random() - 0.5) * 20, 2 + Math.random() * 6, -8 - Math.random() * 14);
      envOcean.add(steam);
      steamClouds.push(steam);
    }
    const oceanAnchor = new THREE.Object3D(); oceanAnchor.position.set(0, 1.5, -8); scene.add(oceanAnchor);

    // CENÁRIO 8: SOLDA A FRIO (COLD WELDING) COM FAÍSCAS ELÉTRICAS
    const envWelding = new THREE.Group(); scene.add(envWelding);
    const metalRailing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 }));
    metalRailing.rotation.z = Math.PI * 0.5; metalRailing.position.set(0.6, 0.85, 0.6);
    envWelding.add(metalRailing);
    const sparkSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: cyanShockTex, color: 0x00f2fe, transparent: true, opacity: 0.0 }));
    sparkSprite.scale.set(1.4, 1.4, 1); sparkSprite.position.set(0.6, 0.85, 0.6);
    envWelding.add(sparkSprite);

    // CENÁRIO 9: FENDA TECTÔNICA ABRINDO COM MAGMA DERRETIDO
    const envFissure = new THREE.Group(); scene.add(envFissure);
    const lavaPlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 24), new THREE.MeshBasicMaterial({ color: 0xff3b00 }));
    lavaPlane.rotation.x = -Math.PI * 0.5; lavaPlane.position.y = -1.8;
    envFissure.add(lavaPlane);
    const lavaAnchor = new THREE.Object3D(); lavaAnchor.position.set(0, -1.2, 0); scene.add(lavaAnchor);

    // CENÁRIO 10: QUEDA LIVRE NO ABISMO VERTICAL DE MAGMA
    const envAbyss = new THREE.Group(); scene.add(envAbyss);
    const abyssWallL = new THREE.Mesh(new THREE.BoxGeometry(4, 30, 12), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 }));
    abyssWallL.position.set(-3.8, 0, 0); envAbyss.add(abyssWallL);
    const abyssWallR = new THREE.Mesh(new THREE.BoxGeometry(4, 30, 12), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 }));
    abyssWallR.position.set(3.8, 0, 0); envAbyss.add(abyssWallR);

    // CENÁRIO 11: ONDA DE CHOQUE SÔNICA DO RETORNO DO OXIGÊNIO
    const envShockwave = new THREE.Group(); scene.add(envShockwave);
    const shockSphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.0 }));
    envShockwave.add(shockSphere);
    const shockwaveAnchor = new THREE.Object3D(); shockwaveAnchor.position.set(0, 3, 0); scene.add(shockwaveAnchor);

    // =========================================================================
    // 7. SISTEMA DE ANIMAÇÃO E ATUALIZAÇÃO DETERMINÍSTICA
    // =========================================================================
    const masterAudio = document.getElementById('master-audio');
    let isPlaying = false;
    let simTime = 0.0;
    let lastPerf = performance.now();

    const ANCHORS = {
      head: char.headAnchor,
      chest: char.chestAnchor,
      feet: char.feetAnchor,
      hands: char.handsAnchor,
      sunAnchor,
      skyAnchor,
      buildingTop,
      planeAnchor,
      carAnchor,
      oceanAnchor,
      metalRailing,
      lavaAnchor,
      shockwave: shockwaveAnchor
    };

    function updateLabelPosition(labelEl, anchorObj) {
      if (!anchorObj) { labelEl.classList.remove('visible'); return; }
      const v = new THREE.Vector3();
      anchorObj.getWorldPosition(v);
      v.project(camera);
      if (v.z < -1 || v.z > 1) { labelEl.classList.remove('visible'); return; }
      const x = (v.x * 0.5 + 0.5) * container.clientWidth;
      const y = (-(v.y * 0.5) + 0.5) * container.clientHeight;
      labelEl.style.left = \`\${x}px\`;
      labelEl.style.top = \`\${y}px\`;
      labelEl.classList.add('visible');
    }

    function updateSceneAtTime(t) {
      const clampedT = Math.max(0, Math.min(TOTAL_DURATION, t));

      let activeBeat = BEATS[0];
      for (let i = 0; i < BEATS.length; i++) {
        if (clampedT >= BEATS[i].start && clampedT < BEATS[i].end) {
          activeBeat = BEATS[i];
          break;
        }
        if (i === BEATS.length - 1 && clampedT >= BEATS[i].start) {
          activeBeat = BEATS[i];
        }
      }

      // Atualiza Barras de Progresso dos 12 Atos
      BEATS.forEach((b, i) => {
        if (clampedT >= b.end) progressFills[i].style.transform = 'scaleX(1)';
        else if (clampedT <= b.start) progressFills[i].style.transform = 'scaleX(0)';
        else {
          const frac = (clampedT - b.start) / (b.end - b.start);
          progressFills[i].style.transform = \`scaleX(\${frac})\`;
        }
      });

      // Atualiza Cabeçalho e Contagem Regressiva
      phaseTitle.textContent = activeBeat.title;
      phaseDot.style.background = activeBeat.color;
      phaseDot.style.boxShadow = \`0 0 10px \${activeBeat.color}\`;
      timerVal.textContent = activeBeat.timer;

      // Animação de Mola nos Pins 3D
      lblPrimaryPill.textContent = activeBeat.label1.text;
      lblPrimaryPill.className = \`float-pill \${activeBeat.label1.style}\`;
      lblPrimaryStem.style.color = activeBeat.label1.color;
      lblPrimaryDot.style.color = activeBeat.label1.color;

      lblSecondaryPill.textContent = activeBeat.label2.text;
      lblSecondaryPill.className = \`float-pill \${activeBeat.label2.style}\`;
      lblSecondaryStem.style.color = activeBeat.label2.color;
      lblSecondaryDot.style.color = activeBeat.label2.color;

      updateLabelPosition(lblPrimary, ANCHORS[activeBeat.label1.target]);
      updateLabelPosition(lblSecondary, ANCHORS[activeBeat.label2.target]);

      // INTERPOLAÇÃO ENTRE OS 12 CENÁRIOS
      const idx = activeBeat.index;
      const u = (clampedT - activeBeat.start) / (activeBeat.end - activeBeat.start);

      // RESET DE AMBIENTES
      envStreet.visible = (idx === 0 || idx === 1 || idx === 2 || idx === 3 || idx === 7 || idx === 11);
      envStars.visible = (idx >= 1 && idx <= 10);
      envEarPressure.visible = (idx === 2);
      envCrumble.visible = (idx === 3);
      envPlanes.visible = (idx === 4);
      envUV.visible = (idx === 5);
      envOcean.visible = (idx === 6);
      envWelding.visible = (idx === 7);
      envFissure.visible = (idx === 8);
      envAbyss.visible = (idx === 9);
      envShockwave.visible = (idx === 10);

      // CENÁRIO 1: RUA TRANQUILA & SORRISO
      if (idx === 0) {
        scene.background.setHex(0x38bdf8);
        scene.fog.color.setHex(0x38bdf8);
        char.setExpression('happy');
        char.root.position.set(0, 0, 0);
        char.headGroup.rotation.set(Math.sin(clampedT * 2) * 0.05, Math.cos(clampedT * 1.5) * 0.06, 0);
        char.armL.pivot.rotation.set(0, 0, -0.15 + Math.sin(clampedT * 2) * 0.05);
        char.armR.pivot.rotation.set(0, 0, 0.15 - Math.sin(clampedT * 2) * 0.05);
        camera.position.set(0, 1.3, 4.5);
        camera.lookAt(0, 1.0, 0);
      }
      // CENÁRIO 2: CÉU APAGA NO MEIO-DIA (VÁCUO TOTAL)
      else if (idx === 1) {
        const bgCol = new THREE.Color(0x38bdf8).lerp(new THREE.Color(0x02040a), Math.min(1, u * 3));
        scene.background.copy(bgCol);
        scene.fog.color.copy(bgCol);
        starPoints.material.opacity = Math.min(0.9, u * 1.5);
        rawSunSprite.material.opacity = Math.min(0.95, u * 2);
        char.setExpression('shock');
        char.headGroup.rotation.x = -0.55; // Olhando direto para cima assustado
        char.armL.pivot.rotation.set(0.3, 0, -0.4);
        char.armR.pivot.rotation.set(0.3, 0, 0.4);
        camera.position.set(0, 0.9, 3.2); // Low-angle dramático
        camera.lookAt(0, 1.4, 0);
      }
      // CENÁRIO 3: TÍMPANOS EXPLODEM (DESCOMPRESSÃO)
      else if (idx === 2) {
        scene.background.setHex(0x02040a);
        scene.fog.color.setHex(0x02040a);
        char.setExpression('pain');
        // Ajoelhando de dor
        char.root.position.y = -0.35 * Math.min(1, u * 3);
        char.headGroup.rotation.set(0.2, Math.sin(clampedT * 15) * 0.08, 0); // Tremor de agonia
        // Mãos tampando as orelhas
        char.armL.pivot.rotation.set(0.5, 0.2, -1.8);
        char.armR.pivot.rotation.set(0.5, -0.2, 1.8);
        shockRings.forEach((r, ri) => {
          const rScale = 1.0 + ((clampedT * 4 + ri * 0.8) % 3.0);
          r.scale.setScalar(rScale);
          r.material.opacity = Math.max(0, 1 - rScale / 3.0);
        });
        camera.position.set(0, 1.2, 2.6);
        camera.lookAt(0, 1.0, 0);
      }
      // CENÁRIO 4: CONCRETO VIRA PÓ & SPRINT
      else if (idx === 3) {
        char.setExpression('shock');
        char.root.position.y = 0;
        // Corrida desesperada
        const runCycle = clampedT * 12;
        char.legL.rotation.x = Math.sin(runCycle) * 0.75;
        char.legR.rotation.x = -Math.sin(runCycle) * 0.75;
        char.armL.pivot.rotation.set(-Math.sin(runCycle) * 0.8, 0, -0.2);
        char.armR.pivot.rotation.set(Math.sin(runCycle) * 0.8, 0, 0.2);
        debrisBlocks.forEach((b, bi) => {
          b.position.y = 12 - ((clampedT * 8 + bi * 1.5) % 12);
          b.rotation.x += 0.05; b.rotation.y += 0.08;
        });
        camera.position.set(1.8, 1.2, 3.8); // Câmera lateral acompanhando sprint
        camera.lookAt(0, 0.8, 0);
      }
      // CENÁRIO 5: MOTORES MORREM & AVIÃO EM PARAFUSO
      else if (idx === 4) {
        char.setExpression('shock');
        char.armL.pivot.rotation.set(0.8, 0.3, -0.3); // Apontando pro céu
        char.armR.pivot.rotation.set(1.2, -0.4, 0.5); // Protegendo a cabeça
        // Avião descendo em parafuso
        planeModel.position.set(2 - u * 3, 14 - u * 12, -8 + u * 2);
        planeModel.rotation.z += 0.08;
        planeModel.rotation.x = 0.55;
        camera.position.set(0, 2.0, 5.5);
        camera.lookAt(0, 3.0, -4);
      }
      // CENÁRIO 6: SEM OZÔNIO (RADIAÇÃO UV)
      else if (idx === 5) {
        uvRimLight.intensity = 2.5;
        char.setExpression('pain');
        char.armR.pivot.rotation.set(1.4, 0.5, 0.2); // Braço cobrindo rosto da luz solar
        char.armL.pivot.rotation.set(-0.3, 0, -0.4);
        char.headGroup.rotation.set(-0.2, 0.3, 0);
        uvBeams.forEach(b => {
          b.material.opacity = 0.45 + Math.sin(clampedT * 20) * 0.15;
        });
        camera.position.set(-1.2, 1.4, 3.2); // Dutch angle inclinado
        camera.rotation.z = 0.15;
        camera.lookAt(0, 1.0, 0);
      }
      // CENÁRIO 7: OCEANOS FERVENTES DE HIDROGÊNIO
      else if (idx === 6) {
        uvRimLight.intensity = 0.0;
        char.setExpression('shock');
        // Vento forte empurrando pra trás
        char.root.rotation.x = -0.25;
        char.armL.pivot.rotation.set(-0.6, 0, -0.5);
        char.armR.pivot.rotation.set(-0.6, 0, 0.5);
        steamClouds.forEach((s, si) => {
          s.position.y = 1 + ((clampedT * 4 + si * 1.2) % 14);
          s.material.opacity = Math.max(0, 0.6 - s.position.y / 14);
        });
        camera.position.set(0, 1.6, 5.8);
        camera.lookAt(0, 1.2, -3);
      }
      // CENÁRIO 8: SOLDA A FRIO EM METAIS
      else if (idx === 7) {
        char.root.rotation.x = 0;
        char.setExpression('shock');
        // Recuo de mão das faíscas
        char.armR.pivot.rotation.set(0.6, -0.4, 0.6);
        char.armL.pivot.rotation.set(0.1, 0, -0.2);
        sparkSprite.material.opacity = Math.sin(clampedT * 35) > 0 ? 0.9 : 0.0;
        camera.position.set(1.2, 1.2, 2.8);
        camera.lookAt(0.6, 0.85, 0.6);
      }
      // CENÁRIO 9: CHÃO TECTÔNICO SE ABRE
      else if (idx === 8) {
        lavaLight.intensity = 3.5;
        char.setExpression('pain');
        // Perda de equilíbrio na fenda
        char.root.position.y = -0.4 * u;
        char.root.rotation.z = Math.sin(clampedT * 8) * 0.18;
        char.armL.pivot.rotation.set(0.8, 0, -1.2);
        char.armR.pivot.rotation.set(0.8, 0, 1.2);
        camera.position.set(0, 0.8, 3.4);
        camera.lookAt(0, -0.5, 0);
      }
      // CENÁRIO 10: QUEDA LIVRE NO ABISMO DE MAGMA
      else if (idx === 9) {
        lavaLight.intensity = 4.0;
        char.setExpression('shock');
        // Pose de skydive em queda livre
        char.bodyGroup.rotation.x = Math.PI * 0.45;
        char.armL.pivot.rotation.set(0.3, 0, -1.4);
        char.armR.pivot.rotation.set(0.3, 0, 1.4);
        char.legL.rotation.set(-0.3, 0, -0.3);
        char.legR.rotation.set(-0.3, 0, 0.3);
        camera.position.set(0, 3.2, 3.0); // Câmera mergulhando acompanhando queda
        camera.lookAt(0, 0, 0);
      }
      // CENÁRIO 11: O RETORNO! ONDA DE CHOQUE SÔNICA DE PLASMA
      else if (idx === 10) {
        lavaLight.intensity = 0.0;
        const shockR = u * 24.0;
        shockSphere.scale.setScalar(shockR);
        shockSphere.material.opacity = Math.max(0, 0.8 - u);
        const skyCol = new THREE.Color(0x02040a).lerp(new THREE.Color(0x38bdf8), Math.min(1, u * 1.5));
        scene.background.copy(skyCol);
        scene.fog.color.copy(skyCol);
        char.bodyGroup.rotation.x = 0;
        char.setExpression('shock');
        char.armL.pivot.rotation.set(0.4, 0, -0.8);
        char.armR.pivot.rotation.set(0.4, 0, 0.8);
        camera.position.set(0, 1.5, 4.2);
        camera.lookAt(0, 1.0, 0);
      }
      // CENÁRIO 12: A TERRA SOBREVIVEU! (HEROIC GASP & CTA)
      else if (idx === 11) {
        scene.background.setHex(0x38bdf8);
        scene.fog.color.setHex(0x38bdf8);
        char.setExpression('happy');
        char.root.position.set(0, 0, 0);
        // Respiração profunda e aliviada (peito inflando)
        const breathe = 1.0 + Math.sin(clampedT * 4) * 0.08;
        char.bodyGroup.scale.set(breathe, breathe, breathe);
        char.armL.pivot.rotation.set(0, 0, -0.2);
        char.armR.pivot.rotation.set(0.8, -0.4, 0.5); // Polegar para cima / mão no peito
        camera.position.set(0, 1.2, 3.0);
        camera.lookAt(0, 1.1, 0);
      }

      renderer.render(scene, camera);
    }

    // =========================================================================
    // 8. CONTROLE DE REPRODUÇÃO E CAPTURA HEADLESS DETERMINÍSTICA
    // =========================================================================
    const btnPlay = document.getElementById('btn-play');
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        btnPlay.innerHTML = '<span>⏸ Pausar</span>';
        masterAudio.currentTime = Math.min(simTime, TOTAL_DURATION - 0.1);
        masterAudio.play().catch(() => {});
      } else {
        btnPlay.innerHTML = '<span>▶ Tocar com Áudio</span>';
        masterAudio.pause();
      }
    });

    // Clicar no palco também alterna play/pause
    document.getElementById('stage').addEventListener('click', (e) => {
      if (e.target.closest('#btn-play')) return;
      btnPlay.click();
    });

    function animLoop(now) {
      requestAnimationFrame(animLoop);
      if (isPlaying) {
        const dt = Math.min(0.1, (now - lastPerf) / 1000);
        simTime += dt;
        if (simTime >= TOTAL_DURATION) {
          simTime = TOTAL_DURATION; // Pausa elegante no final, SEM CORTES ABRUPTOS!
          isPlaying = false;
          btnPlay.innerHTML = '<span>↺ Rever Simulação</span>';
        }
        updateSceneAtTime(simTime);
      }
      lastPerf = now;
    }
    requestAnimationFrame(animLoop);

    // FUNÇÃO DETERMINÍSTICA PARA O CAPTURADOR HEADLESS DUAL-GPU
    window.renderDeterministicFrame = function(t) {
      isPlaying = false;
      simTime = Number(t) || 0;
      updateSceneAtTime(simTime);
    };

    window.getTotalDuration = () => TOTAL_DURATION;

    // Inicializa no frame zero
    updateSceneAtTime(0);
  </script>
</body>
</html>
`;

writeFileSync('oxigenio-5-segundos-3d.html', htmlContent, 'utf-8');
console.log('✅ Arquivo oxigenio-5-segundos-3d.html gerado com sucesso!');

const downloadsTarget = 'C:/Users/Ruan Gomes/Downloads/e_se_a_terra_perdesse_o_oxigenio_por_5_segundos_3d.html';
try {
  copyFileSync('oxigenio-5-segundos-3d.html', downloadsTarget);
  console.log(`✅ Cópia para visualização direta salva em: ${downloadsTarget}`);
} catch (e) {
  console.warn('Aviso ao copiar para Downloads:', e.message);
}
