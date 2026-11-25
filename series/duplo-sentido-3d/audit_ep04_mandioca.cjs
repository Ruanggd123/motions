const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/e783032d-89dc-4f61-b605-6777e8c50978';

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('http://localhost:8082/ep04-mandioca-feira-3d.html?render=1', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(350);

  const info = await page.evaluate(() => {
    const tl = window.EP04_MANDIOCA_TIMELINE || {};
    return {
      duration: tl.duration || 35.0,
      beats: tl.beat_starts || [0, 5.8, 11.0, 16.2, 21.4, 26.6]
    };
  });

  const b = info.beats;
  const shots = [
    { name: 'duplo_ep04_b1.png', t: b[0] + 1.6 },
    { name: 'duplo_ep04_b2.png', t: b[1] + 2.0 },
    { name: 'duplo_ep04_b3.png', t: b[2] + 2.0 },
    { name: 'duplo_ep04_b4.png', t: b[3] + 2.0 },
    { name: 'duplo_ep04_b5a.png', t: b[4] + 1.05 },
    { name: 'duplo_ep04_b5b.png', t: b[4] + 2.65 },
    { name: 'duplo_ep04_b6.png', t: Math.min(info.duration - 1.2, b[5] + 2.0) }
  ];

  console.log('⏱️ Timeline EP04:', JSON.stringify(info));
  for (const s of shots) {
    await page.evaluate((t) => window.renderAt(t), s.t);
    await page.waitForTimeout(80);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, s.name) });
    console.log(`📸 Capturado: ${s.name} @ t=${s.t.toFixed(2)}s`);
  }

  await ctx.close();
  await browser.close();

  if (errors.length > 0) {
    console.error('❌ Erros na auditoria Ep04:', errors);
    process.exit(1);
  }
  console.log('✅ Auditoria visual Ep 04 Mandioca: 0 erros!');
}

main().catch((e) => { console.error(e); process.exit(1); });
