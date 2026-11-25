/**
 * SorveteCasquinha3D.js -- Prop Comico Cartoon 3D: Torre 7 Bolas de Sorvete + Casquinha Chapeu + Pinguim Easter Egg
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class SorveteCasquinha3D {
    constructor() {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para SorveteCasquinha3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'SorveteCasquinha3D';

      this._buildMaterials(T);
      this._buildIceCreamTower(T);
      this._buildFlyByAndExplosion(T);
      this._buildConeHat(T);
      this._buildEasterEggPenguin(T);
    }

    _buildMaterials(T) {
      this.mats = {
        cone: new T.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 }),
        strawberry: new T.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.32 }),
        vanilla: new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 }),
        mint: new T.MeshStandardMaterial({ color: 0x34d399, roughness: 0.35 }),
        choco: new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.40 }),
        blueberry: new T.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.34 }),
        cherry: new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.20, metalness: 0.1 }),
        cream: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, transparent: true, opacity: 0.62, depthWrite: false }),
        creamSolid: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 }),
        puffPink: new T.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.35, transparent: true, opacity: 0.62, depthWrite: false }),
        dark: new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }),
        orange: new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 })
      };
    }

    _buildIceCreamTower(T) {
      this.towerGroup = new T.Group();
      this.towerGroup.position.set(-0.08, 0.36, 0.14);

      const cone = new T.Mesh(new T.ConeGeometry(0.22, 0.54, 20), this.mats.cone);
      cone.rotation.x = Math.PI;
      cone.position.y = 0.22;
      cone.castShadow = true;
      this.towerGroup.add(cone);

      const scoopColors = [
        this.mats.strawberry, this.mats.vanilla, this.mats.mint,
        this.mats.choco, this.mats.blueberry, this.mats.strawberry, this.mats.vanilla
      ];
      this.scoops = [];
      for (let i = 0; i < 7; i++) {
        const r = 0.175 - i * 0.010;
        const s = new T.Mesh(new T.SphereGeometry(r, 18, 16), scoopColors[i]);
        s.position.set((i % 2 === 0 ? 1 : -1) * 0.022 * i * 0.3, 0.50 + i * 0.152, 0);
        s.castShadow = true;
        this.towerGroup.add(s);
        this.scoops.push(s);
      }

      const cherry = new T.Mesh(new T.SphereGeometry(0.068, 14, 14), this.mats.cherry);
      cherry.position.set(0, 0.50 + 7 * 0.152, 0);
      this.towerGroup.add(cherry);

      this.group.add(this.towerGroup);
    }

    _buildFlyByAndExplosion(T) {
      this.flyByScoop = new T.Group();
      const s = new T.Mesh(new T.SphereGeometry(0.20, 16, 14), this.mats.strawberry);
      this.flyByScoop.add(s);
      this.flyByScoop.visible = false;
      this.group.add(this.flyByScoop);

      this.explosionGroup = new T.Group();
      this.puffs = [];
      this.sprinkles = [];
      const puffGeo = new T.SphereGeometry(0.085, 10, 10);
      const spGeo = new T.BoxGeometry(0.045, 0.10, 0.045);
      const spMats = [this.mats.strawberry, this.mats.mint, this.mats.blueberry, this.mats.cherry];
      for (let i = 0; i < 32; i++) {
        const m = new T.Mesh(puffGeo, i % 3 === 0 ? this.mats.puffPink : this.mats.cream);
        const a = (i / 32) * Math.PI * 2;
        m.userData = { vx: Math.cos(a) * (1.35 + (i % 4) * 0.45), vy: 0.90 + (i % 5) * 0.38, vz: Math.sin(a) * (0.95 + (i % 3) * 0.35), s: 0.65 + (i % 4) * 0.20 };
        this.explosionGroup.add(m);
        this.puffs.push(m);
      }
      for (let i = 0; i < 20; i++) {
        const sp = new T.Mesh(spGeo, spMats[i % 4]);
        const a = (i / 20) * Math.PI * 2 + 0.15;
        sp.userData = { vx: Math.cos(a) * (1.85 + (i % 3) * 0.50), vy: 1.50 + (i % 4) * 0.50, vz: Math.sin(a) * (1.25 + (i % 3) * 0.40) };
        this.explosionGroup.add(sp);
        this.sprinkles.push(sp);
      }
      this.explosionGroup.visible = false;
      this.group.add(this.explosionGroup);
    }

    _buildConeHat(T) {
      this.coneHatGroup = new T.Group();
      const cone = new T.Mesh(new T.ConeGeometry(0.24, 0.48, 20), this.mats.cone);
      cone.position.y = 0.24;
      const rim = new T.Mesh(new T.TorusGeometry(0.23, 0.052, 10, 20), this.mats.strawberry);
      rim.rotation.x = Math.PI * 0.5;
      const cherry = new T.Mesh(new T.SphereGeometry(0.058, 12, 12), this.mats.cherry);
      cherry.position.y = 0.49;
      this.coneHatGroup.add(cone, rim, cherry);
      this.coneHatGroup.visible = false;
      this.group.add(this.coneHatGroup);
    }

    _buildEasterEggPenguin(T) {
      // Sentado sobre o balcao pastel direito (top y=0.82, x=1.12, z=-0.78)
      this.easterEggGroup = new T.Group();
      this.easterEggGroup.position.set(1.12, 0.96, -0.78);

      const body = new T.Mesh(new T.SphereGeometry(0.14, 16, 14), this.mats.dark);
      body.scale.set(0.95, 1.25, 0.9);
      const belly = new T.Mesh(new T.SphereGeometry(0.11, 14, 12), this.mats.creamSolid);
      belly.position.set(0, -0.02, 0.055);
      const head = new T.Mesh(new T.SphereGeometry(0.10, 16, 14), this.mats.dark);
      head.position.set(0, 0.19, 0);
      const beak = new T.Mesh(new T.ConeGeometry(0.038, 0.075, 10), this.mats.orange);
      beak.rotation.x = Math.PI * 0.5;
      beak.position.set(0, 0.18, 0.11);
      const glassL = new T.Mesh(new T.BoxGeometry(0.075, 0.042, 0.02), this.mats.dark);
      glassL.position.set(-0.042, 0.22, 0.095);
      const glassR = new T.Mesh(new T.BoxGeometry(0.075, 0.042, 0.02), this.mats.dark);
      glassR.position.set(0.042, 0.22, 0.095);
      this.easterEggGroup.add(body, belly, head, beak, glassL, glassR);
      this.group.add(this.easterEggGroup);
    }

    update(t, beatIdx, beatProgress, headWorldPos) {
      // Torre desaba exatamente quando a explosao de B5 comeca!
      this.towerGroup.visible = beatIdx < 4 || (beatIdx === 4 && beatProgress < 0.08);
      const lean = beatIdx === 3 ? Math.sin(t * 14) * 0.26 + 0.20 : (beatIdx === 2 ? Math.sin(t * 6) * 0.09 : 0.02);
      this.towerGroup.rotation.z = lean;
      const melt = beatIdx >= 2 ? 1 + 0.08 * Math.sin(t * 10) : 1;
      for (let i = 0; i < this.scoops.length; i++) {
        this.scoops[i].scale.set(melt, 2 - melt, melt);
      }

      if (beatIdx === 4 && beatProgress < 0.28) {
        const p = beatProgress / 0.28;
        this.flyByScoop.visible = true;
        this.flyByScoop.position.set(lerp(-0.05, 0.10, p), lerp(1.25, 1.35, p), lerp(0.2, 4.6, p));
        this.flyByScoop.rotation.set(t * 12, t * 15, 0);
      } else {
        this.flyByScoop.visible = false;
      }

      if (beatIdx === 4 && beatProgress >= 0.08) {
        const ep = clamp((beatProgress - 0.08) / 0.85, 0, 1);
        this.explosionGroup.visible = ep < 0.96;
        this.explosionGroup.position.set(-0.08, 1.05, -0.55);
        for (const p of this.puffs) {
          p.position.set(p.userData.vx * ep, p.userData.vy * ep - 1.1 * ep * ep, p.userData.vz * ep);
          p.scale.setScalar(p.userData.s * (1 + ep * 0.9) * (1 - ep * 0.72));
        }
        for (const sp of this.sprinkles) {
          sp.position.set(sp.userData.vx * ep, sp.userData.vy * ep - 1.5 * ep * ep, sp.userData.vz * ep);
          sp.rotation.set(t * 10, t * 12, 0);
          sp.scale.setScalar(Math.max(0.01, 1 - ep));
        }
      } else {
        this.explosionGroup.visible = false;
      }

      if (beatIdx >= 4 && headWorldPos && (beatIdx > 4 || beatProgress > 0.34)) {
        const fall = beatIdx === 4 ? clamp((beatProgress - 0.34) / 0.22, 0, 1) : 1;
        this.coneHatGroup.visible = true;
        this.coneHatGroup.position.set(headWorldPos.x, headWorldPos.y + 0.23 + (1 - fall) * 1.4, headWorldPos.z + 0.02);
        this.coneHatGroup.rotation.set(0.05, 0, Math.sin(t * 4) * 0.03);
      } else {
        this.coneHatGroup.visible = false;
      }

      this.easterEggGroup.position.y = 0.96 + Math.abs(Math.sin(t * 7.5)) * (beatIdx >= 2 ? 0.08 : 0.015);
      this.easterEggGroup.rotation.z = Math.sin(t * 18) * (beatIdx >= 2 ? 0.11 : 0.02);
    }

    dispose() {
      this.group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }
  }

  global.SorveteCasquinha3D = SorveteCasquinha3D;
})(typeof window !== 'undefined' ? window : globalThis);
