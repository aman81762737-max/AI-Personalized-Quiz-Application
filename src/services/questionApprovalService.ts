import { Question, QuestionStatus } from '../types';
import { saveQuestionToCloud, batchSaveQuestionsToCloud } from './cloudSyncService';

/**
 * QuestionApprovalService
 * Manages the teacher verification and approval lifecycle.
 * Questions must pass through this service before becoming eligible
 * for student assessments or practice sessions.
 */
export class QuestionApprovalService {
  /**
   * Explicitly approves a single question
   */
  public async approveQuestion(
    question: Question,
    teacherId: string
  ): Promise<Question> {
    const timestamp = new Date().toISOString();
    const approved: Question = {
      ...question,
      status: 'approved',
      approvalStatus: 'approved',
      approvedBy: teacherId,
      approvedAt: timestamp,
      updatedAt: timestamp,
    };

    await saveQuestionToCloud(approved);
    return approved;
  }

  /**
   * Explicitly rejects a question
   */
  public async rejectQuestion(
    question: Question,
    teacherId: string,
    rejectionReason?: string
  ): Promise<Question> {
    const timestamp = new Date().toISOString();
    const rejected: Question = {
      ...question,
      status: 'rejected',
      approvalStatus: 'rejected',
      approvedBy: teacherId,
      updatedAt: timestamp,
      explanation: rejectionReason
        ? `${question.explanation}\n[Faculty Rejection Note: ${rejectionReason}]`
        : question.explanation,
    };

    await saveQuestionToCloud(rejected);
    return rejected;
  }

  /**
   * Batch approves an array of questions
   */
  public async batchApproveQuestions(
    questions: Question[],
    teacherId: string
  ): Promise<Question[]> {
    const timestamp = new Date().toISOString();
    const approvedList = questions.map((q) => ({
      ...q,
      status: 'approved' as QuestionStatus,
      approvalStatus: 'approved' as const,
      approvedBy: teacherId,
      approvedAt: timestamp,
      updatedAt: timestamp,
    }));

    await batchSaveQuestionsToCloud(approvedList);
    return approvedList;
  }

  /**
   * Updates question contents during teacher review
   */
  public async updateQuestionContent(
    question: Question,
    updates: Partial<Question>,
    teacherId?: string
  ): Promise<Question> {
    const timestamp = new Date().toISOString();
    const updated: Question = {
      ...question,
      ...updates,
      updatedAt: timestamp,
    };

    if (teacherId) {
      updated.teacherId = teacherId;
    }

    await saveQuestionToCloud(updated);
    return updated;
  }
}

export const questionApprovalService = new QuestionApprovalService();
