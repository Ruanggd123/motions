/**
 * DepthScene2D — kit de cenas 2.5D por planos focais (Condomínio Bloco C).
 *
 * PROBLEMA QUE RESOLVE
 * --------------------
 * As cenas antigas tinham fundo, meio e frente, mas tudo com a mesma nitidez,
 * o mesmo tom e a mesma temperatura. A imagem lia chapada, como cartaz.
 * Profundidade em 2D não vem de desenhar mais coisas: vem de separar camadas
 * com quatro sinais:
 *
 *   1. ATMOSFERA — o que está longe perde contraste e ganha o tom do ar.
 *   2. FOCO      — o plano de interesse é nítido; os outros recebem desfoque.
 *   3. PARALAXE  — cada plano desloca diferente quando a câmera se move.
 *   4. LUZ       — halo, shafts e vinheta separam a frente do fundo.
 *
 * DETERMINISMO
 * ------------
 * Nada de Math.random(): o render é frame a frame e precisa reproduzir. Use
 * `hash(i)` para variação estável e `t` para movimento.
 */
(function (global) {
  'use strict';

  /** Ruído determinístico em [0, 1) — substitui Math.random(). */
  function hash(i) {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /** Ruído bidimensional estável. */
  function hash2(i, j) {
    return hash(i * 57.0 + j * 131.0);
  }

  const PALETTE = {
    night: ['#03060d', '#060c18', '#0a1424', '#101d33'],
    concrete: ['#0d141d', '#141c28', '#1b2532', '#26333f'],
    wood: ['#0f0a06', '#1b130c', '#241a11', '#33251a'],
    steel: ['#0a0f18', '#1e2a3c', '#3d4d61', '#6b7f95'],
    warm: ['#fde68a', '#fbbf24', '#f59e0b'],
    cold: ['#7dd3fc', '#38bdf8', '#0ea5e9'],
    alarm: ['#ef4444', '#b91c1c', '#7f1d1d'],
    cctv: ['#22c55e', '#16a34a', '#064e3b']
  };

  /** Cor com alfa aplicado a partir de "#rrggbb". */
  function rgba(hex, alpha) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  /** Mistura duas cores hex em RGB linear simples. */
  function mix(a, b, k) {
    const pa = parseInt(a.replace('#', ''), 16);
    const pb = parseInt(b.replace('#', ''), 16);
    const r = Math.round(((pa >> 16) & 255) * (1 - k) + ((pb >> 16) & 255) * k);
    const g = Math.round(((pa >> 8) & 255) * (1 - k) + ((pb >> 8) & 255) * k);
    const bl = Math.round((pa & 255) * (1 - k) + (pb & 255) * k);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  function easeOutCubic(p) {
    const x = Math.max(0, Math.min(1, p));
    return 1 - Math.pow(1 - x, 3);
  }

  function easeInOutSine(p) {
    return 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, p)));
  }

  /**
   * Cria um plano focal. Cada plano recebe um desenho e os parâmetros de
   * profundidade: deslocamento de paralaxe, desfoque, atmosfera e opacidade.
   *
   *   const fundo = D.layer({ depth: 0.15, blur: 3.2, haze: 0.55, draw(ctx, s) {...} });
   */
  function layer(spec) {
    if (!spec || typeof spec.draw !== 'function') {
      throw new Error('DepthScene2D.layer: um plano precisa de draw(ctx, state).');
    }
    return {
      name: spec.name || 'plano',
      depth: spec.depth !== undefined ? spec.depth : 0,
      blur: spec.blur !== undefined ? spec.blur : 0,
      haze: spec.haze !== undefined ? spec.haze : 0,
      hazeColor: spec.hazeColor || '#0b1220',
      alpha: spec.alpha !== undefined ? spec.alpha : 1,
      draw: spec.draw
    };
  }

  /** Desenha um plano aplicando paralaxe, desfoque e atmosfera. */
  function drawLayer(ctx, pl, state, camOffsetX = 0) {
    if (!pl) return;
    const { W, H } = state;
    ctx.save();
    ctx.globalAlpha = pl.alpha;

    // Paralaxe: planos distantes se deslocam menos que os próximos.
    if (camOffsetX) ctx.translate(-camOffsetX * pl.depth, 0);

    // Desfoque de profundidade. `ctx.filter` existe no Chrome/Chromium, que é
    // o motor do render headless; se não existir, segue nítido em vez de falhar.
    const prevFilter = ctx.filter;
    if (pl.blur > 0 && typeof ctx.filter === 'string') {
      ctx.filter = `blur(${pl.blur.toFixed(2)}px)`;
    }

    ctx.save();
    pl.draw(ctx, state);
    ctx.restore();

    if (typeof prevFilter === 'string') ctx.filter = prevFilter;

    // Atmosfera: o ar entre a câmera e o plano lava o contraste.
    if (pl.haze > 0) {
      ctx.fillStyle = rgba(pl.hazeColor, pl.haze);
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  /**
   * Compõe uma cena inteira. Os planos vêm do mais distante ao mais próximo.
   * Aceita a câmera animada (panX) para o paralaxe e devolve o contexto limpo.
   */
  function compose(ctx, state, layers, opts = {}) {
    const camOffsetX = opts.camOffsetX || 0;
    for (let i = 0; i < layers.length; i++) {
      drawLayer(ctx, layers[i], state, camOffsetX);
    }
  }

  /** Halo de luz radial (fontes, lâmpadas, telas). */
  function glow(ctx, x, y, radius, color, strength = 1) {
    if (strength <= 0) return;
    const g = ctx.createRadialGradient(x, y, Math.max(1, radius * 0.04), x, y, radius);
    g.addColorStop(0, rgba(color, strength));
    g.addColorStop(0.45, rgba(color, strength * 0.32));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Feixe de luz volumétrico em cone. `spread` é a meia-largura no alvo,
   * `length` a distância e `angle` a direção em radianos.
   */
  function lightShaft(ctx, ox, oy, angle, length, spread, color, strength = 0.5) {
    if (strength <= 0) return;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, length, 0);
    g.addColorStop(0, rgba(color, strength));
    g.addColorStop(0.45, rgba(color, strength * 0.34));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(length, -spread);
    ctx.lineTo(length, spread);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** Vinheta cinematográfica; `warmth` puxa a borda para o azul da noite. */
  function vignette(ctx, W, H, strength = 0.72, cx = 0.5, cy = 0.5) {
    const g = ctx.createRadialGradient(
      W * cx, H * cy, Math.min(W, H) * 0.30,
      W * cx, H * cy, Math.max(W, H) * 0.72
    );
    g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(1, `rgba(2, 6, 18, ${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /** Granulação fina determinística — dá textura de película/film grain. */
  function grain(ctx, W, H, seed, amount = 0.05) {
    if (amount <= 0) return;
    ctx.save();
    ctx.globalAlpha = amount;
    for (let i = 0; i < 260; i++) {
      const x = hash2(i, 1) * W;
      const y = hash2(i, 2) * H;
      const v = hash2(i + seed, 3);
      ctx.fillStyle = v > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    ctx.restore();
  }

  /** Chuva diagonal determinística, com camadas de profundidade. */
  function rain(ctx, W, H, t, opts = {}) {
    const count = opts.count || 70;
    const speed = opts.speed || 900;
    const slant = opts.slant !== undefined ? opts.slant : -0.42;
    const alpha = opts.alpha !== undefined ? opts.alpha : 0.22;
    const width = opts.width || 1.6;
    const spreadX = opts.spreadX || W;
    const offsetX = opts.offsetX || 0;

    ctx.save();
    ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const lane = hash2(i, 7);
      const x0 = offsetX + lane * spreadX;
      const phase = hash2(i, 11) * 1000;
      const y = ((phase + t * speed * (0.75 + hash2(i, 13) * 0.5)) % (H + 120)) - 60;
      const len = 18 + hash2(i, 17) * 26;
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + slant * len, y + len);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** Nevoa em bandas; `t` faz o banco de neblina andar devagar. */
  function fogBank(ctx, W, H, t, opts = {}) {
    const y0 = opts.y0 !== undefined ? opts.y0 : H * 0.45;
    const y1 = opts.y1 !== undefined ? opts.y1 : H;
    const density = opts.density !== undefined ? opts.density : 0.5;
    const color = opts.color || '#cbd5e1';
    const drift = opts.drift !== undefined ? opts.drift : 40;
    const shift = Math.sin(t * 0.45) * drift;

    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, rgba(color, 0));
    g.addColorStop(0.55, rgba(color, density * 0.62));
    g.addColorStop(1, rgba(color, density));
    ctx.fillStyle = g;
    ctx.fillRect(-60 + shift * 0.2, y0, W + 120, y1 - y0 + 80);

    // Volutas mais densas, presas ao chão
    for (let i = 0; i < 7; i++) {
      const bx = ((hash(i) * W + shift * (0.5 + hash(i + 3) * 0.6)) % (W + 300)) - 150;
      const by = y1 - 40 - hash(i + 9) * (y1 - y0) * 0.45;
      glow(ctx, bx, by, 150 + hash(i + 5) * 180, color, density * 0.16);
    }
  }

  /** Sombras em faixas — padrão de persiana ou grade projetada. */
  function shadowBars(ctx, W, H, opts = {}) {
    const gap = opts.gap || 120;
    const width = opts.width || 56;
    const angle = opts.angle !== undefined ? opts.angle : -0.18;
    const alpha = opts.alpha !== undefined ? opts.alpha : 0.35;
    const x0 = opts.x0 !== undefined ? opts.x0 : -W * 0.3;

    ctx.save();
    ctx.translate(W * 0.5, H * 0.5);
    ctx.rotate(angle);
    ctx.translate(-W * 0.5, -H * 0.5);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    for (let x = x0; x < W * 1.6; x += gap) {
      ctx.fillRect(x, -H * 0.4, width, H * 1.8);
    }
    ctx.restore();
  }

  /**
   * Resolve de onde vem o grupo de personagens a partir do estado da cena.
   * Mantém o mesmo contrato em todas as cenas: o diretor passa `S.elenco`
   * (ou o estado antigo `S.voce/S.valdir/S.lucas/S.camila`) e a cena decide
   * só posição e escala.
   */
  function elenco(S) {
    if (!S) return {};
    if (S.elenco) return S.elenco;
    return {
      voce: S.voce || null,
      valdir: S.valdir || null,
      lucas: S.lucas || null,
      camila: S.camila || null
    };
  }

  /**
   * Coloca um personagem sem alterar o estado do objeto fora do desenho.
   * `opts`: { x, y, scale, flipX, viewMode, pose, emotion, mouthOpen }
   * Devolve uma função de restauração (para depurar) — o desenho já restaura.
   */
  function poseActor(actor, ctx, opts) {
    if (!actor) return null;
    const saved = {
      x: actor.x, y: actor.y, scale: actor.scale, flipX: actor.flipX,
      viewMode: actor.viewMode, pose: actor.pose, emotion: actor.emotion,
      mouthOpen: actor.mouthOpen, reactSide: actor.reactSide,
      reactAmount: actor.reactAmount
    };
    if (opts.x !== undefined) actor.x = opts.x;
    if (opts.y !== undefined) actor.y = opts.y;
    if (opts.scale !== undefined) actor.scale = opts.scale;
    if (opts.flipX !== undefined) actor.flipX = opts.flipX;
    if (opts.viewMode !== undefined) actor.viewMode = opts.viewMode;
    if (opts.pose !== undefined) actor.pose = opts.pose;
    if (opts.emotion !== undefined) actor.emotion = opts.emotion;
    if (opts.mouthOpen !== undefined) actor.mouthOpen = opts.mouthOpen;
    if (opts.reactSide !== undefined && typeof actor.reactToSide === 'function') {
      actor.reactToSide(opts.reactSide, opts.reactAmount !== undefined ? opts.reactAmount : 1);
    }
    actor.draw(ctx);
    Object.assign(actor, saved);
    return saved;
  }

  /**
   * Sombra de contato suave para apoiar o personagem no chão do plano.
   * Use quando o plano não desenha a própria sombra.
   */
  function contactShadow(ctx, x, y, rx, opacity = 0.5) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, rx);
    g.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, rx * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Cor de iluminação para acender um personagem (rim light / key light). */
  function rimLight(ctx, x, y, radius, color, strength = 0.35) {
    glow(ctx, x, y, radius, color, strength);
  }

  global.StudioEngine = global.StudioEngine || {};
  global.StudioEngine.DepthScene2D = {
    hash, hash2, rgba, mix, easeOutCubic, easeInOutSine, PALETTE,
    layer, drawLayer, compose, elenco, poseActor,
    contactShadow, rimLight,
    glow, lightShaft, vignette, grain, rain, fogBank, shadowBars
  };
})(typeof window !== 'undefined' ? window : globalThis);
