import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroCanvas3DProps {
  scrollY?: number;
}

// ─── Procedural Geometry Helpers ──────────────────────────────────────────────

function createBottleGeometry() {
  const points = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    let r = 0;
    if (t < 0.6) r = 0.8; // Body
    else if (t < 0.7) r = 0.8 - (t - 0.6) * 5; // Shoulder
    else r = 0.3; // Neck
    points.push(new THREE.Vector2(r, t * 4 - 2));
  }
  return new THREE.LatheGeometry(points, 32);
}

function createGlassGeometry() {
  const points = [];
  points.push(new THREE.Vector2(0, -1.5));
  points.push(new THREE.Vector2(0.5, -1.5)); // Base
  points.push(new THREE.Vector2(0.1, -1.4)); // Stem start
  points.push(new THREE.Vector2(0.1, 0)); // Stem end
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const r = 0.1 + Math.sin(t * Math.PI) * 0.7;
    points.push(new THREE.Vector2(r, t * 1.5));
  }
  return new THREE.LatheGeometry(points, 32);
}

function createCognacGlassGeometry() {
  const points = [];
  points.push(new THREE.Vector2(0, -1.0));
  points.push(new THREE.Vector2(0.4, -1.0)); // Base
  points.push(new THREE.Vector2(0.1, -0.9)); // Stem start
  points.push(new THREE.Vector2(0.1, -0.5)); // Stem end
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const r = 0.1 + Math.sin(t * Math.PI * 0.8) * 0.9;
    points.push(new THREE.Vector2(r, -0.5 + t * 1.5));
  }
  return new THREE.LatheGeometry(points, 32);
}

export default function HeroCanvas3D({ scrollY = 0 }: HeroCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ─── Scene Setup ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 200);
    camera.position.set(0, 0, 14);

    // ─── Lighting ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffddaa, 6, 30);
    mainLight.position.set(6, 6, 8);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xC8952A, 3, 20);
    fillLight.position.set(-8, -2, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 10, -5);
    scene.add(rimLight);

    // ─── Materials ────────────────────────────────────────────────────────────
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.5,
      transparent: true,
      opacity: 0.4,
    });

    const darkGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2e1a, // Dark green bottle
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 1.5,
      transparent: true,
      opacity: 0.9,
    });

    const amberGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706, // Amber bottle
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 1.0,
      transparent: true,
      opacity: 0.85,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xC8952A,
      metalness: 1.0,
      roughness: 0.2,
    });

    // ─── Objects ──────────────────────────────────────────────────────────────
    const meshes: { mesh: THREE.Mesh; rotSpeed: number[]; floatSpeed: number; floatOffset: number; isCenter?: boolean }[] = [];

    // Geometries
    const bottleGeo = createBottleGeometry();
    const wineGlassGeo = createGlassGeometry();
    const cognacGlassGeo = createCognacGlassGeometry();

    // 1. Center piece (Wine Bottle)
    const centerBottle = new THREE.Mesh(bottleGeo, darkGlassMat);
    centerBottle.position.set(2, 0, 0);
    centerBottle.rotation.set(0.2, -0.5, 0.1);
    centerBottle.scale.set(1.5, 1.5, 1.5);
    scene.add(centerBottle);
    meshes.push({ mesh: centerBottle, rotSpeed: [0.002, 0.005, 0], floatSpeed: 0.8, floatOffset: 0, isCenter: true });

    // 2. Right piece (Cognac glass)
    const cognacGlass = new THREE.Mesh(cognacGlassGeo, glassMat);
    cognacGlass.position.set(6, -1, -2);
    cognacGlass.rotation.set(0.1, 0.4, -0.2);
    cognacGlass.scale.set(1.2, 1.2, 1.2);
    scene.add(cognacGlass);
    meshes.push({ mesh: cognacGlass, rotSpeed: [0.005, 0.008, 0.002], floatSpeed: 1.2, floatOffset: 1 });

    // 3. Left piece (Wine glass)
    const wineGlass = new THREE.Mesh(wineGlassGeo, glassMat);
    wineGlass.position.set(-3, -1.5, 1);
    wineGlass.rotation.set(-0.2, 0.6, 0.1);
    scene.add(wineGlass);
    meshes.push({ mesh: wineGlass, rotSpeed: [0.003, 0.004, -0.001], floatSpeed: 1.0, floatOffset: 2 });

    // 4. Background piece (Amber bottle)
    const amberBottle = new THREE.Mesh(bottleGeo, amberGlassMat);
    amberBottle.position.set(-5, 2, -4);
    amberBottle.rotation.set(-0.1, -0.2, -0.3);
    amberBottle.scale.set(1.2, 1.2, 1.2);
    scene.add(amberBottle);
    meshes.push({ mesh: amberBottle, rotSpeed: [0.004, -0.002, 0.003], floatSpeed: 0.9, floatOffset: 3 });

    // Gold floating elements
    for (let i = 0; i < 3; i++) {
      const geo = i % 2 === 0 ? new THREE.IcosahedronGeometry(0.5, 0) : new THREE.TorusGeometry(0.4, 0.05, 16, 32);
      const decor = new THREE.Mesh(geo, goldMat);
      decor.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10 - 2
      );
      scene.add(decor);
      meshes.push({
        mesh: decor,
        rotSpeed: [Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02],
        floatSpeed: Math.random() * 1.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }

    // ─── Star / Particle Field ─────────────────────────────────────────────────
    const starCount = 250;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3]     = (Math.random() - 0.5) * 80;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 40;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 30 - 10;

      starSizes[i] = Math.random() * 2 + 0.5;

      const isGold = Math.random() > 0.4;
      starColors[i3]     = isGold ? 0.784 : 1.0;
      starColors[i3 + 1] = isGold ? 0.584 : 0.95;
      starColors[i3 + 2] = isGold ? 0.165 : 0.9;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ─── Grid Plane ───────────────────────────────────────────────────────────
    const gridHelper = new THREE.GridHelper(60, 30, 0xC8952A, 0x1C1C1C);
    gridHelper.position.y = -6;
    gridHelper.material = new THREE.LineBasicMaterial({
      color: 0xC8952A,
      transparent: true,
      opacity: 0.1,
    });
    scene.add(gridHelper);

    // ─── Mouse interaction ─────────────────────────────────────────────────────
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse);

    // ─── Resize ───────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.parentElement?.offsetWidth || window.innerWidth;
      const h = canvas.parentElement?.offsetHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(handleResize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ─── Animation Loop ───────────────────────────────────────────────────────
    let t = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.02;

      // Parallax camera
      const targetX = mouseRef.current.x * 2.0;
      const targetY = scrollY * -0.005 + mouseRef.current.y * 1.0;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Rotate objects
      meshes.forEach(({ mesh, rotSpeed, floatSpeed, floatOffset, isCenter }) => {
        mesh.rotation.x += rotSpeed[0];
        mesh.rotation.y += rotSpeed[1];
        mesh.rotation.z += rotSpeed[2];
        
        // Float animation
        const floatY = Math.sin(t * floatSpeed + floatOffset) * 0.02;
        mesh.position.y += floatY;

        // Subtle reaction to mouse for center piece
        if (isCenter) {
          mesh.rotation.x = 0.2 + mouseRef.current.y * 0.1;
          mesh.rotation.y = -0.5 + mouseRef.current.x * 0.2;
        }
      });

      // Drift stars
      stars.rotation.y += 0.0003;
      stars.rotation.x += 0.0001;

      // Light orbit
      mainLight.position.x = Math.sin(t * 0.5) * 8;
      mainLight.position.z = Math.cos(t * 0.5) * 8;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouse);
      ro.disconnect();
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else (mat as THREE.Material).dispose();
        }
      });
    };
  }, [scrollY]);

  return (
    <canvas
      ref={canvasRef}
      id="hero-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
