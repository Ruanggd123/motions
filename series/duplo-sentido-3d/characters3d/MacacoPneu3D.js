/**
 * MacacoPneu3D.js -- Prop Comico Cartoon 3D (Ep 12: "O Macaco Travou na Garagem!")
 *
 * Componentes:
 * - Traseira/lateral de carro compacto azul-celeste estilizado com pneu furado murchinho no piso!
 * - Macaco hidraulico vermelho gigante (`this.jackGroup`) com alavanca articulada e pino vermelho de pressao
 *   que incha e brilha em B3-B4!
 * - Chave de roda cromada em X (`lugWrench`) segurada em y <= 0.80 em B3-B4.
 * - Calota prateada em fly-by colado na lente em B5a (`flyByHubcap`).
 * - Explosao de 32 puffs de poeira/fumaca + 20 porcas/faiscas douradas em B5!
 * - Cone laranja de sinalizacao com faixas brancas (`coneHatGroup`) que voa em arco e pousa na cabeca do Voce em B5b-B6!
 * - Easter Egg: Carrinho de brinquedo amarelo com giroflex azul piscando na bancada em B3-B6!
 * - 100% deterministico (zero Math.random(), zero NaN).
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class MacacoPneu3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para MacacoPneu3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'MacacoPneu3D';

      this._buildMaterials(T);
      this._buildCarCornerAndTire(T);
      this._buildHydraulicJack(T);
      this._buildLugWrench(T);
      this._buildFlyByAndExplosion(T);
      this._buildConeHat(T);
      this._buildEasterEggMiniCar(T);
    }

    _buildMaterials(T) {
      this.mats = {
        carBlue: new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.28, metalness: 0.18 }),
        carGlass: new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.40 }),
        bumperDark: new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.60 }),
        tireRubber: new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.82 }),
        rimChrome: new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.86, roughness: 0.18 }),
        jackRed: new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.34, metalness: 0.22 }),
        pressurePin: new T.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xf97316,
          emissiveIntensity: 0.0,
          roughness: 0.24
        }),
        steel: new T.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.22 }),
        dustGray: new T.MeshStandardMaterial({
          color: 0xe2e8f0,
          emissive: 0xcbd5e1,
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.86,
          roughness: 0.65
        }),
        sparkGold: new T.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.45,
          roughness: 0.25
        }),
        coneOrange: new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.42 }),
        coneWhite: new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 }),
        toyYellow: new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.30 }),
        sirenBlue: new T.MeshStandardMaterial({
          color: 0x3b82f6,
          emissive: 0x2563eb,
          emissiveIntensity: 0.70,
          roughness: 0.20
        })
      };
    }

    _buildCarCornerAndTire(T) {
      // Carro compacto estacionado a esquerda-fundo (x = -0.82, z = -0.78)
      this.carGroup = new T.Group();
      this.carGroup.position.set(-0.82, 0.0, -0.78);
      this.group.add(this.carGroup);

      // Chassi/lataria estilizada (metade visivel no quadro)
      const lowerBody = new T.Mesh(new T.BoxGeometry(1.45, 0.46, 0.92), this.mats.carBlue);
      lowerBody.position.set(0, 0.46, 0);
      lowerBody.castShadow = true;
      lowerBody.receiveShadow = true;
      this.carGroup.add(lowerBody);

      const cabin = new T.Mesh(new T.BoxGeometry(0.95, 0.38, 0.84), this.mats.carBlue);
      cabin.position.set(-0.18, 0.86, 0);
      cabin.castShadow = true;
      this.carGroup.add(cabin);

      const sideWin = new T.Mesh(new T.BoxGeometry(0.76, 0.26, 0.86), this.mats.carGlass);
      sideWin.position.set(-0.18, 0.86, 0);
      this.carGroup.add(sideWin);

      const bumper = new T.Mesh(new T.BoxGeometry(1.50, 0.12, 0.96), this.mats.bumperDark);
      bumper.position.set(0, 0.26, 0);
      this.carGroup.add(bumper);

      // Roda com pneu furado murchinho na frente-direita do carro!
      this.wheelGroup = new T.Group();
      this.wheelGroup.position.set(0.38, 0.24, 0.46);
      this.carGroup.add(this.wheelGroup);

      const tire = new T.Mesh(new T.TorusGeometry(0.21, 0.085, 14, 24), this.mats.tireRubber);
      tire.scale.set(1.08, 0.84, 1.0); // achatado embaixo (furado!)
      tire.castShadow = true;
      this.wheelGroup.add(tire);

      const rim = new T.Mesh(new T.CylinderGeometry(0.14, 0.14, 0.12, 16), this.mats.rimChrome);
      rim.rotation.x = Math.PI / 2;
      this.wheelGroup.add(rim);

      // Pneu reserva encostado ao lado direito do carro
      const spare = new T.Mesh(new T.TorusGeometry(0.20, 0.08, 12, 22), this.mats.tireRubber);
      spare.position.set(0.92, 0.26, -0.35);
      spare.rotation.y = 0.35;
      spare.castShadow = true;
      this.carGroup.add(spare);
    }

    _buildHydraulicJack(T) {
      // Macaco hidraulico vermelho gigante (exposto como this.jackGroup!)
      this.jackGroup = new T.Group();
      this.jackGroup.name = 'HydraulicJackGroup';
      this.jackGroup.position.set(-0.22, 0.0, -0.22);
      this.group.add(this.jackGroup);

      const base = new T.Mesh(new T.BoxGeometry(0.42, 0.07, 0.24), this.mats.jackRed);
      base.position.y = 0.055;
      base.castShadow = true;
      this.jackGroup.add(base);

      // Rodinhas do macaco
      [[-0.16, -0.11], [0.16, -0.11], [-0.16, 0.11], [0.16, 0.11]].forEach(([wx, wz]) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.032, 0.032, 0.025, 10), this.mats.tireRubber);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.032, wz);
        this.jackGroup.add(w);
      });

      // Braco de elevacao
      this.jackArm = new T.Mesh(new T.BoxGeometry(0.32, 0.065, 0.12), this.mats.jackRed);
      this.jackArm.position.set(-0.04, 0.14, 0);
      this.jackArm.rotation.z = -0.25;
      this.jackGroup.add(this.jackArm);

      // Prato de apoio
      this.jackPad = new T.Mesh(new T.CylinderGeometry(0.065, 0.055, 0.03, 14), this.mats.steel);
      this.jackPad.position.set(-0.18, 0.20, 0);
      this.jackGroup.add(this.jackPad);

      // Pino vermelho de pressao que INCHA e BRILHA em B3-B4!
      this.pressurePinMesh = new T.Mesh(new T.SphereGeometry(0.058, 16, 12), this.mats.pressurePin);
      this.pressurePinMesh.position.set(0.14, 0.14, 0.06);
      this.jackGroup.add(this.pressurePinMesh);

      // Alavanca articulada longa para bombear
      this.leverPivot = new T.Group();
      this.leverPivot.position.set(0.16, 0.12, 0);
      this.jackGroup.add(this.leverPivot);

      const leverShaft = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.64, 10), this.mats.steel);
      leverShaft.position.set(0, 0.32, 0);
      leverShaft.castShadow = true;
      this.leverPivot.add(leverShaft);

      const leverGrip = new T.Mesh(new T.CylinderGeometry(0.026, 0.026, 0.16, 10), this.mats.tireRubber);
      leverGrip.position.set(0, 0.58, 0);
      this.leverPivot.add(leverGrip);
    }

    _buildLugWrench(T) {
      // Chave de roda em cruz (segurada em y <= 0.78 em B3-B4)
      this.wrenchGroup = new T.Group();
      this.group.add(this.wrenchGroup);

      const bar1 = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.44, 10), this.mats.rimChrome);
      bar1.rotation.z = Math.PI / 2;
      this.wrenchGroup.add(bar1);

      const bar2 = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.44, 10), this.mats.rimChrome);
      this.wrenchGroup.add(bar2);
    }

    _buildFlyByAndExplosion(T) {
      // Calota prateada que passa colada na lente em B5a!
      this.flyByHubcap = new T.Group();
      const disk = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.04, 18), this.mats.rimChrome);
      disk.rotation.x = Math.PI / 2;
      this.flyByHubcap.add(disk);
      const centerCap = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.05, 12), this.mats.jackRed);
      centerCap.rotation.x = Math.PI / 2;
      this.flyByHubcap.add(centerCap);
      this.flyByHubcap.visible = false;
      this.group.add(this.flyByHubcap);

      // 32 puffs de poeira/fumaca + 20 porcas/faiscas douradas em B5!
      this.explosionGroup = new T.Group();
      this.explosionGroup.position.set(-0.22, 0.35, -0.18);
      this.group.add(this.explosionGroup);

      this.explosionPuffs = [];
      for (let i = 0; i < 32; i++) {
        const rad = 0.058 + ((i * 7) % 5) * 0.018;
        const mesh = new T.Mesh(new T.SphereGeometry(rad, 10, 8), this.mats.dustGray);
        mesh.visible = false;
        this.explosionGroup.add(mesh);
        this.explosionPuffs.push({
          mesh,
          seed: i / 32,
          angle: (i * 2.39996) % (Math.PI * 2),
          spread: 0.20 + ((i * 11) % 9) * 0.065,
          heightMul: 0.78 + ((i * 5) % 7) * 0.18
        });
      }

      this.explosionSparks = [];
      for (let i = 0; i < 20; i++) {
        const mesh = new T.Mesh(new T.OctahedronGeometry(0.032, 0), this.mats.sparkGold);
        mesh.visible = false;
        this.explosionGroup.add(mesh);
        this.explosionSparks.push({
          mesh,
          seed: i / 20,
          angle: (i * 1.91) % (Math.PI * 2),
          spread: 0.28 + ((i * 13) % 8) * 0.075,
          heightMul: 0.85 + ((i * 3) % 6) * 0.18
        });
      }
    }

    _buildConeHat(T) {
      // Cone laranja de sinalizacao (no chao B1-B4 -> voa em B5 -> pousa na cabeca do Voce em B5b-B6!)
      this.coneHatGroup = new T.Group();
      this.group.add(this.coneHatGroup);

      const base = new T.Mesh(new T.BoxGeometry(0.28, 0.03, 0.28), this.mats.coneOrange);
      base.position.y = 0.015;
      base.castShadow = true;
      this.coneHatGroup.add(base);

      const cone = new T.Mesh(new T.ConeGeometry(0.11, 0.34, 16), this.mats.coneOrange);
      cone.position.y = 0.19;
      cone.castShadow = true;
      this.coneHatGroup.add(cone);

      const stripe = new T.Mesh(new T.CylinderGeometry(0.068, 0.088, 0.07, 16), this.mats.coneWhite);
      stripe.position.y = 0.17;
      this.coneHatGroup.add(stripe);
    }

    _buildEasterEggMiniCar(T) {
      // EASTER EGG: Carrinho de brinquedo amarelo com giroflex azul piscando na bancada em B3-B6!
      this.miniCarGroup = new T.Group();
      this.miniCarGroup.position.set(0.74, 0.92, -1.06);
      this.miniCarGroup.visible = false;
      this.group.add(this.miniCarGroup);

      const body = new T.Mesh(new T.BoxGeometry(0.22, 0.09, 0.13), this.mats.toyYellow);
      body.position.y = 0.06;
      body.castShadow = true;
      this.miniCarGroup.add(body);

      const top = new T.Mesh(new T.BoxGeometry(0.12, 0.06, 0.11), this.mats.toyYellow);
      top.position.set(-0.01, 0.13, 0);
      this.miniCarGroup.add(top);

      this.sirenMesh = new T.Mesh(new T.SphereGeometry(0.024, 10, 8), this.mats.sirenBlue);
      this.sirenMesh.position.set(-0.01, 0.175, 0);
      this.miniCarGroup.add(this.sirenMesh);

      [[-0.065, 0.07], [0.065, 0.07], [-0.065, -0.07], [0.065, -0.07]].forEach(([wx, wz]) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.028, 0.028, 0.02, 10), this.mats.tireRubber);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.028, wz);
        this.miniCarGroup.add(w);
      });
    }

    update(time, state = {}) {
      const bulge = clamp(state.bulge || 0, 0, 1);
      const pumpAngle = state.pumpAngle || 0;
      const wrenchActive = Boolean(state.wrenchActive);
      const wrenchPos = state.wrenchPos || { x: 0.32, y: 0.16, z: -0.65 };
      const flyByP = clamp(state.flyByP || 0, 0, 1);
      const explosionP = clamp(state.explosionP || 0, 0, 1);
      const miniCarPop = clamp(state.miniCarPop || 0, 0, 1);
      const hatState = state.hat || { mode: 'floor' };

      // 1. Alavanca do macaco bombeando + pino vermelho inchando e brilhando!
      this.leverPivot.rotation.z = -0.35 + pumpAngle;
      const pinScale = 1.0 + bulge * 1.45 + Math.sin(time * 16.0) * 0.08 * bulge;
      this.pressurePinMesh.scale.setScalar(pinScale);
      this.mats.pressurePin.emissiveIntensity = bulge > 0.35 ? 0.35 + Math.sin(time * 18.0) * 0.32 : 0.02;

      // Carro balanca levemente ao bombear
      this.carGroup.position.y = bulge > 0.1 ? Math.sin(time * 10.0) * 0.015 * bulge : 0.0;

      // 2. Chave de roda em cruz (y <= 0.78 quando segurada)
      if (wrenchActive) {
        this.wrenchGroup.position.set(wrenchPos.x, Math.min(0.78, wrenchPos.y), wrenchPos.z);
        this.wrenchGroup.rotation.set(0.25, 0.4, Math.sin(time * 8.0) * 0.45);
        this.wrenchGroup.scale.setScalar(1.08);
      } else {
        this.wrenchGroup.position.set(0.36, 0.04, -0.52);
        this.wrenchGroup.rotation.set(Math.PI / 2, 0.3, 0);
        this.wrenchGroup.scale.setScalar(0.95);
      }

      // 3. Calota em FLY-BY na lente em B5a!
      if (flyByP > 0.01 && flyByP < 0.99) {
        this.flyByHubcap.visible = true;
        const arcY = Math.sin(flyByP * Math.PI) * 0.50;
        this.flyByHubcap.position.set(
          lerp(-0.32, -0.10, flyByP),
          lerp(0.35, 1.38, flyByP) + arcY * 0.35,
          lerp(-0.22, 3.30, flyByP)
        );
        const fSc = 1.0 + Math.sin(flyByP * Math.PI) * 1.65;
        this.flyByHubcap.scale.setScalar(fSc);
        this.flyByHubcap.rotation.set(flyByP * 14.0, flyByP * 9.0, flyByP * 11.0);
      } else {
        this.flyByHubcap.visible = false;
      }

      // 4. Explosao de 32 puffs + 20 faiscas em B5!
      if (explosionP > 0.01) {
        const fade = explosionP < 0.80 ? 1.0 : clamp(1 - (explosionP - 0.80) / 0.20, 0, 1);
        for (let i = 0; i < this.explosionPuffs.length; i++) {
          const ep = this.explosionPuffs[i];
          const cyc = (explosionP * 1.80 + ep.seed) % 1;
          ep.mesh.visible = fade > 0.02;
          const r = ep.spread * cyc * 2.15;
          const h = Math.sin(cyc * Math.PI) * 1.10 * ep.heightMul + cyc * 0.10;
          ep.mesh.position.set(
            Math.cos(ep.angle + time * 1.4) * r,
            h,
            Math.sin(ep.angle + time * 1.4) * r + cyc * 0.40
          );
          const pSc = (0.50 + Math.sin(cyc * Math.PI) * 1.05) * fade;
          ep.mesh.scale.setScalar(Math.max(0.05, pSc));
        }
        for (let i = 0; i < this.explosionSparks.length; i++) {
          const es = this.explosionSparks[i];
          const cyc = (explosionP * 2.0 + es.seed) % 1;
          es.mesh.visible = fade > 0.02;
          const r = es.spread * cyc * 2.30;
          const h = Math.sin(cyc * Math.PI) * 1.22 * es.heightMul;
          es.mesh.position.set(Math.cos(es.angle) * r, h, Math.sin(es.angle) * r + cyc * 0.35);
          es.mesh.rotation.set(cyc * 10.0, cyc * 8.0, cyc * 12.0);
          es.mesh.scale.setScalar(Math.max(0.1, fade * 1.1));
        }
      } else {
        for (let i = 0; i < this.explosionPuffs.length; i++) this.explosionPuffs[i].mesh.visible = false;
        for (let i = 0; i < this.explosionSparks.length; i++) this.explosionSparks[i].mesh.visible = false;
      }

      // 5. Cone laranja: no chao -> voa -> pousa na cabeca do Voce!
      if (hatState.mode === 'hat' && hatState.headPos) {
        this.coneHatGroup.position.set(hatState.headPos.x, hatState.headPos.y, hatState.headPos.z);
        this.coneHatGroup.rotation.set(-0.08 + Math.sin(time * 6.0) * 0.04, 0.15, Math.sin(time * 5.0) * 0.06);
        this.coneHatGroup.scale.setScalar(1.02);
      } else if (hatState.mode === 'flying' && hatState.flyPos) {
        this.coneHatGroup.position.set(hatState.flyPos.x, hatState.flyPos.y, hatState.flyPos.z);
        this.coneHatGroup.rotation.set(hatState.flyRot || 0, 0.25, (hatState.flyRot || 0) * 0.5);
        this.coneHatGroup.scale.setScalar(1.04);
      } else {
        this.coneHatGroup.position.set(0.92, 0.0, -0.42);
        this.coneHatGroup.rotation.set(0, 0.2, 0);
        this.coneHatGroup.scale.setScalar(1.0);
      }

      // 6. Easter Egg: Carrinho amarelo com giroflex azul piscando na bancada (B3-B6)
      this.miniCarGroup.visible = miniCarPop > 0.05;
      if (this.miniCarGroup.visible) {
        this.miniCarGroup.position.y = lerp(0.86, 0.92, miniCarPop) + Math.abs(Math.sin(time * 8.5)) * 0.04 * miniCarPop;
        this.miniCarGroup.rotation.y = Math.sin(time * 3.0) * 0.25;
        this.miniCarGroup.scale.setScalar(0.88 + miniCarPop * 0.32);
        this.mats.sirenBlue.emissiveIntensity = 0.4 + Math.abs(Math.sin(time * 14.0)) * 1.4;
      }
    }
  }

  global.MacacoPneu3D = MacacoPneu3D;
})(typeof window !== 'undefined' ? window : globalThis);
