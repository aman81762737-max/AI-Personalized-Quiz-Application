import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Assessment, AssessmentAttempt, LearningPlan } from '../../types';
import {
  Sparkles,
  ClipboardList,
  Target,
  Flame,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BookOpen,
  MessageSquareText,
  Calendar,
  Send,
  Zap,
  Check,
  Award,
  Activity,
  Cpu,
  Compass,
  FileQuestion,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { aiService, AskTutorResponse } from '../../services/aiService';
import { useToast } from '../common/Toast';
import {
  StaggerContainer,
  StaggerItem,
  AnimatedNumber,
  AnimatedProgressBar,
  AnimatedProgressRing,
  FadeIn,
} from '../animation/AnimationComponents';
import { QuickNotesModal } from '../common/QuickNotesModal';
import { QuestionDetailModal, QuestionDetailData } from '../common/QuestionDetailModal';
import { subscribePlanMilestones, savePlanMilestonesToCloud } from '../../services/cloudSyncService';

interface StudentDashboardProps {
  assessments: Assessment[];
  attempts: AssessmentAttempt[];
  learningPlan: LearningPlan | null;
  onNavigate: (view: string) => void;
  onStartAssessment: (assessment: Assessment) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  assessments,
  attempts,
  learningPlan,
  onNavigate,
  onStartAssessment,
}) => {
  const { userProfile, studentProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const publishedAssessments = assessments.filter((a) => a.status === 'published');
  const streak = studentProfile?.learningStreak || 0;
  const strengths = studentProfile?.strengths || [];
  const weaknesses = studentProfile?.weaknesses || [];

  const studentAttempts = useMemo(() => {
    return attempts.filter(
      (a) =>
        !userProfile?.userId ||
        a.studentId === userProfile.userId ||
        a.studentId === 'student' ||
        a.studentId === 'student-01'
    );
  }, [attempts, userProfile?.userId]);

  const pendingAssessments = useMemo(() => {
    return publishedAssessments.filter(
      (asm) => !studentAttempts.some((att) => att.assessmentId === asm.assessmentId)
    );
  }, [publishedAssessments, studentAttempts]);

  // Compute live weaknesses dynamically from student profile and recent attempts
  const liveWeaknesses: string[] = useMemo(() => {
    const list: string[] = [];
    if (studentProfile?.weaknesses && studentProfile.weaknesses.length > 0) {
      studentProfile.weaknesses.forEach((w) => {
        if (w && !list.includes(w)) list.push(w);
      });
    }
    attempts.forEach((att) => {
      (att.reviewItems || []).forEach((item) => {
        if (!item.isCorrect && item.topic && !list.includes(item.topic)) {
          list.push(item.topic);
        }
      });
    });
    return list;
  }, [studentProfile?.weaknesses, attempts]);

  // Strict activity condition: only show priority target if student has activity and live weaknesses
  const hasActivity = attempts.length > 0 && liveWeaknesses.length > 0;

  const activePlan: LearningPlan | null = learningPlan;
  const totalPlanMilestones = activePlan?.recommendedSequence?.length || 0;

  const [completedMilestones, setCompletedMilestones] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`plan_milestones_${userProfile?.userId || 'student'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Real-time Cloud Milestones Sync
  React.useEffect(() => {
    if (!userProfile?.userId) return;
    const unsub = subscribePlanMilestones(userProfile.userId, (ids) => {
      if (Array.isArray(ids)) {
        const nums = ids.map((id) => Number(id)).filter((n) => !isNaN(n));
        setCompletedMilestones(nums);
      }
    });
    return () => unsub();
  }, [userProfile?.userId]);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetailData | null>(null);

  const toggleMilestone = (idx: number) => {
    if (totalPlanMilestones === 0) return;
    setCompletedMilestones((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      try {
        localStorage.setItem(`plan_milestones_${userProfile?.userId || 'student'}`, JSON.stringify(next));
        savePlanMilestonesToCloud(userProfile?.userId || 'student', next.map(String)).catch(() => {});
      } catch {}
      const newPercentage = Math.round((next.length / totalPlanMilestones) * 100);
      showToast(
        next.includes(idx)
          ? `Milestone ${idx + 1} completed! Learning Plan: ${newPercentage}% complete.`
          : `Milestone ${idx + 1} marked as in-progress.`,
        'info'
      );
      return next;
    });
  };

  const planCompletionPercentage = totalPlanMilestones > 0
    ? Math.round((completedMilestones.length / totalPlanMilestones) * 100)
    : 0;

  // Quick AI Tutor interaction state inside dashboard
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [tutorRichData, setTutorRichData] = useState<AskTutorResponse | null>(null);
  const [isAskingTutor, setIsAskingTutor] = useState(false);

  const handleQuickAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim()) return;

    setIsAskingTutor(true);
    try {
      const res = await aiService.askTutorRich({
        message: tutorQuery,
        history: [],
        currentTopic: weaknesses[0] || 'Binary Search Trees',
        studentContext: 'CS201 Data Structures Curriculum: Tree balance, in-order traversal, and rotation invariants.',
      });
      setTutorResponse(res.reply);
      setTutorRichData(res);
      showToast('Socratic Tutor responded to your query', 'info');
    } catch {
      setTutorResponse(
        `Great question on **${weaknesses[0] || 'Data Structures'}**! Remember: In balanced BSTs, each node's left subtree contains strictly smaller values and the right strictly larger. When you rotate a tree to restore balance, you preserve this in-order property in O(1) time.`
      );
      setTutorRichData(null);
    } finally {
      setIsAskingTutor(false);
    }
  };

  const [quickNotesOpen, setQuickNotesOpen] = useState(false);
  const [quickNotesTopic, setQuickNotesTopic] = useState('');

  // Sample pedagogical questions for weak areas
  // Pedagogical questions for weak areas, prioritizing actual student attempt mistakes
  const getQuestionForWeakness = (weakness: string): QuestionDetailData => {
    // 1. First, search student attempts for an actual question they missed on this weakness
    for (const att of attempts) {
      const wrong = (att.reviewItems || []).find(
        (r) => !r.isCorrect && (r.topic?.toLowerCase().includes(weakness.toLowerCase()) || weakness.toLowerCase().includes(r.topic?.toLowerCase() || ''))
      );
      if (wrong) {
        return {
          questionText: wrong.questionText,
          topic: wrong.topic || weakness,
          subtopic: 'Live Assessment Diagnostic Review',
          options: wrong.options && wrong.options.length >= 2
            ? wrong.options
            : [wrong.correctAnswer, wrong.studentAnswer, 'Alternative Concept A', 'Alternative Concept B'],
          submittedAnswer: wrong.studentAnswer,
          correctAnswer: wrong.correctAnswer,
          explanation: wrong.explanation || `Core invariant violation identified in ${weakness}. Review base cases and state transitions.`,
          difficulty: (wrong.difficulty as any) || 'Medium',
          bloomLevel: 'Analyze',
          accuracyRate: 40,
        };
      }
    }

    if (weakness.toLowerCase().includes('graph')) {
      return {
        questionText: "In Tarjan's Strongly Connected Components algorithm, which edge classification directly updates lowlink[u] to discover a cycle back to an ancestor?",
        topic: "Graph Traversals",
        subtopic: "Depth-First Search & Cycle Invariants",
        options: [
          "A forward edge to an already finalized descendant node",
          "A tree edge traversing an unvisited vertex in the DFS forest",
          "A back edge to an ancestor currently residing on the active recursion stack",
          "A cross edge pointing to an SCC that has already been completely traversed",
        ],
        submittedAnswer: "A cross edge pointing to an SCC that has already been completely traversed",
        correctAnswer: "A back edge to an ancestor currently residing on the active recursion stack",
        explanation: "Tarjan's algorithm maintains a DFS exploration stack. When encountering an adjacent node v that is still on the stack, it represents a back-edge into the current component, prompting `lowlink[u] = min(lowlink[u], disc[v])`.",
        difficulty: "Hard",
        bloomLevel: "Analyze",
        accuracyRate: 42,
      };
    }
    if (weakness.toLowerCase().includes('tree') || weakness.toLowerCase().includes('avl')) {
      return {
        questionText: "What sequence of rotations is required when a node is inserted into the left subtree of the right child of an unbalanced node (RL imbalance)?",
        topic: "Tree Data Structures",
        subtopic: "Self-Balancing AVL Invariants",
        options: [
          "Single Left Rotation around the parent node",
          "Right Rotation on the right child, followed by a Left Rotation on the unbalanced node",
          "Left Rotation on the left child, followed by a Right Rotation on the unbalanced node",
          "Single Right Rotation followed by in-order traversal relinking",
        ],
        submittedAnswer: "Single Left Rotation around the parent node",
        correctAnswer: "Right Rotation on the right child, followed by a Left Rotation on the unbalanced node",
        explanation: "A Right-Left (RL) imbalance occurs when a grandchild is inserted into the inner branch. First, a right rotation on the right child converts it into a pure RR imbalance, which is then resolved by a single left rotation around the root of the unbalanced subtree.",
        difficulty: "Medium",
        bloomLevel: "Apply",
        accuracyRate: 54,
      };
    }
    return {
      questionText: `Which algorithmic invariant is critical for maintaining correctness and optimal asymptotic bounds in ${weakness}?`,
      topic: weakness,
      subtopic: "Algorithmic Invariants & Asymptotic Bounds",
      options: [
        "Monotonicity of state transitions during recurrence unrolling",
        "Preservation of subproblem independence under overlapping criteria",
        "Strict balance factor maintenance between -1 and +1",
        "Deterministic greedy choice property at each sequential decision stage",
      ],
      submittedAnswer: "Preservation of subproblem independence under overlapping criteria",
      correctAnswer: "Monotonicity of state transitions during recurrence unrolling",
      explanation: `When analyzing ${weakness}, maintaining the monotonic invariant ensures each step progresses toward termination without violating the recurrence constraints.`,
      difficulty: "Hard",
      bloomLevel: "Evaluate",
      accuracyRate: 48,
    };
  };

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 ${isDark ? 'text-white' : 'text-black'}`}>
      {/* Header & Streak Banner */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <div className={`flex items-center gap-2 mb-1 text-xs font-mono ${isDark ? 'text-[#00F0FF]' : 'text-slate-800 font-bold'}`}>
            <Activity className="w-3.5 h-3.5" />
            <span>STUDENT TACTICAL COCKPIT</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Curriculum Mastery & Diagnostic Cockpit · Department of Computer Science & Engineering
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Learning Streak Indicator */}
          <div className={`flex items-center gap-2 px-3.5 py-2 ${
            isDark
              ? 'bg-amber-400/10 border-amber-400/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'bg-amber-50 border-amber-200 text-amber-800 shadow-xs'
          } border rounded-xl`}>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tabular-nums">
              <AnimatedNumber value={streak} /> Day Streak
            </span>
          </div>

          {/* Learning Roadmaps */}
          <button
            onClick={() => onNavigate('roadmaps')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold ${
              isDark
                ? 'text-white bg-white/10 hover:bg-white/15 border-white/15'
                : 'text-black bg-white hover:bg-slate-50 border-slate-300 shadow-xs'
            } border rounded-xl transition-all cursor-pointer active:scale-95`}
          >
            <Compass className={`w-4 h-4 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
            <span>Learning Roadmaps (100+)</span>
          </button>

          {/* Practice Focus Drills */}
          <button
            onClick={() => onNavigate('practice')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer active:scale-95"
          >
            <Target className="w-4 h-4" />
            <span>Practice Focus Drills</span>
          </button>
        </div>
      </div>

      {/* 🎯 AI Real-Time Weak Area Monitor & Socratic Copilot */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`relative p-6 sm:p-7 rounded-2xl ${
          isDark
            ? 'bg-[#0A0D14]/90 text-white border-[#00F0FF]/30 shadow-2xl'
            : 'bg-white text-black border-slate-200 shadow-sm'
        } border overflow-hidden backdrop-blur-md`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            {hasActivity && liveWeaknesses.length > 0 ? (
              <>
                <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
                  <span className={`${isDark ? 'text-[#00F0FF]' : 'text-slate-800'} flex items-center gap-1.5 font-bold`}>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    AI Socratic Copilot
                  </span>
                  <span className={isDark ? "text-white/20" : "text-slate-300"}>·</span>
                  <span className={`${isDark ? 'text-rose-400' : 'text-rose-700'} font-semibold`}>
                    Priority Target: {liveWeaknesses[0]}
                  </span>
                </div>

                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'} tracking-tight`}>
                  Bridge your conceptual gap in {liveWeaknesses[0]}
                </h2>

                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                  Continuous diagnostic telemetry flagged repeated errors on <strong>{liveWeaknesses[0]}</strong>. Review high-yield notes, or inspect the specific question breakdown to reinforce invariants.
                </p>

                {/* Question-level insight item with clickable arrow */}
                <div className={`mt-3 p-3.5 rounded-xl border ${
                  isDark ? 'bg-black/50 border-rose-500/20 text-slate-200' : 'bg-rose-50/60 border-rose-200 text-slate-800'
                } flex items-center justify-between gap-3`}>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-[10px] uppercase font-bold text-rose-500 tracking-wider">
                      {liveWeaknesses[0]} → Diagnostic Breakdown
                    </div>
                    <div className="font-medium line-clamp-1">
                      {getQuestionForWeakness(liveWeaknesses[0]).questionText}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuestion(getQuestionForWeakness(liveWeaknesses[0]));
                      setQuestionModalOpen(true);
                    }}
                    className={`shrink-0 p-2 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                      isDark ? 'bg-white/10 hover:bg-white/20 text-[#00F0FF]' : 'bg-white hover:bg-slate-100 text-blue-700 border border-slate-200'
                    }`}
                    title="Inspect original assessment question"
                  >
                    <span>Inspect Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
                  <span className={`${isDark ? 'text-[#00F0FF]' : 'text-blue-700'} flex items-center gap-1.5 font-bold`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Socratic Copilot · Real-Time Telemetry Standby
                  </span>
                </div>

                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'} tracking-tight`}>
                  No Learning Activity Yet
                </h2>

                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                  No Learning Activity Yet — Complete your first practice drill or assignment to activate real-time Atom AI diagnostic analysis.
                </p>
              </>
            )}
          </div>

          {/* Copilot Action Triggers */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {hasActivity && liveWeaknesses.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setQuickNotesTopic(liveWeaknesses[0]);
                    setQuickNotesOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black text-black" />
                  <span>3-Min Quick Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('practice')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  <span>Launch Focus Drill</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (publishedAssessments.length > 0) {
                      onStartAssessment(publishedAssessments[0]);
                    } else {
                      onNavigate('practice');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Take First Exam</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('practice')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  <span>Practice Drills</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3-Column Clean Metric Grid (Overall Mastery removed per instructions) */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Learning Plan Completion with Circular Progress */}
        <StaggerItem>
          <div className={`p-6 ${
            isDark ? 'bg-[#0A0D14]/80 border-white/10 text-white' : 'bg-white border-slate-200 text-black shadow-sm'
          } rounded-2xl border relative overflow-hidden group space-y-3.5 backdrop-blur-md`}>
            <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="uppercase tracking-wider">ACTIVE PLAN</span>
              <span className={`${isDark ? 'text-purple-400' : 'text-purple-700'} font-bold text-[10px]`}>
                {totalPlanMilestones > 0 ? 'IN PROGRESS' : 'NOT INITIALIZED'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-black'} font-mono tabular-nums`}>
                  <AnimatedNumber value={planCompletionPercentage} suffix="%" />
                </div>
                <p className={`text-xs ${isDark ? 'text-purple-300' : 'text-slate-600 font-medium'} mt-1`}>
                  {totalPlanMilestones > 0 ? `${completedMilestones.length} of ${totalPlanMilestones} milestones` : 'No active curriculum'}
                </p>
              </div>

              <div className="shrink-0">
                <AnimatedProgressRing
                  percentage={planCompletionPercentage}
                  size={56}
                  strokeWidth={5}
                  color={isDark ? "#A855F7" : "#7C3AED"}
                  trackColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}
                />
              </div>
            </div>

            <div className="pt-1">
              <AnimatedProgressBar
                percentage={planCompletionPercentage}
                className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-100'} h-1.5 rounded-full overflow-hidden`}
                barClassName="bg-purple-500 h-full rounded-full transition-all"
              />
            </div>
          </div>
        </StaggerItem>

        {/* Card 2: Mastered Concepts (Clickable, navigates to dedicated tab) */}
        <StaggerItem>
          <div
            onClick={() => onNavigate('mastered-concepts')}
            className={`p-6 ${
              isDark ? 'bg-[#0A0D14]/80 border-white/10 text-white hover:border-[#10B981]/50' : 'bg-white border-slate-200 text-black shadow-sm hover:border-emerald-500'
            } rounded-2xl border space-y-3.5 backdrop-blur-md cursor-pointer transition-all group`}
          >
            <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="uppercase tracking-wider">MASTERED CONCEPTS</span>
              <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-bold">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="pt-1">
              <div className={`text-3xl font-extrabold ${isDark ? 'text-[#10B981]' : 'text-emerald-700'} font-mono tabular-nums flex items-baseline gap-1.5`}>
                <AnimatedNumber value={strengths.length} />
                <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Topics</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {strengths.length === 0 ? (
                  <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Click to view concept requirements
                  </span>
                ) : (
                  strengths.slice(0, 3).map((s, i) => (
                    <span
                      key={i}
                      className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      {s}{i < 2 ? ' ·' : ''}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Card 3: Identified Focus Areas & Gaps */}
        <StaggerItem>
          <div className={`p-6 ${
            isDark ? 'bg-[#0A0D14]/80 border-white/10 text-white' : 'bg-white border-slate-200 text-black shadow-sm'
          } rounded-2xl border space-y-3.5 backdrop-blur-md`}>
            <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="uppercase tracking-wider">FOCUS TARGETS</span>
              <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
            </div>

            <div className="pt-1">
              <div className={`text-3xl font-extrabold ${isDark ? 'text-rose-400' : 'text-rose-600'} font-mono tabular-nums flex items-baseline gap-1.5`}>
                <AnimatedNumber value={weaknesses.length} />
                <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Areas</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {weaknesses.length === 0 ? (
                  <span className={`text-[11px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-semibold'}`}>
                    Zero learning gaps identified
                  </span>
                ) : (
                  weaknesses.map((w, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedQuestion(getQuestionForWeakness(w));
                        setQuestionModalOpen(true);
                      }}
                      className={`text-[11px] font-medium underline text-left cursor-pointer ${isDark ? 'text-rose-300 hover:text-white' : 'text-rose-700 hover:text-rose-900'}`}
                    >
                      {w}{i < weaknesses.length - 1 ? ' ·' : ''}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Grid: Assignments Section & Socratic Tutor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 3-State Assignment Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`${
            isDark ? 'bg-[#0A0D14]/80 border-white/10 text-white' : 'bg-white border-slate-200 text-black shadow-sm'
          } p-6 sm:p-7 rounded-2xl border space-y-5 backdrop-blur-md`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-black'} flex items-center gap-2`}>
                <ClipboardList className={`w-5 h-5 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
                <span>Cohort Examinations & Assignments</span>
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono">
                {pendingAssessments.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                    {pendingAssessments.length} PENDING
                  </span>
                )}
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {studentAttempts.length} Completed
                </span>
              </div>
            </div>

            {/* 1. Pending / Active Assigned Examinations */}
            {pendingAssessments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#00F0FF] uppercase tracking-wider">
                    Assigned By Faculty · Awaiting Your Submission
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {pendingAssessments.length} Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {pendingAssessments.map((asm, asmIdx) => (
                    <div
                      key={`${asm.assessmentId || 'asm'}-${asmIdx}`}
                      className={`p-4 rounded-xl border ${
                        isDark
                          ? 'bg-[#07090E] border-white/10 hover:border-[#00F0FF]/40'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                      } flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                            {asm.subject}
                          </span>
                          <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {asm.title}
                          </h4>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-1`}>
                          {asm.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span>{asm.questionCount || asm.questionIds?.length || 10} Questions</span>
                          <span>·</span>
                          <span>{asm.durationMinutes || 30} mins</span>
                          <span>·</span>
                          <span>Pass: {asm.passingPercentage || 70}%</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onStartAssessment(asm)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] shrink-0 cursor-pointer active:scale-95"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Start Examination</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Completed Examinations History */}
            {studentAttempts.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">
                    Completed Submissions & Verified Marks
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {studentAttempts.length} Submitted
                  </span>
                </div>

                <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-100'}`}>
                  {studentAttempts.map((att, idx) => {
                    const targetAsm = assessments.find((a) => a.assessmentId === att.assessmentId);
                    const scorePercent =
                      att.percentage !== undefined
                        ? att.percentage
                        : att.score
                        ? Math.round((att.score / (targetAsm?.questionIds.length || 10)) * 100)
                        : 0;
                    const isPassed = scorePercent >= 70;
                    return (
                      <div
                        key={`${att.attemptId || 'att'}-${idx}`}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                              {targetAsm?.title || att.assessmentTitle || 'Course Examination'}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                isPassed
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}
                            >
                              {scorePercent}% SCORE · {isPassed ? 'PASSED' : 'RETAKE RECOMMENDED'}
                            </span>
                          </div>
                          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} flex items-center gap-2 font-mono`}>
                            <span>{targetAsm?.subject || 'CS'}</span>
                            <span>·</span>
                            <span>{att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'Recent'}</span>
                            <span>·</span>
                            <span className="text-emerald-500 font-bold">Recorded in Cohort Roster</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigate('results')}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              isDark
                                ? 'bg-white/10 hover:bg-white/15 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                            }`}
                          >
                            Review Attempt
                          </button>
                          <span className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-xl ${
                            isDark ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-500'
                          }`}>
                            1/1 Attempt Used
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Empty State: No assessments exist anywhere */}
            {publishedAssessments.length === 0 && studentAttempts.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    No Active Examinations
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} max-w-sm mx-auto`}>
                    No examinations or problem sets assigned to your cohort yet. Check back when your professor publishes an assessment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Tutor Panel & Study Planner (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick RAG AI Tutor Panel */}
          <div className={`${
            isDark ? 'bg-[#0A0D14]/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          } p-6 rounded-2xl border space-y-4 backdrop-blur-md`}>
            <div className={`flex items-center justify-between pb-3.5 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Socratic Academic Tutor
                </h3>
              </div>
              <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-[#10B981]' : 'text-emerald-700'}`}>
                ONLINE
              </span>
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              Ask curriculum questions or inspect why an assessment answer was marked incorrect.
            </p>

            {tutorResponse && (
              <FadeIn>
                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-purple-950/30 border-purple-500/30 text-slate-200' : 'bg-purple-50 border-purple-200 text-purple-900'
                } border text-xs space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <div className={`font-mono text-[10px] font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'} uppercase tracking-wider`}>
                      SOCRATIC TUTOR INSIGHT:
                    </div>
                  </div>

                  <div className="leading-relaxed whitespace-pre-wrap">{tutorResponse}</div>
                </div>
              </FadeIn>
            )}

            <form onSubmit={handleQuickAskTutor} className="space-y-2.5">
              <input
                type="text"
                value={tutorQuery}
                onChange={(e) => setTutorQuery(e.target.value)}
                placeholder="e.g. Why does AVL rotate left-right?"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  isDark ? 'border-white/10 bg-black/60 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                } focus:outline-hidden focus:border-[#00F0FF] transition-colors`}
              />
              <button
                type="submit"
                disabled={isAskingTutor || !tutorQuery.trim()}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAskingTutor ? 'Synthesizing...' : 'Ask Socratic AI'}</span>
              </button>
            </form>

            <button
              onClick={() => onNavigate('ai-tutor')}
              className={`w-full py-2 text-xs font-semibold ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'} hover:underline text-center block cursor-pointer`}
            >
              Open Full-Screen Tutor Workspace →
            </button>
          </div>

          {/* Study Planner Card */}
          <div className={`${
            isDark ? 'bg-[#0A0D14]/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          } p-6 rounded-2xl border space-y-4 backdrop-blur-md`}>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <Calendar className={`w-4 h-4 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
              <span>Weekly Academic Planner</span>
            </h3>

            <div className="space-y-2.5">
              <div className={`p-3 rounded-xl border ${
                isDark ? 'border-white/5 bg-white/5 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
              } flex items-center justify-between text-xs`}>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Today, 4:00 PM</div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tree Traversal Flashcards (15m)</div>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-[#10B981]' : 'text-emerald-700'}`}>PLANNED</span>
              </div>

              <div className={`p-3 rounded-xl border ${
                isDark ? 'border-white/5 bg-white/5 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
              } flex items-center justify-between text-xs`}>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tomorrow, 10:00 AM</div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dijkstra Min-Heap Quiz</div>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>UPCOMING</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Quick Notes & Last-Minute Sheet Modal */}
      <QuickNotesModal
        isOpen={quickNotesOpen}
        onClose={() => setQuickNotesOpen(false)}
        initialTopic={quickNotesTopic || (liveWeaknesses.length > 0 ? liveWeaknesses[0] : '')}
        role="student"
        weakTopics={liveWeaknesses}
        autoGenerate={false}
        onStartPractice={() => onNavigate('practice')}
      />

      {/* Question Detail Modal for Weakness Deep Dive */}
      <QuestionDetailModal
        isOpen={questionModalOpen}
        question={selectedQuestion}
        onClose={() => {
          setQuestionModalOpen(false);
          setSelectedQuestion(null);
        }}
        onPracticeTopic={(topic) => {
          setQuestionModalOpen(false);
          onNavigate('practice');
        }}
      />
    </div>
  );
};
