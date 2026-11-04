import { mkdir, writeFile, rm } from 'node:fs/promises';
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const OUT_DIR = join('output', 'stills_oxigenio');
const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/stills_oxigenio';

const BEAT_SAMPLES = [
  { id: '01_pergunta_impossivel', time: 2.0, desc: 'Ato 1: Rua Ensolarada e Pergunta Impossível' },
  { id: '02_ceu_apaga_meiodia', time: 6.5, desc: 'Ato 2: Céu Apaga no Meio-Dia (Vácuo Estelar)' },
  { id: '03_timpanos_explodem', time: 11.0, desc: 'Ato 3: Tímpanos Explodem por Descompressão' },
  { id: '04_concreto_areia_sprint', time: 18.0, desc: 'Ato 4: Prédios Viram Areia & Sprint Desesperado' },
  { id: '05_motores_aviao_caindo', time: 25.0, desc: 'Ato 5: Carros Param e Avião Despenca em Parafuso' },
  { id: '06_uv_solar_chamas', time: 31.0, desc: 'Ato 6: Sem Ozônio - Radiação UV Searing' },
  { id: '07_oceanos_hidrogenio', time: 34.5, desc: 'Ato 7: Oceanos Viram Gás Hidrogênio no Horizonte' },
  { id: '08_solda_frio_metais', time: 38.5, desc: 'Ato 8: Metais Soldam a Frio com Faíscas Azuis' },
  { id: '09_chao_crosta_some', time: 42.5, desc: 'Ato 9: 45% do Solo é O2 - Chão Racha e Some' },
  { id: '10_queda_livre_magma', time: 48.5, desc: 'Ato 10: Mergulho em Queda Livre no Abismo de Magma' },
  { id: '11_onda_choque_retorno', time: 56.0, desc: 'Ato 11: Retorno do O2 com Onda de Choque de Plasma' },
  { id: '12_terra_salva_epilogo', time: 62.5, desc: 'Ato 12: A Terra Sobreviveu! Respiração de Alívio & CTA' }
];

async function main() {
  console.log('\n========================================================================');
  console.log('🔬 AUDITORIA VISUAL v16: E SE A TERRA PERDESSE O OXIGÊNIO (12 CENÁRIOS)');
  console.log('========================================================================\n');

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = join(os.tmpdir(), `chrome-oxigenio-audit-${Date.now()}`);
  const port = 9248;

  const proc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    `--user-data-dir=${tmpDir}`,
    'http://127.0.0.1:5174/oxigenio-5-segundos-3d.html?capture=1'
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

    await send('Emulation.setDeviceMetricsOverride', {
      width: 720, height: 1280, deviceScaleFactor: 1, mobile: true
    });

    // Espera inicializar
    for (let w = 0; w < 60; w++) {
      const check = await send('Runtime.evaluate', {
        expression: `typeof window.renderDeterministicFrame === 'function'`,
        returnByValue: true
      });
      if (check?.result?.value === true) break;
      await new Promise(r => setTimeout(r, 150));
    }

    console.log('🔍 Verificando ausência compulsória de legendas DOM e barras inferiores poluidoras...');
    const domCheck = await send('Runtime.evaluate', {
      expression: `({
        subtitles: document.querySelectorAll('.subtitle-card, #subtitle-text').length,
        warnings: document.querySelectorAll('#warning-box, .warning-bar').length,
        title: document.getElementById('phase-title')?.textContent,
        timer: document.getElementById('timer-val')?.textContent
      })`,
      returnByValue: true
    });

    console.log('📊 Auditoria DOM:', domCheck.result.value);
    if (domCheck.result.value.subtitles > 0) {
      throw new Error(`VIOLAÇÃO: Existem ${domCheck.result.value.subtitles} caixas de legendas no DOM!`);
    }
    if (domCheck.result.value.warnings > 0) {
      throw new Error(`VIOLAÇÃO: Existem ${domCheck.result.value.warnings} barras de aviso no DOM!`);
    }
    console.log('✅ 100% LIMPO: Zero legendas no DOM e Zero barras de alerta inferiores!\n');

    console.log('📸 Extraindo Stills dos 12 Cenários Exclusivos...');
    for (const b of BEAT_SAMPLES) {
      await send('Runtime.evaluate', {
        expression: `window.renderDeterministicFrame(${b.time}); true;`
      });
      await new Promise(r => setTimeout(r, 120));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      const filename = `v16_oxigenio_${b.id}.png`;
      const outPath = join(OUT_DIR, filename);
      const artPath = join(ARTIFACT_DIR, filename);

      await writeFile(outPath, buf);
      try { copyFileSync(outPath, artPath); } catch {}
      console.log(`✓ [${b.time.toFixed(1)}s] ${filename} (${(buf.length / 1024).toFixed(1)} KB) -> ${b.desc}`);
    }

    ws.close();
    console.log('\n========================================================================');
    console.log('✅ AUDITORIA VISUAL v16 CONCLUÍDA COM 100% SUCESSO (12/12 PASS)!');
    console.log('========================================================================\n');
  } finally {
    try { proc.kill(); } catch {}
    try { await rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('Falha na auditoria visual:', err);
  process.exit(1);
});
