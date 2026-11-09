import React, { useState } from 'react';
import { Assessment, AssessmentAttempt } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AssessmentInstructionsModal } from './AssessmentInstructionsModal';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Play,
  Sparkles,
  ShieldCheck,
  Target,
  FileText,
} from 'lucide-react';

interface StudentAssessmentsViewProps {
  assessments: Assessment[];
  attempts: AssessmentAttempt[];
  onStartExam: (assessment: Assessment) => void;
}

export const StudentAssessmentsView: React.FC<StudentAssessmentsViewProps> = ({
  assessments,
  attempts,
  onStartExam,
}) => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const [selectedForModal, setSelectedForModal] = useState<Assessment | null>(null);

  const published = assessments.filter((a) => a.status === 'published');

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Tactical HUD Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <div className={`flex items-center gap-2 mb-1.5 text-xs font-mono ${isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-bold'}`}>
            <Target className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase">ACADEMIC EVALUATION CORRIDOR</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My Academic Assessments
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 leading-relaxed`}>
            Calibrated examinations, Bloom-indexed diagnostic checkpoints, and continuous competency drills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-2 rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'} border backdrop-blur-md flex items-center gap-2 text-xs font-mono`}>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>PUBLISHED:</span>
            <span className={`${isDark ? 'text-[#00F0FF]' : 'text-blue-600'} font-bold tabular-nums`}>{published.length} ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Grid of Tactical HUD Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {published.map((asm, idx) => {
          const userAttempt = attempts.find(
            (a) =>
              a.assessmentId === asm.assessmentId &&
              (!userProfile?.userId ||
                a.studentId === userProfile.userId ||
                a.studentId === 'student' ||
                a.studentId === 'student-01')
          );
          const isSubmitted = userAttempt?.status === 'submitted';

          return (
            <div
              key={`${asm.assessmentId}-${idx}`}
              className={`rounded-2xl border ${
                isSubmitted
                  ? isDark
                    ? 'border-[#10B981]/30 bg-[#0A0D14]/85 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                    : 'border-emerald-200 bg-white shadow-sm'
                  : isDark
                    ? 'border-white/10 bg-[#0A0D14]/80 hover:border-[#00F0FF]/40 shadow-xl'
                    : 'border-slate-200 bg-white hover:border-blue-400 shadow-sm hover:shadow-md'
              } p-6 sm:p-7 flex flex-col justify-between backdrop-blur-md transition-all duration-200 group space-y-5`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`px-2.5 py-1 rounded-md ${
                    isDark ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                  } border font-bold uppercase tracking-wider`}>
                    {asm.subject}
                  </span>
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono text-[11px] tabular-nums`}>
                    1 ATTEMPT LIMIT
                  </span>
                </div>

                <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight leading-snug group-hover:text-[#00F0FF] transition-colors`}>
                  {asm.title}
                </h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} line-clamp-2 leading-relaxed`}>
                  {asm.description}
                </p>

                {/* Topics Matrix */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-mono">
                  {asm.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded ${
                        isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      } border text-[11px]`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assessment Telemetry & Actions */}
              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} space-y-4`}>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} border`}>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>TIME</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} tabular-nums`}>{asm.durationMinutes}m</div>
                  </div>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} border`}>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>ITEMS</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} tabular-nums`}>{asm.questionCount}</div>
                  </div>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} border`}>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>PASS</div>
                    <div className={`font-bold ${isDark ? 'text-[#10B981]' : 'text-emerald-600'} tabular-nums`}>{asm.passingPercentage}%</div>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-xs font-mono font-bold ${isDark ? 'text-[#10B981]' : 'text-emerald-600'} flex items-center gap-1.5`}>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span className="tabular-nums">COMPLETED ({userAttempt.percentage}%)</span>
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold ${
                      isDark ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-500'
                    }`}>
                      1/1 Attempt Used
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedForModal(asm)}
                    className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Launch Assessment</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedForModal && (
        <AssessmentInstructionsModal
          assessment={selectedForModal}
          isOpen={!!selectedForModal}
          onClose={() => setSelectedForModal(null)}
          onConfirmStart={(asm) => {
            setSelectedForModal(null);
            onStartExam(asm);
          }}
        />
      )}
    </div>
  );
};
