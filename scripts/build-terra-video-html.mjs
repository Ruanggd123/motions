import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

// 1. Carregamos o JSON de timestamps e o áudio contínuo gerado
const timingData = JSON.parse(readFileSync('src/terraTiming.json', 'utf8'));
const audioBase64 = readFileSync('output/terra-parou_audio.mp3').toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;

const tb = timingData.beats;

// 2. Lemos o código dos módulos 3D existentes
const planetEarthCode = readFileSync('src/gravity/PlanetEarth.js', 'utf8').replace(/export /g, '');
const stylizedCharacterCode = readFileSync('src/gravity/StylizedCharacter.js', 'utf8').replace(/export /g, '');
const cityDioramaCode = readFileSync('src/gravity/CityDiorama.js', 'utf8').replace(/export /g, '');

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>E Se a Terra Parasse de Girar por 5 Segundos? — Animação Vertical 3D</title>
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
            background-color: #0b1329;
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
            background: rgba(15, 23, 42, 0.86);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);
        }

        .script-card {
            background: rgba(11, 19, 43, 0.94);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1.5px solid rgba(255, 255, 255, 0.20);
            box-shadow: 0 22px 45px rgba(0, 0, 0, 0.70);
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
            box-shadow: 0 3px 10px rgba(0,0,0,0.32);
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
            width: 72px;
            height: 72px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, 0.86);
            border: 2px solid rgba(255, 255, 255, 0.30);
            backdrop-filter: blur(12px);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65);
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
            <svg id="play-icon" class="w-9 h-9 text-white ml-1 hidden" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <svg id="pause-icon" class="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
        </div>

        <!-- Elementos HUD Pins 3D -->
        <div id="pin-primary" class="pin-3d" style="opacity: 0;">
            <div id="pin-primary-box" class="px-3 py-1 rounded-full font-extrabold text-[11px] font-space uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-white/50">
                <span id="pin-primary-icon">⚡</span>
                <span id="pin-primary-text">INÉRCIA</span>
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
            <!-- Topo: Barras de Progresso dos Beats + Header com Informações -->
            <div class="w-full flex flex-col gap-2.5">
                <!-- Segmentos do Beat (6 atos sincronizados) -->
                <div id="segments-container" class="grid grid-cols-6 gap-1.5 w-full"></div>

                <!-- Header de Título e Capítulo Ativo -->
                <div class="flex items-center justify-between">
                    <div class="glass-dark px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span class="text-[10px] font-extrabold tracking-widest text-cyan-300 uppercase font-space">PARADOXO CIENTÍFICO</span>
                    </div>

                    <div class="glass-dark px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                        <span id="chapter-dot" class="w-2 h-2 rounded-full bg-yellow-400"></span>
                        <span id="chapter-tag" class="text-[10px] font-bold tracking-wider text-white uppercase font-space">1. O DILEMA CÓSMICO</span>
                        <span id="beat-counter" class="text-[9px] font-extrabold text-cyan-400 bg-cyan-950/70 px-1.5 py-0.5 rounded ml-0.5 font-space">1/6</span>
                    </div>
                </div>
            </div>

            <!-- Card Inferior com Legendas Dinâmicas em Tempo Real -->
            <div class="w-full flex flex-col items-center gap-2 pb-1">
                <div id="script-card" class="script-card w-full rounded-2xl p-4 script-animate">
                    <p id="script-line" class="text-white font-bold text-center text-sm leading-relaxed tracking-normal font-sans">
                        Você sobreviveria se a Terra parasse de girar por apenas cinco segundos?
                    </p>
                </div>

                <!-- Barra de Controle Inferior Interativa -->
                <div class="w-full flex items-center justify-between px-1 pt-1 interactive">
                    <div class="flex items-center gap-2">
                        <button onclick="togglePlayPause(event)" class="glass-dark px-3 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 transition flex items-center gap-1.5">
                            <span id="play-state-icon">▶</span>
                            <span id="time-display" class="font-space font-semibold text-[11px] text-cyan-300">00:00 / 00:45</span>
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="toggleMute(event)" class="glass-dark px-3 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 transition flex items-center gap-1">
                            <span id="mute-icon">🔊</span>
                            <span id="mute-label" class="text-[11px]">Som</span>
                        </button>
                        <button onclick="seekToTime(0)" class="glass-dark px-3 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 transition flex items-center gap-1">
                            <span>⏮</span>
                            <span class="text-[11px]">Reiniciar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Áudio Mestre Sincronizado (Base64) -->
    <audio id="master-audio" preload="auto" src="${audioDataUri}"></audio>

    <script>
        /*************************************************************************
         * CÓDIGO DOS MÓDULOS 3D EMBUTIDOS (PIXAR CHARACTER + DIORAMA + EARTH)
         *************************************************************************/
        ${planetEarthCode}
        ${stylizedCharacterCode}
        ${cityDioramaCode}

        /*************************************************************************
         * 1. CONFIGURAÇÃO DA TIMELINE E DOS 6 BEATS NARRATIVOS
         *************************************************************************/
        const isCaptureMode = new URLSearchParams(window.location.search).get('capture') === '1';
        if (isCaptureMode) {
            document.body.classList.add('capture-mode');
        }

        const masterAudio = document.getElementById('master-audio');

        const BEATS = [
            {
                id: 0,
                start: ${tb[0].start},
                end: ${tb[0].end},
                tag: "1. O DILEMA CÓSMICO",
                dotColor: "#38bdf8",
                html: \`Você <span class="kw-badge kw-yellow">SOBREVIVERIA</span> se a <span class="kw-badge kw-cyan">TERRA PARASSE DE GIRAR</span> por apenas <span class="kw-badge kw-magenta">5 SEGUNDOS</span>?\`,
                camPos: [1.4, 3.8, 7.2],
                camLook: [0.0, 0.9, -0.3],
                mode: "walking",
                pin1: { text: "Rotina na Cidade", icon: "🚶", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "charHead" },
                pin2: { text: "Terra a 1.670 km/h", icon: "🌍", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "earth" }
            },
            {
                id: 1,
                start: ${tb[1].start},
                end: ${tb[1].end},
                tag: "2. VELOCIDADE OCULTA",
                dotColor: "#fb923c",
                html: \`Neste exato momento, você e tudo ao redor se movem a <span class="kw-badge kw-orange">1.670 KM/H</span> em direção ao <span class="kw-badge kw-cyan">LESTE</span>!\`,
                camPos: [2.0, 3.6, 6.8],
                camLook: [0.0, 0.9, -0.2],
                mode: "speedVector",
                pin1: { text: "Inércia: 465 m/s", icon: "💨", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "charHead" },
                pin2: { text: "Rotação para o Leste", icon: "🧭", style: "bg-sky-400 text-slate-950", stem: "text-sky-400", target: "earth" }
            },
            {
                id: 2,
                start: ${tb[2].start},
                end: ${tb[2].end},
                tag: "3. O SOLAVANCO DE NEWTON",
                dotColor: "#f43f5e",
                html: \`Se o planeta parasse, a <span class="kw-badge kw-magenta">1ª LEI DE NEWTON</span> atuaria: tudo seria <span class="kw-badge kw-yellow">ARREMESSADO</span> a <span class="kw-badge kw-magenta">VELOCIDADE SUPERSÔNICA</span>!\`,
                camPos: [-1.8, 3.2, 6.4],
                camLook: [0.2, 0.8, -0.4],
                mode: "inertiaStop",
                pin1: { text: "1ª Lei: Inércia Brutal", icon: "⚠️", style: "bg-rose-500 text-white", stem: "text-rose-500", target: "charHead" },
                pin2: { text: "Projétil a 1.600 km/h!", icon: "🚕", style: "bg-yellow-400 text-slate-950", stem: "text-yellow-400", target: "car" }
            },
            {
                id: 3,
                start: ${tb[3].start},
                end: ${tb[3].end},
                tag: "4. VENTOS & MEGATSUNAMIS",
                dotColor: "#ef4444",
                html: \`A atmosfera geraria <span class="kw-badge kw-cyan">VENTOS DE 500 M/S</span> varrendo cidades, enquanto oceanos criariam <span class="kw-badge kw-magenta">MEGATSUNAMIS GLOBAIS</span>!\`,
                camPos: [0.0, 5.0, 8.2],
                camLook: [0.0, 0.5, -1.0],
                mode: "supersonicWinds",
                pin1: { text: "Ventos de 1.800 km/h!", icon: "🌪️", style: "bg-sky-300 text-slate-950", stem: "text-sky-300", target: "charHead" },
                pin2: { text: "Megatsunami Planetário", icon: "🌊", style: "bg-blue-400 text-slate-950", stem: "text-blue-400", target: "earth" }
            },
            {
                id: 4,
                start: ${tb[4].start},
                end: ${tb[4].end},
                tag: "5. RETOMADA TECTÔNICA",
                dotColor: "#a855f7",
                html: \`<span class="kw-badge kw-yellow">5 SEGUNDOS DEPOIS</span>: a Terra volta a girar com um <span class="kw-badge kw-magenta">SOLAVANCO TECTÔNICO</span> e terremotos globais!\`,
                camPos: [1.2, 3.6, 7.0],
                camLook: [0.0, 0.8, -0.4],
                mode: "tectonicRestart",
                pin1: { text: "Terremoto Grau 9.5!", icon: "⚡", style: "bg-purple-400 text-slate-950", stem: "text-purple-400", target: "charHead" },
                pin2: { text: "Rotação Reiniciada", icon: "🔄", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "earth" }
            },
            {
                id: 5,
                start: ${tb[5].start},
                end: ${tb[5].end},
                tag: "6. O ESCUDO DA VIDA",
                dotColor: "#22c55e",
                html: \`A <span class="kw-badge kw-green">ROTAÇÃO SUAVE</span> é nosso escudo de sobrevivência. <span class="kw-badge kw-cyan">VOCÊ SABIA</span> que voamos tão rápido?\`,
                camPos: [0.0, 3.8, 7.2],
                camLook: [0.0, 0.9, -0.3],
                mode: "peacefulEarth",
                pin1: { text: "Equilíbrio Restaurado", icon: "🛡️", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "earth" },
                pin2: { text: "Sobrevivemos!", icon: "☕", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" }
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
        const viewport = document.getElementById('phone-viewport');
        const container = document.getElementById('webgl-container');

        const scene = new THREE.Scene();
        const SKY_CITY_COLOR = 0x38bdf8;
        scene.background = new THREE.Color(0x0b1329);
        scene.fog = new THREE.FogExp2(0x0b1329, 0.035);

        const camera = new THREE.PerspectiveCamera(46, viewport.clientWidth / viewport.clientHeight, 0.1, 150);
        camera.position.set(1.4, 3.8, 7.2);
        camera.lookAt(0, 0.9, -0.3);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', () => {
            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        // Luzes Dinâmicas de Alta Fidelidade
        const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
        scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
        sunLight.position.set(5.5, 9.5, 4.5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.bias = -0.0004;
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
        fillLight.position.set(-6, 4, -4);
        scene.add(fillLight);

        /*************************************************************************
         * 3. MONTAGEM DA CENA: DIORAMA, PERSONAGEM E PLANETA TERRA
         *************************************************************************/
        const city = createCityDiorama(THREE);
        scene.add(city.cityGroup);
        scene.add(city.dynamicPropsGroup);

        const hero = createStylizedCharacter(THREE);
        scene.add(hero.root);
        hero.root.position.set(0, 0, -0.6);

        const earthSystem = createPlanetEarthSystem(THREE);
        const earthGroup = earthSystem.root;
        earthGroup.position.set(0, 3.4, -6.5);
        scene.add(earthGroup);

        // Anel de Onda de Choque Inercial / Tectônica
        const shockRingGeo = new THREE.RingGeometry(0.1, 0.35, 32);
        const shockRingMat = new THREE.MeshBasicMaterial({
            color: 0xf43f5e,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
        shockRing.rotation.x = -Math.PI / 2;
        shockRing.position.set(0, 0.02, -0.6);
        scene.add(shockRing);

        // Sistema de Linhas de Vento Hipersônico (500 m/s)
        const windCount = 140;
        const windGeo = new THREE.BufferGeometry();
        const windPos = new Float32Array(windCount * 6);
        for (let i = 0; i < windCount; i++) {
            const x = (Math.random() - 0.5) * 8.0;
            const y = Math.random() * 4.5;
            const z = (Math.random() - 0.5) * 5.0 - 0.5;
            const len = 0.8 + Math.random() * 1.6;
            windPos[i * 6 + 0] = x;
            windPos[i * 6 + 1] = y;
            windPos[i * 6 + 2] = z;
            windPos[i * 6 + 3] = x - len;
            windPos[i * 6 + 4] = y;
            windPos[i * 6 + 5] = z;
        }
        windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
        const windMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending
        });
        const windLines = new THREE.LineSegments(windGeo, windMat);
        scene.add(windLines);

        // Sistema de Vetores de Velocidade para o Beat 2 (Setas de 1.670 km/h)
        const vectorCount = 40;
        const vectorGeo = new THREE.BufferGeometry();
        const vectorPos = new Float32Array(vectorCount * 6);
        for (let i = 0; i < vectorCount; i++) {
            const x = (Math.random() - 0.5) * 6.0;
            const y = 0.2 + Math.random() * 2.5;
            const z = (Math.random() - 0.5) * 4.0 - 0.5;
            const len = 0.6 + Math.random() * 0.8;
            vectorPos[i * 6 + 0] = x;
            vectorPos[i * 6 + 1] = y;
            vectorPos[i * 6 + 2] = z;
            vectorPos[i * 6 + 3] = x + len;
            vectorPos[i * 6 + 4] = y;
            vectorPos[i * 6 + 5] = z;
        }
        vectorGeo.setAttribute('position', new THREE.BufferAttribute(vectorPos, 3));
        const vectorMat = new THREE.LineBasicMaterial({
            color: 0xfb923c,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending
        });
        const vectorLines = new THREE.LineSegments(vectorGeo, vectorMat);
        scene.add(vectorLines);

        /*************************************************************************
         * 4. SISTEMA DE PINS 3D DINÂMICOS
         *************************************************************************/
        const pinPrimaryEl = document.getElementById('pin-primary');
        const pinSecondaryEl = document.getElementById('pin-secondary');
        const pinPrimaryState = { x: 0, y: 0, opacity: 0 };
        const pinSecondaryState = { x: 0, y: 0, opacity: 0 };

        function getTargetWorldPosition(targetName) {
            const v = new THREE.Vector3();
            switch (targetName) {
                case 'charHead':
                    return hero.headGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.45, 0));
                case 'charFeet':
                    return hero.root.getWorldPosition(v).add(new THREE.Vector3(0, 0.05, 0));
                case 'coffee':
                    return hero.mugGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.15, 0));
                case 'bench':
                    return city.benchGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.45, 0));
                case 'hydrant':
                    return city.hydrantGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.60, 0));
                case 'car':
                    return city.yellowTaxi.getWorldPosition(v).add(new THREE.Vector3(0, 0.90, 0));
                case 'earth':
                    return earthGroup.getWorldPosition(v).add(new THREE.Vector3(0, 1.8, 0.5));
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
            const clampedY = Math.max(140, Math.min(h - 180, targetY));

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
            const playStateIcon = document.getElementById('play-state-icon');

            if (isPlaying) {
                lastFrameTime = performance.now();
                btn.classList.add('hidden-btn');
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                if (playStateIcon) playStateIcon.textContent = '⏸';
                if (!isMuted) {
                    masterAudio.currentTime = currentTime;
                    masterAudio.play().catch(() => {});
                }
            } else {
                btn.classList.remove('hidden-btn');
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                if (playStateIcon) playStateIcon.textContent = '▶';
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

            // Atualiza barras de progresso
            BEATS.forEach((b, i) => {
                if (t >= b.end) segmentFills[i].style.width = "100%";
                else if (t >= b.start) segmentFills[i].style.width = (((t - b.start) / (b.end - b.start)) * 100).toFixed(1) + "%";
                else segmentFills[i].style.width = "0%";
            });

            // Atualiza display de tempo
            const curMin = Math.floor(t / 60);
            const curSec = Math.floor(t % 60);
            const totMin = Math.floor(TOTAL_DURATION / 60);
            const totSec = Math.floor(TOTAL_DURATION % 60);
            const timeStr = String(curMin).padStart(2, '0') + ':' + String(curSec).padStart(2, '0') + ' / ' +
                            String(totMin).padStart(2, '0') + ':' + String(totSec).padStart(2, '0');
            const timeDispEl = document.getElementById('time-display');
            if (timeDispEl) timeDispEl.textContent = timeStr;

            // Transição de Script e Tags
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

            // Interpolação de Câmera
            lerpVec3(prevBeat.camPos, activeBeat.camPos, camTransitionT, evalCamPos);
            lerpVec3(prevBeat.camLook, activeBeat.camLook, camTransitionT, evalCamLook);

            // Shakes de Câmera para impactos
            let shakeX = 0;
            let shakeY = 0;
            if (activeBeat.mode === 'inertiaStop') {
                const stopImp = Math.max(0, 1.0 - timeInBeat / 2.2);
                shakeX = Math.sin(t * 32.0) * 0.08 * stopImp;
                shakeY = Math.cos(t * 28.0) * 0.06 * stopImp;
            } else if (activeBeat.mode === 'tectonicRestart') {
                const tecImp = Math.max(0, 1.0 - timeInBeat / 3.0);
                shakeX = Math.sin(t * 42.0) * 0.10 * tecImp;
                shakeY = Math.cos(t * 38.0) * 0.08 * tecImp;
            } else if (activeBeat.mode === 'supersonicWinds') {
                shakeX = Math.sin(t * 18.0) * 0.03;
                shakeY = Math.cos(t * 14.0) * 0.02;
            }

            camera.position.set(evalCamPos.x + shakeX, evalCamPos.y + shakeY, evalCamPos.z);
            camera.lookAt(evalCamLook);
            camera.updateMatrixWorld();

            // ROTAÇÃO E ESTADO DA TERRA
            if (activeBeat.mode === 'walking') {
                earthGroup.position.set(0, 3.5, -6.5);
                earthSystem.earthMesh.rotation.y = t * 0.10 + 1.65;
                earthSystem.atmoMesh.rotation.y = t * 0.12 + 1.65;
                earthSystem.starField.material.opacity = 0.45;
                scene.background.setHex(0x0b1329);
                scene.fog.color.setHex(0x0b1329);
            } else if (activeBeat.mode === 'speedVector') {
                earthGroup.position.set(0, 3.4, -6.2);
                earthSystem.earthMesh.rotation.y = t * 0.14 + 1.65;
                earthSystem.atmoMesh.rotation.y = t * 0.16 + 1.65;
                earthSystem.starField.material.opacity = 0.55;
            } else if (activeBeat.mode === 'inertiaStop') {
                // A TERRA PARA COMPLETAMENTE!
                earthGroup.position.set(0, 3.2, -6.0);
                const stopFreeze = ${tb[2].start} * 0.14 + 1.65;
                earthSystem.earthMesh.rotation.y = stopFreeze;
                earthSystem.atmoMesh.rotation.y = stopFreeze;
                earthSystem.starField.material.opacity = 0.85;
                scene.background.setHex(0x080c1d);
                scene.fog.color.setHex(0x080c1d);
            } else if (activeBeat.mode === 'supersonicWinds') {
                // Terra continua estática por 5 segundos
                earthGroup.position.set(0, 3.8, -6.4);
                const stopFreeze = ${tb[2].start} * 0.14 + 1.65;
                earthSystem.earthMesh.rotation.y = stopFreeze;
                earthSystem.atmoMesh.rotation.y = stopFreeze + Math.sin(t * 3.0) * 0.04; // Atmosfera turbulenta
                earthSystem.starField.material.opacity = 0.90;
            } else if (activeBeat.mode === 'tectonicRestart') {
                // Retomada da rotação com aceleração violenta
                earthGroup.position.set(0, 3.4, -6.2);
                const stopFreeze = ${tb[2].start} * 0.14 + 1.65;
                const restartProgress = timeInBeat / beatDuration;
                earthSystem.earthMesh.rotation.y = stopFreeze + Math.pow(restartProgress, 2) * 0.95;
                earthSystem.atmoMesh.rotation.y = stopFreeze + Math.pow(restartProgress, 2) * 1.05;
                earthSystem.starField.material.opacity = 0.65;
            } else if (activeBeat.mode === 'peacefulEarth') {
                // Rotação suave restaurada
                earthGroup.position.set(0, 3.5, -6.5);
                earthSystem.earthMesh.rotation.y = (t - ${tb[5].start}) * 0.08 + 2.85;
                earthSystem.atmoMesh.rotation.y = (t - ${tb[5].start}) * 0.09 + 2.85;
                earthSystem.starField.material.opacity = 0.40;
                scene.background.setHex(0x0b1530);
                scene.fog.color.setHex(0x0b1530);
            }

            // RESET DE POSES DO PERSONAGEM E PROPS
            hero.squashPivot.scale.set(1, 1, 1);
            hero.squashPivot.rotation.set(0, 0, 0);
            hero.leftLeg.hipPivot.rotation.set(0, 0, 0);
            hero.rightLeg.hipPivot.rotation.set(0, 0, 0);
            hero.leftLeg.kneePivot.rotation.set(0, 0, 0);
            hero.rightLeg.kneePivot.rotation.set(0, 0, 0);
            hero.leftArm.elbowPivot.rotation.set(0, 0, 0);
            hero.rightArm.elbowPivot.rotation.set(0, 0, 0);
            hero.headGroup.rotation.set(0, 0, 0);

            city.yellowTaxi.position.set(-1.85, 0, 1.65);
            city.yellowTaxi.rotation.set(0, 0, 0);
            city.redCar.position.set(1.95, 0, 2.15);
            city.redCar.rotation.set(0, Math.PI, 0);
            city.benchGroup.position.set(1.45, 0, -0.85);
            city.benchGroup.rotation.set(0, -0.25, 0);
            city.hydrantGroup.position.set(-1.45, 0, 0.15);
            city.hydrantGroup.rotation.set(0, 0, 0);

            shockRing.material.opacity = 0.0;
            vectorMat.opacity = 0.0;
            windMat.opacity = 0.0;

            // COREOGRAFIA POR BEAT
            if (activeBeat.mode === 'walking') {
                hero.setEmotion('calm');
                const walk = Math.sin(t * 6.5);

                hero.leftLeg.hipPivot.rotation.x = walk * 0.40;
                hero.leftLeg.kneePivot.rotation.x = Math.max(0, -walk * 0.40);
                hero.rightLeg.hipPivot.rotation.x = -walk * 0.40;
                hero.rightLeg.kneePivot.rotation.x = Math.max(0, walk * 0.40);

                hero.leftArm.shoulderPivot.rotation.set(-walk * 0.35, 0, 0);
                hero.rightArm.shoulderPivot.rotation.set(0.25, 0, 0.08);
                hero.rightArm.elbowPivot.rotation.x = -0.55;

                hero.root.position.set(0, Math.abs(Math.sin(t * 6.5)) * 0.04, -0.6);
                hero.headGroup.rotation.set(0, Math.sin(t * 1.5) * 0.08, 0);
            }
            else if (activeBeat.mode === 'speedVector') {
                hero.setEmotion('calm');
                hero.leftArm.shoulderPivot.rotation.set(0.1, 0, -0.2);
                hero.rightArm.shoulderPivot.rotation.set(0.28, 0, 0.08);
                hero.rightArm.elbowPivot.rotation.x = -0.55;
                hero.root.position.set(0, 0, -0.6);
                hero.headGroup.rotation.set(-0.10, 0.20, 0); // Olha curioso

                // Ativa setas de vetor laranja se movendo para o Leste (+X)
                vectorMat.opacity = 0.85;
                const vPos = vectorGeo.attributes.position.array;
                for (let i = 0; i < vPos.length; i += 6) {
                    vPos[i] += 0.08;
                    vPos[i + 3] += 0.08;
                    if (vPos[i] > 4.0) {
                        vPos[i] = -4.0;
                        vPos[i + 3] = -3.2;
                    }
                }
                vectorGeo.attributes.position.needsUpdate = true;
            }
            else if (activeBeat.mode === 'inertiaStop') {
                hero.setEmotion('shock');
                const inertiaProg = Math.min(1.0, timeInBeat / 1.6);
                const leanAngle = THREE.MathUtils.lerp(0, -0.65, Math.sin(inertiaProg * Math.PI * 0.7));

                // Personagem arremessado horizontalmente (Inércia da 1ª Lei)
                hero.squashPivot.rotation.z = leanAngle;
                hero.leftArm.shoulderPivot.rotation.set(1.4, 0, -0.7);
                hero.rightArm.shoulderPivot.rotation.set(1.2, 0, 0.8);
                hero.leftLeg.hipPivot.rotation.x = -0.35;
                hero.rightLeg.hipPivot.rotation.x = 0.25;
                hero.root.position.set(0.25 * inertiaProg, 0.05, -0.6);

                // Táxi inclina empinado nas rodas dianteiras
                city.yellowTaxi.rotation.z = 0.28 * Math.sin(inertiaProg * Math.PI);
                city.yellowTaxi.position.x = -1.85 + 0.35 * inertiaProg;

                // Onda de choque no solo
                const flash = Math.max(0, 1.0 - timeInBeat / 2.0);
                shockRing.position.set(0, 0.02, -0.6);
                shockRing.material.opacity = flash * 0.90;
                shockRing.scale.set(1 + (1 - flash) * 6, 1 + (1 - flash) * 6, 1);
            }
            else if (activeBeat.mode === 'supersonicWinds') {
                hero.setEmotion('panic');
                // Personagem luta contra ventos violentos de 500 m/s
                hero.squashPivot.rotation.z = -0.38 + Math.sin(t * 12.0) * 0.06;
                hero.squashPivot.rotation.x = 0.15;
                hero.leftArm.shoulderPivot.rotation.set(0.6, 0, -0.9);
                hero.rightArm.shoulderPivot.rotation.set(0.9, 0, 0.3);
                hero.leftLeg.hipPivot.rotation.x = -0.25;
                hero.rightLeg.hipPivot.rotation.x = 0.35;
                hero.root.position.set(0.15, 0, -0.6);

                // Carros e elementos deslizam com a ventania
                city.yellowTaxi.position.set(-1.50 + Math.sin(t * 3.0) * 0.05, 0, 1.65);
                city.yellowTaxi.rotation.y = 0.15;

                // Linhas de vento supersônico passando velozes da direita para esquerda
                windMat.opacity = 0.95;
                const wPos = windGeo.attributes.position.array;
                for (let i = 0; i < wPos.length; i += 6) {
                    wPos[i] -= 0.35;
                    wPos[i + 3] -= 0.35;
                    if (wPos[i] < -4.5) {
                        wPos[i] = 4.5;
                        wPos[i + 3] = 3.3;
                    }
                }
                windGeo.attributes.position.needsUpdate = true;
            }
            else if (activeBeat.mode === 'tectonicRestart') {
                hero.setEmotion('shock');
                const tecProg = Math.min(1.0, timeInBeat / beatDuration);

                // Vibração e squash & stretch na retomada
                const squish = 1.0 + Math.sin(tecProg * Math.PI * 4.0) * 0.12 * (1.0 - tecProg);
                hero.squashPivot.scale.set(1 / Math.sqrt(squish), squish, 1 / Math.sqrt(squish));
                hero.squashPivot.rotation.z = Math.sin(tecProg * Math.PI * 5.0) * 0.15 * (1.0 - tecProg);

                hero.leftArm.shoulderPivot.rotation.set(0.4, 0, -0.4);
                hero.rightArm.shoulderPivot.rotation.set(0.5, 0, 0.3);
                hero.root.position.set(0, 0, -0.6);

                // Táxi quica na suspensão com solavanco
                city.yellowTaxi.position.set(-1.75, Math.abs(Math.sin(tecProg * Math.PI * 6.0)) * 0.10 * (1.0 - tecProg), 1.65);
                city.yellowTaxi.rotation.set(0, 0, 0);

                // Pulso de energia no chão
                const flash = Math.max(0, 1.0 - timeInBeat / 2.5);
                shockRing.material.color.setHex(0xa855f7);
                shockRing.material.opacity = flash * 0.85;
                shockRing.scale.set(1 + (1 - flash) * 5, 1 + (1 - flash) * 5, 1);
            }
            else if (activeBeat.mode === 'peacefulEarth') {
                hero.setEmotion('happy');
                // Alívio e contemplação pacífica
                hero.leftArm.shoulderPivot.rotation.set(0.1, 0, -0.15);
                hero.rightArm.shoulderPivot.rotation.set(0.35, 0, 0.08);
                hero.rightArm.elbowPivot.rotation.x = -0.70; // Segura caneca perto
                hero.root.position.set(0, 0, -0.6);
                hero.headGroup.rotation.set(0, Math.sin(t * 1.2) * 0.05, 0);

                city.yellowTaxi.position.set(-1.85, 0, 1.65);
                city.yellowTaxi.rotation.set(0, 0, 0);
            }

            // Atualiza Pins 3D na tela
            updatePinPosition(pinPrimaryEl, activeBeat.pin1, pinPrimaryState, instantPins);
            updatePinPosition(pinSecondaryEl, activeBeat.pin2, pinSecondaryState, instantPins);

            // Renderiza cena
            renderer.render(scene, camera);
        }

        // Loop principal em tempo real
        function animate() {
            requestAnimationFrame(animate);

            if (isPlaying) {
                const now = performance.now();
                const dt = (now - lastFrameTime) / 1000;
                lastFrameTime = now;

                if (!masterAudio.paused && !masterAudio.ended && masterAudio.duration) {
                    currentTime = masterAudio.currentTime;
                } else {
                    currentTime += dt;
                }

                if (currentTime >= TOTAL_DURATION) {
                    currentTime = TOTAL_DURATION;
                    isPlaying = false;
                    const btn = document.getElementById('center-play-btn');
                    if (btn) btn.classList.remove('hidden-btn');
                    const playIcon = document.getElementById('play-icon');
                    if (playIcon) playIcon.classList.remove('hidden');
                    const pauseIcon = document.getElementById('pause-icon');
                    if (pauseIcon) pauseIcon.classList.add('hidden');
                }

                evaluateSceneAtTime(currentTime, false);
            }
        }

        // Inicializa primeiro frame estático
        evaluateSceneAtTime(0, true);
        animate();
    </script>
</body>
</html>`;

writeFileSync('terra-parou-3d.html', htmlContent, 'utf8');
console.log('✅ terra-parou-3d.html gerado com sucesso!');

// Copiamos também para Downloads para acesso imediato do usuário
try {
    const dlPath = 'C:/Users/Ruan Gomes/Downloads/terra_parou_animacao_vertical_3d.html';
    copyFileSync('terra-parou-3d.html', dlPath);
    console.log(`✅ Espelhado para Downloads: ${dlPath}`);
} catch (e) {
    console.error('Aviso ao copiar para Downloads:', e.message);
}
