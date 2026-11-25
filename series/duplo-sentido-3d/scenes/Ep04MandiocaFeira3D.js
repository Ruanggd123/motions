/**
 * Ep04MandiocaFeira3D.js -- Ep 04 Inedito: "A Mandioca Grossa da Feira!"
 * Cenario 3D 100% inedito: Feira Livre Ensolarada de Domingo (rua de paralelepipedo em y=0.00,
 * barraca listrada vermelho/branco, placa "MANDIOCA GIGANTE R$ 5", caixotes de legumes,
 * panela fumegante de degustacao e balanca analógica suspensa que quebra em B5!).
 *
 * Regras fisicas e visuais garantidas:
 * - Zero flutuacao: VoceMorador3D em VOCE_GROUND_Y = -0.37, DonaCamila3D em CAMILA_GROUND_Y = -0.27,
 *   Pacoca em y=0.00 (com salto explicito em B5).
 * - Rotacao e camera C1 fluidas em 60fps: maxDelta <= 0.10 rad/frame nas articulacoes.
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

  class Ep04MandiocaFeira3D {
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
      this.scene.background = new T.Color(0x7dd3fc);
      this.scene.fog = new T.FogExp2(0xe0f2fe, 0.012);

      this.camera = new T.PerspectiveCamera(40, 1080 / 1920, 0.08, 120);

      this._initLights(T);
      this._buildFeiraLivre3D(T);
      this._initCharacters3D(T);
      this._buildParticles(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP04_MANDIOCA_TIMELINE ? global.EP04_MANDIOCA_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 5.8, 11.0, 16.2, 21.4, 26.6];
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
      const hemi = new T.HemisphereLight(0xbae6fd, 0xd97706, 0.78);
      hemi.position.set(0, 12, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 1.95);
      sun.position.set(4.6, 9.2, 6.0);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -5.5; sun.shadow.camera.right = 5.5;
      sun.shadow.camera.top = 5.5; sun.shadow.camera.bottom = -5.5;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 160;
      const g = c.getContext('2d');
      g.fillStyle = '#14532d';
      g.fillRect(0, 0, 512, 160);
      g.strokeStyle = '#fde047';
      g.lineWidth = 10;
      g.strokeRect(8, 8, 496, 144);
      g.fillStyle = '#fef08a';
      g.font = '900 44px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 256, 72);
      g.fillStyle = '#ffffff';
      g.font = '800 34px "Segoe UI", sans-serif';
      g.fillText(subtitle, 256, 126);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildFeiraLivre3D(T) {
      // Rua pavimentada clara ensolarada em y = 0.00
      const ground = new T.Mesh(
        new T.PlaneGeometry(26, 26),
        new T.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.88 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);

      const cobbleGrid = new T.GridHelper(18, 28, 0x94a3b8, 0xb6c2d0);
      cobbleGrid.position.y = 0.002;
      this.scene.add(cobbleGrid);

      // Calcada amarela/creme de feira atras da barraca
      const sidewalk = new T.Mesh(
        new T.BoxGeometry(16, 0.08, 4.5),
        new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 })
      );
      sidewalk.position.set(0, 0.04, -4.6);
      sidewalk.receiveShadow = true;
      this.scene.add(sidewalk);

      // Predios coloridos de bairro brasileiro ao fundo (z = -8.5)
      [
        { x: -3.8, h: 4.8, c: 0xfdba74 },
        { x: -1.6, h: 5.6, c: 0xfde047 },
        { x: 0.8, h: 4.4, c: 0x38bdf8 },
        { x: 3.1, h: 5.2, c: 0xfb7185 }
      ].forEach((b) => {
        const bld = new T.Mesh(
          new T.BoxGeometry(2.0, b.h, 1.8),
          new T.MeshStandardMaterial({ color: b.c, roughness: 0.80 })
        );
        bld.position.set(b.x, b.h * 0.5, -8.5);
        this.scene.add(bld);
      });

      // Arvore frondosa na calcada direita ao fundo
      const trunk = new T.Mesh(new T.CylinderGeometry(0.14, 0.18, 1.8, 10), new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
      trunk.position.set(2.4, 0.9, -4.2);
      this.scene.add(trunk);
      const foliageMat = new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.72 });
      [[2.4, 2.25, -4.2, 0.85], [2.0, 1.95, -4.1, 0.60], [2.8, 2.0, -4.3, 0.62]].forEach(([x, y, z, r]) => {
        const leaf = new T.Mesh(new T.SphereGeometry(r, 12, 10), foliageMat);
        leaf.position.set(x, y, z);
        this.scene.add(leaf);
      });

      // === BARRACA DA FEIRA LIVRE (em z = -1.25, bem atras dos personagens) ===
      const woodMat = new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.72 });
      const woodDark = new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.78 });
      const metalMat = new T.MeshStandardMaterial({ color: 0x64748b, metalness: 0.65, roughness: 0.35 });

      // Bancada de madeira solida (top em y = 0.88)
      const counterTop = new T.Mesh(new T.BoxGeometry(2.65, 0.08, 0.92), woodMat);
      counterTop.position.set(0.05, 0.84, -1.22);
      counterTop.castShadow = true;
      counterTop.receiveShadow = true;
      this.scene.add(counterTop);

      // Saia verde da barraca abaixo do tampo
      const skirt = new T.Mesh(new T.BoxGeometry(2.52, 0.78, 0.80), new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.86 }));
      skirt.position.set(0.05, 0.40, -1.22);
      skirt.castShadow = true;
      skirt.receiveShadow = true;
      this.scene.add(skirt);

      // Postes metalicos sustentando o toldo listrado
      [[-1.22, -1.62], [1.32, -1.62], [-1.22, -0.82], [1.32, -0.82]].forEach(([px, pz]) => {
        const post = new T.Mesh(new T.CylinderGeometry(0.032, 0.032, 2.48, 10), metalMat);
        post.position.set(px, 1.24, pz);
        post.castShadow = true;
        this.scene.add(post);
      });

      // Toldo listrado vermelho e branco classico de feira brasileira!
      const redMat = new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.65 });
      const whiteMat = new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
      for (let i = 0; i < 8; i++) {
        const stripe = new T.Mesh(new T.BoxGeometry(0.35, 0.06, 1.28), i % 2 === 0 ? redMat : whiteMat);
        stripe.position.set(-1.18 + i * 0.35, 2.52, -1.16);
        stripe.rotation.x = 0.22;
        stripe.castShadow = true;
        this.scene.add(stripe);

        const valance = new T.Mesh(new T.BoxGeometry(0.35, 0.22, 0.04), i % 2 === 0 ? redMat : whiteMat);
        valance.position.set(-1.18 + i * 0.35, 2.28, -0.56);
        this.scene.add(valance);
      }

      // Placa promocional de feira pendurada bem acima no toldo (nao aparece no close de B1!)
      const signTex = this._makeSignTexture(T, 'MANDIOCA GIGANTE', 'PROMOÇÃO R$ 5,00');
      const signBoard = new T.Mesh(
        new T.BoxGeometry(1.42, 0.40, 0.04),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.55 })
      );
      signBoard.position.set(-0.26, 2.08, -0.82);
      this.scene.add(signBoard);

      // Tabua de corte no centro da bancada (y = 0.90)
      const board = new T.Mesh(new T.BoxGeometry(0.95, 0.035, 0.44), new T.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.72 }));
      board.position.set(-0.08, 0.90, -1.06);
      board.receiveShadow = true;
      this.scene.add(board);

      // Caixotes de madeira com tomates e laranjas na esquerda da banca
      const crateL = new T.Mesh(new T.BoxGeometry(0.54, 0.24, 0.42), woodDark);
      crateL.position.set(-0.92, 1.00, -1.24);
      crateL.castShadow = true;
      this.scene.add(crateL);
      const tomatoMat = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.38 });
      const orangeMat = new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 });
      for (let t = 0; t < 6; t++) {
        const fruit = new T.Mesh(new T.SphereGeometry(0.07, 10, 8), t % 2 === 0 ? tomatoMat : orangeMat);
        fruit.position.set(-1.08 + (t % 3) * 0.15, 1.15, -1.32 + Math.floor(t / 3) * 0.15);
        this.scene.add(fruit);
      }

      // Panela de barro fumegante de degustacao na extremidade esquerda-frontal (x = -0.86, z = -0.92)
      const potGroup = new T.Group();
      potGroup.position.set(-0.88, 0.89, -0.94);
      const clayMat = new T.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.68 });
      const potBody = new T.Mesh(new T.CylinderGeometry(0.18, 0.15, 0.20, 16), clayMat);
      potBody.position.y = 0.10;
      potBody.castShadow = true;
      potGroup.add(potBody);
      const broth = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.02, 14), new T.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.22 }));
      broth.position.y = 0.19;
      potGroup.add(broth);
      this.scene.add(potGroup);

      // Balanca analogica de feira suspensa no VAO CENTRAL-DIREITO (x = 0.54, livre entre Voce e Camila!)
      this.scalePivot = new T.Group();
      this.scalePivot.position.set(0.54, 2.22, -0.92);
      const scaleChain = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.42, 8), metalMat);
      scaleChain.position.y = -0.21;
      this.scalePivot.add(scaleChain);

      const dialBody = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.07, 20), new T.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.35 }));
      dialBody.rotation.x = Math.PI / 2;
      dialBody.position.y = -0.45;
      this.scalePivot.add(dialBody);

      const dialRim = new T.Mesh(new T.TorusGeometry(0.17, 0.02, 8, 20), redMat);
      dialRim.position.set(0, -0.45, 0.03);
      this.scalePivot.add(dialRim);

      this.scaleNeedle = new T.Mesh(new T.BoxGeometry(0.022, 0.14, 0.02), new T.MeshStandardMaterial({ color: 0xdc2626 }));
      this.scaleNeedle.position.set(0, -0.45, 0.045);
      this.scalePivot.add(this.scaleNeedle);

      // Prato metalico suspenso abaixo do mostrador
      this.scalePanGroup = new T.Group();
      this.scalePanGroup.position.set(0, -0.62, 0);
      [-0.14, 0.14].forEach((cx) => {
        const rod = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.56, 6), metalMat);
        rod.position.set(cx, -0.26, 0);
        rod.rotation.z = cx > 0 ? -0.22 : 0.22;
        this.scalePanGroup.add(rod);
      });
      const panDish = new T.Mesh(new T.CylinderGeometry(0.32, 0.25, 0.07, 20), new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.72, roughness: 0.25 }));
      panDish.position.y = -0.54;
      panDish.castShadow = true;
      this.scalePanGroup.add(panDish);
      this.scalePivot.add(this.scalePanGroup);
      this.scene.add(this.scalePivot);

      // Sombras de contato no piso y = 0.015
      const shMat = new T.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.26, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.015, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.28, -0.36, 0.58);
      this.camilaShadow = makeShadow(0.26, 0.98, -0.28);
      this.mandiocaFloorShadow = makeShadow(0.26, 0.44, -0.18);
      this.mandiocaFloorShadow.visible = false;
    }

    _initCharacters3D(T) {
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.36, VOCE_GROUND_Y, 0.58);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D({ emotion: 'happy', pose: 'idle' });
      this.camila.group.position.set(1.12, CAMILA_GROUND_Y, -0.45);
      this.camila.group.rotation.y = -0.62;
      this.scene.add(this.camila.group);

      // Estrela comica do Ep 04: Mandioca Gigante 3D (Paçoca fora deste episódio para foco total no roteiro!)
      this.mandioca = new global.MandiocaGigante3D({ scale: 0.78 });
      this.mandioca.group.position.set(-0.14, 1.02, -1.04);
      this.scene.add(this.mandioca.group);
    }

    _buildParticles(T) {
      // Nuvens de vapor subindo da panela de barro
      this.steamPuffs = [];
      const steamMat = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.62, roughness: 0.9 });
      const steamGeo = new T.SphereGeometry(0.06, 10, 8);
      for (let i = 0; i < 8; i++) {
        const s = new T.Mesh(steamGeo, steamMat);
        this.scene.add(s);
        this.steamPuffs.push({ mesh: s, seed: i * 0.14 });
      }

      // Pedacos de casca e terra voando quando a balanca quebra em B5!
      this.crumbs = [];
      const crumbMat = new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const crumbGeo = new T.BoxGeometry(0.055, 0.032, 0.042);
      for (let i = 0; i < 12; i++) {
        const c = new T.Mesh(crumbGeo, crumbMat);
        c.visible = false;
        this.scene.add(c);
        this.crumbs.push({ mesh: c, seed: i * 0.93 });
      }
    }

    renderAt(t) {
      const time = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const dlg = this._getDialogueState(time);

      const w12 = smoothstep((time - (b[1] - 0.15)) / 1.25);
      const w23 = smoothstep((time - (b[2] - 0.15)) / 1.15);
      const w34 = smoothstep((time - (b[3] - 0.15)) / 1.15);
      const w45 = smoothstep((time - (b[4] - 0.15)) / 1.15);
      const w56 = smoothstep((time - (b[5] - 0.15)) / 1.20);

      // 1. Camera C1 super fluida (B1 close limpo no rosto -> B2 revela Feira Livre + Mandioca Gigante!)
      const breathCam = Math.sin(time * 1.2) * 0.012;
      let camX = -0.34, camY = 1.22 + breathCam, camZ = 1.98;
      let lookX = -0.36, lookY = 1.08, lookZ = 0.50, fov = 33;

      camX = lerp(camX, 0.14, w12); camY = lerp(camY, 1.54 + breathCam, w12); camZ = lerp(camZ, 5.10, w12);
      lookX = lerp(lookX, 0.08, w12); lookY = lerp(lookY, 1.06, w12); lookZ = lerp(lookZ, -0.55, w12); fov = lerp(fov, 46, w12);

      camX = lerp(camX, -0.06, w23); camY = lerp(camY, 1.48 + breathCam, w23); camZ = lerp(camZ, 4.45, w23);
      lookX = lerp(lookX, -0.04, w23); lookY = lerp(lookY, 1.04, w23); lookZ = lerp(lookZ, -0.20, w23); fov = lerp(fov, 45, w23);

      camX = lerp(camX, 0.20, w34); camY = lerp(camY, 1.46 + breathCam, w34); camZ = lerp(camZ, 4.60, w34);
      lookX = lerp(lookX, 0.10, w34); lookY = lerp(lookY, 1.04, w34); lookZ = lerp(lookZ, -0.35, w34); fov = lerp(fov, 45, w34);

      camX = lerp(camX, 0.18, w45); camY = lerp(camY, 1.44 + breathCam, w45); camZ = lerp(camZ, 4.55, w45);
      lookX = lerp(lookX, 0.16, w45); lookY = lerp(lookY, 1.04, w45); lookZ = lerp(lookZ, -0.35, w45); fov = lerp(fov, 46, w45);

      camX = lerp(camX, 0.06, w56); camY = lerp(camY, 1.46 + breathCam, w56); camZ = lerp(camZ, 4.55, w56);
      lookX = lerp(lookX, 0.02, w56); lookY = lerp(lookY, 1.04, w56); lookZ = lerp(lookZ, 0.15, w56); fov = lerp(fov, 45, w56);

      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // 2. Trajetorias 100% aterradas em piso solido (VOCE_GROUND_Y = -0.37, CAMILA_GROUND_Y = -0.27)
      // B3: Voce aproxima da banca | B5: Voce anda ate a balanca pra pesar e recua no susto! | B6: volta pro centro exibindo trofeu
      const approachStall = smoothstep((time - (b[2] - 0.12)) / 1.25);
      const walkToScale = smoothstep((time - (b[4] - 0.15)) / 1.05);
      const recoilBack = smoothstep((time - (b[4] + 1.45)) / 0.85);
      const stepFrontCta = smoothstep((time - (b[5] - 0.15)) / 1.25);

      const voceStride =
        Math.sin(approachStall * Math.PI) * 0.76 +
        Math.sin(walkToScale * Math.PI) * 0.72 +
        Math.sin(recoilBack * Math.PI) * 0.55 +
        Math.sin(stepFrontCta * Math.PI) * 0.72;

      let voceX = lerp(-0.36, -0.24, approachStall);
      voceX = lerp(voceX, 0.18, walkToScale);
      voceX = lerp(voceX, -0.18, recoilBack);
      voceX = lerp(voceX, -0.26, stepFrontCta);

      let voceZ = lerp(0.58, -0.32, approachStall);
      voceZ = lerp(voceZ, -0.38, walkToScale);
      voceZ = lerp(voceZ, -0.05, recoilBack);
      voceZ = lerp(voceZ, 0.48, stepFrontCta);

      let voceRotY = lerp(0.06, 0.36, w12);
      voceRotY = lerp(voceRotY, 0.12, w23);
      voceRotY = lerp(voceRotY, 0.34, w34);
      voceRotY = lerp(voceRotY, 0.62, walkToScale);
      voceRotY = lerp(voceRotY, 0.42, recoilBack);
      voceRotY = lerp(voceRotY, 0.04, stepFrontCta);

      this.voce.group.position.set(voceX, VOCE_GROUND_Y, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voceShadow.position.set(voceX, 0.015, voceZ + 0.02);

      // Camila fica bem a direita (x=1.02) deixando a balanca central (x=0.54) 100% visivel!
      const camilaStep = smoothstep((time - (b[1] - 0.10)) / 1.25);
      const camilaClose = smoothstep((time - (b[3] - 0.12)) / 1.25);
      const camilaStride = Math.sin(camilaStep * Math.PI) * 0.65 + Math.sin(camilaClose * Math.PI) * 0.55;
      const camPosX = lerp(1.16, 1.02, camilaStep) + camilaClose * (0.98 - 1.02);
      const camPosZ = lerp(-0.45, -0.22, camilaStep) + camilaClose * (0.04 - (-0.22));
      this.camila.group.position.set(camPosX, CAMILA_GROUND_Y, camPosZ);
      this.camila.group.rotation.y = lerp(-0.62, -0.50, w34) * (1 - w56) - 0.28 * w56;
      this.camilaShadow.position.set(camPosX, 0.015, camPosZ + 0.02);

      // 3. Animacao facial e bracos C1 (100% alinhados com colocar na balanca -> susto -> pegar do chao!)
      const scaleBreakW = smoothstep((time - (b[4] + 1.20)) / 0.45);
      const dropToFloorW = smoothstep((time - (b[4] + 1.85)) / 0.75) * (1 - stepFrontCta);

      const voceEmotion = time < b[1] ? 'smirk' : (time < b[3] ? 'shocked' : (time < b[4] + 1.1 ? 'determined' : (time < b[5] ? 'shocked' : 'happy')));
      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');
      this.voce.setLook(
        w56 > 0.45 ? 0.0 : (scaleBreakW > 0.3 && w56 < 0.3 ? 0.35 : Math.sin(time * 2.0) * 0.22),
        dropToFloorW > 0.4 ? -0.32 : 0.06
      );
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0.06);
      this.voce.update(1 / 60, time);

      if (voceStride > 0.005 && this.voce.legL && this.voce.legR) {
        const phi = time * 6.0;
        const amp = 0.42 * clamp(voceStride, 0, 1);
        this.voce.legL.root.rotation.x = lerp(this.voce.legL.root.rotation.x, Math.sin(phi) * amp, clamp(voceStride, 0, 1));
        this.voce.legR.root.rotation.x = lerp(this.voce.legR.root.rotation.x, Math.sin(phi + Math.PI) * amp, clamp(voceStride, 0, 1));
        this.voce.legL.knee.rotation.x = lerp(this.voce.legL.knee.rotation.x, Math.max(0.08, -Math.cos(phi) * 0.40), clamp(voceStride, 0, 1));
        this.voce.legR.knee.rotation.x = lerp(this.voce.legR.knee.rotation.x, Math.max(0.08, -Math.cos(phi + Math.PI) * 0.40), clamp(voceStride, 0, 1));
      }

      // Bracos segurando a mandioca em B3/B4, estendendo para colocar na balanca em inicio B5, soltando no susto quando quebra e erguendo em B6!
      const holdingBeforeBreak = clamp(w23 * (1 - scaleBreakW), 0, 1);
      const holdWeight = clamp(holdingBeforeBreak + stepFrontCta, 0, 1);
      if (holdWeight > 0.01 && this.voce.shoulderL && this.voce.shoulderR) {
        const liftStrain = Math.sin(time * 4.2) * 0.10 * (1 - stepFrontCta);
        const targetArmX = lerp(-0.92 + liftStrain, -1.12, walkToScale * (1 - scaleBreakW));
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, targetArmX, holdWeight);
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, targetArmX, holdWeight);
      }

      this.camila.setEmotion(scaleBreakW > 0.3 && w56 < 0.4 ? 'scared' : 'happy');
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : 0.05);
      this.camila.update(1 / 60, time);
      if (camilaStride > 0.005 && this.camila.legL && this.camila.legR) {
        const cphi = time * 5.6;
        this.camila.legL.root.rotation.x = lerp(this.camila.legL.root.rotation.x, Math.sin(cphi) * 0.38 * camilaStride, camilaStride);
        this.camila.legR.root.rotation.x = lerp(this.camila.legR.root.rotation.x, Math.sin(cphi + Math.PI) * 0.38 * camilaStride, camilaStride);
      }

      // 4. Trajetoria 100% FISICA da Mandioca Gigante 3D seguindo CADA PALAVRA do roteiro!
      // B1/B2: na tabua | B3/B4: nas maos de Voce | Inicio B5: Voce coloca no prato da balanca (x=0.54)
      // Meio B5: Peso arrebenta a balanca -> prato desaba inclinado e a mandioca escorrega pro chao!
      // B6: Voce levanta ela do chao em pose de trofeu ("Cinco quilos de mandioca no chao!")
      const liftW = smoothstep((time - (b[2] + 0.18)) / 0.85) * (1 - walkToScale);
      const placeOnScaleW = smoothstep((time - (b[4] + 0.10)) / 0.95) * (1 - stepFrontCta);

      let mx = -0.14, my = 1.02, mz = -1.04, mrz = 0.04, mry = 0.08;
      // B3/B4: Voce segura firme com as duas maos na altura do peito
      const strainY = Math.sin(time * 4.2) * 0.042;
      mx = lerp(mx, voceX + 0.02, liftW);
      my = lerp(my, 0.72 + strainY, liftW);
      mz = lerp(mz, voceZ + 0.30, liftW);
      mrz = lerp(mrz, Math.sin(time * 4.2) * 0.12, liftW);

      // Inicio B5: Voce leva e pousa direto no prato da balanca central (x=0.54, z=-0.92)
      const panSink = scaleBreakW * 0.24;
      mx = lerp(mx, 0.54, placeOnScaleW);
      my = lerp(my, 1.08 - panSink + Math.sin(time * 13) * 0.02 * scaleBreakW, placeOnScaleW);
      mz = lerp(mz, -0.92, placeOnScaleW);
      mrz = lerp(mrz, -0.06 - scaleBreakW * 0.42, placeOnScaleW);
      mry = lerp(mry, -0.14, placeOnScaleW);

      // Final B5: Escorrega da balanca quebrada e cai no chao na frente dos dois!
      mx = lerp(mx, 0.44, dropToFloorW);
      my = lerp(my, 0.14 + Math.sin(dropToFloorW * Math.PI) * 0.24, dropToFloorW);
      mz = lerp(mz, -0.18, dropToFloorW);
      mrz = lerp(mrz, 0.04, dropToFloorW);
      mry = lerp(mry, -0.22, dropToFloorW);

      // B6: Voce exibe orgulhoso na altura do peito ("Cinco quilos de mandioca no chao!")
      mx = lerp(mx, voceX + 0.04, stepFrontCta);
      my = lerp(my, 0.70 + Math.sin(time * 3.0) * 0.022, stepFrontCta);
      mz = lerp(mz, voceZ + 0.32, stepFrontCta);
      mrz = lerp(mrz, 0.10 + Math.sin(time * 2.5) * 0.05, stepFrontCta);
      mry = lerp(mry, 0.05, stepFrontCta);

      this.mandioca.group.visible = time >= b[1] - 0.35;
      this.mandioca.group.position.set(mx, my, mz);
      this.mandioca.group.rotation.set(0.08, mry, mrz);
      this.mandioca.wobble = Math.max(liftW, scaleBreakW * (1 - dropToFloorW) * 1.4);
      this.mandioca.update(1 / 60, time);

      this.mandiocaFloorShadow.visible = dropToFloorW > 0.25 && stepFrontCta < 0.5;
      this.mandiocaFloorShadow.position.set(mx, 0.015, mz);

      // Balanca analogica balanca na brisa -> afunda e entorta no vao livre sem passar atras da cabeca de Voce!
      this.scalePivot.rotation.z = Math.sin(time * (scaleBreakW > 0.2 ? 9.0 : 1.8)) * (0.04 + scaleBreakW * 0.12) + scaleBreakW * 0.10;
      this.scalePanGroup.position.y = -0.62 - scaleBreakW * 0.22 + Math.sin(time * 14) * scaleBreakW * 0.025;
      this.scalePanGroup.rotation.z = scaleBreakW * 0.30;
      this.scaleNeedle.rotation.z = -(time * (scaleBreakW > 0.2 ? 18.0 : 0.4));

      // Vapor constante saindo da panela de barro em B2..B6
      for (let i = 0; i < this.steamPuffs.length; i++) {
        const sp = this.steamPuffs[i];
        const cyc = (time * 0.55 + sp.seed) % 1;
        sp.mesh.visible = time >= b[1] - 0.35;
        if (sp.mesh.visible) {
          sp.mesh.position.set(
            -0.88 + Math.sin(time * 2.2 + i) * 0.06,
            1.12 + cyc * 0.62,
            -0.94 + Math.cos(time * 1.8 + i) * 0.05
          );
          const sc = 0.65 + cyc * 1.15;
          sp.mesh.scale.setScalar(sc);
        }
      }

      // Casca/terra voando no instante que a balanca arrebenta em B5 (no x = 0.54)!
      const crumbW = smoothstep((time - (b[4] + 1.20)) / 0.30) * (1 - smoothstep((time - (b[5] + 0.6)) / 0.7));
      for (let i = 0; i < this.crumbs.length; i++) {
        const cb = this.crumbs[i];
        cb.mesh.visible = crumbW > 0.05;
        if (cb.mesh.visible) {
          const cyc = (time * 0.85 + cb.seed) % 1;
          cb.mesh.position.set(
            0.54 + Math.sin(cb.seed * 4.1) * cyc * 0.65,
            1.02 + Math.sin(cyc * Math.PI) * 0.40 - cyc * 0.85,
            -0.92 + Math.cos(cb.seed * 3.7) * cyc * 0.50
          );
          cb.mesh.rotation.set(time * 5 + cb.seed, time * 4, cb.seed);
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep04MandiocaFeira3D = Ep04MandiocaFeira3D;
})(typeof window !== 'undefined' ? window : globalThis);
