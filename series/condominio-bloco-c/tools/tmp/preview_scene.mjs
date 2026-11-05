import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('output/qa_motor/cenas');
fs.mkdirSync(OUT, { recursive: true });

const name = process.argv[2];
const times = (process.argv[3] || '0.4').split(',').map(Number);
const extra = process.argv[4] ? JSON.parse(process.argv[4]) : {};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.goto('http://localhost:8000/series/condominio-bloco-c/showcase-caminhada.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

for (const t of times) {
  const res = await page.evaluate(({ name, t, extra }) => {
    const cv = document.createElement('canvas');
    cv.width = 1080;
    cv.height = 1920;
    const c = cv.getContext('2d');
    c.fillStyle = '#000';
    c.fillRect(0, 0, 1080, 1920);

    const actor = new window.StudioCharacters.VoceMorador({
      x: 0, y: 0, scale: 1, viewMode: 'profile', isWalking: true
    });
    actor.walkCycle = t * 4.6;
    actor.update(1 / 60, 0, 0.5);

    const state = Object.assign({
      W: 1080, H: 1920, t, actor,
      fromX: 1080 * 0.78, toX: 1080 * 0.26, walkStart: 0, walkDur: 2.4,
      facing: 'left', mood: 'tense'
    }, extra);

    const ok = window.StudioScenes.play(name, c, state);
    return { ok, url: cv.toDataURL('image/png') };
  }, { name, t, extra });

  if (!res.ok) {
    console.error('SCENE NOT REGISTERED:', name);
    break;
  }
  const f = path.join(OUT, `${name}_t${t.toFixed(2)}.png`);
  fs.writeFileSync(f, Buffer.from(res.url.split(',')[1], 'base64'));
  console.log('->', f);
}

if (errs.length) console.error('PAGE ERRORS:', errs);
await browser.close();
