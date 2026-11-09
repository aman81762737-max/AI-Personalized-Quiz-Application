import React, { useState, useEffect } from 'react';
import { Assessment, AssessmentAttempt } from '../../types';
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  Layers,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Award,
  Search,
  Trash2,
  Send,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  StaggerContainer,
  StaggerItem,
  AnimatedNumber,
  SlideUp,
} from '../animation/AnimationComponents';
import { useToast } from '../common/Toast';

interface TeacherAssessmentsViewProps {
  assessments: Assessment[];
  attempts: AssessmentAttempt[];
  onCreateNew: () => void;
  initialAssessmentId?: string;
  onClearInitialAssessmentId?: () => void;
  onDeleteAssessment?: (assessmentId: string) => void;
  onPublishAssessment?: (assessment: Assessment) => void;
}

export const TeacherAssessmentsView: React.FC<TeacherAssessmentsViewProps> = ({
  assessments,
  attempts,
  onCreateNew,
  initialAssessmentId,
  onClearInitialAssessmentId,
  onDeleteAssessment,
  onPublishAssessment,
}) => {
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedAsmForSubmissions, setSelectedAsmForSubmissions] = useState<Assessment | null>(null);
  const [selectedStudentAttempt, setSelectedStudentAttempt] = useState<AssessmentAttempt | null>(null);
  const [submissionSearch, setSubmissionSearch] = useState<string>('');

  // Persistent Evaluation Done state
  const [evaluatedAttemptIds, setEvaluatedAttemptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('teacher_evaluated_attempts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Support navigating directly into roster when triggered externally (e.g. from Recent Submissions on Dashboard)
  useEffect(() => {
    if (initialAssessmentId) {
      const matched = assessments.find((a) => a.assessmentId === initialAssessmentId);
      if (matched) {
        setSelectedAsmForSubmissions(matched);
        setSelectedStudentAttempt(null);
      }
    }
  }, [initialAssessmentId, assessments]);

  const activeSubmissions = selectedAsmForSubmissions
    ? attempts.filter((a) => a.assessmentId === selectedAsmForSubmissions.assessmentId)
    : [];

  const filteredSubmissions = activeSubmissions.filter((sub) => {
    if (!submissionSearch.trim()) return true;
    const query = submissionSearch.toLowerCase();
    return (
      (sub.studentName && sub.studentName.toLowerCase().includes(query)) ||
      (sub.studentId && sub.studentId.toLowerCase().includes(query))
    );
  });

  const handleToggleEvaluation = (attemptId: string) => {
    setEvaluatedAttemptIds((prev) => {
      const isAlready = prev.includes(attemptId);
      const next = isAlready ? prev.filter((id) => id !== attemptId) : [...prev, attemptId];
      try {
        localStorage.setItem('teacher_evaluated_attempts', JSON.stringify(next));
      } catch {}
      showToast(
        isAlready ? 'Attempt marked as awaiting evaluation' : 'Attempt evaluation completed successfully!',
        'success'
      );
      return next;
    });
  };

  const filteredAssessments = assessments.filter((asm) => {
    if (statusFilter === 'all') return true;
    return (asm.status || 'published') === statusFilter;
  });

  // =========================================================================
  // VIEW 1: DEDICATED IN-PAGE STUDENT'S ANSWERED QUESTIONS PAGE (NOT A MODAL!)
  // =========================================================================
  if (selectedStudentAttempt) {
    const attempt = selectedStudentAttempt;
    const isEvaluated = evaluatedAttemptIds.includes(attempt.attemptId);
    const passThreshold = selectedAsmForSubmissions?.passingPercentage || 70;
    const isPassed =
      attempt.passed !== undefined
        ? attempt.passed
        : (attempt.percentage || 0) >= passThreshold;
    const proctorFlags = attempt.proctoringViolationsCount || 0;
    const verifiedPercent = Math.max(100 - proctorFlags * 15, 0);

    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-white font-sans animate-in fade-in duration-150">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <button
            type="button"
            onClick={() => setSelectedStudentAttempt(null)}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00F0FF]" />
            <span>Back to Submissions Roster ({selectedAsmForSubmissions?.title || 'Roster'})</span>
          </button>

          {/* Mark Evaluation Completed Action */}
          <button
            type="button"
            onClick={() => handleToggleEvaluation(attempt.attemptId)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              isEvaluated
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-[#10B981] hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEvaluated ? 'Evaluation Done ✓ (Click to Re-evaluate)' : 'Complete Evaluation'}</span>
          </button>
        </div>

        {/* Student Submission Identity Dossier */}
        <div className="p-6 rounded-2xl bg-[#0A0D14]/90 border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center font-bold text-xl text-[#00F0FF]">
                {attempt.studentName?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {attempt.studentName || 'Student Scholar'}
                  </h1>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    ID: {attempt.studentId}
                  </span>
                  {isEvaluated ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Evaluation Done
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                      Awaiting Evaluation
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-2 flex-wrap">
                  <span>Examination: {selectedAsmForSubmissions?.title || attempt.assessmentTitle || 'Assessment'}</span>
                  <span>·</span>
                  <span>
                    Submitted:{' '}
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleDateString() + ' ' + new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Recent'}
                  </span>
                </div>
              </div>
            </div>

            {/* Score & Integrity Cards */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-right min-w-[110px]">
                <div className="text-[10px] font-mono uppercase text-slate-400">Score & Grade</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">
                  {attempt.score}/{attempt.reviewItems?.length || 10}
                </div>
                <div className={`text-[10px] font-mono font-bold ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {attempt.percentage ?? 0}% · {isPassed ? 'PASSED' : 'REMEDIATION'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-right min-w-[110px]">
                <div className="text-[10px] font-mono uppercase text-slate-400">Proctor Integrity</div>
                <div className="text-lg font-bold font-mono text-[#00F0FF] flex items-center justify-end gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                  <span>{verifiedPercent}%</span>
                </div>
                <div className={`text-[10px] font-mono ${proctorFlags === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {proctorFlags} Flags Logged
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question-by-Question Response Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#00F0FF]" />
              <span>Student Exam Response Audit & Answer Trace ({attempt.reviewItems?.length || 0} Questions)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Passing Benchmark: {passThreshold}%</span>
          </div>

          {(!attempt.reviewItems || attempt.reviewItems.length === 0) ? (
            <div className="p-8 rounded-2xl bg-[#0A0D14]/80 border border-white/10 text-center space-y-2">
              <p className="text-sm text-slate-300">
                Summary attempt record logged ({attempt.percentage}% score). Detailed item telemetry was not captured for this preliminary attempt.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attempt.reviewItems.map((item, qIdx) => (
                <div
                  key={item.questionId || qIdx}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.isCorrect
                      ? 'bg-emerald-950/15 border-[#10B981]/30 hover:border-[#10B981]/50'
                      : 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-white text-[11px]">
                        {qIdx + 1}
                      </span>
                      <span>Topic: {item.topic || selectedAsmForSubmissions?.subject || 'Curriculum Concepts'}</span>
                    </span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                        item.isCorrect
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {item.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                    <div className={`p-3 rounded-xl border ${item.isCorrect ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-rose-950/30 border-rose-500/40'}`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Student Answer</span>
                      <div className="font-bold text-white break-words">
                        {item.studentAnswer || '(No response submitted)'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border bg-black/40 border-white/10">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Correct Answer Key</span>
                      <div className="font-bold text-emerald-300 break-words">
                        {item.correctAnswer}
                      </div>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed">
                      <strong className="text-[#00F0FF] font-mono text-[11px] block mb-0.5">Pedagogical Explanation:</strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom Evaluation Finalizer */}
          <div className="pt-4 flex items-center justify-between border-t border-white/10">
            <button
              type="button"
              onClick={() => setSelectedStudentAttempt(null)}
              className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              ← Back to Submissions Roster
            </button>

            <button
              type="button"
              onClick={() => handleToggleEvaluation(attempt.attemptId)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#10B981] hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEvaluated ? 'Evaluation Done ✓' : 'Approve & Mark Evaluation Done'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED IN-PAGE SUBMISSION ROSTER (NOT A FLOATING WINDOW!)
  // =========================================================================
  if (selectedAsmForSubmissions) {
    const asm = selectedAsmForSubmissions;

    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-white font-sans animate-in fade-in duration-150">
        {/* Navigation & Header */}
        <div className="pb-4 border-b border-white/10 space-y-3">
          <button
            type="button"
            onClick={() => {
              setSelectedAsmForSubmissions(null);
              if (onClearInitialAssessmentId) onClearInitialAssessmentId();
            }}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00F0FF]" />
            <span>← Back to All Examinations</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] mb-1">
                <ClipboardList className="w-4 h-4" />
                <span className="uppercase tracking-wider">STUDENT SUBMISSION ROSTER</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {asm.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono flex-wrap">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[#00F0FF] border border-blue-500/30">
                  {asm.subject}
                </span>
                <span>·</span>
                <span>Pass Benchmark: {asm.passingPercentage}%</span>
                <span>·</span>
                <span className="text-[#10B981] font-bold">
                  {activeSubmissions.length} Total Submissions Recorded
                </span>
              </div>
            </div>

            {/* Submissions Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or ID..."
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F0FF] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0A0D14]/85 border border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Student Submissions Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {submissionSearch
                ? 'No students matched your search query.'
                : 'Enrolled students have not submitted attempts for this examination yet. As soon as a student completes the test, their answers and marks will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((attempt, attIdx) => {
              const isEvaluated = evaluatedAttemptIds.includes(attempt.attemptId);
              const isPassed =
                attempt.passed !== undefined
                  ? attempt.passed
                  : (attempt.percentage || 0) >= (asm.passingPercentage || 70);

              return (
                <div
                  key={`${attempt.attemptId || 'att'}-${attIdx}`}
                  onClick={() => setSelectedStudentAttempt(attempt)}
                  className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#0A0D14]/90 hover:border-[#00F0FF]/50 hover:bg-[#0E131E] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group shadow-sm"
                  title="Click to view full student answer trace and complete evaluation"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center font-bold text-sm text-[#00F0FF] shrink-0 group-hover:scale-105 transition-transform">
                      {attempt.studentName?.charAt(0) || 'S'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                          {attempt.studentName || 'Student Scholar'}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({attempt.studentId})
                        </span>
                        {/* Evaluation Status Tag */}
                        {isEvaluated ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Evaluation Done
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                            Awaiting Evaluation
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono flex-wrap">
                        <span>
                          Submitted:{' '}
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString() + ' ' + new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Recent'}
                        </span>
                        <span>·</span>
                        <span className={attempt.proctoringViolationsCount === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {attempt.proctoringViolationsCount || 0} Proctor Flags
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & View Answers Button */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white tabular-nums">
                        {attempt.score}/{attempt.reviewItems?.length || 10}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded mt-0.5 ${
                          isPassed
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {attempt.percentage ?? 0}% · {isPassed ? 'PASSED' : 'REMEDIATION'}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 group-hover:bg-[#00F0FF] group-hover:text-black text-slate-300 text-xs font-mono font-bold transition-all border border-white/10">
                      <span>View Answers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: MAIN EXAMINATIONS INVENTORY & PUBLISHED ASSESSMENTS LIST
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7 text-white font-mono">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#10B981]">
            <Terminal className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">ACADEMIC EXAMINATIONS CORRIDOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Examinations & Assessments
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage proctored assessments, publish student assignments, and inspect completed submission rosters.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assessment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {(['all', 'published', 'draft'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
              statusFilter === tab
                ? 'bg-white/15 text-white shadow-xs border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'all' ? 'All Assessments' : tab === 'published' ? 'Active / Published' : 'Drafts'}
          </button>
        ))}
      </div>

      {/* Grid of Assessments */}
      {filteredAssessments.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[#0A0D14]/60 rounded-2xl border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No assessments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {statusFilter === 'draft'
              ? 'No drafted assessments currently stored. Create an assessment or save questions as draft.'
              : 'Create an assessment from scratch or synthesize one instantly from your ingested curriculum.'}
          </p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((asm, idx) => {
            const asmAttempts = attempts.filter((a) => a.assessmentId === asm.assessmentId);
            const completedCount = asmAttempts.length;
            const avgScore =
              completedCount > 0
                ? Math.round(asmAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedCount)
                : null;
            const isDraft = asm.status === 'draft';

            return (
              <StaggerItem key={`${asm.assessmentId || 'asm'}-${idx}`}>
                <div
                  className={`rounded-2xl border ${
                    isDraft ? 'border-amber-500/30 bg-[#0B0F17]/90' : 'border-white/10 bg-[#0A0D14]/85'
                  } p-5 flex flex-col justify-between space-y-4 backdrop-blur-md hover:border-[#10B981]/50 transition-all duration-200 group shadow-lg`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[#00F0FF] border border-blue-500/30 font-bold uppercase text-[10px]">
                        {asm.subject}
                      </span>
                      {isDraft ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[10px] uppercase">
                          Unpublished Draft
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          1 Attempt Cap
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-[#10B981] transition-colors line-clamp-2">
                      {asm.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 font-sans leading-relaxed">
                      {asm.description}
                    </p>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {(asm.topics || []).slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="p-2 bg-black/40 border border-white/10 rounded-xl">
                        <span className="text-[10px] text-slate-400 block uppercase">Items</span>
                        <span className="font-bold text-white tabular-nums">
                          {asm.questionIds?.length || asm.questionCount || 0}
                        </span>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/10 rounded-xl">
                        <span className="text-[10px] text-slate-400 block uppercase">Time</span>
                        <span className="font-bold text-white tabular-nums">
                          {asm.durationMinutes}m
                        </span>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/10 rounded-xl">
                        <span className="text-[10px] text-slate-400 block uppercase">Avg. Score</span>
                        <span className="font-bold text-[#10B981] tabular-nums">
                          {avgScore !== null ? `${avgScore}%` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Submissions (View Roster) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAsmForSubmissions(asm);
                          setSelectedStudentAttempt(null);
                          setSubmissionSearch('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] hover:underline cursor-pointer group"
                        title="Click to view all student attempts and submissions in Roster"
                      >
                        <Users className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>
                          <span className="font-bold text-white tabular-nums">
                            {completedCount}
                          </span>{' '}
                          Submissions (View Roster)
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {isDraft && onPublishAssessment && (
                          <button
                            type="button"
                            onClick={() => onPublishAssessment(asm)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#10B981] hover:bg-emerald-400 text-black transition-colors cursor-pointer"
                            title="Publish draft to students"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish</span>
                          </button>
                        )}

                        {onDeleteAssessment && (
                          <button
                            type="button"
                            onClick={() => onDeleteAssessment(asm.assessmentId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete this assessment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
};
