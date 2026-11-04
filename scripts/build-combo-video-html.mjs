import { readFileSync, writeFileSync } from 'node:fs';

const audioBase64 = readFileSync('output/combo-mortal_audio.mp3').toString('base64');
const audioDataUri = `data:audio/mp3;base64,${audioBase64}`;

const timingData = JSON.parse(readFileSync('src/comboTiming.json', 'utf8'));
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
    <title>O Combo Mortal: Fígado e Queixo — Biomecânica 3D</title>
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
            background-color: #06070a;
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
            background: rgba(11, 13, 20, 0.94);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.14);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.85);
        }
        .hidden-btn {
            opacity: 0 !important;
            pointer-events: none !important;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen bg-black">
    <div id="video-container" class="relative w-full h-full max-w-[480px] max-h-[854px] aspect-[9/16] overflow-hidden bg-[#06070a] shadow-2xl flex flex-col justify-between">
        <canvas id="webgl-canvas"></canvas>

        <div id="hud-overlay" class="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
            <!-- Topo: Branding ULTIMATOAI COMBATE + Status + Áudio -->
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
                    <!-- Badge ULTIMATOAI COMBATE -->
                    <div class="flex items-center shadow-lg pointer-events-auto">
                        <span class="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black italic tracking-tighter text-xs px-2.5 py-1 rounded-l-md">
                            ULTIMATOAI
                        </span>
                        <span class="bg-[#18181b] border border-white/20 text-white font-extrabold tracking-widest text-[11px] px-2 py-1 rounded-r-md uppercase">
                            COMBO MORTAL
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
                        ● COMBATE & BIOMECÂNICA 3D
                    </span>
                </div>
            </div>

            <!-- PINs 3D DINÂMICOS NA TELA -->
            <div id="pin-dodge" class="hud-pin opacity-0">
                <div class="bg-cyan-500/95 text-black font-black text-xs px-3 py-1 rounded-full shadow-xl border border-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>⚡</span>
                    <span id="pin-dodge-text">ESQUIVA BOB & WEAVE (0.18s)</span>
                </div>
                <div class="w-0.5 h-4 bg-cyan-400 mx-auto"></div>
            </div>

            <div id="pin-liver" class="hud-pin opacity-0">
                <div class="bg-rose-600/95 text-white font-black text-xs px-3 py-1 rounded-full shadow-xl border border-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>🥩</span>
                    <span id="pin-liver-text">GOLPE NO FÍGADO: 3200 N</span>
                </div>
                <div class="w-0.5 h-4 bg-rose-500 mx-auto"></div>
            </div>

            <div id="pin-chin" class="hud-pin opacity-0">
                <div class="bg-amber-400/95 text-black font-black text-xs px-3 py-1 rounded-full shadow-xl border border-amber-200 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>🧠</span>
                    <span id="pin-chin-text">GANCHO: TORQUE DE NOCAUTE</span>
                </div>
                <div class="w-0.5 h-4 bg-amber-400 mx-auto"></div>
            </div>

            <!-- Áudio Master VoiceStudio Embutido -->
            <audio id="master-narration" preload="auto" playsinline>
                <source src="${audioDataUri}" type="audio/mp3">
            </audio>

            <!-- Card Inferior com Legendas Dinâmicas em Tempo Real -->
            <div class="w-full flex flex-col items-center gap-2 pb-1 pointer-events-auto">
                <div id="script-card" class="script-card w-full rounded-2xl p-4 transition-all duration-300">
                    <p id="script-line" class="text-white font-extrabold text-center text-sm md:text-base leading-relaxed tracking-normal font-sans">
                        Você sabe por que esse é considerado o combo mais <span class="text-amber-400">DEVASTADOR</span> da história?
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
        const camera = new THREE.PerspectiveCamera(38, viewport.clientWidth / viewport.clientHeight, 0.1, 50);
        camera.position.set(0.65, 1.58, 3.2);

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
            controls.target.set(0.12, 1.35, 0.2);
        }
        camera.lookAt(0.12, 1.35, 0.2);

        // ESTÚDIO DE COMBATE COM ILUMINAÇÃO DE IMPACTO
        const studio = createStudioEnvironment(scene);

        // DOIS LUTADORES DE ALTA FIDELIDADE
        // 1. Lutador Vermelho (Atacante com Calção Vermelho Oficial e Luvas 10oz)
        const redFighter = createFighter({ corner: 'red' });
        scene.add(redFighter.group);
        redFighter.root.position.set(0.55, 0, 0.45);
        redFighter.root.rotation.y = 2.75;
        redFighter.setPose('guard');

        // 2. Lutador Azul (Defensor / Alvo Anatômico com Raio-X Multicamadas)
        const blueFighter = createFighter({ corner: 'blue' });
        scene.add(blueFighter.group);
        blueFighter.root.position.set(-0.25, 0, -0.10);
        blueFighter.root.rotation.y = 0.38;
        blueFighter.setPose('guard');

        // HUD BIOMECÂNICO
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
        const pinDodge = document.getElementById('pin-dodge');
        const pinLiver = document.getElementById('pin-liver');
        const pinChin = document.getElementById('pin-chin');

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

        function easeInOutCubic(x) {
            return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        }

        function easeOutBack(x) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        }

        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        let currentCamLook = new THREE.Vector3(0.12, 1.35, 0.2);

        // =========================================================================
        // MOTOR DE ANIMAÇÃO DETERMINÍSTICO EVALUATE EM TEMPO REAL (60 FPS)
        // =========================================================================
        function evaluateSceneAtTime(t, isSeeking = false) {
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

            // Barra de Progresso Superior
            for (let i = 0; i < 6; i++) {
                const fill = document.getElementById('prog-' + i).firstElementChild;
                if (i < currentBeatIdx) fill.style.width = '100%';
                else if (i === currentBeatIdx) fill.style.width = (progress * 100) + '%';
                else fill.style.width = '0%';
            }

            beatCounter.textContent = (currentBeatIdx + 1) + '/6';

            // Atualiza Card de Legenda com Palavras-Chave de Destaque
            if (currentBeatIdx === 0) {
                modeBadge.textContent = '● 1. ENCARADA DE CAMPEONATO';
                scriptLine.innerHTML = 'Você sabe por que esse é considerado o combo mais <span class="text-amber-400 font-black">DEVASTADOR</span> do combate?';
            } else if (currentBeatIdx === 1) {
                modeBadge.textContent = '● 2. TROCAÇÃO: JAB, DIRETO E ESQUIVA';
                scriptLine.innerHTML = 'A trocação começa em ritmo alucinante! <span class="text-cyan-400 font-black">JAB, DIRETO</span> e uma <span class="text-cyan-300 font-black">ESQUIVA PERFEITA</span> de cabeça!';
            } else if (currentBeatIdx === 2) {
                modeBadge.textContent = '● 3. O GANCHO CRUEL NO FÍGADO';
                scriptLine.innerHTML = 'O contra-ataque explode: um <span class="text-rose-500 font-black">GANCHO NO FÍGADO</span>! Comprime o órgão e <span class="text-amber-400 font-black">DRENA O OXIGÊNIO</span>!';
            } else if (currentBeatIdx === 3) {
                modeBadge.textContent = '● 4. A BRECHA MORTAL NA GUARDA';
                scriptLine.innerHTML = 'Com o abdômen paralisado, a <span class="text-rose-400 font-black">GUARDA DESCE</span>. É a brecha fatal para o <span class="text-amber-400 font-black">GANCHO NO QUEIXO</span>!';
            } else if (currentBeatIdx === 4) {
                modeBadge.textContent = '● 5. RAIO-X: TORQUE & TRONCO ENCEFÁLICO';
                scriptLine.innerHTML = 'A cabeça gira com <span class="text-amber-400 font-black">TORQUE BRUTAL</span> e o <span class="text-rose-400 font-black">TRONCO ENCEFÁLICO DESLIGA</span> a consciência na hora!';
            } else {
                modeBadge.textContent = '● 6. O NOCAUTE DUPLO PERFEITO';
                scriptLine.innerHTML = '<span class="text-rose-500 font-black">NOCAUTE ABSOLUTO</span> em dois atos! Física, biomecânica e reflexos. Você defenderia esse combo?';
            }

            // RESET BASE DAS POSTURAS DOS DOIS LUTADORES
            // Vermelho (Postura atlética e ativa)
            redFighter.root.position.set(0.55, 0, 0.45);
            redFighter.root.rotation.set(0, 2.75, 0);
            redFighter.hips.position.y = 0.95;
            redFighter.spine.rotation.set(0.08, 0, 0);
            redFighter.chest.rotation.set(0.06, 0.15, 0);
            redFighter.neck.rotation.set(-0.04, -0.10, 0);
            redFighter.head.rotation.set(0.04, 0, 0);

            // Braços do vermelho (guarda de ataque)
            redFighter.arms.left.shoulder.rotation.set(-0.75, -0.28, -0.10);
            redFighter.arms.left.elbow.rotation.set(-1.95, 0, 0.40);
            redFighter.arms.right.shoulder.rotation.set(-0.70, 0.28, 0.12);
            redFighter.arms.right.elbow.rotation.set(-1.90, 0, -0.38);

            // Pernas do vermelho
            redFighter.legs.left.hip.rotation.set(-0.25, 0.1, -0.08);
            redFighter.legs.left.knee.rotation.set(0.32, 0, 0);
            redFighter.legs.right.hip.rotation.set(0.20, -0.1, 0.08);
            redFighter.legs.right.knee.rotation.set(0.26, 0, 0);

            // Azul (Postura de guarda técnica)
            blueFighter.root.position.set(-0.25, 0, -0.10);
            blueFighter.root.rotation.set(0, 0.38, 0);
            blueFighter.hips.position.y = 0.95;
            blueFighter.spine.rotation.set(0.08, 0, 0);
            blueFighter.chest.rotation.set(0, 0, 0);
            blueFighter.neck.rotation.set(0, 0, 0);
            blueFighter.head.rotation.set(0, 0, 0);

            // Braços do azul (guarda alta protegendo queixo e costelas)
            blueFighter.arms.left.shoulder.rotation.set(-0.80, -0.30, -0.15);
            blueFighter.arms.left.elbow.rotation.set(-1.95, 0, 0.45);
            blueFighter.arms.right.shoulder.rotation.set(-0.80, 0.30, 0.15);
            blueFighter.arms.right.elbow.rotation.set(-1.95, 0, -0.45);

            // Pernas do azul
            blueFighter.legs.left.hip.rotation.set(-0.20, 0.1, -0.05);
            blueFighter.legs.left.knee.rotation.set(0.28, 0, 0);
            blueFighter.legs.right.hip.rotation.set(0.18, -0.1, 0.05);
            blueFighter.legs.right.knee.rotation.set(0.24, 0, 0);

            // Reset de órgãos e nós anatômicos
            blueFighter.cervical.forEach(v => { v.rotation.y = 0; });
            blueFighter.brain.position.set(0, 0.118, -0.008);
            blueFighter.setShock(0);

            bioHUD.straightLineGroup.visible = false;
            bioHUD.leverGroup.visible = false;
            bioHUD.torqueGroup.visible = false;
            bioHUD.triggerImpact(-1);

            let dodgePinVisible = false;
            let liverPinVisible = false;
            let chinPinVisible = false;
            let targetCamPos = new THREE.Vector3(0.65, 1.58, 3.2);
            let targetCamLook = new THREE.Vector3(0.12, 1.35, 0.2);

            // ---------------------------------------------------------------------
            // ATO 1: ENCARADA DE CAMPEONATO & FOOTWORK ATIVO (0.0s -> 5.12s)
            // ---------------------------------------------------------------------
            if (currentBeatIdx === 0) {
                blueFighter.setXRay(false);
                // Footwork rítmico sincronizado e movimentação viva de luta
                const stepBounce = Math.sin(t * 8.0) * 0.018;
                const guardPulse = Math.sin(t * 4.0) * 0.08;

                redFighter.root.position.y = stepBounce;
                redFighter.arms.left.elbow.rotation.set(-1.95 + guardPulse * 0.5, 0, 0.40);

                blueFighter.root.position.y = stepBounce * 0.85;
                blueFighter.arms.left.elbow.rotation.set(-1.95 - guardPulse * 0.4, 0, 0.45);

                // Câmera 3/4 fluida se aproximando em dolly orbital suave
                const p = easeInOutCubic(progress);
                targetCamPos.set(0.80 - p * 0.25, 1.62 - p * 0.08, 3.4 - p * 0.4);
                targetCamLook.set(0.12, 1.35, 0.2);
            }

            // ---------------------------------------------------------------------
            // ATO 2: TROCAÇÃO ALUCINANTE: JAB, DIRETO E ESQUIVA BOB & WEAVE (5.12s -> 8.17s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 1) {
                blueFighter.setXRay(false);

                // Dividimos os 3.05 segundos em: Jab (0 a 1.2s) e Direto + Esquiva (1.2s a 3.05s)
                if (localT < 1.3) {
                    // 1. JAB RÁPIDO DO VERMELHO
                    const jabT = localT / 1.3;
                    const jabExt = Math.sin(jabT * Math.PI);

                    redFighter.arms.left.shoulder.rotation.set(-1.20, -0.15, jabExt * 0.25);
                    redFighter.arms.left.elbow.rotation.set(-1.95 + jabExt * 1.55, 0, 0);
                    redFighter.chest.rotation.y = 0.15 + jabExt * 0.15;

                    // Azul bloqueia com luva direita
                    blueFighter.arms.right.shoulder.rotation.set(-0.95, 0.10, 0.10);
                    blueFighter.head.rotation.x = -jabExt * 0.08;

                    targetCamPos.set(0.60, 1.52, 2.8);
                    targetCamLook.set(0.15, 1.38, 0.18);
                } else {
                    // 2. DIRETO POTENTE DO VERMELHO + ESQUIVA BOB & WEAVE DO AZUL!
                    const crossT = (localT - 1.3) / 1.75;
                    const crossExt = Math.sin(crossT * Math.PI);

                    // Vermelho rotaciona o quadril e lança o direto de direita na cabeça do azul
                    redFighter.arms.right.shoulder.rotation.set(-1.35, 0.12, -crossExt * 0.35);
                    redFighter.arms.right.elbow.rotation.set(-1.90 + crossExt * 1.70, 0, 0);
                    redFighter.chest.rotation.y = 0.15 - crossExt * 0.45;
                    redFighter.root.position.x = 0.55 - crossExt * 0.10;

                    // AZUL REALIZA A ESQUIVA BOB & WEAVE EM 'U' (PASSANDO POR BAIXO DO SOCO!)
                    // O tronco e a cabeça descem e giram para a esquerda
                    const dodgeDepth = Math.sin(crossT * Math.PI);
                    blueFighter.hips.position.y = 0.95 - dodgeDepth * 0.14;
                    blueFighter.spine.rotation.set(dodgeDepth * 0.32, -dodgeDepth * 0.42, 0);
                    blueFighter.head.rotation.set(dodgeDepth * 0.22, -dodgeDepth * 0.35, 0);

                    dodgePinVisible = crossT > 0.35 && crossT < 0.85;

                    // Câmera dinâmica de perfil baixo (Low Angle épico)
                    targetCamPos.set(-1.9, 1.38, 1.10);
                    targetCamLook.set(0.15, 1.32, 0.15);
                }
            }

            // ---------------------------------------------------------------------
            // ATO 3: O CONTRA-ATAQUE NO FÍGADO & FLASH DE RAIO-X VISCERAL (8.17s -> 11.56s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 2) {
                // Vermelho acerta um gancho brutal de esquerda sob o arco costal direito do azul
                const hookT = clamp(localT / 2.0, 0, 1);
                const impactProg = easeOutBack(hookT);

                // Vermelho gira o tronco e dispara o gancho baixo ascendente
                redFighter.arms.left.shoulder.rotation.set(-0.25, 0.55, 0.65);
                redFighter.arms.left.elbow.rotation.set(-1.50, 0, 0.95);
                redFighter.chest.rotation.y = 0.15 - impactProg * 0.50;

                // RAIO-X VISCERAL FLASH NO AZUL!
                blueFighter.setXRay(true, 0.18);
                blueFighter.setXRayMode('visceral');

                // Azul sente o golpe no fígado: curvatura de dor imediata
                const painProg = easeInOutCubic(clamp(localT / 1.5, 0, 1));
                blueFighter.hips.position.y = 0.95 - painProg * 0.08;
                blueFighter.spine.rotation.set(painProg * 0.35, painProg * 0.15, -painProg * 0.12);
                blueFighter.head.rotation.set(painProg * 0.28, 0, 0);

                // As mãos do azul caem involuntariamente pela perda de oxigênio
                blueFighter.arms.left.shoulder.rotation.set(-0.45 * (1 - painProg), -0.2, 0);
                blueFighter.arms.right.shoulder.rotation.set(-0.40 * (1 - painProg), 0.2, 0);

                liverPinVisible = true;

                // Câmera foca com zoom de impacto no abdômen e costelas
                targetCamPos.set(0.48, 1.25, 1.45);
                targetCamLook.set(-0.10, 1.12, 0.0);
            }

            // ---------------------------------------------------------------------
            // ATO 4: A BRECHA MORTAL E O GANCHO NO QUEIXO (11.56s -> 14.87s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 3) {
                // Azul está com a guarda baixa e tronco curvado
                blueFighter.setXRay(true, 0.20);
                blueFighter.setXRayMode('neuro');
                blueFighter.spine.rotation.set(0.28, 0.10, -0.08);
                blueFighter.head.rotation.set(0.18, 0, 0);
                blueFighter.arms.left.shoulder.rotation.set(-0.25, -0.15, -0.10);
                blueFighter.arms.right.shoulder.rotation.set(-0.25, 0.15, 0.10);

                // Vermelho prepara o gancho fatal de esquerda subindo no queixo
                const punchPrep = clamp(localT / 1.8, 0, 1);
                redFighter.arms.left.shoulder.rotation.set(-0.15, 0.45 - punchPrep * 0.85, 0.70);
                redFighter.arms.left.elbow.rotation.set(-1.55, 0, 0.95);
                redFighter.chest.rotation.y = -0.30 + punchPrep * 0.75;

                bioHUD.leverGroup.visible = true;
                chinPinVisible = true;
                document.getElementById('pin-chin-text').textContent = 'BRECHA: GANCHO NO QUEIXO';

                // Câmera sobe em travelling dramático mostrando a mandíbula exposta
                const p = easeInOutCubic(progress);
                targetCamPos.set(0.42 - p * 0.10, 1.55, 1.85 - p * 0.35);
                targetCamLook.set(-0.12, 1.48, 0.02);
            }

            // ---------------------------------------------------------------------
            // ATO 5: O IMPACTO, TORQUE ROTACIONAL E RAIO-X NEURO (14.87s -> 19.00s)
            // ---------------------------------------------------------------------
            else if (currentBeatIdx === 4) {
                // RAIO-X TOTAL MULTICAMADAS COM DISPARO BIOELÉTRICO!
                blueFighter.setXRay(true, 0.14);
                blueFighter.setXRayMode('all');

                // Cabeça do azul gira bruscamente 62 graus no eixo Y por torque violento!
                const impactT = clamp(localT / 1.2, 0, 1);
                const twistProg = easeInOutCubic(impactT);

                blueFighter.head.rotation.y = twistProg * 1.15;
                blueFighter.head.rotation.x = -twistProg * 0.20;
                blueFighter.neck.rotation.y = twistProg * 0.58;

                // Efeito chicote no cérebro
                const brainWobble = Math.sin(localT * 10.0) * Math.exp(-localT * 0.40) * 0.038;
                blueFighter.brain.position.x = brainWobble;

                // Torção progressiva nas 7 vértebras cervicais
                blueFighter.cervical.forEach((v, i) => {
                    v.rotation.y = (i / 7) * 0.50 * twistProg;
                });

                // Disparo de choque bioelétrico nos nervos
                const pulse = Math.abs(Math.sin(localT * 9.0));
                blueFighter.setShock(pulse);

                // Vermelho conecta o golpe até o fim da extensão
                redFighter.arms.left.shoulder.rotation.set(-0.10, -0.40, 0.70);
                redFighter.chest.rotation.y = 0.45;

                chinPinVisible = true;
                document.getElementById('pin-chin-text').textContent = 'CORTE SINÁPTICO: NOCAUTE!';

                // Câmera macro de impacto dramática
                targetCamPos.set(0.55, 1.60, 1.35);
                targetCamLook.set(-0.18, 1.48, 0.0);
            }

            // ---------------------------------------------------------------------
            // ATO 6: O NOCAUTE DUPLO & DESABAMENTO TOTAL (19.00s -> 25.00s)
            // ---------------------------------------------------------------------
            else {
                blueFighter.setXRay(true, 0.22);
                blueFighter.setXRayMode('all');

                // Queda suave e realista pelo colapso motor
                const fallProgress = easeInOutCubic(clamp(localT / 2.2, 0, 1));

                blueFighter.hips.position.y = lerp(0.95, 0.38, fallProgress);
                blueFighter.spine.rotation.set(-0.38 * fallProgress, 0.20 * fallProgress, -0.22 * fallProgress);
                blueFighter.neck.rotation.set(-0.28 * fallProgress, 0.12 * fallProgress, 0);
                blueFighter.head.rotation.set(-0.38 * fallProgress, 0.18 * fallProgress, 0);

                blueFighter.arms.left.shoulder.rotation.set(0.25 * fallProgress, 0, -0.38 * fallProgress);
                blueFighter.arms.left.elbow.rotation.set(-0.35 * fallProgress, 0, 0);
                blueFighter.arms.right.shoulder.rotation.set(0.20 * fallProgress, 0, 0.42 * fallProgress);
                blueFighter.arms.right.elbow.rotation.set(-0.30 * fallProgress, 0, 0);

                blueFighter.legs.left.hip.rotation.set(-0.65 * fallProgress, 0.25 * fallProgress, -0.22 * fallProgress);
                blueFighter.legs.left.knee.rotation.set(1.45 * fallProgress, 0, 0);
                blueFighter.legs.right.hip.rotation.set(-0.45 * fallProgress, -0.35 * fallProgress, 0.32 * fallProgress);
                blueFighter.legs.right.knee.rotation.set(1.25 * fallProgress, 0, 0);

                // Vermelho retorna triunfante para a postura de vitória
                redFighter.setPose('guard');
                redFighter.root.position.set(0.65, 0, 0.60);

                // Câmera recua em plano vertical épico completo
                targetCamPos.set(0.20, 1.42, 3.4);
                targetCamLook.set(0.08, 0.90, 0.10);
            }

            // INTERPOLAÇÃO SUAVE DA CÂMERA (easeInOutCubic)
            camera.position.lerp(targetCamPos, isSeeking ? 1.0 : 0.12);
            currentCamLook.lerp(targetCamLook, isSeeking ? 1.0 : 0.12);
            if (controls) controls.target.copy(currentCamLook);
            camera.lookAt(currentCamLook);

            camera.updateMatrixWorld();

            // PINS 3D DINÂMICOS
            const blueHeadWorld = new THREE.Vector3(-0.25, 1.62, -0.10);
            updateHUDPin(pinDodge, blueHeadWorld, dodgePinVisible);

            const liverWorld = new THREE.Vector3(-0.20, 1.15, -0.05);
            updateHUDPin(pinLiver, liverWorld, liverPinVisible);

            const chinWorld = new THREE.Vector3(-0.15, 1.48, 0.05);
            updateHUDPin(pinChin, chinWorld, chinPinVisible);

            renderer.render(scene, camera);
        }

        // CONTROLES DE ÁUDIO E VÍDEO
        function togglePlayPause() {
            if (isPlaying) pauseVideo();
            else playVideo();
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

writeFileSync('combo-mortal-3d.html', htmlContent, 'utf8');
writeFileSync('C:/Users/Ruan Gomes/Downloads/combo_mortal_animacao_vertical_3d.html', htmlContent, 'utf8');

console.log('✅ Combo Mortal 3D HTML gerado com sucesso:');
console.log('   -> combo-mortal-3d.html');
console.log('   -> C:/Users/Ruan Gomes/Downloads/combo_mortal_animacao_vertical_3d.html');
