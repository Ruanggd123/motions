/**
 * Cenário Modular Reutilizável 04: EXTERIOR DO CONDOMÍNIO SOLARIS (Vista Lateral)
 * Fachada lateral do Bloco C + Guarita Blindada em contexto arquitetônico real
 * Proporção correta: prédio de 8 andares, guarita anexa, rua asfaltada, calçada
 * Camada 0: Céu noturno urbano, prédios vizinhos distantes, lua encoberta
 * Camada 1: Fachada lateral do Bloco C (8 andares, varandas, ar-condicionado)
 * Camada 2: Guarita blindada anexa à fachada (vidro, estrutura metálica, telhado)
 * Camada 3: Rua asfaltada, calçada, meio-fio, poste, moto do entregador
 * Camada 4: Neblina volumétrica, chuva diagonal, sombras projetadas
 */
(function (global) {
  class ExteriorCondominio {
    constructor(options = {}) {
      this.id = 'EXTERIOR_CONDOMINIO';
      this.name = 'Exterior Condomínio Solaris (Vista Lateral)';
      this.fogDensity = options.fogDensity !== undefined ? options.fogDensity : 0.7;
      this.streetBlackout = options.streetBlackout !== undefined ? options.streetBlackout : false;
      this.alarmActive = options.alarmActive !== undefined ? options.alarmActive : false;
      this.spotlightOn = options.spotlightOn !== undefined ? options.spotlightOn : false;
      // Massa negra engolindo a rua (0 = longe na neblina, 1 = na calçada)
      this.blackMass = options.blackMass !== undefined ? options.blackMass : 0;
      // Deformação da grade da eclusa sob impacto da criatura (0 a 1)
      this.gateStrain = options.gateStrain !== undefined ? options.gateStrain : 0;
      this.time = 0;

      this.rainDrops = Array.from({ length: 80 }, (_, i) => ({
        x: (i * 47) % 2200,
        y: (i * 91) % 1200,
        len: 22 + (i % 16),
        speed: 580 + (i % 7) * 85
      }));

      this.windows = [];
      for (let floor = 0; floor < 8; floor++) {
        for (let col = 0; col < 4; col++) {
          this.windows.push({
            floor, col,
            lit: Math.random() > 0.4,
            flicker: Math.random() * 6.28,
            warmth: 0.3 + Math.random() * 0.5
          });
        }
      }
    }

    update(dt) {
      this.time += dt;
      for (let i = 0; i < this.rainDrops.length; i++) {
        const r = this.rainDrops[i];
        r.y += r.speed * dt;
        r.x -= 75 * dt;
        if (r.y > 1200) {
          r.y = -40;
          r.x = (r.x + 2200) % 2200;
        }
      }
    }

    /** CAMADA 0: Céu Noturno Urbano + Prédios Vizinhos Distantes */
    drawSkyAndDistantBuildings(ctx, parallaxX = 0) {
      ctx.save();
      ctx.translate(parallaxX * 0.15, 0);
      const skyGrad = ctx.createLinearGradient(0, -200, 0, 900);
      skyGrad.addColorStop(0, '#020408');
      skyGrad.addColorStop(0.4, this.streetBlackout ? '#030610' : '#0a1628');
      skyGrad.addColorStop(1, '#0c1220');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-400, -300, 2800, 1400);

      if (!this.streetBlackout) {
        const moonGlow = ctx.createRadialGradient(1600, 80, 15, 1600, 80, 280);
        moonGlow.addColorStop(0, 'rgba(203, 213, 225, 0.18)');
        moonGlow.addColorStop(0.5, 'rgba(148, 163, 184, 0.06)');
        moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(1600, 80, 280, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#060b16';
      const distantBuildings = [
        [-100, 280, 180, 620], [120, 340, 140, 560], [300, 260, 200, 640],
        [1700, 300, 160, 600], [1900, 350, 190, 550], [2150, 270, 170, 630]
      ];
      distantBuildings.forEach(([bx, by, bw, bh]) => {
        ctx.fillRect(bx, by, bw, bh);
        if (!this.streetBlackout) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
          for (let wy = by + 30; wy < by + bh - 60; wy += 55) {
            for (let wx = bx + 15; wx < bx + bw - 20; wx += 40) {
              if ((wx + wy) % 5 === 0) ctx.fillRect(wx, wy, 12, 18);
            }
          }
          ctx.fillStyle = '#060b16';
        }
      });
      ctx.restore();
    }

    /** CAMADA 1: Fachada Lateral do Bloco C (8 Andares) */
    drawBuildingFacade(ctx, parallaxX = 0) {
      ctx.save();
      ctx.translate(parallaxX * 0.4, 0);
      const facadeX = 480, facadeY = 120, facadeW = 520, facadeH = 780;

      const wallGrad = ctx.createLinearGradient(facadeX, facadeY, facadeX + facadeW, facadeY + facadeH);
      wallGrad.addColorStop(0, '#1a2332');
      wallGrad.addColorStop(0.5, '#151d2b');
      wallGrad.addColorStop(1, '#0f1620');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(facadeX, facadeY, facadeW, facadeH);

      ctx.strokeStyle = '#243044';
      ctx.lineWidth = 2;
      for (let floor = 0; floor <= 8; floor++) {
        const ly = facadeY + floor * 97.5;
        ctx.beginPath(); ctx.moveTo(facadeX, ly); ctx.lineTo(facadeX + facadeW, ly); ctx.stroke();
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      for (let floor = 0; floor < 8; floor++) {
        const balconyY = facadeY + floor * 97.5 + 65;
        ctx.beginPath(); ctx.moveTo(facadeX + 20, balconyY); ctx.lineTo(facadeX + facadeW - 20, balconyY); ctx.stroke();
        for (let gx = facadeX + 40; gx < facadeX + facadeW - 20; gx += 35) {
          ctx.beginPath(); ctx.moveTo(gx, balconyY); ctx.lineTo(gx, balconyY + 28); ctx.stroke();
        }
      }

      for (const win of this.windows) {
        const wx = facadeX + 45 + win.col * 115;
        const wy = facadeY + win.floor * 97.5 + 18;
        const ww = 70, wh = 42;
        if (win.lit && !this.streetBlackout) {
          const flick = 0.7 + Math.sin(this.time * 1.5 + win.flicker) * 0.15;
          const alpha = win.warmth * flick;
          const winGlow = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 5, wx + ww / 2, wy + wh / 2, 60);
          winGlow.addColorStop(0, `rgba(253, 224, 71, ${alpha * 0.4})`);
          winGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = winGlow;
          ctx.fillRect(wx - 15, wy - 15, ww + 30, wh + 30);
          ctx.fillStyle = `rgba(254, 240, 138, ${alpha * 0.65})`;
          ctx.fillRect(wx, wy, ww, wh);
        } else {
          ctx.fillStyle = '#0a1018';
          ctx.fillRect(wx, wy, ww, wh);
          ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
          ctx.strokeRect(wx, wy, ww, wh);
        }
      }

      ctx.fillStyle = '#2d3748';
      for (let floor = 0; floor < 8; floor++) {
        for (let col = 0; col < 4; col++) {
          if ((floor + col) % 3 === 0) {
            const acX = facadeX + 45 + col * 115 + 75;
            const acY = facadeY + floor * 97.5 + 52;
            ctx.fillRect(acX, acY, 28, 18);
            ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 0.8;
            ctx.strokeRect(acX, acY, 28, 18);
            if (Math.sin(this.time * 2 + floor + col) > 0.7) {
              ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
              ctx.fillRect(acX + 12, acY + 18, 2, 4 + Math.sin(this.time * 4) * 2);
              ctx.fillStyle = '#2d3748';
            }
          }
        }
      }
      ctx.restore();
    }

    /** CAMADA 2: Guarita Blindada Anexa (Proporção Realista) */
    drawGuardHouse(ctx, parallaxX = 0) {
      ctx.save();
      ctx.translate(parallaxX * 0.55, 0);
      const ghX = 280, ghY = 680, ghW = 200, ghH = 220;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ghX - 5, ghY + ghH - 30, ghW + 10, 30);

      const frameGrad = ctx.createLinearGradient(ghX, ghY, ghX + ghW, ghY + ghH);
      frameGrad.addColorStop(0, '#334155');
      frameGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = frameGrad;
      ctx.fillRect(ghX, ghY, ghW, ghH - 30);

      const glassGrad = ctx.createLinearGradient(ghX + 10, ghY + 15, ghX + ghW - 10, ghY + ghH - 40);
      glassGrad.addColorStop(0, 'rgba(30, 58, 95, 0.85)');
      glassGrad.addColorStop(0.3, 'rgba(51, 65, 85, 0.7)');
      glassGrad.addColorStop(0.7, 'rgba(30, 41, 59, 0.8)');
      glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(ghX + 10, ghY + 15, ghW - 20, ghH - 55);

      if (!this.streetBlackout) {
        const interiorLight = ctx.createRadialGradient(
          ghX + ghW / 2, ghY + ghH / 2 - 20, 10,
          ghX + ghW / 2, ghY + ghH / 2 - 20, 90
        );
        interiorLight.addColorStop(0, 'rgba(253, 224, 71, 0.12)');
        interiorLight.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = interiorLight;
        ctx.fillRect(ghX + 10, ghY + 15, ghW - 20, ghH - 55);
      }

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(ghX + 10, ghY + 15, ghW - 20, ghH - 55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ghX + ghW / 2, ghY + 15);
      ctx.lineTo(ghX + ghW / 2, ghY + ghH - 40);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(ghX - 15, ghY);
      ctx.lineTo(ghX + ghW + 15, ghY);
      ctx.lineTo(ghX + ghW + 10, ghY - 18);
      ctx.lineTo(ghX - 10, ghY - 18);
      ctx.closePath();
      ctx.fill();

      if (this.alarmActive) {
        const pulse = Math.sin(this.time * 8) * 0.5 + 0.5;
        const alarmGlow = ctx.createRadialGradient(
          ghX + ghW / 2, ghY - 25, 3,
          ghX + ghW / 2, ghY - 25, 35
        );
        alarmGlow.addColorStop(0, `rgba(239, 68, 68, ${pulse * 0.9})`);
        alarmGlow.addColorStop(0.5, `rgba(239, 68, 68, ${pulse * 0.3})`);
        alarmGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = alarmGlow;
        ctx.beginPath();
        ctx.arc(ghX + ghW / 2, ghY - 25, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(ghX + ghW / 2, ghY - 25, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Holofote montado no teto da guarita
      ctx.fillStyle = '#475569';
      ctx.fillRect(ghX + ghW - 30, ghY - 22, 20, 8);
      if (this.spotlightOn) {
        const beamOriginX = ghX + ghW - 20;
        const beamOriginY = ghY - 18;
        const beamGrad = ctx.createRadialGradient(
          beamOriginX, beamOriginY, 5,
          beamOriginX - 180, beamOriginY + 200, 280
        );
        beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        beamGrad.addColorStop(0.3, 'rgba(254, 249, 195, 0.35)');
        beamGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.12)');
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamOriginX, beamOriginY);
        ctx.lineTo(beamOriginX - 260, beamOriginY + 320);
        ctx.lineTo(beamOriginX - 80, beamOriginY + 340);
        ctx.closePath();
        ctx.fill();

        // Lens flare anamórfico na origem
        const flareGrad = ctx.createRadialGradient(beamOriginX, beamOriginY, 2, beamOriginX, beamOriginY, 40);
        flareGrad.addColorStop(0, '#ffffff');
        flareGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.6)');
        flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(beamOriginX, beamOriginY, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    /** CAMADA 3: Rua Asfaltada, Calçada, Meio-Fio e Poste */
    drawStreetAndSidewalk(ctx, parallaxX = 0) {
      ctx.save();
      ctx.translate(parallaxX * 0.6, 0);

      // Calçada de concreto
      const sidewalkGrad = ctx.createLinearGradient(0, 900, 0, 960);
      sidewalkGrad.addColorStop(0, '#334155');
      sidewalkGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = sidewalkGrad;
      ctx.fillRect(-200, 900, 2400, 60);

      // Meio-fio
      ctx.fillStyle = '#475569';
      ctx.fillRect(-200, 958, 2400, 8);

      // Rua asfaltada
      const roadGrad = ctx.createLinearGradient(0, 966, 0, 1200);
      roadGrad.addColorStop(0, '#1a1a2e');
      roadGrad.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(-200, 966, 2400, 234);

      // Faixa de pedestre desbotada
      ctx.fillStyle = 'rgba(203, 213, 225, 0.15)';
      for (let stripe = 0; stripe < 8; stripe++) {
        ctx.fillRect(620 + stripe * 55, 970, 35, 220);
      }

      // Poças d'água reflexivas na rua
      ctx.fillStyle = 'rgba(30, 58, 95, 0.25)';
      const puddles = [[350, 1020, 120, 18], [780, 1080, 90, 14], [1200, 1040, 140, 20]];
      puddles.forEach(([px, py, pw, ph]) => {
        ctx.beginPath();
        ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
        // Reflexo especular na poça
        if (!this.streetBlackout) {
          const refGrad = ctx.createRadialGradient(px, py, 3, px, py, pw * 0.6);
          refGrad.addColorStop(0, 'rgba(253, 224, 71, 0.08)');
          refGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = refGrad;
          ctx.beginPath();
          ctx.ellipse(px, py, pw * 0.6, ph * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Poste de iluminação pública
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(180, 520, 8, 440);
      ctx.beginPath();
      ctx.moveTo(180, 520);
      ctx.lineTo(240, 505);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      if (!this.streetBlackout) {
        const lampGlow = ctx.createRadialGradient(240, 510, 6, 240, 560, 220);
        lampGlow.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
        lampGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(240, 540, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moto do entregador parada na rua
      ctx.save();
      ctx.translate(680, 980);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(-32, 22, 18, 0, Math.PI * 2);
      ctx.arc(32, 22, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(-25, 12); ctx.lineTo(15, -8); ctx.lineTo(28, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-44, -22, 26, 24);
      // Bag de delivery na moto
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-50, -38, 32, 20);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-49, -30, 30, 3);
      // Pisca-alerta
      const blinkerOn = Math.sin(this.time * 7) > 0;
      if (blinkerOn) {
        const blinkGlow = ctx.createRadialGradient(34, -4, 2, 34, -4, 80);
        blinkGlow.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
        blinkGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = blinkGlow;
        ctx.beginPath();
        ctx.arc(34, -4, 80, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    }

    /** CAMADA 4: Neblina Volumétrica + Chuva Diagonal */
    drawFogAndRain(ctx) {
      // Chuva diagonal
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.22)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < this.rainDrops.length; i++) {
        const r = this.rainDrops[i];
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 12, r.y + r.len);
      }
      ctx.stroke();

      // Neblina volumétrica dinâmica
      if (this.fogDensity > 0.05) {
        const fogShift = Math.sin(this.time * 0.5) * 40;
        // Camada inferior densa
        const fogLow = ctx.createLinearGradient(0, 700, 0, 1100);
        fogLow.addColorStop(0, `rgba(203, 213, 225, 0)`);
        fogLow.addColorStop(0.4, `rgba(203, 213, 225, ${this.fogDensity * 0.35})`);
        fogLow.addColorStop(0.8, `rgba(148, 163, 184, ${this.fogDensity * 0.55})`);
        fogLow.addColorStop(1, `rgba(100, 116, 139, ${this.fogDensity * 0.7})`);
        ctx.fillStyle = fogLow;
        ctx.fillRect(-200 + fogShift * 0.3, 700, 2400, 400);

        // Camada superior difusa
        const fogHigh = ctx.createLinearGradient(0, 200, 0, 600);
        fogHigh.addColorStop(0, `rgba(148, 163, 184, 0)`);
        fogHigh.addColorStop(0.5, `rgba(203, 213, 225, ${this.fogDensity * 0.12})`);
        fogHigh.addColorStop(1, `rgba(203, 213, 225, 0)`);
        ctx.fillStyle = fogHigh;
        ctx.fillRect(-200 - fogShift * 0.2, 200, 2400, 400);
      }
    }

    /**
     * CAMADA 3B: A MASSA NEGRA COLOSSAL engolindo a rua e os postes.
     * Avança conforme this.blackMass e devora as luzes conforme passa.
     */
    drawBlackMass(ctx) {
      if (this.blackMass <= 0.001) return;
      const m = this.blackMass;

      ctx.save();

      // Parede de vazio que sobe do asfalto e come os postes
      const wallBase = 1180 - m * 420;
      const massGrad = ctx.createLinearGradient(0, wallBase - 620, 0, wallBase + 120);
      massGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      massGrad.addColorStop(0.45, `rgba(0, 0, 0, ${0.72 * m})`);
      massGrad.addColorStop(0.8, `rgba(1, 2, 8, ${0.96 * m})`);
      massGrad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(1, m * 1.15)})`);
      ctx.fillStyle = massGrad;
      ctx.fillRect(-300, wallBase - 620, 2600, 780);

      // Volutas e protuberâncias viscosas na borda superior
      ctx.fillStyle = `rgba(0, 0, 0, ${0.9 * m})`;
      for (let i = 0; i < 11; i++) {
        const bx = -200 + i * 210 + Math.sin(this.time * 1.4 + i) * 40;
        const by = wallBase + Math.cos(this.time * 1.9 + i * 1.3) * 48;
        const rx = 120 + (i % 3) * 46;
        const ry = 84 + Math.sin(this.time * 2.2 + i) * 34;
        ctx.beginPath();
        ctx.ellipse(bx, by, rx, ry, Math.sin(this.time + i) * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tentáculos finos que rastejam para frente, na direção da calçada
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.92 * m})`;
      ctx.lineCap = 'round';
      for (let t2 = 0; t2 < 7; t2++) {
        const reach = (60 + Math.abs(Math.sin(this.time * 0.9 + t2 * 1.7)) * 190) * m;
        const baseX = 120 + t2 * 260;
        ctx.lineWidth = 14 - t2 * 1.2;
        ctx.beginPath();
        ctx.moveTo(baseX, wallBase + 40);
        ctx.quadraticCurveTo(
          baseX + Math.sin(this.time * 1.6 + t2) * 80,
          wallBase + 100 + reach * 0.4,
          baseX + Math.cos(this.time + t2) * 120,
          wallBase + 130 + reach
        );
        ctx.stroke();
      }

      // Olhos carmesins que acendem dentro da massa
      for (let e = 0; e < 5; e++) {
        const ex = 140 + e * 230 + Math.sin(this.time * 1.1 + e) * 30;
        const ey = wallBase + 30 + (e % 2) * 60;
        const blink = Math.max(0, Math.sin(this.time * 3.4 + e * 2.1));
        if (blink > 0.25) {
          ctx.fillStyle = `rgba(239, 68, 68, ${blink * 0.9 * m})`;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.ellipse(ex, ey, 11, 4.5 * blink, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // A massa apaga a luz do poste conforme avança
      if (m > 0.4) {
        ctx.fillStyle = `rgba(1, 2, 6, ${(m - 0.4) * 1.5})`;
        ctx.fillRect(160, 480, 110, 470);
      }

      ctx.restore();
    }

    /**
     * CAMADA 3C: GRADE DA ECLUSA EM PRIMEIRO PLANO.
     * É nela que o Lucas se agarra e que a criatura força (gateStrain).
     */
    drawGateForeground(ctx) {
      const strain = Math.max(0, Math.min(1, this.gateStrain));
      const topY = 620;
      const botY = 1240;
      const leftX = 300;
      const rightX = 1500;

      ctx.save();

      // Moldura da eclusa
      ctx.strokeStyle = '#0b1220';
      ctx.lineWidth = 16;
      ctx.strokeRect(leftX - 12, topY - 14, rightX - leftX + 24, botY - topY + 28);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.strokeRect(leftX - 4, topY - 6, rightX - leftX + 8, botY - topY + 12);

      // Barras verticais — entortam no meio quando a criatura força
      const barCount = 15;
      for (let i = 0; i < barCount; i++) {
        const bx = leftX + (i / (barCount - 1)) * (rightX - leftX);
        const midDist = 1 - Math.abs(i / (barCount - 1) - 0.5) * 2;
        const bend = Math.sin(this.time * 15) * 5 * strain * midDist + strain * midDist * 26;
        const barGrad = ctx.createLinearGradient(bx - 10, 0, bx + 10, 0);
        barGrad.addColorStop(0, '#050810');
        barGrad.addColorStop(0.45, '#64748b');
        barGrad.addColorStop(0.6, '#94a3b8');
        barGrad.addColorStop(1, '#050810');
        ctx.strokeStyle = barGrad;
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx, topY);
        ctx.quadraticCurveTo(bx + bend, (topY + botY) / 2, bx + bend * 0.35, botY);
        ctx.stroke();
      }

      // Travessas horizontais
      const rails = [topY, topY + 210, botY - 210, botY];
      ctx.lineCap = 'butt';
      rails.forEach((ry, idx) => {
        const sag = (idx === 1 || idx === 2) ? strain * 18 : 0;
        const railGrad = ctx.createLinearGradient(0, ry - 9, 0, ry + 9);
        railGrad.addColorStop(0, '#050810');
        railGrad.addColorStop(0.5, '#64748b');
        railGrad.addColorStop(1, '#050810');
        ctx.strokeStyle = railGrad;
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.moveTo(leftX - 20, ry + sag);
        ctx.lineTo(rightX + 20, ry + sag);
        ctx.stroke();
      });

      // Marcas de garra e raspagem na grade (continuidade do Ep. 02)
      ctx.strokeStyle = `rgba(226, 232, 240, ${0.16 + strain * 0.4})`;
      ctx.lineWidth = 2;
      for (let g = 0; g < 7; g++) {
        const gx = leftX + 90 + g * 165;
        const gy = topY + 250 + (g % 3) * 190;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(gx + k * 9, gy);
          ctx.lineTo(gx + k * 9 - 14, gy + 46);
          ctx.stroke();
        }
      }

      // Faíscas onde o metal cede
      if (strain > 0.25) {
        for (let s = 0; s < 8; s++) {
          if (Math.sin(this.time * 22 + s * 3.7) > 0.55) {
            const sx = leftX + 200 + s * 150;
            const sy = (topY + botY) / 2 + Math.sin(s * 2.3) * 180;
            const spark = ctx.createRadialGradient(sx, sy, 1, sx, sy, 26);
            spark.addColorStop(0, `rgba(255, 255, 255, ${strain})`);
            spark.addColorStop(0.4, `rgba(253, 224, 71, ${strain * 0.7})`);
            spark.addColorStop(1, 'rgba(253, 224, 71, 0)');
            ctx.fillStyle = spark;
            ctx.beginPath();
            ctx.arc(sx, sy, 26, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    }

    /** Renderiza todas as camadas na ordem correta */
    drawAll(ctx, parallaxX = 0) {
      this.drawSkyAndDistantBuildings(ctx, parallaxX);
      this.drawBuildingFacade(ctx, parallaxX);
      this.drawStreetAndSidewalk(ctx, parallaxX);
      this.drawBlackMass(ctx);
      this.drawGuardHouse(ctx, parallaxX);
      this.drawFogAndRain(ctx);
    }
  }

  global.StudioEngine = global.StudioEngine || {};
  global.StudioEngine.ExteriorCondominio = ExteriorCondominio;
})(typeof window !== 'undefined' ? window : globalThis);