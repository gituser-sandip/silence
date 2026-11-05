import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import SceneLoader from './SceneLoader';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const mix = (from, to, amount) => from + (to - from) * amount;

// The GLB's inner vessel profile, in metres. Keep its walls fixed while the
// visible perfume rises through it; scaling the whole mesh distorts the glass.
const LIQUID_PROFILE = [
  [0.0090, 0.0177, 0.0165, 0.0043],
  [0.0100, 0.0190, 0.0177, 0.0045],
  [0.0130, 0.0201, 0.0184, 0.0046],
  [0.0190, 0.0207, 0.0189, 0.0046],
  [0.0290, 0.0210, 0.0195, 0.0047],
  [0.0420, 0.0221, 0.0205, 0.0048],
  [0.0540, 0.0238, 0.0215, 0.0048],
  [0.0590, 0.0244, 0.0220, 0.0047],
  [0.0600, 0.0238, 0.0216, 0.0047]
];
const RING_STEPS = 8;
const RING_SIZE = 4 * (RING_STEPS + 1);
const liquidArea = ([, width, depth, radius]) => 4 * width * depth - (4 - Math.PI) * radius * radius;
const liquidVolumes = [0];
for (let index = 1; index < LIQUID_PROFILE.length; index++) {
  const low = LIQUID_PROFILE[index - 1];
  const high = LIQUID_PROFILE[index];
  liquidVolumes[index] = liquidVolumes[index - 1] + (liquidArea(low) + liquidArea(high)) * 0.5 * (high[0] - low[0]);
}
const FILL_PHASES = [[0.08, 0.27], [0.27, 0.47], [0.47, 0.67], [0.67, 0.84]];
const MIX_COLORS = ['#b58d64', '#bd827b', '#b77766', '#b77b68'].map(color => new THREE.Color(color));
const SURFACE_HIGHLIGHT = new THREE.Color('#fff0df');

function profileAtFill(fill) {
  const targetVolume = clamp(fill) * liquidVolumes[liquidVolumes.length - 1];
  let index = 1;
  while (index < liquidVolumes.length - 1 && targetVolume > liquidVolumes[index]) index++;
  const low = LIQUID_PROFILE[index - 1];
  const high = LIQUID_PROFILE[index];
  const portion = clamp((targetVolume - liquidVolumes[index - 1]) / (liquidVolumes[index] - liquidVolumes[index - 1]));
  return low.map((value, axis) => mix(value, high[axis], portion));
}

function roundedRing(profile) {
  const [, width, depth, radius] = profile;
  const corners = [
    [width - radius, depth - radius, 0],
    [-width + radius, depth - radius, 90],
    [-width + radius, -depth + radius, 180],
    [width - radius, -depth + radius, 270]
  ];
  const points = [];
  corners.forEach(([cx, cz, start]) => {
    for (let step = 0; step <= RING_STEPS; step++) {
      const angle = (start + step * 90 / RING_STEPS) * Math.PI / 180;
      points.push([cx + radius * Math.cos(angle), -(cz + radius * Math.sin(angle))]);
    }
  });
  return points;
}

function createFillSurface(mesh) {
  const sidePositions = new Float32Array(LIQUID_PROFILE.length * RING_SIZE * 3);
  const sideIndices = [];
  for (let ring = 0; ring < LIQUID_PROFILE.length - 1; ring++) {
    for (let point = 0; point < RING_SIZE; point++) {
      const next = (point + 1) % RING_SIZE;
      const low = ring * RING_SIZE;
      const high = (ring + 1) * RING_SIZE;
      sideIndices.push(low + point, low + next, high + next, low + point, high + next, high + point);
    }
  }
  const side = new THREE.BufferGeometry();
  side.setAttribute('position', new THREE.BufferAttribute(sidePositions, 3).setUsage(THREE.DynamicDrawUsage));
  side.setIndex(sideIndices);
  side.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.034, 0), 0.07);
  const previousGeometry = mesh.geometry;
  mesh.geometry = side;
  previousGeometry.dispose();
  mesh.material.side = THREE.DoubleSide;

  const topPositions = new Float32Array((RING_SIZE + 1) * 3);
  const topIndices = [];
  for (let point = 0; point < RING_SIZE; point++) topIndices.push(0, point + 1, (point + 1) % RING_SIZE + 1);
  const topGeometry = new THREE.BufferGeometry();
  topGeometry.setAttribute('position', new THREE.BufferAttribute(topPositions, 3).setUsage(THREE.DynamicDrawUsage));
  topGeometry.setIndex(topIndices);
  topGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.034, 0), 0.07);
  const surfaceMaterial = new THREE.MeshPhysicalMaterial({ color: '#d5ad99', roughness: 0.12, transmission: 0.12, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false });
  const surface = new THREE.Mesh(topGeometry, surfaceMaterial);
  surface.renderOrder = 2;
  surface.castShadow = false;
  mesh.add(surface);

  const edgePositions = new Float32Array(RING_SIZE * 3);
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3).setUsage(THREE.DynamicDrawUsage));
  const edge = new THREE.LineLoop(edgeGeometry, new THREE.LineBasicMaterial({ color: '#f1d6c5', transparent: true, opacity: 0.36, depthWrite: false }));
  edge.renderOrder = 3;
  mesh.add(edge);

  const ripplePositions = new Float32Array(48 * 3);
  const rippleGeometry = new THREE.BufferGeometry();
  rippleGeometry.setAttribute('position', new THREE.BufferAttribute(ripplePositions, 3).setUsage(THREE.DynamicDrawUsage));
  const ripple = new THREE.LineLoop(rippleGeometry, new THREE.LineBasicMaterial({ color: '#f7dfce', transparent: true, opacity: 0, depthWrite: false }));
  ripple.renderOrder = 4;
  mesh.add(ripple);

  function update(fill, pulse, time) {
    const visible = fill > 0.002;
    mesh.visible = visible;
    if (!visible) return;
    const level = profileAtFill(fill);
    const topRing = roundedRing(level);
    for (let ring = 0; ring < LIQUID_PROFILE.length; ring++) {
      const profile = LIQUID_PROFILE[ring][0] < level[0] ? LIQUID_PROFILE[ring] : level;
      const points = profile === level ? topRing : roundedRing(profile);
      for (let point = 0; point < RING_SIZE; point++) {
        const offset = (ring * RING_SIZE + point) * 3;
        sidePositions[offset] = points[point][0];
        sidePositions[offset + 1] = profile[0];
        sidePositions[offset + 2] = points[point][1];
      }
    }
    side.attributes.position.needsUpdate = true;
    side.computeVertexNormals();
    topPositions[0] = 0;
    topPositions[1] = level[0] - 0.00012;
    topPositions[2] = 0;
    for (let point = 0; point < RING_SIZE; point++) {
      const offset = (point + 1) * 3;
      topPositions[offset] = edgePositions[point * 3] = topRing[point][0];
      topPositions[offset + 1] = level[0];
      edgePositions[point * 3 + 1] = level[0] + 0.00013;
      topPositions[offset + 2] = edgePositions[point * 3 + 2] = topRing[point][1];
    }
    topGeometry.attributes.position.needsUpdate = true;
    topGeometry.computeVertexNormals();
    edgeGeometry.attributes.position.needsUpdate = true;
    edge.material.opacity = 0.24 + 0.14 * pulse;
    const rippleSize = 0.24 + 0.53 * ((time * 0.7) % 1);
    for (let point = 0; point < 48; point++) {
      const angle = point * Math.PI * 2 / 48;
      ripplePositions[point * 3] = Math.cos(angle) * level[1] * rippleSize;
      ripplePositions[point * 3 + 1] = level[0] + 0.00022;
      ripplePositions[point * 3 + 2] = Math.sin(angle) * level[2] * rippleSize;
    }
    rippleGeometry.attributes.position.needsUpdate = true;
    ripple.material.opacity = 0.34 * pulse;
  }
  return { update, surfaceMaterial };
}

export default function PerfumeScene({ progress = 0, onReady }) {
  const mountRef = useRef(null);
  const progressRef = useRef(progress);
  const [sceneState, setSceneState] = useState('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 0.15, 9);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (error) {
      console.error('Could not start the 3D perfume scene', error);
      setSceneState('error');
      onReady?.();
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0, 0.1, 100, { size: 128 });
    scene.environment = environment.texture;

    scene.add(new THREE.HemisphereLight(0xfff2d0, 0x4b5140, 1.25));
    const key = new THREE.DirectionalLight(0xffebbd, 2.2); key.position.set(-4, 6, 7); scene.add(key);
    const rim = new THREE.PointLight(0xfffaf0, 24, 20); rim.position.set(4, 1, 3); scene.add(rim);
    const gold = new THREE.PointLight(0xd59c4e, 13, 14); gold.position.set(-2, -2, 4); scene.add(gold);

    const world = new THREE.Group(); scene.add(world);
    const bottle = new THREE.Group(); world.add(bottle);
    let liquidMaterial;
    const fillSurfaces = [];
    let disposed = false;
    let loadFailed = false;
    let readyFrame;
    let assetsLoaded = false;
    let firstRendered = false;
    const markReady = () => {
      if (disposed || loadFailed || !assetsLoaded || !firstRendered || readyFrame) return;
      readyFrame = requestAnimationFrame(() => {
        if (!disposed) {
          setSceneState('ready');
          onReady?.();
        }
      });
    };
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, loaded, total) => {
      if (!disposed && !loadFailed) setLoadProgress(Math.round(loaded / total * 100));
    };
    loadingManager.onError = url => {
      console.error('Could not load a 3D perfume asset', url);
      loadFailed = true;
      if (!disposed) {
        setSceneState('error');
        onReady?.();
      }
    };
    loadingManager.onLoad = () => {
      if (disposed || loadFailed) return;
      assetsLoaded = true;
      markReady();
    };
    new GLTFLoader(loadingManager).load('/assets/perfume_bottle_realistic.glb', ({ scene: model }) => {
      if (disposed) return;
      const bounds = new THREE.Box3().setFromObject(model);
      const height = bounds.getSize(new THREE.Vector3()).y;
      model.scale.setScalar(3.2 / height);
      bounds.setFromObject(model);
      model.position.y = -bounds.getCenter(new THREE.Vector3()).y;
      model.traverse(part => {
        if (!part.isMesh) return;
        part.castShadow = true;
        const materials = Array.isArray(part.material) ? part.material : [part.material];
        materials.forEach(material => {
          if (material.name === 'Glass') {
            material.opacity = 0.18;
            material.transmission = 0.8;
            material.side = THREE.FrontSide;
            material.depthWrite = false;
          }
          if (material.name === 'Rose liquid') {
            liquidMaterial = material;
            material.transparent = true;
            material.transmission = 0.25;
            material.roughness = 0.14;
            material.color.copy(MIX_COLORS[0]);
            material.opacity = 0;
            material.depthWrite = false;
            fillSurfaces.push(createFillSurface(part));
          }
          if (material.name === 'Inner glass edge') {
            material.color.set('#bca18f');
            material.opacity = 0.22;
            material.transmission = 0.55;
            material.depthWrite = false;
          }
          if (material.name === 'Translucent dip tube') {
            material.color.set('#e2c7af');
            material.opacity = 0.46;
            material.transmission = 0.42;
            material.depthWrite = false;
          }
        });
      });
      bottle.add(model);
    }, undefined, error => {
      console.error('Could not load perfume bottle model', error);
      loadFailed = true;
      if (!disposed) {
        setSceneState('error');
        onReady?.();
      }
    });

    const halo = new THREE.Mesh(new THREE.RingGeometry(2.55, 2.57, 96), new THREE.MeshBasicMaterial({ color: 0xd6b378, transparent: true, opacity: 0.27, side: THREE.DoubleSide }));
    halo.rotation.x = Math.PI / 2.4; halo.position.z = -0.9; world.add(halo);
    const ingredientTextureLoader = new THREE.TextureLoader(loadingManager);

    const specs = [
      { name: 'BERGAMOT', start: 0.02, end: 0.27, color: 0xf3c649, source: new THREE.Vector3(-2.35, 1.7, -0.3), target: new THREE.Vector3(-0.45, 0.36, 0.1), kind: 'citrus' },
      { name: 'ROSE', start: 0.21, end: 0.47, color: 0xe6a2a5, source: new THREE.Vector3(2.35, 1.35, -0.25), target: new THREE.Vector3(0.48, 0.3, 0.12), kind: 'rose' },
      { name: 'SANDALWOOD', start: 0.42, end: 0.67, color: 0x7b4c2e, source: new THREE.Vector3(-2.35, -1.5, 0.15), target: new THREE.Vector3(-0.35, -0.38, 0.15), kind: 'wood' },
      { name: 'AMBER', start: 0.61, end: 0.84, color: 0xd58c36, source: new THREE.Vector3(2.35, -1.3, -0.1), target: new THREE.Vector3(0.42, -0.36, 0.1), kind: 'amber' }
    ];

    function createIngredient(spec) {
      const group = new THREE.Group(); world.add(group);
      if (spec.kind === 'citrus') {
        const rind = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 32), new THREE.MeshStandardMaterial({ color: 0xe6ab23, roughness: 0.35 })); rind.rotation.x = Math.PI / 2; group.add(rind);
        const flesh = new THREE.Mesh(new THREE.CircleGeometry(0.35, 32), new THREE.MeshBasicMaterial({ color: 0xffed8b })); flesh.rotation.y = Math.PI; flesh.position.z = 0.064; group.add(flesh);
        for (let i = 0; i < 8; i++) { const segment = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.3, 0.012), new THREE.MeshBasicMaterial({ color: 0xfff8c7 })); segment.position.z = 0.073; segment.rotation.z = i * Math.PI / 4; group.add(segment); }
      } else if (spec.kind === 'rose') {
        group.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshStandardMaterial({ color: 0xa94e64, roughness: 0.55 })));
        for (let i = 0; i < 10; i++) { const petal = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xf4bec0 : 0xde8f99, roughness: 0.55 })); petal.scale.set(1.3, 0.26, 0.7); const angle = i * Math.PI * 2 / 10; petal.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, (i % 3 - 1) * 0.05); petal.rotation.z = angle; group.add(petal); }
      } else if (spec.kind === 'wood') {
        for (let i = 0; i < 6; i++) { const shard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.14), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x9c6537 : 0x55331f, roughness: 0.75 })); shard.position.set((i - 2.5) * 0.13, (i % 2 ? 0.08 : -0.08), (i % 3 - 1) * 0.12); shard.rotation.set(i * 0.3, i * 0.5, 0.6); group.add(shard); }
      } else group.add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 1), new THREE.MeshPhysicalMaterial({ color: 0xe69b36, roughness: 0.18, metalness: 0.15, transmission: 0.2, transparent: true, opacity: 0.93 })));
      const textureName = spec.kind === 'citrus' ? 'bergamot-real.png' : spec.kind === 'rose' ? 'rose-real.png' : 'wood-amber-real.png';
      const texture = ingredientTextureLoader.load(`/assets/exploded/${textureName}`); texture.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0 }));
      sprite.scale.set(spec.kind === 'rose' ? 1.65 : 1.48, spec.kind === 'rose' ? 1.1 : 1.08, 1); world.add(sprite);
      const count = 42;
      const particles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(spec.kind === 'rose' ? 0.052 : 0.044, 1), new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.34, metalness: spec.kind === 'amber' ? 0.55 : 0.12, transparent: true, opacity: 0.82 }), count);
      particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(particles);
      const offsets = Array.from({ length: count }, (_, index) => ({ angle: index * 2.399, radius: 0.2 + ((index * 19) % 23) / 22, lift: ((index * 13) % 17) / 16 - 0.5, delay: (index % 14) / 15 }));
      return { ...spec, group, sprite, particles, offsets };
    }
    const ingredients = specs.map(createIngredient);
    const dummy = new THREE.Object3D();

    const resize = () => {
      const width = host.clientWidth; const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height); camera.aspect = width / height;
      camera.position.z = window.innerWidth < 700 ? 10.6 : 8.8; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame; let elapsed = 0; let smoothProgress = 0; let paintedBehindIntro = false;

    function animateIngredient(item, p, time) {
      const entrance = item.start < 0.05 ? Math.max(0.72, smooth(item.start, item.start + 0.1, p)) : smooth(item.start, item.start + 0.1, p);
      const dissolve = smooth(item.end - 0.1, item.end, p);
      const centerMix = smooth(item.start + 0.05, item.end, p);
      item.group.visible = false;
      item.sprite.position.lerpVectors(item.source, item.target, centerMix);
      item.sprite.position.y += Math.sin(time * 1.4 + item.start * 20) * 0.1 * (1 - dissolve);
      item.sprite.material.opacity = entrance * (1 - dissolve * 0.9);
      item.sprite.scale.setScalar(Math.max(0.001, (item.kind === 'rose' ? 1.65 : 1.48) * entrance * (1 - dissolve * 0.72)));
      item.particles.visible = p > item.start - 0.03 && p < item.end + 0.14;
      item.offsets.forEach((offset, index) => {
        const particleP = smooth(item.start + offset.delay * 0.12, item.end + offset.delay * 0.09, p);
        const sourceX = item.source.x + Math.cos(offset.angle) * offset.radius;
        const sourceY = item.source.y + Math.sin(offset.angle * 1.3) * offset.radius + offset.lift * 0.5;
        const sourceZ = item.source.z + Math.sin(offset.angle) * 0.38;
        const orbit = 0.22 + offset.radius * 0.22;
        const targetX = item.target.x + Math.cos(offset.angle + time * 1.4) * orbit;
        const targetY = item.target.y + Math.sin(offset.angle * 1.7 + time * 1.2) * orbit;
        const targetZ = item.target.z + Math.sin(offset.angle * 2.1) * orbit;
        dummy.position.set(mix(sourceX, targetX, particleP), mix(sourceY, targetY, particleP), mix(sourceZ, targetZ, particleP));
        dummy.scale.setScalar(Math.max(0.001, entrance * (1 - smooth(item.end, item.end + 0.13, p)) * (0.7 + (index % 5) * 0.12)));
        dummy.rotation.set(offset.angle, time + offset.angle, offset.lift); dummy.updateMatrix(); item.particles.setMatrixAt(index, dummy.matrix);
      });
      item.particles.instanceMatrix.needsUpdate = true;
    }

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (loadFailed || !bottle.children.length) return;
      const introVisible = !!document.getElementById('site-intro');
      if (introVisible && paintedBehindIntro) return;
      elapsed += reduceMotion.matches ? 0.001 : 0.012;
      const target = clamp(progressRef.current); smoothProgress += (target - smoothProgress) * (reduceMotion.matches ? 1 : 0.1);
      const p = smoothProgress;
      const fillStages = FILL_PHASES.map(([start, end]) => smooth(start, end, p));
      const liquidIn = fillStages.reduce((total, stage) => total + stage, 0) / FILL_PHASES.length;
      const ripplePulse = Math.max(...fillStages.map(stage => Math.sin(Math.PI * stage)));
      if (liquidMaterial) {
        liquidMaterial.opacity = 0.62 * smooth(0, 0.06, liquidIn);
        liquidMaterial.color.copy(MIX_COLORS[0])
          .lerp(MIX_COLORS[1], fillStages[1])
          .lerp(MIX_COLORS[2], fillStages[2])
          .lerp(MIX_COLORS[3], fillStages[3]);
      }
      fillSurfaces.forEach(({ update, surfaceMaterial }) => {
        surfaceMaterial.color.copy(liquidMaterial.color).lerp(SURFACE_HIGHLIGHT, 0.24);
        surfaceMaterial.opacity = 0.3 * smooth(0, 0.04, liquidIn);
        update(liquidIn, ripplePulse, elapsed);
      });
      bottle.rotation.y = -0.2 + p * 0.82 + Math.sin(elapsed * 0.55) * 0.025; bottle.rotation.x = -0.08 + Math.sin(elapsed * 0.7) * 0.018;
      bottle.position.y = (window.innerWidth < 700 ? 0.15 : 0.25) + Math.sin(elapsed) * 0.035;
      halo.rotation.z = -p * Math.PI * 0.9; halo.material.opacity = 0.25;
      ingredients.forEach(item => animateIngredient(item, p, elapsed));
      camera.position.x = 0; camera.position.y = 0.15 + (1 - p) * 0.12; camera.lookAt(0, 0.05, 0);
      renderer.render(scene, camera);
      if (!firstRendered) {
        firstRendered = true;
        markReady();
      }
      if (introVisible) paintedBehindIntro = true;
    };
    animate();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); cancelAnimationFrame(readyFrame); observer.disconnect();
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
      });
      environment.dispose(); pmrem.dispose(); renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
    };
  }, []);
  return <div className={`perfume-scene ${sceneState === 'ready' ? 'is-ready' : ''}`}>
    <div className="perfume-canvas" ref={mountRef} role="img" aria-hidden={sceneState !== 'ready'} aria-label="A three-dimensional perfume bottle assembled by bergamot, rose, sandalwood and amber particles as the page scrolls" />
    {sceneState !== 'ready' && <SceneLoader progress={loadProgress} failed={sceneState === 'error'}/>}
  </div>;
}
