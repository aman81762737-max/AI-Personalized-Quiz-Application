import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Clock,
  Target,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { aiService } from '../../../services/aiService';
import { RoadmapTrack } from '../../../types/roadmap';
import { useToast } from '../../common/Toast';

interface GenerateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapGenerated: (roadmap: RoadmapTrack) => void;
}

export const GenerateRoadmapModal: React.FC<GenerateRoadmapModalProps> = ({
  isOpen,
  onClose,
  onRoadmapGenerated,
}) => {
  const [targetGoal, setTargetGoal] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [targetWeeks, setTargetWeeks] = useState(8);
  const [additionalContext, setAdditionalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const suggestions = [
    'Rust Systems Programming & WebAssembly',
    'Google L5 Senior SRE Interview Prep',
    'Autonomous AI Agents with LangGraph & RAG',
    'Full-Stack Next.js 15, Drizzle & Microservices',
    'Reverse Engineering & Binary Exploitation',
    'High-Frequency Distributed Trading Systems',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGoal.trim()) {
      showToast('Please specify a target goal or technology focus.', 'error');
      return;
    }

    setLoading(true);
    try {
      showToast('Synthesizing custom roadmap with Gemini...', 'info');
      const roadmap = await aiService.generateCustomRoadmap({
        targetGoal: targetGoal.trim(),
        skillLevel,
        weeklyHours,
        targetWeeks,
        additionalContext: additionalContext.trim(),
      });

      showToast(`Custom roadmap "${roadmap.title}" created successfully!`, 'success');
      onRoadmapGenerated(roadmap);
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to generate custom roadmap', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#090D14] border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 block">
                GEMINI AI SYLLABUS ENGINE
              </span>
              <h2 className="text-xl font-bold font-serif text-white tracking-tight">
                Synthesize Custom Learning Roadmap
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Target Goal Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wide text-slate-300 block uppercase">
              Target Goal, Skill or Career Role *
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. Distributed Consensus Systems in Go, or Machine Learning Ops"
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#00F0FF] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-colors"
              disabled={loading}
              required
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTargetGoal(s)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  disabled={loading}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wide text-slate-300 block uppercase">
              Current Competency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
                    skillLevel === level
                      ? 'bg-purple-500 text-white font-bold border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                  disabled={loading}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Hours & Timeline Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-wide text-slate-300 block uppercase flex items-center justify-between">
                <span>Weekly Commitment</span>
                <span className="text-[#00F0FF] font-bold">{weeklyHours} hrs/week</span>
              </label>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-[#00F0FF] cursor-pointer"
                disabled={loading}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Casual (3h)</span>
                <span>Standard (10h)</span>
                <span>Intensive (30h)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-wide text-slate-300 block uppercase flex items-center justify-between">
                <span>Target Timeline</span>
                <span className="text-purple-400 font-bold">{targetWeeks} Weeks</span>
              </label>
              <input
                type="range"
                min="2"
                max="24"
                step="2"
                value={targetWeeks}
                onChange={(e) => setTargetWeeks(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
                disabled={loading}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Sprint (2w)</span>
                <span>Term (8w)</span>
                <span>Semester (24w)</span>
              </div>
            </div>
          </div>

          {/* Optional Constraints */}
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wide text-slate-300 block uppercase">
              Specialized Focus / Prerequisites (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g. Focus on practical projects over pure theory, or skip foundational Python."
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-purple-400 focus:outline-none text-white text-xs placeholder:text-slate-500 transition-colors resize-none"
              disabled={loading}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs font-mono tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Visual Nodes with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GENERATE CUSTOM VISUAL ROADMAP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
