import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const design = path.join(repo, 'design/whale-pet');
const output = path.join(repo, 'public/assets/img/whale-pet');
const states = ['idle', 'blink', 'happy', 'thinking', 'sleep', 'reading'];
const baseUrl = '/assets/img/whale-pet';
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const webManifest = { version: '0.2', width: 512, height: 512, states: {} };
const designManifest = {
  version: '0.2',
  name: 'Whale Pet — original gloss',
  figma: { url: 'https://www.figma.com/design/aWj8wKmVFVCfLjJfddQwgf', v02Synced: false },
  reference: 'reference/whale-original.png',
  material: 'Editable vector contours with embedded raster textures; reconstructed SVG shadows',
  viewBox: [0, 0, 1254, 1254],
  outputSize: [512, 512],
  editableGroups: ['body', 'tail', 'spout', 'eye', 'expression'],
  expressionScale: { happy: 1.6, thinking: 1.6, sleep: 1.6 },
  preview: 'v02-glossy/comparison.html',
  characterSheet: 'v02-glossy/whale-pet-character-sheet.png',
  contours: 'v02-glossy/whale-pet-editable-contours.svg',
  originalArchive: 'v02-glossy/whale-pet-glossy-v02.zip',
  scripts: '../../scripts/whale-pet/',
  runtimeManifest: '../../public/assets/img/whale-pet/manifest.json',
  states: {},
};

await mkdir(output, { recursive: true });
let pngBytes = 0;
let webpBytes = 0;

for (const state of states) {
  const pngPath = `v02-glossy/whale-pet-${state}.png`;
  const svgPath = `v02-glossy/whale-pet-${state}.svg`;
  const png = await readFile(path.join(design, pngPath));
  const svg = await readFile(path.join(design, svgPath));
  const webp = await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer();
  const original = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const decoded = await sharp(webp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (
    original.info.width !== 512 ||
    original.info.height !== 512 ||
    decoded.info.width !== 512 ||
    decoded.info.height !== 512 ||
    original.data.length !== decoded.data.length
  ) {
    throw new Error(`Unexpected dimensions: ${state}`);
  }
  // RGB values of fully transparent pixels have no visible effect and WebP may discard them.
  for (let i = 0; i < original.data.length; i += 4) {
    if (
      original.data[i + 3] !== decoded.data[i + 3] ||
      (original.data[i + 3] > 0 &&
        !original.data.subarray(i, i + 3).equals(decoded.data.subarray(i, i + 3)))
    ) {
      throw new Error(`Lossless pixel verification failed: ${state}, pixel ${i / 4}`);
    }
  }

  await copyFile(path.join(design, pngPath), path.join(output, `${state}.png`));
  await writeFile(path.join(output, `${state}.webp`), webp);
  webManifest.states[state] = { webp: `${baseUrl}/${state}.webp`, png: `${baseUrl}/${state}.png` };
  designManifest.states[state] = {
    svg: { path: svgPath, bytes: svg.length, sha256: sha256(svg) },
    png: { path: pngPath, bytes: png.length, sha256: sha256(png) },
    webp: { url: webManifest.states[state].webp, bytes: webp.length, sha256: sha256(webp) },
    visiblePixelsAndAlphaMatch: true,
  };
  pngBytes += png.length;
  webpBytes += webp.length;
}

designManifest.webExport = {
  pngBytes,
  webpBytes,
  reductionPercent: Number(((1 - webpBytes / pngBytes) * 100).toFixed(1)),
};
await writeFile(path.join(output, 'manifest.json'), JSON.stringify(webManifest, null, 2) + '\n');
await writeFile(path.join(design, 'manifest.json'), JSON.stringify(designManifest, null, 2) + '\n');
console.log(JSON.stringify({ exportedStates: states.length, ...designManifest.webExport }));
