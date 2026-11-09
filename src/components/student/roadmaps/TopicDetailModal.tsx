import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Target,
  Sparkles,
  Layers,
  ArrowRight,
  Circle,
  PlayCircle,
} from 'lucide-react';
import { RoadmapTopic, TopicStatus } from '../../../types/roadmap';
import { useTheme } from '../../../context/ThemeContext';

interface TopicDetailModalProps {
  topic: RoadmapTopic | null;
  onClose: () => void;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onLaunchDrill?: (topicTitle: string) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  onClose,
  onUpdateStatus,
  onLaunchDrill,
}) => {
  const { isDark } = useTheme();
  if (!topic) return null;

  const currentStatus: TopicStatus = topic.status || 'not_started';

  const statusThemes = {
    not_started: {
      label: 'Not Started',
      color: 'text-slate-400 bg-white/5 border-white/10',
      icon: Circle,
    },
    in_progress: {
      label: 'In Progress',
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      icon: Clock,
    },
    completed: {
      label: 'Completed',
      color: 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/30',
      icon: CheckCircle2,
    },
  };

  const difficultyColors = {
    Beginner: 'text-[#00FF88]',
    Intermediate: 'text-amber-400',
    Advanced: 'text-purple-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-2xl ${isDark ? 'bg-[#090D14] border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'} border rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Modal Header */}
        <div className={`p-6 border-b ${isDark ? 'border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-transparent' : 'border-slate-200 bg-slate-50/80'} flex items-start justify-between gap-4`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono tracking-widest uppercase">
              <span className={isDark ? "text-[#00F0FF]" : "text-blue-600 font-bold"}>{topic.category}</span>
              <span className={isDark ? "text-white/20" : "text-slate-300"}>·</span>
              <span className={difficultyColors[topic.difficulty] || (isDark ? 'text-slate-300' : 'text-slate-700')}>
                {topic.difficulty}
              </span>
              <span className={isDark ? "text-white/20" : "text-slate-300"}>·</span>
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}>
                <Clock className="w-3 h-3" />
                ~{topic.estimatedHours} hours
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              {topic.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl ${isDark ? 'bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'} transition-colors cursor-pointer`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 space-y-7 overflow-y-auto custom-scrollbar">
          {/* Status Progression Bar */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              TOPIC PROGRESSION STATUS
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['not_started', 'in_progress', 'completed'] as TopicStatus[]).map((st) => {
                const isActive = currentStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(topic.id, st)}
                    className={`p-3 rounded-2xl border text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? st === 'completed'
                          ? 'bg-[#00FF88] text-black font-bold border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                          : st === 'in_progress'
                          ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : isDark
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-slate-900 text-white font-bold border-slate-900 shadow-sm'
                        : isDark
                        ? 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {st === 'in_progress' && <Clock className="w-3.5 h-3.5" />}
                    {st === 'not_started' && <Circle className="w-3.5 h-3.5" />}
                    <span className="capitalize">{st.replace('_', ' ')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Theory & Learning Invariants */}
          <div className="space-y-2">
            <span className={`text-[10px] font-mono tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase block`}>
              CONCEPTUAL OVERVIEW & INVARIANTS
            </span>
            <p className={`text-sm ${isDark ? 'text-slate-200 bg-white/[0.02] border-white/[0.06]' : 'text-slate-700 bg-slate-50 border-slate-200'} leading-relaxed font-sans p-4 rounded-2xl border whitespace-pre-line`}>
              {topic.description}
            </p>
          </div>

          {/* Curated Video Tutorials */}
          {topic.resources.filter((r) => r.type === 'video').length > 0 && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 ${isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-bold'}`}>
                <Video className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  RECOMMENDED VIDEO LECTURES & WALKTHROUGHS
                </span>
              </div>
              <div className="space-y-2.5">
                {topic.resources
                  .filter((r) => r.type === 'video')
                  .map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3.5 rounded-2xl ${
                        isDark
                          ? 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/15'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                      } border flex items-center justify-between gap-3 group transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                          <PlayCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isDark ? 'text-white group-hover:text-[#00F0FF]' : 'text-slate-900 group-hover:text-blue-600'} transition-colors`}>
                            {res.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {res.provider} {res.durationOrReadTime ? `· ${res.durationOrReadTime}` : ''}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'} shrink-0 transition-colors`} />
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Curated Articles & Documentation */}
          {topic.resources.filter((r) => r.type === 'article' || r.type === 'doc').length > 0 && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 ${isDark ? 'text-[#10B981]' : 'text-emerald-700 font-bold'}`}>
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  VERIFIED ARTICLES & OFFICIAL DOCUMENTATION
                </span>
              </div>
              <div className="space-y-2.5">
                {topic.resources
                  .filter((r) => r.type === 'article' || r.type === 'doc')
                  .map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3.5 rounded-2xl ${
                        isDark
                          ? 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/15'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                      } border flex items-center justify-between gap-3 group transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isDark ? 'text-white group-hover:text-[#10B981]' : 'text-slate-900 group-hover:text-emerald-700'} transition-colors`}>
                            {res.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {res.provider} {res.durationOrReadTime ? `· ${res.durationOrReadTime}` : ''}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'} shrink-0 transition-colors`} />
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className={`p-5 border-t ${isDark ? 'border-white/[0.08] bg-[#07090E]' : 'border-slate-200 bg-slate-50'} flex items-center justify-between gap-4`}>
          <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Status: <span className={`${isDark ? 'text-white' : 'text-slate-900 font-bold'} capitalize`}>{currentStatus.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-3">
            {onLaunchDrill && (
              <button
                type="button"
                onClick={() => {
                  onLaunchDrill(topic.title);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:scale-[1.02]"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Launch Practice Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
