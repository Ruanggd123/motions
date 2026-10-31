import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const timing = JSON.parse(readFileSync(join('src', 'schrodingerLivingRoomTiming.json'), 'utf8'));
const CDP_URL = 'http://127.0.0.1:9222/json/list';
const STILLS_DIR = join('output', 'stills_living_room_audit');
const ARTIFACT_STILLS_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/stills_living_room';

async function main() {
  console.log('========================================================================');
  console.log('🔍 AUDITORIA VISUAL DE BEATS 3D — SALA DE ESTAR & GATO DE SCHRÖDINGER');
  console.log('========================================================================\n');

  await mkdir(STILLS_DIR, { recursive: true });
  await mkdir(ARTIFACT_STILLS_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), 'chrome-cdp-living-room-audit');
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

    // Configurar viewport vertical 720x1280
    await send('Emulation.setDeviceMetricsOverride', {
      width: 720,
      height: 1280,
      deviceScaleFactor: 1,
      mobile: true
    });

    console.log('✓ Conexão CDP estabelecida com sucesso.');

    for (const b of timing.beats) {
      const midTime = (b.start + b.end) / 2;

      await send('Runtime.evaluate', {
        expression: `(() => {
          if (window.renderDeterministicFrame) {
            window.renderDeterministicFrame(${midTime});
          }
          return true;
        })()`,
        returnByValue: true
      });

      // Aguarda 100ms para layout dos pins HTML
      await new Promise(r => setTimeout(r, 120));

      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      const imgBuffer = Buffer.from(screenshot.data, 'base64');
      const filename = `beat_${b.id + 1}_audit.png`;
      const localPath = join(STILLS_DIR, filename);
      const artifactPath = join(ARTIFACT_STILLS_DIR, filename);

      await writeFile(localPath, imgBuffer);
      await writeFile(artifactPath, imgBuffer);

      console.log(`[Beat ${(b.id + 1).toString().padStart(2)}] ${b.start.toFixed(1)}s - ${b.end.toFixed(1)}s | ${(imgBuffer.length / 1024).toFixed(1)} KB | "${b.text.slice(0, 38)}..." ✓`);
    }

    console.log('\n========================================================================');
    console.log(`✅ TODOS OS 12 BEATS AUDITADOS E SALVOS COM SUCESSO!`);
    console.log(`   Pasta local: ${STILLS_DIR}`);
    console.log(`   Pasta de artefatos: ${ARTIFACT_STILLS_DIR}`);
    console.log('========================================================================\n');

    ws.close();
  } finally {
    try { chromeProc.kill(); } catch {}
  }
}

main().catch(err => {
  console.error('Erro na auditoria visual dos beats:', err);
  process.exit(1);
});
