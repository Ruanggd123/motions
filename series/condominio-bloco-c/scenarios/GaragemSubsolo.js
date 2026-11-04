/**
 * Cenário Modular Reutilizável 03: GARAGEM SUBSOLO G1 & QUADRO DE FORÇA (Bloco C)
 * Arquitetura Multi-Camada 2.5D com Parallax Real para Reuso nos Episódios 02+
 * Elementos: Pilares de concreto com pintura zebrada amarela/preta, tubulação de incêndio
 * vermelha no teto, carros estacionados na penumbra, Quadro Geral de Disjuntores e Rampa Trancada.
 */
(function (global) {
  class GaragemSubsolo {
    constructor(options = {}) {
      this.id = 'GARAGEM_SUBSOLO';
      this.name = 'Garagem Subsolo G1 & Quadro de Força';
      this.flickerLights = options.flickerLights !== false;
      this.time = 0;
    }

    update(dt) {
      this.time += dt;
    }

    drawBackground(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX * 0.15, -camY * 0.15);

      // Fundo profundo da garagem subterrânea e Rampa de Saída Trancada
      ctx.fillStyle = '#03060c';
      ctx.fillRect(-300, -100, 2520, 1200);

      // Portão Basculante da Rampa da Garagem ao fundo (Vedado pela Neblina Externa)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(680, 220, 560, 440);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      for (let gy = 240; gy < 650; gy += 28) {
        ctx.beginPath();
        ctx.moveTo(680, gy);
        ctx.lineTo(1240, gy);
        ctx.stroke();
      }

      // Neblina vazando por baixo da fresta do portão da garagem
      const leakGrad = ctx.createLinearGradient(960, 580, 960, 720);
      leakGrad.addColorStop(0, 'rgba(226, 232, 240, 0.45)');
      leakGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
      ctx.fillStyle = leakGrad;
      ctx.fillRect(660, 580, 600, 140);

      ctx.restore();
    }

    drawMidground(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX * 0.5, -camY * 0.5);

      // Teto de laje nervurada de concreto com Tubulação Vermelha de Hidrante
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(-300, -80, 2520, 230);

      // Tubo vermelho de incêndio percorrendo o teto do subsolo
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-300, 118, 2520, 18);
      ctx.fillStyle = '#7f1d1d';
      for (let px = 100; px < 1900; px += 280) {
        ctx.fillRect(px, 95, 12, 45);
      }

      // Pilares de Concreto com Faixas Zebradas Amarelas/Pretas (Vagas G1-01 a G1-04)
      const pillars = [240, 720, 1240, 1680];
      pillars.forEach((px, idx) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, 145, 95, 545);

        // Faixa de sinalização amarela e preta no meio do pilar
        ctx.fillStyle = '#eab308';
        ctx.fillRect(px, 410, 95, 115);
        ctx.fillStyle = '#09090b';
        for (let sy = 415; sy < 515; sy += 26) {
          ctx.beginPath();
          ctx.moveTo(px, sy);
          ctx.lineTo(px + 95, sy - 18);
          ctx.lineTo(px + 95, sy - 6);
          ctx.lineTo(px, sy + 12);
          ctx.closePath();
          ctx.fill();
        }

        // Placa da vaga "VAGA 302"
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 12, 230, 71, 28);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '700 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`G1 • 30${idx + 1}`, px + 47, 248);
      });

      // Silhueta de SUV Estacionado na Vaga Escura (Esquerda)
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(360, 480, 290, 195, 22);
      ctx.fill();
      ctx.stroke();

      // Quadro Geral de Força / Gerador de Emergência na Parede Direita
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.fillRect(1420, 310, 150, 210);
      ctx.strokeRect(1420, 310, 150, 210);

      // Placa "PERIGO: ALTA TENSÃO 380V"
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(1495, 345);
      ctx.lineTo(1520, 390);
      ctx.lineTo(1470, 390);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawFloor(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX, -camY);

      // Piso de Epóxi Cinza Industrial da Garagem com Faixas de Demarcação Amarelas
      const floorGrad = ctx.createLinearGradient(0, 685, 0, 1080);
      floorGrad.addColorStop(0, '#0f172a');
      floorGrad.addColorStop(1, '#020617');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(-400, 685, 2720, 420);

      // Faixas amarelas de demarcação de vagas no chão
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
      ctx.lineWidth = 4;
      [340, 820, 1340].forEach((vx) => {
        ctx.beginPath();
        ctx.moveTo(vx, 695);
        ctx.lineTo(vx - 90, 960);
        ctx.stroke();
      });

      ctx.restore();
    }

    drawForeground(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX * 1.35, -camY * 1.35);

      // Luminária Fluorescente Tubular Piscando no Teto
      const flicker = !this.flickerLights || Math.sin(this.time * 19) > -0.65 ? 0.14 : 0.02;
      const cone = ctx.createLinearGradient(960, 130, 960, 860);
      cone.addColorStop(0, `rgba(186, 230, 253, ${flicker})`);
      cone.addColorStop(1, 'rgba(186, 230, 253, 0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(780, 135);
      ctx.lineTo(1140, 135);
      ctx.lineTo(1420, 880);
      ctx.lineTo(500, 880);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  global.StudioScenarios = global.StudioScenarios || {};
  global.StudioScenarios.GaragemSubsolo = GaragemSubsolo;
})(typeof window !== 'undefined' ? window : globalThis);
