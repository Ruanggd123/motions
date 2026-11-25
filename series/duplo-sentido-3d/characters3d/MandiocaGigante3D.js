/**
 * MandiocaGigante3D.js -- Prop/Ator Comico Modular 3D (Padrao Pixar Feira Livre)
 * Mandioca (Aipim/Macaxeira) colossal estilizada em 3D com casca segmentada marrom,
 * ponta descascada branco-creme brilhante, broto verde no topo e particulas de terra/casca.
 */
(function (global) {
  'use strict';

  class MandiocaGigante3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado');
      this.T = T;
      this.group = new T.Group();
      this.scale = opts.scale !== undefined ? opts.scale : 1.0;
      this.wobble = 0;

      const barkMat = new T.MeshStandardMaterial({ color: 0x6b3e26, roughness: 0.88, metalness: 0.04 });
      const barkDarkMat = new T.MeshStandardMaterial({ color: 0x4a2916, roughness: 0.92 });
      const peelMat = new T.MeshStandardMaterial({ color: 0xfef9e7, roughness: 0.42, metalness: 0.05 });
      const creamTipMat = new T.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.35 });
      const leafMat = new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55 });
      const stemMat = new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });

      this.body = new T.Group();

      // Segmentos organicos da raiz colossal (~1.05m ao longo do eixo X)
      const segs = [
        { x: -0.38, r1: 0.055, r2: 0.11, len: 0.24, rotZ: 0.06 },
        { x: -0.16, r1: 0.11, r2: 0.145, len: 0.26, rotZ: -0.02 },
        { x: 0.08, r1: 0.145, r2: 0.135, len: 0.26, rotZ: 0.03 },
        { x: 0.30, r1: 0.135, r2: 0.10, len: 0.22, rotZ: -0.04 }
      ];
      segs.forEach((s) => {
        const m = new T.Mesh(new T.CylinderGeometry(s.r2, s.r1, s.len, 16), barkMat);
        m.rotation.z = -Math.PI / 2 + s.rotZ;
        m.position.set(s.x, 0, 0);
        m.castShadow = true;
        m.receiveShadow = true;
        this.body.add(m);
      });

      // Aneis texturizados de casca rustica ao longo do corpo
      for (let i = 0; i < 9; i++) {
        const rx = -0.36 + i * 0.085;
        const rad = 0.095 + Math.sin(((i + 1) / 10) * Math.PI) * 0.052;
        const ring = new T.Mesh(new T.TorusGeometry(rad, 0.011, 7, 16), barkDarkMat);
        ring.rotation.y = Math.PI / 2;
        ring.position.set(rx, Math.sin(i * 1.4) * 0.008, 0);
        this.body.add(ring);
      }

      // Ponta direita ja parcialmente descascada (creme branquinho lustroso!)
      const peeledCore = new T.Mesh(new T.CylinderGeometry(0.058, 0.096, 0.22, 16), peelMat);
      peeledCore.rotation.z = -Math.PI / 2;
      peeledCore.position.set(0.49, 0.0, 0);
      peeledCore.castShadow = true;
      this.body.add(peeledCore);

      const peeledTip = new T.Mesh(new T.SphereGeometry(0.058, 14, 12), creamTipMat);
      peeledTip.scale.set(1.25, 0.96, 0.96);
      peeledTip.position.set(0.60, 0.0, 0);
      this.body.add(peeledTip);

      // Pétalas de casca aberta dobradas pra tras na divisao
      for (let p = 0; p < 4; p++) {
        const ang = (p / 4) * Math.PI * 2 + 0.4;
        const flap = new T.Mesh(new T.BoxGeometry(0.09, 0.016, 0.055), barkDarkMat);
        flap.position.set(0.39, Math.sin(ang) * 0.115, Math.cos(ang) * 0.115);
        flap.rotation.set(ang, 0, 0.42);
        this.body.add(flap);
      }

      // Ponta esquerda com radicula e broto verde fresquinho da horta
      const leftCap = new T.Mesh(new T.SphereGeometry(0.056, 12, 10), barkDarkMat);
      leftCap.position.set(-0.50, 0, 0);
      this.body.add(leftCap);

      this.sprout = new T.Group();
      this.sprout.position.set(-0.48, 0.04, 0);
      const stem = new T.Mesh(new T.CylinderGeometry(0.012, 0.016, 0.14, 8), stemMat);
      stem.position.set(-0.02, 0.06, 0);
      stem.rotation.z = 0.28;
      this.sprout.add(stem);

      [-0.55, 0.15, 0.72].forEach((ang, idx) => {
        const lf = new T.Mesh(new T.ConeGeometry(0.042, 0.14, 7), leafMat);
        lf.scale.set(1.0, 1.0, 0.35);
        lf.position.set(-0.04 + idx * 0.025, 0.13 + (idx === 1 ? 0.03 : 0), (idx - 1) * 0.02);
        lf.rotation.set(0.2 * (idx - 1), ang, 0.65 - idx * 0.45);
        lf.castShadow = true;
        this.sprout.add(lf);
      });
      this.body.add(this.sprout);

      // Brilho de destaque para leitura clara em tela de celular
      this.body.scale.setScalar(this.scale);
      this.group.add(this.body);
    }

    update(dt, time) {
      const t = time || 0;
      const w = this.wobble || 0;
      this.sprout.rotation.z = Math.sin(t * 4.2) * (0.08 + w * 0.16);
      this.body.rotation.z = Math.sin(t * 7.5) * w * 0.06;
    }
  }

  global.MandiocaGigante3D = MandiocaGigante3D;
})(typeof window !== 'undefined' ? window : globalThis);
