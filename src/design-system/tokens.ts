/**
 * NOCTURNE AURORA Design System Tokens
 *
 * Strict Color System:
 * - Obsidian: #0E0C10 (Premium intelligence and depth)
 * - Aubergine: #211522 (Depth and focus)
 * - Electric Violet: #8B5CF6 (AI and assessment)
 * - Aurora Teal: #68E0D0 (Learning and knowledge)
 * - Luminous Mint: #C7F36D (Progress and mastery)
 * - Soft Coral: #FF786B (Attention and human energy)
 * - Warm Ivory: #F5F0E7 (Clean academic surfaces)
 * - Dusty Lilac: #B9ADBF (Subtle structure)
 * - Ink: #17131A (Crisp typography)
 * - Plum Gray: #3A2D3C (Muted borders and elevations)
 */
import { StudentAccentPreset } from '../types';

export const NOCTURNE_AURORA = {
  obsidian: '#0E0C10',
  aubergine: '#211522',
  electricViolet: '#8B5CF6',
  auroraTeal: '#68E0D0',
  luminousMint: '#C7F36D',
  softCoral: '#FF786B',
  warmIvory: '#F5F0E7',
  dustyLilac: '#B9ADBF',
  ink: '#17131A',
  plumGray: '#3A2D3C',
} as const;

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  bg: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
}

// 1. Student Default Theme: "AI Learning Blue"
export const STUDENT_THEME_LIGHT: ThemeColors = {
  primary: '#2563EB',
  secondary: '#7C3AED',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
};

// Student Preset Palettes
export const STUDENT_PRESETS: Record<
  StudentAccentPreset,
  { name: string; description: string; primary: string; secondary: string; accent: string }
> = {
  'ai-blue': {
    name: 'AI Blue',
    description: 'Blue + Purple + Cyan (Balanced intelligent learning)',
    primary: '#2563EB',
    secondary: '#7C3AED',
    accent: '#06B6D4',
  },
  'calm-learning': {
    name: 'Calm Learning',
    description: 'Green + Blue + Soft Neutral (Reduces cognitive fatigue)',
    primary: '#059669',
    secondary: '#0284C7',
    accent: '#10B981',
  },
  'focus-mode': {
    name: 'Focus Mode',
    description: 'Low contrast neutral slate (Distraction-free deep study)',
    primary: '#475569',
    secondary: '#334155',
    accent: '#64748B',
  },
  'dark-intelligence': {
    name: 'Dark Intelligence',
    description: 'Navy + Purple + Cyan (Futuristic high-tech aesthetic)',
    primary: '#1E3A8A',
    secondary: '#9333EA',
    accent: '#06B6D4',
  },
};

// 2. Teacher Default Theme: "Academic Analytics"
export const TEACHER_THEME_LIGHT: ThemeColors = {
  primary: '#1D4ED8',
  secondary: '#6366F1',
  accent: '#06B6D4',
  success: '#16A34A',
  warning: '#F97316',
  error: '#DC2626',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
};

// 3. Admin Default Theme: "Neural Control"
export const ADMIN_THEME_LIGHT: ThemeColors = {
  primary: '#0F172A',
  secondary: '#2563EB',
  accent: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#DC2626',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
};

// 4. Universal Dark Theme
export const UNIVERSAL_DARK_THEME: ThemeColors = {
  primary: '#3B82F6',
  secondary: '#A855F7',
  accent: '#22D3EE',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  bg: '#020617',
  surface: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
};

// 5. Assessment Lock Mode (Fixed Theme, Strictly Non-Customizable)
export const ASSESSMENT_LOCK_THEME = {
  bg: '#F8FAFC',
  questionCards: '#FFFFFF',
  timer: '#DC2626',
  submit: '#16A34A',
  warning: '#F59E0B',
  violation: '#B91C1C',
  text: '#0F172A',
  border: '#E2E8F0',
} as const;

// Curated Institution Branding Color Palette for Admins
export const INSTITUTION_BRAND_PALETTE = [
  { name: 'Royal AI Blue', hex: '#2563EB' },
  { name: 'Oxford Navy', hex: '#1E3A8A' },
  { name: 'Deep Slate', hex: '#0F172A' },
  { name: 'Emerald Academy', hex: '#047857' },
  { name: 'Imperial Violet', hex: '#6B21A8' },
  { name: 'Crimson Institute', hex: '#991B1B' },
];

export const CHART_PALETTE = {
  mastered: '#10B981', // Success Green
  progress: '#2563EB', // AI Blue
  review: '#F59E0B',   // Warning Orange
  weak: '#EF4444',     // Error Red
  recommendations: '#7C3AED', // AI Purple
  analyticsCyan: '#06B6D4',   // AI Cyan
};

export const BRAND_COLORS = {
  primaryBlue: '#2563EB',
  neuralNavy: '#1E3A8A',
  aiPurple: '#7C3AED',
  aiCyan: '#06B6D4',
  successGreen: '#10B981',
  warningOrange: '#F59E0B',
  errorRed: '#EF4444',
  examTimer: '#DC2626',
  examSubmit: '#16A34A',
  examViolation: '#B91C1C',
};

export const GRADIENT_STYLE = 'from-[#2563EB] via-[#7C3AED] to-[#06B6D4]';
