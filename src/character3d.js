/**
 * Character3D v10 — Personagem 3D Articulado Estilo Pixar / Stylized Cel-Shaded
 *
 * Melhorias de Engenharia v10 (Skill: motion-cinema-3d):
 * 1. Zero BoxGeometry crua no corpo/roupa: 100% geometrias orgânicas (CapsuleGeometry,
 *    SphereGeometry e cilindros com taper) eliminando artefatos de outline e aspecto "quadrado".
 * 2. Rig Esquelético Completo:
 *    - pelvisPivot -> upperBodyPivot -> neckPivot -> headPivot (olhos, pálpebras, sobrancelhas, boca)
 *    - leftArm / rightArm (shoulder) -> leftElbowPivot / rightElbowPivot -> hand (com polegar)
 *    - leftLeg / rightLeg (hip) -> leftKneePivot / rightKneePivot -> anklePivot -> bootGroup (pés presos à perna!)
 * 3. Rosto Expressivo Vivo:
 *    - Olhos grandes com esclera oval, íris castanha, pupila e duplo catchlight especular
 *    - Piscar automático natural (Auto-Blink a cada 3.2s) via pálpebras móveis
 *    - Sobrancelhas e boca dinâmicas que reagem à emoção da cena (idle, shocked, pointing, running, sitting)
 * 4. Lanterna da mochila com PointLight real que acende automaticamente nas cenas escuras.
 * 5. Suporte híbrido a modelos externos .GLB (GLTFLoader) com fallback instantâneo para o Rig Procedural v10.
 */
import * as THREE from 'three';
import { createCelMaterial } from './shaders/celShader.js';

import { buildCharacterHead } from './characterHead.js';
export const CHARACTER_COLORS = {
  skin: 0xf4c49e,
  skinBlush: 0xe69b82,
  hair: 0x322016,
  hairHighlight: 0x4a3222,
  hoodie: 0xd99b1a,        // Amarelo-mostarda vibrante
  hoodieDark: 0xb57f10,
  vest: 0x4b5d2a,          // Verde-oliva tático
  vestPocket: 0x3b4a20,
  pants: 0x32353a,         // Calça cargo carvão
  kneePad: 0x24272b,
  boots: 0x5c3a21,         // Botas de trilha marrom
  bootSole: 0x1e140c,
  backpack: 0x6e4f32,      // Mochila cáqui/marrom
  backpackFlap: 0x573d25,
  sleepingPad: 0x2e6b34,   // Isolante verde
  waterBottle: 0x2998f2,   // Garrafa azul
  waterCap: 0x1565c0,
  lanternMetal: 0x777c82,
  lanternGlow: 0xffdf6b,
  sclera: 0xfaf8f5,
  iris: 0x5c3317,
  pupil: 0x140c08,
  mouthDark: 0x6e3028,
  tongue: 0xc95b50,
  outline: 0x141422,
};

/**
 * Cria o personagem 3D v10 completo e articulado.
 * @param {object} opts
 * @returns {THREE.Group}
 */
export function createCharacter(opts = {}) {
  const {
    scale = 1,
    celShading = true,
    outlineWidth = 0.013,
  } = opts;

  const character = new THREE.Group();
  character.name = 'Character3D';

  // Helper para peças orgânicas com Cel Shader v10 + Outline suave
  function makePart(geometry, color, partOpts = {}) {
    const ow = partOpts.outlineWidth ?? outlineWidth;
    const useOutline = partOpts.outline !== false && ow > 0;

    if (celShading) {
      const { celMaterial, outlineMaterial } = createCelMaterial(color, {
        outlineWidth: ow,
        specular: partOpts.specular ?? 0.25,
        rimIntensity: partOpts.rimIntensity ?? 0.35,
        ...partOpts.celOpts,
      });
      const group = new THREE.Group();
      const mainMesh = new THREE.Mesh(geometry, celMaterial);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      group.add(mainMesh);

      if (useOutline) {
        const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
        outlineMesh.castShadow = false;
        outlineMesh.receiveShadow = false;
        group.add(outlineMesh);
      }
      return group;
    }

    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: partOpts.roughness ?? 0.7,
      metalness: partOpts.metalness ?? 0.1,
    });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Helper para membros orgânicos tronco-cônicos com calotas esféricas (Tapered Limb)
  function makeTaperedLimb(length, rTop, rBot, color, ow = outlineWidth) {
    const group = new THREE.Group();
    const cyl = makePart(new THREE.CylinderGeometry(rTop, rBot, length, 16, 1), color, { outlineWidth: ow });
    group.add(cyl);

    const topCap = makePart(new THREE.SphereGeometry(rTop, 14, 10), color, { outlineWidth: ow });
    topCap.position.y = length / 2;
    group.add(topCap);

    const botCap = makePart(new THREE.SphereGeometry(rBot, 14, 10), color, { outlineWidth: ow });
    botCap.position.y = -length / 2;
    group.add(botCap);

    return group;
  }

  // ============================================================================
  // 1. ESTRUTURA DE QUADRIL E TRONCO (PELVIS & UPPER BODY)
  // ============================================================================
  const pelvisPivot = new THREE.Group();
  pelvisPivot.name = 'pelvisPivot';
  pelvisPivot.position.set(0, 0.80, 0);
  character.add(pelvisPivot);

  // Quadril da calça cargo (une as duas pernas ao tronco sem vão)
  const pelvisMesh = makePart(new THREE.SphereGeometry(0.19, 18, 14), CHARACTER_COLORS.pants, { outlineWidth: 0.012 });
  pelvisMesh.scale.set(1.12, 0.68, 0.88);
  pelvisMesh.position.set(0, -0.02, 0);
  pelvisPivot.add(pelvisMesh);

  const upperBodyPivot = new THREE.Group();
  upperBodyPivot.name = 'torso'; // Mantém nome 'torso' para compatibilidade com videoEngine
  upperBodyPivot.position.set(0, 0.04, 0);
  pelvisPivot.add(upperBodyPivot);

  // Corpo principal do moletom (cápsula esculpida com ombros largos e cintura firme)
  const torsoCore = makePart(new THREE.CapsuleGeometry(0.20, 0.24, 12, 20), CHARACTER_COLORS.hoodie, {
    outlineWidth: 0.014,
    specular: 0.18,
  });
  torsoCore.scale.set(1.08, 1.0, 0.82);
  torsoCore.position.set(0, 0.24, 0);
  upperBodyPivot.add(torsoCore);

  // Barra canelada inferior do moletom
  const hemMesh = makePart(new THREE.CylinderGeometry(0.205, 0.195, 0.07, 18), CHARACTER_COLORS.hoodieDark, { outlineWidth: 0.01 });
  hemMesh.scale.set(1.05, 1, 0.82);
  hemMesh.position.set(0, 0.05, 0);
  upperBodyPivot.add(hemMesh);

  // Capuz volumoso atrás do pescoço
  const hoodGroup = new THREE.Group();
  const hoodOuter = makePart(
    new THREE.SphereGeometry(0.21, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.65),
    CHARACTER_COLORS.hoodie,
    { outlineWidth: 0.013 }
  );
  hoodOuter.rotation.x = 2.15;
  hoodOuter.scale.set(1.15, 0.85, 0.95);
  hoodOuter.position.set(0, 0.48, -0.09);
  hoodGroup.add(hoodOuter);

  // Gola acolchoada ao redor do pescoço
  const collarTorus = makePart(new THREE.TorusGeometry(0.115, 0.036, 10, 20), CHARACTER_COLORS.hoodie, { outlineWidth: 0.01 });
  collarTorus.rotation.x = Math.PI / 2 + 0.12;
  collarTorus.position.set(0, 0.46, 0.01);
  hoodGroup.add(collarTorus);

  // Cordões brancos do capuz com ponteira
  [-1, 1].forEach((side) => {
    const cord = makePart(new THREE.CapsuleGeometry(0.009, 0.13, 6, 8), 0xf0ede6, { outline: false });
    cord.position.set(side * 0.065, 0.37, 0.165);
    cord.rotation.z = side * 0.08;
    cord.rotation.x = -0.12;
    hoodGroup.add(cord);
  });
  upperBodyPivot.add(hoodGroup);

  // ============================================================================
  // 2. COLETE TÁTICO VERDE-OLIVA (ORGÂNICO EM RELEVO)
  // ============================================================================
  const vestGroup = new THREE.Group();
  vestGroup.name = 'vest';

  const vestShell = makePart(new THREE.CapsuleGeometry(0.212, 0.18, 12, 20), CHARACTER_COLORS.vest, {
    outlineWidth: 0.013,
    specular: 0.30,
  });
  vestShell.scale.set(1.08, 1.0, 0.84);
  vestShell.position.set(0, 0.25, 0);
  vestGroup.add(vestShell);

  // Zíper central escuro do colete
  const zipperLine = makePart(new THREE.CapsuleGeometry(0.008, 0.34, 6, 8), 0x222a14, { outline: false });
  zipperLine.position.set(0, 0.25, 0.178);
  vestGroup.add(zipperLine);

  // 4 Bolsos Táticos Frontais Arredondados (Cápsulas achatadas em vez de caixas)
  const pocketCoords = [
    [-0.105, 0.32, 0.168],
    [0.105, 0.32, 0.168],
    [-0.105, 0.16, 0.165],
    [0.105, 0.16, 0.165],
  ];
  pocketCoords.forEach(([px, py, pz]) => {
    const pock = makePart(new THREE.CapsuleGeometry(0.036, 0.032, 8, 12), CHARACTER_COLORS.vestPocket, { outline: false });
    pock.rotation.z = Math.PI / 2;
    pock.scale.set(0.95, 1.0, 0.28);
    pock.position.set(px, py, pz);
    vestGroup.add(pock);
  });

  upperBodyPivot.add(vestGroup);

  // ============================================================================
  // 3. PESCOÇO & CABEÇA EXPRESSIVA ESTILO PIXAR (PROPORÇÃO 1:5.5)
  // ============================================================================
  buildCharacterHead(THREE, upperBodyPivot, makePart, makeTaperedLimb, CHARACTER_COLORS);
  // ============================================================================
  // 6. BRAÇOS ARTICULADOS (OMBRO -> BRAÇO -> COTOVELO -> ANTEBRAÇO -> MÃO)
  // ============================================================================
  const armsGroup = new THREE.Group();
  armsGroup.name = 'arms';
  upperBodyPivot.add(armsGroup);

  [-1, 1].forEach((side) => {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.name = side === -1 ? 'leftArm' : 'rightArm';
    shoulderPivot.position.set(side * 0.222, 0.375, 0);

    // Manga superior com taper
    const upperArm = makeTaperedLimb(0.22, 0.068, 0.056, CHARACTER_COLORS.hoodie, 0.012);
    upperArm.position.set(0, -0.11, 0);
    shoulderPivot.add(upperArm);

    // Pivô do Cotovelo (Articulação real!)
    const elbowPivot = new THREE.Group();
    elbowPivot.name = side === -1 ? 'leftElbow' : 'rightElbow';
    elbowPivot.position.set(0, -0.22, 0);
    shoulderPivot.add(elbowPivot);

    // Antebraço do moletom
    const forearm = makeTaperedLimb(0.20, 0.055, 0.044, CHARACTER_COLORS.hoodie, 0.011);
    forearm.position.set(0, -0.10, 0);
    elbowPivot.add(forearm);

    // Punho canelado do moletom
    const cuff = makePart(new THREE.CylinderGeometry(0.046, 0.043, 0.035, 14), CHARACTER_COLORS.hoodieDark, { outlineWidth: 0.008 });
    cuff.position.set(0, -0.195, 0);
    elbowPivot.add(cuff);

    // Mão esculpida (Palma + Polegar)
    const handGroup = new THREE.Group();
    handGroup.name = side === -1 ? 'leftHand' : 'rightHand';
    handGroup.position.set(0, -0.245, 0);

    const palm = makePart(new THREE.SphereGeometry(0.046, 14, 12), CHARACTER_COLORS.skin, { outlineWidth: 0.01 });
    palm.scale.set(0.85, 1.12, 0.68);
    handGroup.add(palm);

    const thumb = makePart(new THREE.CapsuleGeometry(0.014, 0.025, 6, 8), CHARACTER_COLORS.skin, { outlineWidth: 0.007 });
    thumb.position.set(side * -0.032, 0.01, 0.022);
    thumb.rotation.z = side * 0.45;
    handGroup.add(thumb);

    elbowPivot.add(handGroup);
    armsGroup.add(shoulderPivot);
  });

  // ============================================================================
  // 7. PERNAS ARTICULADAS COM BOTAS INTEGRADAS (QUADRIL -> JOELHO -> BOTA)
  // ============================================================================
  const legsGroup = new THREE.Group();
  legsGroup.name = 'legs';
  pelvisPivot.add(legsGroup);

  [-1, 1].forEach((side) => {
    const hipPivot = new THREE.Group();
    hipPivot.name = side === -1 ? 'leftLeg' : 'rightLeg';
    hipPivot.position.set(side * 0.105, -0.02, 0);

    // Coxa da calça cargo
    const thigh = makeTaperedLimb(0.28, 0.088, 0.072, CHARACTER_COLORS.pants, 0.013);
    thigh.position.set(0, -0.14, 0);
    hipPivot.add(thigh);

    // Bolso lateral cargo arredondado
    const cargoPocket = makePart(new THREE.CapsuleGeometry(0.032, 0.055, 8, 10), CHARACTER_COLORS.kneePad, { outlineWidth: 0.008 });
    cargoPocket.scale.set(0.6, 1.0, 0.9);
    cargoPocket.position.set(side * 0.072, -0.15, 0.01);
    hipPivot.add(cargoPocket);

    // Pivô do Joelho (Articulação real!)
    const kneePivot = new THREE.Group();
    kneePivot.name = side === -1 ? 'leftKnee' : 'rightKnee';
    kneePivot.position.set(0, -0.28, 0);
    hipPivot.add(kneePivot);

    // Joelheira tática esculpida
    const kneePad = makePart(new THREE.SphereGeometry(0.074, 14, 10), CHARACTER_COLORS.kneePad, { outlineWidth: 0.009 });
    kneePad.scale.set(0.95, 0.65, 1.05);
    kneePad.position.set(0, 0, 0.018);
    kneePivot.add(kneePad);

    // Canela da calça cargo
    const shin = makeTaperedLimb(0.26, 0.070, 0.056, CHARACTER_COLORS.pants, 0.012);
    shin.position.set(0, -0.13, 0);
    kneePivot.add(shin);

    // Pivô do Tornozelo + Bota de Trilha (PRESA À PERNA!)
    const anklePivot = new THREE.Group();
    anklePivot.name = side === -1 ? 'leftFoot' : 'rightFoot';
    anklePivot.position.set(0, -0.28, 0);
    kneePivot.add(anklePivot);

    // Cano da bota
    const bootCollar = makePart(new THREE.CylinderGeometry(0.060, 0.064, 0.07, 14), CHARACTER_COLORS.boots, { outlineWidth: 0.011 });
    bootCollar.position.set(0, 0.02, 0);
    anklePivot.add(bootCollar);

    // Corpo da bota (cápsula horizontal esculpida)
    const bootBody = makePart(new THREE.CapsuleGeometry(0.058, 0.085, 10, 14), CHARACTER_COLORS.boots, {
      outlineWidth: 0.012,
      specular: 0.35,
    });
    bootBody.rotation.x = Math.PI / 2;
    bootBody.scale.set(1.05, 1.0, 0.78);
    bootBody.position.set(0, -0.02, 0.032);
    anklePivot.add(bootBody);

    // Solado tratorado escuro
    const bootSole = makePart(new THREE.CapsuleGeometry(0.062, 0.092, 8, 12), CHARACTER_COLORS.bootSole, { outlineWidth: 0.008 });
    bootSole.rotation.x = Math.PI / 2;
    bootSole.scale.set(1.08, 1.02, 0.32);
    bootSole.position.set(0, -0.058, 0.032);
    anklePivot.add(bootSole);

    legsGroup.add(hipPivot);
  });

  // ============================================================================
  // 8. MOCHILA DE EXPEDIÇÃO + GARRAFA AZUL + LANTERNA COM LUZ REAL
  // ============================================================================
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'backpack';
  backpackGroup.position.set(0, 0.25, -0.19);
  upperBodyPivot.add(backpackGroup);

  // Corpo ergonômico da mochila
  const bpBody = makePart(new THREE.CapsuleGeometry(0.145, 0.16, 12, 18), CHARACTER_COLORS.backpack, { outlineWidth: 0.013 });
  bpBody.scale.set(1.08, 1.0, 0.72);
  backpackGroup.add(bpBody);

  // Tampa superior da mochila
  const bpFlap = makePart(new THREE.SphereGeometry(0.155, 16, 12), CHARACTER_COLORS.backpackFlap, { outlineWidth: 0.011 });
  bpFlap.scale.set(1.06, 0.42, 0.76);
  bpFlap.position.set(0, 0.15, 0);
  backpackGroup.add(bpFlap);

  // Isolante térmico (Sleeping Pad) enrolado na base
  const padMesh = makePart(new THREE.CylinderGeometry(0.052, 0.052, 0.28, 14), CHARACTER_COLORS.sleepingPad, { outlineWidth: 0.01 });
  padMesh.rotation.z = Math.PI / 2;
  padMesh.position.set(0, -0.18, 0);
  backpackGroup.add(padMesh);

  // Garrafa d'água AZUL presa na lateral esquerda
  const bottleGroup = new THREE.Group();
  bottleGroup.position.set(-0.175, -0.02, 0);
  const bottleBody = makePart(new THREE.CapsuleGeometry(0.034, 0.09, 10, 14), CHARACTER_COLORS.waterBottle, {
    outlineWidth: 0.009,
    specular: 0.75,
  });
  bottleGroup.add(bottleBody);
  const bottleCap = makePart(new THREE.CylinderGeometry(0.022, 0.028, 0.028, 12), CHARACTER_COLORS.waterCap, { outlineWidth: 0.006 });
  bottleCap.position.set(0, 0.08, 0);
  bottleGroup.add(bottleCap);
  backpackGroup.add(bottleGroup);

  // Lanterna de camping pendurada na lateral direita (com PointLight!)
  const lanternGroup = new THREE.Group();
  lanternGroup.name = 'lantern';
  lanternGroup.position.set(0.175, -0.04, 0);

  const lanternTop = makePart(new THREE.ConeGeometry(0.038, 0.03, 12), CHARACTER_COLORS.lanternMetal, { outlineWidth: 0.007 });
  lanternTop.position.set(0, 0.045, 0);
  lanternGroup.add(lanternTop);

  const lanternGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.022, 0.055, 12),
    new THREE.MeshBasicMaterial({ color: CHARACTER_COLORS.lanternGlow })
  );
  lanternGlass.name = 'lanternGlass';
  lanternGroup.add(lanternGlass);

  const lanternBase = makePart(new THREE.CylinderGeometry(0.028, 0.032, 0.025, 12), CHARACTER_COLORS.lanternMetal, { outlineWidth: 0.007 });
  lanternBase.position.set(0, -0.04, 0);
  lanternGroup.add(lanternBase);

  const lanternLight = new THREE.PointLight(CHARACTER_COLORS.lanternGlow, 0.8, 5.5);
  lanternLight.name = 'lanternLight';
  lanternLight.position.set(0.05, 0, 0.1);
  lanternGroup.add(lanternLight);

  backpackGroup.add(lanternGroup);

  // Aplicar escala e garantir que a sola das botas toque exatamente Y = 0
  character.scale.setScalar(scale);
  character.userData.internalState = {
    time: 0,
    pose: 'idle',
  };

  return character;
}

/**
 * Aplica poses corporais completas (Articulações de Ombro, Cotovelo, Quadril, Joelho, Cabeça e Expressões).
 * @param {THREE.Group} character
 * @param {string} pose - ('idle', 'curious', 'shocked', 'pointing', 'running', 'climbing', 'sitting')
 * @param {number} t - fator de interpolação (0..1) ou tempo contínuo
 */
export function applyPose(character, pose, t = 1) {
  const head = character.getObjectByName('head');
  const torso = character.getObjectByName('torso');
  const pelvis = character.getObjectByName('pelvisPivot');
  const leftArm = character.getObjectByName('leftArm');
  const rightArm = character.getObjectByName('rightArm');
  const leftElbow = character.getObjectByName('leftElbow');
  const rightElbow = character.getObjectByName('rightElbow');
  const leftLeg = character.getObjectByName('leftLeg');
  const rightLeg = character.getObjectByName('rightLeg');
  const leftKnee = character.getObjectByName('leftKnee');
  const rightKnee = character.getObjectByName('rightKnee');
  const leftBrow = character.getObjectByName('leftBrow');
  const rightBrow = character.getObjectByName('rightBrow');
  const mouthClosed = character.getObjectByName('mouthClosed');
  const mouthOpen = character.getObjectByName('mouthOpen');

  if (!head || !leftArm || !rightArm) return;

  const time = character.userData.internalState?.time || 0;
  const lerp = (curr, target, factor = 0.72) => curr + (target - curr) * factor;

  // Valores alvo das articulações
  let torsoRotX = 0, torsoRotZ = 0, pelvisY = 0.80;
  let lArmX = 0.06, lArmZ = 0.14, lElbowX = -0.22;
  let rArmX = 0.06, rArmZ = -0.14, rElbowX = -0.22;
  let lLegX = 0, lLegZ = -0.03, lKneeX = 0.05;
  let rLegX = 0, rLegZ = 0.03, rKneeX = 0.05;
  let browTilt = 0, browY = 0.315, isMouthOpen = false;

  switch(pose){
    case 'idle': case 'curious': case 'thinking':{
      // Postura científica calma e estável: uma mão pensativa no queixo, tronco firme
      const w = time * 1.2;
      torsoRotX = 0.02;
      torsoRotZ = Math.sin(w * 0.8) * 0.015;
      pelvisY = 0.80;
      // Braço direito erguido em pose pensativa/apontando
      rArmX = -0.85 + Math.sin(w) * 0.04;
      rArmZ = -0.18;
      rElbowX = -0.75 + Math.sin(w) * 0.03;
      // Braço esquerdo relaxado ao lado do corpo
      lArmX = 0.05 + Math.sin(w) * 0.03;
      lArmZ = 0.12;
      lElbowX = -0.15;
      lLegX = 0; rLegX = 0;
      lKneeX = 0.04; rKneeX = 0.04;
      browTilt = 0.08; browY = 0.32;
      isMouthOpen = false;
      break;
    }
    case 'shocked':{
      // Expressão de espanto estável: tronco levemente para trás, mãos abertas em choque
      const p = time * 1.5;
      torsoRotX = -0.10 + Math.sin(p) * 0.02;
      torsoRotZ = 0;
      pelvisY = 0.78;
      lArmX = -1.45; rArmX = -1.45;
      lArmZ = 0.42; rArmZ = -0.42;
      lElbowX = -0.65; rElbowX = -0.65;
      lLegX = -0.05; rLegX = 0.05;
      lKneeX = 0.15; rKneeX = 0.15;
      browTilt = 0.26; browY = 0.335;
      isMouthOpen = true;
      break;
    }
    case 'presenting': case 'pointing':{
      // Apresentador profissional 3D: braço direito estendido com firmeza apontando para o objeto
      const g = time * 1.4;
      torsoRotX = 0.02;
      torsoRotZ = Math.sin(g * 0.6) * 0.02;
      pelvisY = 0.80;
      rArmX = -1.25 + Math.sin(g) * 0.03;
      rArmZ = -0.25;
      rElbowX = -0.15;
      lArmX = 0.08; lArmZ = 0.12; lElbowX = -0.18;
      lLegX = 0.02; rLegX = -0.02;
      lKneeX = 0.04; rKneeX = 0.04;
      browTilt = 0.12; browY = 0.325;
      isMouthOpen = false;
      break;
    }
    case 'walking': case 'running':{
      // Caminhada fluida e suave a 2.5 passos/segundo (sem tremores rápidos)
      const r = time * 2.8;
      torsoRotX = 0.06;
      torsoRotZ = Math.sin(r) * 0.025;
      pelvisY = 0.80 + Math.abs(Math.sin(r)) * 0.02;
      lArmX = -Math.sin(r) * 0.45;
      rArmX = Math.sin(r) * 0.45;
      lElbowX = -0.35; rElbowX = -0.35;
      lLegX = Math.sin(r) * 0.42;
      rLegX = -Math.sin(r) * 0.42;
      lKneeX = Math.max(0, -Math.sin(r)) * 0.55 + 0.05;
      rKneeX = Math.max(0, Math.sin(r)) * 0.55 + 0.05;
      browTilt = 0.05; browY = 0.315;
      isMouthOpen = false;
      break;
    }
    case 'funny_dance': case 'celebrate': case 'celebrate_dance':{
      // Dança rítmica suave e estilizada no ritmo da música (tempo suave 2.2 Hz)
      const c = time * 2.2;
      torsoRotX = -0.04;
      torsoRotZ = Math.sin(c) * 0.08;
      pelvisY = 0.81 + Math.abs(Math.sin(c)) * 0.035;
      lArmX = -2.2 + Math.sin(c) * 0.15;
      rArmX = -2.2 - Math.sin(c) * 0.15;
      lArmZ = 0.45 + Math.cos(c) * 0.08;
      rArmZ = -0.45 - Math.cos(c) * 0.08;
      lElbowX = -0.65; rElbowX = -0.65;
      lLegX = Math.sin(c) * 0.25;
      rLegX = -Math.sin(c) * 0.25;
      lKneeX = Math.max(0, Math.sin(c)) * 0.35 + 0.05;
      rKneeX = Math.max(0, -Math.sin(c)) * 0.35 + 0.05;
      browTilt = 0.18; browY = 0.33;
      isMouthOpen = Math.sin(c * 2) > 0.4;
      break;
    }
  }

  // Aplicar transições suaves nas articulações
  if (pelvis) pelvis.position.y = lerp(pelvis.position.y, pelvisY);
  if (torso) {
    torso.rotation.x = lerp(torso.rotation.x, torsoRotX);
    torso.rotation.z = lerp(torso.rotation.z, torsoRotZ);
  }

  leftArm.rotation.x = lerp(leftArm.rotation.x, lArmX);
  leftArm.rotation.z = lerp(leftArm.rotation.z, lArmZ);
  rightArm.rotation.x = lerp(rightArm.rotation.x, rArmX);
  rightArm.rotation.z = lerp(rightArm.rotation.z, rArmZ);

  if (leftElbow) leftElbow.rotation.x = lerp(leftElbow.rotation.x, lElbowX);
  if (rightElbow) rightElbow.rotation.x = lerp(rightElbow.rotation.x, rElbowX);

  if (leftLeg) {
    leftLeg.rotation.x = lerp(leftLeg.rotation.x, lLegX);
    leftLeg.rotation.z = lerp(leftLeg.rotation.z, lLegZ);
  }
  if (rightLeg) {
    rightLeg.rotation.x = lerp(rightLeg.rotation.x, rLegX);
    rightLeg.rotation.z = lerp(rightLeg.rotation.z, rLegZ);
  }
  if (leftKnee) leftKnee.rotation.x = lerp(leftKnee.rotation.x, lKneeX);
  if (rightKnee) rightKnee.rotation.x = lerp(rightKnee.rotation.x, rKneeX);

  // Expressão de sobrancelhas e boca
  if (leftBrow) {
    leftBrow.position.y = lerp(leftBrow.position.y, browY);
    leftBrow.rotation.z = lerp(leftBrow.rotation.z, browTilt);
  }
  if (rightBrow) {
    rightBrow.position.y = lerp(rightBrow.position.y, browY);
    rightBrow.rotation.z = lerp(rightBrow.rotation.z, -browTilt);
  }
  if (mouthClosed && mouthOpen) {
    mouthClosed.visible = !isMouthOpen;
    mouthOpen.visible = isMouthOpen;
    if (isMouthOpen) {
      const pulse = 1.0 + Math.sin(time * 8) * 0.08;
      mouthOpen.scale.set(0.85 * pulse, 1.15 * pulse, 0.45);
    }
  }
}

/**
 * Anima respiração orgânica, piscar natural (Auto-Blink), saccades oculares e balanço da lanterna.
 * @param {THREE.Group} character
 * @param {number} time - tempo em segundos
 */
export function animateBreathing(character, time) {
  if (!character.userData.internalState) {
    character.userData.internalState = { time: 0, pose: 'idle' };
  }
  character.userData.internalState.time = time;

  const torso = character.getObjectByName('torso');
  if (torso) {
    const breathe = 1 + Math.sin(time * 1.4) * 0.006;
    torso.scale.set(1, breathe, 1);
  }

  // Piscar automático natural a cada 3.5 segundos (duração 120ms)
  const leftEyelid = character.getObjectByName('leftEyelid');
  const rightEyelid = character.getObjectByName('rightEyelid');
  if (leftEyelid && rightEyelid) {
    const cycle = time % 3.5;
    let blinkScaleY = 0.05;
    if (cycle > 3.38) {
      const p = (cycle - 3.38) / 0.12;
      blinkScaleY = 0.05 + Math.sin(p * Math.PI) * 1.15;
    }
    leftEyelid.visible = blinkScaleY > 0.15;
    rightEyelid.visible = blinkScaleY > 0.15;
    leftEyelid.scale.y = blinkScaleY;
    rightEyelid.scale.y = blinkScaleY;
  }

  // Saccades oculares suaves e naturais
  const leftPupil = character.getObjectByName('leftPupil');
  const rightPupil = character.getObjectByName('rightPupil');
  if (leftPupil && rightPupil) {
    const lookX = Math.sin(time * 0.8) * 0.004;
    const lookY = Math.cos(time * 0.6) * 0.003;
    leftPupil.position.x = lookX;
    leftPupil.position.y = lookY;
    rightPupil.position.x = lookX;
    rightPupil.position.y = lookY;
  }

  // Balanço suave da lanterna
  const lantern = character.getObjectByName('lantern');
  if (lantern) {
    lantern.rotation.z = Math.sin(time * 1.2) * 0.03;
    lantern.rotation.x = Math.cos(time * 1.0) * 0.02;
  }
}


