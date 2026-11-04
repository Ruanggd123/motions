/**
 * Cenário Modular Reutilizável 01: PORTARIA DO BLOCO C + ECLUSA DE VIDRO (Condomínio Solaris)
 * Arquitetura Multi-Camada 2.5D com Parallax Real
 * Camada 0: Rua chuvosa à noite, postes, neblina leitosa e moto do entregador.
 * Camada 1: Parede de madeira ripada, Guarita Blindada CFTV e Eclusa de Vidro com grades.
 * Camada 2: Piso de porcelanato polido com reflexos especulares e tapete "SOLARIS • BLOCO C".
 * Camada 3: Spots de iluminação volumétrica, pilar frontal e partículas atmosféricas.
 */
(function (global) {
  class PortariaBlocoC {
    constructor(options = {}) {
      this.id = 'PORTARIA_BLOCO_C';
      this.name = 'Portaria Bloco C & Eclusa de Pedestres';
      this.fogDensity = options.fogDensity !== undefined ? options.fogDensity : 0.65;
      this.streetBlackout = options.streetBlackout !== undefined ? options.streetBlackout : false;
      this.alarmActive = options.alarmActive !== undefined ? options.alarmActive : false;
      this.time = 0;

      // Gotas de chuva externas
      this.rainDrops = Array.from({ length: 55 }, (_, i) => ({
        x: (i * 39) % 1920,
        y: (i * 83) % 800,
        len: 18 + (i % 14),
        speed: 520 + (i % 5) * 90
      }));
    }

    update(dt) {
      this.time += dt;
      for (let i = 0; i < this.rainDrops.length; i++) {
        const r = this.rainDrops[i];
        r.y += r.speed * dt;
        r.x -= 65 * dt;
        if (r.y > 780) {
          r.y = 80;
          r.x = (r.x + 1920) % 1920;
        }
      }
    }

    /**
     * CAMADA 0: Rua Chuvosa, Neblina e Moto na Calçada
     */
    drawBackground(ctx, parallaxOffsetX = 0) {
      ctx.save();
      ctx.translate(parallaxOffsetX * 0.35, 0);

      // Céu noturno urbano chuvoso
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 820);
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(0.5, this.streetBlackout ? '#050811' : '#0f172a');
      skyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-300, -150, 2520, 1050);

      // Silhueta dos prédios vizinhos
      ctx.fillStyle = '#070b14';
      const buildings = [
        [580, 140, 160, 560],
        [760, 190, 140, 510],
        [920, 110, 190, 590],
        [1130, 170, 150, 530]
      ];
      buildings.forEach(([bx, by, bw, bh]) => {
        ctx.fillRect(bx, by, bw, bh);
        if (!this.streetBlackout) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
          for (let wy = by + 28; wy < by + bh - 80; wy += 48) {
            for (let wx = bx + 20; wx < bx + bw - 30; wx += 38) {
              if ((wx + wy) % 3 === 0) ctx.fillRect(wx, wy, 16, 22);
            }
          }
          ctx.fillStyle = '#070b14';
        }
      });

      // Poste de iluminação pública na calçada
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(720, 220, 8, 460);
      ctx.beginPath();
      ctx.moveTo(720, 220);
      ctx.lineTo(780, 205);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      if (!this.streetBlackout) {
        const lampGlow = ctx.createRadialGradient(780, 210, 6, 780, 260, 220);
        lampGlow.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
        lampGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(780, 240, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moto do Entregador parada junto ao meio-fio
      ctx.save();
      ctx.translate(1060, 615);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(-32, 22, 18, 0, Math.PI * 2);
      ctx.arc(32, 22, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(-25, 12);
      ctx.lineTo(15, -8);
      ctx.lineTo(28, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-44, -22, 26, 24);

      // Pisca-alerta
      const blinkerOn = Math.sin(this.time * 7) > 0;
      if (blinkerOn) {
        const blinkGlow = ctx.createRadialGradient(34, -4, 2, 34, -4, 95);
        blinkGlow.addColorStop(0, 'rgba(245, 158, 11, 0.75)');
        blinkGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = blinkGlow;
        ctx.beginPath();
        ctx.arc(34, -4, 95, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Gotas de chuva
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < this.rainDrops.length; i++) {
        const r = this.rainDrops[i];
        if (r.x > 480 && r.x < 1420) {
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 9, r.y + r.len);
        }
      }
      ctx.stroke();

      // Neblina leitosa dinâmica
      if (this.fogDensity > 0.05) {
        const fogShift = Math.sin(this.time * 0.6) * 35;
        const fogGrad = ctx.createLinearGradient(500, 320, 500, 740);
        fogGrad.addColorStop(0, `rgba(203, 213, 225, ${this.fogDensity * 0.18})`);
        fogGrad.addColorStop(0.55, `rgba(226, 232, 240, ${this.fogDensity * 0.55})`);
        fogGrad.addColorStop(1, `rgba(148, 163, 184, ${this.fogDensity * 0.78})`);
        ctx.fillStyle = fogGrad;
        ctx.fillRect(460 + fogShift * 0.2, 300, 980, 440);
      }

      ctx.restore();
    }

    /**
     * CAMADA 1: Arquitetura do Lobby (Paredes, Fundo da Guarita e Vão da Eclusa)
     */
    drawMidground(ctx) {
      // 1. TETO REBAIXADO EM GESSO
      const ceilingGrad = ctx.createLinearGradient(0, 0, 0, 145);
      ceilingGrad.addColorStop(0, '#090d16');
      ceilingGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = ceilingGrad;
      ctx.fillRect(-300, -100, 2520, 235);

      // Sanca de LED
      ctx.fillStyle = this.alarmActive ? '#ef4444' : '#fde68a';
      ctx.fillRect(-100, 128, 2120, 5);

      // 2. PAREDE ESQUERDA (Madeira Ripada de Freijó)
      ctx.fillStyle = '#111827';
      ctx.fillRect(-250, 133, 810, 560);

      for (let sx = -180; sx < 540; sx += 22) {
        ctx.fillStyle = '#291d16';
        ctx.fillRect(sx, 135, 14, 555);
        ctx.fillStyle = '#3f2e21';
        ctx.fillRect(sx + 2, 135, 4, 555);
      }

      // GUARITA BLINDADA — ESTRUTURA E FUNDO (X: 35 a 475, Y: 225 a 530)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(35, 225, 440, 305, 8);
      ctx.fill();
      ctx.stroke();

      // Interior escuro da guarita
      ctx.fillStyle = '#060a12';
      ctx.fillRect(50, 240, 410, 265);

      // 4 Monitores CFTV no fundo da guarita com feeds contextuais realistas
      const cams = [
        { x: 194, y: 260, label: '01·RUA' },
        { x: 252, y: 260, label: '02·ECLUSA' },
        { x: 194, y: 304, label: '03·ELEVADOR' },
        { x: 252, y: 304, label: '04·GARAGEM' }
      ];
      cams.forEach((c, idx) => {
        this._drawCCTVScreen(ctx, c, idx);
      });

      // Brilho esverdeado dos monitores sobre a parede da guarita
      const cctvGlow = ctx.createRadialGradient(250, 290, 8, 250, 290, 160);
      cctvGlow.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      cctvGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = cctvGlow;
      ctx.fillRect(50, 240, 410, 265);

      // Placa "PORTARIA 24H • BLOCO C"
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(175, 192, 160, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PORTARIA 24H • BLOCO C', 255, 208);

      // 3. CENTRO: ECLUSA DUPLA DE PEDESTRES (Vão X: 560 a 1340, Y: 140 a 690)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.strokeRect(560, 140, 780, 550);

      // Grade Externa (barras verticais pretas)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      for (let gx = 590; gx < 1320; gx += 36) {
        ctx.beginPath();
        ctx.moveTo(gx, 145);
        ctx.lineTo(gx, 685);
        ctx.stroke();
      }

      // Vidro temperado da Eclusa
      ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.fillRect(565, 145, 770, 540);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(950, 140);
      ctx.lineTo(950, 690);
      ctx.stroke();

      // Trava Eletromagnética
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(910, 148, 80, 32, 5);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(930, 164, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.font = '700 9px monospace';
      ctx.fillText('TRAVADO', 960, 167);

      // 4. PAREDE DIREITA (Hall de Entrada e Elevador Social)
      ctx.fillStyle = '#111827';
      ctx.fillRect(1340, 133, 820, 560);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1355, 140, 560, 550);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1.5;
      for (let py = 230; py < 680; py += 110) {
        ctx.beginPath();
        ctx.moveTo(1355, py);
        ctx.lineTo(1915, py);
        ctx.stroke();
      }

      // Totem Biométrico
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(1378, 390, 46, 86, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(1386, 400, 30, 26);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(1401, 452, 7, 0, Math.PI * 2);
      ctx.fill();

      // Elevador Social ao Fundo
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(1610, 185, 110, 42, 6);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.font = '700 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('4º ⬇', 1665, 214);

      const elevGrad = ctx.createLinearGradient(1560, 240, 1770, 690);
      elevGrad.addColorStop(0, '#475569');
      elevGrad.addColorStop(0.5, '#64748b');
      elevGrad.addColorStop(1, '#334155');
      ctx.fillStyle = elevGrad;
      ctx.fillRect(1560, 240, 210, 450);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeRect(1560, 240, 210, 450);
      ctx.beginPath();
      ctx.moveTo(1665, 240);
      ctx.lineTo(1665, 690);
      ctx.stroke();

      // Vaso Ornamental
      this._drawLobbyPlant(ctx, 515, 645);
    }

    /**
     * DESENHO DO BALCÃO E DO VIDRO DA GUARITA (Fica NA FRENTE do Seu Valdir, vedando-o com perfeição)
     */
    drawGuaritaFore(ctx) {
      // 1. Vidro da Janela da Guarita com reflexos especulares
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(50, 240, 410, 265);

      // Reflexo diagonal clássico de vidro arquitetônico
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 240); ctx.lineTo(240, 505);
      ctx.moveTo(180, 240); ctx.lineTo(340, 505);
      ctx.stroke();

      // 2. Balcão de Granito Preto — topo + base maciça até o piso (esconde as pernas de quem está atrás)
      ctx.fillStyle = '#0b101b';
      ctx.fillRect(30, 520, 450, 170);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1.5;
      for (let px = 120; px < 480; px += 90) {
        ctx.beginPath();
        ctx.moveTo(px, 534);
        ctx.lineTo(px, 690);
        ctx.stroke();
      }
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(30, 495, 450, 38);
      ctx.strokeRect(30, 495, 450, 38);

      // Passa-volumes metálico embutido
      ctx.fillStyle = '#334155';
      ctx.fillRect(205, 485, 95, 18);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(205, 485, 95, 18);

      // Interfone fixo na bancada
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(110, 482, 34, 18, 3);
      ctx.fill();
    }

    /**
     * CAMADA 2: Piso Principal de Porcelanato Polido
     */
    drawFloor(ctx) {
      const floorGrad = ctx.createLinearGradient(0, 685, 0, 1080);
      floorGrad.addColorStop(0, '#111827');
      floorGrad.addColorStop(0.35, '#0b111e');
      floorGrad.addColorStop(1, '#04070d');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(-400, 685, 2720, 450);

      // Reflexo luminoso
      const reflGrad = ctx.createRadialGradient(950, 720, 20, 950, 790, 420);
      reflGrad.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
      reflGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = reflGrad;
      ctx.fillRect(450, 685, 1000, 280);

      // Linhas de rejunte em perspectiva do porcelanato
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.09)';
      ctx.lineWidth = 1.4;
      [715, 755, 805, 870, 950, 1045].forEach((fy) => {
        ctx.beginPath();
        ctx.moveTo(-400, fy);
        ctx.lineTo(2320, fy);
        ctx.stroke();
      });
      for (let fx = -300; fx <= 2220; fx += 210) {
        ctx.beginPath();
        ctx.moveTo(960 + (fx - 960) * 0.42, 685);
        ctx.lineTo(fx, 1080);
        ctx.stroke();
      }

      // Tapete Capacho "SOLARIS • BLOCO C"
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(680, 710);
      ctx.lineTo(1220, 710);
      ctx.lineTo(1270, 790);
      ctx.lineTo(630, 790);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SOLARIS • BLOCO C', 950, 755);
    }

    /**
     * CAMADA 3: Luzes Volumétricas e Primeiro Plano
     */
    drawForeground(ctx) {
      const lightLocations = [260, 950, 1580];
      lightLocations.forEach((lx) => {
        const coneGrad = ctx.createLinearGradient(lx, 120, lx, 820);
        if (this.alarmActive) {
          coneGrad.addColorStop(0, 'rgba(239, 68, 68, 0.16)');
          coneGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else {
          coneGrad.addColorStop(0, 'rgba(253, 230, 138, 0.11)');
          coneGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
        }
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(lx - 45, 125);
        ctx.lineTo(lx + 45, 125);
        ctx.lineTo(lx + 240, 860);
        ctx.lineTo(lx - 240, 860);
        ctx.closePath();
        ctx.fill();
      });

      // Pilar estrutural lateral
      ctx.fillStyle = 'rgba(4, 7, 13, 0.88)';
      ctx.fillRect(-360, -100, 210, 1280);
    }

    _drawLobbyPlant(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(-24, -42);
      ctx.lineTo(24, -42);
      ctx.lineTo(18, 42);
      ctx.lineTo(-18, 42);
      ctx.closePath();
      ctx.fill();

      const leaves = [
        [-18, -75, -0.35],
        [0, -90, 0.05],
        [20, -72, 0.4]
      ];
      leaves.forEach(([lx, ly, rot]) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
    }

    /**
     * RENDERIZAÇÃO DE CÂMERA CFTV EM TELA CHEIA (Modo Cinematográfico)
     * Exibe uma câmera específica ocupando todo o canvas 1080x1920 com HUD profissional,
     * estática CRT, vinheta pesada e ações narrativas contextuais por câmera.
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} camIndex - Índice da câmera (0=RUA, 1=ECLUSA, 2=ELEVADOR, 3=GARAGEM)
     * @param {number} W - Largura do canvas (1080)
     * @param {number} H - Altura do canvas (1920)
     * @param {object} narrativeState - Estado narrativo atual { shadowVisible, bangActive, blackout }
     */
    drawCCTVFullscreen(ctx, camIndex, W, H, narrativeState = {}) {
      const ns = narrativeState;
      const t = (ns && ns.time !== undefined) ? ns.time : this.time;

      // CAM 02: FOCO TOTAL CINEMATOGRÁFICO EM TELA CHEIA (1080x1920) SEM BORDAS PRETAS
      if (camIndex === 1) {
        this._drawCCTV02EclusaFullscreen(ctx, W, H, ns, t);
        return;
      }

      // Fundo preto absoluto
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, W, H);

      // Área útil da câmera (com margem CRT)
      const mx = 60;
      const my = 180;
      const cw = W - mx * 2;
      const ch = H - my * 2 - 200;

      ctx.save();
      ctx.beginPath();
      ctx.rect(mx, my, cw, ch);
      ctx.clip();

      // Renderiza o conteúdo específico de cada câmera em escala cinematográfica
      if (camIndex === 0) {
        // CAM 01 · RUA EXTERNA — Neblina densa, poste apagado, sombra na neblina
        const skyGrad = ctx.createLinearGradient(0, my, 0, my + ch);
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.6, ns.blackout ? '#050811' : '#0f172a');
        skyGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(mx, my, cw, ch);

        // Rua asfaltada molhada
        ctx.fillStyle = '#0a0f1a';
        ctx.fillRect(mx, my + ch * 0.65, cw, ch * 0.35);

        // Reflexos na pista molhada
        const wetGlow = ctx.createRadialGradient(W / 2, my + ch * 0.78, 20, W / 2, my + ch * 0.78, cw * 0.6);
        wetGlow.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
        wetGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = wetGlow;
        ctx.fillRect(mx, my + ch * 0.65, cw, ch * 0.35);

        // Poste apagado (silhueta escura)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(W * 0.35, my + ch * 0.15, 12, ch * 0.55);
        ctx.beginPath();
        ctx.moveTo(W * 0.35, my + ch * 0.15);
        ctx.lineTo(W * 0.35 + 80, my + ch * 0.12);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();

        // Neblina densa leitosa (muito mais forte que no cenário normal)
        const fogShift = Math.sin(t * 0.4) * 40;
        for (let fl = 0; fl < 3; fl++) {
          const fogY = my + ch * 0.35 + fl * ch * 0.12;
          const fogGrad = ctx.createLinearGradient(mx, fogY, mx, fogY + ch * 0.25);
          fogGrad.addColorStop(0, `rgba(203, 213, 225, ${0.12 + fl * 0.08})`);
          fogGrad.addColorStop(0.5, `rgba(226, 232, 240, ${0.28 + fl * 0.12})`);
          fogGrad.addColorStop(1, `rgba(148, 163, 184, ${0.08})`);
          ctx.fillStyle = fogGrad;
          ctx.fillRect(mx + fogShift * (fl % 2 === 0 ? 1 : -1), fogY, cw, ch * 0.25);
        }

        // SOMBRA NA NEBLINA (aparece quando shadowVisible é true)
        if (ns.shadowVisible) {
          const shadowX = W * 0.62 + Math.sin(t * 0.8) * 15;
          const shadowY = my + ch * 0.42;
          const shadowH = ch * 0.38;
          const shadowW = shadowH * 0.28;

          // Silhueta humana distorcida pela neblina
          const shadowGrad = ctx.createRadialGradient(shadowX, shadowY + shadowH * 0.3, 5, shadowX, shadowY + shadowH * 0.3, shadowW * 2.5);
          shadowGrad.addColorStop(0, 'rgba(10, 15, 30, 0.92)');
          shadowGrad.addColorStop(0.4, 'rgba(15, 23, 42, 0.65)');
          shadowGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');
          ctx.fillStyle = shadowGrad;

          ctx.beginPath();
          ctx.ellipse(shadowX, shadowY + shadowH * 0.3, shadowW, shadowH * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cabeça da sombra
          ctx.beginPath();
          ctx.arc(shadowX, shadowY - shadowH * 0.08, shadowW * 0.45, 0, Math.PI * 2);
          ctx.fill();

          // Olhos brilhantes sutis na sombra (terror psicológico)
          const eyeBlink = Math.sin(t * 3) > 0.7;
          if (eyeBlink) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.beginPath();
            ctx.arc(shadowX - 8, shadowY - shadowH * 0.08, 2.5, 0, Math.PI * 2);
            ctx.arc(shadowX + 8, shadowY - shadowH * 0.08, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Chuva intensa
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 80; i++) {
          const rx = mx + ((i * 47 + t * 120) % cw);
          const ry = my + ((i * 83 + t * 520) % ch);
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 12, ry + 28);
        }
        ctx.stroke();

      } else if (camIndex === 1) {
        // CAM 02 · ECLUSA DE PEDESTRES E RUA EXTERNA (FOCO TOTAL CINEMATOGRÁFICO 1080x1920)
        // Ambiente 2.5D completo, vivo e aterrorizante: chuva, asfalto molhado, neblina volumétrica, poste faiscando e a criatura de 2.20m

        // 1. Céu tempestuoso da noite do apagão
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
        skyGrad.addColorStop(0, '#010308');
        skyGrad.addColorStop(0.5, '#050a16');
        skyGrad.addColorStop(1, '#091122');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // Flash de relâmpago distante na tempestade (iluminação dramática sutil)
        const thunderPulse = (Math.sin(t * 1.9) > 0.94) ? 0.28 : 0;
        if (thunderPulse > 0) {
          ctx.fillStyle = `rgba(186, 230, 253, ${thunderPulse})`;
          ctx.fillRect(0, 0, W, H);
        }

        // Silhuetas de edifícios vizinhos apagados no horizonte através da névoa
        ctx.fillStyle = '#030610';
        ctx.fillRect(110, H * 0.28, 160, H * 0.45);
        ctx.fillRect(320, H * 0.22, 220, H * 0.50);
        ctx.fillRect(720, H * 0.25, 200, H * 0.48);

        // 2. Rua asfaltada molhada e calçada externa da eclusa (Y: 1100 a 1920)
        const streetGrad = ctx.createLinearGradient(0, H * 0.58, 0, H);
        streetGrad.addColorStop(0, '#060a14');
        streetGrad.addColorStop(0.4, '#090f1d');
        streetGrad.addColorStop(1, '#020408');
        ctx.fillStyle = streetGrad;
        ctx.fillRect(0, H * 0.58, W, H * 0.42);

        // Guia e calçada de pedras portuguesas escuras
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, H * 0.72, W, 24);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, H * 0.73, W, 6);

        // Reflexos de água e poças no asfalto molhado
        const wetPuddle = ctx.createRadialGradient(W * 0.5, H * 0.82, 40, W * 0.5, H * 0.82, 450);
        wetPuddle.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        wetPuddle.addColorStop(0.6, 'rgba(15, 23, 42, 0.04)');
        wetPuddle.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = wetPuddle;
        ctx.fillRect(0, H * 0.65, W, H * 0.35);

        // Ondulações de gotas de chuva nas poças (Ripples)
        for (let rip = 0; rip < 5; rip++) {
          const ripPhase = ((t * 1.8 + rip * 0.23) % 1);
          const rx = 180 + ((rip * 211) % (W - 360));
          const ry = H * 0.76 + ((rip * 137) % 320);
          ctx.strokeStyle = `rgba(148, 163, 184, ${(1 - ripPhase) * 0.35})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(rx, ry, ripPhase * 36, ripPhase * 14, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3. Poste de iluminação da calçada com fio rompido soltando faíscas de alta tensão
        const poleX = 140;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(poleX, H * 0.15, 18, H * 0.60);
        // Braço do poste
        ctx.fillRect(poleX, H * 0.15, 140, 14);
        // Luminária quebrada
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(poleX + 110, H * 0.15 + 14, 40, 18);
        // Fio rompido pendurado
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(poleX + 130, H * 0.15 + 32);
        ctx.bezierCurveTo(poleX + 125, H * 0.28, poleX + 145, H * 0.38, poleX + 135, H * 0.45);
        ctx.stroke();

        // Estalo elétrico intermitente (curto-circuito do apagão)
        const sparkTime = (t * 2.2) % 1;
        if (sparkTime < 0.10) {
          const sparkAge = sparkTime / 0.10;
          const sx = poleX + 135;
          const sy = H * 0.45;
          // Clarão azul-elétrico estroboscópico iluminando a cena
          const sparkGlow = ctx.createRadialGradient(sx, sy, 2, sx, sy, 280);
          sparkGlow.addColorStop(0, `rgba(255, 255, 255, ${0.8 * (1 - sparkAge)})`);
          sparkGlow.addColorStop(0.35, `rgba(56, 189, 248, ${0.45 * (1 - sparkAge)})`);
          sparkGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = sparkGlow;
          ctx.beginPath();
          ctx.arc(sx, sy, 280, 0, Math.PI * 2);
          ctx.fill();

          // Feixes de faíscas elétricas
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          for (let sp = 0; sp < 8; sp++) {
            const sang = (sp / 8) * Math.PI * 2 + t * 20;
            const sdist = 8 + sparkAge * 32;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(sang) * sdist, sy + Math.sin(sang) * sdist);
            ctx.stroke();
          }
        }

        // 4. Neblina Volumétrica Espessa Multicamada com Vento
        for (let fl = 0; fl < 5; fl++) {
          const fogY = H * 0.22 + fl * (H * 0.13);
          const fogGrad = ctx.createLinearGradient(0, fogY, 0, fogY + 280);
          fogGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
          fogGrad.addColorStop(0.5, `rgba(51, 65, 85, ${0.25 + fl * 0.08})`);
          fogGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx.fillStyle = fogGrad;
          const fogShift = Math.sin(t * 0.7 + fl * 1.3) * 60 + (t * 25) % W;
          ctx.fillRect(-100 + fogShift - W, fogY, W * 2.5, 280);
        }

        // 5. Partículas de chuva caindo em ângulo balístico em 60fps
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.40)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < 90; i++) {
          const rx = ((i * 61 + t * 450) % (W + 200)) - 100;
          const ry = ((i * 97 + t * 1400) % H);
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 9, ry + 26);
        }
        ctx.stroke();

        // 6. A CRIATURA COLOSSAL DE 2.20M (ANATOMIA REALISTA DE HORROR 2D)
        // Push-in progressivo: ela se aproxima e cresce no enquadramento
        const pushIn = Math.min(1.0, Math.max(0, (t - 31.2) / 5.4));
        const creatureScale = 1.05 + pushIn * 0.45;
        const creatureX = W * 0.50 + Math.sin(t * 1.2) * 8;
        const creatureY = H * 0.62 + pushIn * 60;

        ctx.save();
        ctx.translate(creatureX, creatureY);
        ctx.scale(creatureScale, creatureScale);

        // Ciclo de respiração orgânica do monstro
        const breath = Math.sin(t * 3.2) * 5;

        // Aura sombria / Miasma de escuridão viva
        const miasma = ctx.createRadialGradient(0, -180, 40, 0, -180, 360);
        miasma.addColorStop(0, 'rgba(1, 3, 8, 0.96)');
        miasma.addColorStop(0.6, 'rgba(8, 12, 24, 0.75)');
        miasma.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = miasma;
        ctx.beginPath();
        ctx.arc(0, -180, 360, 0, Math.PI * 2);
        ctx.fill();

        // Silhueta do corpo principal da criatura (preto abissal com relevo cinza-azulado escuro)
        ctx.fillStyle = '#020409';

        // Dorso corcunda e coluna com espinhos vertebrais proeminentes
        ctx.beginPath();
        ctx.moveTo(-160, 180);
        ctx.bezierCurveTo(-180, 60, -190, -80, -170, -190);
        ctx.bezierCurveTo(-155, -240, -120, -290, -50, -310);
        ctx.bezierCurveTo(-30, -320, 0, -330, 30, -320);
        ctx.bezierCurveTo(120, -290, 155, -240, 170, -190);
        ctx.bezierCurveTo(190, -80, 180, 60, 160, 180);
        ctx.closePath();
        ctx.fill();

        // 7 Espinhos vertebrais protuberantes na coluna (silhueta óssea)
        ctx.fillStyle = '#010206';
        for (let sp = 0; sp < 7; sp++) {
          const spY = -300 + sp * 55 + breath * 0.4;
          const spW = 16 - sp * 1.5;
          const spH = 28 - sp * 2;
          ctx.beginPath();
          ctx.moveTo(-spW, spY);
          ctx.lineTo(0, spY - spH);
          ctx.lineTo(spW, spY);
          ctx.closePath();
          ctx.fill();
        }

        // Tórax colossal musculoso com respiração viva
        ctx.fillStyle = '#030611';
        ctx.beginPath();
        ctx.ellipse(0, -140, 145 + breath, 190, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fibras musculares peitorais e costelas na penumbra
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
        ctx.lineWidth = 3.5;
        for (let rib = -2; rib <= 2; rib++) {
          ctx.beginPath();
          ctx.arc(rib * 35, -120 + Math.abs(rib) * 15, 45, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        }

        // Cabeça predatória alongada
        const headTilt = Math.sin(t * 1.4) * 0.05;
        ctx.save();
        ctx.translate(0, -320 + breath * 0.5);
        ctx.rotate(headTilt);

        // Crânio e mandíbula predatória
        ctx.fillStyle = '#010307';
        ctx.beginPath();
        ctx.moveTo(-55, -45);
        ctx.bezierCurveTo(-65, 10, -50, 60, -25, 85);
        ctx.bezierCurveTo(-10, 95, 10, 95, 25, 85);
        ctx.bezierCurveTo(50, 60, 65, 10, 55, -45);
        ctx.bezierCurveTo(45, -95, -45, -95, -55, -45);
        ctx.closePath();
        ctx.fill();

        // Fresta da boca entreaberta com dentes afiados
        ctx.fillStyle = '#090000';
        ctx.beginPath();
        ctx.roundRect(-22, 45, 44, 18, 4);
        ctx.fill();

        // Presas superiores e inferiores (contraluz afiada)
        ctx.fillStyle = '#e2e8f0';
        for (let f = -3; f <= 3; f++) {
          ctx.beginPath();
          ctx.moveTo(f * 6 - 2, 45);
          ctx.lineTo(f * 6, 52);
          ctx.lineTo(f * 6 + 2, 45);
          ctx.closePath();
          ctx.fill();
        }

        // Baforadas de respiração gelada (Cold Breath Vapor saindo da boca na chuva fria)
        const breathPhase = ((t * 1.6) % 1);
        const vaporAlpha = Math.sin(breathPhase * Math.PI) * 0.45;
        const vaporSize = 14 + breathPhase * 48;
        const vaporGlow = ctx.createRadialGradient(0, 62, 4, 0, 62 + breathPhase * 35, vaporSize);
        vaporGlow.addColorStop(0, `rgba(224, 242, 254, ${vaporAlpha})`);
        vaporGlow.addColorStop(0.5, `rgba(186, 230, 253, ${vaporAlpha * 0.5})`);
        vaporGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = vaporGlow;
        ctx.beginPath();
        ctx.arc(0, 62 + breathPhase * 35, vaporSize, 0, Math.PI * 2);
        ctx.fill();

        // Olhos Carmesim Bioluminescentes (Fendas Predatórias Vivas)
        const eyePulse = 0.8 + 0.2 * Math.sin(t * 9.0);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 28 * eyePulse;
        ctx.fillStyle = `rgba(239, 68, 68, ${eyePulse})`;
        // Olho esquerdo
        ctx.beginPath();
        ctx.ellipse(-24, -12, 10, 6.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Olho direito
        ctx.beginPath();
        ctx.ellipse(24, -12, 10, 6.5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas verticais pretas afiadas
        ctx.fillStyle = '#050101';
        ctx.shadowBlur = 0;
        ctx.fillRect(-25.5, -18, 3, 12);
        ctx.fillRect(22.5, -18, 3, 12);

        // Reflexo especular na córnea
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-22, -15, 1.5, 0, Math.PI * 2);
        ctx.arc(26, -15, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // restaura transform da cabeça
        ctx.restore(); // restaura escala da criatura

        // 7. O PORTÃO DUPLO DE FERRO FORJADO DA ECLUSA (Fica na FRENTE da criatura)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 80, H);
        ctx.fillRect(W - 80, 0, 80, H);

        // Barras verticais pesadas de ferro forjado (com lanças góticas no topo)
        const barSpacing = 72;
        for (let bx = 90; bx < W - 80; bx += barSpacing) {
          const barGrad = ctx.createLinearGradient(bx - 12, 0, bx + 12, 0);
          barGrad.addColorStop(0, '#0a0f1d');
          barGrad.addColorStop(0.35, '#1e293b');
          barGrad.addColorStop(0.7, '#334155');
          barGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = barGrad;
          ctx.fillRect(bx - 10, 0, 20, H);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(bx - 1, 0, 2.5, H);

          // Ponta de lança gótica no topo
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(bx - 14, 110);
          ctx.lineTo(bx, 50);
          ctx.lineTo(bx + 14, 110);
          ctx.closePath();
          ctx.fill();
        }

        // Travessas horizontais reforçadas com rebites
        [H * 0.38, H * 0.68].forEach(ty => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(60, ty - 16, W - 120, 32);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.strokeRect(60, ty - 16, W - 120, 32);

          ctx.fillStyle = '#64748b';
          for (let rx = 100; rx < W - 100; rx += 72) {
            ctx.beginPath();
            ctx.arc(rx, ty, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // 8. AS GARRAS DA CRIATURA CRAVADAS NAS BARRAS DE FERRO (EM PRIMEIRO PLANO!)
        const clawY = H * 0.50 + pushIn * 45;
        const clawFlex = Math.sin(t * 4.0) * 4;

        [-1, 1].forEach(side => {
          const handX = W * 0.5 + side * 180;
          ctx.save();
          ctx.translate(handX, clawY);
          ctx.scale(side, 1);

          // Braço musculoso vindo de trás das barras
          ctx.fillStyle = '#020409';
          ctx.beginPath();
          ctx.moveTo(70, 90);
          ctx.bezierCurveTo(45, 60, 20, 30, -10, 10);
          ctx.lineTo(0, -35);
          ctx.bezierCurveTo(35, -20, 75, 20, 110, 50);
          ctx.closePath();
          ctx.fill();

          // Dorso da mão aterrorizante
          ctx.fillStyle = '#010307';
          ctx.beginPath();
          ctx.ellipse(0, 0, 32, 22, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // 4 Dedos longos com nós articulados envolvendo a barra de ferro
          for (let f = 0; f < 4; f++) {
            const fAngle = -0.35 + f * 0.24;
            const fingerLen = 42 + clawFlex;
            const knuckleX = -12 + f * 9;
            const knuckleY = -12 + f * 6;

            ctx.strokeStyle = '#02050d';
            ctx.lineWidth = 11;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(knuckleX, knuckleY);
            const midX = knuckleX - Math.cos(fAngle) * (fingerLen * 0.55);
            const midY = knuckleY + Math.sin(fAngle) * (fingerLen * 0.55);
            ctx.lineTo(midX, midY);
            const tipX = midX - 16;
            const tipY = midY + 12;
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Garra afiada curva preta / obsidiana (Foice)
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY - 4);
            ctx.lineTo(tipX - 18, tipY + 18);
            ctx.lineTo(tipX + 6, tipY + 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        });

        // 9. Trava Eletromagnética de Topo com Alerta "PORTÃO TRAVADO"
        const lockX = W * 0.5 - 190;
        const lockY = 80;
        ctx.fillStyle = '#070b14';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(lockX, lockY, 380, 85, 12);
        ctx.fill();
        ctx.stroke();

        // LED vermelho pulsante gigante
        const pulse = (Math.sin(t * 8) + 1) * 0.5;
        const lockGlow = ctx.createRadialGradient(W * 0.5, lockY + 42, 4, W * 0.5, lockY + 42, 90);
        lockGlow.addColorStop(0, `rgba(239, 68, 68, ${0.85 + pulse * 0.15})`);
        lockGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = lockGlow;
        ctx.beginPath();
        ctx.arc(W * 0.5, lockY + 42, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(W * 0.5, lockY + 42, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fca5a5';
        ctx.font = '900 32px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 PORTÃO TRAVADO ELETRONICAMENTE', W * 0.5, lockY + 120);

        // 10. HUD Militar / CFTV de Vigilância em Alta Definição
        ctx.fillStyle = '#10b981';
        ctx.font = '800 28px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('● REC  CAM 02 • ECLUSA PEDESTRES [IR NIGHT VISION]', 90, 52);

        const frameSec = Math.floor(t % 60).toString().padStart(2, '0');
        const frameMs = Math.floor((t * 24) % 24).toString().padStart(2, '0');
        ctx.textAlign = 'right';
        ctx.fillText(`23:44:${frameSec}:${frameMs}`, W - 90, 52);

        // Retículo Biométrico Dinâmico que Rastreia a Criatura
        const targetX = W * 0.5;
        const targetY = creatureY - 220;
        const boxW = 540;
        const boxH = 460;

        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 10]);
        ctx.strokeRect(targetX - boxW * 0.5, targetY - boxH * 0.5, boxW, boxH);
        ctx.setLineDash([]);

        // Cantoneiras sólidas na mira
        const cornerSize = 28;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 5;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(targetX - boxW * 0.5, targetY - boxH * 0.5 + cornerSize);
        ctx.lineTo(targetX - boxW * 0.5, targetY - boxH * 0.5);
        ctx.lineTo(targetX - boxW * 0.5 + cornerSize, targetY - boxH * 0.5);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(targetX + boxW * 0.5 - cornerSize, targetY - boxH * 0.5);
        ctx.lineTo(targetX + boxW * 0.5, targetY - boxH * 0.5);
        ctx.lineTo(targetX + boxW * 0.5, targetY - boxH * 0.5 + cornerSize);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(targetX - boxW * 0.5, targetY + boxH * 0.5 - cornerSize);
        ctx.lineTo(targetX - boxW * 0.5, targetY + boxH * 0.5);
        ctx.lineTo(targetX - boxW * 0.5 + cornerSize, targetY + boxH * 0.5);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(targetX + boxW * 0.5 - cornerSize, targetY + boxH * 0.5);
        ctx.lineTo(targetX + boxW * 0.5, targetY + boxH * 0.5);
        ctx.lineTo(targetX + boxW * 0.5, targetY + boxH * 0.5 - cornerSize);
        ctx.stroke();

        // Dados de Telemetria Biométrica
        const distM = (2.2 - pushIn * 1.8).toFixed(1);
        ctx.fillStyle = '#ef4444';
        ctx.font = '800 24px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('⚠️ ALVO NÃO-HUMANO DETECTADO (2.28m)', targetX - boxW * 0.5 + 24, targetY - boxH * 0.5 + 38);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '700 20px "JetBrains Mono", monospace';
        ctx.fillText(`DISTÂNCIA: ${distM}m • APROXIMAÇÃO RÁPIDA`, targetX - boxW * 0.5 + 24, targetY - boxH * 0.5 + 72);
        ctx.fillText('STATUS: TENTATIVA DE FORÇAR GRADE', targetX - boxW * 0.5 + 24, targetY + boxH * 0.5 - 28);
        ctx.restore();

        // Vinheta periférica e Scanlines CRT em tela cheia
        const vigGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.35, W * 0.5, H * 0.5, H * 0.72);
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vigGrad.addColorStop(1, 'rgba(2, 6, 23, 0.75)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, W, H);

        // Scanlines CRT suaves
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        for (let ly = 0; ly < H; ly += 4) {
          ctx.fillRect(0, ly, W, 2);
        }

      } else if (camIndex === 2) {
        // CAM 03 · ELEVADOR SOCIAL — Porta fechada, display vermelho, descendo sozinho
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(mx, my, cw, ch);

        // Paredes laterais do hall
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mx, my, cw * 0.15, ch);
        ctx.fillRect(mx + cw * 0.85, my, cw * 0.15, ch);

        // Porta do elevador (dupla, aço escovado)
        const doorGrad = ctx.createLinearGradient(mx + cw * 0.15, my, mx + cw * 0.85, my);
        doorGrad.addColorStop(0, '#475569');
        doorGrad.addColorStop(0.48, '#64748b');
        doorGrad.addColorStop(0.52, '#64748b');
        doorGrad.addColorStop(1, '#475569');
        ctx.fillStyle = doorGrad;
        ctx.fillRect(mx + cw * 0.15, my + ch * 0.08, cw * 0.7, ch * 0.85);

        // Linha central da porta dupla
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(mx + cw * 0.5, my + ch * 0.08);
        ctx.lineTo(mx + cw * 0.5, my + ch * 0.93);
        ctx.stroke();

        // Display digital do andar (vermelho, descendo)
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.roundRect(mx + cw * 0.38, my + ch * 0.02, cw * 0.24, ch * 0.05, 6);
        ctx.fill();

        const floorNum = Math.max(0, Math.floor(4 - (t * 0.3) % 5));
        ctx.fillStyle = '#ef4444';
        ctx.font = '900 48px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${floorNum}º ⬇`, mx + cw * 0.5, my + ch * 0.055);

        // Indicador de movimento (setas piscando)
        if (Math.sin(t * 4) > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.font = '700 28px monospace';
          ctx.fillText('▼', mx + cw * 0.5, my + ch * 0.96);
        }

      } else if (camIndex === 3) {
        // CAM 04 · GARAGEM SUBSOLO — Colunas zebradas, carros na penumbra, luz de emergência
        ctx.fillStyle = '#090d16';
        ctx.fillRect(mx, my, cw, ch);

        // Rampa inclinada
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(mx, my + ch);
        ctx.lineTo(mx + cw, my + ch * 0.5);
        ctx.lineTo(mx + cw, my + ch);
        ctx.closePath();
        ctx.fill();

        // Faixas zebradas amarelas e pretas
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 8;
        for (let zx = mx; zx < mx + cw; zx += 40) {
          ctx.beginPath();
          ctx.moveTo(zx, my + ch);
          ctx.lineTo(zx + 20, my + ch * 0.55);
          ctx.stroke();
        }

        // Colunas de concreto
        for (let px = mx + cw * 0.15; px < mx + cw * 0.9; px += cw * 0.25) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(px, my + ch * 0.2, cw * 0.06, ch * 0.8);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '700 24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('G1', px + cw * 0.03, my + ch * 0.35);
        }

        // Carros estacionados (silhuetas)
        const carPositions = [0.2, 0.45, 0.7];
        carPositions.forEach((cp, ci) => {
          ctx.fillStyle = ci === 1 ? '#1e3a5f' : '#0f172a';
          ctx.beginPath();
          ctx.roundRect(mx + cw * cp - 40, my + ch * 0.65, 80, 35, 6);
          ctx.fill();
          // Faróis traseiros vermelhos
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(mx + cw * cp - 38, my + ch * 0.65 + 28, 6, 4);
          ctx.fillRect(mx + cw * cp + 32, my + ch * 0.65 + 28, 6, 4);
        });

        // Luz de emergência giratória (efeito dramático)
        const emergAngle = t * 3;
        const emergX = mx + cw * 0.5;
        const emergY = my + ch * 0.15;
        const emergGlow = ctx.createRadialGradient(emergX, emergY, 5, emergX, emergY, 200);
        emergGlow.addColorStop(0, `rgba(245, 158, 11, ${0.3 + Math.sin(emergAngle) * 0.2})`);
        emergGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = emergGlow;
        ctx.beginPath();
        ctx.arc(emergX, emergY, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // === OVERLAY CRT PROFISSIONAL (aplicado sobre todas as câmeras) ===

      // Scanlines horizontais
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      for (let ly = my; ly < my + ch; ly += 4) {
        ctx.fillRect(mx, ly, cw, 2);
      }

      // Barra de varredura vertical (rolling bar clássica de CCTV)
      const barY = my + ((t * 60) % ch);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(mx, barY, cw, 12);

      // Ruído estático sutil
      for (let n = 0; n < 40; n++) {
        const nx = mx + Math.random() * cw;
        const ny = my + Math.random() * ch;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)';
        ctx.fillRect(nx, ny, Math.random() * 12 + 3, 2);
      }

      // Vinheta pesada de monitor CRT
      const vig = ctx.createRadialGradient(W / 2, my + ch / 2, ch * 0.25, W / 2, my + ch / 2, ch * 0.75);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
      ctx.fillStyle = vig;
      ctx.fillRect(mx, my, cw, ch);

      // Moldura do monitor CRT
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.strokeRect(mx, my, cw, ch);

      // === HUD PROFISSIONAL DE CFTV ===
      const labels = ['CAM 01 · RUA EXTERNA', 'CAM 02 · ECLUSA PEDESTRES', 'CAM 03 · ELEVADOR SOCIAL', 'CAM 04 · GARAGEM G1'];
      const label = labels[camIndex] || 'CAM ??';

      // Badge REC piscando
      const recBlink = Math.sin(t * 5) > 0;
      ctx.fillStyle = recBlink ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(mx + 30, my + 30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('REC', mx + 46, my + 37);

      // Nome da câmera
      ctx.fillStyle = '#34d399';
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillText(label, mx + 110, my + 37);

      // Timestamp
      const now = new Date();
      const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(ts, mx + cw - 20, my + 37);

      // Data
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      ctx.fillText(dateStr, mx + cw - 20, my + 62);
    }

    /**
     * CÂMERA 02 (ECLUSA E RUA EXTERNA) EM FOCO TOTAL CINEMATOGRÁFICO 1080x1920
     * Ambiente 2.5D de elite, ultra-vivo, atmosférico e aterrorizante:
     * - Portal arquitetônico com pilares de concreto brutalista e viga de travamento eletromagnético
     * - Rua externa molhada sob tempestade violenta, poças com ondas e asfalto reflexivo
     * - Silhuetas de arranha-céus na penumbra com sinalizadores aéreos vermelhos pulsantes
     * - Poste com cabo de alta tensão partido disparando faíscas azul-elétricas intermitentes
     * - Neblina volumétrica multicamada em fluxo dinâmico de vento
     * - Portão gótico de ferro forjado com lanças e travessas industriais
     * - Criatura de 2.20m anatômica (ombros musculosos, coluna com espinhos, respiração ofegante,
     *   baforadas de vapor gélido, olhos carmesim predatórios com fendas e mandíbula dentada)
     * - Garras de obsidiana cravadas nas barras de ferro em primeiro plano com faíscas de fricção
     * - HUD tático militar perfeitamente distribuído sem NENHUMA sobreposição de texto
     */
    _drawCCTV02EclusaFullscreen(ctx, W, H, ns, t) {
      // 1. CÉU TEMPESTUOSO DA NOITE DO APAGÃO & CIDADE EM SILHUETA
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.58);
      skyGrad.addColorStop(0, '#010307');
      skyGrad.addColorStop(0.5, '#040814');
      skyGrad.addColorStop(1, '#081022');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Relâmpagos dinâmicos multicamada da tempestade
      const lightningRaw = Math.sin(t * 2.1);
      const isThunder = lightningRaw > 0.93;
      const thunderVal = isThunder ? (lightningRaw - 0.93) / 0.07 : 0;
      if (thunderVal > 0) {
        ctx.fillStyle = `rgba(186, 230, 253, ${thunderVal * 0.38})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Silhuetas dos edifícios vizinhos apagados através da tempestade
      ctx.fillStyle = isThunder ? '#091326' : '#03050c';
      ctx.fillRect(230, H * 0.18, 140, H * 0.36);
      ctx.fillRect(400, H * 0.12, 190, H * 0.42);
      ctx.fillRect(630, H * 0.16, 170, H * 0.38);

      // Sinalizadores aéreos vermelhos no topo das torres dos edifícios (cada um com seu path independente)
      const beaconPulse = (Math.sin(t * 3.0) + 1) * 0.5;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + beaconPulse * 0.6})`;
      [[300, H * 0.18 - 8], [495, H * 0.12 - 10], [715, H * 0.16 - 8]].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. RUA ASFALTADA EXTERNA, CALÇADA E REFLEXOS DE ÁGUA
      const streetGrad = ctx.createLinearGradient(0, H * 0.46, 0, H);
      streetGrad.addColorStop(0, '#040711');
      streetGrad.addColorStop(0.4, '#070c18');
      streetGrad.addColorStop(1, '#020409');
      ctx.fillStyle = streetGrad;
      ctx.fillRect(0, H * 0.46, W, H * 0.54);

      // Faixa central tracejada da rua (perspectiva externa)
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.12)';
      ctx.lineWidth = 4;
      ctx.setLineDash([28, 22]);
      ctx.beginPath();
      ctx.moveTo(W * 0.50, H * 0.48);
      ctx.lineTo(W * 0.50, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Poças de água no asfalto com reflexos dinâmicos da tempestade e iluminação
      const puddleGrad = ctx.createRadialGradient(W * 0.50, H * 0.72, 30, W * 0.50, H * 0.72, 420);
      puddleGrad.addColorStop(0, isThunder ? 'rgba(186, 230, 253, 0.22)' : 'rgba(56, 189, 248, 0.08)');
      puddleGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.05)');
      puddleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = puddleGrad;
      ctx.fillRect(200, H * 0.52, W - 400, H * 0.40);

      // Ondulações de gotas de chuva nas poças de água (Ripples concêntricos em 60fps)
      for (let r = 0; r < 7; r++) {
        const rPhase = ((t * 1.7 + r * 0.16) % 1);
        const rx = 240 + ((r * 187) % (W - 480));
        const ry = H * 0.56 + ((r * 113) % (H * 0.32));
        ctx.strokeStyle = `rgba(148, 163, 184, ${(1 - rPhase) * 0.38})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(rx, ry, rPhase * 42, rPhase * 16, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Folhas caídas e detritos arrastados pelo vento da tempestade
      for (let lf = 0; lf < 6; lf++) {
        const lx = ((lf * 180 + t * 220) % (W + 200)) - 100;
        const ly = H * 0.70 + Math.sin(t * 4 + lf) * 20 + lf * 28;
        ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
        ctx.beginPath();
        ctx.ellipse(lx, ly, 8, 4, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. POSTE DE ILUMINAÇÃO COM CABO PARTIDO E FAÍSCAS DE CURTO-CIRCUITO
      const poleX = 180;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(poleX, H * 0.14, 18, H * 0.52);
      ctx.fillRect(poleX, H * 0.14, 110, 14);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(poleX + 85, H * 0.14 + 14, 38, 18);

      // Fio partido pendurado balançando com o vento
      const wireSway = Math.sin(t * 3.2) * 8;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(poleX + 104, H * 0.14 + 32);
      ctx.bezierCurveTo(poleX + 96, H * 0.26, poleX + 120 + wireSway, H * 0.34, poleX + 108 + wireSway, H * 0.42);
      ctx.stroke();

      // Explosão de faíscas elétricas e arco voltaico de alta voltagem
      const sparkCycle = (t * 2.4) % 1;
      let sparkBright = 0;
      if (sparkCycle < 0.12) {
        const sparkAge = sparkCycle / 0.12;
        sparkBright = 1 - sparkAge;
        const sx = poleX + 108 + wireSway;
        const sy = H * 0.42;

        const sparkGlow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 340);
        sparkGlow.addColorStop(0, `rgba(255, 255, 255, ${0.90 * sparkBright})`);
        sparkGlow.addColorStop(0.3, `rgba(56, 189, 248, ${0.55 * sparkBright})`);
        sparkGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sparkGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, 340, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        for (let s = 0; s < 10; s++) {
          const sang = (s / 10) * Math.PI * 2 + t * 25;
          const sdist = 12 + sparkAge * 45;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(sang) * sdist, sy + Math.sin(sang) * sdist + sparkAge * 18);
          ctx.stroke();
        }
      }

      // 4. NEBLINA VOLUMÉTRICA MULTICAMADA EM FLUXO CONTÍNUO
      for (let fl = 0; fl < 5; fl++) {
        const fogY = H * 0.18 + fl * (H * 0.12);
        const fogGrad = ctx.createLinearGradient(0, fogY, 0, fogY + 240);
        fogGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
        fogGrad.addColorStop(0.5, `rgba(51, 65, 85, ${0.24 + fl * 0.07})`);
        fogGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = fogGrad;
        const fogShift = Math.sin(t * 0.6 + fl * 1.2) * 60 + (t * 35) % W;
        ctx.fillRect(-150 + fogShift - W, fogY, W * 2.8, 240);
      }

      // 5. CHUVA BALÍSTICA EM ÂNGULO DE TEMPESTADE (60FPS)
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.40)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 90; i++) {
        const rx = ((i * 59 + t * 460) % (W + 200)) - 100;
        const ry = ((i * 91 + t * 1350) % H);
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 12, ry + 28);
      }
      ctx.stroke();

      // 6. A CRIATURA COLOSSAL DE 2.20M (ANATOMIA DE HORROR REALISTA)
      // Avanço agressivo em direção à câmera durante a fala (31.0s a 36.6s)
      const pushIn = Math.min(1.0, Math.max(0, (t - 31.0) / 5.6));
      const creatureScale = 1.05 + pushIn * 0.50;
      const creatureX = W * 0.50 + Math.sin(t * 1.5) * 8;
      const creatureY = H * 0.58 + pushIn * 65;

      ctx.save();
      ctx.translate(creatureX, creatureY);
      ctx.scale(creatureScale, creatureScale);

      // Respiração visceral pesada da criatura
      const breath = Math.sin(t * 3.6) * 6.5;

      // Miasma sombrio envolvente (Sombra viva)
      const miasma = ctx.createRadialGradient(0, -180, 50, 0, -180, 420);
      miasma.addColorStop(0, 'rgba(1, 2, 6, 0.98)');
      miasma.addColorStop(0.65, 'rgba(6, 11, 22, 0.78)');
      miasma.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = miasma;
      ctx.beginPath();
      ctx.arc(0, -180, 420, 0, Math.PI * 2);
      ctx.fill();

      // Silhueta dos Ombros Titânicos e Costas Corcundas
      ctx.fillStyle = '#020409';
      ctx.beginPath();
      ctx.moveTo(-185, 200);
      ctx.bezierCurveTo(-215, 70, -225, -90, -195, -200);
      ctx.bezierCurveTo(-180, -265, -135, -315, -60, -335);
      ctx.bezierCurveTo(-30, -345, 0, -355, 30, -345);
      ctx.bezierCurveTo(135, -315, 180, -265, 195, -200);
      ctx.bezierCurveTo(225, -90, 215, 70, 185, 200);
      ctx.closePath();
      ctx.fill();

      // 8 Espinhos vertebrais protuberantes na espinha dorsal
      ctx.fillStyle = '#010205';
      for (let sp = 0; sp < 8; sp++) {
        const spY = -330 + sp * 52 + breath * 0.4;
        const spW = 19 - sp * 1.6;
        const spH = 34 - sp * 2.2;
        ctx.beginPath();
        ctx.moveTo(-spW, spY);
        ctx.lineTo(0, spY - spH);
        ctx.lineTo(spW, spY);
        ctx.closePath();
        ctx.fill();
      }

      // Tórax massivo biomecânico com respiração pulsante
      ctx.fillStyle = '#030612';
      ctx.beginPath();
      ctx.ellipse(0, -145, 160 + breath, 210, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fibras musculares peitorais e costelas iluminadas pela luz ambiente e faíscas
      const ribGlow = (sparkBright > 0.3 || isThunder) ? 'rgba(56, 189, 248, 0.50)' : 'rgba(30, 41, 59, 0.40)';
      ctx.strokeStyle = ribGlow;
      ctx.lineWidth = 3.5;
      for (let rib = -2; rib <= 2; rib++) {
        ctx.beginPath();
        ctx.arc(rib * 38, -125 + Math.abs(rib) * 16, 52, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
      }

      // Cabeça Predatória Alongada
      const headTilt = Math.sin(t * 1.6) * 0.06;
      ctx.save();
      ctx.translate(0, -335 + breath * 0.5);
      ctx.rotate(headTilt);

      // Crânio e mandíbula predatória
      ctx.fillStyle = '#010307';
      ctx.beginPath();
      ctx.moveTo(-65, -50);
      ctx.bezierCurveTo(-78, 12, -60, 68, -30, 95);
      ctx.bezierCurveTo(-12, 105, 12, 105, 30, 95);
      ctx.bezierCurveTo(60, 68, 78, 12, 65, -50);
      ctx.bezierCurveTo(55, -110, -55, -110, -65, -50);
      ctx.closePath();
      ctx.fill();

      // Boca entreaberta com fundo vermelho-abissal
      ctx.fillStyle = '#070000';
      ctx.beginPath();
      ctx.roundRect(-28, 48, 56, 24, 6);
      ctx.fill();

      // Presas afiadas superiores e inferiores (Duas fileiras predatórias)
      ctx.fillStyle = '#f1f5f9';
      for (let f = -4; f <= 4; f++) {
        ctx.beginPath();
        ctx.moveTo(f * 6 - 2.5, 48);
        ctx.lineTo(f * 6, 58);
        ctx.lineTo(f * 6 + 2.5, 48);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(f * 6 - 2.5, 72);
        ctx.lineTo(f * 6, 62);
        ctx.lineTo(f * 6 + 2.5, 72);
        ctx.closePath();
        ctx.fill();
      }

      // Baforadas de respiração congelante (Vapor gélido saindo da boca na chuva fria)
      const breathPhase = ((t * 1.8) % 1);
      const vaporAlpha = Math.sin(breathPhase * Math.PI) * 0.52;
      const vaporSize = 18 + breathPhase * 60;
      const vaporGlow = ctx.createRadialGradient(0, 75, 4, 0, 75 + breathPhase * 45, vaporSize);
      vaporGlow.addColorStop(0, `rgba(224, 242, 254, ${vaporAlpha})`);
      vaporGlow.addColorStop(0.5, `rgba(186, 230, 253, ${vaporAlpha * 0.45})`);
      vaporGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = vaporGlow;
      ctx.beginPath();
      ctx.arc(0, 75 + breathPhase * 45, vaporSize, 0, Math.PI * 2);
      ctx.fill();

      // Olhos Carmesim Bioluminescentes Predatórios
      const eyePulse = 0.85 + 0.15 * Math.sin(t * 10.0);
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 35 * eyePulse;
      ctx.fillStyle = `rgba(239, 68, 68, ${eyePulse})`;
      // Olho esquerdo
      ctx.beginPath();
      ctx.ellipse(-28, -15, 13, 8, -0.22, 0, Math.PI * 2);
      ctx.fill();
      // Olho direito
      ctx.beginPath();
      ctx.ellipse(28, -15, 13, 8, 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Pupilas verticais pretas predatórias
      ctx.fillStyle = '#050101';
      ctx.shadowBlur = 0;
      ctx.fillRect(-30, -23, 4, 16);
      ctx.fillRect(26, -23, 4, 16);

      // Reflexos especulares na córnea
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-26, -18, 2, 0, Math.PI * 2);
      ctx.arc(30, -18, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // restaura transform da cabeça
      ctx.restore(); // restaura escala da criatura

      // 7. PORTAL ARQUITETÔNICO DA PORTARIA & PORTÃO DE FERRO DA ECLUSA
      // Pilar de Concreto Esquerdo (x: 0 a 220)
      const leftColGrad = ctx.createLinearGradient(0, 0, 220, 0);
      leftColGrad.addColorStop(0, '#090e1a');
      leftColGrad.addColorStop(0.85, '#131b2e');
      leftColGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = leftColGrad;
      ctx.fillRect(0, 0, 220, H);

      // Chanfro e textura de concreto
      ctx.fillStyle = '#0c1322';
      ctx.fillRect(215, 0, 8, H);

      // Placa de identificação do condomínio no pilar esquerdo
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(24, H * 0.38, 172, 72, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SOLARIS', 110, H * 0.38 + 28);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillText('BLOCO C', 110, H * 0.38 + 50);

      // Interfone e leitor RFID de acesso
      ctx.fillStyle = '#020617';
      ctx.fillRect(40, H * 0.52, 140, 110);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, H * 0.52, 140, 110);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(110, H * 0.52 + 35, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.font = '900 12px monospace';
      ctx.fillText('RFID', 110, H * 0.52 + 39);

      // Pilar de Concreto Direito (x: 860 a 1080)
      const rightColGrad = ctx.createLinearGradient(860, 0, 1080, 0);
      rightColGrad.addColorStop(0, '#1e293b');
      rightColGrad.addColorStop(0.15, '#131b2e');
      rightColGrad.addColorStop(1, '#090e1a');
      ctx.fillStyle = rightColGrad;
      ctx.fillRect(860, 0, 220, H);

      ctx.fillStyle = '#0c1322';
      ctx.fillRect(857, 0, 8, H);

      // Placa de segurança no pilar direito
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(884, H * 0.38, 172, 68, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = '800 14px "JetBrains Mono", monospace';
      ctx.fillText('ACESSO RESTRITO', 970, H * 0.38 + 28);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillText('ÁREA MONITORADA', 970, H * 0.38 + 48);

      // Viga Superior de Aço (Lintel Estrutural) ligando os dois pilares
      const lintelY = H * 0.17;
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(215, lintelY, 650, 70);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.strokeRect(215, lintelY, 650, 70);

      // Rebites industriais na viga superior
      ctx.fillStyle = '#475569';
      for (let rx = 240; rx < 850; rx += 45) {
        ctx.beginPath();
        ctx.arc(rx, lintelY + 35, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trava Eletromagnética Central Integrada na Viga
      const lockW = 380;
      const lockX = W * 0.5 - lockW * 0.5;
      const lockY = lintelY + 12;
      ctx.fillStyle = '#030712';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(lockX, lockY, lockW, 46, 10);
      ctx.fill();
      ctx.stroke();

      // LED de Bloqueio Magnético Pulsante de Alta Potência
      const lockPulse = (Math.sin(t * 8) + 1) * 0.5;
      const lockLedGlow = ctx.createRadialGradient(lockX + 32, lockY + 23, 2, lockX + 32, lockY + 23, 40);
      lockLedGlow.addColorStop(0, `rgba(239, 68, 68, ${0.95 + lockPulse * 0.05})`);
      lockLedGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = lockLedGlow;
      ctx.beginPath();
      ctx.arc(lockX + 32, lockY + 23, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(lockX + 32, lockY + 23, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fecaca';
      ctx.font = '800 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('🔒 PORTÃO TRAVADO (1200 LBS)', lockX + 54, lockY + 29);

      // 8. O PORTÃO DE FERRO FORJADO DA ECLUSA (Entre os pilares x: 220 e x: 860)
      const gateTopY = H * 0.35;
      const gateMidY = H * 0.62;
      const gateBotY = H * 0.88;

      // Barras Verticais de Aço Carbono com Pontas de Lança Góticas
      const picketSpacing = 56;
      for (let bx = 250; bx <= 830; bx += picketSpacing) {
        const barGrad = ctx.createLinearGradient(bx - 10, 0, bx + 10, 0);
        barGrad.addColorStop(0, '#090e1a');
        barGrad.addColorStop(0.35, '#1e293b');
        barGrad.addColorStop(0.7, '#334155');
        barGrad.addColorStop(1, '#090e1a');
        ctx.fillStyle = barGrad;
        ctx.fillRect(bx - 9, gateTopY, 18, gateBotY - gateTopY);

        // Filete de reflexo metálico
        ctx.fillStyle = (isThunder || sparkBright > 0.4) ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(bx - 1, gateTopY, 2.5, gateBotY - gateTopY);

        // Ponta de lança gótica no topo de cada barra
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(bx - 13, gateTopY);
        ctx.lineTo(bx, gateTopY - 42);
        ctx.lineTo(bx + 13, gateTopY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Travessas Horizontais Estruturais de Ferro
      [gateTopY, gateMidY, gateBotY].forEach(ty => {
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(220, ty - 14, 640, 28);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(220, ty - 14, 640, 28);

        ctx.fillStyle = '#64748b';
        for (let rx = 250; rx <= 830; rx += picketSpacing) {
          ctx.beginPath();
          ctx.arc(rx, ty, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 9. BRAÇOS MUSCULOSOS E GARRAS ANATÔMICAS CRAVADAS NO PORTÃO (EM PRIMEIRO PLANO!)
      // Conecta organicamente dos ombros colossais da criatura até as barras do portão
      const clawFlex = Math.sin(t * 4.8) * 3.5;

      [-1, 1].forEach(side => {
        const shoulderX = creatureX + side * (145 * creatureScale);
        const shoulderY = creatureY - 175 * creatureScale;
        const handTargetX = side === -1 ? 418 : 662;
        const handTargetY = gateTopY + 35 + pushIn * 25;
        const elbowX = shoulderX + side * 55;
        const elbowY = (shoulderY + handTargetY) * 0.52 + 20;

        ctx.save();

        // Braço Muscular Completo (Ombro -> Cotovelo -> Antebraço -> Punho)
        ctx.fillStyle = '#020409';
        ctx.beginPath();
        // Contorno externo do braço
        ctx.moveTo(shoulderX, shoulderY - 35);
        ctx.bezierCurveTo(elbowX + side * 45, elbowY - 20, handTargetX + side * 30, handTargetY - 40, handTargetX, handTargetY - 15);
        // Contorno do punho
        ctx.lineTo(handTargetX - side * 22, handTargetY + 15);
        // Contorno interno do braço voltando ao peitoral
        ctx.bezierCurveTo(elbowX - side * 15, elbowY + 30, shoulderX - side * 20, shoulderY + 45, shoulderX - side * 40, shoulderY + 20);
        ctx.closePath();
        ctx.fill();

        // Feixes musculares do bíceps e tendões no antebraço (Chiaroscuro)
        const armGlow = (sparkBright > 0.3 || isThunder) ? 'rgba(56, 189, 248, 0.40)' : 'rgba(30, 41, 59, 0.45)';
        ctx.strokeStyle = armGlow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(shoulderX - side * 10, shoulderY);
        ctx.quadraticCurveTo(elbowX + side * 10, elbowY, handTargetX - side * 5, handTargetY - 10);
        ctx.stroke();

        // MÃO PREDATÓRIA GIGANTESCA ENVOLVENDO A BARRA DE FERRO
        ctx.save();
        ctx.translate(handTargetX, handTargetY);
        ctx.scale(side, 1);

        // Palma da mão e nós dos dedos
        ctx.fillStyle = '#010307';
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 24, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 5 Dedos longos e articulados com nós ósseos cravados na barra de ferro
        for (let f = 0; f < 5; f++) {
          const fY = -22 + f * 10;
          const fingerAngle = -0.3 + f * 0.16;
          const fLen = 34 + clawFlex;

          // Falange passando PELA FRENTE da barra de aço
          ctx.fillStyle = '#060a14';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(-22, fY - 5, 28, 10, 3);
          ctx.fill();
          ctx.stroke();

          // Nó da articulação
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(-11, fY, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Garra preta curvada de obsidiana cravada e raspando o ferro (Foice afiada)
          ctx.fillStyle = '#020408';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(-22, fY - 4);
          ctx.lineTo(-38, fY + 2 + clawFlex * 0.3);
          ctx.lineTo(-20, fY + 5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Ponta afiada da garra com reflexo especular prateado
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-37, fY, 2.5, 2.5);

          // Faíscas elétricas de fricção onde a garra raspa o aço
          if (pushIn > 0.35 && (Math.sin(t * 14 + f * 2) > 0.55)) {
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(-39, fY + 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore(); // restaura mão
        ctx.restore(); // restaura braço
      });

      // 10. HUD MILITAR / CFTV DE VIGILÂNCIA — ZERO SOBREPOSIÇÃO
      // Faixa Superior de Status com respiro amplo
      ctx.fillStyle = '#10b981';
      ctx.font = '800 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('● REC CAM 02', 60, 56);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ECLUSA DE PEDESTRES [IR NIGHT]', W * 0.50, 56);

      const frameSec = Math.floor(t % 60).toString().padStart(2, '0');
      const frameMs = Math.floor((t * 24) % 24).toString().padStart(2, '0');
      ctx.fillStyle = '#10b981';
      ctx.font = '800 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`23:44:${frameSec}:${frameMs}`, W - 60, 56);

      // Retículo Biométrico Dinâmico que Rastreia a Criatura
      const targetX = W * 0.50;
      const targetY = creatureY - 210;
      const boxW = 520;
      const boxH = 460;

      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([18, 12]);
      ctx.strokeRect(targetX - boxW * 0.5, targetY - boxH * 0.5, boxW, boxH);
      ctx.setLineDash([]);

      // Cantoneiras sólidas de alta tecnologia na mira
      const cornerSize = 28;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4.5;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(targetX - boxW * 0.5, targetY - boxH * 0.5 + cornerSize);
      ctx.lineTo(targetX - boxW * 0.5, targetY - boxH * 0.5);
      ctx.lineTo(targetX - boxW * 0.5 + cornerSize, targetY - boxH * 0.5);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(targetX + boxW * 0.5 - cornerSize, targetY - boxH * 0.5);
      ctx.lineTo(targetX + boxW * 0.5, targetY - boxH * 0.5);
      ctx.lineTo(targetX + boxW * 0.5, targetY - boxH * 0.5 + cornerSize);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(targetX - boxW * 0.5, targetY + boxH * 0.5 - cornerSize);
      ctx.lineTo(targetX - boxW * 0.5, targetY + boxH * 0.5);
      ctx.lineTo(targetX - boxW * 0.5 + cornerSize, targetY + boxH * 0.5);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(targetX + boxW * 0.5 - cornerSize, targetY + boxH * 0.5);
      ctx.lineTo(targetX + boxW * 0.5, targetY + boxH * 0.5);
      ctx.lineTo(targetX + boxW * 0.5, targetY + boxH * 0.5 - cornerSize);
      ctx.stroke();

      // Dados de Telemetria Biométrica Dinâmica
      const distM = (3.8 - pushIn * 3.4).toFixed(1);
      ctx.fillStyle = '#ef4444';
      ctx.font = '800 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('⚠️ ALVO NÃO-HUMANO DETECTADO (2.28m)', targetX - boxW * 0.5 + 24, targetY - boxH * 0.5 + 38);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText(`DISTÂNCIA: ${distM}m • APROXIMAÇÃO RÁPIDA`, targetX - boxW * 0.5 + 24, targetY - boxH * 0.5 + 68);
      ctx.fillText('STATUS: TENTATIVA DE FORÇAR GRADE', targetX - boxW * 0.5 + 24, targetY + boxH * 0.5 - 24);
      ctx.restore();

      // Vinheta periférica cinematográfica
      const vigGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.36, W * 0.5, H * 0.5, H * 0.72);
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(1, 'rgba(2, 6, 23, 0.75)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, W, H);

      // Scanlines CRT suaves de monitor de vigilância
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      for (let ly = 0; ly < H; ly += 4) {
        ctx.fillRect(0, ly, W, 2);
      }
    }

    /**
     * Tela CFTV de Alta Fidelidade Narrativa (Rua, Eclusa, Elevador e Garagem)
     */
    _drawCCTVScreen(ctx, c, idx) {
      const x = c.x;
      const y = c.y;
      const w = 54;
      const h = 38;

      // Moldura chanfrada de monitor profissional
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 2.5);
      ctx.fill();
      ctx.stroke();

      // Tela útil interna
      const sx = x + 2.5;
      const sy = y + 2.5;
      const sw = w - 5;
      const sh = h - 5;

      ctx.save();
      ctx.beginPath();
      ctx.rect(sx, sy, sw, sh);
      ctx.clip();

      if (idx === 0) {
        // CAM 01 · RUA EXTERNA
        if (this.streetBlackout) {
          // Estática CRT analógica quando os postes apagam
          ctx.fillStyle = '#030712';
          ctx.fillRect(sx, sy, sw, sh);
          for (let s = 0; s < 14; s++) {
            ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.8)';
            ctx.fillRect(sx + Math.random() * sw, sy + Math.random() * sh, Math.random() * 8 + 2, 1.5);
          }
          const barY = sy + ((this.time * 45) % sh);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.fillRect(sx, barY, sw, 5);

          ctx.fillStyle = '#ef4444';
          ctx.font = '700 5.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SEM SINAL', sx + sw / 2, sy + sh / 2 + 2);
        } else {
          // Rua asfaltada chuvosa com poste aceso
          ctx.fillStyle = '#060f1d';
          ctx.fillRect(sx, sy, sw, sh);
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(sx, sy + 18);
          ctx.lineTo(sx + sw, sy + 14);
          ctx.lineTo(sx + sw, sy + sh);
          ctx.lineTo(sx, sy + sh);
          ctx.closePath();
          ctx.fill();

          // Poste com facho de luz amarela
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(sx + 36, sy + 4, 1.5, 22);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(sx + 36.7, sy + 4, 2, 0, Math.PI * 2);
          ctx.fill();

          const streetGlow = ctx.createRadialGradient(sx + 36.7, sy + 4, 1, sx + 36.7, sy + 18, 18);
          streetGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
          streetGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = streetGlow;
          ctx.beginPath();
          ctx.moveTo(sx + 36.7, sy + 4);
          ctx.lineTo(sx + 20, sy + sh);
          ctx.lineTo(sx + sw, sy + sh);
          ctx.closePath();
          ctx.fill();
        }
      } else if (idx === 1) {
        // CAM 02 · ECLUSA DE PEDESTRES
        ctx.fillStyle = '#06131f';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(sx, sy + 16, sw, sh - 16);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        for (let gx = sx + 4; gx < sx + sw; gx += 6) {
          ctx.beginPath();
          ctx.moveTo(gx, sy + 2);
          ctx.lineTo(gx, sy + 28);
          ctx.stroke();
        }
        const isLocked = this.streetBlackout;
        ctx.fillStyle = isLocked ? '#ef4444' : '#10b981';
        ctx.beginPath();
        ctx.arc(sx + sw - 6, sy + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        if (isLocked) {
          if (Math.sin(this.time * 6) > 0) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
            ctx.font = '700 4.5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PORTÃO TRAVADO', sx + sw / 2, sy + sh - 4);
          }
        }
      } else if (idx === 2) {
        // CAM 03 · ELEVADOR DE SERVIÇO
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(sx + 8, sy + 4, sw - 16, sh - 8);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx + sw / 2, sy + 4);
        ctx.lineTo(sx + sw / 2, sy + sh - 4);
        ctx.stroke();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx + 10, sy + 20);
        ctx.lineTo(sx + sw - 10, sy + 20);
        ctx.stroke();
        ctx.fillStyle = '#020617';
        ctx.fillRect(sx + sw / 2 - 5, sy + 6, 10, 5);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '700 4px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('3 ▲', sx + sw / 2, sy + 10);
      } else {
        // CAM 04 · GARAGEM / SUBSOLO
        ctx.fillStyle = '#090d16';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(sx, sy + sh);
        ctx.lineTo(sx + sw, sy + 14);
        ctx.lineTo(sx + sw, sy + sh);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.2;
        for (let rx = sx + 6; rx < sx + sw; rx += 8) {
          ctx.beginPath();
          ctx.moveTo(rx, sy + sh);
          ctx.lineTo(rx + 4, sy + sh - 6);
          ctx.stroke();
        }
        ctx.fillStyle = '#334155';
        ctx.fillRect(sx + 6, sy + 4, 8, 22);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 4px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('G1', sx + 10, sy + 12);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(sx + 24, sy + 16, 18, 10, 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx + 25, sy + 20, 2, 2);
        ctx.fillRect(sx + 39, sy + 20, 2, 2);
      }

      // Linhas CRT sutis
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      for (let ly = sy; ly < sy + sh; ly += 2.5) {
        ctx.fillRect(sx, ly, sw, 1);
      }

      // HUD no topo
      const blink = Math.sin(this.time * 5) > 0;
      ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(sx + 4, sy + 4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = '700 5px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(c.label, sx + 7, sy + 5.5);

      ctx.restore();
    }
  }

  global.StudioScenarios = global.StudioScenarios || {};
  global.StudioScenarios.PortariaBlocoC = PortariaBlocoC;
})(typeof window !== 'undefined' ? window : globalThis);
