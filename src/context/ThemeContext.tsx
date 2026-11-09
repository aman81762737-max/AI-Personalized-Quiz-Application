import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ThemeMode,
  StudentAccentPreset,
  DashboardDensity,
  ChartAppearance,
  FontSizePreference,
  UserRole,
  InstitutionTheme,
  GeneratedAITheme,
} from '../types';
import {
  STUDENT_THEME_LIGHT,
  STUDENT_PRESETS,
  TEACHER_THEME_LIGHT,
  ADMIN_THEME_LIGHT,
  UNIVERSAL_DARK_THEME,
  INSTITUTION_BRAND_PALETTE,
} from '../design-system/tokens';
import { useOptionalAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;

  // System Settings Match
  matchSystemTheme: boolean;
  setMatchSystemTheme: (enabled: boolean) => void;
  syncWithSystemTheme: () => void;

  // AI Dynamic Custom Theme
  customAITheme: GeneratedAITheme | null;
  applyAITheme: (theme: GeneratedAITheme, instant?: boolean) => void;
  resetAITheme: () => void;

  // Pet Whiteboard Roller Theme Transition
  petThemeRollerEnabled: boolean;
  setPetThemeRollerEnabled: (enabled: boolean) => void;
  isTransitioning: boolean;
  transitionData: {
    themeName: string;
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    isDark: boolean;
  } | null;
  triggerThemeTransition: (options: {
    themeName?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    bg?: string;
    isDark?: boolean;
    onApply?: () => void;
  }) => void;
  testRollerAnimation: () => void;

  // Student Customization
  studentPreset: StudentAccentPreset;
  setStudentPreset: (preset: StudentAccentPreset) => void;
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;

  // Teacher Customization
  density: DashboardDensity;
  setDensity: (density: DashboardDensity) => void;
  chartAppearance: ChartAppearance;
  setChartAppearance: (appearance: ChartAppearance) => void;

  // Admin Institution Customization
  institutionTheme: InstitutionTheme;
  updateInstitutionTheme: (update: Partial<InstitutionTheme>) => Promise<void>;

  // Reset to role defaults
  resetRoleDefaults: () => void;
}

const defaultInstitutionTheme: InstitutionTheme = {
  institutionId: 'inst-default-01',
  institutionName: 'AI Personalized Quiz & Learning Platform',
  logo: 'Q',
  primaryColor: '#0F172A',
  secondaryColor: '#2563EB',
  accentColor: '#7C3AED',
  loginTagline: 'Empowering institutions with AI-driven assessments and adaptive mastery.',
  allowCustomBranding: true,
  updatedAt: new Date().toISOString(),
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getContrastColor(hex: string): string {
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6) return '#FFFFFF';
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#07090E' : '#FFFFFF';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useOptionalAuth();
  const role: UserRole = auth?.role || 'teacher';
  const userProfile = auth?.userProfile || null;

  const getActiveProfileId = (): string => {
    if (userProfile?.userId) return userProfile.userId;
    if (role) return `role_${role}`;
    return 'guest_public';
  };

  // Mode: Supports Bright Academic Mode ('light') and Universal Dark Mode ('dark')
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Student preferences: Scoped strictly per user profile
  const [studentPreset, setStudentPresetState] = useState<StudentAccentPreset>(() => {
    if (typeof window !== 'undefined') {
      const activeId = userProfile?.userId ? userProfile.userId : (role ? `role_${role}` : 'guest_public');
      const saved = localStorage.getItem(`ai_student_preset_${activeId}`) as StudentAccentPreset | null;
      if (saved && STUDENT_PRESETS[saved]) return saved;
    }
    return 'ai-blue';
  });

  const [fontSize, setFontSizeState] = useState<FontSizePreference>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_font_size') as FontSizePreference | null;
      if (saved) return saved;
    }
    return 'normal';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_high_contrast') === 'true';
    }
    return false;
  });

  // Teacher preferences
  const [density, setDensityState] = useState<DashboardDensity>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_density') as DashboardDensity | null;
      if (saved) return saved;
    }
    return 'comfortable';
  });

  const [chartAppearance, setChartAppearanceState] = useState<ChartAppearance>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_chart_appearance') as ChartAppearance | null;
      if (saved) return saved;
    }
    return 'default';
  });

  // Admin Institution Theme
  const [institutionTheme, setInstitutionTheme] = useState<InstitutionTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_institution_theme');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return defaultInstitutionTheme;
  });

  // Match System Settings
  const [matchSystemTheme, setMatchSystemThemeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_match_system_theme') === 'true';
    }
    return false;
  });

  // Pet Whiteboard Roller Theme Transition
  const [petThemeRollerEnabled, setPetThemeRollerEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_pet_theme_roller');
      if (saved !== null) return saved === 'true';
    }
    return true; // Default ON
  });

  const setPetThemeRollerEnabled = (enabled: boolean) => {
    setPetThemeRollerEnabledState(enabled);
    localStorage.setItem('ai_pet_theme_roller', String(enabled));
  };

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionData, setTransitionData] = useState<{
    themeName: string;
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    isDark: boolean;
  } | null>(null);

  const triggerThemeTransition = (options: {
    themeName?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    bg?: string;
    isDark?: boolean;
    onApply?: () => void;
  }) => {
    const isTargetDark = options.isDark ?? (mode === 'dark');
    const data = {
      themeName: options.themeName || (isTargetDark ? 'Universal Dark Mode' : 'Light Campus Mode'),
      primary: options.primary || (isTargetDark ? '#00F0FF' : '#3B82F6'),
      secondary: options.secondary || (isTargetDark ? '#A855F7' : '#7C3AED'),
      accent: options.accent || (isTargetDark ? '#00FF88' : '#2563EB'),
      bg: options.bg || (isTargetDark ? '#07090E' : '#F8FAFC'),
      isDark: isTargetDark,
    };
    setTransitionData(data);
    setIsTransitioning(true);

    // Apply the underlying theme state change at ~200ms when the expanding water ripple covers the center
    setTimeout(() => {
      if (options.onApply) {
        options.onApply();
      }
    }, 200);

    // Conclude water ripple shockwave transition once it has spread across the entire screen
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionData(null);
    }, 980);
  };

  const testRollerAnimation = () => {
    triggerThemeTransition({
      themeName: 'Universal Dark Mode',
      primary: '#3B82F6',
      secondary: '#A855F7',
      accent: '#06B6D4',
      bg: '#07090E',
      isDark: true,
      onApply: () => {
        setModeState('dark');
        localStorage.setItem('ai_theme_mode', 'dark');
        saveUserPreference({ mode: 'dark' });
      },
    });
  };

  const syncWithSystemTheme = () => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sysMode: ThemeMode = media.matches ? 'dark' : 'light';
    setModeState(sysMode);
    localStorage.setItem('ai_theme_mode', sysMode);
  };

  const setMatchSystemTheme = (enabled: boolean) => {
    setMatchSystemThemeState(enabled);
    localStorage.setItem('ai_match_system_theme', String(enabled));
    if (enabled && typeof window !== 'undefined') {
      syncWithSystemTheme();
    }
  };

  // Listen to OS theme changes if matchSystemTheme is enabled
  useEffect(() => {
    if (!matchSystemTheme || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const isSysDark = e.matches;
      const sysMode: ThemeMode = isSysDark ? 'dark' : 'light';
      triggerThemeTransition({
        themeName: `System OS Synced (${sysMode.toUpperCase()})`,
        primary: sysMode === 'dark' ? '#3B82F6' : '#2563EB',
        secondary: '#7C3AED',
        accent: '#06B6D4',
        isDark: isSysDark,
        onApply: () => {
          setModeState(sysMode);
          localStorage.setItem('ai_theme_mode', sysMode);
          saveUserPreference({ mode: sysMode });
        },
      });
    };
    media.addEventListener('change', handleSystemThemeChange);
    return () => media.removeEventListener('change', handleSystemThemeChange);
  }, [matchSystemTheme]);

  // AI Dynamic Custom Theme (Scoped strictly to the active profile)
  const [customAITheme, setCustomAIThemeState] = useState<GeneratedAITheme | null>(() => {
    if (typeof window !== 'undefined') {
      const activeId = userProfile?.userId || (role ? `profile_${role}` : 'guest');
      const saved = localStorage.getItem(`ai_custom_theme_${activeId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });

  const applyAITheme = (theme: GeneratedAITheme, instant: boolean = false) => {
    const activeId = getActiveProfileId();
    const normalizedTheme: GeneratedAITheme = {
      ...theme,
      mode: 'dark',
      bg: theme.bg || '#07090E',
      surface: theme.surface || '#0A0D14',
      card: theme.card || '#111827',
      text: theme.text || '#FFFFFF',
      textSecondary: theme.textSecondary || '#94A3B8',
      border: theme.border || 'rgba(255, 255, 255, 0.12)',
    };

    const applyLogic = () => {
      setCustomAIThemeState(normalizedTheme);
      setModeState('dark');
      localStorage.setItem(`ai_theme_mode_${activeId}`, 'dark');
      localStorage.setItem(`ai_custom_theme_${activeId}`, JSON.stringify(normalizedTheme));
      localStorage.removeItem('ai_custom_theme');

      saveUserPreference({ customAITheme: normalizedTheme, mode: 'dark' });

      if (userProfile?.userId) {
        try {
          setDoc(doc(db, 'users', userProfile.userId), { customAITheme: normalizedTheme, themePreference: { mode: 'dark' } }, { merge: true }).catch(() => {});
        } catch {}
      }
    };

    if (instant || !petThemeRollerEnabled) {
      applyLogic();
    } else {
      triggerThemeTransition({
        themeName: normalizedTheme.themeName,
        primary: normalizedTheme.primary,
        secondary: normalizedTheme.secondary,
        accent: normalizedTheme.accent,
        bg: normalizedTheme.bg,
        isDark: true,
        onApply: applyLogic,
      });
    }
  };

  const resetAITheme = () => {
    const activeId = getActiveProfileId();
    triggerThemeTransition({
      themeName: 'Default System Theme',
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#06B6D4',
      bg: mode === 'dark' ? '#020617' : '#F8FAFC',
      isDark: mode === 'dark',
      onApply: () => {
        setCustomAIThemeState(null);
        localStorage.removeItem(`ai_custom_theme_${activeId}`);
        localStorage.removeItem('ai_custom_theme');
        saveUserPreference({ customAITheme: null });
        if (userProfile?.userId) {
          try {
            updateDoc(doc(db, 'users', userProfile.userId), { customAITheme: null }).catch(() => {});
          } catch {}
        }
        if (typeof document !== 'undefined') {
          document.documentElement.removeAttribute('data-ai-theme');
          if (document.body) document.body.removeAttribute('data-ai-theme');
          const styleTag = document.getElementById('ai-theme-override-styles');
          if (styleTag) styleTag.remove();
        }
      },
    });
  };

  // Synchronize CSS Variables & Root Attributes dynamically
  useEffect(() => {
    const root = document.documentElement;

    // 1. Dynamic Dark vs Bright Mode Root Classes
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        document.body.setAttribute('data-theme', 'dark');
        if (!customAITheme) {
          document.body.style.backgroundColor = '#07090E';
          document.body.style.color = '#F8FAFC';
        }
      }
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        document.body.setAttribute('data-theme', 'light');
        if (!customAITheme) {
          document.body.style.backgroundColor = '#F8FAFC';
          document.body.style.color = '#0F172A';
        }
      }
    }

    // 2. High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Accessibility Attributes
    root.setAttribute('data-font-size', fontSize);
    root.setAttribute('data-density', density);

    // 4. Role-based CSS variables or AI Theme Override
    if (customAITheme && mode === 'dark') {
      root.setAttribute('data-ai-theme', 'true');
      if (typeof document !== 'undefined' && document.body) {
        document.body.setAttribute('data-ai-theme', 'true');
      }

      root.style.setProperty('--color-primary', customAITheme.primary);
      root.style.setProperty('--color-primary-hover', customAITheme.secondary);
      root.style.setProperty('--color-secondary', customAITheme.secondary);
      root.style.setProperty('--color-accent', customAITheme.accent);
      if (customAITheme.bg) root.style.setProperty('--bg-app', customAITheme.bg);
      if (customAITheme.surface) root.style.setProperty('--bg-surface', customAITheme.surface);
      if (customAITheme.card) root.style.setProperty('--bg-card', customAITheme.card);
      if (customAITheme.text) root.style.setProperty('--text-primary', customAITheme.text);
      if (customAITheme.textSecondary) root.style.setProperty('--text-secondary', customAITheme.textSecondary);
      if (customAITheme.border) root.style.setProperty('--border-color', customAITheme.border);
      if (typeof document !== 'undefined' && document.body) {
        if (customAITheme.bg) document.body.style.backgroundColor = customAITheme.bg;
        if (customAITheme.text) document.body.style.color = customAITheme.text;
      }

      // Inject runtime CSS overrides
      if (typeof document !== 'undefined') {
        let styleTag = document.getElementById('ai-theme-override-styles') as HTMLStyleElement | null;
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'ai-theme-override-styles';
          document.head.appendChild(styleTag);
        }
        const p = customAITheme.primary || "#00F0FF";
        const s = customAITheme.secondary || "#A855F7";
        const a = customAITheme.accent || "#00FF88";
        const bg = customAITheme.bg || "#07090E";
        const surface = customAITheme.surface || "#0A0D14";
        const card = customAITheme.card || "#111827";
        const text = customAITheme.text || "#FFFFFF";
        const textSecondary = customAITheme.textSecondary || "#94A3B8";
        const border = customAITheme.border || "rgba(255, 255, 255, 0.12)";
        const pText = getContrastColor(p);
        const sText = getContrastColor(s);
        const aText = getContrastColor(a);

        styleTag.innerHTML = `
          /* 1. Global Shells & Page Backgrounds */
          body, #root, .app-root-shell, main, [data-main-content], [data-app-root],
          [data-ai-theme="true"] [data-app-shell],
          [data-ai-theme="true"] [data-page-wrapper] {
            background-color: ${bg} !important;
            color: ${text} !important;
          }

          /* 2. Elevated Containers: Headers, Navbars, Sidebars, Modals, Drawers & Menus */
          header, nav, aside, [data-navbar],
          [data-ai-theme="true"] header,
          [data-ai-theme="true"] nav,
          [data-ai-theme="true"] aside,
          [data-ai-theme="true"] [role="dialog"],
          [data-ai-theme="true"] [role="dialog"] > div,
          [data-ai-theme="true"] [class*="bg-[#0A0D14]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#07090E]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#090D14]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#080B11]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#070A10]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#0B0F19]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#0B0F17]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#0D111A]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#0F172A]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#1E293B]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#020617]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#0B1120]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#0E131E]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#0E1218]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#07130E]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#060910]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#05070A]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-slate-900"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-slate-950"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-slate-50"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-slate-100"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-blue-50"]:not([data-ai-theme-preview="true"] *) {
            background-color: ${surface} !important;
            color: ${text} !important;
          }

          /* 3. Cards, Widgets, Nested Panels & Translucent Tiles */
          [data-ai-theme="true"] [class*="bg-slate-800"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-white/"]:not([class*="text-"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-white/[0."]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] .bg-white:not([data-ai-theme-preview="true"] *) {
            background-color: ${card} !important;
          }

          /* 4. Primary Brand Elements (Buttons, Solid Fills, Badges, Links) */
          [data-ai-theme="true"] [class*="bg-[#00F0FF]"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-blue-600"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-cyan-500"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] .bg-blue-600:not([data-ai-theme-preview="true"] *) {
            background-color: ${p} !important;
            color: ${pText} !important;
          }

          [data-ai-theme="true"] [class*="hover:bg-[#38bdf8]"]:hover,
          [data-ai-theme="true"] [class*="hover:bg-[#00F0FF]"]:hover,
          [data-ai-theme="true"] [class*="hover:bg-blue-500"]:hover,
          [data-ai-theme="true"] [class*="hover:bg-blue-700"]:hover {
            filter: brightness(1.15) !important;
          }

          /* Translucent Primary Badges */
          [data-ai-theme="true"] [class*="bg-[#00F0FF]/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-blue-500/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-blue-600/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-cyan-500/"]:not([data-ai-theme-preview="true"] *) {
            background-color: ${p}25 !important;
          }

          /* Primary Text & Icon Colors */
          [data-ai-theme="true"] [class*="text-[#00F0FF]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-blue-500"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-blue-600"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-blue-400"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-cyan-400"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-cyan-300"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="hover:text-[#00F0FF]"]:hover {
            color: ${p} !important;
          }

          /* Primary Borders */
          [data-ai-theme="true"] [class*="border-[#00F0FF]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-blue-500"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-cyan-500"]:not([data-ai-theme-preview="true"] *) {
            border-color: ${p}66 !important;
          }

          /* 5. Secondary Brand Elements (Purples, Violets, Indigos) */
          [data-ai-theme="true"] [class*="bg-purple-600"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-purple-500"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-indigo-600"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-violet-600"]:not([class*="/"]):not([data-ai-theme-preview="true"] *) {
            background-color: ${s} !important;
            color: ${sText} !important;
          }

          [data-ai-theme="true"] [class*="bg-purple-500/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-purple-950/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-indigo-500/"]:not([data-ai-theme-preview="true"] *) {
            background-color: ${s}22 !important;
          }

          [data-ai-theme="true"] [class*="text-purple-400"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-purple-300"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-indigo-400"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-violet-400"]:not([data-ai-theme-preview="true"] *) {
            color: ${s} !important;
          }

          [data-ai-theme="true"] [class*="border-purple-500"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-indigo-500"]:not([data-ai-theme-preview="true"] *) {
            border-color: ${s}66 !important;
          }

          /* 6. Accent Brand Elements (Emeralds, Mints, Faculty Greens) */
          [data-ai-theme="true"] [class*="bg-[#00FF88]"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#10B981]"]:not([class*="/"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-emerald-500"]:not([class*="/"]):not([data-ai-theme-preview="true"] *) {
            background-color: ${a} !important;
            color: ${aText} !important;
          }

          [data-ai-theme="true"] [class*="bg-[#00FF88]/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-[#10B981]/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-emerald-500/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="bg-emerald-950/"]:not([data-ai-theme-preview="true"] *) {
            background-color: ${a}22 !important;
          }

          [data-ai-theme="true"] [class*="text-[#00FF88]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-[#10B981]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-emerald-400"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-emerald-500"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-emerald-300"]:not([data-ai-theme-preview="true"] *) {
            color: ${a} !important;
          }

          [data-ai-theme="true"] [class*="border-[#00FF88]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-[#10B981]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-emerald-500"]:not([data-ai-theme-preview="true"] *) {
            border-color: ${a}66 !important;
          }

          /* 7. Gradients & Dynamic Fills */
          [data-ai-theme="true"] [class*="from-[#00F0FF]"][class*="to-[#00FF88]"],
          [data-ai-theme="true"] [class*="from-blue-600"][class*="to-cyan-500"] {
            background-image: linear-gradient(135deg, ${p}, ${a}) !important;
          }

          [data-ai-theme="true"] [class*="from-purple-500"][class*="to-indigo-600"],
          [data-ai-theme="true"] [class*="from-purple-600"][class*="to-blue-600"] {
            background-image: linear-gradient(135deg, ${s}, ${p}) !important;
          }

          /* 8. Text Hierarchies */
          [data-ai-theme="true"] [class*="text-white"]:not([class*="bg-"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-slate-100"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-slate-200"]:not([data-ai-theme-preview="true"] *) {
            color: ${text} !important;
          }

          [data-ai-theme="true"] [class*="text-slate-400"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-slate-500"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-[#94A3B8]"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="text-[#475569]"]:not([data-ai-theme-preview="true"] *) {
            color: ${textSecondary} !important;
          }

          /* 9. Container Borders & Dividers */
          [data-ai-theme="true"] [class*="border-white/"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-slate-800"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-slate-700"]:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] [class*="border-slate-900"]:not([data-ai-theme-preview="true"] *) {
            border-color: ${border} !important;
          }

          /* 10. Form Controls: Inputs, Textareas, Selects */
          [data-ai-theme="true"] input:not([type="checkbox"]):not([type="radio"]):not([type="color"]):not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] textarea:not([data-ai-theme-preview="true"] *),
          [data-ai-theme="true"] select:not([data-ai-theme-preview="true"] *) {
            background-color: ${surface} !important;
            color: ${text} !important;
            border-color: ${border} !important;
          }

          [data-ai-theme="true"] input:focus,
          [data-ai-theme="true"] textarea:focus,
          [data-ai-theme="true"] select:focus {
            border-color: ${p} !important;
            outline: none !important;
            box-shadow: 0 0 0 2px ${p}33 !important;
          }

          /* 11. Glow Box Shadows */
          [data-ai-theme="true"] [class*="shadow-[0_0_15px_rgba(0,240,255"],
          [data-ai-theme="true"] [class*="shadow-[0_0_20px_rgba(0,240,255"],
          [data-ai-theme="true"] [class*="shadow-[0_0_25px_rgba(0,240,255"] {
            box-shadow: 0 0 20px ${p}55 !important;
          }

          [data-ai-theme="true"] [class*="shadow-[0_0_20px_rgba(16,185,129"],
          [data-ai-theme="true"] [class*="shadow-[0_0_20px_rgba(0,255,136"] {
            box-shadow: 0 0 20px ${a}55 !important;
          }

          /* 12. SVG Stroke and Fill */
          [data-ai-theme="true"] svg[stroke="#00F0FF"] { stroke: ${p} !important; }
          [data-ai-theme="true"] svg [stroke="#00F0FF"] { stroke: ${p} !important; }
          [data-ai-theme="true"] svg [fill="#00F0FF"] { fill: ${p} !important; }
          [data-ai-theme="true"] svg [stroke="#00FF88"] { stroke: ${a} !important; }
          [data-ai-theme="true"] svg [fill="#00FF88"] { fill: ${a} !important; }
          [data-ai-theme="true"] svg [stroke="#10B981"] { stroke: ${a} !important; }
          [data-ai-theme="true"] svg [fill="#10B981"] { fill: ${a} !important; }

          /* 13. Scrollbars */
          [data-ai-theme="true"] ::-webkit-scrollbar-thumb {
            background: ${p}55 !important;
            border-radius: 9999px;
          }
          [data-ai-theme="true"] ::-webkit-scrollbar-track {
            background: ${bg} !important;
          }
        `;
      }
    } else {
      root.removeAttribute('data-ai-theme');
      if (typeof document !== 'undefined' && document.body) {
        document.body.removeAttribute('data-ai-theme');
        const styleTag = document.getElementById('ai-theme-override-styles');
        if (styleTag) styleTag.remove();
      }

      // Dynamic CSS Variables based on active mode
      if (mode === 'light') {
        const lightTheme = role === 'teacher'
          ? TEACHER_THEME_LIGHT
          : role === 'admin'
          ? ADMIN_THEME_LIGHT
          : STUDENT_THEME_LIGHT;

        root.style.setProperty('--color-primary', lightTheme.primary);
        root.style.setProperty('--color-secondary', lightTheme.secondary);
        root.style.setProperty('--color-accent', lightTheme.accent);
        root.style.setProperty('--bg-app', lightTheme.bg);
        root.style.setProperty('--bg-surface', lightTheme.surface);
        root.style.setProperty('--bg-card', lightTheme.card);
        root.style.setProperty('--text-primary', lightTheme.text);
        root.style.setProperty('--text-secondary', lightTheme.textSecondary);
        root.style.setProperty('--border-color', lightTheme.border);
      } else {
        root.style.setProperty('--color-primary', UNIVERSAL_DARK_THEME.primary);
        root.style.setProperty('--color-secondary', UNIVERSAL_DARK_THEME.secondary);
        root.style.setProperty('--color-accent', UNIVERSAL_DARK_THEME.accent);
        root.style.setProperty('--bg-app', UNIVERSAL_DARK_THEME.bg);
        root.style.setProperty('--bg-surface', UNIVERSAL_DARK_THEME.surface);
        root.style.setProperty('--bg-card', UNIVERSAL_DARK_THEME.card);
        root.style.setProperty('--text-primary', UNIVERSAL_DARK_THEME.text);
        root.style.setProperty('--text-secondary', UNIVERSAL_DARK_THEME.textSecondary);
        root.style.setProperty('--border-color', UNIVERSAL_DARK_THEME.border);
      }
    }
  }, [mode, role, studentPreset, fontSize, highContrast, density, institutionTheme, customAITheme]);

  // Profile-Isolated Theme Synchronization: On user/role switch or mount, strictly load THIS profile's theme
  useEffect(() => {
    const activeId = getActiveProfileId();

    // 1. Instantly check if THIS specific profile has an AI theme saved
    let profileAITheme: GeneratedAITheme | null = null;
    const localThemeKey = `ai_custom_theme_${activeId}`;
    const savedTheme = localStorage.getItem(localThemeKey);
    if (savedTheme) {
      try {
        profileAITheme = JSON.parse(savedTheme);
      } catch {}
    }

    // STRICT ISOLATION: If active profile does NOT have a custom AI theme, clear it immediately
    // so themes from other accounts (e.g. Student) never bleed into Teacher, Admin, or other students!
    if (profileAITheme) {
      setCustomAIThemeState(profileAITheme);
    } else {
      setCustomAIThemeState(null);
      if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-ai-theme');
        if (document.body) {
          document.body.removeAttribute('data-ai-theme');
          document.body.style.backgroundColor = '';
          document.body.style.color = '';
        }
        const styleTag = document.getElementById('ai-theme-override-styles');
        if (styleTag) styleTag.remove();
      }
    }

    // 2. Load mode preference strictly for this profile
    const savedMode = localStorage.getItem(`ai_theme_mode_${activeId}`) as ThemeMode | null;
    if (savedMode === 'dark' || savedMode === 'light') {
      setModeState(savedMode);
    } else if (profileAITheme?.mode) {
      setModeState(profileAITheme.mode);
    } else {
      setModeState('dark');
    }

    // 3. Load role-specific preferences for this profile
    const savedPreset = localStorage.getItem(`ai_student_preset_${activeId}`) as StudentAccentPreset | null;
    if (savedPreset && STUDENT_PRESETS[savedPreset]) {
      setStudentPresetState(savedPreset);
    } else {
      setStudentPresetState('ai-blue');
    }

    const savedDensity = localStorage.getItem(`ai_density_${activeId}`) as DashboardDensity | null;
    if (savedDensity) setDensityState(savedDensity);

    const savedChart = localStorage.getItem(`ai_chart_appearance_${activeId}`) as ChartAppearance | null;
    if (savedChart) setChartAppearanceState(savedChart);

    // 4. Query backend profile database (/api/theme/user/:userId)
    fetch(`/api/theme/user/${activeId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.customAITheme !== undefined) {
            setCustomAIThemeState(data.customAITheme);
            if (data.customAITheme) {
              localStorage.setItem(`ai_custom_theme_${activeId}`, JSON.stringify(data.customAITheme));
            } else {
              localStorage.removeItem(`ai_custom_theme_${activeId}`);
              if (typeof document !== 'undefined') {
                document.documentElement.removeAttribute('data-ai-theme');
                if (document.body) document.body.removeAttribute('data-ai-theme');
                const styleTag = document.getElementById('ai-theme-override-styles');
                if (styleTag) styleTag.remove();
              }
            }
          }
          if (!data.isDefault && (data.mode === 'light' || data.mode === 'dark')) {
            setModeState(data.mode);
            localStorage.setItem(`ai_theme_mode_${activeId}`, data.mode);
          }
          if (data.themePreset && data.themePreset in STUDENT_PRESETS) {
            setStudentPresetState(data.themePreset as StudentAccentPreset);
            localStorage.setItem(`ai_student_preset_${activeId}`, data.themePreset);
          }
          if (data.accessibility?.fontSize) {
            setFontSizeState(data.accessibility.fontSize);
          }
          if (typeof data.accessibility?.highContrast === 'boolean') {
            setHighContrastState(data.accessibility.highContrast);
          }
          if (data.density) {
            setDensityState(data.density);
          }
          if (data.chartAppearance) {
            setChartAppearanceState(data.chartAppearance);
          }
        }
      })
      .catch(() => {});

    // 5. Query Firestore profile document if authenticated user profile exists
    if (userProfile?.userId) {
      try {
        getDoc(doc(db, 'users', userProfile.userId))
          .then((snap) => {
            if (snap.exists()) {
              const uData = snap.data();
              if (uData.customAITheme) {
                setCustomAIThemeState(uData.customAITheme);
                localStorage.setItem(`ai_custom_theme_${userProfile.userId}`, JSON.stringify(uData.customAITheme));
              } else {
                setCustomAIThemeState(null);
                localStorage.removeItem(`ai_custom_theme_${userProfile.userId}`);
                if (typeof document !== 'undefined') {
                  document.documentElement.removeAttribute('data-ai-theme');
                  if (document.body) {
                    document.body.removeAttribute('data-ai-theme');
                    document.body.style.backgroundColor = '';
                    document.body.style.color = '';
                  }
                  const styleTag = document.getElementById('ai-theme-override-styles');
                  if (styleTag) styleTag.remove();
                }
                if (uData.themePreference?.mode) {
                  setModeState(uData.themePreference.mode);
                  localStorage.setItem(`ai_theme_mode_${userProfile.userId}`, uData.themePreference.mode);
                }
              }
            }
          })
          .catch(() => {});
      } catch {}
    }

    // 6. Fetch institution branding
    fetch('/api/theme/institution')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.primaryColor) {
          setInstitutionTheme(data);
          localStorage.setItem('ai_institution_theme', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, [userProfile?.userId, role]);

  const saveUserPreference = (updates: any) => {
    const activeId = getActiveProfileId();
    fetch('/api/theme/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: activeId,
        role,
        mode,
        themePreset: studentPreset,
        accessibility: { fontSize, highContrast },
        density,
        chartAppearance,
        customAITheme,
        ...updates,
      }),
    }).catch(() => {});

    if (userProfile?.userId) {
      try {
        setDoc(
          doc(db, 'users', userProfile.userId),
          {
            themePreference: {
              mode,
              themePreset: studentPreset,
              accessibility: { fontSize, highContrast },
              density,
              chartAppearance,
              ...updates,
            },
          },
          { merge: true }
        ).catch(() => {});
      } catch {}
    }
  };

  const isDark = mode === 'dark';

  const applyThemeMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('ai_theme_mode', newMode);
    const activeId = getActiveProfileId();
    localStorage.setItem(`ai_theme_mode_${activeId}`, newMode);
    saveUserPreference({ mode: newMode });

    if (newMode === 'light') {
      setCustomAIThemeState(null);
      localStorage.removeItem(`ai_custom_theme_${activeId}`);
      localStorage.removeItem('ai_custom_theme');
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.removeAttribute('data-ai-theme');
        if (document.body) {
          document.body.classList.remove('dark');
          document.body.classList.add('light');
          document.body.setAttribute('data-theme', 'light');
          document.body.removeAttribute('data-ai-theme');
          document.body.style.backgroundColor = '#F8FAFC';
          document.body.style.color = '#0F172A';
        }
        const styleTag = document.getElementById('ai-theme-override-styles');
        if (styleTag) styleTag.remove();
      }
    } else {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
        if (document.body) {
          document.body.classList.add('dark');
          document.body.classList.remove('light');
          document.body.setAttribute('data-theme', 'dark');
          document.body.style.backgroundColor = customAITheme?.bg || '#07090E';
          document.body.style.color = customAITheme?.text || '#F8FAFC';
        }
      }
    }
  };

  const setMode = (newMode: ThemeMode) => {
    if (newMode === mode && !customAITheme) return;
    const isTargetDark = newMode === 'dark';
    triggerThemeTransition({
      themeName: newMode === 'light' ? 'Bright Academic Mode' : 'Universal Dark Mode',
      primary: newMode === 'light' ? '#3B82F6' : '#00F0FF',
      secondary: newMode === 'light' ? '#2563EB' : '#A855F7',
      accent: newMode === 'light' ? '#06B6D4' : '#00FF88',
      bg: newMode === 'light' ? '#F8FAFC' : '#07090E',
      isDark: isTargetDark,
      onApply: () => applyThemeMode(newMode),
    });
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
  };

  const setStudentPreset = (preset: StudentAccentPreset) => {
    const activeId = getActiveProfileId();
    setStudentPresetState(preset);
    localStorage.setItem(`ai_student_preset_${activeId}`, preset);
    saveUserPreference({ themePreset: preset });
  };

  const setFontSize = (size: FontSizePreference) => {
    const activeId = getActiveProfileId();
    setFontSizeState(size);
    localStorage.setItem(`ai_font_size_${activeId}`, size);
    saveUserPreference({ accessibility: { fontSize: size, highContrast } });
  };

  const setHighContrast = (enabled: boolean) => {
    const activeId = getActiveProfileId();
    setHighContrastState(enabled);
    localStorage.setItem(`ai_high_contrast_${activeId}`, String(enabled));
    saveUserPreference({ accessibility: { fontSize, highContrast: enabled } });
  };

  const setDensity = (newDensity: DashboardDensity) => {
    const activeId = getActiveProfileId();
    setDensityState(newDensity);
    localStorage.setItem(`ai_density_${activeId}`, newDensity);
    saveUserPreference({ density: newDensity });
  };

  const setChartAppearance = (appearance: ChartAppearance) => {
    const activeId = getActiveProfileId();
    setChartAppearanceState(appearance);
    localStorage.setItem(`ai_chart_appearance_${activeId}`, appearance);
    saveUserPreference({ chartAppearance: appearance });
  };

  const updateInstitutionTheme = async (update: Partial<InstitutionTheme>) => {
    const merged = { ...institutionTheme, ...update, updatedAt: new Date().toISOString() };
    setInstitutionTheme(merged);
    localStorage.setItem('ai_institution_theme', JSON.stringify(merged));

    try {
      await fetch('/api/theme/institution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
    } catch {}
  };

  const resetRoleDefaults = () => {
    const activeId = getActiveProfileId();
    resetAITheme();
    setModeState('dark');
    setStudentPresetState('ai-blue');
    setFontSizeState('normal');
    setHighContrastState(false);
    setDensityState('comfortable');
    setChartAppearanceState('default');
    localStorage.removeItem(`ai_theme_mode_${activeId}`);
    localStorage.removeItem(`ai_student_preset_${activeId}`);
    localStorage.removeItem(`ai_font_size_${activeId}`);
    localStorage.removeItem(`ai_high_contrast_${activeId}`);
    localStorage.removeItem(`ai_density_${activeId}`);
    localStorage.removeItem(`ai_chart_appearance_${activeId}`);
    localStorage.removeItem(`ai_custom_theme_${activeId}`);
    localStorage.removeItem('ai_custom_theme');
    saveUserPreference({
      mode: 'dark',
      themePreset: 'ai-blue',
      accessibility: { fontSize: 'normal', highContrast: false },
      density: 'comfortable',
      chartAppearance: 'default',
      customAITheme: null,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        toggleTheme,
        setMode,
        matchSystemTheme,
        setMatchSystemTheme,
        syncWithSystemTheme,
        customAITheme,
        applyAITheme,
        resetAITheme,
        petThemeRollerEnabled,
        setPetThemeRollerEnabled,
        isTransitioning,
        transitionData,
        triggerThemeTransition,
        testRollerAnimation,
        studentPreset,
        setStudentPreset,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        density,
        setDensity,
        chartAppearance,
        setChartAppearance,
        institutionTheme,
        updateInstitutionTheme,
        resetRoleDefaults,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
