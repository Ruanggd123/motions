import { mkdir, writeFile, rm } from 'node:fs/promises';
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const OUT_DIR = join('output', 'stills_estrela_temp');
const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/stills_estrela';

async function main() {
  console.log('\n========================================================================');
  console.log('🧲 AUDITORIA VISUAL v15: ESTRELA DE NÊUTRONS & MAGNETAR (12 CENÁRIOS)');
  console.log('========================================================================\n');

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), `chrome-estrela-audit-${Date.now()}`);
  const port = 9236;

  const proc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    `--user-data-dir=${tmpDir}`,
    'http://127.0.0.1:5174/estrela-neutrons-3d.html?capture=1'
  ], { stdio: 'ignore' });

  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 150));
      try {
        const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        target = tabs.find(t => t.url && t.url.includes('5174'));
        if (target) break;
      } catch {}
    }
    if (!target) throw new Error(`Aba 5174 não encontrada na porta ${port}`);

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    ws.addEventListener('message', ev => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('⚠️ EXCEÇÃO NO BROWSER:', JSON.stringify(msg.params.exceptionDetails));
        }
      } catch {}
    });

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

    for (let w = 0; w < 40; w++) {
      await new Promise(r => setTimeout(r, 200));
      const check = await send('Runtime.evaluate', {
        expression: `typeof window.renderDeterministicFrame === 'function'`
      });
      if (check && check.result && check.result.value === true) break;
    }
    await new Promise(r => setTimeout(r, 800));

    const audits = [
      { name: 'v15_estrela_01_cabine', t: 4.0, desc: 'Ato 1: Cabine 3D da Valkyrie IX & Magnetar à Vista' },
      { name: 'v15_estrela_02_farol_pulsar', t: 12.5, desc: 'Ato 2: Farol Pulsar de 716 Giros/s & Feixes Bipolares' },
      { name: 'v15_estrela_03_desarme_magnetico', t: 20.0, desc: 'Ato 3: Casco da Nave Desmontado pelo Campo de 10^15 Gauss' },
      { name: 'v15_estrela_04_colher_everest', t: 28.0, desc: 'Ato 4: Laboratório 3D (1 Colher de Chá = Monte Everest)' },
      { name: 'v15_estrela_05_estrela_vampira', t: 36.0, desc: 'Ato 5: Estrela Companheira Sendo Vampirizada' },
      { name: 'v15_estrela_06_atomos_agulha', t: 44.0, desc: 'Ato 6: Átomos Esticados como Agulhas Quânticas' },
      { name: 'v15_estrela_07_terremoto_estelar', t: 52.0, desc: 'Ato 7: Terremoto Estelar & Vetores de Gravidade G' },
      { name: 'v15_estrela_08_raios_gama', t: 59.5, desc: 'Ato 8: Super-Explosão de Raios Gama (Magnetar Flare)' },
      { name: 'v15_estrela_09_mergulho_cabine', t: 67.0, desc: 'Ato 9: Retorno à Cabine a 100.000 km/s Rumo à Crosta' },
      { name: 'v15_estrela_10_massa_nuclear_raiox', t: 75.5, desc: 'Ato 10: Visão Top-Down Raio-X da Massa Nuclear' },
      { name: 'v15_estrela_11_kilonova_ouro', t: 84.5, desc: 'Ato 11: Colisão Kilonova Forjando Pepitas de Ouro Puro' },
      { name: 'v15_estrela_12_retorno_terra', t: 92.5, desc: 'Ato 12: Retorno à Órbita da Terra com Tesouro Cósmico' }
    ];

    for (const a of audits) {
      console.log(`📸 Renderizando ${a.desc} (t=${a.t}s)...`);
      await send('Runtime.evaluate', {
        expression: `window.renderDeterministicFrame(${a.t});`
      });

      await new Promise(r => setTimeout(r, 250));

      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(res.data, 'base64');
      const outPath = join(OUT_DIR, `${a.name}.png`);
      const artPath = join(ARTIFACT_DIR, `${a.name}.png`);

      await writeFile(outPath, buf);
      copyFileSync(outPath, artPath);
      console.log(`   ✅ Salvo em: ${artPath} (${(buf.length / 1024).toFixed(1)} KB)`);
    }

    ws.close();
    await rm(OUT_DIR, { recursive: true, force: true });
    console.log('\n🎉 AUDITORIA VISUAL v15 CONCLUÍDA COM 100% DE SUCESSO!\n');
  } finally {
    proc.kill();
  }
}

main().catch(err => {
  console.error('❌ Falha na auditoria:', err);
  process.exit(1);
});
