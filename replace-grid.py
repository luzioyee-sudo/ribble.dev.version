import re

with open('src/components/BrowseCardsView.tsx', 'r') as f:
    content = f.read()

start_marker = "      {/* Interactive Area */}\n      <div className=\"flex-1 relative flex flex-col\">"
end_marker = "        )}\n      </div>\n    </div>\n  );\n};"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx) + len("        )}\n")

if start_idx == -1 or end_idx == -1:
    print("Markers not found")
    exit(1)

inner = content[start_idx + len(start_marker):end_idx]

new_inner = f"""
        {{viewMode === 'grid' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pb-24">
              {{localQueue.map(card => {{
                const translation = card.arabicTranslation || card.senses?.[0]?.definition || card.word;
                const example = card.senses?.[0]?.examples?.[0]?.text || card.senses?.[0]?.definition || '';
                return (
                  <div key={{card.id}} className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-stone-700 flex flex-col h-full hover:shadow-md transition-shadow relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-4 z-10">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 px-2.5 py-1 rounded-lg">
                        {{card.language}}
                      </span>
                      <button
                        onClick={{(e) => handleSpeech(translationOnFront ? translation : card.word, translationOnFront ? (settings?.interfaceLanguage || 'English') : language, e)}}
                        className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col z-10">
                      <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight leading-tight mb-1">
                        {{translationOnFront ? translation : card.word}}
                      </h3>
                      {{!translationOnFront && card.phonetic && (
                        <p className="text-xs text-stone-400 font-mono mb-4">{{card.phonetic}}</p>
                      )}}
                      
                      {{(!translationOnFront && example && example !== card.word) && (
                        <p className="text-sm text-stone-500 dark:text-stone-400 italic mb-4 line-clamp-2">
                          "{{example}}"
                        </p>
                      )}}

                      <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-700/50">
                        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-widest block mb-1">
                          {{translationOnFront ? card.language : 'Translation'}}
                        </span>
                        <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
                          {{translationOnFront ? card.word : translation}}
                        </h4>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-stone-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20 backdrop-blur-[2px]">
                      <button onClick={{() => handleAction(card, 'down')}} className="w-12 h-12 bg-white dark:bg-stone-800 rounded-full shadow-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:scale-110 transition-transform cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={{() => handleAction(card, 'up')}} className="w-12 h-12 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-emerald-600 hover:scale-110 transition-transform cursor-pointer">
                        <BookOpen className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              }})}}
              {{localQueue.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2">Deck Complete</h2>
                  <p className="text-sm text-stone-500 mb-6">You have processed all cards.</p>
                  <button onClick={{restartDeck}} className="px-6 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                    Restart Deck
                  </button>
                </div>
              )}}
            </div>
          </div>
        ) : (
          <>{inner}</>
        )}
"""

new_content = content[:start_idx + len(start_marker)] + new_inner + content[end_idx:]

with open('src/components/BrowseCardsView.tsx', 'w') as f:
    f.write(new_content)

print("Done")
