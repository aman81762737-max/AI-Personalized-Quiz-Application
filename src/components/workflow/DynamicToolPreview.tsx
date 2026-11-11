import React, { useState, useEffect } from 'react';
import {
  Brain,
  Clock,
  ListTodo,
  Award,
  Calculator,
  BookOpen,
  Code,
  CheckCircle2,
  RotateCcw,
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Eye,
  EyeOff,
  Shuffle,
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  Flame,
  Volume2,
  VolumeX,
  HelpCircle,
  FileQuestion,
  CheckCircle,
  XCircle,
  X,
  Sliders,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';

interface DynamicToolPreviewProps {
  featureData: any;
  onUpdate?: (updated: any) => void;
  isReadOnly?: boolean;
}

/**
 * Renders mathematical expressions cleanly and naturally like a teacher on a whiteboard,
 * rather than raw programmer code or ugly unparsed LaTeX.
/**
 * Cleans up raw LaTeX, developer symbols, and ugly math codes into clean, whiteboard handwriting style.
 */
const formatWhiteboardMath = (raw: string): string => {
  if (!raw) return '';
  return raw
    .replace(/lim_\{x\s*->\s*0\}/gi, 'lim (x → 0)')
    .replace(/lim_\{x\s*\\to\s*0\}/gi, 'lim (x → 0)')
    .replace(/lim_\{u\s*->\s*0\}/gi, 'lim (u → 0)')
    .replace(/lim_\{u\s*\\to\s*0\}/gi, 'lim (u → 0)')
    .replace(/lim_\{([^}]+)\}/gi, 'lim ($1)')
    .replace(/\\sin/gi, 'sin')
    .replace(/\\cos/gi, 'cos')
    .replace(/\\tan/gi, 'tan')
    .replace(/\\to/gi, '→')
    .replace(/->/gi, '→')
    .replace(/\*/g, ' × ')
    .replace(/\\cdot/gi, ' · ')
    .replace(/\\int_0\^2/gi, '∫ from 0 to 2 of')
    .replace(/\\int/gi, '∫');
};

/**
 * Renders mathematical expressions cleanly and naturally like a teacher on a whiteboard,
 * rather than raw programmer code or ugly unparsed LaTeX.
 */
const WhiteboardMathDisplay: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const cleanedText = formatWhiteboardMath(text);
  const lines = cleanedText.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        // Highlight equation or formula lines
        const isFormula =
          trimmed.startsWith('lim') ||
          trimmed.startsWith('f(x)') ||
          trimmed.startsWith('Area') ||
          trimmed.startsWith('∫') ||
          trimmed.includes('→') ||
          trimmed.includes('·') ||
          trimmed.includes('sin(') ||
          trimmed.includes('cos(') ||
          (trimmed.includes('=') && !trimmed.startsWith('If') && !trimmed.startsWith('Everyday'));

        if (isFormula) {
          return (
            <div
              key={idx}
              className="p-3.5 my-2.5 rounded-2xl bg-[#030712] border border-cyan-500/40 text-cyan-300 font-mono text-sm md:text-base tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center text-center"
            >
              <span className="font-bold">{trimmed}</span>
            </div>
          );
        }

        // Subtitle or hint in parentheses
        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          return (
            <p key={idx} className="text-xs text-slate-400 font-sans italic">
              {trimmed}
            </p>
          );
        }

        return (
          <p key={idx} className="text-sm md:text-base font-semibold text-white font-sans leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Formats mathematical proofs and explanations into clean, numbered whiteboard step cards
 * so that any student can easily grasp the intuition, number substitutions, and final result.
 */
const WhiteboardExplanationDisplay: React.FC<{ explanation: string }> = ({ explanation }) => {
  if (!explanation) return null;

  const cleaned = formatWhiteboardMath(explanation);

  // If the explanation has sentences or legacy format without step markers, convert into steps
  let rawParts = cleaned.split(/\n+/).filter((p) => p.trim().length > 0);

  if (rawParts.length === 1 && (cleaned.includes('lim') || cleaned.includes('rewrite') || cleaned.includes('Applying'))) {
    // Legacy explanation sentence breakdown:
    rawParts = [
      '• Step 1: Standard Trigonometry Rule: When angle θ gets close to 0, sin(θ) / θ approaches 1.',
      '• Step 2: Separate the Constants: Notice the 5 inside sine and 2 in the denominator. Rewrite as (5/2) × lim (x → 0) [ sin(5x) / 5x ].',
      '• Step 3: Solve the Limit: Since lim (x → 0) [ sin(5x) / 5x ] becomes 1, the limit is: (5/2) × 1 = 5/2 (or 2.5).',
    ];
  }

  return (
    <div className="p-4 md:p-5 rounded-2xl border border-purple-500/40 bg-purple-950/30 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Step-by-Step Whiteboard Walkthrough</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Plain-English Explanation
        </span>
      </div>

      <div className="space-y-2">
        {rawParts.map((part, pIdx) => {
          const trimmed = part.trim();
          if (!trimmed) return null;

          const isStep =
            trimmed.startsWith('• Step') ||
            trimmed.startsWith('Step') ||
            trimmed.includes('Step 1') ||
            trimmed.includes('Step 2') ||
            trimmed.includes('Step 3') ||
            trimmed.includes('Step 4') ||
            trimmed.startsWith('💡');

          if (isStep) {
            let stepBadgeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
            if (trimmed.includes('Step 2')) stepBadgeColor = 'text-purple-400 border-purple-500/30 bg-purple-500/10';
            if (trimmed.includes('Step 3') || trimmed.includes('Step 4') || trimmed.includes('Final') || trimmed.includes('Solve')) {
              stepBadgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            }

            return (
              <div
                key={pIdx}
                className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-200 leading-relaxed font-sans flex items-start gap-2.5"
              >
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${stepBadgeColor}`}>
                  {trimmed.includes('Step 1') ? 'Step 1' : trimmed.includes('Step 2') ? 'Step 2' : trimmed.includes('Step 3') ? 'Step 3' : trimmed.includes('Step 4') ? 'Step 4' : 'Note'}
                </span>
                <div className="flex-1">
                  <span className="font-sans text-xs">{trimmed.replace(/^[•\s]*(Step\s*\d+:?|💡\s*Whiteboard\s*Walkthrough:?)\s*/i, '')}</span>
                </div>
              </div>
            );
          }

          return (
            <p key={pIdx} className="text-xs text-slate-300 leading-relaxed font-sans">
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export const DynamicToolPreview: React.FC<DynamicToolPreviewProps> = ({
  featureData,
  onUpdate,
  isReadOnly = false,
}) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();

  // Deduce tool type from featureData
  const toolType =
    featureData?.toolType ||
    featureData?.type ||
    (featureData?.config?.questions || featureData?.questions ? 'quiz' : null) ||
    (featureData?.config?.cards || featureData?.cards ? 'flashcards' : null) ||
    (featureData?.config?.criteria || featureData?.criteria ? 'rubric' : null) ||
    (featureData?.config?.items || featureData?.items ? 'checklist' : null) ||
    (featureData?.config?.courses || featureData?.courses ? 'calculator' : null) ||
    (featureData?.config?.duration || featureData?.duration ? 'timer' : null) ||
    (featureData?.config?.formulas || featureData?.formulas ? 'formula_sheet' : null) ||
    'quiz';

  const title =
    featureData?.title ||
    featureData?.name ||
    featureData?.label ||
    'Interactive Autonomous Cockpit Tool';

  const description =
    featureData?.description ||
    featureData?.desc ||
    'AI-generated personal workflow extension';

  // =========================================================================
  // QUIZ / MATH PRACTICE STATE & LOGIC
  // =========================================================================
  const generateClientFallbackQuestions = (topic: string, count: number, difficulty: string) => {
    const isBeginner = difficulty === 'Beginner';
    const isAdv = difficulty === 'Advanced' || difficulty === 'Olympiad';

    const pool = [
      {
        id: `q-gen-1-${Date.now()}`,
        question: isBeginner
          ? `Evaluate the direct limit as x approaches 0:\n\n   lim (x → 0)  [ sin(3x) / x ]\n\n(What does this ratio equal as x reaches 0?)`
          : isAdv
          ? `Evaluate using Taylor expansion or L'Hôpital:\n\n   lim (x → 0)  [ (e^(2x) - 1 - 2x) / x² ]\n\n(Find the limiting second-order coefficient)`
          : `Evaluate the trigonometric limit as x approaches 0:\n\n   lim (x → 0)  [ sin(5x) / (2x) ]\n\n(What does this fraction settle to as x approaches 0?)`,
        options: isBeginner
          ? ['3', '0', '1', '1 / 3']
          : isAdv
          ? ['2', '1', '4', '0']
          : ['5 / 2  (or 2.5)', '0', '1', '2 / 5  (or 0.4)'],
        correctAnswer: isBeginner ? '3' : isAdv ? '2' : '5 / 2  (or 2.5)',
        explanation: isBeginner
          ? `💡 Whiteboard Walkthrough:\n• Step 1: Fundamental Limit: lim (u → 0) [ sin(u) / u ] = 1.\n• Step 2: Multiply and divide by 3: 3 × [ sin(3x) / 3x ].\n• Step 3: Compute: 3 × 1 = 3.`
          : isAdv
          ? `💡 Whiteboard Walkthrough:\n• Step 1: Taylor Series Expansion: e^(2x) = 1 + 2x + (2x)²/2! + ... = 1 + 2x + 2x² + O(x³).\n• Step 2: Subtract numerator terms: (1 + 2x + 2x²) - 1 - 2x = 2x².\n• Step 3: Divide by x²: 2x² / x² = 2.`
          : `💡 Whiteboard Walkthrough:\n• Step 1: Fundamental Rule: When θ approaches 0, sin(θ)/θ approaches 1.\n• Step 2: Factor the constants: Rewrite as (5/2) × [ sin(5x) / 5x ].\n• Step 3: Final Limit: (5/2) × 1 = 5/2 (or 2.5).`,
        topic: `${topic} · Limits`,
      },
      {
        id: `q-gen-2-${Date.now()}`,
        question: isBeginner
          ? `Find the rate of change (derivative) of:\n\n   f(x) = 4x³ - 5x + 9\n\n(Apply Power Rule: d/dx(x^n) = n·x^(n-1))`
          : isAdv
          ? `Find the derivative of the composite logarithmic function:\n\n   f(x) = ln( x² + √(x⁴ + 1) )\n\n(Find f'(x) using Chain Rule)`
          : `Find the rate of change (derivative) of:\n\n   f(x) = x³ · e^(2x)\n\n(Rule: First part × derivative of second + Second part × derivative of first)`,
        options: isBeginner
          ? ['12x² - 5', '12x² - 5x', '7x² - 5', '4x² - 5']
          : isAdv
          ? ['2x / √(x⁴ + 1)', '1 / (x² + 1)', '2x / (x² + 1)', 'x / √(x⁴ + 1)']
          : ['e^(2x) · (3x² + 2x³)', '3x² · 2e^(2x)', '6x² · e^(2x)', 'x² · e^(2x) · (x + 3)'],
        correctAnswer: isBeginner ? '12x² - 5' : isAdv ? '2x / √(x⁴ + 1)' : 'e^(2x) · (3x² + 2x³)',
        explanation: isBeginner
          ? `💡 Whiteboard Walkthrough:\n• Step 1: Differentiate 4x³: 4 × 3x² = 12x².\n• Step 2: Differentiate -5x: -5.\n• Step 3: Differentiate constant 9: 0.\n• Step 4: Combine: 12x² - 5.`
          : isAdv
          ? `💡 Whiteboard Walkthrough:\n• Step 1: Let u = x² + √(x⁴ + 1). Then f'(x) = u'/u.\n• Step 2: Differentiate u: 2x + (4x³)/(2√(x⁴ + 1)) = 2x(1 + x²/√(x⁴+1)).\n• Step 3: Simplify fraction: u' / u simplifies cleanly to 2x / √(x⁴ + 1).`
          : `💡 Whiteboard Walkthrough:\n• Step 1: Split into parts: u = x³, v = e^(2x).\n• Step 2: Differentiate parts: u' = 3x², v' = 2e^(2x).\n• Step 3: Product Rule: (3x² · e^(2x)) + (x³ · 2e^(2x)) = e^(2x) · (3x² + 2x³).`,
        topic: `${topic} · Derivatives`,
      },
      {
        id: `q-gen-3-${Date.now()}`,
        question: isBeginner
          ? `Find the area under the straight line from x = 0 to x = 4 for:\n\n   Area = ∫ (2x + 1) dx   (from 0 to 4)`
          : isAdv
          ? `Evaluate the definite integral using Integration by Parts:\n\n   ∫ (x · e^(-x)) dx   (from x = 0 to ∞)`
          : `Find the total area under the curve from x = 0 to x = 2 for:\n\n   Area = ∫ (3x² - 4x + 1) dx   (from 0 to 2)`,
        options: isBeginner
          ? ['20', '16', '12', '24']
          : isAdv
          ? ['1', '0', 'e', '∞']
          : ['2', '0', '4', '-1'],
        correctAnswer: isBeginner ? '20' : isAdv ? '1' : '2',
        explanation: isBeginner
          ? `💡 Whiteboard Walkthrough:\n• Step 1: Anti-derivative: 2x becomes x², 1 becomes x. F(x) = x² + x.\n• Step 2: Upper bound (4): 4² + 4 = 16 + 4 = 20.\n• Step 3: Lower bound (0): 0² + 0 = 0.\n• Step 4: Difference: 20 - 0 = 20.`
          : isAdv
          ? `💡 Whiteboard Walkthrough:\n• Step 1: Integration by Parts: ∫ u dv = u·v - ∫ v du. Let u = x, dv = e^(-x) dx.\n• Step 2: Then du = dx, v = -e^(-x).\n• Step 3: Evaluate: [-x·e^(-x)]_0^∞ + ∫_0^∞ e^(-x) dx = 0 + [-e^(-x)]_0^∞ = 1.`
          : `💡 Whiteboard Walkthrough:\n• Step 1: Anti-derivative of (3x² - 4x + 1) is F(x) = x³ - 2x² + x.\n• Step 2: Plug in 2: 2³ - 2(2)² + 2 = 8 - 8 + 2 = 2.\n• Step 3: Plug in 0: 0.\n• Step 4: Subtract: 2 - 0 = 2.`,
        topic: `${topic} · Integration`,
      },
      {
        id: `q-gen-4-${Date.now()}`,
        question: `Linear Algebra & Matrix Invariant: If a 2×2 square matrix A has eigenvalues λ₁ = 3 and λ₂ = 5, what is det(A)?`,
        options: ['15', '8', '2', '0'],
        correctAnswer: '15',
        explanation: `💡 Whiteboard Walkthrough:\n• Step 1: Core Invariant: The determinant of any matrix equals the product of its eigenvalues.\n• Step 2: Compute: det(A) = λ₁ × λ₂ = 3 × 5 = 15.\n• Step 3: Note: The trace would be the sum (3 + 5 = 8).`,
        topic: `${topic} · Linear Algebra`,
      },
      {
        id: `q-gen-5-${Date.now()}`,
        question: `Everyday Practical Math: If a laptop is discounted by 20% from $1,000, and then you apply a 10% student coupon on the sale price, what is the final price?`,
        options: ['$720', '$700', '$750', '$680'],
        correctAnswer: '$720',
        explanation: `💡 Whiteboard Walkthrough:\n• Step 1: 20% off $1,000 saves $200, bringing the price to $800.\n• Step 2: 10% coupon on $800 saves $80 ($800 × 0.10).\n• Step 3: Final price: $800 - $80 = $720. (Notice discounts do not simply add to 30%!).`,
        topic: `${topic} · Practical Percentage Math`,
      },
    ];

    return pool.slice(0, Math.min(count, pool.length));
  };

  const defaultMathQuestions = [
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
  ];

  const initialQuestions =
    featureData?.config?.questions ||
    featureData?.questions ||
    defaultMathQuestions;

  const [questions, setQuestions] = useState<Array<any>>(initialQuestions);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showWhiteboardProof, setShowWhiteboardProof] = useState(true);

  // AI Drill Generator Window State
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [aiGenTopic, setAiGenTopic] = useState('Trigonometric Limits & Calculus');
  const [aiGenCount, setAiGenCount] = useState(5);
  const [aiGenDifficulty, setAiGenDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Olympiad'>('Intermediate');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [newQText, setNewQText] = useState('');
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [newOpt3, setNewOpt3] = useState('');
  const [newOpt4, setNewOpt4] = useState('');
  const [newCorrectOpt, setNewCorrectOpt] = useState('');
  const [newExpl, setNewExpl] = useState('');
  const [newQTopic, setNewQTopic] = useState('');

  // Handle AI Drill Generation through backend Gemini endpoint or fallback
  const handleAIGenerateSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/quiz-drill-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiGenTopic.trim() || 'Calculus & Limits',
          count: Number(aiGenCount) || 5,
          difficulty: aiGenDifficulty,
        }),
      });

      let newDrillQuestions: any[] = [];
      let drillTitle = `${aiGenDifficulty} ${aiGenTopic} Drill`;
      let drillDesc = `Interactive problem set covering ${aiGenTopic} with step-by-step proofs.`;

      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          newDrillQuestions = data.questions;
          if (data.title) drillTitle = data.title;
          if (data.description) drillDesc = data.description;
        }
      }

      if (newDrillQuestions.length === 0) {
        newDrillQuestions = generateClientFallbackQuestions(aiGenTopic, Number(aiGenCount) || 5, aiGenDifficulty);
      }

      setQuestions(newDrillQuestions);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setShowWhiteboardProof(true);
      setShowAIGenerateModal(false);
      showToast(`Generated ${newDrillQuestions.length} new ${aiGenDifficulty} questions with AI!`, 'success');

      if (onUpdate) {
        onUpdate({
          ...featureData,
          title: drillTitle,
          description: drillDesc,
          questions: newDrillQuestions,
          _updatedAt: Date.now(),
        });
      }
    } catch {
      const clientQuestions = generateClientFallbackQuestions(aiGenTopic, Number(aiGenCount) || 5, aiGenDifficulty);
      setQuestions(clientQuestions);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setShowWhiteboardProof(true);
      setShowAIGenerateModal(false);
      showToast(`Generated ${clientQuestions.length} questions for ${aiGenTopic}!`, 'success');

      if (onUpdate) {
        onUpdate({
          ...featureData,
          title: `${aiGenDifficulty} ${aiGenTopic} Drill`,
          questions: clientQuestions,
          _updatedAt: Date.now(),
        });
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Critical Reactivity: Keep local state synced whenever featureData changes in Copilot Studio
  useEffect(() => {
    const freshQuestions = featureData?.config?.questions || featureData?.questions;
    if (freshQuestions && Array.isArray(freshQuestions) && freshQuestions.length > 0) {
      setQuestions([...freshQuestions]);
      setSelectedAnswers({});
      setCurrentQIndex(0);
      setShowWhiteboardProof(true);
    }
  }, [
    featureData?.config?.questions,
    featureData?.questions,
    featureData?._updatedAt,
    featureData?.title,
  ]);

  const activeQuestion = questions[currentQIndex] || questions[0];
  const userSelected = selectedAnswers[currentQIndex];
  const isAnswered = userSelected !== undefined;
  const isCorrect = userSelected === activeQuestion?.correctAnswer;

  const scoreCount = Object.entries(selectedAnswers).filter(
    ([idx, ans]) => ans === questions[Number(idx)]?.correctAnswer
  ).length;

  const handleSelectOption = (opt: string) => {
    if (selectedAnswers[currentQIndex] !== undefined) return;
    const updated = { ...selectedAnswers, [currentQIndex]: opt };
    setSelectedAnswers(updated);
    if (opt === activeQuestion?.correctAnswer) {
      showToast('Correct! Great mathematical precision.', 'success');
    } else {
      showToast('Incorrect. Check the mathematical proof below.', 'warning');
    }
    if (onUpdate) onUpdate({ ...featureData, userAnswers: updated });
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newOpt1.trim() || !newOpt2.trim() || !newCorrectOpt.trim()) {
      showToast('Question text, options, and correct answer are required.', 'warning');
      return;
    }
    const newQ = {
      id: `q-${Date.now()}`,
      question: newQText.trim(),
      options: [newOpt1.trim(), newOpt2.trim(), newOpt3.trim() || 'None of the above', newOpt4.trim() || 'All of the above'],
      correctAnswer: newCorrectOpt.trim(),
      explanation: newExpl.trim() || 'Mathematical verification complete.',
      topic: newQTopic.trim() || 'Mathematics',
    };
    const updated = [...questions, newQ];
    setQuestions(updated);
    setNewQText('');
    setNewOpt1('');
    setNewOpt2('');
    setNewOpt3('');
    setNewOpt4('');
    setNewCorrectOpt('');
    setNewExpl('');
    setShowAddQuestion(false);
    showToast('Custom question added to quiz!', 'success');
    if (onUpdate) onUpdate({ ...featureData, questions: updated });
  };

  // =========================================================================
  // FLASHCARDS STATE & LOGIC

  // =========================================================================
  const initialCards =
    featureData?.config?.cards ||
    featureData?.cards ||
    [
      {
        front: 'Master Theorem Recurrence: T(n) = aT(n/b) + f(n)',
        back: 'Evaluates divide-and-conquer runtimes by comparing f(n) to n^(log_b(a)). Case 1: Poly smaller (O(n^log_b(a))), Case 2: Equal (O(n^log_b(a) * log n)), Case 3: Poly larger (O(f(n))).',
        tag: 'Algorithms',
      },
      {
        front: 'Graph BFS vs DFS Stack/Queue Bounds',
        back: 'BFS queue memory is O(W) where W is maximum width of tree/graph (can be O(V) in dense graphs). DFS stack is O(D) where D is maximum depth of recursion (O(V) in line graphs).',
        tag: 'Data Structures',
      },
      {
        front: 'CAP Theorem Invariant in Distributed Systems',
        back: 'In the presence of a network partition (P), a distributed system can guarantee at most one of Consistency (C) or Availability (A). Never all three simultaneously.',
        tag: 'Systems',
      },
      {
        front: 'B-Tree Node Invariant (Order M)',
        back: 'Every internal node (except root) has at least ceil(M/2) children and at most M children. Keys in each node are strictly sorted for logarithmic lookups.',
        tag: 'Database Theory',
      },
    ];

  const [cards, setCards] = useState<Array<{ front: string; back: string; tag?: string }>>(initialCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<number, boolean>>({});
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    const freshCards = featureData?.config?.cards || featureData?.cards;
    if (freshCards && Array.isArray(freshCards) && freshCards.length > 0) {
      setCards(freshCards);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  }, [featureData?.config?.cards, featureData?.cards]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleToggleMastered = (idx: number) => {
    setMasteredCards((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      showToast(next[idx] ? 'Card marked as mastered!' : 'Card queued for review.', 'info');
      return next;
    });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    const updated = [
      ...cards,
      { front: newFront.trim(), back: newBack.trim(), tag: newTag.trim() || 'Custom' },
    ];
    setCards(updated);
    setNewFront('');
    setNewBack('');
    setNewTag('');
    setShowAddCard(false);
    showToast('New flashcard added to deck!', 'success');
    if (onUpdate) onUpdate({ ...featureData, cards: updated });
  };

  // =========================================================================
  // TIMER / POMODORO STATE & LOGIC
  // =========================================================================
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(3);
  const [ambientSound, setAmbientSound] = useState(false);
  const [focusTask, setFocusTask] = useState('Deep Work: Algorithmic Complexity Review');

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (timerMode === 'focus') {
        setCompletedSessions((prev) => prev + 1);
        showToast('Focus session complete! Time for a short break.', 'success');
        setTimerMode('short_break');
        setTimeLeft(5 * 60);
      } else {
        showToast('Break ended! Ready to focus?', 'info');
        setTimerMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode, showToast]);

  const switchTimerMode = (mode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'short_break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTimerTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const dur = featureData?.config?.duration || featureData?.duration;
    if (dur && typeof dur === 'number') {
      setTimeLeft(dur);
      setIsRunning(false);
    }
  }, [featureData?.config?.duration, featureData?.duration]);

  // =========================================================================
  // CHECKLIST / TASKS STATE & LOGIC
  // =========================================================================
  const initialItems =
    featureData?.config?.items ||
    featureData?.items ||
    [
      { id: '1', text: 'Review asymptotic complexity bounds for BFS and DFS', completed: true, priority: 'High' },
      { id: '2', text: 'Implement cycle detection in directed graphs with color-marking', completed: false, priority: 'High' },
      { id: '3', text: 'Draft 5 quiz questions for tomorrow\'s lab recitation', completed: false, priority: 'Medium' },
      { id: '4', text: 'Verify memory allocation limits on recursion stack', completed: false, priority: 'Low' },
    ];

  const [checklistItems, setChecklistItems] = useState<Array<{ id: string; text: string; completed: boolean; priority: string }>>(
    typeof initialItems[0] === 'string'
      ? initialItems.map((text: string, i: number) => ({ id: `chk-${i}`, text, completed: false, priority: 'Normal' }))
      : initialItems
  );
  const [newItemText, setNewItemText] = useState('');
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const freshItems = featureData?.config?.items || featureData?.items;
    if (freshItems && Array.isArray(freshItems) && freshItems.length > 0) {
      setChecklistItems(
        typeof freshItems[0] === 'string'
          ? freshItems.map((text: string, i: number) => ({ id: `chk-${i}`, text, completed: false, priority: 'Normal' }))
          : freshItems
      );
    }
  }, [featureData?.config?.items, featureData?.items]);

  const handleToggleCheck = (id: string) => {
    const updated = checklistItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updated);
    if (onUpdate) onUpdate({ ...featureData, items: updated });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      priority: 'High',
    };
    const updated = [newItem, ...checklistItems];
    setChecklistItems(updated);
    setNewItemText('');
    showToast('Task milestone added.', 'success');
    if (onUpdate) onUpdate({ ...featureData, items: updated });
  };

  const handleDeleteCheckItem = (id: string) => {
    const updated = checklistItems.filter((i) => i.id !== id);
    setChecklistItems(updated);
    if (onUpdate) onUpdate({ ...featureData, items: updated });
  };

  // =========================================================================
  // RUBRIC STATE & LOGIC
  // =========================================================================
  const initialCriteria =
    featureData?.config?.criteria ||
    featureData?.criteria ||
    [
      { id: 'c1', name: 'Algorithmic Correctness & Invariant Proof', max: 10, weight: 35, desc: 'Solution handles all edge cases, proves recursion termination bounds.' },
      { id: 'c2', name: 'Asymptotic Time & Memory Efficiency', max: 10, weight: 25, desc: 'Optimal big-O bounds, avoiding redundant stack allocations.' },
      { id: 'c3', name: 'Code Modularity & Engineering Quality', max: 10, weight: 20, desc: 'Clean separation of concerns, defensive validation, test coverage.' },
      { id: 'c4', name: 'Technical Defense & Viva Articulation', max: 10, weight: 20, desc: 'Student articulates rationale clearly under questioning.' },
    ];

  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    initialCriteria.forEach((c: any) => {
      initial[c.id || c.name] = Math.round(c.max * 0.85);
    });
    return initial;
  });
  const [candidateName, setCandidateName] = useState('Alex Vance (CS-402)');

  useEffect(() => {
    const freshCriteria = featureData?.config?.criteria || featureData?.criteria;
    if (freshCriteria && Array.isArray(freshCriteria) && freshCriteria.length > 0) {
      const initial: Record<string, number> = {};
      freshCriteria.forEach((c: any) => {
        initial[c.id || c.name] = Math.round(c.max * 0.85);
      });
      setCriteriaScores(initial);
    }
  }, [featureData?.config?.criteria, featureData?.criteria]);

  const totalWeightedScore = Math.round(
    initialCriteria.reduce((sum: number, c: any) => {
      const score = criteriaScores[c.id || c.name] || 0;
      const weighted = (score / c.max) * c.weight;
      return sum + weighted;
    }, 0)
  );

  const getRubricGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+ (Distinction)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 80) return { grade: 'A (Commended)', color: 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30' };
    if (score >= 70) return { grade: 'B (Proficient)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    if (score >= 60) return { grade: 'C (Developing)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { grade: 'Remediation Required', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  // =========================================================================
  // GPA / TARGET CALCULATOR STATE & LOGIC
  // =========================================================================
  const [courses, setCourses] = useState([
    { id: 'c1', name: 'Data Structures & Algorithms', credits: 4, gradePoint: 4.0 },
    { id: 'c2', name: 'Computer Systems Architecture', credits: 4, gradePoint: 3.7 },
    { id: 'c3', name: 'Discrete Mathematics', credits: 3, gradePoint: 3.3 },
    { id: 'c4', name: 'Operating Systems & Concurrency', credits: 4, gradePoint: 3.7 },
  ]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newCourseGrade, setNewCourseGrade] = useState(4.0);

  useEffect(() => {
    const freshCourses = featureData?.config?.courses || featureData?.courses;
    if (freshCourses && Array.isArray(freshCourses) && freshCourses.length > 0) {
      setCourses(freshCourses);
    }
  }, [featureData?.config?.courses, featureData?.courses]);

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const calculatedGPA =
    totalCredits > 0
      ? (courses.reduce((acc, c) => acc + c.credits * c.gradePoint, 0) / totalCredits).toFixed(2)
      : '0.00';

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    const added = [
      ...courses,
      {
        id: `course-${Date.now()}`,
        name: newCourseName.trim(),
        credits: Number(newCourseCredits) || 3,
        gradePoint: Number(newCourseGrade) || 4.0,
      },
    ];
    setCourses(added);
    setNewCourseName('');
    showToast('Course added to target calculator.', 'success');
  };

  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // =========================================================================
  // RENDER SELECTION
  // =========================================================================
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-3xl border bg-gradient-to-br from-purple-950/40 via-indigo-950/20 to-[#0A0E18] border-purple-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                {toolType === 'quiz' && <HelpCircle className="w-4 h-4" />}
                {toolType === 'flashcards' && <Brain className="w-4 h-4" />}
                {toolType === 'timer' && <Clock className="w-4 h-4" />}
                {toolType === 'checklist' && <ListTodo className="w-4 h-4" />}
                {toolType === 'rubric' && <Award className="w-4 h-4" />}
                {toolType === 'calculator' && <Calculator className="w-4 h-4" />}
                {!['quiz', 'flashcards', 'timer', 'checklist', 'rubric', 'calculator'].includes(toolType) && (
                  <Sparkles className="w-4 h-4" />
                )}
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-purple-400 uppercase">
                Autonomous Cockpit Feature · Live Sandbox
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active & Reactive
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">{title}</h1>
            <p className="text-xs text-slate-300 max-w-xl">{description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              Personalized User Sandbox
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 0. INTERACTIVE QUIZ & MATH DRILL VIEW                               */}
      {/* =================================================================== */}
      {toolType === 'quiz' && (
        <div className="space-y-5">
          {/* Top Status & Score Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-slate-400">
                Question <span className="font-bold text-white">{currentQIndex + 1}</span> of{' '}
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Score: {scoreCount} / {Object.keys(selectedAnswers).length}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activeQuestion?.topic || 'Mathematics'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedAnswers({});
                  setCurrentQIndex(0);
                  showToast('Quiz session reset.', 'info');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Drill</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddQuestion(!showAddQuestion)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-mono flex items-center gap-1.5 border border-purple-500/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAIGenerateModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-purple-600 hover:from-[#38bdf8] hover:to-purple-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.35)] cursor-pointer active:scale-95 transition-all"
                title="Open AI Question Generator Window"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>AI Generate Drill</span>
              </button>
            </div>
          </div>

          {/* AI Question Generator Modal Window */}
          {showAIGenerateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="relative w-full max-w-xl p-6 rounded-3xl bg-[#0B0F19] border border-purple-500/50 text-white shadow-2xl space-y-5">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-purple-500/20 text-[#00F0FF] border border-[#00F0FF]/40 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#00F0FF]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                        <span>AI Drill & Question Generator</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Gemini 3.8
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        Configure questions, difficulty, and topic to synthesize an instant whiteboard drill.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAIGenerateModal(false)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAIGenerateSubmit} className="space-y-4">
                  {/* Topic / Concept Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 block">
                      Topic or Mathematical Field:
                    </label>
                    <input
                      type="text"
                      value={aiGenTopic}
                      onChange={(e) => setAiGenTopic(e.target.value)}
                      placeholder="e.g. Trigonometric Limits, Derivatives, Linear Algebra..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-[#00F0FF] focus:outline-hidden"
                      required
                    />

                    {/* Quick Topic Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'Trigonometric Limits',
                        'Calculus Derivatives',
                        'Definite Integrals',
                        'Linear Algebra Matrices',
                        'Probability & Statistics',
                        'Everyday Applied Math',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setAiGenTopic(chip)}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            aiGenTopic === chip
                              ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 block">
                      Number of Questions to Generate:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 5, 8, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAiGenCount(num)}
                          className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                            aiGenCount === num
                              ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                          }`}
                        >
                          {num} Questions
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Level Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 block">
                      Difficulty Level:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { level: 'Beginner', desc: 'Foundational concepts, intuition & visual rules' },
                        { level: 'Intermediate', desc: 'Standard university problem sets & limit rules' },
                        { level: 'Advanced', desc: 'Multi-step derivations & algebraic proofs' },
                        { level: 'Olympiad', desc: 'Rigorous competition invariants & deep theory' },
                      ].map(({ level, desc }) => {
                        const isSelected = aiGenDifficulty === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setAiGenDifficulty(level as any)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-mono font-bold text-white flex items-center justify-between">
                              <span>{level}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#00F0FF]" />}
                            </span>
                            <span className="text-[10px] font-sans leading-tight line-clamp-2">
                              {desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={() => setShowAIGenerateModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isGeneratingAI}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-purple-600 hover:from-[#38bdf8] hover:to-purple-500 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Synthesizing Questions with Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-black" />
                          <span>Generate {aiGenCount} Questions with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Question Drawer Form */}
          {showAddQuestion && (
            <form onSubmit={handleAddQuestionSubmit} className="p-4 rounded-2xl border border-purple-500/40 bg-purple-950/20 space-y-3">
              <h4 className="text-xs font-mono font-bold text-purple-300">Add New Math / Curriculum Question</h4>
              <textarea
                placeholder="Question Statement (e.g. Evaluate the limit: lim_{x -> 0} sin(5x)/2x)..."
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:border-purple-500 focus:outline-hidden"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option A..."
                  value={newOpt1}
                  onChange={(e) => setNewOpt1(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Option B..."
                  value={newOpt2}
                  onChange={(e) => setNewOpt2(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Option C..."
                  value={newOpt3}
                  onChange={(e) => setNewOpt3(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Option D..."
                  value={newOpt4}
                  onChange={(e) => setNewOpt4(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Correct Answer (must match one option exactly)..."
                  value={newCorrectOpt}
                  onChange={(e) => setNewCorrectOpt(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Topic / Tag (e.g. Calculus Limits)..."
                  value={newQTopic}
                  onChange={(e) => setNewQTopic(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
                />
              </div>
              <textarea
                placeholder="Step-by-Step Mathematical Explanation & Proof..."
                value={newExpl}
                onChange={(e) => setNewExpl(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:border-purple-500 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestion(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-mono font-bold cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          )}

          {/* Interactive Question Card */}
          <div className={`p-6 md:p-8 rounded-3xl border transition-all ${isDark ? 'bg-[#0B0F19] border-white/10' : 'bg-white border-slate-200'} space-y-6 shadow-2xl`}>
            {/* Question Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                  Problem {currentQIndex + 1}
                </span>
                {isAnswered && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {isCorrect ? 'Correct +1' : 'Incorrect'}
                  </span>
                )}
              </div>
              <WhiteboardMathDisplay text={activeQuestion?.question} />
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {(activeQuestion?.options || []).map((opt: string, optIdx: number) => {
                const isThisSelected = userSelected === opt;
                const isThisCorrect = opt === activeQuestion?.correctAnswer;

                let optStyles = 'bg-white/5 hover:bg-white/10 border-white/10 text-white';

                if (isAnswered) {
                  if (isThisCorrect) {
                    optStyles = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                  } else if (isThisSelected) {
                    optStyles = 'bg-rose-500/20 border-rose-500/50 text-rose-200 font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                  } else {
                    optStyles = 'bg-white/[0.02] border-white/5 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border text-left font-mono text-xs transition-all flex items-center justify-between group cursor-pointer ${optStyles} disabled:cursor-default`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-bold text-[10px] text-slate-300">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="font-sans text-xs md:text-sm">{opt}</span>
                    </div>

                    {isAnswered && isThisCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isThisSelected && !isThisCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Step-by-Step Whiteboard Walkthrough Card */}
            {activeQuestion?.explanation && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowWhiteboardProof(!showWhiteboardProof)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-mono text-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{showWhiteboardProof ? 'Collapse Whiteboard Proof' : 'View Step-by-Step Whiteboard Proof'}</span>
                  </button>

                  <span className="text-[11px] font-mono text-slate-400">
                    Topic: <strong className="text-white">{activeQuestion.topic || 'Calculus & Limits'}</strong>
                  </span>
                </div>

                {(showWhiteboardProof || isAnswered) && (
                  <WhiteboardExplanationDisplay explanation={activeQuestion.explanation} />
                )}
              </div>
            )}

            {/* Bottom Nav / Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentQIndex === questions.length - 1}
                onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. FLASHCARDS TOOL VIEW                                             */}
      {/* =================================================================== */}
      {toolType === 'flashcards' && (
        <div className="space-y-5">
          {/* Deck Overview & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-slate-400">
                Card <span className="font-bold text-white">{currentCardIndex + 1}</span> of{' '}
                <span className="font-bold text-white">{cards.length}</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{Object.values(masteredCards).filter(Boolean).length} Mastered</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const shuffled = [...cards].sort(() => Math.random() - 0.5);
                  setCards(shuffled);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  showToast('Deck shuffled!', 'info');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddCard(!showAddCard)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-mono flex items-center gap-1.5 border border-purple-500/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>
          </div>

          {/* Add Card Drawer */}
          {showAddCard && (
            <form onSubmit={handleAddCard} className="p-4 rounded-2xl border border-purple-500/40 bg-purple-950/20 space-y-3">
              <h4 className="text-xs font-mono font-bold text-purple-300">Add New Invariant Card</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Card Front (Question / Prompt)..."
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:border-purple-500 focus:outline-hidden"
                  required
                />
                <input
                  type="text"
                  placeholder="Topic / Category Tag (e.g. Graph Theory)..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:border-purple-500 focus:outline-hidden"
                />
              </div>
              <textarea
                placeholder="Card Back (Deep Answer, Formal Invariant & Explanation)..."
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:border-purple-500 focus:outline-hidden"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-mono font-bold cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          )}

          {/* Interactive Flip Card */}
          {cards.length > 0 && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`p-8 md:p-12 min-h-[300px] rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-2xl relative select-none ${
                isFlipped
                  ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border-purple-500/50 text-white'
                  : isDark
                  ? 'bg-[#0B0F19] hover:bg-white/[0.02] border-white/15 text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase tracking-wider font-bold">
                  {cards[currentCardIndex]?.tag || 'Core Concept'}
                </span>

                <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                  {isFlipped ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5 text-[#00F0FF]" />}
                  <span>{isFlipped ? 'Answer Revealed · Click to flip front' : 'Click card to flip answer'}</span>
                </span>
              </div>

              {/* Card Center Content */}
              <div className="my-8 text-center space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  {isFlipped ? 'EXPLANATION & PROOF' : 'QUESTION & TARGET CONCEPT'}
                </span>
                <p className={`font-sans leading-relaxed ${isFlipped ? 'text-base md:text-lg text-purple-100 font-medium' : 'text-lg md:text-2xl font-bold'}`}>
                  {isFlipped ? cards[currentCardIndex]?.back : cards[currentCardIndex]?.front}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleMastered(currentCardIndex)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    masteredCards[currentCardIndex]
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{masteredCards[currentCardIndex] ? 'Mastered' : 'Mark as Mastered'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextCard}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. TIMER / POMODORO TOOL VIEW                                       */}
      {/* =================================================================== */}
      {toolType === 'timer' && (
        <div className="space-y-6">
          <div className="p-8 md:p-12 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#0F1424] to-[#080B14] shadow-2xl text-center space-y-6">
            {/* Presets */}
            <div className="inline-flex p-1.5 rounded-2xl bg-black/40 border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => switchTimerMode('focus')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  timerMode === 'focus'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Focus Sprint (25m)
              </button>
              <button
                type="button"
                onClick={() => switchTimerMode('short_break')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  timerMode === 'short_break'
                    ? 'bg-emerald-500 text-black shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                type="button"
                onClick={() => switchTimerMode('long_break')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  timerMode === 'long_break'
                    ? 'bg-[#00F0FF] text-black shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Main Clock Readout */}
            <div className="py-4">
              <div className="text-6xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                {formatTimerTime(timeLeft)}
              </div>
              <p className="text-xs font-mono text-purple-300 mt-2 uppercase tracking-widest">
                {timerMode === 'focus' ? 'Deep Flow State · Do Not Disturb' : 'Restoration Interval'}
              </p>
            </div>

            {/* Play/Pause/Reset Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-3.5 rounded-2xl font-mono text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xl transition-all active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isRunning ? 'Pause Sprint' : 'Start Focus'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchTimerMode(timerMode)}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAmbientSound(!ambientSound);
                  showToast(!ambientSound ? 'Simulating Lo-Fi Alpha White Noise' : 'Ambient noise muted', 'info');
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  ambientSound
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
                title="Toggle Ambient Focus Noise"
              >
                {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Session Stats Bar */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Completed Sprints: <strong className="text-white">{completedSessions}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00F0FF]" />
                <span>Total Focus Time: <strong className="text-white">{completedSessions * 25}m</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. CHECKLIST / TASK BOARD VIEW                                      */}
      {/* =================================================================== */}
      {toolType === 'checklist' && (
        <div className="space-y-4">
          {/* Add Item Input Form */}
          <form onSubmit={handleAddChecklistItem} className="flex gap-2">
            <input
              type="text"
              placeholder="Add next tactical milestone or task item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:border-purple-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* List of Tasks */}
          <div className="space-y-2">
            {checklistItems.map((item, chkIdx) => (
              <div
                key={`${item.id || 'chk'}-${chkIdx}`}
                onClick={() => handleToggleCheck(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  item.completed
                    ? 'bg-white/[0.01] border-white/5 opacity-60'
                    : isDark
                    ? 'bg-[#0B0F19] hover:bg-white/[0.02] border-white/10'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      item.completed
                        ? 'bg-purple-500 border-purple-500 text-white'
                        : 'border-white/30 group-hover:border-purple-400'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-xs font-mono ${
                      item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                      item.priority === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCheckItem(item.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] text-xs font-mono text-slate-400">
            <span>
              {checklistItems.filter((i) => i.completed).length} of {checklistItems.length} completed
            </span>
            <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{
                  width: `${checklistItems.length > 0 ? (checklistItems.filter((i) => i.completed).length / checklistItems.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. RUBRIC / VIVA SCORING TOOL VIEW                                  */}
      {/* =================================================================== */}
      {toolType === 'rubric' && (
        <div className="space-y-5">
          {/* Candidate & Total Banner */}
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                Evaluation Candidate
              </span>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="bg-transparent border-b border-purple-400/40 text-white font-mono font-bold text-sm focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">Weighted Score</div>
                <div className="text-2xl font-black font-mono text-white">{totalWeightedScore} / 100</div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${getRubricGrade(totalWeightedScore).color}`}>
                {getRubricGrade(totalWeightedScore).grade}
              </div>
            </div>
          </div>

          {/* Criteria Sliders */}
          <div className="space-y-3">
            {initialCriteria.map((c: any, cIdx: number) => {
              const currentScore = criteriaScores[c.id || c.name] ?? Math.round(c.max * 0.8);
              return (
                <div
                  key={`${c.id || c.name || 'crit'}-${cIdx}`}
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-[#0B0F19] border-white/10' : 'bg-white border-slate-200'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white">{c.name}</h4>
                      <p className="text-[11px] text-slate-400">{c.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {currentScore} / {c.max} pts
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Weight: {c.weight}%
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={c.max}
                    step={1}
                    value={currentScore}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCriteriaScores((prev) => ({ ...prev, [c.id || c.name]: val }));
                    }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                showToast(`Rubric evaluation recorded for ${candidateName}: ${totalWeightedScore}%`, 'success');
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-mono text-xs font-bold cursor-pointer shadow-lg"
            >
              Finalize & Commit Evaluation
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. GPA / GRADE TARGET CALCULATOR                                    */}
      {/* =================================================================== */}
      {toolType === 'calculator' && (
        <div className="space-y-5">
          {/* Score Header */}
          <div className="p-6 rounded-2xl border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-center space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF]">
              Projected Term Cumulative GPA
            </span>
            <div className="text-5xl font-black font-mono text-white">{calculatedGPA}</div>
            <p className="text-xs font-mono text-slate-300">
              Total Credit Load: {totalCredits} Contact Credits
            </p>
          </div>

          {/* Courses Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="p-3">Course Title</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Grade Point</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((c, cIdx) => (
                  <tr key={`${c.id || 'crs'}-${cIdx}`}>
                    <td className="p-3 text-white font-medium">{c.name}</td>
                    <td className="p-3 text-slate-300">{c.credits}</td>
                    <td className="p-3 text-emerald-400 font-bold">{c.gradePoint.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(c.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Course Form */}
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Course title..."
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="md:col-span-2 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
              required
            />
            <input
              type="number"
              placeholder="Credits (1-6)"
              min={1}
              max={6}
              value={newCourseCredits}
              onChange={(e) => setNewCourseCredits(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-mono text-xs font-bold cursor-pointer"
            >
              Add Course
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
