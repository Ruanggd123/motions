import { readFileSync, writeFileSync } from 'node:fs';

const audioBase64 = readFileSync('output/soco-no-queixo_audio.mp3').toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;

const timingData = JSON.parse(readFileSync('src/socoTiming.json', 'utf8'));
const tb = timingData.beats;

// Lemos os módulos e removemos imports/exports para uso direto inline com Three global
function cleanModule(code) {
  return code
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+/g, '');
}

const fighterCode = cleanModule(readFileSync('src/fighter/FighterCharacter.js', 'utf8'));
const studioCode = cleanModule(readFileSync('src/soco/StudioEnvironment.js', 'utf8'));
const hudCode = cleanModule(readFileSync('src/soco/BiomechanicsHUD.js', 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biomecânica 3D do Nocaute: Por Que Um Soco No Queixo Apaga?</title>
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
            background-color: #080a0f;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            user-select: none;
            -webkit-user-select: none;
        }
        #webgl-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
        .hud-pin {
            position: absolute;
            transform: translate(-50%, -100%);
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
            white-space: nowrap;
        }
        .script-card {
            background: rgba(13, 15, 22, 0.92);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8);
        }
        .hidden-btn {
            opacity: 0 !important;
            pointer-events: none !important;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen bg-black">
    <div id="video-container" class="relative w-full h-full max-w-[480px] max-h-[854px] aspect-[9/16] overflow-hidden bg-[#080a0f] shadow-2xl flex flex-col justify-between">
        <canvas id="webgl-canvas"></canvas>

        <div id="hud-overlay" class="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
            <!-- Topo: Branding ULTIMATOAI LUTA + Status + Áudio -->
            <div class="flex flex-col gap-2 w-full">
                <!-- Barra de Progresso com 6 Traços de Stories -->
                <div class="grid grid-cols-6 gap-1 w-full pt-1">
                    <div id="prog-0" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-0 transition-all duration-75"></div></div>
                    <div id="prog-1" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-0 transition-all duration-75"></div></div>
                    <div id="prog-2" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-0 transition-all duration-75"></div></div>
                    <div id="prog-3" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-0 transition-all duration-75"></div></div>
                    <div id="prog-4" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-0 transition-all duration-75"></div></div>
                    <div id="prog-5" class="h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-0 transition-all duration-75"></div></div>
                </div>

                <div class="flex items-center justify-between w-full mt-1">
                    <!-- Badge ULTIMATOAI LUTA -->
                    <div class="flex items-center shadow-lg pointer-events-auto">
                        <span class="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black italic tracking-tighter text-xs px-2.5 py-1 rounded-l-md">
                            ULTIMATOAI
                        </span>
                        <span class="bg-[#18181b] border border-white/20 text-white font-extrabold tracking-widest text-[11px] px-2 py-1 rounded-r-md uppercase">
                            BIOMECÂNICA
                        </span>
                    </div>

                    <div class="flex items-center gap-2 pointer-events-auto">
                        <!-- Botão Mute / Som -->
                        <button id="btn-mute" onclick="toggleMute(event)" class="bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold hover:bg-white/20 transition-all">
                            <span id="mute-icon">🔊</span>
                            <span id="mute-label">Som</span>
                        </button>
                        <!-- Indicador de Beat -->
                        <div id="beat-counter" class="bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-xs px-2.5 py-1.5 rounded-full font-mono font-bold">
                            1/6
                        </div>
                    </div>
                </div>

                <!-- Tag de Modo de Câmera / Golpe -->
                <div class="flex items-center justify-center mt-1">
                    <span id="mode-badge" class="bg-black/70 backdrop-blur-md border border-white/15 text-white/90 font-mono text-[11px] tracking-wider uppercase px-3 py-0.5 rounded-full shadow-md">
                        ● BIOMECÂNICA 3D
                    </span>
                </div>
            </div>

            <!-- PINs 3D DINÂMICOS NA TELA -->
            <div id="pin-punch" class="hud-pin opacity-0">
                <div class="bg-rose-600/95 text-white font-black text-xs px-3 py-1 rounded-full shadow-xl border border-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>🥊</span>
                    <span id="pin-punch-text">GANCHO: ALAVANCA MÁXIMA</span>
                </div>
                <div class="w-0.5 h-4 bg-rose-500 mx-auto"></div>
            </div>

            <div id="pin-torque" class="hud-pin opacity-0">
                <div class="bg-amber-500/95 text-black font-black text-xs px-3 py-1 rounded-full shadow-xl border border-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>⚡</span>
                    <span id="pin-torque-text">TORQUE: 45 N.m</span>
                </div>
                <div class="w-0.5 h-4 bg-amber-400 mx-auto"></div>
            </div>

            <div id="pin-brainstem" class="hud-pin opacity-0">
                <div class="bg-yellow-400/95 text-black font-black text-xs px-3 py-1 rounded-full shadow-xl border border-yellow-200 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>🧠</span>
                    <span>TRONCO ENCEFÁLICO TORCIDO</span>
                </div>
                <div class="w-0.5 h-4 bg-yellow-400 mx-auto"></div>
            </div>

            <!-- Áudio Master VoiceStudio Embutido -->
            <audio id="master-narration" preload="auto" playsinline>
                <source src="${audioDataUri}" type="audio/mp3">
            </audio>

            <!-- Card Inferior com Legendas Dinâmicas em Tempo Real -->
            <div class="w-full flex flex-col items-center gap-2 pb-1 pointer-events-auto">
                <div id="script-card" class="script-card w-full rounded-2xl p-4 transition-all duration-300">
                    <p id="script-line" class="text-white font-extrabold text-center text-sm md:text-base leading-relaxed tracking-normal font-sans">
                        Por que um soco no queixo <span class="text-amber-400">APAGA</span> uma pessoa instantaneamente?
                    </p>
                </div>
            </div>
        </div>

        <!-- Botão Play / Pause Central Flutuante -->
        <button id="btn-play-pause" onclick="togglePlayPause()" class="absolute inset-0 m-auto w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/30 z-20 transition-all duration-200 hover:scale-105 active:scale-95 hidden-btn">
            <svg id="play-icon" class="w-8 h-8 translate-x-0.5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg id="pause-icon" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
    </div>

    <script>
        const TOTAL_DURATION = ${timingData.totalDuration};
        const BEATS = ${JSON.stringify(tb, null, 2)};

        ${fighterCode}
        ${studioCode}
        ${hudCode}

        const viewport = document.getElementById('video-container');
        const canvas = document.getElementById('webgl-canvas');
        const masterAudio = document.getElementById('master-narration');

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, viewport.clientWidth / viewport.clientHeight, 0.1, 50);
        camera.position.set(0.2, 1.65, 3.6);

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
            controls.target.set(0.15, 1.35, 0.2);
        }
        camera.lookAt(0.15, 1.35, 0.2);

        // CRIAMOS O ESTÚDIO DE COMBATE
        const studio = createStudioEnvironment(scene);

        // CRIAMOS OS DOIS LUTADORES DE ALTA FIDELIDADE
        // 1. Lutador Vermelho (Atacante com Calção Oficial e Luvas 10oz)
        const redFighter = createFighter({ corner: 'red' });
        scene.add(redFighter.group);
        redFighter.root.position.set(0.52, 0, 0.50);
        redFighter.root.rotation.y = 2.75;
        redFighter.setPose('guard');

        // 2. Lutador Azul (Defensor Anatômico com Raio-X Multicamadas)
        const blueFighter = createFighter({ corner: 'blue' });
        scene.add(blueFighter.group);
        blueFighter.root.position.set(-0.20, 0, -0.10);
        blueFighter.root.rotation.y = 0.35;
        blueFighter.setPose('guard');

        // CRIAMOS O HUD BIOMECÂNICO
        const bioHUD = createBiomechanicsHUD(scene);

        // ESTADO DE REPRODUÇÃO
        let isPlaying = false;
        let isMuted = false;
        let currentTime = 0;
        let lastFrameTime = performance.now();

        // ELEMENTOS DO DOM
        const scriptLine = document.getElementById('script-line');
        const modeBadge = document.getElementById('mode-badge');
        const beatCounter = document.getElementById('beat-counter');
        const btnPlayPause = document.getElementById('btn-play-pause');
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const pinPunch = document.getElementById('pin-punch');
        const pinTorque = document.getElementById('pin-torque');
        const pinBrainstem = document.getElementById('pin-brainstem');

        function toScreenXY(pos3D) {
            const v = pos3D.clone();
            v.project(camera);
            const rect = viewport.getBoundingClientRect();
            return {
                x: ((v.x + 1) * 0.5) * rect.width,
                y: ((-v.y + 1) * 0.5) * rect.height,
                visible: v.z < 1.0
            };
        }

        function updateHUDPin(element, pos3D, isVisible) {
            if (!isVisible) {
                element.style.opacity = '0';
                return;
            }
            const s = toScreenXY(pos3D);
            if (s.visible && s.x > 10 && s.x < viewport.clientWidth - 10 && s.y > 10 && s.y < viewport.clientHeight - 80) {
                element.style.left = s.x + 'px';
                element.style.top = s.y + 'px';
                element.style.opacity = '1';
            } else {
                element.style.opacity = '0';
            }
        }

        // FUNÇÃO DE INTERPOLAÇÃO SUAVE (easeInOutCubic)
        function easeInOutCubic(x) {
            return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        }

        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        let currentCamLook = new THREE.Vector3(0.15, 1.35, 0.2);

        // =========================================================================
        // MOTOR DE ANIMAÇÃO DETERMINÍSTICO EVALUATE EM TEMPO REAL
        // =========================================================================
        function evaluateSceneAtTime(t, isSeeking = false) {
            // Determina o Beat Atual
            let currentBeatIdx = 0;
            for (let i = 0; i < BEATS.length; i++) {
                if (t >= BEATS[i].start && t < BEATS[i].end) {
                    currentBeatIdx = i;
                    break;
                }
            }
            if (t >= BEATS[BEATS.length - 1].end) currentBeatIdx = BEATS.length - 1;

            const b = BEATS[currentBeatIdx];
            const localT = t - b.start;
            const progress = clamp(localT / b.duration, 0, 1);

            // Atualiza Barra de Progresso Superior
            for (let i = 0; i < 6; i++) {
                const fill = document.getElementById('prog-' + i).firstElementChild;
                if (i < currentBeatIdx) fill.style.width = '100%';
                else if (i === currentBeatIdx) fill.style.width = (progress * 100) + '%';
                else fill.style.width = '0%';
            }

            beatCounter.textContent = (currentBeatIdx + 1) + '/6';

            // Atualiza Card de Legenda com Palavras-Chave Destaque
            if (currentBeatIdx === 0) {
                modeBadge.textContent = '● 1. O MISTÉRIO DO NOCAUTE';
                scriptLine.innerHTML = 'Por que um soco no queixo <span class="text-amber-400 font-black">APAGA</span> uma pessoa instantaneamente?';
            } else if (currentBeatIdx === 1) {
                modeBadge.textContent = '● 2. SOCO RETO (CENTRO DE MASSA)';
                scriptLine.innerHTML = 'Um <span class="text-cyan-400 font-black">SOCO RETO</span> no nariz empurra a cabeça para trás, e os músculos do pescoço <span class="text-cyan-300 font-black">ABSORVEM</span> o choque.';
            } else if (currentBeatIdx === 2) {
                modeBadge.textContent = '● 3. GANCHO LATERAL (ALAVANCA)';
                scriptLine.innerHTML = 'Já o <span class="text-rose-500 font-black">GANCHO NO QUEIXO</span> atinge a ponta da mandíbula, exatamente na <span class="text-amber-400 font-black">MAIOR ALAVANCA</span> da cabeça.';
            } else if (currentBeatIdx === 3) {
                modeBadge.textContent = '● 4. VISÃO SUPERIOR (TORQUE 90°)';
                scriptLine.innerHTML = 'A cabeça não recua: ela <span class="text-amber-400 font-black">GIRA COM TORQUE BRUTAL</span> a mais de 40 radianos por segundo!';
            } else if (currentBeatIdx === 4) {
                modeBadge.textContent = '● 5. RAIO-X: TRONCO ENCEFÁLICO';
                scriptLine.innerHTML = 'O cérebro <span class="text-rose-400 font-black">COLIDE</span> no crânio e o <span class="text-amber-300 font-black">TRONCO ENCEFÁLICO TORCE</span>, desligando o sistema nervoso na hora!';
            } else {
                modeBadge.textContent = '● 6. O NOCAUTE IMEDIATO';
                scriptLine.innerHTML = 'O corpo desliga como um <span class="text-rose-500 font-black">DISJUNTOR</span> e desaba no chão. Proteger o queixo salva vidas!';
            }

            // RESET BASE DAS POSTURAS DOS LUTADORES
            // Vermelho (Guarda de boxe clássica com base)
            redFighter.root.position.set(0.52, 0, 0.50);
            redFighter.root.rotation.set(0, 2.75, 0);
            redFighter.hips.position.y = 0.95;
            redFighter.spine.rotation.set(0.08, 0, 0);
            redFighter.chest.rotation.set(0.06, 0.15, 0);
            redFighter.neck.rotation.set(-0.04, -0.10, 0);
            redFighter.head.rotation.set(0.04, 0, 0);

            // Braço esquerdo do vermelho (lead jab)
            redFighter.arms.left.shoulder.rotation.set(-0.75, -0.28, -0.10);
            redFighter.arms.left.elbow.rotation.set(-1.95, 0, 0.40);

            // Braço direito do vermelho (rear power hand)
            redFighter.arms.right.shoulder.rotation.set(-0.70, 0.28, 0.12);
            redFighter.arms.right.elbow.rotation.set(-1.90, 0, -0.38);

            // Pernas do vermelho (base atlética)
            redFighter.legs.left.hip.rotation.set(-0.25, 0.1, -0.08);
            redFighter.legs.left.knee.rotation.set(0.32, 0, 0);
            redFighter.legs.right.hip.rotation.set(0.20, -0.1, 0.08);
            redFighter.legs.right.knee.rotation.set(0.26, 0, 0);

            // Azul (Guarda atenta)
            blueFighter.root.position.set(-0.20, 0, -0.10);
            blueFighter.root.rotation.set(0, 0.35, 0);
            blueFighter.hips.position.y = 0.95;
            blueFighter.spine.rotation.set(0.08, 0, 0);
            blueFighter.chest.rotation.set(0, 0, 0);
            blueFighter.neck.rotation.set(0, 0, 0);
            blueFighter.head.rotation.set(0, 0, 0);

            // Braços do azul (guarda alta protegendo queixo)
            blueFighter.arms.left.shoulder.rotation.set(-0.80, -0.30, -0.15);
            blueFighter.arms.left.elbow.rotation.set(-1.95, 0, 0.45);
            blueFighter.arms.right.shoulder.rotation.set(-0.80, 0.30, 0.15);
            blueFighter.arms.right.elbow.rotation.set(-1.95, 0, -0.45);

            // Pernas do azul
            blueFighter.legs.left.hip.rotation.set(-0.20, 0.1, -0.05);
            blueFighter.legs.left.knee.rotation.set(0.28, 0, 0);
            blueFighter.legs.right.hip.rotation.set(0.18, -0.1, 0.05);
            blueFighter.legs.right.knee.rotation.set(0.24, 0, 0);

            // Reset de vértebras cervicais
            blueFighter.cervical.forEach(v => { v.rotation.y = 0; });
            blueFighter.brain.position.set(0, 0.118, -0.008);

            // Raio-X e HUDs Padrão
            bioHUD.straightLineGroup.visible = false;
            bioHUD.leverGroup.visible = false;
            bioHUD.torqueGroup.visible = false;
            bioHUD.triggerImpact(-1);

            let punchPinVisible = false;
            let torquePinVisible = false;
            let brainstemPinVisible = false;
            let targetCamPos = new THREE.Vector3(0.5, 1.58, 3.2);
            let targetCamLook = new THREE.Vector3(0.12, 1.35, 0.2);

            // ---------------------------------------------------------------------
            // BEAT 1: O MISTÉRIO DO QUEIXO (0.0s -> 4.09s)
            // ---------------------------------------------------------------------
            if (currentBeatIdx === 0) {
                blueFighter.setXRay(false);
                const bounce = Math.sin(t * 6.5) * 0.015;
                redFighter.root.position.y = bounce;
                blueFighter.root.position.y = bounce * 0.8;

                // Câmera 3/4 aberta vertical perfeita
                const p = easeInOutCubic(progress);
                targetCamPos.set(0.65 - p * 0.15, 1.58, 3.2 - p * 0.2);
                targetCamLook.set(0.12, 1.35, 0.2);
            }

            // ---------------------------------------------------------------------
            // BEAT 2: O SOCO RETO (4.09s -> 12.29s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 1) {
                blueFighter.setXRay(false);
                // Perfil lateral técnico mostrando a linha de força e absorção
                targetCamPos.set(-2.6, 1.58, 0.50);
                targetCamLook.set(0.15, 1.45, 0.15);

                bioHUD.straightLineGroup.visible = true;

                // Ciclo do soco reto repetindo suavemente
                const cycleT = (localT % 2.8) / 2.8;
                let punchExt = 0;
                if (cycleT < 0.35) punchExt = Math.sin((cycleT / 0.35) * Math.PI * 0.5);
                else if (cycleT < 0.70) punchExt = Math.cos(((cycleT - 0.35) / 0.35) * Math.PI * 0.5);

                // Braço direito do vermelho estende em linha reta
                redFighter.arms.right.shoulder.rotation.set(-1.40, 0.10, -punchExt * 0.35);
                redFighter.arms.right.elbow.rotation.set(-1.55 + punchExt * 1.45, 0, 0);

                // Cabeça do azul recua linearmente (apenas no eixo X, zero giro Y)
                const headRecoil = punchExt * 0.20;
                blueFighter.head.rotation.x = -headRecoil;
                blueFighter.neck.rotation.x = -headRecoil * 0.6;
                blueFighter.chest.rotation.x = -headRecoil * 0.3;

                punchPinVisible = punchExt > 0.6;
                document.getElementById('pin-punch-text').textContent = 'SOCO RETO: FORÇA ABSORVIDA';
            }

            // ---------------------------------------------------------------------
            // BEAT 3: O GANCHO NO QUEIXO (12.29s -> 19.07s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 2) {
                // Câmera frontal média aproximando na mandíbula / queixo
                targetCamPos.set(0.35, 1.55, 1.95);
                targetCamLook.set(-0.05, 1.48, 0.0);

                blueFighter.setXRay(true, 0.20);
                blueFighter.setXRayMode('neuro');
                bioHUD.leverGroup.visible = true;

                // Vermelho carrega o gancho de esquerda em 90 graus
                const prep = clamp(localT / 4.0, 0, 1);
                redFighter.arms.left.shoulder.rotation.set(-0.25, 0.45, 0.55);
                redFighter.arms.left.elbow.rotation.set(-1.55, 0, 0.85);
                redFighter.chest.rotation.y = 0.15 - prep * 0.40;

                punchPinVisible = true;
                document.getElementById('pin-punch-text').textContent = 'ALAVANCA: 12 CM DO EIXO';
            }

            // ---------------------------------------------------------------------
            // BEAT 4: O TORQUE ROTACIONAL / TOP-DOWN 90° (19.07s -> 25.40s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 3) {
                // VISÃO SUPERIOR TOP-DOWN 90 GRAUS (ENQUADRAMENTO CENTRAL)
                const p = easeInOutCubic(clamp(localT / 1.5, 0, 1));
                targetCamPos.set(lerp(0.35, 0.10, p), lerp(1.55, 4.4, p), lerp(1.95, 0.20, p));
                targetCamLook.set(0.10, 0.2, 0.20);

                blueFighter.setXRay(true, 0.16);
                blueFighter.setXRayMode('neuro');
                bioHUD.torqueGroup.visible = true;

                // O GANCHO CONECTA NO QUEIXO
                const punchT = clamp((localT - 0.7) / 1.1, 0, 1);
                const impactProgress = easeInOutCubic(punchT);

                // Vermelho desfere o gancho circular
                redFighter.arms.left.shoulder.rotation.set(-0.15, 0.45 - impactProgress * 0.8, 0.65);
                redFighter.chest.rotation.y = -0.25 + impactProgress * 0.60;

                // Cabeça do azul gira bruscamente 58 graus no eixo Y!
                const headTwist = impactProgress * 1.05;
                blueFighter.head.rotation.y = headTwist;
                blueFighter.neck.rotation.y = headTwist * 0.5;

                if (localT >= 0.7) {
                    bioHUD.triggerImpact(localT - 0.7);
                }

                torquePinVisible = true;
                document.getElementById('pin-torque-text').textContent = 'TORQUE: 45 N.m | 42 rad/s';
            }

            // ---------------------------------------------------------------------
            // BEAT 5: A TORÇÃO DO TRONCO ENCEFÁLICO / RAIO-X (25.40s -> 33.56s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 4) {
                // Close-up na base do crânio e coluna cervical
                targetCamPos.set(0.60, 1.62, 1.25);
                targetCamLook.set(-0.15, 1.45, -0.05);

                blueFighter.setXRay(true, 0.14);
                blueFighter.setXRayMode('all');

                blueFighter.head.rotation.y = 1.02;
                blueFighter.neck.rotation.y = 0.52;

                const brainWobble = Math.sin(localT * 9.0) * Math.exp(-localT * 0.35) * 0.035;
                blueFighter.brain.position.x = brainWobble;

                blueFighter.cervical.forEach((v, i) => {
                    v.rotation.y = (i / 7) * 0.45;
                });

                const pulse = Math.abs(Math.sin(localT * 8.0));
                blueFighter.setShock(pulse);

                brainstemPinVisible = true;
            }

            // ---------------------------------------------------------------------
            // BEAT 6: O NOCAUTE IMEDIATO & DISJUNTOR (33.56s -> 38.00s)
            // ---------------------------------------------------------------------
            else {
                // Câmera aberta vertical registrando a queda e o vencedor
                targetCamPos.set(0.15, 1.40, 3.2);
                targetCamLook.set(0.05, 0.95, 0);

                blueFighter.setXRay(true, 0.22);
                blueFighter.setXRayMode('all');

                const fallProgress = easeInOutCubic(clamp(localT / 2.2, 0, 1));

                // Desabamento suave e convincente
                blueFighter.hips.position.y = lerp(0.95, 0.42, fallProgress);
                blueFighter.spine.rotation.set(-0.35 * fallProgress, 0.15 * fallProgress, -0.20 * fallProgress);
                blueFighter.neck.rotation.set(-0.25 * fallProgress, 0.10 * fallProgress, 0);
                blueFighter.head.rotation.set(-0.35 * fallProgress, 0.15 * fallProgress, 0);

                blueFighter.arms.left.shoulder.rotation.set(0.20 * fallProgress, 0, -0.35 * fallProgress);
                blueFighter.arms.left.elbow.rotation.set(-0.40 * fallProgress, 0, 0);
                blueFighter.arms.right.shoulder.rotation.set(0.15 * fallProgress, 0, 0.40 * fallProgress);
                blueFighter.arms.right.elbow.rotation.set(-0.30 * fallProgress, 0, 0);

                blueFighter.legs.left.hip.rotation.set(-0.60 * fallProgress, 0.20 * fallProgress, -0.20 * fallProgress);
                blueFighter.legs.left.knee.rotation.set(1.40 * fallProgress, 0, 0);
                blueFighter.legs.right.hip.rotation.set(-0.40 * fallProgress, -0.30 * fallProgress, 0.30 * fallProgress);
                blueFighter.legs.right.knee.rotation.set(1.20 * fallProgress, 0, 0);
            }

            // INTERPOLAÇÃO SUAVE DA CÂMERA (easeInOutCubic)
            camera.position.lerp(targetCamPos, isSeeking ? 1.0 : 0.12);
            currentCamLook.lerp(targetCamLook, isSeeking ? 1.0 : 0.12);
            if (controls) controls.target.copy(currentCamLook);
            camera.lookAt(currentCamLook);

            camera.updateMatrixWorld();

            // POSICIONAMENTO DINÂMICO DOS PINS 3D
            const chinWorldPos = new THREE.Vector3(-0.08, 1.48, 0.05);
            updateHUDPin(pinPunch, chinWorldPos, punchPinVisible);

            const topHeadPos = new THREE.Vector3(-0.05, 1.72, 0.0);
            updateHUDPin(pinTorque, topHeadPos, torquePinVisible);

            const brainstemPos = new THREE.Vector3(-0.06, 1.52, -0.04);
            updateHUDPin(pinBrainstem, brainstemPos, brainstemPinVisible);

            renderer.render(scene, camera);
        }

        // CONTROLES DE ÁUDIO E VÍDEO
        function togglePlayPause() {
            if (isPlaying) {
                pauseVideo();
            } else {
                playVideo();
            }
        }

        function playVideo() {
            isPlaying = true;
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            btnPlayPause.classList.add('hidden-btn');

            masterAudio.currentTime = currentTime;
            masterAudio.play().catch(() => {});
            lastFrameTime = performance.now();
        }

        function pauseVideo() {
            isPlaying = false;
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            btnPlayPause.classList.remove('hidden-btn');

            masterAudio.pause();
        }

        function toggleMute(e) {
            e.stopPropagation();
            isMuted = !isMuted;
            masterAudio.muted = isMuted;
            document.getElementById('mute-icon').textContent = isMuted ? '🔇' : '🔊';
            document.getElementById('mute-label').textContent = isMuted ? 'Mudo' : 'Som';
        }

        function seekToTime(t) {
            currentTime = clamp(t, 0, TOTAL_DURATION);
            masterAudio.currentTime = currentTime;
            evaluateSceneAtTime(currentTime, true);
        }

        window.seekToTime = seekToTime;
        window.evaluateSceneAtTime = evaluateSceneAtTime;
        window.renderDeterministicFrame = function(t) {
            isPlaying = false;
            currentTime = t;
            evaluateSceneAtTime(t, true);
        };

        // LOOP DE ANIMAÇÃO 60FPS
        function animate(now) {
            requestAnimationFrame(animate);
            const delta = (now - lastFrameTime) / 1000;
            lastFrameTime = now;

            if (isPlaying) {
                if (!masterAudio.paused && Math.abs(masterAudio.currentTime - currentTime) > 0.3) {
                    currentTime = masterAudio.currentTime;
                } else {
                    currentTime += delta;
                }

                if (currentTime >= TOTAL_DURATION) {
                    currentTime = TOTAL_DURATION;
                    pauseVideo();
                }

                evaluateSceneAtTime(currentTime);
            }

            if (controls && !isPlaying) controls.update();
        }

        // INICIALIZAÇÃO NO BEAT 0
        evaluateSceneAtTime(0, true);
        requestAnimationFrame(animate);

        // Auto-play seguro ao carregar
        window.addEventListener('click', () => {
            if (!isPlaying && currentTime === 0) playVideo();
        }, { once: true });
    </script>
</body>
</html>`;

writeFileSync('biomecanica-nocaute-3d.html', htmlContent, 'utf8');
writeFileSync('C:/Users/Ruan Gomes/Downloads/biomecanica_nocaute_animacao_vertical_3d.html', htmlContent, 'utf8');

console.log('✅ Biomecânica do Nocaute 3D HTML gerado com sucesso:');
console.log('   -> biomecanica-nocaute-3d.html');
console.log('   -> C:/Users/Ruan Gomes/Downloads/biomecanica_nocaute_animacao_vertical_3d.html');
