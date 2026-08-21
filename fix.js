const fs = require('fs');
let code = fs.readFileSync('src/components/DictionaryView.tsx', 'utf8');

const replacement = `                              <div className="flex items-center gap-2">
                                <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded \${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}\`}>
                                  {lang.code}
                                </span>
                                <span>{lang.name}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Word Display Area */}
        <div className="pearl-card bg-white border border-[#D0E4FE] shadow-sm shadow-[#091F5C]/5 rounded-3xl p-5 sm:p-6 relative order-1 md:order-2 space-y-4">
          {isLoading && (
            <div className="absolute inset-0 bg-[#091F5C]/80 backdrop-blur-xs rounded-3xl z-10 flex items-center justify-center gap-2 text-white font-semibold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Translating with AI Dictionary...</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-black text-[#091F5C] tracking-tight leading-none">
                {currentResult.word}
              </h1>
              <button 
                onClick={() => handleSpeakText(currentResult.word, currentResult.sourceLanguage)}
                title="Listen to pronunciation"
                className={\`p-2.5 border rounded-full transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 font-bold text-xs \${
                  isPlayingAudio 
                    ? 'bg-blue-600 text-white border-blue-600 animate-pulse shadow-md' 
                    : 'border-[#D0E4FE] bg-[#E8F2FE] hover:bg-[#D0E4FE] text-[#334DAF]'
                }\`}
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Pronounce</span>
              </button>`;

code = code.replace(/                              <div className="flex items-center gap-2">[\s\S]*?<span className="hidden sm:inline">Pronounce<\/span>\s*<\/button>/, replacement);
fs.writeFileSync('src/components/DictionaryView.tsx', code);
