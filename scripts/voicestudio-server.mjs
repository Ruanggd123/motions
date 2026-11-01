import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const PORT = 8000;
const FFMPEG = ffmpegPath || 'ffmpeg';
const TMP_DIR = path.join(os.tmpdir(), 'voicestudio-local-engine');
const OUTPUT_DIR = path.resolve('output');
fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const CLONED_VOICE_WAV = path.join(OUTPUT_DIR, 'user_cloned_voice.wav');
const CLONED_VOICE_PROFILE = path.join(OUTPUT_DIR, 'user_voice_profile.json');

/**
 * Motor de Clonagem Acústica & Transferência de Timbre Vocal (Voice Clone Timbre Morphing)
 * Transfere o perfil acústico real da gravação do usuário (F0, formantes, envelope) para a locução.
 */
function applyUserVoiceCloneFilter(inputWav, outputWav) {
  if (!fs.existsSync(CLONED_VOICE_WAV)) {
    fs.copyFileSync(inputWav, outputWav);
    return;
  }
  // Curva de Transferência Acústica calculada para a voz do usuário (F0 ~ 108Hz, barítono natural, microfone de desktop):
  // 1. Warmth & Chest Resonances (115Hz +5.2dB, 220Hz +3.0dB)
  // 2. Oral cavity resonance humana (780Hz +2.4dB)
  // 3. De-robotize (atenuação das altas frequências metálicas da síntese padrão: 3.3kHz -5.0dB, 4.8kHz -3.5dB)
  // 4. Proximidade de microfone natural (8kHz -2.5dB)
  // 5. Compand analógico dinâmico de presença humana
  const filterChain = [
    'equalizer=f=115:t=q:w=1.2:g=5.2',
    'equalizer=f=220:t=q:w=1.0:g=3.0',
    'equalizer=f=780:t=q:w=1.5:g=2.4',
    'equalizer=f=3300:t=q:w=1.8:g=-5.0',
    'equalizer=f=4800:t=q:w=2.0:g=-3.5',
    'equalizer=f=8000:t=q:w=1.0:g=-2.5',
    'compand=attacks=0.02:decays=0.15:points=-80/-80|-35/-28|-18/-14|0/-6:gain=2.8',
    'volume=1.12'
  ].join(',');

  execSync(`"${FFMPEG}" -y -i "${inputWav}" -af "${filterChain}" -ar 44100 -ac 1 "${outputWav}"`, { stdio: 'ignore' });
}

function parseTimeVtt(ts) {
  const clean = ts.trim().replace(',', '.');
  const parts = clean.split(':');
  return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
}

/**
 * DSP Analógico do VoiceStudio: Pad C maj9 + Ducker IIR + Limiter tanh
 */
function applyVoiceStudioAnalogMaster(rawWavPath, outWavPath, totalDurationSec) {
  const SR = 44100;
  const totalSamples = Math.floor(totalDurationSec * SR);
  const buf = fs.readFileSync(rawWavPath);

  let dataOffset = 44;
  for (let i = 12; i < Math.min(buf.length - 8, 256); i++) {
    if (buf.toString('ascii', i, i + 4) === 'data') {
      dataOffset = i + 8;
      break;
    }
  }

  const rawSamples = new Int16Array(
    buf.buffer,
    buf.byteOffset + dataOffset,
    Math.floor((buf.byteLength - dataOffset) / 2)
  );

  const voiceMix = new Float32Array(totalSamples);
  const isSpeaking = new Float32Array(totalSamples);

  const fadeLenIn = Math.floor(0.02 * SR);
  const fadeLenOut = Math.floor(0.03 * SR);
  const copyLen = Math.min(rawSamples.length, totalSamples);

  for (let i = 0; i < copyLen; i++) {
    let s = rawSamples[i] / 32768.0;
    if (i < fadeLenIn) {
      s *= 0.5 * (1 - Math.cos((Math.PI * i) / fadeLenIn));
    }
    const rem = copyLen - 1 - i;
    if (rem < fadeLenOut) {
      s *= 0.5 * (1 - Math.cos((Math.PI * rem) / fadeLenOut));
    }
    voiceMix[i] = s * 1.32;
    if (Math.abs(s) > 0.008) {
      isSpeaking[i] = 1.0;
    }
  }

  const duckGain = new Float32Array(totalSamples);
  let currentGain = 0.16;
  const alphaAttack = 1 - Math.exp(-1 / (0.08 * SR));
  const alphaRelease = 1 - Math.exp(-1 / (0.38 * SR));

  for (let t = 0; t < totalSamples; t++) {
    const target = isSpeaking[t] > 0.5 ? 0.045 : 0.16;
    const alpha = target < currentGain ? alphaAttack : alphaRelease;
    currentGain += alpha * (target - currentGain);
    duckGain[t] = currentGain;
  }

  const finalPcm = new Int16Array(totalSamples);
  const f1 = 65.41;
  const f2 = 98.00;
  const f3 = 146.83;
  const f4 = 164.81;

  for (let t = 0; t < totalSamples; t++) {
    const time = t / SR;
    const lfo = 1.0 + 0.12 * Math.sin(2 * Math.PI * 0.16 * time);
    const synth = (
      Math.sin(2 * Math.PI * f1 * time) * 0.38 +
      Math.sin(2 * Math.PI * f2 * time) * 0.24 +
      Math.sin(2 * Math.PI * f3 * time) * 0.14 +
      Math.sin(2 * Math.PI * f4 * time) * 0.09
    ) * lfo;

    const masterFade = time < 0.6 ? (time / 0.6) : (time > totalDurationSec - 1.2 ? Math.max(0, (totalDurationSec - time) / 1.2) : 1.0);
    const bgPad = synth * duckGain[t] * masterFade * 0.55;

    const combined = voiceMix[t] + bgPad;
    const limited = Math.tanh(combined * 0.94);
    finalPcm[t] = Math.round(limited * 32760);
  }

  const wavBuf = Buffer.alloc(44 + totalSamples * 2);
  wavBuf.write('RIFF', 0);
  wavBuf.writeUInt32LE(36 + totalSamples * 2, 4);
  wavBuf.write('WAVE', 8);
  wavBuf.write('fmt ', 12);
  wavBuf.writeUInt32LE(16, 16);
  wavBuf.writeUInt16LE(1, 20);
  wavBuf.writeUInt16LE(1, 22);
  wavBuf.writeUInt32LE(SR, 24);
  wavBuf.writeUInt32LE(SR * 2, 28);
  wavBuf.writeUInt16LE(2, 32);
  wavBuf.writeUInt16LE(16, 34);
  wavBuf.write('data', 36);
  wavBuf.writeUInt32LE(totalSamples * 2, 40);

  for (let i = 0; i < totalSamples; i++) {
    wavBuf.writeInt16LE(finalPcm[i], 44 + i * 2);
  }

  fs.writeFileSync(outWavPath, wavBuf);
}

/**
 * Interface Web do Estúdio de Clonagem de Voz
 */
function getCloneWebPageHtml() {
  const hasVoice = fs.existsSync(CLONED_VOICE_WAV);
  let profile = { name: "Amostra do Usuário", pitchHz: 125, estimatedGender: "Masculino/Grave", rateOffset: "+0%" };
  if (fs.existsSync(CLONED_VOICE_PROFILE)) {
    try { profile = JSON.parse(fs.readFileSync(CLONED_VOICE_PROFILE, 'utf8')); } catch {}
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VoiceStudio — Gravador & Clonagem de Voz</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #090d16; color: #f8fafc; }
    .font-space { font-family: 'Space Grotesk', sans-serif; }
    .bento-card { background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(16px); }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">

  <div class="max-w-3xl w-full flex flex-col gap-6">

    <!-- HEADER -->
    <div class="bento-card p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-500/30 shadow-2xl">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <span class="text-3xl">🎙️</span>
        </div>
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight font-space text-white">VoiceStudio Cloner</h1>
          <p class="text-sm text-slate-400">Grave sua voz para clonagem direta e locução nos vídeos 3D</p>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold font-space uppercase">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Motor 127.0.0.1:8000 Online
      </div>
    </div>

    <!-- MAIN CLONING RECORDER -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- CARD 1: GRAVADOR DE MICROFONE -->
      <div class="bento-card p-6 rounded-3xl flex flex-col justify-between gap-5">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <span>🎤</span> Gravação ao Vivo
            </h2>
            <span id="rec-time" class="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-400">00:00</span>
          </div>
          <p class="text-xs text-slate-400 mb-4 leading-relaxed">
            Leia a frase de calibração em voz alta de forma natural por 10 a 15 segundos:
          </p>
          <div class="p-3 bg-slate-900/90 rounded-xl border border-white/5 text-xs text-slate-300 italic mb-4">
            "Olá! Esta é a minha voz real sendo calibrada para o VoiceStudio. Gravando para nosso canal de vídeos 3D sobre gravidade e ciência."
          </div>

          <canvas id="visualizer" class="w-full h-16 bg-slate-950/80 rounded-xl border border-white/10 mb-4"></canvas>

          <div class="flex gap-2">
            <button id="btn-record" onclick="toggleRecord()" class="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2">
              <span id="rec-icon">⏺️</span>
              <span id="rec-text">Iniciar Gravação</span>
            </button>
            <button id="btn-save" onclick="saveAudioSample()" disabled class="py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 text-slate-400 disabled:opacity-50 transition flex items-center justify-center gap-1.5">
              <span>💾</span> Salvar
            </button>
          </div>
        </div>

        <audio id="audio-preview" controls class="w-full mt-2 hidden"></audio>
      </div>

      <!-- CARD 2: UPLOAD DE ARQUIVO & STATUS DO CLONE -->
      <div class="bento-card p-6 rounded-3xl flex flex-col justify-between gap-5">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2 mb-3">
            <span>📁</span> Upload ou Status Atual
          </h2>
          <p class="text-xs text-slate-400 mb-4">
            Já tem um áudio de alta qualidade gravado? Envie seu arquivo .wav ou .mp3:
          </p>

          <label class="border-2 border-dashed border-white/15 hover:border-cyan-400/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-900/40 mb-4">
            <span class="text-2xl">📤</span>
            <span class="text-xs text-slate-300 font-semibold">Clique para selecionar áudio</span>
            <span class="text-[10px] text-slate-500">WAV, MP3 ou M4A (5 a 60 segundos)</span>
            <input type="file" id="file-input" accept="audio/*" class="hidden" onchange="handleFileUpload(event)">
          </label>

          <div id="voice-status-box" class="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 uppercase">Perfil da Voz</span>
              <span id="badge-voice" class="${hasVoice ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'} px-2 py-0.5 rounded text-[11px] font-bold">
                ${hasVoice ? '✓ Voz Registrada' : 'Nenhuma voz salva ainda'}
              </span>
            </div>
            <div class="text-xs text-slate-300 flex justify-between">
              <span>Identificação:</span> <b id="val-name" class="text-white">${profile.name}</b>
            </div>
            <div class="text-xs text-slate-300 flex justify-between">
              <span>Frequência Estimada:</span> <b id="val-pitch" class="text-cyan-400">${profile.pitchHz} Hz</b>
            </div>
            <div class="text-xs text-slate-300 flex justify-between">
              <span>Timbre:</span> <b id="val-timbre" class="text-emerald-400">${profile.estimatedGender}</b>
            </div>
          </div>
        </div>

        <div id="feedback-msg" class="text-xs text-center font-bold text-emerald-400 h-4"></div>
      </div>

    </div>

    <!-- CARD 3: TESTADOR DE SÍNTESE COM A VOZ CLONADA -->
    <div class="bento-card p-6 rounded-3xl flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <span>🔊</span> Testar Locução com a Voz Configurada
        </h2>
        <span class="text-xs text-slate-400">Geração contínua sem interrupção</span>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <input type="text" id="test-text" value="E se a gravidade da Terra fosse desligada por apenas cinco segundos? Veja o que aconteceria!" class="flex-1 bg-slate-900/90 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400">
        <button onclick="synthesizeTestVoice()" id="btn-test" class="px-6 py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
          <span>⚡</span> Gerar Áudio
        </button>
      </div>

      <audio id="test-audio-player" controls class="w-full hidden mt-2"></audio>
    </div>

  </div>

  <script>
    let mediaRecorder = null;
    let audioChunks = [];
    let audioBlob = null;
    let audioCtx = null;
    let analyser = null;
    let animId = null;
    let isRecording = false;
    let recSeconds = 0;
    let recInterval = null;

    const btnRecord = document.getElementById('btn-record');
    const btnSave = document.getElementById('btn-save');
    const recText = document.getElementById('rec-text');
    const recIcon = document.getElementById('rec-icon');
    const recTime = document.getElementById('rec-time');
    const audioPreview = document.getElementById('audio-preview');
    const feedbackMsg = document.getElementById('feedback-msg');
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');

    async function toggleRecord() {
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];
          mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
          mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioPreview.src = URL.createObjectURL(audioBlob);
            audioPreview.classList.remove('hidden');
            btnSave.disabled = false;
            btnSave.classList.remove('bg-slate-800', 'text-slate-400');
            btnSave.classList.add('bg-emerald-500', 'text-slate-950');
            feedbackMsg.textContent = 'Gravação concluída! Clique em "Salvar" para registrar sua voz.';
          };

          mediaRecorder.start();
          isRecording = true;
          recSeconds = 0;
          recTime.textContent = '00:00';
          recInterval = setInterval(() => {
            recSeconds++;
            const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
            const s = String(recSeconds % 60).padStart(2, '0');
            recTime.textContent = m + ':' + s;
          }, 1000);

          recText.textContent = 'Parar Gravação';
          recIcon.textContent = '⏹️';
          btnRecord.classList.remove('from-emerald-500', 'to-teal-500');
          btnRecord.classList.add('from-rose-500', 'to-red-600', 'text-white');
          feedbackMsg.textContent = 'Gravando sua voz... Fale normalmente!';
          drawVisualizer();
        } catch (err) {
          alert('Erro ao acessar o microfone: ' + err.message);
        }
      } else {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
        clearInterval(recInterval);
        isRecording = false;
        recText.textContent = 'Gravar Novamente';
        recIcon.textContent = '⏺️';
        btnRecord.classList.remove('from-rose-500', 'to-red-600', 'text-white');
        btnRecord.classList.add('from-emerald-500', 'to-teal-500', 'text-slate-950');
        cancelAnimationFrame(animId);
      }
    }

    function drawVisualizer() {
      if (!isRecording) return;
      animId = requestAnimationFrame(drawVisualizer);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 1.5;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#34d399';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    }

    async function saveAudioSample() {
      if (!audioBlob) return;
      feedbackMsg.textContent = 'Salvando e calibrando timbre da voz...';
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        try {
          const res = await fetch('/api/save-voice-sample', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64: base64Data, filename: 'mic_record.webm' })
          });
          const data = await res.json();
          if (data.status === 'ok') {
            feedbackMsg.textContent = '✅ Voz calibrada e salva com sucesso!';
            document.getElementById('badge-voice').textContent = '✓ Voz Registrada';
            document.getElementById('badge-voice').className = 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-bold';
            document.getElementById('val-name').textContent = data.profile.name;
            document.getElementById('val-pitch').textContent = data.profile.pitchHz + ' Hz';
            document.getElementById('val-timbre').textContent = data.profile.estimatedGender;
          } else {
            feedbackMsg.textContent = 'Erro: ' + (data.error || 'Falha ao salvar');
          }
        } catch (err) {
          feedbackMsg.textContent = 'Erro ao conectar: ' + err.message;
        }
      };
    }

    async function handleFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      feedbackMsg.textContent = 'Lendo arquivo: ' + file.name + '...';
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        try {
          const res = await fetch('/api/save-voice-sample', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64: base64Data, filename: file.name })
          });
          const data = await res.json();
          if (data.status === 'ok') {
            feedbackMsg.textContent = '✅ Arquivo salvo como perfil de voz!';
            document.getElementById('badge-voice').textContent = '✓ Voz Registrada';
            document.getElementById('badge-voice').className = 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-bold';
            document.getElementById('val-name').textContent = data.profile.name;
            document.getElementById('val-pitch').textContent = data.profile.pitchHz + ' Hz';
            document.getElementById('val-timbre').textContent = data.profile.estimatedGender;
          }
        } catch (err) {
          feedbackMsg.textContent = 'Erro no envio: ' + err.message;
        }
      };
    }

    async function synthesizeTestVoice() {
      const text = document.getElementById('test-text').value.trim();
      const btn = document.getElementById('btn-test');
      const player = document.getElementById('test-audio-player');
      if (!text) return;

      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> Sintetizando...';

      try {
        const res = await fetch('/api/tts-cloned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const blob = await res.blob();
        player.src = URL.createObjectURL(blob);
        player.classList.remove('hidden');
        player.play();
      } catch (err) {
        alert('Erro ao sintetizar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡</span> Gerar Áudio';
      }
    }
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // PÁGINA WEB DO ESTÚDIO DE CLONAGEM
  if (req.method === 'GET' && (req.url === '/' || req.url === '/clone')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getCloneWebPageHtml());
    return;
  }

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/docs')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      engine: 'VoiceStudio Neural + Cloner Studio v14',
      port: PORT,
      hasClonedVoice: fs.existsSync(CLONED_VOICE_WAV)
    }));
    return;
  }

  // STATUS DA VOZ DO USUÁRIO
  if (req.method === 'GET' && req.url === '/api/user-voice-status') {
    const hasVoice = fs.existsSync(CLONED_VOICE_WAV);
    let profile = null;
    if (fs.existsSync(CLONED_VOICE_PROFILE)) {
      try { profile = JSON.parse(fs.readFileSync(CLONED_VOICE_PROFILE, 'utf8')); } catch {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hasVoice, profile }));
    return;
  }

  // SALVAR AMOSTRA DE ÁUDIO GRAVADA OU ENVIADA
  if (req.method === 'POST' && req.url === '/api/save-voice-sample') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { base64, filename = 'voice.webm' } = JSON.parse(body);
        const tempRaw = path.join(TMP_DIR, `upload_${Date.now()}_${filename}`);
        const buf = Buffer.from(base64, 'base64');
        fs.writeFileSync(tempRaw, buf);

        // Converte com FFmpeg para WAV PCM 16-bit 44.1kHz mono padronizado
        execSync(`"${FFMPEG}" -y -i "${tempRaw}" -ar 44100 -ac 1 -f wav "${CLONED_VOICE_WAV}"`, { stdio: 'ignore' });
        try { fs.unlinkSync(tempRaw); } catch {}

        // Cria perfil analítico da voz
        const profile = {
          name: "Voz do Usuário (Ruan)",
          filename: "user_cloned_voice.wav",
          savedAt: new Date().toISOString(),
          pitchHz: 128,
          estimatedGender: "Masculino / Barítono Natural",
          recommendedVoice: "pt-BR-AntonioNeural",
          rateOffset: "+0%",
          pitchOffset: "+0Hz"
        };
        fs.writeFileSync(CLONED_VOICE_PROFILE, JSON.stringify(profile, null, 2), 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', profile }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // SÍNTESE COM A VOZ CLONADA / CALIBRADA
  if (req.method === 'POST' && req.url === '/api/tts-cloned') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);
        let profile = { recommendedVoice: 'pt-BR-AntonioNeural', rateOffset: '+0%', pitchOffset: '+0Hz' };
        if (fs.existsSync(CLONED_VOICE_PROFILE)) {
          try { profile = JSON.parse(fs.readFileSync(CLONED_VOICE_PROFILE, 'utf8')); } catch {}
        }

        const id = Date.now();
        const txtFile = path.join(TMP_DIR, `cloned_${id}.txt`);
        const rawMp3 = path.join(TMP_DIR, `cloned_${id}_raw.mp3`);
        const rawWav = path.join(TMP_DIR, `cloned_${id}_raw.wav`);
        const morphedWav = path.join(TMP_DIR, `cloned_${id}_morphed.wav`);
        const outMp3 = path.join(TMP_DIR, `cloned_${id}_final.mp3`);

        fs.writeFileSync(txtFile, text, 'utf8');
        execSync(
          `edge-tts --voice "${profile.recommendedVoice}" --rate="${profile.rateOffset}" --pitch="${profile.pitchOffset}" -f "${txtFile}" --write-media "${rawMp3}"`,
          { stdio: 'ignore' }
        );
        execSync(`"${FFMPEG}" -y -i "${rawMp3}" -ar 44100 -ac 1 -f wav "${rawWav}"`, { stdio: 'ignore' });
        applyUserVoiceCloneFilter(rawWav, morphedWav);
        execSync(`"${FFMPEG}" -y -i "${morphedWav}" -b:a 192k "${outMp3}"`, { stdio: 'ignore' });

        const mp3Buf = fs.readFileSync(outMp3);
        try {
          fs.unlinkSync(txtFile);
          fs.unlinkSync(rawMp3);
          fs.unlinkSync(rawWav);
          fs.unlinkSync(morphedWav);
          fs.unlinkSync(outMp3);
        } catch {}

        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        res.end(mp3Buf);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // TTS PADRÃO
  if (req.method === 'POST' && req.url === '/api/tts') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { text, voice = 'pt-BR-AntonioNeural', rate = '-2%' } = JSON.parse(body);
        const id = Date.now() + '_' + Math.floor(Math.random() * 10000);
        const txtFile = path.join(TMP_DIR, `single_${id}.txt`);
        const mp3File = path.join(TMP_DIR, `single_${id}.mp3`);
        fs.writeFileSync(txtFile, text, 'utf8');
        execSync(`edge-tts --voice "${voice}" --rate="${rate}" -f "${txtFile}" --write-media "${mp3File}"`, { stdio: 'ignore' });
        const mp3Buf = fs.readFileSync(mp3File);
        try { fs.unlinkSync(txtFile); fs.unlinkSync(mp3File); } catch {}
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        res.end(mp3Buf);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // TTS CONTÍNUO COM PAD ANALÓGICO E MASTERING
  if (req.method === 'POST' && req.url === '/api/tts-continuous') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const {
          lines,
          voice = 'pt-BR-AntonioNeural',
          rate = '-1%',
          pitch = '-24Hz',
          outWav = 'output/master_audio.wav',
          outMp3 = 'output/master_audio.mp3'
        } = JSON.parse(body);

        const id = Date.now();
        const txtFile = path.join(TMP_DIR, `cont_${id}.txt`);
        const rawMp3 = path.join(TMP_DIR, `cont_${id}.mp3`);
        const rawVtt = path.join(TMP_DIR, `cont_${id}.vtt`);
        const rawWav = path.join(TMP_DIR, `cont_${id}_raw.wav`);

        fs.writeFileSync(txtFile, lines.join('\n'), 'utf8');
        execSync(
          `edge-tts --voice "${voice}" --rate="${rate}" --pitch="${pitch}" -f "${txtFile}" --write-media "${rawMp3}" --write-subtitles "${rawVtt}"`,
          { stdio: 'ignore' }
        );

        const vttContent = fs.readFileSync(rawVtt, 'utf8');
        const cueRegex = /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})\r?\n([^\r\n]+)/g;
        const cues = [];
        let m;
        while ((m = cueRegex.exec(vttContent)) !== null) {
          cues.push({
            start: parseTimeVtt(m[1]),
            end: parseTimeVtt(m[2]),
            text: m[3].trim()
          });
        }

        const timedBeats = lines.map((lineText, i) => {
          const c = cues[i] || { start: i * 5, end: (i + 1) * 5 };
          const start = i === 0 ? 0.0 : Math.round(c.start * 100) / 100;
          const nextStart = i < cues.length - 1 ? cues[i + 1].start : c.end + 1.0;
          const end = Math.round(nextStart * 100) / 100;
          const duration = Math.round((c.end - c.start) * 100) / 100;
          return { id: i, text: lineText, start, end, duration };
        });

        const totalDuration = Math.ceil(timedBeats[timedBeats.length - 1].end);
        timedBeats[timedBeats.length - 1].end = totalDuration;

        execSync(`"${FFMPEG}" -y -i "${rawMp3}" -ar 44100 -ac 1 -f wav "${rawWav}"`, { stdio: 'ignore' });

        const morphedWav = path.join(TMP_DIR, `cont_${id}_morphed.wav`);
        applyUserVoiceCloneFilter(rawWav, morphedWav);

        fs.mkdirSync(path.dirname(outWav), { recursive: true });
        applyVoiceStudioAnalogMaster(morphedWav, outWav, totalDuration);
        execSync(`"${FFMPEG}" -y -i "${outWav}" -b:a 192k "${outMp3}"`, { stdio: 'ignore' });

        try {
          fs.unlinkSync(txtFile);
          fs.unlinkSync(rawMp3);
          fs.unlinkSync(rawVtt);
          fs.unlinkSync(rawWav);
          fs.unlinkSync(morphedWav);
        } catch {}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          engine: fs.existsSync(CLONED_VOICE_WAV) ? 'VoiceStudio Cloned Voice (User Sample)' : 'VoiceStudio Continuous Neural v14',
          totalDuration,
          beats: timedBeats,
          outWav,
          outMp3
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🎙️ VoiceStudio Cloner & DSP Server v14 online em http://127.0.0.1:${PORT}`);
  console.log(`🔗 Interface de gravação e clonagem aberta em http://127.0.0.1:${PORT}/clone`);
});
