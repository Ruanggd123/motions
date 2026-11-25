/**
 * Periquito3D.js -- Rig Avicola 3D Estilizado (Padrao Pixar Comico)
 * Periquito verde-esmeralda gordinho com topete amarelo, bico laranja curvado,
 * olhos expressivos com pupila dilatavel e asas/cauda articuladas em 60fps.
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  class Periquito3D {
    constructor(options = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para Periquito3D');

      this.group = new T.Group();
      this.group.name = 'Periquito3D';

      this.scaleVal = options.scale || 1.0;
      this.flapSpeed = 0;
      this.emotion = options.emotion || 'chaotic';
      this.beakOpen = 0;

      this._buildBody(T);
      if (options.scale) this.group.scale.setScalar(this.scaleVal);
    }

    _buildBody(T) {
      const greenBody = new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 });
      const brightGreen = new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.42 });
      const bellyYellow = new T.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.50 });
      const headYellow = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.40 });
      const wingDark = new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.48 });
      const tipTeal = new T.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.42 });
      const orangeBeak = new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 });
      const clawMat = new T.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.55 });
      const whiteEye = new T.MeshBasicMaterial({ color: 0xffffff });
      const darkPupil = new T.MeshBasicMaterial({ color: 0x09090b });
      const blushMat = new T.MeshBasicMaterial({ color: 0x38bdf8 });

      this.bodyPivot = new T.Group();
      this.group.add(this.bodyPivot);

      // Barriga fofa ovóide
      const torso = new T.Mesh(new T.SphereGeometry(0.22, 24, 20), greenBody);
      torso.scale.set(0.95, 1.18, 1.06);
      torso.position.set(0, 0.28, 0);
      torso.castShadow = true;
      this.bodyPivot.add(torso);

      // Peito amarelo-limão com contraste cômico
      const chest = new T.Mesh(new T.SphereGeometry(0.18, 20, 18), bellyYellow);
      chest.scale.set(0.92, 1.05, 0.72);
      chest.position.set(0, 0.27, 0.095);
      this.bodyPivot.add(chest);

      // Cabeça arredondada
      this.headGroup = new T.Group();
      this.headGroup.position.set(0, 0.52, 0.04);
      this.bodyPivot.add(this.headGroup);

      const skull = new T.Mesh(new T.SphereGeometry(0.165, 24, 20), headYellow);
      skull.scale.set(1.04, 0.98, 1.02);
      skull.castShadow = true;
      this.headGroup.add(skull);

      // Topete arrepiado em 3 penas
      [-0.22, 0.0, 0.24].forEach((rz, idx) => {
        const cr = new T.Mesh(new T.ConeGeometry(0.036, 0.14 - idx * 0.012, 10), brightGreen);
        cr.position.set(rz * 0.18, 0.19, -0.02 + idx * 0.02);
        cr.rotation.set(-0.25, 0, rz);
        cr.castShadow = true;
        this.headGroup.add(cr);
      });

      // Bochechas azuis tipicas de periquito australiano
      [-0.125, 0.125].forEach((cx) => {
        const ch = new T.Mesh(new T.SphereGeometry(0.034, 12, 10), blushMat);
        ch.scale.set(0.55, 0.85, 0.95);
        ch.position.set(cx, -0.03, 0.11);
        this.headGroup.add(ch);
      });

      // Olhos Pixar esbugalhados
      this.eyeL = new T.Group();
      this.eyeR = new T.Group();
      [[-0.088, this.eyeL], [0.088, this.eyeR]].forEach(([ex, eg]) => {
        eg.position.set(ex, 0.035, 0.132);
        const sclera = new T.Mesh(new T.SphereGeometry(0.046, 16, 14), whiteEye);
        sclera.scale.set(1.0, 1.12, 0.65);
        eg.add(sclera);

        const pup = new T.Mesh(new T.SphereGeometry(0.024, 12, 10), darkPupil);
        pup.position.set(0, 0, 0.024);
        eg.add(pup);

        const spec = new T.Mesh(new T.SphereGeometry(0.008, 8, 8), whiteEye);
        spec.position.set(0.01, 0.01, 0.044);
        eg.add(spec);
        this.headGroup.add(eg);
      });

      // Bico superior e inferior articulado
      const beakTop = new T.Mesh(new T.ConeGeometry(0.045, 0.11, 14), orangeBeak);
      beakTop.rotation.x = Math.PI * 0.56;
      beakTop.position.set(0, -0.015, 0.19);
      this.headGroup.add(beakTop);

      this.beakBottomPivot = new T.Group();
      this.beakBottomPivot.position.set(0, -0.035, 0.145);
      const beakBot = new T.Mesh(new T.ConeGeometry(0.032, 0.075, 12), orangeBeak);
      beakBot.rotation.x = Math.PI * 0.45;
      beakBot.position.set(0, -0.01, 0.035);
      this.beakBottomPivot.add(beakBot);
      this.headGroup.add(this.beakBottomPivot);

      // Asas articuladas esq / dir
      const makeWing = (side) => {
        const pivot = new T.Group();
        pivot.position.set(side * 0.19, 0.36, -0.01);
        const featherMain = new T.Mesh(new T.SphereGeometry(0.16, 18, 14), wingDark);
        featherMain.scale.set(0.32, 1.05, 1.45);
        featherMain.position.set(side * 0.04, -0.08, -0.09);
        featherMain.rotation.x = 0.25;
        featherMain.castShadow = true;
        pivot.add(featherMain);

        const tip = new T.Mesh(new T.ConeGeometry(0.055, 0.16, 10), tipTeal);
        tip.rotation.x = -Math.PI * 0.45;
        tip.position.set(side * 0.05, -0.14, -0.25);
        pivot.add(tip);
        this.bodyPivot.add(pivot);
        return pivot;
      };
      this.wingL = makeWing(-1);
      this.wingR = makeWing(1);

      // Leque da cauda apontando para trás sem mostrar base chapada
      this.tailPivot = new T.Group();
      this.tailPivot.position.set(0, 0.14, -0.14);
      [-0.22, 0, 0.22].forEach((ry, i) => {
        const tFeather = new T.Mesh(new T.ConeGeometry(0.038, 0.28, 12), i === 1 ? tipTeal : wingDark);
        tFeather.rotation.set(Math.PI * 0.62, ry, 0);
        tFeather.position.set(Math.sin(ry) * 0.04, -0.05, -0.11);
        this.tailPivot.add(tFeather);
      });
      this.bodyPivot.add(this.tailPivot);

      // Patinhas laranja pousando em y = 0.00
      [-0.075, 0.075].forEach((lx) => {
        const leg = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.08, 8), clawMat);
        leg.position.set(lx, 0.045, 0.02);
        this.bodyPivot.add(leg);
        const foot = new T.Mesh(new T.SphereGeometry(0.028, 10, 8), clawMat);
        foot.scale.set(1.2, 0.45, 1.5);
        foot.position.set(lx, 0.012, 0.038);
        this.bodyPivot.add(foot);
      });
    }

    update(dt, time) {
      const t = time || 0;
      const flap = clamp(this.flapSpeed, 0, 1);
      const wingAngle = flap * (Math.sin(t * 24.0) * 0.72 + 0.32);
      this.wingL.rotation.z = -0.14 - wingAngle;
      this.wingR.rotation.z = 0.14 + wingAngle;

      this.tailPivot.rotation.x = Math.sin(t * 9.0) * (0.08 + flap * 0.16);
      this.beakBottomPivot.rotation.x = clamp(this.beakOpen, 0, 1) * 0.48;

      if (this.emotion === 'sleepy') {
        this.eyeL.scale.y = 0.25;
        this.eyeR.scale.y = 0.25;
      } else {
        const blink = (t % 3.2) < 0.11 ? 0.15 : 1.0;
        this.eyeL.scale.y = blink;
        this.eyeR.scale.y = blink;
      }
      this.headGroup.rotation.z = Math.sin(t * 4.5) * 0.09;
      this.headGroup.rotation.y = Math.sin(t * 3.1) * 0.18;
    }
  }

  global.Periquito3D = Periquito3D;
})(typeof window !== 'undefined' ? window : this);
