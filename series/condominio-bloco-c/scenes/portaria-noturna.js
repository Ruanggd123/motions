/**
 * CENA: portaria_noturna_2.5d
 * A portaria do Bloco C vista da entrada, com profundidade em seis planos.
 *
 * POR QUE EXISTE
 * --------------
 * A portaria é o cenário recorrente da série. A versão antiga desenhava tudo
 * com a mesma nitidez e o mesmo tom, então a neblina lá fora não lia como
 * "longe" nem a guarita como "refúgio". Aqui o espaço é dividido em planos
 * com atmosfera, foco e paralaxe, e a luz de emergência tem onde bater:
 *
 *   P6  rua, prédios vizinhos e massa negra   — desfoque 6px, azul frio
 *   P5  eclusa de vidro e grades              — desfoque 3px
 *   P4  guarita blindada (o refúgio)          — nítida, luz quente
 *   P3  personagens dentro da guarita          — nítidos
 *   P2  bancada de granito e interfone         — nítido, primeiro plano de ação
 *   P1  pilar da entrada em contraluz          — desfoque 8px, quase preto
 *
 * API
 * ---
 *   StudioScenes.play('portaria_noturna_2.5d', ctx, {
 *     W, H, t,
 *     elenco: { voce, valdir, lucas },   // opcional
 *     alarm, spotlight, fogDensity, mood
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

    const crew = D.elenco(S);
    const alarm = S.alarm === true;
    const spotlight = S.spotlight === true;
    const mood = S.mood || 'tense';
    const fear = mood === 'panic' ? 1 : mood === 'tense' ? 0.5 : 0.2;
    const fog = S.fogDensity !== undefined ? S.fogDensity : 0.72;
    const pulse = alarm ? 0.5 + Math.sin(t * 7.5) * 0.5 : 0;

    const floorY = H * 0.735;
    const vpX = W * 0.50;
    const vpY = H * 0.415;

    /* ── P6: rua e prédios ────────────────────────────────────────── */
    const street = D.layer({
      name: 'rua',
      depth: 0.10, blur: 6.0, haze: 0.34, hazeColor: '#0a1424',
      draw(c) {
        const sky = c.createLinearGradient(0, 0, 0, vpY);
        sky.addColorStop(0, '#010205');
        sky.addColorStop(0.62, '#050a14');
        sky.addColorStop(1, '#08101d');
        c.fillStyle = sky;
        c.fillRect(-80, -40, W + 160, vpY + 40);

        // Prédios vizinhos apagados
        for (let i = 0; i < 6; i++) {
          const bw = W * (0.10 + D.hash(i) * 0.08);
          const bh = H * (0.17 + D.hash(i + 4) * 0.16);
          const bx = -W * 0.06 + i * W * 0.185;
          c.fillStyle = i % 2 ? '#03060d' : '#040812';
          c.fillRect(bx, vpY - bh, bw, bh);
          for (let wy = vpY - bh + 24; wy < vpY - 30; wy += 40) {
            for (let wx = bx + 14; wx < bx + bw - 20; wx += 32) {
              if (D.hash2(wx, wy) > 0.86 - fear * 0.18) {
                c.fillStyle = `rgba(251, 191, 36, ${0.08 + D.hash2(wy, wx) * 0.10})`;
                c.fillRect(wx, wy, 11, 15);
              }
            }
          }
        }

        // Rua em perspectiva
        const road = c.createLinearGradient(0, vpY, 0, H);
        road.addColorStop(0, '#060b14');
        road.addColorStop(1, '#02050a');
        c.fillStyle = road;
        c.fillRect(-80, vpY, W + 160, H - vpY + 40);

        // Calçada e meio-fio
        c.fillStyle = '#1b2532';
        c.fillRect(-80, floorY - 46, W + 160, 16);

        // Postes apagados
        [0.12, 0.88].forEach((f, i) => {
          c.fillStyle = '#080d16';
          c.fillRect(W * f, vpY - H * 0.20, 7, H * 0.20 + 60);
          D.glow(c, W * f + 3, vpY - H * 0.20, 90, '#fde68a', 0.02 * (1 - fear * 0.5));
        });

        // Massa negra engolindo a rua
        const wallBase = vpY + 40 - fear * 50;
        const massGrad = c.createLinearGradient(0, wallBase - 260, 0, wallBase + 80);
        massGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        massGrad.addColorStop(0.45, `rgba(0, 0, 0, ${0.55 + fear * 0.35})`);
        massGrad.addColorStop(1, `rgba(0, 0, 0, ${0.9 + fear * 0.1})`);
        c.fillStyle = massGrad;
        c.fillRect(-80, wallBase - 260, W + 160, 360);

        for (let e = 0; e < 5; e++) {
          const blink = Math.max(0, Math.sin(t * 2.9 + e * 2.1));
          if (blink < 0.32) continue;
          c.fillStyle = `rgba(239, 68, 68, ${(blink * (0.30 + fear * 0.55)).toFixed(3)})`;
          c.beginPath();
          c.ellipse(W * (0.10 + e * 0.20), wallBase - 44 + (e % 2) * 22, 10, 3.6 * blink, 0.1, 0, Math.PI * 2);
          c.fill();
        }
      }
    });

    /* ── P5: eclusa de vidro ─────────────────────────────────────── */
    const eclusa = D.layer({
      name: 'eclusa',
      depth: 0.28, blur: 3.0, haze: 0.20, hazeColor: '#0a1220',
      draw(c) {
        const x = W * 0.375;
        const y = H * 0.245;
        const w = W * 0.455;
        const h = H * 0.465;

        // Moldura metálica
        c.strokeStyle = '#111c2b';
        c.lineWidth = 16;
        c.strokeRect(x, y, w, h);

        // Vidro temperado com a rua lá atrás
        const glass = c.createLinearGradient(x, y, x + w, y + h);
        glass.addColorStop(0, 'rgba(12, 30, 50, 0.92)');
        glass.addColorStop(0.55, 'rgba(6, 16, 30, 0.94)');
        glass.addColorStop(1, 'rgba(3, 8, 16, 0.96)');
        c.fillStyle = glass;
        c.fillRect(x + 8, y + 8, w - 16, h - 16);

        // Grades verticais, com a do meio travada
        const bars = 16;
        for (let i = 1; i < bars; i++) {
          const bx = x + 8 + (i / bars) * (w - 16);
          const g = c.createLinearGradient(bx - 5, 0, bx + 5, 0);
          g.addColorStop(0, '#040710');
          g.addColorStop(0.5, '#3d4d61');
          g.addColorStop(1, '#040710');
          c.fillStyle = g;
          c.fillRect(bx - 4, y + 8, 8, h - 16);
        }

        // Coluna central e trava
        c.fillStyle = '#0d1520';
        c.fillRect(x + w * 0.5 - 7, y + 8, 14, h - 16);

        // Etiqueta de TRAVADO
        c.fillStyle = '#090d16';
        c.beginPath();
        c.roundRect(x + w * 0.5 - 52, y + 22, 104, 30, 5);
        c.fill();
        c.fillStyle = `rgba(239, 68, 68, ${0.55 + Math.sin(t * 5.4) * 0.35})`;
        c.beginPath();
        c.arc(x + w * 0.5 - 32, y + 37, 5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fca5a5';
        c.font = '700 12px monospace';
        c.textAlign = 'left';
        c.fillText('TRAVADO', x + w * 0.5 - 20, y + 42);
      }
    });

    /* ── P4: guarita blindada ───────────────────────────────────── */
    const guardhouse = D.layer({
      name: 'guarita',
      depth: 0.46,
      draw(c) {
        const gx = -W * 0.03;
        const gy = H * 0.225;
        const gw = W * 0.38;
        const gh = H * 0.405;

        // Estrutura
        c.fillStyle = '#161f2b';
        c.strokeStyle = '#3b4a5c';
        c.lineWidth = 4;
        c.beginPath();
        c.roundRect(gx, gy, gw, gh, 6);
        c.fill();
        c.stroke();

        // Interior escuro
        c.fillStyle = '#050910';
        c.fillRect(gx + 9, gy + 9, gw - 18, gh - 18);

        // Luz interna quente do refúgio
        const inside = c.createRadialGradient(gx + gw * 0.5, gy + gh * 0.45, 12, gx + gw * 0.5, gy + gh * 0.45, gw * 0.85);
        inside.addColorStop(0, `rgba(253, 224, 71, ${alarm ? 0.12 : 0.40})`);
        inside.addColorStop(1, 'rgba(253, 224, 71, 0)');
        c.fillStyle = inside;
        c.fillRect(gx + 9, gy + 9, gw - 18, gh - 18);

        // Monitores CFTV 2x2
        [0.24, 0.62].forEach((fx, col) => {
          [0.30, 0.52].forEach((fy, row) => {
            const mx = gx + gw * fx;
            const my = gy + gh * fy;
            const mw = gw * 0.30;
            const mh = gh * 0.16;
            c.fillStyle = '#02060c';
            c.fillRect(mx - 3, my - 3, mw + 6, mh + 6);
            const scr = c.createLinearGradient(mx, my, mx, my + mh);
            scr.addColorStop(0, '#0a1a2a');
            scr.addColorStop(1, '#061020');
            c.fillStyle = scr;
            c.fillRect(mx, my, mw, mh);
            c.fillStyle = 'rgba(0, 0, 0, 0.16)';
            for (let sy = my; sy < my + mh; sy += 3) c.fillRect(mx, sy, mw, 1);
            c.fillStyle = '#22c55e';
            c.font = '700 9px monospace';
            c.textAlign = 'left';
            c.fillText('● CAM 0' + (col * 2 + row + 1), mx + 5, my + 12);
            if (col === 1 && row === 1) {
              // A criatura no monitor da eclusa
              c.fillStyle = 'rgba(239, 68, 68, 0.8)';
              c.beginPath();
              c.ellipse(mx + mw * 0.5, my + mh * 0.62, 7, 12, 0, 0, Math.PI * 2);
              c.fill();
            }
          });
        });

        // Brilho esverdeado dos monitores
        D.glow(c, gx + gw * 0.5, gy + gh * 0.42, gw * 0.8, '#10b981', 0.10);

        // Vidro da janela da guarita com reflexo diagonal
        c.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(gx + 18, gy + 18);
        c.lineTo(gx + gw * 0.55, gy + gh - 20);
        c.stroke();

        // Placa
        c.fillStyle = '#0284c7';
        c.beginPath();
        c.roundRect(gx + gw * 0.28, gy - 26, gw * 0.44, 22, 4);
        c.fill();
        c.fillStyle = '#f8fafc';
        c.font = '700 10px Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText('PORTARIA 24H', gx + gw * 0.5, gy - 11);

        // Giroflex
        c.fillStyle = alarm ? `rgba(239, 68, 68, ${0.6 + pulse * 0.4})` : '#1e293b';
        c.beginPath();
        c.arc(gx + gw - 22, gy - 14, 6, 0, Math.PI * 2);
        c.fill();
        if (alarm) D.glow(c, gx + gw - 22, gy - 14, 120, '#ef4444', 0.12 + pulse * 0.16);
      }
    });

    /* ── P3: personagens ────────────────────────────────────────── */
    const cast = D.layer({
      name: 'elenco',
      depth: 0.60,
      draw(c) {
        // Piso da portaria em foco
        const g = c.createLinearGradient(0, floorY, 0, H);
        g.addColorStop(0, '#0e1622');
        g.addColorStop(0.5, '#080d16');
        g.addColorStop(1, '#020408');
        c.fillStyle = g;
        c.fillRect(-80, floorY, W + 160, H - floorY + 60);

        // Rejunte do porcelanato em perspectiva
        c.strokeStyle = 'rgba(148, 163, 184, 0.07)';
        c.lineWidth = 1.4;
        for (let i = 1; i <= 5; i++) {
          const y = floorY + Math.pow(i / 5, 1.65) * (H - floorY);
          c.beginPath();
          c.moveTo(-80, y);
          c.lineTo(W + 80, y);
          c.stroke();
        }
        for (let x = -W * 0.5; x < W * 1.5; x += W * 0.16) {
          c.beginPath();
          c.moveTo(vpX + (x - vpX) * 0.34, floorY);
          c.lineTo(x, H);
          c.stroke();
        }

        // Luz de emergência lavando o piso
        if (alarm) D.glow(c, W * 0.5, floorY + 60, W * 0.6, '#ef4444', 0.05 + pulse * 0.06);

        // O elenco olha para a CÂMERA (que está na entrada). flipX=false
        // mantém o rosto voltado para o espectador.
        if (crew.valdir) {
          D.contactShadow(c, W * 0.115, floorY - 90, 78, 0.42);
          D.poseActor(crew.valdir, c, {
            x: W * 0.115, y: floorY - 96, scale: 2.30,
            viewMode: 'front', pose: 'radio_talk', flipX: false,
            emotion: mood === 'panic' ? 'panicked' : 'worried'
          });
        }
        if (crew.voce) {
          D.contactShadow(c, W * 0.262, floorY - 88, 78, 0.42);
          D.poseActor(crew.voce, c, {
            x: W * 0.262, y: floorY - 96, scale: 2.30,
            viewMode: 'front', pose: 'step_back', flipX: false,
            emotion: mood === 'panic' ? 'scared' : 'tense'
          });
        }
        if (S.showLucas && crew.lucas) {
          D.contactShadow(c, W * 0.665, floorY + 8, 78, 0.5);
          D.poseActor(crew.lucas, c, {
            x: W * 0.665, y: floorY, scale: 1.95,
            viewMode: 'front', pose: 'bang_gate', emotion: 'desperate'
          });
        }
      }
    });

    /* ── P2: bancada e interfone ────────────────────────────────── */
    const desk = D.layer({
      name: 'bancada',
      depth: 0.92,
      draw(c) {
        const dy = H * 0.762;
        // Bancada de granito em perspectiva
        c.fillStyle = '#0a0f18';
        c.beginPath();
        c.moveTo(-80, dy + 58);
        c.lineTo(W * 0.30, dy + 6);
        c.lineTo(W + 80, dy - 26);
        c.lineTo(W + 80, H + 80);
        c.lineTo(-80, H + 80);
        c.closePath();
        c.fill();

        // Borda iluminada
        c.strokeStyle = 'rgba(148, 163, 184, 0.32)';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-80, dy + 58);
        c.lineTo(W * 0.30, dy + 6);
        c.lineTo(W + 80, dy - 26);
        c.stroke();

        // Passa-volumes
        c.fillStyle = '#26333f';
        c.fillRect(W * 0.34, dy + 6, W * 0.14, 16);
        c.strokeStyle = '#4b5b6e';
        c.lineWidth = 1.5;
        c.strokeRect(W * 0.34, dy + 6, W * 0.14, 16);

        // Interfone na bancada — o LED pulsa quando a Camila chama
        const ix = W * 0.62;
        const iy = dy - 12;
        c.fillStyle = '#101a26';
        c.strokeStyle = '#334155';
        c.lineWidth = 1.4;
        c.beginPath();
        c.roundRect(ix, iy, 54, 34, 4);
        c.fill();
        c.stroke();
        const calling = S.intercom === true;
        c.fillStyle = calling ? `rgba(239, 68, 68, ${0.5 + Math.sin(t * 18) * 0.5})` : '#10b981';
        c.beginPath();
        c.arc(ix + 12, iy + 10, 3.4, 0, Math.PI * 2);
        c.fill();
        if (calling) D.glow(c, ix + 12, iy + 10, 60, '#ef4444', 0.22);
        c.fillStyle = '#475569';
        c.font = '600 8px monospace';
        c.textAlign = 'left';
        c.fillText('APT 304', ix + 22, iy + 13);
      }
    });

    /* ── P1: pilar de entrada ───────────────────────────────────── */
    const near = D.layer({
      name: 'pilar_entrada',
      depth: 1.15, blur: 8.0, alpha: 0.97,
      draw(c) {
        const g = c.createLinearGradient(W, 0, W * 0.84, 0);
        g.addColorStop(0, 'rgba(1, 3, 8, 0.98)');
        g.addColorStop(0.6, 'rgba(1, 3, 8, 0.6)');
        g.addColorStop(1, 'rgba(1, 3, 8, 0)');
        c.fillStyle = g;
        c.fillRect(W * 0.84, 0, W * 0.16, H);

        const top = c.createLinearGradient(0, 0, 0, H * 0.085);
        top.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
        top.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = top;
        c.fillRect(0, 0, W, H * 0.085);

        // Sanca de LED do teto
        c.fillStyle = alarm ? `rgba(239, 68, 68, ${0.4 + pulse * 0.5})` : 'rgba(253, 230, 138, 0.5)';
        c.fillRect(0, H * 0.080, W, 5);
      }
    });

    ctx.save();
    // Enquadramento: o plano de estabelecimento é um medium-wide, não um wide
    // aberto. Sem este push, o elenco ficava com 9% da altura do quadro.
    ctx.translate(W * 0.5, H * 0.5);
    ctx.scale(1.12, 1.12);
    ctx.translate(-W * 0.5, -H * 0.485);
    D.compose(ctx, { W, H, t }, [street]);
    D.fogBank(ctx, W, H, t, { y0: H * 0.46, density: 0.22 * fog, color: '#cbd5e1', drift: 36 });
    D.compose(ctx, { W, H, t }, [eclusa, guardhouse, cast]);
    // Feixe do holofote só depois de ligado, nunca na cara do elenco
    if (spotlight) {
      D.lightShaft(ctx, W * 0.19, H * 0.26, -0.42, H * 0.62, W * 0.26, '#fef9c3', 0.10 + Math.sin(t * 3) * 0.015);
    }
    D.compose(ctx, { W, H, t }, [desk, near]);
    // Contraluz frio vindo da eclusa: separa o elenco do fundo e dá o
    // "recorte" de suspense, sem apagar os rostos.
    D.glow(ctx, W * 0.60, H * 0.50, W * 0.42, '#7dd3fc', 0.08 + fear * 0.05);
    // Luz-base do interior: sem ela o plano some na vinheta do estúdio.
    const base = ctx.createRadialGradient(W * 0.30, H * 0.55, 40, W * 0.30, H * 0.55, W * 0.85);
    base.addColorStop(0, 'rgba(203, 213, 225, 0.10)');
    base.addColorStop(0.55, 'rgba(148, 163, 184, 0.045)');
    base.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
    D.grain(ctx, W, H, 41, 0.032);
    D.vignette(ctx, W, H, 0.58, 0.46, 0.46);
    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('portaria_noturna_2.5d', {
    meta: {
      nome: 'Portaria noturna · 6 planos',
      angulo: 'frontal da entrada',
      profundidade: 'rua → eclusa → guarita → elenco → bancada → pilar',
      criadoEm: '2026-11-04',
      pinned: false
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
