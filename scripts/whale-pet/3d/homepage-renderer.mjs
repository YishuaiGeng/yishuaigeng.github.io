import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

// Small transparent canvas only. The page controller owns positioning, focus and user preferences.
export async function createWhaleRenderer({ host, modelUrl, signal, onFailure, onFountainChange }) {
  const response = await fetch(modelUrl, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
  });
  if (!response.ok) throw new Error(`Whale model: ${response.status}`);
  const loaded = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
  const geometries = new Set(),
    materials = new Set();
  loaded.scene.traverse((object) => {
    if (object.isMesh) {
      geometries.add(object.geometry);
      for (const material of [object.material].flat()) materials.add(material);
    }
  });
  let renderer, environmentMap, resizeObserver, themeObserver;
  let frame = null,
    disposed = false,
    previous = 0,
    splash = false,
    swimTime = 0,
    swimDuration = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mixer = new THREE.AnimationMixer(loaded.scene);
  const fountain = mixer.clipAction(loaded.animations.find((clip) => clip.name === 'Fountain'));
  const swim = mixer.clipAction(loaded.animations.find((clip) => clip.name === 'Swim'));
  fountain.clampWhenFinished = true;
  const holder = new THREE.Group();
  holder.add(loaded.scene);
  const logo = loaded.scene.getObjectByName('Water_Logo');
  const eye = loaded.scene.getObjectByName('Eye_Core');
  const drops = [];
  loaded.scene.traverse((object) => {
    if (object.name.startsWith('Water_Drop_')) drops.push(object);
  });

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    themeObserver?.disconnect();
    mixer.stopAllAction();
    mixer.uncacheRoot(loaded.scene);
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    environmentMap?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer?.domElement.remove();
  }

  try {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    const scene = new THREE.Scene();
    scene.add(holder);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(3.1, 1.05, 8.2);
    camera.lookAt(0, -0.02, 0);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    try {
      environmentMap = pmrem.fromScene(environment, 0.04);
    } finally {
      environment.dispose();
      pmrem.dispose();
    }
    scene.environment = environmentMap.texture;
    scene.environmentIntensity = 0.65;
    for (const [color, intensity, position] of [
      ['#eef6ff', 2, [-3, 6, 6]],
      ['#74ceff', 3, [4, 2, -4]],
      ['#ffffff', 0.8, [1, -3, 4]],
    ]) {
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.fromArray(position);
      scene.add(light);
    }
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        if (!disposed) {
          dispose();
          onFailure();
        }
      },
      { signal },
    );
    host.append(renderer.domElement);
    const render = () => {
      if (!disposed) renderer.render(scene, camera);
    };
    const resetWater = () => {
      fountain.stop();
      logo.morphTargetInfluences.fill(0);
      drops.forEach((drop) => drop.scale.setScalar(0));
      splash = false;
      onFountainChange(false);
    };
    function stop() {
      cancelAnimationFrame(frame);
      frame = null;
      previous = 0;
      resetWater();
      swim.stop();
      swimDuration = 0;
      holder.rotation.set(0, 0, 0);
      holder.position.set(0, 0, 0);
      render();
    }
    mixer.addEventListener('finished', ({ action }) => {
      if (action === fountain) {
        resetWater();
        holder.position.y = 0;
      }
    });
    function update(now) {
      frame = null;
      if (disposed) return;
      if (document.hidden || reduce.matches) {
        stop();
        return;
      }
      if (previous && now - previous < 1000 / 30) {
        frame = requestAnimationFrame(update);
        return;
      }
      const dt = previous ? Math.min((now - previous) / 1000, 0.1) : 0;
      previous = now;
      mixer.update(dt);
      if (swimDuration) {
        swimTime += dt;
        const t = Math.min(1, swimTime / swimDuration);
        holder.rotation.y = Math.sin(t * Math.PI * 2) * 0.55;
        holder.rotation.z = Math.sin(t * Math.PI * 4) * 0.08;
        if (t === 1) {
          swimDuration = 0;
          swim.stop();
          holder.rotation.set(0, 0, 0);
        }
      }
      if (splash) holder.position.y = Math.sin(Math.min(1, fountain.time / 1.4) * Math.PI) * 0.13;
      render();
      if (splash || swimDuration) frame = requestAnimationFrame(update);
      else previous = 0;
    }
    function wake() {
      if (frame === null && !disposed) {
        previous = 0;
        frame = requestAnimationFrame(update);
      }
    }
    resizeObserver = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    });
    resizeObserver.observe(host);
    themeObserver = new MutationObserver(render);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return {
      splash() {
        if (disposed || reduce.matches || document.hidden) return;
        fountain.reset().setLoop(THREE.LoopOnce, 1).play();
        splash = true;
        onFountainChange(true);
        wake();
      },
      play(durationMs) {
        if (disposed || reduce.matches || document.hidden) return;
        swim.reset().play();
        swimTime = 0;
        swimDuration = durationMs / 1000;
        wake();
      },
      setState(state) {
        eye.scale.y =
          state === 'blink' || state === 'sleep' ? 0.12 : state === 'happy' ? 0.72 : 1.02;
        render();
      },
      stop,
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
