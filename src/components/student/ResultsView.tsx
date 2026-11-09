import React, { useState } from 'react';
import { AssessmentAttempt, LearningPlan } from '../../types';
import { aiService } from '../../services/aiService';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Target,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  Lightbulb,
  Activity,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useAIMonitor } from '../../context/AIMonitorContext';

interface ResultsViewProps {
  attempt: AssessmentAttempt | null;
  onNavigatePlan: (plan: LearningPlan) => void;
  onNavigatePractice: (topic?: string) => void;
  onRetake: () => void;
  onAskTutor?: (topic: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  attempt,
  onNavigatePlan,
  onNavigatePractice,
  onRetake,
  onAskTutor,
}) => {
  const { showToast } = useToast();
  const { trackAction, openRemedialModal } = useAIMonitor();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Gemini Mistake Explainer State
  const [explainingItem, setExplainingItem] = useState<{
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    topic: string;
    difficulty: string;
  } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [geminiExplanation, setGeminiExplanation] = useState<{
    misconception: string;
    corePrinciple: string;
    memoryTip: string;
    detailedExplanation: string;
  } | null>(null);

  const handleAskGeminiExplain = async (item: {
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    topic: string;
    difficulty: string;
  }) => {
    setExplainingItem(item);
    setGeminiExplanation(null);
    setIsExplaining(true);
    try {
      showToast('Gemini is diagnosing conceptual misconception...', 'info');
      const res = await aiService.explainMistake(item);
      setGeminiExplanation(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to explain mistake with Gemini', 'error');
    } finally {
      setIsExplaining(false);
    }
  };

  if (!attempt) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-xs font-mono text-slate-400">
        No assessment results available. Complete an examination to view your diagnostic report.
      </div>
    );
  }

  const score = attempt.score ?? 0;
  const percentage = attempt.percentage ?? 0;
  const passed = attempt.passed ?? false;
  const total = attempt.questionIds.length;
  const correctCount = score;
  const incorrectCount = total - score;

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      showToast('AI is synthesizing knowledge gap analysis & learning roadmap...', 'info');

      const incorrectItems = (attempt.reviewItems || [])
        .filter((r) => !r.isCorrect)
        .map((r) => ({
          questionText: r.questionText,
          studentAnswer: r.studentAnswer,
          correctAnswer: r.correctAnswer,
          topic: r.topic,
        }));

      const gapAnalysis = await aiService.analyzeGaps({
        studentName: attempt.studentName,
        assessmentTitle: attempt.assessmentTitle,
        topicBreakdown: attempt.topicBreakdown || {},
        difficultyBreakdown: attempt.difficultyBreakdown || {},
        incorrectQuestions: incorrectItems,
      });

      const newPlan: LearningPlan = {
        planId: `plan-${Date.now()}`,
        studentId: attempt.studentId,
        generatedAt: new Date().toISOString(),
        weakConcepts: gapAnalysis.weakConcepts,
        priorityTopics: gapAnalysis.priorityTopics,
        recommendedSequence: gapAnalysis.recommendedSequence,
        practiceRecommendations: gapAnalysis.practiceRecommendations,
        explanation: gapAnalysis.explanation,
        status: 'active',
      };

      showToast('Personalized learning roadmap generated!', 'success');
      onNavigatePlan(newPlan);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate plan', 'error');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7 text-white">
      {/* Tactical HUD Header Banner */}
      <div className="bg-[#0A0D14]/85 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF]">
            <Activity className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">DIAGNOSTIC TELEMETRY REPORT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {attempt.assessmentTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Evaluated on {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'Recently'} ·
            Server-side verifiable scoring
          </p>
        </div>

        {/* Score Telemetry */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span
              className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums block ${
                passed ? 'text-[#10B981]' : 'text-amber-400'
              }`}
            >
              {percentage}%
            </span>
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                passed ? 'text-[#10B981]' : 'text-amber-400'
              }`}
            >
              {passed ? 'Standard Verified' : 'Remediation Required'}
            </span>
          </div>

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
              passed
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-amber-400/15 text-amber-400 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
            }`}
          >
            {passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
        </div>
      </div>

      {/* Socratic Action Banner: Generate AI Plan */}
      <div className="p-6 sm:p-7 bg-[#0A0D14]/90 rounded-2xl text-white shadow-2xl border border-[#00F0FF]/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00F0FF] animate-pulse" />
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              Next Step: AI Knowledge Gap Remediation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Synthesize diagnostic errors into an actionable adaptive milestone sequence and high-yield drills.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGeneratePlan}
          disabled={isGeneratingPlan}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_25px_rgba(0,240,255,0.3)] shrink-0 disabled:opacity-50 cursor-pointer active:scale-95 z-10"
        >
          {isGeneratingPlan ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Analyzing Knowledge Gaps...</span>
            </>
          ) : (
            <>
              <span>Generate Remediation Plan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* KPI Breakdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Correct Answers</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-mono tabular-nums pt-1">
            {correctCount}{' '}
            <span className="text-sm font-normal text-slate-400">/ {total}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block pt-1">Verified benchmarks</span>
        </div>

        <div className="p-5 sm:p-6 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Incorrect / Skipped</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tabular-nums pt-1">
            {incorrectCount}
          </div>
          <span className="text-[11px] text-slate-400 font-mono block pt-1">Target for drill loop</span>
        </div>

        <div className="p-5 sm:p-6 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Integrity Sentinel</span>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums flex items-center gap-2 pt-1">
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            <span>
              {attempt.proctoringViolationsCount === 0 ? 'Verified Clean' : 'Interrupted'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block pt-1">
            {attempt.proctoringViolationsCount} environmental alert(s)
          </span>
        </div>

        <div className="p-5 sm:p-6 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg flex flex-col justify-between space-y-3">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Reassessment</span>
          <button
            type="button"
            onClick={onRetake}
            className="w-full py-2.5 px-4 text-xs font-mono font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Retake Exam</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono text-center">1 of 2 attempts used</span>
        </div>
      </div>

      {/* Topic & Difficulty Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Performance */}
        <div className="bg-[#0A0D14]/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Topic Mastery Spectrum
            </h3>
            <span className="text-[10px] font-mono text-slate-400">BENCHMARK 80%</span>
          </div>

          <div className="space-y-4">
            {attempt.topicBreakdown &&
              Object.entries(attempt.topicBreakdown).map(([t, pct]) => (
                <div key={t} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{t}</span>
                    <span className={`tabular-nums font-bold ${pct >= 70 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 70 ? 'bg-[#10B981]' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Difficulty Performance */}
        <div className="bg-[#0A0D14]/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Cognitive Complexity Curve
            </h3>
            <span className="text-[10px] font-mono text-[#00F0FF]">BLOOM DISTRIBUTION</span>
          </div>

          <div className="space-y-4">
            {attempt.difficultyBreakdown &&
              Object.entries(attempt.difficultyBreakdown).map(([d, pct]) => (
                <div key={d} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium capitalize">{d} Questions</span>
                    <span className="tabular-nums font-bold text-[#00F0FF]">{pct}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="bg-[#00F0FF] h-full rounded-full transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Question Review List */}
      <div className="bg-[#0A0D14]/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Item Diagnostic Telemetry
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {(attempt.reviewItems || []).length} ITEMS VERIFIED
          </span>
        </div>

        <div className="space-y-3">
          {(attempt.reviewItems || []).map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  item.isCorrect
                    ? 'bg-white/5 border-white/10'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}
              >
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                >
                  <div className="flex items-start gap-2.5">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {idx + 1}. {item.questionText}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {item.topic} · <span className="capitalize">{item.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold ${
                        item.isCorrect ? 'text-[#10B981]' : 'text-rose-400'
                      }`}
                    >
                      {item.isCorrect ? '+1.0' : '0.0'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                          Your Answer
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            item.isCorrect ? 'text-[#10B981]' : 'text-rose-400'
                          }`}
                        >
                          {item.studentAnswer}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                          Correct Ground-Truth
                        </span>
                        <span className="font-mono font-semibold text-[#10B981]">
                          {item.correctAnswer}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-slate-200 text-xs leading-relaxed">
                      <span className="font-bold text-[#00F0FF] font-mono">Pedagogical Invariant: </span>
                      {item.explanation}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAskGeminiExplain(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 rounded-lg transition-colors border border-[#00F0FF]/30 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                          <span>Diagnose Misconception with Gemini AI</span>
                        </button>

                        {!item.isCorrect && (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              showToast('Synthesizing instant remedial drill for this misconception...', 'info');
                              const intervention = await trackAction({
                                actionType: 'quiz_answer',
                                topic: item.topic,
                                isCorrect: false,
                                studentAnswer: item.studentAnswer,
                                correctAnswer: item.correctAnswer,
                                questionText: item.questionText,
                                difficulty: (item.difficulty as any) || 'medium',
                              });
                              if (intervention) {
                                openRemedialModal(intervention);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 rounded-lg transition-colors border border-amber-500/30 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>1-Min Remedial Drill</span>
                          </button>
                        )}

                        {onAskTutor && (
                          <button
                            type="button"
                            onClick={() => onAskTutor(item.topic)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 rounded-lg transition-colors border border-purple-500/30 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>Ask Socratic Tutor</span>
                          </button>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        Atom AI Active Monitor
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gemini Deep Dive Mistake Modal */}
      {explainingItem && (
        <Modal
          isOpen={!!explainingItem}
          onClose={() => setExplainingItem(null)}
          title="Gemini AI Conceptual Diagnosis"
          subtitle={`${explainingItem.topic} · ${explainingItem.difficulty} Question Analysis`}
          maxWidth="max-w-2xl"
        >
          {isExplaining ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF] mx-auto" />
              <div className="text-sm font-semibold text-white">
                Gemini 3.8 Flash is isolating cognitive misconceptions...
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Deconstructing "{explainingItem.studentAnswer}" against theorem "{explainingItem.correctAnswer}".
              </p>
            </div>
          ) : geminiExplanation ? (
            <div className="space-y-4 text-white">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <span className="font-mono font-bold text-slate-300">Question Item:</span>
                <p className="text-slate-200">{explainingItem.questionText}</p>
              </div>

              <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/30 text-xs text-slate-200 space-y-1">
                <div className="font-mono font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Diagnosed Conceptual Error</span>
                </div>
                <p className="leading-relaxed">{geminiExplanation.misconception}</p>
              </div>

              <div className="p-4 bg-[#10B981]/10 rounded-xl border border-[#10B981]/30 text-xs text-slate-200 space-y-1">
                <div className="font-mono font-bold flex items-center gap-1.5 text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Fundamental Academic Invariant</span>
                </div>
                <p className="leading-relaxed">{geminiExplanation.corePrinciple}</p>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 text-xs text-slate-200 space-y-1">
                <div className="font-mono font-bold flex items-center gap-1.5 text-purple-300">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  <span>Gemini Memory Rule of Thumb</span>
                </div>
                <p className="font-medium italic leading-relaxed">{geminiExplanation.memoryTip}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 leading-relaxed space-y-1.5">
                <div className="font-mono font-bold text-white">In-Depth Pedagogical Breakdown:</div>
                <p className="whitespace-pre-wrap">{geminiExplanation.detailedExplanation}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-3">
                <span className="text-[10px] font-mono text-slate-400">
                  Engine: gemini-3.8-flash (via @google/genai)
                </span>
                <div className="flex items-center gap-2">
                  {onAskTutor && explainingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        onAskTutor(explainingItem.topic);
                        setExplainingItem(null);
                      }}
                      className="px-3.5 py-2 text-xs font-mono font-bold text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Deep Socratic Walkthrough →</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setExplainingItem(null)}
                    className="px-4 py-2 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-colors cursor-pointer"
                  >
                    Understood
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-mono text-slate-400">No explanation available.</div>
          )}
        </Modal>
      )}
    </div>
  );
};
