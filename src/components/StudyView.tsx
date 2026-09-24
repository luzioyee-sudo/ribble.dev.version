import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyItem, Deck, ReaderSettings } from '../types';
import { getTranslation } from '../utils/i18n';
import { reviewCard, getCardBucket, formatIntervalText, ButtonAction, getDueIntervalLabel } from '../utils/srs';
import { activityTracker } from '../utils/activityTracker';
import { playTTS } from '../utils/tts';
import { startPronunciationPractice } from '../utils/speechRecognition';
import { Volume2, Mic, Edit, Trash2, ChevronDown, FolderOpen, Plus, Lightbulb, SlidersHorizontal, X, Check, Flame, Trophy, RotateCcw, Sparkles, GraduationCap, Layers, BookMarked, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyViewProps {
  vocabulary: VocabularyItem[];
  decks: Deck[];
  onUpdateVocabulary: (updated: VocabularyItem) => void;
  onDeleteVocabulary: (id: string) => void;
  onAddWordClick: () => void;
  onNewDeckClick: () => void;
  onEditCardClick: (card: VocabularyItem) => void;
  selectedDeckId: string | null;
  setSelectedDeckId: (id: string | null) => void;
  settings?: ReaderSettings;
  onSubViewChange?: (subView: 'study' | 'decks' | 'saved-words' | 'browse') => void;
}

// StudyView Component
// Renders the Spaced Repetition System (SRS) Flashcard interface.
// Features:
// 1. Interactive 3D flip cards for vocabulary review
// 2. SM-2 Algorithm integration for scheduling next reviews
// 3. Audio pronunciation (TTS) for target language words
// 4. Deck and progress filtering (New, Learning, Mastered)
export const StudyView: React.FC<StudyViewProps> = ({
  vocabulary,
  decks,
  onUpdateVocabulary,
  onDeleteVocabulary,
  onAddWordClick,
  onNewDeckClick,
  onEditCardClick,
  selectedDeckId,
  setSelectedDeckId,
  settings,
  onSubViewChange,
}) => {
  const t = getTranslation(settings?.interfaceLanguage || settings?.targetLanguage);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDeckDropdownOpen, setIsDeckDropdownOpen] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<{isMatch: boolean, transcript: string} | null>(null);

  // Phone/Mobile options and speech preferences
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [speechSpeed, setSpeechSpeed] = useState<'normal' | 'slow'>('normal');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Filter vocabulary by selected deck
  const deckVocabulary = useMemo(() => {
    if (!selectedDeckId || selectedDeckId === 'all') {
      return vocabulary;
    }
    return vocabulary.filter((v) => v.deckId === selectedDeckId);
  }, [vocabulary, selectedDeckId]);

  // Count words by state for the filters
  const newCount = useMemo(() => deckVocabulary.filter(v => getCardBucket(v) === 'New').length, [deckVocabulary]);
  const learningCount = useMemo(() => deckVocabulary.filter(v => getCardBucket(v) === 'Learning').length, [deckVocabulary]);
  const masteredCount = useMemo(() => deckVocabulary.filter(v => getCardBucket(v) === 'Mastered').length, [deckVocabulary]);

  // Determine active list to review based on selected status filter
  const itemsToReview = useMemo(() => {
    if (selectedFilter === 'new') {
      return deckVocabulary.filter(v => getCardBucket(v) === 'New');
    }
    if (selectedFilter === 'learning') {
      return deckVocabulary.filter(v => getCardBucket(v) === 'Learning');
    }
    if (selectedFilter === 'mastered') {
      return deckVocabulary.filter(v => getCardBucket(v) === 'Mastered');
    }
    
    // Default 'all': prioritizes due cards first (SM2 nextReviewDate <= Date.now())
    const now = Date.now();
    const dueCards = deckVocabulary.filter(v => v.srs && v.srs.dueAt <= now);
    return dueCards.length > 0 ? dueCards : deckVocabulary;
  }, [deckVocabulary, selectedFilter]);

  const currentItem = itemsToReview[Math.min(currentIndex, Math.max(0, itemsToReview.length - 1))];

  // Reset progress when deck or filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedDeckId, selectedFilter]);

  // Listen to mobile top header toggle button custom event
  useEffect(() => {
    const handleToggle = () => {
      setIsMobileSidebarOpen(prev => !prev);
    };
    window.addEventListener('toggle-flashcard-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-flashcard-sidebar', handleToggle);
  }, []);

  // Handle keypress 'Space' to reveal or rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) {
          setIsFlipped(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped]);

  const handleGrade = (grade: 1 | 2 | 3 | 4) => {
    if (!currentItem) return;

    setPronunciationFeedback(null);
    setIsListening(false);

    const buttonMap: Record<number, ButtonAction> = { 1: "again", 2: "hard", 3: "good", 4: "easy" };
    const updated = reviewCard(currentItem, buttonMap[grade]);

    activityTracker.logActivity(
      'Flashcards SRS',
      `Reviewed SRS flashcard: "${currentItem.word}" (${currentItem.translation}) - Grade ${grade}/4`,
      12,
      'deck'
    );

    onUpdateVocabulary(updated);
    setIsFlipped(false);

    if (currentIndex + 1 < itemsToReview.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed last card
      setCurrentIndex(0);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#007AFF', '#34C759', '#1D1D1F'],
      });
    }
  };

  const handleSpeech = (text: string) => {
    playTTS(
      text,
      currentItem?.language || settings?.targetLanguage,
      undefined,
      undefined,
      {
        voice: selectedVoice,
        promptStyle: speechSpeed === 'slow' ? 'slow' : 'normal',
      }
    );
  };

  const currentDeckName = useMemo(() => {
    const isAr = settings?.interfaceLanguage === 'Arabic';
    const isFr = settings?.interfaceLanguage === 'French';
    const isEs = settings?.interfaceLanguage === 'Spanish';
    const isDe = settings?.interfaceLanguage === 'German';

    if (!selectedDeckId || selectedDeckId === 'all') {
      return isAr ? 'جميع الكلمات (الرئيسية)' : isFr ? 'Tous les mots (Principal)' : isEs ? 'Todas las palabras (Principal)' : isDe ? 'Alle Wörter (Haupt-Deck)' : 'All Words (Main Deck)';
    }
    return decks.find((d) => d.id === selectedDeckId)?.name || (isAr ? 'مجموعة مخصصة' : isFr ? 'Deck personnalisé' : isEs ? 'Mazo personalizado' : isDe ? 'Benutzerdefiniertes Deck' : 'Custom Deck');
  }, [selectedDeckId, decks, settings?.interfaceLanguage]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-1.5 md:px-0">
      
      {/* Top Filter & Deck Selector Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        {/* Left Side: Deck selector dropdown, Action Buttons, & Mobile Subpages Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none whitespace-nowrap pb-1 -mb-1 flex-nowrap">
          <div className="relative shrink-0">
            <button
              onClick={() => setIsDeckDropdownOpen(!isDeckDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2.5 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-xl md:rounded-2xl shadow-xs text-xs md:text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-all cursor-pointer shrink-0"
            >
              <span>{currentDeckName}</span>
              <ChevronDown className={`w-3.5 h-3.5 md:w-4 md:h-4 text-[#6E6E73] dark:text-[#98989D] transition-transform ${isDeckDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDeckDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDeckDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute start-0 mt-2 w-64 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-xl z-20 overflow-hidden whitespace-normal"
                  >
                    <button
                      onClick={() => {
                        setSelectedDeckId('all');
                        setIsDeckDropdownOpen(false);
                      }}
                      className="w-full text-start px-4 py-3 text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border-b border-[#D1D1D6]/50 dark:border-[#38383A] transition-colors flex items-center justify-between"
                    >
                      <span>{t.filterAll || "All"} ({
                        settings?.interfaceLanguage === 'Arabic' ? 'الرئيسية' :
                        settings?.interfaceLanguage === 'French' ? 'Principal' :
                        settings?.interfaceLanguage === 'Spanish' ? 'Principal' :
                        settings?.interfaceLanguage === 'German' ? 'Haupt-Deck' : 'Main Deck'
                      })</span>
                      <span className="text-[10px] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] px-2 py-0.5 rounded-full">{vocabulary.length}</span>
                    </button>
                    {decks.map((deck) => {
                      const count = vocabulary.filter((v) => v.deckId === deck.id).length;
                      return (
                        <button
                          key={deck.id}
                          onClick={() => {
                            setSelectedDeckId(deck.id);
                            setIsDeckDropdownOpen(false);
                          }}
                          className="w-full text-start px-4 py-3 text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border-b border-[#D1D1D6]/50 dark:border-[#38383A] last:border-0 transition-colors flex items-center justify-between"
                        >
                          <span className="truncate">{deck.name} ({deck.language})</span>
                          <span className="text-[10px] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] px-2 py-0.5 rounded-full">{count}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Phone-only compact actions: New Deck & Add Word */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              onClick={onNewDeckClick}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-xl text-[10px] font-semibold hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] cursor-pointer shrink-0"
              title={t.newDeck || "New Deck"}
            >
              <Plus className="w-3 h-3" />
              <span>{t.newDeck ? t.newDeck.replace("+", "").trim() : "Deck"}</span>
            </button>
            <button
              onClick={onAddWordClick}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#007AFF] hover:bg-[#0066D6] text-white rounded-xl text-[10px] font-semibold cursor-pointer shadow-xs shrink-0"
              title={t.addBookmark?.replace("+", "") || "Add Word"}
            >
              <Plus className="w-3 h-3" />
              <span>{t.addBookmark ? t.addBookmark.replace("+", "").trim() : "Word"}</span>
            </button>
          </div>

          {/* Phone-only compact filters */}
          <div className="flex md:hidden items-center gap-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] p-0.5 rounded-full border border-[#D1D1D6] dark:border-[#38383A] shrink-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wider uppercase transition-all duration-150 ${
                selectedFilter === 'all'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
              }`}
            >
              {t.filterAll || "All"} {deckVocabulary.length}
            </button>
            <button
              onClick={() => setSelectedFilter('new')}
              className={`px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wider uppercase transition-all duration-150 ${
                selectedFilter === 'new'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
              }`}
            >
              {t.filterNew || "New"} {newCount}
            </button>
            <button
              onClick={() => setSelectedFilter('learning')}
              className={`px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wider uppercase transition-all duration-150 ${
                selectedFilter === 'learning'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
              }`}
            >
              {t.filterLearning || "Learning"} {learningCount}
            </button>
            <button
              onClick={() => setSelectedFilter('mastered')}
              className={`px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wider uppercase transition-all duration-150 ${
                selectedFilter === 'mastered'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
              }`}
            >
              {t.filterMastered || "Mastered"} {masteredCount}
            </button>
          </div>
        </div>

        {/* Center: Filters ALL / NEW / LEARNING / MASTERED */}
        <div className="hidden md:flex items-center justify-center gap-1.5 self-center bg-[#F5F5F7] dark:bg-[#1C1C1E] p-1 rounded-full border border-[#D1D1D6] dark:border-[#38383A]">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all duration-150 ${
              selectedFilter === 'all'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
            }`}
          >
            {t.filterAll || "All"} {deckVocabulary.length}
          </button>
          <button
            onClick={() => setSelectedFilter('new')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all duration-150 ${
              selectedFilter === 'new'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
            }`}
          >
            {t.filterNew || "New"} {newCount}
          </button>
          <button
            onClick={() => setSelectedFilter('learning')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all duration-150 ${
              selectedFilter === 'learning'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
            }`}
          >
            {t.filterLearning || "Learning"} {learningCount}
          </button>
          <button
            onClick={() => setSelectedFilter('mastered')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all duration-150 ${
              selectedFilter === 'mastered'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7]'
            }`}
          >
            {t.filterMastered || "Mastered"} {masteredCount}
          </button>
        </div>

        {/* Right Side: + New Deck and + Add Word */}
        <div className="hidden md:flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={onNewDeckClick}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newDeck || "New Deck"}</span>
          </button>
          <button
            onClick={onAddWordClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#007AFF] hover:bg-[#0066D6] rounded-2xl text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addBookmark?.replace("+", "") || "Add Word"}</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard review container */}
      {itemsToReview.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] text-center p-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7]">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Deck is completely empty!
          </h3>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-sm leading-relaxed">
            There are no words matching the status <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] uppercase">{selectedFilter}</span> in this deck. Add a flashcard to start practicing.
          </p>
          <button
            onClick={onAddWordClick}
            className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Add First Word
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Top card metadata and controls */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-widest px-1">
            <span>{t.card} {currentIndex + 1} {t.of} {itemsToReview.length}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditCardClick(currentItem)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{t.edit || "Edit"}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this flashcard?')) {
                    onDeleteVocabulary(currentItem.id);
                    if (currentIndex >= itemsToReview.length - 1 && currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1);
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-[#FF3B30]/30 text-[#FF3B30] rounded-lg hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteItem || "Delete"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full relative min-h-[360px] cursor-pointer select-none"
            style={{ perspective: '1200px' }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full h-full min-h-[360px] rounded-2xl"
            >
              
              {/* CARD FRONT */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 w-full h-full p-8 sm:p-12 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#F5F5F7] text-[#1D1D1F] dark:bg-[#2C2C2E] dark:text-[#F5F5F7]">
                    {(() => {
                      const isAr = settings?.interfaceLanguage === 'Arabic';
                      const isFr = settings?.interfaceLanguage === 'French';
                      const isEs = settings?.interfaceLanguage === 'Spanish';
                      const isDe = settings?.interfaceLanguage === 'German';
                      const reps = currentItem.srs?.repetitions || 0;
                      if (isAr) return `مراجعة ${reps} • استدعاء`;
                      if (isFr) return `Révision ${reps} • Rappel`;
                      if (isEs) return `Repaso ${reps} • Recordar`;
                      if (isDe) return `Wiederholung ${reps} • Abrufen`;
                      return `Review ${reps} • Recall`;
                    })()}
                  </span>
                  <span className="text-[10px] font-semibold text-[#007AFF] dark:text-[#0A84FF] uppercase tracking-wider">
                    {(() => {
                      const isAr = settings?.interfaceLanguage === 'Arabic';
                      const isFr = settings?.interfaceLanguage === 'French';
                      const isEs = settings?.interfaceLanguage === 'Spanish';
                      const isDe = settings?.interfaceLanguage === 'German';
                      if (isAr) return 'الهدف: تعزيز الاسترجاع';
                      if (isFr) return 'Objectif : Renforcer la mémorisation';
                      if (isEs) return 'Objetivo: Fortalecer la recuperación';
                      if (isDe) return 'Ziel: Abruf verbessern';
                      return 'Goal: Strengthen Retrieval';
                    })()}
                  </span>
                </div>

                <div className="my-auto text-center space-y-6 py-6">
                  {/* Huge elegant language display */}
                  <h2 className="text-3xl sm:text-4xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed max-w-2xl mx-auto">
                    {currentItem.translation}
                  </h2>
                  
                  {currentItem.partOfSpeech && (
                    <p className="text-sm font-medium text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-xl mx-auto">
                      <span className="italic">{currentItem.partOfSpeech}</span>
                      {currentItem.definition && ` · ${currentItem.definition}`}
                    </p>
                  )}
                </div>

                <div className="text-center text-[10px] font-medium text-[#6E6E73] dark:text-[#98989D] tracking-wider">
                  {t.clickToReveal || "Tap card or press Space to reveal answer"}
                </div>
              </div>

              {/* CARD BACK */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 w-full h-full p-8 sm:p-12 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#0A84FF]/15 dark:text-[#0A84FF]">{t.translationLabel || "Answer Revealed"}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeech(currentItem.word);
                      }}
                      className="p-2 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#007AFF] hover:text-white transition-colors cursor-pointer"
                      title="Speak"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isListening) return;
                        setPronunciationFeedback(null);
                        setIsListening(true);
                        startPronunciationPractice(
                          currentItem.word,
                          currentItem.language,
                          (isMatch, transcript) => {
                            setPronunciationFeedback({ isMatch, transcript });
                          },
                          (error) => {
                            alert(error);
                            setIsListening(false);
                          },
                          () => {
                            setIsListening(false);
                          }
                        );
                      }}
                      className={`p-2 rounded-full transition-colors cursor-pointer ${
                        isListening
                          ? 'bg-[#007AFF] text-white animate-pulse'
                          : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#007AFF] hover:text-white'
                      }`}
                      title="Practice Pronunciation"
                    >
                      <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-[#6E6E73] dark:text-[#98989D]'}`} />
                    </button>
                  </div>
                </div>
                
                {pronunciationFeedback && (
                  <div className={`mt-2 p-3 rounded-xl border text-sm font-medium ${
                    pronunciationFeedback.isMatch 
                      ? 'bg-[#34C759]/10 border-[#34C759]/30 text-[#34C759]' 
                      : 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pronunciationFeedback.isMatch ? 'Great!' : 'Try again.'}</span>
                      <span>{t.youSaid || "You said:"} <span className="italic">"{pronunciationFeedback.transcript}"</span></span>
                    </div>
                  </div>
                )}

                <div className="my-auto text-center space-y-4 py-4">
                  <h2 className="text-3xl sm:text-4xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed max-w-xl mx-auto">
                    {currentItem.word}
                  </h2>

                  {currentItem.phonetic && (
                    <p className="text-sm font-mono text-[#6E6E73] dark:text-[#98989D] font-medium tracking-wide">
                      {currentItem.phonetic}
                    </p>
                  )}

                  {/* Memory Hook card block */}
                  {currentItem.grammarNote && (
                    <div className="p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl text-xs text-[#6E6E73] dark:text-[#98989D] max-w-md mx-auto text-start flex gap-2.5 items-start">
                      <Lightbulb className="w-5 h-5 text-[#007AFF] dark:text-[#0A84FF] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block mb-0.5">{t.memoryHook || "Memory Hook:"}</span>
                        {currentItem.grammarNote}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-md mx-auto">
                    <span className="italic font-semibold">{currentItem.partOfSpeech}</span>
                    {currentItem.definition && ` · ${currentItem.definition}`}
                  </p>
                </div>

                <div className="text-center text-[10px] font-medium text-[#6E6E73] dark:text-[#98989D] tracking-wider">{t.rateDifficulty || "Rate difficulty below to schedule next review"}</div>
              </div>

            </motion.div>
          </div>

          {/* SM-2 Spaced Repetition control buttons */}
          <div className="flex justify-center pt-2">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="px-10 py-3.5 rounded-full bg-[#007AFF] hover:bg-[#0066D6] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                {t.showAnswer || "Show Answer"}
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-3 w-full max-w-xl">
                <button
                  onClick={() => handleGrade(1)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#FF3B30]/10 hover:border-[#FF3B30]/40 transition-all text-center cursor-pointer"
                >
                  <span className="block text-xs font-semibold text-[#FF3B30]">{t.srsAgain}</span>
                  <span className="block text-[9px] text-[#6E6E73] dark:text-[#98989D] font-medium font-mono mt-0.5">{getDueIntervalLabel(currentItem, 'again')}</span>
                </button>

                <button
                  onClick={() => handleGrade(2)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#FF9500]/10 hover:border-[#FF9500]/40 transition-all text-center cursor-pointer"
                >
                  <span className="block text-xs font-semibold text-[#FF9500]">{t.srsHard}</span>
                  <span className="block text-[9px] text-[#6E6E73] dark:text-[#98989D] font-medium font-mono mt-0.5">{getDueIntervalLabel(currentItem, 'hard')}</span>
                </button>

                <button
                  onClick={() => handleGrade(3)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#007AFF]/10 hover:border-[#007AFF]/40 transition-all text-center cursor-pointer"
                >
                  <span className="block text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF]">{t.srsGood}</span>
                  <span className="block text-[9px] text-[#6E6E73] dark:text-[#98989D] font-medium font-mono mt-0.5">{getDueIntervalLabel(currentItem, 'good')}</span>
                </button>

                <button
                  onClick={() => handleGrade(4)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#34C759]/10 hover:border-[#34C759]/40 transition-all text-center cursor-pointer"
                >
                  <span className="block text-xs font-semibold text-[#34C759]">{t.srsEasy}</span>
                  <span className="block text-[9px] text-[#6E6E73] dark:text-[#98989D] font-medium font-mono mt-0.5">{getDueIntervalLabel(currentItem, 'easy')}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
