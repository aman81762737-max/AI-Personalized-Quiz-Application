import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  X,
  Printer,
  ChevronDown,
  ChevronUp,
  Brain,
  Target,
  ArrowRight,
  History,
  Trash2,
  Layers,
  HelpCircle,
  Download,
  ArrowLeft,
  FileText,
  Activity,
} from 'lucide-react';
import { aiService, QuickNotesResult } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { subscribeQuickNotes, saveQuickNoteToCloud } from '../../services/cloudSyncService';

interface SavedNoteEntry {
  id: string;
  topic: string;
  savedAt: string;
  notes: QuickNotesResult;
}

interface QuickNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  role?: 'student' | 'teacher';
  weakTopics?: string[];
  onStartPractice?: (topic: string) => void;
  autoGenerate?: boolean;
}

export const QuickNotesModal: React.FC<QuickNotesModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
  role = 'student',
  weakTopics = [],
  onStartPractice,
  autoGenerate = false,
}) => {
  const { userProfile, studentProfile } = useAuth();
  const { showToast } = useToast();

  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState('Computer Science & Engineering');
  const [notes, setNotes] = useState<QuickNotesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Practice question interactivity in reader
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});

  // History storage & Cloud sync
  const [history, setHistory] = useState<SavedNoteEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ai_quick_notes_history_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeQuickNotes(userProfile?.userId || 'default_user', (remoteNotes) => {
      if (Array.isArray(remoteNotes) && remoteNotes.length > 0) {
        setHistory(remoteNotes);
      }
    });
    return () => unsub();
  }, [isOpen, userProfile?.userId]);

  // Calculate live Atom AI telemetry for the entered topic
  const getAtomAITelemetry = (targetTopic: string) => {
    const clean = targetTopic.trim().toLowerCase();
    const isWeak = (studentProfile?.weaknesses || weakTopics || []).some((w) =>
      clean.includes(w.toLowerCase()) || w.toLowerCase().includes(clean)
    );
    const isStrong = (studentProfile?.strengths || []).some((s) =>
      clean.includes(s.toLowerCase()) || s.toLowerCase().includes(clean)
    );
    const overall = studentProfile?.overallPerformance || 70;

    if (isWeak) {
      return {
        level: 'Foundational Remediation (Atom AI detected struggle in this topic)',
        score: Math.min(55, Math.max(35, overall - 20)),
        badge: 'Priority Remediation',
        badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        focusWeakAreas: true,
      };
    }
    if (isStrong) {
      return {
        level: 'Advanced Synthesis (Atom AI verified strong conceptual mastery)',
        score: Math.max(88, overall),
        badge: 'Mastery Reinforcement',
        badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        focusWeakAreas: false,
      };
    }
    return {
      level: 'Adaptive High-Yield (Atom AI calibrated to student current baseline)',
      score: overall > 0 ? overall : 72,
      badge: 'Balanced Adaptive',
      badgeColor: 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30',
      focusWeakAreas: false,
    };
  };

  // Close on Escape & Lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sync initial topic when opening
  useEffect(() => {
    if (isOpen) {
      if (initialTopic) {
        setTopic(initialTopic);
      }
      if (autoGenerate && initialTopic) {
        handleGenerate(initialTopic);
      }
    } else {
      setIsReaderOpen(false);
    }
  }, [isOpen, initialTopic, autoGenerate]);

  const saveNoteToHistory = (newNotes: QuickNotesResult, noteTopic: string) => {
    const entry: SavedNoteEntry = {
      id: `note-${Date.now()}`,
      topic: noteTopic,
      savedAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes: newNotes,
    };
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.topic.toLowerCase() !== noteTopic.toLowerCase());
      const updated = [entry, ...filtered].slice(0, 15);
      try {
        localStorage.setItem('ai_quick_notes_history_v2', JSON.stringify(updated));
        saveQuickNoteToCloud({
          ...entry,
          userId: userProfile?.userId || 'default_user',
        }).catch(() => {});
      } catch {}
      return updated;
    });
  };

  const handleGenerate = async (targetTopic?: string) => {
    const selectedTopic = (targetTopic || topic).trim();
    if (!selectedTopic) {
      showToast('Please enter a subject or chapter name first.', 'info');
      return;
    }

    setIsLoading(true);
    setSelectedAnswers({});
    setRevealedExplanations({});
    setShowHistory(false);

    try {
      showToast(`Atom AI is synthesizing 5-part chapter notes for "${selectedTopic}"...`, 'info');
      const telemetry = getAtomAITelemetry(selectedTopic);

      const res = await aiService.generateQuickNotes({
        topic: selectedTopic,
        subject: subject || 'Computer Science & Engineering',
        role,
        focusWeakAreas: telemetry.focusWeakAreas,
        studentScore: telemetry.score,
        skillLevel: telemetry.level,
      });

      setNotes(res);
      saveNoteToHistory(res, selectedTopic);
      showToast('Chapter notes synthesized successfully! Click "Open Notes" to review.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to synthesize chapter notes with Gemini AI.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromHistory = (entry: SavedNoteEntry) => {
    setTopic(entry.topic);
    setNotes(entry.notes);
    setSelectedAnswers({});
    setRevealedExplanations({});
    setShowHistory(false);
    setIsReaderOpen(true);
    showToast(`Loaded notes for "${entry.topic}"`, 'info');
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('ai_quick_notes_history_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Removed note from history', 'info');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('ai_quick_notes_history_v2');
    } catch {}
    showToast('Cleared notes history', 'info');
  };

  const handleDownloadNotes = () => {
    if (!notes) return;
    const chapterName = notes.chapterName || notes.title || topic;

    const topicsContent = (notes.topicsWithExplanation || []).map((t, idx) => {
      const sub = t.subtopics?.length ? `\n*Subtopics:* ${t.subtopics.join(', ')}` : '';
      const points = t.keyPoints?.length ? `\n*Key Invariants:*\n${t.keyPoints.map((k) => `- ${k}`).join('\n')}` : '';
      return `### Topic ${idx + 1}: ${t.topicTitle}\n${t.explanation}${sub}${points}`;
    }).join('\n\n');

    const tipsContent = (notes.tipsAndTricks || []).map((tip, idx) => `${idx + 1}. ${tip}`).join('\n');

    const questionsContent = (notes.practiceQuestions || []).map((q, idx) => {
      const opts = q.options.map((opt, oIdx) => `   ${String.fromCharCode(65 + oIdx)}) ${opt}`).join('\n');
      return `### Question ${idx + 1}: ${q.question}\n${opts}\n**Correct Answer:** ${q.correctAnswer}\n**Explanation:** ${q.explanation}\n`;
    }).join('\n\n');

    const markdown = `# ${chapterName}
**Subject:** ${notes.subject}
**Calibrated Level:** ${notes.performanceCalibratedLevel || 'Atom AI Adaptive'}
**Estimated Read Time:** ${notes.readTime || '3-5 min'}

---

## 1. Topics & In-Depth Explanations
${topicsContent}

---

## 2. Chapter Summary
${notes.chapterSummary || notes.executiveSummary}

---

## 3. High-Yield Exam Tips & Tricks (5-10 Tips)
${tipsContent}

---

## 4. 10 Calibrated Practice Questions
${questionsContent}

---
*Generated by Atom AI Socratic Learning Engine via Google Gemini*
`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chapterName.replace(/[^a-zA-Z0-9]/g, '_')}_QuickNotes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Notes downloaded successfully as Markdown (.md)!', 'success');
  };

  const handlePrint = () => {
    if (!notes) return;
    const chapterName = notes.chapterName || notes.title || topic;

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${chapterName} - Atom AI Quick Notes</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #111827; line-height: 1.5; font-size: 13px; }
          h1 { font-size: 20px; color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 6px; margin-bottom: 12px; }
          h2 { font-size: 16px; color: #0f172a; margin-top: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          h3 { font-size: 14px; color: #1e293b; margin-top: 10px; margin-bottom: 4px; }
          .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-right: 6px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin: 8px 0; }
          .tip-item { margin: 6px 0; padding-left: 8px; border-left: 3px solid #f59e0b; }
          .q-box { page-break-inside: avoid; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin: 8px 0; }
          .correct { color: #059669; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${chapterName}</h1>
        <p><span class="badge">${notes.subject}</span> <span class="badge">Read Time: ${notes.readTime}</span> <span class="badge">Atom AI Calibrated</span></p>

        <h2>1. Topics & In-Depth Explanations</h2>
        ${(notes.topicsWithExplanation || []).map((t, i) => `
          <div class="box">
            <h3>Topic ${i + 1}: ${t.topicTitle}</h3>
            <p>${t.explanation}</p>
            ${t.keyPoints?.length ? `<ul>${t.keyPoints.map(k => `<li>${k}</li>`).join('')}</ul>` : ''}
          </div>
        `).join('')}

        <h2>2. Chapter Summary</h2>
        <div class="box">
          <p>${notes.chapterSummary || notes.executiveSummary}</p>
        </div>

        <h2>3. High-Yield Exam Tips & Tricks (5-10 Tips)</h2>
        ${(notes.tipsAndTricks || []).map((tip, i) => `
          <div class="tip-item"><strong>Tip ${i + 1}:</strong> ${tip}</div>
        `).join('')}

        <h2>4. 10 Practice Questions</h2>
        ${(notes.practiceQuestions || []).map((q, i) => `
          <div class="q-box">
            <strong>Q${i + 1}: ${q.question}</strong>
            <ul>${q.options.map((opt, oIdx) => `<li>${String.fromCharCode(65 + oIdx)}) ${opt}</li>`).join('')}</ul>
            <p class="correct">✓ Correct Answer: ${q.correctAnswer}</p>
            <p><em>Explanation:</em> ${q.explanation}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printHtml);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {}
          setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 300);
      }
    } catch {
      window.print();
    }
  };

  const handleSelectAnswer = (qId: number, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const toggleExplanation = (qId: number) => {
    setRevealedExplanations((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (typeof document === 'undefined') return null;

  const currentTelemetry = getAtomAITelemetry(topic);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl text-white overflow-hidden z-10"
          >
            {/* Top Bar */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 bg-[#0F172A]/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight font-mono text-white">
                      AI Chapter Quick Notes
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Gemini Direct
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isReaderOpen
                      ? 'Dedicated Chapter Notes Reader & Practice Deck'
                      : 'Enter any subject or chapter to synthesize comprehensive notes, tips, and 10 questions.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Previous Notes Toggle */}
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    showHistory
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                  title="View previous notes"
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Saved Notes</span>
                  {history.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/30 text-amber-300 font-bold">
                      {history.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Saved Notes History Drawer */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 bg-[#0B0F17] overflow-hidden shrink-0"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase">
                        <History className="w-3.5 h-3.5" />
                        <span>Saved Revision Notes ({history.length})</span>
                      </div>
                      {history.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllHistory}
                          className="text-[11px] font-mono text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <p className="text-xs text-slate-400 font-mono">No previous notes saved yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {history.map((item, hIdx) => (
                          <div
                            key={`${item.id || 'hist'}-${hIdx}`}
                            onClick={() => handleLoadFromHistory(item)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2 cursor-pointer transition-all group"
                          >
                            <div className="truncate text-left">
                              <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate font-mono">
                                {item.topic}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.savedAt}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal Body: Switch between Generator View and Dedicated Reader View */}
            {!isReaderOpen ? (
              /* ================= GENERATOR VIEW ================= */
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                {/* Chapter & Subject Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 uppercase">
                      Chapter or Subject Name
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleGenerate();
                        }}
                        placeholder="e.g. Distributed Computing Chapter 1, Binary Search Trees, Bohr Atomic Model, Operating System Deadlocks..."
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:bg-white/10 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5 uppercase">
                      Course / Discipline Context
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering, Physics, Data Structures..."
                      className="w-full px-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Quick Recommended Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Quick Suggestions:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      'Distributed Computing: Chapter 1 Foundations',
                      'Binary Search Trees & Traversal',
                      'Graph Traversals: BFS vs DFS',
                      'Bohr Model of the Atom',
                      'Dynamic Programming Invariants',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setTopic(chip);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                          topic === chip
                            ? 'bg-amber-400 text-black border-amber-400 font-bold'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Atom AI Live Mastery Telemetry Card */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0F172A]/70 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        Atom AI Live Telemetry Adaptation
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${currentTelemetry.badgeColor}`}>
                        {currentTelemetry.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      Atom AI automatically evaluates your previous attempts and quiz mistakes for <strong>{topic || 'this chapter'}</strong>. It calibrates explanation depth and highlights edge cases without requiring you to set a manual tone.
                    </p>
                  </div>
                </div>

                {/* Generate Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    disabled={isLoading || !topic.trim()}
                    className="w-full py-3.5 px-6 rounded-xl text-sm font-mono font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Synthesizing Chapter Notes with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-black text-black" />
                        <span>Generate Notes with Gemini AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Notes Ready Banner if notes exist */}
                {notes && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Notes Ready: {notes.chapterName || notes.title}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">
                        Contains {notes.topicsWithExplanation?.length || 3} topics with simple explanations, executive summary, 5-10 tips, and 10 practice questions.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsReaderOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Open Notes</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* ================= DEDICATED READER VIEW ================= */
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Reader Sticky Header */}
                <div className="p-4 px-6 border-b border-white/10 bg-[#0B1120] flex items-center justify-between gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsReaderOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Input</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadNotes}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-sm"
                      title="Download as Markdown file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Notes (.md)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                      title="Print or Save as PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Reader Scrollable Document */}
                <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1 font-sans">
                  {/* Document Hero */}
                  <div className="pb-6 border-b border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] uppercase">
                      <span>{notes?.subject}</span>
                      <span>·</span>
                      <span>{notes?.readTime || '3-5 min read'}</span>
                      <span>·</span>
                      <span className="text-amber-400">{notes?.performanceCalibratedLevel || 'Atom AI Calibrated'}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                      {notes?.chapterName || notes?.title}
                    </h1>

                    {notes?.coreInvariant && (
                      <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs font-mono text-amber-200 mt-3">
                        <strong className="text-amber-400">⚡ Fundamental Invariant: </strong>
                        {notes.coreInvariant}
                      </div>
                    )}
                  </div>

                  {/* Section 1: Topics with Explanation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase tracking-wider pb-1 border-b border-white/10">
                      <BookOpen className="w-4 h-4 text-[#00F0FF]" />
                      <span>1. Topics with Detailed Explanations</span>
                    </div>

                    <div className="space-y-4">
                      {(notes?.topicsWithExplanation || []).map((topicItem, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#00F0FF]/15 text-[#00F0FF] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h3 className="text-base font-bold text-white font-mono">
                              {topicItem.topicTitle}
                            </h3>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            {topicItem.explanation}
                          </p>

                          {topicItem.subtopics && topicItem.subtopics.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[11px] font-mono text-slate-400">Subtopics:</span>
                              {topicItem.subtopics.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}

                          {topicItem.keyPoints && topicItem.keyPoints.length > 0 && (
                            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                              <span className="text-[10px] font-mono font-bold text-[#00F0FF] uppercase tracking-wider block">
                                Key Principles & Invariants:
                              </span>
                              <ul className="space-y-1">
                                {topicItem.keyPoints.map((kp, kpIdx) => (
                                  <li key={kpIdx} className="text-xs text-slate-300 flex items-start gap-2 font-mono">
                                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{kp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Chapter Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase tracking-wider pb-1 border-b border-white/10">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>2. Chapter Summary</span>
                    </div>

                    <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-sm text-slate-200 leading-relaxed font-mono">
                      {notes?.chapterSummary || notes?.executiveSummary}
                    </div>
                  </div>

                  {/* Section 3: 5-10 Tips & Tricks */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase tracking-wider pb-1 border-b border-white/10">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>3. High-Yield Tips & Tricks ({notes?.tipsAndTricks?.length || 0})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(notes?.tipsAndTricks || []).map((tip, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-mono pt-0.5">
                            {tip}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Exactly 10 Practice Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase tracking-wider">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span>4. 10 Practice Questions</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Interactive check with instant feedback
                      </span>
                    </div>

                    <div className="space-y-4">
                      {(notes?.practiceQuestions || []).map((q, qIdx) => {
                        const selected = selectedAnswers[q.id];
                        const isRevealed = revealedExplanations[q.id];
                        const isCorrect = selected && selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                        return (
                          <div
                            key={`${q.id || 'q'}-${qIdx}`}
                            className={`p-5 rounded-xl border transition-all ${
                              selected
                                ? isCorrect
                                  ? 'bg-emerald-950/20 border-emerald-500/40'
                                  : 'bg-rose-950/20 border-rose-500/40'
                                : 'bg-white/5 border-white/10'
                            } space-y-3`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  Q{qIdx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-white font-mono">
                                  {q.question}
                                </h4>
                              </div>

                              {selected && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    isCorrect
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                                </span>
                              )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => {
                                const isOptionSelected = selected === opt;
                                const isOptionCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                                let btnStyle = 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300';
                                if (selected) {
                                  if (isOptionCorrect) {
                                    btnStyle = 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-bold';
                                  } else if (isOptionSelected) {
                                    btnStyle = 'bg-rose-500/25 border-rose-500 text-rose-200';
                                  } else {
                                    btnStyle = 'bg-white/5 border-white/5 text-slate-500 opacity-60';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleSelectAnswer(q.id, opt)}
                                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer flex items-start gap-2 ${btnStyle}`}
                                  >
                                    <span className="font-bold shrink-0">{String.fromCharCode(65 + oIdx)})</span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Show/Hide Explanation */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => toggleExplanation(q.id)}
                                className="text-[11px] font-mono text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                              >
                                {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                <span>{isRevealed ? 'Hide Explanation' : 'View Explanation & Rationale'}</span>
                              </button>

                              {onStartPractice && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onStartPractice(topic);
                                  }}
                                  className="text-[11px] font-mono text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Drill this in Adaptive Practice</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {isRevealed && (
                              <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-300 font-mono space-y-1">
                                <div className="text-emerald-400 font-bold">
                                  Correct Answer: {q.correctAnswer}
                                </div>
                                <div className="text-slate-300">
                                  {q.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
