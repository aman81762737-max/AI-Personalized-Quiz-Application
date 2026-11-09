import mongoose, { Schema, Document } from 'mongoose';

/**
 * MongoDB Schema for UserThemePreference
 * Supports Student, Teacher, and Admin role-based visual customization
 */
export interface IUserThemePreference extends Document {
  userId: string;
  role: 'student' | 'teacher' | 'admin';
  themePreset: string;
  mode: 'light' | 'dark';
  accessibility: {
    fontSize: 'normal' | 'large' | 'extra-large';
    highContrast: boolean;
  };
  density?: 'comfortable' | 'compact';
  chartAppearance?: 'default' | 'monochrome' | 'vibrant';
  customAITheme?: any;
  customBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  updatedAt: Date;
}

export const UserThemePreferenceSchema = new Schema<IUserThemePreference>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    themePreset: { type: String, default: 'default' },
    mode: { type: String, enum: ['dark', 'light'], default: 'dark' },
    accessibility: {
      fontSize: { type: String, enum: ['normal', 'large', 'extra-large'], default: 'normal' },
      highContrast: { type: Boolean, default: false },
    },
    density: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
    chartAppearance: { type: String, enum: ['default', 'monochrome', 'vibrant'], default: 'default' },
    customAITheme: { type: Schema.Types.Mixed, default: null },
    customBranding: {
      primaryColor: { type: String },
      secondaryColor: { type: String },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/**
 * MongoDB Schema for InstitutionTheme
 * Managed by Institution Administrators
 */
export interface IInstitutionTheme extends Document {
  institutionId: string;
  institutionName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  loginTagline: string;
  allowCustomBranding: boolean;
  updatedAt: Date;
}

export const InstitutionThemeSchema = new Schema<IInstitutionTheme>(
  {
    institutionId: { type: String, required: true, unique: true, index: true },
    institutionName: { type: String, default: 'AI Personalized Quiz & Learning Platform' },
    logo: { type: String },
    primaryColor: { type: String, default: '#0F172A' },
    secondaryColor: { type: String, default: '#2563EB' },
    accentColor: { type: String, default: '#7C3AED' },
    loginTagline: { type: String, default: 'Empowering institutions with AI-driven assessments and adaptive mastery.' },
    allowCustomBranding: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Mongoose Models
export const UserThemePreferenceModel =
  mongoose.models.UserThemePreference ||
  mongoose.model<IUserThemePreference>('UserThemePreference', UserThemePreferenceSchema);

export const InstitutionThemeModel =
  mongoose.models.InstitutionTheme ||
  mongoose.model<IInstitutionTheme>('InstitutionTheme', InstitutionThemeSchema);

// In-Memory fallback store if MongoDB connection is not configured at runtime
export const memoryThemeStore = {
  userPreferences: new Map<string, any>(),
  institutionTheme: {
    institutionId: 'inst-default-01',
    institutionName: 'AI Personalized Quiz & Learning Platform',
    logo: 'Q',
    primaryColor: '#0F172A',
    secondaryColor: '#2563EB',
    accentColor: '#7C3AED',
    loginTagline: 'Empowering institutions with AI-driven assessments and adaptive mastery.',
    allowCustomBranding: true,
    updatedAt: new Date().toISOString(),
  },
};
