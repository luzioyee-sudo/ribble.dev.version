const fs = require('fs');

const code = `import React, { useMemo } from 'react';
import { UserStats, ReaderSettings } from '../types';
import { storage } from '../utils/storage';
import { Brain, Trophy, Flame, Target, BookOpen, PenTool, LayoutDashboard } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { LANGUAGE_OPTIONS } from './DualFlagLanguageSelector';

interface MyLearningViewProps {
  settings: ReaderSettings;
  userStats: UserStats;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({ settings, userStats }) => {
  const t = getTranslation(settings.interfaceLanguage);
  const isAr = settings.interfaceLanguage === 'Arabic';
  const userId = storage.getSettings().userEmail ? 'usr-1' : 'usr-1'; // We use the active logged in UID technically but we can fetch all keys

  // To build an aggregation dashboard, we need to scan local storage for all language profiles
  // for the currently active user.
  const activeId = localStorage.getItem('lingoflow_current_user_id') || 'usr-1';
  
  const aggregatedStats = useMemo(() => {
    let totalVocab = 0;
    let totalDecks = 0;
    let totalDocs = 0;
    let maxStreak = userStats.currentStreak || 0;
    const langStats: Record<string, { vocab: parseInt, docs: parseInt, flag: string }> = {};

    LANGUAGE_OPTIONS.forEach(lang => {
       const cleanLang = lang.name.toLowerCase().trim().replace(/\\s+/g, '_');
       const vocab = storage.getVocabulary(activeId, cleanLang);
       const docs = storage.getDocuments(activeId, cleanLang);
       const stats = storage.getUserStats(activeId, cleanLang);
       
       if (vocab.length > 0 || docs.length > 0) {
          totalVocab += vocab.length;
          totalDocs += docs.length;
          if (stats && stats.currentStreak > maxStreak) {
             maxStreak = stats.currentStreak;
          }
          langStats[lang.name] = {
             vocab: vocab.length,
             docs: docs.length,
             flag: lang.flag
          };
       }
    });
    
    return {
       totalVocab,
       totalDocs,
       maxStreak,
       langStats
    }
  }, [activeId, userStats.currentStreak]);

  return (
    <div className="max-w-5xl mx-auto w-full pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#222222] dark:text-[#EFF1EE] tracking-tight mb-2 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-[#1856B7] dark:text-[#A4F5A6]" />
          My Learning Dashboard
        </h1>
        <p className="text-[#666666] dark:text-[#D0D2CF] text-base font-medium">
          Your global progress across all languages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-[#2C2C2E] rounded-3xl p-6 border border-[#E6DFD3] dark:border-[#3A3A3C] shadow-xs flex flex-col items-center text-center">
           <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <Flame className="w-7 h-7 text-orange-500" />
           </div>
           <span className="text-4xl font-black text-[#222222] dark:text-[#EFF1EE] mb-1">{aggregatedStats.maxStreak}</span>
           <span className="text-[#666666] dark:text-[#A1A1AA] text-sm font-bold uppercase tracking-wider">Highest Streak</span>
        </div>
        
        <div className="bg-white dark:bg-[#2C2C2E] rounded-3xl p-6 border border-[#E6DFD3] dark:border-[#3A3A3C] shadow-xs flex flex-col items-center text-center">
           <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Brain className="w-7 h-7 text-blue-500" />
           </div>
           <span className="text-4xl font-black text-[#222222] dark:text-[#EFF1EE] mb-1">{aggregatedStats.totalVocab}</span>
           <span className="text-[#666666] dark:text-[#A1A1AA] text-sm font-bold uppercase tracking-wider">Total Words Learned</span>
        </div>

        <div className="bg-white dark:bg-[#2C2C2E] rounded-3xl p-6 border border-[#E6DFD3] dark:border-[#3A3A3C] shadow-xs flex flex-col items-center text-center">
           <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-emerald-500" />
           </div>
           <span className="text-4xl font-black text-[#222222] dark:text-[#EFF1EE] mb-1">{aggregatedStats.totalDocs}</span>
           <span className="text-[#666666] dark:text-[#A1A1AA] text-sm font-bold uppercase tracking-wider">Total Books Read</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[#222222] dark:text-[#EFF1EE] mb-6 border-b border-[#E6DFD3] dark:border-[#3A3A3C] pb-2">Active Language Profiles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(aggregatedStats.langStats).map(([langName, stats]) => (
          <div key={langName} className="bg-white dark:bg-[#2C2C2E] p-5 rounded-2xl border border-[#E6DFD3] dark:border-[#3A3A3C] shadow-xs flex items-center justify-between hover:border-[#1856B7] dark:hover:border-[#A4F5A6] transition-colors cursor-default">
            <div className="flex items-center gap-4">
               <span className="text-4xl">{stats.flag}</span>
               <div>
                 <h3 className="text-lg font-bold text-[#222222] dark:text-[#EFF1EE]">{langName}</h3>
                 <p className="text-sm text-[#666666] dark:text-[#A1A1AA]">Active Profile</p>
               </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-sm font-bold text-[#222222] dark:text-[#EFF1EE] bg-[#F4F4F5] dark:bg-[#3A3A3C] px-3 py-1 rounded-full">
                  {stats.vocab} words
               </span>
               <span className="text-sm font-bold text-[#222222] dark:text-[#EFF1EE] bg-[#F4F4F5] dark:bg-[#3A3A3C] px-3 py-1 rounded-full">
                  {stats.docs} books
               </span>
            </div>
          </div>
        ))}
        {Object.keys(aggregatedStats.langStats).length === 0 && (
           <div className="col-span-full py-10 text-center text-[#666666]">
              No active language profiles yet. Start learning to see your progress here!
           </div>
        )}
      </div>

    </div>
  );
};
`;
fs.writeFileSync('src/components/MyLearningView.tsx', code);
console.log('Built MyLearningView component');
