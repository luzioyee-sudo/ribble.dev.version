import { getTranslation } from '../utils/i18n';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyItem, Deck, ReaderSettings } from '../types';
import { 
  Search, Mic, Volume2, Bookmark, Copy, X, 
  Check, Loader2, Globe, ChevronDown, Quote
} from 'lucide-react';
import { playTTS } from '../utils/tts';
import { getLocalLexicalEntry } from '../utils/localLexicon';
import { startPronunciationPractice } from '../utils/speechRecognition';
import { activityTracker } from '../utils/activityTracker';
import { FlagIcon } from './DualFlagLanguageSelector';

interface DictionaryViewProps {
  vocabulary: VocabularyItem[];
  decks: Deck[];
  onAddWordClick: () => void;
  onEditCardClick: (card: VocabularyItem) => void;
  onDeleteCard: (id: string) => void;
  settings?: ReaderSettings;
  onSaveVocabulary?: (item: VocabularyItem) => void;
}

interface TranslationResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  sourceLanguage: string;
  grammarNote?: string;
  contextExamples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  translations: Record<string, {
    text: string;
    definition: string;
    example?: string;
    flag: string;
  }>;
}

// Pre-packaged dictionary lookups for instant responsiveness
const DICTIONARY_FALLBACKS: Record<string, TranslationResult> = {
  serendipity: {
    word: 'serendipity',
    phonetic: '/ˌserənˈdɪpəti/',
    partOfSpeech: 'noun',
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    sourceLanguage: 'English',
    grammarNote: 'Uncountable noun. First coined by Horace Walpole in 1754.',
    contextExamples: [
      'Meeting her in Paris was pure serendipity.',
      'Scientific discoveries often involve serendipity.'
    ],
    synonyms: ['chance', 'fluke', 'good fortune', 'providence'],
    antonyms: ['misfortune', 'design', 'plan'],
    translations: {
      Arabic: {
        text: 'صُدْفَة سَعِيدَة',
        definition: 'العُثُورُ عَلَى أَشْيَاءَ جَمِيلَةٍ عَنْ طَرِيقِ الصُّدْفَةِ.',
        example: 'كان لقاؤهما صدفة سعيدة غيرت حياتهما.',
        flag: 'EG'
      },
      German: {
        text: 'Glücklicher Zufall',
        definition: 'Zufällige Entdeckung von etwas Erfreulichem.',
        example: 'Es war reine Serendipität, dass wir uns trafen.',
        flag: 'DE'
      },
      French: {
        text: 'sérendipité',
        definition: 'Capacité de faire par hasard des découvertes heureuses.',
        example: 'Une découverte faite par sérendipité.',
        flag: 'FR'
      },
      Spanish: {
        text: 'serendipia',
        definition: 'Hallazgo afortunado e inesperado que se produce cuando se está buscando otra cosa.',
        example: 'Encontrar este libro fue pura serendipia.',
        flag: 'ES'
      },
      Italian: {
        text: 'serendipità',
        definition: 'La fortuna di fare felici e insperate scoperte per puro caso.',
        example: 'La scoperta della penicillina è un classico esempio di serendipità.',
        flag: 'IT'
      },
      Japanese: {
        text: 'セレンディピティ',
        definition: '思いがけないものを発見する幸運な能力。',
        example: '偶然のセレンディピティで素晴らしいアイデアを得た。',
        flag: 'JP'
      }
    }
  },
  resilience: {
    word: 'resilience',
    phonetic: '/rɪˈzɪliəns/',
    partOfSpeech: 'noun',
    definition: 'The capacity to withstand or recover quickly from difficult conditions.',
    sourceLanguage: 'English',
    grammarNote: 'Uncountable abstract noun.',
    contextExamples: [
      'The team showed remarkable resilience after their initial defeat.',
      'Building psychological resilience helps individuals adapt to life changes.'
    ],
    synonyms: ['toughness', 'adaptability', 'fortitude', 'flexibility'],
    antonyms: ['fragility', 'vulnerability', 'weakness'],
    translations: {
      Arabic: {
        text: 'المرونة والقدرة على التكيف',
        definition: 'القدرة على التعافي بسرعة من الصعوبات.',
        example: 'تظهر الشدة مرونة الإنسان الحقيقية.',
        flag: 'EG'
      },
      German: {
        text: 'Resilienz / Widerstandskraft',
        definition: 'Die Fähigkeit, schwierige Lebenssituationen ohne anhaltende Beeinträchtigung zu überstehen.',
        example: 'Ihre Resilienz half ihr durch die Krise.',
        flag: 'DE'
      },
      French: {
        text: 'résilience',
        definition: 'Capacité à surmonter les épreuves et les traumatismes.',
        example: 'La résilience est une qualité essentielle.',
        flag: 'FR'
      },
      Spanish: {
        text: 'resiliencia',
        definition: 'Capacidad de adaptación frente a un agente perturbador o un estado adverso.',
        example: 'Demostró gran resiliencia tras el obstáculo.',
        flag: 'ES'
      },
      Italian: {
        text: 'resilienza',
        definition: 'Capacità di reagire positivamente alle difficoltà.',
        example: 'La resilienza delle persone in tempi difficili.',
        flag: 'IT'
      },
      Japanese: {
        text: '回復力 / レジリエンス',
        definition: '困難な状況から迅速に立ち直る能力。',
        example: '彼女の精神的な回復力は素晴らしい。',
        flag: 'JP'
      }
    }
  },
  epiphany: {
    word: 'epiphany',
    phonetic: '/ɪˈpɪfəni/',
    partOfSpeech: 'noun',
    definition: 'A moment of sudden and great revelation or realization.',
    sourceLanguage: 'English',
    grammarNote: 'Plural: epiphanies.',
    contextExamples: [
      'She had a sudden epiphany while walking by the sea.',
      'His epiphany transformed the entire business strategy.'
    ],
    synonyms: ['revelation', 'insight', 'discovery', 'realization'],
    antonyms: ['confusion', 'misconception'],
    translations: {
      Arabic: {
        text: 'إشراق / تجلٍّ فكري',
        definition: 'لحظة إدراك مفاجئة وعميقة للحقيقة.',
        example: 'شعر بإشراق فكري غير مجرى أفكاره.',
        flag: 'EG'
      },
      German: {
        text: 'Aha-Erlebnis / Erleuchtung',
        definition: 'Eine plötzliche tiefe Erkenntnis.',
        example: 'Er hatte eine plötzliche Erleuchtung.',
        flag: 'DE'
      },
      French: {
        text: 'épiphanie',
        definition: 'Prise de conscience soudaine et lumineuse.',
        example: 'J\'ai eu une épiphanie soudaine.',
        flag: 'FR'
      },
      Spanish: {
        text: 'epifanía',
        definition: 'Momento de revelación o comprensión repentina.',
        example: 'Tuvo una epifanía al resolver el problema.',
        flag: 'ES'
      },
      Italian: {
        text: 'epifania',
        definition: 'Intuizione improvvisa e illuminante.',
        example: 'Un\'epifania che ha cambiato la sua vita.',
        flag: 'IT'
      },
      Japanese: {
        text: 'ひらめき / 突然の開眼',
        definition: '物事の本質を突然理解する瞬間。',
        example: '散歩中に突然のひらめきがあった。',
        flag: 'JP'
      }
    }
  }
};

const LANGUAGES = [
  { code: 'GB', name: 'English', tag: 'en' },
  { code: 'EG', name: 'Arabic', tag: 'ar' },
  { code: 'DE', name: 'German', tag: 'de' },
  { code: 'FR', name: 'French', tag: 'fr' },
  { code: 'ES', name: 'Spanish', tag: 'es' },
  { code: 'IT', name: 'Italian', tag: 'it' },
  { code: 'JP', name: 'Japanese', tag: 'ja' },
  { code: 'PT', name: 'Portuguese', tag: 'pt' },
  { code: 'RU', name: 'Russian', tag: 'ru' },
  { code: 'TR', name: 'Turkish', tag: 'tr' }
];

const getLocalizedLangName = (langName: string, t: any) => {
  const norm = langName.toLowerCase();
  if (norm.includes('english') || norm === 'gb' || norm === 'en') return t.langEnglish || 'English';
  if (norm.includes('arabic') || norm === 'eg' || norm === 'sa' || norm === 'ar') return t.langArabic || 'Arabic';
  if (norm.includes('german') || norm === 'de') return t.langGerman || 'German';
  if (norm.includes('french') || norm === 'fr') return t.langFrench || 'French';
  if (norm.includes('spanish') || norm === 'es') return t.langSpanish || 'Spanish';
  if (norm.includes('italian') || norm === 'it') return t.langItalian || 'Italian';
  if (norm.includes('japanese') || norm === 'jp' || norm === 'ja') return t.langJapanese || 'Japanese';
  if (norm.includes('portuguese') || norm === 'pt') return t.langPortuguese || 'Portuguese';
  if (norm.includes('russian') || norm === 'ru') return t.langRussian || 'Russian';
  if (norm.includes('turkish') || norm === 'tr') return t.langTurkish || 'Turkish';
  return langName;
};

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  vocabulary = [],
  decks = [],
  onSaveVocabulary,
  settings
}) => {
  const t = getTranslation(settings?.interfaceLanguage || 'English');
  // Primary States
  const [sourceLang] = useState<string>('Auto-Detect');
  const [targetLang, setTargetLang] = useState<string>(settings?.targetLanguage || 'Arabic');
  const [isTargetOpen, setIsTargetOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('serendipity');

  const [selectedVoice] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [speechSpeed] = useState<'normal' | 'slow'>('normal');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Keep target language synchronized with global settings
  useEffect(() => {
    if (settings?.targetLanguage && settings.targetLanguage !== targetLang) {
      setTargetLang(settings.targetLanguage);
    }
  }, [settings?.targetLanguage]);

  const handleSpeakText = (textToSpeak: string, langHint?: string) => {
    setIsPlayingAudio(true);
    playTTS(
      textToSpeak,
      langHint || currentResult.sourceLanguage,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      {
        voice: selectedVoice,
        promptStyle: speechSpeed === 'slow' ? 'slow' : 'normal',
      }
    );
  };
  const [currentResult, setCurrentResult] = useState<TranslationResult>(DICTIONARY_FALLBACKS.serendipity);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  
  // UI Actions feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [savedWordIds, setSavedWordIds] = useState<Set<string>>(new Set());
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');

  // Check if current word is already saved in user's vocabulary
  const isWordSaved = vocabulary.some(v => v.word.toLowerCase() === currentResult.word.toLowerCase()) || savedWordIds.has(currentResult.word.toLowerCase());

  // Handle Search Execution
  const handleSearch = async (termToSearch?: string, newTargetLang?: string, newSourceLang?: string) => {
    const word = (termToSearch || searchTerm).trim();
    if (!word) return;

    const tLang = newTargetLang || targetLang;
    const sLang = newSourceLang || sourceLang;

    setIsLoading(true);

    const lowercase = word.toLowerCase();

    // 1. First check Local Client-Side Lexicon
    const localEntry = getLocalLexicalEntry(lowercase);
    if (localEntry) {
      const primarySense = localEntry.senses && localEntry.senses[0];
      const primaryExample = primarySense?.examples && primarySense.examples[0];
      const pos = Array.isArray(localEntry.partOfSpeech) ? localEntry.partOfSpeech.join(', ') : localEntry.partOfSpeech;

      const lexResult: TranslationResult = {
        word: localEntry.word,
        phonetic: localEntry.phonetic || `/${localEntry.word}/`,
        partOfSpeech: pos || 'noun',
        definition: primarySense?.definition || localEntry.word,
        sourceLanguage: sLang,
        grammarNote: `Lemma: ${localEntry.lemma} • CEFR: ${localEntry.cefr} • Frequency: ${localEntry.frequency}`,
        contextExamples: primarySense?.examples?.map((ex: any) => ex.source) || [`"Example sentence for ${localEntry.word}."`],
        synonyms: primarySense?.synonyms || ['related expression'],
        antonyms: primarySense?.antonyms || [],
        translations: {
          Arabic: {
            text: localEntry.arabicTranslation || primarySense?.arabicTranslation?.text || 'ترجمة عربية',
            definition: primarySense?.definition || '',
            example: primaryExample?.source || '',
            flag: 'EG',
          },
          German: {
            text: `Übersetzung (${localEntry.word})`,
            definition: primarySense?.definition || '',
            flag: 'DE',
          },
          French: {
            text: `Traduction (${localEntry.word})`,
            definition: primarySense?.definition || '',
            flag: 'FR',
          },
          Spanish: {
            text: `Traducción (${localEntry.word})`,
            definition: primarySense?.definition || '',
            flag: 'ES',
          },
        },
      };

      setCurrentResult(lexResult);
      activityTracker.logDictionarySearch(word, 1);
      setIsLoading(false);
      return;
    }

    // 2. Fallback check Master English Lexicon API
    try {
      const lexRes = await fetch(`/api/lexicon/entry/${encodeURIComponent(lowercase)}`);
      if (lexRes.ok) {
        const lexData = await lexRes.json();
        if (lexData && lexData.word) {
          const primarySense = lexData.senses && lexData.senses[0];
          const primaryExample = primarySense?.examples && primarySense.examples[0];
          const pos = Array.isArray(lexData.partOfSpeech) ? lexData.partOfSpeech.join(', ') : lexData.partOfSpeech;

          const lexResult: TranslationResult = {
            word: lexData.word,
            phonetic: lexData.phonetic || `/${lexData.word}/`,
            partOfSpeech: pos || 'noun',
            definition: primarySense?.definition || lexData.word,
            sourceLanguage: sLang,
            grammarNote: `Lemma: ${lexData.lemma} • CEFR: ${lexData.cefr} • Frequency: ${lexData.frequency}`,
            contextExamples: primarySense?.examples?.map((ex: any) => ex.source) || [`"Example sentence for ${lexData.word}."`],
            synonyms: primarySense?.synonyms || ['related expression'],
            antonyms: primarySense?.antonyms || [],
            translations: {
              Arabic: {
                text: lexData.arabicTranslation || primarySense?.arabicTranslation?.text || 'ترجمة عربية',
                definition: primarySense?.definition || '',
                example: primaryExample?.source || '',
                flag: 'EG',
              },
              German: {
                text: `Übersetzung (${lexData.word})`,
                definition: primarySense?.definition || '',
                flag: 'DE',
              },
              French: {
                text: `Traduction (${lexData.word})`,
                definition: primarySense?.definition || '',
                flag: 'FR',
              },
              Spanish: {
                text: `Traducción (${lexData.word})`,
                definition: primarySense?.definition || '',
                flag: 'ES',
              },
            },
          };

          setCurrentResult(lexResult);
          activityTracker.logDictionarySearch(word, 1);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log('Lexicon lookup bypassed, proceeding to API translation:', err);
    }
    
    // Check local dictionary fallback for instant response
    if (DICTIONARY_FALLBACKS[lowercase]) {
      const fb = DICTIONARY_FALLBACKS[lowercase];
      setCurrentResult(fb);
      activityTracker.logDictionarySearch(word, 1);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          targetLanguage: tLang,
          sourceLanguage: sLang
        })
      });

      if (res.ok) {
        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Invalid JSON from dictionary API. Output snippet:", text.substring(0, 100));
          throw new Error("Received non-JSON response from server");
        }
        
        // Build dynamic result
        const mainTrans = data.translation || word;
        const mainDef = data.definition || 'Definition generated via dictionary lookup.';
        
        const dynamicContextExamples = Array.isArray(data.contextExamples) && data.contextExamples.length > 0
          ? data.contextExamples
          : (Array.isArray(data.examples) && data.examples.length > 0
              ? data.examples.map((ex: any) => typeof ex === 'string' ? ex : ex.source || ex.target)
              : [`"Meeting her in Paris was pure ${word}."`, `"Scientific discoveries often involve ${word}."`]);

        const dynamicSynonyms = Array.isArray(data.synonyms) && data.synonyms.length > 0
          ? data.synonyms
          : ['chance', 'fluke', 'good fortune', 'providence'];

        const dynamicAntonyms = Array.isArray(data.antonyms) && data.antonyms.length > 0
          ? data.antonyms
          : ['misfortune', 'design', 'plan'];

        const newResult: TranslationResult = {
          word: data.word || word,
          phonetic: data.phonetic || `/${word}/`,
          partOfSpeech: data.partOfSpeech || 'noun',
          definition: mainDef,
          sourceLanguage: sLang,
          grammarNote: data.grammarNote,
          contextExamples: dynamicContextExamples,
          synonyms: dynamicSynonyms,
          antonyms: dynamicAntonyms,
          translations: {
            [tLang]: {
              text: mainTrans,
              definition: mainDef,
              example: data.examples?.[0]?.target || `${word} in context.`,
              flag: LANGUAGES.find(l => l.name === tLang)?.code || 'GB'
            },
            Arabic: {
              text: tLang === 'Arabic' ? mainTrans : `ترجمة ${word}`,
              definition: tLang === 'Arabic' ? mainDef : `معنى كلمة ${word} باللغة العربية.`,
              flag: 'EG'
            },
            German: {
              text: tLang === 'German' ? mainTrans : `Übersetzung von ${word}`,
              definition: tLang === 'German' ? mainDef : `Bedeutung von ${word} auf Deutsch.`,
              flag: 'DE'
            },
            French: {
              text: tLang === 'French' ? mainTrans : `Traduction de ${word}`,
              definition: tLang === 'French' ? mainDef : `Signification de ${word} en français.`,
              flag: 'FR'
            },
            Spanish: {
              text: tLang === 'Spanish' ? mainTrans : `Traducción de ${word}`,
              definition: tLang === 'Spanish' ? mainDef : `Significado de ${word} en español.`,
              flag: 'ES'
            }
          }
        };

        setCurrentResult(newResult);
        activityTracker.logDictionarySearch(word, 1);
      } else {
        throw new Error('API request failed');
      }
    } catch (e) {
      console.error('Dictionary API search error:', e);
      // Fallback result on error
      setCurrentResult({
        word,
        phonetic: `/${word}/`,
        partOfSpeech: 'word',
        definition: `Translation and explanation for "${word}".`,
        sourceLanguage: sLang,
        translations: {
          [tLang]: {
            text: `${word} (${tLang})`,
            definition: `Meaning of ${word} in ${tLang}.`,
            flag: LANGUAGES.find(l => l.name === tLang)?.code || 'GB'
          }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Switch target language on pill click
  const handleSelectLanguage = (langName: string) => {
    setTargetLang(langName);
    handleSearch(searchTerm, langName, sourceLang);
  };

  // Voice Speech Recognition
  const handleStartVoice = () => {
    if (isRecording) return;
    setIsRecording(true);
    startPronunciationPractice(
      '',
      sourceLang,
      (_match, transcript) => {
        if (transcript) {
          setSearchTerm(transcript);
          handleSearch(transcript, targetLang, sourceLang);
        }
      },
      (err) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      },
      () => setIsRecording(false)
    );
  };

  // Copy to Clipboard with Feedback
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Save Word to Vocabulary
  const handleSaveWord = (targetLangName: string, textToSave?: string, defToSave?: string) => {
    const wordToSave = currentResult.word;
    const activeTranslation = textToSave || currentResult.translations[targetLangName]?.text || currentResult.translations[targetLang]?.text || 'Translation';
    const activeDef = defToSave || currentResult.translations[targetLangName]?.definition || currentResult.definition;

    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      word: wordToSave,
      phonetic: currentResult.phonetic,
      translation: activeTranslation,
      definition: activeDef,
      partOfSpeech: currentResult.partOfSpeech,
      grammarNote: currentResult.grammarNote || '',
      contextSentence: currentResult.translations[targetLangName]?.example || `Studied ${wordToSave} in Dictionary.`,
      deckId: selectedDeckId || (decks[0]?.id || ''),
      language: targetLangName || targetLang,
      dateAdded: Date.now(),
      tags: ['Dictionary', targetLangName]
    };

    if (onSaveVocabulary) {
      onSaveVocabulary(newItem);
    }
    const deckName = decks.find(d => d.id === newItem.deckId)?.name;
    activityTracker.logVocabSaved(wordToSave, activeTranslation, deckName);
    setSavedWordIds(prev => new Set(prev).add(wordToSave.toLowerCase()));
  };

  return (
    <div id="dictionary-view-container" className="w-full max-w-5xl mx-auto text-[#1D1D1F] dark:text-[#F5F5F7] pb-16 pt-2 font-sans space-y-6">
      {/* 1. SEARCH & CONTROL BAR */}
      <div id="dictionary-search-wrapper" className="w-full max-w-3xl mx-auto">
        <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-2xl p-2 sm:p-2.5 border border-[#D1D1D6] dark:border-[#38383A] shadow-xs flex items-center gap-2 focus-within:border-[#007AFF] dark:focus-within:border-[#0A84FF] focus-within:ring-2 focus-within:ring-[#007AFF]/15 transition-all">
          <Search className="w-4 h-4 text-[#8E8E93] dark:text-[#636366] ms-2 shrink-0 pointer-events-none" />
          
          <input 
            id="dictionary-search-input"
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder={t.typeWordPlaceholder ? t.typeWordPlaceholder.replace('{lang}', sourceLang) : `Type word in ${sourceLang}...`}
            className="flex-1 bg-transparent px-2 py-1 text-sm font-medium outline-none text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#8E8E93] dark:placeholder:text-[#636366] min-w-0"
          />

          {searchTerm && (
            <button 
              id="dictionary-clear-search-btn"
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer shrink-0 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Search Mic Button */}
          <button 
            id="dictionary-voice-search-btn"
            onClick={handleStartVoice}
            title={isRecording ? (t.listening || 'Listening...') : (t.searchWithVoice || 'Search with voice')}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isRecording 
                ? 'bg-[#FF3B30] text-white animate-pulse shadow-sm' 
                : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Lookup Action Button */}
          <button 
            id="dictionary-lookup-btn"
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : (t.lookup || 'Lookup')}
          </button>

          {/* Target Language Dropdown Selector */}
          <div className="relative hidden md:block shrink-0">
            <button
              id="dictionary-target-lang-trigger"
              onClick={() => setIsTargetOpen(!isTargetOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-xs transition-all cursor-pointer shadow-2xs"
              title={t.chooseTargetLanguage || 'Choose Target Language'}
            >
              <Globe className="w-3.5 h-3.5 text-[#6E6E73] dark:text-[#98989D] shrink-0" />
              <span className="truncate max-w-[90px]">{getLocalizedLangName(targetLang, t)}</span>
              <ChevronDown className={`w-3 h-3 text-[#8E8E93] dark:text-[#636366] shrink-0 transition-transform duration-200 ${isTargetOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Target Language Dropdown Menu */}
            <AnimatePresence>
              {isTargetOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTargetOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 mt-2 w-56 bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-xl z-50 p-1.5 overflow-hidden"
                  >
                    <div className="text-[10px] font-semibold tracking-wider uppercase text-[#6E6E73] dark:text-[#98989D] px-2.5 py-1.5 border-b border-[#D1D1D6] dark:border-[#38383A] mb-1">
                      {t.translateTo || 'Translate To'}
                    </div>
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin">
                      {LANGUAGES.map((lang) => {
                        const isSelected = targetLang === lang.name;
                        return (
                          <button
                            key={`tgt-opt-${lang.code}`}
                            onClick={() => {
                              setIsTargetOpen(false);
                              handleSelectLanguage(lang.name);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#007AFF] text-white font-semibold shadow-xs'
                                : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]'}`}>
                                {lang.code}
                              </span>
                              <span>{getLocalizedLangName(lang.name, t)}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
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

      {/* 2. MAIN WORD & DEFINITION CARD */}
      <div id="dictionary-word-card" className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] shadow-xs rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative space-y-5">
        {isLoading && (
          <div className="absolute inset-0 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xs rounded-2xl sm:rounded-3xl z-10 flex items-center justify-center gap-2 text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />
            <span>{t.translating || 'Translating...'}</span>
          </div>
        )}

        {/* Word Title & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 id="dictionary-word-title" className="text-2xl sm:text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-none">
              {currentResult.word}
            </h1>

            {/* Part of Speech Pill */}
            <span className="px-2.5 py-0.5 border border-[#007AFF]/30 dark:border-[#0A84FF]/40 rounded-full text-[10px] text-[#007AFF] dark:text-[#0A84FF] uppercase tracking-wider font-bold bg-[#007AFF]/10 dark:bg-[#0A84FF]/20">
              {currentResult.partOfSpeech}
            </span>

            {/* Phonetics & Language */}
            <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-xs sm:text-sm">
              {currentResult.phonetic}
            </span>
            <span className="text-[#6E6E73] dark:text-[#98989D] text-xs">
              ({getLocalizedLangName(currentResult.sourceLanguage, t)})
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Pronounce Audio Button */}
            <button 
              id="dictionary-pronounce-btn"
              onClick={() => handleSpeakText(currentResult.word, currentResult.sourceLanguage)}
              title={t.listenToPronunciation || 'Listen to pronunciation'}
              className={`p-2 sm:px-3 sm:py-1.5 border rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 font-medium text-xs ${
                isPlayingAudio 
                  ? 'bg-[#007AFF] text-white border-[#007AFF] animate-pulse shadow-sm' 
                  : 'border-[#D1D1D6] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#007AFF]/10 hover:border-[#007AFF]/50 text-[#1D1D1F] dark:text-[#F5F5F7]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.pronounce || 'Pronounce'}</span>
            </button>

            {/* Deck Selector Dropdown */}
            {decks.length > 0 && (
              <div className="relative">
                <select
                  id="dictionary-deck-select"
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium border border-[#D1D1D6] dark:border-[#38383A] rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none cursor-pointer hover:border-[#007AFF]/50 transition-colors"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Save to Vocabulary / Bookmark */}
            <button 
              id="dictionary-save-vocab-btn"
              onClick={() => handleSaveWord(targetLang)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                isWordSaved
                  ? 'bg-[#34C759] text-white'
                  : 'border border-[#D1D1D6] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-[#007AFF]/50 hover:bg-[#007AFF]/10 hover:text-[#007AFF]'
              }`}
            >
              {isWordSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">{t.saved || 'Saved'}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.save || 'Save'}</span>
                </>
              )}
            </button>

            {/* Copy Button */}
            <button 
              id="dictionary-copy-btn"
              onClick={() => handleCopy(`${currentResult.word} - ${currentResult.definition}`)}
              title={t.copyToClipboard || 'Copy to Clipboard'}
              className="p-2 border border-[#D1D1D6] dark:border-[#38383A] rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer transition-colors"
            >
              {copiedText === `${currentResult.word} - ${currentResult.definition}` ? (
                <Check className="w-3.5 h-3.5 text-[#34C759] stroke-[2.5]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Primary English Definition */}
        <p className="text-[#1D1D1F] dark:text-[#F5F5F7] text-sm sm:text-base leading-relaxed font-normal">
          {currentResult.definition}
        </p>

        {/* Grammar Note */}
        {currentResult.grammarNote && (
          <div className="text-xs bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] p-3 rounded-xl">
            <span className="font-semibold uppercase tracking-wider text-[10px] me-1.5 text-[#007AFF] dark:text-[#0A84FF]">
              {t.grammarNote || 'Grammar Note'}:
            </span>
            {currentResult.grammarNote}
          </div>
        )}

        <hr className="my-3 border-[#D1D1D6] dark:border-[#38383A]" />

        {/* 3. TARGET TRANSLATION SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-wider text-[#6E6E73] dark:text-[#98989D] uppercase flex items-center gap-1.5">
              <span>{t.translation || 'Translation'} ({getLocalizedLangName(targetLang, t)})</span>
            </h3>
            <span className="text-[11px] text-[#8E8E93] dark:text-[#636366]">
              {t.selectedTargetLanguage || 'Selected Target Language'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(Object.entries(currentResult.translations).filter(([langName]) => langName === targetLang).length > 0
              ? Object.entries(currentResult.translations).filter(([langName]) => langName === targetLang)
              : Object.entries(currentResult.translations).slice(0, 1)
            ).map(([langName, rawData]) => {
              const transData = rawData as { text: string; definition: string; example?: string; flag: string };
              return (
                <div 
                  key={langName}
                  className="border rounded-2xl p-4 sm:p-5 relative shadow-xs transition-all border-[#D1D1D6] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E]"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#1D1D1F] dark:text-[#F5F5F7]">
                      <FlagIcon code={transData.flag || (langName === 'Arabic' ? 'EG' : langName === 'French' ? 'FR' : 'GB')} className="w-5 h-3.5 rounded-xs shadow-2xs" />
                      <span>{getLocalizedLangName(langName, t)}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleSpeakText(transData.text, langName)}
                        title={t.pronounce || 'Pronounce'}
                        className="p-1.5 rounded-lg text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#FFFFFF] dark:hover:bg-[#1C1C1E] transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleSaveWord(langName, transData.text, transData.definition)}
                        title={t.saveToVocab || 'Save Translation'}
                        className="p-1.5 rounded-lg text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#FFFFFF] dark:hover:bg-[#1C1C1E] transition-colors cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleCopy(transData.text)}
                        title={t.copy || 'Copy'}
                        className="p-1.5 rounded-lg text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#FFFFFF] dark:hover:bg-[#1C1C1E] transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`flex flex-col gap-1.5 ${langName === 'Arabic' ? 'text-end' : ''}`}>
                    <div 
                      className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]"
                      dir={langName === 'Arabic' ? 'rtl' : 'ltr'}
                    >
                      {transData.text}
                    </div>
                    <div 
                      className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed"
                      dir={langName === 'Arabic' ? 'rtl' : 'ltr'}
                    >
                      {transData.definition}
                    </div>
                    {transData.example && (
                      <div className="text-xs text-[#8E8E93] dark:text-[#636366] italic mt-1 pt-2 border-t border-[#D1D1D6] dark:border-[#38383A]">
                        "{transData.example}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. CONTEXT & SENTENCE EXAMPLES */}
        <div className="pt-3 border-t border-[#D1D1D6] dark:border-[#38383A] space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-xs tracking-wider uppercase shadow-2xs">
              <Quote className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
              <span>{t.contextSentence || 'Context & Examples'}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {(currentResult.contextExamples || [
              `Meeting her in Paris was pure ${currentResult.word}.`,
              `Scientific discoveries often involve ${currentResult.word}.`
            ]).map((sentence, idx) => {
              const cleanSentence = sentence.replace(/^["'“]|["'”]$/g, '').trim();
              return (
                <div 
                  key={idx}
                  className="bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D1D1D6] dark:border-[#38383A] rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-[#007AFF]/50 dark:hover:border-[#0A84FF]/50 transition-colors"
                >
                  <p className="text-[#1D1D1F] dark:text-[#F5F5F7] italic text-xs sm:text-sm leading-relaxed">
                    "{cleanSentence}"
                  </p>
                  <button
                    onClick={() => handleSpeakText(cleanSentence, currentResult.sourceLanguage)}
                    title={t.listenToPronunciation || 'Listen to sentence'}
                    className="p-1.5 text-[#6E6E73] hover:text-[#007AFF] dark:text-[#98989D] dark:hover:text-[#0A84FF] hover:bg-[#FFFFFF] dark:hover:bg-[#1C1C1E] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* 5. SYNONYMS & ANTONYMS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Synonyms */}
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-wider text-[#6E6E73] dark:text-[#98989D] uppercase">
                {t.synonymsClickToLookup || 'Synonyms (Click to lookup)'}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(currentResult.synonyms && currentResult.synonyms.length > 0
                  ? currentResult.synonyms
                  : ['chance', 'fluke', 'good fortune', 'providence']
                ).map((syn) => (
                  <button
                    key={syn}
                    onClick={() => {
                      setSearchTerm(syn);
                      handleSearch(syn);
                    }}
                    className="px-3 py-1 rounded-full border border-[#D1D1D6] dark:border-[#38383A] bg-[#FFFFFF] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium hover:border-[#007AFF] hover:bg-[#007AFF]/10 hover:text-[#007AFF] dark:hover:border-[#0A84FF] dark:hover:text-[#0A84FF] transition-colors cursor-pointer shadow-2xs"
                  >
                    {syn}
                  </button>
                ))}
              </div>
            </div>

            {/* Antonyms */}
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-wider text-[#6E6E73] dark:text-[#98989D] uppercase">
                {t.antonyms || 'Antonyms'}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(currentResult.antonyms && currentResult.antonyms.length > 0
                  ? currentResult.antonyms
                  : ['misfortune', 'design', 'plan']
                ).map((ant) => (
                  <button
                    key={ant}
                    onClick={() => {
                      setSearchTerm(ant);
                      handleSearch(ant);
                    }}
                    className="px-3 py-1 rounded-full border border-[#D1D1D6] dark:border-[#38383A] bg-[#FFFFFF] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium hover:border-[#007AFF] hover:bg-[#007AFF]/10 hover:text-[#007AFF] dark:hover:border-[#0A84FF] dark:hover:text-[#0A84FF] transition-colors cursor-pointer shadow-2xs"
                  >
                    {ant}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
