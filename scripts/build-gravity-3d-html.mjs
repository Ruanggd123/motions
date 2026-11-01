import { readFileSync, writeFileSync } from 'node:fs';

const timingData = JSON.parse(readFileSync('src/gravidadeTiming.json', 'utf8'));
const audioBase64 = readFileSync('output/gravidade_audio.mp3').toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;

const tb = timingData.beats;

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
            background-color: #020617;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12);
            border-radius: 28px;
            transition: background-color 0.8s ease;
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

        .top-scrim {
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.45) 55%, transparent 100%);
        }

        .bottom-scrim {
            background: linear-gradient(0deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.65) 55%, transparent 100%);
        }

        @keyframes scriptPopIn {
            0% { opacity: 0; transform: translateY(8px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .script-animate {
            animation: scriptPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .kw-badge {
            display: inline-block;
            padding: 1px 7px;
            border-radius: 6px;
            font-weight: 800;
            letter-spacing: -0.01em;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .kw-green {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            border: 1px solid #34d399;
        }

        .kw-yellow {
            background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
            color: #0f172a;
            border: 1px solid #fde68a;
        }

        .kw-cyan {
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            color: #ffffff;
            border: 1px solid #67e8f9;
        }

        .kw-orange {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: #ffffff;
            border: 1px solid #fdba74;
        }

        .kw-magenta {
            background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
            color: #ffffff;
            border: 1px solid #f472b6;
        }

        .kw-white {
            background: #ffffff;
            color: #0f172a;
        }

        /* PINS 3D ANTI-FLICKER ENGINE COM HARDWARE ACCELERATION */
        .callout-pin {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 15;
            pointer-events: none;
            will-change: transform, opacity;
            display: flex;
            flex-direction: column;
            align-items: center;
            opacity: 0;
            transform: translate3d(-50%, -100%, 0);
        }

        .callout-bubble {
            padding: 6px 14px;
            border-radius: 9999px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 11.5px;
            font-weight: 800;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            white-space: nowrap;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .callout-stem {
            width: 2.5px;
            height: 18px;
            background: currentColor;
            opacity: 0.9;
        }

        .callout-dot {
            width: 8px;
            height: 8px;
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
                    <span id="beat-dot" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span id="beat-tag" class="text-[11px] font-extrabold tracking-wider text-white uppercase font-['Space_Grotesk']">
                        1. MANHÃ NO PARQUE
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

        <!-- 3D CALLOUT PINS (ANTI-FLICKER HARDWARE ACCELERATED) -->
        <div id="pin-primary" class="callout-pin">
            <div id="pin-primary-bubble" class="callout-bubble bg-amber-300 text-slate-950 border-2 border-white">
                <span id="pin-primary-icon">☕</span>
                <span id="pin-primary-text">Café Matinal</span>
            </div>
            <div id="pin-primary-stem" class="callout-stem text-amber-300"></div>
            <div id="pin-primary-dot" class="callout-dot text-amber-300"></div>
        </div>

        <div id="pin-secondary" class="callout-pin">
            <div id="pin-secondary-bubble" class="callout-bubble bg-cyan-300 text-slate-950 border-2 border-white">
                <span id="pin-secondary-icon">🧍</span>
                <span id="pin-secondary-text">Passeio Tranquilo</span>
            </div>
            <div id="pin-secondary-stem" class="callout-stem text-cyan-300"></div>
            <div id="pin-secondary-dot" class="callout-dot text-cyan-300"></div>
        </div>

        <!-- PAUSE FEEDBACK -->
        <div id="pause-indicator" class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
            <div class="w-16 h-16 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-2xl">
                <svg id="pause-svg" class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
            </div>
        </div>

        <!-- BOTTOM SYNCHRONIZED SCRIPT OVERLAY -->
        <div class="absolute bottom-5 left-3.5 right-3.5 z-20 pointer-events-none flex flex-col items-center">
            <div id="script-card" class="w-full rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/20 px-4 py-4 shadow-2xl text-center">
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
                tag: "1. PASSEIO MATINAL",
                dotColor: "#4ade80",
                html: \`Imagine você <span class="kw-badge kw-green">CAMINHANDO TRANQUILAMENTE</span> por um parque bonito em uma manhã de sol...\`,
                camPos: [0.0, 2.7, 5.6],
                camLook: [0.0, 1.25, 0.0],
                mode: "walking",
                pin1: { text: "Café Quente", icon: "☕", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" },
                pin2: { text: "Passeio Matinal", icon: "🌳", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "charHead" }
            },
            {
                id: 1,
                start: ${tb[1].start},
                end: ${tb[1].end},
                tag: "2. O APAGÃO GRAVITACIONAL",
                dotColor: "#fb923c",
                html: \`Mas do nada, uma anomalia cósmica <span class="kw-badge kw-orange">DESLIGA A GRAVIDADE</span> da Terra por apenas <span class="kw-badge kw-yellow">5 SEGUNDOS</span>!\`,
                camPos: [0.35, 2.5, 4.4],
                camLook: [0.0, 1.25, 0.0],
                mode: "alert",
                pin1: { text: "Gravidade: OFF!", icon: "⚠️", style: "bg-orange-400 text-slate-950", stem: "text-orange-400", target: "charHead" },
                pin2: null
            },
            {
                id: 2,
                start: ${tb[2].start},
                end: ${tb[2].end},
                tag: "3. O CAFÉ FLUTUA!",
                dotColor: "#fbbf24",
                html: \`No primeiro segundo, o <span class="kw-badge kw-yellow">CAFÉ NA SUA MÃO</span> e as folhas do chão começam a <span class="kw-badge kw-cyan">FLUTUAR NO AR</span>.\`,
                camPos: [0.30, 2.2, 3.4],
                camLook: [0.12, 1.30, 0.0],
                mode: "floatStart",
                pin1: { text: "Líquido em Gravidade Zero", icon: "💧", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" },
                pin2: { text: "Flutuação Inicial", icon: "👟", style: "bg-cyan-300 text-slate-950", stem: "text-cyan-300", target: "charFeet" }
            },
            {
                id: 3,
                start: ${tb[3].start},
                end: ${tb[3].end},
                tag: "4. PÉS SOLTOS DO CHÃO",
                dotColor: "#22d3ee",
                html: \`No segundo seguinte, <span class="kw-badge kw-cyan">SEUS PÉS PERDEM O CHÃO</span> e você começa a subir sem conseguir se segurar!\`,
                camPos: [0.0, 3.0, 4.5],
                camLook: [0.0, 1.85, 0.0],
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
                camPos: [0.0, 4.2, 4.8],
                camLook: [0.0, 2.4, 0.0],
                mode: "risingFast",
                pin1: { text: "Inércia Rotacional", icon: "🌪️", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "charHead" },
                pin2: null
            },
            {
                id: 5,
                start: ${tb[5].start},
                end: ${tb[5].end},
                tag: "6. PRAÇA NO ESPAÇO",
                dotColor: "#38bdf8",
                html: \`<span class="kw-badge kw-yellow">BANCOS DE PRAÇA</span>, hidrantes e carros flutuam como se estivessem no meio do <span class="kw-badge kw-cyan">ESPAÇO SIDERAL</span>.\`,
                camPos: [0.0, 3.8, 5.2],
                camLook: [0.0, 2.6, 0.0],
                mode: "fullZeroG",
                pin1: { text: "Banco Flutuando!", icon: "🪑", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "bench" },
                pin2: { text: "Hidrante Solto!", icon: "🚒", style: "bg-red-400 text-slate-950", stem: "text-red-400", target: "hydrant" }
            },
            {
                id: 6,
                start: ${tb[6].start},
                end: ${tb[6].end},
                tag: "7. O VÁCUO DA ATMOSFERA",
                dotColor: "#a855f7",
                html: \`A atmosfera também começaria a escapar, criando uma <span class="kw-badge kw-magenta">QUEDA VIOLENTA</span> na pressão do ar!\`,
                camPos: [-0.4, 3.6, 4.6],
                camLook: [0.0, 2.6, 0.0],
                mode: "vacuumPanic",
                pin1: { text: "Pressão Despencando!", icon: "💨", style: "bg-purple-300 text-slate-950", stem: "text-purple-300", target: "charHead" },
                pin2: null
            },
            {
                id: 7,
                start: ${tb[7].start},
                end: ${tb[7].end},
                tag: "8. A ALTURA MÁXIMA",
                dotColor: "#fde047",
                html: \`Você flutua a vários metros de altura, vendo o <span class="kw-badge kw-yellow">CHÃO SE AFASTAR</span> sob os seus pés!\`,
                camPos: [0.0, 4.6, 3.8],
                camLook: [0.0, 2.6, -1.0],
                mode: "apexHeight",
                pin1: { text: "Altitude Máxima: 8 Metros!", icon: "☁️", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "charHead" },
                pin2: null
            },
            {
                id: 8,
                start: ${tb[8].start},
                end: ${tb[8].end},
                tag: "9. A GRAVIDADE RELIGA!",
                dotColor: "#ef4444",
                html: \`A contagem chega ao fim e, de repente, a gravidade é <span class="kw-badge kw-orange">RELIGADA COM FORÇA TOTAL</span>!\`,
                camPos: [0.0, 4.2, 5.0],
                camLook: [0.0, 2.0, 0.0],
                mode: "gravitySnap",
                pin1: { text: "GRAVIDADE: ON!", icon: "⚡", style: "bg-red-400 text-slate-950", stem: "text-red-400", target: "charHead" },
                pin2: null
            },
            {
                id: 9,
                start: ${tb[9].start},
                end: ${tb[9].end},
                tag: "10. QUEDA LIVRE ACELERADA",
                dotColor: "#fb923c",
                html: \`Tudo o que subiu <span class="kw-badge kw-magenta">DESABA EM QUEDA LIVRE</span> acelerada de volta em direção ao solo!\`,
                camPos: [0.0, 3.4, 4.6],
                camLook: [0.0, 1.4, 0.0],
                mode: "fallingFast",
                pin1: { text: "Queda a 180 km/h!", icon: "⬇️", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "charHead" },
                pin2: null
            },
            {
                id: 10,
                start: ${tb[10].start},
                end: ${tb[10].end},
                tag: "11. POUSO NA GRAMA MACIA",
                dotColor: "#4ade80",
                html: \`Você despenca na <span class="kw-badge kw-green">GRAMA MACIA</span>, fazendo um pouso desajeitado mas <span class="kw-badge kw-white">ESCAPANDO COM VIDA</span>!\`,
                camPos: [0.0, 2.1, 3.8],
                camLook: [0.0, 0.85, 0.0],
                mode: "springLanding",
                pin1: { text: "Pouso Amortecido!", icon: "🌱", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "charHead" },
                pin2: { text: "Café Salvo!", icon: "☕", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" }
            },
            {
                id: 11,
                start: ${tb[11].start},
                end: ${tb[11].end},
                tag: "12. CONCLUSÃO",
                dotColor: "#facc15",
                html: \`Esse é o perigo da gravidade: cinco segundos causariam o caos. <span class="kw-badge kw-yellow">VOCÊ TERIA CORAGEM</span> de encarar?\`,
                camPos: [0.0, 2.6, 5.2],
                camLook: [0.0, 1.25, 0.0],
                mode: "celebrate",
                pin1: { text: "Você Sobreviveria?", icon: "🤔", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "charHead" },
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
        // Paleta Cinematográfica e Descansada para os Olhos (Azul Safira / Ardósia Profundo — Adeus Branco Estourado)
        const SKY_DAY_COLOR = 0x1e385c;
        scene.background = new THREE.Color(SKY_DAY_COLOR);
        scene.fog = new THREE.Fog(SKY_DAY_COLOR, 16, 42);

        const camera = new THREE.PerspectiveCamera(40, viewport.clientWidth / viewport.clientHeight, 0.1, 100);

        // RENDERER COM EXPOSURE BALANCEADO (0.90 — CONFORTO VISUAL PREMIUM)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.90;
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

        // Iluminação Balanceada Cinematográfica (Sombras Ricas, Zero Superexposição)
        const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x14532d, 0.42);
        hemiLight.position.set(0, 15, 0);
        scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xffeedd, 1.15);
        sunLight.position.set(5.5, 11, 6.5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 30;
        const d = 8;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.0004;
        scene.add(sunLight);

        // =========================================================================
        // GERADORES DE TEXTURAS PROCEDURAIS RICAS (100% OFFLINE VIA CANVAS)
        // =========================================================================
        function createGrassCanvasTexture() {
            const c = document.createElement('canvas');
            c.width = 512; c.height = 512;
            const ctx = c.getContext('2d');
            // Base verde floresta profundo aveludado
            ctx.fillStyle = '#1b4d29';
            ctx.fillRect(0, 0, 512, 512);
            // Manchas de relevo e musgo
            for (let i = 0; i < 1500; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const r = 3 + Math.random() * 6;
                ctx.fillStyle = Math.random() > 0.5 ? '#246336' : (Math.random() > 0.3 ? '#153d20' : '#2e7a44');
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            // Lâminas de grama finas com variação natural
            ctx.lineWidth = 1.6;
            for (let i = 0; i < 4500; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const len = 4 + Math.random() * 8;
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
                ctx.strokeStyle = Math.random() > 0.6 ? '#389e57' : (Math.random() > 0.3 ? '#236337' : '#143c1f');
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
                ctx.stroke();
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(8, 8);
            return tex;
        }

        function createCobblestoneCanvasTexture() {
            const c = document.createElement('canvas');
            c.width = 512; c.height = 512;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#1c2638'; // Rejunte escuro
            ctx.fillRect(0, 0, 512, 512);
            const rows = 10;
            const cols = 6;
            const rw = 512 / cols;
            const rh = 512 / rows;
            for (let r = 0; r < rows; r++) {
                for (let col = 0; col < cols; col++) {
                    const offset = (r % 2 === 0) ? 0 : rw * 0.48;
                    const x = ((col * rw + offset) % 512) + 3;
                    const y = r * rh + 3;
                    const w = rw - 6;
                    const h = rh - 6;
                    const shade = 72 + Math.floor(Math.random() * 32);
                    ctx.fillStyle = 'rgb(' + (shade + 4) + ', ' + (shade + 8) + ', ' + (shade + 14) + ')';
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, 6);
                    ctx.fill();
                    // Chanfro e luz superior suave
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
                    ctx.fillRect(x + 2, y + 2, w - 4, 3);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
                    ctx.fillRect(x + 2, y + h - 5, w - 4, 3);
                }
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(2, 8);
            return tex;
        }

        function createBarkCanvasTexture() {
            const c = document.createElement('canvas');
            c.width = 256; c.height = 512;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#2f1e14';
            ctx.fillRect(0, 0, 256, 512);
            for (let x = 0; x < 256; x += 4) {
                const shade = 40 + Math.floor(Math.random() * 35);
                ctx.strokeStyle = 'rgb(' + (shade + 20) + ', ' + (shade + 8) + ', ' + shade + ')';
                ctx.lineWidth = 2 + Math.random() * 3;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                for (let y = 0; y <= 512; y += 32) {
                    ctx.lineTo(x + (Math.random() - 0.5) * 6, y);
                }
                ctx.stroke();
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 3);
            return tex;
        }

        function createWoodPlankCanvasTexture() {
            const c = document.createElement('canvas');
            c.width = 512; c.height = 128;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#6b3e14';
            ctx.fillRect(0, 0, 512, 128);
            for (let y = 0; y < 128; y += 3) {
                const shade = 80 + Math.floor(Math.random() * 45);
                ctx.strokeStyle = 'rgb(' + (shade + 38) + ', ' + (shade + 12) + ', 16)';
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(512, y + (Math.random() - 0.5) * 3);
                ctx.stroke();
            }
            const tex = new THREE.CanvasTexture(c);
            return tex;
        }

        function createFabricCanvasTexture() {
            const c = document.createElement('canvas');
            c.width = 256; c.height = 256;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(0, 0, 256, 256);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.22;
            for (let i = 0; i < 256; i += 4) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(5, 5);
            return tex;
        }

        const grassTex = createGrassCanvasTexture();
        const cobblestoneTex = createCobblestoneCanvasTexture();
        const barkTex = createBarkCanvasTexture();
        const woodPlankTex = createWoodPlankCanvasTexture();
        const fabricTex = createFabricCanvasTexture();

        // =========================================================================
        // PERSONAGEM ESTILIZADO DE ALTA FIDELIDADE (PIXAR / CHIBI STREETWEAR)
        // =========================================================================
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd5b5, roughness: 0.45, metalness: 0.04 });
        const blushMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, transparent: true, opacity: 0.38, roughness: 0.6 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x24140c, roughness: 0.32, metalness: 0.1 });
        const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, map: fabricTex, roughness: 0.72, metalness: 0.05 });
        const hoodieTrimMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.82 });
        const cordMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
        const agletMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.78 });
        const sneakerSoleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
        const sneakerAccentMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 });
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05 });
        const irisMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.1 });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0f1d });
        const specularSparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyebrowMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.4 });
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
        const mugCeramicMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.05 });
        const coffeeLiquidMat = new THREE.MeshStandardMaterial({ color: 0x2b1304, roughness: 0.15 });
        const latteArtMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.3 });

        const charRoot = new THREE.Group();
        charRoot.position.set(0, 0, 0);
        scene.add(charRoot);

        const charPivot = new THREE.Group();
        charRoot.add(charPivot);

        // Pelvis & Tronco
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.72;
        charPivot.add(pelvis);

        const torso = new THREE.Group();
        pelvis.add(torso);

        const hoodieBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.52, 24), hoodieMat);
        hoodieBody.position.y = 0.26;
        hoodieBody.castShadow = true;
        hoodieBody.receiveShadow = true;
        torso.add(hoodieBody);

        const waistRib = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.07, 24), hoodieTrimMat);
        waistRib.position.y = 0.02;
        torso.add(waistRib);

        const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.12), hoodieMat);
        pouch.position.set(0, 0.18, 0.20);
        pouch.rotation.x = -0.08;
        torso.add(pouch);

        const hoodDrape = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65), hoodieMat);
        hoodDrape.position.set(0, 0.46, -0.16);
        hoodDrape.rotation.x = 2.2;
        torso.add(hoodDrape);

        function createDrawstring(xPos) {
            const cordGroup = new THREE.Group();
            cordGroup.position.set(xPos, 0.44, 0.24);
            const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), cordMat);
            cord.position.y = -0.11;
            cordGroup.add(cord);
            const aglet = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 8), agletMat);
            aglet.position.y = -0.23;
            cordGroup.add(aglet);
            return cordGroup;
        }
        torso.add(createDrawstring(-0.07));
        torso.add(createDrawstring(0.07));

        // Cabeça & Rosto
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.10, 16), skinMat);
        neck.position.y = 0.54;
        torso.add(neck);

        const headGroup = new THREE.Group();
        headGroup.position.y = 0.72;
        torso.add(headGroup);

        const headGeo = new THREE.SphereGeometry(0.32, 28, 28);
        headGeo.scale(1.0, 1.08, 1.02);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Bochechas
        const blushGeo = new THREE.SphereGeometry(0.075, 12, 12);
        blushGeo.scale(1, 0.5, 0.3);
        const leftBlush = new THREE.Mesh(blushGeo, blushMat);
        leftBlush.position.set(-0.19, -0.05, 0.26);
        headGroup.add(leftBlush);
        const rightBlush = new THREE.Mesh(blushGeo, blushMat);
        rightBlush.position.set(0.19, -0.05, 0.26);
        headGroup.add(rightBlush);

        // Orelhas
        const earGeo = new THREE.SphereGeometry(0.07, 12, 12);
        earGeo.scale(0.5, 1, 0.7);
        const leftEar = new THREE.Mesh(earGeo, skinMat);
        leftEar.position.set(-0.33, 0.02, 0.0);
        headGroup.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, skinMat);
        rightEar.position.set(0.33, 0.02, 0.0);
        headGroup.add(rightEar);

        // Cabelo
        const hairGroup = new THREE.Group();
        headGroup.add(hairGroup);
        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
        hairCap.position.set(0, 0.06, -0.02);
        hairGroup.add(hairCap);
        for (let i = -2; i <= 2; i++) {
            const lock = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), hairMat);
            lock.position.set(i * 0.09, 0.28, 0.25 - Math.abs(i) * 0.03);
            lock.rotation.set(0.65, 0, i * -0.22);
            hairGroup.add(lock);
        }

        // Olhos Expressivos
        function createEye(isLeft) {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(isLeft ? -0.12 : 0.12, 0.05, 0.27);
            const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), eyeWhiteMat);
            sclera.scale.set(0.85, 1.15, 0.5);
            eyeGroup.add(sclera);
            const iris = new THREE.Mesh(new THREE.CircleGeometry(0.046, 16), irisMat);
            iris.position.set(0, 0, 0.038);
            eyeGroup.add(iris);
            const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), pupilMat);
            pupil.position.set(0, 0, 0.040);
            eyeGroup.add(pupil);
            const spark1 = new THREE.Mesh(new THREE.CircleGeometry(0.014, 10), specularSparkMat);
            spark1.position.set(0.016, 0.016, 0.042);
            eyeGroup.add(spark1);
            const spark2 = new THREE.Mesh(new THREE.CircleGeometry(0.007, 8), specularSparkMat);
            spark2.position.set(-0.014, -0.014, 0.042);
            eyeGroup.add(spark2);
            return eyeGroup;
        }
        const leftEye = createEye(true);
        const rightEye = createEye(false);
        headGroup.add(leftEye);
        headGroup.add(rightEye);

        // Sobrancelhas Articuladas
        function createBrow(isLeft) {
            const browGroup = new THREE.Group();
            browGroup.position.set(isLeft ? -0.13 : 0.13, 0.17, 0.28);
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.024, 0.03), eyebrowMat);
            browGroup.add(brow);
            return browGroup;
        }
        const leftEyebrow = createBrow(true);
        const rightEyebrow = createBrow(false);
        headGroup.add(leftEyebrow);
        headGroup.add(rightEyebrow);

        // Boca Expressiva
        const mouthMesh = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 18, Math.PI), mouthMat);
        mouthMesh.rotation.z = Math.PI;
        mouthMesh.position.set(0, -0.10, 0.28);
        headGroup.add(mouthMesh);

        // Braços
        function createArm(isLeft) {
            const armPivot = new THREE.Group();
            const sideSign = isLeft ? -1 : 1;
            armPivot.position.set(sideSign * 0.30, 0.45, 0.0);
            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.26, 12), hoodieMat);
            upperArm.position.y = -0.13;
            armPivot.add(upperArm);
            const forearmPivot = new THREE.Group();
            forearmPivot.position.y = -0.26;
            armPivot.add(forearmPivot);
            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.060, 0.24, 12), hoodieMat);
            forearm.position.y = -0.12;
            forearmPivot.add(forearm);
            const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.045, 12), hoodieTrimMat);
            cuff.position.y = -0.22;
            forearmPivot.add(cuff);
            const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
            hand.scale.set(0.85, 1.1, 0.85);
            hand.position.y = -0.27;
            forearmPivot.add(hand);
            return { armPivot, forearmPivot, hand };
        }
        const leftArm = createArm(true);
        const rightArm = createArm(false);
        torso.add(leftArm.armPivot);
        torso.add(rightArm.armPivot);

        // Caneca de Café com Latte Art
        const mugGroup = new THREE.Group();
        rightArm.hand.add(mugGroup);
        mugGroup.position.set(0.06, -0.04, 0.08);
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.12, 16), mugCeramicMat);
        mug.castShadow = true;
        mugGroup.add(mug);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 8, 16, Math.PI * 1.2), mugCeramicMat);
        handle.position.set(0.07, 0, 0);
        handle.rotation.y = Math.PI / 2;
        mugGroup.add(handle);
        const coffeeLiquid = new THREE.Mesh(new THREE.CircleGeometry(0.058, 16), coffeeLiquidMat);
        coffeeLiquid.position.y = 0.058;
        coffeeLiquid.rotation.x = -Math.PI / 2;
        mugGroup.add(coffeeLiquid);
        const latteArt = new THREE.Mesh(new THREE.CircleGeometry(0.024, 12), latteArtMat);
        latteArt.position.set(0, 0.059, 0);
        latteArt.rotation.x = -Math.PI / 2;
        mugGroup.add(latteArt);

        // Pernas & Tênis Chunky
        function createLeg(isLeft) {
            const legPivot = new THREE.Group();
            const sideSign = isLeft ? -1 : 1;
            legPivot.position.set(sideSign * 0.13, 0.0, 0.0);
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.34, 14), pantsMat);
            thigh.position.y = -0.17;
            thigh.castShadow = true;
            legPivot.add(thigh);
            const shinPivot = new THREE.Group();
            shinPivot.position.y = -0.34;
            legPivot.add(shinPivot);
            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.070, 0.32, 14), pantsMat);
            shin.position.y = -0.16;
            shin.castShadow = true;
            shinPivot.add(shin);
            const pantCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.05, 14), pantsMat);
            pantCuff.position.y = -0.30;
            shinPivot.add(pantCuff);

            const sneakerGroup = new THREE.Group();
            sneakerGroup.position.set(0, -0.33, 0.04);
            shinPivot.add(sneakerGroup);
            const sole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.065, 0.25), sneakerSoleMat);
            sole.castShadow = true;
            sole.receiveShadow = true;
            sneakerGroup.add(sole);
            const upper = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.085, 0.22), sneakerAccentMat);
            upper.position.set(0, 0.065, -0.01);
            sneakerGroup.add(upper);
            const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.065, 12, 1, false, 0, Math.PI), sneakerSoleMat);
            toe.position.set(0, 0.04, 0.08);
            toe.rotation.x = Math.PI / 2;
            sneakerGroup.add(toe);

            return { legPivot, shinPivot, sneakerGroup };
        }
        const leftLeg = createLeg(true);
        const rightLeg = createLeg(false);
        pelvis.add(leftLeg.legPivot);
        pelvis.add(rightLeg.legPivot);

        // =========================================================================
        // AMBIENTE DINÂMICO: PARQUE ENSOLARADO E ESPAÇO CÓSMICO
        // =========================================================================
        const parkGroup = new THREE.Group();
        scene.add(parkGroup);

        const spaceGroup = new THREE.Group();
        spaceGroup.visible = false;
        scene.add(spaceGroup);

        // Chão de grama com textura procedural de alta fidelidade
        const groundMat = new THREE.MeshStandardMaterial({
            map: grassTex,
            roughness: 0.88,
            color: 0x22c55e
        });
        const ground = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.6, 64), groundMat);
        ground.position.y = -0.3;
        ground.receiveShadow = true;
        parkGroup.add(ground);

        // Colinas de fundo em camadas (Profundidade de Campo)
        const hillMat1 = new THREE.MeshStandardMaterial({ map: grassTex, color: 0x166534, roughness: 0.92 });
        const hillMat2 = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 });
        const hill1 = new THREE.Mesh(new THREE.SphereGeometry(8, 24, 24), hillMat1);
        hill1.position.set(-9, -4.5, -8);
        parkGroup.add(hill1);
        const hill2 = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 24), hillMat2);
        hill2.position.set(8.5, -5.2, -10);
        parkGroup.add(hill2);

        // Silhuetas de Pinheiros distantes nas colinas
        for (let p = 0; p < 8; p++) {
            const pine = new THREE.Mesh(
                new THREE.ConeGeometry(0.35 + Math.random() * 0.2, 1.4 + Math.random() * 0.5, 6),
                new THREE.MeshStandardMaterial({ color: 0x0f2e1b, roughness: 0.95 })
            );
            const px = -8 + p * 2.2 + (Math.random() - 0.5) * 0.6;
            const pz = -7.5 - Math.random() * 2.5;
            pine.position.set(px, 1.2 + Math.sin(p * 0.8) * 0.4, pz);
            parkGroup.add(pine);
        }

        // Cerca rústica de madeira na colina do fundo
        const fenceMat = new THREE.MeshStandardMaterial({ map: woodPlankTex, roughness: 0.85 });
        for (let f = -5; f <= 5; f++) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 8), fenceMat);
            const fx = f * 0.7;
            const fz = -3.8 - Math.sin(f * 0.3) * 0.5;
            post.position.set(fx, 0.35, fz);
            post.castShadow = true;
            parkGroup.add(post);
            if (f < 5) {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.03), fenceMat);
                rail.position.set(fx + 0.35, 0.52, fz);
                parkGroup.add(rail);
                const railLow = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.03), fenceMat);
                railLow.position.set(fx + 0.35, 0.25, fz);
                parkGroup.add(railLow);
            }
        }

        // Caminho Sinuoso de Pedras Texturizado (Cobblestone Path)
        const pathMat = new THREE.MeshStandardMaterial({
            map: cobblestoneTex,
            roughness: 0.82,
            metalness: 0.05
        });
        const pathSegments = 24;
        for (let i = -10; i <= 13; i++) {
            const curveX = Math.sin(i * 0.22) * 0.35;
            const slab = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.035, 0.55), pathMat);
            slab.position.set(curveX, 0.018, i * 0.48);
            slab.rotation.y = Math.cos(i * 0.22) * 0.12;
            slab.receiveShadow = true;
            parkGroup.add(slab);

            // Meio-fio suave de pedras naturais nas bordas
            const kerbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
            const kerbL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.48), kerbMat);
            kerbL.position.set(curveX - 0.72, 0.025, i * 0.48);
            kerbL.receiveShadow = true;
            parkGroup.add(kerbL);
            const kerbR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.48), kerbMat);
            kerbR.position.set(curveX + 0.72, 0.025, i * 0.48);
            kerbR.receiveShadow = true;
            parkGroup.add(kerbR);
        }

        // Arbustos Volumétricos Estilizados (Buchinhos)
        const bushMat1 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
        const bushMat2 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.82 });
        function createBush(x, z, r = 0.5) {
            const bGroup = new THREE.Group();
            bGroup.position.set(x, 0, z);
            const b1 = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), bushMat1);
            b1.position.y = r * 0.8; b1.castShadow = true; bGroup.add(b1);
            const b2 = new THREE.Mesh(new THREE.SphereGeometry(r * 0.75, 12, 12), bushMat2);
            b2.position.set(r * 0.4, r * 0.7, r * 0.3); b2.castShadow = true; bGroup.add(b2);
            return bGroup;
        }
        parkGroup.add(createBush(-1.8, -0.6, 0.48));
        parkGroup.add(createBush(-2.2, 0.8, 0.55));
        parkGroup.add(createBush(2.1, -1.2, 0.52));
        parkGroup.add(createBush(2.3, 1.8, 0.45));
        parkGroup.add(createBush(1.1, -2.6, 0.4));

        // Canteiros de Flores Silvestres Coloridas
        const flowerPetalMatW = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
        const flowerPetalMatY = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
        const flowerPetalMatP = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.5 });
        const flowerCenterMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

        function createFlowerPatch(cx, cz, count = 6) {
            const patch = new THREE.Group();
            patch.position.set(cx, 0, cz);
            for (let f = 0; f < count; f++) {
                const fx = (Math.random() - 0.5) * 0.6;
                const fz = (Math.random() - 0.5) * 0.6;
                const fH = 0.12 + Math.random() * 0.12;
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, fH, 6), stemMat);
                stem.position.set(fx, fH / 2, fz);
                patch.add(stem);

                const pColor = f % 3 === 0 ? flowerPetalMatW : (f % 3 === 1 ? flowerPetalMatY : flowerPetalMatP);
                const head = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pColor);
                head.position.set(fx, fH, fz);
                head.scale.set(1.5, 0.5, 1.5);
                patch.add(head);

                const center = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), flowerCenterMat);
                center.position.set(fx, fH + 0.012, fz);
                patch.add(center);
            }
            return patch;
        }
        parkGroup.add(createFlowerPatch(-1.1, -0.2, 8));
        parkGroup.add(createFlowerPatch(1.2, 0.9, 7));
        parkGroup.add(createFlowerPatch(-1.5, 1.8, 6));
        parkGroup.add(createFlowerPatch(2.2, -0.4, 8));

        // Árvores com Tronco Texturizado em Casca (Bark Texture) e Copa em Nuvem
        function createTexturedTree(x, z, scale = 1.0, isSakura = false) {
            const tree = new THREE.Group();
            tree.position.set(x, 0, z);
            tree.scale.set(scale, scale, scale);

            const trunkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.90 });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 2.6, 14), trunkMat);
            trunk.position.y = 1.3;
            trunk.castShadow = true;
            tree.add(trunk);

            // Galho lateral curvado
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 10), trunkMat);
            branch.position.set(0.3, 1.9, 0.15);
            branch.rotation.z = -Math.PI / 4;
            branch.castShadow = true;
            tree.add(branch);

            // Folhagem volumétrica em camadas
            const leafColor1 = isSakura ? 0xf472b6 : 0x15803d;
            const leafColor2 = isSakura ? 0xfbcfe8 : 0x16a34a;
            const foliageMat1 = new THREE.MeshStandardMaterial({ color: leafColor1, roughness: 0.85 });
            const foliageMat2 = new THREE.MeshStandardMaterial({ color: leafColor2, roughness: 0.80 });

            const c1 = new THREE.Mesh(new THREE.SphereGeometry(1.05, 16, 16), foliageMat1);
            c1.position.set(0, 2.8, 0); c1.castShadow = true; tree.add(c1);
            const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), foliageMat2);
            c2.position.set(0.55, 3.1, 0.35); c2.castShadow = true; tree.add(c2);
            const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.78, 14, 14), foliageMat1);
            c3.position.set(-0.45, 2.9, -0.25); c3.castShadow = true; tree.add(c3);
            return tree;
        }
        parkGroup.add(createTexturedTree(-3.0, -1.8, 1.15, true)); // Cerejeira Sakura
        parkGroup.add(createTexturedTree(3.4, -3.0, 1.3, false));  // Carvalho Verdejante
        parkGroup.add(createTexturedTree(-3.6, 2.2, 0.95, false));

        // Postes de Luz Vitorianos Vintage (Streetlamps) com Lanterna Aconchegante
        const lampMetalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.85 });
        const lampGlassMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.65, transparent: true, opacity: 0.85 });

        function createStreetlamp(x, z) {
            const lampGroup = new THREE.Group();
            lampGroup.position.set(x, 0, z);

            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.20, 0.35, 12), lampMetalMat);
            base.position.y = 0.175; base.castShadow = true; lampGroup.add(base);

            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 2.8, 12), lampMetalMat);
            pole.position.y = 1.6; pole.castShadow = true; lampGroup.add(pole);

            // Cúpula da Lanterna
            const lanternHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.10, 0.35, 6), lampMetalMat);
            lanternHousing.position.y = 3.1; lampGroup.add(lanternHousing);

            const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 6), lampMetalMat);
            lanternCap.position.y = 3.35; lampGroup.add(lanternCap);

            // Vidro Incandescente
            const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.25, 6), lampGlassMat);
            glass.position.y = 3.08; lampGroup.add(glass);

            // Luz Pontual Dourada Aconchegante
            const pLight = new THREE.PointLight(0xfde047, 0.85, 6.5, 1.5);
            pLight.position.y = 3.08;
            pLight.castShadow = false; // Leveza de performance
            lampGroup.add(pLight);

            return lampGroup;
        }
        parkGroup.add(createStreetlamp(1.7, -1.2));
        parkGroup.add(createStreetlamp(-1.8, 1.5));

        // Banco de Praça com Ripas de Madeira Texturizada (Wood Plank Texture)
        const benchGroup = new THREE.Group();
        benchGroup.position.set(1.4, 0, 0.2);
        benchGroup.rotation.y = -0.45;
        parkGroup.add(benchGroup);

        const benchWoodMat = new THREE.MeshStandardMaterial({ map: woodPlankTex, roughness: 0.75 });
        const benchIronMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.85 });

        const leftLegBench = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.55), benchIronMat);
        leftLegBench.position.set(-0.65, 0.22, 0); benchGroup.add(leftLegBench);
        const rightLegBench = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.55), benchIronMat);
        rightLegBench.position.set(0.65, 0.22, 0); benchGroup.add(rightLegBench);

        for (let s = -1; s <= 1; s++) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.12), benchWoodMat);
            slat.position.set(0, 0.45, s * 0.14); slat.castShadow = true; benchGroup.add(slat);
        }
        for (let b = 0; b <= 1; b++) {
            const backSlat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.04), benchWoodMat);
            backSlat.position.set(0, 0.65 + b * 0.16, -0.22); backSlat.castShadow = true; benchGroup.add(backSlat);
        }

        // Hidrante Vermelho com Acabamento Premium
        const hydrantGroup = new THREE.Group();
        hydrantGroup.position.set(-1.3, 0, 1.4);
        parkGroup.add(hydrantGroup);

        const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.38, metalness: 0.25 });
        const silverMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });

        const hydrantFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.08, 16), redMat);
        hydrantFlange.position.y = 0.04; hydrantGroup.add(hydrantFlange);

        const hydrantBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.52, 16), redMat);
        hydrantBody.position.y = 0.30; hydrantBody.castShadow = true; hydrantGroup.add(hydrantBody);

        const hydrantTop = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), redMat);
        hydrantTop.position.y = 0.56; hydrantGroup.add(hydrantTop);

        const capL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 12), silverMat);
        capL.position.set(-0.15, 0.36, 0); capL.rotation.z = Math.PI / 2; hydrantGroup.add(capL);
        const capR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 12), silverMat);
        capR.position.set(0.15, 0.36, 0); capR.rotation.z = Math.PI / 2; hydrantGroup.add(capR);

        // Folhas Flutuantes Outonais
        const leaves = [];
        const leafMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
        for (let i = 0; i < 26; i++) {
            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), leafMat);
            const ly = 0.05 + Math.random() * 0.15;
            leaf.position.set((Math.random() - 0.5) * 6.5, ly, (Math.random() - 0.5) * 6.5);
            parkGroup.add(leaf);
            leaves.push({ mesh: leaf, initY: ly, speed: 0.3 + Math.random() * 0.45 });
        }

        // Gotas de Café Suspensas
        const coffeeBlobs = [];
        const blobGeo = new THREE.SphereGeometry(0.024, 10, 10);
        for (let i = 0; i < 9; i++) {
            const b = new THREE.Mesh(blobGeo, new THREE.MeshStandardMaterial({ color: 0x3d1c06, roughness: 0.1 }));
            b.visible = false;
            scene.add(b);
            coffeeBlobs.push(b);
        }

        // =========================================================================
        // ESPAÇO SIDERAL & ESTRATOSFERA (BEATS 5 A 8)
        // =========================================================================
        const starCount = 3000;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 18 + Math.random() * 55;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPos[i * 3 + 2] = r * Math.cos(phi);
            const cType = Math.random();
            if (cType > 0.8) { starColors[i * 3] = 0.65; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0; }
            else if (cType > 0.65) { starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 0.7; }
            else { starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0; }
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.0 });
        const starField = new THREE.Points(starGeo, starMat);
        spaceGroup.add(starField);

        // Globo Gigante da Terra Curva no Horizonte
        const earthGroup = new THREE.Group();
        earthGroup.position.set(0, -18, -10);
        spaceGroup.add(earthGroup);

        const earthSphere = new THREE.Mesh(
            new THREE.SphereGeometry(18, 48, 48),
            new THREE.MeshStandardMaterial({
                color: 0x0369a1,
                roughness: 0.6,
                metalness: 0.1
            })
        );
        earthGroup.add(earthSphere);

        // Continentes / Relevo sutil
        const contMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
        for (let c = 0; c < 6; c++) {
            const contMesh = new THREE.Mesh(new THREE.SphereGeometry(4.5 + Math.random() * 3, 16, 16), contMat);
            const ca = c * 1.1;
            contMesh.position.set(Math.sin(ca) * 16.5, Math.cos(ca * 0.7) * 16.5, Math.cos(ca) * 16.5);
            earthGroup.add(contMesh);
        }

        // Atmosfera Brilhante Azul na Borda
        const atmoSphere = new THREE.Mesh(
            new THREE.SphereGeometry(18.5, 48, 48),
            new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            })
        );
        earthGroup.add(atmoSphere);

        // Anel de Onda Gravitacional
        const shockRingGeo = new THREE.RingGeometry(0.3, 0.85, 48);
        shockRingGeo.rotateX(-Math.PI / 2);
        const shockRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
        const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
        shockRing.position.set(0, 0.05, 0);
        scene.add(shockRing);

        // Linhas de Vento da Queda
        const windLineCount = 70;
        const windGeo = new THREE.BufferGeometry();
        const windPos = new Float32Array(windLineCount * 6);
        for (let i = 0; i < windLineCount; i++) {
            const wx = (Math.random() - 0.5) * 4.0;
            const wz = (Math.random() - 0.5) * 4.0;
            const wy = Math.random() * 8;
            windPos[i * 6] = wx; windPos[i * 6 + 1] = wy; windPos[i * 6 + 2] = wz;
            windPos[i * 6 + 3] = wx; windPos[i * 6 + 4] = wy + 1.4; windPos[i * 6 + 5] = wz;
        }
        windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
        const windMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
        const windLines = new THREE.LineSegments(windGeo, windMat);
        scene.add(windLines);

        // =========================================================================
        // PINS 3D ANTI-FLICKER ENGINE (DAMPED HARDWARE ACCELERATED)
        // =========================================================================
        const pinPrimaryEl = document.getElementById('pin-primary');
        const pinSecondaryEl = document.getElementById('pin-secondary');

        const pin1State = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2, opacity: 0 };
        const pin2State = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2, opacity: 0 };

        function getTargetWorldPosition(targetName) {
            const v = new THREE.Vector3();
            switch (targetName) {
                case 'charHead':
                    return headGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.38, 0));
                case 'charFeet':
                    return charPivot.getWorldPosition(v).add(new THREE.Vector3(0, 0.12, 0));
                case 'coffee':
                    return mugGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.16, 0));
                case 'bench':
                    return benchGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.85, 0));
                case 'hydrant':
                    return hydrantGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.70, 0));
                default:
                    return charRoot.getWorldPosition(v).add(new THREE.Vector3(0, 1.2, 0));
            }
        }

        function updateDampedPin(targetWorldPos, pinConfig, state, element) {
            if (!pinConfig) {
                state.opacity = 0;
                element.style.opacity = '0';
                return;
            }

            const projected = targetWorldPos.clone().project(camera);
            const inFront = projected.z > -1.0 && projected.z < 1.0;

            if (inFront) {
                const w = viewport.clientWidth;
                const h = viewport.clientHeight;
                const targetX = (projected.x * 0.5 + 0.5) * w;
                const targetY = (-projected.y * 0.5 + 0.5) * h;
                const clampedX = Math.max(90, Math.min(w - 90, targetX));
                const clampedY = Math.max(90, Math.min(h - 170, targetY));

                state.x += (clampedX - state.x) * 0.28;
                state.y += (clampedY - state.y) * 0.28;
                state.opacity += (1 - state.opacity) * 0.20;
            } else {
                state.opacity = 0;
            }

            element.style.transform = \`translate3d(\${state.x.toFixed(1)}px, \${state.y.toFixed(1)}px, 0) translate(-50%, -100%)\`;
            element.style.opacity = state.opacity.toFixed(3);
        }

        function configurePinDOM(pinConfig, prefix) {
            if (!pinConfig) return;
            document.getElementById(\`pin-\${prefix}-icon\`).textContent = pinConfig.icon;
            document.getElementById(\`pin-\${prefix}-text\`).textContent = pinConfig.text;
            document.getElementById(\`pin-\${prefix}-bubble\`).className = \`callout-bubble \${pinConfig.style} border-2 border-white\`;
            document.getElementById(\`pin-\${prefix}-stem\`).className = \`callout-stem \${pinConfig.stem}\`;
            document.getElementById(\`pin-\${prefix}-dot\`).className = \`callout-dot \${pinConfig.stem}\`;
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

        const evalCamPos = new THREE.Vector3();
        const evalCamLook = new THREE.Vector3();

        /**
         * Renderizador Deterministico 60fps & MP4 Frame Capture
         */
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

            // Barra de Progresso
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

            // Atualização de Textos Sem Flicker
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

            // Interpolação de Câmera
            lerpVec3(prevBeat.camPos, activeBeat.camPos, u, evalCamPos);
            lerpVec3(prevBeat.camLook, activeBeat.camLook, u, evalCamLook);
            const gentleSwayX = Math.sin(t * 0.35) * 0.02;
            const gentleSwayY = Math.cos(t * 0.28) * 0.012;
            camera.position.set(evalCamPos.x + gentleSwayX, evalCamPos.y + gentleSwayY, evalCamPos.z);
            camera.lookAt(evalCamLook);
            camera.updateMatrixWorld();

            const mode = activeBeat.mode;

            // Transição Ambiental Dramática (Quadro 1 ao 6: Parque -> Quadro 7 e 8: Espaço e Vácuo Cósmico -> Quadro 9 e 10: Gravidade e Reentrada de Plasma -> Quadro 11: Impacto -> Quadro 12: Pôr do Sol Dourado)
            earthGroup.rotation.y = t * 0.04;
            const isCosmic = (mode === 'fullZeroG' || mode === 'vacuumPanic' || mode === 'apexHeight' || mode === 'risingFast');

            if (isCosmic) {
                spaceGroup.visible = true;
                const cosmicIntensity = mode === 'risingFast' ? u : (mode === 'apexHeight' ? 1.0 : 0.92);

                if (mode === 'vacuumPanic') {
                    // QUADRO 7: O VÁCUO DA ATMOSFERA ESCAPANDO (Tons violeta/índigo de descompressão)
                    const skyR = 0.04 * (1 - u) + 0.01 * u;
                    const skyG = 0.08 * (1 - u) + 0.015 * u;
                    const skyB = 0.28 * (1 - u) + 0.06 * u;
                    scene.background.setRGB(skyR, skyG, skyB);
                    scene.fog.color.setRGB(skyR, skyG, skyB);
                    hemiLight.color.setHex(0x818cf8);
                } else if (mode === 'apexHeight') {
                    // QUADRO 8: ÁPICE ESPACIAL - PROFUNDO BREU CÓSMICO E TERRA CURVA GIGANTE
                    scene.background.setRGB(0.005, 0.008, 0.02);
                    scene.fog.color.setRGB(0.005, 0.008, 0.02);
                    hemiLight.color.setHex(0x38bdf8);
                } else {
                    const skyR = 0.75 * (1 - cosmicIntensity) + 0.01 * cosmicIntensity;
                    const skyG = 0.88 * (1 - cosmicIntensity) + 0.015 * cosmicIntensity;
                    const skyB = 0.97 * (1 - cosmicIntensity) + 0.04 * cosmicIntensity;
                    scene.background.setRGB(skyR, skyG, skyB);
                    scene.fog.color.setRGB(skyR, skyG, skyB);
                    hemiLight.color.setHex(0xffffff);
                }

                scene.fog.near = 14 * (1 - cosmicIntensity) + 45 * cosmicIntensity;
                scene.fog.far = 32 * (1 - cosmicIntensity) + 90 * cosmicIntensity;
                renderer.setClearColor(scene.background, 1.0);
                viewport.style.backgroundColor = '#020617';

                starMat.opacity = cosmicIntensity * 0.98;

                // Iluminação Espacial Dramática
                hemiLight.intensity = 0.95 * (1 - cosmicIntensity) + 0.22 * cosmicIntensity;
                sunLight.intensity = 1.55 * (1 - cosmicIntensity) + 2.4 * cosmicIntensity;
                sunLight.color.setRGB(
                    1.0 * (1 - cosmicIntensity) + 0.85 * cosmicIntensity,
                    0.97 * (1 - cosmicIntensity) + 0.92 * cosmicIntensity,
                    0.93 * (1 - cosmicIntensity) + 1.0 * cosmicIntensity
                );

                // Parque afasta-se para baixo e entra na sombra
                parkGroup.position.y = -cosmicIntensity * 8.5;
                earthGroup.position.y = -22 + cosmicIntensity * 6.5;
                windMat.opacity = 0.0;
            } else if (mode === 'gravitySnap' || mode === 'fallingFast') {
                // QUADRO 9 E 10: QUEDA LIVRE & REENTRADA ATMOSFÉRICA INCANDESCENTE
                spaceGroup.visible = true;
                const fallProgress = timeInBeat / 3.8;
                const returnRatio = Math.max(0, 1.0 - fallProgress);

                if (mode === 'fallingFast') {
                    // Plasma de reentrada: céu queima em tom alaranjado-dourado
                    const fireR = 0.95 * Math.sin(fallProgress * Math.PI) + 0.75 * (1 - returnRatio);
                    const fireG = 0.45 * Math.sin(fallProgress * Math.PI) + 0.88 * (1 - returnRatio);
                    const fireB = 0.15 * Math.sin(fallProgress * Math.PI) + 0.97 * (1 - returnRatio);
                    scene.background.setRGB(Math.min(1, fireR), Math.min(1, fireG), Math.min(1, fireB));
                    windMat.color.setHex(0xffaa44); // Linhas de fogo supersônico
                } else {
                    scene.background.setRGB(
                        0.01 * returnRatio + 0.75 * (1 - returnRatio),
                        0.015 * returnRatio + 0.88 * (1 - returnRatio),
                        0.04 * returnRatio + 0.97 * (1 - returnRatio)
                    );
                    windMat.color.setHex(0xffffff);
                }

                scene.fog.color.copy(scene.background);
                renderer.setClearColor(scene.background, 1.0);
                starMat.opacity = returnRatio * 0.6;
                parkGroup.position.y = -returnRatio * 6.0;

                hemiLight.intensity = 0.20 * returnRatio + 0.95 * (1 - returnRatio);
                sunLight.intensity = 2.2 * returnRatio + 1.55 * (1 - returnRatio);

                // Linhas de Vento da Queda
                windMat.opacity = Math.sin(Math.min(1.0, fallProgress) * Math.PI) * 0.95;
                const pos = windGeo.attributes.position.array;
                for (let i = 1; i < pos.length; i += 3) {
                    pos[i] += 0.55;
                    if (pos[i] > 8.0) pos[i] = 0.0;
                }
                windGeo.attributes.position.needsUpdate = true;
            } else if (mode === 'celebrate') {
                // QUADRO 12: PÔR DO SOL DOURADO / CREPÚSCULO AVELUDADO (CONFORTÁVEL AOS OLHOS)
                spaceGroup.visible = false;
                starMat.opacity = 0.0;
                windMat.opacity = 0.0;
                parkGroup.position.y = 0;

                // Céu Gradiente Âmbar Aveludado Suave (Zero Brilho Ofuscante)
                const sunsetR = 0.48;
                const sunsetG = 0.24;
                const sunsetB = 0.16;
                scene.background.setRGB(sunsetR, sunsetG, sunsetB);
                scene.fog.color.setRGB(sunsetR, sunsetG, sunsetB);
                scene.fog.near = 12;
                scene.fog.far = 36;
                renderer.setClearColor(scene.background, 1.0);
                viewport.style.backgroundColor = '#451a03';

                // Luz solar dourada acolhedora de fim de tarde
                hemiLight.intensity = 0.38;
                hemiLight.color.setHex(0xfde68a);
                hemiLight.groundColor.setHex(0x271306);
                sunLight.intensity = 1.35;
                sunLight.color.setHex(0xf59e0b);
                sunLight.position.set(-4.0, 2.5, 3.5);
            } else {
                // QUADRO 1 A 3 E POUSO: PARQUE COM PALETA CINEMATOGRÁFICA DESCANSA-OLHOS
                spaceGroup.visible = false;
                starMat.opacity = 0.0;
                windMat.opacity = 0.0;
                parkGroup.position.y = 0;

                scene.background.setHex(SKY_DAY_COLOR);
                scene.fog.color.setHex(SKY_DAY_COLOR);
                scene.fog.near = 16;
                scene.fog.far = 42;
                renderer.setClearColor(scene.background, 1.0);

                viewport.style.backgroundColor = '#1e385c';
                hemiLight.intensity = 0.42;
                hemiLight.color.setHex(0x93c5fd);
                hemiLight.groundColor.setHex(0x14532d);
                sunLight.intensity = 1.15;
                sunLight.color.setHex(0xffeedd);
                sunLight.position.set(4.5, 9.5, 5.5);
            }

            // ESTADOS DO PERSONAGEM
            charPivot.scale.set(1, 1, 1);
            charPivot.rotation.set(0, 0, 0);

            if (mode === 'walking') {
                const walkCycle = Math.sin(t * 7.5);
                leftLeg.legPivot.rotation.x = walkCycle * 0.45;
                leftLeg.shinPivot.rotation.x = Math.max(0, -walkCycle * 0.45);
                rightLeg.legPivot.rotation.x = -walkCycle * 0.45;
                rightLeg.shinPivot.rotation.x = Math.max(0, walkCycle * 0.45);

                leftArm.armPivot.rotation.x = -walkCycle * 0.35;
                rightArm.armPivot.rotation.set(0.25, 0, 0.1);
                rightArm.forearmPivot.rotation.x = -0.55;

                mugGroup.position.set(0.06, -0.04, 0.08);
                mugGroup.rotation.set(0, 0, 0);

                charRoot.position.set(0, Math.abs(Math.sin(t * 7.5)) * 0.05, 0.5 - t * 0.12);
                headGroup.rotation.y = Math.sin(t * 1.5) * 0.1;
                mouthMesh.rotation.z = Math.PI; // Sorriso calmo
                leftEyebrow.rotation.z = 0.05; rightEyebrow.rotation.z = -0.05;

                benchGroup.position.y = 0;
                hydrantGroup.position.y = 0;
                leaves.forEach(l => { l.mesh.position.y = l.initY; });
                coffeeBlobs.forEach(b => { b.visible = false; });
            }
            else if (mode === 'alert') {
                leftLeg.legPivot.rotation.set(0, 0, 0);
                rightLeg.legPivot.rotation.set(0, 0, 0);
                leftArm.armPivot.rotation.set(0.1, 0, -0.2);
                rightArm.armPivot.rotation.set(0.35, 0, 0.2);
                rightArm.forearmPivot.rotation.x = -0.55;

                charRoot.position.set(0, 0, 0);
                headGroup.rotation.y = Math.sin(t * 2.2) * 0.28;
                mouthMesh.rotation.z = 0; // Boca séria
                leftEyebrow.rotation.z = -0.25; rightEyebrow.rotation.z = 0.25;
            }
            else if (mode === 'floatStart') {
                rightArm.armPivot.rotation.x = 0.5;
                mugGroup.position.set(0.12, -0.04 + Math.sin(t * 2.0) * 0.08, 0.22);
                mugGroup.rotation.z = Math.sin(t * 1.8) * 0.25;

                coffeeBlobs.forEach((b, idx) => {
                    b.visible = true;
                    b.position.set(
                        mugGroup.getWorldPosition(new THREE.Vector3()).x + Math.sin(t * 2 + idx) * 0.08,
                        mugGroup.getWorldPosition(new THREE.Vector3()).y + 0.12 + (idx * 0.06),
                        mugGroup.getWorldPosition(new THREE.Vector3()).z + Math.cos(t * 2 + idx) * 0.08
                    );
                });

                leaves.forEach(l => {
                    l.mesh.position.y = l.initY + Math.min(0.8, timeInBeat * l.speed);
                });
            }
            else if (mode === 'personFloating' || mode === 'risingFast' || mode === 'fullZeroG' || mode === 'vacuumPanic' || mode === 'apexHeight') {
                let floatHeight = 0.4;
                if (mode === 'personFloating') floatHeight = lerpNum(0.1, 1.2, u);
                else if (mode === 'risingFast') floatHeight = lerpNum(1.2, 2.3, u);
                else if (mode === 'fullZeroG') floatHeight = lerpNum(2.3, 2.8, u);
                else if (mode === 'vacuumPanic') floatHeight = lerpNum(2.8, 3.2, u);
                else if (mode === 'apexHeight') floatHeight = 3.4 + Math.sin(t * 1.2) * 0.12;

                charRoot.position.set(Math.sin(t * 0.6) * 0.18, floatHeight, Math.cos(t * 0.5) * 0.15);

                const swimCycle = Math.sin(t * 2.8);
                leftArm.armPivot.rotation.set(swimCycle * 0.5, 0, -0.4 + Math.sin(t * 2) * 0.2);
                rightArm.armPivot.rotation.set(-swimCycle * 0.5, 0, 0.4 + Math.sin(t * 2) * 0.2);
                leftLeg.legPivot.rotation.set(-swimCycle * 0.35, 0, -0.15);
                rightLeg.legPivot.rotation.set(swimCycle * 0.35, 0, 0.15);

                charPivot.rotation.z = Math.sin(t * 0.8) * 0.18;
                charPivot.rotation.x = Math.cos(t * 0.7) * 0.12;

                mouthMesh.rotation.z = 0; // Boca em choque
                mouthMesh.scale.set(1.5, 1.8, 1.2);
                leftEyebrow.rotation.z = -0.45; rightEyebrow.rotation.z = 0.45;

                // Objetos flutuando em gravidade zero ao redor do personagem
                const objLift = Math.min(2.4, (t - 17.5) * 0.15);
                benchGroup.position.set(1.4, Math.max(0, objLift * 0.95), 0.2);
                benchGroup.rotation.x = Math.sin(t * 0.4) * 0.28;
                benchGroup.rotation.z = Math.cos(t * 0.5) * 0.22;

                hydrantGroup.position.set(-1.3, Math.max(0, objLift * 0.80), 1.4);
                hydrantGroup.rotation.y = t * 0.45;
                hydrantGroup.rotation.z = Math.sin(t * 0.6) * 0.25;

                leaves.forEach(l => {
                    l.mesh.position.y = Math.min(4.5, l.initY + (t - 12.0) * l.speed);
                });
            }
            else if (mode === 'gravitySnap') {
                const flash = Math.sin(Math.min(1.0, timeInBeat / 1.5) * Math.PI);
                shockRingMat.opacity = flash * 0.9;
                shockRing.scale.set(1 + flash * 5, 1 + flash * 5, 1);
                charRoot.position.set(0, lerpNum(3.4, 2.2, u), 0);
                leftArm.armPivot.rotation.set(-0.8, 0, -0.6);
                rightArm.armPivot.rotation.set(-0.8, 0, 0.6);
            }
            else if (mode === 'fallingFast') {
                const fallProgress = timeInBeat / (activeBeat.end - activeBeat.start);
                charRoot.position.set(0, lerpNum(2.2, 0.2, easeInOutCubic(fallProgress)), 0);
                leftArm.armPivot.rotation.x = -1.2;
                rightArm.armPivot.rotation.x = -1.2;
                leftLeg.legPivot.rotation.x = 0.2;
                rightLeg.legPivot.rotation.x = 0.2;

                benchGroup.position.y = lerpNum(1.8, 0, fallProgress);
                benchGroup.rotation.set(0, -0.45, 0);
                hydrantGroup.position.y = lerpNum(1.4, 0, fallProgress);
                hydrantGroup.rotation.set(0, 0, 0);
                leaves.forEach(l => { l.mesh.position.y = lerpNum(3.5, l.initY, fallProgress); });
                coffeeBlobs.forEach(b => { b.visible = false; });
            }
            else if (mode === 'springLanding') {
                charRoot.position.set(0, 0, 0);
                const springT = Math.min(1.0, timeInBeat / 1.2);
                const squash = 1.0 - Math.sin(springT * Math.PI * 3) * Math.exp(-springT * 3.5) * 0.38;
                charPivot.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

                leftLeg.legPivot.rotation.set(0.6, 0, -0.4);
                rightLeg.legPivot.rotation.set(0.6, 0, 0.4);
                leftArm.armPivot.rotation.set(0.2, 0, -0.2);
                rightArm.armPivot.rotation.set(0.35, 0, 0.15);
                rightArm.forearmPivot.rotation.x = -0.55;

                mugGroup.position.set(0.06, -0.04, 0.08);
                mugGroup.rotation.set(0, 0, 0);

                benchGroup.position.set(1.4, 0, 0.2);
                benchGroup.rotation.set(0, -0.45, 0);
                hydrantGroup.position.set(-1.3, 0, 1.4);
                hydrantGroup.rotation.set(0, 0, 0);

                mouthMesh.rotation.z = Math.PI; // Sorriso de alívio
                mouthMesh.scale.set(1.2, 0.9, 1.0);
                leftEyebrow.rotation.z = 0.1; rightEyebrow.rotation.z = -0.1;
            }
            else if (mode === 'celebrate') {
                charRoot.position.set(0, 0, 0);
                leftLeg.legPivot.rotation.set(0, 0, 0);
                rightLeg.legPivot.rotation.set(0, 0, 0);
                leftArm.armPivot.rotation.set(-0.2 + Math.sin(t * 3.5) * 0.15, 0, -0.5); // Acena
                rightArm.armPivot.rotation.set(0.35, 0, 0.1);
                rightArm.forearmPivot.rotation.x = -0.55;
                headGroup.rotation.y = Math.sin(t * 1.5) * 0.15;
                mouthMesh.rotation.z = Math.PI;
                mouthMesh.scale.set(1.1, 1.0, 1.0);
            }

            // ATUALIZAÇÃO DAMPED DOS PINS (ANTI-FLICKER)
            if (activeBeat.pin1) {
                const pos1 = getTargetWorldPosition(activeBeat.pin1.target);
                updateDampedPin(pos1, activeBeat.pin1, pin1State, pinPrimaryEl);
            } else {
                updateDampedPin(null, null, pin1State, pinPrimaryEl);
            }

            if (activeBeat.pin2) {
                const pos2 = getTargetWorldPosition(activeBeat.pin2.target);
                updateDampedPin(pos2, activeBeat.pin2, pin2State, pinSecondaryEl);
            } else {
                updateDampedPin(null, null, pin2State, pinSecondaryEl);
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
                evaluateAndRenderAtTime(elapsedVideoTime);
            }
        }
        animate();

        window.renderDeterministicFrame = function(timeSec) {
            window.__cdpCaptureActive = true;
            isPlaying = false;
            if (masterAudio) masterAudio.pause();
            seekToTime(timeSec);
        };
    </script>
</body>
</html>`;

const outWorkspace = 'gravidade-zero-3d.html';
const outDownloads = 'c:/Users/Ruan Gomes/Downloads/e_se_a_gravidade_desligasse_animacao_vertical_3d.html';

writeFileSync(outWorkspace, htmlContent, 'utf8');
writeFileSync(outDownloads, htmlContent, 'utf8');

console.log(`✅ Novo arquivo HTML (Vídeo #3) criado em: ${outDownloads}`);
console.log(`✅ Cópia no projeto salva em: ${outWorkspace}`);
