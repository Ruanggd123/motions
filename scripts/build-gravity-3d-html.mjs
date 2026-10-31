import fs from 'node:fs';

const DOWNLOAD_PATH = 'c:/Users/Ruan Gomes/Downloads/e_se_a_gravidade_desligasse_animacao_vertical_3d.html';
const LOCAL_PATH = 'gravidade-zero-3d.html';
const AUDIO_PATH = 'output/gravidade_audio.mp3';
const TIMING_PATH = 'src/gravidadeTiming.json';

const audioBase64 = fs.readFileSync(AUDIO_PATH).toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;
const timingData = JSON.parse(fs.readFileSync(TIMING_PATH, 'utf8'));
const tb = timingData.beats;

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>E Se a Gravidade Desligasse por 5 Segundos? — Animação 3D Vertical</title>
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
            background-color: #070b14;
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
            background: #dbeafe;
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
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.2) 65%, transparent 100%);
        }

        .bottom-scrim {
            background: linear-gradient(0deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.65) 55%, transparent 100%);
        }

        @keyframes scriptPopIn {
            0% { opacity: 0; transform: translateY(10px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .script-animate {
            animation: scriptPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
                    <span id="beat-dot" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span id="beat-tag" class="text-[11px] font-extrabold tracking-wider text-white uppercase font-['Space_Grotesk']">
                        1. MANHÃ DE SOL NO PARQUE
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
            <div id="pin-primary-bubble" class="callout-bubble bg-amber-300 text-slate-950 border-2 border-white">
                <span id="pin-primary-icon">☕</span>
                <span id="pin-primary-text">Café Matinal</span>
            </div>
            <div id="pin-primary-stem" class="callout-stem text-amber-300"></div>
            <div id="pin-primary-dot" class="callout-dot text-amber-300"></div>
        </div>

        <div id="pin-secondary" class="callout-pin opacity-0">
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
                camPos: [0.0, 2.9, 5.8],
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
                camPos: [0.4, 2.6, 4.4],
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
                // Visão aproximada da xícara flutuando e folhas subindo
                camPos: [0.35, 2.3, 3.2],
                camLook: [0.15, 1.35, 0.0],
                mode: "floatStart",
                pin1: { text: "Líquido em Gravidade Zero", icon: "💧", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" },
                pin2: { text: "Folhas Levitan", icon: "🍃", style: "bg-green-400 text-slate-950", stem: "text-green-400", target: "leaf" }
            },
            {
                id: 3,
                start: ${tb[3].start},
                end: ${tb[3].end},
                tag: "4. PÉS SOLTOS DO CHÃO",
                dotColor: "#22d3ee",
                html: \`No segundo seguinte, <span class="kw-badge kw-cyan">SEUS PÉS PERDEM O CHÃO</span> e você começa a subir sem conseguir se segurar!\`,
                // Câmera acompanha o personagem subindo suavemente
                camPos: [0.0, 3.2, 4.6],
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
                // Câmera em ângulo superior mostrando o chão se afastando
                camPos: [0.0, 4.5, 4.2],
                camLook: [0.0, 2.1, 0.0],
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
                // Grande plano aberto cinematográfico: banco e hidrante levitando
                camPos: [0.0, 5.2, 5.8],
                camLook: [0.0, 2.5, 0.0],
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
                camPos: [-0.6, 4.8, 4.5],
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
                // VISÃO DE CIMA (TOP-DOWN DRAMÁTICA) olhando do alto para o parque lá embaixo
                camPos: [0.0, 6.2, 2.8],
                camLook: [0.0, 2.2, 0.0],
                mode: "apexHeight",
                pin1: { text: "Altitude Máxima: 8 Metros!", icon: "☁️", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "charHead" },
                pin2: null
            },
            {
                id: 8,
                start: ${tb[7].end},
                end: ${tb[8].end},
                tag: "9. A GRAVIDADE RELIGA!",
                dotColor: "#ef4444",
                html: \`A contagem chega ao fim e, de repente, a gravidade é <span class="kw-badge kw-orange">RELIGADA COM FORÇA TOTAL</span>!\`,
                camPos: [0.0, 5.0, 5.2],
                camLook: [0.0, 2.0, 0.0],
                mode: "gravitySnap",
                pin1: { text: "GRAVIDADE: ON!", icon: "⚡", style: "bg-red-400 text-slate-950", stem: "text-red-400", target: "charHead" },
                pin2: null
            },
            {
                id: 9,
                start: ${tb[8].end},
                end: ${tb[9].end},
                tag: "10. QUEDA LIVRE ACELERADA",
                dotColor: "#fb923c",
                html: \`Tudo o que subiu <span class="kw-badge kw-magenta">DESABA EM QUEDA LIVRE</span> acelerada de volta em direção ao solo!\`,
                // Queda rápida em direção ao gramado
                camPos: [0.0, 3.8, 4.8],
                camLook: [0.0, 1.4, 0.0],
                mode: "fallingFast",
                pin1: { text: "Queda a 180 km/h!", icon: "⬇️", style: "bg-pink-400 text-slate-950", stem: "text-pink-400", target: "charHead" },
                pin2: null
            },
            {
                id: 10,
                start: ${tb[9].end},
                end: ${tb[10].end},
                tag: "11. POUSO NA GRAMA MACIA",
                dotColor: "#4ade80",
                html: \`Você despenca na <span class="kw-badge kw-green">GRAMA MACIA</span>, fazendo um pouso desajeitado mas <span class="kw-badge kw-white">ESCAPANDO COM VIDA</span>!\`,
                // Pouso de mola amortecido e o café cai na xícara
                camPos: [0.0, 2.2, 3.8],
                camLook: [0.0, 0.85, 0.0],
                mode: "springLanding",
                pin1: { text: "Pouso Amortecido!", icon: "🌱", style: "bg-emerald-400 text-slate-950", stem: "text-emerald-400", target: "charHead" },
                pin2: { text: "Café Salvo!", icon: "☕", style: "bg-amber-300 text-slate-950", stem: "text-amber-300", target: "coffee" }
            },
            {
                id: 11,
                start: ${tb[10].end},
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
        scene.background = new THREE.Color(0xbfe0f7); // Céu azul límpido de manhã de sol
        scene.fog = new THREE.Fog(0xbfe0f7, 12, 28);

        const camera = new THREE.PerspectiveCamera(40, viewport.clientWidth / viewport.clientHeight, 0.1, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);

        function resizeRenderer() {
            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener('resize', resizeRenderer);

        // Iluminação de Sol da Manhã Suave e Calorosa
        const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x86efac, 0.95);
        hemiLight.position.set(0, 15, 0);
        scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.55);
        sunLight.position.set(6.5, 12, 7.5);
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
        sunLight.shadow.bias = -0.0003;
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.65);
        fillLight.position.set(-6, 8, -4);
        scene.add(fillLight);

        // Luz de Impacto Gravitacional
        const gravityGlowLight = new THREE.PointLight(0xfde047, 0.0, 10);
        gravityGlowLight.position.set(0, 2.5, 0);
        scene.add(gravityGlowLight);

        /*************************************************************************
         * CENÁRIO DO PARQUE BONITO (DIORAMA ESTILIZADO PIXAR)
         *************************************************************************/
        const parkGroup = new THREE.Group();
        scene.add(parkGroup);

        // Gramado Verde Suave
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.72 });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), grassMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        parkGroup.add(ground);

        // Caminho de Pedras Curvo
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55 });
        const pathGroup = new THREE.Group();
        parkGroup.add(pathGroup);
        for (let i = -8; i <= 8; i++) {
            const stone = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.85), stoneMat);
            stone.position.set(Math.sin(i * 0.35) * 0.3, 0.015, i * 0.95);
            stone.rotation.y = Math.sin(i * 0.2) * 0.15;
            stone.receiveShadow = true;
            pathGroup.add(stone);
        }

        // Banco de Praça de Madeira
        const benchGroup = new THREE.Group();
        benchGroup.position.set(1.55, 0, -0.4);
        benchGroup.rotation.y = -0.45;
        parkGroup.add(benchGroup);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });

        const seat1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.16), woodMat);
        seat1.position.set(0, 0.42, 0);
        const seat2 = seat1.clone();
        seat2.position.set(0, 0.42, 0.20);
        const backRest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.05), woodMat);
        backRest.position.set(0, 0.68, -0.08);
        backRest.rotation.x = -0.15;

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.45), ironMat);
        legL.position.set(-0.6, 0.21, 0.08);
        const legR = legL.clone();
        legR.position.set(0.6, 0.21, 0.08);
        benchGroup.add(seat1, seat2, backRest, legL, legR);
        benchGroup.children.forEach(c => { c.castShadow = true; c.receiveShadow = true; });

        // Hidrante Vermelho Vintage
        const hydrantGroup = new THREE.Group();
        hydrantGroup.position.set(-1.45, 0, 0.8);
        parkGroup.add(hydrantGroup);

        const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35, metalness: 0.2 });
        const hydBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.58, 16), redMat);
        hydBody.position.y = 0.29;
        const hydCap = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), redMat);
        hydCap.position.y = 0.58;
        const hydNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.38, 12), ironMat);
        hydNozzle.rotation.z = Math.PI / 2;
        hydNozzle.position.y = 0.38;
        hydrantGroup.add(hydBody, hydCap, hydNozzle);
        hydrantGroup.children.forEach(c => { c.castShadow = true; });

        // Árvores Fofas de Cerejeira e Estilizadas
        function createStylizedTree(x, z, canopyColorHex, scale = 1.0) {
            const tree = new THREE.Group();
            tree.position.set(x, 0, z);
            tree.scale.set(scale, scale, scale);

            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.8, 12), trunkMat);
            trunk.position.y = 0.9;
            trunk.castShadow = true;
            tree.add(trunk);

            const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColorHex, roughness: 0.65 });
            const b1 = new THREE.Mesh(new THREE.SphereGeometry(1.05, 18, 18), canopyMat);
            b1.position.y = 2.2;
            b1.scale.set(1.15, 0.9, 1.1);
            b1.castShadow = true;

            const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), canopyMat);
            b2.position.set(0.3, 2.8, 0.1);
            b2.castShadow = true;

            tree.add(b1, b2);
            return tree;
        }

        const tree1 = createStylizedTree(-2.8, -2.5, 0xf472b6, 1.15); // Cerejeira Rosa
        const tree2 = createStylizedTree(2.9, -3.2, 0x22c55e, 1.3);   // Verde Vibrante
        const tree3 = createStylizedTree(-3.2, 2.8, 0x86efac, 0.95);  // Verde Menta
        parkGroup.add(tree1, tree2, tree3);

        // Poste de Luz Retrô com Luminária
        const lampGroup = new THREE.Group();
        lampGroup.position.set(-1.6, 0, -1.8);
        parkGroup.add(lampGroup);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 12), ironMat);
        pole.position.y = 1.6;
        pole.castShadow = true;
        const lantern = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.65 })
        );
        lantern.position.y = 3.2;
        lampGroup.add(pole, lantern);

        // Folhas Flutuantes do Parque
        const leaves = [];
        const leafMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6, side: THREE.DoubleSide });
        for (let i = 0; i < 18; i++) {
            const l = new THREE.Mesh(new THREE.CircleGeometry(0.06, 6), leafMat);
            l.rotation.x = -Math.PI / 2;
            l.position.set((Math.random() - 0.5) * 3.5, 0.02, (Math.random() - 0.5) * 4.5);
            parkGroup.add(l);
            leaves.push({ mesh: l, initY: 0.02, speed: 0.35 + Math.random() * 0.45, rotSpeed: 1.2 + Math.random() });
        }

        /*************************************************************************
         * CONSTRUÇÃO DO PERSONAGEM 3D (ANATOMIA ORGÂNICA + RIG DE ANDAR E FLUTUAR)
         *************************************************************************/
        const charRoot = new THREE.Group();
        charRoot.position.set(0, 0, 0);
        scene.add(charRoot);

        const charPivot = new THREE.Group();
        charRoot.add(charPivot);

        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.45 });
        const jacketMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 }); // Vermelho Coral Pixar
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
        const bootMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

        // Pernas Articuladas com Pivôs
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.11, 0.48, 0);
        charPivot.add(leftLegPivot);

        const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.34, 14), pantsMat);
        leftLegMesh.position.y = -0.17;
        const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.19), bootMat);
        leftBoot.position.set(0, -0.32, 0.035);
        leftLegPivot.add(leftLegMesh, leftBoot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.11, 0.48, 0);
        charPivot.add(rightLegPivot);

        const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.34, 14), pantsMat);
        rightLegMesh.position.y = -0.17;
        const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.19), bootMat);
        rightBoot.position.set(0, -0.32, 0.035);
        rightLegPivot.add(rightLegMesh, rightBoot);

        // Tronco e Jaqueta
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.45, 20), jacketMat);
        torso.position.y = 0.68;
        torso.castShadow = true;
        charPivot.add(torso);

        // Braço Esquerdo (Balança no passo / Agita em gravidade zero)
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.25, 0.84, 0);
        charPivot.add(leftArmPivot);
        const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.35, 12), jacketMat);
        leftArmMesh.position.y = -0.16;
        const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
        leftHand.position.y = -0.34;
        leftArmPivot.add(leftArmMesh, leftHand);

        // Braço Direito (Segura a Xícara de Café)
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.25, 0.84, 0);
        charPivot.add(rightArmPivot);
        const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.35, 12), jacketMat);
        rightArmMesh.position.y = -0.16;
        const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
        rightHand.position.y = -0.34;
        rightArmPivot.add(rightArmMesh, rightHand);

        // Xícara de Café com Líquido e Alça
        const coffeeCupGroup = new THREE.Group();
        coffeeCupGroup.position.set(0.0, -0.35, 0.12);
        rightArmPivot.add(coffeeCupGroup);

        const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.12, 16), cupMat);
        const coffeeLiquid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16),
            new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.2 })
        );
        coffeeLiquid.position.y = 0.045;
        const cupHandle = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 8, 16), cupMat);
        cupHandle.position.set(0.07, 0, 0);
        cupHandle.rotation.y = Math.PI / 2;
        coffeeCupGroup.add(cup, coffeeLiquid, cupHandle);

        // Gotas de Café Flutuantes (para Atos 3-8)
        const coffeeBlobs = [];
        const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.15 });
        for (let i = 0; i < 6; i++) {
            const b = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), coffeeMat);
            b.visible = false;
            scene.add(b);
            coffeeBlobs.push(b);
        }

        // Cabeça e Rosto
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.05, 0);
        charPivot.add(headGroup);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 24), skinMat);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
        hairCap.position.y = 0.02;
        headGroup.add(hairCap);

        const eyeGeo = new THREE.SphereGeometry(0.036, 12, 12);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.08, 0.03, 0.21);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.08, 0.03, 0.21);
        headGroup.add(leftEye, rightEye);

        // Boca Expressiva (Sorriso -> Chocado -> Alívio)
        const mouthMesh = new THREE.Mesh(
            new THREE.TorusGeometry(0.045, 0.012, 8, 16, Math.PI),
            new THREE.MeshBasicMaterial({ color: 0xb91c1c })
        );
        mouthMesh.rotation.z = Math.PI;
        mouthMesh.position.set(0, -0.07, 0.22);
        headGroup.add(mouthMesh);

        // Anel de Onda Gravitacional (Ato 9)
        const shockRingGeo = new THREE.RingGeometry(0.2, 0.6, 48);
        shockRingGeo.rotateX(-Math.PI / 2);
        const shockRingMat = new THREE.MeshBasicMaterial({
            color: 0xfde047,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.0
        });
        const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
        shockRing.position.set(0, 0.05, 0);
        scene.add(shockRing);

        /*************************************************************************
         * PINS 3D & FUNÇÃO DE PROJEÇÃO MATRICIAL
         *************************************************************************/
        function getTargetWorldPosition(targetName) {
            const v = new THREE.Vector3();
            switch (targetName) {
                case 'charHead':
                    return headGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.35, 0));
                case 'charFeet':
                    return charPivot.getWorldPosition(v).add(new THREE.Vector3(0, 0.15, 0));
                case 'coffee':
                    return coffeeCupGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.18, 0));
                case 'bench':
                    return benchGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.85, 0));
                case 'hydrant':
                    return hydrantGroup.getWorldPosition(v).add(new THREE.Vector3(0, 0.70, 0));
                case 'leaf':
                    return leaves[0].mesh.getWorldPosition(v).add(new THREE.Vector3(0, 0.20, 0));
                default:
                    return charRoot.getWorldPosition(v).add(new THREE.Vector3(0, 1.2, 0));
            }
        }

        const pinPrimary = document.getElementById('pin-primary');
        const pinSecondary = document.getElementById('pin-secondary');

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
         * Renderizador Deterministico Unificado 60fps & MP4 Frame Capture
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

            // Barra de Progresso Superior
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

            // Atualização de Textos e Badges
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

            // Interpolação de Câmera + Respiração Orgânica
            lerpVec3(prevBeat.camPos, activeBeat.camPos, u, evalCamPos);
            lerpVec3(prevBeat.camLook, activeBeat.camLook, u, evalCamLook);
            const gentleSwayX = Math.sin(t * 0.35) * 0.02;
            const gentleSwayY = Math.cos(t * 0.28) * 0.012;
            camera.position.set(evalCamPos.x + gentleSwayX, evalCamPos.y + gentleSwayY, evalCamPos.z);
            camera.lookAt(evalCamLook);
            camera.updateMatrixWorld();

            const mode = activeBeat.mode;
            const beatProgress = Math.min(1.0, timeInBeat / Math.max(1.0, activeBeat.end - activeBeat.start));

            // ESTADOS DE ANIMAÇÃO DO PERSONAGEM E DO PARQUE
            charPivot.scale.set(1, 1, 1);
            charPivot.rotation.set(0, 0, 0);

            if (mode === 'walking') {
                // Ato 1: Caminha tranquilamente pelo caminho de pedra
                const walkCycle = Math.sin(t * 7.5);
                leftLegPivot.rotation.x = walkCycle * 0.45;
                rightLegPivot.rotation.x = -walkCycle * 0.45;
                leftArmPivot.rotation.x = -walkCycle * 0.35;
                rightArmPivot.rotation.x = 0.25; // Segura xícara firmemente
                coffeeCupGroup.position.set(0, -0.35, 0.12);
                coffeeCupGroup.rotation.set(0, 0, 0);

                charRoot.position.set(0, Math.abs(Math.sin(t * 7.5)) * 0.05, 0.5 - t * 0.12);
                headMesh.rotation.y = Math.sin(t * 1.5) * 0.1;
                mouthMesh.rotation.z = Math.PI; // Sorriso calmo

                benchGroup.position.y = 0;
                benchGroup.rotation.set(0, -0.45, 0);
                hydrantGroup.position.y = 0;
                hydrantGroup.rotation.set(0, 0, 0);
                leaves.forEach(l => { l.mesh.position.y = l.initY; });
                coffeeBlobs.forEach(b => { b.visible = false; });
            }
            else if (mode === 'alert') {
                // Ato 2: Para a caminhada e olha intrigado para o horizonte
                leftLegPivot.rotation.x = 0;
                rightLegPivot.rotation.x = 0;
                leftArmPivot.rotation.x = 0.1;
                rightArmPivot.rotation.x = 0.35;
                charRoot.position.set(0, 0, 0);
                headGroup.rotation.y = Math.sin(t * 2.2) * 0.28;
                mouthMesh.rotation.z = 0; // Boca séria
            }
            else if (mode === 'floatStart') {
                // Ato 3: O café escorrega e flutua! Folhas começam a subir
                rightArmPivot.rotation.x = 0.5;
                coffeeCupGroup.position.set(0.12, -0.22 + Math.sin(t * 2.0) * 0.08, 0.25);
                coffeeCupGroup.rotation.z = Math.sin(t * 1.8) * 0.25;

                coffeeBlobs.forEach((b, idx) => {
                    b.visible = true;
                    b.position.set(
                        coffeeCupGroup.getWorldPosition(new THREE.Vector3()).x + Math.sin(t * 2 + idx) * 0.08,
                        coffeeCupGroup.getWorldPosition(new THREE.Vector3()).y + 0.12 + (idx * 0.06),
                        coffeeCupGroup.getWorldPosition(new THREE.Vector3()).z + Math.cos(t * 2 + idx) * 0.08
                    );
                });

                leaves.forEach(l => {
                    l.mesh.position.y = l.initY + Math.min(0.8, timeInBeat * l.speed);
                    l.mesh.rotation.y = t * l.rotSpeed;
                });
            }
            else if (mode === 'personFloating' || mode === 'risingFast' || mode === 'fullZeroG' || mode === 'vacuumPanic' || mode === 'apexHeight') {
                // Atos 4 a 8: O personagem perde o chão e flutua até a altura máxima!
                let floatHeight = 0.4;
                if (mode === 'personFloating') floatHeight = lerpNum(0.1, 1.2, u);
                else if (mode === 'risingFast') floatHeight = lerpNum(1.2, 2.3, u);
                else if (mode === 'fullZeroG') floatHeight = lerpNum(2.3, 2.9, u);
                else if (mode === 'vacuumPanic') floatHeight = lerpNum(2.9, 3.4, u);
                else if (mode === 'apexHeight') floatHeight = 3.6 + Math.sin(t * 1.2) * 0.12;

                charRoot.position.set(Math.sin(t * 0.6) * 0.18, floatHeight, Math.cos(t * 0.5) * 0.15);

                // Movimento corporal de "nadar no ar"
                const swimCycle = Math.sin(t * 2.8);
                leftArmPivot.rotation.set(swimCycle * 0.5, 0, -0.4 + Math.sin(t * 2) * 0.2);
                rightArmPivot.rotation.set(-swimCycle * 0.5, 0, 0.4 + Math.sin(t * 2) * 0.2);
                leftLegPivot.rotation.set(-swimCycle * 0.35, 0, -0.15);
                rightLegPivot.rotation.set(swimCycle * 0.35, 0, 0.15);

                charPivot.rotation.z = Math.sin(t * 0.8) * 0.18;
                charPivot.rotation.x = Math.cos(t * 0.7) * 0.12;

                mouthMesh.rotation.z = 0; // Boca em choque
                leftEye.scale.set(1.2, 1.2, 1.2);
                rightEye.scale.set(1.2, 1.2, 1.2);

                // Objetos do parque também sobem em gravidade zero
                const objLift = Math.min(2.2, (t - 17.5) * 0.15);
                benchGroup.position.y = Math.max(0, objLift * 0.85);
                benchGroup.rotation.x = Math.sin(t * 0.4) * 0.18;
                benchGroup.rotation.z = Math.cos(t * 0.5) * 0.12;

                hydrantGroup.position.y = Math.max(0, objLift * 0.65);
                hydrantGroup.rotation.y = t * 0.35;

                leaves.forEach(l => {
                    l.mesh.position.y = Math.min(4.5, l.initY + (t - 12.0) * l.speed);
                    l.mesh.rotation.x += 0.02;
                    l.mesh.rotation.y += 0.03;
                });
            }
            else if (mode === 'gravitySnap') {
                // Ato 9: A gravidade é religada! Onda de choque e início de queda
                const flash = Math.sin(Math.min(1.0, timeInBeat / 1.5) * Math.PI);
                gravityGlowLight.intensity = flash * 3.5;
                shockRingMat.opacity = flash * 0.9;
                shockRing.scale.set(1 + flash * 5, 1 + flash * 5, 1);

                charRoot.position.set(0, lerpNum(3.6, 2.4, u), 0);
                leftArmPivot.rotation.set(-0.8, 0, -0.6);
                rightArmPivot.rotation.set(-0.8, 0, 0.6);
            }
            else if (mode === 'fallingFast') {
                // Ato 10: Queda veloz em direção ao gramado
                const fallProgress = timeInBeat / (activeBeat.end - activeBeat.start);
                charRoot.position.set(0, lerpNum(2.4, 0.2, easeInOutCubic(fallProgress)), 0);
                leftArmPivot.rotation.x = -1.2;
                rightArmPivot.rotation.x = -1.2;
                leftLegPivot.rotation.x = 0.2;
                rightLegPivot.rotation.x = 0.2;

                benchGroup.position.y = lerpNum(1.8, 0, fallProgress);
                benchGroup.rotation.set(0, -0.45, 0);
                hydrantGroup.position.y = lerpNum(1.4, 0, fallProgress);
                hydrantGroup.rotation.set(0, 0, 0);
                leaves.forEach(l => { l.mesh.position.y = lerpNum(3.5, l.initY, fallProgress); });
                coffeeBlobs.forEach(b => { b.visible = false; });
            }
            else if (mode === 'springLanding') {
                // Ato 11: Pouso de Mola no Gramado Macio + Café volta para a xícara!
                charRoot.position.set(0, 0, 0);
                const springT = Math.min(1.0, timeInBeat / 1.2);
                // Física de Mola: Squash & Stretch
                const squash = 1.0 - Math.sin(springT * Math.PI * 3) * Math.exp(-springT * 3.5) * 0.38;
                charPivot.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

                leftLegPivot.rotation.set(0.6, 0, -0.4);
                rightLegPivot.rotation.set(0.6, 0, 0.4);
                leftArmPivot.rotation.set(0.2, 0, -0.2);
                rightArmPivot.rotation.set(0.35, 0, 0.15);

                coffeeCupGroup.position.set(0, -0.35, 0.12);
                coffeeCupGroup.rotation.set(0, 0, 0);

                benchGroup.position.y = 0;
                hydrantGroup.position.y = 0;
                mouthMesh.rotation.z = Math.PI; // Sorriso de alívio
            }
            else if (mode === 'celebrate') {
                // Ato 12: Em pé, sacode a poeira e faz pose de triunfo
                charRoot.position.set(0, 0, 0);
                leftLegPivot.rotation.set(0, 0, 0);
                rightLegPivot.rotation.set(0, 0, 0);
                leftArmPivot.rotation.set(-0.2 + Math.sin(t * 3.5) * 0.15, 0, -0.5); // Acena
                rightArmPivot.rotation.set(0.35, 0, 0.1); // Segura o café vitorioso
                headGroup.rotation.y = Math.sin(t * 1.5) * 0.15;
                mouthMesh.rotation.z = Math.PI; // Sorriso vitorioso
            }

            // Alinhamento dos Pins 3D
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
console.log(`✅ Novo arquivo HTML (Vídeo #3) criado em: ${DOWNLOAD_PATH}`);

fs.writeFileSync(LOCAL_PATH, htmlContent, 'utf8');
console.log(`✅ Cópia no projeto salva em: ${LOCAL_PATH}`);
