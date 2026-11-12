import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function dispose(object) {
  object.traverse(item => {
    item.geometry?.dispose();
    (Array.isArray(item.material) ? item.material : [item.material]).forEach(material => material?.dispose());
  });
}

export default function KeepsakeScene({ model, preview, alt }) {
  const mount = useRef(null);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const element = mount.current;
    if (!element || reduced) return undefined;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { return undefined; }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, -3.8, 5.9);
    camera.lookAt(0, 0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffecd0, 0x392818, 2.8));
    const key = new THREE.DirectionalLight(0xffd7a1, 3.6); key.position.set(-3, -4, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xe5a971, 1.5); rim.position.set(4, 2, 3); scene.add(rim);
    const group = new THREE.Group(); scene.add(group);
    let object; let frame = 0; let active = true;
    const loader = new GLTFLoader();
    loader.load(model, gltf => {
      if (!active) { dispose(gltf.scene); return; }
      object = gltf.scene;
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length() || 1;
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      object.scale.setScalar(3.25 / size);
      group.add(object);
    }, undefined, () => {});
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const render = time => {
      frame = requestAnimationFrame(render);
      if (object) { group.rotation.z = Math.sin(time * .00022) * .05; group.rotation.y = time * .00022; }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    return () => {
      active = false; cancelAnimationFrame(frame); observer.disconnect();
      dispose(scene);
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [model, reduced]);

  return <div className="keepsake-scene" ref={mount} role="img" aria-label={alt}><img src={preview} alt=""/></div>;
}
