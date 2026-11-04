/**
 * CENA: alavanca_macro
 * Close-up macro da mão do Seu Valdir puxando a alavanca do reator de 1000 W.
 *
 * POR QUE FOI REFEITA:
 *   A versão anterior desenhava a alavanca apenas transladando para baixo
 *   (não pivotava) e a mão era um blob com quatro dedos retangulares soltos.
 *   Numa cena macro isso lê como adesivo, não como ação.
 *
 * O QUE MUDOU:
 *   1. A alavanca agora PIVOTA num eixo real (quadrante de 58°) e a mão viaja
 *      presa à empunhadura pelo mesmo arco — a mão nunca "descola" da alavanca.
 *   2. Anatomia de mão com falanges: cada dedo tem 3 segmentos que se dobram
 *      em volta da empunhadura, dorso com metacarpos e polegar opositor real.
 *   3. O esforço aparece: tendões em relevo, compressão dos dedos e a
 *      empunhadura deformando levemente sob a pegada.
 *   4. Profundidade por 3 planos: parede desfocada → quadro elétrico → mão
 *      e alavanca nítidas na frente, com sombra projetada no quadro.
 */
(function (global) {
  const draw = (ctx, S) => {
    const { W, H, t, pullStart = 0, pullDuration = 0.42 } = S;

    // ─── Fase do movimento (determinística: só depende do tempo) ───────
    const raw = Math.min(1, Math.max(0, (t - pullStart) / pullDuration));
    // Curva mecânica: começa devagar (vencendo a mola), acelera e trava no fim
    const pull = raw <= 0 ? 0 : 1 - Math.pow(1 - raw, 2.6);
    const engaged = raw >= 1;
    const sinceContact = Math.max(0, t - (pullStart + pullDuration));
    const glow = engaged ? Math.min(1, sinceContact / 0.25) : 0;

    // Tremor da mão: aumenta com a força, zera depois do fim do curso
    const strain = raw > 0 && raw < 1 ? Math.sin(t * 42) * 1.3 : 0;

    ctx.save();

    /* ════════ PLANO 3 — PAREDE DE CONCRETO (fora de foco) ════════ */
    const wallGrad = ctx.createLinearGradient(0, 0, W, H);
    wallGrad.addColorStop(0, '#05080f');
    wallGrad.addColorStop(0.45, '#0a1019');
    wallGrad.addColorStop(1, '#040609');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, W, H);

    // Manchas do concreto
    for (let s = 0; s < 70; s++) {
      const sx = (s * 137) % W;
      const sy = (s * 211) % H;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.10 + (s % 5) * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 26 + (s % 4) * 14, 18 + (s % 3) * 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eletroduto descendo pela parede (dá direção vertical à composição)
    ctx.fillStyle = '#131c2b';
    ctx.fillRect(112, 0, 40, H);
    ctx.fillStyle = '#1c2839';
    ctx.fillRect(117, 0, 9, H);

    /* ════════ PLANO 2 — O QUADRO ELÉTRICO ════════ */
    const boxW = 600;
    const boxH = 820;
    const boxX = (W - boxW) / 2;
    const boxY = H * 0.5 - boxH * 0.56;

    // Sombra projetada (afasta a chapa da parede)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    ctx.beginPath();
    ctx.roundRect(boxX + 24, boxY + 30, boxW, boxH, 20);
    ctx.fill();

    // Chapa de aço pintada
    const plate = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
    plate.addColorStop(0, '#3d4a5c');
    plate.addColorStop(0.26, '#232e3e');
    plate.addColorStop(0.74, '#182130');
    plate.addColorStop(1, '#2d3849');
    ctx.fillStyle = plate;
    ctx.strokeStyle = '#5b6b80';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    // Bisel interno
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.26)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX + 13, boxY + 13, boxW - 26, boxH - 26, 10);
    ctx.stroke();

    // Rebites
    ctx.fillStyle = '#8296ac';
    [[boxX + 36, boxY + 36], [boxX + boxW - 36, boxY + 36],
     [boxX + 36, boxY + boxH - 36], [boxX + boxW - 36, boxY + boxH - 36]].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#101823';
      ctx.fillRect(rx - 7, ry - 1.8, 14, 3.6);
      ctx.fillStyle = '#8296ac';
    });

    // Placa do reator
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.roundRect(boxX + 38, boxY + 42, boxW - 76, 68, 4);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.font = '900 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REATOR AUXILIAR · 1000W', boxX + boxW / 2, boxY + 76);
    ctx.fillStyle = '#78350f';
    ctx.font = '700 17px "JetBrains Mono", monospace';
    ctx.fillText('CIRCUITO DE EMERGÊNCIA', boxX + boxW / 2, boxY + 99);

    // Triângulo NR-10
    const wY = boxY + 138;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(boxX + 86, wY + 92);
    ctx.lineTo(boxX + 142, wY - 2);
    ctx.lineTo(boxX + 198, wY + 92);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#111827';
    ctx.font = '900 50px "JetBrains Mono", monospace';
    ctx.fillText('⚡', boxX + 142, wY + 66);

    // Placa de tensão
    ctx.fillStyle = '#0b111b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(boxX + 232, wY + 2, 296, 96, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 31px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('220V / 1000W', boxX + 250, wY + 40);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 17px "JetBrains Mono", monospace';
    ctx.fillText('FASE + NEUTRO + TERRA', boxX + 250, wY + 68);

    /* ─── A ALAVANCA EM PIVÔ ───
       O eixo fica no topo do quadrante. A haste gira de -16° (repouso,
       apontando para cima) até +42° (acionada). A empunhadura percorre o arco,
       e é nesse ponto exato que a mão é ancorada. */
    const pivotX = boxX + boxW * 0.5;
    const pivotY = boxY + 432;
    const rodLen = 196;
    const OFF_DEG = -16;
    const ON_DEG = 42;

    // Geometria do pino: a haste é desenhada com ctx.rotate(θ) a partir do eixo,
    // e o Canvas gira no sentido horário com Y para baixo. Logo o ponto a uma
    // distância r na direção da haste é (−sin θ · r, +cos θ · r) — NÃO (+sin, +cos).
    // O bug anterior (sinal invertido) deixava a mão ancorada do lado oposto da
    // haste: ela "flutuava" e a alavanca parecia solta.
    const leverPoint = (deg, r) => {
      const th = (deg * Math.PI) / 180;
      return { x: pivotX - Math.sin(th) * r, y: pivotY + Math.cos(th) * r };
    };
    const degNow = OFF_DEG + pull * (ON_DEG - OFF_DEG);
    const grip = leverPoint(degNow, rodLen);

    // Quadrante: rasgo curvo por onde a haste corre.
    // Canvas mede ângulo a partir do eixo +X, então a haste em θ fica em 90° + θ.
    const toCanvas = (deg) => ((90 + deg) * Math.PI) / 180;
    ctx.save();
    ctx.strokeStyle = '#070c14';
    ctx.lineWidth = 46;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, rodLen, toCanvas(OFF_DEG), toCanvas(ON_DEG));
    ctx.stroke();

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, rodLen - 25, toCanvas(OFF_DEG), toCanvas(ON_DEG));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, rodLen + 25, toCanvas(OFF_DEG), toCanvas(ON_DEG));
    ctx.stroke();
    ctx.restore();

    // Marcas de posição OFF / ON no fim do curso
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const offPt = leverPoint(OFF_DEG, rodLen + 62);
    const onPt = leverPoint(ON_DEG, rodLen + 62);
    ctx.fillStyle = engaged ? '#475569' : '#94a3b8';
    ctx.fillText('OFF', offPt.x, offPt.y);
    ctx.fillStyle = engaged ? '#22c55e' : '#475569';
    ctx.fillText('ON', onPt.x, onPt.y);

    // Eixo (pino central)
    ctx.save();
    const pinGrad = ctx.createRadialGradient(pivotX - 4, pivotY - 4, 2, pivotX, pivotY, 26);
    pinGrad.addColorStop(0, '#cbd5e1');
    pinGrad.addColorStop(0.55, '#64748b');
    pinGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = pinGrad;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Haste de aço (com brilho especular no lado da luz)
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate((degNow * Math.PI) / 180);
    const rodGrad = ctx.createLinearGradient(-13, 0, 13, 0);
    rodGrad.addColorStop(0, '#2b3444');
    rodGrad.addColorStop(0.32, '#8ea3b8');
    rodGrad.addColorStop(0.5, '#cbd5e1');
    rodGrad.addColorStop(0.72, '#6b7f96');
    rodGrad.addColorStop(1, '#1e2836');
    ctx.fillStyle = rodGrad;
    ctx.beginPath();
    ctx.roundRect(-13, 0, 26, rodLen + 10, 6);
    ctx.fill();
    ctx.strokeStyle = '#0d1420';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Faixa vermelha de advertência no meio da haste
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-13, rodLen * 0.44, 26, 18);
    ctx.fillRect(-13, rodLen * 0.60, 26, 18);

    // Empunhadura emborrachada na ponta — deforma levemente sob a mão
    const squeeze = 1 - pull * 0.06;
    const gripGrad = ctx.createLinearGradient(-22, 0, 22, 0);
    gripGrad.addColorStop(0, '#05080e');
    gripGrad.addColorStop(0.35, '#1b2433');
    gripGrad.addColorStop(0.6, '#2b3949');
    gripGrad.addColorStop(1, '#05080e');
    ctx.fillStyle = gripGrad;
    ctx.beginPath();
    ctx.roundRect(-23, rodLen - 6, 46 * squeeze, 62, 12);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ranhuras antiderrapantes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(-19, rodLen + 4 + k * 11);
      ctx.lineTo(19, rodLen + 4 + k * 11);
      ctx.stroke();
    }
    ctx.restore();

    /* ════════ PLANO 1 — A MÃO (nitidez máxima) ════════
       A mão agora é desenhada DENTRO do espaço local da haste: depois de
       translate(pivot) + rotate(ângulo), todo desenho da mão usa coordenadas
       da haste. Assim ela está fisicamente presa à empunhadura e NÃO pode
       "flutuar" — era o defeito da versão anterior, que posicionava a mão
       por coordenadas absolutas calculadas com sinal invertido. */

    // Sombra da mão projetada no próprio quadro elétrico, atrás da haste
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
    ctx.beginPath();
    ctx.ellipse(pivotX + 96, pivotY + rodLen - 6, 70, 62, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Reentra no espaço local da haste (mesma transformação da haste)
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate((degNow * Math.PI) / 180);

    // Espaço local da haste: +Y desce a haste, +X aponta para a lateral direita.
    // A empunhadura termina em rodLen. A mão entra por +X e agarra essa ponta.
    ctx.translate(4 + strain, rodLen - 30);

          // Sombra própria da mão sobre a chapa
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
          ctx.beginPath();
          ctx.ellipse(20, 42, 96, 88, 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Manga da camisa social vindo de baixo/direita
          const sleeve = ctx.createLinearGradient(30, 60, 190, 300);
          sleeve.addColorStop(0, '#cbd5e1');
          sleeve.addColorStop(0.5, '#94a3b8');
          sleeve.addColorStop(1, '#5c6b7d');
          ctx.fillStyle = sleeve;
          ctx.beginPath();
          ctx.moveTo(58, 54);
          ctx.quadraticCurveTo(136, 66, 178, 150);
          ctx.quadraticCurveTo(206, 236, 186, 330);
          ctx.lineTo(54, 330);
          ctx.quadraticCurveTo(30, 220, 58, 54);
          ctx.closePath();
          ctx.fill();

          // Dobras da manga
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.30)';
          ctx.lineWidth = 2.6;
          for (let f = 0; f < 3; f++) {
            ctx.beginPath();
            ctx.moveTo(74 + f * 26, 76);
            ctx.quadraticCurveTo(104 + f * 24, 176, 112 + f * 20, 322);
            ctx.stroke();
          }

          // Punho da camisa
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(56, 52);
          ctx.quadraticCurveTo(116, 40, 158, 104);
          ctx.lineTo(128, 136);
          ctx.quadraticCurveTo(86, 84, 40, 90);
          ctx.closePath();
          ctx.fill();

          // Dorso da mão — contorno anatômico (base larga no punho, afina nos nós)
          const skin = ctx.createLinearGradient(-30, -20, 90, 90);
          skin.addColorStop(0, '#e0a578');
          skin.addColorStop(0.45, '#c98b60');
          skin.addColorStop(1, '#9d6039');
          ctx.fillStyle = skin;
          ctx.beginPath();
          ctx.moveTo(48, 26);                       // punho, lado do pulso
          ctx.bezierCurveTo(4, 6, -34, 22, -42, 58); // dorso subindo até os nós
          ctx.bezierCurveTo(-48, 88, -30, 108, 2, 112);
          ctx.bezierCurveTo(44, 116, 74, 100, 82, 74);
          ctx.bezierCurveTo(88, 52, 76, 34, 48, 26);
          ctx.closePath();
          ctx.fill();

          // Sombreamento do dorso (luz vem de cima/esquerda)
          ctx.save();
          ctx.clip();
          const dorsal = ctx.createLinearGradient(-40, 10, 60, 110);
          dorsal.addColorStop(0, 'rgba(255, 226, 198, 0.30)');
          dorsal.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
          dorsal.addColorStop(1, 'rgba(92, 47, 20, 0.35)');
          ctx.fillStyle = dorsal;
          ctx.fillRect(-60, -20, 180, 150);

          // Metacarpos: as cristas que aparecem quando a mão aperta
          ctx.strokeStyle = 'rgba(120, 63, 34, 0.35)';
          ctx.lineWidth = 2.2;
          for (let m = 0; m < 4; m++) {
            ctx.beginPath();
            ctx.moveTo(-6 + m * 15, 46);
            ctx.quadraticCurveTo(2 + m * 14, 74, 6 + m * 12, 100);
            ctx.stroke();
          }
          ctx.restore();

          // ── DEDOS COM FALANGES ──
          // Cada dedo: 3 segmentos dobrando em volta da empunhadura (curvatura real).
          // O índice (topo) e o mínimo (base) são mais curtos — anatomia correta.
          const fingerSpec = [
            { y: 22, len: 40, thick: 20, curl: 0.62 },  // indicador
            { y: 48, len: 46, thick: 21, curl: 0.74 },  // médio
            { y: 74, len: 42, thick: 20, curl: 0.80 },  // anelar
            { y: 98, len: 34, thick: 18, curl: 0.72 }   // mínimo
          ];
          const compression = 1 + pull * 0.09;          // aperta mais conforme puxa

          fingerSpec.forEach((f, i) => {
            const baseX = 66;                            // sai do dorso, à direita
            const seg1 = f.len * 0.42 * compression;
            const seg2 = f.len * 0.34 * compression;
            const seg3 = f.len * 0.26 * compression;

            ctx.save();
            ctx.translate(baseX, f.y);

            // Segmento 1 (proximal) — vai para a direita e curva um pouco para baixo
            ctx.rotate(f.curl * 0.55);
            const g1 = ctx.createLinearGradient(0, -f.thick / 2, 0, f.thick / 2);
            g1.addColorStop(0, '#e0a578');
            g1.addColorStop(1, '#a96b43');
            ctx.fillStyle = g1;
            ctx.beginPath();
            ctx.roundRect(0, -f.thick / 2, seg1, f.thick, f.thick / 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(120, 63, 34, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Segmento 2 (médio) — dobra mais para envolver a empunhadura
            ctx.translate(seg1, 0);
            ctx.rotate(f.curl * 0.85);
            ctx.fillStyle = g1;
            ctx.beginPath();
            ctx.roundRect(0, -f.thick / 2 + 0.6, seg2, f.thick - 1.2, f.thick / 2);
            ctx.fill();
            ctx.stroke();

            // Segmento 3 (distal) — fecha o punho, unha na ponta
            ctx.translate(seg2, 0);
            ctx.rotate(f.curl * 0.95);
            ctx.fillStyle = '#b9794f';
            ctx.beginPath();
            ctx.roundRect(0, -f.thick / 2 + 1.5, seg3, f.thick - 3, (f.thick - 3) / 2);
            ctx.fill();
            ctx.stroke();

            // Unha
            ctx.fillStyle = 'rgba(255, 226, 210, 0.72)';
            ctx.beginPath();
            ctx.roundRect(seg3 - 5, -f.thick / 2 + 3.5, 5, f.thick - 7, 2.5);
            ctx.fill();

            // Nó da articulação (knuckle) no dorso
            ctx.fillStyle = 'rgba(160, 98, 58, 0.55)';
            ctx.beginPath();
            ctx.arc(0, 0, f.thick * 0.30, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          });

          // ── POLEGAR opositor (cruza a frente, por cima dos dedos) ──
          ctx.save();
          ctx.translate(30, 8);
          ctx.rotate(0.42 + pull * 0.10);
          const thumb = ctx.createLinearGradient(0, -14, 0, 16);
          thumb.addColorStop(0, '#e0a578');
          thumb.addColorStop(1, '#a96b43');
          ctx.fillStyle = thumb;
          ctx.beginPath();
          ctx.roundRect(-8, -13, 66, 26, 13);
          ctx.fill();
          ctx.strokeStyle = 'rgba(120, 63, 34, 0.45)';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Articulação do polegar
          ctx.fillStyle = 'rgba(160, 98, 58, 0.42)';
          ctx.beginPath();
          ctx.arc(24, 0, 6, 0, Math.PI * 2);
          ctx.fill();

          // Unha do polegar
          ctx.fillStyle = 'rgba(255, 226, 210, 0.70)';
          ctx.beginPath();
          ctx.roundRect(50, -8, 6, 16, 3);
          ctx.fill();
          ctx.restore();

          // Tendões em relevo (só com esforço)
          if (pull > 0.15) {
            ctx.strokeStyle = `rgba(150, 88, 52, ${(0.34 * pull).toFixed(2)})`;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(34, 34);
            ctx.quadraticCurveTo(12, 58, 16, 94);
            ctx.moveTo(46, 30);
            ctx.quadraticCurveTo(26, 58, 30, 98);
            ctx.stroke();
          }

          // Luz fria do capacitor subindo pela pele
          if (glow > 0.02) {
            const handGlow = ctx.createRadialGradient(10, 60, 6, 10, 60, 150);
            handGlow.addColorStop(0, `rgba(187, 247, 208, ${(0.22 * glow).toFixed(2)})`);
            handGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
            ctx.fillStyle = handGlow;
            ctx.beginPath();
            ctx.arc(10, 60, 150, 0, Math.PI * 2);
            ctx.fill();
          }

    ctx.restore(); // fim da mão

    /* ════════ LEDS DAS 3 FASES ════════ */
    const ledY = boxY + boxH - 150;
    for (let l = 0; l < 3; l++) {
      const on = engaged && glow > l * 0.26;
      const lx = boxX + 132 + l * 168;

      ctx.fillStyle = '#070c14';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(lx, ledY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (on) {
        const halo = ctx.createRadialGradient(lx, ledY, 2, lx, ledY, 54);
        halo.addColorStop(0, 'rgba(190, 255, 210, 1)');
        halo.addColorStop(0.32, 'rgba(34, 197, 94, 0.8)');
        halo.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(lx, ledY, 54, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#bbf7d0';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(lx, ledY, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#12301f';
        ctx.beginPath();
        ctx.arc(lx, ledY, 17, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RST'[l], lx, ledY + 58);
    }

    /* ════════ FAÍSCA ÚNICA NO CONTATO ════════ */
    if (sinceContact > 0 && sinceContact < 0.16) {
      const a = 1 - sinceContact / 0.16;
      const sx = pivotX + 14;
      const sy = pivotY + 26;
      ctx.strokeStyle = `rgba(224, 242, 254, ${a.toFixed(2)})`;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 7, sy - 6);
      ctx.lineTo(sx + 13, sy + 3);
      ctx.lineTo(sx + 19, sy - 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Vinheta
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.30, W / 2, H / 2, H * 0.76);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(2, 6, 23, 0.76)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();
  };

  (global.StudioScenes = global.StudioScenes || { define() {} });
  global.StudioScenes.define('alavanca_macro', {
    meta: {
      nome: 'Macro · Mão na Alavanca do Reator',
      angulo: 'close-up frontal',
      profundidade: 'parede → quadro → mão',
      criadoEm: '2026-11-04',
      pinned: true
    },
    draw
  });
})(typeof window !== 'undefined' ? window : globalThis);
