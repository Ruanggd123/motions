import { mkdir, writeFile } from 'node:fs/promises';
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const OUT_DIR = join('output', 'stills_fighter_showcase');
const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/stills_fighter';

async function main() {
  console.log('\n========================================================================');
  console.log('🔍 AUDITORIA VISUAL DO PERSONAGEM MODULAR COM SISTEMAS DE ÓRGÃOS');
  console.log('========================================================================\n');

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), `chrome-fighter-audit-${Date.now()}`);
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9234',
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    `--user-data-dir=${tmpDir}`,
    'http://127.0.0.1:5174/fighter-showcase.html'
  ], { stdio: 'ignore' });

  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 150));
      try {
        const tabs = await (await fetch('http://127.0.0.1:9234/json/list')).json();
        target = tabs.find(t => t.url && t.url.includes('5174'));
        if (target) break;
      } catch {}
    }
    if (!target) throw new Error('Aba 5174 não encontrada na porta 9234');

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

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 720,
      height: 1280,
      deviceScaleFactor: 1,
      mobile: true
    });

    await new Promise(r => setTimeout(r, 1200));

    const audits = [
      {
        name: 'fighter_1_solid_guard',
        fn: `window.setMode('solid'); window.setPose('guard'); window.setCamera('full');`
      },
      {
        name: 'fighter_2_xray_cardio_lungs',
        fn: `window.setMode('xray-soft'); window.setPresetXRay('cardio'); window.setCamera('chest');`
      },
      {
        name: 'fighter_3_xray_neuro_brain',
        fn: `window.setMode('xray-soft'); window.setPresetXRay('neuro'); window.setCamera('head'); window.setPose('shock');`
      },
      {
        name: 'fighter_4_xray_viscera_digestive',
        fn: `window.setMode('xray-soft'); window.setPresetXRay('visceral'); window.setCamera('viscera'); window.setPose('relaxed');`
      },
      {
        name: 'fighter_5_xray_complete_all',
        fn: `window.setMode('xray-soft'); window.setPresetXRay('all'); window.setCamera('full'); window.setPose('guard');`
      },
      {
        name: 'fighter_6_solid_face_close',
        fn: `window.setMode('solid'); window.setCamera('head'); window.setPose('guard');`
      }
    ];

    for (const a of audits) {
      await send('Runtime.evaluate', { expression: a.fn });
      await new Promise(r => setTimeout(r, 450));

      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(screenshot.data, 'base64');
      const filename = `${a.name}.png`;
      const outPath = join(OUT_DIR, filename);
      const artPath = join(ARTIFACT_DIR, filename);

      await writeFile(outPath, buf);
      copyFileSync(outPath, artPath);
      console.log(`📸 Auditado: ${filename} -> ${outPath}`);
    }

    ws.close();
    console.log('\n✅ Auditoria visual do personagem concluída!');
  } finally {
    try { proc.kill(); } catch {}
  }
}

main().catch(err => {
  console.error('❌ Erro na auditoria visual:', err);
  process.exit(1);
});
