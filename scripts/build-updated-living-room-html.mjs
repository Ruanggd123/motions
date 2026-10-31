import fs from 'node:fs';

const DOWNLOAD_PATH = 'c:/Users/Ruan Gomes/Downloads/o_gato_de_schr_dinger_anima_o_vertical_3d.html';
const LOCAL_PATH = 'quantum-cat.html';
const INDEX_PATH = 'index.html';
const AUDIO_PATH = 'output/schrodinger_living_room_audio.mp3';
const TIMING_PATH = 'src/schrodingerLivingRoomTiming.json';

const audioBase64 = fs.readFileSync(AUDIO_PATH).toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;
const timingData = JSON.parse(fs.readFileSync(TIMING_PATH, 'utf8'));
const tb = timingData.beats;

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>O Gato de Schrödinger — Animação 3D (Formato Vertical 9:16)</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Three.js r128 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">

    <style>
        * {
            user-select: none;
            -webkit-user-select: none;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #090a0f;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* 9:16 Vertical Mobile Video Frame */
        #phone-viewport {
            position: relative;
            aspect-ratio: 9 / 16;
            height: 100vh;
            max-height: 100vh;
            width: auto;
            max-width: 100vw;
            background: #fdf6ec;
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12);
            cursor: pointer;
        }

        @media (min-width: 640px) {
            #phone-viewport {
                height: 95vh;
                border-radius: 32px;
                box-shadow: 0 30px 90px rgba(0, 0, 0, 0.9), 0 0 0 6px #1e2029;
            }
        }

        /* No modo de captura CDP, ocupa 100% exato sem bordas arredondadas externas */
        body.capture-mode #phone-viewport {
            height: 100vh !important;
            width: 100vw !important;
            border-radius: 0 !important;
            box-shadow: none !important;
        }

        #webgl-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
            z-index: 1;
        }

        /* Subtle Top & Bottom Cinematic Gradients for Legibility */
        .video-vignette {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 2;
            background: linear-gradient(
                180deg,
                rgba(15, 23, 42, 0.50) 0%,
                rgba(15, 23, 42, 0.0) 16%,
                rgba(15, 23, 42, 0.0) 60%,
                rgba(10, 14, 26, 0.80) 88%,
                rgba(10, 14, 26, 0.94) 100%
            );
        }

        /* Kinetic Typography Emphasis Badges */
        .kw-badge {
            display: inline-block;
            padding: 1px 8px;
            margin: 0 2px;
            border-radius: 8px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            letter-spacing: -0.01em;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .kw-yellow {
            background: #fde047;
            color: #0f172a;
        }
        .kw-orange {
            background: #fb923c;
            color: #0f172a;
        }
        .kw-cyan {
            background: #22d3ee;
            color: #082f49;
            box-shadow: 0 0 16px rgba(34, 211, 238, 0.55);
        }
        .kw-magenta {
            background: #f472b6;
            color: #4a044e;
            box-shadow: 0 0 16px rgba(244, 114, 182, 0.55);
        }
        .kw-green {
            background: #4ade80;
            color: #052e16;
        }
        .kw-white {
            background: #ffffff;
            color: #0f172a;
        }

        /* Script Card Entrance Animation (Mais suave e serena) */
        .script-animate {
            animation: cardSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes cardSlideUp {
            0% {
                opacity: 0.2;
                transform: translateY(8px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* 3D Projected Callout Pin */
        .callout-pin {
            position: absolute;
            z-index: 10;
            pointer-events: none;
            transform: translate(-50%, -100%);
            transition: opacity 0.35s ease;
        }

        .callout-bubble {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 11.5px;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            white-space: nowrap;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38);
            animation: floatPin 3.2s ease-in-out infinite alternate;
        }

        .callout-stem {
            width: 2px;
            height: 15px;
            margin: 0 auto;
            background: currentColor;
        }

        .callout-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            margin: 0 auto;
            background: currentColor;
            box-shadow: 0 0 10px currentColor;
        }

        @keyframes floatPin {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-3px); }
        }

        #audio-btn {
            transition: all 0.25s ease;
        }
        #audio-btn:hover {
            transform: scale(1.06);
        }
        body.capture-mode #audio-btn {
            display: none !important;
        }
    </style>
</head>
<body>

    <!-- Embedded Master Audio (Neural pt-BR-AntonioNeural Calmo & Didático) -->
    <audio id="master-audio" preload="auto" src="${audioDataUri}"></audio>

    <!-- ================= 9:16 VERTICAL MOBILE VIDEO CONTAINER ================= -->
    <main id="phone-viewport" onclick="handleViewportTap(event)">
        
        <!-- 3D WebGL Canvas -->
        <canvas id="webgl-canvas"></canvas>

        <!-- Soft Gradient Vignette for Text Contrast -->
        <div class="video-vignette"></div>

        <!-- TOP STORIES / REELS SEGMENTED PROGRESS BAR -->
        <div class="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2.5 pointer-events-none">
            <div id="segments-container" class="grid grid-cols-12 gap-1 w-full pointer-events-auto">
                <!-- Populated dynamically for the 12 script beats -->
            </div>

            <!-- Header Pill + Audio Control -->
            <div class="flex items-center justify-between px-1">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 shadow-lg">
                    <span id="beat-dot" class="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span id="beat-tag" class="text-[11px] font-extrabold uppercase tracking-wider text-white">
                        O GATO DE SCHRÖDINGER
                    </span>
                </div>

                <div class="flex items-center gap-2 pointer-events-auto">
                    <!-- Audio Mute/Unmute Button -->
                    <button id="audio-btn" onclick="toggleAudio(event)" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-white shadow-lg text-[11px] font-bold">
                        <span id="audio-icon">🔊</span>
                        <span id="audio-text" class="hidden sm:inline">Som</span>
                    </button>

                    <!-- Beat Counter -->
                    <span id="beat-counter" class="text-[11px] font-bold text-white/85 bg-slate-950/65 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        1 / 12
                    </span>
                </div>
            </div>
        </div>

        <!-- 3D OBJECT CALLOUT PINS -->
        <div id="pin-primary" class="callout-pin opacity-0">
            <div id="pin-primary-bubble" class="callout-bubble bg-amber-300 text-slate-950 border-2 border-white">
                <span id="pin-primary-icon">🐱</span>
                <span id="pin-primary-text">Gato Curioso</span>
            </div>
            <div id="pin-primary-stem" class="callout-stem text-amber-300"></div>
            <div id="pin-primary-dot" class="callout-dot text-amber-300"></div>
        </div>

        <div id="pin-secondary" class="callout-pin opacity-0">
            <div id="pin-secondary-bubble" class="callout-bubble bg-fuchsia-400 text-slate-950 border-2 border-white">
                <span id="pin-secondary-icon">👻</span>
                <span id="pin-secondary-text">50% Morto</span>
            </div>
            <div id="pin-secondary-stem" class="callout-stem text-fuchsia-400"></div>
            <div id="pin-secondary-dot" class="callout-dot text-fuchsia-400"></div>
        </div>

        <!-- CENTER TAP PAUSE/PLAY FEEDBACK ICON -->
        <div id="pause-indicator" class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
            <div class="w-16 h-16 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-2xl">
                <svg id="pause-svg" class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
            </div>
        </div>

        <!-- BOTTOM SYNCHRONIZED KINETIC SCRIPT OVERLAY -->
        <div class="absolute bottom-5 left-3.5 right-3.5 z-20 pointer-events-none flex flex-col items-center">
            <div id="script-card" class="w-full rounded-2xl bg-slate-950/82 backdrop-blur-xl border border-white/20 px-4 py-4 shadow-2xl text-center">
                <p id="script-line" class="text-[17px] sm:text-[19px] leading-[1.48] font-bold text-white tracking-tight">
                </p>
            </div>
        </div>

    </main>

    <!-- ================= THREE.JS 3D LIVING ROOM & SMOOTH DIRECTOR ENGINE ================= -->
    <script>
        if (window.location.search.includes('capture=1')) {
            document.body.classList.add('capture-mode');
        }

        /*************************************************************************
         * 1. ROTEIRO DE 12 ATOS EM RITMO CALMO + VISÃO DE CIMA E CAIXA TRANSPARENTE
         *************************************************************************/
        const BEATS = [
            {
                id: 0,
                start: ${tb[0].start},
                end: ${tb[0].end},
                tag: "1. AMBIENTE COMUM",
                dotColor: "#fbbf24",
                html: \`Imagine a <span class="kw-badge kw-yellow">SALA DA SUA CASA</span> em um dia totalmente comum...\`,
                camPos: [0.0, 5.0, 9.6],
                camLook: [0.0, 1.85, -0.4],
                boxOpen: 1.0,
                wallOpacity: 1.0,
                frontOpacity: 1.0,
                flapOpacity: 1.0,
                wireOpacity: 0.0,
                superposition: false,
                pin1: { text: "Sala de Estar", icon: "🏠", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "table" },
                pin2: null
            },
            {
                id: 1,
                start: ${tb[1].start},
                end: ${tb[1].end},
                tag: "2. A CAIXA E O GATO",
                dotColor: "#fb923c",
                html: \`Em cima da mesa, colocamos um <span class="kw-badge kw-orange">GATO CURIOSO</span> dentro de uma <span class="kw-badge kw-white">CAIXA DE PAPELÃO</span>.\`,
                // Visão 3/4 superior clara mostrando o gato dentro da caixa com frente transparente
                camPos: [1.15, 4.55, 4.15],
                camLook: [0.35, 1.65, 0.0],
                boxOpen: 1.0,
                wallOpacity: 0.38,
                frontOpacity: 0.08,
                flapOpacity: 0.25,
                wireOpacity: 0.45,
                superposition: false,
                pin1: { text: "Gato Curioso", icon: "🐱", style: "bg-orange-400 text-slate-950", stem: "text-orange-400", target: "catAlive" },
                pin2: null
            },
            {
                id: 2,
                start: ${tb[2].start},
                end: ${tb[2].end},
                tag: "3. O GATILHO QUÂNTICO",
                dotColor: "#22d3ee",
                html: \`Junto com ele, há um único <span class="kw-badge kw-cyan">ÁTOMO INSTÁVEL</span> com <span class="kw-badge kw-yellow">50% DE CHANCE</span> de disparar.\`,
                // VISÃO DE CIMA INCLINADA + CAIXA TRANSPARENTE CRISTALINA: foco total no Átomo
                camPos: [-0.72, 4.75, 2.75],
                camLook: [-0.62, 1.62, -0.06],
                boxOpen: 1.0,
                wallOpacity: 0.10,
                frontOpacity: 0.04,
                flapOpacity: 0.06,
                wireOpacity: 0.75,
                superposition: false,
                pin1: { text: "Átomo (50% de chance)", icon: "⚛️", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "atom" },
                pin2: null
            },
            {
                id: 3,
                start: ${tb[3].start},
                end: ${tb[3].end},
                tag: "4. O MECANISMO",
                dotColor: "#fbbf24",
                html: \`Se o átomo disparar, este <span class="kw-badge kw-yellow">DETECTOR</span> solta o <span class="kw-badge kw-orange">MARTELO</span> automaticamente.\`,
                // VISÃO DE CIMA (TOP-DOWN 60°) mostrando Detector + Martelo descendo em direção ao Frasco
                camPos: [-0.22, 4.95, 2.65],
                camLook: [-0.18, 1.62, -0.05],
                boxOpen: 1.0,
                wallOpacity: 0.08,
                frontOpacity: 0.04,
                flapOpacity: 0.05,
                wireOpacity: 0.78,
                superposition: false,
                hammerDemo: true,
                pin1: { text: "Detector + Martelo", icon: "🔨", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "hammer" },
                pin2: null
            },
            {
                id: 4,
                start: ${tb[4].start},
                end: ${tb[4].end},
                tag: "5. O PERIGO",
                dotColor: "#4ade80",
                html: \`O martelo quebra o <span class="kw-badge kw-green">FRASCO DE VENENO</span>, mas se não disparar, <span class="kw-badge kw-white">NADA ACONTECE</span>.\`,
                // VISÃO DE CIMA PANORÂMICA (DIORAMA) mostrando toda a sequência dentro da caixa transparente
                camPos: [0.05, 5.15, 2.95],
                camLook: [0.05, 1.58, 0.0],
                boxOpen: 1.0,
                wallOpacity: 0.08,
                frontOpacity: 0.04,
                flapOpacity: 0.05,
                wireOpacity: 0.78,
                superposition: false,
                pin1: { text: "Frasco de Veneno", icon: "🧪", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "flask" },
                pin2: { text: "Gato Seguro", icon: "🐱", style: "bg-orange-300 text-slate-950", stem: "text-orange-300", target: "catAlive" }
            },
            {
                id: 5,
                start: ${tb[5].start},
                end: ${tb[5].end},
                tag: "6. CAIXA FECHADA",
                dotColor: "#f8fafc",
                html: \`Agora <span class="kw-badge kw-yellow">FECHAMOS A CAIXA</span>, e sem olhar lá dentro, ninguém sabe o que aconteceu.\`,
                camPos: [0.0, 4.35, 5.5],
                camLook: [0.0, 1.85, 0.0],
                boxOpen: 0.0,
                wallOpacity: 1.0,
                frontOpacity: 1.0,
                flapOpacity: 1.0,
                wireOpacity: 0.0,
                superposition: false,
                pin1: { text: "Caixa Fechada e Isolada", icon: "📦", style: "bg-white text-slate-950", stem: "text-white", target: "boxTop" },
                pin2: null
            },
            {
                id: 6,
                start: ${tb[6].start},
                end: ${tb[6].end},
                tag: "7. SENSO COMUM",
                dotColor: "#fb923c",
                html: \`Para o nosso <span class="kw-badge kw-white">SENSO COMUM</span>, o gato lá dentro só pode estar <span class="kw-badge kw-cyan">VIVO</span> ou <span class="kw-badge kw-magenta">MORTO</span>.\`,
                camPos: [-1.25, 4.15, 5.2],
                camLook: [0.0, 1.85, 0.0],
                boxOpen: 0.0,
                wallOpacity: 1.0,
                frontOpacity: 1.0,
                flapOpacity: 1.0,
                wireOpacity: 0.0,
                superposition: false,
                pin1: { text: "Está Vivo?", icon: "❓", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "boxRight" },
                pin2: { text: "Ou Morto?", icon: "❓", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "boxLeft" }
            },
            {
                id: 7,
                start: ${tb[7].start},
                end: ${tb[7].end},
                tag: "8. LEI QUÂNTICA",
                dotColor: "#22d3ee",
                html: \`Mas na <span class="kw-badge kw-cyan">FÍSICA QUÂNTICA</span>, sem observador, o átomo fica nos <span class="kw-badge kw-yellow">DOIS ESTADOS AO MESMO TEMPO</span>!\`,
                // Visão superior de Raio-X: caixa continua fechada mas fica 92% transparente!
                camPos: [-0.20, 4.75, 3.65],
                camLook: [-0.15, 1.68, 0.0],
                boxOpen: 0.0,
                wallOpacity: 0.08,
                frontOpacity: 0.06,
                flapOpacity: 0.08,
                wireOpacity: 0.90,
                superposition: true,
                pin1: { text: "Disparou + Não Disparou", icon: "⚡", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "atom" },
                pin2: null
            },
            {
                id: 8,
                start: ${tb[8].start},
                end: ${tb[8].end},
                tag: "9. SUPERPOSIÇÃO",
                dotColor: "#f472b6",
                html: \`Isso cria a <span class="kw-badge kw-yellow">SUPERPOSIÇÃO</span>, onde o gato está <span class="kw-badge kw-cyan">50% VIVO</span> e <span class="kw-badge kw-magenta">50% MORTO</span> simultaneamente!\`,
                // Visão superior clara dos dois gatos coexistindo dentro da caixa em Raio-X
                camPos: [0.35, 4.85, 3.55],
                camLook: [0.28, 1.65, 0.0],
                boxOpen: 0.0,
                wallOpacity: 0.08,
                frontOpacity: 0.06,
                flapOpacity: 0.08,
                wireOpacity: 0.92,
                superposition: true,
                pin1: { text: "50% VIVO", icon: "🐱", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "superAlive" },
                pin2: { text: "50% MORTO", icon: "👻", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "superDead" }
            },
            {
                id: 9,
                start: ${tb[9].start},
                end: ${tb[9].end},
                tag: "10. A OBSERVAÇÃO",
                dotColor: "#fde047",
                html: \`Essa mistura bizarra dura até o exato segundo em que <span class="kw-badge kw-yellow">ABRIMOS A CAIXA</span> para olhar!\`,
                camPos: [0.0, 4.75, 4.9],
                camLook: [0.0, 1.78, 0.0],
                boxOpen: 1.0,
                wallOpacity: 0.65,
                frontOpacity: 0.18,
                flapOpacity: 0.75,
                wireOpacity: 0.35,
                superposition: false,
                collapseFlash: true,
                pin1: { text: "Abrindo a Caixa!", icon: "👀", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "boxTop" },
                pin2: null
            },
            {
                id: 10,
                start: ${tb[10].start},
                end: ${tb[10].end},
                tag: "11. O COLAPSO",
                dotColor: "#4ade80",
                html: \`O simples ato de <span class="kw-badge kw-white">OLHAR</span> faz a natureza decidir na hora, e a incerteza vira uma <span class="kw-badge kw-green">ÚNICA REALIDADE</span>!\`,
                camPos: [1.05, 4.15, 3.65],
                camLook: [0.48, 1.72, 0.05],
                boxOpen: 1.0,
                wallOpacity: 0.25,
                frontOpacity: 0.06,
                flapOpacity: 0.18,
                wireOpacity: 0.40,
                superposition: false,
                catHappyJump: true,
                pin1: { text: "100% Vivo (Realidade Única)", icon: "✨", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "catAlive" },
                pin2: null
            },
            {
                id: 11,
                start: ${tb[11].start},
                end: ${tb[11].end},
                tag: "12. CONCLUSÃO",
                dotColor: "#fb923c",
                html: \`Esse é o <span class="kw-badge kw-orange">GATO DE SCHRÖDINGER</span>, mostrando que no mundo quântico <span class="kw-badge kw-yellow">OBSERVAR MUDA A REALIDADE</span>.\`,
                camPos: [0.0, 4.45, 6.2],
                camLook: [0.15, 1.82, 0.0],
                boxOpen: 1.0,
                wallOpacity: 0.55,
                frontOpacity: 0.12,
                flapOpacity: 0.55,
                wireOpacity: 0.30,
                superposition: false,
                pin1: { text: "O Gato de Schrödinger", icon: "🐈", style: "bg-orange-400 text-slate-950", stem: "text-orange-400", target: "catAlive" },
                pin2: null
            }
        ];

        const TOTAL_DURATION = ${timingData.totalDuration};

        // Build Top Segmented Progress Bar
        const segmentsContainer = document.getElementById('segments-container');
        const segmentFills = [];
        BEATS.forEach((b) => {
            const segTrack = document.createElement('div');
            segTrack.className = "h-1 bg-white/25 rounded-full overflow-hidden cursor-pointer";
            segTrack.onclick = (e) => {
                e.stopPropagation();
                seekToTime(b.start + 0.05);
            };
            const segFill = document.createElement('div');
            segFill.className = "h-full bg-white rounded-full";
            segFill.style.width = "0%";
            segTrack.appendChild(segFill);
            segmentsContainer.appendChild(segTrack);
            segmentFills.push(segFill);
        });

        /*************************************************************************
         * 2. CONFIGURAÇÃO DO THREE.JS (FORMATO 9:16 + ILUMINAÇÃO ACONCHEGANTE)
         *************************************************************************/
        const viewport = document.getElementById('phone-viewport');
        const canvas = document.getElementById('webgl-canvas');
        const masterAudio = document.getElementById('master-audio');

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5ebe0);
        scene.fog = new THREE.FogExp2(0xf5ebe0, 0.020);

        const camera = new THREE.PerspectiveCamera(42, 9 / 16, 0.1, 100);
        camera.position.set(0, 5.0, 9.6);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.14;

        function resizeRenderer() {
            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        }
        window.addEventListener('resize', resizeRenderer);
        resizeRenderer();

        // Warm Home Lighting Setup
        const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xd6ccc2, 0.98);
        hemiLight.position.set(0, 12, 0);
        scene.add(hemiLight);

        // Morning Sunlight
        const sunLight = new THREE.DirectionalLight(0xfff3d6, 1.45);
        sunLight.position.set(7.5, 11.5, 6.5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 28;
        const d = 7;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.0002;
        scene.add(sunLight);

        // Top Interior Fill Light (Garante claridade total quando olhamos de cima para dentro da caixa)
        const boxTopFillLight = new THREE.DirectionalLight(0xffffff, 0.65);
        boxTopFillLight.position.set(0, 9, 2);
        scene.add(boxTopFillLight);

        // Warm Floor Lamp Point Light on the left
        const lampPointLight = new THREE.PointLight(0xffb74d, 1.0, 12);
        lampPointLight.position.set(-3.4, 4.3, -2.0);
        scene.add(lampPointLight);

        // Quantum Superposition Accent Light
        const quantumLight = new THREE.PointLight(0x38bdf8, 0.0, 7);
        quantumLight.position.set(0, 2.6, 0);
        scene.add(quantumLight);

        /*************************************************************************
         * 3. CONSTRUÇÃO DA SALA DE ESTAR COMUM ("AMBIENTE DE CASA")
         *************************************************************************/
        const roomGroup = new THREE.Group();
        scene.add(roomGroup);

        // 3.1 Wooden Plank Floor
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const fCtx = floorCanvas.getContext('2d');
        fCtx.fillStyle = '#c89f78';
        fCtx.fillRect(0, 0, 512, 512);
        fCtx.strokeStyle = '#b0845d';
        fCtx.lineWidth = 3;
        for (let y = 0; y <= 512; y += 64) {
            fCtx.beginPath();
            fCtx.moveTo(0, y);
            fCtx.lineTo(512, y);
            fCtx.stroke();
        }
        const floorTex = new THREE.CanvasTexture(floorCanvas);
        floorTex.wrapS = THREE.RepeatWrapping;
        floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(4, 4);

        const floorMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(26, 26),
            new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.65 })
        );
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        roomGroup.add(floorMesh);

        // 3.2 Back & Side Living Room Walls + Baseboard
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4ece1, roughness: 0.85 });
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 0.4), wallMat);
        backWall.position.set(0, 7, -4.5);
        backWall.receiveShadow = true;
        roomGroup.add(backWall);

        const baseboard = new THREE.Mesh(
            new THREE.BoxGeometry(24, 0.35, 0.46),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
        );
        baseboard.position.set(0, 0.175, -4.48);
        roomGroup.add(baseboard);

        // 3.3 Sunlit Window on the Right Back Wall
        const windowGroup = new THREE.Group();
        windowGroup.position.set(3.2, 5.2, -4.28);
        roomGroup.add(windowGroup);

        const skyPane = new THREE.Mesh(
            new THREE.PlaneGeometry(2.6, 3.2),
            new THREE.MeshBasicMaterial({ color: 0xdbeafe })
        );
        windowGroup.add(skyPane);

        const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 0.12), frameMat);
        frameTop.position.y = 1.6;
        const frameBot = frameTop.clone();
        frameBot.position.y = -1.6;
        const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.3, 0.12), frameMat);
        frameLeft.position.x = -1.35;
        const frameRight = frameLeft.clone();
        frameRight.position.x = 1.35;
        const frameMidH = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.08, 0.1), frameMat);
        const frameMidV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.2, 0.1), frameMat);
        windowGroup.add(frameTop, frameBot, frameLeft, frameRight, frameMidH, frameMidV);

        // 3.4 Framed Wall Art above the Sofa
        const artGroup = new THREE.Group();
        artGroup.position.set(-0.4, 5.3, -4.28);
        roomGroup.add(artGroup);

        const artFrame = new THREE.Mesh(
            new THREE.BoxGeometry(1.9, 2.3, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
        );
        const artCanvas = new THREE.Mesh(
            new THREE.PlaneGeometry(1.65, 2.05),
            new THREE.MeshBasicMaterial({ color: 0xfef3c7 })
        );
        artCanvas.position.z = 0.05;
        const artSun = new THREE.Mesh(
            new THREE.CircleGeometry(0.45, 24),
            new THREE.MeshBasicMaterial({ color: 0xf97316 })
        );
        artSun.position.set(0, 0.15, 0.06);
        artGroup.add(artFrame, artCanvas, artSun);

        // 3.5 Cozy Circular Living Room Rug
        const rugGroup = new THREE.Group();
        rugGroup.position.set(0, 0.02, 0.2);
        roomGroup.add(rugGroup);

        const rugOuter = new THREE.Mesh(
            new THREE.CylinderGeometry(3.4, 3.4, 0.04, 48),
            new THREE.MeshStandardMaterial({ color: 0xe7dfd3, roughness: 0.9 })
        );
        rugOuter.receiveShadow = true;
        const rugInner = new THREE.Mesh(
            new THREE.CylinderGeometry(2.6, 2.6, 0.045, 48),
            new THREE.MeshStandardMaterial({ color: 0xd5c7b4, roughness: 0.9 })
        );
        rugInner.receiveShadow = true;
        rugGroup.add(rugOuter, rugInner);

        // 3.6 Comfortable Sofa
        const sofaGroup = new THREE.Group();
        sofaGroup.position.set(-0.2, 0, -3.15);
        roomGroup.add(sofaGroup);

        const sofaFabricMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.75, 1.7), sofaFabricMat);
        sofaBase.position.y = 0.55;
        sofaBase.castShadow = true;
        sofaBase.receiveShadow = true;
        sofaGroup.add(sofaBase);

        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.65, 0.45), sofaFabricMat);
        sofaBack.position.set(0, 1.55, -0.62);
        sofaBack.castShadow = true;
        sofaGroup.add(sofaBack);

        const armGeo = new THREE.BoxGeometry(0.45, 1.25, 1.75);
        const leftArm = new THREE.Mesh(armGeo, sofaFabricMat);
        leftArm.position.set(-2.15, 0.95, 0);
        leftArm.castShadow = true;
        const rightArm = leftArm.clone();
        rightArm.position.x = 2.15;
        sofaGroup.add(leftArm, rightArm);

        const pillowGeo = new THREE.BoxGeometry(0.65, 0.65, 0.25);
        const pillow1 = new THREE.Mesh(pillowGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 }));
        pillow1.position.set(-1.35, 1.28, -0.22);
        pillow1.rotation.z = 0.18;
        const pillow2 = new THREE.Mesh(pillowGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.7 }));
        pillow2.position.set(1.35, 1.28, -0.22);
        pillow2.rotation.z = -0.15;
        sofaGroup.add(pillow1, pillow2);

        // 3.7 Standing Floor Lamp
        const lampGroup = new THREE.Group();
        lampGroup.position.set(-3.3, 0, -2.5);
        roomGroup.add(lampGroup);

        const lampBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.5, 0.1, 24),
            new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
        );
        lampBase.position.y = 0.05;
        const lampPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 4.1, 12),
            new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
        );
        lampPole.position.y = 2.1;
        const lampShade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.68, 0.85, 24, 1, true),
            new THREE.MeshStandardMaterial({
                color: 0xfef3c7,
                emissive: 0xfbbf24,
                emissiveIntensity: 0.45,
                side: THREE.DoubleSide
            })
        );
        lampShade.position.y = 4.15;
        lampGroup.add(lampBase, lampPole, lampShade);

        // 3.8 Potted Plant
        const plantGroup = new THREE.Group();
        plantGroup.position.set(2.9, 0, -2.4);
        roomGroup.add(plantGroup);

        const potMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.48, 0.36, 0.85, 20),
            new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
        );
        potMesh.position.y = 0.425;
        potMesh.castShadow = true;
        plantGroup.add(potMesh);

        const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
        for (let i = 0; i < 7; i++) {
            const leafPivot = new THREE.Group();
            leafPivot.position.y = 0.75;
            leafPivot.rotation.y = (i * Math.PI * 2) / 7;
            leafPivot.rotation.z = 0.35 + (i % 2) * 0.2;

            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), leafMat);
            leaf.scale.set(1.6, 0.22, 0.85);
            leaf.position.set(0.45, 0.35, 0);
            leaf.castShadow = true;
            leafPivot.add(leaf);
            plantGroup.add(leafPivot);
        }

        // 3.9 Center Wooden Coffee Table
        const tableGroup = new THREE.Group();
        tableGroup.position.set(0, 0, 0);
        roomGroup.add(tableGroup);

        const woodTableMat = new THREE.MeshStandardMaterial({ color: 0x8c5a32, roughness: 0.45 });
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 2.3), woodTableMat);
        tableTop.position.y = 1.25;
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        tableGroup.add(tableTop);

        const legGeo = new THREE.CylinderGeometry(0.08, 0.05, 1.22, 12);
        const legOffsets = [
            [-1.55, 0.61, -0.90], [1.55, 0.61, -0.90],
            [-1.55, 0.61, 0.90], [1.55, 0.61, 0.90]
        ];
        legOffsets.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, woodTableMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            tableGroup.add(leg);
        });

        /*************************************************************************
         * 4. A CAIXA DE PAPELÃO (COM PAREDES TRANSPARENTES E FUNDO DE ALTO CONTRASTE)
         *************************************************************************/
        const TABLE_SURFACE_Y = 1.32;
        const BOX_W = 2.48;
        const BOX_H = 1.26;
        const BOX_D = 1.62;

        const boxGroup = new THREE.Group();
        boxGroup.position.set(0, TABLE_SURFACE_Y, 0);
        scene.add(boxGroup);

        // Fundo da caixa sempre visível e claro para dar contraste na visão de cima!
        const boxFloorMat = new THREE.MeshStandardMaterial({
            color: 0xe6ccb2,
            roughness: 0.75,
            metalness: 0.05
        });
        const boxBottom = new THREE.Mesh(new THREE.BoxGeometry(BOX_W, 0.045, BOX_D), boxFloorMat);
        boxBottom.position.y = 0.022;
        boxBottom.receiveShadow = true;
        boxGroup.add(boxBottom);

        // Tapetinho interno claro sob os equipamentos e o gato
        const innerMatMesh = new THREE.Mesh(
            new THREE.BoxGeometry(BOX_W - 0.16, 0.015, BOX_D - 0.16),
            new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 })
        );
        innerMatMesh.position.y = 0.048;
        innerMatMesh.receiveShadow = true;
        boxGroup.add(innerMatMesh);

        // Materiais das paredes e abas com transparência independente
        const cardboardWallMat = new THREE.MeshStandardMaterial({
            color: 0xd4a373,
            roughness: 0.78,
            metalness: 0.05,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide
        });

        const cardboardFrontMat = new THREE.MeshStandardMaterial({
            color: 0xd4a373,
            roughness: 0.78,
            metalness: 0.05,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
            depthWrite: true
        });

        const cardboardFlapMat = new THREE.MeshStandardMaterial({
            color: 0xd4a373,
            roughness: 0.78,
            metalness: 0.05,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
            depthWrite: true
        });

        // Back, Left, Right Walls
        const backWallBox = new THREE.Mesh(new THREE.BoxGeometry(BOX_W, BOX_H, 0.04), cardboardWallMat);
        backWallBox.position.set(0, BOX_H / 2, -BOX_D / 2);
        boxGroup.add(backWallBox);

        const leftWallBox = new THREE.Mesh(new THREE.BoxGeometry(0.04, BOX_H, BOX_D), cardboardWallMat);
        leftWallBox.position.set(-BOX_W / 2, BOX_H / 2, 0);
        boxGroup.add(leftWallBox);

        const rightWallBox = new THREE.Mesh(new THREE.BoxGeometry(0.04, BOX_H, BOX_D), cardboardWallMat);
        rightWallBox.position.set(BOX_W / 2, BOX_H / 2, 0);
        boxGroup.add(rightWallBox);

        // Front Wall
        const frontWallBox = new THREE.Mesh(new THREE.BoxGeometry(BOX_W, BOX_H, 0.04), cardboardFrontMat);
        frontWallBox.position.set(0, BOX_H / 2, BOX_D / 2);
        boxGroup.add(frontWallBox);

        // Wireframe X-Ray Outline (Destaca as bordas da caixa quando transparente)
        const boxWireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D));
        const boxWireMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.0 });
        const boxWireframe = new THREE.LineSegments(boxWireGeo, boxWireMat);
        boxWireframe.position.y = BOX_H / 2;
        boxGroup.add(boxWireframe);

        // 4 Articulated Top Cardboard Flaps
        const flapBackPivot = new THREE.Group();
        flapBackPivot.position.set(0, BOX_H, -BOX_D / 2);
        const flapBackMesh = new THREE.Mesh(new THREE.BoxGeometry(BOX_W, 0.032, BOX_D * 0.51), cardboardFlapMat);
        flapBackMesh.position.set(0, 0, BOX_D * 0.255);
        flapBackPivot.add(flapBackMesh);
        boxGroup.add(flapBackPivot);

        const flapFrontPivot = new THREE.Group();
        flapFrontPivot.position.set(0, BOX_H, BOX_D / 2);
        const flapFrontMesh = new THREE.Mesh(new THREE.BoxGeometry(BOX_W, 0.032, BOX_D * 0.51), cardboardFlapMat);
        flapFrontMesh.position.set(0, 0, -BOX_D * 0.255);
        flapFrontPivot.add(flapFrontMesh);
        boxGroup.add(flapFrontPivot);

        const flapLeftPivot = new THREE.Group();
        flapLeftPivot.position.set(-BOX_W / 2, BOX_H, 0);
        const flapLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(BOX_W * 0.48, 0.032, BOX_D * 0.96), cardboardFlapMat);
        flapLeftMesh.position.set(BOX_W * 0.24, 0, 0);
        flapLeftPivot.add(flapLeftMesh);
        boxGroup.add(flapLeftPivot);

        const flapRightPivot = new THREE.Group();
        flapRightPivot.position.set(BOX_W / 2, BOX_H, 0);
        const flapRightMesh = new THREE.Mesh(new THREE.BoxGeometry(BOX_W * 0.48, 0.032, BOX_D * 0.96), cardboardFlapMat);
        flapRightMesh.position.set(-BOX_W * 0.24, 0, 0);
        flapRightPivot.add(flapRightMesh);
        boxGroup.add(flapRightPivot);

        /*************************************************************************
         * 5. OBJETOS DENTRO DA CAIXA (BEM ESPAÇADOS PARA VISÃO DE CIMA CRISTALINA)
         *************************************************************************/
        const propsGroup = new THREE.Group();
        propsGroup.position.set(0, 0.05, 0);
        boxGroup.add(propsGroup);

        // 5.1 Átomo Instável (Esquerda: x = -0.82)
        const atomGroup = new THREE.Group();
        atomGroup.position.set(-0.82, 0.42, -0.08);
        propsGroup.add(atomGroup);

        const atomPedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.19, 0.28, 20),
            new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.25 })
        );
        atomPedestal.position.y = -0.28;
        atomGroup.add(atomPedestal);

        const atomCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 24, 24),
            new THREE.MeshStandardMaterial({
                color: 0x22d3ee,
                emissive: 0x06b6d4,
                emissiveIntensity: 1.6
            })
        );
        atomGroup.add(atomCore);

        const atomRings = [];
        for (let r = 0; r < 2; r++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.25, 0.016, 12, 40),
                new THREE.MeshBasicMaterial({ color: r === 0 ? 0x0ea5e9 : 0xec4899 })
            );
            ring.rotation.x = r === 0 ? Math.PI / 3 : -Math.PI / 3;
            atomGroup.add(ring);
            atomRings.push(ring);
        }

        // Cabo condutor ligando a base do Átomo ao Detector
        const cableGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.46, 12);
        cableGeo.rotateZ(Math.PI / 2);
        const cableMesh = new THREE.Mesh(
            cableGeo,
            new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
        );
        cableMesh.position.set(-0.58, 0.12, -0.18);
        propsGroup.add(cableMesh);

        // 5.2 Detector Geiger + Martelo Articulado (Centro-Esquerda: x = -0.34)
        const detectorBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.40, 0.32),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.55 })
        );
        detectorBox.position.set(-0.34, 0.20, -0.22);
        detectorBox.castShadow = true;
        propsGroup.add(detectorBox);

        // Mostrador frontal branco no Detector
        const gaugeFace = new THREE.Mesh(
            new THREE.CircleGeometry(0.11, 20),
            new THREE.MeshBasicMaterial({ color: 0xf8fafc })
        );
        gaugeFace.position.set(-0.34, 0.23, -0.055);
        propsGroup.add(gaugeFace);

        const detectorLed = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        detectorLed.position.set(-0.34, 0.44, -0.22);
        propsGroup.add(detectorLed);

        // Martelo Articulado (Pivô em x = -0.26, bate em x = 0.12 onde está o Frasco)
        const hammerPivot = new THREE.Group();
        hammerPivot.position.set(-0.26, 0.52, -0.04);
        propsGroup.add(hammerPivot);

        const hammerHandle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.024, 0.024, 0.40, 12),
            new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 })
        );
        hammerHandle.rotation.z = -Math.PI / 2;
        hammerHandle.position.set(0.19, 0, 0);
        hammerPivot.add(hammerHandle);

        const hammerHead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.075, 0.075, 0.21, 16),
            new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.5, roughness: 0.25 })
        );
        hammerHead.position.set(0.38, 0, 0);
        hammerPivot.add(hammerHead);
        hammerPivot.rotation.z = 0.62;

        // 5.3 Frasco de Veneno Verde Brilhante (Centro: x = 0.12)
        const flaskGroup = new THREE.Group();
        flaskGroup.position.set(0.12, 0.20, -0.04);
        propsGroup.add(flaskGroup);

        // Base de alerta sob o frasco (visível de cima!)
        const hazardPad = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.21, 32),
            new THREE.MeshBasicMaterial({ color: 0x16a34a, side: THREE.DoubleSide })
        );
        hazardPad.rotation.x = -Math.PI / 2;
        hazardPad.position.y = -0.19;
        flaskGroup.add(hazardPad);

        const flaskGlass = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.16, 0.36, 24),
            new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.62,
                roughness: 0.08
            })
        );
        const flaskLiquid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.075, 0.14, 0.21, 20),
            new THREE.MeshStandardMaterial({
                color: 0x22c55e,
                emissive: 0x16a34a,
                emissiveIntensity: 0.85
            })
        );
        flaskLiquid.position.y = -0.06;

        const flaskCork = new THREE.Mesh(
            new THREE.CylinderGeometry(0.065, 0.055, 0.07, 14),
            new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
        );
        flaskCork.position.y = 0.20;
        flaskGroup.add(flaskGlass, flaskLiquid, flaskCork);

        /*************************************************************************
         * 6. O GATO LARANJA 3D + GATOS DE SUPERPOSIÇÃO (DIREITA DA CAIXA: x = 0.62)
         *************************************************************************/
        function createDomesticCat(style = 'normal') {
            const catGroup = new THREE.Group();
            let furMat, stripeMat, earInnerMat, eyeMat;

            if (style === 'normal') {
                furMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.55 });
                stripeMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.6 });
                earInnerMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.6 });
                eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
            } else if (style === 'superAlive') {
                furMat = new THREE.MeshStandardMaterial({
                    color: 0x22d3ee,
                    emissive: 0x0891b2,
                    emissiveIntensity: 0.65,
                    transparent: true,
                    opacity: 0.90
                });
                stripeMat = new THREE.MeshBasicMaterial({ color: 0xa5f3fc, transparent: true, opacity: 0.95 });
                earInnerMat = stripeMat;
                eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            } else {
                furMat = new THREE.MeshStandardMaterial({
                    color: 0xf472b6,
                    emissive: 0xdb2777,
                    emissiveIntensity: 0.65,
                    transparent: true,
                    opacity: 0.82
                });
                stripeMat = new THREE.MeshBasicMaterial({ color: 0xfbcfe8, transparent: true, opacity: 0.85 });
                earInnerMat = stripeMat;
                eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            }

            const bodyPivot = new THREE.Group();
            catGroup.add(bodyPivot);

            const torso = new THREE.Mesh(new THREE.SphereGeometry(0.29, 24, 24), furMat);
            torso.scale.set(0.94, 1.15, 1.06);
            torso.position.y = 0.34;
            torso.castShadow = (style === 'normal');
            bodyPivot.add(torso);

            const chest = new THREE.Mesh(
                new THREE.SphereGeometry(0.19, 16, 16),
                new THREE.MeshStandardMaterial({
                    color: 0xfff7ed,
                    roughness: 0.7,
                    transparent: style !== 'normal',
                    opacity: style === 'normal' ? 1.0 : 0.8
                })
            );
            chest.scale.set(0.85, 1.05, 0.55);
            chest.position.set(0, 0.36, 0.21);
            bodyPivot.add(chest);

            const headGroup = new THREE.Group();
            headGroup.position.set(0, 0.75, 0.08);
            bodyPivot.add(headGroup);

            const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.245, 24, 24), furMat);
            headMesh.scale.set(1.08, 0.95, 0.98);
            headMesh.castShadow = (style === 'normal');
            headGroup.add(headMesh);

            const foreheadStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), stripeMat);
            foreheadStripe.position.set(0, 0.14, 0.21);
            headGroup.add(foreheadStripe);

            const earGeo = new THREE.ConeGeometry(0.095, 0.21, 14);
            const leftEar = new THREE.Mesh(earGeo, furMat);
            leftEar.position.set(-0.15, 0.21, -0.01);
            leftEar.rotation.z = 0.32;
            const rightEar = new THREE.Mesh(earGeo, furMat);
            rightEar.position.set(0.15, 0.21, -0.01);
            rightEar.rotation.z = -0.32;
            headGroup.add(leftEar, rightEar);

            const eyeGeo = new THREE.SphereGeometry(0.043, 14, 14);
            const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(-0.09, 0.03, 0.218);
            const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            rightEye.position.set(0.09, 0.03, 0.218);
            headGroup.add(leftEye, rightEye);

            const nose = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.03, 3), earInnerMat);
            nose.rotation.x = Math.PI;
            nose.position.set(0, -0.02, 0.248);
            headGroup.add(nose);

            const pawGeo = new THREE.SphereGeometry(0.08, 12, 12);
            pawGeo.scale(0.9, 0.65, 1.2);
            const pawPositions = [
                [-0.12, 0.05, 0.18], [0.12, 0.05, 0.18],
                [-0.16, 0.06, -0.10], [0.16, 0.06, -0.10]
            ];
            pawPositions.forEach(p => {
                const paw = new THREE.Mesh(pawGeo, furMat);
                paw.position.set(p[0], p[1], p[2]);
                catGroup.add(paw);
            });

            const tailPivot = new THREE.Group();
            tailPivot.position.set(0, 0.18, -0.22);
            bodyPivot.add(tailPivot);

            const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.46, 12), furMat);
            tailMesh.position.set(0, 0.20, -0.08);
            tailMesh.rotation.x = -0.45;
            tailPivot.add(tailMesh);

            return {
                root: catGroup,
                bodyPivot,
                headGroup,
                leftEye,
                rightEye,
                tailPivot
            };
        }

        // Main Orange Cat (Direita: x = 0.62)
        const mainCat = createDomesticCat('normal');
        mainCat.root.position.set(0.62, 0.05, 0.06);
        mainCat.root.rotation.y = -0.32;
        boxGroup.add(mainCat.root);

        // Dual Superposition Cats
        const superAliveCat = createDomesticCat('superAlive');
        superAliveCat.root.position.set(0.68, 0.05, 0.24);
        superAliveCat.root.rotation.y = -0.25;
        superAliveCat.root.visible = false;
        boxGroup.add(superAliveCat.root);

        const superDeadCat = createDomesticCat('superDead');
        superDeadCat.root.position.set(0.32, 0.24, -0.24);
        superDeadCat.root.rotation.z = Math.PI / 2.1;
        superDeadCat.root.rotation.y = 0.25;
        superDeadCat.root.visible = false;
        boxGroup.add(superDeadCat.root);

        // 3D Target Highlight Ring
        const highlightRingGeo = new THREE.RingGeometry(0.24, 0.32, 48);
        highlightRingGeo.rotateX(-Math.PI / 2);
        const highlightRingMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.0
        });
        const highlightRing = new THREE.Mesh(highlightRingGeo, highlightRingMat);
        scene.add(highlightRing);

        // Collapse Shockwave Ring
        const shockRingGeo = new THREE.RingGeometry(0.2, 0.45, 48);
        shockRingGeo.rotateX(-Math.PI / 2);
        const shockRingMat = new THREE.MeshBasicMaterial({
            color: 0x4ade80,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.0
        });
        const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
        shockRing.position.set(0, TABLE_SURFACE_Y + 0.5, 0);
        scene.add(shockRing);

        /*************************************************************************
         * 7. COORDENADAS DOS ALVOS 3D PARA OS PINS EXPLICATIVOS
         *************************************************************************/
        function getTargetWorldPosition(targetName) {
            const v = new THREE.Vector3();
            switch (targetName) {
                case 'table':
                    return v.set(0, TABLE_SURFACE_Y + 0.85, 0);
                case 'catAlive':
                    return v.set(0.62, TABLE_SURFACE_Y + 1.05, 0.06);
                case 'atom':
                    return v.set(-0.82, TABLE_SURFACE_Y + 0.74, -0.08);
                case 'hammer':
                    return v.set(-0.24, TABLE_SURFACE_Y + 0.84, -0.04);
                case 'flask':
                    return v.set(0.12, TABLE_SURFACE_Y + 0.54, -0.04);
                case 'boxTop':
                    return v.set(0, TABLE_SURFACE_Y + BOX_H + 0.22, 0);
                case 'boxRight':
                    return v.set(-0.55, TABLE_SURFACE_Y + BOX_H + 0.15, 0);
                case 'boxLeft':
                    return v.set(0.55, TABLE_SURFACE_Y + BOX_H + 0.15, 0);
                case 'superAlive':
                    return v.set(0.68, TABLE_SURFACE_Y + 1.05, 0.24);
                case 'superDead':
                    return v.set(0.28, TABLE_SURFACE_Y + 0.65, -0.24);
                default:
                    return v.set(0, TABLE_SURFACE_Y + 0.9, 0);
            }
        }

        function project3DPinToScreen(worldVec, pinElement) {
            const projected = worldVec.clone().project(camera);

            if (projected.z > 1.0 || projected.z < -1.0) {
                pinElement.style.opacity = '0';
                return;
            }

            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            const x = (projected.x * 0.5 + 0.5) * w;
            const y = (-projected.y * 0.5 + 0.5) * h;

            const clampedX = Math.max(80, Math.min(w - 80, x));
            const clampedY = Math.max(88, Math.min(h - 160, y));

            pinElement.style.left = \`\${clampedX}px\`;
            pinElement.style.top = \`\${clampedY}px\`;
        }

        /*************************************************************************
         * 8. INTERPOLADOR MATEMÁTICO SUAVE (GARANTE TRANSIÇÕES DE SEDA NO PLAY E NO MP4)
         *************************************************************************/
        function easeInOutCubic(x) {
            return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        }

        function lerpNum(a, b, u) {
            return a + (b - a) * u;
        }

        function lerpVec3(arrA, arrB, u, outVec) {
            outVec.set(
                lerpNum(arrA[0], arrB[0], u),
                lerpNum(arrA[1], arrB[1], u),
                lerpNum(arrA[2], arrB[2], u)
            );
        }

        let elapsedVideoTime = 0.0;
        let isPlaying = true;
        let isMuted = false;
        let currentBeatId = -1;

        const pinPrimary = document.getElementById('pin-primary');
        const pinSecondary = document.getElementById('pin-secondary');

        function configurePinDOM(pinConfig, prefix) {
            const pinEl = document.getElementById(\`pin-\${prefix}\`);
            if (!pinConfig) {
                pinEl.style.opacity = '0';
                return;
            }
            pinEl.style.opacity = '1';
            document.getElementById(\`pin-\${prefix}-icon\`).textContent = pinConfig.icon;
            document.getElementById(\`pin-\${prefix}-text\`).textContent = pinConfig.text;
            document.getElementById(\`pin-\${prefix}-bubble\`).className = \`callout-bubble \${pinConfig.style} border-2 border-white\`;
            document.getElementById(\`pin-\${prefix}-stem\`).className = \`callout-stem \${pinConfig.stem}\`;
            document.getElementById(\`pin-\${prefix}-dot\`).className = \`callout-dot \${pinConfig.stem}\`;
        }

        const evalCamPos = new THREE.Vector3();
        const evalCamLook = new THREE.Vector3();

        /**
         * Renderiza o estado exato e suavemente interpolado para qualquer instante t (em segundos).
         * Usado tanto pelo loop de 60fps ao vivo quanto pelo capturador de vídeo MP4!
         */
        function evaluateAndRenderAtTime(t) {
            if (t >= TOTAL_DURATION) {
                elapsedVideoTime = 0.0;
                t = 0.0;
                if (masterAudio) masterAudio.currentTime = 0;
            }

            // 1. Identificar Beat ativo e Beat anterior para interpolação suave de 1.5s
            let activeIdx = 0;
            for (let i = 0; i < BEATS.length; i++) {
                if (t >= BEATS[i].start && t < BEATS[i].end) {
                    activeIdx = i;
                    break;
                }
            }
            const activeBeat = BEATS[activeIdx];
            const prevBeat = activeIdx > 0 ? BEATS[activeIdx - 1] : activeBeat;

            // Janela de transição suave de 1.55 segundos no início de cada ato
            const TRANSITION_DUR = 1.55;
            const timeInBeat = Math.max(0, t - activeBeat.start);
            const u = activeIdx === 0 ? 1.0 : easeInOutCubic(Math.min(1.0, timeInBeat / TRANSITION_DUR));

            // 2. Atualizar barra de progresso segmentada no topo
            BEATS.forEach((b, idx) => {
                if (t >= b.end) {
                    segmentFills[idx].style.width = '100%';
                } else if (t <= b.start) {
                    segmentFills[idx].style.width = '0%';
                } else {
                    const ratio = ((t - b.start) / (b.end - b.start)) * 100;
                    segmentFills[idx].style.width = \`\${ratio}%\`;
                }
            });

            // 3. Atualizar textos e badges quando muda de Beat
            if (currentBeatId !== activeBeat.id) {
                currentBeatId = activeBeat.id;

                document.getElementById('beat-tag').textContent = activeBeat.tag;
                document.getElementById('beat-dot').style.backgroundColor = activeBeat.dotColor;
                document.getElementById('beat-counter').textContent = \`\${activeBeat.id + 1} / \${BEATS.length}\`;

                const card = document.getElementById('script-card');
                const line = document.getElementById('script-line');
                card.classList.remove('script-animate');
                void card.offsetWidth;
                line.innerHTML = activeBeat.html;
                card.classList.add('script-animate');

                configurePinDOM(activeBeat.pin1, 'primary');
                configurePinDOM(activeBeat.pin2, 'secondary');
            }

            // 4. Interpolação suave de Câmera + Respiração sutil e calma
            lerpVec3(prevBeat.camPos, activeBeat.camPos, u, evalCamPos);
            lerpVec3(prevBeat.camLook, activeBeat.camLook, u, evalCamLook);

            const gentleSwayX = Math.sin(t * 0.35) * 0.03;
            const gentleSwayY = Math.cos(t * 0.28) * 0.018;
            camera.position.set(evalCamPos.x + gentleSwayX, evalCamPos.y + gentleSwayY, evalCamPos.z);
            camera.lookAt(evalCamLook);
            camera.updateMatrixWorld();

            // 5. Interpolação suave de Abertura das Abas e Transparência da Caixa
            const smoothBoxOpen = lerpNum(prevBeat.boxOpen, activeBeat.boxOpen, u);
            const flapAngle = smoothBoxOpen * 2.12;
            flapBackPivot.rotation.x = -flapAngle;
            flapFrontPivot.rotation.x = flapAngle;
            flapLeftPivot.rotation.z = flapAngle;
            flapRightPivot.rotation.z = -flapAngle;

            const smoothWallOp = lerpNum(prevBeat.wallOpacity, activeBeat.wallOpacity, u);
            const smoothFrontOp = lerpNum(prevBeat.frontOpacity, activeBeat.frontOpacity, u);
            const smoothFlapOp = lerpNum(prevBeat.flapOpacity, activeBeat.flapOpacity, u);
            const smoothWireOp = lerpNum(prevBeat.wireOpacity, activeBeat.wireOpacity, u);

            cardboardWallMat.opacity = smoothWallOp;
            cardboardFrontMat.opacity = smoothFrontOp;
            cardboardFlapMat.opacity = smoothFlapOp;
            boxWireMat.opacity = smoothWireOp;

            // Desativa depthWrite quando transparente para nunca ocultar os itens internos
            cardboardWallMat.depthWrite = (smoothWallOp > 0.85);
            cardboardFrontMat.depthWrite = (smoothFrontOp > 0.85);
            cardboardFlapMat.depthWrite = (smoothFlapOp > 0.85);

            // 6. Animações Calmas e Orgânicas dos Objetos Internos
            // Giro calmo e elegante dos anéis do átomo
            atomRings[0].rotation.z = t * 1.05;
            atomRings[1].rotation.y = t * 0.85;
            const atomScale = 1.0 + Math.sin(t * 2.2) * 0.07;
            atomCore.scale.set(atomScale, atomScale, atomScale);

            // Demonstração calma e clara do Martelo no Ato 4
            if (activeBeat.hammerDemo) {
                // Faz um único movimento lento e didático de aproximação ao frasco e retorno
                const demoWave = Math.sin(Math.min(1.0, timeInBeat / 4.2) * Math.PI);
                hammerPivot.rotation.z = 0.62 - demoWave * 0.46;
                detectorLed.material.color.setHex((demoWave > 0.4) ? 0xef4444 : 0xfacc15);
            } else if (activeBeat.superposition) {
                hammerPivot.rotation.z = 0.42 + Math.sin(t * 1.5) * 0.14;
                detectorLed.material.color.setHex(0x38bdf8);
            } else {
                hammerPivot.rotation.z = 0.62;
                detectorLed.material.color.setHex(0xfacc15);
            }

            // 7. Gato Normal vs Gatos em Superposição (Movimentos calmos e naturais)
            if (activeBeat.superposition) {
                mainCat.root.visible = false;
                superAliveCat.root.visible = true;
                superDeadCat.root.visible = true;
                quantumLight.intensity = 1.8;

                superAliveCat.headGroup.rotation.y = Math.sin(t * 0.9) * 0.15;
                superAliveCat.tailPivot.rotation.z = Math.sin(t * 1.6) * 0.20;
                superAliveCat.root.position.y = 0.05 + Math.sin(t * 1.4) * 0.015;

                superDeadCat.root.position.y = 0.24 + Math.sin(t * 1.2 + Math.PI) * 0.025;
            } else {
                mainCat.root.visible = true;
                superAliveCat.root.visible = false;
                superDeadCat.root.visible = false;
                quantumLight.intensity = 0.0;

                // Olhar sereno e abano de rabo suave
                mainCat.headGroup.rotation.y = Math.sin(t * 0.85) * 0.18;
                mainCat.headGroup.rotation.z = Math.cos(t * 0.65) * 0.05;
                mainCat.tailPivot.rotation.z = Math.sin(t * 1.5) * 0.18;

                // Piscar natural dos olhos
                const blink = (Math.sin(t * 1.6) > 0.96) ? 0.1 : 1.0;
                mainCat.leftEye.scale.y = blink;
                mainCat.rightEye.scale.y = blink;

                // No Ato 11, dá um único pulinho gracioso de alegria ao abrir a caixa e depois respira calmo
                if (activeBeat.catHappyJump && timeInBeat < 1.6) {
                    const hop = Math.sin((timeInBeat / 1.6) * Math.PI);
                    mainCat.bodyPivot.position.y = hop * 0.14;
                } else {
                    mainCat.bodyPivot.position.y = Math.sin(t * 1.5) * 0.01;
                }
            }

            // 8. Onda de choque suave ao abrir a caixa no Ato 10
            if (activeBeat.collapseFlash && timeInBeat < 2.2) {
                const p = timeInBeat / 2.2;
                const s = 0.2 + p * 4.5;
                shockRing.scale.set(s, s, 1);
                shockRingMat.opacity = (1.0 - p) * 0.85;
            } else {
                shockRingMat.opacity = 0.0;
            }

            // 9. Posicionar Pins 3D e Anel de Destaque
            if (activeBeat.pin1) {
                const pos1 = getTargetWorldPosition(activeBeat.pin1.target);
                project3DPinToScreen(pos1, pinPrimary);

                if (['atom', 'hammer', 'flask', 'catAlive'].includes(activeBeat.pin1.target)) {
                    highlightRing.position.set(pos1.x, TABLE_SURFACE_Y + 0.06, pos1.z);
                    const ringPulse = 1.0 + Math.sin(t * 2.4) * 0.06;
                    highlightRing.scale.set(ringPulse, ringPulse, 1);
                    highlightRingMat.opacity = 0.80;
                } else {
                    highlightRingMat.opacity = 0.0;
                }
            }
            if (activeBeat.pin2) {
                const pos2 = getTargetWorldPosition(activeBeat.pin2.target);
                project3DPinToScreen(pos2, pinSecondary);
            }

            renderer.render(scene, camera);
        }

        function seekToTime(t) {
            elapsedVideoTime = Math.max(0, Math.min(TOTAL_DURATION, t));
            if (masterAudio) masterAudio.currentTime = elapsedVideoTime;
            evaluateAndRenderAtTime(elapsedVideoTime);
        }

        function toggleAudio(e) {
            if (e) e.stopPropagation();
            isMuted = !isMuted;
            if (masterAudio) masterAudio.muted = isMuted;
            document.getElementById('audio-icon').textContent = isMuted ? '🔇' : '🔊';
            document.getElementById('audio-text').textContent = isMuted ? 'Mudo' : 'Som';
        }

        let pauseTimeout = null;
        function handleViewportTap(e) {
            isPlaying = !isPlaying;
            const indicator = document.getElementById('pause-indicator');
            const svg = document.getElementById('pause-svg');

            if (!isPlaying) {
                svg.innerHTML = \`<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>\`;
                indicator.style.opacity = '1';
                if (masterAudio) masterAudio.pause();
            } else {
                svg.innerHTML = \`<path d="M8 5v14l11-7z"/>\`;
                indicator.style.opacity = '1';
                if (masterAudio) masterAudio.play().catch(() => {});
                clearTimeout(pauseTimeout);
                pauseTimeout = setTimeout(() => {
                    if (isPlaying) indicator.style.opacity = '0';
                }, 450);
            }
        }

        /*************************************************************************
         * 9. LOOP DE RENDERIZAÇÃO AO VIVO & HOOK DETERMINÍSTICO PARA VÍDEO MP4
         *************************************************************************/
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            if (window.__cdpCaptureActive) return;

            const dt = Math.min(clock.getDelta(), 0.1);

            if (isPlaying) {
                if (masterAudio && !masterAudio.paused && !masterAudio.ended && masterAudio.currentTime > 0) {
                    elapsedVideoTime = masterAudio.currentTime;
                } else {
                    elapsedVideoTime += dt;
                }
            }

            evaluateAndRenderAtTime(elapsedVideoTime);
        }

        // Hook determinístico para captura de vídeo MP4 com interpolação 100% idêntica ao play ao vivo!
        window.renderDeterministicFrame = function(t) {
            window.__cdpCaptureActive = true;
            if (masterAudio && !masterAudio.paused) masterAudio.pause();
            elapsedVideoTime = t;
            evaluateAndRenderAtTime(t);
        };

        window.onload = () => {
            resizeRenderer();
            evaluateAndRenderAtTime(0);
            animate();
            if (!window.location.search.includes('capture=1') && masterAudio) {
                masterAudio.play().catch(() => {});
            }
        };
    </script>
</body>
</html>
`;

fs.writeFileSync(DOWNLOAD_PATH, htmlContent, 'utf8');
console.log(`✅ Arquivo atualizado com sucesso em: ${DOWNLOAD_PATH}`);

fs.writeFileSync(LOCAL_PATH, htmlContent, 'utf8');
console.log(`✅ Cópia salva em: ${LOCAL_PATH}`);

fs.writeFileSync(INDEX_PATH, htmlContent, 'utf8');
console.log(`✅ Cópia principal salva em: ${INDEX_PATH}`);
