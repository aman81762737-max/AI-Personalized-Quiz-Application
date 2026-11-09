import { Question, QuestionDifficulty, QuestionStatus } from '../types';
import {
  saveQuestionToCloud,
  deleteQuestionFromCloud,
} from './cloudSyncService';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

export interface QuestionBankFilters {
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  approvalStatus?: QuestionStatus | 'all';
  type?: string;
  searchQuery?: string;
}

export interface QuestionInventorySummary {
  subject: string;
  topic: string;
  totalApproved: number;
  totalDraft: number;
  totalRejected: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

/**
 * QuestionBankService
 * Central repository manager for the institutional question bank.
 * Enforces question schema invariants and guarantees that students
 * only ever access verified, APPROVED questions.
 */
export class QuestionBankService {
  private localQuestions: Question[] = [];

  public setMemoryQuestions(questions: Question[]) {
    this.localQuestions = questions;
  }

  /**
   * Retrieves strictly APPROVED questions.
   * Never returns draft or rejected items.
   */
  public getApprovedQuestions(
    allQuestions: Question[],
    filters?: {
      subject?: string;
      topic?: string;
      difficulty?: QuestionDifficulty;
      excludeIds?: string[];
    }
  ): Question[] {
    return allQuestions.filter((q) => {
      // Rule: Must be explicitly approved
      const isApproved = q.status === 'approved' || q.approvalStatus === 'approved';
      if (!isApproved) return false;

      // Subject filter
      if (filters?.subject && filters.subject !== 'all') {
        const sMatch = q.subject.toLowerCase() === filters.subject.toLowerCase();
        if (!sMatch) return false;
      }

      // Topic filter
      if (filters?.topic && filters.topic !== 'all') {
        const tMatch = q.topic.toLowerCase().includes(filters.topic.toLowerCase()) ||
                       filters.topic.toLowerCase().includes(q.topic.toLowerCase());
        if (!tMatch) return false;
      }

      // Difficulty filter
      if (filters?.difficulty && filters.difficulty !== ( 'all' as any)) {
        if (q.difficulty.toLowerCase() !== filters.difficulty.toLowerCase()) return false;
      }

      // Exclude specific IDs (e.g. already selected or attempted)
      if (filters?.excludeIds && filters.excludeIds.includes(q.questionId)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Retrieves all questions matching filters (Teacher view only).
   */
  public getAllQuestions(
    allQuestions: Question[],
    filters?: QuestionBankFilters
  ): Question[] {
    return allQuestions.filter((q) => {
      if (filters?.approvalStatus && filters.approvalStatus !== 'all') {
        const status = q.approvalStatus || q.status;
        if (status !== filters.approvalStatus) return false;
      }

      if (filters?.difficulty && filters.difficulty !== ( 'all' as any)) {
        if (q.difficulty.toLowerCase() !== filters.difficulty.toLowerCase()) return false;
      }

      if (filters?.type && filters.type !== 'all') {
        if (q.type !== filters.type) return false;
      }

      if (filters?.subject && filters.subject !== 'all') {
        if (q.subject.toLowerCase() !== filters.subject.toLowerCase()) return false;
      }

      if (filters?.topic && filters.topic !== 'all') {
        const tMatch = q.topic.toLowerCase().includes(filters.topic.toLowerCase()) ||
                       filters.topic.toLowerCase().includes(q.topic.toLowerCase());
        if (!tMatch) return false;
      }

      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query) ||
                            q.topic.toLowerCase().includes(query) ||
                            q.explanation.toLowerCase().includes(query);
        if (!matchesText) return false;
      }

      return true;
    });
  }

  /**
   * Computes available inventory breakdown by difficulty for a subject & topic
   */
  public getInventorySummary(
    allQuestions: Question[],
    subject: string,
    topic: string
  ): QuestionInventorySummary {
    const matching = allQuestions.filter((q) => {
      const sMatch = !subject || subject === 'all' || q.subject.toLowerCase() === subject.toLowerCase();
      const tMatch = !topic || topic === 'all' || q.topic.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(q.topic.toLowerCase());
      return sMatch && tMatch;
    });

    const approved = matching.filter((q) => q.status === 'approved' || q.approvalStatus === 'approved');
    const draft = matching.filter((q) => q.status === 'draft' || q.approvalStatus === 'draft' || q.status === 'ai_generated');
    const rejected = matching.filter((q) => q.status === 'rejected' || q.approvalStatus === 'rejected');

    const easyCount = approved.filter((q) => q.difficulty.toLowerCase() === 'easy').length;
    const mediumCount = approved.filter((q) => q.difficulty.toLowerCase() === 'medium').length;
    const hardCount = approved.filter((q) => q.difficulty.toLowerCase() === 'hard').length;

    return {
      subject,
      topic,
      totalApproved: approved.length,
      totalDraft: draft.length,
      totalRejected: rejected.length,
      byDifficulty: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
    };
  }

  /**
   * Validates mandatory Question schema invariants before saving
   */
  public validateQuestion(q: Partial<Question>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!q.questionText || q.questionText.trim().length < 5) {
      errors.push('Question text must be at least 5 characters long.');
    }

    if (!q.subject || !q.subject.trim()) {
      errors.push('Subject is required.');
    }

    if (!q.topic || !q.topic.trim()) {
      errors.push('Topic is required.');
    }

    if (!q.difficulty || !['easy', 'medium', 'hard'].includes(q.difficulty.toLowerCase())) {
      errors.push('Difficulty must be one of EASY, MEDIUM, or HARD.');
    }

    if (!q.correctAnswer || !q.correctAnswer.trim()) {
      errors.push('Correct answer must be specified.');
    }

    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push('Multiple Choice Questions must have at least 2 options (preferably 4).');
      } else if (!q.options.some((opt) => opt.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase())) {
        errors.push('The specified correct answer must match one of the available options.');
      }
    }

    if (!q.explanation || q.explanation.trim().length < 5) {
      errors.push('Explanation is required to support pedagogical understanding.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Persists a question to cloud and updates storage
   */
  public async saveQuestion(question: Question): Promise<void> {
    const validation = this.validateQuestion(question);
    if (!validation.valid) {
      throw new Error(`Invalid Question: ${validation.errors.join(' ')}`);
    }

    await saveQuestionToCloud(question);
  }

  /**
   * Deletes a question from the question bank
   */
  public async deleteQuestion(questionId: string): Promise<void> {
    await deleteQuestionFromCloud(questionId);
  }
}

export const questionBankService = new QuestionBankService();
