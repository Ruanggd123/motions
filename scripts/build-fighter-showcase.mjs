import { readFileSync, writeFileSync } from 'node:fs';

// Lê o FighterCharacter.js e remove imports/exports para uso direto inline
function cleanModule(code) {
  return code
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+/g, '');
}

const fighterCode = cleanModule(readFileSync('src/fighter/FighterCharacter.js', 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Showcase: Personagem 3D Anatômico Estilo Ultimato AI (Raio-X Seletivo)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #060709;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            user-select: none;
            -webkit-user-select: none;
        }
        #webgl-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
        .glass-panel {
            background: rgba(11, 14, 20, 0.92);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7);
        }
        .btn-action {
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-action:hover {
            transform: translateY(-1px);
        }
        .btn-action:active {
            transform: scale(0.96);
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen bg-black">
    <div id="showcase-container" class="relative w-full h-full max-w-[540px] max-h-[960px] aspect-[9/16] overflow-hidden bg-[#060709] shadow-2xl flex flex-col justify-between">
        <canvas id="webgl-canvas"></canvas>

        <!-- TOP BAR: BRANDING + STATUS -->
        <div class="absolute top-0 inset-x-0 p-3.5 pointer-events-none flex flex-col gap-2 z-10">
            <div class="flex items-center justify-between w-full">
                <!-- Badge Ultimato AI -->
                <div class="flex items-center shadow-lg pointer-events-auto">
                    <span class="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black italic tracking-tighter text-xs px-2.5 py-1 rounded-l-md">
                        ULTIMATOAI
                    </span>
                    <span class="bg-[#18181b] border border-white/20 text-white font-extrabold tracking-widest text-[11px] px-2 py-1 rounded-r-md uppercase">
                        ANATOMIA COMPLETA
                    </span>
                </div>

                <!-- Turntable Toggle -->
                <button id="btn-turntable" onclick="toggleTurntable()" class="pointer-events-auto glass-panel text-white/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold hover:bg-white/10 transition-all">
                    <span id="turntable-icon">🔄</span>
                    <span id="turntable-label">Girar 360°</span>
                </button>
            </div>

            <div class="flex items-center justify-center">
                <span id="status-tag" class="glass-panel text-cyan-300 font-mono text-[11px] tracking-wider uppercase px-3 py-0.5 rounded-full">
                    ✨ MANEQUIM ANATÔMICO + RAIO-X SELETIVO
                </span>
            </div>
        </div>

        <!-- BOTTOM CONTROL DECK (BENTO GRID MODULAR) -->
        <div class="absolute bottom-0 inset-x-0 p-3.5 pointer-events-none flex flex-col gap-2 z-10">
            <div class="glass-panel rounded-2xl p-3 flex flex-col gap-2 pointer-events-auto max-h-[460px] overflow-y-auto">
                <!-- Linha 1: Modo de Visualização (Sólido vs Raio-X vs Esqueleto) -->
                <div class="flex items-center justify-between gap-1.5">
                    <span class="text-white/60 font-mono text-[10px] uppercase font-bold tracking-wider pl-1">Camada:</span>
                    <div class="grid grid-cols-3 gap-1.5 flex-1">
                        <button onclick="setMode('solid')" id="btn-mode-solid" class="btn-action bg-white/20 text-white text-xs py-1.5 px-2 rounded-lg font-bold border border-white/30 flex items-center justify-center gap-1 shadow-md">
                            <span>🧍</span> Sólido
                        </button>
                        <button onclick="setMode('xray-soft')" id="btn-mode-xray-soft" class="btn-action bg-black/40 text-white/70 text-xs py-1.5 px-2 rounded-lg font-bold border border-white/10 flex items-center justify-center gap-1 hover:text-white">
                            <span>✨</span> Raio-X
                        </button>
                        <button onclick="setMode('xray-pure')" id="btn-mode-xray-pure" class="btn-action bg-black/40 text-white/70 text-xs py-1.5 px-2 rounded-lg font-bold border border-white/10 flex items-center justify-center gap-1 hover:text-white">
                            <span>💀</span> Esqueleto
                        </button>
                    </div>
                </div>

                <!-- Linha 2: Seletor de Órgãos do Raio-X -->
                <div id="organ-control-box" class="flex flex-col gap-1.5 bg-black/30 p-2 rounded-xl border border-white/5">
                    <div class="flex items-center justify-between">
                        <span class="text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">🔬 Órgãos no Raio-X:</span>
                        <div class="flex items-center gap-1 text-[10px] font-mono">
                            <button onclick="setPresetXRay('neuro')" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/90">Neuro</button>
                            <button onclick="setPresetXRay('cardio')" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/90">Cardio</button>
                            <button onclick="setPresetXRay('respiratory')" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/90">Pulmão</button>
                            <button onclick="setPresetXRay('visceral')" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/90">Digestivo</button>
                            <button onclick="setPresetXRay('all')" class="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold">Todos</button>
                        </div>
                    </div>
                    <!-- Toggles individuais por camada -->
                    <div class="grid grid-cols-5 gap-1 text-[10px]">
                        <button onclick="toggleOrgan('neuro')" id="tog-neuro" class="btn-action py-1 px-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold flex flex-col items-center">
                            <span>🧠</span> Neuro
                        </button>
                        <button onclick="toggleOrgan('cardio')" id="tog-cardio" class="btn-action py-1 px-1 rounded bg-red-950/60 text-red-300 border border-red-500/40 font-bold flex flex-col items-center">
                            <span>🫀</span> Cardio
                        </button>
                        <button onclick="toggleOrgan('respiratory')" id="tog-respiratory" class="btn-action py-1 px-1 rounded bg-pink-950/60 text-pink-300 border border-pink-500/40 font-bold flex flex-col items-center">
                            <span>🫁</span> Pulmões
                        </button>
                        <button onclick="toggleOrgan('digestive')" id="tog-digestive" class="btn-action py-1 px-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 font-bold flex flex-col items-center">
                            <span>🥩</span> Visceral
                        </button>
                        <button onclick="toggleOrgan('skeleton')" id="tog-skeleton" class="btn-action py-1 px-1 rounded bg-slate-800 text-slate-200 border border-slate-500/40 font-bold flex flex-col items-center">
                            <span>💀</span> Ossos
                        </button>
                    </div>
                </div>

                <!-- Linha 3: Poses de Combate -->
                <div class="flex items-center justify-between gap-1.5">
                    <span class="text-white/60 font-mono text-[10px] uppercase font-bold tracking-wider pl-1">Pose:</span>
                    <div class="grid grid-cols-4 gap-1 flex-1">
                        <button onclick="setPose('guard')" id="btn-pose-guard" class="btn-action bg-rose-600 text-white text-[11px] py-1.5 px-1.5 rounded-lg font-bold flex items-center justify-center shadow-md">
                            🥊 Guarda
                        </button>
                        <button onclick="setPose('hook')" id="btn-pose-hook" class="btn-action bg-black/40 text-white/70 text-[11px] py-1.5 px-1.5 rounded-lg font-bold border border-white/10 hover:text-white flex items-center justify-center">
                            💥 Gancho
                        </button>
                        <button onclick="setPose('shock')" id="btn-pose-shock" class="btn-action bg-black/40 text-white/70 text-[11px] py-1.5 px-1.5 rounded-lg font-bold border border-white/10 hover:text-white flex items-center justify-center">
                            ⚡ Choque
                        </button>
                        <button onclick="setPose('ko')" id="btn-pose-ko" class="btn-action bg-black/40 text-white/70 text-[11px] py-1.5 px-1.5 rounded-lg font-bold border border-white/10 hover:text-white flex items-center justify-center">
                            💀 Nocaute
                        </button>
                    </div>
                </div>

                <!-- Linha 4: Câmeras, Cores e Tema da Pele -->
                <div class="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <!-- Alternar Canto (Vermelho vs Azul) e Pele (Alabastro vs Titânio) -->
                    <div class="flex items-center gap-1.5">
                        <button onclick="switchCorner('red')" id="btn-corner-red" class="w-5 h-5 rounded-full bg-rose-600 border-2 border-white ring-2 ring-rose-500 shadow-md" title="Canto Vermelho"></button>
                        <button onclick="switchCorner('blue')" id="btn-corner-blue" class="w-5 h-5 rounded-full bg-blue-600 border border-white/40 shadow-md opacity-60 hover:opacity-100" title="Canto Azul"></button>
                        <div class="w-px h-4 bg-white/20 mx-0.5"></div>
                        <button onclick="toggleSkinTheme()" id="btn-skin-theme" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/90 border border-white/20" title="Alternar entre Alabastro Nobre e Titânio Escuro">
                            🎨 <span id="skin-theme-label">Alabastro</span>
                        </button>
                    </div>

                    <!-- Botões de Câmera Rápida -->
                    <div class="flex items-center gap-1">
                        <button onclick="setCamera('full')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Corpo</button>
                        <button onclick="setCamera('head')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Cabeça</button>
                        <button onclick="setCamera('chest')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Tórax</button>
                        <button onclick="setCamera('viscera')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Abdômen</button>
                        <button onclick="setCamera('topdown')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Top-Down</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        ${fighterCode}

        const viewport = document.getElementById('showcase-container');
        const canvas = document.getElementById('webgl-canvas');

        const scene = new THREE.Scene();
        const STUDIO_BG_COLOR = 0x080a0f;
        scene.background = new THREE.Color(STUDIO_BG_COLOR);
        scene.fog = new THREE.FogExp2(STUDIO_BG_COLOR, 0.035);

        const camera = new THREE.PerspectiveCamera(38, viewport.clientWidth / viewport.clientHeight, 0.1, 50);
        camera.position.set(0, 1.15, 2.7);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true
        });
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        let controls = null;
        if (typeof THREE.OrbitControls === 'function') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.target.set(0, 0.95, 0);
            controls.maxDistance = 6.0;
            controls.minDistance = 0.4;
        }
        camera.lookAt(0, 0.95, 0);

        // --- PISO DE ESTÁDIO COM ILUMINAÇÃO DE COMBATE ---
        const floorGeom = new THREE.CylinderGeometry(3.6, 3.6, 0.1, 48);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0c0f16,
            roughness: 0.55,
            metalness: 0.20
        });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.position.y = -0.05;
        floor.receiveShadow = true;
        scene.add(floor);

        const ringGeom = new THREE.RingGeometry(1.4, 1.415, 64);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e2433, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 0.002;
        scene.add(ring);

        // --- SISTEMA DE ILUMINAÇÃO CINEMATOGRÁFICA ---
        const ambientLight = new THREE.AmbientLight(0x202430, 0.50);
        scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.55);
        scene.add(hemiLight);

        // Key light frontal com sombras suaves
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.30);
        keyLight.position.set(2.2, 4.8, 3.6);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 12.0;
        keyLight.shadow.bias = -0.0005;
        scene.add(keyLight);

        // Fill light suave do lado oposto
        const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.50);
        fillLight.position.set(-2.8, 2.2, 2.0);
        scene.add(fillLight);

        // Rim light azul ciano elétrico nas costas/ombros (destaque de silhueta de campeão)
        const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.20);
        rimLight.position.set(-2.5, 3.5, -3.2);
        scene.add(rimLight);

        // Rim light secundário quente
        const warmRim = new THREE.DirectionalLight(0xf59e0b, 0.45);
        warmRim.position.set(2.5, 1.8, -2.5);
        scene.add(warmRim);

        // --- INSTANCIAÇÃO DO PERSONAGEM ---
        let currentCorner = 'red';
        let currentSkinTheme = 'alabaster';
        let fighter = createFighterCharacter({ corner: currentCorner });
        scene.add(fighter.root);

        // --- ESTADO DA APLICAÇÃO ---
        let currentMode = 'solid'; // 'solid' | 'xray-soft' | 'xray-pure'
        let currentPose = 'guard';
        let isTurntableActive = false;
        let turntableSpeed = 0.008;

        const organStates = {
            neuro: true,
            cardio: true,
            respiratory: true,
            digestive: true,
            skeleton: true
        };

        // --- TRANSIÇÕES DE CÂMERA SUAVES ---
        let targetCamPos = new THREE.Vector3(0, 1.15, 2.7);
        let targetCamTarget = new THREE.Vector3(0, 0.95, 0);

        window.setCamera = function(view) {
            if (view === 'full') {
                targetCamPos.set(0, 1.15, 2.7);
                targetCamTarget.set(0, 0.95, 0);
            } else if (view === 'head') {
                targetCamPos.set(0, 1.48, 0.85);
                targetCamTarget.set(0, 1.44, 0);
            } else if (view === 'chest') {
                targetCamPos.set(0, 1.24, 1.10);
                targetCamTarget.set(0, 1.20, 0);
            } else if (view === 'viscera') {
                targetCamPos.set(0, 0.98, 1.05);
                targetCamTarget.set(0, 0.92, 0);
            } else if (view === 'topdown') {
                targetCamPos.set(0, 2.8, 0.05);
                targetCamTarget.set(0, 1.2, 0);
            }
        };

        // --- CONTROLE DE MODOS ---
        window.setMode = function(mode) {
            currentMode = mode;
            const btnSolid = document.getElementById('btn-mode-solid');
            const btnXRaySoft = document.getElementById('btn-mode-xray-soft');
            const btnXRayPure = document.getElementById('btn-mode-xray-pure');
            const statusTag = document.getElementById('status-tag');
            const organBox = document.getElementById('organ-control-box');

            [btnSolid, btnXRaySoft, btnXRayPure].forEach(b => {
                b.className = 'btn-action bg-black/40 text-white/70 text-xs py-1.5 px-2 rounded-lg font-bold border border-white/10 flex items-center justify-center gap-1 hover:text-white';
            });

            if (mode === 'solid') {
                btnSolid.className = 'btn-action bg-white/20 text-white text-xs py-1.5 px-2 rounded-lg font-bold border border-white/30 flex items-center justify-center gap-1 shadow-md';
                fighter.setXRay(false);
                statusTag.innerHTML = '🧍 MANEQUIM SÓLIDO ESCULTURA CONTÍNUA';
                organBox.classList.add('opacity-50', 'pointer-events-none');
            } else if (mode === 'xray-soft') {
                btnXRaySoft.className = 'btn-action bg-cyan-600/40 text-cyan-200 text-xs py-1.5 px-2 rounded-lg font-bold border border-cyan-400/40 flex items-center justify-center gap-1 shadow-md';
                fighter.setXRay(true, { pureSkeleton: false });
                statusTag.innerHTML = '✨ MANEQUIM TRANSLÚCIDO + RAIO-X SELETIVO';
                organBox.classList.remove('opacity-50', 'pointer-events-none');
            } else if (mode === 'xray-pure') {
                btnXRayPure.className = 'btn-action bg-purple-600/40 text-purple-200 text-xs py-1.5 px-2 rounded-lg font-bold border border-purple-400/40 flex items-center justify-center gap-1 shadow-md';
                fighter.setXRay(true, { pureSkeleton: true });
                statusTag.innerHTML = '💀 MODO ESQUELETO PURO + ÓRGÃOS INTERNOS';
                organBox.classList.remove('opacity-50', 'pointer-events-none');
            }
        };

        // --- CONTROLE DE ÓRGÃOS ---
        function updateOrganButtonsUI() {
            const map = {
                neuro: { btn: 'tog-neuro', activeClass: 'bg-rose-950/60 text-rose-300 border-rose-500/40' },
                cardio: { btn: 'tog-cardio', activeClass: 'bg-red-950/60 text-red-300 border-red-500/40' },
                respiratory: { btn: 'tog-respiratory', activeClass: 'bg-pink-950/60 text-pink-300 border-pink-500/40' },
                digestive: { btn: 'tog-digestive', activeClass: 'bg-purple-950/60 text-purple-300 border-purple-500/40' },
                skeleton: { btn: 'tog-skeleton', activeClass: 'bg-slate-800 text-slate-200 border-slate-500/40' }
            };

            Object.keys(map).forEach(key => {
                const b = document.getElementById(map[key].btn);
                if (!b) return;
                const isOn = organStates[key];
                if (isOn) {
                    b.className = \`btn-action py-1 px-1 rounded \${map[key].activeClass} border font-bold flex flex-col items-center\`;
                } else {
                    b.className = 'btn-action py-1 px-1 rounded bg-black/40 text-white/40 border border-white/5 font-bold flex flex-col items-center';
                }
            });
        }

        window.toggleOrgan = function(category) {
            organStates[category] = !organStates[category];
            fighter.setXRayLayers(organStates);
            updateOrganButtonsUI();
        };

        window.setPresetXRay = function(presetName) {
            if (presetName === 'all') {
                Object.keys(organStates).forEach(k => organStates[k] = true);
            } else if (presetName === 'neuro') {
                Object.keys(organStates).forEach(k => organStates[k] = false);
                organStates.skeleton = true;
                organStates.neuro = true;
            } else if (presetName === 'cardio') {
                Object.keys(organStates).forEach(k => organStates[k] = false);
                organStates.skeleton = true;
                organStates.cardio = true;
                organStates.respiratory = true;
            } else if (presetName === 'respiratory') {
                Object.keys(organStates).forEach(k => organStates[k] = false);
                organStates.skeleton = true;
                organStates.respiratory = true;
            } else if (presetName === 'visceral') {
                Object.keys(organStates).forEach(k => organStates[k] = false);
                organStates.skeleton = true;
                organStates.digestive = true;
            }
            fighter.setXRayLayers(organStates);
            updateOrganButtonsUI();
        };

        // --- CONTROLE DE POSES ---
        window.setPose = function(poseName) {
            currentPose = poseName;
            fighter.setPose(poseName);

            const poses = ['guard', 'hook', 'shock', 'ko'];
            poses.forEach(p => {
                const b = document.getElementById('btn-pose-' + p);
                if (!b) return;
                if (p === poseName) {
                    b.className = 'btn-action bg-rose-600 text-white text-[11px] py-1.5 px-1.5 rounded-lg font-bold flex items-center justify-center shadow-md';
                } else {
                    b.className = 'btn-action bg-black/40 text-white/70 text-[11px] py-1.5 px-1.5 rounded-lg font-bold border border-white/10 hover:text-white flex items-center justify-center';
                }
            });
        };

        // --- ALTERNAR CANTO ---
        window.switchCorner = function(corner) {
            if (corner === currentCorner) return;
            currentCorner = corner;

            const btnRed = document.getElementById('btn-corner-red');
            const btnBlue = document.getElementById('btn-corner-blue');
            if (corner === 'red') {
                btnRed.className = 'w-5 h-5 rounded-full bg-rose-600 border-2 border-white ring-2 ring-rose-500 shadow-md';
                btnBlue.className = 'w-5 h-5 rounded-full bg-blue-600 border border-white/40 shadow-md opacity-60 hover:opacity-100';
            } else {
                btnBlue.className = 'w-5 h-5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-500 shadow-md';
                btnRed.className = 'w-5 h-5 rounded-full bg-rose-600 border border-white/40 shadow-md opacity-60 hover:opacity-100';
            }

            // Recria o lutador na mesma pose e modo
            scene.remove(fighter.root);
            fighter = createFighterCharacter({ corner: currentCorner });
            fighter.setSkinTheme(currentSkinTheme);
            scene.add(fighter.root);

            fighter.setPose(currentPose);
            fighter.setXRayLayers(organStates);
            window.setMode(currentMode);
        };

        // --- ALTERNAR TEMA DA PELE SÓLIDA ---
        window.toggleSkinTheme = function() {
            currentSkinTheme = (currentSkinTheme === 'alabaster') ? 'obsidian' : 'alabaster';
            fighter.setSkinTheme(currentSkinTheme);
            const label = document.getElementById('skin-theme-label');
            if (label) {
                label.innerText = currentSkinTheme === 'alabaster' ? 'Alabastro' : 'Titânio';
            }
        };

        // --- TURNTABLE 360° ---
        window.toggleTurntable = function() {
            isTurntableActive = !isTurntableActive;
            const icon = document.getElementById('turntable-icon');
            const label = document.getElementById('turntable-label');
            if (isTurntableActive) {
                icon.innerText = '⏸️';
                label.innerText = 'Pausar Giro';
            } else {
                icon.innerText = '🔄';
                label.innerText = 'Girar 360°';
            }
        };

        // --- LOOP PRINCIPAL DE RENDERIZAÇÃO 60FPS ---
        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            // Giro contínuo se ativado
            if (isTurntableActive) {
                fighter.root.rotation.y += turntableSpeed;
            }

            // Suavização da câmera em direção ao alvo
            camera.position.lerp(targetCamPos, 0.08);
            if (controls) {
                controls.target.lerp(targetCamTarget, 0.08);
                controls.update();
            } else {
                camera.lookAt(targetCamTarget);
            }

            // Micro-respiração orgânica realista
            if (fighter.bones && fighter.bones.chest) {
                const breath = Math.sin(elapsed * 2.2) * 0.005;
                fighter.bones.chest.scale.set(1.0 + breath, 1.0 + breath * 0.8, 1.0 + breath * 1.2);
            }

            renderer.render(scene, camera);
        }

        animate();

        // Inicializa com o modo sólido e UI pronta
        window.setMode('solid');
        updateOrganButtonsUI();

        // Responsividade ao redimensionar janela
        window.addEventListener('resize', () => {
            const w = viewport.clientWidth;
            const h = viewport.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
    </script>
</body>
</html>`;

writeFileSync('fighter-showcase.html', htmlContent, 'utf8');
console.log('✅ fighter-showcase.html gerado com sucesso!');

// Espelho direto para Downloads
const mirrorPath = 'C:/Users/Ruan Gomes/Downloads/personagem_estilo_ultimato_ai_3d.html';
writeFileSync(mirrorPath, htmlContent, 'utf8');
console.log(`✅ Espelhado para: ${mirrorPath}`);
