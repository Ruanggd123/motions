const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 270, height: 480 } });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('http://localhost:8082/ep04-mandioca-feira-3d.html?test=1', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(300);

  const report = await page.evaluate(() => {
    const dbg = window.__EP04_MANDIOCA_DEBUG;
    const tl = window.EP04_MANDIOCA_TIMELINE;
    const dur = (tl && tl.duration) || 35.0;
    const dt = 1 / 60;
    const steps = Math.floor(dur / dt);

    let prev = null;
    const maxDelta = {
      camPos: 0, vocePos: 0, camilaPos: 0, voceRotY: 0,
      shoulderL: 0, shoulderR: 0, elbowL: 0, elbowR: 0, legL: 0, legR: 0
    };
    const worstAt = {};
    let minVoceY = Infinity, maxVoceY = -Infinity;
    let minCamilaY = Infinity, maxCamilaY = -Infinity;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      window.renderAt(t);
      const cam = dbg.camera.position;
      const v = dbg.voce;
      const c = dbg.camila;
      minVoceY = Math.min(minVoceY, v.group.position.y);
      maxVoceY = Math.max(maxVoceY, v.group.position.y);
      minCamilaY = Math.min(minCamilaY, c.group.position.y);
      maxCamilaY = Math.max(maxCamilaY, c.group.position.y);

      const cur = {
        camX: cam.x, camY: cam.y, camZ: cam.z,
        vx: v.group.position.x, vy: v.group.position.y, vz: v.group.position.z,
        cx: c.group.position.x, cy: c.group.position.y, cz: c.group.position.z,
        vry: v.group.rotation.y,
        shoulderL: v.shoulderL.root.rotation.x, shoulderR: v.shoulderR.root.rotation.x,
        elbowL: v.shoulderL.elbow.rotation.x, elbowR: v.shoulderR.elbow.rotation.x,
        legL: v.legL.root.rotation.x, legR: v.legR.root.rotation.x
      };

      if (prev) {
        const track = (k, d) => {
          if (d > maxDelta[k]) { maxDelta[k] = Number(d.toFixed(4)); worstAt[k] = Number(t.toFixed(3)); }
        };
        track('camPos', Math.hypot(cur.camX - prev.camX, cur.camY - prev.camY, cur.camZ - prev.camZ));
        track('vocePos', Math.hypot(cur.vx - prev.vx, cur.vy - prev.vy, cur.vz - prev.vz));
        track('camilaPos', Math.hypot(cur.cx - prev.cx, cur.cy - prev.cy, cur.cz - prev.cz));
        track('voceRotY', Math.abs(cur.vry - prev.vry));
        for (const j of ['shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'legL', 'legR']) {
          track(j, Math.abs(cur[j] - prev[j]));
        }
      }
      prev = cur;
    }

    return {
      steps, dur,
      minVoceY: Number(minVoceY.toFixed(4)), maxVoceY: Number(maxVoceY.toFixed(4)),
      minCamilaY: Number(minCamilaY.toFixed(4)), maxCamilaY: Number(maxCamilaY.toFixed(4)),
      maxDelta, worstAt
    };
  });

  await browser.close();
  console.log('🧪 Teste 60fps Ep 04 Mandioca:', JSON.stringify(report, null, 2));

  const failures = [];
  if (Math.abs(report.minVoceY - (-0.37)) > 0.002 || Math.abs(report.maxVoceY - (-0.37)) > 0.002) {
    failures.push(`Você fora do piso: [${report.minVoceY}, ${report.maxVoceY}]`);
  }
  if (Math.abs(report.minCamilaY - (-0.27)) > 0.002 || Math.abs(report.maxCamilaY - (-0.27)) > 0.002) {
    failures.push(`Camila fora do piso: [${report.minCamilaY}, ${report.maxCamilaY}]`);
  }
  if (report.maxDelta.camPos > 0.16) failures.push(`Salto câmera: ${report.maxDelta.camPos}m @ t=${report.worstAt.camPos}s`);
  if (report.maxDelta.vocePos > 0.03) failures.push(`Teleporte Você: ${report.maxDelta.vocePos}m @ t=${report.worstAt.vocePos}s`);
  if (report.maxDelta.camilaPos > 0.03) failures.push(`Teleporte Camila: ${report.maxDelta.camilaPos}m @ t=${report.worstAt.camilaPos}s`);
  for (const j of ['shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'legL', 'legR']) {
    if (report.maxDelta[j] > 0.10) failures.push(`Tranco em ${j}: ${report.maxDelta[j]} rad/frame @ t=${report.worstAt[j]}s`);
  }
  if (errors.length > 0) failures.push(`Erros browser: ${errors.join('; ')}`);

  if (failures.length > 0) {
    console.error('❌ FALHAS:', failures);
    process.exit(1);
  }
  console.log('✅ APROVADO! Ep 04 Mandioca 100% aterrado e fluido em 60fps.');
}

main().catch((e) => { console.error(e); process.exit(1); });
