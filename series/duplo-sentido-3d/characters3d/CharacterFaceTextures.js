/**
 * CharacterFaceTextures.js — Gerador Dinâmico de Texturas Faciais Vetoriais para os Rigs 3D
 * Série: Condomínio Solaris: Bloco C
 *
 * Renderiza em Canvas 2D de alta definição (512x512) os rostos fiéis
 * aos designs originais dos personagens em 2D, com proporções cartoon GRANDES e EXPRESSIVAS:
 * - Olhos amendoados marcantes (25-30% da largura da face) com íris rica e duplo brilho especular cartoon
 * - Cavidades oculares sombreadas e rugas anatômicas
 * - Sobrancelhas espessas e expressivas que reagem às emoções
 * - Óculos de grau retangulares grandes com reflexo esmeralda CRT de monitor CFTV
 * - Bigode volumoso grisalho icônico de Seu Valdir
 * - Focinho canino fofo com olhos anime grandes de Paçoca
 * - Delineado gatinho, óculos dourados e lábios terracota de Dona Camila
 * - Capacete aberto esportivo e feições de pânico/adrenalina de Lucas
 * - Franjas e linhas capilares perfeitamente integradas no Canvas para eliminar artefatos 3D
 * - Suporte dinâmico a Lip-Sync e piscar de olhos
 */
(function (global) {
  'use strict';

  const CharacterFaceTextures = {
    /**
     * Rosto 1: VOCÊ (Morador do Apto 302 — Jovem 24 anos)
     */
    drawVoceFace(ctx, opt = {}) {
      const W = 512, H = 512;
      ctx.clearRect(0, 0, W, H);

      const emotion = opt.emotion || 'tense';
      const mouthOpen = Math.max(0, Math.min(1, opt.mouthOpen || 0));
      const isBlinking = !!opt.isBlinking;
      const isShock = emotion === 'shocked' || emotion === 'scared' || emotion === 'panic';

      // Fundo 100% transparente para encaixe perfeito sobre a geometria da cabeça 3D

      // ─── FRANJA DO CABELO UNDERCUT NO TOPO DA TEXTURA (Perfeito 1:1 com o traço 2D) ───
      const hairGrad = ctx.createLinearGradient(256, 0, 256, 175);
      hairGrad.addColorStop(0, '#272038');
      hairGrad.addColorStop(1, '#120e1c');
      ctx.fillStyle = hairGrad;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(512, 0);
      ctx.lineTo(512, 85);
      ctx.lineTo(445, 70);
      ctx.lineTo(395, 145); // Dente 5
      ctx.lineTo(345, 80);
      ctx.lineTo(295, 168); // Dente 4
      ctx.lineTo(256, 82);
      ctx.lineTo(210, 160); // Dente 3
      ctx.lineTo(165, 78);
      ctx.lineTo(115, 142); // Dente 2
      ctx.lineTo(65, 70);
      ctx.lineTo(0, 85);
      ctx.closePath();
      ctx.fill();

      // Sombra sutil sob a franja na testa
      ctx.strokeStyle = 'rgba(18, 14, 28, 0.40)';
      ctx.lineWidth = 4.0;
      ctx.stroke();

      // ─── 1. SOMBRA DA CAVIDADE OCULAR (Olheiras de tensão) ───
      const eyeY = 255;
      const eyeSpacing = 126;
      const eyeW = isShock ? 74 : 68;
      const eyeH = isShock ? 58 : 50;

      [-eyeSpacing, eyeSpacing].forEach(offset => {
        const ex = 256 + offset;
        const sockGrad = ctx.createRadialGradient(ex, eyeY, 20, ex, eyeY, 82);
        sockGrad.addColorStop(0, 'rgba(158, 100, 60, 0.45)');
        sockGrad.addColorStop(0.7, 'rgba(158, 100, 60, 0.15)');
        sockGrad.addColorStop(1, 'rgba(158, 100, 60, 0)');
        ctx.fillStyle = sockGrad;
        ctx.beginPath();
        ctx.arc(ex, eyeY + 6, 82, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 2. OLHOS GRANDES AMENDOADOS CARTOON (Com contorno marcante) ───
      [-eyeSpacing, eyeSpacing].forEach((offset, idx) => {
        const eyeX = 256 + offset;
        const isRight = idx === 1;

        if (isBlinking) {
          // Pálpebra fechada arqueada
          ctx.strokeStyle = '#181118';
          ctx.lineWidth = 8.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(eyeX - eyeW * 0.95, eyeY);
          ctx.quadraticCurveTo(eyeX, eyeY + 18, eyeX + eyeW * 0.95, eyeY);
          ctx.stroke();

          ctx.strokeStyle = '#854d27';
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(eyeX - eyeW * 0.8, eyeY - 10);
          ctx.quadraticCurveTo(eyeX, eyeY - 18, eyeX + eyeW * 0.8, eyeY - 10);
          ctx.stroke();
        } else {
          // Esclera branca
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dobra da pálpebra superior
          ctx.strokeStyle = '#7c431f';
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY - 12, eyeW * 0.9, eyeH * 0.8, 0, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();

          // Íris castanha rica e grande
          const irisR = isShock ? 38 : 34;
          const irisX = eyeX + (isRight ? -4 : 4);
          const irisY = eyeY + 2;

          const irisGrad = ctx.createRadialGradient(irisX, irisY - 5, 5, irisX, irisY, irisR);
          irisGrad.addColorStop(0, '#78350f');
          irisGrad.addColorStop(0.6, '#451a03');
          irisGrad.addColorStop(1, '#1c0a00');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
          ctx.fill();

          // Pupila preta reativa
          const pupilR = isShock ? 22 : 17;
          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.arc(irisX, irisY, pupilR, 0, Math.PI * 2);
          ctx.fill();

          // Contorno escuro da pálpebra e cílios superiores marcantes
          ctx.strokeStyle = '#181118';
          ctx.lineWidth = 9.0;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY - 3, eyeW + 2, eyeH + 2, 0, Math.PI + 0.18, -0.18);
          ctx.stroke();

          // Contorno suave inferior
          ctx.strokeStyle = 'rgba(24, 17, 24, 0.45)';
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY + 3, eyeW, eyeH, 0, 0.22, Math.PI - 0.22);
          ctx.stroke();

          // Duplo brilho especular branco característico do 2D
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(irisX - 11, irisY - 11, 11.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(irisX + 11, irisY + 9, 6.0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ─── 3. SOBRANCELHAS ESPESSAS E ANGULARES (#161219) ───
      const browY = isShock ? 172 : 188;
      [-eyeSpacing, eyeSpacing].forEach((offset, idx) => {
        const browX = 256 + offset;
        const isRight = idx === 1;

        ctx.strokeStyle = '#161219';
        ctx.fillStyle = '#161219';
        ctx.lineWidth = 16.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        if (isShock) {
          if (!isRight) {
            ctx.moveTo(browX - 62, browY + 16);
            ctx.quadraticCurveTo(browX, browY - 28, browX + 60, browY - 8);
          } else {
            ctx.moveTo(browX - 60, browY - 8);
            ctx.quadraticCurveTo(browX, browY - 28, browX + 62, browY + 16);
          }
        } else if (emotion === 'smirk') {
          if (!isRight) {
            // Sobrancelha esquerda arqueada marota (Pixar smirk)
            ctx.moveTo(browX - 58, browY + 4);
            ctx.quadraticCurveTo(browX, browY - 42, browX + 58, browY - 10);
          } else {
            ctx.moveTo(browX - 56, browY + 10);
            ctx.quadraticCurveTo(browX, browY + 2, browX + 56, browY + 14);
          }
        } else if (emotion === 'happy') {
          ctx.moveTo(browX - 58, browY - 12);
          ctx.quadraticCurveTo(browX, browY - 28, browX + 58, browY - 12);
        } else if (emotion === 'determined' || emotion === 'command') {
          if (!isRight) {
            ctx.moveTo(browX - 62, browY - 12);
            ctx.quadraticCurveTo(browX, browY + 8, browX + 60, browY + 18);
          } else {
            ctx.moveTo(browX - 60, browY + 18);
            ctx.quadraticCurveTo(browX, browY + 8, browX + 62, browY - 12);
          }
        } else {
          if (!isRight) {
            ctx.moveTo(browX - 58, browY - 5);
            ctx.quadraticCurveTo(browX, browY - 16, browX + 58, browY + 8);
          } else {
            ctx.moveTo(browX - 58, browY + 8);
            ctx.quadraticCurveTo(browX, browY - 16, browX + 58, browY - 5);
          }
        }
        ctx.stroke();
      });

      // ─── 4. NARIZ ESCULPIDO JOVEM ───
      const noseY = 328;
      ctx.strokeStyle = '#7c431f';
      ctx.lineWidth = 5.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(254, 268);
      ctx.lineTo(256, noseY - 8);
      ctx.quadraticCurveTo(278, noseY + 2, 256, noseY + 8);
      ctx.quadraticCurveTo(234, noseY + 2, 242, noseY - 8);
      ctx.stroke();

      // Sombra sob a ponta do nariz
      ctx.fillStyle = 'rgba(124, 67, 31, 0.45)';
      ctx.beginPath();
      ctx.ellipse(256, noseY + 16, 18, 7.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // ─── 5. BOCA ARTICULADA COM LIP-SYNC REAL ───
      const mouthY = 412;
      if (mouthOpen > 0.04) {
        const openAmt = Math.max(0, Math.min(1, (mouthOpen - 0.04) / 0.96));
        const mw = 38 + openAmt * 48;
        const mh = 7 + openAmt * 48;

        ctx.save();
        ctx.fillStyle = '#220606';
        ctx.strokeStyle = '#5a1e0b';
        ctx.lineWidth = 6.0;
        ctx.beginPath();
        ctx.ellipse(256, mouthY, mw, mh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.clip();

        // Dentes superiores brancos proporcionais
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(256 - mw * 0.85, mouthY - mh, mw * 1.7, Math.max(6, mh * 0.62));

        // Língua avermelhada proporcional
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + mh * 0.46, mw * 0.72, Math.max(4, mh * 0.60), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (emotion === 'smirk') {
        ctx.strokeStyle = '#5a1e0b';
        ctx.lineWidth = 6.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(204, mouthY + 4);
        ctx.quadraticCurveTo(262, mouthY + 14, 314, mouthY - 14);
        ctx.stroke();
      } else if (emotion === 'happy') {
        ctx.strokeStyle = '#5a1e0b';
        ctx.lineWidth = 7.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(198, mouthY - 6);
        ctx.quadraticCurveTo(256, mouthY + 28, 314, mouthY - 6);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#5a1e0b';
        ctx.lineWidth = 6.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(206, mouthY);
        ctx.quadraticCurveTo(256, mouthY + 8, 306, mouthY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(124, 67, 31, 0.35)';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(228, mouthY + 14);
        ctx.quadraticCurveTo(256, mouthY + 18, 284, mouthY + 14);
        ctx.stroke();
      }

      // Gota de Suor Frio em Pânico
      if (isShock) {
        const dropY = 190 + ((opt.time ? opt.time * 50 : 0) % 90);
        ctx.fillStyle = 'rgba(224, 242, 254, 0.95)';
        ctx.beginPath();
        ctx.ellipse(108, dropY, 9.0, 18.0, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    /**
     * Rosto 2: SEU VALDIR (Porteiro — 61 anos)
     */
    drawValdirFace(ctx, opt = {}) {
      const W = 512, H = 512;
      ctx.clearRect(0, 0, W, H);

      const mouthOpen = Math.max(0, Math.min(1, opt.mouthOpen || 0));
      const isBlinking = !!opt.isBlinking;
      const em = opt.emotion || 'worried';
      const isDetermined = em === 'determined' || em === 'command';
      const isPanic = em === 'panicked' || em === 'panic' || em === 'worried' || em === 'tense' || em === 'scared' || em === 'shocked';

      // Fundo 100% transparente para encaixe perfeito sobre a geometria da cabeça 3D

      // ─── 1. RUGAS DE EXPRESSÃO NA TESTA (61 anos) ───
      ctx.strokeStyle = 'rgba(120, 65, 30, 0.65)';
      ctx.lineWidth = 4.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(150, 95); ctx.quadraticCurveTo(256, 80, 362, 95);
      ctx.moveTo(165, 120); ctx.quadraticCurveTo(256, 106, 347, 120);
      ctx.moveTo(185, 145); ctx.quadraticCurveTo(256, 134, 327, 145);
      ctx.stroke();

      // ─── 2. SOBRANCELHAS GRISALHAS VOLUMOSAS (#94a3b8 com fios #f8fafc) ───
      const browY = isPanic ? 170 : (isDetermined ? 182 : 185);
      const eyeSpacing = 125;
      [-eyeSpacing, eyeSpacing].forEach((offset, idx) => {
        const bx = 256 + offset;
        const isRight = idx === 1;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 18.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (isDetermined) {
          if (!isRight) {
            ctx.moveTo(bx - 60, browY - 12); ctx.quadraticCurveTo(bx, browY + 6, bx + 60, browY + 16);
          } else {
            ctx.moveTo(bx - 60, browY + 16); ctx.quadraticCurveTo(bx, browY + 6, bx + 60, browY - 12);
          }
        } else if (isPanic) {
          if (!isRight) {
            ctx.moveTo(bx - 60, browY + 12); ctx.quadraticCurveTo(bx, browY - 24, bx + 60, browY - 10);
          } else {
            ctx.moveTo(bx - 60, browY - 10); ctx.quadraticCurveTo(bx, browY - 24, bx + 60, browY + 12);
          }
        } else {
          ctx.moveTo(bx - 58, browY); ctx.quadraticCurveTo(bx, browY - 10, bx + 58, browY);
        }
        ctx.stroke();

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(bx - 32, browY - 4); ctx.lineTo(bx + 32, browY - 4);
        ctx.stroke();
      });

      // ─── 3. OLHOS MADUROS & ÓCULOS DE GRAU GRANDES COM REFLEXO ESMERALDA CRT ───
      const eyeY = 255;
      const has3DGlasses = opt.has3DGlasses !== undefined ? opt.has3DGlasses : true;
      [-eyeSpacing, eyeSpacing].forEach((offset) => {
        const eyeX = 256 + offset;
        if (!isBlinking) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, 52, 38, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 26, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX - 8, eyeY - 8, 8.0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 6.5;
          ctx.beginPath();
          ctx.moveTo(eyeX - 42, eyeY); ctx.lineTo(eyeX + 42, eyeY);
          ctx.stroke();
        }

        // Pés de galinha e rugas ao redor dos olhos (61 anos)
        ctx.strokeStyle = 'rgba(120, 65, 30, 0.45)';
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const sign = offset < 0 ? -1 : 1;
        ctx.moveTo(eyeX + sign * 52, eyeY - 10);
        ctx.lineTo(eyeX + sign * 78, eyeY - 20);
        ctx.moveTo(eyeX + sign * 54, eyeY + 2);
        ctx.lineTo(eyeX + sign * 82, eyeY + 4);
        ctx.moveTo(eyeX + sign * 50, eyeY + 14);
        ctx.lineTo(eyeX + sign * 75, eyeY + 24);
        ctx.stroke();

        if (!has3DGlasses) {
          // ARO DOS ÓCULOS 2D APENAS SE NÃO HOUVER ÓCULOS 3D
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 9.0;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.20)';
          ctx.beginPath();
          ctx.roundRect(eyeX - 82, eyeY - 56, 164, 112, 22);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.roundRect(eyeX - 76, eyeY - 50, 152, 100, 18);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(167, 243, 208, 0.85)';
          ctx.lineWidth = 6.0;
          ctx.beginPath();
          ctx.moveTo(eyeX - 56, eyeY - 38);
          ctx.lineTo(eyeX + 32, eyeY + 38);
          ctx.stroke();
        }
      });

      if (!has3DGlasses) {
        // Ponte metálica entre as lentes 2D
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 9.0;
        ctx.beginPath();
        ctx.moveTo(256 - 44, eyeY - 14);
        ctx.quadraticCurveTo(256, eyeY - 28, 256 + 44, eyeY - 14);
        ctx.stroke();
      }

      // ─── 4. NARIZ MADURO ───
      ctx.strokeStyle = '#854d27';
      ctx.lineWidth = 5.6;
      ctx.beginPath();
      ctx.moveTo(256, 250);
      ctx.lineTo(256, 325);
      ctx.quadraticCurveTo(280, 332, 256, 340);
      ctx.quadraticCurveTo(232, 332, 240, 325);
      ctx.stroke();

      // ─── 5. BIGODE CHEIO GRISALHO ÍCONE DE SEU VALDIR (#cbd5e1 a #94a3b8) ───
      const mustY = 355;
      const mustGrad = ctx.createLinearGradient(120, mustY, 392, mustY + 65);
      mustGrad.addColorStop(0, '#f8fafc');
      mustGrad.addColorStop(0.5, '#cbd5e1');
      mustGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = mustGrad;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3.8;

      ctx.beginPath();
      ctx.moveTo(256, mustY);
      ctx.bezierCurveTo(305, mustY - 8, 385, mustY + 18, 395, mustY + 54);
      ctx.bezierCurveTo(355, mustY + 70, 285, mustY + 58, 256, mustY + 30);
      ctx.bezierCurveTo(227, mustY + 58, 157, mustY + 70, 117, mustY + 54);
      ctx.bezierCurveTo(127, mustY + 18, 207, mustY - 8, 256, mustY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fios prateados no bigode
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      [[-85, 22], [-50, 35], [-18, 14], [18, 14], [50, 35], [85, 22]].forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.moveTo(256 + ox - 24, mustY + oy - 8);
        ctx.lineTo(256 + ox + 24, mustY + oy + 8);
        ctx.stroke();
      });

      // ─── 6. BOCA ARTICULADA SOB O BIGODE ───
      const mouthY = 430;
      if (mouthOpen > 0.04) {
        const openAmt = Math.max(0, Math.min(1, (mouthOpen - 0.04) / 0.96));
        const mw = 38 + openAmt * 44;
        const mh = 8 + openAmt * 48;
        ctx.save();
        ctx.fillStyle = '#220404';
        ctx.beginPath();
        ctx.ellipse(256, mouthY, mw, mh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.clip();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(256 - mw * 0.75, mouthY - mh, mw * 1.5, mh * 0.65);

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + mh * 0.45, mw * 0.7, mh * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.strokeStyle = 'rgba(90, 30, 11, 0.72)';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(226, mouthY + 2);
        ctx.quadraticCurveTo(256, mouthY + 7, 286, mouthY + 2);
        ctx.stroke();
      }
    },

    /**
     * Rosto 3: PAÇOCA (Vira-lata Caramelo)
     */
    drawPacocaFace(ctx, opt = {}) {
      const W = 512, H = 512;
      ctx.clearRect(0, 0, W, H);

      const isBarking = !!opt.isBarking;
      const mouthOpen = Math.max(0, Math.min(1, opt.mouthOpen || (isBarking ? 0.8 : 0)));

      // ─── 1. MANCHA CARAMELO DO FOCINHO & FOCINHO REDONDO (Primeiro, como base) ───
      const snoutGrad = ctx.createRadialGradient(256, 335, 25, 256, 335, 195);
      snoutGrad.addColorStop(0, '#f59e0b');
      snoutGrad.addColorStop(0.5, '#d97706');
      snoutGrad.addColorStop(0.85, '#b45309');
      snoutGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = snoutGrad;
      ctx.beginPath();
      ctx.ellipse(256, 335, 185, 135, 0, 0, Math.PI * 2);
      ctx.fill();

      // ─── 2. GRANDES OLHOS ANIME EXPRESSIVOS FOFO-CANINOS (Com destaque nítido) ───
      const eyeY = 205;
      const eyeSpacing = 120;
      [-eyeSpacing, eyeSpacing].forEach((ox) => {
        const ex = 256 + ox;

        // Fundo negro profundo
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, 56, 58, 0, 0, Math.PI * 2);
        ctx.fill();

        // Íris castanha quente
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(ex, eyeY - 5, 44, 0, Math.PI * 2);
        ctx.fill();

        // Pupila preta
        ctx.fillStyle = '#050505';
        ctx.beginPath();
        ctx.arc(ex, eyeY - 5, 28, 0, Math.PI * 2);
        ctx.fill();

        // Grande brilho branco fofo anime/cartoon
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex - 15, eyeY - 18, 18.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ex + 16, eyeY + 14, 8.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 3. TRUFA PRETA BRILHANTE COM ESPECULAR ───
      const noseY = 300;
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.roundRect(256 - 58, noseY - 34, 116, 68, 28);
      ctx.fill();

      // Narinas
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(256 - 26, noseY + 6, 8, 13, 0.2, 0, Math.PI * 2);
      ctx.ellipse(256 + 26, noseY + 6, 8, 13, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Brilho úmido na trufa
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(256 - 15, noseY - 14, 22, 8.0, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Sulco nasolabial
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6.0;
      ctx.beginPath();
      ctx.moveTo(256, noseY + 34);
      ctx.lineTo(256, noseY + 62);
      ctx.stroke();

      // Pontos de Bigode (Whisker dots)
      ctx.fillStyle = '#78350f';
      [[-65, 360], [-88, 372], [-60, 388], [65, 360], [88, 372], [60, 388]].forEach(([wx, wy]) => {
        ctx.beginPath();
        ctx.arc(256 + wx, wy, 4.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 4. BOCA / LÍNGUA CANINA FOFA ───
      const mouthY = 398;
      if (mouthOpen > 0.05) {
        ctx.save();
        ctx.fillStyle = '#220404';
        ctx.beginPath();
        ctx.ellipse(256, mouthY, 58, 26 + mouthOpen * 48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.clip();

        // Dentes caninos afiados brancos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(218, mouthY - 24); ctx.lineTo(228, mouthY + 8); ctx.lineTo(238, mouthY - 24);
        ctx.moveTo(274, mouthY - 24); ctx.lineTo(284, mouthY + 8); ctx.lineTo(294, mouthY - 24);
        ctx.fill();

        // Língua cor-de-rosa fofa (#f43f5e)
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 30, 44, 46, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 6.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(190, mouthY - 10);
        ctx.quadraticCurveTo(225, mouthY + 18, 256, mouthY + 8);
        ctx.quadraticCurveTo(287, mouthY + 18, 322, mouthY - 10);
        ctx.stroke();
      }
    },

    /**
     * Rosto 4: LUCAS (Entregador de Aplicativo — 21 anos)
     */
    drawLucasFace(ctx, opt = {}) {
      const W = 512, H = 512;
      ctx.clearRect(0, 0, W, H);

      const mouthOpen = Math.max(0, Math.min(1, opt.mouthOpen || 0));
      const isBlinking = !!opt.isBlinking;
      const isPanic = opt.emotion === 'terrified' || opt.emotion === 'scared' || opt.emotion === 'panic' || opt.emotion === 'alert';

      // Fundo 100% transparente para encaixe perfeito sobre a geometria da cabeça 3D

      // Franja de cabelo escuro suave no topo da testa sob a borda do capacete
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(80, 35);
      ctx.quadraticCurveTo(150, 82, 190, 48);
      ctx.quadraticCurveTo(250, 96, 300, 52);
      ctx.quadraticCurveTo(365, 88, 432, 40);
      ctx.lineTo(432, 0);
      ctx.lineTo(80, 0);
      ctx.closePath();
      ctx.fill();

      // ─── 1. OLHOS DETERMINADOS / ARREGALADOS ───
      const eyeY = 245;
      const eyeSpacing = 112;
      const eyeW = isPanic ? 66 : 58;
      const eyeH = isPanic ? 52 : 44;

      [-eyeSpacing, eyeSpacing].forEach((offset) => {
        const ex = 256 + offset;
        if (!isBlinking) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(ex, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 8.0;
          ctx.beginPath();
          ctx.ellipse(ex, eyeY - 2, eyeW, eyeH, 0, Math.PI + 0.1, -0.1);
          ctx.stroke();

          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(ex, eyeY, isPanic ? 28 : 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex - 10, eyeY - 10, 10.0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 7.5;
          ctx.beginPath();
          ctx.moveTo(ex - 42, eyeY); ctx.lineTo(ex + 42, eyeY);
          ctx.stroke();
        }
      });

      // ─── 2. SOBRANCELHAS MARCADAS COM ÂNGULO ESPORTIVO ───
      const browY = isPanic ? 165 : 180;
      [-eyeSpacing, eyeSpacing].forEach((offset, idx) => {
        const bx = 256 + offset;
        const isRight = idx === 1;
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 16.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (!isRight) {
          ctx.moveTo(bx - 56, browY - 14); ctx.quadraticCurveTo(bx, browY + 6, bx + 56, browY + 16);
        } else {
          ctx.moveTo(bx - 56, browY + 16); ctx.quadraticCurveTo(bx, browY + 6, bx + 56, browY - 14);
        }
        ctx.stroke();
      });

      // ─── 3. NARIZ JOVEM FIRME E LIMPO ───
      ctx.strokeStyle = '#854d27';
      ctx.lineWidth = 4.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(254, 265);
      ctx.lineTo(260, 316);
      ctx.lineTo(248, 322);
      ctx.stroke();

      // Sombra sutil sob a ponta do nariz
      ctx.fillStyle = 'rgba(133, 77, 39, 0.22)';
      ctx.beginPath();
      ctx.ellipse(256, 326, 14, 5.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // ─── 4. BOCA JOVEM COM TRANSMISSÃO HT ───
      const mouthY = 405;
      if (mouthOpen > 0.05) {
        ctx.save();
        ctx.fillStyle = '#220404';
        ctx.beginPath();
        ctx.ellipse(256, mouthY, 48 + mouthOpen * 36, 22 + mouthOpen * 44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.clip();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(195, mouthY - 38, 122, 22);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 20, 32, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.strokeStyle = '#5a1e0b';
        ctx.lineWidth = 6.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(214, mouthY); ctx.lineTo(298, mouthY);
        ctx.stroke();
      }
    },

    /**
     * Rosto 5: DONA CAMILA (Vizinha do 304 — Elegante 48 anos)
     */
    drawCamilaFace(ctx, opt = {}) {
      const W = 512, H = 512;
      ctx.clearRect(0, 0, W, H);

      const mouthOpen = Math.max(0, Math.min(1, opt.mouthOpen || 0));
      const isBlinking = !!opt.isBlinking;
      const emotion = opt.emotion || 'alert';

      // Fundo 100% transparente para encaixe perfeito sobre a geometria da cabeça 3D

      // ─── 1. OLHOS AMENDOADOS COM DELINEADOR GATINHO ───
      const eyeY = 250;
      const eyeSpacing = 125;
      [-eyeSpacing, eyeSpacing].forEach((offset, idx) => {
        const ex = 256 + offset;
        const isRight = idx === 1;

        if (!isBlinking) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(ex, eyeY, 65, 48, 0, 0, Math.PI * 2);
          ctx.fill();

          // Delineador gatinho marcante
          ctx.strokeStyle = '#0d070e';
          ctx.lineWidth = 8.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.ellipse(ex, eyeY - 4, 65, 48, 0, Math.PI + 0.12, -0.12);
          ctx.stroke();

          // Puxado do gatinho no canto externo
          const lashX = isRight ? ex + 66 : ex - 66;
          ctx.strokeStyle = '#0d070e';
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          ctx.moveTo(lashX, eyeY - 8);
          ctx.lineTo(isRight ? lashX + 22 : lashX - 22, eyeY - 24);
          ctx.stroke();

          // Íris castanha escura
          ctx.fillStyle = '#2b1408';
          ctx.beginPath();
          ctx.arc(ex, eyeY, 34, 0, Math.PI * 2);
          ctx.fill();

          // Brilhos
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex - 10, eyeY - 10, 11.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + 12, eyeY + 10, 6.0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#0d070e';
          ctx.lineWidth = 8.5;
          ctx.beginPath();
          ctx.moveTo(ex - 52, eyeY);
          ctx.quadraticCurveTo(ex, eyeY + 16, ex + 52, eyeY);
          ctx.stroke();
        }
      });

      // ─── RUBOR JOVEM NAS MAÇÃS DO ROSTO (BLUSH SUAVE 25 ANOS) ───
      [-eyeSpacing, eyeSpacing].forEach(offset => {
        const bx = 256 + offset;
        const blushGrad = ctx.createRadialGradient(bx, 310, 4, bx, 310, 52);
        blushGrad.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
        blushGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
        ctx.fillStyle = blushGrad;
        ctx.beginPath();
        ctx.ellipse(bx, 310, 52, 32, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 2. SOBRANCELHAS BEM-DELINEADAS ARQUEADAS ───
      const browY = 175;
      [-eyeSpacing, eyeSpacing].forEach((offset, idx) => {
        const bx = 256 + offset;
        const isRight = idx === 1;
        ctx.strokeStyle = '#140d14';
        ctx.lineWidth = 11.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (!isRight) {
          ctx.moveTo(bx - 62, browY + 8); ctx.quadraticCurveTo(bx - 8, browY - 24, bx + 62, browY + 2);
        } else {
          ctx.moveTo(bx - 62, browY + 2); ctx.quadraticCurveTo(bx + 8, browY - 24, bx + 62, browY + 8);
        }
        ctx.stroke();
      });

      // ─── 3. NARIZ ARREBITADO DELICADO E PROPORCIONAL (Fiel ao 2D) ───
      ctx.strokeStyle = '#854625';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(254, 275);
      ctx.lineTo(258, 318);
      ctx.quadraticCurveTo(266, 324, 256, 328);
      ctx.quadraticCurveTo(246, 324, 250, 318);
      ctx.stroke();

      // Sombra suave sob a ponta do nariz (sem contorno grosso)
      ctx.fillStyle = 'rgba(120, 60, 25, 0.20)';
      ctx.beginPath();
      ctx.ellipse(256, 326, 12, 5.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // ─── 4. LÁBIOS CARMIM/TERRACOTA EXPRESSIVOS (#9f3a38) COM LIP-SYNC PROPORCIONAL ───
      const mouthY = 415;
      if (mouthOpen > 0.04) {
        const openAmt = Math.max(0, Math.min(1, (mouthOpen - 0.04) / 0.96));
        const mw = 36 + openAmt * 44;
        const mh = 6 + openAmt * 46;

        ctx.save();
        ctx.fillStyle = '#4c0519';
        ctx.beginPath();
        ctx.ellipse(256, mouthY, mw, mh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.clip();

        // Dentes superiores brancos proporcionais à abertura
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(256 - mw * 0.85, mouthY - mh, mw * 1.7, Math.max(5, mh * 0.58));

        // Língua proporcional
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + mh * 0.46, mw * 0.68, Math.max(4, mh * 0.56), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = '#9f3a38';
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.ellipse(256, mouthY, mw, mh, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const smileLift = emotion === 'happy' ? -8 : (emotion === 'angry' || emotion === 'scared' ? 6 : 0);
        ctx.fillStyle = '#9f3a38';
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.moveTo(206, mouthY + smileLift * 0.5);
        ctx.quadraticCurveTo(235, mouthY - 12, 256, mouthY - 6);
        ctx.quadraticCurveTo(277, mouthY - 12, 306, mouthY + smileLift * 0.5);
        ctx.quadraticCurveTo(256, mouthY + 20 - smileLift * 0.6, 206, mouthY + smileLift * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    },

    /**
     * Gera uma malha curva frontal ultra-precisa e de alta contagem de polígonos
     * perfeitamente alinhada para envolver a face sem distorções horizontais ou Z-fighting.
     */
    createCurvedFaceGeometry(T, opt = {}) {
      const radiusTop = opt.radiusTop || 0.165;
      const radiusBottom = opt.radiusBottom || 0.150;
      const height = opt.height || 0.22;
      const phiSpan = opt.phiSpan !== undefined ? opt.phiSpan : 1.35; // ~77.3 graus frontais concentrados na face
      const segsX = opt.segsX || 36;
      const segsY = opt.segsY || 20;
      const zOffset = opt.zOffset !== undefined ? opt.zOffset : 0.005;

      const geo = new T.BufferGeometry();
      const positions = [];
      const uvs = [];
      const indices = [];

      for (let j = 0; j <= segsY; j++) {
        const v = 1.0 - j / segsY; // v=1 no topo (testa), v=0 na base (queixo)
        const y = -height * 0.5 + v * height;
        const r = radiusBottom + (radiusTop - radiusBottom) * v;

        for (let i = 0; i <= segsX; i++) {
          const u = i / segsX; // u=0 esquerda do observador, u=1 direita do observador
          const phi = -phiSpan * 0.5 + u * phiSpan;
          const x = r * Math.sin(phi);
          const z = r * Math.cos(phi) + zOffset;

          positions.push(x, y, z);
          uvs.push(u, v);
        }
      }

      for (let j = 0; j < segsY; j++) {
        for (let i = 0; i < segsX; i++) {
          const a = j * (segsX + 1) + i;
          const b = (j + 1) * (segsX + 1) + i;
          const c = (j + 1) * (segsX + 1) + (i + 1);
          const d = j * (segsX + 1) + (i + 1);
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }
  };

  global.CharacterFaceTextures = CharacterFaceTextures;
})(typeof window !== 'undefined' ? window : this);
