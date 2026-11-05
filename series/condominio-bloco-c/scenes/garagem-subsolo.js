/**
 * CENA: garagem_subsolo_2.5d
 * Subsolo G1 com profundidade em cinco planos e o quadro geral de força.
 *
 * POR QUE EXISTE
 * --------------
 * A garagem é o lugar mais escuro da série e o único com energia própria. Ela
 * aparece sempre que o roteiro precisa de "uma luz que ainda funciona". Para
 * isso funcionar visualmente, o quadro elétrico tem de ser o ponto mais claro
 * do quadro enquanto todo o resto afunda — e isso só se resolve com planos.
 *
 *   P5  rampa do portão e neblina        — desfoque 5,5px, mais frio
 *   P4  pilares e carros na penumbra     — desfoque 2,8px
 *   P3  quadro geral / gerador (foco)    — nítido, calor âmbar
 *   P2  piso de epóxi e faixas           — nítido, reflexo
 *   P1  viga do teto em contraluz        — desfoque 7,5px
 *
 * API
 * ---
 *   StudioScenes.play('garagem_subsolo_2.5d', ctx, {
 *     W, H, t,
 *     actor, actorX, actorScale, actorPose,
 *     breakerOn,      // true acende o quadro e o corredor de lâmpadas
 *     flicker,        // true pisca como fluorescente velho
 *     mood
 *   })
 */
(function (global) {
  const D = global.StudioEngine && global.StudioEngine.DepthScene2D;

  const draw = (ctx, S) => {
    const { W, H, t } = S;
    if (!D) {
      ctx.fillStyle = '#02050b';
      ctx.fillRect(0, 0, W, H);
      return;
    }

    const actor = S.actor || S.voce || null;
    const breakerOn = S.breakerOn === true;
    const mood = S.mood || 'tense';
    const fear = mood === 'panic' ? 1 : mood === 'tense' ? 0.5 : 0.15;
    const floorY = H * 0.770;
    const vpX = W * 0.50;
    const vpY = H * 0.470;

    // Fluorescente velho: liga, hesita, quase morre, volta.
    const flicker = S.flicker === false
      ? 1
      : (Math.sin(t * 19) > -0.72 ? 1 : 0.18) * (0.90 + Math.sin(t * 47) * 0.05);
    const energy = breakerOn ? flicker : 0.06;

    /* ── P5: rampa e neblina ──────────────────────────────────────── */
    const far = D.layer({
      name: 'rampa',
      depth: 0.12, blur: 5.6, haze: 0.36, hazeColor: '#070d18',
      draw(c) {
        c.fillStyle = '#010306';
        c.fillRect(-100, -60, W + 200, H + 120);

        // Portão basculante ao fundo
        const gateW = W * 0.42;
        const gateX = vpX - gateW / 2;
        const gateY = vpY - H * 0.085;
        const gateH = H * 0.30;
        c.fillStyle = '#0d1420';
        c.fillRect(gateX, gateY, gateW, gateH);
        c.strokeStyle = '#243044';
        c.lineWidth = 2.5;
        for (let gy = gateY + 12; gy < gateY + gateH; gy += 20) {
          c.beginPath();
          c.moveTo(gateX, gy);
          c.lineTo(gateX + gateW, gy);
          c.stroke();
        }

        // Neblina vazando por baixo do portão
        const leak = c.createLinearGradient(0, gateY + gateH - 10, 0, gateY + gateH + 120);
        leak.addColorStop(0, 'rgba(226, 232, 240, 0.30)');
        leak.addColorStop(1, 'rgba(226, 232, 240, 0)');
        c.fillStyle = leak;
        c.fillRect(gateX - 40, gateY + gateH - 10, gateW + 80, 130);

        // Rampa subindo em direção ao portão
        c.fillStyle = '#060a12';
        c.beginPath();
        c.moveTo(-100, H);
        c.lineTo(vpX - gateW * 0.42, gateY + gateH);
        c.lineTo(vpX + gateW * 0.42, gateY + gateH);
        c.lineTo(W + 100, H);
        c.closePath();
        c.fill();
      }
    });

    /* ── P4: pilares e carros ─────────────────────────────────────── */
    const pillars = D.layer({
      name: 'pilares',
      depth: 0.30, blur: 2.8, haze: 0.16, hazeColor: '#070c16',
      draw(c) {
        const spots = [-0.16, 0.20, 0.62, 0.92];
        spots.forEach((f, i) => {
          const px = W * f;
          const top = H * 0.235 + Math.abs(f - 0.5) * H * 0.10;
          const bottom = floorY + Math.abs(f - 0.5) * H * 0.045;
          const w = 78 + Math.abs(f - 0.5) * 40;

          const g = c.createLinearGradient(px - w, 0, px + w, 0);
          g.addColorStop(0, '#0a1019');
          g.addColorStop(0.42, '#1c2735');
          g.addColorStop(0.62, '#26333f');
          g.addColorStop(1, '#0a1019');
          c.fillStyle = g;
          c.fillRect(px - w / 2, top, w, bottom - top);

          // Faixa de sinalização
          c.fillStyle = '#a16207';
          c.fillRect(px - w / 2, bottom - 200, w, 104);
          c.fillStyle = '#05070b';
          for (let sy = bottom - 196; sy < bottom - 100; sy += 26) {
            c.beginPath();
            c.moveTo(px - w / 2, sy);
            c.lineTo(px + w / 2, sy - 16);
            c.lineTo(px + w / 2, sy - 4);
            c.lineTo(px - w / 2, sy + 12);
            c.closePath();
            c.fill();
          }

          // Placa da vaga
          c.fillStyle = '#0b1220';
          c.fillRect(px - 34, top + 70, 68, 30);
          c.fillStyle = '#38bdf8';
          c.font = '700 12px monospace';
          c.textAlign = 'center';
          c.fillText('G1 • 30' + (i + 1), px, top + 90);
        });

        // SUV na penumbra
        c.fillStyle = '#070b12';
        c.strokeStyle = '#1e293b';
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(W * 0.24, floorY - 190, W * 0.26, 180, 26);
        c.fill();
        c.stroke();
        c.fillStyle = 'rgba(148, 197, 253, 0.06)';
        c.beginPath();
        c.roundRect(W * 0.27, floorY - 172, W * 0.20, 76, 16);
        c.fill();
      }
    });

    /* ── P3: quadro de força ──────────────────────────────────────── */
    const panel = D.layer({
      name: 'quadro_forca',
      depth: 0.52,
      draw(c) {
        const bx = W * 0.715;
        const by = H * 0.315;
        const bw = W * 0.175;
        const bh = H * 0.255;

        // Sombra projetada na parede
        c.fillStyle = 'rgba(0, 0, 0, 0.7)';
        c.beginPath();
        c.roundRect(bx + 14, by + 16, bw, bh, 8);
        c.fill();

        // Corpo metálico
        const body = c.createLinearGradient(bx, by, bx + bw, by + bh);
        body.addColorStop(0, '#2a3646');
        body.addColorStop(0.5, '#19222e');
        body.addColorStop(1, '#0d141d');
        c.fillStyle = body;
        c.strokeStyle = breakerOn ? '#f59e0b' : '#334155';
        c.lineWidth = 2.4;
        c.beginPath();
        c.roundRect(bx, by, bw, bh, 8);
        c.fill();
        c.stroke();

        // Placa de perigo
        c.fillStyle = '#eab308';
        c.beginPath();
        c.moveTo(bx + bw / 2, by + 16);
        c.lineTo(bx + bw / 2 + 18, by + 48);
        c.lineTo(bx + bw / 2 - 18, by + 48);
        c.closePath();
        c.fill();
        c.fillStyle = '#0b1220';
        c.font = '800 16px monospace';
        c.textAlign = 'center';
        c.fillText('⚡', bx + bw / 2, by + 42);

        c.fillStyle = '#94a3b8';
        c.font = '700 10px monospace';
        c.fillText('ALTA TENSÃO', bx + bw / 2, by + 66);
        c.fillText('380V • G1', bx + bw / 2, by + 78);

        // Disjuntores em duas fileiras
        const rows = 4;
        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < 3; col++) {
            const sx = bx + 18 + col * (bw / 3 - 4);
            const sy = by + bh * 0.36 + r * ((bh * 0.56) / rows);
            c.fillStyle = '#0a0f18';
            c.fillRect(sx, sy, bw / 3 - 22, 26);
            const on = breakerOn && D.hash2(r, col) > 0.18;
            c.fillStyle = on ? '#22c55e' : '#7f1d1d';
            c.fillRect(sx + (bw / 3 - 22) / 2 - 4, sy + 6, 8, 14);
            if (on) D.glow(c, sx + (bw / 3 - 22) / 2, sy + 13, 26, '#22c55e', 0.20 * energy);
          }
        }

        // Alavanca principal
        const leverX = bx + bw / 2;
        const leverY = by + bh - 24;
        c.fillStyle = '#0a0f18';
        c.fillRect(leverX - 13, leverY - 18, 26, 34);
        c.fillStyle = breakerOn ? '#ef4444' : '#475569';
        c.beginPath();
        c.roundRect(leverX - 5, leverY - (breakerOn ? 26 : 4), 10, 26, 4);
        c.fill();

        // Halo amarelo quando energizado
        if (breakerOn) {
          D.glow(c, leverX, leverY, 130, '#f59e0b', 0.16 * energy);
          D.glow(c, bx + bw / 2, by + bh * 0.5, W * 0.22, '#fbbf24', 0.05 * energy);
        }
      }
    });

    /* ── P2: piso ─────────────────────────────────────────────────── */
    const floor = D.layer({
      name: 'piso',
      depth: 0.85,
      draw(c) {
        const g = c.createLinearGradient(0, floorY, 0, H);
        g.addColorStop(0, '#0b1118');
        g.addColorStop(0.55, '#06090f');
        g.addColorStop(1, '#020306');
        c.fillStyle = g;
        c.fillRect(-100, floorY, W + 200, H - floorY + 60);

        // Faixas amarelas de vaga em fuga
        c.strokeStyle = 'rgba(234, 179, 8, 0.30)';
        c.lineWidth = 5;
        [-0.18, 0.16, 0.50, 0.84, 1.10].forEach((f) => {
          c.beginPath();
          c.moveTo(vpX + (W * f - vpX) * 0.30, floorY);
          c.lineTo(W * f - W * 0.05, H);
          c.stroke();
        });

        // Reflexo do quadro no piso de epóxi
        D.glow(c, W * 0.80, floorY + 80, W * 0.24, breakerOn ? '#fbbf24' : '#38bdf8', (breakerOn ? 0.11 : 0.035) * (breakerOn ? energy : 1));

        if (!actor) return;
        const ax = S.actorX !== undefined ? S.actorX : W * 0.40;
        D.contactShadow(c, ax, floorY + 10, 92, 0.55);
        c.save();
        c.globalAlpha = 0.12;
        c.translate(0, floorY * 2);
        c.scale(1, -1);
        D.poseActor(actor, c, {
          x: ax, y: floorY, scale: S.actorScale !== undefined ? S.actorScale : 1.6,
          viewMode: 'front', pose: S.actorPose || 'idle'
        });
        c.restore();
        D.poseActor(actor, c, {
          x: ax, y: floorY, scale: S.actorScale !== undefined ? S.actorScale : 1.6,
          viewMode: 'front', pose: S.actorPose || 'idle',
          emotion: S.actorEmotion || 'tense',
          reactSide: S.reactSide, reactAmount: S.reactAmount
        });
      }
    });

    /* ── P1: viga e tubulação em contraluz ────────────────────────── */
    const near = D.layer({
      name: 'viga_teto',
      depth: 1.12, blur: 7.4, alpha: 0.96,
      draw(c) {
        // Viga de concreto cruzando o topo
        const beam = c.createLinearGradient(0, 0, 0, H * 0.135);
        beam.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
        beam.addColorStop(0.62, 'rgba(2, 4, 9, 0.82)');
        beam.addColorStop(1, 'rgba(2, 4, 9, 0)');
        c.fillStyle = beam;
        c.fillRect(0, 0, W, H * 0.135);

        // Tubo vermelho de incêndio
        c.fillStyle = 'rgba(127, 29, 29, 0.75)';
        c.fillRect(0, H * 0.090, W, 26);
        c.fillStyle = 'rgba(185, 28, 28, 0.5)';
        c.fillRect(0, H * 0.090, W, 8);

        // Luminária tubular do teto
        const lampOn = breakerOn ? energy : 0.12;
        c.fillStyle = `rgba(186, 230, 253, ${0.22 + lampOn * 0.6})`;
        c.fillRect(W * 0.36, H * 0.128, W * 0.28, 9);
        D.glow(c, W * 0.50, H * 0.133, 230, '#bae6fd', (0.05 + lampOn * 0.11));
      }
    });

    ctx.save();
    D.compose(ctx, { W, H, t }, [far]);
    D.fogBank(ctx, W, H, t, { y0: H * 0.50, density: 0.12 + fear * 0.08, color: '#94a3b8', drift: 14 });
    D.compose(ctx, { W, H, t }, [pillars, panel, floor]);
    // Feixe do fluorescente só acende de verdade com o quadro ligado
    D.lightShaft(ctx, W * 0.50, H * 0.13, Math.PI / 2 - 0.02, H * 0.72, W * 0.30, '#bae6fd', 0.035 + (breakerOn ? energy * 0.05 : 0));
    D.compose(ctx, { W, H, t }, [near]);
    D.grain(ctx, W, H, 31, 0.035);
    D.vignette(ctx, W, H, 0.74, 0.5, 0.52);
    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('garagem_subsolo_2.5d', {
    meta: {
      nome: 'Subsolo G1 · Quadro de Força · 5 planos',
      angulo: 'frontal em perspectiva',
      profundidade: 'rampa → pilares → quadro → piso → viga',
      criadoEm: '2026-11-04',
      pinned: false
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
