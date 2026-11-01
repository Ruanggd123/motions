import { readFileSync, writeFileSync } from 'node:fs';

const audioBase64 = readFileSync('output/soco-no-queixo_audio.mp3').toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;

const timingData = JSON.parse(readFileSync('src/socoTiming.json', 'utf8'));
const tb = timingData.beats;

// Lemos o código dos módulos e removemos imports/exports para uso direto inline com Three global
function cleanModule(code) {
  return code
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+/g, '');
}

const mannequinCode = cleanModule(readFileSync('src/soco/AnatomicalMannequin.js', 'utf8'));
const studioCode = cleanModule(readFileSync('src/soco/StudioEnvironment.js', 'utf8'));
const hudCode = cleanModule(readFileSync('src/soco/BiomechanicsHUD.js', 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Por Que Um Soco No Queixo Apaga? — Biomecânica 3D</title>
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
            background-color: #090a0f;
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
            background: rgba(13, 15, 22, 0.90);
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
    <div id="video-container" class="relative w-full h-full max-w-[480px] max-h-[854px] aspect-[9/16] overflow-hidden bg-[#090a0f] shadow-2xl flex flex-col justify-between">
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
                    <!-- Badge ULTIMATOAI LUTA (Idêntico ao do vídeo de referência) -->
                    <div class="flex items-center shadow-lg pointer-events-auto">
                        <span class="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black italic tracking-tighter text-xs px-2.5 py-1 rounded-l-md">
                            ULTIMATOAI
                        </span>
                        <span class="bg-[#18181b] border border-white/20 text-white font-extrabold tracking-widest text-[11px] px-2 py-1 rounded-r-md uppercase">
                            LUTA
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

        ${mannequinCode}
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

        // CRIAMOS OS DOIS LUTADORES
        // 1. Lutador Vermelho (Atacante)
        const redFighter = createAnatomicalMannequin({
            gloveColor: 0xdc2626,
            shortsColor: 0xe11d48,
            bodyColor: 0x3f4654,
            isVictim: false
        });
        scene.add(redFighter.group);
        redFighter.root.position.set(0.52, 0, 0.50);
        redFighter.root.rotation.y = 2.75;

        // 2. Lutador Azul (Defensor com Raio-X)
        const blueFighter = createAnatomicalMannequin({
            gloveColor: 0x2563eb,
            shortsColor: 0x1d4ed8,
            bodyColor: 0x2e3440,
            isVictim: true
        });
        scene.add(blueFighter.group);
        blueFighter.root.position.set(-0.20, 0, -0.10);
        blueFighter.root.rotation.y = 0.35;

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
            // Vermelho (Guarda de boxe clássica)
            redFighter.root.position.set(0.52, 0, 0.50);
            redFighter.root.rotation.set(0, 2.75, 0);
            redFighter.torsoPivot.rotation.set(0.06, 0.15, 0);
            redFighter.neckPivot.rotation.set(-0.04, -0.10, 0);
            redFighter.headPivot.rotation.set(0.04, 0, 0);

            // Braço esquerdo do vermelho (lead jab)
            redFighter.leftArm.shoulderPivot.rotation.set(0.60, 0.25, 0.2);
            redFighter.leftArm.elbowPivot.rotation.set(-1.40, 0, 0.35);

            // Braço direito do vermelho (rear power hand)
            redFighter.rightArm.shoulderPivot.rotation.set(0.75, -0.2, -0.2);
            redFighter.rightArm.elbowPivot.rotation.set(-1.55, 0, -0.3);

            // Pernas do vermelho (base atlética)
            redFighter.leftLeg.hipPivot.rotation.set(-0.22, 0, 0);
            redFighter.leftLeg.kneePivot.rotation.set(0.30, 0, 0);
            redFighter.rightLeg.hipPivot.rotation.set(0.18, 0, 0);
            redFighter.rightLeg.kneePivot.rotation.set(0.22, 0, 0);

            // Azul (Guarda de boxe atenta)
            blueFighter.root.position.set(-0.20, 0, -0.10);
            blueFighter.root.rotation.set(0, 0.35, 0);
            blueFighter.pelvisPivot.position.y = 1.0;
            blueFighter.pelvisPivot.rotation.set(0, 0, 0);
            blueFighter.torsoPivot.rotation.set(0, 0, 0);
            blueFighter.neckPivot.rotation.set(0, 0, 0);
            blueFighter.headPivot.rotation.set(0, 0, 0);

            // Braços do azul (guarda alta protegendo o queixo)
            blueFighter.leftArm.shoulderPivot.rotation.set(0.80, 0.30, 0.15);
            blueFighter.leftArm.elbowPivot.rotation.set(-1.70, 0, 0.45);
            blueFighter.rightArm.shoulderPivot.rotation.set(0.80, -0.30, -0.15);
            blueFighter.rightArm.elbowPivot.rotation.set(-1.70, 0, -0.45);

            // Pernas do azul
            blueFighter.leftLeg.hipPivot.rotation.set(-0.15, 0, 0);
            blueFighter.leftLeg.kneePivot.rotation.set(0.20, 0, 0);
            blueFighter.rightLeg.hipPivot.rotation.set(0.15, 0, 0);
            blueFighter.rightLeg.kneePivot.rotation.set(0.18, 0, 0);

            // Raio-X e HUDs Padrão
            blueFighter.setXRayMode(true, 0.28);
            blueFighter.setShockPulse(0);
            bioHUD.straightLineGroup.visible = false;
            bioHUD.leverGroup.visible = false;
            bioHUD.torqueGroup.visible = false;
            bioHUD.triggerImpact(-1);

            let punchPinVisible = false;
            let torquePinVisible = false;
            let brainstemPinVisible = false;
            let targetCamPos = new THREE.Vector3(0.2, 1.65, 3.6);
            let targetCamLook = new THREE.Vector3(0.15, 1.35, 0.2);

            // ---------------------------------------------------------------------
            // BEAT 1: O MISTÉRIO DO QUEIXO (0.0s -> 4.09s)
            // ---------------------------------------------------------------------
            if (currentBeatIdx === 0) {
                const bounce = Math.sin(t * 6.5) * 0.015;
                redFighter.root.position.y = bounce;
                blueFighter.root.position.y = bounce * 0.8;

                // Câmera 3/4 aberta vertical perfeita
                const p = easeInOutCubic(progress);
                targetCamPos.set(0.3 - p * 0.15, 1.60, 3.6 - p * 0.3);
                targetCamLook.set(0.15, 1.35, 0.2);
            }

            // ---------------------------------------------------------------------
            // BEAT 2: O SOCO RETO (4.09s -> 12.29s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 1) {
                // Perfil lateral perfeito mostrando a linha de força e absorção
                targetCamPos.set(-2.6, 1.58, 0.50);
                targetCamLook.set(0.15, 1.45, 0.15);

                bioHUD.straightLineGroup.visible = true;

                // Ciclo do soco reto repetindo suavemente
                const cycleT = (localT % 2.8) / 2.8;
                let punchExt = 0;
                if (cycleT < 0.35) punchExt = Math.sin((cycleT / 0.35) * Math.PI * 0.5);
                else if (cycleT < 0.70) punchExt = Math.cos(((cycleT - 0.35) / 0.35) * Math.PI * 0.5);

                // Braço direito do vermelho estende em linha reta
                redFighter.rightArm.shoulderPivot.rotation.set(1.40, 0.10, -punchExt * 0.35);
                redFighter.rightArm.elbowPivot.rotation.set(-1.55 + punchExt * 1.45, 0, 0);

                // Cabeça do azul recua linearmente (apenas no eixo X, zero giro Y)
                const headRecoil = punchExt * 0.20;
                blueFighter.headPivot.rotation.x = -headRecoil;
                blueFighter.neckPivot.rotation.x = -headRecoil * 0.6;
                blueFighter.torsoPivot.rotation.x = -headRecoil * 0.3;

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

                blueFighter.setXRayMode(true, 0.22);
                bioHUD.leverGroup.visible = true;

                // Vermelho carrega o gancho de esquerda em 90 graus
                const prep = clamp(localT / 4.0, 0, 1);
                redFighter.leftArm.shoulderPivot.rotation.set(1.10, 0.65, 0.35);
                redFighter.leftArm.elbowPivot.rotation.set(-1.55, 0, 0.85);
                redFighter.torsoPivot.rotation.y = 0.15 - prep * 0.40;

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

                blueFighter.setXRayMode(true, 0.16);
                bioHUD.torqueGroup.visible = true;

                // O GANCHO CONECTA NO QUEIXO
                const punchT = clamp((localT - 0.7) / 1.1, 0, 1);
                const impactProgress = easeInOutCubic(punchT);

                // Vermelho desfere o gancho circular
                redFighter.leftArm.shoulderPivot.rotation.set(1.20, 0.75 - impactProgress * 0.9, 0.30);
                redFighter.torsoPivot.rotation.y = -0.25 + impactProgress * 0.60;

                // Cabeça do azul gira bruscamente 58 graus no eixo Y!
                const headTwist = impactProgress * 1.05;
                blueFighter.headPivot.rotation.y = headTwist;
                blueFighter.neckPivot.rotation.y = headTwist * 0.5;

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

                blueFighter.setXRayMode(true, 0.12);

                blueFighter.headPivot.rotation.y = 1.02;
                blueFighter.neckPivot.rotation.y = 0.52;

                const brainWobble = Math.sin(localT * 9.0) * Math.exp(-localT * 0.35) * 0.035;
                blueFighter.brainPivot.position.x = brainWobble;

                blueFighter.vertebrae.forEach((v, i) => {
                    v.rotation.y = (i / 7) * 0.45;
                });

                const pulse = Math.abs(Math.sin(localT * 8.0));
                blueFighter.setShockPulse(pulse);

                brainstemPinVisible = true;
            }

            // ---------------------------------------------------------------------
            // BEAT 6: O NOCAUTE IMEDIATO & DISJUNTOR (33.56s -> 38.00s)
            // ---------------------------------------------------------------------
            else {
                // Câmera aberta vertical registrando a queda e o vencedor
                const p = easeInOutCubic(progress);
                targetCamPos.set(1.4 + p * 0.2, 1.55, 3.4 + p * 0.2);
                targetCamLook.set(0.0, 0.85 - p * 0.2, 0.15);

                // Vermelho recua e levanta o punho
                redFighter.root.position.set(0.65 + p * 0.15, 0, 0.70);
                redFighter.rightArm.shoulderPivot.rotation.set(0.3, 0, -1.50);
                redFighter.rightArm.elbowPivot.rotation.set(-0.2, 0, -1.15);
                redFighter.leftArm.shoulderPivot.rotation.set(0.3, 0, 0.35);

                // Azul desaba na lona
                const fallProgress = easeInOutCubic(clamp(localT / 2.2, 0, 1));

                blueFighter.leftArm.shoulderPivot.rotation.set(0.15, 0, 0.30 + fallProgress * 0.4);
                blueFighter.leftArm.elbowPivot.rotation.set(-0.20, 0, 0.1);
                blueFighter.rightArm.shoulderPivot.rotation.set(0.15, 0, -0.30 - fallProgress * 0.4);
                blueFighter.rightArm.elbowPivot.rotation.set(-0.20, 0, -0.1);

                blueFighter.headPivot.rotation.set(0.30 * fallProgress, 0.4 * fallProgress, -0.40 * fallProgress);

                blueFighter.leftLeg.kneePivot.rotation.set(0.20 - fallProgress * 1.30, 0, 0);
                blueFighter.rightLeg.kneePivot.rotation.set(0.18 - fallProgress * 1.10, 0, 0);
                blueFighter.pelvisPivot.position.y = lerp(1.0, 0.24, fallProgress);
                blueFighter.pelvisPivot.rotation.z = fallProgress * 0.35;
                blueFighter.torsoPivot.rotation.set(-fallProgress * 0.20, 0, fallProgress * 0.30);

                punchPinVisible = false;
                torquePinVisible = false;
                brainstemPinVisible = false;
            }

            // ATUALIZAÇÃO DA CÂMERA
            currentCamLook.copy(targetCamLook);
            if (isSeeking) {
                camera.position.copy(targetCamPos);
                if (controls) controls.target.copy(targetCamLook);
            } else if (!controls || !controls.state || controls.state === -1) {
                camera.position.lerp(targetCamPos, 0.12);
                if (controls) controls.target.lerp(targetCamLook, 0.12);
            }
            camera.lookAt(currentCamLook);
            camera.updateMatrixWorld();

            // ATUALIZAÇÃO DOS PINS 3D NO HUD
            const chinPosWorld = new THREE.Vector3(0.12, 1.62, 0.18).applyMatrix4(blueFighter.headPivot.matrixWorld);
            updateHUDPin(pinPunch, chinPosWorld, punchPinVisible);

            const topHeadWorld = new THREE.Vector3(0, 0.32, 0).applyMatrix4(blueFighter.headPivot.matrixWorld);
            updateHUDPin(pinTorque, topHeadWorld, torquePinVisible);

            const spineWorld = new THREE.Vector3(0, -0.16, -0.03).applyMatrix4(blueFighter.headPivot.matrixWorld);
            updateHUDPin(pinBrainstem, spineWorld, brainstemPinVisible);

            renderer.render(scene, camera);
        }

        // =========================================================================
        // CONTROLES DE INTERFACE E REPRODUÇÃO
        // =========================================================================
        function togglePlayPause() {
            isPlaying = !isPlaying;
            const btn = document.getElementById('btn-play-pause');
            if (isPlaying) {
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

        // LOOP DE ANIMAÇÃO 60FPS
        function animate(now) {
            requestAnimationFrame(animate);
            const delta = (now - lastFrameTime) / 1000;
            lastFrameTime = now;

            if (isPlaying) {
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
            } else {
                if (controls) controls.update();
                renderer.render(scene, camera);
            }
        }

        evaluateSceneAtTime(0, true);
        requestAnimationFrame(animate);

        window.addEventListener('resize', () => {
            camera.aspect = viewport.clientWidth / viewport.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(viewport.clientWidth, viewport.clientHeight);
            evaluateSceneAtTime(currentTime, true);
        });
    </script>
</body>
</html>`;

writeFileSync('soco-no-queixo-3d.html', htmlContent, 'utf8');
writeFileSync('C:/Users/Ruan Gomes/Downloads/por_que_soco_no_queixo_apaga_animacao_vertical_3d.html', htmlContent, 'utf8');

console.log('✅ HTML Autônomo (Soco no Queixo) reconstruído com nova calibração de câmera!');
