import { writeFileSync, readFileSync, copyFileSync } from 'node:fs';

const timingData = JSON.parse(readFileSync('src/buracoTiming.json', 'utf-8'));

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>O Que Acontece Dentro de um Buraco Negro? — Gargantua 3D Cinemático (12 Cenários)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Syne:wght@700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-void: #020308;
      --surface-glass: rgba(8, 11, 24, 0.84);
      --border-light: rgba(255, 255, 255, 0.14);
      --accent-orange: #ff6b00;
      --accent-gold: #fbbf24;
      --accent-cyan: #00f2fe;
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
      background: radial-gradient(circle at 50% 50%, #070a18 0%, #010206 100%);
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
      background: #010206;
      overflow: hidden;
      box-shadow: 0 0 90px rgba(255, 107, 0, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    @media (max-aspect-ratio: 9/16) {
      #stage { max-width: 100vw; max-height: calc(100vw * 16 / 9); }
    }

    #webgl-container { position: absolute; inset: 0; z-index: 1; }
    canvas { display: block; width: 100%; height: 100%; outline: none; }

    #flash-overlay {
      position: absolute; inset: 0;
      background: radial-gradient(circle, rgba(255,235,180,0.65) 0%, rgba(0,242,254,0.28) 45%, transparent 80%);
      opacity: 0; pointer-events: none; z-index: 12; mix-blend-mode: screen;
    }

    #transition-overlay {
      position: absolute; inset: 0; z-index: 13; pointer-events: none;
      opacity: 0;
      background: radial-gradient(ellipse at center, rgba(2, 4, 12, 0.08) 0%, rgba(1, 2, 8, 0.42) 100%);
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

    .pill-orange { background: linear-gradient(135deg, #ff6b00, #ea580c); color: #ffffff; }
    .pill-gold   { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #090d16; }
    .pill-cyan   { background: linear-gradient(135deg, #00f2fe, #0284c7); color: #041019; }
    .pill-red    { background: linear-gradient(135deg, #f43f5e, #e11d48); color: #ffffff; }
    .pill-violet { background: linear-gradient(135deg, #a855f7, #7e22ce); color: #ffffff; }
    .pill-green  { background: linear-gradient(135deg, #10b981, #059669); color: #03150e; }

    #hud {
      position: absolute; inset: 0; z-index: 20; pointer-events: none;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 14px 14px 18px 14px;
    }

    .top-bar { display: flex; flex-direction: column; gap: 8px; }

    .story-progress { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; width: 100%; }
    .story-seg { height: 4px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); overflow: hidden; }
    .story-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent-orange), var(--accent-gold), var(--accent-cyan)); border-radius: 999px; }

    .header-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }

    .phase-badge {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 5px 12px; border-radius: 999px;
      background: var(--surface-glass); border: 1px solid rgba(255, 145, 0, 0.35);
      backdrop-filter: blur(14px);
      font-size: 0.68rem; font-weight: 800; letter-spacing: 0.06em;
      text-transform: uppercase; color: #fff;
    }

    .phase-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent-orange); box-shadow: 0 0 10px var(--accent-orange);
    }

    .step-counter {
      padding: 5px 10px; border-radius: 999px;
      background: var(--surface-glass); border: 1px solid var(--border-light);
      font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: var(--accent-gold);
    }

    .bottom-bar { display: flex; flex-direction: column; gap: 10px; pointer-events: auto; }

    .subtitle-card {
      background: rgba(6, 9, 20, 0.90);
      border: 1px solid rgba(255, 145, 0, 0.32);
      border-radius: 18px; padding: 14px 16px;
      backdrop-filter: blur(20px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);
      min-height: 76px; display: flex; align-items: center; justify-content: center; text-align: center;
    }

    #subtitle-text {
      font-size: clamp(0.92rem, 2.5vw, 1.06rem);
      font-weight: 700; line-height: 1.38; color: #ffffff;
    }

    .hl {
      display: inline-block; padding: 1px 8px; border-radius: 6px;
      font-weight: 800; margin: 0 2px;
    }
    .hl-orange { background: var(--accent-orange); color: #ffffff; }
    .hl-gold   { background: var(--accent-gold); color: #090d16; }
    .hl-cyan   { background: var(--accent-cyan); color: #041019; }
    .hl-red    { background: var(--accent-red); color: #ffffff; }
    .hl-violet { background: var(--accent-violet); color: #ffffff; }
    .hl-green  { background: var(--accent-green); color: #03150e; }

    .controls-row {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      background: rgba(7, 10, 22, 0.85); border: 1px solid var(--border-light);
      border-radius: 14px; padding: 7px 10px; backdrop-filter: blur(16px);
    }

    .ctrl-btn {
      appearance: none; border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.07); color: #fff;
      border-radius: 9px; padding: 6px 11px;
      font-family: var(--font-sans); font-size: 0.72rem; font-weight: 800;
      cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
    }
    .ctrl-btn.primary {
      background: linear-gradient(135deg, var(--accent-orange), #e11d48);
      border-color: transparent;
    }

    .time-readout {
      font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--text-dim);
    }

    body.capture-mode .controls-row { display: none !important; }
    body.capture-mode #hud { padding-bottom: 24px; }
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
    <div id="labels-container">
      <div id="lbl-primary" class="float-label">
        <div id="lbl-primary-pill" class="float-pill pill-orange">BURACO NEGRO</div>
        <div id="lbl-primary-stem" class="float-stem" style="color: #ff6b00;"></div>
        <div id="lbl-primary-dot" class="float-dot" style="color: #ff6b00;"></div>
      </div>
      <div id="lbl-secondary" class="float-label">
        <div id="lbl-secondary-pill" class="float-pill pill-cyan">ASTRONAUTA</div>
        <div id="lbl-secondary-stem" class="float-stem" style="color: #00f2fe;"></div>
        <div id="lbl-secondary-dot" class="float-dot" style="color: #00f2fe;"></div>
      </div>
    </div>

    <div id="hud">
      <div class="top-bar">
        <div class="story-progress" id="story-progress"></div>
        <div class="header-row">
          <div class="phase-badge">
            <span class="phase-dot" id="phase-dot"></span>
            <span id="phase-title">1. CABINE DA ORION VII</span>
          </div>
          <div class="step-counter" id="step-counter">1/12</div>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="subtitle-card">
          <p id="subtitle-text">Iniciando simulação astrofísica Gargantua...</p>
        </div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="btn-play">⏸ Pausar</button>
          <button class="ctrl-btn" id="btn-prev">⏮ Ato</button>
          <button class="ctrl-btn" id="btn-next">⏭ Ato</button>
          <button class="ctrl-btn" id="btn-restart">↺ Replay</button>
          <span class="time-readout" id="time-readout">00.0s / 81.0s</span>
        </div>
      </div>
    </div>
  </div>

  <script type="module">
    import * as THREE from 'three';

    const params = new URLSearchParams(window.location.search);
    if (params.get('capture') === '1') {
      document.body.classList.add('capture-mode');
    }

    // =========================================================================
    // 1. TIMING & 12 ATOS COM 12 CENÁRIOS DIFERENTES (81.0 SEGUNDOS)
    // =========================================================================
    const TOTAL_DURATION = ${timingData.totalDuration};
    const BASE_ASTRO_SCALE = 0.48;

    const BEATS = [
      {
        index: 0,
        id: 'missionStart',
        title: '1. CABINE DA ORION VII',
        color: '#00f2fe',
        start: ${timingData.beats[0].start},
        end: ${timingData.beats[0].end},
        subtitle: 'Imagine que você está em uma <span class="hl hl-cyan">MISSÃO ESPACIAL</span> tranquila, quando sua nave encontra um <span class="hl hl-orange">BURACO NEGRO</span>!',
        label1: { text: '🪟 VISOR: GARGANTUA À VISTA!', style: 'pill-gold', color: '#fbbf24', target: 'cockpitWindow' },
        label2: { text: '👨‍🚀 PILOTO NA CABINE', style: 'pill-cyan', color: '#00f2fe', target: 'astroHead' }
      },
      {
        index: 1,
        id: 'shipTear',
        title: '2. EJEÇÃO & NAVE RASGADA',
        color: '#ff6b00',
        start: ${timingData.beats[1].start},
        end: ${timingData.beats[1].end},
        subtitle: 'A gravidade esmagadora <span class="hl hl-red">ARRANCA OS PAINÉIS</span> da sua nave e puxa você para um vórtice que <span class="hl hl-gold">CURVA A LUZ</span>!',
        label1: { text: '💥 PAINÉIS ARRANCADOS!', style: 'pill-red', color: '#f43f5e', target: 'ship' },
        label2: { text: '🔥 EJEÇÃO DE EMERGÊNCIA!', style: 'pill-orange', color: '#ff6b00', target: 'astroChest' }
      },
      {
        index: 2,
        id: 'photonMirror',
        title: '3. TÚNEL DE FÓTONS 360°',
        color: '#fbbf24',
        start: ${timingData.beats[2].start},
        end: ${timingData.beats[2].end},
        subtitle: 'A luz é tão curvada na <span class="hl hl-gold">ESFERA DE FÓTONS</span> que, olhando para frente, você vê a <span class="hl hl-cyan">SUA PRÓPRIA NUCA</span>!',
        label1: { text: '💫 LUZ CURVADA EM 360°', style: 'pill-gold', color: '#fbbf24', target: 'cloneHead' },
        label2: { text: '👀 VENDO AS PRÓPRIAS COSTAS!', style: 'pill-cyan', color: '#00f2fe', target: 'astroHead' }
      },
      {
        index: 3,
        id: 'planetDestruction',
        title: '4. CATACLISMO PLANETÁRIO',
        color: '#f97316',
        start: ${timingData.beats[3].start},
        end: ${timingData.beats[3].end},
        subtitle: 'Ao seu lado, um <span class="hl hl-orange">PLANETA INTEIRO</span> é despedaçado como areia, alimentando um <span class="hl hl-red">DISCO DE PLASMA</span>!',
        label1: { text: '🌋 PLANETA SENDO RASGADO!', style: 'pill-orange', color: '#ff6b00', target: 'planet' },
        label2: { text: '☄️ RIO DE MAGMA INCANDESCENTE', style: 'pill-gold', color: '#fbbf24', target: 'astroHead' }
      },
      {
        index: 4,
        id: 'timeClocks',
        title: '5. OBSERVATÓRIO DO TEMPO',
        color: '#10b981',
        start: ${timingData.beats[4].start},
        end: ${timingData.beats[4].end},
        subtitle: 'O espaço-tempo afunda tanto que o <span class="hl hl-cyan">TEMPO QUASE PARA</span>: 1 segundo seu vale <span class="hl hl-gold">MIL ANOS NA TERRA</span>!',
        label1: { text: '⏱️ SEU RELÓGIO: +1 SEGUNDO', style: 'pill-cyan', color: '#00f2fe', target: 'clockLeft' },
        label2: { text: '🌍 TERRA: +1.000 ANOS!', style: 'pill-green', color: '#10b981', target: 'clockRight' }
      },
      {
        index: 5,
        id: 'redshiftFreeze',
        title: '6. ONDAS DE REDSHIFT',
        color: '#f43f5e',
        start: ${timingData.beats[5].start},
        end: ${timingData.beats[5].end},
        subtitle: 'Para quem observa de longe, sua imagem fica <span class="hl hl-red">VERMELHA E CONGELADA</span> na borda, como uma <span class="hl hl-gold">ESTÁTUA ETERNA</span>!',
        label1: { text: '👻 ESTÁTUA ÓPTICA CONGELADA', style: 'pill-red', color: '#f43f5e', target: 'ghostHead' },
        label2: { text: '〰️ LUZ ESTICADA PRO VERMELHO', style: 'pill-orange', color: '#ff6b00', target: 'astroHead' }
      },
      {
        index: 6,
        id: 'feetPull',
        title: '7. POÇO DE VETORES G',
        color: '#ef4444',
        start: ${timingData.beats[6].start},
        end: ${timingData.beats[6].end},
        subtitle: 'Mas para você a queda continua! Como seus <span class="hl hl-red">PÉS ESTÃO MAIS PERTO</span> do centro, a gravidade puxa suas botas com <span class="hl hl-gold">FORÇA BRUTAL</span>!',
        label1: { text: '⚡ GRAVIDADE 1.000.000x MAIOR!', style: 'pill-red', color: '#f43f5e', target: 'astroFeet' },
        label2: { text: '😱 TRAÇÃO EXTREMA NAS BOTAS', style: 'pill-gold', color: '#fbbf24', target: 'astroHead' }
      },
      {
        index: 7,
        id: 'spaghettiStretch',
        title: '8. CÂNION DE ESPAGUETIFICAÇÃO',
        color: '#f97316',
        start: ${timingData.beats[7].start},
        end: ${timingData.beats[7].end},
        subtitle: 'A diferença de gravidade é de bilhões de vezes: seu corpo e a nave sofrem a <span class="hl hl-orange">ESPAGUETIFICAÇÃO</span>!',
        label1: { text: '🍝 ESTICADO COMO ESPAGUETE!', style: 'pill-orange', color: '#ff6b00', target: 'astroChest' },
        label2: { text: '💥 COMPRESSÃO LATERAL!', style: 'pill-cyan', color: '#00f2fe', target: 'astroFeet' }
      },
      {
        index: 8,
        id: 'eventHorizonCross',
        title: '9. MERGULHO A 300.000 KM/S',
        color: '#a855f7',
        start: ${timingData.beats[8].start},
        end: ${timingData.beats[8].end},
        subtitle: 'Você cruza o <span class="hl hl-violet">HORIZONTE DE EVENTOS</span>! A velocidade de escape supera os <span class="hl hl-cyan">300.000 KM/S DA LUZ</span>!',
        label1: { text: '🚫 CRUZANDO O HORIZONTE!', style: 'pill-violet', color: '#a855f7', target: 'cockpitWindow' },
        label2: { text: '⚡ DOBRA ESPACIAL > 300.000 KM/S', style: 'pill-cyan', color: '#00f2fe', target: 'astroHead' }
      },
      {
        index: 9,
        id: 'topDownXray',
        title: '10. GARGANTA RAIO-X TOP-DOWN',
        color: '#00f2fe',
        start: ${timingData.beats[9].start},
        end: ${timingData.beats[9].end},
        subtitle: 'Lá dentro, <span class="hl hl-cyan">ESPAÇO E TEMPO</span> trocam de papel: fugir é tão impossível quanto <span class="hl hl-violet">VOLTAR AO ONTEM</span>!',
        label1: { text: '🔮 FUNIL DO ESPAÇO-TEMPO (RAIO-X)', style: 'pill-cyan', color: '#00f2fe', target: 'funnelRim' },
        label2: { text: '⏳ QUEDA INEVITÁVEL PRO FUTURO', style: 'pill-gold', color: '#fbbf24', target: 'astroHead' }
      },
      {
        index: 10,
        id: 'tesseractWormhole',
        title: '11. DIMENSÃO TESSERACT 4D',
        color: '#eab308',
        start: ${timingData.beats[10].start},
        end: ${timingData.beats[10].end},
        subtitle: 'No centro está a <span class="hl hl-violet">SINGULARIDADE</span>! Mas e se um <span class="hl hl-cyan">BURACO DE MINHOCA</span> te ejetasse no cosmos?',
        label1: { text: '⚛️ HIPERCUBO QUÂNTICO 4D', style: 'pill-gold', color: '#fbbf24', target: 'tesseractTop' },
        label2: { text: '🌀 TÚNEL DE EINSTEIN-ROSEN!', style: 'pill-cyan', color: '#00f2fe', target: 'astroFeet' }
      },
      {
        index: 11,
        id: 'futureEarthReturn',
        title: '12. TERRA NO ANO 3.002.026',
        color: '#10b981',
        start: ${timingData.beats[11].start},
        end: ${timingData.beats[11].end},
        subtitle: 'Você voltaria intacto, mas <span class="hl hl-green">MILHÕES DE ANOS NO FUTURO</span>! Você teria coragem de <span class="hl hl-gold">PULAR NESSE ABISMO</span>?',
        label1: { text: '🌍 TERRA NO ANO 3.002.026!', style: 'pill-cyan', color: '#00f2fe', target: 'earthTop' },
        label2: { text: '👋 VIAJANTE DO FUTURO!', style: 'pill-green', color: '#10b981', target: 'astroHead' }
      }
    ];

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

    // =========================================================================
    // 2. HELPERS DE TEXTURAS PROCEDURAIS (ZERO QUADRADOS PIXELADOS)
    // =========================================================================
    function createRadialGlowTexture(innerColor, midColor, outerColor) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0.0, innerColor);
      grad.addColorStop(0.35, midColor);
      grad.addColorStop(0.7, outerColor);
      grad.addColorStop(1.0, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    function createEarthTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const ocean = ctx.createLinearGradient(0, 0, 0, 256);
      ocean.addColorStop(0, '#072a6c');
      ocean.addColorStop(0.5, '#0284c7');
      ocean.addColorStop(1, '#072a6c');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = '#10b981';
      const blobs = [
        [110, 80, 55, 38], [145, 155, 42, 62], [260, 75, 65, 42],
        [275, 145, 48, 52], [375, 90, 72, 48], [415, 180, 38, 28]
      ];
      blobs.forEach(([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0.25, 0, Math.PI * 2);
        ctx.fill();
      });

      // Luzes douradas de megacidades futuristas na Terra do ano 3.002.026
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 2;
      blobs.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.ellipse((i * 43) % 480 + 16, (i * 29) % 210 + 22, 34, 9, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    function createLavaPlanetTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#260b07';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 6;
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.moveTo((i * 37) % 256, (i * 53) % 256);
        ctx.lineTo(((i + 3) * 61) % 256, ((i + 5) * 41) % 256);
        ctx.stroke();
      }
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.arc((i * 47) % 240 + 8, (i * 31) % 240 + 8, 16, 0, Math.PI * 1.4);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    // =========================================================================
    // 3. CENA THREE.JS, CÂMERA E ILUMINAÇÃO CALIBRADA (CINEMA DARK CONTRAST)
    // =========================================================================
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);
    scene.fog = new THREE.FogExp2(0x020308, 0.015);

    const camera = new THREE.PerspectiveCamera(50, 9 / 16, 0.1, 250);
    camera.position.set(0, 1.4, 11.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.76);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.28);
    dirLight.position.set(5, 9, 10);
    scene.add(dirLight);

    const coreLight = new THREE.PointLight(0xff7722, 1.15, 28);
    coreLight.position.set(0, 0.5, 0.5);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rimLight.position.set(-7, -4, 5);
    scene.add(rimLight);

    // =========================================================================
    // 4. BURACO NEGRO GARGANTUA (MOVIMENTA-SE E MUDA DE PERSPECTIVA POR ATO!)
    // =========================================================================
    const gargantuaGroup = new THREE.Group();
    scene.add(gargantuaGroup);

    const ehGeo = new THREE.SphereGeometry(2.38, 64, 64);
    const ehMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 1.0
    });
    const eventHorizon = new THREE.Mesh(ehGeo, ehMat);
    gargantuaGroup.add(eventHorizon);

    const photonRingGeo = new THREE.TorusGeometry(2.46, 0.055, 24, 128);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.92
    });
    const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    gargantuaGroup.add(photonRing);

    function createAccretionDiskTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      const cx = 512, cy = 512;

      const grad = ctx.createRadialGradient(cx, cy, 130, cx, cy, 500);
      grad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.05, 'rgba(255, 230, 150, 0.95)');
      grad.addColorStop(0.16, 'rgba(255, 140, 20, 0.90)');
      grad.addColorStop(0.38, 'rgba(220, 55, 10, 0.72)');
      grad.addColorStop(0.65, 'rgba(120, 18, 5, 0.42)');
      grad.addColorStop(0.88, 'rgba(45, 5, 15, 0.15)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 140; i++) {
        const r = 148 + Math.random() * 320;
        const startAngle = Math.random() * Math.PI * 2;
        const arcLen = 0.3 + Math.random() * 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + arcLen);
        ctx.strokeStyle = i % 3 === 0
          ? \`rgba(255, 220, 130, \${0.12 + Math.random() * 0.22})\`
          : \`rgba(255, 95, 15, \${0.10 + Math.random() * 0.20})\`;
        ctx.lineWidth = 1.5 + Math.random() * 4.0;
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    const diskTex = createAccretionDiskTexture();
    const diskGeo = new THREE.RingGeometry(2.45, 8.8, 128, 1);
    const diskMat = new THREE.MeshBasicMaterial({
      map: diskTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });
    const accretionDisk = new THREE.Mesh(diskGeo, diskMat);
    accretionDisk.rotation.x = Math.PI * 0.43;
    gargantuaGroup.add(accretionDisk);

    const haloGeo = new THREE.RingGeometry(2.42, 3.65, 128, 1);
    const haloMat = new THREE.MeshBasicMaterial({
      map: diskTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const lensingHalo = new THREE.Mesh(haloGeo, haloMat);
    lensingHalo.rotation.x = Math.PI * 0.04;
    gargantuaGroup.add(lensingHalo);

    // Grade de Curvatura do Espaço-Tempo (Funil de Einstein)
    const gridRadius = 14;
    const gridRings = 28;
    const gridSegs = 64;
    const gridGeo = new THREE.RingGeometry(0.9, gridRadius, gridSegs, gridRings);
    const gridPos = gridGeo.attributes.position;
    const baseGridR = new Float32Array(gridPos.count);

    for (let i = 0; i < gridPos.count; i++) {
      const x = gridPos.getX(i);
      const y = gridPos.getY(i);
      baseGridR[i] = Math.sqrt(x * x + y * y);
    }

    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      depthWrite: false
    });
    const spacetimeGrid = new THREE.Mesh(gridGeo, gridMat);
    spacetimeGrid.rotation.x = -Math.PI * 0.5;
    spacetimeGrid.position.y = -1.6;
    scene.add(spacetimeGrid);

    function updateSpacetimeWell(wellDepth) {
      for (let i = 0; i < gridPos.count; i++) {
        const r = baseGridR[i];
        const drop = -wellDepth / Math.max(0.75, (r * 0.55));
        gridPos.setZ(i, drop);
      }
      gridPos.needsUpdate = true;
    }
    updateSpacetimeWell(4.5);

    // Funil Translúcido Raio-X para o Ato 10
    const xrayFunnelGeo = new THREE.CylinderGeometry(5.2, 0.45, 10.5, 48, 28, true);
    const xrayFunnelMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f2fe,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.0,
      roughness: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const xrayFunnel = new THREE.Mesh(xrayFunnelGeo, xrayFunnelMat);
    xrayFunnel.position.y = -4.2;
    scene.add(xrayFunnel);

    const starGlowTex = createRadialGlowTexture('rgba(255,255,255,1)', 'rgba(180,220,255,0.7)', 'rgba(100,160,255,0.1)');
    const plasmaGlowTex = createRadialGlowTexture('rgba(255,240,180,1)', 'rgba(255,120,20,0.75)', 'rgba(220,38,38,0.15)');

    // Nebulosas atmosféricas por cenário
    function buildNebulaLayer(palette) {
      const group = new THREE.Group();
      palette.forEach((entry, i) => {
        const material = new THREE.SpriteMaterial({
          map: starGlowTex, color: entry.color, transparent: true,
          opacity: entry.opacity, depthWrite: false, blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(entry.x, entry.y, -23 - (i % 3) * 3);
        sprite.scale.set(entry.size, entry.size * 0.72, 1);
        group.add(sprite);
      });
      scene.add(group);
      return group;
    }
    const nebulaBlueGroup = buildNebulaLayer([
      {x:-10,y:5,size:13,color:0x145a9e,opacity:0.20}, {x:8,y:7,size:15,color:0x0b7285,opacity:0.18},
      {x:10,y:-5,size:12,color:0x3347a8,opacity:0.18}, {x:-8,y:-7,size:14,color:0x075985,opacity:0.16},
      {x:0,y:10,size:10,color:0x1d4ed8,opacity:0.12}
    ]);
    const nebulaWarmGroup = buildNebulaLayer([
      {x:-10,y:5,size:14,color:0x9a3412,opacity:0.22}, {x:8,y:7,size:13,color:0x7c2d12,opacity:0.20},
      {x:10,y:-5,size:14,color:0xb45309,opacity:0.18}, {x:-8,y:-7,size:13,color:0x7f1d1d,opacity:0.20},
      {x:0,y:10,size:11,color:0x92400e,opacity:0.14}
    ]);
    const nebulaVioletGroup = buildNebulaLayer([
      {x:-10,y:5,size:14,color:0x5b21b6,opacity:0.22}, {x:8,y:7,size:15,color:0x312e81,opacity:0.20},
      {x:10,y:-5,size:13,color:0x6d28d9,opacity:0.20}, {x:-8,y:-7,size:14,color:0x155e75,opacity:0.18},
      {x:0,y:10,size:11,color:0x4338ca,opacity:0.14}
    ]);

    // Cinturão de asteroides e destroços 3D
    const debrisGroup = new THREE.Group();
    debrisGroup.visible = false;
    scene.add(debrisGroup);
    const debrisItems = [];
    for (let i = 0; i < 38; i++) {
      const size = 0.06 + (i % 5) * 0.03;
      const material = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0xb45309 : 0x475569,
        roughness: 0.82, metalness: 0.22,
        emissive: i % 5 === 0 ? 0x7c2d12 : 0x07111c,
        emissiveIntensity: i % 5 === 0 ? 0.48 : 0.12
      });
      const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), material);
      const angle = i * 2.399963;
      const radius = 3.2 + (i % 9) * 0.58;
      const base = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 2.4, Math.sin(angle) * radius - 1.2);
      mesh.position.copy(base);
      debrisGroup.add(mesh);
      debrisItems.push({ mesh, base, angle, radius, speed: 0.12 + (i % 7) * 0.02, phase: i * 0.73 });
    }

    // Anéis concêntricos no interior do funil (Ato 10)
    const innerRingsGroup = new THREE.Group();
    innerRingsGroup.visible = false;
    scene.add(innerRingsGroup);
    const innerRings = [];
    for (let i = 0; i < 9; i++) {
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f2fe : 0xa855f7,
        transparent: true, opacity: 0.30 + (i % 3) * 0.05,
        depthWrite: false, side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65 + i * 0.23, 0.022 + (i % 3) * 0.006, 8, 72), ringMaterial);
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = -0.4 - i * 0.82;
      ring.position.z = -0.10 * i;
      innerRingsGroup.add(ring);
      innerRings.push(ring);
    }

    const starCount = 1100;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 16 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 4;

      const c = new THREE.Color().setHSL(0.08 + Math.random() * 0.55, 0.75, 0.75 + Math.random() * 0.25);
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.42,
      map: starGlowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    const vortexCount = 340;
    const vortexGeo = new THREE.BufferGeometry();
    const vortexPositions = new Float32Array(vortexCount * 3);
    const vortexOrbitData = [];

    for (let i = 0; i < vortexCount; i++) {
      const radius = 2.6 + Math.random() * 6.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = (1.1 / Math.sqrt(radius)) * (0.85 + Math.random() * 0.3);
      const yOffset = (Math.random() - 0.5) * 0.65;
      vortexOrbitData.push({ radius, angle, speed, yOffset });
      vortexPositions[i * 3] = Math.cos(angle) * radius;
      vortexPositions[i * 3 + 1] = yOffset;
      vortexPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    vortexGeo.setAttribute('position', new THREE.BufferAttribute(vortexPositions, 3));

    const vortexMat = new THREE.PointsMaterial({
      size: 0.34,
      map: plasmaGlowTex,
      color: 0xffaa33,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const vortexParticles = new THREE.Points(vortexGeo, vortexMat);
    vortexParticles.rotation.x = Math.PI * 0.38;
    gargantuaGroup.add(vortexParticles);

    // =========================================================================
    // 5. ASTRONAUTA 3D ESTILO PIXAR (MOVIMENTOS ORGÂNICOS SEM PISCAR)
    // =========================================================================
    function buildPixarAstronaut(isClone = false) {
      const root = new THREE.Group();
      const bodyGroup = new THREE.Group();
      root.add(bodyGroup);

      const suitMat = new THREE.MeshStandardMaterial({
        color: isClone ? 0x38bdf8 : 0xeff6ff,
        roughness: 0.35,
        metalness: 0.1,
        transparent: isClone,
        opacity: isClone ? 0.58 : 1.0
      });

      const orangeAccentMat = new THREE.MeshStandardMaterial({
        color: isClone ? 0x00f2fe : 0xff6b00,
        roughness: 0.3,
        metalness: 0.2,
        emissive: isClone ? 0x0284c7 : 0x7c2d12,
        emissiveIntensity: 0.25,
        transparent: isClone,
        opacity: isClone ? 0.58 : 1.0
      });

      const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.65,
        transparent: isClone,
        opacity: isClone ? 0.55 : 1.0
      });

      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xf1b894,
        roughness: 0.55,
        metalness: 0.02,
        transparent: isClone,
        opacity: isClone ? 0.58 : 1.0
      });

      const torsoGeo = new THREE.CylinderGeometry(0.50, 0.40, 1.22, 32);
      const torso = new THREE.Mesh(torsoGeo, suitMat);
      torso.position.y = 0.22;
      bodyGroup.add(torso);

      const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.15, 0.84), orangeAccentMat);
      stripeL.position.set(-0.26, 0.23, 0.05);
      bodyGroup.add(stripeL);
      const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.15, 0.84), orangeAccentMat);
      stripeR.position.set(0.26, 0.23, 0.05);
      bodyGroup.add(stripeR);

      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.055, 16, 32), orangeAccentMat);
      belt.rotation.x = Math.PI * 0.5;
      belt.position.y = -0.35;
      bodyGroup.add(belt);

      const chestBox = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.40, 0.16), darkMetalMat);
      chestBox.position.set(0, 0.34, 0.44);
      bodyGroup.add(chestBox);

      const ledMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const chestLed = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.22), ledMat);
      chestLed.position.set(0, 0.35, 0.53);
      bodyGroup.add(chestLed);

      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.05, 0.46), suitMat);
      pack.position.set(0, 0.26, -0.45);
      bodyGroup.add(pack);

      const flameMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.0
      });
      const thrusterL = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.65, 16), flameMat);
      thrusterL.rotation.x = Math.PI;
      thrusterL.position.set(-0.24, -0.45, -0.5);
      bodyGroup.add(thrusterL);

      const thrusterR = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.65, 16), flameMat);
      thrusterR.rotation.x = Math.PI;
      thrusterR.position.set(0.24, -0.45, -0.5);
      bodyGroup.add(thrusterR);

      const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 16, 32), darkMetalMat);
      neckRing.rotation.x = Math.PI * 0.5;
      neckRing.position.y = 0.84;
      bodyGroup.add(neckRing);

      const headGroup = new THREE.Group();
      headGroup.position.y = 1.42;
      bodyGroup.add(headGroup);

      const faceHead = new THREE.Mesh(new THREE.SphereGeometry(0.49, 32, 32), skinMat);
      faceHead.scale.set(1.0, 0.96, 0.94);
      headGroup.add(faceHead);

      const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b170e, roughness: 0.75 });
      const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.51, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hairBack.rotation.x = -0.35;
      hairBack.position.y = 0.04;
      headGroup.add(hairBack);

      const tuft1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 8, 12), hairMat);
      tuft1.rotation.z = 1.15;
      tuft1.position.set(-0.12, 0.44, 0.30);
      headGroup.add(tuft1);

      const tuft2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.18, 8, 12), hairMat);
      tuft2.rotation.z = 0.85;
      tuft2.position.set(0.14, 0.43, 0.28);
      headGroup.add(tuft2);

      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const irisMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });

      function createPixarEye(sign) {
        const eyeG = new THREE.Group();
        eyeG.position.set(sign * 0.17, 0.05, 0.42);

        const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), eyeWhiteMat);
        sclera.scale.set(1.0, 1.15, 0.55);
        eyeG.add(sclera);

        const pupilGroup = new THREE.Group();
        eyeG.add(pupilGroup);

        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.068, 20, 20), irisMat);
        iris.scale.set(1.0, 1.1, 0.45);
        iris.position.z = 0.04;
        pupilGroup.add(iris);

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), pupilMat);
        pupil.scale.set(1.0, 1.1, 0.45);
        pupil.position.z = 0.062;
        pupilGroup.add(pupil);

        const spec1 = new THREE.Mesh(new THREE.SphereGeometry(0.019, 12, 12), eyeWhiteMat);
        spec1.position.set(0.024, 0.028, 0.078);
        pupilGroup.add(spec1);

        const spec2 = new THREE.Mesh(new THREE.SphereGeometry(0.010, 12, 12), eyeWhiteMat);
        spec2.position.set(-0.02, -0.02, 0.076);
        pupilGroup.add(spec2);

        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.038, 0.04), hairMat);
        brow.position.set(0, 0.17, 0.04);
        eyeG.add(brow);

        return { eyeG, pupilGroup, brow };
      }

      const eyeL = createPixarEye(-1);
      const eyeR = createPixarEye(1);
      headGroup.add(eyeL.eyeG, eyeR.eyeG);

      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), skinMat);
      nose.scale.set(1.1, 0.85, 1.1);
      nose.position.set(0, -0.03, 0.47);
      headGroup.add(nose);

      const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.32 });
      const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.065, 16), blushMat);
      blushL.position.set(-0.27, -0.06, 0.41);
      blushL.rotation.y = -0.35;
      headGroup.add(blushL);

      const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.065, 16), blushMat);
      blushR.position.set(0.27, -0.06, 0.41);
      blushR.rotation.y = 0.35;
      headGroup.add(blushR);

      const mouthGroup = new THREE.Group();
      mouthGroup.position.set(0, -0.17, 0.45);
      headGroup.add(mouthGroup);

      const smileMouth = new THREE.Mesh(
        new THREE.TorusGeometry(0.075, 0.02, 12, 24, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0x991b1b })
      );
      smileMouth.rotation.x = Math.PI;
      mouthGroup.add(smileMouth);

      const shockMouth = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x7f1d1d })
      );
      shockMouth.scale.set(0.85, 1.25, 0.35);
      shockMouth.visible = false;
      mouthGroup.add(shockMouth);

      const helmetGlassMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: isClone ? 0.12 : 0.15,
        roughness: 0.25,
        metalness: 0.05,
        depthWrite: false
      });
      const helmetDome = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 32), helmetGlassMat);
      headGroup.add(helmetDome);

      const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.18, 12), darkMetalMat);
      torch.rotation.x = Math.PI * 0.5;
      torch.position.set(0.64, 0.12, 0.1);
      headGroup.add(torch);

      function createArm(sign) {
        const pivot = new THREE.Group();
        pivot.position.set(sign * 0.56, 0.68, 0);
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), orangeAccentMat);
        pivot.add(shoulder);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.90, 20), suitMat);
        arm.position.y = -0.46;
        pivot.add(arm);
        const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.022, 12, 24), orangeAccentMat);
        cuff.rotation.x = Math.PI * 0.5;
        cuff.position.y = -0.88;
        pivot.add(cuff);
        const glove = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }));
        glove.position.y = -0.96;
        pivot.add(glove);
        return pivot;
      }

      const leftArm = createArm(-1);
      const rightArm = createArm(1);
      bodyGroup.add(leftArm, rightArm);

      function createLeg(sign) {
        const pivot = new THREE.Group();
        pivot.position.set(sign * 0.22, -0.45, 0);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 1.12, 20), suitMat);
        leg.position.y = -0.56;
        pivot.add(leg);
        const kneeRing = new THREE.Mesh(new THREE.TorusGeometry(0.138, 0.02, 12, 24), new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
        kneeRing.rotation.x = Math.PI * 0.5;
        kneeRing.position.y = -0.52;
        pivot.add(kneeRing);
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.22, 0.42), orangeAccentMat);
        boot.position.set(0, -1.16, 0.06);
        pivot.add(boot);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.44), darkMetalMat);
        sole.position.set(0, -1.28, 0.06);
        pivot.add(sole);
        return pivot;
      }

      const leftLeg = createLeg(-1);
      const rightLeg = createLeg(1);
      bodyGroup.add(leftLeg, rightLeg);

      const headAnchor = new THREE.Object3D();
      headAnchor.position.set(0, 2.28, 0);
      bodyGroup.add(headAnchor);

      const chestAnchor = new THREE.Object3D();
      chestAnchor.position.set(0, 0.35, 0.55);
      bodyGroup.add(chestAnchor);

      const feetAnchor = new THREE.Object3D();
      feetAnchor.position.set(0, -1.85, 0);
      bodyGroup.add(feetAnchor);

      function setExpression(mode, t) {
        if (mode === 'calm' || mode === 'happy') {
          smileMouth.visible = true;
          shockMouth.visible = false;
          eyeL.pupilGroup.scale.set(1, 1, 1);
          eyeR.pupilGroup.scale.set(1, 1, 1);
          eyeL.brow.rotation.z = mode === 'happy' ? 0.12 : 0.0;
          eyeR.brow.rotation.z = mode === 'happy' ? -0.12 : 0.0;
          eyeL.brow.position.y = 0.17;
          eyeR.brow.position.y = 0.17;
          chestLed.material.color.setHex(mode === 'happy' ? 0x10b981 : 0x00f2fe);
        } else if (mode === 'shock') {
          smileMouth.visible = false;
          shockMouth.visible = true;
          shockMouth.scale.set(0.85, 1.15, 0.35);
          eyeL.pupilGroup.scale.set(0.82, 0.82, 1);
          eyeR.pupilGroup.scale.set(0.82, 0.82, 1);
          eyeL.brow.rotation.z = 0.25;
          eyeR.brow.rotation.z = -0.25;
          eyeL.brow.position.y = 0.20;
          eyeR.brow.position.y = 0.20;
          chestLed.material.color.setHex(0xfbbf24);
        } else if (mode === 'panic') {
          smileMouth.visible = false;
          shockMouth.visible = true;
          const pulse = 1.12 + Math.sin(t * 3.2) * 0.05;
          shockMouth.scale.set(0.95, pulse, 0.35);
          eyeL.pupilGroup.scale.set(0.65, 0.65, 1);
          eyeR.pupilGroup.scale.set(0.65, 0.65, 1);
          eyeL.brow.rotation.z = 0.38;
          eyeR.brow.rotation.z = -0.38;
          eyeL.brow.position.y = 0.21;
          eyeR.brow.position.y = 0.21;
          chestLed.material.color.setHex(0xf43f5e);
        }
      }

      return {
        root, bodyGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg,
        headAnchor, chestAnchor, feetAnchor, suitMat, orangeAccentMat,
        thrusterL, thrusterR, flameMat, setExpression
      };
    }

    const astronaut = buildPixarAstronaut(false);
    astronaut.root.scale.setScalar(BASE_ASTRO_SCALE);
    astronaut.root.position.set(0, 0.2, 3.2);
    scene.add(astronaut.root);

    const photonClone = buildPixarAstronaut(true);
    photonClone.root.scale.setScalar(BASE_ASTRO_SCALE * 0.92);
    photonClone.root.visible = false;
    scene.add(photonClone.root);

    const photonClone2 = buildPixarAstronaut(true);
    photonClone2.root.scale.setScalar(BASE_ASTRO_SCALE * 0.72);
    photonClone2.root.visible = false;
    scene.add(photonClone2);

    // =========================================================================
    // 6. OS 12 CENÁRIOS E AMBIENTES 3D EXCLUSIVOS POR ATO
    // =========================================================================

    // CENÁRIO A: CABINE DE COMANDO 3D DA NAVE ORION VII (CALIBRADA 100% PARA TELA VERTICAL 9:16!)
    const cockpitGroup = new THREE.Group();
    cockpitGroup.visible = false;
    scene.add(cockpitGroup);

    const cockpitInteriorLight = new THREE.PointLight(0x38bdf8, 2.2, 14);
    cockpitInteriorLight.position.set(0, 0.8, 7.2);
    cockpitGroup.add(cockpitInteriorLight);

    const cockpitWarmLight = new THREE.PointLight(0xfbbf24, 1.2, 10);
    cockpitWarmLight.position.set(-0.8, 0.2, 6.8);
    cockpitGroup.add(cockpitWarmLight);

    const cockpitFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, metalness: 0.65, roughness: 0.32,
      emissive: 0x09192b, emissiveIntensity: 0.55
    });
    const cockpitTrimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, metalness: 0.75, roughness: 0.22,
      emissive: 0x0284c7, emissiveIntensity: 0.65
    });
    const cockpitAmberTrimMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const cockpitSeatMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, metalness: 0.4, roughness: 0.65
    });

    function cockpitBox(w, h, d, x, y, z, material, rz = 0) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.rotation.z = rz;
      cockpitGroup.add(mesh);
      return mesh;
    }

    // Moldura Panorâmica 9:16 da Cabine (z = 4.6 -> 100% visível na câmera vertical!)
    cockpitBox(3.6, 0.24, 0.42, 0, 2.62, 4.6, cockpitFrameMat); // Topo do para-brisa
    cockpitBox(3.2, 0.05, 0.12, 0, 2.48, 4.78, cockpitAmberTrimMat); // LED Dourado Superior
    cockpitBox(0.24, 4.5, 0.42, -1.52, 0.55, 4.6, cockpitFrameMat); // Coluna Esquerda
    cockpitBox(0.24, 4.5, 0.42, 1.52, 0.55, 4.6, cockpitFrameMat);  // Coluna Direita
    cockpitBox(0.05, 4.1, 0.12, -1.38, 0.55, 4.76, cockpitTrimMat); // LED Ciano Esquerdo
    cockpitBox(0.05, 4.1, 0.12, 1.38, 0.55, 4.76, cockpitTrimMat);  // LED Ciano Direito

    // Travessas diagonais superiores do canopy
    cockpitBox(0.95, 0.14, 0.32, -1.15, 2.32, 4.65, cockpitFrameMat, 0.52);
    cockpitBox(0.95, 0.14, 0.32, 1.15, 2.32, 4.65, cockpitFrameMat, -0.52);

    // Painel Principal de Controle (Dashboard Panorâmico Inferior em z = 4.95)
    cockpitBox(3.5, 0.85, 0.95, 0, -1.32, 4.95, cockpitFrameMat);
    cockpitBox(3.2, 0.05, 0.14, 0, -0.88, 5.38, cockpitTrimMat);

    function makeCockpitDisplay(accent, secondary, heading) {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, 512, 256);
      bg.addColorStop(0, '#041222');
      bg.addColorStop(1, '#09223a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = accent; ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 244);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.22)'; ctx.lineWidth = 1.5;
      for (let x = 28; x < 512; x += 36) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 236); ctx.stroke(); }
      for (let y = 24; y < 256; y += 32) { ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(500, y); ctx.stroke(); }
      ctx.fillStyle = accent; ctx.font = 'bold 28px Arial'; ctx.fillText(heading, 24, 44);
      ctx.fillStyle = '#e2f8ff'; ctx.font = 'bold 16px Arial';
      ctx.fillText('ORION VII // GRAVITY NAV', 26, 70);
      ctx.strokeStyle = accent; ctx.lineWidth = 5; ctx.beginPath();
      const values = [0.45,0.62,0.52,0.74,0.58,0.82,0.66,0.88,0.72,0.92];
      values.forEach((v, i) => {
        const x = 28 + i * 48;
        const y = 210 - v * 105;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.strokeStyle = secondary; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(418, 125, 48, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(418, 125, 26, 0, Math.PI * 1.6); ctx.stroke();
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    // 3 Telas Holográficas Brilhantes no Console da Nave (100% visíveis no 9:16!)
    [
      { x: -0.96, y: -0.64, z: 5.12, ry: 0.28, accent: '#00f2fe', secondary: '#0284c7', title: 'TELEMETRIA' },
      { x: 0.02,  y: -0.72, z: 5.22, ry: 0.00, accent: '#fbbf24', secondary: '#f97316', title: 'ROTA ORBITAL' },
      { x: 0.96,  y: -0.64, z: 5.12, ry: -0.28, accent: '#a855f7', secondary: '#7c3aed', title: 'GARGANTUA' }
    ].forEach((cfg, i) => {
      const material = new THREE.MeshBasicMaterial({ map: makeCockpitDisplay(cfg.accent, cfg.secondary, cfg.title) });
      const display = new THREE.Mesh(new THREE.PlaneGeometry(i === 1 ? 0.92 : 0.82, 0.46), material);
      display.position.set(cfg.x, cfg.y, cfg.z);
      display.rotation.y = cfg.ry;
      display.rotation.x = -0.18;
      cockpitGroup.add(display);
    });

    // Fileira de 11 botões luminosos no painel frontal
    for (let i = 0; i < 11; i++) {
      const btn = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 12, 12),
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xfbbf24 : (i % 2 === 0 ? 0x00f2fe : 0xf43f5e) })
      );
      btn.position.set(-1.10 + i * 0.22, -0.96, 5.42);
      cockpitGroup.add(btn);
    }

    // Radar Holográfico 3D Esférico flutuando à direita do painel!
    const holoRadarGroup = new THREE.Group();
    holoRadarGroup.position.set(0.68, -0.12, 5.25);
    cockpitGroup.add(holoRadarGroup);

    const radarGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.55 })
    );
    holoRadarGroup.add(radarGlobe);

    const radarRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.018, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    radarRing.rotation.x = Math.PI * 0.45;
    holoRadarGroup.add(radarRing);

    // Manche Futurista de Pilotagem (Yoke) nas mãos do astronauta
    const yokeGroup = new THREE.Group();
    yokeGroup.position.set(-0.35, -0.45, 5.35);
    cockpitGroup.add(yokeGroup);
    const yokeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.45, 12), cockpitTrimMat);
    yokeShaft.rotation.x = 0.35;
    yokeGroup.add(yokeShaft);
    const yokeHandle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 12, 24, Math.PI * 1.3), cockpitAmberTrimMat);
    yokeHandle.position.set(0, 0.20, 0.08);
    yokeGroup.add(yokeHandle);

    // Assento de comando baixo (sem encosto escuro na frente da câmera)
    cockpitBox(0.75, 0.18, 0.55, -0.56, -0.82, 5.55, cockpitSeatMat);

    const cockpitWindowAnchor = new THREE.Object3D();
    cockpitWindowAnchor.position.set(0.25, 1.35, 4.6);
    cockpitGroup.add(cockpitWindowAnchor);

    // Linhas de Dobra Espacial (Warp Speed Lines para Atos 1 e 9)
    const warpLinesGroup = new THREE.Group();
    warpLinesGroup.visible = false;
    scene.add(warpLinesGroup);
    const warpLines = [];
    for (let i = 0; i < 42; i++) {
      const geo = new THREE.CylinderGeometry(0.012, 0.012, 1.8 + (i % 4) * 0.6, 8);
      geo.rotateX(Math.PI * 0.5);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f2fe : 0xa855f7,
        transparent: true,
        opacity: 0.45
      });
      const line = new THREE.Mesh(geo, mat);
      const angle = (i / 42) * Math.PI * 2;
      const rad = 1.9 + (i % 5) * 0.65;
      line.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad + 0.4, -4 + (i % 10));
      warpLinesGroup.add(line);
      warpLines.push({ mesh: line, baseZ: line.position.z, speed: 6.5 + (i % 5) * 1.5 });
    }

    // CENÁRIO B: NAVE EXTERNA ORION VII (Atos 2 e 8)
    const shipGroup = new THREE.Group();
    shipGroup.visible = false;
    scene.add(shipGroup);

    const hullMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.6 });
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 1.65, 24), hullMat);
    hull.rotation.z = Math.PI * 0.5;
    shipGroup.add(hull);

    const noseCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.55, 24),
      new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.3 })
    );
    noseCone.rotation.z = -Math.PI * 0.5;
    noseCone.position.x = 1.10;
    shipGroup.add(noseCone);

    const cockpitDomeExt = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    cockpitDomeExt.scale.set(1.4, 0.8, 0.9);
    cockpitDomeExt.position.set(0.32, 0.24, 0);
    shipGroup.add(cockpitDomeExt);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.7,
      emissive: 0x78350f,
      emissiveIntensity: 0.25
    });
    const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 1.35), wingMat);
    wingLeft.position.set(-0.1, 0, 0.88);
    shipGroup.add(wingLeft);

    const wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 1.35), wingMat);
    wingRight.position.set(-0.1, 0, -0.88);
    shipGroup.add(wingRight);

    const shipEngineGlow = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.75, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.85 })
    );
    shipEngineGlow.rotation.z = Math.PI * 0.5;
    shipEngineGlow.position.x = -1.15;
    shipGroup.add(shipEngineGlow);

    const shipAnchor = new THREE.Object3D();
    shipAnchor.position.set(0, 0.75, 0);
    shipGroup.add(shipAnchor);

    // CENÁRIO C: CORREDOR DE ESPELHOS DE FÓTONS 360° (Ato 3)
    const photonTunnelGroup = new THREE.Group();
    photonTunnelGroup.visible = false;
    scene.add(photonTunnelGroup);

    const photonArches = [];
    for (let i = 0; i < 7; i++) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.35 + i * 0.18, 0.028, 16, 96),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xfbbf24 : 0x00f2fe,
          transparent: true,
          opacity: 0.55 - i * 0.05
        })
      );
      arch.position.set(0, 0.25, 1.5 - i * 0.75);
      photonTunnelGroup.add(arch);
      photonArches.push(arch);
    }

    // Feixe de fótons curvado ligando a nuca do astronauta ao clone óptico!
    const photonBeamRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.035, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.85 })
    );
    photonBeamRing.rotation.x = Math.PI * 0.48;
    photonBeamRing.position.set(0.05, 0.65, 2.5);
    photonTunnelGroup.add(photonBeamRing);

    // CENÁRIO D: PLANETA DE LAVA SENDO DEVORADO EM CLOSE-UP (Ato 4)
    const lavaPlanetGroup = new THREE.Group();
    lavaPlanetGroup.visible = false;
    scene.add(lavaPlanetGroup);

    const lavaTex = createLavaPlanetTexture();
    const lavaPlanetMat = new THREE.MeshStandardMaterial({
      map: lavaTex,
      emissive: 0xff4500,
      emissiveMap: lavaTex,
      emissiveIntensity: 0.92,
      roughness: 0.55
    });
    const lavaPlanetCore = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), lavaPlanetMat);
    lavaPlanetGroup.add(lavaPlanetCore);

    const planetAnchor = new THREE.Object3D();
    planetAnchor.position.set(0, 1.25, 0);
    lavaPlanetGroup.add(planetAnchor);

    const lavaChunks = [];
    for (let i = 0; i < 28; i++) {
      const chunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.08 + (i % 4) * 0.045, 0),
        new THREE.MeshStandardMaterial({
          color: 0x3b0a0a,
          emissive: i % 2 === 0 ? 0xff5500 : 0xfbbf24,
          emissiveIntensity: 0.95,
          roughness: 0.5
        })
      );
      lavaPlanetGroup.add(chunk);
      lavaChunks.push({ mesh: chunk, seed: i * 0.38 });
    }

    // CENÁRIO E: OBSERVATÓRIO TEMPORAL HOLOGRÁFICO (Ato 5)
    const clocksGroup = new THREE.Group();
    clocksGroup.visible = false;
    scene.add(clocksGroup);

    function createHoloClock(colorHex, bgHex) {
      const cg = new THREE.Group();
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.68, 0.055, 16, 48),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      cg.add(rim);

      const face = new THREE.Mesh(
        new THREE.CircleGeometry(0.66, 32),
        new THREE.MeshBasicMaterial({ color: bgHex, transparent: true, opacity: 0.88 })
      );
      face.position.z = -0.02;
      cg.add(face);

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.12, 0.02),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        tick.position.set(Math.cos(a) * 0.54, Math.sin(a) * 0.54, 0.01);
        tick.rotation.z = a - Math.PI * 0.5;
        cg.add(tick);
      }

      const handPivot = new THREE.Group();
      const hand = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.46, 0.03),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      hand.position.y = 0.20;
      handPivot.add(hand);
      cg.add(handPivot);

      const anchor = new THREE.Object3D();
      anchor.position.set(0, 0.88, 0);
      cg.add(anchor);

      return { group: cg, handPivot, anchor };
    }

    const clockLeft = createHoloClock(0x00f2fe, 0x041326);
    clockLeft.group.position.set(-0.92, 1.55, 3.0);
    clocksGroup.add(clockLeft.group);

    const clockRight = createHoloClock(0xfbbf24, 0x241204);
    clockRight.group.position.set(0.92, 1.55, 3.0);
    clocksGroup.add(clockRight.group);

    // CENÁRIO F: CÂMARA DE ONDAS DE LUZ REDSHIFT (Ato 6)
    const redshiftWavesGroup = new THREE.Group();
    redshiftWavesGroup.visible = false;
    scene.add(redshiftWavesGroup);

    const redshiftWaves = [];
    for (let w = 0; w < 5; w++) {
      const pts = [];
      for (let j = 0; j <= 40; j++) {
        const py = -1.8 + (j / 40) * 4.2;
        const freq = 6.0 - (j / 40) * 3.5; // Comprimento de onda estica!
        const px = -1.2 + w * 0.6 + Math.sin((j / 40) * Math.PI * freq) * 0.18;
        pts.push(new THREE.Vector3(px, py, 1.8));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.022, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: w % 2 === 0 ? 0xf43f5e : 0xff6b00,
        transparent: true,
        opacity: 0.65
      });
      const waveMesh = new THREE.Mesh(tubeGeo, tubeMat);
      redshiftWavesGroup.add(waveMesh);
      redshiftWaves.push(waveMesh);
    }

    // CENÁRIO G: POÇO VERTICAL DE VETORES GRAVITACIONAIS & ANÉIS DE MARÉ (Ato 7)
    const tidalRingsGroup = new THREE.Group();
    tidalRingsGroup.visible = false;
    scene.add(tidalRingsGroup);

    const tidalRings = [];
    for (let i = 0; i < 4; i++) {
      const tr = new THREE.Mesh(
        new THREE.TorusGeometry(0.42 + i * 0.10, 0.03, 16, 48),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xf43f5e : 0xfbbf24,
          transparent: true,
          opacity: 0.85
        })
      );
      tr.rotation.x = Math.PI * 0.5;
      tidalRingsGroup.add(tr);
      tidalRings.push(tr);
    }

    const gravityVectorsGroup = new THREE.Group();
    gravityVectorsGroup.visible = false;
    scene.add(gravityVectorsGroup);
    const gravityPillars = [];
    for (let i = 0; i < 18; i++) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.04, 1.4, 8),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xf43f5e : 0xfbbf24,
          transparent: true,
          opacity: 0.55
        })
      );
      const ang = (i / 18) * Math.PI * 2;
      const rad = 1.15 + (i % 3) * 0.45;
      pillar.position.set(Math.cos(ang) * rad, (i % 5) * 0.8 - 1.5, Math.sin(ang) * rad + 2.2);
      gravityVectorsGroup.add(pillar);
      gravityPillars.push({ mesh: pillar, baseY: pillar.position.y });
    }

    // CENÁRIO H: CÂNION DE COMPRESSÃO LATERAL DA ESPAGUETIFICAÇÃO (Ato 8)
    const compressionWallsGroup = new THREE.Group();
    compressionWallsGroup.visible = false;
    scene.add(compressionWallsGroup);

    for (let side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 3.8, 0.08),
          new THREE.MeshBasicMaterial({ color: 0xff6b00, transparent: true, opacity: 0.55 - i * 0.08 })
        );
        bar.position.set(side * (1.45 + i * 0.22), 0.1, 2.5 - i * 0.2);
        compressionWallsGroup.add(bar);
      }
    }

    // CENÁRIO I: DIMENSÃO TESSERACT 4D + TÚNEL DE BURACO DE MINHOCA (Ato 11)
    const tesseractGroup = new THREE.Group();
    tesseractGroup.visible = false;
    scene.add(tesseractGroup);

    const outerCubeGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6);
    const outerEdges = new THREE.EdgesGeometry(outerCubeGeo);
    const outerCube = new THREE.LineSegments(
      outerEdges,
      new THREE.LineBasicMaterial({ color: 0xfbbf24 })
    );
    tesseractGroup.add(outerCube);

    const innerCubeGeo = new THREE.BoxGeometry(1.35, 1.35, 1.35);
    const innerEdges = new THREE.EdgesGeometry(innerCubeGeo);
    const innerCube = new THREE.LineSegments(
      innerEdges,
      new THREE.LineBasicMaterial({ color: 0x00f2fe })
    );
    tesseractGroup.add(innerCube);

    const connectorVerts = [];
    [-1, 1].forEach(x => {
      [-1, 1].forEach(y => {
        [-1, 1].forEach(z => {
          connectorVerts.push(x * 0.675, y * 0.675, z * 0.675);
          connectorVerts.push(x * 1.3, y * 1.3, z * 1.3);
        });
      });
    });
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute('position', new THREE.Float32BufferAttribute(connectorVerts, 3));
    const connLines = new THREE.LineSegments(
      connGeo,
      new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9 })
    );
    tesseractGroup.add(connLines);

    // Anéis do Túnel de Buraco de Minhoca (Einstein-Rosen) ao fundo do Tesseract
    const wormholeRings = [];
    for (let i = 0; i < 8; i++) {
      const wr = new THREE.Mesh(
        new THREE.TorusGeometry(1.8 + i * 0.35, 0.03, 12, 64),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x00f2fe : 0xa855f7,
          transparent: true,
          opacity: 0.55 - i * 0.05
        })
      );
      wr.position.z = -0.5 - i * 0.9;
      tesseractGroup.add(wr);
      wormholeRings.push(wr);
    }

    const tesseractAnchor = new THREE.Object3D();
    tesseractAnchor.position.set(0, 1.75, 0);
    tesseractGroup.add(tesseractAnchor);

    // CENÁRIO J: PLANETA TERRA NO ANO 3.002.026 COM ANÉIS FUTURISTAS, LUA E SOL (Atos 5 e 12)
    const earthGroup = new THREE.Group();
    earthGroup.visible = false;
    scene.add(earthGroup);

    const earthTex = createEarthTexture();
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 48, 48),
      new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.52, metalness: 0.10 })
    );
    earthGroup.add(earthMesh);

    const atmoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.14, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18, side: THREE.BackSide })
    );
    earthGroup.add(atmoMesh);

    // Anéis Orbitais Futuristas do Ano 3.002.026 + Lua 3D
    const futureRingsGroup = new THREE.Group();
    earthGroup.add(futureRingsGroup);

    const orbitalRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.65, 0.025, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.65 })
    );
    orbitalRing1.rotation.x = Math.PI * 0.42;
    orbitalRing1.rotation.y = 0.25;
    futureRingsGroup.add(orbitalRing1);

    const orbitalRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.05, 0.018, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.50 })
    );
    orbitalRing2.rotation.x = -Math.PI * 0.38;
    orbitalRing2.rotation.y = -0.30;
    futureRingsGroup.add(orbitalRing2);

    const moonPivot = new THREE.Group();
    futureRingsGroup.add(moonPivot);
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 })
    );
    moonMesh.position.set(2.85, 0.65, 0.5);
    moonPivot.add(moonMesh);

    // Brilho Solar Dourado no Horizonte da Terra
    const sunSpriteMat = new THREE.SpriteMaterial({
      map: plasmaGlowTex,
      color: 0xfde047,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const sunSprite = new THREE.Sprite(sunSpriteMat);
    sunSprite.position.set(-2.3, 2.2, -2.5);
    sunSprite.scale.set(4.5, 4.5, 1);
    earthGroup.add(sunSprite);

    const earthAnchor = new THREE.Object3D();
    earthAnchor.position.set(0, 2.25, 0);
    earthGroup.add(earthAnchor);

    // Âncoras Globais Auxiliares
    const coreTopAnchor = new THREE.Object3D();
    coreTopAnchor.position.set(0, 2.75, 0);
    scene.add(coreTopAnchor);

    const funnelRimAnchor = new THREE.Object3D();
    funnelRimAnchor.position.set(-0.75, 1.2, 1.5);
    scene.add(funnelRimAnchor);

    const ANCHORS = {
      astroHead: astronaut.headAnchor,
      astroChest: astronaut.chestAnchor,
      astroFeet: astronaut.feetAnchor,
      cloneHead: photonClone.headAnchor,
      ghostHead: photonClone.headAnchor,
      ship: shipAnchor,
      cockpitWindow: cockpitWindowAnchor,
      planet: planetAnchor,
      clockLeft: clockLeft.anchor,
      clockRight: clockRight.anchor,
      coreTop: coreTopAnchor,
      funnelRim: funnelRimAnchor,
      tesseractTop: tesseractAnchor,
      earthTop: earthAnchor
    };

    // =========================================================================
    // 7. MOTOR DETERMINÍSTICO DE 12 CENÁRIOS (COREOGRAFIA ORGÂNICA 60FPS)
    // =========================================================================
    const lblPrimary = document.getElementById('lbl-primary');
    const lblPrimaryPill = document.getElementById('lbl-primary-pill');
    const lblPrimaryStem = document.getElementById('lbl-primary-stem');
    const lblPrimaryDot = document.getElementById('lbl-primary-dot');

    const lblSecondary = document.getElementById('lbl-secondary');
    const lblSecondaryPill = document.getElementById('lbl-secondary-pill');
    const lblSecondaryStem = document.getElementById('lbl-secondary-stem');
    const lblSecondaryDot = document.getElementById('lbl-secondary-dot');

    const phaseDot = document.getElementById('phase-dot');
    const phaseTitle = document.getElementById('phase-title');
    const stepCounter = document.getElementById('step-counter');
    const subtitleText = document.getElementById('subtitle-text');
    const timeReadout = document.getElementById('time-readout');
    const flashOverlay = document.getElementById('flash-overlay');
    const transitionOverlay = document.getElementById('transition-overlay');

    let currentBeatIndex = -1;

    function smoothstep(edge0, edge1, x) {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    }

    function computeScreenCoords(obj3D) {
      const stageRect = document.getElementById('stage').getBoundingClientRect();
      const v = new THREE.Vector3();
      obj3D.getWorldPosition(v);
      v.project(camera);

      const x = (v.x * 0.5 + 0.5) * stageRect.width;
      const y = (-(v.y * 0.5) + 0.5) * stageRect.height;

      return {
        x: Math.max(135, Math.min(stageRect.width - 135, x)),
        y: Math.max(105, Math.min(stageRect.height - 145, y)),
        stageWidth: stageRect.width,
        stageHeight: stageRect.height
      };
    }

    function updateLabelsWithAntiCollision(beat) {
      const has1 = beat.label1 && ANCHORS[beat.label1.target];
      const has2 = beat.label2 && ANCHORS[beat.label2.target];

      if (has1 && has2) {
        const p1 = computeScreenCoords(ANCHORS[beat.label1.target]);
        const p2 = computeScreenCoords(ANCHORS[beat.label2.target]);

        // Anti-colisão automática: se as duas pílulas ficarem próximas em Y e X, afasta verticalmente!
        if (Math.abs(p1.y - p2.y) < 58 && Math.abs(p1.x - p2.x) < 230) {
          if (p1.y <= p2.y) {
            p1.y = Math.max(102, p1.y - 30);
            p2.y = Math.min(p2.stageHeight - 145, p2.y + 30);
          } else {
            p2.y = Math.max(102, p2.y - 30);
            p1.y = Math.min(p1.stageHeight - 145, p1.y + 30);
          }
        }

        lblPrimary.style.left = \`\${p1.x}px\`;
        lblPrimary.style.top = \`\${p1.y}px\`;
        lblSecondary.style.left = \`\${p2.x}px\`;
        lblSecondary.style.top = \`\${p2.y}px\`;
      } else if (has1) {
        const p1 = computeScreenCoords(ANCHORS[beat.label1.target]);
        lblPrimary.style.left = \`\${p1.x}px\`;
        lblPrimary.style.top = \`\${p1.y}px\`;
      } else if (has2) {
        const p2 = computeScreenCoords(ANCHORS[beat.label2.target]);
        lblSecondary.style.left = \`\${p2.x}px\`;
        lblSecondary.style.top = \`\${p2.y}px\`;
      }
    }

    function applyBeatHUD(beat) {
      if (currentBeatIndex === beat.index) return;
      currentBeatIndex = beat.index;

      phaseDot.style.background = beat.color;
      phaseDot.style.boxShadow = \`0 0 12px \${beat.color}\`;
      phaseTitle.textContent = beat.title;
      stepCounter.textContent = \`\${beat.index + 1}/12\`;
      subtitleText.innerHTML = beat.subtitle;

      if (beat.label1) {
        lblPrimaryPill.className = \`float-pill \${beat.label1.style}\`;
        lblPrimaryPill.textContent = beat.label1.text;
        lblPrimaryStem.style.color = beat.label1.color;
        lblPrimaryDot.style.color = beat.label1.color;
        lblPrimary.classList.add('visible');
      } else {
        lblPrimary.classList.remove('visible');
      }

      if (beat.label2) {
        lblSecondaryPill.className = \`float-pill \${beat.label2.style}\`;
        lblSecondaryPill.textContent = beat.label2.text;
        lblSecondaryStem.style.color = beat.label2.color;
        lblSecondaryDot.style.color = beat.label2.color;
        lblSecondary.classList.add('visible');
      } else {
        lblSecondary.classList.remove('visible');
      }
    }

    function updateSceneAtTime(t) {
      const clampedT = Math.max(0, Math.min(TOTAL_DURATION, t));

      let activeBeat = BEATS[0];
      for (const b of BEATS) {
        if (clampedT >= b.start && clampedT <= b.end) {
          activeBeat = b;
          break;
        }
      }
      if (clampedT >= BEATS[BEATS.length - 1].end) {
        activeBeat = BEATS[BEATS.length - 1];
      }

      applyBeatHUD(activeBeat);

      BEATS.forEach((b, idx) => {
        if (clampedT >= b.end) {
          progressFills[idx].style.width = '100%';
        } else if (clampedT <= b.start) {
          progressFills[idx].style.width = '0%';
        } else {
          const pct = ((clampedT - b.start) / (b.end - b.start)) * 100;
          progressFills[idx].style.width = \`\${pct.toFixed(1)}%\`;
        }
      });

      timeReadout.textContent = \`\${clampedT.toFixed(1).padStart(4, '0')}s / \${TOTAL_DURATION.toFixed(1)}s\`;

      const u = Math.max(0, Math.min(1, (clampedT - activeBeat.start) / (activeBeat.end - activeBeat.start)));

      // Reset padrão dos 12 cenários
      gargantuaGroup.visible = true;
      gargantuaGroup.position.set(0, 0, 0);
      gargantuaGroup.rotation.set(0, 0, 0);
      gargantuaGroup.scale.setScalar(1.0);
      spacetimeGrid.visible = true;
      spacetimeGrid.position.set(0, -1.6, 0);
      cockpitGroup.visible = false;
      warpLinesGroup.visible = false;
      debrisGroup.visible = false;
      photonTunnelGroup.visible = false;
      redshiftWavesGroup.visible = false;
      gravityVectorsGroup.visible = false;
      compressionWallsGroup.visible = false;
      innerRingsGroup.visible = false;
      nebulaBlueGroup.visible = true;
      nebulaWarmGroup.visible = false;
      nebulaVioletGroup.visible = false;
      scene.background.setHex(0x020308);
      scene.fog.color.setHex(0x020308);
      eventHorizon.material.opacity = 1.0;
      accretionDisk.material.opacity = 0.92;
      lensingHalo.material.opacity = 0.55;
      shipGroup.visible = false;
      photonClone.root.visible = false;
      photonClone2.root.visible = false;
      photonClone.suitMat.color.setHex(0x38bdf8);
      photonClone.orangeAccentMat.color.setHex(0x00f2fe);
      lavaPlanetGroup.visible = false;
      clocksGroup.visible = false;
      tidalRingsGroup.visible = false;
      tesseractGroup.visible = false;
      earthGroup.visible = false;
      futureRingsGroup.visible = false;
      sunSprite.visible = false;
      xrayFunnel.material.opacity = 0.0;
      gridMat.opacity = 0.16;
      astronaut.flameMat.opacity = 0.0;
      astronaut.suitMat.color.setHex(0xeff6ff);
      astronaut.orangeAccentMat.color.setHex(0xff6b00);
      astronaut.root.scale.setScalar(BASE_ASTRO_SCALE);
      astronaut.root.rotation.set(0, 0, 0);
      astronaut.leftLeg.scale.set(1, 1, 1);
      astronaut.rightLeg.scale.set(1, 1, 1);
      astronaut.leftLeg.rotation.set(0, 0, 0);
      astronaut.rightLeg.rotation.set(0, 0, 0);
      astronaut.thrusterL.scale.set(1, 1, 1);
      astronaut.thrusterR.scale.set(1, 1, 1);
      flashOverlay.style.opacity = '0';

      // Transição suave entre atos (sem piscar)
      if (transitionOverlay) {
        const toStart = clampedT - activeBeat.start;
        const toEnd = activeBeat.end - clampedT;
        let transitionAmount = 0;
        if (activeBeat.index > 0) transitionAmount = Math.max(transitionAmount, 1 - smoothstep(0, 0.55, toStart));
        if (activeBeat.index < BEATS.length - 1) transitionAmount = Math.max(transitionAmount, 1 - smoothstep(0, 0.55, toEnd));
        transitionOverlay.style.opacity = (transitionAmount * 0.22).toFixed(3);
      }

      // Movimento orgânico contínuo do Gargantua e partículas (sem estroboscópio)
      accretionDisk.rotation.z = clampedT * 0.72;
      lensingHalo.rotation.z = -clampedT * 0.52;
      photonRing.scale.setScalar(1 + Math.sin(clampedT * 2.2) * 0.015);
      nebulaBlueGroup.rotation.z = Math.sin(clampedT * 0.08) * 0.02;
      nebulaWarmGroup.rotation.z = -Math.sin(clampedT * 0.07) * 0.02;
      nebulaVioletGroup.rotation.z = Math.sin(clampedT * 0.06) * 0.02;

      const posArr = vortexGeo.attributes.position.array;
      for (let i = 0; i < vortexCount; i++) {
        const d = vortexOrbitData[i];
        const curAngle = d.angle + clampedT * d.speed * 1.15;
        posArr[i * 3] = Math.cos(curAngle) * d.radius;
        posArr[i * 3 + 1] = d.yOffset + Math.sin(clampedT * 1.8 + i) * 0.05;
        posArr[i * 3 + 2] = Math.sin(curAngle) * d.radius;
      }
      vortexGeo.attributes.position.needsUpdate = true;

      // =====================================================================
      // COREOGRAFIA DOS 12 AMBIENTES DISTINTOS
      // =====================================================================
      if (activeBeat.id === 'missionStart') {
        // CENÁRIO 1: Interior da Cabine da Orion VII aproximando-se do Gargantua!
        scene.background.setHex(0x030714);
        cockpitGroup.visible = true;
        warpLinesGroup.visible = true;
        spacetimeGrid.visible = false;

        // O Gargantua começa longe no espaço e vai crescendo pelo para-brisa da nave!
        const approach = smoothstep(0, 1, u);
        gargantuaGroup.position.set(0.28, 1.05, -7.5 + approach * 5.2);
        gargantuaGroup.scale.setScalar(0.36 + approach * 0.42);
        gargantuaGroup.rotation.set(0.15, -0.22, 0.08);

        holoRadarGroup.rotation.y = clampedT * 0.85;
        yokeGroup.rotation.z = Math.sin(clampedT * 1.6) * 0.12;

        warpLines.forEach(w => {
          w.mesh.position.z = ((w.baseZ + clampedT * w.speed * 0.45) % 10) - 6;
        });

        astronaut.setExpression('calm', clampedT);
        astronaut.root.scale.setScalar(0.36);
        astronaut.root.position.set(-0.56, -0.32 + Math.sin(clampedT * 1.8) * 0.02, 5.55);
        astronaut.root.rotation.set(0.02, 0.58, 0);
        astronaut.leftArm.rotation.z = -0.55;
        astronaut.rightArm.rotation.z = 0.85 + Math.sin(clampedT * 1.6) * 0.08;

        camera.position.set(Math.sin(u * Math.PI) * 0.12, 0.65 + Math.sin(u * Math.PI) * 0.05, 11.2 - approach * 0.45);
        camera.lookAt(0.0, 0.45, 0.0);

      } else if (activeBeat.id === 'shipTear') {
        // CENÁRIO 2: Exterior Diagonal em Campo de Asteroides & Ejeção da Nave!
        scene.background.setHex(0x040816);
        debrisGroup.visible = true;
        nebulaBlueGroup.visible = true;

        // Buraco Negro deslocado no canto superior esquerdo em perspectiva dramática!
        gargantuaGroup.position.set(-1.35, 1.25, -3.2);
        gargantuaGroup.scale.setScalar(0.88);
        gargantuaGroup.rotation.set(0.22, 0.38, -0.15);

        astronaut.setExpression('shock', clampedT);
        astronaut.flameMat.opacity = 0.85;
        astronaut.thrusterL.scale.y = 0.9 + Math.sin(clampedT * 3.5) * 0.12;
        astronaut.thrusterR.scale.y = 0.9 + Math.cos(clampedT * 3.5) * 0.12;

        // Astronauta ejetado da nave na diagonal
        astronaut.root.position.set(-0.58 + u * 0.25, -0.10 + Math.sin(clampedT * 2.2) * 0.06, 3.25 - u * 0.25);
        astronaut.root.rotation.set(0.10, 0.22, Math.sin(clampedT * 2.0) * 0.10);
        astronaut.leftArm.rotation.z = -1.75 - Math.sin(clampedT * 2.4) * 0.12;
        astronaut.rightArm.rotation.z = 1.75 + Math.cos(clampedT * 2.4) * 0.12;

        shipGroup.visible = true;
        shipGroup.scale.setScalar(0.72 * (1 - u * 0.18));
        shipGroup.position.set(0.78 - u * 0.45, 0.42 - u * 0.28, 2.6 - u * 1.3);
        shipGroup.rotation.set(clampedT * 0.9, -0.55 + u * 1.4, clampedT * 0.7);

        wingLeft.position.set(-0.1 - u * 1.45, u * 0.85, 0.88 + u * 1.05);
        wingLeft.rotation.set(clampedT * 1.8, clampedT * 1.4, 0);
        wingRight.position.set(-0.1 - u * 1.55, -u * 0.95, -0.88 - u * 1.05);
        wingRight.rotation.set(-clampedT * 1.8, clampedT * 1.4, 0);

        camera.position.set(0.55 + Math.sin(u * Math.PI) * 0.65, 0.95, 10.8 - u * 0.6);
        camera.lookAt(-0.15, 0.30, 0.2);

      } else if (activeBeat.id === 'photonMirror') {
        // CENÁRIO 3: Corredor Dourado de Espelhos da Esfera de Fótons 360° (3 Clones em Linha!)
        scene.background.setHex(0x0c0702);
        scene.fog.color.setHex(0x0c0702);
        photonTunnelGroup.visible = true;
        spacetimeGrid.visible = false;

        // Gargantua posicionado na lateral esquerda curvando os arcos de luz!
        gargantuaGroup.position.set(-2.45, 0.25, -2.2);
        gargantuaGroup.scale.setScalar(0.85);
        gargantuaGroup.rotation.y = 0.65;

        photonArches.forEach((arch, idx) => {
          arch.rotation.z = clampedT * (0.25 + idx * 0.04) * (idx % 2 === 0 ? 1 : -1);
        });
        photonBeamRing.rotation.z = -clampedT * 0.85;

        // Astronauta principal à direita olhando para as costas dos seus Clones Ópticos!
        astronaut.setExpression('shock', clampedT);
        astronaut.root.position.set(0.68, -0.05, 3.25);
        astronaut.root.rotation.set(0, -0.48, 0);
        astronaut.leftArm.rotation.z = -1.45;
        astronaut.rightArm.rotation.z = 0.65;

        photonClone.root.visible = true;
        photonClone.root.scale.setScalar(BASE_ASTRO_SCALE * 0.88);
        photonClone.root.position.set(-0.42, 0.12 + Math.sin(clampedT * 2.0) * 0.05, 2.35);
        photonClone.root.rotation.set(0, Math.PI - 0.38, 0);
        photonClone.leftArm.rotation.z = -1.45;
        photonClone.rightArm.rotation.z = 0.65;

        photonClone2.root.visible = true;
        photonClone2.root.scale.setScalar(BASE_ASTRO_SCALE * 0.66);
        photonClone2.root.position.set(-1.25, 0.28 + Math.cos(clampedT * 2.0) * 0.05, 1.15);
        photonClone2.root.rotation.set(0, Math.PI - 0.38, 0);
        photonClone2.leftArm.rotation.z = -1.45;
        photonClone2.rightArm.rotation.z = 0.65;

        camera.position.set(Math.sin(u * Math.PI * 0.8) * 1.35, 0.95, 10.2);
        camera.lookAt(-0.15, 0.22, 1.4);

      } else if (activeBeat.id === 'planetDestruction') {
        // CENÁRIO 4: Cataclismo Vulcânico em Close-Up (Planeta Gigante Sendo Sugado!)
        scene.background.setHex(0x0b0302);
        scene.fog.color.setHex(0x0b0302);
        nebulaWarmGroup.visible = true;
        nebulaBlueGroup.visible = false;
        debrisGroup.visible = true;

        // Gargantua faminto no canto superior direito!
        gargantuaGroup.position.set(1.15, 1.35, -2.6);
        gargantuaGroup.scale.setScalar(0.85);
        gargantuaGroup.rotation.set(0.18, -0.35, 0.12);

        // Planeta de Lava em primeiro plano à esquerda sendo rasgado!
        lavaPlanetGroup.visible = true;
        const pScale = Math.max(0.38, 0.96 - u * 0.45);
        lavaPlanetCore.scale.set(pScale * (1 + u * 0.48), pScale * (1 - u * 0.22), pScale);
        lavaPlanetGroup.position.set(-0.82 + u * 0.35, -0.15 + u * 0.25, 2.6 - u * 1.1);
        lavaPlanetCore.rotation.y = clampedT * 0.95;

        // Rio espiral de rochas de magma subindo do planeta para o Gargantua!
        lavaChunks.forEach((c, idx) => {
          const prog = (u * 0.85 + (idx / lavaChunks.length)) % 1.0;
          const sx = THREE.MathUtils.lerp(0, 1.95, prog);
          const sy = THREE.MathUtils.lerp(0, 1.50, prog) + Math.sin(prog * Math.PI * 3 + c.seed) * 0.38;
          const sz = THREE.MathUtils.lerp(0, -4.2, prog);
          c.mesh.position.set(sx, sy, sz);
          c.mesh.rotation.set(clampedT * 1.4 + idx, clampedT * 1.1, idx);
        });

        astronaut.setExpression('panic', clampedT);
        astronaut.root.position.set(0.78, -0.32 + Math.sin(clampedT * 2.2) * 0.05, 3.25);
        astronaut.root.rotation.set(0, -0.38, -0.08);
        astronaut.leftArm.rotation.z = -2.05 - Math.sin(clampedT * 2.5) * 0.12;
        astronaut.rightArm.rotation.z = 2.05 + Math.cos(clampedT * 2.5) * 0.12;

        camera.position.set(-0.25 + Math.sin(u * Math.PI) * 0.65, 0.88, 10.4 - u * 0.5);
        camera.lookAt(0, 0.25, 0.5);

      } else if (activeBeat.id === 'timeClocks') {
        // CENÁRIO 5: Observatório Quântico do Tempo (Abismo Esquerdo vs Sistema Solar Direito!)
        scene.background.setHex(0x020912);
        scene.fog.color.setHex(0x020912);

        // Gargantua menor no quadrante esquerdo
        gargantuaGroup.position.set(-1.15, 0.35, -2.2);
        gargantuaGroup.scale.setScalar(0.62);

        // Terra 3D + Lua girando rapidamente no quadrante direito!
        earthGroup.visible = true;
        futureRingsGroup.visible = true;
        earthGroup.scale.setScalar(0.36);
        earthGroup.position.set(0.95, 0.15, 2.2);
        earthMesh.rotation.y = clampedT * 1.65;
        moonPivot.rotation.y = clampedT * 3.2;

        clocksGroup.visible = true;
        clockLeft.group.scale.setScalar(0.86);
        clockRight.group.scale.setScalar(0.86);
        clockLeft.handPivot.rotation.z = -u * 0.48; // Relógio do astronauta quase parado (+1s)
        clockRight.handPivot.rotation.z = -u * 8.5; // Relógio da Terra avança rápido mas orgânico (+1.000 anos)

        astronaut.setExpression('shock', clampedT);
        astronaut.root.position.set(-0.15, -0.32, 3.25);
        astronaut.root.rotation.set(0, 0.12, 0);
        astronaut.leftArm.rotation.z = -1.45;
        astronaut.rightArm.rotation.z = 1.45;

        updateSpacetimeWell(5.5 + u * 4.5);
        gridMat.opacity = 0.32;

        camera.position.set(Math.sin(u * Math.PI * 0.7) * 0.75, 1.05, 10.4);
        camera.lookAt(0, 0.42, 1.5);

      } else if (activeBeat.id === 'redshiftFreeze') {
        // CENÁRIO 6: Câmara Carmesim de Ondas de Luz Redshift & Estátua Congelada!
        scene.background.setHex(0x0c0206);
        scene.fog.color.setHex(0x0c0206);
        nebulaWarmGroup.visible = true;
        nebulaBlueGroup.visible = false;
        redshiftWavesGroup.visible = true;

        // Gargantua como um grande horizonte planetário escuro abaixo!
        gargantuaGroup.position.set(0, -1.55, -1.8);
        gargantuaGroup.scale.setScalar(1.18);
        gargantuaGroup.rotation.x = 0.25;

        redshiftWaves.forEach((w, idx) => {
          w.position.y = Math.sin(clampedT * 1.8 + idx) * 0.12;
        });

        // Estátua Óptica Vermelha 100% congelada na esquerda
        photonClone.root.visible = true;
        photonClone.root.scale.setScalar(BASE_ASTRO_SCALE * 0.94);
        photonClone.suitMat.color.setHex(0xe11d48);
        photonClone.orangeAccentMat.color.setHex(0x881337);
        photonClone.root.position.set(-0.72, 0.38, 2.4);
        photonClone.root.rotation.set(0.15, 0.28, -0.16);
        photonClone.leftArm.rotation.z = -1.85;
        photonClone.rightArm.rotation.z = 1.85;

        // Astronauta real afundando suavemente na direita
        astronaut.setExpression('panic', clampedT);
        astronaut.suitMat.color.lerpColors(new THREE.Color(0xeff6ff), new THREE.Color(0xfca5a5), u * 0.65);
        astronaut.root.position.set(0.62 - u * 0.22, 0.22 - u * 0.45, 3.0 - u * 0.5);
        astronaut.root.rotation.set(u * 0.18, -0.22, Math.sin(clampedT * 1.6) * 0.06);
        astronaut.leftArm.rotation.z = -1.95;
        astronaut.rightArm.rotation.z = 1.95;

        camera.position.set(0.35 + Math.sin(u * Math.PI) * 0.55, 0.95 - u * 0.15, 10.6 - u * 0.8);
        camera.lookAt(0, 0.15, 0.6);

      } else if (activeBeat.id === 'feetPull') {
        // CENÁRIO 7: Poço Vertical de Vetores de Força G (Câmera Low-Angle nas Botas!)
        scene.background.setHex(0x090205);
        nebulaWarmGroup.visible = true;
        gravityVectorsGroup.visible = true;
        tidalRingsGroup.visible = true;

        gargantuaGroup.position.set(0, -2.55, -1.4);
        gargantuaGroup.scale.setScalar(1.22);

        gravityPillars.forEach((p, idx) => {
          p.mesh.position.y = ((p.baseY - clampedT * 2.2) % 4.5) + 1.2;
        });

        astronaut.setExpression('panic', clampedT);
        astronaut.root.position.set(0, 0.18 - u * 0.22, 3.1);
        astronaut.leftArm.rotation.z = -2.35 - Math.sin(clampedT * 2.2) * 0.08;
        astronaut.rightArm.rotation.z = 2.35 + Math.cos(clampedT * 2.2) * 0.08;

        astronaut.leftLeg.scale.set(1 - u * 0.18, 1 + u * 0.48, 1 - u * 0.18);
        astronaut.rightLeg.scale.set(1 - u * 0.18, 1 + u * 0.48, 1 - u * 0.18);

        tidalRingsGroup.position.set(0, -0.65 - u * 0.25, 3.1);
        tidalRings.forEach((tr, idx) => {
          const wave = ((u * 0.85 + idx * 0.25) % 1.0);
          tr.position.y = -wave * 0.95;
          tr.scale.setScalar(1.0 - wave * 0.35);
        });

        camera.position.set(0.30 + Math.sin(u * Math.PI) * 0.45, -0.05, 9.6 - u * 0.25);
        camera.lookAt(0, -0.75, 2.6);

      } else if (activeBeat.id === 'spaghettiStretch') {
        // CENÁRIO 8: Cânion de Compressão Lateral & Espaguetificação Completa!
        scene.background.setHex(0x0a0402);
        nebulaWarmGroup.visible = true;
        compressionWallsGroup.visible = true;
        tidalRingsGroup.visible = true;
        shipGroup.visible = true;

        gargantuaGroup.position.set(0, -2.15, -1.8);
        gargantuaGroup.scale.setScalar(1.15);

        astronaut.setExpression('panic', clampedT);
        const s = smoothstep(0, 1, u);
        const stretchY = BASE_ASTRO_SCALE * (1.0 + s * 1.15);
        const compressXZ = BASE_ASTRO_SCALE * Math.max(0.24, 1.0 - s * 0.56);

        astronaut.root.scale.set(compressXZ, stretchY, compressXZ);
        astronaut.root.position.set(-0.32, -0.15 + Math.sin(clampedT * 2.2) * 0.03, 2.9);
        astronaut.leftArm.rotation.z = -2.55;
        astronaut.rightArm.rotation.z = 2.55;

        shipGroup.position.set(0.85, -0.1, 2.5);
        shipGroup.rotation.set(0, 0, Math.PI * 0.46);
        shipGroup.scale.set(0.68 * (1 + s * 1.4), 0.68 * Math.max(0.22, 1 - s * 0.62), 0.68 * Math.max(0.22, 1 - s * 0.62));

        tidalRingsGroup.position.set(-0.32, -1.35, 2.9);
        tidalRings.forEach((tr, idx) => {
          tr.position.y = -idx * 0.32;
          tr.scale.setScalar(0.85 - idx * 0.12);
        });

        camera.position.set(0.85 - u * 0.70, 0.58 + Math.sin(u * Math.PI) * 0.18, 10.9);
        camera.lookAt(-0.1, 0.05, 1.5);

      } else if (activeBeat.id === 'eventHorizonCross') {
        // CENÁRIO 9: Retorno à Cabine em Dobra Espacial > 300.000 km/s Cruzando o Horizonte!
        scene.background.setHex(0x050210);
        cockpitGroup.visible = true;
        warpLinesGroup.visible = true;
        nebulaVioletGroup.visible = true;
        nebulaBlueGroup.visible = false;
        spacetimeGrid.visible = false;

        const approach = smoothstep(0, 1, u);
        gargantuaGroup.position.set(0.18, 0.95, -1.8 + approach * 1.9);
        gargantuaGroup.scale.setScalar(0.85 + approach * 0.48);

        warpLines.forEach(w => {
          w.mesh.position.z = ((w.baseZ + clampedT * w.speed * 0.9) % 10) - 5;
        });

        holoRadarGroup.rotation.y = clampedT * 2.4;
        yokeGroup.rotation.z = Math.sin(clampedT * 2.8) * 0.18;

        astronaut.setExpression('shock', clampedT);
        astronaut.root.scale.setScalar(0.36);
        astronaut.root.position.set(-0.56, -0.32 + approach * 0.06, 5.55);
        astronaut.root.rotation.set(0.02, 0.58, -approach * 0.04);
        astronaut.leftArm.rotation.z = -0.65 - approach * 0.25;
        astronaut.rightArm.rotation.z = 0.92 + approach * 0.25;

        camera.position.set(Math.sin(u * Math.PI) * 0.14, 0.65 + approach * 0.15, 11.0 - approach * 2.4);
        camera.lookAt(0.0, 0.55, 0.0);
        flashOverlay.style.opacity = (smoothstep(0.68, 0.98, u) * 0.14).toFixed(3);

      } else if (activeBeat.id === 'topDownXray') {
        // CENÁRIO 10: Visão Aérea Top-Down 50° + Raio-X da Garganta do Espaço-Tempo!
        scene.background.setHex(0x020612);
        innerRingsGroup.visible = true;
        nebulaVioletGroup.visible = true;
        nebulaBlueGroup.visible = false;

        astronaut.setExpression('shock', clampedT);
        astronaut.root.scale.setScalar(BASE_ASTRO_SCALE * 0.90);

        const spiralAngle = u * Math.PI * 2.4;
        const spiralRadius = (1 - u * 0.55) * 1.15;
        astronaut.root.position.set(
          Math.cos(spiralAngle) * spiralRadius,
          -0.4 - u * 1.8,
          Math.sin(spiralAngle) * spiralRadius
        );
        astronaut.root.rotation.set(0.5, spiralAngle, 0.3);
        astronaut.leftArm.rotation.z = -1.95;
        astronaut.rightArm.rotation.z = 1.95;

        innerRings.forEach((ring, i) => {
          ring.rotation.z = clampedT * (0.12 + i * 0.02);
        });

        eventHorizon.material.opacity = 0.22;
        accretionDisk.material.opacity = 0.42;
        lensingHalo.material.opacity = 0.24;
        xrayFunnel.material.opacity = 0.24;
        gridMat.opacity = 0.65;
        updateSpacetimeWell(10.5);

        camera.position.set(Math.sin(u * Math.PI * 0.7) * 0.85, 8.45, 6.0 - u * 0.35);
        camera.lookAt(0, -1.75, 0);

      } else if (activeBeat.id === 'tesseractWormhole') {
        // CENÁRIO 11: Dimensão Quântica 4D (Tesseract + Túnel de Buraco de Minhoca sem Buraco Negro!)
        scene.background.setHex(0x060214);
        scene.fog.color.setHex(0x060214);
        gargantuaGroup.visible = false;
        spacetimeGrid.visible = false;
        nebulaVioletGroup.visible = true;
        nebulaBlueGroup.visible = false;
        tesseractGroup.visible = true;

        astronaut.setExpression('shock', clampedT);
        astronaut.root.scale.setScalar(BASE_ASTRO_SCALE * 0.92);
        astronaut.root.position.set(0, -0.15 + Math.sin(clampedT * 2.2) * 0.08, 2.6);
        astronaut.root.rotation.set(0, Math.sin(clampedT * 1.4) * 0.24, 0);
        astronaut.leftArm.rotation.z = -1.45;
        astronaut.rightArm.rotation.z = 1.45;

        tesseractGroup.position.set(0, 0.25, 2.6);
        tesseractGroup.rotation.x = clampedT * 0.45;
        tesseractGroup.rotation.y = clampedT * 0.65;
        innerCube.rotation.z = -clampedT * 0.85;

        wormholeRings.forEach((wr, idx) => {
          wr.rotation.z = clampedT * (0.4 + idx * 0.05) * (idx % 2 === 0 ? 1 : -1);
          wr.scale.setScalar(1 + Math.sin(clampedT * 2 + idx) * 0.06);
        });

        if (u > 0.75) {
          const portalGlow = smoothstep(0.75, 1.0, u);
          flashOverlay.style.opacity = (portalGlow * 0.16).toFixed(3);
        }

        camera.position.set(Math.sin(u * Math.PI * 1.1) * 1.15, 0.75 + Math.cos(u * Math.PI) * 0.22, 9.1 - u * 0.45);
        camera.lookAt(0, 0.20, 2.0);

      } else if (activeBeat.id === 'futureEarthReturn') {
        // CENÁRIO 12: Órbita Futurista da Terra no Ano 3.002.026 com Anéis Orbitais, Lua e Sol!
        scene.background.setHex(0x020818);
        scene.fog.color.setHex(0x020818);
        gargantuaGroup.visible = false;
        spacetimeGrid.visible = false;
        nebulaBlueGroup.visible = true;

        earthGroup.visible = true;
        futureRingsGroup.visible = true;
        sunSprite.visible = true;
        earthGroup.scale.setScalar(0.96);
        earthGroup.position.set(0, 0.62, -1.35);
        earthMesh.rotation.y = clampedT * 0.35;
        orbitalRing1.rotation.z = clampedT * 0.25;
        orbitalRing2.rotation.z = -clampedT * 0.20;
        moonPivot.rotation.y = clampedT * 0.45;

        astronaut.setExpression('happy', clampedT);
        const bounce = Math.exp(-u * 3.0) * Math.sin(u * 5.2) * 0.075;
        astronaut.root.scale.set(
          BASE_ASTRO_SCALE * (1.0 - bounce * 0.35),
          BASE_ASTRO_SCALE * (1.0 + bounce * 0.55),
          BASE_ASTRO_SCALE * (1.0 - bounce * 0.35)
        );
        astronaut.root.position.set(0, -0.38 + Math.sin(clampedT * 2.0) * 0.06, 3.4);
        astronaut.root.rotation.set(0, 0.12, 0);

        // Aceno orgânico e carismático!
        astronaut.rightArm.rotation.z = 2.35 + Math.sin(u * Math.PI * 2.2) * 0.22;
        astronaut.leftArm.rotation.z = -0.35;

        camera.position.set(Math.sin(u * Math.PI * 0.55) * 1.35, 0.72 + Math.sin(u * Math.PI) * 0.18, 10.2 + u * 0.8);
        camera.lookAt(0, 0.25, -0.25);
      }

      scene.updateMatrixWorld(true);
      updateLabelsWithAntiCollision(activeBeat);

      renderer.render(scene, camera);
    }

    // =========================================================================
    // 8. LOOP INTERATIVO + HOOKS DE CAPTURA HEADLESS GPU (60FPS)
    // =========================================================================
    let simTime = 0;
    let isPlaying = true;
    let lastPerf = performance.now();

    function animate(now) {
      requestAnimationFrame(animate);
      if (isPlaying) {
        const dt = Math.min(0.1, (now - lastPerf) / 1000);
        simTime += dt;
        if (simTime >= TOTAL_DURATION) {
          simTime = 0;
        }
        updateSceneAtTime(simTime);
      }
      lastPerf = now;
    }

    window.seekToTime = function(t) {
      isPlaying = false;
      simTime = Number(t) || 0;
      updateSceneAtTime(simTime);
    };

    window.renderDeterministicFrame = function(t) {
      isPlaying = false;
      simTime = Number(t) || 0;
      updateSceneAtTime(simTime);
    };

    window.getTotalDuration = () => TOTAL_DURATION;

    const btnPlay = document.getElementById('btn-play');
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      lastPerf = performance.now();
      btnPlay.textContent = isPlaying ? '⏸ Pausar' : '▶ Tocar';
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      simTime = 0;
      isPlaying = true;
      lastPerf = performance.now();
      btnPlay.textContent = '⏸ Pausar';
      updateSceneAtTime(0);
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
      const idx = Math.max(0, currentBeatIndex - 1);
      simTime = BEATS[idx].start + 0.05;
      updateSceneAtTime(simTime);
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      const idx = Math.min(BEATS.length - 1, currentBeatIndex + 1);
      simTime = BEATS[idx].start + 0.05;
      updateSceneAtTime(simTime);
    });

    window.addEventListener('resize', () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      updateSceneAtTime(simTime);
    });

    updateSceneAtTime(0);
    requestAnimationFrame(animate);
  </script>
</body>
</html>
`;

writeFileSync('buraco-negro-3d.html', htmlContent, 'utf-8');
copyFileSync('buraco-negro-3d.html', 'C:/Users/Ruan Gomes/Downloads/buraco_negro_animacao_vertical_3d.html');
copyFileSync('buraco-negro-3d.html', 'C:/Users/Ruan Gomes/Downloads/buraco_negro_animacao_vertical_3d (1).html');
console.log('✅ buraco-negro-3d.html v15.0 (12 Cenários Diferentes + Cabine 3D + Animação Orgânica) gerado com sucesso!');
