import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ShieldCheck, Sparkles, Zap, Radio } from 'lucide-react';
import { AuthTab } from '../auth/AuthPage';
import { useTheme } from '../../context/ThemeContext';

interface Auth3DGatewayProps {
  activeTab?: AuthTab;
}

export const Auth3DGateway: React.FC<Auth3DGatewayProps> = ({ activeTab = 'login' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const triggerPulseRef = useRef<(() => void) | null>(null);
  const { isDark } = useTheme();

  // Determine active theme color based on selected tab
  const getThemeColor = (tab: AuthTab) => {
    switch (tab) {
      case 'register-student':
        return 0x00f0ff; // Cyan
      case 'register-teacher':
        return 0x10b981; // Emerald
      case 'admin-access':
        return 0xf59e0b; // Amber
      default:
        return 0x38bdf8; // Blue
    }
  };

  const activeColor = getThemeColor(activeTab);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = 180;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x060910 : 0xf8fafc, 0.06);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x00f0ff, isDark ? 0x07090e : 0xe2e8f0, 1.2);
    scene.add(fillLight);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Refractive Security Prism (Polyhedral Core)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: activeColor,
      emissive: activeColor,
      emissiveIntensity: isDark ? 0.6 : 0.35,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Inner wireframe lattice
    const innerGeo = new THREE.OctahedronGeometry(0.55, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xffffff : 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.5 : 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // 2. Dual Concentric Cryptographic Telemetry Rings
    const ringGeo1 = new THREE.TorusGeometry(1.4, 0.02, 16, 80);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.68, 0.015, 16, 80);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 5;
    group.add(ring2);

    // 3. Orbiting Identity Nodes (Student, Faculty, Admin)
    const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
    const nodeMeshes: THREE.Mesh[] = [];
    const colors = [0x00f0ff, 0x10b981, 0xf59e0b];

    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.8,
        metalness: 0.9,
      });
      const node = new THREE.Mesh(nodeGeo, mat);
      group.add(node);
      nodeMeshes.push(node);
    }

    // 4. Click Shockwave Ring
    const shockGeo = new THREE.RingGeometry(0.1, 0.25, 48);
    const shockMat = new THREE.MeshBasicMaterial({
      color: activeColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockwave = new THREE.Mesh(shockGeo, shockMat);
    shockwave.visible = false;
    group.add(shockwave);

    triggerPulseRef.current = () => {
      shockwave.visible = true;
      shockwave.scale.set(0.1, 0.1, 0.1);
      (shockwave.material as THREE.MeshBasicMaterial).opacity = 1.0;
      (shockwave.material as THREE.MeshBasicMaterial).color.setHex(activeColor);
    };

    // 5. Physics Cursor Attraction with Damped Inertia
    const mouse = new THREE.Vector2(0, 0);
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      targetRotY = mouse.x * 0.6;
      targetRotX = -mouse.y * 0.45;
    };

    const onClick = () => {
      triggerPulseRef.current?.();
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // Render loop
    let lastTime = performance.now();
    let animId: number;

    const animate = (currentTime: number = performance.now()) => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;

      // Continuous rotation
      coreMesh.rotation.y += delta * 0.4;
      coreMesh.rotation.x += delta * 0.2;
      innerMesh.rotation.y -= delta * 0.6;
      ring1.rotation.z += delta * 0.35;
      ring2.rotation.z -= delta * 0.28;

      // Orbiting identity nodes
      const time = Date.now() * 0.0015;
      nodeMeshes.forEach((node, i) => {
        const angle = time + (i * Math.PI * 2) / 3;
        node.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 0.6, Math.sin(angle) * 1.5);
        node.rotation.x += delta * 1.5;
        node.rotation.y += delta * 1.2;
      });

      // Smooth spring damping for cursor attraction
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      group.rotation.x = currentRotX;
      group.rotation.y = currentRotY;

      // Shockwave expansion
      if (shockwave.visible) {
        shockwave.scale.x += delta * 9;
        shockwave.scale.y += delta * 9;
        (shockwave.material as THREE.MeshBasicMaterial).opacity -= delta * 1.8;
        if ((shockwave.material as THREE.MeshBasicMaterial).opacity <= 0) {
          shockwave.visible = false;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      shockGeo.dispose();
      shockMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeColor, isDark]);

  return (
    <div className={`relative w-full rounded-2xl ${
      isDark
        ? 'bg-[#060910] border-white/10 text-white'
        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    } border overflow-hidden shadow-xl mb-4 group select-none`}>
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, #${activeColor.toString(16).padStart(6, '0')} 0%, transparent 70%)`,
        }}
      />

      {/* Top Telemetry Header */}
      <div className="absolute top-2.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10 text-[10px] font-mono">
        <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: `#${activeColor.toString(16).padStart(6, '0')}` }}
          />
          <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            SPATIAL AUTHENTICATION VAULT
          </span>
        </div>

        <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-600 font-bold'}`}>● SSL 256-BIT ENCRYPTED</span>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[180px] cursor-grab active:cursor-grabbing relative"
        title="Move cursor to tilt 3D vault · Click to trigger pulse shockwave"
      />

      {/* Bottom Hint */}
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none text-[10px] font-mono text-slate-500">
        Interactive 3D Gateway · Move cursor to orbit · Click to pulse
      </div>
    </div>
  );
};
