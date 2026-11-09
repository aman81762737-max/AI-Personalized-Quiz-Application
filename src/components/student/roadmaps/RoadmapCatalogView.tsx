import React, { useState } from 'react';
import {
  Compass,
  Binary,
  Globe,
  Server,
  Brain,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Trash2,
  Cloud,
  ShieldCheck,
  Cpu,
  Lock,
} from 'lucide-react';
import { DetailedRoadmap } from '../../../data/detailedRoadmapsData';
import { useTheme } from '../../../context/ThemeContext';

interface RoadmapCatalogViewProps {
  roadmaps: DetailedRoadmap[];
  onSelectRoadmap: (roadmap: DetailedRoadmap) => void;
  onOpenAiGenerator: () => void;
  onDeleteCustomRoadmap?: (roadmapId: string) => void;
  topicStatuses?: Record<string, string>;
}

export const RoadmapCatalogView: React.FC<RoadmapCatalogViewProps> = ({
  roadmaps,
  onSelectRoadmap,
  onOpenAiGenerator,
  onDeleteCustomRoadmap,
  topicStatuses = {},
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'software' | 'web' | 'ai' | 'devops-security' | 'custom'
  >('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Binary':
        return <Binary className="w-6 h-6 text-[#00F0FF]" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-[#10B981]" />;
      case 'Server':
        return <Server className="w-6 h-6 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-cyan-400" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-purple-400" />;
      case 'Cloud':
        return <Cloud className="w-6 h-6 text-sky-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-rose-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#00F0FF]" />;
    }
  };

  const filteredRoadmaps = roadmaps.filter((rm) => {
    const matchesSearch =
      !searchQuery.trim() ||
      rm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'software' && (rm.id === 'cs' || rm.badge.includes('Academic'))) ||
      (selectedCategory === 'web' && (rm.id === 'frontend' || rm.id === 'backend' || rm.id === 'fullstack')) ||
      (selectedCategory === 'ai' && (rm.id === 'ai-ml' || rm.title.includes('AI') || rm.title.includes('Machine Learning'))) ||
      (selectedCategory === 'devops-security' && (rm.id === 'devops' || rm.id === 'cybersecurity')) ||
      (selectedCategory === 'custom' && rm.isCustom);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Section Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono tracking-[0.25em] ${isDark ? 'text-[#00F0FF]' : 'text-slate-800 font-bold'} uppercase`}>
              ROADMAP.SH BROWSE DIRECTORY · DEFAULT ROADMAP CATALOG
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-serif font-bold ${isDark ? 'text-white' : 'text-black'} tracking-tight mt-1`}>
            Explore Detailed Interactive Roadmaps
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} mt-0.5`}>
            Select a specialized career or technical track to launch its full-scale, movable Unity Shader Graph flowchart.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAiGenerator}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-semibold text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>ASK AI TO CREATE ROADMAP</span>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roadmaps (e.g. Computer Science, AI, Backend)..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl ${isDark ? 'bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-black placeholder:text-slate-500 shadow-xs'} focus:border-[#00F0FF] focus:outline-none text-xs transition-colors`}
          />
        </div>

        {/* Categories */}
        <div className={`flex items-center gap-1.5 p-1 ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-100 border-slate-200'} rounded-2xl border self-start sm:self-auto shrink-0 flex-wrap`}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? (isDark ? 'bg-white text-black font-bold' : 'bg-slate-900 text-white font-bold shadow-xs')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black font-medium')
            }`}
          >
            All Tracks ({roadmaps.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('software')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              selectedCategory === 'software'
                ? 'bg-[#00F0FF] text-black font-bold'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black font-medium')
            }`}
          >
            CS & Algorithms
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('web')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              selectedCategory === 'web'
                ? 'bg-[#10B981] text-black font-bold'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black font-medium')
            }`}
          >
            Web (Frontend, Backend, Full-Stack)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('ai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              selectedCategory === 'ai'
                ? 'bg-purple-400 text-black font-bold'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black font-medium')
            }`}
          >
            AI Engineer
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('devops-security')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              selectedCategory === 'devops-security'
                ? 'bg-amber-400 text-black font-bold'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black font-medium')
            }`}
          >
            DevOps & Cyber Security
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              selectedCategory === 'custom'
                ? 'bg-indigo-500 text-white font-bold'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black font-medium')
            }`}
          >
            AI Custom
          </button>
        </div>
      </div>

      {/* Catalog Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoadmaps.map((rm, rmIdx) => {
          // Calculate completed nodes for this roadmap
          const totalNodes = rm.nodes.length;
          const completedNodes = rm.nodes.filter(
            (n) => topicStatuses[n.id] === 'completed'
          ).length;
          const percent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

          return (
            <div
              key={`${rm.id || 'rm'}-${rmIdx}`}
              onClick={() => onSelectRoadmap(rm)}
              className={`p-6 sm:p-7 rounded-3xl ${
                isDark
                  ? 'bg-[#0B0F17]/80 hover:bg-[#0E131E] border-white/[0.08]'
                  : 'bg-white hover:bg-slate-50/90 border-slate-200 shadow-md hover:shadow-lg'
              } border hover:border-[#00F0FF]/40 backdrop-blur-xl transition-all duration-300 cursor-pointer flex flex-col justify-between gap-6 group relative overflow-hidden`}
            >
              {/* Subtle Refraction Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/[0.02] via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100 border-slate-200'} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    {getIcon(rm.iconName)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase border ${isDark ? 'border-white/10 bg-white/[0.03] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                      {rm.badge}
                    </span>
                    {rm.isCustom && onDeleteCustomRoadmap && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomRoadmap(rm.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete custom roadmap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className={`text-xl font-bold font-serif ${isDark ? 'text-white' : 'text-black'} group-hover:text-[#00F0FF] transition-colors tracking-tight`}>
                    {rm.title}
                  </h3>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'} mt-0.5`}>
                    {rm.tagline}
                  </div>
                </div>

                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} font-sans leading-relaxed line-clamp-3`}>
                  {rm.description}
                </p>
              </div>

              {/* Card Footer: Metrics & Launch Trigger */}
              <div className={`space-y-3 pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'} relative z-10`}>
                <div className={`flex items-center justify-between text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                      {rm.nodes.length} Nodes
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                      ~{rm.estimatedWeeks} Weeks
                    </span>
                  </div>

                  <span className={`${isDark ? 'text-[#00FF88]' : 'text-emerald-700 font-bold'}`}>
                    {completedNodes}/{totalNodes} Done ({percent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className={`w-full h-1 ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r from-[#00F0FF] to-[#00FF88] rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Movable Unity Shader Graph</span>
                  <span className={`${isDark ? 'text-[#00F0FF]' : 'text-black'} group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold`}>
                    <span>Launch Graph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
