# Data Sync Audit Implementation & Architecture

## Overview
All models identified in the Data Sync Audit have been connected to real-time, durable Cloud Firestore synchronization paired with immediate-read localStorage caching for instantaneous applet boot and resilient offline operation.

## Synchronized Academic Datasets

1. **Teacher and Student Materials (`/materials/{materialId}`)**
   - Strips heavy raw base64 data to avoid quota issues; synchronizes title, extracted concepts, summaries, and URLs in real-time across devices.
   - Handled via `subscribeMaterials`, `saveMaterialToCloud`, `deleteMaterialFromCloud`.

2. **Question Bank & Generated Questions (`/questions/{questionId}`)**
   - Full question schema (type, text, options, answer key, explanation, difficulty, subject, bloom taxonomy) synchronized across teacher views and student practice sessions.
   - Handled via `subscribeQuestions`, `saveQuestionToCloud`, `batchSaveQuestionsToCloud`, `deleteQuestionFromCloud`.

3. **Assessments (`/assessments/{assessmentId}`)**
   - Published exams, duration, passing score, question assignments, and randomized settings shared instantly across teacher dashboards and the student cohort.
   - Handled via `subscribeAssessments`, `saveAssessmentToCloud`, `deleteAssessmentFromCloud`.

4. **Assessment Attempts (`/assessmentAttempts/{attemptId}`)**
   - Canonical single-source-of-truth collection for exam submissions and practice drills with full review breakdowns, per-question student answers, and cognitive scoring.
   - Handled via `subscribeAttempts`, `saveAssessmentAttemptToCloud`.

5. **In-Progress Exam State (`/inProgressExams/{attemptId}`)**
   - 5-second periodic autosave of student answers, current question index, remaining time, and flagged items to Firestore and local storage.
   - Automatic session restore on refresh or reconnection; cleaned up upon final submission.
   - Handled via `saveInProgressExamState`, `loadInProgressExamState`, `clearInProgressExamState`.

6. **Notifications & Read State (`/notifications/{notificationId}`)**
   - Scoped by `userId` or cohort; supports real-time read, toggle, dismiss, and clear operations synced directly with the top navigation center.
   - Handled via `subscribeNotifications`, `markNotificationReadInCloud`, `toggleNotificationReadInCloud`, `deleteNotificationFromCloud`, `clearAllNotificationsFromCloud`.

7. **Timetables (`/timetables/{userId}`)**
   - Academic schedules and period slots persisted to cloud and updated in real-time across the calendar and agenda views.
   - Handled via `subscribeTimetable`, `saveTimetableToCloud`.

8. **Custom Detailed Roadmaps & Progress (`/customRoadmaps`, `/roadmapProgress/{userId}`)**
   - AI-generated Unity-style interactive shader graph roadmaps saved to cloud.
   - Per-node completion states (`not_started`, `in_progress`, `completed`) tracked per student.
   - Handled via `subscribeCustomRoadmaps`, `saveCustomRoadmapToCloud`, `subscribeRoadmapProgress`, `saveRoadmapProgressToCloud`.

9. **AI Conversation Sessions (`/aiChatSessions/{sessionId}`)**
   - Socratic Student Tutor chats and Teacher 60-Agent session histories backed by Firestore queries partitioned by `userId` and `role`.
   - Handled via `subscribeAIChatSessions`, `saveAIChatSessionToCloud`.

10. **Quick Notes & Study Plan Milestones (`/quickNotes`, `/planMilestones/{userId}`)**
    - Chapter summaries, tips, formulas, and 10-question practice notes saved to cloud history.
    - Learning plan sequence milestones synced in real-time with the student progress matrix.
    - Handled via `subscribeQuickNotes`, `saveQuickNoteToCloud`, `subscribePlanMilestones`, `savePlanMilestonesToCloud`.

## Security Rules Deployment
- Deployed comprehensive `firestore.rules` granting authorized access for academic records, assessments, in-progress states, chat sessions, and profile records.
