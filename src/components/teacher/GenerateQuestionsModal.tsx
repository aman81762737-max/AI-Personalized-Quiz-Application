import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Question, Material, QuestionDifficulty, QuestionType, Assessment } from '../../types';
import { aiService } from '../../services/aiService';
import { useToast } from '../common/Toast';
import {
  DocumentTransformationAnimation,
} from '../animation/AnimationComponents';
import {
  Sparkles,
  CheckCircle2,
  FileText,
  Sliders,
  Clock,
  Trash2,
  Plus,
  Send,
  ArrowLeft,
  X,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface GenerateQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  selectedMaterial?: Material | null;
  onAddApprovedQuestions: (questions: Question[]) => void;
  onSaveAssessment?: (assessment: Assessment) => void;
}

export const GenerateQuestionsModal: React.FC<GenerateQuestionsModalProps> = ({
  isOpen,
  onClose,
  materials,
  selectedMaterial,
  onAddApprovedQuestions,
  onSaveAssessment,
}) => {
  const { showToast } = useToast();

  // Active material detection
  const activeMat = selectedMaterial || (materials.length > 0 ? materials[0] : null);

  // Configuration state
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [questionType, setQuestionType] = useState<QuestionType | 'mixed'>('mcq');
  const [isGenerating, setIsGenerating] = useState(false);

  // Workflow state: 'config' | 'review'
  const [step, setStep] = useState<'config' | 'review'>('config');

  // Review & Edit state (NOT published until teacher clicks 'Publish')
  const [editableQuestions, setEditableQuestions] = useState<Question[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [passingPercentage, setPassingPercentage] = useState<number>(70);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  const handleSynthesizeQuestions = async () => {
    setIsGenerating(true);
    try {
      showToast('AI is synthesizing complete curriculum questions from your material...', 'info');

      const inferredSubject = activeMat?.subject || 'Curriculum Studies';
      const inferredTopic = activeMat?.topic || activeMat?.fileName?.replace(/\.[^/.]+$/, '') || 'Core Concepts';

      // Build comprehensive pedagogical context from BOTH whole document content AND synthesized data
      let combinedContext = '';

      if (activeMat?.extractedText && activeMat.extractedText.length > 20) {
        combinedContext += `=== COMPLETE UNABRIDGED SOURCE DOCUMENT CONTENT ===\n${activeMat.extractedText}\n\n`;
      }

      if (activeMat?.summary) {
        combinedContext += `=== SYNTHESIZED PEDAGOGICAL SUMMARY & SCOPE ===\n${activeMat.summary}\n\n`;
      }

      if (activeMat?.structuredConcepts && activeMat.structuredConcepts.length > 0) {
        combinedContext += `=== SYNTHESIZED CONCEPT DECOMPOSITION HIERARCHY ===\n`;
        activeMat.structuredConcepts.forEach((topicGroup, tIdx) => {
          combinedContext += `Topic ${tIdx + 1}: ${topicGroup.name}\n`;
          topicGroup.concepts?.forEach((c) => {
            combinedContext += `  • Concept: ${c.concept}\n    Definition: ${c.definition}\n    Example: ${c.example}\n    Learning Objective: ${c.learningObjective}\n`;
          });
        });
        combinedContext += `\n`;
      }

      if (!combinedContext.trim()) {
        combinedContext = activeMat?.summary || `${inferredTopic} curriculum concepts`;
      }

      const fileData = activeMat?.fileData;
      const apiQuestionType = questionType === 'mixed' ? 'mcq' : (questionType as 'mcq' | 'true_false' | 'fill_in_the_blank');

      const results = await aiService.generateQuestions({
        subject: inferredSubject,
        topic: inferredTopic,
        count,
        difficulty,
        questionType: apiQuestionType,
        sourceText: combinedContext,
        fileData,
        documentTitle: activeMat?.fileName,
      });

      if (!results || results.length === 0) {
        throw new Error('No questions could be extracted from this document.');
      }

      const formattedQuestions: Question[] = results.map((q, idx) => ({
        ...q,
        questionId: `q-ai-${Date.now()}-${idx}`,
        teacherId: 'teacher-01',
        subject: inferredSubject,
        topic: inferredTopic,
        difficulty,
        type: q.type || (questionType === 'mixed' ? (idx % 2 === 0 ? 'mcq' : 'fill_in_the_blank') : (questionType as QuestionType)),
        options: Array.isArray(q.options) && q.options.length > 0 ? [...q.options] : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || (q.options?.[0] ?? 'A'),
        explanation: q.explanation || 'Pedagogical explanation based on source curriculum text.',
        createdBy: 'AI',
        status: 'draft',
        createdAt: new Date().toISOString(),
      }));

      const defaultTitle = `${activeMat?.topic || activeMat?.fileName?.replace(/\.[^/.]+$/, '') || 'Curriculum'} Assignment`;
      setAssessmentTitle(defaultTitle);
      setDurationMinutes(Math.max(10, formattedQuestions.length * 2));
      setPassingPercentage(70);
      setEditableQuestions(formattedQuestions);

      // Transition to Review stage WITHOUT publishing!
      setStep('review');
      showToast('Questions synthesized! Please review, edit, and press Publish when ready.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Generation failed. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Question Editing Helpers
  const handleUpdateQuestionText = (index: number, newText: string) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, questionText: newText } : q))
    );
  };

  const handleUpdateQuestionType = (index: number, newType: QuestionType) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== index) return q;
        let newOptions = q.options;
        let newAnswer = q.correctAnswer;
        if (newType === 'true_false') {
          newOptions = ['True', 'False'];
          newAnswer = 'True';
        } else if (newType === 'mcq' && (!newOptions || newOptions.length < 2)) {
          newOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
          newAnswer = newOptions[0];
        }
        return {
          ...q,
          type: newType,
          options: newOptions,
          correctAnswer: newAnswer,
        };
      })
    );
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, newOptVal: string) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentOptions = q.options ? [...q.options] : [];
        const oldVal = currentOptions[optIndex];
        currentOptions[optIndex] = newOptVal;
        return {
          ...q,
          options: currentOptions,
          correctAnswer: q.correctAnswer === oldVal ? newOptVal : q.correctAnswer,
        };
      })
    );
  };

  const handleSelectCorrectAnswer = (qIndex: number, answerVal: string) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, correctAnswer: answerVal } : q))
    );
  };

  const handleUpdateExplanation = (qIndex: number, newExp: string) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, explanation: newExp } : q))
    );
  };

  const handleUpdateDifficulty = (qIndex: number, newDiff: QuestionDifficulty) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, difficulty: newDiff } : q))
    );
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (editableQuestions.length <= 1) {
      showToast('An assessment must have at least one question.', 'warning');
      return;
    }
    setEditableQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
    showToast(`Question ${qIndex + 1} removed`, 'info');
  };

  const handleAddQuestionOfType = (type: QuestionType) => {
    let options: string[] = [];
    let correctAnswer = '';
    if (type === 'mcq') {
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
      correctAnswer = 'Option A';
    } else if (type === 'true_false') {
      options = ['True', 'False'];
      correctAnswer = 'True';
    } else if (type === 'fill_in_the_blank') {
      options = [];
      correctAnswer = 'Target term';
    } else {
      options = [];
      correctAnswer = 'Expected response';
    }

    const newQ: Question = {
      questionId: `q-manual-${Date.now()}`,
      teacherId: 'teacher-01',
      questionText: `New ${
        type === 'mcq'
          ? 'Multiple Choice'
          : type === 'true_false'
          ? 'True / False'
          : type === 'fill_in_the_blank'
          ? 'Fill-in-the-Blank'
          : 'Short Answer'
      } question...`,
      type,
      options,
      correctAnswer,
      explanation: 'Detailed pedagogical explanation for students.',
      difficulty,
      subject: activeMat?.subject || 'Curriculum Studies',
      topic: activeMat?.topic || 'General Topic',
      createdBy: 'teacher',
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    setEditableQuestions((prev) => [...prev, newQ]);
    setShowAddMenu(false);
    showToast(`Added new ${type.replace(/_/g, ' ').toUpperCase()} question`, 'success');
  };

  const handleConvertQuestionType = (qIdx: number, newType: QuestionType) => {
    setEditableQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIdx] };
      const oldType = q.type;

      if (oldType === newType) return prev;

      q.type = newType;

      if (newType === 'true_false') {
        q.options = ['True', 'False'];
        const isTrueLike =
          q.correctAnswer?.toLowerCase().includes('true') ||
          q.correctAnswer?.toLowerCase().includes('yes') ||
          !q.correctAnswer?.toLowerCase().includes('false');
        q.correctAnswer = isTrueLike ? 'True' : 'False';
      } else if (newType === 'fill_in_the_blank') {
        if (!q.questionText.includes('_____')) {
          q.questionText = q.questionText.replace(/\?$/, '').trim() + ' is _____ .';
        }
        q.options = [];
        if (!q.correctAnswer && q.options && q.options.length > 0) {
          q.correctAnswer = q.options[0];
        }
      } else if (newType === 'short_answer') {
        q.options = [];
      } else if (newType === 'mcq') {
        const primary = q.correctAnswer || (q.options && q.options[0]) || 'Option A';
        q.options = [primary, 'Alternative Concept B', 'Secondary Invariant C', 'None of the above'];
        q.correctAnswer = primary;
      }

      updated[qIdx] = q;
      return updated;
    });
    showToast(`Converted question ${qIdx + 1} to ${newType.replace(/_/g, ' ').toUpperCase()}`, 'info');
  };

  // Explicit Publish Action: Replaces former "Done" button!
  const handlePublish = async () => {
    if (editableQuestions.length === 0) {
      showToast('Cannot publish an empty assignment.', 'error');
      return;
    }

    const hasEmptyQuestions = editableQuestions.some((q) => !q.questionText.trim());
    if (hasEmptyQuestions) {
      showToast('Please provide text for all questions before publishing.', 'warning');
      return;
    }

    setIsPublishing(true);
    try {
      const approvedQuestions: Question[] = editableQuestions.map((q) => ({
        ...q,
        status: 'approved',
      }));

      const finalAssessment: Assessment = {
        assessmentId: `asm-${Date.now()}`,
        teacherId: 'teacher-01',
        title: assessmentTitle.trim() || 'Curriculum Assessment',
        description: `Assessment authored from "${activeMat?.fileName || 'Uploaded Curriculum'}".`,
        subject: activeMat?.subject || 'Curriculum Studies',
        topics: [activeMat?.topic || 'Core Curriculum'],
        questionCount: approvedQuestions.length,
        durationMinutes: Math.max(5, durationMinutes),
        passingPercentage: Math.min(100, Math.max(30, passingPercentage)),
        maxAttempts: 2,
        questionIds: approvedQuestions.map((q) => q.questionId),
        status: 'published',
        createdAt: new Date().toISOString(),
        randomized: true,
      };

      // 1. Commit approved questions to question bank
      onAddApprovedQuestions(approvedQuestions);

      // 2. Publish assignment to student cohort
      if (onSaveAssessment) {
        onSaveAssessment(finalAssessment);
      }

      showToast(`Assignment "${finalAssessment.title}" successfully published to student cohort!`, 'success');
      handleContinueWithoutPublishing();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish assessment.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Top-Right Cross Button: saves as DRAFT in Examinations tab!
  const handleTopRightClose = () => {
    if (step === 'review' && editableQuestions.length > 0) {
      const draftQuestions: Question[] = editableQuestions.map((q) => ({
        ...q,
        status: 'draft',
      }));

      const draftAssessment: Assessment = {
        assessmentId: `asm-draft-${Date.now()}`,
        teacherId: 'teacher-01',
        title:
          assessmentTitle.trim() ||
          `${activeMat?.topic || activeMat?.fileName?.replace(/\.[^/.]+$/, '') || 'Curriculum'} Assignment (Draft)`,
        description: `Draft assessment authored from "${activeMat?.fileName || 'Uploaded Curriculum'}".`,
        subject: activeMat?.subject || 'Curriculum Studies',
        topics: [activeMat?.topic || 'Core Curriculum'],
        questionCount: draftQuestions.length,
        durationMinutes: Math.max(5, durationMinutes),
        passingPercentage: Math.min(100, Math.max(30, passingPercentage)),
        maxAttempts: 2,
        questionIds: draftQuestions.map((q) => q.questionId),
        status: 'draft',
        createdAt: new Date().toISOString(),
        randomized: true,
      };

      onAddApprovedQuestions(draftQuestions);
      if (onSaveAssessment) {
        onSaveAssessment(draftAssessment);
      }

      showToast('Assignment saved as draft in Examinations tab!', 'info');
    }

    setStep('config');
    setEditableQuestions([]);
    setIsGenerating(false);
    setIsPublishing(false);
    setShowAddMenu(false);
    onClose();
  };

  // Continue Without Publishing / Cancel: automatically discards draft and cancels all
  const handleContinueWithoutPublishing = () => {
    setStep('config');
    setEditableQuestions([]);
    setIsGenerating(false);
    setIsPublishing(false);
    setShowAddMenu(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleTopRightClose}
      title={step === 'review' ? 'Review & Edit Questions Before Publishing' : 'Generate Student Assignment via AI'}
      subtitle={
        step === 'review'
          ? 'Modify questions, answers, and settings. Students will not see this assignment until you click Publish.'
          : 'Creates an assessment draft from your uploaded document for review before publishing'
      }
      maxWidth={step === 'review' ? 'max-w-4xl' : 'max-w-2xl'}
    >
      {isGenerating ? (
        <DocumentTransformationAnimation
          title={`Synthesizing Assignment from ${activeMat?.fileName || 'Document'}`}
          sourceDocName={activeMat?.fileName || 'Curriculum PDF'}
          step={`Extracting calibrated questions · Caliber: ${difficulty.toUpperCase()} · Target Count: ${count}`}
        />
      ) : step === 'review' ? (
        /* STEP 2: REVIEW & EDIT QUESTIONS (PRE-PUBLISH REVIEW GATE) */
        <div className="space-y-6 text-white font-mono">
          {/* Status Banner: Explicitly clarifies draft status */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200">
                <strong>Review Mode:</strong> This assignment has <strong>NOT</strong> been sent to students yet. Review and edit all questions below, then click <strong>Publish</strong>.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px] shrink-0 border border-amber-500/30">
              Unpublished Draft
            </span>
          </div>

          {/* Assignment Settings Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                value={assessmentTitle}
                onChange={(e) => setAssessmentTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                placeholder="Assignment Title"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 15)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={30}
                max={100}
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(parseInt(e.target.value, 10) || 70)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Questions Review & Editing List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Synthesized Questions ({editableQuestions.length})
              </span>

              {/* Add Question Type Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0B0F17] border border-white/15 rounded-xl shadow-2xl p-1.5 z-30 space-y-1 backdrop-blur-xl">
                    <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-white/10 mb-1">
                      Choose Question Type
                    </div>
                    {[
                      { type: 'mcq', label: 'Multiple Choice (MCQ)', desc: '4 options with 1 answer key' },
                      { type: 'true_false', label: 'True / False', desc: 'Binary boolean question' },
                      { type: 'fill_in_the_blank', label: 'Fill in the Blank', desc: 'Single term completion' },
                      { type: 'short_answer', label: 'Short Answer', desc: 'Open response prompt' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleAddQuestionOfType(item.type as QuestionType)}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors flex flex-col cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-white group-hover:text-[#00F0FF] font-sans">
                          + {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
              {editableQuestions.map((q, qIdx) => (
                <div
                  key={q.questionId || qIdx}
                  className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3.5 font-sans relative group"
                >
                  {/* Question Header: Number, Question Type Dropdown, Delete */}
                  <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 flex items-center justify-center font-bold text-xs">
                        {qIdx + 1}
                      </span>

                      {/* Question Type Switcher Dropdown (theme compatible) */}
                      <div className="relative">
                        <select
                          value={q.type}
                          onChange={(e) => handleConvertQuestionType(qIdx, e.target.value as QuestionType)}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer border border-[#00F0FF]/40 bg-slate-900 text-[#00F0FF] dark:bg-black/90 dark:text-cyan-300 focus:outline-hidden focus:border-[#00F0FF]"
                          title="Change question type"
                        >
                          <option value="mcq" className="bg-slate-900 text-white dark:bg-black dark:text-white">Multiple Choice (MCQ)</option>
                          <option value="true_false" className="bg-slate-900 text-white dark:bg-black dark:text-white">True / False</option>
                          <option value="fill_in_the_blank" className="bg-slate-900 text-white dark:bg-black dark:text-white">Fill in Blank</option>
                          <option value="short_answer" className="bg-slate-900 text-white dark:bg-black dark:text-white">Short Answer</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Prompt Editor */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Question Prompt
                    </label>
                    <textarea
                      rows={2}
                      value={q.questionText}
                      onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00F0FF] font-sans leading-relaxed resize-y"
                      placeholder="Enter question prompt..."
                    />
                  </div>

                  {/* MCQ Options Editor */}
                  {q.type === 'mcq' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Answer Options (Select the correct option with radio button)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, optIdx) => {
                          const isCorrect = q.correctAnswer === opt;
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                isCorrect
                                  ? 'bg-[#10B981]/15 border-[#10B981]/50 text-white'
                                  : 'bg-white/5 border-white/10 text-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${q.questionId || qIdx}`}
                                checked={isCorrect}
                                onChange={() => handleSelectCorrectAnswer(qIdx, opt)}
                                className="w-4 h-4 text-[#10B981] accent-[#10B981] cursor-pointer"
                                title="Mark as correct answer"
                              />
                              <span className="font-mono text-xs font-bold text-slate-400">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* True / False Options */}
                  {q.type === 'true_false' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Correct Answer
                      </label>
                      <div className="flex items-center gap-4">
                        {['True', 'False'].map((tfVal) => (
                          <label key={tfVal} className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                            <input
                              type="radio"
                              name={`correct-tf-${q.questionId || qIdx}`}
                              checked={q.correctAnswer === tfVal}
                              onChange={() => handleSelectCorrectAnswer(qIdx, tfVal)}
                              className="accent-[#10B981] w-4 h-4 cursor-pointer"
                            />
                            <span className={q.correctAnswer === tfVal ? 'text-[#10B981] font-bold' : 'text-slate-300'}>
                              {tfVal}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fill in Blank / Short Answer */}
                  {(q.type === 'fill_in_the_blank' || q.type === 'short_answer') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Correct Answer / Canonical Key
                      </label>
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => handleSelectCorrectAnswer(qIdx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-[#10B981] font-mono focus:outline-none focus:border-[#10B981]"
                        placeholder="Expected canonical answer..."
                      />
                    </div>
                  )}

                  {/* Explanation / Rationale */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Explanation & Rationale
                    </label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateExplanation(qIdx, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-sans focus:outline-none focus:border-[#00F0FF]"
                      placeholder="Why this answer is correct..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Publish Footer Actions: Replaces former Done button with Publish */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setStep('config')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Synthesis Settings</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleContinueWithoutPublishing}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
              >
                Continue Without Publishing
              </button>

              <button
                type="button"
                disabled={isPublishing || editableQuestions.length === 0}
                onClick={handlePublish}
                className="px-6 py-2.5 text-xs font-bold font-mono text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-black" />
                <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 1: CONFIGURATION SCREEN (DIFFICULTY, COUNT, QUESTION TYPE) */
        <div className="space-y-5 text-white">
          {/* Active Material Header Badge */}
          {activeMat && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Source Material (Used for Question Extraction)
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {activeMat.fileName}
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {activeMat.fileType || 'PDF'}
              </span>
            </div>
          )}

          {/* 1. Difficulty Setting */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              1. Difficulty Caliber
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'easy', label: 'Easy', desc: 'Foundations & definitions' },
                { id: 'medium', label: 'Medium', desc: 'Standard core application' },
                { id: 'hard', label: 'Hard', desc: 'Complex reasoning & edge cases' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id as QuestionDifficulty)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    difficulty === diff.id
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className={`text-xs font-bold font-mono ${difficulty === diff.id ? 'text-[#00F0FF]' : 'text-white'}`}>
                    {diff.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{diff.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Question Count */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              2. How Many Questions?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  className={`py-2.5 px-3 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                    count === num
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* 3. Question Type */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              3. Question Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'mcq', label: 'Multiple Choice', sub: '4 options per item' },
                { id: 'fill_in_the_blank', label: 'Fill in the Blank', sub: 'Key term completion' },
                { id: 'true_false', label: 'True / False', sub: 'Binary conceptual check' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQuestionType(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    questionType === t.id
                      ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className={`text-xs font-bold font-mono ${questionType === t.id ? 'text-purple-300' : 'text-white'}`}>
                    {t.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pre-Publish Notice */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed font-sans flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-mono">Teacher Review & Edit Step:</strong> Synthesized questions will open in an interactive review screen where you can modify question text, answer keys, and options before explicitly pressing <strong className="text-[#10B981]">Publish</strong>.
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleContinueWithoutPublishing}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSynthesizeQuestions}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>SYNTHESIZE QUESTIONS & REVIEW</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
