export type UserRole = 'admin' | 'teacher' | 'student';

export interface Institution {
  id: string;
  name: string;
  shortCode: string;
  officialEmailDomains: string[];
  type: 'university' | 'college' | 'institute' | 'polytechnic';
  location: string;
  studentCount: number;
  teacherCount: number;
  verified: boolean;
  departments?: string[];
  logo?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  studentIdNumber?: string;
  facultyIdNumber?: string;
  employeeId?: string;
  department?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  emailVerified?: boolean;
  profilePhoto?: string;
  avatarUrl?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | string;
  dob?: string;
  college?: string;
  stream?: string;
  year?: string;
  bio?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface StudentAttemptRecord {
  id: string;
  title: string;
  course: string;
  date: string;
  duration: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  bloomsProfile: string;
  proctorRating: string;
  mistakesSummary?: string;
  timeSpentMinutes?: number;
}

export interface StudentCohortRecord {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  college: string;
  stream: string;
  year: string;
  avatarUrl?: string;
  overallPerformance: number;
  completedAssessments: number;
  strengths: string[];
  weaknesses: string[];
  learningStreak: number;
  atomAiTelemetry?: {
    totalEvents: number;
    struggleConcepts: string[];
    avgLatencySeconds: number;
    remediationCount: number;
    masteryVelocity: string;
    lastIntervention: string;
  };
  attemptHistory: StudentAttemptRecord[];
}

export interface StudentProfile {
  studentId: string;
  enrolledCourses: string[];
  completedAssessments: number;
  overallPerformance: number; // percentage 0 - 100
  strengths: string[];
  weaknesses: string[];
  knowledgeProfile: Record<string, 'strong' | 'moderate' | 'weak'>;
  learningStreak: number;
  lastAssessment?: string;
  attemptHistory?: StudentAttemptRecord[];
  avatarUrl?: string;
  college?: string;
  stream?: string;
  year?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  bio?: string;
}

export interface TeacherProfile {
  teacherId: string;
  subjects: string[];
  createdAssessments: number;
  uploadedMaterials: number;
  students: number;
  avatarUrl?: string;
  college?: string;
  stream?: string;
  designation?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  bio?: string;
}

export interface StructuredConcept {
  concept: string;
  definition: string;
  example: string;
  learningObjective: string;
}

export interface StructuredTopic {
  name: string;
  concepts: StructuredConcept[];
}

export interface Material {
  materialId: string;
  teacherId: string;
  fileName: string;
  fileType: string;
  storagePath?: string;
  fileUrl?: string;
  subject: string;
  topic: string;
  uploadDate: string;
  processingStatus: 'uploaded' | 'processing' | 'processed' | 'failed';
  extractedText: string;
  structuredConcepts?: StructuredTopic[];
  summary?: string;
  fileData?: {
    mimeType: string;
    base64: string;
    fileName: string;
    size?: number;
  };
}

export type QuestionType = 'mcq' | 'true_false' | 'fill_in_the_blank' | 'short_answer';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'draft' | 'ai_generated' | 'approved' | 'rejected' | 'archived';

export interface Question {
  questionId: string;
  teacherId: string;
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  subject: string;
  topic: string;
  subjectId?: string;
  topicId?: string;
  concept?: string;
  learningObjective?: string;
  bloomsLevel?: string;
  sourceMaterialId?: string;
  materialReference?: string;
  createdBy: 'AI' | 'teacher';
  status: QuestionStatus;
  approvalStatus?: 'draft' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface Assessment {
  assessmentId: string;
  teacherId: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  questionCount: number;
  durationMinutes: number;
  passingPercentage: number;
  maxAttempts: number;
  questionIds: string[];
  difficultyDistribution?: DifficultyDistribution;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  randomized?: boolean;
}

export interface TopicLearningMetric {
  topic: string;
  subject?: string;
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number; // 0 - 100 percentage
  currentDifficulty: QuestionDifficulty;
  masteryLevel: 'novice' | 'learning' | 'competent' | 'mastered';
  recentAnswers: boolean[]; // rolling history (last 10)
  lastAttemptedAt: string;
}

export interface StudentLearningProfile {
  studentId: string;
  subject?: string;
  topicMetrics: Record<string, TopicLearningMetric>;
  overallAccuracy: number;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  weakTopics: string[];
  strongTopics: string[];
  attemptedQuestionIds: string[];
  lastUpdated: string;
}

export interface AssessmentAttempt {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  studentId: string;
  studentName: string;
  questionIds: string[];
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'expired';
  answers: Record<string, string>;
  score?: number;
  percentage?: number;
  passed?: boolean;
  topicBreakdown?: Record<string, number>;
  difficultyBreakdown?: Record<string, number>;
  proctoringViolationsCount: number;
  reviewItems?: Array<{
    questionId: string;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    topic: string;
    difficulty: string;
    explanation: string;
    options?: string[];
  }>;
}

export type ProctoringEventType =
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'window_blur'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'context_menu';

export interface ProctoringEvent {
  eventId: string;
  attemptId: string;
  studentId: string;
  eventType: ProctoringEventType;
  timestamp: string;
  details: string;
}

export interface PracticeRecommendation {
  topic: string;
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  count: number;
  focus: string;
}

export interface LearningPlan {
  planId: string;
  studentId: string;
  generatedAt: string;
  weakConcepts: string[];
  priorityTopics: string[];
  recommendedSequence: string[];
  practiceRecommendations: PracticeRecommendation[];
  explanation: string;
  status: 'active' | 'completed';
}

export interface AppNotification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'assessment' | 'result' | 'recommendation';
  read: boolean;
  createdAt: string;
}

/**
 * Role-Based Theme & Accessibility Types
 */
export type ThemeMode = 'light' | 'dark';
export type StudentAccentPreset = 'ai-blue' | 'calm-learning' | 'focus-mode' | 'dark-intelligence';
export type DashboardDensity = 'comfortable' | 'compact';
export type ChartAppearance = 'default' | 'monochrome' | 'vibrant';
export type FontSizePreference = 'normal' | 'large' | 'extra-large';

export interface UserThemePreference {
  userId: string;
  role: UserRole;
  themePreset: string;
  mode: ThemeMode;
  accessibility: {
    fontSize: FontSizePreference;
    highContrast: boolean;
  };
  density?: DashboardDensity;
  chartAppearance?: ChartAppearance;
  customAITheme?: GeneratedAITheme | null;
  customBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  updatedAt: string;
}

export interface InstitutionTheme {
  institutionId: string;
  institutionName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  loginTagline: string;
  allowCustomBranding: boolean;
  updatedAt: string;
}

export interface GeneratedAITheme {
  themeName: string;
  explanation: string;
  primary: string;
  secondary: string;
  accent: string;
  bg?: string;
  surface?: string;
  card?: string;
  text?: string;
  textSecondary?: string;
  border?: string;
  mode?: ThemeMode;
}

export type CustomWidgetType =
  | 'timer'
  | 'counter'
  | 'checklist'
  | 'calculator'
  | 'notes'
  | 'stat_card'
  | 'flashcards'
  | 'formula_sheet'
  | 'rubric';

export interface CustomWidgetConfig {
  id: string;
  type: CustomWidgetType;
  label: string;
  config: Record<string, any>;
  defaultState: Record<string, any>;
}

export interface CustomUserFeature {
  id: string;
  userId: string;
  userRole: 'student' | 'teacher';
  name: string;
  description: string;
  iconName: string;
  category: 'productivity' | 'study_tool' | 'pedagogy' | 'analytics' | 'utility';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isEnabled: boolean;
  componentSchema: {
    title: string;
    description: string;
    widgets: CustomWidgetConfig[];
    customCodeSnippet?: string;
  };
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodIndex: number;
  startTime: string;
  endTime: string;
  subject: string;
  courseCode?: string;
  instructor?: string;
  room?: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'break' | 'study_block';
  color: string;
  notes?: string;
}

export interface TimetableData {
  title: string;
  academicTerm: string;
  daysOfWeek: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
  periodTimes: Array<{ period: number; startTime: string; endTime: string; label?: string }>;
  slots: TimetableSlot[];
  autoGeneratedByAI?: boolean;
  conflictDetected?: boolean;
}

export interface CustomCockpitTab {
  tabId: string;
  label: string;
  icon: string;
  viewType: 'timetable' | 'dynamic_tool';
  userId: string;
  userRole: 'student' | 'teacher';
  description: string;
  timetableData?: TimetableData;
  customSchema?: Record<string, any>;
  createdAt: string;
}

export interface ClassroomRoom {
  id: string;
  name: string;
  subject: string;
  code: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  bannerColor?: string;
  isDefault?: boolean;
}

export interface CommunityAttachment {
  name: string;
  size: string;
  type: string;
  contentPreview?: string;
  dataUrl?: string;
}

export interface CommunityReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'student';
  content: string;
  createdAt: string;
  replyToUser?: string;
  isOfficialFacultyAnswer?: boolean;
  aiVerification?: {
    isStudyRelated: boolean;
    confidence: number;
    reason?: string;
  };
}

export interface CommunityPost {
  id: string;
  classroomId: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'student';
  title: string;
  content: string;
  createdAt: string;
  postType: 'announcement' | 'material' | 'doubt';
  attachments?: CommunityAttachment[];
  replies: CommunityReply[];
}



