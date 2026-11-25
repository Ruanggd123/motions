const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'output', 'audit_ep13');
fs.mkdirSync(OUT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wav': 'audio/wav',
  '.png': 'image/png',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
      const filePath = path.join(ROOT, safePath === '/' ? 'ep13-colchao-sala-3d.html' : safePath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

(async () => {
  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}/ep13-colchao-sala-3d.html`;
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  try {
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 270, height: 480 } });
    page.on('pageerror', (e) => { console.error('PAGEERROR:', e.stack || e.message); errors.push(e.message); });
    page.on('console', (m) => { if (m.type() === 'error') { console.error('CONSOLE_ERR:', m.text()); errors.push(m.text()); } });

    await page.goto(baseUrl + '?test=1', { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(300);

    const report = await page.evaluate(() => {
      const dbg = window.__EP13_COLCHAO_DEBUG;
      const tl = window.EP13_COLCHAO_TIMELINE;
      const dur = (tl && tl.duration) || 35.42;
      const dt = 1 / 60;
      const steps = Math.floor(dur / dt);

      let nanCount = 0;
      let maxAbsFootY = 0;
      let signHiddenInB1 = true;
      let signVisibleInB2toB6 = true;
      let lipSyncExclusiveOk = true;
      const checkFinite = (...vals) => {
        for (const v of vals) {
          if (typeof v !== 'number' || !Number.isFinite(v)) nanCount++;
        }
      };

      const b1End = tl.beat_starts[1];
      for (let i = 0; i <= steps; i++) {
        const t = Math.min(dur, i * dt);
        window.renderAt(t);
        checkFinite(dbg.camera.position.x, dbg.camera.position.y, dbg.camera.position.z, dbg.camera.fov);

        const vFoot = window.CartoonDistort3D.computeFootWorldY(dbg.voce.group, -0.37);
        const cFoot = window.CartoonDistort3D.computeFootWorldY(dbg.camila.group, -0.27);
        checkFinite(vFoot, cFoot);
        maxAbsFootY = Math.max(maxAbsFootY, Math.abs(vFoot), Math.abs(cFoot));

        if (t < b1End - 0.15 && dbg.signBoard.visible) signHiddenInB1 = false;
        if (t > b1End + 0.30 && !dbg.signBoard.visible) signVisibleInB2toB6 = false;

        // Check exclusive lip-sync
        const dlg = dbg._getDialogueState(t);
        const vMouth = dbg.voce.mouthOpen || 0;
        const cMouth = dbg.camila.mouthOpen || 0;
        if (dlg.speaker === 'voce' && cMouth > 0.05) lipSyncExclusiveOk = false;
        if (dlg.speaker === 'camila' && vMouth > 0.05) lipSyncExclusiveOk = false;
      }

      return {
        duration: dur,
        steps,
        nanCount,
        maxAbsFootY: Number(maxAbsFootY.toFixed(4)),
        hasPacoca: Boolean(dbg.pacoca || (dbg.scene && dbg.scene.getObjectByName('PacocaCachorro3D'))),
        signHiddenInB1,
        signVisibleInB2toB6,
        lipSyncExclusiveOk,
      };
    });

    console.log('AUDIT_REPORT:', JSON.stringify({ ...report, consoleErrors: errors }, null, 2));
    if (errors.length > 0 || report.nanCount > 0 || report.hasPacoca || report.maxAbsFootY > 0.03) {
      throw new Error('Audit failed!');
    }

    // Capture 8 Full-HD 1080x1920 screenshots
    const rPage = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await rPage.goto(baseUrl + '?render=1', { waitUntil: 'load', timeout: 45000 });
    await rPage.waitForTimeout(300);

    const tl = await rPage.evaluate(() => window.EP13_COLCHAO_TIMELINE);
    const b = tl.beat_starts;
    const shots = [
      { name: 'b1a_voce_fisheye', t: 1.2 },
      { name: 'b1b_camila_fisheye', t: (tl.dialogues[1].start || 4.3) + 1.0 },
      { name: 'b2_revelacao_sala', t: b[1] + 1.4 },
      { name: 'b3_engenheiro_cacto', t: b[2] + 1.6 },
      { name: 'b4_medidor_vermelho', t: b[3] + 1.4 },
      { name: 'b5a_flyby_explosao', t: b[4] + 0.55 },
      { name: 'b5b_almofada_cabeca', t: b[4] + 2.3 },
      { name: 'b6_roast_fisheye', t: b[5] + 2.2 },
    ];

    for (const s of shots) {
      await rPage.evaluate((t) => window.renderAt(t), s.t);
      await rPage.waitForTimeout(80);
      await rPage.screenshot({ path: path.join(OUT_DIR, `${s.name}.png`) });
      console.log(`Saved ${s.name}.png (t=${s.t.toFixed(2)}s)`);
    }
  } finally {
    await browser.close();
    server.close();
  }
})();
