import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:8000/series/condominio-bloco-c/estudio-ep03.html', { waitUntil: 'networkidle' });
const list = await page.evaluate(() => window.StudioScenes.list());
list.forEach(s => console.log(`${s.pinned ? '🔒' : '  '} ${s.name.padEnd(30)} | ${s.angulo} | ${s.profundidade}`));
await browser.close();
