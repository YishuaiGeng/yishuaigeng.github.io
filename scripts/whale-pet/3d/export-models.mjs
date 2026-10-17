import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { syncHomepage } from './sync-homepage.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const output = path.join(root, 'design/whale-pet/3d');
const url = process.argv[2] || 'http://127.0.0.1:8766/design/whale-pet/3d/';
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => !!window.whaleStudy);
  assert.equal(await page.evaluate(() => window.whaleStudy.fountainState().running), false);
  assert.deepEqual(await page.evaluate(() => window.whaleStudy.fountainState().weights), [0, 0]);
  const exports = [];
  for (const belly of [false, true]) {
    const model = await page.evaluate(async (filled) => {
      const bytes = await window.whaleStudy.exportModel(filled);
      const verification = await window.whaleStudy.verifyGlb(bytes);
      return { bytes: Array.from(new Uint8Array(bytes)), verification };
    }, belly);
    assert.deepEqual(model.verification.animations, ['Swim', 'Fountain']);
    assert.ok(model.verification.waterHeights[1] > model.verification.waterHeights[0] * 4);
    assert.ok(model.verification.waterHeights[2] > model.verification.waterHeights[0] * 4);
    assert.ok(
      Math.abs(model.verification.waterHeights[2] - model.verification.waterHeights[1]) < 0.1,
    );
    assert.ok(model.verification.min.every(Number.isFinite));
    assert.ok(model.verification.max.every(Number.isFinite));
    assert.ok(model.verification.max[2] - model.verification.min[2] > 0.4);
    const water = model.verification.waterDrops;
    assert.ok(water.transmission > 0.6);
    assert.ok(Math.abs(water.ior - 1.333) < 0.001);
    assert.ok(water.poses[2].position[1] < water.poses[1].position[1]);
    assert.ok(
      water.poses[1].scale[1] / water.poses[1].scale[0] >
        water.poses[2].scale[1] / water.poses[2].scale[0],
    );
    assert.notDeepEqual(water.poses[1].rotation, water.poses[2].rotation);
    assert.ok(water.depthSpread > 0.45);
    assert.equal(water.activeAtEnd, 0);
    const name = `whale-${belly ? 'volume' : 'outline'}-v01.glb`;
    await fs.writeFile(path.join(output, name), Buffer.from(model.bytes));
    exports.push({ file: name, bytes: model.bytes.length, ...model.verification });
  }
  await page.waitForTimeout(700);
  await page.evaluate(() => window.whaleStudy.render());
  await page.screenshot({ path: path.join(output, 'preview-angle.png') });
  for (const [view, name] of [
    ['front', '正面'],
    ['side', '侧面'],
    ['back', '背面'],
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, `preview-${view}.png`) });
  }
  await page.getByRole('button', { name: '浅色腹部', exact: true }).click();
  await page.getByRole('button', { name: '三分之四', exact: true }).click();
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(output, 'preview-volume.png') });
  await page.getByRole('button', { name: '摆尾游动', exact: true }).click();
  await page.waitForTimeout(300);
  assert.ok(
    await page.evaluate(() => Math.abs(window.whaleStudy.whale.parts.tail.quaternion.y) > 0.001),
  );
  await page.getByRole('button', { name: '摆尾游动', exact: true }).click();
  await page.getByRole('button', { name: '喷水', exact: true }).click();
  await page.waitForFunction(() => window.whaleStudy.fountainState().drops > 0);
  assert.ok(await page.evaluate(() => window.whaleStudy.fountainState().weights[0] < 0.2));
  await page.waitForFunction(() => !window.whaleStudy.fountainState().burst);
  assert.equal(await page.evaluate(() => window.whaleStudy.fountainState().drops), 0);
  assert.deepEqual(await page.evaluate(() => window.whaleStudy.fountainState().weights), [0, 0]);
  assert.equal(await page.evaluate(() => window.whaleStudy.fountainState().running), false);
  for (const time of [0.2, 0.55, 1.35, 2.5, 3.4]) {
    await page.evaluate((t) => window.whaleStudy.showFountainAt(t), time);
    await page.screenshot({ path: path.join(output, `water-phase-${time}.png`) });
  }
  await page.getByRole('button', { name: '中空标志', exact: true }).click();
  await page.evaluate(() => window.whaleStudy.showFountainAt(1.55));
  await page.screenshot({ path: path.join(output, 'preview-water.png') });
  // Water is parented to the whale, so thickness, tilt, and swimming all keep the source attached.
  assert.equal(
    await page.evaluate(() => window.whaleStudy.whale.fountain.root.parent.name),
    'Swim_Rig',
  );
  await page.getByRole('button', { name: '喷水', exact: true }).click({ clickCount: 3, delay: 40 });
  assert.equal(await page.evaluate(() => window.whaleStudy.fountainState().running), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !window.whaleStudy.fountainState().running);
  assert.equal(await page.evaluate(() => window.whaleStudy.fountainState().running), false);
  assert.equal(await page.evaluate(() => window.whaleStudy.fountainState().drops), 0);
  assert.deepEqual(await page.evaluate(() => window.whaleStudy.fountainState().weights), [0, 0]);
  await page.getByRole('button', { name: '摆尾游动', exact: true }).click();
  assert.equal(
    await page.getByRole('button', { name: '摆尾游动', exact: true }).getAttribute('aria-pressed'),
    'false',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: path.join(output, 'preview-mobile.png'), fullPage: true });
  assert.deepEqual(errors, []);
  const report = {
    date: new Date().toISOString().slice(0, 10),
    threeRevision: '185',
    exports,
    checks: [
      'GLB reimport',
      'finite bounds and real depth',
      'Swim animation',
      'water morph animation survives GLB reimport',
      'water refraction material survives GLB reimport',
      'droplets fall, round out, turn and disperse in depth after GLB reimport',
      'all droplets and liquid necks disappear at the end',
      'original top water is visible at rest',
      'spray grows from nothing and restores original top water',
      'rapid repeat activation and reduced-motion interruption preserve rest shape',
      'fountain follows whale transforms',
      'reduced motion',
      '390px layout',
      'no page errors',
    ],
  };
  await fs.writeFile(path.join(output, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
  await syncHomepage();
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
