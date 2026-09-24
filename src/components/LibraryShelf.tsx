import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentFile, VocabularyItem, ReaderSettings } from '../types';
import { getTranslation } from '../utils/i18n';
import { BookCover } from './BookCover';
import {
  getCoverPaletteByTitle,
  cleanBookTitle,
  BRAND_COVER_PALETTES
} from '../utils/coverGenerator';
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronRight,
  Star,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  HelpCircle,
  X,
  Bookmark,
  Palette,
  Check
} from 'lucide-react';

interface LibraryShelfProps {
  documents: DocumentFile[];
  vocabulary: VocabularyItem[];
  onSelectDocument: (doc: DocumentFile) => void;
  onDeleteDocument: (id: string) => void;
  onUploadClick: () => void;
  settings?: ReaderSettings;
  onUpdateDocument?: (doc: DocumentFile) => void;
}

type BookshelfTab = 'all' | 'favorites' | 'plan-to-read' | 'completed';
type ViewMode = 'grid' | 'list';

export const LibraryShelf: React.FC<LibraryShelfProps> = ({
  documents,
  vocabulary,
  onSelectDocument,
  onDeleteDocument,
  onUploadClick,
  settings,
  onUpdateDocument,
}) => {
  const [activeTab, setActiveTab] = useState<BookshelfTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);

  const t = getTranslation(settings?.interfaceLanguage || settings?.targetLanguage);

  // Calculate top/recent in-progress books for "Continue Reading" top carousel
  const continuingBooks = useMemo(() => {
    return documents
      .filter((doc) => doc.currentPage > 1 && doc.currentPage < doc.totalPages)
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
      .slice(0, 3);
  }, [documents]);

  // Fallback to top recent books if none strictly in progress
  const featuredBooks = useMemo(() => {
    if (continuingBooks.length > 0) return continuingBooks;
    return documents.slice(0, 3);
  }, [continuingBooks, documents]);

  // Helper to toggle Favorite status
  const toggleFavorite = (e: React.MouseEvent, doc: DocumentFile) => {
    e.stopPropagation();
    if (onUpdateDocument) {
      onUpdateDocument({
        ...doc,
        favorite: !doc.favorite
      });
    }
  };

  // Helper to toggle Plan to Read status
  const togglePlanToRead = (e: React.MouseEvent, doc: DocumentFile) => {
    e.stopPropagation();
    if (onUpdateDocument) {
      onUpdateDocument({
        ...doc,
        planToRead: !doc.planToRead
      });
    }
  };

  // Helper to toggle Completed status
  const toggleCompleted = (e: React.MouseEvent, doc: DocumentFile) => {
    e.stopPropagation();
    if (onUpdateDocument) {
      const isFinishing = !doc.completed;
      onUpdateDocument({
        ...doc,
        completed: isFinishing,
        currentPage: isFinishing ? Math.max(1, doc.totalPages) : doc.currentPage
      });
    }
  };

  // Helper to change book cover color
  const handleSelectBookColor = (e: React.MouseEvent, doc: DocumentFile, colorId: string) => {
    e.stopPropagation();
    if (onUpdateDocument) {
      onUpdateDocument({
        ...doc,
        coverColor: colorId
      });
    }
    setActiveMenuDocId(null);
  };

  // Filter documents based on active tab and search query
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Tab filter
      if (activeTab === 'favorites' && !doc.favorite) return false;
      if (activeTab === 'plan-to-read' && !doc.planToRead) return false;
      if (activeTab === 'completed') {
        const isFinished = (doc.currentPage === doc.totalPages && doc.totalPages > 0) || doc.completed;
        if (!isFinished) return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (doc.title || doc.name || '').toLowerCase().includes(q);
        const authorMatch = (doc.author || '').toLowerCase().includes(q);
        const langMatch = (doc.language || '').toLowerCase().includes(q);
        if (!titleMatch && !authorMatch && !langMatch) return false;
      }

      return true;
    });
  }, [documents, activeTab, searchQuery]);

  // Get matching palette for book cover
  const getCoverPalette = (doc: DocumentFile) => {
    const color = doc.coverColor;
    const title = doc.title || doc.name || 'Bilingual Book';
    const matched = BRAND_COVER_PALETTES.find((p) => p.id === color);
    if (matched) return matched;
    return getCoverPaletteByTitle(title);
  };

  // Count items for each tab header
  const counts = useMemo(() => {
    return {
      all: documents.length,
      favorites: documents.filter((d) => d.favorite).length,
      planToRead: documents.filter((d) => d.planToRead).length,
      completed: documents.filter((d) => (d.currentPage === d.totalPages && d.totalPages > 0) || d.completed).length
    };
  }, [documents]);

  // Chunk filtered documents into rows of 5 for physical shelf display
  const booksPerShelf = 5;
  const shelfRows = useMemo(() => {
    const rows: DocumentFile[][] = [];
    for (let i = 0; i < filteredDocuments.length; i += booksPerShelf) {
      rows.push(filteredDocuments.slice(i, i + booksPerShelf));
    }
    return rows;
  }, [filteredDocuments]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pt-1 pb-20 font-sans text-[#1D1D1F] dark:text-[#F5F5F7] max-w-7xl mx-auto"
    >
      {/* 1. TOP SECTION: FEATURED / CONTINUE READING CAROUSEL */}
      {featuredBooks.length > 0 && (
        <div className="hidden md:block space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
              {t.continueReading || 'Continue Reading'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredBooks.map((doc) => {
              const palette = getCoverPalette(doc);
              const cleanTitle = cleanBookTitle(doc.title || doc.name);
              const progressPercent = doc.totalPages > 0 ? Math.min(100, Math.round((doc.currentPage / doc.totalPages) * 100)) : 0;

              return (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -2 }}
                  onClick={() => onSelectDocument(doc)}
                  className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-2xl p-4 border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/60 dark:hover:border-[#0A84FF]/60 shadow-xs hover:shadow-md transition-all group relative overflow-hidden flex items-center gap-4 cursor-pointer"
                >
                  {/* Miniature 3D Floating Book Cover */}
                  <div className="relative shrink-0 select-none">
                    <div className={`w-20 sm:w-22 h-28 sm:h-30 rounded-xl bg-gradient-to-br ${palette.gradient} border border-white/40 shadow-md ${palette.textColor} flex flex-col justify-between p-2.5 relative overflow-hidden transition-transform duration-300 group-hover:scale-105`}>
                      {/* Spine shading overlay */}
                      <div className="absolute top-0 bottom-0 start-0 w-1.5 bg-black/20 rounded-s-xl" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 mix-blend-overlay pointer-events-none" />

                      <div className="z-10 ps-1">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-black/30 text-[6.5px] font-bold uppercase tracking-wider text-white">
                          {doc.language}
                        </span>
                      </div>

                      <div className="z-10 ps-1 pe-0.5 my-auto">
                        <h4 className="text-[10px] sm:text-[11px] font-serif font-black leading-tight line-clamp-3">
                          {cleanTitle}
                        </h4>
                      </div>

                      <div className="z-10 ps-1 border-t border-white/20 pt-1">
                        <span className="text-[6.5px] font-medium tracking-wider uppercase opacity-85 block truncate">
                          {doc.author || (t.author || 'Author')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-2 z-10">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF] text-[10px] font-semibold uppercase tracking-wider">
                          <BookOpen className="w-2.5 h-2.5 stroke-[2.5]" />
                          {progressPercent > 0 ? `${progressPercent}%` : 'New'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-2 leading-snug group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors">
                        {cleanTitle}
                      </h3>
                      <span className="text-[11px] text-[#6E6E73] dark:text-[#98989D] font-normal block truncate">
                        {doc.author || (t.author || 'Author')}
                      </span>
                    </div>

                    {/* Progress Indicator & Continue Button */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 transform -rotate-90">
                            <circle
                              cx="10"
                              cy="10"
                              r="7.5"
                              className="stroke-[#D1D1D6] dark:stroke-[#38383A] fill-none"
                              strokeWidth="2.5"
                            />
                            <circle
                              cx="10"
                              cy="10"
                              r="7.5"
                              className="stroke-[#007AFF] dark:stroke-[#0A84FF] fill-none transition-all duration-500"
                              strokeWidth="2.5"
                              strokeDasharray={47.1}
                              strokeDashoffset={47.1 - (47.1 * progressPercent) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                          p. {doc.currentPage || 1}/{doc.totalPages || 1}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDocument(doc);
                        }}
                        className="px-3 py-1 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <span>{t.continue || 'Continue'}</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MAIN TOOLBAR: "MY BOOKSHELF" & FILTER TABS */}
      <div id="bookshelf-toolbar" className="bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-[#D1D1D6] dark:border-[#38383A] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title & Plus Button */}
          <div className="flex items-center gap-3">
            <button
              id="bookshelf-add-book-btn"
              onClick={onUploadClick}
              className="w-8 h-8 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white flex items-center justify-center shadow-xs cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
              title={t.uploadPdf || "Upload PDF / Book"}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h1 id="bookshelf-title" className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {t.myBookshelf || 'My Bookshelf'}
            </h1>
          </div>

          {/* Center Tabs Navigation */}
          <div id="bookshelf-filter-tabs" className="flex items-center gap-6 overflow-x-auto border-b md:border-b-0 border-[#D1D1D6] dark:border-[#38383A] pb-2 md:pb-0 text-xs font-medium">
            {(['all', 'favorites', 'plan-to-read', 'completed'] as BookshelfTab[]).map((tab) => {
              const label =
                tab === 'all'
                  ? (t.all || 'All')
                  : tab === 'favorites'
                  ? (t.favorites || 'Favorites')
                  : tab === 'plan-to-read'
                  ? (t.planToRead || 'Plan to read')
                  : (t.completed || 'Completed');
              const isActive = activeTab === tab;
              const count =
                tab === 'all'
                  ? counts.all
                  : tab === 'favorites'
                  ? counts.favorites
                  : tab === 'plan-to-read'
                  ? counts.planToRead
                  : counts.completed;

              return (
                <button
                  key={tab}
                  id={`bookshelf-tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-1 cursor-pointer transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#007AFF] dark:text-[#0A84FF] font-semibold'
                      : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  <span>{label}</span>
                  {count > 0 && <span className="ms-1 text-[10px] opacity-75">({count})</span>}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-[#007AFF] dark:bg-[#0A84FF] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Search Input & View Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Find Books Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#8E8E93] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="bookshelf-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.findBooksPlaceholder || "Find books..."}
                className="w-full ps-8 pe-7 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#8E8E93] dark:placeholder:text-[#636366] focus:outline-none focus:ring-2 focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] transition-all"
              />
              {searchQuery && (
                <button
                  id="bookshelf-clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Grid / List Layout Switcher */}
            <div id="bookshelf-view-switcher" className="flex items-center gap-0.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] p-0.5 rounded-lg border border-[#D1D1D6] dark:border-[#38383A]">
              <button
                id="bookshelf-grid-view-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                    : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
                title={t.gridShelfView || "Grid / Shelf View"}
              >
                <LayoutGrid className="w-3.5 h-3.5 stroke-[2]" />
              </button>
              <button
                id="bookshelf-list-view-btn"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                    : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
                title={t.listView || "List View"}
              >
                <List className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOOKSHELVES VIEW */}
      <div className="space-y-8">
        {viewMode === 'grid' ? (
          /* SHELF GRID VIEW */
          <div className="space-y-10">
            {shelfRows.map((shelfBooks, shelfIdx) => (
              <div
                key={`shelf-row-${shelfIdx}`}
                className="relative bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-2xl p-6 sm:p-8 sm:pb-10 border border-[#D1D1D6] dark:border-[#38383A] shadow-xs overflow-visible"
              >
                {/* Books Standing on the Shelf */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 items-end relative z-10 pb-4">
                  {shelfBooks.map((doc) => {
                    const palette = getCoverPalette(doc);
                    const cleanTitle = cleanBookTitle(doc.title || doc.name);

                    return (
                      <div
                        key={doc.id}
                        className="group flex flex-col cursor-pointer select-none relative"
                        onClick={() => onSelectDocument(doc)}
                      >
                        {/* 3D Vertical Book Cover */}
                        <BookCover
                          doc={doc}
                          palette={palette}
                          onToggleFavorite={toggleFavorite}
                          className="group-hover:-translate-y-4 group-hover:scale-102 group-hover:z-30 group-hover:shadow-xl"
                        />

                        {/* Title & Author details under book */}
                        <div className="mt-2 space-y-0.5 px-0.5">
                          <span className="text-[10px] text-[#6E6E73] dark:text-[#98989D] font-normal block truncate">
                            {doc.author || (t.author || 'Author')}
                          </span>
                          <h3 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1 group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors">
                            {cleanTitle}
                          </h3>
                        </div>

                        {/* Hover Quick Actions */}
                        <div className="absolute top-2 end-2 z-40 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => toggleFavorite(e, doc)}
                            className={`p-1.5 rounded-full shadow-md transition-all cursor-pointer ${
                              doc.favorite
                                ? 'bg-[#FF9500] text-white'
                                : 'bg-white/95 dark:bg-[#2C2C2E]/95 text-[#6E6E73] dark:text-[#98989D] hover:bg-[#FF9500]/20'
                            }`}
                            title={doc.favorite ? "Remove from Favorites" : "Add to Favorites"}
                          >
                            <Star className={`w-3 h-3 ${doc.favorite ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => togglePlanToRead(e, doc)}
                            className={`p-1.5 rounded-full shadow-md transition-all cursor-pointer ${
                              doc.planToRead
                                ? 'bg-[#007AFF] text-white'
                                : 'bg-white/95 dark:bg-[#2C2C2E]/95 text-[#6E6E73] dark:text-[#98989D] hover:bg-[#007AFF]/20'
                            }`}
                            title={doc.planToRead ? "Remove from Plan to Read" : "Plan to Read"}
                          >
                            <Bookmark className={`w-3 h-3 ${doc.planToRead ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => toggleCompleted(e, doc)}
                            className={`p-1.5 rounded-full shadow-md transition-all cursor-pointer ${
                              doc.completed
                                ? 'bg-[#34C759] text-white'
                                : 'bg-white/95 dark:bg-[#2C2C2E]/95 text-[#6E6E73] dark:text-[#98989D] hover:bg-[#34C759]/20'
                            }`}
                            title={doc.completed ? "Mark as Uncompleted" : "Mark as Completed"}
                          >
                            <CheckCircle2 className={`w-3 h-3 ${doc.completed ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id);
                            }}
                            className="p-1.5 rounded-full bg-white/95 dark:bg-[#2C2C2E]/95 text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#007AFF] hover:text-white shadow-md transition-all cursor-pointer"
                            title={t.chooseBookCoverColor || "Choose book cover color"}
                          >
                            <Palette className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(doc.id);
                            }}
                            className="p-1.5 rounded-full bg-white/95 dark:bg-[#2C2C2E]/95 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white shadow-md transition-all cursor-pointer"
                            title={t.deleteDoc || "Delete book"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Translucent Frosted Glass Shelf Lip with Metallic Mounting Screws */}
                <div className="absolute bottom-3 inset-x-2 sm:inset-x-4 h-26 sm:h-30 bg-white/40 dark:bg-white/5 backdrop-blur-[8px] border-t border-white/60 dark:border-white/10 border-b border-[#D1D1D6]/60 dark:border-[#38383A] rounded-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_4px_12px_rgba(0,0,0,0.05)] pointer-events-none z-20 flex items-center justify-between px-3 sm:px-4">
                  {/* Left Silver Metallic Screw / Rivet */}
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.25)] flex items-center justify-center relative shrink-0">
                    <div className="w-3 h-0.5 bg-slate-600/70 rounded-full" />
                    <div className="h-3 w-0.5 bg-slate-600/70 rounded-full absolute" />
                  </div>

                  {/* Right Silver Metallic Screw / Rivet */}
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.25)] flex items-center justify-center relative shrink-0">
                    <div className="w-3 h-0.5 bg-slate-600/70 rounded-full" />
                    <div className="h-3 w-0.5 bg-slate-600/70 rounded-full absolute" />
                  </div>
                </div>

                {/* Base Board */}
                <div className="absolute -bottom-1 inset-x-0 h-3 bg-[#EDEDF0] dark:bg-[#2C2C2E] rounded-b-2xl shadow-xs border-t border-[#D1D1D6] dark:border-[#38383A]" />
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] divide-y divide-[#D1D1D6] dark:divide-[#38383A] overflow-hidden shadow-xs">
            {filteredDocuments.map((doc) => {
              const palette = getCoverPalette(doc);
              const cleanTitle = cleanBookTitle(doc.title || doc.name);
              const progressPercent = doc.totalPages > 0 ? Math.min(100, Math.round((doc.currentPage / doc.totalPages) * 100)) : 0;

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Modern 3D Thumbnail */}
                    <div className="w-10 shrink-0">
                      <BookCover doc={doc} palette={palette} showSpine3D={false} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors">
                        {cleanTitle}
                      </h4>
                      <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] font-normal truncate mt-0.5">
                        {doc.author || (t.author || 'Unknown Author')} • {doc.language}
                      </p>
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end w-28">
                      <span className="text-[10px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                        {progressPercent}% {t.completed || 'completed'}
                      </span>
                      <div className="w-full h-1 bg-[#EDEDF0] dark:bg-[#2C2C2E] rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#34C759] rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(e, doc)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        doc.favorite ? 'text-[#FF9500] bg-[#FF9500]/10' : 'text-[#8E8E93] hover:text-[#FF9500]'
                      }`}
                      title={doc.favorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Star className={`w-4 h-4 ${doc.favorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => togglePlanToRead(e, doc)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        doc.planToRead ? 'text-[#007AFF] bg-[#007AFF]/10' : 'text-[#8E8E93] hover:text-[#007AFF]'
                      }`}
                      title={doc.planToRead ? "Remove from Plan to Read" : "Plan to Read"}
                    >
                      <Bookmark className={`w-4 h-4 ${doc.planToRead ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => toggleCompleted(e, doc)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        doc.completed ? 'text-[#34C759] bg-[#34C759]/10' : 'text-[#8E8E93] hover:text-[#34C759]'
                      }`}
                      title={doc.completed ? "Mark as Uncompleted" : "Mark as Completed"}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${doc.completed ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuDocId(doc.id);
                      }}
                      className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#EDEDF0] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
                      title={t.chooseBookCoverColor || "Choose Book Cover Design"}
                    >
                      <Palette className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                      title={t.deleteDoc || "Delete book"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDocument(doc);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-medium transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>{t.readNow || 'Read'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Search Result State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-16 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-2xl border border-dashed border-[#D1D1D6] dark:border-[#38383A] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {t.noBooksMatch || 'No books match your criteria'}
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#98989D] max-w-sm mx-auto">
              {t.noBooksMatchDesc || 'Try adjusting your filter or search query, or upload a new book to your bookshelf.'}
            </p>
            <button
              onClick={onUploadClick}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-medium shadow-xs hover:bg-[#007AFF]/90 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.uploadBook || 'Upload Book'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. FLOATING ACTION FAB */}
      <div className="fixed bottom-6 end-6 z-40">
        <button
          onClick={onUploadClick}
          className="w-11 h-11 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={t.uploadPdf || "Upload PDF / Book"}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* 5. COVER DESIGN SELECTION MODAL */}
      <AnimatePresence>
        {activeMenuDocId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs"
            onClick={() => setActiveMenuDocId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-[#D1D1D6] dark:border-[#38383A] flex items-center justify-between bg-[#F5F5F7] dark:bg-[#2C2C2E] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#007AFF] text-white shadow-xs">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {t.selectCoverDesign || 'Select Cover Design'}
                    </h3>
                    <p className="text-xs text-[#6E6E73] dark:text-[#98989D] truncate max-w-xs sm:max-w-md">
                      Choose artwork style for "{cleanBookTitle(documents.find(d => d.id === activeMenuDocId)?.title || '')}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMenuDocId(null)}
                  className="p-2 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-[#F5F5F7] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover Design Previews Grid */}
              <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5 bg-[#FFFFFF] dark:bg-[#1C1C1E]">
                {(() => {
                  const activeDoc = documents.find(d => d.id === activeMenuDocId);
                  if (!activeDoc) return null;
                  const currentPalette = getCoverPalette(activeDoc);

                  return BRAND_COVER_PALETTES.map((p) => {
                    const isSelected = (activeDoc.coverColor || currentPalette.id) === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={(e) => handleSelectBookColor(e, activeDoc, p.id)}
                        className={`group relative p-2.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col items-center justify-between ${
                          isSelected
                            ? 'border-[#007AFF] bg-[#007AFF]/5 dark:bg-[#0A84FF]/10 ring-2 ring-[#007AFF] dark:ring-[#0A84FF] shadow-sm'
                            : 'border-[#D1D1D6] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:border-[#007AFF]/50 dark:hover:border-[#0A84FF]/50 shadow-xs hover:shadow-sm'
                        }`}
                      >
                        <div className="w-20 sm:w-24 aspect-[1/1.45] relative rounded-lg overflow-hidden shadow-xs group-hover:shadow-md transition-shadow">
                          <BookCover doc={activeDoc} palette={p} showSpine3D={false} />
                          {isSelected && (
                            <div className="absolute top-1.5 end-1.5 z-30 w-5 h-5 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="mt-2 text-[10.5px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] text-center leading-tight line-clamp-2 px-0.5">
                          {p.name}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
