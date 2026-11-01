import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const timingData = JSON.parse(readFileSync('src/gravidadeTiming.json', 'utf8'));
const audioBase64 = readFileSync('output/gravidade_audio.mp3').toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;

const tb = timingData.beats;

// Lemos o código dos módulos modulares
const planetEarthCode = readFileSync('src/gravity/PlanetEarth.js', 'utf8').replace(/export /g, '');
const stylizedCharacterCode = readFileSync('src/gravity/StylizedCharacter.js', 'utf8').replace(/export /g, '');
const cityDioramaCode = readFileSync('src/gravity/CityDiorama.js', 'utf8').replace(/export /g, '');

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>E Se a Gravidade Fosse Desligada por 5 Segundos? — Animação Vertical 3D</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
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
            background-color: #020617;
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
            background-color: #0f172a;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12);
            border-radius: 28px;
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
            background-color: #000;
        }
        body.capture-mode #phone-viewport {
            max-width: 100% !important;
            max-height: 100% !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: none !important;
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

        .hud-overlay {
            position: absolute;
            inset: 0;
            z-index: 10;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 16px 14px 20px 14px;
        }

        .interactive {
            pointer-events: auto;
        }

        .font-space {
            font-family: 'Space Grotesk', sans-serif;
        }

        .glass-dark {
            background: rgba(15, 23, 42, 0.84);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
        }

        .script-card {
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1.5px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 22px 45px rgba(0, 0, 0, 0.65);
            transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .kw-badge {
            display: inline-block;
            padding: 1px 8px;
            margin: 0 2px;
            border-radius: 7px;
            font-weight: 800;
            font-family: 'Space Grotesk', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(0,0,0,0.28);
        }

        .kw-yellow { background: #fde047; color: #0f172a; }
        .kw-cyan   { background: #22d3ee; color: #0f172a; }
        .kw-magenta{ background: #f43f5e; color: #ffffff; }
        .kw-green  { background: #4ade80; color: #052e16; }
        .kw-orange { background: #fb923c; color: #0f172a; }
        .kw-white  { background: #ffffff; color: #0f172a; }

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
            transition: opacity 0.25s ease-out;
        }

        .pin-stem {
            width: 2px;
            height: 22px;
            background: currentColor;
            opacity: 0.85;
        }

        .pin-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
            box-shadow: 0 0 10px currentColor;
        }

        .center-btn {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 20;
            pointer-events: auto;
            width: 68px;
            height: 68px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, 0.82);
            border: 2px solid rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(12px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
            cursor: pointer;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
        }
        .center-btn:active {
            transform: translate(-50%, -50%) scale(0.92);
        }
        .hidden-btn {
            opacity: 0;
            pointer-events: none;
            transform: translate(-50%, -50%) scale(0.8);
        }

        @keyframes scriptPop {
            0% { transform: translateY(16px) scale(0.97); opacity: 0.4; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .script-animate {
            animation: scriptPop 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    </style>
</head>
<body>
    <div id="phone-viewport" onclick="togglePlayPause(event)">
        <!-- Container 3D Three.js -->
        <div id="webgl-container"></div>

        <!-- Botão Play / Pause Centralizado -->
        <div id="center-play-btn" class="center-btn hidden-btn" onclick="togglePlayPause(event)">
            <svg id="play-icon" class="w-8 h-8 text-white ml-1 hidden" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <svg id="pause-icon" class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
        </div>

        <!-- Elementos HUD Pins 3D -->
        <div id="pin-primary" class="pin-3d" style="opacity: 0;">
            <div id="pin-primary-box" class="px-3 py-1 rounded-full font-extrabold text-[11px] font-space uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-white/50">
                <span id="pin-primary-icon">⚡</span>
                <span id="pin-primary-text">ANOMALIA</span>
            </div>
            <div id="pin-primary-stem" class="pin-stem text-pink-400"></div>
            <div id="pin-primary-dot" class="pin-dot text-pink-400"></div>
        </div>

        <div id="pin-secondary" class="pin-3d" style="opacity: 0;">
            <div id="pin-secondary-box" class="px-3 py-1 rounded-full font-extrabold text-[11px] font-space uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-white/50">
                <span id="pin-secondary-icon">🌍</span>
                <span id="pin-secondary-text">PLANETA TERRA</span>
            </div>
            <div id="pin-secondary-stem" class="pin-stem text-cyan-300"></div>
            <div id="pin-secondary-dot" class="pin-dot text-cyan-300"></div>
        </div>

        <!-- HUD Superior e Inferior -->
        <div class="hud-overlay">
            <!-- Barra Superior: Progresso, Capítulo e Controles -->
            <div class="w-full flex flex-col gap-2.5">
                <!-- Segmentos de Progresso Instagram/Reels (12 Beats) -->
                <div id="segments-container" class="grid grid-cols-12 gap-1 w-full"></div>

                <!-- Barra de Status do Beat -->
                <div class="flex items-center justify-between">
                    <div class="glass-dark px-3 py-1 rounded-full flex items-center gap-2 border border-white/20 shadow-md">
                        <span id="chapter-dot" class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span id="chapter-tag" class="text-white font-extrabold text-[11px] tracking-wider uppercase font-space">
                            1. PASSEIO MATINAL
                        </span>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="toggleMute(event)" class="interactive glass-dark px-2.5 py-1 rounded-full text-white/90 text-xs flex items-center gap-1 hover:bg-white/20 transition">
                            <span id="mute-icon">🔊</span>
                            <span id="mute-label" class="font-space text-[10px] font-bold">Som</span>
                        </button>
                        <div class="glass-dark px-2.5 py-1 rounded-full text-white/80 font-space text-[11px] font-bold">
                            <span id="beat-counter">1/12</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Áudio Master Contínuo VoiceStudio (Antônio Neural) -->
            <audio id="master-narration" preload="auto" playsinline>
                <source src="${audioDataUri}" type="audio/mp3">
            </audio>

            <!-- Card Inferior com Legendas Dinâmicas em Tempo Real -->
            <div class="w-full flex flex-col items-center gap-2 pb-1">
                <div id="script-card" class="script-card w-full rounded-2xl p-4 script-animate">
                    <p id="script-line" class="text-white font-bold text-center text-sm leading-relaxed tracking-normal font-sans">
                        Imagine você caminhando tranquilamente por uma bela avenida em uma manhã de sol...
                    </p>
                </div>
            </div>
        </div>
    </div>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const isCaptureMode = urlParams.get('capture') === '1';
        if (isCaptureMode) {
            document.body.classList.add('capture-mode');
        }

        /*************************************************************************
         * 1. ROTEIRO DE ALTA RETENÇÃO (12 BEATS COM PERSPECTIVA 3/4 DIORAMA)
         *************************************************************************/
        const BEATS = [
            {
                id: 0,
                start: ${tb[0].start},
                end: ${tb[0].end},
                tag: "1. PASSEIO NA CIDADE",
                dotColor: "#4ade80",
                html: \`Imagine você <span class="kw-badge kw-green">CAMINHANDO TRANQUILAMENTE</span> por um <span class="kw-badge kw-cyan">PARQUE BONITO</span> em uma manhã de sol...\`,
                camPos: [1.6, 4.0, 7.2],
                camLook: [0.0, 0.9, -0.3],
                mode: "walking",
                pin1: { text: "Cidade Linda", icon: "🏙️", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "charHead" },
                pin2: { text: "Café Quente", icon: "☕", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" }
            },
            {
                id: 1,
                start: ${tb[1].start},
                end: ${tb[1].end},
                tag: "2. ANOMALIA CÓSMICA",
                dotColor: "#f43f5e",
                html: \`Mas do nada, uma anomalia desliga a <span class="kw-badge kw-magenta">GRAVIDADE DA TERRA</span> por apenas <span class="kw-badge kw-yellow">5 SEGUNDOS</span>!\`,
                camPos: [2.0, 4.2, 7.4],
                camLook: [0.0, 1.0, -0.4],
                mode: "alert",
                pin1: { text: "Gravidade = 0!", icon: "⚠️", style: "bg-rose-500 text-white", stem: "text-rose-500", target: "charHead" },
                pin2: { text: "Trânsito Parou!", icon: "🚕", style: "bg-yellow-300 text-slate-950", stem: "text-yellow-300", target: "car" }
            },
            {
                id: 2,
                start: ${tb[2].start},
                end: ${tb[2].end},
                tag: "3. SEGUNDO 1: FLUTUAÇÃO",
                dotColor: "#fde047",
                html: \`No primeiro segundo, o <span class="kw-badge kw-orange">CAFÉ NA SUA MÃO</span> e os objetos começam a <span class="kw-badge kw-cyan">FLUTUAR NO AR</span>!\`,
                camPos: [-1.4, 3.6, 6.8],
                camLook: [0.0, 1.1, -0.3],
                mode: "floatStart",
                pin1: { text: "Café Sem Peso!", icon: "☕", style: "bg-orange-300 text-slate-950", stem: "text-orange-300", target: "coffee" },
                pin2: { text: "Banco Solto", icon: "🪑", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "bench" }
            },
            {
                id: 3,
                start: ${tb[3].start},
                end: ${tb[3].end},
                tag: "4. PÉS SOLTOS DO CHÃO",
                dotColor: "#22d3ee",
                html: \`No segundo seguinte, <span class="kw-badge kw-cyan">SEUS PÉS PERDEM O CHÃO</span> e você começa a subir sem conseguir se segurar!\`,
                camPos: [0.0, 3.4, 7.2],
                camLook: [0.0, 1.2, -0.4],
                mode: "personFloating",
                pin1: { text: "Perda de Contato!", icon: "👟", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "charFeet" },
                pin2: { text: "Subindo sem Peso!", icon: "🎈", style: "bg-yellow-300 text-slate-950", stem: "text-yellow-300", target: "charHead" }
            },
            {
                id: 4,
                start: ${tb[4].start},
                end: ${tb[4].end},
                tag: "5. INÉRCIA DE 1.600 KM/H",
                dotColor: "#f43f5e",
                html: \`Como a Terra gira a <span class="kw-badge kw-magenta">1.600 KM/H</span>, tudo o que não está preso decola para o alto!\`,
                camPos: [0.0, 2.7, 8.4],
                camLook: [0.0, 0.2, -1.5],
                mode: "risingFast",
                pin1: { text: "Inércia Rotacional", icon: "🌪️", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "charHead" },
                pin2: { text: "Terra a 1.600 km/h", icon: "🌍", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "earth" }
            },
            {
                id: 5,
                start: ${tb[5].start},
                end: ${tb[5].end},
                tag: "6. CARROS E PRAÇA NO ESPAÇO",
                dotColor: "#38bdf8",
                html: \`<span class="kw-badge kw-yellow">BANCOS DE PRAÇA</span>, hidrantes e <span class="kw-badge kw-cyan">CARROS FLUTUAM</span> como no meio do espaço sideral!\`,
                camPos: [0.0, 2.6, 8.6],
                camLook: [0.0, 0.2, -1.5],
                mode: "fullZeroG",
                pin1: { text: "Táxi no Espaço!", icon: "🚕", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "car" },
                pin2: { text: "Hidrante Solto!", icon: "🚒", style: "bg-red-400 text-slate-950", stem: "text-red-400", target: "hydrant" }
            },
            {
                id: 6,
                start: ${tb[6].start},
                end: ${tb[6].end},
                tag: "7. O VÁCUO DA ATMOSFERA",
                dotColor: "#a855f7",
                html: \`A atmosfera também começaria a escapar, criando uma <span class="kw-badge kw-magenta">QUEDA VIOLENTA</span> na pressão do ar!\`,
                camPos: [-1.2, 2.7, 8.4],
                camLook: [0.0, 0.2, -1.5],
                mode: "vacuumPanic",
                pin1: { text: "Pressão Despencando!", icon: "💨", style: "bg-purple-300 text-slate-950", stem: "text-purple-300", target: "charHead" },
                pin2: { text: "Atmosfera Escapando", icon: "🌎", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "earth" }
            },
            {
                id: 7,
                start: ${tb[7].start},
                end: ${tb[7].end},
                tag: "8. A ALTURA MÁXIMA",
                dotColor: "#fde047",
                html: \`Você flutua a vários metros de altura, vendo o <span class="kw-badge kw-yellow">PLANETA TERRA</span> sob os seus pés!\`,
                camPos: [1.1, 2.8, 8.6],
                camLook: [0.0, 0.1, -1.6],
                mode: "apexHeight",
                pin1: { text: "Órbita Baixa!", icon: "🛰️", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "charHead" },
                pin2: { text: "Planeta Terra", icon: "🌍", style: "bg-emerald-300 text-slate-950", stem: "text-emerald-300", target: "earth" }
            },
            {
                id: 8,
                start: ${tb[8].start},
                end: ${tb[8].end},
                tag: "9. A GRAVIDADE RELIGA!",
                dotColor: "#ef4444",
                html: \`A contagem chega ao fim e, de repente, a gravidade é <span class="kw-badge kw-orange">RELIGADA COM FORÇA TOTAL</span>!\`,
                camPos: [0.0, 2.8, 8.0],
                camLook: [0.0, 0.4, -1.2],
                mode: "gravitySnap",
                pin1: { text: "GRAVIDADE: ON!", icon: "⚡", style: "bg-red-400 text-slate-950", stem: "text-red-400", target: "charHead" },
                pin2: { text: "Puxão Gravitacional", icon: "🌍", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "earth" }
            },
            {
                id: 9,
                start: ${tb[9].start},
                end: ${tb[9].end},
                tag: "10. QUEDA LIVRE ACELERADA",
                dotColor: "#fb923c",
                html: \`Tudo o que subiu <span class="kw-badge kw-magenta">DESABA EM QUEDA LIVRE</span> acelerada de volta para a cidade!\`,
                camPos: [0.0, 3.4, 7.6],
                camLook: [0.0, 1.0, -0.5],
                mode: "fallingFast",
                pin1: { text: "Queda a 180 km/h!", icon: "⬇️", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "charHead" },
                pin2: null
            },
            {
                id: 10,
                start: ${tb[10].start},
                end: ${tb[10].end},
                tag: "11. POUSO NA CIDADE",
                dotColor: "#4ade80",
                html: \`Você despenca em direção à <span class="kw-badge kw-green">GRAMA MACIA</span>, fazendo um pouso desajeitado mas <span class="kw-badge kw-white">ESCAPANDO COM VIDA</span>!\`,
                camPos: [1.4, 3.8, 7.2],
                camLook: [0.0, 0.9, -0.3],
                mode: "springLanding",
                pin1: { text: "Pouso com Vida!", icon: "✨", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "charHead" },
                pin2: { text: "Café Salvo!", icon: "☕", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" }
            },
            {
                id: 11,
                start: ${tb[11].start},
                end: ${tb[11].end},
                tag: "12. CONCLUSÃO",
                dotColor: "#facc15",
                html: \`Esse é o perigo da gravidade: cinco segundos causariam o caos. <span class="kw-badge kw-yellow">VOCÊ TERIA CORAGEM</span> de encarar?\`,
                camPos: [0.0, 3.6, 7.6],
                camLook: [0.0, 1.1, -0.5],
                mode: "celebrate",
                pin1: { text: "Você Sobreviveria?", icon: "🤔", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "charHead" },
                pin2: { text: "Cidade a Salvo", icon: "🌆", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "bench" }
            }
        ];

        const TOTAL_DURATION = ${timingData.totalDuration};

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
         * 2. CONFIGURAÇÃO DO THREE.JS (RENDERER, CÂMERA E ILUMINAÇÃO)
         *************************************************************************/
        const container = document.getElementById('webgl-container');
        const viewport = document.getElementById('phone-viewport');
        const masterAudio = document.getElementById('master-narration');

        const scene = new THREE.Scene();
        const SKY_CITY_COLOR = 0x1e3a5f;
        scene.background = new THREE.Color(SKY_CITY_COLOR);
        scene.fog = new THREE.FogExp2(SKY_CITY_COLOR, 0.009);

        const camera = new THREE.PerspectiveCamera(40, viewport.clientWidth / viewport.clientHeight, 0.1, 120);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.setClearColor(scene.background, 1.0);
        container.appendChild(renderer.domElement);

        function resizeRenderer() {
            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener('resize', resizeRenderer);

        const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.75);
        hemiLight.position.set(0, 15, 0);
        scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.25);
        sunLight.position.set(6.5, 12.0, 7.5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 35;
        const d = 9;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.0003;
        scene.add(sunLight);

        /*************************************************************************
         * 3. CARREGAMENTO DOS MÓDULOS 3D (CIDADE, PERSONAGEM E PLANETA TERRA)
         *************************************************************************/
        ${planetEarthCode}
        ${stylizedCharacterCode}
        ${cityDioramaCode}

        // Instanciação da Cidade
        const city = createCityDiorama(THREE);
        scene.add(city.cityGroup);
        scene.add(city.dynamicPropsGroup);

        // Instanciação do Personagem
        const hero = createStylizedCharacter(THREE);
        scene.add(hero.root);

        // Instanciação do Sistema do Planeta Terra
        const earthSystem = createPlanetEarthSystem(THREE);
        const earthGroup = earthSystem.root;
        earthGroup.position.set(0, -15.0, -2.2);
        scene.add(earthGroup);

        // Anel de choque gravitacional
        const shockRingGeo = new THREE.RingGeometry(0.2, 0.45, 32);
        const shockRingMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
        const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
        shockRing.rotation.x = -Math.PI / 2;
        shockRing.position.y = 0.05;
        scene.add(shockRing);

        // Linhas de vento para queda livre
        const windGeo = new THREE.BufferGeometry();
        const windLinesCount = 35;
        const windPos = new Float32Array(windLinesCount * 6);
        for (let i = 0; i < windLinesCount; i++) {
            const wx = (Math.random() - 0.5) * 4.5;
            const wy = Math.random() * 6.0;
            const wz = -0.5 + (Math.random() - 0.5) * 2.0;
            windPos[i * 6] = wx; windPos[i * 6 + 1] = wy; windPos[i * 6 + 2] = wz;
            windPos[i * 6 + 3] = wx; windPos[i * 6 + 4] = wy + 1.2; windPos[i * 6 + 5] = wz;
        }
        windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
        const windMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
        const windLines = new THREE.LineSegments(windGeo, windMat);
        scene.add(windLines);

        /*************************************************************************
         * 4. PINS 3D COM SAFE-ZONE ANTI-COLISÃO
         *************************************************************************/
        const pinPrimaryEl = document.getElementById('pin-primary');
        const pinSecondaryEl = document.getElementById('pin-secondary');
        const pin1State = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2, opacity: 0 };
        const pin2State = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2, opacity: 0 };

        function getTargetWorldPosition(targetName) {
            const v = new THREE.Vector3();
            switch (targetName) {
                case 'charHead':
                    return hero.headGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.38, 0));
                case 'charFeet':
                    return hero.pelvis.getWorldPosition(v).add(new THREE.Vector3(0, -0.65, 0));
                case 'coffee':
                    return hero.mugGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.16, 0));
                case 'bench':
                    return city.benchGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.70, 0));
                case 'hydrant':
                    return city.hydrantGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.60, 0));
                case 'car':
                    return city.yellowTaxi.getWorldPosition(v).add(new THREE.Vector3(0, 0.90, 0));
                case 'earth':
                    return earthGroup.getWorldPosition(v).add(new THREE.Vector3(0, 2.2, 1.2));
                default:
                    return v.set(0, 1.5, 0);
            }
        }

        function updatePinPosition(pinEl, pinConfig, state, instant = false) {
            if (!pinConfig) {
                state.opacity = instant ? 0 : state.opacity + (0 - state.opacity) * 0.25;
                pinEl.style.opacity = state.opacity.toFixed(3);
                return;
            }
            const worldPos = getTargetWorldPosition(pinConfig.target);
            const projected = worldPos.clone().project(camera);

            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            const targetX = (projected.x * 0.5 + 0.5) * w;
            const targetY = (-(projected.y * 0.5) + 0.5) * h;

            const clampedX = Math.max(90, Math.min(w - 90, targetX));
            const clampedY = Math.max(145, Math.min(h - 180, targetY));

            if (instant) {
                state.x = clampedX;
                state.y = clampedY;
                state.opacity = 1;
            } else {
                state.x += (clampedX - state.x) * 0.28;
                state.y += (clampedY - state.y) * 0.28;
                state.opacity += (1 - state.opacity) * 0.25;
            }

            pinEl.style.opacity = state.opacity.toFixed(3);
            pinEl.style.transform = 'translate3d(' + state.x.toFixed(1) + 'px, ' + state.y.toFixed(1) + 'px, 0) translate(-50%, -100%)';
        }

        function configurePinDOM(pinConfig, prefix) {
            if (!pinConfig) return;
            document.getElementById('pin-' + prefix + '-icon').textContent = pinConfig.icon;
            document.getElementById('pin-' + prefix + '-text').textContent = pinConfig.text;
            document.getElementById('pin-' + prefix + '-box').className = 'px-3 py-1 rounded-full font-extrabold text-[11px] font-space uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-white/50 ' + pinConfig.style;
            document.getElementById('pin-' + prefix + '-stem').className = 'pin-stem ' + pinConfig.stem;
            document.getElementById('pin-' + prefix + '-dot').className = 'pin-dot ' + pinConfig.stem;
        }

        /*************************************************************************
         * 5. LOOP DE CONTROLE E REPRODUÇÃO DETERMINÍSTICA
         *************************************************************************/
        // Começa pausado: navegadores bloqueiam áudio sem clique. O 1º clique dá PLAY com voz.
        let isPlaying = false;
        if (!isCaptureMode) {
            document.getElementById('center-play-btn').classList.remove('hidden-btn');
            document.getElementById('play-icon').classList.remove('hidden');
            document.getElementById('pause-icon').classList.add('hidden');
        }
        let isMuted = false;
        let currentTime = 0;
        let lastFrameTime = performance.now();
        let activeBeatIndex = -1;

        function togglePlayPause(e) {
            if (e) e.stopPropagation();
            isPlaying = !isPlaying;
            const btn = document.getElementById('center-play-btn');
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');

            if (isPlaying) {
                lastFrameTime = performance.now();
                btn.classList.add('hidden-btn');
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                if (!isMuted) {
                    masterAudio.currentTime = currentTime;
                    masterAudio.play().catch(() => {});
                }
            } else {
                btn.classList.remove('hidden-btn');
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                masterAudio.pause();
            }
        }

        function toggleMute(e) {
            if (e) e.stopPropagation();
            isMuted = !isMuted;
            masterAudio.muted = isMuted;
            document.getElementById('mute-icon').textContent = isMuted ? '🔇' : '🔊';
            document.getElementById('mute-label').textContent = isMuted ? 'Mudo' : 'Som';
        }

        function seekToTime(targetSec) {
            currentTime = Math.max(0, Math.min(TOTAL_DURATION - 0.05, targetSec));
            lastFrameTime = performance.now();
            masterAudio.currentTime = currentTime;
            if (isPlaying && !isMuted) {
                masterAudio.play().catch(() => {});
            }
            evaluateSceneAtTime(currentTime, true);
        }

        window.seekToTime = seekToTime;
        window.evaluateSceneAtTime = evaluateSceneAtTime;
        window.renderDeterministicFrame = function(t) {
            isPlaying = false;
            currentTime = t;
            evaluateSceneAtTime(t, true);
        };



        function smootherstep(t) {
            t = Math.max(0, Math.min(1, t));
            return t * t * t * (t * (t * 6 - 15) + 10);
        }
        function lerpNum(a, b, t) {
            return a + (b - a) * t;
        }
        function lerpVec3(arrA, arrB, t, outVec) {
            outVec.set(
                lerpNum(arrA[0], arrB[0], t),
                lerpNum(arrA[1], arrB[1], t),
                lerpNum(arrA[2], arrB[2], t)
            );
        }

        const evalCamPos = new THREE.Vector3();
        const evalCamLook = new THREE.Vector3();

        function evaluateSceneAtTime(t, instantPins = false) {
            let bIdx = BEATS.findIndex(b => t >= b.start && t < b.end);
            if (bIdx === -1) bIdx = BEATS.length - 1;
            const activeBeat = BEATS[bIdx];
            const prevBeat = BEATS[Math.max(0, bIdx - 1)];

            const beatDuration = Math.max(0.01, activeBeat.end - activeBeat.start);
            const timeInBeat = Math.max(0, t - activeBeat.start);
            const camTransitionT = smootherstep(Math.min(1.0, timeInBeat / 1.4));

            BEATS.forEach((b, i) => {
                if (t >= b.end) segmentFills[i].style.width = "100%";
                else if (t >= b.start) segmentFills[i].style.width = (((t - b.start) / (b.end - b.start)) * 100).toFixed(1) + "%";
                else segmentFills[i].style.width = "0%";
            });

            if (activeBeatIndex !== bIdx) {
                activeBeatIndex = bIdx;
                document.getElementById('chapter-tag').textContent = activeBeat.tag;
                document.getElementById('chapter-dot').style.backgroundColor = activeBeat.dotColor;
                document.getElementById('beat-counter').textContent = (bIdx + 1) + '/' + BEATS.length;

                const card = document.getElementById('script-card');
                const line = document.getElementById('script-line');
                card.classList.remove('script-animate');
                void card.offsetWidth;
                line.innerHTML = activeBeat.html;
                card.classList.add('script-animate');

                configurePinDOM(activeBeat.pin1, 'primary');
                configurePinDOM(activeBeat.pin2, 'secondary');
            }

            lerpVec3(prevBeat.camPos, activeBeat.camPos, camTransitionT, evalCamPos);
            lerpVec3(prevBeat.camLook, activeBeat.camLook, camTransitionT, evalCamLook);
            camera.position.set(evalCamPos.x + Math.sin(t * 0.4) * 0.02, evalCamPos.y, evalCamPos.z);
            camera.lookAt(evalCamLook);
            camera.updateMatrixWorld();

            const mode = activeBeat.mode;
            const isCosmic = (mode === 'risingFast' || mode === 'fullZeroG' || mode === 'vacuumPanic' || mode === 'apexHeight');

            // 5.1 TRANSIÇÃO DO AMBIENTE
            if (isCosmic) {
                const cosmicFactor = mode === 'risingFast' ? camTransitionT : 1.0;

                const skyR = lerpNum(0.12, 0.008, cosmicFactor);
                const skyG = lerpNum(0.22, 0.015, cosmicFactor);
                const skyB = lerpNum(0.37, 0.045, cosmicFactor);
                scene.background.setRGB(skyR, skyG, skyB);
                scene.fog.color.setRGB(skyR, skyG, skyB);
                renderer.setClearColor(scene.background, 1.0);

                earthSystem.starField.material.opacity = cosmicFactor * 0.95;

                // Os prédios descem, mas os objetos urbanos (táxi, banco, hidrante) flutuam no espaço!
                city.cityGroup.position.y = -cosmicFactor * 12.0;
                city.dynamicPropsGroup.position.y = 0;

                // A Terra se posiciona imponente sob o personagem
                earthGroup.position.set(0, lerpNum(-8.0, -2.65, cosmicFactor), -2.2);
                earthSystem.update(t, true);

                windMat.opacity = 0.0;
                shockRing.material.opacity = 0.0;
            } else if (mode === 'gravitySnap' || mode === 'fallingFast') {
                const fallProgress = Math.min(1.0, timeInBeat / beatDuration);
                const returnRatio = 1.0 - fallProgress;

                scene.background.setRGB(
                    lerpNum(0.12, 0.02, returnRatio),
                    lerpNum(0.22, 0.03, returnRatio),
                    lerpNum(0.37, 0.08, returnRatio)
                );
                scene.fog.color.copy(scene.background);
                renderer.setClearColor(scene.background, 1.0);

                earthSystem.starField.material.opacity = returnRatio * 0.65;
                city.cityGroup.position.y = -returnRatio * 8.0;
                city.dynamicPropsGroup.position.y = 0;
                earthGroup.position.set(0, -2.65 - fallProgress * 8.0, -2.2);
                earthSystem.update(t, false);

                windMat.opacity = 0.85;
                windMat.color.setHex(mode === 'fallingFast' ? 0xfb923c : 0x38bdf8);
                const pos = windGeo.attributes.position.array;
                for (let i = 1; i < pos.length; i += 3) {
                    pos[i] += 0.45;
                    if (pos[i] > 6.0) pos[i] = -1.0;
                }
                windGeo.attributes.position.needsUpdate = true;
            } else {
                windMat.opacity = 0.0;
                city.cityGroup.position.y = 0;
                city.dynamicPropsGroup.position.y = 0;
                earthGroup.position.set(0, -15.0, -2.2);
                earthSystem.update(t, false);

                scene.background.setHex(SKY_CITY_COLOR);
                scene.fog.color.setHex(SKY_CITY_COLOR);
                renderer.setClearColor(scene.background, 1.0);
                sunLight.color.setHex(0xfff7ed);
                sunLight.intensity = 1.25;
            }

            // 5.2 ANIMAÇÃO DO PERSONAGEM E DOS ELEMENTOS
            hero.squashPivot.scale.set(1, 1, 1);
            hero.squashPivot.rotation.set(0, 0, 0);
            // Reset completo de pose/props a cada frame (evita poses "vazando" entre cenas)
            hero.leftLeg.hipPivot.rotation.set(0, 0, 0);
            hero.rightLeg.hipPivot.rotation.set(0, 0, 0);
            hero.leftLeg.kneePivot.rotation.set(0, 0, 0);
            hero.rightLeg.kneePivot.rotation.set(0, 0, 0);
            hero.leftArm.elbowPivot.rotation.set(0, 0, 0);
            hero.rightArm.elbowPivot.rotation.set(0, 0, 0);
            hero.headGroup.rotation.set(0, 0, 0);
            city.yellowTaxi.rotation.set(0, 0, 0);
            city.benchGroup.rotation.set(0, -0.25, 0);
            city.hydrantGroup.rotation.set(0, 0, 0);
            city.redCar.position.set(1.95, 0, 2.15);
            city.redCar.rotation.set(0, Math.PI, 0);
            shockRing.material.opacity = 0.0;
            if (mode === 'personFloating' || isCosmic) {
                const lift = mode === 'personFloating' ? 0.35 : 1.0;
                city.redCar.position.set(2.3, lift + 0.6 + Math.cos(t * 1.2) * 0.15, -1.6);
                city.redCar.rotation.set(t * 0.1, Math.PI + t * 0.15, Math.sin(t * 0.8) * 0.3);
            } else if (mode === 'fallingFast' || mode === 'gravitySnap') {
                const fp = Math.min(1.0, timeInBeat / beatDuration);
                city.redCar.position.set(1.95, lerpNum(1.4, 0, fp), 2.15);
            }

            if (mode === 'walking') {
                hero.setEmotion('calm');
                const walk = Math.sin(t * 7.0);

                hero.leftLeg.hipPivot.rotation.x = walk * 0.42;
                hero.leftLeg.kneePivot.rotation.x = Math.max(0, -walk * 0.42);
                hero.rightLeg.hipPivot.rotation.x = -walk * 0.42;
                hero.rightLeg.kneePivot.rotation.x = Math.max(0, walk * 0.42);

                hero.leftArm.shoulderPivot.rotation.set(-walk * 0.35, 0, 0);
                hero.rightArm.shoulderPivot.rotation.set(0.25, 0, 0.08);
                hero.rightArm.elbowPivot.rotation.x = -0.55;

                hero.root.position.set(0, Math.abs(Math.sin(t * 7.0)) * 0.04, -0.6);
                hero.headGroup.rotation.set(0, Math.sin(t * 1.4) * 0.08, 0);

                city.yellowTaxi.position.set(-1.85, 0, 1.65); city.yellowTaxi.rotation.set(0, 0, 0);
                city.redCar.position.set(1.95, 0, 2.15); city.redCar.rotation.set(0, Math.PI, 0);
                city.benchGroup.position.set(1.45, 0, -0.85); city.benchGroup.rotation.set(0, -0.25, 0);
                city.hydrantGroup.position.set(-1.45, 0, 0.15); city.hydrantGroup.rotation.set(0, 0, 0);
            }
            else if (mode === 'alert') {
                hero.setEmotion('shock');
                hero.leftLeg.hipPivot.rotation.set(0, 0, 0);
                hero.rightLeg.hipPivot.rotation.set(0, 0, 0);
                hero.leftArm.shoulderPivot.rotation.set(0.3, 0, -0.25);
                hero.rightArm.shoulderPivot.rotation.set(0.4, 0, 0.15);
                hero.root.position.set(0, 0, -0.6);
                hero.headGroup.rotation.y = Math.sin(t * 8.0) * 0.12;

                const flash = Math.max(0, 1.0 - timeInBeat / 1.4);
                shockRing.position.set(0, 0.05, -0.6);
                shockRing.material.opacity = flash * 0.85;
                shockRing.scale.set(1 + (1 - flash) * 5, 1 + (1 - flash) * 5, 1);
            }
            else if (mode === 'floatStart') {
                hero.setEmotion('shock');
                const lift = smootherstep(timeInBeat / beatDuration);
                hero.root.position.set(0, lift * 0.25, -0.6);
                hero.leftArm.shoulderPivot.rotation.set(0.4, 0, -0.35);
                hero.rightArm.shoulderPivot.rotation.set(0.5, 0, 0.2);

                city.benchGroup.position.set(1.45, lift * 0.35, -0.85);
                city.benchGroup.rotation.set(lift * 0.15, -0.25, lift * 0.1);
                city.yellowTaxi.position.set(-1.85, lift * 0.25, 1.65);
            }
            else if (mode === 'personFloating' || isCosmic) {
                hero.setEmotion('panic');
                let floatH = 0.85;
                if (mode === 'personFloating') floatH = lerpNum(0.25, 0.90, camTransitionT);
                else if (mode === 'risingFast') floatH = lerpNum(0.90, 1.15, camTransitionT);
                else floatH = 1.15 + Math.sin(t * 2.2) * 0.10;

                hero.root.position.set(0, floatH, -0.5);
                hero.squashPivot.rotation.z = Math.sin(t * 1.4) * 0.12;
                hero.squashPivot.rotation.x = Math.cos(t * 1.1) * 0.08;

                hero.leftArm.shoulderPivot.rotation.set(0.5, 0, -0.60 + Math.sin(t * 3.5) * 0.18);
                hero.rightArm.shoulderPivot.rotation.set(0.5, 0, 0.50 - Math.sin(t * 3.5) * 0.18);
                hero.leftLeg.hipPivot.rotation.x = 0.25 + Math.sin(t * 3.0) * 0.15;
                hero.rightLeg.hipPivot.rotation.x = -0.20 - Math.sin(t * 3.0) * 0.15;

                // Objetos Urbanos flutuando no espaço sideral ao redor do personagem!
                const objLift = mode === 'personFloating' ? 0.45 : 1.05;
                city.yellowTaxi.position.set(-1.65, objLift + Math.sin(t * 1.5) * 0.15, -0.4);
                city.yellowTaxi.rotation.set(Math.sin(t * 0.7) * 0.22, 0.35 + t * 0.12, Math.cos(t * 0.6) * 0.18);

                city.benchGroup.position.set(1.45, objLift + 0.2 + Math.cos(t * 1.3) * 0.15, -0.6);
                city.benchGroup.rotation.set(t * 0.15, -0.3 + Math.sin(t * 0.8) * 0.25, t * 0.12);

                city.hydrantGroup.position.set(-1.25, objLift - 0.2 + Math.sin(t * 1.7) * 0.12, 0.15);
                city.hydrantGroup.rotation.set(t * 0.25, t * 0.35, 0);
            }
            else if (mode === 'fallingFast' || mode === 'gravitySnap') {
                hero.setEmotion('panic');
                const fallProgress = Math.min(1.0, timeInBeat / beatDuration);
                const currH = lerpNum(1.2, 0.10, fallProgress);

                hero.root.position.set(0, currH, -0.6);
                hero.leftArm.shoulderPivot.rotation.set(2.2, 0, -0.3);
                hero.rightArm.shoulderPivot.rotation.set(2.2, 0, 0.3);
                hero.leftLeg.hipPivot.rotation.x = -0.45;
                hero.rightLeg.hipPivot.rotation.x = -0.45;

                city.yellowTaxi.position.set(-1.85, currH * 1.1, 1.65);
                city.benchGroup.position.set(1.45, currH * 1.0, -0.85);
                city.hydrantGroup.position.set(-1.45, currH * 0.9, 0.15);
            }
            else if (mode === 'springLanding') {
                hero.setEmotion('shock');
                const impactProgress = Math.min(1.0, timeInBeat / 0.8);
                const bounce = Math.sin(impactProgress * Math.PI) * Math.exp(-impactProgress * 3.5);

                hero.root.position.set(0, Math.max(0, -bounce * 0.15), -0.6);
                hero.squashPivot.scale.set(1 + bounce * 0.25, Math.max(0.7, 1 - bounce * 0.35), 1 + bounce * 0.25);

                hero.leftArm.shoulderPivot.rotation.set(0.2, 0, -0.4);
                hero.rightArm.shoulderPivot.rotation.set(0.3, 0, 0.2);
                hero.rightArm.elbowPivot.rotation.x = -0.7;

                city.yellowTaxi.position.set(-1.85, 0, 1.65); city.yellowTaxi.rotation.set(0, 0, 0);
                city.benchGroup.position.set(1.45, 0, -0.85); city.benchGroup.rotation.set(0, -0.25, 0);
                city.hydrantGroup.position.set(-1.45, 0, 0.15); city.hydrantGroup.rotation.set(0, 0, 0);
            }
            else if (mode === 'celebrate') {
                hero.setEmotion('happy');
                hero.root.position.set(0, 0, -0.6);

                // Braço Esquerdo (Mão Livre): Aceno humano perfeito e carismático (antebraço para cima acenando)
                hero.leftArm.shoulderPivot.rotation.set(0.15, 0, -1.45);
                hero.leftArm.elbowPivot.rotation.set(-0.15, 0, -1.35 + Math.sin(t * 8.0) * 0.28);

                // Braço Direito (Caneca de Café): Segura a caneca de café com firmeza e orgulho na frente da cintura
                hero.rightArm.shoulderPivot.rotation.set(0.20, 0, -0.28);
                hero.rightArm.elbowPivot.rotation.set(-1.10, 0.35, 0);

                // Cabeça com leve inclinação expressiva
                hero.headGroup.rotation.set(0.04, Math.sin(t * 2.0) * 0.08, 0.06);

                city.yellowTaxi.position.set(-1.85, 0, 1.65);
                city.redCar.position.set(1.95, 0, 2.15);
                city.benchGroup.position.set(1.45, 0, -0.85);
                city.hydrantGroup.position.set(-1.45, 0, 0.15);
            }

            // 5.3 ATUALIZAÇÃO DOS PINS 3D NO FRAME
            updatePinPosition(pinPrimaryEl, activeBeat.pin1, pin1State, instantPins);
            updatePinPosition(pinSecondaryEl, activeBeat.pin2, pin2State, instantPins);

            renderer.render(scene, camera);
        }

        function animate(now) {
            requestAnimationFrame(animate);

            if (isPlaying && !isCaptureMode) {
                const delta = (now - lastFrameTime) / 1000;
                lastFrameTime = now;

                if (!masterAudio.paused && !isMuted) {
                    currentTime = masterAudio.currentTime;
                } else {
                    currentTime += delta;
                }

                if (currentTime >= TOTAL_DURATION) {
                    currentTime = 0;
                    if (!isMuted) masterAudio.currentTime = 0;
                }

                evaluateSceneAtTime(currentTime, false);
            }
        }

        evaluateSceneAtTime(0, true);
        requestAnimationFrame(animate);
    </script>
</body>
</html>`;

// Gravação dos arquivos finais
const localPath = 'gravidade-zero-3d.html';
const downloadsPath = 'c:/Users/Ruan Gomes/Downloads/e_se_a_gravidade_desligasse_animacao_vertical_3d.html';

writeFileSync(localPath, htmlContent, 'utf8');
writeFileSync(downloadsPath, htmlContent, 'utf8');

console.log(`✅ Novo arquivo HTML (Vídeo #3) criado em: ${downloadsPath}`);
console.log(`✅ Cópia no projeto salva em: ${localPath}`);
