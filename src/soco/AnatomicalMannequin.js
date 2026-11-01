import * as THREE from 'three';

export function createAnatomicalMannequin(options = {}) {
  const {
    gloveColor = 0xdc2626,
    shortsColor = 0xe11d48,
    bodyColor = 0x3b4252, // Smoked satin grey premium (Estilo Ultimato AI)
    isVictim = false
  } = options;

  const group = new THREE.Group();

  // MATERIAIS PRINCIPAIS (SMOKED MANNEQUIN CINEMATOGRÁFICO)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.36,
    metalness: 0.22
  });

  const bodyTranslucentMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    transparent: true,
    opacity: 0.32,
    roughness: 0.25,
    metalness: 0.15,
    depthWrite: false
  });

  const shortsMaterial = new THREE.MeshStandardMaterial({
    color: shortsColor,
    roughness: 0.45,
    metalness: 0.08
  });

  const waistbandMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.05
  });

  const gloveMaterial = new THREE.MeshStandardMaterial({
    color: gloveColor,
    roughness: 0.18,
    metalness: 0.22
  });

  const bootMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.5,
    metalness: 0.1
  });

  // MATERIAIS ANATÔMICOS DE RAIO-X (OSSOS, CÉREBRO, NERVOS)
  const boneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.25,
    metalness: 0.08
  });

  const brainMaterial = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    roughness: 0.3,
    metalness: 0.1,
    emissive: 0x9f1239,
    emissiveIntensity: 0.35
  });

  const nerveYellowMaterial = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 2.2,
    roughness: 0.2
  });

  // ROOT PIVOT
  const root = new THREE.Group();
  group.add(root);

  // PELVIS & QUADRIL
  const pelvisPivot = new THREE.Group();
  pelvisPivot.position.y = 1.0;
  root.add(pelvisPivot);

  const pelvisGeom = new THREE.CylinderGeometry(0.24, 0.21, 0.20, 20);
  const pelvisMesh = new THREE.Mesh(pelvisGeom, shortsMaterial);
  pelvisPivot.add(pelvisMesh);

  const waistbandGeom = new THREE.CylinderGeometry(0.245, 0.245, 0.06, 20);
  const waistbandMesh = new THREE.Mesh(waistbandGeom, waistbandMaterial);
  waistbandMesh.position.y = 0.08;
  pelvisPivot.add(waistbandMesh);

  // TORSO PIVOT
  const torsoPivot = new THREE.Group();
  torsoPivot.position.y = 0.10;
  pelvisPivot.add(torsoPivot);

  // Casca Externa do Tórax (Abdômen e Peito)
  const absGeom = new THREE.CylinderGeometry(0.26, 0.23, 0.22, 20);
  const absMesh = new THREE.Mesh(absGeom, isVictim ? bodyTranslucentMaterial : bodyMaterial);
  absMesh.position.y = 0.11;
  torsoPivot.add(absMesh);

  const chestGeom = new THREE.CylinderGeometry(0.31, 0.26, 0.28, 20);
  const chestMesh = new THREE.Mesh(chestGeom, isVictim ? bodyTranslucentMaterial : bodyMaterial);
  chestMesh.position.y = 0.34;
  torsoPivot.add(chestMesh);

  // --- ESTRUTURA ÓSSEA DO TÓRAX (COSTELAS E COLUNA DORSAL RAIO-X) ---
  const internalSkeletonGroup = new THREE.Group();
  internalSkeletonGroup.visible = isVictim;
  torsoPivot.add(internalSkeletonGroup);

  // Coluna Dorsal / Torácica
  for (let i = 0; i < 6; i++) {
    const tVertebra = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.045, 0.035, 12),
      boneMaterial
    );
    tVertebra.position.set(0, 0.08 + i * 0.055, -0.05);
    internalSkeletonGroup.add(tVertebra);
  }

  // Costelas 3D (Rib Cage estilizada curva)
  for (let r = 0; r < 5; r++) {
    const yRib = 0.16 + r * 0.05;
    const ribRadiusX = 0.22 - r * 0.015;
    const ribRadiusZ = 0.15 - r * 0.01;

    const ribCurve = new THREE.EllipseCurve(
      0, 0,
      ribRadiusX, ribRadiusZ,
      -Math.PI * 0.85, Math.PI * 0.85,
      false, 0
    );
    const ribPts = ribCurve.getPoints(24).map(p => new THREE.Vector3(p.x, yRib, p.y));
    const ribGeom = new THREE.BufferGeometry().setFromPoints(ribPts);
    const ribLine = new THREE.Line(ribGeom, new THREE.LineBasicMaterial({ color: 0xf1f5f9, linewidth: 2 }));
    internalSkeletonGroup.add(ribLine);
  }

  // PESCOÇO PIVOT
  const neckPivot = new THREE.Group();
  neckPivot.position.y = 0.48;
  torsoPivot.add(neckPivot);

  const neckGeom = new THREE.CylinderGeometry(0.10, 0.12, 0.16, 16);
  const neckMesh = new THREE.Mesh(neckGeom, isVictim ? bodyTranslucentMaterial : bodyMaterial);
  neckMesh.position.y = 0.08;
  neckPivot.add(neckMesh);

  // CABEÇA PIVOT
  const headPivot = new THREE.Group();
  headPivot.position.y = 0.18;
  neckPivot.add(headPivot);

  // Cabeça Externa (Cúpula Translúcida no Raio-X)
  const headGroup = new THREE.Group();
  headPivot.add(headGroup);

  const craniumGeom = new THREE.SphereGeometry(0.19, 24, 20);
  craniumGeom.scale(1.0, 1.12, 1.15);
  const headMesh = new THREE.Mesh(craniumGeom, isVictim ? bodyTranslucentMaterial : bodyMaterial);
  headMesh.position.y = 0.06;
  headGroup.add(headMesh);

  // Mandíbula e Queixo (O ponto da alavanca!)
  const jawGeom = new THREE.BoxGeometry(0.17, 0.13, 0.22);
  const jawMesh = new THREE.Mesh(jawGeom, isVictim ? bodyTranslucentMaterial : bodyMaterial);
  jawMesh.position.set(0, -0.05, 0.06);
  jawMesh.rotation.x = 0.35;
  headGroup.add(jawMesh);

  const chinGeom = new THREE.SphereGeometry(0.07, 16, 12);
  const chinMesh = new THREE.Mesh(chinGeom, isVictim ? bodyTranslucentMaterial : bodyMaterial);
  chinMesh.position.set(0, -0.13, 0.15);
  headGroup.add(chinMesh);

  // Marcador de Centro do Eixo Cervical no topo da cabeça
  const axisMarkerGeom = new THREE.RingGeometry(0.035, 0.055, 20);
  axisMarkerGeom.rotateX(-Math.PI / 2);
  const axisMarkerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
  const axisMarker = new THREE.Mesh(axisMarkerGeom, axisMarkerMat);
  axisMarker.position.y = 0.28;
  axisMarker.visible = isVictim;
  headGroup.add(axisMarker);

  // --- ANATOMIA INTERNA DA CABEÇA (CÉREBRO + COLUNA CERVICAL + TRONCO ENCEFÁLICO) ---
  const headAnatomyGroup = new THREE.Group();
  headAnatomyGroup.visible = isVictim;
  headPivot.add(headAnatomyGroup);

  // CÉREBRO 3D (Dois hemisférios rosados + cerebelo)
  const brainPivot = new THREE.Group();
  brainPivot.position.set(0, 0.07, 0.02);
  headAnatomyGroup.add(brainPivot);

  const hemiL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 14), brainMaterial);
  hemiL.geometry.scale(0.85, 0.95, 1.15);
  hemiL.position.x = -0.06;
  brainPivot.add(hemiL);

  const hemiR = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 14), brainMaterial);
  hemiR.geometry.scale(0.85, 0.95, 1.15);
  hemiR.position.x = 0.06;
  brainPivot.add(hemiR);

  const cerebelo = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 12), brainMaterial);
  cerebelo.geometry.scale(1.2, 0.75, 0.9);
  cerebelo.position.set(0, -0.08, -0.07);
  brainPivot.add(cerebelo);

  // COLUNA CERVICAL (7 Vértebras C1 a C7 brancas)
  const spineGroup = new THREE.Group();
  spineGroup.position.set(0, -0.18, -0.04);
  headAnatomyGroup.add(spineGroup);

  const vertebrae = [];
  for (let i = 0; i < 7; i++) {
    const vGroup = new THREE.Group();
    vGroup.position.y = -i * 0.034;

    const vBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.048, 0.024, 14),
      boneMaterial
    );
    vGroup.add(vBody);

    const vSpine = new THREE.Mesh(
      new THREE.ConeGeometry(0.018, 0.038, 8),
      boneMaterial
    );
    vSpine.rotation.x = Math.PI / 2;
    vSpine.position.z = -0.045;
    vGroup.add(vSpine);

    spineGroup.add(vGroup);
    vertebrae.push(vGroup);
  }

  // TRONCO ENCEFÁLICO & NERVOS (Amarelo Neon Fluorescente)
  const brainstemMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.022, 0.28, 14),
    nerveYellowMaterial
  );
  brainstemMesh.position.set(0, -0.14, -0.03);
  headAnatomyGroup.add(brainstemMesh);

  // Luz Interna Volumétrica Raio-X
  const xRayLight = new THREE.PointLight(0xfacc15, 0, 1.5);
  xRayLight.position.set(0, 0.05, 0);
  headPivot.add(xRayLight);

  // BRAÇOS E LUVAS DE BOXE PROFISSIONAIS
  function createArm(isLeft) {
    const sign = isLeft ? -1 : 1;
    const armRoot = new THREE.Group();
    armRoot.position.set(sign * 0.34, 0.38, 0);
    torsoPivot.add(armRoot);

    const shoulderPivot = new THREE.Group();
    armRoot.add(shoulderPivot);

    const shoulderMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.088, 16, 14),
      bodyMaterial
    );
    shoulderPivot.add(shoulderMesh);

    const upperArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.065, 0.27, 16),
      bodyMaterial
    );
    upperArmMesh.position.y = -0.135;
    shoulderPivot.add(upperArmMesh);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.y = -0.27;
    shoulderPivot.add(elbowPivot);

    const elbowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 14, 12),
      bodyMaterial
    );
    elbowPivot.add(elbowMesh);

    const forearmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.06, 0.25, 16),
      bodyMaterial
    );
    forearmMesh.position.y = -0.125;
    elbowPivot.add(forearmMesh);

    const wristPivot = new THREE.Group();
    wristPivot.position.y = -0.25;
    elbowPivot.add(wristPivot);

    // LUVA DE BOXE REALISTA
    const gloveGroup = new THREE.Group();
    wristPivot.add(gloveGroup);

    // Bloco acolchoado principal
    const gloveBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.20, 0.16),
      gloveMaterial
    );
    gloveBody.position.set(0, -0.06, 0.02);
    gloveGroup.add(gloveBody);

    // Cúpula frontal arredondada de impacto
    const gloveTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.10, 16, 14),
      gloveMaterial
    );
    gloveTop.geometry.scale(0.95, 0.9, 0.85);
    gloveTop.position.set(0, -0.13, 0.02);
    gloveGroup.add(gloveTop);

    // Polegar anatômico
    const thumb = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 14, 12),
      gloveMaterial
    );
    thumb.geometry.scale(0.8, 1.35, 0.9);
    thumb.position.set(sign * 0.08, -0.06, 0.07);
    thumb.rotation.z = -sign * 0.4;
    gloveGroup.add(thumb);

    // Tira branca do pulso
    const strap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.055, 18),
      waistbandMaterial
    );
    strap.position.y = 0.035;
    gloveGroup.add(strap);

    return { armRoot, shoulderPivot, elbowPivot, wristPivot, gloveGroup };
  }

  const leftArm = createArm(true);
  const rightArm = createArm(false);

  // PERNAS E BOTAS
  function createLeg(isLeft) {
    const sign = isLeft ? -1 : 1;
    const legRoot = new THREE.Group();
    legRoot.position.set(sign * 0.13, -0.08, 0);
    pelvisPivot.add(legRoot);

    const hipPivot = new THREE.Group();
    legRoot.add(hipPivot);

    const shortsLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.15, 0.22, 16),
      shortsMaterial
    );
    shortsLeg.position.y = -0.09;
    hipPivot.add(shortsLeg);

    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.08, 0.30, 16),
      bodyMaterial
    );
    thigh.position.y = -0.23;
    hipPivot.add(thigh);

    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.40;
    hipPivot.add(kneePivot);

    const knee = new THREE.Mesh(
      new THREE.SphereGeometry(0.078, 14, 12),
      bodyMaterial
    );
    kneePivot.add(knee);

    const shin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.062, 0.35, 16),
      bodyMaterial
    );
    shin.position.y = -0.175;
    kneePivot.add(shin);

    const footPivot = new THREE.Group();
    footPivot.position.y = -0.37;
    kneePivot.add(footPivot);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.13, 0.22),
      bootMaterial
    );
    boot.position.set(0, -0.035, 0.04);
    footPivot.add(boot);

    return { legRoot, hipPivot, kneePivot, footPivot };
  }

  const leftLeg = createLeg(true);
  const rightLeg = createLeg(false);

  // MODO RAIO-X
  let currentXRay = isVictim;
  function setXRayMode(enable, opacity = 0.28) {
    currentXRay = enable;
    if (enable) {
      bodyTranslucentMaterial.opacity = opacity;
      headAnatomyGroup.visible = true;
      internalSkeletonGroup.visible = true;
      axisMarker.visible = true;
      xRayLight.intensity = 1.4;
    } else {
      headAnatomyGroup.visible = isVictim;
      internalSkeletonGroup.visible = isVictim;
      axisMarker.visible = false;
      xRayLight.intensity = 0.0;
    }
  }

  // PULSO DE CHOQUE NO TRONCO ENCEFÁLICO
  function setShockPulse(intensity = 0.0) {
    nerveYellowMaterial.emissiveIntensity = 2.0 + intensity * 4.0;
    if (intensity > 0.15) {
      nerveYellowMaterial.color.setHex(0xffffff);
      xRayLight.intensity = 1.5 + intensity * 2.5;
      xRayLight.color.setHex(0xffffff);
    } else {
      nerveYellowMaterial.color.setHex(0xfacc15);
      xRayLight.intensity = currentXRay ? 1.4 : 0.0;
      xRayLight.color.setHex(0xfacc15);
    }
  }

  return {
    group,
    root,
    pelvisPivot,
    torsoPivot,
    neckPivot,
    headPivot,
    headGroup,
    brainPivot,
    spineGroup,
    vertebrae,
    brainstemMesh,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    setXRayMode,
    setShockPulse,
    axisMarker
  };
}
