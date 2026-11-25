/**
 * Genio3D.js -- Genio da Lampada Magica em 3D Articulado (Duplo Sentido 3D)
 * Visual Pixar estilizado: corpo superior azul vibrante (#0ea5e9), turbante roxo com gema esmeralda,
 * cavanhaque pontudo, braceletes dourados e coluna de fumaca encantada ancorada diretamente
 * no bico da lampada dourada (zero flutuacao solta no ar!).
 */
(function (global) {
  'use strict';

  class Genio3D {
    constructor(options = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para Genio3D');

      this.T = T;
      this.id = 'GENIO';
      this.group = new T.Group();
      this.group.name = 'Genio3D';

      this.time = 0;
      this.mouthOpen = 0;
      this.emotion = options.emotion || 'smirk';
      this.pose = options.pose || 'idle';
      this.emerge = options.emerge !== undefined ? options.emerge : 1.0;
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.isBlinking = false;
      this._talkEnergy = 0;
      this._lastMouth = -1;
      this._lastEmotion = null;
      this._lastBlink = null;

      this._buildMaterials(T);
      this._buildLampAndSmoke(T);
      this._buildTorsoAndHead(T);

      if (options.position) {
        this.group.position.set(options.position.x || 0, options.position.y || 0, options.position.z || 0);
      }
      if (options.scale) {
        this.group.scale.setScalar(options.scale);
      }
      this._updateFace();
    }

    _buildMaterials(T) {
      this.mats = {
        skinBlue: new T.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.42, metalness: 0.08, emissive: 0x0369a1, emissiveIntensity: 0.14 }),
        skinChestLight: new T.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.38, metalness: 0.06, emissive: 0x0284c7, emissiveIntensity: 0.10 }),
        smokeGlow: new T.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.35, transparent: true, opacity: 0.88, emissive: 0x06b6d4, emissiveIntensity: 0.35 }),
        gold: new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.24, metalness: 0.86, emissive: 0xb45309, emissiveIntensity: 0.15 }),
        sashRed: new T.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.55 }),
        turbanPurple: new T.MeshStandardMaterial({ color: 0x7e22ce, roughness: 0.50 }),
        emerald: new T.MeshStandardMaterial({ color: 0x10b981, roughness: 0.18, metalness: 0.2, emissive: 0x059669, emissiveIntensity: 0.45 }),
        beardDark: new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.82 })
      };
    }

    _buildLampAndSmoke(T) {
      // Base exata da lampada repousa em y = 0.00 local
      this.lampPivot = new T.Group();
      this.group.add(this.lampPivot);

      const foot = new T.Mesh(new T.CylinderGeometry(0.10, 0.14, 0.04, 24), this.mats.gold);
      foot.position.y = 0.02;
      foot.castShadow = true;
      foot.receiveShadow = true;
      this.lampPivot.add(foot);

      const bowl = new T.Mesh(new T.SphereGeometry(0.16, 24, 18), this.mats.gold);
      bowl.scale.set(1.35, 0.62, 0.92);
      bowl.position.set(0, 0.11, 0);
      bowl.castShadow = true;
      this.lampPivot.add(bowl);

      const lid = new T.Mesh(new T.ConeGeometry(0.06, 0.08, 16), this.mats.gold);
      lid.position.set(0, 0.22, 0);
      this.lampPivot.add(lid);

      const spout = new T.Mesh(new T.CylinderGeometry(0.026, 0.055, 0.18, 14), this.mats.gold);
      spout.rotation.z = -1.05;
      spout.position.set(0.21, 0.16, 0);
      this.lampPivot.add(spout);

      const handle = new T.Mesh(new T.TorusGeometry(0.065, 0.015, 10, 20), this.mats.gold);
      handle.position.set(-0.22, 0.13, 0);
      this.lampPivot.add(handle);

      // Coluna de fumaca cônica conectada fisicamente do bico da lampada ate a cintura do Genio (zero fresta!)
      this.bodyPivot = new T.Group();
      this.bodyPivot.position.set(0.24, 0.16, 0);
      this.group.add(this.bodyPivot);

      this.smokeRings = [];
      for (let i = 0; i < 7; i++) {
        const u = i / 6;
        const r = 0.032 + u * 0.132;
        const ring = new T.Mesh(new T.SphereGeometry(r, 18, 14), this.mats.smokeGlow);
        ring.scale.set(1.0, 1.38, 1.0);
        ring.position.set(0, u * 0.46, 0);
        this.bodyPivot.add(ring);
        this.smokeRings.push(ring);
      }

      // Faixa vermelha da cintura conectada sem espaco ao tronco
      this.pelvis = new T.Group();
      this.pelvis.position.set(0, 0.50, 0);
      this.bodyPivot.add(this.pelvis);

      const sash = new T.Mesh(new T.CylinderGeometry(0.155, 0.125, 0.16, 24), this.mats.sashRed);
      sash.scale.set(1.12, 1.0, 0.86);
      sash.castShadow = true;
      this.pelvis.add(sash);
    }

    _buildTorsoAndHead(T) {
      this.spine = new T.Group();
      this.spine.position.set(0, 0.04, 0);
      this.pelvis.add(this.spine);

      // Peito atletico de desenho Pixar
      const torso = new T.Mesh(new T.CylinderGeometry(0.24, 0.15, 0.36, 28), this.mats.skinBlue);
      torso.scale.set(1.16, 1.0, 0.82);
      torso.position.y = 0.18;
      torso.castShadow = true;
      this.spine.add(torso);

      const chest = new T.Mesh(new T.SphereGeometry(0.18, 22, 16), this.mats.skinChestLight);
      chest.scale.set(1.22, 0.85, 0.72);
      chest.position.set(0, 0.25, 0.07);
      this.spine.add(chest);

      this.neck = new T.Group();
      this.neck.position.set(0, 0.35, 0);
      this.spine.add(this.neck);

      const neckMesh = new T.Mesh(new T.CylinderGeometry(0.072, 0.092, 0.15, 18), this.mats.skinBlue);
      neckMesh.position.y = 0.05;
      this.neck.add(neckMesh);

      this.headGroup = new T.Group();
      this.headGroup.position.set(0, 0.16, 0);
      this.neck.add(this.headGroup);

      const skull = new T.Mesh(new T.SphereGeometry(0.165, 28, 22), this.mats.skinBlue);
      skull.scale.set(1.02, 1.08, 0.96);
      skull.castShadow = true;
      this.headGroup.add(skull);

      // Orelhas pontudas + brincos argola dourados
      [-0.165, 0.165].forEach((ex, i) => {
        const ear = new T.Mesh(new T.ConeGeometry(0.036, 0.10, 12), this.mats.skinBlue);
        ear.position.set(ex, 0.02, 0);
        ear.rotation.z = i === 0 ? 1.15 : -1.15;
        this.headGroup.add(ear);

        const earring = new T.Mesh(new T.TorusGeometry(0.025, 0.0055, 10, 18), this.mats.gold);
        earring.position.set(ex * 1.04, -0.03, 0.01);
        earring.rotation.y = Math.PI / 2;
        this.headGroup.add(earring);
      });

      // Cavanhaque conectado firmemente ao queixo
      const goatee = new T.Mesh(new T.ConeGeometry(0.032, 0.11, 14), this.mats.beardDark);
      goatee.position.set(0, -0.155, 0.125);
      goatee.rotation.x = Math.PI - 0.18;
      this.headGroup.add(goatee);

      // Turbante roxo com gema verde + pena branca
      const turban = new T.Mesh(new T.SphereGeometry(0.185, 26, 20), this.mats.turbanPurple);
      turban.scale.set(1.12, 0.78, 1.06);
      turban.position.set(0, 0.145, -0.01);
      turban.castShadow = true;
      this.headGroup.add(turban);

      const brooch = new T.Mesh(new T.OctahedronGeometry(0.042, 0), this.mats.emerald);
      brooch.position.set(0, 0.145, 0.175);
      this.headGroup.add(brooch);

      const feather = new T.Mesh(
        new T.ConeGeometry(0.038, 0.20, 12),
        new T.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.4 })
      );
      feather.scale.set(0.55, 1.0, 0.25);
      feather.position.set(0.02, 0.265, 0.13);
      feather.rotation.set(-0.25, 0, -0.22);
      this.headGroup.add(feather);

      // Rosto expressivo em canvas 512x512
      this._buildFaceCanvas(T);

      // Bracos musculosos com braceletes de ouro
      this.shoulderL = this._createArm(T, -0.27, false);
      this.shoulderR = this._createArm(T, 0.27, true);
      this.spine.add(this.shoulderL.root);
      this.spine.add(this.shoulderR.root);
    }

    _buildFaceCanvas(T) {
      this.faceCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
      if (!this.faceCanvas) return;
      this.faceCanvas.width = 512;
      this.faceCanvas.height = 512;
      this.faceCtx = this.faceCanvas.getContext('2d');
      this.faceTex = new T.CanvasTexture(this.faceCanvas);
      this.faceTex.generateMipmaps = false;
      this.faceTex.minFilter = T.LinearFilter;

      const geo = (global.CharacterFaceTextures && global.CharacterFaceTextures.createCurvedFaceGeometry)
        ? global.CharacterFaceTextures.createCurvedFaceGeometry(T, {
            radiusTop: 0.166,
            radiusBottom: 0.166,
            height: 0.22,
            thetaLength: Math.PI * 0.62
          })
        : new T.PlaneGeometry(0.24, 0.22);

      const mat = new T.MeshBasicMaterial({ map: this.faceTex, transparent: true, depthWrite: false });
      const faceMesh = new T.Mesh(geo, mat);
      faceMesh.position.set(0, 0.0, 0.015);
      this.headGroup.add(faceMesh);
    }

    _createArm(T, xOffset, isRight) {
      const root = new T.Group();
      root.position.set(xOffset, 0.31, 0);

      const shoulderCap = new T.Mesh(new T.SphereGeometry(0.072, 16, 14), this.mats.skinBlue);
      root.add(shoulderCap);

      const upper = new T.Mesh(new T.CylinderGeometry(0.062, 0.048, 0.24, 18), this.mats.skinBlue);
      upper.position.y = -0.12;
      upper.castShadow = true;
      root.add(upper);

      const elbow = new T.Group();
      elbow.position.y = -0.24;
      root.add(elbow);

      const fore = new T.Mesh(new T.CylinderGeometry(0.052, 0.038, 0.22, 18), this.mats.skinBlue);
      fore.position.y = -0.11;
      fore.castShadow = true;
      elbow.add(fore);

      const cuff = new T.Mesh(new T.CylinderGeometry(0.044, 0.044, 0.045, 18), this.mats.gold);
      cuff.position.y = -0.19;
      elbow.add(cuff);

      const hand = new T.Group();
      hand.position.y = -0.225;
      elbow.add(hand);

      const palm = new T.Mesh(new T.SphereGeometry(0.048, 16, 14), this.mats.skinBlue);
      palm.scale.set(1.0, 1.12, 0.72);
      hand.add(palm);

      return { root, elbow, hand, side: isRight ? 1 : -1 };
    }

    _updateFace() {
      if (!this.faceCtx || !this.faceTex) return;
      const ctx = this.faceCtx;
      const w = 512, h = 512;
      ctx.clearRect(0, 0, w, h);

      const m = Math.max(0, Math.min(1, this.mouthOpen || 0));
      const blink = Boolean(this.isBlinking);
      const browTilt = this.emotion === 'smirk' ? -12 : (this.emotion === 'wink_cta' ? -16 : 6);

      // Sobrancelhas grossas expressivas
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(132, 165);
      ctx.quadraticCurveTo(176, 134 + browTilt, 222, 158);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(290, 158);
      ctx.quadraticCurveTo(336, 134 - browTilt * 0.6, 380, 165);
      ctx.stroke();

      // Olhos dourados/brancos com pupila
      const drawEye = (cx, wink) => {
        if (blink || wink) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(cx - 32, 208);
          ctx.quadraticCurveTo(cx, 225, cx + 32, 208);
          ctx.stroke();
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx, 208, 34, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx + (this.lookYaw || 0) * 14, 208, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 6, 198, 6, 0, Math.PI * 2);
        ctx.fill();
      };
      drawEye(178, false);
      drawEye(334, this.emotion === 'wink_cta');

      // Sorriso largo malandro + bigode estilizado
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(192, 305);
      ctx.quadraticCurveTo(222, 292, 256, 306);
      ctx.quadraticCurveTo(290, 292, 320, 305);
      ctx.stroke();

      const mh = 18 + m * 56;
      ctx.fillStyle = '#4c0519';
      ctx.beginPath();
      ctx.ellipse(256, 345, 58, mh, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dentes brancos brilhantes no sorriso
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(212, 330, 88, Math.min(20, mh * 0.72), 6);
      ctx.fill();

      this.faceTex.needsUpdate = true;
      this._lastMouth = m;
      this._lastEmotion = this.emotion;
      this._lastBlink = blink;
    }

    setEmotion(e) {
      if (this.emotion === e && this._lastEmotion === e) return;
      this.emotion = e;
      this._updateFace();
    }

    setPose(p) { this.pose = p || 'idle'; }
    setLook(y = 0, p = 0) { this.lookYaw = y; this.lookPitch = p; }
    setMouthOpen(v) {
      const m = Math.max(0, Math.min(1, Number(v) || 0));
      if (Math.abs(m - this._lastMouth) > 0.04 || (m > 0.08) !== (this._lastMouth > 0.08)) {
        this.mouthOpen = m;
        this._updateFace();
      } else {
        this.mouthOpen = m;
      }
    }

    update(dt, absT) {
      const safeDt = Math.max(0.0001, Math.min(0.1, Number(dt) || 1 / 60));
      const prevT = this.time || 0;
      this.time = (typeof absT === 'number' && Number.isFinite(absT)) ? absT : (this.time + safeDt);
      const t = this.time;

      const blinkPh = t % 3.4;
      this.isBlinking = blinkPh > 3.28;
      if (this.isBlinking !== this._lastBlink) this._updateFace();

      const m = Math.max(0, Math.min(1, Number(this.mouthOpen) || 0));
      const mr = Math.max(0, Math.min(1, (m - 0.04) / 0.28));
      const targetTalk = mr * mr * (3 - 2 * mr);
      if (Math.abs(t - prevT) > 0.25) {
        this._talkEnergy = targetTalk;
      } else {
        this._talkEnergy += (targetTalk - this._talkEnergy) * (1 - Math.exp(-safeDt * 4.5));
      }
      const talk = this._talkEnergy;

      // Emergencia da lampada com escala organica da coluna de fumaca
      const em = Math.max(0.01, Math.min(1.0, this.emerge));
      this.bodyPivot.scale.set(0.25 + em * 0.75, em, 0.25 + em * 0.75);
      for (let i = 0; i < this.smokeRings.length; i++) {
        const ring = this.smokeRings[i];
        ring.position.x = Math.sin(t * 3.1 + i * 0.9) * 0.025 * (1 - i / 6);
        ring.position.z = Math.cos(t * 2.6 + i * 0.8) * 0.022 * (1 - i / 6);
      }

      // Respiracao e inclinacao cômica fluida
      this.pelvis.position.y = 0.58 + Math.sin(t * 2.2) * 0.022;
      this.spine.rotation.set(Math.sin(t * 1.9) * 0.03, Math.sin(t * 1.1) * 0.06, Math.sin(t * 1.5) * 0.03);
      this.neck.rotation.set((this.lookPitch || 0) + Math.sin(t * 4.2) * 0.03 * talk, (this.lookYaw || 0) + Math.sin(t * 2.3) * 0.04, 0);

      // Poses de braco assimetricas interpoladas suavemente (zero tranco!)
      let tSLx, tSLy, tSLz, tELx, tELy;
      let tSRx, tSRy, tSRz, tERx, tERy;
      if (this.pose === 'snap') {
        const snapBob = Math.sin(t * 5.0) * 0.08;
        tSLx = -0.35 + snapBob; tSLy = -0.18; tSLz = 0.28; tELx = -0.85; tELy = 0.25;
        tSRx = -1.35 + snapBob * 0.8; tSRy = 0.15; tSRz = -0.25; tERx = -1.15 - talk * 0.12; tERy = -0.2;
      } else if (this.pose === 'shrug') {
        tSLx = -0.62 + talk * 0.10; tSLy = -0.30; tSLz = 0.52; tELx = -1.15; tELy = -0.25;
        tSRx = -0.62 + talk * 0.10; tSRy = 0.30; tSRz = -0.52; tERx = -1.15; tERy = 0.25;
      } else {
        const wL = Math.sin(t * 2.8) * (0.08 + talk * 0.15);
        const wR = Math.sin(t * 2.4 + 1.2) * (0.08 + talk * 0.14);
        tSLx = -0.28 + wL; tSLy = -0.10; tSLz = 0.32; tELx = -0.78 - wL * 0.6; tELy = 0.18;
        tSRx = -0.36 + wR; tSRy = 0.12; tSRz = -0.34; tERx = -0.82 - wR * 0.6; tERy = -0.18;
      }

      const jAlpha = (!this._j || Math.abs(t - prevT) > 0.25) ? 1.0 : (1 - Math.exp(-safeDt * 4.2));
      if (!this._j) {
        this._j = { sLx: tSLx, sLy: tSLy, sLz: tSLz, eLx: tELx, eLy: tELy, sRx: tSRx, sRy: tSRy, sRz: tSRz, eRx: tERx, eRy: tERy };
      } else {
        const mix = (k, target) => { this._j[k] += (target - this._j[k]) * jAlpha; };
        mix('sLx', tSLx); mix('sLy', tSLy); mix('sLz', tSLz); mix('eLx', tELx); mix('eLy', tELy);
        mix('sRx', tSRx); mix('sRy', tSRy); mix('sRz', tSRz); mix('eRx', tERx); mix('eRy', tERy);
      }

      this.shoulderL.root.rotation.set(this._j.sLx, this._j.sLy, this._j.sLz);
      this.shoulderL.elbow.rotation.set(this._j.eLx, this._j.eLy, 0);
      this.shoulderR.root.rotation.set(this._j.sRx, this._j.sRy, this._j.sRz);
      this.shoulderR.elbow.rotation.set(this._j.eRx, this._j.eRy, 0);
    }
  }

  global.Genio3D = Genio3D;
})(typeof window !== 'undefined' ? window : this);
