/**
 * Cenário Modular Reutilizável 05: INTERIOR DA GUARITA (Vista Lateral com Profundidade)
 * Ângulo lateral interno mostrando a profundidade real da guarita blindada
 * Proporção correta: 2.4m largura x 2.8m altura x 3.0m profundidade
 * Camada 0: Parede lateral interna (madeira ripada + isolamento acústico)
 * Camada 1: Bancada de trabalho, monitores CFTV, rádio HT, painel elétrico
 * Camada 2: Janela blindada lateral com vista para a eclusa (vidro trincado)
 * Camada 3: Piso emborrachado antiderrapante, cadeira giratória, extintor
 * Camada 4: Iluminação volumétrica interna (spot LED, glow dos monitores)
 */
(function (global) {
  class InteriorGuaritaLateral {
    constructor(options = {}) {
      this.id = 'INTERIOR_GUARITA_LATERAL';
      this.name = 'Interior Guarita Lateral (Profundidade Real)';
      this.alarmActive = options.alarmActive !== undefined ? options.alarmActive : false;
      this.spotlightOn = options.spotlightOn !== undefined ? options.spotlightOn : false;
      this.blackout = options.blackout !== undefined ? options.blackout : false;
      // BUGFIX: fogDensity nunca era atribuído, então o `|| 0.3` mascarava o valor e a
      // janela lateral ficava com neblina fixa, independente da cena.
      this.fogDensity = options.fogDensity !== undefined ? options.fogDensity : 0.3;
      this.crackLevel = options.crackLevel !== undefined ? options.crackLevel : 0;
      this.time = 0;

      // Estado dos monitores CFTV
      this.cctvFeeds = [
        { label: 'CAM 01 · RUA', active: true },
        { label: 'CAM 02 · ECLUSA', active: true },
        { label: 'CAM 03 · GARAGEM', active: true },
        { label: 'CAM 04 · HALL', active: false }
      ];
    }

    update(dt) {
      this.time += dt;
    }

    /** CAMADA 0: Parede Lateral Interna + Teto Rebaixado */
    drawWallsAndCeiling(ctx) {
      // Teto rebaixado em gesso com sanca LED
      const ceilingGrad = ctx.createLinearGradient(0, 0, 0, 120);
      ceilingGrad.addColorStop(0, '#090d16');
      ceilingGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = ceilingGrad;
      ctx.fillRect(-100, -50, 1280, 170);

      // Sanca de LED (vermelha quando alarme, amarela normal)
      ctx.fillStyle = this.alarmActive ? '#ef4444' : '#fde68a';
      ctx.shadowColor = this.alarmActive ? '#ef4444' : '#fde68a';
      ctx.shadowBlur = this.alarmActive ? 15 : 8;
      ctx.fillRect(-80, 115, 1240, 4);
      ctx.shadowBlur = 0;

      // Parede lateral esquerda (madeira ripada freijó)
      for (let sx = -80; sx < 400; sx += 24) {
        ctx.fillStyle = '#291d16';
        ctx.fillRect(sx, 120, 16, 680);
        ctx.fillStyle = '#3f2e21';
        ctx.fillRect(sx + 3, 120, 5, 680);
      }

      // Parede do fundo (concreto aparente pintado de cinza escuro)
      const backWallGrad = ctx.createLinearGradient(400, 120, 1100, 800);
      backWallGrad.addColorStop(0, '#1a2332');
      backWallGrad.addColorStop(0.5, '#151d2b');
      backWallGrad.addColorStop(1, '#0f1620');
      ctx.fillStyle = backWallGrad;
      ctx.fillRect(400, 120, 700, 680);

      // Rodapé de borracha preta
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-80, 780, 1240, 20);
    }

    /** CAMADA 1: Bancada de Trabalho + Monitores CFTV + Equipamentos */
    drawWorkstation(ctx) {
      // Bancada de granito preto polido (profundidade perspectiva)
      const deskGrad = ctx.createLinearGradient(180, 480, 900, 520);
      deskGrad.addColorStop(0, '#1e293b');
      deskGrad.addColorStop(0.5, '#334155');
      deskGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = deskGrad;
      ctx.beginPath();
      ctx.moveTo(180, 480);
      ctx.lineTo(900, 480);
      ctx.lineTo(920, 520);
      ctx.lineTo(160, 520);
      ctx.closePath();
      ctx.fill();

      // Borda frontal da bancada
      ctx.fillStyle = '#475569';
      ctx.fillRect(160, 518, 760, 6);

      // Suporte dos monitores (braço articulado metálico)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(350, 520);
      ctx.lineTo(350, 380);
      ctx.lineTo(380, 360);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(550, 520);
      ctx.lineTo(550, 370);
      ctx.lineTo(580, 350);
      ctx.stroke();

      // 4 Monitores CFTV empilhados 2x2
      const monitors = [
        { x: 280, y: 260, w: 160, h: 100, feed: 0 },
        { x: 460, y: 250, w: 170, h: 108, feed: 1 },
        { x: 290, y: 370, w: 150, h: 95, feed: 2 },
        { x: 465, y: 365, w: 155, h: 98, feed: 3 }
      ];

      monitors.forEach((mon) => {
        // Moldura do monitor
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.fillRect(mon.x - 4, mon.y - 4, mon.w + 8, mon.h + 8);
        ctx.strokeRect(mon.x - 4, mon.y - 4, mon.w + 8, mon.h + 8);

        // Tela do monitor
        if (this.blackout) {
          ctx.fillStyle = '#020617';
          ctx.fillRect(mon.x, mon.y, mon.w, mon.h);
        } else {
          // Feed CFTV com ruído e scanlines
          const feedGrad = ctx.createLinearGradient(mon.x, mon.y, mon.x, mon.y + mon.h);
          feedGrad.addColorStop(0, '#0a1628');
          feedGrad.addColorStop(0.5, '#0f1d32');
          feedGrad.addColorStop(1, '#081020');
          ctx.fillStyle = feedGrad;
          ctx.fillRect(mon.x, mon.y, mon.w, mon.h);

          // Scanlines CRT
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          for (let sl = mon.y; sl < mon.y + mon.h; sl += 3) {
            ctx.fillRect(mon.x, sl, mon.w, 1);
          }

          // Label do feed
          const feed = this.cctvFeeds[mon.feed];
          if (feed && feed.active) {
            ctx.fillStyle = '#22c55e';
            ctx.font = '700 9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`● ${feed.label}`, mon.x + 6, mon.y + 14);

            // Timestamp piscante
            const tsBlink = Math.sin(this.time * 4) > 0;
            if (tsBlink) {
              ctx.fillStyle = '#f8fafc';
              ctx.textAlign = 'right';
              ctx.fillText('REC', mon.x + mon.w - 6, mon.y + 14);
            }
          } else {
            ctx.fillStyle = '#ef4444';
            ctx.font = '700 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SEM SINAL', mon.x + mon.w / 2, mon.y + mon.h / 2);
          }

          // Glow verde/azul do monitor na bancada
          const screenGlow = ctx.createRadialGradient(
            mon.x + mon.w / 2, mon.y + mon.h, 10,
            mon.x + mon.w / 2, mon.y + mon.h + 40, 80
          );
          screenGlow.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
          screenGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = screenGlow;
          ctx.fillRect(mon.x - 20, mon.y + mon.h, mon.w + 40, 60);
        }
      });

      // HOLOFOTE TÁTICO MILITAR DE 1.000W sobre a bancada (objeto central do Ep. 03)
      this._drawTacticalSpotlight(ctx, 148, 486);

      // Rádio HT Motorola na bancada
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(700, 488, 45, 28);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(704, 492, 37, 18);
      // Display LCD do rádio
      ctx.fillStyle = '#22c55e';
      ctx.font = '600 7px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('CH-04', 708, 504);
      // Antena
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(735, 488);
      ctx.lineTo(738, 468);
      ctx.stroke();
      // LED de status do rádio
      const radioLed = Math.sin(this.time * 6) > 0.3;
      ctx.fillStyle = radioLed ? '#22c55e' : '#064e3b';
      ctx.beginPath();
      ctx.arc(710, 494, 2, 0, Math.PI * 2);
      ctx.fill();

      // Painel elétrico na parede do fundo
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(780, 280, 80, 120);
      ctx.strokeRect(780, 280, 80, 120);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ QUADRO', 820, 298);
      ctx.fillText('ELÉTRICO', 820, 310);

      // Disjuntores internos
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const bx = 792 + col * 32;
          const by = 325 + row * 22;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx, by, 24, 16);
          // Alavanca do disjuntor
          ctx.fillStyle = this.alarmActive ? '#ef4444' : '#22c55e';
          ctx.fillRect(bx + 8, by + 2, 8, 12);
        }
      }
    }

    /**
     * HOLOFOTE TÁTICO MILITAR DE 1.000W — farol de emergência com corpo em liga,
     * alça de transporte, cabo espiral e cone de luz branca. Estado governado por this.spotlightOn.
     */
    _drawTacticalSpotlight(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);

      const on = this.spotlightOn;
      const flicker = on ? (0.86 + Math.sin(this.time * 26) * 0.14) : 1;

      // Cabo espiral enrolado que desce até a bateria de emergência
      ctx.strokeStyle = '#0b1220';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-6, 14);
      ctx.bezierCurveTo(-30, 34, 8, 44, -14, 62);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Corpo cilíndrico em liga de alumínio (cilindro deitado, bocal à direita)
      const bodyGrad = ctx.createLinearGradient(0, -16, 0, 16);
      bodyGrad.addColorStop(0, '#94a3b8');
      bodyGrad.addColorStop(0.35, '#64748b');
      bodyGrad.addColorStop(0.75, '#334155');
      bodyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-4, -15, 74, 30, 8);
      ctx.fill();

      // Cabeçote frontal com aletas de dissipação térmica
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(68, -19, 14, 38, 4);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      for (let fin = 0; fin < 4; fin++) {
        ctx.beginPath();
        ctx.moveTo(70, -16 + fin * 9.5);
        ctx.lineTo(80, -16 + fin * 9.5);
        ctx.stroke();
      }

      // Anel de vedação da lente (paralelo ao eixo de luz)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(80, -22, 10, 44, 4);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(80, -22, 10, 44);

      // Lente de alto rendimento (vidro frontal)
      const lensGrad = ctx.createRadialGradient(90, 0, 2, 90, 0, 24);
      if (on) {
        lensGrad.addColorStop(0, `rgba(255, 255, 255, ${flicker})`);
        lensGrad.addColorStop(0.35, `rgba(254, 249, 195, ${0.9 * flicker})`);
        lensGrad.addColorStop(0.75, 'rgba(125, 211, 252, 0.55)');
        lensGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        lensGrad.addColorStop(0, 'rgba(186, 230, 253, 0.22)');
        lensGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.09)');
        lensGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.ellipse(92, 0, 26, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo incandescente quando ligado
      if (on) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * flicker})`;
        ctx.beginPath();
        ctx.ellipse(92, 0, 7, 13, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Alça de transporte em cima do corpo
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(16, -15);
      ctx.quadraticCurveTo(30, -36, 48, -15);
      ctx.stroke();

      // Bateria de emergência presa à base
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(2, 15, 56, 18, 3);
      ctx.fill();
      ctx.stroke();

      // 3 LEDs de carga (verdes estáveis / âmbar em consumo alto)
      for (let l = 0; l < 3; l++) {
        const lit = on && l < 2 ? true : (Math.sin(this.time * 4 + l) > 0);
        ctx.fillStyle = lit ? (on ? '#f59e0b' : '#22c55e') : '#064e3b';
        ctx.beginPath();
        ctx.arc(10 + l * 9, 24, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Etiqueta de mil watts
      ctx.fillStyle = 'rgba(248, 250, 252, 0.5)';
      ctx.font = '800 6px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('1000W', 26, 4);

      ctx.restore();
    }

    /** CAMADA 2: Janela Blindada Lateral com Vista para Eclusa */
    drawSideWindow(ctx) {
      // Moldura metálica da janela lateral
      ctx.fillStyle = '#334155';
      ctx.fillRect(950, 200, 180, 380);

      // Vidro blindado com gradiente reflexivo
      const glassGrad = ctx.createLinearGradient(958, 208, 1122, 572);
      glassGrad.addColorStop(0, 'rgba(30, 58, 95, 0.7)');
      glassGrad.addColorStop(0.3, 'rgba(51, 65, 85, 0.5)');
      glassGrad.addColorStop(0.7, 'rgba(30, 41, 59, 0.6)');
      glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(958, 208, 164, 364);

      // Vista através da janela: eclusa e rua (simplificada)
      if (!this.blackout) {
        // Céu noturno pela janela
        const skyThrough = ctx.createLinearGradient(958, 208, 958, 400);
        skyThrough.addColorStop(0, '#0a1628');
        skyThrough.addColorStop(1, '#0c1220');
        ctx.fillStyle = skyThrough;
        ctx.fillRect(960, 210, 160, 180);

        // Grade da eclusa visível
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        for (let gx = 970; gx < 1110; gx += 18) {
          ctx.beginPath();
          ctx.moveTo(gx, 390);
          ctx.lineTo(gx, 568);
          ctx.stroke();
        }
        // Barra horizontal da grade
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(960, 460);
        ctx.lineTo(1120, 460);
        ctx.stroke();

        // Neblina visível pela janela
        const fogWin = ctx.createLinearGradient(958, 350, 958, 570);
        fogWin.addColorStop(0, 'rgba(203, 213, 225, 0)');
        fogWin.addColorStop(0.6, `rgba(203, 213, 225, ${this.fogDensity})`);
        fogWin.addColorStop(1, `rgba(148, 163, 184, ${this.fogDensity * 0.8})`);
        ctx.fillStyle = fogWin;
        ctx.fillRect(960, 350, 160, 220);

        // Holofote iluminando a eclusa (se ativo)
        if (this.spotlightOn) {
          const spotThrough = ctx.createRadialGradient(1040, 420, 10, 1040, 420, 120);
          spotThrough.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
          spotThrough.addColorStop(0.5, 'rgba(254, 249, 195, 0.1)');
          spotThrough.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = spotThrough;
          ctx.fillRect(960, 300, 160, 270);
        }
      }

      // Reflexos no vidro
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(970, 220);
      ctx.lineTo(1020, 560);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1080, 215);
      ctx.lineTo(1100, 400);
      ctx.stroke();

      // Moldura interna
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(958, 208, 164, 364);

      // CONTROLE DE CONTINUIDADE: teia de rachaduras herdada das pancadas do Ep. 02
      if (this.crackLevel > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(958, 208, 164, 364);
        ctx.clip();
        const originX = 1040;
        const originY = 390;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.42 + this.crackLevel * 0.38})`;
        ctx.lineWidth = 1.3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 4;
        const branches = 7 + Math.round(this.crackLevel * 6);
        for (let i = 0; i < branches; i++) {
          const ang = (i / branches) * Math.PI * 2 + 0.35;
          const len = (38 + (i % 4) * 22) * (0.6 + this.crackLevel * 0.8);
          const midX = originX + Math.cos(ang) * len * 0.45;
          const midY = originY + Math.sin(ang) * len * 0.45;
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(midX, midY);
          ctx.lineTo(originX + Math.cos(ang + 0.1) * len, originY + Math.sin(ang - 0.1) * len);
          ctx.stroke();
        }
        for (const frac of [0.22, 0.5, 0.78]) {
          ctx.beginPath();
          ctx.arc(originX, originY, 42 * frac * (0.7 + this.crackLevel), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    /** CAMADA 3: Piso Emborrachado + Cadeira + Extintor */
    drawFloorAndFurniture(ctx) {
      // Piso emborrachado antiderrapante com textura
      const floorGrad = ctx.createLinearGradient(0, 800, 0, 960);
      floorGrad.addColorStop(0, '#1a1a2e');
      floorGrad.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(-100, 800, 1280, 160);

      // Textura de piso emborrachado (pontos)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let fx = -80; fx < 1180; fx += 12) {
        for (let fy = 805; fy < 955; fy += 12) {
          if ((fx + fy) % 24 === 0) {
            ctx.fillRect(fx, fy, 2, 2);
          }
        }
      }

      // Cadeira giratória de escritório
      ctx.save();
      ctx.translate(450, 680);
      // Base com rodízios
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      for (let a = 0; a < 5; a++) {
        const angle = (a / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 100);
        ctx.lineTo(Math.cos(angle) * 40, 100 + Math.sin(angle) * 15);
        ctx.stroke();
        // Rodízio
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 40, 100 + Math.sin(angle) * 15, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Pistão hidráulico
      ctx.fillStyle = '#475569';
      ctx.fillRect(-4, 40, 8, 60);
      // Assento
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-35, 20, 70, 25, 8);
      ctx.fill();
      // Encosto
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-30, -40, 60, 65, 10);
      ctx.fill();
      ctx.restore();

      // Extintor de incêndio na parede
      ctx.save();
      ctx.translate(120, 580);
      // Suporte de parede
      ctx.fillStyle = '#475569';
      ctx.fillRect(-8, -20, 16, 10);
      // Corpo do extintor
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-12, -10, 24, 60, 6);
      ctx.fill();
      // Faixa branca
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-11, 10, 22, 8);
      // Manômetro
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      // Mangueira
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -5);
      ctx.quadraticCurveTo(20, 10, 15, 30);
      ctx.stroke();
      ctx.restore();
    }

    /** CAMADA 4: Iluminação Volumétrica Interna */
    drawInteriorLighting(ctx) {
      if (this.blackout) return;

      // Spot LED no teto (cone de luz descendente)
      const spotX = 500, spotY = 120;
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 5, spotX, spotY + 300, 250);
      spotGrad.addColorStop(0, 'rgba(253, 224, 71, 0.15)');
      spotGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.05)');
      spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.moveTo(spotX - 5, spotY);
      ctx.lineTo(spotX - 180, spotY + 500);
      ctx.lineTo(spotX + 180, spotY + 500);
      ctx.lineTo(spotX + 5, spotY);
      ctx.closePath();
      ctx.fill();

      // Glow ambiente dos monitores nas paredes
      const monitorAmbient = ctx.createRadialGradient(420, 350, 30, 420, 350, 300);
      monitorAmbient.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
      monitorAmbient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = monitorAmbient;
      ctx.fillRect(100, 150, 640, 400);

      // Alarme visual pulsante (overlay vermelho quando ativo)
      if (this.alarmActive) {
        const pulse = Math.sin(this.time * 8) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.06})`;
        ctx.fillRect(-100, -50, 1280, 1010);
      }
    }

    /** Renderiza todas as camadas na ordem correta */
    drawAll(ctx) {
      this.drawWallsAndCeiling(ctx);
      this.drawFloorAndFurniture(ctx);
      this.drawWorkstation(ctx);
      this.drawSideWindow(ctx);
      this.drawInteriorLighting(ctx);
    }
  }

  global.StudioEngine = global.StudioEngine || {};
  global.StudioEngine.InteriorGuaritaLateral = InteriorGuaritaLateral;
})(typeof window !== 'undefined' ? window : globalThis);