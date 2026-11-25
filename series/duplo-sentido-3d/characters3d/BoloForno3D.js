/**
 * BoloForno3D.js -- Prop Comico Cartoon 3D (Ep 11: "O Bolo Cresceu Demais!")
 *
 * Componentes:
 * - Forno pastel retro de confeitaria com porta de vidro articulada (empurrada pelo bolo em B2) e luz interna quente.
 * - Balcao de confeitaria com tigelas, batedor e baloes festivos.
 * - Bolo gigante rosa/chocolate em forma metalica (`this.cakeGroup`) que incha feito balao (B2-B4),
 *   com rachaduras brilhantes de pressao em B4 e segurado em `y <= 0.83` em B3-B4!
 * - Luvas termicas de forno (`ovenMitts`) para o Voce em B2-B4.
 * - Massa de cobertura rosa gigante em fly-by na lente em B5a (`flyByBlob`).
 * - Explosao de 32 puffs de cobertura rosa/creme/chocolate + 24 granulados coloridos em B5!
 * - Coroa de cobertura com cereja no topo (`crownHatGroup`) que voa em arco e pousa na cabeca do Voce em B5b-B6!
 * - Easter Egg: Cupcake rosa fofo com olhoes arregalados (`googly eyes`) balancando no balcao em B3-B6!
 * - 100% deterministico (zero Math.random(), zero NaN).
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class BoloForno3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para BoloForno3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'BoloForno3D';

      this._buildMaterials(T);
      this._buildOvenAndCounter(T);
      this._buildGiantCake(T);
      this._buildOvenMitts(T);
      this._buildFlyByAndExplosion(T);
      this._buildCrownHat(T);
      this._buildEasterEggCupcake(T);
    }

    _buildMaterials(T) {
      this.mats = {
        ovenBody: new T.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.38, metalness: 0.06 }),
        ovenTrim: new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.42 }),
        ovenDark: new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }),
        ovenGlow: new T.MeshStandardMaterial({
          color: 0xfdba74,
          emissive: 0xf97316,
          emissiveIntensity: 0.85,
          roughness: 0.30
        }),
        ovenGlass: new T.MeshStandardMaterial({
          color: 0xffe4e6,
          transparent: true,
          opacity: 0.42,
          roughness: 0.10,
          metalness: 0.25
        }),
        chrome: new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.16 }),
        counterBody: new T.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.48 }),
        counterTop: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.04 }),
        panMetal: new T.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.82, roughness: 0.22 }),
        chocSponge: new T.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.72 }),
        pinkFrosting: new T.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xdb2777,
          emissiveIntensity: 0.06,
          roughness: 0.26
        }),
        pinkDome: new T.MeshStandardMaterial({
          color: 0xf9a8d4,
          emissive: 0xef4444,
          emissiveIntensity: 0.0,
          roughness: 0.24
        }),
        creamWhite: new T.MeshStandardMaterial({ color: 0xfff1f2, roughness: 0.34 }),
        cherryRed: new T.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.18, metalness: 0.08 }),
        stemGreen: new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 }),
        mittPink: new T.MeshStandardMaterial({ color: 0xec4899, roughness: 0.65 }),
        mittCuff: new T.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.55 }),
        bowlMint: new T.MeshStandardMaterial({ color: 0x6ee7b7, roughness: 0.32 }),
        cupcakeWrapper: new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.50 }),
        eyeWhite: new T.MeshBasicMaterial({ color: 0xffffff }),
        eyeBlack: new T.MeshBasicMaterial({ color: 0x0f172a })
      };

      this.sprinkleMats = [
        new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.30 }),
        new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.30 }),
        new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.30 }),
        new T.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.30 }),
        new T.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.30 })
      ];
    }

    _buildOvenAndCounter(T) {
      // Forno pastel a esquerda-centro (x = -0.52, z = -0.96)
      this.ovenGroup = new T.Group();
      this.ovenGroup.position.set(-0.52, 0.0, -0.96);
      this.group.add(this.ovenGroup);

      // Corpo do forno (altura 0.88m)
      const body = new T.Mesh(new T.BoxGeometry(0.92, 0.86, 0.62), this.mats.ovenBody);
      body.position.set(0, 0.43, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      this.ovenGroup.add(body);

      // Topo branco/creme com bocas do fogao
      const stoveTop = new T.Mesh(new T.BoxGeometry(0.96, 0.05, 0.66), this.mats.counterTop);
      stoveTop.position.set(0, 0.88, 0);
      stoveTop.castShadow = true;
      stoveTop.receiveShadow = true;
      this.ovenGroup.add(stoveTop);

      [[-0.24, -0.14], [0.24, -0.14], [-0.24, 0.14], [0.24, 0.14]].forEach(([bx, bz]) => {
        const burner = new T.Mesh(new T.CylinderGeometry(0.085, 0.095, 0.02, 16), this.mats.ovenDark);
        burner.position.set(bx, 0.915, bz);
        this.ovenGroup.add(burner);
      });

      // Painel frontal superior com botoes
      const panel = new T.Mesh(new T.BoxGeometry(0.92, 0.14, 0.04), this.mats.ovenTrim);
      panel.position.set(0, 0.78, 0.31);
      this.ovenGroup.add(panel);

      [-0.30, -0.12, 0.12, 0.30].forEach((kx) => {
        const knob = new T.Mesh(new T.CylinderGeometry(0.028, 0.028, 0.035, 12), this.mats.chrome);
        knob.rotation.x = Math.PI / 2;
        knob.position.set(kx, 0.78, 0.335);
        this.ovenGroup.add(knob);
      });

      // Cavidade interna iluminada do forno
      const cavity = new T.Mesh(new T.BoxGeometry(0.72, 0.48, 0.12), this.mats.ovenGlow);
      cavity.position.set(0, 0.40, 0.26);
      this.ovenGroup.add(cavity);

      // Porta de vidro articulada na base (abre para frente quando o bolo cresce!)
      this.ovenDoorPivot = new T.Group();
      this.ovenDoorPivot.position.set(0, 0.14, 0.32);
      this.ovenGroup.add(this.ovenDoorPivot);

      const doorFrame = new T.Mesh(new T.BoxGeometry(0.78, 0.52, 0.04), this.mats.ovenTrim);
      doorFrame.position.set(0, 0.26, 0);
      doorFrame.castShadow = true;
      this.ovenDoorPivot.add(doorFrame);

      const doorGlass = new T.Mesh(new T.BoxGeometry(0.62, 0.36, 0.05), this.mats.ovenGlass);
      doorGlass.position.set(0, 0.26, 0.005);
      this.ovenDoorPivot.add(doorGlass);

      const doorHandle = new T.Mesh(new T.CylinderGeometry(0.016, 0.016, 0.56, 10), this.mats.chrome);
      doorHandle.rotation.z = Math.PI / 2;
      doorHandle.position.set(0, 0.47, 0.045);
      this.ovenDoorPivot.add(doorHandle);

      // Balcao de confeitaria ao lado direito do forno (x = 0.48, z = -0.96)
      this.counterGroup = new T.Group();
      this.counterGroup.position.set(0.48, 0.0, -0.96);
      this.group.add(this.counterGroup);

      const cBody = new T.Mesh(new T.BoxGeometry(1.04, 0.86, 0.62), this.mats.counterBody);
      cBody.position.set(0, 0.43, 0);
      cBody.castShadow = true;
      cBody.receiveShadow = true;
      this.counterGroup.add(cBody);

      const cTop = new T.Mesh(new T.BoxGeometry(1.08, 0.05, 0.66), this.mats.counterTop);
      cTop.position.set(0, 0.88, 0);
      cTop.castShadow = true;
      cTop.receiveShadow = true;
      this.counterGroup.add(cTop);

      // Tigelas de confeitaria sobre o balcao
      const bowl1 = new T.Mesh(
        new T.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
        this.mats.bowlMint
      );
      bowl1.position.set(-0.26, 0.98, 0.02);
      bowl1.castShadow = true;
      this.counterGroup.add(bowl1);

      const bowl2 = new T.Mesh(
        new T.SphereGeometry(0.10, 14, 10, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
        this.mats.pinkFrosting
      );
      bowl2.position.set(-0.04, 0.96, -0.10);
      this.counterGroup.add(bowl2);

      // Baloes festivos amarrados no canto direito do balcao
      const balloonColors = [0xf472b6, 0xfacc15, 0x38bdf8];
      const balloonOffsets = [
        { x: 0.46, y: 1.48, z: 0.14 },
        { x: 0.58, y: 1.62, z: 0.04 },
        { x: 0.38, y: 1.66, z: -0.04 }
      ];
      this.balloons = [];
      balloonOffsets.forEach((bo, idx) => {
        const str = new T.Mesh(
          new T.CylinderGeometry(0.004, 0.004, bo.y - 0.90, 6),
          this.mats.chrome
        );
        str.position.set(bo.x, 0.90 + (bo.y - 0.90) * 0.5, bo.z);
        this.counterGroup.add(str);

        const bMesh = new T.Mesh(
          new T.SphereGeometry(0.12, 14, 12),
          new T.MeshStandardMaterial({ color: balloonColors[idx], roughness: 0.22 })
        );
        bMesh.scale.set(0.92, 1.15, 0.92);
        bMesh.position.set(bo.x, bo.y, bo.z);
        bMesh.castShadow = true;
        this.counterGroup.add(bMesh);
        this.balloons.push({ mesh: bMesh, baseX: bo.x, baseY: bo.y, seed: idx * 2.1 });
      });
    }

    _buildGiantCake(T) {
      // Bolo gigante rosa/chocolate em forma metalica (exposto como this.cakeGroup!)
      this.cakeGroup = new T.Group();
      this.cakeGroup.name = 'GiantCakeGroup';
      this.group.add(this.cakeGroup);

      // Forma metalica redonda
      const pan = new T.Mesh(new T.CylinderGeometry(0.24, 0.21, 0.09, 22), this.mats.panMetal);
      pan.position.y = 0.045;
      pan.castShadow = true;
      this.cakeGroup.add(pan);

      const panRim = new T.Mesh(new T.TorusGeometry(0.245, 0.016, 8, 24), this.mats.chrome);
      panRim.rotation.x = Math.PI / 2;
      panRim.position.y = 0.09;
      this.cakeGroup.add(panRim);

      // Camadas de massa de chocolate + recheio rosa
      this.cakeLayersGroup = new T.Group();
      this.cakeLayersGroup.position.y = 0.09;
      this.cakeGroup.add(this.cakeLayersGroup);

      const choc1 = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.09, 22), this.mats.chocSponge);
      choc1.position.y = 0.045;
      choc1.castShadow = true;
      this.cakeLayersGroup.add(choc1);

      const creamMid = new T.Mesh(new T.CylinderGeometry(0.226, 0.226, 0.032, 22), this.mats.pinkFrosting);
      creamMid.position.y = 0.105;
      this.cakeLayersGroup.add(creamMid);

      const choc2 = new T.Mesh(new T.CylinderGeometry(0.215, 0.215, 0.08, 22), this.mats.chocSponge);
      choc2.position.y = 0.16;
      choc2.castShadow = true;
      this.cakeLayersGroup.add(choc2);

      // Domo gigante de cobertura rosa que INCHA em B2-B4!
      this.cakeDome = new T.Mesh(new T.SphereGeometry(0.23, 20, 14), this.mats.pinkDome);
      this.cakeDome.scale.set(1.0, 0.65, 1.0);
      this.cakeDome.position.y = 0.22;
      this.cakeDome.castShadow = true;
      this.cakeLayersGroup.add(this.cakeDome);

      // Gotas de cobertura escorrendo pela borda
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const drip = new T.Mesh(new T.SphereGeometry(0.036, 8, 8), this.mats.pinkFrosting);
        drip.scale.set(0.85, 1.45, 0.85);
        drip.position.set(Math.cos(ang) * 0.215, 0.16 + (i % 2) * 0.03, Math.sin(ang) * 0.215);
        this.cakeLayersGroup.add(drip);
      }

      // Granulados coloridos no topo do domo (assentados na superficie da esfera r=0.23!)
      for (let i = 0; i < 14; i++) {
        const ang = i * 2.39996;
        const rad = 0.04 + (i % 4) * 0.038;
        const surfY = Math.sqrt(Math.max(0.01, 0.23 * 0.23 - rad * rad));
        const sp = new T.Mesh(
          new T.BoxGeometry(0.026, 0.012, 0.012),
          this.sprinkleMats[i % this.sprinkleMats.length]
        );
        sp.position.set(Math.cos(ang) * rad, surfY, Math.sin(ang) * rad);
        sp.rotation.set(0.2 * (i % 3), ang, 0.15);
        this.cakeDome.add(sp);
      }
    }

    _buildOvenMitts(T) {
      const makeMitt = () => {
        const g = new T.Group();
        const palm = new T.Mesh(new T.SphereGeometry(0.068, 12, 10), this.mats.mittPink);
        palm.scale.set(1.0, 1.35, 0.72);
        g.add(palm);
        const thumb = new T.Mesh(new T.SphereGeometry(0.032, 10, 8), this.mats.mittPink);
        thumb.position.set(0.055, 0.02, 0);
        g.add(thumb);
        const cuff = new T.Mesh(new T.CylinderGeometry(0.058, 0.062, 0.055, 12), this.mats.mittCuff);
        cuff.position.y = -0.075;
        g.add(cuff);
        return g;
      };
      this.mittL = makeMitt();
      this.mittR = makeMitt();
      this.group.add(this.mittL);
      this.group.add(this.mittR);
    }

    _buildFlyByAndExplosion(T) {
      // Massa de cobertura rosa gigante que passa colada na lente em B5a!
      this.flyByBlob = new T.Group();
      const blobCore = new T.Mesh(new T.SphereGeometry(0.14, 14, 12), this.mats.pinkFrosting);
      blobCore.scale.set(1.25, 0.92, 1.15);
      this.flyByBlob.add(blobCore);
      for (let i = 0; i < 6; i++) {
        const sp = new T.Mesh(new T.BoxGeometry(0.036, 0.015, 0.015), this.sprinkleMats[i % this.sprinkleMats.length]);
        const a = (i / 6) * Math.PI * 2;
        sp.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.09, 0.08);
        sp.rotation.z = a;
        this.flyByBlob.add(sp);
      }
      this.flyByBlob.visible = false;
      this.group.add(this.flyByBlob);

      // 32 puffs explosivos de cobertura rosa/creme/chocolate + 24 granulados em B5!
      this.explosionGroup = new T.Group();
      this.explosionGroup.position.set(-0.08, 0.72, -0.10);
      this.group.add(this.explosionGroup);

      this.explosionPuffs = [];
      for (let i = 0; i < 32; i++) {
        const mat = i % 3 === 0 ? this.mats.pinkFrosting : (i % 3 === 1 ? this.mats.creamWhite : this.mats.chocSponge);
        const rad = 0.055 + ((i * 7) % 5) * 0.018;
        const mesh = new T.Mesh(new T.SphereGeometry(rad, 10, 8), mat);
        mesh.visible = false;
        this.explosionGroup.add(mesh);
        this.explosionPuffs.push({
          mesh,
          seed: i / 32,
          angle: (i * 2.39996) % (Math.PI * 2),
          spread: 0.20 + ((i * 11) % 9) * 0.065,
          heightMul: 0.75 + ((i * 5) % 7) * 0.18
        });
      }

      this.explosionSprinkles = [];
      for (let i = 0; i < 24; i++) {
        const mesh = new T.Mesh(
          new T.BoxGeometry(0.048, 0.018, 0.018),
          this.sprinkleMats[i % this.sprinkleMats.length]
        );
        mesh.visible = false;
        this.explosionGroup.add(mesh);
        this.explosionSprinkles.push({
          mesh,
          seed: i / 24,
          angle: (i * 1.91) % (Math.PI * 2),
          spread: 0.30 + ((i * 13) % 8) * 0.075,
          heightMul: 0.90 + ((i * 3) % 6) * 0.18
        });
      }
    }

    _buildCrownHat(T) {
      // Coroa de cobertura rosa com cereja no topo (pousa limpa na cabeca do Voce em B5b-B6!)
      this.crownHatGroup = new T.Group();
      this.crownHatGroup.visible = false;
      this.group.add(this.crownHatGroup);

      const swirl1 = new T.Mesh(new T.TorusGeometry(0.125, 0.048, 10, 20), this.mats.pinkFrosting);
      swirl1.rotation.x = Math.PI / 2;
      swirl1.position.y = 0.0;
      swirl1.castShadow = true;
      this.crownHatGroup.add(swirl1);

      const swirl2 = new T.Mesh(new T.TorusGeometry(0.088, 0.042, 10, 18), this.mats.creamWhite);
      swirl2.rotation.x = Math.PI / 2;
      swirl2.position.y = 0.055;
      this.crownHatGroup.add(swirl2);

      const swirl3 = new T.Mesh(new T.ConeGeometry(0.075, 0.11, 14), this.mats.pinkFrosting);
      swirl3.position.y = 0.12;
      this.crownHatGroup.add(swirl3);

      // Cereja vermelha brilhante + cabinho verde no topo
      const cherry = new T.Mesh(new T.SphereGeometry(0.042, 12, 10), this.mats.cherryRed);
      cherry.position.y = 0.19;
      cherry.castShadow = true;
      this.crownHatGroup.add(cherry);

      const stem = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 0.06, 8), this.mats.stemGreen);
      stem.position.set(0.01, 0.24, 0);
      stem.rotation.z = -0.25;
      this.crownHatGroup.add(stem);

      // Granulados na coroa
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const sp = new T.Mesh(new T.BoxGeometry(0.024, 0.010, 0.010), this.sprinkleMats[i % this.sprinkleMats.length]);
        sp.position.set(Math.cos(a) * 0.115, 0.03, Math.sin(a) * 0.115);
        sp.rotation.set(0.4, a, 0.3);
        this.crownHatGroup.add(sp);
      }
    }

    _buildEasterEggCupcake(T) {
      // EASTER EGG: Cupcake rosa fofo com olhoes arregalados (googly eyes) no balcao em B3-B6!
      this.cupcakeEggGroup = new T.Group();
      this.cupcakeEggGroup.position.set(-0.08, 0.905, 0.22);
      this.cupcakeEggGroup.visible = false;
      this.counterGroup.add(this.cupcakeEggGroup);

      const base = new T.Mesh(new T.CylinderGeometry(0.088, 0.064, 0.095, 16), this.mats.cupcakeWrapper);
      base.position.y = 0.048;
      base.castShadow = true;
      this.cupcakeEggGroup.add(base);

      const icing = new T.Mesh(new T.SphereGeometry(0.094, 14, 10), this.mats.pinkFrosting);
      icing.scale.set(1.05, 0.78, 1.05);
      icing.position.y = 0.115;
      this.cupcakeEggGroup.add(icing);

      const cherry = new T.Mesh(new T.SphereGeometry(0.022, 10, 8), this.mats.cherryRed);
      cherry.position.y = 0.19;
      this.cupcakeEggGroup.add(cherry);

      // Olhoes arregalados (googly eyes) com pupilas moveis!
      this.eggPupils = [];
      [-0.036, 0.036].forEach((ex, idx) => {
        const sclera = new T.Mesh(new T.SphereGeometry(0.028, 12, 10), this.mats.eyeWhite);
        sclera.scale.set(1, 1, 0.55);
        sclera.position.set(ex, 0.125, 0.084);
        this.cupcakeEggGroup.add(sclera);

        const pupil = new T.Mesh(new T.SphereGeometry(0.014, 10, 8), this.mats.eyeBlack);
        pupil.scale.set(1, 1, 0.55);
        pupil.position.set(ex, 0.125, 0.096);
        this.cupcakeEggGroup.add(pupil);
        this.eggPupils.push({ mesh: pupil, baseX: ex, baseY: 0.125, sign: idx === 0 ? 1 : -1 });
      });
    }

    /**
     * Atualiza estado deterministico do forno, bolo inchando, luvas, explosao, coroa e cupcake Easter Egg.
     */
    update(time, state = {}) {
      const bulge = clamp(state.bulge || 0, 0, 1);
      const doorOpenP = clamp(state.doorOpenP || 0, 0, 1);
      const cakeMode = state.cakeMode || 'oven'; // 'oven' | 'held' | 'exploded'
      const cakePos = state.cakePos || { x: -0.52, y: 0.34, z: -0.62 };
      const cakeRot = state.cakeRot || { x: 0, y: 0, z: 0 };
      const mittsActive = Boolean(state.mittsActive);
      const mittLPos = state.mittLPos || { x: -0.55, y: 0.62, z: -0.15 };
      const mittRPos = state.mittRPos || { x: -0.15, y: 0.62, z: -0.15 };
      const flyByP = clamp(state.flyByP || 0, 0, 1);
      const explosionP = clamp(state.explosionP || 0, 0, 1);
      const cupcakePop = clamp(state.cupcakePop || 0, 0, 1);
      const hatState = state.hat || { mode: 'hidden' };

      // 1. Porta de vidro do forno empurrada pelo bolo em B2
      this.ovenDoorPivot.rotation.x = lerp(0.04, 1.15, doorOpenP);

      // Baloes festivos balancando suavemente
      for (let i = 0; i < this.balloons.length; i++) {
        const bl = this.balloons[i];
        bl.mesh.position.x = bl.baseX + Math.sin(time * 2.1 + bl.seed) * 0.035;
        bl.mesh.position.y = bl.baseY + Math.cos(time * 1.7 + bl.seed) * 0.025;
      }

      // 2. Bolo gigante rosa/chocolate (em B3-B4 mantem y <= 0.83!)
      const rattleX = bulge > 0.25 ? Math.sin(time * 34.0) * 0.016 * bulge : 0;
      const rattleZ = bulge > 0.25 ? Math.cos(time * 29.0) * 0.014 * bulge : 0;

      if (cakeMode === 'held') {
        this.cakeGroup.position.set(
          cakePos.x + rattleX,
          Math.min(0.83, cakePos.y),
          cakePos.z + rattleZ
        );
        this.cakeGroup.rotation.set(cakeRot.x || 0, cakeRot.y || 0, cakeRot.z || 0);
      } else if (cakeMode === 'exploded') {
        // Apos explosao, forma vazia com resto de massa no balcao/piso
        this.cakeGroup.position.set(cakePos.x, Math.min(0.83, cakePos.y), cakePos.z);
        this.cakeGroup.rotation.set(0.08, 0.25, -0.06);
      } else {
        // Dentro/saindo pela porta do forno
        this.cakeGroup.position.set(-0.52 + rattleX, 0.28, -0.62 + doorOpenP * 0.24 + rattleZ);
        this.cakeGroup.rotation.set(0.10 * doorOpenP, 0, 0);
      }

      const swellXZ = 1.0 + bulge * 0.38 + Math.sin(time * 14.0) * 0.04 * bulge;
      const swellY = 1.0 + bulge * 0.42 + Math.cos(time * 16.0) * 0.05 * bulge;
      if (cakeMode === 'exploded') {
        this.cakeLayersGroup.scale.set(1.0, 0.32, 1.0);
        this.cakeDome.visible = false;
      } else {
        this.cakeDome.visible = true;
        this.cakeLayersGroup.scale.set(swellXZ, swellY, swellXZ);
        this.cakeDome.scale.set(1.0 + bulge * 0.14, 0.58 + bulge * 0.28, 1.0 + bulge * 0.14);
      }
      // Pulso vermelho de alerta no domo antes de explodir em B4
      this.mats.pinkDome.emissiveIntensity = bulge > 0.45 ? 0.25 + Math.sin(time * 18.0) * 0.22 : 0.02;

      // 3. Luvas termicas de forno (nas maos do Voce em y <= 0.78 ou sobre o balcao)
      if (mittsActive) {
        this.mittL.position.set(mittLPos.x, Math.min(0.78, mittLPos.y), mittLPos.z);
        this.mittR.position.set(mittRPos.x, Math.min(0.78, mittRPos.y), mittRPos.z);
        this.mittL.rotation.set(-0.5, 0.2, 0.2);
        this.mittR.rotation.set(-0.5, -0.2, -0.2);
        this.mittL.scale.setScalar(1.12);
        this.mittR.scale.setScalar(1.12);
      } else {
        this.mittL.position.set(0.72, 0.94, -0.78);
        this.mittR.position.set(0.86, 0.94, -0.82);
        this.mittL.rotation.set(Math.PI / 2, 0, 0.35);
        this.mittR.rotation.set(Math.PI / 2, 0, -0.25);
        this.mittL.scale.setScalar(0.95);
        this.mittR.scale.setScalar(0.95);
      }

      // 4. Massa de cobertura rosa gigante em FLY-BY na lente em B5a!
      if (flyByP > 0.01 && flyByP < 0.99) {
        this.flyByBlob.visible = true;
        const arcY = Math.sin(flyByP * Math.PI) * 0.55;
        this.flyByBlob.position.set(
          lerp(-0.18, -0.10, flyByP),
          lerp(0.78, 1.38, flyByP) + arcY * 0.35,
          lerp(-0.12, 3.30, flyByP)
        );
        const fSc = 1.0 + Math.sin(flyByP * Math.PI) * 1.75;
        this.flyByBlob.scale.setScalar(fSc);
        this.flyByBlob.rotation.set(flyByP * 12.0, flyByP * 8.0, flyByP * 10.0);
      } else {
        this.flyByBlob.visible = false;
      }

      // 5. Explosao de 32 puffs de cobertura rosa/creme + 24 granulados coloridos em B5!
      if (explosionP > 0.01) {
        const fade = explosionP < 0.80 ? 1.0 : clamp(1 - (explosionP - 0.80) / 0.20, 0, 1);
        for (let i = 0; i < this.explosionPuffs.length; i++) {
          const ep = this.explosionPuffs[i];
          const cyc = (explosionP * 1.75 + ep.seed) % 1;
          ep.mesh.visible = fade > 0.02;
          const r = ep.spread * cyc * 2.20;
          const h = Math.sin(cyc * Math.PI) * 1.15 * ep.heightMul + cyc * 0.12;
          ep.mesh.position.set(
            Math.cos(ep.angle + time * 1.4) * r,
            h,
            Math.sin(ep.angle + time * 1.4) * r + cyc * 0.40
          );
          const pSc = (0.55 + Math.sin(cyc * Math.PI) * 1.08) * fade;
          ep.mesh.scale.setScalar(Math.max(0.05, pSc));
        }
        for (let i = 0; i < this.explosionSprinkles.length; i++) {
          const es = this.explosionSprinkles[i];
          const cyc = (explosionP * 1.95 + es.seed) % 1;
          es.mesh.visible = fade > 0.02;
          const r = es.spread * cyc * 2.35;
          const h = Math.sin(cyc * Math.PI) * 1.25 * es.heightMul;
          es.mesh.position.set(
            Math.cos(es.angle) * r,
            h,
            Math.sin(es.angle) * r + cyc * 0.35
          );
          es.mesh.rotation.set(cyc * 10.0 + i, cyc * 7.0, cyc * 12.0);
          es.mesh.scale.setScalar(Math.max(0.1, fade * 1.1));
        }
      } else {
        for (let i = 0; i < this.explosionPuffs.length; i++) this.explosionPuffs[i].mesh.visible = false;
        for (let i = 0; i < this.explosionSprinkles.length; i++) this.explosionSprinkles[i].mesh.visible = false;
      }

      // 6. Coroa de cobertura com cereja no topo na cabeca do Voce (B5b-B6!)
      if (hatState.mode === 'hat' && hatState.headPos) {
        this.crownHatGroup.visible = true;
        this.crownHatGroup.position.set(
          hatState.headPos.x,
          hatState.headPos.y,
          hatState.headPos.z
        );
        this.crownHatGroup.rotation.set(
          -0.06 + Math.sin(time * 6.0) * 0.04,
          0.12,
          Math.sin(time * 5.0) * 0.06
        );
        this.crownHatGroup.scale.setScalar(1.06);
      } else if (hatState.mode === 'flying' && hatState.flyPos) {
        this.crownHatGroup.visible = true;
        this.crownHatGroup.position.set(hatState.flyPos.x, hatState.flyPos.y, hatState.flyPos.z);
        this.crownHatGroup.rotation.set(hatState.flyRot || 0, 0.25, (hatState.flyRot || 0) * 0.5);
        this.crownHatGroup.scale.setScalar(1.08);
      } else {
        this.crownHatGroup.visible = false;
      }

      // 7. Easter Egg: Cupcake rosa com olhoes arregalados balancando no balcao em B3-B6!
      this.cupcakeEggGroup.visible = cupcakePop > 0.05;
      if (this.cupcakeEggGroup.visible) {
        this.cupcakeEggGroup.position.y = lerp(0.84, 0.915, cupcakePop) + Math.abs(Math.sin(time * 8.0)) * 0.045 * cupcakePop;
        this.cupcakeEggGroup.rotation.y = Math.sin(time * 3.4) * 0.28;
        this.cupcakeEggGroup.rotation.z = Math.sin(time * 7.2) * 0.16;
        const sq = 1.0 + Math.sin(time * 16.0) * 0.08 * cupcakePop;
        this.cupcakeEggGroup.scale.set((0.85 + cupcakePop * 0.35) / Math.sqrt(sq), (0.85 + cupcakePop * 0.35) * sq, (0.85 + cupcakePop * 0.35) / Math.sqrt(sq));
        for (let i = 0; i < this.eggPupils.length; i++) {
          const ep = this.eggPupils[i];
          ep.mesh.position.x = ep.baseX + Math.sin(time * 14.0 * ep.sign) * 0.008;
          ep.mesh.position.y = ep.baseY + Math.cos(time * 17.0 * ep.sign) * 0.008;
        }
      }
    }
  }

  global.BoloForno3D = BoloForno3D;
})(typeof window !== 'undefined' ? window : globalThis);
