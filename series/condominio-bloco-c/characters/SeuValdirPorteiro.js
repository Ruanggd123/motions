/**
 * Personagem Modular 02: SEU VALDIR (Porteiro Noturno — 61 anos)
 * Arquivo Individual Reutilizável — Rig Vetorial 2D Articulado com Cinemática Direta
 * Traje: Camisa social azul-clara, gravata bordô, colete azul-marinho de alfaiataria com crachá,
 * calça social com vinco, sapatos lustrados, óculos de grau com lentes antirreflexo CFTV,
 * bigode grisalho, molho de chaves e rádio comunicador HT.
 *
 * Características do Rig:
 * - Ombro esférico contínuo (zero frestas ou braços soltos do tronco em qualquer ângulo)
 * - Braço articulado em 2 segmentos (Braço Superior + Cotovelo Articulado + Antebraço + Mão Anatômica)
 * - Pernas articuladas em 2 segmentos (Coxa + Joelho Flexível + Canela + Sapato com Calcanhar/Ponta)
 * - Motor de Locomoção Biomecânica (Walk Cycle natural: Contato, Amortecimento, Passagem e Impulso)
 * - Respiração orgânica em repouso (Zero tiques ou tremores artificiais)
 */
(function (global) {
  class SeuValdirPorteiro {
    constructor(options = {}) {
      this.id = 'VALDIR';
      this.name = 'Seu Valdir (Porteiro Noturno)';
      this.x = options.x || 0;
      this.y = options.y || 0;
      this.scale = options.scale || 1.0;
      this.flipX = options.flipX || false;

      // Estados de Animação e Postura
      this.emotion = options.emotion || 'worried'; // 'neutral' | 'worried' | 'panicked' | 'serious'
      this.pose = options.pose || 'radio_talk';    // 'idle' | 'radio_talk' | 'point_monitors' | 'hands_desk'
      this.viewMode = options.viewMode || 'auto'; // 'auto' | 'profile' | 'front'

      // Motor de Locomoção (Walk Cycle) e Detecção Automática de Direção (dx)
      this.isWalking = options.isWalking || false;
      this.walkSpeed = options.walkSpeed !== undefined ? options.walkSpeed : 1.0;
      this.walkCycle = options.walkCycle || 0;
      this.walkDir = options.walkDir || 1; // 1 = direita, -1 = esquerda
      this._prevX = this.x;

      // Expressão e Ciclos Fisiológicos Naturais
      this.mouthOpen = 0;
      this.mouthWide = 0.5;
      this.blinkTimer = 1.2;
      this.isBlinking = false;
      this.time = 0;
    }

    walk(speed = 1.0, dir = 1) {
      this.isWalking = true;
      this.walkSpeed = Math.abs(speed);
      this.walkDir = dir >= 0 ? 1 : -1;
      this.flipX = this.walkDir < 0;
    }

    stop() {
      this.isWalking = false;
      this.walkCycle = 0;
    }

    update(dt, mouthVal = 0, wideVal = 0.5) {
      this.time += dt;
      this.mouthOpen += (mouthVal - this.mouthOpen) * (mouthVal > this.mouthOpen ? 0.55 : 0.28);
      this.mouthWide += (wideVal - this.mouthWide) * 0.3;

      // Respiração Torácica Orgânica (ciclo de 3.5-4.2s com variação natural)
      const breathCycle = this.time * 1.65 + Math.sin(this.time * 0.7) * 0.3;
      this.breathPhase = Math.sin(breathCycle) * 0.5 + 0.5; // 0..1 (0=expira, 1=inspira)
      this.chestExpand = this.breathPhase * 1.8; // expansão torácica em px
      this.shoulderRise = this.breathPhase * 0.8; // elevação dos ombros

      // Balanço de Braços em Idle (micro-movimento natural quando parado)
      if (!this.isWalking) {
        this.idleArmSway = Math.sin(this.time * 1.2) * 0.04 + Math.sin(this.time * 2.7) * 0.02;
        this.idleHeadTilt = Math.sin(this.time * 0.9) * 0.015;
        this.idleWeightShift = Math.sin(this.time * 0.7) * 1.2;
      } else {
        this.idleArmSway = 0;
        this.idleHeadTilt = 0;
        this.idleWeightShift = 0;
      }

      // Micro-expressão reativa baseada na emoção atual
      const emotionIntensity = {
        'neutral': 0, 'worried': 0.6, 'panicked': 0.9,
        'serious': 0.3, 'focused': 0.2, 'tense': 0.5
      };
      this.emotionWeight = emotionIntensity[this.emotion] || 0;
      this.browFurrow = this.emotionWeight * (0.8 + Math.sin(this.time * 3.5) * 0.2);
      this.eyeWiden = this.emotionWeight * 0.3;

      // Ciclo de Piscar Natural (a cada 3.8 a 4.5s por apenas 140ms)
      this.blinkTimer += dt;
      if (this.blinkTimer > 4.0) {
        this.isBlinking = true;
        if (this.blinkTimer > 4.14) {
          this.isBlinking = false;
          this.blinkTimer = 0;
        }
      }

      const dx = this.x - this._prevX;
      if (Math.abs(dx) > 0.05) {
        this.walkDir = dx < 0 ? -1 : 1;
        this.flipX = dx < 0;
      }
      this._prevX = this.x;

      // Atualização do Walk Cycle
      if (this.isWalking) {
        this.walkCycle += dt * 4.6 * this.walkSpeed;
        if (this.walkCycle > Math.PI * 2) {
          this.walkCycle -= Math.PI * 2;
        }
      } else {
        // Amortecimento suave para repouso
        if (this.walkCycle !== 0) {
          this.walkCycle = 0;
        }
      }
    }

    draw(ctx) {
      const dx = this.x - this._prevX;
      if (this.isWalking && Math.abs(dx) > 0.05) {
        this.walkDir = dx < 0 ? -1 : 1;
        this.flipX = dx < 0;
      }
      this._prevX = this.x;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.flipX ? -this.scale : this.scale, this.scale);

      const useProfile = this.isWalking && (this.viewMode === 'profile' || this.viewMode === 'auto');
      if (useProfile) {
        this._drawProfile(ctx);
      } else {
        this._drawFrontal(ctx);
      }

      ctx.restore();
    }

    /**
     * VISÃO LATERAL DE PERFIL 2.5D (Seu Valdir — 61 anos, Porteiro Noturno)
     * Postura respeitosa com leve stoop maduro, óculos de leitura em perfil,
     * bigode grisalho, colete de vigilância, rádio HT e passos comedidos.
     */
    _drawProfile(ctx) {
      const phi = this.walkCycle;
      const isWalk = this.isWalking;

      const hipBob = isWalk ? Math.sin(phi * 2 - Math.PI / 2) * 2.4 : Math.sin(this.time * 1.0) * 0.5;
      const torsoTilt = isWalk ? 0.05 + Math.sin(phi * 2) * 0.01 : 0.03;

      // Cinemática Biomecânica C0 do Passo (kn > 0 dobra joelho para trás, th < 0 avança para frente)
      const calcLegProfile = (phase) => {
        if (!isWalk) return { th: -0.02, kn: 0.05, ft: -0.03 };
        let p = phase % (Math.PI * 2);
        if (p < 0) p += Math.PI * 2;

        let th = 0;
        let kn = 0;
        let ft = 0;

        if (p < Math.PI) {
          const u = p / Math.PI;
          th = -0.30 * Math.cos(u * Math.PI) - 0.01;
          if (u < 0.35) {
            kn = 0.05 + 0.12 * Math.sin((u / 0.35) * Math.PI);
          } else if (u < 0.75) {
            kn = 0.05;
          } else {
            const k = (u - 0.75) / 0.25;
            kn = 0.05 + 0.28 * Math.sin(k * Math.PI * 0.5);
          }
          let footGlobal = 0;
          if (u < 0.18) {
            footGlobal = -0.18 * (1.0 - u / 0.18);
          } else if (u > 0.72) {
            const k = (u - 0.72) / 0.28;
            footGlobal = 0.28 * Math.sin(k * Math.PI * 0.5);
          }
          ft = footGlobal - (th + kn);
        } else {
          const v = (p - Math.PI) / Math.PI;
          th = 0.30 * Math.cos(v * Math.PI) - 0.01;
          const swingArc = Math.sin(v * Math.PI);
          kn = 0.05 + 0.28 * (1.0 - v) + 0.72 * swingArc;
          const footGlobal = 0.28 * (1.0 - v) * Math.cos(v * Math.PI * 0.5) - 0.18 * Math.pow(v, 1.4);
          ft = footGlobal - (th + kn);
        }
        return { th, kn, ft };
      };

      const legBack = calcLegProfile(phi);
      const legFront = calcLegProfile(phi + Math.PI);

      // Sombra Dinâmica no Piso
      const shadowW = 42 + (isWalk ? Math.abs(Math.sin(phi)) * 4 : 0);
      const shadowGrad = ctx.createRadialGradient(0, 165, 4, 0, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.50)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 165, shadowW, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. PERNA TRASEIRA (Far Leg)
      ctx.save();
      ctx.translate(-4, 62 + hipBob);
      this._drawProfileLeg(ctx, legBack.th, legBack.kn, legBack.ft, true);
      ctx.restore();

      // 2. CINTO DE SERVIÇO COM CHAVES (Conector compacto sem bloco estático nas coxas)
      ctx.save();
      ctx.translate(0, 56 + hipBob);
      ctx.rotate(torsoTilt * 0.6);

      // Cinto de couro preto com fivela de latão dourada
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(-13, 0, 26, 7, 3);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(5, 0.5, 6, 6);

      // Molho de chaves da portaria pendurado na lateral com balanço
      const keySway = isWalk ? Math.sin(phi * 2) * 0.25 : 0;
      ctx.save();
      ctx.translate(-10, 6);
      ctx.rotate(keySway);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 3, 3, 0, Math.PI * 2);
      ctx.stroke();
      // Chaves metálicas
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-1, 5, 2.5, 9);
      ctx.fillRect(1, 5, 2, 7);
      ctx.restore();

      ctx.restore();

      // 3. TRONCO, COLETE DE VIGILÂNCIA & GRAVATA BORDÔ (Calibrado a 247px)
      // Respiração torácica + balanço idle aplicados ao tronco
      const breathChest = this.chestExpand || 0;
      const idleShift = this.idleWeightShift || 0;
      ctx.save();
      ctx.translate(idleShift, hipBob - this.shoulderRise * 0.3);
      ctx.rotate(torsoTilt + (this.idleHeadTilt || 0) * 0.4);

      // Camisa social azul-clara com expansão torácica na respiração
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.moveTo(-14 - breathChest * 0.3, -24);
      ctx.lineTo(14 + breathChest * 0.3, -24);
      ctx.lineTo(14 + breathChest * 0.15, 58);
      ctx.lineTo(-14 - breathChest * 0.15, 58);
      ctx.closePath();
      ctx.fill();

      // Colete de Vigilância Azul-Marinho Oficial com respiração
      const vestGrad = ctx.createLinearGradient(-16, -24, 16, 58);
      vestGrad.addColorStop(0, '#1e293b');
      vestGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = vestGrad;
      ctx.beginPath();
      ctx.moveTo(-15 - breathChest * 0.35, -24);
      ctx.bezierCurveTo(-20 - breathChest * 0.2, 0, -18 - breathChest * 0.1, 35, -14 - breathChest * 0.1, 58);
      ctx.lineTo(14 + breathChest * 0.1, 58);
      ctx.bezierCurveTo(17 + breathChest * 0.1, 35, 17 + breathChest * 0.2, 0, 14 + breathChest * 0.35, -24);
      ctx.closePath();
      ctx.fill();

      // Gravata Bordô elegante aparecendo no decote V do colete
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(9, -22);
      ctx.lineTo(13, -21);
      ctx.lineTo(12, 12);
      ctx.lineTo(8, 14);
      ctx.closePath();
      ctx.fill();

      // Crachá Metálico Dourado de Segurança no peito
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(10, -6, 4, 8, 1);
      ctx.fill();
      ctx.stroke();

      // 4. CABEÇA EM PERFIL (Proporção 1:1 rigorosa com frontal: 60px de crânio, topo em y = -85, pescoço maduro natural)
      ctx.save();
      ctx.translate(2, -36);
      ctx.rotate(0.06 + (isWalk ? Math.sin(phi) * 0.015 : 0));
      ctx.scale(1.30, 1.30);

      // Pescoço maduro conectando ao colarinho
      ctx.fillStyle = '#946340';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(5, 10);
      ctx.lineTo(-5, 10);
      ctx.closePath();
      ctx.fill();

      // Colarinho branco/azul da camisa social
      ctx.fillStyle = '#bfdbfe';
      ctx.beginPath();
      ctx.moveTo(4, 2);
      ctx.lineTo(11, 4);
      ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();

      // Crânio e perfil facial maduro (tom de pele oliva quente)
      const faceGrad = ctx.createLinearGradient(-10, -32, 14, 8);
      faceGrad.addColorStop(0, '#b37f57');
      faceGrad.addColorStop(0.7, '#946340');
      faceGrad.addColorStop(1, '#784c28');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(-12, -10);
      // Nuca e calvície suave no topo da cabeça
      ctx.bezierCurveTo(-14, -26, -5, -34, 0, -34);
      ctx.bezierCurveTo(8, -34, 11, -26, 11.5, -18);
      // Ponte nasal clássica
      ctx.quadraticCurveTo(11.8, -15, 12.8, -13);
      // Nariz distinto e maduro
      ctx.quadraticCurveTo(15.2, -11, 16.5, -9.5);
      ctx.quadraticCurveTo(16.8, -8.5, 15.0, -8.0);
      // Asa nasal e início do bigode
      ctx.quadraticCurveTo(13.2, -7.5, 13.5, -5.5);
      // Lábios e queixo maduro arredondado
      ctx.quadraticCurveTo(14.0, -4.5, 13.4, -3.0);
      ctx.bezierCurveTo(13.0, 1.5, 10.5, 4.5, 7.0, 5.0);
      ctx.bezierCurveTo(0, 5.5, -8, 2.0, -9, -2);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();

      // Cabelo Grisalho elegante nas têmporas e nuca
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.bezierCurveTo(-16, -12, -12, -26, -2, -31);
      ctx.bezierCurveTo(-5, -22, -8, -14, -8, -4);
      ctx.closePath();
      ctx.fill();

      // Orelha madura em perfil
      ctx.fillStyle = '#946340';
      ctx.beginPath();
      ctx.ellipse(-2.5, -6, 4.8, 6.5, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#784c28';
      ctx.beginPath();
      ctx.ellipse(-2.5, -6, 2.6, 4.0, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Óculos de Leitura em Perfil (Haste sobre a orelha e aro prateado)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.3;
      // Haste da orelha até a ponte
      ctx.beginPath();
      ctx.moveTo(-2, -8);
      ctx.lineTo(8, -11);
      ctx.lineTo(13, -11);
      ctx.stroke();
      // Aro da lente em perfil
      ctx.fillStyle = 'rgba(224, 242, 254, 0.25)';
      ctx.beginPath();
      ctx.ellipse(10.5, -11, 4.0, 5.0, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Olho maduro atento por trás da lente
      if (!this.isBlinking) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(10.5, -11, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(11.2, -11, 1.4, 0, Math.PI * 2);
        ctx.fill();
        // Brilho no olhar
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10.8, -11.8, 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(8.5, -11);
        ctx.lineTo(12.5, -11);
        ctx.stroke();
      }

      // Sobrancelha grisalha expressiva
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(7, -16);
      ctx.quadraticCurveTo(10.5, -18, 14, -15.5);
      ctx.stroke();

      // Bigode Grisalho Cheio em Perfil (com sincronização de fala)
      const mustY = -6.5 - this.mouthOpen * 1.0;
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(11.5, mustY);
      ctx.quadraticCurveTo(15.5, mustY - 0.5, 17.0, mustY + 3.0);
      ctx.quadraticCurveTo(14.5, mustY + 5.5, 11.5, mustY + 3.5);
      ctx.closePath();
      ctx.fill();

      // Boca (visema quando fala no rádio)
      if (this.mouthOpen > 0.08) {
        ctx.fillStyle = '#3a0f0f';
        ctx.beginPath();
        ctx.arc(12.5, -3.5, 2.2 * this.mouthOpen, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // Fim Cabeça

      // 5. BRAÇOS & RÁDIO WALKIE-TALKIE HT (Pivô do Ombro Alinhado em y = -16)
      ctx.save();
      ctx.translate(2, -16 + hipBob);

      if (this.pose === 'radio_talk') {
        // Braço Traseiro apoiado
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(4, 14);
        ctx.lineTo(14, 12);
        ctx.lineTo(4, 6);
        ctx.closePath();
        ctx.fill();

        // Braço Dianteiro erguido segurando o rádio HT perto do queixo
        const armGrad = ctx.createLinearGradient(0, -6, 18, 10);
        armGrad.addColorStop(0, '#1e293b');
        armGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = armGrad;

        // Ombro até cotovelo
        ctx.beginPath();
        ctx.moveTo(2, -6);
        ctx.lineTo(8, 12);
        ctx.lineTo(18, -4);
        ctx.lineTo(14, -8);
        ctx.lineTo(4, -6);
        ctx.closePath();
        ctx.fill();

        // Mão segurando o walkie-talkie
        ctx.fillStyle = '#946340';
        ctx.beginPath();
        ctx.ellipse(19, -4, 3.5, 3.2, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Rádio HT (Gabinete preto, antena flexível e LED de transmissão)
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.roundRect(17, -16, 7, 18, 1.5);
        ctx.fill();

        // Antena longa do HT
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(20, -16);
        ctx.lineTo(19, -32);
        ctx.stroke();

        // LED vermelho de PTT / Transmissão ativo
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(22, -13, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Caminhada Normal: balanço natural dos braços
        const armSwing = isWalk ? Math.sin(phi) * 0.35 : 0;

        // Braço Traseiro
        ctx.save();
        ctx.rotate(-armSwing);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(-4, 18);
        ctx.lineTo(2, 38);
        ctx.lineTo(6, 36);
        ctx.lineTo(2, 16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Braço Dianteiro
        ctx.save();
        ctx.rotate(armSwing);
        const armGrad = ctx.createLinearGradient(0, -6, 0, 40);
        armGrad.addColorStop(0, '#1e293b');
        armGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = armGrad;
        ctx.beginPath();
        ctx.moveTo(2, -6);
        ctx.lineTo(4, 18);
        ctx.lineTo(-2, 38);
        ctx.lineTo(2, 40);
        ctx.lineTo(8, 18);
        ctx.closePath();
        ctx.fill();

        // Mão relaxada
        ctx.fillStyle = '#946340';
        ctx.beginPath();
        ctx.arc(0, 42, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore(); // Fim Braços
      ctx.restore(); // Fim Tronco

      // 6. PERNA DIANTEIRA (Near Leg)
      ctx.save();
      ctx.translate(4, 62 + hipBob);
      this._drawProfileLeg(ctx, legFront.th, legFront.kn, legFront.ft, false);
      ctx.restore();
    }

    /**
     * Perna Articulada em Perfil com Calça Social Grafite e Sapato Lustrado
     */
    _drawProfileLeg(ctx, thighAngle, kneeAngle, footAngle, isBack = false) {
      ctx.save();
      ctx.rotate(thighAngle);

      const pantsColor = isBack ? '#0f172a' : '#1e293b';
      const thighLen = 42;
      const shinLen = 42;

      // Coxa com calça social
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(7, thighLen);
      ctx.lineTo(-7, thighLen);
      ctx.closePath();
      ctx.fill();

      // Joelho Articulado
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      // Canela com calça social e vinco clássico
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.moveTo(-6.5, 0);
      ctx.lineTo(6.5, 0);
      ctx.lineTo(5.5, shinLen);
      ctx.lineTo(-5.5, shinLen);
      ctx.closePath();
      ctx.fill();

      // Vinco da calça social
      ctx.strokeStyle = isBack ? '#1e293b' : '#334155';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, shinLen - 2);
      ctx.stroke();

      // Barra da calça
      ctx.fillStyle = '#020617';
      ctx.fillRect(-6, shinLen - 3, 12, 3);

      // Tornozelo e Sapato Social Lustrado
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      // Sapato de serviço preto
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(12, 0);
      ctx.quadraticCurveTo(16, 3, 14, 8);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();

      // Salto do sapato
      ctx.fillStyle = '#020617';
      ctx.fillRect(-6, 6, 6, 4);

      // Brilho do couro lustrado
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.ellipse(6, 2, 5, 1.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    /**
     * VISÃO FRONTAL ESTILIZADA (Para paradas e reações)
     */
    _drawFrontal(ctx) {
      let hipBob = 0;
      let hipSway = 0;
      let torsoTilt = 0;
      let leftThigh = 0, leftKnee = 0, leftFoot = 0;
      let rightThigh = 0, rightKnee = 0, rightFoot = 0;
      let leftArmSwing = 0, rightArmSwing = 0;

      if (this.isWalking) {
        const phi = this.walkCycle;
        // Bob vertical do quadril (afunda no impacto, sobe na passagem do passo)
        hipBob = Math.sin(phi * 2 - Math.PI / 2) * 2.8;
        hipSway = Math.sin(phi) * 1.2;
        torsoTilt = 0.04; // Leve inclinação para frente na caminhada

        // Apoio (cos>0): pé plantado varre para trás.
        // Balanço (cos<0): joelho dobra para TRÁS (kn positivo = flexão para trás em direção ao calcanhar)
        const leg = (p) => {
          const th = Math.sin(p) * 0.44;
          const isSwing = Math.cos(p) < 0;
          const kn = isSwing ? -Math.cos(p) * 1.10 : 0.02;
          const ft = isSwing ? 0.12 : -(th + kn);
          return [th, kn, ft];
        };
        [leftThigh, leftKnee, leftFoot] = leg(phi);
        [rightThigh, rightKnee, rightFoot] = leg(phi + Math.PI);

        // Balanço natural dos braços em oposição às pernas
        leftArmSwing = -Math.sin(phi) * 0.38;
        rightArmSwing = Math.sin(phi) * 0.38;
      } else {
        // REPOUSO CALMO E NATURAL: Respiração lenta (1.0 rad/s = 10 respirações/min), sem tremores
        hipBob = Math.sin(this.time * 1.0) * 0.6;
        torsoTilt = 0;
        leftThigh = -0.01;
        rightThigh = 0.01;
        leftKnee = 0.02;
        rightKnee = 0.02;
      }

      // 0. Sombra Dinâmica no Piso (acompanha o passo)
      const shadowW = 46 + (this.isWalking ? Math.abs(Math.cos(this.walkCycle)) * 4 : 0);
      const shadowGrad = ctx.createRadialGradient(hipSway * 0.5, 165, 5, hipSway * 0.5, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(hipSway * 0.5, 165, shadowW, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. PERNAS ARTICULADAS (Quadril -> Coxa -> Joelho -> Canela -> Pé)
      // Perna Esquerda (Trás)
      this._drawArticulatedLeg(ctx, -13 + hipSway * 0.4, 60 + hipBob, leftThigh, leftKnee, leftFoot, true);
      // Perna Direita (Frente)
      this._drawArticulatedLeg(ctx, 13 + hipSway * 0.4, 60 + hipBob, rightThigh, rightKnee, rightFoot, false);

      // 2. QUADRIL & PELVE DA CALÇA SOCIAL (Conecta o tronco às pernas sem quebras)
      ctx.save();
      ctx.translate(hipSway * 0.5, 58 + hipBob);
      ctx.rotate(torsoTilt * 0.5);

      const pantsGrad = ctx.createLinearGradient(-26, 0, 26, 26);
      pantsGrad.addColorStop(0, '#111827');
      pantsGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = pantsGrad;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(25, 0);
      ctx.quadraticCurveTo(27, 24, 18, 26);
      ctx.lineTo(0, 22); // Gancho da calça
      ctx.lineTo(-18, 26);
      ctx.quadraticCurveTo(-27, 24, -25, 0);
      ctx.closePath();
      ctx.fill();

      // Cinto de couro preto com fivela prateada fosca
      ctx.fillStyle = '#020617';
      ctx.fillRect(-25, 0, 50, 7);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-5, -0.5, 10, 8);

      // Molho de chaves da portaria pendurado no passador direito do cinto
      ctx.save();
      ctx.translate(19, 8);
      ctx.rotate(this.isWalking ? Math.sin(this.walkCycle * 2) * 0.18 : 0);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 3, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-3, 6, 2, 8);
      ctx.fillRect(0, 6, 2, 10);
      ctx.fillRect(3, 6, 2, 7);
      ctx.restore();

      ctx.restore(); // Fim Pelve

      // 3. BRAÇO ESQUERDO (Camada de trás do tronco)
      ctx.save();
      ctx.translate(-24 + hipSway * 0.5, -20 + hipBob);
      ctx.rotate(torsoTilt);

      let leftUpperAngle = -0.05 + leftArmSwing;
      let leftForeAngle = -0.08;
      if (this.pose === 'point_monitors') {
        // Aponta com clareza para o rack de monitores
        leftUpperAngle = 1.10;
        leftForeAngle = 0.45;
      } else if (this.pose === 'hands_desk') {
        leftUpperAngle = -0.08;
        leftForeAngle = -0.72;
      } else if (this.pose === 'radio_talk') {
        // Mão esquerda descansando no balcão da guarita
        leftUpperAngle = -0.12;
        leftForeAngle = -0.55;
      }
      this._drawArticulatedArm(ctx, leftUpperAngle, leftForeAngle, false, false, this.pose === 'point_monitors');
      ctx.restore();

      // 4. TRONCO, CAMISA SOCIAL & COLETE MARINHO DE ALFAIATARIA
      ctx.save();
      ctx.translate(hipSway * 0.4, hipBob);
      ctx.rotate(torsoTilt);

      this._drawTorsoAndVest(ctx);

      // 5. PESCOÇO & CABEÇA (Com óculos, bigode, expressão e cabelos grisalhos)
      this._drawHead(ctx);

      ctx.restore(); // Fim Tronco + Cabeça

      // 6. BRAÇO DIREITO (Camada da frente — Rádio HT ou Bancada)
      ctx.save();
      ctx.translate(24 + hipSway * 0.5, -20 + hipBob);
      ctx.rotate(torsoTilt);

      if (this.pose === 'radio_talk') {
        this._drawRadioTalkArm(ctx);
      } else if (this.pose === 'point_monitors') {
        this._drawRadioTalkArm(ctx, true);
      } else {
        this._drawDeskArm(ctx);
      }
      ctx.restore();
    }

    /**
     * Perna Articulada em 2 Segmentos com Joelho Flexível e Sapato de Alfaiataria
     */
    _drawArticulatedLeg(ctx, hipX, hipY, thighAngle, kneeAngle, footAngle, isLeft) {
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(thighAngle);

      const thighLen = 42;
      const shinLen = 42;

      // 1. Coxa (Calça social escura com vincos sutis)
      const thighGrad = ctx.createLinearGradient(-9, 0, 9, thighLen);
      thighGrad.addColorStop(0, '#111827');
      thighGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = thighGrad;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.lineTo(7.5, thighLen);
      ctx.lineTo(-7.5, thighLen);
      ctx.closePath();
      ctx.fill();

      // Articulação do Joelho (Hinged Joint)
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      // Rótula do Joelho
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Canela (Calça social afunilando em direção ao tornozelo)
      const shinGrad = ctx.createLinearGradient(-7.5, 0, 7.5, shinLen);
      shinGrad.addColorStop(0, '#0f172a');
      shinGrad.addColorStop(1, '#030712');
      ctx.fillStyle = shinGrad;
      ctx.beginPath();
      ctx.moveTo(-7.5, 0);
      ctx.lineTo(7.5, 0);
      ctx.lineTo(6, shinLen);
      ctx.lineTo(-6, shinLen);
      ctx.closePath();
      ctx.fill();

      // Vinco frontal da calça social
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(0, shinLen - 4);
      ctx.stroke();

      // Bainha da barra da calça
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-6.5, shinLen - 4, 13, 3);

      // 3. Tornozelo e Sapato Social Lustrado
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      // Meia social escura
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-4.5, 0, 9, 4);

      // Sapato social de couro com sola, salto e bico lustrado
      ctx.fillStyle = '#05070d';
      ctx.beginPath();
      ctx.moveTo(-8, 3);
      ctx.lineTo(13, 3);
      ctx.quadraticCurveTo(18, 5, 17, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fill();

      // Salto do sapato
      ctx.fillStyle = '#000000';
      ctx.fillRect(-8, 10, 7, 3);

      // Brilho especular sutil no couro lustrado do bico
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(6, 5);
      ctx.lineTo(15, 6);
      ctx.stroke();

      ctx.restore();
    }

    /**
     * Braço Direito com Manga Contínua e Rádio HT Upright Natural (Zero Dedos de Salsicha)
     */
    _drawRadioTalkArm(ctx, isLower = false) {
      // 1. Manga do Braço Superior (Ombro ao Cotovelo)
      const armGrad = ctx.createLinearGradient(0, 0, 10, 26);
      armGrad.addColorStop(0, '#cbd5e1');
      armGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.quadraticCurveTo(8, 0, 14, 24);
      ctx.quadraticCurveTo(10, 28, 4, 28);
      ctx.quadraticCurveTo(-4, 14, -8, 2);
      ctx.closePath();
      ctx.fill();

      // Dobra orgânica no cotovelo
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(4, 25);
      ctx.quadraticCurveTo(8, 24, 12, 25);
      ctx.stroke();

      // 2. Antebraço (Cotovelo ao Pulso rente ao peito)
      const foreGrad = ctx.createLinearGradient(10, 26, -4, 8);
      foreGrad.addColorStop(0, '#94a3b8');
      foreGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = foreGrad;
      ctx.beginPath();
      ctx.moveTo(4, 28);
      ctx.quadraticCurveTo(-2, 22, -8, 12);
      ctx.lineTo(-2, 6);
      ctx.quadraticCurveTo(4, 16, 12, 25);
      ctx.closePath();
      ctx.fill();

      // Punho abotoado da camisa social com botãozinho
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(-8, 5, 8, 8, 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(-4, 9, 1, 0, Math.PI * 2);
      ctx.fill();

      // 3. Mão e Rádio HT (Posicionados no Pulso: x = -5, y = isLower ? 12 : 6)
      ctx.save();
      ctx.translate(-5, isLower ? 12 : 6);
      ctx.rotate(-0.08); // Leve inclinação natural em direção à boca

      // Palma de trás apoiando o rádio
      ctx.fillStyle = '#c6865c';
      ctx.beginPath();
      ctx.ellipse(-1, 3, 5.5, 7.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Chassi do Rádio Comunicador HT (Vertical e Proporcional)
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(-7, -14, 15, 26, 3);
      ctx.fill();
      ctx.stroke();

      // Antena no topo apontando para CIMA
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(3, -14);
      ctx.lineTo(4, -36);
      ctx.stroke();

      // Botão de volume / seletor de canal no topo
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-5, -17, 5, 3);

      // Grade do alto-falante frontal
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1;
      [-7, -4, -1, 2].forEach(gy => {
        ctx.beginPath();
        ctx.moveTo(-3, gy);
        ctx.lineTo(3, gy);
        ctx.stroke();
      });

      // LED de transmissão vermelho
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-3, -10, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Dedos envolvendo elegantemente a lateral direita do chassi
      ctx.fillStyle = '#c6865c';
      const fingers = [
        { y: -6, w: 6.5 },
        { y: -1, w: 7.0 },
        { y: 4, w: 6.5 },
        { y: 9, w: 5.5 }
      ];
      fingers.forEach(f => {
        ctx.beginPath();
        ctx.roundRect(4, f.y, f.w, 3.8, 1.8);
        ctx.fill();
        ctx.strokeStyle = '#a96b43';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(5, f.y + 3.8);
        ctx.lineTo(4 + f.w, f.y + 3.8);
        ctx.stroke();
      });

      // Polegar moreno na lateral esquerda descansando no botão PTT
      ctx.fillStyle = '#ba7950';
      ctx.beginPath();
      ctx.ellipse(-7, 0, 3, 4.5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    _drawDeskArm(ctx) {
      const armGrad = ctx.createLinearGradient(0, 0, 12, 38);
      armGrad.addColorStop(0, '#cbd5e1');
      armGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(6, 38);
      ctx.lineTo(-6, 38);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-6, 38, 12, 5);
      ctx.fillStyle = '#c6865c';
      ctx.beginPath();
      ctx.ellipse(0, 48, 6, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /**
     * Braço Esquerdo Articulado (Para Apontar Monitores ou Apoiar no Balcão)
     */
    _drawArticulatedArm(ctx, upperAngle, foreAngle, isFront, hasRadio, isPointing) {
      const upperLen = 32;
      const foreLen = 30;

      ctx.save();
      ctx.rotate(upperAngle);

      // 1. Manga do Braço Superior (Camisa social azul-clara com caimento natural)
      const upperGrad = ctx.createLinearGradient(-7.5, 0, 7.5, upperLen);
      upperGrad.addColorStop(0, '#cbd5e1');
      upperGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = upperGrad;

      ctx.beginPath();
      ctx.moveTo(-7.5, 0);
      ctx.quadraticCurveTo(-8, upperLen * 0.5, -6.5, upperLen);
      ctx.lineTo(6.5, upperLen);
      ctx.quadraticCurveTo(8, upperLen * 0.5, 7.5, 0);
      ctx.closePath();
      ctx.fill();

      // Dobra suave do tecido
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4, upperLen * 0.5);
      ctx.quadraticCurveTo(0, upperLen * 0.5 + 2, 4, upperLen * 0.5);
      ctx.stroke();

      // 2. Transição Suave do Cotovelo e Antebraço
      ctx.translate(0, upperLen);
      ctx.rotate(foreAngle);

      // Antebraço com manga da camisa estendendo de forma contínua
      const foreGrad = ctx.createLinearGradient(-6.5, 0, 6.5, foreLen);
      foreGrad.addColorStop(0, '#94a3b8');
      foreGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = foreGrad;

      ctx.beginPath();
      ctx.moveTo(-6.5, -2);
      ctx.quadraticCurveTo(-7, foreLen * 0.5, -5.5, foreLen - 5);
      ctx.lineTo(5.5, foreLen - 5);
      ctx.quadraticCurveTo(7, foreLen * 0.5, 6.5, -2);
      ctx.closePath();
      ctx.fill();

      // Punho estruturado da camisa social com botão
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(-6, foreLen - 5, 12, 5, 1.5);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(3.5, foreLen - 2.5, 1, 0, Math.PI * 2);
      ctx.fill();

      // 3. Mão
      ctx.translate(0, foreLen);

      if (hasRadio) {
        // EMPUNHADURA ANATÔMICA DO RÁDIO COMUNICADOR HT (Perfeitamente Vertical)
        ctx.save();
        // Compensa com precisão para que a antena aponte 100% para cima rente à boca
        const currentWorldArmAngle = upperAngle + foreAngle;
        const radioCorrection = -Math.PI - currentWorldArmAngle + 0.12;
        ctx.rotate(radioCorrection);

        // Palma da mão (fundo)
        ctx.fillStyle = '#c6865c';
        ctx.beginPath();
        ctx.ellipse(0, 2, 7, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chassi do Rádio Comunicador HT Vertical
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.roundRect(-8, -14, 16, 28, 3);
        ctx.fill();
        ctx.stroke();

        // Antena flexível apontando para o teto da guarita
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(3, -14);
        ctx.lineTo(4, -38);
        ctx.stroke();

        // Botão de volume / canal no topo
        ctx.fillStyle = '#27272a';
        ctx.fillRect(-6, -17, 5, 3);

        // Grade do alto-falante
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1;
        [-7, -4, -1, 2].forEach(gy => {
          ctx.beginPath();
          ctx.moveTo(-4, gy);
          ctx.lineTo(4, gy);
          ctx.stroke();
        });

        // LED vermelho de alerta PTT
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-4, -10, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Dedos morenos envolvendo a frente do chassi (Grip natural em curva)
        ctx.fillStyle = '#c6865c';
        [-6, -1, 4, 9].forEach((fy, idx) => {
          ctx.beginPath();
          ctx.roundRect(-7, fy, 12, 3.8, 1.8);
          ctx.fill();
          // Junta do dedo
          ctx.strokeStyle = '#a96b43';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-2, fy + 0.5);
          ctx.lineTo(-2, fy + 3.3);
          ctx.stroke();
        });

        // Polegar no gatilho PTT lateral
        ctx.fillStyle = '#ba7950';
        ctx.beginPath();
        ctx.ellipse(8, -1, 3.2, 5.5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (isPointing) {
        // MÃO APONTANDO O INDICADOR PARA OS MONITORES
        ctx.fillStyle = '#c6865c';
        ctx.beginPath();
        ctx.ellipse(0, 3, 5.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dedo indicador estendido
        ctx.beginPath();
        ctx.roundRect(-2.5, 5, 5, 14, 2);
        ctx.fill();

        // Dedos médios recolhidos
        ctx.fillStyle = '#ba7950';
        ctx.beginPath();
        ctx.ellipse(-4, 3, 3, 4, 0.4, 0, Math.PI * 2);
        ctx.ellipse(4, 3, 3, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // MÃO DESCANSANDO NO BALCÃO DA GUARITA
        ctx.fillStyle = '#c6865c';
        ctx.beginPath();
        ctx.ellipse(0, 5, 5.5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dedos relaxados
        ctx.fillStyle = '#ba7950';
        [-4, -1.5, 1.5, 4].forEach(fx => {
          ctx.beginPath();
          ctx.roundRect(fx - 1.2, 8, 2.4, 6, 1.2);
          ctx.fill();
        });

        // Polegar
        ctx.beginPath();
        ctx.ellipse(5, 4, 2.5, 4, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    /**
     * Tronco Anatômico, Colete de Alfaiataria e Camisa com Gravata
     */
    _drawTorsoAndVest(ctx) {
      // 1. Base da Camisa Social Clara (Gola e Peito)
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.roundRect(-27, -26, 54, 86, 8);
      ctx.fill();

      // 2. Colete Social de Alfaiataria Azul-Marinho Escuro
      const vestGrad = ctx.createLinearGradient(-28, -26, 28, 62);
      vestGrad.addColorStop(0, '#1e293b');
      vestGrad.addColorStop(0.5, '#0f172a');
      vestGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = vestGrad;

      ctx.beginPath();
      ctx.moveTo(-26, -24);
      // Cava do ombro esquerdo anatômica
      ctx.lineTo(-12, -24);
      ctx.lineTo(0, 8); // Abertura em V da gravata
      ctx.lineTo(12, -24);
      // Cava do ombro direito
      ctx.lineTo(26, -24);
      ctx.bezierCurveTo(31, -2, 30, 36, 26, 62);
      ctx.lineTo(0, 66);
      ctx.lineTo(-26, 62);
      ctx.bezierCurveTo(-30, 36, -31, -2, -26, -24);
      ctx.closePath();
      ctx.fill();

      // Ombreiras estruturadas do colete
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(-24, -20, 6, 7, 0.2, 0, Math.PI * 2);
      ctx.ellipse(24, -20, 6, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Luz de recorte esverdeada dos monitores CFTV na borda externa do colete apenas
      ctx.save();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-26, -10);
      ctx.bezierCurveTo(-30, 20, -30, 45, -26, 60);
      ctx.stroke();
      ctx.restore();

      // Colarinho da Camisa Social
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-11, -26);
      ctx.lineTo(0, -14);
      ctx.lineTo(-8, -8);
      ctx.closePath();
      ctx.moveTo(11, -26);
      ctx.lineTo(0, -14);
      ctx.lineTo(8, -8);
      ctx.closePath();
      ctx.fill();

      // Gravata Bordô Clássica
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.moveTo(-3.5, -15);
      ctx.lineTo(3.5, -15);
      ctx.lineTo(5, 10);
      ctx.lineTo(0, 16);
      ctx.lineTo(-5, 10);
      ctx.closePath();
      ctx.fill();

      // Botões de madrepérola escura do colete
      ctx.fillStyle = '#475569';
      [18, 30, 42, 54].forEach(by => {
        ctx.beginPath();
        ctx.arc(0, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Crachá de Identificação "SOLARIS - PORTARIA"
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(8, -3, 15, 11, 2);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(8, -3, 15, 3);
      ctx.fillStyle = '#334155';
      ctx.fillRect(10, 2, 11, 1.5);
      ctx.fillRect(10, 4.5, 8, 1.2);
    }

    /**
     * Cabeça Expressiva, Óculos Antirreflexo, Bigode Grisalho e Cabelos
     */
    _drawHead(ctx) {
      // Pescoço com transição anatômica suave
      ctx.fillStyle = '#b5764c';
      ctx.beginPath();
      ctx.roundRect(-8, -38, 16, 16, 4);
      ctx.fill();

      // Orelhas
      ctx.fillStyle = '#c6865c';
      ctx.beginPath();
      ctx.ellipse(-22, -55, 4.5, 7.5, -0.08, 0, Math.PI * 2);
      ctx.ellipse(22, -55, 4.5, 7.5, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Rosto maduro com mandíbula modelada
      const faceGrad = ctx.createLinearGradient(-22, -84, 22, -33);
      faceGrad.addColorStop(0, '#d8976c');
      faceGrad.addColorStop(0.65, '#c6865c');
      faceGrad.addColorStop(1, '#a96b43');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(-22, -64);
      ctx.quadraticCurveTo(-22, -85, 0, -86);
      ctx.quadraticCurveTo(22, -85, 22, -64);
      ctx.bezierCurveTo(22, -44, 15, -34, 0, -33);
      ctx.bezierCurveTo(-15, -34, -22, -44, -22, -64);
      ctx.closePath();
      ctx.fill();

      // Linhas de expressão calmas na testa (61 anos de experiência)
      ctx.strokeStyle = 'rgba(92, 48, 24, 0.38)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-11, -75); ctx.quadraticCurveTo(0, -77, 11, -75);
      ctx.moveTo(-9, -71); ctx.quadraticCurveTo(0, -73, 9, -71);
      ctx.moveTo(-8, -51); ctx.lineTo(-12, -41);
      ctx.moveTo(8, -51); ctx.lineTo(12, -41);
      ctx.stroke();

      // Olhos expressivos atrás das lentes
      const isPanicked = this.emotion === 'panicked';
      const eyeH = isPanicked ? 5.2 : 3.8;

      if (!this.isBlinking) {
        [-9, 9].forEach(ex => {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(ex, -58, 4.8, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#3b2314';
          ctx.beginPath();
          ctx.arc(ex, -58, isPanicked ? 1.9 : 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex - 0.9, -59.2, 1.1, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        ctx.strokeStyle = '#3b2314';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-13, -58); ctx.lineTo(-5, -58);
        ctx.moveTo(5, -58); ctx.lineTo(13, -58);
        ctx.stroke();
      }

      // Armação metálica dos Óculos de Grau com antirreflexo CFTV
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-16, -63, 13, 10, 2);
      ctx.roundRect(3, -63, 13, 10, 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-3, -59);
      ctx.lineTo(3, -59);
      ctx.stroke();

      // Reflexo diagonal nas lentes
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.48)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-13, -61); ctx.lineTo(-9, -55);
      ctx.moveTo(6, -61); ctx.lineTo(10, -55);
      ctx.stroke();

      // Nariz estruturado
      ctx.strokeStyle = '#8c5332';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(0, -58);
      ctx.lineTo(3, -49);
      ctx.lineTo(-2, -48);
      ctx.stroke();

      // Sobrancelhas grisalhas espessas
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (this.emotion === 'worried' || this.emotion === 'panicked') {
        ctx.moveTo(-15, -65); ctx.quadraticCurveTo(-9, -69, -3, -67);
        ctx.moveTo(3, -67); ctx.quadraticCurveTo(9, -69, 15, -65);
      } else {
        ctx.moveTo(-15, -66); ctx.lineTo(-4, -65);
        ctx.moveTo(4, -65); ctx.lineTo(15, -66);
      }
      ctx.stroke();

      // Boca por visema (áudio real — boca abre expressivamente sincronizada com o áudio)
      // Boca por visema anatômica natural e proporcional (Zero distorção ou cavidade gigante)
      if (this.mouthOpen > 0.05) {
        const o = Math.min(1.0, this.mouthOpen);
        const w = this.mouthWide || 0.5;
        const mw = 4.2 + w * 2.8; // Largura elegante e contida (4.2 a 7.0px)
        const mh = 0.8 + o * 3.2 * (1.0 - w * 0.25); // Altura contida natural (0.8 a 4.0px max)
        const jawDrop = o * 0.5;
        ctx.save();
        ctx.fillStyle = '#220808';
        ctx.beginPath();
        ctx.moveTo(-mw, -39 + jawDrop * 0.3);
        ctx.quadraticCurveTo(0, -39 - mh * 0.5, mw, -39 + jawDrop * 0.3);
        ctx.quadraticCurveTo(0, -39 + mh * 1.1 + jawDrop, -mw, -39 + jawDrop * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.clip();

        // Dentes superiores brancos discretos
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-mw * 0.75, -39 - mh * 0.4, mw * 1.5, mh * 0.45);

        // Língua avermelhada anatômica suave
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.ellipse(0, -39 + mh * 0.7 + jawDrop * 0.4, mw * 0.5, mh * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Contorno labial fino
        ctx.strokeStyle = '#5c2b18';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-mw, -39 + jawDrop * 0.3);
        ctx.quadraticCurveTo(0, -39 - mh * 0.5, mw, -39 + jawDrop * 0.3);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#5c2b18';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-5.5, -39);
        ctx.lineTo(5.5, -39);
        ctx.stroke();
      }

      // Bigode Grisalho Cheio — reage organicamente ao falar sem tampar a boca
      const mustY = -45 - this.mouthOpen * 1.2;
      const mustacheGrad = ctx.createLinearGradient(-11, mustY, 11, mustY + 5);
      mustacheGrad.addColorStop(0, '#cbd5e1');
      mustacheGrad.addColorStop(0.5, '#94a3b8');
      mustacheGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = mustacheGrad;
      ctx.beginPath();
      ctx.moveTo(0, mustY);
      ctx.quadraticCurveTo(9, mustY, 12, mustY + 4.5);
      ctx.quadraticCurveTo(6, mustY + 4, 0, mustY + 2.5);
      ctx.quadraticCurveTo(-6, mustY + 4, -12, mustY + 4.5);
      ctx.quadraticCurveTo(-9, mustY, 0, mustY);
      ctx.closePath();
      ctx.fill();

      // Cabelo Grisalho Penteado
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-22, -60);
      ctx.quadraticCurveTo(-24, -76, -15, -83);
      ctx.lineTo(-18, -62);
      ctx.closePath();
      ctx.moveTo(22, -60);
      ctx.quadraticCurveTo(24, -76, 15, -83);
      ctx.lineTo(18, -62);
      ctx.closePath();
      ctx.moveTo(-16, -82);
      ctx.quadraticCurveTo(0, -90, 16, -82);
      ctx.quadraticCurveTo(0, -83, -16, -82);
      ctx.fill();
    }
  }

  global.StudioCharacters = global.StudioCharacters || {};
  global.StudioCharacters.SeuValdirPorteiro = SeuValdirPorteiro;
})(typeof window !== 'undefined' ? window : globalThis);
