import { mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';
import ffmpegPath from 'ffmpeg-static';

const timing = JSON.parse(readFileSync(join('src', 'schrodingerLivingRoomTiming.json'), 'utf8'));

const TOTAL_DURATION = timing.totalDuration || 71.0;
const CAPTURE_FPS = 20;
const TOTAL_FRAMES = Math.floor(TOTAL_DURATION * CAPTURE_FPS); // 1420 frames
const BATCH_SIZE = 20;
const OUT_DIR = join('output', 'frames_living_room');
const AUDIO_FILE = join('output', 'schrodinger_living_room_audio.wav');
const FINAL_VIDEO = join('output', 'video-gato-schrodinger.mp4');
const ARTIFACT_VIDEO = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/video-gato-schrodinger.mp4';
const CDP_URL = 'http://127.0.0.1:9222/json/list';

async function main() {
  console.log('\n========================================================================');
  console.log(`🎬 RENDERIZADOR 3D FINAL — O GATO DE SCHRÖDINGER NA SALA DE ESTAR`);
  console.log(`   Duração: ${TOTAL_DURATION}s | Frames: ${TOTAL_FRAMES} @ ${CAPTURE_FPS} fps (HD 720x1280)`);
  console.log('========================================================================\n');

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), 'chrome-cdp-living-room-render');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:5174/quantum-cat.html?capture=1'
  ], { stdio: 'ignore' });

  try {
    let target = null;
    for (let i = 0; i < 35; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const tabs = await (await fetch(CDP_URL)).json();
        target = tabs.find(t => t.url && t.url.includes('5174'));
        if (target) break;
      } catch {}
    }
    if (!target) throw new Error('Aba 5174 não encontrada no CDP!');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, rej) => { ws.onopen = r; ws.onerror = rej; });

    let id = 0;
    const send = (method, params = {}) => new Promise((resolve) => {
      const cmdId = ++id;
      const h = (ev) => {
        const d = JSON.parse(ev.data);
        if (d.id === cmdId) { ws.removeEventListener('message', h); resolve(d.result); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: cmdId, method, params }));
    });

    await send('Page.reload', { ignoreCache: true });
    await new Promise(r => setTimeout(r, 2200));

    // Ajustar métricas do dispositivo para 720x1280 HD
    await send('Emulation.setDeviceMetricsOverride', {
      width: 720,
      height: 1280,
      deviceScaleFactor: 1,
      mobile: true
    });

    console.log(`Iniciando captura em lotes: ${TOTAL_FRAMES} frames em 720x1280 HD...`);
    const t0 = Date.now();

    for (let batchStart = 0; batchStart < TOTAL_FRAMES; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_FRAMES);

      for (let f = batchStart; f < batchEnd; f++) {
        const time = f / CAPTURE_FPS;
        await send('Runtime.evaluate', {
          expression: `(() => {
            if (window.renderDeterministicFrame) {
              window.renderDeterministicFrame(${time});
            }
            return true;
          })()`,
          returnByValue: true
        });

        const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 95 });
        const buf = Buffer.from(shot.data, 'base64');
        const filename = join(OUT_DIR, `frame_${String(f).padStart(5, '0')}.jpg`);
        await writeFile(filename, buf);
      }

      if (batchEnd % 140 === 0 || batchEnd === TOTAL_FRAMES) {
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        const pct = ((batchEnd / TOTAL_FRAMES) * 100).toFixed(0);
        console.log(`[${pct}%] ${batchEnd}/${TOTAL_FRAMES} frames capturados (${elapsed}s)...`);
      }
    }

    ws.close();
    console.log(`✓ Captura WebGL 100% concluída em ${((Date.now() - t0) / 1000).toFixed(1)}s.`);

    // Codificação H.264 HD + Mixagem do Áudio Master
    console.log('🎥 Codificando vídeo MP4 HD 720x1280 @ 30fps (H.264 / AAC 192k)...');
    const FFMPEG = ffmpegPath || 'ffmpeg';

    await new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG, [
        '-y',
        '-r', String(CAPTURE_FPS),
        '-i', join(OUT_DIR, 'frame_%05d.jpg'),
        '-i', AUDIO_FILE,
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '17',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        FINAL_VIDEO
      ], { stdio: 'inherit' });

      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg falhou com código ${code}`));
      });
    });

    console.log(`✓ Vídeo gerado com sucesso: ${FINAL_VIDEO}`);

    copyFileSync(FINAL_VIDEO, ARTIFACT_VIDEO);
    console.log(`✓ Vídeo copiado para os artefatos: ${ARTIFACT_VIDEO}`);

    console.log('🧹 Limpando frames temporários...');
    await rm(OUT_DIR, { recursive: true, force: true });
    console.log('✓ Higiene do repositório concluída com 0 arquivos temporários.');
    console.log('🎉 PROCESSO CONCLUÍDO COM 100% DE SUCESSO!');
  } finally {
    chromeProc.kill();
  }
}

main().catch(err => {
  console.error('Erro na renderização final:', err);
  process.exit(1);
});
