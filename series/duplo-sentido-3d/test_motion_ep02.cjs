const { chromium } = require('playwright');

const URL = 'http://localhost:8082/ep02-cacetinho-quentinho-3d.html?render=1';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 432, height: 768 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(URL, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(300);

    // Amostra todos os frames a 60fps durante todo o episódio (0s .. duration) e mede deltas reais
    const report = await page.evaluate(() => {
      const sc = window.__EP02_DEBUG;
      const dur = (window.EP02_DUPLO_TIMELINE && window.EP02_DUPLO_TIMELINE.duration) || 30.41;
      const dt = 1 / 60;
      const steps = Math.floor(dur * 60);

      let prev = null;
      const maxDelta = {
        camPos: 0,
        vocePos: 0,
        voceRotY: 0,
        shoulderL: 0,
        shoulderR: 0,
        elbowL: 0,
        elbowR: 0,
        legL: 0,
        legR: 0,
        kneeL: 0,
        kneeR: 0
      };
      const worstAt = {};
      let minVoceY = 999, maxVoceY = -999;

      for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        window.renderAt(t);

        const cur = {
          camX: sc.camera.position.x,
          camY: sc.camera.position.y,
          camZ: sc.camera.position.z,
          vx: sc.voce.group.position.x,
          vy: sc.voce.group.position.y,
          vz: sc.voce.group.position.z,
          vRotY: sc.voce.group.rotation.y,
          sL: sc.voce.shoulderL.root.rotation.x,
          sR: sc.voce.shoulderR.root.rotation.x,
          eL: sc.voce.shoulderL.elbow.rotation.x,
          eR: sc.voce.shoulderR.elbow.rotation.x,
          lL: sc.voce.legL.root.rotation.x,
          lR: sc.voce.legR.root.rotation.x,
          kL: sc.voce.legL.knee.rotation.x,
          kR: sc.voce.legR.knee.rotation.x
        };

        if (cur.vy < minVoceY) minVoceY = cur.vy;
        if (cur.vy > maxVoceY) maxVoceY = cur.vy;

        if (prev) {
          const dc = Math.hypot(cur.camX - prev.camX, cur.camY - prev.camY, cur.camZ - prev.camZ);
          const dv = Math.hypot(cur.vx - prev.vx, cur.vy - prev.vy, cur.vz - prev.vz);
          const pairs = [
            ['camPos', dc],
            ['vocePos', dv],
            ['voceRotY', Math.abs(cur.vRotY - prev.vRotY)],
            ['shoulderL', Math.abs(cur.sL - prev.sL)],
            ['shoulderR', Math.abs(cur.sR - prev.sR)],
            ['elbowL', Math.abs(cur.eL - prev.eL)],
            ['elbowR', Math.abs(cur.eR - prev.eR)],
            ['legL', Math.abs(cur.lL - prev.lL)],
            ['legR', Math.abs(cur.lR - prev.lR)],
            ['kneeL', Math.abs(cur.kL - prev.kL)],
            ['kneeR', Math.abs(cur.kR - prev.kR)]
          ];
          for (const [k, v] of pairs) {
            if (v > maxDelta[k]) {
              maxDelta[k] = Number(v.toFixed(4));
              worstAt[k] = Number(t.toFixed(3));
            }
          }
        }
        prev = cur;
      }

      return { steps, dur, minVoceY, maxVoceY, maxDelta, worstAt };
    });

    console.log('🧪 Teste de Fluidez 60fps EP02:', JSON.stringify(report, null, 2));

    // Limites rígidos de continuidade C¹ (zero teletransportes e zero trancos nas articulações!)
    const failReasons = [];
    if (Math.abs(report.minVoceY - (-0.37)) > 0.002 || Math.abs(report.maxVoceY - (-0.37)) > 0.002) {
      failReasons.push(`Voce flutuou! minY=${report.minVoceY}, maxY=${report.maxVoceY}`);
    }
    if (report.maxDelta.camPos > 0.16) failReasons.push(`Salto na câmera: ${report.maxDelta.camPos}m @ t=${report.worstAt.camPos}s`);
    if (report.maxDelta.vocePos > 0.03) failReasons.push(`Teleporte de Você: ${report.maxDelta.vocePos}m @ t=${report.worstAt.vocePos}s`);
    for (const j of ['shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'legL', 'legR', 'kneeL', 'kneeR']) {
      if (report.maxDelta[j] > 0.10) {
        failReasons.push(`Tranco na articulação ${j}: ${report.maxDelta[j]} rad/frame @ t=${report.worstAt[j]}s`);
      }
    }
    if (errors.length > 0) failReasons.push('Console/Page errors: ' + errors.join('; '));

    if (failReasons.length > 0) {
      console.error('❌ FALHA NO TESTE DE FLUIDEZ:', failReasons);
      process.exitCode = 1;
    } else {
      console.log(`✅ APROVADO! ${report.steps} frames testados com 0 trancos, 0 teleportes e pé 100% ancorado no chão.`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error('❌ Erro fatal test_motion_ep02:', e);
  process.exit(1);
});
