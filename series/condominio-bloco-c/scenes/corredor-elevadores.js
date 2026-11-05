/**
 * CENA: corredor_elevadores_2.5d
 * Hall dos elevadores do Bloco C com profundidade em cinco planos.
 *
 * POR QUE EXISTE
 * --------------
 * O corredor era um cenário plano: parede, elevador e porta no mesmo tom, com
 * a mesma nitidez. Numa série de suspense, o corredor é onde o espectador
 * espera que algo apareça — então ele precisa de profundidade para o vazio
 * pesar. Aqui:
 *
 *   P5  hall distante e fosso do elevador   — desfoque 5px, azul atmosférico
 *   P4  painel de caixas de correio         — desfoque 2,6px
 *   P3  portas do elevador (foco narrativo) — nítido, luz vermelha do visor
 *   P2  porta corta-fogo e extintor         — nítido no plano do chão
 *   P1  batente em contraluz                — desfoque 7px, quase preto
 *
 * API
 * ---
 *   StudioScenes.play('corredor_elevadores_2.5d', ctx, {
 *     W, H, t,
 *     actor,                 // personagem opcional no plano de foco
 *     doorOpen,              // 0..1 portas do elevador abrindo
 *     alarm,                 // pulso vermelho de emergência
 *     floorLabel,            // ex.: '4º'
 *     mood                   // 'calm' | 'tense' | 'panic'
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
    const doorOpen = Math.max(0, Math.min(1, S.doorOpen !== undefined ? S.doorOpen : 0));
    const mood = S.mood || 'tense';
    const alarm = S.alarm === true || mood === 'panic';
    const fear = mood === 'panic' ? 1 : mood === 'tense' ? 0.5 : 0.15;
    const floorLabel = S.floorLabel || '4º';
    const pulse = alarm ? 0.5 + Math.sin(t * 8) * 0.5 : 0;

    const floorY = H * 0.760;
    const vpX = W * 0.52;
    const vpY = H * 0.430;

    /* ── P5: fosso e fundo do elevador ─────────────────────────────── */
    const far = D.layer({
      name: 'fosso',
      depth: 0.12, blur: 5.0, haze: 0.34, hazeColor: '#08101c',
      draw(c) {
        c.fillStyle = '#02040a';
        c.fillRect(-100, -60, W + 200, H + 120);

        // Interior da cabine: vermelho do alarme engolindo o cinza
        const cabin = c.createLinearGradient(W * 0.36, H * 0.28, W * 0.66, H * 0.72);
        cabin.addColorStop(0, alarm ? '#3b0d0d' : '#1a2330');
        cabin.addColorStop(0.55, '#0d121c');
        cabin.addColorStop(1, '#05080f');
        c.fillStyle = cabin;
        c.fillRect(W * 0.36, H * 0.28, W * 0.30, H * 0.46);

        // Espelho interno da cabine, com o corredor refletido às avessas
        c.fillStyle = 'rgba(148, 163, 184, 0.10)';
        c.fillRect(W * 0.40, H * 0.33, W * 0.22, H * 0.20);
        c.strokeStyle = '#4b5563';
        c.lineWidth = 3;
        c.strokeRect(W * 0.40, H * 0.33, W * 0.22, H * 0.20);
        D.glow(c, W * 0.51, H * 0.43, 180, alarm ? '#ef4444' : '#38bdf8', 0.035 + pulse * 0.06);

        // Poço do elevador descendo em fuga
        const shaft = c.createLinearGradient(0, floorY, 0, H);
        shaft.addColorStop(0, '#06080e');
        shaft.addColorStop(1, '#010204');
        c.fillStyle = shaft;
        c.fillRect(W * 0.36, floorY - 20, W * 0.30, H - floorY + 40);
      }
    });

    /* ── P4: caixas de correio ─────────────────────────────────────── */
    const mailbox = D.layer({
      name: 'correio',
      depth: 0.30, blur: 2.6, haze: 0.16, hazeColor: '#0a1220',
      draw(c) {
        const bx = -W * 0.02;
        const by = H * 0.30;
        const bw = W * 0.30;
        const bh = H * 0.27;

        c.fillStyle = '#241a11';
        c.strokeStyle = '#475569';
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(bx, by, bw, bh, 5);
        c.fill();
        c.stroke();

        for (let r = 0; r < 4; r++) {
          for (let col = 0; col < 3; col++) {
            const x = bx + 12 + col * (bw / 3 - 6);
            const y = by + 12 + r * (bh / 4 - 4);
            const w = bw / 3 - 20;
            const h = bh / 4 - 12;
            const is4 = r === 3;
            c.fillStyle = is4 ? '#1d2634' : '#2c3a4c';
            c.strokeStyle = '#0b1220';
            c.lineWidth = 1.5;
            c.fillRect(x, y, w, h);
            c.strokeRect(x, y, w, h);
            if (is4) {
              // 4º andar interditado: fita crepe
              c.fillStyle = '#eab308';
              c.fillRect(x + 6, y + h * 0.35, w - 12, 7);
            } else {
              c.fillStyle = '#0b1220';
              c.fillRect(x + 8, y + h * 0.4, w - 16, 4);
            }
            c.fillStyle = '#cbd5e1';
            c.font = '700 10px monospace';
            c.textAlign = 'center';
            c.fillText('AP ' + (101 + r * 100 + col), x + w / 2, y + h - 6);
          }
        }
      }
    });

    /* ── P3: elevador social ──────────────────────────────────────── */
    const elevator = D.layer({
      name: 'elevador',
      depth: 0.50,
      draw(c) {
        // Moldura de granito
        c.fillStyle = '#080b12';
        c.fillRect(W * 0.33, H * 0.245, W * 0.36, H * 0.505);

        // Visor vermelho no topo
        c.fillStyle = '#020610';
        c.strokeStyle = '#334155';
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(W * 0.44, H * 0.205, W * 0.14, H * 0.052, 5);
        c.fill();
        c.stroke();
        c.fillStyle = `rgba(239, 68, 68, ${0.70 + Math.sin(t * 7) * 0.25})`;
        c.font = '800 34px monospace';
        c.textAlign = 'center';
        c.fillText(floorLabel + ' ⬇', W * 0.51, H * 0.245);

        // Folhas de aço escovado
        const gap = W * 0.155 * doorOpen;
        const doorGrad = c.createLinearGradient(W * 0.35, 0, W * 0.67, 0);
        doorGrad.addColorStop(0, '#4a5768');
        doorGrad.addColorStop(0.32, '#8ea1b6');
        doorGrad.addColorStop(0.62, '#6b7f95');
        doorGrad.addColorStop(1, '#3d4d61');
        c.fillStyle = doorGrad;
        c.fillRect(W * 0.35 - gap, H * 0.26, W * 0.155, H * 0.485);
        c.fillRect(W * 0.505 + gap, H * 0.26, W * 0.155, H * 0.485);
        c.strokeStyle = '#1b2532';
        c.lineWidth = 3;
        c.strokeRect(W * 0.35 - gap, H * 0.26, W * 0.155, H * 0.485);
        c.strokeRect(W * 0.505 + gap, H * 0.26, W * 0.155, H * 0.485);

        // Fresta de luz que escapa conforme abre
        if (doorOpen > 0.02) {
          const leak = c.createLinearGradient(W * 0.50, 0, W * 0.52, 0);
          leak.addColorStop(0, `rgba(190, 242, 255, ${0.20 * doorOpen})`);
          leak.addColorStop(0.5, `rgba(255, 255, 255, ${0.42 * doorOpen})`);
          leak.addColorStop(1, `rgba(190, 242, 255, ${0.20 * doorOpen})`);
          c.fillStyle = leak;
          c.fillRect(W * 0.50 - gap * 0.2, H * 0.26, W * 0.02 + gap * 0.4, H * 0.485);
        }

        // Botoeira com o 4º aceso — o elevador desceu sozinho
        c.fillStyle = '#0b1220';
        c.beginPath();
        c.roundRect(W * 0.70, H * 0.415, W * 0.035, H * 0.072, 4);
        c.fill();
        c.fillStyle = `rgba(239, 68, 68, ${0.65 + Math.sin(t * 5) * 0.3})`;
        c.beginPath();
        c.arc(W * 0.7175, H * 0.436, 5.5, 0, Math.PI * 2);
        c.fill();
        D.glow(c, W * 0.7175, H * 0.436, 54, '#ef4444', 0.28);

        // Reflexo da luz vermelha no aço
        D.glow(c, W * 0.51, H * 0.30, W * 0.22, alarm ? '#ef4444' : '#38bdf8', 0.05);
      }
    });

    /* ── P2: porta corta-fogo ─────────────────────────────────────── */
    const fireDoor = D.layer({
      name: 'corta_fogo',
      depth: 0.74,
      draw(c) {
        c.fillStyle = '#06402f';
        c.strokeStyle = '#022c22';
        c.lineWidth = 5;
        c.fillRect(W * 0.755, H * 0.255, W * 0.215, H * 0.505);
        c.strokeRect(W * 0.755, H * 0.255, W * 0.215, H * 0.505);

        // Barra antipânico
        c.fillStyle = '#cbd5e1';
        c.fillRect(W * 0.780, H * 0.475, W * 0.165, 14);
        c.fillStyle = 'rgba(255, 255, 255, 0.4)';
        c.fillRect(W * 0.780, H * 0.475, W * 0.165, 4);

        // Placa fotoluminescente
        c.fillStyle = '#10b981';
        c.beginPath();
        c.roundRect(W * 0.775, H * 0.205, W * 0.165, H * 0.035, 4);
        c.fill();
        c.fillStyle = '#022c22';
        c.font = '800 13px Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText('SAÍDA • ESCADA', W * 0.857, H * 0.228);

        // Extintor
        c.fillStyle = '#dc2626';
        c.beginPath();
        c.roundRect(W * 0.700, H * 0.530, 30, 86, 9);
        c.fill();
        c.fillStyle = '#09090b';
        c.fillRect(W * 0.707, H * 0.512, 16, 16);
      }
    });

    /* ── piso e foco ──────────────────────────────────────────────── */
    const floor = D.layer({
      name: 'piso',
      depth: 0.86,
      draw(c) {
        const g = c.createLinearGradient(0, floorY, 0, H);
        g.addColorStop(0, '#0b111c');
        g.addColorStop(0.5, '#06090f');
        g.addColorStop(1, '#020407');
        c.fillStyle = g;
        c.fillRect(-100, floorY, W + 200, H - floorY + 60);

        // Rejunte em perspectiva
        c.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        c.lineWidth = 1.4;
        for (let i = 1; i <= 5; i++) {
          const y = floorY + Math.pow(i / 5, 1.6) * (H - floorY);
          c.beginPath();
          c.moveTo(-100, y);
          c.lineTo(W + 100, y);
          c.stroke();
        }
        for (let x = -W; x < W * 2; x += W * 0.18) {
          c.beginPath();
          c.moveTo(vpX + (x - vpX) * 0.30, floorY);
          c.lineTo(x, H);
          c.stroke();
        }

        // Reflexo vermelho no porcelanato
        D.glow(c, W * 0.51, floorY + 90, W * 0.30, alarm ? '#ef4444' : '#38bdf8', alarm ? 0.09 + pulse * 0.07 : 0.05);

        if (!actor) return;
        const ax = S.actorX !== undefined ? S.actorX : W * 0.42;
        D.contactShadow(c, ax, floorY + 10, 90, 0.55);
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

    /* ── P1: batente em contraluz ─────────────────────────────────── */
    const near = D.layer({
      name: 'batente',
      depth: 1.10, blur: 7.0, alpha: 0.96,
      draw(c) {
        const g = c.createLinearGradient(0, 0, W * 0.16, 0);
        g.addColorStop(0, 'rgba(1, 3, 8, 0.96)');
        g.addColorStop(0.55, 'rgba(1, 3, 8, 0.5)');
        g.addColorStop(1, 'rgba(1, 3, 8, 0)');
        c.fillStyle = g;
        c.fillRect(0, 0, W * 0.16, H);

        const top = c.createLinearGradient(0, 0, 0, H * 0.10);
        top.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        top.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = top;
        c.fillRect(0, 0, W, H * 0.10);

        // Luminária de emergência no teto, quase no limite do quadro
        if (alarm) {
          D.glow(c, W * 0.62, H * 0.085, 190, '#ef4444', 0.10 + pulse * 0.16);
          c.fillStyle = `rgba(239, 68, 68, ${0.5 + pulse * 0.5})`;
          c.beginPath();
          c.arc(W * 0.62, H * 0.085, 9, 0, Math.PI * 2);
          c.fill();
        }
      }
    });

    ctx.save();
    D.compose(ctx, { W, H, t }, [far]);
    D.fogBank(ctx, W, H, t, { y0: H * 0.42, density: 0.10 + fear * 0.10, color: '#94a3b8', drift: 20 });
    D.compose(ctx, { W, H, t }, [mailbox, elevator, fireDoor, floor]);
    // Feixe da luminária do teto, frio e instável
    D.lightShaft(ctx, W * 0.50, -40, Math.PI / 2 - 0.06, H * 0.78, W * 0.30, alarm ? '#fca5a5' : '#bae6fd', 0.05 + fear * 0.03);
    D.compose(ctx, { W, H, t }, [near]);
    D.grain(ctx, W, H, 23, 0.03);
    D.vignette(ctx, W, H, 0.70, 0.5, 0.48);
    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('corredor_elevadores_2.5d', {
    meta: {
      nome: 'Hall dos Elevadores · 5 planos',
      angulo: 'frontal levemente elevada',
      profundidade: 'fosso → correio → elevador → corta-fogo → batente',
      criadoEm: '2026-11-04',
      pinned: false
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
