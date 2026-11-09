import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, XCircle, AlertCircle, Sparkles, BookOpen, Target, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface QuestionDetailData {
  questionText: string;
  topic: string;
  subtopic?: string;
  options?: string[];
  submittedAnswer?: string;
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
  bloomLevel?: string;
  accuracyRate?: number;
}

interface QuestionDetailModalProps {
  isOpen: boolean;
  question: QuestionDetailData | null;
  onClose: () => void;
  onPracticeTopic?: (topic: string) => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  isOpen,
  question,
  onClose,
  onPracticeTopic,
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !question) return null;

  const options = question.options && question.options.length > 0
    ? question.options
    : ['Option A', 'Option B', 'Option C', 'Option D'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl ${
            isDark
              ? 'bg-[#0B0F17] text-white border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)]'
              : 'bg-white text-slate-900 border border-slate-200 shadow-2xl'
          } p-6 sm:p-8 space-y-6 z-10`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono mb-1.5">
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  isDark ? 'bg-[#00F0FF]/15 text-[#00F0FF]' : 'bg-blue-50 text-blue-700'
                }`}>
                  {question.topic}
                </span>
                {question.subtopic && (
                  <>
                    <span className="opacity-40">→</span>
                    <span className="font-semibold text-slate-300">{question.subtopic}</span>
                  </>
                )}
                {question.difficulty && (
                  <span className="opacity-60 capitalize">· {question.difficulty}</span>
                )}
              </div>
              <h3 className="text-lg font-bold tracking-tight">
                Original Question Inspection
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              } transition-colors cursor-pointer`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question Text */}
          <div className={`p-4 rounded-2xl ${
            isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-slate-50 border border-slate-200'
          } space-y-2`}>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Question Stem</span>
            </div>
            <p className="text-sm sm:text-base font-semibold leading-relaxed">
              {question.questionText}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Multiple Choice Options
            </div>
            <div className="space-y-2">
              {options.map((opt, idx) => {
                const isCorrect = opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                const isSubmitted = question.submittedAnswer && opt.trim().toLowerCase() === question.submittedAnswer.trim().toLowerCase();

                let borderStyle = isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white';
                if (isCorrect) {
                  borderStyle = isDark
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold';
                } else if (isSubmitted && !isCorrect) {
                  borderStyle = isDark
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                    : 'border-rose-300 bg-rose-50 text-rose-900';
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${borderStyle} flex items-center justify-between gap-3 text-xs sm:text-sm transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500 text-black'
                          : isSubmitted
                          ? 'bg-rose-500 text-white'
                          : isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct Key</span>
                        </span>
                      )}
                      {isSubmitted && !isCorrect && (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-4 h-4" />
                          <span>Submitted</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pedagogical Explanation & Rationale */}
          <div className={`p-4 sm:p-5 rounded-2xl ${
            isDark ? 'bg-purple-950/20 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
          } space-y-2`}>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pedagogical Analysis & Misconception Breakdown</span>
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-purple-200' : 'text-purple-950'} leading-relaxed`}>
              {question.explanation}
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold ${
                isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              } transition-colors cursor-pointer`}
            >
              Close Inspection
            </button>

            {onPracticeTopic && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPracticeTopic(question.topic);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#00F0FF] text-black shadow-md hover:bg-[#38bdf8] transition-all cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Launch Practice Drill on {question.topic}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
