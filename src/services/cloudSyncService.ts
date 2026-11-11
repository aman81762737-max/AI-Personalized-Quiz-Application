import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  Material,
  Question,
  Assessment,
  AssessmentAttempt,
  LearningPlan,
  StudentCohortRecord,
  StudentAttemptRecord,
  UserProfile,
  StudentProfile,
} from '../types';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import {
  SEED_CURRICULUM_ASSESSMENTS,
  SEED_CURRICULUM_QUESTIONS,
} from './academicDataSync';
import { INITIAL_STUDENT_COHORT } from '../data/cohortData';

// Offline cache keys
const CACHE_KEY_MATERIALS = 'academic_cloud_cache_materials';
const CACHE_KEY_QUESTIONS = 'academic_cloud_cache_questions';
const CACHE_KEY_ASSESSMENTS = 'academic_cloud_cache_assessments';
const CACHE_KEY_ATTEMPTS = 'academic_cloud_cache_attempts';

// In-memory cache to preserve binary fileData and full extractedText across Firestore snapshots
const inMemoryMaterialMap = new Map<string, Partial<Material>>();

function stripLegacyPlaceholderMetadata(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\[Attached Multimodal File:.*?\]\n?/gi, '')
    .replace(/File format:\s*\S+\n?/gi, '')
    .replace(/Size:\s*[\d.]+\s*MB\n?/gi, '')
    .replace(/Processing Pipeline:.*?\n?/gi, '')
    .trim();
}

/**
 * ---------------------------------------------------------------------
 * 1. TEACHER AND STUDENT MATERIALS (P0)
 * ---------------------------------------------------------------------
 */
export const subscribeMaterials = (
  onUpdate: (materials: Material[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  // Emit local cache immediately (filtering out any broken legacy placeholder-only drafts)
  try {
    const cached = safeGetItem(CACHE_KEY_MATERIALS, '[]');
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleaned = parsed
        .map((m: Material) => ({
          ...m,
          extractedText: stripLegacyPlaceholderMetadata(m.extractedText),
          fileData: m.fileData || inMemoryMaterialMap.get(m.materialId)?.fileData,
        }))
        .filter((m: Material) => !(m.processingStatus === 'processing' && !m.extractedText && (!m.structuredConcepts || m.structuredConcepts.length === 0)));
      onUpdate(cleaned);
    }
  } catch {}

  const colRef = collection(db, 'materials');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Material[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Material;
        const mem = inMemoryMaterialMap.get(d.id);
        const cleanedText = stripLegacyPlaceholderMetadata(mem?.extractedText || data.extractedText);
        let status = data.processingStatus;
        // Auto-heal: If document already has synthesized concepts or a non-placeholder summary, resolve status to 'processed'
        if (
          status === 'processing' &&
          ((data.structuredConcepts && data.structuredConcepts.length > 0) ||
            (data.summary && !data.summary.includes('AI is synthesizing')))
        ) {
          status = 'processed';
        }

        items.push({
          ...data,
          materialId: d.id,
          processingStatus: status,
          extractedText: cleanedText,
          fileData: data.fileData || mem?.fileData,
        });
      });

      items.sort(
        (a, b) =>
          new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime()
      );

      safeSetItem(CACHE_KEY_MATERIALS, JSON.stringify(items.map(({ fileData: _fd, ...rest }) => rest)));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore materials subscription fallback:', err);
      if (onError) onError(err);
      try {
        const cached = safeGetItem(CACHE_KEY_MATERIALS, '[]');
        onUpdate(JSON.parse(cached));
      } catch {}
    }
  );
};

/**
 * Deeply sanitizes an object for Firestore by recursively converting any undefined
 * properties into null or omitting them, preventing Function setDoc() rejection.
 */
export function deepSanitizeForFirestore(val: any): any {
  if (val === undefined) {
    return null;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== undefined)
      .map((item) => deepSanitizeForFirestore(item));
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      result[k] = deepSanitizeForFirestore(v);
    }
  }
  return result;
}

export const saveMaterialToCloud = async (material: Material): Promise<void> => {
  // Preserve fileData and full extractedText in memory across snapshots
  inMemoryMaterialMap.set(material.materialId, {
    fileData: material.fileData || inMemoryMaterialMap.get(material.materialId)?.fileData,
    extractedText: stripLegacyPlaceholderMetadata(material.extractedText),
  });

  // Always update local cache immediately so client stays resilient across tabs
  try {
    const raw = safeGetItem(CACHE_KEY_MATERIALS, '[]');
    const list = JSON.parse(raw);
    const filtered = Array.isArray(list) ? list.filter((m: Material) => m.materialId !== material.materialId) : [];
    const cacheItem = { ...material };
    delete cacheItem.fileData;
    safeSetItem(CACHE_KEY_MATERIALS, JSON.stringify([cacheItem, ...filtered]));
  } catch {}

  const clean: any = deepSanitizeForFirestore(material);
  delete clean.fileData;

  if (clean.extractedText && typeof clean.extractedText === 'string') {
    clean.extractedText = stripLegacyPlaceholderMetadata(clean.extractedText).slice(0, 150000);
  }

  try {
    await setDoc(doc(db, 'materials', material.materialId), clean, { merge: true });
  } catch (err) {
    console.warn('Notice writing material to Firestore:', err);
  }
};

export const deleteMaterialFromCloud = async (materialId: string): Promise<void> => {
  inMemoryMaterialMap.delete(materialId);
  try {
    await deleteDoc(doc(db, 'materials', materialId));
    try {
      const raw = safeGetItem(CACHE_KEY_MATERIALS, '[]');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        safeSetItem(CACHE_KEY_MATERIALS, JSON.stringify(list.filter((m: Material) => m.materialId !== materialId)));
      }
    } catch {}
  } catch (err) {
    console.error('Error deleting material from Firestore:', err);
    throw err;
  }
};

/**
 * ---------------------------------------------------------------------
 * 2. QUESTION BANK AND GENERATED QUESTIONS (P0)
 * ---------------------------------------------------------------------
 */
export const subscribeQuestions = (
  onUpdate: (questions: Question[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  try {
    const cached = safeGetItem(CACHE_KEY_QUESTIONS, '[]');
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      onUpdate(parsed);
    } else {
      onUpdate(SEED_CURRICULUM_QUESTIONS);
    }
  } catch {
    onUpdate(SEED_CURRICULUM_QUESTIONS);
  }

  const colRef = collection(db, 'questions');
  return onSnapshot(
    colRef,
    async (snapshot) => {
      const items: Question[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Question), questionId: d.id });
      });

      if (items.length === 0) {
        // Seed default curriculum questions
        for (const q of SEED_CURRICULUM_QUESTIONS) {
          setDoc(doc(db, 'questions', q.questionId), q).catch(() => {});
        }
        items.push(...SEED_CURRICULUM_QUESTIONS);
      }

      const seen = new Map<string, Question>();
      items.forEach((q) => seen.set(q.questionId, q));
      const result = Array.from(seen.values());

      safeSetItem(CACHE_KEY_QUESTIONS, JSON.stringify(result));
      onUpdate(result);
    },
    (err) => {
      console.warn('Firestore questions subscription fallback:', err);
      if (onError) onError(err);
      try {
        const cached = safeGetItem(CACHE_KEY_QUESTIONS, '[]');
        const parsed = JSON.parse(cached);
        onUpdate(Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_CURRICULUM_QUESTIONS);
      } catch {
        onUpdate(SEED_CURRICULUM_QUESTIONS);
      }
    }
  );
};

export const saveQuestionToCloud = async (question: Question): Promise<void> => {
  try {
    await setDoc(doc(db, 'questions', question.questionId), question, { merge: true });
  } catch (err) {
    console.error('Error saving question to Firestore:', err);
    throw err;
  }
};

export const batchSaveQuestionsToCloud = async (questions: Question[]): Promise<void> => {
  try {
    for (const q of questions) {
      await setDoc(doc(db, 'questions', q.questionId), q, { merge: true });
    }
  } catch (err) {
    console.error('Error batch saving questions to Firestore:', err);
    throw err;
  }
};

export const deleteQuestionFromCloud = async (questionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'questions', questionId));
  } catch (err) {
    console.error('Error deleting question from Firestore:', err);
    throw err;
  }
};

/**
 * ---------------------------------------------------------------------
 * 3. ASSESSMENTS (P0)
 * ---------------------------------------------------------------------
 */
export const subscribeAssessments = (
  onUpdate: (assessments: Assessment[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  try {
    const cached = safeGetItem(CACHE_KEY_ASSESSMENTS, '[]');
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      onUpdate(parsed);
    } else {
      onUpdate(SEED_CURRICULUM_ASSESSMENTS);
    }
  } catch {
    onUpdate(SEED_CURRICULUM_ASSESSMENTS);
  }

  const colRef = collection(db, 'assessments');
  return onSnapshot(
    colRef,
    async (snapshot) => {
      const items: Assessment[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Assessment), assessmentId: d.id });
      });

      if (items.length === 0) {
        for (const a of SEED_CURRICULUM_ASSESSMENTS) {
          setDoc(doc(db, 'assessments', a.assessmentId), a).catch(() => {});
        }
        items.push(...SEED_CURRICULUM_ASSESSMENTS);
      }

      const seen = new Map<string, Assessment>();
      items.forEach((a) => seen.set(a.assessmentId, a));
      const result = Array.from(seen.values());

      safeSetItem(CACHE_KEY_ASSESSMENTS, JSON.stringify(result));
      onUpdate(result);
    },
    (err) => {
      console.warn('Firestore assessments subscription fallback:', err);
      if (onError) onError(err);
      try {
        const cached = safeGetItem(CACHE_KEY_ASSESSMENTS, '[]');
        const parsed = JSON.parse(cached);
        onUpdate(Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_CURRICULUM_ASSESSMENTS);
      } catch {
        onUpdate(SEED_CURRICULUM_ASSESSMENTS);
      }
    }
  );
};

export const saveAssessmentToCloud = async (assessment: Assessment): Promise<void> => {
  try {
    await setDoc(doc(db, 'assessments', assessment.assessmentId), assessment, { merge: true });
    // Also save in local cache
    try {
      const raw = safeGetItem(CACHE_KEY_ASSESSMENTS, '[]');
      const list = JSON.parse(raw);
      const filtered = Array.isArray(list) ? list.filter((a: Assessment) => a.assessmentId !== assessment.assessmentId) : [];
      safeSetItem(CACHE_KEY_ASSESSMENTS, JSON.stringify([assessment, ...filtered]));
    } catch {}
  } catch (err) {
    console.error('Error saving assessment to Firestore:', err);
    throw err;
  }
};

export const deleteAssessmentFromCloud = async (assessmentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'assessments', assessmentId));
  } catch (err) {
    console.error('Error deleting assessment from Firestore:', err);
    throw err;
  }
};

/**
 * ---------------------------------------------------------------------
 * 4. ASSESSMENT ATTEMPTS (P0)
 * Uses canonical path /assessmentAttempts/{attemptId}
 * ---------------------------------------------------------------------
 */
export const subscribeAttempts = (
  onUpdate: (attempts: AssessmentAttempt[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  try {
    const cached = safeGetItem(CACHE_KEY_ATTEMPTS, '[]');
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      onUpdate(parsed);
    }
  } catch {}

  const colRef = collection(db, 'assessmentAttempts');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AssessmentAttempt[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as AssessmentAttempt), attemptId: d.id });
      });

      // Deduplicate by attemptId
      const seen = new Map<string, AssessmentAttempt>();
      items.forEach((a) => {
        const key = a.attemptId || `${a.assessmentId}-${a.studentId}`;
        seen.set(key, a);
      });
      const result = Array.from(seen.values());

      result.sort(
        (a, b) =>
          new Date(b.submittedAt || b.startedAt || 0).getTime() -
          new Date(a.submittedAt || a.startedAt || 0).getTime()
      );

      safeSetItem(CACHE_KEY_ATTEMPTS, JSON.stringify(result));
      onUpdate(result);
    },
    (err) => {
      console.warn('Firestore attempts subscription fallback:', err);
      if (onError) onError(err);
      try {
        const cached = safeGetItem(CACHE_KEY_ATTEMPTS, '[]');
        onUpdate(JSON.parse(cached));
      } catch {}
    }
  );
};

export const saveAssessmentAttemptToCloud = async (
  attempt: AssessmentAttempt
): Promise<void> => {
  const attemptId = attempt.attemptId || `att-${Date.now()}-${attempt.studentId}`;
  const payload: AssessmentAttempt = {
    ...attempt,
    attemptId,
  };

  try {
    // Write strictly to the canonical assessmentAttempts collection
    await setDoc(doc(db, 'assessmentAttempts', attemptId), payload, { merge: true });

    // Update submissions count on parent assessment document in Firestore
    if (attempt.assessmentId) {
      try {
        const asmRef = doc(db, 'assessments', attempt.assessmentId);
        const asmSnap = await getDoc(asmRef);
        if (asmSnap.exists()) {
          const currentData = asmSnap.data();
          const newCount = (currentData.submissionsCount || 0) + 1;
          await setDoc(
            asmRef,
            {
              submissionsCount: newCount,
              lastSubmittedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (asmErr) {
        console.warn('Notice updating assessment submissions count:', asmErr);
      }
    }

    // Also update local cache for zero delay
    try {
      const raw = safeGetItem(CACHE_KEY_ATTEMPTS, '[]');
      const list = JSON.parse(raw);
      const filtered = Array.isArray(list) ? list.filter((a: AssessmentAttempt) => a.attemptId !== attemptId) : [];
      safeSetItem(CACHE_KEY_ATTEMPTS, JSON.stringify([payload, ...filtered]));
    } catch {}
  } catch (err) {
    console.error('Error saving attempt to Firestore:', err);
    throw err;
  }
};

/**
 * ---------------------------------------------------------------------
 * 5. IN-PROGRESS EXAM STATE (P0)
 * ---------------------------------------------------------------------
 */
export const saveInProgressExamState = async (
  attemptId: string,
  state: {
    assessmentId: string;
    studentId: string;
    currentIndex: number;
    recordedAnswers: Record<string, string>;
    timeRemainingSeconds: number;
    status: 'in_progress' | 'submitted';
    flaggedQuestions?: string[];
  }
): Promise<void> => {
  // Save in local storage for instant sync
  safeSetItem(`in_progress_exam_${attemptId}`, JSON.stringify(state));

  try {
    await setDoc(
      doc(db, 'inProgressExams', attemptId),
      {
        ...state,
        attemptId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('In-progress exam cloud save warning:', err);
  }
};

export const loadInProgressExamState = async (
  attemptId: string
): Promise<any | null> => {
  // First check local storage
  const local = safeGetItem(`in_progress_exam_${attemptId}`, '');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }

  // Fallback to Firestore
  try {
    const snap = await getDoc(doc(db, 'inProgressExams', attemptId));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('In-progress exam fetch error:', err);
  }
  return null;
};

export const clearInProgressExamState = async (attemptId: string): Promise<void> => {
  try {
    localStorage.removeItem(`in_progress_exam_${attemptId}`);
  } catch {}
  try {
    await deleteDoc(doc(db, 'inProgressExams', attemptId));
  } catch (err) {
    console.warn('Error clearing in-progress exam state:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 6. LEARNING PLANS (P1)
 * ---------------------------------------------------------------------
 */
export const subscribeLearningPlans = (
  studentId: string,
  onUpdate: (plan: LearningPlan | null) => void
): Unsubscribe => {
  const localKey = `learning_plan_${studentId}`;
  try {
    const cached = safeGetItem(localKey, '');
    if (cached) onUpdate(JSON.parse(cached));
  } catch {}

  const q = query(collection(db, 'learningPlans'), where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snap) => {
      let plan: LearningPlan | null = null;
      snap.forEach((d) => {
        plan = { ...(d.data() as LearningPlan), planId: d.id };
      });
      if (plan) {
        safeSetItem(localKey, JSON.stringify(plan));
        onUpdate(plan);
      }
    },
    () => {
      try {
        const cached = safeGetItem(localKey, '');
        if (cached) onUpdate(JSON.parse(cached));
      } catch {}
    }
  );
};

export const saveLearningPlanToCloud = async (plan: LearningPlan): Promise<void> => {
  try {
    await setDoc(doc(db, 'learningPlans', plan.planId), plan, { merge: true });
    safeSetItem(`learning_plan_${plan.studentId}`, JSON.stringify(plan));
  } catch (err) {
    console.error('Error saving learning plan to Firestore:', err);
    throw err;
  }
};

/**
 * ---------------------------------------------------------------------
 * 7. NOTIFICATIONS & READ STATE (P1)
 * ---------------------------------------------------------------------
 */
export const DEFAULT_NOTIFICATIONS_BY_ROLE: Record<string, any[]> = {
  student: [
    {
      id: 1,
      title: 'New Examination Available: CS201 Midterm',
      time: '15m ago',
      desc: 'Faculty published "Midterm Examination - Graph Traversals & Search Algorithms". Passing threshold: 70%.',
      fullMessage: 'A proctored assessment titled "Midterm Examination - Graph Traversals & Search Algorithms" has been published by your course instructor. Review all connected study notes and ensure full focus before beginning.',
      sender: 'Course Faculty (Prof. Jenkins)',
      type: 'exam',
      unread: true,
      priority: 'high',
      actionView: 'assessments',
      actionLabel: 'Open Assessment Corridor',
      role: 'student',
    },
    {
      id: 2,
      title: 'Academic Practice Review Feedback',
      time: '1h ago',
      desc: 'Faculty review flagged repeated errors on Graph Cycle Detection. Structured practice review notes have been prepared.',
      fullMessage: 'A faculty review flagged an invariant misunderstanding between BFS visited states and recursive DFS back-edges in your recent practice sessions. A structured practice review is available in your dashboard.',
      sender: 'Department of Computer Science',
      type: 'practice',
      unread: true,
      priority: 'normal',
      actionView: 'dashboard',
      actionLabel: 'Inspect Review Notes',
      role: 'student',
    },
    {
      id: 3,
      title: 'Course Study Guide Ingested',
      time: '3h ago',
      desc: 'Textbook materials for Advanced Data Structures have been synthesized into clean review notes.',
      fullMessage: 'Your professor uploaded comprehensive lecture materials on Graph Traversals and Queue Invariants. All concepts and practice items are ready in your study corridor.',
      sender: 'Academic Curriculum Engine',
      type: 'ai',
      unread: false,
      priority: 'normal',
      actionView: 'materials',
      actionLabel: 'View Study Materials',
      role: 'student',
    },
  ],
  teacher: [
    {
      id: 101,
      title: 'Cohort Submissions Live Update',
      time: '10m ago',
      desc: 'New submissions received for "Midterm Examination - Graph Traversals". Cohort average accuracy: 84.5%.',
      fullMessage: 'Enrolled students in 3rd Year CSE have submitted their proctored exam attempts. Automated grading and proctor telemetry audits are complete and ready for faculty review.',
      sender: 'Evaluation Gateway',
      type: 'exam',
      unread: true,
      priority: 'high',
      actionView: 'assessments',
      actionLabel: 'Inspect Submissions Roster',
      role: 'teacher',
    },
    {
      id: 102,
      title: 'Curriculum Material Synthesized',
      time: '1h ago',
      desc: 'Gemini 3.8 Flash decomposed uploaded document into 15 Bloom-calibrated questions & concept trees.',
      fullMessage: 'Document-to-Assessment ingestion completed with zero omissions. 15 questions across Easy, Medium, and Hard tiers have been drafted to your question bank for approval.',
      sender: 'Gemini Ingestion Engine',
      type: 'ai',
      unread: true,
      priority: 'normal',
      actionView: 'materials',
      actionLabel: 'Review Knowledge Tree',
      role: 'teacher',
    },
    {
      id: 103,
      title: 'Cohort Diagnostic Bottleneck Alert',
      time: '4h ago',
      desc: '68% of enrolled students exhibit misconceptions regarding BFS Queue memory bounds during cycle detection.',
      fullMessage: 'Pedagogical telemetry identifies a systemic error pattern where students conflate DFS recursive stack depth with BFS queue memory bounds. Remedial handout synthesis recommended.',
      sender: 'Diagnostic Telemetry Engine',
      type: 'analytics',
      unread: false,
      priority: 'high',
      actionView: 'analytics',
      actionLabel: 'View Cohort Telemetry',
      role: 'teacher',
    },
  ],
  admin: [
    {
      id: 201,
      title: 'Consortium Sovereign Credential Audit',
      time: '20m ago',
      desc: 'All student and faculty security passport credentials verified under ISO/IEC 27001 standards.',
      fullMessage: 'The automated cryptographic credential audit completed successfully across all academic shards. Zero non-compliant accounts or expired credentials were detected.',
      sender: 'Platform Security Directorate',
      type: 'system',
      unread: true,
      priority: 'high',
      actionView: 'admin-system',
      actionLabel: 'Inspect Security Logs',
      role: 'admin',
    },
    {
      id: 202,
      title: 'Multi-College Cloud Shards Active',
      time: '2h ago',
      desc: 'Firestore real-time sync operational across all 140+ partner institutions at 99.98% SLA.',
      fullMessage: 'Distributed replication health checks confirmed nominal latency (<45ms) and 100% database availability across regional clusters.',
      sender: 'Infrastructure Operations',
      type: 'system',
      unread: true,
      priority: 'normal',
      actionView: 'admin-analytics',
      actionLabel: 'Cluster Health Dashboard',
      role: 'admin',
    },
    {
      id: 203,
      title: 'Faculty Account Verified',
      time: '5h ago',
      desc: 'Dr. Sarah Jenkins verified with Level 2 Educator clearance for Computer Science & Engineering.',
      fullMessage: 'Institutional faculty credential verification trace completed. Appropriate course authoring and grading permissions have been granted.',
      sender: 'Academic Registry',
      type: 'system',
      unread: false,
      priority: 'normal',
      actionView: 'admin-users',
      actionLabel: 'Manage User Accounts',
      role: 'admin',
    },
  ],
};

export const subscribeNotifications = (
  userId: string,
  userRole: string = 'student',
  onUpdate: (notifications: any[]) => void
): Unsubscribe => {
  const localKey = `notifications_${userId}_${userRole}`;
  const clearedKey = `notifications_cleared_${userId}_${userRole}`;
  const defaultSeeds = DEFAULT_NOTIFICATIONS_BY_ROLE[userRole] || DEFAULT_NOTIFICATIONS_BY_ROLE.student;

  const isCleared = typeof window !== 'undefined' && localStorage.getItem(clearedKey) !== null;

  try {
    const cached = safeGetItem(localKey, '');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) onUpdate(parsed);
    } else if (!isCleared) {
      onUpdate(defaultSeeds);
    } else {
      onUpdate([]);
    }
  } catch {
    if (!isCleared) onUpdate(defaultSeeds);
    else onUpdate([]);
  }

  const colRef = collection(db, 'notifications');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const rawList: any[] = [];
      const seenIds = new Set<string>();

      snapshot.forEach((d) => {
        const data = d.data();
        const docRole = data.role || data.targetAudience;
        const docUser = data.userId;
        // Match user, role, or broadcast 'all'
        if (
          !docUser ||
          docUser === 'all' ||
          docUser === userId ||
          docRole === userRole ||
          docRole === 'all' ||
          (!docRole && !docUser)
        ) {
          const uniqueId = String(d.id || data.notificationId || data.id || `notif-${rawList.length}`);
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            rawList.push({
              ...data,
              notificationId: d.id,
              id: uniqueId,
            });
          }
        }
      });

      const currentCleared = typeof window !== 'undefined' && localStorage.getItem(clearedKey) !== null;

      if (rawList.length === 0 && !currentCleared) {
        // Seed initial notifications to Firestore for this role/user ONLY if user has never cleared notifications
        defaultSeeds.forEach((item, idx) => {
          const docId = `seed-${userRole}-${item.id || idx}`;
          setDoc(doc(db, 'notifications', docId), {
            ...item,
            id: item.id || docId,
            userId,
            role: userRole,
            createdAt: new Date().toISOString(),
          }).catch(() => {});
          if (!seenIds.has(docId)) {
            seenIds.add(docId);
            rawList.push({ ...item, id: docId, notificationId: docId });
          }
        });
      }

      rawList.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      // Apply System Notification Frequency Setting
      const freq = typeof window !== 'undefined' ? localStorage.getItem('app_notification_frequency') : 'realtime';
      let processedList = rawList;
      if (freq === 'critical') {
        processedList = rawList.filter((n) =>
          n.type === 'alert' ||
          n.type === 'deadline' ||
          n.priority === 'high' ||
          (n.title && /deadline|alert|urgent|exam|violation/i.test(n.title))
        );
      }

      safeSetItem(localKey, JSON.stringify(processedList));
      onUpdate(processedList);
    },
    (err) => {
      console.warn('Firestore notifications subscription notice:', err);
      try {
        const cached = safeGetItem(localKey, '');
        if (cached) {
          onUpdate(JSON.parse(cached));
        } else if (!isCleared) {
          onUpdate(defaultSeeds);
        } else {
          onUpdate([]);
        }
      } catch {
        onUpdate([]);
      }
    }
  );
};

export const saveNotificationToCloud = async (notification: any): Promise<void> => {
  const id = String(notification.id || notification.notificationId || `notif-${Date.now()}`);
  await setDoc(doc(db, 'notifications', id), { ...notification, notificationId: id, id }, { merge: true });
};

export const markNotificationReadInCloud = async (
  notificationId: string | number,
  userRole?: string
): Promise<void> => {
  try {
    const idStr = String(notificationId);
    await setDoc(doc(db, 'notifications', idStr), { unread: false, read: true }, { merge: true });
    if (typeof notificationId === 'number' || !isNaN(Number(notificationId))) {
      const roles = userRole ? [userRole] : ['student', 'teacher', 'admin'];
      for (const r of roles) {
        await setDoc(doc(db, 'notifications', `seed-${r}-${notificationId}`), { unread: false, read: true }, { merge: true }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('markNotificationRead warning:', err);
  }
};

export const markAllNotificationsReadInCloud = async (
  userId: string,
  userRole: string,
  items: any[]
): Promise<void> => {
  try {
    const localKey = `notifications_${userId}_${userRole}`;
    try {
      const cached = safeGetItem(localKey, '');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((item: any) => ({ ...item, unread: false, read: true }));
          safeSetItem(localKey, JSON.stringify(updated));
        }
      }
    } catch {}

    // 1. Direct item updates from active memory
    for (const item of items) {
      const docId = String(item.notificationDocId || item.notificationId || item.id);
      await setDoc(doc(db, 'notifications', docId), { unread: false, read: true }, { merge: true }).catch(() => {});
      if (typeof item.id === 'number' || !isNaN(Number(item.id))) {
        await setDoc(doc(db, 'notifications', `seed-${userRole}-${item.id}`), { unread: false, read: true }, { merge: true }).catch(() => {});
      }
    }

    // 2. Query and mark all unread notifications in Firestore matching this user or role
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      snap.forEach((d) => {
        const data = d.data();
        const docRole = data.role || data.targetAudience;
        const docUser = data.userId;
        if (
          !docUser ||
          docUser === 'all' ||
          docUser === userId ||
          docRole === userRole ||
          docRole === 'all' ||
          (!docRole && !docUser)
        ) {
          if (data.unread !== false || !data.read) {
            setDoc(doc(db, 'notifications', d.id), { unread: false, read: true }, { merge: true }).catch(() => {});
          }
        }
      });
    } catch (queryErr) {
      console.warn('markAllNotificationsRead query update notice:', queryErr);
    }
  } catch (err) {
    console.warn('markAllNotificationsReadInCloud error:', err);
  }
};

export const toggleNotificationReadInCloud = async (notificationId: string | number, unread: boolean): Promise<void> => {
  try {
    await setDoc(doc(db, 'notifications', String(notificationId)), { unread, read: !unread }, { merge: true });
  } catch (err) {
    console.warn('toggleNotificationRead warning:', err);
  }
};

export const deleteNotificationFromCloud = async (notificationId: string | number): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'notifications', String(notificationId)));
  } catch (err) {
    console.warn('deleteNotification warning:', err);
  }
};

export const deleteNotificationsForAssessment = async (assessmentId: string): Promise<void> => {
  try {
    const snap = await getDocs(collection(db, 'notifications'));
    snap.forEach((d) => {
      const notifId = d.id;
      const data = d.data();
      const isRelated =
        notifId.includes(assessmentId) ||
        data.assessmentId === assessmentId ||
        (data.id && String(data.id).includes(assessmentId)) ||
        (data.actionView === 'assessments' && data.title?.includes(assessmentId));
      if (isRelated) {
        deleteDoc(doc(db, 'notifications', notifId)).catch(() => {});
      }
    });

    ['student', 'teacher', 'admin', 'guest'].forEach((r) => {
      try {
        const key = `notifications_${r}`;
        const raw = safeGetItem(key, '');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const filtered = list.filter((n: any) => {
              const nid = String(n.id || n.notificationId || '');
              return !nid.includes(assessmentId) && n.assessmentId !== assessmentId;
            });
            safeSetItem(key, JSON.stringify(filtered));
          }
        }
      } catch {}
    });
  } catch (err) {
    console.warn('deleteNotificationsForAssessment error:', err);
  }
};

export const clearAllNotificationsFromCloud = async (
  userId: string,
  notificationIds: (string | number)[],
  userRole: string = 'student'
): Promise<void> => {
  try {
    for (const id of notificationIds) {
      await deleteDoc(doc(db, 'notifications', String(id))).catch(() => {});
    }
    safeSetItem(`notifications_${userId}_${userRole}`, '[]');
    safeSetItem(`notifications_${userId}`, '[]');
    safeSetItem(`notifications_cleared_${userId}_${userRole}`, Date.now().toString());
  } catch (err) {
    console.warn('clearAllNotifications warning:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 8. TIMETABLES (P1)
 * ---------------------------------------------------------------------
 */
export const subscribeTimetable = (
  userId: string,
  onUpdate: (timetable: any) => void
): Unsubscribe => {
  const localKey = `academic_timetable_${userId}`;
  try {
    const cached = safeGetItem(localKey, '');
    if (cached) onUpdate(JSON.parse(cached));
  } catch {}

  return onSnapshot(
    doc(db, 'timetables', userId),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        safeSetItem(localKey, JSON.stringify(data));
        onUpdate(data);
      }
    },
    () => {
      try {
        const cached = safeGetItem(localKey, '');
        if (cached) onUpdate(JSON.parse(cached));
      } catch {}
    }
  );
};

export const saveTimetableToCloud = async (userId: string, timetable: any): Promise<void> => {
  safeSetItem(`academic_timetable_${userId}`, JSON.stringify(timetable));
  try {
    await setDoc(
      doc(db, 'timetables', userId),
      { ...timetable, userId, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    console.warn('Timetable cloud write warning:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 9. CUSTOM ROADMAPS & PROGRESS (P1)
 * ---------------------------------------------------------------------
 */
export const subscribeCustomRoadmaps = (
  onUpdate: (roadmaps: any[]) => void
): Unsubscribe => {
  const localKey = 'custom_detailed_roadmaps_v1';
  try {
    const cached = safeGetItem(localKey, '[]');
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) onUpdate(parsed);
  } catch {}

  const colRef = collection(db, 'customRoadmaps');
  return onSnapshot(
    colRef,
    (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ ...d.data(), id: d.id }));
      if (items.length > 0) {
        safeSetItem(localKey, JSON.stringify(items));
        onUpdate(items);
      }
    },
    () => {}
  );
};

export const saveCustomRoadmapToCloud = async (roadmap: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'customRoadmaps', roadmap.id), roadmap, { merge: true });
    const raw = safeGetItem('custom_detailed_roadmaps_v1', '[]');
    let list: any[] = [];
    try {
      list = JSON.parse(raw);
    } catch {}
    const updated = [roadmap, ...list.filter((r) => r.id !== roadmap.id)];
    safeSetItem('custom_detailed_roadmaps_v1', JSON.stringify(updated));
  } catch (err) {
    console.warn('Roadmap cloud write error:', err);
  }
};

export const subscribeRoadmapProgress = (
  userId: string,
  onUpdate: (progress: { completedNodeIds: string[]; activeRoadmapId?: string }) => void
): Unsubscribe => {
  const localKey = `roadmap_progress_${userId}`;
  try {
    const cached = safeGetItem(localKey, '');
    if (cached) onUpdate(JSON.parse(cached));
  } catch {}

  return onSnapshot(
    doc(db, 'roadmapProgress', userId),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        safeSetItem(localKey, JSON.stringify(data));
        onUpdate(data);
      }
    },
    () => {}
  );
};

export const saveRoadmapProgressToCloud = async (
  userId: string,
  completedNodeIds: string[],
  activeRoadmapId?: string
): Promise<void> => {
  const payload = {
    userId,
    completedNodeIds,
    activeRoadmapId,
    updatedAt: new Date().toISOString(),
  };
  safeSetItem(`roadmap_progress_${userId}`, JSON.stringify(payload));
  try {
    await setDoc(doc(db, 'roadmapProgress', userId), payload, { merge: true });
  } catch (err) {
    console.warn('Roadmap progress sync warning:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 10. AI CHAT CONVERSATION SESSIONS (P1)
 * Scoped by userId and role
 * ---------------------------------------------------------------------
 */
export const subscribeAIChatSessions = (
  userId: string,
  role: string,
  onUpdate: (sessions: any[]) => void
): Unsubscribe => {
  const localKey = `ai_chat_sessions_${userId}_${role}`;
  try {
    const cached = safeGetItem(localKey, '[]');
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) onUpdate(parsed);
  } catch {}

  const q = query(
    collection(db, 'aiChatSessions'),
    where('userId', '==', userId),
    where('role', '==', role)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ ...d.data(), id: d.id }));
      items.sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      );
      if (items.length > 0) {
        safeSetItem(localKey, JSON.stringify(items));
        onUpdate(items);
      }
    },
    () => {}
  );
};

export const saveAIChatSessionToCloud = async (session: any): Promise<void> => {
  try {
    await setDoc(
      doc(db, 'aiChatSessions', session.id),
      { ...session, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    console.warn('AI chat session cloud write warning:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 11. QUICK NOTES (P1)
 * ---------------------------------------------------------------------
 */
export const subscribeQuickNotes = (
  userId: string,
  onUpdate: (notes: any[]) => void
): Unsubscribe => {
  const localKey = `ai_quick_notes_${userId}`;
  try {
    const cached = safeGetItem(localKey, '[]');
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) onUpdate(parsed);
  } catch {}

  const q = query(collection(db, 'quickNotes'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ ...d.data(), id: d.id }));
      items.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      if (items.length > 0) {
        safeSetItem(localKey, JSON.stringify(items));
        onUpdate(items);
      }
    },
    () => {}
  );
};

export const saveQuickNoteToCloud = async (note: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'quickNotes', note.id), note, { merge: true });
    const localKey = `ai_quick_notes_${note.userId}`;
    const raw = safeGetItem(localKey, '[]');
    let current: any[] = [];
    try {
      current = JSON.parse(raw);
    } catch {}
    const updated = [note, ...current.filter((n) => n.id !== note.id)];
    safeSetItem(localKey, JSON.stringify(updated));
  } catch (err) {
    console.warn('Quick note cloud write warning:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 12. STUDY PLAN MILESTONES (P1)
 * ---------------------------------------------------------------------
 */
export const subscribePlanMilestones = (
  userId: string,
  onUpdate: (milestoneIds: string[]) => void
): Unsubscribe => {
  const localKey = `plan_milestones_${userId}`;
  try {
    const cached = safeGetItem(localKey, '[]');
    onUpdate(JSON.parse(cached));
  } catch {}

  return onSnapshot(
    doc(db, 'planMilestones', userId),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        const ids = data.completedMilestoneIds || [];
        safeSetItem(localKey, JSON.stringify(ids));
        onUpdate(ids);
      }
    },
    () => {}
  );
};

export const savePlanMilestonesToCloud = async (
  userId: string,
  milestoneIds: string[]
): Promise<void> => {
  safeSetItem(`plan_milestones_${userId}`, JSON.stringify(milestoneIds));
  try {
    await setDoc(
      doc(db, 'planMilestones', userId),
      {
        userId,
        completedMilestoneIds: milestoneIds,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Plan milestones sync warning:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 13. AI WORKFLOW STUDIO STATE (P1)
 * ---------------------------------------------------------------------
 */
export const subscribeWorkflowStudio = (
  userId: string,
  onUpdate: (state: any) => void
): Unsubscribe => {
  const localKey = `workflow_studio_${userId}`;
  try {
    const cached = safeGetItem(localKey, '');
    if (cached) onUpdate(JSON.parse(cached));
  } catch {}

  return onSnapshot(
    doc(db, 'workflowStudio', userId),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        safeSetItem(localKey, JSON.stringify(data));
        onUpdate(data);
      }
    },
    () => {}
  );
};

export const saveWorkflowStudioToCloud = async (
  userId: string,
  state: any
): Promise<void> => {
  safeSetItem(`workflow_studio_${userId}`, JSON.stringify(state));
  try {
    await setDoc(
      doc(db, 'workflowStudio', userId),
      {
        userId,
        ...state,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Workflow studio sync warning:', err);
  }
};

/**
 * ---------------------------------------------------------------------
 * 14. REAL-TIME STUDENT COHORT SYNCHRONIZATION (P0)
 * Listens to student profiles and attempts in Firestore and dynamically
 * aggregates live cohort metrics, attempts, performance, and weaknesses.
 * ---------------------------------------------------------------------
 */
export const subscribeEnrolledCohort = (
  onUpdate: (students: StudentCohortRecord[]) => void
): Unsubscribe => {
  // Emit initial local cache immediately
  try {
    const raw = safeGetItem('academic_registered_students', '[]');
    const registered: StudentCohortRecord[] = JSON.parse(raw);
    const initialMap = new Map<string, StudentCohortRecord>();
    INITIAL_STUDENT_COHORT.forEach((s) => initialMap.set(s.id, { ...s }));
    if (Array.isArray(registered)) {
      registered.forEach((r) => initialMap.set(r.id, r));
    }
    onUpdate(Array.from(initialMap.values()));
  } catch {}

  let attemptsList: AssessmentAttempt[] = [];
  let registeredList: any[] = [];

  const notifyCohort = () => {
    const studentsMap = new Map<string, StudentCohortRecord>();

    // 1. Seed cohort
    INITIAL_STUDENT_COHORT.forEach((s) => {
      studentsMap.set(s.id, {
        ...s,
        strengths: [...s.strengths],
        weaknesses: [...s.weaknesses],
        atomAiTelemetry: s.atomAiTelemetry ? { ...s.atomAiTelemetry } : undefined,
        attemptHistory: (s.attemptHistory || []).map((a) => ({ ...a })),
      });
    });

    // 2. Add or update registered students from Firestore
    registeredList.forEach((userDoc) => {
      const id = userDoc.userId || userDoc.id || userDoc.studentId;
      if (!id) return;
      const studentId = userDoc.studentIdNumber || userDoc.studentId || id;
      const name = userDoc.name || 'Enrolled Student';
      const email = userDoc.email || `${id}@student.mitwpu.edu.in`;
      const college = userDoc.college || userDoc.institutionName || 'MIT  World Peace University (MIT - WPU)';
      const stream = userDoc.stream || 'Computer Science & Engineering';
      const year = userDoc.year || '3rd Year';
      const existing = studentsMap.get(id);
      const avatarUrl = userDoc.avatarUrl || userDoc.profilePhoto || existing?.avatarUrl;
      const record: StudentCohortRecord = {
        id,
        studentId,
        name,
        email,
        phone: userDoc.phone || '+1 (555) 234-5678',
        gender: userDoc.gender || 'male',
        dob: userDoc.dob || '2004-05-14',
        college,
        stream,
        year,
        avatarUrl,
        overallPerformance: userDoc.overallPerformance || existing?.overallPerformance || 85,
        completedAssessments: userDoc.completedAssessments || existing?.completedAssessments || 0,
        strengths: userDoc.strengths || existing?.strengths || ['Core Invariants', 'Data Structures'],
        weaknesses: userDoc.weaknesses || existing?.weaknesses || [],
        learningStreak: userDoc.learningStreak || existing?.learningStreak || 1,
        atomAiTelemetry: {
          totalEvents: 10,
          struggleConcepts: userDoc.weaknesses || [],
          avgLatencySeconds: 38,
          remediationCount: (userDoc.weaknesses || []).length,
          masteryVelocity: userDoc.overallPerformance ? `${userDoc.overallPerformance}% Cohort Benchmark` : 'Active Telemetry',
          lastIntervention: (userDoc.weaknesses || []).length ? `Flagged on ${(userDoc.weaknesses || [])[0]}` : 'Active Telemetry',
        },
        attemptHistory: existing?.attemptHistory || [],
      };
      studentsMap.set(id, record);
    });

    // 3. Associate all canonical attempts to students in real-time
    const allStudents = Array.from(studentsMap.values());
    if (attemptsList.length > 0) {
      allStudents.forEach((student) => {
        const studentAttempts = attemptsList.filter(
          (att) =>
            att.studentId === student.id ||
            att.studentId === student.studentId ||
            (att.studentId === 'demo_student_alex' && student.id === 'stu-alex-morgan') ||
            (att.studentName && att.studentName.toLowerCase() === student.name.toLowerCase())
        );

        if (studentAttempts.length > 0) {
          const formattedHistory: StudentAttemptRecord[] = studentAttempts.map((att) => ({
            id: att.attemptId || `att-${Date.now()}`,
            title: att.assessmentTitle || 'Interactive Assessment',
            course: student.stream || 'Computer Science & Engineering',
            date: att.submittedAt
              ? new Date(att.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent',
            duration: '25 mins',
            score: att.score ?? 0,
            total: att.questionIds?.length || 10,
            percentage: att.percentage ?? 0,
            passed: att.passed ?? ((att.percentage ?? 0) >= 70),
            bloomsProfile: 'Apply: 85% · Analyze: 80%',
            proctorRating: (att.proctoringViolationsCount || 0) > 0 ? 'Flags Detected' : 'Verified Clean · 0 Anomalies',
            mistakesSummary:
              (att.reviewItems || [])
                .filter((r) => !r.isCorrect)
                .map((r) => r.topic)
                .join(', ') || 'No critical mistakes recorded.',
          }));

          // Merge attempt history, keeping unique IDs
          const seen = new Set<string>();
          const deduped: StudentAttemptRecord[] = [];
          [...formattedHistory, ...student.attemptHistory].forEach((a) => {
            if (a.id && !seen.has(a.id)) {
              seen.add(a.id);
              deduped.push(a);
            }
          });

          student.attemptHistory = deduped;
          student.completedAssessments = deduped.length;
          if (deduped.length > 0) {
            const avg = Math.round(deduped.reduce((s, a) => s + (a.percentage || 0), 0) / deduped.length);
            student.overallPerformance = avg;
          }

          // Calculate live strengths and weaknesses from real review items
          const wrongTopics = new Set<string>();
          const correctTopics = new Set<string>();
          studentAttempts.forEach((att) => {
            (att.reviewItems || []).forEach((item) => {
              if (item.topic) {
                if (item.isCorrect) correctTopics.add(item.topic);
                else wrongTopics.add(item.topic);
              }
            });
          });

          if (wrongTopics.size > 0) {
            student.weaknesses = Array.from(wrongTopics);
          }
          if (correctTopics.size > 0) {
            student.strengths = Array.from(correctTopics).filter((t) => !wrongTopics.has(t));
          }
        }
      });
    }

    safeSetItem(
      'academic_registered_students',
      JSON.stringify(allStudents.filter((s) => !INITIAL_STUDENT_COHORT.some((init) => init.id === s.id)))
    );
    onUpdate(allStudents);
  };

  // Listen to Firestore users where role == 'student'
  const unsubUsers = onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'student')),
    (snapshot) => {
      const users: any[] = [];
      snapshot.forEach((d) => users.push({ ...d.data(), userId: d.id }));
      registeredList = users;
      notifyCohort();
    },
    (err) => console.warn('Enrolled cohort users listener warning:', err)
  );

  // Also listen to Firestore studentProfiles
  const unsubProfiles = onSnapshot(
    collection(db, 'studentProfiles'),
    (snapshot) => {
      snapshot.forEach((d) => {
        const data = d.data();
        const existingIdx = registeredList.findIndex((u) => u.userId === d.id);
        if (existingIdx >= 0) {
          registeredList[existingIdx] = { ...registeredList[existingIdx], ...data };
        } else {
          registeredList.push({ ...data, userId: d.id });
        }
      });
      notifyCohort();
    },
    (err) => console.warn('Student profiles listener warning:', err)
  );

  // Listen to Firestore canonical assessmentAttempts
  const unsubAttempts = onSnapshot(
    collection(db, 'assessmentAttempts'),
    (snapshot) => {
      const atts: AssessmentAttempt[] = [];
      snapshot.forEach((d) => atts.push({ ...(d.data() as AssessmentAttempt), attemptId: d.id }));
      attemptsList = atts;
      notifyCohort();
    },
    (err) => console.warn('Enrolled cohort attempts listener warning:', err)
  );

  return () => {
    unsubUsers();
    unsubProfiles();
    unsubAttempts();
  };
};

export const saveStudentToCohortCloud = async (
  record: StudentCohortRecord
): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', record.id), {
      userId: record.id,
      name: record.name,
      email: record.email,
      role: 'student',
      studentIdNumber: record.studentId,
      college: record.college,
      stream: record.stream,
      year: record.year,
      avatarUrl: record.avatarUrl,
      overallPerformance: record.overallPerformance,
      completedAssessments: record.completedAssessments,
      strengths: record.strengths,
      weaknesses: record.weaknesses,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    await setDoc(doc(db, 'studentProfiles', record.id), {
      studentId: record.id,
      overallPerformance: record.overallPerformance,
      completedAssessments: record.completedAssessments,
      strengths: record.strengths,
      weaknesses: record.weaknesses,
      college: record.college,
      stream: record.stream,
      year: record.year,
      avatarUrl: record.avatarUrl,
      learningStreak: record.learningStreak,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Also cache locally
    try {
      const raw = safeGetItem('academic_registered_students', '[]');
      const list: StudentCohortRecord[] = JSON.parse(raw);
      const filtered = Array.isArray(list) ? list.filter((s) => s.id !== record.id) : [];
      safeSetItem('academic_registered_students', JSON.stringify([record, ...filtered]));
    } catch {}
  } catch (err) {
    console.warn('saveStudentToCohortCloud warning:', err);
  }
};
