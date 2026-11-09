import {
  StudentLearningProfile,
  TopicLearningMetric,
  QuestionDifficulty,
} from '../types';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { adaptiveDifficultyService } from './adaptiveDifficultyService';

const CACHE_KEY_PROFILE_PREFIX = 'academic_student_learning_profile_';

/**
 * Baseline initial learning profile seeded with the canonical pedagogical metrics:
 * Arrays: 90% accuracy -> Hard
 * Linked Lists: 75% accuracy -> Medium
 * Trees: 55% accuracy -> Medium / Easy-Medium
 * Graphs: 35% accuracy -> Easy
 */
export const INITIAL_STUDENT_LEARNING_PROFILE: StudentLearningProfile = {
  studentId: 'student-01',
  subject: 'Computer Science',
  overallAccuracy: 64,
  totalQuestionsAttempted: 35,
  totalCorrectAnswers: 22,
  weakTopics: ['Graph Algorithms', 'Trees & Hierarchies'],
  strongTopics: ['Dynamic Arrays & Strings', 'Linked Lists'],
  attemptedQuestionIds: ['q-cs201-1', 'q-cs201-2', 'q-bst-01'],
  lastUpdated: new Date().toISOString(),
  topicMetrics: {
    'Dynamic Arrays & Strings': {
      topic: 'Dynamic Arrays & Strings',
      subject: 'Computer Science',
      totalAttempted: 10,
      totalCorrect: 9,
      accuracy: 90,
      currentDifficulty: 'hard',
      masteryLevel: 'mastered',
      recentAnswers: [true, true, true, true, false, true, true, true, true, true],
      lastAttemptedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    'Linked Lists': {
      topic: 'Linked Lists',
      subject: 'Computer Science',
      totalAttempted: 8,
      totalCorrect: 6,
      accuracy: 75,
      currentDifficulty: 'medium',
      masteryLevel: 'competent',
      recentAnswers: [true, true, false, true, true, false, true, true],
      lastAttemptedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    'Trees & Hierarchies': {
      topic: 'Trees & Hierarchies',
      subject: 'Computer Science',
      totalAttempted: 9,
      totalCorrect: 5,
      accuracy: 55,
      currentDifficulty: 'medium',
      masteryLevel: 'learning',
      recentAnswers: [true, false, false, true, true, false, false, true, true],
      lastAttemptedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    'Graph Algorithms': {
      topic: 'Graph Algorithms',
      subject: 'Computer Science',
      totalAttempted: 8,
      totalCorrect: 3,
      accuracy: 35,
      currentDifficulty: 'easy',
      masteryLevel: 'novice',
      recentAnswers: [false, false, true, false, false, true, false, true],
      lastAttemptedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  },
};

/**
 * LearningProfileService
 * Maintains student topic-wise mastery, historical accuracy,
 * and current adaptive difficulty levels.
 */
export class LearningProfileService {
  /**
   * Synchronously retrieves the student's learning profile from local cache or baseline defaults
   */
  public getProfileSync(studentId: string = 'student-01'): StudentLearningProfile {
    const cacheKey = `${CACHE_KEY_PROFILE_PREFIX}${studentId}`;
    try {
      const cached = safeGetItem(cacheKey, '');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return {
      ...INITIAL_STUDENT_LEARNING_PROFILE,
      studentId,
    };
  }

  /**
   * Retrieves or initializes the student's learning profile
   */
  public async getProfile(studentId: string = 'student-01'): Promise<StudentLearningProfile> {
    const cacheKey = `${CACHE_KEY_PROFILE_PREFIX}${studentId}`;

    // 1. Try local cache
    try {
      const cached = safeGetItem(cacheKey, '');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    // 2. Try Firestore
    try {
      const docRef = doc(db, 'studentLearningProfiles', studentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as StudentLearningProfile;
        safeSetItem(cacheKey, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Learning profile cloud fetch fallback:', e);
    }

    // 3. Fallback to initialized baseline profile
    const defaultProfile: StudentLearningProfile = {
      ...INITIAL_STUDENT_LEARNING_PROFILE,
      studentId,
    };
    safeSetItem(cacheKey, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  /**
   * Updates student learning profile after a practice quiz or formal assessment attempt
   */
  public async recordAttemptResults(
    studentId: string,
    results: Array<{
      topic: string;
      subject?: string;
      questionId: string;
      isCorrect: boolean;
      difficulty: QuestionDifficulty;
    }>
  ): Promise<StudentLearningProfile> {
    const profile = await this.getProfile(studentId);
    const updatedMetrics = { ...profile.topicMetrics };
    const attemptedIds = new Set(profile.attemptedQuestionIds || []);

    let newCorrect = 0;
    const topicGrouped: Record<string, { correct: number; total: number; diff: QuestionDifficulty }> = {};

    results.forEach((r) => {
      attemptedIds.add(r.questionId);
      if (r.isCorrect) newCorrect++;

      const normalizedTopic = r.topic || 'General Topic';
      if (!topicGrouped[normalizedTopic]) {
        topicGrouped[normalizedTopic] = { correct: 0, total: 0, diff: r.difficulty };
      }
      topicGrouped[normalizedTopic].total++;
      if (r.isCorrect) topicGrouped[normalizedTopic].correct++;
    });

    // Update topic metrics with adaptive progression
    for (const [topicName, data] of Object.entries(topicGrouped)) {
      const existing = updatedMetrics[topicName] || {
        topic: topicName,
        subject: profile.subject || 'Academic Foundations',
        totalAttempted: 0,
        totalCorrect: 0,
        accuracy: 0,
        currentDifficulty: 'easy' as QuestionDifficulty,
        masteryLevel: 'novice' as const,
        recentAnswers: [],
        lastAttemptedAt: new Date().toISOString(),
      };

      const updatedAttempted = existing.totalAttempted + data.total;
      const updatedCorrect = existing.totalCorrect + data.correct;
      const updatedAccuracy = Math.round((updatedCorrect / updatedAttempted) * 100);

      // Evaluate progressive difficulty adaptation using AdaptiveDifficultyService
      const adaptResult = adaptiveDifficultyService.calculateNextDifficulty(
        existing.currentDifficulty || data.diff,
        data.correct,
        data.total,
        existing.accuracy
      );

      const masteryLevel = adaptiveDifficultyService.calculateTopicMastery(
        updatedAccuracy,
        updatedAttempted
      );

      const recent = [...existing.recentAnswers];
      for (let i = 0; i < data.total; i++) {
        recent.push(i < data.correct);
      }
      const cappedRecent = recent.slice(-10);

      updatedMetrics[topicName] = {
        ...existing,
        totalAttempted: updatedAttempted,
        totalCorrect: updatedCorrect,
        accuracy: updatedAccuracy,
        currentDifficulty: adaptResult.nextDifficulty,
        masteryLevel,
        recentAnswers: cappedRecent,
        lastAttemptedAt: new Date().toISOString(),
      };
    }

    const totalAttempted = profile.totalQuestionsAttempted + results.length;
    const totalCorrect = profile.totalCorrectAnswers + newCorrect;
    const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    // Recalculate weak and strong topics
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    Object.values(updatedMetrics).forEach((metric) => {
      if (metric.accuracy >= 75) {
        strongTopics.push(metric.topic);
      } else if (metric.accuracy < 60) {
        weakTopics.push(metric.topic);
      }
    });

    const updatedProfile: StudentLearningProfile = {
      ...profile,
      topicMetrics: updatedMetrics,
      overallAccuracy,
      totalQuestionsAttempted: totalAttempted,
      totalCorrectAnswers: totalCorrect,
      weakTopics,
      strongTopics,
      attemptedQuestionIds: Array.from(attemptedIds),
      lastUpdated: new Date().toISOString(),
    };

    // Cache locally
    const cacheKey = `${CACHE_KEY_PROFILE_PREFIX}${studentId}`;
    safeSetItem(cacheKey, JSON.stringify(updatedProfile));

    // Persist to Cloud Firestore
    try {
      const docRef = doc(db, 'studentLearningProfiles', studentId);
      await setDoc(docRef, updatedProfile, { merge: true });
    } catch (e) {
      console.warn('Could not sync student learning profile to cloud:', e);
    }

    return updatedProfile;
  }
}

export const learningProfileService = new LearningProfileService();
