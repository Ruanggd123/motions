/**
 * Ep05MangueiraOficina3D.js -- Ep 05 Inedito: "A Mangueira da Vizinha!"
 * Cenario 3D 100% inedito: Oficina / Garagem Ensolarada de Domingo (piso de concreto ladrilhado y=0.00,
 * bancada vermelha + painel de ferramentas, carro hatchback azul coberto de espuma branca,
 * placa "OFICINA DO BAIRRO · LAVA-RAPIDO", registro vermelho de parede + carretel de mangueira amarela,
 * bolhas de sabao e particulas 3D de respingo d'agua!).
 *
 * Regras fisicas e visuais garantidas:
 * - SEM Pacoca neste episodio! Somente VoceMorador3D, DonaCamila3D e MangueiraPressao3D.
 * - Zero flutuacao: VoceMorador3D em VOCE_GROUND_Y = -0.37, DonaCamila3D em CAMILA_GROUND_Y = -0.27.
 * - Zero oclusao facial: bico/mangueira segurado na altura do peito/cintura (y ~ 0.68..0.74).
 * - Rotacao, bracos e camera C1 fluidos em 60fps: maxDelta <= 0.10 rad/frame nas articulacoes.
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
  const HOSE_ANCHOR = { x: 1.08, y: 0.86, z: -0.96 };

  class Ep05MangueiraOficina3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado');
      this.T = T;
      this.fastTest = Boolean(opts.fastTest);
      this.width = this.fastTest ? 270 : (opts.highRes ? 1080 : 720);
      this.height = this.fastTest ? 480 : (opts.highRes ? 1920 : 1280);

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
      this.renderer.toneMappingExposure = 1.15;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x7dd3fc);
      this.scene.fog = new T.FogExp2(0xe0f2fe, 0.011);

      this.camera = new T.PerspectiveCamera(40, 1080 / 1920, 0.08, 120);

      this._initLights(T);
      this._buildOficinaGaragem3D(T);
      this._initCharacters3D(T);
      this._buildParticles(T);
    }

    _getTimeline() {
      return typeof global !== 'undefined' && global.EP05_MANGUEIRA_TIMELINE ? global.EP05_MANGUEIRA_TIMELINE : null;
    }

    _getBeats() {
      const tl = this._getTimeline();
      if (tl && Array.isArray(tl.beat_starts) && tl.beat_starts.length >= 6) return tl.beat_starts;
      return [0.0, 6.775, 11.898, 17.533, 22.744, 28.377];
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
      this.scene.add(new T.AmbientLight(0xfffbeb, 0.98));
      const hemi = new T.HemisphereLight(0xbae6fd, 0xcbd5e1, 0.80);
      hemi.position.set(0, 12, 0);
      this.scene.add(hemi);

      const sun = new T.DirectionalLight(0xfff7ed, 1.95);
      sun.position.set(4.2, 9.0, 6.4);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.left = -5.5; sun.shadow.camera.right = 5.5;
      sun.shadow.camera.top = 5.5; sun.shadow.camera.bottom = -5.5;
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);
    }

    _makeSignTexture(T, title, subtitle) {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 176;
      const g = c.getContext('2d');
      g.fillStyle = '#0f172a';
      g.fillRect(0, 0, 640, 176);
      g.strokeStyle = '#facc15';
      g.lineWidth = 12;
      g.strokeRect(8, 8, 624, 160);
      g.fillStyle = '#fde047';
      g.font = '900 46px "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.fillText(title, 320, 78);
      g.fillStyle = '#38bdf8';
      g.font = '900 38px "Segoe UI", sans-serif';
      g.fillText(subtitle, 320, 136);
      const tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    _buildOficinaGaragem3D(T) {
      // 1. Piso de concreto claro ladrilhado da oficina/garagem em y = 0.00
      const ground = new T.Mesh(
        new T.PlaneGeometry(26, 26),
        new T.MeshStandardMaterial({ color: 0xdbe2ea, roughness: 0.80, metalness: 0.04 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);

      const tileGrid = new T.GridHelper(18, 26, 0x94a3b8, 0xb8c5d4);
      tileGrid.position.y = 0.002;
      this.scene.add(tileGrid);

      // Poca d'agua brilhante no piso (expande quando o jato estoura em B5!)
      this.puddleMat = new T.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.10,
        metalness: 0.25,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      this.puddle = new T.Mesh(new T.CircleGeometry(0.62, 28), this.puddleMat);
      this.puddle.rotation.x = -Math.PI / 2;
      this.puddle.position.set(0.28, 0.006, 0.05);
      this.scene.add(this.puddle);

      // 2. Estrutura da Garagem Ensolarada (parede clara ao fundo + faixas de oficina + viga no teto)
      const wallLight = new T.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
      const wallBase = new T.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.88 });
      const stripeRed = new T.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.62 });
      const stripeBlue = new T.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.62 });
      const steelDark = new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.55 });
      const steelLight = new T.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.32, metalness: 0.72 });

      // Parede de fundo da garagem (z = -3.85)
      const backWall = new T.Mesh(new T.BoxGeometry(8.5, 3.6, 0.18), wallLight);
      backWall.position.set(0, 1.8, -3.85);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const backDado = new T.Mesh(new T.BoxGeometry(8.5, 0.92, 0.20), wallBase);
      backDado.position.set(0, 0.46, -3.84);
      this.scene.add(backDado);

      const backStripeR = new T.Mesh(new T.BoxGeometry(8.5, 0.14, 0.21), stripeRed);
      backStripeR.position.set(0, 1.02, -3.83);
      this.scene.add(backStripeR);

      const backStripeB = new T.Mesh(new T.BoxGeometry(8.5, 0.10, 0.21), stripeBlue);
      backStripeB.position.set(0, 1.16, -3.83);
      this.scene.add(backStripeB);

      // Parede lateral esquerda da oficina (x = -2.45)
      const leftWall = new T.Mesh(new T.BoxGeometry(0.18, 3.4, 6.0), wallLight);
      leftWall.position.set(-2.45, 1.7, -0.95);
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);

      // Viga metalica superior + teto parcial da garagem (enquadra sem escurecer!)
      const topBeam = new T.Mesh(new T.BoxGeometry(5.6, 0.22, 0.24), steelDark);
      topBeam.position.set(0, 2.98, -2.15);
      topBeam.castShadow = true;
      this.scene.add(topBeam);

      // Pilastra direita de concreto com faixa zebrada (suporte da torneira, registro vermelho e carretel!)
      const rightPillar = new T.Mesh(new T.BoxGeometry(0.56, 3.2, 2.75), wallLight);
      rightPillar.position.set(1.52, 1.6, -2.35);
      rightPillar.castShadow = true;
      rightPillar.receiveShadow = true;
      this.scene.add(rightPillar);

      const hazardYellow = new T.Mesh(new T.BoxGeometry(0.58, 0.24, 0.60), new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.55 }));
      hazardYellow.position.set(1.52, 0.12, -1.26);
      this.scene.add(hazardYellow);

      // 3. Placa "OFICINA DO BAIRRO · LAVA-RAPIDO" na viga superior (oculta no close de B1, nitida em B2..B6!)
      const signTex = this._makeSignTexture(T, 'OFICINA DO BAIRRO', '· LAVA-RÁPIDO ·');
      const signBoard = new T.Mesh(
        new T.BoxGeometry(2.12, 0.54, 0.05),
        new T.MeshStandardMaterial({ map: signTex, roughness: 0.45 })
      );
      signBoard.position.set(0.02, 2.52, -2.12);
      this.scene.add(signBoard);

      // 4. Registro de Agua Vermelho + Tubulacao + Carretel de Mangueira Amarela na parede direita
      const pipeMat = new T.MeshStandardMaterial({ color: 0x64748b, metalness: 0.72, roughness: 0.28 });
      const brassMat = new T.MeshStandardMaterial({ color: 0xd97706, metalness: 0.78, roughness: 0.24 });
      const valveRedMat = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.34, metalness: 0.16 });
      const hoseYellowMat = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.30, metalness: 0.06 });

      const vPipe = new T.Mesh(new T.CylinderGeometry(0.028, 0.028, 1.28, 12), pipeMat);
      vPipe.position.set(1.22, 0.64, -1.08);
      this.scene.add(vPipe);

      const tapBody = new T.Mesh(new T.CylinderGeometry(0.036, 0.036, 0.16, 12), brassMat);
      tapBody.rotation.z = Math.PI / 2;
      tapBody.position.set(1.15, 1.20, -1.04);
      this.scene.add(tapBody);

      // Volante do REGISTRO VERMELHO (destaque em B4 quando Camila aponta!)
      this.wallValve = new T.Group();
      this.wallValve.position.set(1.13, 1.20, -0.96);
      this.wallValve.rotation.y = -0.35;
      const valveRim = new T.Mesh(new T.TorusGeometry(0.115, 0.022, 10, 20), valveRedMat);
      this.wallValve.add(valveRim);
      for (let s = 0; s < 4; s++) {
        const spoke = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.22, 8), valveRedMat);
        spoke.rotation.z = (s * Math.PI) / 4;
        this.wallValve.add(spoke);
      }
      const valveNut = new T.Mesh(new T.CylinderGeometry(0.030, 0.030, 0.04, 10), brassMat);
      valveNut.rotation.x = Math.PI / 2;
      this.wallValve.add(valveNut);
      this.scene.add(this.wallValve);

      // Carretel de parede com espirais de mangueira amarela grossa enrolada
      const reelGroup = new T.Group();
      reelGroup.position.set(1.18, 0.84, -1.08);
      reelGroup.rotation.y = -0.35;
      const reelPlate = new T.Mesh(new T.CylinderGeometry(0.26, 0.26, 0.04, 22), stripeBlue);
      reelPlate.rotation.x = Math.PI / 2;
      reelPlate.position.z = -0.05;
      reelGroup.add(reelPlate);

      const reelHub = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.16, 16), steelDark);
      reelHub.rotation.x = Math.PI / 2;
      reelHub.position.z = 0.02;
      reelGroup.add(reelHub);

      [0.125, 0.168, 0.212].forEach((r, idx) => {
        const coil = new T.Mesh(new T.TorusGeometry(r, 0.032, 10, 24), hoseYellowMat);
        coil.position.z = 0.015 + idx * 0.018;
        coil.castShadow = true;
        reelGroup.add(coil);
      });
      this.scene.add(reelGroup);

      // 5. Bancada Vermelha + Painel de Ferramentas (lado esquerdo da oficina, visivel em B2..B6)
      this._buildWorkbench(T, stripeRed, steelDark, steelLight);

      // 6. Carro Hatchback Azul 3D coberto de espuma branca no fundo (visivel em B2..B6)
      this._buildFoamyCar(T, steelLight);

      // 7. Sombras de contato no piso y = 0.015
      const shMat = new T.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.26, depthWrite: false });
      const makeShadow = (r, x, z) => {
        const m = new T.Mesh(new T.CircleGeometry(r, 24), shMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.015, z);
        this.scene.add(m);
        return m;
      };
      this.voceShadow = makeShadow(0.28, -0.44, 0.66);
      this.camilaShadow = makeShadow(0.26, 0.72, -0.18);
    }

    _buildWorkbench(T, redMat, steelDark, steelLight) {
      const wb = new T.Group();
      wb.position.set(-1.32, 0.0, -1.58);
      wb.rotation.y = 0.36;

      const woodMat = new T.MeshStandardMaterial({ color: 0xd97706, roughness: 0.68 });
      const handleMat = new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.78, roughness: 0.22 });

      // Gabinete vermelho de oficina com 3 gavetas
      const cabinet = new T.Mesh(new T.BoxGeometry(1.12, 0.82, 0.58), redMat);
      cabinet.position.set(0, 0.41, 0);
      cabinet.castShadow = true;
      cabinet.receiveShadow = true;
      wb.add(cabinet);

      [0.18, 0.42, 0.66].forEach((dy) => {
        const drawer = new T.Mesh(new T.BoxGeometry(0.96, 0.18, 0.03), new T.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.55 }));
        drawer.position.set(0, dy, 0.295);
        wb.add(drawer);
        const handle = new T.Mesh(new T.BoxGeometry(0.32, 0.028, 0.035), handleMat);
        handle.position.set(0, dy, 0.32);
        wb.add(handle);
      });

      // Tampo grosso de madeira
      const top = new T.Mesh(new T.BoxGeometry(1.22, 0.07, 0.66), woodMat);
      top.position.set(0, 0.855, 0);
      top.castShadow = true;
      top.receiveShadow = true;
      wb.add(top);

      // Morsa metalica azul + galao de shampoo automotivo amarelo + chave inglesa sobre a bancada
      const vise = new T.Mesh(new T.BoxGeometry(0.18, 0.14, 0.16), new T.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.55, roughness: 0.35 }));
      vise.position.set(0.38, 0.96, 0.18);
      wb.add(vise);

      const soapJug = new T.Mesh(new T.BoxGeometry(0.14, 0.24, 0.10), new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 }));
      soapJug.position.set(-0.34, 1.01, 0.06);
      wb.add(soapJug);

      const wrenchOnBench = new T.Mesh(new T.BoxGeometry(0.32, 0.025, 0.05), steelLight);
      wrenchOnBench.position.set(0.02, 0.905, 0.12);
      wrenchOnBench.rotation.y = 0.28;
      wb.add(wrenchOnBench);

      // Painel de Ferramentas (Tool Pegboard) logo acima da bancada
      const pegFrame = new T.Mesh(new T.BoxGeometry(1.18, 0.72, 0.04), redMat);
      pegFrame.position.set(0, 1.56, -0.28);
      wb.add(pegFrame);

      const pegBoard = new T.Mesh(new T.BoxGeometry(1.08, 0.62, 0.05), steelDark);
      pegBoard.position.set(0, 1.56, -0.27);
      wb.add(pegBoard);

      // Ferramentas penduradas no painel (chaves, martelo, alicate)
      [-0.36, -0.14, 0.10, 0.32].forEach((tx, idx) => {
        const shaft = new T.Mesh(new T.BoxGeometry(0.036, 0.32 + (idx % 2) * 0.08, 0.028), steelLight);
        shaft.position.set(tx, 1.56, -0.23);
        wb.add(shaft);
        const head = new T.Mesh(
          new T.BoxGeometry(idx === 1 ? 0.16 : 0.085, 0.065, 0.035),
          idx === 2 ? redMat : steelLight
        );
        head.position.set(tx, 1.72, -0.22);
        wb.add(head);
      });

      this.scene.add(wb);

      // Balde azul de lava-rapido com espuma e esponja amarela no chao ao lado da bancada
      const bucketGroup = new T.Group();
      bucketGroup.position.set(-0.96, 0.0, -0.82);
      const bucket = new T.Mesh(
        new T.CylinderGeometry(0.18, 0.14, 0.30, 18),
        new T.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.40 })
      );
      bucket.position.y = 0.15;
      bucket.castShadow = true;
      bucketGroup.add(bucket);
      const foamMat = new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.42 });
      [[-0.06, 0.31, 0.02, 0.095], [0.06, 0.32, -0.02, 0.10], [0.0, 0.35, 0.04, 0.085]].forEach(([fx, fy, fz, fr]) => {
        const fp = new T.Mesh(new T.SphereGeometry(fr, 10, 8), foamMat);
        fp.position.set(fx, fy, fz);
        bucketGroup.add(fp);
      });
      const sponge = new T.Mesh(new T.BoxGeometry(0.12, 0.055, 0.08), new T.MeshStandardMaterial({ color: 0xfde047, roughness: 0.85 }));
      sponge.position.set(0.06, 0.36, 0.05);
      sponge.rotation.set(0.15, 0.4, -0.2);
      bucketGroup.add(sponge);
      this.scene.add(bucketGroup);
    }

    _buildFoamyCar(T, chromeMat) {
      this.carGroup = new T.Group();
      this.carGroup.position.set(0.32, 0.0, -2.62);
      this.carGroup.rotation.y = -0.34;

      const paintBlue = new T.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.24, metalness: 0.28 });
      const glassMat = new T.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.14, metalness: 0.45 });
      const tireMat = new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.88 });
      const headlightMat = new T.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.25, roughness: 0.2 });
      const bumperMat = new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
      const foamMat = new T.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.46 });

      // Chassi arredondado estilo Pixar Hatchback
      const bodyLower = new T.Mesh(new T.BoxGeometry(1.56, 0.56, 2.38), paintBlue);
      bodyLower.position.set(0, 0.54, 0);
      bodyLower.castShadow = true;
      bodyLower.receiveShadow = true;
      this.carGroup.add(bodyLower);

      const cabin = new T.Mesh(new T.BoxGeometry(1.36, 0.52, 1.32), paintBlue);
      cabin.position.set(0, 1.04, -0.18);
      cabin.castShadow = true;
      this.carGroup.add(cabin);

      // Para-brisa frontal
      const windshield = new T.Mesh(new T.BoxGeometry(1.24, 0.42, 0.08), glassMat);
      windshield.position.set(0, 1.02, 0.48);
      windshield.rotation.x = -0.24;
      this.carGroup.add(windshield);

      // Para-choque + grade + farois redondos amigaveis
      const bumper = new T.Mesh(new T.BoxGeometry(1.60, 0.18, 0.14), bumperMat);
      bumper.position.set(0, 0.34, 1.20);
      this.carGroup.add(bumper);

      const grille = new T.Mesh(new T.BoxGeometry(0.62, 0.14, 0.06), chromeMat);
      grille.position.set(0, 0.54, 1.19);
      this.carGroup.add(grille);

      [-0.54, 0.54].forEach((hx) => {
        const lamp = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.06, 16), headlightMat);
        lamp.rotation.x = Math.PI / 2;
        lamp.position.set(hx, 0.58, 1.19);
        this.carGroup.add(lamp);
      });

      // 4 Rodas aterradas em y = 0.00 (raio = 0.28 -> centro em y = 0.28)
      [[-0.78, 0.72], [0.78, 0.72], [-0.78, -0.74], [0.78, -0.74]].forEach(([wx, wz]) => {
        const tire = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.20, 18), tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(wx, 0.28, wz);
        tire.castShadow = true;
        this.carGroup.add(tire);
        const rim = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.21, 14), chromeMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(wx, 0.28, wz);
        this.carGroup.add(rim);
      });

      // Montinhos fofos de ESPUMA BRANCA cobrindo metade do carro (capo, teto, para-brisa, para-lama!)
      const foamBlobs = [
        [-0.36, 0.86, 0.92, 0.22], [-0.08, 0.88, 0.98, 0.26], [0.22, 0.85, 0.88, 0.20],
        [-0.52, 0.82, 0.65, 0.21], [-0.22, 0.90, 0.62, 0.24], [0.06, 0.86, 0.58, 0.18],
        [-0.38, 1.32, 0.18, 0.24], [-0.06, 1.34, 0.06, 0.28], [0.26, 1.32, -0.10, 0.23],
        [-0.44, 1.30, -0.32, 0.22], [0.04, 1.33, -0.44, 0.24], [-0.68, 0.62, 0.86, 0.17],
        [-0.24, 1.12, 0.50, 0.16], [0.10, 1.08, 0.52, 0.14], [-0.48, 0.42, 1.22, 0.15]
      ];
      foamBlobs.forEach(([fx, fy, fz, fr]) => {
        const puff = new T.Mesh(new T.SphereGeometry(fr, 12, 10), foamMat);
        puff.scale.set(1.15, 0.72, 1.10);
        puff.position.set(fx, fy, fz);
        this.carGroup.add(puff);
      });

      this.scene.add(this.carGroup);
    }

    _initCharacters3D(T) {
      // APENAS VoceMorador3D + DonaCamila3D + MangueiraPressao3D (ZERO Pacoca neste episodio!)
      this.voce = new global.VoceMorador3D({ hasPhone: false, flashlightOn: false });
      if (this.voce.phoneGroup) this.voce.phoneGroup.visible = false;
      this.voce.group.position.set(-0.44, VOCE_GROUND_Y, 0.66);
      this.scene.add(this.voce.group);

      this.camila = new global.DonaCamila3D({ emotion: 'happy', pose: 'idle' });
      this.camila.group.position.set(0.72, CAMILA_GROUND_Y, -0.18);
      this.camila.group.rotation.y = -0.58;
      this.scene.add(this.camila.group);

      this.mangueira = new global.MangueiraPressao3D({ scale: 0.96, segments: 24, radius: 0.036 });
      this.scene.add(this.mangueira.group);
    }

    _buildParticles(T) {
      // Bolhas de sabao flutuando pela oficina/garagem (intensificam em B5 e B6!)
      this.soapBubbles = [];
      const bubbleMat = new T.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x7dd3fc,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.58,
        roughness: 0.08,
        metalness: 0.18
      });
      const bubbleGeo = new T.SphereGeometry(0.055, 12, 10);
      for (let i = 0; i < 18; i++) {
        const b = new T.Mesh(bubbleGeo, bubbleMat);
        b.visible = false;
        this.scene.add(b);
        this.soapBubbles.push({
          mesh: b,
          seed: i * 0.63,
          baseX: -0.95 + (i % 6) * 0.42,
          baseZ: -1.9 + Math.floor(i / 6) * 1.05,
          size: 0.52 + (i % 4) * 0.28
        });
      }

      // Respingos 3D de agua explodindo nos dois personagens quando o jato estoura em B5!
      this.splashDrops = [];
      const splashBlue = new T.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.30,
        transparent: true,
        opacity: 0.86,
        roughness: 0.10
      });
      const splashWhite = new T.MeshStandardMaterial({
        color: 0xf0f9ff,
        transparent: true,
        opacity: 0.84,
        roughness: 0.14
      });
      const splashGeo = new T.SphereGeometry(0.032, 8, 6);
      for (let i = 0; i < 24; i++) {
        const s = new T.Mesh(splashGeo, i % 3 === 0 ? splashWhite : splashBlue);
        s.visible = false;
        this.scene.add(s);
        this.splashDrops.push({
          mesh: s,
          seed: i * 0.89,
          targetCamila: i < 15
        });
      }
    }

    renderAt(t) {
      const time = Math.max(0, Number(t) || 0);
      const b = this._getBeats();
      const dlg = this._getDialogueState(time);

      const w12 = smoothstep((time - (b[1] - 0.15)) / 1.25);
      const w23 = smoothstep((time - (b[2] - 0.15)) / 1.15);
      const w34 = smoothstep((time - (b[3] - 0.15)) / 1.15);
      const w45 = smoothstep((time - (b[4] - 0.15)) / 1.15);
      const w56 = smoothstep((time - (b[5] - 0.15)) / 1.25);

      // Jato d'agua 3D explode no meio de B5 ("Eita! Apertei demais, molhou nos dois inteiros na oficina!")
      const triggerW = smoothstep((time - (b[4] + 1.15)) / 0.32) * (1 - smoothstep((time - (b[5] - 0.15)) / 0.45));
      const blastW = smoothstep((time - (b[4] + 1.28)) / 0.26) * (1 - smoothstep((time - (b[5] - 0.15)) / 0.50));
      const recoilW = smoothstep((time - (b[4] + 1.32)) / 0.55) * (1 - w56);

      // 1. Camera C1 super fluida (B1 close fechado no rosto do Voce -> B2 revela garagem/carro/placa!)
      const breathCam = Math.sin(time * 1.2) * 0.012;
      const blastShakeX = Math.sin(time * 22.0) * 0.014 * blastW;
      const blastShakeY = Math.cos(time * 19.0) * 0.010 * blastW;

      let camX = -0.44, camY = 1.16 + breathCam, camZ = 1.92;
      let lookX = -0.44, lookY = 1.09, lookZ = 0.62, fov = 31;

      camX = lerp(camX, 0.06, w12); camY = lerp(camY, 1.48 + breathCam, w12); camZ = lerp(camZ, 4.95, w12);
      lookX = lerp(lookX, 0.04, w12); lookY = lerp(lookY, 1.04, w12); lookZ = lerp(lookZ, -0.55, w12); fov = lerp(fov, 46, w12);

      camX = lerp(camX, -0.02, w23); camY = lerp(camY, 1.44 + breathCam, w23); camZ = lerp(camZ, 4.38, w23);
      lookX = lerp(lookX, 0.04, w23); lookY = lerp(lookY, 1.02, w23); lookZ = lerp(lookZ, -0.20, w23); fov = lerp(fov, 45, w23);

      camX = lerp(camX, 0.14, w34); camY = lerp(camY, 1.44 + breathCam, w34); camZ = lerp(camZ, 4.46, w34);
      lookX = lerp(lookX, 0.14, w34); lookY = lerp(lookY, 1.02, w34); lookZ = lerp(lookZ, -0.25, w34); fov = lerp(fov, 45, w34);

      camX = lerp(camX, 0.10 + blastShakeX, w45); camY = lerp(camY, 1.44 + breathCam + blastShakeY, w45); camZ = lerp(camZ, 4.52, w45);
      lookX = lerp(lookX, 0.12, w45); lookY = lerp(lookY, 1.02, w45); lookZ = lerp(lookZ, -0.15, w45); fov = lerp(fov, 46, w45);

      camX = lerp(camX, 0.06, w56); camY = lerp(camY, 1.44 + breathCam, w56); camZ = lerp(camZ, 4.46, w56);
      lookX = lerp(lookX, 0.06, w56); lookY = lerp(lookY, 1.02, w56); lookZ = lerp(lookZ, 0.08, w56); fov = lerp(fov, 45, w56);

      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookX, lookY, lookZ);

      // 2. Trajetorias 100% aterradas em piso solido (VOCE_GROUND_Y = -0.37, CAMILA_GROUND_Y = -0.27)
      const stepToHose = smoothstep((time - (b[2] - 0.12)) / 1.25);
      const leanToLock = smoothstep((time - (b[4] - 0.10)) / 0.95) * (1 - recoilW) * (1 - w56);
      const stepFrontCta = smoothstep((time - (b[5] - 0.15)) / 1.25);

      const voceStride =
        Math.sin(stepToHose * Math.PI) * 0.72 +
        Math.sin(recoilW * Math.PI) * 0.42 +
        Math.sin(stepFrontCta * Math.PI) * 0.65;

      let voceX = lerp(-0.44, -0.26, stepToHose);
      voceX = lerp(voceX, -0.22, leanToLock);
      voceX = lerp(voceX, -0.32, recoilW);
      voceX = lerp(voceX, -0.30, stepFrontCta);

      let voceZ = lerp(0.66, 0.10, stepToHose);
      voceZ = lerp(voceZ, 0.14, leanToLock);
      voceZ = lerp(voceZ, 0.22, recoilW);
      voceZ = lerp(voceZ, 0.40, stepFrontCta);

      let voceRotY = lerp(0.04, 0.34, w12);
      voceRotY = lerp(voceRotY, 0.48, stepToHose);
      voceRotY = lerp(voceRotY, 0.64, w34);
      voceRotY = lerp(voceRotY, 0.72, leanToLock);
      voceRotY = lerp(voceRotY, 0.56 + Math.sin(time * 9.0) * 0.08 * blastW, recoilW);
      voceRotY = lerp(voceRotY, 0.08, stepFrontCta);

      this.voce.group.position.set(voceX, VOCE_GROUND_Y, voceZ);
      this.voce.group.rotation.y = voceRotY;
      this.voceShadow.position.set(voceX, 0.015, voceZ + 0.02);

      // Camila: em B2 segura a mangueira na direita -> em B3/B4 da espaco e aponta pro bico/registro -> em B5 leva banho e recua -> em B6 ri balancando a cabeca!
      const camilaShift3 = smoothstep((time - (b[2] - 0.08)) / 1.25);
      const camilaWarn4 = smoothstep((time - (b[3] - 0.10)) / 1.20);
      const camilaSoak5 = smoothstep((time - (b[4] + 1.32)) / 0.70) * (1 - w56);

      const camilaStride =
        Math.sin(camilaShift3 * Math.PI) * 0.55 +
        Math.sin(camilaSoak5 * Math.PI) * 0.48 +
        Math.sin(stepFrontCta * Math.PI) * 0.55;

      let camPosX = lerp(0.66, 0.80, camilaShift3);
      camPosX = lerp(camPosX, 0.78, camilaWarn4);
      camPosX = lerp(camPosX, 0.90, camilaSoak5);
      camPosX = lerp(camPosX, 0.64, stepFrontCta);

      let camPosZ = lerp(-0.18, -0.10, camilaShift3);
      camPosZ = lerp(camPosZ, 0.02, camilaWarn4);
      camPosZ = lerp(camPosZ, 0.12, camilaSoak5);
      camPosZ = lerp(camPosZ, 0.28, stepFrontCta);

      let camRotY = lerp(-0.52, -0.68, camilaShift3);
      camRotY = lerp(camRotY, -0.76, camilaWarn4);
      camRotY = lerp(camRotY, -0.62, camilaSoak5);
      camRotY = lerp(camRotY, -0.26, stepFrontCta);

      this.camila.group.position.set(camPosX, CAMILA_GROUND_Y, camPosZ);
      this.camila.group.rotation.y = camRotY;
      this.camilaShadow.position.set(camPosX, 0.015, camPosZ + 0.02);

      // 3. Expressoes faciais, olhar e bracos C1 (zero tranco > 0.10 rad/frame!)
      let voceEmotion = 'smirk';
      if (time >= b[1] && time < b[2]) voceEmotion = 'shocked';
      else if (time >= b[2] && time < b[4]) voceEmotion = 'determined';
      else if (time >= b[4] && time < b[4] + 1.25) voceEmotion = 'determined';
      else if (time >= b[4] + 1.25 && time < b[5]) voceEmotion = 'shocked';
      else if (time >= b[5]) voceEmotion = 'happy';

      this.voce.isWalking = false;
      this.voce.isRunning = false;
      this.voce.setEmotion(voceEmotion);
      this.voce.setPose('gesturing_urgent');

      const voceLookYaw = w56 > 0.45 ? 0.0 : lerp(Math.sin(time * 1.8) * 0.14, 0.18, w23 * (1 - w56));
      const voceLookPitch = lerp(0.04, -0.22, leanToLock);
      this.voce.setLook(voceLookYaw, voceLookPitch);
      this.voce.setMouthOpen(dlg.speaker === 'voce' ? dlg.lip : 0.05);
      this.voce.update(1 / 60, time);

      if (voceStride > 0.005 && this.voce.legL && this.voce.legR) {
        const phi = time * 5.8;
        const amp = 0.40 * clamp(voceStride, 0, 1);
        this.voce.legL.root.rotation.x = lerp(this.voce.legL.root.rotation.x, Math.sin(phi) * amp, clamp(voceStride, 0, 1));
        this.voce.legR.root.rotation.x = lerp(this.voce.legR.root.rotation.x, Math.sin(phi + Math.PI) * amp, clamp(voceStride, 0, 1));
        this.voce.legL.knee.rotation.x = lerp(this.voce.legL.knee.rotation.x, Math.max(0.08, -Math.cos(phi) * 0.36), clamp(voceStride, 0, 1));
        this.voce.legR.knee.rotation.x = lerp(this.voce.legR.knee.rotation.x, Math.max(0.08, -Math.cos(phi + Math.PI) * 0.36), clamp(voceStride, 0, 1));
      }

      // Bracos do Voce segurando o esguicho com AS DUAS MAOS na altura do peito/cintura (y ~ 0.69..0.72, rosto 100% livre!)
      const voceHoldW = clamp(smoothstep((time - (b[2] + 0.05)) / 0.95), 0, 1);
      if (voceHoldW > 0.005 && this.voce.shoulderL && this.voce.shoulderR) {
        const pressureTremor = Math.sin(time * 14.0) * (0.022 * (1 - w56) + 0.042 * blastW);
        const targetShX = -0.66 - 0.08 * leanToLock + pressureTremor;
        const targetElbX = -0.86 + 0.06 * recoilW;
        this.voce.shoulderL.root.rotation.x = lerp(this.voce.shoulderL.root.rotation.x, targetShX, voceHoldW);
        this.voce.shoulderR.root.rotation.x = lerp(this.voce.shoulderR.root.rotation.x, targetShX, voceHoldW);
        this.voce.shoulderL.root.rotation.z = lerp(this.voce.shoulderL.root.rotation.z, 0.22, voceHoldW);
        this.voce.shoulderR.root.rotation.z = lerp(this.voce.shoulderR.root.rotation.z, -0.22, voceHoldW);
        this.voce.shoulderL.elbow.rotation.x = lerp(this.voce.shoulderL.elbow.rotation.x, targetElbX, voceHoldW);
        this.voce.shoulderR.elbow.rotation.x = lerp(this.voce.shoulderR.elbow.rotation.x, targetElbX, voceHoldW);
      }

      // Camila: emocoes, olhar, gestos de aviso pro bico/registro em B4, defesa do jato em B5, risada em B6
      let camilaEmotion = 'happy';
      if (time >= b[1] && time < b[2]) camilaEmotion = 'alert';
      else if (time >= b[3] && time < b[4] + 1.25) camilaEmotion = 'alert';
      else if (time >= b[4] + 1.25 && time < b[5]) camilaEmotion = 'scared';
      else if (time >= b[5]) camilaEmotion = 'happy';

      this.camila.setEmotion(camilaEmotion);
      const camilaHeadShake = w56 * Math.sin(time * 4.8) * 0.22;
      this.camila.setLook(
        lerp(-0.14, 0.0, w56) + camilaHeadShake,
        lerp(0.02, -0.10, camilaWarn4 * (1 - camilaSoak5))
      );
      this.camila.setMouthOpen(dlg.speaker === 'camila' ? dlg.lip : 0.05);
      this.camila.update(1 / 60, time);

      if (camilaStride > 0.005 && this.camila.legL && this.camila.legR) {
        const cphi = time * 5.6;
        this.camila.legL.root.rotation.x = lerp(this.camila.legL.root.rotation.x, Math.sin(cphi) * 0.34 * camilaStride, camilaStride);
        this.camila.legR.root.rotation.x = lerp(this.camila.legR.root.rotation.x, Math.sin(cphi + Math.PI) * 0.34 * camilaStride, camilaStride);
      }

      // Bracos da Camila: B2 segura mangueira com a esquerda e acena com a direita | B4 aponta pro bico e registro | B5 protege o rosto!
      const camilaHoldB2 = w12 * (1 - camilaShift3);
      const camilaPointB4 = camilaWarn4 * (1 - camilaSoak5) * (1 - w56);
      if (this.camila.shoulderL && this.camila.shoulderR) {
        // B2: esquerda segura o esguicho bucking, direita chama Voce!
        if (camilaHoldB2 > 0.005) {
          const buck = Math.sin(time * 11.0) * 0.06;
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -0.68 + buck, camilaHoldB2);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.82, camilaHoldB2);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.82 + Math.sin(time * 5.2) * 0.14, camilaHoldB2);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -0.65, camilaHoldB2);
        }
        // B4: aponta urgentemente pro bico da mangueira e pro registro vermelho
        if (camilaPointB4 > 0.005) {
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -0.96 + Math.sin(time * 5.5) * 0.08, camilaPointB4);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.35, camilaPointB4);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -0.85, camilaPointB4);
          this.camila.shoulderR.root.rotation.z = lerp(this.camila.shoulderR.root.rotation.z, -0.45, camilaPointB4);
        }
        // B5: joga os dois bracos pra cima/frente se protegendo do jato d'agua!
        if (camilaSoak5 > 0.005) {
          this.camila.shoulderL.root.rotation.x = lerp(this.camila.shoulderL.root.rotation.x, -1.22 + Math.sin(time * 12) * 0.08, camilaSoak5);
          this.camila.shoulderR.root.rotation.x = lerp(this.camila.shoulderR.root.rotation.x, -1.16 + Math.cos(time * 12) * 0.08, camilaSoak5);
          this.camila.shoulderL.elbow.rotation.x = lerp(this.camila.shoulderL.elbow.rotation.x, -0.92, camilaSoak5);
          this.camila.shoulderR.elbow.rotation.x = lerp(this.camila.shoulderR.elbow.rotation.x, -0.92, camilaSoak5);
        }
      }

      // 4. MangueiraPressao3D -- 100% fisicamente presa na parede (HOSE_ANCHOR) e nas maos!
      // Em B2: nas maos da Camila (y=0.72) chicoteando/vazando
      // Em B3..B6: transferida suavemente (C1) para as DUAS MAOS do Voce em y ~ 0.69..0.72 (zero oclusao facial!)
      const camHandX = camPosX + Math.sin(camRotY) * 0.28 - Math.cos(camRotY) * 0.10;
      const camHandZ = camPosZ + Math.cos(camRotY) * 0.28 + Math.sin(camRotY) * 0.10;
      const camHandY = 0.72 + Math.sin(time * 10.5) * 0.030 * camilaHoldB2;

      const voceHandX = voceX + Math.sin(voceRotY) * 0.31;
      const voceHandZ = voceZ + Math.cos(voceRotY) * 0.31;
      const voceHandY = 0.70 + Math.sin(time * 14.0) * (0.014 * (1 - w56) + 0.025 * blastW) - 0.02 * stepFrontCta;

      const nozX = lerp(camHandX, voceHandX, voceHoldW);
      const nozY = lerp(camHandY, voceHandY, voceHoldW);
      const nozZ = lerp(camHandZ, voceHandZ, voceHoldW);

      // Para onde o bico de latao aponta em cada batida:
      // B2: aponta meio pra frente-esquerda balancando | B3: aponta pro lado da oficina | B4: aponta na direcao da Camila!
      // B5: mira direto no rosto/peito da Camila (e chicoteia pra cima molhando os dois!) | B6: aponta diagonal baixo pingando
      let aimX = lerp(camHandX - 0.55, voceHandX + Math.sin(voceRotY) * 1.15, voceHoldW);
      let aimY = lerp(0.74 + Math.sin(time * 9.0) * 0.16, 0.74, voceHoldW);
      let aimZ = lerp(camHandZ + 0.45, voceHandZ + Math.cos(voceRotY) * 1.15, voceHoldW);

      // Em B4 e inicio B5 aponta claramente na direcao da Camila
      const aimAtCamilaW = clamp(w34 * (1 - w56), 0, 1);
      aimX = lerp(aimX, camPosX - 0.06, aimAtCamilaW);
      aimY = lerp(aimY, 0.88 + Math.sin(time * 13.0) * 0.18 * blastW, aimAtCamilaW);
      aimZ = lerp(aimZ, camPosZ + 0.04, aimAtCamilaW);

      // Em B6 aponta pra baixo-frente pingando de leve
      aimX = lerp(aimX, voceHandX + 0.32, stepFrontCta);
      aimY = lerp(aimY, 0.52, stepFrontCta);
      aimZ = lerp(aimZ, voceHandZ + 0.75, stepFrontCta);

      const whipAmp =
        0.55 * camilaHoldB2 +
        0.34 * voceHoldW * (1 - w45) +
        0.42 * w34 * (1 - w45) +
        0.95 * blastW +
        0.08 * stepFrontCta;

      const leakIntensity =
        0.72 * camilaHoldB2 +
        0.65 * voceHoldW * (1 - blastW) * (1 - stepFrontCta) +
        0.38 * stepFrontCta;

      this.mangueira.group.visible = time >= b[1] - 0.35;
      this.mangueira.update(time, {
        anchorPos: HOSE_ANCHOR,
        nozzlePos: { x: nozX, y: nozY, z: nozZ },
        aimPos: { x: aimX, y: aimY, z: aimZ },
        sag: lerp(0.46, 0.38, blastW),
        whipAmp,
        whipFreq: lerp(10.0, 15.5, blastW),
        triggerPull: triggerW,
        leakIntensity: clamp(leakIntensity, 0, 1),
        sprayIntensity: blastW
      });

      // Registro vermelho na parede treme levemente com a pressao da agua!
      const valveJitter = (0.35 + 0.65 * blastW) * (1 - stepFrontCta * 0.7);
      this.wallValve.rotation.z = Math.sin(time * 16.0) * 0.06 * valveJitter;

      // Poca d'agua no chao cresce quando estoura o jato em B5 e fica brilhando em B6!
      const puddleGrow = smoothstep((time - (b[4] + 1.30)) / 1.20);
      const pScale = lerp(0.62, 1.72, puddleGrow);
      this.puddle.scale.set(pScale, pScale, 1);
      this.puddleMat.opacity = lerp(0.32, 0.56, puddleGrow);

      // 5. Bolhas de sabao flutuando (do carro/balde em B2..B4 -> enchem a oficina alegremente em B5..B6!)
      const showBubbles = time >= b[1] - 0.35;
      const bubbleBoost = lerp(0.55, 1.0, Math.max(blastW, stepFrontCta));
      for (let i = 0; i < this.soapBubbles.length; i++) {
        const sb = this.soapBubbles[i];
        const active = showBubbles && (i < 10 || blastW > 0.08 || stepFrontCta > 0.10);
        sb.mesh.visible = active;
        if (active) {
          const cyc = (time * (0.30 + (i % 3) * 0.08) + sb.seed) % 1;
          const bx = sb.baseX + Math.sin(time * 1.8 + sb.seed * 4) * 0.22;
          const by = 0.35 + cyc * 1.95;
          const bz = sb.baseZ + Math.cos(time * 1.5 + sb.seed * 3) * 0.18;
          sb.mesh.position.set(bx, by, bz);
          sb.mesh.scale.setScalar(sb.size * bubbleBoost * (0.7 + Math.sin(cyc * Math.PI) * 0.45));
        }
      }

      // 6. Respingos 3D explodindo nos dois personagens em B5 (molha Camila e rebate no Voce!)
      const splashVis = blastW > 0.05;
      for (let i = 0; i < this.splashDrops.length; i++) {
        const sd = this.splashDrops[i];
        sd.mesh.visible = splashVis;
        if (splashVis) {
          const cyc = (time * 2.2 + sd.seed) % 1;
          const cx = sd.targetCamila ? camPosX - 0.08 : voceX + 0.06;
          const cz = sd.targetCamila ? camPosZ + 0.12 : voceZ + 0.18;
          const sx = cx + Math.sin(sd.seed * 7.3) * cyc * 0.62;
          const sy = 0.92 + Math.sin(cyc * Math.PI) * 0.48 - cyc * 0.85;
          const sz = cz + Math.cos(sd.seed * 5.9) * cyc * 0.55;
          sd.mesh.position.set(sx, Math.max(0.05, sy), sz);
          sd.mesh.scale.setScalar((0.65 + (1 - cyc) * 0.75) * blastW);
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  global.Ep05MangueiraOficina3D = Ep05MangueiraOficina3D;
})(typeof window !== 'undefined' ? window : globalThis);
