import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Material } from '../../types';
import {
  FileText,
  Search,
  X,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface ViewAllMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  selectedMaterialId?: string;
  onSelectMaterial: (m: Material) => void;
  onDeleteMaterial: (materialId: string) => void;
  onSelectForQuestions: (m: Material) => void;
}

export const ViewAllMaterialsModal: React.FC<ViewAllMaterialsModalProps> = ({
  isOpen,
  onClose,
  materials,
  selectedMaterialId,
  onSelectMaterial,
  onDeleteMaterial,
  onSelectForQuestions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (typeof document === 'undefined' || !isOpen) return null;

  const filtered = materials.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.fileName.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.topic.toLowerCase().includes(q) ||
      m.summary?.toLowerCase().includes(q)
    );
  });

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-mono"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  All Synthesized Course Documents
                </h3>
                <p className="text-xs text-slate-400">
                  {materials.length} total curriculum materials cataloged
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-white/10 bg-black/40">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search synthesized documents by name, topic, or subject..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#10B981]"
              />
            </div>
          </div>

          {/* Materials List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No synthesized documents match your search.
              </div>
            ) : (
              filtered.map((m, mIdx) => {
                const isProcessing = m.processingStatus === 'processing';
                const isSelected = selectedMaterialId === m.materialId;

                return (
                  <div
                    key={`${m.materialId || 'mat'}-${mIdx}`}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#10B981] bg-[#10B981]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-[#10B981] border border-white/10 flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                        {m.fileType || 'DOC'}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white truncate max-w-md">
                            {m.fileName}
                          </h4>
                          {isProcessing ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              SYNTHESIZING...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              SYNTHESIZED
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                          <span className="text-[#10B981] font-semibold">{m.subject}</span>
                          <span>•</span>
                          <span>{m.topic}</span>
                          {m.structuredConcepts && m.structuredConcepts.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400">
                                {m.structuredConcepts.reduce((acc, t) => acc + (t.concepts?.length || 0), 0)} concepts
                              </span>
                            </>
                          )}
                          {m.extractedText && (
                            <>
                              <span>•</span>
                              <span>{m.extractedText.length.toLocaleString()} chars</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectMaterial(m);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>

                      {!isProcessing && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectForQuestions(m);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Questions</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteMaterial(m.materialId)}
                        title="Delete synthesized document"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
