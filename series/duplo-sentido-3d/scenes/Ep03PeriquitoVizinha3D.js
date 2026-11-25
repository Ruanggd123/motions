/**
 * Ep03PeriquitoVizinha3D.js -- Ep 03 Inedito: "O Periquito da Vizinha"
 * Cenario 3D 100% inedito: Sala de Estar Ensolarada (piso amadeirado em y=0.00, sofa mostarda, gaiola aberta, varanda com ceu azul).
 * Regras fisicas e visuais garantidas:
 * - Zero flutuacao: VoceMorador3D em VOCE_GROUND_Y = -0.37, DonaCamila3D em CAMILA_GROUND_Y = -0.27, Pacoca em y=0.00 (com salto explicito em B4).
 * - Rotacao fluida e movimento C1 em 60fps: nenhuma troca seca nem objetos atravessando moveis.
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

  class Ep03PeriquitoVizinha3D {
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
      this.renderer.toneMappingExposure = 1.14;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x93c5fd);
      this.scene.fog = new T.FogExp2(0xe0f2fe, 0.010);

      this.camera = new T.PerspectiveCamera(40, 1080 / 1920, 0.08, 120);

      this._initLights(T);
      this._buildLivingRoom3D(T);
      this._initCharacters3D(T);
      this._buildFeathers(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP03_PERIQUITO_TIMELINE ? global.EP03_PERIQUITO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 4.6, 8.8, 13.5, 18.2, 23.0];
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
      const hemi = new T.HemisphereLight(0xe0f2fe, 0xd97706, 0.72);
      hemi.position.set(0, 10, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 1.85);
      sun.position.set(4.2, 8.8, 6.2);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
      sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -5;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);
    }

    _buildLivingRoom3D(T) {
      // Piso madeira solido em y = 0.00
      const floor = new T.Mesh(
        new T.PlaneGeometry(20, 20),
        new T.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.78 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      const plankGrid = new T.GridHelper(16, 20, 0xb48a5a, 0xcba678);
      plankGrid.position.y = 0.002;
      this.scene.add(plankGrid);

      // Tapete turquesa + borda creme no centro da sala (zero obstrucao de pes)
      const rugOuter = new T.Mesh(new T.BoxGeometry(2.85, 0.012, 1.95), new T.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.92 }));
      rugOuter.position.set(0.0, 0.006, 0.25);
      rugOuter.receiveShadow = true;
      this.scene.add(rugOuter);

      const rugInner = new T.Mesh(new T.BoxGeometry(2.45, 0.014, 1.55), new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.90 }));
      rugInner.position.set(0.0, 0.007, 0.25);
      rugInner.receiveShadow = true;
      this.scene.add(rugInner);

      // Paredes claras da sala com grande janela ensolarada atras (z = -2.45)
      const wallMat = new T.MeshStandardMaterial({ color: 0xfdf8ec, roughness: 0.85 });
      const backLeftWall = new T.Mesh(new T.BoxGeometry(3.2, 3.6, 0.24), wallMat);
      backLeftWall.position.set(-2.55, 1.8, -2.45);
      backLeftWall.receiveShadow = true;
      this.scene.add(backLeftWall);

      const backRightWall = new T.Mesh(new T.BoxGeometry(3.2, 3.6, 0.24), wallMat);
      backRightWall.position.set(2.55, 1.8, -2.45);
      backRightWall.receiveShadow = true;
      this.scene.add(backRightWall);

      const topHeader = new T.Mesh(new T.BoxGeometry(2.4, 0.75, 0.24), wallMat);
      topHeader.position.set(0.0, 3.22, -2.45);
      this.scene.add(topHeader);

      const windowBase = new T.Mesh(new T.BoxGeometry(2.2, 0.85, 0.26), wallMat);
      windowBase.position.set(0.0, 0.425, -2.45);
      windowBase.receiveShadow = true;
      this.scene.add(windowBase);

      // Moldura amadeirada da janela da sala
      const woodMat = new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
      const winSill = new T.Mesh(new T.BoxGeometry(2.35, 0.07, 0.34), woodMat);
      winSill.position.set(0.0, 0.88, -2.42);
      this.scene.add(winSill);

      // Ceu azul e predios coloridos visiveis pela janela
      [0xfdba74, 0xfde047, 0x38bdf8, 0xfb7185].forEach((col, i) => {
        const bld = new T.Mesh(new T.BoxGeometry(1.7, 3.5 + (i % 2) * 1.1, 1.6), new T.MeshStandardMaterial({ color: col, roughness: 0.78 }));
        bld.position.set(-2.4 + i * 1.65, 1.5, -7.8 - (i % 2) * 1.2);
        this.scene.add(bld);
      });

      // Sofa ao fundo esquerdo (z = -1.65, longe dos personagens em z ~ 0.1..0.6)
      const sofaMat = new T.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.82 });
      const sofaBase = new T.Mesh(new T.BoxGeometry(1.75, 0.38, 0.76), sofaMat);
      sofaBase.position.set(-0.85, 0.19, -1.65);
      sofaBase.castShadow = true;
      sofaBase.receiveShadow = true;
      this.scene.add(sofaBase);

      const sofaBack = new T.Mesh(new T.BoxGeometry(1.75, 0.52, 0.18), sofaMat);
      sofaBack.position.set(-0.85, 0.60, -1.94);
      sofaBack.castShadow = true;
      this.scene.add(sofaBack);

      [-1.65, -0.05].forEach((ax) => {
        const arm = new T.Mesh(new T.BoxGeometry(0.16, 0.32, 0.76), sofaMat);
        arm.position.set(ax, 0.45, -1.65);
        arm.castShadow = true;
        this.scene.add(arm);
      });

      // Mesinha lateral direita com Gaiola Dourada ABERTA (em x = 1.22, z = -1.45)
      const standTop = new T.Mesh(new T.CylinderGeometry(0.32, 0.28, 0.05, 18), woodMat);
      standTop.position.set(1.22, 0.68, -1.45);
      standTop.castShadow = true;
      this.scene.add(standTop);
      const standLeg = new T.Mesh(new T.CylinderGeometry(0.06, 0.10, 0.68, 12), woodMat);
      standLeg.position.set(1.22, 0.34, -1.45);
      this.scene.add(standLeg);

      // Gaiola dourada com portinha aberta
      const goldMat = new T.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.68, roughness: 0.28 });
      const cageGroup = new T.Group();
      cageGroup.position.set(1.22, 0.71, -1.45);
      const cageBase = new T.Mesh(new T.CylinderGeometry(0.24, 0.25, 0.06, 18), goldMat);
      cageBase.position.y = 0.03;
      cageGroup.add(cageBase);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        if (k === 1 || k === 2) continue; // abertura frontal bem visivel!
        const bar = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.42, 6), goldMat);
        bar.position.set(Math.cos(a) * 0.21, 0.26, Math.sin(a) * 0.21);
        cageGroup.add(bar);
      }
      const cageDome = new T.Mesh(new T.TorusGeometry(0.21, 0.014, 8, 20), goldMat);
      cageDome.rotation.x = Math.PI / 2;
      cageDome.position.y = 0.47;
      cageGroup.add(cageDome);
      this.scene.add(cageGroup);

      // Vaso decorativo com planta ao canto esquerdo
      const pot = new T.Mesh(new T.CylinderGeometry(0.18, 0.14, 0.32, 14), new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 }));
      pot.position.set(-2.05, 0.16, -1.55);
      this.scene.add(pot);
      const leafMat = new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.62 });
      [0, 1.2, 2.5, 3.9, 5.1].forEach((a) => {
        const lf = new T.Mesh(new T.ConeGeometry(0.12, 0.38, 8), leafMat);
        lf.position.set(-2.05 + Math.cos(a) * 0.10, 0.44, -1.55 + Math.sin(a) * 0.10);
        lf.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45);
        this.scene.add(lf);
      });

      // Sombras de contato no piso
      const shMat = new T.MeshBasicMaterial({ color: 0x1e1b18, transparent: true, opacity: 0.26, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.015, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.28, -0.35, 0.55);
      this.camilaShadow = makeShadow(0.26, 0.92, -0.25);
      this.pacocaShadow = makeShadow(0.19, 0.48, 0.22);
      this.birdShadow = makeShadow(0.20, 0.05, 0.0);
    }

    _initCharacters3D(T) {
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.35, VOCE_GROUND_Y, 0.55);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D({ emotion: 'scared', pose: 'idle' });
      this.camila.group.position.set(1.25, CAMILA_GROUND_Y, -0.75);
      this.camila.group.rotation.y = -0.65;
      this.scene.add(this.camila.group);

      this.pacoca = new global.PacocaCachorro3D({ emotion: 'alert', pose: 'idle' });
      this.pacoca.group.position.set(0.48, 0.00, 0.22);
      this.pacoca.group.rotation.y = -0.55;
      this.scene.add(this.pacoca.group);

      // Estrela comica da noite: Periquito 3D rechonchudo e expresivo
      this.bird = new global.Periquito3D({ scale: 1.08 });
      this.bird.group.position.set(0.15, 1.55, -0.35);
      this.scene.add(this.bird.group);
    }

    _buildFeathers(T) {
      this.feathers = [];
      const greenF = new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 });
      const yellowF = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
      const geo = new T.BoxGeometry(0.08, 0.015, 0.032);
      for (let i = 0; i < 16; i++) {
        const f = new T.Mesh(geo, i % 2 === 0 ? greenF : yellowF);
        f.visible = false;
        this.scene.add(f);
        this.feathers.push({ mesh: f, seed: i * 1.17 });
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

      // 1. Camera C1 fluida (B1 isca fechada no rosto de Voce -> B2 dolly-out para sala inteira!)
      const breathCam = Math.sin(time * 1.2) * 0.012;
      let camX = -0.30, camY = 1.30 + breathCam, camZ = 2.05;
      let lookX = -0.34, lookY = 1.18, lookZ = 0.45, fov = 34;

      camX = lerp(camX, 0.18, w12); camY = lerp(camY, 1.48 + breathCam, w12); camZ = lerp(camZ, 4.95, w12);
      lookX = lerp(lookX, 0.12, w12); lookY = lerp(lookY, 1.00, w12); lookZ = lerp(lookZ, -0.35, w12); fov = lerp(fov, 46, w12);

      camX = lerp(camX, -0.04, w23); camY = lerp(camY, 1.46 + breathCam, w23); camZ = lerp(camZ, 4.40, w23);
      lookX = lerp(lookX, -0.05, w23); lookY = lerp(lookY, 1.06, w23); lookZ = lerp(lookZ, 0.15, w23); fov = lerp(fov, 45, w23);

      camX = lerp(camX, 0.25, w34); camY = lerp(camY, 1.44 + breathCam, w34); camZ = lerp(camZ, 4.60, w34);
      lookX = lerp(lookX, 0.20, w34); lookY = lerp(lookY, 0.98, w34); lookZ = lerp(lookZ, 0.0, w34); fov = lerp(fov, 46, w34);

      camX = lerp(camX, -0.05, w45); camY = lerp(camY, 1.40 + breathCam, w45); camZ = lerp(camZ, 4.10, w45);
      lookX = lerp(lookX, -0.05, w45); lookY = lerp(lookY, 1.12, w45); lookZ = lerp(lookZ, 0.35, w45); fov = lerp(fov, 45, w45);

      camX = lerp(camX, 0.08, w56); camY = lerp(camY, 1.46 + breathCam, w56); camZ = lerp(camZ, 4.55, w56);
      lookX = lerp(lookX, 0.02, w56); lookY = lerp(lookY, 1.06, w56); lookZ = lerp(lookZ, 0.20, w56); fov = lerp(fov, 46, w56);

      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // 2. Trajetorias 100% aterradas em piso solido (VOCE_GROUND_Y = -0.37, CAMILA_GROUND_Y = -0.27)
      const chaseStep = smoothstep((time - (b[2] - 0.1)) / 1.25);
      const backCenter = smoothstep((time - (b[4] - 0.1)) / 1.15);
      const voceStride = Math.sin(chaseStep * Math.PI) * 0.80 + Math.sin(backCenter * Math.PI) * 0.72;
      const voceX = lerp(-0.35, -0.05, chaseStep) + backCenter * (-0.38 - (-0.05));
      const voceZ = lerp(0.55, 0.30, chaseStep) + backCenter * (0.48 - 0.30);
      let voceRotY = lerp(0.05, 0.42, w12);
      voceRotY = lerp(voceRotY, 0.55, w23);
      voceRotY = lerp(voceRotY, 0.25, w45);
      voceRotY = lerp(voceRotY, 0.06, w56);

      this.voce.group.position.set(voceX, VOCE_GROUND_Y, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voceShadow.position.set(voceX, 0.015, voceZ + 0.02);

      const camilaStep = smoothstep((time - (b[1] - 0.1)) / 1.25);
      const camilaClose = smoothstep((time - (b[3] - 0.15)) / 1.25);
      const camilaStride = Math.sin(camilaStep * Math.PI) * 0.72 + Math.sin(camilaClose * Math.PI) * 0.68;
      const camPosX = lerp(1.25, 0.88, camilaStep) + camilaClose * (0.72 - 0.88);
      const camPosZ = lerp(-0.75, -0.35, camilaStep) + camilaClose * (-0.15 - (-0.35));
      this.camila.group.position.set(camPosX, CAMILA_GROUND_Y, camPosZ);
      this.camila.group.rotation.y = lerp(-0.62, -0.52, w34) * (1 - w56) - 0.28 * w56;
      this.camilaShadow.position.set(camPosX, 0.015, camPosZ + 0.02);

      // 3. Animacao facial e bracos C1
      const voceEmotion = time < b[1] ? 'smirk' : (time < b[4] ? 'shocked' : (time < b[5] ? 'determined' : 'shocked'));
      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');
      this.voce.setLook(w56 > 0.45 ? 0.0 : Math.sin(time * 2.2) * 0.28, w56 > 0.5 ? -0.35 : 0.08);
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0.06);
      this.voce.update(1 / 60, time);

      if (voceStride > 0.005 && this.voce.legL && this.voce.legR) {
        const phi = time * 6.0;
        const amp = 0.48 * voceStride;
        this.voce.legL.root.rotation.x = lerp(this.voce.legL.root.rotation.x, Math.sin(phi) * amp, voceStride);
        this.voce.legR.root.rotation.x = lerp(this.voce.legR.root.rotation.x, Math.sin(phi + Math.PI) * amp, voceStride);
        this.voce.legL.knee.rotation.x = lerp(this.voce.legL.knee.rotation.x, Math.max(0.08, -Math.cos(phi) * 0.45), voceStride);
        this.voce.legR.knee.rotation.x = lerp(this.voce.legR.knee.rotation.x, Math.max(0.08, -Math.cos(phi + Math.PI) * 0.45), voceStride);
      }

      // Bracos tentando agarrar o periquito em B3/B4
      const reachW = clamp(w23 * (1 - w45), 0, 1);
      if (reachW > 0.01 && this.voce.shoulderL && this.voce.shoulderR) {
        const swayArm = Math.sin(time * 4.5) * 0.18 * reachW;
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, -1.25 + swayArm, reachW);
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -1.25 - swayArm, reachW);
      }

      this.camila.setEmotion(w56 > 0.45 ? 'happy' : 'scared');
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : 0.05);
      this.camila.update(1 / 60, time);
      if (camilaStride > 0.005 && this.camila.legL && this.camila.legR) {
        const cphi = time * 5.6;
        this.camila.legL.root.rotation.x = lerp(this.camila.legL.root.rotation.x, Math.sin(cphi) * 0.40 * camilaStride, camilaStride);
        this.camila.legR.root.rotation.x = lerp(this.camila.legR.root.rotation.x, Math.sin(cphi + Math.PI) * 0.40 * camilaStride, camilaStride);
      }

      // Pacoca atento no piso y=0.00 com salto comico em B4/B5
      const barkEnv = clamp(smoothstep((time - (b[4] + 0.6)) / 0.35) * (1 - smoothstep((time - (b[5] + 0.4)) / 0.5)), 0, 1);
      const pacHop = barkEnv * Math.pow(Math.max(0, Math.sin(time * 6.8)), 1.5) * 0.11;
      const pacX = lerp(0.48, 0.25, w45);
      const pacZ = lerp(0.22, 0.52, w45);
      this.pacoca.group.position.set(pacX, pacHop, pacZ);
      this.pacoca.group.rotation.y = lerp(-0.55, -0.25, w45);
      this.pacocaShadow.position.set(pacX, 0.015, pacZ);
      this.pacocaShadow.scale.setScalar(1.0 - pacHop * 1.1);
      this.pacoca.isBarking = barkEnv > 0.25;
      this.pacoca.mouthOpen = 0.05 + barkEnv * Math.abs(Math.sin(time * 9.5)) * 0.45;
      this.pacoca.update(1 / 60, time);

      // 4. Trajetoria do Periquito 3D (B1 escondido -> B2 sai da gaiola -> B3 circula Voce -> B4 acalma -> B5 avanca na lente -> B6 pousa NO TOPO DA CABECA DE VOCE!)
      let bx = 1.22, by = 1.35, bz = -1.45, bry = -0.5, flap = 0.0;
      const flyLoop = smoothstep((time - (b[1] - 0.1)) / 0.9);
      const swoop = Math.sin(time * 3.0);
      const swoopZ = Math.cos(time * 2.4);

      bx = lerp(bx, 0.15 + swoop * 0.45, flyLoop);
      by = lerp(by, 1.52 + Math.sin(time * 4.2) * 0.16, flyLoop);
      bz = lerp(bz, 0.05 + swoopZ * 0.28, flyLoop);
      bry = lerp(bry, Math.atan2(Math.cos(time * 3.0), -Math.sin(time * 2.4)), flyLoop);
      flap = lerp(0.0, 1.0, flyLoop);

      // B4: acalma um instante proximo das maos de Voce
      const calmW = smoothstep((time - (b[3] + 0.35)) / 0.85) * (1 - w45);
      bx = lerp(bx, voceX + 0.12, calmW * 0.72);
      by = lerp(by, 1.18, calmW * 0.72);
      bz = lerp(bz, voceZ + 0.38, calmW * 0.72);
      flap = lerp(flap, 0.22, calmW);

      // B5: mergulho direto na direcao da lente (bem enquadrado no centro!)
      const lensDive = smoothstep((time - (b[4] + 0.8)) / 0.85) * (1 - w56);
      bx = lerp(bx, 0.02, lensDive);
      by = lerp(by, 1.26 + Math.sin(time * 6.0) * 0.08, lensDive);
      bz = lerp(bz, 1.65, lensDive);
      bry = lerp(bry, 0.04, lensDive);
      flap = Math.max(flap, lensDive);

      // B6: pousa COM OS PES TOCANDO O CABELO do Voce (y = 1.24, zero flutuacao!)
      bx = lerp(bx, voceX, w56);
      by = lerp(by, 1.24, w56);
      bz = lerp(bz, voceZ + 0.03, w56);
      bry = lerp(bry, 0.08 + Math.sin(time * 2.5) * 0.12, w56);
      flap = lerp(flap, 0.26, w56);

      this.bird.group.visible = time >= b[1] - 0.35;
      this.bird.group.position.set(bx, by, bz);
      this.bird.group.rotation.y = bry;
      this.bird.flapSpeed = flap;
      this.bird.emotion = calmW > 0.55 ? 'sleepy' : 'chaotic';
      this.bird.beakOpen = (time > b[1] && Math.sin(time * 7.5) > 0.3) ? 0.8 : 0.1;
      this.bird.update(1 / 60, time);

      this.birdShadow.visible = this.bird.group.visible;
      this.birdShadow.position.set(bx, 0.015, bz);
      this.birdShadow.scale.setScalar(clamp(1.2 - by * 0.28, 0.35, 1.0));

      // Penas caindo suavemente em B5 & B6!
      const featherStrength = smoothstep((time - (b[4] + 0.7)) / 0.65);
      for (let i = 0; i < this.feathers.length; i++) {
        const ft = this.feathers[i];
        ft.mesh.visible = featherStrength > 0.05;
        if (ft.mesh.visible) {
          const cycle = ((time * 0.55 + ft.seed) % 1);
          ft.mesh.position.set(
            bx + Math.sin(time * 2.4 + ft.seed) * 0.55,
            lerp(2.15, 0.12, cycle),
            bz + Math.cos(time * 1.9 + ft.seed) * 0.42
          );
          ft.mesh.rotation.set(time * 2.2 + ft.seed, time * 1.8, Math.sin(time * 3 + ft.seed));
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep03PeriquitoVizinha3D = Ep03PeriquitoVizinha3D;
})(typeof window !== 'undefined' ? window : this);
