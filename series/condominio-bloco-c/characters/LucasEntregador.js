/**
 * Personagem Modular 04: LUCAS (Entregador de Aplicativo — 22 anos)
 * Arquivo Individual Reutilizável — Rig Vetorial 2D Articulado com Cinemática Direta
 * Traje: Jaqueta impermeável preta/vermelha com faixas refletivas, bag térmica quadrada
 * nas costas, capacete aberto com viseira transparente levantada, calça impermeável
 * reforçada, botas de motociclista e sacola Kraft lacrada (#409).
 *
 * Características do Rig:
 * - Ombro esférico contínuo (zero frestas ou braços soltos do tronco)
 * - Braço articulado em 2 segmentos (Braço Superior + Cotovelo Articulado + Antebraço + Mão c/ Luva)
 * - Pernas articuladas em 2 segmentos (Coxa + Joelheira Reforçada + Canela + Bota com flexão)
 * - Motor de Locomoção Biomecânica (Walk Cycle natural: Contato, Amortecimento, Passagem e Impulso)
 * - Respiração orgânica em repouso (Zero tiques ou tremores artificiais)
 */
(function (global) {
  class LucasEntregador {
    constructor(options = {}) {
      this.id = 'LUCAS';
      this.name = 'Lucas (Entregador #409)';
      this.x = options.x || 0;
      this.y = options.y || 0;
      this.scale = options.scale || 1.0;
      this.flipX = options.flipX || false;

      this.emotion = options.emotion || 'desperate'; // 'neutral' | 'tired' | 'desperate' | 'terrified'
      this.pose = options.pose || 'hold_bag';        // 'hold_bag' | 'bang_gate' | 'look_back'
      this.viewMode = options.viewMode || 'auto';   // 'auto' | 'profile' | 'front'
      this.helmetVisorUp = options.helmetVisorUp !== false;

      // Motor de Locomoção (Walk Cycle) e Detecção Automática de Direção (dx)
      this.isWalking = options.isWalking || false;
      this.walkSpeed = options.walkSpeed !== undefined ? options.walkSpeed : 1.0;
      this.walkCycle = options.walkCycle || 0;
      this.walkDir = options.walkDir || 1;
      this._prevX = this.x;

      // Expressão e Ciclos Fisiológicos
      this.mouthOpen = 0;
      this.blinkTimer = 0.6;
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

    update(dt, mouthVal = 0) {
      this.time += dt;
      this.mouthOpen = mouthVal;

      // Respiração Ofegante (entregador em pânico correu até a guarita)
      const breathSpeed = this.emotion === 'terrified' || this.emotion === 'desperate' ? 3.2 : 1.9;
      const breathCycle = this.time * breathSpeed + Math.sin(this.time * 0.8) * 0.2;
      this.breathPhase = Math.sin(breathCycle) * 0.5 + 0.5;
      this.chestExpand = this.breathPhase * (this.emotion === 'terrified' ? 3.5 : 2.0);
      this.shoulderRise = this.breathPhase * (this.emotion === 'terrified' ? 1.8 : 0.9);

      // Tremor de Pânico nas Mãos e Braços (quando desesperado/terrorizado)
      if (this.emotion === 'terrified' || this.emotion === 'desperate') {
        this.panicTremor = Math.sin(this.time * 28) * 1.2 + Math.cos(this.time * 37) * 0.8;
        this.headShake = Math.sin(this.time * 12) * 0.025;
      } else {
        this.panicTremor = 0;
        this.headShake = 0;
      }

      // Balanço de Braços em Idle (segurando a sacola com nervosismo)
      if (!this.isWalking) {
        this.idleArmSway = Math.sin(this.time * 1.6) * 0.06;
        this.bagSway = Math.sin(this.time * 2.1) * 2.5;
      } else {
        this.idleArmSway = 0;
        this.bagSway = 0;
      }

      // Micro-expressão reativa baseada na emoção atual
      const emotionIntensity = {
        'neutral': 0, 'tired': 0.2, 'desperate': 0.7, 'terrified': 1.0
      };
      this.emotionWeight = emotionIntensity[this.emotion] || 0;
      this.browFurrow = this.emotionWeight * (0.9 + Math.sin(this.time * 5.0) * 0.1);
      this.eyeWiden = this.emotionWeight * 0.5;

      this.blinkTimer += dt;
      if (this.blinkTimer > 3.2) {
        this.isBlinking = true;
        if (this.blinkTimer > 3.34) {
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

      const useProfile = this.viewMode === 'profile' || (this.viewMode === 'auto' && this.isWalking);
      if (useProfile) {
        this._drawProfile(ctx);
      } else {
        this._drawFrontal(ctx);
      }

      ctx.restore();
    }

    /**
     * VISÃO LATERAL DE PERFIL 2.5D (Lucas — 19 anos, Entregador de Aplicativo)
     * Mochila térmica vermelha nas costas, capacete esportivo com viseira levantada,
     * jaqueta corta-vento com faixas refletivas, sacola kraft de entrega e passo atlético.
     */
    _drawProfile(ctx) {
      const phi = this.walkCycle;
      const isWalk = this.isWalking;

      const hipBob = isWalk ? Math.sin(phi * 2 - Math.PI / 2) * 3.0 : Math.sin(this.time * 1.0) * 0.6;
      const torsoTilt = isWalk ? 0.07 + Math.sin(phi * 2) * 0.015 : 0.04;

      // Cinemática Biomecânica C0 do Passo Rápido (kn > 0 dobra joelho para trás, th < 0 avança para frente)
      const calcLegProfile = (phase) => {
        if (!isWalk) return { th: -0.02, kn: 0.06, ft: -0.04 };
        let p = phase % (Math.PI * 2);
        if (p < 0) p += Math.PI * 2;

        let th = 0;
        let kn = 0;
        let ft = 0;

        if (p < Math.PI) {
          const u = p / Math.PI;
          th = -0.36 * Math.cos(u * Math.PI) - 0.01;
          if (u < 0.35) {
            kn = 0.06 + 0.14 * Math.sin((u / 0.35) * Math.PI);
          } else if (u < 0.75) {
            kn = 0.06;
          } else {
            const k = (u - 0.75) / 0.25;
            kn = 0.06 + 0.32 * Math.sin(k * Math.PI * 0.5);
          }
          let footGlobal = 0;
          if (u < 0.18) {
            footGlobal = -0.20 * (1.0 - u / 0.18);
          } else if (u > 0.72) {
            const k = (u - 0.72) / 0.28;
            footGlobal = 0.34 * Math.sin(k * Math.PI * 0.5);
          }
          ft = footGlobal - (th + kn);
        } else {
          const v = (p - Math.PI) / Math.PI;
          th = 0.36 * Math.cos(v * Math.PI) - 0.01;
          const swingArc = Math.sin(v * Math.PI);
          kn = 0.06 + 0.32 * (1.0 - v) + 0.84 * swingArc;
          const footGlobal = 0.34 * (1.0 - v) * Math.cos(v * Math.PI * 0.5) - 0.20 * Math.pow(v, 1.4);
          ft = footGlobal - (th + kn);
        }
        return { th, kn, ft };
      };

      const legBack = calcLegProfile(phi);
      const legFront = calcLegProfile(phi + Math.PI);

      // Sombra Dinâmica no Piso
      const shadowW = 44 + (isWalk ? Math.abs(Math.sin(phi)) * 5 : 0);
      const shadowGrad = ctx.createRadialGradient(0, 165, 4, 0, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.50)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 165, shadowW, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 0. MOCHILA TÉRMICA VERMELHA (BAG DE DELIVERY NAS COSTAS)
      ctx.save();
      ctx.translate(-10, -4 + hipBob);
      ctx.rotate(torsoTilt);

      // Caixa cúbica da Bag de Delivery
      const bagGrad = ctx.createLinearGradient(-32, -32, 0, 36);
      bagGrad.addColorStop(0, '#dc2626');
      bagGrad.addColorStop(0.6, '#b91c1c');
      bagGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = bagGrad;
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-30, -32, 28, 64, 5);
      ctx.fill();
      ctx.stroke();

      // Faixas refletivas prateadas horizontais
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-29, -14, 26, 4.5);
      ctx.fillRect(-29, 14, 26, 4.5);

      // Alça acolchoada preta passando pelo ombro
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-16, -26);
      ctx.quadraticCurveTo(8, -26, 12, -4);
      ctx.lineTo(8, 28);
      ctx.lineTo(-14, 28);
      ctx.stroke();

      ctx.restore();

      // 1. PERNA TRASEIRA (Far Leg)
      ctx.save();
      ctx.translate(-4, 62 + hipBob);
      this._drawProfileLeg(ctx, legBack.th, legBack.kn, legBack.ft, true);
      ctx.restore();

      // 2. CINTURA IMPERMEÁVEL (Conector compacto sem bloco estático nas coxas)
      ctx.save();
      ctx.translate(0, 56 + hipBob);
      ctx.rotate(torsoTilt * 0.6);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 8, 3);
      ctx.fill();

      ctx.restore();

      // 3. TRONCO DA JAQUETA DE MOTOBOY PRETA E VERMELHA COM REFLETIVOS
      ctx.save();
      ctx.translate(0, hipBob);
      ctx.rotate(torsoTilt);

      // Corpo da Jaqueta Impermeável
      const jacketGrad = ctx.createLinearGradient(-16, -22, 16, 58);
      jacketGrad.addColorStop(0, '#18181b');
      jacketGrad.addColorStop(0.35, '#dc2626');
      jacketGrad.addColorStop(0.85, '#09090b');
      ctx.fillStyle = jacketGrad;
      ctx.beginPath();
      ctx.moveTo(-15, -20);
      ctx.bezierCurveTo(-19, 0, -17, 35, -13, 58);
      ctx.lineTo(14, 58);
      ctx.bezierCurveTo(17, 35, 17, 0, 14, -18);
      ctx.closePath();
      ctx.fill();

      // Faixa refletiva 3M prateada no peito
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(3, -4);
      ctx.lineTo(15, -6);
      ctx.lineTo(14, -1);
      ctx.lineTo(3, 1);
      ctx.closePath();
      ctx.fill();

      // 4. CABEÇA COM CAPACETE ESPORTIVO E VISEIRA ABERTA
      ctx.save();
      ctx.translate(2, -26);
      ctx.rotate(0.08 + (isWalk ? Math.sin(phi) * 0.018 : 0));

      // Pescoço jovem
      ctx.fillStyle = '#b37f57';
      ctx.fillRect(-5, -2, 10, 14);

      // Queixo e rosto jovem por baixo do capacete
      const faceGrad = ctx.createLinearGradient(-8, -26, 14, 8);
      faceGrad.addColorStop(0, '#f5c49e');
      faceGrad.addColorStop(0.7, '#eab38c');
      faceGrad.addColorStop(1, '#d99b72');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(4, -18);
      ctx.lineTo(12, -18);
      ctx.quadraticCurveTo(12.5, -15, 13.5, -13);
      // Nariz jovem
      ctx.quadraticCurveTo(15.5, -11, 16.2, -9.5);
      ctx.quadraticCurveTo(16.5, -8.5, 15.0, -8.0);
      ctx.lineTo(13.5, -6.0);
      ctx.lineTo(14.0, -4.5);
      // Queixo firme
      ctx.bezierCurveTo(13.5, 1.0, 11.0, 4.0, 8.0, 4.5);
      ctx.lineTo(0, 4.5);
      ctx.lineTo(0, -10);
      ctx.closePath();
      ctx.fill();

      // Capacete Esportivo Preto/Vermelho em Perfil (#0f172a e frisos #ef4444)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.bezierCurveTo(-20, -22, -14, -38, 2, -38);
      ctx.bezierCurveTo(15, -38, 21, -30, 18, -16);
      ctx.lineTo(8, -14);
      ctx.lineTo(-4, -10);
      ctx.lineTo(-6, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Friso decorativo vermelho no capacete
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-14, -10);
      ctx.quadraticCurveTo(0, -32, 14, -22);
      ctx.stroke();

      // Cinta jugular sob o queixo
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.quadraticCurveTo(2, 4, 8, 4);
      ctx.stroke();

      // Viseira transparente levantada para cima
      if (this.helmetVisorUp) {
        ctx.save();
        ctx.translate(14, -22);
        ctx.rotate(-0.55);
        ctx.fillStyle = 'rgba(147, 197, 253, 0.35)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-2, -18, 5, 24, 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Olho expressivo focado
      if (!this.isBlinking) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(8.5, -13);
        ctx.lineTo(13.5, -11);
        ctx.lineTo(9.5, -8.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(11.2, -10.8, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10.8, -11.5, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Boca (visema quando fala)
      if (this.mouthOpen > 0.08) {
        ctx.fillStyle = '#3a0f0f';
        ctx.beginPath();
        ctx.arc(12.5, -4.5, 2.2 * this.mouthOpen, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // Fim Cabeça

      // 5. BRAÇOS & SACOLA KRAFT DE DELIVERY
      ctx.save();
      ctx.translate(2, -4 + hipBob);

      if (this.pose === 'hold_bag') {
        // Braço Traseiro balançando sutil
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(4, 16);
        ctx.lineTo(12, 14);
        ctx.lineTo(4, 6);
        ctx.closePath();
        ctx.fill();

        // Braço Dianteiro segurando a Sacola Kraft de Entrega
        const armGrad = ctx.createLinearGradient(0, -6, 20, 16);
        armGrad.addColorStop(0, '#dc2626');
        armGrad.addColorStop(0.5, '#18181b');
        armGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = armGrad;

        ctx.beginPath();
        ctx.moveTo(2, -6);
        ctx.lineTo(6, 14);
        ctx.lineTo(18, 14);
        ctx.lineTo(17, 8);
        ctx.lineTo(6, 6);
        ctx.lineTo(4, -6);
        ctx.closePath();
        ctx.fill();

        // Mão enluvada
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.ellipse(19, 14, 3.8, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sacola Kraft de Papel com dobradura e grampo (#d97706 / #b45309)
        ctx.save();
        ctx.translate(19, 15);
        const bagKraft = ctx.createLinearGradient(0, 0, 18, 28);
        bagKraft.addColorStop(0, '#d97706');
        bagKraft.addColorStop(1, '#92400e');
        ctx.fillStyle = bagKraft;
        ctx.beginPath();
        ctx.roundRect(-2, 0, 18, 26, 2);
        ctx.fill();

        // Recibo branco grampeado na sacola
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(2, 6, 8, 12);
        ctx.fillStyle = '#475569';
        ctx.fillRect(3, 8, 6, 1.2);
        ctx.fillRect(3, 11, 4, 1.2);
        ctx.restore();
      } else {
        // Balanço natural dos braços
        const armSwing = isWalk ? Math.sin(phi) * 0.40 : 0;
        ctx.save();
        ctx.rotate(armSwing);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(2, -6);
        ctx.lineTo(4, 18);
        ctx.lineTo(-2, 38);
        ctx.lineTo(2, 40);
        ctx.lineTo(8, 18);
        ctx.closePath();
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
     * Perna Articulada em Perfil com Calça Impermeável e Bota de Motoboy
     */
    _drawProfileLeg(ctx, thighAngle, kneeAngle, footAngle, isBack = false) {
      ctx.save();
      ctx.rotate(thighAngle);

      const pantsColor = isBack ? '#09090b' : '#0f172a';
      const thighLen = 42;
      const shinLen = 42;

      // Coxa
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(7, thighLen);
      ctx.lineTo(-7, thighLen);
      ctx.closePath();
      ctx.fill();

      // Joelho Reforçado de Motoboy
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      ctx.fillStyle = isBack ? '#020617' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-7, -4, 14, 8, 3);
      ctx.fill();

      // Canela
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.moveTo(-6.5, 0);
      ctx.lineTo(6.5, 0);
      ctx.lineTo(5.5, shinLen);
      ctx.lineTo(-5.5, shinLen);
      ctx.closePath();
      ctx.fill();

      // Tornozelo e Bota de Motoboy
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      // Bota reforçada preta
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(8, -4);
      ctx.lineTo(13, 0);
      ctx.quadraticCurveTo(16, 4, 14, 8);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();

      // Solado com ranhuras de tração
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-6, 6, 21, 3.5);

      ctx.restore();
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
        torsoTilt = 0.05;

        const leg = (p) => {
          const th = Math.sin(p) * 0.44;
          const isSwing = Math.cos(p) < 0;
          const kn = isSwing ? -Math.cos(p) * 1.10 : 0.02;
          const ft = isSwing ? 0.12 : -(th + kn);
          return [th, kn, ft];
        };
        [leftThigh, leftKnee, leftFoot] = leg(phi);
        [rightThigh, rightKnee, rightFoot] = leg(phi + Math.PI);

        leftArmSwing = -Math.sin(phi) * 0.38;
        rightArmSwing = Math.sin(phi) * 0.38;
      } else {
        // Repouso calmo (sem tiques de tremer)
        hipBob = Math.sin(this.time * 1.0) * 0.6;
        torsoTilt = 0;
        leftThigh = -0.01;
        rightThigh = 0.01;
        leftKnee = 0.02;
        rightKnee = 0.02;
      }

      // Sombra Dinâmica no Piso
      const shadowW = 48 + (this.isWalking ? Math.abs(Math.cos(this.walkCycle)) * 4 : 0);
      const shadowGrad = ctx.createRadialGradient(hipSway * 0.5, 165, 5, hipSway * 0.5, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(hipSway * 0.5, 165, shadowW, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 0.5 MOCHILA TÉRMICA VERMELHA NAS COSTAS (Ancorada com amortecimento natural)
      ctx.save();
      ctx.translate(hipSway * 0.4, -14 + hipBob);
      ctx.rotate(torsoTilt);

      const bagGrad = ctx.createLinearGradient(-38, -48, 38, 42);
      bagGrad.addColorStop(0, '#dc2626');
      bagGrad.addColorStop(0.6, '#b91c1c');
      bagGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = bagGrad;
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-36, -46, 72, 82, 8);
      ctx.fill();
      ctx.stroke();

      // Faixas refletivas prateadas
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-36, -24, 6, 42);
      ctx.fillRect(30, -24, 6, 42);
      ctx.fillRect(-26, -40, 52, 5);
      ctx.restore();

      // 1. PERNAS ARTICULADAS (Calça Jeans Escura com Joelheiras Reforçadas + Botas)
      this._drawArticulatedLeg(ctx, -14 + hipSway * 0.4, 60 + hipBob, leftThigh, leftKnee, leftFoot);
      this._drawArticulatedLeg(ctx, 14 + hipSway * 0.4, 60 + hipBob, rightThigh, rightKnee, rightFoot);

      // 2. QUADRIL IMPERMEÁVEL
      ctx.save();
      ctx.translate(hipSway * 0.5, 58 + hipBob);
      ctx.rotate(torsoTilt * 0.5);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(25, 0);
      ctx.quadraticCurveTo(27, 24, 18, 26);
      ctx.lineTo(0, 22);
      ctx.lineTo(-18, 26);
      ctx.quadraticCurveTo(-27, 24, -25, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 3. BRAÇO ESQUERDO (Trás — Batendo na Grade ou Livre)
      ctx.save();
      ctx.translate(-26 + hipSway * 0.5, -16 + hipBob);
      ctx.rotate(torsoTilt);

      let leftUpperAngle = 0.12 + leftArmSwing;
      let leftForeAngle = 0.22;

      if (this.pose === 'bang_gate') {
        leftUpperAngle = -0.75 + (this.isWalking ? 0 : Math.sin(this.time * 6) * 0.08);
        leftForeAngle = -0.85;
      }
      this._drawArticulatedArm(ctx, leftUpperAngle, leftForeAngle, false);
      ctx.restore();

      // 4. TRONCO DA JAQUETA DE MOTOBOY PRETA/VERMELHA COM FAIXAS REFLETIVAS
      ctx.save();
      ctx.translate(hipSway * 0.4, hipBob);
      ctx.rotate(torsoTilt);

      this._drawTorsoAndJacket(ctx);

      // 5. CABEÇA COM CAPACETE ESPORTIVO E VISEIRA ABERTA
      this._drawHeadWithHelmet(ctx);

      ctx.restore();

      // 6. BRAÇO DIREITO (Frente — Segurando Sacola Kraft do Pedido #409)
      ctx.save();
      ctx.translate(26 + hipSway * 0.5, -16 + hipBob);
      ctx.rotate(torsoTilt);

      let rightUpperAngle = -0.15 + rightArmSwing;
      let rightForeAngle = 0.25;

      if (this.pose === 'hold_bag') {
        rightUpperAngle = -0.45;
        rightForeAngle = -0.75;
      } else if (this.pose === 'bang_gate') {
        rightUpperAngle = -0.85;
        rightForeAngle = -0.65;
      }
      this._drawArticulatedArm(ctx, rightUpperAngle, rightForeAngle, true);
      ctx.restore();
    }

    _drawArticulatedLeg(ctx, hipX, hipY, thighAngle, kneeAngle, footAngle) {
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(thighAngle);

      const thighLen = 42;
      const shinLen = 42;

      // Coxa
      const thighGrad = ctx.createLinearGradient(-9, 0, 9, thighLen);
      thighGrad.addColorStop(0, '#1e293b');
      thighGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = thighGrad;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.lineTo(7.5, thighLen);
      ctx.lineTo(-7.5, thighLen);
      ctx.closePath();
      ctx.fill();

      // Joelheira Reforçada de Motociclista
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-8, -6, 16, 14, 4);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Canela
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-7.5, 0);
      ctx.lineTo(7.5, 0);
      ctx.lineTo(6, shinLen);
      ctx.lineTo(-6, shinLen);
      ctx.closePath();
      ctx.fill();

      // Faixa refletiva na canela
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-6.5, shinLen - 12, 13, 4);

      // Bota de motociclista
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.roundRect(-8, 0, 21, 10, 4);
      ctx.fill();

      ctx.restore();
    }

    _drawArticulatedArm(ctx, upperAngle, foreAngle, holdsPackage) {
      const upperLen = 33;
      const foreLen = 31;

      // Ombro esférico da jaqueta de motoboy
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(upperAngle);

      // Braço Superior
      const upperGrad = ctx.createLinearGradient(-8, 0, 8, upperLen);
      upperGrad.addColorStop(0, '#18181b');
      upperGrad.addColorStop(1, '#09090b');
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

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Antebraço
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.lineTo(5.5, foreLen);
      ctx.lineTo(-5.5, foreLen);
      ctx.closePath();
      ctx.fill();

      // Faixa refletiva no antebraço
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-6, foreLen - 8, 12, 4);

      // Luva de Motociclista Preta com Detalhes Vermelhos
      ctx.translate(0, foreLen);
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.roundRect(-5.5, 0, 11, 13, 4);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-4, 2, 8, 3);

      if (holdsPackage) {
        // Sacola Kraft do Pedido #409
        ctx.save();
        ctx.translate(0, 8);
        ctx.rotate(0.35);

        // Alça
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 6, Math.PI, 0);
        ctx.stroke();

        // Sacola Kraft
        const kraftGrad = ctx.createLinearGradient(-14, 0, 14, 28);
        kraftGrad.addColorStop(0, '#d97706');
        kraftGrad.addColorStop(0.6, '#b45309');
        kraftGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = kraftGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-12, 2);
        ctx.lineTo(12, 2);
        ctx.lineTo(15, 28);
        ctx.lineTo(-15, 28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lacre Vermelho
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-6, 2, 12, 7);

        // Comanda #409
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-9, 11, 12, 13);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-7, 14, 8, 1.5);
        ctx.fillRect(-7, 17, 6, 1.5);
        ctx.fillRect(-7, 20, 7, 1.5);

        ctx.restore();
      }

      ctx.restore();
    }

    _drawTorsoAndJacket(ctx) {
      const torsoGrad = ctx.createLinearGradient(-30, -26, 30, 62);
      torsoGrad.addColorStop(0, '#18181b');
      torsoGrad.addColorStop(0.5, '#09090b');
      torsoGrad.addColorStop(1, '#020617');
      ctx.fillStyle = torsoGrad;

      ctx.beginPath();
      ctx.moveTo(-26, -26);
      ctx.quadraticCurveTo(0, -30, 26, -26);
      ctx.bezierCurveTo(34, -8, 32, 34, 27, 60);
      ctx.lineTo(-27, 60);
      ctx.bezierCurveTo(-32, 34, -34, -8, -26, -26);
      ctx.closePath();
      ctx.fill();

      // Recortes vermelhos nos ombros
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-26, -26);
      ctx.lineTo(-10, -26);
      ctx.lineTo(-16, -6);
      ctx.lineTo(-30, -10);
      ctx.closePath();
      ctx.moveTo(26, -26);
      ctx.lineTo(10, -26);
      ctx.lineTo(16, -6);
      ctx.lineTo(30, -10);
      ctx.closePath();
      ctx.fill();

      // Faixas Refletivas Prata/Ciano
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-28, 6, 56, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-28, 8, 56, 2);

      // Alças acolchoadas da mochila
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-18, -25); ctx.quadraticCurveTo(-20, 12, -16, 42);
      ctx.moveTo(18, -25); ctx.quadraticCurveTo(20, 12, 16, 42);
      ctx.stroke();

      // Fecho peitoral
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18, 16); ctx.lineTo(18, 16);
      ctx.stroke();
    }

    _drawHeadWithHelmet(ctx) {
      // Balaclava no pescoço
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.roundRect(-9, -38, 18, 15, 4);
      ctx.fill();

      // Casco do Capacete
      const helmetGrad = ctx.createRadialGradient(-6, -72, 6, 0, -62, 34);
      helmetGrad.addColorStop(0, '#27272a');
      helmetGrad.addColorStop(0.7, '#18181b');
      helmetGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = helmetGrad;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, -62, 28, Math.PI * 0.82, Math.PI * 0.18, false);
      ctx.lineTo(22, -36);
      ctx.quadraticCurveTo(0, -31, -22, -36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Faixa vermelha aerodinâmica
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(0, -86, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Abertura da viseira (Rosto do Lucas)
      ctx.fillStyle = '#e0a37c';
      ctx.beginPath();
      ctx.roundRect(-18, -70, 36, 25, 8);
      ctx.fill();

      // Sombra interna da queixeira
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.fillRect(-18, -70, 36, 5);

      // Olhos
      const isTerrified = this.emotion === 'desperate' || this.emotion === 'terrified';
      const eyeH = isTerrified ? 5.5 : 4.2;

      if (!this.isBlinking) {
        [-8.5, 8.5].forEach(ex => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(ex, -58, 5.2, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#3f2305';
          ctx.beginPath();
          ctx.arc(ex, -58, isTerrified ? 2.0 : 2.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.arc(ex, -58, 1.1, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex - 1, -59.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        ctx.strokeStyle = '#3f2305';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-13, -58); ctx.lineTo(-4, -58);
        ctx.moveTo(4, -58); ctx.lineTo(13, -58);
        ctx.stroke();
      }

      // Sobrancelhas
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, -63); ctx.quadraticCurveTo(-8, -68, -3, -65);
      ctx.moveTo(3, -65); ctx.quadraticCurveTo(8, -68, 14, -63);
      ctx.stroke();

      // Gotícula de suor
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(14, -54, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Boca
      if (this.mouthOpen > 0.08) {
        const mh = 2.0 + this.mouthOpen * 6.5;
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.ellipse(0, -47, 5.5, mh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-4, -47 - mh * 0.7, 8, 2);
      } else {
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -47);
        ctx.quadraticCurveTo(0, -49, 5, -47);
        ctx.stroke();
      }

      // Viseira Transparente Levantada
      ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-22, -84, 44, 16, 6);
      ctx.fill();
      ctx.stroke();
    }
  }

  global.StudioCharacters = global.StudioCharacters || {};
  global.StudioCharacters.LucasEntregador = LucasEntregador;
})(typeof window !== 'undefined' ? window : globalThis);
