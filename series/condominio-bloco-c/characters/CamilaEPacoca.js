/**
 * Personagem Modular 03: CAMILA (Vizinha do 204 — 25 anos) & PAÇOCA (Vira-Lata Caramelo)
 * Arquivo Individual Reutilizável — Rig Vetorial 2D Articulado com Cinemática Direta
 * Traje Camila: Jaqueta corta-vento mostarda com faixa esportiva, calça legging, tênis esportivo,
 * cabelo cacheado volumoso preso no topo, argolas douradas e guia retrátil.
 * Paçoca: Vira-lata caramelo brasileiro com locomoção quadrúpede de 4 patas articuladas,
 * orelhas atentas, dorso e cauda reativos.
 *
 * Características do Rig:
 * - Ombro esférico contínuo (zero frestas ou braços soltos do tronco)
 * - Braço articulado em 2 segmentos (Braço Superior + Cotovelo Articulado + Antebraço + Mão Anatômica)
 * - Pernas articuladas em 2 segmentos (Coxa + Joelho Flexível + Canela + Tênis Esportivo)
 * - Motor de Locomoção Biomecânica Humana + Marcha Quadrúpede Canina do Paçoca
 * - Respiração orgânica em repouso (Zero tiques ou tremores artificiais)
 */
(function (global) {
  class CamilaEPacoca {
    constructor(options = {}) {
      this.id = 'CAMILA';
      this.name = 'Camila (Apto 204) & Paçoca';
      this.x = options.x || 0;
      this.y = options.y || 0;
      this.scale = options.scale || 1.0;
      this.flipX = options.flipX || false;

      this.emotion = options.emotion || 'alert';   // 'neutral' | 'alert' | 'scared' | 'whisper'
      this.pose = options.pose || 'hold_leash';    // 'idle' | 'hold_leash' | 'point_elevator'
      this.viewMode = options.viewMode || 'auto';   // 'auto' | 'profile' | 'front'
      this.dogState = options.dogState || 'growl'; // 'calm' | 'alert' | 'growl'
      this.showDog = options.showDog !== false;

      // Motor de Locomoção (Walk Cycle) e Detecção Automática de Direção (dx)
      this.isWalking = options.isWalking || false;
      this.walkSpeed = options.walkSpeed !== undefined ? options.walkSpeed : 1.0;
      this.walkCycle = options.walkCycle || 0;
      this.walkDir = options.walkDir || 1;
      this._prevX = this.x;

      // Expressão e Ciclos Fisiológicos
      this.mouthOpen = 0;
      this.blinkTimer = 0.5;
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

      this.blinkTimer += dt;
      if (this.blinkTimer > 3.6) {
        this.isBlinking = true;
        if (this.blinkTimer > 3.74) {
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
     * VISÃO LATERAL DE PERFIL 2.5D (Camila & Paçoca)
     * Camila em perfil com coque cacheado alto, argolas douradas,
     * jaqueta mostarda, tênis esportivo e Paçoca trotando em 4 patas.
     */
    _drawProfile(ctx) {
      const phi = this.walkCycle;
      const isWalk = this.isWalking;

      const hipBob = isWalk ? Math.sin(phi * 2 - Math.PI / 2) * 2.8 : Math.sin(this.time * 1.0) * 0.5;
      const torsoTilt = isWalk ? 0.05 + Math.sin(phi * 2) * 0.015 : 0.03;

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
          th = -0.34 * Math.cos(u * Math.PI) - 0.01;
          if (u < 0.35) {
            kn = 0.05 + 0.14 * Math.sin((u / 0.35) * Math.PI);
          } else if (u < 0.75) {
            kn = 0.05;
          } else {
            const k = (u - 0.75) / 0.25;
            kn = 0.05 + 0.30 * Math.sin(k * Math.PI * 0.5);
          }
          let footGlobal = 0;
          if (u < 0.18) {
            footGlobal = -0.18 * (1.0 - u / 0.18);
          } else if (u > 0.72) {
            const k = (u - 0.72) / 0.28;
            footGlobal = 0.32 * Math.sin(k * Math.PI * 0.5);
          }
          ft = footGlobal - (th + kn);
        } else {
          const v = (p - Math.PI) / Math.PI;
          th = 0.34 * Math.cos(v * Math.PI) - 0.01;
          const swingArc = Math.sin(v * Math.PI);
          kn = 0.05 + 0.30 * (1.0 - v) + 0.80 * swingArc;
          const footGlobal = 0.32 * (1.0 - v) * Math.cos(v * Math.PI * 0.5) - 0.18 * Math.pow(v, 1.4);
          ft = footGlobal - (th + kn);
        }
        return { th, kn, ft };
      };

      const legBack = calcLegProfile(phi);
      const legFront = calcLegProfile(phi + Math.PI);

      // Sombra Dinâmica no Piso da Camila
      const shadowW = 40 + (isWalk ? Math.abs(Math.sin(phi)) * 5 : 0);
      const shadowGrad = ctx.createRadialGradient(0, 165, 4, 0, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 165, shadowW, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. PERNA TRASEIRA (Far Leg)
      ctx.save();
      ctx.translate(-4, 60 + hipBob);
      this._drawProfileLeg(ctx, legBack.th, legBack.kn, legBack.ft, true);
      ctx.restore();

      // 2. CINTURA LEGGING GRAFITE (Conector compacto sem bloco estático nas coxas)
      ctx.save();
      ctx.translate(0, 54 + hipBob);
      ctx.rotate(torsoTilt * 0.6);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 8, 3);
      ctx.fill();
      ctx.restore();

      // 3. TRONCO DA JAQUETA CORTA-VENTO MOSTARDA
      ctx.save();
      ctx.translate(0, hipBob);
      ctx.rotate(torsoTilt);

      // Top branco esportivo sob a jaqueta
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-10, 48, 20, 6);

      // Jaqueta Corta-Vento Mostarda (#f59e0b / #d97706)
      const jacketGrad = ctx.createLinearGradient(-15, -20, 15, 52);
      jacketGrad.addColorStop(0, '#f59e0b');
      jacketGrad.addColorStop(0.6, '#d97706');
      jacketGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = jacketGrad;

      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.bezierCurveTo(-18, 0, -16, 32, -12, 50);
      ctx.lineTo(13, 50);
      ctx.bezierCurveTo(16, 32, 16, 0, 13, -18);
      ctx.closePath();
      ctx.fill();

      // Gola esportiva da jaqueta
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(-10, -18);
      ctx.lineTo(12, -18);
      ctx.lineTo(9, -8);
      ctx.lineTo(-6, -8);
      ctx.closePath();
      ctx.fill();

      // 4. CABEÇA EM PERFIL (Camila — Coque Alto Cacheado, Argolas e Perfil)
      ctx.save();
      ctx.translate(2, -26);
      ctx.rotate(0.08 + (isWalk ? Math.sin(phi) * 0.015 : 0));

      // Pescoço gracioso
      ctx.fillStyle = '#946340';
      ctx.fillRect(-4, -2, 8, 14);

      // Perfil Facial Jovem e Elegante (Tom de pele moreno quente)
      const faceGrad = ctx.createLinearGradient(-8, -26, 14, 8);
      faceGrad.addColorStop(0, '#b37f57');
      faceGrad.addColorStop(0.7, '#946340');
      faceGrad.addColorStop(1, '#784c28');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.bezierCurveTo(-11, -22, -4, -30, 0, -30);
      ctx.bezierCurveTo(6, -30, 9, -24, 10.5, -17);
      // Ponte nasal delicada
      ctx.quadraticCurveTo(10.8, -14, 11.8, -12);
      // Nariz arrebitado elegante
      ctx.quadraticCurveTo(14.0, -10.5, 14.8, -9.0);
      ctx.quadraticCurveTo(15.0, -8.0, 13.5, -7.5);
      // Lábios expressivos com volume
      ctx.quadraticCurveTo(12.5, -6.5, 13.2, -5.0);
      ctx.quadraticCurveTo(13.8, -4.0, 13.0, -2.8);
      // Queixo jovem arredondado
      ctx.bezierCurveTo(12.5, 1.0, 10.0, 4.0, 7.0, 4.5);
      ctx.bezierCurveTo(0, 5.0, -6, 2.0, -8, -1);
      ctx.lineTo(-10, -8);
      ctx.closePath();
      ctx.fill();

      // Coque Cacheado Alto Volumoso no Topo (#271810 / #180e07)
      const bunBounce = isWalk ? Math.sin(phi * 2) * 1.5 : 0;
      ctx.save();
      ctx.translate(0, bunBounce);
      ctx.fillStyle = '#271810';

      // Base do cabelo na nuca e laterais
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.bezierCurveTo(-15, -14, -10, -32, 2, -32);
      ctx.bezierCurveTo(8, -32, 12, -26, 11, -16);
      ctx.lineTo(2, -18);
      ctx.bezierCurveTo(-5, -18, -8, -10, -10, 0);
      ctx.closePath();
      ctx.fill();

      // Grande coque volumoso afro/cacheado no topo
      ctx.fillStyle = '#180e07';
      ctx.beginPath();
      ctx.ellipse(-1, -38, 14, 13, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Mechas e texturas em relevo no coque
      ctx.strokeStyle = '#3d2516';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-4, -40, 6, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(3, -37, 7, 0.4, Math.PI * 1.8);
      ctx.stroke();

      // Elástico/Scrunchie mostarda prendendo o coque
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-7, -33, 14, 4);
      ctx.restore();

      // Orelha e Argola Dourada em Perfil
      ctx.fillStyle = '#946340';
      ctx.beginPath();
      ctx.ellipse(-2, -5, 4.0, 5.5, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Brinco de Argola Dourada balançando
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(-1, 0, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Olho expressivo atento
      if (!this.isBlinking) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(6.5, -12);
        ctx.quadraticCurveTo(11.0, -12, 12.0, -9.0);
        ctx.lineTo(8.0, -7.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(9.8, -9.5, 1.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(9.4, -10.2, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Delineador elegante
        ctx.strokeStyle = '#180e07';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(6.5, -12);
        ctx.quadraticCurveTo(10.5, -12.5, 12.5, -9.5);
        ctx.stroke();
      }

      // Sobrancelha bem delineada
      ctx.strokeStyle = '#180e07';
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(5.5, -15);
      ctx.quadraticCurveTo(9.0, -16.5, 12.5, -14.0);
      ctx.stroke();

      // Lábios com gloss avermelhado
      ctx.fillStyle = '#9f3a38';
      ctx.beginPath();
      ctx.ellipse(12.5, -3.8, 2.5, 1.6, 0.1, 0, Math.PI * 2);
      ctx.fill();

      if (this.mouthOpen > 0.08) {
        ctx.fillStyle = '#3a0f0f';
        ctx.beginPath();
        ctx.arc(12.5, -3.8, 2.0 * this.mouthOpen, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // Fim Cabeça

      // 5. BRAÇOS & GUIA RETRÁTIL VERMELHA
      ctx.save();
      ctx.translate(2, -4 + hipBob);

      // Braço Traseiro balançando livre
      const armSwing = isWalk ? Math.sin(phi) * 0.35 : 0;
      ctx.save();
      ctx.rotate(-armSwing);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(-4, 16);
      ctx.lineTo(2, 36);
      ctx.lineTo(6, 34);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Braço Dianteiro segurando a Manopla da Guia Retrátil
      const armGrad = ctx.createLinearGradient(0, -6, 18, 14);
      armGrad.addColorStop(0, '#f59e0b');
      armGrad.addColorStop(0.7, '#d97706');
      armGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = armGrad;

      ctx.beginPath();
      ctx.moveTo(2, -6);
      ctx.lineTo(6, 14);
      ctx.lineTo(16, 12);
      ctx.lineTo(15, 6);
      ctx.lineTo(6, 6);
      ctx.lineTo(4, -6);
      ctx.closePath();
      ctx.fill();

      // Mão segurando a guia
      ctx.fillStyle = '#946340';
      ctx.beginPath();
      ctx.ellipse(17, 12, 3.5, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Manopla da Guia Retrátil Vermelha (#ef4444)
      ctx.save();
      ctx.translate(18, 12);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-2, -3, 9, 12, 2.5);
      ctx.fill();
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 5, 6);
      ctx.restore();

      ctx.restore(); // Fim Braços
      ctx.restore(); // Fim Tronco

      // 6. PERNA DIANTEIRA (Near Leg)
      ctx.save();
      ctx.translate(4, 60 + hipBob);
      this._drawProfileLeg(ctx, legFront.th, legFront.kn, legFront.ft, false);
      ctx.restore();

      // 7. PAÇOCA TROTANDO EM 4 PATAS AO LADO DE CAMILA
      if (this.showDog) {
        this._drawPacocaAndLeash(ctx, hipBob);
      }
    }

    /**
     * Perna Articulada em Perfil com Legging Grafite e Tênis Esportivo Branco
     */
    _drawProfileLeg(ctx, thighAngle, kneeAngle, footAngle, isBack = false) {
      ctx.save();
      ctx.rotate(thighAngle);

      const pantsColor = isBack ? '#0f172a' : '#1e293b';
      const thighLen = 42;
      const shinLen = 42;

      // Coxa com legging
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.moveTo(-7.5, 0);
      ctx.lineTo(7.5, 0);
      ctx.lineTo(6.5, thighLen);
      ctx.lineTo(-6.5, thighLen);
      ctx.closePath();
      ctx.fill();

      // Faixa lateral mostarda
      ctx.fillStyle = '#eab308';
      ctx.fillRect(4.5, 4, 1.8, thighLen - 8);

      // Joelho Articulado
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      // Canela com legging
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(5, shinLen);
      ctx.lineTo(-5, shinLen);
      ctx.closePath();
      ctx.fill();

      // Tornozelo e Tênis Esportivo Branco com Amortecedor
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      // Corpo do tênis esportivo branco
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(11, 0);
      ctx.quadraticCurveTo(15, 3, 14, 8);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();

      // Detalhe coral/laranja esportivo
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.lineTo(8, 2);
      ctx.lineTo(5, 5);
      ctx.closePath();
      ctx.fill();

      // Solado amortecido espesso
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-6, 6, 20, 3.2);

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

        leftArmSwing = -Math.sin(phi) * 0.38;
        rightArmSwing = Math.sin(phi) * 0.38;
      } else {
        // Repouso calmo (sem tiques)
        hipBob = Math.sin(this.time * 1.0) * 0.6;
        torsoTilt = 0;
        leftThigh = -0.01;
        rightThigh = 0.01;
        leftKnee = 0.02;
        rightKnee = 0.02;
      }

      // Sombra Dinâmica da Camila
      const shadowW = 44 + (this.isWalking ? Math.abs(Math.cos(this.walkCycle)) * 4 : 0);
      const shadowGrad = ctx.createRadialGradient(hipSway * 0.5, 165, 5, hipSway * 0.5, 165, shadowW);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(hipSway * 0.5, 165, shadowW, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. PERNAS ARTICULADAS (Legging Grafite com Faixa Mostarda + Tênis Coral)
      this._drawArticulatedLeg(ctx, -12 + hipSway * 0.4, 58 + hipBob, leftThigh, leftKnee, leftFoot);
      this._drawArticulatedLeg(ctx, 12 + hipSway * 0.4, 58 + hipBob, rightThigh, rightKnee, rightFoot);

      // 2. QUADRIL DA LEGGING
      ctx.save();
      ctx.translate(hipSway * 0.5, 56 + hipBob);
      ctx.rotate(torsoTilt * 0.5);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-23, 0);
      ctx.lineTo(23, 0);
      ctx.quadraticCurveTo(25, 24, 18, 26);
      ctx.lineTo(0, 22);
      ctx.lineTo(-18, 26);
      ctx.quadraticCurveTo(-25, 24, -23, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 3. BRAÇO ESQUERDO (Trás — Segurando a Guia do Paçoca)
      ctx.save();
      ctx.translate(-24 + hipSway * 0.5, -16 + hipBob);
      ctx.rotate(torsoTilt);

      let leftUpperAngle = 0.22 + (this.isWalking ? leftArmSwing * 0.6 : 0);
      let leftForeAngle = 0.35;
      this._drawArticulatedArm(ctx, leftUpperAngle, leftForeAngle, true);
      ctx.restore();

      // 4. TRONCO (Corta-Vento Amarela-Mostarda com Faixa Esportiva)
      ctx.save();
      ctx.translate(hipSway * 0.4, hipBob);
      ctx.rotate(torsoTilt);

      this._drawTorsoAndJacket(ctx);

      // 5. CABEÇA (Cachos no topo, argolas douradas e expressão)
      this._drawHead(ctx);

      ctx.restore();

      // 6. BRAÇO DIREITO (Frente — Apontando pro Elevador ou Livre)
      ctx.save();
      ctx.translate(24 + hipSway * 0.5, -16 + hipBob);
      ctx.rotate(torsoTilt);

      let rightUpperAngle = -0.15 + rightArmSwing;
      let rightForeAngle = 0.25;

      if (this.pose === 'point_elevator') {
        rightUpperAngle = -0.75;
        rightForeAngle = -0.95;
      } else if (this.emotion === 'scared') {
        rightUpperAngle = -0.45;
        rightForeAngle = -0.65;
      }
      this._drawArticulatedArm(ctx, rightUpperAngle, rightForeAngle, false);
      ctx.restore();

      // 7. GUIA RETRÁTIL + CACHORRO PAÇOCA (Com Locomoção Quadrúpede)
      if (this.showDog) {
        this._drawPacocaAndLeash(ctx, hipBob);
      }
    }

    _drawArticulatedLeg(ctx, hipX, hipY, thighAngle, kneeAngle, footAngle) {
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(thighAngle);

      const thighLen = 42;
      const shinLen = 42;

      // Coxa
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(6.5, thighLen);
      ctx.lineTo(-6.5, thighLen);
      ctx.closePath();
      ctx.fill();

      // Faixa lateral mostarda na legging
      ctx.fillStyle = '#eab308';
      ctx.fillRect(4.5, 4, 2, thighLen - 4);

      // Joelho
      ctx.translate(0, thighLen);
      ctx.rotate(kneeAngle);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Canela
      ctx.beginPath();
      ctx.moveTo(-6.5, 0);
      ctx.lineTo(6.5, 0);
      ctx.lineTo(5, shinLen);
      ctx.lineTo(-5, shinLen);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#eab308';
      ctx.fillRect(3.5, 0, 2, shinLen - 8);

      // Tornozelo
      ctx.fillStyle = '#a1623b';
      ctx.fillRect(-4, shinLen - 6, 8, 6);

      // Tênis esportivo moderno branco e coral
      ctx.translate(0, shinLen);
      ctx.rotate(footAngle);

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-8, 0, 20, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-4, 3, 12, 3);

      ctx.restore();
    }

    _drawArticulatedArm(ctx, upperAngle, foreAngle, holdsLeash) {
      const upperLen = 33;
      const foreLen = 31;

      // Ombro esférico da jaqueta mostarda
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(upperAngle);

      // Braço Superior da Jaqueta
      const upperGrad = ctx.createLinearGradient(-7.5, 0, 7.5, upperLen);
      upperGrad.addColorStop(0, '#eab308');
      upperGrad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = upperGrad;
      ctx.beginPath();
      ctx.moveTo(-7.5, 0);
      ctx.lineTo(7.5, 0);
      ctx.lineTo(6.5, upperLen);
      ctx.lineTo(-6.5, upperLen);
      ctx.closePath();
      ctx.fill();

      // Cotovelo
      ctx.translate(0, upperLen);
      ctx.rotate(foreAngle);

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Antebraço da Jaqueta
      const foreGrad = ctx.createLinearGradient(-6.5, 0, 6.5, foreLen);
      foreGrad.addColorStop(0, '#ca8a04');
      foreGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = foreGrad;
      ctx.beginPath();
      ctx.moveTo(-6.5, 0);
      ctx.lineTo(6.5, 0);
      ctx.lineTo(5, foreLen);
      ctx.lineTo(-5, foreLen);
      ctx.closePath();
      ctx.fill();

      // Elástico preto no punho
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5.5, foreLen - 5, 11, 5);

      // Mão Morena
      ctx.translate(0, foreLen);
      ctx.fillStyle = '#b46d45';
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 12, 4);
      ctx.fill();

      if (holdsLeash) {
        // Alça da guia retrátil vermelha
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(-4, 4, 12, 10, 3);
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.restore();
    }

    _drawTorsoAndJacket(ctx) {
      const jacketGrad = ctx.createLinearGradient(-28, -28, 28, 62);
      jacketGrad.addColorStop(0, '#eab308');
      jacketGrad.addColorStop(0.55, '#ca8a04');
      jacketGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = jacketGrad;

      ctx.beginPath();
      ctx.moveTo(-22, -26);
      ctx.quadraticCurveTo(0, -30, 22, -26);
      ctx.bezierCurveTo(30, -8, 27, 34, 24, 60);
      ctx.quadraticCurveTo(0, 65, -24, 60);
      ctx.bezierCurveTo(-27, 34, -30, -8, -22, -26);
      ctx.closePath();
      ctx.fill();

      // Ombreiras arredondadas
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(-23, -20, 5.5, 6.5, 0.2, 0, Math.PI * 2);
      ctx.ellipse(23, -20, 5.5, 6.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Faixa esportiva refletiva no peito
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-26, 2);
      ctx.lineTo(0, 10);
      ctx.lineTo(26, 2);
      ctx.lineTo(26, 10);
      ctx.lineTo(0, 18);
      ctx.lineTo(-26, 10);
      ctx.closePath();
      ctx.fill();

      // Zíper frontal escuro e Gola Alta
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(0, 62);
      ctx.stroke();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.roundRect(-12, -33, 24, 10, 3);
      ctx.fill();
    }

    _drawHead(ctx) {
      // Cabelo cacheado parte de trás
      ctx.fillStyle = '#181118';
      ctx.beginPath();
      ctx.arc(0, -76, 28, 0, Math.PI * 2);
      ctx.fill();

      // Afro Puff / Cachos no topo
      const curls = [
        [-14, -96, 10], [-4, -101, 12], [7, -99, 11], [15, -94, 9],
        [-19, -86, 9], [19, -85, 9], [0, -92, 11]
      ];
      ctx.fillStyle = '#1c141d';
      curls.forEach(([cx, cy, cr]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Elástico amarelo
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -86, 15, 4, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Pescoço
      ctx.fillStyle = '#9e5b36';
      ctx.beginPath();
      ctx.roundRect(-6.5, -39, 13, 12, 4);
      ctx.fill();

      // Orelhas + Brincos de Argola
      ctx.fillStyle = '#b46d45';
      ctx.beginPath();
      ctx.ellipse(-20, -56, 4, 6.5, 0, 0, Math.PI * 2);
      ctx.ellipse(20, -56, 4, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(-21, -49, 4.5, 0, Math.PI * 2);
      ctx.arc(21, -49, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Rosto feminino esculpido
      const faceGrad = ctx.createLinearGradient(-19, -82, 19, -35);
      faceGrad.addColorStop(0, '#c87d52');
      faceGrad.addColorStop(0.65, '#b46d45');
      faceGrad.addColorStop(1, '#965430');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(-19, -64);
      ctx.quadraticCurveTo(-20, -83, 0, -84);
      ctx.quadraticCurveTo(20, -83, 19, -64);
      ctx.bezierCurveTo(19, -46, 10, -35, 0, -34);
      ctx.bezierCurveTo(-10, -35, -19, -46, -19, -64);
      ctx.closePath();
      ctx.fill();

      // Olhos com cílios
      const isScared = this.emotion === 'scared' || this.emotion === 'alert';
      const eyeH = isScared ? 5.2 : 4.2;

      if (!this.isBlinking) {
        [-8, 8].forEach(ex => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(ex, -58, 5, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#5c2d0c';
          ctx.beginPath();
          ctx.arc(ex, -58, 2.7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.arc(ex, -58, 1.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex - 0.9, -59.3, 1.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ex, -58, 5.2, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        });
      } else {
        ctx.strokeStyle = '#181118';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-13, -58); ctx.lineTo(-3, -58);
        ctx.moveTo(3, -58); ctx.lineTo(13, -58);
        ctx.stroke();
      }

      // Nariz
      ctx.strokeStyle = '#854625';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -57);
      ctx.lineTo(2, -50);
      ctx.lineTo(-1, -49);
      ctx.stroke();

      // Sobrancelhas
      ctx.strokeStyle = '#181118';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (isScared) {
        ctx.moveTo(-14, -64); ctx.quadraticCurveTo(-8, -70, -3, -66);
        ctx.moveTo(3, -66); ctx.quadraticCurveTo(8, -70, 14, -64);
      } else {
        ctx.moveTo(-14, -65); ctx.quadraticCurveTo(-8, -68, -3, -65);
        ctx.moveTo(3, -65); ctx.quadraticCurveTo(8, -68, 14, -65);
      }
      ctx.stroke();

      // Lábios + Lip-Sync
      if (this.mouthOpen > 0.08) {
        const mh = 1.8 + this.mouthOpen * 6;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(0, -42, 4.8, mh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3.2, -42 - mh * 0.65, 6.4, 2);
      } else {
        ctx.fillStyle = '#9f3a38';
        ctx.beginPath();
        ctx.ellipse(0, -42, 5, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /**
     * Paçoca (Vira-lata Caramelo) com Locomoção Quadrúpede e Guia Dinâmica
     */
    _drawPacocaAndLeash(ctx, camilaBob) {
      const dogX = -74;
      const dogY = 126;
      const isGrowling = this.dogState === 'growl';

      // Dinâmica de marcha do cachorro (Trote diagonal de 4 patas)
      let dogBob = 0;
      let flAngle = 0, frAngle = 0, blAngle = 0, brAngle = 0;
      let dogSpineTilt = 0;

      if (this.isWalking) {
        const dogPhi = this.walkCycle * 1.2; // Cachorro dá passos mais rápidos que o humano
        dogBob = Math.sin(dogPhi * 2) * 2.2;
        dogSpineTilt = Math.sin(dogPhi) * 0.04;

        // Par diagonal 1: Pata Dianteira Esquerda + Traseira Direita
        flAngle = Math.sin(dogPhi) * 0.45;
        brAngle = Math.sin(dogPhi) * 0.45;

        // Par diagonal 2: Pata Dianteira Direita + Traseira Esquerda (Defasado)
        frAngle = Math.sin(dogPhi + Math.PI) * 0.45;
        blAngle = Math.sin(dogPhi + Math.PI) * 0.45;
      } else {
        dogBob = Math.sin(this.time * 1.0) * 0.4;
      }

      // Guia Vermelha conectando Camila ao Paçoca (Ancorada na mão certa conforme o ângulo)
      const isProfile = this.viewMode === 'profile' || (this.viewMode === 'auto' && this.isWalking);
      const handX = isProfile ? 20 : -24;
      const handY = isProfile ? 8 + camilaBob : 22 + camilaBob;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      if (isGrowling) {
        ctx.lineTo(dogX + 18, dogY - 14 + dogBob);
      } else {
        ctx.quadraticCurveTo((handX + dogX) * 0.5, 75 + dogBob * 0.5, dogX + 18, dogY - 14 + dogBob);
      }
      ctx.stroke();

      ctx.save();
      ctx.translate(dogX, dogY + dogBob);
      ctx.rotate(dogSpineTilt);

      // Sombra do Paçoca
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.beginPath();
      ctx.ellipse(0, 36, 32, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rabo Caramelo Articulado
      ctx.save();
      ctx.translate(-24, -4);
      const tailAngle = isGrowling ? -0.55 : -0.25 + (this.isWalking ? Math.sin(this.walkCycle * 2) * 0.2 : 0);
      ctx.rotate(tailAngle);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-12, -10, -16, -22);
      ctx.stroke();
      ctx.restore();

      // 4 PATAS ARTICULADAS (Pares Traseiros e Dianteiros)
      // Patas do fundo (Esquerdas)
      this._drawDogLeg(ctx, -18, 6, blAngle, '#b45309');
      this._drawDogLeg(ctx, 16, 6, flAngle, '#b45309');

      // Corpo Caramelo Dourado
      const bodyGrad = ctx.createLinearGradient(-26, -14, 26, 16);
      bodyGrad.addColorStop(0, '#f59e0b');
      bodyGrad.addColorStop(0.6, '#d97706');
      bodyGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = bodyGrad;

      ctx.beginPath();
      ctx.moveTo(-22, -6);
      ctx.quadraticCurveTo(0, isGrowling ? -15 : -10, 22, -10);
      ctx.quadraticCurveTo(28, 2, 22, 14);
      ctx.quadraticCurveTo(0, 16, -20, 12);
      ctx.closePath();
      ctx.fill();

      // Patas da frente (Direitas)
      this._drawDogLeg(ctx, -12, 8, brAngle, '#d97706');
      this._drawDogLeg(ctx, 22, 8, frAngle, '#d97706');

      // Coleira Vermelha com Medalhinha Dourada
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(15, -12);
      ctx.lineTo(24, 4);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(23, 6, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Cabeça do Paçoca
      ctx.save();
      ctx.translate(24, isGrowling ? -12 : -18);
      ctx.rotate(isGrowling ? 0.16 : 0);

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Focinho Caramelo com máscara preta na ponta
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(6, -5);
      ctx.lineTo(22, -2);
      ctx.lineTo(20, 7);
      ctx.lineTo(4, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(21, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Dentes à mostra se estiver rosnando
      if (isGrowling) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(10, 5); ctx.lineTo(12, 9); ctx.lineTo(14, 5);
        ctx.moveTo(15, 5); ctx.lineTo(17, 9); ctx.lineTo(19, 5);
        ctx.fill();
      }

      // Olho
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4.5, -3.8, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Orelha
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(-12, isGrowling ? -16 : -2);
      ctx.lineTo(-2, -2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      ctx.restore();
    }

    _drawDogLeg(ctx, x, y, angle, color) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-3, 0, 6, 26, 3);
      ctx.fill();

      // Pata
      ctx.beginPath();
      ctx.roundRect(-3, 22, 8, 5, 2);
      ctx.fill();

      ctx.restore();
    }
  }

  global.StudioCharacters = global.StudioCharacters || {};
  global.StudioCharacters.CamilaEPacoca = CamilaEPacoca;
})(typeof window !== 'undefined' ? window : globalThis);
