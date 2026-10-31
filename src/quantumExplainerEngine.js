/**
 * QuantumExplainerEngine — Motor Leve para Cenas de Física Quântica
 * Reutiliza: character3d.js (Narrador) + microchip3d.js (Setas/Elementos)
 * Tema: O Paradoxo do Gato de Schrödinger
 */
import * as THREE from 'three';
import { createCharacter, applyPose, animateBreathing } from './character3d.js';
import { create3DVectorArrow } from './microchip3d.js';

export const QUANTUM_CONFIG = {
  width: 720,
  height: 1280,
  fps: 30,
  duration: 15, // Duração da cena YAML
  totalFrames: 15 * 30,
};

export class QuantumExplainerEngine {
  constructor(containerElement) {
    this.container = containerElement;
    this.width = QUANTUM_CONFIG.width;
    this.height = QUANTUM_CONFIG.height;
    this.time = 0;

    // Cena: Laboratório Escuro
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050510);
    this.scene.fog = new THREE.FogExp2(0x050510, 0.03);

    // Câmera: Zoom Lento (Simulado via interpolação)
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 2, 6);
    this.cameraTarget = new THREE.Vector3(0, 0.5, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(this.renderer.domElement);
    }

    this.setupQuantumLighting();
    this.buildProps();
  }

  setupQuantumLighting() {
    // Luz ambiente azulada (laboratório noturno)
    const ambient = new THREE.AmbientLight(0x1a2b4c, 0.8);
    this.scene.add(ambient);

    // Spotlight dramática sobre a caixa
    const spot = new THREE.SpotLight(0x00ffcc, 8);
    spot.position.set(2, 5, 2);
    spot.angle = Math.PI / 6;
    spot.penumbra = 0.5;
    spot.castShadow = true;
    this.scene.add(spot);

    // Luz de preenchimento lateral
    const fill = new THREE.DirectionalLight(0xff00aa, 1.5);
    fill.position.set(-4, 2, 3);
    this.scene.add(fill);
  }

  buildProps() {
    // 1. Narrador (Robot simples)
    this.narrator = createCharacter({ color: 0x60a5fa, scale: 1.0 });
    this.narrator.position.set(-2.5, 0, 0);
    this.narrator.rotation.y = Math.PI / 6; // Virado para a caixa
    this.scene.add(this.narrator);

    // 2. A Caixa de Schrödinger (Cubo Emissivo)
    const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.8
    });
    this.box = new THREE.Mesh(boxGeo, boxMat);
    this.box.position.set(2, 0.6, 0);
    this.box.castShadow = true;
    this.scene.add(this.box);

    // 3. Partículas Quânticas (Esferas flutuantes)
    this.particles = [];
    for (let i = 0; i < 15; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.6 })
      );
      p.userData = {
        speed: 0.5 + Math.random(),
        offset: Math.random() * Math.PI * 2,
        baseY: 0.5 + Math.random() * 2
      };
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  renderFrame(frame, fps) {
    const t = frame / fps;

    // Animação da Câmera (Zoom Lento)
    const zoomFactor = 1 - (t / QUANTUM_CONFIG.duration) * 0.3;
    this.camera.position.z = 6 * zoomFactor;
    this.camera.lookAt(this.cameraTarget);

    // Animação do Narrador (Respiração)
    animateBreathing(this.narrator, t);

    // Animação da Caixa (Pulsação Quântica)
    const pulse = 1 + Math.sin(t * 4) * 0.02;
    this.box.scale.set(pulse, pulse, pulse);
    this.box.material.emissiveIntensity = 0.2 + Math.sin(t * 2) * 0.1;

    // Animação das Partículas
    this.particles.forEach(p => {
      p.position.x = 2 + Math.cos(t * p.userData.speed + p.userData.offset) * 1.5;
      p.position.y = p.userData.baseY + Math.sin(t * 2 + p.userData.offset) * 0.5;
      p.position.z = Math.sin(t * p.userData.speed + p.userData.offset) * 1.5;
    });

    this.renderer.render(this.scene, this.camera);
  }
}