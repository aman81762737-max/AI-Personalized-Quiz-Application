import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  BookOpen,
  Target,
  BarChart2,
  Lock,
  Layers,
  CheckCircle2,
  GraduationCap,
  FileCheck2,
  Bot,
  Zap,
  Building2,
  School,
  IdCard,
  Users,
  Award,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  KeyRound,
  Mail,
  Sparkle,
  Check,
  Compass,
  Cpu,
  Activity,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ACCREDITED_INSTITUTIONS } from '../../lib/institutions';
import { NeuralMeshCanvas } from '../motion/NeuralMeshCanvas';

interface FaqItem {
  id: string;
  category: 'verification' | 'rbac' | 'ai-assessment';
  categoryLabel: string;
  question: string;
  answer: string;
  icon: React.ElementType;
  badge: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-domain-verification',
    category: 'verification',
    categoryLabel: 'Institutional Verification',
    question: 'How does dynamic institutional email verification work without hardcoded .edu limits?',
    answer: 'Higher education institutions globally operate on diverse domain structures (.edu, .ac.in, .edu.in, .ac.uk, .ernet.in, or private institutional campus subdomains). Our dynamic verification engine validates accredited institutional registries and academic domain patterns without restrictive US-only hardcoding.',
    icon: Building2,
    badge: 'Institutional SSO',
  },
  {
    id: 'faq-roles-overview',
    category: 'rbac',
    categoryLabel: 'Role-Based Access',
    question: 'What distinct capabilities do Students, Teachers, and Administrators have?',
    answer: 'The platform enforces strict role isolation: Students access personalized mastery roadmaps, practice drills, and secure lock-mode exam rooms. Faculty upload syllabus materials, generate Bloom-calibrated assessments, and review student progress. Administrators govern institution settings and integrity audit logs.',
    icon: ShieldCheck,
    badge: 'Strict RBAC',
  },
  {
    id: 'faq-document-to-exam',
    category: 'ai-assessment',
    categoryLabel: 'AI Assessment',
    question: 'How does the Document-to-Assessment engine decompose syllabus materials?',
    answer: 'Educators upload curriculum documents, lecture slides, or textbook chapters. The multimodal intelligence engine decomposes the text into core concepts and Bloom cognitive tiers, generating high-validity multiple choice, numerical, and conceptual items with calibrated distractors and explanations.',
    icon: BrainCircuit,
    badge: 'Gemini Engine',
  },
  {
    id: 'faq-lockdown-proctoring',
    category: 'ai-assessment',
    categoryLabel: 'Proctored Security',
    question: 'What happens during lock-mode proctored assessments if a student switches tabs?',
    answer: 'The exam runtime initiates full-screen focus containment. Any tab blur, window switch, or keyboard shortcut violation triggers an instant warning banner, records a timestamped incident flag in the live proctor telemetry log, and automatically submits the paper upon repeated breaches.',
    icon: Lock,
    badge: 'Focus Sentinel',
  },
  {
    id: 'faq-socratic-remediation',
    category: 'ai-assessment',
    categoryLabel: 'Socratic Tutoring',
    question: 'How does AI-guided Socratic tutoring help students bridge identified knowledge gaps?',
    answer: 'When an assessment completes, the AI pinpoints precise concept deficiencies and builds an adaptive recovery roadmap. Rather than giving away correct answers, our interactive Socratic tutor engages students with conceptual hints, structured step-by-step guidance, and targeted follow-up practice drills.',
    icon: Bot,
    badge: 'Socratic Remediation',
  },
];

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenStudentRegister: () => void;
  onOpenTeacherRegister: () => void;
  onNavigateDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenStudentRegister,
  onOpenTeacherRegister,
  onNavigateDashboard,
}) => {
  const { isDark } = useTheme();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<'all' | 'verification' | 'rbac' | 'ai-assessment'>('all');

  const filteredFaqs =
    selectedFaqCategory === 'all'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === selectedFaqCategory);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={`${isDark ? 'bg-[#07090E] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-black'} min-h-screen transition-colors font-sans selection:bg-[#00F0FF]/30 selection:text-white`}>
      {/* 1. HERO SECTION WITH 3D NEURAL MESH */}
      <section className={`relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {/* Living 3D Neural Mesh Canvas */}
        <div className={`absolute inset-0 z-0 ${isDark ? 'opacity-80' : 'opacity-40'} pointer-events-auto`}>
          <NeuralMeshCanvas
            isDark={isDark}
            particleCount={isDark ? 80 : 50}
            connectionDistance={isDark ? 130 : 95}
            accentColor={isDark ? "#00F0FF" : "#2563EB"}
            secondaryColor={isDark ? "#10B981" : "#6366F1"}
          />
        </div>

        {/* Ambient Radial Deep Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] ${
          isDark
            ? 'bg-gradient-to-tr from-[#00F0FF]/15 to-[#10B981]/15 blur-[140px]'
            : 'bg-gradient-to-tr from-blue-400/8 to-indigo-300/8 blur-[130px]'
        } rounded-full pointer-events-none`} />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Institutional Trust Metadata - Clean Unboxed Zero-Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-center gap-2.5 text-xs font-semibold ${isDark ? 'text-[#00F0FF]' : 'text-slate-800'} mb-6 tracking-wide`}
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>140+ Accredited Colleges</span>
            <span className={isDark ? "text-white/30" : "text-slate-400"} aria-hidden="true">·</span>
            <span>Institutional SSO Active</span>
            <span className={isDark ? "text-white/30" : "text-slate-400"} aria-hidden="true">·</span>
            <span className={isDark ? "text-white/70" : "text-slate-600"}>Real-Time Socratic Remediation</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold ${isDark ? 'text-white' : 'text-slate-950'} tracking-tight leading-[1.08] max-w-4xl`}
            style={{ textWrap: 'balance' }}
          >
            Intelligent Multi-Campus Assessment & Living AI Tutoring.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mt-6 text-base sm:text-lg ${isDark ? 'text-slate-300' : 'text-slate-800'} max-w-2xl leading-relaxed font-medium`}
          >
            Decompose curriculum documents into Bloom’s-calibrated exam questions, conduct secure proctored lock-mode assessments, and guide students with autonomous, Socratic reasoning roadmaps.
          </motion.p>

          {/* Tactical Action Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_30px_rgba(0,240,255,0.35)] hover:shadow-[0_0_45px_rgba(0,240,255,0.6)] cursor-pointer active:scale-95"
            >
              <span>Launch Institutional Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenStudentRegister}
              className={`inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold ${
                isDark
                  ? 'text-white bg-slate-900/80 hover:bg-slate-800 border-white/15 hover:border-[#10B981]/60'
                  : 'text-black bg-white hover:bg-slate-50 border-slate-300 shadow-sm'
              } border rounded-xl transition-all backdrop-blur-md cursor-pointer active:scale-95`}
            >
              <GraduationCap className="w-4 h-4 text-[#10B981]" />
              <span>Student Registration</span>
            </button>

            <button
              onClick={onOpenTeacherRegister}
              className={`inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold ${
                isDark
                  ? 'text-white bg-slate-900/80 hover:bg-slate-800 border-white/15 hover:border-[#00F0FF]/60'
                  : 'text-black bg-white hover:bg-slate-50 border-slate-300 shadow-sm'
              } border rounded-xl transition-all backdrop-blur-md cursor-pointer active:scale-95`}
            >
              <BookOpen className="w-4 h-4 text-[#00F0FF]" />
              <span>Faculty Portal</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. HIGH-CONTRAST TELEMETRY RIBBON WITH AWARD-WINNING SCROLL REVEALS */}
      <section className={`border-b ${isDark ? 'border-white/10 bg-[#0A0D14]' : 'border-slate-200 bg-slate-100/80'} py-10 relative overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                border: 'border-[#00F0FF]',
                metric: '14,820+',
                title: 'Verified Proctored Exams',
                sub: 'Zero integrity breaches',
                subColor: isDark ? 'text-[#00F0FF]' : 'text-blue-700 font-semibold',
                delay: 0,
              },
              {
                border: 'border-[#10B981]',
                metric: '99.4%',
                title: 'Proctor Lock Integrity',
                sub: 'Real-time tab monitoring',
                subColor: isDark ? 'text-[#10B981]' : 'text-emerald-700 font-semibold',
                delay: 0.1,
              },
              {
                border: 'border-indigo-500',
                metric: '64,200+',
                title: 'Bloom-Calibrated Items',
                sub: 'From PDF syllabus files',
                subColor: isDark ? 'text-indigo-300' : 'text-indigo-700 font-semibold',
                delay: 0.2,
              },
              {
                border: 'border-amber-500',
                metric: '< 180ms',
                title: 'Socratic AI Latency',
                sub: 'Streaming adaptive tutor',
                subColor: isDark ? 'text-amber-300' : 'text-amber-700 font-semibold',
                delay: 0.3,
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: stat.delay, ease: [0.16, 1, 0.3, 1] }}
                className={`border-l-2 ${stat.border} pl-4 group transition-transform duration-300 hover:translate-x-1`}
              >
                <div className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} font-mono tabular-nums tracking-tight`}>
                  {stat.metric}
                </div>
                <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'} mt-1`}>
                  {stat.title}
                </div>
                <div className={`text-[11px] ${stat.subColor} mt-0.5`}>
                  {stat.sub}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COGNITIVE ENGINE ARCHITECTURE (Awwwards-Inspired Viewport Reveals) */}
      <section className={`py-24 border-b ${isDark ? 'border-white/10 bg-[#07090E]' : 'border-slate-200 bg-white'} relative overflow-hidden`}>
        {/* Subtle background glow */}
        <div className={`absolute top-1/3 right-1/4 w-[480px] h-[360px] ${isDark ? 'bg-[#00F0FF]/5 blur-[120px]' : 'bg-blue-400/5 blur-[100px]'} rounded-full pointer-events-none`} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className={`text-xs font-mono font-semibold ${isDark ? 'text-[#00F0FF]' : 'text-slate-800'} tracking-wider uppercase`}>
              01. Cognitive Engine Architecture
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-white' : 'text-black'} mt-2 tracking-tight`}>
              Designed for Academic Rigor & Dynamic Mastery.
            </h2>
            <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'} leading-relaxed`}>
              Every component works seamlessly as a unified cognitive stack, bridging curriculum inputs directly with adaptive student outputs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`p-8 rounded-2xl ${isDark ? 'bg-slate-900/60 border-white/10 hover:border-[#00F0FF]/50' : 'bg-slate-50 border-slate-200 hover:border-blue-400 shadow-sm'} border transition-all duration-300 group backdrop-blur-md relative overflow-hidden`}
            >
              <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30' : 'bg-blue-50 border-blue-200'} border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all`}>
                <BrainCircuit className="w-6 h-6 text-[#00F0FF]" />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>Multimodal Document Decomposition</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-700'} leading-relaxed mb-6`}>
                Directly parses course textbooks, research papers, and slides. Automatically structures topics into Remember, Understand, Apply, and Analyze cognitive tiers.
              </p>
              <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-700 border-slate-200'} space-y-1.5 border-t pt-4`}>
                <div className="flex justify-between">
                  <span>Input: PDF / DOCX / Text</span>
                  <span className={`${isDark ? 'text-[#00F0FF]' : 'text-blue-700 font-bold'}`}>Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Calibration: Bloom 6-Tier</span>
                  <span className={`${isDark ? 'text-[#10B981]' : 'text-emerald-700 font-bold'}`}>Active</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`p-8 rounded-2xl ${isDark ? 'bg-slate-900/60 border-white/10 hover:border-[#10B981]/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-400 shadow-sm'} border transition-all duration-300 group backdrop-blur-md relative overflow-hidden`}
            >
              <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-emerald-50 border-emerald-200'} border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all`}>
                <ShieldCheck className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>Lock-Down Focus Sentinel</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-700'} leading-relaxed mb-6`}>
                Hardware-accelerated viewport containment. Automatically detects window unfocus, split screens, clipboard shortcuts, and records verified audit trails.
              </p>
              <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-700 border-slate-200'} space-y-1.5 border-t pt-4`}>
                <div className="flex justify-between">
                  <span>Containment: Fullscreen Lock</span>
                  <span className={`${isDark ? 'text-[#10B981]' : 'text-emerald-700 font-bold'}`}>Enforced</span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Stream: Telemetry</span>
                  <span className={`${isDark ? 'text-[#00F0FF]' : 'text-blue-700 font-bold'}`}>Live</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`p-8 rounded-2xl ${isDark ? 'bg-slate-900/60 border-white/10 hover:border-indigo-400/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-400 shadow-sm'} border transition-all duration-300 group backdrop-blur-md relative overflow-hidden`}
            >
              <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'} border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all`}>
                <Bot className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>Autonomous Socratic Remediation</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-700'} leading-relaxed mb-6`}>
                Personalized weak-concept decomposition. Delivers targeted hints, step-by-step guidance, and diagnostic drill generation tailored to student performance.
              </p>
              <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-700 border-slate-200'} space-y-1.5 border-t pt-4`}>
                <div className="flex justify-between">
                  <span>Recovery Roadmap: 5-Step</span>
                  <span className={`${isDark ? 'text-indigo-400' : 'text-indigo-700 font-bold'}`}>Dynamic</span>
                </div>
                <div className="flex justify-between">
                  <span>Chat Engine: Gemini 2.5</span>
                  <span className={`${isDark ? 'text-[#10B981]' : 'text-emerald-700 font-bold'}`}>Synced</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className={`py-24 border-b ${isDark ? 'border-white/10 bg-[#07090E]' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <span className={`text-xs font-mono font-semibold ${isDark ? 'text-[#00F0FF]' : 'text-slate-800'} tracking-wider uppercase`}>
              02. Knowledge Base & Institutional FAQ
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-white' : 'text-black'} mt-2 tracking-tight`}>
              Frequently Asked Questions
            </h2>
            <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'} leading-relaxed`}>
              Clear answers on email verification, role boundaries, and AI assessment integrity.
            </p>
          </motion.div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'verification', label: 'Institutional Verification' },
              { id: 'rbac', label: 'Role-Based Access' },
              { id: 'ai-assessment', label: 'AI Assessment & Proctoring' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedFaqCategory(cat.id as any)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  selectedFaqCategory === cat.id
                    ? 'bg-[#00F0FF] text-black font-bold'
                    : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-white/10' : 'bg-slate-100 text-slate-800 hover:text-black border border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              const Icon = faq.icon;
              return (
                <motion.div
                  key={`${faq.id || 'faq'}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-slate-200 bg-slate-50/90 shadow-xs'} overflow-hidden backdrop-blur-md transition-all hover:border-[#00F0FF]/40`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className={`w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100/80'} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#00F0FF] shrink-0" />
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#00F0FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className={`px-6 pb-5 pt-1 text-xs ${isDark ? 'text-slate-300 border-white/5' : 'text-slate-700 border-slate-200'} leading-relaxed border-t`}>
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. TACTICAL FOOTER */}
      <footer className={`py-12 ${isDark ? 'bg-[#05070A] border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-700'} border-t text-xs`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className={`font-bold ${isDark ? 'text-white' : 'text-black'} text-sm tracking-tight`}>AI Institutional Assessment</span>
            <span className={isDark ? 'text-white/20' : 'text-slate-400'}>·</span>
            <span>Accredited Academic Operating System</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onOpenLogin} className={`${isDark ? 'hover:text-white' : 'hover:text-black'} transition-colors cursor-pointer font-medium`}>
              Portal Sign In
            </button>
            <button onClick={onOpenStudentRegister} className={`${isDark ? 'hover:text-white' : 'hover:text-black'} transition-colors cursor-pointer font-medium`}>
              Student Register
            </button>
            <button onClick={onOpenTeacherRegister} className={`${isDark ? 'hover:text-white' : 'hover:text-black'} transition-colors cursor-pointer font-medium`}>
              Faculty Register
            </button>
          </div>
          <div className={`font-mono text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-600'}`}>
            SYSTEM STATUS: 100% OPERATIONAL
          </div>
        </div>
      </footer>
    </div>
  );
};
