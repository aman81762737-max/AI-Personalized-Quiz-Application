export type LearnerActionType =
  | 'quiz_answer'
  | 'exam_submission'
  | 'coding_step'
  | 'roadmap_step'
  | 'note_read'
  | 'concept_struggle'
  | 'dwell_stall';

export interface LearnerEvent {
  id: string;
  studentId: string;
  studentName: string;
  actionType: LearnerActionType;
  topic: string;
  subject: string;
  isCorrect?: boolean;
  studentAnswer?: string;
  correctAnswer?: string;
  questionText?: string;
  timeSpentSeconds: number;
  timestamp: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  misconceptionDetected?: string;
}

export interface RemedialQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  analogy: string;
}

export interface AIIntervention {
  id: string;
  timestamp: string;
  topic: string;
  misconception: string;
  plainAnalogy: string;
  suggestedAction: string;
  severity: 'gentle_hint' | 'concept_drill' | 'deep_intervention';
  remedialQuestion?: RemedialQuestion;
  resolved: boolean;
}

export interface StudentMasteryRadar {
  concept: string;
  masteryPercentage: number;
  attemptsCount: number;
  lastAttemptResult: 'correct' | 'incorrect';
}

export interface AIMonitorState {
  isMonitoringActive: boolean;
  activeIntervention: AIIntervention | null;
  interventionHistory: AIIntervention[];
  recentEvents: LearnerEvent[];
  consecutiveMistakes: number;
  currentStreak: number;
  overallScore: number;
  activeStruggles: string[];
  coachingMessage: string;
  isCoachDockOpen: boolean;
  remedialModalOpen: boolean;
}
