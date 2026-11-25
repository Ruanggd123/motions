const fs = require('fs');
const path = require('path');
const { chromium } = require('C:\\Users\\Ruan Gomes\\Desktop\\New folder\\node_modules\\playwright');

const BASE_URL = 'http://localhost:8082';
const OUT_DIR = 'C:\\Users\\Ruan Gomes\\.gemini\\antigravity\\brain\\e783032d-89dc-4f61-b605-6777e8c50978\\audit_v4';

const FULL_AUDIT_EPS = [
  {
    id: 'ep12',
    file: 'ep12-pneu-garagem-3d.html?render=1',
    debugVar: '__EP12_PNEU_DEBUG',
    dataVar: 'EP12_PNEU_DATA',
    forbiddenTopicRegex: 'colch[aã]o|furadeira|sorvete',
    shots: ['B5', 'B6'],
  },
  {
    id: 'ep13',
    file: 'ep13-colchao-sala-3d.html?render=1',
    debugVar: '__EP13_COLCHAO_DEBUG',
    dataVar: 'EP13_COLCHAO_DATA',
    forbiddenTopicRegex: 'pneu|furadeira|sorvete',
    shots: ['B5', 'B6'],
  },
  {
    id: 'ep14',
    file: 'ep14-furadeira-parede-3d.html?render=1',
    debugVar: '__EP14_FURADEIRA_DEBUG',
    dataVar: 'EP14_FURADEIRA_DATA',
    forbiddenTopicRegex: 'colch[aã]o|bomba de|pneu|sorvete',
    shots: ['B1a', 'B1b', 'B2', 'B4', 'B5', 'B6'],
  },
  {
    id: 'ep15',
    file: 'ep15-sorvete-casquinha-3d.html?render=1',
    debugVar: '__EP15_SORVETE_DEBUG',
    dataVar: 'EP15_SORVETE_DATA',
    forbiddenTopicRegex: 'colch[aã]o|bomba de|furadeira|pneu',
    shots: ['B1a', 'B1b', 'B2', 'B5', 'B6'],
  },
];

const SMOKE_EPS = [
  { id: 'ep09', file: 'ep09-cano-cozinha-3d.html?render=1', debugVar: '__EP09_CANO_DEBUG', dataVar: 'EP09_CANO_DATA' },
  { id: 'ep10', file: 'ep10-saco-mercado-3d.html?render=1', debugVar: '__EP10_MERCADO_DEBUG', dataVar: 'EP10_MERCADO_DATA' },
  { id: 'ep11', file: 'ep11-bolo-forno-3d.html?render=1', debugVar: '__EP11_BOLO_DEBUG', dataVar: 'EP11_BOLO_DATA' },
];

function computeBeatShotTimes(beats, wantIds, duration) {
  const b = beats || [];
  const span = (idx) => {
    const item = b[idx] || {};
    const s = Number(item.time ?? item.start ?? 0);
    const next = b[idx + 1];
    const e = Number(item.end ?? (next ? (next.time ?? next.start) : duration));
    return [s, Math.max(s + 0.5, e)];
  };
  const res = [];
  for (const label of wantIds) {
    if (label === 'B1a' && b[0]) {
      const [s, e] = span(0);
      res.push({ id: 'B1a', t: +(s + (e - s) * 0.18).toFixed(3) });
    } else if (label === 'B1b' && b[0]) {
      const [s, e] = span(0);
      res.push({ id: 'B1b', t: +(s + (e - s) * 0.78).toFixed(3) });
    } else {
      const m = /^B(\d+)$/.exec(label);
      const idx = m ? Number(m[1]) - 1 : -1;
      if (idx >= 0 && b[idx]) {
        const [s, e] = span(idx);
        res.push({ id: label, t: +(s + (e - s) * 0.50).toFixed(3) });
      }
    }
  }
  return res;
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  console.log('Browser launched with ANGLE d3d11');

  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });

  const summary = { full: {}, smoke: {} };
  let allPassed = true;

  for (const ep of FULL_AUDIT_EPS) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('requestfailed', (req) => {
      errors.push(`requestfailed: ${req.url()} (${req.failure()?.errorText || 'failed'})`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) errors.push(`http_${res.status()}: ${res.url()}`);
    });

    await page.goto(`${BASE_URL}/${ep.file}`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(
      ([dbgKey, dataKey]) => typeof window.renderAt === 'function' && !!window[dbgKey] && !!window[dataKey],
      [ep.debugVar, ep.dataVar],
      { timeout: 20000 }
    );

    const epMeta = await page.evaluate((dataKey) => {
      const d = window[dataKey];
      return { duration: Number(d.duration || 35), beats: d.beats || [] };
    }, ep.dataVar);

    const shotsOnly = process.env.SHOTS_ONLY === '1';
    const metrics = shotsOnly
      ? { skippedFullSweep: true }
      : await page.evaluate(
      ({ dbgKey, dataKey, duration, forbiddenTopicRegex }) => {
        const dbg = window[dbgKey];
        const data = window[dataKey];
        const forbiddenTopicRe = new RegExp(forbiddenTopicRegex, 'i');
        const badValRe = /\b(NaN|undefined)\b|\uFFFD|\u{1FA96}/u;
        const subSpeakerEl = document.getElementById('subSpeaker');
        const subTextEl = document.getElementById('subText');
        const wordPopEl = document.getElementById('wordPop');

        const getFootWorldY = (g, defaultBaseY) => {
          const ud = (g && g.userData) || {};
          const baseY = (typeof ud.baseY === 'number' && Number.isFinite(ud.baseY)) ? ud.baseY : defaultBaseY;
          if (window.CartoonDistort3D && typeof window.CartoonDistort3D.computeFootWorldY === 'function') {
            return window.CartoonDistort3D.computeFootWorldY(g, baseY);
          }
          const footLocalY = (typeof ud.footLocalY === 'number' && Number.isFinite(ud.footLocalY)) ? ud.footLocalY : -0.37;
          const cZ = Math.cos((g.rotation && g.rotation.z) || 0);
          const cX = Math.cos((g.rotation && g.rotation.x) || 0);
          return g.position.y + g.scale.y * footLocalY * cZ * cX;
        };

        const dt = 1 / 60;
        const frames = Math.ceil(duration * 60);
        let nanCount = 0;
        let maxAbsFootY = 0;
        let leakCount = 0;
        let subtitleSpeakerMismatches = 0;
        const voceMouths = new Set();
        const camilaMouths = new Set();

        const shLMin = { x: Infinity }, shLMax = { x: -Infinity };
        const shRMin = { x: Infinity }, shRMax = { x: -Infinity };
        const hairMin = { x: Infinity, z: Infinity }, hairMax = { x: -Infinity, z: -Infinity };
        const headMin = { y: Infinity }, headMax = { y: -Infinity };

        const checkVec = (v) => {
          if (!v) return;
          if (!Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.z)) nanCount++;
        };

        const hasPacoca = Boolean(dbg.pacoca || (dbg.scene && dbg.scene.getObjectByName && dbg.scene.getObjectByName('pacoca')));

        for (let i = 0; i <= frames; i++) {
          const t = Math.min(duration, i * dt);
          window.renderAt(t);

          if (dbg.camera) checkVec(dbg.camera.position);
          if (dbg.voce && dbg.voce.group) {
            checkVec(dbg.voce.group.position);
            checkVec(dbg.voce.group.rotation);
            checkVec(dbg.voce.group.scale);
            maxAbsFootY = Math.max(maxAbsFootY, Math.abs(getFootWorldY(dbg.voce.group, -0.37)));
            voceMouths.add(Math.round((Number(dbg.voce.mouthOpen) || 0) * 1000));
          }
          if (dbg.camila && dbg.camila.group) {
            checkVec(dbg.camila.group.position);
            checkVec(dbg.camila.group.rotation);
            checkVec(dbg.camila.group.scale);
            maxAbsFootY = Math.max(maxAbsFootY, Math.abs(getFootWorldY(dbg.camila.group, -0.27)));
            camilaMouths.add(Math.round((Number(dbg.camila.mouthOpen) || 0) * 1000));

            if (dbg.camila.shoulderL && dbg.camila.shoulderL.root) {
              const rx = dbg.camila.shoulderL.root.rotation.x;
              if (!Number.isFinite(rx)) nanCount++;
              shLMin.x = Math.min(shLMin.x, rx);
              shLMax.x = Math.max(shLMax.x, rx);
            }
            if (dbg.camila.shoulderR && dbg.camila.shoulderR.root) {
              const rx = dbg.camila.shoulderR.root.rotation.x;
              if (!Number.isFinite(rx)) nanCount++;
              shRMin.x = Math.min(shRMin.x, rx);
              shRMax.x = Math.max(shRMax.x, rx);
            }
            if (dbg.camila.hairPuffGroup) {
              const hx = dbg.camila.hairPuffGroup.rotation.x;
              const hz = dbg.camila.hairPuffGroup.rotation.z;
              if (!Number.isFinite(hx) || !Number.isFinite(hz)) nanCount++;
              hairMin.x = Math.min(hairMin.x, hx);
              hairMax.x = Math.max(hairMax.x, hx);
              hairMin.z = Math.min(hairMin.z, hz);
              hairMax.z = Math.max(hairMax.z, hz);
            }
            if (dbg.camila.headGroup) {
              const hy = dbg.camila.headGroup.rotation.y;
              if (!Number.isFinite(hy)) nanCount++;
              headMin.y = Math.min(headMin.y, hy);
              headMax.y = Math.max(headMax.y, hy);
            }
          }

          const spText = (subSpeakerEl && subSpeakerEl.textContent) || '';
          const subTxt = (subTextEl && subTextEl.textContent) || '';
          const popTxt = (wordPopEl && wordPopEl.textContent) || '';
          if (forbiddenTopicRe.test(subTxt) || forbiddenTopicRe.test(popTxt) || badValRe.test(subTxt) || badValRe.test(popTxt) || badValRe.test(spText)) {
            leakCount++;
          }

          // Check active dialogue line speaker match
          const dlgs = data.dialogues || [];
          let activeDlg = null;
          for (const d of dlgs) {
            if (t >= d.start && t <= d.end) {
              activeDlg = d;
              break;
            }
          }
          if (activeDlg && spText) {
            const isSpCamila = /CAMILA/i.test(spText);
            if (activeDlg.speaker === 'camila' && !isSpCamila) subtitleSpeakerMismatches++;
            if (activeDlg.speaker === 'voce' && isSpCamila) subtitleSpeakerMismatches++;
          }
        }

        return {
          framesChecked: frames + 1,
          nanCount,
          hasPacoca,
          maxAbsFootY: +maxAbsFootY.toFixed(5),
          voceUniqueMouths: voceMouths.size,
          camilaUniqueMouths: camilaMouths.size,
          leakCount,
          subtitleSpeakerMismatches,
          camilaMotionRanges: {
            shoulderL_x: +(shLMax.x - shLMin.x).toFixed(4),
            shoulderR_x: +(shRMax.x - shRMin.x).toFixed(4),
            hairPuff_x: +(hairMax.x - hairMin.x).toFixed(4),
            hairPuff_z: +(hairMax.z - hairMin.z).toFixed(4),
            head_y: +(headMax.y - headMin.y).toFixed(4),
          },
        };
      },
      {
        dbgKey: ep.debugVar,
        dataKey: ep.dataVar,
        duration: epMeta.duration,
        forbiddenTopicRegex: ep.forbiddenTopicRegex,
      }
    );

    const shotTimes = computeBeatShotTimes(epMeta.beats, ep.shots, epMeta.duration);
    const savedShots = [];
    for (const s of shotTimes) {
      await page.evaluate((t) => window.renderAt(t), s.t);
      await page.waitForTimeout(80);
      const outPath = path.join(OUT_DIR, `${ep.id}_${s.id}.png`);
      await page.screenshot({ path: outPath });
      savedShots.push({ beat: s.id, t: s.t, path: outPath });
    }

    const passed = shotsOnly
      ? errors.length === 0
      : (errors.length === 0 &&
        metrics.nanCount === 0 &&
        !metrics.hasPacoca &&
        metrics.maxAbsFootY <= 0.005 &&
        metrics.voceUniqueMouths > 15 &&
        metrics.camilaUniqueMouths > 15 &&
        metrics.leakCount === 0 &&
        metrics.subtitleSpeakerMismatches === 0 &&
        metrics.camilaMotionRanges.shoulderL_x > 0.05 &&
        metrics.camilaMotionRanges.hairPuff_x > 0.015);

    if (!passed) allPassed = false;
    summary.full[ep.id] = { passed, errors, ...metrics, savedShots };
    console.log(`[FULL ${ep.id}] passed=${passed} errors=${errors.length} metrics=${JSON.stringify(metrics)}`);
    await page.close();
  }

  for (const ep of SMOKE_EPS) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('requestfailed', (req) => {
      errors.push(`requestfailed: ${req.url()}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) errors.push(`http_${res.status()}: ${res.url()}`);
    });

    await page.goto(`${BASE_URL}/${ep.file}`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(
      ([dbgKey, dataKey]) => typeof window.renderAt === 'function' && !!window[dbgKey] && !!window[dataKey],
      [ep.debugVar, ep.dataVar],
      { timeout: 20000 }
    );

    const smokeRes = await page.evaluate(([dbgKey, dataKey]) => {
      const dbg = window[dbgKey];
      const data = window[dataKey];
      const dur = Number(data.duration || 30);
      let nanCount = 0;
      let maxAbsFootY = 0;
      const shMin = { x: Infinity }, shMax = { x: -Infinity };
      const hairMin = { x: Infinity }, hairMax = { x: -Infinity };

      const getFootWorldY = (g, defaultBaseY) => {
        const ud = (g && g.userData) || {};
        const baseY = (typeof ud.baseY === 'number' && Number.isFinite(ud.baseY)) ? ud.baseY : defaultBaseY;
        if (window.CartoonDistort3D && typeof window.CartoonDistort3D.computeFootWorldY === 'function') {
          return window.CartoonDistort3D.computeFootWorldY(g, baseY);
        }
        const footLocalY = (typeof ud.footLocalY === 'number' && Number.isFinite(ud.footLocalY)) ? ud.footLocalY : -0.37;
        const cZ = Math.cos((g.rotation && g.rotation.z) || 0);
        const cX = Math.cos((g.rotation && g.rotation.x) || 0);
        return g.position.y + g.scale.y * footLocalY * cZ * cX;
      };

      for (let i = 0; i <= 20; i++) {
        const t = (dur * i) / 20;
        window.renderAt(t);
        if (dbg.voce && dbg.voce.group) {
          const p = dbg.voce.group.position;
          if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) nanCount++;
          maxAbsFootY = Math.max(maxAbsFootY, Math.abs(getFootWorldY(dbg.voce.group, -0.37)));
        }
        if (dbg.camila && dbg.camila.group) {
          const p = dbg.camila.group.position;
          if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) nanCount++;
          maxAbsFootY = Math.max(maxAbsFootY, Math.abs(getFootWorldY(dbg.camila.group, -0.27)));
          if (dbg.camila.shoulderL?.root) {
            const rx = dbg.camila.shoulderL.root.rotation.x;
            if (!Number.isFinite(rx)) nanCount++;
            shMin.x = Math.min(shMin.x, rx);
            shMax.x = Math.max(shMax.x, rx);
          }
          if (dbg.camila.hairPuffGroup) {
            const hx = dbg.camila.hairPuffGroup.rotation.x;
            if (!Number.isFinite(hx)) nanCount++;
            hairMin.x = Math.min(hairMin.x, hx);
            hairMax.x = Math.max(hairMax.x, hx);
          }
        }
      }
      return {
        nanCount,
        maxAbsFootY: +maxAbsFootY.toFixed(5),
        shoulderL_range: +(shMax.x - shMin.x).toFixed(4),
        hairPuff_range: +(hairMax.x - hairMin.x).toFixed(4),
      };
    }, [ep.debugVar, ep.dataVar]);

    const passed = errors.length === 0 && smokeRes.nanCount === 0 && smokeRes.maxAbsFootY <= 0.005 && smokeRes.hairPuff_range > 0.01;
    if (!passed) allPassed = false;
    summary.smoke[ep.id] = { passed, errors, ...smokeRes };
    console.log(`[SMOKE ${ep.id}] passed=${passed} errors=${errors.length} ${JSON.stringify(smokeRes)}`);
    await page.close();
  }

  fs.writeFileSync(path.join(OUT_DIR, 'audit_summary.json'), JSON.stringify(summary, null, 2));
  await browser.close();
  console.log('ALL_PASSED=' + allPassed);
  if (!allPassed) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
