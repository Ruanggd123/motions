import { writeFileSync, readFileSync, copyFileSync } from 'node:fs';

const timingData = JSON.parse(readFileSync('src/estrelaTiming.json', 'utf-8'));

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>E Se Você Encontrasse uma Estrela de Nêutrons (Magnetar)? — 12 Cenários 3D</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Syne:wght@700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-void: #02040a;
      --surface-glass: rgba(7, 12, 26, 0.86);
      --border-light: rgba(255, 255, 255, 0.14);
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
      background: radial-gradient(circle, rgba(180,245,255,0.65) 0%, rgba(168,85,247,0.28) 45%, transparent 80%);
      opacity: 0; pointer-events: none; z-index: 12; mix-blend-mode: screen;
    }

    #transition-overlay {
      position: absolute; inset: 0; z-index: 13; pointer-events: none;
      opacity: 0;
      background: radial-gradient(ellipse at center, rgba(2, 6, 16, 0.08) 0%, rgba(1, 3, 10, 0.42) 100%);
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
    .story-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-violet), var(--accent-gold)); border-radius: 999px; }

    .header-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }

    .phase-badge {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 5px 12px; border-radius: 999px;
      background: var(--surface-glass); border: 1px solid rgba(0, 242, 254, 0.35);
      backdrop-filter: blur(14px);
      font-size: 0.68rem; font-weight: 800; letter-spacing: 0.06em;
      text-transform: uppercase; color: #fff;
    }

    .phase-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent-cyan); box-shadow: 0 0 10px var(--accent-cyan);
    }

    .step-counter {
      padding: 5px 10px; border-radius: 999px;
      background: var(--surface-glass); border: 1px solid var(--border-light);
      font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: var(--accent-cyan);
    }

    .bottom-bar { display: flex; flex-direction: column; gap: 10px; pointer-events: auto; }

    .subtitle-card {
      background: rgba(6, 10, 22, 0.90);
      border: 1px solid rgba(0, 242, 254, 0.32);
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

    /* Painel de Telemetria Limpo (SEM barra vermelha inferior #warning-box!) */
    .telemetry-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
      background: rgba(7, 11, 24, 0.88); border: 1px solid var(--border-light);
      border-radius: 14px; padding: 7px 8px; backdrop-filter: blur(16px);
    }
    .tele-card {
      background: rgba(255, 255, 255, 0.03); border-radius: 9px; padding: 5px 6px;
      text-align: center; display: flex; flex-direction: column; gap: 2px;
    }
    .tele-label {
      font-size: 0.52rem; font-weight: 800; color: var(--text-dim);
      letter-spacing: 0.05em; text-transform: uppercase;
    }
    .tele-val {
      font-family: var(--font-mono); font-size: 0.68rem; font-weight: 800; color: var(--accent-cyan);
    }
    .tele-bar-bg {
      width: 100%; height: 3px; border-radius: 99px; background: rgba(255,255,255,0.12); overflow: hidden; margin-top: 2px;
    }
    .tele-bar-fill {
      height: 100%; width: 25%; background: linear-gradient(90deg, #10b981, #fbbf24, #f43f5e);
    }

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
      background: linear-gradient(135deg, var(--accent-cyan), #2563eb);
      color: #041019;
      border-color: transparent;
    }

    .time-readout {
      font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--text-dim);
    }

    body.capture-mode .controls-row,
    body.capture-mode .telemetry-grid { display: none !important; }
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
        <div id="lbl-primary-pill" class="float-pill pill-cyan">ESTRELA DE NÊUTRONS</div>
        <div id="lbl-primary-stem" class="float-stem" style="color: #00f2fe;"></div>
        <div id="lbl-primary-dot" class="float-dot" style="color: #00f2fe;"></div>
      </div>
      <div id="lbl-secondary" class="float-label">
        <div id="lbl-secondary-pill" class="float-pill pill-gold">ASTRONAUTA</div>
        <div id="lbl-secondary-stem" class="float-stem" style="color: #fbbf24;"></div>
        <div id="lbl-secondary-dot" class="float-dot" style="color: #fbbf24;"></div>
      </div>
    </div>

    <div id="hud">
      <div class="top-bar">
        <div class="story-progress" id="story-progress"></div>
        <div class="header-row">
          <div class="phase-badge">
            <span class="phase-dot" id="phase-dot"></span>
            <span id="phase-title">1. CABINE DA VALKYRIE IX</span>
          </div>
          <div class="step-counter" id="step-counter">1/12</div>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="subtitle-card">
          <p id="subtitle-text">Iniciando simulação astrofísica Magnetar SGR 1806-20...</p>
        </div>
        <div class="telemetry-grid">
          <div class="tele-card">
            <span class="tele-label">CAMPO MAGNÉTICO</span>
            <span class="tele-val" id="tele-mag" style="color: #00f2fe;">10¹⁵ GAUSS</span>
          </div>
          <div class="tele-card">
            <span class="tele-label">GRAVIDADE G</span>
            <span class="tele-val" id="tele-grav" style="color: #fbbf24;">2.0×10¹¹ G</span>
            <div class="tele-bar-bg"><div class="tele-bar-fill" id="tele-bar"></div></div>
          </div>
          <div class="tele-card">
            <span class="tele-label">ROTAÇÃO PULSAR</span>
            <span class="tele-val" id="tele-spin" style="color: #a855f7;">716 RPS</span>
          </div>
        </div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="btn-play">⏸ Pausar</button>
          <button class="ctrl-btn" id="btn-prev">⏮ Ato</button>
          <button class="ctrl-btn" id="btn-next">⏭ Ato</button>
          <button class="ctrl-btn" id="btn-restart">↺ Replay</button>
          <span class="time-readout" id="time-readout">00.0s / 80.0s</span>
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
    // 1. TIMING & 12 ATOS COM 12 CENÁRIOS DIFERENTES
    // =========================================================================
    const TOTAL_DURATION = ${timingData.totalDuration};
    const BASE_ASTRO_SCALE = 0.48;

    const BEATS = [
      {
        index: 0,
        id: 'cockpitArrival',
        title: '1. CABINE DA VALKYRIE IX',
        color: '#00f2fe',
        start: ${timingData.beats[0].start},
        end: ${timingData.beats[0].end},
        mag: '1.2×10¹² G', grav: '1.4×10⁹ G', bar: 18, spin: '716 RPS',
        subtitle: 'Imagine que sua nave saiu da dobra diante do objeto mais extremo do cosmos: uma <span class="hl hl-cyan">ESTRELA DE NÊUTRONS</span>!',
        label1: { text: '🪟 VISOR: PULSAR A 716 GIROS/S!', style: 'pill-cyan', color: '#00f2fe', target: 'cockpitWindow' },
        label2: { text: '👨‍🚀 PILOTO NA PONTE 3D', style: 'pill-gold', color: '#fbbf24', target: 'astroHead' }
      },
      {
        index: 1,
        id: 'lighthouseBeams',
        title: '2. FAROL PULSAR DE 700 RPS',
        color: '#a855f7',
        start: ${timingData.beats[1].start},
        end: ${timingData.beats[1].end},
        mag: '8.5×10¹³ G', grav: '1.8×10¹⁰ G', bar: 32, spin: '716 RPS',
        subtitle: 'Nascida da morte de um sol gigante, ela gira <span class="hl hl-violet">700 VEZES POR SEGUNDO</span> com feixes mortais de <span class="hl hl-cyan">RADIAÇÃO</span>!',
        label1: { text: '🔦 FEIXES DE RAIOS-X E GAMA!', style: 'pill-violet', color: '#a855f7', target: 'beamTop' },
        label2: { text: '🌀 20 KM COM A MASSA DO SOL!', style: 'pill-cyan', color: '#00f2fe', target: 'coreTop' }
      },
      {
        index: 2,
        id: 'magneticShipRip',
        title: '3. DESARME MAGNÉTICO (10¹⁵ G)',
        color: '#ff6b00',
        start: ${timingData.beats[2].start},
        end: ${timingData.beats[2].end},
        mag: '1.0×10¹⁵ G', grav: '4.5×10¹⁰ G', bar: 48, spin: '716 RPS',
        subtitle: 'O campo magnético de <span class="hl hl-orange">1 QUATRILHÃO DE GAUSS</span> arranca o casco da nave e <span class="hl hl-red">EJETA VOCÊ</span> no espaço!',
        label1: { text: '🧲 CASCO DESMONTADO PELO ÍMÃ!', style: 'pill-orange', color: '#ff6b00', target: 'ship' },
        label2: { text: '🚀 EJEÇÃO DE EMERGÊNCIA!', style: 'pill-cyan', color: '#00f2fe', target: 'astroChest' }
      },
      {
        index: 3,
        id: 'spoonEverest',
        title: '4. COLHER = MONTE EVEREST',
        color: '#10b981',
        start: ${timingData.beats[3].start},
        end: ${timingData.beats[3].end},
        mag: '1.0×10¹⁵ G', grav: '2.0×10¹¹ G', bar: 62, spin: '716 RPS',
        subtitle: 'A gravidade é <span class="hl hl-gold">200 BILHÕES DE VEZES</span> maior que a da Terra: 1 colherinha pesa tanto quanto o <span class="hl hl-green">MONTE EVEREST</span>!',
        label1: { text: '🥄 1 COLHER DE CHÁ = 5 BILHÕES TON', style: 'pill-cyan', color: '#00f2fe', target: 'scaleLeft' },
        label2: { text: '🏔️ PESO DO MONTE EVEREST!', style: 'pill-green', color: '#10b981', target: 'scaleRight' }
      },
      {
        index: 4,
        id: 'vampireStar',
        title: '5. ESTRELA VAMPIRA EM AÇÃO',
        color: '#f97316',
        start: ${timingData.beats[4].start},
        end: ${timingData.beats[4].end},
        mag: '1.2×10¹⁵ G', grav: '2.4×10¹¹ G', bar: 70, spin: '716 RPS',
        subtitle: 'Ao seu lado, uma <span class="hl hl-orange">ESTRELA INTEIRA</span> é vampirizada, tendo seu plasma sugado numa <span class="hl hl-gold">ESPIRAL MORTAL</span>!',
        label1: { text: '☀️ ESTRELA SENDO SUGADA!', style: 'pill-orange', color: '#ff6b00', target: 'donorStar' },
        label2: { text: '☄️ RIO DE PLASMA INCANDESCENTE', style: 'pill-gold', color: '#fbbf24', target: 'astroHead' }
      },
      {
        index: 5,
        id: 'needleAtoms',
        title: '6. ÁTOMOS EM FORMA DE AGULHA',
        color: '#a855f7',
        start: ${timingData.beats[5].start},
        end: ${timingData.beats[5].end},
        mag: '1.5×10¹⁵ G', grav: '2.8×10¹¹ G', bar: 78, spin: '716 RPS',
        subtitle: 'O magnetismo extremo distorce até os <span class="hl hl-violet">ÁTOMOS DO SEU CORPO</span>, esticando cada átomo como uma <span class="hl hl-cyan">AGULHA QUÂNTICA</span>!',
        label1: { text: '⚛️ ÁTOMOS VIRAM FUSOS FINOS!', style: 'pill-violet', color: '#a855f7', target: 'atomCluster' },
        label2: { text: '⚡ NUVEM ELETRÔNICA COMPRIMIDA', style: 'pill-cyan', color: '#00f2fe', target: 'astroHead' }
      },
      {
        index: 6,
        id: 'starquakeVectors',
        title: '7. TERREMOTO ESTELAR & TRAÇÃO',
        color: '#f43f5e',
        start: ${timingData.beats[6].start},
        end: ${timingData.beats[6].end},
        mag: '2.0×10¹⁵ G', grav: '3.5×10¹¹ G', bar: 86, spin: '716 RPS',
        subtitle: 'Caindo a <span class="hl hl-cyan">100.000 KM/S</span>, um terremoto estelar trinca a crosta de ferro <span class="hl hl-red">10 BILHÕES DE VEZES</span> mais dura que o aço!',
        label1: { text: '⚡ TRAÇÃO DE 200 BILHÕES DE G!', style: 'pill-red', color: '#f43f5e', target: 'astroFeet' },
        label2: { text: '💥 CROSTA DE FERRO TRINCANDO!', style: 'pill-gold', color: '#fbbf24', target: 'astroHead' }
      },
      {
        index: 7,
        id: 'gammaFlareCanyon',
        title: '8. SUPER-EXPLOSÃO DE RAIOS GAMA',
        color: '#fbbf24',
        start: ${timingData.beats[7].start},
        end: ${timingData.beats[7].end},
        mag: '3.0×10¹⁵ G', grav: '5.0×10¹¹ G', bar: 92, spin: '716 RPS',
        subtitle: 'A fissura libera uma <span class="hl hl-gold">SUPER-EXPLOSÃO DE RAIOS GAMA</span> capaz de evaporar oceanos a <span class="hl hl-red">ANOS-LUZ DALI</span>!',
        label1: { text: '☀️ TSUNAMI DE RAIOS GAMA!', style: 'pill-gold', color: '#fbbf24', target: 'astroChest' },
        label2: { text: '🔥 COMPRESSÃO MAGNÉTICA EXTREMA!', style: 'pill-red', color: '#f43f5e', target: 'astroFeet' }
      },
      {
        index: 8,
        id: 'cockpitCrustDive',
        title: '9. MERGULHO A 100.000 KM/S',
        color: '#00f2fe',
        start: ${timingData.beats[8].start},
        end: ${timingData.beats[8].end},
        mag: '4.5×10¹⁵ G', grav: '8.0×10¹¹ G', bar: 96, spin: '716 RPS',
        subtitle: 'De volta à cabine em <span class="hl hl-cyan">VELOCIDADE RELATIVÍSTICA</span>, você atravessa a crosta cristalina rumo ao <span class="hl hl-violet">NÚCLEO PROIBIDO</span>!',
        label1: { text: '🚨 PERFURANDO A CROSTA DE FERRO!', style: 'pill-cyan', color: '#00f2fe', target: 'cockpitWindow' },
        label2: { text: '⚡ VELOCIDADE: 33% DA LUZ!', style: 'pill-violet', color: '#a855f7', target: 'astroHead' }
      },
      {
        index: 9,
        id: 'nuclearPastaXray',
        title: '10. RAIO-X TOP-DOWN: MASSA NUCLEAR',
        color: '#10b981',
        start: ${timingData.beats[9].start},
        end: ${timingData.beats[9].end},
        mag: '6.0×10¹⁵ G', grav: '1.2×10¹² G', bar: 99, spin: '716 RPS',
        subtitle: 'Em visão <span class="hl hl-cyan">RAIO-X TOP-DOWN</span>, surge a <span class="hl hl-gold">MASSA NUCLEAR</span>: nêutrons prensados como nhoque, espaguete e lasanha atômica!',
        label1: { text: '🍝 CAMADAS DE MASSA NUCLEAR!', style: 'pill-gold', color: '#fbbf24', target: 'pastaRim' },
        label2: { text: '🔬 MATÉRIA MAIS DENSA DO COSMOS', style: 'pill-cyan', color: '#00f2fe', target: 'astroHead' }
      },
      {
        index: 10,
        id: 'kilonovaGoldForge',
        title: '11. COLISÃO KILONOVA & OURO PURO',
        color: '#eab308',
        start: ${timingData.beats[10].start},
        end: ${timingData.beats[10].end},
        mag: '9.9×10¹⁵ G', grav: '9.9×10¹² G', bar: 100, spin: '1.400 RPS',
        subtitle: 'Quando duas estrelas de nêutrons colidem numa <span class="hl hl-gold">KILONOVA</span>, a explosão forja <span class="hl hl-orange">OURO E PLATINA PUROS</span> no espaço!',
        label1: { text: '💥 FUSÃO KILONOVA: FÁBRICA DE OURO!', style: 'pill-gold', color: '#fbbf24', target: 'kilonovaTop' },
        label2: { text: '🪙 PEPITAS DE OURO CÓSMICO!', style: 'pill-orange', color: '#ff6b00', target: 'kilonovaGold' }
      },
      {
        index: 11,
        id: 'earthGoldReturn',
        title: '12. RETORNO À TERRA COM OURO CÓSMICO',
        color: '#10b981',
        start: ${timingData.beats[11].start},
        end: ${timingData.beats[11].end},
        mag: '0.5 GAUSS', grav: '1.0 G (TERRA)', bar: 8, spin: 'ESTÁVEL',
        subtitle: 'De volta à <span class="hl hl-green">ÓRBITA DA TERRA</span> com um tesouro estelar! Você teria coragem de encarar esse <span class="hl hl-cyan">MONSTRO MAGNÉTICO</span>?',
        label1: { text: '🌍 ÓRBITA DA TERRA + OURO ESTELAR!', style: 'pill-cyan', color: '#00f2fe', target: 'earthTop' },
        label2: { text: '👋 SOBREVIVENTE DO MAGNETAR!', style: 'pill-green', color: '#10b981', target: 'astroHead' }
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
    // 2. HELPERS DE TEXTURAS PROCEDURAIS DE ALTA DEFINIÇÃO
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

    function createMagnetarSurfaceTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, 0, 256);
      bg.addColorStop(0, '#082f49');
      bg.addColorStop(0.5, '#0284c7');
      bg.addColorStop(1, '#082f49');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 512, 256);

      // Fissuras de energia ciano/branca na crosta cristalina de ferro
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 4;
      for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        const sx = (i * 43) % 512;
        const sy = (i * 29) % 256;
        ctx.moveTo(sx, sy);
        ctx.lineTo((sx + 55) % 512, (sy + 35) % 256);
        ctx.stroke();
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.arc((i * 53) % 480 + 16, (i * 37) % 220 + 16, 22, 0, Math.PI * 1.5);
        ctx.stroke();
      }
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

    function createDonorStarTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      g.addColorStop(0, '#fef08a');
      g.addColorStop(0.5, '#f97316');
      g.addColorStop(1, '#9a3412');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    // =========================================================================
    // 3. CENA THREE.JS, CÂMERA E ILUMINAÇÃO CALIBRADA
    // =========================================================================
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.014);

    const camera = new THREE.PerspectiveCamera(50, 9 / 16, 0.1, 250);
    camera.position.set(0, 1.4, 11.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.78);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.30);
    dirLight.position.set(5, 9, 10);
    scene.add(dirLight);

    const coreLight = new THREE.PointLight(0x00f2fe, 1.35, 30);
    coreLight.position.set(0, 0.5, 0.5);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.85);
    rimLight.position.set(-7, -4, 5);
    scene.add(rimLight);

    // =========================================================================
    // 4. ESTRELA DE NÊUTRONS / MAGNETAR (COM LINHAS DE CAMPO E FEIXES PULSAR!)
    // =========================================================================
    const magnetarGroup = new THREE.Group();
    scene.add(magnetarGroup);

    const magnetarTex = createMagnetarSurfaceTexture();
    const coreGeo = new THREE.SphereGeometry(1.75, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      map: magnetarTex,
      emissive: 0x00f2fe,
      emissiveMap: magnetarTex,
      emissiveIntensity: 0.95,
      roughness: 0.25,
      metalness: 0.5,
      transparent: true,
      opacity: 1.0
    });
    const magnetarCore = new THREE.Mesh(coreGeo, coreMat);
    magnetarGroup.add(magnetarCore);

    // Halo Atmosférico de Plasma Azul-Elétrico
    const atmoHaloGeo = new THREE.SphereGeometry(1.92, 48, 48);
    const atmoHaloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      depthWrite: false
    });
    const magnetarHalo = new THREE.Mesh(atmoHaloGeo, atmoHaloMat);
    magnetarGroup.add(magnetarHalo);

    // 8 Arcos Dipolares de Campo Magnético (10^15 Gauss) ao redor da estrela!
    const fieldArcsGroup = new THREE.Group();
    magnetarGroup.add(fieldArcsGroup);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= 32; j++) {
        const theta = (j / 32) * Math.PI;
        const r = 3.25 * Math.sin(theta) * Math.sin(theta) + 0.45;
        const x = r * Math.sin(theta) * Math.cos(angle);
        const y = r * Math.cos(theta);
        const z = r * Math.sin(theta) * Math.sin(angle);
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const arcMesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 36, 0.022, 8, false),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x00f2fe : 0xa855f7,
          transparent: true,
          opacity: 0.52
        })
      );
      fieldArcsGroup.add(arcMesh);
    }

    // Dois Feixes Bipolares de Radiação Pulsar (Cones de Luz nos Polos Magnéticos)
    const pulsarBeamsGroup = new THREE.Group();
     pulsarBeamsGroup.rotation.z = 0.42; // Inclinação magnética do Pulsar!
    magnetarGroup.add(pulsarBeamsGroup);

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const beamNorth = new THREE.Mesh(new THREE.ConeGeometry(1.15, 7.5, 32, 1, true), beamMat);
    beamNorth.position.y = 4.6;
    beamNorth.rotation.x = Math.PI;
    pulsarBeamsGroup.add(beamNorth);

    const beamSouth = new THREE.Mesh(new THREE.ConeGeometry(1.15, 7.5, 32, 1, true), beamMat);
    beamSouth.position.y = -4.6;
    pulsarBeamsGroup.add(beamSouth);

    const beamTopAnchor = new THREE.Object3D();
    beamTopAnchor.position.set(0, 3.2, 0);
    pulsarBeamsGroup.add(beamTopAnchor);

    // Grade de Curvatura Gravitacional / Magnetosfera
    const gridGeo = new THREE.RingGeometry(0.9, 14, 64, 28);
    const gridPos = gridGeo.attributes.position;
    const baseGridR = new Float32Array(gridPos.count);
    for (let i = 0; i < gridPos.count; i++) {
      const x = gridPos.getX(i);
      const y = gridPos.getY(i);
      baseGridR[i] = Math.sqrt(x * x + y * y);
    }
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.15, depthWrite: false
    });
    const spacetimeGrid = new THREE.Mesh(gridGeo, gridMat);
    spacetimeGrid.rotation.x = -Math.PI * 0.5;
    spacetimeGrid.position.y = -1.7;
    scene.add(spacetimeGrid);

    function updateSpacetimeWell(wellDepth) {
      for (let i = 0; i < gridPos.count; i++) {
        const r = baseGridR[i];
        const drop = -wellDepth / Math.max(0.75, (r * 0.55));
        gridPos.setZ(i, drop);
      }
      gridPos.needsUpdate = true;
    }
    updateSpacetimeWell(4.2);

    const starGlowTex = createRadialGlowTexture('rgba(255,255,255,1)', 'rgba(180,220,255,0.7)', 'rgba(100,160,255,0.1)');
    const plasmaGlowTex = createRadialGlowTexture('rgba(255,240,180,1)', 'rgba(255,140,20,0.75)', 'rgba(220,38,38,0.15)');

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
      {x:-10,y:5,size:13,color:0x0284c7,opacity:0.20}, {x:8,y:7,size:15,color:0x0b7285,opacity:0.18},
      {x:10,y:-5,size:12,color:0x3347a8,opacity:0.18}, {x:-8,y:-7,size:14,color:0x075985,opacity:0.16}
    ]);
    const nebulaWarmGroup = buildNebulaLayer([
      {x:-10,y:5,size:14,color:0x9a3412,opacity:0.22}, {x:8,y:7,size:13,color:0xb45309,opacity:0.20},
      {x:10,y:-5,size:14,color:0xd97706,opacity:0.18}, {x:-8,y:-7,size:13,color:0x7f1d1d,opacity:0.20}
    ]);
    const nebulaVioletGroup = buildNebulaLayer([
      {x:-10,y:5,size:14,color:0x6d28d9,opacity:0.22}, {x:8,y:7,size:15,color:0x312e81,opacity:0.20},
      {x:10,y:-5,size:13,color:0x7e22ce,opacity:0.20}, {x:-8,y:-7,size:14,color:0x155e75,opacity:0.18}
    ]);

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
      const c = new THREE.Color().setHSL(0.50 + Math.random() * 0.35, 0.75, 0.78 + Math.random() * 0.22);
      starColors[i * 3] = c.r; starColors[i * 3 + 1] = c.g; starColors[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.42, map: starGlowTex, vertexColors: true, transparent: true,
      opacity: 0.88, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(starField);

    // =========================================================================
    // 5. ASTRONAUTA 3D ESTILO PIXAR (MOVIMENTOS ORGÂNICOS SEM PISCAR)
    // =========================================================================
    function buildPixarAstronaut() {
      const root = new THREE.Group();
      const bodyGroup = new THREE.Group();
      root.add(bodyGroup);

      const suitMat = new THREE.MeshStandardMaterial({
        color: 0xeff6ff, roughness: 0.35, metalness: 0.1
      });
      const orangeAccentMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7, roughness: 0.3, metalness: 0.2,
        emissive: 0x0369a1, emissiveIntensity: 0.25
      });
      const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, roughness: 0.4, metalness: 0.65
      });
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xf1b894, roughness: 0.55, metalness: 0.02
      });

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.40, 1.22, 32), suitMat);
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

      const chestLed = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.22), new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
      chestLed.position.set(0, 0.35, 0.53);
      bodyGroup.add(chestLed);

      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.05, 0.46), suitMat);
      pack.position.set(0, 0.26, -0.45);
      bodyGroup.add(pack);

      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.0 });
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

      const helmetDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.66, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0xe0f2fe, transparent: true, opacity: 0.15, roughness: 0.25, depthWrite: false
        })
      );
      headGroup.add(helmetDome);

      function createArm(sign) {
        const pivot = new THREE.Group();
        pivot.position.set(sign * 0.56, 0.68, 0);
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), orangeAccentMat);
        pivot.add(shoulder);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.90, 20), suitMat);
        arm.position.y = -0.46;
        pivot.add(arm);
        const glove = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 }));
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
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.22, 0.42), orangeAccentMat);
        boot.position.set(0, -1.16, 0.06);
        pivot.add(boot);
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
          chestLed.material.color.setHex(mode === 'happy' ? 0x10b981 : 0x00f2fe);
        } else if (mode === 'shock') {
          smileMouth.visible = false;
          shockMouth.visible = true;
          shockMouth.scale.set(0.85, 1.15, 0.35);
          eyeL.pupilGroup.scale.set(0.82, 0.82, 1);
          eyeR.pupilGroup.scale.set(0.82, 0.82, 1);
          eyeL.brow.rotation.z = 0.25;
          eyeR.brow.rotation.z = -0.25;
          chestLed.material.color.setHex(0xfbbf24);
        } else if (mode === 'panic') {
          smileMouth.visible = false;
          shockMouth.visible = true;
          const pulse = 1.12 + Math.sin(t * 3.0) * 0.05;
          shockMouth.scale.set(0.95, pulse, 0.35);
          eyeL.pupilGroup.scale.set(0.65, 0.65, 1);
          eyeR.pupilGroup.scale.set(0.65, 0.65, 1);
          eyeL.brow.rotation.z = 0.38;
          eyeR.brow.rotation.z = -0.38;
          chestLed.material.color.setHex(0xf43f5e);
        }
      }

      return {
        root, bodyGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg,
        headAnchor, chestAnchor, feetAnchor, suitMat, orangeAccentMat,
        thrusterL, thrusterR, flameMat, setExpression
      };
    }

    const astronaut = buildPixarAstronaut();
    astronaut.root.scale.setScalar(BASE_ASTRO_SCALE);
    astronaut.root.position.set(0, 0.2, 3.2);
    scene.add(astronaut.root);

    // =========================================================================
    // 6. OS 12 CENÁRIOS E AMBIENTES 3D EXCLUSIVOS POR ATO
    // =========================================================================

    // CENÁRIO 1 & 9: CABINE 3D DA NAVE VALKYRIE IX (CALIBRADA 9:16 VERTICAL!)
    const cockpitGroup = new THREE.Group();
    cockpitGroup.visible = false;
    scene.add(cockpitGroup);

    const cockpitInteriorLight = new THREE.PointLight(0x00f2fe, 2.2, 14);
    cockpitInteriorLight.position.set(0, 0.8, 7.2);
    cockpitGroup.add(cockpitInteriorLight);

    const cockpitFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, metalness: 0.65, roughness: 0.32,
      emissive: 0x09192b, emissiveIntensity: 0.55
    });
    const cockpitTrimMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe, metalness: 0.75, roughness: 0.22,
      emissive: 0x0284c7, emissiveIntensity: 0.65
    });
    const cockpitAmberTrimMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const cockpitSeatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 });

    function cockpitBox(w, h, d, x, y, z, material, rz = 0) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.rotation.z = rz;
      cockpitGroup.add(mesh);
      return mesh;
    }

    cockpitBox(3.6, 0.24, 0.42, 0, 2.62, 4.6, cockpitFrameMat);
    cockpitBox(3.2, 0.05, 0.12, 0, 2.48, 4.78, cockpitAmberTrimMat);
    cockpitBox(0.24, 4.5, 0.42, -1.52, 0.55, 4.6, cockpitFrameMat);
    cockpitBox(0.24, 4.5, 0.42, 1.52, 0.55, 4.6, cockpitFrameMat);
    cockpitBox(0.05, 4.1, 0.12, -1.38, 0.55, 4.76, cockpitTrimMat);
    cockpitBox(0.05, 4.1, 0.12, 1.38, 0.55, 4.76, cockpitTrimMat);
    cockpitBox(0.95, 0.14, 0.32, -1.15, 2.32, 4.65, cockpitFrameMat, 0.52);
    cockpitBox(0.95, 0.14, 0.32, 1.15, 2.32, 4.65, cockpitFrameMat, -0.52);
    cockpitBox(3.5, 0.85, 0.95, 0, -1.32, 4.95, cockpitFrameMat);
    cockpitBox(3.2, 0.05, 0.14, 0, -0.88, 5.38, cockpitTrimMat);

    function makeCockpitDisplay(accent, secondary, heading) {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, 512, 256);
      bg.addColorStop(0, '#041222'); bg.addColorStop(1, '#09223a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = accent; ctx.lineWidth = 6; ctx.strokeRect(6, 6, 500, 244);
      ctx.fillStyle = accent; ctx.font = 'bold 28px Arial'; ctx.fillText(heading, 24, 44);
      ctx.fillStyle = '#e2f8ff'; ctx.font = 'bold 16px Arial'; ctx.fillText('VALKYRIE IX // MAGNETAR SCAN', 26, 70);
      ctx.strokeStyle = accent; ctx.lineWidth = 5; ctx.beginPath();
      [0.4,0.75,0.45,0.88,0.52,0.92,0.60,0.95,0.68,0.98].forEach((v, i) => {
        const x = 28 + i * 48; const y = 210 - v * 105;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.strokeStyle = secondary; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(418, 125, 48, 0, Math.PI * 2); ctx.stroke();
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    [
      { x: -0.96, y: -0.64, z: 5.12, ry: 0.28, accent: '#00f2fe', secondary: '#0284c7', title: 'GAUSS SENSOR' },
      { x: 0.02,  y: -0.72, z: 5.22, ry: 0.00, accent: '#fbbf24', secondary: '#f97316', title: 'PULSAR 716Hz' },
      { x: 0.96,  y: -0.64, z: 5.12, ry: -0.28, accent: '#a855f7', secondary: '#7c3aed', title: 'RAIOS GAMA' }
    ].forEach((cfg, i) => {
      const display = new THREE.Mesh(
        new THREE.PlaneGeometry(i === 1 ? 0.92 : 0.82, 0.46),
        new THREE.MeshBasicMaterial({ map: makeCockpitDisplay(cfg.accent, cfg.secondary, cfg.title) })
      );
      display.position.set(cfg.x, cfg.y, cfg.z);
      display.rotation.y = cfg.ry;
      display.rotation.x = -0.18;
      cockpitGroup.add(display);
    });

    for (let i = 0; i < 11; i++) {
      const btn = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 12, 12),
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xfbbf24 : (i % 2 === 0 ? 0x00f2fe : 0xa855f7) })
      );
      btn.position.set(-1.10 + i * 0.22, -0.96, 5.42);
      cockpitGroup.add(btn);
    }

    const holoRadarGroup = new THREE.Group();
    holoRadarGroup.position.set(0.68, -0.12, 5.25);
    cockpitGroup.add(holoRadarGroup);
    holoRadarGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.55 })
    ));
    const radarRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 12, 48), new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
    radarRing.rotation.x = Math.PI * 0.45;
    holoRadarGroup.add(radarRing);

    const yokeGroup = new THREE.Group();
    yokeGroup.position.set(-0.35, -0.45, 5.35);
    cockpitGroup.add(yokeGroup);
    const yokeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.45, 12), cockpitTrimMat);
    yokeShaft.rotation.x = 0.35;
    yokeGroup.add(yokeShaft);
    const yokeHandle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 12, 24, Math.PI * 1.3), cockpitAmberTrimMat);
    yokeHandle.position.set(0, 0.20, 0.08);
    yokeGroup.add(yokeHandle);

    cockpitBox(0.75, 0.18, 0.55, -0.56, -0.82, 5.55, cockpitSeatMat);

    const cockpitWindowAnchor = new THREE.Object3D();
    cockpitWindowAnchor.position.set(0.25, 1.35, 4.6);
    cockpitGroup.add(cockpitWindowAnchor);

    // Linhas de Dobra Espacial
    const warpLinesGroup = new THREE.Group();
    warpLinesGroup.visible = false;
    scene.add(warpLinesGroup);
    const warpLines = [];
    for (let i = 0; i < 42; i++) {
      const geo = new THREE.CylinderGeometry(0.012, 0.012, 1.8 + (i % 4) * 0.6, 8);
      geo.rotateX(Math.PI * 0.5);
      const line = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f2fe : 0xa855f7, transparent: true, opacity: 0.45
      }));
      const angle = (i / 42) * Math.PI * 2;
      const rad = 1.9 + (i % 5) * 0.65;
      line.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad + 0.4, -4 + (i % 10));
      warpLinesGroup.add(line);
      warpLines.push({ mesh: line, baseZ: line.position.z, speed: 6.5 + (i % 5) * 1.5 });
    }

    // CENÁRIO 2: ANÉIS DE VARREDURA DO PULSAR 716 RPS
    const pulsarSweepGroup = new THREE.Group();
    pulsarSweepGroup.visible = false;
    scene.add(pulsarSweepGroup);
    const sweepRings = [];
    for (let i = 0; i < 6; i++) {
      const sr = new THREE.Mesh(
        new THREE.TorusGeometry(2.2 + i * 0.55, 0.025, 16, 80),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x00f2fe : 0xa855f7,
          transparent: true,
          opacity: 0.50 - i * 0.06
        })
      );
      sr.rotation.x = Math.PI * 0.42;
      pulsarSweepGroup.add(sr);
      sweepRings.push(sr);
    }

    // CENÁRIO 3: NAVE EXTERNA VALKYRIE IX DESMONTADA PELO MAGNETISMO (10^15 GAUSS)
    const shipGroup = new THREE.Group();
    shipGroup.visible = false;
    scene.add(shipGroup);

    const hull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.45, 1.65, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.6 })
    );
    hull.rotation.z = Math.PI * 0.5;
    shipGroup.add(hull);

    const noseCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.55, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    noseCone.rotation.z = -Math.PI * 0.5;
    noseCone.position.x = 1.10;
    shipGroup.add(noseCone);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, roughness: 0.25, metalness: 0.7, emissive: 0x78350f, emissiveIntensity: 0.25
    });
    const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 1.35), wingMat);
    wingLeft.position.set(-0.1, 0, 0.88);
    shipGroup.add(wingLeft);

    const wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 1.35), wingMat);
    wingRight.position.set(-0.1, 0, -0.88);
    shipGroup.add(wingRight);

    const shipAnchor = new THREE.Object3D();
    shipAnchor.position.set(0, 0.75, 0);
    shipGroup.add(shipAnchor);

    // CENÁRIO 4: LABORATÓRIO HOLOGRÁFICO DE DENSIDADE (1 COLHER DE CHÁ = MONTE EVEREST 3D!)
    const everestLabGroup = new THREE.Group();
    everestLabGroup.visible = false;
    scene.add(everestLabGroup);

    // Plataforma Esquerda: Colherinha Brilhante com Cubo de Matéria de Nêutrons
    const spoonPlatform = new THREE.Group();
    spoonPlatform.position.set(-0.92, 0.85, 3.0);
    everestLabGroup.add(spoonPlatform);

    const pedLeft = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.04, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe })
    );
    pedLeft.rotation.x = Math.PI * 0.5;
    pedLeft.position.y = -0.45;
    spoonPlatform.add(pedLeft);

    const spoonHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.05, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
    );
    spoonHandle.position.set(-0.22, 0.0, 0);
    spoonPlatform.add(spoonHandle);

    const spoonBowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide })
    );
    spoonBowl.position.set(0.12, 0.02, 0);
    spoonPlatform.add(spoonBowl);

    const neutronDrop = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe })
    );
    neutronDrop.position.set(0.12, 0.14, 0);
    spoonPlatform.add(neutronDrop);

    const scaleLeftAnchor = new THREE.Object3D();
    scaleLeftAnchor.position.set(0, 0.72, 0);
    spoonPlatform.add(scaleLeftAnchor);

    // Plataforma Direita: Monte Everest 3D com Pico Nevado!
    const everestPlatform = new THREE.Group();
    everestPlatform.position.set(0.92, 0.85, 3.0);
    everestLabGroup.add(everestPlatform);

    const pedRight = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.04, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    pedRight.rotation.x = Math.PI * 0.5;
    pedRight.position.y = -0.45;
    everestPlatform.add(pedRight);

    const mountainBase = new THREE.Mesh(
      new THREE.ConeGeometry(0.58, 0.95, 7),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, flatShading: true })
    );
    mountainBase.position.y = 0.02;
    everestPlatform.add(mountainBase);

    const snowCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.30, 0.46, 7),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, flatShading: true })
    );
    snowCap.position.y = 0.28;
    everestPlatform.add(snowCap);

    const scaleRightAnchor = new THREE.Object3D();
    scaleRightAnchor.position.set(0, 0.72, 0);
    everestPlatform.add(scaleRightAnchor);

    // CENÁRIO 5: ESTRELA COMPANHEIRA SENDO VAMPIRIZADA (Ato 5)
    const vampireStarGroup = new THREE.Group();
    vampireStarGroup.visible = false;
    scene.add(vampireStarGroup);

    const donorTex = createDonorStarTexture();
    const donorStarCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 32, 32),
      new THREE.MeshBasicMaterial({ map: donorTex })
    );
    vampireStarGroup.add(donorStarCore);

    const donorStarAnchor = new THREE.Object3D();
    donorStarAnchor.position.set(0, 1.25, 0);
    vampireStarGroup.add(donorStarAnchor);

    const plasmaStreamChunks = [];
    for (let i = 0; i < 28; i++) {
      const chunk = new THREE.Mesh(
        new THREE.SphereGeometry(0.07 + (i % 4) * 0.03, 12, 12),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfbbf24 : 0xff6b00 })
      );
      vampireStarGroup.add(chunk);
      plasmaStreamChunks.push({ mesh: chunk, seed: i * 0.38 });
    }

    // CENÁRIO 6: CÂMARA QUÂNTICA DE ÁTOMOS EM FORMA DE AGULHA (Ato 6)
    const needleAtomsGroup = new THREE.Group();
    needleAtomsGroup.visible = false;
    scene.add(needleAtomsGroup);

    const needleAtoms = [];
    for (let i = 0; i < 5; i++) {
      const atomG = new THREE.Group();
      atomG.position.set(-1.1 + i * 0.55, 0.75 + (i % 2) * 0.35, 2.3);

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      );
      atomG.add(nucleus);

      const orbitalRingA = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.016, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0x00f2fe })
      );
      atomG.add(orbitalRingA);

      const orbitalRingB = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.016, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0xa855f7 })
      );
      orbitalRingB.rotation.y = Math.PI * 0.5;
      atomG.add(orbitalRingB);

      needleAtomsGroup.add(atomG);
      needleAtoms.push(atomG);
    }

    const atomClusterAnchor = new THREE.Object3D();
    atomClusterAnchor.position.set(-0.55, 1.45, 2.3);
    needleAtomsGroup.add(atomClusterAnchor);

    // CENÁRIO 7: POÇO DE TERREMOTO ESTELAR & VETORES DE FORÇA G (Ato 7)
    const gravityVectorsGroup = new THREE.Group();
    gravityVectorsGroup.visible = false;
    scene.add(gravityVectorsGroup);
    const gravityPillars = [];
    for (let i = 0; i < 18; i++) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.04, 1.4, 8),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x00f2fe : 0xf43f5e, transparent: true, opacity: 0.55
        })
      );
      const ang = (i / 18) * Math.PI * 2;
      const rad = 1.15 + (i % 3) * 0.45;
      pillar.position.set(Math.cos(ang) * rad, (i % 5) * 0.8 - 1.5, Math.sin(ang) * rad + 2.2);
      gravityVectorsGroup.add(pillar);
      gravityPillars.push({ mesh: pillar, baseY: pillar.position.y });
    }

    // CENÁRIO 8: CÂNION DE SUPER-EXPLOSÃO DE RAIOS GAMA (Ato 8)
    const gammaFlareGroup = new THREE.Group();
    gammaFlareGroup.visible = false;
    scene.add(gammaFlareGroup);

    const gammaRings = [];
    for (let i = 0; i < 6; i++) {
      const gr = new THREE.Mesh(
        new THREE.TorusGeometry(0.9 + i * 0.42, 0.035, 16, 64),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xfbbf24 : 0xf43f5e, transparent: true, opacity: 0.72 - i * 0.08
        })
      );
      gr.rotation.x = Math.PI * 0.45;
      gammaFlareGroup.add(gr);
      gammaRings.push(gr);
    }

    // CENÁRIO 10: CORTE RAIO-X TOP-DOWN DA MASSA NUCLEAR (NHOQUE, ESPAGUETE E LASANHA ATÔMICA!)
    const nuclearPastaGroup = new THREE.Group();
    nuclearPastaGroup.visible = false;
    scene.add(nuclearPastaGroup);

    // Cascas Translúcidas Raio-X da Estrela de Nêutrons
    const crustShell = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 1.2, 6.5, 48, 16, true),
      new THREE.MeshPhysicalMaterial({
        color: 0x00f2fe, emissive: 0x0284c7, emissiveIntensity: 0.35,
        transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false
      })
    );
    crustShell.position.y = -2.2;
    nuclearPastaGroup.add(crustShell);

    // Fase 1: "Nhoque Nuclear" (Esferas densas no topo)
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const gnocchi = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.6 })
      );
      gnocchi.position.set(Math.cos(ang) * 2.2, -0.5, Math.sin(ang) * 2.2);
      nuclearPastaGroup.add(gnocchi);
    }

    // Fase 2: "Espaguete Nuclear" (Hastes cilíndricas no meio)
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12),
        new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.75 })
      );
      rod.position.set(Math.cos(ang) * 1.45, -1.8, Math.sin(ang) * 1.45);
      nuclearPastaGroup.add(rod);
    }

    // Fase 3: "Lasanha Nuclear" (Lâminas paralelas no fundo)
    const pastaRings = [];
    for (let i = 0; i < 7; i++) {
      const sheet = new THREE.Mesh(
        new THREE.TorusGeometry(0.75 + i * 0.28, 0.03, 12, 72),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xa855f7 : 0x10b981, transparent: true, opacity: 0.65
        })
      );
      sheet.rotation.x = Math.PI * 0.5;
      sheet.position.y = -0.6 - i * 0.65;
      nuclearPastaGroup.add(sheet);
      pastaRings.push(sheet);
    }

    const pastaRimAnchor = new THREE.Object3D();
    pastaRimAnchor.position.set(-1.35, 0.45, -1.2);
    nuclearPastaGroup.add(pastaRimAnchor);

    // CENÁRIO 11: COLISÃO KILONOVA & FORJA DE OURO E PLATINA PUROS (Ato 11)
    const kilonovaGroup = new THREE.Group();
    kilonovaGroup.visible = false;
    scene.add(kilonovaGroup);

    const starA = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe })
    );
    kilonovaGroup.add(starA);

    const starB = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    kilonovaGroup.add(starB);

    const goldNuggets = [];
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, metalness: 0.92, roughness: 0.15,
      emissive: 0xd97706, emissiveIntensity: 0.55
    });
    for (let i = 0; i < 32; i++) {
      const nugget = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09 + (i % 4) * 0.04, 0), goldMat);
      kilonovaGroup.add(nugget);
      goldNuggets.push({ mesh: nugget, angle: (i / 32) * Math.PI * 2, elev: ((i % 7) - 3) * 0.35, speed: 0.8 + (i % 5) * 0.25 });
    }

    const kilonovaRings = [];
    for (let i = 0; i < 5; i++) {
      const kr = new THREE.Mesh(
        new THREE.TorusGeometry(1.4 + i * 0.45, 0.03, 12, 64),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfbbf24 : 0x00f2fe, transparent: true, opacity: 0.65 - i * 0.08 })
      );
      kilonovaGroup.add(kr);
      kilonovaRings.push(kr);
    }

    const kilonovaTopAnchor = new THREE.Object3D();
    kilonovaTopAnchor.position.set(-0.65, 1.35, 0);
    kilonovaGroup.add(kilonovaTopAnchor);

    const kilonovaGoldAnchor = new THREE.Object3D();
    kilonovaGoldAnchor.position.set(0.75, -0.55, 0);
    kilonovaGroup.add(kilonovaGoldAnchor);

    // CENÁRIO 12: ÓRBITA DA TERRA COM TESOURO DE OURO CÓSMICO (Ato 12)
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

    const orbitalGoldRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.75, 0.03, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.72 })
    );
    orbitalGoldRing.rotation.x = Math.PI * 0.42;
    orbitalGoldRing.rotation.y = 0.22;
    earthGroup.add(orbitalGoldRing);

    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: plasmaGlowTex, color: 0xfde047, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending
    }));
    sunSprite.position.set(-2.3, 2.2, -2.5);
    sunSprite.scale.set(4.5, 4.5, 1);
    earthGroup.add(sunSprite);

    const earthAnchor = new THREE.Object3D();
    earthAnchor.position.set(0, 2.25, 0);
    earthGroup.add(earthAnchor);

    const coreTopAnchor = new THREE.Object3D();
    coreTopAnchor.position.set(0, 2.15, 0);
    magnetarGroup.add(coreTopAnchor);

    const ANCHORS = {
      astroHead: astronaut.headAnchor,
      astroChest: astronaut.chestAnchor,
      astroFeet: astronaut.feetAnchor,
      cockpitWindow: cockpitWindowAnchor,
      beamTop: beamTopAnchor,
      coreTop: coreTopAnchor,
      ship: shipAnchor,
      scaleLeft: scaleLeftAnchor,
      scaleRight: scaleRightAnchor,
      donorStar: donorStarAnchor,
      atomCluster: atomClusterAnchor,
      pastaRim: pastaRimAnchor,
      kilonovaTop: kilonovaTopAnchor,
      kilonovaGold: kilonovaGoldAnchor,
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
    const teleMag = document.getElementById('tele-mag');
    const teleGrav = document.getElementById('tele-grav');
    const teleBar = document.getElementById('tele-bar');
    const teleSpin = document.getElementById('tele-spin');
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
        y: Math.max(105, Math.min(stageRect.height - 155, y)),
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

        if (Math.abs(p1.y - p2.y) < 62 && Math.abs(p1.x - p2.x) < 250) {
          if (p1.y <= p2.y) {
            p1.y = Math.max(105, p1.y - 34);
            p2.y = Math.min(p2.stageHeight - 155, Math.max(p1.y + 56, p2.y + 34));
          } else {
            p2.y = Math.max(105, p2.y - 34);
            p1.y = Math.min(p1.stageHeight - 155, Math.max(p2.y + 56, p1.y + 34));
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

      if (teleMag) teleMag.textContent = beat.mag;
      if (teleGrav) teleGrav.textContent = beat.grav;
      if (teleBar) teleBar.style.width = \`\${beat.bar}%\`;
      if (teleSpin) teleSpin.textContent = beat.spin;

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
      magnetarGroup.visible = true;
      magnetarGroup.position.set(0, 0, 0);
      magnetarGroup.rotation.set(0, 0, 0);
      magnetarGroup.scale.setScalar(1.0);
      magnetarCore.material.opacity = 1.0;
      spacetimeGrid.visible = true;
      spacetimeGrid.position.set(0, -1.7, 0);
      cockpitGroup.visible = false;
      warpLinesGroup.visible = false;
      pulsarSweepGroup.visible = false;
      shipGroup.visible = false;
      everestLabGroup.visible = false;
      vampireStarGroup.visible = false;
      needleAtomsGroup.visible = false;
      gravityVectorsGroup.visible = false;
      gammaFlareGroup.visible = false;
      nuclearPastaGroup.visible = false;
      kilonovaGroup.visible = false;
      earthGroup.visible = false;
      nebulaBlueGroup.visible = true;
      nebulaWarmGroup.visible = false;
      nebulaVioletGroup.visible = false;
      scene.background.setHex(0x02040a);
      scene.fog.color.setHex(0x02040a);
      gridMat.opacity = 0.15;
      astronaut.flameMat.opacity = 0.0;
      astronaut.suitMat.color.setHex(0xeff6ff);
      astronaut.root.scale.setScalar(BASE_ASTRO_SCALE);
      astronaut.root.rotation.set(0, 0, 0);
      astronaut.leftLeg.scale.set(1, 1, 1);
      astronaut.rightLeg.scale.set(1, 1, 1);
      astronaut.leftLeg.rotation.set(0, 0, 0);
      astronaut.rightLeg.rotation.set(0, 0, 0);
      flashOverlay.style.opacity = '0';

      if (transitionOverlay) {
        const toStart = clampedT - activeBeat.start;
        const toEnd = activeBeat.end - clampedT;
        let transitionAmount = 0;
        if (activeBeat.index > 0) transitionAmount = Math.max(transitionAmount, 1 - smoothstep(0, 0.55, toStart));
        if (activeBeat.index < BEATS.length - 1) transitionAmount = Math.max(transitionAmount, 1 - smoothstep(0, 0.55, toEnd));
        transitionOverlay.style.opacity = (transitionAmount * 0.20).toFixed(3);
      }

      // Rotação orgânica do Magnetar e feixes (sem estroboscópio rápido!)
      magnetarCore.rotation.y = clampedT * 1.8;
      fieldArcsGroup.rotation.y = clampedT * 1.2;
      pulsarBeamsGroup.rotation.y = clampedT * 2.2;
      magnetarHalo.scale.setScalar(1 + Math.sin(clampedT * 2.0) * 0.03);

      // =====================================================================
      // COREOGRAFIA DOS 12 AMBIENTES DISTINTOS
      // =====================================================================
      if (activeBeat.id === 'cockpitArrival') {
        // CENÁRIO 1: Interior da Cabine 3D da Nave Valkyrie IX saindo da dobra diante do Magnetar!
        scene.background.setHex(0x030816);
        cockpitGroup.visible = true;
        warpLinesGroup.visible = true;
        spacetimeGrid.visible = false;

        const approach = smoothstep(0, 1, u);
        magnetarGroup.position.set(0.26, 1.05, -7.2 + approach * 4.8);
        magnetarGroup.scale.setScalar(0.38 + approach * 0.36);

        holoRadarGroup.rotation.y = clampedT * 0.9;
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

      } else if (activeBeat.id === 'lighthouseBeams') {
        // CENÁRIO 2: Farol Cósmico Pulsar com Anéis de Varredura e Feixes Bipolares!
        scene.background.setHex(0x050314);
        nebulaVioletGroup.visible = true;
        pulsarSweepGroup.visible = true;

        magnetarGroup.position.set(0, 0.45, -1.2);
        magnetarGroup.scale.setScalar(0.88);

        sweepRings.forEach((sr, idx) => {
          sr.rotation.z = clampedT * (0.35 + idx * 0.05) * (idx % 2 === 0 ? 1 : -1);
          sr.scale.setScalar(1 + Math.sin(clampedT * 1.8 + idx) * 0.04);
        });

        astronaut.setExpression('shock', clampedT);
        astronaut.root.position.set(0.55, -0.38 + Math.sin(clampedT * 2.0) * 0.05, 3.3);
        astronaut.root.rotation.set(0, -0.32, 0);
        astronaut.leftArm.rotation.z = -1.65;
        astronaut.rightArm.rotation.z = 1.65;

        camera.position.set(Math.sin(u * Math.PI * 0.8) * 1.15, 0.92, 10.6 - u * 0.5);
        camera.lookAt(0, 0.25, 0);

      } else if (activeBeat.id === 'magneticShipRip') {
        // CENÁRIO 3: Desarme Magnético da Nave Valkyrie IX (10^15 Gauss) e Ejeção!
        scene.background.setHex(0x040818);
        magnetarGroup.position.set(-1.35, 1.25, -3.0);
        magnetarGroup.scale.setScalar(0.82);

        astronaut.setExpression('shock', clampedT);
        astronaut.flameMat.opacity = 0.85;
        astronaut.root.position.set(-0.55 + u * 0.22, -0.12 + Math.sin(clampedT * 2.2) * 0.06, 3.25 - u * 0.2);
        astronaut.root.rotation.set(0.10, 0.22, Math.sin(clampedT * 2.0) * 0.10);
        astronaut.leftArm.rotation.z = -1.75;
        astronaut.rightArm.rotation.z = 1.75;

        shipGroup.visible = true;
        shipGroup.scale.setScalar(0.74 * (1 - u * 0.15));
        shipGroup.position.set(0.78 - u * 0.40, 0.42 - u * 0.25, 2.6 - u * 1.1);
        shipGroup.rotation.set(clampedT * 0.8, -0.55 + u * 1.2, clampedT * 0.6);

        wingLeft.position.set(-0.1 - u * 1.45, u * 0.85, 0.88 + u * 1.05);
        wingLeft.rotation.set(clampedT * 1.6, clampedT * 1.2, 0);
        wingRight.position.set(-0.1 - u * 1.55, -u * 0.95, -0.88 - u * 1.05);
        wingRight.rotation.set(-clampedT * 1.6, clampedT * 1.2, 0);

        camera.position.set(0.55 + Math.sin(u * Math.PI) * 0.65, 0.95, 10.8 - u * 0.6);
        camera.lookAt(-0.15, 0.30, 0.2);

      } else if (activeBeat.id === 'spoonEverest') {
        // CENÁRIO 4: Laboratório de Densidade Split-Screen (1 Colher de Chá = Monte Everest 3D!)
        scene.background.setHex(0x020a14);
        everestLabGroup.visible = true;

        magnetarGroup.position.set(0, 1.55, -3.5);
        magnetarGroup.scale.setScalar(0.55);

        spoonPlatform.rotation.y = Math.sin(clampedT * 1.4) * 0.25;
        everestPlatform.rotation.y = clampedT * 0.55;

        astronaut.setExpression('shock', clampedT);
        astronaut.root.position.set(0, -0.42, 3.25);
        astronaut.leftArm.rotation.z = -1.55;
        astronaut.rightArm.rotation.z = 1.55;

        camera.position.set(Math.sin(u * Math.PI * 0.7) * 0.75, 0.95, 10.4);
        camera.lookAt(0, 0.35, 1.5);

      } else if (activeBeat.id === 'vampireStar') {
        // CENÁRIO 5: Estrela Vampira Sugando o Plasma de uma Estrela Gigante ao Vivo!
        scene.background.setHex(0x0c0402);
        nebulaWarmGroup.visible = true;
        nebulaBlueGroup.visible = false;
        vampireStarGroup.visible = true;

        magnetarGroup.position.set(1.15, 1.35, -2.5);
        magnetarGroup.scale.setScalar(0.78);

        const pScale = Math.max(0.45, 0.96 - u * 0.35);
        donorStarCore.scale.set(pScale * (1 + u * 0.42), pScale * (1 - u * 0.18), pScale);
        vampireStarGroup.position.set(-0.85 + u * 0.25, -0.10 + u * 0.20, 2.5 - u * 0.9);

        plasmaStreamChunks.forEach((c, idx) => {
          const prog = (u * 0.85 + (idx / plasmaStreamChunks.length)) % 1.0;
          const sx = THREE.MathUtils.lerp(0, 2.0, prog);
          const sy = THREE.MathUtils.lerp(0, 1.45, prog) + Math.sin(prog * Math.PI * 3 + c.seed) * 0.35;
          const sz = THREE.MathUtils.lerp(0, -4.0, prog);
          c.mesh.position.set(sx, sy, sz);
        });

        astronaut.setExpression('panic', clampedT);
        astronaut.root.position.set(0.75, -0.35 + Math.sin(clampedT * 2.2) * 0.05, 3.25);
        astronaut.root.rotation.set(0, -0.38, -0.08);
        astronaut.leftArm.rotation.z = -2.05;
        astronaut.rightArm.rotation.z = 2.05;

        camera.position.set(-0.25 + Math.sin(u * Math.PI) * 0.65, 0.88, 10.4 - u * 0.5);
        camera.lookAt(0, 0.25, 0.5);

      } else if (activeBeat.id === 'needleAtoms') {
        // CENÁRIO 6: Câmara Quântica de Átomos Esticados como Agulhas pelo Campo de 10^15 Gauss!
        scene.background.setHex(0x080214);
        nebulaVioletGroup.visible = true;
        needleAtomsGroup.visible = true;

        magnetarGroup.position.set(0, -1.65, -2.0);
        magnetarGroup.scale.setScalar(1.05);

        const stretch = 1.0 + smoothstep(0, 1, u) * 2.4;
        const squeeze = Math.max(0.28, 1.0 - smoothstep(0, 1, u) * 0.65);
        needleAtoms.forEach((atomG, idx) => {
          atomG.scale.set(squeeze, stretch, squeeze);
          atomG.rotation.y = clampedT * (1.2 + idx * 0.2);
        });

        astronaut.setExpression('panic', clampedT);
        astronaut.root.position.set(0.55, -0.25, 3.0);
        astronaut.root.rotation.set(0, -0.25, 0);
        astronaut.leftArm.rotation.z = -1.95;
        astronaut.rightArm.rotation.z = 1.95;

        camera.position.set(0.25 + Math.sin(u * Math.PI) * 0.55, 0.92, 10.4 - u * 0.6);
        camera.lookAt(0, 0.25, 0.8);

      } else if (activeBeat.id === 'starquakeVectors') {
        // CENÁRIO 7: Terremoto Estelar na Crosta de Ferro & Poço Vertical de Força G!
        scene.background.setHex(0x090206);
        nebulaWarmGroup.visible = true;
        gravityVectorsGroup.visible = true;

        magnetarGroup.position.set(0, -2.35, -1.4);
        magnetarGroup.scale.setScalar(1.25);

        gravityPillars.forEach(p => {
          p.mesh.position.y = ((p.baseY - clampedT * 2.2) % 4.5) + 1.2;
        });

        astronaut.setExpression('panic', clampedT);
        astronaut.root.position.set(0, 0.18 - u * 0.22, 3.1);
        astronaut.leftArm.rotation.z = -2.35;
        astronaut.rightArm.rotation.z = 2.35;
        astronaut.leftLeg.scale.set(1 - u * 0.16, 1 + u * 0.42, 1 - u * 0.16);
        astronaut.rightLeg.scale.set(1 - u * 0.16, 1 + u * 0.42, 1 - u * 0.16);

        camera.position.set(0.30 + Math.sin(u * Math.PI) * 0.45, -0.05, 9.6 - u * 0.25);
        camera.lookAt(0, -0.75, 2.6);

      } else if (activeBeat.id === 'gammaFlareCanyon') {
        // CENÁRIO 8: Super-Explosão de Raios Gama (Magnetar Giant Flare)!
        scene.background.setHex(0x0d0402);
        nebulaWarmGroup.visible = true;
        gammaFlareGroup.visible = true;

        magnetarGroup.position.set(0, -1.85, -1.8);
        magnetarGroup.scale.setScalar(1.15);

        gammaRings.forEach((gr, idx) => {
          const wave = ((u * 0.9 + idx * 0.16) % 1.0);
          gr.scale.setScalar(0.8 + wave * 1.45);
          gr.position.y = -0.5 + wave * 2.2;
        });

        astronaut.setExpression('panic', clampedT);
        const s = smoothstep(0, 1, u);
        astronaut.root.scale.set(
          BASE_ASTRO_SCALE * Math.max(0.32, 1.0 - s * 0.42),
          BASE_ASTRO_SCALE * (1.0 + s * 0.85),
          BASE_ASTRO_SCALE * Math.max(0.32, 1.0 - s * 0.42)
        );
        astronaut.root.position.set(0, -0.10, 2.9);
        astronaut.leftArm.rotation.z = -2.45;
        astronaut.rightArm.rotation.z = 2.45;

        camera.position.set(0.75 - u * 0.60, 0.58, 10.8);
        camera.lookAt(0, 0.05, 1.5);

      } else if (activeBeat.id === 'cockpitCrustDive') {
        // CENÁRIO 9: Retorno à Cabine em Mergulho Relativístico (100.000 km/s) Rumo à Crosta!
        scene.background.setHex(0x040212);
        cockpitGroup.visible = true;
        warpLinesGroup.visible = true;
        nebulaVioletGroup.visible = true;
        spacetimeGrid.visible = false;

        const approach = smoothstep(0, 1, u);
        magnetarGroup.position.set(0.18, 0.95, -1.9 + approach * 1.8);
        magnetarGroup.scale.setScalar(0.82 + approach * 0.45);

        warpLines.forEach(w => {
          w.mesh.position.z = ((w.baseZ + clampedT * w.speed * 0.9) % 10) - 5;
        });

        holoRadarGroup.rotation.y = clampedT * 2.4;
        yokeGroup.rotation.z = Math.sin(clampedT * 2.6) * 0.18;

        astronaut.setExpression('shock', clampedT);
        astronaut.root.scale.setScalar(0.36);
        astronaut.root.position.set(-0.56, -0.32 + approach * 0.05, 5.55);
        astronaut.root.rotation.set(0.02, 0.58, -approach * 0.04);
        astronaut.leftArm.rotation.z = -0.65 - approach * 0.25;
        astronaut.rightArm.rotation.z = 0.92 + approach * 0.25;

        camera.position.set(Math.sin(u * Math.PI) * 0.14, 0.65 + approach * 0.15, 11.0 - approach * 2.3);
        camera.lookAt(0.0, 0.55, 0.0);
        flashOverlay.style.opacity = (smoothstep(0.72, 0.98, u) * 0.14).toFixed(3);

      } else if (activeBeat.id === 'nuclearPastaXray') {
        // CENÁRIO 10: Visão Top-Down 50° Raio-X da Massa Nuclear (Nhoque, Espaguete e Lasanha)!
        scene.background.setHex(0x020612);
        nuclearPastaGroup.visible = true;
        nebulaVioletGroup.visible = true;

        magnetarCore.material.opacity = 0.20;
        gridMat.opacity = 0.55;
        updateSpacetimeWell(9.5);

        const spiralAngle = u * Math.PI * 2.2;
        const spiralRadius = (1 - u * 0.50) * 1.15;
        astronaut.setExpression('shock', clampedT);
        astronaut.root.scale.setScalar(BASE_ASTRO_SCALE * 0.90);
        astronaut.root.position.set(
          Math.cos(spiralAngle) * spiralRadius,
          -0.3 - u * 1.6,
          Math.sin(spiralAngle) * spiralRadius
        );
        astronaut.root.rotation.set(0.45, spiralAngle, 0.25);
        astronaut.leftArm.rotation.z = -1.95;
        astronaut.rightArm.rotation.z = 1.95;

        pastaRings.forEach((r, i) => {
          r.rotation.z = clampedT * (0.15 + i * 0.03);
        });

        camera.position.set(Math.sin(u * Math.PI * 0.7) * 0.85, 8.45, 6.0 - u * 0.35);
        camera.lookAt(0, -1.75, 0);

      } else if (activeBeat.id === 'kilonovaGoldForge') {
        // CENÁRIO 11: Colisão Binária Kilonova Forjando Ouro e Platina Puros no Espaço!
        scene.background.setHex(0x080312);
        magnetarGroup.visible = false;
        spacetimeGrid.visible = false;
        nebulaWarmGroup.visible = true;
        kilonovaGroup.visible = true;

        kilonovaGroup.position.set(0, 0.35, 2.2);
        const orbitR = Math.max(0.15, (1 - u * 0.85) * 1.15);
        const orbitAng = clampedT * 3.2;
        starA.position.set(Math.cos(orbitAng) * orbitR, Math.sin(orbitAng * 0.5) * 0.15, Math.sin(orbitAng) * orbitR);
        starB.position.set(-Math.cos(orbitAng) * orbitR, -Math.sin(orbitAng * 0.5) * 0.15, -Math.sin(orbitAng) * orbitR);

        goldNuggets.forEach((gn, idx) => {
          const rad = 0.55 + u * 2.1 + (idx % 4) * 0.25;
          const a = gn.angle + clampedT * gn.speed;
          gn.mesh.position.set(Math.cos(a) * rad, gn.elev * (0.5 + u), Math.sin(a) * rad);
          gn.mesh.rotation.set(clampedT + idx, clampedT * 0.8, idx);
        });

        kilonovaRings.forEach((kr, idx) => {
          kr.rotation.x = Math.PI * 0.35 + Math.sin(clampedT + idx) * 0.2;
          kr.rotation.y = clampedT * (0.4 + idx * 0.08);
        });

        astronaut.setExpression('shock', clampedT);
        astronaut.root.scale.setScalar(BASE_ASTRO_SCALE * 0.92);
        astronaut.root.position.set(0, -0.35 + Math.sin(clampedT * 2.0) * 0.08, 3.1);
        astronaut.leftArm.rotation.z = -1.55;
        astronaut.rightArm.rotation.z = 1.55;

        camera.position.set(Math.sin(u * Math.PI * 1.1) * 1.15, 0.75, 9.4 - u * 0.4);
        camera.lookAt(0, 0.20, 2.0);

      } else if (activeBeat.id === 'earthGoldReturn') {
        // CENÁRIO 12: Retorno à Órbita da Terra com Anel de Ouro Cósmico e Aceno Vitorioso!
        scene.background.setHex(0x020818);
        magnetarGroup.visible = false;
        spacetimeGrid.visible = false;
        nebulaBlueGroup.visible = true;
        earthGroup.visible = true;

        earthGroup.scale.setScalar(0.96);
        earthGroup.position.set(0, 0.62, -1.35);
        earthMesh.rotation.y = clampedT * 0.35;
        orbitalGoldRing.rotation.z = clampedT * 0.28;

        astronaut.setExpression('happy', clampedT);
        const bounce = Math.exp(-u * 3.0) * Math.sin(u * 5.2) * 0.075;
        astronaut.root.scale.set(
          BASE_ASTRO_SCALE * (1.0 - bounce * 0.35),
          BASE_ASTRO_SCALE * (1.0 + bounce * 0.55),
          BASE_ASTRO_SCALE * (1.0 - bounce * 0.35)
        );
        astronaut.root.position.set(0, -0.38 + Math.sin(clampedT * 2.0) * 0.06, 3.4);
        astronaut.root.rotation.set(0, 0.12, 0);
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

writeFileSync('estrela-neutrons-3d.html', htmlContent, 'utf-8');
copyFileSync('estrela-neutrons-3d.html', 'C:/Users/Ruan Gomes/Downloads/estrela_neutrons_animacao_vertical_3d.html');
console.log('✅ estrela-neutrons-3d.html v15.0 (12 Cenários Diferentes + Cabine 3D + Animação Orgânica + HUD Limpo) gerado com sucesso!');
