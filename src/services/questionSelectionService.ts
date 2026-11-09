import {
  Question,
  QuestionDifficulty,
  Assessment,
  DifficultyDistribution,
  StudentLearningProfile,
} from '../types';
import { questionBankService } from './questionBankService';
import { adaptiveDifficultyService } from './adaptiveDifficultyService';

export interface FormalAssessmentSelectionResult {
  success: boolean;
  selectedQuestions: Question[];
  selectedQuestionIds: string[];
  deficitError?: string;
  breakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface AdaptivePracticeSelectionResult {
  success: boolean;
  selectedQuestions: Question[];
  selectedQuestionIds: string[];
  adaptiveDifficulty: QuestionDifficulty;
  accuracy: number;
  reasoning: string;
  warning?: string;
}

/**
 * QuestionSelectionService
 * Dedicated engine implementing the Controlled Question Selection Algorithm
 * for both Formal Teacher Assessments and Adaptive Student Practice.
 */
export class QuestionSelectionService {
  /**
   * MODE A: Formal Teacher Assessment Question Selection
   *
   * Core Constraints:
   * 1. Retrieve ONLY approved questions.
   * 2. Filter by assessment subject and topics.
   * 3. Maintain exact teacher-defined question count and difficulty distribution.
   * 4. Exclude previously attempted questions if sufficient alternative approved items exist.
   * 5. Ensure NO duplicates within the same assessment attempt.
   * 6. If bank does not have enough approved questions: DO NOT silently generate unapproved
   *    replacements or alter distribution. Notify teacher of the exact deficit.
   */
  public selectQuestionsForAssessment(
    assessment: Assessment,
    allQuestions: Question[],
    studentProfile?: StudentLearningProfile
  ): FormalAssessmentSelectionResult {
    // 1. Filter bank to strictly approved questions matching subject and topics
    const approvedCandidates = questionBankService.getApprovedQuestions(allQuestions, {
      subject: assessment.subject,
    }).filter((q) => {
      // Must belong to one of the assessment topics
      if (!assessment.topics || assessment.topics.length === 0) return true;
      return assessment.topics.some(
        (t) =>
          q.topic.toLowerCase().includes(t.toLowerCase()) ||
          t.toLowerCase().includes(q.topic.toLowerCase())
      );
    });

    // 2. Determine target distribution
    const totalCount = assessment.questionCount || 5;
    let distribution: DifficultyDistribution = assessment.difficultyDistribution || {
      easy: Math.floor(totalCount * 0.3),
      medium: Math.ceil(totalCount * 0.4),
      hard: totalCount - Math.floor(totalCount * 0.3) - Math.ceil(totalCount * 0.4),
    };

    // Ensure sum matches totalCount
    const distSum = distribution.easy + distribution.medium + distribution.hard;
    if (distSum !== totalCount) {
      const diff = totalCount - distSum;
      distribution = { ...distribution, medium: Math.max(0, distribution.medium + diff) };
    }

    // 3. Partition candidates by difficulty
    const easyPool = approvedCandidates.filter((q) => q.difficulty.toLowerCase() === 'easy');
    const mediumPool = approvedCandidates.filter((q) => q.difficulty.toLowerCase() === 'medium');
    const hardPool = approvedCandidates.filter((q) => q.difficulty.toLowerCase() === 'hard');

    // 4. Validate coverage - strictly check for deficits
    const deficits: string[] = [];
    if (easyPool.length < distribution.easy) {
      deficits.push(`Easy: required ${distribution.easy}, but only ${easyPool.length} approved in bank.`);
    }
    if (mediumPool.length < distribution.medium) {
      deficits.push(`Medium: required ${distribution.medium}, but only ${mediumPool.length} approved in bank.`);
    }
    if (hardPool.length < distribution.hard) {
      deficits.push(`Hard: required ${distribution.hard}, but only ${hardPool.length} approved in bank.`);
    }

    if (deficits.length > 0) {
      return {
        success: false,
        selectedQuestions: [],
        selectedQuestionIds: [],
        deficitError: `Question Bank Deficit: Cannot assemble formal assessment.\n${deficits.join('\n')}\nPlease generate and approve the required questions in the Question Bank.`,
        breakdown: { easy: 0, medium: 0, hard: 0 },
      };
    }

    // 5. Select questions, prioritizing items student has NOT previously attempted
    const attemptedSet = new Set(studentProfile?.attemptedQuestionIds || []);

    const pickFromPool = (pool: Question[], neededCount: number): Question[] => {
      if (neededCount <= 0) return [];

      // Sort: unattempted first, then shuffle within groups for variety
      const unattempted = pool.filter((q) => !attemptedSet.has(q.questionId)).sort(() => Math.random() - 0.5);
      const attempted = pool.filter((q) => attemptedSet.has(q.questionId)).sort(() => Math.random() - 0.5);

      const combined = [...unattempted, ...attempted];
      return combined.slice(0, neededCount);
    };

    const selectedEasy = pickFromPool(easyPool, distribution.easy);
    const selectedMedium = pickFromPool(mediumPool, distribution.medium);
    const selectedHard = pickFromPool(hardPool, distribution.hard);

    const allSelected = [...selectedEasy, ...selectedMedium, ...selectedHard];

    // Shuffle final order if randomization is enabled
    const finalOrdered = assessment.randomized !== false
      ? allSelected.sort(() => Math.random() - 0.5)
      : allSelected;

    return {
      success: true,
      selectedQuestions: finalOrdered,
      selectedQuestionIds: finalOrdered.map((q) => q.questionId),
      breakdown: {
        easy: selectedEasy.length,
        medium: selectedMedium.length,
        hard: selectedHard.length,
      },
    };
  }

  /**
   * MODE B: Personalized Student Practice Question Selection
   *
   * Core Constraints:
   * 1. Retrieves ONLY approved questions from Question Bank.
   * 2. Evaluates the student's learning profile to determine topic accuracy and adaptive difficulty.
   * 3. Adapts:
   *    - High accuracy (>= 85%): Hard questions
   *    - Medium accuracy (70-84%): Medium questions
   *    - Lower accuracy (45-69%): Medium/Easy-Medium
   *    - Low accuracy (< 40%): Easy questions
   * 4. Excludes previously attempted questions where sufficient alternatives exist.
   * 5. If specific difficulty runs out in approved bank, gracefully blends with adjacent approved questions.
   */
  public selectQuestionsForPractice(params: {
    topic: string;
    subject?: string;
    count: number;
    allQuestions: Question[];
    studentProfile?: StudentLearningProfile;
    manualDifficulty?: QuestionDifficulty;
  }): AdaptivePracticeSelectionResult {
    const {
      topic,
      subject,
      count = 3,
      allQuestions,
      studentProfile,
      manualDifficulty,
    } = params;

    // 1. Evaluate student's profile for target topic
    const topicMetric = studentProfile?.topicMetrics[topic];
    const targetDifficulty = manualDifficulty || adaptiveDifficultyService.determineTargetDifficulty(topicMetric);
    const accuracy = topicMetric?.accuracy ?? 0;

    const recommendation = adaptiveDifficultyService.getProfileRecommendation(studentProfile, topic);

    // 2. Filter approved questions matching topic
    const approved = questionBankService.getApprovedQuestions(allQuestions, {
      subject,
      topic,
    });

    if (approved.length === 0) {
      return {
        success: false,
        selectedQuestions: [],
        selectedQuestionIds: [],
        adaptiveDifficulty: targetDifficulty,
        accuracy,
        reasoning: `No approved questions found in the Question Bank for topic "${topic}". Please ask your teacher to generate and approve questions.`,
        warning: 'Empty question bank for this topic.',
      };
    }

    // 3. Separate by difficulty
    const targetPool = approved.filter((q) => q.difficulty.toLowerCase() === targetDifficulty.toLowerCase());
    const attemptedSet = new Set(studentProfile?.attemptedQuestionIds || []);

    // Prioritize unattempted questions
    const unattemptedTarget = targetPool.filter((q) => !attemptedSet.has(q.questionId)).sort(() => Math.random() - 0.5);
    const attemptedTarget = targetPool.filter((q) => attemptedSet.has(q.questionId)).sort(() => Math.random() - 0.5);
    let selected: Question[] = [...unattemptedTarget, ...attemptedTarget].slice(0, count);

    let warning: string | undefined = undefined;

    // If target pool has fewer than requested, blend with adjacent approved questions
    if (selected.length < count) {
      const remainingNeeded = count - selected.length;
      const selectedIds = new Set(selected.map((q) => q.questionId));

      // Adjacent difficulty priority (if looking for Hard, check Medium next; if Easy, check Medium next)
      const fallbackDiff: QuestionDifficulty = targetDifficulty === 'hard'
        ? 'medium'
        : targetDifficulty === 'easy'
        ? 'medium'
        : 'easy';

      const fallbackPool = approved.filter(
        (q) => q.difficulty.toLowerCase() === fallbackDiff.toLowerCase() && !selectedIds.has(q.questionId)
      );

      const additional = fallbackPool.sort(() => Math.random() - 0.5).slice(0, remainingNeeded);
      selected = [...selected, ...additional];

      if (selected.length < count) {
        // Any remaining approved question from other difficulty
        const rest = approved.filter((q) => !selected.some((s) => s.questionId === q.questionId));
        selected = [...selected, ...rest.slice(0, count - selected.length)];
      }

      warning = `Question bank had limited ${targetDifficulty} items for "${topic}". Blended with approved adjacent difficulty questions.`;
    }

    return {
      success: selected.length > 0,
      selectedQuestions: selected,
      selectedQuestionIds: selected.map((q) => q.questionId),
      adaptiveDifficulty: targetDifficulty,
      accuracy,
      reasoning: recommendation.reasoning,
      warning,
    };
  }
}

export const questionSelectionService = new QuestionSelectionService();
