/**
 * CENA: grade_cedendo
 * A grade da eclusa entortando sob o impacto da criatura, em primeiro plano.
 *
 * POR QUE EXISTE:
 *   O roteiro diz "a grade de ferro da eclusa entorta com o impacto", mas o
 *   episódio mostrava só a sala da guarita. Esta cena dá a EVIDÊNCIA física
 *   do perigo no auge: metal cedendo, rebites saltando, faíscas.
 *
 * Profundidade:
 *   FUNDO  — neblina e a massa negra empurrando
 *   MEIO   — a criatura pressionando a grade
 *   FRENTE — as barras de ferro deformando (foco máximo)
 */
(function (global) {
  const draw = (ctx, S) => {
    const { W, H, t } = S;
    const bendStart = S.bendStart !== undefined ? S.bendStart : 0;
    const bendDur = S.bendDuration !== undefined ? S.bendDuration : 2.4;
    const p = Math.min(1, Math.max(0, (t - bendStart) / bendDur));
    // Deformação não é linear: o metal resiste, cede de repente, volta um pouco
    const strain = p < 0.55
      ? Math.pow(p / 0.55, 2.2) * 0.42
      : 0.42 + Math.sin((p - 0.55) / 0.45 * Math.PI) * 0.58;

    ctx.save();

    /* ── FUNDO: neblina + massa negra empurrando ──────────────── */
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#010206');
    sky.addColorStop(0.45, '#050b16');
    sky.addColorStop(1, '#02050b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // A criatura atrás da grade — silhueta alta empurrando
    const crX = W * 0.5 + Math.sin(t * 2.2) * 26;
    const crY = H * 0.56;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(crX, crY, 150 + strain * 30, 300, 0, 0, Math.PI * 2);
    ctx.fill();
    // Olhos carmesins
    [-46, 46].forEach((dx) => {
      const g = ctx.createRadialGradient(crX + dx, crY - 190, 3, crX + dx, crY - 190, 54);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      g.addColorStop(0.3, 'rgba(239, 68, 68, 0.75)');
      g.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(crX + dx, crY - 190, 54, 0, Math.PI * 2);
      ctx.fill();
    });

    // Braços empurrando a grade
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(crX + side * 120, crY - 120);
      ctx.rotate(side * (0.7 + strain * 0.22));
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(0, 0, 46, 170, 0, 0, Math.PI * 2);
      ctx.fill();
      // Garras na ponta
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
      ctx.lineWidth = 3;
      for (let c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.moveTo(c * 14, -160);
        ctx.quadraticCurveTo(c * 20, -184, c * 24, -200);
        ctx.stroke();
      }
      ctx.restore();
    });

    /* ── GRADE EM PRIMEIRO PLANO (deformando) ─────────────────── */
    const topY = -40;
    const botY = H + 40;
    const barCount = 6;
    const leftX = W * 0.06;
    const rightX = W * 0.94;

    // Barras verticais: cada uma entorta mais perto do centro (onde a criatura empurra)
    for (let i = 0; i < barCount; i++) {
      const f = i / (barCount - 1);
      const bx = leftX + f * (rightX - leftX);
      const midDist = 1 - Math.abs(f - 0.5) * 2;           // 1 no centro, 0 nas pontas
      const bend = strain * midDist * 150;                  // quanto mais central, mais cede
      const wobble = Math.sin(t * 16 + i * 0.9) * strain * 6;

      const barGrad = ctx.createLinearGradient(bx - 22, 0, bx + 22, 0);
      barGrad.addColorStop(0, '#04070d');
      barGrad.addColorStop(0.30, '#39485c');
      barGrad.addColorStop(0.52, '#8ea3b8');
      barGrad.addColorStop(0.72, '#3f4e62');
      barGrad.addColorStop(1, '#04070d');

      const barW = 44 - Math.abs(f - 0.5) * 10;
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.moveTo(bx - barW / 2, topY);
      // Curva em S: a barra sai reta do topo, entorta no meio, volta no chão
      ctx.bezierCurveTo(
        bx - barW / 2 - bend * 0.4 + wobble, topY + (botY - topY) * 0.33,
        bx - barW / 2 - bend * 0.9 + wobble, topY + (botY - topY) * 0.66,
        bx - barW / 2 - bend * 0.35, botY
      );
      ctx.lineTo(bx + barW / 2 - bend * 0.35, botY);
      ctx.bezierCurveTo(
        bx + barW / 2 - bend * 0.9 + wobble, topY + (botY - topY) * 0.66,
        bx + barW / 2 - bend * 0.4 + wobble, topY + (botY - topY) * 0.33,
        bx + barW / 2, topY
      );
      ctx.closePath();
      ctx.fill();

      // Reflexo especular na quina
      ctx.fillStyle = 'rgba(226, 232, 240, 0.20)';
      ctx.beginPath();
      ctx.moveTo(bx - barW * 0.18, topY);
      ctx.lineTo(bx - barW * 0.06, topY);
      ctx.lineTo(bx - barW * 0.06 - bend * 0.35, botY);
      ctx.lineTo(bx - barW * 0.18 - bend * 0.35, botY);
      ctx.closePath();
      ctx.fill();
    }

    // Travessas horizontais (também deformam)
    [H * 0.30, H * 0.72].forEach((ry, idx) => {
      const sag = strain * 46 + Math.sin(t * 12 + idx) * strain * 5;
      ctx.strokeStyle = '#4a5b70';
      ctx.lineWidth = 30;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-40, ry);
      ctx.quadraticCurveTo(W * 0.5, ry + sag, W + 40, ry);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.22)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-40, ry - 9);
      ctx.quadraticCurveTo(W * 0.5, ry + sag - 9, W + 40, ry - 9);
      ctx.stroke();
    });

    /* ── REBITES SALTANDO + FAÍSCAS com o esforço ─────────────── */
    if (strain > 0.35) {
      const k = (strain - 0.35) / 0.65;
      // Rebites que se soltam das juntas
      for (let r = 0; r < 7; r++) {
        const seed = r * 137.5;
        const launch = (t * 1.6 + r * 0.31) % 1;
        const rx = W * (0.15 + (r % 5) * 0.17) + Math.sin(seed) * 30;
        const ry = (r % 2 ? H * 0.30 : H * 0.72) + launch * 260;
        const fade = 1 - launch;
        ctx.fillStyle = `rgba(148, 163, 184, ${fade * k})`;
        ctx.beginPath();
        ctx.arc(rx + Math.sin(launch * 6 + r) * 24, ry, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faíscas nos pontos de solda rompendo
      for (let s = 0; s < 10; s++) {
        if (Math.sin(t * 24 + s * 2.7) < 0.25) continue;
        const sx = W * (0.10 + s * 0.085);
        const sy = (s % 2 ? H * 0.30 : H * 0.72) + Math.sin(s * 1.7) * 20;
        const glow = ctx.createRadialGradient(sx, sy, 1, sx, sy, 30);
        glow.addColorStop(0, `rgba(255, 255, 255, ${k})`);
        glow.addColorStop(0.35, `rgba(253, 224, 71, ${k * 0.75})`);
        glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, 30, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ── FLASH de impacto nos picos de strain ─────────────────── */
    const flash = Math.max(0, (strain - 0.55) / 0.45) * (Math.sin(t * 26) > 0.3 ? 0.22 : 0);
    if (flash > 0.01) {
      ctx.fillStyle = `rgba(224, 242, 254, ${flash.toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Vinheta
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.80);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(2, 6, 23, 0.82)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('grade_cedendo', {
    meta: {
      nome: 'Grade da Eclusa Cedendo',
      angulo: 'frontal, primeiro plano',
      profundidade: 'massa → criatura → grade',
      criadoEm: '2026-11-04',
      pinned: true
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
