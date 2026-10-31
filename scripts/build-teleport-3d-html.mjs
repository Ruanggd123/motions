import fs from 'node:fs';

const DOWNLOAD_PATH = 'c:/Users/Ruan Gomes/Downloads/o_paradoxo_do_teletransporte_animacao_vertical_3d.html';
const LOCAL_PATH = 'teletransporte-3d.html';
const AUDIO_PATH = 'output/teletransporte_audio.mp3';
const TIMING_PATH = 'src/teletransporteTiming.json';

const audioBase64 = fs.readFileSync(AUDIO_PATH).toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;
const timingData = JSON.parse(fs.readFileSync(TIMING_PATH, 'utf8'));
const tb = timingData.beats;

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>O Paradoxo do Teletransporte — Animação 3D (Formato Vertical 9:16)</title>
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
            background-color: #090d16;
            font-family: 'Plus Jakarta Sans', sans-serif;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #phone-viewport {
            position: relative;
            width: 100%;
            height: 100%;
            max-width: calc(100vh * 9 / 16);
            max-height: 100vh;
            aspect-ratio: 9 / 16;
            background: #e2e8f0;
            overflow: hidden;
            box-shadow: 0 25px 80px -15px rgba(0, 0, 0, 0.85);
            cursor: pointer;
        }

        @media (min-width: 640px) {
            #phone-viewport {
                height: 96vh;
                border-radius: 32px;
                border: 6px solid #1e293b;
            }
        }

        body.capture-mode #phone-viewport {
            max-width: 100vw !important;
            max-height: 100vh !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
        }
        body.capture-mode #audio-btn {
            display: none !important;
        }

        #webgl-container {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .top-scrim {
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.78) 0%, rgba(15, 23, 42, 0.25) 65%, transparent 100%);
        }

        .bottom-scrim {
            background: linear-gradient(0deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.68) 58%, transparent 100%);
        }

        @keyframes scriptPopIn {
            0% { opacity: 0; transform: translateY(10px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .script-animate {
            animation: scriptPopIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .kw-badge {
            display: inline-block;
            padding: 1px 8px;
            margin: 0 2px;
            border-radius: 7px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            letter-spacing: -0.02em;
        }

        .kw-yellow {
            background: #fde047;
            color: #0f172a;
            box-shadow: 0 2px 10px rgba(253, 224, 71, 0.35);
        }

        .kw-cyan {
            background: #22d3ee;
            color: #0f172a;
            box-shadow: 0 2px 10px rgba(34, 211, 238, 0.35);
        }

        .kw-magenta {
            background: #f472b6;
            color: #0f172a;
            box-shadow: 0 2px 10px rgba(244, 114, 182, 0.35);
        }

        .kw-green {
            background: #4ade80;
            color: #0f172a;
            box-shadow: 0 2px 10px rgba(74, 222, 128, 0.35);
        }

        .kw-orange {
            background: #fb923c;
            color: #0f172a;
            box-shadow: 0 2px 10px rgba(251, 146, 60, 0.35);
        }

        .kw-white {
            background: #ffffff;
            color: #0f172a;
        }

        .callout-pin {
            position: absolute;
            z-index: 15;
            pointer-events: none;
            transform: translate(-50%, -100%);
            transition: opacity 0.25s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .callout-bubble {
            padding: 6px 12px;
            border-radius: 9999px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            white-space: nowrap;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.55);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .callout-stem {
            width: 2.5px;
            height: 20px;
            background: currentColor;
            opacity: 0.9;
        }

        .callout-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: currentColor;
            box-shadow: 0 0 12px currentColor;
        }
    </style>
</head>
<body>

    <audio id="master-narration" preload="auto" src="${audioDataUri}"></audio>

    <main id="phone-viewport" onclick="handleViewportTap(event)">
        <div id="webgl-container"></div>

        <div class="top-scrim absolute top-0 left-0 right-0 h-28 z-10 pointer-events-none"></div>
        <div class="bottom-scrim absolute bottom-0 left-0 right-0 h-56 z-10 pointer-events-none"></div>

        <!-- TOP HUD -->
        <div class="absolute top-0 left-0 right-0 p-3.5 z-20 flex flex-col gap-2.5">
            <div id="segments-container" class="grid grid-cols-12 gap-1 w-full"></div>

            <div class="flex items-center justify-between px-0.5">
                <div class="flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-lg pointer-events-none">
                    <span id="beat-dot" class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span id="beat-tag" class="text-[11px] font-extrabold tracking-wider text-white uppercase font-['Space_Grotesk']">
                        1. O SONHO DO TELETRANSPORTE
                    </span>
                </div>

                <div class="flex items-center gap-1.5">
                    <button id="audio-btn" onclick="toggleAudio(event)" class="pointer-events-auto flex items-center gap-1.5 text-[11px] font-bold text-white bg-slate-950/75 hover:bg-slate-900 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition">
                        <span id="audio-icon">🔊</span>
                        <span id="audio-text">Som</span>
                    </button>

                    <span id="beat-counter" class="text-[11px] font-bold text-white/85 bg-slate-950/65 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        1 / 12
                    </span>
                </div>
            </div>
        </div>

        <!-- 3D OBJECT CALLOUT PINS -->
        <div id="pin-primary" class="callout-pin opacity-0">
            <div id="pin-primary-bubble" class="callout-bubble bg-cyan-300 text-slate-950 border-2 border-white">
                <span id="pin-primary-icon">🚪</span>
                <span id="pin-primary-text">Cápsula A</span>
            </div>
            <div id="pin-primary-stem" class="callout-stem text-cyan-300"></div>
            <div id="pin-primary-dot" class="callout-dot text-cyan-300"></div>
        </div>

        <div id="pin-secondary" class="callout-pin opacity-0">
            <div id="pin-secondary-bubble" class="callout-bubble bg-emerald-400 text-slate-950 border-2 border-white">
                <span id="pin-secondary-icon">🧬</span>
                <span id="pin-secondary-text">Cápsula B</span>
            </div>
            <div id="pin-secondary-stem" class="callout-stem text-emerald-400"></div>
            <div id="pin-secondary-dot" class="callout-dot text-emerald-400"></div>
        </div>

        <!-- PAUSE INDICATOR -->
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

    <script>
        if (window.location.search.includes('capture=1')) {
            document.body.classList.add('capture-mode');
        }

        const BEATS = [
            {
                id: 0,
                start: ${tb[0].start},
                end: ${tb[0].end},
                tag: "1. A MÁQUINA DE TELETRANSPORTE",
                dotColor: "#22d3ee",
                html: \`Imagine ter na <span class="kw-badge kw-yellow">SALA DA SUA CASA</span> uma máquina de <span class="kw-badge kw-cyan">TELETRANSPORTE</span> instantâneo!\`,
                camPos: [0.0, 5.0, 9.4],
                camLook: [0.0, 1.85, -0.3],
                glassOpacity: 0.35,
                wireOpacity: 0.45,
                mode: "intro",
                pin1: { text: "Máquina de Teletransporte", icon: "⚡", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "bridge" },
                pin2: null
            },
            {
                id: 1,
                start: ${tb[1].start},
                end: ${tb[1].end},
                tag: "2. AS DUAS CÁPSULAS",
                dotColor: "#38bdf8",
                html: \`De um lado fica a <span class="kw-badge kw-cyan">CÁPSULA DE PARTIDA</span>, e do outro está a <span class="kw-badge kw-green">CÁPSULA DE DESTINO</span>.\`,
                // Visão alta diagonal com cápsulas transparentes
                camPos: [0.0, 4.75, 4.65],
                camLook: [0.0, 1.85, 0.0],
                glassOpacity: 0.10,
                wireOpacity: 0.75,
                mode: "ready",
                pin1: { text: "Partida (Original)", icon: "🧍", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "capA" },
                pin2: { text: "Destino (Vazia)", icon: "🚪", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "capB" }
            },
            {
                id: 2,
                start: ${tb[2].start},
                end: ${tb[2].end},
                tag: "3. O SCANNER ATÔMICO",
                dotColor: "#22d3ee",
                html: \`Para funcionar, um <span class="kw-badge kw-cyan">SCANNER LASER</span> lê a posição exata de <span class="kw-badge kw-yellow">CADA ÁTOMO</span> do seu corpo.\`,
                // VISÃO DE CIMA (TOP-DOWN) na Cápsula A enquanto o anel laser escaneia
                camPos: [-0.82, 4.95, 2.75],
                camLook: [-0.78, 1.75, -0.05],
                glassOpacity: 0.05,
                wireOpacity: 0.85,
                mode: "scanning",
                pin1: { text: "Scanner Atômico 100%", icon: "🔬", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "scannerA" },
                pin2: null
            },
            {
                id: 3,
                start: ${tb[3].start},
                end: ${tb[3].end},
                tag: "4. PONTE QUÂNTICA",
                dotColor: "#fbbf24",
                html: \`Essa informação viaja na hora por um cabo de <span class="kw-badge kw-yellow">EMARANHAMENTO QUÂNTICO</span> até a outra cápsula.\`,
                // VISÃO DE CIMA CENTRAL mostrando o cabo quântico e os dois átomos emaranhados
                camPos: [0.0, 5.10, 2.85],
                camLook: [0.0, 1.70, -0.05],
                glassOpacity: 0.06,
                wireOpacity: 0.82,
                mode: "transmitting",
                pin1: { text: "Dados Quânticos (Luz)", icon: "📡", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "bridge" },
                pin2: null
            },
            {
                id: 4,
                start: ${tb[4].start},
                end: ${tb[4].end},
                tag: "5. O PREÇO FÍSICO",
                dotColor: "#f472b6",
                html: \`Mas há uma regra dura: para extrair todos os dados, o scanner <span class="kw-badge kw-magenta">DESFAZ O CORPO ORIGINAL</span>.\`,
                // VISÃO DE CIMA na Cápsula A mostrando o corpo original se desfazendo em átomos brilhantes
                camPos: [-0.65, 4.95, 2.85],
                camLook: [-0.65, 1.75, -0.05],
                glassOpacity: 0.05,
                wireOpacity: 0.88,
                mode: "dissolvingA",
                pin1: { text: "Original Desfeito em Átomos!", icon: "💥", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "capA" },
                pin2: null
            },
            {
                id: 5,
                start: ${tb[5].start},
                end: ${tb[5].end},
                tag: "6. A RECONSTRUÇÃO",
                dotColor: "#4ade80",
                html: \`No mesmo instante, a cápsula de destino usa <span class="kw-badge kw-green">ÁTOMOS NOVOS</span> para reconstruir você até a <span class="kw-badge kw-white">ÚLTIMA MEMÓRIA</span>.\`,
                // VISÃO DE CIMA na Cápsula B reconstruindo o corpo com anel verde esmeralda
                camPos: [0.78, 4.95, 2.80],
                camLook: [0.75, 1.75, -0.05],
                glassOpacity: 0.05,
                wireOpacity: 0.88,
                mode: "rebuildingB",
                pin1: { text: "Reconstruído com Novos Átomos", icon: "✨", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "capB" },
                pin2: null
            },
            {
                id: 6,
                start: ${tb[6].start},
                end: ${tb[6].end},
                tag: "7. A GRANDE DÚVIDA",
                dotColor: "#fde047",
                html: \`Para quem olha de fora, deu tudo certo... mas será que quem saiu de lá <span class="kw-badge kw-yellow">É MESMO VOCÊ</span>?\`,
                camPos: [0.15, 4.35, 4.85],
                camLook: [0.15, 1.82, 0.0],
                glassOpacity: 0.18,
                wireOpacity: 0.55,
                mode: "arrivedB",
                pin1: { text: "Vazia", icon: "💨", style: "bg-slate-200 text-slate-950", stem: "text-slate-200", target: "capA" },
                pin2: { text: "É Você ou um Clone?", icon: "❓", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "capB" }
            },
            {
                id: 7,
                start: ${tb[7].start},
                end: ${tb[7].end},
                tag: "8. FALHA NO SCANNER!",
                dotColor: "#fb923c",
                html: \`Imagine agora que o scanner leia seus dados, mas <span class="kw-badge kw-orange">FALHE NA HORA DE APAGAR</span> o original!\`,
                // VISÃO DE CIMA RAIO-X mostrando que o Original continua na Cápsula A enquanto a Cópia nasce na B!
                camPos: [0.0, 5.25, 4.35],
                camLook: [0.0, 1.72, 0.0],
                glassOpacity: 0.05,
                wireOpacity: 0.90,
                mode: "glitchBoth",
                pin1: { text: "Original Sobreviveu!", icon: "⚠️", style: "bg-orange-400 text-slate-950", stem: "text-orange-400", target: "capA" },
                pin2: { text: "Cópia Criada!", icon: "⚡", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "capB" }
            },
            {
                id: 8,
                start: ${tb[8].start},
                end: ${tb[8].end},
                tag: "9. DOIS VOCÊS!",
                dotColor: "#f472b6",
                html: \`Agora existem <span class="kw-badge kw-yellow">DOIS DE VOCÊ</span> ao mesmo tempo, e ambos juram ser a <span class="kw-badge kw-cyan">PESSOA VERDADEIRA</span>!\`,
                // VISÃO DE CIMA PANORÂMICA dos dois personagens olhando um para o outro
                camPos: [0.0, 5.15, 4.45],
                camLook: [0.0, 1.75, 0.0],
                glassOpacity: 0.05,
                wireOpacity: 0.92,
                mode: "twoTwins",
                pin1: { text: "Você #1 (Original)", icon: "🧍", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "capA" },
                pin2: { text: "Você #2 (Mesma Memória)", icon: "🧬", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "capB" }
            },
            {
                id: 9,
                start: ${tb[9].start},
                end: ${tb[9].end},
                tag: "10. O PARADOXO MORTAL",
                dotColor: "#f43f5e",
                html: \`Se o segundo é outra pessoa, ser desfeito na primeira cápsula significa que <span class="kw-badge kw-magenta">SUA VIDA TERMINOU ALI</span>!\`,
                camPos: [-0.45, 4.75, 3.35],
                camLook: [-0.25, 1.75, 0.0],
                glassOpacity: 0.06,
                wireOpacity: 0.85,
                mode: "paradox",
                pin1: { text: "Fim da Consciência #1", icon: "💀", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "capA" },
                pin2: { text: "Nova Vida #2", icon: "🆕", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "capB" }
            },
            {
                id: 10,
                start: ${tb[10].start},
                end: ${tb[10].end},
                tag: "11. IMPRESSORA DE CLONES",
                dotColor: "#4ade80",
                html: \`A máquina não move você pelo espaço: ela apenas envia a planta e <span class="kw-badge kw-green">IMPRIME UM CLONE PERFEITO</span>!\`,
                camPos: [0.45, 4.55, 3.65],
                camLook: [0.25, 1.75, 0.0],
                glassOpacity: 0.08,
                wireOpacity: 0.78,
                mode: "printer",
                pin1: { text: "Impressora Quântica 3D", icon: "🖨️", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "capB" },
                pin2: null
            },
            {
                id: 11,
                start: ${tb[11].start},
                end: ${tb[11].end},
                tag: "12. CONCLUSÃO",
                dotColor: "#fbbf24",
                html: \`Esse é o <span class="kw-badge kw-yellow">PARADOXO DO TELETRANSPORTE</span>: você entraria nessa cápsula ou acha que quem sai é <span class="kw-badge kw-cyan">OUTRA PESSOA</span>?\`,
                camPos: [0.0, 4.55, 6.2],
                camLook: [0.0, 1.82, 0.0],
                glassOpacity: 0.15,
                wireOpacity: 0.65,
                mode: "outro",
                pin1: { text: "Você Entraria?", icon: "🤔", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "bridge" },
                pin2: null
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

        const container = document.getElementById('webgl-container');
        const viewport = document.getElementById('phone-viewport');
        const masterAudio = document.getElementById('master-narration');

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe6dfd5);
        scene.fog = new THREE.Fog(0xe6dfd5, 13, 25);

        const camera = new THREE.PerspectiveCamera(40, viewport.clientWidth / viewport.clientHeight, 0.1, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        container.appendChild(renderer.domElement);

        function resizeRenderer() {
            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener('resize', resizeRenderer);

        // Iluminação clara e aconchegante
        const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xd6ccc2, 0.98);
        hemiLight.position.set(0, 12, 0);
        scene.add(hemiLight);

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

        const topFillLight = new THREE.DirectionalLight(0xffffff, 0.72);
        topFillLight.position.set(0, 9.5, 2.2);
        scene.add(topFillLight);

        const lampPointLight = new THREE.PointLight(0xffb74d, 0.9, 12);
        lampPointLight.position.set(-3.4, 4.3, -2.0);
        scene.add(lampPointLight);

        // Sala de Estar
        const roomGroup = new THREE.Group();
        scene.add(roomGroup);

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

        // Janela ensolarada
        const windowGroup = new THREE.Group();
        windowGroup.position.set(3.2, 5.2, -4.28);
        roomGroup.add(windowGroup);
        const skyPane = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), new THREE.MeshBasicMaterial({ color: 0xdbeafe }));
        windowGroup.add(skyPane);

        // Sofá ao fundo
        const sofaGroup = new THREE.Group();
        sofaGroup.position.set(-0.4, 0, -3.45);
        roomGroup.add(sofaGroup);
        const sofaFabricMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.55, 1.3), sofaFabricMat);
        sofaBase.position.y = 0.42;
        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.15, 0.32), sofaFabricMat);
        sofaBack.position.set(0, 1.0, -0.49);
        sofaGroup.add(sofaBase, sofaBack);

        // Tapete claro
        const rugMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(2.95, 2.95, 0.03, 48),
            new THREE.MeshStandardMaterial({ color: 0xf5ebe0, roughness: 0.9 })
        );
        rugMesh.position.set(0, 0.015, 0.1);
        rugMesh.receiveShadow = true;
        roomGroup.add(rugMesh);

        // Mesa Central de Madeira
        const TABLE_SURFACE_Y = 1.54;
        const tableGroup = new THREE.Group();
        scene.add(tableGroup);

        const woodTableMat = new THREE.MeshStandardMaterial({ color: 0x8d5b3c, roughness: 0.52 });
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.14, 2.15), woodTableMat);
        tableTop.position.set(0, TABLE_SURFACE_Y - 0.07, 0);
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        tableGroup.add(tableTop);

        const legGeo = new THREE.CylinderGeometry(0.08, 0.06, TABLE_SURFACE_Y - 0.1, 16);
        const legPositions = [
            [-1.50, (TABLE_SURFACE_Y - 0.1) / 2, -0.88],
            [1.50, (TABLE_SURFACE_Y - 0.1) / 2, -0.88],
            [-1.50, (TABLE_SURFACE_Y - 0.1) / 2, 0.88],
            [1.50, (TABLE_SURFACE_Y - 0.1) / 2, 0.88]
        ];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, woodTableMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            tableGroup.add(leg);
        });

        // Base clara na superfície da mesa para contraste máximo na Visão de Cima (Top-Down)
        const labMatPad = new THREE.Mesh(
            new THREE.BoxGeometry(2.95, 0.025, 1.65),
            new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 })
        );
        labMatPad.position.set(0, TABLE_SURFACE_Y + 0.012, 0);
        labMatPad.receiveShadow = true;
        tableGroup.add(labMatPad);

        /*************************************************************************
         * CONSTRUÇÃO DAS DUAS CÁPSULAS DE TELETRANSPORTE + PONTE QUÂNTICA
         *************************************************************************/
        const machineGroup = new THREE.Group();
        machineGroup.position.set(0, TABLE_SURFACE_Y + 0.02, 0);
        scene.add(machineGroup);

        const glassMatA = new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            roughness: 0.15,
            transparent: true,
            opacity: 0.10,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const glassMatB = new THREE.MeshPhysicalMaterial({
            color: 0x34d399,
            roughness: 0.15,
            transparent: true,
            opacity: 0.10,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const wireMatA = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.8 });
        const wireMatB = new THREE.LineBasicMaterial({ color: 0x059669, transparent: true, opacity: 0.8 });

        function createTeleportCapsule(xPos, accentHex, glassMat, wireMat) {
            const cap = new THREE.Group();
            cap.position.set(xPos, 0, 0);

            const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.5 });
            const accentMat = new THREE.MeshStandardMaterial({
                color: accentHex,
                emissive: accentHex,
                emissiveIntensity: 0.45,
                roughness: 0.25
            });

            // Pedestal inferior
            const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.58, 0.12, 32), baseMat);
            baseCyl.position.y = 0.06;
            cap.add(baseCyl);

            // Piso luminoso interno
            const innerPad = new THREE.Mesh(
                new THREE.CylinderGeometry(0.46, 0.46, 0.03, 32),
                new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: accentHex, emissiveIntensity: 0.25 })
            );
            innerPad.position.y = 0.13;
            cap.add(innerPad);

            // Anel superior aberto (para visão de cima 100% desobstruída!)
            const topRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.045, 16, 40), baseMat);
            topRing.rotation.x = Math.PI / 2;
            topRing.position.y = 1.28;
            cap.add(topRing);

            const topGlowRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 12, 40), accentMat);
            topGlowRing.rotation.x = Math.PI / 2;
            topGlowRing.position.y = 1.28;
            cap.add(topGlowRing);

            // Parede Cilíndrica Transparente Raio-X
            const glassGeo = new THREE.CylinderGeometry(0.50, 0.50, 1.14, 28, 1, true);
            const glassCyl = new THREE.Mesh(glassGeo, glassMat);
            glassCyl.position.y = 0.70;
            cap.add(glassCyl);

            const wireEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.505, 0.505, 1.14, 12)), wireMat);
            wireEdges.position.y = 0.70;
            cap.add(wireEdges);

            // Anel de Scanner Laser Móvel
            const scannerRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.43, 0.032, 16, 36),
                new THREE.MeshBasicMaterial({ color: accentHex })
            );
            scannerRing.rotation.x = Math.PI / 2;
            scannerRing.position.y = 1.18;
            cap.add(scannerRing);

            return { group: cap, scannerRing, innerPad };
        }

        const capA = createTeleportCapsule(-0.86, 0x22d3ee, glassMatA, wireMatA);
        const capB = createTeleportCapsule(0.86, 0x10b981, glassMatB, wireMatB);
        machineGroup.add(capA.group, capB.group);

        // Ponte Quântica Central (Cabo + Par de Átomos Emaranhados)
        const bridgeGroup = new THREE.Group();
        machineGroup.add(bridgeGroup);

        const cableMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
        const cableMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.82, 16), cableMat);
        cableMesh.rotation.z = Math.PI / 2;
        cableMesh.position.set(0, 0.12, 0);
        bridgeGroup.add(cableMesh);

        const coreBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.14, 24), cableMat);
        coreBase.position.set(0, 0.07, 0);
        bridgeGroup.add(coreBase);

        const quantumOrb = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 24, 24),
            new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.8, roughness: 0.15 })
        );
        quantumOrb.position.set(0, 0.36, 0);
        bridgeGroup.add(quantumOrb);

        const qRing1 = new THREE.Mesh(
            new THREE.TorusGeometry(0.23, 0.018, 12, 36),
            new THREE.MeshBasicMaterial({ color: 0x22d3ee })
        );
        qRing1.position.set(0, 0.36, 0);
        const qRing2 = new THREE.Mesh(
            new THREE.TorusGeometry(0.23, 0.018, 12, 36),
            new THREE.MeshBasicMaterial({ color: 0xf472b6 })
        );
        qRing2.position.set(0, 0.36, 0);
        qRing2.rotation.x = Math.PI / 2;
        bridgeGroup.add(qRing1, qRing2);

        // Pulsos de Luz (Dados Quânticos viajando de A para B)
        const dataPulses = [];
        for (let i = 0; i < 5; i++) {
            const p = new THREE.Mesh(
                new THREE.SphereGeometry(0.055, 14, 14),
                new THREE.MeshBasicMaterial({ color: 0xfde047 })
            );
            p.visible = false;
            machineGroup.add(p);
            dataPulses.push(p);
        }

        // Construtor do Personagem Viajante 3D (Estilizado e Expressivo)
        function createTravelerCharacter(jacketHex) {
            const root = new THREE.Group();
            const bodyPivot = new THREE.Group();
            root.add(bodyPivot);

            const skinMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.45 });
            const jacketMat = new THREE.MeshStandardMaterial({ color: jacketHex, roughness: 0.4 });
            const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
            const hairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

            // Pernas
            const legGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.28, 14);
            const leftLeg = new THREE.Mesh(legGeo, pantsMat);
            leftLeg.position.set(-0.09, 0.14, 0);
            const rightLeg = new THREE.Mesh(legGeo, pantsMat);
            rightLeg.position.set(0.09, 0.14, 0);
            bodyPivot.add(leftLeg, rightLeg);

            // Tronco (Jaqueta)
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.38, 20), jacketMat);
            torso.position.set(0, 0.44, 0);
            torso.castShadow = true;
            bodyPivot.add(torso);

            // Braços
            const armGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.30, 12);
            const leftArm = new THREE.Mesh(armGeo, jacketMat);
            leftArm.position.set(-0.22, 0.44, 0);
            leftArm.rotation.z = 0.18;
            const rightArm = new THREE.Mesh(armGeo, jacketMat);
            rightArm.position.set(0.22, 0.44, 0);
            rightArm.rotation.z = -0.18;
            bodyPivot.add(leftArm, rightArm);

            // Cabeça
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 0.78, 0);
            bodyPivot.add(headGroup);

            const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 24), skinMat);
            headMesh.castShadow = true;
            headGroup.add(headMesh);

            // Cabelo estilizado
            const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
            hairCap.position.y = 0.02;
            headGroup.add(hairCap);

            // Olhos expressivos
            const eyeGeo = new THREE.SphereGeometry(0.034, 12, 12);
            const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(-0.075, 0.02, 0.19);
            const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            rightEye.position.set(0.075, 0.02, 0.19);
            headGroup.add(leftEye, rightEye);

            return { root, bodyPivot, headGroup, rightArm, leftEye, rightEye };
        }

        const travelerA = createTravelerCharacter(0x0284c7); // Jaqueta Azul Ciano (Original)
        travelerA.root.position.set(-0.86, 0.14, 0);
        travelerA.root.rotation.y = 0.25;
        machineGroup.add(travelerA.root);

        const travelerB = createTravelerCharacter(0x059669); // Jaqueta Verde Esmeralda (Reconstruído / Clone)
        travelerB.root.position.set(0.86, 0.14, 0);
        travelerB.root.rotation.y = -0.25;
        travelerB.root.visible = false;
        machineGroup.add(travelerB.root);

        // Nuvem de Partículas Atômicas na Cápsula A (para o Ato 5)
        const atomParticlesA = new THREE.Group();
        atomParticlesA.position.set(-0.86, 0.55, 0);
        atomParticlesA.visible = false;
        machineGroup.add(atomParticlesA);
        for (let i = 0; i < 22; i++) {
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(0.038, 10, 10),
                new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x22d3ee : 0xfde047 })
            );
            const angle = (i / 22) * Math.PI * 4;
            const r = 0.12 + (i % 3) * 0.08;
            orb.position.set(Math.cos(angle) * r, (i / 22 - 0.5) * 0.75, Math.sin(angle) * r);
            atomParticlesA.add(orb);
        }

        function getTargetWorldPosition(targetName) {
            const v = new THREE.Vector3();
            switch (targetName) {
                case 'capA':
                    return v.set(-0.86, TABLE_SURFACE_Y + 1.08, 0);
                case 'scannerA':
                    return v.set(-0.86, TABLE_SURFACE_Y + 0.95, 0);
                case 'capB':
                    return v.set(0.86, TABLE_SURFACE_Y + 1.08, 0);
                case 'bridge':
                    return v.set(0.0, TABLE_SURFACE_Y + 0.58, 0);
                default:
                    return v.set(0.0, TABLE_SURFACE_Y + 0.95, 0);
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
            const clampedX = Math.max(85, Math.min(w - 85, x));
            const clampedY = Math.max(88, Math.min(h - 165, y));
            pinElement.style.left = \`\${clampedX}px\`;
            pinElement.style.top = \`\${clampedY}px\`;
        }

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

        function evaluateAndRenderAtTime(t) {
            if (t >= TOTAL_DURATION) {
                elapsedVideoTime = 0.0;
                t = 0.0;
                if (masterAudio) masterAudio.currentTime = 0;
            }

            let activeIdx = 0;
            for (let i = 0; i < BEATS.length; i++) {
                if (t >= BEATS[i].start && t < BEATS[i].end) {
                    activeIdx = i;
                    break;
                }
            }
            const activeBeat = BEATS[activeIdx];
            const prevBeat = activeIdx > 0 ? BEATS[activeIdx - 1] : activeBeat;

            const TRANSITION_DUR = 1.35;
            const timeInBeat = Math.max(0, t - activeBeat.start);
            const u = activeIdx === 0 ? 1.0 : easeInOutCubic(Math.min(1.0, timeInBeat / TRANSITION_DUR));

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

            // Câmera suave + updateMatrixWorld obrigatório para alinhar pins 3D
            lerpVec3(prevBeat.camPos, activeBeat.camPos, u, evalCamPos);
            lerpVec3(prevBeat.camLook, activeBeat.camLook, u, evalCamLook);
            const gentleSwayX = Math.sin(t * 0.35) * 0.025;
            const gentleSwayY = Math.cos(t * 0.28) * 0.015;
            camera.position.set(evalCamPos.x + gentleSwayX, evalCamPos.y + gentleSwayY, evalCamPos.z);
            camera.lookAt(evalCamLook);
            camera.updateMatrixWorld();

            // Opacidade Raio-X das cápsulas
            const smoothGlassOp = lerpNum(prevBeat.glassOpacity, activeBeat.glassOpacity, u);
            const smoothWireOp = lerpNum(prevBeat.wireOpacity, activeBeat.wireOpacity, u);
            glassMatA.opacity = smoothGlassOp;
            glassMatB.opacity = smoothGlassOp;
            wireMatA.opacity = smoothWireOp;
            wireMatB.opacity = smoothWireOp;

            // Rotação calma do núcleo de emaranhamento quântico
            qRing1.rotation.z = t * 1.1;
            qRing2.rotation.y = t * 0.9;
            const orbScale = 1.0 + Math.sin(t * 2.2) * 0.06;
            quantumOrb.scale.set(orbScale, orbScale, orbScale);

            // Estados narrativos de cada Ato
            const mode = activeBeat.mode;
            const beatProgress = Math.min(1.0, timeInBeat / Math.max(1.0, activeBeat.end - activeBeat.start));

            // Reset padrão
            capA.scannerRing.position.y = 1.18;
            capB.scannerRing.position.y = 1.18;
            atomParticlesA.visible = false;
            dataPulses.forEach(p => { p.visible = false; });
            travelerA.root.scale.set(1, 1, 1);
            travelerB.root.scale.set(1, 1, 1);
            travelerA.headGroup.rotation.y = Math.sin(t * 0.85) * 0.16;
            travelerB.headGroup.rotation.y = Math.sin(t * 0.85 + 1.0) * 0.16;

            if (mode === 'intro' || mode === 'ready') {
                travelerA.root.visible = true;
                travelerB.root.visible = false;
            } else if (mode === 'scanning') {
                travelerA.root.visible = true;
                travelerB.root.visible = false;
                // Anel laser desce e sobe suavemente escaneando o corpo
                capA.scannerRing.position.y = 0.68 + Math.cos(beatProgress * Math.PI * 2) * 0.45;
            } else if (mode === 'transmitting') {
                travelerA.root.visible = true;
                travelerB.root.visible = false;
                dataPulses.forEach((p, idx) => {
                    p.visible = true;
                    const prog = (beatProgress * 1.6 + idx * 0.2) % 1.0;
                    p.position.set(-0.75 + prog * 1.50, 0.22 + Math.sin(prog * Math.PI) * 0.22, 0);
                });
            } else if (mode === 'dissolvingA') {
                travelerA.root.visible = beatProgress < 0.45;
                if (travelerA.root.visible) {
                    const s = Math.max(0.1, 1.0 - beatProgress * 1.8);
                    travelerA.root.scale.set(s, s, s);
                }
                atomParticlesA.visible = true;
                atomParticlesA.rotation.y = t * 0.9;
                travelerB.root.visible = false;
            } else if (mode === 'rebuildingB') {
                travelerA.root.visible = false;
                travelerB.root.visible = true;
                const s = Math.min(1.0, 0.25 + beatProgress * 1.1);
                travelerB.root.scale.set(s, s, s);
                capB.scannerRing.position.y = 0.20 + beatProgress * 0.98;
            } else if (mode === 'arrivedB' || mode === 'printer') {
                travelerA.root.visible = false;
                travelerB.root.visible = true;
            } else if (mode === 'glitchBoth' || mode === 'twoTwins' || mode === 'paradox' || mode === 'outro') {
                // O Paradoxo em Visão de Cima: OS DOIS existem ao mesmo tempo!
                travelerA.root.visible = true;
                travelerB.root.visible = true;
                travelerA.headGroup.rotation.y = 0.45;  // Olhando para a Cápsula B
                travelerB.headGroup.rotation.y = -0.45; // Olhando para a Cápsula A
            }

            if (activeBeat.pin1) {
                const pos1 = getTargetWorldPosition(activeBeat.pin1.target);
                project3DPinToScreen(pos1, pinPrimary);
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
console.log(`✅ Novo arquivo HTML (Vídeo #2) criado em: ${DOWNLOAD_PATH}`);

fs.writeFileSync(LOCAL_PATH, htmlContent, 'utf8');
console.log(`✅ Cópia no projeto salva em: ${LOCAL_PATH}`);
