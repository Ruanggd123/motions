function createSubmersibleScene(THREE, scene, camera, phoneViewport) {
  const subRoot = new THREE.Group();
  scene.add(subRoot);

  const hullXRayMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
    roughness: 0.2,
    metalness: 0.8,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const hullGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.4, 32);
  hullGeo.rotateX(Math.PI / 2);
  const hullMesh = new THREE.Mesh(hullGeo, hullXRayMat);
  subRoot.add(hullMesh);

  const noseGeo = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  noseGeo.rotateX(Math.PI / 2);
  noseGeo.translate(0, 0, 1.2);
  const noseMesh = new THREE.Mesh(noseGeo, hullXRayMat);
  subRoot.add(noseMesh);

  const rearGeo = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  rearGeo.rotateX(-Math.PI / 2);
  rearGeo.translate(0, 0, -1.2);
  const rearMesh = new THREE.Mesh(rearGeo, hullXRayMat);
  subRoot.add(rearMesh);

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.25
  });
  const ringGeo = new THREE.TorusGeometry(0.86, 0.04, 16, 48);
  ringGeo.rotateX(Math.PI / 2);
  [-0.8, 0, 0.8].forEach((z) => {
    const ring = new THREE.Mesh(ringGeo, titaniumMat);
    ring.position.z = z;
    subRoot.add(ring);
  });

  const ballastMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x6b2f00,
    emissiveIntensity: 0.25,
    metalness: 0.55,
    roughness: 0.35
  });
  const ballastGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.0, 16);
  ballastGeo.rotateX(Math.PI / 2);
  [-1, 1].forEach((x) => {
    const tank = new THREE.Mesh(ballastGeo, ballastMat);
    tank.position.set(x, -0.55, 0);
    subRoot.add(tank);
  });

  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.45,
    roughness: 0.55
  });
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 1.9), interiorMat);
  floorMesh.position.set(0, -0.48, 0);
  subRoot.add(floorMesh);

  const consoleMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.0,
    metalness: 0.4,
    roughness: 0.3
  });
  const consoleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.55), consoleMat);
  consoleMesh.position.set(0, -0.15, 0.05);
  subRoot.add(consoleMesh);

  const crewGroup = new THREE.Group();
  const crewBodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0x174766,
    emissiveIntensity: 0.3,
    roughness: 0.65
  });
  const crewHeadMat = new THREE.MeshStandardMaterial({
    color: 0xf1c27d,
    roughness: 0.8
  });
  [-0.38, 0.38].forEach((x) => {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.42, 12), crewBodyMat);
    body.position.set(x, -0.12, -0.48);
    crewGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), crewHeadMat);
    head.position.set(x, 0.18, -0.48);
    crewGroup.add(head);

    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.45,
        metalness: 0.65,
        roughness: 0.15
      })
    );
    helmet.position.copy(head.position);
    crewGroup.add(helmet);
  });
  subRoot.add(crewGroup);

  const airPocketMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const airPocket = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), airPocketMat);
  airPocket.position.set(0, 0, -0.05);
  subRoot.add(airPocket);

  const spot = new THREE.SpotLight(0xa5f3fc, 8.0, 18, Math.PI / 5);
  spot.position.set(0, 0, 1.1);
  spot.target.position.set(0, 0, 8);
  subRoot.add(spot, spot.target);

  const coneGeo = new THREE.ConeGeometry(1.05, 5.0, 32, 1, true);
  coneGeo.rotateX(Math.PI / 2);
  coneGeo.translate(0, 0, 3.0);
  const lightCone = new THREE.Mesh(
    coneGeo,
    new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  subRoot.add(lightCone);

  const arrowMeshes = [];
  const arrowMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0x7c2d12,
    emissiveIntensity: 0.65,
    metalness: 0.2,
    roughness: 0.4
  });
  const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8);
  const tipGeo = new THREE.ConeGeometry(0.075, 0.18, 10);
  tipGeo.translate(0, -0.3, 0);

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(shaftGeo, arrowMat);
    const tip = new THREE.Mesh(tipGeo, arrowMat);
    shaft.position.y = 0.03;
    tip.position.y = -0.18;
    group.add(shaft, tip);

    const radius = 2.15;
    group.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    group.rotation.z = angle + Math.PI / 2;
    arrowMeshes.push(group);
    scene.add(group);
  }

  const crackMat = new THREE.MeshStandardMaterial({
    color: 0xff0044,
    emissive: 0xff0044,
    emissiveIntensity: 2.0,
    metalness: 0.15,
    roughness: 0.25
  });
  const crackGeo = new THREE.TorusGeometry(0.52, 0.035, 12, 48, Math.PI * 1.35);
  crackGeo.rotateY(Math.PI / 2);
  const crackMesh = new THREE.Mesh(crackGeo, crackMat);
  crackMesh.position.set(0.84, 0.08, 0.1);
  subRoot.add(crackMesh);

  const particleCount = 400;
  const debrisGeo = new THREE.BufferGeometry();
  const debrisPositions = new Float32Array(particleCount * 3);
  const debrisVel = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.9 + Math.random() * 2.2;
    debrisPositions[i3] = Math.cos(angle) * radius;
    debrisPositions[i3 + 1] = (Math.random() - 0.5) * 3.0;
    debrisPositions[i3 + 2] = Math.sin(angle) * radius;
    debrisVel[i3] = -debrisPositions[i3] * (0.15 + Math.random() * 0.35);
    debrisVel[i3 + 1] = (Math.random() - 0.5) * 0.35;
    debrisVel[i3 + 2] = -debrisPositions[i3 + 2] * (0.15 + Math.random() * 0.35);
  }
  debrisGeo.setAttribute("position", new THREE.BufferAttribute(debrisPositions, 3));
  const debrisMat = new THREE.PointsMaterial({
    color: 0xff5577,
    size: 0.045,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const debrisPoints = new THREE.Points(debrisGeo, debrisMat);
  scene.add(debrisPoints);

  const snowCount = 600;
  const snowGeo = new THREE.BufferGeometry();
  const snowPositions = new Float32Array(snowCount * 3);
  for (let i = 0; i < snowCount; i++) {
    const i3 = i * 3;
    snowPositions[i3] = (Math.random() - 0.5) * 18;
    snowPositions[i3 + 1] = (Math.random() - 0.5) * 14;
    snowPositions[i3 + 2] = (Math.random() - 0.5) * 18;
  }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPositions, 3));
  const snowMat = new THREE.PointsMaterial({
    color: 0x9bdcf5,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  });
  scene.add(new THREE.Points(snowGeo, snowMat));

  scene.add(new THREE.AmbientLight(0x0a223a, 1.8));

  const directional = new THREE.DirectionalLight(0x38bdf8, 2.2);
  directional.position.set(2, 6, 3);
  scene.add(directional);

  const cabinLight = new THREE.PointLight(0x00f5ff, 2.5, 8);
  cabinLight.position.set(0, 0.2, 0);
  subRoot.add(cabinLight);

  return {
    subRoot,
    hullMesh,
    noseMesh,
    rearMesh,
    hullXRayMat,
    airPocketMat,
    consoleMesh,
    lightCone,
    arrowMeshes,
    crackMesh,
    crackMat,
    debrisGeo,
    debrisMat,
    debrisVel,
    snowGeo,
    snowCount,
    particleCount
  };
}