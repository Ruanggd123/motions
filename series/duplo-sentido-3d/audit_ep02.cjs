const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/e783032d-89dc-4f61-b605-6777e8c50978';
const URL = 'http://localhost:8082/ep02-cacetinho-quentinho-3d.html';

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const errors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 432, height: 768 },
      deviceScaleFactor: 2.0
    });
    const page = await context.newPage();
    page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
    });

    await page.goto(URL + '?render=1', { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(350);

    const tlInfo = await page.evaluate(() => {
      const tl = window.EP02_DUPLO_TIMELINE;
      const aud = document.getElementById('masterAudio');
      return {
        duration: tl ? tl.duration : 0,
        beats: tl ? tl.beat_starts : [0, 3.5, 7.5, 12.0, 16.5, 20.5],
        audioSrc: aud ? aud.currentSrc || aud.getAttribute('src') : null,
        dialoguesCount: tl && tl.dialogues ? tl.dialogues.length : 0
      };
    });
    console.log('🎵 Timeline EP02:', JSON.stringify(tlInfo));

    const b = tlInfo.beats;
    const mid = (i, frac = 0.48) => {
      const s = b[i];
      const e = (i + 1 < b.length) ? b[i + 1] : tlInfo.duration;
      return Number((s + (e - s) * frac).toFixed(2));
    };

    const shots = [
      { file: 'duplo_ep02_b1_isca.png', t: mid(0, 0.5) },
      { file: 'duplo_ep02_b2_revelacao.png', t: mid(1, 0.5) },
      { file: 'duplo_ep02_b3_crocante.png', t: mid(2, 0.5) },
      { file: 'duplo_ep02_b4_manteiga.png', t: mid(3, 0.5) },
      { file: 'duplo_ep02_b5_vizinha.png', t: mid(4, 0.5) },
      { file: 'duplo_ep02_b6_cta.png', t: mid(5, 0.55) }
    ];

    for (const s of shots) {
      await page.evaluate((t) => window.renderAt(t), s.t);
      await page.waitForTimeout(80);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, s.file) });
      console.log(`📸 Capturado: ${s.file} @ t=${s.t}s`);
    }
    await context.close();

    const wavStatus = (await fetch('http://localhost:8082/audio/ep02_mix.wav')).status;
    const tlStatus = (await fetch('http://localhost:8082/audio/ep02_timeline.js')).status;
    console.log(`🌐 HTTP check EP02: ep02_mix.wav=${wavStatus}, ep02_timeline.js=${tlStatus}`);
    if (wavStatus !== 200 || tlStatus !== 200) {
      errors.push(`HTTP STATUS FAIL: wav=${wavStatus}, tl=${tlStatus}`);
    }

    if (errors.length > 0) {
      console.error('❌ Erros detectados:', errors);
      process.exitCode = 1;
    } else {
      console.log('✅ Auditoria Playwright Duplo Sentido 3D EP02: 0 erros!');
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error('❌ Erro fatal audit_ep02:', e);
  process.exit(1);
});
