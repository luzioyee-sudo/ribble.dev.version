import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  CheckCheck,
  Flame,
  Brain,
  Target,
  MessageSquare,
  PenLine,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { AppNotification, AppView } from '../types';
import { notificationManager } from '../utils/notificationManager';
import { getTranslation } from '../utils/i18n';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  activeUserId: string;
  onNavigate?: (view: AppView) => void;
  settings?: any;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  activeUserId,
  onNavigate,
  settings,
}) => {
  const t = getTranslation(settings?.interfaceLanguage);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    notificationManager.getUserNotifications(activeUserId)
  );
  
  const [showSimulateBar, setShowSimulateBar] = useState<boolean>(false);

  const refreshNotifs = useCallback(() => {
    setNotifications(notificationManager.getUserNotifications(activeUserId));
  }, [activeUserId]);

  useEffect(() => {
    refreshNotifs();

    const handleUpdate = () => {
      refreshNotifs();
    };

    window.addEventListener('lingoflow_notifications_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('lingoflow_notifications_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshNotifs]);

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationManager.markAsRead(id, activeUserId);
    refreshNotifs();
  };

  const handleMarkAllRead = () => {
    notificationManager.markAllAsRead(activeUserId);
    refreshNotifs();
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationManager.dismissNotification(id, activeUserId);
    refreshNotifs();
  };

  const handleActionClick = (notif: AppNotification) => {
    handleMarkAsRead(notif.id);
    if (notif.actionUrl) {
      if (notif.actionUrl.startsWith('#')) {
        const view = notif.actionUrl.replace('#', '') as AppView;
        if (onNavigate) {
          onNavigate(view);
          onClose();
        } else {
          window.location.hash = notif.actionUrl;
          onClose();
        }
      } else if (notif.actionUrl.startsWith('http')) {
        window.open(notif.actionUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '12:49 AM';
    }
  };

  // Reusable Blue-Palette App Icon Badges matching iOS aesthetic
  const renderSourceLogo = (notif: AppNotification) => {
    const sender = (notif.senderName || '').toLowerCase();
    const title = (notif.title || '').toLowerCase();
    const badge = (notif.badgeText || '').toLowerCase();

    // Streak Reminder
    if (sender.includes('streak') || title.includes('streak') || badge.includes('streak')) {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#FF9500] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/40">
          <Flame className="w-5 h-5 fill-white/20 stroke-[2.3]" />
        </div>
      );
    }

    // Vocabulary Mastered
    if (sender.includes('vocab') || title.includes('mastered') || title.includes('flashcard') || badge.includes('mastered')) {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20">
          <Brain className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }

    // Daily Goal
    if (sender.includes('goal') || title.includes('goal') || badge.includes('goal')) {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20">
          <Target className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }

    // Practice Session
    if (sender.includes('speaking') || sender.includes('tutor') || title.includes('practice') || badge.includes('practice')) {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20">
          <MessageSquare className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }

    // Writing
    if (sender.includes('writing') || title.includes('writing') || title.includes('essay')) {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#5856D6] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20">
          <PenLine className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }

    // Announcements
    if (sender.includes('curriculum') || title.includes('boost') || notif.type === 'announcement') {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }

    // Default Brand Logo
    return (
      <div className="w-10 h-10 rounded-[14px] bg-[#1D1D1F] text-[#F5F5F7] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
        <BookOpen className="w-5 h-5 stroke-[2.2]" />
      </div>
    );
  };

  // Test triggers
  const handleTriggerTest = (type: 'streak' | 'vocab' | 'goal' | 'practice') => {
    if (type === 'streak') {
      notificationManager.triggerStreakReminder(6, activeUserId);
    } else if (type === 'vocab') {
      notificationManager.triggerWordMastered(15, 'Advanced Spanish Verbs', activeUserId);
    } else if (type === 'goal') {
      notificationManager.triggerDailyGoalProgress(20, 20, activeUserId);
    } else if (type === 'practice') {
      notificationManager.triggerPracticeInvite('Coach Sarah', 'Ordering Coffee & Pastries', activeUserId);
    }
  };

  // Spring physics transition configuration
  const springTransition = {
    type: 'spring' as const,
    stiffness: 280,
    damping: 28,
    mass: 0.85,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-6 md:p-8 pointer-events-auto overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-xs cursor-pointer z-40"
          />

          {/* Floating Notification Container */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={springTransition}
            className="relative z-50 w-full max-w-[420px] sm:max-w-[440px] mt-10 sm:mt-6 flex flex-col items-center select-none"
          >
            {/* Top Control Bar */}
            <div className="w-full flex items-center justify-between px-3.5 py-2 mb-2.5 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#007AFF] dark:bg-[#0A84FF] animate-pulse" />
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  {t.notificationsCenter || 'Notification Center'}
                </span>
                {notifications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-[10px] font-semibold">
                    {notifications.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Simulate / Test Alert */}
                <button
                  onClick={() => setShowSimulateBar(!showSimulateBar)}
                  className={`p-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    showSimulateBar
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A]'
                  }`}
                  title="Simulate incoming notifications"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="p-1.5 rounded-lg text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-all cursor-pointer"
                    title={t.markAllAsRead || "Mark all as read"}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-6 h-6 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Quick Test Alert Drawer */}
            <AnimatePresence>
              {showSimulateBar && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="w-full overflow-hidden bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-2xl p-2.5 border border-[#D1D1D6] dark:border-[#38383A] shadow-md"
                >
                  <div className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider mb-1.5 px-1">
                    Push Mock Notification (Language Learning Context)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTriggerTest('streak')}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold flex items-center gap-1.5 transition-all text-start cursor-pointer border border-[#D1D1D6] dark:border-[#38383A]"
                    >
                      <Flame className="w-3.5 h-3.5 text-[#FF9500]" />
                      <span className="truncate">Streak Reminder</span>
                    </button>
                    <button
                      onClick={() => handleTriggerTest('vocab')}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold flex items-center gap-1.5 transition-all text-start cursor-pointer border border-[#D1D1D6] dark:border-[#38383A]"
                    >
                      <Brain className="w-3.5 h-3.5 text-[#34C759]" />
                      <span className="truncate">Word Mastered</span>
                    </button>
                    <button
                      onClick={() => handleTriggerTest('goal')}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold flex items-center gap-1.5 transition-all text-start cursor-pointer border border-[#D1D1D6] dark:border-[#38383A]"
                    >
                      <Target className="w-3.5 h-3.5 text-[#34C759]" />
                      <span className="truncate">Daily Goal</span>
                    </button>
                    <button
                      onClick={() => handleTriggerTest('practice')}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold flex items-center gap-1.5 transition-all text-start cursor-pointer border border-[#D1D1D6] dark:border-[#38383A]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                      <span className="truncate">Practice Session</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMPTY STATE */}
            {notifications.length === 0 ? (
              <div className="w-full bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-2xl p-7 shadow-xl border border-[#D1D1D6] dark:border-[#38383A] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center mb-2 font-semibold">
                  <Bell className="w-6 h-6 text-[#007AFF] dark:text-[#0A84FF]" />
                </div>
                <h4 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  {t.noNotifications || 'No Notifications'}
                </h4>
                <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-[240px] leading-relaxed">
                  {t.noFlashcardsDueDesc || 'You are completely caught up! Streak alerts, mastered vocabulary, and coach invites will appear here.'}
                </p>
              </div>
            ) : (
              /* =========================================================
                 FULL VERTICAL LIST MODE
                 ========================================================= */
              <div 
                className="w-full max-h-[68vh] overflow-y-auto space-y-2.5 p-1 pe-1.5 no-scrollbar scroll-smooth"
                style={{ scrollBehavior: 'smooth' }}
              >
                <AnimatePresence initial={false}>
                  {notifications.map((notif) => {
                    const isUnread = !notif.readBy || !notif.readBy.includes(activeUserId);
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: -16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, x: 50 }}
                        transition={springTransition}
                        onClick={() => notif.actionText ? handleActionClick(notif) : handleMarkAsRead(notif.id)}
                        className={`w-full bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl text-[#1D1D1F] dark:text-[#F5F5F7] rounded-2xl p-3.5 sm:p-4 shadow-xs border transition-all relative group cursor-pointer ${
                          isUnread
                            ? 'border-[#007AFF]/40 dark:border-[#0A84FF]/40 ring-1 ring-[#007AFF]/20'
                            : 'border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/30'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {renderSourceLogo(notif)}

                          <div className="flex-1 min-w-0 pe-4">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h3 className="font-semibold text-[14px] text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight truncate">
                                {notif.title || notif.senderName || 'Notification'}
                              </h3>
                              <span className="text-[11px] text-[#8E8E93] font-normal shrink-0">
                                {formatTime(notif.createdAt)}
                              </span>
                            </div>

                            <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-snug font-normal">
                              {notif.message}
                            </p>

                            {notif.actionText && (
                              <div className="mt-2 pt-1.5 flex items-center justify-between">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActionClick(notif);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
                                >
                                  <span>{notif.actionText}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                                {isUnread && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                    className="text-[11px] text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] font-medium cursor-pointer"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDelete(notif.id, e)}
                          className="absolute top-3 end-3 w-5.5 h-5.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] text-[#8E8E93] hover:text-[#1D1D1F] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
