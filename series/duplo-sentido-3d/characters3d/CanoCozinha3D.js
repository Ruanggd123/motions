/**
 * CanoCozinha3D.js -- Prop Comico Cartoon 3D (Ep 09: "O Cano Estourado da Pia!")
 *
 * Componentes:
 * - Gabinete de pia colorido com porta inferior ABERTA revelando cano PVC azul brilhante + registro de latao!
 * - Junta/tampao do cano que INCHA feito balao em B3, brilha/treme em B4 e DECOLA em fly-by na lente em B5!
 * - Chave inglesa vermelha gigante (segurada em y <= 0.78 em B3-B4).
 * - Geiser gigante de agua turquesa/branco com 32 puffs + bolhas de sabao em B5!
 * - Desentupidor vermelho de borracha que cai de ponta-cabeca na cabeca esmagada do Voce em B5-B6!
 * - Easter Egg: Patinho amarelo de borracha com bonezinho azul de encanador na pia com bolhas de sabao (B3-B6)!
 * - 100% deterministico (zero Math.random(), zero NaN).
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class CanoCozinha3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para CanoCozinha3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'CanoCozinha3D';

      this._buildMaterials(T);
      this._buildSinkCabinetAndPipes(T);
      this._buildPipeWrench(T);
      this._buildFlyingCap(T);
      this._buildWaterGeyserAndBubbles(T);
      this._buildPlungerAndHat(T);
      this._buildEasterEggDuck(T);
    }

    _buildMaterials(T) {
      this.mats = {
        cabinetWhite: new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 }),
        cabinetMint: new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.42 }),
        cabinetDark: new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }),
        counterTop: new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.28, metalness: 0.05 }),
        chrome: new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.16 }),
        sinkBasin: new T.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.75, roughness: 0.22 }),
        pvcBlue: new T.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.30, metalness: 0.08 }),
        pvcJoint: new T.MeshStandardMaterial({
          color: 0x0ea5e9,
          emissive: 0xef4444,
          emissiveIntensity: 0.0,
          roughness: 0.26
        }),
        brass: new T.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.78, roughness: 0.24 }),
        wrenchRed: new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.34, metalness: 0.22 }),
        wrenchMetal: new T.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.22 }),
        waterCyan: new T.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x0891b2,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.88,
          roughness: 0.12
        }),
        waterFoam: new T.MeshStandardMaterial({
          color: 0xf0f9ff,
          emissive: 0xbae6fd,
          emissiveIntensity: 0.20,
          transparent: true,
          opacity: 0.88,
          roughness: 0.40
        }),
        soapBubble: new T.MeshStandardMaterial({
          color: 0xe0f2fe,
          emissive: 0x7dd3fc,
          emissiveIntensity: 0.22,
          transparent: true,
          opacity: 0.68,
          roughness: 0.08,
          metalness: 0.15
        }),
        plungerRed: new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.38, metalness: 0.04 }),
        woodHandle: new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.62 }),
        duckYellow: new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.34 }),
        duckBeak: new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.40 }),
        capBlue: new T.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 }),
        black: new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.40 })
      };
    }

    _buildSinkCabinetAndPipes(T) {
      // Gabinete de pia posicionado em (x = -0.25, z = -0.92)
      this.sinkGroup = new T.Group();
      this.sinkGroup.position.set(-0.25, 0.0, -0.92);
      this.group.add(this.sinkGroup);

      // Base e laterais do gabinete (altura bancada = 0.88m)
      const base = new T.Mesh(new T.BoxGeometry(1.36, 0.10, 0.62), this.mats.cabinetWhite);
      base.position.set(0, 0.05, 0);
      base.receiveShadow = true;
      this.sinkGroup.add(base);

      [-0.64, 0.64].forEach((sx) => {
        const side = new T.Mesh(new T.BoxGeometry(0.08, 0.74, 0.60), this.mats.cabinetWhite);
        side.position.set(sx, 0.47, 0);
        side.castShadow = true;
        side.receiveShadow = true;
        this.sinkGroup.add(side);
      });

      const back = new T.Mesh(new T.BoxGeometry(1.36, 0.74, 0.06), this.mats.cabinetDark);
      back.position.set(0, 0.47, -0.27);
      this.sinkGroup.add(back);

      // Porta esquerda fechada azul-clara + porta direita ABERTA revelando o cano!
      const leftDoor = new T.Mesh(new T.BoxGeometry(0.58, 0.70, 0.04), this.mats.cabinetMint);
      leftDoor.position.set(-0.31, 0.47, 0.29);
      leftDoor.castShadow = true;
      this.sinkGroup.add(leftDoor);

      const leftKnob = new T.Mesh(new T.SphereGeometry(0.025, 10, 8), this.mats.chrome);
      leftKnob.position.set(-0.07, 0.52, 0.32);
      this.sinkGroup.add(leftKnob);

      // Porta direita escancarada para a direita!
      this.openDoorPivot = new T.Group();
      this.openDoorPivot.position.set(0.60, 0.47, 0.29);
      this.openDoorPivot.rotation.y = 1.65;
      const rightDoor = new T.Mesh(new T.BoxGeometry(0.58, 0.70, 0.04), this.mats.cabinetMint);
      rightDoor.position.set(-0.29, 0, 0);
      rightDoor.castShadow = true;
      this.openDoorPivot.add(rightDoor);
      const rightKnob = new T.Mesh(new T.SphereGeometry(0.025, 10, 8), this.mats.chrome);
      rightKnob.position.set(-0.52, 0.05, 0.03);
      this.openDoorPivot.add(rightKnob);
      this.sinkGroup.add(this.openDoorPivot);

      // Bancada creme + cuba inox da pia
      const counterL = new T.Mesh(new T.BoxGeometry(0.42, 0.06, 0.66), this.mats.counterTop);
      counterL.position.set(-0.48, 0.87, 0);
      counterL.castShadow = true;
      counterL.receiveShadow = true;
      this.sinkGroup.add(counterL);

      const counterR = new T.Mesh(new T.BoxGeometry(0.30, 0.06, 0.66), this.mats.counterTop);
      counterR.position.set(0.54, 0.87, 0);
      counterR.castShadow = true;
      counterR.receiveShadow = true;
      this.sinkGroup.add(counterR);

      const counterBack = new T.Mesh(new T.BoxGeometry(0.68, 0.06, 0.16), this.mats.counterTop);
      counterBack.position.set(0.06, 0.87, -0.25);
      this.sinkGroup.add(counterBack);

      const counterFront = new T.Mesh(new T.BoxGeometry(0.68, 0.06, 0.10), this.mats.counterTop);
      counterFront.position.set(0.06, 0.87, 0.28);
      this.sinkGroup.add(counterFront);

      // Cuba inox
      const basinBottom = new T.Mesh(new T.BoxGeometry(0.66, 0.04, 0.42), this.mats.sinkBasin);
      basinBottom.position.set(0.06, 0.72, 0.02);
      this.sinkGroup.add(basinBottom);

      const rim = new T.Mesh(new T.BoxGeometry(0.70, 0.03, 0.46), this.mats.chrome);
      rim.position.set(0.06, 0.89, 0.02);
      this.sinkGroup.add(rim);

      // Torneira cromada em arco
      const faucetBase = new T.Mesh(new T.CylinderGeometry(0.032, 0.04, 0.14, 12), this.mats.chrome);
      faucetBase.position.set(0.06, 0.96, -0.22);
      this.sinkGroup.add(faucetBase);

      const faucetArch = new T.Mesh(new T.TorusGeometry(0.09, 0.018, 10, 18, Math.PI), this.mats.chrome);
      faucetArch.position.set(0.06, 1.03, -0.13);
      faucetArch.rotation.y = Math.PI / 2;
      this.sinkGroup.add(faucetArch);

      // --- CANO PVC AZUL BRILHANTE + REGISTRO DE LATAO + JUNTA INCHANDO ---
      this.pipeGroup = new T.Group();
      this.pipeGroup.position.set(0.22, 0.48, 0.06);
      this.sinkGroup.add(this.pipeGroup);

      // Tubo vertical vindo da cuba
      const pipeVert = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.44, 16), this.mats.pvcBlue);
      pipeVert.position.set(0, 0.12, 0);
      pipeVert.castShadow = true;
      this.pipeGroup.add(pipeVert);

      // Tubo horizontal saindo para frente
      const pipeHoriz = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.34, 16), this.mats.pvcBlue);
      pipeHoriz.rotation.x = Math.PI / 2;
      pipeHoriz.position.set(0, -0.06, 0.16);
      pipeHoriz.castShadow = true;
      this.pipeGroup.add(pipeHoriz);

      // Registro de latao com volante vermelho
      const valveBody = new T.Mesh(new T.CylinderGeometry(0.068, 0.068, 0.09, 14), this.mats.brass);
      valveBody.rotation.x = Math.PI / 2;
      valveBody.position.set(0, -0.06, 0.08);
      this.pipeGroup.add(valveBody);

      const valveWheel = new T.Mesh(new T.TorusGeometry(0.062, 0.014, 8, 16), this.mats.wrenchRed);
      valveWheel.position.set(-0.08, -0.06, 0.08);
      valveWheel.rotation.y = Math.PI / 2;
      this.pipeGroup.add(valveWheel);

      // JUNTA INCHANDO FEITO BALAO (B3-B4!)
      this.bulgeJoint = new T.Mesh(new T.SphereGeometry(0.075, 18, 14), this.mats.pvcJoint);
      this.bulgeJoint.position.set(0, -0.06, 0.30);
      this.bulgeJoint.castShadow = true;
      this.pipeGroup.add(this.bulgeJoint);

      // Anel de aperto na junta
      this.jointCollar = new T.Mesh(new T.TorusGeometry(0.062, 0.016, 10, 18), this.mats.brass);
      this.jointCollar.position.set(0, -0.06, 0.24);
      this.pipeGroup.add(this.jointCollar);

      // Jato fino inicial de agua vazando da junta (B1-B4)
      this.leakJetGroup = new T.Group();
      this.leakJetGroup.position.set(0, -0.06, 0.36);
      this.pipeGroup.add(this.leakJetGroup);
      this.leakDrops = [];
      for (let i = 0; i < 8; i++) {
        const drop = new T.Mesh(new T.SphereGeometry(0.022, 8, 8), this.mats.waterCyan);
        this.leakJetGroup.add(drop);
        this.leakDrops.push({ mesh: drop, seed: i / 8 });
      }
    }

    _buildPipeWrench(T) {
      // Chave inglesa vermelha gigante (segurada pelo Voce em B3-B4 em y <= 0.78!)
      this.wrenchGroup = new T.Group();
      this.group.add(this.wrenchGroup);

      const handle = new T.Mesh(new T.BoxGeometry(0.46, 0.065, 0.042), this.mats.wrenchRed);
      handle.position.set(-0.10, 0, 0);
      handle.castShadow = true;
      this.wrenchGroup.add(handle);

      const head = new T.Mesh(new T.BoxGeometry(0.14, 0.14, 0.052), this.mats.wrenchMetal);
      head.position.set(0.16, 0.01, 0);
      head.castShadow = true;
      this.wrenchGroup.add(head);

      const jaw = new T.Mesh(new T.BoxGeometry(0.09, 0.05, 0.052), this.mats.wrenchMetal);
      jaw.position.set(0.20, 0.06, 0);
      this.wrenchGroup.add(jaw);

      const nut = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 0.06, 10), this.mats.brass);
      nut.rotation.x = Math.PI / 2;
      nut.position.set(0.13, -0.04, 0);
      this.wrenchGroup.add(nut);
    }

    _buildFlyingCap(T) {
      // Tampao do cano que DECOLA e passa colado na lente da camera em B5a!
      this.flyingCap = new T.Group();
      const capCyl = new T.Mesh(new T.CylinderGeometry(0.072, 0.068, 0.09, 16), this.mats.pvcBlue);
      capCyl.rotation.x = Math.PI / 2;
      this.flyingCap.add(capCyl);
      const capRim = new T.Mesh(new T.TorusGeometry(0.072, 0.018, 10, 18), this.mats.brass);
      this.flyingCap.add(capRim);
      this.flyingCap.visible = false;
      this.group.add(this.flyingCap);
    }

    _buildWaterGeyserAndBubbles(T) {
      // GEISER GIGANTE DE 32 PUFFS TURQUESA/BRANCO + BOLHAS DE SABAO EM B5!
      this.geyserGroup = new T.Group();
      this.geyserGroup.position.set(-0.03, 0.42, -0.56);
      this.group.add(this.geyserGroup);

      this.geyserPuffs = [];
      for (let i = 0; i < 32; i++) {
        const isFoam = i % 2 === 1;
        const rad = 0.052 + ((i * 7) % 5) * 0.016;
        const mesh = new T.Mesh(
          new T.SphereGeometry(rad, 10, 8),
          isFoam ? this.mats.waterFoam : this.mats.waterCyan
        );
        mesh.visible = false;
        this.geyserGroup.add(mesh);
        this.geyserPuffs.push({
          mesh,
          seed: i / 32,
          angle: (i * 2.39996) % (Math.PI * 2),
          spread: 0.16 + ((i * 13) % 10) * 0.055,
          heightMul: 0.85 + ((i * 5) % 7) * 0.16
        });
      }

      // Bolhas de sabao flutuantes na pia (B3-B6)
      this.soapBubbles = [];
      for (let i = 0; i < 16; i++) {
        const bRad = 0.028 + (i % 4) * 0.014;
        const bMesh = new T.Mesh(new T.SphereGeometry(bRad, 10, 8), this.mats.soapBubble);
        bMesh.visible = false;
        this.sinkGroup.add(bMesh);
        this.soapBubbles.push({
          mesh: bMesh,
          seed: i / 16,
          baseX: -0.18 + ((i * 11) % 9) * 0.06,
          baseZ: -0.12 + ((i * 7) % 5) * 0.06
        });
      }
    }

    _buildPlungerAndHat(T) {
      // Desentupidor vermelho apoiado no chao (B1-B4) -> voa em B5 -> vira chapeu na cabeca do Voce (B5b-B6)!
      this.plungerGroup = new T.Group();
      this.group.add(this.plungerGroup);

      const cup = new T.Mesh(new T.SphereGeometry(0.135, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), this.mats.plungerRed);
      cup.position.y = 0.0;
      cup.castShadow = true;
      this.plungerGroup.add(cup);

      const rim = new T.Mesh(new T.TorusGeometry(0.132, 0.018, 8, 18), this.mats.plungerRed);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -0.015;
      this.plungerGroup.add(rim);

      const stick = new T.Mesh(new T.CylinderGeometry(0.020, 0.022, 0.34, 10), this.mats.woodHandle);
      stick.position.y = 0.24;
      stick.castShadow = true;
      this.plungerGroup.add(stick);
    }

    _buildEasterEggDuck(T) {
      // EASTER EGG: Patinho amarelo com bone azul de encanador na cuba da pia!
      this.duckGroup = new T.Group();
      this.duckGroup.position.set(0.12, 0.86, 0.02);
      this.duckGroup.visible = false;
      this.sinkGroup.add(this.duckGroup);

      const body = new T.Mesh(new T.SphereGeometry(0.082, 14, 10), this.mats.duckYellow);
      body.scale.set(1.15, 0.85, 0.95);
      this.duckGroup.add(body);

      const head = new T.Mesh(new T.SphereGeometry(0.056, 14, 10), this.mats.duckYellow);
      head.position.set(0.045, 0.088, 0);
      this.duckGroup.add(head);

      const beak = new T.Mesh(new T.ConeGeometry(0.026, 0.048, 8), this.mats.duckBeak);
      beak.rotation.z = -Math.PI / 2;
      beak.position.set(0.105, 0.082, 0);
      this.duckGroup.add(beak);

      [-0.026, 0.026].forEach((ez) => {
        const eye = new T.Mesh(new T.SphereGeometry(0.010, 8, 6), this.mats.black);
        eye.position.set(0.082, 0.105, ez);
        this.duckGroup.add(eye);
      });

      // Bonezinho azul de encanador!
      const capCrown = new T.Mesh(new T.SphereGeometry(0.052, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), this.mats.capBlue);
      capCrown.position.set(0.040, 0.120, 0);
      this.duckGroup.add(capCrown);

      const capBrim = new T.Mesh(new T.BoxGeometry(0.055, 0.012, 0.072), this.mats.capBlue);
      capBrim.position.set(0.075, 0.125, 0);
      this.duckGroup.add(capBrim);
    }

    /**
     * Atualiza o estado deterministico do cano, chave inglesa, geiser, tampao fly-by, patinho e desentupidor.
     */
    update(time, state = {}) {
      const bulge = clamp(state.bulge || 0, 0, 1);
      const wrenchActive = Boolean(state.wrenchActive);
      const wrenchPos = state.wrenchPos || { x: -0.96, y: 0.16, z: -0.78 };
      const wrenchRot = state.wrenchRot || { x: 0, y: 0.3, z: 0 };
      const capFlyP = clamp(state.capFlyP || 0, 0, 1);
      const geyserP = clamp(state.geyserP || 0, 0, 1);
      const duckPop = clamp(state.duckPop || 0, 0, 1);
      const plungerState = state.plunger || { mode: 'floor' };

      // 1. Junta inchando feito balao + tremor + brilho vermelho de alerta
      const rattle = bulge > 0.2 ? Math.sin(time * 36.0) * 0.018 * bulge : 0;
      const swellScale = 1.0 + bulge * 1.45 + Math.sin(time * 14.0) * 0.08 * bulge;
      this.bulgeJoint.scale.set(swellScale, swellScale, swellScale * 0.92);
      this.bulgeJoint.position.set(rattle, -0.06 + Math.cos(time * 31.0) * 0.012 * bulge, 0.30);
      this.bulgeJoint.visible = capFlyP < 0.02;
      this.mats.pvcJoint.emissiveIntensity = bulge > 0.4 ? 0.35 + Math.sin(time * 16.0) * 0.30 : 0.0;

      // Vazamento inicial antes da explosao
      const leakVis = capFlyP < 0.05;
      this.leakJetGroup.visible = leakVis;
      if (leakVis) {
        for (let i = 0; i < this.leakDrops.length; i++) {
          const ld = this.leakDrops[i];
          const cyc = (time * 2.6 + ld.seed) % 1;
          ld.mesh.position.set(
            Math.sin(cyc * 9.0 + i) * 0.04,
            0.05 * Math.sin(cyc * Math.PI) - cyc * cyc * 0.36,
            cyc * 0.38
          );
          ld.mesh.scale.setScalar((1 - cyc * 0.5) * (0.8 + bulge * 0.6));
        }
      }

      // 2. Chave inglesa vermelha gigante (no chao/caixa ou nas maos do Voce com y <= 0.78!)
      if (wrenchActive) {
        this.wrenchGroup.position.set(wrenchPos.x, Math.min(0.78, wrenchPos.y), wrenchPos.z);
        this.wrenchGroup.rotation.set(wrenchRot.x || 0, wrenchRot.y || 0, wrenchRot.z || 0);
        this.wrenchGroup.scale.setScalar(1.22);
      } else {
        this.wrenchGroup.position.set(-0.98, 0.06, -0.68);
        this.wrenchGroup.rotation.set(0, 0.45, 0.05);
        this.wrenchGroup.scale.setScalar(1.0);
      }

      // 3. Tampao do cano em FLY-BY na lente da camera em B5a!
      if (capFlyP > 0.01 && capFlyP < 0.99) {
        this.flyingCap.visible = true;
        const arcY = Math.sin(capFlyP * Math.PI) * 0.65;
        this.flyingCap.position.set(
          lerp(-0.03, -0.14, capFlyP),
          lerp(0.42, 1.38, capFlyP) + arcY * 0.35,
          lerp(-0.56, 3.25, capFlyP)
        );
        const fSc = 1.0 + Math.sin(capFlyP * Math.PI) * 1.65;
        this.flyingCap.scale.setScalar(fSc);
        this.flyingCap.rotation.set(capFlyP * 14.0, capFlyP * 9.0, capFlyP * 11.0);
      } else {
        this.flyingCap.visible = false;
      }

      // 4. GEISER DE AGUA TURQUESA/BRANCO DE 32 PUFFS + BOLHAS DE SABAO!
      if (geyserP > 0.01) {
        const fade = geyserP < 0.80 ? 1.0 : clamp(1 - (geyserP - 0.80) / 0.20, 0, 1);
        for (let i = 0; i < this.geyserPuffs.length; i++) {
          const gp = this.geyserPuffs[i];
          const cyc = (geyserP * 1.9 + gp.seed) % 1;
          gp.mesh.visible = fade > 0.02;
          const r = gp.spread * cyc * 2.15;
          const h = Math.sin(cyc * Math.PI) * 1.12 * gp.heightMul + cyc * 0.14;
          gp.mesh.position.set(
            Math.cos(gp.angle + time * 1.5) * r,
            h,
            Math.sin(gp.angle + time * 1.5) * r + cyc * 0.45
          );
          const pSc = (0.50 + Math.sin(cyc * Math.PI) * 1.05) * fade;
          gp.mesh.scale.setScalar(Math.max(0.05, pSc));
        }
      } else {
        for (let i = 0; i < this.geyserPuffs.length; i++) this.geyserPuffs[i].mesh.visible = false;
      }

      // Bolhas de sabao subindo da pia (B3-B6)
      const bubbleAmp = clamp(duckPop + geyserP, 0, 1);
      for (let i = 0; i < this.soapBubbles.length; i++) {
        const sb = this.soapBubbles[i];
        sb.mesh.visible = bubbleAmp > 0.08;
        if (sb.mesh.visible) {
          const cyc = (time * 0.55 + sb.seed) % 1;
          sb.mesh.position.set(
            sb.baseX + Math.sin(time * 2.4 + i) * 0.08,
            0.90 + cyc * (0.75 + geyserP * 0.65),
            sb.baseZ + Math.cos(time * 2.1 + i) * 0.06
          );
          sb.mesh.scale.setScalar((0.6 + Math.sin(cyc * Math.PI) * 0.6) * clamp(bubbleAmp, 0.4, 1.2));
        }
      }

      // 5. Easter Egg: Patinho de borracha com bone azul de encanador na pia (B3-B6)
      this.duckGroup.visible = duckPop > 0.05;
      if (this.duckGroup.visible) {
        this.duckGroup.position.y = lerp(0.76, 0.94, duckPop) + Math.abs(Math.sin(time * 7.5)) * 0.05 * duckPop;
        this.duckGroup.rotation.y = Math.sin(time * 3.2) * 0.35;
        this.duckGroup.rotation.z = Math.sin(time * 6.4) * 0.14;
        this.duckGroup.scale.setScalar(0.85 + duckPop * 0.35);
      }

      // 6. Desentupidor vermelho: chao -> voo -> chapeu de ponta-cabeca na cabeca do Voce!
      if (plungerState.mode === 'hat' && plungerState.headPos) {
        this.plungerGroup.position.set(
          plungerState.headPos.x - 0.02,
          plungerState.headPos.y,
          plungerState.headPos.z
        );
        this.plungerGroup.rotation.set(
          -0.52 + Math.sin(time * 7.0) * 0.04,
          0.18,
          -0.46 + Math.sin(time * 5.0) * 0.05
        );
        this.plungerGroup.scale.setScalar(1.04);
      } else if (plungerState.mode === 'flying' && plungerState.flyPos) {
        this.plungerGroup.position.set(plungerState.flyPos.x, plungerState.flyPos.y, plungerState.flyPos.z);
        this.plungerGroup.rotation.set(plungerState.flyRot || 0, 0.3, (plungerState.flyRot || 0) * 0.6);
        this.plungerGroup.scale.setScalar(1.05);
      } else {
        // Encostado ao lado direito do gabinete de pia
        this.plungerGroup.position.set(0.56, 0.03, -0.78);
        this.plungerGroup.rotation.set(0.08, 0.0, -0.14);
        this.plungerGroup.scale.setScalar(1.0);
      }
    }
  }

  global.CanoCozinha3D = CanoCozinha3D;
})(typeof window !== 'undefined' ? window : globalThis);
