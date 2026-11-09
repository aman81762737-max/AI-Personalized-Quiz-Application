# Security Specification: AI Personalized Quiz & Learning Platform

## 1. Data Invariants
1. A user can only write their own user profile on registration with an allowed role ('student' or 'teacher'). Admin status cannot be self-assigned.
2. Students can only read and modify their own `studentProfiles` and `learningPlans`.
3. Teachers can only edit/delete their own `materials`, `questions`, and `assessments`.
4. Students can only read published assessments, create their own `assessmentAttempts`, and update their answers while status is 'in_progress'.
5. Once an `assessmentAttempt` status transitions to 'submitted', it cannot be modified by the student (terminal state locking).
6. Correct answers in questions are protected and evaluated securely; students never see answer keys prior to completion.
7. Proctoring events can be submitted by the student taking the exam for their own attempt.
8. Admins have broad auditing privileges across all collections.

## 2. The Dirty Dozen Adversarial Payloads
1. **Ghost Field Escalation**: Attempting to insert `role: "admin"` or `isAdmin: true` into a user document during update.
2. **Impersonation Attempt**: Creating a student attempt with `studentId: "other_user"`.
3. **Score Tampering**: Student sending `score: 100` and `percentage: 100` directly while answering questions.
4. **Terminal State Bypass**: Updating answers on an attempt whose status is already `'submitted'`.
5. **Question Answer Leakage**: Unauthorized student listing the entire `questions` collection with unsubmitted answer keys.
6. **Cross-Teacher Hijack**: Teacher B attempting to edit or delete teacher A's assessment or material.
7. **Proctoring Frame Injection**: Injecting a fake proctoring alert into another student's attempt.
8. **Malicious ID Poisoning**: Document IDs with 2KB payload or malicious path traversal chars.
9. **Material Overwrite Attack**: A student attempting to overwrite teacher lecture notes or uploaded syllabi.
10. **Notification Interception**: User reading notifications belonging to another user ID.
11. **Negative Score or Out-of-Bound Field**: Submitting string where number is expected, or array exceeding capacity.
12. **Unauthenticated Query Scraping**: Anonymous client attempting to dump entire user directory.
