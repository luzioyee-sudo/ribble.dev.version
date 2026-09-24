import React, { useState } from 'react';
import { RibbleLogo } from './RibbleLogo';
import {
  Home,
  BookOpen,
  Settings,
  Layers,
  Users,
  ChevronDown,
  Check,
  Library,
  Target,
  PanelLeft,
  SquarePen,
  Search,
  MessageSquare,
  Sparkles,
  X,
  Brain,
  LogOut,
  SpellCheck,
  Bell,
  PenLine,
  BookOpenText,
  BookA,
  BookMarked
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { getEffectiveAvatar } from '../utils/defaultAvatars';
import { AppView, UserAccount, ReaderSettings } from '../types';
import { DualFlagLanguageSelector } from './DualFlagLanguageSelector';

interface HeaderProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  syncStatus?: 'idle' | 'syncing' | 'registered';
  onRegisterSync?: () => void;
  interfaceLanguage?: string;
  targetLanguage?: string;
  onUpdateSettings?: (settings: Partial<ReaderSettings>) => void;
  user?: { name: string; email: string } | null;
  userEmail?: string;
  userAvatar?: string;
  userName?: string;
  currentUserRole?: 'Content Moderator' | 'Educator' | 'Student';
  allAccounts?: UserAccount[];
  activeUserId?: string;
  onSwitchUser?: (userId: string) => void;
  onSignOut?: () => void;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenGeminiVoice?: () => void;
  unreadNotificationsCount?: number;
  onTriggerOnboarding?: () => void;
}

// Header Component
// Toggles between minimal icon strip and full expanded sidebar menu
export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  syncStatus = 'idle',
  onRegisterSync,
  interfaceLanguage = 'English',
  targetLanguage = 'French',
  onUpdateSettings,
  user = null,
  userEmail,
  userAvatar,
  userName,
  currentUserRole = 'Student',
  allAccounts = [],
  activeUserId = 'usr-1',
  onSwitchUser,
  onSignOut,
  isCollapsed = false,
  onToggleSidebar,
  onOpenSearch,
  onOpenNotifications,
  onOpenGeminiVoice,
  unreadNotificationsCount = 0,
  onTriggerOnboarding,
}) => {
  const t = getTranslation(interfaceLanguage);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);

  const activeAccount = allAccounts.find((a) => a.id === activeUserId) || allAccounts[0];
  const currentName = user?.name || userName || activeAccount?.name || 'User';
  const currentEmail = user?.email || userEmail || activeAccount?.email || 'mopl8065@gmail.com';

  // Derive initials (e.g. MO)
  const userInitials = currentName
    ? currentName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'MO';

  return (
    <header
      className={`hidden md:flex h-screen sticky top-0 bg-white dark:bg-[#1C1C1E] border-e border-[#D1D1D6] dark:border-[#38383A] py-5 flex-col justify-between items-center select-none z-40 shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-16 px-2' : 'w-64 px-4'
      }`}
    >
      {/* Expanded / Collapsed Header Content */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Top Controls Header Cluster */}
        <div className="flex flex-col gap-2.5 w-full">
          <div className={`flex w-full ${isCollapsed ? 'flex-col gap-2 items-center justify-center' : 'flex-row items-center justify-between px-1'}`}>
            <div 
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setActiveView('home')}
            >
              <RibbleLogo showWordmark={!isCollapsed} size="sm" />
            </div>

            {/* Top action button: Collapse Sidebar */}
            <div className="flex items-center gap-1.5">
              {/* Toggle Sidebar Panel Button */}
              <button
                onClick={onToggleSidebar}
                className="w-8 h-8 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] transition-all cursor-pointer active:scale-95 shrink-0"
                title={isCollapsed ? (t.expandSidebar || "Expand Sidebar") : (t.collapseSidebar || "Collapse Sidebar")}
              >
                <PanelLeft className="w-4 h-4 stroke-[1.8]" />
              </button>
            </div>
          </div>

          {/* Quick Search Tool (Grouped in Top Header Cluster) */}
          <div className="flex flex-col gap-1 w-full">
            <button
              onClick={onOpenSearch}
              className={`flex items-center gap-2 p-2 rounded-xl text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EDEDF0] dark:hover:bg-[#2C2C2E] transition-all cursor-pointer text-start ${
                isCollapsed ? 'justify-center w-8 h-8 self-center bg-[#F5F5F7] dark:bg-[#2C2C2E]' : 'w-full px-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A]'
              }`}
              title={t.search || "Search Documents & Vocabulary"}
            >
              <Search className="w-4 h-4 stroke-[1.8] shrink-0 text-[#8E8E93] dark:text-[#636366]" />
              {!isCollapsed && <span className="text-[11px] font-medium text-[#8E8E93] dark:text-[#636366] truncate">{t.search || "Search..."}</span>}
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col gap-1 w-full pt-1">
          {/* 1. Home / Dashboard */}
          <button
            onClick={() => setActiveView('home')}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-start ${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } ${
              activeView === 'home'
                ? 'text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 font-semibold'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
            }`}
            title={t.navHome || 'Dashboard'}
          >
            <Home className="w-4 h-4 stroke-[2] shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">{t.navHome || 'Dashboard'}</span>}
          </button>

          {/* 2. Library */}
          <button
            onClick={() => setActiveView('reader')}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-start ${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } ${
              activeView === 'reader'
                ? 'text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 font-semibold'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
            }`}
            title={t.navLibrary || 'Library'}
          >
            <BookOpen className="w-4 h-4 stroke-[2] shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">{t.navLibrary || 'Library'}</span>}
          </button>

          {/* Flashcards */}
          <button
            onClick={() => setActiveView('flashcards')}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-start ${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } ${
              activeView === 'flashcards'
                ? 'text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 font-semibold'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
            }`}
            title={t.navFlashcards || 'Flashcards'}
          >
            <Layers className="w-4 h-4 stroke-[2] shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">{t.navFlashcards || 'Flashcards'}</span>}
          </button>

          {/* Dictionary */}
          <button
            onClick={() => setActiveView('dictionary')}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-start ${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } ${
              activeView === 'dictionary'
                ? 'text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 font-semibold'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
            }`}
            title={t.navDictionary || 'Dictionary'}
          >
            <BookA className="w-4 h-4 stroke-[2] shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">{t.navDictionary || 'Dictionary'}</span>}
          </button>

          {/* Practicing / Practice Hub */}
          <button
            onClick={() => setActiveView('practice')}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-start ${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } ${
              activeView === 'practice'
                ? 'text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 font-semibold'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
            }`}
            title={t.navPractice || 'Practicing & Active Retrieval'}
          >
            <Brain className="w-4 h-4 stroke-[2] shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">{t.navPractice || 'Practicing'}</span>}
          </button>

          {/* 4. Writing Assistant */}
          <button
            onClick={() => setActiveView('writing')}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-start ${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } ${
              activeView === 'writing'
                ? 'text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 font-semibold'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
            }`}
            title={t.navWriting || 'Writing Assistant'}
          >
            <PenLine className="w-4 h-4 stroke-[2] shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">{t.navWriting || 'Writing'}</span>}
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveView('settings')}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-start ${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } ${
              activeView === 'settings'
                ? 'text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 font-semibold'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
            }`}
            title={t.navSettings || 'Settings'}
          >
            <Settings className="w-4 h-4 stroke-[2] shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">{t.navSettings || 'Settings'}</span>}
          </button>
        </div>
      </div>

      {/* Bottom User Avatar / Profile Section */}
      <div className="relative mt-auto pt-3 w-full flex flex-col gap-2">
        {isCollapsed ? (
          <div className="flex justify-center">
            <button
              onClick={() => setIsAccountSwitcherOpen(!isAccountSwitcherOpen)}
              title={`${currentName} (${currentEmail})`}
              className="w-9 h-9 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-bold text-xs tracking-wide shadow-xs hover:scale-105 transition-transform cursor-pointer border border-[#D1D1D6] dark:border-[#38383A] overflow-hidden"
            >
              <img 
                src={getEffectiveAvatar(activeAccount?.avatar || userAvatar, activeAccount?.id || activeAccount?.name || userName)} 
                alt={currentName} 
                className="w-full h-full object-cover" 
              />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAccountSwitcherOpen(!isAccountSwitcherOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] transition-all cursor-pointer text-start"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#EDEDF0] dark:bg-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-[#D1D1D6] dark:ring-[#38383A]">
                <img 
                  src={getEffectiveAvatar(activeAccount?.avatar || userAvatar, activeAccount?.id || activeAccount?.name || userName)} 
                  alt={currentName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {currentName}
                </span>
                <span className="text-[10px] text-[#6E6E73] dark:text-[#98989D] truncate font-medium">
                  {currentEmail}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#8E8E93] dark:text-[#636366] shrink-0 transition-transform ${isAccountSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* User Info Popover */}
        {isAccountSwitcherOpen && (
          <div className={`absolute bottom-full mb-3 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-xl p-3.5 z-50 flex flex-col gap-3 ${
            isCollapsed ? 'start-0 w-64' : 'inset-x-0'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-[#D1D1D6] dark:ring-[#38383A] shadow-xs">
                <img 
                  src={getEffectiveAvatar(activeAccount?.avatar || userAvatar, activeAccount?.id || activeAccount?.name || userName)} 
                  alt={currentName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {currentName}
                </span>
                <span className="text-xs text-[#6E6E73] dark:text-[#98989D] truncate font-medium">
                  {currentEmail}
                </span>
              </div>
            </div>

            {onSignOut && (
              <div className="pt-2 border-t border-[#D1D1D6] dark:border-[#38383A]">
                <button
                  onClick={() => {
                    setIsAccountSwitcherOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF453A]/15 transition-colors cursor-pointer text-start"
                >
                  <LogOut className="w-4 h-4 text-[#FF3B30] dark:text-[#FF453A]" />
                  <span>{t.logOut || 'Log Out'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};


