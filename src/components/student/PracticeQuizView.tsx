import React, { useState, useEffect } from 'react';
import { Question, StudentProfile, QuestionDifficulty } from '../../types';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { questionSelectionService } from '../../services/questionSelectionService';
import { learningProfileService } from '../../services/learningProfileService';
import { adaptiveDifficultyService } from '../../services/adaptiveDifficultyService';
import { SEED_CURRICULUM_QUESTIONS } from '../../services/academicDataSync';
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  TrendingUp,
  Award,
  Zap,
  Activity,
  Flame,
  Loader2,
  ShieldCheck,
  BrainCircuit,
  BarChart2,
} from 'lucide-react';
import {
  DocumentTransformationAnimation,
  AnimatedNumber,
  AnimatedProgressRing,
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from '../animation/AnimationComponents';
import { QuickNotesModal } from '../common/QuickNotesModal';
import { useAIMonitor } from '../../context/AIMonitorContext';
import { InlineAIIntervention } from '../common/InlineAIIntervention';
import { AIIntervention } from '../../types/aiMonitor';

export interface PracticeReviewItem {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  topic: string;
  difficulty: string;
  explanation: string;
  options?: string[];
}

interface PracticeQuizViewProps {
  initialTopic?: string;
  initialDifficulty?: QuestionDifficulty;
  initialCount?: number;
  initialBrief?: string;
  allQuestions?: Question[];
  onCompletedPractice: (
    topic: string,
    score: number,
    total: number,
    reviewItems?: PracticeReviewItem[],
    answers?: Record<string, string>
  ) => void;
}

export const PracticeQuizView: React.FC<PracticeQuizViewProps> = ({
  initialTopic,
  initialDifficulty,
  initialCount,
  initialBrief,
  allQuestions = [],
  onCompletedPractice,
}) => {
  const { studentProfile, updateStudentProfile, userProfile } = useAuth();
  const { showToast } = useToast();

  const [topic, setTopic] = useState(initialTopic || 'Dynamic Arrays & Strings');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(initialDifficulty || 'medium');
  const [count, setCount] = useState(initialCount || 3);
  const [drillBrief, setDrillBrief] = useState(initialBrief || '');
  const [studentGoalPrompt, setStudentGoalPrompt] = useState('');
  const [isFormulatingBrief, setIsFormulatingBrief] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickNotesOpen, setQuickNotesOpen] = useState(false);

  // Active student learning profile from learningProfileService
  const studentId = userProfile?.userId || 'student-01';
  const [learningProfile, setLearningProfile] = useState(() =>
    learningProfileService.getProfileSync(studentId)
  );

  // Active practice questions
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentIntervention, setCurrentIntervention] = useState<AIIntervention | null>(null);
  const [reviewRecords, setReviewRecords] = useState<PracticeReviewItem[]>([]);
  const [recordedAnswers, setRecordedAnswers] = useState<Record<string, string>>({});
  const [selectionAudit, setSelectionAudit] = useState<{
    adaptiveDifficulty: string;
    topicAccuracy: number;
    explanation: string;
    approvedCount: number;
  } | null>(null);

  const { trackAction, openRemedialModal } = useAIMonitor();

  const handleFormulateAIBrief = async () => {
    setIsFormulatingBrief(true);
    try {
      showToast('AI is formulating your personalized pedagogical drill blueprint...', 'info');
      const result = await aiService.formulateDrillBrief({
        topic,
        studentPrompt: studentGoalPrompt || topic,
        difficulty,
        subject: 'Computer Science & Academic Foundations',
      });

      if (result.topic) setTopic(result.topic);
      if (result.drillBrief) setDrillBrief(result.drillBrief);
      if (result.recommendedDifficulty) setDifficulty(result.recommendedDifficulty);
      if (result.recommendedCount) setCount(result.recommendedCount);

      showToast('AI Blueprint ready! Click Begin Targeted Practice to start.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not formulate AI blueprint', 'error');
    } finally {
      setIsFormulatingBrief(false);
    }
  };

  const handleStartPractice = async (
    overrideTopic?: string,
    overrideDiff?: QuestionDifficulty,
    overrideCount?: number
  ) => {
    const targetTopic = overrideTopic || topic;
    const targetCount = overrideCount || count;

    setIsGenerating(true);
    setCompleted(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setHasCheckedAnswer(false);
    setReviewRecords([]);
    setRecordedAnswers({});

    try {
      showToast(`Evaluating learning profile for ${targetTopic}...`, 'info');

      // Refresh student learning profile
      const currentProfile = learningProfileService.getProfileSync(studentId);
      setLearningProfile(currentProfile);

      // Controlled question bank pool: must only use APPROVED questions
      const pool = allQuestions.length > 0 ? allQuestions : SEED_CURRICULUM_QUESTIONS;

      // Select approved questions using Controlled Selection Service
      const selection = questionSelectionService.selectQuestionsForPractice({
        topic: targetTopic,
        count: targetCount,
        allQuestions: pool,
        studentProfile: currentProfile,
        manualDifficulty: overrideDiff,
      });

      if (!selection.success || selection.selectedQuestions.length === 0) {
        throw new Error(selection.warning || 'No approved questions available for this topic');
      }

      setPracticeQuestions(selection.selectedQuestions);
      setDifficulty(selection.adaptiveDifficulty as QuestionDifficulty);
      setSelectionAudit({
        adaptiveDifficulty: selection.adaptiveDifficulty,
        topicAccuracy: selection.accuracy,
        explanation: selection.reasoning,
        approvedCount: selection.selectedQuestions.length,
      });

      showToast(
        `Selected ${selection.selectedQuestions.length} approved questions (${selection.adaptiveDifficulty.toUpperCase()} based on ${selection.accuracy}% mastery)!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to select practice questions from question bank', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      if (initialDifficulty) setDifficulty(initialDifficulty);
      if (initialCount) setCount(initialCount);
      if (initialBrief) setDrillBrief(initialBrief);
      handleStartPractice(
        initialTopic,
        initialDifficulty || difficulty,
        initialCount || count
      );
    }
  }, [initialTopic, initialDifficulty, initialCount, initialBrief]);

  const handleCheckAnswer = async () => {
    if (!selectedAnswer) return;
    const current = practiceQuestions[currentIndex];
    const isCorrect =
      selectedAnswer.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCurrentIntervention(null);
    }
    setHasCheckedAnswer(true);

    const qId = current.questionId || `q-drill-${currentIndex + 1}`;
    const reviewItem: PracticeReviewItem = {
      questionId: qId,
      questionText: current.questionText,
      studentAnswer: selectedAnswer,
      correctAnswer: current.correctAnswer,
      isCorrect,
      topic: current.topic || topic,
      difficulty: (current.difficulty as string) || difficulty,
      explanation: current.explanation || '',
      options: current.options,
    };
    setReviewRecords((prev) => [...prev.filter((r) => r.questionId !== qId), reviewItem]);
    setRecordedAnswers((prev) => ({ ...prev, [qId]: selectedAnswer }));

    // AI Monitoring System: evaluate student step and trigger remedial intervention if needed
    try {
      const intervention = await trackAction({
        actionType: 'quiz_answer',
        topic: current.topic || topic,
        subject: current.subject || 'Computer Science',
        isCorrect,
        studentAnswer: selectedAnswer,
        correctAnswer: current.correctAnswer,
        questionText: current.questionText,
        difficulty: (current.difficulty as any) || difficulty,
      });

      if (!isCorrect && intervention) {
        setCurrentIntervention(intervention);
      }
    } catch (e) {
      console.warn('AI monitor error recording answer:', e);
    }
  };

  const isCurrentCorrect = () => {
    if (!selectedAnswer) return false;
    const current = practiceQuestions[currentIndex];
    return (
      selectedAnswer.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase()
    );
  };

  const handleNextQuestion = () => {
    setCurrentIntervention(null);
    if (currentIndex + 1 < practiceQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasCheckedAnswer(false);
    } else {
      // Completed practice!
      setCompleted(true);
      const finalScore = score + (isCurrentCorrect() ? 1 : 0);
      onCompletedPractice(topic, finalScore, practiceQuestions.length, reviewRecords, recordedAnswers);

      // Record in persistent learningProfileService
      try {
        const resultsToRecord = reviewRecords.map((r, i) => ({
          questionId: r.questionId || `q-drill-${i + 1}`,
          topic: r.topic,
          difficulty: (r.difficulty as QuestionDifficulty) || difficulty,
          isCorrect: r.isCorrect,
        }));
        if (resultsToRecord.length === 0 && currentQ) {
          resultsToRecord.push({
            questionId: currentQ.questionId || 'q-drill-1',
            topic: currentQ.topic || topic,
            difficulty: (currentQ.difficulty as QuestionDifficulty) || difficulty,
            isCorrect: isCurrentCorrect(),
          });
        }
        learningProfileService.recordAttemptResults(studentId, resultsToRecord);
        const refreshed = learningProfileService.getProfileSync(studentId);
        setLearningProfile(refreshed);
      } catch (e) {
        console.warn('Could not record learning profile telemetry:', e);
      }

      // Adaptive Profile Update based on live performance
      if (studentProfile) {
        const passPercent = (finalScore / practiceQuestions.length) * 100;
        let updatedWeak = [...studentProfile.weaknesses];
        let updatedStr = [...studentProfile.strengths];

        if (passPercent >= 75) {
          updatedWeak = updatedWeak.filter((w) => w.toLowerCase() !== topic.toLowerCase());
          if (!updatedStr.some((s) => s.toLowerCase() === topic.toLowerCase())) updatedStr.push(topic);
        } else {
          if (!updatedWeak.some((w) => w.toLowerCase() === topic.toLowerCase())) updatedWeak.push(topic);
          updatedStr = updatedStr.filter((s) => s.toLowerCase() !== topic.toLowerCase());
        }

        const newOverall = studentProfile.overallPerformance > 0
          ? Math.round((studentProfile.overallPerformance + passPercent) / 2)
          : Math.round(passPercent);

        updateStudentProfile({
          weaknesses: updatedWeak,
          strengths: updatedStr,
          overallPerformance: newOverall,
          completedAssessments: (studentProfile.completedAssessments || 0) + 1,
        });
      }
    }
  };

  const currentQ = practiceQuestions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-white">
      {/* Tactical HUD Header */}
      <SlideUp>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-[#00F0FF]">
              <Target className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase">ADAPTIVE DRILL TERMINAL · VERIFIED BANK</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Adaptive Practice & Topic Mastery
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Selects teacher-approved questions calibrated dynamically to your topic-wise accuracy. No unverified questions.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="font-bold tabular-nums">{studentProfile?.learningStreak || 5} Days Active</span>
          </div>
        </div>
      </SlideUp>

      {/* Generator Configuration or Question Display */}
      {isGenerating ? (
        <div className="bg-[#0A0D14]/85 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl p-6">
          <DocumentTransformationAnimation
            title={`Calibrating Adaptive Question Selection for ${topic}`}
            sourceDocName={`${topic}.ts`}
            step={`Evaluating learning profile and querying Approved Question Bank for calibrated items...`}
          />
        </div>
      ) : practiceQuestions.length === 0 ? (
        /* Configuration Panel */
        <FadeIn>
          <div className="bg-[#0A0D14]/85 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl space-y-6">
            {/* Student Adaptive Learning Profile Matrix HUD */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-black/60 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <BrainCircuit className="w-5 h-5 text-[#00F0FF]" />
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Student Adaptive Learning Profile & Topic Accuracies
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      System automatically scales question difficulty based on your proven mastery.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approved Bank Sourced Only</span>
                </div>
              </div>

              {/* Topic Competency Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(learningProfile.topicMetrics).map(([topName, metric]) => {
                  const isCurrent = topic.toLowerCase() === topName.toLowerCase();
                  return (
                    <div
                      key={topName}
                      onClick={() => {
                        setTopic(topName);
                        setDifficulty(metric.currentDifficulty);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                        isCurrent
                          ? 'bg-cyan-500/20 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                          : 'bg-black/40 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate max-w-[130px]">{topName}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            metric.currentDifficulty === 'hard'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : metric.currentDifficulty === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {metric.currentDifficulty}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Accuracy</span>
                          <span className="font-mono font-bold text-white tabular-nums">{metric.accuracy}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              metric.accuracy >= 85
                                ? 'bg-rose-400'
                                : metric.accuracy >= 70
                                ? 'bg-amber-400'
                                : metric.accuracy >= 50
                                ? 'bg-cyan-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, metric.accuracy)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                        <span>{metric.totalAttempted} attempts</span>
                        <span className="text-cyan-300 font-medium">{isCurrent ? '● Active Target' : 'Select'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Adaptation Logic Explainer */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 font-mono flex items-center justify-between flex-wrap gap-2">
                <span>
                  Pedagogical Rule: <strong className="text-rose-300">≥85% → Hard</strong> | <strong className="text-amber-300">70-84% → Medium</strong> | <strong className="text-cyan-300">40-69% → Med/Easy</strong> | <strong className="text-emerald-300">&lt;40% → Easy</strong>
                </span>
                <span className="text-slate-400">Smooth rolling transitions prevent sudden jumps.</span>
              </div>
            </div>

            {/* Diagnosed Knowledge Gap Targets */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                  Diagnosed Knowledge Gap Targets
                </span>
              </div>
              {studentProfile?.weaknesses && studentProfile.weaknesses.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-mono text-slate-400">
                    Target Diagnosed Weak Areas:
                  </span>
                  {studentProfile.weaknesses.map((w, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(w)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        topic === w
                          ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          : 'bg-white/5 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      <Target className="w-3 h-3" />
                      <span>{w}</span>
                      {topic === w && <span className="text-[10px] ml-1">✓ Active Focus</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  No blind spots diagnosed yet. Complete your first focus drill to activate live telemetry tracking.
                </div>
              )}
            </div>

            {/* AI Drill Blueprint Assistant */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    AI Drill Blueprint Assistant
                  </span>
                </div>
                <span className="text-[10px] font-mono text-purple-300">
                  AI formulates what you need into a directive for the drill maker
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={studentGoalPrompt}
                  onChange={(e) => setStudentGoalPrompt(e.target.value)}
                  placeholder="Tell AI what you need (e.g. 'focus on electron transitions & photon emission in Bohr model', 'test recursion edge cases')..."
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-black/50 text-white placeholder:text-slate-500 focus:border-purple-400 focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFormulateAIBrief();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleFormulateAIBrief}
                  disabled={isFormulatingBrief}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-[#00F0FF] hover:from-purple-500 hover:to-[#38bdf8] text-black font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isFormulatingBrief ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Formulating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Formulate Directive</span>
                    </>
                  )}
                </button>
              </div>

              {drillBrief && (
                <div className="p-3 rounded-lg bg-black/60 border border-purple-400/40 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#00F0FF]" />
                      <span>AI Directive Given to Drill Maker:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDrillBrief('')}
                      className="text-slate-400 hover:text-rose-400 text-[10px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{drillBrief}</p>
                </div>
              )}
            </div>

            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Customize Practice Session</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Atomic Foundation of Matter"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-black/40 text-white focus:border-[#00F0FF] focus:outline-hidden"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {['Atomic Foundation of Matter', 'Dynamic Programming', 'Bohr Model', 'Trees & Hierarchies'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-black/40 text-white capitalize focus:border-[#00F0FF] focus:outline-hidden"
                >
                  <option value="easy">Easy (Foundational Rules)</option>
                  <option value="medium">Medium (Standard Problems)</option>
                  <option value="hard">Hard (Complex Edge Cases)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Question Count</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-black/40 text-white focus:border-[#00F0FF] focus:outline-hidden"
                >
                  <option value={3}>3 Questions (Quick Drill)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={8}>8 Questions (Deep Practice)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-[#00F0FF]/10 rounded-xl border border-[#00F0FF]/30 text-xs text-slate-200 leading-relaxed font-mono">
              <span className="font-bold text-[#00F0FF]">Adaptive Feedback: </span>
              Each question provides instant rationale upon submission, walking through why incorrect distractors fail and reinforcing foundational invariants.
            </div>

            <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setQuickNotesOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>3-Min Quick Revision Notes</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartPractice()}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <span>Begin Targeted Practice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </FadeIn>
      ) : !completed ? (
        /* Active Practice Card */
        <FadeIn key={currentIndex}>
          <div className="bg-[#0A0D14]/85 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-white/10 flex-wrap gap-2">
              <span>
                Question {currentIndex + 1} of {practiceQuestions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Approved Question Bank</span>
                </span>
                <span className="capitalize font-bold text-[#00F0FF]">
                  {topic} · {difficulty}
                </span>
              </div>
            </div>

            {selectionAudit && (
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 font-mono flex items-start gap-2">
                <BrainCircuit className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white">Adaptive Pedagogical Selection: </span>
                  <span className="text-slate-300">{selectionAudit.explanation}</span>
                </div>
              </div>
            )}

            {drillBrief && (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 font-sans flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-purple-300 font-mono">Calibrated to AI Blueprint: </span>
                  <span>{drillBrief}</span>
                </div>
              </div>
            )}

            {currentQ && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white leading-relaxed">
                  {currentQ.questionText}
                </h3>

                {/* Options with Staggered Entrance */}
                <StaggerContainer className="space-y-2.5 pt-2">
                  {currentQ.options?.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect =
                      opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

                    let optStyles = 'bg-white/5 border-white/10 hover:border-[#00F0FF]/40 text-slate-200';
                    if (isSelected && !hasCheckedAnswer) {
                      optStyles = 'bg-[#00F0FF]/15 border-[#00F0FF] text-white font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)]';
                    } else if (hasCheckedAnswer) {
                      if (isCorrect) {
                        optStyles = 'bg-[#10B981]/20 border-[#10B981] text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                      } else if (isSelected && !isCorrect) {
                        optStyles = 'bg-rose-500/20 border-rose-500 text-white';
                      }
                    }

                    return (
                      <StaggerItem key={idx}>
                        <div
                          onClick={() => !hasCheckedAnswer && setSelectedAnswer(opt)}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between active:scale-[0.99] ${optStyles}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-black/40 text-[#00F0FF] border border-white/10 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {hasCheckedAnswer && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                          )}
                          {hasCheckedAnswer && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>

                {/* Immediate Pedagogical Explanation */}
                {hasCheckedAnswer && (
                  <SlideUp>
                    <div
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        isCurrentCorrect()
                          ? 'bg-[#10B981]/15 border-[#10B981]/40 text-white'
                          : 'bg-rose-500/15 border-rose-500/40 text-white'
                      }`}
                    >
                      <div className="font-mono font-bold mb-1 flex items-center gap-1.5">
                        {isCurrentCorrect() ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{isCurrentCorrect() ? 'Correct Invariant Verified!' : 'Pedagogical Invariant:'}</span>
                      </div>
                      <p className="text-slate-200">{currentQ.explanation}</p>
                    </div>
                  </SlideUp>
                )}

                {/* AI Monitoring System: Inline Analogy Intervention & Targeted Drill */}
                {hasCheckedAnswer && !isCurrentCorrect() && currentIntervention && (
                  <SlideUp>
                    <InlineAIIntervention
                      intervention={currentIntervention}
                      onLaunchPractice={() => openRemedialModal(currentIntervention)}
                      onDismiss={() => setCurrentIntervention(null)}
                    />
                  </SlideUp>
                )}

                {/* Bottom Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  {!hasCheckedAnswer ? (
                    <button
                      type="button"
                      onClick={handleCheckAnswer}
                      disabled={!selectedAnswer}
                      className="px-5 py-2 text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer"
                    >
                      <span>
                        {currentIndex + 1 < practiceQuestions.length
                          ? 'Next Practice Item'
                          : 'Complete Session'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      ) : (
        /* Completed Practice Summary */
        <FadeIn>
          <div className="bg-[#0A0D14]/85 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <AnimatedProgressRing
                percentage={Math.round((score / practiceQuestions.length) * 100)}
                size={84}
                strokeWidth={7}
                color="#10B981"
                trackColor="rgba(255,255,255,0.1)"
              />
            </div>

            <div>
              <h2 className="text-xl font-mono font-bold text-white">Practice Session Completed!</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                You scored <span className="font-bold text-[#10B981] tabular-nums">{score}</span> of{' '}
                <span className="tabular-nums">{practiceQuestions.length}</span> on {topic} ({difficulty} difficulty)
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1 font-mono">
              <div className="font-bold text-[#00F0FF]">Adaptive Feedback:</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {score >= practiceQuestions.length * 0.7
                  ? 'Excellent progress! Your knowledge matrix has been updated and future sessions will automatically scale difficulty upward.'
                  : 'Keep practicing! Review the corresponding AI Tutor explanations to solidify these edge-case definitions.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPracticeQuestions([])}
                className="px-4 py-2 text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Choose New Topic
              </button>
              <button
                type="button"
                onClick={() => handleStartPractice(topic, 'medium')}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Next Difficulty Level</span>
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* AI Quick Notes Modal */}
      <QuickNotesModal
        isOpen={quickNotesOpen}
        onClose={() => setQuickNotesOpen(false)}
        initialTopic={topic}
        role="student"
        weakTopics={studentProfile?.weaknesses || []}
        autoGenerate={false}
        onStartPractice={(t) => {
          setTopic(t);
          handleStartPractice(t);
        }}
      />
    </div>
  );
};
