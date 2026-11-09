import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Send,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Code2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Bot,
  User as UserIcon,
  HelpCircle,
  Clock,
  LayoutDashboard,
  Check,
  Brain,
  ListTodo,
  Award,
  Calculator,
  Terminal,
  FileCode,
  Sliders,
  Copy,
  Download,
  Eye,
  Maximize2,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { CustomCockpitTab } from '../../types';
import { aiService } from '../../services/aiService';
import { AITimetableManager } from './AITimetableManager';
import { DynamicToolPreview } from './DynamicToolPreview';
import { StudioPlayground } from './StudioPlayground';
import { GetCodeModal } from './GetCodeModal';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedQuickReplies?: string[];
  tabMeta?: {
    label: string;
    icon: string;
    viewType: 'timetable' | 'dynamic_tool';
    description: string;
  };
}

export interface StudioTabSession {
  tabId: string;
  label: string;
  icon: string;
  viewType: 'timetable' | 'dynamic_tool';
  description: string;
  messages: Message[];
  previewData: any;
  readyToMount: boolean;
  createdAt: number;
  lastUpdated: number;
}

interface AIWorkflowStudioProps {
  onNavigate?: (view: string) => void;
}

// Initial default sessions for student/teacher workspaces
const getDefaultSessions = (userName: string): StudioTabSession[] => [
  {
    tabId: 'tab-math-quiz',
    label: 'Math Quiz Studio',
    icon: 'HelpCircle',
    viewType: 'dynamic_tool',
    description: 'Whiteboard mathematics drill with human-friendly step-by-step explanations',
    previewData: {
      toolType: 'quiz',
      title: 'Plain-English Mathematics & Calculus Drill',
      description: 'Clean whiteboard problem set with plain-English step-by-step walkthroughs.',
      questions: [
        {
          id: 'q1',
          question: 'Find the limit value as x approaches 0:\n\n   lim (x → 0)  [ sin(5x) / (2x) ]\n\n(What does this fraction settle to as x gets closer and closer to 0?)',
          options: ['5 / 2  (or 2.5)', '0', '1', '2 / 5  (or 0.4)'],
          correctAnswer: '5 / 2  (or 2.5)',
          explanation: '💡 Whiteboard Walkthrough:\n• Step 1: Standard Trigonometry Rule: When angle θ gets close to 0, sin(θ) / θ approaches 1.\n• Step 2: Separate the numbers: Notice the 5 inside sine and 2 in the denominator. Rewrite as (5/2) × [ sin(5x) / 5x ].\n• Step 3: Solve: Since [ sin(5x) / 5x ] becomes 1, the limit is: (5/2) × 1 = 5/2 (or 2.5).',
          topic: 'Trigonometric Limits',
        },
        {
          id: 'q2',
          question: 'Find the rate of change (derivative) of:\n\n   f(x) = x³ · e^(2x)\n\n(Rule: First part × derivative of second + Second part × derivative of first)',
          options: [
            'e^(2x) · (3x² + 2x³)',
            '3x² · 2e^(2x)',
            '6x² · e^(2x)',
            'x² · e^(2x) · (x + 3)',
          ],
          correctAnswer: 'e^(2x) · (3x² + 2x³)',
          explanation: '💡 Whiteboard Walkthrough:\n• Step 1: Break into two pieces: u = x³ and v = e^(2x).\n• Step 2: Differentiate each piece: u\' = 3x² and v\' = 2·e^(2x).\n• Step 3: Combine with Product Rule: (3x² · e^(2x)) + (x³ · 2e^(2x)) = e^(2x) · (3x² + 2x³).',
          topic: 'Product Rule & Rates',
        },
        {
          id: 'q3',
          question: 'Find the total area under the curve from x = 0 to x = 2 for:\n\n   Area = ∫ (3x² - 4x + 1) dx   (from 0 to 2)',
          options: ['2', '0', '4', '-1'],
          correctAnswer: '2',
          explanation: '💡 Whiteboard Walkthrough:\n• Step 1: Find the anti-derivative: 3x² becomes x³, -4x becomes -2x², and 1 becomes x. So F(x) = x³ - 2x² + x.\n• Step 2: Plug in top value (2): (2)³ - 2(2)² + 2 = 8 - 8 + 2 = 2.\n• Step 3: Plug in bottom value (0): 0 - 0 + 0 = 0.\n• Step 4: Subtract: 2 - 0 = 2.',
          topic: 'Area Under Curves',
        },
        {
          id: 'q4',
          question: 'Everyday Practical Math: If a laptop is discounted by 20% from $1,000, and then you apply a 10% student coupon on the sale price, what is the final price?',
          options: ['$720', '$700', '$750', '$680'],
          correctAnswer: '$720',
          explanation: '💡 Whiteboard Walkthrough:\n• Step 1: 20% off $1,000 saves $200, bringing the price to $800.\n• Step 2: 10% coupon on $800 saves $80 ($800 × 0.10).\n• Step 3: Final price: $800 - $80 = $720. (Notice discounts do not simply add to 30%!).',
          topic: 'Practical Percentage Math',
        },
      ],
      _updatedAt: Date.now(),
    },
    messages: [
      {
        id: 'msg-math-init',
        sender: 'assistant',
        text: `Hello ${userName}! Welcome to your **Math Quiz Studio** tab. 

I designed this interactive drill with clean whiteboard problem walkthroughs written the way humans think and write—no raw code or confusing symbols.

What topic would you like to drill next, or would you like to mount this directly into your sidebar cockpit?`,
        suggestedQuickReplies: [
          'Add a Linear Algebra question',
          'Add a Statistics question',
          'Mount as Cockpit Tab',
        ],
        tabMeta: {
          label: 'Math Quiz Studio',
          icon: 'HelpCircle',
          viewType: 'dynamic_tool',
          description: 'Whiteboard mathematics drill with human-friendly step-by-step explanations',
        },
      },
    ],
    readyToMount: true,
    createdAt: Date.now() - 3600000,
    lastUpdated: Date.now(),
  },
  {
    tabId: 'tab-timetable',
    label: 'AI Timetables',
    icon: 'Calendar',
    viewType: 'timetable',
    description: 'AI-assisted course timetable and schedule manager',
    previewData: {
      title: 'Computer Science & Engineering Timetable',
      academicTerm: 'Fall Semester 2026',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      periodTimes: [
        { period: 1, startTime: '09:00', endTime: '09:50', label: 'Period 1' },
        { period: 2, startTime: '10:00', endTime: '10:50', label: 'Period 2' },
        { period: 3, startTime: '11:00', endTime: '11:50', label: 'Period 3' },
        { period: 4, startTime: '12:00', endTime: '12:50', label: 'Period 4' },
        { period: 5, startTime: '13:00', endTime: '13:50', label: 'Lunch Break' },
        { period: 6, startTime: '14:00', endTime: '14:50', label: 'Period 5' },
        { period: 7, startTime: '15:00', endTime: '15:50', label: 'Period 6' },
      ],
      slots: [
        { id: 's1', day: 'Monday', period: 1, courseCode: 'CS-301', courseName: 'Data Structures & Algorithms', instructor: 'Dr. Turing', room: 'Hall A' },
        { id: 's2', day: 'Monday', period: 2, courseCode: 'CS-304', courseName: 'Computer Architecture', instructor: 'Prof. Hopper', room: 'Lab 2' },
        { id: 's3', day: 'Monday', period: 3, courseCode: 'MATH-201', courseName: 'Discrete Mathematics', instructor: 'Dr. Lovelace', room: 'Room 101' },
        { id: 's4', day: 'Tuesday', period: 1, courseCode: 'CS-308', courseName: 'Operating Systems', instructor: 'Dr. Ritchie', room: 'Hall B' },
        { id: 's5', day: 'Tuesday', period: 2, courseCode: 'CS-310', courseName: 'Database Systems', instructor: 'Prof. Codd', room: 'Lab 4' },
        { id: 's6', day: 'Wednesday', period: 1, courseCode: 'CS-301', courseName: 'Data Structures & Algorithms', instructor: 'Dr. Turing', room: 'Hall A' },
        { id: 's7', day: 'Wednesday', period: 2, courseCode: 'CS-304', courseName: 'Computer Architecture', instructor: 'Prof. Hopper', room: 'Lab 2' },
      ],
      _updatedAt: Date.now(),
    },
    messages: [
      {
        id: 'msg-time-init',
        sender: 'assistant',
        text: `Here is your dedicated **AI Timetable** conversation. You can ask me to re-balance course hours, insert lab blocks, or configure lecture periods. Any changes update your live schedule immediately!`,
        suggestedQuickReplies: [
          'Add lunch break at 1 PM',
          'Make slots 50 minutes',
          'Mount as Cockpit Tab',
        ],
        tabMeta: {
          label: 'AI Timetables',
          icon: 'Calendar',
          viewType: 'timetable',
          description: 'AI-assisted course timetable and schedule manager',
        },
      },
    ],
    readyToMount: true,
    createdAt: Date.now() - 7200000,
    lastUpdated: Date.now(),
  },
  {
    tabId: 'tab-pomodoro',
    label: 'Focus Pomodoro',
    icon: 'Clock',
    viewType: 'dynamic_tool',
    description: 'Timed academic focus sprints & restorative intervals',
    previewData: {
      toolType: 'timer',
      title: 'Deep Flow Pomodoro Station',
      description: 'Timed study intervals with ambient sound and sprint tracking.',
      duration: 1500,
      _updatedAt: Date.now(),
    },
    messages: [
      {
        id: 'msg-pomo-init',
        sender: 'assistant',
        text: `Welcome to your **Focus Pomodoro** workspace tab. I can calibrate interval lengths, configure break routines, or add ambient focus sound cues.`,
        suggestedQuickReplies: [
          'Change duration to 50 minutes',
          'Add ambient study sound',
          'Mount as Cockpit Tab',
        ],
        tabMeta: {
          label: 'Focus Pomodoro',
          icon: 'Clock',
          viewType: 'dynamic_tool',
          description: 'Timed academic focus sprints & restorative intervals',
        },
      },
    ],
    readyToMount: true,
    createdAt: Date.now() - 10800000,
    lastUpdated: Date.now(),
  },
  {
    tabId: 'tab-rubric',
    label: 'Viva Rubric Matrix',
    icon: 'Award',
    viewType: 'dynamic_tool',
    description: 'Real-time oral exam and presentation evaluation rubric',
    previewData: {
      toolType: 'rubric',
      title: 'Viva & Oral Examination Rubric',
      description: 'Weighted assessment matrix with real-time percentage scoring.',
      criteria: [
        { id: 'c1', name: 'Algorithmic Correctness & Proof', max: 10, weight: 35, desc: 'Solution handles all edge cases, proves recursion termination bounds.' },
        { id: 'c2', name: 'Asymptotic Time & Memory Efficiency', max: 10, weight: 25, desc: 'Optimal big-O bounds, avoiding redundant allocations.' },
        { id: 'c3', name: 'Code Modularity & Quality', max: 10, weight: 20, desc: 'Clean separation of concerns, defensive validation, test coverage.' },
        { id: 'c4', name: 'Technical Defense & Viva Articulation', max: 10, weight: 20, desc: 'Student articulates rationale clearly under questioning.' },
      ],
      _updatedAt: Date.now(),
    },
    messages: [
      {
        id: 'msg-rubric-init',
        sender: 'assistant',
        text: `This is your **Viva & Oral Exam Evaluation Rubric** tab. Score presentations live across weighted dimensions with real-time percentage projection.`,
        suggestedQuickReplies: [
          'Add a criteria for System Architecture',
          'Change max score to 20',
          'Mount as Cockpit Tab',
        ],
        tabMeta: {
          label: 'Viva Rubric Matrix',
          icon: 'Award',
          viewType: 'dynamic_tool',
          description: 'Real-time oral exam and presentation evaluation rubric',
        },
      },
    ],
    readyToMount: true,
    createdAt: Date.now() - 14400000,
    lastUpdated: Date.now(),
  },
];

export const AIWorkflowStudio: React.FC<AIWorkflowStudioProps> = ({ onNavigate }) => {
  const { role, userProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const userId = userProfile?.userId || 'guest-user';
  const userName = userProfile?.name || 'Alex';
  const customTabsStorageKey = `custom_cockpit_tabs_${userId}`;
  const studioSessionsStorageKey = `studio_tab_sessions_${userId}`;

  // Studio Mode: 'build' (Copilot + Live Preview + Code) | 'playground' (Google AI Studio Workbench) | 'mounted' (Active Sidebar Tabs)
  const [activeStudioMode, setActiveStudioMode] = useState<'build' | 'playground' | 'mounted'>('build');

  // Right Panel Sub-tab in 'build' mode: 'preview' (Live View) | 'code' (TSX Code Inspector) | 'schema' (JSON Blueprint)
  const [buildViewSubTab, setBuildViewSubTab] = useState<'preview' | 'code' | 'schema'>('preview');

  // Get Code Modal State
  const [isGetCodeOpen, setIsGetCodeOpen] = useState(false);
  const [getCodeConfig, setGetCodeConfig] = useState<any>({
    model: 'gemini-3.8-flash',
    systemInstruction: '',
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 2048,
    thinkingLevel: 'OFF',
    enableGoogleSearch: false,
    responseMimeType: 'text/plain',
    contents: ['Design a custom academic workflow cockpit tab'],
  });

  // Mounted Cockpit Tabs for this user
  const [mountedTabs, setMountedTabs] = useState<CustomCockpitTab[]>(() => {
    try {
      const saved = localStorage.getItem(customTabsStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Save mounted tabs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(customTabsStorageKey, JSON.stringify(mountedTabs));
      window.dispatchEvent(new Event('custom-cockpit-tabs-changed'));
    } catch {}
  }, [mountedTabs, customTabsStorageKey]);

  // Tab Sessions State: Each tab has its own dedicated, persistent chat history and draft preview!
  const [tabSessions, setTabSessions] = useState<StudioTabSession[]>(() => {
    try {
      const saved = localStorage.getItem(studioSessionsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getDefaultSessions(userName);
  });

  // Active Tab ID (Default: Math Quiz Studio)
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    return tabSessions[0]?.tabId || 'tab-math-quiz';
  });

  // Save tab sessions to localStorage whenever they update
  useEffect(() => {
    try {
      localStorage.setItem(studioSessionsStorageKey, JSON.stringify(tabSessions));
    } catch {}
  }, [tabSessions, studioSessionsStorageKey]);

  // Current Active Tab Session
  const currentSession =
    tabSessions.find((t) => t.tabId === activeTabId) ||
    tabSessions[0] || {
      tabId: 'tab-default',
      label: 'Default Tool',
      icon: 'HelpCircle',
      viewType: 'dynamic_tool',
      description: 'Autonomous tool sandbox',
      messages: [],
      previewData: null,
      readyToMount: false,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

  // Helper to mutate active session
  const updateCurrentSession = useCallback(
    (updates: Partial<StudioTabSession>) => {
      setTabSessions((prev) =>
        prev.map((t) =>
          t.tabId === currentSession.tabId
            ? { ...t, ...updates, lastUpdated: Date.now() }
            : t
        )
      );
    },
    [currentSession.tabId]
  );

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Editable Code in Code Inspector
  const [customEditableCode, setCustomEditableCode] = useState<string>('');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Memoized live preview update handler
  const handlePreviewUpdate = useCallback(
    (updated: any) => {
      updateCurrentSession({
        previewData: { ...updated, _updatedAt: Date.now() },
      });
    },
    [updateCurrentSession]
  );

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages, isLoading, activeTabId]);

  // Generate synthetic TypeScript/React Component code for Code Inspector
  const generateComponentCode = (tabMeta: any, data: any) => {
    if (!tabMeta || !data) return '// No tool generated yet. Ask Copilot to build a feature.';

    const componentName = (tabMeta.label || 'CustomFeature').replace(/[^a-zA-Z0-9]/g, '');

    return `// ============================================================================
// Google AI Studio · Generated Cockpit Feature Component
// Target Cockpit Tab: ${tabMeta.label}
// View Type: ${tabMeta.viewType}
// Engine: gemini-3.8-flash (Zero Core Overwrite · Sandboxed Dynamic Execution)
// ============================================================================

import React, { useState } from 'react';

export interface ${componentName}Props {
  onUpdateState?: (data: any) => void;
}

export const ${componentName}: React.FC<${componentName}Props> = () => {
  // Initial state generated dynamically by Google AI Studio
  const [featureState, setFeatureState] = useState(${JSON.stringify(data, null, 2)});

  return (
    <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/10 text-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-xl font-black font-sans text-white">
            ${data.title || tabMeta.label}
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            ${data.description || tabMeta.description}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
          Mounted Live Feature
        </span>
      </div>

      {/* Render Component Viewport */}
      <div className="space-y-3">
        ${
          data.questions
            ? `// Math / Assessment Quiz Drill with ${data.questions.length} Questions
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-200">
            Current Question: {featureState.questions?.[0]?.question}
          </p>
        </div>`
            : data.cards
            ? `// Interactive Flashcards Deck with ${data.cards.length} Cards
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {featureState.cards?.map((card, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-[#00F0FF]">{card.front}</span>
            </div>
          ))}
        </div>`
            : `// Custom Tool Schema Output
        <pre className="p-4 rounded-2xl bg-black/50 text-xs font-mono text-cyan-300 overflow-x-auto">
          {JSON.stringify(featureState, null, 2)}
        </pre>`
        }
      </div>
    </div>
  );
};

export default ${componentName};`;
  };

  // Sync custom editable code when previewData changes
  useEffect(() => {
    if (currentSession.previewData) {
      setCustomEditableCode(
        generateComponentCode(
          {
            label: currentSession.label,
            viewType: currentSession.viewType,
            description: currentSession.description,
          },
          currentSession.previewData
        )
      );
    }
  }, [currentSession.previewData, currentSession.label, currentSession.viewType, currentSession.description]);

  // Create a brand-new tab session
  const handleCreateNewTab = () => {
    const newId = `tab-${Date.now().toString(36)}`;
    const newSession: StudioTabSession = {
      tabId: newId,
      label: 'New Custom Tool',
      icon: 'Sparkles',
      viewType: 'dynamic_tool',
      description: 'Custom autonomous cockpit feature',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `I've opened a fresh workspace tab for you! What feature or tool would you like me to build here? 

You can say *"create an interactive flashcard deck"*, *"build a study sprint timer"*, *"create a GPA simulator"*, or describe any custom routine!`,
          suggestedQuickReplies: [
            'Create a whiteboard math quiz with simple step-by-step proofs',
            'Build a pomodoro focus station with sprint timer',
            'Create a GPA target projection calculator',
            'Create an oral exam and viva evaluation rubric',
          ],
        },
      ],
      previewData: null,
      readyToMount: false,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    setTabSessions((prev) => [...prev, newSession]);
    setActiveTabId(newId);
    showToast('New studio tab opened!', 'success');
  };

  // Close / Delete a tab session
  const handleCloseTab = (tabIdToClose: string) => {
    if (tabSessions.length <= 1) {
      showToast('At least one studio tab must remain active.', 'warning');
      return;
    }

    setTabSessions((prev) => {
      const remaining = prev.filter((t) => t.tabId !== tabIdToClose);
      if (activeTabId === tabIdToClose && remaining.length > 0) {
        setActiveTabId(remaining[0].tabId);
      }
      return remaining;
    });

    showToast('Tab closed.', 'info');
  };

  // Clear chat conversation for current active tab
  const handleClearCurrentTabChat = () => {
    updateCurrentSession({
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `Chat reset for **"${currentSession.label}"**. What changes or new questions would you like to explore?`,
          suggestedQuickReplies: [
            'Simplify explanation steps',
            'Add more practice problems',
            'Mount as Cockpit Tab',
          ],
        },
      ],
    });
    showToast(`Chat cleared for "${currentSession.label}".`, 'info');
  };

  // Send message to AI Copilot (Isolated per active tab session)
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (text.toLowerCase() === 'mount as cockpit tab' && currentSession.previewData) {
      handleMountTabToCockpit();
      return;
    }

    if (
      text.toLowerCase().includes('switch to prompt playground') ||
      text.toLowerCase().includes('open google ai studio')
    ) {
      setActiveStudioMode('playground');
      return;
    }

    if (text.toLowerCase().includes('get code') || text.toLowerCase().includes('export production')) {
      setIsGetCodeOpen(true);
      return;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
    };

    const updatedMessages = [...currentSession.messages, userMsg];

    // Optimistically append user message to active tab session
    updateCurrentSession({
      messages: updatedMessages,
    });

    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.copilotChat({
        messages: updatedMessages.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        role: role === 'teacher' ? 'teacher' : 'student',
        userId,
        userName,
        currentDraft: currentSession.previewData,
      });

      const updatedPreview = response.previewData
        ? { ...response.previewData, _updatedAt: Date.now() }
        : currentSession.previewData;

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: response.response,
        suggestedQuickReplies: response.suggestedQuickReplies,
        tabMeta: response.tabMeta,
      };

      // Persist AI reply and updated preview data into current tab session
      setTabSessions((prev) =>
        prev.map((t) =>
          t.tabId === currentSession.tabId
            ? {
                ...t,
                messages: [...updatedMessages, aiMsg],
                previewData: updatedPreview,
                label: response.tabMeta?.label || t.label,
                icon: response.tabMeta?.icon || t.icon,
                viewType: response.tabMeta?.viewType || t.viewType,
                description: response.tabMeta?.description || t.description,
                readyToMount: response.readyToMount ?? true,
                lastUpdated: Date.now(),
              }
            : t
        )
      );

      showToast('Live preview updated!', 'success');
    } catch (err: any) {
      const fallbackMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'I encountered an issue synthesizing that revision. Would you like to simplify the whiteboard steps or add a question?',
        suggestedQuickReplies: [
          'Simplify explanation steps',
          'Add another question',
          'Mount as Cockpit Tab',
        ],
      };

      setTabSessions((prev) =>
        prev.map((t) =>
          t.tabId === currentSession.tabId
            ? {
                ...t,
                messages: [...updatedMessages, fallbackMsg],
              }
            : t
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Mount Tab to Sidebar Navigation Cockpit
  const handleMountTabToCockpit = () => {
    if (!currentSession.previewData) {
      showToast('No feature ready to mount yet. Ask the AI Copilot to build one first.', 'warning');
      return;
    }

    const tabId = currentSession.tabId.startsWith('custom-tab-')
      ? currentSession.tabId
      : `custom-tab-${currentSession.viewType}-${Date.now().toString(36)}`;

    const newTab: CustomCockpitTab = {
      tabId,
      label: currentSession.label || 'Custom Cockpit Extension',
      icon: currentSession.icon || 'Sparkles',
      viewType: currentSession.viewType || 'dynamic_tool',
      userId,
      userRole: role === 'teacher' ? 'teacher' : 'student',
      description: currentSession.description || 'Custom personal cockpit extension',
      timetableData: currentSession.viewType === 'timetable' ? currentSession.previewData : undefined,
      customSchema: currentSession.viewType === 'dynamic_tool' ? currentSession.previewData : undefined,
      createdAt: new Date().toISOString(),
    };

    setMountedTabs((prev) => {
      const filtered = prev.filter((t) => t.label !== newTab.label && t.tabId !== newTab.tabId);
      return [...filtered, newTab];
    });

    showToast(`Tab "${newTab.label}" mounted to your left sidebar navigation!`, 'success');

    // Add confirmation message into current tab's chat
    const mountMsg: Message = {
      id: `msg-mount-${Date.now()}`,
      sender: 'assistant',
      text: `🎉 Success! I have mounted **"${newTab.label}"** directly into your left sidebar navigation cockpit under **Cockpit Extensions**.

You can click **"${newTab.label}"** anytime from the sidebar to open this full-screen interactive view. Your chat history and draft settings for this tab remain saved here.`,
      suggestedQuickReplies: [
        `Open "${newTab.label}" now`,
        'Create another custom feature tab',
      ],
    };

    updateCurrentSession({
      messages: [...currentSession.messages, mountMsg],
      readyToMount: true,
    });
  };

  // Unmount/Delete Tab from Cockpit
  const handleUnmountTab = (tabId: string, label: string) => {
    setMountedTabs((prev) => prev.filter((t) => t.tabId !== tabId));
    showToast(`Unmounted "${label}" from sidebar navigation.`, 'info');
  };

  // Inspect Mounted Tab in Studio: Switches or creates a dedicated session
  const handleInspectMountedTab = (tab: CustomCockpitTab) => {
    const existing = tabSessions.find(
      (s) => s.tabId === tab.tabId || s.label.toLowerCase() === tab.label.toLowerCase()
    );

    if (existing) {
      setActiveTabId(existing.tabId);
    } else {
      const sessionFromMounted: StudioTabSession = {
        tabId: tab.tabId,
        label: tab.label,
        icon: tab.icon,
        viewType: tab.viewType,
        description: tab.description,
        messages: [
          {
            id: `msg-inspect-${Date.now()}`,
            sender: 'assistant',
            text: `Welcome back to **${tab.label}**! This tab is currently mounted in your left sidebar navigation. Ask me to make any revisions or tune its data!`,
            suggestedQuickReplies: ['Add more options', 'Simplify explanations', 'Export code'],
          },
        ],
        previewData: tab.timetableData || tab.customSchema,
        readyToMount: true,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      setTabSessions((prev) => [...prev, sessionFromMounted]);
      setActiveTabId(tab.tabId);
    }

    setActiveStudioMode('build');
  };

  // Helper icon renderer
  const renderIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Calendar':
        return <Calendar className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'ListTodo':
        return <ListTodo className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Calculator':
        return <Calculator className={className} />;
      case 'HelpCircle':
        return <HelpCircle className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-3 md:p-6 space-y-5">
      {/* Top Header Banner & Studio Navigation */}
      <div className="p-5 md:p-6 rounded-3xl border bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#0A0E18] border-purple-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-[#00F0FF] uppercase">
                Google AI Studio Build · Workbench
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Zero Core Overwrite · Persistent Tab Chats</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans flex items-center gap-2.5">
              <span>AI Workflow Studio</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 border border-white/10">
                gemini-3.8-flash
              </span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Design, test, and mount live personalized cockpit tabs. Every tab maintains its own saved Copilot conversation and live interactive preview with instant reactivity.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setGetCodeConfig({
                  model: 'gemini-3.8-flash',
                  systemInstruction: 'You are an elite academic architect...',
                  temperature: 0.7,
                  topP: 0.95,
                  maxOutputTokens: 2048,
                  thinkingLevel: 'OFF',
                  enableGoogleSearch: false,
                  responseMimeType: 'text/plain',
                  contents: currentSession.messages.map((m) => ({
                    role: m.sender === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.text }],
                  })),
                });
                setIsGetCodeOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[#00F0FF]" />
              <span>Get Code</span>
            </button>

            {currentSession.previewData && activeStudioMode === 'build' && (
              <button
                type="button"
                onClick={handleMountTabToCockpit}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-purple-600 hover:from-[#38bdf8] hover:to-purple-500 text-black font-bold font-mono text-xs shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Mount "{currentSession.label}" to Cockpit</span>
              </button>
            )}
          </div>
        </div>

        {/* Studio Primary Mode Switcher Tabs */}
        <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          {[
            {
              id: 'build',
              label: `AI Studio Build · Tab Chats (${tabSessions.length})`,
              icon: LayoutDashboard,
              desc: 'Conversational builder with dedicated per-tab chat and live preview',
            },
            {
              id: 'playground',
              label: 'Google AI Studio · Prompt Playground',
              icon: Sliders,
              desc: 'System instructions, temperature tuning, search grounding & telemetry',
            },
            {
              id: 'mounted',
              label: `Mounted Cockpit Tabs (${mountedTabs.length})`,
              icon: Layers,
              desc: 'Active custom cockpit navigation tabs in your sidebar',
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeStudioMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveStudioMode(mode.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW MODE 1: PROMPT PLAYGROUND (Full Google AI Studio Workbench)      */}
      {/* ===================================================================== */}
      {activeStudioMode === 'playground' && (
        <StudioPlayground
          onOpenGetCode={(config) => {
            setGetCodeConfig(config);
            setIsGetCodeOpen(true);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW MODE 2: MOUNTED COCKPIT TABS MANAGEMENT                          */}
      {/* ===================================================================== */}
      {activeStudioMode === 'mounted' && (
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0B0F19]/95 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00F0FF]" />
                <span>Currently Mounted Cockpit Navigation Tabs</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                These tabs are directly mounted into your sidebar cockpit navigation without overwriting core code.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleCreateNewTab();
                setActiveStudioMode('build');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-mono text-xs hover:bg-[#00F0FF]/25 cursor-pointer"
            >
              <span>+ Architect New Tab</span>
            </button>
          </div>

          {mountedTabs.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-white/10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                No custom cockpit tabs mounted yet. Switch to the <strong>AI Studio Build</strong> tab, chat with the Copilot, and click <strong>"Mount as Cockpit Tab"</strong> to inject one into your left sidebar!
              </p>
              <button
                type="button"
                onClick={() => setActiveStudioMode('build')}
                className="px-4 py-2 rounded-xl bg-[#00F0FF] text-black font-bold font-mono text-xs cursor-pointer"
              >
                Start Designing Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mountedTabs.map((tab) => (
                <div
                  key={tab.tabId}
                  className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4 group hover:border-[#00F0FF]/50 transition-all shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-2xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center justify-center">
                        {renderIcon(tab.icon, 'w-4 h-4')}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active in Sidebar
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold font-mono text-white">{tab.label}</h3>
                      <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2">
                        {tab.description || 'Personal cockpit extension'}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500">
                      ID: {tab.tabId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate(tab.tabId)}
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-all text-center cursor-pointer"
                      >
                        Open Tab
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleInspectMountedTab(tab)}
                      className="px-3 py-2 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 font-mono text-xs transition-all cursor-pointer flex items-center gap-1"
                      title="Inspect & Chat in Studio"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnmountTab(tab.tabId, tab.label)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Unmount Tab"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW MODE 3: AI STUDIO BUILD (Per-Tab Chats + Live Preview + TSX)      */}
      {/* ===================================================================== */}
      {activeStudioMode === 'build' && (
        <div className="space-y-4">
          {/* ========================================================= */}
          {/* STUDIO TAB SESSIONS SWITCHER BAR                          */}
          {/* ========================================================= */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/50 border border-white/10 shadow-lg overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 px-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Studio Tabs ({tabSessions.length})</span>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto flex-1 py-1">
              {tabSessions.map((tab) => {
                const isActive = tab.tabId === activeTabId;
                const isMounted = mountedTabs.some(
                  (m) => m.label.toLowerCase() === tab.label.toLowerCase() || m.tabId === tab.tabId
                );

                return (
                  <div
                    key={tab.tabId}
                    onClick={() => setActiveTabId(tab.tabId)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer select-none shrink-0 ${
                      isActive
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.25)] font-bold'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="shrink-0">{renderIcon(tab.icon, 'w-3.5 h-3.5')}</span>
                    <span className="truncate max-w-[130px]">{tab.label}</span>

                    {/* Chat Count badge */}
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-[#00F0FF]/30 text-white'
                          : 'bg-white/10 text-slate-400'
                      }`}
                      title={`${tab.messages.length} messages in this tab's chat`}
                    >
                      {tab.messages.length}
                    </span>

                    {/* Mounted to sidebar badge */}
                    {isMounted && (
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black shrink-0"
                        title="Mounted in left sidebar"
                      />
                    )}

                    {/* Close Tab Button */}
                    {tabSessions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(tab.tabId);
                        }}
                        className="p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
                        title="Close Tab"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add New Tab Button */}
              <button
                type="button"
                onClick={handleCreateNewTab}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>+ New Tab Chat</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TWO COLUMN STUDIO CANVAS: CHAT STREAM + LIVE PREVIEW      */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ========================================================= */}
            {/* LEFT PANEL: Dedicated Copilot Chat Stream for Active Tab  */}
            {/* ========================================================= */}
            <div
              className={`lg:col-span-5 rounded-3xl border flex flex-col h-[750px] overflow-hidden ${
                isDark ? 'bg-[#0B0F19]/95 border-white/10' : 'bg-white border-slate-200'
              } shadow-xl`}
            >
              {/* Chat Header */}
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                      <span>{currentSession.label}</span>
                      <span className="text-[10px] font-normal text-purple-300">
                        ({currentSession.messages.length} msgs)
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Dedicated chat session saved for this tab
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearCurrentTabChat}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1"
                    title="Clear this tab's chat"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>

                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active</span>
                  </span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {currentSession.messages.map((msg, mIdx) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={`${msg.id || 'msg'}-${mIdx}`}
                      className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed font-sans ${
                          isUser
                            ? 'bg-[#00F0FF] text-black font-medium shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-br-none'
                            : isDark
                            ? 'bg-white/[0.04] text-slate-200 border border-white/10 rounded-bl-none'
                            : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line text-xs">{msg.text}</div>

                        {/* Quick Reply Suggestion Chips */}
                        {!isUser && msg.suggestedQuickReplies && msg.suggestedQuickReplies.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                              Suggested Options / Refinements:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.suggestedQuickReplies.map((reply, rIdx) => (
                                <button
                                  key={rIdx}
                                  type="button"
                                  onClick={() => {
                                    if (
                                      reply.includes('Mount as Cockpit Tab') ||
                                      reply.includes('Mount this tab now')
                                    ) {
                                      handleMountTabToCockpit();
                                    } else if (reply.startsWith('Open "') && onNavigate) {
                                      onNavigate(
                                        mountedTabs[mountedTabs.length - 1]?.tabId || 'tab-math-quiz'
                                      );
                                    } else {
                                      handleSendMessage(reply);
                                    }
                                  }}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all text-left font-mono cursor-pointer"
                                >
                                  → {reply}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 flex items-center justify-center shrink-0 mt-0.5">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2.5 text-xs text-purple-300 font-mono p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 max-w-[85%]">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                    <span>AI Copilot is synthesizing architecture & updating live preview...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-white/10 bg-white/[0.02] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Adjust ${currentSession.label} (e.g. simplify whiteboard steps)...`}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF] transition-all ${
                      isDark
                        ? 'bg-black/50 border-white/10 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-2.5 rounded-2xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT PANEL: Live Interactive Preview & Code Inspector    */}
            {/* ========================================================= */}
            <div
              className={`lg:col-span-7 rounded-3xl border flex flex-col h-[750px] overflow-hidden ${
                isDark ? 'bg-[#0B0F19]/95 border-white/10' : 'bg-white border-slate-200'
              } shadow-xl`}
            >
              {currentSession.previewData ? (
                <>
                  {/* Live Preview Header & Sub-tab navigation */}
                  <div className="p-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-white/[0.02]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                        {renderIcon(currentSession.icon, 'w-4 h-4')}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                          <span>{currentSession.label}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Live Reactivity</span>
                          </span>
                        </h3>
                      </div>
                    </div>

                    {/* Sub-tab switcher: Live View | Code Inspector | JSON Schema */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setBuildViewSubTab('preview')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          buildViewSubTab === 'preview'
                            ? 'bg-[#00F0FF] text-black font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuildViewSubTab('code')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          buildViewSubTab === 'code'
                            ? 'bg-[#00F0FF] text-black font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Code (TSX)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuildViewSubTab('schema')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          buildViewSubTab === 'schema'
                            ? 'bg-[#00F0FF] text-black font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>JSON</span>
                      </button>
                    </div>

                    {/* Mount Tab Action */}
                    <button
                      type="button"
                      onClick={handleMountTabToCockpit}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold font-mono text-[11px] shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mount Tab</span>
                    </button>
                  </div>

                  {/* Sub-tab 1: Interactive Live Preview Viewport */}
                  {buildViewSubTab === 'preview' && (
                    <div className="flex-1 overflow-y-auto p-3">
                      {currentSession.viewType === 'timetable' ? (
                        <AITimetableManager
                          key={
                            currentSession.tabId +
                            '-' +
                            (currentSession.previewData?._updatedAt || '') +
                            '-' +
                            (currentSession.previewData?.title || 'timetable')
                          }
                          initialData={currentSession.previewData}
                          onUpdate={handlePreviewUpdate}
                          isReadOnlyPreview={false}
                        />
                      ) : (
                        <DynamicToolPreview
                          key={
                            currentSession.tabId +
                            '-' +
                            (currentSession.previewData?._updatedAt || '') +
                            '-' +
                            (currentSession.previewData?.title || '') +
                            '-' +
                            (currentSession.previewData?.questions?.[0]?.question || '') +
                            '-' +
                            (currentSession.previewData?.questions?.[0]?.explanation || '')
                          }
                          featureData={currentSession.previewData}
                          onUpdate={handlePreviewUpdate}
                          isReadOnly={false}
                        />
                      )}
                    </div>
                  )}

                  {/* Sub-tab 2: Code View & Editor (TSX) */}
                  {buildViewSubTab === 'code' && (
                    <div className="flex-1 flex flex-col p-4 space-y-3 bg-black/60 overflow-hidden">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">TypeScript / React Component Implementation</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(customEditableCode);
                              showToast('Component code copied to clipboard!', 'info');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy TSX</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={customEditableCode}
                        onChange={(e) => setCustomEditableCode(e.target.value)}
                        className="flex-1 w-full p-4 rounded-2xl bg-black/80 border border-white/10 text-xs font-mono text-cyan-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#00F0FF] resize-none select-text"
                      />
                    </div>
                  )}

                  {/* Sub-tab 3: JSON Schema & Payload Inspector */}
                  {buildViewSubTab === 'schema' && (
                    <div className="flex-1 flex flex-col p-4 space-y-3 bg-black/60 overflow-hidden">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Underlying JSON Data Definition</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              JSON.stringify(currentSession.previewData, null, 2)
                            );
                            showToast('JSON Blueprint copied!', 'info');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </button>
                      </div>

                      <pre className="flex-1 w-full p-4 rounded-2xl bg-black/80 border border-white/10 text-xs font-mono text-purple-300 leading-relaxed overflow-auto select-text">
                        {JSON.stringify(currentSession.previewData, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                /* Studio Canvas Ready - No tool generated in this tab yet */
                <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6 overflow-y-auto">
                  <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <Sparkles className="w-8 h-8 animate-pulse text-[#00F0FF]" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-purple-300">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{currentSession.label} Canvas Ready</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black font-sans text-white">
                      Build Any Custom Extension for "{currentSession.label}"
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Type your request in the chat on the left or select a prototype below. The live interactive preview and code inspector will render here immediately.
                    </p>
                  </div>

                  {/* Starter Prototypes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left pt-2">
                    {[
                      {
                        label: 'Math Quiz Studio',
                        icon: Calculator,
                        desc: 'Whiteboard math drills with simple step-by-step proofs & score tracking.',
                        prompt: 'Create a math quiz tab with simple step-by-step proofs that anyone can understand without confusing notation',
                        color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400',
                      },
                      {
                        label: 'High-Yield Flashcard Deck',
                        icon: Brain,
                        desc: 'Active recall cards with question flip, proof explanation & mastery scores.',
                        prompt: 'Create an interactive flashcard deck for core algorithms and system invariants',
                        color: 'border-purple-500/30 bg-purple-950/20 text-purple-300 hover:border-purple-400',
                      },
                      {
                        label: 'Deep Flow Pomodoro Station',
                        icon: Clock,
                        desc: '25m sprint interval, short/long breaks, ambient noise & streak tracker.',
                        prompt: 'Build a pomodoro focus station tab with study interval countdown and session tracker',
                        color: 'border-amber-500/30 bg-amber-950/20 text-amber-300 hover:border-amber-400',
                      },
                      {
                        label: 'AI Academic Timetable',
                        icon: Calendar,
                        desc: 'Weekly schedule grid with conflict detection, period times & room routes.',
                        prompt: 'Create a tab that can be used to create and manage timetables using AI',
                        color: 'border-[#00F0FF]/30 bg-cyan-950/20 text-[#00F0FF] hover:border-[#00F0FF]',
                      },
                      {
                        label: 'Viva & Oral Exam Rubric',
                        icon: Award,
                        desc: 'Weighted evaluation matrix with real-time scoring and grade output.',
                        prompt: 'Create an oral exam and viva evaluation rubric with weighted criteria sliders',
                        color: 'border-blue-500/30 bg-blue-950/20 text-blue-300 hover:border-blue-400',
                      },
                      {
                        label: 'Priority Milestone Checklist',
                        icon: ListTodo,
                        desc: 'Deliverables, problem sets, and lab milestone task board.',
                        prompt: 'Create a priority academic milestone and task checklist tab',
                        color: 'border-pink-500/30 bg-pink-950/20 text-pink-300 hover:border-pink-400',
                      },
                    ].map((proto) => {
                      const ProtoIcon = proto.icon;
                      return (
                        <button
                          key={proto.label}
                          type="button"
                          onClick={() => handleSendMessage(proto.prompt)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group hover:scale-[1.02] active:scale-98 ${proto.color}`}
                        >
                          <span className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                            <ProtoIcon className="w-4 h-4" />
                          </span>
                          <div className="space-y-0.5">
                            <div className="text-xs font-mono font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                              {proto.label}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {proto.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google AI Studio "Get Code" Modal */}
      <GetCodeModal
        isOpen={isGetCodeOpen}
        onClose={() => setIsGetCodeOpen(false)}
        model={getCodeConfig.model}
        systemInstruction={getCodeConfig.systemInstruction}
        temperature={getCodeConfig.temperature}
        topP={getCodeConfig.topP}
        maxOutputTokens={getCodeConfig.maxOutputTokens}
        thinkingLevel={getCodeConfig.thinkingLevel}
        enableGoogleSearch={getCodeConfig.enableGoogleSearch}
        responseMimeType={getCodeConfig.responseMimeType}
        contents={getCodeConfig.contents}
      />
    </div>
  );
};
