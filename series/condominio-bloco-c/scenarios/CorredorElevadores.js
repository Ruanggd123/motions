/**
 * Cenário Modular Reutilizável 02: CORREDOR DOS ELEVADORES & HALL DE CORRESPONDÊNCIAS (Bloco C)
 * Arquitetura Multi-Camada 2.5D com Parallax Real para Reuso nos Episódios 01 a 05+
 * Elementos: 2 Elevadores (Social e Serviço) com visor digital vermelho animado,
 * Painel de Caixas de Correio (Aptos 101 a 404), Porta Corta-Fogo Verde com barra antipânico
 * e iluminação de emergência piscando.
 */
(function (global) {
  class CorredorElevadores {
    constructor(options = {}) {
      this.id = 'CORREDOR_ELEVADORES';
      this.name = 'Hall dos Elevadores & Caixas de Correio';
      this.currentFloor = options.currentFloor || '4º';
      this.goingDown = options.goingDown !== false;
      this.doorOpenRatio = options.doorOpenRatio || 0; // 0.0 (fechado) a 1.0 (aberto)
      this.emergencyMode = options.emergencyMode || false;
      this.time = 0;
    }

    update(dt) {
      this.time += dt;
    }

    drawBackground(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX * 0.15, -camY * 0.15);

      // Fundo do Fosso / Interior escuro do Elevador Social (Visível quando a porta abre)
      ctx.fillStyle = '#030712';
      ctx.fillRect(-200, -100, 2320, 1200);

      // Interior iluminado em vermelho-escuro da cabine do elevador (Centro X: 740 a 1020)
      const cabinGrad = ctx.createLinearGradient(880, 240, 880, 690);
      cabinGrad.addColorStop(0, '#450a0a');
      cabinGrad.addColorStop(0.5, '#18181b');
      cabinGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = cabinGrad;
      ctx.fillRect(740, 240, 280, 450);

      // Espelho interno do elevador com reflexo diagonal misterioso
      ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.fillRect(775, 275, 210, 210);
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.strokeRect(775, 275, 210, 210);

      ctx.restore();
    }

    drawMidground(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX * 0.5, -camY * 0.5);

      // 1. TETO DO HALL COM LUMINÁRIAS EMBUTIDAS E BLOCO DE EMERGÊNCIA
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-300, -100, 2520, 235);

      // Paredes do Hall em Cimento Queimado & Madeira Escura
      const wallGrad = ctx.createLinearGradient(0, 135, 0, 685);
      wallGrad.addColorStop(0, '#1e293b');
      wallGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(-300, 135, 2520, 550);

      // 2. ESQUERDA: PAINEL DE CAIXAS DE CORREIO CONDOMINIAIS (Aptos 101 a 404)
      ctx.fillStyle = '#291d16';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(90, 230, 460, 310, 6);
      ctx.fill();
      ctx.stroke();

      const apts = [
        ['101', '102', '103', '104'],
        ['201', '202', '203', '204'],
        ['301', '302', '303', '304'],
        ['401', '402', '403', '404']
      ];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const bx = 112 + c * 106;
          const by = 252 + r * 68;
          const aptNum = apts[r][c];
          const is4thFloor = r === 3;

          ctx.fillStyle = is4thFloor ? '#1e293b' : '#334155';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.fillRect(bx, by, 94, 56);
          ctx.strokeRect(bx, by, 94, 56);

          // Fresta de carta (No 4º andar tem fita crepe amarela vedando a caixa!)
          if (is4thFloor) {
            ctx.fillStyle = '#eab308';
            ctx.fillRect(bx + 12, by + 16, 70, 8);
          } else {
            ctx.fillStyle = '#090d16';
            ctx.fillRect(bx + 16, by + 18, 62, 5);
          }

          // Plaquinha do número do apartamento
          ctx.fillStyle = aptNum === '302' ? '#38bdf8' : '#cbd5e1';
          ctx.font = '700 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`AP ${aptNum}`, bx + 47, by + 44);
        }
      }

      // 3. CENTRO: ELEVADOR SOCIAL (Com Visor Digital "4º ⬇" Piscando em Vermelho)
      // Moldura de Granito Preto ao redor do Elevador Social
      ctx.fillStyle = '#090d16';
      ctx.fillRect(715, 215, 330, 470);

      // Display Digital de Led Vermelho no Topo do Elevador
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(805, 152, 150, 50, 6);
      ctx.fill();
      ctx.stroke();

      const pulseRed = 0.75 + Math.sin(this.time * 8) * 0.25;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulseRed})`;
      ctx.font = '700 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.currentFloor} ${this.goingDown ? '⬇' : '•'}`, 880, 187);

      // Folhas de Aço Escovado da Porta do Elevador Social (Com suporte a abertura)
      const slideOffset = this.doorOpenRatio * 125;
      const doorGrad = ctx.createLinearGradient(740, 240, 1020, 685);
      doorGrad.addColorStop(0, '#64748b');
      doorGrad.addColorStop(0.5, '#94a3b8');
      doorGrad.addColorStop(1, '#475569');

      // Folha Esquerda
      ctx.fillStyle = doorGrad;
      ctx.fillRect(740 - slideOffset, 240, 140, 445);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(740 - slideOffset, 240, 140, 445);

      // Folha Direita
      ctx.fillRect(880 + slideOffset, 240, 140, 445);
      ctx.strokeRect(880 + slideOffset, 240, 140, 445);

      // Botoeira de chamada do elevador (Acesa em vermelho sozinha)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(1062, 425, 34, 72, 4);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(1079, 446, 6, 0, Math.PI * 2);
      ctx.fill();

      // 4. DIREITA: PORTA CORTA-FOGO DA ESCADA DE EMERGÊNCIA (Verde Segurança com Barra Antipânico)
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#022c22';
      ctx.lineWidth = 4;
      ctx.fillRect(1320, 235, 220, 450);
      ctx.strokeRect(1320, 235, 220, 450);

      // Barra antipânico prateada horizontal
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(1345, 455, 170, 14);

      // Placa Fotoluminescente "SAÍDA DE EMERGÊNCIA - ESCADA"
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(1355, 182, 150, 34, 4);
      ctx.fill();
      ctx.fillStyle = '#022c22';
      ctx.font = '800 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAÍDA • ESCADA', 1430, 203);

      // Extintor de Incêndio Vermelho na Parede Direita
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(1610, 460, 32, 85, 10);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.fillRect(1618, 446, 16, 14);

      ctx.restore();
    }

    drawFloor(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX, -camY);

      const floorGrad = ctx.createLinearGradient(0, 685, 0, 1080);
      floorGrad.addColorStop(0, '#0f172a');
      floorGrad.addColorStop(1, '#030712');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(-400, 685, 2720, 420);

      // Reflexo vermelho do visor do elevador no piso do corredor
      const redRefl = ctx.createRadialGradient(880, 710, 10, 880, 760, 260);
      redRefl.addColorStop(0, 'rgba(239, 68, 68, 0.18)');
      redRefl.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = redRefl;
      ctx.fillRect(620, 685, 520, 220);

      ctx.restore();
    }

    drawForeground(ctx, camX = 0, camY = 0) {
      ctx.save();
      ctx.translate(-camX * 1.35, -camY * 1.35);

      // Feixe de luz dramático sobre o Elevador Social
      const cone = ctx.createLinearGradient(880, 130, 880, 840);
      cone.addColorStop(0, 'rgba(239, 68, 68, 0.14)');
      cone.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(810, 130);
      ctx.lineTo(950, 130);
      ctx.lineTo(1160, 850);
      ctx.lineTo(600, 850);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  global.StudioScenarios = global.StudioScenarios || {};
  global.StudioScenarios.CorredorElevadores = CorredorElevadores;
})(typeof window !== 'undefined' ? window : globalThis);
