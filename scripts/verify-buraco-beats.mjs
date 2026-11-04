import { mkdir, writeFile } from 'node:fs/promises';
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const OUT_DIR = join('output', 'stills_buraco_final');
const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/stills_buraco';

async function main() {
  console.log('\n========================================================================');
  console.log('🌌 AUDITORIA VISUAL v14: BURACO NEGRO GARGANTUA (12 ATOS VIRAL)');
  console.log('========================================================================\n');

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), `chrome-buraco-audit-${Date.now()}`);
  const port = 9235;

  const proc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    `--user-data-dir=${tmpDir}`,
    'http://127.0.0.1:5174/buraco-negro-3d.html?capture=1'
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

    // Aguarda carregar Three.js e cena
    await new Promise(r => setTimeout(r, 1500));

    const audits = [
      { name: 'v14_beat_01_missao_orion', t: 3.5, desc: 'Ato 1: Missão Orion VII & Gargantua ao Fundo' },
      { name: 'v14_beat_02_nave_despedacada', t: 11.0, desc: 'Ato 2: Nave Despedaçada pela Gravidade Extrema' },
      { name: 'v14_beat_03_esfera_fotons_clone', t: 18.5, desc: 'Ato 3: Esfera de Fótons (Clone Óptico de Costas)' },
      { name: 'v14_beat_04_planeta_lava_engolido', t: 26.5, desc: 'Ato 4: Planeta de Lava Desintegrado no Vórtice' },
      { name: 'v14_beat_05_relogios_tempo', t: 34.5, desc: 'Ato 5: Dilatação Temporal (Relógios Holográficos +1s vs +1.000 Anos)' },
      { name: 'v14_beat_06_redshift_fantasma', t: 42.0, desc: 'Ato 6: Redshift Infinito & Fantasma Óptico Congelado' },
      { name: 'v14_beat_07_mare_gravitacional', t: 48.5, desc: 'Ato 7: Anéis de Maré Gravitacional Puxando as Botas' },
      { name: 'v14_beat_08_espaguetificacao', t: 53.0, desc: 'Ato 8: Espaguetificação Extrema do Astronauta e da Nave' },
      { name: 'v14_beat_09_horizonte_eventos', t: 59.5, desc: 'Ato 9: Mergulho no Horizonte de Eventos' },
      { name: 'v14_beat_10_topdown_raiox', t: 65.8, desc: 'Ato 10: Visão Top-Down 50° + Raio-X do Funil Espaço-Tempo' },
      { name: 'v14_beat_11_tesseract_4d', t: 70.2, desc: 'Ato 11: Hipercubo Quântico 4D (Tesseract) & Buraco de Minhoca' },
      { name: 'v14_beat_12_retorno_terra_futuro', t: 77.0, desc: 'Ato 12: Retorno à Órbita da Terra no Futuro & Aceno Vitorioso' }
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
      console.log(`   ✅ Salvo em: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
    }

    ws.close();
    console.log('\n🎉 AUDITORIA VISUAL v14 CONCLUÍDA COM 100% DE SUCESSO!\n');
  } finally {
    proc.kill();
  }
}

main().catch(err => {
  console.error('❌ Falha na auditoria:', err);
  process.exit(1);
});
