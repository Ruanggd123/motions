/**
 * CENA: passarela_lateral_2.5d
 * Caminhada lateral do elenco com profundidade real em quatro planos.
 *
 * POR QUE EXISTE
 * --------------
 * Antes, todo deslocamento acontecia sobre o mesmo quadro frontal. O
 * personagem "andava" no eixo X sem que o mundo reagisse: nada de paralaxe,
 * nada de foco, nada de atmosfera entre ele e a rua. Aqui a passarela tem:
 *
 *   PLANO 4 (fundo)   rua, prédios e massa negra  — desfoque 4,5px, neblina
 *   PLANO 3 (médio)   grade da eclusa e postes     — desfoque 1,8px
 *   PLANO 2 (foco)    o personagem andando         — nítido
 *   PLANO 1 (frente)  gotas no vidro e moldura     — desfoque 6px, escuro
 *
 * A câmera acompanha o passo, então cada plano desloca em velocidade
 * diferente. É a profundidade que o 3/4 e o perfil pediam.
 *
 * API
 * ---
 *   StudioScenes.play('passarela_lateral_2.5d', ctx, {
 *     W, H, t,
 *     actor,            // instância de personagem
 *     fromX, toX,       // deslocamento no mundo
 *     walkStart, walkDur,
 *     facing: 'right',  // direção de leitura
 *     mood: 'tense'     // 'calm' | 'tense' | 'panic'
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
    const walkStart = S.walkStart !== undefined ? S.walkStart : 0;
    const walkDur = S.walkDur !== undefined ? S.walkDur : 2.4;
    const p = Math.max(0, Math.min(1, (t - walkStart) / Math.max(0.001, walkDur)));
    const eased = D.easeInOutSine(p);
    const fromX = S.fromX !== undefined ? S.fromX : W * 0.78;
    const toX = S.toX !== undefined ? S.toX : W * 0.26;
    const actorX = fromX + (toX - fromX) * eased;
    const facingRight = (S.facing || 'left') === 'right';
    const mood = S.mood || 'tense';

    const horiz = H * 0.735;
    const camOffsetX = (actorX - W * 0.5) * 0.34;

    // Tensão: a neblina engorda e a luz pisca conforme o medo sobe.
    const fear = mood === 'panic' ? 1 : mood === 'tense' ? 0.5 : 0.15;
    const flicker = 0.86 + Math.sin(t * 17.3) * 0.06 + Math.sin(t * 41.7) * 0.03;

    /* ── PLANO 4: fundo distante ─────────────────────────────────────── */
    const far = D.layer({
      name: 'fundo_rua',
      depth: 0.14,
      blur: 4.4,
      haze: 0.30,
      hazeColor: '#0a1424',
      draw(c) {
        const sky = c.createLinearGradient(0, 0, 0, horiz);
        sky.addColorStop(0, '#010307');
        sky.addColorStop(0.55, '#050b16');
        sky.addColorStop(1, '#0a1424');
        c.fillStyle = sky;
        c.fillRect(-200, -40, W + 400, horiz + 40);

        // Prédios recuados, quase silhueta
        for (let i = 0; i < 7; i++) {
          const bw = 120 + D.hash(i) * 130;
          const bh = 240 + D.hash(i + 4) * 380;
          const bx = -100 + i * 190 + D.hash(i + 9) * 40;
          const by = horiz - bh;
          c.fillStyle = i % 2 ? '#03060e' : '#040810';
          c.fillRect(bx, by, bw, bh);
          // Janelas acesas com apagão parcial
          for (let wy = by + 26; wy < horiz - 40; wy += 46) {
            for (let wx = bx + 16; wx < bx + bw - 24; wx += 38) {
              if (D.hash2(wx, wy) > (0.82 - fear * 0.25)) {
                c.fillStyle = `rgba(251, 191, 36, ${0.10 + D.hash2(wy, wx) * 0.12})`;
                c.fillRect(wx, wy, 13, 17);
              }
            }
          }
        }

        // Poste apagado com halo agonizante
        c.fillStyle = '#0a1020';
        c.fillRect(W * 0.18, horiz - 300, 6, 300);
        D.glow(c, W * 0.18 + 3, horiz - 306, 120, '#fde68a', 0.05 * (1 - fear * 0.7));

        // Asfalto em perspectiva
        const road = c.createLinearGradient(0, horiz, 0, H);
        road.addColorStop(0, '#050a14');
        road.addColorStop(1, '#02050b');
        c.fillStyle = road;
        c.fillRect(-200, horiz, W + 400, H - horiz + 40);

        // Faixa central crescendo para a câmera
        c.strokeStyle = 'rgba(234, 179, 8, 0.10)';
        for (let i = 0; i < 6; i++) {
          const f = i / 6;
          const y1 = horiz + Math.pow(f, 1.7) * (H - horiz);
          const y2 = horiz + Math.pow((i + 0.55) / 6, 1.7) * (H - horiz);
          c.lineWidth = 2 + f * 7;
          c.beginPath();
          c.moveTo(W * 0.52, y1);
          c.lineTo(W * 0.52, y2);
          c.stroke();
        }

        // Massa negra avançando (quanto mais medo, mais perto)
        const wallBase = horiz + 30 - fear * 60;
        const mg = c.createLinearGradient(0, wallBase - 220, 0, wallBase + 60);
        mg.addColorStop(0, 'rgba(0, 0, 0, 0)');
        mg.addColorStop(0.5, `rgba(0, 0, 0, ${0.55 + fear * 0.3})`);
        mg.addColorStop(1, `rgba(0, 0, 0, ${0.85 + fear * 0.15})`);
        c.fillStyle = mg;
        c.fillRect(-200, wallBase - 220, W + 400, 300);

        // Olhos carmesins dentro da massa
        for (let e = 0; e < 4; e++) {
          const blink = Math.max(0, Math.sin(t * 2.6 + e * 1.9));
          if (blink < 0.3) continue;
          c.fillStyle = `rgba(239, 68, 68, ${(blink * (0.35 + fear * 0.5)).toFixed(3)})`;
          c.beginPath();
          c.ellipse(W * (0.12 + e * 0.22), wallBase - 40 + (e % 2) * 20, 9, 3.4 * blink, 0.1, 0, Math.PI * 2);
          c.fill();
        }
      }
    });

    /* ── PLANO 3: grade e postes ─────────────────────────────────────── */
    const mid = D.layer({
      name: 'grade_eclusa',
      depth: 0.38,
      blur: 1.7,
      haze: 0.12,
      hazeColor: '#0b1220',
      draw(c) {
        const top = H * 0.40;
        const bottom = H * 0.78;
        const left = -40;
        const right = W + 40;

        // Moldura da eclusa
        c.strokeStyle = '#0b1220';
        c.lineWidth = 22;
        c.strokeRect(left, top, right - left, bottom - top);

        // Barras verticais com espessura variável (perspectiva lateral)
        const bars = 22;
        for (let i = 0; i < bars; i++) {
          const f = i / (bars - 1);
          const bx = left + f * (right - left);
          const near = 0.55 + Math.sin(f * Math.PI) * 0.45;
          const bw = 5 + near * 9;
          const g = c.createLinearGradient(bx - bw, 0, bx + bw, 0);
          g.addColorStop(0, '#050912');
          g.addColorStop(0.42, '#334155');
          g.addColorStop(0.56, '#7f93a9');
          g.addColorStop(1, '#050912');
          c.fillStyle = g;
          c.fillRect(bx - bw / 2, top, bw, bottom - top);
        }

        // Travessas horizontais
        [top + (bottom - top) * 0.24, top + (bottom - top) * 0.76].forEach((ry) => {
          const g = c.createLinearGradient(0, ry - 9, 0, ry + 9);
          g.addColorStop(0, '#050912');
          g.addColorStop(0.5, '#6b7f95');
          g.addColorStop(1, '#050912');
          c.fillStyle = g;
          c.fillRect(left - 30, ry - 8, right - left + 60, 16);
        });

        // Marcas de garra herdadas do Ep.02
        c.strokeStyle = 'rgba(226, 232, 240, 0.14)';
        c.lineWidth = 2;
        for (let s = 0; s < 6; s++) {
          const gx = W * (0.14 + s * 0.14);
          const gy = top + 90 + (s % 3) * 110;
          for (let k = 0; k < 3; k++) {
            c.beginPath();
            c.moveTo(gx + k * 8, gy);
            c.lineTo(gx + k * 8 - 12, gy + 38);
            c.stroke();
          }
        }

        // Trava eletromagnética na coluna central
        c.fillStyle = '#090d16';
        c.beginPath();
        c.roundRect(W * 0.5 - 44, top - 26, 88, 30, 5);
        c.fill();
        c.fillStyle = `rgba(239, 68, 68, ${0.55 + Math.sin(t * 6) * 0.35})`;
        c.beginPath();
        c.arc(W * 0.5 - 26, top - 11, 5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fca5a5';
        c.font = '700 11px monospace';
        c.textAlign = 'left';
        c.fillText('TRAVADO', W * 0.5 - 14, top - 7);
      }
    });

    /* ── PLANO 2: o personagem, nítido ──────────────────────────────── */
    const midground = D.layer({
      name: 'ator',
      depth: 0.62,
      blur: 0,
      draw(c) {
        // Piso do plano de foco: recebe a sombra de contato
        const floorGlow = c.createLinearGradient(0, horiz - 40, 0, H);
        floorGlow.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
        floorGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        c.fillStyle = floorGlow;
        c.fillRect(0, horiz - 40, W, H - horiz + 40);

        if (!actor) return;

        // Chão molhado: sombra de contato e reflexo espelhado PELO CHÃO.
        // O espelho é feito em torno da linha do piso (y = horiz): o que está
        // acima desce, o que está abaixo sobe. Antes o sinal estava invertido
        // e o reflexo aparecia flutuando em cima do personagem.
        D.contactShadow(c, actorX, horiz + 6, 74, 0.55);
        c.save();
        c.globalAlpha = 0.15;
        c.translate(0, horiz * 2);
        c.scale(1, -1);
        D.poseActor(actor, c, {
          x: actorX,
          y: horiz - 4,
          scale: S.scale !== undefined ? S.scale : 1.55,
          flipX: !facingRight,
          viewMode: 'profile',
          pose: 'idle'
        });
        c.restore();
        // Stretch vertical curto e desbotado preenchendo a poça
        const wet = c.createLinearGradient(0, horiz, 0, horiz + 120);
        wet.addColorStop(0, 'rgba(56, 189, 248, 0.13)');
        wet.addColorStop(1, 'rgba(56, 189, 248, 0)');
        c.fillStyle = wet;
        c.fillRect(actorX - 80, horiz, 160, 120);

        // Personagem real
        D.poseActor(actor, c, {
          x: actorX,
          y: horiz - 4,
          scale: S.scale !== undefined ? S.scale : 1.55,
          flipX: !facingRight,
          viewMode: 'profile',
          pose: 'idle',
          reactSide: S.reactSide,
          reactAmount: S.reactAmount
        });
      }
    });

    /* ── PLANO 1: frente — gotas e moldura ──────────────────────────── */
    const near = D.layer({
      name: 'moldura_frente',
      depth: 1.15,
      blur: 6.2,
      alpha: 0.95,
      draw(c) {
        // Coluna de gradil desfocada cruzando o quadro
        const g = c.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, 'rgba(2, 6, 14, 0.9)');
        g.addColorStop(0.055, 'rgba(2, 6, 14, 0.55)');
        g.addColorStop(0.075, 'rgba(2, 6, 14, 0)');
        g.addColorStop(1, 'rgba(2, 6, 14, 0)');
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);

        // Moldura superior em sombra (teto do corredor)
        const topGrad = c.createLinearGradient(0, 0, 0, H * 0.14);
        topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.82)');
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = topGrad;
        c.fillRect(0, 0, W, H * 0.14);

        // Gotas grandes no vidro da câmera
        for (let d = 0; d < 9; d++) {
          const dx = D.hash(d + 21) * W;
          const dy = (D.hash(d + 3) * H + t * 26 * (0.4 + D.hash(d) * 0.8)) % H;
          const dr = 6 + D.hash(d + 5) * 16;
          const drop = c.createRadialGradient(dx, dy, 1, dx, dy, dr);
          drop.addColorStop(0, 'rgba(226, 242, 254, 0.22)');
          drop.addColorStop(0.7, 'rgba(186, 230, 253, 0.10)');
          drop.addColorStop(1, 'rgba(186, 230, 253, 0)');
          c.fillStyle = drop;
          c.beginPath();
          c.ellipse(dx, dy, dr * 0.62, dr, 0, 0, Math.PI * 2);
          c.fill();
        }
      }
    });

    /* ── Atmosfera entre os planos ─────────────────────────────────── */
    ctx.save();
    D.compose(ctx, { W, H, t }, [far], { camOffsetX });
    D.fogBank(ctx, W, H, t, { y0: H * 0.52, density: 0.20 + fear * 0.20, drift: 30 });
    D.compose(ctx, { W, H, t }, [mid], { camOffsetX });
    D.compose(ctx, { W, H, t }, [midground], { camOffsetX });
    D.rain(ctx, W, H, t, { count: 60 + Math.round(fear * 40), speed: 820, alpha: 0.16 + fear * 0.08 });
    D.compose(ctx, { W, H, t }, [near], { camOffsetX });

    // Iluminação: um spot frio vindo do teto, tremendo com a tensão
    D.lightShaft(ctx, W * 0.5, -60, Math.PI / 2 - 0.10, H * 0.86, W * 0.34, '#bae6fd', 0.05 * flicker);
    D.glow(ctx, actorX, horiz - 210, 260, mood === 'panic' ? '#ef4444' : '#38bdf8', 0.05 + fear * 0.05);

    D.grain(ctx, W, H, 11, 0.035);
    D.vignette(ctx, W, H, 0.66, 0.5, 0.46);
    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('passarela_lateral_2.5d', {
    meta: {
      nome: 'Passarela lateral · 4 planos',
      angulo: 'perfil lateral',
      profundidade: 'rua → grade → personagem → vidro',
      criadoEm: '2026-11-04',
      pinned: false
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
