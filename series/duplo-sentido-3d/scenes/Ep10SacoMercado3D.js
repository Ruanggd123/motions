/**
 * Ep10SacoMercado3D.js -- Ep 10: O Saco Pesado do Mercado! (Comedia In Media Res + Distorcao Cartoon 3D!)
 * Usa window.CartoonDistort3D para:
 * - B1a/B1b: Fisheye extremo FOV 82° na Camila gritando -> chicote pro Voce com cabeca gigante (1.48x) em panico (placa oculta!)
 * - B2: Whip-dolly reveal do corredor ensolarado de supermercado + placa "MERCADINHO DO BAIRRO · PROMOÇÃO" + Voce em agachamento sanfona (floorY=0) segurando saco de papel gigante estufado!
 * - B3: Peito estufado (1.20x) + joelhos gelatina + bracos de borracha + suor + Easter Egg do Abacaxi de oculos escuros pulando no carrinho de compras!
 * - B4: Fisheye suspense FOV 76° no fundo do saco rasgando + Camila com cabeca gigante (1.42x) gritando abaixo da placa desobstruida!
 * - B5: Hitstop flinch -> fundo rasga de vez -> melancia da fly-by na lente + meloes/laranjas rolando + refrigerante 2L espumando + chapeu de saco rasgado pousa na cabeca do Voce!
 * - B6: Fisheye roast FOV 80° do Voce de chapeu de saco rasgado enquanto Camila gargalha em squash-bounce atras!
 *
 * Garantias tecnicas:
 * - ZERO Pacoca.
 * - Pes 100% ancorados no piso via CartoonDistort3D.footAnchoredSquash (voceFootY == 0, camilaFootY == 0).
 * - Saco segurado com bagGroup.y <= 0.83 (clamp 0.815).
 * - Placa "MERCADINHO DO BAIRRO · PROMOÇÃO" oculta em B1 e 100% nitida/desobstruida em B2..B6.
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
  const CART_POS = { x: -1.04, y: 0.0, z: -0.78 };

  class Ep10SacoMercado3D {
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
      this.renderer.toneMappingExposure = 1.16;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0xfef9c3);
      this.scene.fog = new T.FogExp2(0xfef3c7, 0.010);

      this.camera = new T.PerspectiveCamera(44, 1080 / 1920, 0.08, 140);

      this._initLights(T);
      this._buildSupermarketAisle3D(T);
      this._initCharacters3D(T);
      this._buildParticles(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP10_MERCADO_TIMELINE ? global.EP10_MERCADO_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 7.6, 11.8, 16.2, 20.6, 24.4];
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
      this.scene.add(new T.AmbientLight(0xfffbeb, 1.08));
      const hemi = new T.HemisphereLight(0xfffef0, 0xfde68a, 0.90);
      hemi.position.set(0, 12, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 2.05);
      sun.position.set(4.2, 10.5, 6.5);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -6.0; sun.shadow.camera.right = 6.0;
      sun.shadow.camera.top = 6.0; sun.shadow.camera.bottom = -6.0;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      const rim = new T.DirectionalLight(0x38bdf8, 0.45);
      rim.position.set(-4.5, 4.2, -3.5);
      this.scene.add(rim);
    }

    _makeTileTexture(T) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const g = c.getContext('2d');
      g.fillStyle = '#f8fafc';
      g.fillRect(0, 0, 512, 512);
      const step = 128;
      for (let y = 0; y < 512; y += step) {
        for (let x = 0; x < 512; x += step) {
          const alt = ((x / step) + (y / step)) % 2 === 0;
          g.fillStyle = alt ? '#ffffff' : '#f1f5f9';
          g.fillRect(x + 3, y + 3, step - 6, step - 6);
        }
      }
      g.strokeStyle = '#cbd5e1';
      g.lineWidth = 4;
      for (let i = 0; i <= 512; i += step) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
      }
      const tex = new T.CanvasTexture(c);
      tex.wrapS = T.RepeatWrapping;
      tex.wrapT = T.RepeatWrapping;
      tex.repeat.set(14, 14);
      tex.needsUpdate = true;
      return tex;
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 720;
      c.height = 180;
      const g = c.getContext('2d');
      g.fillStyle = '#b91c1c';
      g.fillRect(0, 0, 720, 180);
      g.strokeStyle = '#facc15';
      g.lineWidth = 12;
      g.strokeRect(8, 8, 704, 164);
      g.fillStyle = '#ffffff';
      g.font = '900 40px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 360, 76);
      g.fillStyle = '#fde047';
      g.font = '900 36px "Segoe UI", sans-serif';
      g.fillText(subtitle, 360, 134);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildShelfUnit(T, x, z, faceDir) {
      const shelf = new T.Group();
      shelf.position.set(x, 0, z);

      const frameMat = new T.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.45 });
      const backMat = new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
      const tagMat = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });

      // Painel traseiro da gondola
      const back = new T.Mesh(new T.BoxGeometry(0.10, 2.35, 3.60), backMat);
      back.position.set(-faceDir * 0.24, 1.18, 0);
      back.receiveShadow = true;
      shelf.add(back);

      // 4 prateleiras coloridas
      const levels = [0.22, 0.78, 1.34, 1.90];
      const boxColors = [0xef4444, 0xfacc15, 0x3b82f6, 0x22c55e, 0xf97316, 0xa855f7];
      levels.forEach((ly, li) => {
        const plank = new T.Mesh(new T.BoxGeometry(0.54, 0.045, 3.60), frameMat);
        plank.position.set(0, ly, 0);
        plank.castShadow = true;
        plank.receiveShadow = true;
        shelf.add(plank);

        const strip = new T.Mesh(new T.BoxGeometry(0.02, 0.042, 3.60), tagMat);
        strip.position.set(faceDir * 0.27, ly, 0);
        shelf.add(strip);

        // Caixas de cereal, suco e frutas sobre a prateleira
        for (let b = 0; b < 9; b++) {
          const bz = -1.52 + b * 0.38;
          const bw = 0.20 + ((b + li) % 2) * 0.06;
          const bh = 0.26 + ((b * 3 + li) % 3) * 0.06;
          const col = boxColors[(b + li * 2) % boxColors.length];
          const prod = new T.Mesh(
            new T.BoxGeometry(0.22, bh, bw),
            new T.MeshStandardMaterial({ color: col, roughness: 0.45 })
          );
          prod.position.set(faceDir * 0.04, ly + 0.022 + bh * 0.5, bz);
          prod.castShadow = true;
          shelf.add(prod);
        }
      });

      this.scene.add(shelf);
    }

    _buildShoppingCart(T) {
      this.cartGroup = new T.Group();
      this.cartGroup.name = 'ShoppingCart';
      this.cartGroup.position.set(CART_POS.x, 0, CART_POS.z);
      this.cartGroup.rotation.y = 0.42;

      const chromeMat = new T.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.85 });
      const redMat = new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.38 });
      const wheelMat = new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });

      // Base + rodinhas
      const base = new T.Mesh(new T.BoxGeometry(0.56, 0.04, 0.84), chromeMat);
      base.position.y = 0.14;
      this.cartGroup.add(base);

      [[-0.24, -0.36], [0.24, -0.36], [-0.24, 0.36], [0.24, 0.36]].forEach(([wx, wz]) => {
        const wheel = new T.Mesh(new T.CylinderGeometry(0.065, 0.065, 0.035, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.065, wz);
        this.cartGroup.add(wheel);
      });

      // Hastes de apoio
      [[-0.22, -0.30], [0.22, -0.30]].forEach(([px, pz]) => {
        const post = new T.Mesh(new T.CylinderGeometry(0.020, 0.020, 0.48, 8), chromeMat);
        post.position.set(px, 0.38, pz);
        this.cartGroup.add(post);
      });

      // Cesto vermelho + borda cromada
      const basket = new T.Mesh(new T.BoxGeometry(0.56, 0.36, 0.78), redMat);
      basket.position.set(0, 0.68, 0.02);
      basket.castShadow = true;
      basket.receiveShadow = true;
      this.cartGroup.add(basket);

      const rim = new T.Mesh(new T.BoxGeometry(0.59, 0.04, 0.81), chromeMat);
      rim.position.set(0, 0.87, 0.02);
      this.cartGroup.add(rim);

      // Barra de empurrar vermelha
      const handle = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 0.58, 10), redMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, 0.96, -0.44);
      this.cartGroup.add(handle);

      this.scene.add(this.cartGroup);
    }

    _buildSupermarketAisle3D(T) {
      // 1. Piso de porcelanato polido brilhante em y = 0.00
      const floorTex = this._makeTileTexture(T);
      const floor = new T.Mesh(
        new T.PlaneGeometry(34, 34),
        new T.MeshStandardMaterial({ map: floorTex, roughness: 0.16, metalness: 0.08 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      // 2. Parede do fundo ensolarada + claraboia luminosa
      const backWall = new T.Mesh(
        new T.PlaneGeometry(18, 9),
        new T.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.72 })
      );
      backWall.position.set(0, 4.5, -5.8);
      this.scene.add(backWall);

      const ceilingStrip = new T.Mesh(
        new T.BoxGeometry(1.6, 0.08, 9.0),
        new T.MeshBasicMaterial({ color: 0xffffff })
      );
      ceilingStrip.position.set(0, 4.9, -1.6);
      this.scene.add(ceilingStrip);

      // 3. Gondolas coloridas esquerda e direita (deixando centro aberto p/ placa!)
      this._buildShelfUnit(T, -2.05, -1.4, 1);
      this._buildShelfUnit(T, 2.05, -1.4, -1);

      // 4. Carrinho de compras vermelho e cromado (onde mora o Abacaxi Easter Egg!)
      this._buildShoppingCart(T);

      // 5. Placa alta "MERCADINHO DO BAIRRO · PROMOÇÃO" (oculta em B1, 100% nitida e desobstruida em B2..B6!)
      const signTex = this._makeSignTexture(T, 'MERCADINHO DO BAIRRO', '· PROMOÇÃO ·');
      this.signBoard = new T.Mesh(
        new T.BoxGeometry(2.42, 0.60, 0.08),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.38 })
      );
      this.signBoard.position.set(0.04, 3.06, -2.25);
      this.scene.add(this.signBoard);

      // 6. Sombras de contato no piso y = 0.012
      const shMat = new T.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.22, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.012, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.30, -0.28, 0.24);
      this.camilaShadow = makeShadow(0.26, 0.74, -0.10);
    }

    _initCharacters3D(T) {
      // APENAS VoceMorador3D + DonaCamila3D + SacoMercado3D (ZERO Pacoca!)
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.28, VOCE_GROUND_Y, 0.24);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D({ emotion: 'alert', pose: 'idle' });
      this.camila.group.position.set(0.74, CAMILA_GROUND_Y, -0.10);
      this.camila.group.rotation.y = -0.58;
      this.scene.add(this.camila.group);

      this.saco = new global.SacoMercado3D();
      this.scene.add(this.saco.group);
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

      // Hitstop micro-freeze no momento em que o fundo do saco rasga em B5!
      const hitT = b[4] + 0.10;
      const freezeDur = 0.17;
      const inHitstop = CD ? CD.isInHitstop(rawTime, hitT, freezeDur) : 0;
      const time = CD ? CD.hitstopTime(rawTime, hitT, freezeDur, 0.04, 0.22) : rawTime;

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

      // B4 suspense -> B5 rasgo total + fly-by melancia + frutas rolando + espuma + chapeu!
      const tearProg = clamp(w34 * 0.85, 0, 1);
      const ripProg = smoothstep((time - (b[4] + 0.12)) / 0.35);
      const flyByProg = smoothstep((time - (b[4] + 0.16)) / Math.min(0.95, b5Dur * 0.34));
      const spillProg = clamp((time - (b[4] + 0.18)) / 1.50, 0, 1);
      const fizzProg = clamp((time - (b[4] + 0.45)) / 1.25, 0, 1);
      const hatProg = smoothstep((time - (b[4] + 0.68)) / 0.50);

      const gelatinU = clamp((time - (b[4] + 0.16)) / Math.max(1.6, b5Dur * 0.68), 0, 1);
      const gelatinWave = CD ? CD.impactBounce(gelatinU, 3.6) * (1 - w56) : 0;

      // Placa 100% oculta em B1, 100% visivel em B2..B6!
      this.signBoard.visible = w12 > 0.12;

      // 2. Posicoes horizontais dos personagens
      let voceX = lerp(-0.34, -0.28, w12);
      voceX = lerp(voceX, -0.28, w23);
      voceX = lerp(voceX, -0.26, w34);
      voceX = lerp(voceX, -0.34 + gelatinWave * 0.06, w45);
      voceX = lerp(voceX, -0.14, w56);

      let voceZ = lerp(0.56, 0.24, w12);
      voceZ = lerp(voceZ, 0.24, w23);
      voceZ = lerp(voceZ, 0.24, w34);
      voceZ = lerp(voceZ, 0.28, w45);
      voceZ = lerp(voceZ, 0.66, w56);

      let voceRotY = lerp(0.02, 0.34, w12);
      voceRotY = lerp(voceRotY, 0.28, w23);
      voceRotY = lerp(voceRotY, 0.30, w34);
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
      this.voceShadow.position.set(voceX, 0.012, voceZ + 0.02);

      this.camila.group.position.set(camPosX, CAMILA_GROUND_Y, camPosZ);
      this.camila.group.rotation.y = camRotY;
      this.camilaShadow.position.set(camPosX, 0.012, camPosZ + 0.02);

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

      // B2: Whip-dolly reveal do corredor de supermercado, placa e Voce esmagado segurando saco gigante!
      camX = lerp(camX, 0.06, w12);
      camY = lerp(camY, 1.42 + breathCam, w12);
      camZ = lerp(camZ, 4.92, w12);
      lookX = lerp(lookX, 0.04, w12);
      lookY = lerp(lookY, 1.18, w12);
      lookZ = lerp(lookZ, -0.45, w12);
      fov = lerp(fov, 48.0, w12);

      // B3: Push-in no peito estufado + joelhos gelatina + abacaxi no carrinho!
      camX = lerp(camX, -0.06, w23);
      camY = lerp(camY, 1.38 + breathCam, w23);
      camZ = lerp(camZ, 4.58, w23);
      lookX = lerp(lookX, -0.04, w23);
      lookY = lerp(lookY, 1.16, w23);
      lookZ = lerp(lookZ, -0.24, w23);
      fov = lerp(fov, 48.0, w23);

      // B4: Fisheye suspense FOV 76° no fundo do saco rasgando + Camila com cabeca gigante!
      camX = lerp(camX, 0.24, w34);
      camY = lerp(camY, 1.20 + breathCam, w34);
      camZ = lerp(camZ, 2.95, w34);
      lookX = lerp(lookX, 0.22, w34);
      lookY = lerp(lookY, 1.06, w34);
      lookZ = lerp(lookZ, -0.10, w34);
      fov = lerp(fov, CD ? CD.fisheyePulse(48.0, 76.0, w34) : 76.0, w34);

      // B5: Plano aberto com shake: saco estoura, melancia fly-by + frutas rolam + chapeu!
      camX = lerp(camX, 0.06 + crashShakeX, w45);
      camY = lerp(camY, 1.36 + breathCam + crashShakeY, w45);
      camZ = lerp(camZ, 4.88, w45);
      lookX = lerp(lookX, 0.06, w45);
      lookY = lerp(lookY, 1.16, w45);
      lookZ = lerp(lookZ, -0.06, w45);
      fov = lerp(fov, 49.0, w45);

      // B6: Fisheye roast FOV 80° do Voce de chapeu de saco rasgado + Camila gargalhando atras!
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
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0);
      this.voce.update(1 / 60, time);

      // Agachamento sanfona + joelhos gelatina
      const squatDepth = b2SquashW * 0.68 + b3JellyW * 0.54 + b4W * 0.38;
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

      // Bracos segurando o saco gigante em B2..B4 (bagGroup.y <= 0.83)
      const holdBagW = clamp(w12 * (1 - w45), 0, 1);
      if (holdBagW > 0.01 && this.voce.shoulderR && this.voce.shoulderL) {
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, -0.78, holdBagW);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, -0.88, holdBagW);
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, -0.78, holdBagW);
        this.voce.shoulderL.elbow.rotation.x = lerp(this.voce.shoulderL.elbow.rotation.x, -0.88, holdBagW);
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
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : 0);
      this.camila.update(1 / 60, time);

      if (CD) {
        const b1aW = 1 - wB1b;
        const laughWave = Math.sin(rawTime * 9.0);
        const camSy = 1.0 + 0.08 * b1aW + 0.14 * camilaHorrorW + 0.12 * camilaShock5 + laughWave * 0.14 * w56;
        CD.footAnchoredSquash(this.camila.group, CAMILA_GROUND_Y, camSy, 1.02, 0.06 * b1aW, 0, 0);

        const camHeadScale = 1.0 + 0.42 * b1aW + 0.42 * camilaHorrorW + 0.34 * camilaShock5 + 0.24 * w56;
        CD.headPop(this.camila.headGroup, camHeadScale, 1.08, 0.08 * b1aW - 0.08 * camilaHorrorW, 0.06 * b1aW + 0.07 * camilaHorrorW, rawTime);
      }

      // 6. Atualizar matrices e posicionar SacoMercado3D (saco / frutas / fly-by / fizz / chapeu / abacaxi!)
      this.voce.group.updateMatrixWorld(true);
      this.voce.shoulderR.hand.getWorldPosition(this._handRWorld);
      this._headWorld.set(0, 0.135, -0.01).applyMatrix4(this.voce.headGroup.matrixWorld);
      this.voce.headGroup.getWorldQuaternion(this._headQuat);

      const bagPos = {
        x: voceX + 0.06,
        y: Math.min(0.815, Math.max(0.54, this._handRWorld.y - 0.04)),
        z: voceZ + 0.28
      };

      const hatTarget = {
        x: this._headWorld.x,
        y: this._headWorld.y,
        z: this._headWorld.z
      };

      this.saco.update(time, {
        showBag: w12 > 0.12,
        bagPos: bagPos,
        bagRotX: 0.08 * b2SquashW - 0.10 * tearProg,
        bagRotY: voceRotY,
        bagRotZ: Math.sin(time * 14.0) * 0.04 * (b2SquashW + b3JellyW),
        tearProg: tearProg,
        ripProg: ripProg,
        flyByProg: flyByProg,
        spillProg: spillProg,
        fizzProg: fizzProg,
        fizzOrigin: { x: 0.18, y: 0.14, z: 0.72 },
        hatProg: hatProg,
        hatTarget: hatTarget,
        hatQuat: this._headQuat,
        hatScale: this.voce.headGroup.scale.x * 0.90,
        hatYaw: voceRotY,
        pineapplePop: clamp(w23, 0, 1),
        cartPos: CART_POS
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

  global.Ep10SacoMercado3D = Ep10SacoMercado3D;
})(typeof window !== 'undefined' ? window : globalThis);
