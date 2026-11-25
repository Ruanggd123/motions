/**
 * CartoonDistort3D.js — Motor Compartilhado de Distorção Cartoon / Meme 3D (Aterrado nos Pés)
 * Série: Duplo Sentido 3D (VoceMorador3D & DonaCamila3D)
 * Motor: Three.js WebGL Real 3D (60fps determinístico, zero Math.random, zero NaN)
 *
 * Princípio Matemático de Aterramento (Foot-Anchored Squash & Stretch):
 * - VoceMorador3D: pelvis(0.82) + legRoot(-0.06) + knee(-0.18) + foot(-0.195) + soleBottom(-0.015)
 *   => footLocalY = +0.370  =>  VOCE_GROUND_Y = -0.37  (sola em worldY = 0.00)
 * - DonaCamila3D:  pelvis(0.88) + legRoot(-0.08) + knee(-0.24) + foot(-0.255) + soleBottom(-0.036)
 *   => footLocalY = +0.269 (~0.27)  =>  CAMILA_GROUND_Y = -0.27  (sola em worldY = 0.00)
 *
 * Ao aplicar scale.y = sy e inclinações (leanZ, leanX) no group raiz em ordem 'YXZ',
 * compensamos group.position.y = floorY - footLocalY * sy * cos(leanZ) * cos(leanX)
 * para manter as solas CRAVADAS em worldY = floorY (padrão 0.00) sem afundar nem flutuar!
 */
(function (global) {
  'use strict';

  const VOCE_GROUND_Y = -0.37;
  const CAMILA_GROUND_Y = -0.27;
  const VOCE_FOOT_LOCAL_Y = 0.37;
  const CAMILA_FOOT_LOCAL_Y = 0.27;

  function clamp(v, min, max) {
    if (!Number.isFinite(v)) return min;
    return v < min ? min : (v > max ? max : v);
  }

  function safeNum(v, fallback) {
    return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  }

  function ensureUserData(obj) {
    if (!obj) return null;
    if (!obj.userData) obj.userData = {};
    return obj.userData;
  }

  /**
   * Squash & Stretch com preservação de volume e pés ancorados no piso (worldY = floorY, padrão 0.00).
   *
   * @param {THREE.Object3D} group       Grupo raiz do personagem (ex.: voce.group ou camila.group)
   * @param {number}         baseGroundY Deslocamento base do piso (-0.37 p/ Você, -0.27 p/ Camila)
   * @param {number}         sy          Fator vertical de squash (<1) ou stretch (>1), clamped [0.45, 1.85]
   * @param {number}         [sxzBoost]  Multiplicador extra de largura X/Z (padrão 1.0)
   * @param {number}         [leanZ]     Inclinação lateral local (rad, padrão 0)
   * @param {number}         [leanX]     Inclinação frontal/traseira local (rad, padrão 0)
   * @param {number}         [floorY]    Altura alvo das solas no mundo (padrão 0.00; >0 para saltos)
   */
  function footAnchoredSquash(group, baseGroundY, sy, sxzBoost, leanZ, leanX, floorY) {
    if (!group || !group.scale || !group.position) return null;

    const bgy = safeNum(baseGroundY, 0);
    const footLocalY = -bgy;
    const safeSy = clamp(safeNum(sy, 1), 0.45, 1.85);
    const boost = clamp(safeNum(sxzBoost, 1), 0.50, 2.00);
    const sxz = (1 / Math.sqrt(Math.max(0.45, safeSy))) * boost;
    const lz = clamp(safeNum(leanZ, 0), -0.55, 0.55);
    const lx = clamp(safeNum(leanX, 0), -0.55, 0.55);
    const targetFloorY = safeNum(floorY, 0);

    group.scale.set(sxz, safeSy, sxz);

    if (group.rotation) {
      // Ordem YXZ mantém leanX/leanZ sempre no referencial frontal do personagem,
      // preservando group.rotation.y intacto e tornando a projeção vertical independente de yaw.
      group.rotation.order = 'YXZ';
      group.rotation.z = lz;
      group.rotation.x = lx;
    }

    const cosTilt = Math.cos(lz) * Math.cos(lx);
    const compensatedY = targetFloorY - footLocalY * safeSy * cosTilt;
    group.position.y = compensatedY;

    const ud = ensureUserData(group);
    ud.cartoonFootY = targetFloorY;
    ud.baseGroundY = bgy;
    ud.footLocalY = footLocalY;
    ud.cartoonScaleY = safeSy;
    ud.cartoonScaleXZ = sxz;
    ud.cartoonLeanZ = lz;
    ud.cartoonLeanX = lx;

    return {
      sx: sxz,
      sy: safeSy,
      sz: sxz,
      posY: compensatedY,
      footWorldY: targetFloorY
    };
  }

  /**
   * Calcula o worldY real atual das solas de um personagem para auditoria automática.
   *
   * @param {THREE.Object3D} group       Grupo raiz do personagem
   * @param {number}         [baseGroundY] Opcional; se omitido usa group.userData.baseGroundY
   * @returns {number} Altura estimada das solas em worldY (0.00 = perfeitamente aterrado)
   */
  function computeFootWorldY(group, baseGroundY) {
    if (!group || !group.position) return 0;
    const ud = group.userData || {};
    const bgy = Number.isFinite(baseGroundY)
      ? baseGroundY
      : (Number.isFinite(ud.baseGroundY) ? ud.baseGroundY : 0);
    const footLocalY = -bgy;
    const sy = group.scale ? safeNum(group.scale.y, 1) : 1;
    const lx = group.rotation ? safeNum(group.rotation.x, 0) : 0;
    const lz = group.rotation ? safeNum(group.rotation.z, 0) : 0;
    return safeNum(group.position.y, 0) + footLocalY * sy * Math.cos(lz) * Math.cos(lx);
  }

  /**
   * Big-Head Pop + Estiramento Vertical + Tremor Cômico de Pânico/Choque (determinístico).
   * Deve ser chamado APÓS char.update() para preservar lookYaw/lookPitch e somar tilt/tremor.
   * Compensa suavemente headGroup.position.y quando sy > 1 para o queixo nunca afundar na gola.
   *
   * @param {THREE.Object3D} headGroup  Grupo da cabeça (voce.headGroup ou camila.headGroup)
   * @param {number}         scaleMul   Escala base da cabeça (1.0 normal até ~1.55 choque cartoon)
   * @param {number}         [stretchY] Estiramento vertical extra da mandíbula/rosto (padrão 1.0)
   * @param {number}         [tiltZ]    Inclinação lateral cômica adicionada (rad, padrão 0)
   * @param {number}         [jitterAmp] Amplitude do tremor frenético (rad, padrão 0; ex.: 0.04–0.10)
   * @param {number}         [time]     Tempo absoluto da cena em segundos (determinístico)
   */
  function headPop(headGroup, scaleMul, stretchY, tiltZ, jitterAmp, time) {
    if (!headGroup || !headGroup.scale) return null;

    const ud = ensureUserData(headGroup);
    if (headGroup.position && !Number.isFinite(ud._cdBaseHeadPosY)) {
      ud._cdBaseHeadPosY = headGroup.position.y;
    }

    const s = clamp(safeNum(scaleMul, 1), 0.55, 1.85);
    const syMul = clamp(safeNum(stretchY, 1), 0.65, 1.65);
    const sxz = s / Math.pow(syMul, 0.35);
    const sy = s * syMul;

    headGroup.scale.set(sxz, sy, sxz);

    // Elevação proporcional suave ao crescer a cabeça para evitar colisão queixo/gola
    if (headGroup.position && Number.isFinite(ud._cdBaseHeadPosY)) {
      const lift = Math.max(0, sy - 1) * 0.068;
      headGroup.position.y = ud._cdBaseHeadPosY + lift;
    }

    const tz = clamp(safeNum(tiltZ, 0), -0.75, 0.75);
    const j = clamp(safeNum(jitterAmp, 0), 0, 0.45);
    const t = safeNum(time, 0);

    const jZ = j > 0 ? j * (Math.sin(t * 47.0) * 0.65 + Math.cos(t * 73.0) * 0.35) : 0;
    const jY = j > 0 ? j * (Math.sin(t * 53.0 + 1.1) * 0.55 + Math.cos(t * 31.0) * 0.45) : 0;
    const jX = j > 0 ? j * (Math.sin(t * 41.0 + 2.3) * 0.45) : 0;

    if (headGroup.rotation) {
      headGroup.rotation.z += tz + jZ;
      headGroup.rotation.y += jY;
      headGroup.rotation.x += jX;
    }

    ud.cartoonHeadScale = s;
    ud.cartoonHeadStretchY = syMul;

    return { sx: sxz, sy: sy, sz: sxz, tiltZ: tz + jZ };
  }

  /**
   * Alongamento Elástico de Braço estilo Rubber-Hose (sem cisalhamento em cotovelos dobrados!).
   * Aceita tanto o bundle completo (voce.shoulderL), quanto (voce.shoulderL.root, voce.shoulderL.elbow),
   * quanto (voce.shoulderL.upperArm, voce.shoulderL.elbow).
   *
   * @param {Object|THREE.Object3D} shoulder    Bundle do braço ou Group do ombro/upperArm
   * @param {THREE.Object3D}        [elbow]     Group do cotovelo (opcional se shoulder for o bundle)
   * @param {number}                lengthScale Fator de comprimento (1.0 normal, até 1.75 elástico)
   * @param {number}                [wobbleZ]   Amplitude do balanço rubber-hose em rad (padrão 0)
   * @param {number}                [time]      Tempo absoluto em segundos
   */
  function armRubberStretch(shoulder, elbow, lengthScale, wobbleZ, time) {
    if (!shoulder) return null;

    const isBundle = !shoulder.isObject3D && (shoulder.upperArm || shoulder.root);
    const elbowObj = elbow || (isBundle ? shoulder.elbow : null);
    let upperObj = isBundle ? (shoulder.upperArm || shoulder.root) : shoulder;

    // Se passaram shoulder.root mas o cotovelo é filho de upperArm, opera no upperArm
    if (elbowObj && elbowObj.parent && elbowObj.parent !== upperObj) {
      upperObj = elbowObj.parent;
    }

    const L = clamp(safeNum(lengthScale, 1), 0.70, 1.85);
    const sThin = 1 / Math.sqrt(L);
    const wAmp = clamp(safeNum(wobbleZ, 0), -0.85, 0.85);
    const t = safeNum(time, 0);

    function stretchSegmentGroup(segGroup, keepHandsUnscaled) {
      if (!segGroup || !Array.isArray(segGroup.children)) return;
      for (let i = 0; i < segGroup.children.length; i++) {
        const ch = segGroup.children[i];
        if (!ch || !ch.position || !ch.scale) continue;
        const cud = ensureUserData(ch);
        if (!Number.isFinite(cud._cdBasePosY)) {
          cud._cdBasePosY = ch.position.y;
          cud._cdBaseSx = ch.scale.x;
          cud._cdBaseSy = ch.scale.y;
          cud._cdBaseSz = ch.scale.z;
        }
        // Reposiciona todos os filhos ao longo do eixo do braço para zero fresta nas juntas
        ch.position.y = cud._cdBasePosY * L;
        // Escala somente os meshes de manga/braço (nunca Group filho como cotovelo/mão!) -> zero shear!
        if (ch.isMesh && !keepHandsUnscaled) {
          ch.scale.set(cud._cdBaseSx * sThin, cud._cdBaseSy * L, cud._cdBaseSz * sThin);
        }
      }
    }

    stretchSegmentGroup(upperObj, false);
    if (elbowObj) {
      stretchSegmentGroup(elbowObj, false);
    }

    const waveUpper = wAmp !== 0 ? Math.sin(t * 22.0) * wAmp : 0;
    const waveElbow = wAmp !== 0 ? Math.sin(t * 22.0 - 1.05) * wAmp * 1.25 : 0;

    if (upperObj && upperObj.rotation) {
      // upperArm.rotation não é sobrescrito pelo update() dos rigs, então set direto é 100% determinístico
      upperObj.rotation.z = waveUpper;
    }
    if (elbowObj && elbowObj.rotation) {
      // elbow.rotation.z é sempre 0 em VoceMorador3D e DonaCamila3D
      elbowObj.rotation.z = waveElbow;
    }

    return { lengthScale: L, thicknessScale: sThin, waveUpper: waveUpper, waveElbow: waveElbow };
  }

  /**
   * Agachamento Profundo com Compensação Exata de Pelve + Joelhos Tremendo feito Gelatina.
   * Mantém footLocalY invariante (0.37 no Você, 0.27 na Camila) para combinar perfeitamente
   * com footAnchoredSquash sem tirar os pés do piso!
   *
   * @param {Object} charRig    Instância VoceMorador3D ou DonaCamila3D
   * @param {number} squat01    Profundidade do agachamento [0..1] (0 = em pé, 1 = agachamento fundo)
   * @param {number} [wobbleAmp] Tremor lateral cômico dos joelhos em rad (padrão 0)
   * @param {number} [time]     Tempo absoluto em segundos
   */
  function deepSquatLegs(charRig, squat01, wobbleAmp, time) {
    if (!charRig || !charRig.pelvis || !charRig.legL || !charRig.legR) return null;

    const q = clamp(safeNum(squat01, 0), 0, 1);
    const isCamila = charRig.id === 'CAMILA' || (charRig.group && charRig.group.name === 'DonaCamila3D');
    const basePelvisY = isCamila ? 0.88 : 0.82;
    const legSpan = isCamila ? 0.495 : 0.375;
    const footOffsetZ = isCamila ? 0.020 : 0.025;

    const theta = q * 0.92; // até ~52 graus de flexão no quadril e ~105 graus no joelho
    const dropY = legSpan * (1 - Math.cos(theta)) - footOffsetZ * Math.sin(theta);
    const wAmp = clamp(safeNum(wobbleAmp, 0), 0, 0.38);
    const t = safeNum(time, 0);
    const jellyL = wAmp > 0 ? Math.sin(t * 32.0) * wAmp : 0;
    const jellyR = wAmp > 0 ? Math.sin(t * 32.0 + Math.PI) * wAmp : 0;

    charRig.pelvis.position.y = basePelvisY - dropY;

    charRig.legL.root.rotation.set(-theta, 0.08 * q, -0.05 * q + jellyL);
    charRig.legL.knee.rotation.set(theta * 2.0, 0, -jellyL * 0.7);
    if (charRig.legL.foot) charRig.legL.foot.rotation.set(-theta, 0, 0);

    charRig.legR.root.rotation.set(-theta, -0.08 * q, 0.05 * q + jellyR);
    charRig.legR.knee.rotation.set(theta * 2.0, 0, -jellyR * 0.7);
    if (charRig.legR.foot) charRig.legR.foot.rotation.set(-theta, 0, 0);

    return { pelvisY: charRig.pelvis.position.y, dropY: dropY, theta: theta };
  }

  /**
   * Crash-Zoom Fisheye estilo Meme 3D (FOV grande-angular até ~84°-88° bem perto do nariz).
   *
   * @param {number}               baseFov   FOV padrão da cena (ex.: 40)
   * @param {number}               targetFov FOV grande-angular alvo (ex.: 78 a 86)
   * @param {number}               intensity Intensidade normalizada [0..1]
   * @param {THREE.PerspectiveCamera} [camera] Opcional: se passada, atualiza fov e matriz de projeção
   * @returns {number} FOV resultante interpolado com curva snappy ease-out cúbica
   */
  function fisheyePulse(baseFov, targetFov, intensity, camera) {
    const bFov = clamp(safeNum(baseFov, 40), 20, 95);
    const tFov = clamp(safeNum(targetFov, 80), 20, 95);
    const u = clamp(safeNum(intensity, 0), 0, 1);
    const eased = 1 - Math.pow(1 - u, 3);
    const fov = bFov + (tFov - bFov) * eased;

    if (camera && typeof camera.updateProjectionMatrix === 'function') {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    return fov;
  }

  /**
   * Curva Elástica Cartoon com Overshoot Real (~33% de sobressalto no pico).
   * Exatamente 0 em u=0 e exatamente 1 em u=1 (sem degrau).
   *
   * @param {number} u Progresso normalizado [0..1]
   * @returns {number} Valor com overshoot elástico
   */
  function elasticOut(u) {
    const x = clamp(safeNum(u, 0), 0, 1);
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return 1 + (1 - x) * Math.pow(2, -9 * x) * Math.sin((x * 10 - 0.75) * c4);
  }

  /**
   * Oscilação de Impacto Gelatinoso (retorna 0 em u=0 e u=1, pico ~+0.92 logo após o golpe,
   * seguido de rebotes amortecidos). Ideal para sy = 1 - 0.28 * impactBounce(u, 3.0).
   *
   * @param {number} u      Progresso pós-impacto [0..1]
   * @param {number} [freq] Ciclos completos de vibração na janela (padrão 3.0)
   * @returns {number} Sinal oscilatório amortecido em [-1.05, 1.05]
   */
  function impactBounce(u, freq) {
    const x = clamp(safeNum(u, 0), 0, 1);
    if (x <= 0 || x >= 1) return 0;
    const f = safeNum(freq, 3.0) > 0 ? safeNum(freq, 3.0) : 3.0;
    const decay = Math.exp(-4.2 * x) * (1 - x);
    const peakNorm = Math.exp(4.2 / (4 * f));
    return clamp(Math.sin(x * Math.PI * 2 * f) * decay * peakNorm, -1.05, 1.05);
  }

  /**
   * Micro-Freeze / Hitstop Cômico Determinístico no Impacto.
   * Mapeia tempo linear `t` para tempo dramático que quase congela durante `freezeDur`
   * a partir de `hitT` e retoma suavemente sem teleporte (C0 contínuo, monotônico).
   *
   * @param {number} t           Tempo linear atual da cena (s)
   * @param {number} hitT        Instante exato do impacto (s)
   * @param {number} freezeDur   Duração do congelamento cômico (s, ex.: 0.12 a 0.22)
   * @param {number} [slowFactor] Velocidade residual no hitstop (padrão 0.03; 0 = freeze total)
   * @param {number} [catchupDur] Opcional: duração para alcançar de volta o tempo linear (padrão 0)
   * @returns {number} Tempo deformado determinístico
   */
  function hitstopTime(t, hitT, freezeDur, slowFactor, catchupDur) {
    const now = safeNum(t, 0);
    const hit = safeNum(hitT, 0);
    const dur = Math.max(0, safeNum(freezeDur, 0));
    if (dur <= 0 || now <= hit) return now;

    const slow = clamp(safeNum(slowFactor, 0.03), 0, 0.5);
    const endFreeze = hit + dur;
    if (now < endFreeze) {
      return hit + (now - hit) * slow;
    }

    const lost = dur * (1 - slow);
    const catchup = Math.max(0, safeNum(catchupDur, 0));
    if (catchup > 0 && now < endFreeze + catchup) {
      const k = clamp((now - endFreeze) / catchup, 0, 1);
      const smoothK = k * k * (3 - 2 * k);
      return (now - lost) + lost * smoothK;
    }
    return catchup > 0 ? now : (now - lost);
  }

  /**
   * Retorna progresso normalizado (0..1) quando t está dentro da janela de hitstop, senão 0.
   * Útil para acoplar tremidas de câmera ou flash de impacto no micro-freeze.
   */
  function isInHitstop(t, hitT, freezeDur) {
    const now = safeNum(t, 0);
    const hit = safeNum(hitT, 0);
    const dur = Math.max(0, safeNum(freezeDur, 0));
    if (dur <= 0 || now < hit || now > hit + dur) return 0;
    return clamp((now - hit) / dur, 0, 1);
  }

  /**
   * Reseta deterministamente todas as distorções cartoon aplicadas a um personagem
   * (útil no início de renderAt(t) antes de aplicar a batida ativa).
   */
  function resetRigDistortion(charRig, baseGroundY) {
    if (!charRig) return;
    if (charRig.group) {
      const fallbackGround = charRig.id === 'CAMILA' ? CAMILA_GROUND_Y : VOCE_GROUND_Y;
      const bgy = Number.isFinite(baseGroundY) ? baseGroundY : fallbackGround;
      footAnchoredSquash(charRig.group, bgy, 1.0, 1.0, 0, 0, 0);
    }
    if (charRig.headGroup) {
      headPop(charRig.headGroup, 1.0, 1.0, 0, 0, 0);
    }
    if (charRig.shoulderL) {
      armRubberStretch(charRig.shoulderL, charRig.shoulderL.elbow, 1.0, 0, 0);
    }
    if (charRig.shoulderR) {
      armRubberStretch(charRig.shoulderR, charRig.shoulderR.elbow, 1.0, 0, 0);
    }
  }

  global.CartoonDistort3D = {
    VOCE_GROUND_Y: VOCE_GROUND_Y,
    CAMILA_GROUND_Y: CAMILA_GROUND_Y,
    VOCE_FOOT_LOCAL_Y: VOCE_FOOT_LOCAL_Y,
    CAMILA_FOOT_LOCAL_Y: CAMILA_FOOT_LOCAL_Y,
    footAnchoredSquash: footAnchoredSquash,
    computeFootWorldY: computeFootWorldY,
    headPop: headPop,
    armRubberStretch: armRubberStretch,
    deepSquatLegs: deepSquatLegs,
    fisheyePulse: fisheyePulse,
    elasticOut: elasticOut,
    impactBounce: impactBounce,
    hitstopTime: hitstopTime,
    isInHitstop: isInHitstop,
    resetRigDistortion: resetRigDistortion
  };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
