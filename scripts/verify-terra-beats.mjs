import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const timing = JSON.parse(readFileSync('src/terraTiming.json', 'utf8'));
const OUT_DIR = join('output', 'stills_terra_audit');
const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/stills_terra';

async function main() {
  console.log('\n========================================================================');
  console.log('🔍 AUDITORIA VISUAL DE BEATS 3D — E SE A TERRA PARASSE POR 5 SEGUNDOS?');
  console.log('========================================================================\n');

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), `chrome-audit-terra-${Date.now()}`);
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9246',
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:5174/terra-parou-3d.html'
  ], { stdio: 'ignore' });

  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 150));
      try {
        const tabs = await (await fetch('http://127.0.0.1:9246/json/list')).json();
        target = tabs.find(t => t.url && t.url.includes('5174'));
        if (target) break;
      } catch {}
    }
    if (!target) throw new Error('Aba 5174 não encontrada na porta 9246');

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

    // Amostras para cada beat
    const beatSamples = [
      { beat: 1, time: 2.5, name: 'beat_1_passeio_terra_girando' },
      { beat: 2, time: 8.5, name: 'beat_2_vetor_velocidade_leste' },
      { beat: 3, time: 16.5, name: 'beat_3_parada_subita_inercia_newton' },
      { beat: 4, time: 25.5, name: 'beat_4_ventos_hipersonicos_megatsunami' },
      { beat: 5, time: 34.5, name: 'beat_5_retomada_solavanco_tectonico' },
      { beat: 6, time: 42.0, name: 'beat_6_equilibrio_restaurado_sobrevivemos' }
    ];

    for (const s of beatSamples) {
      await send('Runtime.evaluate', {
        expression: `window.renderDeterministicFrame(${s.time});`
      });
      await new Promise(r => setTimeout(r, 250));

      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(screenshot.data, 'base64');
      const filename = `${s.name}.png`;
      const outPath = join(OUT_DIR, filename);
      const artPath = join(ARTIFACT_DIR, filename);

      await writeFile(outPath, buf);
      copyFileSync(outPath, artPath);
      console.log(`📸 Beat ${s.beat} (${s.time}s) auditado -> ${outPath}`);
    }

    ws.close();
    console.log('\n✅ Auditoria visual dos 6 beats concluída com sucesso!');
  } finally {
    proc.kill();
  }
}

main().catch(err => {
  console.error('❌ Falha na auditoria visual:', err);
  process.exit(1);
});
