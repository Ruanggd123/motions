/**
 * Renderizador TURBO Multi-Worker GPU (AMD RX 580 D3D11 + 6 Workers Paralelos) — Duplo Sentido 3D
 * Uso: node render_duplo_mp4.cjs --ep04 [--fps=60] [--workers=6]
 * ~15-25x mais rápido que SwiftShader single-thread!
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const FFMPEG = 'C:\\Ruan Gomes\\Desktop\\projetos\\motions\\motions\\voicestudio\\.venv\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe';
const FFMPEG_ALT = path.resolve(__dirname, '../../voicestudio/.venv/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe');
const FFMPEG_EXE = fs.existsSync(FFMPEG_ALT) ? FFMPEG_ALT : FFMPEG;

const OUT_DIR = path.join(__dirname, 'output');
const DOWNLOADS_DIR = 'C:/Users/Ruan Gomes/Downloads';

const EPISODES = [
  {
    name: 'ep01',
    url: 'http://localhost:8082/ep01-pinto-gigante-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep01_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep01_pinto_gigante.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep01_pinto_gigante.mp4'),
    tlVar: 'EP01_DUPLO_TIMELINE'
  },
  {
    name: 'ep02',
    url: 'http://localhost:8082/ep02-lampada-genio-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep02_genio_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep02_lampada_genio.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep02_lampada_genio.mp4'),
    tlVar: 'EP02_GENIO_TIMELINE'
  },
  {
    name: 'ep03',
    url: 'http://localhost:8082/ep03-periquito-vizinha-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep03_periquito_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep03_periquito_vizinha.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep03_periquito_vizinha.mp4'),
    tlVar: 'EP03_PERIQUITO_TIMELINE'
  },
  {
    name: 'ep04',
    url: 'http://localhost:8082/ep04-mandioca-feira-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep04_mandioca_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep04_mandioca_feira.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep04_mandioca_feira.mp4'),
    tlVar: 'EP04_MANDIOCA_TIMELINE'
  },
  {
    name: 'ep05',
    url: 'http://localhost:8082/ep05-mangueira-oficina-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep05_mangueira_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep05_mangueira_oficina.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep05_mangueira_oficina.mp4'),
    tlVar: 'EP05_MANGUEIRA_TIMELINE'
  },
  {
    name: 'ep06',
    url: 'http://localhost:8082/ep06-barra-academia-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep06_academia_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep06_barra_academia.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep06_barra_academia.mp4'),
    tlVar: 'EP06_ACADEMIA_TIMELINE'
  },
  {
    name: 'ep07',
    url: 'http://localhost:8082/ep07-linguica-churrasco-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep07_churrasco_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep07_linguica_churrasco.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep07_linguica_churrasco.mp4'),
    tlVar: 'EP07_CHURRASCO_TIMELINE'
  },
  {
    name: 'ep08',
    url: 'http://localhost:8082/ep08-coco-praia-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep08_coco_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep08_coco_praia.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep08_coco_praia.mp4'),
    tlVar: 'EP08_COCO_TIMELINE'
  },
  {
    name: 'ep09',
    url: 'http://localhost:8082/ep09-cano-cozinha-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep09_cano_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep09_cano_cozinha.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep09_cano_cozinha.mp4'),
    tlVar: 'EP09_CANO_TIMELINE'
  },
  {
    name: 'ep10',
    url: 'http://localhost:8082/ep10-saco-mercado-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep10_mercado_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep10_saco_mercado.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep10_saco_mercado.mp4'),
    tlVar: 'EP10_MERCADO_TIMELINE'
  },
  {
    name: 'ep11',
    url: 'http://localhost:8082/ep11-bolo-forno-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep11_bolo_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep11_bolo_forno.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep11_bolo_forno.mp4'),
    tlVar: 'EP11_BOLO_TIMELINE'
  },
  {
    name: 'ep12',
    url: 'http://localhost:8082/ep12-pneu-garagem-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep12_pneu_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep12_pneu_garagem.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep12_pneu_garagem.mp4'),
    tlVar: 'EP12_PNEU_TIMELINE'
  },
  {
    name: 'ep13',
    url: 'http://localhost:8082/ep13-colchao-sala-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep13_colchao_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep13_colchao_sala.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep13_colchao_sala.mp4'),
    tlVar: 'EP13_COLCHAO_TIMELINE'
  },
  {
    name: 'ep14',
    url: 'http://localhost:8082/ep14-furadeira-parede-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep14_furadeira_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep14_furadeira_parede.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep14_furadeira_parede.mp4'),
    tlVar: 'EP14_FURADEIRA_TIMELINE'
  },
  {
    name: 'ep15',
    url: 'http://localhost:8082/ep15-sorvete-casquinha-3d.html?render=1',
    audio: path.join(__dirname, 'audio', 'ep15_sorvete_mix.wav'),
    out: path.join(OUT_DIR, 'duplo_sentido_ep15_sorvete_casquinha.mp4'),
    dl: path.join(DOWNLOADS_DIR, 'duplo_sentido_ep15_sorvete_casquinha.mp4'),
    tlVar: 'EP15_SORVETE_TIMELINE'
  }
];

function runFFmpeg(args, label) {
  return new Promise((res, rej) => {
    const p = spawn(FFMPEG_EXE, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d.toString(); });
    p.on('close', (code) => (code === 0 ? res() : rej(new Error(`${label} exit ${code}: ${err.slice(-400)}`))));
  });
}

async function renderChunk(browser, ep, workerId, startF, endF, fps, chunkPath, progress) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(ep.url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(180);

  const ff = spawn(FFMPEG_EXE, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(fps),
    '-i', 'pipe:0',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-vf', 'format=yuv420p',
    '-pix_fmt', 'yuv420p',
    '-g', String(fps),
    chunkPath
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let ffErr = '';
  ff.stderr.on('data', (d) => { ffErr += d.toString(); });

  for (let f = startF; f < endF; f++) {
    const t = f / fps;
    await page.evaluate((ts) => window.renderAt(ts), t);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 94 });
    const buf = Buffer.from(data, 'base64');
    if (!ff.stdin.write(buf)) {
      await new Promise((res) => ff.stdin.once('drain', res));
    }
    progress.done++;
    if (progress.done % 250 === 0 || progress.done === progress.total) {
      const elapsed = (Date.now() - progress.t0) / 1000;
      const effFps = progress.done / Math.max(0.1, elapsed);
      const pct = Math.round((progress.done / progress.total) * 100);
      console.log(`  ⚡ [${ep.name}] ${progress.done}/${progress.total} (${pct}%) | ${effFps.toFixed(1)} fps efetivos | ${elapsed.toFixed(1)}s`);
    }
  }
  ff.stdin.end();

  await new Promise((res, rej) => {
    ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`Chunk ${workerId} exit ${code}: ${ffErr.slice(-400)}`))));
  });
  await ctx.close();
}

async function renderEpisode(browser, ep, fps, workers) {
  const probeCtx = await browser.newContext({ viewport: { width: 360, height: 640 } });
  const probePage = await probeCtx.newPage();
  await probePage.goto(ep.url, { waitUntil: 'load', timeout: 45000 });
  const duration = await probePage.evaluate((v) => (window[v] && window[v].duration) || 35.0, ep.tlVar);
  const glInfo = await probePage.evaluate(() => {
    const c = document.createElement('canvas').getContext('webgl');
    if (!c) return 'none';
    const e = c.getExtension('WEBGL_debug_renderer_info');
    return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : c.getParameter(c.RENDERER);
  });
  await probeCtx.close();

  const totalFrames = Math.ceil(duration * fps);
  const numWorkers = Math.min(workers, Math.max(1, Math.floor(totalFrames / 60)));
  console.log(`🚀 [${ep.name}] TURBO GPU Render: ${totalFrames} frames @ ${fps}fps (${duration}s) | ${numWorkers} workers | GL: ${glInfo}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `duplo_${ep.name}_`));
  const chunkPaths = [];
  const tasks = [];
  const progress = { done: 0, total: totalFrames, t0: Date.now() };

  const perWorker = Math.ceil(totalFrames / numWorkers);
  for (let w = 0; w < numWorkers; w++) {
    const startF = w * perWorker;
    const endF = Math.min(totalFrames, startF + perWorker);
    if (startF >= endF) break;
    const chunkPath = path.join(tmpDir, `chunk_${w}.mp4`);
    chunkPaths.push(chunkPath);
    tasks.push(renderChunk(browser, ep, w, startF, endF, fps, chunkPath, progress));
  }

  await Promise.all(tasks);

  const listFile = path.join(tmpDir, 'chunks.txt');
  fs.writeFileSync(listFile, chunkPaths.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

  await runFFmpeg([
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-i', ep.audio,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    ep.out
  ], 'Concat+Mux');

  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.copyFileSync(ep.out, ep.dl);
  const totalSec = ((Date.now() - progress.t0) / 1000).toFixed(1);
  const mb = (fs.statSync(ep.out).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ [${ep.name}] FINALIZADO em ${totalSec}s! (${mb} MB) -> ${ep.dl}`);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const epArgs = process.argv.filter((a) => /^--ep\d{2}$/.test(a));
  const fpsArg = process.argv.find((a) => a.startsWith('--fps='));
  const workersArg = process.argv.find((a) => a.startsWith('--workers='));
  const fps = fpsArg ? Math.max(24, parseInt(fpsArg.split('=')[1], 10) || 60) : 60;
  const workers = workersArg ? Math.max(1, parseInt(workersArg.split('=')[1], 10) || 6) : 6;

  const targets = epArgs.length > 0 ? EPISODES.filter((e) => epArgs.includes('--' + e.name)) : EPISODES;
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  try {
    for (const ep of targets) {
      await renderEpisode(browser, ep, fps, workers);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error('❌ Erro fatal render_duplo_mp4:', e);
  process.exit(1);
});
