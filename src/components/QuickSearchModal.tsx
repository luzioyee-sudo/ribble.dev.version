import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  Layers, 
  FileText, 
  ChevronRight, 
  LayoutGrid, 
  Terminal, 
  HelpCircle, 
  Sparkles, 
  LogOut, 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Folder as FolderIcon, 
  Plus, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { DocumentFile, VocabularyItem, AppView, Folder, Deck } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentFile[];
  vocabulary: VocabularyItem[];
  folders: Folder[];
  decks: Deck[];
  isAdmin?: boolean;
  userRole?: string;
  onSelectDocument: (doc: DocumentFile) => void;
  onNavigateView: (view: AppView) => void;
  onOpenUpload: () => void;
  onOpenCreateFlashcard: () => void;
  onSelectWord: (word: string) => void;
  onSelectSettingsTab: (tab: string) => void;
  onResetData: () => void;
  onLogout?: () => void;
}

type SearchCategory = 'all' | 'pages' | 'documents' | 'words' | 'actions';

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  vocabulary,
  folders,
  decks,
  isAdmin = false,
  userRole = 'Student',
  onSelectDocument,
  onNavigateView,
  onOpenUpload,
  onOpenCreateFlashcard,
  onSelectWord,
  onSelectSettingsTab,
  onResetData,
  onLogout,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');

  const cleanQuery = query.trim().toLowerCase();

  const isUserAdmin = isAdmin || userRole === 'Admin' || userRole === 'Educator';

  // Static items (Pages, Settings tabs, and Actions)
  const staticItems = useMemo(() => [
    // --- PAGES ---
    {
      id: 'page-home',
      name: 'Home Dashboard',
      description: 'Your main dashboard with stats, streaks, and recommendations',
      category: 'pages',
      type: 'Page',
      icon: LayoutGrid,
      action: () => onNavigateView('home')
    },
    {
      id: 'page-library',
      name: 'Library & Reader Shelf',
      description: 'Browse all your books, uploaded PDFs, and sample files',
      category: 'pages',
      type: 'Page',
      icon: BookOpen,
      action: () => onNavigateView('reader')
    },
    {
      id: 'page-dictionary',
      name: 'My Dictionary & Vocabulary',
      description: 'Search, learn, and manage your saved translation cards',
      category: 'pages',
      type: 'Page',
      icon: HelpCircle,
      action: () => onNavigateView('dictionary')
    },
    {
      id: 'page-flashcards',
      name: 'SRS Flashcards Review',
      description: 'Review cards and learn vocabulary using spaced repetition',
      category: 'pages',
      type: 'Page',
      icon: Layers,
      action: () => onNavigateView('flashcards-view')
    },
    {
      id: 'page-all-tools',
      name: 'All Tools & Utilities',
      description: 'Directory of all study, translation, and custom utilities',
      category: 'pages',
      type: 'Page',
      icon: Sparkles,
      action: () => onNavigateView('all-tools')
    },
    ...(isUserAdmin ? [{
      id: 'page-admin',
      name: 'Admin & Educator Dashboard',
      description: 'User management, database diagnostics, and stats',
      category: 'pages',
      type: 'Page',
      icon: Terminal,
      action: () => onNavigateView('admin-dashboard')
    }] : []),

    // --- SETTINGS TABS ---
    {
      id: 'set-profile',
      name: 'Profile & Account Settings',
      description: 'Manage username, email, personalized roles, and avatars',
      category: 'pages',
      type: 'Settings',
      icon: User,
      action: () => onSelectSettingsTab('profile')
    },
    {
      id: 'set-security',
      name: 'Password & Screen Security',
      description: 'Enable custom passcode lock protection on the application',
      category: 'pages',
      type: 'Settings',
      icon: Lock,
      action: () => onSelectSettingsTab('security')
    },
    {
      id: 'set-notifications',
      name: 'Notification Settings',
      description: 'Configure reminders, daily streak alert schedules',
      category: 'pages',
      type: 'Settings',
      icon: Bell,
      action: () => onSelectSettingsTab('notifications')
    },
    {
      id: 'set-language',
      name: 'Interface & Content Language',
      description: 'Choose your native and foreign target study language',
      category: 'pages',
      type: 'Settings',
      icon: Globe,
      action: () => onSelectSettingsTab('languages')
    },
    {
      id: 'set-appearance',
      name: 'Appearance Theme Options',
      description: 'Toggle Light, Dark, or System visual themes easily',
      category: 'pages',
      type: 'Settings',
      icon: Palette,
      action: () => onSelectSettingsTab('appearance')
    },
    {
      id: 'set-help',
      name: 'Help Center & Support FAQs',
      description: 'Browse helpful tips, user manual details, and contact help',
      category: 'pages',
      type: 'Settings',
      icon: HelpCircle,
      action: () => onSelectSettingsTab('help')
    },

    // --- QUICK SHORTCUT ACTIONS ---
    {
      id: 'act-upload',
      name: 'Upload PDF or TEXT File',
      description: 'Directly import books, stories, or language files to read',
      category: 'actions',
      type: 'Action',
      icon: Plus,
      action: () => onOpenUpload()
    },
    {
      id: 'act-card',
      name: 'Create New Flashcard',
      description: 'Manually add a word, definition, and example context',
      category: 'actions',
      type: 'Action',
      icon: Plus,
      action: () => onOpenCreateFlashcard()
    },
    {
      id: 'act-reset',
      name: 'Reset App Data to Defaults',
      description: 'Clear local database caches and restore initial state',
      category: 'actions',
      type: 'Danger Action',
      icon: RotateCcw,
      action: () => {
        if (confirm('Reset all saved local reader data back to defaults?')) {
          onResetData();
        }
      }
    },
    {
      id: 'act-logout',
      name: 'Log Out of Account',
      description: 'Sign out and return to the login or welcome screen',
      category: 'actions',
      type: 'Auth Action',
      icon: LogOut,
      action: () => {
        if (onLogout) onLogout();
      }
    }
  ], [onNavigateView, onSelectSettingsTab, onOpenUpload, onOpenCreateFlashcard, onResetData, onLogout]);

  // Dynamic filter arrays
  const filteredDocs = useMemo(() => {
    if (!cleanQuery) return documents.slice(0, 5);
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(cleanQuery) ||
        (d.title && d.title.toLowerCase().includes(cleanQuery)) ||
        (d.author && d.author.toLowerCase().includes(cleanQuery)) ||
        (d.language && d.language.toLowerCase().includes(cleanQuery))
    );
  }, [documents, cleanQuery]);

  const filteredVocab = useMemo(() => {
    if (!cleanQuery) return vocabulary.slice(0, 5);
    return vocabulary.filter(
      (v) =>
        v.word.toLowerCase().includes(cleanQuery) ||
        v.translation.toLowerCase().includes(cleanQuery) ||
        (v.definition && v.definition.toLowerCase().includes(cleanQuery))
    );
  }, [vocabulary, cleanQuery]);

  const filteredFolders = useMemo(() => {
    if (!cleanQuery) return folders.slice(0, 3);
    return folders.filter((f) => f.name.toLowerCase().includes(cleanQuery));
  }, [folders, cleanQuery]);

  const filteredDecks = useMemo(() => {
    if (!cleanQuery) return decks.slice(0, 3);
    return decks.filter((d) => d.name.toLowerCase().includes(cleanQuery));
  }, [decks, cleanQuery]);

  const filteredStatic = useMemo(() => {
    if (!cleanQuery) return staticItems;
    return staticItems.filter(
      (item) =>
        item.name.toLowerCase().includes(cleanQuery) ||
        item.description.toLowerCase().includes(cleanQuery)
    );
  }, [staticItems, cleanQuery]);

  // Check categories
  const showPages = activeCategory === 'all' || activeCategory === 'pages';
  const showDocs = activeCategory === 'all' || activeCategory === 'documents';
  const showWords = activeCategory === 'all' || activeCategory === 'words';
  const showActions = activeCategory === 'all' || activeCategory === 'actions';

  const totalResults = 
    filteredStatic.length + 
    filteredDocs.length + 
    filteredVocab.length + 
    filteredFolders.length + 
    filteredDecks.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-16 px-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10 cursor-default" onClick={onClose} />

      <div
        className="w-full max-w-xl bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input bar */}
        <div className="p-4 border-b border-[#D1D1D6]/60 dark:border-[#38383A] flex items-center gap-3 bg-[#F5F5F7]/80 dark:bg-[#2C2C2E]/60">
          <Search className="w-5 h-5 text-[#007AFF] dark:text-[#0A84FF] shrink-0 stroke-[2.2]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, views, dictionary, actions..."
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#8E8E93] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-xl bg-[#EDEDF0] hover:bg-[#D1D1D6] dark:bg-[#2C2C2E] dark:hover:bg-[#38383A] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Categories filters tab bar */}
        <div className="px-4 py-2 border-b border-[#D1D1D6]/60 dark:border-[#38383A] flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-[#F5F5F7]/40 dark:bg-[#1C1C1E]">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'pages', label: 'Pages & Settings' },
            { id: 'documents', label: 'Books & Files' },
            { id: 'words', label: 'Words' },
            { id: 'actions', label: 'Shortcuts' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as SearchCategory)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scrollable results section */}
        <div className="p-4 overflow-y-auto space-y-5 custom-scrollbar bg-white dark:bg-[#1C1C1E]">
          
          {totalResults === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-[#8E8E93]">No matching items or shortcuts found.</p>
              <p className="text-xs text-[#8E8E93]/80 mt-1">Try another search term or click clear.</p>
            </div>
          )}

          {/* 1. PAGES & SETTINGS SECTION */}
          {showPages && filteredStatic.filter(s => s.category === 'pages').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <LayoutGrid className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  Pages & Navigation ({filteredStatic.filter(s => s.category === 'pages').length})
                </span>
              </div>
              <div className="space-y-1">
                {filteredStatic.filter(s => s.category === 'pages').map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/15 border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/40 flex items-center justify-between transition-all cursor-pointer text-start group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center group-hover:bg-[#007AFF] group-hover:text-white transition-all shadow-xs">
                          <IconComp className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] flex items-center gap-1.5">
                            {item.name}
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#EDEDF0] dark:bg-[#38383A] text-[#6E6E73] dark:text-[#98989D]">
                              {item.type}
                            </span>
                          </p>
                          <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D] truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. DOCUMENTS & BOOKS SECTION */}
          {showDocs && filteredDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <BookOpen className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  Documents & Books ({filteredDocs.length})
                </span>
              </div>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      onSelectDocument(doc);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/15 border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/40 flex items-center justify-between transition-all cursor-pointer text-start group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center group-hover:bg-[#007AFF] group-hover:text-white transition-all shadow-xs">
                        <FileText className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF]">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D] truncate mt-0.5">
                          {doc.totalPages || 1} pages • {doc.language || 'Auto'} • {doc.fileType.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. FOLDERS & SRS DECK SECTIONS */}
          {showDocs && (filteredFolders.length > 0 || filteredDecks.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFolders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <FolderIcon className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                      Folders ({filteredFolders.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredFolders.map((fold) => (
                      <button
                        key={fold.id}
                        onClick={() => {
                          onNavigateView('reader');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/15 border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/40 flex items-center justify-between transition-all cursor-pointer text-start group"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <FolderIcon className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF] shrink-0" />
                          <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF]">
                            {fold.name}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredDecks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Layers className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                      Decks ({filteredDecks.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredDecks.map((deck) => (
                      <button
                        key={deck.id}
                        onClick={() => {
                          onNavigateView('flashcards-view');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/15 border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/40 flex items-center justify-between transition-all cursor-pointer text-start group"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF] shrink-0" />
                          <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF]">
                            {deck.name}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. LEARNED WORDS SECTION */}
          {showWords && filteredVocab.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  Vocabulary & Definitions ({filteredVocab.length})
                </span>
              </div>
              <div className="space-y-1">
                {filteredVocab.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectWord(v.word);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/15 border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/40 flex items-center justify-between transition-all cursor-pointer text-start group"
                  >
                    <div className="min-w-0 flex-1 pe-3">
                      <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF]">
                        {v.word} <span className="text-[10px] font-medium text-[#8E8E93]">({v.partOfSpeech || 'Word'})</span>
                      </p>
                      <p className="text-[11px] text-[#007AFF] dark:text-[#0A84FF] font-medium truncate mt-0.5">
                        {v.translation || v.definition}
                      </p>
                      {v.contextSentence && (
                        <p className="text-[10px] text-[#8E8E93] truncate italic mt-0.5">
                          "{v.contextSentence}"
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-[#007AFF] dark:text-[#0A84FF] px-2.5 py-1 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] group-hover:bg-[#007AFF] group-hover:text-white transition-all shrink-0">
                      Explain
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. SHORTCUT ACTIONS SECTION */}
          {showActions && filteredStatic.filter(s => s.category === 'actions').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Terminal className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                  App Actions & Shortcuts ({filteredStatic.filter(s => s.category === 'actions').length})
                </span>
              </div>
              <div className="space-y-1">
                {filteredStatic.filter(s => s.category === 'actions').map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/15 border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF]/40 flex items-center justify-between transition-all cursor-pointer text-start group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center group-hover:bg-[#007AFF] group-hover:text-white transition-all shadow-xs">
                          <IconComp className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] flex items-center gap-1.5">
                            {item.name}
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                              item.type.includes('Danger')
                                ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                : 'bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]'
                            }`}>
                              {item.type}
                            </span>
                          </p>
                          <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D] truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
