const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/e783032d-89dc-4f61-b605-6777e8c50978';

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('http://localhost:8082/ep02-lampada-genio-3d.html?render=1', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(350);

  const info = await page.evaluate(() => {
    const tl = window.EP02_GENIO_TIMELINE || {};
    return {
      duration: tl.duration || 32.0,
      beats: tl.beat_starts || [0, 4.5, 9.0, 14.0, 21.0, 26.0]
    };
  });

  const b = info.beats;
  const shots = [
    { name: 'duplo_ep02_genio_b1.png', t: b[0] + 2.0 },
    { name: 'duplo_ep02_genio_b2.png', t: b[1] + 2.2 },
    { name: 'duplo_ep02_genio_b3.png', t: b[2] + 2.4 },
    { name: 'duplo_ep02_genio_b4.png', t: b[3] + 2.2 },
    { name: 'duplo_ep02_genio_b5.png', t: b[4] + 2.0 },
    { name: 'duplo_ep02_genio_b6.png', t: Math.min(info.duration - 1.2, b[5] + 2.4) }
  ];

  for (const s of shots) {
    await page.evaluate((t) => window.renderAt(t), s.t);
    await page.waitForTimeout(80);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, s.name) });
    console.log(`📸 Capturado: ${s.name} @ t=${s.t.toFixed(2)}s`);
  }

  await ctx.close();
  await browser.close();

  if (errors.length > 0) {
    console.error('❌ Erros na auditoria:', errors);
    process.exit(1);
  }
  console.log('✅ Auditoria visual Ep 02 Gênio: 0 erros!');
}

main().catch((e) => { console.error(e); process.exit(1); });
