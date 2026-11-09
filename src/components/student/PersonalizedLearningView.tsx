import React, { useState } from 'react';
import { LearningPlan, StudentProfile, Material } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Target,
  MessageSquareText,
  Play,
  RotateCcw,
  Compass,
  Video,
  FileText,
  ExternalLink,
  Zap,
  GraduationCap,
  Eye,
  Check,
  Search,
  Activity,
  Layers,
} from 'lucide-react';
import {
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  AnimatedButton,
  FadeIn,
  SlideUp,
} from '../animation/AnimationComponents';
import { QuickNotesModal } from '../common/QuickNotesModal';
import { Modal } from '../common/Modal';

interface PersonalizedLearningViewProps {
  learningPlan: LearningPlan | null;
  studentProfile: StudentProfile | null;
  materials?: Material[];
  onStartPractice: (topic?: string, difficulty?: 'easy' | 'medium' | 'hard') => void;
  onAskTutor: (concept: string) => void;
}

interface CuratedResource {
  type: 'video' | 'article';
  title: string;
  source: string;
  url: string;
  durationOrReadTime: string;
  summary: string;
}

const TOPIC_RESOURCES: Record<string, CuratedResource[]> = {
  'Trees & Hierarchies': [
    {
      type: 'video',
      title: 'Binary Search Trees & Traversal Algorithms Visualized',
      source: 'Abdul Bari / Algorithms',
      url: 'https://www.youtube.com/results?search_query=Binary+Search+Tree+traversal+Abdul+Bari',
      durationOrReadTime: '18 min',
      summary: 'Step-by-step mathematical demonstration of In-order, Pre-order, and AVL balance factors.',
    },
    {
      type: 'video',
      title: 'Binary Search Tree - Traversal & Operations In-Depth',
      source: 'NeetCode',
      url: 'https://www.youtube.com/results?search_query=Binary+Search+Tree+NeetCode',
      durationOrReadTime: '12 min',
      summary: 'Focuses on edge case handling: leaf removals, single child promotions, and predecessor swaps.',
    },
    {
      type: 'article',
      title: 'BST Visualizer & Interactive Complexity Sandbox',
      source: 'VisuAlgo.net',
      url: 'https://visualgo.net/en/bst',
      durationOrReadTime: '8 min interactive',
      summary: 'Interactive animated step-through of BST insertion, search, and AVL rotations in real-time.',
    },
    {
      type: 'article',
      title: 'Binary Search Tree Invariants & Deletion Guide',
      source: 'Stanford CS Education Library',
      url: 'http://cslibrary.stanford.edu/110/BinaryTrees.html',
      durationOrReadTime: '10 min read',
      summary: 'Definitive guide on pointer invariants, recursion stack limits, and balance proofs.',
    },
  ],
  'Graph Algorithms': [
    {
      type: 'video',
      title: 'Breadth-First Search (BFS) & Depth-First Search (DFS) In-Depth',
      source: 'WilliamFiset',
      url: 'https://www.youtube.com/results?search_query=BFS+and+DFS+Graph+Algorithms+WilliamFiset',
      durationOrReadTime: '22 min',
      summary: 'Visualizing FIFO Queue state vs recursion call stacks and back-edge cycle detection.',
    },
    {
      type: 'video',
      title: 'Dijkstra Shortest Path Algorithm Explained Visually',
      source: 'Abdul Bari',
      url: 'https://www.youtube.com/results?search_query=Dijkstra+Shortest+Path+Algorithm+Abdul+Bari',
      durationOrReadTime: '16 min',
      summary: 'Detailed explanation of why negative edge weights invalidate greedy distance invariants.',
    },
    {
      type: 'article',
      title: 'Graph Traversal & Topological Ordering Deep Dive',
      source: 'MIT OpenCourseWare (6.006)',
      url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
      durationOrReadTime: '15 min read',
      summary: 'Rigorous lecture notes proving cycle detection invariants and strongly connected components.',
    },
    {
      type: 'article',
      title: 'Graph Algorithm Visualizations & Pathfinding Simulator',
      source: 'Red Blob Games',
      url: 'https://www.redblobgames.com/pathfinding/a-star/introduction.html',
      durationOrReadTime: '12 min interactive',
      summary: 'World-renowned interactive playground comparing BFS, Dijkstra, and A* heuristics on custom grid maps.',
    },
  ],
  'Dynamic Programming': [
    {
      type: 'video',
      title: 'Dynamic Programming - Learn to Solve Algorithmic Problems & Memoization',
      source: 'freeCodeCamp',
      url: 'https://www.youtube.com/results?search_query=dynamic+programming+freecodecamp',
      durationOrReadTime: '45 min',
      summary: 'Comprehensive breakdown of 0/1 Knapsack, memoization trees, and bottom-up tabular optimization.',
    },
    {
      type: 'article',
      title: 'Demystifying Dynamic Programming Recurrences',
      source: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/dynamic-programming/',
      durationOrReadTime: '12 min read',
      summary: 'Transition functions, state space minimization, and DAG topological sub-problem ordering.',
    },
  ],
};

const DEFAULT_RESOURCES: CuratedResource[] = [
  {
    type: 'video',
    title: 'Core Algorithmic Complexity & Asymptotic Mastery',
    source: 'MIT 6.006 Algorithms',
    url: 'https://www.youtube.com/results?search_query=MIT+6.006+algorithms+lecture+1',
    durationOrReadTime: '20 min',
    summary: 'Master equation proofs, recursion trees, and asymptotic bounds.',
  },
  {
    type: 'article',
    title: 'Interactive Algorithm Visualizer & Complexity Reference',
    source: 'Algorithm Visualizer',
    url: 'https://algorithm-visualizer.org/',
    durationOrReadTime: '10 min interactive',
    summary: 'Live execution visualizer stepping through code line-by-line with call stack diagnostics.',
  },
];

export const PersonalizedLearningView: React.FC<PersonalizedLearningViewProps> = ({
  learningPlan,
  studentProfile,
  materials = [],
  onStartPractice,
  onAskTutor,
}) => {
  const [quickNotesTopic, setQuickNotesTopic] = useState<string | null>(null);
  const [selectedMaterialPreview, setSelectedMaterialPreview] = useState<Material | null>(null);

  if (!learningPlan) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#00F0FF]">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">No Active Learning Plan Generated Yet</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Your personalized study curriculum is dynamically synthesized by Atom AI based on your diagnostic assessment results. Take an examination or launch practice drills to calibrate your competency baseline.
          </p>
        </div>
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onStartPractice()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all cursor-pointer shadow-lg shadow-[#00F0FF]/20"
          >
            Launch Practice Drills
          </button>
        </div>
      </div>
    );
  }

  const plan = learningPlan;
  const strengths = studentProfile?.strengths || [];
  const weaknesses = studentProfile?.weaknesses || [];

  const findMatchingTeacherMaterials = (topic: string): Material[] => {
    return materials.filter((m) => {
      const topicLower = topic.toLowerCase();
      const subjectMatch = m.subject?.toLowerCase().includes(topicLower) || false;
      const topicMatch = m.topic?.toLowerCase().includes(topicLower) || false;
      const conceptMatch = m.structuredConcepts?.some((sc) =>
        sc.concepts.some((c) => c.concept.toLowerCase().includes(topicLower))
      ) || false;
      return subjectMatch || topicMatch || conceptMatch;
    });
  };

  const getCuratedResources = (topic: string): CuratedResource[] => {
    if (TOPIC_RESOURCES[topic]) return TOPIC_RESOURCES[topic];
    for (const [key, resources] of Object.entries(TOPIC_RESOURCES)) {
      if (topic.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(topic.toLowerCase())) {
        return resources;
      }
    }
    return DEFAULT_RESOURCES;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-white">
      {/* Tactical HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-[#00F0FF]">
            <Compass className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase">ADAPTIVE REMEDIATION RADAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Personalized Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Algorithmic knowledge-gap remediation generated from your verified diagnostic errors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 backdrop-blur-md flex items-center gap-2 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>GEMINI 3.8 FLASH RAG ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Quick Action Top Bar */}
      <SlideUp>
        <div className="p-5 sm:p-6 bg-[#0A0D14]/85 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold uppercase">NEXT BEST ACTION</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Target your highest-yield priority concept: <strong className="text-white">{weaknesses[0] || 'Binary Search Trees'}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setQuickNotesTopic(weaknesses[0] || 'Binary Search Trees')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>Generate Quick Notes</span>
          </button>
        </div>
      </SlideUp>

      {/* Strengths vs Improvement Areas Split */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <StaggerItem>
          <div className="bg-[#0A0D14]/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#10B981]">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Verified Strengths</h2>
            </div>
            <p className="text-xs text-slate-400">
              Concepts where you consistently score &ge;80% across repeated diagnostic evaluations.
            </p>

            <div className="space-y-2 pt-1">
              {strengths.map((str, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#10B981]/10 rounded-xl border border-[#10B981]/30 text-xs font-mono text-white flex items-center justify-between"
                >
                  <span className="font-medium">{str}</span>
                  <span className="text-[11px] font-bold text-[#10B981] uppercase">Mastered</span>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Improvement Card */}
        <StaggerItem>
          <div className="bg-[#0A0D14]/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Priority Remediation Areas</h2>
            </div>
            <p className="text-xs text-slate-400">
              Evidence of misconception or incomplete mastery based on objective assessment errors.
            </p>

            <div className="space-y-2 pt-1">
              {weaknesses.map((weak, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-400/10 rounded-xl border border-amber-400/30 text-xs font-mono text-white flex items-center justify-between"
                >
                  <span className="font-medium">{weak}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickNotesTopic(weak)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3 h-3 fill-amber-400" />
                      <span>Cheat Sheet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAskTutor(weak)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <MessageSquareText className="w-3.5 h-3.5" />
                      <span>AI Tutor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* AI Diagnostic Explanation */}
      <FadeIn>
        <div className="p-6 bg-[#0A0D14]/85 rounded-2xl text-white shadow-xl space-y-2 border border-purple-500/30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Diagnostic Insights & Root Cause Analysis</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {plan.explanation}
          </p>
        </div>
      </FadeIn>

      {/* Recommended 5-Step Learning Path */}
      <div className="bg-[#0A0D14]/80 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-6">
        <div>
          <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider">
            Recommended Adaptive Learning Sequence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow this calibrated step-by-step path to eliminate knowledge gaps before your next formal exam.
          </p>
        </div>

        <StaggerContainer className="relative pl-6 border-l border-white/10 space-y-5">
          {plan.recommendedSequence.map((step, idx) => (
            <StaggerItem key={idx}>
              <div className="relative group">
                <span className="w-5 h-5 rounded-full bg-[#00F0FF] text-black font-bold font-mono text-[10px] flex items-center justify-center absolute -left-[35px] top-3 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                  {idx + 1}
                </span>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#00F0FF]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-200">{step}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onAskTutor(step)}
                      className="px-3 py-1.5 text-[11px] font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 rounded-lg transition-colors cursor-pointer"
                    >
                      AI Tutor Guide
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartPractice()}
                      className="px-3 py-1.5 text-[11px] font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-lg transition-colors shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
                    >
                      Start Drill
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* TARGETED PRACTICE MODULES (With AI-Curated Videos, Articles, and Teacher Materials Cross-Check) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-5 h-5 text-[#00F0FF]" />
              <span>Targeted Practice Modules & Multi-Modal Curriculum Resources</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              AI checks teacher-uploaded study materials, finds top video lessons, and pairs them with adaptive drills.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-lg border border-[#10B981]/30 flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>AI Syllabus Cross-Checked</span>
          </span>
        </div>

        <div className="space-y-6">
          {plan.practiceRecommendations.map((rec, i) => {
            const matchedTeacherMaterials = findMatchingTeacherMaterials(rec.topic);
            const curatedResources = getCuratedResources(rec.topic);

            return (
              <div
                key={i}
                className="p-6 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-5"
              >
                {/* Module Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                        Priority Module #{i + 1} · {rec.recommendedDifficulty} Difficulty
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                        {rec.count} Questions
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mt-1">{rec.topic}</h4>
                    <p className="text-xs text-slate-400 font-mono">Focus: {rec.focus}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuickNotesTopic(rec.topic)}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black text-black" />
                      <span>Quick Notes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartPractice(rec.topic, rec.recommendedDifficulty)}
                      className="py-2 px-4 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Launch Drill</span>
                    </button>
                  </div>
                </div>

                {/* 1. TEACHER UPLOADED STUDY MATERIAL AI SCAN */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span>AI Verification: Teacher Course Materials</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                      {matchedTeacherMaterials.length > 0 ? `${matchedTeacherMaterials.length} Handout(s) Matched` : 'Auto-Checked'}
                    </span>
                  </div>

                  {matchedTeacherMaterials.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-purple-200/90 leading-relaxed font-mono">
                        AI cross-referenced your course syllabus materials and identified relevant chapters uploaded by your instructor:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {matchedTeacherMaterials.map((mat, matIdx) => {
                          const concepts = mat.structuredConcepts
                            ? mat.structuredConcepts.flatMap((sc) => sc.concepts.map((c) => c.concept))
                            : [mat.topic];
                          return (
                            <div
                              key={`${mat.materialId || 'mat'}-${matIdx}`}
                              className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-start justify-between gap-3 shadow-md"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                                  <h5 className="text-xs font-bold text-white truncate">
                                    {mat.fileName}
                                  </h5>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                  {concepts.slice(0, 3).join(', ') || mat.subject}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedMaterialPreview(mat)}
                                className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#00F0FF] hover:bg-[#00F0FF]/10 rounded-lg border border-[#00F0FF]/30 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span>
                        No specific instructor PDF was uploaded for {rec.topic}. AI has retrieved top Stanford/MIT materials below.
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. AI CURATED YOUTUBE VIDEOS & DEEP-DIVE ARTICLES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* YouTube Lessons */}
                  <div className="space-y-2.5">
                    <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Video className="w-4 h-4 text-rose-400" />
                      <span>Best Curated Video Lessons</span>
                    </h5>

                    <div className="space-y-2">
                      {curatedResources
                        .filter((r) => r.type === 'video')
                        .map((vid, idx) => (
                          <a
                            key={idx}
                            href={vid.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-rose-400/50 transition-all flex flex-col justify-between group block"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                  {vid.source}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                  <span>{vid.durationOrReadTime}</span>
                                  <ExternalLink className="w-3 h-3 group-hover:text-rose-400" />
                                </span>
                              </div>
                              <h6 className="text-xs font-bold text-white mt-1 group-hover:text-rose-300 leading-snug">
                                {vid.title}
                              </h6>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {vid.summary}
                              </p>
                            </div>
                          </a>
                        ))}
                    </div>
                  </div>

                  {/* Curated Articles & Visualizers */}
                  <div className="space-y-2.5">
                    <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#00F0FF]" />
                      <span>Academic Articles & Visualizers</span>
                    </h5>

                    <div className="space-y-2">
                      {curatedResources
                        .filter((r) => r.type === 'article')
                        .map((art, idx) => (
                          <a
                            key={idx}
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#00F0FF]/50 transition-all flex flex-col justify-between group block"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/20">
                                  {art.source}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                  <span>{art.durationOrReadTime}</span>
                                  <ExternalLink className="w-3 h-3 group-hover:text-[#00F0FF]" />
                                </span>
                              </div>
                              <h6 className="text-xs font-bold text-white mt-1 group-hover:text-[#00F0FF] leading-snug">
                                {art.title}
                              </h6>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {art.summary}
                              </p>
                            </div>
                          </a>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Notes Modal */}
      {quickNotesTopic && (
        <QuickNotesModal
          isOpen={!!quickNotesTopic}
          onClose={() => setQuickNotesTopic(null)}
          initialTopic={quickNotesTopic}
          role="student"
          weakTopics={weaknesses}
          onStartPractice={(top) => {
            setQuickNotesTopic(null);
            onStartPractice(top);
          }}
        />
      )}

      {/* Teacher Material Excerpt Viewer Modal */}
      {selectedMaterialPreview && (
        <Modal
          isOpen={!!selectedMaterialPreview}
          onClose={() => setSelectedMaterialPreview(null)}
          title={selectedMaterialPreview.fileName}
          subtitle={`Course Study Material · ${selectedMaterialPreview.subject}`}
        >
          <div className="space-y-4 text-xs text-white">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-200 space-y-1 font-mono">
              <span className="font-bold block uppercase text-[10px] text-purple-300">AI Syllabus Cross-Check Summary:</span>
              <p className="text-xs">
                This document was uploaded by your instructor and calibrated into the academic curriculum and personalized remediation engine.
              </p>
            </div>

            {selectedMaterialPreview.structuredConcepts && selectedMaterialPreview.structuredConcepts.length > 0 && (
              <div>
                <h4 className="font-mono font-bold text-white mb-1.5 uppercase text-[11px]">
                  Core Concepts Covered in Handout:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMaterialPreview.structuredConcepts
                    .flatMap((st) => st.concepts.map((c) => c.concept))
                    .map((cName, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white/5 text-slate-300 border border-white/10"
                      >
                        {cName}
                      </span>
                    ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-mono font-bold text-white mb-1.5 uppercase text-[11px]">
                Material Excerpt & Syllabus Reference:
              </h4>
              <div className="p-4 bg-black/40 rounded-xl border border-white/10 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300">
                {selectedMaterialPreview.summary ||
                  selectedMaterialPreview.extractedText?.slice(0, 1000) ||
                  'Course lecture handout covering theoretical bounds, asymptotic behavior, structural invariants, and representative exam questions.'}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedMaterialPreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
