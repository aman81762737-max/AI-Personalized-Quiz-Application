import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  BarChart2,
  Target,
  Sliders,
  Trash2,
  Check,
  Search,
  X,
  Inbox,
  Clock,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';

import { NotificationDetailModal } from './NotificationDetailModal';

export interface NotificationItem {
  id: number | string;
  notificationDocId?: string;
  title: string;
  time: string;
  desc: string;
  fullMessage?: string;
  sender?: string;
  type: 'ai' | 'exam' | 'analytics' | 'practice' | 'system';
  unread: boolean;
  priority?: 'high' | 'normal' | 'low';
  actionView?: string;
  actionLabel?: string;
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onToggleRead: (id: string | number) => void;
  onDeleteNotification: (id: string | number) => void;
  onClearAll: () => void;
  onNavigate?: (view: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onToggleRead,
  onDeleteNotification,
  onClearAll,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'ai' | 'exam' | 'analytics'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailNotification, setSelectedDetailNotification] = useState<NotificationItem | null>(null);

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

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Filter notifications based on active tab and live search
  const filteredNotifications = notifications.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.desc.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'unread') return n.unread;
    if (activeTab === 'ai') return n.type === 'ai';
    if (activeTab === 'exam') return n.type === 'exam';
    if (activeTab === 'analytics') return n.type === 'analytics';
    return true;
  });

  const handleItemClick = (n: NotificationItem) => {
    // Show the full message in detail modal
    setSelectedDetailNotification(n);
    // Dismiss/remove from the dashboard notification bell icon list
    onDeleteNotification(n.id);
  };

  const getCategoryConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ai':
        return {
          icon: Sparkles,
          label: 'AI Synthesis',
          badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
        };
      case 'exam':
        return {
          icon: ShieldCheck,
          label: 'Exam & Proctor',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
        };
      case 'analytics':
        return {
          icon: BarChart2,
          label: 'Diagnostic',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
        };
      case 'practice':
        return {
          icon: Target,
          label: 'Adaptive Practice',
          badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
        };
      case 'system':
      default:
        return {
          icon: Sliders,
          label: 'System & Security',
          badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          iconBg: 'bg-gradient-to-br from-slate-600 to-slate-800 text-white',
        };
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Deep blur backdrop with full click-to-close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            className="fixed inset-0 bg-slate-950/80 cursor-pointer"
          />

          {/* Modal Container centered squarely in the viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 360,
            }}
            className="relative w-full max-w-2xl my-auto bg-[#0A0D14]/95 text-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden flex flex-col max-h-[85vh] z-10 backdrop-blur-2xl"
          >
            {/* Pinned Top Section: Guaranteed crisp, solid, and NEVER shrinks */}
            <div className="shrink-0 bg-[#0A0D14] border-b border-white/10 relative z-20">
              {/* Header */}
              <div className="p-5 sm:p-6 pb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <motion.div
                    initial={{ rotate: -15, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 14 }}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0"
                  >
                    <Bell className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Notification Center
                      </h2>
                      {unreadCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                          {unreadCount} unread
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" /> All caught up
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real-time AI question calibration, security locks, and learning analytics.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Close notification center"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Search & Actions Bar */}
              <div className="px-5 sm:px-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notifications by keyword, topic, or event..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onMarkAllRead}
                    disabled={unreadCount === 0}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      unreadCount > 0
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800'
                        : 'opacity-40 text-slate-400 cursor-not-allowed border border-transparent'
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark All Read</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onClearAll}
                    disabled={notifications.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </motion.button>
                </div>
              </div>

              {/* Category Navigation Tabs */}
              <div className="px-5 sm:px-6 pb-3 overflow-x-auto">
                <div className="flex items-center gap-1.5 min-w-max p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {[
                    { id: 'all', label: 'All', count: notifications.length },
                    { id: 'unread', label: 'Unread', count: unreadCount },
                    { id: 'ai', label: 'AI Synthesis', count: notifications.filter((n) => n.type === 'ai').length },
                    { id: 'exam', label: 'Exams', count: notifications.filter((n) => n.type === 'exam').length },
                    { id: 'analytics', label: 'Diagnostics', count: notifications.filter((n) => n.type === 'analytics').length },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isActive
                                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scrollable Notification Cards List: cleanly separated in its own container */}
            <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-3 bg-slate-50/60 dark:bg-[#0B1120]/60">
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-14 text-center space-y-3"
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700">
                      <Inbox className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {searchQuery ? 'No matching notifications' : 'No notifications in this folder'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {searchQuery
                          ? `No activity matched "${searchQuery}". Clear your search query to see all notifications.`
                          : 'You are completely caught up! New exam attempts, question generation alerts, and diagnostics will arrive here.'}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  filteredNotifications.map((n, index) => {
                    const cfg = getCategoryConfig(n.type);
                    const IconComponent = cfg.icon;
                    const itemKey = `center-notif-${n.notificationDocId || n.id || index}`;

                    return (
                      <motion.div
                        key={itemKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => handleItemClick(n)}
                        className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          n.unread
                            ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/60 shadow-xs hover:border-blue-400 dark:hover:border-blue-600'
                            : 'bg-white/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Left Icon with Gradient */}
                          <div
                            className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`text-xs font-bold ${
                                    n.unread
                                      ? 'text-slate-900 dark:text-white'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {n.title}
                                </h4>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}
                                >
                                  {cfg.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{n.time}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {n.desc}
                            </p>

                            {/* Card Footer Actions */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(n);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                  <span>View Message</span>
                                </button>

                                {/* Toggle Read */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleRead(n.id);
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                    n.unread
                                      ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{n.unread ? 'Mark as read' : 'Mark unread'}</span>
                                </button>
                              </div>

                              {/* Dismiss notification */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(n.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all cursor-pointer"
                                title="Dismiss notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unread Glowing Dot */}
                        {n.unread && (
                          <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600 shadow-sm shadow-blue-500 animate-pulse" />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Modal Bottom Footer */}
            <div className="shrink-0 p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Showing {filteredNotifications.length} of {notifications.length} alerts</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Message Detail View */}
      <NotificationDetailModal
        isOpen={!!selectedDetailNotification}
        notification={selectedDetailNotification}
        onClose={() => setSelectedDetailNotification(null)}
        onNavigate={(view) => {
          setSelectedDetailNotification(null);
          onClose();
          if (onNavigate) onNavigate(view);
        }}
      />
    </AnimatePresence>,
    document.body
  );
};
