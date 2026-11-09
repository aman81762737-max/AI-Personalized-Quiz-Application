import React from 'react';
import { Sparkles, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
import { AIIntervention } from '../../types/aiMonitor';
import { useTheme } from '../../context/ThemeContext';

interface InlineAIInterventionProps {
  intervention: AIIntervention;
  onLaunchPractice: () => void;
  onDismiss?: () => void;
}

export const InlineAIIntervention: React.FC<InlineAIInterventionProps> = ({
  intervention,
  onLaunchPractice,
  onDismiss,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`p-4 rounded-2xl border transition-all animate-fadeIn ${
        isDark
          ? 'bg-[#0E1524] border-[#00F0FF]/30 text-white shadow-[0_0_25px_rgba(0,240,255,0.15)]'
          : 'bg-blue-50/90 border-blue-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isDark
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                : 'bg-blue-600 text-white shadow-xs'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F0FF]">
                AI Coach Intervention
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                · {intervention.topic}
              </span>
            </div>
            <h4 className="text-xs font-semibold mt-0.5">
              {intervention.misconception}
            </h4>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} cursor-pointer px-1`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Real-World Plain Analogy */}
      {intervention.plainAnalogy && (
        <div
          className={`mt-3 p-3 rounded-xl flex items-start gap-2.5 text-xs ${
            isDark ? 'bg-black/30 border border-white/10 text-slate-200' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[11px] uppercase tracking-wide text-amber-400 block font-mono">
              Everyday Analogy:
            </span>
            <p className="leading-relaxed font-sans">{intervention.plainAnalogy}</p>
          </div>
        </div>
      )}

      {/* Suggested Action & 1-Click Practice Launch */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
          <span>{intervention.suggestedAction}</span>
        </div>

        <button
          onClick={onLaunchPractice}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold font-mono text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer shrink-0 self-start sm:self-auto active:scale-95"
        >
          <span>Practice Concept Now (1-Min Drill)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
