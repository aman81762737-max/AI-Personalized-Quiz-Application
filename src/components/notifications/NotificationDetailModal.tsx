import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  BarChart2,
  Target,
  Sliders,
  X,
  ArrowRight,
  Clock,
  CheckCircle2,
  BellOff,
  Building2,
} from 'lucide-react';
import { NotificationItem } from './NotificationCenterModal';

interface NotificationDetailModalProps {
  isOpen: boolean;
  notification: NotificationItem | null;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  notification,
  onClose,
  onNavigate,
}) => {
  // Close on Escape & Lock body scroll
  React.useEffect(() => {
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

  if (typeof document === 'undefined' || !isOpen || !notification) return null;

  const getTypeConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ai':
        return {
          icon: Sparkles,
          label: 'AI Curriculum Engine',
          badgeClass: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          gradientBg: 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white',
        };
      case 'exam':
        return {
          icon: ShieldCheck,
          label: 'Proctor Safeguard System',
          badgeClass: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          gradientBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white',
        };
      case 'analytics':
        return {
          icon: BarChart2,
          label: 'Diagnostic Performance Analytics',
          badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          gradientBg: 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white',
        };
      case 'practice':
        return {
          icon: Target,
          label: 'Adaptive Socratic Practice',
          badgeClass: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          gradientBg: 'bg-gradient-to-tr from-blue-600 to-cyan-600 text-white',
        };
      case 'system':
      default:
        return {
          icon: Sliders,
          label: 'Security & System Health',
          badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          gradientBg: 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white',
        };
    }
  };

  const cfg = getTypeConfig(notification.type);
  const IconComponent = cfg.icon;

  const handleAction = () => {
    if (notification.actionView && onNavigate) {
      onClose();
      onNavigate(notification.actionView);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          className="fixed inset-0 bg-slate-950/75 cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          className="relative w-full max-w-xl bg-[#0A0D14]/95 text-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden z-10 my-auto backdrop-blur-2xl"
        >
          {/* Top Banner with Type Branding */}
          <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl ${cfg.gradientBg} flex items-center justify-center shrink-0 shadow-md`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                    {cfg.label}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Cleared from Bell</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{notification.time}</span>
                  {notification.sender && (
                    <>
                      <span>·</span>
                      <span>From: {notification.sender}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Close message"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Message Body */}
          <div className="p-6 sm:p-7 space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {notification.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {notification.desc}
              </p>
            </div>

            {/* Complete Detailed Message Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Full Notification Message:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {notification.fullMessage || notification.desc}
              </p>
            </div>

            {/* Status notice */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
              <BellOff className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                This alert has been marked as read and removed from your dashboard bell icon count.
              </span>
            </div>
          </div>

          {/* Read-Only Action Footer */}
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              Read-only system notification
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer"
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
