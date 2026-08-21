import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Youtube,
  ArrowLeft,
  Loader2,
  Play,
  Globe,
  Edit3,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  PenLine,
  Sparkles,
  BookOpen,
  Clock,
  ListOrdered,
  Share2,
  Trash2,
  MessageSquare,
  Check,
  X,
  Volume2,
  ExternalLink,
} from 'lucide-react';
import YouTube, { YouTubeEvent } from 'react-youtube';
import type { Transcript, TranscriptSegment } from '../types/transcript';
import type { WordDefinition, VocabularyItem } from '../types';
import { WordModal } from './WordModal';
import { storage } from '../utils/storage';
import {
  findActiveSegmentIndex,
  findActiveWordIndex,
  normalizeTranscript,
} from '../utils/transcriptSync';
import { CURATED_TRANSCRIPTS } from '../data/curatedTranscripts';

interface YouTubeViewProps {
  onBack: () => void;
  settings?: any;
}

interface TranscriptLanguage {
  id: string;
  name: string;
  native: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

const TRANSCRIPT_LANGUAGES: TranscriptLanguage[] = [
  { id: 'English', name: 'English', native: 'English', flag: '🇬🇧', dir: 'ltr' },
  { id: 'Arabic', name: 'Arabic', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { id: 'German', name: 'German', native: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { id: 'Italian', name: 'Italian', native: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { id: 'Spanish', name: 'Spanish', native: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { id: 'French', name: 'French', native: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { id: 'Russian', name: 'Russian', native: 'Русский', flag: '🇷🇺', dir: 'ltr' },
];

interface VideoMeta {
  id: string;
  title: string;
  speaker?: string;
  category: string;
  duration?: string;
}

const ALL_CURATED_VIDEOS: VideoMeta[] = [
  {
    id: 'eIho2S0ZahI',
    title: 'How to Speak so People Want to Listen',
    speaker: 'Julian Treasure · TED',
    category: 'COMMUNICATION',
    duration: '9:58',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    speaker: 'Rick Astley',
    category: 'MUSIC',
    duration: '3:32',
  },
  {
    id: 'iCvmsMzlF7o',
    title: 'The Power of Vulnerability',
    speaker: 'Brené Brown · TED',
    category: 'PSYCHOLOGY',
    duration: '20:19',
  },
  {
    id: 'arj7oStGLkU',
    title: 'Try Something New for 30 Days',
    speaker: 'Matt Cutts · TED',
    category: 'HABITS',
    duration: '3:27',
  },
  {
    id: 'peKZAIIrc7g',
    title: 'How Great Leaders Inspire Action',
    speaker: 'Simon Sinek · TED',
    category: 'LEADERSHIP',
    duration: '18:04',
  },
  {
    id: 'qp0HIF3SfI4',
    title: 'Inside the Mind of a Master Procrastinator',
    speaker: 'Tim Urban · TED',
    category: 'PRODUCTIVITY',
    duration: '14:03',
  },
  {
    id: '8jPQjjsBbIc',
    title: 'Your Body Language May Shape Who You Are',
    speaker: 'Amy Cuddy · TED',
    category: 'BODY LANGUAGE',
    duration: '21:02',
  },
  {
    id: 'b_N_8jFJUv4',
    title: 'What Makes a Good Life?',
    speaker: 'Robert Waldinger · Harvard Study',
    category: 'WELLNESS',
    duration: '12:46',
  },
  {
    id: '7X3TUMzxsu8',
    title: '10 Ways to Have a Better Conversation',
    speaker: 'Celeste Headlee · TED',
    category: 'CONVERSATION',
    duration: '11:44',
  },
];

export const YouTubeView: React.FC<YouTubeViewProps> = ({ onBack, settings }) => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'lessons' | 'explore' | 'recommends'>('explore');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [segmentNotes, setSegmentNotes] = useState<Record<string, string>>({});
  const [editingSegmentNoteId, setEditingSegmentNoteId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [translatedSegments, setTranslatedSegments] = useState<Record<string, Record<string, string>>>({});
  const [translatingLang, setTranslatingLang] = useState(false);
  const [pretranslatingWords, setPretranslatingWords] = useState(false);
  const [pretranslationProgress, setPretranslationProgress] = useState<{ count: number; total: number } | null>(null);
  const [activeWordData, setActiveWordData] = useState<WordDefinition | null>(null);
  const [isWordLoading, setIsWordLoading] = useState(false);
  const [wordModalPosition, setWordModalPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // High-performance word translation memory (in-memory + local storage persisted per language)
  const [wordTranslationCache, setWordTranslationCache] = useState<Record<string, WordDefinition>>(() => {
    try {
      const saved = localStorage.getItem('yt_word_translation_memory');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>(() => {
    return storage.getVocabulary(undefined, selectedLanguage);
  });

  // Keep vocabulary list synced
  useEffect(() => {
    setVocabularyList(storage.getVocabulary(undefined, selectedLanguage));
  }, [selectedLanguage]);

  // Persist translation memory to localStorage
  const saveWordToMemory = useCallback((key: string, def: WordDefinition) => {
    setWordTranslationCache((prev) => {
      const updated = { ...prev, [key]: def };
      try {
        localStorage.setItem('yt_word_translation_memory', JSON.stringify(updated));
      } catch {
        // quota safety
      }
      return updated;
    });
  }, []);

  const handleSaveToVocabulary = useCallback((wordDef: WordDefinition) => {
    try {
      const currentVocab = storage.getVocabulary(undefined, selectedLanguage);
      const exists = currentVocab.some(
        (v) => v.word.toLowerCase() === wordDef.word.toLowerCase() && v.language.toLowerCase() === (selectedLanguage || 'english').toLowerCase()
      );
      if (!exists) {
        const foundTitle = ALL_CURATED_VIDEOS.find((v) => v.id === videoId)?.title || 'YouTube Lesson';
        const newItem: VocabularyItem = {
          id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          word: wordDef.word,
          phonetic: wordDef.phonetic || '',
          translation: wordDef.translation || '',
          definition: wordDef.definition || '',
          partOfSpeech: wordDef.partOfSpeech || 'word',
          grammarNote: wordDef.grammarNote || '',
          contextSentence: wordDef.contextSentence || '',
          sourceDocumentId: videoId || 'youtube',
          sourceDocumentName: foundTitle,
          language: selectedLanguage || 'English',
          dateAdded: Date.now(),
          tags: ['youtube', 'transcript', (selectedLanguage || 'english').toLowerCase()],
          srs: {
            state: 'new',
            learningStepIndex: 0,
            intervalDays: 1,
            easeFactor: 2.5,
            repetitions: 0,
            lapses: 0,
            dueAt: Date.now(),
          },
        };
        const nextList = [newItem, ...currentVocab];
        storage.saveVocabulary(nextList, undefined, selectedLanguage);
        setVocabularyList(nextList);
      }
    } catch (e) {
      console.error('Error saving vocabulary from YouTubeView:', e);
    }
  }, [selectedLanguage, videoId]);

  // Pre-translate entire transcript words in the background so all word clicks are INSTANT
  const pretranslateTranscriptWords = useCallback(
    async (targetLang: string, targetTranscript?: Transcript | null) => {
      const t = targetTranscript !== undefined ? targetTranscript : transcript;
      if (!t || !t.segments || t.segments.length === 0 || targetLang === 'English') return;

      // Extract unique words from all transcript segments
      const uniqueWordsSet = new Set<string>();
      const wordContextMap = new Map<string, string>();

      for (const seg of t.segments) {
        const words = seg.text
          .split(/\s+/)
          .map((w) => w.trim().replace(/^[\s.,!?;:()""''「」『』。、¿¡«»“”‘’—–\-]+|[\s.,!?;:()""''「」『』。、¿¡«»“”‘’—–\-]+$/g, ''))
          .filter((w) => w.length > 1 && !/^\d+$/.test(w));

        for (const w of words) {
          const lower = w.toLowerCase();
          const cacheKey = `${targetLang.toLowerCase()}__${lower}`;
          if (!wordTranslationCache[cacheKey]) {
            uniqueWordsSet.add(w);
            if (!wordContextMap.has(w)) {
              wordContextMap.set(w, seg.text);
            }
          }
        }
      }

      const wordsToTranslate = Array.from(uniqueWordsSet);
      if (wordsToTranslate.length === 0) return;

      setPretranslatingWords(true);
      setPretranslationProgress({ count: 0, total: wordsToTranslate.length });

      // Process words in batches of 25 to optimize speed and avoid rate limits
      const BATCH_SIZE = 25;
      let completed = 0;

      for (let i = 0; i < wordsToTranslate.length; i += BATCH_SIZE) {
        const batch = wordsToTranslate.slice(i, i + BATCH_SIZE);
        try {
          const res = await fetch('/api/pre-translate-words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              words: batch,
              targetLanguage: targetLang,
              sourceLanguage: 'English',
            }),
          });

          if (res.ok) {
            const batchResults = await res.json();
            if (batchResults && typeof batchResults === 'object') {
              setWordTranslationCache((prev) => {
                const nextCache = { ...prev };
                for (const [w, def] of Object.entries(batchResults)) {
                  if (def && typeof def === 'object') {
                    const clean = (def as any).word || w;
                    const cacheKey = `${targetLang.toLowerCase()}__${clean.toLowerCase()}`;
                    const fullDef: WordDefinition = {
                      word: clean,
                      phonetic: (def as any).phonetic || '',
                      translation: (def as any).translation || clean,
                      definition: (def as any).definition || '',
                      partOfSpeech: (def as any).partOfSpeech || 'word',
                      grammarNote: (def as any).grammarNote || '',
                      contextSentence: wordContextMap.get(clean) || (def as any).contextSentence || '',
                      targetLanguage: targetLang,
                      sourceLanguage: 'English',
                      examples: (def as any).examples || [],
                      synonyms: (def as any).synonyms || [],
                    };
                    nextCache[cacheKey] = fullDef;
                  }
                }
                try {
                  localStorage.setItem('yt_word_translation_memory', JSON.stringify(nextCache));
                } catch {
                  // ignore
                }
                return nextCache;
              });
            }
          }
        } catch (err) {
          console.warn('Batch pre-translation error:', err);
        }
        completed += batch.length;
        setPretranslationProgress({ count: Math.min(completed, wordsToTranslate.length), total: wordsToTranslate.length });
      }

      setPretranslatingWords(false);
      setTimeout(() => setPretranslationProgress(null), 2500);
    },
    [transcript, wordTranslationCache]
  );

  const handleTranscriptWordClick = useCallback(
    async (
      rawWord: string,
      contextSentence: string,
      e: React.MouseEvent<HTMLSpanElement>,
      sourceLang: string = 'English'
    ) => {
      e.stopPropagation();
      const cleanWord = rawWord.trim().replace(/^[\s.,!?;:()""''「」『』。、¿¡«»“”‘’—–\-]+|[\s.,!?;:()""''「」『』。、¿¡«»“”‘’—–\-]+$/g, '');
      if (!cleanWord || cleanWord.length === 0) return;

      const targetLang = selectedLanguage || 'English';
      const cacheKey = `${targetLang.toLowerCase()}__${cleanWord.toLowerCase()}`;

      const rect = e.currentTarget.getBoundingClientRect();
      setWordModalPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });

      // 1. Instant Memory Cache Lookup (Zero latency)
      if (wordTranslationCache[cacheKey]) {
        const cachedItem = {
          ...wordTranslationCache[cacheKey],
          contextSentence: contextSentence || wordTranslationCache[cacheKey].contextSentence,
        };
        setActiveWordData(cachedItem);
        setIsWordLoading(false);
        return;
      }

      // 2. Immediate Optimistic Response with Fast Fallback Lexicon / Quick Translation
      setIsWordLoading(true);
      setActiveWordData({
        word: cleanWord,
        translation: 'Translating...',
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
        contextSentence,
      });

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: cleanWord,
            contextSentence,
            targetLanguage: targetLang,
            sourceLanguage: sourceLang,
          }),
        });

        if (!res.ok) throw new Error('Translation failed');
        const data: WordDefinition = await res.json();
        if (data) {
          const fullData: WordDefinition = {
            ...data,
            word: data.word || cleanWord,
            targetLanguage: targetLang,
            sourceLanguage: sourceLang,
            contextSentence: contextSentence || data.contextSentence,
          };
          setActiveWordData(fullData);
          saveWordToMemory(cacheKey, fullData);
        }
      } catch (err) {
        console.error('Word translation error:', err);
        setActiveWordData({
          word: cleanWord,
          translation: `Translation unavailable`,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang,
          contextSentence,
        });
      } finally {
        setIsWordLoading(false);
      }
    },
    [selectedLanguage, wordTranslationCache, saveWordToMemory]
  );
  const [recentLessons, setRecentLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('youtube-recent-lessons');
      return saved ? JSON.parse(saved) : ['eIho2S0ZahI', 'arj7oStGLkU', 'dQw4w9WgXcQ'];
    } catch {
      return ['eIho2S0ZahI', 'arj7oStGLkU', 'dQw4w9WgXcQ'];
    }
  });

  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const syncFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch translated segments for transcript and automatically warm up word translation memory
  const fetchLanguageTranslations = useCallback(
    async (langId: string, customTranscript?: Transcript | null, customVidId?: string | null) => {
      const targetTrans = customTranscript !== undefined ? customTranscript : transcript;
      const targetVid = customVidId !== undefined ? customVidId : videoId;
      if (!targetTrans || !targetVid || !targetTrans.segments || targetTrans.segments.length === 0 || langId === 'English') {
        return;
      }

      // Also trigger word memory pre-translation in background
      pretranslateTranscriptWords(langId, targetTrans);

      if (translatedSegments[langId] && Object.keys(translatedSegments[langId]).length > 0) {
        return;
      }

      const cacheKey = `yt_trans_${targetVid}_${langId}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setTranslatedSegments((prev) => ({ ...prev, [langId]: parsed }));
            return;
          }
        }
      } catch {
        // ignore
      }

      setTranslatingLang(true);
      try {
        const segmentsPayload = targetTrans.segments.map((s) => ({ id: s.id, text: s.text }));
        const res = await fetch('/api/youtube-transcript-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segments: segmentsPayload,
            targetLanguage: langId,
          }),
        });

        if (!res.ok) throw new Error('Translation failed');
        const data = await res.json();
        if (data.translations) {
          setTranslatedSegments((prev) => ({ ...prev, [langId]: data.translations }));
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data.translations));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to translate transcript segments:', err);
      } finally {
        setTranslatingLang(false);
      }
    },
    [transcript, videoId, translatedSegments, pretranslateTranscriptWords]
  );

  const handleSelectLanguage = (langId: string) => {
    setSelectedLanguage(langId);
    setIsLangDropdownOpen(false);
    if (langId !== 'English') {
      fetchLanguageTranslations(langId);
    }
  };

  // Automatically start background pre-translation whenever transcript is loaded or selectedLanguage changes
  useEffect(() => {
    if (transcript && transcript.segments && transcript.segments.length > 0 && selectedLanguage && selectedLanguage !== 'English') {
      fetchLanguageTranslations(selectedLanguage, transcript, videoId);
    }
  }, [transcript, selectedLanguage, videoId, fetchLanguageTranslations]);

  // Load and save notes
  useEffect(() => {
    if (videoId) {
      const savedNotes = localStorage.getItem(`youtube-notes-${videoId}`);
      setNotes(savedNotes || '');

      const savedSegmentNotes = localStorage.getItem(`youtube-segment-notes-${videoId}`);
      if (savedSegmentNotes) {
        try {
          setSegmentNotes(JSON.parse(savedSegmentNotes));
        } catch {
          setSegmentNotes({});
        }
      } else {
        setSegmentNotes({});
      }
      setEditingSegmentNoteId(null);
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      localStorage.setItem(`youtube-notes-${videoId}`, notes);
    }
  }, [notes, videoId]);

  useEffect(() => {
    if (videoId) {
      localStorage.setItem(`youtube-segment-notes-${videoId}`, JSON.stringify(segmentNotes));
    }
  }, [segmentNotes, videoId]);

  const saveRecentLesson = (id: string) => {
    setRecentLessons((prev) => {
      const next = [id, ...prev.filter((item) => item !== id)].slice(0, 12);
      try {
        localStorage.setItem('youtube-recent-lessons', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const clearRecentLessons = () => {
    setRecentLessons([]);
    try {
      localStorage.removeItem('youtube-recent-lessons');
    } catch {
      // ignore
    }
  };

  const stopClock = useCallback(() => {
    if (syncFrameRef.current !== null) {
      cancelAnimationFrame(syncFrameRef.current);
      syncFrameRef.current = null;
    }
  }, []);

  const syncFromPlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const time = Number(player.getCurrentTime?.());
    if (!Number.isFinite(time)) return;

    lastTimeRef.current = time;
    setCurrentTime((previous) => (Math.abs(previous - time) < 0.01 ? previous : time));

    if (transcript) {
      const nextIndex = findActiveSegmentIndex(transcript.segments, time);
      setActiveIndex((previous) => (previous === nextIndex ? previous : nextIndex));
    }
  }, [transcript]);

  const startClock = useCallback(() => {
    stopClock();
    const tick = () => {
      syncFromPlayer();
      const state = playerRef.current?.getPlayerState?.();
      if (state === 1) syncFrameRef.current = requestAnimationFrame(tick);
      else syncFrameRef.current = null;
    };
    syncFrameRef.current = requestAnimationFrame(tick);
  }, [stopClock, syncFromPlayer]);

  useEffect(() => {
    return () => stopClock();
  }, [stopClock]);

  // If the player started before the transcript completed, restart the clock here.
  useEffect(() => {
    if (!transcript || !playerRef.current) return;
    syncFromPlayer();
    if (playerRef.current.getPlayerState?.() === 1) startClock();
  }, [transcript, startClock, syncFromPlayer]);

  // Auto-scroll to active line in transcript
  useEffect(() => {
    if (activeIndex !== -1) {
      const el = document.getElementById(`transcript-line-${activeIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  // Extract video ID from URL
  const extractVideoId = (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleLoadVideo = async (overrideId?: string) => {
    const id = overrideId || extractVideoId(url);
    if (!id) {
      setError('Please provide a valid YouTube URL or 11-character video ID.');
      return;
    }

    setUrl(`https://www.youtube.com/watch?v=${id}`);
    stopClock();
    setVideoId(id);
    setLoading(true);
    setError('');
    setActiveTab('lessons');
    setTranscript(null);
    setCurrentTime(0);
    setActiveIndex(-1);
    saveRecentLesson(id);

    // 1. Direct curated match
    if (CURATED_TRANSCRIPTS[id]) {
      try {
        const norm = normalizeTranscript(CURATED_TRANSCRIPTS[id], id);
        setTranscript(norm);
        setLoading(false);
        return;
      } catch (e: any) {
        console.error('Curated transcript normalize failed:', e);
      }
    }

    // 2. Fetch from backend API
    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No transcript available for this video.');
      }

      setTranscript(normalizeTranscript(data, id));
      setActiveIndex(-1);
    } catch (err: any) {
      setError(err.message || 'Unable to extract transcript for this video.');
    } finally {
      setLoading(false);
    }
  };

  const seekTo = (seconds: number) => {
    const player = playerRef.current;
    const target = Number(seconds);
    if (!player || !Number.isFinite(target)) return;

    player.seekTo(target, true);
    player.playVideo();
    setCurrentTime(target);
    setActiveIndex(transcript ? findActiveSegmentIndex(transcript.segments, target) : -1);
    requestAnimationFrame(syncFromPlayer);
  };

  const handlePlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    syncFromPlayer();
    if (event.target.getPlayerState?.() === 1) startClock();
  };

  const handlePlayerStateChange = (event: YouTubeEvent) => {
    syncFromPlayer();
    if (event.data === 1) startClock(); // playing
    else stopClock(); // paused, buffering, ended, or unstarted
  };

  function formatTimestamp(seconds: number): string {
    const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    const minutes = Math.floor(safe / 60);
    const wholeSeconds = Math.floor(safe % 60);
    return `${minutes}:${String(wholeSeconds).padStart(2, '0')}`;
  }

  const getVideoMeta = (id: string): VideoMeta => {
    const found = ALL_CURATED_VIDEOS.find((v) => v.id === id);
    if (found) return found;
    return {
      id,
      title: `YouTube Lesson (${id})`,
      category: 'VIDEO',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#EFF1EE] dark:bg-[#1E1E1E] flex flex-col font-sans"
    >
      {/* Top Bar for Back Navigation - Only displayed in the video player watching page */}
      {videoId && (
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              setVideoId(null);
              setTranscript(null);
            }}
            className="text-[#666666] hover:text-[#222222] dark:text-[#D0D2CF] dark:hover:text-[#EFF1EE] transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> Back to Videos
          </button>
          <button
            onClick={() => {
              setVideoId(null);
              setTranscript(null);
            }}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-white dark:bg-white/10 text-[#222222] dark:text-[#EFF1EE] border border-[#D0D2CF] dark:border-white/10 hover:bg-[#A4F5A6] hover:text-[#222222] transition-colors cursor-pointer shadow-xs"
          >
            Browse Library
          </button>
        </div>
      )}

      <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 lg:px-6 pb-28 flex flex-col">
        {!videoId && activeTab === 'explore' && (
          <div className="flex-1 w-full max-w-5xl mx-auto pt-8">
            <span className="inline-block text-[11px] font-extrabold tracking-widest text-[#222222] dark:text-[#A4F5A6] uppercase mb-2 px-2.5 py-0.5 bg-[#A4F5A6]/40 dark:bg-[#A4F5A6]/10 rounded-md">
              VIDEO LESSONS
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#222222] dark:text-[#EFF1EE] mb-3">Explore</h1>
            <p className="text-[#666666] dark:text-[#D0D2CF] text-[16px] mb-8 leading-relaxed">
              Paste a YouTube link to study its transcript with real-time word syncing, or pick from our curated library below.
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-3 mb-10">
              <div className="relative flex-1">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666] stroke-[2]" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
                  placeholder="Paste a YouTube link (e.g. https://www.youtube.com/watch?v=eIho2S0ZahI)..."
                  className="w-full bg-[#EFF1EE] sm:bg-white dark:bg-[#1E1E1E] sm:dark:bg-[#2A2A2A] border border-[#D0D2CF] dark:border-white/10 focus:border-[#222222] dark:focus:border-[#A4F5A6] focus:ring-2 focus:ring-[#A4F5A6] rounded-2xl ps-12 pe-4 py-3.5 text-[15px] font-medium text-[#222222] dark:text-[#EFF1EE] placeholder:text-[#666666] transition-all outline-none shadow-xs"
                />
              </div>
              <button
                onClick={() => handleLoadVideo()}
                disabled={!url || loading}
                className="bg-[#A4F5A6] hover:bg-[#8EE890] text-[#222222] px-8 py-3.5 rounded-2xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-sm shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Open Lesson'}
              </button>
            </div>

            {error && (
              <p className="text-rose-600 dark:text-rose-400 text-sm mb-6 font-semibold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 px-4 py-3 rounded-2xl">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALL_CURATED_VIDEOS.slice(0, 6).map((pick) => (
                <div
                  key={pick.id}
                  onClick={() => handleLoadVideo(pick.id)}
                  className="bg-[#EFF1EE] sm:bg-white dark:bg-[#1E1E1E] sm:dark:bg-[#2A2A2A] rounded-2xl overflow-hidden border border-[#D0D2CF] dark:border-white/10 hover:border-[#222222]/40 hover:shadow-md transition-all cursor-pointer flex flex-col group"
                >
                  <div className="w-full aspect-[16/9] overflow-hidden bg-black/5 dark:bg-stone-800 relative">
                    <img
                      src={`https://img.youtube.com/vi/${pick.id}/hqdefault.jpg`}
                      alt={pick.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {pick.duration && (
                      <span className="absolute bottom-2 right-2 bg-[#222222]/90 text-[#EFF1EE] text-[11px] font-mono px-2 py-0.5 rounded-md font-bold">
                        {pick.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between z-10">
                    <div>
                      <h3 className="font-serif font-bold text-[18px] text-[#222222] dark:text-[#EFF1EE] mb-1 leading-snug group-hover:text-[#222222] transition-colors">
                        {pick.title}
                      </h3>
                      {pick.speaker && (
                        <p className="text-xs font-medium text-[#666666] dark:text-[#D0D2CF] mb-3">{pick.speaker}</p>
                      )}
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#A4F5A6]/30 dark:bg-[#A4F5A6]/20 text-[#222222] dark:text-[#A4F5A6] font-extrabold text-[10px] tracking-wider uppercase">
                        {pick.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!videoId && activeTab === 'recommends' && (
          <div className="flex-1 w-full max-w-5xl mx-auto pt-8">
            <span className="inline-block text-[11px] font-extrabold tracking-widest text-[#222222] dark:text-[#A4F5A6] uppercase mb-2 px-2.5 py-0.5 bg-[#A4F5A6]/40 dark:bg-[#A4F5A6]/10 rounded-md">
              CURATED SELECTIONS
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#222222] dark:text-[#EFF1EE] mb-3">Recommends</h1>
            <p className="text-[#666666] dark:text-[#D0D2CF] text-[16px] mb-8 leading-relaxed">
              Hand-picked videos with full synchronized transcripts and vocabulary aids.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALL_CURATED_VIDEOS.map((pick) => (
                <div
                  key={pick.id}
                  onClick={() => handleLoadVideo(pick.id)}
                  className="bg-[#EFF1EE] sm:bg-white dark:bg-[#1E1E1E] sm:dark:bg-[#2A2A2A] rounded-2xl overflow-hidden border border-[#D0D2CF] dark:border-white/10 hover:border-[#222222]/40 hover:shadow-md transition-all cursor-pointer flex flex-col group"
                >
                  <div className="w-full aspect-[16/9] overflow-hidden bg-black/5 dark:bg-stone-800 relative">
                    <img
                      src={`https://img.youtube.com/vi/${pick.id}/hqdefault.jpg`}
                      alt={pick.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {pick.duration && (
                      <span className="absolute bottom-2 right-2 bg-[#222222]/90 text-[#EFF1EE] text-[11px] font-mono px-2 py-0.5 rounded-md font-bold">
                        {pick.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between z-10">
                    <div>
                      <h3 className="font-serif font-bold text-[18px] text-[#222222] dark:text-[#EFF1EE] mb-1 leading-snug group-hover:text-[#222222] transition-colors">
                        {pick.title}
                      </h3>
                      {pick.speaker && (
                        <p className="text-xs font-medium text-[#666666] dark:text-[#D0D2CF] mb-3">{pick.speaker}</p>
                      )}
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#A4F5A6]/30 dark:bg-[#A4F5A6]/20 text-[#222222] dark:text-[#A4F5A6] font-extrabold text-[10px] tracking-wider uppercase">
                        {pick.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!videoId && activeTab === 'lessons' && (
          <div className="flex-1 w-full max-w-5xl mx-auto pt-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="inline-block text-[11px] font-extrabold tracking-widest text-[#222222] dark:text-[#A4F5A6] uppercase mb-2 px-2.5 py-0.5 bg-[#A4F5A6]/40 dark:bg-[#A4F5A6]/10 rounded-md">
                  SAVED SESSIONS
                </span>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#222222] dark:text-[#EFF1EE] mb-3">Your Lessons</h1>
                <p className="text-[#666666] dark:text-[#D0D2CF] text-[16px] leading-relaxed">
                  The videos you've studied recently. Pick one to jump straight back in.
                </p>
              </div>
              {recentLessons.length > 0 && (
                <button
                  onClick={clearRecentLessons}
                  className="flex items-center gap-2 text-[#222222] dark:text-[#EFF1EE] font-bold text-xs bg-white dark:bg-white/10 border border-[#D0D2CF] dark:border-white/10 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>

            {recentLessons.length === 0 ? (
              <div className="bg-[#EFF1EE] sm:bg-white dark:bg-[#1E1E1E] sm:dark:bg-[#2A2A2A] rounded-2xl border border-[#D0D2CF] dark:border-white/10 p-12 text-center shadow-xs">
                <BookOpen className="w-12 h-12 text-[#666666] dark:text-[#D0D2CF] mx-auto mb-4" />
                <h3 className="font-serif font-bold text-xl text-[#222222] dark:text-[#EFF1EE] mb-2">No recent lessons</h3>
                <p className="text-[#666666] dark:text-[#D0D2CF] text-sm max-w-md mx-auto mb-6">
                  Explore our curated talks or paste a YouTube video link to start learning.
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-[#A4F5A6] hover:bg-[#8EE890] text-[#222222] font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                >
                  Explore Videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentLessons.map((id) => {
                  const meta = getVideoMeta(id);
                  return (
                    <div
                      key={id}
                      onClick={() => handleLoadVideo(id)}
                      className="bg-[#EFF1EE] sm:bg-white dark:bg-[#1E1E1E] sm:dark:bg-[#2A2A2A] rounded-2xl overflow-hidden border border-[#D0D2CF] dark:border-white/10 hover:border-[#222222]/40 hover:shadow-md transition-all cursor-pointer flex flex-col group"
                    >
                      <div className="w-full aspect-[16/9] overflow-hidden bg-black/5 dark:bg-stone-800 relative">
                        <img
                          src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                          alt={meta.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {meta.duration && (
                          <span className="absolute bottom-2 right-2 bg-[#222222]/90 text-[#EFF1EE] text-[11px] font-mono px-2 py-0.5 rounded-md font-bold">
                            {meta.duration}
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between z-10">
                        <div>
                          <h3 className="font-serif font-bold text-[18px] text-[#222222] dark:text-[#EFF1EE] mb-1 leading-snug group-hover:text-[#222222] transition-colors">
                            {meta.title}
                          </h3>
                          {meta.speaker && (
                            <p className="text-xs font-medium text-[#666666] dark:text-[#D0D2CF] mb-3">{meta.speaker}</p>
                          )}
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#A4F5A6]/30 dark:bg-[#A4F5A6]/20 text-[#222222] dark:text-[#A4F5A6] font-extrabold text-[10px] tracking-wider uppercase">
                            {meta.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {videoId && (
          <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
            {/* Left Column: Transcript */}
            <div className="w-full xl:w-[340px] 2xl:w-[380px] bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-xs border border-[#D0D2CF] dark:border-white/10 flex flex-col overflow-hidden shrink-0 h-[600px] xl:h-[calc(100vh-140px)]">
              {/* Transcript Header */}
              <div className="p-4 flex flex-col gap-2 border-b border-[#D0D2CF] dark:border-white/10 relative z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2.5">
                    <h3 className="font-serif font-bold text-xl text-[#222222] dark:text-[#EFF1EE]">Transcript</h3>
                    <span className="text-[11px] font-extrabold text-[#666666] tracking-widest uppercase">
                      {transcript?.segments.length ? `${transcript.segments.length} LINES` : 'LOADING...'}
                    </span>
                  </div>

                  {/* Multi-Language Selector Dropdown */}
                  <div className="relative" ref={langDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A4F5A6] hover:bg-[#8EE890] text-[#222222] text-xs font-bold transition-all shadow-xs cursor-pointer select-none"
                      aria-expanded={isLangDropdownOpen}
                      title="Change transcript language"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm leading-none">{TRANSCRIPT_LANGUAGES.find((l) => l.id === selectedLanguage)?.flag}</span>
                      <span>{TRANSCRIPT_LANGUAGES.find((l) => l.id === selectedLanguage)?.name || selectedLanguage}</span>
                      {(translatingLang || pretranslatingWords) && <Loader2 className="w-3 h-3 animate-spin ml-0.5" />}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isLangDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#2A2A2A] rounded-2xl border border-[#D0D2CF] dark:border-white/10 shadow-xl p-1.5 z-50 space-y-0.5"
                        >
                          <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-[#666666] dark:text-[#A0A0A0] tracking-wider uppercase border-b border-[#D0D2CF]/50 dark:border-white/10 mb-1">
                            Select Language
                          </div>
                          {TRANSCRIPT_LANGUAGES.map((lang) => {
                            const isSelected = selectedLanguage === lang.id;
                            return (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => handleSelectLanguage(lang.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                                  isSelected
                                    ? 'bg-[#A4F5A6]/30 dark:bg-[#A4F5A6]/20 text-[#222222] dark:text-[#EFF1EE] font-bold'
                                    : 'hover:bg-[#EFF1EE] dark:hover:bg-white/5 text-[#222222]/80 dark:text-[#D0D2CF]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-base leading-none">{lang.flag}</span>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-xs text-[#222222] dark:text-[#EFF1EE]">
                                      {lang.name}
                                    </span>
                                    <span className="text-[10px] text-[#666666] dark:text-[#A0A0A0]">
                                      {lang.native}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-[#222222] dark:text-[#A4F5A6]" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Pre-translation memory active caching badge / progress */}
                {selectedLanguage !== 'English' && (
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#A4F5A6]/15 dark:bg-[#A4F5A6]/10 border border-[#A4F5A6]/30 text-[11px] text-[#222222] dark:text-[#EFF1EE]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3 h-3 text-[#222222] dark:text-[#A4F5A6]" />
                      <span>Instant Translation Memory:</span>
                      <span className="font-bold text-[#222222] dark:text-[#A4F5A6]">
                        {TRANSCRIPT_LANGUAGES.find((l) => l.id === selectedLanguage)?.name}
                      </span>
                    </div>
                    {pretranslatingWords && pretranslationProgress ? (
                      <span className="text-[10px] font-mono text-[#666666] dark:text-[#D0D2CF] flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Caching {pretranslationProgress.count}/{pretranslationProgress.total}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Transcript List */}
              <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto p-2 scroll-smooth">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#666666] gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-[#222222] dark:text-[#A4F5A6]" />
                    <p className="text-xs font-semibold">Extracting timestamped transcript...</p>
                  </div>
                ) : transcript?.segments && transcript.segments.length > 0 ? (
                  <div className="space-y-1 pb-[50vh]">
                    {transcript.segments.map((segment, index) => {
                      const isActive = index === activeIndex;
                      const isEditingNote = editingSegmentNoteId === segment.id;
                      const hasNote = !!segmentNotes[segment.id];

                      return (
                        <div
                          key={segment.id}
                          id={`transcript-line-${index}`}
                          onClick={() => seekTo(segment.startTime)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex gap-3 items-start focus:outline-none focus:ring-2 focus:ring-[#A4F5A6] youtube-transcript-line ${
                            isActive
                              ? 'bg-[#A4F5A6]/25 dark:bg-[#A4F5A6]/15 ring-1 ring-[#A4F5A6] shadow-xs'
                              : 'hover:bg-[#EFF1EE] dark:hover:bg-white/5 group'
                          }`}
                        >
                          <span
                            className={`text-[11px] font-mono font-bold pt-1 shrink-0 w-8 text-right ${
                              isActive ? 'text-[#222222] dark:text-[#A4F5A6]' : 'text-[#666666]'
                            }`}
                          >
                            {formatTimestamp(segment.startTime)}
                          </span>
                          <div className="flex-1 flex flex-col min-w-0">
                            <p
                              className={`text-[14px] transition-colors leading-relaxed select-text ${
                                isActive
                                  ? 'text-[#222222] dark:text-[#EFF1EE] font-bold'
                                  : 'text-[#222222]/80 dark:text-[#D0D2CF] font-medium group-hover:text-[#222222] dark:group-hover:text-[#EFF1EE]'
                              }`}
                            >
                              {segment.words && segment.words.length > 0 ? (
                                segment.words.map((w, wIdx) => {
                                  const activeWordIdx = findActiveWordIndex(segment.words, currentTime);
                                  const isWordActive = wIdx === activeWordIdx;
                                  return (
                                    <React.Fragment key={w.id || `word-${wIdx}`}>
                                      <span
                                        onClick={(e) => handleTranscriptWordClick(w.text, segment.text, e, 'English')}
                                        title={`Translate "${w.text}" to ${TRANSCRIPT_LANGUAGES.find((l) => l.id === selectedLanguage)?.name || selectedLanguage}`}
                                        className={`cursor-pointer inline-block rounded px-0.5 transition-all duration-150 ${
                                          isWordActive
                                            ? 'bg-[#A4F5A6] text-[#222222] font-bold shadow-xs'
                                            : 'hover:bg-[#A4F5A6]/40 dark:hover:bg-[#A4F5A6]/30 hover:text-[#222222] dark:hover:text-white'
                                        }`}
                                      >
                                        {w.text}
                                      </span>
                                      {wIdx < segment.words!.length - 1 ? ' ' : ''}
                                    </React.Fragment>
                                  );
                                })
                              ) : (
                                segment.text.split(/(\s+)/).map((part, pIdx) => {
                                  const isSpace = /^\s+$/.test(part);
                                  if (isSpace) {
                                    return <React.Fragment key={pIdx}>{part}</React.Fragment>;
                                  }
                                  return (
                                    <span
                                      key={pIdx}
                                      onClick={(e) => handleTranscriptWordClick(part, segment.text, e, 'English')}
                                      title={`Translate "${part}" to ${TRANSCRIPT_LANGUAGES.find((l) => l.id === selectedLanguage)?.name || selectedLanguage}`}
                                      className="cursor-pointer inline-block rounded px-0.5 transition-all duration-150 hover:bg-[#A4F5A6]/40 dark:hover:bg-[#A4F5A6]/30 hover:text-[#222222] dark:hover:text-white"
                                    >
                                      {part}
                                    </span>
                                  );
                                })
                              )}
                            </p>

                            {/* Translated subtitle line */}
                            {selectedLanguage !== 'English' && (
                              <div
                                dir={TRANSCRIPT_LANGUAGES.find((l) => l.id === selectedLanguage)?.dir || 'ltr'}
                                className={`mt-1 text-[13px] leading-snug transition-colors select-text ${
                                  selectedLanguage === 'Arabic' ? 'font-arabic' : ''
                                } ${
                                  isActive
                                    ? 'text-[#222222] dark:text-[#EFF1EE] font-semibold'
                                    : 'text-[#666666] dark:text-[#A0A0A0]'
                                }`}
                              >
                                {translatedSegments[selectedLanguage]?.[segment.id] ? (
                                  translatedSegments[selectedLanguage][segment.id].split(/(\s+)/).map((part, pIdx) => {
                                    const isSpace = /^\s+$/.test(part);
                                    if (isSpace) {
                                      return <React.Fragment key={pIdx}>{part}</React.Fragment>;
                                    }
                                    return (
                                      <span
                                        key={pIdx}
                                        onClick={(e) =>
                                          handleTranscriptWordClick(
                                            part,
                                            translatedSegments[selectedLanguage][segment.id],
                                            e,
                                            selectedLanguage
                                          )
                                        }
                                        title={`Lookup "${part}"`}
                                        className="cursor-pointer inline-block rounded px-0.5 transition-all duration-150 hover:bg-[#A4F5A6]/40 dark:hover:bg-[#A4F5A6]/30 hover:text-[#222222] dark:hover:text-white"
                                      >
                                        {part}
                                      </span>
                                    );
                                  })
                                ) : (
                                  translatingLang ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#A0A0A0] italic">
                                      <Loader2 className="w-3 h-3 animate-spin" /> Translating to {TRANSCRIPT_LANGUAGES.find((l) => l.id === selectedLanguage)?.name}...
                                    </span>
                                  ) : null
                                )}
                              </div>
                            )}

                            {/* Segment Note Display / Editor */}
                            {isEditingNote ? (
                              <div className="mt-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                  autoFocus
                                  defaultValue={segmentNotes[segment.id] || ''}
                                  placeholder="Add a note for this segment..."
                                  className="w-full bg-white dark:bg-[#1E1E1E] border border-[#D0D2CF] dark:border-white/10 rounded-xl p-3 text-xs text-[#222222] dark:text-[#EFF1EE] focus:outline-none focus:ring-2 focus:ring-[#A4F5A6] resize-none"
                                  rows={2}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setEditingSegmentNoteId(null);
                                    }
                                  }}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="px-3 py-1.5 text-xs font-bold text-[#666666] hover:bg-[#EFF1EE] dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSegmentNoteId(null);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-3 py-1.5 text-xs font-bold bg-[#A4F5A6] text-[#222222] hover:bg-[#8EE890] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const textarea = e.currentTarget.parentElement
                                        ?.previousElementSibling as HTMLTextAreaElement;
                                      const val = textarea?.value.trim() || '';
                                      setSegmentNotes((prev) => {
                                        const next = { ...prev };
                                        if (val) {
                                          next[segment.id] = val;
                                        } else {
                                          delete next[segment.id];
                                        }
                                        return next;
                                      });
                                      setEditingSegmentNoteId(null);
                                    }}
                                  >
                                    <Check className="w-3.5 h-3.5" /> Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 flex flex-col items-start w-full">
                                {hasNote && (
                                  <div className="mt-1.5 bg-[#A4F5A6]/20 border border-[#A4F5A6]/40 rounded-lg px-3 py-2 text-xs text-[#222222] dark:text-[#EFF1EE] w-full relative group/note">
                                    {segmentNotes[segment.id]}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSegmentNoteId(segment.id);
                                      }}
                                      className="absolute top-1.5 right-1.5 opacity-0 group-hover/note:opacity-100 p-1 hover:bg-[#A4F5A6]/30 rounded transition-all text-[#666666] hover:text-[#222222] dark:text-[#D0D2CF] dark:hover:text-[#EFF1EE] cursor-pointer"
                                      title="Edit Note"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                                {!hasNote && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSegmentNoteId(segment.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 mt-1 flex items-center gap-1.5 text-xs font-bold text-[#666666] hover:text-[#222222] dark:hover:text-[#A4F5A6] transition-all cursor-pointer"
                                  >
                                    <MessageSquare className="w-3 h-3" /> Add Note
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#666666] gap-2 p-6 text-center">
                    <p className="text-xs font-semibold text-rose-500">{error}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#666666] gap-2 p-6 text-center">
                    <p className="text-xs font-semibold">No transcript available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column: Video */}
            <div className="flex-1 flex flex-col gap-5 min-w-0">
              {/* Video Player */}
              <div className="w-full bg-[#222222] rounded-2xl overflow-hidden shadow-md aspect-video relative border border-[#D0D2CF] dark:border-white/10">
                <YouTube
                  videoId={videoId}
                  onReady={handlePlayerReady}
                  onStateChange={handlePlayerStateChange}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      enablejsapi: 1,
                      origin: window.location.origin,
                      rel: 0,
                    },
                  }}
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>

            {/* Right Column: Notes */}
            <AnimatePresence initial={false}>
              {showNotes && (
                <motion.div
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: 'auto', opacity: 1, marginLeft: 24 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="w-full xl:w-[420px] 2xl:w-[480px] bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-xs border border-[#D0D2CF] dark:border-white/10 flex flex-col shrink-0 p-5 h-[400px] xl:h-[calc(100vh-140px)]">
                    <div className="flex items-center justify-between gap-2 text-[#222222] dark:text-[#EFF1EE] mb-3">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5" />
                        <h3 className="font-serif font-bold text-xl">Notes</h3>
                      </div>
                      <button
                        onClick={() => setShowNotes(false)}
                        className="p-1 hover:bg-[#EFF1EE] dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-[#666666] hover:text-[#222222] dark:text-[#D0D2CF] dark:hover:text-[#EFF1EE]"
                      >
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write down new words, phrases or ideas while you watch..."
                        className="w-full flex-1 bg-[#EFF1EE]/50 dark:bg-[#1E1E1E] border border-[#D0D2CF] dark:border-white/10 rounded-xl p-3.5 text-[#222222] dark:text-[#EFF1EE] text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#A4F5A6] resize-none transition-shadow"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Notes Toggle */}
      <AnimatePresence>
        {!showNotes && videoId && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowNotes(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#222222] text-[#EFF1EE] border-y border-l border-[#D0D2CF] shadow-lg rounded-l-2xl px-2 py-4 flex flex-col items-center gap-3 z-50 hover:bg-[#A4F5A6] hover:text-[#222222] transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span className="[writing-mode:vertical-rl] text-xs font-bold tracking-widest uppercase">
              Notes
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E1E1E] border border-[#D0D2CF] dark:border-white/10 shadow-lg rounded-full px-1.5 py-1.5 flex items-center gap-1 z-50">
        <button
          onClick={() => {
            setActiveTab('lessons');
            setVideoId(null);
            setUrl('');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-bold text-xs cursor-pointer ${
            activeTab === 'lessons'
              ? 'bg-[#A4F5A6] text-[#222222] shadow-xs'
              : 'hover:bg-[#EFF1EE] dark:hover:bg-white/10 text-[#666666] dark:text-[#D0D2CF] hover:text-[#222222] dark:hover:text-[#EFF1EE]'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2]" />
          Your Lessons
        </button>
        <button
          onClick={() => {
            setActiveTab('explore');
            setVideoId(null);
            setUrl('');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-bold text-xs cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-[#A4F5A6] text-[#222222] shadow-xs'
              : 'hover:bg-[#EFF1EE] dark:hover:bg-white/10 text-[#666666] dark:text-[#D0D2CF] hover:text-[#222222] dark:hover:text-[#EFF1EE]'
          }`}
        >
          <Search className="w-4 h-4 stroke-[2]" />
          Explore
        </button>
        <button
          onClick={() => {
            setActiveTab('recommends');
            setVideoId(null);
            setUrl('');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-bold text-xs cursor-pointer ${
            activeTab === 'recommends'
              ? 'bg-[#A4F5A6] text-[#222222] shadow-xs'
              : 'hover:bg-[#EFF1EE] dark:hover:bg-white/10 text-[#666666] dark:text-[#D0D2CF] hover:text-[#222222] dark:hover:text-[#EFF1EE]'
          }`}
        >
          <Sparkles className="w-4 h-4 stroke-[2]" />
          Recommends
        </button>
      </div>

      {/* Interactive Word Translation Popover / Modal */}
      <WordModal
        wordData={activeWordData}
        isLoading={isWordLoading}
        onClose={() => {
          setActiveWordData(null);
          setWordModalPosition(null);
        }}
        onSaveToVocabulary={handleSaveToVocabulary}
        isSaved={
          !!activeWordData &&
          vocabularyList.some(
            (v) =>
              v.word.toLowerCase() === activeWordData.word.toLowerCase() &&
              v.language.toLowerCase() === (selectedLanguage || 'english').toLowerCase()
          )
        }
        position={wordModalPosition}
        interfaceLanguage={settings?.interfaceLanguage || 'English'}
      />
    </motion.div>
  );
};
