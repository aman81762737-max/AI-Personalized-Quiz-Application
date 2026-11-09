import React, { useState } from 'react';
import { Question, QuestionDifficulty, QuestionType, QuestionStatus } from '../../types';
import { useToast } from '../common/Toast';
import { useTheme } from '../../context/ThemeContext';
import { Modal } from '../common/Modal';
import {
  StaggerContainer,
  StaggerItem,
} from '../animation/AnimationComponents';
import {
  Search,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';
import { ManualQuestionModal } from './ManualQuestionModal';

interface QuestionBankViewProps {
  questions: Question[];
  onUpdateQuestion: (updated: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onOpenGenerateModal: () => void;
  onAddQuestion?: (question: Question) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onOpenGenerateModal,
  onAddQuestion,
}) => {
  const { showToast } = useToast();
  const { density } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Manual Question Authoring & AI Improver state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDraftText, setManualDraftText] = useState('');

  // Preview / Edit modal
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || q.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;
    return matchesSearch && matchesDiff && matchesType && matchesStatus;
  });

  const approvedCount = questions.filter((q) => q.status === 'approved' || q.approvalStatus === 'approved').length;
  const draftCount = questions.filter((q) => q.status === 'draft' || q.approvalStatus === 'draft' || q.status === 'ai_generated').length;
  const rejectedCount = questions.filter((q) => q.status === 'rejected' || q.approvalStatus === 'rejected').length;

  const easyApproved = questions.filter((q) => (q.status === 'approved' || q.approvalStatus === 'approved') && q.difficulty === 'easy').length;
  const mediumApproved = questions.filter((q) => (q.status === 'approved' || q.approvalStatus === 'approved') && q.difficulty === 'medium').length;
  const hardApproved = questions.filter((q) => (q.status === 'approved' || q.approvalStatus === 'approved') && q.difficulty === 'hard').length;

  const handleToggleStatus = (q: Question, newStatus: QuestionStatus) => {
    onUpdateQuestion({
      ...q,
      status: newStatus,
      approvalStatus: newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'draft',
      approvedBy: newStatus === 'approved' ? 'faculty' : undefined,
      approvedAt: newStatus === 'approved' ? new Date().toISOString() : undefined,
    });
    showToast(`Question status updated to ${newStatus.toUpperCase()}`, newStatus === 'approved' ? 'success' : 'info');
  };

  const handleBatchApproveDrafts = () => {
    const draftsToApprove = filteredQuestions.filter(
      (q) => q.status === 'draft' || q.status === 'ai_generated' || q.approvalStatus === 'draft'
    );
    if (draftsToApprove.length === 0) {
      showToast('No draft questions in the current view to approve.', 'info');
      return;
    }

    draftsToApprove.forEach((q) => {
      onUpdateQuestion({
        ...q,
        status: 'approved',
        approvalStatus: 'approved',
        approvedBy: 'faculty',
        approvedAt: new Date().toISOString(),
      });
    });
    showToast(`Approved ${draftsToApprove.length} questions into the active student Question Bank!`, 'success');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    onUpdateQuestion(editingQuestion);
    showToast('Question updated successfully', 'success');
    setEditingQuestion(null);
  };

  const handleSaveManualQuestion = (newQuestion: Question) => {
    if (onAddQuestion) {
      onAddQuestion(newQuestion);
    }
    showToast('Question saved to Question Bank!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-white">
      {/* Tactical HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-[#10B981]">
            <Database className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-bold">CONTROLLED INSTITUTIONAL ITEM REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Question Bank Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Centralized repository of verified, faculty-approved question items. Students receive only approved questions; AI serves as a drafting copilot subject to teacher review.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap font-mono">
          {/* Add Question Manually */}
          <button
            type="button"
            onClick={() => {
              setManualDraftText(searchQuery);
              setIsManualModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#00F0FF]" />
            <span>Add Question Manually</span>
          </button>

          <button
            type="button"
            onClick={onOpenGenerateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-black text-black" />
            <span>Synthesize Drafts with AI</span>
          </button>
        </div>
      </div>

      {/* Controlled Question Bank Inventory HUD & Lifecycle Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#0A0D14]/85 p-4 rounded-2xl border border-emerald-500/30 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest block font-bold">
              Approved Items
            </span>
            <span className="text-2xl font-extrabold text-white">{approvedCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Eligible for exams & drills</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0A0D14]/85 p-4 rounded-2xl border border-amber-500/30 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">
              Drafts for Review
            </span>
            <span className="text-2xl font-extrabold text-white">{draftCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Hidden from students</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0A0D14]/85 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              Difficulty Spread (Approved)
            </span>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-emerald-400 font-bold">{easyApproved}E</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-bold">{mediumApproved}M</span>
              <span className="text-slate-500">·</span>
              <span className="text-rose-400 font-bold">{hardApproved}H</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Ready for calibrated quizzes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#00F0FF]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0A0D14]/85 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              Fast Batch Review
            </span>
            <button
              type="button"
              onClick={handleBatchApproveDrafts}
              disabled={draftCount === 0}
              className="mt-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Approve All Drafts
            </button>
            <span className="text-[10px] text-slate-400 block mt-1">1-click faculty sign-off</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Lifecycle Status Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
            selectedStatus === 'all'
              ? 'bg-white/15 text-white border-white/30 shadow-sm'
              : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
          }`}
        >
          All Items ({questions.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus('approved')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold flex items-center gap-2 ${
            selectedStatus === 'approved'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-white/5 text-slate-400 hover:text-emerald-400 border-white/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Approved & Active ({approvedCount})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus('draft')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold flex items-center gap-2 ${
            selectedStatus === 'draft' || selectedStatus === 'ai_generated'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-white/5 text-slate-400 hover:text-amber-400 border-white/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Drafts / Review Pending ({draftCount})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus('rejected')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold flex items-center gap-2 ${
            selectedStatus === 'rejected'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              : 'bg-white/5 text-slate-400 hover:text-rose-400 border-white/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Filter and Search Bar with Inline AI Assistant */}
      <div className="bg-[#0A0D14]/85 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl space-y-3 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by topic, question text, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00F0FF]"
              />
            </div>

            {/* Instant AI Improver Button */}
            <button
              type="button"
              onClick={() => {
                setManualDraftText(searchQuery);
                setIsManualModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all cursor-pointer shrink-0"
              title="Open question authoring with draft pre-filled for Gemini AI improvement"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>{searchQuery.trim() ? 'Improve ✨' : 'Author ✨'}</span>
            </button>
          </div>

          <div className="md:col-span-7 flex flex-wrap items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-white/10 bg-black/40 text-slate-300 focus:outline-hidden focus:border-[#00F0FF]"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-white/10 bg-black/40 text-slate-300 focus:outline-hidden focus:border-[#00F0FF]"
            >
              <option value="all">All Types</option>
              <option value="mcq">Multiple Choice</option>
              <option value="true_false">True / False</option>
              <option value="fill_in_the_blank">Fill in Blank</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-white/10 bg-black/40 text-slate-300 focus:outline-hidden focus:border-[#00F0FF]"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft (Review Pending)</option>
              <option value="rejected">Rejected</option>
            </select>

            <span className="text-xs text-slate-400 ml-auto tabular-nums">
              Showing {filteredQuestions.length} of {questions.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Questions List with Staggered Entrance */}
      {filteredQuestions.length > 0 ? (
        <StaggerContainer className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          {filteredQuestions.map((q, qIdx) => (
            <StaggerItem key={`${q.questionId || 'qb'}-${qIdx}`}>
              <div
                className={`bg-[#0A0D14]/80 rounded-2xl border border-white/10 shadow-xl hover:border-[#10B981]/40 backdrop-blur-md transition-all flex flex-col md:flex-row md:items-start justify-between ${
                  density === 'compact' ? 'p-3.5 gap-2.5' : 'p-5 gap-4'
                }`}
              >
                <div className="space-y-2 flex-1">
                  {/* Meta line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="font-bold text-[#00F0FF]">{q.subject}</span>
                    <span aria-hidden="true" className="text-white/20">·</span>
                    <span className="text-slate-300">{q.topic}</span>
                    <span aria-hidden="true" className="text-white/20">·</span>
                    <span className="capitalize">{q.type.replace('_', ' ')}</span>
                    <span aria-hidden="true" className="text-white/20">·</span>
                    <span
                      className={`font-bold capitalize ${
                        q.difficulty === 'easy'
                          ? 'text-[#10B981]'
                          : q.difficulty === 'medium'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span aria-hidden="true" className="text-white/20">·</span>
                    <span
                      className={`font-bold ${
                        q.status === 'approved'
                          ? 'text-[#10B981]'
                          : q.status === 'ai_generated'
                          ? 'text-purple-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {q.status === 'approved'
                        ? 'Approved'
                        : q.status === 'ai_generated'
                        ? 'AI Synthesized'
                        : q.status}
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options snippet */}
                  {q.options && q.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 font-mono">
                      {q.options.map((opt, i) => (
                        <span
                          key={i}
                          className={`text-[11px] px-2 py-0.5 rounded-lg border ${
                            opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 font-bold'
                              : 'bg-black/40 text-slate-300 border-white/10'
                          }`}
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewQuestion(q)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title="Preview"
                    aria-label="Preview question"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(q)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title="Edit"
                    aria-label="Edit question"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateQuestion(q)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title="Duplicate"
                    aria-label="Duplicate question"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {q.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(q, 'approved')}
                      className="p-2 text-slate-400 hover:text-[#10B981] hover:bg-[#10B981]/10 rounded-xl transition-colors cursor-pointer"
                      title="Approve Question"
                      aria-label="Approve question"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {q.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(q, 'rejected')}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-colors cursor-pointer"
                      title="Reject Question"
                      aria-label="Reject question"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this question from question bank?')) {
                        onDeleteQuestion(q.questionId);
                        showToast('Question deleted', 'info');
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Delete"
                    aria-label="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="p-12 text-center bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md font-mono">
          <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-white">No questions match your filter</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Adjust your search keywords or click "Synthesize with AI"
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <Modal
          isOpen={!!previewQuestion}
          onClose={() => setPreviewQuestion(null)}
          title="Question Item Preview"
          subtitle={`${previewQuestion.subject} · ${previewQuestion.topic}`}
        >
          <div className="space-y-4 text-white">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 font-mono">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#00F0FF]">
                {previewQuestion.difficulty} · {previewQuestion.type.replace('_', ' ')}
              </span>
              <p className="text-sm font-semibold text-white mt-1">
                {previewQuestion.questionText}
              </p>
            </div>

            {previewQuestion.options && (
              <div className="space-y-2 font-mono">
                <span className="text-xs font-semibold text-slate-300">Options:</span>
                <div className="space-y-2">
                  {previewQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        opt.trim().toLowerCase() === previewQuestion.correctAnswer.trim().toLowerCase()
                          ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981] font-bold'
                          : 'bg-black/40 border-white/10 text-slate-300'
                      }`}
                    >
                      <span>
                        <span className="font-bold mr-2 text-white">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </span>
                      {opt.trim().toLowerCase() === previewQuestion.correctAnswer.trim().toLowerCase() && (
                        <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
                          Correct Ground-Truth
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300">
              <span className="font-mono font-bold text-[#00F0FF]">Pedagogical Rationale: </span>
              {previewQuestion.explanation}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <Modal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          title="Edit Question Item"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-white font-mono">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Question Prompt</label>
              <textarea
                rows={3}
                value={editingQuestion.questionText}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                }
                className="w-full text-xs p-3 border rounded-xl border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Topic</label>
                <input
                  type="text"
                  value={editingQuestion.topic}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, topic: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border rounded-xl border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Question Type</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) => {
                    const newType = e.target.value as QuestionType;
                    const oldType = editingQuestion.type;
                    let newText = editingQuestion.questionText;
                    let newOptions = editingQuestion.options || [];
                    const currentAns = editingQuestion.correctAnswer || (newOptions[0] || '');

                    if (newType === 'true_false') {
                      if (oldType !== 'true_false') {
                        const clean = newText.replace(/\?$/, '').replace(/^(which of the following|what is|how does|why is|explain)\s+/i, '');
                        newText = `${clean.charAt(0).toUpperCase() + clean.slice(1)} is correctly identified as ${currentAns}.`;
                      }
                      newOptions = ['True', 'False'];
                    } else if (newType === 'fill_in_the_blank') {
                      if (currentAns && newText.toLowerCase().includes(currentAns.toLowerCase())) {
                        newText = newText.replace(new RegExp(currentAns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____');
                      } else if (!newText.includes('_____')) {
                        newText = `${newText.replace(/\?$/, '')}: _____.`;
                      }
                      newOptions = [currentAns || 'Keyword'];
                    } else if (newType === 'mcq') {
                      if (newText.includes('_____')) {
                        newText = newText.replace('_____', 'which of the following');
                      }
                      if (newOptions.length < 4 || (newOptions[0] === 'True' && newOptions[1] === 'False')) {
                        newOptions = [
                          currentAns || 'Option A',
                          'Alternative distractor',
                          'Edge-case counterexample',
                          'Inverted condition',
                        ];
                      }
                    }

                    setEditingQuestion({
                      ...editingQuestion,
                      type: newType,
                      questionText: newText,
                      options: newOptions,
                      correctAnswer: newType === 'true_false' ? 'True' : currentAns,
                    });
                    showToast(`Automatically converted to ${newType.replace('_', ' ')} format.`, 'info');
                  }}
                  className="w-full text-xs p-2.5 border rounded-xl border-slate-700 dark:border-white/20 bg-slate-900 dark:bg-black/90 font-bold text-white focus:outline-hidden focus:border-[#00F0FF] cursor-pointer"
                >
                  <option value="mcq" className="bg-slate-900 text-white">Multiple Choice (MCQ)</option>
                  <option value="true_false" className="bg-slate-900 text-white">True / False</option>
                  <option value="fill_in_the_blank" className="bg-slate-900 text-white">Fill in the Blank</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Correct Answer</label>
              <input
                type="text"
                value={editingQuestion.correctAnswer}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                }
                className="w-full text-xs p-2.5 border rounded-xl border-white/10 bg-black/40 font-bold text-[#10B981] focus:outline-hidden focus:border-[#10B981]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Explanation</label>
              <textarea
                rows={2}
                value={editingQuestion.explanation}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                }
                className="w-full text-xs p-2.5 border rounded-xl border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manual Question Authoring & AI Improver Modal */}
      <ManualQuestionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSaveQuestion={handleSaveManualQuestion}
        initialDraftText={manualDraftText}
      />
    </div>
  );
};
