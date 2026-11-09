import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { STUDENT_PRESETS } from '../../design-system/tokens';
import { StudentAccentPreset } from '../../types';
import {
  Sun,
  Moon,
  Sparkles,
  Eye,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const StudentThemePanel: React.FC = () => {
  const {
    mode,
    setMode,
    studentPreset,
    setStudentPreset,
    highContrast,
    setHighContrast,
    resetRoleDefaults,
  } = useTheme();

  const presets: StudentAccentPreset[] = ['ai-blue', 'calm-learning', 'focus-mode', 'dark-intelligence'];

  return (
    <div className="space-y-6 text-xs text-[#0F172A] dark:text-[#F8FAFC]">
      {/* 1. Theme Mode: Bright Mode vs Dark Mode */}
      <div className="space-y-2.5">
        <label className="font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-between">
          <span>Theme Mode</span>
          <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-normal">
            Clean Crisp White or High-Contrast Dark
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('light')}
            className={`p-3.5 rounded-xl border flex items-center justify-between font-semibold transition-all cursor-pointer ${
              mode === 'light'
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Bright Mode</span>
            </div>
            {mode === 'light' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => setMode('dark')}
            className={`p-3.5 rounded-xl border flex items-center justify-between font-semibold transition-all cursor-pointer ${
              mode === 'dark'
                ? 'border-[#3B82F6] bg-slate-900 text-[#3B82F6] shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>Dark Mode</span>
            </div>
            {mode === 'dark' && <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />}
          </button>
        </div>
      </div>

      {/* 2. Accent Theme Selection (Presets A, B, C, D) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Learning Accent Presets</span>
          </label>
          <span className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
            Curated harmonious palettes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {presets.map((key) => {
            const p = STUDENT_PRESETS[key];
            const isSelected = studentPreset === key;
            return (
              <div
                key={key}
                onClick={() => setStudentPreset(key)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#2563EB] dark:border-[#3B82F6] bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                    : 'border-white/10 dark:border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{p.name}</span>
                  {/* Swatch chips */}
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.primary }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.secondary }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.accent }}></span>
                  </div>
                </div>
                <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-tight">
                  {p.description}
                </p>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6] absolute top-3 right-16" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Accessibility Controls */}
      <div className="space-y-4 pt-3 border-t border-white/10 dark:border-white/10">
        <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Accessibility Preferences</span>
        </div>


        {/* High contrast mode */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 dark:border-white/10 bg-slate-50 dark:bg-[#0F172A]">
          <div>
            <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">High Contrast Mode</div>
            <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
              Enforces maximum contrast borders and pure black/white text
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              highContrast ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                highContrast ? 'left-6' : 'left-1'
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => resetRoleDefaults()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Student Defaults</span>
        </button>
      </div>
    </div>
  );
};
