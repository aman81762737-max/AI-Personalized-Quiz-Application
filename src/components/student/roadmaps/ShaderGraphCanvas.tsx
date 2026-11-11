import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  Search,
  Sparkles,
  ChevronRight,
  Send,
  HelpCircle,
  Check,
  CheckSquare,
  BookOpen,
  X,
  Target,
  ExternalLink,
  Layers,
  ArrowDown,
  Compass,
  Filter,
} from 'lucide-react';
import { DetailedRoadmap } from '../../../data/detailedRoadmapsData';
import {
  getRoadmapShData,
  RoadmapShTrack,
  RoadmapShMilestone,
  RoadmapShTopicItem,
  RoadmapShGroupContainer,
  CANONICAL_ROADMAPS_SH,
} from '../../../data/roadmapShFormatData';
import { TopicDetailModal } from './TopicDetailModal';
import { RoadmapTopic, TopicStatus } from '../../../types/roadmap';
import { useToast } from '../../common/Toast';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { subscribeRoadmapProgress, saveRoadmapProgressToCloud } from '../../../services/cloudSyncService';

interface ShaderGraphCanvasProps {
  roadmap: DetailedRoadmap;
  allRoadmaps?: DetailedRoadmap[];
  onBackToCatalog: () => void;
  onSelectRoadmapId?: (roadmapId: string) => void;
  onLaunchDrill?: (topicTitle: string) => void;
  onOpenAiGenerator?: () => void;
}

const STORAGE_KEY_PROGRESS = 'roadmap_progress_v1';

// Available track switcher tabs
const TOP_TRACKS = [
  { id: 'ai-ml', title: 'AI Engineer' },
  { id: 'cs', title: 'Computer Science' },
  { id: 'frontend', title: 'Frontend' },
  { id: 'backend', title: 'Backend' },
  { id: 'fullstack', title: 'Full-Stack' },
  { id: 'devops', title: 'DevOps' },
  { id: 'cybersecurity', title: 'Cybersecurity' },
];

export const ShaderGraphCanvas: React.FC<ShaderGraphCanvasProps> = ({
  roadmap,
  allRoadmaps = [],
  onBackToCatalog,
  onSelectRoadmapId,
  onLaunchDrill,
  onOpenAiGenerator,
}) => {
  const { userProfile } = useAuth();
  const { isDark, customAITheme } = useTheme();
  const { showToast } = useToast();

  const [topicStatuses, setTopicStatuses] = useState<Record<string, TopicStatus>>({});
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);
  const [hoveredTopicId, setHoveredTopicId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Tutor sticky bar state
  const [aiTutorInput, setAiTutorInput] = useState('');
  const [aiTutorActiveAnswer, setAiTutorActiveAnswer] = useState<{
    query: string;
    answer: string;
    relatedTopic?: string;
  } | null>(null);
  const [isAiTutorThinking, setIsAiTutorThinking] = useState(false);

  // Convert roadmap into canonical roadmap.sh format
  const shData: RoadmapShTrack = useMemo(() => {
    return getRoadmapShData(roadmap);
  }, [roadmap]);

  // Load progress from localStorage and cloud sync
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        setTopicStatuses(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load roadmap status:', e);
    }

    const unsub = subscribeRoadmapProgress(userProfile?.userId || 'default_student', (data) => {
      if (data?.completedNodeIds && Array.isArray(data.completedNodeIds)) {
        setTopicStatuses((prev) => {
          const updated = { ...prev };
          data.completedNodeIds.forEach((id: string) => {
            updated[id] = 'completed';
          });
          return updated;
        });
      }
    });

    return () => unsub();
  }, [userProfile?.userId]);

  // Update status for a specific topic
  const updateTopicStatus = (topicId: string, status: TopicStatus) => {
    setTopicStatuses((prev) => {
      const updated = { ...prev, [topicId]: status };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
        const completedIds = Object.keys(updated).filter((k) => updated[k] === 'completed');
        saveRoadmapProgressToCloud(userProfile?.userId || 'default_student', completedIds, roadmap.id);
      } catch (e) {
        console.warn('Failed to save progress:', e);
      }
      return updated;
    });

    if (status === 'completed') {
      showToast('Marked as Done! Great job.', 'success');
    } else if (status === 'in_progress') {
      showToast('Set to Currently Learning.', 'info');
    } else {
      showToast('Status reset to unstarted.', 'info');
    }
  };

  // Extract all topics and milestones from current roadmap for statistics and search
  const allTopicsInTrack = useMemo(() => {
    const list: (RoadmapShTopicItem | { id: string; title: string; description: string; category: string; difficulty: any; estimatedHours: number; resources: any[] })[] = [];
    shData.milestones.forEach((m) => {
      // Include milestone itself as a clickable learning goal
      list.push({
        id: m.id,
        title: m.milestoneTitle,
        description: m.description,
        category: m.category,
        difficulty: m.difficulty,
        estimatedHours: m.estimatedHours,
        resources: m.resources,
      });
      if (m.fanOutRight) list.push(...m.fanOutRight);
      if (m.fanOutLeft) list.push(...m.fanOutLeft);
      if (m.leftContainer) {
        list.push(...m.leftContainer.topics);
        m.leftContainer.subGroups?.forEach((sg) => list.push(...sg.topics));
      }
      if (m.rightContainer) {
        list.push(...m.rightContainer.topics);
        m.rightContainer.subGroups?.forEach((sg) => list.push(...sg.topics));
      }
    });
    return list;
  }, [shData]);

  // Compute completion stats
  const stats = useMemo(() => {
    const total = allTopicsInTrack.length;
    let completed = 0;
    let inProgress = 0;

    allTopicsInTrack.forEach((t) => {
      const st = topicStatuses[t.id] || 'not_started';
      if (st === 'completed') completed++;
      else if (st === 'in_progress') inProgress++;
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, percent };
  }, [allTopicsInTrack, topicStatuses]);

  // Open TopicDetailModal for a topic
  const openTopicDetail = (item: RoadmapShTopicItem) => {
    const topicData: RoadmapTopic = {
      id: item.id,
      title: item.title,
      description: item.description || `Comprehensive, easy-to-understand breakdown of ${item.title}.`,
      category: item.category || 'Core Curriculum',
      estimatedHours: item.estimatedHours || 4,
      difficulty: item.difficulty || 'Intermediate',
      prerequisites: [],
      resources: item.resources && item.resources.length > 0 ? item.resources : [
        {
          title: `${item.title} Official Handbook & Specifications`,
          url: `https://www.google.com/search?q=${encodeURIComponent(item.title + ' tutorial guide')}`,
          type: 'doc',
          provider: 'Official Spec',
          durationOrReadTime: '15 min read',
        },
        {
          title: `${item.title} Comprehensive Video Walkthrough`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' tutorial')}`,
          type: 'video',
          provider: 'Video Lecture',
          durationOrReadTime: '20 mins',
        },
      ],
      status: topicStatuses[item.id] || 'not_started',
    };
    setSelectedTopic(topicData);
  };

  // Open Milestone Detail in TopicDetailModal
  const openMilestoneDetail = (m: RoadmapShMilestone) => {
    const topicData: RoadmapTopic = {
      id: m.id,
      title: m.milestoneTitle,
      description: m.description,
      category: m.category || 'Core Milestone',
      estimatedHours: m.estimatedHours || 8,
      difficulty: m.difficulty || 'Intermediate',
      prerequisites: [],
      resources: m.resources && m.resources.length > 0 ? m.resources : [
        {
          title: `${m.milestoneTitle} Masterclass Video Lecture`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(m.milestoneTitle + ' tutorial course lecture')}`,
          type: 'video',
          provider: 'Video Masterclass',
          durationOrReadTime: '30 mins',
        },
        {
          title: `${m.milestoneTitle} Official Specification & Handbook`,
          url: `https://www.google.com/search?q=${encodeURIComponent(m.milestoneTitle + ' official documentation guide')}`,
          type: 'doc',
          provider: 'Official Spec',
          durationOrReadTime: '20 min read',
        },
      ],
      status: topicStatuses[m.id] || 'not_started',
    };
    setSelectedTopic(topicData);
  };

  // Scroll smoothly to milestone
  const scrollToMilestone = (mId: string) => {
    const el = document.getElementById(mId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle AI Tutor Ask
  const handleAiTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTutorInput.trim()) return;

    const query = aiTutorInput.trim();
    setIsAiTutorThinking(true);

    // Find if there is a matching topic in the roadmap
    const matched = allTopicsInTrack.find((t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
    );

    setTimeout(() => {
      setIsAiTutorThinking(false);
      setAiTutorActiveAnswer({
        query,
        answer: matched
          ? `In ${roadmap.title}, "${matched.title}" is a crucial component (${matched.difficulty} difficulty, ~${matched.estimatedHours}h). ${matched.description || ''} Study this concept in step ${matched.category || 'core'} before moving forward to dependent topics.`
          : `For "${query}" in ${roadmap.title}: Focus on how this integrates with the foundational concepts along the central spine. Check out the corresponding milestone notes and launch a quick drill to reinforce understanding.`,
        relatedTopic: matched?.title,
      });
      setAiTutorInput('');
    }, 400);
  };

  // Helper for topic matching search
  const isTopicMatch = (title: string, desc?: string) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || (desc && desc.toLowerCase().includes(q));
  };

  // Render an individual Topic Card with hover Action Pill (matching Image 2)
  const renderTopicCard = (item: RoadmapShTopicItem, fallbackKey?: string | number) => {
    const status = topicStatuses[item.id] || 'not_started';
    const isHovered = hoveredTopicId === item.id;
    const isMatched = isTopicMatch(item.title, item.description);

    // Topic Card Styling based on status and theme
    // Image 1/2 shows yellow rounded pill cards with black borders
    let cardClasses = '';
    if (status === 'completed') {
      cardClasses = isDark
        ? 'bg-[#0E281E] border-2 border-emerald-500/80 text-emerald-200'
        : 'bg-emerald-100 border-2 border-emerald-700 text-emerald-950 font-semibold';
    } else if (status === 'in_progress') {
      cardClasses = isDark
        ? 'bg-[#2E2007] border-2 border-amber-400 text-amber-200'
        : 'bg-amber-100 border-2 border-amber-600 text-amber-950 font-semibold';
    } else {
      // Default roadmap.sh style: warm yellow with solid border
      cardClasses = isDark
        ? 'bg-[#1C180E] hover:bg-[#252013] border-2 border-amber-400/50 hover:border-amber-400 text-amber-100'
        : 'bg-[#FEEA9A] hover:bg-[#FDE047] border-2 border-slate-900 text-slate-950 font-medium';
    }

    const itemKey = fallbackKey !== undefined ? `${item.id || 'topic'}-${fallbackKey}` : (item.id || 'topic');

    return (
      <div
        key={itemKey}
        className={`relative ${item.colSpan === 2 ? 'col-span-2' : 'col-span-1'} group`}
        onMouseEnter={() => setHoveredTopicId(item.id)}
        onMouseLeave={() => setHoveredTopicId(null)}
      >
        {/* Floating Action Pill Bar on Hover (Exact replica of Image 2: [ 📖 Learning | ✓ Done | ✕ Skip ]) */}
        {isHovered && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 bg-white text-slate-800 border-2 border-slate-900 rounded-lg shadow-xl px-1.5 py-0.5 font-sans text-[11px] whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateTopicStatus(item.id, 'in_progress');
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded hover:bg-amber-100 font-semibold cursor-pointer transition-colors ${
                status === 'in_progress' ? 'text-amber-700 font-bold' : 'text-slate-700'
              }`}
              title="Mark as currently learning"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Learning</span>
            </button>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateTopicStatus(item.id, 'completed');
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded hover:bg-emerald-100 font-semibold cursor-pointer transition-colors ${
                status === 'completed' ? 'text-emerald-700 font-bold' : 'text-slate-700'
              }`}
              title="Mark as completed"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Done</span>
            </button>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateTopicStatus(item.id, 'not_started');
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 font-semibold cursor-pointer transition-colors"
              title="Reset status"
            >
              <X className="w-3 h-3 text-slate-400" />
              <span>Skip</span>
            </button>
          </div>
        )}

        {/* The Topic Card Button */}
        <button
          type="button"
          onClick={() => openTopicDetail(item)}
          className={`w-full text-center px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer shadow-xs text-xs sm:text-[13px] leading-snug flex items-center justify-center gap-1.5 relative ${cardClasses} ${
            isMatched ? 'ring-3 ring-blue-500 scale-102 z-10' : ''
          }`}
          title={`${item.title} (Click to open deep resources & practice)`}
        >
          {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          {status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />}
          <span className="truncate">{item.title}</span>
        </button>
      </div>
    );
  };

  // Render a Group Container (matching "Core LLM Elements" or "Common Terminology" from Image 1)
  const renderGroupContainer = (container: RoadmapShGroupContainer) => {
    return (
      <div
        className={`w-full max-w-[340px] rounded-xl p-3 sm:p-4 border-2 ${
          isDark
            ? 'bg-[#0F141C] border-slate-700/80 shadow-2xl'
            : 'bg-white border-slate-900 shadow-md'
        }`}
      >
        {/* Container Header */}
        {container.groupTitle && (
          <h4
            className={`text-center font-bold text-xs sm:text-sm tracking-tight mb-3 font-sans ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {container.groupTitle}
          </h4>
        )}

        {/* 2-column Grid of Topic Cards */}
        <div className="grid grid-cols-2 gap-2">
          {container.topics.map((t, tIdx) => renderTopicCard(t, `c-${tIdx}`))}
        </div>

        {/* Optional Subgroups inside container (e.g. Prompting Techniques, Model Interaction) */}
        {container.subGroups && container.subGroups.length > 0 && (
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            {container.subGroups.map((sg, sgIdx) => (
              <div key={sgIdx} className="space-y-2">
                {sg.subTitle && (
                  <h5
                    className={`text-center font-bold text-[11px] font-sans uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {sg.subTitle}
                  </h5>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {sg.topics.map((t, tIdx) => renderTopicCard(t, `sg-${sgIdx}-${tIdx}`))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative w-full min-h-[90vh] rounded-3xl border transition-colors overflow-hidden flex flex-col ${
        isDark
          ? 'bg-[#090D14] border-slate-800 text-white'
          : 'bg-[#F8FAFC] border-slate-300 text-slate-900 shadow-xl'
      }`}
      style={{
        backgroundColor: customAITheme?.bg,
      }}
    >
      {/* =========================================================================
          TOP NAV & TRACK SWITCHER HUD (Matching Image 1 top bar)
      ========================================================================= */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-xl border-b p-3 sm:px-6 flex flex-col gap-3 ${
          isDark
            ? 'bg-[#090D14]/95 border-slate-800'
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Back button + Track Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
            <button
              type="button"
              onClick={onBackToCatalog}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* Quick Switcher Track Pills */}
            <div className="flex items-center gap-1.5">
              {TOP_TRACKS.map((track) => {
                const isActive = roadmap.id === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => onSelectRoadmapId && onSelectRoadmapId(track.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all shrink-0 cursor-pointer border ${
                      isActive
                        ? isDark
                          ? 'bg-white text-slate-950 font-bold border-white shadow-md'
                          : 'bg-slate-900 text-white font-bold border-slate-900 shadow-md'
                        : isDark
                        ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {track.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search + Progress + AI Generator Button */}
          <div className="flex items-center gap-3">
            {/* Search Filter */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-800 shadow-xs'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find topic..."
                className="w-24 sm:w-36 bg-transparent text-xs font-sans focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Progress Badge */}
            <div
              className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400">Progress</span>
              <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <span className="font-bold text-emerald-500">{stats.percent}%</span>
            </div>

            {onOpenAiGenerator && (
              <button
                type="button"
                onClick={onOpenAiGenerator}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Roadmap</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN ROADMAP VIEWPORT: LEFT SIDEBAR + CENTRAL ROADMAP.SH SPINE
      ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        {/* LEFT COMPLEMENTARY SIDEBAR (Matching Image 1: Scrimba promo card + Related Roadmaps) */}
        <aside className="w-full lg:w-72 lg:shrink-0 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 space-y-5">
          {/* Track Highlight Card (Styled like Scrimba offer card from image 1) */}
          <div
            className={`p-4 rounded-2xl border-2 ${
              isDark
                ? 'bg-gradient-to-br from-[#131B2A] to-[#0D121C] border-blue-500/40 text-white'
                : 'bg-gradient-to-br from-blue-50/70 to-indigo-50/60 border-slate-900 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {shData.badge}
              </span>
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                {stats.completed}/{stats.total} Done
              </span>
            </div>
            <p className="text-xs leading-relaxed font-sans font-medium mb-3">
              {shData.tagline}
            </p>
            {onLaunchDrill && (
              <button
                type="button"
                onClick={() => onLaunchDrill(roadmap.title)}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Launch Practice Quiz</span>
              </button>
            )}
          </div>

          {/* Related Roadmaps Box (Exact format from Image 1: "Related Roadmaps" with check icons) */}
          <div
            className={`p-4 rounded-2xl border-2 ${
              isDark
                ? 'bg-[#0F141C] border-slate-800'
                : 'bg-white border-slate-900 shadow-sm'
            }`}
          >
            <h4
              className={`font-bold text-xs sm:text-sm tracking-tight mb-3 font-sans flex items-center justify-between ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span>Related Roadmaps</span>
              <Compass className="w-3.5 h-3.5 text-slate-400" />
            </h4>

            <div className="space-y-2">
              {shData.relatedRoadmaps.map((rel, rIdx) => {
                const targetMatch = TOP_TRACKS.find((t) => t.id === rel.id || t.title.toLowerCase().includes(rel.title.toLowerCase()));
                return (
                  <button
                    key={`${rel.id || 'rel'}-${rIdx}`}
                    type="button"
                    onClick={() => {
                      if (targetMatch && onSelectRoadmapId) {
                        onSelectRoadmapId(targetMatch.id);
                      } else {
                        showToast(`Selected track: ${rel.title}`, 'info');
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg text-left text-xs font-sans transition-colors cursor-pointer group ${
                      isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isDark
                          ? 'border-slate-600 bg-slate-800 group-hover:border-blue-400'
                          : 'border-slate-400 bg-slate-100 group-hover:border-slate-800'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 text-blue-500" />
                    </div>
                    <span className="truncate font-medium">{rel.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jump to Milestone Index */}
          <div
            className={`p-4 rounded-2xl border-2 ${
              isDark
                ? 'bg-[#0F141C] border-slate-800'
                : 'bg-white border-slate-900 shadow-sm'
            }`}
          >
            <h4
              className={`font-bold text-xs tracking-tight mb-2.5 font-sans uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Milestone Index
            </h4>

            <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {shData.milestones.map((m, idx) => (
                <button
                  key={`${m.id || 'm'}-${idx}`}
                  type="button"
                  onClick={() => scrollToMilestone(m.id)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-sans truncate transition-colors cursor-pointer flex items-center gap-2 ${
                    isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono text-blue-500 font-bold shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span className="truncate">{m.milestoneTitle}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* =====================================================================
            CENTRAL ROADMAP.SH SPINE & TREE VIEWPORT (Exact layout from screenshots)
        ===================================================================== */}
        <div className="flex-1 p-4 sm:p-8 flex flex-col items-center overflow-x-auto min-w-0">
          {/* Header Title Section (Matching "AI Engineer" and "roadmap.sh" badge from Image 1) */}
          <div className="text-center mb-6 space-y-2 max-w-xl">
            <div className="inline-block px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              roadmap.sh standard
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {shData.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans max-w-lg mx-auto">
              {shData.description}
            </p>
          </div>

          {/* ROADMAP TREE CONTAINER WITH CENTRAL BLUE SPINE */}
          <div className="relative w-full max-w-[960px] flex flex-col items-center py-6">
            {/* The Central Solid Blue Spine Line (Runs through all milestones) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-4 bottom-10 w-[3px] bg-blue-600 dark:bg-blue-500 z-0 pointer-events-none rounded-full"
            />

            {/* Render Each Milestone Down the Central Spine */}
            <div className="w-full flex flex-col items-center space-y-14 z-10">
              {shData.milestones.map((milestone, mIdx) => {
                return (
                  <div
                    key={`${milestone.id || 'ms'}-${mIdx}`}
                    id={milestone.id}
                    className="relative w-full flex flex-col items-center"
                  >
                    {/* Optional Spine Subtitle above Milestone (e.g. "Working With LLMs" from Image 1) */}
                    {milestone.spineSubtitle && (
                      <div className="mb-4 text-center z-10">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide ${
                            isDark
                              ? 'bg-[#090D14] text-white border border-slate-700'
                              : 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                          }`}
                        >
                          {milestone.spineSubtitle}
                        </span>
                      </div>
                    )}

                    {/* Milestone Center Box on the Spine */}
                    {/* (Image 1/2: Bright yellow rounded rectangle with solid black border - now fully clickable with guide & video) */}
                    <div
                      className="relative z-10 flex items-center justify-center group/milestone"
                      onMouseEnter={() => setHoveredTopicId(milestone.id)}
                      onMouseLeave={() => setHoveredTopicId(null)}
                    >
                      {/* Floating Action Pill Bar on Hover for Milestone */}
                      {hoveredTopicId === milestone.id && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 bg-white text-slate-800 border-2 border-slate-900 rounded-lg shadow-xl px-1.5 py-0.5 font-sans text-[11px] whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTopicStatus(milestone.id, 'in_progress');
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded hover:bg-amber-100 font-semibold cursor-pointer transition-colors ${
                              (topicStatuses[milestone.id] || 'not_started') === 'in_progress' ? 'text-amber-700 font-bold' : 'text-slate-700'
                            }`}
                            title="Mark milestone as currently learning"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                            <span>Learning</span>
                          </button>

                          <span className="text-slate-300">|</span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTopicStatus(milestone.id, 'completed');
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded hover:bg-emerald-100 font-semibold cursor-pointer transition-colors ${
                              (topicStatuses[milestone.id] || 'not_started') === 'completed' ? 'text-emerald-700 font-bold' : 'text-slate-700'
                            }`}
                            title="Mark milestone as completed"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Done</span>
                          </button>

                          <span className="text-slate-300">|</span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTopicStatus(milestone.id, 'not_started');
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 font-semibold cursor-pointer transition-colors"
                            title="Reset milestone status"
                          >
                            <X className="w-3 h-3 text-slate-400" />
                            <span>Skip</span>
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openMilestoneDetail(milestone)}
                        className={`px-6 py-2.5 rounded-xl border-2 font-bold font-sans text-sm sm:text-base text-center transition-all shadow-md select-none cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 ${
                          (topicStatuses[milestone.id] || 'not_started') === 'completed'
                            ? isDark
                              ? 'bg-[#0E281E] border-2 border-emerald-500 text-emerald-200'
                              : 'bg-emerald-100 border-2 border-emerald-700 text-emerald-950 font-bold'
                            : (topicStatuses[milestone.id] || 'not_started') === 'in_progress'
                            ? isDark
                              ? 'bg-[#2E2007] border-2 border-amber-400 text-amber-200'
                              : 'bg-amber-100 border-2 border-amber-600 text-amber-950 font-bold'
                            : isDark
                            ? 'bg-[#FACC15] hover:bg-[#FDE047] text-slate-950 border-black shadow-[0_0_20px_rgba(250,204,21,0.25)]'
                            : 'bg-[#FACC15] hover:bg-[#FDE047] text-slate-950 border-slate-950 shadow-md'
                        }`}
                        title={`Click to open full masterclass guide, video & documentation for ${milestone.milestoneTitle}`}
                      >
                        {(topicStatuses[milestone.id] || 'not_started') === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {(topicStatuses[milestone.id] || 'not_started') === 'in_progress' && (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                        )}
                        <span>{milestone.milestoneTitle}</span>
                        <Sparkles className="w-3.5 h-3.5 opacity-75 group-hover/milestone:opacity-100 group-hover/milestone:rotate-12 transition-all shrink-0" />
                      </button>

                      {/* Milestone Fan-Out Right (Exact replica of Image 1 Introduction fan-out: 4 cards with curved dotted lines) */}
                      {milestone.fanOutRight && milestone.fanOutRight.length > 0 && (
                        <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 flex items-center">
                          {/* Curved SVG Dotted Connector Lines */}
                          <svg
                            className="w-16 h-48 pointer-events-none shrink-0"
                            style={{ overflow: 'visible' }}
                          >
                            <defs>
                              <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                              </filter>
                            </defs>
                            {milestone.fanOutRight.map((_, fIdx) => {
                              const total = milestone.fanOutRight!.length;
                              // fan out to 4 heights
                              const startY = 96; // center of 192px box
                              const targetY = (fIdx / (total - 1 || 1)) * 160 + 16;
                              return (
                                <path
                                  key={fIdx}
                                  d={`M 0 ${startY} C 35 ${startY}, 30 ${targetY}, 64 ${targetY}`}
                                  fill="none"
                                  stroke="#2563EB"
                                  strokeWidth="2.5"
                                  strokeDasharray="4 4"
                                />
                              );
                            })}
                          </svg>

                          {/* Stacked Fan-Out Topic Cards */}
                          <div className="flex flex-col space-y-2.5 w-52 sm:w-64 pl-2">
                            {milestone.fanOutRight.map((item, fIdx) => renderTopicCard(item, `fan-${mIdx}-${fIdx}`))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Left & Right Container Row (Image 1: "Core LLM Elements" on Left, "Common Terminology" on Right) */}
                    {(milestone.leftContainer || milestone.rightContainer) && (
                      <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-8 items-start">
                        {/* LEFT CONTAINER (Connected to Center via Horizontal Dotted Blue Line) */}
                        <div className="flex flex-col items-center md:items-end justify-center relative">
                          {milestone.leftContainer ? (
                            <div className="relative">
                              {/* Horizontal Dotted Blue Line connecting container right edge to spine */}
                              <div
                                className="hidden md:block absolute -right-16 top-8 w-16 border-t-2 border-dotted border-blue-600 dark:border-blue-400 pointer-events-none"
                              />
                              {renderGroupContainer(milestone.leftContainer)}
                            </div>
                          ) : (
                            <div className="w-full" />
                          )}
                        </div>

                        {/* RIGHT CONTAINER (Connected to Center via Horizontal Dotted Blue Line) */}
                        <div className="flex flex-col items-center md:items-start justify-center relative">
                          {milestone.rightContainer ? (
                            <div className="relative">
                              {/* Horizontal Dotted Blue Line connecting container left edge to spine */}
                              <div
                                className="hidden md:block absolute -left-16 top-8 w-16 border-t-2 border-dotted border-blue-600 dark:border-blue-400 pointer-events-none"
                              />
                              {renderGroupContainer(milestone.rightContainer)}
                            </div>
                          ) : (
                            <div className="w-full" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STICKY BOTTOM AI TUTOR DOCK (Matching Image 1: "✨ AI Tutor Have a question? Type here")
      ========================================================================= */}
      <div
        className={`sticky bottom-0 z-40 p-3 sm:p-4 backdrop-blur-xl border-t ${
          isDark
            ? 'bg-[#090D14]/90 border-slate-800'
            : 'bg-white/95 border-slate-200 shadow-xl'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          {/* Active AI Tutor Answer Popover if asked */}
          {aiTutorActiveAnswer && (
            <div
              className={`mb-3 p-3.5 rounded-2xl border ${
                isDark
                  ? 'bg-slate-900 border-blue-500/40 text-slate-200'
                  : 'bg-blue-50/90 border-blue-200 text-slate-800 shadow-md'
              } flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className="space-y-1 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Question: "{aiTutorActiveAnswer.query}"</span>
                </div>
                <p className="leading-relaxed">{aiTutorActiveAnswer.answer}</p>
                {aiTutorActiveAnswer.relatedTopic && onLaunchDrill && (
                  <button
                    type="button"
                    onClick={() => onLaunchDrill(aiTutorActiveAnswer.relatedTopic!)}
                    className="mt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Target className="w-3 h-3" />
                    <span>Practice "{aiTutorActiveAnswer.relatedTopic}" now →</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAiTutorActiveAnswer(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* The AI Tutor Floating Pill Input */}
          <form
            onSubmit={handleAiTutorSubmit}
            className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border-2 transition-all shadow-xl ${
              isDark
                ? 'bg-[#121722] border-slate-700 focus-within:border-blue-500'
                : 'bg-slate-900 border-slate-950 text-white focus-within:ring-2 focus-within:ring-blue-500'
            }`}
          >
            {/* AI Tutor Icon & Label */}
            <div className="flex items-center gap-1.5 pl-2.5 text-amber-400 font-bold text-xs shrink-0 select-none">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>AI Tutor</span>
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={aiTutorInput}
              onChange={(e) => setAiTutorInput(e.target.value)}
              placeholder="Have a question? Type here (e.g. 'What is Top-P?', 'How does RAG work?')"
              className={`flex-1 bg-transparent px-2 text-xs sm:text-sm focus:outline-none ${
                isDark ? 'text-white placeholder:text-slate-500' : 'text-white placeholder:text-slate-400'
              }`}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAiTutorThinking || !aiTutorInput.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {isAiTutorThinking ? (
                <Clock className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* =========================================================================
          TOPIC DETAIL MODAL (Deep explanations, videos, articles, and drills)
      ========================================================================= */}
      <TopicDetailModal
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onUpdateStatus={updateTopicStatus}
        onLaunchDrill={onLaunchDrill}
      />
    </div>
  );
};
