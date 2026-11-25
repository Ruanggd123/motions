/**
 * MangueiraPressao3D.js -- Prop Comico Modular 3D (Padrao Pixar Oficina / Lava-Rapido)
 * Mangueira de pressao amarela grossa, flexivel e segmentada (ligada continuamente da torneira/carretel
 * na parede ate o esguicho de latao com gatilho vermelho acionavel), com jato d'agua 3D pressurizado
 * azul translucido, aneis de pressao, respingos voadores e animacao de chicoteio (whipAmp).
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  class MangueiraPressao3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para MangueiraPressao3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'MangueiraPressao3D';

      this.scale = opts.scale !== undefined ? opts.scale : 1.0;
      this.segCount = opts.segments || 24;
      this.hoseRadius = opts.radius !== undefined ? opts.radius : 0.036;

      this.sprayIntensity = 0;
      this.leakIntensity = 0;
      this.whipAmp = 0;
      this.triggerPull = 0;

      // Vetores reutilizaveis (zero alocacao por frame)
      this._pAnchor = new T.Vector3(1.08, 0.84, -0.96);
      this._pNozzle = new T.Vector3(0.0, 0.72, 0.25);
      this._pAim = new T.Vector3(0.5, 0.74, 0.35);
      this._vDir = new T.Vector3();
      this._p0 = new T.Vector3();
      this._p1 = new T.Vector3();
      this._p2 = new T.Vector3();
      this._p3 = new T.Vector3();
      this._pts = [];
      for (let i = 0; i <= this.segCount; i++) this._pts.push(new T.Vector3());

      this._buildMaterials(T);
      this._buildHoseBody(T);
      this._buildNozzleAndJet(T);
    }

    _buildMaterials(T) {
      this.mats = {
        hoseYellow: new T.MeshStandardMaterial({
          color: 0xfacc15,
          roughness: 0.30,
          metalness: 0.06
        }),
        hoseStripe: new T.MeshStandardMaterial({
          color: 0xeab308,
          roughness: 0.38,
          metalness: 0.05
        }),
        rubberDark: new T.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.72,
          metalness: 0.08
        }),
        brass: new T.MeshStandardMaterial({
          color: 0xd97706,
          roughness: 0.24,
          metalness: 0.78
        }),
        brassBright: new T.MeshStandardMaterial({
          color: 0xfbbf24,
          roughness: 0.20,
          metalness: 0.84
        }),
        triggerRed: new T.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.36,
          metalness: 0.12
        }),
        jetCore: new T.MeshStandardMaterial({
          color: 0xe0f2fe,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.55,
          transparent: true,
          opacity: 0.88,
          roughness: 0.15,
          depthWrite: false
        }),
        jetCone: new T.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.52,
          roughness: 0.18,
          side: T.DoubleSide,
          depthWrite: false
        }),
        jetRing: new T.MeshStandardMaterial({
          color: 0xf0f9ff,
          emissive: 0x7dd3fc,
          emissiveIntensity: 0.45,
          transparent: true,
          opacity: 0.72,
          roughness: 0.12,
          depthWrite: false
        }),
        dropBlue: new T.MeshStandardMaterial({
          color: 0x7dd3fc,
          emissive: 0x0ea5e9,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.86,
          roughness: 0.12
        }),
        dropWhite: new T.MeshStandardMaterial({
          color: 0xf8fafc,
          transparent: true,
          opacity: 0.82,
          roughness: 0.20
        })
      };
    }

    _buildHoseBody(T) {
      this.hoseGroup = new T.Group();
      this.segments = [];
      this.joints = [];

      // Cilindro alinhado no eixo +Z com base em z=0 e topo em z=1 para lookAt perfeito
      const segGeo = new T.CylinderGeometry(this.hoseRadius, this.hoseRadius, 1.0, 12);
      segGeo.rotateX(Math.PI / 2);
      segGeo.translate(0, 0, 0.5);

      const jointGeo = new T.SphereGeometry(this.hoseRadius * 1.02, 10, 8);

      for (let i = 0; i < this.segCount; i++) {
        const mat = (i % 4 === 0) ? this.mats.hoseStripe : this.mats.hoseYellow;
        const seg = new T.Mesh(segGeo, mat);
        seg.castShadow = true;
        seg.receiveShadow = true;
        this.hoseGroup.add(seg);
        this.segments.push(seg);
      }

      for (let i = 0; i <= this.segCount; i++) {
        const joint = new T.Mesh(jointGeo, this.mats.hoseYellow);
        this.hoseGroup.add(joint);
        this.joints.push(joint);
      }

      // Colarinho de engate de latao no ponto inicial (parede/carretel)
      this.anchorCollar = new T.Mesh(
        new T.CylinderGeometry(this.hoseRadius * 1.38, this.hoseRadius * 1.38, 0.09, 14),
        this.mats.brass
      );
      this.anchorCollar.rotation.x = Math.PI / 2;
      this.hoseGroup.add(this.anchorCollar);

      this.group.add(this.hoseGroup);
    }

    _buildNozzleAndJet(T) {
      this.nozzleGroup = new T.Group();
      this.nozzleGroup.scale.setScalar(this.scale);

      // Local +Z aponta na direcao do jato; z = -0.18 eh o engate traseiro da mangueira
      const rearCoupling = new T.Mesh(new T.CylinderGeometry(0.044, 0.046, 0.075, 16), this.mats.brass);
      rearCoupling.rotation.x = Math.PI / 2;
      rearCoupling.position.set(0, 0, -0.16);
      rearCoupling.castShadow = true;
      this.nozzleGroup.add(rearCoupling);

      const rubberBoot = new T.Mesh(new T.CylinderGeometry(0.048, 0.042, 0.055, 16), this.mats.rubberDark);
      rubberBoot.rotation.x = Math.PI / 2;
      rubberBoot.position.set(0, 0, -0.105);
      this.nozzleGroup.add(rubberBoot);

      // Empunhadura robusta (onde as duas maos agarram com firmeza)
      const gripBody = new T.Mesh(new T.CylinderGeometry(0.046, 0.046, 0.16, 16), this.mats.rubberDark);
      gripBody.rotation.x = Math.PI / 2;
      gripBody.position.set(0, 0, -0.01);
      gripBody.castShadow = true;
      this.nozzleGroup.add(gripBody);

      // Aneis amarelos antiderrapantes na empunhadura
      [-0.06, -0.02, 0.02].forEach((rz) => {
        const ring = new T.Mesh(new T.TorusGeometry(0.047, 0.008, 8, 16), this.mats.hoseYellow);
        ring.position.set(0, 0, rz);
        this.nozzleGroup.add(ring);
      });

      // Corpo do esguicho em latao polido
      const valveBody = new T.Mesh(new T.BoxGeometry(0.074, 0.088, 0.085), this.mats.brass);
      valveBody.position.set(0, 0.004, 0.082);
      valveBody.castShadow = true;
      this.nozzleGroup.add(valveBody);

      // Cabo inferior tipo pistola + gatilho vermelho articulado (aperta em B5!)
      const pistolHandle = new T.Mesh(new T.BoxGeometry(0.044, 0.125, 0.052), this.mats.rubberDark);
      pistolHandle.position.set(0, -0.078, 0.036);
      pistolHandle.rotation.x = 0.24;
      pistolHandle.castShadow = true;
      this.nozzleGroup.add(pistolHandle);

      this.triggerPivot = new T.Group();
      this.triggerPivot.position.set(0, -0.030, 0.095);
      const triggerLever = new T.Mesh(new T.BoxGeometry(0.028, 0.105, 0.024), this.mats.triggerRed);
      triggerLever.position.set(0, -0.046, 0.014);
      triggerLever.rotation.x = -0.22;
      this.triggerPivot.add(triggerLever);
      const triggerLock = new T.Mesh(new T.TorusGeometry(0.020, 0.005, 6, 12), this.mats.brassBright);
      triggerLock.position.set(0, -0.092, 0.006);
      triggerLock.rotation.y = Math.PI / 2;
      this.triggerPivot.add(triggerLock);
      this.nozzleGroup.add(this.triggerPivot);

      // Cano e bico de pressao em latao brilhante (+Z = 0.12 .. 0.24)
      const barrel = new T.Mesh(new T.CylinderGeometry(0.028, 0.038, 0.11, 16), this.mats.brassBright);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.010, 0.165);
      barrel.castShadow = true;
      this.nozzleGroup.add(barrel);

      const nozzleTip = new T.Mesh(new T.CylinderGeometry(0.036, 0.026, 0.046, 16), this.mats.brass);
      nozzleTip.rotation.x = Math.PI / 2;
      nozzleTip.position.set(0, 0.010, 0.226);
      this.nozzleGroup.add(nozzleTip);

      const orifice = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.012, 12), this.mats.rubberDark);
      orifice.rotation.x = Math.PI / 2;
      orifice.position.set(0, 0.010, 0.248);
      this.nozzleGroup.add(orifice);

      // --- Vazamento / pingos pressurizados na ponta (visiveis em B2, B3, B4 e B6) ---
      this.leakDrops = [];
      const leakGeo = new T.SphereGeometry(0.018, 8, 6);
      for (let i = 0; i < 8; i++) {
        const drop = new T.Mesh(leakGeo, i % 2 === 0 ? this.mats.dropBlue : this.mats.dropWhite);
        drop.visible = false;
        this.nozzleGroup.add(drop);
        this.leakDrops.push({ mesh: drop, seed: i * 0.17 });
      }

      // --- JATO D'AGUA 3D PRESSURIZADO (cone + nucleo + aneis + 24 goticulas voando!) ---
      this.waterJetGroup = new T.Group();
      this.waterJetGroup.position.set(0, 0.010, 0.25);
      this.waterJetGroup.visible = false;

      const coreGeo = new T.CylinderGeometry(0.044, 0.016, 1.55, 14);
      coreGeo.rotateX(Math.PI / 2);
      coreGeo.translate(0, 0, 0.775);
      this.jetCore = new T.Mesh(coreGeo, this.mats.jetCore);
      this.waterJetGroup.add(this.jetCore);

      const coneGeo = new T.CylinderGeometry(0.24, 0.032, 1.72, 18, 1, true);
      coneGeo.rotateX(Math.PI / 2);
      coneGeo.translate(0, 0, 0.86);
      this.jetCone = new T.Mesh(coneGeo, this.mats.jetCone);
      this.waterJetGroup.add(this.jetCone);

      this.jetRings = [];
      const ringGeo = new T.TorusGeometry(0.068, 0.013, 8, 16);
      for (let i = 0; i < 5; i++) {
        const ring = new T.Mesh(ringGeo, this.mats.jetRing);
        this.waterJetGroup.add(ring);
        this.jetRings.push({ mesh: ring, offset: i / 5 });
      }

      this.sprayDrops = [];
      const dropGeo = new T.SphereGeometry(0.026, 8, 6);
      for (let i = 0; i < 24; i++) {
        const d = new T.Mesh(dropGeo, i % 3 === 0 ? this.mats.dropWhite : this.mats.dropBlue);
        this.waterJetGroup.add(d);
        this.sprayDrops.push({
          mesh: d,
          seed: i * 1.17,
          angle: (i / 24) * Math.PI * 2 + (i % 3) * 0.4,
          spread: 0.14 + (i % 5) * 0.065,
          size: 0.7 + (i % 4) * 0.32
        });
      }

      this.nozzleGroup.add(this.waterJetGroup);
      this.group.add(this.nozzleGroup);
    }

    /**
     * Atualiza a geometria flexivel da mangueira (100% deterministica em funcao de time),
     * conectando anchorPos (parede/carretel) ate nozzlePos (esguicho na mao),
     * com chicoteio (whipAmp), acionamento do gatilho (triggerPull) e jato 3D (sprayIntensity).
     */
    update(time, opts = {}) {
      const t = Number(time) || 0;
      if (opts.anchorPos) this._pAnchor.set(opts.anchorPos.x, opts.anchorPos.y, opts.anchorPos.z);
      if (opts.nozzlePos) this._pNozzle.set(opts.nozzlePos.x, opts.nozzlePos.y, opts.nozzlePos.z);
      if (opts.aimPos) this._pAim.set(opts.aimPos.x, opts.aimPos.y, opts.aimPos.z);
      if (opts.sprayIntensity !== undefined) this.sprayIntensity = clamp(opts.sprayIntensity, 0, 1);
      if (opts.leakIntensity !== undefined) this.leakIntensity = clamp(opts.leakIntensity, 0, 1);
      if (opts.whipAmp !== undefined) this.whipAmp = clamp(opts.whipAmp, 0, 1.5);
      if (opts.triggerPull !== undefined) this.triggerPull = clamp(opts.triggerPull, 0, 1);

      const sag = opts.sag !== undefined ? opts.sag : 0.44;
      const whipFreq = opts.whipFreq !== undefined ? opts.whipFreq : 11.0;

      // 1. Posiciona e aponta o esguicho de latao
      const jitter = this.whipAmp * 0.012;
      this.nozzleGroup.position.set(
        this._pNozzle.x + Math.sin(t * 17.0) * jitter,
        this._pNozzle.y + Math.cos(t * 15.0) * jitter,
        this._pNozzle.z
      );
      this.nozzleGroup.lookAt(this._pAim);

      // Direcao normalizada do esguicho para engatar o ultimo trecho da mangueira sem dobra quebrada
      this._vDir.copy(this._pAim).sub(this._pNozzle);
      if (this._vDir.lengthSq() < 0.0001) this._vDir.set(0, 0, 1);
      else this._vDir.normalize();

      // Gatilho vermelho visivelmente apertado
      this.triggerPivot.rotation.x = -0.34 * this.triggerPull;

      // 2. Curva Bezier cubica ligando anchorPos -> engate traseiro do esguicho
      this._p0.copy(this._pAnchor);
      this._p3.copy(this.nozzleGroup.position).addScaledVector(this._vDir, -0.18 * this.scale);

      const midX = (this._p0.x + this._p3.x) * 0.5;
      const midZ = (this._p0.z + this._p3.z) * 0.5;
      const whipX = Math.sin(t * whipFreq) * 0.16 * this.whipAmp;
      const whipY = Math.cos(t * whipFreq * 0.85 + 0.6) * 0.13 * this.whipAmp;

      // P1 sai para frente e desce do carretel da parede
      this._p1.set(
        this._p0.x - 0.18 + whipX * 0.65,
        Math.max(0.10, this._p0.y - sag * 0.82 + whipY * 0.65),
        this._p0.z + 0.28
      );
      // P2 entra suavemente por tras do esguicho seguindo a direcao contraria do bico
      this._p2.set(
        this._p3.x - this._vDir.x * 0.42 + (midX - this._p3.x) * 0.15 - whipX * 0.85,
        Math.max(0.10, this._p3.y - sag * 0.68 - whipY * 0.75),
        this._p3.z - this._vDir.z * 0.42 + (midZ - this._p3.z) * 0.15
      );

      const N = this.segCount;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const inv = 1 - u;
        const b0 = inv * inv * inv;
        const b1 = 3 * inv * inv * u;
        const b2 = 3 * inv * u * u;
        const b3 = u * u * u;

        const env = Math.sin(u * Math.PI);
        const wave = Math.sin(u * Math.PI * 2.2 - t * whipFreq * 1.15) * 0.095 * this.whipAmp * env;
        const waveY = Math.cos(u * Math.PI * 2.0 - t * whipFreq * 0.95) * 0.065 * this.whipAmp * env;

        const px = b0 * this._p0.x + b1 * this._p1.x + b2 * this._p2.x + b3 * this._p3.x + wave;
        const py = Math.max(0.055, b0 * this._p0.y + b1 * this._p1.y + b2 * this._p2.y + b3 * this._p3.y + waveY);
        const pz = b0 * this._p0.z + b1 * this._p1.z + b2 * this._p2.z + b3 * this._p3.z;
        this._pts[i].set(px, py, pz);
        this.joints[i].position.set(px, py, pz);
      }

      for (let i = 0; i < N; i++) {
        const a = this._pts[i];
        const b = this._pts[i + 1];
        const len = a.distanceTo(b);
        const seg = this.segments[i];
        seg.position.copy(a);
        seg.lookAt(b);
        seg.scale.set(1, 1, Math.max(0.002, len + 0.008));
      }

      this.anchorCollar.position.copy(this._p0);
      this.anchorCollar.lookAt(this._pts[1]);

      // 3. Pingos/vazamento pressurizado na ponta do esguicho
      const showLeak = this.leakIntensity > 0.04 && this.sprayIntensity < 0.7;
      for (let i = 0; i < this.leakDrops.length; i++) {
        const ld = this.leakDrops[i];
        ld.mesh.visible = showLeak;
        if (showLeak) {
          const cyc = (t * (1.8 + this.leakIntensity * 1.4) + ld.seed) % 1;
          const dist = 0.25 + cyc * (0.14 + this.leakIntensity * 0.22);
          const dropY = 0.01 - cyc * cyc * 0.26 + Math.sin(ld.seed * 19) * 0.025 * cyc;
          const dropX = Math.cos(ld.seed * 13) * 0.032 * cyc;
          ld.mesh.position.set(dropX, dropY, dist);
          const sc = (0.55 + (1 - cyc) * 0.65) * (0.65 + this.leakIntensity * 0.5);
          ld.mesh.scale.setScalar(sc);
        }
      }

      // 4. Jato d'agua 3D pressurizado em cone + goticulas voadoras (B5!)
      const sp = this.sprayIntensity;
      this.waterJetGroup.visible = sp > 0.02;
      if (sp > 0.02) {
        const pulse = 1.0 + Math.sin(t * 28.0) * 0.09;
        const lenScale = 0.25 + sp * 0.85;
        const radScale = (0.45 + sp * 0.65) * pulse;
        this.jetCore.scale.set(radScale, radScale, lenScale);
        this.jetCone.scale.set(radScale * 1.06, radScale * 1.06, lenScale);
        this.jetCone.rotation.z = t * 9.0;
        this.mats.jetCore.opacity = 0.88 * sp;
        this.mats.jetCone.opacity = 0.54 * sp;

        for (let i = 0; i < this.jetRings.length; i++) {
          const jr = this.jetRings[i];
          const cyc = (t * 3.6 + jr.offset) % 1;
          jr.mesh.position.set(0, 0, 0.06 + cyc * 1.55 * lenScale);
          const rSc = (0.45 + cyc * 2.15) * (0.6 + sp * 0.5);
          jr.mesh.scale.setScalar(rSc);
        }

        for (let i = 0; i < this.sprayDrops.length; i++) {
          const sd = this.sprayDrops[i];
          const cyc = (t * 2.7 + sd.seed) % 1;
          const z = 0.12 + cyc * 1.85 * lenScale;
          const radial = (0.04 + cyc * sd.spread * 2.2) * (0.6 + sp * 0.6);
          const ang = sd.angle + t * 2.4;
          const dx = Math.cos(ang) * radial;
          const dy = Math.sin(ang) * radial - cyc * cyc * 0.24;
          sd.mesh.position.set(dx, dy, z);
          sd.mesh.scale.setScalar(sd.size * (0.55 + (1 - cyc) * 0.75) * sp);
        }
      }
    }
  }

  global.MangueiraPressao3D = MangueiraPressao3D;
})(typeof window !== 'undefined' ? window : globalThis);
