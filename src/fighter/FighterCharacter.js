import * as THREE from 'three';

/**
 * Lutador anatômico profissional estilo "Ultimato AI".
 * Manequim com silhueta atlética + calções e luvas de boxe profissionais + modo Raio-X
 * (crânio, cérebro com fissura e giros, coluna cervical/dorsal completa, 10 pares de costelas, órgãos e nervos amarelos).
 */

const PALETTES = {
  red: { glove: 0xdc2626, shorts: 0xe11d48, trim: 0xffffff },
  blue: { glove: 0x2563eb, shorts: 0x1d4ed8, trim: 0xffffff }
};

function lathe(profile, seg = 36) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, seg);
  g.computeVertexNormals();
  return g;
}

function limbGeometry(len, rTop, rBelly, rBot, bellyAt = 0.35) {
  const prof = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    let r;
    if (t < bellyAt) {
      const k = t / bellyAt;
      r = rTop + (rBelly - rTop) * Math.sin(k * Math.PI * 0.5);
    } else {
      const k = (t - bellyAt) / (1 - bellyAt);
      r = rBelly + (rBot - rBelly) * (1 - Math.cos(k * Math.PI * 0.5));
    }
    prof.push([r, -t * len]);
  }
  prof.unshift([0.0001, 0.002]);
  prof.push([0.0001, -len - 0.002]);
  return lathe(prof, 28);
}

function ellipsoid(rx, ry, rz, seg = 28) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
  g.scale(rx, ry, rz);
  return g;
}

function mesh(geo, mat, x = 0, y = 0, z = 0, parent = null) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

function tube(points, radius, mat, parent, seg = 36) {
  const curve = new THREE.CatmullRomCurve3(points);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, radius, 8, false), mat);
  parent.add(m);
  return m;
}

export function createFighter(options = {}) {
  const corner = options.corner || 'red';
  const pal = PALETTES[corner] || PALETTES.red;

  // MATERIAIS THREE.MeshStandardMaterial COMPATÍVEIS COM TODAS VERSÕES
  const skinSolid = new THREE.MeshStandardMaterial({
    color: 0x475569, // Smoked satin grey característico do Ultimato AI
    roughness: 0.38,
    metalness: 0.18
  });

  const skinXRay = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.12,
    transparent: true,
    opacity: 0.24,
    depthWrite: false
  });

  const gloveMat = new THREE.MeshStandardMaterial({
    color: pal.glove,
    roughness: 0.18,
    metalness: 0.22
  });

  const shortsMat = new THREE.MeshStandardMaterial({
    color: pal.shorts,
    roughness: 0.42,
    metalness: 0.08
  });

  const trimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const darkBandMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.05 });
  const skullMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, transparent: true, opacity: 0.45, depthWrite: false });
  const brainMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35, metalness: 0.05, emissive: 0x9f1239, emissiveIntensity: 0.35 });
  const nerveMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 2.2, roughness: 0.2 });
  const lungMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5, transparent: true, opacity: 0.65, depthWrite: false });
  const heartMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.35, metalness: 0.1 });
  const gutMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.5, transparent: true, opacity: 0.65, depthWrite: false });

  const skinMeshes = [];
  const S = (geo, x, y, z, parent) => {
    const m = mesh(geo, skinSolid, x, y, z, parent);
    skinMeshes.push(m);
    return m;
  };

  const xrayGroups = [];
  const XG = (parent) => {
    const g = new THREE.Group();
    g.visible = false;
    parent.add(g);
    xrayGroups.push(g);
    return g;
  };

  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  // ================= QUADRIL =================
  const hips = new THREE.Group();
  hips.position.y = 0.98;
  root.add(hips);

  S(ellipsoid(0.165, 0.11, 0.115), 0, 0.0, 0, hips);
  S(ellipsoid(0.095, 0.085, 0.07), -0.075, -0.03, -0.06, hips);
  S(ellipsoid(0.095, 0.085, 0.07), 0.075, -0.03, -0.06, hips);

  // SHORTS DE BOXE COM ELÁSTICO BRANCO LARGO
  const shortsBody = mesh(lathe([
    [0.001, 0.115], [0.172, 0.115], [0.178, 0.06], [0.185, -0.02], [0.19, -0.09], [0.001, -0.09]
  ], 40), shortsMat, 0, 0, 0, hips);
  shortsBody.scale.set(1, 1, 0.78);
  const waist = mesh(new THREE.CylinderGeometry(0.176, 0.174, 0.05, 40, 1, true), trimMat, 0, 0.1, 0, hips);
  waist.scale.set(1, 1, 0.78);
  const band = mesh(new THREE.CylinderGeometry(0.177, 0.177, 0.012, 40, 1, true), darkBandMat, 0, 0.1, 0, hips);
  band.scale.set(1, 1, 0.78);

  // ================= TRONCO =================
  const spine = new THREE.Group();
  spine.position.y = 0.09;
  hips.add(spine);

  const waistSkin = S(lathe([
    [0.001, 0.0], [0.15, 0.0], [0.145, 0.06], [0.142, 0.12], [0.15, 0.17], [0.001, 0.17]
  ], 36), 0, 0, 0, spine);
  waistSkin.scale.set(1, 1, 0.72);

  S(ellipsoid(0.05, 0.08, 0.06), -0.12, 0.08, 0.01, spine);
  S(ellipsoid(0.05, 0.08, 0.06), 0.12, 0.08, 0.01, spine);
  for (let row = 0; row < 3; row++) {
    for (const sx of [-1, 1]) {
      const a = S(ellipsoid(0.038, 0.03, 0.022, 16), sx * 0.04, 0.035 + row * 0.052, 0.088, spine);
      a.rotation.z = sx * 0.05;
    }
  }

  const chest = new THREE.Group();
  chest.position.y = 0.17;
  spine.add(chest);

  const ribSkin = S(lathe([
    [0.001, -0.01], [0.15, -0.01], [0.17, 0.06], [0.19, 0.14], [0.2, 0.2], [0.17, 0.25], [0.09, 0.28], [0.001, 0.285]
  ], 40), 0, 0, 0, chest);
  ribSkin.scale.set(1, 1, 0.66);

  for (const sx of [-1, 1]) {
    const p = S(ellipsoid(0.095, 0.065, 0.045), sx * 0.075, 0.17, 0.085, chest);
    p.rotation.z = sx * -0.18;
    p.rotation.y = sx * 0.25;
  }
  for (const sx of [-1, 1]) {
    const lat = S(ellipsoid(0.07, 0.13, 0.06), sx * 0.15, 0.1, -0.04, chest);
    lat.rotation.z = sx * 0.25;
    const trap = S(ellipsoid(0.085, 0.05, 0.06), sx * 0.075, 0.27, -0.03, chest);
    trap.rotation.z = sx * -0.5;
  }

  // ================= PESCOÇO E CABEÇA =================
  const neck = new THREE.Group();
  neck.position.y = 0.28;
  chest.add(neck);
  S(limbGeometry(0.11, 0.058, 0.06, 0.055, 0.5), 0, 0.1, -0.005, neck);
  for (const sx of [-1, 1]) {
    const scm = S(new THREE.CylinderGeometry(0.014, 0.018, 0.11, 10), sx * 0.032, 0.05, 0.025, neck);
    scm.rotation.z = sx * 0.35;
    scm.rotation.x = -0.25;
  }

  const head = new THREE.Group();
  head.position.y = 0.11;
  neck.add(head);

  S(ellipsoid(0.093, 0.112, 0.108, 36), 0, 0.1, -0.008, head);
  S(ellipsoid(0.078, 0.09, 0.08, 32), 0, 0.065, 0.03, head);
  S(ellipsoid(0.07, 0.045, 0.07, 24), 0, 0.02, 0.035, head);
  S(ellipsoid(0.034, 0.03, 0.03, 20), 0, 0.0, 0.085, head); // queixo
  S(ellipsoid(0.014, 0.022, 0.016, 12), 0, 0.075, 0.108, head); // nariz
  for (const sx of [-1, 1]) {
    S(ellipsoid(0.012, 0.026, 0.016, 12), sx * 0.093, 0.085, -0.005, head);
    S(ellipsoid(0.03, 0.016, 0.02, 12), sx * 0.034, 0.105, 0.085, head);
    S(ellipsoid(0.03, 0.02, 0.03, 12), sx * 0.045, 0.055, 0.07, head);
  }

  // ================= BRAÇOS =================
  function buildArm(sx) {
    const shoulder = new THREE.Group();
    shoulder.position.set(sx * 0.215, 0.235, -0.01);
    chest.add(shoulder);

    S(ellipsoid(0.068, 0.07, 0.07), sx * 0.01, 0.0, 0, shoulder);
    const upper = new THREE.Group();
    shoulder.add(upper);
    S(limbGeometry(0.27, 0.058, 0.056, 0.042, 0.35), 0, -0.01, 0, upper);
    S(ellipsoid(0.036, 0.075, 0.038), 0, -0.12, 0.03, upper);
    S(ellipsoid(0.034, 0.08, 0.036), 0, -0.11, -0.03, upper);

    const elbow = new THREE.Group();
    elbow.position.y = -0.275;
    upper.add(elbow);
    S(ellipsoid(0.042, 0.042, 0.042, 16), 0, 0, 0, elbow);
    S(limbGeometry(0.24, 0.044, 0.047, 0.032, 0.25), 0, 0, 0, elbow);
    S(ellipsoid(0.03, 0.07, 0.03), sx * 0.015, -0.06, 0.012, elbow);

    const wrist = new THREE.Group();
    wrist.position.y = -0.24;
    elbow.add(wrist);

    // LUVA DE BOXE REALISTA
    const glove = new THREE.Group();
    wrist.add(glove);
    const cuff = mesh(lathe([[0.001, 0.05], [0.046, 0.05], [0.052, 0.0], [0.056, -0.04], [0.001, -0.04]], 28), gloveMat, 0, 0.0, 0, glove);
    cuff.scale.set(1, 1, 0.92);
    mesh(new THREE.TorusGeometry(0.049, 0.006, 8, 28), trimMat, 0, 0.035, 0, glove).rotation.x = Math.PI / 2;
    const fist = mesh(ellipsoid(0.072, 0.085, 0.075, 28), gloveMat, 0, -0.1, 0.015, glove);
    fist.rotation.x = 0.15;
    mesh(ellipsoid(0.068, 0.045, 0.06, 24), gloveMat, 0, -0.155, 0.04, glove);
    const thumb = mesh(ellipsoid(0.026, 0.05, 0.03, 16), gloveMat, -sx * 0.055, -0.085, 0.045, glove);
    thumb.rotation.z = sx * 0.35;
    thumb.rotation.x = 0.4;
    const lace = mesh(new THREE.BoxGeometry(0.008, 0.07, 0.004), trimMat, 0, -0.01, -0.052, glove);
    lace.rotation.x = 0.1;

    return { shoulder, upper, elbow, wrist, glove };
  }
  const armL = buildArm(-1);
  const armR = buildArm(1);

  // ================= PERNAS =================
  function buildLeg(sx) {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.088, -0.06, 0);
    hips.add(hip);

    const sl = mesh(lathe([[0.001, 0.03], [0.1, 0.03], [0.104, -0.08], [0.108, -0.2], [0.001, -0.2]], 28), shortsMat, 0, 0, 0, hip);
    sl.scale.set(1, 1, 0.95);
    const hem = mesh(new THREE.CylinderGeometry(0.109, 0.109, 0.014, 28, 1, true), trimMat, 0, -0.193, 0, hip);
    hem.scale.set(1, 1, 0.95);

    S(limbGeometry(0.43, 0.088, 0.086, 0.054, 0.3), 0, 0, 0, hip);
    S(ellipsoid(0.05, 0.13, 0.05), sx * 0.025, -0.24, 0.035, hip);
    S(ellipsoid(0.04, 0.09, 0.04), -sx * 0.03, -0.33, 0.04, hip);

    const knee = new THREE.Group();
    knee.position.y = -0.43;
    hip.add(knee);
    S(ellipsoid(0.052, 0.05, 0.052, 16), 0, 0, 0.004, knee);
    S(limbGeometry(0.42, 0.052, 0.058, 0.032, 0.28), 0, 0, 0, knee);
    S(ellipsoid(0.038, 0.09, 0.04), 0, -0.12, -0.035, knee);

    const ankle = new THREE.Group();
    ankle.position.y = -0.42;
    knee.add(ankle);
    S(ellipsoid(0.034, 0.03, 0.034, 14), 0, 0, 0, ankle);
    const foot = S(ellipsoid(0.042, 0.03, 0.105, 20), 0, -0.035, 0.05, ankle);
    foot.rotation.x = -0.05;

    return { hip, knee, ankle };
  }
  const legL = buildLeg(-1);
  const legR = buildLeg(1);

  // ================= ANATOMIA RAIO-X =================
  const headX = XG(head);
  const skull = mesh(ellipsoid(0.085, 0.098, 0.097, 32), skullMat, 0, 0.105, -0.008, headX);
  skull.renderOrder = 2;
  const mandible = mesh(new THREE.TorusGeometry(0.052, 0.012, 10, 24, Math.PI), skullMat, 0, 0.03, 0.025, headX);
  mandible.rotation.x = Math.PI / 2 + 0.2;
  mandible.rotation.z = Math.PI;

  // CÉREBRO COM FISSURA E GIROS CORTICAIS
  const brainGeo = new THREE.SphereGeometry(1, 48, 36);
  const bp = brainGeo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < bp.count; i++) {
    v.fromBufferAttribute(bp, i);
    const g = 0.04 * Math.sin(v.x * 23 + Math.sin(v.y * 7) * 2) * Math.sin(v.y * 19 + v.z * 5);
    const fissure = Math.exp(-Math.pow(v.x / 0.08, 2)) * 0.12 * Math.max(0, v.y + 0.3);
    v.multiplyScalar(1 + g - fissure);
    bp.setXYZ(i, v.x, v.y, v.z);
  }
  brainGeo.computeVertexNormals();
  brainGeo.scale(0.072, 0.07, 0.088);
  const brain = new THREE.Group();
  brain.position.set(0, 0.115, -0.01);
  headX.add(brain);
  mesh(brainGeo, brainMat, 0, 0, 0, brain);
  mesh(ellipsoid(0.045, 0.026, 0.035, 20), brainMat, 0, -0.045, -0.055, brain);

  // Tronco encefálico e nervos amarelos
  const brainstem = tube([
    new THREE.Vector3(0, 0.08, -0.02),
    new THREE.Vector3(0, 0.03, -0.03),
    new THREE.Vector3(0, -0.04, -0.035),
    new THREE.Vector3(0, -0.11, -0.03)
  ], 0.011, nerveMat, headX, 20);

  // Coluna cervical (7 vértebras no pescoço)
  const neckX = XG(neck);
  const cervical = [];
  for (let i = 0; i < 7; i++) {
    const vt = mesh(new THREE.CylinderGeometry(0.019, 0.021, 0.012, 12), boneMat, 0, 0.1 - i * 0.016, -0.03, neckX);
    mesh(new THREE.BoxGeometry(0.008, 0.008, 0.02), boneMat, 0, 0, -0.018, vt);
    for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(0.018, 0.006, 0.008), boneMat, sx * 0.02, 0, -0.006, vt);
    cervical.push(vt);
  }
  tube([new THREE.Vector3(0, 0.12, -0.03), new THREE.Vector3(0, -0.02, -0.03)], 0.007, nerveMat, neckX, 10);

  // Coluna torácica e 10 pares de costelas 3D no tórax
  const chestX = XG(chest);
  for (let i = 0; i < 12; i++) {
    const y = 0.27 - i * 0.022;
    const vt = mesh(new THREE.CylinderGeometry(0.019, 0.02, 0.014, 12), boneMat, 0, y, -0.075, chestX);
    mesh(new THREE.BoxGeometry(0.008, 0.01, 0.025), boneMat, 0, -0.004, -0.02, vt);
  }
  tube([new THREE.Vector3(0, 0.3, -0.072), new THREE.Vector3(0, -0.02, -0.072)], 0.006, nerveMat, chestX, 14);

  for (let i = 0; i < 10; i++) {
    const y = 0.245 - i * 0.022;
    const w = 0.11 + Math.sin((i / 9) * Math.PI) * 0.06 + i * 0.002;
    const d = 0.09 + Math.sin((i / 9) * Math.PI) * 0.02;
    const front = i < 7 ? 0.085 : 0.06 - (i - 7) * 0.02;
    for (const sx of [-1, 1]) {
      tube([
        new THREE.Vector3(sx * 0.02, y, -0.075),
        new THREE.Vector3(sx * w * 0.75, y + 0.005, -0.07),
        new THREE.Vector3(sx * w, y - 0.012, 0.0),
        new THREE.Vector3(sx * w * 0.7, y - 0.03, front * 0.85),
        new THREE.Vector3(sx * (i < 7 ? 0.018 : w * 0.45), y - 0.04, i < 7 ? front : front * 0.9)
      ], 0.0055, boneMat, chestX, 20);
    }
  }
  mesh(new THREE.BoxGeometry(0.025, 0.15, 0.01), boneMat, 0, 0.17, 0.088, chestX);
  for (const sx of [-1, 1]) {
    tube([new THREE.Vector3(sx * 0.015, 0.27, 0.07), new THREE.Vector3(sx * 0.1, 0.285, 0.04), new THREE.Vector3(sx * 0.19, 0.255, -0.01)], 0.007, boneMat, chestX, 12);
    const lung = mesh(ellipsoid(0.065, 0.1, 0.06, 16), lungMat, sx * 0.07, 0.15, -0.005, chestX);
    lung.rotation.z = sx * 0.1;
  }
  mesh(ellipsoid(0.04, 0.05, 0.035, 16), heartMat, 0.018, 0.13, 0.04, chestX).rotation.z = -0.4;

  // Abdômen: lombar e intestinos
  const spineX = XG(spine);
  for (let i = 0; i < 5; i++) {
    mesh(new THREE.CylinderGeometry(0.024, 0.025, 0.022, 12), boneMat, 0, 0.15 - i * 0.033, -0.065, spineX);
  }
  tube([new THREE.Vector3(0, 0.18, -0.062), new THREE.Vector3(0, -0.02, -0.062)], 0.006, nerveMat, spineX, 10);
  for (let i = 0; i < 8; i++) {
    const a = i * 1.7;
    mesh(new THREE.TorusGeometry(0.022, 0.011, 8, 14), gutMat, Math.cos(a) * 0.05, 0.03 + (i % 3) * 0.035, 0.03 + Math.sin(a) * 0.015, spineX).rotation.set(a, a * 0.5, 0);
  }

  // Pelve óssea
  const hipsX = XG(hips);
  for (const sx of [-1, 1]) {
    const ilium = mesh(ellipsoid(0.07, 0.06, 0.02, 16), boneMat, sx * 0.075, 0.02, -0.02, hipsX);
    ilium.rotation.y = sx * 0.6;
  }
  mesh(ellipsoid(0.035, 0.05, 0.02, 14), boneMat, 0, -0.01, -0.07, hipsX);

  // ================= API =================
  function setXRay(on, opacity = 0.24) {
    skinXRay.opacity = opacity;
    for (const m of skinMeshes) {
      m.material = on ? skinXRay : skinSolid;
      m.castShadow = !on;
      m.renderOrder = on ? 5 : 0;
    }
    for (const g of xrayGroups) g.visible = on;
  }

  function setShock(intensity) {
    nerveMat.emissiveIntensity = 2.0 + intensity * 4.5;
    nerveMat.color.setHex(intensity > 0.5 ? 0xffffff : 0xfacc15);
  }

  const POSES = {
    tpose() {
      for (const [a, sx] of [[armL, -1], [armR, 1]]) {
        a.shoulder.rotation.set(0, 0, sx * 1.45);
        a.elbow.rotation.set(0, 0, 0);
        a.wrist.rotation.set(0, 0, 0);
      }
      for (const l of [legL, legR]) { l.hip.rotation.set(0, 0, 0); l.knee.rotation.set(0, 0, 0); l.ankle.rotation.set(0, 0, 0); }
      hips.position.y = 0.98; spine.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); neck.rotation.set(0, 0, 0);
    },
    guard() {
      for (const [a, sx] of [[armL, -1], [armR, 1]]) {
        a.shoulder.rotation.set(-0.55, sx * 0.15, sx * 0.32);
        a.elbow.rotation.set(-2.2, 0, sx * -0.15);
        a.wrist.rotation.set(0.25, 0, 0);
      }
      armL.shoulder.rotation.x = -0.75;
      legL.hip.rotation.set(-0.28, 0, -0.06); legL.knee.rotation.set(0.32, 0, 0); legL.ankle.rotation.set(-0.04, 0, 0);
      legR.hip.rotation.set(0.22, 0, 0.06); legR.knee.rotation.set(0.25, 0, 0); legR.ankle.rotation.set(-0.47, 0, 0);
      hips.position.y = 0.95;
      spine.rotation.set(0.08, 0, 0);
      neck.rotation.set(0.12, 0, 0);
      head.rotation.set(0.05, 0, 0);
    },
    relaxed() {
      for (const [a, sx] of [[armL, -1], [armR, 1]]) {
        a.shoulder.rotation.set(0.05, 0, sx * 0.12);
        a.elbow.rotation.set(-0.25, 0, 0);
        a.wrist.rotation.set(0, 0, 0);
      }
      for (const l of [legL, legR]) { l.hip.rotation.set(0, 0, 0); l.knee.rotation.set(0.02, 0, 0); l.ankle.rotation.set(0, 0, 0); }
      hips.position.y = 0.98; spine.rotation.set(0, 0, 0); neck.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
    }
  };

  function setPose(name) {
    (POSES[name] || POSES.guard)();
  }

  setPose('guard');

  return {
    group, root, hips, spine, chest, neck, head, brain, brainstem, cervical,
    arms: { left: armL, right: armR },
    legs: { left: legL, right: legR },
    setXRay, setShock, setPose,
    materials: { skinSolid, skinXRay, gloveMat, shortsMat }
  };
}
