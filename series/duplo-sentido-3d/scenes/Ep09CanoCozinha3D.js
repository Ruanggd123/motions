/**
 * Ep09CanoCozinha3D.js -- Ep 09 (Cartoon Distortion & Viral Meme): "O Cano Estourado da Pia!"
 * Motor compartilhado: window.CartoonDistort3D (foot-anchored squash & stretch, big-head pop,
 * rubber arm stretch, meme fisheye FOV 76-84 deg, hitstop micro-freeze, elastic bounce).
 *
 * Arco visual 6-beat:
 * - B1a/B1b (0.0s IN MEDIA RES): Fisheye 84 deg colado no rosto suando do Voce (headPop 1.48x) ->
 *   whip rapido pra Camila gritando ("NAO SOLTA AGORA!"), placa "COZINHA DO 304 · REPARO EXPRESS" 100% oculta!
 * - B2 (WHIP-DOLLY REVEAL): Revela cozinha ensolarada xadrez, geladeira c/ imas, caixa de ferramentas vermelha,
 *   placa 100% nitida, Voce esmagado plano (floorY=0) tampando o cano com o dedo e Camila segurando um esfregao!
 * - B3 (MACHO CHEST PUFF + EASTER EGG): Peito estufado 1.20x + bracos de borracha girando a chave inglesa vermelha
 *   enquanto o cano PVC incha feito balao e o patinho amarelo de bone azul pula na pia entre bolhas de sabao!
 * - B4 (FISHEYE SUSPENSE): FOV 76 deg focado na junta inchada brilhando/tremendo + Camila headPop 1.42x abaixo da placa!
 * - B5 (HITSTOP + FLY-BY + GEISER 32 PUFFS + DESENTUPIDOR NA CABECA): Hitstop -> tampao passa COLADO NA LENTE ->
 *   geiser gigante de 32 puffs turquesa/branco + desentupidor vermelho aterrissa de ponta-cabeca no Voce esmagado!
 * - B6 (FISHEYE ROAST): FOV 80 deg no Voce usando o desentupidor como chapeu enquanto Camila pula rindo atras!
 *
 * Regras fisicas garantidas:
 * - ZERO Pacoca!
 * - Pes 100% aterrados no piso via CartoonDistort3D.footAnchoredSquash (floorY = 0).
 * - Props segurados SEMPRE em y <= 0.83 (chave inglesa e esfregao).
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

  class Ep09CanoCozinha3D {
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
      this.renderer.toneMappingExposure = 1.15;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0xbaf2ff);
      this.scene.fog = new T.FogExp2(0xfffbeb, 0.008);

      this.camera = new T.PerspectiveCamera(45, 1080 / 1920, 0.08, 120);
      this._tmpHeadPos = new T.Vector3();

      this._initLights(T);
      this._buildSunnyKitchen3D(T);
      this._initCharactersAndProps3D(T);
      this._buildMopAndSweat(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP09_CANO_TIMELINE ? global.EP09_CANO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 9.724, 13.884, 18.475, 22.783, 27.195];
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
        return Number(tl.dialogues[1].start) || 4.1;
      }
      return Math.max(2.6, b[1] * 0.52);
    }

    _initLights(T) {
      this.scene.add(new T.AmbientLight(0xfffdf5, 0.98));
      const hemi = new T.HemisphereLight(0xe0f2fe, 0xfde68a, 0.85);
      hemi.position.set(0, 10, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 2.05);
      sun.position.set(-3.8, 8.5, 5.5);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -5.0; sun.shadow.camera.right = 5.0;
      sun.shadow.camera.top = 5.0; sun.shadow.camera.bottom = -5.0;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      this.windowGlow = new T.PointLight(0xfef08a, 1.35, 6.5);
      this.windowGlow.position.set(-1.15, 1.75, -1.75);
      this.scene.add(this.windowGlow);
    }

    _makeCheckerTexture(T) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const g = c.getContext('2d');
      const cells = 8;
      const sz = c.width / cells;
      for (let r = 0; r < cells; r++) {
        for (let col = 0; col < cells; col++) {
          g.fillStyle = (r + col) % 2 === 0 ? '#fef3c7' : '#99f6e4';
          g.fillRect(col * sz, r * sz, sz, sz);
        }
      }
      const tex = new T.CanvasTexture(c);
      tex.wrapS = T.RepeatWrapping;
      tex.wrapT = T.RepeatWrapping;
      tex.repeat.set(6, 6);
      tex.needsUpdate = true;
      return tex;
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 176;
      const g = c.getContext('2d');
      g.fillStyle = '#0c4a6e';
      g.fillRect(0, 0, 640, 176);
      g.strokeStyle = '#38bdf8';
      g.lineWidth = 12;
      g.strokeRect(8, 8, 624, 160);
      g.fillStyle = '#fef08a';
      g.font = '900 44px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 320, 76);
      g.fillStyle = '#7dd3fc';
      g.font = '900 34px "Segoe UI", sans-serif';
      g.fillText(subtitle, 320, 134);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildSunnyKitchen3D(T) {
      // 1. Piso xadrez brilhante de cozinha (y = 0.00)
      const floor = new T.Mesh(
        new T.PlaneGeometry(20, 20),
        new T.MeshStandardMaterial({ map: this._makeCheckerTexture(T), roughness: 0.55, metalness: 0.05 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      // 2. Paredes pastel quentes/ensolaradas
      const wallPastel = new T.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.85 });
      const wallTrim = new T.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.65 });
      const backWall = new T.Mesh(new T.BoxGeometry(9.0, 3.8, 0.18), wallPastel);
      backWall.position.set(0, 1.9, -2.30);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const leftWall = new T.Mesh(new T.BoxGeometry(0.18, 3.8, 7.0), wallPastel);
      leftWall.position.set(-2.6, 1.9, 0.2);
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);

      const baseboard = new T.Mesh(new T.BoxGeometry(9.0, 0.14, 0.22), wallTrim);
      baseboard.position.set(0, 0.07, -2.28);
      this.scene.add(baseboard);

      // 3. Janela ensolarada na parede esquerda/fundo com ceu azul e cortininha
      const winFrame = new T.Mesh(new T.BoxGeometry(1.18, 1.02, 0.08), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
      winFrame.position.set(-1.35, 1.72, -2.18);
      this.scene.add(winFrame);

      const winGlass = new T.Mesh(
        new T.PlaneGeometry(1.02, 0.86),
        new T.MeshBasicMaterial({ color: 0x7dd3fc })
      );
      winGlass.position.set(-1.35, 1.72, -2.13);
      this.scene.add(winGlass);

      const sunDisk = new T.Mesh(new T.CircleGeometry(0.16, 16), new T.MeshBasicMaterial({ color: 0xfef08a }));
      sunDisk.position.set(-1.12, 1.92, -2.12);
      this.scene.add(sunDisk);

      // Cruzeta da janela + peitoril com vasinho verde
      const mullionV = new T.Mesh(new T.BoxGeometry(0.04, 0.88, 0.05), new T.MeshStandardMaterial({ color: 0xffffff }));
      mullionV.position.set(-1.35, 1.72, -2.12);
      this.scene.add(mullionV);
      const mullionH = new T.Mesh(new T.BoxGeometry(1.04, 0.04, 0.05), new T.MeshStandardMaterial({ color: 0xffffff }));
      mullionH.position.set(-1.35, 1.72, -2.12);
      this.scene.add(mullionH);

      const sill = new T.Mesh(new T.BoxGeometry(1.26, 0.06, 0.18), new T.MeshStandardMaterial({ color: 0xfef3c7 }));
      sill.position.set(-1.35, 1.20, -2.12);
      this.scene.add(sill);

      // 4. Armarios superiores pastel azul/branco (posicionados fora da faixa da placa!)
      const cabMat = new T.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.45 });
      const cabDoorMat = new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.42 });
      const upperCab = new T.Mesh(new T.BoxGeometry(1.10, 0.62, 0.34), cabMat);
      upperCab.position.set(-0.20, 1.88, -2.02);
      upperCab.castShadow = true;
      this.scene.add(upperCab);

      [-0.46, 0.06].forEach((dx) => {
        const d = new T.Mesh(new T.BoxGeometry(0.48, 0.54, 0.04), cabDoorMat);
        d.position.set(dx, 1.88, -1.84);
        this.scene.add(d);
      });

      // 5. Geladeira retro menta com imas coloridos a direita!
      const fridgeMat = new T.MeshStandardMaterial({ color: 0xa7f3d0, roughness: 0.32, metalness: 0.08 });
      const chromeMat = new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.18 });
      const fridge = new T.Mesh(new T.BoxGeometry(0.86, 1.92, 0.72), fridgeMat);
      fridge.position.set(1.38, 0.96, -1.74);
      fridge.castShadow = true;
      fridge.receiveShadow = true;
      this.scene.add(fridge);

      const fridgeLine = new T.Mesh(new T.BoxGeometry(0.88, 0.025, 0.74), chromeMat);
      fridgeLine.position.set(1.38, 1.32, -1.74);
      this.scene.add(fridgeLine);

      [1.56, 1.05].forEach((hy) => {
        const handle = new T.Mesh(new T.BoxGeometry(0.04, 0.24, 0.06), chromeMat);
        handle.position.set(1.06, hy, -1.36);
        this.scene.add(handle);
      });

      // Imas coloridos na porta da geladeira
      [
        { x: 1.24, y: 1.15, c: 0xef4444 },
        { x: 1.44, y: 1.08, c: 0xfacc15 },
        { x: 1.32, y: 0.92, c: 0x3b82f6 },
        { x: 1.52, y: 1.58, c: 0xf97316 },
        { x: 1.26, y: 1.66, c: 0xec4899 }
      ].forEach((m) => {
        const mag = new T.Mesh(new T.SphereGeometry(0.036, 10, 8), new T.MeshStandardMaterial({ color: m.c, roughness: 0.3 }));
        mag.scale.set(1, 1, 0.45);
        mag.position.set(m.x, m.y, -1.37);
        this.scene.add(mag);
      });

      // 6. Caixa de ferramentas vermelha no piso a esquerda da pia
      const redBox = new T.Mesh(new T.BoxGeometry(0.46, 0.24, 0.28), new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.36 }));
      redBox.position.set(-1.18, 0.12, -0.78);
      redBox.rotation.y = 0.28;
      redBox.castShadow = true;
      this.scene.add(redBox);

      const boxHandle = new T.Mesh(new T.TorusGeometry(0.08, 0.015, 8, 12, Math.PI), chromeMat);
      boxHandle.position.set(-1.18, 0.24, -0.78);
      boxHandle.rotation.y = 0.28;
      this.scene.add(boxHandle);

      // 7. Placa "COZINHA DO 304 · REPARO EXPRESS" (OCULTA em B1, 100% nitida em B2..B6!)
      const signTex = this._makeSignTexture(T, 'COZINHA DO 304', '· REPARO EXPRESS ·');
      this.signBoard = new T.Mesh(
        new T.BoxGeometry(2.06, 0.48, 0.06),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.45 })
      );
      this.signBoard.position.set(0.0, 2.52, -2.08);
      this.scene.add(this.signBoard);

      // 8. Sombras de contato no piso y = 0.015
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
      if (!global.VoceMorador3D || !global.DonaCamila3D || !global.CanoCozinha3D) {
        throw new Error('Personagens ou CanoCozinha3D nao carregados');
      }
      // ZERO Pacoca! Elenco exclusivo: VoceMorador3D + DonaCamila3D + CanoCozinha3D
      this.voce = new global.VoceMorador3D();
      this.voce.group.position.set(-0.40, VOCE_GROUND_Y, 0.56);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D();
      this.camila.group.position.set(0.62, CAMILA_GROUND_Y, -0.10);
      this.camila.group.rotation.y = -0.48;
      this.scene.add(this.camila.group);

      this.cano = new global.CanoCozinha3D();
      this.scene.add(this.cano.group);
    }

    _buildMopAndSweat(T) {
      // Esfregao da Camila em B2 (mantido em y <= 0.78!)
      this.mopGroup = new T.Group();
      const stick = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.96, 10), new T.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 }));
      stick.position.y = 0.0;
      this.mopGroup.add(stick);

      const mopHead = new T.Mesh(new T.CylinderGeometry(0.08, 0.13, 0.18, 12), new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 }));
      mopHead.position.y = -0.48;
      this.mopGroup.add(mopHead);
      this.mopGroup.visible = false;
      this.scene.add(this.mopGroup);

      // 14 gotas de suor/agua espirrando no rosto do Voce (B1/B4/B5)
      this.voceSweatDrops = [];
      const dropMat = new T.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.35, roughness: 0.10 });
      for (let i = 0; i < 14; i++) {
        const drop = new T.Mesh(new T.SphereGeometry(0.022, 8, 6), dropMat);
        drop.visible = false;
        this.scene.add(drop);
        this.voceSweatDrops.push({
          mesh: drop,
          seed: i / 14,
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

      // B5 coreografia: tampao fly-by -> geiser 32 puffs -> desentupidor pousa na cabeca!
      const capFlyP = clamp((rawTime - (b[4] + 0.22)) / 1.15, 0, 1);
      const geyserP = clamp((rawTime - (b[4] + 0.35)) / 3.40, 0, 1);
      const plungerFlyP = clamp((rawTime - (b[4] + 0.90)) / 1.05, 0, 1);
      const impactAge = clamp((rawTime - (b[4] + 1.95)) / 1.30, 0, 1);
      const impactBounceVal = CD ? CD.impactBounce(impactAge, 3.0) : 0;
      const shockShake = smoothstep((rawTime - (b[4] + 0.30)) / 0.14) * (1 - smoothstep((rawTime - (b[4] + 2.20)) / 0.50));

      // Placa 100% OCULTA em B1a/B1b e 100% VISIVEL de B2 ate B6!
      this.signBoard.visible = w12 > 0.14;

      // =========================================================================
      // 1. CAMERA FISHEYE / WHIP-DOLLY MULTI-ANGULO
      // =========================================================================
      const shakeX = Math.sin(rawTime * 28.0) * 0.038 * shockShake + (inHitstop > 0 ? Math.sin(rawTime * 60.0) * 0.024 : 0);
      const shakeY = Math.cos(rawTime * 25.0) * 0.028 * shockShake + (inHitstop > 0 ? Math.cos(rawTime * 55.0) * 0.020 : 0);

      // B1a: FOV 84 deg fisheye colado no rosto suando do Voce -> whip pra B1b Camila gritando
      let camX = lerp(-0.40, 0.58, w1ab);
      let camY = lerp(1.16, 1.24, w1ab);
      let camZ = lerp(1.26, 0.88, w1ab);
      let lookX = lerp(-0.40, 0.62, w1ab);
      let lookY = lerp(1.12, 1.18, w1ab);
      let lookZ = lerp(0.56, -0.10, w1ab);
      let fov = lerp(CD ? CD.fisheyePulse(76.0, 84.0, 0.5 + b1aRamp * 0.5) : 84.0, 80.0, w1ab);

      // B2: Whip-dolly reveal da cozinha ensolarada + placa livre + Voce esmagado tampando cano + Camila com esfregao
      camX = lerp(camX, 0.02, w12);
      camY = lerp(camY, 1.48, w12);
      camZ = lerp(camZ, 4.55, w12);
      lookX = lerp(lookX, 0.0, w12);
      lookY = lerp(lookY, 1.06, w12);
      lookZ = lerp(lookZ, -0.60, w12);
      fov = lerp(fov, 46.5, w12);

      // B3: Hero framing no Voce estufando o peito com chave inglesa + patinho na pia
      camX = lerp(camX, 0.02, w23);
      camY = lerp(camY, 1.46, w23);
      camZ = lerp(camZ, 4.35, w23);
      lookX = lerp(lookX, -0.04, w23);
      lookY = lerp(lookY, 1.06, w23);
      lookZ = lerp(lookZ, -0.52, w23);
      fov = lerp(fov, 46.5, w23);

      // B4: FISHEYE SUSPENSE FOV 76 deg na junta inchada + Camila gritando abaixo da placa
      const b4Fish = CD ? CD.fisheyePulse(46.5, 76.0, w34) : 76.0;
      camX = lerp(camX, 0.14, w34);
      camY = lerp(camY, 1.38, w34);
      camZ = lerp(camZ, 2.55, w34);
      lookX = lerp(lookX, 0.06, w34);
      lookY = lerp(lookY, 0.98, w34);
      lookZ = lerp(lookZ, -0.45, w34);
      fov = lerp(fov, b4Fish, w34);

      // B5: Plano aberto comico (tampao fly-by + geiser 32 puffs + desentupidor caindo na cabeca!)
      camX = lerp(camX, 0.0 + shakeX, w45);
      camY = lerp(camY, 1.48 + shakeY, w45);
      camZ = lerp(camZ, 4.65, w45);
      lookX = lerp(lookX, 0.0, w45);
      lookY = lerp(lookY, 1.06, w45);
      lookZ = lerp(lookZ, -0.42, w45);
      fov = lerp(fov, 47.0, w45);

      // B6: Camila ri atras -> Voce enfia rosto com chapeu de desentupidor no FISHEYE FOV 80 deg!
      const b6Fov = CD ? CD.fisheyePulse(47.0, 80.0, b6FishIn) : 80.0;
      camX = lerp(camX, lerp(0.0, -0.14, b6FishIn), w56);
      camY = lerp(camY, lerp(1.42, 1.24, b6FishIn), w56);
      camZ = lerp(camZ, lerp(4.30, 1.62, b6FishIn), w56);
      lookX = lerp(lookX, lerp(0.0, -0.12, b6FishIn), w56);
      lookY = lerp(lookY, lerp(1.06, 1.12, b6FishIn), w56);
      lookZ = lerp(lookZ, lerp(-0.30, 0.32, b6FishIn), w56);
      fov = lerp(fov, b6Fov, w56);

      this.camera.fov = clamp(fov, 24, 92);
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // =========================================================================
      // 2. POSICIONAMENTO X/Z DOS PERSONAGENS (Y aterrado via CartoonDistort3D!)
      // =========================================================================
      let voceX = lerp(-0.40, -0.52, w12);
      voceX = lerp(voceX, -0.54, w23);
      voceX = lerp(voceX, -0.22, w45);
      voceX = lerp(voceX, -0.16, w56);

      let voceZ = lerp(0.56, -0.18, w12);
      voceZ = lerp(voceZ, -0.12, w23);
      voceZ = lerp(voceZ, 0.08, w45);
      voceZ = lerp(voceZ, 0.54, w56);

      let voceRotY = lerp(0.04, 1.35, w12 * (1 - w23)); // Em B2 agachado virado pro cano ao lado!
      voceRotY = lerp(voceRotY, 0.72, w23);
      voceRotY = lerp(voceRotY, -0.18, w45);
      voceRotY = lerp(voceRotY, 0.04, w56);

      this.voce.group.position.x = voceX;
      this.voce.group.position.z = voceZ;
      this.voce.group.rotation.y = voceRotY;

      let camPosX = lerp(0.62, 0.68, w12);
      camPosX = lerp(camPosX, 0.60, w34);
      camPosX = lerp(camPosX, 0.48, w56);

      let camPosZ = lerp(-0.10, -0.02, w12);
      camPosZ = lerp(camPosZ, 0.06, w34);
      camPosZ = lerp(camPosZ, -0.34, w56);

      let camRotY = lerp(-0.48, -0.64, w12);
      camRotY = lerp(camRotY, -0.78, w34);
      camRotY = lerp(camRotY, -0.24, w56);

      this.camila.group.position.x = camPosX;
      this.camila.group.position.z = camPosZ;
      this.camila.group.rotation.y = camRotY;

      // =========================================================================
      // 3. EMOCOES, LIP-SYNC, BRACOS E CARTOON DISTORTION
      // =========================================================================
      let voceEmotion = 'shocked';
      if (rawTime >= b[2] && rawTime < b[3] + 0.8) voceEmotion = 'smirk';
      else if (rawTime >= b[4] + 2.2) voceEmotion = 'happy';

      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');

      const b2SquashW = w12 * (1 - w23);
      const b3MachoW = w23 * (1 - w34);
      const b4TenseW = w34 * (1 - w45);
      const b5SquashW = smoothstep((rawTime - (b[4] + 1.85)) / 0.25) * (1 - w56);

      this.voce.setLook(lerp(0.0, 0.18, b3MachoW), lerp(-0.04, -0.16, b3MachoW));
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0);
      this.voce.update(1 / 60, time);

      // Bracos do Voce segurando chave inglesa em B3-B4
      const holdWrenchW = clamp(w23 * (1 - w45), 0, 1);
      if (holdWrenchW > 0.01 && this.voce.shoulderL && this.voce.shoulderR) {
        const crank = Math.sin(time * 7.5) * 0.24 * b3MachoW + Math.sin(time * 18.0) * 0.12 * b4TenseW;
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, -0.72 + crank, holdWrenchW);
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -0.72 - crank, holdWrenchW);
        this.voce.shoulderL.elbow.rotation.x = lerp(this.voce.shoulderL.elbow.rotation.x, -0.82, holdWrenchW);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, -0.82, holdWrenchW);
      }

      // Distorcoes cartoon do Voce (100% aterradas em floorY = 0!)
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

      // B2: esmagado plano (sy ~ 0.72) tampando o cano!
      voceSy -= b2SquashW * 0.28;
      voceSxzBoost += b2SquashW * 0.16;
      voceHeadScale += b2SquashW * 0.24;

      // B3: Macho chest puff 1.20x + rubber arms na chave inglesa!
      voceSy += b3MachoW * 0.06;
      voceSxzBoost += b3MachoW * 0.20;
      voceHeadScale += b3MachoW * 0.16;
      voceArmStretch += b3MachoW * 0.32;
      voceArmWobble += b3MachoW * 0.18;

      // B4: tenso
      voceHeadScale += b4TenseW * 0.22;
      voceHeadJitter += b4TenseW * 0.05;
      voceArmStretch += b4TenseW * 0.28;
      voceArmWobble += b4TenseW * 0.20;

      // B5: esmagado sob impacto do desentupidor!
      voceSy -= b5SquashW * (0.30 + impactBounceVal * 0.10);
      voceSxzBoost += b5SquashW * 0.14;
      voceHeadScale += b5SquashW * 0.32;
      voceHeadJitter += (inHitstop > 0 ? 0.12 : 0) + b5SquashW * 0.05;

      // B6: fisheye roast close-up com desentupidor na cabeca!
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
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : 0);
      this.camila.update(1 / 60, time);

      if (this.camila.shoulderL && this.camila.shoulderR) {
        if (b2SquashW > 0.05) {
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -0.68, b2SquashW);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.68, b2SquashW);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.82, b2SquashW);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -0.82, b2SquashW);
        } else if (b4TenseW > 0.05) {
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -1.15 + Math.sin(rawTime * 12.0) * 0.14, b4TenseW);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.92, b4TenseW);
        }
      }

      let camSy = 1.0;
      let camHeadScale = 1.0;
      let camHeadJitter = 0.0;
      let camArmStretch = 1.0;
      let camArmWobble = 0.0;

      // B1b: headPop 1.42x gritando!
      const b1bW = w1ab * (1 - w12);
      camHeadScale += b1bW * 0.42;
      camHeadJitter += b1bW * 0.05;

      // B4: headPop 1.42x abaixo da placa!
      camHeadScale += b4TenseW * 0.42;
      camHeadJitter += b4TenseW * 0.06;
      camArmStretch += b4TenseW * 0.25;
      camArmWobble += b4TenseW * 0.16;

      // B5: choque
      const b5CamShock = w45 * (1 - w56);
      camSy += b5CamShock * (0.12 + impactBounceVal * 0.14);
      camHeadScale += b5CamShock * 0.38;

      // B6: squash-bounce rindo atras!
      camSy += w56 * (Math.sin(rawTime * 13.0) * 0.20);
      camHeadScale += w56 * (0.28 + Math.abs(Math.sin(rawTime * 13.0)) * 0.12);

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
      // 4. PROPS: ESFREGAO DA CAMILA (B2), CHAVE INGLESA, DESENTUPIDOR & CANO!
      // =========================================================================
      this.mopGroup.visible = b2SquashW > 0.08;
      if (this.mopGroup.visible) {
        this.mopGroup.position.set(camPosX - 0.24, 0.56, camPosZ + 0.26);
        this.mopGroup.rotation.set(0.24, 0, 0.18 + Math.sin(rawTime * 8.0) * 0.08);
      }

      // Posicao mundial exata da cabeca do Voce para o chapeu de desentupidor!
      this.voce.group.updateMatrixWorld(true);
      this.voce.headGroup.getWorldPosition(this._tmpHeadPos);

      let plungerState = { mode: 'floor' };
      if (rawTime >= b[4] + 1.95) {
        plungerState = {
          mode: 'hat',
          headPos: { x: this._tmpHeadPos.x, y: this._tmpHeadPos.y + 0.19 * voceHeadScale, z: this._tmpHeadPos.z }
        };
      } else if (plungerFlyP > 0.01 && plungerFlyP < 1.0) {
        const arc = Math.sin(plungerFlyP * Math.PI) * 1.45;
        plungerState = {
          mode: 'flying',
          flyPos: {
            x: lerp(0.56, this._tmpHeadPos.x, plungerFlyP),
            y: lerp(0.35, this._tmpHeadPos.y + 0.25, plungerFlyP) + arc,
            z: lerp(-0.78, this._tmpHeadPos.z, plungerFlyP)
          },
          flyRot: plungerFlyP * Math.PI * 4.0
        };
      }

      const bulge = clamp(b3MachoW * 0.65 + b4TenseW * 1.0 + (w45 * (1 - capFlyP)), 0, 1);
      const duckPop = clamp(smoothstep((rawTime - (b[2] + 0.45)) / 0.55), 0, 1);

      this.cano.update(time, {
        bulge,
        wrenchActive: holdWrenchW > 0.1,
        wrenchPos: {
          x: voceX + 0.34,
          y: 0.62, // SEMPRE <= 0.78 (propY <= 0.83!)
          z: voceZ + 0.10
        },
        wrenchRot: {
          x: 0.22,
          y: 0.32,
          z: 0.15 + Math.sin(time * 7.5) * 0.38
        },
        capFlyP,
        geyserP,
        duckPop,
        plunger: plungerState
      });

      // Gotas de suor / agua espirrando no rosto do Voce (B1/B4/B5)
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

  global.Ep09CanoCozinha3D = Ep09CanoCozinha3D;
})(typeof window !== 'undefined' ? window : globalThis);
