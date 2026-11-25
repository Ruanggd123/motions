const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ARTIFACT_DIR = 'C:/Users/Ruan Gomes/.gemini/antigravity/brain/e783032d-89dc-4f61-b605-6777e8c50978';

const SPECS = [
  {
    id: 'ep06',
    url: 'http://localhost:8082/ep06-barra-academia-3d.html',
    debugVar: '__EP06_ACADEMIA_DEBUG',
    tlVar: 'EP06_ACADEMIA_TIMELINE',
    propKey: 'barra',
    propSubKey: 'barGroup',
    prefix: 'duplo_ep06'
  },
  {
    id: 'ep07',
    url: 'http://localhost:8082/ep07-linguica-churrasco-3d.html',
    debugVar: '__EP07_CHURRASCO_DEBUG',
    tlVar: 'EP07_CHURRASCO_TIMELINE',
    propKey: 'espeto',
    propSubKey: 'skewerGroup',
    prefix: 'duplo_ep07'
  }
];

async function testMotion(browser, spec) {
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 270, height: 480 } });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(spec.url + '?test=1', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(250);

  const report = await page.evaluate((s) => {
    const dbg = window[s.debugVar];
    const tl = window[s.tlVar];
    const dur = (tl && tl.duration) || 35.0;
    const dt = 1 / 60;
    const steps = Math.floor(dur / dt);

    let nanCount = 0;
    const checkFinite = (...vals) => {
      for (const v of vals) {
        if (typeof v !== 'number' || !Number.isFinite(v)) nanCount++;
      }
    };

    const getFootWorldY = (g, defaultBaseY) => {
      const ud = g.userData || {};
      const baseY = (typeof ud.baseGroundY === 'number' && Number.isFinite(ud.baseGroundY))
        ? ud.baseGroundY
        : defaultBaseY;
      let computed;
      if (window.CartoonDistort3D && typeof window.CartoonDistort3D.computeFootWorldY === 'function') {
        computed = window.CartoonDistort3D.computeFootWorldY(g, baseY);
      } else {
        const footLocalY = (typeof ud.footLocalY === 'number' && Number.isFinite(ud.footLocalY))
          ? ud.footLocalY
          : -baseY;
        const cZ = Math.cos(g.rotation ? g.rotation.z : 0);
        const cX = Math.cos(g.rotation ? g.rotation.x : 0);
        computed = g.position.y + g.scale.y * footLocalY * cZ * cX;
      }
      if (typeof ud.cartoonFootY === 'number' && Number.isFinite(ud.cartoonFootY)) {
        return { computed, reported: ud.cartoonFootY };
      }
      return { computed, reported: null };
    };

    const maxDelta = {
      camPos: 0, vocePos: 0, camilaPos: 0, fov: 0,
      shoulderL: 0, shoulderR: 0, elbowL: 0, elbowR: 0, legL: 0, legR: 0
    };
    let prev = null;

    let minVoceFootY = Infinity, maxVoceFootY = -Infinity, worstVoceFootAt = 0;
    let minCamilaFootY = Infinity, maxCamilaFootY = -Infinity, worstCamilaFootAt = 0;
    let minPropY = Infinity, maxPropY = -Infinity, worstPropAt = 0;
    let minFov = Infinity, maxFov = -Infinity;
    let minVoceSy = Infinity, maxVoceSy = -Infinity;
    let minCamilaSy = Infinity, maxCamilaSy = -Infinity;
    let maxVoceHead = 0, maxCamilaHead = 0;
    let usedCartoonFootMeta = false;

    const hasPacoca = Boolean(dbg.pacoca || window.PacocaCachorro3D);
    const hasCartoonDistort = Boolean(window.CartoonDistort3D);

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      window.renderAt(t);

      const cam = dbg.camera;
      const v = dbg.voce;
      const c = dbg.camila;
      const prop = dbg[s.propKey];
      const propObj = prop && prop[s.propSubKey];

      checkFinite(
        cam.position.x, cam.position.y, cam.position.z, cam.fov,
        v.group.position.x, v.group.position.y, v.group.position.z,
        v.group.scale.x, v.group.scale.y, v.group.scale.z,
        v.group.rotation.x, v.group.rotation.y, v.group.rotation.z,
        c.group.position.x, c.group.position.y, c.group.position.z,
        c.group.scale.x, c.group.scale.y, c.group.scale.z,
        c.group.rotation.x, c.group.rotation.y, c.group.rotation.z
      );

      minFov = Math.min(minFov, cam.fov);
      maxFov = Math.max(maxFov, cam.fov);
      minVoceSy = Math.min(minVoceSy, v.group.scale.y);
      maxVoceSy = Math.max(maxVoceSy, v.group.scale.y);
      minCamilaSy = Math.min(minCamilaSy, c.group.scale.y);
      maxCamilaSy = Math.max(maxCamilaSy, c.group.scale.y);

      const vHead = v.headGroup || v.head;
      const cHead = c.headGroup || c.head;
      if (vHead && vHead.scale) {
        checkFinite(vHead.scale.x, vHead.scale.y, vHead.scale.z);
        maxVoceHead = Math.max(maxVoceHead, vHead.scale.x, vHead.scale.y, vHead.scale.z);
      }
      if (cHead && cHead.scale) {
        checkFinite(cHead.scale.x, cHead.scale.y, cHead.scale.z);
        maxCamilaHead = Math.max(maxCamilaHead, cHead.scale.x, cHead.scale.y, cHead.scale.z);
      }

      const vf = getFootWorldY(v.group, -0.37);
      const cf = getFootWorldY(c.group, -0.27);
      if (vf.reported !== null || cf.reported !== null) usedCartoonFootMeta = true;

      const vErr = Math.abs(vf.computed);
      const cErr = Math.abs(cf.computed);
      if (vf.computed < minVoceFootY) minVoceFootY = vf.computed;
      if (vf.computed > maxVoceFootY) maxVoceFootY = vf.computed;
      if (vErr > Math.max(Math.abs(minVoceFootY), Math.abs(maxVoceFootY)) - 1e-6) {
        worstVoceFootAt = Number(t.toFixed(3));
      }
      if (cf.computed < minCamilaFootY) minCamilaFootY = cf.computed;
      if (cf.computed > maxCamilaFootY) maxCamilaFootY = cf.computed;
      if (cErr > Math.max(Math.abs(minCamilaFootY), Math.abs(maxCamilaFootY)) - 1e-6) {
        worstCamilaFootAt = Number(t.toFixed(3));
      }

      if (prop && prop.group && prop.group.visible && propObj) {
        checkFinite(propObj.position.x, propObj.position.y, propObj.position.z);
        if (!prop.isLaunched) {
          if (propObj.position.y < minPropY) minPropY = propObj.position.y;
          if (propObj.position.y > maxPropY) {
            maxPropY = propObj.position.y;
            worstPropAt = Number(t.toFixed(3));
          }
        }
      }

      const cur = {
        camX: cam.position.x, camY: cam.position.y, camZ: cam.position.z, fov: cam.fov,
        vx: v.group.position.x, vy: v.group.position.y, vz: v.group.position.z,
        cx: c.group.position.x, cy: c.group.position.y, cz: c.group.position.z,
        shoulderL: v.shoulderL.root.rotation.x, shoulderR: v.shoulderR.root.rotation.x,
        elbowL: v.shoulderL.elbow.rotation.x, elbowR: v.shoulderR.elbow.rotation.x,
        legL: v.legL.root.rotation.x, legR: v.legR.root.rotation.x
      };

      if (prev) {
        const track = (k, d) => { if (d > maxDelta[k]) maxDelta[k] = Number(d.toFixed(4)); };
        track('camPos', Math.hypot(cur.camX - prev.camX, cur.camY - prev.camY, cur.camZ - prev.camZ));
        track('vocePos', Math.hypot(cur.vx - prev.vx, cur.vy - prev.vy, cur.vz - prev.vz));
        track('camilaPos', Math.hypot(cur.cx - prev.cx, cur.cy - prev.cy, cur.cz - prev.cz));
        track('fov', Math.abs(cur.fov - prev.fov));
        for (const j of ['shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'legL', 'legR']) {
          track(j, Math.abs(cur[j] - prev[j]));
        }
      }
      prev = cur;
    }

    return {
      id: s.id,
      steps,
      dur,
      hasPacoca,
      hasCartoonDistort,
      usedCartoonFootMeta,
      nanCount,
      voceFootY: [Number(minVoceFootY.toFixed(4)), Number(maxVoceFootY.toFixed(4))],
      worstVoceFootAt,
      camilaFootY: [Number(minCamilaFootY.toFixed(4)), Number(maxCamilaFootY.toFixed(4))],
      worstCamilaFootAt,
      propY: [Number(minPropY.toFixed(4)), Number(maxPropY.toFixed(4))],
      worstPropAt,
      distortionTelemetry: {
        fovRange: [Number(minFov.toFixed(2)), Number(maxFov.toFixed(2))],
        voceScaleY: [Number(minVoceSy.toFixed(3)), Number(maxVoceSy.toFixed(3))],
        camilaScaleY: [Number(minCamilaSy.toFixed(3)), Number(maxCamilaSy.toFixed(3))],
        voceHeadMax: Number(maxVoceHead.toFixed(3)),
        camilaHeadMax: Number(maxCamilaHead.toFixed(3))
      },
      maxDelta
    };
  }, spec);

  await page.close();
  console.log(`🧪 Auditoria 60fps ${spec.id.toUpperCase()}:`, JSON.stringify(report, null, 2));

  const failures = [];
  if (report.hasPacoca) failures.push(`${spec.id}: Paçoca NÃO deve existir!`);
  if (report.nanCount > 0) failures.push(`${spec.id}: Detectados ${report.nanCount} valores NaN/Infinity!`);
  if (Math.abs(report.voceFootY[0]) > 0.025 || Math.abs(report.voceFootY[1]) > 0.025) {
    failures.push(`${spec.id}: Pés do Você fora do piso (footWorldY=${JSON.stringify(report.voceFootY)} @ t=${report.worstVoceFootAt}s)`);
  }
  if (Math.abs(report.camilaFootY[0]) > 0.025 || Math.abs(report.camilaFootY[1]) > 0.025) {
    failures.push(`${spec.id}: Pés da Camila fora do piso (footWorldY=${JSON.stringify(report.camilaFootY)} @ t=${report.worstCamilaFootAt}s)`);
  }
  if (report.propY[1] > 0.85) {
    failures.push(`${spec.id}: Prop muito alto (oclusão facial): maxPropY=${report.propY[1]} @ t=${report.worstPropAt}s`);
  }
  if (errors.length > 0) failures.push(`${spec.id}: Erros browser: ${errors.join('; ')}`);
  return { failures, report };
}

async function captureAudit(browser, spec) {
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(spec.url + '?render=1', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(300);

  const info = await page.evaluate((tlVar) => {
    const tl = window[tlVar] || {};
    return {
      duration: tl.duration || 35.0,
      beats: tl.beat_starts || [0.0, 6.0, 12.0, 17.5, 22.8, 28.0],
      dialogues: (tl.dialogues || []).map((d) => ({
        id: d.id,
        beat_idx: d.beat_idx,
        speaker: d.speaker,
        start: d.start,
        duration: d.duration,
        end: d.end
      }))
    };
  }, spec.tlVar);

  const b = info.beats;
  const b1Dur = Math.max(2.0, (b[1] || 6.0) - (b[0] || 0));
  const b1SecondDlg = info.dialogues.find(
    (d, idx) => idx > 0 && ((d.beat_idx === 0) || (d.start >= (b[0] || 0) + 1.2 && d.start < (b[1] || 6.0) - 0.35))
  );
  const tB1b = b1SecondDlg
    ? Math.min(b[1] - 0.35, b1SecondDlg.start + Math.min(1.05, Math.max(0.45, (b1SecondDlg.duration || 1.6) * 0.45)))
    : b[0] + Math.min(b1Dur - 0.55, Math.max(2.2, b1Dur * 0.65));

  const b2Dur = Math.max(2.0, (b[2] || 12.0) - b[1]);
  const b3Dur = Math.max(2.0, (b[3] || 17.5) - b[2]);
  const b4Dur = Math.max(2.0, (b[4] || 22.8) - b[3]);
  const b5Dur = Math.max(2.0, (b[5] || 28.0) - b[4]);

  const shots = [
    { name: `${spec.prefix}_b1a.png`, t: b[0] + 0.80 },
    { name: `${spec.prefix}_b1b.png`, t: tB1b },
    { name: `${spec.prefix}_b2.png`,  t: b[1] + Math.min(1.85, b2Dur * 0.42) },
    { name: `${spec.prefix}_b3.png`,  t: b[2] + Math.min(1.95, b3Dur * 0.45) },
    { name: `${spec.prefix}_b4.png`,  t: b[3] + Math.min(1.85, b4Dur * 0.52) },
    { name: `${spec.prefix}_b5a.png`, t: b[4] + Math.min(1.05, b5Dur * 0.22) },
    { name: `${spec.prefix}_b5b.png`, t: b[4] + Math.min(2.35, b5Dur * 0.52) },
    { name: `${spec.prefix}_b6.png`,  t: Math.min(info.duration - 1.35, b[5] + 1.90) }
  ];

  console.log(`⏱️ Timeline ${spec.id.toUpperCase()}:`, JSON.stringify({ duration: info.duration, beats: info.beats, dlgCount: info.dialogues.length }));
  for (const s of shots) {
    await page.evaluate((t) => window.renderAt(t), s.t);
    await page.waitForTimeout(75);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, s.name) });
    console.log(`📸 Capturado: ${s.name} @ t=${s.t.toFixed(2)}s`);
  }
  await ctx.close();
  return errors;
}

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const allFailures = [];
  try {
    for (const spec of SPECS) {
      const { failures: f1 } = await testMotion(browser, spec);
      const f2 = await captureAudit(browser, spec);
      allFailures.push(...f1, ...f2);
    }
  } finally {
    await browser.close();
  }

  if (allFailures.length > 0) {
    console.error('❌ FALHAS EP06/EP07:', allFailures);
    process.exit(1);
  }
  console.log('✅ APROVADO! Ep 06 (Academia) e Ep 07 (Churrasco) 100% aterrados (CartoonDistort3D foot-anchored), sem Paçoca, sem oclusão facial, 0 NaN, 0 erros e 16 PNGs capturados!');
}

main().catch((e) => { console.error(e); process.exit(1); });
