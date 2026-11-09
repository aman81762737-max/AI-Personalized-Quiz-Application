import { Question, StructuredTopic, PracticeRecommendation, GeneratedAITheme, CustomUserFeature } from '../types';
import { RoadmapTrack, CustomRoadmapRequest } from '../types/roadmap';

export interface MaterialAnalysisResult {
  subject: string;
  summary: string;
  extractedText?: string;
  topics: StructuredTopic[];
}

export interface GapAnalysisResult {
  weakConcepts: string[];
  priorityTopics: string[];
  recommendedSequence: string[];
  practiceRecommendations: PracticeRecommendation[];
  explanation: string;
}

export interface FileDataPayload {
  mimeType: string;
  base64: string;
  fileName: string;
  size?: number;
}

export interface SocraticPhase {
  phaseNumber: number;
  title: string;
  objective: string;
  socraticHint: string;
  suggestedAction?: string;
}

export interface SocraticAssignmentPlan {
  title: string;
  objective: string;
  prerequisites: string[];
  phases: SocraticPhase[];
  firstProbingQuestion: string;
  reflectionChecklist: string[];
}

export interface TutorAction {
  type: 'navigate' | 'start_practice' | 'add_note' | 'start_timer' | 'inspect_mistakes' | 'inspect_viva_rubric';
  label: string;
  payload: Record<string, any>;
}

export interface AskTutorResponse {
  reply: string;
  ragSources?: Array<{ title: string; snippet: string; type?: string }>;
  assignmentPlan?: SocraticAssignmentPlan;
  action?: TutorAction;
  suggestedQuickReplies?: string[];
}

export class AIService {
  public async analyzeMaterial(
    title: string,
    text: string,
    subjectHint?: string,
    fileData?: FileDataPayload
  ): Promise<MaterialAnalysisResult> {
    const res = await fetch('/api/ai/analyze-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, text, subjectHint, fileData }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze material');
    }

    return res.json();
  }

  public async generateQuestions(params: {
    subject: string;
    topic: string;
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    questionType: 'mcq' | 'true_false' | 'fill_in_the_blank';
    bloomsTaxonomy?: string;
    sourceText?: string;
    fileData?: { fileName: string; mimeType: string; base64: string };
    documentTitle?: string;
    drillBrief?: string;
  }): Promise<Question[]> {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Question generation could not be completed. Please try again.');
    }

    const data = await res.json();
    return data.questions || [];
  }

  public async formulateDrillBrief(params: {
    topic: string;
    studentPrompt?: string;
    difficulty?: string;
    subject?: string;
  }): Promise<{
    topic: string;
    subject: string;
    drillBrief: string;
    recommendedDifficulty: 'easy' | 'medium' | 'hard';
    recommendedCount: number;
    focusConcepts: string[];
  }> {
    const res = await fetch('/api/ai/formulate-drill-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to formulate drill blueprint.');
    }

    return res.json();
  }

  public async analyzeGaps(params: {
    studentName: string;
    assessmentTitle: string;
    topicBreakdown: Record<string, number>;
    difficultyBreakdown: Record<string, number>;
    incorrectQuestions: Array<{ questionText: string; studentAnswer: string; correctAnswer: string; topic: string }>;
  }): Promise<GapAnalysisResult> {
    const res = await fetch('/api/ai/analyze-gaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gap analysis could not be completed.');
    }

    return res.json();
  }

  public async askTutor(params: {
    message: string;
    history: Array<{ sender: 'user' | 'tutor'; text: string }>;
    currentTopic?: string;
    studentContext?: string;
    materialsContext?: any[];
    attemptContext?: any;
    currentView?: string;
  }): Promise<string> {
    const data = await this.askTutorRich(params);
    return data.reply;
  }

  public async askTutorRich(params: {
    message: string;
    history: Array<{ sender: 'user' | 'tutor'; text: string }>;
    currentTopic?: string;
    studentContext?: string;
    materialsContext?: any[];
    attemptContext?: any;
    currentView?: string;
  }): Promise<AskTutorResponse> {
    const res = await fetch('/api/ai/tutor-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI Tutor response could not be generated.');
    }

    const data = await res.json();
    return {
      reply: data.reply || 'Let me help you understand that concept better.',
      ragSources: data.ragSources,
      assignmentPlan: data.assignmentPlan,
      action: data.action,
      suggestedQuickReplies: data.suggestedQuickReplies,
    };
  }

  public async getGeminiStatus(): Promise<{
    status: string;
    model: string;
    provider: string;
    hasKey: boolean;
    capabilities: string[];
  }> {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) {
      return {
        status: 'offline',
        model: 'gemini-3.8-flash',
        provider: 'Google GenAI SDK',
        hasKey: false,
        capabilities: [],
      };
    }
    return res.json();
  }

  public async explainMistake(params: {
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    topic?: string;
    difficulty?: string;
  }): Promise<{
    misconception: string;
    corePrinciple: string;
    memoryTip: string;
    detailedExplanation: string;
  }> {
    const res = await fetch('/api/ai/explain-mistake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to explain mistake with Gemini.');
    }

    return res.json();
  }

  public async generateStudyGuide(params: {
    subject: string;
    topic: string;
    extractedText?: string;
  }): Promise<{
    title: string;
    executiveSummary: string;
    keyPrinciples: string[];
    commonTraps: string[];
    flashcards: Array<{ front: string; back: string }>;
    practiceTip: string;
  }> {
    const res = await fetch('/api/ai/generate-study-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate study guide with Gemini.');
    }

    return res.json();
  }

  public async generateTheme(params: {
    prompt: string;
    mode?: 'light' | 'dark';
  }): Promise<GeneratedAITheme> {
    const res = await fetch('/api/ai/generate-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate theme with Gemini.');
    }

    const data = await res.json();
    return data.theme;
  }

  public async generateQuickNotes(params: {
    topic: string;
    subject?: string;
    role?: 'student' | 'teacher';
    focusWeakAreas?: boolean;
    sourceText?: string;
    studentScore?: number;
    skillLevel?: string;
  }): Promise<QuickNotesResult> {
    const res = await fetch('/api/ai/quick-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to synthesize quick notes with Gemini.');
    }

    const data = await res.json();
    return data.notes;
  }

  public async logLearnerEvent(params: {
    studentId: string;
    studentName: string;
    actionType: string;
    topic: string;
    subject?: string;
    isCorrect?: boolean;
    studentAnswer?: string;
    correctAnswer?: string;
    questionText?: string;
    timeSpentSeconds?: number;
    difficulty?: string;
  }): Promise<{
    success: boolean;
    interventionNeeded: boolean;
    intervention?: any;
    eventId?: string;
  }> {
    const res = await fetch('/api/ai/monitor/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to record monitoring event.');
    }

    return res.json();
  }

  public async getMonitoringTelemetry(): Promise<{
    success: boolean;
    activeLearnersCount: number;
    totalEventsTracked: number;
    activeInterventionsCount: number;
    recentEvents: any[];
    recentInterventions: any[];
    struggleRadar: Array<{ concept: string; failureRate: number; attempts: number }>;
  }> {
    const res = await fetch('/api/ai/monitor/telemetry');
    if (!res.ok) {
      return {
        success: false,
        activeLearnersCount: 1,
        totalEventsTracked: 0,
        activeInterventionsCount: 0,
        recentEvents: [],
        recentInterventions: [],
        struggleRadar: [],
      };
    }
    return res.json();
  }

  public async generateCustomRoadmap(payload: CustomRoadmapRequest): Promise<RoadmapTrack> {
    const res = await fetch('/api/ai/generate-custom-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate custom roadmap with Gemini.');
    }

    return res.json();
  }

  public async diagnoseCohortDeficiency(params: {
    subject?: string;
    courseName?: string;
    materials?: Array<{ title?: string; topic?: string; summary?: string; fileName?: string }>;
    topics?: string[];
    recentMistakes?: Array<{ questionText: string; studentAnswer: string; correctAnswer: string; topic: string }>;
    calculatedTopicAverages?: Record<string, number>;
    totalEnrolled?: number;
  }): Promise<CohortDeficiencyDiagnostic> {
    const res = await fetch('/api/ai/diagnose-cohort-deficiency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to diagnose cohort deficiency');
    }

    return res.json();
  }

  public async createUserFeature(params: {
    prompt: string;
    role: 'student' | 'teacher';
    userId: string;
    userName?: string;
  }): Promise<{ success: boolean; feature: CustomUserFeature }> {
    const res = await fetch('/api/ai/create-user-feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to synthesize custom feature with AI.');
    }

    return res.json();
  }

  public async copilotChat(params: {
    messages: Array<{ sender: 'user' | 'assistant'; text: string }>;
    role: 'student' | 'teacher';
    userId: string;
    userName?: string;
    currentDraft?: any;
  }): Promise<{
    success: boolean;
    response: string;
    previewData: any;
    suggestedQuickReplies: string[];
    readyToMount: boolean;
    tabMeta?: {
      label: string;
      icon: string;
      viewType: 'timetable' | 'dynamic_tool';
      description: string;
    };
  }> {
    const res = await fetch('/api/ai/copilot-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Copilot session encountered an error.');
    }

    return res.json();
  }

  public async executeStudioPrompt(params: {
    model: string;
    systemInstruction?: string;
    contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> } | string>;
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
    thinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'OFF';
    enableGoogleSearch?: boolean;
    responseMimeType?: 'text/plain' | 'application/json';
    responseSchema?: any;
  }): Promise<{
    success: boolean;
    model: string;
    text: string;
    telemetry: {
      promptTokens: number;
      candidateTokens: number;
      totalTokens: number;
      latencyMs: number;
      tokensPerSecond: number;
      finishReason?: string;
    };
    groundingMetadata?: {
      webSearchQueries?: string[];
      searchChunks?: any[];
    } | null;
    systemInstruction?: string;
    isSimulated?: boolean;
    timestamp: string;
  }> {
    const res = await fetch('/api/studio/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to execute prompt in Google AI Studio.');
    }

    return res.json();
  }
}

export interface CohortDeficiencyDiagnostic {
  success: boolean;
  topic: string;
  subject: string;
  courseName?: string;
  classAverage: number;
  misconception: string;
  remedialHandoutTitle: string;
  diagnosticQuizPrompt: string;
  affectedPercentage?: number;
  studentCountStruggling?: number;
  analyzedBy?: string;
  timestamp?: string;
}

export interface QuickNotesPage {
  pageNumber: number;
  pageTitle: string;
  pageSubtitle: string;
  analogyTitle?: string;
  analogyStory?: string;
  plainEnglishBreakdown?: string;
  keyIntuitions?: string[];
  asciiDiagram?: string;
  invariantsAndRules?: string[];
  cheatSheetTable?: Array<{
    operation: string;
    timeComplexity: string;
    spaceComplexity: string;
    practicalTip: string;
  }>;
  commonTraps?: Array<{
    mistake: string;
    whyItHappens: string;
    howToAvoid: string;
  }>;
  mnemonics?: Array<{
    catchphrase: string;
    meaning: string;
  }>;
}

export interface ChapterTopicExplanation {
  topicTitle: string;
  explanation: string;
  subtopics?: string[];
  keyPoints?: string[];
}

export interface PracticeQuestionItem {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
}

export interface QuickNotesResult {
  title: string;
  chapterName?: string;
  subject: string;
  readTime: string;
  coreInvariant: string;
  executiveSummary: string;
  chapterSummary?: string;
  performanceCalibratedLevel?: string;
  topicsWithExplanation?: ChapterTopicExplanation[];
  tipsAndTricks?: string[];
  practiceQuestions?: PracticeQuestionItem[];
  pages?: QuickNotesPage[];
  highYieldKeyPoints: string[];
  formulasAndComplexities: Array<{ concept: string; value: string; note: string }>;
  commonTrapsAndMistakes: Array<{ mistake: string; correction: string; examTip: string }>;
  mnemonics: Array<{ phrase: string; explains: string }>;
  rapidSelfCheck: Array<{ question: string; answer: string; rationale: string }>;
  interactiveQuiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
  interactiveCheckpoints?: Array<{
    id: string;
    concept: string;
    testPrompt: string;
    guidance: string;
  }>;
}

export const aiService = new AIService();
