/**
 * FuradeiraParede3D.js -- Prop Comico Cartoon 3D: Furadeira Gigante + Buraco Ceu Azul + Quadro + Capacete + Patinho
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class FuradeiraParede3D {
    constructor() {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para FuradeiraParede3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'FuradeiraParede3D';

      this._buildMaterials(T);
      this._buildDrill(T);
      this._buildWallHoleAndFrame(T);
      this._buildFlyByAndExplosion(T);
      this._buildHelmetHat(T);
      this._buildEasterEggDuck(T);
    }

    _buildMaterials(T) {
      this.mats = {
        drillYellow: new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.28, metalness: 0.14 }),
        drillBlack: new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.28 }),
        steel: new T.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.20, metalness: 0.88 }),
        sparkRed: new T.MeshStandardMaterial({ color: 0xf97316, emissive: 0xef4444, emissiveIntensity: 0.85, roughness: 0.25 }),
        dust: new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.88, transparent: true, opacity: 0.62, depthWrite: false }),
        gold: new T.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf97316, emissiveIntensity: 0.6, roughness: 0.30 }),
        skyBlue: new T.MeshBasicMaterial({ color: 0x38bdf8 }),
        cloudWhite: new T.MeshBasicMaterial({ color: 0xffffff }),
        brickRim: new T.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.82 }),
        pvcPipe: new T.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 }),
        holeDark: new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 }),
        wood: new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.60 }),
        canvasArt: new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 }),
        artHills: new T.MeshBasicMaterial({ color: 0x22c55e }),
        white: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.30 }),
        duckYellow: new T.MeshStandardMaterial({ color: 0xfde047, roughness: 0.34 }),
        orange: new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.40 })
      };
    }

    _buildDrill(T) {
      this.drillGroup = new T.Group();
      this.drillGroup.position.set(-0.55, 0.84, -0.18);

      const body = new T.Mesh(new T.BoxGeometry(0.32, 0.22, 0.58), this.mats.drillYellow);
      body.castShadow = true;
      this.drillGroup.add(body);

      // Respiros pretos na lateral da furadeira
      for (let i = 0; i < 3; i++) {
        const vent = new T.Mesh(new T.BoxGeometry(0.34, 0.025, 0.08), this.mats.drillBlack);
        vent.position.set(0, 0.03, -0.12 + i * 0.10);
        this.drillGroup.add(vent);
      }

      const handle = new T.Mesh(new T.BoxGeometry(0.11, 0.34, 0.13), this.mats.drillBlack);
      handle.position.set(0, -0.24, 0.10);
      handle.rotation.x = -0.20;
      this.drillGroup.add(handle);

      const sideGrip = new T.Mesh(new T.CylinderGeometry(0.032, 0.032, 0.24, 12), this.mats.drillBlack);
      sideGrip.rotation.z = Math.PI * 0.5;
      sideGrip.position.set(-0.22, -0.04, -0.14);
      this.drillGroup.add(sideGrip);

      const battery = new T.Mesh(new T.BoxGeometry(0.20, 0.12, 0.24), this.mats.drillBlack);
      battery.position.set(0, -0.40, 0.14);
      this.drillGroup.add(battery);

      // Mandril e broca longa apontando para a parede do fundo (-Z)
      const chuck = new T.Mesh(new T.CylinderGeometry(0.085, 0.105, 0.20, 18), this.mats.drillBlack);
      chuck.rotation.x = Math.PI * 0.5;
      chuck.position.set(0, 0, -0.36);
      this.drillGroup.add(chuck);

      this.bitMesh = new T.Mesh(new T.CylinderGeometry(0.028, 0.018, 0.62, 14), this.mats.steel);
      this.bitMesh.rotation.x = Math.PI * 0.5;
      this.bitMesh.position.set(0, 0, -0.74);
      this.drillGroup.add(this.bitMesh);

      this.glowRing = new T.Mesh(new T.TorusGeometry(0.095, 0.024, 10, 20), this.mats.sparkRed);
      this.glowRing.position.set(0, 0, -0.47);
      this.drillGroup.add(this.glowRing);

      this.group.add(this.drillGroup);
    }

    _buildWallHoleAndFrame(T) {
      // Buraco com ceu azul e nuvem pra "ventilacao natural" na parede z = -1.13
      this.holeGroup = new T.Group();
      this.holeGroup.position.set(-0.18, 1.10, -1.11);

      const brickRim = new T.Mesh(new T.TorusGeometry(0.49, 0.075, 10, 24), this.mats.brickRim);
      const outerPlaster = new T.Mesh(new T.TorusGeometry(0.55, 0.05, 10, 24), this.mats.white);
      outerPlaster.position.z = 0.01;
      const sky = new T.Mesh(new T.CircleGeometry(0.47, 28), this.mats.skyBlue);
      sky.position.z = 0.015;

      const c1 = new T.Mesh(new T.CircleGeometry(0.11, 16), this.mats.cloudWhite);
      c1.position.set(-0.14, 0.12, 0.022);
      const c2 = new T.Mesh(new T.CircleGeometry(0.14, 16), this.mats.cloudWhite);
      c2.position.set(-0.02, 0.15, 0.022);
      const c3 = new T.Mesh(new T.CircleGeometry(0.10, 16), this.mats.cloudWhite);
      c3.position.set(0.11, 0.11, 0.022);

      const brokenPipe = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.34, 12), this.mats.pvcPipe);
      brokenPipe.position.set(0.24, -0.18, 0.025);
      brokenPipe.rotation.z = 0.35;

      this.holeGroup.add(brickRim, outerPlaster, sky, c1, c2, c3, brokenPipe);
      this.holeGroup.visible = false;
      this.group.add(this.holeGroup);

      // Quadrinho minusculo de 20cm torto na parede ao lado
      this.frameGroup = new T.Group();
      this.frameGroup.position.set(0.52, 1.44, -1.10);
      const frame = new T.Mesh(new T.BoxGeometry(0.30, 0.24, 0.04), this.mats.wood);
      const art = new T.Mesh(new T.PlaneGeometry(0.22, 0.16), this.mats.canvasArt);
      art.position.z = 0.022;
      const hill = new T.Mesh(new T.CircleGeometry(0.07, 12, 0, Math.PI), this.mats.artHills);
      hill.position.set(-0.02, -0.05, 0.025);
      const artSun = new T.Mesh(new T.CircleGeometry(0.028, 12), this.mats.duckYellow);
      artSun.position.set(0.06, 0.04, 0.025);
      this.frameGroup.add(frame, art, hill, artSun);
      this.group.add(this.frameGroup);
    }

    _buildFlyByAndExplosion(T) {
      this.flyByBit = new T.Group();
      const bit = new T.Mesh(new T.CylinderGeometry(0.05, 0.025, 0.48, 12), this.mats.steel);
      bit.rotation.x = Math.PI * 0.5;
      this.flyByBit.add(bit);
      this.flyByBit.visible = false;
      this.group.add(this.flyByBit);

      this.explosionGroup = new T.Group();
      this.puffs = [];
      this.sparks = [];
      const puffGeo = new T.SphereGeometry(0.085, 10, 10);
      const sparkGeo = new T.OctahedronGeometry(0.065, 0);
      for (let i = 0; i < 32; i++) {
        const m = new T.Mesh(puffGeo, this.mats.dust);
        const a = (i / 32) * Math.PI * 2;
        const elev = ((i % 5) - 2) * 0.35;
        m.userData = { vx: Math.cos(a) * (1.35 + (i % 4) * 0.45), vy: 0.75 + Math.abs(elev) * 1.15, vz: Math.sin(a) * (0.85 + (i % 3) * 0.35), s: 0.65 + (i % 4) * 0.20 };
        this.explosionGroup.add(m);
        this.puffs.push(m);
      }
      for (let i = 0; i < 20; i++) {
        const s = new T.Mesh(sparkGeo, i % 2 === 0 ? this.mats.sparkRed : this.mats.gold);
        const a = (i / 20) * Math.PI * 2 + 0.2;
        s.userData = { vx: Math.cos(a) * (1.8 + (i % 3) * 0.55), vy: 1.4 + (i % 4) * 0.55, vz: Math.sin(a) * (1.2 + (i % 3) * 0.4) };
        this.explosionGroup.add(s);
        this.sparks.push(s);
      }
      this.explosionGroup.visible = false;
      this.group.add(this.explosionGroup);
    }

    _buildHelmetHat(T) {
      this.helmetHatGroup = new T.Group();
      const dome = new T.Mesh(new T.SphereGeometry(0.24, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), this.mats.drillYellow);
      dome.scale.set(1.06, 0.88, 1.14);
      const brim = new T.Mesh(new T.CylinderGeometry(0.27, 0.28, 0.03, 20), this.mats.drillYellow);
      brim.position.set(0, 0.01, 0.04);
      brim.scale.set(1.02, 1, 1.18);
      const stripe = new T.Mesh(new T.BoxGeometry(0.08, 0.17, 0.40), this.mats.orange);
      stripe.position.set(0, 0.13, 0);
      this.helmetHatGroup.add(dome, brim, stripe);
      this.helmetHatGroup.visible = false;
      this.group.add(this.helmetHatGroup);
    }

    _buildEasterEggDuck(T) {
      // Sentado exatamente sobre a bancada direita (top y=0.82, x=1.12, z=-0.78)
      this.easterEggGroup = new T.Group();
      this.easterEggGroup.position.set(1.12, 0.94, -0.78);

      const body = new T.Mesh(new T.SphereGeometry(0.13, 16, 14), this.mats.duckYellow);
      const head = new T.Mesh(new T.SphereGeometry(0.095, 16, 14), this.mats.duckYellow);
      head.position.set(0, 0.16, 0.02);
      const beak = new T.Mesh(new T.ConeGeometry(0.038, 0.075, 10), this.mats.orange);
      beak.rotation.x = Math.PI * 0.5;
      beak.position.set(0, 0.15, 0.12);
      const miniHat = new T.Mesh(new T.SphereGeometry(0.10, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), this.mats.drillYellow);
      miniHat.position.set(0, 0.20, 0.02);

      const eyeGeo = new T.SphereGeometry(0.030, 10, 10);
      const pupGeo = new T.SphereGeometry(0.015, 8, 8);
      this.duckEyeL = new T.Mesh(eyeGeo, this.mats.white);
      this.duckEyeL.position.set(-0.038, 0.19, 0.09);
      this.duckEyeR = new T.Mesh(eyeGeo, this.mats.white);
      this.duckEyeR.position.set(0.038, 0.19, 0.09);
      const pupL = new T.Mesh(pupGeo, this.mats.holeDark);
      pupL.position.set(0, 0, 0.024);
      const pupR = new T.Mesh(pupGeo, this.mats.holeDark);
      pupR.position.set(0, 0, 0.024);
      this.duckEyeL.add(pupL);
      this.duckEyeR.add(pupR);

      this.easterEggGroup.add(body, head, beak, miniHat, this.duckEyeL, this.duckEyeR);
      this.group.add(this.easterEggGroup);
    }

    update(t, beatIdx, beatProgress, headWorldPos, vocePos) {
      const vx = vocePos ? vocePos.x : -0.65;
      const vz = vocePos ? vocePos.z : 0.28;
      const vib = beatIdx < 4 ? Math.sin(t * 58) * (beatIdx === 3 ? 0.032 : 0.016) : 0;

      if (beatIdx < 4) {
        // Na frente das maos do Voce apontada para a parede do fundo (nunca tampando o rosto!)
        this.drillGroup.visible = true;
        this.drillGroup.position.set(vx + 0.14 + vib, 0.84 + Math.cos(t * 44) * 0.014, vz - 0.36);
        this.drillGroup.rotation.set(0.04 * Math.sin(t * 16), -0.18, vib * 1.4);
      } else if (beatIdx === 4 && beatProgress < 0.08) {
        // Recuo imediato antes da explosao
        this.drillGroup.visible = true;
        this.drillGroup.position.set(vx + 0.10 + vib * 2, 0.90, vz - 0.25);
        this.drillGroup.rotation.set(-0.28, -0.22, 0.25);
      } else {
        // Caida no chao ao lado do Voce em B5 pos-impacto e B6 (rosto 100% livre!)
        this.drillGroup.visible = true;
        this.drillGroup.position.set(-0.92, 0.15, -0.32);
        this.drillGroup.rotation.set(0.28, 0.58, 1.38);
      }

      this.bitMesh.rotation.y = beatIdx < 4 ? t * 34 : 0;
      const heat = beatIdx === 3 ? 0.6 + 0.4 * Math.sin(t * 22) : (beatIdx === 2 ? 0.25 : 0.05);
      this.mats.sparkRed.emissiveIntensity = heat * 1.4;
      this.glowRing.scale.setScalar(1 + heat * 0.35);

      this.frameGroup.rotation.z = beatIdx >= 4 ? -0.38 : (beatIdx >= 2 ? Math.sin(t * 18) * 0.10 - 0.12 : 0.06);
      this.holeGroup.visible = beatIdx > 4 || (beatIdx === 4 && beatProgress >= 0.08);

      if (beatIdx === 4 && beatProgress < 0.28) {
        const p = beatProgress / 0.28;
        this.flyByBit.visible = true;
        this.flyByBit.position.set(lerp(-0.2, 0.10, p), lerp(1.05, 1.32, p), lerp(-0.5, 4.6, p));
        this.flyByBit.rotation.set(t * 14, t * 18, t * 10);
      } else {
        this.flyByBit.visible = false;
      }

      if (beatIdx === 4 && beatProgress >= 0.10) {
        const ep = clamp((beatProgress - 0.10) / 0.85, 0, 1);
        this.explosionGroup.visible = ep < 0.96;
        this.explosionGroup.position.set(-0.10, 1.05, -0.78);
        for (const p of this.puffs) {
          p.position.set(p.userData.vx * ep, p.userData.vy * ep - 1.0 * ep * ep, p.userData.vz * ep);
          p.scale.setScalar(p.userData.s * (1 + ep * 0.9) * (1 - ep * 0.72));
        }
        for (const s of this.sparks) {
          s.position.set(s.userData.vx * ep, s.userData.vy * ep - 1.5 * ep * ep, s.userData.vz * ep);
          s.rotation.set(t * 10, t * 12, 0);
          s.scale.setScalar(Math.max(0.01, 1 - ep));
        }
      } else {
        this.explosionGroup.visible = false;
      }

      if (beatIdx >= 4 && headWorldPos && (beatIdx > 4 || beatProgress > 0.34)) {
        const fall = beatIdx === 4 ? clamp((beatProgress - 0.34) / 0.22, 0, 1) : 1;
        this.helmetHatGroup.visible = true;
        this.helmetHatGroup.position.set(headWorldPos.x, headWorldPos.y + 0.21 + (1 - fall) * 1.4, headWorldPos.z + 0.02);
        this.helmetHatGroup.rotation.set(0.04, 0, Math.sin(t * 4) * 0.03);
      } else {
        this.helmetHatGroup.visible = false;
      }

      this.easterEggGroup.position.y = 0.94 + Math.abs(Math.sin(t * 8.5)) * (beatIdx >= 2 ? 0.07 : 0.015);
      this.easterEggGroup.rotation.z = Math.sin(t * 22) * (beatIdx >= 2 ? 0.11 : 0.02);
      const eyeS = beatIdx >= 2 ? 1.28 : 1.0;
      this.duckEyeL.scale.setScalar(eyeS);
      this.duckEyeR.scale.setScalar(eyeS);
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

  global.FuradeiraParede3D = FuradeiraParede3D;
})(typeof window !== 'undefined' ? window : globalThis);
