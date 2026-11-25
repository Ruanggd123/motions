/**
 * ColchaoInflavel3D.js -- Prop Comico Cartoon 3D: Colchao Inflavel King-Size + Bomba + Easter Egg
 *
 * Componentes:
 * - Colchao inflavel azul/turquesa king-size com gomos, cabeceira e valvula lateral vermelha (`mattressGroup`).
 * - Bomba eletrica amarela/vermelha com medidor de pressao e ponteiro vibrando no vermelho (`pumpGroup`).
 * - Tampao/bico vermelho em fly-by colado na lente em B5a (`flyByPlug`).
 * - Explosao de 32 puffs de ar/espuma + 20 plumas/almofadinhas coloridas em B5 (`explosionGroup`).
 * - Almofada roxa fofa com botoes (`pillowHatGroup`) que pousa limpa na cabeca do Voce em B5b-B6.
 * - Easter Egg: Vaso de cacto fofo com olhoes arregalados (`easterEggGroup`) tremendo na mesinha ao fundo!
 * - 100% deterministico (zero Math.random(), zero NaN).
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class ColchaoInflavel3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para ColchaoInflavel3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'ColchaoInflavel3D';

      this._buildMaterials(T);
      this._buildMattress(T);
      this._buildPump(T);
      this._buildFlyByAndExplosion(T);
      this._buildPillowHat(T);
      this._buildEasterEggCactus(T);
    }

    _buildMaterials(T) {
      this.mats = {
        mattressBlue: new T.MeshStandardMaterial({
          color: 0x0ea5e9,
          emissive: 0x0284c7,
          emissiveIntensity: 0.08,
          roughness: 0.32,
          metalness: 0.06
        }),
        mattressTop: new T.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0369a1,
          emissiveIntensity: 0.05,
          roughness: 0.48
        }),
        mattressTrim: new T.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.35 }),
        valveRed: new T.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.25,
          roughness: 0.25
        }),
        pumpYellow: new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.34, metalness: 0.12 }),
        pumpDark: new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 }),
        gaugeFace: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }),
        gaugeRed: new T.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.45 }),
        puffWhite: new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, transparent: true, opacity: 0.92 }),
        puffBlue: new T.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.45, transparent: true, opacity: 0.90 }),
        pillowPurple: new T.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.55 }),
        pillowPiping: new T.MeshStandardMaterial({ color: 0xfde047, roughness: 0.45 }),
        potTerracotta: new T.MeshStandardMaterial({ color: 0xea580c, roughness: 0.72 }),
        cactusGreen: new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55 }),
        eyeWhite: new T.MeshBasicMaterial({ color: 0xffffff }),
        eyeBlack: new T.MeshBasicMaterial({ color: 0x0f172a })
      };

      this.featherMats = [
        new T.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.45 }),
        new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 }),
        new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.45 }),
        new T.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.45 }),
        new T.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.45 })
      ];
    }

    _buildMattress(T) {
      this.mattressGroup = new T.Group();
      this.mattressGroup.position.set(0.05, 0.0, -0.58);
      this.group.add(this.mattressGroup);

      // Base do colchao inflavel (formato king-size arredondado)
      const baseGeo = new T.BoxGeometry(1.24, 0.34, 1.18);
      this.mattressBase = new T.Mesh(baseGeo, this.mats.mattressBlue);
      this.mattressBase.position.y = 0.17;
      this.mattressBase.castShadow = true;
      this.mattressBase.receiveShadow = true;
      this.mattressGroup.add(this.mattressBase);

      // 6 gomos superiores inflaveis
      this.gomos = [];
      for (let i = 0; i < 6; i++) {
        const gomo = new T.Mesh(
          new T.CylinderGeometry(0.095, 0.095, 1.10, 16),
          this.mats.mattressTop
        );
        gomo.rotation.x = Math.PI * 0.5;
        gomo.position.set(-0.48 + i * 0.192, 0.35, 0.0);
        gomo.castShadow = true;
        this.mattressGroup.add(gomo);
        this.gomos.push(gomo);
      }

      // Cabeceira/borda elevada atras
      const headRoll = new T.Mesh(
        new T.CylinderGeometry(0.13, 0.13, 1.24, 18),
        this.mats.mattressTrim
      );
      headRoll.rotation.z = Math.PI * 0.5;
      headRoll.position.set(0, 0.42, -0.50);
      headRoll.castShadow = true;
      this.mattressGroup.add(headRoll);

      // Valvula vermelha saliente na lateral esquerda (perto do Voce)
      this.valveGroup = new T.Group();
      this.valveGroup.position.set(-0.62, 0.24, 0.34);
      this.mattressGroup.add(this.valveGroup);

      const collar = new T.Mesh(new T.CylinderGeometry(0.08, 0.09, 0.10, 16), this.mats.mattressTrim);
      collar.rotation.z = Math.PI * 0.5;
      this.valveGroup.add(collar);

      this.valveDome = new T.Mesh(new T.SphereGeometry(0.085, 16, 12), this.mats.valveRed);
      this.valveDome.position.x = -0.06;
      this.valveGroup.add(this.valveDome);
    }

    _buildPump(T) {
      this.pumpGroup = new T.Group();
      this.pumpGroup.position.set(-0.64, 0.0, -0.04);
      this.group.add(this.pumpGroup);

      // Corpo da bomba eletrica
      const body = new T.Mesh(new T.CylinderGeometry(0.15, 0.17, 0.34, 18), this.mats.pumpYellow);
      body.position.y = 0.17;
      body.castShadow = true;
      this.pumpGroup.add(body);

      const cap = new T.Mesh(new T.CylinderGeometry(0.12, 0.15, 0.08, 18), this.mats.pumpDark);
      cap.position.y = 0.36;
      this.pumpGroup.add(cap);

      // Alca
      const handle = new T.Mesh(new T.TorusGeometry(0.08, 0.02, 8, 16, Math.PI), this.mats.pumpDark);
      handle.position.y = 0.40;
      this.pumpGroup.add(handle);

      // Medidor de pressao frontal
      const gaugeRing = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.04, 20), this.mats.pumpDark);
      gaugeRing.rotation.x = Math.PI * 0.5;
      gaugeRing.position.set(0, 0.22, 0.15);
      this.pumpGroup.add(gaugeRing);

      const gaugeFace = new T.Mesh(new T.CircleGeometry(0.075, 20), this.mats.gaugeFace);
      gaugeFace.position.set(0, 0.22, 0.172);
      this.pumpGroup.add(gaugeFace);

      // Zona vermelha no medidor
      const redArc = new T.Mesh(new T.RingGeometry(0.042, 0.070, 12, 1, -0.3, 1.3), this.mats.gaugeRed);
      redArc.position.set(0, 0.22, 0.174);
      this.pumpGroup.add(redArc);

      // Ponteiro giratorio
      this.needlePivot = new T.Group();
      this.needlePivot.position.set(0, 0.22, 0.178);
      this.pumpGroup.add(this.needlePivot);
      const needle = new T.Mesh(new T.BoxGeometry(0.012, 0.060, 0.008), this.mats.gaugeRed);
      needle.position.y = 0.026;
      this.needlePivot.add(needle);

      // Mangueira conectando bomba ao colchao
      const curve = new T.CatmullRomCurve3([
        new T.Vector3(0.0, 0.30, -0.08),
        new T.Vector3(-0.18, 0.24, -0.18),
        new T.Vector3(-0.14, 0.24, -0.28)
      ]);
      const hose = new T.Mesh(new T.TubeGeometry(curve, 14, 0.024, 8, false), this.mats.pumpDark);
      hose.castShadow = true;
      this.pumpGroup.add(hose);
    }

    _buildFlyByAndExplosion(T) {
      // Tampao vermelho voando na lente em B5a
      this.flyByPlug = new T.Group();
      this.flyByPlug.visible = false;
      this.group.add(this.flyByPlug);

      const plugBody = new T.Mesh(new T.CylinderGeometry(0.11, 0.14, 0.24, 16), this.mats.valveRed);
      plugBody.rotation.x = Math.PI * 0.5;
      this.flyByPlug.add(plugBody);
      const plugRing = new T.Mesh(new T.TorusGeometry(0.13, 0.03, 10, 18), this.mats.mattressTrim);
      plugRing.position.z = -0.06;
      this.flyByPlug.add(plugRing);

      // Explosao de 32 puffs de ar + 20 plumas coloridas
      this.explosionGroup = new T.Group();
      this.explosionGroup.visible = false;
      this.group.add(this.explosionGroup);

      this.puffs = [];
      for (let i = 0; i < 32; i++) {
        const mat = i % 2 === 0 ? this.mats.puffWhite : this.mats.puffBlue;
        const puff = new T.Mesh(new T.SphereGeometry(0.11 + (i % 4) * 0.03, 10, 8), mat);
        const angle = (i / 32) * Math.PI * 2.0;
        const speed = 1.2 + (i % 5) * 0.42;
        puff.userData = {
          vx: Math.cos(angle) * speed,
          vy: 1.0 + (i % 6) * 0.45,
          vz: Math.sin(angle) * speed * 0.85,
          baseScale: 0.8 + (i % 3) * 0.35
        };
        this.explosionGroup.add(puff);
        this.puffs.push(puff);
      }

      this.feathers = [];
      for (let i = 0; i < 20; i++) {
        const mat = this.featherMats[i % this.featherMats.length];
        const f = new T.Mesh(new T.BoxGeometry(0.10, 0.025, 0.06), mat);
        const angle = (i / 20) * Math.PI * 2.0 + 0.2;
        const speed = 1.1 + (i % 4) * 0.38;
        f.userData = {
          vx: Math.cos(angle) * speed,
          vy: 1.6 + (i % 5) * 0.48,
          vz: Math.sin(angle) * speed * 0.9,
          rotSpeed: (i % 2 === 0 ? 1 : -1) * (4.0 + (i % 3) * 2.5)
        };
        this.explosionGroup.add(f);
        this.feathers.push(f);
      }
    }

    _buildPillowHat(T) {
      this.pillowHatGroup = new T.Group();
      this.pillowHatGroup.visible = false;
      this.group.add(this.pillowHatGroup);

      const pillow = new T.Mesh(new T.BoxGeometry(0.42, 0.14, 0.32), this.mats.pillowPurple);
      pillow.scale.set(1.0, 1.0, 1.0);
      pillow.castShadow = true;
      this.pillowHatGroup.add(pillow);

      const piping = new T.Mesh(new T.BoxGeometry(0.44, 0.03, 0.34), this.mats.pillowPiping);
      this.pillowHatGroup.add(piping);

      const btn = new T.Mesh(new T.CylinderGeometry(0.032, 0.032, 0.15, 12), this.mats.pillowPiping);
      this.pillowHatGroup.add(btn);
    }

    _buildEasterEggCactus(T) {
      // Vaso de cacto com olhoes arregalados na mesinha lateral ao fundo
      this.easterEggGroup = new T.Group();
      this.easterEggGroup.position.set(1.15, 0.56, -1.35);
      this.group.add(this.easterEggGroup);

      const pot = new T.Mesh(new T.CylinderGeometry(0.11, 0.08, 0.16, 14), this.mats.potTerracotta);
      pot.position.y = 0.08;
      pot.castShadow = true;
      this.easterEggGroup.add(pot);

      this.cactusBody = new T.Group();
      this.cactusBody.position.y = 0.16;
      this.easterEggGroup.add(this.cactusBody);

      const trunk = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 0.24, 14), this.mats.cactusGreen);
      trunk.position.y = 0.12;
      this.cactusBody.add(trunk);

      const topDome = new T.Mesh(new T.SphereGeometry(0.075, 14, 10), this.mats.cactusGreen);
      topDome.position.y = 0.24;
      this.cactusBody.add(topDome);

      const armL = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.12, 10), this.mats.cactusGreen);
      armL.position.set(-0.09, 0.14, 0);
      armL.rotation.z = 0.5;
      this.cactusBody.add(armL);

      const armR = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.12, 10), this.mats.cactusGreen);
      armR.position.set(0.09, 0.16, 0);
      armR.rotation.z = -0.5;
      this.cactusBody.add(armR);

      // Olhoes arregalados (googly eyes)
      this.pupilL = new T.Mesh(new T.SphereGeometry(0.018, 8, 8), this.mats.eyeBlack);
      this.pupilR = new T.Mesh(new T.SphereGeometry(0.018, 8, 8), this.mats.eyeBlack);
      const eyeL = new T.Mesh(new T.SphereGeometry(0.036, 10, 10), this.mats.eyeWhite);
      eyeL.position.set(-0.032, 0.19, 0.068);
      this.cactusBody.add(eyeL);
      this.pupilL.position.set(-0.032, 0.19, 0.095);
      this.cactusBody.add(this.pupilL);

      const eyeR = new T.Mesh(new T.SphereGeometry(0.036, 10, 10), this.mats.eyeWhite);
      eyeR.position.set(0.032, 0.19, 0.068);
      this.cactusBody.add(eyeR);
      this.pupilR.position.set(0.032, 0.19, 0.095);
      this.cactusBody.add(this.pupilR);
    }

    update(opts = {}) {
      const time = Number(opts.time) || 0;
      const inflateScale = clamp(Number(opts.inflateScale) || 1.0, 0.5, 1.6);
      const pressure01 = clamp(Number(opts.pressure01) || 0, 0, 1);
      const deflated01 = clamp(Number(opts.deflated01) || 0, 0, 1);
      const flyBy01 = clamp(Number(opts.flyBy01) || 0, 0, 1);
      const burst01 = clamp(Number(opts.burst01) || 0, 0, 1);
      const pillow01 = clamp(Number(opts.pillow01) || 0, 0, 1);
      const headPos = opts.voceHeadWorldPos || { x: -0.2, y: 1.45, z: 0.2 };

      // 1. Colchao inflando / murchando
      const wobble = Math.sin(time * 22.0) * 0.035 * pressure01 * (1 - deflated01);
      const sx = inflateScale * lerp(1.0, 0.85, deflated01) + wobble;
      const sy = lerp(0.85, 1.38, clamp((inflateScale - 0.8) / 0.6, 0, 1)) * lerp(1.0, 0.28, deflated01) - wobble * 0.5;
      const sz = inflateScale * lerp(1.0, 0.90, deflated01) + wobble;
      this.mattressGroup.scale.set(sx, Math.max(0.22, sy), sz);
      this.mattressGroup.rotation.z = Math.sin(time * 18.0) * 0.025 * pressure01 * (1 - deflated01);

      // Valvula pulsando no vermelho
      const pulse = 1.0 + Math.sin(time * 26.0) * 0.22 * pressure01;
      this.valveDome.scale.setScalar(pulse * (1 - deflated01 * 0.6));
      this.mats.valveRed.emissiveIntensity = 0.2 + pressure01 * 0.85;

      // 2. Bomba eletrica vibrando + ponteiro no vermelho
      this.pumpGroup.position.y = Math.abs(Math.sin(time * 32.0)) * 0.018 * pressure01 * (1 - deflated01);
      this.needlePivot.rotation.z = lerp(1.1, -1.35, pressure01) + Math.sin(time * 40.0) * 0.14 * pressure01;

      // 3. Easter Egg Cacto reagindo
      const shake = Math.sin(time * 24.0) * 0.12 * pressure01;
      this.cactusBody.rotation.z = shake;
      this.cactusBody.scale.y = 1.0 + Math.sin(time * 14.0) * 0.08 * pressure01;
      this.pupilL.position.x = -0.032 + Math.sin(time * 17.0) * 0.012;
      this.pupilR.position.x = 0.032 + Math.cos(time * 19.0) * 0.012;

      // 4. Fly-by do tampao vermelho na lente (B5a)
      if (flyBy01 > 0.01 && flyBy01 < 0.99) {
        this.flyByPlug.visible = true;
        this.flyByPlug.position.set(
          lerp(-0.45, 0.06, flyBy01),
          lerp(0.55, 1.32, flyBy01),
          lerp(-0.35, 2.35, flyBy01)
        );
        this.flyByPlug.rotation.set(flyBy01 * 8.0, flyBy01 * 11.0, flyBy01 * 6.0);
        this.flyByPlug.scale.setScalar(lerp(0.8, 2.2, flyBy01));
      } else {
        this.flyByPlug.visible = false;
      }

      // 5. Explosao de puffs e plumas (B5)
      if (burst01 > 0.01 && burst01 < 0.98) {
        this.explosionGroup.visible = true;
        this.explosionGroup.position.set(-0.35, 0.45, -0.25);
        for (let i = 0; i < this.puffs.length; i++) {
          const p = this.puffs[i];
          const u = p.userData;
          const fade = 1.0 - burst01;
          p.position.set(u.vx * burst01 * 1.4, u.vy * burst01 * 1.2 - burst01 * burst01 * 0.5, u.vz * burst01 * 1.3);
          p.scale.setScalar(Math.max(0.01, u.baseScale * Math.sin(burst01 * Math.PI) * 1.6 * fade));
        }
        for (let i = 0; i < this.feathers.length; i++) {
          const f = this.feathers[i];
          const u = f.userData;
          f.position.set(u.vx * burst01 * 1.6, u.vy * burst01 * 1.4 - burst01 * burst01 * 1.1, u.vz * burst01 * 1.5);
          f.rotation.set(burst01 * u.rotSpeed, burst01 * u.rotSpeed * 0.7, burst01 * 3.0);
          f.scale.setScalar(Math.max(0.01, 1.0 - burst01 * 0.4));
        }
      } else {
        this.explosionGroup.visible = false;
      }

      // 6. Almofada roxa pousando na cabeca do Voce (B5b-B6)
      if (pillow01 > 0.01) {
        this.pillowHatGroup.visible = true;
        const arcY = Math.sin(pillow01 * Math.PI) * 0.95;
        this.pillowHatGroup.position.set(
          lerp(-0.45, headPos.x, pillow01),
          lerp(0.65, headPos.y + 0.35, pillow01) + arcY,
          lerp(-0.35, headPos.z, pillow01)
        );
        this.pillowHatGroup.rotation.z = lerp(1.8, 0.08, pillow01);
        this.pillowHatGroup.rotation.y = lerp(2.2, 0.12, pillow01);
      } else {
        this.pillowHatGroup.visible = false;
      }
    }
  }

  global.ColchaoInflavel3D = ColchaoInflavel3D;
})(typeof window !== 'undefined' ? window : globalThis);
