import * as THREE from 'three';

// The logo's two blue arcs are water jets from the blowhole, not part of the body.
const DURATION = 3.6;
const phases = [0, 0.22, 0.48, 0.8, 1.1, 1.5, 1.9, 2.3, 2.65, 3, 3.3, DURATION];
const collapse = [1, 0.96, 0.55, 0.08, 0, 0.07, 0, 0.09, 0.03, 0, 0, 0];
const ripple = [0, 0.3, 0.8, 0.2, 1, 0, 1, 0.1, 0.9, 0.25, 0, 0];
const v = (x, y, z = 0) => new THREE.Vector3(x, y, z);

function waterPosition(p, collapsed, rippled) {
  const small = v(p.x * 0.035, p.y * 0.025, p.z * 0.035);
  const waved = v(
    p.x + Math.sin(p.y * 8) * p.y * 0.035,
    p.y + Math.sin(p.y * 6) * p.y * 0.018,
    p.z + Math.sin(p.y * 7) * p.y * 0.04,
  );
  return p.clone().lerp(small, collapsed).addScaledVector(waved.sub(p), rippled);
}

function sample(values, t) {
  const index = Math.max(0, phases.findIndex((time) => time >= t) - 1);
  const fraction = (t - phases[index]) / (phases[index + 1] - phases[index]);
  return THREE.MathUtils.lerp(values[index], values[index + 1], fraction);
}

function animateLogoGeometry(geometry) {
  const positions = geometry.attributes.position;
  geometry.morphAttributes.position = [];
  geometry.morphAttributes.normal = [];
  for (const [collapsed, rippled] of [
    [1, 0],
    [0, 1],
  ]) {
    const shape = geometry.clone();
    shape.morphAttributes = {};
    const target = shape.attributes.position;
    for (let i = 0; i < target.count; i++) {
      const p = waterPosition(
        new THREE.Vector3().fromBufferAttribute(positions, i),
        collapsed,
        rippled,
      );
      target.setXYZ(i, p.x, p.y, p.z);
    }
    shape.computeVertexNormals();
    geometry.morphAttributes.position.push(target.clone());
    geometry.morphAttributes.normal.push(shape.attributes.normal.clone());
    shape.dispose();
  }
  return geometry;
}

function randomSequence(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const smooth = (x) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
const tipAt = (tip, time) => waterPosition(tip, sample(collapse, time), sample(ripple, time));

// Analytic gravity with linear air drag. Fine spray loses momentum faster than large drops.
function flight(origin, velocity, drag, age) {
  const decay = Math.exp(-drag * age);
  const travel = (1 - decay) / drag;
  const position = origin.clone().addScaledVector(velocity, travel);
  position.y -= (3.6 * (age - travel)) / drag;
  const speed = velocity.clone().multiplyScalar(decay);
  speed.y -= 3.6 * travel;
  return { position, speed };
}

function keyTimes(start, end, extra = []) {
  const times = [
    ...new Set([
      0,
      DURATION,
      start,
      end,
      ...extra,
      ...Array.from({ length: Math.ceil((end - start) * 40) + 1 }, (_, i) =>
        Math.min(end, start + i / 40),
      ),
    ]),
  ].sort((a, b) => a - b);
  // Keep exact birth/end boundaries: rounding the end down would leave a neck stretched.
  return times.filter(
    (time, index) => index === times.length - 1 || times[index + 1] - time > 0.00001,
  );
}

export function createFountain(material, logo, dropletMaterial = material) {
  const root = new THREE.Group();
  root.name = 'Fountain_Water';
  // Preserve the approved sculpted silhouette both before and after each one-shot spray.
  // Local (0,0,0) is the blowhole; only the spray starts from a collapsed water shape.
  const tracks = [],
    streams = [];
  const weights = phases.flatMap((_, index) => [collapse[index], ripple[index]]);
  animateLogoGeometry(logo.geometry);
  logo.updateMorphTargets();
  logo.name = 'Water_Logo';
  logo.morphTargetInfluences = [0, 0];
  root.add(logo);
  streams.push(logo);
  tracks.push(new THREE.NumberKeyframeTrack('Water_Logo.morphTargetInfluences', phases, weights));
  const drops = [],
    releasePoints = [];
  const random = randomSequence(0x57a1e);
  const dropGeometry = new THREE.SphereGeometry(1, 20, 14);
  const neckGeometry = new THREE.CylinderGeometry(1, 1, 1, 10, 1);
  const up = v(0, 1);

  function addDrop({
    name,
    tip,
    birth,
    release,
    life,
    radius,
    velocity,
    drag,
    origin,
    fine = false,
  }) {
    const drop = new THREE.Mesh(dropGeometry, dropletMaterial);
    drop.name = `Water_Drop_${name}`;
    drop.scale.setScalar(0);
    root.add(drop);
    drops.push(drop);
    const end = release + life;
    const times = keyTimes(birth, end, [release, release + 0.06, end - 0.12]);
    const positions = [],
      scales = [],
      rotations = [];
    const wobbleFrequency = 24 + random() * 10;
    const axis = new THREE.Quaternion().setFromUnitVectors(up, velocity.clone().normalize());

    function pose(time) {
      const age = Math.max(0, time - release);
      if (time < release && !fine) {
        const growth = smooth((time - birth) / (release - birth));
        const position = tipAt(tip, Math.max(birth, time));
        position.addScaledVector(velocity.clone().normalize(), radius * 2.8 * growth);
        return { position, speed: velocity, size: Math.cbrt(growth), stretch: 1 + 0.8 * growth };
      }
      const state = flight(origin, velocity, drag, Math.min(age, life));
      const settle = Math.exp(-age * 7);
      // The neck stretches at detachment; surface tension then rounds the drop with a small wobble.
      const stretch = fine
        ? 1 + 0.22 * Math.exp(-age * 8)
        : 1 + 0.8 * settle + 0.13 * Math.sin(age * wobbleFrequency) * Math.exp(-age * 5);
      const born = fine ? smooth(age / 0.025) : 1;
      const dissolve = smooth((end - time) / (fine ? 0.1 : 0.12));
      return { ...state, size: born * dissolve, stretch };
    }

    times.forEach((time) => {
      const state = pose(time);
      const alive = time > birth && time < end;
      const r = alive ? radius * state.size : 0;
      positions.push(...state.position.toArray());
      // Preserve volume when stretching: a long droplet becomes narrower, not larger.
      const transverse = r / Math.sqrt(state.stretch);
      scales.push(transverse, r * state.stretch, transverse);
      const q =
        state.speed.lengthSq() > 0.00001
          ? new THREE.Quaternion().setFromUnitVectors(up, state.speed.clone().normalize())
          : axis;
      rotations.push(...q.toArray());
    });
    tracks.push(new THREE.VectorKeyframeTrack(`${drop.name}.position`, times, positions));
    tracks.push(new THREE.VectorKeyframeTrack(`${drop.name}.scale`, times, scales));
    tracks.push(new THREE.QuaternionKeyframeTrack(`${drop.name}.quaternion`, times, rotations));

    if (!fine) {
      const neck = new THREE.Mesh(neckGeometry, dropletMaterial);
      neck.name = `Water_Drop_Neck_${name}`;
      neck.scale.setScalar(0);
      root.add(neck);
      drops.push(neck);
      const neckTimes = keyTimes(birth, release, [birth + 0.015, release - 0.01]);
      const p = [],
        s = [],
        q = [];
      neckTimes.forEach((time) => {
        const t = THREE.MathUtils.clamp((time - birth) / (release - birth), 0, 1);
        const a = tipAt(tip, THREE.MathUtils.clamp(time, birth, release));
        const b = pose(Math.min(time, release - 0.00001)).position;
        const delta = b.clone().sub(a);
        const length = delta.length();
        p.push(...a.clone().lerp(b, 0.5).toArray());
        const width = radius * 0.48 * Math.sin(Math.PI * t) * Math.pow(1 - t, 0.65);
        s.push(width, time > birth && time < release ? length : 0, width);
        q.push(
          ...(length > 0.000001
            ? new THREE.Quaternion().setFromUnitVectors(up, delta.normalize())
            : axis
          ).toArray(),
        );
      });
      tracks.push(new THREE.VectorKeyframeTrack(`${neck.name}.position`, neckTimes, p));
      tracks.push(new THREE.VectorKeyframeTrack(`${neck.name}.scale`, neckTimes, s));
      tracks.push(new THREE.QuaternionKeyframeTrack(`${neck.name}.quaternion`, neckTimes, q));
    }
  }

  for (const [side, endpoint] of [
    ['Right', v(0.73, 0.3)],
    ['Left', v(-0.73, 0.07)],
  ]) {
    const direction = side === 'Right' ? 1 : -1;
    for (let i = 0; i < 5; i++) {
      const birth =
        [0.78, 1.05, 1.4, 1.76, 2.14][i] + random() * 0.055 + (side === 'Left' ? 0.07 : 0);
      const release = birth + 0.065 + random() * 0.035;
      const radius = (side === 'Right' ? 0.056 : 0.047) * (0.8 + random() * 0.6);
      const life = 0.67 + random() * 0.19;
      const depthDirection = i % 2 === 0 ? 1 : -1;
      // Emit from the rounded tip surface; the short neck must not be buried in the logo.
      const tip = endpoint.clone();
      tip.z = depthDirection * 0.11;
      const velocity = v(
        direction * (0.35 + random() * 0.5),
        -0.1 + random() * 0.22,
        depthDirection * (0.72 + random() * 0.3),
      );
      const origin = tipAt(tip, release).addScaledVector(
        velocity.clone().normalize(),
        radius * 2.8,
      );
      const drag = 0.3 + random() * 0.4;
      releasePoints.push({
        name: `Water_Drop_${side}_${i}`,
        time: release,
        local: origin.toArray(),
        radius,
        velocity: velocity.toArray(),
        drag,
      });
      addDrop({ name: `${side}_${i}`, tip, birth, release, life, radius, velocity, drag, origin });
      // Smaller satellite drops separate during breakup, with a wider spray cone and stronger drag.
      for (let j = 0; j < (i % 2 === 0 ? 2 : 1); j++) {
        const delay = 0.035 + random() * 0.055;
        const mistRelease = release + delay;
        const mistOrigin = flight(origin, velocity, drag, delay).position;
        const mistVelocity = velocity
          .clone()
          .add(
            v(direction * (0.25 + random() * 0.55), 0.15 + random() * 0.55, (random() - 0.5) * 0.8),
          );
        addDrop({
          name: `Mist_${side}_${i}_${j}`,
          tip,
          birth: mistRelease,
          release: mistRelease,
          life: 0.38 + random() * 0.2,
          radius: 0.016 + random() * 0.013,
          velocity: mistVelocity,
          drag: 2 + random() * 1.2,
          origin: mistOrigin,
          fine: true,
        });
      }
    }
  }
  root.userData = {
    role: 'Water emitted from the whale blowhole',
    releasePoints,
    dropDynamics:
      'Gravity, size-dependent drag, liquid-neck breakup, volume-preserving shape relaxation',
  };
  const clip = new THREE.AnimationClip('Fountain', DURATION, tracks);
  return { root, clip, streams, drops, duration: DURATION };
}
