import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { StudentThemePanel } from '../student/StudentThemePanel';
import { AIThemeGenerator } from './AIThemeGenerator';
import {
  Settings,
  Sliders,
  Palette,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Target,
  Zap,
  LayoutGrid,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { userProfile, role } = useAuth();
  const { isDark, mode, setMode, fontSize, setFontSize } = useTheme();
  const { showToast } = useToast();

  // Primary Tabs
  const [activeTab, setActiveTab] = useState<'my-settings' | 'ai-color-studio'>('my-settings');

  // Student Workspace Sub-tabs
  const [studentSubTab, setStudentSubTab] = useState<'appearance' | 'learning-goals'>('appearance');

  // Universal Typography Scale
  const [fontScale, setFontScaleState] = useState<'default' | 'compact' | 'readable'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_font_scale');
      if (saved === 'compact' || saved === 'default' || saved === 'readable') return saved;
    }
    return fontSize === 'extra-large' || fontSize === 'large' ? 'readable' : 'default';
  });

  // System Notification Frequency (Actually Works!)
  const [notificationFrequency, setNotificationFrequencyState] = useState<'realtime' | 'hourly' | 'critical'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_notification_frequency');
      if (saved === 'realtime' || saved === 'hourly' || saved === 'critical') return saved;
    }
    return 'realtime';
  });

  // Student Configurable States
  const [targetMastery, setTargetMasteryState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('student_target_mastery');
      if (saved) return Number(saved) || 85;
    }
    return 85;
  });

  const [dailyQuestionGoal, setDailyQuestionGoalState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('student_daily_question_goal');
      if (saved) return Number(saved) || 10;
    }
    return 10;
  });

  const [tutorPersona, setTutorPersonaState] = useState<'socratic' | 'academic' | 'coach'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('student_tutor_persona');
      if (saved === 'socratic' || saved === 'academic' || saved === 'coach') return saved;
    }
    return 'socratic';
  });

  // Apply initial DOM-level styling on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentScale = localStorage.getItem('app_font_scale') || fontScale;
    document.documentElement.style.fontSize =
      currentScale === 'compact' ? '14px' : currentScale === 'readable' ? '18px' : '16px';
  }, []);

  const setFontScale = (scale: 'default' | 'compact' | 'readable') => {
    setFontScaleState(scale);
    localStorage.setItem('app_font_scale', scale);
    setFontSize(scale === 'readable' ? 'large' : 'normal');
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize =
        scale === 'compact' ? '14px' : scale === 'readable' ? '18px' : '16px';
    }
    showToast(`Typography scale updated to ${scale}`, 'info');
  };

  const setNotificationFrequency = (freq: 'realtime' | 'hourly' | 'critical') => {
    setNotificationFrequencyState(freq);
    localStorage.setItem('app_notification_frequency', freq);
    const label =
      freq === 'realtime'
        ? 'Real-Time Instant Alerts'
        : freq === 'hourly'
        ? 'Batched Hourly Digest'
        : 'Critical Deadlines Only';
    showToast(`System Notification Frequency updated: ${label}`, 'success');
  };

  const setTutorPersona = (persona: 'socratic' | 'academic' | 'coach') => {
    setTutorPersonaState(persona);
    localStorage.setItem('student_tutor_persona', persona);
    showToast(`Socratic persona set to ${persona}`, 'info');
  };

  const setTargetMastery = (val: number) => {
    setTargetMasteryState(val);
    localStorage.setItem('student_target_mastery', String(val));
  };

  const setDailyQuestionGoal = (val: number) => {
    setDailyQuestionGoalState(val);
    localStorage.setItem('student_daily_question_goal', String(val));
  };

  return (
    <div className={`max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-150 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[#00F0FF]">
            <Settings className="w-4 h-4 text-[#00F0FF]" />
            <span className="capitalize">{role} Platform Preferences</span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Workspace Preferences & Configuration
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Configure theme mode, notification cadence, and accessibility scaling.
          </p>
        </div>

        {/* User Role Badge */}
        <div className={`flex items-center gap-3 p-3 ${isDark ? 'bg-[#0A0D14]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'} rounded-xl border`}>
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-[#00F0FF] flex items-center justify-center font-bold text-sm">
            {userProfile?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-left text-xs">
            <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} leading-tight`}>
              {userProfile?.name || 'User'}
            </div>
            <div className="text-[11px] text-slate-400 capitalize mt-0.5 flex items-center gap-1.5 font-mono">
              <span>Role:</span>
              <span className="font-semibold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/20">
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className={`flex items-center gap-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} pb-2 overflow-x-auto`}>
        <button
          onClick={() => setActiveTab('my-settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'my-settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : isDark ? 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10' : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="capitalize">{role} Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-color-studio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ai-color-studio'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-[#C084FC] hover:bg-purple-950/40 bg-purple-950/20 border border-purple-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>✨ AI Color Studio</span>
        </button>
      </div>

      {/* Tab: AI Color Studio */}
      {activeTab === 'ai-color-studio' && (
        <AIThemeGenerator />
      )}

      {/* Tab 1: Primary Role Settings */}
      {activeTab === 'my-settings' && (
        <div className="space-y-6">
          {/* Universal System Settings: Theme, Notifications, Typography */}
          <div className={`p-6 sm:p-7 rounded-2xl border ${isDark ? 'bg-[#0A0D14]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'} space-y-6`}>
            <div className={`pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className="text-base font-bold flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#00F0FF]" />
                <span>Theme & System Preferences</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                Configure your display theme, notification cadence, and accessibility scaling.
              </p>
            </div>

            <div className="space-y-6">
              {/* 1. Theme Mode: Bright Mode vs Dark Mode (Instantly Functional) */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Theme Mode</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Clean Crisp White or High-Contrast Dark
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('light');
                      showToast('Switched to Bright Mode', 'info');
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between font-semibold transition-all cursor-pointer ${
                      !isDark
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Bright Mode</span>
                    </div>
                    {!isDark && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('dark');
                      showToast('Switched to Dark Mode', 'info');
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between font-semibold transition-all cursor-pointer ${
                      isDark
                        ? 'border-[#3B82F6] bg-slate-900 text-[#3B82F6] shadow-sm'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span>Dark Mode</span>
                    </div>
                    {isDark && <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />}
                  </button>
                </div>
              </div>

              {/* 2. System Notification Frequency (Actually Works!) */}
              <div className="space-y-2 max-w-lg">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  System Notification Frequency
                </label>
                <select
                  value={notificationFrequency}
                  onChange={(e) => setNotificationFrequency(e.target.value as any)}
                  className={`w-full p-3 rounded-xl border text-xs font-mono ${
                    isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  } focus:outline-hidden focus:border-[#00F0FF] cursor-pointer`}
                >
                  <option value="realtime">Real-Time Instant Alerts (Standard)</option>
                  <option value="hourly">Batched Hourly Digest</option>
                  <option value="critical">Critical Assessment Deadlines Only</option>
                </select>
                <p className="text-[11px] text-slate-400 font-sans">
                  Controls how frequently assignment, submission, and curriculum notifications pop up.
                </p>
              </div>

              {/* 3. Typography Scale */}
              <div className="space-y-2 max-w-lg">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Typography Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'default', 'readable'] as const).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontScale(scale)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-mono capitalize cursor-pointer transition-all ${
                        fontScale === scale
                          ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] font-bold shadow-xs'
                          : isDark ? 'border-white/10 text-slate-400 hover:border-white/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STUDENT ROLE WORKSPACE */}
          {role === 'student' && (
            <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-[#0A0D14]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'} space-y-6`}>
              <div className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'} pb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                    <GraduationCap className="w-4 h-4" />
                    <span>Scholar Workspace Settings</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Student Mode Active
                  </span>
                </div>
                <h2 className="text-base font-bold mt-1">
                  Personal Study Preferences & Themes
                </h2>
              </div>

              {/* Sub-Tabs for Student */}
              <div className={`flex items-center gap-1.5 p-1 ${isDark ? 'bg-slate-800/80 border-white/10' : 'bg-slate-100 border-slate-200'} rounded-xl border`}>
                <button
                  type="button"
                  onClick={() => setStudentSubTab('appearance')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    studentSubTab === 'appearance'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>UI Presets & Contrast</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentSubTab('learning-goals')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    studentSubTab === 'learning-goals'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Learning Goals & Socratic Persona</span>
                </button>
              </div>

              {studentSubTab === 'appearance' && <StudentThemePanel />}

              {studentSubTab === 'learning-goals' && (
                <div className="space-y-6 pt-2">
                  {/* Socratic Persona */}
                  <div className="space-y-3">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Socratic Tutor Persona
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTutorPersona('socratic')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          tutorPersona === 'socratic'
                            ? 'border-purple-500 bg-purple-500/10 text-white font-bold'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-purple-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Socratic Guide</span>
                        </div>
                        <p className="text-[10px] leading-relaxed">
                          Probes invariants with guiding questions rather than giving raw answers.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTutorPersona('academic')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          tutorPersona === 'academic'
                            ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-400">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Academic Professor</span>
                        </div>
                        <p className="text-[10px] leading-relaxed">
                          Rigorous mathematical formalisms, edge cases, and algorithmic proofs.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTutorPersona('coach')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          tutorPersona === 'coach'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-400">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Encouraging Coach</span>
                        </div>
                        <p className="text-[10px] leading-relaxed">
                          Positive reinforcement, iterative hints, and study milestone tracking.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Target Mastery Goal */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Target Mastery Score
                      </label>
                      <span className="text-sm font-bold font-mono text-[#00F0FF]">{targetMastery}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="100"
                      step="5"
                      value={targetMastery}
                      onChange={(e) => setTargetMastery(Number(e.target.value))}
                      className="w-full accent-[#00F0FF] cursor-pointer"
                    />
                  </div>

                  {/* Daily Question Goal */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Daily Practice Target
                      </label>
                      <span className="text-sm font-bold font-mono text-emerald-400">{dailyQuestionGoal} Questions/day</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={dailyQuestionGoal}
                      onChange={(e) => setDailyQuestionGoal(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
