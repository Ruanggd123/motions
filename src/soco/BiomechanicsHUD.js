import * as THREE from 'three';

export function createBiomechanicsHUD(scene) {
  const hudGroup = new THREE.Group();
  scene.add(hudGroup);

  // 1. LINHA DE FORÇA RETA (SOCO RETO NO NARIZ/CENTRO)
  const straightLineGroup = new THREE.Group();
  straightLineGroup.visible = false;
  hudGroup.add(straightLineGroup);

  // Linha tracejada reta
  const straightPoints = [
    new THREE.Vector3(0, 1.76, 1.2),
    new THREE.Vector3(0, 1.76, -0.4)
  ];
  const straightGeom = new THREE.BufferGeometry().setFromPoints(straightPoints);
  const straightMat = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    dashSize: 0.08,
    gapSize: 0.04,
    linewidth: 2
  });
  const straightLine = new THREE.Line(straightGeom, straightMat);
  straightLine.computeLineDistances();
  straightLineGroup.add(straightLine);

  // Seta na ponta
  const straightArrowGeom = new THREE.ConeGeometry(0.045, 0.12, 12);
  straightArrowGeom.rotateX(-Math.PI / 2);
  const straightArrowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const straightArrow = new THREE.Mesh(straightArrowGeom, straightArrowMat);
  straightArrow.position.set(0, 1.76, -0.4);
  straightLineGroup.add(straightArrow);

  // 2. LINHA DE ALAVANCA DO GANCHO (DISTÂNCIA DO EIXO ATÉ O QUEIXO)
  const leverGroup = new THREE.Group();
  leverGroup.visible = false;
  hudGroup.add(leverGroup);

  // Linha de cota amarela da coluna ao queixo
  const leverPoints = [
    new THREE.Vector3(0, 1.62, 0.0), // Eixo da coluna
    new THREE.Vector3(0.12, 1.62, 0.18) // Ponta do queixo
  ];
  const leverGeom = new THREE.BufferGeometry().setFromPoints(leverPoints);
  const leverMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 3 });
  const leverLine = new THREE.Line(leverGeom, leverMat);
  leverGroup.add(leverLine);

  // Pontos de extremidade
  const dotGeom = new THREE.SphereGeometry(0.022, 12, 10);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const dotAxis = new THREE.Mesh(dotGeom, dotMat);
  dotAxis.position.copy(leverPoints[0]);
  leverGroup.add(dotAxis);

  const dotChin = new THREE.Mesh(dotGeom, dotMat);
  dotChin.position.copy(leverPoints[1]);
  leverGroup.add(dotChin);

  // 3. ARCO DE TORQUE ROTACIONAL (VISÃO TOP-DOWN)
  const torqueGroup = new THREE.Group();
  torqueGroup.visible = false;
  hudGroup.add(torqueGroup);

  // Curva de arco circular no topo da cabeça
  const arcCurve = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    0.32, 0.32,      // xRadius, yRadius
    -Math.PI * 0.1,  // aStartAngle
    Math.PI * 0.55,  // aEndAngle
    false,           // aClockwise
    0                // aRotation
  );
  const arcPoints2D = arcCurve.getPoints(32);
  const arcPoints3D = arcPoints2D.map(p => new THREE.Vector3(p.x, 2.12, p.y));
  const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints3D);
  const arcMat = new THREE.LineDashedMaterial({
    color: 0xf59e0b,
    dashSize: 0.05,
    gapSize: 0.03,
    linewidth: 3
  });
  const arcLine = new THREE.Line(arcGeom, arcMat);
  arcLine.computeLineDistances();
  torqueGroup.add(arcLine);

  // Seta de rotação na ponta do arco
  const lastArcPt = arcPoints3D[arcPoints3D.length - 1];
  const prevArcPt = arcPoints3D[arcPoints3D.length - 2];
  const arcDir = new THREE.Vector3().subVectors(lastArcPt, prevArcPt).normalize();

  const arcArrowGeom = new THREE.ConeGeometry(0.04, 0.10, 10);
  const arcArrowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const arcArrow = new THREE.Mesh(arcArrowGeom, arcArrowMat);
  arcArrow.position.copy(lastArcPt);
  arcArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arcDir);
  torqueGroup.add(arcArrow);

  // 4. ONDAS DE CHOQUE DE IMPACTO (IMPACT SHOCKWAVES)
  const shockwaves = [];
  for (let i = 0; i < 3; i++) {
    const swGeom = new THREE.RingGeometry(0.04, 0.065, 32);
    const swMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const swMesh = new THREE.Mesh(swGeom, swMat);
    swMesh.position.set(0.12, 1.62, 0.18);
    swMesh.visible = false;
    hudGroup.add(swMesh);
    shockwaves.push(swMesh);
  }

  function triggerImpact(timeSinceImpact) {
    if (timeSinceImpact < 0 || timeSinceImpact > 0.8) {
      shockwaves.forEach(sw => { sw.visible = false; });
      return;
    }

    shockwaves.forEach((sw, idx) => {
      const delay = idx * 0.08;
      const t = timeSinceImpact - delay;
      if (t > 0 && t < 0.6) {
        sw.visible = true;
        const progress = t / 0.6;
        const scale = 1.0 + progress * 5.0;
        sw.scale.set(scale, scale, scale);
        sw.material.opacity = Math.max(0, (1.0 - progress) * 0.9);
      } else {
        sw.visible = false;
      }
    });
  }

  return {
    hudGroup,
    straightLineGroup,
    leverGroup,
    torqueGroup,
    triggerImpact
  };
}
