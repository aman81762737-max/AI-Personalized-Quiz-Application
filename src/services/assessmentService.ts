import { Question, Assessment, AssessmentAttempt, DifficultyDistribution } from '../types';
import { questionSelectionService } from './questionSelectionService';
import { questionBankService } from './questionBankService';

export interface EvaluationPayload {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  topicBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
  questionReview: Array<{
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
  evaluatedAt: string;
}

export class AssessmentService {
  /**
   * Sanitizes questions sent to student during exam:
   * Strips correct answers and explanations so students cannot view them in devtools/DOM.
   * Also shuffles options if randomized is enabled.
   */
  public prepareStudentExamSession(questions: Question[], randomize = true): Question[] {
    const cloned = questions.map((q) => {
      let options = q.options ? [...q.options] : undefined;
      // Do not shuffle if true/false
      if (randomize && options && q.type !== 'true_false') {
        options = options.sort(() => Math.random() - 0.5);
      }
      return {
        ...q,
        options,
        correctAnswer: '', // Redacted for integrity
        explanation: '', // Redacted during active exam
      };
    });

    if (randomize) {
      return cloned.sort(() => Math.random() - 0.5);
    }
    return cloned;
  }

  /**
   * Validates if the question bank has sufficient approved questions
   * to satisfy the formal assessment's requested difficulty distribution.
   */
  public validateAssessmentConfiguration(
    subject: string,
    topics: string[],
    distribution: DifficultyDistribution,
    allQuestions: Question[]
  ): { valid: boolean; deficitError?: string } {
    const inventory = questionBankService.getInventorySummary(
      allQuestions,
      subject,
      topics[0] || 'all'
    );

    const deficits: string[] = [];
    if (inventory.byDifficulty.easy < distribution.easy) {
      deficits.push(`Easy: required ${distribution.easy}, but only ${inventory.byDifficulty.easy} approved in bank.`);
    }
    if (inventory.byDifficulty.medium < distribution.medium) {
      deficits.push(`Medium: required ${distribution.medium}, but only ${inventory.byDifficulty.medium} approved in bank.`);
    }
    if (inventory.byDifficulty.hard < distribution.hard) {
      deficits.push(`Hard: required ${distribution.hard}, but only ${inventory.byDifficulty.hard} approved in bank.`);
    }

    if (deficits.length > 0) {
      return {
        valid: false,
        deficitError: `Question Bank Deficit: Cannot publish formal assessment.\n${deficits.join('\n')}\nPlease generate and approve the required questions in the Question Bank.`,
      };
    }

    return { valid: true };
  }

  /**
   * Assembles the student exam question set by invoking QuestionSelectionService
   */
  public assembleStudentAssessment(
    assessment: Assessment,
    allQuestions: Question[]
  ) {
    return questionSelectionService.selectQuestionsForAssessment(assessment, allQuestions);
  }

  /**
   * Secure server-side grading
   */
  public async evaluateAttempt(
    fullQuestions: Question[],
    studentAnswers: Record<string, string>,
    passingPercentage = 70
  ): Promise<EvaluationPayload> {
    const res = await fetch('/api/assessments/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questions: fullQuestions,
        studentAnswers,
        passingPercentage,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to evaluate assessment submission on server.');
    }

    return res.json();
  }
}

export const assessmentService = new AssessmentService();
