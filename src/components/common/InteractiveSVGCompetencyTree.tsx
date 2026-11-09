import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Target,
  Maximize2,
  Layers,
} from 'lucide-react';

export interface CompetencyNode {
  id: string;
  name: string;
  shortLabel: string;
  category: string;
  tier: number; // 1, 2, 3, 4
  mastery: number; // 0 - 100
  status: 'mastered' | 'review' | 'critical';
  questionsCount: number;
  prerequisites: string[]; // parent ids
  x: number;
  y: number;
  diagnosticNote: string;
}

interface InteractiveSVGCompetencyTreeProps {
  nodes?: CompetencyNode[];
  onLaunchDrill?: (conceptName: string) => void;
  roleAccent?: string;
}

const DEFAULT_NODES: CompetencyNode[] = [
  // Tier 1: Foundations
  {
    id: 'arrays',
    name: 'Linear Arrays & Complexity Bounds',
    shortLabel: 'Linear Arrays',
    category: 'Foundations',
    tier: 1,
    mastery: 92,
    status: 'mastered',
    questionsCount: 48,
    prerequisites: [],
    x: 80,
    y: 110,
    diagnosticNote: 'Exemplary grasp of contiguous memory layout, index indexing, and amortized doubling bounds.',
  },
  {
    id: 'stack-queue',
    name: 'Stack & Queue FIFO/LIFO Primitives',
    shortLabel: 'Stack & Queue',
    category: 'Foundations',
    tier: 1,
    mastery: 88,
    status: 'mastered',
    questionsCount: 36,
    prerequisites: [],
    x: 80,
    y: 280,
    diagnosticNote: 'Strong proficiency in push/pop invariants and monotonic stack problem-solving.',
  },

  // Tier 2: Intermediate Structures
  {
    id: 'hashing',
    name: 'Hash Tables & Bucket Collisions',
    shortLabel: 'Hash Tables',
    category: 'Intermediate',
    tier: 2,
    mastery: 84,
    status: 'mastered',
    questionsCount: 42,
    prerequisites: ['arrays'],
    x: 320,
    y: 90,
    diagnosticNote: 'Consistent performance on load factor re-hashing and probe sequence complexity.',
  },
  {
    id: 'bst',
    name: 'Binary Search Tree Traversals',
    shortLabel: 'BST Traversals',
    category: 'Intermediate',
    tier: 2,
    mastery: 68,
    status: 'review',
    questionsCount: 34,
    prerequisites: ['arrays', 'stack-queue'],
    x: 320,
    y: 200,
    diagnosticNote: 'Understands in-order/pre-order, but requires vigilance on successor deletion edge cases.',
  },
  {
    id: 'avl',
    name: 'AVL Tree Balancing & Rotations',
    shortLabel: 'AVL Rotations',
    category: 'Intermediate',
    tier: 2,
    mastery: 54,
    status: 'review',
    questionsCount: 29,
    prerequisites: ['bst'],
    x: 320,
    y: 310,
    diagnosticNote: 'Confuses Left-Right vs Right-Left double rotations when height factor delta equals 2.',
  },

  // Tier 3: Graph Structures
  {
    id: 'bfs-dfs',
    name: 'Graph BFS & DFS Traversals',
    shortLabel: 'Graph Traversals',
    category: 'Graphs',
    tier: 3,
    mastery: 62,
    status: 'review',
    questionsCount: 38,
    prerequisites: ['stack-queue', 'bst'],
    x: 580,
    y: 140,
    diagnosticNote: 'Breadth-first shortest path solid; Depth-first back-edge detection needs reinforcement.',
  },
  {
    id: 'cycle-detect',
    name: 'Graph Cycle & Topological Sort',
    shortLabel: 'Cycle Detection',
    category: 'Graphs',
    tier: 3,
    mastery: 44,
    status: 'critical',
    questionsCount: 31,
    prerequisites: ['bfs-dfs'],
    x: 580,
    y: 270,
    diagnosticNote: 'Diagnostic flag: 38% error rate identifying cross edges in directed acyclic graphs (DAGs).',
  },

  // Tier 4: Advanced Synthesis
  {
    id: 'dp',
    name: 'Dynamic Programming Memoization',
    shortLabel: 'DP Memoization',
    category: 'Advanced',
    tier: 4,
    mastery: 36,
    status: 'critical',
    questionsCount: 24,
    prerequisites: ['cycle-detect', 'avl'],
    x: 820,
    y: 200,
    diagnosticNote: 'Critical target: Struggle with overlapping subproblem state formulation and base cases.',
  },
];

export const InteractiveSVGCompetencyTree: React.FC<InteractiveSVGCompetencyTreeProps> = ({
  nodes = DEFAULT_NODES,
  onLaunchDrill,
  roleAccent = '#00F0FF',
}) => {
  const { isDark } = useTheme();
  const [selectedNode, setSelectedNode] = useState<CompetencyNode | null>(nodes[nodes.length - 1]);
  const [hoveredNode, setHoveredNode] = useState<CompetencyNode | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'mastered'>('all');

  // Find node by ID
  const getNode = (id: string) => nodes.find((n) => n.id === id);

  // Check if a line is active (hovered or selected)
  const isLineActive = (fromId: string, toId: string) => {
    const active = hoveredNode || selectedNode;
    if (!active) return false;
    if (active.id === toId && active.prerequisites.includes(fromId)) return true;
    if (active.id === fromId) {
      const target = getNode(toId);
      if (target && target.prerequisites.includes(fromId)) return true;
    }
    return false;
  };

  const filteredNodes = nodes.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'critical') return n.status === 'critical' || n.status === 'review';
    if (filter === 'mastered') return n.status === 'mastered';
    return true;
  });

  return (
    <div className={`${isDark ? 'bg-[#0B0F17]/80 border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'} rounded-3xl border p-6 sm:p-8 backdrop-blur-xl space-y-6 relative overflow-hidden`}>
      {/* Editorial Section Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono tracking-[0.25em] ${isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-bold'} uppercase`}>
              TOPOLOGY GRAPH · INTERACTIVE VECTOR CANVAS
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>
            Prerequisite Invariant & Knowledge Architecture
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
            Living dependency lattice. Click any concept node to inspect psychometric telemetry or launch a diagnostic drill.
          </p>
        </div>

        {/* Filter Controls (Zero-pill button tabs) */}
        <div className={`flex items-center gap-1.5 p-1 ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-100 border-slate-200'} rounded-xl border self-start sm:self-auto shrink-0`}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filter === 'all'
                ? isDark ? 'bg-white text-black font-bold' : 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Nodes ({nodes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filter === 'critical' ? 'bg-rose-500 text-white font-bold' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Remediation Targets
          </button>
          <button
            type="button"
            onClick={() => setFilter('mastered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filter === 'mastered' ? 'bg-[#00FF88] text-black font-bold' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mastered
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className={`relative w-full overflow-x-auto rounded-2xl ${isDark ? 'bg-[#070A10] border-white/[0.05]' : 'bg-slate-50 border-slate-200 shadow-inner'} border p-2 min-h-[400px]`}>
        {/* Subtle coordinate grid lines */}
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(#ffffff08_1px,transparent_1px)]' : 'bg-[radial-gradient(#0f172a10_1px,transparent_1px)]'} [background-size:24px_24px] pointer-events-none`} />

        <svg
          viewBox="0 0 960 400"
          className="w-full h-auto min-w-[760px] select-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Linear Glow Gradients for connecting lines */}
            <linearGradient id="lineGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#00FF88" />
            </linearGradient>
            <linearGradient id="lineGradCritical" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Connecting Bezier Curves */}
          {nodes.map((node) =>
            node.prerequisites.map((prereqId) => {
              const parent = getNode(prereqId);
              if (!parent) return null;
              const active = isLineActive(parent.id, node.id);

              // Calculate control points for smooth horizontal S-curve
              const dx = (node.x - parent.x) / 2;
              const pathD = `M ${parent.x + 60} ${parent.y} C ${parent.x + 60 + dx} ${parent.y}, ${node.x - 60 - dx} ${node.y}, ${node.x - 60} ${node.y}`;

              return (
                <g key={`${parent.id}->${node.id}`}>
                  {/* Background shadow stroke */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={active ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={active ? 3 : 1.2}
                    className="transition-all duration-300"
                    filter={active ? 'url(#glowEffect)' : undefined}
                  />
                  {/* Animated dash current for active connections */}
                  {active && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#lineGradActive)"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })
          )}

          {/* Render Node Groups */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            const ringColor =
              node.status === 'mastered'
                ? '#00FF88'
                : node.status === 'review'
                ? '#F59E0B'
                : '#F43F5E';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform duration-200"
                style={{
                  transform: isSelected || isHovered ? `translate(${node.x}px, ${node.y}px) scale(1.08)` : undefined,
                  transformOrigin: `${node.x}px ${node.y}px`,
                }}
              >
                {/* Node Backing Pill Frame */}
                <rect
                  x="-65"
                  y="-26"
                  width="130"
                  height="52"
                  rx="14"
                  fill={isDark ? '#0B0F17' : '#FFFFFF'}
                  stroke={isSelected ? (isDark ? '#FFFFFF' : '#0F172A') : isHovered ? ringColor : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.15)')}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-colors shadow-lg"
                />

                {/* Status Dot / Progress Bar Indicator */}
                <circle
                  cx="-48"
                  cy="0"
                  r="6"
                  fill={ringColor}
                  stroke={isDark ? '#0B0F17' : '#FFFFFF'}
                  strokeWidth="2"
                />

                {/* Node Title Text */}
                <text
                  x="-34"
                  y="-4"
                  fill={isDark ? '#FFFFFF' : '#0F172A'}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {node.shortLabel}
                </text>

                {/* Mastery Percentage & Status Text */}
                <text
                  x="-34"
                  y="12"
                  fill={isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.mastery}% · {node.status === 'mastered' ? 'Mastered' : node.status === 'review' ? 'Review' : 'Target'}
                </text>

                {/* Active Selection Glow Ring */}
                {isSelected && (
                  <rect
                    x="-68"
                    y="-29"
                    width="136"
                    height="58"
                    rx="16"
                    fill="none"
                    stroke={isDark ? '#00F0FF' : '#2563EB'}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity={0.8}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspection Drawer */}
      {selectedNode && (
        <div className={`p-5 sm:p-6 rounded-2xl ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-slate-50 border-slate-200 shadow-sm'} border flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all`}>
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                NODE INSPECTION · {selectedNode.category} TIER {selectedNode.tier}
              </span>
              <span className={isDark ? 'text-white/20' : 'text-slate-300'}>·</span>
              <span
                className={`text-[10px] font-mono font-bold uppercase ${
                  selectedNode.status === 'mastered'
                    ? isDark ? 'text-[#00FF88]' : 'text-emerald-600 font-bold'
                    : selectedNode.status === 'review'
                    ? isDark ? 'text-amber-400' : 'text-amber-600 font-bold'
                    : isDark ? 'text-rose-400' : 'text-rose-600 font-bold'
                }`}
              >
                {selectedNode.status === 'mastered'
                  ? 'Mastery Certified'
                  : selectedNode.status === 'review'
                  ? 'Active Review Stage'
                  : 'Critical Remediation Target'}
              </span>
            </div>

            <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              {selectedNode.name}
            </h3>

            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed font-sans`}>
              {selectedNode.diagnosticNote}
            </p>

            <div className={`flex items-center gap-3 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'} pt-1`}>
              <span>Evaluated on {selectedNode.questionsCount} items</span>
              <span className={isDark ? 'text-white/20' : 'text-slate-300'}>·</span>
              <span>
                Prerequisites:{' '}
                {selectedNode.prerequisites.length > 0
                  ? selectedNode.prerequisites.map((p) => getNode(p)?.shortLabel).join(', ')
                  : 'Root Invariant'}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-4 self-start md:self-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div className="text-right">
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono block`}>Mastery Score</span>
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedNode.mastery}%
              </span>
            </div>

            {onLaunchDrill && (
              <button
                type="button"
                onClick={() => onLaunchDrill(selectedNode.name)}
                className="px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:scale-[1.02]"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Launch Adaptive Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
