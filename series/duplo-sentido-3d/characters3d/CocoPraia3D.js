/**
 * CocoPraia3D.js -- Props Comicos Cartoon 3D + Caranguejo Easter Egg (Ep 08: O Coco Duro da Praia!)
 * - Coco verde gigante inteiro em B2..B4 que racha ao meio em B5:
 *   - Metade superior vira capacete encaixado na cabeca do Voce em B5..B6!
 *   - Metade inferior rola na areia apos fly-by perto da lente!
 * - Canudinho rosa minúsculo (B2) e marreta de madeira cartoon (B3..B5) segurados pelo Voce (y <= 0.815).
 * - Explosao de 32 puffs de agua de coco turquesa + espuma branca em B5.
 * - Easter Egg: Caranguejo vermelho cartoon de oculos escuros saindo do balde de areia e batendo pincas em B3..B6!
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class CocoPraia3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para CocoPraia3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'CocoPraia3D';

      this._buildMaterials(T);
      this._buildCoconutHalves(T);
      this._buildHelmetHalf(T);
      this._buildHeldProps(T);
      this._buildSplashPuffs(T);
      this._buildCrabEasterEgg(T);
    }

    _buildMaterials(T) {
      this.mats = {
        cocoGreen: new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.42, metalness: 0.04 }),
        cocoDarkGreen: new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.48 }),
        cocoMeat: new T.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.55 }),
        cocoShellRim: new T.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 }),
        strawPink: new T.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.14, roughness: 0.25 }),
        woodHandle: new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.62 }),
        malletHead: new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.58 }),
        malletBand: new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.25 }),
        splashAqua: new T.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.22,
          transparent: true,
          opacity: 0.86,
          roughness: 0.18,
          depthWrite: false
        }),
        splashWhite: new T.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xe0f2fe,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.88,
          roughness: 0.22,
          depthWrite: false
        }),
        crabRed: new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.36 }),
        crabOrange: new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.40 }),
        shadesBlack: new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.14, metalness: 0.72 }),
        shadesShine: new T.MeshBasicMaterial({ color: 0xffffff })
      };
    }

    _makeHalfShell(T, isTop) {
      const g = new T.Group();
      const phiStart = 0;
      const phiLength = Math.PI * 2;
      const thetaStart = isTop ? 0 : Math.PI * 0.5;
      const thetaLength = Math.PI * 0.5;

      const outer = new T.Mesh(
        new T.SphereGeometry(0.24, 24, 14, phiStart, phiLength, thetaStart, thetaLength),
        this.mats.cocoGreen
      );
      outer.scale.set(1.0, 1.18, 1.0);
      outer.castShadow = true;
      outer.receiveShadow = true;
      g.add(outer);

      const inner = new T.Mesh(
        new T.SphereGeometry(0.212, 20, 12, phiStart, phiLength, thetaStart, thetaLength),
        this.mats.cocoMeat
      );
      inner.scale.set(1.0, 1.16, 1.0);
      g.add(inner);

      const rim = new T.Mesh(new T.TorusGeometry(0.226, 0.015, 8, 24), this.mats.cocoShellRim);
      rim.rotation.x = Math.PI / 2;
      g.add(rim);

      if (isTop) {
        const crown = new T.Mesh(new T.CylinderGeometry(0.055, 0.085, 0.04, 6), this.mats.cocoDarkGreen);
        crown.position.y = 0.285;
        g.add(crown);
      } else {
        const baseCap = new T.Mesh(new T.CircleGeometry(0.212, 20), this.mats.cocoMeat);
        baseCap.rotation.x = -Math.PI / 2;
        g.add(baseCap);
      }
      return g;
    }

    _buildCoconutHalves(T) {
      this.coconutGroup = new T.Group();
      this.coconutGroup.name = 'GiantCoconut';
      this.cocoGroup = this.coconutGroup;
      this.cocoTop = this._makeHalfShell(T, true);
      this.cocoBottom = this._makeHalfShell(T, false);
      this.coconutGroup.add(this.cocoTop);
      this.coconutGroup.add(this.cocoBottom);
      this.group.add(this.coconutGroup);
    }

    _buildHelmetHalf(T) {
      // Metade verde que pousa na cabeca do Voce como capacete em B5..B6!
      this.helmetGroup = new T.Group();
      this.helmetGroup.name = 'CoconutHelmet';
      const shell = this._makeHalfShell(T, true);
      shell.scale.set(0.86, 0.72, 0.86);
      this.helmetGroup.add(shell);
      this.helmetGroup.visible = false;
      this.group.add(this.helmetGroup);
    }

    _buildHeldProps(T) {
      // 1. Canudinho rosa minusculo de plastico (B2)
      this.strawGroup = new T.Group();
      this.strawGroup.name = 'TinyPinkStraw';
      const stem = new T.Mesh(new T.CylinderGeometry(0.010, 0.010, 0.24, 10), this.mats.strawPink);
      stem.position.y = 0.11;
      stem.castShadow = true;
      this.strawGroup.add(stem);
      const bend = new T.Mesh(new T.CylinderGeometry(0.010, 0.010, 0.08, 10), this.mats.strawPink);
      bend.position.set(0.028, 0.24, 0);
      bend.rotation.z = -0.68;
      this.strawGroup.add(bend);
      this.strawGroup.visible = false;
      this.group.add(this.strawGroup);

      // 2. Marreta de madeira cartoon (B3..B5)
      this.malletGroup = new T.Group();
      this.malletGroup.name = 'WoodenMallet';
      const handle = new T.Mesh(new T.CylinderGeometry(0.020, 0.024, 0.46, 12), this.mats.woodHandle);
      handle.position.y = 0.20;
      handle.castShadow = true;
      this.malletGroup.add(handle);

      const head = new T.Mesh(new T.CylinderGeometry(0.088, 0.088, 0.22, 16), this.mats.malletHead);
      head.rotation.z = Math.PI / 2;
      head.position.y = 0.44;
      head.castShadow = true;
      this.malletGroup.add(head);

      [-0.09, 0.09].forEach((bx) => {
        const band = new T.Mesh(new T.CylinderGeometry(0.092, 0.092, 0.022, 16), this.mats.malletBand);
        band.rotation.z = Math.PI / 2;
        band.position.set(bx, 0.44, 0);
        this.malletGroup.add(band);
      });
      this.malletGroup.visible = false;
      this.group.add(this.malletGroup);
    }

    _buildSplashPuffs(T) {
      // 32 puffs de agua de coco turquesa e espuma branca em B5!
      this.splashGroup = new T.Group();
      this.splashPuffs = [];
      const geo = new T.SphereGeometry(0.085, 10, 8);
      for (let i = 0; i < 32; i++) {
        const isWhite = i % 3 === 0;
        const m = new T.Mesh(geo, isWhite ? this.mats.splashWhite : this.mats.splashAqua);
        m.visible = false;
        this.splashGroup.add(m);
        const angle = (i / 32) * Math.PI * 2 + (i % 4) * 0.22;
        const speed = 0.75 + (i % 5) * 0.28;
        const lift = 0.85 + (i % 6) * 0.24;
        this.splashPuffs.push({
          mesh: m,
          vx: Math.cos(angle) * speed,
          vz: Math.sin(angle) * speed * 0.78,
          vy: lift,
          baseScale: 0.65 + (i % 4) * 0.26
        });
      }
      this.group.add(this.splashGroup);
    }

    _buildCrabEasterEgg(T) {
      // Caranguejo vermelho cartoon de oculos escuros no balde de areia (B3..B6)!
      this.crabGroup = new T.Group();
      this.crabGroup.name = 'BeachCrabEasterEgg';

      const body = new T.Mesh(new T.SphereGeometry(0.115, 16, 12), this.mats.crabRed);
      body.scale.set(1.25, 0.72, 0.95);
      body.castShadow = true;
      this.crabGroup.add(body);

      // 6 patinhas laterais
      [-1, 1].forEach((side) => {
        for (let i = 0; i < 3; i++) {
          const leg = new T.Mesh(new T.CylinderGeometry(0.011, 0.008, 0.11, 8), this.mats.crabOrange);
          leg.position.set(side * (0.12 + i * 0.01), -0.04, -0.05 + i * 0.05);
          leg.rotation.z = side * 0.92;
          this.crabGroup.add(leg);
        }
      });

      // Hastes dos olhos + oculos escuros estilosos!
      [-0.045, 0.045].forEach((ex) => {
        const stalk = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.075, 8), this.mats.crabRed);
        stalk.position.set(ex, 0.085, 0.045);
        this.crabGroup.add(stalk);
      });

      const shades = new T.Group();
      shades.position.set(0, 0.115, 0.078);
      [-0.048, 0.048].forEach((lx) => {
        const lens = new T.Mesh(new T.BoxGeometry(0.074, 0.042, 0.018), this.mats.shadesBlack);
        lens.position.x = lx;
        shades.add(lens);
        const gl = new T.Mesh(new T.BoxGeometry(0.022, 0.008, 0.020), this.mats.shadesShine);
        gl.position.set(lx - 0.014, 0.008, 0.002);
        gl.rotation.z = 0.45;
        shades.add(gl);
      });
      const bridge = new T.Mesh(new T.BoxGeometry(0.032, 0.012, 0.016), this.mats.shadesBlack);
      shades.add(bridge);
      this.crabGroup.add(shades);

      // Pincas articuladas que batem palminha!
      const makeClaw = (side) => {
        const cg = new T.Group();
        cg.position.set(side * 0.145, 0.045, 0.06);
        const arm = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.09, 8), this.mats.crabOrange);
        arm.rotation.z = side * -0.55;
        cg.add(arm);
        const topPin = new T.Mesh(new T.SphereGeometry(0.044, 10, 8), this.mats.crabRed);
        topPin.scale.set(1.1, 0.65, 0.85);
        topPin.position.set(side * 0.035, 0.055, 0.02);
        cg.add(topPin);
        return cg;
      };
      this.crabClawL = makeClaw(-1);
      this.crabClawR = makeClaw(1);
      this.crabGroup.add(this.crabClawL);
      this.crabGroup.add(this.crabClawR);

      this.crabGroup.visible = false;
      this.group.add(this.crabGroup);
    }

    update(time, cfg = {}) {
      const stoolPos = cfg.stoolPos || { x: 0.24, y: 0.56, z: 0.10 };
      const wobbleAngle = cfg.wobbleAngle || 0;
      const wobbleSlideX = cfg.wobbleSlideX || 0;
      const flyByProg = clamp(cfg.flyByProg || 0, 0, 1);
      const splitProg = clamp(cfg.splitProg || 0, 0, 1);
      const splashProg = clamp(cfg.splashProg || 0, 0, 1);
      const helmetProg = clamp(cfg.helmetProg || 0, 0, 1);

      // 1. Coco verde gigante no banquinho -> fly-by perto da lente em B5 -> racha ao meio!
      this.coconutGroup.visible = cfg.showCoconut !== false;
      if (this.coconutGroup.visible) {
        if (flyByProg <= 0.001) {
          this.coconutGroup.position.set(
            stoolPos.x + wobbleSlideX,
            stoolPos.y + 0.25,
            stoolPos.z
          );
          this.coconutGroup.rotation.set(
            wobbleAngle * 0.35,
            0,
            -wobbleAngle
          );
          this.coconutGroup.scale.setScalar(1.0);
          this.cocoTop.position.set(0, 0, 0);
          this.cocoTop.rotation.set(0, 0, 0);
          this.cocoBottom.position.set(0, 0, 0);
          this.cocoBottom.rotation.set(0, 0, 0);
          this.cocoTop.visible = true;
          this.cocoBottom.visible = true;
        } else {
          // Fly-by rapido passando rente a camera e caindo na areia rachado!
          const arcArc = Math.sin(flyByProg * Math.PI);
          const fx = lerp(stoolPos.x + wobbleSlideX, -0.58, flyByProg);
          const fy = lerp(stoolPos.y + 0.25, 0.22, flyByProg) + arcArc * 1.15;
          const fz = lerp(stoolPos.z, 2.35, Math.sin(Math.min(flyByProg, 0.55) * Math.PI)) * (1 - smoothstep01(flyByProg, 0.55, 1.0)) + lerp(0.1, -0.45, flyByProg);
          this.coconutGroup.position.set(fx, Math.max(0.18, fy), fz);
          this.coconutGroup.rotation.set(flyByProg * 7.5, flyByProg * 4.2, flyByProg * 5.0);
          this.cocoTop.visible = splitProg < 0.15;
          this.cocoBottom.visible = true;
          this.cocoBottom.position.set(0, -splitProg * 0.06, 0);
          this.cocoBottom.rotation.set(splitProg * 1.1, 0, splitProg * 0.7);
        }
      }

      // 2. Capacete de metade de coco pousando na cabeca do Voce em B5..B6!
      this.helmetGroup.visible = helmetProg > 0.02;
      if (this.helmetGroup.visible && cfg.helmetTarget) {
        const hp = cfg.helmetTarget;
        const dropOffset = (1 - helmetProg) * 1.15;
        const bounce = helmetProg > 0.78 && helmetProg < 0.99 ? Math.abs(Math.sin((helmetProg - 0.78) * 24.0)) * 0.035 : 0;
        this.helmetGroup.position.set(hp.x, hp.y + dropOffset + bounce, hp.z);
        if (cfg.helmetQuat) {
          this.helmetGroup.quaternion.copy(cfg.helmetQuat);
        } else {
          this.helmetGroup.rotation.set(cfg.helmetTiltX || 0.06, cfg.helmetYaw || 0, cfg.helmetTiltZ || -0.08);
        }
        const hScale = cfg.helmetScale || 1.0;
        this.helmetGroup.scale.setScalar(hScale);
      }

      // 3. Canudinho rosa (B2) e Marreta de madeira (B3..B5) com clamp <= 0.815!
      this.strawGroup.visible = Boolean(cfg.showStraw && cfg.propPos);
      if (this.strawGroup.visible && cfg.propPos) {
        this.strawGroup.position.set(cfg.propPos.x, Math.min(0.815, cfg.propPos.y), cfg.propPos.z);
        this.strawGroup.rotation.set(cfg.strawRotX || 0.35, cfg.propRotY || 0, cfg.strawRotZ || -0.22);
      }

      this.malletGroup.visible = Boolean(cfg.showMallet && cfg.propPos);
      if (this.malletGroup.visible && cfg.propPos) {
        if (cfg.malletDropped) {
          this.malletGroup.position.set(cfg.propPos.x, 0.088, cfg.propPos.z);
          this.malletGroup.rotation.set(0.0, cfg.propRotY || 0.45, Math.PI / 2);
        } else {
          this.malletGroup.position.set(cfg.propPos.x, Math.min(0.815, cfg.propPos.y), cfg.propPos.z);
          this.malletGroup.rotation.set(cfg.malletRotX || 0.20, cfg.propRotY || 0, cfg.malletRotZ || -0.35);
        }
      }

      // 4. Explosao de 32 puffs de agua de coco turquesa/branca!
      const showSplash = splashProg > 0.01 && splashProg < 0.99;
      const splashOrigin = cfg.splashOrigin || { x: 0.05, y: 1.15, z: 0.35 };
      this.splashGroup.position.set(splashOrigin.x, splashOrigin.y, splashOrigin.z);
      for (let i = 0; i < this.splashPuffs.length; i++) {
        const p = this.splashPuffs[i];
        p.mesh.visible = showSplash;
        if (showSplash) {
          const grav = 2.6 * splashProg * splashProg;
          p.mesh.position.set(
            p.vx * splashProg * 1.15,
            Math.max(-0.95, p.vy * splashProg - grav),
            p.vz * splashProg * 1.15
          );
          const s = p.baseScale * Math.sin(splashProg * Math.PI) * 1.35;
          p.mesh.scale.setScalar(Math.max(0.05, s));
        }
      }

      // 5. Easter Egg: Caranguejo de oculos escuros no balde de areia!
      const crabPop = clamp(cfg.crabPop || 0, 0, 1);
      this.crabGroup.visible = crabPop > 0.02;
      if (this.crabGroup.visible && cfg.bucketPos) {
        const bp = cfg.bucketPos;
        const dance = Math.sin(time * 9.5) * 0.025 * crabPop;
        this.crabGroup.position.set(bp.x, bp.y + 0.14 + crabPop * 0.18 + Math.abs(dance), bp.z);
        this.crabGroup.rotation.y = -0.35 + Math.sin(time * 4.2) * 0.24;
        const snap = Math.abs(Math.sin(time * 12.0)) * 0.42;
        this.crabClawL.rotation.z = snap;
        this.crabClawR.rotation.z = -snap;
      }
    }
  }

  function smoothstep01(v, a, b) {
    const t = clamp((v - a) / Math.max(0.001, b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  global.CocoPraia3D = CocoPraia3D;
})(typeof window !== 'undefined' ? window : globalThis);
