import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const pages = ['estudio-aprovacao-visual.html', 'estudio-ep02.html', 'estudio-ep03.html', 'showcase-caminhada.html'];
let bad = 0;
for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(`http://localhost:8000/series/condominio-bloco-c/${p}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => ({
    rig: !!(window.StudioEngine && window.StudioEngine.BodyRig2D),
    depth: !!(window.StudioEngine && window.StudioEngine.DepthScene2D),
    scenes: window.StudioScenes ? window.StudioScenes.list().map(s => s.name) : null
  }));
  const ok = errs.length === 0 && info.rig;
  if (!ok) bad++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${p} | rig=${info.rig} depth=${info.depth} scenes=${info.scenes ? info.scenes.length : '-'}`);
  if (errs.length) errs.slice(0, 6).forEach((e) => console.log('     !', e));
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
