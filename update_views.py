import re

# 1. Update BrowseCardsView.tsx
with open("src/components/BrowseCardsView.tsx", "r", encoding="utf-8") as f:
    browse_code = f.read()

# Replace topic card in BrowseCardsView.tsx
old_card_pattern = r'<div\s+key=\{topic\.name\}\s+id=\{`browse-topic-card-\$\{topic\.name\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\/g,\s*\'-\'\)\}`\}[\s\S]*?className="p-4 sm:p-5 flex items-center justify-end bg-white dark:bg-\[#1E1E1E\]"[\s\S]*?<\/div>\s*<\/div>'

new_topic_card = """<div 
                    key={topic.name}
                    id={`browse-topic-card-${topic.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => handleNavDeck(topic.name)}
                    className="group bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl overflow-hidden hover:border-[#007AFF] dark:hover:border-[#0A84FF] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col"
                  >
                    {/* Visual Topic Header Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                      <img 
                        src={visual.imageUrl} 
                        alt={topic.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                      
                      {/* Floating Level & Card Badges (Clean Glassmorphic) */}
                      <div className="absolute top-3.5 start-3.5 end-3.5 flex justify-between items-center z-10">
                        <span className="text-[11px] font-semibold tracking-wide text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                          {activeLevel}
                        </span>
                        <span className="text-[11px] font-medium text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#0A84FF]" />
                          <span>{topic.cards.length} {t.cards || 'cards'}</span>
                        </span>
                      </div>

                      {/* Topic Name on Image Banner */}
                      <div className="absolute bottom-3.5 start-4 end-4 z-10">
                        <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-sm capitalize">
                          {translatedTopicTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Bottom Metadata & Action Bar */}
                    <div className="p-4 flex items-center justify-between bg-white dark:bg-[#1C1C1E] border-t border-[#D1D1D6]/40 dark:border-[#38383A]">
                      <div className="flex items-center gap-2 text-xs text-[#6E6E73] dark:text-[#98989D] font-medium">
                        <span>{getLangLabel(activeLanguage)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{activeLevel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] group-hover:translate-x-0.5 transition-transform">
                        <span>{t.explore || 'Practice Deck'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>"""

browse_code = re.sub(old_card_pattern, new_topic_card, browse_code)

# Breadcrumbs and Headers
browse_code = browse_code.replace(
    'text-[#222222] dark:text-[#F5F5F7]',
    'text-[#1D1D1F] dark:text-[#F5F5F7]'
)
browse_code = browse_code.replace(
    'text-sm text-[#666666] mt-1',
    'text-sm text-[#6E6E73] dark:text-[#98989D] mt-1'
)
browse_code = browse_code.replace(
    'flex items-center gap-2 text-sm font-medium text-[#666666] mb-6',
    'flex items-center gap-2 text-sm font-medium text-[#6E6E73] dark:text-[#98989D] mb-6'
)
browse_code = browse_code.replace(
    'hover:text-[#222222] dark:hover:text-white',
    'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
)
browse_code = browse_code.replace(
    'text-[#222222] dark:text-white font-semibold',
    'text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold'
)

# Language levels cards
browse_code = browse_code.replace(
    'className="group flex flex-col items-start p-5 bg-white dark:bg-[#1E1E1E] border border-[#D1D1D6] dark:border-white/10 rounded-3xl hover:border-[#222222] dark:hover:border-white/30 transition-all text-start shadow-xs hover:shadow-md cursor-pointer"',
    'className="group flex flex-col items-start p-5 bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl hover:border-[#007AFF] dark:hover:border-[#0A84FF] transition-all text-start shadow-xs hover:shadow-md cursor-pointer"'
)
browse_code = browse_code.replace(
    '<FolderOpen className="w-6 h-6 text-[#666666] group-hover:text-[#222222] dark:group-hover:text-white transition-colors mb-4" />',
    '<div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"><FolderOpen className="w-5 h-5" /></div>'
)

# Search bar
browse_code = browse_code.replace(
    'focus:ring-2 focus:ring-[#34C759]',
    'focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]'
)

# Global cleanup of legacy color tokens in BrowseCardsView
browse_code = browse_code.replace('text-[#222222]', 'text-[#1D1D1F]')
browse_code = browse_code.replace('text-[#666666]', 'text-[#6E6E73]')
browse_code = browse_code.replace('dark:bg-[#1E1E1E]', 'dark:bg-[#1C1C1E]')

with open("src/components/BrowseCardsView.tsx", "w", encoding="utf-8") as f:
    f.write(browse_code)

print("BrowseCardsView updated.")

# 2. Update PracticeView.tsx
with open("src/components/PracticeView.tsx", "r", encoding="utf-8") as f:
    practice_code = f.read()

# Tab switcher
old_tabs = """      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-8 bg-white/50 p-1.5 rounded-2xl border border-[#D1D1D6] w-fit">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
            activeTab === 'quizzes' 
              ? 'bg-[#222222] text-[#F5F5F7] shadow-sm' 
              : 'text-[#222222]/60 hover:text-[#222222] hover:bg-white'
          }`}
        >
          {t.quizzesTab || 'Quizzes'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === 'history' 
              ? 'bg-[#222222] text-[#F5F5F7] shadow-sm' 
              : 'text-[#222222]/60 hover:text-[#222222] hover:bg-white'
          }`}
        >
          <History className="w-4 h-4" />
          {t.historyTab || 'History'}
        </button>
      </div>"""

new_tabs = """      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mb-8 bg-[#F5F5F7] dark:bg-[#1C1C1E] p-1 rounded-xl border border-[#D1D1D6] dark:border-[#38383A] w-fit">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'quizzes' 
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs' 
              : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
          }`}
        >
          {t.quizzesTab || 'Quizzes'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs' 
              : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          {t.historyTab || 'History'}
        </button>
      </div>"""

practice_code = practice_code.replace(old_tabs, new_tabs)

# Replace Recommended For You Banner
old_banner_pattern = r'<section id="recommended-quiz-section"[\s\S]*?<\/section>'

new_banner = """<section id="recommended-quiz-section" className="mb-10">
              <div className="bg-gradient-to-br from-[#007AFF]/8 via-[#007AFF]/3 to-transparent dark:from-[#0A84FF]/12 dark:via-[#0A84FF]/5 dark:to-transparent border border-[#007AFF]/20 dark:border-[#0A84FF]/25 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xs hover:border-[#007AFF]/40 transition-all">
                <div className="space-y-4 max-w-xl z-10">
                  <span className="text-[11px] font-semibold tracking-wider text-[#007AFF] dark:text-[#0A84FF] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t.recommendedForYou || 'Recommended for you'}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-tight">
                    {t.dailyUltimatePracticeMix || 'Daily Ultimate Practice Mix'}
                  </h2>

                  {/* Clean Apple-style Stepper Counter */}
                  <div className="inline-flex items-center bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] p-1 rounded-xl shadow-xs">
                    <button 
                      type="button"
                      onClick={() => setMixedCount(prev => Math.max(3, prev - 5))}
                      className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                      title="Decrease"
                    >
                      —
                    </button>
                    
                    <div className="flex items-center gap-1.5 px-3 select-none">
                      <span className="text-[10px] font-medium text-[#6E6E73] dark:text-[#98989D] uppercase">{t.sizeLabel || 'SIZE'}</span>
                      <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">{mixedCount} {t.qsLabel || 'Qs'}</span>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setMixedCount(prev => Math.min(100, prev + 5))}
                      className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                      title="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtle Graphic Visual */}
                <div id="recommended-quiz-art" className="hidden lg:flex items-center justify-center absolute end-56 top-1/2 -translate-y-1/2 pointer-events-none opacity-80 select-none">
                  <div className="w-28 h-28 rounded-2xl bg-[#007AFF]/5 dark:bg-[#0A84FF]/10 border border-[#007AFF]/10 flex items-center justify-center rotate-3">
                    <Brain className="w-14 h-14 text-[#007AFF]/40 dark:text-[#0A84FF]/40" />
                  </div>
                </div>

                <button 
                  id="start-rec-quiz-btn"
                  onClick={() => handleStartDynamicQuiz('mixed')}
                  className="px-6 py-3.5 bg-[#007AFF] hover:bg-[#0066D6] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shrink-0 shadow-xs self-start md:self-auto z-10"
                >
                  <span>{t.startPracticeMix || 'Start Practice Mix'}</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </section>"""

practice_code = re.sub(old_banner_pattern, new_banner, practice_code)

# Replace Quiz Modes Hub Section
old_modes_pattern = r'{\/\* Quiz Modes Hub \*\/}[\s\S]*?<\/section>'

new_modes = """{/* Quiz Modes Hub */}
            <section id="quiz-modes-hub" className="mb-12 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{t.selectQuizMode || 'Select your Quiz Mode'}</h2>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1: Test New Words */}
                <div id="mode-card-new" className="bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] p-6 rounded-2xl flex flex-col justify-between hover:border-[#007AFF] dark:hover:border-[#0A84FF] transition-all shadow-xs group">
                  <div className="space-y-4">
                    <div className="w-11 h-11 bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] text-lg leading-tight group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors">{t.testNewWords || 'Test New Words'}</h3>
                        <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 px-2 py-0.5 rounded-md uppercase">{t.newLabel || 'NEW'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                        {t.testNewWordsDesc || 'Focus specifically on the words you have recently added or collected from document sources.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-[#D1D1D6]/40 dark:border-[#38383A] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#6E6E73] dark:text-[#98989D] tabular-nums">
                      {vocabulary?.length || 0} {t.vocabularyItems || 'vocabulary items'}
                    </span>
                    <button 
                      onClick={() => handleStartDynamicQuiz('new')}
                      className="px-4 py-2 bg-[#007AFF] hover:bg-[#0066D6] dark:bg-[#0A84FF] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>{t.generateBtn || 'Generate'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 2: Words Needing Practice */}
                <div id="mode-card-old" className="bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] p-6 rounded-2xl flex flex-col justify-between hover:border-[#5856D6] dark:hover:border-[#5E5CE6] transition-all shadow-xs group">
                  <div className="space-y-4">
                    <div className="w-11 h-11 bg-[#5856D6]/10 text-[#5856D6] dark:text-[#5E5CE6] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] text-lg leading-tight group-hover:text-[#5856D6] dark:group-hover:text-[#5E5CE6] transition-colors">{t.wordsNeedingPractice || 'Words Needing Practice'}</h3>
                        <span className="text-[11px] font-semibold text-[#5856D6] dark:text-[#5E5CE6] bg-[#5856D6]/10 px-2 py-0.5 rounded-md uppercase">{t.priorityLabel || 'Priority'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                        {t.wordsNeedingPracticeDesc || 'Focus on challenging words. The app tracks your answers, lapses, and retention difficulty to generate your customized practice list.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-[#D1D1D6]/40 dark:border-[#38383A] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#6E6E73] dark:text-[#98989D] tabular-nums">
                      {challengingWordsCount > 0 ? `${challengingWordsCount} ${t.challengingWords || 'challenging words'}` : (t.smartPriorityList || 'Smart priority list')}
                    </span>
                    <button 
                      onClick={() => handleStartDynamicQuiz('old')}
                      className="px-4 py-2 bg-[#5856D6] hover:bg-[#4745B8] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>{t.reviewBtn || 'Review'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 3: Custom Quiz Engine */}
                <div id="mode-card-custom" className="bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] p-6 rounded-2xl flex flex-col justify-between hover:border-[#007AFF] dark:hover:border-[#0A84FF] transition-all shadow-xs group">
                  <div className="space-y-4">
                    <div className="w-11 h-11 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-xl flex items-center justify-center">
                      <Layers className="w-5 h-5 text-[#007AFF] dark:text-[#0A84FF]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">{t.customQuizBuilder || 'Custom Quiz Builder'}</h3>
                      <p className="text-xs text-[#6E6E73] dark:text-[#98989D] leading-relaxed">{t.customQuizBuilderDesc || 'Generate a personalized practice session instantly.'}</p>
                    </div>

                    {/* Mode Toggle Tabs */}
                    <div className="flex bg-[#F5F5F7] dark:bg-[#2C2C2E] p-1 rounded-xl border border-[#D1D1D6] dark:border-[#38383A]">
                      <button
                        type="button"
                        onClick={() => { setCustomMode('deck'); setCustomError(null); }}
                        className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          customMode === 'deck'
                            ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                            : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                        }`}
                      >
                        {t.chooseDeck || 'Choose Deck'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCustomMode('manual'); setCustomError(null); }}
                        className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          customMode === 'manual'
                            ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                            : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                        }`}
                      >
                        {t.typeWords || 'Type Words'}
                      </button>
                    </div>
                    
                    {/* Form Controls */}
                    <div className="space-y-3 text-xs">
                      {customMode === 'deck' ? (
                        <>
                          {/* Deck Selection */}
                          <div className="flex flex-col gap-1.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 rounded-xl border border-[#D1D1D6] dark:border-[#38383A]">
                            <span className="font-semibold text-xs text-[#6E6E73] dark:text-[#98989D]">{t.flashcardDeckLabel || 'Flashcard Deck:'}</span>
                            {decks.length > 0 ? (
                              <select 
                                value={selectedDeckId} 
                                onChange={(e) => setSelectedDeckId(e.target.value)}
                                className="bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7] border-none font-medium focus:outline-none cursor-pointer w-full text-xs"
                              >
                                {decks.map(d => (
                                  <option key={d.id} value={d.id} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7]">
                                    {d.name} ({vocabulary.filter(v => v.deckId === d.id).length} {t.words || 'words'})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-[#8E8E93] text-xs italic py-1">{t.noDecksAvailable || 'No decks available. Create one in Flashcards first!'}</div>
                            )}
                          </div>

                          {/* Questions Count Selection */}
                          <div className="flex items-center justify-between gap-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 rounded-xl border border-[#D1D1D6] dark:border-[#38383A]">
                            <span className="font-semibold text-xs text-[#6E6E73] dark:text-[#98989D]">{t.questionsLabel || 'Questions:'}</span>
                            <select 
                              value={customCount} 
                              onChange={(e) => setCustomCount(Number(e.target.value))}
                              className="bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7] border-none font-medium focus:outline-none cursor-pointer text-xs"
                            >
                              <option value={5} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7]">5 {t.questionsCountText || 'Questions'}</option>
                              <option value={10} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7]">10 {t.questionsCountText || 'Questions'}</option>
                              <option value={15} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7]">15 {t.questionsCountText || 'Questions'}</option>
                              <option value={20} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7]">20 {t.questionsCountText || 'Questions'}</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        /* Manual input mode */
                        <div className="flex flex-col gap-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 rounded-xl border border-[#D1D1D6] dark:border-[#38383A]">
                          <span className="font-semibold text-xs text-[#6E6E73] dark:text-[#98989D]">{t.typeOrPasteWords || 'Type or paste words:'}</span>
                          <textarea 
                            value={manualWordsInput}
                            onChange={(e) => setManualWordsInput(e.target.value)}
                            placeholder="e.g. Pernicious, Serendipity, Resilient"
                            rows={3}
                            className="w-full bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-lg p-2.5 font-normal text-xs border border-[#D1D1D6] dark:border-[#38383A] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] placeholder:text-[#8E8E93] resize-none"
                          />
                          <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] leading-normal">
                            {t.separateWordsDesc || "Separate words with commas, semicolons, or newlines. We'll automatically generate definitions for them!"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Graceful Dynamic Error Banner */}
                    {customError && (
                      <div className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-2.5 rounded-xl">
                        {customError}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleStartDynamicQuiz('custom')}
                    className="mt-6 w-full py-2.5 bg-[#007AFF] hover:bg-[#0066D6] dark:bg-[#0A84FF] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>{t.buildAndStart || 'Build & Start'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>"""

practice_code = re.sub(old_modes_pattern, new_modes, practice_code)

# Header in active quiz
practice_code = practice_code.replace(
    'bg-[#F5F5F7] min-h-screen',
    'bg-white dark:bg-black min-h-screen'
)
practice_code = practice_code.replace(
    '<span className="text-xs font-black bg-[#34C759] text-[#222222] px-3 py-1 rounded-full uppercase tracking-wider">',
    '<span className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 px-3 py-1 rounded-lg uppercase tracking-wider">'
)
practice_code = practice_code.replace(
    '<span className="text-xs font-black bg-[#222222] text-[#F5F5F7] px-3 py-1 rounded-full">',
    '<span className="text-xs font-medium text-[#6E6E73] dark:text-[#98989D] bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1 rounded-lg border border-[#D1D1D6] dark:border-[#38383A]">'
)
practice_code = practice_code.replace(
    'text-3xl md:text-4xl font-black tracking-tight text-[#222222]',
    'text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]'
)
practice_code = practice_code.replace(
    'text-[#222222]',
    'text-[#1D1D1F]'
)
practice_code = practice_code.replace(
    'text-[#666666]',
    'text-[#6E6E73]'
)

with open("src/components/PracticeView.tsx", "w", encoding="utf-8") as f:
    f.write(practice_code)

print("PracticeView updated successfully.")
