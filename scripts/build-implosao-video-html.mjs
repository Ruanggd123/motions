import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';

const audioBase64 = readFileSync('output/implosao-submarino_audio.mp3').toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;

const timingData = JSON.parse(readFileSync('src/implosaoTiming.json', 'utf8'));
const beats = timingData.beats;
const totalDuration = timingData.totalDuration;

// Lemos o código gerado pela API Kodeo
const kodeoSceneCode = readFileSync('src/kodeo-scene-builder.js', 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>A Implosão Abissal a 11.000 Metros — Fossa das Marianas 3D</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background: radial-gradient(circle at center, #020c18 0%, #000408 100%);
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #phone-viewport {
            position: relative;
            width: 100%;
            height: 100%;
            max-width: 450px;
            max-height: 920px;
            aspect-ratio: 9 / 16;
            overflow: hidden;
            background-color: #01060e;
            box-shadow: 0 25px 70px -10px rgba(0, 0, 0, 0.98), 0 0 0 1.5px rgba(14, 165, 233, 0.35), 0 0 45px rgba(2, 132, 199, 0.2);
            border-radius: 28px;
            cursor: grab;
            transition: box-shadow 0.4s ease;
        }

        #phone-viewport:active {
            cursor: grabbing;
        }

        @media (max-width: 500px) {
            #phone-viewport {
                max-width: 100%;
                max-height: 100%;
                border-radius: 0;
                box-shadow: none;
            }
        }

        body.capture-mode {
            background: #000;
        }
        body.capture-mode #phone-viewport {
            max-width: 100% !important;
            max-height: 100% !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: none !important;
        }
        body.capture-mode #center-play-btn,
        body.capture-mode #drag-hint,
        body.capture-mode #bottom-controls {
            display: none !important;
        }

        #webgl-container {
            position: absolute;
            inset: 0;
            z-index: 0;
        }

        canvas {
            width: 100% !important;
            height: 100% !important;
            display: block;
        }

        #ocean-vignette {
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            background: radial-gradient(circle at 50% 50%, transparent 45%, rgba(1, 6, 14, 0.88) 100%);
        }

        #implosion-flash {
            position: absolute;
            inset: 0;
            z-index: 6;
            pointer-events: none;
            opacity: 0;
            background: radial-gradient(circle at center, rgba(255,255,255,1.0), rgba(251,191,36,0.65), rgba(239,68,68,0.3), transparent 80%);
            transition: opacity 0.08s ease-out;
        }

        .hud-overlay {
            position: absolute;
            inset: 0;
            z-index: 10;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 14px 13px 16px 13px;
        }

        .interactive {
            pointer-events: auto;
        }

        .font-space {
            font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono-tech {
            font-family: 'JetBrains Mono', monospace;
        }

        .glass-dark {
            background: rgba(3, 10, 24, 0.82);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(14, 165, 233, 0.35);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75);
        }

        .telemetry-card {
            background: linear-gradient(180deg, rgba(3, 15, 30, 0.9) 0%, rgba(1, 8, 18, 0.85) 100%);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(56, 189, 248, 0.25);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.75);
        }

        .script-card {
            background: linear-gradient(165deg, rgba(3, 14, 28, 0.95) 0%, rgba(1, 7, 16, 0.96) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1.5px solid rgba(14, 165, 233, 0.4);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(2, 132, 199, 0.2);
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .kw-badge {
            display: inline-block;
            padding: 1px 8px;
            margin: 0 2px;
            border-radius: 7px;
            font-weight: 800;
            font-family: 'Space Grotesk', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
        }

        .kw-cyan    { background: linear-gradient(135deg, #67e8f9, #0284c7); color: #082f49; }
        .kw-fire    { background: linear-gradient(135deg, #f97316, #dc2626); color: #ffffff; box-shadow: 0 0 14px rgba(239, 68, 68, 0.6); }
        .kw-yellow  { background: linear-gradient(135deg, #fef08a, #facc15); color: #0f172a; }
        .kw-green   { background: linear-gradient(135deg, #86efac, #10b981); color: #052e16; }

        .pin-3d {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 8;
            display: flex;
            flex-direction: column;
            align-items: center;
            will-change: transform, opacity;
            transition: opacity 0.2s ease-out;
        }

        .pin-stem {
            width: 2px;
            height: 18px;
            background: linear-gradient(to bottom, currentColor, transparent);
            opacity: 0.9;
        }

        .pin-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            box-shadow: 0 0 12px currentColor, 0 0 4px #ffffff;
        }

        .center-btn {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 25;
            pointer-events: auto;
            width: 78px;
            height: 78px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(3, 14, 28, 0.9);
            border: 2px solid rgba(56, 189, 248, 0.75);
            backdrop-filter: blur(14px);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(14, 165, 233, 0.5);
            cursor: pointer;
            transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
        }
        .center-btn:hover {
            transform: translate(-50%, -50%) scale(1.06);
        }
        .center-btn:active {
            transform: translate(-50%, -50%) scale(0.92);
        }
        .hidden-btn {
            opacity: 0 !important;
            pointer-events: none !important;
            transform: translate(-50%, -50%) scale(0.8);
        }
    </style>
</head>
<body>
    <audio id="master-audio" preload="auto" src="${audioDataUri}"></audio>

    <div id="phone-viewport">
        <div id="webgl-container"></div>
        <div id="ocean-vignette"></div>
        <div id="implosion-flash"></div>

        <!-- 3D PINS PROJETADOS NA CENA -->
        <div id="pin-sub" class="pin-3d opacity-0">
            <div class="glass-dark px-2.5 py-1 rounded-md text-[10px] font-mono-tech text-cyan-300 border border-cyan-400/40 shadow-lg flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>CASCO DE TITÂNIO (RAIO-X)</span>
            </div>
            <div class="pin-stem text-cyan-400"></div>
            <div class="pin-dot text-cyan-400"></div>
        </div>

        <div id="pin-pressure" class="pin-3d opacity-0">
            <div class="glass-dark px-2.5 py-1 rounded-md text-[10px] font-mono-tech text-amber-300 border border-amber-400/40 shadow-lg flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span id="pin-pressure-text">1.100 ATM (1.135 kg/cm²)</span>
            </div>
            <div class="pin-stem text-amber-400"></div>
            <div class="pin-dot text-amber-400"></div>
        </div>

        <div id="pin-fracture" class="pin-3d opacity-0">
            <div class="glass-dark px-2.5 py-1 rounded-md text-[10px] font-mono-tech text-rose-400 border border-rose-500/50 shadow-lg flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>FISSURA SUPERSÔNICA</span>
            </div>
            <div class="pin-stem text-rose-500"></div>
            <div class="pin-dot text-rose-500"></div>
        </div>

        <!-- HUD & INTERFACE -->
        <div class="hud-overlay">
            <!-- TOPO: STORIES BAR + BRANDING + TELEMETRIA -->
            <div class="flex flex-col gap-2 w-full">
                <!-- Barra de Progresso Stories de 6 Atos -->
                <div class="grid grid-cols-6 gap-1.5 w-full pt-1">
                    <div id="story-0" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-cyan-400 w-0"></div></div>
                    <div id="story-1" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-cyan-400 w-0"></div></div>
                    <div id="story-2" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-cyan-400 w-0"></div></div>
                    <div id="story-3" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-cyan-400 w-0"></div></div>
                    <div id="story-4" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-cyan-400 w-0"></div></div>
                    <div id="story-5" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-cyan-400 w-0"></div></div>
                </div>

                <!-- Header de Status e Controles Superiores -->
                <div class="flex items-center justify-between w-full mt-0.5">
                    <div class="flex items-center gap-2">
                        <div class="flex items-center shadow-lg">
                            <span class="bg-gradient-to-r from-sky-400 to-blue-600 text-black font-black italic tracking-tighter text-[11px] px-2 py-0.5 rounded-l-md font-space">
                                KODEO 3D
                            </span>
                            <span class="bg-[#041122] border border-sky-400/30 text-sky-200 font-extrabold tracking-widest text-[10px] px-2 py-0.5 rounded-r-md uppercase font-mono-tech">
                                ABISSO MARIANAS
                            </span>
                        </div>
                    </div>

                    <!-- Mute / Live Status -->
                    <div class="flex items-center gap-2">
                        <div id="depth-badge" class="telemetry-card px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-sky-400/30">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span id="depth-text" class="text-[10px] font-mono-tech text-sky-200 font-bold">11.034m</span>
                        </div>
                        <button id="mute-btn" class="interactive w-7 h-7 rounded-full glass-dark flex items-center justify-center text-sky-300 hover:text-white transition-colors" title="Mutar/Desmutar">
                            <svg id="unmute-icon" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                            <svg id="mute-icon" class="w-3.5 h-3.5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- Painel de Telemetria Dinâmica -->
                <div class="telemetry-card rounded-xl p-2 flex items-center justify-between border border-sky-500/20 shadow-lg">
                    <div class="flex flex-col">
                        <span class="text-[9px] font-mono-tech text-sky-400/80 uppercase tracking-wider">Pressão Hidrostática</span>
                        <div class="flex items-baseline gap-1">
                            <span id="telemetry-pressure" class="text-xs font-mono-tech font-extrabold text-white">1.100</span>
                            <span class="text-[9px] font-mono-tech text-sky-300">ATM</span>
                        </div>
                    </div>
                    <div class="h-6 w-px bg-white/10"></div>
                    <div class="flex flex-col">
                        <span class="text-[9px] font-mono-tech text-amber-400/80 uppercase tracking-wider">Carga no Casco</span>
                        <div class="flex items-baseline gap-1">
                            <span id="telemetry-load" class="text-xs font-mono-tech font-extrabold text-amber-300">1.135</span>
                            <span class="text-[9px] font-mono-tech text-amber-200">kg/cm²</span>
                        </div>
                    </div>
                    <div class="h-6 w-px bg-white/10"></div>
                    <div class="flex flex-col">
                        <span class="text-[9px] font-mono-tech text-rose-400/80 uppercase tracking-wider">Temp. Adiabática</span>
                        <div class="flex items-baseline gap-1">
                            <span id="telemetry-temp" class="text-xs font-mono-tech font-extrabold text-white">4°C</span>
                            <span id="telemetry-temp-unit" class="text-[9px] font-mono-tech text-rose-300"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BOTÃO CENTRAL PLAY/PAUSE -->
            <button id="center-play-btn" class="center-btn hidden-btn" aria-label="Reproduzir Vídeo">
                <svg id="center-play-icon" class="w-9 h-9 text-cyan-300 translate-x-0.5 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg id="center-pause-icon" class="w-9 h-9 text-cyan-300 hidden drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>

            <!-- RODAPÉ: CARD DE LEGENDA DINÂMICA + SCRUBBER -->
            <div id="bottom-controls" class="flex flex-col gap-2 w-full">
                <!-- Card de Narração Dinâmica -->
                <div id="narration-card" class="script-card rounded-2xl p-3.5 shadow-2xl relative overflow-hidden">
                    <div id="narration-glow" class="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none transition-all duration-500"></div>
                    <div class="flex items-center justify-between mb-1">
                        <div class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                            <span id="act-tag" class="text-[10px] font-mono-tech text-cyan-300 font-bold uppercase tracking-wider">ATO 1 • O ABISMO</span>
                        </div>
                        <span id="time-display" class="text-[10px] font-mono-tech text-white/50">00:00 / 00:43</span>
                    </div>
                    <p id="narration-text" class="text-sm font-bold text-white leading-snug drop-shadow">
                        A <span class="kw-badge kw-cyan">11 mil metros</span>, descemos ao abismo onde a luz jamais chegou.
                    </p>
                </div>

                <!-- Barra Scrubber Interativa + Controles Inferiores -->
                <div class="glass-dark rounded-xl p-2 flex flex-col gap-1.5 interactive border border-sky-500/30">
                    <div id="timeline-container" class="relative w-full h-3 flex items-center cursor-pointer group">
                        <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative">
                            <div id="timeline-bar" class="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-rose-500 w-0"></div>
                        </div>
                        <div id="timeline-handle" class="absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-cyan-400 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div class="flex items-center justify-between pt-0.5">
                        <div class="flex items-center gap-2">
                            <button id="play-pause-btn" class="text-cyan-300 hover:text-white transition-colors">
                                <svg id="bottom-play-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                <svg id="bottom-pause-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            </button>
                            <span id="scrubber-status" class="text-[10px] font-mono-tech text-sky-300/80 font-bold uppercase">60 FPS • KODEO 3D ENGINE</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-[10px] font-mono-tech text-white/40">
                            <span>KODEO API</span>
                            <span>•</span>
                            <span>VOICESTUDIO DSP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SCRIPT DA CENA 3D & TELEMETRIA -->
    <script>
        const BEATS = ${JSON.stringify(beats, null, 2)};
        const TOTAL_DURATION = ${totalDuration.toFixed(1)};

        // Elementos DOM
        const masterAudio = document.getElementById('master-audio');
        const phoneViewport = document.getElementById('phone-viewport');
        const webglContainer = document.getElementById('webgl-container');
        const centerPlayBtn = document.getElementById('center-play-btn');
        const centerPlayIcon = document.getElementById('center-play-icon');
        const centerPauseIcon = document.getElementById('center-pause-icon');
        const bottomPlayIcon = document.getElementById('bottom-play-icon');
        const bottomPauseIcon = document.getElementById('bottom-pause-icon');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const timelineBar = document.getElementById('timeline-bar');
        const timelineContainer = document.getElementById('timeline-container');
        const narrationText = document.getElementById('narration-text');
        const actTag = document.getElementById('act-tag');
        const timeDisplay = document.getElementById('time-display');
        const muteBtn = document.getElementById('mute-btn');
        const unmuteIcon = document.getElementById('unmute-icon');
        const muteIcon = document.getElementById('mute-icon');
        const implosionFlash = document.getElementById('implosion-flash');

        // Pins e Telemetria
        const pinSub = document.getElementById('pin-sub');
        const pinPressure = document.getElementById('pin-pressure');
        const pinPressureText = document.getElementById('pin-pressure-text');
        const pinFracture = document.getElementById('pin-fracture');
        const telemPressure = document.getElementById('telemetry-pressure');
        const telemLoad = document.getElementById('telemetry-load');
        const telemTemp = document.getElementById('telemetry-temp');
        const depthText = document.getElementById('depth-text');

        let isPlaying = true;
        let currentTime = 0;
        let lastFrameTime = performance.now();
        let isCaptureMode = document.body.classList.contains('capture-mode');

        /*************************************************************************
         * 1. ÁUDIO DSP ANALÓGICO SINTETIZADO
         *************************************************************************/
        class AbyssalAudioEngine {
            constructor() {
                this.ctx = null;
                this.isInitialized = false;
                this.isMuted = false;
                this.lastSonarTime = 0;
            }

            init() {
                if (this.isInitialized) return;
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();
                    this.masterGain = this.ctx.createGain();
                    this.masterGain.gain.value = 0.25;
                    this.masterGain.connect(this.ctx.destination);

                    this.droneOsc = this.ctx.createOscillator();
                    this.droneOsc.type = 'sawtooth';
                    this.droneOsc.frequency.value = 50;

                    this.filter = this.ctx.createBiquadFilter();
                    this.filter.type = 'lowpass';
                    this.filter.frequency.value = 160;

                    this.droneGain = this.ctx.createGain();
                    this.droneGain.gain.value = 0.2;

                    this.droneOsc.connect(this.filter);
                    this.filter.connect(this.droneGain);
                    this.droneGain.connect(this.masterGain);
                    this.droneOsc.start();

                    this.isInitialized = true;
                } catch(e) {}
            }

            triggerSonarPing() {
                if (!this.ctx || this.isMuted) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 1.2);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start();
                osc.stop(this.ctx.currentTime + 1.25);
            }

            update(t) {
                if (!this.isInitialized || !this.ctx || this.isMuted) return;
                if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
                if (t - this.lastSonarTime > 5.5 && t < 26.0) {
                    this.triggerSonarPing();
                    this.lastSonarTime = t;
                }
            }
        }
        const abyssalAudio = new AbyssalAudioEngine();

        /*************************************************************************
         * 2. CENÁRIO 3D THREE.JS COM O MOTOR GERADO PELA KODEO
         *************************************************************************/
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x010915, 0.04);

        const camera = new THREE.PerspectiveCamera(46, 9 / 16, 0.1, 100);
        camera.position.set(0, 3.8, 4.6); // Ângulo Superior Top-Down (45°-60°)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(phoneViewport.clientWidth, phoneViewport.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        webglContainer.appendChild(renderer.domElement);

        // INICIALIZAÇÃO DA CENA KODEO
        ${kodeoSceneCode}

        const sceneObjects = createSubmersibleScene(THREE, scene, camera, phoneViewport);
        const {
            subRoot,
            hullMesh,
            noseMesh,
            rearMesh,
            hullXRayMat,
            airPocketMat,
            consoleMesh,
            lightCone,
            arrowMeshes,
            crackMesh,
            crackMat,
            debrisGeo,
            debrisMat,
            debrisVel,
            snowGeo,
            snowCount,
            particleCount
        } = sceneObjects;

        /*************************************************************************
         * 3. FUNÇÃO DETERMINÍSTICA DE ANIMAÇÃO evaluateSceneAtTime(t)
         *************************************************************************/
        window.evaluateSceneAtTime = function(t) {
            abyssalAudio.update(t);

            // Correnteza e flutuação suave do submarino
            subRoot.position.y = Math.sin(t * 0.9) * 0.06;
            subRoot.rotation.z = Math.sin(t * 0.5) * 0.035;
            subRoot.rotation.x = Math.cos(t * 0.4) * 0.025;
            subRoot.rotation.y = Math.sin(t * 0.3) * 0.08;

            // Neve marinha
            const sPos = snowGeo.attributes.position.array;
            for (let i = 0; i < snowCount; i++) {
                sPos[i * 3 + 1] -= 0.003;
                if (sPos[i * 3 + 1] < -6) sPos[i * 3 + 1] = 6;
            }
            snowGeo.attributes.position.needsUpdate = true;

            // Determinar Ato Vigente
            let currentBeatIndex = 0;
            for (let i = 0; i < BEATS.length; i++) {
                if (t >= BEATS[i].start && t < BEATS[i].end) {
                    currentBeatIndex = i;
                    break;
                }
                if (t >= BEATS[BEATS.length - 1].end) {
                    currentBeatIndex = BEATS.length - 1;
                }
            }

            // Atualiza Stories Bars
            for (let i = 0; i < 6; i++) {
                const barFill = document.querySelector(\`#story-\${i} div\`);
                if (!barFill) continue;
                if (i < currentBeatIndex) {
                    barFill.style.width = '100%';
                } else if (i === currentBeatIndex) {
                    const beat = BEATS[i];
                    const progress = Math.max(0, Math.min(1, (t - beat.start) / beat.duration));
                    barFill.style.width = \`\${progress * 100}%\`;
                } else {
                    barFill.style.width = '0%';
                }
            }

            // ATOS ESPECÍFICOS & FÍSICA CINEMATOGRÁFICA
            // Ato 1: O Abismo (0.0s -> 7.25s) — Descida até 11.000m
            if (t < 7.25) {
                const p = t / 7.25;
                const depth = Math.round(1000 + p * 10034);
                depthText.textContent = \`\${depth.toLocaleString()}m\`;
                telemPressure.textContent = Math.round(100 + p * 1000);
                telemLoad.textContent = Math.round(103 + p * 1032);
                telemTemp.textContent = '4°C';

                camera.position.set(0, 4.0 - p * 0.3, 4.8 - p * 0.3);
                camera.lookAt(0, 0, 0);

                arrowMeshes.forEach(a => { a.visible = false; });
                crackMesh.visible = false;
                subRoot.scale.set(1, 1, 1);
                debrisMat.opacity = 0;
                implosionFlash.style.opacity = '0';
            }
            // Ato 2: Coluna d'água & 1.100 ATM (7.25s -> 12.72s)
            else if (t < 12.72) {
                depthText.textContent = '11.034m';
                telemPressure.textContent = '1.100';
                telemLoad.textContent = '1.135';
                telemTemp.textContent = '4°C';

                const pulse = 0.5 + Math.sin(t * 8.0) * 0.25;
                arrowMeshes.forEach((a, idx) => {
                    a.visible = true;
                    a.scale.set(1 + pulse * 0.2, 1 + pulse * 0.2, 1 + pulse * 0.2);
                });

                camera.position.set(Math.sin(t * 0.2) * 0.8, 3.7, 4.4);
                camera.lookAt(0, 0, 0);
            }
            // Ato 3: Raio-X & 1 Tonelada por cm² (12.72s -> 19.45s)
            else if (t < 19.45) {
                depthText.textContent = '11.034m';
                telemPressure.textContent = '1.100';
                telemLoad.textContent = '1.135';
                telemTemp.textContent = '4°C';

                hullXRayMat.opacity = 0.12;
                airPocketMat.opacity = 0.2 + Math.sin(t * 6.0) * 0.08;

                arrowMeshes.forEach(a => {
                    a.visible = true;
                    a.scale.set(1.2, 1.2, 1.2);
                });

                camera.position.set(1.2, 3.5, 4.1);
                camera.lookAt(0, 0.1, 0.2);
            }
            // Ato 4: A Microfissura (19.45s -> 26.57s)
            else if (t < 26.57) {
                const p = (t - 19.45) / (26.57 - 19.45);
                depthText.textContent = '11.034m';
                telemPressure.textContent = '1.100';
                telemLoad.textContent = '1.135';
                telemTemp.textContent = '4°C';

                crackMesh.visible = true;
                crackMat.emissiveIntensity = 2.0 + Math.sin(t * 18.0) * 1.5;

                const microShake = (Math.random() - 0.5) * 0.02 * p;
                subRoot.position.x = microShake;
                subRoot.position.z = microShake;

                arrowMeshes.forEach(a => { a.visible = true; });
                camera.position.set(0.5, 3.3, 3.7);
                camera.lookAt(0, 0, 0.2);
            }
            // Ato 5: A Implosão em 20ms & 5.000°C (26.57s -> 34.08s)
            else if (t < 34.08) {
                const dt = t - 26.57;

                if (dt < 0.35) {
                    implosionFlash.style.opacity = (1.0 - dt / 0.35).toFixed(3);
                    telemTemp.textContent = '5.000°C!';
                    telemTemp.style.color = '#f59e0b';
                    camera.position.x += (Math.random() - 0.5) * 0.25;
                    camera.position.y += (Math.random() - 0.5) * 0.25;
                } else {
                    implosionFlash.style.opacity = '0';
                    telemTemp.textContent = 'RESFRIADO';
                }

                // Colapso de escala ultra rápido
                const collapseScale = Math.max(0.04, 1.0 - Math.min(1.0, dt * 14.0));
                subRoot.scale.set(collapseScale, collapseScale, collapseScale);

                // Cavitação expande
                debrisMat.opacity = Math.max(0, 0.9 - (dt / 7.5));
                const dPos = debrisGeo.attributes.position.array;
                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    dPos[i3] += debrisVel[i3] * 0.012;
                    dPos[i3 + 1] += debrisVel[i3 + 1] * 0.012;
                    dPos[i3 + 2] += debrisVel[i3 + 2] * 0.012;
                }
                debrisGeo.attributes.position.needsUpdate = true;

                arrowMeshes.forEach(a => { a.visible = false; });
                crackMesh.visible = false;
                lightCone.visible = false;
            }
            // Ato 6: O Colapso Total e Silêncio Abissal (34.08s -> 43.0s)
            else {
                implosionFlash.style.opacity = '0';
                subRoot.scale.set(0.02, 0.02, 0.02);
                debrisMat.opacity = Math.max(0, 0.3 - (t - 34.08) * 0.03);
                arrowMeshes.forEach(a => { a.visible = false; });
                lightCone.visible = false;

                depthText.textContent = 'VÁCUO TOTAL';
                telemPressure.textContent = '1.100';
                telemLoad.textContent = 'EQUILÍBRIO';
                telemTemp.textContent = '4°C';

                const p = (t - 34.08) / (43.0 - 34.08);
                camera.position.set(0, 4.4 + p * 1.2, 5.0 + p * 1.0);
                camera.lookAt(0, 0, 0);
            }

            // ATUALIZAÇÃO DOS 3D PINS PROJETADOS NA TELA
            camera.updateMatrixWorld();
            function projectToScreen(pos3D) {
                const p = pos3D.clone().project(camera);
                const hw = phoneViewport.clientWidth / 2;
                const hh = phoneViewport.clientHeight / 2;
                return {
                    x: p.x * hw + hw,
                    y: -p.y * hh + hh,
                    visible: p.z < 1.0
                };
            }

            // Pin 1: Casco de Titânio
            if (t >= 1.5 && t < 19.45) {
                const screenPos = projectToScreen(new THREE.Vector3(0, 0.85, 0));
                pinSub.style.transform = \`translate3d(\${screenPos.x}px, \${screenPos.y}px, 0)\`;
                pinSub.style.opacity = '1';
            } else {
                pinSub.style.opacity = '0';
            }

            // Pin 2: Pressão 1.100 ATM
            if (t >= 7.25 && t < 19.45) {
                const screenPos = projectToScreen(new THREE.Vector3(1.1, 0.4, 0));
                pinPressure.style.transform = \`translate3d(\${screenPos.x}px, \${screenPos.y}px, 0)\`;
                pinPressure.style.opacity = '1';
            } else {
                pinPressure.style.opacity = '0';
            }

            // Pin 3: Fissura Supersônica
            if (t >= 19.45 && t < 26.57) {
                const screenPos = projectToScreen(new THREE.Vector3(0.4, 0.7, 0.35));
                pinFracture.style.transform = \`translate3d(\${screenPos.x}px, \${screenPos.y}px, 0)\`;
                pinFracture.style.opacity = '1';
            } else {
                pinFracture.style.opacity = '0';
            }

            // ATUALIZAÇÃO DO CARD DE LEGENDA
            const currentBeat = BEATS[currentBeatIndex];
            if (currentBeat) {
                actTag.textContent = \`ATO \${currentBeatIndex + 1} • \${currentBeat.id === 0 ? 'O ABISMO' : currentBeat.id === 1 ? 'PRESSÃO MONSTRUOSA' : currentBeat.id === 2 ? 'RAIO-X DO CASCO' : currentBeat.id === 3 ? 'A MICROFISSURA' : currentBeat.id === 4 ? 'A IMPLOSÃO' : 'COLAPSO INSTANTÂNEO'}\`;

                let formattedText = currentBeat.text;
                formattedText = formattedText.replace(/11 mil metros/gi, '<span class="kw-badge kw-cyan">11 mil metros</span>');
                formattedText = formattedText.replace(/mil e cem atmosferas/gi, '<span class="kw-badge kw-fire">1.100 atmosferas</span>');
                formattedText = formattedText.replace(/uma tonelada de força/gi, '<span class="kw-badge kw-yellow">1 tonelada de força</span>');
                formattedText = formattedText.replace(/microfissura invisível/gi, '<span class="kw-badge kw-fire">microfissura invisível</span>');
                formattedText = formattedText.replace(/vinte milissegundos/gi, '<span class="kw-badge kw-fire">20 milissegundos</span>');
                formattedText = formattedText.replace(/cinco mil graus/gi, '<span class="kw-badge kw-yellow">5.000 graus</span>');
                formattedText = formattedText.replace(/não há tempo para perceber dor/gi, '<span class="kw-badge kw-green">sem tempo para dor</span>');

                narrationText.innerHTML = formattedText;
            }

            // Scrubber
            const normProgress = Math.max(0, Math.min(1, t / TOTAL_DURATION));
            timelineBar.style.width = \`\${normProgress * 100}%\`;

            const curMin = Math.floor(t / 60);
            const curSec = Math.floor(t % 60);
            const totMin = Math.floor(TOTAL_DURATION / 60);
            const totSec = Math.floor(TOTAL_DURATION % 60);
            timeDisplay.textContent = \`\${String(curMin).padStart(2, '0')}:\${String(curSec).padStart(2, '0')} / \${String(totMin).padStart(2, '0')}:\${String(totSec).padStart(2, '0')}\`;

            renderer.render(scene, camera);
        };

        /*************************************************************************
         * 4. FRAME DETERMINÍSTICO PARA GRAVAÇÃO HEADLESS TURBO-GPU
         *************************************************************************/
        window.renderDeterministicFrame = function(t) {
            isPlaying = false;
            if (masterAudio) masterAudio.pause();
            currentTime = t;
            window.evaluateSceneAtTime(t);
        };

        /*************************************************************************
         * 5. GAME LOOP & INTERAÇÕES DO USUÁRIO
         *************************************************************************/
        function animate(now) {
            requestAnimationFrame(animate);
            if (isPlaying) {
                const delta = (now - lastFrameTime) / 1000;
                lastFrameTime = now;
                currentTime += delta;

                if (currentTime >= TOTAL_DURATION) {
                    currentTime = 0;
                    if (masterAudio) masterAudio.currentTime = 0;
                }
                window.evaluateSceneAtTime(currentTime);
            }
        }
        lastFrameTime = performance.now();
        requestAnimationFrame(animate);

        // CONTROLES DE PLAY / PAUSE
        function togglePlayPause() {
            abyssalAudio.init();
            isPlaying = !isPlaying;
            if (isPlaying) {
                if (currentTime >= TOTAL_DURATION - 0.1) {
                    currentTime = 0;
                    if (masterAudio) masterAudio.currentTime = 0;
                }
                lastFrameTime = performance.now();
                if (masterAudio && !isCaptureMode) {
                    masterAudio.play().catch(() => {});
                }
                centerPlayBtn.classList.add('hidden-btn');
                bottomPlayIcon.classList.add('hidden');
                bottomPauseIcon.classList.remove('hidden');
            } else {
                if (masterAudio) masterAudio.pause();
                centerPlayBtn.classList.remove('hidden-btn');
                centerPlayIcon.classList.remove('hidden');
                centerPauseIcon.classList.add('hidden');
                bottomPlayIcon.classList.remove('hidden');
                bottomPauseIcon.classList.add('hidden');
            }
        }

        centerPlayBtn.addEventListener('click', togglePlayPause);
        playPauseBtn.addEventListener('click', togglePlayPause);

        // MUTE / UNMUTE
        muteBtn.addEventListener('click', () => {
            abyssalAudio.init();
            abyssalAudio.isMuted = !abyssalAudio.isMuted;
            if (masterAudio) masterAudio.muted = abyssalAudio.isMuted;
            if (abyssalAudio.isMuted) {
                unmuteIcon.classList.add('hidden');
                muteIcon.classList.remove('hidden');
            } else {
                unmuteIcon.classList.remove('hidden');
                muteIcon.classList.add('hidden');
            }
        });

        // SCRUBBER
        function seek(e) {
            abyssalAudio.init();
            const rect = timelineContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const targetSec = (clickX / rect.width) * TOTAL_DURATION;
            currentTime = Math.max(0, Math.min(TOTAL_DURATION - 0.05, targetSec));
            if (masterAudio) masterAudio.currentTime = currentTime;
            lastFrameTime = performance.now();
            window.evaluateSceneAtTime(currentTime);
        }
        timelineContainer.addEventListener('click', seek);

        // ORBIT SUAVE
        let isPointerDown = false;
        let pointerStartX = 0;
        let pointerStartY = 0;

        phoneViewport.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.interactive')) return;
            isPointerDown = true;
            pointerStartX = e.clientX;
            pointerStartY = e.clientY;
            abyssalAudio.init();
        });

        window.addEventListener('pointermove', (e) => {
            if (!isPointerDown) return;
            const dx = (e.clientX - pointerStartX) * 0.005;
            const dy = (e.clientY - pointerStartY) * 0.005;
            subRoot.rotation.y += dx;
            subRoot.rotation.x += dy;
            pointerStartX = e.clientX;
            pointerStartY = e.clientY;
        });

        window.addEventListener('pointerup', () => { isPointerDown = false; });
        window.addEventListener('pointercancel', () => { isPointerDown = false; });

        // RESIZE
        function onResize() {
            camera.aspect = phoneViewport.clientWidth / phoneViewport.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(phoneViewport.clientWidth, phoneViewport.clientHeight);
            window.evaluateSceneAtTime(currentTime);
        }
        window.addEventListener('resize', onResize);

        // AUTO-INÍCIO
        window.addEventListener('DOMContentLoaded', () => {
            if (!isCaptureMode) {
                masterAudio.play().catch(() => {
                    centerPlayBtn.classList.remove('hidden-btn');
                });
            }
            window.evaluateSceneAtTime(0);
        });
    </script>
</body>
</html>`;

writeFileSync('implosao-submarino-3d.html', htmlContent, 'utf8');
console.log('✅ Arquivo gerado no projeto: implosao-submarino-3d.html');

const downloadsPath = 'C:/Users/Ruan Gomes/Downloads/implosao_submarino_animacao_vertical_3d.html';
copyFileSync('implosao-submarino-3d.html', downloadsPath);
console.log('✅ Arquivo copiado para Downloads:', downloadsPath);
