import React, { useState, useEffect, useRef } from 'react';
import { Assessment, Question, AssessmentAttempt, ProctoringEvent } from '../../types';
import { assessmentService } from '../../services/assessmentService';
import { proctoringService } from '../../services/proctoringService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { useAIMonitor } from '../../context/AIMonitorContext';
import { Modal } from '../common/Modal';
import {
  saveInProgressExamState,
  loadInProgressExamState,
  clearInProgressExamState,
} from '../../services/cloudSyncService';
import {
  Clock,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Send,
  Loader2,
  Maximize2,
  Save,
  Lock,
  Eye,
  Activity,
  Terminal,
  Sun,
  Moon,
} from 'lucide-react';

interface ExamInterfaceProps {
  assessment: Assessment;
  allQuestions: Question[];
  onFinishExam: (attempt: AssessmentAttempt) => void;
  onExit: () => void;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
  assessment,
  allQuestions,
  onFinishExam,
  onExit,
}) => {
  const { userProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { trackAction } = useAIMonitor();

  const examFullQuestions = allQuestions.filter((q) => assessment.questionIds.includes(q.questionId));

  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(assessment.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
  const [lastSaved, setLastSaved] = useState<string>('Just now');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeViolation, setActiveViolation] = useState<string | null>(null);

  const attemptIdRef = useRef(`att-${Date.now()}`);
  const startedAtRef = useRef(new Date().toISOString());
  const sessionKey = `inprog-${assessment.assessmentId}-${userProfile?.userId || 'student'}`;

  // Initialize questions and restore in-progress state
  useEffect(() => {
    const prepared = assessmentService.prepareStudentExamSession(
      examFullQuestions,
      assessment.randomized !== false
    );
    setExamQuestions(prepared);

    loadInProgressExamState(sessionKey).then((saved) => {
      if (saved && saved.assessmentId === assessment.assessmentId) {
        if (saved.recordedAnswers && Object.keys(saved.recordedAnswers).length > 0) {
          setAnswers(saved.recordedAnswers);
        }
        if (typeof saved.currentIndex === 'number' && saved.currentIndex < prepared.length) {
          setCurrentIndex(saved.currentIndex);
        }
        if (typeof saved.timeRemainingSeconds === 'number' && saved.timeRemainingSeconds > 0) {
          setTimeLeft(saved.timeRemainingSeconds);
        }
        if (Array.isArray(saved.flaggedQuestions)) {
          const flaggedSet = new Set<number>();
          saved.flaggedQuestions.forEach((qId: string) => {
            const idx = prepared.findIndex((pq) => pq.questionId === qId);
            if (idx !== -1) flaggedSet.add(idx);
          });
          setFlaggedIndices(flaggedSet);
        }
        showToast('Active exam session restored from autosave.', 'info');
      }
    }).catch(() => {});
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Cloud Autosave
  useEffect(() => {
    if (isSubmitting || examQuestions.length === 0) return;
    const interval = setInterval(() => {
      const flaggedIds = Array.from(flaggedIndices)
        .map((idx) => examQuestions[idx]?.questionId)
        .filter(Boolean);

      saveInProgressExamState(sessionKey, {
        assessmentId: assessment.assessmentId,
        studentId: userProfile?.userId || 'student',
        currentIndex,
        recordedAnswers: answers,
        timeRemainingSeconds: timeLeft,
        status: 'in_progress',
        flaggedQuestions: flaggedIds,
      }).catch(() => {});

      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 5000);
    return () => clearInterval(interval);
  }, [answers, currentIndex, timeLeft, flaggedIndices, isSubmitting, examQuestions]);

  // Proctoring Monitor (Assessment Lock Mode)
  useEffect(() => {
    const cleanup = proctoringService.startExamSession((evt) => {
      const newEvent: ProctoringEvent = {
        eventId: `evt-${Date.now()}`,
        attemptId: attemptIdRef.current,
        studentId: userProfile?.userId || 'student-01',
        eventType: evt.type,
        timestamp: evt.timestamp,
        details: evt.details,
      };

      setProctoringEvents((prev) => [...prev, newEvent]);

      if (evt.type === 'window_blur' || evt.type === 'tab_switch' || evt.type === 'fullscreen_exit') {
        setActiveViolation('Window Focus Lost: Exam Lock Mode requires staying focused on this test window.');
        setTimeout(() => setActiveViolation(null), 6000);
      } else if (evt.type === 'copy_attempt' || evt.type === 'paste_attempt') {
        setActiveViolation('Clipboard Action Blocked: Copy/paste is prohibited under Assessment Lock Mode.');
        setTimeout(() => setActiveViolation(null), 6000);
      }

      showToast(`[Lock Mode Monitoring] ${evt.details}`, 'warning');
    });

    return () => cleanup();
  }, [userProfile]);

  const handleSelectOption = (val: string) => {
    const q = examQuestions[currentIndex];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.questionId]: val }));
  };

  const toggleFlag = (index: number) => {
    setFlaggedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowSubmitConfirm(false);

    try {
      showToast('Submitting assessment for automated evaluation & gap analysis...', 'info');

      const evaluation = await assessmentService.evaluateAttempt(examFullQuestions, answers);

      const newAttempt: AssessmentAttempt = {
        attemptId: attemptIdRef.current,
        assessmentId: assessment.assessmentId,
        assessmentTitle: assessment.title,
        studentId: userProfile?.userId || 'student-01',
        studentName: userProfile?.name || 'Alex Rivera',
        startedAt: startedAtRef.current,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        score: evaluation.score,
        percentage: evaluation.percentage,
        passed: evaluation.passed,
        questionIds: examFullQuestions.map((q) => q.questionId),
        answers,
        topicBreakdown: evaluation.topicBreakdown,
        difficultyBreakdown: evaluation.difficultyBreakdown,
        proctoringViolationsCount: proctoringEvents.length,
        reviewItems: evaluation.questionReview,
      };

      // Disperse telemetry to AI Monitoring System for all questions in background
      if (evaluation.questionReview && evaluation.questionReview.length > 0) {
        evaluation.questionReview.forEach((item) => {
          trackAction({
            actionType: 'exam_submission',
            topic: item.topic || assessment.subject,
            subject: assessment.subject,
            isCorrect: item.isCorrect,
            studentAnswer: item.studentAnswer,
            correctAnswer: item.correctAnswer,
            questionText: item.questionText,
            difficulty: (item.difficulty as any) || 'medium',
          }).catch(() => {});
        });
      }

      await clearInProgressExamState(sessionKey);
      onFinishExam(newAttempt);
      showToast('Examination completed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error evaluating assessment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCount = examQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = examQuestions[currentIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#07090E] text-white' : 'bg-[#F8FAFC] text-slate-900'} flex flex-col font-sans transition-colors`}>
      {/* Violation Alert Banner */}
      {activeViolation && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-mono font-bold text-center flex items-center justify-center gap-2 shadow-lg transition-all duration-200">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{activeViolation}</span>
        </div>
      )}

      {/* Top Lock Mode Bar */}
      <header className={`sticky top-0 z-30 ${isDark ? 'bg-[#0A0D14]/90 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'} border-b backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between gap-4 font-mono`}>
        {/* Title and Lock Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-400">
            <Lock className="w-3.5 h-3.5" />
            <span>ASSESSMENT LOCK MODE</span>
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'} truncate max-w-xs sm:max-w-md font-sans`}>
              {assessment.title}
            </h1>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {assessment.subject} · Autosaved {lastSaved}
            </span>
          </div>
        </div>

        {/* Center / Right: Theme Switcher, Fullscreen, Timer, Submit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Student Exam Theme Switcher (Bright / Dark Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center ${
              isDark
                ? 'text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
            }`}
            title={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} rounded-lg transition-colors cursor-pointer`}
            title="Toggle Distraction-Free Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Countdown Clock */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            isDark
              ? 'border-white/10 bg-white/5 text-[#00F0FF]'
              : 'border-slate-200 bg-slate-100 text-blue-700'
          } font-mono font-bold text-xs sm:text-sm tabular-nums`}>
            <Clock className={`w-4 h-4 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* AI Cognitive & Focus Sentinel Telemetry Bar */}
      <div className={`${
        isDark
          ? 'bg-[#0A0D14]/70 border-white/10 text-white'
          : 'bg-slate-100/90 border-slate-200 text-slate-700'
      } border-b px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className={`font-bold ${isDark ? 'text-[#00F0FF]' : 'text-blue-700'}`}>AI Sentinel Active</span>
          <span className={`${isDark ? 'text-white/20' : 'text-slate-300'} hidden sm:inline`}>|</span>
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} hidden sm:inline`}>
            Monitoring response pacing & cognitive invariant stability in real-time
          </span>
        </div>
        <div className={`flex items-center gap-3 text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <span>Pacing: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{answers[currentQuestion?.questionId] ? 'Answered' : 'Evaluating'}</strong></span>
          <span>·</span>
          <span>Proctor Status: <strong className={proctoringEvents.length === 0 ? 'text-[#10B981]' : 'text-amber-500'}>{proctoringEvents.length === 0 ? 'Verified Normal' : `${proctoringEvents.length} Warning(s)`}</strong></span>
        </div>
      </div>

      {/* Main Examination Viewport */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Question Content Area */}
        <main className={`lg:col-span-8 ${
          isDark
            ? 'bg-[#0A0D14]/85 border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        } p-6 sm:p-8 rounded-2xl border backdrop-blur-md shadow-2xl space-y-6`}>
          {currentQuestion ? (
            <>
              {/* Question metadata row */}
              <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} font-mono`}>
                <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Question {currentIndex + 1} of {totalCount}
                  <span className={`mx-2 ${isDark ? 'text-white/20' : 'text-slate-300'}`}>·</span>
                  <span className={`capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{currentQuestion.difficulty}</span>
                  <span className={`mx-2 ${isDark ? 'text-white/20' : 'text-slate-300'}`}>·</span>
                  <span className={isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-bold'}>{currentQuestion.topic}</span>
                </div>

                {/* Mark for review toggle */}
                <button
                  type="button"
                  onClick={() => toggleFlag(currentIndex)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    flaggedIndices.has(currentIndex)
                      ? isDark
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                      : isDark
                      ? 'text-slate-400 hover:text-white bg-white/5 border border-white/10'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      flaggedIndices.has(currentIndex) ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                  <span>
                    {flaggedIndices.has(currentIndex) ? 'Marked for Review' : 'Mark for Review'}
                  </span>
                </button>
              </div>

              {/* Question text */}
              <div className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} leading-relaxed font-sans`}>
                {currentQuestion.questionText}
              </div>

              {/* Options */}
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="space-y-3 pt-2 font-mono">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = answers[currentQuestion.questionId] === opt;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        className={`p-4 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? isDark
                              ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                              : 'bg-cyan-50 border-cyan-500 text-cyan-950 font-bold shadow-xs'
                            : isDark
                            ? 'bg-white/5 border-white/10 hover:border-[#00F0FF]/40 text-slate-200'
                            : 'bg-slate-50 border-slate-200 hover:border-cyan-400 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'bg-[#00F0FF] text-black font-bold'
                                : isDark
                                ? 'bg-black/40 text-slate-400 border border-white/10'
                                : 'bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className={`font-sans ${isSelected && !isDark ? 'text-cyan-950 font-semibold' : ''}`}>{opt}</span>
                        </div>
                        {isSelected && <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-[#00F0FF]' : 'text-cyan-600'} shrink-0`} />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fill in the blank input */
                <div className="pt-2 font-mono">
                  <label className={`block text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-wider mb-2`}>
                    Your Response:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQuestion.questionId] || ''}
                    onChange={(e) => handleSelectOption(e.target.value)}
                    placeholder="Type your response here..."
                    className={`w-full px-4 py-3 text-sm font-semibold rounded-xl border ${
                      isDark
                        ? 'border-white/10 bg-black/40 text-white placeholder-slate-400 focus:border-[#00F0FF]'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-cyan-500'
                    } focus:outline-hidden shadow-xs`}
                  />
                </div>
              )}

              {/* Prev / Next controls */}
              <div className={`flex items-center justify-between pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} font-mono`}>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentIndex === 0}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-30 cursor-pointer ${
                    isDark
                      ? 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
                      : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex === totalCount - 1 ? (
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-black bg-[#10B981] hover:bg-[#34d399] rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish Assignment</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalCount - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer active:scale-95"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={`p-12 text-center text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Loading assessment questions...
            </div>
          )}
        </main>

        {/* Sidebar Question Palette */}
        <aside className={`lg:col-span-4 ${
          isDark
            ? 'bg-[#0A0D14]/85 border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        } p-6 rounded-2xl border backdrop-blur-md shadow-2xl space-y-6 font-mono`}>
          <div>
            <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-wider mb-2`}>
              Question Palette
            </h3>
            <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
              <span>
                Answered:{' '}
                <strong className={`${isDark ? 'text-[#10B981]' : 'text-emerald-600'} tabular-nums font-bold`}>
                  {answeredCount}/{totalCount}
                </strong>
              </span>
              <span>
                Marked:{' '}
                <strong className={`${isDark ? 'text-amber-400' : 'text-amber-600'} tabular-nums font-bold`}>{flaggedIndices.size}</strong>
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.map((q, idx) => {
                const isAnswered = !!answers[q.questionId];
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedIndices.has(idx);

                return (
                  <button
                    key={`${q.questionId || 'eq'}-${idx}`}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : isAnswered
                        ? isDark
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                        : isDark
                        ? 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proctoring Status in Exam */}
          <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} space-y-2`}>
            <div className="flex items-center justify-between text-xs">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Sentinel Telemetry:</span>
              <span className={`font-bold ${isDark ? 'text-[#10B981]' : 'text-emerald-600'} flex items-center gap-1`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Clean</span>
              </span>
            </div>
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Violations: <span className={`tabular-nums font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{proctoringEvents.length}</span> (focus transitions)
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        title="Submit Assessment?"
        subtitle="You are about to finalize your examination session."
      >
        <div className="space-y-4 text-xs font-mono text-white">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Questions:</span>
              <span className="font-bold text-white">{totalCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Answered:</span>
              <span className="font-bold text-[#10B981]">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Unanswered:</span>
              <span className="font-bold text-rose-400">{totalCount - answeredCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(false)}
              className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Continue Working
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl font-bold text-black bg-[#10B981] hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Grading with AI...</span>
                </>
              ) : (
                <span>Confirm Final Submission</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
