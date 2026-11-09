import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Assessment } from '../../types';
import {
  Clock,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  Lock,
  ArrowRight,
  Radio,
  Terminal,
} from 'lucide-react';

interface AssessmentInstructionsModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (assessment: Assessment) => void;
}

export const AssessmentInstructionsModal: React.FC<AssessmentInstructionsModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onConfirmStart,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!assessment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Examination Briefing & Proctor Protocol"
      subtitle={`${assessment.subject} · ${assessment.title}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-white">
        {/* Exam Specifications Telemetry */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-black/60 rounded-xl border border-white/10 text-center font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Duration</span>
            <span className="text-base font-extrabold text-[#00F0FF] tabular-nums">
              {assessment.durationMinutes}m
            </span>
          </div>
          <div className="border-x border-white/10 px-2">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Questions</span>
            <span className="text-base font-extrabold text-white tabular-nums">
              {assessment.questionCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Passing Mark</span>
            <span className="text-base font-extrabold text-[#00FF88] tabular-nums">
              {assessment.passingPercentage}%
            </span>
          </div>
        </div>

        {/* Proctoring Policy Notice */}
        <div className="p-4 bg-amber-400/10 rounded-xl border border-amber-400/30 space-y-2 text-xs">
          <div className="font-mono font-bold flex items-center gap-2 text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Automated Assessment Monitoring & Integrity Protocol</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-300 font-sans">
            To preserve academic integrity, this session actively logs telemetry events including window blur, fullscreen exits, tab switches, and clipboard operations.
          </p>
          <div className="text-[10px] text-amber-400/80 font-mono">
            LOGS BUFFERED: Telemetry streams directly to educator review console upon submission.
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-2 text-xs text-slate-300 font-sans">
          <div className="font-mono font-bold text-white uppercase text-[11px] tracking-wider">Operational Parameters:</div>
          <ul className="space-y-1.5 list-disc pl-5 leading-relaxed text-slate-400">
            <li>Answers are continuously synced to the session state in real time.</li>
            <li>Countdown telemetry cannot be paused once initiated.</li>
            <li>Solutions and diagnostic explanations unlock immediately following submission.</li>
            <li>Gemini 3.8 Flash automatically derives your adaptive remediation plan upon completion.</li>
          </ul>
        </div>

        {/* Acknowledgment Checkbox */}
        <div className="p-3.5 bg-black/50 rounded-xl border border-white/10">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-black/60 text-[#00F0FF] focus:ring-[#00F0FF] cursor-pointer"
            />
            <span className="leading-relaxed font-sans text-[11px]">
              I acknowledge the examination duration and confirm that I will complete this assessment under honest academic principles without external assistance.
            </span>
          </label>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            Abort
          </button>
          <button
            type="button"
            disabled={!acknowledged}
            onClick={() => onConfirmStart(assessment)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02]"
          >
            <span>LAUNCH EXAMINATION COCKPIT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
