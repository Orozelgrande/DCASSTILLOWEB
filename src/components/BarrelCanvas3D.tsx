import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── Procedural Geometry Helpers ──────────────────────────────────────────────

function createStaveGeometry(angle: number, step: number, radius = 1.4, height = 3.5, bulge = 0.25) {
  const points = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const y = (t - 0.5) * height;
    const r = radius + (1 - Math.pow((t - 0.5) * 2, 2)) * bulge;
    points.push(new THREE.Vector2(r, y));
  }
  // Create a slice of a lathe
  return new THREE.LatheGeometry(points, 8, angle, step * 0.95);
}

function createMugGeometry(width = 0.9, height = 2.4) {
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(width * 0.9, 0));
  points.push(new THREE.Vector2(width * 0.9, 0.3)); 
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const y = 0.3 + t * (height - 0.3);
    const r = width * 0.9 + t * 0.15 * width; 
    points.push(new THREE.Vector2(r, y));
  }
  const topR = width * 0.9 + 0.15 * width;
  points.push(new THREE.Vector2(topR + 0.05, height));
  points.push(new THREE.Vector2(topR - 0.05, height));
  for (let i = 10; i >= 0; i--) {
    const t = i / 10;
    const y = 0.3 + t * (height - 0.3);
    const r = (width * 0.9 + t * 0.15 * width) - 0.1; 
    points.push(new THREE.Vector2(r, y));
  }
  points.push(new THREE.Vector2(0, 0.3));
  return new THREE.LatheGeometry(points, 32);
}

function createBeerLiquidGeometry(width = 0.9, height = 2.0) {
  const points = [];
  points.push(new THREE.Vector2(0, 0.3));
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const y = 0.3 + t * (height - 0.3);
    const r = (width * 0.9 + t * 0.15 * width) - 0.11; 
    points.push(new THREE.Vector2(r, y));
  }
  points.push(new THREE.Vector2(0, height));
  return new THREE.LatheGeometry(points, 32);
}

export default function BarrelCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.offsetWidth / canvas.offsetHeight, 0.1, 200);
    camera.position.set(-1, 0, 8);

    // ─── Lighting ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xfff0dd, 10, 40);
    mainLight.position.set(5, 5, 10);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0xffffff, 5, 20);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // ─── Materials & Textures ──────────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('/barrel_wood.png');
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1, 1);

    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1,
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.4,
      metalness: 0.9,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      roughness: 0.2,
      metalness: 1.0,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 0.4,
      transparent: true,
      thickness: 0.5,
      roughness: 0.05,
    });

    const beerMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      transmission: 0.8,
      opacity: 0.9,
      transparent: true,
      thickness: 1.5,
      roughness: 0.1,
    });

    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1.0,
    });

    // ─── Barrel Construction ───────────────────────────────────────────────────
    const barrelGroup = new THREE.Group();
    scene.add(barrelGroup);

    const staveCount = 20;
    const step = (Math.PI * 2) / staveCount;
    for (let i = 0; i < staveCount; i++) {
      const geo = createStaveGeometry(i * step, step);
      const mesh = new THREE.Mesh(geo, woodMat);
      barrelGroup.add(mesh);
    }

    // Top & Bottom lids
    const lidGeo = new THREE.CircleGeometry(1.4, 32);
    const topLid = new THREE.Mesh(lidGeo, woodMat);
    topLid.position.y = 1.75;
    topLid.rotation.x = -Math.PI / 2;
    barrelGroup.add(topLid);

    const bottomLid = new THREE.Mesh(lidGeo, woodMat);
    bottomLid.position.y = -1.75;
    bottomLid.rotation.x = Math.PI / 2;
    barrelGroup.add(bottomLid);

    // Iron Rings
    const ringRadii = [1.5, 1.6, 1.5];
    const ringY = [1.2, 0, -1.2];
    ringY.forEach((y, i) => {
      const ringGeo = new THREE.TorusGeometry(ringRadii[i], 0.08, 16, 64);
      const ring = new THREE.Mesh(ringGeo, ironMat);
      ring.position.y = y;
      ring.rotation.x = Math.PI / 2;
      barrelGroup.add(ring);
    });

    // Tap (Spigot)
    const spigotGroup = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 16);
    const base = new THREE.Mesh(baseGeo, brassMat);
    base.rotation.z = Math.PI / 2;
    spigotGroup.add(base);

    const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16);
    const handle = new THREE.Mesh(handleGeo, brassMat);
    handle.position.y = 0.2;
    spigotGroup.add(handle);

    const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
    const nozzle = new THREE.Mesh(nozzleGeo, brassMat);
    nozzle.position.set(0.2, -0.2, 0);
    spigotGroup.add(nozzle);

    spigotGroup.position.set(1.4, -0.5, 0);
    barrelGroup.add(spigotGroup);

    barrelGroup.position.set(-2, 1.5, 0);
    barrelGroup.rotation.set(0.2, 0.5, -1.2);

    // ─── Mug & Beer ────────────────────────────────────────────────────────────
    const mugGroup = new THREE.Group();
    const mug = new THREE.Mesh(createMugGeometry(), glassMat);
    mugGroup.add(mug);

    const beer = new THREE.Mesh(createBeerLiquidGeometry(), beerMat);
    mugGroup.add(beer);

    const foamGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.4, 32);
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.y = 2.1;
    mugGroup.add(foam);

    // Foam bubbles
    for (let i = 0; i < 12; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * 0.15 + 0.1, 12, 12), foamMat);
      b.position.set((Math.random() - 0.5) * 1.5, 2.2 + Math.random() * 0.1, (Math.random() - 0.5) * 1.5);
      mugGroup.add(b);
    }

    mugGroup.position.set(1.5, -2.5, 0);
    mugGroup.rotation.set(0.1, -0.2, 0.05);
    scene.add(mugGroup);

    // ─── Stream & Splashes ─────────────────────────────────────────────────────
    const startPoint = new THREE.Vector3(-0.4, 0.8, 0.2); // Relative to world, but needs to match tap
    const endPoint = new THREE.Vector3(1.5, -0.5, 0); 
    const controlPoint = new THREE.Vector3(0.5, 1.0, 0.1);

    const streamCurve = new THREE.QuadraticBezierCurve3(startPoint, controlPoint, endPoint);
    const streamGeo = new THREE.TubeGeometry(streamCurve, 32, 0.1, 16, false);
    const stream = new THREE.Mesh(streamGeo, beerMat);
    scene.add(stream);

    const splashes = new THREE.Group();
    for (let i = 0; i < 20; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * 0.06 + 0.02, 8, 8), beerMat);
      s.position.set((Math.random() - 0.5) * 0.8, Math.random() * 0.4, (Math.random() - 0.5) * 0.8);
      s.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * 0.08, Math.random() * 0.15 + 0.05, (Math.random() - 0.5) * 0.08) };
      splashes.add(s);
    }
    splashes.position.copy(endPoint);
    scene.add(splashes);

    // ─── Animation ─────────────────────────────────────────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      barrelGroup.position.y = 1.5 + Math.sin(t * 0.8) * 0.1;
      barrelGroup.rotation.y = 0.5 + Math.sin(t * 0.4) * 0.05;

      mugGroup.position.y = -2.5 + Math.cos(t * 0.8) * 0.05;

      splashes.children.forEach((s: any) => {
        s.position.add(s.userData.velocity);
        s.userData.velocity.y -= 0.008;
        if (s.position.y < -0.5) {
          s.position.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5);
          s.userData.velocity.set((Math.random() - 0.5) * 0.06, Math.random() * 0.15 + 0.05, (Math.random() - 0.5) * 0.06);
        }
      });

      // Camera drift
      camera.position.x = -1 + mouseRef.current.x * 0.5;
      camera.position.y = mouseRef.current.y * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouse);
      renderer.dispose();
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', outline: 'none' }} />;
}
