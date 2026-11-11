import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { AuthModal } from './components/auth/AuthModal';
import { AIThemeModal } from './components/settings/AIThemeModal';
import { ThemeSwitcherModal } from './components/common/ThemeSwitcherModal';
import { EmailVerificationBanner } from './components/common/EmailVerificationBanner';
import { AIMonitorProvider, useAIMonitor } from './context/AIMonitorContext';
import { AtomAICoachDock } from './components/common/AtomAICoachDock';
import { RemedialDrillModal } from './components/common/RemedialDrillModal';
import { QuickNotesModal } from './components/common/QuickNotesModal';
import { aiService } from './services/aiService';
import { synthesisManager } from './services/documentSynthesisManager';
import { safeSetItem } from './utils/safeStorage';
import {
  getSynchronizedAssessments,
  saveSynchronizedAssessment,
  getSynchronizedAttempts,
  saveSynchronizedAttempt,
  SEED_CURRICULUM_QUESTIONS,
} from './services/academicDataSync';
import {
  subscribeMaterials,
  saveMaterialToCloud,
  deleteMaterialFromCloud,
  subscribeQuestions,
  saveQuestionToCloud,
  batchSaveQuestionsToCloud,
  deleteQuestionFromCloud,
  subscribeAssessments,
  saveAssessmentToCloud,
  deleteAssessmentFromCloud,
  subscribeAttempts,
  saveAssessmentAttemptToCloud,
  subscribeLearningPlans,
  saveNotificationToCloud,
  deleteNotificationsForAssessment,
} from './services/cloudSyncService';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { MaterialUpload } from './components/teacher/MaterialUpload';
import { GenerateQuestionsModal } from './components/teacher/GenerateQuestionsModal';
import { CreateAssessmentView } from './components/teacher/CreateAssessmentView';
import { QuestionBankView } from './components/teacher/QuestionBankView';
import { TeacherAssessmentsView } from './components/teacher/TeacherAssessmentsView';
import { TeacherCohortView } from './components/teacher/TeacherCohortView';
import { TeacherProfileView } from './components/teacher/TeacherProfileView';
import { TeacherAgentView } from './components/teacher/TeacherAgentView';
import { learningProfileService } from './services/learningProfileService';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentAssessmentsView } from './components/student/StudentAssessmentsView';
import { ExamInterface } from './components/student/ExamInterface';
import { ResultsView } from './components/student/ResultsView';
import { PersonalizedLearningView } from './components/student/PersonalizedLearningView';
import { AITutorView } from './components/student/AITutorView';
import { PracticeQuizView } from './components/student/PracticeQuizView';
import { StudentProfileView } from './components/student/StudentProfileView';
import { InteractiveRoadmapView } from './components/student/roadmaps/InteractiveRoadmapView';
import { MasteredConceptsView } from './components/student/MasteredConceptsView';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProfileView } from './components/admin/AdminProfileView';

// Universal Settings & Community Tabs
import { SettingsView } from './components/settings/SettingsView';
import { CommunityView } from './components/community/CommunityView';

// Animation & Transitions
import { AnimatePresence } from 'motion/react';
import { PageTransition } from './components/animation/AnimationComponents';
import { ThemeRollerCurtain } from './components/theme/ThemeRollerCurtain';

import {
  Material,
  Question,
  Assessment,
  AssessmentAttempt,
  LearningPlan,
  UserProfile,
  QuestionDifficulty,
} from './types';

function MainApp() {
  const { userProfile, studentProfile, updateStudentProfile, role } = useAuth();
  const { showToast } = useToast();
  const { isDark, customAITheme, mode } = useTheme();

  // Start with landing page unless an active session is saved and user hasn't logged out
  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      const isLoggedOut = localStorage.getItem('eval_platform_user_intentionally_logged_out') === 'true';
      const savedSession = localStorage.getItem('eval_platform_session');
      if (!isLoggedOut && savedSession) {
        return 'dashboard';
      }
    } catch {}
    return 'landing';
  });

  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register-student' | 'register-teacher'>('login');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [aiThemeModalOpen, setAiThemeModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [quickNotesTopic, setQuickNotesTopic] = useState<string | null>(null);

  const { state: monitorState, closeRemedialModal, resolveIntervention } = useAIMonitor();

  // Auto-route guards: logged in goes to dashboard; logged out goes to landing page
  React.useEffect(() => {
    if (!userProfile) {
      if (currentView !== 'landing' && currentView !== 'auth' && currentView !== 'login') {
        setCurrentView('landing');
      }
    } else {
      if (currentView === 'auth' || currentView === 'login' || currentView === 'landing') {
        setCurrentView('dashboard');
      }
    }
  }, [userProfile]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      safeSetItem('ai_sidebar_collapsed', String(next));
      return next;
    });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // App-level state: synchronized institutional data across student, teacher, and admin
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const saved = localStorage.getItem(`academic_materials_${userProfile?.userId || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(`academic_questions_${userProfile?.userId || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_CURRICULUM_QUESTIONS;
  });
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    return getSynchronizedAssessments(userProfile?.role, userProfile?.userId);
  });
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>(() => {
    return getSynchronizedAttempts(userProfile?.role, userProfile?.userId);
  });
  const [activeAttempt, setActiveAttempt] = useState<AssessmentAttempt | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);

  // Real-time Cloud Synchronization across Student, Teacher, and Admin
  React.useEffect(() => {
    const unsubMats = subscribeMaterials((mats) => {
      setMaterials(mats);
    });
    const unsubSynthesis = synthesisManager.subscribe((mats) => {
      setMaterials(mats);
    });
    const unsubQuestions = subscribeQuestions((ques) => {
      setQuestions(ques);
    });
    const unsubAssessments = subscribeAssessments((asms) => {
      setAssessments(asms);
    });
    const unsubAttempts = subscribeAttempts((atts) => {
      setAttempts(atts);
    });
    let unsubPlan = () => {};
    if (userProfile?.userId && userProfile?.role === 'student') {
      unsubPlan = subscribeLearningPlans(userProfile.userId, (plan) => {
        if (plan) setLearningPlan(plan);
      });
    }

    return () => {
      unsubMats();
      unsubSynthesis();
      unsubQuestions();
      unsubAssessments();
      unsubAttempts();
      unsubPlan();
    };
  }, [userProfile?.userId, userProfile?.role]);

  // Target assessment during exam
  const [activeExamAssessment, setActiveExamAssessment] = useState<Assessment | null>(null);

  // Context passing for modals
  const [selectedMaterialForGen, setSelectedMaterialForGen] = useState<Material | null>(null);
  const [rosterTargetAsmId, setRosterTargetAsmId] = useState<string | undefined>(undefined);
  const [tutorInitialTopic, setTutorInitialTopic] = useState<string | undefined>(undefined);
  const [practiceInitialTopic, setPracticeInitialTopic] = useState<string | undefined>(undefined);
  const [practiceInitialDifficulty, setPracticeInitialDifficulty] = useState<QuestionDifficulty | undefined>(undefined);
  const [practiceInitialCount, setPracticeInitialCount] = useState<number | undefined>(undefined);
  const [practiceInitialBrief, setPracticeInitialBrief] = useState<string | undefined>(undefined);

  // Registered user accounts registry: starts empty in production until users register
  const allInitialUsers: UserProfile[] = [];

  // Handlers
  const handleAddMaterial = (newMat: Material) => {
    // Sanitize in-memory and persistent record: strip raw base64 binary and preserve comprehensive extracted text
    const cleanMat: Material = {
      ...newMat,
      fileData: undefined,
      extractedText: newMat.extractedText ? newMat.extractedText.slice(0, 150000) : '',
    };
    setMaterials((prev) => [cleanMat, ...prev]);
    saveMaterialToCloud(cleanMat).catch((err) => console.warn('Cloud save material error:', err));

    // Broadcast new study material alert to students ONLY when actually processed
    if (cleanMat.processingStatus === 'processed') {
      saveNotificationToCloud({
        id: `notif-mat-${cleanMat.materialId}-${Date.now()}`,
        title: `Curriculum Update: ${cleanMat.fileName}`,
        time: 'Just now',
        desc: `Course Material • ${cleanMat.structuredConcepts?.length || 0} core concepts synthesized`,
        fullMessage: `New study material "${cleanMat.fileName}" has been synthesized and added to the course repository by ${userProfile?.name || 'faculty'}.`,
        sender: userProfile?.name || 'Faculty',
        type: 'ai',
        unread: true,
        priority: 'normal',
        actionView: 'materials',
        actionLabel: 'Study Material',
        role: 'student',
        userId: 'all',
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterials((prev) => prev.filter((m) => m.materialId !== materialId));
    deleteMaterialFromCloud(materialId).catch((err) => console.warn('Cloud delete material error:', err));
  };

  const handleUpdateMaterial = (updatedMat: Material) => {
    setMaterials((prev) => prev.map((m) => (m.materialId === updatedMat.materialId ? updatedMat : m)));
    saveMaterialToCloud(updatedMat).catch((err) => console.warn('Cloud update material error:', err));

    // Send notification when background synthesis completes
    if (updatedMat.processingStatus === 'processed') {
      saveNotificationToCloud({
        id: `notif-mat-${updatedMat.materialId}-${Date.now()}`,
        title: `Curriculum Update: ${updatedMat.fileName}`,
        time: 'Just now',
        desc: `Course Material • ${updatedMat.structuredConcepts?.length || 0} core concepts synthesized`,
        fullMessage: `New study material "${updatedMat.fileName}" has been synthesized and added to the course repository by ${userProfile?.name || 'faculty'}.`,
        sender: userProfile?.name || 'Faculty',
        type: 'ai',
        unread: true,
        priority: 'normal',
        actionView: 'materials',
        actionLabel: 'Study Material',
        role: 'student',
        userId: 'all',
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }
  };

  const handleAddApprovedQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => [...newQuestions, ...prev]);
    batchSaveQuestionsToCloud(newQuestions).catch((err) => console.warn('Cloud batch save questions error:', err));
  };

  const handleUpdateQuestion = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
    saveQuestionToCloud(updated).catch((err) => console.warn('Cloud update question error:', err));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.questionId !== id));
    deleteQuestionFromCloud(id).catch((err) => console.warn('Cloud delete question error:', err));
  };

  const handleDuplicateQuestion = (q: Question) => {
    const duplicated: Question = {
      ...q,
      questionId: `q-${Date.now()}`,
      questionText: `${q.questionText} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [duplicated, ...prev]);
    saveQuestionToCloud(duplicated).catch((err) => console.warn('Cloud save duplicate question error:', err));
    showToast('Question duplicated as draft', 'info');
  };

  const handleSaveAssessment = (newAsm: Assessment) => {
    saveSynchronizedAssessment(newAsm, userProfile?.userId);
    saveAssessmentToCloud(newAsm).catch((err) => console.warn('Cloud save assessment error:', err));
    setAssessments((prev) => [newAsm, ...prev.filter((a) => a.assessmentId !== newAsm.assessmentId)]);
    setCurrentView('assessments');

    if (newAsm.status === 'draft') {
      showToast('Assessment saved to Drafts in Examinations tab!', 'info');
      return;
    }

    showToast('Assessment published successfully to the student cohort!', 'success');

    // Broadcast new assessment notification to student cohort ONLY if published
    saveNotificationToCloud({
      id: `notif-asm-${newAsm.assessmentId}-${Date.now()}`,
      title: `New Assessment: ${newAsm.title}`,
      time: 'Just now',
      desc: `${newAsm.subject || 'Academic'} • ${newAsm.questionCount || newAsm.questionIds?.length || 0} questions • ${newAsm.durationMinutes} mins`,
      fullMessage: `Assessment "${newAsm.title}" is now available. Complete it to earn proficiency ratings.`,
      sender: userProfile?.name || 'Faculty',
      type: 'exam',
      unread: true,
      priority: 'high',
      actionView: 'assessments',
      actionLabel: 'Take Assessment',
      role: 'student',
      userId: 'all',
      createdAt: new Date().toISOString(),
    }).catch(() => {});
  };

  const handlePublishAssessment = (asm: Assessment) => {
    const published: Assessment = {
      ...asm,
      status: 'published',
    };
    handleSaveAssessment(published);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setAssessments((prev) => prev.filter((a) => a.assessmentId !== assessmentId));
    deleteAssessmentFromCloud(assessmentId).catch((err) => console.warn('Cloud delete assessment error:', err));
    deleteNotificationsForAssessment(assessmentId).catch((err) => console.warn('Delete assessment notifications error:', err));
    showToast('Assessment deleted successfully.', 'info');
  };

  const handleStartExam = (assessment: Assessment) => {
    setActiveExamAssessment(assessment);
    setCurrentView('exam');
  };

  const handleFinishExam = (attempt: AssessmentAttempt) => {
    saveSynchronizedAttempt(attempt, userProfile?.userId || 'student');
    saveAssessmentAttemptToCloud(attempt).catch((err) => console.warn('Cloud save attempt error:', err));
    setAttempts((prev) => [attempt, ...prev.filter((a) => a.attemptId !== attempt.attemptId)]);
    setActiveAttempt(attempt);
    setActiveExamAssessment(null);
    setCurrentView('results');

    const scorePct = attempt.percentage ?? 0;
    // Notify faculty of student exam submission
    saveNotificationToCloud({
      id: `notif-sub-${attempt.attemptId}-${Date.now()}`,
      title: `Exam Submitted: ${attempt.studentName || userProfile?.name || 'Student'}`,
      time: 'Just now',
      desc: `Score: ${attempt.score}/${attempt.questionIds.length} (${scorePct}%) • Assessment: ${attempt.assessmentTitle}`,
      fullMessage: `Student ${attempt.studentName || userProfile?.name || 'Student'} completed and submitted assessment "${attempt.assessmentTitle}" with a score of ${scorePct}%.`,
      sender: attempt.studentName || userProfile?.name || 'Student Cohort',
      type: 'exam',
      unread: true,
      priority: scorePct < 60 ? 'high' : 'normal',
      actionView: 'cohort',
      actionLabel: 'View Student Cohort',
      role: 'teacher',
      userId: 'all',
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    // AI Exam Monitoring & Dynamic Knowledge Profile Updates
    try {
      const incorrectTopics = new Set<string>();
      const strongTopics = new Set<string>();

      (attempt.reviewItems || []).forEach((item) => {
        if (!item.isCorrect && item.topic) {
          incorrectTopics.add(item.topic);
        } else if (item.isCorrect && item.topic) {
          strongTopics.add(item.topic);
        }
      });

      const currentWeak = studentProfile?.weaknesses || [];
      const currentStrong = studentProfile?.strengths || [];

      const updatedWeak = Array.from(new Set([...Array.from(incorrectTopics), ...currentWeak])).filter(
        (t) => !Array.from(strongTopics).includes(t) || incorrectTopics.has(t)
      );
      const updatedStrong = Array.from(new Set([...Array.from(strongTopics), ...currentStrong])).filter(
        (t) => !incorrectTopics.has(t)
      );

      const previousPerf = studentProfile?.overallPerformance || 0;
      const attemptScore = attempt.percentage ?? 0;
      const newOverallPerf = previousPerf > 0 ? Math.round((previousPerf + attemptScore) / 2) : attemptScore;

      updateStudentProfile({
        weaknesses: updatedWeak,
        strengths: updatedStrong,
        overallPerformance: newOverallPerf,
        learningStreak: (studentProfile?.learningStreak || 0) + 1,
      });

      // Synchronize student learning profile matrix for adaptive question selection
      if (attempt.reviewItems && attempt.reviewItems.length > 0) {
        learningProfileService.recordAttemptResults(
          userProfile?.userId || 'student-01',
          attempt.reviewItems.map((r, idx) => ({
            questionId: r.questionId || `q-${idx + 1}`,
            topic: r.topic || attempt.assessmentTitle || 'General',
            difficulty: (r.difficulty as QuestionDifficulty) || 'medium',
            isCorrect: r.isCorrect,
          }))
        );
      }

      showToast(
        `AI Exam Monitor: Knowledge profile & active remediation targets dynamically updated (${attempt.score}/${attempt.questionIds.length})!`,
        'success'
      );
    } catch (err) {
      console.warn('Error updating knowledge profile post-exam:', err);
    }
  };

  const handleGenerateRoadmapFromAI = async (weakTopic: string) => {
    try {
      showToast(`Synthesizing mastery roadmap for "${weakTopic}"...`, 'info');

      const generated = await aiService.generateCustomRoadmap({
        targetGoal: `${weakTopic} Mastery Pathway`,
        skillLevel: 'Beginner',
        weeklyHours: 8,
        targetWeeks: 6,
        additionalContext:
          'Deep and gradual easy-to-hard node progression. Phase 1 must strictly contain foundational and accessible easy nodes. Never jump directly to max level nodes.',
      });

      // Convert RoadmapTrack to DetailedRoadmap with top-to-bottom layout
      const nodes: any[] = [];
      const phases: any[] = [];
      let currentY = 130;
      let stepCount = 1;

      generated.phases.forEach((phase, phaseIdx) => {
        phases.push({
          id: `ai-phase-${phaseIdx + 1}`,
          title: phase.title,
          stepRange: `Phase ${phaseIdx + 1}`,
          description: phase.description || '',
          y: Math.max(50, currentY - 70),
        });

        phase.topics.forEach((topic, topicIdx) => {
          const isMain = topicIdx === 0;
          const nodeX = isMain ? 550 : topicIdx % 2 === 1 ? 210 : 920;
          const nodeY = currentY;

          nodes.push({
            id: topic.id,
            title: topic.title,
            description: topic.description,
            category: topic.category,
            x: nodeX,
            y: nodeY,
            difficulty: topic.difficulty,
            estimatedHours: topic.estimatedHours,
            prerequisites: topic.prerequisites,
            stepNumber: isMain ? stepCount++ : undefined,
            isMainStep: isMain,
            resources: (topic.resources || []).map((r) => ({
              title: r.title,
              url: r.url,
              type: r.type,
              provider: r.provider,
              durationOrReadTime: r.durationOrReadTime,
            })),
          });

          currentY += 210;
        });
        currentY += 80;
      });

      const detailedCustom = {
        id: generated.id,
        title: generated.title,
        slug: generated.id,
        tagline: generated.shortTitle,
        description: generated.description,
        iconName: 'Sparkles',
        badge: 'Easy → Hard',
        difficulty: 'Easy-to-Hard Progression',
        estimatedHours: generated.phases.length * 20,
        estimatedWeeks: generated.estimatedWeeks,
        phases,
        nodes,
        isCustom: true,
      };

      // Save to localStorage safely
      try {
        const savedCustom = localStorage.getItem('custom_detailed_roadmaps_v1');
        let parsed = [];
        if (savedCustom) parsed = JSON.parse(savedCustom);
        parsed.push(detailedCustom);
        safeSetItem('custom_detailed_roadmaps_v1', JSON.stringify(parsed));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      safeSetItem('roadmap_selected_id_v1', detailedCustom.id);

      showToast(`Roadmap for "${weakTopic}" ready! Opening interactive graph...`, 'success');
      setCurrentView('roadmaps');
    } catch (err: any) {
      console.error('Roadmap generation error:', err);
      showToast(err.message || 'Failed to synthesize roadmap with AI', 'error');
    }
  };

  // If in active examination mode (Assessment Lock Mode)
  if (currentView === 'exam' && activeExamAssessment) {
    return (
      <ExamInterface
        assessment={activeExamAssessment}
        allQuestions={questions}
        onFinishExam={handleFinishExam}
        onExit={() => {
          setActiveExamAssessment(null);
          setCurrentView('assessments');
        }}
      />
    );
  }

  return (
    <div
      style={customAITheme ? {
        backgroundColor: customAITheme.bg,
        color: customAITheme.text,
      } : undefined}
      className={`min-h-screen ${
        customAITheme
          ? ''
          : isDark
          ? 'bg-[#07090E] text-[#F8FAFC] dark'
          : 'bg-[#F8FAFC] text-[#0F172A] light'
      } flex flex-col transition-colors font-sans`}
    >
      {/* Global Interactive Pet Whiteboard Roller Theme Transition */}
      <ThemeRollerCurtain />

      {/* Top Bar with Brand Identity and Theme Switcher */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setCurrentView('auth');
        }}
        onOpenAITheme={() => setAiThemeModalOpen(true)}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onOpenGenerateModal={() => setGenerateModalOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <EmailVerificationBanner />

      {/* Dedicated Animated Login & Registration View */}
      {currentView === 'auth' || currentView === 'login' ? (
        <AuthPage
          initialMode={authInitialMode}
          onNavigateHome={() => setCurrentView('landing')}
          onAuthSuccess={(_targetRole) => {
            setCurrentView('dashboard');
          }}
        />
      ) : currentView === 'landing' || (!userProfile && currentView === 'dashboard') ? (
        <LandingPage
          onOpenLogin={() => {
            setAuthInitialMode('login');
            setCurrentView('auth');
          }}
          onOpenStudentRegister={() => {
            setAuthInitialMode('register-student');
            setCurrentView('auth');
          }}
          onOpenTeacherRegister={() => {
            setAuthInitialMode('register-teacher');
            setCurrentView('auth');
          }}
          onNavigateDashboard={() => setCurrentView('dashboard')}
        />
      ) : (
        /* Authenticated Workspace with Sidebar */
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentView={currentView}
            onNavigate={(v) => setCurrentView(v)}
            onOpenThemeModal={() => setThemeModalOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />

          <main
            style={customAITheme ? {
              backgroundColor: customAITheme.bg,
              color: customAITheme.text,
            } : undefined}
            className={`flex-1 ${
              customAITheme
                ? ''
                : isDark
                ? 'bg-[#07090E] text-[#F8FAFC]'
                : 'bg-[#F8FAFC] text-[#0F172A]'
            } overflow-y-auto h-[calc(100vh-4rem)] transition-colors`}
          >
            <AnimatePresence mode="wait">
              <PageTransition key={currentView + '-' + role}>
                {/* Teacher Views */}
            {role === 'teacher' && (
              <>
                {currentView === 'dashboard' && (
                  <TeacherDashboard
                    materials={materials}
                    questions={questions}
                    assessments={assessments}
                    attempts={attempts}
                    onNavigate={(v) => setCurrentView(v)}
                    onViewSubmissions={(asmId) => {
                      setRosterTargetAsmId(asmId);
                      setCurrentView('assessments');
                    }}
                    onOpenGenerateModal={() => {
                      setSelectedMaterialForGen(null);
                      setGenerateModalOpen(true);
                    }}
                  />
                )}

                {currentView === 'materials' && (
                  <MaterialUpload
                    materials={materials}
                    onAddMaterial={handleAddMaterial}
                    onUpdateMaterial={handleUpdateMaterial}
                    onDeleteMaterial={handleDeleteMaterial}
                    onSelectForQuestions={(m) => {
                      setSelectedMaterialForGen(m);
                      setGenerateModalOpen(true);
                    }}
                  />
                )}

                {currentView === 'create-assessment' && (
                  <CreateAssessmentView
                    questions={questions}
                    materials={materials}
                    onSaveAssessment={handleSaveAssessment}
                    onAddQuestion={(newQ) => setQuestions((prev) => [newQ, ...prev])}
                    onCancel={() => setCurrentView('assessments')}
                  />
                )}

                {currentView === 'question-bank' && (
                  <QuestionBankView
                    questions={questions}
                    onUpdateQuestion={handleUpdateQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    onDuplicateQuestion={handleDuplicateQuestion}
                    onOpenGenerateModal={() => setGenerateModalOpen(true)}
                    onAddQuestion={(newQ) => setQuestions((prev) => [newQ, ...prev])}
                  />
                )}

                {currentView === 'assessments' && (
                  <TeacherAssessmentsView
                    assessments={assessments}
                    attempts={attempts}
                    initialAssessmentId={rosterTargetAsmId}
                    onClearInitialAssessmentId={() => setRosterTargetAsmId(undefined)}
                    onCreateNew={() => setCurrentView('create-assessment')}
                    onDeleteAssessment={handleDeleteAssessment}
                    onPublishAssessment={handlePublishAssessment}
                  />
                )}

                {currentView === 'cohort' && (
                  <TeacherCohortView />
                )}

                {currentView === 'teacher-agent' && (
                  <TeacherAgentView />
                )}

                {currentView === 'profile' && (
                  <TeacherProfileView
                    onNavigateCohort={() => setCurrentView('cohort')}
                    onNavigateMaterials={() => setCurrentView('materials')}
                    onNavigateAssessments={() => setCurrentView('assessments')}
                    onNavigateCreateAssessment={() => setCurrentView('create-assessment')}
                  />
                )}
              </>
            )}

            {/* Student Views */}
            {role === 'student' && (
              <>
                {currentView === 'dashboard' && (
                  <StudentDashboard
                    assessments={assessments}
                    attempts={attempts}
                    learningPlan={learningPlan}
                    onNavigate={(v) => setCurrentView(v)}
                    onStartAssessment={handleStartExam}
                  />
                )}

                {currentView === 'assessments' && (
                  <StudentAssessmentsView
                    assessments={assessments}
                    attempts={attempts}
                    onStartExam={handleStartExam}
                  />
                )}

                {currentView === 'results' && (
                  <ResultsView
                    attempt={activeAttempt}
                    onNavigatePlan={(p) => {
                      setLearningPlan(p);
                      setCurrentView('personalized-learning');
                    }}
                    onNavigatePractice={(top) => {
                      setPracticeInitialTopic(top);
                      setCurrentView('practice');
                    }}
                    onRetake={() => {
                      if (activeAttempt) {
                        const targetAsm = assessments.find(
                          (a) => a.assessmentId === activeAttempt.assessmentId
                        );
                        if (targetAsm) handleStartExam(targetAsm);
                      }
                    }}
                    onAskTutor={(concept) => {
                      setTutorInitialTopic(concept);
                      setCurrentView('ai-tutor');
                    }}
                  />
                )}

                {currentView === 'personalized-learning' && (
                  <PersonalizedLearningView
                    learningPlan={learningPlan}
                    studentProfile={studentProfile}
                    materials={materials}
                    onStartPractice={(top) => {
                      setPracticeInitialTopic(top);
                      setCurrentView('practice');
                    }}
                    onAskTutor={(concept) => {
                      setTutorInitialTopic(concept);
                      setCurrentView('ai-tutor');
                    }}
                  />
                )}

                {currentView === 'ai-tutor' && (
                  <AITutorView
                    initialTopic={tutorInitialTopic}
                    materials={materials}
                    assessments={assessments}
                    attempts={attempts}
                    questions={questions}
                    onNavigate={(v) => setCurrentView(v)}
                    onNavigatePractice={(top, options) => {
                      setPracticeInitialTopic(top);
                      if (options?.difficulty) setPracticeInitialDifficulty(options.difficulty);
                      if (options?.count) setPracticeInitialCount(options.count);
                      if (options?.drillBrief) setPracticeInitialBrief(options.drillBrief);
                      setCurrentView('practice');
                    }}
                    onOpenQuickNotes={(top) => setQuickNotesTopic(top)}
                    onStartExam={(asm) => {
                      setActiveExamAssessment(asm);
                      setCurrentView('exam');
                    }}
                  />
                )}

                {currentView === 'practice' && (
                  <PracticeQuizView
                    initialTopic={practiceInitialTopic}
                    initialDifficulty={practiceInitialDifficulty}
                    initialCount={practiceInitialCount}
                    initialBrief={practiceInitialBrief}
                    allQuestions={questions}
                    onCompletedPractice={(top, sc, tot) => {
                      const percentage = Math.round((sc / tot) * 100);
                      const isPass = percentage >= 75;
                      const practiceAttempt: AssessmentAttempt = {
                        attemptId: `practice-att-${Date.now()}`,
                        assessmentId: `practice-${top.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                        assessmentTitle: `Practice Drill: ${top}`,
                        studentId: userProfile?.userId || 'student',
                        studentName: userProfile?.name || 'Student',
                        startedAt: new Date(Date.now() - 300000).toISOString(),
                        submittedAt: new Date().toISOString(),
                        status: 'submitted',
                        score: sc,
                        percentage,
                        passed: isPass,
                        questionIds: Array.from({ length: tot }, (_, i) => `q-${i + 1}`),
                        answers: {},
                        topicBreakdown: { [top]: percentage },
                        difficultyBreakdown: { medium: percentage },
                        proctoringViolationsCount: 0,
                        reviewItems: [
                          {
                            questionId: `q-practice-${top}`,
                            questionText: `Key invariant challenge item for ${top}`,
                            studentAnswer: isPass ? 'Correctly identified core invariant' : 'Subproblem boundary error',
                            correctAnswer: 'Correctly identified core invariant',
                            isCorrect: isPass,
                            explanation: isPass
                              ? `Mastery verified on ${top} with ${percentage}% score.`
                              : `Review invariants on ${top} to avoid state transition errors.`,
                            topic: top,
                            difficulty: 'medium',
                            options: [
                              'Correctly identified core invariant',
                              'Subproblem boundary error',
                              'Off-by-one index traversal',
                              'Unbounded recursive call stack',
                            ],
                          },
                        ],
                      };

                      saveSynchronizedAttempt(practiceAttempt, userProfile?.userId || 'student');
                      saveAssessmentAttemptToCloud(practiceAttempt).catch((err) => console.warn('Cloud save practice attempt error:', err));
                      setAttempts((prev) => [practiceAttempt, ...prev.filter((a) => a.attemptId !== practiceAttempt.attemptId)]);

                      showToast(
                        `Practice completed: ${sc}/${tot} on ${top}. Knowledge profile & attempts updated!`,
                        'success'
                      );
                    }}
                  />
                )}

                {currentView === 'roadmaps' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <InteractiveRoadmapView
                      onNavigatePractice={(top) => {
                        setPracticeInitialTopic(top);
                        setCurrentView('practice');
                      }}
                    />
                  </div>
                )}

                {currentView === 'profile' && (
                  <StudentProfileView onNavigate={(v) => setCurrentView(v)} />
                )}

                {currentView === 'mastered-concepts' && (
                  <MasteredConceptsView
                    attempts={attempts}
                    onBackToDashboard={() => setCurrentView('dashboard')}
                    onLaunchPractice={(top) => {
                      setPracticeInitialTopic(top);
                      setCurrentView('practice');
                    }}
                  />
                )}
              </>
            )}

            {/* Admin Views */}
            {role === 'admin' && (
              <>
                {(currentView === 'dashboard' ||
                  currentView === 'admin-users' ||
                  currentView === 'admin-system') && (
                  <AdminDashboard initialUsers={allInitialUsers} />
                )}

                {currentView === 'profile' && (
                  <AdminProfileView
                    onNavigateUsers={() => setCurrentView('admin-users')}
                    onNavigateSystem={() => setCurrentView('admin-system')}
                  />
                )}
              </>
            )}

            {/* Dedicated Whole Different Tab for Settings across all roles */}
            {currentView === 'settings' && <SettingsView />}

            {/* Dedicated Google Classroom-style Academic Community Tab */}
            {currentView === 'community' && <CommunityView />}
              </PageTransition>
            </AnimatePresence>
          </main>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <GenerateQuestionsModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        materials={materials}
        selectedMaterial={selectedMaterialForGen}
        onAddApprovedQuestions={handleAddApprovedQuestions}
        onSaveAssessment={handleSaveAssessment}
      />

      <AIThemeModal
        isOpen={aiThemeModalOpen}
        onClose={() => setAiThemeModalOpen(false)}
      />

      <ThemeSwitcherModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      {/* Pervasive Atom AI Companion & Active Remedial Drill Host (Hidden when in AI chat view) */}
      {userProfile && currentView !== 'ai-tutor' && currentView !== 'teacher-agent' && (
        <>
          <AtomAICoachDock
            onOpenQuickNotes={(t) => setQuickNotesTopic(t)}
            onGenerateRoadmap={(t) => handleGenerateRoadmapFromAI(t)}
            onNavigate={(v) => setCurrentView(v)}
            onOpenGenerateModal={(targetTopic?: string, targetSubject?: string) => {
              if (targetTopic) {
                const existing = materials.find(
                  (m) =>
                    m.topic?.toLowerCase().includes(targetTopic.toLowerCase()) ||
                    m.fileName?.toLowerCase().includes(targetTopic.toLowerCase())
                );
                if (existing) {
                  setSelectedMaterialForGen(existing);
                } else {
                  const targetedMat: Material = {
                    materialId: `mat-ai-diag-${Date.now()}`,
                    teacherId: userProfile?.userId || 'teacher-01',
                    fileName: `${targetTopic.replace(/[^a-zA-Z0-9]/g, '_')}_Diagnostic.pdf`,
                    fileType: 'pdf',
                    subject: targetSubject || userProfile?.department || 'Computer Science',
                    topic: targetTopic,
                    uploadDate: new Date().toISOString(),
                    processingStatus: 'processed',
                    summary: `Targeted AI cohort diagnostic material addressing misconceptions in ${targetTopic}.`,
                    extractedText: `Comprehensive curriculum focus on ${targetTopic}. Focus on diagnostic assessment of common student misconceptions, core invariants, and edge cases.`,
                  };
                  setSelectedMaterialForGen(targetedMat);
                }
              } else {
                setSelectedMaterialForGen(null);
              }
              setGenerateModalOpen(true);
            }}
            materials={materials}
            questions={questions}
            assessments={assessments}
            attempts={attempts}
          />
          <RemedialDrillModal
            isOpen={monitorState.remedialModalOpen}
            onClose={closeRemedialModal}
            intervention={monitorState.activeIntervention}
            onResolve={resolveIntervention}
          />
        </>
      )}

      {/* Global Quick Notes Modal (Adaptive & Performance Calibrated) */}
      {quickNotesTopic && (
        <QuickNotesModal
          isOpen={!!quickNotesTopic}
          initialTopic={quickNotesTopic}
          autoGenerate={false}
          role={role === 'teacher' ? 'teacher' : 'student'}
          onClose={() => setQuickNotesTopic(null)}
          onStartPractice={(topicToPractice) => {
            setQuickNotesTopic(null);
            setCurrentView('practice');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AIMonitorProvider>
              <MainApp />
            </AIMonitorProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
