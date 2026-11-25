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

  await page.goto('http://localhost:8082/ep05-mangueira-oficina-3d.html?render=1', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(350);

  const info = await page.evaluate(() => {
    const tl = window.EP05_MANGUEIRA_TIMELINE || {};
    return {
      duration: tl.duration || 35.5,
      beats: tl.beat_starts || [0.0, 6.2, 12.0, 17.5, 22.8, 29.0]
    };
  });

  const b = info.beats;
  const shots = [
    { name: 'duplo_ep05_b1.png', t: b[0] + 1.6 },
    { name: 'duplo_ep05_b2.png', t: b[1] + 2.0 },
    { name: 'duplo_ep05_b3.png', t: b[2] + 2.0 },
    { name: 'duplo_ep05_b4.png', t: b[3] + 2.0 },
    { name: 'duplo_ep05_b5a.png', t: b[4] + 0.90 },
    { name: 'duplo_ep05_b5b.png', t: b[4] + 2.35 },
    { name: 'duplo_ep05_b6.png', t: Math.min(info.duration - 1.2, b[5] + 2.0) }
  ];

  console.log('⏱️ Timeline EP05:', JSON.stringify(info));
  for (const s of shots) {
    await page.evaluate((t) => window.renderAt(t), s.t);
    await page.waitForTimeout(80);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, s.name) });
    console.log(`📸 Capturado: ${s.name} @ t=${s.t.toFixed(2)}s`);
  }

  await ctx.close();
  await browser.close();

  if (errors.length > 0) {
    console.error('❌ Erros na auditoria Ep05:', errors);
    process.exit(1);
  }
  console.log('✅ Auditoria visual Ep 05 Mangueira: 0 erros!');
}

main().catch((e) => { console.error(e); process.exit(1); });
