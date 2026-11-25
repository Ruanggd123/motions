/**
 * Ep14FuradeiraParede3D.js -- Comedia Cartoon 3D: "O Colchao Nao Cabe na Sala!"
 * Motor compartilhado: window.CartoonDistort3D (foot-anchored squash & stretch, big-head pop,
 * rubber arm stretch, meme fisheye FOV 76-84 deg, hitstop micro-freeze, elastic bounce).
 *
 * Arco visual 6-beat:
 * - B1a/B1b (0.0s IN MEDIA RES): Fisheye 84 deg colado no rosto suando do Voce (headPop 1.48x) ->
 *   whip rapido pra Camila gritando ("SEGURA A VALVULA FIRME!"), placa 100% oculta!
 * - B2 (WHIP-DOLLY REVEAL): Revela sala ensolarada da Camila com sofa, janela, mesinha,
 *   placa nitida ("SALA DA CAMILA · COLCHAO KING-SIZE"), colchao azul gigante espremido!
 * - B3 (EGO DE ENGENHEIRO + EASTER EGG): Peito estufado 1.20x + bracos de borracha segurando a bomba
 *   enquanto o colchao incha feito balao e o cacto de olhoes arregalados treme na mesinha!
 * - B4 (FISHEYE SUSPENSE): FOV 76 deg no medidor vermelho tremendo + valvula pulsando + Camila headPop 1.44x!
 * - B5 (HITSTOP + FLY-BY + EXPLOSAO 32 PUFFS + ALMOFADA): Hitstop -> tampao vermelho passa colado na lente ->
 *   explosao de 32 puffs de ar + 20 plumas -> almofada roxa pousa limpa na cabeca do Voce esmagado!
 * - B6 (FISHEYE ROAST): FOV 80 deg no Voce usando a almofada na cabeca enquanto Camila ri atras!
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function smoothstep(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  const VOCE_GROUND_Y = -0.37;
  const CAMILA_GROUND_Y = -0.27;

  class Ep14FuradeiraParede3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado');
      this.T = T;
      this.fastTest = Boolean(opts.fastTest);
      this.width = this.fastTest ? 270 : (opts.highRes ? 1080 : 720);
      this.height = this.fastTest ? 480 : (opts.highRes ? 1920 : 1280);

      this.webglCanvas = document.createElement('canvas');
      this.webglCanvas.width = this.width;
      this.webglCanvas.height = this.height;

      this.renderer = new T.WebGLRenderer({
        canvas: this.webglCanvas,
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true
      });
      this.renderer.setSize(this.width, this.height, false);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = T.PCFShadowMap;
      this.renderer.toneMapping = T.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.16;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0xfef9c3);
      this.scene.fog = new T.FogExp2(0xf0f9ff, 0.007);

      this.camera = new T.PerspectiveCamera(45, 1080 / 1920, 0.08, 120);
      this._tmpHeadPos = new T.Vector3();

      this._initLights(T);
      this._buildWorkshopWall3D(T);
      this._initCharactersAndProps3D(T);
      this._buildSweatDrops(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP14_FURADEIRA_TIMELINE ? global.EP14_FURADEIRA_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 9.2, 13.4, 18.0, 22.0, 26.2];
    }

    _getDialogueState(time) {
      const tl = this._getTimeline();
      if (!tl || !Array.isArray(tl.dialogues)) return { speaker: null, lip: 0, id: null, start: 0, end: 0 };
      for (let i = 0; i < tl.dialogues.length; i++) {
        const d = tl.dialogues[i];
        if (time >= d.start && time <= d.end && Array.isArray(d.lip_sync) && d.lip_sync.length > 0) {
          const idx = clamp(Math.floor((time - d.start) * 60), 0, d.lip_sync.length - 1);
          return { speaker: d.speaker, lip: d.lip_sync[idx] || 0, id: d.id, start: d.start, end: d.end };
        }
      }
      return { speaker: null, lip: 0, id: null, start: 0, end: 0 };
    }

    _getB1bStart(b) {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.dialogues) && tl.dialogues.length >= 2) {
        return Number(tl.dialogues[1].start) || 4.0;
      }
      return Math.max(2.6, b[1] * 0.50);
    }

    _initLights(T) {
      this.scene.add(new T.AmbientLight(0xfffdf7, 1.02));
      const hemi = new T.HemisphereLight(0xfef9c3, 0xfef3c7, 0.88);
      hemi.position.set(0, 10, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 2.0);
      sun.position.set(-3.6, 8.5, 5.5);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -5.0; sun.shadow.camera.right = 5.0;
      sun.shadow.camera.top = 5.0; sun.shadow.camera.bottom = -5.0;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      this.windowGlow = new T.PointLight(0xfef08a, 1.30, 6.5);
      this.windowGlow.position.set(-1.30, 1.75, -1.75);
      this.scene.add(this.windowGlow);
    }

    _makeWoodFloorTexture(T) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const g = c.getContext('2d');
      g.fillStyle = '#fde68a';
      g.fillRect(0, 0, 512, 512);
      const rows = 8;
      const rowH = 512 / rows;
      for (let r = 0; r < rows; r++) {
        g.fillStyle = r % 2 === 0 ? '#fcd34d' : '#f59e0b';
        g.globalAlpha = 0.22;
        g.fillRect(0, r * rowH, 512, rowH - 2);
        g.globalAlpha = 0.45;
        g.fillStyle = '#b45309';
        g.fillRect(0, (r + 1) * rowH - 2, 512, 2);
      }
      g.globalAlpha = 1.0;
      const tex = new T.CanvasTexture(c);
      tex.wrapS = T.RepeatWrapping;
      tex.wrapT = T.RepeatWrapping;
      tex.repeat.set(4, 4);
      tex.needsUpdate = true;
      return tex;
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 680;
      c.height = 180;
      const g = c.getContext('2d');
      g.fillStyle = '#0c4a6e';
      g.fillRect(0, 0, 680, 180);
      g.strokeStyle = '#38bdf8';
      g.lineWidth = 12;
      g.strokeRect(8, 8, 664, 164);
      g.fillStyle = '#fef08a';
      g.font = '900 44px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 340, 78);
      g.fillStyle = '#bae6fd';
      g.font = '900 32px "Segoe UI", sans-serif';
      g.fillText(subtitle, 340, 134);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildWorkshopWall3D(T) {
      // 1. Piso de madeira clara (y = 0.00) + Lona azul protetora de pintura
      const floor = new T.Mesh(
        new T.PlaneGeometry(20, 20),
        new T.MeshStandardMaterial({ map: this._makeWoodFloorTexture(T), roughness: 0.48, metalness: 0.04 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      const tarp = new T.Mesh(
        new T.BoxGeometry(2.7, 0.015, 2.0),
        new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.78 })
      );
      tarp.position.set(0.0, 0.008, -0.35);
      tarp.receiveShadow = true;
      this.scene.add(tarp);

      // 2. Parede da oficina/reparo mais proxima (z = -1.20) para furadeira furar de verdade!
      const wallPlaster = new T.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.85 });
      const wallMint = new T.MeshStandardMaterial({ color: 0xd1fae5, roughness: 0.85 });
      const wallTrim = new T.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 });

      const backWall = new T.Mesh(new T.BoxGeometry(9.0, 3.8, 0.14), wallPlaster);
      backWall.position.set(0, 1.9, -1.20);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const leftWall = new T.Mesh(new T.BoxGeometry(0.18, 3.8, 7.0), wallMint);
      leftWall.position.set(-2.45, 1.9, 0.2);
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);

      const baseboard = new T.Mesh(new T.BoxGeometry(9.0, 0.14, 0.18), wallTrim);
      baseboard.position.set(0, 0.07, -1.16);
      this.scene.add(baseboard);

      // Fita crepe de marcacao na parede do furo
      const tapeMat = new T.MeshBasicMaterial({ color: 0xfacc15 });
      const tapeH = new T.Mesh(new T.PlaneGeometry(0.32, 0.03), tapeMat);
      tapeH.position.set(-0.18, 1.10, -1.12);
      this.scene.add(tapeH);

      // 3. Painel perfurado (Pegboard) + Escada amarela dobrada a esquerda
      const pegMat = new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.72 });
      const pegBoard = new T.Mesh(new T.BoxGeometry(1.05, 0.85, 0.05), pegMat);
      pegBoard.position.set(-1.35, 1.65, -1.10);
      this.scene.add(pegBoard);

      const metalMat = new T.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.30, metalness: 0.80 });
      const redHandle = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.45 });
      const wrench = new T.Mesh(new T.BoxGeometry(0.08, 0.42, 0.03), metalMat);
      wrench.position.set(-1.55, 1.68, -1.06);
      const hammerBar = new T.Mesh(new T.BoxGeometry(0.05, 0.38, 0.03), pegMat);
      hammerBar.position.set(-1.25, 1.65, -1.06);
      const hammerHead = new T.Mesh(new T.BoxGeometry(0.18, 0.07, 0.04), metalMat);
      hammerHead.position.set(-1.25, 1.84, -1.06);
      const sawBlade = new T.Mesh(new T.BoxGeometry(0.12, 0.46, 0.02), metalMat);
      sawBlade.position.set(-1.02, 1.60, -1.06);
      const sawHandle = new T.Mesh(new T.BoxGeometry(0.14, 0.12, 0.04), redHandle);
      sawHandle.position.set(-1.02, 1.86, -1.06);
      this.scene.add(wrench, hammerBar, hammerHead, sawBlade, sawHandle);

      // Escada dobravel amarela encostada a esquerda
      const ladMat = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.38, metalness: 0.15 });
      const railL = new T.Mesh(new T.BoxGeometry(0.06, 1.55, 0.08), ladMat);
      railL.position.set(-1.72, 0.76, -0.78);
      railL.rotation.x = -0.14;
      const railR = new T.Mesh(new T.BoxGeometry(0.06, 1.55, 0.08), ladMat);
      railR.position.set(-1.26, 0.76, -0.78);
      railR.rotation.x = -0.14;
      this.scene.add(railL, railR);
      for (let st = 0; st < 4; st++) {
        const rung = new T.Mesh(new T.BoxGeometry(0.46, 0.04, 0.10), ladMat);
        rung.position.set(-1.49, 0.28 + st * 0.34, -0.70 - st * 0.04);
        this.scene.add(rung);
      }

      // 4. Bancada de madeira a direita-fundo (x=1.12, top y=0.82 -> segura o Patinho!)
      const benchMat = new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.58 });
      const benchTop = new T.Mesh(new T.BoxGeometry(1.10, 0.08, 0.62), benchMat);
      benchTop.position.set(1.12, 0.78, -0.78);
      benchTop.castShadow = true;
      benchTop.receiveShadow = true;
      this.scene.add(benchTop);
      [[-0.46, -0.22], [0.46, -0.22], [-0.46, 0.22], [0.46, 0.22]].forEach(([lx, lz]) => {
        const leg = new T.Mesh(new T.BoxGeometry(0.07, 0.76, 0.07), benchMat);
        leg.position.set(1.12 + lx, 0.38, -0.78 + lz);
        leg.castShadow = true;
        this.scene.add(leg);
      });

      // Caixa de ferramentas vermelha + lata de tinta perto da bancada
      const toolBox = new T.Mesh(new T.BoxGeometry(0.42, 0.22, 0.24), redHandle);
      toolBox.position.set(0.96, 0.11, -0.22);
      toolBox.castShadow = true;
      const paintCan = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.24, 16), metalMat);
      paintCan.position.set(1.38, 0.12, -0.22);
      paintCan.castShadow = true;
      this.scene.add(toolBox, paintCan);

      // 5. Placa "OFICINA DO 304 · BRICOLAGEM TURBO" (OCULTA em B1, 100% nitida em B2..B6!)
      const signTex = this._makeSignTexture(T, 'OFICINA DO 304', '· BRICOLAGEM TURBO ·');
      this.signBoard = new T.Mesh(
        new T.BoxGeometry(2.05, 0.46, 0.06),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.42 })
      );
      this.signBoard.position.set(0.0, 2.52, -1.10);
      this.scene.add(this.signBoard);

      // 6. Sombras de contato no piso y = 0.015
      const shMat = new T.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.22, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.015, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.28, -0.40, 0.56);
      this.camilaShadow = makeShadow(0.26, 0.62, -0.10);
    }

    _initCharactersAndProps3D(T) {
      if (!global.VoceMorador3D || !global.DonaCamila3D || !global.FuradeiraParede3D) {
        throw new Error('Personagens ou FuradeiraParede3D nao carregados');
      }
      // ZERO Pacoca! Elenco exclusivo: VoceMorador3D + DonaCamila3D + FuradeiraParede3D
      this.voce = new global.VoceMorador3D();
      this.voce.group.position.set(-0.40, VOCE_GROUND_Y, 0.56);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D();
      this.camila.group.position.set(0.62, CAMILA_GROUND_Y, -0.10);
      this.camila.group.rotation.y = -0.48;
      this.scene.add(this.camila.group);

      this.furadeira = new global.FuradeiraParede3D();
      this.scene.add(this.furadeira.group);
    }

    _buildSweatDrops(T) {
      this.voceSweatDrops = [];
      const dropMat = new T.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.35, roughness: 0.10 });
      for (let i = 0; i < 12; i++) {
        const drop = new T.Mesh(new T.SphereGeometry(0.022, 8, 6), dropMat);
        drop.visible = false;
        this.scene.add(drop);
        this.voceSweatDrops.push({
          mesh: drop,
          seed: i / 12,
          arcX: (i % 2 === 0 ? 1 : -1) * (0.14 + (i % 4) * 0.04),
          arcY: 0.10 + (i % 3) * 0.06,
          arcZ: ((i % 5) - 2) * 0.04
        });
      }
    }

    renderAt(rawTime) {
      const CD = global.CartoonDistort3D;
      const b = this._getBeats();
      const b1bStart = this._getB1bStart(b);
      const dlg = this._getDialogueState(rawTime);

      if (CD) {
        CD.resetRigDistortion(this.voce, VOCE_GROUND_Y);
        CD.resetRigDistortion(this.camila, CAMILA_GROUND_Y);
      }

      // Micro-hitstop comico no inicio de B5 (0.18s)
      const hitstopStart = b[4] + 0.02;
      const hitstopDur = 0.18;
      const inHitstop = CD ? CD.isInHitstop(rawTime, hitstopStart, hitstopDur) : 0;
      const time = CD ? CD.hitstopTime(rawTime, hitstopStart, hitstopDur, 0.04, 0.28) : rawTime;

      // Transicoes snappy entre beats
      const b1aRamp = smoothstep(rawTime / Math.max(1.5, b1bStart - 0.2));
      const w1ab = smoothstep((rawTime - (b1bStart - 0.12)) / 0.38);
      const w12 = smoothstep((rawTime - (b[1] - 0.12)) / 0.65);
      const w23 = smoothstep((rawTime - (b[2] - 0.12)) / 0.68);
      const w34 = smoothstep((rawTime - (b[3] - 0.12)) / 0.65);
      const w45 = smoothstep((rawTime - (b[4] - 0.10)) / 0.60);
      const w56 = smoothstep((rawTime - (b[5] - 0.12)) / 0.68);

      const b6FishIn = smoothstep((rawTime - (b[5] + 0.85)) / 0.58);

      // B5 coreografia: tampao fly-by -> explosao 32 puffs + plumas -> almofada pousa na cabeca!
      const flyBy01 = clamp((rawTime - (b[4] + 0.18)) / 0.95, 0, 1);
      const burst01 = clamp((rawTime - (b[4] + 0.30)) / 2.80, 0, 1);
      const pillow01 = clamp((rawTime - (b[4] + 0.85)) / 0.95, 0, 1);
      const deflated01 = smoothstep((rawTime - (b[4] + 0.25)) / 0.85);
      const impactAge = clamp((rawTime - (b[4] + 1.80)) / 1.25, 0, 1);
      const impactBounceVal = CD ? CD.impactBounce(impactAge, 3.0) : 0;
      const shockShake = smoothstep((rawTime - (b[4] + 0.25)) / 0.14) * (1 - smoothstep((rawTime - (b[4] + 2.10)) / 0.50));

      // Placa 100% OCULTA em B1a/B1b e 100% VISIVEL de B2 ate B6!
      this.signBoard.visible = w12 > 0.14;

      // =========================================================================
      // 1. CAMERA FISHEYE / WHIP-DOLLY MULTI-ANGULO
      // =========================================================================
      const shakeX = Math.sin(rawTime * 28.0) * 0.036 * shockShake + (inHitstop > 0 ? Math.sin(rawTime * 60.0) * 0.022 : 0);
      const shakeY = Math.cos(rawTime * 25.0) * 0.026 * shockShake + (inHitstop > 0 ? Math.cos(rawTime * 55.0) * 0.018 : 0);

      // B1a: FOV 84 deg fisheye colado no rosto suando do Voce -> whip pra B1b Camila
      let camX = lerp(-0.40, 0.58, w1ab);
      let camY = lerp(1.16, 1.24, w1ab);
      let camZ = lerp(1.26, 0.88, w1ab);
      let lookX = lerp(-0.40, 0.62, w1ab);
      let lookY = lerp(1.12, 1.18, w1ab);
      let lookZ = lerp(0.56, -0.10, w1ab);
      let fov = lerp(CD ? CD.fisheyePulse(76.0, 84.0, 0.5 + b1aRamp * 0.5) : 84.0, 80.0, w1ab);

      // B2: Whip-dolly reveal da sala + placa nitida + colchao gigante espremido
      camX = lerp(camX, 0.02, w12);
      camY = lerp(camY, 1.50, w12);
      camZ = lerp(camZ, 4.65, w12);
      lookX = lerp(lookX, 0.0, w12);
      lookY = lerp(lookY, 1.04, w12);
      lookZ = lerp(lookZ, -0.58, w12);
      fov = lerp(fov, 46.5, w12);

      // B3: Ego de engenheiro de espaco + cacto Easter egg na mesinha
      camX = lerp(camX, 0.02, w23);
      camY = lerp(camY, 1.46, w23);
      camZ = lerp(camZ, 4.45, w23);
      lookX = lerp(lookX, -0.04, w23);
      lookY = lerp(lookY, 1.04, w23);
      lookZ = lerp(lookZ, -0.52, w23);
      fov = lerp(fov, 46.5, w23);

      // B4: FISHEYE SUSPENSE FOV 76 deg no medidor/valvula + Camila gritando
      const b4Fish = CD ? CD.fisheyePulse(46.5, 76.0, w34) : 76.0;
      camX = lerp(camX, 0.08, w34);
      camY = lerp(camY, 1.36, w34);
      camZ = lerp(camZ, 2.75, w34);
      lookX = lerp(lookX, -0.06, w34);
      lookY = lerp(lookY, 0.94, w34);
      lookZ = lerp(lookZ, -0.35, w34);
      fov = lerp(fov, b4Fish, w34);

      // B5: Plano aberto comico (fly-by + explosao 32 puffs + almofada na cabeca!)
      camX = lerp(camX, 0.0 + shakeX, w45);
      camY = lerp(camY, 1.48 + shakeY, w45);
      camZ = lerp(camZ, 4.65, w45);
      lookX = lerp(lookX, 0.0, w45);
      lookY = lerp(lookY, 1.06, w45);
      lookZ = lerp(lookZ, -0.42, w45);
      fov = lerp(fov, 47.0, w45);

      // B6: Camila ri atras -> Voce enfia rosto com almofada na cabeca no FISHEYE FOV 80 deg!
      const b6Fov = CD ? CD.fisheyePulse(47.0, 80.0, b6FishIn) : 80.0;
      camX = lerp(camX, lerp(0.0, -0.14, b6FishIn), w56);
      camY = lerp(camY, lerp(1.42, 1.08, b6FishIn), w56);
      camZ = lerp(camZ, lerp(4.30, 1.66, b6FishIn), w56);
      lookX = lerp(lookX, lerp(0.0, -0.12, b6FishIn), w56);
      lookY = lerp(lookY, lerp(1.06, 1.24, b6FishIn), w56);
      lookZ = lerp(lookZ, lerp(-0.30, 0.32, b6FishIn), w56);
      fov = lerp(fov, b6Fov, w56);

      this.camera.fov = clamp(fov, 24, 92);
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // =========================================================================
      // 2. POSICIONAMENTO X/Z DOS PERSONAGENS (Y aterrado via CartoonDistort3D!)
      // =========================================================================
      let voceX = lerp(-0.40, -0.90, w12);
      voceX = lerp(voceX, -0.88, w23);
      voceX = lerp(voceX, -0.84, w34);
      voceX = lerp(voceX, -0.24, w45);
      voceX = lerp(voceX, -0.16, w56);

      let voceZ = lerp(0.56, 0.28, w12);
      voceZ = lerp(voceZ, 0.30, w23);
      voceZ = lerp(voceZ, 0.26, w45);
      voceZ = lerp(voceZ, 0.56, w56);

      let voceRotY = lerp(0.04, 0.58, w12 * (1 - w23));
      voceRotY = lerp(voceRotY, 0.34, w23);
      voceRotY = lerp(voceRotY, -0.08, w45);
      voceRotY = lerp(voceRotY, 0.04, w56);

      this.voce.group.position.x = voceX;
      this.voce.group.position.z = voceZ;
      this.voce.group.rotation.y = voceRotY;

      let camPosX = lerp(0.62, 0.94, w12);
      camPosX = lerp(camPosX, 0.88, w34);
      camPosX = lerp(camPosX, 0.48, w56);

      let camPosZ = lerp(-0.10, 0.26, w12);
      camPosZ = lerp(camPosZ, 0.26, w34);
      camPosZ = lerp(camPosZ, -0.34, w56);

      let camRotY = lerp(-0.48, -0.64, w12);
      camRotY = lerp(camRotY, -0.78, w34);
      camRotY = lerp(camRotY, -0.24, w56);

      this.camila.group.position.x = camPosX;
      this.camila.group.position.z = camPosZ;
      this.camila.group.rotation.y = camRotY;

      // =========================================================================
      // 3. EMOCOES, LIP-SYNC SILABICO EXCLUSIVO POR FALANTE E CARTOON DISTORTION
      // =========================================================================
      let voceEmotion = 'shocked';
      if (rawTime >= b[2] && rawTime < b[3] + 0.8) voceEmotion = 'smirk';
      else if (rawTime >= b[4] + 1.8) voceEmotion = 'happy';

      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');

      const b2SquatW = w12 * (1 - w23);
      const b3MachoW = w23 * (1 - w34);
      const b4TenseW = w34 * (1 - w45);
      const b5SquashW = smoothstep((rawTime - (b[4] + 1.65)) / 0.25) * (1 - w56);

      this.voce.setLook(lerp(0.0, 0.16, b3MachoW), lerp(-0.04, -0.14, b3MachoW));
      // Lip-sync ativo SOMENTE quando Voce esta falando!
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0.0);
      this.voce.update(1 / 60, time);

      if (CD && b2SquatW > 0.02) {
        CD.deepSquatLegs(this.voce, b2SquatW * 0.58, b2SquatW * 0.14, rawTime);
      }

      const b1Panic = 1 - w12;
      let voceSy = 1.0;
      let voceSxzBoost = 1.0;
      let voceHeadScale = 1.0;
      let voceHeadStretch = 1.0;
      let voceHeadTilt = 0.0;
      let voceHeadJitter = 0.0;
      let voceArmStretch = 1.0;
      let voceArmWobble = 0.0;

      // B1a: headPop 1.48x suando no fisheye 84 deg
      voceSy += b1Panic * (-0.06 + Math.sin(rawTime * 11.0) * 0.05);
      voceHeadScale += b1Panic * (0.48 * (1 - w1ab * 0.35));
      voceHeadStretch += b1Panic * 0.12;
      voceHeadJitter += b1Panic * 0.065;

      // B2: agachamento sanfona segurando a valvula
      voceSy -= b2SquatW * 0.22;
      voceSxzBoost += b2SquatW * 0.14;
      voceHeadScale += b2SquatW * 0.22;

      // B3: Macho chest puff 1.20x + rubber arms!
      voceSy += b3MachoW * 0.06;
      voceSxzBoost += b3MachoW * 0.20;
      voceHeadScale += b3MachoW * 0.16;
      voceArmStretch += b3MachoW * 0.30;
      voceArmWobble += b3MachoW * 0.16;

      // B4: tenso
      voceHeadScale += b4TenseW * 0.22;
      voceHeadJitter += b4TenseW * 0.05;
      voceArmStretch += b4TenseW * 0.26;
      voceArmWobble += b4TenseW * 0.18;

      // B5: esmagado sob impacto da almofada!
      voceSy -= b5SquashW * (0.30 + impactBounceVal * 0.10);
      voceSxzBoost += b5SquashW * 0.14;
      voceHeadScale += b5SquashW * 0.32;
      voceHeadJitter += (inHitstop > 0 ? 0.12 : 0) + b5SquashW * 0.05;

      // B6: fisheye roast close-up com almofada na cabeca!
      voceSy += w56 * (Math.sin(rawTime * 6.0) * 0.04);
      voceHeadScale += w56 * (0.30 + b6FishIn * 0.16);
      voceHeadTilt += w56 * Math.sin(rawTime * 4.5) * 0.10;

      if (CD) {
        CD.footAnchoredSquash(this.voce.group, VOCE_GROUND_Y, voceSy, voceSxzBoost, 0, 0, 0);
        CD.headPop(this.voce.headGroup, voceHeadScale, voceHeadStretch, voceHeadTilt, voceHeadJitter, rawTime);
        CD.armRubberStretch(this.voce.shoulderL, this.voce.shoulderL.elbow, voceArmStretch, voceArmWobble, rawTime);
        CD.armRubberStretch(this.voce.shoulderR, this.voce.shoulderR.elbow, voceArmStretch, -voceArmWobble, rawTime);
      } else {
        this.voce.group.position.y = VOCE_GROUND_Y;
      }
      this.voceShadow.position.set(voceX, 0.015, voceZ + 0.02);
      this.voceShadow.scale.setScalar(clamp(1 / Math.sqrt(Math.max(0.55, voceSy)) * voceSxzBoost, 0.75, 1.45));

      // --- CAMILA ---
      let camilaEmotion = 'angry';
      if (rawTime >= b[1] && rawTime < b[3]) camilaEmotion = 'alert';
      else if (rawTime >= b[3] && rawTime < b[5]) camilaEmotion = 'scared';
      else if (rawTime >= b[5]) camilaEmotion = 'happy';

      this.camila.setEmotion(camilaEmotion);
      this.camila.setLook(lerp(-0.14, 0.02, w56), lerp(0.0, -0.10, b4TenseW));
      // Lip-sync ativo SOMENTE quando Camila esta falando!
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : 0.0);
      this.camila.update(1 / 60, time);

      let camSy = 1.0;
      let camHeadScale = 1.0;
      let camHeadJitter = 0.0;
      let camArmStretch = 1.0;
      let camArmWobble = 0.0;

      const b1bW = w1ab * (1 - w12);
      camHeadScale += b1bW * 0.42;
      camHeadJitter += b1bW * 0.05;

      camHeadScale += b4TenseW * 0.44;
      camHeadJitter += b4TenseW * 0.06;
      camArmStretch += b4TenseW * 0.25;
      camArmWobble += b4TenseW * 0.16;

      const b5CamShock = w45 * (1 - w56);
      camSy += b5CamShock * (0.10 + impactBounceVal * 0.12);
      camHeadScale += b5CamShock * 0.38;

      camSy += w56 * (Math.sin(rawTime * 7.8) * 0.09);
      camHeadScale += w56 * (0.28 + Math.abs(Math.sin(rawTime * 7.8)) * 0.10);

      if (CD) {
        CD.footAnchoredSquash(this.camila.group, CAMILA_GROUND_Y, camSy, 1.0, 0, 0, 0);
        CD.headPop(this.camila.headGroup, camHeadScale, 1.06, 0, camHeadJitter, rawTime);
        CD.armRubberStretch(this.camila.shoulderL, this.camila.shoulderL.elbow, camArmStretch, camArmWobble, rawTime);
        CD.armRubberStretch(this.camila.shoulderR, this.camila.shoulderR.elbow, camArmStretch, -camArmWobble, rawTime);
      } else {
        this.camila.group.position.y = CAMILA_GROUND_Y;
      }
      this.camilaShadow.position.set(camPosX, 0.015, camPosZ + 0.02);
      this.camilaShadow.scale.setScalar(clamp(1 / Math.sqrt(Math.max(0.65, camSy)), 0.78, 1.32));

      // =========================================================================
      // 4. PROPS: COLCHAO INFLAVEL, BOMBA, FLY-BY, EXPLOSAO & ALMOFADA NA CABECA
      // =========================================================================
      this.voce.group.updateMatrixWorld(true);
      this.voce.headGroup.getWorldPosition(this._tmpHeadPos);

      const inflateScale = lerp(0.88, 1.36, clamp(w12 * 0.45 + w23 * 0.30 + w34 * 0.25, 0, 1));
      const pressure01 = clamp(w12 * 0.35 + w23 * 0.35 + w34 * 0.30, 0, 1) * (1 - deflated01);

      const tlObj = this._getTimeline();
      const bStarts = (tlObj && Array.isArray(tlObj.beat_starts)) ? tlObj.beat_starts : [0, 9.5, 14.0, 18.5, 23.0, 27.5];
      let bIdx = 0;
      for (let k = bStarts.length - 1; k >= 0; k--) {
        if (rawTime >= bStarts[k]) { bIdx = k; break; }
      }
      const bStart = bStarts[bIdx] || 0;
      const bEnd = bStarts[bIdx + 1] || ((tlObj && tlObj.duration) ? tlObj.duration : 35.0);
      const bProg = clamp((rawTime - bStart) / Math.max(0.2, bEnd - bStart), 0, 1);
      this.furadeira.update(rawTime, bIdx, bProg, this._tmpHeadPos, this.voce.group.position);

      // Gotas de suor no rosto do Voce (B1/B4/B5)
      const sweatAmp = clamp(b1Panic * (1 - w1ab * 0.7) + b4TenseW * 0.8 + shockShake * 0.9, 0, 1);
      for (let i = 0; i < this.voceSweatDrops.length; i++) {
        const sd = this.voceSweatDrops[i];
        sd.mesh.visible = sweatAmp > 0.08;
        if (sd.mesh.visible) {
          const cyc = (rawTime * 2.2 + sd.seed) % 1;
          sd.mesh.position.set(
            this._tmpHeadPos.x + sd.arcX * (0.5 + cyc * 1.2),
            this._tmpHeadPos.y + 0.14 + Math.sin(cyc * Math.PI) * sd.arcY - cyc * cyc * 0.20,
            this._tmpHeadPos.z + sd.arcZ * (0.5 + cyc * 0.8)
          );
          const sc = (0.65 + (1 - cyc) * 0.65) * sweatAmp;
          sd.mesh.scale.set(sc * 0.85, sc * 1.35, sc * 0.85);
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep14FuradeiraParede3D = Ep14FuradeiraParede3D;
})(typeof window !== 'undefined' ? window : globalThis);
