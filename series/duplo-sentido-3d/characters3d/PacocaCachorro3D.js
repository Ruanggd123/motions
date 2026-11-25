/**
 * PacocaCachorro3D.js — Rig Canino 3D Articulado de Alta Fidelidade (Padrão 1:1 com o 2D)
 * Personagem 03: PAÇOCA (Vira-Lata Caramelo Resgatado)
 * Série: Condomínio Solaris: Bloco C
 * Motor: Three.js WebGL Real 3D
 *
 * Características de Elite:
 * - Proporções 1:1 fiéis ao 2D: Corpo gordinho em formato de feijão caramelo (#d97706), patinhas curtas e fofas, coleira vermelha com medalha dourada (#fbbf24).
 * - Alta contagem de polígonos: Geometrias de 36 segmentos radiais com curvatura orgânica suave.
 * - Focinho Canino 3D: Trufa preta brilhante com duplo reflexo especular e focinho escuro integrado (#92400e).
 * - Orelhas Caídas Fofas: Silhueta em gota flexível que acompanha a cabeça.
 * - Máscara facial curva com olhos anime gigantes e expressivos (duplo brilho cartoon), boca articulada com língua rosada e dentes caninos.
 * - Rabinho curvado articulado com animação de abano vigoroso (wagging).
 */
(function (global) {
  'use strict';

  class PacocaCachorro3D {
    constructor(options = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js não carregado para PacocaCachorro3D');

      this.id = 'PACOCA';
      this.name = 'Paçoca (Cão Caramelo)';
      this.group = new T.Group();
      this.group.name = 'PacocaCachorro3D';

      this.time = 0;
      this.walkCycle = 0;
      this.isWalking = options.isWalking || false;
      this.isRunning = options.isRunning || false;
      this.walkSpeed = options.walkSpeed !== undefined ? options.walkSpeed : 1.2;
      this.walkDir = options.walkDir || 1;
      this.mouthOpen = 0;
      this.isBarking = false;
      this.emotion = options.emotion || 'alert';
      this.pose = options.pose || 'idle';
      this.state = options.state || 'idle';
      this.lookYaw = 0;
      this.lookPitch = 0;
      this._lastMouth = -1;
      this._lastBarking = null;
      this._lastEmotion = null;
      this._lastPose = null;

      this._buildMaterials(T);
      this._buildRig(T);
      if (this.bodyGroup) this.bodyGroup.rotation.order = 'YXZ';
      if (this.headGroup) this.headGroup.rotation.order = 'YXZ';

      if (options.position) {
        this.group.position.set(options.position.x || 0, options.position.y || 0, options.position.z || 0);
      }
      if (options.scale) {
        const s = options.scale;
        this.group.scale.set(s, s, s);
      }

      this._updateFace();
      this._applyPose(this.pose, true);
    }

    _buildMaterials(T) {
      this.mats = {
        // Pelagem caramelo brasileira quente e rica (#d97706 fiel ao 2D)
        furCaramel: new T.MeshStandardMaterial({
          color: 0xd97706,
          roughness: 0.60,
          metalness: 0.02
        }),
        furLight: new T.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.65
        }),
        furEar: new T.MeshStandardMaterial({
          color: 0x92400e,
          roughness: 0.65
        }),
        snoutBlack: new T.MeshStandardMaterial({
          color: 0x18181b,
          roughness: 0.25,
          metalness: 0.40
        }),
        collarRed: new T.MeshStandardMaterial({
          color: 0xdc2626,
          roughness: 0.40
        }),
        medalGold: new T.MeshStandardMaterial({
          color: 0xfbbf24,
          roughness: 0.20,
          metalness: 0.90
        }),
        mouthDark: new T.MeshStandardMaterial({
          color: 0x220404,
          roughness: 0.85
        }),
        tonguePink: new T.MeshStandardMaterial({
          color: 0xf43f5e,
          roughness: 0.45
        }),
        toothWhite: new T.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.25
        })
      };
    }

    _buildRig(T) {
      this.bodyGroup = new T.Group();
      this.bodyGroup.position.set(0, 0.22, 0);
      this.group.add(this.bodyGroup);

      // ─── 1. CORPO EM FEIJÃO GORDINHO FOFO (40x28 segmentos) ───
      const torso = new T.Mesh(new T.SphereGeometry(0.160, 40, 28), this.mats.furCaramel);
      torso.scale.set(1.06, 0.96, 1.40);
      torso.castShadow = true;
      this.bodyGroup.add(torso);

      // Peito sutil e barriga dourada
      const chest = new T.Mesh(new T.SphereGeometry(0.130, 32, 24), this.mats.furLight);
      chest.position.set(0, -0.03, 0.08);
      chest.scale.set(0.92, 0.88, 1.10);
      this.bodyGroup.add(chest);

      // Coleira vermelha e medalha dourada
      const collar = new T.Mesh(new T.TorusGeometry(0.120, 0.016, 16, 36), this.mats.collarRed);
      collar.position.set(0, 0.05, 0.15);
      collar.rotation.x = Math.PI / 3;
      this.bodyGroup.add(collar);

      const medal = new T.Mesh(new T.CylinderGeometry(0.024, 0.024, 0.008, 24), this.mats.medalGold);
      medal.rotation.x = Math.PI / 2;
      medal.position.set(0, -0.045, 0.228);
      this.bodyGroup.add(medal);

      // ─── 2. CABEÇA ARREDONDADA FOFA COM ORELHAS CAÍDAS ───
      this.headGroup = new T.Group();
      this.headGroup.position.set(0, 0.14, 0.18);
      this.bodyGroup.add(this.headGroup);

      const skull = new T.Mesh(new T.SphereGeometry(0.142, 40, 30), this.mats.furCaramel);
      skull.scale.set(0.96, 1.02, 1.0);
      skull.castShadow = true;
      this.headGroup.add(skull);

      // Focinho 3D superior + mandíbula articulada para latido visível
      const snoutGroup = new T.Group();
      snoutGroup.position.set(0, -0.035, 0.115);
      this.headGroup.add(snoutGroup);

      const snoutMesh = new T.Mesh(new T.SphereGeometry(0.065, 24, 18), this.mats.furEar);
      snoutMesh.scale.set(1.02, 0.68, 1.05);
      snoutMesh.position.set(0, 0.010, 0);
      snoutGroup.add(snoutMesh);

      // Trufa preta brilhante (nariz)
      const nose = new T.Mesh(new T.SphereGeometry(0.024, 18, 14), this.mats.snoutBlack);
      nose.scale.set(1.15, 0.85, 1.0);
      nose.position.set(0, 0.032, 0.065);
      snoutGroup.add(nose);

      // Caninos superiores fofos
      [-0.022, 0.022].forEach((fx) => {
        const fangUp = new T.Mesh(new T.ConeGeometry(0.0055, 0.015, 10), this.mats.toothWhite);
        fangUp.rotation.x = Math.PI;
        fangUp.position.set(fx, -0.016, 0.048);
        snoutGroup.add(fangUp);
      });

      // Mandíbula inferior articulada + interior escuro + língua 3D
      this.jawGroup = new T.Group();
      this.jawGroup.position.set(0, -0.052, 0.088);
      this.headGroup.add(this.jawGroup);

      const lowerChin = new T.Mesh(new T.SphereGeometry(0.048, 20, 14), this.mats.furEar);
      lowerChin.scale.set(0.95, 0.45, 1.08);
      lowerChin.position.set(0, -0.016, 0.035);
      this.jawGroup.add(lowerChin);

      const mouthFloor = new T.Mesh(new T.BoxGeometry(0.056, 0.014, 0.056), this.mats.mouthDark);
      mouthFloor.position.set(0, 0.0, 0.032);
      this.jawGroup.add(mouthFloor);

      [-0.018, 0.018].forEach((fx) => {
        const fangLow = new T.Mesh(new T.ConeGeometry(0.005, 0.014, 10), this.mats.toothWhite);
        fangLow.position.set(fx, 0.010, 0.055);
        this.jawGroup.add(fangLow);
      });

      this.tongueMesh = new T.Mesh(new T.SphereGeometry(0.022, 16, 12), this.mats.tonguePink);
      this.tongueMesh.scale.set(0.75, 0.28, 1.45);
      this.tongueMesh.position.set(0, 0.006, 0.050);
      this.tongueMesh.visible = false;
      this.jawGroup.add(this.tongueMesh);

      // Orelhas caídas volumosas características do Paçoca 2D
      this.earL = this._createEar(T, -0.135, false);
      this.earR = this._createEar(T, 0.135, true);
      this.headGroup.add(this.earL);
      this.headGroup.add(this.earR);

      // ─── 3. MÁSCARA FACIAL COM OLHOS ANIME GRANDES (CanvasTexture 512x512) ───
      this.faceCanvas = document.createElement('canvas');
      this.faceCanvas.width = 512;
      this.faceCanvas.height = 512;
      this.faceCtx = this.faceCanvas.getContext('2d');
      this.faceTexture = new T.CanvasTexture(this.faceCanvas);
      this.faceTexture.colorSpace = T.SRGBColorSpace || T.LinearColorSpace;

      const faceGeo = global.CharacterFaceTextures && global.CharacterFaceTextures.createCurvedFaceGeometry
        ? global.CharacterFaceTextures.createCurvedFaceGeometry(T, {
            radiusTop: 0.144,
            radiusBottom: 0.132,
            height: 0.21,
            phiSpan: 1.40,
            segsX: 36,
            segsY: 20,
            zOffset: 0.005
          })
        : new T.CylinderGeometry(0.142, 0.130, 0.21, 36, 1, true, -Math.PI * 0.40, Math.PI * 0.80);

      this.faceMat = new T.MeshStandardMaterial({
        map: this.faceTexture,
        transparent: true,
        roughness: 0.65,
        metalness: 0.0,
        depthWrite: false,
        side: T.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      });
      this.faceMesh = new T.Mesh(faceGeo, this.faceMat);
      this.faceMesh.position.set(0, 0.005, 0.008);
      this.headGroup.add(this.faceMesh);

      this._updateFace();

      // ─── 4. RABINHO CURVADO ABANADOR ───
      this.tail = new T.Group();
      this.tail.position.set(0, 0.06, -0.19);
      this.bodyGroup.add(this.tail);

      const tailMesh = new T.Mesh(new T.CylinderGeometry(0.016, 0.026, 0.20, 24), this.mats.furCaramel);
      tailMesh.rotation.x = -Math.PI / 4;
      tailMesh.position.set(0, 0.06, -0.05);
      this.tail.add(tailMesh);

      const tailTip = new T.Mesh(new T.SphereGeometry(0.020, 16, 12), this.mats.furEar);
      tailTip.position.set(0, 0.13, -0.12);
      this.tail.add(tailTip);

      // ─── 5. 4 PATINHAS CURTAS E FOFAS COM DEDOS (Proporção 1:1 com o 2D) ───
      this.legFL = this._createLeg(T, -0.082, 0.11);
      this.legFR = this._createLeg(T, 0.082, 0.11);
      this.legBL = this._createLeg(T, -0.086, -0.11);
      this.legBR = this._createLeg(T, 0.086, -0.11);

      this.bodyGroup.add(this.legFL.root);
      this.bodyGroup.add(this.legFR.root);
      this.bodyGroup.add(this.legBL.root);
      this.bodyGroup.add(this.legBR.root);
    }

    _createEar(T, xPos, isRight) {
      const earGroup = new T.Group();
      earGroup.position.set(xPos, 0.09, -0.01);
      earGroup.rotation.z = isRight ? 0.28 : -0.28;
      earGroup.rotation.x = 0.15;

      const earMesh = new T.Mesh(new T.SphereGeometry(0.055, 24, 20), this.mats.furEar);
      earMesh.scale.set(0.36, 1.45, 0.85);
      earMesh.position.set(0, -0.065, 0);
      earGroup.add(earMesh);

      return earGroup;
    }

    _createLeg(T, xPos, zPos) {
      const root = new T.Group();
      root.position.set(xPos, -0.06, zPos);

      // Perna curta e arredondada
      const upperMesh = new T.Mesh(new T.CylinderGeometry(0.038, 0.030, 0.08, 24), this.mats.furCaramel);
      upperMesh.position.set(0, -0.04, 0);
      root.add(upperMesh);

      const knee = new T.Group();
      knee.position.set(0, -0.08, 0);
      root.add(knee);

      const lowerMesh = new T.Mesh(new T.CylinderGeometry(0.030, 0.026, 0.06, 24), this.mats.furCaramel);
      lowerMesh.position.set(0, -0.03, 0);
      knee.add(lowerMesh);

      // Patinha fofa com dedinhos
      const paw = new T.Mesh(new T.SphereGeometry(0.032, 20, 16), this.mats.furCaramel);
      paw.scale.set(0.95, 0.70, 1.25);
      paw.position.set(0, -0.06, 0.015);
      knee.add(paw);

      return { root, knee, paw };
    }

    _updateFace(renderMouth) {
      if (!this.faceCtx || !global.CharacterFaceTextures) return;
      const mVal = renderMouth !== undefined ? renderMouth : this.mouthOpen;
      this._lastMouth = mVal;
      this._lastBarking = Boolean(this.isBarking);
      this._lastEmotion = this.emotion;
      global.CharacterFaceTextures.drawPacocaFace(this.faceCtx, {
        mouthOpen: mVal,
        isBarking: this.isBarking || mVal > 0.25,
        emotion: this.emotion,
        time: this.time
      });
      if (this.faceTexture) this.faceTexture.needsUpdate = true;
    }

    setEmotion(e) {
      if (this.emotion === e && this._lastEmotion === e) return;
      this.emotion = e;
      this._updateFace();
    }

    setMouthOpen(val) {
      const clamped = Math.max(0, Math.min(1, val));
      const crossed = (clamped > 0.08) !== (this._lastMouth > 0.08);
      this.mouthOpen = clamped;
      if (crossed || Math.abs(clamped - this._lastMouth) > 0.04) {
        this._updateFace(clamped);
      }
    }

    setBarking(b) {
      this.isBarking = !!b;
      this.setMouthOpen(this.isBarking ? 0.75 : 0);
    }

    setLook(yaw = 0, pitch = 0) {
      this.lookYaw = Math.max(-0.85, Math.min(0.85, yaw));
      this.lookPitch = Math.max(-0.55, Math.min(0.55, pitch));
    }

    setPose(poseName, force = false) {
      const target = poseName || 'idle';
      if (!force && this.pose === target && this._lastPose === target) return;
      this._applyPose(target, force);
    }

    _applyPose(poseName, force = false) {
      const target = poseName || 'idle';
      if (!force && this.pose === target && this._lastPose === target) return;
      this.pose = target;
      this._lastPose = target;
    }

    walk(speed = 1.2, dir = 1) {
      this.isWalking = true;
      this.isRunning = false;
      this.walkSpeed = Math.abs(speed);
      this.walkDir = dir >= 0 ? 1 : -1;
    }

    run(speed = 1.9, dir = 1) {
      this.isRunning = true;
      this.isWalking = true;
      this.walkSpeed = Math.max(1.4, Math.abs(speed));
      this.walkDir = dir >= 0 ? 1 : -1;
    }

    stop() {
      this.isWalking = false;
      this.isRunning = false;
      this.walkCycle = 0;
      [this.legFL, this.legFR, this.legBL, this.legBR].forEach((leg) => {
        leg.root.rotation.set(0, 0, 0);
        leg.knee.rotation.set(0, 0, 0);
      });
    }

    update(dt, timeOrCam) {
      const safeDt = Math.max(0.0001, Math.min(0.25, dt || 1 / 30));
      const hasAbsTime = typeof timeOrCam === 'number' && Number.isFinite(timeOrCam);
      this.time = hasAbsTime ? timeOrCam : (this.time + safeDt);

      if (this.pose !== this._lastPose) {
        this._applyPose(this.pose, true);
      }

      // Lip-sync e latido em tempo real (detecta .mouthOpen direto ou .isBarking)
      const rawMouth = Math.max(0, Math.min(1, Number(this.mouthOpen) || 0));
      const barkWave = this.isBarking ? Math.max(0.18, Math.pow(Math.abs(Math.sin(this.time * 13.5)), 0.7) * 0.92) : 0;
      const effectiveMouth = rawMouth > 0.04 ? rawMouth : barkWave;
      const mouthCrossed = (effectiveMouth > 0.08) !== (this._lastMouth > 0.08);
      if (
        mouthCrossed ||
        Math.abs(effectiveMouth - this._lastMouth) > 0.04 ||
        Boolean(this.isBarking) !== this._lastBarking ||
        this.emotion !== this._lastEmotion
      ) {
        this._updateFace(effectiveMouth);
      }

      // Mandíbula 3D articulada + língua visível no latido/ofegante
      if (this.jawGroup) {
        this.jawGroup.rotation.x = 0.02 + effectiveMouth * 0.64;
      }
      if (this.tongueMesh) {
        this.tongueMesh.visible = effectiveMouth > 0.10;
        if (this.tongueMesh.visible) {
          this.tongueMesh.position.z = 0.048 + effectiveMouth * 0.020;
          this.tongueMesh.rotation.x = 0.10 + effectiveMouth * 0.24 + Math.sin(this.time * 18) * 0.05;
        }
      }

      const curState = (this.state && this.state !== 'idle') ? this.state : (this.pose || 'idle');
      const isHeld = curState === 'held' || curState === 'seated_hold_dog';
      const isCowering = curState === 'cowering';
      const isBark = Boolean(this.isBarking) || effectiveMouth > 0.15;
      const isTense = isCowering || isBark || this.emotion === 'alert' || this.emotion === 'scared' || this.emotion === 'terrified';

      // Rabinho abanando continuamente conforme estado/tensão
      if (isCowering && !isBark) {
        this.tail.rotation.x = -0.45;
        this.tail.rotation.y = Math.sin(this.time * 18) * 0.18;
        this.tail.rotation.z = Math.sin(this.time * 9) * 0.08;
      } else {
        const wagSpeed = isBark ? 20 : (this.isRunning ? 18 : (this.isWalking ? 14 : (isTense ? 11 : 7.5)));
        const wagAmp = isBark ? 0.62 : (isHeld ? 0.54 : 0.45);
        this.tail.rotation.x = isBark ? 0.18 : 0;
        this.tail.rotation.y = Math.sin(this.time * wagSpeed) * wagAmp;
        this.tail.rotation.z = Math.cos(this.time * wagSpeed * 0.5) * 0.16;
      }

      // Orelhas: arrebitam ao latir/ficar alerta, caem suavemente no idle
      if (isBark || this.emotion === 'alert') {
        const earTwitch = Math.sin(this.time * 14) * (isBark ? 0.08 : 0.03);
        this.earL.rotation.z = -0.14 + earTwitch;
        this.earR.rotation.z = 0.14 - earTwitch;
        this.earL.rotation.x = -0.18;
        this.earR.rotation.x = -0.18;
      } else if (isCowering) {
        this.earL.rotation.z = -0.42;
        this.earR.rotation.z = 0.42;
        this.earL.rotation.x = 0.30;
        this.earR.rotation.x = 0.30;
      } else {
        this.earL.rotation.z = -0.28 + Math.sin(this.time * 3.5) * 0.06;
        this.earR.rotation.z = 0.28 - Math.sin(this.time * 3.5) * 0.06;
        this.earL.rotation.x = 0.15;
        this.earR.rotation.x = 0.15;
      }

      // Cabeça e olhar expressivo + latido enérgico
      const gazeYaw = this.lookYaw + Math.sin(this.time * 1.3) * 0.08;
      const gazePitch = this.lookPitch + Math.sin(this.time * 1.9) * 0.04;
      if (isBark) {
        this.headGroup.rotation.set(
          gazePitch - 0.14 - effectiveMouth * 0.18 + Math.sin(this.time * 13.5) * 0.08,
          gazeYaw + Math.sin(this.time * 6.5) * 0.14,
          Math.sin(this.time * 9.0) * 0.08
        );
      } else if (isCowering) {
        this.headGroup.rotation.set(0.18 + gazePitch, gazeYaw + Math.sin(this.time * 5.0) * 0.10, Math.sin(this.time * 18) * 0.025);
      } else {
        this.headGroup.rotation.set(gazePitch, gazeYaw, Math.sin(this.time * 2.1) * 0.04);
      }

      // Movimentação de corpo e 4 patas
      if (isHeld) {
        const fidget = Math.sin(this.time * (isBark ? 13 : 6.5));
        this.bodyGroup.position.y = 0.22 + Math.sin(this.time * 3.8) * 0.008;
        this.bodyGroup.rotation.set(0.12 - effectiveMouth * 0.10, 0, Math.sin(this.time * 3.0) * 0.04);

        this.legFL.root.rotation.set(-0.35 + fidget * 0.22, 0, -0.08);
        this.legFR.root.rotation.set(-0.35 - fidget * 0.22, 0, 0.08);
        this.legFL.knee.rotation.set(0.45 + Math.abs(fidget) * 0.20, 0, 0);
        this.legFR.knee.rotation.set(0.45 + Math.abs(fidget) * 0.20, 0, 0);

        this.legBL.root.rotation.set(0.32 + Math.sin(this.time * 5.2) * 0.10, 0, -0.06);
        this.legBR.root.rotation.set(0.32 - Math.sin(this.time * 5.2) * 0.10, 0, 0.06);
        this.legBL.knee.rotation.set(0.35, 0, 0);
        this.legBR.knee.rotation.set(0.35, 0, 0);
        return;
      }

      if (isCowering) {
        const shiver = Math.sin(this.time * 22) * 0.022;
        this.bodyGroup.position.y = 0.175 + Math.abs(Math.sin(this.time * 12)) * 0.004;
        this.bodyGroup.rotation.set(0.08, 0, shiver);

        this.legFL.root.rotation.set(-0.32, 0, -0.14);
        this.legFR.root.rotation.set(-0.32, 0, 0.14);
        this.legBL.root.rotation.set(0.28, 0, -0.14);
        this.legBR.root.rotation.set(0.28, 0, 0.14);
        this.legFL.knee.rotation.set(0.55, 0, 0);
        this.legFR.knee.rotation.set(0.55, 0, 0);
        this.legBL.knee.rotation.set(0.50, 0, 0);
        this.legBR.knee.rotation.set(0.50, 0, 0);
        return;
      }

      const running = Boolean(this.isRunning) || curState === 'run';
      const moving = Boolean(this.isWalking) || running || curState === 'walk';

      if (moving) {
        const rate = running ? (Math.max(1.4, this.walkSpeed) * 10.5) : (this.walkSpeed * 7.5);
        this.walkCycle = hasAbsTime ? (this.time * rate) : (this.walkCycle + safeDt * rate);
        const phi = this.walkCycle;

        if (running) {
          // Galope canino animado
          const frontA = Math.sin(phi) * 0.72;
          const frontB = Math.sin(phi + 0.45) * 0.72;
          const backA = Math.sin(phi + Math.PI * 0.85) * 0.68;
          const backB = Math.sin(phi + Math.PI * 0.85 + 0.40) * 0.68;

          this.legFL.root.rotation.set(frontA, 0, 0);
          this.legFR.root.rotation.set(frontB, 0, 0);
          this.legBL.root.rotation.set(backA, 0, 0);
          this.legBR.root.rotation.set(backB, 0, 0);

          this.legFL.knee.rotation.set(Math.max(0, -Math.cos(phi)) * 0.75, 0, 0);
          this.legFR.knee.rotation.set(Math.max(0, -Math.cos(phi + 0.45)) * 0.75, 0, 0);
          this.legBL.knee.rotation.set(Math.max(0, -Math.cos(phi + Math.PI * 0.85)) * 0.70, 0, 0);
          this.legBR.knee.rotation.set(Math.max(0, -Math.cos(phi + Math.PI * 0.85 + 0.40)) * 0.70, 0, 0);

          this.bodyGroup.position.y = 0.22 + Math.abs(Math.sin(phi)) * 0.045;
          this.bodyGroup.rotation.set(Math.cos(phi) * 0.12 - effectiveMouth * 0.08, 0, Math.sin(phi) * 0.04);
        } else {
          // Trote diagonal canino com flexão de joelhos
          const dA = Math.sin(phi);
          const dB = Math.sin(phi + Math.PI);
          this.legFL.root.rotation.set(dA * 0.56, 0, 0);
          this.legBR.root.rotation.set(dA * 0.52, 0, 0);
          this.legFR.root.rotation.set(dB * 0.56, 0, 0);
          this.legBL.root.rotation.set(dB * 0.52, 0, 0);

          const kA = Math.max(0, -Math.cos(phi)) * 0.55;
          const kB = Math.max(0, -Math.cos(phi + Math.PI)) * 0.55;
          this.legFL.knee.rotation.set(kA, 0, 0);
          this.legBR.knee.rotation.set(kA, 0, 0);
          this.legFR.knee.rotation.set(kB, 0, 0);
          this.legBL.knee.rotation.set(kB, 0, 0);

          this.bodyGroup.position.y = 0.22 + Math.abs(Math.sin(phi * 2)) * 0.024;
          this.bodyGroup.rotation.set(-effectiveMouth * 0.06, Math.sin(phi) * 0.04, Math.sin(phi) * 0.03);
        }
        if (!isBark) this.headGroup.rotation.x += Math.sin(phi * 2) * 0.06;
        return;
      }

      // Idle vivo: respiração, leve postura de alerta/latido e patinhas nunca rígidas
      const breath = Math.sin(this.time * (isBark ? 6.0 : 3.0)) * 0.009;
      const bounce = isBark ? Math.abs(Math.sin(this.time * 13.5)) * 0.016 : 0;
      const weight = Math.sin(this.time * 1.4);
      this.bodyGroup.position.y = 0.22 + breath + bounce;
      this.bodyGroup.rotation.set(
        isBark ? (-0.08 - effectiveMouth * 0.10) : 0,
        weight * 0.025,
        weight * 0.02
      );

      const tap = isBark ? Math.abs(Math.sin(this.time * 6.8)) * 0.18 : 0;
      this.legFL.root.rotation.set(-0.04 - tap, 0, 0);
      this.legFR.root.rotation.set(0.04, 0, 0);
      this.legBL.root.rotation.set(0.04, 0, 0);
      this.legBR.root.rotation.set(-0.04, 0, 0);
      this.legFL.knee.rotation.set(0.06 + tap * 1.3, 0, 0);
      this.legFR.knee.rotation.set(0.05, 0, 0);
      this.legBL.knee.rotation.set(0.05, 0, 0);
      this.legBR.knee.rotation.set(0.05, 0, 0);
    }
  }

  global.PacocaCachorro3D = PacocaCachorro3D;
})(typeof window !== 'undefined' ? window : this);
