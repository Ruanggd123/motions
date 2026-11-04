/**
 * Motor de Câmera 2.5D (CameraRig2D) — Condomínio Solaris: Bloco C
 * Mira num ponto do mundo (focusX/focusY), funciona em 9:16 (TikTok) ou 16:9,
 * mola criticamente amortecida (sem tremer / sem overshoot) e trava nos limites do cenário.
 */
(function (global) {
  class CameraRig2D {
    constructor(width = 1080, height = 1920, world = { minX: -150, maxX: 2070, minY: -100, maxY: 1130 }) {
      this.width = width;
      this.height = height;
      this.world = world;
      this.defaultWorld = world;

      this.fx = 960;
      this.fy = 540;
      this.zoom = 2.0;
      this.tfx = this.fx;
      this.tfy = this.fy;
      this.tzoom = this.zoom;
      this.vx = 0;
      this.vy = 0;
      this.vz = 0;

      // Mola criticamente amortecida: c = 2·sqrt(k) → chega no alvo suave, sem balançar
      this.stiffness = 18;
      this.damping = 2 * Math.sqrt(this.stiffness);

      // Sistema de Trauma & Screen Shake Cinematográfico (para impactos e sustos)
      this.trauma = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }

    /** Dispara um tremor de tela baseado em trauma com decaimento exponencial. */
    shake(intensity = 0.5) {
      this.trauma = Math.min(1.0, this.trauma + intensity);
    }

    /**
     * Define um novo espaço de mundo (ex.: trocar da portaria para o interior da guarita).
     * Sem argumento, volta ao mundo padrão. Use antes de chamar cut() em cada troca de plano.
     */
    setWorld(world) {
      this.world = world || this.defaultWorld;
      this._clamp();
    }

    /**
     * Enquadramento que preenche a tela sem deixar faixa morta em NENHUM plano.
     * Calcula o zoom mínimo a partir da caixa visível desejada, então trava a
     * câmera exatamente nos limites do mundo — nunca há borda preta no 9:16.
     * @param {number} cx centro horizontal desejado
     * @param {number} cy centro vertical desejado
     * @param {{x0:number,x1:number,y0:number,y1:number}} box retângulo do mundo que DEVE preencher o quadro
     */
    frameBox(cx, cy, box) {
      const w = Math.max(1, box.x1 - box.x0);
      const h = Math.max(1, box.y1 - box.y0);
      const zoom = Math.max(this.width / w, this.height / h);
      return { x: cx, y: cy, zoom };
    }

    /** Corte seco (troca de plano, como em edição de cinema). */
    cut(fx, fy, zoom) {
      this.fx = this.tfx = fx;
      this.fy = this.tfy = fy;
      this.zoom = this.tzoom = zoom;
      this.vx = this.vy = this.vz = 0;
      this._clamp();
    }

    /** Movimento suave até um novo enquadramento. */
    moveTo(fx, fy, zoom) {
      this.tfx = fx;
      this.tfy = fy;
      if (zoom !== undefined) this.tzoom = zoom;
    }

    /** Alias cinematográfico para pan/dolly suave com duração ajustável. */
    panTo(fx, fy, zoom, duration = 0.8) {
      this.tfx = fx;
      this.tfy = fy;
      if (zoom !== undefined) this.tzoom = zoom;
      const d = Math.max(0.18, Math.min(2.5, Number(duration) || 0.8));
      this.stiffness = Math.max(8, Math.min(45, 14 / d));
      this.damping = 2 * Math.sqrt(this.stiffness);
    }

    update(dt) {
      const k = this.stiffness;
      const c = this.damping;
      this.vx += ((this.tfx - this.fx) * k - this.vx * c) * dt;
      this.vy += ((this.tfy - this.fy) * k - this.vy * c) * dt;
      this.vz += ((this.tzoom - this.zoom) * k - this.vz * c) * dt;
      this.fx += this.vx * dt;
      this.fy += this.vy * dt;
      this.zoom += this.vz * dt;
      this._clamp();

      // Atualiza decaimento do Screen Shake (Trauma ao quadrado)
      if (this.trauma > 0) {
        const mag = Math.pow(this.trauma, 2) * 18;
        this.shakeX = (Math.random() * 2 - 1) * mag;
        this.shakeY = (Math.random() * 2 - 1) * mag;
        this.trauma = Math.max(0, this.trauma - dt * 2.8);
      } else {
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }

    /** Garante que o retângulo visível nunca sai do cenário desenhado. */
    _clamp() {
      const w = this.world;
      const minZoom = Math.max(this.width / (w.maxX - w.minX), this.height / (w.maxY - w.minY));
      if (this.zoom < minZoom) this.zoom = minZoom;
      const hw = this.width / 2 / this.zoom;
      const hh = this.height / 2 / this.zoom;
      this.fx = Math.min(Math.max(this.fx, w.minX + hw), w.maxX - hw);
      this.fy = Math.min(Math.max(this.fy, w.minY + hh), w.maxY - hh);
    }

    beginFrame(ctx) {
      ctx.save();
      ctx.translate(this.width / 2, this.height / 2);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.fx + this.shakeX, -this.fy + this.shakeY);
    }

    endFrame(ctx) {
      ctx.restore();
      const vig = ctx.createRadialGradient(
        this.width / 2, this.height * 0.45, Math.min(this.width, this.height) * 0.35,
        this.width / 2, this.height * 0.45, Math.max(this.width, this.height) * 0.62
      );
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(2, 6, 15, 0.7)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  global.StudioEngine = global.StudioEngine || {};
  global.StudioEngine.CameraRig2D = CameraRig2D;
})(typeof window !== 'undefined' ? window : globalThis);
