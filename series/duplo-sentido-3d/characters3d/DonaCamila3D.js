/**
 * DonaCamila3D.js — Rig Humanoide 3D Articulado de Alta Fidelidade (100% Fiel ao Modelo 2D)
 * Personagem: CAMILA (Vizinha do Apt 204 — 25 anos)
 * Série: Condomínio Solaris: Bloco C
 * Motor: Three.js WebGL Real 3D
 *
 * Características Estéticas & Anatômicas Oficiais (Fidelidade Absoluta ao Rig 2D CamilaEPacoca.js):
 * 1. Visual 25 anos jovem, moderno e atlético brasileiro:
 *    - Cabelo Afro-Puff volumoso no topo com elástico dourado (#eab308) e mechas encaracoladas nas têmporas.
 *    - Brincos de argola dourada elegantes (#fbbf24) em ambas as orelhas.
 *    - Rosto esculpido sem rugas, maquiagem jovem com delineador gatinho e rubor bronze suave.
 * 2. Figurino Esportivo Fiel ao 2D:
 *    - Jaqueta corta-vento mostarda (#f59e0b / #ca8a04) com gola esportiva alta, zíper frontal e faixa escura no peito (#1e293b).
 *    - Calça legging esportiva grafite justa (#1e293b) com faixa lateral amarela (#eab308).
 *    - Tênis esportivo moderno branco e coral (#f8fafc e #f43f5e) com solado de borracha.
 *    - Mãos anatômicas com 4 dedos articulados e polegar modelado.
 * 3. Otimização GPU/CPU Extrema:
 *    - Zero polígonos supérfluos (adeus avental e bobes de vovó).
 *    - Cache de textura facial: redesenha no canvas apenas em mudanças de expressão ou piscada.
 */
(function (global) {
  'use strict';

  class DonaCamila3D {
    constructor(options = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js não carregado para DonaCamila3D');

      this.id = 'CAMILA';
      this.name = 'Camila (Vizinha 204 — 25 anos)';
      this.group = new T.Group();
      this.group.name = 'DonaCamila3D';

      this.time = 0;
      this.walkCycle = 0;
      this.isWalking = options.isWalking || false;
      this.isRunning = options.isRunning || false;
      this.walkSpeed = options.walkSpeed !== undefined ? options.walkSpeed : 1.0;
      this.walkDir = options.walkDir || 1;
      this.mouthOpen = 0;
      this.emotion = options.emotion || 'alert'; // 'alert', 'worried', 'neutral', 'scared'
      this.pose = options.pose || 'idle';
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.isBlinking = false;
      this.blinkTimer = 2.4;
      this._lastMouth = -1;
      this._lastEmotion = null;
      this._lastBlink = null;
      this._lastPose = null;

      this._buildMaterials(T);
      this._buildRig(T);
      if (this.spine) this.spine.rotation.order = 'YXZ';
      if (this.neck) this.neck.rotation.order = 'YXZ';
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
        // Tom de pele jovem moreno quente (#b46d45 fiel ao 2D)
        skin: new T.MeshStandardMaterial({
          color: 0xb46d45,
          roughness: 0.60,
          metalness: 0.05
        }),
        // Jaqueta corta-vento mostarda (#f59e0b)
        jacketMustard: new T.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.52,
          metalness: 0.08
        }),
        // Jaqueta mostarda sombreada / detalhes (#ca8a04)
        jacketDark: new T.MeshStandardMaterial({
          color: 0xca8a04,
          roughness: 0.55,
          metalness: 0.08
        }),
        // Faixa esportiva grafite e punhos (#1e293b)
        stripeDark: new T.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.65,
          metalness: 0.12
        }),
        // Zíper e colarinho escuro (#0f172a)
        zipperDark: new T.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.40,
          metalness: 0.60
        }),
        // Legging esportiva grafite (#1e293b)
        leggingGraphite: new T.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.58,
          metalness: 0.05
        }),
        // Faixa amarela lateral na legging (#eab308)
        stripeYellow: new T.MeshStandardMaterial({
          color: 0xeab308,
          roughness: 0.45,
          metalness: 0.10
        }),
        // Cabelo Afro-Puff preto escuro com nuances (#181118)
        hairBlack: new T.MeshStandardMaterial({
          color: 0x181118,
          roughness: 0.88,
          metalness: 0.02
        }),
        // Elástico de cabelo amarelo ouro (#eab308)
        hairBandYellow: new T.MeshStandardMaterial({
          color: 0xeab308,
          roughness: 0.35,
          metalness: 0.45
        }),
        // Argolas de ouro elegantes (#fbbf24)
        goldHoops: new T.MeshStandardMaterial({
          color: 0xfbbf24,
          roughness: 0.20,
          metalness: 0.90
        }),
        // Tênis branco (#f8fafc)
        sneakerWhite: new T.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.40,
          metalness: 0.05
        }),
        // Detalhes coral no tênis (#f43f5e)
        sneakerCoral: new T.MeshStandardMaterial({
          color: 0xf43f5e,
          roughness: 0.45,
          metalness: 0.08
        }),
        // Solado do tênis
        sneakerSole: new T.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.80,
          metalness: 0.10
        })
      };
    }

    _buildRig(T) {
      // Pelve / Cintura esportiva da Camila
      this.pelvis = new T.Group();
      this.pelvis.position.set(0, 0.88, 0);
      this.group.add(this.pelvis);

      // ─── 1. QUADRIL & LEGGINGS GRAFITE ───
      const hipGeo = new T.CylinderGeometry(0.145, 0.158, 0.16, 32);
      const hipMesh = new T.Mesh(hipGeo, this.mats.leggingGraphite);
      hipMesh.position.set(0, -0.04, 0);
      hipMesh.scale.set(1.08, 1.0, 0.86);
      hipMesh.castShadow = true;
      this.pelvis.add(hipMesh);

      // Faixas laterais amarelas no quadril
      [-0.152, 0.152].forEach(fx => {
        const stripeH = new T.Mesh(new T.BoxGeometry(0.012, 0.15, 0.035), this.mats.stripeYellow);
        stripeH.position.set(fx, -0.04, 0);
        this.pelvis.add(stripeH);
      });

      // ─── 2. TRONCO / JAQUETA CORTA-VENTO MOSTARDA ───
      this.spine = new T.Group();
      this.spine.position.set(0, 0.04, 0);
      this.pelvis.add(this.spine);

      // Cintura / Abdômen da jaqueta corta-vento
      const waistJacket = new T.Mesh(new T.CylinderGeometry(0.150, 0.146, 0.15, 32), this.mats.jacketMustard);
      waistJacket.position.set(0, 0.075, 0);
      waistJacket.scale.set(1.06, 1.0, 0.84);
      waistJacket.castShadow = true;
      this.spine.add(waistJacket);

      // Busto / Peito atlético da jaqueta
      const chestJacket = new T.Mesh(new T.CylinderGeometry(0.168, 0.150, 0.22, 32), this.mats.jacketMustard);
      chestJacket.position.set(0, 0.24, 0);
      chestJacket.scale.set(1.08, 1.0, 0.82);
      chestJacket.castShadow = true;
      this.spine.add(chestJacket);

      // Faixa esportiva escura transversal no peito (#1e293b fiel ao 2D) curvada ao longo do tronco
      const chestStripeGeo = new T.CylinderGeometry(0.170, 0.152, 0.055, 32, 1, true, -Math.PI * 0.40, Math.PI * 0.80);
      const chestStripe = new T.Mesh(chestStripeGeo, this.mats.stripeDark);
      chestStripe.position.set(0, 0.24, 0);
      chestStripe.scale.set(1.082, 1.0, 0.822);
      this.spine.add(chestStripe);

      // Zíper frontal da jaqueta rente ao tecido
      const zipper = new T.Mesh(new T.BoxGeometry(0.014, 0.36, 0.006), this.mats.zipperDark);
      zipper.position.set(0, 0.18, 0.126);
      this.spine.add(zipper);

      // Gola esportiva alta da jaqueta corta-vento
      const collar = new T.Mesh(new T.CylinderGeometry(0.088, 0.098, 0.075, 28, 1, true), this.mats.jacketDark);
      collar.position.set(0, 0.36, 0.005);
      collar.scale.set(0.95, 1.0, 0.90);
      this.spine.add(collar);

      // ─── 3. PESCOÇO & CABEÇA JOVEM ESCULPIDA (25 ANOS) ───
      this.neck = new T.Group();
      this.neck.position.set(0, 0.38, 0);
      this.spine.add(this.neck);

      const neckMesh = new T.Mesh(new T.CylinderGeometry(0.050, 0.062, 0.10, 24), this.mats.skin);
      neckMesh.position.set(0, 0.042, 0.005);
      this.neck.add(neckMesh);

      this.headGroup = new T.Group();
      this.headGroup.position.set(0, 0.145, 0);
      this.neck.add(this.headGroup);

      // Crânio esculpido gracioso
      const skull = new T.Mesh(new T.SphereGeometry(0.142, 36, 28), this.mats.skin);
      skull.scale.set(0.92, 1.08, 0.95);
      skull.castShadow = true;
      this.headGroup.add(skull);

      // Queixo jovem e mandíbula fina arredondada
      const jaw = new T.Mesh(new T.CylinderGeometry(0.128, 0.058, 0.10, 28), this.mats.skin);
      jaw.position.set(0, -0.052, 0.022);
      jaw.scale.set(0.85, 1.0, 0.82);
      this.headGroup.add(jaw);

      // Orelhas & Brincos de Argola Dourada (#fbbf24)
      [-0.138, 0.138].forEach((ex, idx) => {
        const ear = new T.Mesh(new T.SphereGeometry(0.032, 18, 14), this.mats.skin);
        ear.position.set(ex, 0.010, -0.010);
        ear.scale.set(0.32, 1.08, 0.75);
        this.headGroup.add(ear);

        // Grande argola dourada esportiva (Hoop Earring)
        const hoop = new T.Mesh(new T.TorusGeometry(0.036, 0.0042, 14, 28), this.mats.goldHoops);
        hoop.position.set(ex + (idx === 0 ? -0.008 : 0.008), -0.028, -0.006);
        hoop.rotation.y = idx === 0 ? 0.35 : -0.35;
        this.headGroup.add(hoop);
      });

      // ─── 4. CABELO AFRO-PUFF VOLUMOSO COM ELÁSTICO DOURADO ───
      // Cabelo puxado na nuca e laterais posteriores (deixando a testa e o rosto 100% livres)
      const napeHairGeo = new T.CylinderGeometry(0.144, 0.126, 0.14, 32, 1, false, Math.PI * 0.28, Math.PI * 1.44);
      const napeHair = new T.Mesh(napeHairGeo, this.mats.hairBlack);
      napeHair.position.set(0, 0.010, -0.018);
      this.headGroup.add(napeHair);

      // Calota craniana superior envolvendo o topo da cabeça até a raiz da testa
      const hairCrownGeo = new T.SphereGeometry(0.146, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.45);
      const hairCrown = new T.Mesh(hairCrownGeo, this.mats.hairBlack);
      hairCrown.scale.set(0.94, 1.09, 0.97);
      hairCrown.position.set(0, 0.015, -0.015);
      hairCrown.rotation.x = -0.32;
      this.headGroup.add(hairCrown);

      // Baby hairs / mechas cacheadas nas têmporas
      [-0.125, 0.125].forEach((tx, idx) => {
        const lock = new T.Mesh(new T.TorusGeometry(0.022, 0.006, 12, 20, Math.PI * 1.3), this.mats.hairBlack);
        lock.position.set(tx, 0.02, 0.05);
        lock.rotation.set(0.2, idx === 0 ? 0.6 : -0.6, idx === 0 ? 0.4 : -0.4);
        this.headGroup.add(lock);
      });

      // Grupo articulado do coque Afro-Puff para bounce e follow-through secundário
      this.hairPuffGroup = new T.Group();
      this.hairPuffGroup.position.set(0, 0.155, -0.025);
      this.headGroup.add(this.hairPuffGroup);

      // Elástico de cabelo amarelo (#eab308) na base do coque (encaixado na coroa)
      const hairBand = new T.Mesh(new T.TorusGeometry(0.072, 0.014, 16, 32), this.mats.hairBandYellow);
      hairBand.position.set(0, 0, 0);
      hairBand.rotation.x = Math.PI * 0.45;
      this.hairPuffGroup.add(hairBand);

      // Coque Afro-Puff volumoso no topo (composto de esferas de cachos sem fresta)
      const puffCrown = new T.Mesh(new T.SphereGeometry(0.138, 28, 22), this.mats.hairBlack);
      puffCrown.position.set(0, 0.073, -0.005);
      puffCrown.scale.set(1.15, 1.10, 1.08);
      puffCrown.castShadow = true;
      this.hairPuffGroup.add(puffCrown);

      // Cachos externos volumosos do Afro-Puff (efeito texturizado orgânico)
      const curlOffsets = [
        [0.08, 0.26, -0.02], [-0.08, 0.26, -0.02],
        [0.00, 0.28, -0.08], [0.00, 0.27, 0.04],
        [0.10, 0.20, 0.02], [-0.10, 0.20, 0.02],
        [0.07, 0.20, -0.10], [-0.07, 0.20, -0.10]
      ];
      curlOffsets.forEach(co => {
        const curlBall = new T.Mesh(new T.SphereGeometry(0.055, 16, 12), this.mats.hairBlack);
        curlBall.position.set(co[0], co[1] - 0.155, co[2] + 0.025);
        this.hairPuffGroup.add(curlBall);
      });

      // ─── 5. TEXTURA FACIAL CURVA EM ALTA DEFINIÇÃO (512x512) ───
      this._buildFacePlane(T);

      // ─── 6. BRAÇOS COM MANGA DA CORTA-VENTO & MÃOS ARTICULADAS ───
      this.shoulderL = this._createArm(T, -0.185, false);
      this.shoulderR = this._createArm(T, 0.185, true);
      this.spine.add(this.shoulderL.root);
      this.spine.add(this.shoulderR.root);

      // ─── 7. PERNAS COM LEGGING GRAFITE + TÊNIS BRANCO E CORAL ───
      this.legL = this._createLeg(T, -0.085, false);
      this.legR = this._createLeg(T, 0.085, true);
      this.pelvis.add(this.legL.root);
      this.pelvis.add(this.legR.root);
    }

    _buildFacePlane(T) {
      this.faceCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
      if (this.faceCanvas) {
        this.faceCanvas.width = 512;
        this.faceCanvas.height = 512;
        this.faceCtx = this.faceCanvas.getContext('2d');
        this.faceTexture = new T.CanvasTexture(this.faceCanvas);
        this.faceTexture.generateMipmaps = false;
        this.faceTexture.minFilter = T.LinearFilter;

        this._updateFace();

        // Geometria facial curvada acompanhando a curvatura do crânio com precisão milimétrica
        const faceGeo = global.CharacterFaceTextures && global.CharacterFaceTextures.createCurvedFaceGeometry
          ? global.CharacterFaceTextures.createCurvedFaceGeometry(T, {
              radiusTop: 0.142,
              radiusBottom: 0.128,
              height: 0.20,
              phiSpan: 1.30,
              segsX: 32,
              segsY: 20,
              zOffset: 0.003
            })
          : new T.CylinderGeometry(0.142, 0.128, 0.20, 32, 1, true, -Math.PI * 0.35, Math.PI * 0.70);

        // Material Standard com iluminação real da cena (elimina efeito de adesivo brilhante flutuante)
        const faceMat = new T.MeshStandardMaterial({
          map: this.faceTexture,
          transparent: true,
          roughness: 0.60,
          metalness: 0.05,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1
        });

        const faceMesh = new T.Mesh(faceGeo, faceMat);
        faceMesh.position.set(0, 0.005, 0.002);
        this.headGroup.add(faceMesh);
      }
    }

    _updateFace() {
      if (!this.faceCtx) return;
      this._lastMouth = this.mouthOpen;
      this._lastEmotion = this.emotion;
      this._lastBlink = this.isBlinking;
      if (global.CharacterFaceTextures && typeof global.CharacterFaceTextures.drawCamilaFace === 'function') {
        global.CharacterFaceTextures.drawCamilaFace(this.faceCtx, {
          mouthOpen: this.mouthOpen,
          isBlinking: this.isBlinking,
          emotion: this.emotion
        });
      }
      if (this.faceTexture) this.faceTexture.needsUpdate = true;
    }

    _createArm(T, xPos, isRight) {
      const root = new T.Group();
      root.position.set(xPos, 0.31, 0);
      root.rotation.z = isRight ? -0.14 : 0.14;

      // Ombro esportivo arredondado da jaqueta mostarda
      const shoulder = new T.Mesh(new T.SphereGeometry(0.058, 20, 16), this.mats.jacketMustard);
      root.add(shoulder);

      // Braço superior
      const upperArm = new T.Group();
      root.add(upperArm);

      const upperMesh = new T.Mesh(new T.CylinderGeometry(0.048, 0.042, 0.16, 20), this.mats.jacketMustard);
      upperMesh.position.set(0, -0.08, 0);
      upperMesh.castShadow = true;
      upperArm.add(upperMesh);

      // Cotovelo
      const elbow = new T.Group();
      elbow.position.set(0, -0.16, 0);
      upperArm.add(elbow);

      // Antebraço da jaqueta
      const foreMesh = new T.Mesh(new T.CylinderGeometry(0.042, 0.036, 0.15, 20), this.mats.jacketDark);
      foreMesh.position.set(0, -0.075, 0);
      foreMesh.castShadow = true;
      elbow.add(foreMesh);

      // Punho elástico preto (#0f172a)
      const cuff = new T.Mesh(new T.CylinderGeometry(0.038, 0.036, 0.028, 20), this.mats.zipperDark);
      cuff.position.set(0, -0.145, 0);
      elbow.add(cuff);

      // Mão anatômica articulada
      const hand = new T.Group();
      hand.position.set(0, -0.165, 0);
      elbow.add(hand);

      const palm = new T.Mesh(new T.BoxGeometry(0.032, 0.038, 0.016), this.mats.skin);
      palm.position.set(0, -0.016, 0);
      hand.add(palm);

      // Polegar
      const thumb = new T.Mesh(new T.CylinderGeometry(0.0055, 0.0048, 0.022, 12), this.mats.skin);
      thumb.position.set(isRight ? -0.014 : 0.014, -0.008, 0.008);
      thumb.rotation.set(0.28, 0, isRight ? -0.50 : 0.50);
      hand.add(thumb);

      // 4 dedos esculpidos
      for (let f = 0; f < 4; f++) {
        const fx = (f - 1.5) * 0.007;
        const finger = new T.Mesh(new T.CylinderGeometry(0.0040, 0.0032, 0.026, 10), this.mats.skin);
        finger.position.set(fx, -0.045, 0.001);
        hand.add(finger);
      }

      return { root, upperArm, elbow, hand };
    }

    _createLeg(T, xPos, isRight) {
      const root = new T.Group();
      root.position.set(xPos, -0.08, 0);

      // Coxa esportiva na legging grafite
      const thighMesh = new T.Mesh(new T.CylinderGeometry(0.060, 0.046, 0.24, 24), this.mats.leggingGraphite);
      thighMesh.position.set(0, -0.12, 0);
      thighMesh.castShadow = true;
      root.add(thighMesh);

      // Faixa lateral amarela na coxa
      const thighStripe = new T.Mesh(new T.BoxGeometry(0.010, 0.23, 0.030), this.mats.stripeYellow);
      thighStripe.position.set(isRight ? 0.052 : -0.052, -0.12, 0);
      root.add(thighStripe);

      // Joelho
      const knee = new T.Group();
      knee.position.set(0, -0.24, 0);
      root.add(knee);

      const kneeCap = new T.Mesh(new T.SphereGeometry(0.045, 16, 14), this.mats.leggingGraphite);
      knee.add(kneeCap);

      // Canela na legging grafite
      const calfMesh = new T.Mesh(new T.CylinderGeometry(0.045, 0.032, 0.24, 24), this.mats.leggingGraphite);
      calfMesh.position.set(0, -0.12, 0);
      calfMesh.castShadow = true;
      knee.add(calfMesh);

      // Faixa lateral amarela na canela
      const calfStripe = new T.Mesh(new T.BoxGeometry(0.009, 0.23, 0.026), this.mats.stripeYellow);
      calfStripe.position.set(isRight ? 0.038 : -0.038, -0.12, 0);
      knee.add(calfStripe);

      // Tornozelo visível (pele)
      const ankle = new T.Mesh(new T.CylinderGeometry(0.031, 0.029, 0.04, 18), this.mats.skin);
      ankle.position.set(0, -0.24, 0);
      knee.add(ankle);

      // ─── TÊNIS ESPORTIVO MODERNO BRANCO E CORAL ───
      const foot = new T.Group();
      foot.position.set(0, -0.255, 0.02);
      knee.add(foot);

      // Corpo principal do tênis branco
      const sneakerBody = new T.Mesh(new T.BoxGeometry(0.072, 0.055, 0.165), this.mats.sneakerWhite);
      sneakerBody.position.set(0, 0, 0.03);
      sneakerBody.castShadow = true;
      foot.add(sneakerBody);

      // Bico arredondado do tênis
      const sneakerToe = new T.Mesh(new T.CylinderGeometry(0.036, 0.036, 0.052, 18), this.mats.sneakerWhite);
      sneakerToe.rotation.x = Math.PI * 0.5;
      sneakerToe.position.set(0, -0.002, 0.11);
      foot.add(sneakerToe);

      // Detalhes coral (#f43f5e) esportivos laterais
      const coralStripe = new T.Mesh(new T.BoxGeometry(0.075, 0.018, 0.08), this.mats.sneakerCoral);
      coralStripe.position.set(0, 0.006, 0.02);
      foot.add(coralStripe);

      // Solado de borracha aderente
      const sole = new T.Mesh(new T.BoxGeometry(0.076, 0.016, 0.18), this.mats.sneakerSole);
      sole.position.set(0, -0.028, 0.03);
      foot.add(sole);

      return { root, knee, foot };
    }

    _resetLimbs() {
      this.legL.root.rotation.set(0, 0, 0);
      this.legL.knee.rotation.set(0, 0, 0);
      if (this.legL.foot) this.legL.foot.rotation.set(0, 0, 0);
      this.legR.root.rotation.set(0, 0, 0);
      this.legR.knee.rotation.set(0, 0, 0);
      if (this.legR.foot) this.legR.foot.rotation.set(0, 0, 0);
      this.spine.rotation.set(0, 0, 0);
      this.neck.rotation.set(0, 0, 0);
    }

    _applyPose(pose, force = false) {
      const targetPose = pose || 'idle';
      if (!force && this.pose === targetPose && this._lastPose === targetPose) return;
      this.pose = targetPose;
      this._lastPose = targetPose;
      this._resetLimbs();
      this.pelvis.position.y = 0.88;

      if (targetPose === 'hold_leash') {
        // Segurando a guia retrátil do Paçoca com a mão esquerda
        this.shoulderL.root.rotation.set(-0.35, 0, 0.15);
        this.shoulderL.elbow.rotation.set(-0.65, 0, 0);
        this.shoulderR.root.rotation.set(0.10, 0, -0.15);
        this.shoulderR.elbow.rotation.set(-0.22, 0, 0);
      } else if (targetPose === 'scared' || targetPose === 'alert') {
        this.shoulderL.root.rotation.set(-0.45, 0, 0.32);
        this.shoulderL.elbow.rotation.set(-0.85, 0, 0);
        this.shoulderR.root.rotation.set(-0.45, 0, -0.32);
        this.shoulderR.elbow.rotation.set(-0.85, 0, 0);
      } else {
        // 'idle', 'walk', 'run'
        this.shoulderL.root.rotation.set(0.10, 0, 0.16);
        this.shoulderR.root.rotation.set(0.10, 0, -0.16);
        this.shoulderL.elbow.rotation.set(-0.24, 0, 0);
        this.shoulderR.elbow.rotation.set(-0.24, 0, 0);
      }
    }

    setEmotion(emotion) {
      if (this.emotion === emotion && this._lastEmotion === emotion) return;
      this.emotion = emotion;
      this._updateFace();
    }

    setMouthOpen(val) {
      const raw = Math.max(0, Math.min(1, Number(val) || 0));
      const clamped = raw <= 0.04 ? 0 : Math.round(raw * 30) / 30;
      const crossed = (clamped > 0.04) !== (this._lastMouth > 0.04);
      this.mouthOpen = clamped;
      if (crossed || Math.abs(clamped - this._lastMouth) > 0.035) {
        this._updateFace();
      }
    }

    setLook(yaw = 0, pitch = 0) {
      this.lookYaw = Math.max(-0.85, Math.min(0.85, yaw));
      this.lookPitch = Math.max(-0.55, Math.min(0.55, pitch));
    }

    setPose(pose, force = false) {
      if (!force && this.pose === pose && this._lastPose === pose) return;
      this._applyPose(pose, force);
    }

    walk(speed = 1.0, dir = 1) {
      this.isWalking = true;
      this.isRunning = false;
      this.walkSpeed = Math.abs(speed);
      this.walkDir = dir >= 0 ? 1 : -1;
      this.group.rotation.y = this.walkDir >= 0 ? 0 : Math.PI;
    }

    run(speed = 1.6, dir = 1) {
      this.isRunning = true;
      this.isWalking = true;
      this.walkSpeed = Math.max(1.2, Math.abs(speed));
      this.walkDir = dir >= 0 ? 1 : -1;
      this.group.rotation.y = this.walkDir >= 0 ? 0 : Math.PI;
    }

    stop() {
      this.isWalking = false;
      this.isRunning = false;
      this.walkCycle = 0;
      this._applyPose('idle', true);
    }

    update(dt, timeOrCam) {
      const safeDt = Math.max(0.0001, Math.min(0.25, dt || 1 / 30));
      const hasAbsTime = typeof timeOrCam === 'number' && Number.isFinite(timeOrCam);
      this.time = hasAbsTime ? timeOrCam : (this.time + safeDt);

      // Ciclo de piscar de olhos suave
      let shouldBlink = this.isBlinking;
      if (hasAbsTime) {
        const blinkPhase = this.time % 3.1;
        shouldBlink = blinkPhase > 2.97;
      } else {
        this.blinkTimer -= safeDt;
        if (this.blinkTimer <= 0) {
          shouldBlink = true;
          if (this.blinkTimer <= -0.12) {
            this.blinkTimer = 2.4 + Math.random() * 2.0;
            shouldBlink = false;
          }
        }
      }
      this.isBlinking = shouldBlink;

      if (this.pose !== this._lastPose) {
        this._applyPose(this.pose, true);
      }

      // Sincronização em tempo real para .mouthOpen e .emotion atribuídos diretamente
      const rawMouth = Math.max(0, Math.min(1, Number(this.mouthOpen) || 0));
      const clampedMouth = rawMouth <= 0.04 ? 0 : Math.round(rawMouth * 30) / 30;
      const mouthCrossed = (clampedMouth > 0.04) !== (this._lastMouth > 0.04);
      if (
        mouthCrossed ||
        Math.abs(clampedMouth - this._lastMouth) > 0.035 ||
        this.emotion !== this._lastEmotion ||
        shouldBlink !== this._lastBlink
      ) {
        this.mouthOpen = clampedMouth;
        this._updateFace();
      }

      const rawTalk = Math.max(0, Math.min(1, (clampedMouth - 0.04) / 0.34));
      const speechAmp = rawTalk * rawTalk * (3 - 2 * rawTalk);
      const speaking = speechAmp > 0.05;
      const speechNod = speaking ? Math.sin(this.time * 10.5) * 0.046 * speechAmp : 0;
      const speechSway = speaking ? Math.sin(this.time * 5.2 - 0.35) * 0.042 * speechAmp : 0;
      const gazeYaw = this.lookYaw + Math.sin(this.time * 0.9) * 0.055;
      const gazePitch = this.lookPitch + Math.sin(this.time * 1.35) * 0.028;

      const curPose = this.pose || 'idle';
      const curEmo = this.emotion || 'alert';
      const running = Boolean(this.isRunning) || curPose === 'run';
      const moving = Boolean(this.isWalking) || running || curPose === 'walk';

      // Ciclo de locomoção atlético
      if (moving) {
        const rate = running ? (Math.max(1.3, this.walkSpeed) * 7.8) : (this.walkSpeed * 5.2);
        this.walkCycle = hasAbsTime ? (this.time * rate) : (this.walkCycle + safeDt * rate);
        const phi = this.walkCycle;
        const stride = running ? 0.74 : 0.58;
        const kneePeak = running ? 1.12 : 0.88;

        this.pelvis.position.y = (running ? 0.85 : 0.88) + Math.abs(Math.sin(phi)) * (running ? 0.048 : 0.034);
        this.pelvis.rotation.set(0, Math.sin(phi) * 0.065, Math.cos(phi) * 0.020);
        this.spine.scale.set(1, 1, 1);
        this.spine.rotation.set(running ? 0.12 : 0.04, -Math.sin(phi) * 0.048 + speechSway * 0.3, Math.sin(phi) * 0.028);

        const lAngle = Math.sin(phi) * stride;
        const rAngle = Math.sin(phi + Math.PI) * stride;
        this.legL.root.rotation.x = lAngle;
        this.legR.root.rotation.x = rAngle;

        const lSwing = Math.max(0, -Math.cos(phi));
        const rSwing = Math.max(0, -Math.cos(phi + Math.PI));
        this.legL.knee.rotation.x = 0.06 + lSwing * kneePeak + (lAngle < 0 ? -lAngle * 0.22 : 0);
        this.legR.knee.rotation.x = 0.06 + rSwing * kneePeak + (rAngle < 0 ? -rAngle * 0.22 : 0);

        if (this.legL.foot) this.legL.foot.rotation.x = -0.25 * this.legL.knee.rotation.x + Math.sin(phi + 0.5) * 0.16;
        if (this.legR.foot) this.legR.foot.rotation.x = -0.25 * this.legR.knee.rotation.x + Math.sin(phi + Math.PI + 0.5) * 0.16;

        // Balanço dos braços preservando guia do Paçoca se 'hold_leash'
        if (curPose === 'hold_leash') {
          this.shoulderL.root.rotation.set(-0.35 + Math.sin(phi) * 0.06, 0, 0.15);
          this.shoulderL.elbow.rotation.set(-0.65, 0, 0);
        } else {
          this.shoulderL.root.rotation.x = -lAngle * 0.78;
          this.shoulderL.elbow.rotation.x = running ? -1.05 : (-0.30 - Math.max(0, -lAngle) * 0.22);
        }
        this.shoulderR.root.rotation.x = -rAngle * 0.78;
        this.shoulderR.elbow.rotation.x = running ? -1.05 : (-0.30 - Math.max(0, -rAngle) * 0.22);
        if (this.shoulderL.hand) this.shoulderL.hand.rotation.set(0, 0, 0);
        if (this.shoulderR.hand) this.shoulderR.hand.rotation.set(0, 0, 0);

        this.headGroup.rotation.set(
          gazePitch + speechNod - (running ? 0.06 : 0.01),
          gazeYaw + speechSway * 0.5,
          Math.sin(this.time * 5.0) * 0.025 * speechAmp
        );
        if (this.hairPuffGroup) {
          this.hairPuffGroup.rotation.set(-Math.sin(phi * 2 - 0.7) * 0.06, 0, Math.sin(phi - 0.7) * 0.05);
          this.hairPuffGroup.scale.set(1, 1 + Math.cos(phi * 2 - 0.7) * 0.04, 1);
        }
      } else {
        // Atuação fluida com overlap, follow-through e troca orgânica de peso
        const t = this.time;
        const breathe = Math.sin(t * 2.15) * 0.012;
        const w0 = Math.sin(t * 1.35);
        const w1 = Math.sin(t * 1.35 - 0.40);
        const w2 = Math.sin(t * 1.35 - 0.65);

        const lFlex = (0.5 + 0.5 * w0) * 0.08 + 0.035;
        const rFlex = (0.5 - 0.5 * w0) * 0.08 + 0.035;

        const isHappy = curEmo === 'happy';
        const isAngry = curEmo === 'angry';
        const isScared = curEmo === 'scared' || curPose === 'scared';

        const laugh = isHappy ? (0.5 - 0.5 * Math.cos(t * 7.8)) : 0;
        const hipLift = isHappy ? laugh * 0.022 : 0;

        this.pelvis.position.y = 0.88 - (lFlex + rFlex) * 0.052 + hipLift;
        this.pelvis.rotation.set(isHappy ? -laugh * 0.04 : 0, w0 * 0.045, w0 * 0.022);

        const leanX = isAngry ? 0.065 : (isScared ? -0.060 : (isHappy ? -0.035 * laugh : 0.01));
        this.spine.scale.set(1 + breathe, 1 + breathe * 0.45, 1 + breathe);
        this.spine.rotation.set(
          leanX + Math.sin(t * 2.15 - 0.25) * 0.018 + speechNod * 0.30,
          speechSway * 0.48 + gazeYaw * 0.22 - w1 * 0.035,
          -w1 * 0.026
        );
        this.neck.rotation.set(
          gazePitch * 0.38 - w1 * 0.018,
          gazeYaw * 0.38 + speechSway * 0.25,
          Math.sin(t * 2.4 - 0.45) * 0.022
        );
        this.headGroup.rotation.set(
          gazePitch * 0.65 + speechNod + Math.sin(t * 1.35 - 0.60) * 0.022 - (isHappy ? laugh * 0.06 : 0),
          gazeYaw * 0.65 + speechSway,
          Math.sin(t * 2.4 - 0.60) * 0.036 + Math.sin(t * 4.8 - 0.4) * 0.032 * speechAmp
        );

        this.legL.root.rotation.set(-lFlex * 0.58, 0.03, -0.025 + w0 * 0.012);
        this.legL.knee.rotation.set(lFlex, 0, 0);
        if (this.legL.foot) this.legL.foot.rotation.set(-lFlex * 0.42, 0, 0);

        this.legR.root.rotation.set(-rFlex * 0.58, -0.03, 0.025 + w0 * 0.012);
        this.legR.knee.rotation.set(rFlex, 0, 0);
        if (this.legR.foot) this.legR.foot.rotation.set(-rFlex * 0.42, 0, 0);

        if (curPose === 'hold_leash') {
          this.shoulderL.root.rotation.set(-0.35 + Math.sin(t * 2.0) * 0.02, 0, 0.15);
          this.shoulderR.root.rotation.set(0.10 - Math.sin(t * 6.5) * 0.12 * speechAmp, 0, -0.15 - speechAmp * 0.05);
          this.shoulderR.elbow.rotation.set(-0.22 - speechAmp * 0.32, 0, 0);
          if (this.shoulderL.hand) this.shoulderL.hand.rotation.set(0, 0, 0);
          if (this.shoulderR.hand) this.shoulderR.hand.rotation.set(Math.sin(t * 6.5 - 0.8) * 0.15 * speechAmp, 0, 0);
        } else if (isScared) {
          const fl = Math.sin(t * 7.5);
          const flLag = Math.sin(t * 7.5 - 0.55);
          this.shoulderL.root.rotation.set(-0.85 + fl * 0.09, 0.12, 0.34 + w2 * 0.03);
          this.shoulderR.root.rotation.set(-0.85 - fl * 0.09, -0.12, -0.34 + w2 * 0.03);
          this.shoulderL.elbow.rotation.set(-1.15 + flLag * 0.14, 0, 0.18);
          this.shoulderR.elbow.rotation.set(-1.15 - flLag * 0.14, 0, -0.18);
          if (this.shoulderL.hand) this.shoulderL.hand.rotation.set(Math.sin(t * 11.0) * 0.18, 0, 0.12);
          if (this.shoulderR.hand) this.shoulderR.hand.rotation.set(-Math.sin(t * 11.0) * 0.18, 0, -0.12);
        } else if (isAngry) {
          const gDrive = 0.4 + 0.6 * speechAmp;
          const emp = Math.sin(t * 4.6) * 0.16 * gDrive;
          const empLag = Math.sin(t * 4.6 - 0.60) * 0.22 * gDrive;
          const wristLag = Math.sin(t * 4.6 - 1.10) * 0.28 * gDrive;
          // Mão esquerda na cintura com leve balanço
          this.shoulderL.root.rotation.set(-0.08 + w1 * 0.04, 0.08, 0.38);
          this.shoulderL.elbow.rotation.set(-0.95, 0, -0.42);
          if (this.shoulderL.hand) this.shoulderL.hand.rotation.set(0.10, 0, -0.25);
          // Braço direito gesticulando com energia
          this.shoulderR.root.rotation.set(-0.72 + emp, 0.12, -0.22 - Math.cos(t * 3.2) * 0.06);
          this.shoulderR.elbow.rotation.set(-0.65 + empLag, 0, -0.10);
          if (this.shoulderR.hand) this.shoulderR.hand.rotation.set(wristLag, 0, 0);
        } else if (isHappy) {
          const arcL = Math.sin(t * 4.4);
          const arcR = Math.cos(t * 4.4);
          const lagL = Math.sin(t * 4.4 - 0.55);
          const lagR = Math.cos(t * 4.4 - 0.55);
          this.shoulderL.root.rotation.set(-0.34 + arcL * 0.18, 0.10, 0.26 + laugh * 0.08);
          this.shoulderR.root.rotation.set(-0.38 + arcR * 0.18, -0.10, -0.26 - laugh * 0.08);
          this.shoulderL.elbow.rotation.set(-0.72 + lagL * 0.22, 0, 0.14);
          this.shoulderR.elbow.rotation.set(-0.78 + lagR * 0.22, 0, -0.14);
          if (this.shoulderL.hand) this.shoulderL.hand.rotation.set(Math.sin(t * 4.4 - 1.05) * 0.25, 0, 0.12);
          if (this.shoulderR.hand) this.shoulderR.hand.rotation.set(Math.cos(t * 4.4 - 1.05) * 0.25, 0, -0.12);
        } else {
          // 'alert' ou padrão: gesticulação conversacional suave com phase lag
          const drive = 0.25 + 0.75 * speechAmp;
          const swL = Math.sin(t * 3.1) * 0.20 * drive;
          const swR = Math.cos(t * 2.7) * 0.22 * drive;
          const ebL = Math.sin(t * 3.1 - 0.55) * 0.24 * drive;
          const ebR = Math.cos(t * 2.7 - 0.55) * 0.26 * drive;
          this.shoulderL.root.rotation.set(-0.22 + swL, 0.05, 0.18 + speechAmp * 0.08);
          this.shoulderR.root.rotation.set(-0.28 + swR, -0.05, -0.18 - speechAmp * 0.08);
          this.shoulderL.elbow.rotation.set(-0.46 + ebL, 0, 0.06);
          this.shoulderR.elbow.rotation.set(-0.52 + ebR, 0, -0.06);
          if (this.shoulderL.hand) this.shoulderL.hand.rotation.set(Math.sin(t * 3.1 - 1.05) * 0.22 * drive, 0, 0);
          if (this.shoulderR.hand) this.shoulderR.hand.rotation.set(Math.cos(t * 2.7 - 1.05) * 0.24 * drive, 0, 0);
        }

        if (this.hairPuffGroup) {
          this.hairPuffGroup.rotation.set(
            Math.sin(t * 2.4 - 0.85) * 0.035 - laugh * 0.075 + speechNod * 0.35,
            speechSway * 0.30,
            Math.sin(t * 1.35 - 0.85) * 0.045
          );
          this.hairPuffGroup.scale.set(1, 1 + laugh * 0.05, 1);
        }
      }
    }
  }

  global.DonaCamila3D = DonaCamila3D;
})(typeof window !== 'undefined' ? window : this);
