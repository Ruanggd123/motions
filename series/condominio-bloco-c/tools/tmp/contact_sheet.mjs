import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve('output/qa_motor');
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
page.on('pageerror', (e) => console.error('[PAGE ERROR]', e.message));
await page.goto('http://localhost:8000/series/condominio-bloco-c/showcase-caminhada.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const dataUrl = await page.evaluate(() => {
  const CH = [['VoceMorador','VOCE'],['SeuValdirPorteiro','VALDIR'],['LucasEntregador','LUCAS'],['CamilaEPacoca','CAMILA']];
  const CW = 1560, CC = 1200;
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CC;
  const c = cv.getContext('2d');
  c.fillStyle = '#0a0f18'; c.fillRect(0, 0, CW, CC);
  const cellW = 190, cellH = 300;
  const phases = [0, 0.5];
  let col = 0;
  const headers = [];
  for (const [cls, label] of CH) {
    // frente
    const cx0 = 20 + col * cellW, cy0 = 40;
    c.fillStyle = '#cbd5e1'; c.font = '700 15px monospace'; c.textAlign = 'left';
    c.fillText(label, cx0, 26);
    let ch = new window.StudioCharacters[cls]({ x: 0, y: 0, scale: 1.25, viewMode: 'front', emotion: 'neutral' });
    ch.showDog = false; ch.time = 1.2; ch.update(1/60, 0, 0.5);
    c.save(); c.translate(cx0 + cellW/2, cy0 + 230); ch.draw(c); c.restore();
    col++;
    // perfil em 2 fases
    for (const ph of phases) {
      const cx = 20 + col * cellW, cy = 40;
      ch = new window.StudioCharacters[cls]({ x: 0, y: 0, scale: 1.25, viewMode: 'profile', emotion: 'neutral' });
      ch.showDog = false; ch.isWalking = true; ch.walkCycle = ph * Math.PI * 2; ch.time = 1.2;
      c.save(); c.translate(cx + cellW/2, cy + 230); ch.draw(c); c.restore();
      c.fillStyle = '#64748b'; c.font = '600 11px monospace';
      c.fillText('fase ' + ph, cx + 6, cy + 258);
      col++;
    }
  }
  // segunda linha: cabeças ampliadas
  const rowY = 320;
  c.fillStyle = '#94a3b8'; c.font = '700 14px monospace';
  c.fillText('PERFIL EM DETALHE (cranio + cabelo)', 20, rowY);
  let col2 = 0;
  for (const [cls, label] of CH) {
    const cx = 20 + col2 * 380, cy = rowY + 10;
    const ch = new window.StudioCharacters[cls]({ x: 0, y: 0, scale: 3.0, viewMode: 'profile', emotion: 'neutral' });
    ch.showDog = false; ch.isWalking = false; ch.walkCycle = 0; ch.time = 1.2; ch.update(1/60,0,0.5);
    c.save(); c.beginPath(); c.rect(cx, cy, 360, 380); c.clip();
    c.translate(cx + 190, cy + 330); ch.draw(c); c.restore();
    c.strokeStyle = 'rgba(148,163,184,0.3)'; c.strokeRect(cx, cy, 360, 380);
    col2++;
  }
  return cv.toDataURL('image/png');
});
const f = path.join(OUT, 'contact_sheet.png');
fs.writeFileSync(f, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log('->', f);
await browser.close();
