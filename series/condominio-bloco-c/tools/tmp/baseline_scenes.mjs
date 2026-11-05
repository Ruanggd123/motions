import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve('output/qa_motor/baseline');
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.error('[PAGE ERROR]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('[CONSOLE]', m.text()); });
await page.goto('http://localhost:8000/series/condominio-bloco-c/estudio-ep03.html?render=1', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const shots = [
  ['portaria_wide', 2.5],
  ['guarita_3q', 9.0],
  ['valdir_walk', 14.6],
  ['alavanca', 15.9],
  ['exterior', 18.0],
  ['cctv', 32.0],
  ['lucas_costas', 37.3],
  ['lucas_vidro', 40.0],
  ['interfone', 46.0],
  ['grade', 67.0],
  ['climax', 64.0],
];
for (const [name, sec] of shots) {
  await page.evaluate((s) => window.renderAt(s), sec);
  await page.waitForTimeout(220);
  const f = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: f });
  console.log('->', f);
}
const support = await page.evaluate(() => {
  const c = document.createElement('canvas').getContext('2d');
  let filterOk = false;
  try { c.filter = 'blur(4px)'; filterOk = c.filter === 'blur(4px)'; } catch (e) { filterOk = false; }
  return { filterOk, ua: navigator.userAgent.slice(0, 60) };
});
console.log('ctx.filter ->', JSON.stringify(support));
await browser.close();
