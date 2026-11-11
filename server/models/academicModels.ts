import mongoose, { Schema, Document } from 'mongoose';

/**
 * INSTITUTION SCHEMA
 */
export interface IInstitution extends Document {
  institutionId: string;
  name: string;
  code: string;
  domain?: string;
  address?: string;
  logo?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const InstitutionSchema = new Schema<IInstitution>(
  {
    institutionId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    domain: { type: String },
    address: { type: String },
    logo: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * COURSE SCHEMA
 */
export interface ICourse extends Document {
  courseId: string;
  institutionId: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  academicYear: string;
  description?: string;
  facultyIds: string[];
  enrolledStudentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const CourseSchema = new Schema<ICourse>(
  {
    courseId: { type: String, required: true, unique: true, index: true },
    institutionId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    department: { type: String, required: true },
    semester: { type: String, default: 'Fall 2026' },
    academicYear: { type: String, default: '2026-2027' },
    description: { type: String },
    facultyIds: { type: [String], default: [] },
    enrolledStudentIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

/**
 * SUBJECT SCHEMA
 */
export interface ISubject extends Document {
  subjectId: string;
  courseId: string;
  name: string;
  code: string;
  description?: string;
  topics: string[];
  creditHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export const SubjectSchema = new Schema<ISubject>(
  {
    subjectId: { type: String, required: true, unique: true, index: true },
    courseId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    description: { type: String },
    topics: { type: [String], default: [] },
    creditHours: { type: Number, default: 4 },
  },
  { timestamps: true }
);

/**
 * CURRICULUM MATERIAL SCHEMA
 */
export interface IMaterial extends Document {
  materialId: string;
  subjectId: string;
  courseId?: string;
  uploadedBy: string;
  title: string;
  fileName: string;
  fileUrl?: string;
  fileType: string;
  fileSize: number;
  rawText?: string;
  summary?: string;
  topics: string[];
  chunksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const MaterialSchema = new Schema<IMaterial>(
  {
    materialId: { type: String, required: true, unique: true, index: true },
    subjectId: { type: String, required: true, index: true },
    courseId: { type: String },
    uploadedBy: { type: String, required: true },
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    rawText: { type: String },
    summary: { type: String },
    topics: { type: [String], default: [] },
    chunksCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/**
 * QUESTION BANK SCHEMA
 */
export interface IQuestion extends Document {
  questionId: string;
  questionText: string;
  questionType: 'mcq' | 'true_false' | 'fill_in_the_blank';
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  approvalStatus: 'DRAFT' | 'APPROVED' | 'REJECTED';
  bloomLevel?: string;
  marks: number;
  sourceMaterialId?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const QuestionSchema = new Schema<IQuestion>(
  {
    questionId: { type: String, required: true, unique: true, index: true },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['mcq', 'true_false', 'fill_in_the_blank'], default: 'mcq' },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    subject: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true, index: true },
    approvalStatus: { type: String, enum: ['DRAFT', 'APPROVED', 'REJECTED'], default: 'DRAFT', index: true },
    bloomLevel: { type: String, default: 'Understand' },
    marks: { type: Number, default: 1 },
    sourceMaterialId: { type: String },
    createdBy: { type: String, default: 'faculty' },
    approvedBy: { type: String },
  },
  { timestamps: true }
);

/**
 * ASSESSMENT SCHEMA
 */
export interface IAssessment extends Document {
  assessmentId: string;
  title: string;
  courseId: string;
  subjectId: string;
  createdBy: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number; // Strictly 1 for formal examinations
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionIds: string[];
  status: 'draft' | 'published' | 'archived';
  proctoringConfig?: {
    tabSwitchLimit: number;
    requireWebcam: boolean;
    requireFullscreen: boolean;
    blockDevTools: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const AssessmentSchema = new Schema<IAssessment>(
  {
    assessmentId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    courseId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    durationMinutes: { type: Number, default: 30 },
    totalMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    maxAttempts: { type: Number, default: 1 },
    difficultyDistribution: {
      easy: { type: Number, default: 5 },
      medium: { type: Number, default: 6 },
      hard: { type: Number, default: 4 },
    },
    questionIds: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    proctoringConfig: {
      tabSwitchLimit: { type: Number, default: 3 },
      requireWebcam: { type: Boolean, default: true },
      requireFullscreen: { type: Boolean, default: true },
      blockDevTools: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

/**
 * ASSESSMENT ATTEMPT SCHEMA
 */
export interface IAssessmentAttempt extends Document {
  attemptId: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  startedAt: Date;
  submittedAt?: Date;
  answers: Record<string, string>;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  violationLogs: Array<{ type: string; timestamp: string; details?: string }>;
  topicBreakdown: Record<string, { total: number; correct: number; accuracy: number }>;
  proctoringViolationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ViolationLogSchema = new Schema(
  {
    type: { type: String, required: true },
    timestamp: { type: String, required: true },
    details: { type: String },
  },
  { _id: false }
);

export const AssessmentAttemptSchema = new Schema<IAssessmentAttempt>(
  {
    attemptId: { type: String, required: true, unique: true, index: true },
    assessmentId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    answers: { type: Schema.Types.Mixed, default: {} },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    violationLogs: [ViolationLogSchema],
    topicBreakdown: { type: Schema.Types.Mixed, default: {} },
    proctoringViolationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/**
 * STUDENT LEARNING PROFILE SCHEMA
 */
export interface ILearningProfile extends Document {
  profileId: string;
  studentId: string;
  studentName: string;
  courseId?: string;
  overallAccuracy: number;
  topicMastery: Record<string, {
    accuracy: number;
    attempts: number;
    correct: number;
    recommendedDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  }>;
  weakTopics: string[];
  strongTopics: string[];
  nextRecommendedActions: string[];
  lastEvaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const LearningProfileSchema = new Schema<ILearningProfile>(
  {
    profileId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, unique: true, index: true },
    studentName: { type: String, required: true },
    courseId: { type: String },
    overallAccuracy: { type: Number, default: 0 },
    topicMastery: { type: Schema.Types.Mixed, default: {} },
    weakTopics: { type: [String], default: [] },
    strongTopics: { type: [String], default: [] },
    nextRecommendedActions: { type: [String], default: [] },
    lastEvaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/**
 * AUDIT LOG SCHEMA
 */
export interface IAuditLog extends Document {
  logId: string;
  userId: string;
  userName: string;
  role: 'student' | 'teacher' | 'admin' | 'system';
  action: string;
  targetEntity: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: Date;
}

export const AuditLogSchema = new Schema<IAuditLog>(
  {
    logId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin', 'system'], required: true },
    action: { type: String, required: true },
    targetEntity: { type: String, required: true },
    targetId: { type: String },
    details: { type: String },
    ipAddress: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Mongoose Models
export const InstitutionModel = mongoose.models.Institution || mongoose.model<IInstitution>('Institution', InstitutionSchema);
export const CourseModel = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
export const MaterialModel = mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);
export const QuestionModel = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
export const AssessmentModel = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
export const AssessmentAttemptModel = mongoose.models.AssessmentAttempt || mongoose.model<IAssessmentAttempt>('AssessmentAttempt', AssessmentAttemptSchema);
export const LearningProfileModel = mongoose.models.LearningProfile || mongoose.model<ILearningProfile>('LearningProfile', LearningProfileSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

// In-Memory Seed Store for robust standalone runtime
export const memoryAcademicStore = {
  institutions: [
    {
      institutionId: 'inst-01',
      name: 'MIT World Peace University',
      code: 'MIT-WPU',
      domain: 'mitwpu.edu.in',
      address: 'Pune, Maharashtra, India',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  courses: [
    {
      courseId: 'course-cse-401',
      institutionId: 'inst-01',
      name: 'B.Tech Computer Science and Engineering',
      code: 'CSE-401',
      department: 'School of Computer Science & Engineering',
      semester: 'Semester VII',
      academicYear: '2026-2027',
      facultyIds: ['teacher-01'],
      enrolledStudentIds: ['student-01', 'student-02', 'student-03'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  subjects: [
    {
      subjectId: 'sub-dsa',
      courseId: 'course-cse-401',
      name: 'Advanced Data Structures & Algorithms',
      code: 'CS401',
      description: 'Asymptotic analysis, trees, graphs, dynamic programming, and greedy invariants.',
      topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Asymptotic Complexity'],
      creditHours: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  materials: [
    {
      materialId: 'mat-dsa-01',
      subjectId: 'sub-dsa',
      uploadedBy: 'Prof. Sharma',
      title: 'Graph Traversals, Memory Invariants & Topological Ordering',
      fileName: 'CS401_Module3_Graphs.pdf',
      fileType: 'application/pdf',
      fileSize: 4210000,
      summary: 'Comprehensive analysis of Breadth-First and Depth-First search invariants, cyclic graph detection, and DAG linear ordering.',
      topics: ['Graphs', 'BFS', 'DFS', 'Topological Sort'],
      chunksCount: 14,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  auditLogs: [
    {
      logId: 'audit-001',
      userId: 'admin-01',
      userName: 'Academic Dean',
      role: 'admin' as const,
      action: 'SYSTEM_BOOT',
      targetEntity: 'System',
      targetId: 'sys-01',
      details: 'Nocturne Aurora security and question bank governor initialized.',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    },
  ],
};
