import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import {
  LogOut,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Settings,
  Bell,
  Plus,
  FileText,
  Target,
  MessageSquare,
  CheckCircle2,
  FileCheck,
  Sliders,
  BarChart2,
  Users,
  Inbox,
  Filter,
  Zap,
  Radio,
  Terminal,
  Sun,
  Moon,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NotificationCenterModal, NotificationItem } from '../notifications/NotificationCenterModal';
import { NotificationDetailModal } from '../notifications/NotificationDetailModal';
import { QuickNotesModal } from '../common/QuickNotesModal';
import { ProfileModal } from '../common/ProfileModal';
import {
  subscribeNotifications,
  markNotificationReadInCloud,
  markAllNotificationsReadInCloud,
  toggleNotificationReadInCloud,
  deleteNotificationFromCloud,
  clearAllNotificationsFromCloud,
} from '../../services/cloudSyncService';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onOpenAITheme?: () => void;
  onOpenThemeModal?: () => void;
  onOpenGenerateModal?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenAITheme,
  onOpenThemeModal,
  onOpenGenerateModal,
  sidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const { userProfile, role, logout } = useAuth();
  const { isDark, customAITheme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const isAuthPage = currentView === 'auth' || currentView === 'login';
  const isLandingPage = currentView === 'landing';
  const isPublicPage = isAuthPage || isLandingPage;

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [quickNotesOpen, setQuickNotesOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedDetailNotification, setSelectedDetailNotification] = useState<NotificationItem | null>(null);

  const quickActionRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setQuickActionOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);

  // Real-time Cloud Notifications Sync
  useEffect(() => {
    const targetUserId = userProfile?.userId || 'all';
    const unsub = subscribeNotifications(targetUserId, role || 'student', (list) => {
      if (Array.isArray(list)) {
        const seenDocIds = new Set<string>();
        const formatted: NotificationItem[] = [];
        list.forEach((item, idx) => {
          let docId = String(item.notificationDocId || item.notificationId || item.id || `seed-${role || 'student'}-${idx}`);
          if (seenDocIds.has(docId)) {
            docId = `${docId}-${idx}`;
          }
          seenDocIds.add(docId);
          formatted.push({
            id: docId,
            notificationDocId: docId,
            title: item.title || 'Academic Alert',
            time: item.time || 'Recent',
            desc: item.desc || item.body || '',
            fullMessage: item.fullMessage,
            sender: item.sender || 'System',
            type: item.type || 'system',
            unread: item.unread !== false && !item.read,
            priority: item.priority || 'normal',
            actionView: item.actionView,
            actionLabel: item.actionLabel,
          });
        });
        setNotificationsList(formatted);
      }
    });

    return () => unsub();
  }, [userProfile?.userId, role]);

  const unreadCount = notificationsList.filter((n) => n.unread).length;

  const handleOpenNotificationDetail = (n: NotificationItem) => {
    setSelectedDetailNotification(n);
    setNotificationsOpen(false);
    // Mark as read in state
    setNotificationsList((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, unread: false, read: true } : item))
    );
    // Update local cache immediately
    const targetUserId = userProfile?.userId || 'all';
    const userRole = role || 'student';
    const localKey = `notifications_${targetUserId}_${userRole}`;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((item: any) =>
            item.id === n.id ? { ...item, unread: false, read: true } : item
          );
          localStorage.setItem(localKey, JSON.stringify(updated));
        }
      }
    } catch {}
    markNotificationReadInCloud(n.id, userRole).catch(() => {});
  };

  const handleMarkAllRead = () => {
    // 1. Immediately update React state so bell badge disappears (count drops to 0) and cards show read
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false, read: true })));

    // 2. Immediately update local storage cache so it persists across re-renders
    const targetUserId = userProfile?.userId || 'all';
    const userRole = role || 'student';
    const localKey = `notifications_${targetUserId}_${userRole}`;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((item: any) => ({ ...item, unread: false, read: true }));
          localStorage.setItem(localKey, JSON.stringify(updated));
        }
      }
    } catch {}

    // 3. Mark all read in Cloud Firestore
    markAllNotificationsReadInCloud(targetUserId, userRole, notificationsList).catch(() => {});
    showToast('All notifications marked as read', 'success');
  };

  const handleToggleRead = (id: string | number) => {
    const item = notificationsList.find((n) => n.id === id);
    const newUnread = item ? !item.unread : false;
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread, read: n.unread } : n))
    );
    toggleNotificationReadInCloud(id, newUnread).catch(() => {});
  };

  const handleDeleteNotification = (id: string | number) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    deleteNotificationFromCloud(id).catch(() => {});
    showToast('Notification dismissed', 'info');
  };

  const handleClearAll = () => {
    const ids = notificationsList.map((n) => n.id);
    const targetUserId = userProfile?.userId || 'all';
    const userRole = role || 'student';
    setNotificationsList([]);
    try {
      localStorage.setItem(`notifications_${targetUserId}_${userRole}`, '[]');
      localStorage.setItem(`notifications_${targetUserId}`, '[]');
      localStorage.setItem(`notifications_cleared_${targetUserId}_${userRole}`, Date.now().toString());
    } catch {}
    clearAllNotificationsFromCloud(targetUserId, ids, userRole).catch(() => {});
    showToast('Cleared all notifications', 'info');
  };

  return (
    <header
      style={customAITheme ? {
        backgroundColor: customAITheme.surface || customAITheme.card,
        borderColor: customAITheme.border,
        color: customAITheme.text,
      } : undefined}
      className={`sticky top-0 z-40 w-full ${
        customAITheme
          ? ''
          : isDark
          ? 'bg-[#07090E]/95 border-white/10 text-white'
          : 'bg-white/95 border-slate-200 text-black shadow-xs'
      } backdrop-blur-xl border-b transition-colors`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Section: Brand & Academic Term Badge */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onNavigate(userProfile ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl brand-ai-gradient flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'} group-hover:text-[#00F0FF] transition-colors leading-none font-mono`}>
                AI-IAPLP
              </span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
                Tactical Assessment Platform
              </span>
            </div>
          </button>

          {onToggleSidebar && !isPublicPage && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-all cursor-pointer hidden md:flex items-center justify-center ${
                isDark
                  ? 'border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={sidebarCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Retract / Collapse Sidebar (Ctrl+B)'}
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#00F0FF]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Center Section: Clean spacing matching landing design */}
        <div className="flex-1" />

        {/* Right Section: Workflow Actions & System Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Universal Bright / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center ${
              isDark
                ? 'text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
            }`}
            title={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {isAuthPage ? (
            <button
              onClick={() => onNavigate('landing')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold ${
                isDark
                  ? 'text-white bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300'
              } rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0`}
            >
              <span>← Return to Home</span>
            </button>
          ) : isLandingPage ? (
            <>
              {userProfile ? (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer hover:scale-[1.02]"
                >
                  <span>GO TO COCKPIT</span>
                  <span>→</span>
                </button>
              ) : null}
            </>
          ) : (
            <>
              {userProfile && (
                <>
                  {/* Quick Action Workflow Dropdown */}
                  <div className="relative" ref={quickActionRef}>
                    <button
                      type="button"
                      onClick={() => setQuickActionOpen(!quickActionOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">QUICK ACTION</span>
                      <ChevronDown className={`w-3 h-3 ml-0.5 opacity-80 transition-transform duration-200 ${quickActionOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {quickActionOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className={`absolute right-0 mt-2 w-64 ${
                            isDark
                              ? 'bg-[#0A0D14]/95 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
                              : 'bg-white border-slate-200 shadow-2xl'
                          } rounded-2xl border py-2 z-50 text-xs backdrop-blur-xl`}
                        >
                          <div className={`px-3.5 py-1.5 text-[10px] font-mono font-bold ${
                            isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-100'
                          } uppercase tracking-widest border-b`}>
                            {role} TACTICAL ACTIONS
                          </div>

                          {role === 'teacher' && (
                            <div className="p-1.5 space-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onNavigate('create-assessment');
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <FileText className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Draft Assessment</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Configure timed proctored exam & questions</div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onNavigate('cohort');
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <Users className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Cohort Telemetry</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Inspect enrolled student progression & mastery</div>
                                </div>
                              </button>
                            </div>
                          )}

                          {role === 'student' && (
                            <div className="p-1.5 space-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  setQuickNotesOpen(true);
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>AI Last-Minute Cheat Sheet</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>3-min high-yield exam summary</div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onNavigate('practice');
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <Target className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Start Adaptive Drill</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Calibrated to current gaps & concepts</div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onNavigate('ai-tutor');
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <MessageSquare className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Ask Socratic AI Tutor</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Grounded syllabus assistance & hints</div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onNavigate('assessments');
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <FileText className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Active Exam Room</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Launch verified proctored test</div>
                                </div>
                              </button>
                            </div>
                          )}

                          {role === 'admin' && (
                            <div className="p-1.5 space-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onNavigate('admin-users');
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <Users className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Manage Accounts</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Educator & student roles & profiles</div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onNavigate('admin-system');
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left ${
                                  isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-black'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Security & Audit Logs</div>
                                  <div className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Platform health & proctor telemetry</div>
                                </div>
                              </button>
                            </div>
                          )}

                          {onOpenAITheme && (
                            <div className="p-1 border-t border-white/10 dark:border-white/10 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActionOpen(false);
                                  onOpenAITheme();
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${
                                  isDark ? 'hover:bg-white/5 text-cyan-300' : 'hover:bg-cyan-50 text-cyan-800'
                                } font-medium cursor-pointer transition-colors rounded-xl`}
                              >
                                <Sparkles className="w-4 h-4 text-[#00F0FF] shrink-0" />
                                <div>
                                  <div className={`font-mono text-xs ${isDark ? 'text-white' : 'text-black font-semibold'}`}>AI Theme Studio</div>
                                  <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Re-color full platform with Gemini</div>
                                </div>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Notification Center */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Telemetry Notifications"
                      aria-label="View notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white flex items-center justify-center ring-2 ring-[#07090E] shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {notificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className={`absolute right-0 mt-2 w-72 sm:w-84 ${
                            isDark
                              ? 'bg-[#0A0D14]/95 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
                              : 'bg-white border-slate-200 shadow-2xl'
                          } rounded-2xl border py-2 z-50 overflow-hidden backdrop-blur-xl`}
                        >
                          <div className={`px-4 py-2 border-b ${
                            isDark ? 'border-white/10' : 'border-slate-100'
                          } flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono font-bold ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}>
                                NOTIFICATIONS
                              </span>
                              {unreadCount > 0 && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                                  {unreadCount} NEW
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              disabled={unreadCount === 0}
                              className={`text-[10px] font-mono transition-colors cursor-pointer ${
                                unreadCount > 0
                                  ? isDark ? 'text-[#00F0FF] hover:underline' : 'text-blue-600 hover:underline'
                                  : 'text-slate-400 cursor-default'
                              }`}
                            >
                              Mark all read
                            </button>
                          </div>

                          <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'} max-h-80 overflow-y-auto`}>
                            {notificationsList.length === 0 ? (
                              <div className="p-6 text-center text-xs text-slate-400 font-mono">
                                No telemetry alerts.
                              </div>
                            ) : (
                              notificationsList.map((n, idx) => (
                                <div
                                  key={`nav-notif-${n.id || 'item'}-${idx}`}
                                  onClick={() => handleOpenNotificationDetail(n)}
                                  className={`p-3 text-xs transition-colors cursor-pointer ${
                                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                                  } group ${
                                    n.unread ? (isDark ? 'bg-[#00F0FF]/5' : 'bg-blue-50/60') : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {n.unread && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#00F0FF]' : 'bg-blue-600'} shrink-0 animate-pulse`} />
                                      )}
                                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} truncate font-mono text-xs`}>
                                        {n.title}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                                      {n.time}
                                    </span>
                                  </div>
                                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 leading-snug line-clamp-2 font-sans`}>
                                    {n.desc}
                                  </p>
                                  <div className={`mt-2 flex items-center justify-between text-[10px] ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                  } font-mono`}>
                                    <span>System alert</span>
                                    <span className="text-[10px] text-[#00F0FF]">Click to read</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className={`pt-2 px-3 border-t ${
                            isDark ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-slate-50'
                          } text-center`}>
                            <button
                              type="button"
                              onClick={() => {
                                setNotificationsOpen(false);
                                setViewAllModalOpen(true);
                              }}
                              className={`w-full py-1.5 text-center text-xs font-mono font-bold ${
                                isDark ? 'text-[#00F0FF] hover:bg-white/5' : 'text-blue-600 hover:bg-slate-100'
                              } rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1`}
                            >
                              <span>VIEW ALL NOTIFICATIONS ({notificationsList.length})</span>
                              <span>→</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <NotificationDetailModal
                    isOpen={!!selectedDetailNotification}
                    notification={selectedDetailNotification}
                    onClose={() => setSelectedDetailNotification(null)}
                  />

                  <NotificationCenterModal
                    isOpen={viewAllModalOpen}
                    onClose={() => setViewAllModalOpen(false)}
                    notifications={notificationsList}
                    onMarkAllRead={handleMarkAllRead}
                    onToggleRead={handleToggleRead}
                    onDeleteNotification={handleDeleteNotification}
                    onClearAll={handleClearAll}
                  />

                  <QuickNotesModal
                    isOpen={quickNotesOpen}
                    onClose={() => setQuickNotesOpen(false)}
                    initialTopic=""
                    autoGenerate={false}
                    role={role === 'teacher' ? 'teacher' : 'student'}
                    onStartPractice={() => onNavigate('practice')}
                  />
                </>
              )}



              {userProfile ? (
                <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  {/* Clickable Profile Picture navigating to dedicated Profile page */}
                  <button
                    type="button"
                    onClick={() => onNavigate('profile')}
                    className={`flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-2xl ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    } transition-all cursor-pointer group relative`}
                    title="Open Academic Profile Dossier & Settings"
                  >
                    {/* Avatar Container with Online Indicator & Pencil overlay */}
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#00F0FF]/50 border border-white/20 bg-[#0B0F17] flex items-center justify-center shrink-0 shadow-sm group-hover:ring-[#00F0FF] transition-all">
                        {userProfile.avatarUrl || userProfile.profilePhoto ? (
                          <img
                            src={userProfile.avatarUrl || userProfile.profilePhoto}
                            alt={userProfile.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <span className="text-xs font-bold font-serif text-white">
                            {userProfile.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>

                      {/* Online Active Dot */}
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] ring-2 ring-[#07090E] absolute -bottom-0.5 -right-0.5 animate-pulse" />

                      {/* Pencil Icon Badge on Avatar Hover */}
                      <span className="absolute inset-0 rounded-full bg-black/60 text-[#00F0FF] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px]">
                        <Pencil className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Name & Academic Role */}
                    <div className="hidden lg:flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-mono font-bold ${
                          isDark ? 'text-white group-hover:text-[#00F0FF]' : 'text-slate-900 group-hover:text-blue-600'
                        } leading-tight truncate max-w-[120px] transition-colors`}>
                          {userProfile.name}
                        </span>
                        <Pencil className="w-2.5 h-2.5 text-slate-400 group-hover:text-[#00F0FF] transition-colors" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">
                        {userProfile.year || role}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      onNavigate('landing');
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] whitespace-nowrap cursor-pointer hover:scale-[1.02]"
                >
                  SIGN IN
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
