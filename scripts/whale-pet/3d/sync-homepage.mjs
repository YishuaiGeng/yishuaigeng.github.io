import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(source, '../../..');
const runtime = path.join(root, 'public/assets/js/whale-pet');
const models = path.join(root, 'public/assets/models/whale-pet');

export async function syncHomepage() {
  await fs.mkdir(path.join(runtime, 'vendor'), { recursive: true });
  await fs.mkdir(models, { recursive: true });
  for (const name of [
    'three.module.js',
    'three.core.js',
    'GLTFLoader.js',
    'BufferGeometryUtils.js',
    'SkeletonUtils.js',
    'RoomEnvironment.js',
    'LICENSE',
  ]) {
    const content = await fs.readFile(path.join(source, 'vendor', name), 'utf8');
    // Keep the official code and license; local module specifiers avoid a global import map or CDN.
    await fs.writeFile(
      path.join(runtime, 'vendor', name),
      content
        .replaceAll("from 'three'", "from './three.module.js'")
        .replaceAll("from '../utils/", "from './"),
    );
  }
  await fs.copyFile(
    path.join(source, 'homepage-renderer.mjs'),
    path.join(runtime, 'homepage-renderer.mjs'),
  );
  await fs.copyFile(
    path.join(root, 'design/whale-pet/3d/whale-outline-v01.glb'),
    path.join(models, 'whale-outline-v01.glb'),
  );
  console.log('Synced approved whale model and self-hosted runtime to public/.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await syncHomepage();
