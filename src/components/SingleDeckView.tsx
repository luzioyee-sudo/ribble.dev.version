import React, { useState, useMemo } from 'react';
import { Deck, VocabularyItem } from '../types';
import { playTTS } from '../utils/tts';
import { getCardBucket } from '../utils/srs';
import { getTranslation } from '../utils/i18n';
import { ReaderSettings } from '../types';
import { Search, Volume2, Plus, Edit, Trash2, FileSpreadsheet, Eye, Tag } from 'lucide-react';

interface SingleDeckViewProps {
  deck: Deck;
  vocabulary: VocabularyItem[];
  onAddWordClick: () => void;
  onNewDeckClick: () => void;
  onEditCardClick: (card: VocabularyItem) => void;
  onDeleteCard: (id: string) => void;
  onCloseDeck: () => void;
  settings?: ReaderSettings;
}

export const SingleDeckView: React.FC<SingleDeckViewProps> = ({
  deck,
  vocabulary,
  onAddWordClick,
  onNewDeckClick,
  onEditCardClick,
  onDeleteCard,
  onCloseDeck,
  settings,
}) => {
  const t = getTranslation(settings?.interfaceLanguage || settings?.targetLanguage);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cards belonging to this specific deck
  const deckCards = useMemo(() => {
    return vocabulary.filter(v => v.deckId === deck.id);
  }, [vocabulary, deck.id]);

  // Apply filters and search query
  const filteredCards = useMemo(() => {
    let result = deckCards;

    // Apply category filters
    if (activeFilter === 'new') {
      result = result.filter(v => getCardBucket(v) === 'New');
    } else if (activeFilter === 'learning') {
      result = result.filter(v => getCardBucket(v) === 'Learning');
    } else if (activeFilter === 'mastered') {
      result = result.filter(v => getCardBucket(v) === 'Mastered');
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        v => v.word.toLowerCase().includes(q) || v.translation.toLowerCase().includes(q)
      );
    }

    return result;
  }, [deckCards, activeFilter, searchQuery]);

  const handleSpeech = (text: string) => {
    playTTS(text, deck.language);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Open Sheet Document Tab Bar */}
      <div className="flex items-center gap-2 border-b border-[#D1D1D6] dark:border-[#38383A] pb-2">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007AFF] text-white rounded-full text-[11px] font-bold shadow-xs">
          <span>{deck.name}</span>
          <button
            onClick={onCloseDeck}
            className="hover:bg-white/20 p-0.5 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close File tab"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Deck Header: dropdown trigger + New Deck / Add Word buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black font-serif text-[#1D1D1F] dark:text-white leading-tight">
            {deck.name}
          </h2>
          <span className="text-[#8E8E93] font-serif text-xl">∨</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewDeckClick}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl text-xs font-bold text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newDeck || "New Deck"}</span>
          </button>
          <button
            onClick={onAddWordClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#007AFF] hover:bg-[#0066D6] rounded-2xl text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addBookmark?.replace("+", "") || "Add Word"}</span>
          </button>
        </div>
      </div>

      {/* Sub-Header Filter Bar with Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] p-3 rounded-2xl shadow-xs">
        {/* Filter categories tabs */}
        <div className="flex items-center bg-[#F5F5F7] dark:bg-[#2C2C2E] p-1 rounded-xl w-fit border border-[#D1D1D6]/60 dark:border-[#38383A]">
          {(['all', 'new', 'learning', 'mastered'] as const).map(tab => {
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-white'
                }`}
              >
                {label === 'All' ? 'All Words' : label}
              </button>
            );
          })}
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="w-full p-2 ps-9 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] rounded-xl text-xs font-semibold text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#007AFF]"
          />
          <Search className="w-4 h-4 text-[#8E8E93] absolute start-3.5 top-3.5" />
        </div>
      </div>

      {/* Summary note text */}
      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold px-1">
        Showing {filteredCards.length} of {deckCards.length} items in this document file. Click audio to pronounce.
      </p>

      {/* Word / Phrase Cards Listing Container */}
      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-3xl text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93]">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold font-serif text-[#1D1D1F] dark:text-white">
              No words found in this file
            </h4>
            <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-xs mt-1 leading-relaxed">
              No words present under this status tab yet. Click below to add your first word.
            </p>
          </div>
          <button
            onClick={onAddWordClick}
            className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addBookmark?.replace("+", "") || "Add Word"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredCards.map(card => {
            const bucket = getCardBucket(card);
            const isNew = bucket === 'New';
            const isLearning = bucket === 'Learning';
            const isMastered = bucket === 'Mastered';

            return (
              <div
                key={card.id}
                className="p-5 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex gap-4 items-start">
                  <button
                    onClick={() => handleSpeech(card.word)}
                    className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF] text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5"
                    title="Pronounce"
                  >
                    <Volume2 className="w-4.5 h-4.5" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold font-serif text-[#1D1D1F] dark:text-white">
                        {card.word}
                      </h4>
                      {card.phonetic && (
                        <span className="text-xs font-mono text-[#6E6E73] dark:text-[#98989D] font-medium">
                          {card.phonetic}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {card.translation}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[9px] font-black uppercase text-[#6E6E73] dark:text-[#98989D] border border-[#D1D1D6]/40 dark:border-[#38383A]">
                        {card.partOfSpeech || 'noun'}
                      </span>
                      {card.contextSentence && (
                        <span className="text-[10px] italic text-[#6E6E73] dark:text-[#98989D] truncate max-w-sm" title={card.contextSentence}>
                          “{card.contextSentence}”
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-[#D1D1D6]/40 dark:border-[#38383A] pt-3 sm:pt-0 shrink-0">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-extrabold uppercase text-[#8E8E93]">Status:</span>
                    {isNew && (
                      <span className="px-2 py-0.5 rounded bg-[#007AFF]/10 text-[#007AFF] font-bold dark:bg-[#0A84FF]/20 dark:text-[#0A84FF]">
                        New
                      </span>
                    )}
                    {isLearning && (
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 font-bold dark:bg-orange-500/20 dark:text-orange-400">
                        Learning
                      </span>
                    )}
                    {isMastered && (
                      <span className="px-2 py-0.5 rounded bg-[#34C759] text-white font-bold">
                        Mastered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditCardClick(card)}
                      className="p-2 text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                      title="Edit Card"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete flashcard "${card.word}"?`)) {
                          onDeleteCard(card.id);
                        }
                      }}
                      className="p-2 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF3B30]/20 rounded-xl transition-colors cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
