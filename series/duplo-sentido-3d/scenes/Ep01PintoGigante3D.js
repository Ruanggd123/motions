/**
 * Ep01PintoGigante3D.js — Cena 3D Completa (WebGL Three.js)
 * Canal: Duplo Sentido 3D — Episódio 01: "O Que Eu Faço Com Meu Pinto Gigante"
 *
 * Estética: Pixar Comedy Diurno Ensolarado (céu azul vibrante, sombra nítida, squash & stretch)
 * Motor determinístico: renderAt(t) funciona 100% em reprodução contínua ou scrub manual.
 */
(function (global) {
  'use strict';

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function easeOutBack(t) {
    t = clamp(t, 0, 1);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function easeOutCubic(t) {
    t = clamp(t, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }

  class Ep01PintoGigante3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js não encontrado para Ep01PintoGigante3D');

      this.highRes = Boolean(opts.highRes);
      this.width = this.highRes ? 1080 : 720;
      this.height = this.highRes ? 1920 : 1280;

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
      this.renderer.toneMappingExposure = 1.18;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x56ccf2);
      this.scene.fog = new T.FogExp2(0x87cefa, 0.012);

      this.camera = new T.PerspectiveCamera(42, 1080 / 1920, 0.08, 120);
      this._camPos = new T.Vector3(0, 1.5, 3.0);
      this._camLook = new T.Vector3(0, 1.2, 0);

      this._initLights(T);
      this._buildBackyardSet3D(T);
      this._initCharacters3D(T);
      this._buildGiantChick3D(T);
      this._initFeatherParticles(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP01_DUPLO_TIMELINE ? global.EP01_DUPLO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) {
        return tl.beat_starts;
      }
      return [0.0, 2.2, 5.2, 9.6, 14.0, 17.8];
    }

    _getDuration() {
      const tl = this._getTimeline();
      return (tl && tl.duration) ? tl.duration : 22.5;
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
      this.ambient = new T.AmbientLight(0xfffbeb, 0.95);
      this.scene.add(this.ambient);

      this.hemi = new T.HemisphereLight(0xbae6fd, 0x4ade80, 1.15);
      this.hemi.position.set(0, 18, 4);
      this.scene.add(this.hemi);

      this.sunLight = new T.DirectionalLight(0xfff7ed, 2.05);
      this.sunLight.position.set(6.5, 13.0, 9.0);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = this.highRes ? 1024 : 512;
      this.sunLight.shadow.mapSize.height = this.highRes ? 1024 : 512;
      this.sunLight.shadow.camera.near = 1;
      this.sunLight.shadow.camera.far = 40;
      this.sunLight.shadow.camera.left = -9;
      this.sunLight.shadow.camera.right = 9;
      this.sunLight.shadow.camera.top = 9;
      this.sunLight.shadow.camera.bottom = -9;
      this.sunLight.shadow.bias = -0.0008;
      this.scene.add(this.sunLight);

      this.rimLight = new T.DirectionalLight(0x7dd3fc, 0.85);
      this.rimLight.position.set(-7, 6, -8);
      this.scene.add(this.rimLight);
    }

    _buildBackyardSet3D(T) {
      // Gramado solar vibrante + calçada de pedras
      const grassMat = new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.92, metalness: 0.0 });
      const lawn = new T.Mesh(new T.CylinderGeometry(28, 28, 0.4, 48), grassMat);
      lawn.position.y = -0.2;
      lawn.receiveShadow = true;
      this.scene.add(lawn);

      // Canteiros verde-escuro nas bordas
      const trimMat = new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
      for (let i = 0; i < 10; i++) {
        const bush = new T.Mesh(new T.SphereGeometry(0.65 + (i % 3) * 0.18, 16, 12), trimMat);
        bush.position.set(-4.5 + i * 1.1, 0.25, -4.8 - (i % 2) * 0.4);
        bush.scale.set(1.2, 0.78, 1.0);
        bush.castShadow = true;
        bush.receiveShadow = true;
        this.scene.add(bush);
      }

      // Sol estilizado no fundo alto
      const sunDisc = new T.Mesh(
        new T.SphereGeometry(1.4, 24, 18),
        new T.MeshBasicMaterial({ color: 0xfef08a })
      );
      sunDisc.position.set(-6.5, 11.5, -24);
      this.scene.add(sunDisc);

      // Nuvens 3D fofas flutuantes
      this.clouds = [];
      const cloudMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
      [
        { x: -5.5, y: 7.5, z: -18, s: 1.0 },
        { x: 4.5, y: 8.6, z: -20, s: 1.25 },
        { x: 0.5, y: 9.2, z: -23, s: 0.9 }
      ].forEach((cd) => {
        const cg = new T.Group();
        [[-0.9, 0, 0, 0.7], [0, 0.25, 0, 0.95], [0.95, 0.05, 0, 0.72]].forEach((p) => {
          const puff = new T.Mesh(new T.SphereGeometry(p[3], 18, 14), cloudMat);
          puff.position.set(p[0], p[1], p[2]);
          puff.scale.set(1.25, 0.85, 0.85);
          cg.add(puff);
        });
        cg.position.set(cd.x, cd.y, cd.z);
        cg.scale.setScalar(cd.s);
        cg.userData.baseX = cd.x;
        this.clouds.push(cg);
        this.scene.add(cg);
      });

      // Parede acolhedora da casa amarela ao fundo esquerdo
      const houseGroup = new T.Group();
      houseGroup.position.set(-2.8, 0, -4.4);
      const wallMat = new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.82 });
      const wall = new T.Mesh(new T.BoxGeometry(5.6, 4.2, 2.2), wallMat);
      wall.position.y = 2.1;
      wall.castShadow = true;
      wall.receiveShadow = true;
      houseGroup.add(wall);

      const roofMat = new T.MeshStandardMaterial({ color: 0xea580c, roughness: 0.68 });
      const roof = new T.Mesh(new T.ConeGeometry(4.3, 1.5, 4), roofMat);
      roof.position.set(0, 4.9, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      houseGroup.add(roof);

      const winFrame = new T.Mesh(
        new T.BoxGeometry(1.3, 1.15, 0.14),
        new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 })
      );
      winFrame.position.set(0.4, 2.2, 1.12);
      houseGroup.add(winFrame);
      const winGlass = new T.Mesh(
        new T.PlaneGeometry(1.05, 0.9),
        new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.1 })
      );
      winGlass.position.set(0.4, 2.2, 1.20);
      houseGroup.add(winGlass);
      this.scene.add(houseGroup);

      // Cerca Branca do Quintal separando da vizinha Camila (lado direito)
      const fenceMat = new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
      const fenceGroup = new T.Group();
      fenceGroup.position.set(2.3, 0, -1.6);
      fenceGroup.rotation.y = -0.35;
      for (let p = -3; p <= 5; p++) {
        const picket = new T.Mesh(new T.BoxGeometry(0.16, 1.18, 0.05), fenceMat);
        picket.position.set(p * 0.28, 0.59, 0);
        picket.castShadow = true;
        picket.receiveShadow = true;
        fenceGroup.add(picket);

        const cap = new T.Mesh(new T.ConeGeometry(0.11, 0.14, 4), fenceMat);
        cap.position.set(p * 0.28, 1.24, 0);
        cap.rotation.y = Math.PI / 4;
        fenceGroup.add(cap);
      }
      const railTop = new T.Mesh(new T.BoxGeometry(2.6, 0.08, 0.07), fenceMat);
      railTop.position.set(0.28, 0.92, -0.02);
      fenceGroup.add(railTop);
      const railBot = new T.Mesh(new T.BoxGeometry(2.6, 0.08, 0.07), fenceMat);
      railBot.position.set(0.28, 0.36, -0.02);
      fenceGroup.add(railBot);
      this.scene.add(fenceGroup);

      // Caixote de Madeira Surpresa (recuado atrás para não colidir nas cenas 3 e 4!)
      this.crateGroup = new T.Group();
      this.crateGroup.position.set(0.95, 0, -1.65);
      const woodMat = new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
      const woodDark = new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

      const base = new T.Mesh(new T.BoxGeometry(1.55, 0.08, 1.55), woodDark);
      base.position.y = 0.04;
      base.receiveShadow = true;
      this.crateGroup.add(base);

      [
        [0, 0.55, 0.74, 1.55, 1.05, 0.08],
        [0, 0.55, -0.74, 1.55, 1.05, 0.08],
        [-0.74, 0.55, 0, 0.08, 1.05, 1.55],
        [0.74, 0.55, 0, 0.08, 1.05, 1.55]
      ].forEach((b) => {
        const side = new T.Mesh(new T.BoxGeometry(b[3], b[4], b[5]), woodMat);
        side.position.set(b[0], b[1], b[2]);
        side.castShadow = true;
        side.receiveShadow = true;
        this.crateGroup.add(side);
      });

      // Tampa lateral do caixote articulada (cai aberta em B2!)
      this.crateLid = new T.Group();
      this.crateLid.position.set(0, 1.08, -0.74);
      const lidBoard = new T.Mesh(new T.BoxGeometry(1.60, 0.08, 1.56), woodDark);
      lidBoard.position.set(0, 0, 0.74);
      lidBoard.castShadow = true;
      this.crateLid.add(lidBoard);
      this.crateGroup.add(this.crateLid);
      this.scene.add(this.crateGroup);

      // Balde Vermelho de Milho + Espiga + Grãos Dourados no chão
      this.cornBucket = new T.Group();
      this.cornBucket.position.set(1.55, 0, 0.65);
      const bucketMesh = new T.Mesh(
        new T.CylinderGeometry(0.24, 0.18, 0.36, 24),
        new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45, metalness: 0.2 })
      );
      bucketMesh.position.y = 0.18;
      bucketMesh.castShadow = true;
      this.cornBucket.add(bucketMesh);

      const cornPile = new T.Mesh(
        new T.SphereGeometry(0.22, 18, 12),
        new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 })
      );
      cornPile.position.y = 0.34;
      cornPile.scale.set(1, 0.45, 1);
      this.cornBucket.add(cornPile);
      this.scene.add(this.cornBucket);

      // Grãos de milho espalhados no gramado
      const grainMat = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
      for (let g = 0; g < 16; g++) {
        const grain = new T.Mesh(new T.SphereGeometry(0.032, 8, 6), grainMat);
        grain.position.set(
          0.65 + Math.sin(g * 2.1) * 0.75,
          0.02,
          0.15 + Math.cos(g * 1.7) * 0.65
        );
        grain.scale.set(1.2, 0.7, 0.9);
        this.scene.add(grain);
      }

      // Espiga de Milho na mão / frente da cena para o clímax B6
      this.heroCorn = new T.Group();
      const cobBody = new T.Mesh(
        new T.CylinderGeometry(0.045, 0.058, 0.24, 18),
        new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45 })
      );
      cobBody.rotation.z = Math.PI / 2;
      this.heroCorn.add(cobBody);
      const leafL = new T.Mesh(
        new T.ConeGeometry(0.055, 0.18, 12),
        new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 })
      );
      leafL.rotation.z = -Math.PI / 2.2;
      leafL.position.set(0.11, -0.02, 0);
      this.heroCorn.add(leafL);
      this.heroCorn.position.set(-0.22, 1.05, 0.38);
      this.scene.add(this.heroCorn);
    }

    _initCharacters3D(T) {
      // Protagonista oficial do usuário (VoceMorador3D)
      this.voce = new global.VoceMorador3D({
        position: { x: 0.0, y: 0, z: 0.3 },
        scale: 1.02,
        emotion: 'smirk',
        pose: 'idle',
        flashlightOn: false
      });
      if (this.voce.phoneGroup) {
        this.voce.phoneGroup.visible = false; // Mãos livres pro humor diurno!
      }
      this.scene.add(this.voce.group);

      // Testemunhas atrás da cerca (Camila + Paçoca)
      this.camila = new global.DonaCamila3D({
        position: { x: 2.85, y: 0, z: -2.05 },
        scale: 1.0,
        emotion: 'scared',
        pose: 'idle'
      });
      this.camila.group.rotation.y = -0.68;
      this.scene.add(this.camila.group);

      this.pacoca = new global.PacocaCachorro3D({
        position: { x: 2.35, y: 0, z: -1.15 },
        scale: 1.05,
        emotion: 'alert',
        pose: 'idle'
      });
      this.pacoca.group.rotation.y = -0.82;
      this.scene.add(this.pacoca.group);
    }

    _buildGiantChick3D(T) {
      this.chickRoot = new T.Group();
      this.chickRoot.position.set(0.85, 0.15, -0.85);

      const yellowMain = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.72, metalness: 0.02 });
      const yellowBelly = new T.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.80 });
      const orangeBeak = new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.42 });
      const orangeFoot = new T.MeshStandardMaterial({ color: 0xea580c, roughness: 0.55 });
      const whiteEye = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
      const blackPupil = new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12 });

      // Corpo principal gordinho e fofo (pivot para squash & stretch!)
      this.chickBodyPivot = new T.Group();
      this.chickBodyPivot.position.y = 0.0;
      this.chickRoot.add(this.chickBodyPivot);

      const torso = new T.Mesh(new T.SphereGeometry(0.62, 36, 28), yellowMain);
      torso.position.y = 0.76;
      torso.scale.set(1.04, 1.08, 1.02);
      torso.castShadow = true;
      torso.receiveShadow = true;
      this.chickBodyPivot.add(torso);

      const bellyPatch = new T.Mesh(new T.SphereGeometry(0.46, 28, 22), yellowBelly);
      bellyPatch.position.set(0, 0.70, 0.24);
      bellyPatch.scale.set(0.95, 0.95, 0.72);
      this.chickBodyPivot.add(bellyPatch);

      // Rabinho fofo pontudo atrás
      const tailTuft = new T.Mesh(new T.ConeGeometry(0.20, 0.36, 16), yellowMain);
      tailTuft.position.set(0, 0.74, -0.64);
      tailTuft.rotation.x = -1.1;
      tailTuft.castShadow = true;
      this.chickBodyPivot.add(tailTuft);

      // Asinhas curtas articuladas
      const makeWing = (side) => {
        const wg = new T.Group();
        wg.position.set(side * 0.58, 0.86, 0.05);
        const wingMesh = new T.Mesh(new T.SphereGeometry(0.24, 24, 18), yellowMain);
        wingMesh.scale.set(0.48, 1.15, 0.82);
        wingMesh.position.set(side * 0.08, -0.14, 0);
        wingMesh.castShadow = true;
        wg.add(wingMesh);
        this.chickBodyPivot.add(wg);
        return wg;
      };
      this.chickWingL = makeWing(-1);
      this.chickWingR = makeWing(1);

      // Cabeça gigante Pixar + topete + olhos gigantes + bico articulado
      this.chickHead = new T.Group();
      this.chickHead.position.set(0, 1.38, 0.08);
      this.chickBodyPivot.add(this.chickHead);

      const headSphere = new T.Mesh(new T.SphereGeometry(0.46, 36, 28), yellowMain);
      headSphere.scale.set(1.05, 0.96, 1.02);
      headSphere.castShadow = true;
      this.chickHead.add(headSphere);

      // 3 Penas no Topete (visíveis no mistério de B1!)
      [
        { rx: -0.2, rz: 0.25, x: -0.06, h: 0.34 },
        { rx: 0.0, rz: 0.0, x: 0.0, h: 0.44 },
        { rx: 0.15, rz: -0.28, x: 0.07, h: 0.32 }
      ].forEach((ft) => {
        const feather = new T.Mesh(new T.ConeGeometry(0.065, ft.h, 14), yellowMain);
        feather.position.set(ft.x, 0.54, 0.0);
        feather.rotation.set(ft.rx, 0, ft.rz);
        feather.castShadow = true;
        this.chickHead.add(feather);
      });

      // Olhos fofos enormes com brilho duplo
      [-0.19, 0.19].forEach((ex) => {
        const sclera = new T.Mesh(new T.SphereGeometry(0.115, 22, 18), whiteEye);
        sclera.position.set(ex, 0.08, 0.39);
        sclera.scale.set(0.95, 1.12, 0.65);
        this.chickHead.add(sclera);

        const pupil = new T.Mesh(new T.SphereGeometry(0.078, 20, 16), blackPupil);
        pupil.position.set(ex, 0.08, 0.435);
        pupil.scale.set(0.92, 1.08, 0.62);
        this.chickHead.add(pupil);

        const shine = new T.Mesh(new T.SphereGeometry(0.025, 10, 8), whiteEye);
        shine.position.set(ex - 0.024, 0.115, 0.478);
        this.chickHead.add(shine);
      });

      // Bochechas rosadas
      const blushMat = new T.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.85 });
      [-0.29, 0.29].forEach((bx) => {
        const blush = new T.Mesh(new T.SphereGeometry(0.065, 14, 12), blushMat);
        blush.position.set(bx, -0.04, 0.36);
        blush.scale.set(1.2, 0.75, 0.5);
        this.chickHead.add(blush);
      });

      // Bico Laranja Articulado (Superior + Inferior)
      this.beakTop = new T.Group();
      this.beakTop.position.set(0, -0.02, 0.43);
      const topCone = new T.Mesh(new T.ConeGeometry(0.115, 0.24, 16), orangeBeak);
      topCone.rotation.x = Math.PI / 2;
      topCone.position.set(0, 0.02, 0.10);
      topCone.scale.set(1.15, 1.0, 0.65);
      this.beakTop.add(topCone);
      this.chickHead.add(this.beakTop);

      this.beakBottom = new T.Group();
      this.beakBottom.position.set(0, -0.04, 0.43);
      const botCone = new T.Mesh(new T.ConeGeometry(0.095, 0.19, 16), orangeBeak);
      botCone.rotation.x = Math.PI / 2;
      botCone.position.set(0, -0.015, 0.08);
      botCone.scale.set(1.05, 1.0, 0.52);
      this.beakBottom.add(botCone);
      this.chickHead.add(this.beakBottom);

      // Perninhas + Pés palmados laranja
      const makeLeg = (sx) => {
        const lg = new T.Group();
        lg.position.set(sx * 0.24, 0.26, 0.02);
        const shin = new T.Mesh(new T.CylinderGeometry(0.045, 0.040, 0.26, 16), orangeFoot);
        shin.position.y = -0.12;
        lg.add(shin);

        [-0.25, 0, 0.25].forEach((ang) => {
          const toe = new T.Mesh(new T.BoxGeometry(0.065, 0.036, 0.24), orangeFoot);
          toe.position.set(Math.sin(ang) * 0.07, -0.24, 0.09);
          toe.rotation.y = ang;
          toe.castShadow = true;
          lg.add(toe);
        });
        this.chickRoot.add(lg);
        return lg;
      };
      this.chickLegL = makeLeg(-1);
      this.chickLegR = makeLeg(1);

      this.scene.add(this.chickRoot);
    }

    _initFeatherParticles(T) {
      this.feathers = [];
      const fMat = new T.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.65, side: T.DoubleSide });
      for (let i = 0; i < 20; i++) {
        const mesh = new T.Mesh(new T.SphereGeometry(0.055, 8, 6), fMat);
        mesh.scale.set(1.6, 0.2, 0.75);
        mesh.visible = false;
        this.scene.add(mesh);
        this.feathers.push({
          mesh,
          seed: i * 1.37
        });
      }
    }

    _updateFeathers(t) {
      // Penas voam em B2 (revelação) e no Caos Final B6
      const b = this._getBeats();
      const inReveal = t >= b[1] && t <= Math.min(b[2] - 0.15, b[1] + 2.6);
      const inChaos = t >= b[5] + 0.1;
      const active = inReveal || inChaos;

      for (let i = 0; i < this.feathers.length; i++) {
        const f = this.feathers[i];
        if (!active) {
          f.mesh.visible = false;
          continue;
        }
        f.mesh.visible = true;
        const baseT = inChaos ? (t - (b[5] + 0.1)) : (t - b[1]);
        const phase = (baseT * 0.9 + f.seed) % 2.4;
        const originX = inChaos ? 0.25 : 0.95;
        const originZ = inChaos ? 0.55 : -0.45;
        const ang = f.seed * 3.1 + t * 1.4;
        const rad = 0.25 + phase * (inChaos ? 0.95 : 0.75);

        f.mesh.position.set(
          originX + Math.cos(ang) * rad,
          0.4 + Math.sin(phase * Math.PI * 0.65) * 2.1,
          originZ + Math.sin(ang) * rad
        );
        f.mesh.rotation.set(t * 2.5 + f.seed, t * 3.1, Math.sin(t * 4 + f.seed));
      }
    }

    renderAt(t) {
      const time = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const totalDur = this._getDuration();
      const d0 = Math.max(0.5, b[1] - b[0]);
      const d1 = Math.max(0.5, b[2] - b[1]);
      const d2 = Math.max(0.5, b[3] - b[2]);
      const d3 = Math.max(0.5, b[4] - b[3]);
      const d4 = Math.max(0.5, b[5] - b[4]);
      const d5 = Math.max(0.5, totalDur - b[5]);
      const realLip = this._getVoiceLip(time);

      // Nuvens suaves ao fundo
      for (let c = 0; c < this.clouds.length; c++) {
        const cl = this.clouds[c];
        cl.position.x = cl.userData.baseX + Math.sin(time * 0.16 + c * 2.0) * 1.1;
      }

      // Valores padrão
      let camX = 0.0, camY = 1.48, camZ = 2.05;
      let lookX = 0.0, lookY = 1.40, lookZ = 0.2;
      let fov = 34;

      let voceX = 0.0, voceY = 0.0, voceZ = 0.30, voceRotY = 0.05;
      let voceEmotion = 'smirk', vocePose = 'idle', voceMouth = 0;
      let voceWalk = false;
      let cornVisible = true;
      let cornPos = [-0.22, 1.05, 0.38];

      let chickX = 0.85, chickY = -0.35, chickZ = -0.85, chickRotY = -0.25;
      let chickSx = 0.72, chickSy = 0.72, chickSz = 0.72;
      let wingFlap = 0.15, beakOpen = 0.0, chickHeadPitch = 0.0, chickWalk = 0;
      let crateLidRot = 0.0;

      // ─── BATIDA 1: Close Fechado + Olhar Maroto + Spoiler Zero ───
      if (time < b[1]) {
        const p = clamp((time - b[0]) / d0, 0, 1);
        fov = 34;
        camX = 0.02 + Math.sin(time * 1.8) * 0.02;
        camY = 1.50;
        camZ = 2.15 - smoothstep(p) * 0.22; // Push-in dramático no gancho!
        lookX = 0.0; lookY = 1.42; lookZ = 0.25;

        voceEmotion = 'smirk';
        vocePose = 'gesturing_urgent';
        voceMouth = realLip >= 0 ? realLip : (p < 0.88 ? 0.35 + Math.abs(Math.sin(time * 12)) * 0.45 : 0.05);
        this.voce.setLook(-0.04, 0.03);

        // Pintinho totalmente escondido dentro do caixote em B1 (sem spoiler!)
        const tremble = Math.sin(time * 24) * 0.02;
        chickX = 0.95;
        chickY = -0.85;
        chickZ = -1.65;
        chickSx = 0.72; chickSy = 0.72; chickSz = 0.72;
        crateLidRot = -Math.max(0, tremble);
        cornVisible = false;
      }
      // ─── BATIDA 2: Dolly-Out Elástico + Revelação Literal! ───
      else if (time < b[2]) {
        const lt = time - b[1];
        const p = clamp(lt / d1, 0, 1);
        const dolly = easeOutCubic(lt / 0.72);
        fov = lerp(34, 46, dolly);
        camX = lerp(0.02, 0.05, dolly);
        camY = lerp(1.50, 1.66, dolly);
        camZ = lerp(1.93, 5.40, dolly);
        lookX = lerp(0.0, 0.04, dolly);
        lookY = lerp(1.42, 1.05, dolly);
        lookZ = lerp(0.25, -0.15, dolly);

        // Pintinho pula pra fora do caixote abrindo a tampa!
        const hopP = clamp(lt / 0.75, 0, 1);
        const arc = Math.sin(hopP * Math.PI) * 1.45;
        const squash = lt >= 0.75 && lt < 1.12 ? Math.sin(((lt - 0.75) / 0.37) * Math.PI) : 0;

        crateLidRot = lerp(0.0, -2.35, clamp(lt / 0.38, 0, 1));
        chickX = lerp(0.95, 0.58, hopP);
        chickY = arc + Math.abs(Math.sin(lt * 5.2)) * 0.05;
        chickZ = lerp(-1.65, 0.05, hopP);
        chickRotY = lerp(-0.1, -0.28, hopP);
        chickSx = 1.0 + squash * 0.24;
        chickSy = 1.0 - squash * 0.22;
        chickSz = 1.0 + squash * 0.24;
        wingFlap = 0.3 + Math.abs(Math.sin(time * 16)) * 0.75;
        beakOpen = lt < 1.4 ? Math.abs(Math.sin(time * 11)) * 0.65 : 0.1;

        voceX = lerp(0.0, -0.58, clamp(lt / 0.55, 0, 1));
        voceRotY = lerp(0.05, 0.38, clamp(lt / 0.55, 0, 1));
        voceEmotion = 'happy';
        vocePose = 'idle';
        voceMouth = realLip >= 0 ? realLip : (p > 0.25 ? 0.3 + Math.abs(Math.sin(time * 13)) * 0.5 : 0.1);
        this.voce.setLook(0.12, 0.0);
        cornVisible = false;
      }
      // ─── BATIDA 3: "Tem Que Segurar Com as 2 Mãos!" (Tombo Cômico) ───
      else if (time < b[3]) {
        const lt = time - b[2];
        const p = clamp(lt / d2, 0, 1);
        fov = 45;
        camX = lerp(-1.25, -1.00, smoothstep(p));
        camY = 1.56;
        camZ = 4.45;
        lookX = 0.05; lookY = 1.02; lookZ = 0.15;
        crateLidRot = -2.35;

        const knock = smoothstep((p - 0.52) / 0.14);
        const rec = smoothstep((p - 0.74) / 0.18);

        // Você tenta segurar o pintinho gigante no gramado livre (longe do caixote!)
        voceX = lerp(-0.32, -1.05, knock) + rec * 0.15;
        voceY = knock > 0.1 ? Math.sin(knock * Math.PI) * 0.25 * (1 - rec) : 0;
        voceZ = 0.22;
        voceRotY = 1.32;
        voceEmotion = knock > 0.2 ? 'shocked' : 'determined';
        vocePose = knock > 0.25 && rec < 0.7 ? 'seated' : 'gesturing_urgent';
        voceMouth = realLip >= 0 ? realLip : (0.25 + Math.abs(Math.sin(time * 12)) * 0.45);
        this.voce.setLook(0.18, 0.05);

        // Pintinho esperneia redondo e dá um salto que empurra Você!
        const chickHop = p > 0.48 && p < 0.66 ? Math.sin(((p - 0.48) / 0.18) * Math.PI) * 0.78 : 0;
        chickX = 0.72 + Math.sin(time * 8) * 0.08 * (1 - knock);
        chickY = chickHop;
        chickZ = 0.22;
        chickRotY = -1.15 + Math.sin(time * 6) * 0.22;
        chickSx = chickHop > 0.1 ? 0.92 : 1.06;
        chickSy = chickHop > 0.1 ? 1.12 : 0.96;
        chickSz = chickSx;
        wingFlap = 0.45 + Math.abs(Math.sin(time * 18)) * 0.8;
        beakOpen = Math.abs(Math.sin(time * 10)) * 0.4;
        cornVisible = false;
      }
      // ─── BATIDA 4: "Já Acorda em Pé Bicando Tudo!" ───
      else if (time < b[4]) {
        const lt = time - b[3];
        const p = clamp(lt / d3, 0, 1);
        fov = 47;
        camX = lerp(1.75, 1.35, smoothstep(p));
        camY = 0.88; // Contra-plongée cômica sem o caixote na frente!
        camZ = 3.75;
        lookX = 0.25; lookY = 1.02; lookZ = 0.25;
        crateLidRot = -2.35;

        // Pintinho gigante bicando o balde de milho + indo bicar o chinelo!
        const peckWave = Math.max(0, Math.sin(lt * 9.5));
        chickHeadPitch = peckWave * 0.62;
        chickX = lerp(0.95, 0.25, smoothstep((p - 0.40) / 0.50));
        chickY = Math.abs(Math.sin(lt * 7.0)) * 0.08;
        chickZ = 0.35;
        chickRotY = -1.18;
        chickWalk = 1;
        wingFlap = 0.25 + peckWave * 0.45;
        beakOpen = peckWave * 0.55;

        // Você pula desviando os chinelos rindo!
        voceX = -0.78 - smoothstep((p - 0.45) / 0.34) * 0.32;
        voceY = p > 0.48 ? Math.abs(Math.sin(lt * 10)) * 0.18 : 0;
        voceZ = 0.35;
        voceRotY = 1.05;
        voceEmotion = 'happy';
        vocePose = 'idle';
        voceMouth = realLip >= 0 ? realLip : (0.3 + Math.abs(Math.sin(time * 13)) * 0.45);
        cornVisible = false;
      }
      // ─── BATIDA 5: Pan para Vizinha Camila + Paçoca em Choque! ───
      else if (time < b[5]) {
        const lt = time - b[4];
        const pan = easeOutCubic(lt / Math.min(0.75, d4 * 0.30));
        fov = 45;
        camX = lerp(1.35, 2.95, pan);
        camY = lerp(0.88, 1.58, pan);
        camZ = lerp(3.75, 2.95, pan);
        lookX = lerp(0.45, 2.35, pan);
        lookY = lerp(1.05, 1.18, pan);
        lookZ = lerp(0.10, -1.40, pan);
        crateLidRot = -2.35;

        // Pintinho continua marchando ao fundo esquerdo
        chickX = 0.45; chickY = Math.abs(Math.sin(lt * 5)) * 0.06; chickZ = 0.10;
        chickRotY = 0.95;
        wingFlap = 0.35;
        beakOpen = 0.2 + Math.abs(Math.sin(time * 9)) * 0.35;

        voceX = -0.75; voceZ = 0.25; voceRotY = 0.85;
        voceEmotion = 'happy';
        voceMouth = realLip >= 0 ? realLip : (0.25 + Math.abs(Math.sin(time * 11)) * 0.35);
        cornVisible = false;
      }
      // ─── BATIDA 6: Corrida Final na Câmera + CTA ───
      else {
        const lt = time - b[5];
        const p = clamp(lt / d5, 0, 1);
        const chargeP = easeOutCubic(clamp(p / 0.62, 0, 1));
        fov = 47;
        camX = Math.sin(lt * 18) * (p > 0.35 && p < 0.50 ? 0.05 : 0);
        camY = 1.38 + Math.cos(lt * 16) * (p > 0.35 && p < 0.50 ? 0.04 : 0);
        camZ = 4.65;
        lookX = 0.0; lookY = 1.22; lookZ = 0.3;
        crateLidRot = -2.35;

        // Você aponta/acena ao lado com espiga de milho na altura do peito (longe do bico!)
        voceX = -0.82; voceZ = 0.40; voceRotY = 0.38;
        voceEmotion = 'happy';
        vocePose = 'gesturing_urgent';
        voceMouth = realLip >= 0 ? realLip : (0.35 + Math.abs(Math.sin(time * 14)) * 0.5);
        this.voce.setLook(0, 0);

        cornVisible = true;
        cornPos = [-0.55, 1.02 + Math.sin(time * 8) * 0.05, 0.72];

        chickX = lerp(0.55, 0.22, chargeP);
        chickZ = lerp(-0.20, 1.75, chargeP);
        chickY = Math.abs(Math.sin(lt * 12)) * 0.22;
        chickRotY = lerp(-0.25, -0.05, chargeP);
        chickWalk = 1;
        wingFlap = 0.5 + Math.abs(Math.sin(time * 20)) * 0.85;
        beakOpen = 0.25 + Math.abs(Math.sin(time * 14)) * 0.7;
      }

      // Aplica câmera suavizada
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // Aplica caixote & milho
      if (this.crateLid) this.crateLid.rotation.x = crateLidRot;
      if (this.heroCorn) {
        this.heroCorn.visible = cornVisible;
        this.heroCorn.position.set(cornPos[0], cornPos[1], cornPos[2]);
        this.heroCorn.rotation.y = time * 1.4;
      }

      // Atualiza Protagonista (VoceMorador3D) com respiração orgânica
      this.voce.group.position.set(voceX, voceY + Math.sin(time * 2.5) * 0.012, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose(vocePose);
      this.voce.setMouthOpen(voceMouth);
      if (voceWalk) this.voce.walk(1.2, 1);
      else this.voce.stop();
      this.voce.update(1 / 60, time);

      // Atualiza Camila e Paçoca
      const inVizinhaBeat = time >= b[4] && time <= b[5];
      this.camila.setEmotion('scared');
      this.camila.setMouthOpen(inVizinhaBeat ? 0.55 + Math.abs(Math.sin(time * 8)) * 0.35 : 0.35);
      this.camila.update(1 / 60, time);

      this.pacoca.isBarking = inVizinhaBeat;
      this.pacoca.mouthOpen = this.pacoca.isBarking ? (0.35 + Math.abs(Math.sin(time * 16)) * 0.55) : 0.1;
      this.pacoca.group.position.y = this.pacoca.isBarking ? Math.abs(Math.sin(time * 10)) * 0.16 : 0;
      this.pacoca.update(1 / 60, time);

      // Atualiza Pintinho Gigante 3D
      this.chickRoot.position.set(chickX, chickY, chickZ);
      this.chickRoot.rotation.y = chickRotY;
      this.chickBodyPivot.scale.set(chickSx, chickSy, chickSz);
      this.chickWingL.rotation.z = 0.15 + wingFlap;
      this.chickWingR.rotation.z = -(0.15 + wingFlap);
      this.chickHead.rotation.x = chickHeadPitch;
      this.beakTop.rotation.x = -beakOpen * 0.45;
      this.beakBottom.rotation.x = beakOpen * 0.55;
      if (chickWalk) {
        this.chickLegL.rotation.x = Math.sin(time * 12) * 0.52;
        this.chickLegR.rotation.x = -Math.sin(time * 12) * 0.52;
      } else {
        this.chickLegL.rotation.x = 0;
        this.chickLegR.rotation.x = 0;
      }

      // Penas voadoras
      this._updateFeathers(time);

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep01PintoGigante3D = Ep01PintoGigante3D;
})(typeof window !== 'undefined' ? window : globalThis);
