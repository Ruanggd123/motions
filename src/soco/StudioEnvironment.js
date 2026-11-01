import * as THREE from 'three';

export function createStudioEnvironment(scene) {
  const envGroup = new THREE.Group();
  scene.add(envGroup);

  // Fundo preto-carvão de estúdio cinematográfico
  const STUDIO_BG_COLOR = 0x090a0f;
  scene.background = new THREE.Color(STUDIO_BG_COLOR);
  scene.fog = new THREE.FogExp2(STUDIO_BG_COLOR, 0.04);

  // Piso circular fosco com leve especularidade
  const floorGeom = new THREE.CylinderGeometry(5.0, 5.0, 0.15, 48);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x111217,
    roughness: 0.5,
    metalness: 0.2
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.position.y = -0.075;
  floorMesh.receiveShadow = true;
  envGroup.add(floorMesh);

  // Anéis demarcatórios do estúdio/combate
  const ringGeom = new THREE.RingGeometry(2.0, 2.015, 64);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x222430,
    side: THREE.DoubleSide
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.position.y = 0.002;
  envGroup.add(ringMesh);

  const outerRingGeom = new THREE.RingGeometry(3.4, 3.415, 64);
  outerRingGeom.rotateX(-Math.PI / 2);
  const outerRingMesh = new THREE.Mesh(outerRingGeom, ringMat);
  outerRingMesh.position.y = 0.002;
  envGroup.add(outerRingMesh);

  // --- ILUMINAÇÃO DE ESTÚDIO CINEMATOGRÁFICA ---
  const ambientLight = new THREE.AmbientLight(0x181c26, 0.5);
  envGroup.add(ambientLight);

  // Key light suave frontal
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(2.5, 5.5, 4.0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  envGroup.add(keyLight);

  // Fill light lateral fria
  const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.45);
  fillLight.position.set(-3.5, 3.0, 2.0);
  envGroup.add(fillLight);

  // RIM LIGHT PRINCIPAL (Traseiro alto — O contorno branco característico!)
  const rimLightBack = new THREE.DirectionalLight(0xffffff, 2.8);
  rimLightBack.position.set(0, 4.5, -4.5);
  rimLightBack.target.position.set(0, 1.2, 0);
  envGroup.add(rimLightBack);
  envGroup.add(rimLightBack.target);

  // Rim light lateral de recorte
  const rimLightSide = new THREE.DirectionalLight(0x94a3b8, 1.2);
  rimLightSide.position.set(3.8, 2.5, -2.5);
  rimLightSide.target.position.set(0, 1.2, 0);
  envGroup.add(rimLightSide);
  envGroup.add(rimLightSide.target);

  // Partículas flutuantes sutis
  const particleCount = 100;
  const particleGeom = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3 + 0] = (Math.random() - 0.5) * 6;
    particlePos[i * 3 + 1] = Math.random() * 3.5;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }

  particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x64748b,
    size: 0.02,
    transparent: true,
    opacity: 0.35
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  envGroup.add(particles);

  return { envGroup, particles };
}
