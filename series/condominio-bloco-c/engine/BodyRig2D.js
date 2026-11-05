/**
 * BodyRig2D — motor compartilhado de corpo em PERFIL do elenco do Bloco C.
 *
 * O QUE ELE CORRIGE
 * -----------------
 * 1. Braços que não alternavam frente/trás. Cada personagem tinha o próprio
 *    braço traseiro com balanço fixo e um braço dianteiro que ignorava a fase
 *    do passo. Os dois caíam do mesmo lado do tronco e liam como um braço só.
 * 2. Reação ao lado errado. Ao reagir a algo à direita, o braço do lado certo
 *    não vinha para a frente, e o oposto não ia para trás.
 * 3. Cabelo em crista. Silhuetas de perfil subiam acima do crânio e viravam
 *    moicano na vista de lado.
 *
 * CONVENÇÃO DE ÂNGULO (Canvas 2D)
 * -------------------------------
 * Um membro desenhado para baixo a partir da origem, girando theta, leva o
 * ponto (0, L) para (-L·senθ, L·cosθ). Logo:
 *
 *     theta < 0  →  membro vai para a FRENTE (+X local)
 *     theta > 0  →  membro vai para TRÁS  (-X local)
 *
 * O joelho dobra só para trás, então `kn` é sempre >= 0.
 */
(function (global) {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const wrapPhase = (phase) => {
    let p = phase % TAU;
    if (p < 0) p += TAU;
    return p;
  };

  /**
   * Ciclo de perna em perfil. Fase 0 = toque do calcanhar à frente.
   * Devolve ângulos locais: th (quadril), kn (joelho), ft (tornozelo)
   * e soleDrop (solado descola no ar, para chinelo/tênis com gravidade).
   */
  function legCycle(phase, cfg = {}) {
    const stride = cfg.stride !== undefined ? cfg.stride : 0.35;
    const kneeIdle = cfg.kneeIdle !== undefined ? cfg.kneeIdle : 0.06;
    const kneeLoad = cfg.kneeLoad !== undefined ? cfg.kneeLoad : 0.14;
    const kneePre = cfg.kneePre !== undefined ? cfg.kneePre : 0.30;
    const kneeSwing = cfg.kneeSwing !== undefined ? cfg.kneeSwing : 0.80;
    const heel = cfg.heel !== undefined ? cfg.heel : 0.20;
    const toe = cfg.toe !== undefined ? cfg.toe : 0.32;
    const soleAir = cfg.soleAir !== undefined ? cfg.soleAir : 3.0;

    if (!cfg.walking) return { th: -0.02, kn: kneeIdle, ft: -0.04, soleDrop: 0 };

    const p = wrapPhase(phase);
    let th;
    let kn;
    let ft;
    let soleDrop = 0;

    if (p < Math.PI) {
      const u = p / Math.PI;
      th = -stride * Math.cos(u * Math.PI) - 0.01;
      if (u < 0.35) {
        kn = kneeIdle + kneeLoad * Math.sin((u / 0.35) * Math.PI);
      } else if (u < 0.75) {
        kn = kneeIdle;
      } else {
        const k = (u - 0.75) / 0.25;
        kn = kneeIdle + kneePre * Math.sin(k * Math.PI * 0.5);
      }
      let footGlobal = 0;
      if (u < 0.18) {
        footGlobal = -heel * (1.0 - u / 0.18);
      } else if (u > 0.72) {
        const k = (u - 0.72) / 0.28;
        footGlobal = toe * Math.sin(k * Math.PI * 0.5);
      }
      ft = footGlobal - (th + kn);
    } else {
      const v = (p - Math.PI) / Math.PI;
      th = stride * Math.cos(v * Math.PI) - 0.01;
      const swingArc = Math.sin(v * Math.PI);
      kn = kneeIdle + kneePre * (1.0 - v) + kneeSwing * swingArc;
      const footGlobal = toe * (1.0 - v) * Math.cos(v * Math.PI * 0.5) - heel * Math.pow(v, 1.4);
      ft = footGlobal - (th + kn);
      soleDrop = soleAir * swingArc;
    }

    return { th, kn, ft, soleDrop };
  }

  /**
   * Camadas de braço para a vista de PERFIL.
   *
   * Convenção de profundidade (fixa, como na vida real): o braço do lado 1 é o
   * MAIS PRÓXIMO da câmera e é desenhado depois do tronco; o do lado 0 é o
   * mais distante e é desenhado antes. O que alterna é o ÂNGULO: os dois braços
   * balançam em oposição, então enquanto um vai à frente o outro vai atrás —
   * e na metade seguinte do passo o inverso acontece.
   */
  function armLayers(phase, cfg = {}) {
    const swing = cfg.swing !== undefined ? cfg.swing : 0.42;
    const elbowBase = cfg.elbowBase !== undefined ? cfg.elbowBase : 0.20;
    const elbowFollow = cfg.elbowFollow !== undefined ? cfg.elbowFollow : 0.45;

    const c = Math.cos(wrapPhase(phase));
    const idle = cfg.idleSwing !== undefined ? cfg.idleSwing : 0.03;

    // Cada braço balança APENAS do seu lado do tronco, para nunca atravessar
    // o corpo. O braço próximo (desenhado por cima) vive de 0 a −swing (só à
    // frente); o distante (desenhado atrás) vive de 0 a +swing (só atrás).
    //
    // A alternância continua real: na fase 0 o distante está no extremo e o
    // próximo na linha do corpo; na fase 0,5 é o próximo que vai ao extremo
    // à frente. É o "um na frente, outro atrás, e o inverso ocorre".
    // Amplitude ampliada: com swing baixo a mão traseira ficava atrás do
    // tronco e a alternância não se lia. Perto de 1,0 rad a mão passa da
    // silhueta do corpo, que é o que o espectador percebe como "braço atrás".
    const nearAngle = cfg.walking ? -swing * (0.75 - 0.75 * c) : idle;
    const farAngle = cfg.walking ? swing * (0.75 + 0.75 * c) : idle;

    // Braço à frente dobra o cotovelo para frente (ângulo negativo).
    const fold = (a) => -(elbowBase + Math.max(0, -a) * elbowFollow);

    const near = {
      side: 1,
      front: true,
      swingAmt: Math.abs(nearAngle) / Math.max(0.001, swing),
      upper: nearAngle,
      fore: fold(nearAngle),
      shade: 1.0
    };
    const far = {
      side: 0,
      front: false,
      swingAmt: Math.abs(farAngle) / Math.max(0.001, swing),
      upper: farAngle,
      fore: fold(farAngle) * 0.75,
      shade: 0.62
    };

    return { layers: [far, near], front: near, back: far };
  }

  function elbchIdle(cfg) {
    return cfg.idleSwing !== undefined ? cfg.idleSwing : 0.03;
  }

  /**
   * Reação a algo que vem de um lado. O braço daquele lado vem para a FRENTE
   * (estendido na direção do que assusta) e o braço oposto recua para TRÁS,
   * invertendo a camada. `localDir` = +1 frente, -1 costas.
   *
   * Sem isso, um personagem que reage à direita continuava com os dois braços
   * do mesmo lado do tronco — a reação não tinha profundidade nenhuma.
   */
  function applyReaction(layers, localDir, amount = 1) {
    if (!localDir) return layers;
    const k = clamp01(amount);
    if (k <= 0) return layers;

    // Em perfil o braço PRÓXIMO é o único que aparece inteiro (o distante fica
    // atrás do tronco). Então é ele que carrega o gesto, na direção do alvo.
    // O braço distante faz o contrapeso: se o próximo vai à frente, ele recua.
    const near = { ...layers.front };
    const far = { ...layers.back };
    const dir = localDir > 0 ? 1 : -1;

    near.upper = -0.46 * k * dir;
    near.fore = dir > 0 ? -(0.45 + 0.35 * k) : 0.18 * k;
    near.shade = 1.0;
    near.reaching = true;

    far.upper = 0.30 * k * dir;
    far.fore = dir > 0 ? -0.12 : -(0.30 + 0.2 * k);
    far.shade = 0.62;
    far.reaching = false;

    const out = layers.front.side === 1 ? [far, near] : [near, far];
    return { layers: out, front: near, back: far, reactLocal: localDir };
  }

  /**
   * Resolve os dois braços de um personagem em perfil numa chamada só.
   * Junta: ciclo de caminhada + pose parada + reação a um lado + direção em
   * que ele está virado. Devolve `near` (desenhado depois do tronco) e `far`
   * (desenhado antes do tronco).
   */
  function resolveProfileArms(opts = {}) {
    const base = armLayers(opts.phase || 0, {
      walking: opts.walking === true,
      swing: opts.swing !== undefined ? opts.swing : 0.40,
      elbowBase: opts.elbowBase !== undefined ? opts.elbowBase : 0.18,
      elbowFollow: opts.elbowFollow !== undefined ? opts.elbowFollow : 0.45,
      idleSwing: opts.idleSwing !== undefined ? opts.idleSwing : 0.04
    });

    if (!opts.reactSide || !opts.reactAmount) return base;

    const local = reactLocalDirection(opts.reactSide, opts.facingRight !== false);
    // `applyReaction` recebe 1 (pose-alvo completa) e quem faz a entrada suave
    // é o `blendLayers`. Passar `reactAmount` aqui também aplicava o fator
    // duas vezes (efeito final k²) e a reação nunca chegava na força devida.
    const reacted = applyReaction(base, local, 1);
    return blendLayers(base, reacted, opts.reactAmount);
  }

  /** Mistura suave entre o ciclo de caminhada e a pose de reação. */
  function blendLayers(walk, react, amount) {
    const k = clamp01(amount);
    if (k <= 0) return walk;
    if (k >= 1) return react;
    const out = walk.layers.map((l) => {
      const r = react.layers.find((x) => x.side === l.side) || l;
      return {
        side: l.side,
        front: k > 0.5 ? r.front : l.front,
        upper: l.upper + (r.upper - l.upper) * k,
        fore: l.fore + (r.fore - l.fore) * k,
        shade: l.shade + (r.shade - l.shade) * k,
        reaching: r.reaching && k > 0.5
      };
    });
    return {
      layers: out,
      front: out.find((l) => l.front),
      back: out.find((l) => !l.front)
    };
  }

  /**
   * Converte "de que lado do personagem veio a coisa" (mundo) para a direção
   * local do rig. +1 = o lado para onde ele olha; -1 = o lado das costas.
   * @param {'left'|'right'|number} worldSide lado no mundo (tela)
   * @param {boolean} facingRight o personagem olha para a direita na tela?
   */
  function reactLocalDirection(worldSide, facingRight) {
    const world = worldSide === 'right' || worldSide === 1 || worldSide === +1 ? 1 : -1;
    return facingRight ? world : -world;
  }

  function shadeHex(hex, k) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    const r = Math.round(((n >> 16) & 255) * k);
    const g = Math.round(((n >> 8) & 255) * k);
    const b = Math.round((n & 255) * k);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Desenha a cadeia completa de um braço a partir do ombro.
   * Recebe o contexto já transladado para o pivô do ombro.
   */
  function drawArmChain(ctx, cfg = {}) {
    const upperLen = cfg.upperLen !== undefined ? cfg.upperLen : 30;
    const foreLen = cfg.foreLen !== undefined ? cfg.foreLen : 28;
    const shade = cfg.shade !== undefined ? cfg.shade : 1;
    const color = cfg.color || '#153a5b';
    const colorDark = cfg.colorDark || shadeHex(color, 0.72);
    const cuffColor = cfg.cuffColor || colorDark;
    const skin = cfg.skin || '#c99060';
    const skinDark = cfg.skinDark || shadeHex(skin, 0.82);
    const width = cfg.width !== undefined ? cfg.width : 7;
    const hand = cfg.hand || 'relaxed';
    const cuff = cfg.cuff === true;
    const sleeve = cfg.sleeve || null;

    ctx.save();
    ctx.rotate(cfg.upper || 0);

    // Braço superior
    ctx.fillStyle = shadeHex(color, shade);
    ctx.beginPath();
    ctx.moveTo(-width, 0);
    ctx.quadraticCurveTo(-width * 1.1, upperLen * 0.5, -width * 0.9, upperLen);
    ctx.lineTo(width * 0.9, upperLen);
    ctx.quadraticCurveTo(width * 1.1, upperLen * 0.5, width, 0);
    ctx.closePath();
    ctx.fill();

    if (sleeve) sleeve(ctx, upperLen);

    // Cotovelo
    ctx.translate(0, upperLen);
    ctx.rotate(cfg.fore || 0);

    ctx.fillStyle = shadeHex(color, shade * 0.94);
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.92, 0, Math.PI * 2);
    ctx.fill();

    // Antebraço
    const foreW = width * 0.88;
    const wristGap = cuff ? 5 : 0;
    ctx.fillStyle = shadeHex(color, shade * 0.86);
    ctx.beginPath();
    ctx.moveTo(-foreW, 0);
    ctx.lineTo(foreW, 0);
    ctx.lineTo(foreW * 0.82, foreLen - wristGap);
    ctx.lineTo(-foreW * 0.82, foreLen - wristGap);
    ctx.closePath();
    ctx.fill();

    if (cuff) {
      ctx.fillStyle = shadeHex(cuffColor, shade);
      ctx.fillRect(-foreW * 0.86, foreLen - 5.5, foreW * 1.72, 5.5);
    }

    ctx.translate(0, foreLen);
    drawHand(ctx, hand, { skin, skinDark });
    if (typeof cfg.prop === 'function') cfg.prop(ctx);
    ctx.restore();
  }

  function drawHand(ctx, kind, tones) {
    const { skin, skinDark } = tones;
    if (kind === 'open' || kind === 'defensive' || kind === 'pointing') {
      const spread = kind === 'open' ? 1 : kind === 'defensive' ? 0.85 : 0.35;
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 9.5, 3);
      ctx.fill();
      if (kind === 'pointing') {
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.roundRect(-2.2, 7, 4.4, 14, 2.2);
        ctx.fill();
        ctx.strokeStyle = skinDark;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        return;
      }
      for (let i = 0; i < 4; i++) {
        const fx = -4.2 + i * 2.7;
        const len = (kind === 'open' ? 10 : 8) * spread + (i === 1 || i === 2 ? 1.6 : 0);
        ctx.fillStyle = i % 2 === 0 ? skin : shadeHex(skin, 0.94);
        ctx.beginPath();
        ctx.roundRect(fx, 7, 2.3, Math.max(2.5, len), 1.1);
        ctx.fill();
      }
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(4, 1.2, 3.1, 6.6 * spread, 1.5);
      ctx.fill();
      return;
    }
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(-4.6, 0, 9.2, 9.2, 3);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      const fx = -3.7 + i * 2.5;
      ctx.fillStyle = i % 2 === 0 ? skin : shadeHex(skin, 0.94);
      ctx.beginPath();
      ctx.roundRect(fx, 6.2, 2.1, 5.4 + (i === 1 || i === 2 ? 1.2 : 0), 1.05);
      ctx.fill();
    }
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(3.4, 1.4, 2.8, 5.6, 1.2);
    ctx.fill();
  }

  /**
   * Massa de cabelo em PERFIL que acompanha o formato do crânio.
   *
   * Regra de ouro: o topo da massa nunca sobe mais que `lift` acima do topo do
   * crânio, e o limite frontal para na linha do cabelo. Assim não existe pico
   * vertical — o defeito que virava "moicano" de lado.
   */
  function drawProfileHair(ctx, spec = {}) {
    const crownY = spec.crownY !== undefined ? spec.crownY : -34;
    const backX = spec.backX !== undefined ? spec.backX : -14;
    const frontX = spec.frontX !== undefined ? spec.frontX : 13;
    const hairlineY = spec.hairlineY !== undefined ? spec.hairlineY : -22;
    const lift = spec.lift !== undefined ? spec.lift : 2.4;
    const napeY = spec.napeY !== undefined ? spec.napeY : 1;
    const color = spec.color || '#271810';
    const color2 = spec.color2 || shadeHex(color, 0.7);
    const highlight = spec.highlight || color2;
    const sideFade = spec.sideFade !== false;

    const g = ctx.createLinearGradient(0, crownY - lift, 0, hairlineY);
    g.addColorStop(0, color2);
    g.addColorStop(1, color);
    ctx.fillStyle = g;

    ctx.beginPath();
    // Nuca, subindo pela parte de trás do crânio
    ctx.moveTo(backX + 1, napeY);
    ctx.bezierCurveTo(
      backX - 2.5, napeY - 12,
      backX - 3, crownY + 6,
      (backX + frontX) * 0.42, crownY - lift
    );
    // Coroa acompanhando o crânio (curva rasa, sem crista)
    ctx.bezierCurveTo(
      frontX * 0.42, crownY - lift - 0.6,
      frontX - 0.5, crownY + 8,
      frontX, hairlineY
    );
    // Linha do cabelo na testa (frente para trás, acima da sobrancelha)
    ctx.quadraticCurveTo(frontX - 2.2, hairlineY - 2.4, frontX - 5.2, hairlineY - 1.2);
    ctx.quadraticCurveTo(frontX - 8.2, hairlineY - 0.2, frontX - 10.2, hairlineY - 4.6);
    // Têmpora desce até a costeleta
    ctx.quadraticCurveTo(frontX - 11.8, hairlineY + 3.6, frontX - 12.6, napeY - 8);
    if (sideFade) {
      ctx.lineTo(backX + 3.4, napeY - 6);
      ctx.quadraticCurveTo(backX + 1.6, napeY - 3, backX + 1, napeY);
    } else {
      ctx.quadraticCurveTo(backX + 2.4, napeY - 4, backX + 1, napeY);
    }
    ctx.closePath();
    ctx.fill();

    // Mechas discretas que seguem a curva do crânio
    if (spec.strands !== false) {
      ctx.strokeStyle = highlight;
      ctx.lineWidth = spec.strandWidth !== undefined ? spec.strandWidth : 1.5;
      ctx.lineCap = 'round';
      ctx.globalAlpha = spec.strandAlpha !== undefined ? spec.strandAlpha : 0.75;
      for (let i = 0; i < (spec.strandCount || 3); i++) {
        const t = (i + 1) / ((spec.strandCount || 3) + 1);
        const y0 = crownY - lift + 1.2 + t * 5.5;
        ctx.beginPath();
        ctx.moveTo(backX + 3 + t * 3, y0 + 4);
        ctx.quadraticCurveTo((backX + frontX) * 0.45, y0 - 1.4, frontX - 4 - t * 2.4, hairlineY - 3.4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  /**
   * Coque/rabo de cavalo ATRÁS da cabeça (nunca no topo, que vira crista).
   */
  function drawBun(ctx, spec = {}) {
    const x = spec.x !== undefined ? spec.x : -16;
    const y = spec.y !== undefined ? spec.y : -20;
    const rx = spec.rx !== undefined ? spec.rx : 10;
    const ry = spec.ry !== undefined ? spec.ry : 9.5;
    const color = spec.color || '#271810';
    const color2 = spec.color2 || shadeHex(color, 1.35);
    const tilt = spec.tilt !== undefined ? spec.tilt : -0.35;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    const g = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, 1, 0, 0, rx * 1.25);
    g.addColorStop(0, color2);
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
    ctx.fill();

    if (spec.curls !== false) {
      ctx.strokeStyle = color2;
      ctx.lineWidth = spec.curlWidth !== undefined ? spec.curlWidth : 1.6;
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < 3; i++) {
        const a = -0.9 + i * 0.9;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rx * 0.28, Math.sin(a) * ry * 0.3, rx * 0.52, a, a + Math.PI * 1.1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (spec.band) {
      ctx.fillStyle = spec.band;
      ctx.fillRect(-rx * 0.72, ry * 0.42, rx * 1.44, 3.2);
    }
    ctx.restore();
  }

  /** Sombra elíptica padronizada no piso. */
  function drawGroundShadow(ctx, cfg = {}) {
    const x = cfg.x || 0;
    const y = cfg.y !== undefined ? cfg.y : 165;
    const w = cfg.w !== undefined ? cfg.w : 42;
    const h = cfg.h !== undefined ? cfg.h : 9;
    const alpha = cfg.alpha !== undefined ? cfg.alpha : 0.5;
    const g = ctx.createRadialGradient(x, y, 3, x, y, w);
    g.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, TAU);
    ctx.fill();
  }

  global.StudioEngine = global.StudioEngine || {};
  global.StudioEngine.BodyRig2D = {
    legCycle,
    armLayers,
    applyReaction,
    blendLayers,
    resolveProfileArms,
    reactLocalDirection,
    drawArmChain,
    drawHand,
    drawProfileHair,
    drawBun,
    drawGroundShadow,
    shadeHex,
    clamp01,
    wrapPhase
  };
})(typeof window !== 'undefined' ? window : globalThis);
