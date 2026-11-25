/**
 * Ep06BarraAcademia3D.js -- Ep 06 v3.1: Comedia In Media Res + Distorcao Cartoon/Meme 3D!
 * Usa window.CartoonDistort3D para:
 * - B1a/B1b: Fisheye extremo FOV 82° colado na Camila gritando -> chicote pro Voce centralizado com cabeca gigante (1.48x) acima da legenda (placa oculta!)
 * - B2: Whip-dolly reveal com Voce amassado feito sanfona (sy=0.72, pes cravados no piso!) segurando com as duas maos a barra de 60kg em U cartoon!
 * - B3: Ego maromba (peito estufado 1.22x) -> joelhos gelatina (deepSquatLegs) + bracos de borracha + fonte de suor + Easter Egg do haltere pulando no rack!
 * - B4: Crash-zoom fisheye FOV 76° na trava vermelha soltando + cabeca da Camila explodindo gigante (1.42x) em horror abaixo da placa!
 * - B5: Micro-hitstop deterministico -> trava dispara -> 3 anilhas quicam feito bola de borracha e deitam livres no tatame -> Voce catapultado em gelatina -> anilha de 20kg explode o pote de giz (32 puffs)!
 * - B6: Voce colado na lente fisheye FOV 80° (rosto gigante zoeiro!) segurando com as duas maos a barra torta vazia acima da legenda + Camila gargalhando em squash-bounce atras + placa 100% livre!
 *
 * Garantias tecnicas:
 * - ZERO Pacoca.
 * - Pes 100% ancorados no piso via CartoonDistort3D.footAnchoredSquash (|footWorldY| < 0.020 sempre!).
 * - Barra 100% conectada as duas maos do Voce via getWorldPosition() (e y <= 0.825 -> ZERO oclusao facial!).
 * - Placa "ACADEMIA DO BAIRRO · TREINO PESADO ·" 100% oculta em B1 e 100% nitida/desobstruida em B2..B6.
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
  const CHALK_STAND_BASE_X = 1.04;
  const CHALK_STAND_BASE_Z = -0.44;

  class Ep06BarraAcademia3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado');
      this.T = T;
      this.fastTest = Boolean(opts.fastTest);
      this.width = this.fastTest ? 270 : (opts.highRes ? 1080 : 720);
      this.height = this.fastTest ? 480 : (opts.highRes ? 1920 : 1280);

      this._handLWorld = new T.Vector3();
      this._handRWorld = new T.Vector3();

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
      this.scene.background = new T.Color(0xe2e8f0);
      this.scene.fog = new T.FogExp2(0xe2e8f0, 0.0085);

      this.camera = new T.PerspectiveCamera(44, 1080 / 1920, 0.08, 120);

      this._initLights(T);
      this._buildAcademia3D(T);
      this._initCharacters3D(T);
      this._buildParticles(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP06_ACADEMIA_TIMELINE ? global.EP06_ACADEMIA_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 7.531, 11.871, 16.734, 21.172, 24.757];
    }

    _getB1ReplyTime(b) {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.dialogues) && tl.dialogues.length >= 2 && tl.dialogues[1].beat_idx === 0) {
        return tl.dialogues[1].start;
      }
      return b[0] + Math.max(2.2, (b[1] - b[0]) * 0.54);
    }

    _getDialogueState(time) {
      const tl = this._getTimeline();
      if (!tl || !Array.isArray(tl.dialogues)) return { speaker: null, lip: 0 };
      for (let i = 0; i < tl.dialogues.length; i++) {
        const d = tl.dialogues[i];
        if (time >= d.start && time <= d.end && Array.isArray(d.lip_sync) && d.lip_sync.length > 0) {
          const idx = clamp(Math.floor((time - d.start) * 60), 0, d.lip_sync.length - 1);
          return { speaker: d.speaker, lip: d.lip_sync[idx] || 0 };
        }
      }
      return { speaker: null, lip: 0 };
    }

    _initLights(T) {
      this.scene.add(new T.AmbientLight(0xfffbeb, 0.96));
      const hemi = new T.HemisphereLight(0xe0f2fe, 0x94a3b8, 0.86);
      hemi.position.set(0, 12, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 2.02);
      sun.position.set(4.0, 9.2, 6.2);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -5.5; sun.shadow.camera.right = 5.5;
      sun.shadow.camera.top = 5.5; sun.shadow.camera.bottom = -5.5;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      const rim = new T.DirectionalLight(0xfef3c7, 0.58);
      rim.position.set(-4.5, 4.2, 1.5);
      this.scene.add(rim);
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 176;
      const g = c.getContext('2d');
      g.fillStyle = '#0f172a';
      g.fillRect(0, 0, 640, 176);
      g.strokeStyle = '#ef4444';
      g.lineWidth = 12;
      g.strokeRect(8, 8, 624, 160);
      g.fillStyle = '#facc15';
      g.font = '900 44px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 320, 76);
      g.fillStyle = '#38bdf8';
      g.font = '900 36px "Segoe UI", sans-serif';
      g.fillText(subtitle, 320, 134);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildAcademia3D(T) {
      // 1. Piso emborrachado esportivo em y = 0.00 + tatame central azul/vermelho
      const floor = new T.Mesh(
        new T.PlaneGeometry(26, 26),
        new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.78, metalness: 0.06 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      const floorGrid = new T.GridHelper(18, 24, 0x475569, 0x3b495e);
      floorGrid.position.y = 0.002;
      this.scene.add(floorGrid);

      const matOuter = new T.Mesh(
        new T.BoxGeometry(3.40, 0.012, 2.90),
        new T.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.72 })
      );
      matOuter.position.set(0.06, 0.006, 0.0);
      matOuter.receiveShadow = true;
      this.scene.add(matOuter);

      const matInner = new T.Mesh(
        new T.BoxGeometry(2.94, 0.014, 2.44),
        new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.74 })
      );
      matInner.position.set(0.06, 0.008, 0.0);
      matInner.receiveShadow = true;
      this.scene.add(matInner);

      // 2. Paredes altas iluminadas (sem ceu vazando no fisheye!) + espelho + janela ensolarada + placa alta
      const wallLight = new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.82 });
      const wallBase = new T.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.86 });
      const stripeYellow = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
      const stripeRed = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.50 });
      const steelDark = new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.60 });
      const chromeMat = new T.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.85 });

      const backWall = new T.Mesh(new T.BoxGeometry(10.6, 6.4, 0.18), wallLight);
      backWall.position.set(0, 3.2, -3.55);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const backDado = new T.Mesh(new T.BoxGeometry(10.6, 0.90, 0.20), wallBase);
      backDado.position.set(0, 0.45, -3.54);
      this.scene.add(backDado);

      const stripe1 = new T.Mesh(new T.BoxGeometry(10.6, 0.14, 0.21), stripeYellow);
      stripe1.position.set(0, 0.98, -3.53);
      this.scene.add(stripe1);

      const stripe2 = new T.Mesh(new T.BoxGeometry(10.6, 0.08, 0.21), stripeRed);
      stripe2.position.set(0, 1.12, -3.53);
      this.scene.add(stripe2);

      // Espelho grande da academia (que Voce jura ter salvado em B5!)
      const mirrorFrame = new T.Mesh(new T.BoxGeometry(3.40, 1.78, 0.06), steelDark);
      mirrorFrame.position.set(0.05, 1.65, -3.43);
      this.scene.add(mirrorFrame);

      const mirrorGlass = new T.Mesh(
        new T.BoxGeometry(3.26, 1.64, 0.07),
        new T.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.08, metalness: 0.55 })
      );
      mirrorGlass.position.set(0.05, 1.65, -3.42);
      this.scene.add(mirrorGlass);

      const shine = new T.Mesh(
        new T.BoxGeometry(0.28, 1.50, 0.08),
        new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 })
      );
      shine.position.set(-0.68, 1.65, -3.41);
      shine.rotation.z = -0.28;
      this.scene.add(shine);

      const shine2 = new T.Mesh(
        new T.BoxGeometry(0.14, 1.44, 0.08),
        new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.20 })
      );
      shine2.position.set(-0.34, 1.65, -3.41);
      shine2.rotation.z = -0.28;
      this.scene.add(shine2);

      // Parede esquerda alta com janelao ensolarado + feixe de sol
      const leftWall = new T.Mesh(new T.BoxGeometry(0.18, 6.4, 7.2), wallLight);
      leftWall.position.set(-2.35, 3.2, -0.85);
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);

      const windowGlass = new T.Mesh(
        new T.BoxGeometry(0.22, 1.55, 2.40),
        new T.MeshBasicMaterial({ color: 0xe0f2fe })
      );
      windowGlass.position.set(-2.34, 2.05, -0.95);
      this.scene.add(windowGlass);

      const sunBeam = new T.Mesh(
        new T.PlaneGeometry(2.6, 2.2),
        new T.MeshBasicMaterial({ color: 0xfef9c3, transparent: true, opacity: 0.085, side: T.DoubleSide, depthWrite: false })
      );
      sunBeam.position.set(-1.15, 1.38, -1.20);
      sunBeam.rotation.set(0.18, 0.42, -0.45);
      this.scene.add(sunBeam);

      // Pilastra direita alta
      const rightPillar = new T.Mesh(new T.BoxGeometry(0.52, 6.4, 3.0), wallBase);
      rightPillar.position.set(2.02, 3.2, -2.25);
      rightPillar.castShadow = true;
      this.scene.add(rightPillar);

      // Placa "ACADEMIA DO BAIRRO · TREINO PESADO ·" posicionada alta (y=3.12) -- 100% livre de cabecas e .word-pop em B2..B6!
      const signTex = this._makeSignTexture(T, 'ACADEMIA DO BAIRRO', '· TREINO PESADO ·');
      this.signBoard = new T.Mesh(
        new T.BoxGeometry(2.22, 0.56, 0.06),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.38 })
      );
      this.signBoard.position.set(0.02, 3.12, -2.65);
      this.scene.add(this.signBoard);

      // 3. Rack de Halteres Coloridos na esquerda (com Easter Egg do haltere vibrando/pulando em B3!)
      this._buildDumbbellRack(T, steelDark, chromeMat);

      // 4. Banco de Supino + Suporte de Giz Tombavel
      this._buildBenchPressAndTree(T, steelDark, chromeMat, stripeYellow, stripeRed);

      // 5. Sombras de contato no piso y = 0.018
      const shMat = new T.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.28, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.018, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.30, -0.24, 0.26);
      this.camilaShadow = makeShadow(0.26, 0.66, -0.06);
    }

    _buildDumbbellRack(T, steelDark, chromeMat) {
      const rack = new T.Group();
      rack.position.set(-1.32, 0.0, -1.55);
      rack.rotation.y = 0.44;

      [-0.58, 0.58].forEach((lx) => {
        const leg = new T.Mesh(new T.BoxGeometry(0.08, 0.88, 0.46), steelDark);
        leg.position.set(lx, 0.44, 0);
        leg.castShadow = true;
        rack.add(leg);
      });
      [0.42, 0.78].forEach((sy) => {
        const shelf = new T.Mesh(new T.BoxGeometry(1.28, 0.06, 0.34), steelDark);
        shelf.position.set(0, sy, 0);
        shelf.rotation.x = 0.16;
        rack.add(shelf);
      });

      const colors = [0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6];
      [-0.42, -0.14, 0.14, 0.42].forEach((dx, idx) => {
        const dMat = new T.MeshStandardMaterial({ color: colors[idx], roughness: 0.40 });
        [0.48, 0.84].forEach((dy, row) => {
          const dbGroup = new T.Group();
          dbGroup.position.set(dx, dy, 0.02);

          const handle = new T.Mesh(new T.CylinderGeometry(0.017, 0.017, 0.17, 10), chromeMat);
          handle.rotation.x = Math.PI / 2;
          dbGroup.add(handle);

          const isEaster = (row === 1 && idx === 3);
          const r = isEaster ? 0.084 : (0.052 + row * 0.010);
          const bellMat = isEaster
            ? new T.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.18, roughness: 0.32 })
            : dMat;
          [-0.085, 0.085].forEach((hz) => {
            const bell = new T.Mesh(new T.CylinderGeometry(r, r, 0.062, 14), bellMat);
            bell.rotation.x = Math.PI / 2;
            bell.position.z = hz;
            bell.castShadow = true;
            dbGroup.add(bell);
          });

          rack.add(dbGroup);
          if (isEaster) {
            this.easterDumbbell = dbGroup;
            this.easterDumbbellBaseY = dy;
            this.easterDumbbellBaseX = dx;
          }
        });
      });

      const bottle = new T.Mesh(
        new T.CylinderGeometry(0.045, 0.045, 0.22, 14),
        new T.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25 })
      );
      bottle.position.set(0.56, 0.99, 0.04);
      rack.add(bottle);

      this.scene.add(rack);
    }

    _buildBenchPressAndTree(T, steelDark, chromeMat, yellowMat, redMat) {
      const bench = new T.Group();
      bench.position.set(0.86, 0.0, -2.25);
      bench.rotation.y = -0.40;

      const padMat = new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.62 });
      const base = new T.Mesh(new T.BoxGeometry(0.54, 0.07, 1.38), yellowMat);
      base.position.set(0, 0.035, 0);
      bench.add(base);

      [-0.45, 0.45].forEach((pz) => {
        const post = new T.Mesh(new T.BoxGeometry(0.08, 0.42, 0.08), steelDark);
        post.position.set(0, 0.24, pz);
        bench.add(post);
      });

      const pad = new T.Mesh(new T.BoxGeometry(0.36, 0.09, 1.24), padMat);
      pad.position.set(0, 0.48, 0);
      pad.castShadow = true;
      bench.add(pad);

      [-0.42, 0.42].forEach((ux) => {
        const upright = new T.Mesh(new T.BoxGeometry(0.07, 1.28, 0.07), yellowMat);
        upright.position.set(ux, 0.64, -0.52);
        upright.castShadow = true;
        bench.add(upright);
      });

      const bgBar = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 1.48, 12), chromeMat);
      bgBar.rotation.z = Math.PI / 2;
      bgBar.position.set(0, 1.24, -0.52);
      bench.add(bgBar);
      [-0.64, 0.64].forEach((px) => {
        const pl = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.04, 16), redMat);
        pl.rotation.z = Math.PI / 2;
        pl.position.set(px, 1.24, -0.52);
        bench.add(pl);
      });

      this.scene.add(bench);

      // Pote/Suporte branco de giz de magnesio -- esmagado pela anilha de 20kg em B5!
      this.chalkStand = new T.Group();
      this.chalkStand.position.set(CHALK_STAND_BASE_X, 0.0, CHALK_STAND_BASE_Z);
      const standBase = new T.Mesh(new T.CylinderGeometry(0.14, 0.16, 0.04, 16), steelDark);
      standBase.position.y = 0.02;
      standBase.castShadow = true;
      this.chalkStand.add(standBase);
      const standLeg = new T.Mesh(new T.CylinderGeometry(0.032, 0.048, 0.72, 12), steelDark);
      standLeg.position.y = 0.36;
      standLeg.castShadow = true;
      this.chalkStand.add(standLeg);
      const bowl = new T.Mesh(new T.CylinderGeometry(0.20, 0.14, 0.18, 18), chromeMat);
      bowl.position.y = 0.78;
      bowl.castShadow = true;
      this.chalkStand.add(bowl);
      this.chalkMound = new T.Mesh(
        new T.SphereGeometry(0.155, 14, 10),
        new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe2e8f0, emissiveIntensity: 0.16, roughness: 0.94 })
      );
      this.chalkMound.scale.set(1.0, 0.54, 1.0);
      this.chalkMound.position.y = 0.87;
      this.chalkStand.add(this.chalkMound);
      this.scene.add(this.chalkStand);
    }

    _initCharacters3D(T) {
      // APENAS VoceMorador3D + DonaCamila3D + BarraOlimpica3D (ZERO Pacoca!)
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.24, VOCE_GROUND_Y, 0.24);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D({ emotion: 'alert', pose: 'idle' });
      this.camila.group.position.set(0.66, CAMILA_GROUND_Y, -0.04);
      this.camila.group.rotation.y = -0.58;
      this.scene.add(this.camila.group);

      this.barra = new global.BarraOlimpica3D({ scale: 0.95 });
      this.scene.add(this.barra.group);
    }

    _buildParticles(T) {
      // 22 gotinhas de suor formando uma fonte cartoon em B1b, B2, B3 e B4!
      this.sweatDrops = [];
      const sweatMat = new T.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.38,
        transparent: true,
        opacity: 0.88,
        roughness: 0.12
      });
      const dropGeo = new T.SphereGeometry(0.025, 8, 6);
      for (let i = 0; i < 22; i++) {
        const d = new T.Mesh(dropGeo, sweatMat);
        d.visible = false;
        this.scene.add(d);
        this.sweatDrops.push({ mesh: d, seed: i * 0.57, side: i % 2 === 0 ? 1 : -1, arc: 0.20 + (i % 4) * 0.08 });
      }
    }

    renderAt(t) {
      const CD = global.CartoonDistort3D;
      const rawTime = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const b1ReplyT = this._getB1ReplyTime(b);
      const dlg = this._getDialogueState(rawTime);

      // Reseta distorcoes cartoon antes de aplicar o quadro deterministico atual!
      if (CD) {
        CD.resetRigDistortion(this.voce, VOCE_GROUND_Y);
        CD.resetRigDistortion(this.camila, CAMILA_GROUND_Y);
      }

      // Micro-hitstop comico deterministico no disparo da trava no comeco de B5!
      const hitT = b[4] + 0.08;
      const freezeDur = 0.18;
      const inHitstop = CD ? CD.isInHitstop(rawTime, hitT, freezeDur) : 0;
      const time = CD ? CD.hitstopTime(rawTime, hitT, freezeDur, 0.04, 0.22) : rawTime;

      // Pesos de batida (B1a Camila -> B1b Voce -> B2 Reveal -> B3 Ego -> B4 Suspense -> B5 Desastre -> B6 Fisheye Roast!)
      const wB1b = smoothstep((rawTime - (b1ReplyT - 0.16)) / 0.26);
      const w12 = smoothstep((rawTime - (b[1] - 0.14)) / 0.62);
      const w23 = smoothstep((rawTime - (b[2] - 0.12)) / 0.68);
      const w34 = smoothstep((rawTime - (b[3] - 0.10)) / 0.42);
      const w45 = smoothstep((rawTime - (b[4] - 0.08)) / 0.48);
      const w56 = smoothstep((rawTime - (b[5] - 0.14)) / 0.65);

      const b3Dur = Math.max(2.0, b[3] - b[2]);
      const b4Dur = Math.max(1.8, b[4] - b[3]);
      const b5Dur = Math.max(2.4, b[5] - b[4]);

      const b1bPop = wB1b * (1 - w12);
      const b2AccordionW = w12 * (1 - w23);
      const b3PuffW = w23 * (1 - w34);
      const b3JellyW = smoothstep((time - (b[2] + Math.min(0.95, b3Dur * 0.22))) / 0.45) * (1 - w34);
      const b4W = w34 * (1 - w45);

      // B4 suspense: trava vermelha deslizando & piscando na ponta!
      const slipWarning = smoothstep((time - (b[3] - 0.05)) / Math.max(1.2, b4Dur * 0.72)) * (1 - smoothstep((time - (b[4] + 0.20)) / 0.16));

      // B5 desastre: trava voa -> anilhas quicam feito bola de borracha -> catapulta gelatina -> 20kg esmaga pote de giz!
      const dropStart = b[4] + 0.16;
      const dropProg = smoothstep((time - dropStart) / Math.min(1.65, b5Dur * 0.44));
      const catapultP = smoothstep((time - (b[4] + 0.24)) / 0.42) * (1 - w56);
      const gelatinU = clamp((time - (b[4] + 0.24)) / Math.max(1.8, b5Dur * 0.75), 0, 1);
      const gelatinWave = CD ? CD.impactBounce(gelatinU, 4.0) * (1 - w56) : 0;

      const chalkImpactT = b[4] + Math.min(1.22, b5Dur * 0.31);
      const chalkKnock = smoothstep((time - chalkImpactT) / 0.28);
      const chalkProg = smoothstep((time - (chalkImpactT + 0.04)) / 0.58);
      const chalkSettle = smoothstep((rawTime - (b[5] - 0.10)) / 1.15);

      const crashImpulse = (
        smoothstep((rawTime - (b[4] + 0.16)) / 0.18) * (1 - smoothstep((rawTime - (b[4] + 1.05)) / 0.45)) +
        smoothstep((rawTime - chalkImpactT) / 0.16) * (1 - smoothstep((rawTime - (chalkImpactT + 0.95)) / 0.45))
      );
      const tipUpW = smoothstep((time - (b[4] + 0.40)) / 0.42);
      const strainW = w12 * (1 - smoothstep((time - (b[4] + 0.30)) / 0.28));

      // 1. Placa "ACADEMIA DO BAIRRO · TREINO PESADO ·" oculta em B1 fisheye, 100% visivel e livre em B2..B6!
      this.signBoard.visible = w12 > 0.12;

      // 2. Personagens: Posicoes horizontais & rotacao Y (Y vertical compensado pelo CartoonDistort3D!)
      let voceX = lerp(-0.34, -0.22, w12);
      voceX = lerp(voceX, -0.22, w23);
      voceX = lerp(voceX, -0.20, w34);
      voceX = lerp(voceX, -0.44 + gelatinWave * 0.08, catapultP);
      voceX = lerp(voceX, -0.22, w56);

      let voceZ = lerp(0.56, 0.22, w12);
      voceZ = lerp(voceZ, 0.26, w23);
      voceZ = lerp(voceZ, 0.24, w34);
      voceZ = lerp(voceZ, 0.32, catapultP);
      voceZ = lerp(voceZ, 0.72, w56);

      let voceRotY = lerp(0.02, 0.14, w12);
      voceRotY = lerp(voceRotY, 0.08, w23);
      voceRotY = lerp(voceRotY, 0.24, w34);
      voceRotY = lerp(voceRotY, -0.24 + gelatinWave * 0.20, catapultP);
      voceRotY = lerp(voceRotY, 0.08, w56);

      let camPosX = lerp(0.56, 0.68, w12);
      camPosX = lerp(camPosX, 0.72, w23);
      camPosX = lerp(camPosX, 0.76, w34);
      camPosX = lerp(camPosX, 0.78, w45);
      camPosX = lerp(camPosX, 0.58, w56);

      let camPosZ = lerp(-0.10, 0.04, w12);
      camPosZ = lerp(camPosZ, 0.06, w23);
      camPosZ = lerp(camPosZ, 0.06, w34);
      camPosZ = lerp(camPosZ, 0.14, w45);
      camPosZ = lerp(camPosZ, -0.18, w56);

      let camRotY = lerp(-0.46, -0.62, w12);
      camRotY = lerp(camRotY, -0.68, w23);
      camRotY = lerp(camRotY, -0.76, w34);
      camRotY = lerp(camRotY, -0.46, w45);
      camRotY = lerp(camRotY, -0.24, w56);

      this.voce.group.position.set(voceX, VOCE_GROUND_Y, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voceShadow.position.set(voceX, 0.018, voceZ + 0.02);

      this.camila.group.position.set(camPosX, CAMILA_GROUND_Y, camPosZ);
      this.camila.group.rotation.y = camRotY;
      this.camilaShadow.position.set(camPosX, 0.018, camPosZ + 0.02);

      // 3. Camera Multi-Angulo Cartoon + Fisheye Meme (FOV 76..82° em B1, B4 e B6, placa 100% livre em B2..B6!)
      const breathCam = Math.sin(rawTime * 1.6) * 0.010;
      const hitTremorX = inHitstop > 0 ? Math.sin(rawTime * 90.0) * 0.026 : 0;
      const hitTremorY = inHitstop > 0 ? Math.cos(rawTime * 82.0) * 0.020 : 0;
      const crashShakeX = Math.sin(rawTime * 32.0) * 0.044 * crashImpulse + hitTremorX;
      const crashShakeY = Math.cos(rawTime * 27.0) * 0.032 * crashImpulse + hitTremorY;

      // B1a: Fisheye extremo FOV 82° colado no rosto da Camila gritando!
      let camX = 0.26 + Math.sin(rawTime * 4.2) * 0.016;
      let camY = 1.24 + Math.cos(rawTime * 3.8) * 0.010;
      let camZ = 0.64;
      let lookX = 0.54;
      let lookY = 1.20;
      let lookZ = -0.10;
      let fov = CD ? CD.fisheyePulse(46, 82, smoothstep(rawTime / 0.28)) : 82;

      // B1b: Chicote fisheye FOV 82° CENTRALIZADO no rosto gigante em panico do Voce (ambos olhos + boca livres acima da legenda!)
      camX = lerp(camX, -0.34 + Math.sin(rawTime * 10.0) * 0.010, wB1b);
      camY = lerp(camY, 1.18 + Math.cos(rawTime * 8.0) * 0.008, wB1b);
      camZ = lerp(camZ, 1.46, wB1b);
      lookX = lerp(lookX, -0.34, wB1b);
      lookY = lerp(lookY, 1.13, wB1b);
      lookZ = lerp(lookZ, 0.56, wB1b);
      fov = lerp(fov, 82.0, wB1b);

      // B2: Whip-dolly out revelando academia + placa alta + Voce sanfona segurando barra em U!
      camX = lerp(camX, 0.06, w12);
      camY = lerp(camY, 1.44 + breathCam, w12);
      camZ = lerp(camZ, 4.95, w12);
      lookX = lerp(lookX, 0.04, w12);
      lookY = lerp(lookY, 1.18, w12);
      lookZ = lerp(lookZ, -0.45, w12);
      fov = lerp(fov, 48.0, w12);

      // B3: Push-in no ego maromba + joelhos gelatina + haltere dourado pulando no rack!
      camX = lerp(camX, -0.06, w23);
      camY = lerp(camY, 1.38 + breathCam, w23);
      camZ = lerp(camZ, 4.55, w23);
      lookX = lerp(lookX, 0.02, w23);
      lookY = lerp(lookY, 1.18, w23);
      lookZ = lerp(lookZ, -0.24, w23);
      fov = lerp(fov, 48.0, w23);

      // B4: Crash-zoom FISHEYE FOV 76° na trava vermelha soltando + cabeca gigante da Camila (placa 100% livre acima!)
      camX = lerp(camX, 0.24, w34);
      camY = lerp(camY, 1.24 + breathCam, w34);
      camZ = lerp(camZ, 2.90, w34);
      lookX = lerp(lookX, 0.20, w34);
      lookY = lerp(lookY, 1.18, w34);
      lookZ = lerp(lookZ, -0.18, w34);
      fov = lerp(fov, CD ? CD.fisheyePulse(48.0, 76.0, w34) : 76.0, w34);

      // B5: Plano aberto de caos com shake: Voce catapultado, 3 anilhas livres, explosao de giz e Camila inteira!
      camX = lerp(camX, 0.08 + crashShakeX, w45);
      camY = lerp(camY, 1.38 + breathCam + crashShakeY, w45);
      camZ = lerp(camZ, 4.92, w45);
      lookX = lerp(lookX, 0.08, w45);
      lookY = lerp(lookY, 1.16, w45);
      lookZ = lerp(lookZ, -0.06, w45);
      fov = lerp(fov, 49.0, w45);

      // B6: FISHEYE ROAST FOV 80° na cara gigante do Voce segurando barra torta + Camila gargalhando + placa 100% livre!
      camX = lerp(camX, -0.04, w56);
      camY = lerp(camY, 1.22 + breathCam, w56);
      camZ = lerp(camZ, 2.26, w56);
      lookX = lerp(lookX, -0.02, w56);
      lookY = lerp(lookY, 1.18, w56);
      lookZ = lerp(lookZ, 0.16, w56);
      fov = lerp(fov, CD ? CD.fisheyePulse(49.0, 80.0, w56) : 80.0, w56);

      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // 4. Voce: Expressoes, Lip-Sync, Agachamento Sanfona, Ego Maromba, Gelatina B5 e Fisheye Roast B6!
      let voceEmotion = 'shocked';
      if (rawTime < b[1]) voceEmotion = 'shocked';
      else if (rawTime >= b[1] && rawTime < b[2]) voceEmotion = 'determined';
      else if (rawTime >= b[2] && rawTime < b[3]) voceEmotion = (rawTime < b[2] + 1.25) ? 'smirk' : 'determined';
      else if (rawTime >= b[3] && rawTime < b[5]) voceEmotion = 'shocked';
      else if (rawTime >= b[5]) voceEmotion = (rawTime < b[5] + 2.6) ? 'smirk' : 'happy';

      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');

      const voceLookYaw = (b1bPop > 0.3 || w56 > 0.45)
        ? 0.0
        : (0.28 * b4W + Math.sin(time * 2.0) * 0.05 * w12 * (1 - w56));
      const voceLookPitch = (b1bPop > 0.3 || w56 > 0.45)
        ? 0.0
        : lerp(0.02, -0.16, clamp(slipWarning * 0.8 + catapultP * 0.5, 0, 1)) * w12;
      this.voce.setLook(voceLookYaw, voceLookPitch);
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : (rawTime >= b[1] && rawTime < b[2] ? 0.18 : 0.05));
      this.voce.update(1 / 60, time);

      // Agachamento profundo com joelhos gelatina (B2 sanfona -> B3 ego + joelhos tremendo loucamente!)
      const squatDepth = b2AccordionW * 0.72 + b3JellyW * 0.56 + b4W * 0.40;
      const kneeJellyAmp = b2AccordionW * 0.18 + b3JellyW * 0.30 + b4W * 0.14;
      if (CD && squatDepth > 0.01) {
        CD.deepSquatLegs(this.voce, squatDepth, kneeJellyAmp, time);
      }

      // Peito estufado em B3 (ego maromba 1.22x!) + tronco catapultado em gelatina em B5!
      if (this.voce.spine) {
        const egoChest = 1.0 + 0.22 * b3PuffW;
        this.voce.spine.scale.set(egoChest, 1.0 + 0.06 * b3PuffW, egoChest);
        this.voce.spine.rotation.x += (0.08 * b2AccordionW - 0.14 * b3PuffW + 0.10 * catapultP);
        this.voce.spine.rotation.z += (0.34 * gelatinWave + Math.sin(time * 22.0) * 0.04 * b3JellyW);
      }

      // Bracos do Voce posicionados a frente do peito/ombros para segurar a barra 100% conectada as maos em B2..B6!
      const voceHoldW = clamp(w12, 0, 1);
      const heaveWave = Math.sin(time * 3.8) * 0.07 * strainW;
      const shakeArm = Math.sin(time * 24.0) * 0.026 * strainW;

      // Interpola angulos ideais de pegada para cada batida (B2 agachado alto, B3/B4 frente do peito, B5/B6 empinado pra direita!)
      let shL = -1.04;
      let shR = -1.04;
      let elbL = -1.06;
      let elbR = -1.06;

      // B3: rosca direta estufando peito
      shL = lerp(shL, -0.78 - heaveWave + shakeArm, w23);
      shR = lerp(shR, -0.78 - heaveWave - shakeArm, w23);
      elbL = lerp(elbL, -1.06 - heaveWave * 0.4, w23);
      elbR = lerp(elbR, -1.06 - heaveWave * 0.4, w23);

      // B4: inclinacao leve pra direita quando a trava comeca a soltar
      shL = lerp(shL, -0.80 + shakeArm, w34);
      shR = lerp(shR, -0.58 - shakeArm, w34);
      elbL = lerp(elbL, -1.04, w34);
      elbR = lerp(elbR, -0.96, w34);

      // B5: lado direito empina forte PRA CIMA enquanto lado esquerdo desce com o peso!
      shL = lerp(shL, -0.46, tipUpW);
      shR = lerp(shR, -1.42, tipUpW);
      elbL = lerp(elbL, -0.90, tipUpW);
      elbR = lerp(elbR, -0.46, tipUpW);

      // B6: Voce segura orgulhoso a barra torta vazia ACIMA da legenda no fisheye!
      shL = lerp(shL, -0.94, w56);
      shR = lerp(shR, -1.36, w56);
      elbL = lerp(elbL, -0.96, w56);
      elbR = lerp(elbR, -0.56, w56);

      if (voceHoldW > 0.005 && this.voce.shoulderL && this.voce.shoulderR) {
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, shL, voceHoldW);
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, shR, voceHoldW);
        this.voce.shoulderL.root.rotation.z = lerp(this.voce.shoulderL.root.rotation.z, 0.14, voceHoldW);
        this.voce.shoulderR.root.rotation.z = lerp(this.voce.shoulderR.root.rotation.z, -0.14 - tipUpW * 0.10, voceHoldW);
        this.voce.shoulderL.elbow.rotation.x = lerp(this.voce.shoulderL.elbow.rotation.x, elbL, voceHoldW);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, elbR, voceHoldW);
      }

      // Distorcao Cartoon no Voce via CartoonDistort3D (pes SEMPRE cravados em worldY = 0.00!)
      if (CD) {
        const voceSy =
          1.0
          + 0.04 * b1bPop
          - 0.28 * b2AccordionW + Math.sin(time * 22.0) * 0.035 * b2AccordionW
          + 0.12 * b3PuffW * (1 - b3JellyW * 0.6) + Math.sin(time * 24.0) * 0.05 * b3JellyW
          - 0.26 * gelatinWave
          - 0.06 * w56;
        const voceBoost = 1.0 + 0.14 * b2AccordionW + 0.12 * b3PuffW + 0.06 * Math.abs(gelatinWave);
        const voceLeanZ = clamp(
          Math.sin(time * 18.0) * 0.06 * b2AccordionW + 0.18 * gelatinWave,
          -0.22,
          0.22
        );
        const voceLeanX = clamp(0.04 * b2AccordionW + 0.05 * w56, -0.14, 0.14);
        CD.footAnchoredSquash(this.voce.group, VOCE_GROUND_Y, voceSy, voceBoost, voceLeanZ, voceLeanX, 0);

        const voceHeadScale =
          1.0
          + 0.48 * b1bPop
          + 0.26 * b2AccordionW
          + 0.16 * b3PuffW
          + 0.26 * b4W
          + 0.40 * catapultP
          + 0.44 * w56;
        const voceHeadStretchY = 1.0 + 0.06 * b1bPop - 0.08 * b2AccordionW + 0.14 * gelatinWave + 0.05 * w56;
        const voceHeadTilt = Math.sin(time * 20.0) * 0.08 * b2AccordionW + 0.18 * gelatinWave + (-0.06 + Math.sin(rawTime * 3.4) * 0.05) * w56;
        const voceHeadJitter = 0.07 * b1bPop + 0.06 * b2AccordionW + 0.05 * b3JellyW + 0.07 * b4W + 0.08 * catapultP;
        CD.headPop(this.voce.headGroup, voceHeadScale, voceHeadStretchY, voceHeadTilt, voceHeadJitter, rawTime);

        const armStretchL = 1.0 + 0.04 * b2AccordionW + 0.18 * b3JellyW + 0.12 * catapultP;
        const armStretchR = 1.0 + 0.04 * b2AccordionW + 0.18 * b3JellyW + 0.22 * catapultP;
        const armWob = 0.06 * b2AccordionW + 0.14 * b3JellyW + 0.18 * Math.abs(gelatinWave);
        CD.armRubberStretch(this.voce.shoulderL, this.voce.shoulderL.elbow, armStretchL, armWob, rawTime);
        CD.armRubberStretch(this.voce.shoulderR, this.voce.shoulderR.elbow, armStretchR, -armWob, rawTime);
      }

      // 5. Camila: B1a gritando no fisheye -> B2/B3 dando bronca -> B4 cabeca gigante em horror apontando -> B5 choque -> B6 gargalhada squash-bounce!
      let camilaEmotion = 'alert';
      if (rawTime < b[2]) camilaEmotion = 'alert';
      else if (rawTime >= b[2] && rawTime < b[3]) camilaEmotion = 'happy';
      else if (rawTime >= b[3] && rawTime < b[5]) camilaEmotion = 'scared';
      else if (rawTime >= b[5]) camilaEmotion = 'happy';

      this.camila.setEmotion(camilaEmotion);
      const camilaCoachW = w12 * (1 - w34);
      const camilaHorrorW = b4W;
      const camilaShock5 = w45 * (1 - w56);

      const camilaLookYaw = w56 > 0.4
        ? Math.sin(rawTime * 5.6) * 0.18
        : (w12 < 0.3 ? 0.0 : -0.24 * (camilaCoachW + camilaHorrorW));
      const camilaLookPitch = lerp(0.04, -0.18, camilaHorrorW) * (1 - w56);
      this.camila.setLook(camilaLookYaw, camilaLookPitch);
      this.camila.setMouthOpen(
        dlg.speaker === 'camila'
          ? dlg.lip
          : (w56 > 0.25 ? (0.18 + Math.abs(Math.sin(rawTime * 11.0)) * 0.28) * w56 : (camilaShock5 > 0.3 ? 0.45 : 0.05))
      );
      this.camila.update(1 / 60, time);

      if (this.camila.shoulderL && this.camila.shoulderR) {
        const b1aW = (1 - wB1b);
        if (b1aW > 0.005) {
          const yellWave = Math.sin(rawTime * 14.0) * 0.22;
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -1.15 + yellWave, b1aW);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -1.05 - yellWave, b1aW);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.75, b1aW);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -0.82, b1aW);
        }
        if (camilaCoachW > 0.005) {
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -0.88 + Math.sin(time * 6.0) * 0.14, camilaCoachW);
          this.camila.shoulderL.root.rotation.z = lerp(this.camila.shoulderL.root.rotation.z, 0.26, camilaCoachW);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.42, camilaCoachW);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.45, camilaCoachW);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -1.10, camilaCoachW);
        }
        if (camilaHorrorW > 0.005) {
          const pointUrgent = Math.sin(rawTime * 13.0) * 0.12;
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -1.20 + pointUrgent, camilaHorrorW);
          this.camila.shoulderL.root.rotation.z = lerp(this.camila.shoulderL.root.rotation.z, 0.36, camilaHorrorW);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.16, camilaHorrorW);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -1.35 + Math.cos(rawTime * 12.0) * 0.08, camilaHorrorW);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -1.15, camilaHorrorW);
        }
        if (camilaShock5 > 0.005) {
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -1.82 + Math.sin(rawTime * 14.0) * 0.10, camilaShock5);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -1.78 + Math.cos(rawTime * 14.0) * 0.10, camilaShock5);
          this.camila.shoulderL.root.rotation.z = lerp(this.camila.shoulderL.root.rotation.z, 0.42, camilaShock5);
          this.camila.shoulderR.root.rotation.z = lerp(this.camila.shoulderR.root.rotation.z, -0.42, camilaShock5);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.48, camilaShock5);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -0.48, camilaShock5);
        }
        if (w56 > 0.005) {
          const shLaugh = Math.abs(Math.sin(rawTime * 5.6)) * 0.20;
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -0.56 - shLaugh, w56);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.56 - shLaugh, w56);
          this.camila.shoulderL.root.rotation.z = lerp(this.camila.shoulderL.root.rotation.z, 0.22 + shLaugh * 0.3, w56);
          this.camila.shoulderR.root.rotation.z = lerp(this.camila.shoulderR.root.rotation.z, -0.22 - shLaugh * 0.3, w56);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -1.12 + shLaugh * 0.5, w56);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -1.12 + shLaugh * 0.5, w56);
        }
      }

      // Distorcao Cartoon na Camila via CartoonDistort3D (pes SEMPRE cravados em worldY = 0.00, coque livre abaixo da placa!)
      if (CD) {
        const b1aW = (1 - wB1b);
        const laughWave = Math.sin(rawTime * 9.2);
        const camSy =
          1.0
          + (0.08 + Math.sin(rawTime * 14.0) * 0.05) * b1aW
          + 0.14 * camilaHorrorW
          + 0.14 * camilaShock5
          + laughWave * 0.15 * w56;
        const camBoost = 1.0 + 0.04 * b1aW - 0.03 * camilaHorrorW - laughWave * 0.05 * w56;
        const camLeanZ = clamp(0.08 * b1aW + 0.06 * camilaHorrorW + Math.sin(rawTime * 4.6) * 0.08 * w56, -0.20, 0.20);
        const camLeanX = clamp(0.06 * b1aW - 0.04 * camilaHorrorW - 0.04 * camilaShock5, -0.14, 0.14);
        CD.footAnchoredSquash(this.camila.group, CAMILA_GROUND_Y, camSy, camBoost, camLeanZ, camLeanX, 0);

        const camHeadScale =
          1.0
          + 0.44 * b1aW
          + 0.10 * camilaCoachW
          + 0.42 * camilaHorrorW
          + 0.36 * camilaShock5
          + (0.22 + Math.abs(laughWave) * 0.10) * w56;
        const camHeadStretch = 1.0 + 0.08 * b1aW + 0.10 * camilaHorrorW + 0.08 * camilaShock5;
        const camHeadTilt = 0.10 * b1aW - 0.10 * camilaHorrorW + Math.sin(rawTime * 4.6) * 0.14 * w56;
        const camHeadJitter = 0.06 * b1aW + 0.08 * camilaHorrorW + 0.07 * camilaShock5;
        CD.headPop(this.camila.headGroup, camHeadScale, camHeadStretch, camHeadTilt, camHeadJitter, rawTime);

        const camArmLen = 1.0 + 0.24 * camilaHorrorW + 0.24 * camilaShock5;
        const camArmWob = 0.10 * camilaHorrorW + 0.14 * camilaShock5;
        CD.armRubberStretch(this.camila.shoulderL, this.camila.shoulderL.elbow, camArmLen, camArmWob, rawTime);
        CD.armRubberStretch(this.camila.shoulderR, this.camila.shoulderR.elbow, camArmLen, -camArmWob, rawTime);
      }

      // 6. Background Visual Easter Egg em B3: Haltere dourado no rack tremendo & pulando com os joelhos do Voce!
      if (this.easterDumbbell) {
        const quakeW = clamp(b2AccordionW * 0.5 + b3JellyW * 1.0 + b4W * 0.4, 0, 1);
        const hop = Math.abs(Math.sin(rawTime * 19.0)) * 0.14 * quakeW;
        this.easterDumbbell.position.set(
          this.easterDumbbellBaseX + Math.sin(rawTime * 34.0) * 0.032 * quakeW,
          this.easterDumbbellBaseY + hop,
          0.02 + Math.cos(rawTime * 28.0) * 0.024 * quakeW
        );
        this.easterDumbbell.rotation.set(
          Math.sin(rawTime * 26.0) * 0.28 * quakeW,
          0,
          Math.cos(rawTime * 22.0) * 0.34 * quakeW
        );
      }

      // 7. Pote/Suporte de Giz esmagado pela anilha vermelha de 20kg em B5!
      if (this.chalkStand) {
        const standWobble = Math.sin(rawTime * 16.0) * 0.06 * chalkKnock * (1 - w56);
        this.chalkStand.position.set(
          CHALK_STAND_BASE_X + 0.16 * chalkKnock,
          0.0,
          CHALK_STAND_BASE_Z + 0.08 * chalkKnock
        );
        this.chalkStand.rotation.set(
          0.26 * chalkKnock,
          0.0,
          -0.78 * chalkKnock + standWobble
        );
        if (this.chalkMound) {
          this.chalkMound.scale.set(1.0, lerp(0.54, 0.12, chalkKnock), 1.0);
        }
      }

      // 8. BarraOlimpica3D -- 100% CONECTADA as duas maos reais do Voce via getWorldPosition() (y <= 0.815)!
      this.voce.group.updateMatrixWorld(true);
      this.voce.shoulderL.hand.getWorldPosition(this._handLWorld);
      this.voce.shoulderR.hand.getWorldPosition(this._handRWorld);

      const barX = (this._handLWorld.x + this._handRWorld.x) * 0.5;
      const barY = clamp((this._handLWorld.y + this._handRWorld.y) * 0.5, 0.38, 0.815);
      const barZ = (this._handLWorld.z + this._handRWorld.z) * 0.5 + 0.03;

      const handSpan = Math.max(0.18, Math.hypot(this._handRWorld.x - this._handLWorld.x, this._handRWorld.z - this._handLWorld.z));
      const handTiltZ = clamp(Math.atan2(this._handRWorld.y - this._handLWorld.y, handSpan), -0.42, 0.42);
      const barRotZ = handTiltZ + Math.sin(time * 8.0) * 0.03 * strainW;

      // Em B2/B3 bendAmp = 2.45 (curva num literal U cartoon sob 60kg!)
      const cartoonU = lerp(2.45, 2.05, w23) * (1 - dropProg * 0.72);

      this.barra.group.visible = w12 > 0.14;
      this.barra.update(time, {
        pos: { x: barX, y: barY, z: barZ },
        rotY: voceRotY,
        rotZ: barRotZ,
        bendAmp: cartoonU,
        strainAmp: clamp(strainW, 0, 1),
        slipWarning,
        dropProg,
        chalkProg,
        chalkSettle,
        chalkOrigin: {
          x: CHALK_STAND_BASE_X + 0.08,
          y: 0.72,
          z: CHALK_STAND_BASE_Z + 0.10
        }
      });

      // 9. Fonte de 22 gotinhas de suor cartoon (B1b panico + B2/B3/B4 esforco!)
      const sweatPower = clamp(b1bPop * 0.9 + b2AccordionW * 0.95 + b3JellyW * 1.15 + b4W * 0.85, 0, 1);
      const showSweat = sweatPower > 0.12;
      for (let i = 0; i < this.sweatDrops.length; i++) {
        const sd = this.sweatDrops[i];
        sd.mesh.visible = showSweat;
        if (showSweat) {
          const cyc = (rawTime * 2.3 + sd.seed) % 1;
          sd.mesh.position.set(
            voceX + sd.side * (0.14 + cyc * 0.44),
            1.14 + Math.sin(cyc * Math.PI) * sd.arc - cyc * 0.38,
            voceZ + 0.12 + Math.cos(sd.seed * 7) * cyc * 0.18
          );
          sd.mesh.scale.setScalar((0.60 + (1 - cyc) * 0.88) * sweatPower);
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep06BarraAcademia3D = Ep06BarraAcademia3D;
})(typeof window !== 'undefined' ? window : globalThis);
