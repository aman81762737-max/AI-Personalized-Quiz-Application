import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Lightbulb, HelpCircle, ShieldCheck } from 'lucide-react';
import { AIIntervention } from '../../types/aiMonitor';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from './Toast';

interface RemedialDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  intervention: AIIntervention | null;
  onResolve: (interventionId: string) => void;
}

export const RemedialDrillModal: React.FC<RemedialDrillModalProps> = ({
  isOpen,
  onClose,
  intervention,
  onResolve,
}) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen || !intervention) return null;

  const drill = intervention.remedialQuestion;
  const isCorrect = selectedOption && drill && selectedOption.trim() === drill.correctAnswer.trim();

  const handleSelect = (option: string) => {
    if (hasSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      showToast('Please select an option before checking.', 'warning');
      return;
    }
    setHasSubmitted(true);
  };

  const handleFinish = () => {
    onResolve(intervention.id);
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowHint(false);
    onClose();
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-2xl rounded-3xl border ${
          isDark ? 'bg-[#0A0E17] border-[#00F0FF]/30 text-white shadow-[0_0_50px_rgba(0,240,255,0.2)]' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        } overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b ${
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00F0FF]">
                  Atom AI Remedial Drill
                </span>
                <span className="text-xs text-slate-400">· 1-Minute Concept Recovery</span>
              </div>
              <h3 className="text-base font-bold leading-tight mt-0.5">
                Mastering {intervention.topic}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'} transition-colors cursor-pointer`}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Mental Model & Analogy Banner */}
          {intervention.plainAnalogy && (
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#0D1524] border-white/10 text-slate-200' : 'bg-blue-50/70 border-blue-200 text-slate-800'
              } flex items-start gap-3`}
            >
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Intuitive Mental Model
                </span>
                <p className="text-xs leading-relaxed font-sans">{intervention.plainAnalogy}</p>
              </div>
            </div>
          )}

          {/* Drill Question */}
          {drill ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Targeted Challenge
                  </span>
                  {drill.hint && (
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'View Hint'}</span>
                    </button>
                  )}
                </div>
                <h4 className="text-sm font-semibold leading-relaxed">
                  {drill.questionText}
                </h4>

                {showHint && drill.hint && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    isDark ? 'bg-white/[0.03] border-white/10 text-[#00F0FF]' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <span className="font-bold">Hint: </span>
                    {drill.hint}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {drill.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isOptionCorrect = option.trim() === drill.correctAnswer.trim();

                  let style = isDark
                    ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (hasSubmitted) {
                    if (isOptionCorrect) {
                      style = isDark
                        ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                    } else if (isSelected && !isOptionCorrect) {
                      style = isDark
                        ? 'bg-rose-950/40 border-rose-500/70 text-rose-300'
                        : 'bg-rose-50 border-rose-300 text-rose-900';
                    }
                  } else if (isSelected) {
                    style = isDark
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-blue-50 border-blue-600 text-blue-900 font-semibold';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(option)}
                      disabled={hasSubmitted}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {hasSubmitted && isOptionCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {hasSubmitted && isSelected && !isOptionCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Explanation */}
              {hasSubmitted && (
                <div
                  className={`p-4 rounded-2xl border ${
                    isCorrect
                      ? isDark ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isDark ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                  } space-y-1.5 animate-fadeIn`}
                >
                  <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider">
                    {isCorrect ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Concept Verified & Mastered!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Almost! Let's review the rule</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed font-sans">{drill.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Loading tailored concept challenge...</p>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`p-5 border-t ${
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'
          } flex items-center justify-between gap-3`}
        >
          <div className="text-[11px] font-mono text-slate-400">
            {hasSubmitted
              ? isCorrect
                ? 'Ready to clear learning gap'
                : 'Review the explanation and retry'
              : 'Select your answer to verify understanding'}
          </div>

          <div className="flex items-center gap-2">
            {!hasSubmitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                Verify Answer
              </button>
            ) : isCorrect ? (
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-black bg-[#10B981] hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95"
              >
                <span>Clear Gap & Update Mastery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl font-mono text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                Retry Drill
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
