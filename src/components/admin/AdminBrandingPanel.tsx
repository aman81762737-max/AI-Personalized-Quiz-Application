import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AIThemeGenerator } from '../settings/AIThemeGenerator';
import {
  Building2,
  Palette,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Lock,
  Save,
  Radio,
} from 'lucide-react';
import { useToast } from '../common/Toast';

export const AdminBrandingPanel: React.FC = () => {
  const { institutionTheme, updateInstitutionTheme, resetRoleDefaults } = useTheme();
  const { showToast } = useToast();

  const [institutionName, setInstitutionName] = useState(institutionTheme.institutionName);
  const [logoText, setLogoText] = useState(institutionTheme.logo || 'Q');
  const [primaryColor, setPrimaryColor] = useState(institutionTheme.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(institutionTheme.secondaryColor);
  const [loginTagline, setLoginTagline] = useState(institutionTheme.loginTagline);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateInstitutionTheme({
        institutionName,
        logo: logoText,
        primaryColor,
        secondaryColor,
        loginTagline,
      });
      showToast('Institution branding updated successfully across platform!', 'success');
    } catch {
      showToast('Failed to update institution branding', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs text-white">
      {/* 1. Institution Identity */}
      <div className="space-y-4">
        <div className="font-mono font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#00F0FF]" />
          <span>INSTITUTION IDENTITY & BRAND SPECIFICATION</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400">
              Institution / University Name
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. Stanford University School of Engineering"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/60 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#00F0FF] font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400">
              Logo Symbol (1-4 Chars)
            </label>
            <input
              type="text"
              maxLength={4}
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              placeholder="Q"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/60 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#00F0FF] text-center font-bold font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-slate-400">
            Login Page Brand Tagline
          </label>
          <input
            type="text"
            value={loginTagline}
            onChange={(e) => setLoginTagline(e.target.value)}
            placeholder="Empowering institutions with AI-driven assessments and adaptive mastery."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/60 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#00F0FF] font-sans"
          />
        </div>
      </div>

      {/* 2. AI Color Studio & Brand Palette */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <AIThemeGenerator compact={true} />
      </div>

      {/* 3. Live Brand Preview Banner */}
      <div className="space-y-2.5 pt-4 border-t border-white/10">
        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
          Live Header Preview Surface
        </label>
        <div className="p-4 rounded-xl border border-white/10 bg-black/70 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)] font-mono"
              style={{ backgroundColor: primaryColor }}
            >
              {logoText || 'Q'}
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                {institutionName || 'AI Personalized Quiz Platform'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {loginTagline || 'Institutional Assessment Console'}
              </div>
            </div>
          </div>

          <div
            className="px-3.5 py-1.5 rounded-lg text-white font-mono font-bold text-xs shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            Action Button
          </div>
        </div>
      </div>

      {/* Strict Security Invariant Banner */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs flex items-start gap-3">
        <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
          <strong className="text-white font-mono">Institutional Policy Invariant:</strong> Custom branding dynamically affects general navigation and dashboard telemetry. It <span className="font-bold text-rose-400 font-mono">NEVER</span> overrides Assessment Lock Mode, countdown timers, security violations, or high-contrast accessibility colors.
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            resetRoleDefaults();
            setPrimaryColor('#0F172A');
            setSecondaryColor('#2563EB');
            setInstitutionName('AI Personalized Quiz & Learning Platform');
            setLogoText('Q');
            showToast('Reset branding to Neural Control defaults', 'info');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2 rounded-xl font-mono font-bold text-xs text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'APPLYING CONFIG...' : 'PUBLISH BRAND IDENTITY'}</span>
        </button>
      </div>
    </form>
  );
};
