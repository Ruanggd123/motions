/**
 * Ep08CocoPraia3D.js -- Ep 08: O Coco Duro da Praia! (Comedia In Media Res + Distorcao Cartoon 3D!)
 * Usa window.CartoonDistort3D para:
 * - B1a/B1b: Fisheye extremo FOV 82° na Camila gritando -> chicote pro Voce com cabeca gigante (1.48x) em panico (placa oculta!)
 * - B2: Whip-dolly reveal do quiosque de praia ensolarado + placa "QUIOSQUE DA PRAIA · ÁGUA DE COCO" + Voce amassado (floorY=0) segurando canudinho rosa contra coco gigante no banquinho!
 * - B3: Peito estufado (1.20x) com marreta de madeira -> joelhos gelatina + bracos de borracha + suor + Easter Egg do caranguejo de oculos escuros saindo do balde e batendo pincas!
 * - B4: Fisheye suspense FOV 76° mostrando coco bamboleando na borda do banquinho + Camila com cabeca gigante (1.42x) em panico abaixo da placa desobstruida!
 * - B5: Hitstop flinch -> marreta erra o banquinho -> coco gigante da fly-by na lente, racha ao meio, explosao de 32 puffs de agua turquesa/branca + metade do coco pousa na cabeca do Voce como capacete!
 * - B6: Fisheye roast FOV 80° do Voce de capacete de coco enquanto Camila gargalha em squash-bounce atras!
 *
 * Garantias tecnicas:
 * - ZERO Pacoca.
 * - Pes 100% ancorados no piso via CartoonDistort3D.footAnchoredSquash (voceFootY == 0, camilaFootY == 0).
 * - Prop segurado com y <= 0.815 (<= 0.83).
 * - Placa "QUIOSQUE DA PRAIA · ÁGUA DE COCO" oculta em B1 e 100% nitida/desobstruida em B2..B6.
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function smoothstep(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  const VOCE_GROUND_Y = -0.37;
  const CAMILA_GROUND_Y = -0.27;
  const STOOL_POS = { x: 0.24, y: 0.56, z: 0.22 };
  const BUCKET_POS = { x: -1.04, y: 0.0, z: -0.78 };

  class Ep08CocoPraia3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado');
      this.T = T;
      this.fastTest = Boolean(opts.fastTest);
      this.width = this.fastTest ? 270 : (opts.highRes ? 1080 : 720);
      this.height = this.fastTest ? 480 : (opts.highRes ? 1920 : 1280);

      this._handRWorld = new T.Vector3();
      this._headWorld = new T.Vector3();
      this._headQuat = new T.Quaternion();

      this.webglCanvas = document.createElement('canvas');
      this.webglCanvas.width = this.width;
      this.webglCanvas.height = this.height;

      this.renderer = new T.WebGLRenderer({
        canvas: this.webglCanvas,
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true
      });
      this.renderer.setSize(this.width, this.height, false);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = T.PCFShadowMap;
      this.renderer.toneMapping = T.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.18;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x7dd3fc);
      this.scene.fog = new T.FogExp2(0xbae6fd, 0.012);

      this.camera = new T.PerspectiveCamera(44, 1080 / 1920, 0.08, 140);

      this._initLights(T);
      this._buildBeachKiosk3D(T);
      this._initCharacters3D(T);
      this._buildParticles(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP08_COCO_TIMELINE ? global.EP08_COCO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 7.6, 12.0, 16.5, 20.8, 24.8];
    }

    _getB1ReplyTime(b) {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.dialogues) && tl.dialogues.length >= 2 && tl.dialogues[1].beat_idx === 0) {
        return tl.dialogues[1].start;
      }
      return b[0] + Math.max(2.2, (b[1] - b[0]) * 0.54);
    }

    _getDialogueState(time) {
      const tl = this._getTimeline();
      if (!tl || !Array.isArray(tl.dialogues)) return { speaker: null, lip: 0 };
      for (let i = 0; i < tl.dialogues.length; i++) {
        const d = tl.dialogues[i];
        if (time >= d.start && time <= d.end && Array.isArray(d.lip_sync) && d.lip_sync.length > 0) {
          const idx = clamp(Math.floor((time - d.start) * 60), 0, d.lip_sync.length - 1);
          return { speaker: d.speaker, lip: d.lip_sync[idx] || 0 };
        }
      }
      return { speaker: null, lip: 0 };
    }

    _initLights(T) {
      this.scene.add(new T.AmbientLight(0xfffbeb, 1.02));
      const hemi = new T.HemisphereLight(0x7dd3fc, 0xfde68a, 0.92);
      hemi.position.set(0, 14, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 2.15);
      sun.position.set(4.8, 10.5, 6.8);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -6.0; sun.shadow.camera.right = 6.0;
      sun.shadow.camera.top = 6.0; sun.shadow.camera.bottom = -6.0;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      const rim = new T.DirectionalLight(0x38bdf8, 0.55);
      rim.position.set(-4.5, 4.2, -3.5);
      this.scene.add(rim);
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 680;
      c.height = 180;
      const g = c.getContext('2d');
      g.fillStyle = '#78350f';
      g.fillRect(0, 0, 680, 180);
      g.strokeStyle = '#facc15';
      g.lineWidth = 12;
      g.strokeRect(8, 8, 664, 164);
      g.fillStyle = '#fef08a';
      g.font = '900 42px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 340, 76);
      g.fillStyle = '#22d3ee';
      g.font = '900 36px "Segoe UI", sans-serif';
      g.fillText(subtitle, 340, 134);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildPalmTree(T, x, z, leanRotZ, scaleMul) {
      const palm = new T.Group();
      palm.position.set(x, 0, z);
      palm.scale.setScalar(scaleMul);

      const trunkMat = new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 });
      const leafMat = new T.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55, side: T.DoubleSide });
      const cocoMat = new T.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 });

      const segments = 7;
      let curY = 0;
      let curX = 0;
      for (let i = 0; i < segments; i++) {
        const rBot = 0.14 - i * 0.012;
        const rTop = 0.125 - i * 0.012;
        const seg = new T.Mesh(new T.CylinderGeometry(rTop, rBot, 0.52, 10), trunkMat);
        seg.position.set(curX, curY + 0.25, 0);
        seg.rotation.z = leanRotZ * (i + 1) * 0.18;
        seg.castShadow = true;
        palm.add(seg);
        curX -= Math.sin(seg.rotation.z) * 0.46;
        curY += Math.cos(seg.rotation.z) * 0.46;
      }

      const crown = new T.Group();
      crown.position.set(curX, curY, 0);
      for (let f = 0; f < 6; f++) {
        const frond = new T.Mesh(new T.BoxGeometry(0.32, 0.03, 1.35), leafMat);
        const ang = (f / 6) * Math.PI * 2;
        frond.position.set(Math.sin(ang) * 0.62, -0.05, Math.cos(ang) * 0.62);
        frond.rotation.y = ang;
        frond.rotation.x = 0.38;
        frond.castShadow = true;
        crown.add(frond);
      }
      for (let c = 0; c < 3; c++) {
        const coco = new T.Mesh(new T.SphereGeometry(0.10, 10, 8), cocoMat);
        const ang = (c / 3) * Math.PI * 2;
        coco.position.set(Math.sin(ang) * 0.14, -0.10, Math.cos(ang) * 0.14);
        crown.add(coco);
      }
      palm.add(crown);
      this.scene.add(palm);
      return crown;
    }

    _buildBeachKiosk3D(T) {
      // 1. Piso de areia dourada em y = 0.00
      const sand = new T.Mesh(
        new T.PlaneGeometry(36, 36),
        new T.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.92, metalness: 0.02 })
      );
      sand.rotation.x = -Math.PI / 2;
      sand.receiveShadow = true;
      this.scene.add(sand);

      // 2. Oceano turquesa + ondas de espuma branca ao fundo
      const ocean = new T.Mesh(
        new T.PlaneGeometry(42, 18),
        new T.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.26, metalness: 0.12 })
      );
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.set(0, 0.015, -11.5);
      this.scene.add(ocean);

      this.foamWave = new T.Mesh(
        new T.BoxGeometry(28, 0.035, 0.55),
        new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe0f2fe, emissiveIntensity: 0.25, roughness: 0.4 })
      );
      this.foamWave.position.set(0, 0.022, -3.45);
      this.scene.add(this.foamWave);

      const sunGlow = new T.Mesh(
        new T.SphereGeometry(1.15, 18, 14),
        new T.MeshBasicMaterial({ color: 0xfef08a })
      );
      sunGlow.position.set(3.8, 6.8, -16.0);
      this.scene.add(sunGlow);

      // 3. Palmeiras balancando na brisa (posicionadas fora da placa do quiosque)
      this.palmCrownL = this._buildPalmTree(T, -3.35, -3.20, 0.14, 1.00);
      this.palmCrownR = this._buildPalmTree(T, 2.55, -2.85, 0.24, 0.95);

      // 4. Guarda-sol listrado colorido na direita
      const umb = new T.Group();
      umb.position.set(1.62, 0.0, -1.35);
      const pole = new T.Mesh(
        new T.CylinderGeometry(0.032, 0.032, 2.35, 10),
        new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 })
      );
      pole.position.y = 1.18;
      pole.castShadow = true;
      umb.add(pole);
      const stripeColors = [0xef4444, 0xfacc15, 0x06b6d4, 0xffffff];
      for (let w = 0; w < 8; w++) {
        const seg = new T.Mesh(
          new T.ConeGeometry(1.05, 0.42, 4, 1, false, (w / 8) * Math.PI * 2, Math.PI / 4),
          new T.MeshStandardMaterial({ color: stripeColors[w % 4], roughness: 0.55, side: T.DoubleSide })
        );
        seg.position.y = 2.28;
        seg.rotation.y = (w / 8) * Math.PI * 2;
        seg.castShadow = true;
        umb.add(seg);
      }
      this.scene.add(umb);

      // 5. Balcao de madeira do Quiosque da Praia + placa alta "QUIOSQUE DA PRAIA · ÁGUA DE COCO"
      const woodMat = new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.78 });
      const woodLight = new T.MeshStandardMaterial({ color: 0xd97706, roughness: 0.68 });
      const thatchMat = new T.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.90 });

      const kiosk = new T.Group();
      kiosk.position.set(0.05, 0.0, -2.35);
      const counter = new T.Mesh(new T.BoxGeometry(2.85, 0.95, 0.78), woodMat);
      counter.position.y = 0.475;
      counter.castShadow = true;
      counter.receiveShadow = true;
      kiosk.add(counter);

      const counterTop = new T.Mesh(new T.BoxGeometry(3.02, 0.08, 0.90), woodLight);
      counterTop.position.y = 0.98;
      counterTop.castShadow = true;
      kiosk.add(counterTop);

      [-1.25, 1.25].forEach((px) => {
        const post = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.55, 10), woodMat);
        post.position.set(px, 2.20, 0);
        post.castShadow = true;
        kiosk.add(post);
      });

      const roof = new T.Mesh(new T.ConeGeometry(2.15, 0.78, 4), thatchMat);
      roof.position.set(0, 3.72, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      kiosk.add(roof);
      this.scene.add(kiosk);

      // Placa alta "QUIOSQUE DA PRAIA · ÁGUA DE COCO" (oculta em B1, nitida e desobstruida em B2..B6!)
      const signTex = this._makeSignTexture(T, 'QUIOSQUE DA PRAIA', '· ÁGUA DE COCO ·');
      this.signBoard = new T.Mesh(
        new T.BoxGeometry(2.34, 0.58, 0.08),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.40 })
      );
      this.signBoard.position.set(0.04, 3.06, -2.02);
      this.scene.add(this.signBoard);

      // 6. Banquinho de madeira bambo (onde o coco gigante fica e escorrega em B4!)
      this.stoolGroup = new T.Group();
      this.stoolGroup.position.set(STOOL_POS.x, 0.0, STOOL_POS.z);
      const stoolSeat = new T.Mesh(new T.CylinderGeometry(0.24, 0.22, 0.06, 18), woodLight);
      stoolSeat.position.y = STOOL_POS.y - 0.03;
      stoolSeat.castShadow = true;
      stoolSeat.receiveShadow = true;
      this.stoolGroup.add(stoolSeat);
      for (let l = 0; l < 4; l++) {
        const ang = (l / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new T.Mesh(new T.CylinderGeometry(0.025, 0.020, 0.55, 8), woodMat);
        leg.position.set(Math.cos(ang) * 0.14, 0.265, Math.sin(ang) * 0.14);
        leg.rotation.z = -Math.cos(ang) * 0.12;
        leg.rotation.x = Math.sin(ang) * 0.12;
        leg.castShadow = true;
        this.stoolGroup.add(leg);
      }
      this.scene.add(this.stoolGroup);

      // 7. Balde de areia (onde mora o Caranguejo Easter Egg de oculos escuros!)
      this.sandBucket = new T.Group();
      this.sandBucket.position.set(BUCKET_POS.x, 0.0, BUCKET_POS.z);
      const bucketBody = new T.Mesh(
        new T.CylinderGeometry(0.18, 0.13, 0.28, 18),
        new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 })
      );
      bucketBody.position.y = 0.14;
      bucketBody.castShadow = true;
      this.sandBucket.add(bucketBody);
      const bucketRim = new T.Mesh(
        new T.TorusGeometry(0.18, 0.018, 8, 18),
        new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
      );
      bucketRim.rotation.x = Math.PI / 2;
      bucketRim.position.y = 0.28;
      this.sandBucket.add(bucketRim);
      this.scene.add(this.sandBucket);

      // 8. Cooler vermelho e branco na areia
      const cooler = new T.Group();
      cooler.position.set(1.22, 0.0, -0.82);
      cooler.rotation.y = -0.35;
      const cBox = new T.Mesh(
        new T.BoxGeometry(0.56, 0.36, 0.36),
        new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.38 })
      );
      cBox.position.y = 0.18;
      cBox.castShadow = true;
      cooler.add(cBox);
      const cLid = new T.Mesh(
        new T.BoxGeometry(0.59, 0.07, 0.39),
        new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.30 })
      );
      cLid.position.y = 0.39;
      cLid.castShadow = true;
      cooler.add(cLid);
      this.scene.add(cooler);

      // 9. Sombras de contato na areia y = 0.016
      const shMat = new T.MeshBasicMaterial({ color: 0x78350f, transparent: true, opacity: 0.24, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.016, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.30, -0.30, 0.26);
      this.camilaShadow = makeShadow(0.26, 0.72, -0.10);
    }

    _initCharacters3D(T) {
      // APENAS VoceMorador3D + DonaCamila3D + CocoPraia3D (ZERO Pacoca!)
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.30, VOCE_GROUND_Y, 0.26);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D({ emotion: 'alert', pose: 'idle' });
      this.camila.group.position.set(0.72, CAMILA_GROUND_Y, -0.10);
      this.camila.group.rotation.y = -0.58;
      this.scene.add(this.camila.group);

      this.cocoProp = new global.CocoPraia3D();
      this.coco = this.cocoProp;
      this.scene.add(this.cocoProp.group);
    }

    _buildParticles(T) {
      // 20 gotinhas de suor cartoon (B1b, B2, B3, B4)
      this.sweatDrops = [];
      const sweatMat = new T.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.36,
        transparent: true,
        opacity: 0.88,
        roughness: 0.12
      });
      const dropGeo = new T.SphereGeometry(0.024, 8, 6);
      for (let i = 0; i < 20; i++) {
        const d = new T.Mesh(dropGeo, sweatMat);
        d.visible = false;
        this.scene.add(d);
        this.sweatDrops.push({ mesh: d, seed: i * 0.61, side: i % 2 === 0 ? 1 : -1, arc: 0.20 + (i % 4) * 0.08 });
      }
    }

    renderAt(t) {
      const CD = global.CartoonDistort3D;
      const rawTime = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const b1ReplyT = this._getB1ReplyTime(b);
      const dlg = this._getDialogueState(rawTime);

      // 1. Reset deterministico de distorcao
      if (CD) {
        CD.resetRigDistortion(this.voce, VOCE_GROUND_Y);
        CD.resetRigDistortion(this.camila, CAMILA_GROUND_Y);
      }

      // Hitstop micro-freeze no impacto da marreta errando em B5!
      const hitT = b[4] + 0.10;
      const freezeDur = 0.17;
      const inHitstop = CD ? CD.isInHitstop(rawTime, hitT, freezeDur) : 0;
      const time = CD ? CD.hitstopTime(rawTime, hitT, freezeDur, 0.04, 0.22) : rawTime;

      // Animacao ambiente de praia (ondas e palmeiras)
      if (this.foamWave) {
        this.foamWave.position.z = -3.45 + Math.sin(time * 2.2) * 0.18;
      }
      if (this.palmCrownL) this.palmCrownL.rotation.z = Math.sin(time * 1.4) * 0.06;
      if (this.palmCrownR) this.palmCrownR.rotation.z = Math.cos(time * 1.3) * 0.06;

      // Pesos de batida
      const wB1b = smoothstep((rawTime - (b1ReplyT - 0.16)) / 0.26);
      const w12 = smoothstep((rawTime - (b[1] - 0.14)) / 0.60);
      const w23 = smoothstep((rawTime - (b[2] - 0.12)) / 0.64);
      const w34 = smoothstep((rawTime - (b[3] - 0.10)) / 0.42);
      const w45 = smoothstep((rawTime - (b[4] - 0.08)) / 0.46);
      const w56 = smoothstep((rawTime - (b[5] - 0.14)) / 0.62);

      const b3Dur = Math.max(2.0, b[3] - b[2]);
      const b4Dur = Math.max(1.8, b[4] - b[3]);
      const b5Dur = Math.max(2.4, b[5] - b[4]);

      const b1bPop = wB1b * (1 - w12);
      const b2SquashW = w12 * (1 - w23);
      const b3PuffW = w23 * (1 - w34);
      const b3JellyW = smoothstep((time - (b[2] + Math.min(0.95, b3Dur * 0.24))) / 0.45) * (1 - w34);
      const b4W = w34 * (1 - w45);

      // B4 suspense: coco bamboleando na borda do banquinho!
      const wobblePhase = smoothstep((time - (b[3] - 0.05)) / Math.max(1.0, b4Dur * 0.65)) * (1 - w45);
      const wobbleAngle = Math.sin(time * 16.0) * 0.34 * wobblePhase;
      const wobbleSlideX = (0.11 + Math.sin(time * 12.0) * 0.04) * wobblePhase;

      // B5 desastre: fly-by + split + 32-puff splash + capacete de coco!
      const flyByProg = smoothstep((time - (b[4] + 0.14)) / Math.min(0.95, b5Dur * 0.32));
      const splitProg = smoothstep((time - (b[4] + 0.42)) / 0.38);
      const splashProg = clamp((time - (b[4] + 0.44)) / 1.35, 0, 1);
      const helmetProg = smoothstep((time - (b[4] + 0.72)) / 0.52);

      const gelatinU = clamp((time - (b[4] + 0.16)) / Math.max(1.6, b5Dur * 0.68), 0, 1);
      const gelatinWave = CD ? CD.impactBounce(gelatinU, 3.6) * (1 - w56) : 0;

      // Placa 100% oculta em B1, 100% visivel em B2..B6!
      this.signBoard.visible = w12 > 0.12;

      // 2. Posicoes horizontais dos personagens
      let voceX = lerp(-0.34, -0.30, w12);
      voceX = lerp(voceX, -0.32, w23);
      voceX = lerp(voceX, -0.30, w34);
      voceX = lerp(voceX, -0.38 + gelatinWave * 0.06, w45);
      voceX = lerp(voceX, -0.14, w56);

      let voceZ = lerp(0.56, 0.24, w12);
      voceZ = lerp(voceZ, 0.24, w23);
      voceZ = lerp(voceZ, 0.24, w34);
      voceZ = lerp(voceZ, 0.28, w45);
      voceZ = lerp(voceZ, 0.68, w56);

      let voceRotY = lerp(0.02, 0.36, w12);
      voceRotY = lerp(voceRotY, 0.30, w23);
      voceRotY = lerp(voceRotY, 0.32, w34);
      voceRotY = lerp(voceRotY, 0.10 + gelatinWave * 0.16, w45);
      voceRotY = lerp(voceRotY, 0.04, w56);

      let camPosX = lerp(0.56, 0.74, w12);
      camPosX = lerp(camPosX, 0.76, w23);
      camPosX = lerp(camPosX, 0.72, w34);
      camPosX = lerp(camPosX, 0.76, w45);
      camPosX = lerp(camPosX, 0.56, w56);

      let camPosZ = lerp(-0.10, -0.06, w12);
      camPosZ = lerp(camPosZ, -0.06, w23);
      camPosZ = lerp(camPosZ, -0.02, w34);
      camPosZ = lerp(camPosZ, 0.08, w45);
      camPosZ = lerp(camPosZ, -0.22, w56);

      let camRotY = lerp(-0.46, -0.62, w12);
      camRotY = lerp(camRotY, -0.66, w23);
      camRotY = lerp(camRotY, -0.60, w34);
      camRotY = lerp(camRotY, -0.46, w45);
      camRotY = lerp(camRotY, -0.26, w56);

      this.voce.group.position.set(voceX, VOCE_GROUND_Y, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voceShadow.position.set(voceX, 0.016, voceZ + 0.02);

      this.camila.group.position.set(camPosX, CAMILA_GROUND_Y, camPosZ);
      this.camila.group.rotation.y = camRotY;
      this.camilaShadow.position.set(camPosX, 0.016, camPosZ + 0.02);

      // Banquinho bamboleia em B4 e cai levemente em B5
      if (this.stoolGroup) {
        this.stoolGroup.rotation.z = -wobbleAngle * 0.25 + w45 * 0.18 * (1 - w56);
      }

      // 3. Camera + Fisheye Meme (FOV 82° em B1, FOV 76° em B4, FOV 80° em B6)
      const breathCam = Math.sin(rawTime * 1.6) * 0.010;
      const crashShakeX = inHitstop > 0 ? Math.sin(rawTime * 88.0) * 0.028 : 0;
      const crashShakeY = inHitstop > 0 ? Math.cos(rawTime * 80.0) * 0.022 : 0;

      // B1a: Fisheye FOV 82° colado na Camila gritando!
      let camX = 0.26 + Math.sin(rawTime * 4.2) * 0.016;
      let camY = 1.24 + Math.cos(rawTime * 3.8) * 0.010;
      let camZ = 0.64;
      let lookX = 0.54;
      let lookY = 1.20;
      let lookZ = -0.10;
      let fov = CD ? CD.fisheyePulse(46, 82, smoothstep(rawTime / 0.28)) : 82;

      // B1b: Whip fisheye FOV 82° na cabeca gigante em panico do Voce!
      camX = lerp(camX, -0.34 + Math.sin(rawTime * 10.0) * 0.010, wB1b);
      camY = lerp(camY, 1.18 + Math.cos(rawTime * 8.0) * 0.008, wB1b);
      camZ = lerp(camZ, 1.44, wB1b);
      lookX = lerp(lookX, -0.34, wB1b);
      lookY = lerp(lookY, 1.14, wB1b);
      lookZ = lerp(lookZ, 0.56, wB1b);
      fov = lerp(fov, 82.0, wB1b);

      // B2: Whip-dolly reveal da praia, placa e Voce esmagado com canudinho!
      camX = lerp(camX, 0.06, w12);
      camY = lerp(camY, 1.42 + breathCam, w12);
      camZ = lerp(camZ, 4.92, w12);
      lookX = lerp(lookX, 0.04, w12);
      lookY = lerp(lookY, 1.18, w12);
      lookZ = lerp(lookZ, -0.45, w12);
      fov = lerp(fov, 48.0, w12);

      // B3: Push-in no peito estufado + joelhos gelatina + caranguejo no balde!
      camX = lerp(camX, -0.06, w23);
      camY = lerp(camY, 1.38 + breathCam, w23);
      camZ = lerp(camZ, 4.58, w23);
      lookX = lerp(lookX, -0.04, w23);
      lookY = lerp(lookY, 1.16, w23);
      lookZ = lerp(lookZ, -0.24, w23);
      fov = lerp(fov, 48.0, w23);

      // B4: Fisheye suspense FOV 76° no coco bamboleando + Camila com cabeca gigante!
      camX = lerp(camX, 0.26, w34);
      camY = lerp(camY, 1.24 + breathCam, w34);
      camZ = lerp(camZ, 2.95, w34);
      lookX = lerp(lookX, 0.28, w34);
      lookY = lerp(lookY, 1.12, w34);
      lookZ = lerp(lookZ, -0.10, w34);
      fov = lerp(fov, CD ? CD.fisheyePulse(48.0, 76.0, w34) : 76.0, w34);

      // B5: Plano aberto com shake: marreta erra, coco da fly-by + explosao de agua + capacete!
      camX = lerp(camX, 0.06 + crashShakeX, w45);
      camY = lerp(camY, 1.36 + breathCam + crashShakeY, w45);
      camZ = lerp(camZ, 4.88, w45);
      lookX = lerp(lookX, 0.06, w45);
      lookY = lerp(lookY, 1.16, w45);
      lookZ = lerp(lookZ, -0.06, w45);
      fov = lerp(fov, 49.0, w45);

      // B6: Fisheye roast FOV 80° do Voce de capacete de coco + Camila gargalhando atras!
      camX = lerp(camX, 0.02, w56);
      camY = lerp(camY, 1.24 + breathCam, w56);
      camZ = lerp(camZ, 2.24, w56);
      lookX = lerp(lookX, 0.02, w56);
      lookY = lerp(lookY, 1.18, w56);
      lookZ = lerp(lookZ, 0.14, w56);
      fov = lerp(fov, CD ? CD.fisheyePulse(49.0, 80.0, w56) : 80.0, w56);

      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // 4. Voce: Expressoes, Lip-Sync, Pose e Distorcao Cartoon
      let voceEmotion = 'shocked';
      if (rawTime < b[1]) voceEmotion = 'shocked';
      else if (rawTime < b[2]) voceEmotion = 'determined';
      else if (rawTime < b[3]) voceEmotion = (rawTime < b[2] + 1.25) ? 'smirk' : 'determined';
      else if (rawTime < b[5]) voceEmotion = 'shocked';
      else voceEmotion = (rawTime < b[5] + 2.2) ? 'smirk' : 'happy';

      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');

      const voceLookYaw = (b1bPop > 0.3 || w56 > 0.45) ? 0.0 : 0.25 * w12;
      const voceLookPitch = (b1bPop > 0.3 || w56 > 0.45) ? 0.0 : -0.12 * w12;
      this.voce.setLook(voceLookYaw, voceLookPitch);
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0.05);
      this.voce.update(1 / 60, time);

      // Agachamento / joelhos gelatina
      const squatDepth = b2SquashW * 0.68 + b3JellyW * 0.52 + b4W * 0.36;
      const kneeJellyAmp = b2SquashW * 0.14 + b3JellyW * 0.30 + b4W * 0.14;
      if (CD && squatDepth > 0.01) {
        CD.deepSquatLegs(this.voce, squatDepth, kneeJellyAmp, time);
      }

      // Peito estufado 1.20x em B3!
      if (this.voce.spine) {
        const egoChest = 1.0 + 0.20 * b3PuffW;
        this.voce.spine.scale.set(egoChest, 1.0 + 0.06 * b3PuffW, egoChest);
        this.voce.spine.rotation.z += 0.26 * gelatinWave;
      }

      // Braco direito segurando canudinho (B2) ou marreta (B3..B5) com y <= 0.815!
      const holdPropW = clamp(w12 * (1 - w56), 0, 1);
      if (holdPropW > 0.01 && this.voce.shoulderR && this.voce.shoulderL) {
        const swingDown = w45 * 0.65;
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -0.78 + swingDown, holdPropW);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, -0.92, holdPropW);
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, -0.55, holdPropW);
      }

      if (CD) {
        const voceSy =
          1.0
          + 0.04 * b1bPop
          - 0.28 * b2SquashW
          + 0.10 * b3PuffW * (1 - b3JellyW * 0.6)
          - 0.24 * gelatinWave
          - 0.08 * w56;
        const voceBoost = 1.0 + 0.14 * b2SquashW + 0.10 * b3PuffW + 0.05 * Math.abs(gelatinWave);
        const voceLeanZ = clamp(0.16 * gelatinWave + Math.sin(time * 18.0) * 0.04 * b2SquashW, -0.22, 0.22);
        const voceLeanX = clamp(0.05 * w56, -0.12, 0.12);
        CD.footAnchoredSquash(this.voce.group, VOCE_GROUND_Y, voceSy, voceBoost, voceLeanZ, voceLeanX, 0);

        const voceHeadScale =
          1.0
          + 0.48 * b1bPop
          + 0.24 * b2SquashW
          + 0.16 * b3PuffW
          + 0.22 * b4W
          + 0.36 * w45 * (1 - w56)
          + 0.42 * w56;
        const voceHeadStretch = 1.0 + 0.08 * b1bPop - 0.08 * b2SquashW + 0.10 * gelatinWave;
        const voceHeadTilt = Math.sin(time * 18.0) * 0.06 * b2SquashW + 0.16 * gelatinWave - 0.05 * w56;
        const voceHeadJitter = 0.07 * b1bPop + 0.05 * b3JellyW + 0.06 * b4W;
        CD.headPop(this.voce.headGroup, voceHeadScale, voceHeadStretch, voceHeadTilt, voceHeadJitter, rawTime);

        const armLen = 1.0 + 0.20 * b3JellyW + 0.18 * w45 * (1 - w56);
        const armWob = 0.14 * b3JellyW + 0.16 * Math.abs(gelatinWave);
        CD.armRubberStretch(this.voce.shoulderL, this.voce.shoulderL.elbow, armLen, armWob, rawTime);
        CD.armRubberStretch(this.voce.shoulderR, this.voce.shoulderR.elbow, armLen, -armWob, rawTime);
      }

      // 5. Camila: B1a gritando -> B2/B3 zoando -> B4 horror cabeca 1.42x -> B5 choque -> B6 gargalhada squash-bounce!
      let camilaEmotion = 'alert';
      if (rawTime < b[2]) camilaEmotion = 'alert';
      else if (rawTime < b[3]) camilaEmotion = 'happy';
      else if (rawTime < b[5]) camilaEmotion = 'scared';
      else camilaEmotion = 'happy';

      this.camila.setEmotion(camilaEmotion);
      const camilaHorrorW = b4W;
      const camilaShock5 = w45 * (1 - w56);
      this.camila.setLook(w56 > 0.4 ? Math.sin(rawTime * 5.2) * 0.16 : -0.22 * w12, -0.14 * camilaHorrorW);
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : (w56 > 0.25 ? 0.28 : 0.05));
      this.camila.update(1 / 60, time);

      if (CD) {
        const b1aW = 1 - wB1b;
        const laughWave = Math.sin(rawTime * 9.0);
        const camSy = 1.0 + 0.08 * b1aW + 0.14 * camilaHorrorW + 0.12 * camilaShock5 + laughWave * 0.14 * w56;
        CD.footAnchoredSquash(this.camila.group, CAMILA_GROUND_Y, camSy, 1.02, 0.06 * b1aW, 0, 0);

        const camHeadScale = 1.0 + 0.42 * b1aW + 0.42 * camilaHorrorW + 0.34 * camilaShock5 + 0.24 * w56;
        CD.headPop(this.camila.headGroup, camHeadScale, 1.08, 0.08 * b1aW - 0.08 * camilaHorrorW, 0.06 * b1aW + 0.07 * camilaHorrorW, rawTime);
      }

      // 6. Atualizar matrices e posicionar CocoPraia3D (canudinho / marreta / coco / splash / capacete / caranguejo)
      this.voce.group.updateMatrixWorld(true);
      this.voce.shoulderR.hand.getWorldPosition(this._handRWorld);
      this._headWorld.set(0, 0.135, -0.01).applyMatrix4(this.voce.headGroup.matrixWorld);
      this.voce.headGroup.getWorldQuaternion(this._headQuat);

      const malletDropped = rawTime >= (b[4] + 0.50);
      const propPos = malletDropped
        ? { x: 0.42, y: 0.088, z: 0.52 }
        : {
            x: this._handRWorld.x,
            y: Math.min(0.815, this._handRWorld.y),
            z: this._handRWorld.z + 0.04
          };

      const helmetTarget = {
        x: this._headWorld.x,
        y: this._headWorld.y,
        z: this._headWorld.z
      };

      this.cocoProp.update(time, {
        showCoconut: w12 > 0.12,
        stoolPos: STOOL_POS,
        wobbleAngle: wobbleAngle,
        wobbleSlideX: wobbleSlideX,
        flyByProg: flyByProg,
        splitProg: splitProg,
        splashProg: splashProg,
        splashOrigin: { x: voceX + 0.10, y: 1.15, z: voceZ + 0.15 },
        helmetProg: helmetProg,
        helmetTarget: helmetTarget,
        helmetQuat: this._headQuat,
        helmetScale: this.voce.headGroup.scale.x * 0.92,
        helmetYaw: voceRotY,
        showStraw: w12 > 0.15 && w23 < 0.5,
        showMallet: w23 >= 0.5 && w56 < 0.3,
        malletDropped: malletDropped,
        propPos: propPos,
        propRotY: malletDropped ? 0.55 : voceRotY,
        malletRotX: 0.25 + w45 * 1.15,
        crabPop: clamp(w23, 0, 1),
        bucketPos: BUCKET_POS
      });

      // 7. Gotinhas de suor cartoon
      const sweatPower = clamp(b1bPop * 0.9 + b2SquashW * 0.9 + b3JellyW * 1.1 + b4W * 0.8, 0, 1);
      const showSweat = sweatPower > 0.12;
      for (let i = 0; i < this.sweatDrops.length; i++) {
        const sd = this.sweatDrops[i];
        sd.mesh.visible = showSweat;
        if (showSweat) {
          const cyc = (rawTime * 2.3 + sd.seed) % 1;
          sd.mesh.position.set(
            voceX + sd.side * (0.14 + cyc * 0.42),
            1.14 + Math.sin(cyc * Math.PI) * sd.arc - cyc * 0.36,
            voceZ + 0.12 + Math.cos(sd.seed * 7) * cyc * 0.18
          );
          sd.mesh.scale.setScalar((0.60 + (1 - cyc) * 0.85) * sweatPower);
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep08CocoPraia3D = Ep08CocoPraia3D;
})(typeof window !== 'undefined' ? window : globalThis);
