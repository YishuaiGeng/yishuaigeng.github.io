import * as THREE from 'three';
import { SVGLoader } from './vendor/SVGLoader.js';
import { mergeVertices } from './vendor/BufferGeometryUtils.js';
import { createFountain } from './fountain.mjs';

// Model units: 250 reference pixels = 1 unit. Front is +Z, up is +Y.
const UNIT = 1 / 250;
const point = (x, y, z = 0) => new THREE.Vector3((x - 640) * UNIT, (620 - y) * UNIT, z);

function simplify(points, tolerance = 1.1) {
  if (points.length < 4) return points;
  const a = points[0],
    b = points.at(-1);
  let max = 0,
    index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const ab = b.clone().sub(a);
    const t = Math.max(0, Math.min(1, points[i].clone().sub(a).dot(ab) / (ab.lengthSq() || 1)));
    const distance = points[i].distanceTo(a.clone().addScaledVector(ab, t));
    if (distance > max) {
      max = distance;
      index = i;
    }
  }
  return max > tolerance
    ? [
        ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
        ...simplify(points.slice(index), tolerance),
      ]
    : [a, b];
}

function outline(path, isShape) {
  const raw = path.getPoints(3);
  let simplified = simplify(raw);
  if (simplified[0].distanceTo(simplified.at(-1)) < 0.001) simplified.pop();
  // Round tracing corners before beveling so raster-sized notches do not become spikes.
  for (let pass = 0; pass < 1; pass++) {
    simplified = simplified.flatMap((a, i) => {
      const b = simplified[(i + 1) % simplified.length];
      return [a.clone().lerp(b, 0.18), a.clone().lerp(b, 0.82)];
    });
  }
  const points = simplified.map((p) => new THREE.Vector2((p.x - 640) * UNIT, (620 - p.y) * UNIT));
  const result = isShape ? new THREE.Shape(points) : new THREE.Path(points);
  if (isShape) result.holes = path.holes.map((hole) => outline(hole, false));
  return result;
}

function solid(layer, material, depth, bevel, pivot) {
  const svg = new SVGLoader().parse(
    `<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" fill-rule="evenodd" d="${layer.contour}"/></svg>`,
  );
  const shapes = svg.paths
    .flatMap((path) => SVGLoader.createShapes(path))
    .map((shape) => outline(shape, true));
  const raw = new THREE.ExtrudeGeometry(shapes, {
    steps: 1,
    depth,
    bevelEnabled: true,
    bevelThickness: bevel * 1.65,
    bevelSize: bevel,
    bevelSegments: 8,
    curveSegments: 1,
  });
  raw.translate(-pivot.x, -pivot.y, -depth / 2);
  raw.deleteAttribute('uv');
  raw.deleteAttribute('normal');
  const geometry = mergeVertices(raw, 0.0001);
  geometry.computeVertexNormals();
  // Keep the small planar caps flat; averaged triangulation normals cause diagonal highlights.
  const capZ = depth / 2 + bevel * 1.65;
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const z = geometry.attributes.position.getZ(i);
    if (Math.abs(Math.abs(z) - capZ) < 0.0001)
      geometry.attributes.normal.setXYZ(i, 0, 0, Math.sign(z));
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${layer.name}_mesh`;
  raw.dispose();
  return mesh;
}

export function createWhale(artwork) {
  const root = new THREE.Group();
  root.name = 'Whale_Root';
  const rig = new THREE.Group();
  rig.name = 'Swim_Rig';
  root.add(rig);
  const blue = new THREE.MeshPhysicalMaterial({
    color: '#0755ea',
    metalness: 0.05,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
  });
  const water = new THREE.MeshPhysicalMaterial({
    color: '#08aff7',
    metalness: 0.08,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const eyeMaterial = new THREE.MeshPhysicalMaterial({
    color: '#070a12',
    roughness: 0.14,
    metalness: 0.08,
    clearcoat: 1,
  });
  const droplets = new THREE.MeshPhysicalMaterial({
    name: 'Clear water droplets',
    color: '#8cddff',
    metalness: 0,
    roughness: 0.055,
    transmission: 0.72,
    thickness: 0.12,
    ior: 1.333,
    attenuationColor: '#6bcfff',
    attenuationDistance: 1.2,
    clearcoat: 0.35,
    clearcoatRoughness: 0.05,
  });
  const materials = { blue, water, droplets, eye: eyeMaterial };
  const parts = {};
  for (const layer of artwork.layers.filter((layer) => ['body', 'tail'].includes(layer.name))) {
    const pivot = layer.name === 'tail' ? point(918, 800) : new THREE.Vector3();
    const group = new THREE.Group();
    group.name = `${layer.name[0].toUpperCase() + layer.name.slice(1)}_Pivot`;
    group.position.copy(pivot);
    const depth = layer.name === 'body' ? 0.1 : 0.06;
    const bevel = layer.name === 'body' ? 0.1 : 0.085;
    group.add(solid(layer, blue, depth, bevel, pivot));
    rig.add(group);
    parts[layer.name] = group;
  }
  const spoutPivot = point(577, 400);
  const originalSpout = solid(
    artwork.layers.find((layer) => layer.name === 'spout'),
    water,
    0.06,
    0.065,
    spoutPivot,
  );
  const fountain = createFountain(water, originalSpout, droplets);
  fountain.root.position.copy(spoutPivot);
  rig.add(fountain.root);
  parts.spout = fountain.root;
  // A separate optional softly squared volume explores a filled character body.
  const bellyGeometry = new THREE.SphereGeometry(1, 40, 24);
  const vertices = bellyGeometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i),
      y = vertices.getY(i),
      z = vertices.getZ(i);
    vertices.setXYZ(
      i,
      Math.sign(x) * Math.pow(Math.abs(x), 0.65) * 1.08,
      Math.sign(y) * Math.pow(Math.abs(y), 0.65) * 0.97,
      z * 0.2,
    );
  }
  bellyGeometry.computeVertexNormals();
  const belly = new THREE.Mesh(
    bellyGeometry,
    new THREE.MeshPhysicalMaterial({ color: '#e5f7ff', roughness: 0.32, clearcoat: 0.8 }),
  );
  belly.name = 'Belly_Optional';
  belly.position.copy(point(558, 755));
  belly.visible = false;
  rig.add(belly);
  parts.belly = belly;
  for (const side of [0, 1, -1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), eyeMaterial);
    eye.name = side === 0 ? 'Eye_Core' : side === 1 ? 'Eye_Front' : 'Eye_Back';
    eye.position.copy(point(410, 690, side * 0.28));
    eye.scale.set(1, 1.02, side === 0 ? 1 : 0.67);
    eye.visible = side === 0;
    rig.add(eye);
    parts[eye.name] = eye;
  }
  const times = [0, 0.75, 1.5, 2.25, 3];
  const positions = times.flatMap((t) => [0, Math.sin((t * Math.PI * 2) / 3) * 0.07, 0]);
  const tailQuaternions = times.flatMap((t) =>
    new THREE.Quaternion()
      .setFromEuler(
        new THREE.Euler(
          0,
          Math.sin((t * Math.PI * 2) / 3) * 0.2,
          Math.sin((t * Math.PI * 2) / 3) * 0.045,
        ),
      )
      .toArray(),
  );
  const clip = new THREE.AnimationClip('Swim', 3, [
    new THREE.VectorKeyframeTrack('Swim_Rig.position', times, positions),
    new THREE.QuaternionKeyframeTrack('Tail_Pivot.quaternion', times, tailQuaternions),
  ]);
  root.userData = {
    version: '0.2',
    source: 'Original whale SVG contours',
    frontAxis: '+Z',
    units: '250 reference pixels per unit',
    stage: 'Design prototype; no skinning rig',
  };
  return { root, rig, parts, materials, fountain, clips: [clip, fountain.clip] };
}
