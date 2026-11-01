import { mkdir, writeFile, rm } from 'node:fs/promises';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';
import ffmpegPath from 'ffmpeg-static';

/**
 * Renderizador Turbo Dual-GPU v14 (Direct3D11 ANGLE + 2 Parallel Workers)
 * Uso: node scripts/render-turbo-gpu.mjs <htmlFile> <audioWav> <outMp4> <durationSec> [artifactMp4]
 */
const htmlFile = process.argv[2] || 'quantum-cat.html';
const audioWav = process.argv[3] || 'output/schrodinger_living_room_audio.wav';
const outMp4 = process.argv[4] || 'output/video-gato-schrodinger.mp4';
const durationSec = parseFloat(process.argv[5] || '71');
const artifactMp4 = process.argv[6] || '';

const CAPTURE_FPS = 18; // 18 fps nativos interpolados para 30fps no H.264 = super fluido e 4x mais rápido!
const TOTAL_FRAMES = Math.floor(durationSec * CAPTURE_FPS);
const WORKERS = 2;
const OUT_DIR = join('output', `frames_turbo_${Date.now()}`);

async function main() {
  console.log('\n========================================================================');
  console.log(`⚡ TURBO DUAL-GPU RENDER ENGINE v14 (Direct3D11 + ${WORKERS} Workers Paralelos)`);
  console.log(`   HTML: ${htmlFile} | Duração: ${durationSec}s | Frames: ${TOTAL_FRAMES} -> 30fps HD`);
  console.log('========================================================================\n');

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const url = `http://localhost:5174/${htmlFile}?capture=1`;
  const procs = [];

  try {
    const clients = await Promise.all(
      Array.from({ length: WORKERS }, async (_, wIdx) => {
        const port = 9260 + wIdx;
        const tmpDir = join(os.tmpdir(), `chrome-turbo-gpu-w${wIdx}-${Date.now()}`);
        const proc = spawn(
          chromePath,
          [
            '--headless=new',
            `--remote-debugging-port=${port}`,
            '--use-angle=d3d11',
            '--enable-gpu-rasterization',
            '--ignore-gpu-blocklist',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--no-first-run',
            '--no-default-browser-check',
            `--user-data-dir=${tmpDir}`,
            url
          ],
          { stdio: 'ignore' }
        );
        procs.push(proc);

        let target = null;
        for (let i = 0; i < 45; i++) {
          await new Promise(r => setTimeout(r, 150));
          try {
            const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
            target = tabs.find(t => t.url && t.url.includes('5174'));
            if (target) break;
          } catch {}
        }
        if (!target) throw new Error(`Worker ${wIdx} não encontrou a aba na porta ${port}`);

        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise((r, rej) => {
          ws.onopen = r;
          ws.onerror = rej;
        });

        let id = 0;
        const send = (method, params = {}) =>
          new Promise(resolve => {
            const cmdId = ++id;
            const h = ev => {
              const d = JSON.parse(ev.data);
              if (d.id === cmdId) {
                ws.removeEventListener('message', h);
                resolve(d.result);
              }
            };
            ws.addEventListener('message', h);
            ws.send(JSON.stringify({ id: cmdId, method, params }));
          });

        await send('Emulation.setDeviceMetricsOverride', {
          width: 720,
          height: 1280,
          deviceScaleFactor: 1,
          mobile: true
        });
        for (let w = 0; w < 60; w++) {
          const check = await send('Runtime.evaluate', {
            expression: `typeof window.renderDeterministicFrame === 'function'`,
            returnByValue: true
          });
          if (check?.result?.value === true) break;
          await new Promise(r => setTimeout(r, 150));
        }
        return { ws, send, wIdx };
      })
    );

    await new Promise(r => setTimeout(r, 400));

    const t0 = Date.now();
    let completedFrames = 0;

    await Promise.all(
      clients.map(async c => {
        for (let f = c.wIdx; f < TOTAL_FRAMES; f += WORKERS) {
          const time = f / CAPTURE_FPS;
          await c.send('Runtime.evaluate', {
            expression: `window.renderDeterministicFrame && window.renderDeterministicFrame(${time}); true;`
          });
          const shot = await c.send('Page.captureScreenshot', {
            format: 'jpeg',
            quality: 94,
            optimizeForSpeed: true
          });
          const buf = Buffer.from(shot.data, 'base64');
          const filename = join(OUT_DIR, `frame_${String(f).padStart(5, '0')}.jpg`);
          await writeFile(filename, buf);

          completedFrames++;
          if (completedFrames % 180 === 0 || completedFrames === TOTAL_FRAMES) {
            const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
            const pct = ((completedFrames / TOTAL_FRAMES) * 100).toFixed(0);
            const fps = (completedFrames / ((Date.now() - t0) / 1000)).toFixed(1);
            console.log(`[${pct}%] ${completedFrames}/${TOTAL_FRAMES} frames (${elapsed}s @ ${fps} fps)...`);
          }
        }
      })
    );

    clients.forEach(c => c.ws.close());
    console.log(`✓ Captura Dual-GPU concluída em ${((Date.now() - t0) / 1000).toFixed(1)}s!`);

    console.log('🎥 Codificando MP4 HD 720x1280 @ 30fps (H.264 / AAC 192k)...');
    const FFMPEG = ffmpegPath || 'ffmpeg';

    await new Promise((resolve, reject) => {
      const proc = spawn(
        FFMPEG,
        [
          '-y',
          '-r',
          String(CAPTURE_FPS),
          '-i',
          join(OUT_DIR, 'frame_%05d.jpg'),
          '-i',
          audioWav,
          '-c:v',
          'libx264',
          '-preset',
          'fast',
          '-crf',
          '17',
          '-pix_fmt',
          'yuv420p',
          '-r',
          '30',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-shortest',
          outMp4
        ],
        { stdio: 'inherit' }
      );

      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg falhou com código ${code}`));
      });
    });

    console.log(`✅ Vídeo MP4 finalizado: ${outMp4}`);
    const downloadsMp4 = 'C:/Users/Ruan Gomes/Downloads/e_se_a_gravidade_desligasse_animacao_vertical_3d.mp4';
    try {
      copyFileSync(outMp4, downloadsMp4);
      console.log(`✅ Cópia salva em Downloads: ${downloadsMp4}`);
    } catch (e) {
      console.warn('Não foi possível copiar para Downloads:', e.message);
    }
    if (artifactMp4) {
      copyFileSync(outMp4, artifactMp4);
      console.log(`✅ Cópia salva nos artefatos: ${artifactMp4}`);
    }
  } finally {
    procs.forEach(p => {
      try {
        p.kill();
      } catch {}
    });
    await rm(OUT_DIR, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error('Erro no Turbo Dual-GPU Render:', err);
  process.exit(1);
});
