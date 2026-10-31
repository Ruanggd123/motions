import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const timing = JSON.parse(readFileSync('src/gravidadeTiming.json', 'utf8'));
const OUT_DIR = join('output', 'stills_gravity_audit');
const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/stills_gravity';

async function main() {
  console.log('\n========================================================================');
  console.log('🔍 AUDITORIA VISUAL DE BEATS 3D — E SE A GRAVIDADE DESLIGASSE?');
  console.log('========================================================================\n');

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), `chrome-audit-gravity-${Date.now()}`);
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:5174/gravidade-zero-3d.html?capture=1'
  ], { stdio: 'ignore' });

  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 150));
      try {
        const tabs = await (await fetch('http://127.0.0.1:9229/json/list')).json();
        target = tabs.find(t => t.url && t.url.includes('5174'));
        if (target) break;
      } catch {}
    }
    if (!target) throw new Error('Aba 5174 não encontrada na porta 9229');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 0;
    const send = (method, params = {}) => new Promise(resolve => {
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

    for (let w = 0; w < 50; w++) {
      const check = await send('Runtime.evaluate', {
        expression: `typeof window.renderDeterministicFrame === 'function'`,
        returnByValue: true
      });
      if (check?.result?.value === true) break;
      await new Promise(r => setTimeout(r, 150));
    }
    await new Promise(r => setTimeout(r, 300));

    for (const b of timing.beats) {
      const sampleTime = (b.start + b.end) / 2;
      await send('Runtime.evaluate', {
        expression: `window.renderDeterministicFrame(${sampleTime}); true;`
      });
      await new Promise(r => setTimeout(r, 60));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      const fname = `beat_${b.id + 1}_audit.png`;
      const localFile = join(OUT_DIR, fname);
      const artifactFile = join(ARTIFACT_DIR, fname);

      await writeFile(localFile, buf);
      copyFileSync(localFile, artifactFile);
      console.log(`[Beat ${String(b.id + 1).padStart(2, ' ')}] ${b.start.toFixed(1)}s - ${b.end.toFixed(1)}s | ${(buf.length / 1024).toFixed(1)} KB ✓`);
    }

    ws.close();
    console.log('\n✅ Todos os 12 beats do Vídeo #3 (Gravidade Zero) auditados com sucesso!');
  } finally {
    proc.kill();
  }
}

main().catch(err => {
  console.error('Erro na auditoria visual:', err);
  process.exit(1);
});
