/**
 * SacoMercado3D.js -- Props Comicos Cartoon 3D + Abacaxi Easter Egg (Ep 10: O Saco Pesado do Mercado!)
 * - Saco de papel kraft gigante e estufado (`this.bagGroup`) segurado pelo Voce (y <= 0.83):
 *   - Garrafa de refrigerante 2L verde + melancia + laranjas + melao saindo pelo topo.
 *   - Fundo rasgando em B4 (`tearProg`) e estourando em B5 (`ripProg`).
 * - Frutas rolando pelo piso de porcelanato em B5..B6 (laranjas, melao, garrafa 2L com espuma/fizz).
 * - Melancia em fly-by rapido passando rente a lente em B5 (`flyByProg`).
 * - Chapeu de saco de papel rasgado (`bagHatGroup`) pousando na cabeca do Voce em B5..B6.
 * - Easter Egg: Abacaxi amarelo cartoon de oculos escuros pulando no carrinho de compras em B3..B6!
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class SacoMercado3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para SacoMercado3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'SacoMercado3D';

      this._buildMaterials(T);
      this._buildGroceryBag(T);
      this._buildRollingFruitsAndSoda(T);
      this._buildWatermelonFlyby(T);
      this._buildBagHat(T);
      this._buildSodaFizz(T);
      this._buildPineappleEasterEgg(T);
    }

    _buildMaterials(T) {
      this.mats = {
        kraft: new T.MeshStandardMaterial({ color: 0xc28e5c, roughness: 0.86, metalness: 0.02 }),
        kraftDark: new T.MeshStandardMaterial({ color: 0x9c6b3f, roughness: 0.90 }),
        kraftRim: new T.MeshStandardMaterial({ color: 0xd6a676, roughness: 0.82 }),
        labelRed: new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.55 }),
        sodaGreen: new T.MeshStandardMaterial({
          color: 0x16a34a,
          roughness: 0.16,
          metalness: 0.08,
          transparent: true,
          opacity: 0.90
        }),
        sodaCap: new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 }),
        sodaLabel: new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.42 }),
        melonGreen: new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.44 }),
        melonStripe: new T.MeshStandardMaterial({ color: 0x14532d, roughness: 0.48 }),
        cantaloupe: new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.58 }),
        orange: new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.46 }),
        pineappleYellow: new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.52 }),
        pineappleLeaf: new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.50 }),
        shadesBlack: new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.14, metalness: 0.72 }),
        shadesShine: new T.MeshBasicMaterial({ color: 0xffffff }),
        fizzWhite: new T.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xe0f2fe,
          emissiveIntensity: 0.28,
          transparent: true,
          opacity: 0.88,
          roughness: 0.20,
          depthWrite: false
        })
      };
    }

    _buildGroceryBag(T) {
      this.bagGroup = new T.Group();
      this.bagGroup.name = 'GiantGroceryBag';

      // Corpo principal estufado (caixa arredondada/trapezoidal em papel kraft)
      this.bagBody = new T.Mesh(new T.BoxGeometry(0.42, 0.50, 0.30), this.mats.kraft);
      this.bagBody.position.y = 0.04;
      this.bagBody.castShadow = true;
      this.bagBody.receiveShadow = true;
      this.bagGroup.add(this.bagBody);

      // Barriga estufada frontal e traseira
      this.bagBulge = new T.Mesh(new T.SphereGeometry(0.22, 16, 12), this.mats.kraft);
      this.bagBulge.scale.set(1.06, 1.02, 0.78);
      this.bagBulge.position.set(0, 0.02, 0.04);
      this.bagBulge.castShadow = true;
      this.bagGroup.add(this.bagBulge);

      // Faixa vermelha frontal de mercado
      const band = new T.Mesh(new T.BoxGeometry(0.428, 0.10, 0.308), this.mats.labelRed);
      band.position.set(0, 0.09, 0);
      this.bagGroup.add(band);

      // Borda superior serrilhada do saco
      const topRim = new T.Mesh(new T.BoxGeometry(0.44, 0.04, 0.32), this.mats.kraftRim);
      topRim.position.set(0, 0.29, 0);
      this.bagGroup.add(topRim);

      // Fundo rasgavel do saco (aba esquerda e direita que se abrem em B4..B5!)
      this.bottomFlapL = new T.Mesh(new T.BoxGeometry(0.21, 0.035, 0.30), this.mats.kraftDark);
      this.bottomFlapL.position.set(-0.105, -0.21, 0);
      this.bagGroup.add(this.bottomFlapL);

      this.bottomFlapR = new T.Mesh(new T.BoxGeometry(0.21, 0.035, 0.30), this.mats.kraftDark);
      this.bottomFlapR.position.set(0.105, -0.21, 0);
      this.bagGroup.add(this.bottomFlapR);

      // Fenda escura no fundo quando comeca a rasgar em B4
      this.tearGap = new T.Mesh(
        new T.BoxGeometry(0.32, 0.03, 0.22),
        new T.MeshBasicMaterial({ color: 0x1e1b18 })
      );
      this.tearGap.position.set(0, -0.205, 0);
      this.tearGap.visible = false;
      this.bagGroup.add(this.tearGap);

      // Itens saindo pelo topo do saco (garrafa 2L + melancia + laranja + melao)
      this.topItems = new T.Group();
      this.topItems.position.set(0, 0.30, 0);

      const topSoda = new T.Mesh(new T.CylinderGeometry(0.052, 0.058, 0.24, 14), this.mats.sodaGreen);
      topSoda.position.set(-0.10, 0.08, 0.03);
      topSoda.rotation.z = 0.14;
      topSoda.castShadow = true;
      this.topItems.add(topSoda);

      const topSodaCap = new T.Mesh(new T.CylinderGeometry(0.020, 0.022, 0.028, 10), this.mats.sodaCap);
      topSodaCap.position.set(-0.118, 0.205, 0.03);
      topSodaCap.rotation.z = 0.14;
      this.topItems.add(topSodaCap);

      const topMelon = new T.Mesh(new T.SphereGeometry(0.105, 14, 10), this.mats.melonGreen);
      topMelon.scale.set(1.0, 0.88, 1.0);
      topMelon.position.set(0.08, 0.03, -0.02);
      this.topItems.add(topMelon);

      const topOrange = new T.Mesh(new T.SphereGeometry(0.055, 10, 8), this.mats.orange);
      topOrange.position.set(0.01, 0.05, 0.08);
      this.topItems.add(topOrange);

      this.bagGroup.add(this.topItems);
      this.group.add(this.bagGroup);
    }

    _buildRollingFruitsAndSoda(T) {
      this.spillGroup = new T.Group();
      this.spillGroup.name = 'SpilledGroceries';

      // Garrafa 2L que cai no chao e espirra espuma
      this.droppedSoda = new T.Group();
      const sBody = new T.Mesh(new T.CylinderGeometry(0.056, 0.062, 0.28, 14), this.mats.sodaGreen);
      sBody.castShadow = true;
      this.droppedSoda.add(sBody);
      const sLbl = new T.Mesh(new T.CylinderGeometry(0.059, 0.060, 0.09, 14), this.mats.sodaLabel);
      this.droppedSoda.add(sLbl);
      const sNeck = new T.Mesh(new T.CylinderGeometry(0.020, 0.054, 0.06, 12), this.mats.sodaGreen);
      sNeck.position.y = 0.165;
      this.droppedSoda.add(sNeck);
      const sCap = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 0.026, 10), this.mats.sodaCap);
      sCap.position.y = 0.205;
      this.droppedSoda.add(sCap);
      this.droppedSoda.rotation.z = Math.PI / 2;
      this.droppedSoda.visible = false;
      this.spillGroup.add(this.droppedSoda);

      // Meloes e laranjas rolando pelo piso
      this.rollingFruits = [];
      const specs = [
        { r: 0.11, mat: this.mats.cantaloupe, x0: -0.18, z0: 0.30, vx: -0.68, vz: 0.42 },
        { r: 0.095, mat: this.mats.cantaloupe, x0: -0.05, z0: 0.28, vx: 0.54, vz: 0.55 },
        { r: 0.062, mat: this.mats.orange, x0: -0.22, z0: 0.36, vx: -0.95, vz: 0.28 },
        { r: 0.058, mat: this.mats.orange, x0: -0.10, z0: 0.34, vx: 0.25, vz: 0.85 },
        { r: 0.064, mat: this.mats.orange, x0: -0.26, z0: 0.24, vx: -0.45, vz: -0.52 },
        { r: 0.055, mat: this.mats.orange, x0: -0.02, z0: 0.22, vx: 0.72, vz: 0.20 }
      ];
      for (let i = 0; i < specs.length; i++) {
        const sp = specs[i];
        const m = new T.Mesh(new T.SphereGeometry(sp.r, 12, 10), sp.mat);
        m.castShadow = true;
        m.visible = false;
        this.spillGroup.add(m);
        this.rollingFruits.push({ mesh: m, ...sp });
      }
      this.group.add(this.spillGroup);
    }

    _buildWatermelonFlyby(T) {
      this.watermelonGroup = new T.Group();
      this.watermelonGroup.name = 'FlybyWatermelon';

      const melon = new T.Mesh(new T.SphereGeometry(0.16, 18, 14), this.mats.melonGreen);
      melon.scale.set(1.22, 0.92, 0.92);
      melon.castShadow = true;
      this.watermelonGroup.add(melon);

      for (let s = 0; s < 4; s++) {
        const stripe = new T.Mesh(new T.TorusGeometry(0.152, 0.012, 6, 18), this.mats.melonStripe);
        stripe.rotation.y = (s / 4) * Math.PI;
        stripe.scale.set(1.20, 0.92, 0.92);
        this.watermelonGroup.add(stripe);
      }
      this.watermelonGroup.visible = false;
      this.group.add(this.watermelonGroup);
    }

    _buildBagHat(T) {
      // Saco rasgado amassado que pousa na cabeca do Voce como chapeu em B5..B6!
      this.bagHatGroup = new T.Group();
      this.bagHatGroup.name = 'TornPaperBagHat';

      const crown = new T.Mesh(new T.CylinderGeometry(0.155, 0.195, 0.22, 8), this.mats.kraft);
      crown.position.y = 0.09;
      crown.castShadow = true;
      this.bagHatGroup.add(crown);

      const band = new T.Mesh(new T.CylinderGeometry(0.178, 0.188, 0.055, 8), this.mats.labelRed);
      band.position.y = 0.05;
      this.bagHatGroup.add(band);

      // Pontas rasgadas de papel no topo
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const flap = new T.Mesh(new T.BoxGeometry(0.09, 0.06, 0.018), this.mats.kraftRim);
        flap.position.set(Math.cos(ang) * 0.13, 0.20, Math.sin(ang) * 0.13);
        flap.rotation.y = -ang;
        flap.rotation.x = 0.35;
        this.bagHatGroup.add(flap);
      }

      this.bagHatGroup.visible = false;
      this.group.add(this.bagHatGroup);
    }

    _buildSodaFizz(T) {
      // 24 bolhas/puffs de espuma branca do refrigerante 2L em B5!
      this.fizzGroup = new T.Group();
      this.fizzPuffs = [];
      const geo = new T.SphereGeometry(0.06, 8, 6);
      for (let i = 0; i < 24; i++) {
        const m = new T.Mesh(geo, this.mats.fizzWhite);
        m.visible = false;
        this.fizzGroup.add(m);
        const angle = (i / 24) * Math.PI * 2 + (i % 3) * 0.2;
        const speed = 0.55 + (i % 4) * 0.22;
        const lift = 0.70 + (i % 5) * 0.24;
        this.fizzPuffs.push({
          mesh: m,
          vx: Math.cos(angle) * speed,
          vz: Math.sin(angle) * speed * 0.85,
          vy: lift,
          baseScale: 0.55 + (i % 4) * 0.24
        });
      }
      this.group.add(this.fizzGroup);
    }

    _buildPineappleEasterEgg(T) {
      // Easter Egg: Abacaxi amarelo cartoon usando oculos escuros no carrinho (B3..B6)!
      this.pineappleGroup = new T.Group();
      this.pineappleGroup.name = 'SunglassesPineappleEasterEgg';

      const body = new T.Mesh(new T.SphereGeometry(0.135, 16, 12), this.mats.pineappleYellow);
      body.scale.set(0.92, 1.32, 0.92);
      body.castShadow = true;
      this.pineappleGroup.add(body);

      // Coroa de folhas verdes no topo
      for (let f = 0; f < 6; f++) {
        const ang = (f / 6) * Math.PI * 2;
        const leaf = new T.Mesh(new T.ConeGeometry(0.036, 0.14, 5), this.mats.pineappleLeaf);
        leaf.position.set(Math.cos(ang) * 0.038, 0.20, Math.sin(ang) * 0.038);
        leaf.rotation.z = -Math.cos(ang) * 0.36;
        leaf.rotation.x = Math.sin(ang) * 0.36;
        this.pineappleGroup.add(leaf);
      }

      // Oculos escuros estilosos!
      const shades = new T.Group();
      shades.position.set(0, 0.04, 0.118);
      [-0.052, 0.052].forEach((lx) => {
        const lens = new T.Mesh(new T.BoxGeometry(0.080, 0.046, 0.018), this.mats.shadesBlack);
        lens.position.x = lx;
        shades.add(lens);
        const shine = new T.Mesh(new T.BoxGeometry(0.024, 0.008, 0.020), this.mats.shadesShine);
        shine.position.set(lx - 0.014, 0.008, 0.002);
        shine.rotation.z = 0.45;
        shades.add(shine);
      });
      const bridge = new T.Mesh(new T.BoxGeometry(0.032, 0.014, 0.016), this.mats.shadesBlack);
      shades.add(bridge);
      this.pineappleGroup.add(shades);

      this.pineappleGroup.visible = false;
      this.group.add(this.pineappleGroup);
    }

    update(time, cfg = {}) {
      const tearProg = clamp(cfg.tearProg || 0, 0, 1);
      const ripProg = clamp(cfg.ripProg || 0, 0, 1);
      const flyByProg = clamp(cfg.flyByProg || 0, 0, 1);
      const fizzProg = clamp(cfg.fizzProg || 0, 0, 1);
      const hatProg = clamp(cfg.hatProg || 0, 0, 1);

      // 1. Saco de mercado gigante segurado pelo Voce (sempre y <= 0.83!)
      const showBag = cfg.showBag !== false && ripProg < 0.72;
      this.bagGroup.visible = showBag;
      if (showBag && cfg.bagPos) {
        const safeY = Math.min(0.83, cfg.bagPos.y);
        this.bagGroup.position.set(cfg.bagPos.x, safeY, cfg.bagPos.z);
        this.bagGroup.rotation.set(
          cfg.bagRotX || 0,
          cfg.bagRotY || 0,
          cfg.bagRotZ || 0
        );
        const bulge = 1.0 + Math.sin(time * 10.0) * 0.03 * tearProg + ripProg * 0.12;
        this.bagGroup.scale.set(bulge, 1.0 - ripProg * 0.14, bulge);

        // Fundo estufa e rasga em B4 -> abre em B5
        const openAng = tearProg * 0.55 + ripProg * 1.15;
        this.bottomFlapL.rotation.z = openAng;
        this.bottomFlapL.position.y = -0.21 - tearProg * 0.025;
        this.bottomFlapR.rotation.z = -openAng;
        this.bottomFlapR.position.y = -0.21 - tearProg * 0.025;
        this.tearGap.visible = tearProg > 0.15;
        this.tearGap.scale.set(0.5 + tearProg * 0.6, 1, 0.5 + tearProg * 0.6);
        this.topItems.visible = ripProg < 0.35;
      }

      // 2. Melancia fly-by perto da lente em B5 -> rola no chao
      this.watermelonGroup.visible = flyByProg > 0.01;
      if (this.watermelonGroup.visible) {
        const arc = Math.sin(flyByProg * Math.PI);
        const fx = lerp(-0.24, 0.62, flyByProg);
        const fy = lerp(0.65, 0.15, flyByProg) + arc * 0.95;
        const fz = lerp(0.35, 2.45, Math.sin(Math.min(flyByProg, 0.55) * Math.PI)) * (1 - smoothstep01(flyByProg, 0.55, 1.0)) + lerp(0.20, -0.32, flyByProg);
        this.watermelonGroup.position.set(fx, Math.max(0.15, fy), fz);
        this.watermelonGroup.rotation.set(flyByProg * 8.0, flyByProg * 4.5, flyByProg * 6.0);
      }

      // 3. Frutas rolando e garrafa 2L no chao em B5..B6
      const spillProg = clamp(cfg.spillProg || 0, 0, 1);
      const showSpill = spillProg > 0.01;
      this.droppedSoda.visible = showSpill;
      if (showSpill) {
        const bounce = spillProg < 0.35 ? Math.abs(Math.sin(spillProg * 22.0)) * (0.35 - spillProg) * 0.6 : 0;
        this.droppedSoda.position.set(
          lerp(-0.25, 0.18, clamp(spillProg * 1.4, 0, 1)),
          0.060 + bounce,
          lerp(0.32, 0.72, clamp(spillProg * 1.4, 0, 1))
        );
        this.droppedSoda.rotation.y = spillProg * 2.2;
      }
      for (let i = 0; i < this.rollingFruits.length; i++) {
        const rf = this.rollingFruits[i];
        rf.mesh.visible = showSpill;
        if (showSpill) {
          const travel = smoothstep01(spillProg, 0.0, 0.75);
          const dropBounce = spillProg < 0.32 ? Math.abs(Math.sin((spillProg + i * 0.05) * 24.0)) * (0.32 - spillProg) * 0.75 : 0;
          rf.mesh.position.set(
            rf.x0 + rf.vx * travel,
            rf.r + dropBounce,
            rf.z0 + rf.vz * travel
          );
        }
      }

      // 4. Espuma / fizz do refrigerante 2L
      const showFizz = fizzProg > 0.01 && fizzProg < 0.99;
      const fizzOrigin = cfg.fizzOrigin || { x: 0.18, y: 0.12, z: 0.72 };
      this.fizzGroup.position.set(fizzOrigin.x, fizzOrigin.y, fizzOrigin.z);
      for (let i = 0; i < this.fizzPuffs.length; i++) {
        const p = this.fizzPuffs[i];
        p.mesh.visible = showFizz;
        if (showFizz) {
          const grav = 2.1 * fizzProg * fizzProg;
          p.mesh.position.set(
            p.vx * fizzProg * 0.95,
            Math.max(0.02, p.vy * fizzProg - grav),
            p.vz * fizzProg * 0.95
          );
          const s = p.baseScale * Math.sin(fizzProg * Math.PI) * 1.3;
          p.mesh.scale.setScalar(Math.max(0.04, s));
        }
      }

      // 5. Chapeu de saco rasgado pousando na cabeca do Voce em B5..B6!
      this.bagHatGroup.visible = hatProg > 0.02;
      if (this.bagHatGroup.visible && cfg.hatTarget) {
        const ht = cfg.hatTarget;
        const dropOffset = (1 - hatProg) * 1.15;
        const bounce = hatProg > 0.78 && hatProg < 0.99 ? Math.abs(Math.sin((hatProg - 0.78) * 24.0)) * 0.032 : 0;
        this.bagHatGroup.position.set(ht.x, ht.y + dropOffset + bounce, ht.z);
        if (cfg.hatQuat) {
          this.bagHatGroup.quaternion.copy(cfg.hatQuat);
        } else {
          this.bagHatGroup.rotation.set(0.06, cfg.hatYaw || 0, -0.08);
        }
        const hScale = cfg.hatScale || 1.0;
        this.bagHatGroup.scale.setScalar(hScale);
      }

      // 6. Easter Egg: Abacaxi de oculos escuros no carrinho de compras (B3..B6)!
      const pinePop = clamp(cfg.pineapplePop || 0, 0, 1);
      this.pineappleGroup.visible = pinePop > 0.02;
      if (this.pineappleGroup.visible && cfg.cartPos) {
        const cp = cfg.cartPos;
        const dance = Math.sin(time * 8.5) * 0.025 * pinePop;
        this.pineappleGroup.position.set(cp.x, cp.y + 0.56 + pinePop * 0.24 + Math.abs(dance), cp.z);
        this.pineappleGroup.rotation.y = 0.28 + Math.sin(time * 4.0) * 0.22;
      }
    }
  }

  function smoothstep01(v, a, b) {
    const t = clamp((v - a) / Math.max(0.001, b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  global.SacoMercado3D = SacoMercado3D;
})(typeof window !== 'undefined' ? window : globalThis);
