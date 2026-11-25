/**
 * VoceMorador3D.js — Rig Humanoide 3D Articulado de Alta Fidelidade (Padrão 1:1 com o 2D)
 * Personagem 01: VOCÊ (Morador do Apto 302 — 24 anos)
 * Série: Condomínio Solaris: Bloco C
 * Motor: Three.js WebGL Real 3D
 *
 * Características de Elite:
 * - Alta contagem de polígonos: Geometrias suaves de 36 a 48 segmentos radiais, cantos chanfrados e zero silhuetas poligonais toscas.
 * - Proporções 1:1 fiéis ao 2D: Silhueta jovem e atlética, ombros com caimento natural, moletom azul-petróleo escuro (#153a5b), bermuda cargo grafite (#1e293b), meias com listras esportivas e chinelos Havaianas.
 * - Cabelo Undercut 3D Estilizado: Volume do topo esculpido e 5 mechas 3D pontiagudas na franja frontal fiéis ao design vetorial 2D.
 * - Orelhas marcantes visíveis na vista frontal com relevo anatômico e sombra interna (#9a6440).
 * - Máscara facial curva de alta precisão com textura dinâmica Canvas (512x512), olhos amendoados expressivos, íris vivas e lip-sync 60fps.
 * - Smartphone com display iluminado e feixe de lanterna LED.
 */
(function (global) {
  'use strict';

  class VoceMorador3D {
    constructor(options = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js não carregado para VoceMorador3D');

      this.id = 'VOCE';
      this.name = 'Você (Morador do 302)';
      this.group = new T.Group();
      this.group.name = 'VoceMorador3D';

      this.time = 0;
      this.walkCycle = 0;
      this.isWalking = Boolean(options.isWalking);
      this.isRunning = Boolean(options.isRunning);
      this.walkSpeed = options.walkSpeed !== undefined ? options.walkSpeed : 1.0;
      this.walkDir = options.walkDir || 1;
      this.mouthOpen = options.mouthOpen || 0;
      this.emotion = options.emotion || 'tense';
      this.pose = options.pose || 'idle';
      this.lookYaw = options.lookYaw || 0;
      this.lookPitch = options.lookPitch || 0;
      this.flashlightOn = options.flashlightOn !== undefined ? options.flashlightOn : true;
      this.aimTarget = options.aimTarget || null;
      this.isBlinking = false;
      this.blinkTimer = 2.2;
      this._lastMouth = -1;
      this._lastEmotion = null;
      this._lastBlink = null;
      this._lastPose = null;

      this._buildMaterials(T);
      this._buildRig(T);

      if (options.position) {
        this.group.position.set(options.position.x || 0, options.position.y || 0, options.position.z || 0);
      }
      if (options.scale) {
        const s = options.scale;
        this.group.scale.set(s, s, s);
      }
      this._applyPose(this.pose);
    }

    _buildMaterials(T) {
      this.mats = {
        // Tom de pele morena brasileira quente (exata do 2D #c99060 / #b87d4e)
        skin: new T.MeshStandardMaterial({
          color: 0xc99060,
          roughness: 0.62,
          metalness: 0.02
        }),
        skinShadow: new T.MeshStandardMaterial({
          color: 0x9a6440,
          roughness: 0.70,
          metalness: 0.02
        }),
        // Moletom Azul-Petróleo Fechado (#153a5b / #102e48)
        hoodieNavy: new T.MeshStandardMaterial({
          color: 0x153a5b,
          roughness: 0.85,
          metalness: 0.02
        }),
        hoodieDark: new T.MeshStandardMaterial({
          color: 0x0f2942,
          roughness: 0.90,
          metalness: 0.02
        }),
        hoodieCord: new T.MeshStandardMaterial({
          color: 0xf1f5f9,
          roughness: 0.50
        }),
        agletMetal: new T.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.30,
          metalness: 0.85
        }),
        // Bermuda Cargo Grafite (#1e293b / #0f172a)
        cargoShorts: new T.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.82,
          metalness: 0.05
        }),
        cargoPocket: new T.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.86
        }),
        // Cabelo Undercut Castanho Escuro Quase Preto (#140f1f)
        hair: new T.MeshStandardMaterial({
          color: 0x140f1f,
          roughness: 0.80,
          metalness: 0.08
        }),
        hairUndercut: new T.MeshStandardMaterial({
          color: 0x0d0a14,
          roughness: 0.92
        }),
        // Meias esportivas brancas com listras vermelha e azul
        sockWhite: new T.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.75
        }),
        sockStripeRed: new T.MeshStandardMaterial({
          color: 0xdc2626,
          roughness: 0.60
        }),
        sockStripeBlue: new T.MeshStandardMaterial({
          color: 0x2563eb,
          roughness: 0.60
        }),
        // Chinelo Havaianas Brasil (base azul marinho + tiras azul royal #2563eb)
        sandalBase: new T.MeshStandardMaterial({
          color: 0x0a192f,
          roughness: 0.65
        }),
        sandalStrap: new T.MeshStandardMaterial({
          color: 0x2563eb,
          roughness: 0.45
        }),
        // Smartphone
        phoneBody: new T.MeshStandardMaterial({
          color: 0x09090b,
          roughness: 0.30,
          metalness: 0.90
        }),
        phoneScreen: new T.MeshBasicMaterial({
          color: 0x38bdf8
        }),
        phoneLight: new T.MeshBasicMaterial({
          color: 0xfef08a
        })
      };
    }

    _buildRig(T) {
      // Raiz do esqueleto / Pelvis
      this.pelvis = new T.Group();
      this.pelvis.position.set(0, 0.82, 0);
      this.group.add(this.pelvis);

      // ─── 1. QUADRIL & BERMUDA CARGO GRAFITE ───
      const hipMesh = new T.Mesh(new T.CylinderGeometry(0.165, 0.155, 0.16, 40), this.mats.cargoShorts);
      hipMesh.scale.set(1.04, 1.0, 0.76);
      hipMesh.castShadow = true;
      this.pelvis.add(hipMesh);

      // Cós da bermuda com costura
      const waistBand = new T.Mesh(new T.TorusGeometry(0.158, 0.012, 16, 40), this.mats.cargoPocket);
      waistBand.rotation.x = Math.PI / 2;
      waistBand.position.set(0, 0.075, 0);
      waistBand.scale.set(1.04, 0.76, 1.0);
      this.pelvis.add(waistBand);

      // Pernas da bermuda com boca alargada
      [-0.082, 0.082].forEach((hx, idx) => {
        const shortLeg = new T.Mesh(new T.CylinderGeometry(0.086, 0.094, 0.16, 36), this.mats.cargoShorts);
        shortLeg.position.set(hx, -0.095, 0);
        shortLeg.scale.set(1.0, 1.0, 0.86);
        shortLeg.castShadow = true;
        this.pelvis.add(shortLeg);

        // Barra dobrada da bermuda
        const hemCuff = new T.Mesh(new T.TorusGeometry(0.092, 0.009, 16, 32), this.mats.cargoPocket);
        hemCuff.rotation.x = Math.PI / 2;
        hemCuff.position.set(hx, -0.17, 0);
        hemCuff.scale.set(1.0, 0.86, 1.0);
        this.pelvis.add(hemCuff);

        // Bolso cargo lateral com lapela e botão
        const pocket = new T.Mesh(new T.BoxGeometry(0.026, 0.095, 0.090), this.mats.cargoPocket);
        pocket.position.set(idx === 0 ? hx - 0.082 : hx + 0.082, -0.10, 0);
        this.pelvis.add(pocket);
      });

      // ─── 2. TRONCO / MOLETOM AZUL-PETRÓLEO ESCULPIDO ───
      this.spine = new T.Group();
      this.spine.position.set(0, 0.08, 0);
      this.pelvis.add(this.spine);

      // Tórax atlético esculpido (48 segmentos, transição trapezoidal suave)
      const chestMesh = new T.Mesh(new T.CylinderGeometry(0.185, 0.158, 0.28, 48), this.mats.hoodieNavy);
      chestMesh.position.set(0, 0.25, 0);
      chestMesh.scale.set(1.10, 1.0, 0.78);
      chestMesh.castShadow = true;
      this.spine.add(chestMesh);

      // Ombreiras atléticas naturais do moletom
      [-0.145, 0.145].forEach((sx, idx) => {
        const shoulder = new T.Mesh(new T.SphereGeometry(0.076, 24, 18), this.mats.hoodieNavy);
        shoulder.position.set(sx, 0.33, 0);
        shoulder.scale.set(1.15, 0.65, 0.85);
        this.spine.add(shoulder);
      });

      // Abdômen / Cintura
      const waistMesh = new T.Mesh(new T.CylinderGeometry(0.155, 0.158, 0.16, 48), this.mats.hoodieNavy);
      waistMesh.position.set(0, 0.075, 0);
      waistMesh.scale.set(1.02, 1.0, 0.74);
      this.spine.add(waistMesh);

      // Barra canelada inferior do moletom
      const bottomHem = new T.Mesh(new T.CylinderGeometry(0.162, 0.158, 0.05, 48), this.mats.hoodieDark);
      bottomHem.position.set(0, -0.01, 0);
      bottomHem.scale.set(1.03, 1.0, 0.75);
      this.spine.add(bottomHem);

      // Bolso Canguru frontal curvado no abdômen com costuras
      const pocketGeo = new T.CylinderGeometry(0.164, 0.168, 0.13, 36, 1, false, -Math.PI * 0.32, Math.PI * 0.64);
      const kangarooPocket = new T.Mesh(pocketGeo, this.mats.hoodieDark);
      kangarooPocket.position.set(0, 0.075, 0.007);
      kangarooPocket.scale.set(1.03, 1.0, 0.75);
      this.spine.add(kangarooPocket);

      // Capuz do Moletom envolvendo o pescoço (colarinho bojudo generoso)
      const hoodCollar = new T.Mesh(new T.TorusGeometry(0.102, 0.042, 24, 48), this.mats.hoodieNavy);
      hoodCollar.rotation.x = Math.PI / 2 + 0.15;
      hoodCollar.position.set(0, 0.39, -0.015);
      this.spine.add(hoodCollar);

      // Capuz caído suavemente atrás da nuca (volume de tecido)
      const hoodBack = new T.Mesh(new T.SphereGeometry(0.125, 32, 24, 0, Math.PI, 0, Math.PI * 0.68), this.mats.hoodieDark);
      hoodBack.rotation.x = Math.PI * 0.60;
      hoodBack.position.set(0, 0.32, -0.08);
      hoodBack.scale.set(1.05, 0.85, 0.75);
      this.spine.add(hoodBack);

      // Cordões brancos do capuz pendurados com ponteiras metálicas
      [-0.038, 0.038].forEach((cx, idx) => {
        const cord = new T.Mesh(new T.CylinderGeometry(0.0035, 0.0035, 0.16, 16), this.mats.hoodieCord);
        cord.position.set(cx, 0.30, 0.125);
        cord.rotation.z = idx === 0 ? 0.05 : -0.05;
        this.spine.add(cord);

        const aglet = new T.Mesh(new T.CylinderGeometry(0.0042, 0.0042, 0.024, 16), this.mats.agletMetal);
        aglet.position.set(cx, 0.21, 0.128);
        this.spine.add(aglet);
      });

      // ─── 3. PESCOÇO, CABEÇA & ROSTO ESTILIZADO ───
      this.neck = new T.Group();
      this.neck.position.set(0, 0.41, 0);
      this.spine.add(this.neck);

      const neckMesh = new T.Mesh(new T.CylinderGeometry(0.064, 0.076, 0.11, 36), this.mats.skin);
      neckMesh.position.set(0, 0.045, 0.005);
      this.neck.add(neckMesh);

      this.headGroup = new T.Group();
      this.headGroup.position.set(0, 0.16, 0);
      this.neck.add(this.headGroup);
      this.spine.rotation.order = 'YXZ';
      this.neck.rotation.order = 'YXZ';
      this.headGroup.rotation.order = 'YXZ';

      // Crânio estilizado de alta definição (fiel à proporção oval 2D do jovem)
      const skull = new T.Mesh(new T.SphereGeometry(0.158, 48, 36), this.mats.skin);
      skull.scale.set(0.96, 1.12, 0.98);
      skull.castShadow = true;
      this.headGroup.add(skull);

      // Mandíbula e Queixo afilado estilizado
      const jawMesh = new T.Mesh(new T.CylinderGeometry(0.142, 0.082, 0.13, 36), this.mats.skin);
      jawMesh.position.set(0, -0.055, 0.015);
      jawMesh.scale.set(0.88, 1.0, 0.84);
      this.headGroup.add(jawMesh);

      // Queixo jovem
      const chin = new T.Mesh(new T.SphereGeometry(0.036, 16, 14), this.mats.skin);
      chin.position.set(0, -0.11, 0.055);
      chin.scale.set(1.0, 0.8, 1.0);
      this.headGroup.add(chin);

      // Nariz 3D anatômico estilizado (ponte + pontinha afilada jovem)
      const noseGroup = new T.Group();
      noseGroup.position.set(0, 0.008, 0.156);
      this.headGroup.add(noseGroup);

      const noseBridge = new T.Mesh(new T.CylinderGeometry(0.008, 0.014, 0.048, 16), this.mats.skin);
      noseBridge.rotation.x = -0.22;
      noseBridge.position.set(0, 0.014, 0.004);
      noseGroup.add(noseBridge);

      const noseTip = new T.Mesh(new T.SphereGeometry(0.018, 16, 14), this.mats.skin);
      noseTip.scale.set(1.05, 0.85, 1.05);
      noseTip.position.set(0, -0.010, 0.010);
      noseGroup.add(noseTip);

      // Orelhas proeminentes no estilo 2D (visíveis na frente no nível dos olhos)
      [-0.162, 0.162].forEach((ex, idx) => {
        const earGroup = new T.Group();
        earGroup.position.set(ex, 0.015, -0.010);
        earGroup.rotation.y = idx === 0 ? 0.28 : -0.28;
        this.headGroup.add(earGroup);

        const earOuter = new T.Mesh(new T.SphereGeometry(0.044, 24, 20), this.mats.skin);
        earOuter.scale.set(0.40, 1.22, 0.88);
        earGroup.add(earOuter);

        const earInner = new T.Mesh(new T.SphereGeometry(0.026, 20, 16), this.mats.skinShadow);
        earInner.scale.set(0.28, 0.85, 0.60);
        earInner.position.set(idx === 0 ? 0.010 : -0.010, 0, 0.005);
        earGroup.add(earInner);
      });

      // ─── 4. CABELO UNDERCUT 3D ESCULPIDO COM MECHAS REAIS (Fiel ao 2D) ───
      // Volume principal cobrindo topo, nuca e laterais com mechas sobrepostas
      const hairCrown = new T.Mesh(new T.SphereGeometry(0.170, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.60), this.mats.hair);
      hairCrown.position.set(0, 0.045, -0.025);
      hairCrown.scale.set(1.02, 1.10, 1.05);
      hairCrown.rotation.x = -0.18;
      hairCrown.castShadow = true;
      this.headGroup.add(hairCrown);

      // Volume de topete ondulado no topo
      const hairWave = new T.Mesh(new T.SphereGeometry(0.12, 24, 18), this.mats.hair);
      hairWave.position.set(0.02, 0.14, 0.04);
      hairWave.scale.set(1.2, 0.55, 1.1);
      hairWave.rotation.set(-0.25, 0.15, -0.1);
      this.headGroup.add(hairWave);

      // Degradê raspado do undercut nas laterais e nuca
      const hairBase = new T.Mesh(new T.CylinderGeometry(0.162, 0.148, 0.13, 36, 1, true, Math.PI * 0.22, Math.PI * 1.56), this.mats.hairUndercut);
      hairBase.position.set(0, 0.01, -0.015);
      hairBase.scale.set(0.98, 1.0, 0.96);
      this.headGroup.add(hairBase);

      // Costeletas pontiagudas à frente das orelhas
      [-0.155, 0.155].forEach((sx) => {
        const sideburn = new T.Mesh(new T.BoxGeometry(0.020, 0.082, 0.038), this.mats.hair);
        sideburn.position.set(sx, -0.008, 0.028);
        this.headGroup.add(sideburn);
      });

      // 5 MECHAS 3D DINÂMICAS DA FRANJA (Curvadas e fluídas sobre a testa fiel ao desenho 2D)
      const fringeLocks = [
        { x: -0.095, y: 0.105, z: 0.132, len: 0.085, rad: 0.025, rotZ: 0.38, rotX: 0.26 },
        { x: -0.048, y: 0.096, z: 0.146, len: 0.102, rad: 0.028, rotZ: 0.20, rotX: 0.20 },
        { x: 0.004,  y: 0.092, z: 0.150, len: 0.112, rad: 0.030, rotZ: 0.02, rotX: 0.16 }, // Mecha central
        { x: 0.052,  y: 0.096, z: 0.146, len: 0.100, rad: 0.028, rotZ: -0.18, rotX: 0.20 },
        { x: 0.098,  y: 0.105, z: 0.132, len: 0.085, rad: 0.025, rotZ: -0.36, rotX: 0.26 }
      ];

      fringeLocks.forEach(f => {
        const lockGroup = new T.Group();
        lockGroup.position.set(f.x, f.y, f.z);
        lockGroup.rotation.set(f.rotX, 0, f.rotZ);

        // Cone estilizado de mecha com curvatura suave
        const lockMesh = new T.Mesh(new T.ConeGeometry(f.rad, f.len, 16), this.mats.hair);
        lockMesh.rotation.x = Math.PI; // Ponta para baixo
        lockMesh.position.set(0, -f.len * 0.45, 0);
        lockMesh.castShadow = true;
        lockGroup.add(lockMesh);

        this.headGroup.add(lockGroup);
      });

      // ─── 5. MÁSCARA FACIAL CURVA DE ALTA PRECISÃO (CanvasTexture 512x512) ───
      this.faceCanvas = document.createElement('canvas');
      this.faceCanvas.width = 512;
      this.faceCanvas.height = 512;
      this.faceCtx = this.faceCanvas.getContext('2d');
      this.faceTexture = new T.CanvasTexture(this.faceCanvas);
      this.faceTexture.colorSpace = T.SRGBColorSpace || T.LinearColorSpace;

      const faceGeo = global.CharacterFaceTextures && global.CharacterFaceTextures.createCurvedFaceGeometry
        ? global.CharacterFaceTextures.createCurvedFaceGeometry(T, {
            radiusTop: 0.162,
            radiusBottom: 0.146,
            height: 0.22,
            phiSpan: 1.35,
            segsX: 36,
            segsY: 20,
            zOffset: 0.004
          })
        : new T.CylinderGeometry(0.160, 0.146, 0.22, 36, 1, true, -Math.PI * 0.40, Math.PI * 0.80);

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

      // ─── 6. BRAÇOS INTEGRADOS COM OMBROS NATURAIS (Sem esferas soltas de robô) ───
      this.shoulderL = this._createArm(T, -0.175, false);
      this.shoulderR = this._createArm(T, 0.175, true);
      this.spine.add(this.shoulderL.root);
      this.spine.add(this.shoulderR.root);

      // Smartphone na mão direita
      this._buildPhone(T);

      // ─── 7. PERNAS COM MEIAS LISTRADAS & HAVAIANAS ───
      this.legL = this._createLeg(T, -0.082);
      this.legR = this._createLeg(T, 0.082);
      this.pelvis.add(this.legL.root);
      this.pelvis.add(this.legR.root);
    }

    _createArm(T, xPos, isRight) {
      const root = new T.Group();
      // Ombro embutido no tecido do moletom com declive suave natural
      root.position.set(xPos, 0.31, 0);
      root.rotation.z = isRight ? -0.10 : 0.10;

      const upperArm = new T.Group();
      upperArm.position.set(0, -0.02, 0);
      root.add(upperArm);

      // Manga superior afilada com topo bojudo integrado (sem esfera externa)
      const upperMesh = new T.Mesh(new T.CylinderGeometry(0.048, 0.040, 0.18, 36), this.mats.hoodieNavy);
      upperMesh.position.set(0, -0.09, 0);
      upperMesh.castShadow = true;
      upperArm.add(upperMesh);

      // Cotovelo / Antebraço
      const elbow = new T.Group();
      elbow.position.set(0, -0.18, 0);
      upperArm.add(elbow);

      // Dobra de tecido do cotovelo
      const elbowCloth = new T.Mesh(new T.CylinderGeometry(0.041, 0.038, 0.04, 32), this.mats.hoodieDark);
      elbowCloth.position.set(0, 0, 0);
      elbow.add(elbowCloth);

      const foreMesh = new T.Mesh(new T.CylinderGeometry(0.039, 0.033, 0.16, 36), this.mats.hoodieNavy);
      foreMesh.position.set(0, -0.08, 0);
      foreMesh.castShadow = true;
      elbow.add(foreMesh);

      // Punho canelado do moletom
      const cuff = new T.Mesh(new T.CylinderGeometry(0.036, 0.033, 0.036, 32), this.mats.hoodieDark);
      cuff.position.set(0, -0.16, 0);
      elbow.add(cuff);

      // Pulso e Mão anatômica estilizada com dedos modelados
      const hand = new T.Group();
      hand.position.set(0, -0.19, 0);
      elbow.add(hand);

      // Palma
      const palm = new T.Mesh(new T.BoxGeometry(0.036, 0.042, 0.022), this.mats.skin);
      palm.position.set(0, -0.015, 0);
      hand.add(palm);

      // Polegar
      const thumb = new T.Mesh(new T.CylinderGeometry(0.007, 0.006, 0.026, 16), this.mats.skin);
      thumb.position.set(isRight ? -0.018 : 0.018, -0.010, 0.010);
      thumb.rotation.set(0.3, 0, isRight ? -0.5 : 0.5);
      hand.add(thumb);

      // 4 dedos modelados individualmente (Indicador, Médio, Anelar, Mínimo)
      [-0.012, -0.004, 0.004, 0.012].forEach((fx, fIdx) => {
        const fLen = fIdx === 1 ? 0.033 : (fIdx === 2 ? 0.030 : (fIdx === 0 ? 0.027 : 0.023));
        const finger = new T.Mesh(new T.CylinderGeometry(0.0040, 0.0034, fLen, 12), this.mats.skin);
        finger.position.set(fx, -0.030 - fLen * 0.45, 0.002);
        hand.add(finger);

        const knuckle = new T.Mesh(new T.SphereGeometry(0.0045, 10, 8), this.mats.skin);
        knuckle.position.set(fx, -0.030, 0.003);
        hand.add(knuckle);
      });

      return { root, upperArm, elbow, hand };
    }

    _buildPhone(T) {
      this.phoneGroup = new T.Group();
      this.phoneGroup.position.set(0, -0.025, 0.035);
      this.phoneGroup.rotation.x = -0.4;

      const body = new T.Mesh(new T.BoxGeometry(0.042, 0.086, 0.008), this.mats.phoneBody);
      this.phoneGroup.add(body);

      const screen = new T.Mesh(new T.PlaneGeometry(0.038, 0.078), this.mats.phoneScreen);
      screen.position.set(0, 0, 0.005);
      this.phoneGroup.add(screen);

      const ledFlash = new T.Mesh(new T.SphereGeometry(0.004, 12, 10), this.mats.phoneLight);
      ledFlash.position.set(0.012, 0.035, -0.005);
      this.phoneGroup.add(ledFlash);

      this.shoulderR.hand.add(this.phoneGroup);
    }

    _createLeg(T, xPos) {
      const root = new T.Group();
      root.position.set(xPos, -0.06, 0);

      // Coxa
      const thighMesh = new T.Mesh(new T.CylinderGeometry(0.054, 0.046, 0.18, 36), this.mats.skin);
      thighMesh.position.set(0, -0.09, 0);
      thighMesh.castShadow = true;
      root.add(thighMesh);

      // Joelho estilizado suave
      const knee = new T.Group();
      knee.position.set(0, -0.18, 0);
      root.add(knee);

      const kneeCap = new T.Mesh(new T.SphereGeometry(0.044, 24, 18), this.mats.skin);
      kneeCap.scale.set(0.95, 0.95, 1.05);
      knee.add(kneeCap);

      // Canela com caimento anatômico da panturrilha
      const calfMesh = new T.Mesh(new T.CylinderGeometry(0.045, 0.034, 0.19, 36), this.mats.skin);
      calfMesh.position.set(0, -0.095, 0);
      calfMesh.castShadow = true;
      knee.add(calfMesh);

      // Meia Esportiva Branca com Listras Vermelha e Azul (#f8fafc)
      const sock = new T.Mesh(new T.CylinderGeometry(0.037, 0.035, 0.075, 36), this.mats.sockWhite);
      sock.position.set(0, -0.155, 0);
      knee.add(sock);

      const stripeRed = new T.Mesh(new T.CylinderGeometry(0.0375, 0.0375, 0.010, 36), this.mats.sockStripeRed);
      stripeRed.position.set(0, -0.135, 0);
      knee.add(stripeRed);

      const stripeBlue = new T.Mesh(new T.CylinderGeometry(0.0372, 0.0372, 0.010, 36), this.mats.sockStripeBlue);
      stripeBlue.position.set(0, -0.150, 0);
      knee.add(stripeBlue);

      // Tornozelo e Pé (Havaianas Brasil)
      const foot = new T.Group();
      foot.position.set(0, -0.195, 0.025);
      knee.add(foot);

      // Solado ergonômico da Havaianas (bicamada: base preta + topo azul royal)
      const soleBase = new T.Mesh(new T.BoxGeometry(0.068, 0.010, 0.165), this.mats.sandalBase);
      soleBase.position.set(0, -0.010, 0.03);
      foot.add(soleBase);

      const soleTop = new T.Mesh(new T.BoxGeometry(0.066, 0.008, 0.162), this.mats.sandalStrap);
      soleTop.position.set(0, -0.001, 0.03);
      foot.add(soleTop);

      // Pé moreno sobre o chinelo
      const footSkin = new T.Mesh(new T.BoxGeometry(0.058, 0.022, 0.13), this.mats.skin);
      footSkin.position.set(0, 0.012, 0.02);
      foot.add(footSkin);

      // Tiras em 'Y' da Havaianas
      const strapL = new T.Mesh(new T.CylinderGeometry(0.0035, 0.0035, 0.068, 16), this.mats.sandalStrap);
      strapL.rotation.set(0.5, 0.4, 0.6);
      strapL.position.set(-0.014, 0.020, 0.04);
      foot.add(strapL);

      const strapR = new T.Mesh(new T.CylinderGeometry(0.0035, 0.0035, 0.068, 16), this.mats.sandalStrap);
      strapR.rotation.set(0.5, -0.4, -0.6);
      strapR.position.set(0.014, 0.020, 0.04);
      foot.add(strapR);

      return { root, knee, foot };
    }

    _updateFace() {
      const m = Math.max(0, Math.min(1, Number(this.mouthOpen) || 0));
      this._lastMouth = m;
      this._lastEmotion = this.emotion;
      this._lastBlink = this.isBlinking;
      if (!this.faceCtx || !global.CharacterFaceTextures) return;
      global.CharacterFaceTextures.drawVoceFace(this.faceCtx, {
        emotion: this.emotion,
        mouthOpen: m,
        isBlinking: this.isBlinking,
        time: this.time
      });
      if (this.faceTexture) this.faceTexture.needsUpdate = true;
    }

    setEmotion(e) {
      if (this.emotion === e) return;
      this.emotion = e;
      this._updateFace();
    }

    setMouthOpen(val) {
      const raw = Math.max(0, Math.min(1, Number(val) || 0));
      const m = raw <= 0.04 ? 0 : Math.round(raw * 30) / 30;
      this.mouthOpen = m;
      if (Math.abs(m - this._lastMouth) > 0.035 || (m > 0.04) !== (this._lastMouth > 0.04)) {
        this._updateFace();
      }
    }

    setLook(yaw = 0, pitch = 0) {
      this.lookYaw = Number(yaw) || 0;
      this.lookPitch = Number(pitch) || 0;
    }

    setPose(poseName, force = false) {
      const next = poseName || 'idle';
      if (this.pose === next && this._lastPose === next && !force) return;
      this.pose = next;
      this._applyPose(next);
    }

    walk(speed = 1.0, dir = 1) {
      this.isWalking = true;
      this.isRunning = false;
      this.walkSpeed = Math.abs(speed);
      this.walkDir = dir >= 0 ? 1 : -1;
    }

    run(speed = 1.6, dir = 1) {
      this.isRunning = true;
      this.isWalking = true;
      this.walkSpeed = Math.abs(speed);
      this.walkDir = dir >= 0 ? 1 : -1;
    }

    stop() {
      if (!this.isWalking && !this.isRunning) return;
      this.isWalking = false;
      this.isRunning = false;
      this.walkCycle = 0;
      this._applyPose(this.pose || 'idle');
    }

    _getPhoneAimAngles() {
      let rx = -0.88;
      let ry = -0.10;
      if (this.aimTarget && typeof this.aimTarget === 'object') {
        const gx = this.group.position.x || 0;
        const gy = this.group.position.y || 0;
        const gz = this.group.position.z || 0;
        const dx = (this.aimTarget.x || 0) - gx;
        const dy = (this.aimTarget.y || 0) - (gy + 1.15);
        const dz = (this.aimTarget.z || 0) - gz;
        const horiz = Math.max(0.25, Math.hypot(dx, dz));
        const pitchAdj = Math.max(-0.55, Math.min(0.45, -Math.atan2(dy, horiz)));
        rx = -0.88 + pitchAdj * 0.65;
        const localYaw = Math.atan2(dx, dz) - (this.group.rotation.y || 0);
        ry = Math.max(-0.45, Math.min(0.45, Math.sin(localYaw) * 0.35 - 0.10));
      }
      return { rx, ry };
    }

    _applyPose(poseName) {
      this._lastPose = poseName;
      this.pelvis.position.x = 0;
      this.pelvis.rotation.set(0, 0, 0);
      this.spine.position.y = 0.08;
      this.spine.rotation.set(0, 0, 0);
      this.shoulderL.hand.rotation.set(0, 0, 0);
      this.shoulderR.hand.rotation.set(0, 0, 0);

      if (poseName === 'seated_hold_dog' || poseName === 'seated') {
        this.pelvis.position.y = 0.46;
        this.shoulderL.root.rotation.set(-0.82, -0.22, 0.12);
        this.shoulderL.elbow.rotation.set(-0.85, 0, 0);
        this.shoulderR.root.rotation.set(-0.82, 0.22, -0.12);
        this.shoulderR.elbow.rotation.set(-0.85, 0, 0);
        this.legL.root.rotation.set(-1.45, 0, 0.05);
        this.legL.knee.rotation.set(1.42, 0, 0);
        this.legL.foot.rotation.set(0.03, 0, 0);
        this.legR.root.rotation.set(-1.45, 0, -0.05);
        this.legR.knee.rotation.set(1.42, 0, 0);
        this.legR.foot.rotation.set(0.03, 0, 0);
        return;
      }

      this.pelvis.position.y = 0.82;
      this.legL.root.rotation.set(0, 0, 0);
      this.legL.knee.rotation.set(0, 0, 0);
      this.legL.foot.rotation.set(0, 0, 0);
      this.legR.root.rotation.set(0, 0, 0);
      this.legR.knee.rotation.set(0, 0, 0);
      this.legR.foot.rotation.set(0, 0, 0);

      if (poseName === 'holding_dog' || poseName === 'holding_dog_walk') {
        this.shoulderL.root.rotation.set(-0.78, -0.22, 0.10);
        this.shoulderL.elbow.rotation.set(-0.92, 0, 0);
        this.shoulderR.root.rotation.set(-0.78, 0.22, -0.10);
        this.shoulderR.elbow.rotation.set(-0.92, 0, 0);
        return;
      }
      if (poseName === 'phone_flashlight' || poseName === 'phone_flashlight_walk') {
        const aim = this._getPhoneAimAngles();
        this.shoulderL.root.rotation.set(0.08, 0, 0.10);
        this.shoulderL.elbow.rotation.set(-0.25, 0, 0);
        this.shoulderR.root.rotation.set(aim.rx, aim.ry, -0.10);
        this.shoulderR.elbow.rotation.set(-0.55, 0.12, 0);
        return;
      }
      if (poseName === 'gesturing_urgent') {
        this.shoulderL.root.rotation.set(-0.72, -0.12, 0.28);
        this.shoulderL.elbow.rotation.set(-0.95, 0, 0);
        this.shoulderR.root.rotation.set(-0.85, 0.10, -0.22);
        this.shoulderR.elbow.rotation.set(-0.80, 0, 0);
        return;
      }
      // Padrão idle / walk / run
      this.shoulderL.root.rotation.set(0.08, 0, 0.10);
      this.shoulderL.elbow.rotation.set(-0.25, 0, 0);
      this.shoulderR.root.rotation.set(-0.22, -0.12, -0.15);
      this.shoulderR.elbow.rotation.set(-0.92, 0.18, 0);
    }

    update(dt, timeOrCam) {
      const safeDt = Math.max(0, Math.min(Number(dt) || 1 / 60, 0.1));
      const hasAbsTime = typeof timeOrCam === 'number' && Number.isFinite(timeOrCam);
      const prevT = this.time || 0;
      if (hasAbsTime) {
        this.time = timeOrCam;
      } else {
        this.time += safeDt;
      }
      const t = this.time;

      // 1. Atualização facial em tempo real (atribuição direta OU setters)
      const rawM = Math.max(0, Math.min(1, Number(this.mouthOpen) || 0));
      const m = rawM <= 0.04 ? 0 : Math.round(rawM * 30) / 30;
      this.mouthOpen = m;
      if (this.mats && this.mats.phoneLight) {
        this.mats.phoneLight.color.setHex(this.flashlightOn ? 0xfef08a : 0x52525b);
      }

      let shouldBlink = false;
      if (hasAbsTime) {
        const blinkPhase = this.time % 3.3;
        shouldBlink = blinkPhase > 3.17;
      } else {
        this.blinkTimer -= safeDt;
        if (this.blinkTimer <= 0) {
          shouldBlink = true;
          if (this.blinkTimer <= -0.12) {
            shouldBlink = false;
            this.blinkTimer = 2.4 + Math.random() * 2.2;
          }
        }
      }
      this.isBlinking = shouldBlink;

      const mouthChanged = Math.abs(m - this._lastMouth) > 0.035 || (m > 0.04) !== (this._lastMouth > 0.04);
      if (mouthChanged || this.emotion !== this._lastEmotion || shouldBlink !== this._lastBlink) {
        this._updateFace();
      }

      // 2. Gesticulação orgânica de fala com envelope passa-baixa contínuo (zero tranco por sílaba!)
      const mouthRamp = Math.max(0, Math.min(1, (m - 0.04) / 0.28));
      const targetTalk = mouthRamp * mouthRamp * (3 - 2 * mouthRamp);
      if (this._talkEnergy === undefined || Math.abs(t - prevT) > 0.25) {
        this._talkEnergy = targetTalk;
      } else {
        const alpha = 1 - Math.exp(-safeDt * 4.5);
        this._talkEnergy += (targetTalk - this._talkEnergy) * alpha;
      }
      const talking = Math.max(0, Math.min(1, this._talkEnergy));
      const talkNod = talking * Math.sin(t * 7.2) * 0.048;
      const talkTilt = talking * Math.sin(t * 4.2) * 0.036;
      const talkYaw = talking * Math.sin(t * 2.9) * 0.045;
      const talkSpinePitch = talking * (0.024 + Math.sin(t * 4.4) * 0.022);
      const talkSpineTwist = talking * Math.sin(t * 3.1) * 0.036;
      const handGesture = talking * Math.sin(t * 5.6) * 0.16;
      const elbowGesture = talking * (-0.14 - Math.sin(t * 4.8) * 0.10);

      const pose = this.pose || 'idle';
      const isSeated = pose === 'seated_hold_dog' || pose === 'seated';
      const isHoldingDog = pose === 'holding_dog' || pose === 'holding_dog_walk';
      const isPhonePose = pose === 'phone_flashlight' || pose === 'phone_flashlight_walk';
      const isUrgent = pose === 'gesturing_urgent';
      const running = !isSeated && Boolean(this.isRunning || pose === 'run' || pose === 'sprint');
      const walking = !isSeated && !running && Boolean(this.isWalking || pose === 'walk' || pose === 'holding_dog_walk' || pose === 'phone_flashlight_walk');
      const moving = running || walking;

      // Cabeça e pescoço combinam olhar natural + lookYaw/lookPitch + reação de fala
      const ambYaw = Math.sin(t * 1.2) * 0.050;
      const ambPitch = Math.sin(t * 1.6) * 0.028;
      const targetYaw = Math.max(-0.75, Math.min(0.75, (this.lookYaw || 0) + ambYaw + talkYaw));
      const targetPitch = Math.max(-0.45, Math.min(0.45, (this.lookPitch || 0) + ambPitch + talkNod));
      this.neck.rotation.set(targetPitch * 0.28, targetYaw * 0.28, talkTilt * 0.35);
      this.headGroup.rotation.set(targetPitch * 0.72, targetYaw * 0.72, talkTilt * 0.65);

      // 3. Cinemática corporal: Sentado vs Caminhando/Correndo vs Idle vivo
      if (isSeated) {
        this._applyPose(pose);
        const breath = Math.sin(t * 2.2) * 0.010;
        this.pelvis.position.y = 0.46 + Math.sin(t * 18) * 0.002;
        this.spine.position.y = 0.08 + breath;
        this.spine.rotation.set(0.03 + talkSpinePitch, talkSpineTwist, Math.sin(t * 1.0) * 0.018);
        // Segura Paçoca no colo com balanço sutil e reação de fala
        const dogRock = Math.sin(t * 2.4) * 0.03 + talking * Math.sin(t * 7.5) * 0.04;
        this.shoulderL.root.rotation.x = -0.82 + dogRock;
        this.shoulderR.root.rotation.x = -0.82 + dogRock;
        this.shoulderL.elbow.rotation.x = -0.85 - talking * 0.06;
        this.shoulderR.elbow.rotation.x = -0.85 - talking * 0.06;
        return;
      }

      if (moving) {
        const freq = running ? 9.0 : 5.2;
        const spd = this.walkSpeed || 1.0;
        let phi;
        if (hasAbsTime) {
          phi = t * spd * freq;
          this.walkCycle = phi;
        } else {
          this.walkCycle += safeDt * spd * freq;
          phi = this.walkCycle;
        }

        const legAmp = running ? 0.88 : 0.68;
        const lAngle = Math.sin(phi) * legAmp;
        const rAngle = Math.sin(phi + Math.PI) * legAmp;

        this.pelvis.position.x = Math.sin(phi) * (running ? 0.026 : 0.016);
        this.pelvis.position.y = 0.82 + Math.abs(Math.cos(phi)) * (running ? 0.055 : 0.034) - 0.014;
        this.pelvis.rotation.set(0, Math.sin(phi) * (running ? 0.12 : 0.07), Math.cos(phi) * (running ? 0.045 : 0.024));

        this.spine.position.y = 0.08 + Math.sin(phi * 2) * 0.012;
        this.spine.rotation.set(
          (running ? 0.18 : 0.07) + talkSpinePitch,
          -Math.sin(phi) * (running ? 0.14 : 0.08) + talkSpineTwist,
          Math.sin(phi) * (running ? 0.045 : 0.026)
        );

        // Coxas, joelhos e tornozelos/chinelos com amplitude clara
        this.legL.root.rotation.set(lAngle, 0, -0.02);
        this.legR.root.rotation.set(rAngle, 0, 0.02);

        const lKneeLift = Math.max(0, -Math.cos(phi)) * (running ? 0.96 : 0.62);
        const rKneeLift = Math.max(0, -Math.cos(phi + Math.PI)) * (running ? 0.96 : 0.62);
        this.legL.knee.rotation.set((lAngle < 0 ? -lAngle * 0.45 : 0.12) + lKneeLift, 0, 0);
        this.legR.knee.rotation.set((rAngle < 0 ? -rAngle * 0.45 : 0.12) + rKneeLift, 0, 0);

        this.legL.foot.rotation.set(-(lAngle * 0.42) + Math.cos(phi) * 0.28, 0, 0);
        this.legR.foot.rotation.set(-(rAngle * 0.42) + Math.cos(phi + Math.PI) * 0.28, 0, 0);

        // Braços (preserva braços segurando Paçoca ou celular com balanço orgânico de passada!)
        const armSwing = running ? 0.90 : 0.68;
        if (isHoldingDog) {
          const carryBob = Math.sin(phi * 2) * (running ? 0.06 : 0.035);
          this.shoulderL.root.rotation.set(-0.78 + carryBob, -0.22, 0.10);
          this.shoulderL.elbow.rotation.set(-0.92 - carryBob * 0.5, 0, 0);
          this.shoulderR.root.rotation.set(-0.78 + carryBob, 0.22, -0.10);
          this.shoulderR.elbow.rotation.set(-0.92 - carryBob * 0.5, 0, 0);
          this.shoulderL.hand.rotation.set(0, 0, 0);
          this.shoulderR.hand.rotation.set(0, 0, 0);
        } else if (isPhonePose) {
          const aim = this._getPhoneAimAngles();
          this.shoulderL.root.rotation.set(-lAngle * armSwing + handGesture * 0.5, 0, 0.12);
          this.shoulderL.elbow.rotation.set((running ? -1.05 : -0.45) - Math.max(0, lAngle) * 0.30 + elbowGesture * 0.5, 0, 0);
          this.shoulderR.root.rotation.set(aim.rx + Math.sin(phi * 2) * 0.04, aim.ry, -0.10);
          this.shoulderR.elbow.rotation.set(-0.55 + Math.cos(phi) * 0.04, 0.12, 0);
          this.shoulderL.hand.rotation.set(0, 0, handGesture * 0.5);
          this.shoulderR.hand.rotation.set(0, 0, 0);
        } else {
          this.shoulderL.root.rotation.set(-lAngle * armSwing + handGesture * 0.4, 0, 0.12);
          this.shoulderL.elbow.rotation.set((running ? -1.10 : -0.45) - Math.max(0, lAngle) * 0.30 + elbowGesture * 0.4, 0, 0);
          this.shoulderR.root.rotation.set(-rAngle * armSwing - 0.15, -0.08, -0.14);
          this.shoulderR.elbow.rotation.set((running ? -1.10 : -0.60) - Math.max(0, rAngle) * 0.30, 0.12, 0);
          this.shoulderL.hand.rotation.set(0, 0, handGesture * 0.5);
          this.shoulderR.hand.rotation.set(0, 0, 0);
        }
        return;
      }

      // 4. Idle vivo (respiração, peso corporal, flexão alternada de joelhos/tornozelos e gesticulação)
      const w = Math.sin(t * 0.92);
      const breath = Math.sin(t * 2.1) * 0.012;
      this.pelvis.position.x = w * 0.018;
      this.pelvis.position.y = 0.82 + Math.sin(t * 2.1) * 0.005 - Math.abs(w) * 0.008;
      this.pelvis.rotation.set(0, Math.sin(t * 0.58) * 0.040, w * 0.024);

      this.spine.position.y = 0.08 + breath;
      this.spine.rotation.set(
        0.02 + Math.sin(t * 2.1 - 0.5) * 0.015 + talkSpinePitch,
        Math.sin(t * 0.48) * 0.032 + talkSpineTwist,
        -w * 0.016 + Math.sin(t * 0.72) * 0.014
      );

      const lFlex = Math.max(0, w);
      const rFlex = Math.max(0, -w);
      const lThighX = -0.04 - lFlex * 0.09;
      const rThighX = -0.04 - rFlex * 0.09;
      const lKneeX = 0.06 + lFlex * 0.15;
      const rKneeX = 0.06 + rFlex * 0.15;
      this.legL.root.rotation.set(lThighX, 0, -0.03);
      this.legL.knee.rotation.set(lKneeX, 0, 0);
      this.legL.foot.rotation.set(-(lThighX + lKneeX), 0, 0);
      this.legR.root.rotation.set(rThighX, 0, 0.03);
      this.legR.knee.rotation.set(rKneeX, 0, 0);
      this.legR.foot.rotation.set(-(rThighX + rKneeX), 0, 0);

      if (isHoldingDog) {
        const carrySway = Math.sin(t * 2.2) * 0.03 + talking * Math.sin(t * 7.5) * 0.04;
        this.shoulderL.root.rotation.set(-0.78 + carrySway, -0.22, 0.10);
        this.shoulderL.elbow.rotation.set(-0.92, 0, 0);
        this.shoulderR.root.rotation.set(-0.78 + carrySway, 0.22, -0.10);
        this.shoulderR.elbow.rotation.set(-0.92, 0, 0);
        this.shoulderL.hand.rotation.set(0, 0, 0);
        this.shoulderR.hand.rotation.set(0, 0, 0);
      } else if (isPhonePose) {
        const aim = this._getPhoneAimAngles();
        this.shoulderL.root.rotation.set(0.06 + Math.sin(t * 1.6) * 0.04 + handGesture * 1.1, 0, 0.12 + talking * 0.08);
        this.shoulderL.elbow.rotation.set(-0.28 + elbowGesture * 1.1, 0, 0);
        this.shoulderR.root.rotation.set(aim.rx + Math.sin(t * 1.3) * 0.03, aim.ry, -0.10);
        this.shoulderR.elbow.rotation.set(-0.55 + Math.cos(t * 1.4) * 0.03, 0.12, 0);
        this.shoulderL.hand.rotation.set(talking ? Math.sin(t * 8.0) * 0.16 * talking : 0, 0, handGesture * 0.7);
        this.shoulderR.hand.rotation.set(0, 0, 0);
      } else if (isUrgent) {
        // Gesticulação assimétrica e orgânica (cotovelo com atraso natural de fase, sem movimento robótico em bloco)
        const waveL = Math.sin(t * 4.4) * (0.10 + talking * 0.16);
        const waveR = Math.sin(t * 3.7 + 1.35) * (0.09 + talking * 0.14);
        const lagL = Math.sin(t * 4.4 - 0.55) * (0.08 + talking * 0.14);
        const lagR = Math.sin(t * 3.7 + 0.80) * (0.08 + talking * 0.12);
        this.shoulderL.root.rotation.set(-0.36 + waveL, -0.08, 0.16 + Math.abs(waveL) * 0.22);
        this.shoulderL.elbow.rotation.set(-0.68 - lagL * 0.85, 0.08, 0);
        this.shoulderR.root.rotation.set(-0.42 + waveR, 0.08, -0.14 - Math.abs(waveR) * 0.18);
        this.shoulderR.elbow.rotation.set(-0.62 - lagR * 0.85, -0.08, 0);
        this.shoulderL.hand.rotation.set(lagL * 0.35, 0, handGesture * 0.45);
        this.shoulderR.hand.rotation.set(lagR * 0.35, 0, -handGesture * 0.38);
      } else {
        this.shoulderL.root.rotation.set(0.08 + Math.sin(t * 1.6) * 0.04 + handGesture * 1.0, 0, 0.10 + talking * 0.08);
        this.shoulderL.elbow.rotation.set(-0.25 + elbowGesture, 0, 0);
        this.shoulderR.root.rotation.set(-0.22 + Math.cos(t * 1.5) * 0.04 - handGesture * 0.5, -0.12, -0.15 - talking * 0.04);
        this.shoulderR.elbow.rotation.set(-0.92 + elbowGesture * 0.6, 0.18, 0);
        this.shoulderL.hand.rotation.set(talking ? Math.sin(t * 8.4) * 0.18 * talking : 0, 0, handGesture * 0.6);
        this.shoulderR.hand.rotation.set(0, 0, -handGesture * 0.35);
      }
    }
  }

  global.VoceMorador3D = VoceMorador3D;
})(typeof window !== 'undefined' ? window : this);
