import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { GLTFExporter } from './vendor/GLTFExporter.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createWhale } from './model.mjs';

const host = document.querySelector('#canvas-host');
const status = document.querySelector('#status');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
} catch {
  status.textContent = '当前浏览器无法启用 WebGL。可下载 GLB 后在 Blender 中查看。';
  for (const control of document.querySelectorAll('button,input')) control.disabled = true;
  throw new Error('WebGL unavailable');
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
host.append(renderer.domElement);
renderer.domElement.setAttribute(
  'aria-label',
  '可拖动旋转的三维鲸鱼；也可使用正面、侧面和背面按钮',
);
renderer.domElement.setAttribute('role', 'img');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 20;
controls.target.set(0, -0.12, 0);
const environment = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
const env = pmrem.fromScene(environment, 0.04);
scene.environment = env.texture;
scene.environmentIntensity = 0.65;
environment.dispose();
pmrem.dispose();
const key = new THREE.DirectionalLight('#eef6ff', 2);
key.position.set(-3, 6, 6);
scene.add(key);
const rim = new THREE.DirectionalLight('#74ceff', 3);
rim.position.set(4, 2, -4);
scene.add(rim);
const fill = new THREE.DirectionalLight('#ffffff', 0.8);
fill.position.set(1, -3, 4);
scene.add(fill);
const response = await fetch(
  new URL('../../../design/whale-pet/3d/contours.json', import.meta.url),
);
if (!response.ok) throw new Error(`Cannot load contours: ${response.status}`);
const whale = createWhale(await response.json());
const holder = new THREE.Group();
holder.add(whale.root);
scene.add(holder);
const mixer = new THREE.AnimationMixer(whale.root);
const swim = mixer.clipAction(whale.clips[0]);
const waterFlow = mixer.clipAction(whale.fountain.clip);
waterFlow.clampWhenFinished = true;
let swimming = false,
  waterRunning = false,
  splashStart = null,
  frame = null,
  previous = 0;
mixer.addEventListener('finished', (event) => {
  if (event.action !== waterFlow) return;
  splashStart = null;
  holder.position.y = 0;
  waterRunning = false;
});
function triangleCount() {
  let triangles = 0;
  whale.root.traverse((object) => {
    if (object.isMesh && object.visible)
      triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
  });
  return triangles;
}
function render() {
  renderer.render(scene, camera);
}
function restoreStillPose() {
  swimming = false;
  swim.stop();
  waterRunning = false;
  waterFlow.stop();
  splashStart = null;
  holder.position.y = 0;
  whale.fountain.streams.forEach((stream) => stream.morphTargetInfluences.fill(0));
  whale.fountain.drops.forEach((drop) => drop.scale.setScalar(0));
  document.querySelector('#swim').setAttribute('aria-pressed', 'false');
}
function updateFrame(time) {
  frame = null;
  if (document.hidden) return;
  if (reduce.matches && (swimming || waterRunning || splashStart !== null)) {
    restoreStillPose();
    render();
    return;
  }
  const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
  previous = time;
  if ((swimming || waterRunning) && !reduce.matches) mixer.update(dt);
  if (splashStart !== null) {
    const t = (time - splashStart) / 1000;
    holder.position.y =
      t < 0.45
        ? Math.sin((Math.min(1, t / 0.45) * Math.PI) / 2) * 0.2
        : Math.max(0, 1 - (t - 0.7) / 0.7) * 0.2;
  }
  render();
  if (((swimming || waterRunning) && !reduce.matches) || splashStart !== null)
    frame = requestAnimationFrame(updateFrame);
}
function wake() {
  if (frame === null && !document.hidden) {
    previous = 0;
    frame = requestAnimationFrame(updateFrame);
  }
}
function resize() {
  const { width, height } = host.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  setView(activeView);
  wake();
}
let activeView = 'angle';
function setView(view) {
  activeView = view;
  const distance = camera.aspect < 0.8 ? 14 : 10.2;
  const directions = {
    front: [0, 0.08, 1],
    angle: [0.43, 0.15, 1],
    side: [1, 0.1, 0.05],
    back: [0, 0.08, -1],
  };
  camera.position
    .fromArray(directions[view])
    .normalize()
    .multiplyScalar(distance)
    .add(controls.target);
  controls.update();
  render();
  for (const button of document.querySelectorAll('[data-view]'))
    button.setAttribute('aria-pressed', String(button.dataset.view === view));
}
new ResizeObserver(resize).observe(host);
controls.addEventListener('change', render);
for (const button of document.querySelectorAll('[data-view]'))
  button.addEventListener('click', () => setView(button.dataset.view));
for (const button of document.querySelectorAll('[data-belly]'))
  button.addEventListener('click', () => {
    whale.parts.belly.visible = button.dataset.belly === 'true';
    whale.parts.Eye_Core.visible = !whale.parts.belly.visible;
    whale.parts.Eye_Front.visible = whale.parts.Eye_Back.visible = whale.parts.belly.visible;
    for (const item of document.querySelectorAll('[data-belly]'))
      item.setAttribute('aria-pressed', String(item === button));
    render();
  });
document.querySelector('#depth').addEventListener('input', (event) => {
  whale.root.scale.z = Number(event.target.value);
  document.querySelector('#depth-value').textContent = `${Number(event.target.value).toFixed(2)}×`;
  render();
});
document.querySelector('#roughness').addEventListener('input', (event) => {
  whale.materials.blue.roughness = Number(event.target.value);
  document.querySelector('#roughness-value').textContent = event.target.value;
  render();
});
for (const button of document.querySelectorAll('[data-light]'))
  button.addEventListener('click', () => {
    const studio = button.dataset.light === 'studio';
    scene.environmentIntensity = studio ? 0.65 : 0.22;
    key.intensity = studio ? 2 : 1.2;
    rim.intensity = studio ? 3 : 6;
    fill.intensity = studio ? 0.8 : 0.6;
    for (const item of document.querySelectorAll('[data-light]'))
      item.setAttribute('aria-pressed', String(item === button));
    render();
  });
document.querySelector('#swim').addEventListener('click', (event) => {
  if (reduce.matches) {
    status.textContent = '已遵循减少动态效果设置；仍可切换角度与形态。';
    return;
  }
  swimming = !swimming;
  event.target.setAttribute('aria-pressed', String(swimming));
  if (swimming) swim.play();
  else {
    swim.stop();
    render();
  }
  wake();
});
document.querySelector('#splash').addEventListener('click', () => {
  if (reduce.matches) {
    status.textContent = '已遵循减少动态效果设置，喷水动画已暂停。';
    return;
  }
  splashStart = performance.now();
  waterFlow.reset().setLoop(THREE.LoopOnce, 1).setEffectiveTimeScale(1).play();
  waterRunning = true;
  wake();
});
reduce.addEventListener('change', (event) => {
  if (event.matches) {
    restoreStillPose();
    render();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (splashStart !== null) {
      splashStart = null;
      holder.position.y = 0;
      waterFlow.stop();
      waterRunning = false;
    }
  } else wake();
});
async function exportModel(belly = whale.parts.belly.visible) {
  const clone = whale.root.clone(true);
  clone.getObjectByName('Belly_Optional').visible = belly;
  clone.getObjectByName('Eye_Core').visible = !belly;
  clone.getObjectByName('Eye_Front').visible = clone.getObjectByName('Eye_Back').visible = belly;
  clone.getObjectByName('Swim_Rig').position.set(0, 0, 0);
  clone.getObjectByName('Tail_Pivot').quaternion.identity();
  clone.traverse((object) => {
    if (object.name.startsWith('Water_Drop_')) {
      object.scale.setScalar(0);
      object.position.set(0, 0, 0);
      object.quaternion.identity();
    }
    if (object.morphTargetInfluences) object.morphTargetInfluences.fill(0);
  });
  clone.updateMatrixWorld(true);
  return new GLTFExporter().parseAsync(clone, {
    binary: true,
    animations: whale.clips,
    onlyVisible: true,
  });
}
document.querySelector('#export').addEventListener('click', async (event) => {
  event.target.disabled = true;
  try {
    const glb = await exportModel();
    const url = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = whale.parts.belly.visible ? 'whale-volume-v01.glb' : 'whale-outline-v01.glb';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = '模型已导出，可在 Blender 中导入 GLB。';
  } catch (error) {
    status.textContent = `导出失败：${error.message}`;
  } finally {
    event.target.disabled = false;
  }
});
// Local build/QA hook. No network transmission, telemetry or remote write operations.
window.whaleStudy = {
  whale,
  scene,
  camera,
  controls,
  renderer,
  exportModel,
  render,
  setView,
  fountainState: () => ({
    running: waterRunning,
    burst: splashStart !== null,
    time: waterFlow.time,
    drops: whale.fountain.drops.filter((drop) => drop.scale.x > 0.001).length,
    weights: [...whale.fountain.streams[0].morphTargetInfluences],
  }),
  showFountainAt: (time) => {
    waterRunning = false;
    waterFlow.reset().setLoop(THREE.LoopRepeat, Infinity).setEffectiveTimeScale(1).play();
    waterFlow.time = time;
    mixer.update(0);
    waterFlow.paused = true;
    render();
  },
  stats: () => ({ triangles: triangleCount(), revision: THREE.REVISION }),
  verifyGlb: async (buffer) => {
    const loaded = await new GLTFLoader().parseAsync(buffer, '');
    const bounds = new THREE.Box3().setFromObject(loaded.scene, true);
    const checkMixer = new THREE.AnimationMixer(loaded.scene);
    const fountainClip = loaded.animations.find((clip) => clip.name === 'Fountain');
    const action = checkMixer.clipAction(fountainClip).play();
    const heights = [0.2, 1.2, 3.4].map((time) => {
      action.time = time;
      checkMixer.update(0);
      const box = new THREE.Box3().setFromObject(loaded.scene.getObjectByName('Water_Logo'), true);
      return box.max.y - box.min.y;
    });
    const drops = [];
    loaded.scene.traverse((object) => {
      if (object.name.startsWith('Water_Drop_')) drops.push(object);
    });
    const released = loaded.scene.getObjectByName('Fountain_Water').userData.releasePoints[0];
    const drop = loaded.scene.getObjectByName(released.name);
    const dropPoses = [released.time - 0.015, released.time + 0.05, released.time + 0.25].map(
      (time) => {
        action.time = time;
        checkMixer.update(0);
        return {
          time,
          position: drop.position.toArray(),
          scale: drop.scale.toArray(),
          rotation: drop.quaternion.toArray(),
        };
      },
    );
    action.time = 1.45;
    checkMixer.update(0);
    const flying = drops.filter((object) => object.scale.x > 0.005);
    const depthSpread =
      Math.max(...flying.map((object) => object.position.z)) -
      Math.min(...flying.map((object) => object.position.z));
    action.time = 3.4;
    checkMixer.update(0);
    const activeAtEnd = drops.filter((object) => object.scale.lengthSq() > 0.000001).length;
    checkMixer.stopAllAction();
    checkMixer.uncacheRoot(loaded.scene);
    return {
      animations: loaded.animations.map((clip) => clip.name),
      waterHeights: heights,
      waterDrops: {
        transmission: drop.material.transmission,
        ior: drop.material.ior,
        poses: dropPoses,
        depthSpread,
        activeAtEnd,
      },
      min: bounds.min.toArray(),
      max: bounds.max.toArray(),
      meshes: (() => {
        let count = 0;
        loaded.scene.traverse((o) => {
          if (o.isMesh) count++;
        });
        return count;
      })(),
    };
  },
};
status.textContent = '真实几何体 · PBR 材质 · 可导入 Blender';
resize();
