import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { NOCTURNE_AURORA } from '../../design-system/tokens';
import { BrainCircuit, Target, BarChart2, BookOpen, Award, Sparkles } from 'lucide-react';

interface Ecosystem3DCanvasProps {
  className?: string;
  isDark?: boolean;
}

interface NodeInfo {
  id: string;
  title: string;
  role: string;
  color: string;
  description: string;
  pos: [number, number, number];
  icon: React.ElementType;
}

const ECOSYSTEM_NODES: NodeInfo[] = [
  {
    id: 'assessment',
    title: 'Intelligent Assessment',
    role: 'Bloom-Calibrated Exam Assembly',
    color: NOCTURNE_AURORA.electricViolet,
    description: 'Decomposes syllabus materials into balanced difficulty tiers with locked proctoring.',
    pos: [-140, 60, 20],
    icon: Target,
  },
  {
    id: 'tutor',
    title: 'Socratic AI Tutor',
    role: 'Conceptual Remediation Engine',
    color: NOCTURNE_AURORA.auroraTeal,
    description: 'Diagnoses student misconceptions and guides understanding without revealing raw answers.',
    pos: [140, 70, -20],
    icon: BrainCircuit,
  },
  {
    id: 'analytics',
    title: 'Real-Time Analytics',
    role: 'Topic Gap Telemetry',
    color: NOCTURNE_AURORA.softCoral,
    description: 'Calculates continuous accuracy curves, weak topic clusters, and class-wide averages.',
    pos: [-120, -75, -30],
    icon: BarChart2,
  },
  {
    id: 'learning',
    title: 'Personalized Learning',
    role: 'Adaptive Question Routing',
    color: NOCTURNE_AURORA.luminousMint,
    description: 'Draws strictly from approved question bank matching the student’s live mastery level.',
    pos: [130, -70, 30],
    icon: BookOpen,
  },
  {
    id: 'progress',
    title: 'Student Progress',
    role: 'Central Learning Profile',
    color: NOCTURNE_AURORA.warmIvory,
    description: 'The unified knowledge state connecting assessment results directly to study plans.',
    pos: [0, 0, 0],
    icon: Award,
  },
];

export const Ecosystem3DCanvas: React.FC<Ecosystem3DCanvasProps> = ({
  className = 'w-full h-[460px] relative rounded-2xl overflow-hidden',
  isDark = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<NodeInfo>(ECOSYSTEM_NODES[4]);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const canvasMount = canvasMountRef.current;
    if (!container || !canvasMount) return;

    // 1. Safe offscreen WebGL check (NEVER invoke getContext on the canvas element used by Three.js)
    const checkWebGL = (): boolean => {
      try {
        const testCanvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (testCanvas.getContext('webgl2') ||
            testCanvas.getContext('webgl') ||
            testCanvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    };

    if (!checkWebGL()) {
      setWebglSupported(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Initialize Three.js Scene inside try-catch to protect against GPU/WebGL context initialization errors
    let renderer: THREE.WebGLRenderer;
    let animId: number;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'default',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';

      // Clear any prior children before appending
      canvasMount.innerHTML = '';
      canvasMount.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('Three.js WebGLRenderer allocation failed, falling back to SVG:', err);
      setWebglSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 380);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 600);
    pointLight.position.set(0, 100, 200);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    // Meshes for each ecosystem node
    const nodeMeshes: { mesh: THREE.Mesh; node: NodeInfo; initialScale: number }[] = [];

    ECOSYSTEM_NODES.forEach((node) => {
      let geo: THREE.BufferGeometry;
      if (node.id === 'progress') {
        geo = new THREE.SphereGeometry(22, 32, 32);
      } else if (node.id === 'assessment') {
        geo = new THREE.OctahedronGeometry(18, 0);
      } else if (node.id === 'tutor') {
        geo = new THREE.IcosahedronGeometry(17, 0);
      } else if (node.id === 'analytics') {
        geo = new THREE.TorusGeometry(14, 5, 16, 32);
      } else {
        geo = new THREE.DodecahedronGeometry(16, 0);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        roughness: 0.25,
        metalness: 0.65,
        emissive: new THREE.Color(node.color),
        emissiveIntensity: node.id === 'progress' ? 0.35 : 0.2,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.pos);
      group.add(mesh);
      nodeMeshes.push({ mesh, node, initialScale: 1 });

      // Pulsing Wireframe Halo
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const halo = new THREE.Mesh(geo.clone(), haloMat);
      halo.scale.set(1.4, 1.4, 1.4);
      mesh.add(halo);
    });

    // Connecting Energy Lines between Central Node and Surrounding Nodes
    const centralPos = new THREE.Vector3(0, 0, 0);
    const lineGroup = new THREE.Group();
    group.add(lineGroup);

    ECOSYSTEM_NODES.filter((n) => n.id !== 'progress').forEach((outerNode) => {
      const outerPos = new THREE.Vector3(...outerNode.pos);
      const mid = new THREE.Vector3()
        .addVectors(centralPos, outerPos)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40));

      const curve = new THREE.QuadraticBezierCurve3(centralPos, mid, outerPos);
      const points = curve.getPoints(36);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(outerNode.color),
        transparent: true,
        opacity: isDark ? 0.55 : 0.35,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      lineGroup.add(line);
    });

    // Interactivity: Raycaster for Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const matched = nodeMeshes.find((n) => n.mesh === hit);
        if (matched) {
          setActiveNode(matched.node);
          document.body.style.cursor = 'pointer';
        }
      } else {
        document.body.style.cursor = 'default';
      }
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        group.rotation.y = elapsedTime * 0.12;
        group.rotation.x = Math.sin(elapsedTime * 0.2) * 0.08;

        nodeMeshes.forEach(({ mesh, node }, idx) => {
          mesh.rotation.y = elapsedTime * (0.4 + idx * 0.1);
          mesh.rotation.x = elapsedTime * 0.25;

          // Gentle vertical breathing oscillation
          if (node.id !== 'progress') {
            mesh.position.y = node.pos[1] + Math.sin(elapsedTime * 1.5 + idx) * 6;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && canvasMount.contains(renderer.domElement)) {
        canvasMount.removeChild(renderer.domElement);
      }
      try {
        renderer.dispose();
        renderer.forceContextLoss();
      } catch {}
      document.body.style.cursor = 'default';
    };
  }, [isDark]);

  const ActiveIcon = activeNode.icon;

  return (
    <div ref={containerRef} className={className}>
      {webglSupported ? (
        <div ref={canvasMountRef} className="w-full h-full block" />
      ) : (
        /* Static High-Fidelity SVG Fallback when WebGL is unavailable */
        <div className="w-full h-full flex items-center justify-center bg-black/40 p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg">
            {ECOSYSTEM_NODES.map((node) => (
              <div
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                  activeNode.id === node.id
                    ? 'border-white/40 bg-white/10 scale-105'
                    : 'border-white/10 bg-slate-900/80 hover:border-white/20'
                }`}
              >
                <div
                  className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${node.color}25`, color: node.color }}
                >
                  <node.icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">{node.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Interactive Telemetry HUD Card */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm p-4 rounded-xl backdrop-blur-md border border-white/15 bg-black/75 shadow-2xl transition-all duration-300 pointer-events-none sm:pointer-events-auto">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${activeNode.color}25`, color: activeNode.color }}
          >
            <ActiveIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">{activeNode.title}</div>
            <div className="text-[10px] font-mono" style={{ color: activeNode.color }}>
              {activeNode.role}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{activeNode.description}</p>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2.5 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#68E0D0]" />
            <span>Interactive Node Mesh</span>
          </span>
          <span className="text-emerald-400 font-semibold">Live Ecosystem Synced</span>
        </div>
      </div>
    </div>
  );
};
