import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Schrodinger3DScene } from './schrodinger3d.js';
import schrodingerTiming from './schrodingerTiming.json';

export const SCHRODINGER_CONFIG = {
  width: 720,
  height: 1280,
  fps: 30,
  duration: schrodingerTiming.totalDuration || 88.0,
};

export const SCHRODINGER_SCENES = schrodingerTiming.scenes;

export class SchrodingerExplainerEngine {
  constructor(containerElement) {
    this.container = containerElement;
    this.width = SCHRODINGER_CONFIG.width;
    this.height = SCHRODINGER_CONFIG.height;
    this.time = 0;
    this.currentSceneIndex = 0;

    // ── Cena Three.js com Estúdio Iluminado de Alta Fidelidade ────────────
    this.scene = new THREE.Scene();
    // Fundo de estúdio sci-fi moderno, limpo e com alto contraste
    this.scene.background = new THREE.Color(0x0f172a);
    // Sem névoa espessa para manter visibilidade 100% cristalina
    this.scene.fog = null;

    // ── Câmera Cinemática em Formato Vertical 9:16 (720x1280) ─────────────
    this.camera = new THREE.PerspectiveCamera(46, this.width / this.height, 0.1, 100);
    this.camera.position.set(-0.2, 1.35, 3.8);
    this.cameraTarget = new THREE.Vector3(0, 1.1, 0);

    // ── WebGL Renderer com ACESFilmic e Iluminação de Alto Alcance Dinâmico ─
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(this.renderer.domElement);
    }

    this.setupStudioLighting();

    // ── Pipeline de Pós-Processamento Equilibrado (Sem turvação) ───────────
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom fino calibrado: apenas elementos emissivos brilham, preservando nitidez máxima
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.65, // strength: brilho equilibrado e limpo
      0.35, // radius: dispersão contida
      0.55  // threshold: somente lasers e neons ultrapassam
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    // ── Instancia o Cenário 3D Quântico Completo ──────────────────────────
    this.schrodingerScene = new Schrodinger3DScene();
    this.scene.add(this.schrodingerScene.root);
  }

  setupStudioLighting() {
    // 1. Key Light Estúdio Quente de Alta Potência
    const keyLight = new THREE.DirectionalLight(0xffffff, 5.5);
    keyLight.position.set(3.5, 7.5, 4.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    this.scene.add(keyLight);

    // 2. Fill Light Frontal Ampla (Elimina sombras escuras que impedem a visão)
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 3.2);
    fillLight.position.set(-4.0, 4.5, 3.5);
    this.scene.add(fillLight);

    // 3. Rim Light Traseira Dourada/Âmbar (Recorta o gato, adereços e apresentador)
    const rimLight = new THREE.DirectionalLight(0xfbbf24, 3.8);
    rimLight.position.set(0, 6.0, -4.5);
    this.scene.add(rimLight);

    // 4. Luz de Topo Ciano para Destaque Quântico
    const topLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    topLight.position.set(0, 7.0, 1.0);
    this.scene.add(topLight);

    // 5. Luz Ambiente Hemisférica Clara (Garante claridade mesmo sob ângulos fechados)
    const hemiLight = new THREE.HemisphereLight(0x64748b, 0x1e293b, 2.6);
    this.scene.add(hemiLight);
  }

  getSceneForTime(t) {
    for (let i = 0; i < SCHRODINGER_SCENES.length; i++) {
      const s = SCHRODINGER_SCENES[i];
      if (t >= s.start && t < s.end) return { scene: s, index: i };
    }
    return { scene: SCHRODINGER_SCENES[SCHRODINGER_SCENES.length - 1], index: SCHRODINGER_SCENES.length - 1 };
  }

  seekToScene(sceneIndex) {
    const targetIdx = Math.max(0, Math.min(sceneIndex, SCHRODINGER_SCENES.length - 1));
    const s = SCHRODINGER_SCENES[targetIdx];
    this.time = s.start;
    this.renderFrame(Math.floor(this.time * SCHRODINGER_CONFIG.fps), SCHRODINGER_CONFIG.fps);
  }

  /**
   * Calcula a posição e o alvo da câmera em sincronia exata com o roteiro falado.
   */
  calculateDynamicCamera(time, sceneId) {
    const cam = { x: 0, y: 1.25, z: 3.2 };
    const target = { x: 0, y: 1.1, z: 0 };

    if (sceneId === 1) {
      // Cena 1 (0.5s - 12.98s): Introdução e O Paradoxo
      // Apresentador à esquerda (-0.65) e câmara quântica à direita (0.55)
      const introProgress = Math.min(1.0, (time - 0.5) / 11.5);
      // Movimento suave de aproximação revelando a câmara
      cam.x = -0.2 - introProgress * 0.1;
      cam.y = 1.35;
      cam.z = 3.65 - introProgress * 0.45;
      target.x = -0.05 + introProgress * 0.15;
      target.y = 1.12;
      target.z = 0.2;
    } else if (sceneId === 2) {
      // Cena 2 (12.98s - 27.26s): O Mecanismo Letal Interno
      if (time < 16.2) {
        // Beat 1: "Tudo começa dentro de uma câmara isolada..." (Abertura geral da caixa)
        cam.x = 0;
        cam.y = 1.25;
        cam.z = 2.45;
        target.x = 0;
        target.y = 1.1;
        target.z = 0;
      } else if (time < 19.2) {
        // Beat 2: "Ali dentro temos um único átomo radioativo..." (Macro close no Átomo)
        const p = Math.min(1.0, (time - 16.2) / 0.8);
        cam.x = -0.55 * p;
        cam.y = 1.25 + 0.15 * p;
        cam.z = 2.45 - 0.95 * p; // Z = 1.5 (Super close-up nítido!)
        target.x = -0.65 * p;
        target.y = 1.25 + 0.05 * p;
        target.z = -0.2;
      } else if (time < 22.0) {
        // Beat 3: "...um detector Geiger..." (Transição macro para o Geiger)
        const p = Math.min(1.0, (time - 19.2) / 0.8);
        cam.x = -0.55 + (-0.18 - -0.55) * p;
        cam.y = 1.35 - 0.05 * p;
        cam.z = 1.5;
        target.x = -0.65 + (-0.2 - -0.65) * p;
        target.y = 1.25;
        target.z = -0.2;
      } else if (time < 24.5) {
        // Beat 4: "...um martelo suspenso e um frasco com veneno." (Transição para Martelo + Frasco)
        const p = Math.min(1.0, (time - 22.0) / 0.8);
        cam.x = -0.18 + (0.42 - -0.18) * p;
        cam.y = 1.3 - 0.15 * p;
        cam.z = 1.5 + 0.25 * p; // Z = 1.75
        target.x = -0.2 + (0.45 - -0.2) * p;
        target.y = 1.15;
        target.z = -0.2;
      } else {
        // Beat 5: "Se o átomo decair, o martelo cai e quebra o frasco!" (Plano de tensão do golpe)
        cam.x = 0.25;
        cam.y = 1.2;
        cam.z = 2.05;
        target.x = 0.25;
        target.y = 1.05;
        target.z = -0.15;
      }
    } else if (sceneId === 3) {
      // Cena 3 (27.26s - 41.4s): A Superposição Quântica & O Gato Fantasma
      // Enquadramento frontal focado e límpido no gato e nas placas 50/50
      if (time < 32.5) {
        // Beat 1: Onda quântica se espalhando
        const p = Math.min(1.0, (time - 27.26) / 2.0);
        cam.x = 0;
        cam.y = 1.25 - 0.05 * p;
        cam.z = 2.4 - 0.3 * p; // Z = 2.1
        target.x = 0;
        target.y = 1.05;
        target.z = 0.2;
      } else {
        // Beat 2: Gato 50% Vivo / 50% Morto em close cinematográfico
        cam.x = 0;
        cam.y = 1.2;
        cam.z = 2.05;
        target.x = 0;
        target.y = 1.02;
        target.z = 0.25;
      }
    } else if (sceneId === 4) {
      // Cena 4 (41.4s - 56.62s): Duas Realidades Paralelas & Multiverso
      if (time < 45.0) {
        // Beat 1: "Duas realidades paralelas acontecem no mesmo espaço!" (Visão do portal)
        cam.x = 0;
        cam.y = 1.3;
        cam.z = 2.65;
        target.x = 0;
        target.y = 1.1;
        target.z = 0;
      } else if (time < 49.0) {
        // Beat 2: "Em um universo, o martelo ficou intacto e o gato está brincando." (Dolly Esquerda)
        const p = Math.min(1.0, (time - 45.0) / 0.8);
        cam.x = -0.5 * p;
        cam.y = 1.25;
        cam.z = 2.65 - 0.65 * p; // Z = 2.0
        target.x = -0.5 * p;
        target.y = 1.08;
        target.z = 0.1;
      } else if (time < 53.0) {
        // Beat 3: "No outro, o frasco quebrou." (Dolly Direita)
        const p = Math.min(1.0, (time - 49.0) / 0.8);
        cam.x = -0.5 + (0.5 - -0.5) * p;
        cam.y = 1.25;
        cam.z = 2.0;
        target.x = -0.5 + (0.5 - -0.5) * p;
        target.y = 1.08;
        target.z = 0.1;
      } else {
        // Beat 4: "As duas realidades coexistem em uma onda quântica pura!" (Retorno ao centro)
        const p = Math.min(1.0, (time - 53.0) / 0.8);
        cam.x = 0.5 - 0.5 * p;
        cam.y = 1.3;
        cam.z = 2.0 + 0.65 * p;
        target.x = 0.5 - 0.5 * p;
        target.y = 1.1;
        target.z = 0;
      }
    } else if (sceneId === 5) {
      // Cena 5 (56.62s - 70.01s): O Observador & Colapso da Função de Onda
      if (time < 61.5) {
        // Beat 1: "Mas o que acontece quando você decide abrir a caixa?" (Mão se aproxima)
        cam.x = 0;
        cam.y = 1.22;
        cam.z = 2.3;
        target.x = 0;
        target.y = 1.1;
        target.z = 0.4;
      } else if (time < 66.0) {
        // Beat 2: "No exato instante em que um observador olha pra dentro... colapso forçado!" (Flash & Vortex)
        cam.x = 0;
        cam.y = 1.18;
        cam.z = 1.95;
        target.x = 0;
        target.y = 1.05;
        target.z = 0.3;
      } else {
        // Beat 3: "A realidade é obrigada a escolher um único destino!"
        cam.x = 0;
        cam.y = 1.18;
        cam.z = 2.05;
        target.x = 0;
        target.y = 1.05;
        target.z = 0.3;
      }
    } else if (sceneId === 6) {
      // Cena 6 (70.01s - 88.0s): A Revelação Vitoriosa & O Gato Salvo
      if (time < 75.0) {
        // Beat 1: "E a caixa se abre! O gato pula são e salvo, miando de alegria!" (Pulo dinâmico)
        const p = Math.min(1.0, (time - 70.01) / 2.0);
        cam.x = 0;
        cam.y = 1.15;
        cam.z = 2.45 - 0.15 * p; // Z = 2.3
        target.x = 0;
        target.y = 0.85 + 0.15 * p;
        target.z = 0.8;
      } else if (time < 81.0) {
        // Beat 2: Apresentador celebrando junto com o gato
        const p = Math.min(1.0, (time - 75.0) / 1.0);
        cam.x = -0.25 * p;
        cam.y = 1.22;
        cam.z = 2.3 + 0.55 * p; // Z = 2.85
        target.x = -0.15 * p;
        target.y = 1.05;
        target.z = 0.6;
      } else {
        // Beat 3: Final triunfante ("Fascinante, não é?")
        cam.x = -0.22;
        cam.y = 1.22;
        cam.z = 2.85;
        target.x = -0.12;
        target.y = 1.05;
        target.z = 0.6;
      }
    }

    return { cam, target };
  }

  renderFrame(frameIndex, fps = 30) {
    this.time = frameIndex / fps;
    const { scene: curScene, index: sceneIdx } = this.getSceneForTime(this.time);
    this.currentSceneIndex = sceneIdx;

    // Calcula câmera perfeitamente coreografada
    const { cam, target } = this.calculateDynamicCamera(this.time, curScene.id);

    // Micro-respiração orgânica cinematográfica da câmera
    const subtleBreathe = Math.sin(this.time * 0.8) * 0.015;

    this.camera.position.set(cam.x + subtleBreathe, cam.y, cam.z);
    this.cameraTarget.set(target.x, target.y, target.z);
    this.camera.lookAt(this.cameraTarget);

    // Atualiza todos os elementos do cenário quântico
    this.schrodingerScene.update(this.time, curScene.id);

    // Renderiza cena com iluminação límpida e UnrealBloom calibrado
    this.composer.render();
  }
}
