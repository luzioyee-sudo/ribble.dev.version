import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats, VocabularyItem, ReaderSettings, AppView, DocumentFile } from '../types';
import { getLocalDateString, calculateStreak } from '../utils/stats';
import { getTranslation, SupportedLanguage } from '../utils/i18n';
import { getEffectiveAvatar } from '../utils/defaultAvatars';
import { Search, Bell, BookOpen, GraduationCap, ClipboardCheck, RefreshCw, ChevronDown, ShieldCheck, Plus, ChevronRight, Flame, Target, Sparkles, Zap } from 'lucide-react';
import { storage } from '../utils/storage';
import { LANGUAGE_OPTIONS } from './DualFlagLanguageSelector';
import { tracker, useTrackSectionVisibility } from '../utils/tracker';
import { THE_BLUE_NOTEBOOK_DOC } from '../data/theBlueNotebook';

const DEFAULT_CONTINUE_BOOKS: Array<DocumentFile & { coverGradient?: string }> = [
  {
    ...THE_BLUE_NOTEBOOK_DOC,
    coverGradient: 'from-[#0F4C5C] via-[#163F50] to-[#0A2E38]',
  },
  {
    id: 'sample-book-1',
    name: 'Brilliant Ideas & Notes',
    title: 'Brilliant Ideas & Notes',
    author: 'Lingoflow Studio',
    language: 'English',
    fileType: 'sample',
    size: 1024,
    uploadedAt: 1700000000300,
    lastReadAt: 1700000000300,
    currentPage: 18,
    totalPages: 120,
    coverColor: '#728591',
    coverGradient: 'from-[#728591] via-[#5D6F7A] to-[#4B5963]',
    isSample: true,
  },
  {
    id: 'sample-book-2',
    name: 'Read People Like a Book',
    title: 'Read People Like a Book',
    author: 'Patrick King',
    language: 'English',
    fileType: 'sample',
    size: 1024,
    uploadedAt: 1700000000200,
    lastReadAt: 1700000000200,
    currentPage: 34,
    totalPages: 240,
    coverColor: '#1F3A4B',
    coverGradient: 'from-[#1F3A4B] via-[#172D3A] to-[#101E28]',
    isSample: true,
  },
  {
    id: 'sample-book-3',
    name: 'The Body Keeps the Score',
    title: 'The Body Keeps the Score',
    author: 'Bessel van der Kolk, M.D.',
    language: 'English',
    fileType: 'sample',
    size: 1024,
    uploadedAt: 1700000000100,
    lastReadAt: 1700000000100,
    currentPage: 88,
    totalPages: 464,
    coverColor: '#D98236',
    coverGradient: 'from-[#D98236] via-[#BE6A22] to-[#984E13]',
    isSample: true,
  },
];

interface HomeViewProps {
  userStats: UserStats;
  vocabulary: VocabularyItem[];
  documents?: DocumentFile[];
  onSelectDocument?: (doc: DocumentFile) => void;
  settings?: ReaderSettings;
  onNavigate?: (view: AppView) => void;
  onTriggerOnboarding?: () => void;
  currentUserRole?: string;
  userName?: string;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

type ProgressTimeframe = 'week' | 'month' | 'year';

// Locale tags map for standard BCP 47 locale parameters
const localeMap: Record<SupportedLanguage, string> = {
  English: 'en-US',
  French: 'fr-FR',
  Arabic: 'ar-SA',
  Spanish: 'es-ES',
  German: 'de-DE'
};

// Localized titles for progress charts
const chartTitles: Record<SupportedLanguage, { week: string; year: string; month: string }> = {
  English: {
    week: 'Daily Actions',
    year: 'Yearly Vocabulary',
    month: 'Words Over Time'
  },
  French: {
    week: 'Actions quotidiennes',
    year: 'Vocabulaire annuel',
    month: 'Évolution des mots'
  },
  Arabic: {
    week: 'الأنشطة اليومية',
    year: 'المفردات السنوية',
    month: 'الكلمات بمرور الوقت'
  },
  Spanish: {
    week: 'Acciones diarias',
    year: 'Vocabulario anual',
    month: 'Palabras a lo largo del tiempo'
  },
  German: {
    week: 'Tägliche Aktionen',
    year: 'Jährlicher Wortschatz',
    month: 'Wortschatzentwicklung'
  }
};

// HomeView Component
// Acts as the primary dashboard for the user upon logging in.
// Features:
// 1. Heatmap display showing daily activity streaks and study history
// 2. High-level metric summary (Total learned, Daily goal progress)
// 3. Quick-start action buttons linking to Reader and Flashcard sections
export const HomeView: React.FC<HomeViewProps> = ({ 
  userStats, 
  vocabulary, 
  documents,
  onSelectDocument,
  settings, 
  onNavigate, 
  onTriggerOnboarding,
  currentUserRole, 
  userName, 
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount = 0
}) => {
  const currentLang = (settings?.interfaceLanguage || settings?.targetLanguage || 'English') as SupportedLanguage;
  const t = getTranslation(currentLang);
  const displayName = userName || settings?.userName || 'Learner';
  const activeLocale = localeMap[currentLang] || 'en-US';
  const dailyGoal = userStats.dailyGoal || 10;

  // Active user ID for storage queries
  const activeId = localStorage.getItem('lingoflow_current_user_id') || 'usr-1';

  // Sort and retrieve the 3 most recently read or uploaded books
  const continueReadingBooks = useMemo(() => {
    const userDocs = (documents && documents.length > 0 
      ? documents 
      : storage.getDocuments(activeId)) || [];

    const sorted = [...userDocs].sort((a, b) => {
      const timeA = a.lastReadAt || a.uploadedAt || 0;
      const timeB = b.lastReadAt || b.uploadedAt || 0;
      return timeB - timeA;
    });

    const result: Array<DocumentFile & { coverGradient?: string }> = [];
    
    // Add user documents
    sorted.forEach((doc) => {
      if (result.length < 3) {
        result.push(doc);
      }
    });

    // Fill remaining slots up to 3 with DEFAULT_CONTINUE_BOOKS if needed
    DEFAULT_CONTINUE_BOOKS.forEach((defDoc) => {
      if (result.length < 3 && !result.some((r) => r.id === defDoc.id || r.title === defDoc.title)) {
        result.push(defDoc);
      }
    });

    return result.slice(0, 3);
  }, [documents, activeId]);
  const [timeframe, setTimeframe] = useState<30 | 100 | 150>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 30;
    }
    return 150;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeframe(30);
    }
  }, []);
  const [progressTimeframe, setProgressTimeframe] = useState<ProgressTimeframe>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Analytics Visibility Tracking Refs
  const statsOverviewRef = useRef<HTMLDivElement>(null);
  const vocabChartRef = useRef<HTMLDivElement>(null);
  const languageProfilesRef = useRef<HTMLDivElement>(null);

  useTrackSectionVisibility('stats_overview', statsOverviewRef);
  useTrackSectionVisibility('vocabulary_chart', vocabChartRef);
  useTrackSectionVisibility('language_profiles_status', languageProfilesRef);

  // Global stable aggregation across all language profiles
  const globalStats = useMemo(() => {
    let totalVocabAll = 0;
    let totalLearnedAll = 0;
    let totalMasteredAll = 0;
    let totalReviewsAll = 0;
    let totalLapsesAll = 0;
    let maxStreakAll = 0;
    const combinedHistory: Record<string, number> = {};
    const langStatuses: Array<{ name: string; flag: string; vocab: number; books: number; streak: number; status: string }> = [];

    LANGUAGE_OPTIONS.forEach(lang => {
      const cleanLang = lang.name.toLowerCase().trim().replace(/\s+/g, '_');
      const vocab = storage.getVocabulary(activeId, cleanLang);
      const docs = storage.getDocuments(activeId, cleanLang);
      const stats = storage.getUserStats(activeId, cleanLang);

      const streak = stats?.currentStreak || 0;
      if (streak > maxStreakAll) maxStreakAll = streak;

      totalVocabAll += vocab.length;
      const learned = vocab.filter(v => v.srs && (v.srs.state !== 'new' || v.srs.repetitions > 0)).length;
      totalLearnedAll += learned;
      const mastered = vocab.filter(v => v.srs && v.srs.state === 'review' && v.srs.intervalDays >= 21).length;
      totalMasteredAll += mastered;
      totalReviewsAll += vocab.reduce((acc, v) => acc + (v.srs?.repetitions || 0), 0);
      totalLapsesAll += vocab.reduce((acc, v) => acc + (v.srs?.lapses || 0), 0);

      if (stats && stats.activityHistory) {
        Object.entries(stats.activityHistory).forEach(([dateStr, count]) => {
          combinedHistory[dateStr] = Math.max(combinedHistory[dateStr] || 0, count as number);
        });
      }

      const isActive = vocab.length > 0 || docs.length > 0 || streak > 0;
      if (isActive) {
        langStatuses.push({
          name: lang.name,
          flag: lang.flag,
          vocab: vocab.length,
          books: docs.length,
          streak,
          status: 'Active'
        });
      }
    });

    const globalStreak = calculateStreak(combinedHistory, dailyGoal);
    const effectiveStreak = Math.max(globalStreak, maxStreakAll);

    return {
      totalVocabAll,
      totalLearnedAll,
      totalMasteredAll,
      totalReviewsAll,
      totalLapsesAll,
      effectiveStreak,
      combinedHistory,
      langStatuses
    };
  }, [activeId, dailyGoal, vocabulary, userStats]);

  const currentStreak = globalStats.effectiveStreak;
  const activityHistory = globalStats.combinedHistory;

  // 2. Calculate Today's Goal Progress
  const todayStr = getLocalDateString(new Date());
  const todayActivity = activityHistory[todayStr] || 0;
  const todayRatio = dailyGoal > 0 ? todayActivity / dailyGoal : 0;
  const goalProgress = Math.min(100, Math.round(todayRatio * 100));

  // 3. Calculate Words Mastered & Learned
  const wordsLearned = globalStats.totalLearnedAll;
  const wordsMastered = globalStats.totalMasteredAll;
  const totalWords = globalStats.totalVocabAll;
  const totalReviews = globalStats.totalReviewsAll;
  const totalLapses = globalStats.totalLapsesAll;
  const retentionRate = totalReviews > 0 ? Math.max(0, Math.min(100, Math.round(((totalReviews - totalLapses) / totalReviews) * 100))) : 0;

  // 4. Generate the last N days of activity for Intensity Heatmap in chronological order (oldest to today)
  const now = new Date();
  const daysData = [];
  for (let i = timeframe - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = getLocalDateString(d);
    const activity = activityHistory[dStr] || 0;
    const ratio = dailyGoal > 0 ? activity / dailyGoal : 0;

    let colorClass = "bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A]"; // 0% activity
    let label = t.noActivity || "No activity";

    if (activity > 0) {
      if (ratio < 0.35) {
        colorClass = "bg-[#007AFF]/20 dark:bg-[#0A84FF]/25 text-[#007AFF] dark:text-[#0A84FF]";
        label = `${activity} ${t.actionsCount || 'actions'}`;
      } else if (ratio < 0.75) {
        colorClass = "bg-[#007AFF]/50 dark:bg-[#0A84FF]/55 text-white";
        label = `${activity} ${t.actionsCount || 'actions'}`;
      } else if (ratio < 1.15) {
        colorClass = "bg-[#007AFF] text-white";
        label = `${activity} ${t.actionsCount || 'actions'}`;
      } else {
        colorClass = "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] shadow-xs";
        label = `${activity} ${t.actionsCount || 'actions'} (${t.dailyGoalMet || 'daily goal met!'})`;
      }
    }

    daysData.push({
      dateStr: dStr,
      dayNumber: timeframe - i,
      isToday: i === 0,
      activity,
      ratio,
      colorClass,
      label,
      formattedDate: d.toLocaleDateString(activeLocale, { month: 'short', day: 'numeric' })
    });
  }

  // Grid class layout based on chosen timeframe
  const gridClass = timeframe === 30 
    ? "grid-cols-10 sm:grid-cols-15 gap-1.5 md:gap-2" 
    : timeframe === 100 
    ? "grid-cols-10 sm:grid-cols-20 gap-1 sm:gap-1.5 md:gap-2" 
    : "grid-cols-10 sm:grid-cols-30 gap-1 sm:gap-1.5 md:gap-2";

  // Dynamic search results for vocabulary words
  const filteredVocabulary = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return vocabulary
      .filter(v => v.word.toLowerCase().includes(query) || v.translation.toLowerCase().includes(query))
      .slice(0, 5);
  }, [searchQuery, vocabulary]);

  // Due flashcards count
  const dueFlashcardsCount = vocabulary.filter((v) => v.srs && v.srs.dueAt <= Date.now()).length;

  // Chart data sets dynamically calculated from actual user activity & vocabulary
  const chartData = useMemo(() => {
    const now = new Date();
    switch (progressTimeframe) {
      case 'week': {
        // Daily Activity over the past 7 days
        const labels: string[] = [];
        const values: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dStr = getLocalDateString(d);
          const dayName = d.toLocaleDateString(activeLocale, { weekday: 'short' });
          labels.push(dayName);
          values.push(activityHistory[dStr] || 0);
        }
        return {
          labels,
          values,
          title: chartTitles[currentLang]?.week || 'Daily Actions'
        };
      }
      case 'year': {
        // Vocabulary growth over the past 6 bi-monthly intervals
        const labels: string[] = [];
        const values: number[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i * 2 + 1, 0, 23, 59, 59);
          const monthName = d.toLocaleDateString(activeLocale, { month: 'short' });
          labels.push(monthName);
          const count = vocabulary.filter(v => (v.dateAdded || 0) <= d.getTime()).length;
          values.push(count);
        }
        return {
          labels,
          values,
          title: chartTitles[currentLang]?.year || 'Yearly Vocabulary'
        };
      }
      case 'month':
      default: {
        // Vocabulary growth over 5 intervals in the last 30 days
        const labels: string[] = [];
        const values: number[] = [];
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const dateLabel = d.toLocaleDateString(activeLocale, { month: 'short', day: 'numeric' });
          labels.push(dateLabel);
          const count = vocabulary.filter(v => (v.dateAdded || 0) <= d.getTime()).length;
          values.push(count);
        }
        return {
          labels,
          values,
          title: chartTitles[currentLang]?.month || 'Words Over Time'
        };
      }
    }
  }, [progressTimeframe, activityHistory, vocabulary, activeLocale, currentLang]);

  // SVG Chart Math Config
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const maxChartValue = useMemo(() => {
    const mv = Math.max(...chartData.values);
    return mv > 0 ? mv * 1.15 : 100; // Give some head room
  }, [chartData]);

  const getX = (index: number) => {
    if (chartData.values.length <= 1) return paddingLeft;
    return paddingLeft + (index / (chartData.values.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return chartHeight - paddingBottom - (val / maxChartValue) * plotHeight;
  };

  // Build the SVG path string
  const pathD = useMemo(() => {
    return chartData.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  }, [chartData, maxChartValue]);

  // Build the closed shading area path
  const areaD = useMemo(() => {
    if (chartData.values.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(chartData.values.length - 1);
    const bottomY = chartHeight - paddingBottom;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, chartData]);

  // Horizontal Grid Lines data
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex flex-col gap-6 sm:gap-8 pt-0 sm:pt-2 pb-16 font-sans text-zinc-900"
    >
      
      {/* Top Header removed */}
      <div className="hidden"></div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 items-stretch w-full">
        
        {/* Card 1: Streak */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          whileHover={{ y: -2 }}
          onClick={() => onNavigate?.('flashcards')}
          className="pearl-card p-4 sm:p-6 flex flex-col justify-between min-h-[125px] sm:min-h-[145px] cursor-pointer relative group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#6E6E73] dark:text-[#98989D] tracking-wider uppercase truncate">
              {t.currentStreak}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {currentStreak}
              </span>
              <span className="text-sm sm:text-base font-medium text-[#6E6E73] dark:text-[#98989D]">
                {t.days}
              </span>
            </div>
          </div>

          {/* Simple status footer detail */}
          <div className="flex items-center justify-between pt-2 border-t border-[#D1D1D6]/40 dark:border-[#38383A] text-[11px]">
            <span className="text-[#6E6E73] dark:text-[#98989D] flex items-center gap-1.5 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${todayActivity > 0 ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`} />
              {todayActivity > 0 ? (t.activeToday || 'Active today') : (t.practiceToday || 'Practice today')}
            </span>
            <span className="text-[#6E6E73] dark:text-[#98989D] font-medium">
              {currentStreak >= 7 ? '🔥 On fire' : `${Math.max(1, 7 - currentStreak)}d to 7d goal`}
            </span>
          </div>
        </motion.div>

        {/* Card 2: Today's Goal */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          whileHover={{ y: -2 }}
          className="pearl-card p-4 sm:p-6 flex flex-col justify-between min-h-[125px] sm:min-h-[145px] relative group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#6E6E73] dark:text-[#98989D] tracking-wider uppercase truncate">
              {t.todaysGoal}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1.5 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {goalProgress}%
              </span>
              <span className="text-xs text-[#6E6E73] dark:text-[#98989D] font-medium tabular-nums">
                {todayActivity}/{dailyGoal}
              </span>
            </div>
            {/* Sleek minimal progress bar */}
            <div className="w-full h-1.5 bg-[#EDEDF0] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#007AFF] dark:bg-[#0A84FF] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, goalProgress)}%` }}
              />
            </div>
          </div>

          {/* Simple status & action link */}
          <div className="flex items-center justify-between pt-2 border-t border-[#D1D1D6]/40 dark:border-[#38383A] text-[11px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                tracker.trackEvent('button_clicked', 'engagement', {
                  button_name: 'start_reading',
                  destination: 'reader',
                });
                onNavigate?.('reader');
              }}
              className="inline-flex items-center gap-1 font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline transition-colors cursor-pointer group/btn"
            >
              <span>{t.startReading || "Start Reading"}</span>
              <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
            </button>
            <span className="text-[#6E6E73] dark:text-[#98989D] font-medium">
              {goalProgress >= 100 ? (t.goalCompleted || 'Goal met ✓') : `${Math.max(0, dailyGoal - todayActivity)} left`}
            </span>
          </div>
        </motion.div>

        {/* Card 3: Words Mastered */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          whileHover={{ y: -2 }}
          onClick={() => onNavigate?.('flashcards')}
          className="pearl-card p-4 sm:p-6 flex flex-col justify-between min-h-[125px] sm:min-h-[145px] cursor-pointer relative group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#6E6E73] dark:text-[#98989D] tracking-wider uppercase truncate">
              {t.wordsMastered}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#5856D6]/10 text-[#5856D6] dark:text-[#5E5CE6] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {wordsMastered}
              </span>
              <span className="text-xs text-[#6E6E73] dark:text-[#98989D] font-medium">
                {wordsLearned > 0 ? `${wordsLearned} learning` : (wordsMastered === 0 ? (t.keepGoing || 'Keep going!') : '')}
              </span>
            </div>
          </div>

          {/* Simple status & review link */}
          <div className="flex items-center justify-between pt-2 border-t border-[#D1D1D6]/40 dark:border-[#38383A] text-[11px]">
            <span className="text-[#6E6E73] dark:text-[#98989D] font-medium">
              {totalWords} {t.totalSaved || 'saved'}
            </span>
            <span className="font-semibold text-[#007AFF] dark:text-[#0A84FF] group-hover:underline flex items-center gap-1">
              <span>{t.practice || 'Review'}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>
        </motion.div>

      </div>

      {/* CONTINUE READING SECTION - Hidden on mobile phone view */}
      <div className="hidden sm:flex flex-col gap-3.5 w-full">
        <h2 className="text-xs font-semibold text-[#6E6E73] dark:text-[#98989D] tracking-wider uppercase px-0.5">
          {t.continueReading || 'CONTINUE READING'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 items-stretch">
          {continueReadingBooks.map((book, index) => {
            const totalP = Math.max(1, book.totalPages || 120);
            const currP = Math.max(1, book.currentPage || 18);
            const pageProgress = Math.min(100, Math.max(0, Math.round((currP / totalP) * 100)));

            const coverGradients = [
              'from-[#728591] via-[#5D6F7A] to-[#4B5963]',
              'from-[#1F3A4B] via-[#172D3A] to-[#101E28]',
              'from-[#D98236] via-[#BE6A22] to-[#984E13]'
            ];
            const coverGradient = book.coverGradient || coverGradients[index % 3];

            return (
              <motion.div
                key={book.id || `continue-book-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => {
                  if (onSelectDocument) {
                    onSelectDocument(book);
                  } else {
                    onNavigate?.('reader');
                  }
                }}
                className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4 relative overflow-hidden shadow-xs cursor-pointer group hover:shadow-md transition-all min-h-[120px]"
              >
                {/* 3D Realistic Book Cover Graphic */}
                <div className={`w-20 h-28 sm:w-22 sm:h-30 rounded-lg shadow-md shrink-0 relative overflow-hidden flex flex-col justify-between p-2 text-white bg-gradient-to-br ${coverGradient} border-l-2 border-white/25`}>
                  {/* Subtle Spine & Paper Overlay */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-black/20" />
                  <div className="absolute top-0 bottom-0 left-1 w-[1px] bg-white/20" />

                  {/* Language Badge on Book Cover */}
                  <div className="bg-white/20 backdrop-blur-xs text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-white text-center self-start border border-white/20">
                    {(book.language || 'ENGLISH').toUpperCase()}
                  </div>

                  {/* Title on Book Cover */}
                  <div className="my-auto z-10 px-0.5">
                    <h4 className="text-[10px] sm:text-[11px] font-bold line-clamp-2 leading-tight tracking-tight drop-shadow-xs font-serif text-white">
                      {book.title || book.name}
                    </h4>
                  </div>

                  {/* Author on Book Cover */}
                  <div className="text-[7px] text-white/80 font-mono uppercase tracking-wider truncate z-10">
                    {book.author || book.category || 'Lingoflow'}
                  </div>
                </div>

                {/* Right Content Column */}
                <div className="flex flex-col justify-between h-full min-w-0 flex-1 py-0.5 z-10">
                  {/* Top Row: Progress Pill */}
                  <div className="flex items-center justify-start">
                    <span className="bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] font-semibold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#007AFF] dark:text-[#0A84FF]" />
                      {pageProgress}%
                    </span>
                  </div>

                  {/* Middle: Title & Author */}
                  <div className="my-1.5 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1 leading-snug">
                      {book.title || book.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#6E6E73] dark:text-[#98989D] font-medium truncate mt-0.5">
                      {book.author || book.category || 'Author'}
                    </p>
                  </div>

                  {/* Bottom Row: Page Number & Continue Button */}
                  <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    {/* SVG Circular Progress Ring + Pages Text */}
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" />
                        <circle 
                          cx="12" 
                          cy="12" 
                          r="9" 
                          stroke="currentColor" 
                          strokeDasharray="56.5" 
                          strokeDashoffset={56.5 - (56.5 * pageProgress) / 100} 
                          strokeLinecap="round" 
                        />
                      </svg>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        p. {currP}/{totalP}
                      </span>
                    </div>

                    {/* Continue Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectDocument) {
                          onSelectDocument(book);
                        } else {
                          onNavigate?.('reader');
                        }
                      }}
                      className="bg-[#007AFF] hover:bg-[#0066D6] text-white px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="pearl-card p-6 sm:p-7 flex flex-col gap-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D1D1D6] dark:border-[#38383A]">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-widest uppercase">{t.intensityGrid}</span>
            <div className="flex bg-[#F5F5F7] dark:bg-[#2C2C2E] p-1 rounded-full border border-[#D1D1D6] dark:border-[#38383A]">
              {[30, 100, 150].map(val => (
                <button
                  key={val}
                  onClick={() => setTimeframe(val as 30 | 100 | 150)}
                  className={`px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wider transition-colors duration-200 cursor-pointer ${
                    timeframe === val ? 'bg-[#007AFF] text-white shadow-xs' : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#007AFF]'
                  }`}
                >
                  {val}D
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Heatmap Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E6E73] dark:text-[#98989D] uppercase font-semibold tracking-wider">
            <span>{t.less}</span>
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A]" title="0 actions" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#007AFF]/20 dark:bg-[#0A84FF]/25" title="1 - 35% goal" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#007AFF]/50 dark:bg-[#0A84FF]/55" title="35% - 75% goal" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#007AFF]" title="75% - 115% goal" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#1D1D1F] dark:bg-white shadow-xs" title="115%+ goal" />
            <span>{t.more}</span>
          </div>
        </div>

        {/* Heatmap Cell Grid Layout */}
        <div className={`grid ${gridClass} w-full gap-1.5`}>
          {daysData.map((day) => {
            return (
              <motion.div
                key={day.dateStr}
                whileHover={{ scale: 1.25, zIndex: 10 }}
                className={`w-full aspect-square rounded-[6px] ${day.colorClass} cursor-pointer transition-transform`}
                title={`${day.dateStr}: ${day.label}`}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Progress Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-widest uppercase">
            {t.yourProgress}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#38383A] transition-colors cursor-pointer shadow-xs"
            >
              <span>
                {progressTimeframe === 'month' ? t.thisMonth : progressTimeframe === 'week' ? t.thisWeek : t.thisYear}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6E6E73] dark:text-[#98989D]" />
            </button>

            <AnimatePresence>
              {showTimeframeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute end-0 mt-2 w-36 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-lg z-50 overflow-hidden p-1.5 space-y-1"
                >
                  {(['week', 'month', 'year'] as ProgressTimeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        setProgressTimeframe(tf);
                        setShowTimeframeDropdown(false);
                      }}
                      className={`w-full text-start px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        progressTimeframe === tf
                          ? 'bg-[#007AFF] text-white'
                          : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                      }`}
                    >
                      {tf === 'month' ? t.thisMonth : tf === 'week' ? t.thisWeek : t.thisYear}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Split Grid: Metrics & Line Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div ref={statsOverviewRef} className="lg:col-span-1 grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
            <div className="pearl-card p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-start">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-xl font-['Cabinet_Grotesk','Plus_Jakarta_Sans',sans-serif] font-[800] text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {wordsLearned} <span className="text-[10px] sm:text-xs font-sans text-[#6E6E73] dark:text-[#98989D] font-semibold">/ {totalWords}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#6E6E73] dark:text-[#98989D] font-medium truncate">{t.wordsLearned}</div>
              </div>
            </div>

            <div className="pearl-card p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-start">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-xl font-['Cabinet_Grotesk','Plus_Jakarta_Sans',sans-serif] font-[800] text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {retentionRate}%
                </div>
                <div className="text-[10px] sm:text-xs text-[#6E6E73] dark:text-[#98989D] font-medium truncate">{t.retentionRate}</div>
              </div>
            </div>

            <div className="pearl-card p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-start">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D1D1D6] dark:border-[#38383A] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-xl font-['Cabinet_Grotesk','Plus_Jakarta_Sans',sans-serif] font-[800] text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {totalReviews}
                </div>
                <div className="text-[10px] sm:text-xs text-[#6E6E73] dark:text-[#98989D] font-medium truncate">{t.wordsReviewed}</div>
              </div>
            </div>
          </div>

          <div ref={vocabChartRef} className="lg:col-span-2 pearl-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {chartData.title}
              </span>
              {hoveredPointIndex !== null && (
                <span className="text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 px-2 py-0.5 rounded-full">
                  {chartData.labels[hoveredPointIndex]}: {chartData.values[hoveredPointIndex]} {t.words}
                </span>
              )}
            </div>

            <div className="w-full relative">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#007AFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {gridLines.map((ratio, idx) => {
                  const y = paddingTop + (1 - ratio) * plotHeight;
                  return (
                    <line
                      key={idx}
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="rgba(142, 142, 147, 0.2)"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  );
                })}

                {areaD && (
                  <path d={areaD} fill="url(#chartGradient)" />
                )}

                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {chartData.values.map((val, idx) => {
                  const cx = getX(idx);
                  const cy = getY(val);
                  const isHovered = hoveredPointIndex === idx;

                  return (
                    <g 
                      key={idx} 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    >
                      {/* Transparent hit target for easy mouse/touch interaction */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="18"
                        fill="transparent"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? "6.5" : "4"}
                        fill="#007AFF"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                      <text
                        x={cx}
                        y={chartHeight - 5}
                        textAnchor="middle"
                        className="text-[10px] fill-[#6E6E73] dark:fill-[#98989D] font-medium"
                      >
                        {chartData.labels[idx]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Status of Each Language Section */}
        <div ref={languageProfilesRef} className="mt-8 bg-white dark:bg-[#1C1C1E] p-5 sm:p-6 rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#D1D1D6] dark:border-[#38383A] pb-2.5">
            <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
              Active Languages Status
            </h3>
            <span className="text-[11px] font-semibold text-[#6E6E73] dark:text-[#98989D] bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2.5 py-0.5 rounded-full">
              {globalStats.langStatuses.length} Active
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {globalStats.langStatuses.map((lang) => {
              const percent = Math.min(100, Math.max(1, Math.round((lang.vocab / 1000) * 100) + (lang.books * 5)));
              return (
                <div key={lang.name} className="group relative overflow-hidden p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] flex flex-col gap-3 hover:border-[#007AFF] dark:hover:border-[#0A84FF] transition-all shadow-xs">
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{lang.name}</h4>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[#34C759]/10 text-[#34C759]">
                            Active
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#FF9500] dark:text-[#FF9F0A] mt-0.5 flex items-center gap-1">
                          🔥 {lang.streak}d streak
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end text-right">
                      <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {percent}%
                      </span>
                      <span className="text-[9px] font-medium text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
                        Learned
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full">
                    <div className="w-full bg-[#EDEDF0] dark:bg-[#38383A] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-[#34C759] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[10px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                      <span>{lang.vocab} words</span>
                      <span>{lang.books} books</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {globalStats.langStatuses.length === 0 && (
              <div className="col-span-full py-6 text-center text-[#6E6E73] dark:text-[#98989D] text-xs font-medium">
                No active languages yet. Start learning words or reading books to see them here!
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
