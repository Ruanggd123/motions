/**
 * CENA: reacao_lateral_2.5d
 * Close de reação em perfil: o personagem vira na direção do que vem da rua.
 *
 * POR QUE EXISTE
 * --------------
 * É a cena que prova visualmente a regra dos braços: quando a ameaça vem de
 * um lado, o braço daquele lado vai para a FRENTE e o outro recua para TRÁS.
 * Sem um plano fechado de perfil, essa troca de camada não se lê — e o
 * espectador só vê "um braço". Aqui o quadro é apertado o bastante para a
 * leitura ser inequívoca.
 *
 * Planos:
 *   P4  espaço externo esfumaçado (de onde vem a coisa) — desfoque 6px
 *   P3  janela/vidro com a ameaça atrás             — desfoque 2,5px
 *   P2  personagem em perfil, nítido                — foco
 *   P1  moldura do vão em contraluz                 — desfoque 7px
 *
 * API
 * ---
 *   StudioScenes.play('reacao_lateral_2.5d', ctx, {
 *     W, H, t,
 *     actor,
 *     threatSide: 'left' | 'right',   // de que lado vem a ameaça
 *     reactionStart, reactionDur,     // janela da reação
 *     holdingProp,                    // 'radio' | 'lamp' | 'phone' | null
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
    const threatSide = S.threatSide === 'right' ? 'right' : 'left';
    const start = S.reactionStart !== undefined ? S.reactionStart : 0;
    const dur = S.reactionDur !== undefined ? S.reactionDur : 0.55;
    const raw = Math.max(0, Math.min(1, (t - start) / Math.max(0.001, dur)));
    // Entrada com overshoot curto: o corpo reage rápido e assenta.
    const react = raw < 1 ? D.easeOutCubic(raw) : 1;
    const settle = raw < 1 ? Math.sin(raw * Math.PI) * 0.05 : 0;
    const mood = S.mood || 'panic';

    // O personagem olha para o lado da ameaça.
    const facingRight = threatSide === 'right';
    const fear = mood === 'panic' ? 1 : mood === 'tense' ? 0.55 : 0.25;

    const floorY = H * 0.800;
    const actorX = facingRight ? W * 0.40 : W * 0.60;
    const threatX = facingRight ? W * 1.02 : -W * 0.02;

    /* ── P4: espaço externo ───────────────────────────────────────── */
    const outer = D.layer({
      name: 'externo',
      depth: 0.10, blur: 6.2, haze: 0.34, hazeColor: '#070d18',
      draw(c) {
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#010307');
        g.addColorStop(0.5, '#050b16');
        g.addColorStop(1, '#0a1220');
        c.fillStyle = g;
        c.fillRect(-80, -40, W + 160, H + 80);

        // Neblina densa do lado da ameaça
        D.glow(c, threatX, H * 0.55, W * 0.55, '#94a3b8', 0.10 + fear * 0.10);

        // A massa negra, sem forma definida
        const bx = threatX;
        const by = H * 0.58;
        const mass = c.createRadialGradient(bx, by, 20, bx, by, W * 0.42);
        mass.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
        mass.addColorStop(0.55, 'rgba(2, 5, 12, 0.75)');
        mass.addColorStop(1, 'rgba(2, 5, 12, 0)');
        c.fillStyle = mass;
        c.beginPath();
        c.ellipse(bx, by, W * 0.40, H * 0.42, 0, 0, Math.PI * 2);
        c.fill();

        // Olhos carmesins pulsando — única leitura clara da ameaça
        for (let e = 0; e < 3; e++) {
          const blink = Math.max(0, Math.sin(t * 3.4 + e * 1.6));
          if (blink < 0.28) continue;
          const ex = bx - (facingRight ? 1 : -1) * (W * 0.06 + e * W * 0.05);
          const ey = by - H * 0.10 + (e % 2) * H * 0.05;
          const glow = c.createRadialGradient(ex, ey, 2, ex, ey, 60);
          glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          glow.addColorStop(0.3, `rgba(239, 68, 68, ${0.75 * blink})`);
          glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
          c.fillStyle = glow;
          c.beginPath();
          c.arc(ex, ey, 60, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = `rgba(255, 200, 200, ${0.9 * blink})`;
          c.beginPath();
          c.ellipse(ex, ey, 10, 4.5 * blink, 0.1, 0, Math.PI * 2);
          c.fill();
        }
      }
    });

    /* ── P3: vidro/janela ────────────────────────────────────────── */
    const glass = D.layer({
      name: 'vidro',
      depth: 0.28, blur: 2.5, haze: 0.14, hazeColor: '#0a1220',
      draw(c) {
        const gx = facingRight ? W * 0.52 : W * 0.02;
        const gw = W * 0.46;
        const gy = H * 0.13;
        const gh = H * 0.64;

        // Moldura
        c.strokeStyle = '#111c2b';
        c.lineWidth = 20;
        c.strokeRect(gx, gy, gw, gh);

        // Vidro
        const glassGrad = c.createLinearGradient(gx, gy, gx + gw, gy + gh);
        glassGrad.addColorStop(0, 'rgba(18, 40, 64, 0.55)');
        glassGrad.addColorStop(0.5, 'rgba(8, 20, 36, 0.45)');
        glassGrad.addColorStop(1, 'rgba(4, 10, 20, 0.6)');
        c.fillStyle = glassGrad;
        c.fillRect(gx + 10, gy + 10, gw - 20, gh - 20);

        // Reflexo da emergência ou do holofote no vidro
        const sheen = c.createLinearGradient(gx, gy, gx + gw * 0.5, gy + gh);
        sheen.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
        sheen.addColorStop(0.4, 'rgba(255, 255, 255, 0.015)');
        sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
        c.fillStyle = sheen;
        c.fillRect(gx + 10, gy + 10, gw - 20, gh - 20);

        // Trincas herdadas (continuidade do Ep.02)
        c.strokeStyle = 'rgba(226, 232, 240, 0.20)';
        c.lineWidth = 1.4;
        const cx = gx + gw * 0.72;
        const cy = gy + gh * 0.52;
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2 + 0.4;
          c.beginPath();
          c.moveTo(cx, cy);
          c.lineTo(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46);
          c.lineTo(cx + Math.cos(a + 0.16) * 96, cy + Math.sin(a - 0.16) * 96);
          c.stroke();
        }

        // Gotas escorrendo
        c.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        c.lineWidth = 2;
        for (let d = 0; d < 8; d++) {
          const dx = gx + 24 + D.hash(d + 3) * (gw - 48);
          const dy = gy + 20 + ((D.hash(d + 9) * gh + t * 180) % (gh - 60));
          c.beginPath();
          c.moveTo(dx, dy);
          c.lineTo(dx, dy + 16);
          c.stroke();
        }
      }
    });

    /* ── P2: personagem em foco ──────────────────────────────────── */
    const subject = D.layer({
      name: 'personagem',
      depth: 0.62,
      draw(c) {
        // Piso interno
        const g = c.createLinearGradient(0, floorY, 0, H);
        g.addColorStop(0, '#101925');
        g.addColorStop(1, '#03060c');
        c.fillStyle = g;
        c.fillRect(-60, floorY, W + 120, H - floorY + 60);

        if (!actor) return;

        // Luz da ameaça batendo de perfil no rosto do personagem
        D.glow(c, threatX, H * 0.36, W * 0.46, mood === 'panic' ? '#ef4444' : '#7dd3fc', 0.07 + fear * 0.07);

        D.contactShadow(c, actorX, floorY + 8, 110, 0.55);
        D.poseActor(actor, c, {
          x: actorX + (facingRight ? -1 : 1) * 14 * react,
          y: floorY,
          scale: S.actorScale !== undefined ? S.actorScale : 3.05,
          // O rig de perfil nasce olhando para +X (direita). Com a ameaça à
          // direita, ele olha para a direita: flipX = false. Com a ameaça à
          // esquerda, espelha: flipX = true.
          flipX: !facingRight,
          viewMode: 'profile',
          pose: S.actorPose || 'idle',
          emotion: S.actorEmotion || (mood === 'panic' ? 'panicked' : 'worried'),
          reactSide: threatSide,
          reactAmount: react,
          mouthOpen: S.actorMouth !== undefined ? S.actorMouth : 0.25 + fear * 0.2
        });

        // Tremor de susto: deslocamento mínimo que existe só no pico
        if (settle > 0) {
          c.globalAlpha = settle * 2;
          c.fillStyle = '#e2e8f0';
          c.fillRect(0, 0, 0, 0);
          c.globalAlpha = 1;
        }
      }
    });

    /* ── P1: moldura em contraluz ────────────────────────────────── */
    const frame = D.layer({
      name: 'moldura',
      depth: 1.12, blur: 7.2, alpha: 0.97,
      draw(c) {
        const side = facingRight ? 0 : W;
        const g = c.createLinearGradient(side, 0, facingRight ? W * 0.18 : W * 0.82, 0);
        g.addColorStop(0, 'rgba(1, 3, 8, 0.98)');
        g.addColorStop(0.55, 'rgba(1, 3, 8, 0.55)');
        g.addColorStop(1, 'rgba(1, 3, 8, 0)');
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);

        const top = c.createLinearGradient(0, 0, 0, H * 0.12);
        top.addColorStop(0, 'rgba(0, 0, 0, 0.94)');
        top.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = top;
        c.fillRect(0, 0, W, H * 0.12);

        // Vazamento de luz do corredor atrás do personagem
        D.glow(c, actorX - (facingRight ? 60 : -60), H * 0.42, W * 0.30, '#fde68a', 0.055);
      }
    });

    ctx.save();
    D.compose(ctx, { W, H, t }, [outer]);
    D.fogBank(ctx, W, H, t, { y0: H * 0.52, density: 0.18 + fear * 0.10, color: '#cbd5e1', drift: 26 });
    D.compose(ctx, { W, H, t }, [glass, subject]);
    D.rain(ctx, W, H, t, { count: 50, speed: 760, alpha: 0.12 });
    D.compose(ctx, { W, H, t }, [frame]);
    D.grain(ctx, W, H, 53, 0.035);
    D.vignette(ctx, W, H, 0.76, facingRight ? 0.42 : 0.58, 0.46);
    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('reacao_lateral_2.5d', {
    meta: {
      nome: 'Reação lateral · close de perfil',
      angulo: 'perfil fechado',
      profundidade: 'externo → vidro → personagem → moldura',
      criadoEm: '2026-11-04',
      pinned: false
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
