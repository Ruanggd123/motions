/**
 * Ep07LinguicaChurrasco3D.js -- Ep 07 v3 (Cartoon Distortion & Viral Meme Overhaul): "A Linguica do Churrasco!"
 * Motor compartilhado: window.CartoonDistort3D (foot-anchored squash & stretch, big-head pop,
 * rubber arm stretch, meme fisheye FOV 76-84 deg, hitstop micro-freeze, elastic bounce!).
 *
 * Arco visual 6-beat 100% renovado:
 * - B1 (0.0s IN MEDIA RES): Fisheye extremo FOV 84 deg colado no rosto suando do Voce (14 gotas de suor,
 *   cabecao 1.46x, tremor comico + luz quente de fogo pulsando; placa 100% oculta!).
 * - B2 (WHIP-DOLLY REVEAL): Revela Area Gourmet ensolarada, placa 100% livre, chamas 3D animadas na
 *   churrasqueira e Camila segurando uma LINGUICA ARTESANAL GIGANTE CURVA DE 1.3m balancando feito borracha!
 * - B3 (MESTRE DO CHURRASCO + EASTER EGG): Voce estufa o peito orgulhoso (sxzBoost 1.24, cabeca empinada)
 *   enquanto a linguica gigante JA ESCORREGA pra ponta atras dele + EASTER EGG: tampa do cooler azul
 *   abre com um PATO AMARELO DE OCULOS ESCUROS espiando o desastre!
 * - B4 (FISHEYE SUSPENSE): Camera empurra em fisheye FOV 76 deg pra ponta do espeto (placa 100% livre!)
 *   enquanto Camila estica pro alto (sy 1.28 + cabecao 1.48x + braco rubber-hose) apontando desesperada!
 * - B5 (HITSTOP + FLY-BY NA LENTE + COGUMELO NUCLEAR DE FAROFA): Micro-hitstop -> linguica gigante
 *   DECOLA E PASSA COLADA NA LENTE DA CAMERA (b5a!) -> ricocheteia na tigela vermelha jogando-a
 *   GIRANDO PRO ALTO no meio de um COGUMELO DOURADO GIGANTE DE FAROFA (b5b!) enquanto Voce congela
 *   esmagado (sy 0.68) segurando o espeto vazio!
 * - B6 (FISHEYE ROAST + COMMENT BAIT): Camila pula rindo de squash-bounce atras enquanto Voce enfia o
 *   rosto gigante sorrindo em FOV 80 deg fisheye segurando o espeto vazio + pato de oculos rindo no cooler!
 *
 * Regras fisicas garantidas (audit_ep06_ep07.cjs):
 * - ZERO Pacoca!
 * - Pes 100% aterrados no piso via CartoonDistort3D.footAnchoredSquash (floorY = 0, erro < 0.015m).
 * - Espeto segurado SEMPRE em y <= 0.78 (zero oclusao facial!).
 * - Placa "CANTINHO DO CHURRASCO · DOMINGO NO QUINTAL ·" oculta em B1 e 100% livre abaixo de .word-pop em B2..B6!
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
  // Tigela vermelha de farofa (impacto) e Tabua de corte (pouso empanado em B6)
  const BOWL_IMPACT = { x: -0.95, y: 0.94, z: -0.88 };
  const BOARD_LANDING = { x: -0.72, y: 0.93, z: -0.86 };

  class Ep07LinguicaChurrasco3D {
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
      this.scene.background = new T.Color(0x7dd3fc);
      this.scene.fog = new T.FogExp2(0xfffbeb, 0.009);

      this.camera = new T.PerspectiveCamera(45, 1080 / 1920, 0.08, 120);

      this._initLights(T);
      this._buildAreaChurrasco3D(T);
      this._initCharacters3D(T);
      this._buildGrillSmokeAndSweat(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP07_CHURRASCO_TIMELINE ? global.EP07_CHURRASCO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 4.713, 9.02, 14.206, 19.199, 25.009];
    }

    _getDialogueState(time) {
      const tl = this._getTimeline();
      if (!tl || !Array.isArray(tl.dialogues)) return { speaker: null, lip: 0, id: null };
      for (let i = 0; i < tl.dialogues.length; i++) {
        const d = tl.dialogues[i];
        if (time >= d.start && time <= d.end && Array.isArray(d.lip_sync) && d.lip_sync.length > 0) {
          const idx = clamp(Math.floor((time - d.start) * 60), 0, d.lip_sync.length - 1);
          return { speaker: d.speaker, lip: d.lip_sync[idx] || 0, id: d.id };
        }
      }
      return { speaker: null, lip: 0, id: null };
    }

    _initLights(T) {
      this.scene.add(new T.AmbientLight(0xfffbeb, 0.96));
      const hemi = new T.HemisphereLight(0xbae6fd, 0xd6a77a, 0.82);
      hemi.position.set(0, 12, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff3d6, 2.08);
      sun.position.set(4.4, 9.2, 6.0);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -5.5; sun.shadow.camera.right = 5.5;
      sun.shadow.camera.top = 5.5; sun.shadow.camera.bottom = -5.5;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      // Luz quente alaranjada das chamas & brasa da churrasqueira!
      this.emberLight = new T.PointLight(0xf97316, 1.9, 5.5);
      this.emberLight.position.set(0.45, 1.28, -2.18);
      this.scene.add(this.emberLight);

      // Luz de fogo pulsante refletindo no rosto suando do Voce durante o fisheye de B1!
      this.b1FireLight = new T.PointLight(0xff6b12, 0.0, 3.8);
      this.b1FireLight.position.set(-0.08, 0.98, 1.24);
      this.scene.add(this.b1FireLight);
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 176;
      const g = c.getContext('2d');
      g.fillStyle = '#451a03';
      g.fillRect(0, 0, 640, 176);
      g.strokeStyle = '#fbbf24';
      g.lineWidth = 12;
      g.strokeRect(8, 8, 624, 160);
      g.fillStyle = '#fef08a';
      g.font = '900 42px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 320, 76);
      g.fillStyle = '#fb923c';
      g.font = '900 36px "Segoe UI", sans-serif';
      g.fillText(subtitle, 320, 134);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _makeUmbrellaTexture(T) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 128;
      const g = c.getContext('2d');
      const stripes = 8;
      const sw = c.width / stripes;
      for (let i = 0; i < stripes; i++) {
        g.fillStyle = i % 2 === 0 ? '#16a34a' : '#f8fafc';
        g.fillRect(i * sw, 0, sw + 1, c.height);
      }
      g.fillStyle = '#15803d';
      g.fillRect(0, c.height - 14, c.width, 14);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildAreaChurrasco3D(T) {
      // 1. Piso de ceramica terracota ensolarada da Area Gourmet (y = 0.00) + grama ao fundo
      const patio = new T.Mesh(
        new T.PlaneGeometry(26, 26),
        new T.MeshStandardMaterial({ color: 0xd99b66, roughness: 0.78, metalness: 0.03 })
      );
      patio.rotation.x = -Math.PI / 2;
      patio.receiveShadow = true;
      this.scene.add(patio);

      const tileGrid = new T.GridHelper(18, 26, 0xb47341, 0xc98a57);
      tileGrid.position.y = 0.002;
      this.scene.add(tileGrid);

      // Faixa de grama verde viva atras do murinho de quintal
      const grass = new T.Mesh(
        new T.PlaneGeometry(24, 8),
        new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.92 })
      );
      grass.rotation.x = -Math.PI / 2;
      grass.position.set(0, 0.004, -6.5);
      this.scene.add(grass);

      // 2. Muro creme de quintal + pergolado de madeira rustica ensolarado
      const wallCream = new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.86 });
      const woodBeam = new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.70 });
      const brickMat = new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.84 });
      const brickDark = new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.88 });
      const steelDark = new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.48, metalness: 0.55 });
      const chromeMat = new T.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.24, metalness: 0.82 });

      const backWall = new T.Mesh(new T.BoxGeometry(9.0, 2.35, 0.20), wallCream);
      backWall.position.set(0, 1.18, -3.55);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const wallCap = new T.Mesh(new T.BoxGeometry(9.1, 0.12, 0.28), brickMat);
      wallCap.position.set(0, 2.38, -3.55);
      this.scene.add(wallCap);

      // Colunas e viga do pergolado de madeira da area gourmet (a frente da chamine para a placa ficar 100% legivel!)
      [-2.15, 2.15].forEach((px) => {
        const post = new T.Mesh(new T.BoxGeometry(0.18, 3.1, 0.18), woodBeam);
        post.position.set(px, 1.55, -1.86);
        post.castShadow = true;
        this.scene.add(post);
      });
      const mainBeam = new T.Mesh(new T.BoxGeometry(4.7, 0.18, 0.20), woodBeam);
      mainBeam.position.set(0, 3.00, -1.86);
      this.scene.add(mainBeam);

      // Placa "CANTINHO DO CHURRASCO · DOMINGO NO QUINTAL ·" 100% livre em z = -1.80 e oculta em B1!
      const signTex = this._makeSignTexture(T, 'CANTINHO DO CHURRASCO', '· DOMINGO NO QUINTAL ·');
      this.signBoard = new T.Mesh(
        new T.BoxGeometry(2.14, 0.50, 0.06),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.50 })
      );
      this.signBoard.position.set(0.0, 2.62, -1.80);
      this.scene.add(this.signBoard);

      // 3. Churrasqueira de Tijolinho Vermelho 3D com CHAMAS 3D ANIMADAS + grelha pequena!
      this._buildBrickChurrasqueira(T, brickMat, brickDark, steelDark, chromeMat);

      // 4. Mesa Rustica + Tigela Vermelha de Farofa (voa girando em B5!) + Cooler Azul com EASTER EGG!
      this._buildPicnicTableAndCooler(T, woodBeam, chromeMat);

      // 5. Guarda-sol listrado verde/branco ao fundo esquerdo
      this._buildUmbrella(T);

      // 6. Sombras de contato no piso y = 0.015
      const shMat = new T.MeshBasicMaterial({ color: 0x451a03, transparent: true, opacity: 0.28, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.015, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.28, -0.44, 0.66);
      this.camilaShadow = makeShadow(0.26, 0.64, -0.18);
    }

    _buildBrickChurrasqueira(T, brickMat, brickDark, steelDark, chromeMat) {
      const bbq = new T.Group();
      bbq.position.set(0.45, 0.0, -2.76);
      bbq.rotation.y = -0.22;

      const baseL = new T.Mesh(new T.BoxGeometry(0.34, 0.86, 0.92), brickMat);
      baseL.position.set(-0.56, 0.43, 0);
      baseL.castShadow = true;
      bbq.add(baseL);

      const baseR = new T.Mesh(new T.BoxGeometry(0.34, 0.86, 0.92), brickMat);
      baseR.position.set(0.56, 0.43, 0);
      baseR.castShadow = true;
      bbq.add(baseR);

      const baseBack = new T.Mesh(new T.BoxGeometry(1.46, 0.86, 0.22), brickDark);
      baseBack.position.set(0, 0.43, -0.35);
      bbq.add(baseBack);

      const counter = new T.Mesh(
        new T.BoxGeometry(1.58, 0.09, 1.04),
        new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.22 })
      );
      counter.position.set(0, 0.90, 0.02);
      counter.castShadow = true;
      bbq.add(counter);

      const sideL = new T.Mesh(new T.BoxGeometry(0.22, 0.95, 0.86), brickMat);
      sideL.position.set(-0.62, 1.42, -0.02);
      sideL.castShadow = true;
      bbq.add(sideL);

      const sideR = new T.Mesh(new T.BoxGeometry(0.22, 0.95, 0.86), brickMat);
      sideR.position.set(0.62, 1.42, -0.02);
      sideR.castShadow = true;
      bbq.add(sideR);

      const fireBack = new T.Mesh(new T.BoxGeometry(1.06, 0.95, 0.20), new T.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 }));
      fireBack.position.set(0, 1.42, -0.36);
      bbq.add(fireBack);

      const hood = new T.Mesh(new T.CylinderGeometry(0.36, 0.95, 0.95, 4), brickMat);
      hood.rotation.y = Math.PI / 4;
      hood.position.set(0, 2.34, -0.04);
      hood.castShadow = true;
      bbq.add(hood);

      const chimney = new T.Mesh(new T.BoxGeometry(0.52, 0.85, 0.52), brickDark);
      chimney.position.set(0, 3.15, -0.04);
      bbq.add(chimney);

      // Cama de carvao e BRASA LARANJA BRILHANTE!
      const coalBed = new T.Mesh(
        new T.BoxGeometry(0.96, 0.10, 0.64),
        new T.MeshStandardMaterial({ color: 0x0c0a09, roughness: 0.95 })
      );
      coalBed.position.set(0, 0.98, 0.04);
      bbq.add(coalBed);

      this.emberMeshes = [];
      this.emberMat = new T.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xea580c,
        emissiveIntensity: 1.65,
        roughness: 0.36
      });
      for (let i = 0; i < 12; i++) {
        const em = new T.Mesh(new T.DodecahedronGeometry(0.068, 0), this.emberMat);
        em.position.set(-0.34 + (i % 4) * 0.22, 1.04, -0.14 + Math.floor(i / 4) * 0.18);
        bbq.add(em);
        this.emberMeshes.push(em);
      }

      // CHAMAS 3D ANIMADAS EM CAMADAS (Laranja-Fogo, Ambar e Nucleo Amarelo-Ouro Brilhante!)
      this.flameTongues = [];
      const flameOuterMat = new T.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.88 });
      const flameMidMat = new T.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.92 });
      const flameCoreMat = new T.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.96 });

      const flameSpecs = [
        { x: -0.34, z: 0.06, r: 0.115, h: 0.38, mat: flameOuterMat, speed: 9.2, phase: 0.1 },
        { x: -0.18, z: -0.04, r: 0.135, h: 0.47, mat: flameOuterMat, speed: 8.4, phase: 1.2 },
        { x: 0.00,  z: 0.08, r: 0.145, h: 0.52, mat: flameOuterMat, speed: 9.8, phase: 2.3 },
        { x: 0.19,  z: -0.02, r: 0.135, h: 0.46, mat: flameOuterMat, speed: 8.9, phase: 3.5 },
        { x: 0.35,  z: 0.06, r: 0.115, h: 0.37, mat: flameOuterMat, speed: 10.1, phase: 4.4 },
        { x: -0.08, z: -0.14, r: 0.125, h: 0.42, mat: flameOuterMat, speed: 7.9, phase: 5.1 },
        { x: -0.26, z: 0.10, r: 0.088, h: 0.34, mat: flameMidMat, speed: 11.2, phase: 0.7 },
        { x: -0.09, z: 0.12, r: 0.098, h: 0.40, mat: flameMidMat, speed: 10.6, phase: 1.9 },
        { x: 0.09,  z: 0.04, r: 0.098, h: 0.41, mat: flameMidMat, speed: 11.5, phase: 2.9 },
        { x: 0.27,  z: 0.10, r: 0.085, h: 0.33, mat: flameMidMat, speed: 12.0, phase: 3.8 },
        { x: 0.02,  z: -0.10, r: 0.090, h: 0.36, mat: flameMidMat, speed: 10.3, phase: 4.9 },
        { x: -0.16, z: 0.09, r: 0.058, h: 0.26, mat: flameCoreMat, speed: 13.4, phase: 0.5 },
        { x: 0.00,  z: 0.11, r: 0.068, h: 0.30, mat: flameCoreMat, speed: 12.8, phase: 2.1 },
        { x: 0.18,  z: 0.08, r: 0.058, h: 0.25, mat: flameCoreMat, speed: 13.9, phase: 3.7 }
      ];

      flameSpecs.forEach((fs) => {
        const holder = new T.Group();
        holder.position.set(fs.x, 1.04, fs.z);
        const cone = new T.Mesh(new T.ConeGeometry(fs.r, fs.h, 7), fs.mat);
        cone.position.y = fs.h * 0.5;
        holder.add(cone);
        bbq.add(holder);
        this.flameTongues.push({ holder, baseH: fs.h, speed: fs.speed, phase: fs.phase });
      });

      this.fireSparks = [];
      const sparkGeo = new T.SphereGeometry(0.017, 6, 5);
      const sparkMat = new T.MeshBasicMaterial({ color: 0xfef08a });
      for (let i = 0; i < 8; i++) {
        const sp = new T.Mesh(sparkGeo, sparkMat);
        bbq.add(sp);
        this.fireSparks.push({
          mesh: sp,
          seed: i * 0.17,
          baseX: -0.32 + (i / 7) * 0.64,
          baseZ: -0.06 + (i % 3) * 0.09
        });
      }

      // Grelha metalica visivelmente estreita/pequena em contraste com a linguica gigante de 1.3m!
      for (let r = -0.38; r <= 0.39; r += 0.11) {
        const bar = new T.Mesh(new T.CylinderGeometry(0.010, 0.010, 0.62, 8), chromeMat);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(r, 1.24, 0.04);
        bbq.add(bar);
      }

      this.scene.add(bbq);
    }

    _buildPicnicTableAndCooler(T, woodBeam, chromeMat) {
      const table = new T.Group();
      table.position.set(-1.02, 0.0, -0.90);
      table.rotation.y = 0.28;

      const woodTopMat = new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.64 });
      const top = new T.Mesh(new T.BoxGeometry(1.18, 0.07, 0.72), woodTopMat);
      top.position.set(0, 0.80, 0);
      top.castShadow = true;
      top.receiveShadow = true;
      table.add(top);

      [[-0.48, -0.26], [0.48, -0.26], [-0.48, 0.26], [0.48, 0.26]].forEach(([lx, lz]) => {
        const leg = new T.Mesh(new T.BoxGeometry(0.08, 0.78, 0.08), woodBeam);
        leg.position.set(lx, 0.39, lz);
        leg.castShadow = true;
        table.add(leg);
      });

      // Tabua de churrasco de madeira clara (exatamente sob BOARD_LANDING!)
      const board = new T.Mesh(
        new T.BoxGeometry(0.46, 0.032, 0.32),
        new T.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.56 })
      );
      board.position.set(0.28, 0.851, 0.12);
      board.receiveShadow = true;
      table.add(board);

      // Tigela vermelha INTERATIVA cheia de FAROFA DOURADA (em B5 VOA GIRANDO PRO ALTO no cogumelo!)
      this.farofaBowlGroup = new T.Group();
      this.farofaBowlGroup.position.set(0.06, 0.836, 0.04);
      table.add(this.farofaBowlGroup);

      const bowl = new T.Mesh(
        new T.CylinderGeometry(0.15, 0.098, 0.10, 18),
        new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32 })
      );
      bowl.position.set(0, 0.050, 0);
      bowl.castShadow = true;
      this.farofaBowlGroup.add(bowl);

      const bowlRim = new T.Mesh(
        new T.TorusGeometry(0.148, 0.011, 8, 22),
        new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.28 })
      );
      bowlRim.rotation.x = Math.PI / 2;
      bowlRim.position.set(0, 0.098, 0);
      this.farofaBowlGroup.add(bowlRim);

      this.farofaPile = new T.Mesh(
        new T.SphereGeometry(0.136, 14, 10),
        new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.86 })
      );
      this.farofaPile.scale.set(1.0, 0.48, 1.0);
      this.farofaPile.position.set(0, 0.092, 0);
      this.farofaBowlGroup.add(this.farofaPile);

      // Farofa dourada derramada sobre a mesa e tabua apos o impacto de B5!
      this.spilledFarofa = new T.Group();
      this.spilledFarofa.position.set(0.16, 0.840, 0.09);
      this.spilledFarofa.visible = false;
      const spillMat = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.90 });
      const spillToastMat = new T.MeshStandardMaterial({ color: 0xd97706, roughness: 0.90 });
      [
        { x: -0.09, z: 0.02, rx: 0.19, rz: 0.14, mat: spillMat },
        { x: 0.10,  z: 0.05, rx: 0.18, rz: 0.13, mat: spillMat },
        { x: 0.02,  z: -0.08, rx: 0.14, rz: 0.10, mat: spillToastMat },
        { x: 0.18,  z: -0.02, rx: 0.12, rz: 0.09, mat: spillMat }
      ].forEach((sp) => {
        const mound = new T.Mesh(new T.SphereGeometry(1.0, 12, 8), sp.mat);
        mound.scale.set(sp.rx, 0.026, sp.rz);
        mound.position.set(sp.x, 0.013, sp.z);
        this.spilledFarofa.add(mound);
      });
      table.add(this.spilledFarofa);

      // Jarra de limonada verde-amarela + faca de churrasco
      const pitcher = new T.Mesh(
        new T.CylinderGeometry(0.075, 0.085, 0.22, 14),
        new T.MeshStandardMaterial({ color: 0xd9f99d, transparent: true, opacity: 0.86, roughness: 0.14 })
      );
      pitcher.position.set(-0.34, 0.94, -0.06);
      table.add(pitcher);

      const knifeBlade = new T.Mesh(new T.BoxGeometry(0.22, 0.008, 0.042), chromeMat);
      knifeBlade.position.set(-0.14, 0.845, 0.20);
      knifeBlade.rotation.y = -0.35;
      table.add(knifeBlade);

      this.scene.add(table);

      // COOLER AZUL TERMICO + EASTER EGG VIRAL: Pato Amarelo de Oculos Escuros pulando da tampa em B3-B6!
      const cooler = new T.Group();
      cooler.position.set(1.30, 0.0, -1.26);
      cooler.rotation.y = -0.52;

      const cBody = new T.Mesh(
        new T.BoxGeometry(0.60, 0.42, 0.38),
        new T.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.34 })
      );
      cBody.position.y = 0.21;
      cBody.castShadow = true;
      cooler.add(cBody);

      // Interior gelado com cubos de gelo brilhantes
      const iceMat = new T.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.15, metalness: 0.10 });
      const iceBed = new T.Mesh(new T.BoxGeometry(0.52, 0.06, 0.32), iceMat);
      iceBed.position.y = 0.40;
      cooler.add(iceBed);

      // Tampa articulada na dobradica traseira (z = -0.19) para abrir com um BOING em B3!
      this.coolerLidPivot = new T.Group();
      this.coolerLidPivot.position.set(0, 0.42, -0.19);
      const cLid = new T.Mesh(
        new T.BoxGeometry(0.63, 0.075, 0.41),
        new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28 })
      );
      cLid.position.set(0, 0.038, 0.19);
      cLid.castShadow = true;
      this.coolerLidPivot.add(cLid);
      cooler.add(this.coolerLidPivot);

      // EASTER EGG: Pato Amarelo Pixar de Oculos Escuros dentro do cooler!
      this.coolerDuckGroup = new T.Group();
      this.coolerDuckGroup.position.set(0.0, 0.26, 0.02);
      const duckYellow = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.30 });
      const duckOrange = new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.38 });
      const shadeBlack = new T.MeshStandardMaterial({ color: 0x09090b, roughness: 0.12, metalness: 0.75 });

      const dBody = new T.Mesh(new T.SphereGeometry(0.11, 14, 12), duckYellow);
      dBody.scale.set(1.15, 0.85, 1.0);
      this.coolerDuckGroup.add(dBody);

      const dHead = new T.Mesh(new T.SphereGeometry(0.085, 14, 12), duckYellow);
      dHead.position.set(0, 0.13, 0.03);
      this.coolerDuckGroup.add(dHead);

      const dBeak = new T.Mesh(new T.ConeGeometry(0.032, 0.075, 8), duckOrange);
      dBeak.rotation.x = Math.PI / 2;
      dBeak.position.set(0, 0.12, 0.12);
      this.coolerDuckGroup.add(dBeak);

      // Oculos escuros estilosos no pato!
      [-0.035, 0.035].forEach((gx) => {
        const lens = new T.Mesh(new T.BoxGeometry(0.052, 0.032, 0.016), shadeBlack);
        lens.position.set(gx, 0.148, 0.105);
        this.coolerDuckGroup.add(lens);
      });
      const bridge = new T.Mesh(new T.BoxGeometry(0.14, 0.010, 0.014), shadeBlack);
      bridge.position.set(0, 0.154, 0.105);
      this.coolerDuckGroup.add(bridge);

      this.coolerDuckGroup.visible = false;
      cooler.add(this.coolerDuckGroup);

      this.scene.add(cooler);
    }

    _buildUmbrella(T) {
      const umb = new T.Group();
      umb.position.set(-1.68, 0.0, -2.55);
      const pole = new T.Mesh(
        new T.CylinderGeometry(0.032, 0.032, 2.55, 10),
        new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.65, roughness: 0.30 })
      );
      pole.position.y = 1.27;
      umb.add(pole);

      const canopy = new T.Mesh(
        new T.ConeGeometry(1.18, 0.44, 16),
        new T.MeshStandardMaterial({ map: this._makeUmbrellaTexture(T), roughness: 0.62 })
      );
      canopy.position.y = 2.48;
      canopy.castShadow = true;
      umb.add(canopy);
      this.scene.add(umb);
    }

    _initCharacters3D(T) {
      // APENAS VoceMorador3D + DonaCamila3D + EspetoChurrasco3D (ZERO Pacoca!)
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.44, VOCE_GROUND_Y, 0.66);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D({ emotion: 'happy', pose: 'idle' });
      this.camila.group.position.set(0.64, CAMILA_GROUND_Y, -0.18);
      this.camila.group.rotation.y = -0.52;
      this.scene.add(this.camila.group);

      this.espeto = new global.EspetoChurrasco3D({ scale: 0.94 });
      this.scene.add(this.espeto.group);
    }

    _buildGrillSmokeAndSweat(T) {
      this.grillSmoke = [];
      const smMat = new T.MeshStandardMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.44,
        roughness: 0.92,
        depthWrite: false
      });
      const smGeo = new T.SphereGeometry(0.14, 10, 8);
      for (let i = 0; i < 12; i++) {
        const m = new T.Mesh(smGeo, smMat);
        this.scene.add(m);
        this.grillSmoke.push({ mesh: m, seed: i * 0.14, offX: (i % 4 - 1.5) * 0.16 });
      }

      // Fios de fumaca misteriosa no fundo de B1 (tease quente sem revelar a churrasqueira!)
      this.b1TeaseSmoke = [];
      const teaseMat = new T.MeshStandardMaterial({
        color: 0xfef3c7,
        transparent: true,
        opacity: 0.34,
        roughness: 0.95,
        depthWrite: false
      });
      const teaseGeo = new T.SphereGeometry(0.11, 10, 8);
      for (let i = 0; i < 5; i++) {
        const tm = new T.Mesh(teaseGeo, teaseMat);
        this.scene.add(tm);
        this.b1TeaseSmoke.push({
          mesh: tm,
          seed: i * 0.21,
          baseX: -0.74 + i * 0.15,
          baseZ: 0.12 - (i % 2) * 0.14
        });
      }

      // 14 GOTAS CARTOON DE SUOR VOANDO DA TESTA DO VOCE (B1 desespero no calor + B4/B5 panico!)
      this.voceSweatDrops = [];
      const sweatGeo = new T.SphereGeometry(0.017, 8, 6);
      const sweatMat = new T.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25,
        roughness: 0.10,
        transparent: true,
        opacity: 0.92
      });
      for (let i = 0; i < 14; i++) {
        const sd = new T.Mesh(sweatGeo, sweatMat);
        sd.visible = false;
        this.scene.add(sd);
        const side = i % 2 === 0 ? -1 : 1;
        this.voceSweatDrops.push({
          mesh: sd,
          side,
          seed: i * 0.13,
          arcX: side * (0.14 + (i % 4) * 0.065),
          arcY: 0.10 + (i % 3) * 0.065,
          arcZ: 0.06 + (i % 3) * 0.045
        });
      }
    }

    renderAt(t) {
      const CD = global.CartoonDistort3D;
      const rawTime = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const dlg = this._getDialogueState(rawTime);

      // Reseta distorcoes antes de recomputar o frame (100% deterministico no scrubbing!)
      if (CD) {
        CD.resetRigDistortion(this.voce, VOCE_GROUND_Y);
        CD.resetRigDistortion(this.camila, CAMILA_GROUND_Y);
      }

      // Micro-hitstop comico no inicio de B5 (congelamento dramatico de 0.18s no susto do lancamento!)
      const hitstopStart = b[4] + 0.02;
      const hitstopDur = 0.18;
      const inHitstop = CD ? CD.isInHitstop(rawTime, hitstopStart, hitstopDur) : 0;
      const time = CD ? CD.hitstopTime(rawTime, hitstopStart, hitstopDur, 0.04, 0.28) : rawTime;

      // Pesos snappy cartoon entre os 6 beats!
      const b1Span = Math.max(2.2, b[1] - 0.45);
      const b1Ramp = smoothstep(rawTime / b1Span);
      const w12 = smoothstep((rawTime - (b[1] - 0.12)) / 0.72);
      const w23 = smoothstep((rawTime - (b[2] - 0.12)) / 0.78);
      const w34 = smoothstep((rawTime - (b[3] - 0.12)) / 0.72);
      const w45 = smoothstep((rawTime - (b[4] - 0.10)) / 0.65);
      const w56 = smoothstep((rawTime - (b[5] - 0.12)) / 0.78);

      // B6: Camila fala rapido ("Mestre do desastre!") e logo o Voce enfia o rosto no fisheye 80 deg!
      const b6FishIn = smoothstep((rawTime - (b[5] + 0.95)) / 0.65);

      // B3+B4 VISUAL GAG: Linguica gigante JA comeca a escorregar em B3 enquanto o Voce se gaba, e pende na ponta em B4!
      const b3PreSlide = smoothstep((time - (b[2] + 0.60)) / Math.max(1.8, (b[3] - b[2]) - 0.60)) * 0.48;
      const b4PreSlide = smoothstep((time - (b[3] + 0.12)) / Math.max(1.5, (b[4] - b[3]) - 0.45)) * 0.52;
      const preSlip = clamp(b3PreSlide + b4PreSlide, 0, 1);

      // B5 COREOGRAFIA:
      // - b[4] + 0.02..0.20s: hitstop flinch!
      // - b[4] + 0.22..1.55s: linguica gigante DECOLA -> PASSA COLADA NA LENTE (pico ~b[4]+0.95..1.08s = b5a!) -> ricocheteia na tigela!
      // - b[4] + 1.55s: IMPACTO NA TIGELA VERMELHA -> tigela VOA GIRANDO PRO AR + COGUMELO NUCLEAR DOURADO DE FAROFA (pico ~b[4]+2.35s = b5b!)
      const slipProg = smoothstep((rawTime - (b[4] + 0.22)) / 1.98);
      const explosionP = clamp((rawTime - (b[4] + 1.52)) / 2.25, 0, 1);
      const bowlLaunchP = clamp((rawTime - (b[4] + 1.52)) / 1.45, 0, 1);
      const bowlSettled = smoothstep((rawTime - (b[4] + 1.52)) / 0.20);
      const impactAge = clamp((rawTime - (b[4] + 1.52)) / 1.35, 0, 1);
      const impactBounceVal = CD ? CD.impactBounce(impactAge, 3.2) : 0;
      const shockShake = smoothstep((rawTime - (b[4] + 1.50)) / 0.14) * (1 - smoothstep((rawTime - (b[4] + 2.55)) / 0.50));

      // Placa "CANTINHO DO CHURRASCO" 100% OCULTA em B1 e 100% VISIVEL de B2 ate B6!
      this.signBoard.visible = w12 > 0.14;

      // =========================================================================
      // 1. CAMERA CARTOON / MEME FISHEYE MULTI-ANGULO (FOV 46 -> 84 deg!)
      // =========================================================================
      const shakeX = Math.sin(rawTime * 28.0) * 0.042 * shockShake + (inHitstop > 0 ? Math.sin(rawTime * 60.0) * 0.028 : 0);
      const shakeY = Math.cos(rawTime * 25.0) * 0.032 * shockShake + (inHitstop > 0 ? Math.cos(rawTime * 55.0) * 0.022 : 0);

      // B1 (0.0s IN MEDIA RES): EXTREME FISHEYE FOV 84 deg colado no nariz do Voce suando!
      const b1TremorX = Math.sin(rawTime * 22.0) * 0.012 * (1 - w12);
      const b1TremorY = Math.cos(rawTime * 19.0) * 0.010 * (1 - w12);
      let camX = -0.44 + b1TremorX;
      let camY = lerp(1.16, 1.13, b1Ramp) + b1TremorY;
      let camZ = lerp(1.38, 1.24, b1Ramp);
      let lookX = -0.44;
      let lookY = 1.12;
      let lookZ = 0.66;
      let fov = CD ? CD.fisheyePulse(74.0, 84.0, 0.45 + b1Ramp * 0.55) : lerp(78.0, 84.0, b1Ramp);

      // B2: Whip-dolly out revelando Area Gourmet + placa livre + chamas 3D + Camila c/ linguica gigante 1.3m!
      camX = lerp(camX, 0.04, w12);
      camY = lerp(camY, 1.50, w12);
      camZ = lerp(camZ, 4.92, w12);
      lookX = lerp(lookX, 0.00, w12);
      lookY = lerp(lookY, 1.06, w12);
      lookZ = lerp(lookZ, -0.56, w12);
      fov = lerp(fov, 47.0, w12);

      // B3: Hero framing no Mestre do Churrasco (placa 100% abaixo de .word-pop + cooler/pato visivel a direita!)
      camX = lerp(camX, 0.06, w23);
      camY = lerp(camY, 1.48, w23);
      camZ = lerp(camZ, 4.76, w23);
      lookX = lerp(lookX, 0.05, w23);
      lookY = lerp(lookY, 1.12, w23);
      lookZ = lerp(lookZ, -0.42, w23);
      fov = lerp(fov, 47.0, w23);

      // B4: FISHEYE SUSPENSE FOV 76 deg empurrando na ponta do espeto (placa 100% livre acima da cabeca da Camila!)
      const b4Fish = CD ? CD.fisheyePulse(47.0, 76.0, w34) : lerp(47.0, 76.0, w34);
      camX = lerp(camX, 0.24, w34);
      camY = lerp(camY, 1.46, w34);
      camZ = lerp(camZ, 2.74, w34);
      lookX = lerp(lookX, 0.14, w34);
      lookY = lerp(lookY, 1.06, w34);
      lookZ = lerp(lookZ, -0.14, w34);
      fov = lerp(fov, b4Fish, w34);

      // B5: Plano aberto comico (fly-by gigante na lente em b5a + mesa/cogumelo de farofa + toda Camila em b5b!)
      camX = lerp(camX, -0.04 + shakeX, w45);
      camY = lerp(camY, 1.46 + shakeY, w45);
      camZ = lerp(camZ, 4.96, w45);
      lookX = lerp(lookX, -0.08, w45);
      lookY = lerp(lookY, 1.04, w45);
      lookZ = lerp(lookZ, -0.34, w45);
      fov = lerp(fov, 47.5, w45);

      // B6a (Camila ri pulando) -> B6b (Voce enfia o rosto sorrindo direto no FISHEYE FOV 80 deg!)
      const b6Fov = CD ? CD.fisheyePulse(47.5, 80.0, b6FishIn) : lerp(47.5, 80.0, b6FishIn);
      camX = lerp(camX, lerp(-0.04, -0.16, b6FishIn), w56);
      camY = lerp(camY, lerp(1.44, 1.24, b6FishIn), w56);
      camZ = lerp(camZ, lerp(4.64, 1.66, b6FishIn), w56);
      lookX = lerp(lookX, lerp(-0.04, -0.10, b6FishIn), w56);
      lookY = lerp(lookY, lerp(1.06, 1.12, b6FishIn), w56);
      lookZ = lerp(lookZ, lerp(-0.22, 0.30, b6FishIn), w56);
      fov = lerp(fov, b6Fov, w56);

      this.camera.fov = clamp(fov, 24, 92);
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // =========================================================================
      // 2. POSICIONAMENTO X/Z DOS PERSONAGENS (Y aterrado via CartoonDistort3D!)
      // =========================================================================
      const stepToSkewer = smoothstep((rawTime - (b[2] - 0.12)) / 0.90);
      const shockStep = smoothstep((rawTime - (b[4] + 1.35)) / 0.45) * (1 - w56);
      const stepCtaLens = smoothstep((rawTime - (b[5] + 0.50)) / 0.85);

      let voceX = lerp(-0.44, -0.22, stepToSkewer);
      voceX = lerp(voceX, -0.12, shockStep);
      voceX = lerp(voceX, -0.22, stepCtaLens);

      let voceZ = lerp(0.66, 0.10, stepToSkewer);
      voceZ = lerp(voceZ, 0.22, shockStep);
      voceZ = lerp(voceZ, 0.62, stepCtaLens);

      let voceRotY = lerp(0.02, 0.28, w12);
      voceRotY = lerp(voceRotY, 0.16, stepToSkewer);
      voceRotY = lerp(voceRotY, 0.24, w34);
      voceRotY = lerp(voceRotY, -0.34, shockStep);
      voceRotY = lerp(voceRotY, 0.06, stepCtaLens);

      this.voce.group.position.x = voceX;
      this.voce.group.position.z = voceZ;
      this.voce.group.rotation.y = voceRotY;

      const camilaShift3 = smoothstep((rawTime - (b[2] - 0.08)) / 0.95);
      const camilaWarn4 = smoothstep((rawTime - (b[3] - 0.08)) / 0.75);
      const camilaShock5 = smoothstep((rawTime - (b[4] + 0.55)) / 0.45) * (1 - w56);

      let camPosX = lerp(0.64, 0.68, camilaShift3);
      camPosX = lerp(camPosX, 0.66, camilaWarn4);
      camPosX = lerp(camPosX, 0.70, camilaShock5);
      camPosX = lerp(camPosX, 0.42, w56);

      let camPosZ = lerp(-0.18, -0.06, camilaShift3);
      camPosZ = lerp(camPosZ, 0.06, camilaWarn4);
      camPosZ = lerp(camPosZ, 0.10, camilaShock5);
      camPosZ = lerp(camPosZ, -0.32, w56);

      let camRotY = lerp(-0.52, -0.68, camilaShift3);
      camRotY = lerp(camRotY, -0.78, camilaWarn4);
      camRotY = lerp(camRotY, -0.82, camilaShock5);
      camRotY = lerp(camRotY, -0.26, w56);

      this.camila.group.position.x = camPosX;
      this.camila.group.position.z = camPosZ;
      this.camila.group.rotation.y = camRotY;

      // =========================================================================
      // 3. EMOCOES, LIP-SYNC, BRACOS E DISTORCOES CARTOON ATERRADAS NO PISO!
      // =========================================================================
      let voceEmotion = 'shocked'; // B1 desespero bug-eyed!
      if (rawTime >= b[1] && rawTime < b[2]) voceEmotion = 'shocked';
      else if (rawTime >= b[2] && rawTime < b[3] + 1.0) voceEmotion = 'smirk'; // B3 se achando o mestre!
      else if (rawTime >= b[3] + 1.0 && rawTime < b[5]) voceEmotion = 'shocked';
      else if (rawTime >= b[5]) voceEmotion = 'happy'; // B6 sorrisao gigante no fisheye!

      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');

      // B3: cabeca empinada/orgulhosa olhando pra cima/camera enquanto a linguica escapa atras!
      const b3Smug = w23 * (1 - w34);
      let voceLookYaw = lerp(Math.sin(rawTime * 8.0) * 0.08, 0.18 * Math.sin(rawTime * 2.4), w23);
      voceLookYaw = lerp(voceLookYaw, 0.24, w34);
      voceLookYaw = lerp(voceLookYaw, -0.32, shockStep);
      voceLookYaw = lerp(voceLookYaw, 0.0, w56);

      let voceLookPitch = lerp(-0.04, -0.22, b3Smug); // empinando o nariz em B3!
      voceLookPitch = lerp(voceLookPitch, -0.14, shockStep);
      voceLookPitch = lerp(voceLookPitch, 0.04, w56);

      this.voce.setLook(voceLookYaw, voceLookPitch);
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : (rawTime < b[1] ? 0.35 : 0.06));
      this.voce.update(1 / 60, time);

      // Caminhada curta nos passos entre beats
      const voceStride = Math.sin(stepToSkewer * Math.PI) * 0.65 + Math.sin(stepCtaLens * Math.PI) * 0.55;
      if (voceStride > 0.005 && this.voce.legL && this.voce.legR) {
        const phi = time * 5.8;
        const amp = 0.36 * clamp(voceStride, 0, 1);
        this.voce.legL.root.rotation.x = lerp(this.voce.legL.root.rotation.x, Math.sin(phi) * amp, clamp(voceStride, 0, 1));
        this.voce.legR.root.rotation.x = lerp(this.voce.legR.root.rotation.x, Math.sin(phi + Math.PI) * amp, clamp(voceStride, 0, 1));
        this.voce.legL.knee.rotation.x = lerp(this.voce.legL.knee.rotation.x, Math.max(0.08, -Math.cos(phi) * 0.32), clamp(voceStride, 0, 1));
        this.voce.legR.knee.rotation.x = lerp(this.voce.legR.knee.rotation.x, Math.max(0.08, -Math.cos(phi + Math.PI) * 0.32), clamp(voceStride, 0, 1));
      }

      // Bracos do Voce segurando o espeto gigante com ginga em B3, susto em B5 e pose zoeira em B6!
      const voceHoldW = clamp(smoothstep((rawTime - (b[2] + 0.05)) / 0.72), 0, 1);
      const b5FlatW = smoothstep((rawTime - (b[4] + 1.48)) / 0.24) * (1 - w56);
      const gingaPulse = Math.sin(time * 5.2) * 0.14 * b3Smug;
      const panicWave = Math.sin(time * 16.0) * 0.10 * w34 * (1 - w45);
      if (voceHoldW > 0.005 && this.voce.shoulderL && this.voce.shoulderR) {
        const shXL = -0.66 + gingaPulse + panicWave - 0.16 * b5FlatW;
        const shXR = -0.66 - gingaPulse - panicWave - 0.16 * b5FlatW;
        const elbX = -0.84 + 0.06 * b5FlatW - 0.06 * w56;
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, shXL, voceHoldW);
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, shXR, voceHoldW);
        this.voce.shoulderL.root.rotation.z = lerp(this.voce.shoulderL.root.rotation.z, 0.18 + 0.06 * shockStep, voceHoldW);
        this.voce.shoulderR.root.rotation.z = lerp(this.voce.shoulderR.root.rotation.z, -0.18 - 0.06 * shockStep, voceHoldW);
        this.voce.shoulderL.elbow.rotation.x = lerp(this.voce.shoulderL.elbow.rotation.x, elbX, voceHoldW);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, elbX, voceHoldW);
      }

      // --- DISTORCOES CARTOON DO VOCE (via CartoonDistort3D, 100% aterradas em floorY = 0!) ---
      // B1: squash/bounce frenetico de desespero + cabecao 1.46x tremendo!
      // B3: estufa peito orgulhoso (sy 1.08, sxzBoost 1.24) + lean smug na espinha!
      // B5: ESMAGADO PLANO (sy 0.68 -> gelatina bounce) apos a explosao de farofa!
      // B6: sorriso gigante com cabecao 1.48x enfiado na lente fisheye 80 deg!
      const b1Panic = 1 - w12;
      let voceSy = 1.0;
      let voceSxzBoost = 1.0;
      let voceHeadScale = 1.0;
      let voceHeadStretch = 1.0;
      let voceHeadTilt = 0.0;
      let voceHeadJitter = 0.0;
      let voceArmStretch = 1.0;
      let voceArmWobble = 0.0;

      // B1 desespero
      voceSy += b1Panic * (-0.08 + Math.sin(rawTime * 11.0) * 0.06);
      voceHeadScale += b1Panic * (0.36 + b1Ramp * 0.14);
      voceHeadStretch += b1Panic * 0.12;
      voceHeadTilt += b1Panic * Math.sin(rawTime * 7.5) * 0.14;
      voceHeadJitter += b1Panic * 0.065;

      // B3 ego inflado ("Mestre do Churrasco!")
      voceSy += b3Smug * (0.07 + Math.sin(time * 5.2) * 0.045);
      voceSxzBoost += b3Smug * 0.20;
      voceHeadScale += b3Smug * 0.16;
      voceHeadTilt += b3Smug * (-0.16 + Math.sin(time * 3.5) * 0.06);
      voceArmStretch += b3Smug * 0.16;
      voceArmWobble += b3Smug * 0.12;
      if (b3Smug > 0.01 && this.voce.spine) {
        this.voce.spine.rotation.x -= b3Smug * 0.24; // inclinacao orgulhosa pra tras na espinha (pes 100% cravados!)
      }

      // B4 susto comecando
      const b4Tense = w34 * (1 - w45);
      voceSy -= b4Tense * 0.06;
      voceHeadScale += b4Tense * 0.22;
      voceHeadJitter += b4Tense * 0.045;
      voceArmStretch += b4Tense * 0.18;
      voceArmWobble += b4Tense * 0.16;

      // B5 ESMAGADO PLANO COM GELATINA NA EXPLOSAO DE FAROFA!
      voceSy += b5FlatW * (-0.30 - impactBounceVal * 0.12);
      voceSxzBoost += b5FlatW * 0.12;
      voceHeadScale += b5FlatW * (0.36 + Math.abs(impactBounceVal) * 0.12);
      voceHeadStretch -= b5FlatW * 0.14;
      voceHeadJitter += (inHitstop > 0 ? 0.12 : 0) + b5FlatW * 0.055;
      voceArmStretch += w45 * (1 - w56) * 0.24;
      voceArmWobble += w45 * (1 - w56) * 0.18;

      // B6: cabecao zoeiro sorrindo direto no fisheye 80 deg!
      voceSy += w56 * (Math.sin(rawTime * 6.5) * 0.05);
      voceHeadScale += w56 * (0.32 + b6FishIn * 0.18);
      voceHeadTilt += w56 * Math.sin(rawTime * 4.5) * 0.12;

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

      // --- CAMILA: EMOCOES, BRACOS E CARTOON DISTORTION ATERRADA NO PISO! ---
      let camilaEmotion = 'alert';
      if (rawTime >= b[1] && rawTime < b[2]) camilaEmotion = 'alert';
      else if (rawTime >= b[2] && rawTime < b[3]) camilaEmotion = 'happy';
      else if (rawTime >= b[3] && rawTime < b[5]) camilaEmotion = 'scared';
      else if (rawTime >= b[5]) camilaEmotion = 'happy';

      this.camila.setEmotion(camilaEmotion);
      const camilaLaughWave = w56 * Math.sin(rawTime * 11.5);
      this.camila.setLook(
        lerp(-0.16, 0.02, w56) + camilaLaughWave * 0.14,
        lerp(0.02, -0.14, camilaWarn4 * (1 - w56)) + w56 * Math.cos(rawTime * 11.5) * 0.10
      );
      this.camila.setMouthOpen(
        dlg.speaker === 'camila'
          ? dlg.lip
          : (w56 > 0.25 ? 0.30 + Math.abs(Math.sin(rawTime * 10.0)) * 0.40 : 0.05)
      );
      this.camila.update(1 / 60, time);

      const camilaStride = Math.sin(camilaShift3 * Math.PI) * 0.46 + Math.sin(w56 * Math.PI) * 0.42;
      if (camilaStride > 0.005 && this.camila.legL && this.camila.legR) {
        const cphi = time * 5.6;
        this.camila.legL.root.rotation.x = lerp(this.camila.legL.root.rotation.x, Math.sin(cphi) * 0.32 * camilaStride, camilaStride);
        this.camila.legR.root.rotation.x = lerp(this.camila.legR.root.rotation.x, Math.sin(cphi + Math.PI) * 0.32 * camilaStride, camilaStride);
      }

      const camilaHoldB2 = w12 * (1 - camilaShift3);
      const camilaPointB4 = camilaWarn4 * (1 - camilaShock5) * (1 - w56);
      if (this.camila.shoulderL && this.camila.shoulderR) {
        if (camilaHoldB2 > 0.005) {
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -0.66, camilaHoldB2);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.66, camilaHoldB2);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.82, camilaHoldB2);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -0.82, camilaHoldB2);
        }
        if (camilaPointB4 > 0.005) {
          // Aponta desesperada pra ponta do espeto!
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -1.10 + Math.sin(rawTime * 11.0) * 0.14, camilaPointB4);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.22, camilaPointB4);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.85, camilaPointB4);
          this.camila.shoulderR.root.rotation.z = lerp(this.camila.shoulderR.root.rotation.z, -0.32, camilaPointB4);
        }
        if (camilaShock5 > 0.005) {
          // Maos pro alto em choque cartoon total (mantendo cotovelos 100% dentro do 9:16!)
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -1.32 + Math.sin(rawTime * 14.0) * 0.10, camilaShock5);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -1.28 + Math.cos(rawTime * 14.0) * 0.10, camilaShock5);
          this.camila.shoulderL.root.rotation.z = lerp(this.camila.shoulderL.root.rotation.z, 0.24, camilaShock5);
          this.camila.shoulderR.root.rotation.z = lerp(this.camila.shoulderR.root.rotation.z, -0.22, camilaShock5);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.86, camilaShock5);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -0.86, camilaShock5);
        }
        if (w56 > 0.005) {
          // Risada cartoon saltitante em B6!
          const lb = Math.sin(rawTime * 12.5) * 0.14;
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -0.52 + lb, w56);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.52 - lb, w56);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -1.04, w56);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -1.04, w56);
        }
      }

      // Distorcoes cartoon da Camila (B4 esticada pro alto + cabecao 1.48x; B5 choque elastico; B6 squash-bounce rindo!)
      let camSy = 1.0;
      let camHeadScale = 1.0;
      let camHeadStretch = 1.0;
      let camHeadTilt = 0.0;
      let camHeadJitter = 0.0;
      let camArmStretch = 1.0;
      let camArmWobble = 0.0;

      // B4: Camila estica com CABECAO 1.36x + braco elastico apontando (coque 100% abaixo da placa!)
      camSy += camilaPointB4 * (0.09 + Math.sin(rawTime * 10.0) * 0.035);
      camHeadScale += camilaPointB4 * 0.36;
      camHeadStretch += camilaPointB4 * 0.06;
      camHeadTilt += camilaPointB4 * 0.14;
      camHeadJitter += camilaPointB4 * 0.065;
      camArmStretch += camilaPointB4 * 0.28;
      camArmWobble += camilaPointB4 * 0.18;

      // B5: choque elastico com gelatina no impacto do cogumelo!
      camSy += camilaShock5 * (0.14 + impactBounceVal * 0.16);
      camHeadScale += camilaShock5 * 0.44;
      camHeadStretch += camilaShock5 * 0.14;
      camHeadJitter += camilaShock5 * 0.075;
      camArmStretch += camilaShock5 * 0.24;
      camArmWobble += camilaShock5 * 0.16;

      // B6: squash-bounce hilariante na gargalhada (pes cravados no chao em floorY = 0!)
      camSy += w56 * (Math.sin(rawTime * 13.0) * 0.20);
      camHeadScale += w56 * (0.28 + Math.abs(Math.sin(rawTime * 13.0)) * 0.12);
      camHeadTilt += w56 * Math.sin(rawTime * 6.5) * 0.18;

      if (CD) {
        CD.footAnchoredSquash(this.camila.group, CAMILA_GROUND_Y, camSy, 1.0, 0, 0, 0);
        CD.headPop(this.camila.headGroup, camHeadScale, camHeadStretch, camHeadTilt, camHeadJitter, rawTime);
        CD.armRubberStretch(this.camila.shoulderL, this.camila.shoulderL.elbow, camArmStretch, camArmWobble, rawTime);
        CD.armRubberStretch(this.camila.shoulderR, this.camila.shoulderR.elbow, camArmStretch, -camArmWobble, rawTime);
      } else {
        this.camila.group.position.y = CAMILA_GROUND_Y;
      }
      this.camilaShadow.position.set(camPosX, 0.015, camPosZ + 0.02);
      this.camilaShadow.scale.setScalar(clamp(1 / Math.sqrt(Math.max(0.65, camSy)), 0.78, 1.32));

      // =========================================================================
      // 4. ESPETO & LINGUICA GIGANTE 1.3M (skewerGroup.y SEMPRE <= 0.78!)
      // =========================================================================
      const camSkX = camPosX + Math.sin(camRotY) * 0.32 - 0.14;
      const camSkZ = camPosZ + Math.cos(camRotY) * 0.32;
      const camSkY = 0.67 + Math.sin(time * 5.2) * 0.024 * camilaHoldB2;

      const voceSkX = voceX + Math.sin(voceRotY) * 0.32 + 0.06;
      const voceSkZ = voceZ + Math.cos(voceRotY) * 0.32;
      // Quando o Voce fica esmagado plano em B5b (sy ~ 0.68), o espeto acompanha EXATAMENTE a altura das maos (~0.43m)!
      const voceSkY = 0.69 + Math.sin(time * 5.2) * 0.025 * b3Smug - b5FlatW * 0.25 - w56 * 0.04;

      const skX = lerp(camSkX, voceSkX, voceHoldW);
      const skY = clamp(lerp(camSkY, voceSkY, voceHoldW), 0.38, 0.78);
      const skZ = lerp(camSkZ, voceSkZ, voceHoldW);
      const skRotY = lerp(camRotY, voceRotY, voceHoldW);

      const skRotZ =
        Math.sin(time * 4.5) * 0.10 * b3Smug -
        0.14 * preSlip * (1 - w45) -
        0.14 * (w45 * (1 - b5FlatW) * (1 - w56));
      const skSpinX = (time * 2.2 * b3Smug) + (w45 * (1 - b5FlatW) * (1 - w56) * 5.0);

      this.espeto.group.visible = rawTime >= b[1] - 0.25;
      this.espeto.update(time, {
        pos: { x: skX, y: skY, z: skZ },
        rotY: skRotY,
        rotZ: skRotZ,
        spinX: skSpinX,
        sizzleAmp: 0.92,
        wobbleAmp: 0.65 + camilaHoldB2 * 0.45 + b3Smug * 0.35 + b4Tense * 0.55,
        preSlip,
        slipProg,
        explosionP,
        // Ponto colado na lente da camera em B5a para o fly-by gigante hilariante!
        flybyPos: { x: -0.18, y: 1.48, z: 2.88 },
        impactPos: BOWL_IMPACT,
        landingPos: BOARD_LANDING
      });

      // =========================================================================
      // 5. TIGELA VERMELHA VOANDO GIRANDO PRO ALTO EM B5 + EASTER EGG DO COOLER!
      // =========================================================================
      if (this.farofaBowlGroup) {
        if (bowlLaunchP > 0 && bowlLaunchP < 1) {
          // Lancada GIRANDO PRO ALTO e levemente a frente/direita do cogumelo para ficar 100% visivel em b5b!
          const arcY = Math.sin(bowlLaunchP * Math.PI) * 1.05;
          this.farofaBowlGroup.position.set(
            0.06 + Math.sin(bowlLaunchP * Math.PI) * 0.32 - bowlLaunchP * 0.12,
            0.836 + arcY,
            0.04 + Math.sin(bowlLaunchP * Math.PI) * 0.28
          );
          this.farofaBowlGroup.rotation.set(
            bowlLaunchP * Math.PI * 3.0,
            bowlLaunchP * Math.PI * 2.0,
            bowlLaunchP * Math.PI * 4.5
          );
        } else if (bowlLaunchP >= 1) {
          // Aterrissa tombada de lado balancando na mesa em B6!
          const settleAge = Math.max(0, rawTime - (b[4] + 2.97));
          const rock = Math.sin(settleAge * 16.0) * Math.exp(-settleAge * 3.0) * 0.24;
          this.farofaBowlGroup.position.set(-0.08, 0.870, 0.02);
          this.farofaBowlGroup.rotation.set(0.18, 0.25, 0.82 + rock);
        } else {
          this.farofaBowlGroup.position.set(0.06, 0.836, 0.04);
          this.farofaBowlGroup.rotation.set(0, 0, 0);
        }
        if (this.farofaPile) {
          this.farofaPile.scale.set(1.0, lerp(0.48, 0.14, bowlSettled), 1.0);
        }
        if (this.spilledFarofa) {
          this.spilledFarofa.visible = bowlSettled > 0.04;
          const spScale = 0.28 + bowlSettled * 0.78;
          this.spilledFarofa.scale.set(spScale, spScale, spScale);
        }
      }

      // EASTER EGG: Tampa do cooler azul abre com BOING em B3 e o Pato de Oculos Escuros assiste tudo!
      const coolerOpenU = clamp((rawTime - (b[2] + 0.55)) / 0.55, 0, 1);
      const coolerOpen = CD ? CD.elasticOut(coolerOpenU) : smoothstep(coolerOpenU);
      if (this.coolerLidPivot) {
        this.coolerLidPivot.rotation.x = -1.45 * clamp(coolerOpen, 0, 1.15);
      }
      if (this.coolerDuckGroup) {
        this.coolerDuckGroup.visible = coolerOpenU > 0.08;
        if (this.coolerDuckGroup.visible) {
          const duckShockPop = Math.sin(clamp((rawTime - (b[4] + 1.50)) / 1.10, 0, 1) * Math.PI) * 0.26;
          const duckLaughBob = w56 * Math.abs(Math.sin(rawTime * 11.0)) * 0.09;
          this.coolerDuckGroup.position.y = lerp(0.24, 0.50, clamp(coolerOpen, 0, 1.12)) + duckShockPop + duckLaughBob;
          this.coolerDuckGroup.rotation.y = Math.sin(rawTime * 3.8) * 0.28;
          this.coolerDuckGroup.rotation.z = Math.sin(rawTime * 7.2) * (0.10 + w56 * 0.14);
          const dSc = 0.85 + clamp(coolerOpen, 0, 1) * 0.35 + duckShockPop * 0.5;
          this.coolerDuckGroup.scale.setScalar(dSc);
        }
      }

      // =========================================================================
      // 6. CHAMAS 3D, FAGULHAS, SUOR CARTOON DO VOCE E FUMACA!
      // =========================================================================
      const flicker = Math.sin(rawTime * 12.5) * 0.44 + Math.cos(rawTime * 18.3) * 0.24;
      this.emberLight.intensity = 1.75 + flicker * 0.60;
      if (this.emberMat) {
        this.emberMat.emissiveIntensity = 1.55 + Math.sin(rawTime * 8.5) * 0.35;
      }
      if (this.b1FireLight) {
        this.b1FireLight.intensity = (1 - w12) * Math.max(0.3, 1.75 + flicker * 1.10);
      }

      for (let i = 0; i < this.flameTongues.length; i++) {
        const ft = this.flameTongues[i];
        const wave = Math.sin(time * ft.speed + ft.phase);
        const wave2 = Math.cos(time * (ft.speed * 1.47) + ft.phase * 1.3);
        const sy = 0.78 + 0.38 * (0.5 + 0.5 * wave) + 0.16 * wave2;
        const sxz = 0.86 + 0.18 * (0.5 - 0.5 * wave);
        ft.holder.scale.set(sxz, Math.max(0.45, sy), sxz);
        ft.holder.rotation.z = wave * 0.18;
        ft.holder.rotation.x = wave2 * 0.12;
      }

      for (let i = 0; i < this.fireSparks.length; i++) {
        const sp = this.fireSparks[i];
        const cyc = (time * 0.76 + sp.seed) % 1;
        sp.mesh.position.set(
          sp.baseX + Math.sin(time * 4.2 + sp.seed * 9) * 0.08,
          1.12 + cyc * 0.88,
          sp.baseZ + Math.cos(time * 3.6 + sp.seed * 7) * 0.06
        );
        sp.mesh.scale.setScalar((1 - cyc) * 1.18);
      }

      for (let i = 0; i < this.grillSmoke.length; i++) {
        const gs = this.grillSmoke[i];
        const cyc = (time * 0.28 + gs.seed) % 1;
        gs.mesh.position.set(
          0.45 + gs.offX + Math.sin(time * 1.4 + gs.seed * 6) * 0.14,
          1.26 + cyc * 1.65,
          -2.36 + Math.cos(time * 1.2 + gs.seed * 4) * 0.10
        );
        gs.mesh.scale.setScalar((0.55 + cyc * 1.35) * (1 - cyc * 0.50));
      }

      // Fios de fumaca quente atras do Voce em B1
      const b1TeaseAmp = 1 - w12;
      for (let i = 0; i < this.b1TeaseSmoke.length; i++) {
        const ts = this.b1TeaseSmoke[i];
        ts.mesh.visible = b1TeaseAmp > 0.03;
        if (ts.mesh.visible) {
          const cyc = (rawTime * 0.38 + ts.seed) % 1;
          ts.mesh.position.set(
            ts.baseX + Math.sin(rawTime * 1.8 + ts.seed * 8) * 0.09,
            0.78 + cyc * 0.95,
            ts.baseZ
          );
          ts.mesh.scale.setScalar((0.48 + cyc * 0.95) * (1 - cyc * 0.50) * b1TeaseAmp);
        }
      }

      // 14 GOTAS DE SUOR CARTOON VOANDO DA TESTA DO VOCE (B1 fisheye desespero + B4/B5 panico!)
      const sweatAmp = clamp(b1Panic + b4Tense * 0.85 + shockStep * 0.95, 0, 1);
      const headWorldY = this.voce.group.position.y + 1.48 * voceSy;
      for (let i = 0; i < this.voceSweatDrops.length; i++) {
        const sd = this.voceSweatDrops[i];
        sd.mesh.visible = sweatAmp > 0.08;
        if (sd.mesh.visible) {
          const cyc = (rawTime * 2.1 + sd.seed) % 1;
          sd.mesh.position.set(
            voceX + sd.arcX * (0.55 + cyc * 1.25),
            headWorldY + 0.06 + Math.sin(cyc * Math.PI) * sd.arcY - cyc * cyc * 0.22,
            voceZ + sd.arcZ * (0.6 + cyc * 0.8)
          );
          const sc = (0.65 + (1 - cyc) * 0.70) * sweatAmp;
          sd.mesh.scale.set(sc * 0.85, sc * 1.35, sc * 0.85);
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep07LinguicaChurrasco3D = Ep07LinguicaChurrasco3D;
})(typeof window !== 'undefined' ? window : globalThis);
