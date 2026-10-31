import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const PORT = 8000;
const FFMPEG = ffmpegPath || 'ffmpeg';
const TMP_DIR = path.join(os.tmpdir(), 'voicestudio-local-engine');
fs.mkdirSync(TMP_DIR, { recursive: true });

function parseTimeVtt(ts) {
  const clean = ts.trim().replace(',', '.');
  const parts = clean.split(':');
  return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
}

/**
 * Aplica o DSP analógico do VoiceStudio (C maj9 Documentary Pad + IIR Ducker + Soft-Knee Tanh Limiter)
 * sobre um arquivo WAV PCM 16-bit 44.1kHz mono/stereo.
 */
function applyVoiceStudioAnalogMaster(rawWavPath, outWavPath, totalDurationSec) {
  const SR = 44100;
  const totalSamples = Math.floor(totalDurationSec * SR);
  const buf = fs.readFileSync(rawWavPath);

  // Encontrar chunk 'data' no WAV
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

  // IIR Ducker analógico (Attack 80ms, Release 380ms)
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

  // Pad documental analógico quente (C maj9) + Soft-Knee Limiter (Math.tanh)
  const finalPcm = new Int16Array(totalSamples);
  const f1 = 65.41;  // C2
  const f2 = 98.00;  // G2
  const f3 = 146.83; // D3
  const f4 = 164.81; // E3

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

  // Escrever WAV PCM 16-bit 44.1kHz mono padronizado
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

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/docs')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', engine: 'VoiceStudio Neural + Analog DSP v13', port: PORT }));
    return;
  }

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

  if (req.method === 'POST' && req.url === '/api/tts-continuous') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const {
          lines,
          voice = 'pt-BR-AntonioNeural',
          rate = '-2%',
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
          `edge-tts --voice "${voice}" --rate="${rate}" -f "${txtFile}" --write-media "${rawMp3}" --write-subtitles "${rawVtt}"`,
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

        fs.mkdirSync(path.dirname(outWav), { recursive: true });
        applyVoiceStudioAnalogMaster(rawWav, outWav, totalDuration);
        execSync(`"${FFMPEG}" -y -i "${outWav}" -b:a 192k "${outMp3}"`, { stdio: 'ignore' });

        try {
          fs.unlinkSync(txtFile);
          fs.unlinkSync(rawMp3);
          fs.unlinkSync(rawVtt);
          fs.unlinkSync(rawWav);
        } catch {}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          engine: 'VoiceStudio Continuous Neural + Analog Pad v13',
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
  console.log(`🎙️ VoiceStudio Server v13 online em http://127.0.0.1:${PORT}`);
});
