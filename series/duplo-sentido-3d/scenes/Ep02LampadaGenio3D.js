/**
 * Ep02LampadaGenio3D.js -- Ep 02 Renovado: "A Lampada Magica & Os 3 Pedidos Ao Pe da Letra"
 * Cenario 3D 100% inedito: Terraco Ensolarado do Predio (ladrilho terracota, pergolado, tapete persa e mesa esculpida).
 * Zero flutuacao: VoceMorador3D em VOCE_GROUND_Y = -0.37, DonaCamila3D em CAMILA_GROUND_Y = -0.27, Pacoca em y = 0.00.
 * Fluidez C1 auditavel frame a frame em 60fps.
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function smoothstep(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  // Solas exatas em y = 0.00 sem flutuar:
  const VOCE_GROUND_Y = -0.37;
  const CAMILA_GROUND_Y = -0.27;

  class Ep02LampadaGenio3D {
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
      this.renderer.toneMappingExposure = 1.12;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x87ceeb);
      this.scene.fog = new T.FogExp2(0xdbeafe, 0.012);

      this.camera = new T.PerspectiveCamera(40, 1080 / 1920, 0.08, 120);

      this._initLights(T);
      this._buildTerraceEnvironment3D(T);
      this._initCharacters3D(T);
      this._buildComedyProps3D(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP02_GENIO_TIMELINE ? global.EP02_GENIO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) {
        return tl.beat_starts;
      }
      return [0.0, 4.5, 9.0, 14.0, 21.0, 26.0];
    }

    _getDuration() {
      const tl = this._getTimeline();
      return (tl && tl.duration) ? tl.duration : 32.0;
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
      this.scene.add(new T.AmbientLight(0xfffbeb, 0.92));

      const hemi = new T.HemisphereLight(0xbae6fd, 0xd97706, 0.78);
      hemi.position.set(0, 12, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 1.85);
      sun.position.set(4.5, 9.5, 6.2);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 30;
      sun.shadow.camera.left = -5;
      sun.shadow.camera.right = 5;
      sun.shadow.camera.top = 5;
      sun.shadow.camera.bottom = -5;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      const lampGlow = new T.PointLight(0x38bdf8, 1.15, 5.0);
      lampGlow.position.set(0.45, 1.35, 0.05);
      this.scene.add(lampGlow);
    }

    _buildTerraceEnvironment3D(T) {
      // Piso terracota solido do terraco em y = 0.00
      const floor = new T.Mesh(
        new T.PlaneGeometry(24, 24),
        new T.MeshStandardMaterial({ color: 0xe6ccb2, roughness: 0.82 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      const tileGrid = new T.GridHelper(16, 20, 0xb08968, 0xd4b294);
      tileGrid.position.y = 0.002;
      this.scene.add(tileGrid);

      // Tapete decorado no centro onde acontecem os pedidos
      const rugOuter = new T.Mesh(
        new T.BoxGeometry(2.65, 0.012, 1.85),
        new T.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.92 })
      );
      rugOuter.position.set(-0.22, 0.006, 0.22);
      rugOuter.receiveShadow = true;
      this.scene.add(rugOuter);

      const rugInner = new T.Mesh(
        new T.BoxGeometry(2.25, 0.014, 1.45),
        new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.88 })
      );
      rugInner.position.set(-0.22, 0.007, 0.22);
      rugInner.receiveShadow = true;
      this.scene.add(rugInner);

      // Mureta perimetral creme do terraco + pingadeira marrom + pergolado de madeira
      const wallMat = new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.84 });
      const woodMat = new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
      const trimMat = new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.68 });

      const backParapet = new T.Mesh(new T.BoxGeometry(10.0, 0.92, 0.32), wallMat);
      backParapet.position.set(-0.4, 0.46, -2.95);
      backParapet.castShadow = true;
      backParapet.receiveShadow = true;
      this.scene.add(backParapet);

      const coping = new T.Mesh(new T.BoxGeometry(10.2, 0.09, 0.38), trimMat);
      coping.position.set(-0.4, 0.96, -2.95);
      this.scene.add(coping);

      // Parede direita com portal aberto por onde Camila e Pacoca entram
      const doorPierR = new T.Mesh(new T.BoxGeometry(1.1, 2.9, 0.32), wallMat);
      doorPierR.position.set(2.85, 1.45, -1.75);
      doorPierR.castShadow = true;
      this.scene.add(doorPierR);

      const archLintel = new T.Mesh(new T.BoxGeometry(2.5, 0.45, 0.34), trimMat);
      archLintel.position.set(1.75, 2.72, -1.75);
      this.scene.add(archLintel);

      // Pilares de madeira do pergolado ao fundo esquerdo/direito
      [[-2.2, -2.85], [0.65, -2.85], [0.65, -1.75]].forEach(([px, pz]) => {
        const col = new T.Mesh(new T.BoxGeometry(0.18, 2.9, 0.18), woodMat);
        col.position.set(px, 1.45, pz);
        col.castShadow = true;
        this.scene.add(col);
      });
      for (let i = -3; i <= 3; i++) {
        const beam = new T.Mesh(new T.BoxGeometry(3.4, 0.10, 0.10), woodMat);
        beam.position.set(-0.75, 2.95, -2.35 + i * 0.22);
        this.scene.add(beam);
      }

      // Predios vizinhos e copas de palmeiras FORA da mureta (z < -6)
      const skyBuildingColors = [0xfdba74, 0x93c5fd, 0xfde047, 0xc4b5fd];
      for (let i = 0; i < 6; i++) {
        const b = new T.Mesh(
          new T.BoxGeometry(2.2, 4.2 + (i % 3) * 1.4, 2.0),
          new T.MeshStandardMaterial({ color: skyBuildingColors[i % skyBuildingColors.length], roughness: 0.78 })
        );
        b.position.set(-6.5 + i * 2.6, 1.8, -8.5 - (i % 2) * 1.6);
        this.scene.add(b);
      }
      const cloudMat = new T.MeshBasicMaterial({ color: 0xffffff });
      [[-2.5, 4.4, -12], [1.8, 5.1, -14], [4.2, 4.0, -11]].forEach(([cx, cy, cz]) => {
        const cg = new T.Group();
        cg.position.set(cx, cy, cz);
        [0, 0.55, -0.55].forEach((ox, k) => {
          const p = new T.Mesh(new T.SphereGeometry(k === 0 ? 0.68 : 0.48, 12, 10), cloudMat);
          p.position.set(ox, k === 0 ? 0.15 : 0, 0);
          p.scale.set(1.2, 0.72, 0.7);
          cg.add(p);
        });
        this.scene.add(cg);
      });

      // Mesinha esculpida apoiada firmemente no tapete (topo exato y = 0.68)
      const pedBase = new T.Mesh(new T.CylinderGeometry(0.24, 0.30, 0.08, 16), woodMat);
      pedBase.position.set(0.42, 0.04, -0.10);
      pedBase.castShadow = true;
      this.scene.add(pedBase);

      const pedCol = new T.Mesh(new T.CylinderGeometry(0.085, 0.12, 0.54, 16), trimMat);
      pedCol.position.set(0.42, 0.35, -0.10);
      pedCol.castShadow = true;
      this.scene.add(pedCol);

      const pedTop = new T.Mesh(new T.CylinderGeometry(0.34, 0.31, 0.06, 20), trimMat);
      pedTop.position.set(0.42, 0.65, -0.10);
      pedTop.castShadow = true;
      pedTop.receiveShadow = true;
      this.scene.add(pedTop);

      // Sombras de contato no chao para ancoragem perfeita de cada personagem
      const shMat = new T.MeshBasicMaterial({ color: 0x1e1b18, transparent: true, opacity: 0.28, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.015, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.28, -0.52, 0.50);
      this.camilaShadow = makeShadow(0.26, 1.75, -1.05);
      this.pacocaShadow = makeShadow(0.19, 1.15, -0.50);
    }

    _initCharacters3D(T) {
      // Voce ancorado exatamente no piso (VOCE_GROUND_Y = -0.37 -> chinelos tocando y=0.00)
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.52, VOCE_GROUND_Y, 0.50);
      this.scene.add(this.voce.group);

      // Genio 3D sentado pela coluna de fumaca dentro do bico da lampada dourada em cima da mesa (y = 0.68)
      this.genio = new global.Genio3D({ scale: 1.05 });
      this.genio.group.position.set(0.42, 0.68, -0.10);
      this.genio.group.rotation.y = -0.38;
      this.scene.add(this.genio.group);

      // Dona Camila firmemente aterrada no piso (CAMILA_GROUND_Y = -0.27 -> solado em y=0.00!)
      this.camila = new global.DonaCamila3D({ emotion: 'scared', pose: 'idle' });
      this.camila.group.position.set(1.75, CAMILA_GROUND_Y, -1.05);
      this.camila.group.rotation.y = -0.75;
      this.scene.add(this.camila.group);

      // Pacoca caramelo aterrado no piso y = 0.00
      this.pacoca = new global.PacocaCachorro3D({ emotion: 'alert', pose: 'idle' });
      this.pacoca.group.position.set(1.15, 0.00, -0.50);
      this.pacoca.group.rotation.y = -0.82;
      this.scene.add(this.pacoca.group);
    }

    _buildComedyProps3D(T) {
      // 1) PROP DO PEDIDO 1: Vara de Pescar de Bambu com molinete & sardinha (100% enquadrada em B2)
      this.fishingRodGroup = new T.Group();
      const bambooMat = new T.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.58 });
      const ringMat = new T.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
      const rodMesh = new T.Mesh(new T.CylinderGeometry(0.014, 0.036, 2.05, 14), bambooMat);
      rodMesh.position.y = 1.02;
      rodMesh.castShadow = true;
      this.fishingRodGroup.add(rodMesh);

      for (let j = 1; j <= 4; j++) {
        const node = new T.Mesh(new T.TorusGeometry(0.034 - j * 0.004, 0.006, 8, 16), ringMat);
        node.rotation.x = Math.PI / 2;
        node.position.y = j * 0.42;
        this.fishingRodGroup.add(node);
      }

      const reel = new T.Mesh(
        new T.CylinderGeometry(0.065, 0.065, 0.055, 16),
        new T.MeshStandardMaterial({ color: 0xd97706, metalness: 0.72, roughness: 0.25 })
      );
      reel.rotation.z = Math.PI / 2;
      reel.position.set(0.04, 0.36, 0.04);
      this.fishingRodGroup.add(reel);

      this.fishPivot = new T.Group();
      this.fishPivot.position.set(0, 2.02, 0);
      const lineMesh = new T.Mesh(
        new T.CylinderGeometry(0.0045, 0.0045, 0.58, 6),
        new T.MeshBasicMaterial({ color: 0xf8fafc })
      );
      lineMesh.position.y = -0.29;
      this.fishPivot.add(lineMesh);

      const fishBody = new T.Mesh(
        new T.SphereGeometry(0.10, 14, 12),
        new T.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.35, roughness: 0.25 })
      );
      fishBody.scale.set(0.55, 1.35, 0.65);
      fishBody.position.y = -0.60;
      this.fishPivot.add(fishBody);
      const fishTail = new T.Mesh(
        new T.ConeGeometry(0.068, 0.11, 8),
        new T.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
      );
      fishTail.position.y = -0.47;
      fishTail.rotation.x = Math.PI;
      this.fishPivot.add(fishTail);
      this.fishingRodGroup.add(this.fishPivot);
      this.fishingRodGroup.scale.setScalar(0.001);
      this.fishingRodGroup.visible = false;
      this.scene.add(this.fishingRodGroup);

      // 2) PROP DO PEDIDO 2: Tanque de Lavar Roupa de Concreto com Rachadura Gigante (y = 0.00!)
      this.tanqueGroup = new T.Group();
      this.tanqueGroup.position.set(-0.95, 0.00, -0.42);
      this.tanqueGroup.rotation.y = 0.45;
      const concreteMat = new T.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.88 });
      const basinInnerMat = new T.MeshStandardMaterial({ color: 0x64748b, roughness: 0.92 });

      const ped = new T.Mesh(new T.BoxGeometry(0.56, 0.56, 0.48), concreteMat);
      ped.position.y = 0.28;
      ped.castShadow = true;
      ped.receiveShadow = true;
      this.tanqueGroup.add(ped);

      const tub = new T.Mesh(new T.BoxGeometry(0.96, 0.36, 0.68), concreteMat);
      tub.position.y = 0.72;
      tub.castShadow = true;
      tub.receiveShadow = true;
      this.tanqueGroup.add(tub);

      const basin = new T.Mesh(new T.BoxGeometry(0.80, 0.08, 0.52), basinInnerMat);
      basin.position.set(0, 0.88, 0);
      this.tanqueGroup.add(basin);

      // Torneira cromada acima do tanque
      const faucet = new T.Mesh(
        new T.CylinderGeometry(0.025, 0.025, 0.18, 10),
        new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 })
      );
      faucet.position.set(0, 0.98, -0.26);
      this.tanqueGroup.add(faucet);

      // Trinca em ziguezague bem legivel na frente do tanque!
      const crackMat = new T.MeshBasicMaterial({ color: 0x09090b });
      [
        { x: -0.05, y: 0.78, rz: -0.35, h: 0.16 },
        { x: 0.02, y: 0.65, rz: 0.42, h: 0.18 },
        { x: -0.03, y: 0.52, rz: -0.28, h: 0.18 },
        { x: 0.04, y: 0.36, rz: 0.22, h: 0.20 }
      ].forEach((c) => {
        const cr = new T.Mesh(new T.BoxGeometry(0.032, c.h, 0.025), crackMat);
        cr.position.set(c.x, c.y, 0.345);
        cr.rotation.z = c.rz;
        this.tanqueGroup.add(cr);
      });
      this.tanqueGroup.scale.setScalar(0.001);
      this.tanqueGroup.visible = false;
      this.scene.add(this.tanqueGroup);

      // 3) PROP DO PEDIDO 3: Caixote com 10 Milhos Gigantes ("DEZ MILHOES"!)
      this.cornCrateGroup = new T.Group();
      this.cornCrateGroup.position.set(0.32, 0.00, 0.55);
      const crateWood = new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
      const crateBox = new T.Mesh(new T.BoxGeometry(0.76, 0.36, 0.56), crateWood);
      crateBox.position.y = 0.18;
      crateBox.castShadow = true;
      crateBox.receiveShadow = true;
      this.cornCrateGroup.add(crateBox);

      const cornMat = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.42 });
      const kernelRingMat = new T.MeshStandardMaterial({ color: 0xeab308, roughness: 0.55 });
      const huskMat = new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.72 });
      const makeCornCob = (s = 1.0) => {
        const g = new T.Group();
        const body = new T.Mesh(new T.CapsuleGeometry(0.068 * s, 0.26 * s, 8, 16), cornMat);
        body.castShadow = true;
        g.add(body);
        for (let r = -2; r <= 2; r++) {
          const ring = new T.Mesh(new T.TorusGeometry(0.064 * s, 0.007 * s, 6, 14), kernelRingMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = r * 0.055 * s;
          g.add(ring);
        }
        const leaf1 = new T.Mesh(new T.ConeGeometry(0.075 * s, 0.24 * s, 10), huskMat);
        leaf1.position.set(0.035 * s, -0.10 * s, 0);
        leaf1.rotation.z = -0.35;
        g.add(leaf1);
        const leaf2 = new T.Mesh(new T.ConeGeometry(0.075 * s, 0.22 * s, 10), huskMat);
        leaf2.position.set(-0.035 * s, -0.10 * s, 0);
        leaf2.rotation.z = 0.35;
        g.add(leaf2);
        return g;
      };

      for (let i = 0; i < 10; i++) {
        const cob = makeCornCob(0.95);
        const row = Math.floor(i / 5);
        const col = i % 5;
        cob.position.set(-0.24 + col * 0.12, 0.42 + row * 0.06, -0.09 + row * 0.18);
        cob.rotation.set(0.25 - row * 0.45, col * 0.2, (col - 2) * 0.18);
        this.cornCrateGroup.add(cob);
      }
      this.cornCrateGroup.scale.setScalar(0.001);
      this.cornCrateGroup.visible = false;
      this.scene.add(this.cornCrateGroup);

      // Espiga hero gigante levantada por Voce em B6
      this.heroCorn = makeCornCob(1.15);
      this.heroCorn.visible = false;
      this.scene.add(this.heroCorn);

      // Particulas magicas douradas
      this.magicStars = [];
      const starMat = new T.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 });
      const starGeo = new T.OctahedronGeometry(0.048, 0);
      for (let i = 0; i < 14; i++) {
        const st = new T.Mesh(starGeo, starMat);
        this.scene.add(st);
        this.magicStars.push({ mesh: st, seed: i * 0.71 });
      }
    }

    _updateMagicStars(t, center, burst) {
      const cx = center[0], cy = center[1], cz = center[2];
      for (let i = 0; i < this.magicStars.length; i++) {
        const s = this.magicStars[i];
        const ang = t * 2.6 + s.seed * 4.0;
        const rad = 0.28 + burst * 0.65 + Math.sin(t * 3 + s.seed) * 0.12;
        s.mesh.position.set(
          cx + Math.cos(ang) * rad,
          cy + ((t * 0.8 + s.seed) % 1.4) * (0.65 + burst * 0.45),
          cz + Math.sin(ang) * rad
        );
        s.mesh.rotation.y = t * 4.0 + s.seed;
        const sc = 0.5 + burst * 0.75;
        s.mesh.scale.setScalar(sc);
      }
    }

    renderAt(t) {
      const time = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const dlg = this._getDialogueState(time);

      // Pesos suaves C1 entre as 6 batidas (smoothstep com janelas amplas -> zero trancos!)
      const w12 = smoothstep((time - (b[1] - 0.15)) / 1.35); // B1 -> B2 (Vara gigante)
      const w23 = smoothstep((time - (b[2] - 0.15)) / 1.15); // B2 -> B3 (Pedido 2: Tanque)
      const w34 = smoothstep((time - (b[3] - 0.15)) / 1.25); // B3 -> B4 (Camila no terraco)
      const w45 = smoothstep((time - (b[4] - 0.15)) / 1.20); // B4 -> B5 (Pedido 3: 10 Milhoes)
      const w56 = smoothstep((time - (b[5] - 0.15)) / 1.20); // B5 -> B6 (Final 10 Milhoes + CTA)

      // 1. Camera Steadicam continua por mistura cumulativa (enquadramento aberto sem cortes nas bordas!)
      const breathCam = Math.sin(time * 1.15) * 0.014;
      let camX = -0.22, camY = 1.28 + breathCam, camZ = 2.85;
      let lookX = -0.14, lookY = 1.04, lookZ = 0.08, fov = 39;

      camX = lerp(camX, 0.02, w12); camY = lerp(camY, 1.56 + breathCam, w12); camZ = lerp(camZ, 5.10, w12);
      lookX = lerp(lookX, -0.02, w12); lookY = lerp(lookY, 1.08, w12); lookZ = lerp(lookZ, 0.02, w12); fov = lerp(fov, 46, w12);

      camX = lerp(camX, -0.12, w23); camY = lerp(camY, 1.50 + breathCam, w23); camZ = lerp(camZ, 5.20, w23);
      lookX = lerp(lookX, -0.18, w23); lookY = lerp(lookY, 0.98, w23); lookZ = lerp(lookZ, -0.08, w23); fov = lerp(fov, 47, w23);

      camX = lerp(camX, 0.16, w34); camY = lerp(camY, 1.52 + breathCam, w34); camZ = lerp(camZ, 5.38, w34);
      lookX = lerp(lookX, 0.08, w34); lookY = lerp(lookY, 0.96, w34); lookZ = lerp(lookZ, -0.35, w34); fov = lerp(fov, 47, w34);

      camX = lerp(camX, 0.04, w45); camY = lerp(camY, 1.46 + breathCam, w45); camZ = lerp(camZ, 4.70, w45);
      lookX = lerp(lookX, 0.05, w45); lookY = lerp(lookY, 1.04, w45); lookZ = lerp(lookZ, 0.10, w45); fov = lerp(fov, 45, w45);

      camX = lerp(camX, 0.08, w56); camY = lerp(camY, 1.48 + breathCam, w56); camZ = lerp(camZ, 4.85, w56);
      lookX = lerp(lookX, 0.05, w56); lookY = lerp(lookY, 1.02, w56); lookZ = lerp(lookZ, 0.12, w56); fov = lerp(fov, 46, w56);

      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // 2. Trajetoria continua de Voce e Camila 100% ancorados no piso
      const stepAside = smoothstep((time - (b[2] - 0.1)) / 1.2);
      const stepCenter = smoothstep((time - (b[4] - 0.1)) / 1.15);
      const voceStride = Math.sin(stepAside * Math.PI) * 0.85 + Math.sin(stepCenter * Math.PI) * 0.78;
      const voceX = lerp(-0.52, -0.28, stepAside) + stepCenter * (-0.54 - (-0.28));
      const voceZ = lerp(0.50, 0.56, stepAside) + stepCenter * (0.58 - 0.56);
      let voceRotY = lerp(0.28, 0.62, w12);
      voceRotY = lerp(voceRotY, 0.78, w23);
      voceRotY = lerp(voceRotY, 0.18, w45);
      voceRotY = lerp(voceRotY, 0.10, w56);

      this.voce.group.position.set(voceX, VOCE_GROUND_Y, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voceShadow.position.set(voceX, 0.015, voceZ + 0.03);

      const camilaStep = smoothstep((time - (b[3] - 0.35)) / 1.45);
      const camilaStride = Math.sin(camilaStep * Math.PI) * 0.80;
      const camXPos = lerp(1.68, 1.24, camilaStep);
      const camZPos = lerp(-1.18, -0.68, camilaStep);
      this.camila.group.position.set(camXPos, CAMILA_GROUND_Y, camZPos);
      this.camila.group.rotation.y = lerp(-0.55, -0.82, camilaStep) * (1 - w56) - 0.38 * w56;
      this.camilaShadow.position.set(camXPos, 0.015, camZPos + 0.02);

      // 3. Atualizacao de dialogo e expressoes fluidas
      const voceEmotion = time < b[1] ? 'smirk' : (time < b[2] ? 'shocked' : (time < b[4] ? 'determined' : (time < b[5] ? 'determined' : 'shocked')));
      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');
      this.voce.setLook(w34 > 0.3 && w45 < 0.7 ? -0.35 : 0.08, 0);
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0.05);
      this.voce.update(1 / 60, time);

      if (voceStride > 0.005 && this.voce.legL && this.voce.legR) {
        const phi = time * 6.2;
        const amp = 0.52 * voceStride;
        const lA = Math.sin(phi) * amp;
        const rA = Math.sin(phi + Math.PI) * amp;
        this.voce.legL.root.rotation.x = lerp(this.voce.legL.root.rotation.x, lA, voceStride);
        this.voce.legR.root.rotation.x = lerp(this.voce.legR.root.rotation.x, rA, voceStride);
        this.voce.legL.knee.rotation.x = lerp(this.voce.legL.knee.rotation.x, Math.max(0.08, -Math.cos(phi) * 0.5), voceStride);
        this.voce.legR.knee.rotation.x = lerp(this.voce.legR.knee.rotation.x, Math.max(0.08, -Math.cos(phi + Math.PI) * 0.5), voceStride);
      }

      this.camila.setEmotion(w56 > 0.5 ? 'happy' : 'scared');
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : 0.06);
      this.camila.update(1 / 60, time);
      if (camilaStride > 0.005 && this.camila.legL && this.camila.legR) {
        const cphi = time * 5.8;
        this.camila.legL.root.rotation.x = lerp(this.camila.legL.root.rotation.x, Math.sin(cphi) * 0.44 * camilaStride, camilaStride);
        this.camila.legR.root.rotation.x = lerp(this.camila.legR.root.rotation.x, Math.sin(cphi + Math.PI) * 0.44 * camilaStride, camilaStride);
      }

      // Pacoca atento ao lado da Camila no piso y = 0.00
      const pacBark = clamp(smoothstep((time - (b[3] + 0.1)) / 0.45) * (1 - smoothstep((time - (b[4] + 0.2)) / 0.5)), 0, 1);
      const pacHop = pacBark * Math.pow(Math.max(0, Math.sin(time * 6.8)), 1.6) * 0.09;
      this.pacoca.group.position.set(1.12, pacHop, -0.45);
      this.pacocaShadow.scale.setScalar(1.0 - pacHop * 1.2);
      this.pacoca.isBarking = pacBark > 0.35;
      this.pacoca.mouthOpen = 0.06 + pacBark * Math.abs(Math.sin(time * 9.5)) * 0.45;
      this.pacoca.update(1 / 60, time);

      // Genio emergindo suave em B1 e comandando cada pedido
      this.genio.emerge = smoothstep((time - 0.18) / 1.15);
      const geniePose = w56 > 0.5 ? 'shrug' : (dlg.speaker === 'genio' ? 'snap' : 'idle');
      this.genio.setPose(geniePose);
      this.genio.setEmotion(w56 > 0.5 ? 'wink_cta' : 'smirk');
      this.genio.setMouthOpen(dlg.speaker === 'genio' ? dlg.lip : 0.08);
      this.genio.update(1 / 60, time);

      // 4. Props fisicos com aparecimento fluido (zero teleporte!)
      // Prop 1: Vara de Pescar (aparece em B2 e vai suavemente encostar na pilastra em B3)
      const rodAppear = smoothstep((time - (b[1] - 0.10)) / 0.45);
      const rodPutAway = smoothstep((time - (b[2] - 0.15)) / 0.90);
      this.fishingRodGroup.visible = rodAppear > 0.02;
      if (this.fishingRodGroup.visible) {
        const handX = voceX + 0.24, handY = 0.62, handZ = voceZ + 0.26;
        this.fishingRodGroup.position.set(
          lerp(handX, -2.05, rodPutAway),
          lerp(handY, 0.00, rodPutAway),
          lerp(handZ, -2.62, rodPutAway)
        );
        this.fishingRodGroup.rotation.set(
          lerp(0.92 + Math.sin(time * 3.8) * 0.04, 0.08, rodPutAway),
          lerp(0.24, 0.15, rodPutAway),
          lerp(-0.22, 0.12, rodPutAway)
        );
        this.fishingRodGroup.scale.setScalar(rodAppear);
        this.fishPivot.rotation.set(lerp(-0.78, 0, rodPutAway), 0, Math.sin(time * 4.5) * 0.24);
      }

      // Hold weight suave nos bracos durante vara (B2) e espiga gigante (B6)
      const holdRodW = clamp(rodAppear * (1 - rodPutAway), 0, 1);
      if (holdRodW > 0.005 && this.voce.shoulderR) {
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -1.12, holdRodW);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, -0.58, holdRodW);
      }

      // Prop 2: Tanque de Lavar Roupa Trincado (cai em B3 -> chao y=0.00)
      const tanqueDrop = smoothstep((time - (b[3] - 0.45)) / 0.48);
      this.tanqueGroup.visible = tanqueDrop > 0.02;
      if (this.tanqueGroup.visible) {
        const bounce = Math.sin(tanqueDrop * Math.PI) * 0.14;
        this.tanqueGroup.scale.setScalar(tanqueDrop);
        this.tanqueGroup.position.y = Math.max(0, bounce * (1 - tanqueDrop));
      }

      // Prop 3: Caixote com 10 Milhoes (aparece em B5) + Voce segura espiga colossal em B6
      const cratePop = smoothstep((time - (b[5] - 0.45)) / 0.55);
      this.cornCrateGroup.visible = cratePop > 0.02;
      if (this.cornCrateGroup.visible) {
        this.cornCrateGroup.scale.setScalar(cratePop);
      }

      const holdCornW = smoothstep((time - (b[5] + 0.15)) / 0.85);
      this.heroCorn.visible = holdCornW > 0.02;
      if (this.heroCorn.visible) {
        this.heroCorn.position.set(voceX + 0.22, 1.12 + Math.sin(time * 3.5) * 0.03, voceZ + 0.34);
        this.heroCorn.rotation.set(0.35, time * 0.6, -0.32);
        this.heroCorn.scale.setScalar(holdCornW * 1.15);
        if (this.voce.shoulderR) {
          this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -1.42, holdCornW);
          this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, -0.42, holdCornW);
        }
      }

      const magicBurst = Math.max(
        Math.sin(clamp((time - b[1]) / 0.8, 0, 1) * Math.PI),
        Math.sin(clamp((time - (b[3] - 0.4)) / 0.8, 0, 1) * Math.PI),
        Math.sin(clamp((time - (b[5] - 0.4)) / 0.8, 0, 1) * Math.PI)
      );
      this._updateMagicStars(time, [0.42, 1.05, -0.10], magicBurst);

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep02LampadaGenio3D = Ep02LampadaGenio3D;
})(typeof window !== 'undefined' ? window : this);
