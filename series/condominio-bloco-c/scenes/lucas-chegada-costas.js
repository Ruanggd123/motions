/**
 * CENA: lucas_chegada_costas
 * O Lucas correndo PELA RUA, visto DE COSTAS, na direção da guarita.
 *
 * POR QUE ESTA CENA EXISTE:
 *   O roteiro chega no Lucas já encostado no vidro. Sem um plano de chegada,
 *   ele "aparece" do nada. Esta cena mostra o percurso: ele vem da neblina,
 *   de costas para a câmera, correndo e olhando para trás apavorado.
 *
 * Profundidade real (3 planos):
 *   FUNDO   — rua em fuga, postes apagados, massa negra vindo
 *   MEIO    — guarita iluminada ao fundo, à frente dele
 *   FRENTE — o Lucas, de costas, quadro dominado pela mochila térmica
 *
 * A leitura das costas vem da mochila quadrada vermelha, do capacete de
 * motoboy na mão e das costas da jaqueta refletiva — silhueta inequívoca.
 */
(function (global) {
  const draw = (ctx, S) => {
    const { W, H, t } = S;
    // Progresso da corrida: 0 = longe na neblina, 1 = quase na guarita
    const runStart = S.runStart !== undefined ? S.runStart : 0;
    const runDur = S.runDuration !== undefined ? S.runDuration : 1.6;
    const p = Math.min(1, Math.max(0, (t - runStart) / runDur));
    const eased = 1 - Math.pow(1 - p, 2.2);

    // Escala cresce conforme ele se aproxima da câmera (perspectiva de fuga)
    const scale = 0.62 + eased * 0.78;          // 0.62 → 1.40
    const groundY = H * 0.80 + (1 - eased) * H * 0.045;

    ctx.save();
    ctx.fillStyle = '#02050b';
    ctx.fillRect(0, 0, W, H);

    /* ── FUNDO: céu e rua em fuga ─────────────────────────────── */
    const horizon = H * 0.52;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#010306');
    sky.addColorStop(0.6, '#050b16');
    sky.addColorStop(1, '#0a1424');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon);

    // Prédios distantes apagados
    [[40, H * 0.26, 150, H * 0.28], [220, H * 0.20, 180, H * 0.34],
     [700, H * 0.23, 160, H * 0.31], [880, H * 0.28, 150, H * 0.26]].forEach(([bx, by, bw, bh], i) => {
      ctx.fillStyle = i % 2 ? '#04070f' : '#03060d';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.045)';
      ctx.lineWidth = 1;
      for (let wy = by + 28; wy < by + bh - 34; wy += 42) {
        for (let wx = bx + 16; wx < bx + bw - 22; wx += 36) ctx.strokeRect(wx, wy, 15, 19);
      }
    });

    // Rua em perspectiva, convergindo para o ponto de fuga
    const road = ctx.createLinearGradient(0, horizon, 0, H);
    road.addColorStop(0, '#050a14');
    road.addColorStop(0.4, '#080e1b');
    road.addColorStop(1, '#02050c');
    ctx.fillStyle = road;
    ctx.fillRect(0, horizon, W, H - horizon);

    // Guias laterais da calçada convergindo
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.5 - 40, horizon);
    ctx.lineTo(-120, H);
    ctx.moveTo(W * 0.5 + 40, horizon);
    ctx.lineTo(W + 120, H);
    ctx.stroke();

    // Faixa central tracejada crescendo em direção à câmera
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.16)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const f = i / 6;
      const y1 = horizon + Math.pow(f, 1.7) * (H - horizon);
      const y2 = horizon + Math.pow((i + 0.5) / 6, 1.7) * (H - horizon);
      ctx.lineWidth = 2 + f * 7;
      ctx.beginPath();
      ctx.moveTo(W * 0.5, y1);
      ctx.lineTo(W * 0.5, y2);
      ctx.stroke();
    }

    /* ── MASSA NEGRA no fundo, avançando por trás dele ────────── */
    const massY = horizon - 40 + eased * 60;
    const mg = ctx.createLinearGradient(0, massY - 200, 0, massY + 220);
    mg.addColorStop(0, 'rgba(0, 0, 0, 0)');
    mg.addColorStop(0.45, 'rgba(0, 0, 0, 0.82)');
    mg.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, massY - 200, W, H - massY + 260);

    // Olhos carmesins se acendendo dentro da massa
    for (let e = 0; e < 5; e++) {
      const blink = Math.max(0, Math.sin(t * 2.8 + e * 1.7));
      if (blink < 0.35) continue;
      ctx.fillStyle = `rgba(239, 68, 68, ${(blink * 0.7).toFixed(2)})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(120 + e * 190 + Math.sin(t * 1.3 + e) * 22, massY + 10 + (e % 2) * 26,
        11, 4 * blink, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    /* ── GUARITA iluminada ao fundo, à frente dele ────────────── */
    const gW = 210;
    const gH = 190;
    const gX = W * 0.5 - gW / 2;
    const gY = horizon - gH + 34;

    ctx.fillStyle = '#16202e';
    ctx.fillRect(gX, gY, gW, gH);
    ctx.strokeStyle = '#3b4a5e';
    ctx.lineWidth = 4;
    ctx.strokeRect(gX, gY, gW, gH);

    // Vidro com luz interna (o refúgio)
    const glow = ctx.createLinearGradient(gX + 14, gY + 18, gX + gW - 14, gY + gH - 26);
    glow.addColorStop(0, 'rgba(253, 224, 71, 0.34)');
    glow.addColorStop(0.5, 'rgba(56, 189, 248, 0.20)');
    glow.addColorStop(1, 'rgba(8, 16, 28, 0.9)');
    ctx.fillStyle = glow;
    ctx.fillRect(gX + 14, gY + 18, gW - 28, gH - 44);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(gX + 14, gY + 18, gW - 28, gH - 44);

    // Halo de luz saindo da guarita na rua
    const halo = ctx.createRadialGradient(W * 0.5, gY + gH * 0.6, 10, W * 0.5, gY + gH * 0.6, 300);
    halo.addColorStop(0, 'rgba(253, 224, 71, 0.16)');
    halo.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(W * 0.5, gY + gH * 0.6, 300, 0, Math.PI * 2);
    ctx.fill();

    /* ── O LUCAS DE COSTAS (plano frontal, quadro dominante) ──── */
    ctx.save();
    ctx.translate(W * 0.5, groundY);
    ctx.scale(scale, scale);

    // Passada alternando (corrida)
    const stride = Math.sin(t * 11) * 13;
    const bob = Math.abs(Math.cos(t * 11)) * 6;

    // Sombra no asfalto
    const sh = ctx.createRadialGradient(0, 4, 6, 0, 4, 90);
    sh.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    sh.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.ellipse(0, 4, 90, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pernas de costas: a de trás é mais escura
    [-1, 1].forEach((side, idx) => {
      ctx.save();
      ctx.translate(side * 20, -bob);
      ctx.rotate(stride * side * 0.035 + side * 0.03);
      const legDark = idx === 0 ? '#0b1018' : '#141b26';
      // Coxa
      ctx.fillStyle = legDark;
      ctx.beginPath();
      ctx.roundRect(-11, 0, 22, 62, 8);
      ctx.fill();
      // Canela
      ctx.fillStyle = idx === 0 ? '#090d14' : '#101720';
      ctx.beginPath();
      ctx.roundRect(-9, 58, 18, 62, 7);
      ctx.fill();
      // Tênis
      ctx.fillStyle = '#05080d';
      ctx.beginPath();
      ctx.roundRect(-12, 114, 26, 16, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(226, 232, 240, 0.10)';
      ctx.beginPath();
      ctx.roundRect(-12, 126, 26, 5, 2);
      ctx.fill();
      ctx.restore();
    });

    // Moletom/jaqueta de costas (visto por trás, sem rosto)
    const jacket = ctx.createLinearGradient(-46, -160, 46, -30);
    jacket.addColorStop(0, '#111a26');
    jacket.addColorStop(0.5, '#0c141e');
    jacket.addColorStop(1, '#060a10');
    ctx.fillStyle = jacket;
    ctx.beginPath();
    ctx.moveTo(-44, -150);
    ctx.quadraticCurveTo(-50, -80, -44, -34);
    ctx.lineTo(44, -34);
    ctx.quadraticCurveTo(50, -80, 44, -150);
    ctx.quadraticCurveTo(0, -164, -44, -150);
    ctx.closePath();
    ctx.fill();

    // Faixa refletiva nas costas (prata, catchlight do poste)
    ctx.fillStyle = 'rgba(203, 213, 225, 0.55)';
    ctx.fillRect(-42, -122, 84, 9);
    ctx.fillRect(-42, -60, 84, 7);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(-42, -120, 84, 2.5);

    // Braços de costas, balançando na corrida
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(side * 44, -140);
      ctx.rotate(-stride * side * 0.028 + side * 0.14);
      ctx.fillStyle = '#0d141d';
      ctx.beginPath();
      ctx.roundRect(-9, 0, 18, 58, 8);
      ctx.fill();
      ctx.fillStyle = '#0a1017';
      ctx.beginPath();
      ctx.roundRect(-8, 54, 16, 52, 7);
      ctx.fill();
      // Mão
      ctx.fillStyle = '#b07b52';
      ctx.beginPath();
      ctx.roundRect(-8, 104, 16, 15, 6);
      ctx.fill();
      ctx.restore();
    });

    // Cabeça vista de costas (nuca + capacete no ombro)
    ctx.fillStyle = '#8d5f3c';
    ctx.beginPath();
    ctx.ellipse(0, -172, 27, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nuca/cabelo curto
    ctx.fillStyle = '#171310';
    ctx.beginPath();
    ctx.ellipse(0, -180, 28, 25, 0, Math.PI * 0.05, Math.PI * 0.95, true);
    ctx.fill();

    // ── A MOCHILA TÉRMICA (elemento que diz "entregador" de costas) ──
    const bagY = -118 + Math.abs(Math.sin(t * 11)) * 4;
    ctx.save();
    ctx.translate(0, bagY);
    ctx.rotate(Math.sin(t * 11) * 0.03);
    const bagGrad = ctx.createLinearGradient(-40, 0, 40, 0);
    bagGrad.addColorStop(0, '#7f1d1d');
    bagGrad.addColorStop(0.42, '#dc2626');
    bagGrad.addColorStop(0.75, '#b91c1c');
    bagGrad.addColorStop(1, '#6b1414');
    ctx.fillStyle = bagGrad;
    ctx.beginPath();
    ctx.roundRect(-40, -8, 80, 74, 10);
    ctx.fill();
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tampa superior e faixa branca de identificação
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.roundRect(-40, -8, 80, 14, 6);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-40, 18, 80, 10);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(-30, 20, 26, 6);

    // Alças da mochila subindo aos ombros
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-30, -6);
    ctx.quadraticCurveTo(-32, -34, -20, -44);
    ctx.moveTo(30, -6);
    ctx.quadraticCurveTo(32, -34, 20, -44);
    ctx.stroke();
    ctx.restore();

    // Capacete pendurado na mão esquerda (silhueta de motoboy)
    ctx.save();
    ctx.translate(-56, -30 + Math.sin(t * 11) * 8);
    ctx.rotate(0.18);
    ctx.fillStyle = '#0b1119';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.30)';
    ctx.beginPath();
    ctx.ellipse(4, -3, 11, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // fim Lucas

    /* ── NEBLINA / CHUVA na frente (profundidade) ─────────────── */
    const fog = ctx.createLinearGradient(0, H * 0.55, 0, H);
    fog.addColorStop(0, 'rgba(203, 213, 225, 0)');
    fog.addColorStop(0.55, 'rgba(203, 213, 225, 0.10)');
    fog.addColorStop(1, 'rgba(226, 232, 240, 0.18)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.22)';
    ctx.lineWidth = 1.7;
    for (let r = 0; r < 90; r++) {
      const rx = ((r * 71 + t * 480) % (W + 200)) - 100;
      const ry = (r * 43 + t * 900) % H;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 12, ry + 26);
      ctx.stroke();
    }

    // Vinheta
    const vig = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.30, W / 2, H * 0.55, H * 0.78);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(2, 6, 23, 0.75)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('lucas_chegada_costas', {
    meta: {
      nome: 'Lucas chegando · de costas',
      angulo: 'frontal pelas costas (over-the-shoulder invertido)',
      profundidade: 'rua em fuga → guarita → Lucas',
      criadoEm: '2026-11-04',
      pinned: true
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
