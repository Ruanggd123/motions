/**
 * VideoEngine v5 — ESTÁVEL E SIMPLES (Revertido)
 * "E Se Você Crescesse a Cada Passo?"
 *
 * CORREÇÕES CRÍTICAS v5:
 * 1. CÂMERA FIXA POR CENA: Posições hardcoded seguras para cada escala.
 *    Sem cálculo matemático complexo que falha.
 * 2. POSES ESTÁTICAS LIMPA: Sem manipulação manual de joints que causa glitches.
 *    Apenas applyPose() direto do character3d.js.
 * 3. LOOP PASSO-RÉGUA-COMPARATIVO: Mantido da v3 (que funcionou).
 * 4. ZERO ROTEIRO DUPLO COMPLEXO: Simplificado para garantir estabilidade.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createCharacter, applyPose, animateBreathing } from './character3d.js';
import { SubtitleManager } from './subtitles.js';
// Shader de lápis REMOVIDO — voltando ao visual 3D original colorido

export const VIDEO_CONFIG = {
  width: 720,
  height: 1280,
  fps: 30,
  duration: 48,
  totalFrames: 48 * 30,
};

// === CENAS SIMPLIFICADAS (Posições de Câmera Hardcoded Seguras) ===
const SCENES = [
  {
    name: 'baseline', start: 0, end: 8,
    walkFrom: 0, walkTo: 2, scaleBefore: 1.0, scaleAfter: 1.0,
    heightText: '1.8 METROS', rulerHeight: 1.8,
    compareText: null, compareObj: null,
    narration: 'IMAGINE QUE A CADA PASSO VOCÊ CRESCE...',
    bgColor: 0x87CEEB,
    // CÂMERA FIXA SEGURA PARA ESCALA 1x
    camPos: [2, 2, 8], camLookAt: [2, 1, 0],
  },
  {
    name: 'poste', start: 8, end: 16,
    walkFrom: 2, walkTo: 4, scaleBefore: 1.0, scaleAfter: 2.2,
    heightText: '4.0 METROS', rulerHeight: 4.0,
    compareText: '= POSTE!', compareObj: { type: 'poste', x: 6, height: 3.5, color: 0x00D4FF },
    narration: 'PRIMEIRO PASSO: 4 METROS! TAMANHO DE UM POSTE!',
    bgColor: 0x87CEEB,
    // CÂMERA FIXA SEGURA PARA ESCALA 2.2x
    camPos: [4, 3, 12], camLookAt: [4, 2, 0],
  },
  {
    name: 'predio', start: 16, end: 24,
    walkFrom: 4, walkTo: 6, scaleBefore: 2.2, scaleAfter: 4.4,
    heightText: '8.0 METROS', rulerHeight: 8.0,
    compareText: '= PRÉDIO!', compareObj: { type: 'predio', x: 9, height: 8, color: 0xFFD700 },
    narration: 'SEGUNDO PASSO: 8 METROS! TAMANHO DE UM PRÉDIO!',
    bgColor: 0x6BB3D9,
    // CÂMERA FIXA SEGURA PARA ESCALA 4.4x
    camPos: [6, 5, 18], camLookAt: [6, 4, 0],
  },
  {
    name: 'acima_predios', start: 24, end: 32,
    walkFrom: 6, walkTo: 8, scaleBefore: 4.4, scaleAfter: 11.0,
    heightText: '20 METROS', rulerHeight: 20.0,
    compareText: 'MAIOR QUE O PRÉDIO!', compareObj: { type: 'predio_alto', x: 12, height: 18, color: 0xFF6B35 },
    narration: 'TERCEIRO PASSO: 20 METROS! VOCÊ PASSOU DOS PRÉDIOS!',
    bgColor: 0x4A90D9,
    // CÂMERA FIXA SEGURA PARA ESCALA 11x
    camPos: [8, 10, 30], camLookAt: [8, 8, 0],
  },
  {
    name: 'nuvens', start: 32, end: 40,
    walkFrom: 8, walkTo: 10, scaleBefore: 11.0, scaleAfter: 28.0,
    heightText: '50 METROS', rulerHeight: 50.0,
    compareText: 'ATRAVESSA AS NUVENS!', compareObj: { type: 'nuvem', x: 14, height: 30, color: 0xFFFFFF },
    narration: 'QUARTO PASSO: 50 METROS! ATRAVESSA AS NUVENS!',
    bgColor: 0x1E90FF,
    // CÂMERA FIXA SEGURA PARA ESCALA 28x
    camPos: [10, 20, 50], camLookAt: [10, 15, 0],
  },
  {
    name: 'terra', start: 40, end: 48,
    walkFrom: 10, walkTo: 12, scaleBefore: 28.0, scaleAfter: 55.0,
    heightText: '100+ METROS', rulerHeight: 55.0,
    compareText: 'TERRA NA SUA MÃO!', compareObj: { type: 'terra', x: 12, height: 15, color: 0x39FF14 },
    narration: 'QUINTO PASSO: 100 METROS! TERRA NA SUA MÃO!',
    bgColor: 0x050510,
    // CÂMERA FIXA SEGURA PARA ESCALA 55x
    camPos: [12, 35, 80], camLookAt: [12, 25, -5],
  },
];

export const SCENE_TIMELINE = SCENES.map(s => ({
  name: s.name, start: s.start, end: s.end, label: s.narration.split('!')[0] + '!',
}));

export const SCRIPT_LINES = SCENES.map(s => ({
  start: s.start, end: s.end, text: s.narration, beat: 'neutral',
}));

// === EASING FUNCTIONS ===
function easeOutBack(t) {
  const c1 = 1.70158; const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

export class VideoEngine {
  constructor(container) {
    this.container = container;
    this.time = 0;
    this.playing = false;
    this.currentSceneIndex = -1;

    // Cena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    // Câmera (posição será setada diretamente por cena)
    this.camera = new THREE.PerspectiveCamera(45, VIDEO_CONFIG.width / VIDEO_CONFIG.height, 0.1, 500);
    this.camera.position.set(2, 2, 8);
    this.camera.lookAt(2, 1, 0);

    // Renderer PBR
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setSize(VIDEO_CONFIG.width, VIDEO_CONFIG.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    if (container) container.appendChild(this.renderer.domElement);

    // Pós-processamento leve
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(VIDEO_CONFIG.width, VIDEO_CONFIG.height), 0.4, 0.3, 0.85);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    // Iluminação
    this._setupLighting();

    // Chão + decoração
    this._buildGround();

    // Objetos de comparação
    this.compareObjects = {};
    this._buildCompareObjects();

    // Personagem
    this.character = createCharacter({ scale: 1.0, celShading: true });
    this.character.position.set(0, 0, 0);
    this.character.rotation.y = -Math.PI / 2; // side view
    this.scene.add(this.character);

    // Régua
    this.rulerGroup = new THREE.Group();
    this.rulerGroup.visible = false;
    this.scene.add(this.rulerGroup);

    // Indicadores
    this.indicators = {};
    this._buildIndicators();

    // Estrelas
    this._buildStars();

    // Estilo lápis REMOVIDO — visual 3D original colorido restaurado

    // Estado
    this.subtitleEl = null;
    this.subtitleManager = null;
    this.onComplete = null;
    this._lastFrameTime = 0;
    this._fallbackInterval = null;
  }

  _setupLighting() {
    const key = new THREE.DirectionalLight(0xFFF5E0, 2.5);
    key.position.set(5, 10, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -50; key.shadow.camera.right = 50;
    key.shadow.camera.top = 50; key.shadow.camera.bottom = -10;
    this.scene.add(key);
    this.keyLight = key;

    this.scene.add(new THREE.DirectionalLight(0xB0C4DE, 1.0).translateX(-4).translateY(4).translateZ(3));
    this.scene.add(new THREE.DirectionalLight(0x87CEEB, 1.8).translateY(3).translateZ(-6));
    this.scene.add(new THREE.AmbientLight(0x404060, 0.6));
    this.scene.add(new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.5));
  }

  _buildGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 40),
      new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(50, -0.01, 0);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.95 });
    [-8, 8].forEach(z => {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(200, 8), grassMat);
      g.rotation.x = -Math.PI / 2;
      g.position.set(50, -0.005, z);
      this.scene.add(g);
    });

    for (let i = 0; i < 15; i++) {
      const h = 4 + Math.random() * 14;
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(2 + Math.random(), h, 2 + Math.random()),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.15, 0.4 + Math.random() * 0.2),
          metalness: 0.2, roughness: 0.7,
        })
      );
      bldg.position.set(i * 3 - 2, h / 2, -6 - Math.random() * 4);
      bldg.castShadow = true;
      this.scene.add(bldg);
    }
  }

  _buildCompareObjects() {
    // Poste
    const poste = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 8), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.3 }));
    pole.position.y = 1.75; poste.add(pole);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshStandardMaterial({ color: 0xFFDD44, emissive: 0xFFDD44, emissiveIntensity: 2 }));
    lamp.position.y = 3.6; poste.add(lamp);
    poste.position.set(6, 0, 0); poste.visible = false;
    this.scene.add(poste); this.compareObjects.poste = poste;

    // Prédio 8m
    const predio = new THREE.Group();
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(2.5, 8, 2.5), new THREE.MeshStandardMaterial({ color: 0x778899, metalness: 0.2, roughness: 0.7 }));
    pBody.position.y = 4; pBody.castShadow = true; predio.add(pBody);
    for (let r = 0; r < 4; r++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0xFFEE88, emissive: 0xFFEE88, emissiveIntensity: 0.5 }));
      win.position.set(0, 1.5 + r * 1.8, 1.26); predio.add(win);
    }
    predio.position.set(9, 0, -3); predio.visible = false;
    this.scene.add(predio); this.compareObjects.predio = predio;

    // Prédio alto 18m
    const predioAlto = new THREE.Group();
    const paBody = new THREE.Mesh(new THREE.BoxGeometry(3, 18, 3), new THREE.MeshStandardMaterial({ color: 0x667788, metalness: 0.2, roughness: 0.7 }));
    paBody.position.y = 9; paBody.castShadow = true; predioAlto.add(paBody);
    for (let r = 0; r < 9; r++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0xFFEE88, emissive: 0xFFEE88, emissiveIntensity: 0.5 }));
      win.position.set(0, 1.5 + r * 1.8, 1.51); predioAlto.add(win);
    }
    predioAlto.position.set(12, 0, -4); predioAlto.visible = false;
    this.scene.add(predioAlto); this.compareObjects.predio_alto = predioAlto;

    // Nuvem
    const nuvem = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 1, transparent: true, opacity: 0.75 });
    [0, 1.5, 3, -1.2].forEach(ox => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random(), 12, 12), cloudMat);
      puff.position.set(ox, Math.random() * 1.5, Math.random()); nuvem.add(puff);
    });
    nuvem.position.set(14, 25, -5); nuvem.visible = false;
    this.scene.add(nuvem); this.compareObjects.nuvem = nuvem;

    // Terra
    const terra = new THREE.Group();
    const globe = new THREE.Mesh(new THREE.SphereGeometry(8, 48, 48), new THREE.MeshStandardMaterial({ color: 0x1565C0, metalness: 0.2, roughness: 0.4 }));
    terra.add(globe);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(8.3, 32, 32), new THREE.MeshBasicMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.25, side: THREE.BackSide }));
    terra.add(atmo);
    terra.position.set(12, -20, -15); terra.visible = false;
    this.scene.add(terra); this.compareObjects.terra = terra;
  }

  _buildIndicators() {
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.6); arrowShape.lineTo(0.35, 0); arrowShape.lineTo(0.12, 0);
    arrowShape.lineTo(0.12, -0.6); arrowShape.lineTo(-0.12, -0.6); arrowShape.lineTo(-0.12, 0);
    arrowShape.lineTo(-0.35, 0); arrowShape.closePath();
    const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, { depth: 0.06, bevelEnabled: false });

    this.indicators.arrow = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0 }));
    this.indicators.arrow.visible = false; this.scene.add(this.indicators.arrow);

    this.indicators.halo = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 32), new THREE.MeshBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0, side: THREE.DoubleSide }));
    this.indicators.halo.visible = false; this.scene.add(this.indicators.halo);

    this.indicators.heightSprite = this._makeTextSprite('1.8 METROS', '#FFFFFF', 72);
    this.indicators.heightSprite.material.opacity = 0; this.indicators.heightSprite.visible = false;
    this.scene.add(this.indicators.heightSprite);

    this.indicators.compareSprite = this._makeTextSprite('= POSTE!', '#00D4FF', 80);
    this.indicators.compareSprite.material.opacity = 0; this.indicators.compareSprite.visible = false;
    this.scene.add(this.indicators.compareSprite);
  }

  _makeTextSprite(text, color, fontSize) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = color; ctx.strokeStyle = '#000000'; ctx.lineWidth = 8;
    ctx.font = `bold ${fontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeText(text, 256, 128); ctx.fillText(text, 256, 128);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 1 });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3, 1.5, 1);
    sprite.userData = { canvas, ctx, fontSize, color };
    return sprite;
  }

  _updateSprite(sprite, text, color) {
    const { ctx, canvas, fontSize } = sprite.userData;
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = color || sprite.userData.color;
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 8;
    ctx.font = `bold ${fontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeText(text, 256, 128); ctx.fillText(text, 256, 128);
    sprite.material.map.needsUpdate = true;
  }

  _buildStars() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(3000);
    for (let i = 0; i < 3000; i += 3) {
      pos[i] = (Math.random() - 0.5) * 300 + 50;
      pos[i + 1] = Math.random() * 150;
      pos[i + 2] = -20 - Math.random() * 100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.3, transparent: true, opacity: 0 }));
    this.scene.add(this.stars);
  }

  _buildRuler(heightMeters, charX) {
    while (this.rulerGroup.children.length > 0) {
      const c = this.rulerGroup.children[0];
      this.rulerGroup.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
    const rulerX = charX + 1.8;
    const rulerMat = new THREE.MeshBasicMaterial({ color: 0xFF6B35 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, heightMeters, 0.03), rulerMat);
    bar.position.set(rulerX, heightMeters / 2, 0.5);
    this.rulerGroup.add(bar);

    for (let m = 0; m <= Math.ceil(heightMeters); m++) {
      const isMajor = m % 2 === 0;
      const markW = isMajor ? 0.25 : 0.15;
      const mark = new THREE.Mesh(new THREE.BoxGeometry(markW, 0.03, 0.03), rulerMat);
      mark.position.set(rulerX + markW / 2 + 0.03, m, 0.5);
      this.rulerGroup.add(mark);
      if (isMajor && m > 0) {
        const numCanvas = document.createElement('canvas');
        numCanvas.width = 128; numCanvas.height = 64;
        const nCtx = numCanvas.getContext('2d');
        nCtx.fillStyle = '#FF6B35'; nCtx.font = 'bold 48px Arial';
        nCtx.textAlign = 'center'; nCtx.textBaseline = 'middle';
        nCtx.fillText(`${m}m`, 64, 32);
        const numTex = new THREE.CanvasTexture(numCanvas);
        const numSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: numTex, transparent: true }));
        numSprite.position.set(rulerX + 0.6, m, 0.5);
        numSprite.scale.set(0.6, 0.3, 1);
        this.rulerGroup.add(numSprite);
      }
    }
    const topArrow = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 4), rulerMat);
    topArrow.position.set(rulerX, heightMeters + 0.15, 0.5);
    this.rulerGroup.add(topArrow);
  }

  init() {
    if (this.container) {
      this.subtitleEl = document.createElement('div');
      this.subtitleEl.style.cssText = `
        position:absolute; bottom:12%; left:50%; transform:translateX(-50%);
        background:rgba(0,0,0,0.85); color:white; padding:12px 28px;
        border-radius:24px; font-family:'Inter','Segoe UI',sans-serif;
        font-size:32px; font-weight:800; letter-spacing:-0.02em;
        text-align:center; opacity:0; transition:opacity 0.15s;
        pointer-events:none; z-index:10;
        text-shadow:0 2px 8px rgba(0,0,0,0.6); max-width:85%;
        border:2px solid rgba(255,255,255,0.12);
      `;
      this.container.style.position = 'relative';
      this.container.appendChild(this.subtitleEl);
      this.subtitleManager = new SubtitleManager(this.subtitleEl, SCRIPT_LINES);
    }
    return this;
  }

  _getSceneAtTime(time) {
    for (let i = 0; i < SCENES.length; i++) {
      if (time >= SCENES[i].start && time < SCENES[i].end) return { scene: SCENES[i], index: i };
    }
    return { scene: SCENES[SCENES.length - 1], index: SCENES.length - 1 };
  }

  _applyStateAtTime(time) {
    const { scene, index: sceneIdx } = this._getSceneAtTime(time);
    const localTime = time - scene.start;
    const rotA = scene; // Simplificado: scene é o roteiro A

    // Mudou de cena? Atualizar objetos estáticos e CÂMERA FIXA
    if (sceneIdx !== this.currentSceneIndex) {
      this.currentSceneIndex = sceneIdx;

      // CÂMERA FIXA HARDCODED (Garante que personagem cabe)
      this.camera.position.set(scene.camPos[0], scene.camPos[1], scene.camPos[2]);
      this.camera.lookAt(scene.camLookAt[0], scene.camLookAt[1], scene.camLookAt[2]);

      // Mostrar objetos de comparação
      Object.values(this.compareObjects).forEach(o => { o.visible = false; });
      if (rotA.compareObj) {
        const obj = this.compareObjects[rotA.compareObj.type];
        if (obj) obj.visible = true;
      }

      // Cor de fundo — RESTAURADO (visual 3D original colorido)
      this.scene.background.setHex(rotA.bgColor);
      this.stars.material.opacity = rotA.name === 'terra' ? 0.8 : 0;

      // Régua
      this._buildRuler(rotA.rulerHeight, rotA.walkTo);

      // Textos
      this._updateSprite(this.indicators.heightSprite, rotA.heightText, '#FFFFFF');
      if (rotA.compareText && rotA.compareObj) {
        const cHex = '#' + rotA.compareObj.color.toString(16).padStart(6, '0');
        this._updateSprite(this.indicators.compareSprite, rotA.compareText, cHex);
      }

      // Posicionar indicadores
      const rulerX = rotA.walkTo + 1.8;
      this.indicators.heightSprite.position.set(rulerX, rotA.rulerHeight + 1.5, 0.5);
      if (rotA.compareObj) {
        this.indicators.compareSprite.position.set(rotA.compareObj.x, rotA.compareObj.height + 2, 0);
        this.indicators.arrow.position.set(rotA.compareObj.x, rotA.compareObj.height + 1, 0.5);
        this.indicators.halo.position.set(rotA.compareObj.x, rotA.compareObj.height / 2, 0);
        this.indicators.halo.scale.setScalar(Math.max(1, rotA.compareObj.height / 3));
        // Compatível com ShaderMaterial (lápis) e MeshBasicMaterial (normal)
        const arrowMat = this.indicators.arrow.material;
        const haloMat = this.indicators.halo.material;
        if (arrowMat.uniforms?.uBaseColor) {
          arrowMat.uniforms.uBaseColor.value.setHex(rotA.compareObj.color);
        } else if (arrowMat.color) {
          arrowMat.color.setHex(rotA.compareObj.color);
        }
        if (haloMat.uniforms?.uBaseColor) {
          haloMat.uniforms.uBaseColor.value.setHex(rotA.compareObj.color);
        } else if (haloMat.color) {
          haloMat.color.setHex(rotA.compareObj.color);
        }
      }
    }

    // === FASE 1: ANDA (0–2s) — Personagem anda de verdade (pernas e braços movendo) ===
    const walkEnd = 2.0;
    if (localTime < walkEnd) {
      const t = easeInOutQuad(localTime / walkEnd);
      this.character.position.x = rotA.walkFrom + (rotA.walkTo - rotA.walkFrom) * t;
      // Animação de caminhada REAL (pernas e braços balançando conforme solicitado)
      const legSwing = Math.sin(localTime * 8) * 0.5;
      const ll = this.character.getObjectByName('leftHipPivot');
      const rl = this.character.getObjectByName('rightHipPivot');
      if (ll) ll.rotation.x = legSwing;
      if (rl) rl.rotation.x = -legSwing;
      const la = this.character.getObjectByName('leftShoulderPivot');
      const ra = this.character.getObjectByName('rightShoulderPivot');
      if (la) la.rotation.x = -legSwing * 0.8;
      if (ra) ra.rotation.x = legSwing * 0.8;
    } else {
      this.character.position.x = rotA.walkTo;
      // Reset pernas/braços ao parar
      const ll = this.character.getObjectByName('leftHipPivot');
      const rl = this.character.getObjectByName('rightHipPivot');
      if (ll) ll.rotation.x = 0;
      if (rl) rl.rotation.x = 0;
      const la = this.character.getObjectByName('leftShoulderPivot');
      const ra = this.character.getObjectByName('rightShoulderPivot');
      if (la) la.rotation.x = 0;
      if (ra) ra.rotation.x = 0;
    }

    // === FASE 2: PARA (2–2.5s) ===
    const pauseStart = 2.0;
    const growStart = 2.5;

    // === FASE 3: CRESCE (2.5–3.7s) ===
    const growDuration = 1.2;
    if (localTime < growStart) {
      this.character.scale.setScalar(rotA.scaleBefore);
    } else if (localTime < growStart + growDuration) {
      const t = easeOutQuad((localTime - growStart) / growDuration);
      const s = rotA.scaleBefore + (rotA.scaleAfter - rotA.scaleBefore) * t;
      this.character.scale.setScalar(s);
    } else {
      this.character.scale.setScalar(rotA.scaleAfter);
    }

    // === POSE 100% ESTÁTICA (Zero movimento — estilo desenho parado) ===
    if (localTime > pauseStart && rotA.scaleAfter > rotA.scaleBefore) {
      applyPose(this.character, 'shocked', 1);
    } else if (localTime > pauseStart && rotA.name === 'terra') {
      applyPose(this.character, 'pointing', 1);
    } else {
      applyPose(this.character, 'idle', 1);
    }
    // REMOVIDO: animateBreathing — personagem fica completamente parado como num desenho

    // === RÉGUA (2.5–7.5s) ===
    const rulerInStart = 2.5;
    const rulerInDur = 0.8;
    const fadeStart = 7.0;
    const fadeDur = 0.5;

    if (localTime >= rulerInStart && localTime < fadeStart + fadeDur) {
      this.rulerGroup.visible = true;
      if (localTime < rulerInStart + rulerInDur) {
        const t = clamp01((localTime - rulerInStart) / rulerInDur);
        this.rulerGroup.scale.y = easeOutBack(t);
      } else if (localTime >= fadeStart) {
        const t = clamp01((localTime - fadeStart) / fadeDur);
        this.rulerGroup.scale.y = 1 - easeOutQuad(t);
      } else {
        this.rulerGroup.scale.y = 1;
      }
    } else {
      this.rulerGroup.visible = false;
      this.rulerGroup.scale.y = 1;
    }

    // === TEXTO ALTURA (3.5–7.3s) ===
    const textStart = 3.5;
    if (localTime >= textStart && localTime < fadeStart + 0.3) {
      this.indicators.heightSprite.visible = true;
      if (localTime < textStart + 0.4) {
        this.indicators.heightSprite.material.opacity = clamp01((localTime - textStart) / 0.4);
      } else if (localTime >= fadeStart) {
        this.indicators.heightSprite.material.opacity = clamp01(1 - (localTime - fadeStart) / 0.3);
      } else {
        this.indicators.heightSprite.material.opacity = 1;
      }
    } else {
      this.indicators.heightSprite.visible = false;
      this.indicators.heightSprite.material.opacity = 0;
    }

    // === COMPARATIVO (4.0–7.3s) ===
    const compareStart = 4.0;
    if (rotA.compareObj && localTime >= compareStart && localTime < fadeStart + 0.3) {
      this.indicators.arrow.visible = true;
      this.indicators.halo.visible = true;
      this.indicators.compareSprite.visible = true;
      let alpha;
      if (localTime < compareStart + 0.4) {
        alpha = clamp01((localTime - compareStart) / 0.4);
      } else if (localTime >= fadeStart) {
        alpha = clamp01(1 - (localTime - fadeStart) / 0.3);
      } else {
        alpha = 1;
      }
      this.indicators.arrow.material.opacity = alpha * 0.9;
      this.indicators.halo.material.opacity = alpha * (0.15 + 0.15 * Math.sin(localTime * 6));
      this.indicators.compareSprite.material.opacity = alpha;
      const baseY = rotA.compareObj.height + 1;
      this.indicators.arrow.position.y = baseY + Math.sin(localTime * 5) * 0.3;
      if (localTime < compareStart + 0.4) {
        const st = clamp01((localTime - compareStart) / 0.4);
        const s = easeOutBack(st);
        this.indicators.arrow.scale.setScalar(s);
        this.indicators.compareSprite.scale.set(3 * s, 1.5 * s, 1);
      } else {
        this.indicators.arrow.scale.setScalar(1);
        this.indicators.compareSprite.scale.set(3, 1.5, 1);
      }
    } else {
      this.indicators.arrow.visible = false;
      this.indicators.halo.visible = false;
      this.indicators.compareSprite.visible = false;
      this.indicators.arrow.material.opacity = 0;
      this.indicators.halo.material.opacity = 0;
      this.indicators.compareSprite.material.opacity = 0;
    }

    // Terra rotaciona
    if (this.compareObjects.terra?.visible) {
      this.compareObjects.terra.rotation.y = time * 0.3;
    }

    // Key light segue personagem
    this.keyLight.position.set(this.character.position.x + 5, 10, 5);
  }

  update(dt) {
    if (!this.playing) return;
    if (dt == null || isNaN(dt) || dt < 0) return;
    const safeDt = Math.max(dt, 0.001);
    this.time += safeDt;
    if (this.time >= VIDEO_CONFIG.duration) {
      this.playing = false;
      if (this.onComplete) this.onComplete();
      return;
    }
    this._applyStateAtTime(this.time);
    if (this.subtitleManager) this.subtitleManager.update(this.time);
    this.composer.render();
  }

  renderFrame(frameNumber) {
    const targetTime = frameNumber / VIDEO_CONFIG.fps;
    this.time = Math.min(targetTime, VIDEO_CONFIG.duration - 0.001);

    // Para seek: aplicar estado diretamente
    const { scene } = this._getSceneAtTime(this.time);
    this.camera.position.set(scene.camPos[0], scene.camPos[1], scene.camPos[2]);
    this.camera.lookAt(scene.camLookAt[0], scene.camLookAt[1], scene.camLookAt[2]);

    this._applyStateAtTime(this.time);
    if (this.subtitleManager) this.subtitleManager.update(this.time);
    this.composer.render();
  }

  play() {
    this.playing = true;
    this._lastFrameTime = performance.now();
    if (this._fallbackInterval) clearInterval(this._fallbackInterval);
    this._fallbackInterval = setInterval(() => {
      if (!this.playing) return;
      const now = performance.now();
      const dt = Math.min((now - this._lastFrameTime) / 1000, 0.05);
      this._lastFrameTime = now;
      this.update(dt);
    }, 16);
    this.loop();
  }

  loop() {
    if (!this.playing) return;
    const now = performance.now();
    const dt = Math.min((now - this._lastFrameTime) / 1000, 0.05);
    this._lastFrameTime = now;
    this.update(dt);
    requestAnimationFrame(() => this.loop());
  }

  pause() {
    this.playing = false;
    if (this._fallbackInterval) {
      clearInterval(this._fallbackInterval);
      this._fallbackInterval = null;
    }
  }

  reset() {
    this.pause();
    this.time = 0;
    this.currentSceneIndex = -1;
    this.character.position.set(0, 0, 0);
    this.character.scale.setScalar(1.0);
    this.character.rotation.set(0, -Math.PI / 2, 0);
    this.camera.position.set(2, 2, 8);
    this.camera.lookAt(2, 1, 0);
    this.rulerGroup.visible = false;
    this.rulerGroup.scale.set(1, 1, 1);
    Object.values(this.indicators).forEach(ind => {
      ind.visible = false;
      if (ind.material) ind.material.opacity = 0;
    });
    Object.values(this.compareObjects).forEach(o => { o.visible = false; });
    this.scene.background.setHex(0x87CEEB);
    this.stars.material.opacity = 0;
    if (this.subtitleManager) this.subtitleManager.reset();
    this.renderFrame(0);
  }

  dispose() {
    this.pause();
    this.renderer.dispose();
    this.composer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
    if (this.subtitleEl && this.subtitleEl.parentNode) {
      this.subtitleEl.parentNode.removeChild(this.subtitleEl);
    }
  }
}