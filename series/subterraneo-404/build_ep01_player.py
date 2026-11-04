#!/usr/bin/env python3
"""
Builds series/subterraneo-404/episodio-1-player.html with embedded VoiceStudio
timing & 30fps lip-sync envelope data so it runs 100% on file:// and http://.
"""
import json
import os
import sys
sys.stdout.reconfigure(encoding="utf-8")

WORKSPACE_ROOT = r"C:\Users\Ruan Gomes\Desktop\projetos\motions\motions"
TIMING_JSON = os.path.join(WORKSPACE_ROOT, "series", "subterraneo-404", "audio", "ep01_timing.json")
OUT_HTML = os.path.join(WORKSPACE_ROOT, "series", "subterraneo-404", "episodio-1-player.html")

with open(TIMING_JSON, "r", encoding="utf-8") as f:
    timing_data = json.load(f)

timing_js = json.dumps(timing_data, ensure_ascii=False)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Subterrâneo 404 — Ep 01: O Lacramento (VoiceStudio Multi-Voz & 2D Modular)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #04060a;
      --red-alert: #ef4444;
      --amber-alert: #f59e0b;
      --cyan-tech: #06b6d4;
      --emerald-voice: #10b981;
      --purple-mimic: #a855f7;
      --font-display: 'Syne', sans-serif;
      --font-sans: 'Plus Jakarta Sans', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }

    body {
      width: 100vw; height: 100vh;
      background: radial-gradient(circle at center, #0f172a 0%, #020306 100%);
      font-family: var(--font-sans);
      color: #f8fafc;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }

    #appContainer {
      position: relative;
      width: 100%; height: 100%;
      max-width: calc(100vh * 9 / 16);
      max-height: 100vh;
      aspect-ratio: 9 / 16;
      background: #020306;
      overflow: hidden;
      box-shadow: 0 0 110px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.14);
      display: flex; flex-direction: column;
    }

    canvas#stage {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 1;
    }

    /* Top Safe-Zone HUD */
    .hud-top {
      position: absolute;
      top: 16px; left: 14px; right: 14px;
      z-index: 20;
      display: flex; flex-direction: column; gap: 8px;
      pointer-events: none;
    }

    .hud-top-row {
      display: flex; justify-content: space-between; align-items: center;
    }

    .badge-series {
      background: rgba(10, 15, 28, 0.88);
      border: 1px solid rgba(239, 68, 68, 0.55);
      padding: 6px 12px; border-radius: 999px;
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 0 24px rgba(239, 68, 68, 0.35);
      backdrop-filter: blur(12px);
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--red-alert);
      box-shadow: 0 0 10px var(--red-alert);
      animation: pulse 1.2s infinite ease-in-out;
    }
    .badge-text {
      font-family: var(--font-mono);
      font-size: 11px; font-weight: 800;
      letter-spacing: 0.5px;
      color: #fca5a5;
    }

    .badge-clock {
      background: rgba(10, 15, 28, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 10px; border-radius: 8px;
      font-family: var(--font-mono); font-size: 11px; font-weight: 800;
      color: #fbbf24;
      backdrop-filter: blur(8px);
    }

    /* VoiceStudio Telemetry Pill */
    .voicestudio-pill {
      align-self: flex-start;
      background: rgba(6, 78, 59, 0.78);
      border: 1px solid rgba(16, 185, 129, 0.45);
      padding: 4px 10px; border-radius: 8px;
      font-family: var(--font-mono); font-size: 10px; font-weight: 700;
      color: #6ee7b7;
      display: flex; align-items: center; gap: 6px;
      backdrop-filter: blur(8px);
    }

    /* Bottom HUD & Subtitles */
    .hud-bottom {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      z-index: 30;
      padding: 14px 16px 20px;
      background: linear-gradient(0deg, rgba(2, 4, 8, 0.98) 0%, rgba(2, 4, 8, 0.82) 72%, transparent 100%);
      display: flex; flex-direction: column; gap: 10px;
    }

    .dialogue-card {
      background: rgba(12, 18, 32, 0.88);
      border: 1.5px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 12px 14px;
      backdrop-filter: blur(16px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.85);
      transition: border-color 0.25s ease;
    }
    .dialogue-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 5px;
      gap: 8px;
    }
    .speaker-label {
      font-family: var(--font-mono); font-size: 10.5px; font-weight: 800;
      letter-spacing: 0.6px; color: var(--amber-alert);
    }
    .emotion-tag {
      font-family: var(--font-mono); font-size: 9.5px; font-weight: 800;
      padding: 2px 7px; border-radius: 5px;
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }
    .dialogue-text {
      font-size: 13.5px; font-weight: 600; line-height: 1.42;
      color: #f8fafc;
    }

    /* Binary Choices (Act 5) */
    .choices-grid {
      display: none;
      flex-direction: column; gap: 8px;
      animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .choices-grid.visible { display: flex; }

    .choice-card {
      background: rgba(15, 23, 42, 0.92);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      border-radius: 12px;
      padding: 10px 12px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px;
      transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .choice-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.55);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75);
    }
    .choice-card.opt-1.selected {
      border-color: var(--amber-alert);
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.26) 0%, rgba(15, 23, 42, 0.95) 100%);
      box-shadow: 0 0 28px rgba(245, 158, 11, 0.4);
    }
    .choice-card.opt-2.selected {
      border-color: var(--cyan-tech);
      background: linear-gradient(90deg, rgba(6, 182, 212, 0.26) 0%, rgba(15, 23, 42, 0.95) 100%);
      box-shadow: 0 0 28px rgba(6, 182, 212, 0.4);
    }
    .choice-badge {
      font-family: var(--font-mono); font-size: 10px; font-weight: 800;
      padding: 4px 7px; border-radius: 6px;
    }
    .badge-opt1 { background: rgba(245, 158, 11, 0.25); color: #fbbf24; }
    .badge-opt2 { background: rgba(6, 182, 212, 0.25); color: #38bdf8; }
    .choice-content { flex: 1; }
    .choice-headline { font-size: 12.5px; font-weight: 800; color: #fff; }
    .choice-sub { font-size: 10.5px; color: #94a3b8; }
    .choice-percent {
      font-family: var(--font-mono); font-size: 13px; font-weight: 800;
      color: #e2e8f0; min-width: 40px; text-align: right;
    }

    /* Player Controls Bar */
    .controls-bar {
      display: flex; align-items: center; gap: 8px;
    }
    .btn-ctrl {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 7px 11px; border-radius: 8px;
      font-family: var(--font-mono); font-size: 10.5px; font-weight: 700;
      cursor: pointer;
      display: flex; align-items: center; gap: 5px;
      backdrop-filter: blur(8px);
      transition: background 0.2s;
    }
    .btn-ctrl:hover { background: rgba(255, 255, 255, 0.22); }
    .progress-track {
      flex: 1; height: 6px; background: rgba(255, 255, 255, 0.15);
      border-radius: 3px; overflow: hidden; cursor: pointer;
      position: relative;
    }
    .progress-fill {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #ef4444, #f59e0b);
      border-radius: 3px;
    }
    .time-readout {
      font-family: var(--font-mono); font-size: 10.5px; font-weight: 700;
      color: #94a3b8; min-width: 74px; text-align: right;
    }

    /* Start Modal */
    #startModal {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(3, 5, 10, 0.94);
      z-index: 100;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 28px; text-align: center;
      backdrop-filter: blur(14px);
    }
    .start-title {
      font-family: var(--font-display); font-size: 27px; font-weight: 900;
      color: #f8fafc; margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .start-subtitle {
      font-size: 12.5px; color: #cbd5e1; line-height: 1.55;
      max-width: 330px; margin-bottom: 18px;
    }
    .cast-list {
      width: 100%; max-width: 330px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 20px;
      text-align: left;
      font-size: 11px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .cast-item {
      display: flex; justify-content: space-between; align-items: center;
      color: #e2e8f0;
    }
    .cast-item span.role { color: #94a3b8; font-family: var(--font-mono); font-size: 10px; }
    .btn-play-hero {
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #fff;
      font-family: var(--font-display); font-size: 15px; font-weight: 800;
      padding: 15px 32px; border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 10px 40px rgba(239, 68, 68, 0.5);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-play-hero:hover {
      transform: scale(1.04);
      box-shadow: 0 14px 50px rgba(239, 68, 68, 0.7);
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>

  <div id="appContainer">
    <canvas id="stage"></canvas>

    <!-- Master Audio Track generated by debpalash/VoiceStudio -->
    <audio id="masterAudio" src="audio/ep01_master_voicestudio.mp3" preload="auto"></audio>

    <!-- Start Overlay -->
    <div id="startModal">
      <div style="font-family: var(--font-mono); font-size: 10.5px; color: #34d399; font-weight: 800; margin-bottom: 6px; letter-spacing: 1.5px;">
        🎙️ VOICESTUDIO MULTI-CHARACTER + SUA VOZ CLONADA
      </div>
      <h1 class="start-title">SUBTERRÂNEO 404</h1>
      <p class="start-subtitle">
        Episódio 01: O Lacramento (10 Cenas Sequenciais).<br>
        Narrado com a <b>sua voz clonada (108.4 Hz)</b> mudando de emoção a cada cena + 5 vozes exclusivas para os personagens.
      </p>
      <div class="cast-list">
        <div class="cast-item"><b>⚡ Você (Narrador 2ª Pessoa)</b> <span class="role">Sua Voz Clonada (Ruan)</span></div>
        <div class="cast-item"><b>📻 Rádio Militar</b> <span class="role">Filtro VHF + Estática</span></div>
        <div class="cast-item"><b>👨 Enzo (Passageiro)</b> <span class="role">Tom Agudo + Pânico (+2.3st)</span></div>
        <div class="cast-item"><b>👩 Bia (Enfermagem)</b> <span class="role">Voz Feminina Urgente</span></div>
        <div class="cast-item"><b>👴 Seu Tião (Segurança)</b> <span class="role">Barítono Velho (-3.6st)</span></div>
        <div class="cast-item"><b>👁 A Coisa (Dona Irene)</b> <span class="role">Sussurro Duplo + Eco Túnel</span></div>
      </div>
      <button class="btn-play-hero" id="btnStart">▶ ASSISTIR EPISÓDIO 1 COM ÁUDIO</button>
    </div>

    <!-- Top HUD -->
    <div class="hud-top">
      <div class="hud-top-row">
        <div class="badge-series">
          <div class="pulse-dot"></div>
          <div class="badge-text" id="actBadge">ATO 1: O CHOQUE</div>
        </div>
        <div class="badge-clock" id="clockBadge">DIA 01 · FALTAM 30 DIAS</div>
      </div>
      <div class="voicestudio-pill" id="vsPill">
        🎙️ VoiceStudio: Voz Clonada (Ruan 108.4Hz) · Emoção: ATORDOADO
      </div>
    </div>

    <!-- Bottom HUD -->
    <div class="hud-bottom">
      <div class="dialogue-card" id="dialogueCard">
        <div class="dialogue-header">
          <div class="speaker-label" id="speakerLabel">⚡ VOCÊ (SUA VOZ — ELETRICISTA)</div>
          <div class="emotion-tag" id="emotionTag">ATORDOADO / OFEGANTE</div>
        </div>
        <div class="dialogue-text" id="dialogueText">
          "Faltam trinta dias para o resgate chegar... se é que ainda sobrou alguém vivo lá em cima."
        </div>
      </div>

      <!-- Binary Choices Grid (Act 5) -->
      <div class="choices-grid" id="choicesGrid">
        <div class="choice-card opt-1" id="choiceOpt1" onclick="castVote(1)">
          <span class="choice-badge badge-opt1">OPÇÃO 1</span>
          <div class="choice-content">
            <div class="choice-headline">Ligar o Gerador a Diesel</div>
            <div class="choice-sub">Traz holofotes fortes, mas o barulho ecoa no túnel inteiro.</div>
          </div>
          <div class="choice-percent" id="pct1">58%</div>
        </div>

        <div class="choice-card opt-2" id="choiceOpt2" onclick="castVote(2)">
          <span class="choice-badge badge-opt2">OPÇÃO 2</span>
          <div class="choice-content">
            <div class="choice-headline">Fugir pelo Duto de Ventilação 3</div>
            <div class="choice-sub">Silencioso e estreito, mas a água escura está subindo.</div>
          </div>
          <div class="choice-percent" id="pct2">42%</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-bar">
        <button class="btn-ctrl" id="btnPlayPause">⏸ PAUSAR</button>
        <button class="btn-ctrl" id="btnMute">🔊 SOM ON</button>
        <div class="progress-track" id="progressTrack">
          <div class="progress-fill" id="progressFill"></div>
        </div>
        <div class="time-readout" id="timeReadout">00:00 / 01:52</div>
      </div>
    </div>
  </div>

  <script>
    // =========================================================================
    // 1. EMBEDDED VOICESTUDIO TIMING & 30FPS LIP-SYNC ENVELOPE
    // =========================================================================
    const TIMING_DATA = __TIMING_DATA_PLACEHOLDER__;
    const BEATS = TIMING_DATA.beats;
    const LIPSYNC = TIMING_DATA.lipsync_envelope;
    const TOTAL_DURATION = TIMING_DATA.total_duration;
    const SILENCE_START = TIMING_DATA.silence_window[0];
    const SILENCE_END = TIMING_DATA.silence_window[1];

    const masterAudio = document.getElementById('masterAudio');
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let currentTime = 0;
    let isPlaying = false;
    let currentBeatIndex = 0;

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function getMouthOpenness(timeSec) {
      const idx = Math.floor(timeSec * TIMING_DATA.lipsync_fps);
      if (idx < 0 || idx >= LIPSYNC.length) return 0;
      return LIPSYNC[idx];
    }

    // =========================================================================
    // 2. MODULAR 2D CHARACTERS WITH EMOTION-REACTIVE FACES & POSTURES
    // =========================================================================
    class ModularCharacter2D {
      constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.outfitColor = config.outfitColor;
        this.accentColor = config.accentColor || '#f59e0b';
        this.hairColor = config.hairColor || '#1e1b4b';
        this.skinColor = config.skinColor || '#fed7aa';
        this.scale = config.scale || 1.35;
        this.hasFlashlight = Boolean(config.hasFlashlight);
        this.hasCap = Boolean(config.hasCap);
        this.hasMedkit = Boolean(config.hasMedkit);
        this.x = 0;
        this.y = 0;
        this.blinkTimer = Math.random() * 3;
        this.isBlinking = false;
        this.breathPhase = Math.random() * Math.PI * 2;
      }

      draw(ctx, dt, timeSec, activeSpeakerId, mouthEnv, emotionBadge, beatId) {
        this.breathPhase += dt * 3.2;
        this.blinkTimer += dt;
        if (this.blinkTimer > 3.6) {
          this.isBlinking = true;
          if (this.blinkTimer > 3.76) {
            this.isBlinking = false;
            this.blinkTimer = 0;
          }
        }

        const isSpeaking = (activeSpeakerId === this.id);
        const mouthOpen = isSpeaking ? mouthEnv * 8.5 : 0;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Posture adjustment: in Beat 1, VOCE is waking up from the floor
        let crouchOffset = 0;
        if (this.id === 'VOCE' && beatId === 1) {
          const standProgress = Math.min(1, timeSec / 5.5);
          crouchOffset = (1 - standProgress) * 32;
        }

        const breathY = Math.sin(this.breathPhase) * 2.5 + crouchOffset;

        // 1. Legs & Boots
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, 68, 12, 54);
        ctx.fillRect(4, 68, 12, 54);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-20, 118, 18, 12);
        ctx.fillRect(2, 118, 18, 12);

        // 2. Torso / Jacket
        ctx.fillStyle = this.outfitColor;
        ctx.beginPath();
        ctx.roundRect(-24, 14 + breathY, 48, 58, [9, 9, 4, 4]);
        ctx.fill();

        // Reflective Strip / Badge
        ctx.fillStyle = this.accentColor;
        ctx.fillRect(-18, 36 + breathY, 36, 5);

        // Seu Tião's metallic key ring on belt
        if (this.id === 'SEU_TIAO') {
          const keySwing = (beatId === 6) ? Math.sin(timeSec * 18) * 4 : 0;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(16 + keySwing, 68 + breathY, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(14 + keySwing, 74 + breathY, 3, 9);
          ctx.fillRect(18 + keySwing, 74 + breathY, 3, 7);
        }

        // 3. Left Arm (Enzo bangs on gate in Beat 4; Bia holds Medkit in Beat 5)
        ctx.save();
        ctx.translate(-26, 20 + breathY);
        if (this.id === 'ENZO' && beatId === 4) {
          ctx.rotate(-0.9 + Math.sin(timeSec * 22) * 0.45);
        } else {
          ctx.rotate(Math.sin(timeSec * 1.6) * 0.06);
        }
        ctx.fillStyle = this.outfitColor;
        ctx.fillRect(-8, 0, 10, 44);
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.arc(-3, 46, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Bia's First-Aid Medkit
        if (this.hasMedkit) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-18, 44, 24, 16);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-9, 47, 6, 10);
          ctx.fillRect(-11, 49, 10, 6);
        }
        ctx.restore();

        // 4. Right Arm (Flashlight or Banging)
        ctx.save();
        ctx.translate(26, 20 + breathY);
        if (this.id === 'ENZO' && beatId === 4) {
          ctx.rotate(-1.1 + Math.cos(timeSec * 22) * 0.45);
          ctx.fillStyle = this.outfitColor;
          ctx.fillRect(-2, 0, 10, 44);
        } else if (this.hasFlashlight) {
          ctx.rotate(-0.4 + Math.sin(timeSec * 2.1) * 0.05);
          ctx.fillStyle = this.outfitColor;
          ctx.fillRect(-2, 0, 10, 38);
          // Flashlight Body
          ctx.fillStyle = '#334155';
          ctx.fillRect(0, 34, 14, 20);
          const isFlickerOff = (timeSec >= SILENCE_START - 0.3 && timeSec <= SILENCE_END);
          ctx.fillStyle = isFlickerOff ? '#475569' : '#fde047';
          ctx.fillRect(11, 36, 4, 16);
        } else {
          ctx.rotate(0.1);
          ctx.fillStyle = this.outfitColor;
          ctx.fillRect(-2, 0, 10, 44);
        }
        ctx.restore();

        // 5. HeadPivot (Reactive Face & Lip-Sync)
        ctx.save();
        ctx.translate(0, breathY);

        // Neck
        ctx.fillStyle = this.skinColor;
        ctx.fillRect(-6, 3, 12, 13);

        // Face Base
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.arc(0, -12, 21, 0, Math.PI * 2);
        ctx.fill();

        // Hair or Security Cap
        ctx.fillStyle = this.hairColor;
        ctx.beginPath();
        ctx.arc(0, -18, 22, Math.PI, Math.PI * 2);
        ctx.fill();
        if (this.hasCap) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-23, -26, 46, 10);
          ctx.fillRect(-10, -20, 38, 5);
        } else {
          ctx.fillRect(-22, -20, 44, 10);
        }

        // Eyes (Wide in shock during Beat 8/9)
        const isShocked = (beatId === 8 || beatId === 9 || this.id === 'ENZO');
        const eyeRadius = isShocked ? 3.8 : 3.0;
        if (!this.isBlinking) {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(-7.5, -10, eyeRadius, 0, Math.PI * 2);
          ctx.arc(7.5, -10, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-8.5, -11, 1.2, 0, Math.PI * 2);
          ctx.arc(6.5, -11, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-11, -10); ctx.lineTo(-4, -10);
          ctx.moveTo(4, -10); ctx.lineTo(11, -10);
          ctx.stroke();
        }

        // Emotion-Reactive Eyebrows
        ctx.strokeStyle = this.hairColor;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        if (this.id === 'ENZO') {
          // Angry / Frantic eyebrows
          ctx.moveTo(-12, -18); ctx.lineTo(-4, -14);
          ctx.moveTo(4, -14); ctx.lineTo(12, -18);
        } else if (isShocked) {
          // High arched shocked eyebrows
          ctx.moveTo(-12, -15); ctx.lineTo(-4, -19);
          ctx.moveTo(4, -19); ctx.lineTo(12, -15);
        } else {
          // Tense focused eyebrows
          ctx.moveTo(-12, -16); ctx.lineTo(-4, -15);
          ctx.moveTo(4, -15); ctx.lineTo(12, -16);
        }
        ctx.stroke();

        // Lip-Synced Mouth (driven by VoiceStudio 30Hz envelope!)
        ctx.fillStyle = '#7f1d1d';
        if (mouthOpen > 0.8) {
          ctx.beginPath();
          ctx.ellipse(0, 1, 5.5, Math.min(8.5, mouthOpen), 0, 0, Math.PI * 2);
          ctx.fill();
          // Teeth hint
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-3.5, -1.5, 7, 2);
        } else {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-4.5, 1);
          ctx.lineTo(4.5, 1);
          ctx.stroke();
        }

        // Speaker Halo Indicator when speaking
        if (isSpeaking && mouthOpen > 0.5) {
          ctx.strokeStyle = this.accentColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, -12, 28 + mouthOpen * 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore(); // HeadPivot
        ctx.restore(); // CharacterRoot
      }
    }

    const charVoce = new ModularCharacter2D({
      id: 'VOCE', name: 'Você', outfitColor: '#1d4ed8', accentColor: '#f59e0b',
      hairColor: '#1e1b4b', scale: 1.42, hasFlashlight: true
    });
    const charEnzo = new ModularCharacter2D({
      id: 'ENZO', name: 'Enzo', outfitColor: '#c2410c', accentColor: '#fca5a5',
      hairColor: '#27272a', scale: 1.28, hasFlashlight: false
    });
    const charBia = new ModularCharacter2D({
      id: 'BIA', name: 'Bia', outfitColor: '#047857', accentColor: '#6ee7b7',
      hairColor: '#3f271d', scale: 1.25, hasMedkit: true
    });
    const charTiao = new ModularCharacter2D({
      id: 'SEU_TIAO', name: 'Seu Tião', outfitColor: '#334155', accentColor: '#38bdf8',
      hairColor: '#94a3b8', scale: 1.34, hasFlashlight: true, hasCap: true
    });

    // =========================================================================
    // 3. SEQUENTIAL 2D SCENE RENDERER (10 DRAMATIC BEATS)
    // =========================================================================
    let camX = 0;
    let camTargetX = 0;

    function renderScene(dt) {
      const beat = BEATS[currentBeatIndex] || BEATS[0];
      const mouthEnv = getMouthOpenness(currentTime);
      const isTotalSilence = (currentTime >= SILENCE_START && currentTime <= SILENCE_END);

      // Camera Choreography across the 10 beats
      if (beat.beat_id === 1) camTargetX = -20;
      else if (beat.beat_id === 2 || beat.beat_id === 3) camTargetX = 45;
      else if (beat.beat_id === 4) camTargetX = 85;
      else if (beat.beat_id === 5 || beat.beat_id === 6) camTargetX = 10;
      else if (beat.beat_id === 7 || beat.beat_id === 8 || beat.beat_id === 9) camTargetX = 135;
      else camTargetX = 0;

      camX += (camTargetX - camX) * 0.05;

      // Screen Shake during Gate Slam (Beat 2) and Scare Sub-Bass (Beat 9)
      let shakeX = 0, shakeY = 0;
      if ((beat.beat_id === 2 && currentTime < beat.start + 1.5) ||
          (beat.beat_id === 9 && currentTime < beat.start + 1.8)) {
        shakeX = (Math.random() - 0.5) * 10;
        shakeY = (Math.random() - 0.5) * 10;
      }

      ctx.fillStyle = '#030509';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(-camX + shakeX, shakeY);

      // --- LAYER 1: Deep Underground Tunnel North (Túnel Norte) ---
      const vanishX = W * 0.58 + 70;
      const vanishY = H * 0.43;

      for (let i = 8; i >= 1; i--) {
        const f = i / 8;
        const rx = f * (W * 0.85);
        const ry = f * (H * 0.44);
        ctx.strokeStyle = `rgba(30, 41, 59, ${f * 0.55})`;
        ctx.lineWidth = 2.5 * f;
        ctx.beginPath();
        ctx.ellipse(vanishX, vanishY, rx, ry, 0, Math.PI, 0);
        ctx.stroke();

        // Steel Rails
        ctx.strokeStyle = `rgba(71, 85, 105, ${f * 0.75})`;
        ctx.beginPath();
        ctx.moveTo(vanishX - rx * 0.38, vanishY + ry * 0.85);
        ctx.lineTo(vanishX, vanishY);
        ctx.moveTo(vanishX + rx * 0.38, vanishY + ry * 0.85);
        ctx.lineTo(vanishX, vanishY);
        ctx.stroke();
      }

      // --- LAYER 2: Station Concrete Platform & 10-Ton Hydraulic Gate ---
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(-250, H * 0.65, W + 600, H * 0.35);

      // Yellow Tactile Safety Line
      ctx.fillStyle = '#f59e0b';
      for (let x = -220; x < W + 520; x += 32) {
        ctx.fillRect(x, H * 0.65, 18, 5);
      }

      // 10-Ton Hydraulic Blast Gate (Slams down in Beat 2+)
      const gateDrop = beat.beat_id === 1 ? 0.25 : 1.0;
      const gateH = (H * 0.56) * gateDrop;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(W * 0.68, 70, 170, gateH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeRect(W * 0.68, 70, 170, gateH);
      ctx.fillStyle = '#ef4444';
      ctx.font = '800 10px monospace';
      ctx.fillText("QUARANTINE LOCK — 10T", W * 0.695, 105);

      // Wall Military Radio Box (Glows in Beat 3)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(W * 0.28, H * 0.42, 46, 62);
      ctx.strokeStyle = beat.speaker_id === 'RADIO_MILITAR' ? '#ef4444' : '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(W * 0.28, H * 0.42, 46, 62);
      if (beat.speaker_id === 'RADIO_MILITAR') {
        const waveR = 14 + mouthEnv * 26;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.beginPath();
        ctx.arc(W * 0.28 + 23, H * 0.42 + 25, waveR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- LAYER 3: Uncanny Mimic Entity in the Dark Tunnel (Beats 8 & 9) ---
      if (beat.beat_id === 8 || beat.beat_id === 9) {
        ctx.save();
        // Glowing pale eyes in the tunnel roof/curve
        const eyeGlow = beat.speaker_id === 'CRIATURA_IRENE' ? (0.5 + mouthEnv * 0.5) : 0.85;
        ctx.fillStyle = `rgba(248, 113, 113, ${eyeGlow})`;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(vanishX - 8, vanishY - 14, 3.2, 0, Math.PI * 2);
        ctx.arc(vanishX + 8, vanishY - 14, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Eerie vocal mimic soundwaves coming from the dark tunnel
        if (beat.speaker_id === 'CRIATURA_IRENE' && mouthEnv > 0.08) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${mouthEnv * 0.7})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(vanishX, vanishY - 8, 22 + mouthEnv * 45, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- LAYER 4: Modular 2D Characters on Stage ---
      // Bia (Left)
      if (beat.beat_id >= 2) {
        charBia.x = W * 0.14;
        charBia.y = H * 0.67;
        charBia.draw(ctx, dt, currentTime, beat.speaker_id, mouthEnv, beat.emotion_badge, beat.beat_id);
      }

      // Você (Center-Left Protagonist)
      charVoce.x = W * 0.39;
      charVoce.y = H * 0.68;
      charVoce.draw(ctx, dt, currentTime, beat.speaker_id, mouthEnv, beat.emotion_badge, beat.beat_id);

      // Seu Tião (Center-Right Security)
      if (beat.beat_id >= 2) {
        charTiao.x = W * 0.64;
        charTiao.y = H * 0.66;
        charTiao.draw(ctx, dt, currentTime, beat.speaker_id, mouthEnv, beat.emotion_badge, beat.beat_id);
      }

      // Enzo (Far Right by the sealed gate)
      if (beat.beat_id >= 2) {
        charEnzo.x = W * 0.86;
        charEnzo.y = H * 0.67;
        charEnzo.draw(ctx, dt, currentTime, beat.speaker_id, mouthEnv, beat.emotion_badge, beat.beat_id);
      }

      // --- LAYER 5: Volumetric Flashlight Cone & Emergency Strobe ---
      if (!isTotalSilence) {
        const fx = charVoce.x + 34;
        const fy = charVoce.y + 12;
        const aimX = beat.beat_id >= 7 ? vanishX : W * 0.65;
        const aimY = vanishY;
        const coneGrad = ctx.createRadialGradient(fx, fy, 12, aimX, aimY, W * 0.65);
        coneGrad.addColorStop(0, 'rgba(255, 248, 215, 0.38)');
        coneGrad.addColorStop(0.5, 'rgba(254, 215, 170, 0.12)');
        coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coneGrad;
        ctx.fillRect(-250, 0, W + 600, H);

        // Red Emergency Ceiling Strobe
        const strobe = Math.sin(currentTime * 7.5) > 0.25 ? 0.32 : 0.06;
        const redGrad = ctx.createRadialGradient(W * 0.5, 45, 10, W * 0.5, 140, W * 0.75);
        redGrad.addColorStop(0, `rgba(239, 68, 68, ${strobe})`);
        redGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = redGrad;
        ctx.fillRect(-250, 0, W + 600, H * 0.55);
      } else {
        // 2.0s TOTAL SILENCE & DARKNESS BEFORE THE SCARE!
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.fillRect(-250, 0, W + 600, H);
      }

      // Sparks in Beat 1
      if (beat.beat_id === 1 && Math.sin(currentTime * 28) > 0.4) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        for (let s = 0; s < 5; s++) {
          ctx.beginPath();
          ctx.moveTo(W * 0.28, H * 0.42);
          ctx.lineTo(W * 0.28 + (Math.random() - 0.5) * 55, H * 0.42 + Math.random() * 55);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // =========================================================================
    // 4. MASTER LOOP & HUD SYNCHRONIZATION
    // =========================================================================
    let lastTs = performance.now();

    function updateHUD(beat) {
      document.getElementById('actBadge').innerText = beat.act_title;
      document.getElementById('speakerLabel').innerText = beat.speaker_label;
      document.getElementById('emotionTag').innerText = beat.emotion_badge;
      document.getElementById('dialogueText').innerText = `"${beat.text}"`;

      const isCloned = beat.speaker_id === 'VOCE';
      document.getElementById('vsPill').innerText = isCloned
        ? `🎙️ Sua Voz Clonada (108.4Hz) · Tom: ${beat.emotion_badge}`
        : `🎭 Voz Personagem [${beat.speaker_id}] · Tom: ${beat.emotion_badge}`;

      const choicesGrid = document.getElementById('choicesGrid');
      if (beat.act === 5) {
        choicesGrid.classList.add('visible');
      } else {
        choicesGrid.classList.remove('visible');
      }
    }

    function tick(now) {
      const dt = Math.min((now - lastTs) / 1000, 0.1);
      lastTs = now;

      if (isPlaying) {
        if (!masterAudio.paused) {
          currentTime = masterAudio.currentTime;
        } else {
          currentTime += dt;
        }

        if (currentTime >= TOTAL_DURATION) {
          currentTime = TOTAL_DURATION;
          isPlaying = false;
          document.getElementById('btnPlayPause').innerText = "▶ REPETIR";
        }

        const idx = BEATS.findIndex(b => currentTime >= b.start && currentTime < b.end);
        const resolvedIdx = idx === -1 ? BEATS.length - 1 : idx;
        if (resolvedIdx !== currentBeatIndex) {
          currentBeatIndex = resolvedIdx;
          updateHUD(BEATS[currentBeatIndex]);
        }

        const pct = (currentTime / TOTAL_DURATION) * 100;
        document.getElementById('progressFill').style.width = `${pct}%`;
        document.getElementById('timeReadout').innerText =
          `${formatTime(currentTime)} / ${formatTime(TOTAL_DURATION)}`;
      }

      renderScene(dt);
      requestAnimationFrame(tick);
    }

    // =========================================================================
    // 5. CONTROLS & INTERACTIVE BINARY VOTING
    // =========================================================================
    let votes1 = 58, votes2 = 42;
    function castVote(opt) {
      if (opt === 1) {
        votes1++;
        document.getElementById('choiceOpt1').classList.add('selected');
        document.getElementById('choiceOpt2').classList.remove('selected');
      } else {
        votes2++;
        document.getElementById('choiceOpt2').classList.add('selected');
        document.getElementById('choiceOpt1').classList.remove('selected');
      }
      const total = votes1 + votes2;
      document.getElementById('pct1').innerText = Math.round((votes1 / total) * 100) + '%';
      document.getElementById('pct2').innerText = Math.round((votes2 / total) * 100) + '%';
    }

    document.getElementById('btnStart').addEventListener('click', () => {
      document.getElementById('startModal').style.display = 'none';
      currentBeatIndex = 0;
      updateHUD(BEATS[0]);
      masterAudio.currentTime = 0;
      masterAudio.play().catch(err => console.warn('Audio play fallback:', err));
      isPlaying = true;
    });

    document.getElementById('btnPlayPause').addEventListener('click', () => {
      if (currentTime >= TOTAL_DURATION) {
        currentTime = 0;
        masterAudio.currentTime = 0;
      }
      if (isPlaying) {
        isPlaying = false;
        masterAudio.pause();
        document.getElementById('btnPlayPause').innerText = "▶ CONTINUAR";
      } else {
        isPlaying = true;
        masterAudio.play().catch(() => {});
        document.getElementById('btnPlayPause').innerText = "⏸ PAUSAR";
      }
    });

    document.getElementById('btnMute').addEventListener('click', () => {
      masterAudio.muted = !masterAudio.muted;
      document.getElementById('btnMute').innerText = masterAudio.muted ? "🔇 SOM OFF" : "🔊 SOM ON";
    });

    document.getElementById('progressTrack').addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      currentTime = ratio * TOTAL_DURATION;
      masterAudio.currentTime = currentTime;
      const idx = BEATS.findIndex(b => currentTime >= b.start && currentTime < b.end);
      currentBeatIndex = idx === -1 ? BEATS.length - 1 : idx;
      updateHUD(BEATS[currentBeatIndex]);
    });

    requestAnimationFrame(tick);
  </script>
</body>
</html>
"""

final_html = HTML_TEMPLATE.replace("__TIMING_DATA_PLACEHOLDER__", timing_js)
with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(final_html)

print(f"✅ Player HTML atualizado com sucesso: {OUT_HTML} ({len(final_html)} bytes)")
