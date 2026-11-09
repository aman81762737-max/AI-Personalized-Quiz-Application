import { Question, QuestionDifficulty, QuestionType } from '../types';
import { aiService } from './aiService';

export interface GenerateQuestionPoolParams {
  subject: string;
  topic: string;
  count: number;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionType | 'mixed';
  sourceText?: string;
  documentTitle?: string;
  materialReference?: string;
  teacherId?: string;
  drillBrief?: string;
  fileData?: any;
}

/**
 * QuestionGenerationService
 * AI-assisted question generation engine for faculty and teachers.
 *
 * CRITICAL RULE:
 * Questions generated here are ALWAYS saved with `status: 'draft'` and
 * `approvalStatus: 'draft'`. AI must never bypass teacher approval.
 */
export class QuestionGenerationService {
  /**
   * Generates a raw pool of questions for a teacher's assessment or curriculum material.
   * Every item is marked as DRAFT for teacher review.
   */
  public async generateQuestionPool(params: GenerateQuestionPoolParams): Promise<Question[]> {
    const {
      subject,
      topic,
      count = 5,
      difficulty = 'medium',
      questionType = 'mcq',
      sourceText,
      documentTitle,
      materialReference,
      teacherId = 'faculty-01',
      drillBrief,
      fileData,
    } = params;

    const apiQuestionType = questionType === 'mixed'
      ? 'mcq'
      : (questionType as 'mcq' | 'true_false' | 'fill_in_the_blank');

    const results = await aiService.generateQuestions({
      subject,
      topic,
      count,
      difficulty,
      questionType: apiQuestionType,
      sourceText,
      documentTitle,
      drillBrief,
      fileData,
    });

    if (!results || results.length === 0) {
      throw new Error(`Failed to generate questions for topic "${topic}".`);
    }

    const timestamp = new Date().toISOString();

    // Map into Question model ensuring DRAFT status and complete metadata
    const draftPool: Question[] = results.map((item, idx) => {
      // Ensure exactly 4 options for MCQs if possible
      let options = item.options;
      if (item.type === 'mcq' && (!options || options.length < 4)) {
        options = options || [item.correctAnswer];
        while (options.length < 4) {
          options.push(`Alternative parameter ${options.length + 1}`);
        }
      }

      return {
        questionId: `q-gen-${Date.now()}-${idx + 1}`,
        teacherId,
        questionText: item.questionText,
        type: item.type || (questionType === 'mixed' ? (idx % 2 === 0 ? 'mcq' : 'fill_in_the_blank') : questionType as QuestionType),
        options: options || undefined,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation || `Pedagogical explanation for ${topic}: ${item.correctAnswer} is correct based on foundational principles.`,
        difficulty: (item.difficulty as QuestionDifficulty) || difficulty,
        subject,
        topic,
        concept: item.concept || topic,
        learningObjective: item.learningObjective || `Evaluate understanding of ${topic}.`,
        bloomsLevel: item.bloomsLevel || 'Understanding',
        sourceMaterialId: materialReference,
        materialReference,
        createdBy: 'AI',
        status: 'draft', // STRICTLY DRAFT
        approvalStatus: 'draft', // STRICTLY DRAFT
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    return draftPool;
  }
}

export const questionGenerationService = new QuestionGenerationService();
