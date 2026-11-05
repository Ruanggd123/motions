/**
 * CENAS: guarita_3q (3/4) e guarita_perfil_janela (perfil pela janela)
 *
 * O Ep.03 passava a cena inteira num único ângulo frontal. Isso achata a
 * leitura. Estas duas cenas dão o mesmo espaço em ângulos diferentes, com
 * profundidade por camadas (parede → bancada → personagem → vidro → moldura):
 *
 *   guarita_3q          — câmera no canto, vendo duas paredes em perspectiva.
 *                          É o plano que "abre" o interior da guarita.
 *   guarita_perfil_janela — câmera de lado, olhando pela janela blindada.
 *                          Lucas aparece do outro lado do vidro.
 *
 * Ambas seguem a regra da Bíblia §5.1: personagens de frente no repouso;
 * o perfil é usado só quando o roteiro pede a lateral (janela).
 */
(function (global) {
  const define = (name, scene) => {
    (global.StudioScenes = global.StudioScenes || { define() {} });
    global.StudioScenes.define(name, scene);
  };

  /* ══════════════════════════════════════════════════════════════════
   * GUARITA EM 3/4 — duas paredes em perspectiva, profundidade real
   * ══════════════════════════════════════════════════════════════════ */
  function drawGuarita3Q(ctx, S) {
    const { W, H, t, alarmActive = false, spotlightOn = false } = S;
    const pulse = alarmActive ? (Math.sin(t * 8) * 0.5 + 0.5) : 0;

    ctx.save();

    // Base opaca cobrindo o quadro inteiro — sem isso sobrava uma faixa
    // transparente no topo (os polígonos de teto/parede não alcançavam y=0).
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, W, H);

    // Ponto de fuga deslocado à direita: é isso que cria o 3/4
    const vpX = W * 0.72;
    const vpY = H * 0.40;

    // ── TETO em perspectiva (linhas convergindo para o VP) ────────────
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, H * 0.22);
    ceilingGrad.addColorStop(0, '#070b13');
    ceilingGrad.addColorStop(1, '#141d2b');
    ctx.fillStyle = ceilingGrad;
    ctx.beginPath();
    ctx.moveTo(-80, -80);
    ctx.lineTo(W + 80, -80);
    ctx.lineTo(W + 80, H * 0.155);
    ctx.lineTo(-80, H * 0.235);
    ctx.closePath();
    ctx.fill();

    // Sanca de LED seguindo a perspectiva
    ctx.strokeStyle = alarmActive
      ? `rgba(239, 68, 68, ${0.45 + pulse * 0.5})`
      : 'rgba(253, 230, 138, 0.55)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-60, H * 0.215);
    ctx.lineTo(W + 60, H * 0.145);
    ctx.stroke();

    // ── PAREDE ESQUERDA: madeira ripada em perspectiva ────────────────
    const wallGrad = ctx.createLinearGradient(0, H * 0.2, W * 0.55, H * 0.9);
    wallGrad.addColorStop(0, '#211610');
    wallGrad.addColorStop(0.6, '#171008');
    wallGrad.addColorStop(1, '#0c0906');
    ctx.fillStyle = wallGrad;
    ctx.beginPath();
    ctx.moveTo(-80, H * 0.235);
    ctx.lineTo(W * 0.60, H * 0.30);
    ctx.lineTo(W * 0.60, H * 0.93);
    ctx.lineTo(-80, H + 80);
    ctx.closePath();
    ctx.fill();

    // Ripas verticais com afastamento crescente (perspectiva)
    for (let i = 0; i < 13; i++) {
      const p = i / 12;
      const x = -60 + p * (W * 0.62);
      const top = H * 0.238 + p * (H * 0.062);
      const bot = H * 0.985 + p * (H * 0.02);
      const w = 26 * (1 - p * 0.55);
      ctx.fillStyle = i % 2 ? '#2a1d14' : '#1d150e';
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + w, top + 2);
      ctx.lineTo(x + w, bot);
      ctx.lineTo(x, bot + 4);
      ctx.closePath();
      ctx.fill();
    }

    // ── PAREDE DIREITA: concreto, mais clara (recebe a luz) ───────────
    const rightGrad = ctx.createLinearGradient(W * 0.60, H * 0.2, W, H * 0.8);
    rightGrad.addColorStop(0, '#1a2432');
    rightGrad.addColorStop(0.7, '#141c28');
    rightGrad.addColorStop(1, '#0d141d');
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(W * 0.60, H * 0.30);
    ctx.lineTo(W + 80, H * 0.20);
    ctx.lineTo(W + 80, H * 0.90);
    ctx.lineTo(W * 0.60, H * 0.93);
    ctx.closePath();
    ctx.fill();

    // ── JANELA BLINDADA na parede direita, em perspectiva ─────────────
    const winL = W * 0.655;
    const winR = W * 0.955;
    const winT = H * 0.325;
    const winB = H * 0.62;

    // Moldura externa
    ctx.fillStyle = '#2b3644';
    ctx.beginPath();
    ctx.moveTo(winL - 14, winT - 12);
    ctx.lineTo(winR + 10, winT - 26);
    ctx.lineTo(winR + 10, winB + 16);
    ctx.lineTo(winL - 14, winB + 22);
    ctx.closePath();
    ctx.fill();

    // Vidro: mostra a rua lá fora, mais escura e com neblina
    const glassGrad = ctx.createLinearGradient(winL, winT, winR, winB);
    glassGrad.addColorStop(0, 'rgba(12, 26, 44, 0.96)');
    glassGrad.addColorStop(0.5, 'rgba(8, 18, 32, 0.94)');
    glassGrad.addColorStop(1, 'rgba(4, 10, 20, 0.98)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(winL, winT);
    ctx.lineTo(winR, winT - 14);
    ctx.lineTo(winR, winB + 4);
    ctx.lineTo(winL, winB + 10);
    ctx.closePath();
    ctx.fill();

    // Neblina e poste apagado vistos pelo vidro
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(winL, winT);
    ctx.lineTo(winR, winT - 14);
    ctx.lineTo(winR, winB + 4);
    ctx.lineTo(winL, winB + 10);
    ctx.closePath();
    ctx.clip();

    const fogWin = ctx.createLinearGradient(0, winT, 0, winB);
    fogWin.addColorStop(0, 'rgba(148, 163, 184, 0.06)');
    fogWin.addColorStop(0.65, 'rgba(203, 213, 225, 0.20)');
    fogWin.addColorStop(1, 'rgba(226, 232, 240, 0.30)');
    ctx.fillStyle = fogWin;
    ctx.fillRect(winL, winT, winR - winL, winB - winT + 20);

    // Reflexo do holofote no vidro
    if (spotlightOn) {
      const refl = ctx.createRadialGradient(
        winL + (winR - winL) * 0.3, winT + (winB - winT) * 0.5, 8,
        winL + (winR - winL) * 0.3, winT + (winB - winT) * 0.5, 180
      );
      refl.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      refl.addColorStop(0.4, 'rgba(254, 249, 195, 0.10)');
      refl.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = refl;
      ctx.fillRect(winL, winT, winR - winL, winB - winT + 20);
    }

    // Chuva batendo no vidro (gotas em diagonal, seguindo a perspectiva)
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.22)';
    ctx.lineWidth = 1.6;
    for (let d = 0; d < 26; d++) {
      const gx = winL + ((d * 61 + t * 90) % (winR - winL));
      const gy = winT + ((d * 97 + t * 240) % (winB - winT));
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx - 5, gy + 16);
      ctx.stroke();
    }

    // Marcas de mão do Lucas do lado de fora (continuidade)
    ctx.fillStyle = 'rgba(241, 245, 249, 0.10)';
    ctx.beginPath();
    ctx.ellipse(winL + (winR - winL) * 0.42, winT + (winB - winT) * 0.58, 26, 34, 0.05, 0, Math.PI * 2);
    ctx.ellipse(winL + (winR - winL) * 0.56, winT + (winB - winT) * 0.66, 24, 32, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Moldura interna do vidro + montantes em perspectiva
    ctx.strokeStyle = '#3f4d5e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(winL, winT);
    ctx.lineTo(winR, winT - 14);
    ctx.lineTo(winR, winB + 4);
    ctx.lineTo(winL, winB + 10);
    ctx.closePath();
    ctx.stroke();

    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const mx = (winL + winR) / 2;
    ctx.moveTo(mx, winT + 8);
    ctx.lineTo(mx, winB - 2);
    ctx.stroke();

    // ══ PERSONAGENS DENTRO DA GUARITA (ANTES da bancada, que os esconde do quadril para baixo) ══
    // Faltavam: a cena 3/4 mostrava só o ambiente vazio. Desenhados aqui, a
    // bancada cria o corte natural na altura dos quadris, como num plano real.
    // ── PERSONAGENS DENTRO DA GUARITA (Enquadramento Cinematográfico Médio 2-Shot) ──
    if (S.valdir) {
      const sv = { x: S.valdir.x, y: S.valdir.y, scale: S.valdir.scale, flipX: S.valdir.flipX, viewMode: S.valdir.viewMode, pose: S.valdir.pose };
      S.valdir.x = W * 0.275;
      S.valdir.y = H * 0.635;
      S.valdir.scale = 2.65;
      S.valdir.flipX = false;
      S.valdir.viewMode = 'front';
      S.valdir.draw(ctx);
      Object.assign(S.valdir, sv);
    }

    if (S.voce) {
      const sv = { x: S.voce.x, y: S.voce.y, scale: S.voce.scale, flipX: S.voce.flipX, viewMode: S.voce.viewMode, pose: S.voce.pose };
      S.voce.x = W * 0.515;
      S.voce.y = H * 0.628;
      S.voce.scale = 2.55;
      S.voce.flipX = false;
      S.voce.viewMode = 'front';
      S.voce.draw(ctx);
      Object.assign(S.voce, sv);
    }

    // ── BANCADA em perspectiva (Cobre do quadril para baixo com profundidade) ──
    const deskY = H * 0.640;
    const deskGrad = ctx.createLinearGradient(0, deskY, 0, H);
    deskGrad.addColorStop(0, '#2a3644');
    deskGrad.addColorStop(0.12, '#1b2532');
    deskGrad.addColorStop(0.5, '#0f172a');
    deskGrad.addColorStop(1, '#060a12');
    ctx.fillStyle = deskGrad;
    ctx.beginPath();
    ctx.moveTo(-80, deskY + 40);
    ctx.lineTo(W * 0.60, deskY - 25);
    ctx.lineTo(W + 80, deskY - 65);
    ctx.lineTo(W + 80, H + 80);
    ctx.lineTo(-80, H + 80);
    ctx.closePath();
    ctx.fill();

    // Borda frontal iluminada
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.42)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-80, deskY + 40);
    ctx.lineTo(W * 0.60, deskY - 25);
    ctx.lineTo(W + 80, deskY - 65);
    ctx.stroke();

    // ── MONITORES CFTV na parede esquerda, inclinados ─────────────────
    const monCfg = [
      { x: W * 0.055, y: H * 0.335, w: 138, h: 88, label: '01·RUA' },
      { x: W * 0.225, y: H * 0.325, w: 150, h: 94, label: '02·ECLUSA' },
      { x: W * 0.075, y: H * 0.455, w: 132, h: 86, label: '03·ELEV' },
      { x: W * 0.245, y: H * 0.445, w: 142, h: 90, label: '04·GARAGEM' }
    ];
    monCfg.forEach((m, idx) => {
      const skew = -6 * (idx % 2 === 0 ? 1 : 0.6);
      ctx.fillStyle = '#05080e';
      ctx.beginPath();
      ctx.moveTo(m.x - 5, m.y - 5 + skew);
      ctx.lineTo(m.x + m.w + 5, m.y - 5);
      ctx.lineTo(m.x + m.w + 5, m.y + m.h + 5);
      ctx.lineTo(m.x - 5, m.y + m.h + 5 - skew);
      ctx.closePath();
      ctx.fill();

      const scr = ctx.createLinearGradient(m.x, m.y, m.x, m.y + m.h);
      scr.addColorStop(0, '#0a1a2a');
      scr.addColorStop(1, '#061020');
      ctx.fillStyle = scr;
      ctx.fillRect(m.x + 2, m.y + 2, m.w - 4, m.h - 4);

      // Grade de varredura
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      for (let sy = m.y; sy < m.y + m.h; sy += 3) ctx.fillRect(m.x, sy, m.w, 1);

      ctx.fillStyle = '#22c55e';
      ctx.font = '700 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('● ' + m.label, m.x + 8, m.y + 20);

      if (m.label.includes('ECLUSA')) {
        // A criatura aparece neste monitor
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.beginPath();
        ctx.ellipse(m.x + m.w * 0.5, m.y + m.h * 0.62, 16, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(m.x + m.w * 0.44, m.y + m.h * 0.55, 2.4, 0, Math.PI * 2);
        ctx.arc(m.x + m.w * 0.56, m.y + m.h * 0.55, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Brilho esverdeado dos monitores na parede
    const cctvGlow = ctx.createRadialGradient(W * 0.2, H * 0.40, 20, W * 0.2, H * 0.40, 340);
    cctvGlow.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
    cctvGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = cctvGlow;
    ctx.fillRect(0, H * 0.2, W * 0.7, H * 0.5);

    // ── INTERFONE na parede direita ───────────────────────────────────
    ctx.fillStyle = '#0b1219';
    ctx.strokeStyle = '#3b4a5c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(W * 0.80, H * 0.655, 74, 108, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = alarmActive && Math.sin(t * 9) > 0 ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(W * 0.80 + 14, H * 0.655 + 18, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // ── Alarme: pulso vermelho na sala ────────────────────────────────
    if (alarmActive) {
      const redWash = ctx.createRadialGradient(W * 0.45, H * 0.35, 40, W * 0.45, H * 0.35, W * 0.9);
      redWash.addColorStop(0, `rgba(239, 68, 68, ${0.05 + pulse * 0.10})`);
      redWash.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = redWash;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  }

  /* ══════════════════════════════════════════════════════════════════
   * GUARITA DE PERFIL — câmera de lado, olhando pela janela
   * O vidro fica entre o interior e o Lucas (utiliza a ordem: dentro → vidro → fora)
   * ══════════════════════════════════════════════════════════════════ */
  function drawGuaritaPerfilJanela(ctx, S) {
    const { W, H, t, alarmActive = false, spotlightOn = false, lucasMouth = 0 } = S;
    const pulse = alarmActive ? (Math.sin(t * 8.5) * 0.5 + 0.5) : 0;

    ctx.save();

    const floorY = H * 0.755;
    const glassX = W * 0.635;      // posição do vidro blindado em perfil
    const glassW = 46;

    // ── TETO e paredes do interior ────────────────────────────────────
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, H * 0.14);
    ceilGrad.addColorStop(0, '#080c14');
    ceilGrad.addColorStop(1, '#161f2d');
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, W, H * 0.14);

    ctx.fillStyle = alarmActive ? `rgba(239, 68, 68, ${0.4 + pulse * 0.5})` : 'rgba(253, 230, 138, 0.5)';
    ctx.fillRect(0, H * 0.135, glassX, 5);

    // Parede interna (madeira ripada) — só a parte esquerda
    const intWall = ctx.createLinearGradient(0, H * 0.14, glassX, H * 0.7);
    intWall.addColorStop(0, '#1b130c');
    intWall.addColorStop(1, '#100b07');
    ctx.fillStyle = intWall;
    ctx.fillRect(0, H * 0.14, glassX, floorY - H * 0.14);

    for (let sx = 0; sx < glassX; sx += 34) {
      ctx.fillStyle = '#241a11';
      ctx.fillRect(sx, H * 0.14, 22, floorY - H * 0.14);
      ctx.fillStyle = '#2e2116';
      ctx.fillRect(sx + 4, H * 0.14, 6, floorY - H * 0.14);
    }

    // Piso da guarita
    ctx.fillStyle = '#0e131b';
    ctx.fillRect(0, floorY, glassX, H - floorY);

    // Bancada de trabalho em PERFIL (uma faixa horizontal que corre na diagonal)
    const deskY = floorY - 92;
    ctx.fillStyle = '#1b2532';
    ctx.beginPath();
    ctx.moveTo(0, deskY + 26);
    ctx.lineTo(glassX, deskY - 10);
    ctx.lineTo(glassX, deskY + 26);
    ctx.lineTo(0, deskY + 70);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, deskY + 26);
    ctx.lineTo(glassX, deskY - 10);
    ctx.stroke();

    // ── FORA: rua em perfil, chuva, moto caída ────────────────────────
    const outGrad = ctx.createLinearGradient(glassX, 0, W, H);
    outGrad.addColorStop(0, '#03060d');
    outGrad.addColorStop(0.5, '#061020');
    outGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = outGrad;
    ctx.fillRect(glassX + glassW, 0, W - glassX - glassW, H);

    // Asfalto externo
    ctx.fillStyle = '#0a1019';
    ctx.fillRect(glassX + glassW, floorY, W - glassX - glassW, H - floorY);

    // Meio-fio
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(glassX + glassW, floorY - 16, W - glassX - glassW, 18);

    // Poste apagado ao fundo + neblina
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(W * 0.90, H * 0.22, 9, H * 0.52);
    const fogOut = ctx.createLinearGradient(0, H * 0.4, 0, floorY);
    fogOut.addColorStop(0, 'rgba(148, 163, 184, 0.04)');
    fogOut.addColorStop(0.6, 'rgba(203, 213, 225, 0.16)');
    fogOut.addColorStop(1, 'rgba(226, 232, 240, 0.26)');
    ctx.fillStyle = fogOut;
    ctx.fillRect(glassX + glassW, H * 0.4, W - glassX - glassW, floorY - H * 0.4);

    // Moto caída na rua
    ctx.save();
    ctx.translate(W * 0.845, floorY - 34);
    ctx.rotate(0.30);
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(-34, 16, 20, 0, Math.PI * 2);
    ctx.arc(34, 14, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-30, 8);
    ctx.lineTo(12, -12);
    ctx.lineTo(28, 10);
    ctx.closePath();
    ctx.fill();
    // Pisca-alerta
    if (Math.sin(t * 7) > 0.2) {
      const bl = ctx.createRadialGradient(40, -2, 2, 40, -2, 90);
      bl.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
      bl.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = bl;
      ctx.beginPath();
      ctx.arc(40, -2, 90, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ── LUCAS do lado de fora, em PERFIL (belongs depois do vidro? não:
    //    ele está atrás do vidro, então desenhamos ANTES dele) ─────────
    if (S.lucas) {
      const saveL = { x: S.lucas.x, y: S.lucas.y, scale: S.lucas.scale, flipX: S.lucas.flipX, viewMode: S.lucas.viewMode, pose: S.lucas.pose };
      S.lucas.x = glassX + glassW + 84;
      S.lucas.y = floorY + 8;
      S.lucas.scale = 2.05;
      S.lucas.flipX = true;          // olha para a esquerda, na direção do vidro
      S.lucas.viewMode = 'profile';
      S.lucas.pose = S.lucasHit ? 'bang_gate' : 'hands_glass';
      S.lucas.mouthOpen = Math.max(0.3, lucasMouth);
      S.lucas.draw(ctx);
      Object.assign(S.lucas, saveL);
    }

    // ── VIDRO BLINDADO EM PERFIL (espessura real, lâminas laminadas) ──
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(glassX - 10, H * 0.10, glassW + 20, floorY - H * 0.10 + 8);

    const glassGrad = ctx.createLinearGradient(glassX, 0, glassX + glassW, 0);
    glassGrad.addColorStop(0, 'rgba(6, 182, 212, 0.34)');
    glassGrad.addColorStop(0.35, 'rgba(16, 185, 129, 0.20)');
    glassGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.26)');
    glassGrad.addColorStop(1, 'rgba(6, 182, 212, 0.42)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(glassX, H * 0.10, glassW, floorY - H * 0.10 + 8);

    // Lâminas internas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.4;
    [0.34, 0.66].forEach(f => {
      ctx.beginPath();
      ctx.moveTo(glassX + glassW * f, H * 0.10);
      ctx.lineTo(glassX + glassW * f, floorY + 8);
      ctx.stroke();
    });

    // Altura do vidro coerente: termina na altura do peito de um adulto
    // (é uma janela de atendimento, não uma parede de vidro até o teto)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(glassX - 10, H * 0.10, glassW + 20, floorY - H * 0.10 + 8);

    // Trincas no vidro em PERFIL: só delaminação interna, sem teia
    const isImpact = S.lucasHit;
    const hy1 = floorY - 250;
    const hy2 = floorY - 140;
    [hy1, hy2].forEach((hy, i) => {
      ctx.strokeStyle = isImpact ? 'rgba(255,255,255,0.5)' : 'rgba(203,213,225,0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(glassX + glassW / 2, hy, glassW * 0.42 + (isImpact ? 3 : 0), 40 + i * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Gotas escorrendo no vidro
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)';
    ctx.lineWidth = 1.8;
    for (let g = 0; g < 9; g++) {
      const gy = H * 0.15 + ((g * 150 + t * 190) % (floorY - H * 0.2));
      ctx.beginPath();
      ctx.moveTo(glassX + glassW * 0.7, gy);
      ctx.lineTo(glassX + glassW * 0.7, gy + 16);
      ctx.stroke();
    }

    // ── PERSONAGENS DENTRO DA GUARITA, em perfil ──────────────────────
    if (S.valdir) {
      const sv = { x: S.valdir.x, y: S.valdir.y, scale: S.valdir.scale, flipX: S.valdir.flipX, viewMode: S.valdir.viewMode, pose: S.valdir.pose };
      S.valdir.x = glassX - 190;
      S.valdir.y = floorY + 4;
      S.valdir.scale = 1.95;
      S.valdir.flipX = false;         // olha para a direita, na direção da janela
      S.valdir.viewMode = 'profile';
      S.valdir.draw(ctx);
      Object.assign(S.valdir, sv);
    }

    if (S.voce) {
      const sv = { x: S.voce.x, y: S.voce.y, scale: S.voce.scale, flipX: S.voce.flipX, viewMode: S.voce.viewMode, pose: S.voce.pose };
      S.voce.x = glassX - 340;
      S.voce.y = floorY + 2;
      S.voce.scale = 1.85;
      S.voce.flipX = false;
      S.voce.viewMode = 'profile';
      S.voce.draw(ctx);
      Object.assign(S.voce, sv);
    }

    // ── CHUVA NA FRENTE (fora, sobre o vidro) ────────────────────────
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.24)';
    ctx.lineWidth = 1.6;
    for (let r = 0; r < 48; r++) {
      const rx = glassX + glassW + ((r * 71 + t * 420) % (W - glassX - glassW));
      const ry = (r * 47 + t * 780) % floorY;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 14, ry + 30);
      ctx.stroke();
    }

    if (alarmActive) {
      const wash = ctx.createRadialGradient(glassX - 200, H * 0.3, 40, glassX - 200, H * 0.3, 700);
      wash.addColorStop(0, `rgba(239, 68, 68, ${0.05 + pulse * 0.09})`);
      wash.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  }

  define('guarita_3q', {
    meta: {
      nome: 'Interior da Guarita · 3/4',
      angulo: '3/4 (canto, duas paredes)',
      profundidade: 'perspectiva de 1 ponto de fuga',
      criadoEm: '2026-11-04',
      pinned: true
    },
    draw: drawGuarita3Q
  });

  define('guarita_perfil_janela', {
    meta: {
      nome: 'Guarita de Perfil · Janela Blindada',
      angulo: 'perfil lateral',
      profundidade: 'interior → vidro → rua',
      criadoEm: '2026-11-04',
      pinned: true
    },
    draw: drawGuaritaPerfilJanela
  });
})(typeof window !== 'undefined' ? window : globalThis);
