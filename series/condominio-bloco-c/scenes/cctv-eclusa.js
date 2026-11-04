/**
 * CENA: cctv_eclusa_3planos
 * CCTV CAM 02 em tela cheia — a eclusa vista por uma câmera atrás da grade.
 *
 * Profundidade em três planos focais (é isso que tira o "desenho chapado"):
 *   PLANO 3 (fundo) — rua em perspectiva, postes apagando, massa negra
 *   PLANO 2 (foco)  — criatura de 2,20 m com sombra projetada e luz de recorte
 *   PLANO 1 (frente)— grade da eclusa dominando o quadro, grossa e fora de foco
 *
 * Aprovada no Ep.03. PINADA: não sobrescrever. Para evoluir, criar _v2.
 */
(function (global) {
  const draw = (ctx, S) => {
    const { W, H, t, massAdvance = 0 } = S;

    ctx.save();

    // ── PLANO 3: fundo ────────────────────────────────────────────────
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    skyGrad.addColorStop(0, '#010307');
    skyGrad.addColorStop(0.45, '#040814');
    skyGrad.addColorStop(1, '#070f1e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Prédios distantes: menores e mais azulados = perspectiva atmosférica
    const farBuildings = [
      [30, H * 0.30, 150, H * 0.34], [205, H * 0.24, 190, H * 0.40],
      [430, H * 0.27, 165, H * 0.37], [625, H * 0.22, 200, H * 0.42],
      [860, H * 0.29, 165, H * 0.35]
    ];
    farBuildings.forEach(([bx, by, bw, bh], i) => {
      ctx.fillStyle = i % 2 === 0 ? '#04070f' : '#050912';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 1;
      for (let wy = by + 30; wy < by + bh - 40; wy += 44) {
        for (let wx = bx + 18; wx < bx + bw - 24; wx += 38) ctx.strokeRect(wx, wy, 16, 20);
      }
    });

    // Postes com halo morrendo conforme a massa avança
    const poleFade = Math.max(0, 1 - massAdvance * 1.3);
    [[120, 0.62], [960, 0.58]].forEach(([px, py]) => {
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(px, H * py - 260, 7, 300);
      ctx.strokeStyle = '#0d1526';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(px, H * py - 260);
      ctx.lineTo(px + 54, H * py - 272);
      ctx.stroke();
      if (poleFade > 0.05) {
        const lampGlow = ctx.createRadialGradient(px + 54, H * py - 268, 4, px + 54, H * py - 268, 120);
        lampGlow.addColorStop(0, `rgba(253, 224, 71, ${(0.24 * poleFade).toFixed(3)})`);
        lampGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(px + 54, H * py - 268, 120, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Rua em perspectiva (converge para o ponto de fuga)
    const horizon = H * 0.50;
    const roadGrad = ctx.createLinearGradient(0, horizon, 0, H);
    roadGrad.addColorStop(0, '#050a14');
    roadGrad.addColorStop(0.45, '#080e1b');
    roadGrad.addColorStop(1, '#03060d');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, horizon, W, H - horizon);

    ctx.fillStyle = '#0d1424';
    ctx.fillRect(0, horizon + 30, W, 28);

    ctx.strokeStyle = 'rgba(234, 179, 8, 0.14)';
    ctx.lineWidth = 5;
    ctx.setLineDash([34, 26]);
    ctx.beginPath();
    ctx.moveTo(W * 0.5, horizon + 40);
    ctx.lineTo(W * 0.5, H);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let r = 0; r < 3; r++) {
      const ry = horizon + 140 + r * 240;
      const rw = 100 + r * 130;
      const reflGrad = ctx.createRadialGradient(W * 0.5, ry, 6, W * 0.5, ry, rw);
      reflGrad.addColorStop(0, `rgba(56, 189, 248, ${(0.10 - r * 0.02).toFixed(3)})`);
      reflGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = reflGrad;
      ctx.beginPath();
      ctx.ellipse(W * 0.5, ry, rw, 26 + r * 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // A massa negra
    const wallTop = H * 0.30 + massAdvance * H * 0.13;
    const massGrad = ctx.createLinearGradient(0, wallTop - 260, 0, wallTop + 300);
    massGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    massGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.80)');
    massGrad.addColorStop(0.72, 'rgba(1, 2, 8, 0.99)');
    massGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = massGrad;
    ctx.fillRect(0, wallTop - 260, W, H - wallTop + 260);

    for (let i = 0; i < 12; i++) {
      const depth = 0.45 + (i % 4) * 0.18;
      const bx = -60 + i * 105 + Math.sin(t * 1.1 + i * 0.7) * 34;
      const by = wallTop + Math.cos(t * 1.5 + i * 1.2) * 30 * depth;
      ctx.fillStyle = `rgba(0, 0, 0, ${(0.5 + depth * 0.45).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(bx, by, 74 * depth + 26, 58 * depth + 20, Math.sin(t * 0.9 + i) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.lineCap = 'round';
    for (let tn = 0; tn < 8; tn++) {
      const reach = 90 + Math.abs(Math.sin(t * 0.8 + tn * 1.4)) * 200;
      const baseX = 40 + tn * 140;
      ctx.lineWidth = 20 - tn * 1.6;
      ctx.beginPath();
      ctx.moveTo(baseX, wallTop + 40);
      ctx.quadraticCurveTo(
        baseX + Math.sin(t * 1.3 + tn) * 70,
        wallTop + 100 + reach * 0.45,
        baseX + Math.cos(t * 0.9 + tn) * 110,
        wallTop + 90 + reach
      );
      ctx.stroke();
    }

    for (let e = 0; e < 6; e++) {
      const depth = 0.6 + (e % 3) * 0.22;
      const ex = 90 + e * 170 + Math.sin(t * 1.4 + e) * 26;
      const ey = wallTop + 20 + (e % 2) * 52 * depth;
      const blink = Math.max(0, Math.sin(t * 3.1 + e * 1.9));
      if (blink <= 0.3) continue;
      ctx.fillStyle = `rgba(239, 68, 68, ${(blink * 0.85).toFixed(3)})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20 * depth;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 13 * depth, 5 * depth * blink, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ── HAZE do feixe (luz volumétrica entre fundo e criatura) ────────
    ctx.globalCompositeOperation = 'screen';
    const hazeGrad = ctx.createRadialGradient(W * 0.52, H * 0.36, 40, W * 0.5, H * 0.56, 780);
    hazeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    hazeGrad.addColorStop(0.22, 'rgba(254, 249, 195, 0.34)');
    hazeGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.14)');
    hazeGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 0, W, H);

    const coneGrad = ctx.createLinearGradient(W * 0.9, -80, W * 0.42, H * 0.9);
    coneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    coneGrad.addColorStop(0.45, 'rgba(254, 249, 195, 0.20)');
    coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(W * 0.86, -20);
    ctx.lineTo(W * 0.96, -20);
    ctx.lineTo(W * 0.72, H);
    ctx.lineTo(W * 0.10, H);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // ── PLANO 2: criatura ─────────────────────────────────────────────
    const cx = W * 0.5 + Math.sin(t * 13) * 3;
    const cy = H * 0.575;
    const breath = Math.sin(t * 5.5) * 7;
    ctx.save();
    ctx.translate(cx, cy);

    const groundShadow = ctx.createRadialGradient(0, 372, 10, 0, 372, 210);
    groundShadow.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    groundShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = groundShadow;
    ctx.beginPath();
    ctx.ellipse(0, 372, 210, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyPath = new Path2D();
    bodyPath.ellipse(0, 40, 128 + breath, 268, 0, 0, Math.PI * 2);
    const bodyFill = ctx.createLinearGradient(-140, -140, 140, 260);
    bodyFill.addColorStop(0, '#01030a');
    bodyFill.addColorStop(0.45, '#0a1524');
    bodyFill.addColorStop(0.75, '#122238');
    bodyFill.addColorStop(1, '#1e3550');
    ctx.fillStyle = bodyFill;
    ctx.fill(bodyPath);

    ctx.save();
    ctx.clip(bodyPath);
    const rim = ctx.createLinearGradient(40, 0, 175, 0);
    rim.addColorStop(0, 'rgba(226, 232, 240, 0)');
    rim.addColorStop(0.65, 'rgba(186, 230, 253, 0.30)');
    rim.addColorStop(1, 'rgba(240, 249, 255, 0.75)');
    ctx.fillStyle = rim;
    ctx.fillRect(-160, -260, 340, 560);

    ctx.strokeStyle = 'rgba(148, 197, 253, 0.16)';
    ctx.lineWidth = 2.5;
    for (let r = -3; r <= 3; r++) {
      ctx.beginPath();
      ctx.ellipse(0, -10 + Math.abs(r) * 24, 92 + Math.abs(r) * 11, 46, 0, Math.PI * 0.12, Math.PI * 0.88);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.10)';
    ctx.lineWidth = 6;
    for (let rib = 0; rib < 4; rib++) {
      ctx.beginPath();
      ctx.moveTo(-58 + rib * 4, 10 + rib * 54);
      ctx.quadraticCurveTo(0, 42 + rib * 54, 58 - rib * 4, 10 + rib * 54);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
    ctx.lineWidth = 2.2;
    ctx.stroke(bodyPath);

    // Cabeça
    ctx.save();
    ctx.translate(0, -196 + breath * 0.4);
    ctx.rotate(Math.sin(t * 8.5) * 0.06 - 0.05);
    const headPath = new Path2D();
    headPath.ellipse(0, 0, 62, 80, 0, 0, Math.PI * 2);
    const headFill = ctx.createLinearGradient(-62, -60, 62, 70);
    headFill.addColorStop(0, '#02050d');
    headFill.addColorStop(0.55, '#0b1826');
    headFill.addColorStop(1, '#1b3048');
    ctx.fillStyle = headFill;
    ctx.fill(headPath);
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke(headPath);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 3;
    [-1, 1].forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s * 18, -66);
      ctx.quadraticCurveTo(s * 40, -84, s * 52, -58);
      ctx.stroke();
    });

    const squint = 0.42 + Math.sin(t * 6.5) * 0.16;
    [-25, 25].forEach((ex2, i) => {
      const eyeGlow = ctx.createRadialGradient(ex2, -12, 2, ex2, -12, 34);
      eyeGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      eyeGlow.addColorStop(0.25, 'rgba(248, 113, 113, 0.9)');
      eyeGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.ellipse(ex2, -12, 26, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.ellipse(ex2, -12, 13, 9.5 * squint, i ? 0.14 : -0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1a0505';
      ctx.beginPath();
      ctx.ellipse(ex2, -12, 3.2, 7.5 * squint, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const snarl = Math.sin(t * 16) * 5;
    const mouthPath = new Path2D();
    mouthPath.ellipse(0, 34, 28, 16 + snarl, 0, 0, Math.PI * 2);
    const mouthFill = ctx.createRadialGradient(0, 34, 2, 0, 34, 30);
    mouthFill.addColorStop(0, '#000000');
    mouthFill.addColorStop(0.7, '#2a0505');
    mouthFill.addColorStop(1, '#4a0a0a');
    ctx.fillStyle = mouthFill;
    ctx.fill(mouthPath);

    ctx.fillStyle = '#e8eef5';
    for (let f = -4; f <= 4; f++) {
      const fx = f * 6.2;
      const len = 10 - Math.abs(f) * 1.1;
      ctx.beginPath();
      ctx.moveTo(fx - 2.6, 20 - snarl * 0.4);
      ctx.lineTo(fx, 20 + len);
      ctx.lineTo(fx + 2.6, 20 - snarl * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Braços protegendo os olhos
    const guard = Math.sin(t * 6.2) * 8;
    [-1, 1].forEach((side, i) => {
      ctx.save();
      ctx.translate(side * 92, -138 + (i ? -guard : guard));
      ctx.rotate(side * 0.52);
      const armPath = new Path2D();
      armPath.ellipse(0, 0, 34, 124, 0, 0, Math.PI * 2);
      const armFill = ctx.createLinearGradient(-34, -80, 34, 90);
      armFill.addColorStop(0, '#02050c');
      armFill.addColorStop(0.6, '#0d1a2a');
      armFill.addColorStop(1, '#20374f');
      ctx.fillStyle = armFill;
      ctx.fill(armPath);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.42)';
      ctx.lineWidth = 2;
      ctx.stroke(armPath);
      ctx.restore();
    });
    ctx.restore();

    // ── PLANO 1: grade na frente ──────────────────────────────────────
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 26;
    [{ x: 178, w: 46 }, { x: 402, w: 26 }, { x: 700, w: 26 }, { x: 930, w: 46 }].forEach((bar) => {
      const barGrad = ctx.createLinearGradient(bar.x - bar.w / 2, 0, bar.x + bar.w / 2, 0);
      barGrad.addColorStop(0, '#04070e');
      barGrad.addColorStop(0.28, '#1e2a3c');
      barGrad.addColorStop(0.62, '#4a5b70');
      barGrad.addColorStop(1, '#070c15');
      ctx.fillStyle = barGrad;
      // Barras rigorosamente verticais
      ctx.fillRect(bar.x - bar.w / 2, -40, bar.w, H + 80);
      ctx.fillStyle = 'rgba(203, 213, 225, 0.14)';
      ctx.fillRect(bar.x - bar.w * 0.16, -40, bar.w * 0.12, H + 80);
    });
    ctx.shadowBlur = 0;

    [{ y: H * 0.285, h: 26 }, { y: H * 0.735, h: 40 }].forEach(({ y, h }) => {
      const railGrad = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
      railGrad.addColorStop(0, '#050912');
      railGrad.addColorStop(0.35, '#334155');
      railGrad.addColorStop(0.55, '#64748b');
      railGrad.addColorStop(1, '#050912');
      ctx.fillStyle = railGrad;
      ctx.fillRect(-40, y - h / 2, W + 80, h);
    });

    // Gotas na lente
    ctx.fillStyle = 'rgba(186, 230, 253, 0.10)';
    for (let d = 0; d < 14; d++) {
      ctx.beginPath();
      ctx.ellipse((d * 97 + t * 22) % W, (d * 173 + t * 55) % H, 2.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Vinheta + scanlines
    const vigGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.34, W * 0.5, H * 0.5, H * 0.74);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(2, 6, 23, 0.78)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

    ctx.restore();
  };

  global.StudioScenes = global.StudioScenes || { define() {} };
  global.StudioScenes.define('cctv_eclusa_3planos', {
    meta: {
      nome: 'CCTV CAM 02 · Eclusa',
      angulo: 'frontal CCTV (atrás da grade)',
      profundidade: '3 planos focais',
      criadoEm: '2026-11-04',
      pinned: true
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
