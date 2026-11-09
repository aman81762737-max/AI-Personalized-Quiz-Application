import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useOptionalAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { useToast } from '../common/Toast';
import { GeneratedAITheme } from '../../types';
import {
  Sparkles,
  Palette,
  Check,
  RotateCcw,
  Moon,
  Zap,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sliders,
  Copy,
  History,
  Trash2,
  Maximize2,
  Wand2,
  Layers,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import {
  AnimatedButton,
  AIThinkingAnimation,
  SlideUp,
} from '../animation/AnimationComponents';

interface ThemeCategory {
  category: string;
  vibes: Array<{
    label: string;
    prompt: string;
    icon: string;
    previewHex: string;
    preset: GeneratedAITheme;
  }>;
}

const THEME_CATEGORIES: ThemeCategory[] = [
  {
    category: 'Vibrant & Modern',
    vibes: [
      {
        label: 'Cyberpunk Neon',
        prompt: 'Cyberpunk neon violet and electric cyan dark mode',
        icon: '⚡',
        previewHex: '#8B5CF6',
        preset: {
          themeName: 'Cyberpunk Neon Matrix',
          explanation: 'Vibrant neon purple and electric cyan with deep contrast for high focus.',
          primary: '#8B5CF6',
          secondary: '#6D28D9',
          accent: '#00F0FF',
          bg: '#0B0F19',
          surface: '#111827',
          card: '#1F2937',
          text: '#F9FAFB',
          textSecondary: '#9CA3AF',
          border: '#374151',
          mode: 'dark',
        },
      },
      {
        label: 'Warm Autumn Sunset',
        prompt: 'Warm sunset terracotta, burnt orange, and amber gold',
        icon: '🌅',
        previewHex: '#EA580C',
        preset: {
          themeName: 'Warm Autumn Sunset',
          explanation: 'Inviting terracotta and amber tones for a stimulating, energetic study flow.',
          primary: '#EA580C',
          secondary: '#C2410C',
          accent: '#F59E0B',
          bg: '#1A0E08',
          surface: '#2E1508',
          card: '#431407',
          text: '#FFF7ED',
          textSecondary: '#FDBA74',
          border: '#7C2D12',
          mode: 'dark',
        },
      },
      {
        label: 'Citrus Energy',
        prompt: 'Vibrant citrus lime green with electric yellow accents',
        icon: '🍋',
        previewHex: '#10B981',
        preset: {
          themeName: 'Citrus Lime Energy',
          explanation: 'Electric lime green and vivid yellow accents on obsidian dark mode.',
          primary: '#10B981',
          secondary: '#059669',
          accent: '#FACC15',
          bg: '#061C14',
          surface: '#0C2D20',
          card: '#133D2D',
          text: '#F0FDF4',
          textSecondary: '#86EFAC',
          border: '#166534',
          mode: 'dark',
        },
      },
      {
        label: 'Royal Amethyst',
        prompt: 'Deep royal purple and amethyst with bright magenta glow',
        icon: '🍇',
        previewHex: '#9333EA',
        preset: {
          themeName: 'Royal Amethyst Glow',
          explanation: 'Regal amethyst purple and radiant magenta for high creative mastery.',
          primary: '#9333EA',
          secondary: '#7E22CE',
          accent: '#EC4899',
          bg: '#130B1E',
          surface: '#221237',
          card: '#301A4E',
          text: '#FAF5FF',
          textSecondary: '#D8B4FE',
          border: '#581C87',
          mode: 'dark',
        },
      },
    ],
  },
  {
    category: 'Calm & Grounded',
    vibes: [
      {
        label: 'Emerald Sanctuary',
        prompt: 'Emerald forest deep botanical green with warm gold accents',
        icon: '🌲',
        previewHex: '#059669',
        preset: {
          themeName: 'Emerald Forest Sanctuary',
          explanation: 'Natural botanical greens balanced with warm golden accents for grounded learning.',
          primary: '#059669',
          secondary: '#047857',
          accent: '#F59E0B',
          bg: '#062016',
          surface: '#064E3B',
          card: '#0B3629',
          text: '#F0FDF4',
          textSecondary: '#A7F3D0',
          border: '#047857',
          mode: 'dark',
        },
      },
      {
        label: 'Pacific Ocean Deep',
        prompt: 'Deep ocean navy blue with crisp aqua cyan highlights',
        icon: '🌊',
        previewHex: '#0284C7',
        preset: {
          themeName: 'Pacific Deep Ocean',
          explanation: 'Serene marine blues and crisp aqua highlights for sustained cognitive calm.',
          primary: '#0284C7',
          secondary: '#0369A1',
          accent: '#00F0FF',
          bg: '#081726',
          surface: '#0C2D48',
          card: '#143D63',
          text: '#F0F9FF',
          textSecondary: '#7DD3FC',
          border: '#0369A1',
          mode: 'dark',
        },
      },
      {
        label: 'Warm Espresso & Cream',
        prompt: 'Warm espresso roasted coffee and parchment cream',
        icon: '☕',
        previewHex: '#78350F',
        preset: {
          themeName: 'Warm Espresso & Cream',
          explanation: 'Rich roasted coffee tones paired with deep ember surfaces.',
          primary: '#78350F',
          secondary: '#92400E',
          accent: '#D97706',
          bg: '#1A120B',
          surface: '#2B1E12',
          card: '#3E2A1A',
          text: '#FEFCE8',
          textSecondary: '#FDE68A',
          border: '#78350F',
          mode: 'dark',
        },
      },
      {
        label: 'Sakura Blossom',
        prompt: 'Soft sakura rose pink and elegant slate',
        icon: '🌸',
        previewHex: '#DB2777',
        preset: {
          themeName: 'Midnight Sakura Blossom',
          explanation: 'Elegant rose sakura petals glowing over dusk slate surfaces.',
          primary: '#DB2777',
          secondary: '#BE185D',
          accent: '#F472B6',
          bg: '#1F0D16',
          surface: '#2F1422',
          card: '#411C30',
          text: '#FDF2F8',
          textSecondary: '#FBCFE8',
          border: '#831843',
          mode: 'dark',
        },
      },
    ],
  },
  {
    category: 'Academic & Clean',
    vibes: [
      {
        label: 'Crimson Heritage',
        prompt: 'Prestigious Harvard crimson ruby and slate accents',
        icon: '🎓',
        previewHex: '#991B1B',
        preset: {
          themeName: 'Academic Crimson Heritage',
          explanation: 'Prestigious deep crimson and slate accents reflecting institutional rigor.',
          primary: '#DC2626',
          secondary: '#991B1B',
          accent: '#F59E0B',
          bg: '#1A0808',
          surface: '#330B0B',
          card: '#4A0E0E',
          text: '#FEF2F2',
          textSecondary: '#FCA5A5',
          border: '#7F1D1D',
          mode: 'dark',
        },
      },
      {
        label: 'Tokyo Midnight',
        prompt: 'Minimalist Tokyo midnight sapphire dark theme',
        icon: '🌌',
        previewHex: '#3B82F6',
        preset: {
          themeName: 'Tokyo Midnight Sapphire',
          explanation: 'Minimalist Tokyo midnight sapphire dark theme with electric cyan highlights.',
          primary: '#3B82F6',
          secondary: '#1D4ED8',
          accent: '#00F0FF',
          bg: '#070C18',
          surface: '#0E172A',
          card: '#14223F',
          text: '#F8FAFC',
          textSecondary: '#94A3B8',
          border: '#1E293B',
          mode: 'dark',
        },
      },
      {
        label: 'Nordic Frost',
        prompt: 'Nordic minimalist frosty steel blue and clean white',
        icon: '❄️',
        previewHex: '#64748B',
        preset: {
          themeName: 'Nordic Frost Steel',
          explanation: 'Nordic minimalist steel and iceberg cyan accents on arctic dark backdrop.',
          primary: '#64748B',
          secondary: '#475569',
          accent: '#38BDF8',
          bg: '#0A0F1D',
          surface: '#111A2E',
          card: '#18243E',
          text: '#F8FAFC',
          textSecondary: '#CBD5E1',
          border: '#334155',
          mode: 'dark',
        },
      },
      {
        label: 'Retro Amber Terminal',
        prompt: 'Retro sci-fi amber terminal phosphor on carbon dark',
        icon: '🪐',
        previewHex: '#D97706',
        preset: {
          themeName: 'Retro Amber Terminal',
          explanation: 'Retro sci-fi amber terminal phosphor on carbon dark with high contrast.',
          primary: '#D97706',
          secondary: '#B45309',
          accent: '#F59E0B',
          bg: '#150F05',
          surface: '#22190A',
          card: '#322510',
          text: '#FFFBEB',
          textSecondary: '#FDE68A',
          border: '#78350F',
          mode: 'dark',
        },
      },
    ],
  },
];

export const DEFAULT_STUDIO_THEME: GeneratedAITheme = {
  themeName: 'Obsidian Neon Matrix',
  explanation: 'High-contrast dark mode with electric cyan primary, violet secondary, and mint highlights.',
  primary: '#00F0FF',
  secondary: '#A855F7',
  accent: '#00FF88',
  bg: '#07090E',
  surface: '#0A0D14',
  card: '#111827',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.12)',
  mode: 'dark',
};

export const AIThemeGenerator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    customAITheme,
    applyAITheme,
    resetAITheme,
    mode,
    matchSystemTheme,
    syncWithSystemTheme,
    setMatchSystemTheme,
    testRollerAnimation,
    petThemeRollerEnabled,
  } = useTheme();
  const { showToast } = useToast();

  const auth = useOptionalAuth();
  const activeProfileId = auth?.userProfile?.userId || (auth?.role ? `profile_${auth.role}` : 'guest');

  const [prompt, setPrompt] = useState('');
  const [preferredMode, setPreferredMode] = useState<'auto' | 'light' | 'dark'>('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<GeneratedAITheme>(customAITheme || DEFAULT_STUDIO_THEME);
  const [activeCategory, setActiveCategory] = useState<string>('Vibrant & Modern');

  // Interactive sample state for live test preview
  const [selectedMockOption, setSelectedMockOption] = useState<number>(1);

  // Saved theme history in localStorage (Isolated per profile)
  const [history, setHistory] = useState<GeneratedAITheme[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`ai_theme_history_${activeProfileId}`);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Track active profile theme changes: when customAITheme changes (e.g. role switch), update preview
  useEffect(() => {
    setPreviewTheme(customAITheme || DEFAULT_STUDIO_THEME);
  }, [customAITheme]);

  // When active profile switches, reload that profile's specific theme history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`ai_theme_history_${activeProfileId}`);
        if (saved) {
          setHistory(JSON.parse(saved));
        } else {
          setHistory([]);
        }
      } catch {
        setHistory([]);
      }
    }
  }, [activeProfileId]);

  const saveToHistory = (theme: GeneratedAITheme) => {
    setHistory((prev) => {
      const filtered = prev.filter((t) => t.themeName !== theme.themeName);
      const updated = [theme, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(`ai_theme_history_${activeProfileId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleGenerate = async (queryToUse?: string) => {
    const finalPrompt = queryToUse || prompt;
    if (!finalPrompt.trim()) {
      showToast('Please type a color vibe or select a preset prompt.', 'info');
      return;
    }

    setIsGenerating(true);
    try {
      showToast('Gemini is synthesizing custom color palette...', 'info');
      const targetMode = preferredMode === 'auto' ? undefined : preferredMode;
      const theme = await aiService.generateTheme({
        prompt: finalPrompt,
        mode: targetMode,
      });

      setPreviewTheme(theme);
      applyAITheme(theme);
      saveToHistory(theme);
      showToast(`Applied "${theme.themeName}" to your profile database!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to generate theme with AI.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (themeToApply: GeneratedAITheme) => {
    applyAITheme(themeToApply);
    saveToHistory(themeToApply);
    showToast(`Applied "${themeToApply.themeName}" to your profile database!`, 'success');
  };

  const handleReset = () => {
    resetAITheme();
    setPreviewTheme(DEFAULT_STUDIO_THEME);
    setPrompt('');
    showToast('Reverted to default obsidian system theme', 'info');
  };

  const handleColorChange = (key: keyof GeneratedAITheme, val: string) => {
    const base = previewTheme || DEFAULT_STUDIO_THEME;
    const updated: GeneratedAITheme = {
      ...base,
      [key]: val,
      mode: 'dark',
    };
    setPreviewTheme(updated);
    applyAITheme(updated, true);
  };

  const handleSwapPrimaryAccent = () => {
    const base = previewTheme || DEFAULT_STUDIO_THEME;
    const updated: GeneratedAITheme = {
      ...base,
      primary: base.accent,
      accent: base.primary,
      mode: 'dark',
    };
    setPreviewTheme(updated);
    applyAITheme(updated, true);
    showToast('Swapped Primary & Accent colors app-wide!', 'info');
  };

  const handleDeepObsidianSurfaces = () => {
    const base = previewTheme || DEFAULT_STUDIO_THEME;
    const updated: GeneratedAITheme = {
      ...base,
      bg: '#05070A',
      surface: '#090D14',
      card: '#101624',
      border: 'rgba(255, 255, 255, 0.12)',
      mode: 'dark',
    };
    setPreviewTheme(updated);
    applyAITheme(updated, true);
    showToast('Applied ultra-deep obsidian background & surfaces', 'info');
  };

  const handleMaxContrastText = () => {
    const base = previewTheme || DEFAULT_STUDIO_THEME;
    const updated: GeneratedAITheme = {
      ...base,
      text: '#FFFFFF',
      textSecondary: '#E2E8F0',
      border: 'rgba(255, 255, 255, 0.2)',
      mode: 'dark',
    };
    setPreviewTheme(updated);
    applyAITheme(updated, true);
    showToast('Maximized typography readability & contrast', 'info');
  };

  const handleCopyCSS = () => {
    if (!previewTheme) return;
    const css = `:root {
  --color-primary: ${previewTheme.primary};
  --color-secondary: ${previewTheme.secondary};
  --color-accent: ${previewTheme.accent};
  --bg-app: ${previewTheme.bg};
  --bg-surface: ${previewTheme.surface};
  --bg-card: ${previewTheme.card};
  --text-primary: ${previewTheme.text};
  --text-secondary: ${previewTheme.textSecondary};
  --border-color: ${previewTheme.border};
}`;
    navigator.clipboard?.writeText(css);
    showToast('Copied CSS Theme Variables to clipboard!', 'success');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`ai_theme_history_${activeProfileId}`);
    localStorage.removeItem('ai_theme_history');
    showToast('Cleared theme history', 'info');
  };

  return (
    <div className={`space-y-6 ${compact ? '' : 'p-6 sm:p-8 bg-white/[0.03] dark:bg-[#0A0D14]/90 rounded-2xl border border-white/10 dark:border-white/10 shadow-xs'}`}>
      {/* Header */}
      <div className="border-b border-white/10 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] dark:text-[#A855F7] mb-1">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span>Gemini AI Color Studio</span>
          </div>
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
            Dynamic App Theme & Palette Generator
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Describe any aesthetic mood, university branding, or color vibe in natural language — Gemini synthesizes and applies the theme app-wide instantly.
          </p>
        </div>

        {customAITheme && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Active: {customAITheme.themeName}</span>
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-[#475569] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>


      {/* Prompt Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Wand2 className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-3" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Warm sunset terracotta with amber accents' or 'Nordic minimalist steel blue'..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-white/10 dark:border-white/10 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white focus:outline-hidden focus:border-[#7C3AED] shadow-xs"
            />
          </div>

          {/* Universal Dark Mode Indicator */}
          <div className="flex items-center gap-1.5 bg-[#0F172A] px-3 py-2 rounded-xl border border-white/10 shrink-0 text-xs text-slate-300">
            <Moon className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-xs font-semibold text-white">Universal Dark Mode</span>
          </div>

          <AnimatedButton
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            isAI={true}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Generate & Apply</span>
          </AnimatedButton>
        </div>
      </form>

      {/* Preset Mood Categories */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider block">
            Curated Inspiration Presets (Click to Apply Instantly):
          </label>
          <div className="flex items-center gap-1">
            {THEME_CATEGORIES.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveCategory(cat.category)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.category
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEME_CATEGORIES.find((c) => c.category === activeCategory)?.vibes.map((vibe, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(vibe.prompt);
                if (vibe.preset) {
                  setPreviewTheme(vibe.preset);
                  applyAITheme(vibe.preset, true);
                  saveToHistory(vibe.preset);
                  showToast(`Applied "${vibe.preset.themeName}" across platform!`, 'success');
                } else {
                  handleGenerate(vibe.prompt);
                }
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 dark:border-white/10 bg-white dark:bg-[#0F172A] hover:border-[#7C3AED] hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] transition-all cursor-pointer shadow-xs active:scale-95 text-left group"
            >
              <div
                className="w-4 h-4 rounded-full shrink-0 border border-black/15 shadow-xs"
                style={{ backgroundColor: vibe.previewHex }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs truncate group-hover:text-[#7C3AED] transition-colors">
                  {vibe.icon} {vibe.label}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme History Chips */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10 dark:border-white/10">
          <div className="flex items-center justify-between text-[11px] text-[#475569] dark:text-[#94A3B8]">
            <span className="font-bold flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              <span>Recent AI Themes ({history.length})</span>
            </span>
            <button
              type="button"
              onClick={clearHistory}
              className="text-[10px] hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {history.map((th, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPreviewTheme(th);
                  handleApply(th);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 dark:border-white/10 bg-white dark:bg-[#0F172A] hover:border-[#7C3AED] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] transition-all shadow-xs cursor-pointer"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: th.primary }}
                />
                <span className="truncate max-w-[140px]">{th.themeName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Animation */}
      {isGenerating && (
        <AIThinkingAnimation
          message="Synthesizing calibrated color palette with Gemini..."
          subMessage="Computing harmonious primary, surface, and semantic contrasts"
        />
      )}

      {/* Live Interactive Preview & Fine-tuner */}
      {previewTheme && !isGenerating && (
        <SlideUp>
          <div className="p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-slate-50 dark:bg-[#0F172A] space-y-5 shadow-xs">
            {/* Header info & primary actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: previewTheme.primary }}
                  />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {previewTheme.themeName}
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {previewTheme.mode || 'dynamic'}
                  </span>
                </div>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                  {previewTheme.explanation}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleCopyCSS}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#475569] dark:text-[#94A3B8] bg-white/[0.03] dark:bg-[#0A0D14]/90 border border-white/10 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  title="Copy CSS variables"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CSS</span>
                </button>

                <AnimatedButton
                  type="button"
                  onClick={() => handleApply(previewTheme)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  style={{ backgroundColor: previewTheme.primary }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply App-Wide</span>
                </AnimatedButton>

                {customAITheme && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Reset to default theme"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Color Fine-Tuning Chips */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider block">
                Interactive Color Fine-Tuner:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {/* 1. Primary Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Primary</span>
                    <input
                      type="color"
                      value={previewTheme.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 2. Secondary Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Secondary</span>
                    <input
                      type="color"
                      value={previewTheme.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 3. Accent Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Accent</span>
                    <input
                      type="color"
                      value={previewTheme.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 4. Background Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Background</span>
                    <input
                      type="color"
                      value={previewTheme.bg || '#07090E'}
                      onChange={(e) => handleColorChange('bg', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.bg || '#07090E'}
                    onChange={(e) => handleColorChange('bg', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 5. Surface Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Surface</span>
                    <input
                      type="color"
                      value={previewTheme.surface || '#0A0D14'}
                      onChange={(e) => handleColorChange('surface', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.surface || '#0A0D14'}
                    onChange={(e) => handleColorChange('surface', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 6. Card Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Card</span>
                    <input
                      type="color"
                      value={previewTheme.card || '#111827'}
                      onChange={(e) => handleColorChange('card', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.card || '#111827'}
                    onChange={(e) => handleColorChange('card', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 7. Text Primary Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Text</span>
                    <input
                      type="color"
                      value={previewTheme.text || '#FFFFFF'}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.text || '#FFFFFF'}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 8. Text Subtitle Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Subtext</span>
                    <input
                      type="color"
                      value={previewTheme.textSecondary || '#94A3B8'}
                      onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.textSecondary || '#94A3B8'}
                    onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>

                {/* 9. Border Picker */}
                <div className="p-2 rounded-xl border border-white/10 bg-white/[0.03] dark:bg-[#0A0D14]/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white">
                    <span>Border</span>
                    <input
                      type="color"
                      value={previewTheme.border || '#334155'}
                      onChange={(e) => handleColorChange('border', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={previewTheme.border || '#334155'}
                    onChange={(e) => handleColorChange('border', e.target.value)}
                    className="w-full px-1.5 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-900 text-white text-center uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </SlideUp>
      )}
    </div>
  );
};
