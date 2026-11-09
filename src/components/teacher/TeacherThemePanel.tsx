import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const TeacherThemePanel: React.FC = () => {
  const {
    mode,
    setMode,
    resetRoleDefaults,
  } = useTheme();

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



      {/* Reset */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => resetRoleDefaults()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Teacher Defaults</span>
        </button>
      </div>
    </div>
  );
};
