(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function easeInOutCubic(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function easeOutCubic(t) {
    t = clamp(t, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }
  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  // Offset físico exato para que a sola do chinelo do VoceMorador3D toque y = 0.00 sem flutuar!
  const VOCE_GROUND_Y = -0.37;

  class Ep02Cacetinho3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('Three.js não carregado');
      this.T = T;
      this.width = opts.highRes ? 1080 : 720;
      this.height = opts.highRes ? 1920 : 1280;

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
      this.scene.background = new T.Color(0xfff4e0);
      this.scene.fog = new T.FogExp2(0xfff4e0, 0.008);

      this.camera = new T.PerspectiveCamera(40, 1080 / 1920, 0.08, 100);

      this._initLights(T);
      this._buildKitchenSet3D(T);
      this._initCharacters3D(T);
      this._buildGiantBread3D(T);
      this._initSteamParticles(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP02_DUPLO_TIMELINE ? global.EP02_DUPLO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 3.5, 7.5, 12.0, 16.5, 20.5];
    }

    _getDuration() {
      const tl = this._getTimeline();
      return (tl && tl.duration) ? tl.duration : 24.0;
    }

    _getVoiceLip(time) {
      const tl = this._getTimeline();
      if (!tl || !Array.isArray(tl.dialogues)) return -1;
      for (let i = 0; i < tl.dialogues.length; i++) {
        const d = tl.dialogues[i];
        if (time >= d.start && time <= d.end && Array.isArray(d.lip_sync) && d.lip_sync.length > 0) {
          const idx = Math.floor((time - d.start) * 60);
          return d.lip_sync[clamp(idx, 0, d.lip_sync.length - 1)] || 0;
        }
      }
      return 0;
    }

    _initLights(T) {
      this.scene.add(new T.HemisphereLight(0xfff7ed, 0xc2a37a, 1.05));
      const sun = new T.DirectionalLight(0xfff1d6, 1.55);
      sun.position.set(2.5, 8.5, 4.5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -5.5; sun.shadow.camera.right = 5.5;
      sun.shadow.camera.top = 5.5; sun.shadow.camera.bottom = -5.5;
      this.scene.add(sun);

      const ovenGlow = new T.PointLight(0xff8c32, 1.0, 7);
      ovenGlow.position.set(-1.6, 1.1, -2.0);
      this.scene.add(ovenGlow);
    }

    _buildKitchenSet3D(T) {
      // Piso claro da cozinha + grade de azulejos para leitura física imediata do chão
      const floor = new T.Mesh(
        new T.PlaneGeometry(18, 18),
        new T.MeshStandardMaterial({ color: 0xf3e5ab, roughness: 0.78 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      const tileGrid = new T.GridHelper(16, 20, 0xd6c38d, 0xe5d4a0);
      tileGrid.position.y = 0.002;
      this.scene.add(tileGrid);

      // Parede de fundo creme + rodapé para marcar a junção parede-piso
      const wallMat = new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 });
      const backWall = new T.Mesh(new T.BoxGeometry(14, 6, 0.3), wallMat);
      backWall.position.set(0, 3, -3.2);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const baseboard = new T.Mesh(
        new T.BoxGeometry(14, 0.14, 0.34),
        new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 })
      );
      baseboard.position.set(0, 0.07, -3.18);
      this.scene.add(baseboard);

      // Janela azul céu (onde Dona Camila aparece)
      const skyWin = new T.Mesh(
        new T.PlaneGeometry(2.6, 1.9),
        new T.MeshBasicMaterial({ color: 0x67d5ff })
      );
      skyWin.position.set(2.3, 1.75, -3.02);
      this.scene.add(skyWin);

      const frameMat = new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
      const sill = new T.Mesh(new T.BoxGeometry(2.8, 0.14, 0.35), frameMat);
      sill.position.set(2.3, 0.78, -2.95);
      this.scene.add(sill);

      // Forno de padaria no fundo esquerdo (piso y=0)
      const ovenBody = new T.Mesh(
        new T.BoxGeometry(2.1, 2.1, 1.15),
        new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.48, metalness: 0.28 })
      );
      ovenBody.position.set(-1.85, 1.05, -2.4);
      ovenBody.castShadow = true;
      ovenBody.receiveShadow = true;
      this.scene.add(ovenBody);

      const ovenGlass = new T.Mesh(
        new T.PlaneGeometry(1.35, 0.82),
        new T.MeshStandardMaterial({ color: 0xff7b29, emissive: 0xff5500, emissiveIntensity: 0.7 })
      );
      ovenGlass.position.set(-1.85, 1.2, -1.81);
      this.scene.add(ovenGlass);

      // Bancada / Ilha central (recuada em Z=-0.25)
      const counterBase = new T.Mesh(
        new T.BoxGeometry(2.1, 0.92, 1.05),
        new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 })
      );
      counterBase.position.set(0.38, 0.46, -0.25);
      counterBase.castShadow = true;
      counterBase.receiveShadow = true;
      this.scene.add(counterBase);

      const counterTop = new T.Mesh(
        new T.BoxGeometry(2.25, 0.08, 1.18),
        new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
      );
      counterTop.position.set(0.38, 0.95, -0.25);
      counterTop.receiveShadow = true;
      this.scene.add(counterTop);

      // Saco de papel kraft fechado em B1
      this.breadBag = new T.Mesh(
        new T.BoxGeometry(0.95, 0.75, 0.65),
        new T.MeshStandardMaterial({ color: 0xd99b52, roughness: 0.9 })
      );
      this.breadBag.position.set(0.42, 1.36, -0.25);
      this.breadBag.castShadow = true;
      this.scene.add(this.breadBag);

      // Sombras de contato suaves no chão sob Você e Paçoca (ancoram os pés visualmente no chão)
      const contactMat = new T.MeshBasicMaterial({ color: 0x1e1b18, transparent: true, opacity: 0.28, depthWrite: false });
      this.voceShadowDisc = new T.Mesh(new T.CircleGeometry(0.28, 24), contactMat);
      this.voceShadowDisc.rotation.x = -Math.PI / 2;
      this.voceShadowDisc.position.set(-0.68, 0.005, 0.45);
      this.scene.add(this.voceShadowDisc);

      this.pacocaShadowDisc = new T.Mesh(new T.CircleGeometry(0.20, 20), contactMat);
      this.pacocaShadowDisc.rotation.x = -Math.PI / 2;
      this.pacocaShadowDisc.position.set(0.88, 0.005, 0.68);
      this.scene.add(this.pacocaShadowDisc);
    }

    _initCharacters3D(T) {
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.68, VOCE_GROUND_Y, 0.45);
      this.scene.add(this.voce.group);

      // Espátula com manteiga presa na mão direita para a cena B4 (sem teletransporte!)
      this.butterKnife = new T.Group();
      const handle = new T.Mesh(
        new T.CylinderGeometry(0.016, 0.018, 0.14, 12),
        new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
      );
      handle.rotation.x = Math.PI / 2;
      handle.position.z = 0.05;
      this.butterKnife.add(handle);
      const blade = new T.Mesh(
        new T.BoxGeometry(0.036, 0.012, 0.22),
        new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.25 })
      );
      blade.position.z = 0.20;
      this.butterKnife.add(blade);
      const butterTip = new T.Mesh(
        new T.BoxGeometry(0.044, 0.022, 0.08),
        new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
      );
      butterTip.position.set(0, 0.01, 0.28);
      this.butterKnife.add(butterTip);
      this.butterKnife.visible = false;
      if (this.voce.shoulderR && this.voce.shoulderR.hand) {
        this.voce.shoulderR.hand.add(this.butterKnife);
      }

      // Dona Camila firmemente ancorada no piso (CAMILA_GROUND_Y = -0.27 -> sola em y=0.00!)
      this.camila = new global.DonaCamila3D();
      this.camila.group.position.set(2.3, -0.27, -2.55);
      this.camila.group.rotation.y = -0.35;
      this.scene.add(this.camila.group);

      // Paçoca firmemente apoiado no piso y=0
      this.pacoca = new global.PacocaCachorro3D();
      this.pacoca.group.position.set(0.88, 0.0, 0.68);
      this.pacoca.group.rotation.y = -0.75;
      this.scene.add(this.pacoca.group);
    }

    _buildGiantBread3D(T) {
      this.breadRoot = new T.Group();
      this.breadPivot = new T.Group();

      const basket = new T.Mesh(
        new T.CylinderGeometry(0.68, 0.54, 0.26, 20),
        new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
      );
      basket.position.y = 0.13;
      basket.castShadow = true;
      this.breadPivot.add(basket);

      const crustMat = new T.MeshStandardMaterial({ color: 0xd97706, roughness: 0.52 });
      const breadBody = new T.Mesh(new T.CapsuleGeometry(0.36, 0.78, 12, 24), crustMat);
      breadBody.rotation.z = Math.PI / 2;
      breadBody.position.y = 0.48;
      breadBody.castShadow = true;
      this.breadPivot.add(breadBody);

      const slitMat = new T.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.65 });
      const slit = new T.Mesh(new T.BoxGeometry(0.75, 0.10, 0.14), slitMat);
      slit.position.set(0, 0.80, 0.04);
      slit.rotation.x = 0.2;
      this.breadPivot.add(slit);

      this.butterLayer = new T.Mesh(
        new T.BoxGeometry(0.68, 0.055, 0.24),
        new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.15, metalness: 0.1 })
      );
      this.butterLayer.position.set(0, 0.85, 0.04);
      this.butterLayer.visible = false;
      this.breadPivot.add(this.butterLayer);

      this.breadRoot.add(this.breadPivot);
      this.breadRoot.position.set(0.24, 0.99, 0.02);
      this.breadRoot.scale.setScalar(0.78);
      this.scene.add(this.breadRoot);
    }

    _initSteamParticles(T) {
      this.steam = [];
      const mat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 });
      const geo = new T.SphereGeometry(0.075, 8, 8);
      for (let i = 0; i < 12; i++) {
        const m = new T.Mesh(geo, mat);
        m.visible = false;
        this.scene.add(m);
        this.steam.push({ mesh: m, seed: i * 0.83 });
      }
    }

    _updateSteam(t, active) {
      for (let i = 0; i < this.steam.length; i++) {
        const s = this.steam[i];
        s.mesh.visible = active;
        if (!active) continue;
        const ph = (t * 0.65 + s.seed) % 1.0;
        s.mesh.position.set(
          0.24 + Math.sin(t * 2.1 + s.seed) * 0.24,
          1.60 + ph * 1.10,
          0.02 + Math.cos(t * 1.7 + s.seed) * 0.14
        );
        const sc = 0.55 + ph * 1.05;
        s.mesh.scale.set(sc, sc, sc);
      }
    }

    renderAt(t) {
      const time = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const totalDur = this._getDuration();
      const realLip = this._getVoiceLip(time);

      // Pesos suaves C¹ (smoothstep) entre as 6 cenas (zero picos de aceleração!)
      const w12 = smoothstep((time - (b[1] - 0.20)) / 1.45); // B1 -> B2 (Revelação cinematográfica suave)
      const w23 = smoothstep((time - (b[2] - 0.15)) / 1.05); // B2 -> B3 (Caminha & Aperta)
      const w34 = smoothstep((time - (b[3] - 0.15)) / 1.00); // B3 -> B4 (Passa Manteiga)
      const w45 = smoothstep((time - (b[4] - 0.15)) / 1.10); // B4 -> B5 (Vizinha & Paçoca)
      const w56 = smoothstep((time - (b[5] - 0.15)) / 1.15); // B5 -> B6 (Final Aberto)

      // Câmera Steadicam contínua por mistura cumulativa (zero degrau de velocidade!)
      const breathCam = Math.sin(time * 1.1) * 0.015;
      let camX = -0.60 - 0.06 * smoothstep(time / Math.max(1, b[1]));
      let camY = 1.18 + breathCam;
      let camZ = 2.25 - 0.25 * smoothstep(time / Math.max(1, b[1]));
      let lookX = -0.68, lookY = 1.08, lookZ = 0.45, fov = 35;

      camX = lerp(camX, -0.06, w12); camY = lerp(camY, 1.48 + breathCam, w12); camZ = lerp(camZ, 5.25, w12);
      lookX = lerp(lookX, -0.04, w12); lookY = lerp(lookY, 0.92, w12); lookZ = lerp(lookZ, 0.08, w12); fov = lerp(fov, 45, w12);

      camX = lerp(camX, -0.14, w23); camY = lerp(camY, 1.44 + breathCam, w23); camZ = lerp(camZ, 4.85, w23);
      lookX = lerp(lookX, -0.02, w23); lookY = lerp(lookY, 0.94, w23); lookZ = lerp(lookZ, 0.06, w23);

      camX = lerp(camX, 0.12, w34); camY = lerp(camY, 1.50 + breathCam, w34); camZ = lerp(camZ, 4.65, w34);
      lookX = lerp(lookX, 0.08, w34); lookY = lerp(lookY, 0.96, w34); lookZ = lerp(lookZ, 0.04, w34);

      camX = lerp(camX, 1.62, w45); camY = lerp(camY, 1.48 + breathCam, w45); camZ = lerp(camZ, 3.25, w45);
      lookX = lerp(lookX, 1.72, w45); lookY = lerp(lookY, 1.05, w45); lookZ = lerp(lookZ, -1.55, w45);

      camX = lerp(camX, 0.04, w56); camY = lerp(camY, 1.46 + breathCam, w56); camZ = lerp(camZ, 5.35, w56);
      lookX = lerp(lookX, 0.02, w56); lookY = lerp(lookY, 0.92, w56); lookZ = lerp(lookZ, 0.12, w56); fov = lerp(fov, 46, w56);

      // Trajetória contínua de Você (passos reais em B2->B3 e B4->B5 com ramp-in/ramp-out suave!)
      const walkToBread = smoothstep((time - (b[2] - 0.10)) / 1.05);
      const walkBack = smoothstep((time - (b[4] + 0.45)) / 1.15);
      const walkStride = Math.sin(walkToBread * Math.PI) * 0.95 + Math.sin(walkBack * Math.PI) * 0.85;

      const voceX = lerp(-0.68, -0.48, walkToBread) + (walkBack * (-0.64 - (-0.48)));
      const voceZ = lerp(0.54, 0.56, walkToBread) + (walkBack * (0.50 - 0.56));
      let voceRotY = lerp(0.16, 0.50, w12);
      voceRotY = lerp(voceRotY, 1.18, walkToBread);
      voceRotY = lerp(voceRotY, 0.34, walkBack);

      const lookYaw = lerp(0.0, 0.24, w12) * (1 - w23) + 0.12 * w23 * (1 - w45) - 0.08 * w56;

      // Saco de papel e pão (fade de escala elástica suave em B2)
      const popT = time - b[1];
      const bagVisible = time < b[1] + 0.15;
      const breadVisible = time >= b[1] - 0.05;
      const pop = (popT >= 0 && popT < 0.65) ? Math.sin((popT / 0.65) * Math.PI) * 0.16 : 0;

      // Peso de aperto de pão (B3) e espátula de manteiga (B4) com rampas de 0.70s (suave sem picos!)
      const squeezeWeight = clamp(smoothstep((time - (b[2] + 0.65)) / 0.70) * (1 - smoothstep((time - (b[3] - 0.45)) / 0.70)), 0, 1);
      const knifeWeight = clamp(smoothstep((time - (b[3] - 0.25)) / 0.70) * (1 - smoothstep((time - (b[4] - 0.40)) / 0.70)), 0, 1);

      const sqPulse = squeezeWeight > 0.01 ? Math.pow(Math.max(0, Math.sin((time - b[2]) * 5.2)), 1.4) * 0.11 * squeezeWeight : 0;
      const breadSx = 1 - pop * 0.35 + sqPulse * 0.55;
      const breadSy = 1 + pop - sqPulse;
      const breadSz = 1 - pop * 0.35 + sqPulse * 0.55;

      const butterSpread = clamp(smoothstep((time - (b[3] + 0.15)) / Math.max(1.2, (b[4] - b[3]) * 0.72)), 0, 1);
      const butterVisible = butterSpread > 0.02;

      const emotion = time < b[1] ? 'smirk' : (w23 > 0.4 && w34 < 0.5 ? 'determined' : 'happy');
      const pacocaActive = smoothstep((time - (b[4] - 0.2)) / 0.5);
      const pacocaHop = pacocaActive * Math.pow(Math.max(0, Math.sin(time * 7.2)), 1.5) * 0.11;

      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      this.breadBag.visible = bagVisible;
      this.breadRoot.visible = breadVisible;
      this.breadPivot.scale.set(breadSx, breadSy, breadSz);
      this.butterLayer.visible = butterVisible;
      this.butterLayer.scale.set(Math.max(0.05, butterSpread), 1, 1);
      this._updateSteam(time, breadVisible);

      // Você 100% ancorado no chão (VOCE_GROUND_Y = -0.37) sem chamadas destrutivas de stop()!
      this.voce.group.position.set(voceX, VOCE_GROUND_Y, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voceShadowDisc.position.set(voceX, 0.005, voceZ + 0.04);

      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(emotion);
      this.voce.setPose('gesturing_urgent');
      this.voce.setLook(lookYaw, 0);
      this.voce.setMouthOpen(realLip >= 0 ? realLip : 0.08);
      this.voce.update(1 / 60, time);

      // Sobrepõe envelope orgânico de passada (pernas + quadril nunca dão tranco ao iniciar/parar de andar!)
      if (walkStride > 0.005 && this.voce.legL && this.voce.legR) {
        const phi = time * 6.4;
        const amp = 0.56 * walkStride;
        const lA = Math.sin(phi) * amp;
        const rA = Math.sin(phi + Math.PI) * amp;
        this.voce.legL.root.rotation.x = lerp(this.voce.legL.root.rotation.x, lA, walkStride);
        this.voce.legR.root.rotation.x = lerp(this.voce.legR.root.rotation.x, rA, walkStride);
        const lK = Math.max(0, -Math.cos(phi)) * 0.55 * walkStride;
        const rK = Math.max(0, -Math.cos(phi + Math.PI)) * 0.55 * walkStride;
        this.voce.legL.knee.rotation.x = lerp(this.voce.legL.knee.rotation.x, (lA < 0 ? -lA * 0.45 : 0.08) + lK, walkStride);
        this.voce.legR.knee.rotation.x = lerp(this.voce.legR.knee.rotation.x, (rA < 0 ? -rA * 0.45 : 0.08) + rK, walkStride);
        this.voce.pelvis.position.y = 0.82 + Math.abs(Math.cos(phi)) * 0.022 * walkStride;
      }

      // Sobrepõe gesto suave das 2 mãos alcançando acima do tampo até o pão e apertando (B3)
      if (squeezeWeight > 0.005 && this.voce.shoulderL && this.voce.shoulderR) {
        const press = Math.sin((time - b[2]) * 5.2) * 0.09;
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, -1.96 - press, squeezeWeight);
        this.voce.shoulderL.root.rotation.y = lerp(this.voce.shoulderL.root.rotation.y, -0.20, squeezeWeight);
        this.voce.shoulderL.elbow.rotation.x = lerp(this.voce.shoulderL.elbow.rotation.x, -0.26 + press * 0.5, squeezeWeight);
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -1.96 - press, squeezeWeight);
        this.voce.shoulderR.root.rotation.y = lerp(this.voce.shoulderR.root.rotation.y, 0.20, squeezeWeight);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, -0.26 + press * 0.5, squeezeWeight);
      }

      // Sobrepõe movimento suave de espátula passando manteiga no topo do pão (B4)
      if (this.butterKnife) {
        this.butterKnife.visible = knifeWeight > 0.08;
        if (knifeWeight > 0.005 && this.voce.shoulderR) {
          const sweep = Math.sin(time * 4.8);
          this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -2.02 + sweep * 0.12, knifeWeight);
          this.voce.shoulderR.root.rotation.y = lerp(this.voce.shoulderR.root.rotation.y, -0.24 + sweep * 0.26, knifeWeight);
          this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, -0.24 - sweep * 0.10, knifeWeight);
        }
      }

      // Camila reage suavemente na janela
      const camilaReact = clamp(smoothstep((time - (b[4] - 0.3)) / 0.5) * (1 - smoothstep((time - (b[5] + 0.3)) / 0.5)), 0, 1);
      this.camila.setEmotion('scared');
      this.camila.setMouthOpen(0.18 + camilaReact * (0.42 + Math.abs(Math.sin(time * 6.5)) * 0.22));
      this.camila.update(1 / 60, time);

      // Paçoca late com pulo elástico e sombra ligada no chão
      this.pacoca.isBarking = pacocaActive > 0.3;
      this.pacoca.mouthOpen = 0.08 + pacocaActive * (0.28 + Math.abs(Math.sin(time * 10.5)) * 0.38);
      this.pacoca.group.position.set(0.88, pacocaHop, 0.68);
      this.pacocaShadowDisc.scale.setScalar(1.0 - pacocaHop * 1.4);
      this.pacoca.update(1 / 60, time);

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep02Cacetinho3D = Ep02Cacetinho3D;
})(typeof window !== 'undefined' ? window : globalThis);
