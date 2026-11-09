import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

interface NeuralMeshCanvasProps {
  interactive?: boolean;
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  accentColor?: string;
  secondaryColor?: string;
  isDark?: boolean;
}

export const NeuralMeshCanvas: React.FC<NeuralMeshCanvasProps> = ({
  interactive = true,
  className = 'absolute inset-0 w-full h-full pointer-events-auto',
  particleCount,
  connectionDistance,
  accentColor,
  secondaryColor,
  isDark,
}) => {
  const theme = useTheme();
  const isDarkMode = isDark !== undefined ? isDark : theme.isDark;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const effectiveAccent = accentColor ?? (isDarkMode ? '#00F0FF' : '#2563EB');
  const effectiveSecondary = secondaryColor ?? (isDarkMode ? '#10B981' : '#6366F1');
  const count = particleCount ?? (isDarkMode ? 75 : 50);
  const maxConnectionDist = connectionDistance ?? (isDarkMode ? 125 : 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      1000
    );
    camera.position.z = 320;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle nodes data
    const positions = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number; originX: number; originY: number; originZ: number }[] = [];
    const baseColors = new Float32Array(count * 3);

    const c1 = new THREE.Color(effectiveAccent);
    const c2 = new THREE.Color(effectiveSecondary);

    const spreadX = 420;
    const spreadY = 260;
    const spreadZ = 160;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * spreadZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      velocities.push({
        x: (Math.random() - 0.5) * 0.45,
        y: (Math.random() - 0.5) * 0.45,
        z: (Math.random() - 0.5) * 0.25,
        originX: x,
        originY: y,
        originZ: z,
      });

      // Gradient color between accent and secondary
      const mixRatio = Math.random();
      const nodeCol = c1.clone().lerp(c2, mixRatio);
      baseColors[i * 3] = nodeCol.r;
      baseColors[i * 3 + 1] = nodeCol.g;
      baseColors[i * 3 + 2] = nodeCol.b;
    }

    // Geometry & Material for Nodes
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(baseColors, 3));

    // Generate soft circular point texture adapted for theme mode
    const pointCanvas = document.createElement('canvas');
    pointCanvas.width = 64;
    pointCanvas.height = 64;
    const pctx = pointCanvas.getContext('2d');
    if (pctx) {
      const grad = pctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      if (isDarkMode) {
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.85)');
        grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(37, 99, 235, 0.9)');
        grad.addColorStop(0.35, 'rgba(59, 130, 246, 0.55)');
        grad.addColorStop(0.75, 'rgba(99, 102, 241, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, 64, 64);
    }
    const pointTexture = new THREE.CanvasTexture(pointCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: isDarkMode ? 13 : 8,
      map: pointTexture,
      transparent: true,
      blending: isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending,
      opacity: isDarkMode ? 0.95 : 0.65,
      depthWrite: false,
      vertexColors: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Filaments (Connecting lines between nodes)
    const maxLineSegments = (count * (count - 1)) / 2;
    const linePositions = new Float32Array(maxLineSegments * 6);
    const lineColors = new Float32Array(maxLineSegments * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      linewidth: 1,
      opacity: isDarkMode ? 0.9 : 0.45,
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // Mouse coordinates in 3D world space
    const mouse3D = new THREE.Vector3(9999, 9999, 0);
    const mouseTarget = new THREE.Vector2(0, 0);
    const mouseCurrent = new THREE.Vector2(0, 0);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTarget.set(x, y);

      // Unproject mouse to z = 0 plane
      const vector = new THREE.Vector3(x, y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      mouse3D.copy(pos);
    };

    const handleMouseLeave = () => {
      mouseTarget.set(0, 0);
      mouse3D.set(9999, 9999, 0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = (now: number = performance.now()) => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = now;
      const delta = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;
      const time = (currentTime - startTime) * 0.001;

      // Smooth camera tilt follow
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.04;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.04;

      camera.position.x = mouseCurrent.x * 35;
      camera.position.y = mouseCurrent.y * 25;
      camera.lookAt(0, 0, 0);

      // Gentle rotational drift
      if (!prefersReducedMotion) {
        scene.rotation.y = Math.sin(time * 0.15) * 0.08;
        scene.rotation.x = Math.cos(time * 0.12) * 0.05;
      }

      // Update particle node positions & physics
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const repulsionRadius = 140;
      const repulsionStrength = 220;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        let px = posArray[i3];
        let py = posArray[i3 + 1];
        let pz = posArray[i3 + 2];

        const vel = velocities[i];

        if (!prefersReducedMotion) {
          px += vel.x;
          py += vel.y;
          pz += vel.z;

          // Gentle spring pull back to origin bounds
          const dxFromOrigin = px - vel.originX;
          const dyFromOrigin = py - vel.originY;
          if (Math.abs(dxFromOrigin) > 60) vel.x *= -1;
          if (Math.abs(dyFromOrigin) > 40) vel.y *= -1;
        }

        // Interactive cursor physics: repulsion & elastic filaments
        if (interactive) {
          const dx = px - mouse3D.x;
          const dy = py - mouse3D.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          if (distToMouse < repulsionRadius && distToMouse > 0.001) {
            const force = (1 - distToMouse / repulsionRadius) * repulsionStrength * delta;
            px += (dx / distToMouse) * force;
            py += (dy / distToMouse) * force;
          }
        }

        posArray[i3] = px;
        posArray[i3 + 1] = py;
        posArray[i3 + 2] = pz;
      }
      posAttr.needsUpdate = true;

      // Update connecting filament lines
      let lineVertexIndex = 0;
      let lineColorsIndex = 0;
      const maxDist = maxConnectionDist;
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x1 = posArray[i3];
        const y1 = posArray[i3 + 1];
        const z1 = posArray[i3 + 2];

        for (let j = i + 1; j < count; j++) {
          const j3 = j * 3;
          const x2 = posArray[j3];
          const y2 = posArray[j3 + 1];
          const z2 = posArray[j3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dSq = dx * dx + dy * dy + dz * dz;

          if (dSq < maxDistSq) {
            const alpha = 1.0 - Math.sqrt(dSq) / maxDist;

            linePositions[lineVertexIndex++] = x1;
            linePositions[lineVertexIndex++] = y1;
            linePositions[lineVertexIndex++] = z1;
            linePositions[lineVertexIndex++] = x2;
            linePositions[lineVertexIndex++] = y2;
            linePositions[lineVertexIndex++] = z2;

            if (isDarkMode) {
              const brightFactor = alpha * 0.75;
              lineColors[lineColorsIndex++] = c1.r * brightFactor;
              lineColors[lineColorsIndex++] = c1.g * brightFactor;
              lineColors[lineColorsIndex++] = c1.b * brightFactor;
              lineColors[lineColorsIndex++] = c2.r * brightFactor;
              lineColors[lineColorsIndex++] = c2.g * brightFactor;
              lineColors[lineColorsIndex++] = c2.b * brightFactor;
            } else {
              // Crisp, soft architectural filaments on white background
              const brightFactor = alpha * 0.22;
              lineColors[lineColorsIndex++] = c1.r * brightFactor;
              lineColors[lineColorsIndex++] = c1.g * brightFactor;
              lineColors[lineColorsIndex++] = c1.b * brightFactor;
              lineColors[lineColorsIndex++] = c2.r * brightFactor;
              lineColors[lineColorsIndex++] = c2.g * brightFactor;
              lineColors[lineColorsIndex++] = c2.b * brightFactor;
            }
          }
        }
      }

      lineGeometry.setDrawRange(0, lineVertexIndex / 3);
      (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      pointTexture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [interactive, count, maxConnectionDist, effectiveAccent, effectiveSecondary, isDarkMode]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
