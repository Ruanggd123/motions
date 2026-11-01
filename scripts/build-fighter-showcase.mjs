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
    <title>Showcase: Personagem 3D Anatômico Estilo Ultimato AI</title>
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
            background-color: #08090d;
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
            background: rgba(13, 16, 24, 0.88);
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
    <div id="showcase-container" class="relative w-full h-full max-w-[540px] max-h-[960px] aspect-[9/16] overflow-hidden bg-[#08090d] shadow-2xl flex flex-col justify-between">
        <canvas id="webgl-canvas"></canvas>

        <!-- TOP BAR: BRANDING + STATUS -->
        <div class="absolute top-0 inset-x-0 p-4 pointer-events-none flex flex-col gap-2 z-10">
            <div class="flex items-center justify-between w-full">
                <!-- Badge Ultimato AI -->
                <div class="flex items-center shadow-lg pointer-events-auto">
                    <span class="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black italic tracking-tighter text-xs px-2.5 py-1 rounded-l-md">
                        ULTIMATOAI
                    </span>
                    <span class="bg-[#18181b] border border-white/20 text-white font-extrabold tracking-widest text-[11px] px-2 py-1 rounded-r-md uppercase">
                        ANATOMIA 3D
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
                    ● MANEQUIM ANATÔMICO FIDELIDADE MÁXIMA
                </span>
            </div>
        </div>

        <!-- BOTTOM CONTROL DECK -->
        <div class="absolute bottom-0 inset-x-0 p-4 pointer-events-none flex flex-col gap-2.5 z-10">
            <!-- PAINEL DE CONTROLES DO PERSONAGEM -->
            <div class="glass-panel rounded-2xl p-3 flex flex-col gap-2.5 pointer-events-auto">
                <!-- Linha 1: Modo de Visualização (Sólido vs Raio-X) -->
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

                <!-- Linha 2: Poses de Combate -->
                <div class="flex items-center justify-between gap-1.5">
                    <span class="text-white/60 font-mono text-[10px] uppercase font-bold tracking-wider pl-1">Pose:</span>
                    <div class="grid grid-cols-4 gap-1 flex-1">
                        <button onclick="setPose('guard')" id="btn-pose-guard" class="btn-action bg-rose-600 text-white text-[11px] py-1.5 px-1.5 rounded-lg font-bold flex items-center justify-center">
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

                <!-- Linha 3: Câmeras e Cores -->
                <div class="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <!-- Alternar Canto (Vermelho vs Azul) -->
                    <div class="flex items-center gap-1">
                        <button onclick="switchCorner('red')" id="btn-corner-red" class="w-6 h-6 rounded-full bg-rose-600 border-2 border-white ring-2 ring-rose-500 shadow-md"></button>
                        <button onclick="switchCorner('blue')" id="btn-corner-blue" class="w-6 h-6 rounded-full bg-blue-600 border border-white/40 shadow-md opacity-60 hover:opacity-100"></button>
                    </div>

                    <!-- Botões de Câmera Rápida -->
                    <div class="flex items-center gap-1">
                        <button onclick="setCamera('full')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Corpo</button>
                        <button onclick="setCamera('head')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Cérebro</button>
                        <button onclick="setCamera('chest')" class="btn-action bg-black/40 hover:bg-white/15 text-white/80 text-[11px] py-1 px-2 rounded font-mono">Costelas</button>
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
        const STUDIO_BG_COLOR = 0x08090d;
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

        // --- PISO DE ESTÚDIO COM ILUMINAÇÃO DE COMBATE ---
        const floorGeom = new THREE.CylinderGeometry(3.6, 3.6, 0.1, 48);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x101218,
            roughness: 0.55,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.position.y = -0.05;
        floor.receiveShadow = true;
        scene.add(floor);

        const ringGeom = new THREE.RingGeometry(1.4, 1.415, 64);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x222634, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 0.002;
        scene.add(ring);

        // --- SISTEMA DE ILUMINAÇÃO DE ESTÚDIO CINEMATOGRÁFICA ---
        const ambientLight = new THREE.AmbientLight(0x181c26, 0.65);
        scene.add(ambientLight);

        // Key light frontal suave
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
        keyLight.position.set(2.0, 4.5, 3.5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        scene.add(keyLight);

        // Fill light azulada fria
        const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.55);
        fillLight.position.set(-3.0, 2.5, 2.0);
        scene.add(fillLight);

        // RIM LIGHT PRINCIPAL (Traseiro alto — O contorno branco recortado!)
        const rimLight = new THREE.DirectionalLight(0xffffff, 3.2);
        rimLight.position.set(0, 4.0, -3.8);
        rimLight.target.position.set(0, 1.0, 0);
        scene.add(rimLight);
        scene.add(rimLight.target);

        // Rim light lateral
        const rimSide = new THREE.DirectionalLight(0x94a3b8, 1.4);
        rimSide.position.set(3.2, 2.0, -2.0);
        rimSide.target.position.set(0, 1.0, 0);
        scene.add(rimSide);
        scene.add(rimSide.target);

        // CRIAMOS O PERSONAGEM PRINCIPAL
        let currentCorner = 'red';
        let fighter = createFighter({ corner: currentCorner });
        scene.add(fighter.group);

        // ESTADO DE CONTROLE
        let isTurntableActive = false; // Pausado por padrão para auditoria estável
        let currentMode = 'solid';
        let currentPoseName = 'guard';

        // POSES CUSTOMIZADAS
        function applyHookPose() {
            fighter.setPose('guard');
            fighter.arms.left.shoulder.rotation.set(-0.15, 0.45, 0.65);
            fighter.arms.left.elbow.rotation.set(-1.57, 0, 0.95);
            fighter.spine.rotation.set(0.05, 0.45, 0);
            fighter.head.rotation.set(0, -0.35, 0);
        }

        function applyShockPose() {
            fighter.setPose('guard');
            fighter.setXRay(true, 0.18);
            fighter.setShock(1.0);
            fighter.head.rotation.set(0.1, 0.95, -0.15);
        }

        function applyKOPose() {
            fighter.setPose('relaxed');
            fighter.hips.position.y = 0.28;
            fighter.hips.rotation.z = 0.4;
            fighter.spine.rotation.set(-0.25, 0, 0.35);
            fighter.head.rotation.set(0.3, 0.35, -0.4);
            fighter.legs.left.knee.rotation.x = -1.2;
            fighter.legs.right.knee.rotation.x = -0.9;
            fighter.arms.left.shoulder.rotation.z = 0.45;
            fighter.arms.right.shoulder.rotation.z = -0.45;
        }

        window.setPose = function(poseName) {
            currentPoseName = poseName;
            fighter.setShock(0);

            ['guard', 'hook', 'shock', 'ko'].forEach(p => {
                const btn = document.getElementById('btn-pose-' + p);
                if (btn) {
                    if (p === poseName) {
                        btn.className = 'btn-action bg-rose-600 text-white text-[11px] py-1.5 px-1.5 rounded-lg font-bold flex items-center justify-center shadow-md';
                    } else {
                        btn.className = 'btn-action bg-black/40 text-white/70 text-[11px] py-1.5 px-1.5 rounded-lg font-bold border border-white/10 hover:text-white flex items-center justify-center';
                    }
                }
            });

            if (poseName === 'guard') fighter.setPose('guard');
            else if (poseName === 'hook') applyHookPose();
            else if (poseName === 'shock') applyShockPose();
            else if (poseName === 'ko') applyKOPose();
        };

        window.setMode = function(mode) {
            currentMode = mode;
            ['solid', 'xray-soft', 'xray-pure'].forEach(m => {
                const btn = document.getElementById('btn-mode-' + m);
                if (btn) {
                    if (m === mode) {
                        btn.className = 'btn-action bg-white/20 text-white text-xs py-1.5 px-2 rounded-lg font-bold border border-white/30 flex items-center justify-center gap-1 shadow-md';
                    } else {
                        btn.className = 'btn-action bg-black/40 text-white/70 text-xs py-1.5 px-2 rounded-lg font-bold border border-white/10 flex items-center justify-center gap-1 hover:text-white';
                    }
                }
            });

            if (mode === 'solid') {
                fighter.setXRay(false);
            } else if (mode === 'xray-soft') {
                fighter.setXRay(true, 0.26);
            } else if (mode === 'xray-pure') {
                fighter.setXRay(true, 0.04);
            }
        };

        window.switchCorner = function(corner) {
            currentCorner = corner;
            const rotY = fighter.root.rotation.y;
            scene.remove(fighter.group);
            fighter = createFighter({ corner });
            fighter.root.rotation.y = rotY;
            scene.add(fighter.group);

            const btnRed = document.getElementById('btn-corner-red');
            const btnBlue = document.getElementById('btn-corner-blue');
            if (corner === 'red') {
                btnRed.className = 'w-6 h-6 rounded-full bg-rose-600 border-2 border-white ring-2 ring-rose-500 shadow-md';
                btnBlue.className = 'w-6 h-6 rounded-full bg-blue-600 border border-white/40 shadow-md opacity-60 hover:opacity-100';
            } else {
                btnBlue.className = 'w-6 h-6 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-500 shadow-md';
                btnRed.className = 'w-6 h-6 rounded-full bg-rose-600 border border-white/40 shadow-md opacity-60 hover:opacity-100';
            }

            setMode(currentMode);
            setPose(currentPoseName);
        };

        let targetCamPos = new THREE.Vector3(0, 1.15, 2.7);
        let targetCamLook = new THREE.Vector3(0, 0.95, 0);

        window.setCamera = function(camType) {
            if (camType === 'full') {
                targetCamPos.set(0, 1.15, 2.7);
                targetCamLook.set(0, 0.95, 0);
            } else if (camType === 'head') {
                targetCamPos.set(0.12, 1.62, 0.85);
                targetCamLook.set(0, 1.58, 0);
            } else if (camType === 'chest') {
                targetCamPos.set(0, 1.28, 1.25);
                targetCamLook.set(0, 1.25, 0);
            } else if (camType === 'topdown') {
                targetCamPos.set(0, 3.2, 0.05);
                targetCamLook.set(0, 1.2, 0);
            }
            camera.position.copy(targetCamPos);
            if (controls) controls.target.copy(targetCamLook);
            camera.lookAt(targetCamLook);
        };

        function updateTurntableBtn() {
            document.getElementById('turntable-icon').textContent = isTurntableActive ? '⏸️' : '🔄';
            document.getElementById('turntable-label').textContent = isTurntableActive ? 'Pausar Giro' : 'Girar 360°';
        }

        window.toggleTurntable = function() {
            isTurntableActive = !isTurntableActive;
            updateTurntableBtn();
        };

        // LOOP DE ANIMAÇÃO 60FPS
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

            if (isTurntableActive) {
                fighter.root.rotation.y += delta * 0.45;
            }

            if (controls) controls.update();
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = viewport.clientWidth / viewport.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        });
    </script>
</body>
</html>`;

writeFileSync('fighter-showcase.html', htmlContent, 'utf8');
writeFileSync('C:/Users/Ruan Gomes/Downloads/personagem_estilo_ultimato_ai_3d.html', htmlContent, 'utf8');

console.log('✅ Showcase do Personagem reconstruído com sucesso:');
console.log('   -> fighter-showcase.html');
console.log('   -> C:/Users/Ruan Gomes/Downloads/personagem_estilo_ultimato_ai_3d.html');
