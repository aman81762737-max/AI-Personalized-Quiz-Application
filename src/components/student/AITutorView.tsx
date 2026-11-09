import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  aiService,
  AskTutorResponse,
  SocraticAssignmentPlan,
  TutorAction,
} from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { Material, Assessment, AssessmentAttempt, Question, QuestionDifficulty } from '../../types';
import { subscribeAIChatSessions, saveAIChatSessionToCloud } from '../../services/cloudSyncService';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Pause,
  Award,
  Layers,
  Check,
  Trash2,
  MessageSquare,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Zap,
  ArrowRight,
  BookmarkCheck,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { STUDENT_AGENT_60_FEATURES, StudentAgentFeature } from '../../types/studentAgentFeatures';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

export interface DrillOptions {
  difficulty?: QuestionDifficulty;
  count?: number;
  drillBrief?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  ragSources?: Array<{ title: string; snippet: string; type?: string }>;
  assignmentPlan?: SocraticAssignmentPlan;
  action?: TutorAction;
  suggestedQuickReplies?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

interface AITutorViewProps {
  initialTopic?: string;
  materials?: Material[];
  assessments?: Assessment[];
  attempts?: AssessmentAttempt[];
  questions?: Question[];
  onNavigate?: (view: string) => void;
  onNavigatePractice?: (topic: string, options?: DrillOptions) => void;
  onOpenQuickNotes?: (topic: string) => void;
  onStartExam?: (assessment: Assessment) => void;
}

const STORAGE_KEY = 'academic_student_chat_sessions_v2';

export const AITutorView: React.FC<AITutorViewProps> = ({
  initialTopic,
  materials = [],
  assessments = [],
  attempts = [],
  questions = [],
  onNavigate,
  onNavigatePractice,
  onOpenQuickNotes,
  onStartExam,
}) => {
  const { userProfile, studentProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const currentTopic = initialTopic || 'Data Structures & Algorithms';

  // Multi-session chat history state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed loading chat sessions from storage:', e);
    }

    const initialId = `session-${Date.now()}`;
    return [
      {
        id: initialId,
        title: 'Academic Consultation & Practice',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: `msg-init-${Date.now()}`,
            sender: 'tutor',
            text: `Hello **${userProfile?.name?.split(' ')[0] || 'Scholar'}**! I am your **Socratic RAG Academic Tutor**, grounded directly in your actual coursework and performance telemetry.

### 🌟 What I Can Do For You:
• **Performance-Grounded Guidance**: I analyze your actual assessment scores, error patterns, and cognitive Bloom benchmarks to guide your mastery.
• **Socratic Assignment Planning**: If you bring an assignment, I will **plan it first**—deconstructing prerequisites, base cases, and sub-problems rather than giving raw answers.
• **App-Wide Execution**: Launch adaptive drills, start focus sprint timers, save quick notes, or inspect oral defense rubrics.
• **60 Student Agent Workflows**: Access 60 specialized learning agents across planning, assignments, conceptual drills, test prep, and wellness.

What problem, invariant, or assignment roadmap shall we tackle today?`,
            timestamp: 'Just now',
            ragSources: [
              {
                title: `CS201 Syllabus: ${initialTopic || 'Data Structures & Algorithms'}`,
                snippet: 'Core algorithmic invariants, asymptotic worst-case bounds, and recurrence proofs.',
                type: 'Curriculum Core',
              },
            ],
            suggestedQuickReplies: [
              'Analyze my academic performance & weak concepts',
              'Plan my assignment on Dynamic Programming',
              'Launch a 5-question drill on Tree Traversal',
              'Inspect Oral Viva Defense Rubric',
            ],
          },
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || `session-${Date.now()}`);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // Active session helper
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages || [];

  // Real-time Cloud Sessions Sync
  useEffect(() => {
    if (!userProfile?.userId) return;
    const unsub = subscribeAIChatSessions(userProfile.userId, 'student', (remote) => {
      if (Array.isArray(remote) && remote.length > 0) {
        setSessions(remote);
      }
    });
    return () => unsub();
  }, [userProfile?.userId]);

  // Save sessions to localStorage & Cloud
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      if (userProfile?.userId && activeSession) {
        saveAIChatSessionToCloud({
          ...activeSession,
          userId: userProfile.userId,
          role: 'student',
        });
      }
    } catch (e) {
      console.warn('Error saving chat sessions:', e);
    }
  }, [sessions, activeSession, userProfile?.userId]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agenticPhase, setAgenticPhase] = useState<number>(1);

  // In-Chat Focus Sprint Timer State
  const [activeSprint, setActiveSprint] = useState<{
    task: string;
    totalSeconds: number;
    secondsLeft: number;
    isRunning: boolean;
  } | null>(null);

  // Checked items in Socratic Assignment Plans
  const [checkedPlanItems, setCheckedPlanItems] = useState<Record<string, Set<number>>>({});

  // Active Viva Rubric modal
  const [activeRubricModal, setActiveRubricModal] = useState<boolean>(false);

  // 60-Agent Capabilities Hub state
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState<boolean>(false);
  const [capabilitySearch, setCapabilitySearch] = useState<string>('');
  const [selectedCapCategory, setSelectedCapCategory] = useState<string>('all');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, agenticPhase]);

  // Focus Timer interval ticker
  useEffect(() => {
    let interval: any = null;
    if (activeSprint && activeSprint.isRunning && activeSprint.secondsLeft > 0) {
      interval = setInterval(() => {
        setActiveSprint((prev) => {
          if (!prev) return null;
          if (prev.secondsLeft <= 1) {
            showToast(`Focus Sprint Completed: "${prev.task}"! Great deep work!`, 'success');
            return { ...prev, secondsLeft: 0, isRunning: false };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSprint?.isRunning, activeSprint?.secondsLeft]);

  // Compute student performance telemetry
  const studentPerformanceMetrics = useMemo(() => {
    let totalScore = 0;
    let totalMax = 0;
    const topicMistakes: Record<string, number> = {};
    const recentMistakesList: any[] = [];

    attempts.forEach((att) => {
      totalScore += att.score || 0;
      totalMax += (att as any).totalQuestions || att.questionIds?.length || 10;
      att.reviewItems?.forEach((item) => {
        if (!item.isCorrect) {
          topicMistakes[item.topic] = (topicMistakes[item.topic] || 0) + 1;
          if (recentMistakesList.length < 6) {
            recentMistakesList.push({
              topic: item.topic,
              questionText: item.questionText,
              studentAnswer: item.studentAnswer,
              correctAnswer: item.correctAnswer,
            });
          }
        }
      });
    });

    const calculatedAvg = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : (studentProfile?.overallPerformance || 0);
    const sortedStruggles = Object.entries(topicMistakes).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    const weakTopics = sortedStruggles.length > 0 ? sortedStruggles : (studentProfile?.weaknesses || []);

    return {
      overallPercentage: calculatedAvg,
      totalAttempts: attempts.length,
      weakTopics,
      recentMistakesList,
      strengths: studentProfile?.strengths || [],
    };
  }, [attempts, studentProfile]);

  // Create a new session
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Socratic Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'tutor',
          text: `Started a fresh conversation. How can I assist you with your studies or assignments?`,
          timestamp: 'Just now',
          suggestedQuickReplies: [
            'Analyze my recent mistakes & scores',
            'Plan my Dynamic Programming assignment',
            'Launch a 5-question practice drill',
          ],
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setShowHistoryDrawer(false);
    showToast('New chat created', 'info');
  };

  // Delete a session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      showToast('Cannot delete the only chat session', 'error');
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setActiveSessionId(remaining[0]?.id || '');
    }
    showToast('Chat session deleted', 'info');
  };

  // Switch session
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowHistoryDrawer(false);
  };

  // Execute in-app actions dispatched by the Socratic Tutor
  const handleExecuteAction = (action: TutorAction) => {
    if (action.type === 'navigate' && action.payload?.targetView) {
      if (onNavigate) {
        onNavigate(action.payload.targetView);
        showToast(`Navigated to ${action.payload.targetView}`, 'info');
      }
    } else if (action.type === 'start_practice') {
      const targetTopic = action.payload?.topic || currentTopic;
      const drillOptions: DrillOptions = {
        difficulty: (action.payload?.difficulty?.toLowerCase() as QuestionDifficulty) || 'medium',
        count: action.payload?.count || 5,
        drillBrief: action.payload?.drillBrief || action.payload?.pedagogicalBrief || '',
      };
      if (onNavigatePractice) {
        onNavigatePractice(targetTopic, drillOptions);
        showToast(`Launching adaptive drill on ${targetTopic}...`, 'success');
      } else if (onNavigate) {
        onNavigate('practice');
      }
    } else if (action.type === 'add_note') {
      try {
        const historyKey = 'ai_quick_notes_history';
        const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const newEntry = {
          id: `note-${Date.now()}`,
          topic: action.payload?.topic || currentTopic,
          savedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          notes: {
            topic: action.payload?.topic || currentTopic,
            subject: 'Computer Science',
            keyInvariants: [action.payload?.content || 'Key concept saved from Socratic AI Tutor.'],
            commonTraps: ['Confusing average case with worst case.'],
            flashcards: [
              {
                front: action.payload?.title || 'Core Theorem',
                back: action.payload?.content || 'Verified by Socratic Tutor.',
              },
            ],
            lastMinuteChecklist: ['Verify base case', 'Audit bounds'],
          },
        };
        localStorage.setItem(historyKey, JSON.stringify([newEntry, ...existing]));
        showToast(`Saved "${action.payload?.title || 'Note'}" to Quick Notes deck!`, 'success');
      } catch {
        showToast('Saved to quick notes!', 'success');
      }
    } else if (action.type === 'start_timer') {
      const mins = Number(action.payload?.durationMinutes) || 25;
      setActiveSprint({
        task: action.payload?.task || `Deep Work on ${currentTopic}`,
        totalSeconds: mins * 60,
        secondsLeft: mins * 60,
        isRunning: true,
      });
      showToast(`Started ${mins}-minute Focus Sprint!`, 'success');
    } else if (action.type === 'inspect_viva_rubric') {
      setActiveRubricModal(true);
    }
  };

  // Toggle Socratic plan checklist item
  const handleTogglePlanItem = (planId: string, itemIdx: number) => {
    setCheckedPlanItems((prev) => {
      const set = new Set(prev[planId] || []);
      if (set.has(itemIdx)) set.delete(itemIdx);
      else set.add(itemIdx);
      return { ...prev, [planId]: set };
    });
  };

  // Send message
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update session title if first user message
    const isFirstUserMessage = activeSession.messages.filter((m) => m.sender === 'user').length === 0;
    const newTitle = isFirstUserMessage
      ? textToSend.slice(0, 32).trim() + (textToSend.length > 32 ? '...' : '')
      : activeSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInput('');
    setLoading(true);
    setAgenticPhase(1);

    // Multi-phase animation ticker
    const phase2Timer = setTimeout(() => setAgenticPhase(2), 500);
    const phase3Timer = setTimeout(() => setAgenticPhase(3), 1100);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({ sender: m.sender, text: m.text }));

      // Materials context
      const materialsContext = materials.slice(0, 4).map((m) => ({
        title: m.fileName || m.topic,
        topic: m.topic,
        summary: m.summary || m.extractedText?.slice(0, 300),
        extractedText: m.extractedText?.slice(0, 600),
      }));

      // Performance context injected into tutor
      const attemptContext = {
        overallPerformance: studentPerformanceMetrics.overallPercentage,
        completedAssessments: studentPerformanceMetrics.totalAttempts,
        weaknesses: studentPerformanceMetrics.weakTopics,
        strengths: studentPerformanceMetrics.strengths,
        recentMistakes: studentPerformanceMetrics.recentMistakesList,
      };

      const studentContext = `Student: ${userProfile?.name || 'Alex Morgan'} (${userProfile?.college || 'University'}, ${userProfile?.stream || 'Computer Science'}), Overall Accuracy: ${studentPerformanceMetrics.overallPercentage}%, Known Struggle Topics: ${studentPerformanceMetrics.weakTopics.join(', ')}`;

      const res: AskTutorResponse = await aiService.askTutorRich({
        message: textToSend,
        history: historyPayload,
        currentTopic,
        studentContext,
        materialsContext,
        attemptContext,
      });

      const tutorMsg: ChatMessage = {
        id: `msg-tutor-${Date.now()}`,
        sender: 'tutor',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ragSources: res.ragSources,
        assignmentPlan: res.assignmentPlan,
        action: res.action,
        suggestedQuickReplies: res.suggestedQuickReplies,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, tutorMsg],
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      showToast(err.message || 'Tutor response failed', 'error');
    } finally {
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      setLoading(false);
    }
  };

  // Filtered capabilities
  const filteredCapabilities = useMemo(() => {
    return STUDENT_AGENT_60_FEATURES.filter((feat) => {
      const matchesCat = selectedCapCategory === 'all' || feat.category === selectedCapCategory;
      const matchesSearch =
        feat.name.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
        feat.description.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
        feat.promptTemplate.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
        String(feat.id).includes(capabilitySearch);
      return matchesCat && matchesSearch;
    });
  }, [selectedCapCategory, capabilitySearch]);

  const filteredSessions = useMemo(() => {
    if (!historySearchQuery.trim()) return sessions;
    const q = historySearchQuery.toLowerCase();
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [sessions, historySearchQuery]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#07090E] text-slate-100 font-sans relative">
      {/* Top Header Bar: Clean ChatGPT Style */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/[0.08] bg-[#07090E]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Arrow / Dropdown Button for Previous Chats */}
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer group"
            title="View Previous Chats"
          >
            <span className="font-mono text-[#00F0FF] group-hover:scale-110 transition-transform">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showHistoryDrawer ? 'rotate-180' : ''}`} />
            </span>
            <span className="truncate max-w-[200px] sm:max-w-[320px] font-bold">
              {activeSession.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ({sessions.length})
            </span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00F0FF]/15 hover:border-[#00F0FF]/40 text-slate-300 hover:text-[#00F0FF] transition-all cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right Header Status & Capabilities Pill */}
        <div className="flex items-center gap-2.5">
          {activeSprint && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>
                {Math.floor(activeSprint.secondsLeft / 60)}:
                {String(activeSprint.secondsLeft % 60).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveSprint((prev) => (prev ? { ...prev, isRunning: !prev.isRunning } : null))
                }
                className="hover:text-white cursor-pointer"
              >
                {activeSprint.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          )}

          {/* 60 Capabilities Hub trigger */}
          <button
            type="button"
            onClick={() => setShowCapabilitiesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">60 Student Agents</span>
            <span className="sm:hidden">60 Agents</span>
          </button>
        </div>
      </header>

      {/* Slide-over / Dropdown Drawer for Previous Chats */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[57px] left-4 sm:left-8 z-40 w-80 sm:w-96 rounded-2xl border border-white/15 bg-[#0C101A] shadow-2xl backdrop-blur-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
                <span>Chat History</span>
              </div>
              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1 text-[11px] font-mono text-[#00F0FF] hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> New Chat
              </button>
            </div>

            {/* Search Input for previous chats */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search past conversations..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00F0FF]"
              />
            </div>

            {/* Sessions List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {filteredSessions.map((session, sIdx) => (
                <div
                  key={`${session.id || 'sess'}-${sIdx}`}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                    session.id === activeSessionId
                      ? 'bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-white'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shrink-0" />
                    <span className="truncate font-medium">{session.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 rounded transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredSessions.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No chats match your search.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main ChatGPT-Style Chat Area (Full Bleed, No Box Border) */}
      <main className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
        {messages.map((m, mIdx) => (
          <div key={`${m.id || 'msg'}-${mIdx}`} className="space-y-3">
            <div className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Tutor Avatar */}
              {m.sender === 'tutor' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600/30 to-[#00F0FF]/30 border border-purple-500/40 text-[#00F0FF] flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                  <Bot className="w-4 h-4 text-[#00F0FF]" />
                </div>
              )}

              <div className="max-w-2xl w-full space-y-3">
                {/* Message Content */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-colors ${
                    m.sender === 'user'
                      ? 'bg-[#00F0FF]/15 text-white border border-[#00F0FF]/30 ml-auto max-w-[85%]'
                      : 'bg-white/[0.03] text-slate-200 border border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 text-[10px] font-mono">
                    <span
                      className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        m.sender === 'user' ? 'text-[#00F0FF]' : 'text-purple-400'
                      }`}
                    >
                      {m.sender === 'user' ? 'Student' : 'Socratic Academic Tutor'}
                    </span>
                    <span className="text-slate-400 tabular-nums">{m.timestamp}</span>
                  </div>

                  {/* Markdown Renderer: Handles Bold, Tables, Lists, and ASCII */}
                  <MarkdownRenderer content={m.text} />

                  {/* Curriculum RAG Grounding Sources */}
                  {m.ragSources && m.ragSources.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5">
                      <div className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#00F0FF]" />
                        <span>Curriculum Grounding Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.ragSources.map((source, sIdx) => (
                          <div
                            key={sIdx}
                            className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1.5"
                          >
                            <span className="text-[#00F0FF]">§</span>
                            <strong className="text-white">{source.title}</strong>
                            <span className="text-slate-400 truncate max-w-[200px]">({source.snippet.slice(0, 60)}...)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Socratic Assignment Scaffolding Plan Card */}
                {m.assignmentPlan && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#0B0F19] to-black/80 border border-purple-500/50 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-white">
                            {m.assignmentPlan.title}
                          </h4>
                          <p className="text-[10px] text-purple-300 font-sans">
                            {m.assignmentPlan.objective}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                        PLANNED FIRST
                      </span>
                    </div>

                    {/* Prerequisites */}
                    {m.assignmentPlan.prerequisites.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          Prerequisites & Invariants:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.assignmentPlan.prerequisites.map((req, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                            >
                              ✓ {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Phases Breakdown */}
                    <div className="space-y-2.5 pt-1">
                      <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
                        Multi-Phase Socratic Decomposition:
                      </span>
                      <div className="space-y-2">
                        {m.assignmentPlan.phases.map((phase) => (
                          <div
                            key={phase.phaseNumber}
                            className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-mono text-xs font-bold text-white">
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center text-[10px]">
                                  {phase.phaseNumber}
                                </span>
                                <span>{phase.title}</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                              {phase.objective}
                            </p>
                            <div className="p-2.5 rounded-xl bg-purple-900/20 border border-purple-500/30 text-[10px] font-mono text-purple-300 flex items-start gap-2">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-white">Socratic Guiding Hint: </span>
                                <span>{phase.socraticHint}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Probing Inquiry */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF]/15 to-purple-600/15 border border-[#00F0FF]/40 space-y-2">
                      <div className="text-[10px] font-mono font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>Phase 1 Probing Inquiry:</span>
                      </div>
                      <p className="text-xs text-white font-medium">
                        {m.assignmentPlan.firstProbingQuestion}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSend('Here is my answer to Phase 1: the base case is when n=0 returning 0.')}
                        className="px-3 py-1.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold font-mono text-[10px] transition-all cursor-pointer active:scale-95"
                      >
                        Submit Phase 1 Step Verification →
                      </button>
                    </div>

                    {/* Checklist */}
                    {m.assignmentPlan.reflectionChecklist && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          Self-Verification Checklist:
                        </span>
                        <div className="space-y-1">
                          {m.assignmentPlan.reflectionChecklist.map((checkText, cIdx) => {
                            const isChecked = checkedPlanItems[m.id]?.has(cIdx);
                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => handleTogglePlanItem(m.id, cIdx)}
                                className={`w-full p-2 rounded-xl text-left text-[11px] font-mono flex items-center gap-2 border transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                  isChecked ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/20'
                                }`}>
                                  {isChecked && <Check className="w-3 h-3 text-black stroke-[3]" />}
                                </div>
                                <span className={isChecked ? 'line-through opacity-80' : ''}>
                                  {checkText}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* App-Wide Action Card Execution */}
                {m.action && (
                  <div className="p-4 rounded-2xl bg-[#0F1424] border border-[#00F0FF]/40 text-xs space-y-2.5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>Cockpit Action Ready</span>
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {m.action.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white font-mono text-xs">
                          {m.action.label}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {m.action.type === 'navigate' && `Switches active viewport to ${m.action.payload?.targetView}`}
                          {m.action.type === 'start_practice' && `Calibrated on: ${m.action.payload?.topic || currentTopic} (${m.action.payload?.count || 5} questions, ${m.action.payload?.difficulty || 'Medium'})`}
                          {m.action.type === 'add_note' && `Saves study card into your Quick Notes history.`}
                          {m.action.type === 'start_timer' && `Engages 25-minute Pomodoro focus session.`}
                          {m.action.type === 'inspect_viva_rubric' && `Opens university oral exam evaluation criteria.`}
                        </div>
                        {m.action.type === 'start_practice' && m.action.payload?.drillBrief && (
                          <div className="mt-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[10px] text-purple-200 font-sans leading-relaxed flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-purple-300 font-mono">Pedagogical Directive for Drill Maker: </span>
                              <span>{m.action.payload.drillBrief}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteAction(m.action!)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-purple-600 hover:from-[#38bdf8] hover:to-purple-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0 cursor-pointer active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Execute Action</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Quick Replies */}
                {m.suggestedQuickReplies && m.suggestedQuickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggestedQuickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        onClick={() => handleSend(reply)}
                        className="text-[11px] px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      >
                        → {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  <User className="w-4 h-4 text-[#00F0FF]" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Real Animated Loading Agentic AI Pipeline Trace */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600/30 to-[#00F0FF]/30 border border-purple-500/40 text-[#00F0FF] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
              <Bot className="w-4 h-4 text-[#00F0FF] animate-pulse" />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 max-w-lg space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-purple-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" />
                  AGENTIC PEDAGOGICAL PIPELINE
                </span>
                <span className="text-[#00F0FF]">Step {agenticPhase} of 3</span>
              </div>

              {/* Animated Step 1 */}
              <div className={`flex items-center gap-2 text-xs font-mono transition-opacity ${agenticPhase >= 1 ? 'opacity-100 text-white' : 'opacity-40'}`}>
                <span className={`w-2 h-2 rounded-full ${agenticPhase > 1 ? 'bg-emerald-400' : 'bg-[#00F0FF] animate-ping'}`} />
                <span>1. Retrieving student performance telemetry & attempt records ({studentPerformanceMetrics.overallPercentage}% avg)...</span>
              </div>

              {/* Animated Step 2 */}
              <div className={`flex items-center gap-2 text-xs font-mono transition-opacity ${agenticPhase >= 2 ? 'opacity-100 text-white' : 'opacity-40'}`}>
                <span className={`w-2 h-2 rounded-full ${agenticPhase > 2 ? 'bg-emerald-400' : agenticPhase === 2 ? 'bg-[#00F0FF] animate-ping' : 'bg-slate-600'}`} />
                <span>2. Calibrating Bloom cognitive topology & struggle concepts ({studentPerformanceMetrics.weakTopics.slice(0, 2).join(', ')})...</span>
              </div>

              {/* Animated Step 3 */}
              <div className={`flex items-center gap-2 text-xs font-mono transition-opacity ${agenticPhase >= 3 ? 'opacity-100 text-white' : 'opacity-40'}`}>
                <span className={`w-2 h-2 rounded-full ${agenticPhase === 3 ? 'bg-[#00F0FF] animate-ping' : 'bg-slate-600'}`} />
                <span>3. Synthesizing pedagogical intervention & ASCII structured proof...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatBottomRef} />
      </main>

      {/* Floating Centered Input Bar (ChatGPT Style) */}
      <footer className="sticky bottom-0 z-30 px-4 sm:px-6 py-4 bg-gradient-to-t from-[#07090E] via-[#07090E]/95 to-transparent">
        <div className="max-w-3xl mx-auto space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center rounded-2xl border border-white/15 bg-[#0C101A] shadow-2xl focus-within:border-[#00F0FF] transition-all p-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything, plan an assignment, or ask how your performance is doing..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent text-white placeholder-slate-400 focus:outline-hidden font-sans"
            />

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCapabilitiesModal(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#00F0FF] hover:bg-white/5 transition-colors cursor-pointer"
                title="60 Student Agent Workflows"
              >
                <Zap className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold disabled:opacity-30 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2">
            <span>Grounding: {materials.length} uploaded materials · Performance: {studentPerformanceMetrics.overallPercentage}% accuracy</span>
            <span className="text-[#00F0FF]">Socratic Mode Active</span>
          </div>
        </div>
      </footer>

      {/* 60 Capabilities Full Modal */}
      {showCapabilitiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl p-6 rounded-3xl bg-[#0B0F19] border border-[#00F0FF]/30 text-white shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#00F0FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    60 Autonomous Student Capabilities Hub
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any capability to trigger its dedicated pedagogical workflow.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCapabilitiesModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search capabilities (e.g. study planner, grade trend, mock exam, pomodoro)..."
                  value={capabilitySearch}
                  onChange={(e) => setCapabilitySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00F0FF]"
                />
              </div>

              <select
                value={selectedCapCategory}
                onChange={(e) => setSelectedCapCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-hidden focus:border-[#00F0FF]"
              >
                <option value="all">All 6 Categories</option>
                <option value="learning_management">A. Learning Management (1–10)</option>
                <option value="assignments_projects">B. Assignments & Projects (11–20)</option>
                <option value="concept_mastery">C. Conceptual Learning & Retention (21–30)</option>
                <option value="exam_preparation">D. Test & Exam Readiness (31–40)</option>
                <option value="academic_growth">E. Analytics & Academic Strategy (41–50)</option>
                <option value="collaboration_wellness">F. Collaboration & Habit (51–60)</option>
              </select>
            </div>

            {/* Capabilities Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
              {filteredCapabilities.map((feat, fIdx) => (
                <div
                  key={`${feat.id || 'feat'}-${fIdx}`}
                  onClick={() => {
                    setShowCapabilitiesModal(false);
                    handleSend(feat.promptTemplate);
                  }}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/5 transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00F0FF]/20 text-[#00F0FF] font-bold">
                      #{feat.id} {feat.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{feat.categoryLabel}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                    {feat.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Oral Viva Defense Rubric Modal */}
      {activeRubricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl p-6 rounded-3xl bg-[#0B0F19] border border-purple-500/50 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    Oral Examination & Technical Viva Voce Rubric
                  </h3>
                  <p className="text-xs text-slate-400">
                    Faculty evaluation dimensions and scoring criteria for technical defense.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveRubricModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>Dimension 1: Invariant Proof & Mathematical Rigor (35%)</span>
                  <span>Exemplary: 9-10 pts</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Proves base cases and state induction without skipping algebraic steps. Explicitly derives Big-O worst-case vs average-case complexities.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[#00F0FF] font-bold">
                  <span>Dimension 2: Edge Case Defensibility (30%)</span>
                  <span>Exemplary: 9-10 pts</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Immediately accounts for degenerate inputs: empty sets, cyclic dependencies, duplicate keys, and memory recursion depth bounds.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Dimension 3: Technical Articulation & Defense (35%)</span>
                  <span>Exemplary: 9-10 pts</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Responds to counter-probing questions with composure. Justifies algorithmic trade-offs (e.g. space vs time complexity) calmly and systematically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
