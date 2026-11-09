import { StudentCohortRecord, StudentAttemptRecord, UserProfile, StudentProfile } from '../types';
import { safeGetItem } from '../utils/safeStorage';

export const INITIAL_STUDENT_COHORT: StudentCohortRecord[] = [
  {
    id: 'stu-alex-morgan',
    studentId: 'PRN-2026-CS-8492',
    name: 'Alex Morgan',
    email: 'student@mitwpu.edu.in',
    phone: '+1 (555) 234-5678',
    gender: 'male',
    dob: '2004-05-14',
    college: 'MIT  World Peace University (MIT - WPU)',
    stream: 'Computer Science & Engineering',
    year: '3rd Year',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    overallPerformance: 88,
    completedAssessments: 6,
    strengths: ['Binary Search Trees', 'Dynamic Programming', 'Recursion Invariants'],
    weaknesses: ['Graph Traversals', 'Dijkstra Shortest Path'],
    learningStreak: 7,
    atomAiTelemetry: {
      totalEvents: 8,
      struggleConcepts: ['Graph Traversals', 'Back-edge Cycle Detection'],
      avgLatencySeconds: 42,
      remediationCount: 3,
      masteryVelocity: 'Top 15% CS201 Cohort',
      lastIntervention: '14 mins ago during DFS recursion drill',
    },
    attemptHistory: [
      {
        id: 'ASM-CS201-MID',
        title: 'CS201 Midterm Examination: Linear Structures & Search',
        course: 'CS201 Algorithms',
        date: 'Oct 12, 2026 at 14:30',
        duration: '42 mins',
        score: 88,
        total: 100,
        percentage: 88,
        passed: true,
        bloomsProfile: 'Apply: 90% · Analyze: 85%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Slight hesitation on amortized resizing proof in dynamic arrays.',
      },
      {
        id: 'ASM-TREE-Q3',
        title: 'Diagnostic Quiz: Tree Invariants & Height Balancing',
        course: 'CS201 Algorithms',
        date: 'Oct 08, 2026 at 11:15',
        duration: '18 mins',
        score: 64,
        total: 100,
        percentage: 64,
        passed: true,
        bloomsProfile: 'Apply: 60% · Understand: 70%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Confused double rotation case with single left rotation in AVL insertion.',
      },
      {
        id: 'ASM-HASH-Q2',
        title: 'Adaptive Drill: Hash Tables & Hash Collisions',
        course: 'CS201 Algorithms',
        date: 'Sep 29, 2026 at 16:40',
        duration: '22 mins',
        score: 92,
        total: 100,
        percentage: 92,
        passed: true,
        bloomsProfile: 'Apply: 95% · Remember: 100%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'None. Clean application of linear probing and secondary clustering bounds.',
      },
      {
        id: 'ASM-ASYM-Q1',
        title: 'Foundational Diagnostics: Asymptotic Notation',
        course: 'MATH108 Discrete',
        date: 'Sep 15, 2026 at 09:00',
        duration: '15 mins',
        score: 100,
        total: 100,
        percentage: 100,
        passed: true,
        bloomsProfile: 'Remember: 100% · Understand: 100%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Flawless limit proofs for Big-O, Big-Omega, and Big-Theta.',
      },
      {
        id: 'ASM-GRAPH-Q4',
        title: 'Socratic Drill: Depth-First vs Breadth-First Search',
        course: 'CS201 Algorithms',
        date: 'Sep 05, 2026 at 10:20',
        duration: '25 mins',
        score: 58,
        total: 100,
        percentage: 58,
        passed: false,
        bloomsProfile: 'Understand: 65% · Apply: 50%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Missed back-edge cycle detection logic in directed graphs.',
      },
    ],
  },
  {
    id: 'stu-priya-sharma',
    studentId: 'PRN-2026-CS-8510',
    name: 'Priya Sharma',
    email: 'priya.sharma@mitwpu.edu.in',
    phone: '+1 (555) 345-6789',
    gender: 'female',
    dob: '2004-08-20',
    college: 'MIT  World Peace University (MIT - WPU)',
    stream: 'Computer Science & Engineering',
    year: '3rd Year',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    overallPerformance: 94,
    completedAssessments: 8,
    strengths: ['Graph Theory', 'Topological Sort', 'Dynamic Programming', 'Complexity Bounds'],
    weaknesses: ['Bloom Filter Hashing'],
    learningStreak: 12,
    atomAiTelemetry: {
      totalEvents: 4,
      struggleConcepts: ['False positive rates in Bloom filters'],
      avgLatencySeconds: 28,
      remediationCount: 1,
      masteryVelocity: 'Top 5% Cohort Velocity',
      lastIntervention: 'Yesterday on Hash Invariants',
    },
    attemptHistory: [
      {
        id: 'ASM-CS201-MID',
        title: 'CS201 Midterm Examination: Linear Structures & Search',
        course: 'CS201 Algorithms',
        date: 'Oct 12, 2026 at 14:30',
        duration: '35 mins',
        score: 96,
        total: 100,
        percentage: 96,
        passed: true,
        bloomsProfile: 'Apply: 98% · Analyze: 95%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Minor rounding precision on floating point complexity bound.',
      },
      {
        id: 'ASM-GRAPH-ADV',
        title: 'Advanced Diagnostic: Directed Graph Cycle Invariants',
        course: 'CS201 Algorithms',
        date: 'Oct 04, 2026 at 16:00',
        duration: '20 mins',
        score: 92,
        total: 100,
        percentage: 92,
        passed: true,
        bloomsProfile: 'Analyze: 94% · Apply: 90%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'None. Strong mastery of Tarjan strongly connected components.',
      },
    ],
  },
  {
    id: 'stu-marcus-reed',
    studentId: 'PRN-2026-CS-8477',
    name: 'Marcus Reed',
    email: 'marcus.reed@mitwpu.edu.in',
    phone: '+1 (555) 456-7890',
    gender: 'male',
    dob: '2004-11-03',
    college: 'MIT  World Peace University (MIT - WPU)',
    stream: 'Computer Science & Engineering',
    year: '3rd Year',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    overallPerformance: 72,
    completedAssessments: 5,
    strengths: ['Array Traversals', 'Sorting Algorithms'],
    weaknesses: ['Dynamic Programming', 'Memoization Tables', 'Recurrence Invariants'],
    learningStreak: 4,
    atomAiTelemetry: {
      totalEvents: 14,
      struggleConcepts: ['Optimal Substructure proofs', 'Overlapping subproblems'],
      avgLatencySeconds: 68,
      remediationCount: 5,
      masteryVelocity: 'Remediation Recommended',
      lastIntervention: '2 hours ago during Knapsack drill',
    },
    attemptHistory: [
      {
        id: 'ASM-CS201-MID',
        title: 'CS201 Midterm Examination: Linear Structures & Search',
        course: 'CS201 Algorithms',
        date: 'Oct 12, 2026 at 14:30',
        duration: '48 mins',
        score: 70,
        total: 100,
        percentage: 70,
        passed: true,
        bloomsProfile: 'Apply: 72% · Analyze: 60%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Struggled to formulate bottom-up matrix table for 0/1 Knapsack.',
      },
      {
        id: 'ASM-DP-Q1',
        title: 'Adaptive Drill: Fibonacci & Grid World Recurrence',
        course: 'CS201 Algorithms',
        date: 'Oct 02, 2026 at 13:45',
        duration: '30 mins',
        score: 62,
        total: 100,
        percentage: 62,
        passed: true,
        bloomsProfile: 'Apply: 60% · Understand: 65%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Repeated redundant recursion without caching memoized values.',
      },
    ],
  },
  {
    id: 'stu-elena-rostova',
    studentId: 'PRN-2025-AI-7201',
    name: 'Elena Rostova',
    email: 'elena.rostova@mitwpu.edu.in',
    phone: '+1 (555) 567-8901',
    gender: 'female',
    dob: '2003-03-29',
    college: 'MIT  World Peace University (MIT - WPU)',
    stream: 'Data Science & Artificial Intelligence',
    year: '4th Year',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    overallPerformance: 91,
    completedAssessments: 9,
    strengths: ['Neural Net Backpropagation', 'Matrix Decomposition', 'Gradient Descent Invariants'],
    weaknesses: ['Attention Head Pruning'],
    learningStreak: 15,
    atomAiTelemetry: {
      totalEvents: 6,
      struggleConcepts: ['Transformer multi-head complexity'],
      avgLatencySeconds: 32,
      remediationCount: 2,
      masteryVelocity: 'Top 10% Senior Cohort',
      lastIntervention: '3 days ago during Transformer drill',
    },
    attemptHistory: [
      {
        id: 'ASM-AI401-MID',
        title: 'AI401 Midterm Examination: Deep Representation & Transformers',
        course: 'AI401 Deep Learning',
        date: 'Oct 10, 2026 at 10:00',
        duration: '50 mins',
        score: 93,
        total: 100,
        percentage: 93,
        passed: true,
        bloomsProfile: 'Analyze: 95% · Apply: 92%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Minor dimensional mismatch in self-attention projection equation.',
      },
    ],
  },
  {
    id: 'stu-devon-patel',
    studentId: 'PRN-2027-CS-9114',
    name: 'Devon Patel',
    email: 'devon.patel@mitwpu.edu.in',
    phone: '+1 (555) 678-9012',
    gender: 'non-binary',
    dob: '2005-09-11',
    college: 'MIT  World Peace University (MIT - WPU)',
    stream: 'Computer Science & Engineering',
    year: '2nd Year',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    overallPerformance: 85,
    completedAssessments: 4,
    strengths: ['Object-Oriented Design', 'Stack & Queue ADTs'],
    weaknesses: ['Recursion Depth Limits', 'Pointer Invariants'],
    learningStreak: 5,
    atomAiTelemetry: {
      totalEvents: 7,
      struggleConcepts: ['Memory leaks in linked nodes'],
      avgLatencySeconds: 45,
      remediationCount: 2,
      masteryVelocity: 'Steady Progression',
      lastIntervention: 'Yesterday on Pointer Arithmetic',
    },
    attemptHistory: [
      {
        id: 'ASM-CS102-FIN',
        title: 'CS102 Examination: Data Abstraction & Pointers',
        course: 'CS102 Data Structures',
        date: 'Oct 05, 2026 at 15:30',
        duration: '40 mins',
        score: 85,
        total: 100,
        percentage: 85,
        passed: true,
        bloomsProfile: 'Apply: 88% · Understand: 82%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Double-free error in destructor for singly linked list.',
      },
    ],
  },
  {
    id: 'stu-aaliyah-khan',
    studentId: 'PRN-2028-CS-1032',
    name: 'Aaliyah Khan',
    email: 'aaliyah.khan@mitwpu.edu.in',
    phone: '+1 (555) 789-0123',
    gender: 'female',
    dob: '2006-01-24',
    college: 'MIT  World Peace University (MIT - WPU)',
    stream: 'Computer Science & Engineering',
    year: '1st Year',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
    overallPerformance: 79,
    completedAssessments: 3,
    strengths: ['Boolean Algebra', 'Control Flow', 'Basic Loops'],
    weaknesses: ['Nested Loop Complexity', 'Array Bounds'],
    learningStreak: 3,
    atomAiTelemetry: {
      totalEvents: 9,
      struggleConcepts: ['Off-by-one errors in nested loop bounds'],
      avgLatencySeconds: 52,
      remediationCount: 3,
      masteryVelocity: 'Freshman Foundation Phase',
      lastIntervention: '4 hours ago on Loop Invariants',
    },
    attemptHistory: [
      {
        id: 'ASM-CS101-MID',
        title: 'CS101 Midterm: Computational Logic & Control Structures',
        course: 'CS101 Intro to Computing',
        date: 'Oct 01, 2026 at 09:30',
        duration: '35 mins',
        score: 79,
        total: 100,
        percentage: 79,
        passed: true,
        bloomsProfile: 'Understand: 85% · Apply: 75%',
        proctorRating: 'Verified Clean · 0 Anomalies',
        mistakesSummary: 'Off-by-one boundary mistake in 2D grid iteration.',
      },
    ],
  },
];

/**
 * Returns the complete live synchronized cohort
 */
export const getEnrolledCohort = (
  userProfile?: UserProfile | null,
  studentProfile?: StudentProfile | null
): StudentCohortRecord[] => {
  // Deep clone initial cohort objects so the constant is never mutated in memory
  const cohort: StudentCohortRecord[] = INITIAL_STUDENT_COHORT.map((s) => ({
    ...s,
    strengths: [...s.strengths],
    weaknesses: [...s.weaknesses],
    atomAiTelemetry: s.atomAiTelemetry ? { ...s.atomAiTelemetry } : undefined,
    attemptHistory: (s.attemptHistory || []).map((a) => ({ ...a })),
  }));

  // Merge any dynamically registered students stored in academic_registered_students
  try {
    const raw = safeGetItem('academic_registered_students', '[]');
    const registered: StudentCohortRecord[] = JSON.parse(raw);
    if (Array.isArray(registered)) {
      registered.forEach((reg) => {
        if (!cohort.some((c) => c.id === reg.id || c.studentId === reg.studentId)) {
          cohort.push({
            ...reg,
            attemptHistory: (reg.attemptHistory || []).map((a) => ({ ...a })),
          });
        }
      });
    }
  } catch {}

  // Read all shared attempts from the central institutional registry
  let sharedAttempts: any[] = [];
  try {
    const rawAttempts = safeGetItem('academic_shared_attempts', '[]');
    const parsed = JSON.parse(rawAttempts);
    if (Array.isArray(parsed)) {
      sharedAttempts = parsed;
    }
  } catch {}

  // If a student is currently logged in, sync their live profile & personal attempts
  if (userProfile && userProfile.role === 'student') {
    const idx = cohort.findIndex(
      (s) => s.id === userProfile.userId || s.studentId === userProfile.studentIdNumber || s.email === userProfile.email
    );

    let personalAttempts: StudentAttemptRecord[] = [];
    try {
      const saved = safeGetItem(`academic_attempts_${userProfile.userId}`, '[]');
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        personalAttempts = parsed.map((att: any) => ({
          id: att.attemptId || `ASM-${Date.now()}`,
          title: att.assessmentTitle || 'Interactive Assessment',
          course: userProfile.stream || 'Computer Science & Engineering',
          date: att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'Recent',
          duration: '25 mins',
          score: att.score ?? 0,
          total: att.questionIds?.length || 10,
          percentage: att.percentage ?? 0,
          passed: att.passed ?? true,
          bloomsProfile: 'Apply: 80% · Analyze: 75%',
          proctorRating: 'Verified Clean · 0 Anomalies',
          mistakesSummary:
            (att.reviewItems || [])
              .filter((r: any) => !r.isCorrect)
              .map((r: any) => r.topic)
              .join(', ') || 'No critical mistakes recorded.',
        }));
      }
    } catch {}

    const updatedRecord: StudentCohortRecord = {
      id: userProfile.userId,
      studentId: userProfile.studentIdNumber || 'PRN-2026-CS-8492',
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '+1 (555) 234-5678',
      gender: userProfile.gender || 'male',
      dob: userProfile.dob || '2004-05-14',
      college: userProfile.college || 'MIT  World Peace University (MIT - WPU)',
      stream: userProfile.stream || 'Computer Science & Engineering',
      year: userProfile.year || '3rd Year',
      avatarUrl: userProfile.avatarUrl || userProfile.profilePhoto,
      overallPerformance:
        studentProfile?.overallPerformance ||
        (personalAttempts.length > 0 ? personalAttempts[0].percentage : idx >= 0 ? cohort[idx].overallPerformance : 85),
      completedAssessments:
        studentProfile?.completedAssessments ||
        (personalAttempts.length > 0 ? personalAttempts.length : idx >= 0 ? cohort[idx].completedAssessments : 1),
      strengths: studentProfile?.strengths || (idx >= 0 ? cohort[idx].strengths : []),
      weaknesses: studentProfile?.weaknesses || (idx >= 0 ? cohort[idx].weaknesses : []),
      learningStreak: studentProfile?.learningStreak || (idx >= 0 ? cohort[idx].learningStreak : 1),
      atomAiTelemetry: {
        totalEvents: personalAttempts.length * 4 + 6,
        struggleConcepts: studentProfile?.weaknesses || [],
        avgLatencySeconds: 38,
        remediationCount: studentProfile?.weaknesses?.length || 0,
        masteryVelocity: studentProfile?.overallPerformance
          ? `${studentProfile.overallPerformance}% Cohort Benchmark`
          : 'Active Telemetry',
        lastIntervention: studentProfile?.weaknesses?.length
          ? `Flagged on ${studentProfile.weaknesses[0]}`
          : 'Telemetry Active',
      },
      attemptHistory: personalAttempts.length > 0 ? personalAttempts : idx >= 0 ? cohort[idx].attemptHistory : [],
    };

    if (idx >= 0) {
      cohort[idx] = updatedRecord;
    } else {
      cohort.unshift(updatedRecord);
    }
  }

  // Cross-role synchronization: merge shared institutional attempts into every cohort student
  if (sharedAttempts.length > 0) {
    cohort.forEach((student) => {
      const studentSharedAttempts = sharedAttempts.filter(
        (att) =>
          att.studentId === student.id ||
          att.studentId === student.studentId ||
          (att.studentId === 'demo_student_alex' && student.id === 'stu-alex-morgan') ||
          (att.studentName && att.studentName.toLowerCase() === student.name.toLowerCase())
      );

      if (studentSharedAttempts.length > 0) {
        const existingAttemptIds = new Set((student.attemptHistory || []).map((a) => a.id));
        const formattedNewAttempts: StudentAttemptRecord[] = [];

        studentSharedAttempts.forEach((att) => {
          const attemptId = att.attemptId || att.id;
          if (attemptId && !existingAttemptIds.has(attemptId)) {
            existingAttemptIds.add(attemptId);
            formattedNewAttempts.push({
              id: attemptId,
              title: att.assessmentTitle || 'CS201 Proctored Examination',
              course: student.stream || 'CS201 Data Structures & Algorithms',
              date: att.submittedAt
                ? new Date(att.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent',
              duration: `${att.durationMinutes || 25} mins`,
              score: att.score ?? Math.round((att.percentage ?? 80) * 0.1),
              total: att.questionIds?.length || 10,
              percentage: att.percentage ?? 80,
              passed: att.passed ?? ((att.percentage ?? 0) >= 70),
              bloomsProfile: 'Apply: 85% · Analyze: 80%',
              proctorRating: att.proctoringViolationsCount > 0 ? 'Flags Detected' : 'Verified Clean · 0 Anomalies',
              mistakesSummary:
                (att.reviewItems || [])
                  .filter((r: any) => !r.isCorrect)
                  .map((r: any) => r.topic)
                  .join(', ') || 'No critical conceptual errors logged.',
            });
          }
        });

        if (formattedNewAttempts.length > 0) {
          student.attemptHistory = [...formattedNewAttempts, ...(student.attemptHistory || [])];
        }
      }

      // Deduplicate attempt history strictly by id
      const seenAttemptIds = new Set<string>();
      const dedupedHistory: StudentAttemptRecord[] = [];
      (student.attemptHistory || []).forEach((att) => {
        if (att && att.id && !seenAttemptIds.has(att.id)) {
          seenAttemptIds.add(att.id);
          dedupedHistory.push(att);
        }
      });
      student.attemptHistory = dedupedHistory;
      student.completedAssessments = dedupedHistory.length;
      if (dedupedHistory.length > 0) {
        const avgScore = Math.round(
          dedupedHistory.reduce((sum, a) => sum + (a.percentage || 0), 0) / dedupedHistory.length
        );
        student.overallPerformance = avgScore;
      }
    });
  }

  return cohort;
};

/**
 * Returns total count of enrolled students in the active institution
 */
export const getEnrolledCohortCount = (): number => {
  try {
    const raw = safeGetItem('academic_registered_students', '[]');
    const registered = JSON.parse(raw);
    const count = INITIAL_STUDENT_COHORT.length + (Array.isArray(registered) ? registered.length : 0);
    return Math.max(count, 6);
  } catch {
    return INITIAL_STUDENT_COHORT.length;
  }
};
