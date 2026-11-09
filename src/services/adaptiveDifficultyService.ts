import { QuestionDifficulty, TopicLearningMetric, StudentLearningProfile } from '../types';

export interface DifficultyAdjustmentResult {
  nextDifficulty: QuestionDifficulty;
  change: 'increased' | 'maintained' | 'decreased';
  explanation: string;
  accuracy: number;
}

/**
 * AdaptiveDifficultyService
 * Implements the core pedagogical difficulty adaptation logic.
 * Calculates student's appropriate difficulty level for each topic based on
 * rolling accuracy, attempt history, and progressive challenge thresholds.
 */
export class AdaptiveDifficultyService {
  /**
   * Thresholds as specified in Section 3 & 6:
   * - >= 85%: Hard (e.g. Arrays at 90% accuracy)
   * - 70% - 84%: Medium (e.g. Linked Lists at 75% accuracy)
   * - 40% - 69%: Easy-to-Medium (e.g. Trees at 55% accuracy)
   * - < 40%: Easy (e.g. Graphs at 35% accuracy)
   */
  public determineTargetDifficulty(
    topicMetric?: TopicLearningMetric,
    manualOverride?: QuestionDifficulty
  ): QuestionDifficulty {
    if (manualOverride) {
      return manualOverride;
    }

    if (!topicMetric || topicMetric.totalAttempted === 0) {
      return 'easy'; // Default starting point for new topics
    }

    const accuracy = topicMetric.accuracy;

    if (accuracy >= 85) {
      return 'hard';
    } else if (accuracy >= 70) {
      return 'medium';
    } else if (accuracy >= 45) {
      // 45-69%: If they are currently on medium and have recent successes, keep medium; otherwise easy-to-medium
      return topicMetric.currentDifficulty === 'hard' ? 'medium' : topicMetric.currentDifficulty || 'easy';
    } else {
      return 'easy';
    }
  }

  /**
   * Calculates progressive adjustment based on latest session score:
   * Suppose a student attempts questions on a topic:
   * - 9-10 correct (>= 85%): Increase difficulty gradually (easy -> medium, medium -> hard)
   * - 7-8 correct (70-84%): Maintain or slightly increase
   * - 4-6 correct (40-69%): Maintain difficulty and provide targeted practice
   * - 0-3 correct (< 40%): Reduce difficulty (hard -> medium, medium -> easy)
   *
   * Enforces smooth transitions: no sudden wild jumps based on a single question.
   */
  public calculateNextDifficulty(
    currentDiff: QuestionDifficulty,
    sessionCorrect: number,
    sessionTotal: number,
    historicalAccuracy: number
  ): DifficultyAdjustmentResult {
    const sessionPct = sessionTotal > 0 ? (sessionCorrect / sessionTotal) * 100 : 0;
    // Blend session with historical accuracy (60% weight to history, 40% to recent session) to prevent wild jumps
    const blendedAccuracy = historicalAccuracy > 0
      ? (historicalAccuracy * 0.6) + (sessionPct * 0.4)
      : sessionPct;

    let nextDifficulty: QuestionDifficulty = currentDiff;
    let change: 'increased' | 'maintained' | 'decreased' = 'maintained';
    let explanation = '';

    if (sessionPct >= 85 && blendedAccuracy >= 75) {
      if (currentDiff === 'easy') {
        nextDifficulty = 'medium';
        change = 'increased';
        explanation = `High accuracy (${sessionCorrect}/${sessionTotal}, ${Math.round(sessionPct)}%). Successfully graduated from Easy to Medium!`;
      } else if (currentDiff === 'medium') {
        nextDifficulty = 'hard';
        change = 'increased';
        explanation = `Consistent mastery (${sessionCorrect}/${sessionTotal}, ${Math.round(sessionPct)}%). Promoted to Hard difficulty drills!`;
      } else {
        nextDifficulty = 'hard';
        change = 'maintained';
        explanation = `Peak performance on Hard questions (${sessionCorrect}/${sessionTotal}). Maintaining top-tier challenge level.`;
      }
    } else if (sessionPct <= 35 && blendedAccuracy < 50) {
      if (currentDiff === 'hard') {
        nextDifficulty = 'medium';
        change = 'decreased';
        explanation = `Struggled on recent drill (${sessionCorrect}/${sessionTotal}). Adjusting down to Medium to reinforce core intuition.`;
      } else if (currentDiff === 'medium') {
        nextDifficulty = 'easy';
        change = 'decreased';
        explanation = `Foundational gaps identified (${sessionCorrect}/${sessionTotal}). Recalibrating to Easy difficulty for targeted concept drills.`;
      } else {
        nextDifficulty = 'easy';
        change = 'maintained';
        explanation = `Providing foundational practice and step-by-step Socratic assistance on Easy items.`;
      }
    } else {
      nextDifficulty = currentDiff;
      change = 'maintained';
      explanation = `Steady performance (${sessionCorrect}/${sessionTotal}, ${Math.round(sessionPct)}%). Maintaining current ${currentDiff} difficulty.`;
    }

    return {
      nextDifficulty,
      change,
      explanation,
      accuracy: Math.round(blendedAccuracy),
    };
  }

  /**
   * Calculates topic mastery category
   */
  public calculateTopicMastery(
    accuracy: number,
    totalAttempts: number
  ): 'novice' | 'learning' | 'competent' | 'mastered' {
    if (totalAttempts < 3) return 'novice';
    if (accuracy >= 85 && totalAttempts >= 8) return 'mastered';
    if (accuracy >= 70 && totalAttempts >= 5) return 'competent';
    if (accuracy >= 40) return 'learning';
    return 'novice';
  }

  /**
   * Returns human-readable summary of student's adaptive difficulty per topic
   */
  public getProfileRecommendation(profile?: StudentLearningProfile, topicName?: string): {
    targetDifficulty: QuestionDifficulty;
    accuracy: number;
    reasoning: string;
  } {
    if (!profile || !topicName || !profile.topicMetrics[topicName]) {
      return {
        targetDifficulty: 'easy',
        accuracy: 0,
        reasoning: 'No prior attempt history for this topic. Starting with Easy foundational questions.',
      };
    }

    const metric = profile.topicMetrics[topicName];
    const target = this.determineTargetDifficulty(metric);
    let reasoning = '';

    if (target === 'hard') {
      reasoning = `Strong grasp demonstrated with ${metric.accuracy}% accuracy across ${metric.totalAttempted} attempts. Serving Hard difficulty items.`;
    } else if (target === 'medium') {
      reasoning = `Solid understanding with ${metric.accuracy}% accuracy. Serving Medium difficulty items to strengthen problem-solving.`;
    } else {
      reasoning = `Topic accuracy is currently ${metric.accuracy}%. Serving Easy items with step-by-step concept explanations.`;
    }

    return {
      targetDifficulty: target,
      accuracy: metric.accuracy,
      reasoning,
    };
  }
}

export const adaptiveDifficultyService = new AdaptiveDifficultyService();
