/**
 * BarraOlimpica3D.js -- Prop Comico Cartoon 3D (Padrao Distorcao Viral Academia)
 * Barra olimpica cromada de 60kg com articulacao dupla nas pontas (enverga num "U" cartoon real!),
 * presilhas vermelhas com alavanca e pulso de alerta (slipWarning), 3 anilhas coloridas de borracha
 * (20kg vermelha, 15kg amarela, 10kg azul) que quicam feito bola de borracha com squash & stretch
 * no impacto, anilha vermelha de 20kg acertando o suporte de giz e MEGA nuvem cartoon de 32 puffs!
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class BarraOlimpica3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para BarraOlimpica3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'BarraOlimpica3D';

      this.scale = opts.scale !== undefined ? opts.scale : 1.0;

      // Grupo da barra (centrado nas maos: local X = comprimento da barra!)
      this.barGroup = new T.Group();
      this.barGroup.scale.setScalar(this.scale);
      this.group.add(this.barGroup);

      // Grupo no mundo para anilhas + presilha soltas + 32 puffs cartoon de giz de magnesio!
      this.droppedGroup = new T.Group();
      this.group.add(this.droppedGroup);

      this._buildMaterials(T);
      this._buildBarbell(T);
      this._buildDroppedPlates(T);
    }

    _buildMaterials(T) {
      this.mats = {
        chrome: new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.16 }),
        knurl: new T.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.72, roughness: 0.48 }),
        sleeve: new T.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.86, roughness: 0.22 }),
        collarRed: new T.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 0.06,
          roughness: 0.28,
          metalness: 0.18
        }),
        rightCollarRed: new T.MeshStandardMaterial({
          color: 0xff2222,
          emissive: 0xff1e1e,
          emissiveIntensity: 0.10,
          roughness: 0.22,
          metalness: 0.18
        }),
        plateRed: new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.44, metalness: 0.08 }),
        plateYellow: new T.MeshStandardMaterial({ color: 0xeab308, roughness: 0.42, metalness: 0.08 }),
        plateBlue: new T.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.42, metalness: 0.08 }),
        plateAccent: new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.36, metalness: 0.10 }),
        hubDark: new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.52, metalness: 0.48 }),
        chalkDense: new T.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xf1f5f9,
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.84,
          roughness: 0.94,
          depthWrite: false
        }),
        chalkMid: new T.MeshStandardMaterial({
          color: 0xf8fafc,
          emissive: 0xe2e8f0,
          emissiveIntensity: 0.14,
          transparent: true,
          opacity: 0.66,
          roughness: 0.94,
          depthWrite: false
        }),
        chalkDust: new T.MeshStandardMaterial({
          color: 0xf8fafc,
          emissive: 0xffffff,
          emissiveIntensity: 0.20,
          transparent: true,
          opacity: 0.46,
          roughness: 0.96,
          depthWrite: false
        })
      };
    }

    _makePlateMesh(T, radius, thickness, mat) {
      const g = new T.Group();
      const body = new T.Mesh(new T.CylinderGeometry(radius, radius, thickness, 26), mat);
      body.rotation.z = Math.PI / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const rim = new T.Mesh(new T.TorusGeometry(radius * 0.86, thickness * 0.18, 8, 24), mat);
      rim.rotation.y = Math.PI / 2;
      g.add(rim);

      const ring = new T.Mesh(new T.TorusGeometry(radius * 0.56, 0.0065, 6, 22), this.mats.plateAccent);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = thickness * 0.48;
      g.add(ring);

      const ringBack = ring.clone();
      ringBack.position.x = -thickness * 0.48;
      g.add(ringBack);

      const hub = new T.Mesh(new T.CylinderGeometry(radius * 0.25, radius * 0.25, thickness + 0.009, 16), this.mats.hubDark);
      hub.rotation.z = Math.PI / 2;
      g.add(hub);
      return g;
    }

    _makeCollarGroup(T, mat) {
      const g = new T.Group();
      const body = new T.Mesh(new T.CylinderGeometry(0.056, 0.056, 0.048, 16), mat);
      body.rotation.z = Math.PI / 2;
      body.castShadow = true;
      g.add(body);

      // Alavanca cromada + bolinha vermelha grande para leitura instantanea em B4!
      const lever = new T.Mesh(new T.BoxGeometry(0.024, 0.076, 0.020), this.mats.chrome);
      lever.position.set(0.0, 0.062, 0.012);
      lever.rotation.z = -0.22;
      g.add(lever);

      const tip = new T.Mesh(new T.SphereGeometry(0.017, 10, 8), mat);
      tip.position.set(0.007, 0.098, 0.014);
      g.add(tip);
      return g;
    }

    _buildBarbell(T) {
      // Eixo central segmentado em 5 trechos articulados para curvar num "U" cartoon absurdo sob 60kg!
      const centerGeo = new T.CylinderGeometry(0.021, 0.021, 0.52, 16);
      centerGeo.rotateZ(Math.PI / 2);
      this.centerShaft = new T.Mesh(centerGeo, this.mats.chrome);
      this.centerShaft.castShadow = true;
      this.barGroup.add(this.centerShaft);

      [-0.18, 0.18].forEach((kx) => {
        const kn = new T.Mesh(new T.CylinderGeometry(0.024, 0.024, 0.14, 14), this.mats.knurl);
        kn.rotation.z = Math.PI / 2;
        kn.position.x = kx;
        this.barGroup.add(kn);
      });

      // Braco esquerdo bi-articulado (leftWing -> leftOuter) para curva em "U" cartoon!
      this.leftWing = new T.Group();
      this.leftWing.position.set(-0.26, 0, 0);
      const wingL = new T.Mesh(new T.CylinderGeometry(0.021, 0.021, 0.24, 14), this.mats.chrome);
      wingL.rotation.z = Math.PI / 2;
      wingL.position.x = -0.12;
      this.leftWing.add(wingL);

      this.leftOuter = new T.Group();
      this.leftOuter.position.set(-0.22, 0, 0);
      this.leftWing.add(this.leftOuter);

      const sleeveL = new T.Mesh(new T.CylinderGeometry(0.033, 0.033, 0.32, 16), this.mats.sleeve);
      sleeveL.rotation.z = Math.PI / 2;
      sleeveL.position.x = -0.18;
      sleeveL.castShadow = true;
      this.leftOuter.add(sleeveL);

      const pL1 = this._makePlateMesh(T, 0.210, 0.048, this.mats.plateRed);
      pL1.position.x = -0.08;
      this.leftOuter.add(pL1);
      const pL2 = this._makePlateMesh(T, 0.175, 0.040, this.mats.plateYellow);
      pL2.position.x = -0.140;
      this.leftOuter.add(pL2);
      const pL3 = this._makePlateMesh(T, 0.142, 0.034, this.mats.plateBlue);
      pL3.position.x = -0.192;
      this.leftOuter.add(pL3);

      const collarL = this._makeCollarGroup(T, this.mats.collarRed);
      collarL.position.x = -0.236;
      this.leftOuter.add(collarL);
      this.barGroup.add(this.leftWing);

      // Braco direito bi-articulado (rightWing -> rightOuter) -- onde a trava solta em B4/B5!
      this.rightWing = new T.Group();
      this.rightWing.position.set(0.26, 0, 0);
      const wingR = new T.Mesh(new T.CylinderGeometry(0.021, 0.021, 0.24, 14), this.mats.chrome);
      wingR.rotation.z = Math.PI / 2;
      wingR.position.x = 0.12;
      this.rightWing.add(wingR);

      this.rightOuter = new T.Group();
      this.rightOuter.position.set(0.22, 0, 0);
      this.rightWing.add(this.rightOuter);

      const sleeveR = new T.Mesh(new T.CylinderGeometry(0.033, 0.033, 0.34, 16), this.mats.sleeve);
      sleeveR.rotation.z = Math.PI / 2;
      sleeveR.position.x = 0.19;
      sleeveR.castShadow = true;
      this.rightOuter.add(sleeveR);

      this.rightPlatesOnBar = [
        { mesh: this._makePlateMesh(T, 0.210, 0.048, this.mats.plateRed), baseX: 0.08 },
        { mesh: this._makePlateMesh(T, 0.175, 0.040, this.mats.plateYellow), baseX: 0.140 },
        { mesh: this._makePlateMesh(T, 0.142, 0.034, this.mats.plateBlue), baseX: 0.192 }
      ];
      this.rightPlatesOnBar.forEach((p) => {
        p.mesh.position.x = p.baseX;
        this.rightOuter.add(p.mesh);
      });

      this.rightCollar = this._makeCollarGroup(T, this.mats.rightCollarRed);
      this.rightCollar.position.x = 0.238;
      this.rightOuter.add(this.rightCollar);
      this.barGroup.add(this.rightWing);
    }

    _buildDroppedPlates(T) {
      // 3 anilhas que quicam feito BOLA DE BORRACHA no tatame livre (sem nunca atravessar pernas da Camila!)
      this.fallingItems = [
        {
          // Anilha azul (10kg) quica e deita chata no tatame entre Voce e Camila (primeiro plano direita)
          mesh: this._makePlateMesh(T, 0.142, 0.034, this.mats.plateBlue),
          radius: 0.142,
          thickness: 0.034,
          delay: 0.0,
          midX: 0.42,
          midZ: 0.46,
          endX: 0.34,
          endZ: 0.56,
          bounceH: 0.44,
          rollDir: 1,
          useWorldTarget: true
        },
        {
          // Anilha amarela (15kg) quica alto e deita chata no tatame (primeiro plano centro)
          mesh: this._makePlateMesh(T, 0.175, 0.040, this.mats.plateYellow),
          radius: 0.175,
          thickness: 0.040,
          delay: 0.10,
          midX: 0.02,
          midZ: 0.42,
          endX: -0.06,
          endZ: 0.54,
          bounceH: 0.40,
          rollDir: -1,
          useWorldTarget: true
        },
        {
          // Anilha vermelha (20kg) acerta o suporte de giz (1.02, -0.42) e rebate livre pro tatame central (0.28, -0.08)!
          mesh: this._makePlateMesh(T, 0.210, 0.048, this.mats.plateRed),
          radius: 0.210,
          thickness: 0.048,
          delay: 0.18,
          midX: 1.02,
          midZ: -0.42,
          endX: 0.28,
          endZ: -0.08,
          bounceH: 0.36,
          rollDir: 1,
          useWorldTarget: true
        }
      ];
      this.fallingItems.forEach((it) => {
        it.mesh.visible = false;
        this.droppedGroup.add(it.mesh);
      });

      this.popCollar = this._makeCollarGroup(T, this.mats.rightCollarRed);
      this.popCollar.visible = false;
      this.droppedGroup.add(this.popCollar);

      // Nuvem MASSIVA cartoon de 32 puffs de giz branco de magnesio!
      this.chalkPuffs = [];
      const puffGeo = new T.SphereGeometry(0.12, 10, 8);
      const tierMats = [this.mats.chalkDense, this.mats.chalkMid, this.mats.chalkDust];
      for (let i = 0; i < 32; i++) {
        const tier = i < 14 ? 0 : (i < 25 ? 1 : 2);
        const m = new T.Mesh(puffGeo, tierMats[tier]);
        m.visible = false;
        this.droppedGroup.add(m);

        const frac = i / 32;
        const fanAngle = Math.PI * 0.54 + (i % 16) * (Math.PI * 1.22 / 16) + ((i * 37) % 10) * 0.05;
        const speedX = 0.48 + ((i * 53) % 100) / 100 * 1.48;
        const speedZ = 0.32 + ((i * 29) % 100) / 100 * 1.02;
        const liftY = tier === 0
          ? (0.20 + ((i * 19) % 10) * 0.095)
          : (tier === 1 ? (0.05 + ((i * 23) % 10) * 0.075) : (0.58 + ((i * 17) % 6) * 0.14));
        const baseScale = tier === 0
          ? (1.28 + (i % 4) * 0.28)
          : (tier === 1 ? (0.94 + (i % 3) * 0.26) : (0.56 + (i % 3) * 0.18));

        this.chalkPuffs.push({
          mesh: m,
          tier,
          fanAngle,
          speedX,
          speedZ,
          liftY,
          baseScale,
          seed: frac * Math.PI * 2 + i * 0.47,
          biasLeft: tier === 0 ? -0.64 : (tier === 1 ? -0.38 : -0.48)
        });
      }
    }

    /**
     * Atualiza a barra olimpica cartoon 100% deterministicamente:
     * - pos: {x, y, z} centro entre as duas maos
     * - rotY, rotZ: orientacao e inclinacao
     * - bendAmp: envergamento sob peso (0..2.8 -> 2.2+ vira literal U cartoon!)
     * - strainAmp: tremor muscular de esforco (0..1)
     * - slipWarning: 0..1 (suspense B4: trava vermelha vibrando e quase saindo da ponta!)
     * - dropProg: 0 (anilhas presas) -> 1 (trava dispara foguete e 3 anilhas quicam feito bola de borracha!)
     * - chalkProg: 0..1 (explosao cartoon de 32 puffs de giz de magnesio em B5!)
     * - chalkSettle: 0..1 (poeira de giz assentando lentamente em B6!)
     * - chalkOrigin: {x, y, z} origem do pote de giz tombado
     */
    update(time, opts = {}) {
      const t = Number(time) || 0;
      const pos = opts.pos || { x: 0, y: 0.72, z: 0.35 };
      const rotY = opts.rotY || 0;
      const rotZ = opts.rotZ || 0;
      const bendAmp = clamp(opts.bendAmp !== undefined ? opts.bendAmp : 0.65, 0, 2.8);
      const strainAmp = clamp(opts.strainAmp || 0, 0, 1.0);
      const slipWarning = clamp(opts.slipWarning || 0, 0, 1.0);
      const dropProg = clamp(opts.dropProg || 0, 0, 1.0);
      const chalkProg = clamp(opts.chalkProg !== undefined ? opts.chalkProg : clamp((dropProg - 0.30) / 0.60, 0, 1), 0, 1);
      const chalkSettle = clamp(opts.chalkSettle || 0, 0, 1);

      const jitterX = Math.sin(t * 26.0) * 0.010 * strainAmp;
      const jitterY = Math.cos(t * 30.0) * 0.011 * strainAmp;

      // Clamping rigido <= 0.825 para garantia absoluta de ZERO oclusao facial!
      const safeBarY = Math.min(0.825, pos.y + jitterY);
      this.barGroup.position.set(pos.x + jitterX, safeBarY, pos.z);
      this.barGroup.rotation.set(0, rotY, rotZ);

      // Envergamento cartoon em "U" bi-articulado (lado direito chicoteia pra cima quando as anilhas voam!)
      const wobbleBend = Math.sin(t * 16.0) * 0.025 * strainAmp;
      const leftInnerBend = 0.115 * bendAmp + wobbleBend;
      const leftOuterBend = 0.125 * bendAmp + wobbleBend * 0.8;

      const rightWeightLeft = 1.0 - clamp(dropProg * 2.6, 0, 1);
      const whipRebound = dropProg > 0.12 && dropProg < 0.85
        ? Math.sin((dropProg - 0.12) * Math.PI * 5.0) * (1 - dropProg) * 0.14
        : 0;
      const rightInnerBend = -0.115 * bendAmp * (0.08 + 0.92 * rightWeightLeft) + whipRebound;
      const rightOuterBend = -0.125 * bendAmp * (0.05 + 0.95 * rightWeightLeft) + whipRebound * 1.1;

      this.leftWing.rotation.z = leftInnerBend;
      this.leftOuter.rotation.z = leftOuterBend;
      this.rightWing.rotation.z = rightInnerBend;
      this.rightOuter.rotation.z = rightOuterBend;

      // Suspense B4 (slipWarning): trava vermelha pisca, vibra violento e quase cai da ponta!
      const warnPulse = 0.5 + 0.5 * Math.sin(t * 26.0);
      this.mats.rightCollarRed.emissiveIntensity = 0.10 + slipWarning * (0.28 + 0.42 * warnPulse);

      const preSlide = slipWarning * 0.098;
      const dropSlide = clamp(dropProg * 4.5, 0, 1) * 0.09;
      this.rightCollar.visible = dropProg < 0.04;
      this.rightCollar.position.x = 0.238 + preSlide + dropSlide;
      this.rightCollar.position.y = Math.sin(t * 46.0) * 0.012 * slipWarning;
      this.rightCollar.position.z = Math.cos(t * 41.0) * 0.010 * slipWarning;
      this.rightCollar.rotation.set(
        Math.sin(t * 34.0) * 0.32 * slipWarning,
        0,
        Math.cos(t * 31.0) * 0.26 * slipWarning
      );
      const collarPop = 1.0 + slipWarning * (0.14 + 0.10 * warnPulse);
      this.rightCollar.scale.setScalar(collarPop);

      // Posicao mundial aproximada da ponta direita da barra (origem do disparo!)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const tipWorldX = pos.x + cosY * 0.68 * this.scale;
      const tipWorldY = Math.max(0.28, safeBarY + Math.sin(rotZ) * 0.60 * this.scale);
      const tipWorldZ = pos.z - sinY * 0.68 * this.scale;

      // Presilha vermelha dispara feito foguete quicando no tatame!
      if (dropProg >= 0.04) {
        const cp = clamp((dropProg - 0.04) / 0.56, 0, 1);
        const arcLift = Math.sin(cp * Math.PI) * 0.62 * (1 - cp * 0.28);
        const bounce = Math.abs(Math.sin(cp * Math.PI * 3.0)) * (1 - cp) * 0.26;
        this.popCollar.visible = true;
        this.popCollar.position.set(
          tipWorldX + 0.16 + cp * 0.68,
          Math.max(0.056, lerp(tipWorldY, 0.056, Math.min(1, cp * 1.50)) + arcLift + bounce),
          tipWorldZ + cp * 0.52
        );
        this.popCollar.rotation.set(cp * 14.0, cp * 8.0, cp * 18.0);
        this.popCollar.scale.setScalar(1.12);
      } else {
        this.popCollar.visible = false;
      }

      // 3 anilhas direitas: saem uma por uma e quicam feito BOLA DE BORRACHA com squash & stretch!
      for (let i = 0; i < 3; i++) {
        const onBar = this.rightPlatesOnBar[2 - i]; // azul -> amarela -> vermelha (20kg)
        const fall = this.fallingItems[i];
        const trigger = 0.04 + fall.delay;
        const localDrop = clamp((dropProg - trigger) / 0.62, 0, 1);

        if (dropProg < trigger) {
          onBar.mesh.visible = true;
          const plateWarnGap = i === 0 ? (0.042 * slipWarning) : (i === 1 ? 0.018 * slipWarning : 0);
          onBar.mesh.position.x = onBar.baseX + plateWarnGap + clamp(dropProg / Math.max(0.01, trigger), 0, 1) * 0.06;
          onBar.mesh.rotation.z = i === 0 ? Math.sin(t * 32.0) * 0.075 * slipWarning : 0;
          fall.mesh.visible = false;
        } else {
          onBar.mesh.visible = false;
          fall.mesh.visible = true;
          const fallPhase = clamp(localDrop / 0.36, 0, 1);
          const rollPhase = clamp((localDrop - 0.36) / 0.64, 0, 1);
          const flatBlend = rollPhase * rollPhase * (3 - 2 * rollPhase);
          const bounceWave = Math.abs(Math.sin(localDrop * Math.PI * 3.0));
          const bounceY = bounceWave * Math.pow(1 - localDrop, 1.45) * (fall.bounceH || 0.38);
          const flatY = (fall.thickness || 0.04) * 0.56 + 0.015;
          const groundY = lerp(fall.radius * 0.94, flatY, flatBlend);

          let fx, fz;
          if (fall.useWorldTarget) {
            if (localDrop < 0.52) {
              const u = localDrop / 0.52;
              fx = lerp(tipWorldX + 0.04, fall.midX, u);
              fz = lerp(tipWorldZ, fall.midZ, u);
            } else {
              const u = (localDrop - 0.52) / 0.48;
              fx = lerp(fall.midX, fall.endX, u);
              fz = lerp(fall.midZ, fall.endZ, u);
            }
          } else {
            fx = tipWorldX + fall.dx * localDrop;
            fz = tipWorldZ + fall.dz * localDrop;
          }

          const fy = lerp(tipWorldY, groundY, fallPhase * fallPhase) + bounceY;
          fall.mesh.position.set(fx, Math.max(flatY, fy), fz);

          // Squash & stretch elastico de bola de borracha nos quiques -> deita 100% chata no tatame!
          const squash = (1 - bounceWave) * (1 - localDrop) * 0.20;
          fall.mesh.scale.set(1 + squash, Math.max(0.78, 1 - squash), 1 + squash);

          const tiltDown = flatBlend * (Math.PI / 2);
          fall.mesh.rotation.set(rollPhase * 4.8 * fall.rollDir * (1 - flatBlend * 0.7), rotY + i * 0.55, tiltDown);
        }
      }

      // Nuvem MASSIVA cartoon de 32 puffs de giz branco de magnesio (explosao B5 -> poeira assentando em B6!)
      const showChalk = chalkProg > 0.01;
      const origin = opts.chalkOrigin || { x: tipWorldX + 0.35, y: 0.72, z: tipWorldZ - 0.50 };

      const envFadeIn = clamp(chalkProg / 0.14, 0, 1);
      this.mats.chalkDense.opacity = envFadeIn * lerp(0.82, 0.24, chalkSettle);
      this.mats.chalkMid.opacity = envFadeIn * lerp(0.64, 0.20, chalkSettle);
      this.mats.chalkDust.opacity = envFadeIn * lerp(0.50, 0.22, chalkSettle);

      for (let i = 0; i < this.chalkPuffs.length; i++) {
        const p = this.chalkPuffs[i];
        p.mesh.visible = showChalk;
        if (!showChalk) continue;

        const expand = 1 - Math.pow(1 - chalkProg, 2.3);
        const driftX = Math.cos(p.fanAngle) * p.speedX * expand + p.biasLeft * expand;
        const driftZ = Math.sin(p.fanAngle) * p.speedZ * expand;

        const settleDrop = chalkSettle * (0.38 + (i % 5) * 0.06);
        const floatSwayX = Math.sin(t * 1.3 + p.seed) * (0.04 + 0.07 * chalkSettle);
        const floatSwayY = Math.cos(t * 1.6 + p.seed * 1.3) * (0.025 + 0.04 * chalkSettle);

        const px = origin.x + driftX + floatSwayX;
        const py = Math.max(
          0.10,
          origin.y + p.liftY * Math.sin(Math.min(1, chalkProg * 1.12) * Math.PI * 0.56) - settleDrop + floatSwayY
        );
        const pz = origin.z + driftZ + Math.sin(t * 1.1 + p.seed) * 0.04;

        p.mesh.position.set(px, Math.min(2.08, py), pz);

        const burstScale = p.baseScale * (0.34 + 1.04 * Math.sin(Math.min(1, chalkProg * 1.15) * Math.PI * 0.55));
        const finalScale = lerp(burstScale, p.baseScale * (p.tier === 2 ? 0.48 : 0.38), chalkSettle);
        p.mesh.scale.set(
          Math.max(0.08, finalScale * 1.18),
          Math.max(0.08, finalScale * 0.84),
          Math.max(0.08, finalScale * 1.06)
        );
      }
    }
  }

  global.BarraOlimpica3D = BarraOlimpica3D;
})(typeof window !== 'undefined' ? window : globalThis);
