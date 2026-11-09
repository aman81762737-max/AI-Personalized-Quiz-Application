import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  UploadCloud,
  PlusCircle,
  ClipboardList,
  BarChart3,
  Sparkles,
  Target,
  MessageSquareText,
  Users,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Cpu,
  Compass,
  Calendar,
  Brain,
  ListTodo,
  Award,
  Calculator,
  Clock,
  HelpCircle,
  Bot,
  Database,
} from 'lucide-react';
import { CustomCockpitTab } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenThemeModal?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenThemeModal,
  collapsed = false,
  onToggleCollapse,
}) => {
  const { role, userProfile } = useAuth();
  const { isDark, customAITheme } = useTheme();

  const teacherItems = [
    { id: 'dashboard', label: 'Command Deck', icon: LayoutDashboard },
    { id: 'community', label: 'Class Community', icon: GraduationCap },
    { id: 'question-bank', label: 'Question Bank', icon: Database },
    { id: 'create-assessment', label: 'Create Assessment', icon: PlusCircle },
    { id: 'assessments', label: 'Examinations', icon: ClipboardList },
    { id: 'materials', label: 'Curriculum Uploads', icon: UploadCloud },
    { id: 'cohort', label: 'Student Cohort', icon: Users },
    { id: 'teacher-agent', label: 'Teacher AI Copilot', icon: Bot, isAI: true },
    { id: 'settings', label: 'Settings & Studio', icon: Settings },
  ];

  const studentItems = [
    { id: 'dashboard', label: 'Tactical Cockpit', icon: LayoutDashboard },
    { id: 'community', label: 'Class Community', icon: GraduationCap },
    { id: 'roadmaps', label: 'Learning Roadmaps', icon: Compass },
    { id: 'assessments', label: 'My Assessments', icon: ClipboardList },
    { id: 'results', label: 'Diagnostic Radar', icon: BarChart3 },
    { id: 'practice', label: 'Adaptive Drills', icon: Target },
    { id: 'ai-tutor', label: 'Socratic RAG Tutor', icon: MessageSquareText, isAI: true },
    { id: 'settings', label: 'Theme & Settings', icon: Settings },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'Governance Deck', icon: LayoutDashboard },
    { id: 'admin-users', label: 'User Directory', icon: Users },
    { id: 'admin-system', label: 'Security & Audits', icon: ShieldAlert },
    { id: 'profile', label: 'Governance Dossier', icon: ShieldCheck },
    { id: 'settings', label: 'Branding & Domain', icon: Settings },
  ];

  const items = role === 'teacher' ? teacherItems : role === 'student' ? studentItems : adminItems;

  const roleAccent =
    role === 'teacher'
      ? { text: 'text-[#10B981]', bg: 'bg-[#10B981]/15', border: 'border-[#10B981]/40', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]' }
      : role === 'student'
      ? { text: 'text-[#00F0FF]', bg: 'bg-[#00F0FF]/15', border: 'border-[#00F0FF]/40', glow: 'shadow-[0_0_15px_rgba(0,240,255,0.25)]' }
      : { text: 'text-amber-400', bg: 'bg-amber-400/15', border: 'border-amber-400/40', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]' };

  return (
    <aside
      style={customAITheme ? {
        backgroundColor: customAITheme.surface || customAITheme.card,
        borderColor: customAITheme.border,
        color: customAITheme.text,
      } : undefined}
      className={`${
        collapsed ? 'w-16 p-2.5' : 'w-64 p-3.5'
      } border-r ${
        customAITheme
          ? ''
          : isDark
          ? 'border-white/10 bg-[#07090E]/95 text-white'
          : 'border-slate-200 bg-white/95 text-slate-900 shadow-xs'
      } backdrop-blur-md shrink-0 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out z-20`}
    >
      <div className="space-y-3">
        {/* Sidebar Header with Toggle Button */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'} pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${role === 'teacher' ? 'bg-[#10B981]' : role === 'student' ? 'bg-[#00F0FF]' : 'bg-amber-400'} animate-pulse`} />
              <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-widest truncate`}>
                {role} Cockpit
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} transition-colors cursor-pointer`}
              title={collapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#00F0FF]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isAiFeature = (item as any).isAI;

            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                style={customAITheme && isActive ? {
                  backgroundColor: customAITheme.primary,
                  color: '#FFFFFF',
                } : undefined}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-semibold transition-all text-left cursor-pointer relative group ${
                  isActive
                    ? isDark
                      ? `${roleAccent.bg} ${roleAccent.text} border ${roleAccent.border} ${roleAccent.glow}`
                      : 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive
                        ? isDark ? roleAccent.text : 'text-blue-600'
                        : isAiFeature
                        ? 'text-purple-400'
                        : isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  />
                  {!collapsed && <span className="truncate tracking-wide">{item.label}</span>}
                </div>

                {/* AI Badge */}
                {isAiFeature && (
                  collapsed ? (
                    <span className="w-2 h-2 rounded-full bg-purple-500 absolute top-1.5 right-1.5 ring-2 ring-[#07090E]" />
                  ) : (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                      AI
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </aside>
  );
};
