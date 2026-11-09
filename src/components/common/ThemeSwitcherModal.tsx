import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { StudentThemePanel } from '../student/StudentThemePanel';
import { TeacherThemePanel } from '../teacher/TeacherThemePanel';
import { AdminBrandingPanel } from '../admin/AdminBrandingPanel';
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Lock,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { ASSESSMENT_LOCK_THEME } from '../../design-system/tokens';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'student' | 'teacher' | 'admin' | 'exam'>('current');

  const resolvedRole = activeTab === 'current' ? role : activeTab;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Role-Based Theme & Customization Engine"
      subtitle="Controlled personalization tailored for students, teachers, and administrators"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Role Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="capitalize">My {role} Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40 shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#00FF88]" />
            <span>Student Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teacher'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Teacher Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Branding</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exam'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Lock Mode</span>
          </button>
        </div>

        {/* Role Restriction Banner if previewing other role */}
        {resolvedRole !== role && resolvedRole !== 'exam' && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Role Restricted:</strong> You are currently signed in as a <span className="capitalize font-bold">{role}</span>. Switch your demo role to <strong>{resolvedRole}</strong> to edit these settings.
            </span>
          </div>
        )}

        {/* Tab Content */}
        <div className={resolvedRole !== role && resolvedRole !== 'exam' ? 'pointer-events-none opacity-60' : ''}>
          {resolvedRole === 'student' && <StudentThemePanel />}
          {resolvedRole === 'teacher' && <TeacherThemePanel />}
          {resolvedRole === 'admin' && <AdminBrandingPanel />}
        </div>

        {activeTab === 'exam' && (
          <div className="space-y-4 text-xs text-[#0F172A] dark:text-[#F8FAFC]">
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#DC2626]">
                <Lock className="w-4 h-4" />
                <span>Assessment Lock Mode: Fixed Security Theme</span>
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                The examination interface uses a strictly immutable visual system designed to maximize focus, eliminate distractions, and preserve proctoring integrity across all student devices.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90">
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] block">Question Card</span>
                <span className="font-bold text-xs font-mono">{ASSESSMENT_LOCK_THEME.questionCards}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">High legibility surface</span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90">
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] block">Countdown Clock</span>
                <span className="font-bold text-xs font-mono text-[#DC2626]">{ASSESSMENT_LOCK_THEME.timer}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">High contrast red</span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90">
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] block">Finish & Submit</span>
                <span className="font-bold text-xs font-mono text-[#16A34A]">{ASSESSMENT_LOCK_THEME.submit}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Verified green</span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90">
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] block">Attention Warning</span>
                <span className="font-bold text-xs font-mono text-[#F59E0B]">{ASSESSMENT_LOCK_THEME.warning}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Review badge</span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90">
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] block">Violation Alert</span>
                <span className="font-bold text-xs font-mono text-[#B91C1C]">{ASSESSMENT_LOCK_THEME.violation}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Tab/window blur alert</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
