import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  FileText,
  MessageSquare,
  BarChart3,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  ChevronRight,
  TrendingUp,
  Brain,
  Cpu,
  GraduationCap,
  Mail,
  Phone,
  Building,
  Target,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { StudentCohortRecord, StudentAttemptRecord } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { QuestionDetailModal, QuestionDetailData } from '../common/QuestionDetailModal';

interface StudentProgressionDrawerProps {
  isOpen: boolean;
  student: StudentCohortRecord | null;
  onClose: () => void;
  onLaunchRemedialDrill?: (studentName: string, topic: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'teacher' | 'assistant';
  text: string;
  timestamp: string;
  guarded?: boolean;
}

export const StudentProgressionDrawer: React.FC<StudentProgressionDrawerProps> = ({
  isOpen,
  student,
  onClose,
  onLaunchRemedialDrill,
}) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'marks' | 'ai-summary' | 'inquiry'>('marks');

  // Question detail modal state for weakness deep dive
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetailData | null>(null);

  const getQuestionForWeakness = (weakness: string): QuestionDetailData => ({
    questionText: `Which algorithmic invariant is critical for maintaining correctness and optimal asymptotic bounds in ${weakness}?`,
    topic: weakness,
    subtopic: 'Algorithmic Invariants & Asymptotic Bounds',
    options: [
      'Preservation of state reachability under edge relaxation',
      'Monotonicity of state transitions during recurrence unrolling',
      'Strict balance factor bounds between -1 and +1',
      'Greedy choice property at every local iteration step',
    ],
    submittedAnswer: 'Preservation of state reachability under edge relaxation',
    correctAnswer: 'Monotonicity of state transitions during recurrence unrolling',
    explanation: `When analyzing ${weakness}, maintaining the monotonic invariant ensures each step progresses toward termination without violating recurrence constraints.`,
    difficulty: 'Hard',
    bloomLevel: 'Analyze',
    accuracyRate: 46,
  });

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

  // Follow-Up Q&A Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isSendingQuery, setIsSendingQuery] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset or load initial data when student changes
  useEffect(() => {
    if (student) {
      setAiSummary('');
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: `Hello Professor. I am your **Atom AI Diagnostic Assistant** evaluating **${student.name}**.\n\nI have complete access to ${student.name}'s proctored assessment scores, Bloom's cognitive taxonomy distribution, response latency intervals, and Atom AI struggle signals.\n\nAsk me anything regarding ${student.name}'s academic progress, struggle topics, or examination marks.`,
          timestamp: 'Just now',
        },
      ]);
      setActiveTab('marks');
    }
  }, [student?.id]);

  useEffect(() => {
    if (activeTab === 'inquiry') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isOpen || !student) return null;

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/ai/teacher-student-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          action: 'generate_summary',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate diagnostic summary');
      const data = await res.json();
      setAiSummary(data.text || 'Unable to generate summary.');
      showToast('Atom AI Student Diagnostic Summary synthesized!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error generating summary', 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isSendingQuery) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'teacher',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsSendingQuery(true);

    try {
      const chatHistory = messages.slice(-6).map((m) => ({
        role: m.role === 'teacher' ? 'user' : 'assistant',
        text: m.text,
      }));

      const res = await fetch('/api/ai/teacher-student-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          action: 'chat',
          query: textToSend,
          history: chatHistory,
        }),
      });

      if (!res.ok) throw new Error('Inquiry service unavailable');
      const data = await res.json();

      const replyText = data.text || 'I cannot answer this here.';
      const isGuarded = replyText.includes('I cannot answer this here.');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guarded: isGuarded,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          text: 'I cannot answer this here.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          guarded: true,
        },
      ]);
    } finally {
      setIsSendingQuery(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className={`w-screen max-w-3xl flex flex-col ${
            isDark ? 'bg-[#0B0F17] text-white border-l border-white/10' : 'bg-white text-slate-900 border-l border-slate-200 shadow-2xl'
          } shadow-2xl overflow-hidden`}
        >
          {/* Drawer Header */}
          <div className={`p-6 border-b ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'} shrink-0`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* Student Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[#00F0FF]/40 border border-white/20 bg-[#07090E] flex items-center justify-center shrink-0 shadow-lg">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold font-serif text-white">
                        {student.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#00FF88] ring-2 ring-[#0B0F17] absolute -bottom-1 -right-1" />
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold font-serif tracking-tight truncate">
                      {student.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                      {student.studentId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {student.overallPerformance}% Mastery
                    </span>
                  </div>

                  <p className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'} truncate flex items-center gap-1.5`}>
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.college}</span>
                  </p>

                  <div className={`flex items-center gap-2 text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'} flex-wrap pt-0.5`}>
                    <span>{student.stream}</span>
                    <span className="opacity-40">·</span>
                    <span className="text-[#00FF88] font-bold">{student.year}</span>
                    <span className="opacity-40">·</span>
                    <span>{student.email}</span>
                    {student.phone && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{student.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                } transition-colors cursor-pointer shrink-0`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-6 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab('marks')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'marks'
                    ? 'bg-[#00F0FF] text-black shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Attempted Marks ({student.attemptHistory?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ai-summary');
                  if (!aiSummary) handleGenerateSummary();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'ai-summary'
                    ? 'bg-[#00FF88] text-black shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atom AI Summary</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inquiry')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'inquiry'
                    ? 'bg-purple-500 text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Teacher AI Follow-Up</span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: ATTEMPTED ASSIGNMENTS & MARKS */}
            {activeTab === 'marks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#00F0FF] font-bold">
                      VERIFIED EXAMINATION ATTESTATIONS & DRILL MARKS
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {student.attemptHistory?.length || 0} Submissions Logged
                  </span>
                </div>

                {student.attemptHistory && student.attemptHistory.length > 0 ? (
                  <div className="space-y-3">
                    {student.attemptHistory.map((attempt, idx) => (
                      <div
                        key={`${attempt.id}-${idx}`}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDark
                            ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 max-w-lg">
                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase text-[#00F0FF]">
                              <span>{attempt.id}</span>
                              <span className="opacity-40">·</span>
                              <span>{attempt.course}</span>
                              <span className="opacity-40">·</span>
                              <span className="text-slate-400">{attempt.date}</span>
                            </div>
                            <h4 className="text-sm font-bold font-sans tracking-tight">
                              {attempt.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-0.5 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {attempt.duration}
                              </span>
                              <span className="opacity-40">·</span>
                              <span className="text-emerald-400">{attempt.proctorRating}</span>
                              <span className="opacity-40">·</span>
                              <span className="text-slate-300">{attempt.bloomsProfile}</span>
                            </div>
                          </div>

                          {/* Score & Marks Display */}
                          <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                            <div className="text-right">
                              <div className="text-2xl font-bold font-mono tabular-nums leading-none">
                                {attempt.score}{' '}
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  / {attempt.total}
                                </span>
                              </div>
                              <span
                                className={`text-[11px] font-mono font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                                  attempt.percentage >= 80
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : attempt.percentage >= 60
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {attempt.percentage}% · {attempt.passed ? 'PASSED' : 'REMEDIATION'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Telemetry Misconceptions Analysis */}
                        {attempt.mistakesSummary && (
                          <div className={`mt-3 pt-2.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'} text-xs font-mono ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          } flex items-start gap-2`}>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-amber-400">Atom AI Diagnostic Note:</strong> {attempt.mistakesSummary}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-10 text-center rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'} space-y-3`}>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                      <X className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold font-mono text-rose-500">No Assignments Completed</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        No completed proctored assessments or practice submissions recorded yet for {student.name}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ATOM AI DIAGNOSTIC SUMMARY */}
            {activeTab === 'ai-summary' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#00FF88] font-bold">
                      AUTONOMOUS ATOM AI TELEMETRY SYNTHESIS
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#00FF88] text-black shadow-xs hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingSummary ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isGeneratingSummary ? 'Analyzing...' : 'Regenerate Summary'}</span>
                  </button>
                </div>

                {/* Telemetry Snapshot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'} space-y-1`}>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Mean Latency</span>
                    <div className="text-xl font-bold font-mono text-cyan-400">
                      {student.atomAiTelemetry?.avgLatencySeconds || 42}s
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Per cognitive problem</span>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'} space-y-1`}>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Atom Interventions</span>
                    <div className="text-xl font-bold font-mono text-[#00FF88]">
                      {student.atomAiTelemetry?.totalEvents || 8} Events
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Real-time coaching aids</span>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'} space-y-1`}>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Mastery Velocity</span>
                    <div className="text-xl font-bold font-mono text-amber-400">
                      {student.atomAiTelemetry?.masteryVelocity || 'Upper Quartile'}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">CS201 Cohort Pace</span>
                  </div>
                </div>

                {/* AI Summary Content Card */}
                {(student.completedAssessments === 0 || !student.attemptHistory || student.attemptHistory.length === 0) ? (
                  <div className={`p-8 text-center rounded-2xl border ${isDark ? 'border-amber-400/20 bg-amber-400/5' : 'border-amber-200 bg-amber-50'} space-y-3`}>
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold font-mono text-amber-400">Insufficient Assessment Data</h4>
                      <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'} max-w-md mx-auto leading-relaxed`}>
                        Insufficient Assessment Data: This student has not yet completed any proctored assessments or practice drills. Diagnostic telemetry will initialize once the scholar completes their first assignment.
                      </p>
                    </div>
                  </div>
                ) : isGeneratingSummary ? (
                  <div className={`p-12 text-center rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'} space-y-3`}>
                    <Loader2 className="w-8 h-8 text-[#00FF88] animate-spin mx-auto" />
                    <h3 className="text-sm font-bold font-mono">Synthesizing Atom AI Telemetry...</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                      Evaluating Bloom's distribution curves, proctored attempt scores, and struggle invariants.
                    </p>
                  </div>
                ) : aiSummary ? (
                  <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0E131F] border-[#00FF88]/20' : 'bg-emerald-50/50 border-emerald-200'} space-y-4`}>
                    <div className="max-w-none text-xs font-sans leading-relaxed">
                      <MarkdownRenderer content={aiSummary} />
                    </div>

                    {/* Question-level inspection for identified weaknesses */}
                    {student.weaknesses && student.weaknesses.length > 0 && (
                      <div className={`mt-4 pt-3 border-t ${isDark ? 'border-white/10' : 'border-emerald-200'} space-y-2`}>
                        <div className="text-[10px] font-mono uppercase font-bold text-rose-400">
                          Question-Level Diagnostic Inspection:
                        </div>
                        {student.weaknesses.slice(0, 2).map((w, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'} flex items-center justify-between gap-3 text-xs`}
                          >
                            <div>
                              <span className="font-semibold text-rose-400">{w}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                {w} → Subtopic Invariant Drill-Down
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedQuestion(getQuestionForWeakness(w));
                                setQuestionModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <span>Inspect Question</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-emerald-200'} flex items-center justify-between`}>
                      <span className="text-[10px] font-mono text-slate-400">
                        Generated by Atom AI Diagnostic Engine (gemini-3.8-flash)
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('inquiry')}
                        className="text-xs font-mono font-bold text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ask follow-up questions about this student</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-10 text-center rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'} space-y-4`}>
                    <Sparkles className="w-10 h-10 text-[#00FF88] mx-auto opacity-80" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold font-mono">Generate Diagnostic Summary</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Synthesize an automated diagnostic report detailing {student.name}'s Bloom's cognitive distribution, latency spikes, and concrete teacher recommendations.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#00FF88] text-black shadow-lg hover:scale-102 transition-all cursor-pointer"
                    >
                      Generate Atom AI Summary Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TEACHER FOLLOW-UP INQUIRY CHAT */}
            {activeTab === 'inquiry' && (
              <div className="flex flex-col h-[520px] rounded-2xl border border-white/10 overflow-hidden">
                {/* Chat Top Banner with Strict Guardrail Notification */}
                <div className={`p-3 border-b ${isDark ? 'border-white/10 bg-purple-950/20 text-purple-300' : 'border-purple-200 bg-purple-50 text-purple-900'} text-[11px] font-mono flex items-center justify-between gap-2`}>
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">
                      <strong>Diagnostic Guardrail Active:</strong> Only answers queries regarding {student.name}'s academic progress.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 shrink-0">
                    STRICT ABAC
                  </span>
                </div>

                {/* Message Stream */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-[#07090E]' : 'bg-slate-50'}`}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.role === 'teacher' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed ${
                          m.role === 'teacher'
                            ? 'bg-purple-600 text-white rounded-br-xs'
                            : m.guarded
                            ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono rounded-bl-xs'
                            : isDark
                            ? 'bg-white/10 border border-white/10 text-white rounded-bl-xs'
                            : 'bg-white border border-slate-200 text-slate-900 shadow-xs rounded-bl-xs'
                        }`}
                      >
                        <MarkdownRenderer content={m.text} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                        {m.role === 'teacher' ? 'You (Teacher)' : 'Atom AI Diagnostic Copilot'} · {m.timestamp}
                      </span>
                    </div>
                  ))}

                  {isSendingQuery && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-400 max-w-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      <span>Atom AI evaluating student dossier...</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Prompt Suggestions */}
                <div className={`p-2.5 border-t ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'} flex items-center gap-1.5 overflow-x-auto`}>
                  <button
                    type="button"
                    onClick={() => handleSendQuery(`How is ${student.name} doing in Dynamic Programming and Graph algorithms?`)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    } whitespace-nowrap transition-colors cursor-pointer`}
                  >
                    How is he doing in Graphs & DP?
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendQuery(`What are ${student.name}'s weakest topics based on recent attempts?`)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    } whitespace-nowrap transition-colors cursor-pointer`}
                  >
                    What are the weakest topics?
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendQuery(`Can you tell me about the capital of France?`)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg ${
                      isDark ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    } whitespace-nowrap transition-colors cursor-pointer`}
                    title="Test guardrail refusal: 'I cannot answer this here.'"
                  >
                    Test Guardrail (Off-topic query)
                  </button>
                </div>

                {/* Input Area */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuery();
                  }}
                  className={`p-3 border-t ${isDark ? 'border-white/10 bg-[#0B0F17]' : 'border-slate-200 bg-white'} flex items-center gap-2`}
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={`Ask about ${student.name}'s progress, marks, or weaknesses...`}
                    className={`flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-purple-500 transition-colors`}
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isSendingQuery}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40 cursor-pointer shadow-sm active:scale-95"
                    title="Send inquiry"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Deep-Dive Question Detail Modal */}
      <QuestionDetailModal
        isOpen={questionModalOpen}
        question={selectedQuestion}
        onClose={() => {
          setQuestionModalOpen(false);
          setSelectedQuestion(null);
        }}
        onPracticeTopic={(topic) => {
          setQuestionModalOpen(false);
          if (onLaunchRemedialDrill && student) {
            onLaunchRemedialDrill(student.name, topic);
          }
        }}
      />
    </div>
  );
};
