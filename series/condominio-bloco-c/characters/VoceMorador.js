/**
 * Personagem Modular 01: VOCÊ (Morador do Apto 302 — 24 anos)
 * Arquivo Individual Reutilizável — Rig Vetorial 2D Articulado com Cinemática Direta
 * Traje: Moletom Azul-Petróleo com capuz, bermuda cargo grafite com bolsos laterais,
 * chinelo Havaianas, chave manual do condomínio e smartphone aceso.
 *
 * Características do Rig:
 * - Ombro esférico contínuo (zero frestas ou braços soltos do tronco)
 * - Braço articulado em 2 segmentos (Braço Superior + Cotovelo Articulado + Antebraço + Mão Anatômica)
 * - Pernas articuladas em 2 segmentos (Coxa + Joelho Flexível + Canela + Chinelo com flexão)
 * - Motor de Locomoção Biomecânica (Walk Cycle natural: Contato, Amortecimento, Passagem e Impulso)
 * - Respiração orgânica em repouso (Zero tiques ou tremores artificiais)
 */
(function (global) {
  class VoceMorador {
    constructor(options = {}) {
      this.id = 'VOCE';
      this.name = 'Você (Morador do 302)';
      this.x = options.x || 0;
      this.y = options.y || 0;
      this.scale = options.scale || 1.0;
      this.flipX = options.flipX || false;

      this.emotion = options.emotion || 'tense'; // 'neutral' | 'tense' | 'shocked' | 'scared' | 'command'
      this.pose = options.pose || 'phone_look';  // 'idle' | 'phone_look' | 'key_ready' | 'step_back'
      this.viewMode = options.viewMode || 'auto'; // 'auto' | 'profile' | 'front'

      // Motor de Locomoção (Walk Cycle) e Detecção Automática de Direção (dx)
      this.isWalking = options.isWalking || false;
      this.walkSpeed = options.walkSpeed !== undefined ? options.walkSpeed : 1.0;
      this.walkCycle = options.walkCycle || 0;
      this.walkDir = options.walkDir || 1;
      this._prevX = this.x;

      // Expressão e Ciclos Fisiológicos
      this.mouthOpen = 0;
      this.mouthWide = 0.5;
      this.blinkTimer = 0.8;
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
      // Ataque rápido / relaxamento lento: boca não "pisca"
      this.mouthOpen += (mouthVal - this.mouthOpen) * (mouthVal > this.mouthOpen ? 0.55 : 0.28);
      this.mouthWide += (wideVal - this.mouthWide) * 0.3;

      this.blinkTimer += dt;
      if (this.blinkTimer > 3.8) {
        this.isBlinking = true;
        if (this.blinkTimer > 3.94) {
          this.isBlinking = false;
          this.blinkTimer = 0;
        }
      }

      // Alinhamento automático da direção de caminhada conforme deslocamento horizontal (dx)
      const dx = this.x - this._prevX;
      if (Math.abs(dx) > 0.05) {
        this.walkDir = dx < 0 ? -1 : 1;
        this.flipX = dx < 0;
      }
      this._prevX = this.x;

      if (this.isWalking) {
        this.walkCycle += dt * 4.6 * this.walkSpeed;
        if (this.walkCycle > Math.PI * 2) {
          this.walkCycle -= Math.PI * 2;
        }
      } else {
        if (this.walkCycle !== 0) this.walkCycle = 0;
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
     * VISÃO LATERAL DE PERFIL 2.5D (Caminhada Orgânica de Alta Fidelidade)
     * Curvas Bézier anatômicas fluidas, física de mola nos passos,
     * chinelo Havaianas com gravidade e feixe suave no celular.
     */
    _drawProfile(ctx) {
      const phi = this.walkCycle;
      const isWalk = this.isWalking;

      // Bob vertical e inclinação dinâmica do tronco
      const hipBob = isWalk ? Math.sin(phi * 2 - Math.PI / 2) * 3.0 : Math.sin(this.time * 1.0) * 0.6;
      const torsoTilt = isWalk ? 0.05 + Math.sin(phi * 2) * 0.015 : 0.03;

      // Cinemática Biomecânica Contínua C0 do Passo Humano 2D (Convenção Canvas 2D: +X = Frente, +Y = Baixo)
      // Nota: Em um membro vertical (0, L), ctx.rotate(theta) projeta x' = -L*sin(theta).
      // Portanto: theta < 0 move para FRENTE (+X) e theta > 0 move para TRÁS (-X).
      // O joelho humano só dobra para TRÁS (-X), logo kn DEVE SER SEMPRE POSITIVO (kn >= 0)!
      const calcLegProfile = (phase) => {
        if (!isWalk) {
          return { th: -0.02, kn: 0.06, ft: -0.04, soleDrop: 0 };
        }
        let p = phase % (Math.PI * 2);
        if (p < 0) p += Math.PI * 2;

        let th = 0;
        let kn = 0;
        let ft = 0;
        let soleDrop = 0;

        if (p < Math.PI) {
          // FASE DE APOIO / STANCE (0 a PI): Pé plantado no chão varrendo da FRENTE (-0.36) para TRÁS (+0.34)
          const u = p / Math.PI; // 0.0 (toque do calcanhar na frente) -> 1.0 (impulso dos dedos atrás)
          th = -0.35 * Math.cos(u * Math.PI) - 0.01;

          if (u < 0.35) {
            // Amortecimento da carga após o toque do calcanhar (joelho flexiona suavemente para trás)
            kn = 0.06 + 0.14 * Math.sin((u / 0.35) * Math.PI);
          } else if (u < 0.75) {
            // Sustentação firme no meio do apoio
            kn = 0.06;
          } else {
            // Pré-balanço: joelho começa a dobrar para trás antes de descolar do chão
            const k = (u - 0.75) / 0.25;
            kn = 0.06 + 0.32 * Math.sin(k * Math.PI * 0.5);
          }

          // Ângulo global do pé: mantém sola paralela ao piso (0 rad), com dorsiflexão no ataque e impulso no final
          let footGlobal = 0;
          if (u < 0.18) {
            // Ponta do pé levemente levantada no toque do calcanhar (dorsiflexão < 0)
            footGlobal = -0.20 * (1.0 - u / 0.18);
          } else if (u > 0.72) {
            // Calcanhar descola e ponta do pé empurra o chão (flexão plantar > 0)
            const k = (u - 0.72) / 0.28;
            footGlobal = 0.34 * Math.sin(k * Math.PI * 0.5);
          }
          ft = footGlobal - (th + kn);
          soleDrop = 0;
        } else {
          // FASE DE BALANÇO / SWING (PI a 2PI): Perna avança pelo ar de TRÁS (+0.34) para FRENTE (-0.36)
          const v = (p - Math.PI) / Math.PI; // 0.0 (decolagem atrás) -> 1.0 (ataque à frente)
          th = 0.35 * Math.cos(v * Math.PI) - 0.01;

          // JOELHO DOBRA PARA TRÁS (kn > 0): Pico no meio do passe (v ~ 0.45) chegando a +1.04 rad (60 graus para trás!)
          const swingArc = Math.sin(v * Math.PI);
          kn = 0.06 + 0.32 * (1.0 - v) + 0.82 * swingArc;

          // Pé no ar: transição suave do impulso até a dorsiflexão do próximo toque
          const footGlobal = 0.34 * (1.0 - v) * Math.cos(v * Math.PI * 0.5) - 0.20 * Math.pow(v, 1.4);
          ft = footGlobal - (th + kn);
          soleDrop = 3.2 * swingArc; // Havaianas descola levemente do calcanhar no ar
        }

        return { th, kn, ft, soleDrop };
      };

      const legBack = calcLegProfile(phi);
      const legFront = calcLegProfile(phi + Math.PI);

      // Sombra Dinâmica Elíptica no Piso
      const shadowW = 36 + (isWalk ? Math.abs(Math.sin(phi)) * 5 : 0);
      const shadowGrad = ctx.createRadialGradient(0, 165, 4, 0, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 165, shadowW, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. PERNA TRASEIRA (Far Leg — Com meia listrada e chinelo Havaianas)
      ctx.save();
      ctx.translate(-4, 62 + hipBob);
      this._drawProfileLeg(ctx, legBack.th, legBack.kn, legBack.ft, legBack.soleDrop, true);
      ctx.restore();

      // 1.5. BRAÇO TRASEIRO (Camada de Profundidade Atrás do Tronco — Sem Sobreposição Fantasma)
      ctx.save();
      ctx.translate(-4, -14 + hipBob);
      const backSwing = isWalk ? Math.sin(phi) * 0.25 : 0;
      ctx.rotate(backSwing);

      // Ombro traseiro escuro
      ctx.fillStyle = '#0a1d2e';
      ctx.beginPath();
      ctx.arc(0, 0, 7.0, 0, Math.PI * 2);
      ctx.fill();

      // Bíceps traseiro
      const upperBackLen = 27;
      ctx.fillStyle = '#0c2338';
      ctx.beginPath();
      ctx.moveTo(-5.5, 0);
      ctx.lineTo(5.5, 0);
      ctx.lineTo(4.8, upperBackLen);
      ctx.lineTo(-4.8, upperBackLen);
      ctx.closePath();
      ctx.fill();

      // Cotovelo traseiro e antebraço suave
      ctx.translate(0, upperBackLen);
      const backForeAngle = isWalk ? -(0.2 + Math.max(0, -backSwing) * 0.25) : -0.1;
      ctx.rotate(backForeAngle);

      ctx.fillStyle = '#0a1d2e';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();

      const foreBackLen = 25;
      ctx.fillStyle = '#0c2338';
      ctx.beginPath();
      ctx.moveTo(-4.5, 0);
      ctx.lineTo(4.5, 0);
      ctx.lineTo(3.8, foreBackLen);
      ctx.lineTo(-3.8, foreBackLen);
      ctx.closePath();
      ctx.fill();

      // Punho e mão traseira anatômica relaxada
      ctx.fillStyle = '#081624';
      ctx.fillRect(-4.0, foreBackLen - 4, 8, 4.5);
      ctx.translate(0, foreBackLen);
      ctx.fillStyle = '#b87d4e';
      ctx.beginPath();
      ctx.roundRect(-3.5, 0, 7, 8, 2.5);
      ctx.fill();
      ctx.restore(); // Fim Braço Traseiro

      // 2. PELVE / CINTURA DO MOLETOM E BERMUDA
      // Conector limpo logo abaixo da barra canelada (zero quadrado estático flutuando!)
      ctx.save();
      ctx.translate(0, 58 + hipBob);
      ctx.rotate(torsoTilt * 0.6);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-8, 0, 16, 8, 3);
      ctx.fill();
      ctx.restore();

      // 3. TRONCO DO MOLETOM EM PERFIL (Silhueta Orgânica e Caimento Calibrado a 247px)
      ctx.save();
      ctx.translate(0, hipBob);
      ctx.rotate(torsoTilt);

      // Capuz caído suavemente atrás da nuca
      ctx.fillStyle = '#0f2942';
      ctx.beginPath();
      ctx.moveTo(-14, -26);
      ctx.bezierCurveTo(-26, -14, -22, 12, -14, 16);
      ctx.bezierCurveTo(-10, 14, -8, 2, -6, -12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Corpo do Moletom com caimento calibrado com a visão frontal (topo em y = -26, base em y = 60)
      const hoodieGrad = ctx.createLinearGradient(-18, -26, 20, 62);
      hoodieGrad.addColorStop(0, '#1e4e79');
      hoodieGrad.addColorStop(0.5, '#153a5b');
      hoodieGrad.addColorStop(1, '#0c2338');
      ctx.fillStyle = hoodieGrad;

      ctx.beginPath();
      ctx.moveTo(-15, -26);
      ctx.bezierCurveTo(-20, 0, -18, 35, -13, 60);
      ctx.lineTo(14, 60);
      ctx.bezierCurveTo(18, 35, 18, 0, 15, -26);
      ctx.closePath();
      ctx.fill();

      // Barra canelada inferior
      ctx.fillStyle = '#0a1d2e';
      ctx.beginPath();
      ctx.roundRect(-14, 56, 28, 7, 2);
      ctx.fill();

      // Bolso Canguru lateral suave
      ctx.fillStyle = 'rgba(10, 25, 42, 0.50)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(14, 24);
      ctx.quadraticCurveTo(8, 28, 6, 46);
      ctx.lineTo(13, 48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cordão branco do capuz com balanço natural
      const cordSway = isWalk ? Math.sin(phi * 2) * 1.5 : 0;
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(6, -20);
      ctx.quadraticCurveTo(10 + cordSway, -6, 9 + cordSway, 8);
      ctx.stroke();

      // 4. CABEÇA EM PERFIL (Proporção 1:1 rigorosa com frontal: 61px de crânio, topo em y = -95, pescoço anatômico)
      ctx.save();
      ctx.translate(2, -38);
      ctx.rotate(0.06 + (isWalk ? Math.sin(phi) * 0.018 : 0));
      ctx.scale(1.35, 1.35);

      // Pescoço natural conectando da mandíbula ao colarinho do moletom
      ctx.fillStyle = '#c68a5e';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(5, 10);
      ctx.lineTo(-5, 10);
      ctx.closePath();
      ctx.fill();

      // Rosto esculpido em curvas cúbicas suaves (testa, nariz elegante, lábios e queixo em y = -34)
      const faceGrad = ctx.createLinearGradient(-10, -32, 14, 8);
      faceGrad.addColorStop(0, '#dba87a');
      faceGrad.addColorStop(0.7, '#c99060');
      faceGrad.addColorStop(1, '#b87d4e');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      // Início nuca
      ctx.moveTo(-13, -12);
      ctx.bezierCurveTo(-14, -26, -6, -34, 0, -34);
      // Curva suave da testa
      ctx.bezierCurveTo(8, -34, 11, -26, 11.5, -19);
      // Ponte nasal com leve depressão natural
      ctx.quadraticCurveTo(11.8, -16, 12.8, -14);
      // Rampa do nariz suave até a ponta arredondada
      ctx.quadraticCurveTo(14.5, -12, 16.0, -10.5);
      // Ponta do nariz delicada
      ctx.quadraticCurveTo(16.5, -9.5, 14.8, -9.0);
      // Asa nasal e filtro labial
      ctx.quadraticCurveTo(13.2, -8.5, 13.6, -6.5);
      // Lábio superior sutil
      ctx.quadraticCurveTo(14.4, -6.0, 13.6, -5.2);
      // Abertura da boca / lábio inferior com volume suave
      ctx.quadraticCurveTo(14.2, -4.2, 13.8, -3.2);
      // Queixo jovem delicadamente arredondado (em y = -34 no mundo)
      ctx.bezierCurveTo(13.5, 1.5, 11.0, 4.5, 7.5, 5.0);
      // Mandíbula suave correndo até o lóbulo da orelha
      ctx.bezierCurveTo(0, 5.5, -8, 2.0, -10, -2);
      ctx.lineTo(-13, -12);
      ctx.closePath();
      ctx.fill();

      // Cabelo Undercut Castanho Escuro com volume e mechas estilizadas (sem cobrir o olho)
      const hairGrad = ctx.createLinearGradient(0, -42, 0, -10);
      hairGrad.addColorStop(0, '#272038');
      hairGrad.addColorStop(1, '#120e1c');
      ctx.fillStyle = hairGrad;

      ctx.beginPath();
      // Nuca e lateral raspada (undercut)
      ctx.moveTo(-15, 0);
      ctx.bezierCurveTo(-18, -14, -14, -36, 0, -38);
      // Volume superior do topete moderno
      ctx.bezierCurveTo(8, -40, 16, -34, 15, -24);
      // Franja elegante caindo sobre a testa ACIMA da sobrancelha (olho 100% livre)
      ctx.quadraticCurveTo(15.5, -20, 13.5, -18);
      ctx.quadraticCurveTo(11, -19, 10, -21);
      ctx.quadraticCurveTo(8, -19, 6, -21);
      // Curva da têmpora acima do olho
      ctx.quadraticCurveTo(2, -22, -2, -18);
      // Costeleta estilizada na frente da orelha
      ctx.lineTo(-4, -11);
      ctx.lineTo(-7, -11);
      ctx.bezierCurveTo(-10, -8, -12, -2, -14, 0);
      ctx.closePath();
      ctx.fill();

      // Orelha Anatômica em Perfil com sulco e lóbulo
      ctx.fillStyle = '#c99060';
      ctx.beginPath();
      ctx.ellipse(-2.5, -7, 4.5, 6.2, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b87d4e';
      ctx.beginPath();
      ctx.ellipse(-2.5, -7, 2.4, 3.8, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Olho em Perfil — Redesenhado com proporção natural e formato amendoado anatômico
      if (!this.isBlinking) {
        // Esclera com formato amendoado suave (não triangular)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(9.5, -11.5, 3.8, 2.6, 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Íris castanha posicionada olhando levemente para baixo/celular
        ctx.fillStyle = '#5c3317';
        ctx.beginPath();
        ctx.arc(10.2, -11.2, 2.0, 0, Math.PI * 2);
        ctx.fill();

        // Pupila preta centralizada na íris
        ctx.fillStyle = '#0f0f0f';
        ctx.beginPath();
        ctx.arc(10.2, -11.2, 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Brilho especular duplo (realismo natural)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(9.4, -12.0, 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(11.0, -10.6, 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Linha superior da pálpebra (define o olho sem parecer estranho)
        ctx.strokeStyle = '#3d2010';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.ellipse(9.5, -11.5, 3.8, 2.6, 0.08, Math.PI + 0.2, -0.2);
        ctx.stroke();

        // Cílios sutis no canto externo
        ctx.strokeStyle = '#2a1a0e';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(13.0, -12.2);
        ctx.lineTo(13.8, -12.8);
        ctx.stroke();
      } else {
        // Pálpebra fechada com curva suave natural
        ctx.strokeStyle = '#3d2010';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(6.0, -11.5);
        ctx.quadraticCurveTo(9.5, -10.0, 13.0, -11.5);
        ctx.stroke();
      }

      // Sobrancelha expressiva jovem
      ctx.strokeStyle = '#1e1b2e';
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(6, -17);
      ctx.quadraticCurveTo(9.5, -18.5, 13.5, -16);
      ctx.stroke();

      // Boca Dinâmica em Perfil (Natural e Contida — Zero distorção)
      if (this.mouthOpen > 0.06) {
        const mo = Math.min(1.0, this.mouthOpen);
        ctx.save();
        ctx.fillStyle = '#2a0a0a';
        ctx.beginPath();
        ctx.moveTo(13.6, -5.8);
        ctx.quadraticCurveTo(14.8, -4.8, 13.8, -3.4 - mo * 1.3);
        ctx.quadraticCurveTo(11.8, -4.5, 13.6, -5.8);
        ctx.closePath();
        ctx.fill();
        ctx.clip();

        // Dentes superiores brancos sutis
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(11.5, -5.8, 3.5, 1.0 * mo);

        // Língua avermelhada
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.ellipse(12.8, -4.0, 1.4, 0.8 * mo, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Contorno dos lábios
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(13.6, -5.8);
        ctx.quadraticCurveTo(14.8, -4.8, 13.8, -3.4 - mo * 1.3);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(12.4, -4.8);
        ctx.lineTo(14.2, -4.8);
        ctx.stroke();
      }

      ctx.restore(); // Fim Cabeça

      // 5. BRAÇO DIANTEIRO ARTICULADO (Segurando Smartphone com Feixe de Luz)
      ctx.save();
      ctx.translate(2, -14); // Ombro dianteiro ancorado no tronco
      const armBob = isWalk ? Math.sin(phi * 2) * 0.04 : 0;
      const upperAngle = -0.32 - armBob; // Ângulo voltado para frente (+X) e baixo (+Y)

      // Ombro dianteiro esférico com caimento de moletom
      const shoulderGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 8.5);
      shoulderGrad.addColorStop(0, '#255e91');
      shoulderGrad.addColorStop(1, '#153a5b');
      ctx.fillStyle = shoulderGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(upperAngle);

      // Bíceps do Moletom com gradiente cilíndrico
      const upperArmLen = 30;
      const bicepGrad = ctx.createLinearGradient(-7.5, 0, 7.5, upperArmLen);
      bicepGrad.addColorStop(0, '#1e4e79');
      bicepGrad.addColorStop(0.5, '#153a5b');
      bicepGrad.addColorStop(1, '#0c2338');
      ctx.fillStyle = bicepGrad;
      ctx.beginPath();
      ctx.moveTo(-7.5, 0);
      ctx.lineTo(7.5, 0);
      ctx.quadraticCurveTo(8.0, upperArmLen * 0.5, 6.5, upperArmLen);
      ctx.lineTo(-6.5, upperArmLen);
      ctx.quadraticCurveTo(-8.0, upperArmLen * 0.5, -7.5, 0);
      ctx.closePath();
      ctx.fill();

      // Luz de recorte na manga
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-6.4, 2);
      ctx.lineTo(-5.6, upperArmLen - 2);
      ctx.stroke();

      // Cotovelo Dianteiro com dobra de tecido (flexão para frente e para cima)
      ctx.translate(0, upperArmLen);
      const elbowFlex = -1.68 + armBob * 0.5; // Dobra ~96 graus elevando o celular ao peito/rosto
      ctx.rotate(elbowFlex);

      ctx.fillStyle = '#153a5b';
      ctx.beginPath();
      ctx.arc(0, 0, 6.8, 0, Math.PI * 2);
      ctx.fill();

      // Antebraço do Moletom até o punho
      const foreArmLen = 27;
      const foreGrad = ctx.createLinearGradient(-6.5, 0, 6.5, foreArmLen);
      foreGrad.addColorStop(0, '#153a5b');
      foreGrad.addColorStop(1, '#0c2338');
      ctx.fillStyle = foreGrad;
      ctx.beginPath();
      ctx.moveTo(-6.5, 0);
      ctx.lineTo(6.5, 0);
      ctx.lineTo(5.5, foreArmLen);
      ctx.lineTo(-5.5, foreArmLen);
      ctx.closePath();
      ctx.fill();

      // Punho Canelado do Moletom
      ctx.fillStyle = '#0a1d2e';
      ctx.beginPath();
      ctx.roundRect(-6.0, foreArmLen - 5.5, 12, 5.5, 2);
      ctx.fill();

      // Mão Anatômica Dianteira (Palma + Polegar + 4 Dedos Curvados ao redor do Celular)
      ctx.translate(0, foreArmLen);
      ctx.rotate(-0.15); // Alinhamento fino ergonômico no punho

      // Palma da mão conectada
      ctx.fillStyle = '#c99060';
      ctx.beginPath();
      ctx.roundRect(-4.5, 0, 9.5, 10, [2, 2, 4, 4]);
      ctx.fill();

      // Smartphone Moderno
      ctx.save();
      ctx.translate(1.0, 5.0);
      ctx.rotate(-0.28); // Ângulo voltado ergonomicamente para os olhos

      // Chassi do Smartphone (Titânio escuro com borda suave)
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-5.5, -13, 11.5, 24, 3.2);
      ctx.fill();
      ctx.stroke();

      // Tela AMOLED Iluminada Ciano (voltada para o rosto, à esquerda)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-4.5, -11.5, 7.5, 20.5, 2.0);
      ctx.fill();

      // Notch / câmera frontal
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(-1.5, -9.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Linhas da interface no visor
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(-3.5, -5.5, 5.0, 1.2);
      ctx.fillRect(-3.5, -2.5, 3.8, 1.2);

      // 4 Dedos Anatômicos Envolvendo a Borda Traseira/Direita do Celular
      const fingerYStarts = [-7.5, -2.8, 2.0, 6.8];
      const fingerLens = [5.5, 5.8, 5.4, 4.6];
      fingerYStarts.forEach((fy, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#c99060' : '#b87d4e';
        ctx.strokeStyle = '#8b5e3c';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(1.5, fy, fingerLens[idx], 3.4, 1.7);
        ctx.fill();
        ctx.stroke();

        // Unha estilizada sutil
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(1.5 + fingerLens[idx] - 1.6, fy + 0.7, 1.1, 1.8);
      });

      // Polegar apoiado na base inferior da tela
      ctx.fillStyle = '#b87d4e';
      ctx.beginPath();
      ctx.ellipse(-3.0, 7.5, 2.5, 3.6, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Brilho volumétrico suave difuso da tela em direção ao rosto
      const screenGlow = ctx.createRadialGradient(-2, -5, 2, -18, -25, 45);
      screenGlow.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
      screenGlow.addColorStop(0.45, 'rgba(56, 189, 248, 0.08)');
      screenGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = screenGlow;
      ctx.beginPath();
      ctx.arc(-2, -5, 45, -Math.PI * 0.9, Math.PI * 0.1);
      ctx.lineTo(-2, -5);
      ctx.closePath();
      ctx.fill();

      ctx.restore(); // Fim Smartphone
      ctx.restore(); // Fim Braço Dianteiro

      ctx.restore(); // Fim Tronco

      // 6. PERNA DIANTEIRA (Near Leg com Meia Listrada e Chinelo Havaianas)
      ctx.save();
      ctx.translate(4, 62 + hipBob);
      this._drawProfileLeg(ctx, legFront.th, legFront.kn, legFront.ft, legFront.soleDrop, false);
      ctx.restore();
    }

    /**
     * Perna Articulada em Perfil com Meia Listrada, Flexão Anatômica e Chinelo Havaianas
     */
    _drawProfileLeg(ctx, thighAngle, kneeAngle, footAngle, soleDrop = 0, isBack = false) {
      ctx.save();
      ctx.rotate(thighAngle);

      const skinColor = isBack ? '#d99b72' : '#eab38c';
      const shortColor1 = isBack ? '#0f172a' : '#1e293b';
      const shortColor2 = isBack ? '#020617' : '#0f172a';
      const thighLen = 42;
      const shinLen = 42;
      const shortLen = 29;

      // Tecido da bermuda cargo sobre a coxa que gira 100% com a perna
      const shortsGrad = ctx.createLinearGradient(-8, 0, 8, shortLen);
      shortsGrad.addColorStop(0, shortColor1);
      shortsGrad.addColorStop(1, shortColor2);
      ctx.fillStyle = shortsGrad;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.quadraticCurveTo(8.5, shortLen * 0.5, 7.5, shortLen);
      ctx.lineTo(-7.5, shortLen);
      ctx.quadraticCurveTo(-8.5, shortLen * 0.5, -8, 0);
      ctx.closePath();
      ctx.fill();

      // Bainha da bermuda cargo
      ctx.fillStyle = shortColor2;
      ctx.beginPath();
      ctx.roundRect(-8, shortLen - 4, 16, 4.5, 1.5);
      ctx.fill();

      // Bolso cargo lateral NA PERNA DA FRENTE (gira junto com a coxa, NUNCA flutua solto!)
      if (!isBack) {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-5.5, 6, 11, 14, 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-6, 4, 12, 3.5);
      }

      // Pele da coxa visível entre a barra da bermuda e o joelho
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(-6.5, shortLen);
      ctx.lineTo(6.5, shortLen);
      ctx.lineTo(5.8, thighLen);
      ctx.lineTo(-5.8, thighLen);
      ctx.closePath();
      ctx.fill();

      // Joelho Articulado (Centro da dobra da canela)
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, 0, 5.8, 0, Math.PI * 2);
      ctx.fill();

      // Canela anatômica de perfil (curvatura suave na panturrilha)
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(-5.5, 0);
      ctx.quadraticCurveTo(-6.8, shinLen * 0.4, -4.5, shinLen);
      ctx.lineTo(4.5, shinLen);
      ctx.quadraticCurveTo(5.8, shinLen * 0.4, 5.5, 0);
      ctx.closePath();
      ctx.fill();

      // Meia esportiva branca cano curto com listra vermelha
      ctx.fillStyle = isBack ? '#cbd5e1' : '#f8fafc';
      ctx.fillRect(-5, shinLen - 11, 10, 11);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, shinLen - 8, 10, 2.2);

      // Tornozelo e Chinelo Havaianas
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      // Pé com anatomia suave
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(11, 0);
      ctx.quadraticCurveTo(15, 3, 13, 7);
      ctx.lineTo(-6, 7);
      ctx.closePath();
      ctx.fill();

      // Solado de borracha Havaianas com gravidade (afasta do calcanhar quando no ar)
      ctx.save();
      ctx.translate(0, soleDrop);

      // Solado preto/azul marinho
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-7, 7, 22, 5, 2.5);
      ctx.fill();

      // Tiras de borracha azul-ciano (#38bdf8) presas no dedão
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-1, 5 - soleDrop * 0.4);
      ctx.quadraticCurveTo(5, 2, 9, 7);
      ctx.stroke();

      ctx.restore(); // Fim Solado

      ctx.restore(); // Fim Perna
    }

    /**
     * VISÃO FRONTAL ESTILIZADA (Para paradas, sustos e reações)
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
        hipBob = Math.sin(phi * 2 - Math.PI / 2) * 2.8;
        hipSway = Math.sin(phi) * 1.2;
        torsoTilt = 0.04;

        const leg = (p) => {
          const th = Math.sin(p) * 0.44;
          const isSwing = Math.cos(p) < 0;
          const kn = isSwing ? -Math.cos(p) * 1.10 : 0.02;
          const ft = isSwing ? 0.12 : -(th + kn);
          return [th, kn, ft];
        };
        [leftThigh, leftKnee, leftFoot] = leg(phi);
        [rightThigh, rightKnee, rightFoot] = leg(phi + Math.PI);

        leftArmSwing = -Math.sin(phi) * 0.35;
        rightArmSwing = Math.sin(phi) * 0.08;
      } else {
        hipBob = Math.sin(this.time * 1.0) * 0.6;
        torsoTilt = 0;
        leftThigh = -0.01;
        rightThigh = 0.01;
        leftKnee = 0.02;
        rightKnee = 0.02;
      }

      // Sombra Dinâmica no Piso
      const shadowW = 46 + (this.isWalking ? Math.abs(Math.cos(this.walkCycle)) * 4 : 0);
      const shadowGrad = ctx.createRadialGradient(hipSway * 0.5, 165, 5, hipSway * 0.5, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(hipSway * 0.5, 165, shadowW, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. PERNAS ARTICULADAS (Bermuda Cargo + Canelas + Havaianas)
      this._drawArticulatedLeg(ctx, -14 + hipSway * 0.4, 62 + hipBob, leftThigh, leftKnee, leftFoot, '#d9a17c');
      this._drawArticulatedLeg(ctx, 14 + hipSway * 0.4, 62 + hipBob, rightThigh, rightKnee, rightFoot, '#e6b08a');

      // 2. QUADRIL DA BERMUDA CARGO GRAFITE
      ctx.save();
      ctx.translate(hipSway * 0.5, 60 + hipBob);
      ctx.rotate(torsoTilt * 0.5);

      const shortsGrad = ctx.createLinearGradient(-26, 0, 26, 32);
      shortsGrad.addColorStop(0, '#1e293b');
      shortsGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = shortsGrad;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(25, 0);
      ctx.quadraticCurveTo(28, 28, 20, 32);
      ctx.lineTo(0, 26);
      ctx.lineTo(-20, 32);
      ctx.quadraticCurveTo(-28, 28, -25, 0);
      ctx.closePath();
      ctx.fill();

      // Bolso cargo lateral
      ctx.fillStyle = '#172033';
      ctx.beginPath();
      ctx.roundRect(10, 8, 14, 18, 3);
      ctx.fill();

      ctx.restore();

      // 3. BRAÇO ESQUERDO (Trás — Segurando Chave do Apê)
      ctx.save();
      ctx.translate(-26 + hipSway * 0.5, -16 + hipBob);
      ctx.rotate(torsoTilt);

      let leftUpperAngle = 0.12 + leftArmSwing;
      let leftForeAngle = 0.22 + Math.max(0, -leftArmSwing) * 0.45;
      if (this.pose === 'key_ready') {
        leftUpperAngle = -0.45;
        leftForeAngle = -0.65;
      }
      this._drawArticulatedArm(ctx, leftUpperAngle, leftForeAngle, false);
      ctx.restore();

      // 4. TRONCO DO MOLETOM AZUL-PETRÓLEO COM CAPUZ E BOLSO CANGURU
      ctx.save();
      ctx.translate(hipSway * 0.4, hipBob);
      ctx.rotate(torsoTilt);

      this._drawTorsoAndHoodie(ctx);

      // 5. CABEÇA & ROSTO
      this._drawHead(ctx);

      ctx.restore();

      // 6. BRAÇO DIREITO (Frente — Segurando Smartphone com tela acesa)
      ctx.save();
      ctx.translate(26 + hipSway * 0.5, -16 + hipBob);
      ctx.rotate(torsoTilt);

      let rightUpperAngle = -0.15 + rightArmSwing;
      let rightForeAngle = 0.25;

      if (this.pose === 'phone_look') {
        const armBob = this.isWalking ? Math.sin(this.walkCycle) * 0.05 : 0;
        rightUpperAngle = 0.32 + armBob;
        rightForeAngle = 2.15 - armBob * 0.4;
      } else if (this.pose === 'step_back') {
        rightUpperAngle = 0.12;
        rightForeAngle = 1.15;
      }
      this._drawArticulatedArm(ctx, rightUpperAngle, rightForeAngle, true);
      ctx.restore();
    }

    _drawArticulatedLeg(ctx, hipX, hipY, thighAngle, kneeAngle, footAngle, skinTone) {
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(thighAngle);

      const thighLen = 42;
      const shinLen = 42;

      // 1. Coxa coberta pela bermuda cargo
      const thighGrad = ctx.createLinearGradient(-9, 0, 9, thighLen);
      thighGrad.addColorStop(0, '#1e293b');
      thighGrad.addColorStop(0.7, '#0f172a');
      thighGrad.addColorStop(1, skinTone);
      ctx.fillStyle = thighGrad;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.lineTo(7, thighLen);
      ctx.lineTo(-7, thighLen);
      ctx.closePath();
      ctx.fill();

      // Barra da bermuda cargo
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, thighLen - 12, 16, 6);

      // Joelho
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Canela anatômica
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(4.5, shinLen);
      ctx.lineTo(-4.5, shinLen);
      ctx.closePath();
      ctx.fill();

      // Meia esportiva cano curto branca com listra vermelha
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-5, shinLen - 10, 10, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, shinLen - 7, 10, 2);

      // 3. Tornozelo e Chinelo Havaianas
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      // Solado preto
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-8, 0, 22, 6, 3);
      ctx.fill();

      // Tiras de borracha azul-ciano
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.quadraticCurveTo(4, -6, 10, 0);
      ctx.stroke();

      ctx.restore();
    }

    _drawArticulatedArm(ctx, upperAngle, foreAngle, holdsPhone) {
      const upperLen = 34;
      const foreLen = 32;

      // Ombro esférico do moletom
      ctx.fillStyle = '#153a5b';
      ctx.beginPath();
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(upperAngle);

      // Braço Superior do Moletom
      const upperGrad = ctx.createLinearGradient(-8, 0, 8, upperLen);
      upperGrad.addColorStop(0, '#1e4e79');
      upperGrad.addColorStop(1, '#153a5b');
      ctx.fillStyle = upperGrad;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(7, upperLen);
      ctx.lineTo(-7, upperLen);
      ctx.closePath();
      ctx.fill();

      // Cotovelo
      ctx.translate(0, upperLen);
      ctx.rotate(foreAngle);

      ctx.fillStyle = '#153a5b';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Antebraço do Moletom
      const foreGrad = ctx.createLinearGradient(-7, 0, 7, foreLen);
      foreGrad.addColorStop(0, '#153a5b');
      foreGrad.addColorStop(1, '#0c2338');
      ctx.fillStyle = foreGrad;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.lineTo(5.5, foreLen);
      ctx.lineTo(-5.5, foreLen);
      ctx.closePath();
      ctx.fill();

      // Punho canelado do moletom
      ctx.fillStyle = '#0a1d2e';
      ctx.fillRect(-6, foreLen - 5, 12, 5);

      // Mão Anatômica
      ctx.translate(0, foreLen);
      ctx.fillStyle = '#c99060';
      ctx.beginPath();
      ctx.roundRect(-5.5, 0, 11, 13, 4);
      ctx.fill();

      if (holdsPhone) {
        // Smartphone moderno aceso
        ctx.save();
        ctx.translate(0, 6);
        ctx.rotate(-0.35);

        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-6, -14, 12, 24, 3);
        ctx.fill();
        ctx.stroke();

        // Tela iluminada
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-4.5, -11, 9, 18);

        // Brilho suave da tela
        const phoneGlow = ctx.createRadialGradient(0, 0, 2, -18, -25, 45);
        phoneGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        phoneGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = phoneGlow;
        ctx.beginPath();
        ctx.arc(-8, -12, 42, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Chave manual do condomínio
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 8, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-1.5, 12, 3, 9);
      }

      ctx.restore();
    }

    /**
     * Boca por visema anatômica natural e proporcional (Zero distorção)
     */
    _drawVisemeMouth(ctx, y) {
      const o = Math.min(1.0, this.mouthOpen);
      const w = this.mouthWide || 0.5;
      const mw = 4.0 + w * 2.8; // Largura contida e elegante (4.0 a 6.8px)
      const mh = 0.8 + o * 2.8 * (1.0 - w * 0.25); // Altura contida natural (0.8 a 3.6px max)
      const jawDrop = o * 0.5;
      ctx.save();
      ctx.fillStyle = '#2a0a0a';
      ctx.beginPath();
      ctx.moveTo(-mw, y + jawDrop * 0.3);
      ctx.quadraticCurveTo(0, y - mh * 0.5, mw, y + jawDrop * 0.3);
      ctx.quadraticCurveTo(0, y + mh * 1.1 + jawDrop, -mw, y + jawDrop * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-mw * 0.75, y - mh * 0.4, mw * 1.5, mh * 0.45);
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(0, y + mh * 0.7 + jawDrop * 0.4, mw * 0.5, mh * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-mw, y + jawDrop * 0.3);
      ctx.quadraticCurveTo(0, y - mh * 0.5, mw, y + jawDrop * 0.3);
      ctx.stroke();
    }

    _drawTorsoAndHoodie(ctx) {
      // Capuz caído atrás da nuca
      ctx.fillStyle = '#0f2942';
      ctx.beginPath();
      ctx.ellipse(0, -28, 30, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Corpo do Moletom
      const torsoGrad = ctx.createLinearGradient(-32, -26, 32, 68);
      torsoGrad.addColorStop(0, '#1e4e79');
      torsoGrad.addColorStop(0.6, '#153a5b');
      torsoGrad.addColorStop(1, '#0c2338');
      ctx.fillStyle = torsoGrad;
      ctx.beginPath();
      ctx.moveTo(-24, -26);
      ctx.quadraticCurveTo(0, -30, 24, -26);
      ctx.bezierCurveTo(33, -10, 31, 35, 26, 66);
      ctx.quadraticCurveTo(0, 71, -26, 66);
      ctx.bezierCurveTo(-31, 35, -33, -10, -24, -26);
      ctx.closePath();
      ctx.fill();

      // Ombreiras arredondadas
      ctx.fillStyle = '#1e4e79';
      ctx.beginPath();
      ctx.ellipse(-24, -20, 6, 7, 0.2, 0, Math.PI * 2);
      ctx.ellipse(24, -20, 6, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Luz de recorte azulada
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.38)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Barra canelada da cintura
      ctx.fillStyle = '#0a1d2e';
      ctx.beginPath();
      ctx.roundRect(-25, 56, 50, 11, 4);
      ctx.fill();

      // Bolso Canguru frontal
      ctx.fillStyle = 'rgba(10, 25, 42, 0.55)';
      ctx.beginPath();
      ctx.moveTo(-18, 26);
      ctx.lineTo(18, 26);
      ctx.lineTo(22, 54);
      ctx.lineTo(-22, 54);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Cordões brancos
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, -22);
      ctx.quadraticCurveTo(-9, -6, -7, 6);
      ctx.moveTo(7, -22);
      ctx.quadraticCurveTo(9, -6, 7, 6);
      ctx.stroke();
    }

    _drawHead(ctx) {
      // Pescoço
      ctx.fillStyle = '#c68a5e';
      ctx.beginPath();
      ctx.roundRect(-7, -38, 14, 16, 4);
      ctx.fill();

      // Orelhas
      ctx.fillStyle = '#c99060';
      ctx.beginPath();
      ctx.ellipse(-22, -55, 4.5, 7, -0.1, 0, Math.PI * 2);
      ctx.ellipse(22, -55, 4.5, 7, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Rosto com contorno de mandíbula
      const faceGrad = ctx.createLinearGradient(-20, -82, 20, -34);
      faceGrad.addColorStop(0, '#dba87a');
      faceGrad.addColorStop(0.7, '#c99060');
      faceGrad.addColorStop(1, '#b87d4e');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(-21, -64);
      ctx.quadraticCurveTo(-22, -84, 0, -85);
      ctx.quadraticCurveTo(22, -84, 21, -64);
      ctx.bezierCurveTo(21, -46, 12, -35, 0, -34);
      ctx.bezierCurveTo(-12, -35, -21, -46, -21, -64);
      ctx.closePath();
      ctx.fill();

      // Olheiras sutis
      ctx.strokeStyle = 'rgba(120, 70, 50, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-8.5, -56, 5.5, 0.2, Math.PI - 0.2);
      ctx.arc(8.5, -56, 5.5, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Olhos em 4 camadas — Proporção natural e expressiva
      const isWide = (this.emotion === 'shocked' || this.emotion === 'scared');
      const eyeH = isWide ? 5.8 : 4.5;
      const lookY = this.pose === 'phone_look' ? 1.2 : 0;

      if (!this.isBlinking) {
        [-8.5, 8.5].forEach(ex => {
          // Esclera com formato amendoado natural
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(ex, -58, 5.5, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          // Íris castanha proporcional ao olho
          const irisR = isWide ? 2.8 : 3.2;
          ctx.fillStyle = '#5c3317';
          ctx.beginPath();
          ctx.arc(ex + 0.3, -58 + lookY, irisR, 0, Math.PI * 2);
          ctx.fill();

          // Pupila preta centralizada
          ctx.fillStyle = '#0f0f0f';
          ctx.beginPath();
          ctx.arc(ex + 0.3, -58 + lookY, irisR * 0.55, 0, Math.PI * 2);
          ctx.fill();

          // Brilho especular duplo (natural e realista)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex - 1.2, -59.8, 1.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + 1.8, -56.5, 0.6, 0, Math.PI * 2);
          ctx.fill();

          // Linha superior da pálpebra (define o olho sem parecer estranho)
          ctx.strokeStyle = '#3d2010';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(ex, -58, 5.5, eyeH, 0, Math.PI + 0.3, -0.3);
          ctx.stroke();
        });
      } else {
        // Pálpebras fechadas com curva suave
        ctx.strokeStyle = '#3d2010';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-13.5, -58);
        ctx.quadraticCurveTo(-8.5, -56, -3.5, -58);
        ctx.moveTo(3.5, -58);
        ctx.quadraticCurveTo(8.5, -56, 13.5, -58);
        ctx.stroke();
      }

      // Nariz
      ctx.strokeStyle = '#b87b52';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -58);
      ctx.lineTo(2.5, -50);
      ctx.lineTo(-1, -49);
      ctx.stroke();

      // Sobrancelhas
      ctx.strokeStyle = '#1e1b2e';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (this.emotion === 'shocked' || this.emotion === 'scared') {
        ctx.moveTo(-14, -64); ctx.quadraticCurveTo(-8, -70, -3, -66);
        ctx.moveTo(3, -66); ctx.quadraticCurveTo(8, -70, 14, -64);
      } else if (this.emotion === 'command') {
        ctx.moveTo(-14, -66); ctx.lineTo(-3, -63);
        ctx.moveTo(3, -63); ctx.lineTo(14, -66);
      } else {
        ctx.moveTo(-14, -65); ctx.quadraticCurveTo(-8, -67, -3, -64);
        ctx.moveTo(3, -64); ctx.quadraticCurveTo(8, -67, 14, -65);
      }
      ctx.stroke();

      // Boca
      if (this.mouthOpen > 0.06) {
        this._drawVisemeMouth(ctx, -42);
      } else {
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.emotion === 'scared') {
          ctx.moveTo(-5, -41); ctx.quadraticCurveTo(0, -44, 5, -41);
        } else {
          ctx.moveTo(-5, -42); ctx.quadraticCurveTo(0, -41, 5, -42.5);
        }
        ctx.stroke();
      }

      // Cabelo Undercut Castanho
      const hairGrad = ctx.createLinearGradient(0, -94, 0, -64);
      hairGrad.addColorStop(0, '#272038');
      hairGrad.addColorStop(1, '#120e1c');
      ctx.fillStyle = hairGrad;

      ctx.beginPath();
      ctx.moveTo(-22, -62);
      ctx.bezierCurveTo(-26, -82, -14, -95, 2, -93);
      ctx.bezierCurveTo(18, -94, 26, -80, 22, -62);
      ctx.lineTo(16, -69);
      ctx.lineTo(11, -63);
      ctx.lineTo(4, -71);
      ctx.lineTo(-3, -63);
      ctx.lineTo(-10, -70);
      ctx.lineTo(-16, -64);
      ctx.closePath();
      ctx.fill();
    }
  }

  global.StudioCharacters = global.StudioCharacters || {};
  global.StudioCharacters.VoceMorador = VoceMorador;
})(typeof window !== 'undefined' ? window : globalThis);
