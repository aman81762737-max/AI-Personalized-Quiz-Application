import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Material, Question, Assessment, AssessmentAttempt } from '../../types';
import {
  StaggerContainer,
  StaggerItem,
  AnimatedNumber,
  FadeIn,
} from '../animation/AnimationComponents';
import { motion } from 'motion/react';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Upload,
  BrainCircuit,
  Sparkles,
  BarChart2,
  FileText,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Zap,
  Activity,
  Cpu,
} from 'lucide-react';
import { QuickNotesModal } from '../common/QuickNotesModal';

import { getEnrolledCohort } from '../../data/cohortData';
import { subscribeEnrolledCohort } from '../../services/cloudSyncService';
import { StudentCohortRecord } from '../../types';

interface TeacherDashboardProps {
  materials: Material[];
  questions: Question[];
  assessments: Assessment[];
  attempts: AssessmentAttempt[];
  onNavigate: (view: string) => void;
  onOpenGenerateModal: () => void;
  onViewSubmissions?: (assessmentId?: string, attemptId?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  materials,
  questions,
  assessments,
  attempts,
  onNavigate,
  onOpenGenerateModal,
  onViewSubmissions,
}) => {
  const { userProfile, teacherProfile } = useAuth();
  const { density, isDark } = useTheme();
  const [quickNotesOpen, setQuickNotesOpen] = useState(false);

  // Synchronized live cohort headcount: accurately reflects live cohort students from Firestore
  const [cohortList, setCohortList] = useState<StudentCohortRecord[]>(() => getEnrolledCohort(userProfile));

  React.useEffect(() => {
    const unsub = subscribeEnrolledCohort((liveList) => {
      setCohortList(liveList);
    });
    return () => unsub();
  }, []);

  const totalStudents = Math.max(cohortList.length, teacherProfile?.students || 0);
  const totalAssessments = assessments.length;
  const publishedAssessments = assessments.filter((a) => a.status === 'published').length;
  const draftAssessments = assessments.filter((a) => a.status === 'draft').length;
  const totalQuestions = questions.length;
  const approvedQuestions = questions.filter((q) => q.status === 'approved').length;
  const pendingQuestions = questions.filter((q) => q.status === 'draft').length;
  const totalSubmissions = attempts.length;
  const passedSubmissions = attempts.filter((a) => a.passed).length;

  return (
    <div className={`space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 ${isDark ? 'text-white' : 'text-black'}`}>
      {/* Header with Tactical Telemetry Status */}
      <FadeIn>
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div>
            <div className={`flex items-center gap-2 mb-1 text-xs font-mono ${isDark ? 'text-[#10B981]' : 'text-emerald-700 font-bold'}`}>
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>FACULTY COMMAND DECK</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
              Welcome back, {userProfile?.name || 'Educator'}
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} mt-1`}>
              Department of Computer Science & Algorithms · Academic Term 2026
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('cohort')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold ${
                isDark
                  ? 'text-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border-[#00F0FF]/30'
                  : 'text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm'
              } border rounded-xl transition-all cursor-pointer active:scale-95`}
            >
              <Users className="w-4 h-4 text-[#00F0FF]" />
              <span>Student Cohort Explorer</span>
            </button>

            <button
              onClick={() => onNavigate('materials')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold ${
                isDark
                  ? 'text-white bg-slate-900 hover:bg-slate-800 border-white/15'
                  : 'text-black bg-white hover:bg-slate-100 border-slate-300 shadow-sm'
              } border rounded-xl transition-all cursor-pointer active:scale-95`}
            >
              <Upload className={`w-4 h-4 ${isDark ? 'text-[#10B981]' : 'text-emerald-600'}`} />
              <span>Upload Syllabus PDF</span>
            </button>

            <button
              onClick={onOpenGenerateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>AI Question Synthesizer</span>
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Themed KPI Cards with Staggered Entrance & Number Counting */}
      <StaggerContainer className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${density === 'compact' ? 'gap-3' : 'gap-4'}`}>
        {/* Card 1: Enrolled Students */}
        <StaggerItem className="h-full">
          <div
            onClick={() => onNavigate('cohort')}
            className={`h-full flex flex-col justify-between ${
              isDark ? 'bg-[#0A0D14]/85 border-white/10 text-white hover:border-[#00F0FF]/40' : 'bg-white border-slate-200 text-black shadow-md hover:border-blue-300'
            } rounded-2xl border shadow-xs backdrop-blur-md ${density === 'compact' ? 'p-4' : 'p-5'} cursor-pointer transition-all hover:scale-[1.02] group`}
            title="Open Student Cohort Explorer"
          >
            <div>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="uppercase tracking-wider group-hover:text-[#00F0FF] transition-colors">ENROLLED STUDENTS</span>
                <Users className={`w-4 h-4 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-white' : 'text-black'} font-mono tabular-nums`}>
                <AnimatedNumber value={totalStudents} />
              </div>
            </div>
            <span className={`text-[11px] ${isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-semibold'} block mt-2 group-hover:underline`}>
              Open Cohort Directory →
            </span>
          </div>
        </StaggerItem>

        {/* Card 2: Published Assessments */}
        <StaggerItem className="h-full">
          <div className={`h-full flex flex-col justify-between ${isDark ? 'bg-[#0A0D14]/85 border-white/10 text-white' : 'bg-white border-slate-200 text-black shadow-md'} rounded-2xl border shadow-xs backdrop-blur-md ${density === 'compact' ? 'p-4' : 'p-5'}`}>
            <div>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="uppercase tracking-wider">EXAMINATIONS</span>
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#10B981]' : 'text-emerald-600'}`} />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-[#10B981]' : 'text-emerald-700'} font-mono tabular-nums flex items-baseline gap-1`}>
                <AnimatedNumber value={publishedAssessments} />
                <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  / {totalAssessments} Total
                </span>
              </div>
            </div>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} block mt-2`}>
              {draftAssessments} drafts in builder
            </span>
          </div>
        </StaggerItem>

        {/* Card 3: Generated Question Content */}
        <StaggerItem className="h-full">
          <div className={`h-full flex flex-col justify-between ${isDark ? 'bg-[#0A0D14]/85 border-white/10 text-white' : 'bg-white border-slate-200 text-black shadow-md'} rounded-2xl border shadow-xs backdrop-blur-md ${density === 'compact' ? 'p-4' : 'p-5'}`}>
            <div>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="uppercase tracking-wider">QUESTION POOL</span>
                <BrainCircuit className={`w-4 h-4 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-[#00F0FF]' : 'text-blue-700'} font-mono tabular-nums flex items-baseline gap-1`}>
                <AnimatedNumber value={totalQuestions} />
                <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Items</span>
              </div>
            </div>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} block mt-2`}>
              {approvedQuestions} approved · {pendingQuestions} in review
            </span>
          </div>
        </StaggerItem>

        {/* Card 4: Evaluated Submissions */}
        <StaggerItem className="h-full">
          <div className={`h-full flex flex-col justify-between ${isDark ? 'bg-[#0A0D14]/85 border-white/10 text-white' : 'bg-white border-slate-200 text-black shadow-md'} rounded-2xl border shadow-xs backdrop-blur-md ${density === 'compact' ? 'p-4' : 'p-5'}`}>
            <div>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="uppercase tracking-wider">EVALUATIONS</span>
                <ClipboardList className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-purple-400' : 'text-purple-700'} font-mono tabular-nums flex items-baseline gap-1`}>
                <AnimatedNumber value={totalSubmissions} />
                <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Done</span>
              </div>
            </div>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} block mt-2`}>
              {passedSubmissions} passed · Proctor verified
            </span>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Sections: Question Generation Panel & Student Performance */}
      <StaggerContainer className="space-y-6">
        {/* AI Question Synthesis Panel */}
        <StaggerItem>
          <div className={`${isDark ? 'bg-[#0A0D14]/90 border-white/10' : 'bg-white border-slate-200 shadow-md'} p-6 sm:p-7 rounded-2xl border space-y-5 backdrop-blur-md`}>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} gap-2`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-700'} border flex items-center justify-center font-bold text-xs`}>
                  AI
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Document-to-Assessment Synthesis Panel
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Decompose uploaded curriculum PDFs into Bloom-calibrated items with validated rationales
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-mono font-semibold ${isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-bold'} self-start sm:self-auto`}>
                BLOOM TAXONOMY ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ready Material Box */}
              <div className={`p-5 rounded-xl ${isDark ? 'bg-purple-950/20 border-purple-500/30' : 'bg-purple-50/70 border-purple-200'} border space-y-3 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isDark ? 'text-purple-200' : 'text-purple-900'}`}>
                      Active Material: {materials[0]?.fileName || 'Course Syllabus'}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-[#10B981]' : 'text-emerald-700'}`}>
                      PROCESSED
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                    {materials[0]?.structuredConcepts?.length || 2} topics decomposed into concepts, definitions, and learning objectives.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={onOpenGenerateModal}
                    className="px-4 py-2 text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Generate 5 Items</span>
                  </button>
                  <button
                    onClick={() => onNavigate('materials')}
                    className={`px-3.5 py-2 text-xs font-semibold ${isDark ? 'text-slate-300 hover:text-white border-white/10 hover:bg-white/5' : 'text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-100'} border rounded-xl transition-colors cursor-pointer`}
                  >
                    Knowledge Tree
                  </button>
                </div>
              </div>

              {/* Assessment Builder Callout */}
              <div className={`p-5 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'} flex flex-col justify-between space-y-3`}>
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${isDark ? 'text-[#10B981]' : 'text-emerald-600'}`} />
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      Configure Proctored Exam
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} mt-1`}>
                    Configure randomized question pools, time allocations, and Assessment Lock Mode proctoring safeguards.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('create-assessment')}
                  className="px-4 py-2 text-xs font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all cursor-pointer self-start active:scale-95 flex items-center gap-1.5"
                >
                  <span>Launch Assessment Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Student Performance Table */}
        <StaggerItem>
          <div className={`${isDark ? 'bg-[#0A0D14]/85 border-white/10' : 'bg-white border-slate-200 shadow-md'} rounded-2xl border p-6 space-y-4 backdrop-blur-md`}>
            <div className={`flex items-center justify-between pb-3.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <BarChart2 className={`w-4 h-4 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  Recent Examination Submissions
                </h3>
                <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} ml-2`}>
                  {attempts.length} Total Submissions
                </span>
              </div>
              <button
                type="button"
                onClick={() => (onViewSubmissions ? onViewSubmissions() : onNavigate('assessments'))}
                className={`text-xs font-bold ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'} hover:underline cursor-pointer flex items-center gap-1`}
              >
                <span>View Submissions Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-600 font-semibold'} font-mono text-[10px] uppercase tracking-wider`}>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Assessment</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Integrity</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5 text-slate-300' : 'divide-slate-200 text-slate-700'} text-xs`}>
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No student submissions recorded yet. Completed examinations will appear here in real-time.
                      </td>
                    </tr>
                  ) : (
                    attempts.map((att, idx) => (
                      <tr
                        key={`${att.attemptId || 'att'}-${att.studentId || ''}-${idx}`}
                        onClick={() => (onViewSubmissions ? onViewSubmissions(att.assessmentId, att.attemptId) : onNavigate('assessments'))}
                        className={`${isDark ? 'hover:bg-white/10' : 'hover:bg-blue-50/60'} transition-colors cursor-pointer group`}
                        title="Click to view student submission and answers in Roster"
                      >
                        <td className={`py-3 px-3 font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                          {att.studentName}
                        </td>
                        <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {att.assessmentTitle}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold tabular-nums">
                          <span className={(att.percentage ?? 0) >= 70 ? (isDark ? 'text-[#10B981]' : 'text-emerald-700 font-bold') : 'text-rose-500 font-bold'}>
                            {att.percentage ?? 0}%
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className={`${isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-semibold'} flex items-center gap-1.5`}>
                            <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
                            <span>{Math.max(100 - (att.proctoringViolationsCount || 0) * 15, 0)}% Verified</span>
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              att.passed
                                ? isDark ? 'text-[#10B981]' : 'text-emerald-700'
                                : 'text-rose-500'
                            }`}
                          >
                            {att.passed ? 'PASSED' : 'REMEDIATION'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* AI Quick Notes & Handouts Modal for Teachers */}
      <QuickNotesModal
        isOpen={quickNotesOpen}
        onClose={() => setQuickNotesOpen(false)}
        initialTopic="Algorithms & Data Structures Review Handout"
        role="teacher"
        onStartPractice={() => {}}
      />
    </div>
  );
};
