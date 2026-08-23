import React, { useMemo, useState } from 'react';
import {
  ArrowUp,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Gauge,
  Library,
  ListChecks,
  MessageSquareText,
  Network,
  Plus,
  Search,
  Sparkles,
  Target,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { AppView, DocumentFile, ReaderSettings, UserStats, VocabularyItem } from '../types';

interface AutonomousHomeViewProps {
  userName?: string;
  documents: DocumentFile[];
  vocabulary: VocabularyItem[];
  userStats: UserStats;
  settings?: ReaderSettings;
  onNavigate?: (view: AppView) => void;
  onSelectDocument?: (document: DocumentFile) => void;
  onUploadClick?: () => void;
  onSaveFlashcard?: (card: Partial<VocabularyItem>) => void;
  onTrack?: (description: string) => void;
}

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  meta?: string;
  citations?: Array<{ title: string; detail: string }>;
};

type AgentAction = {
  id: string;
  label: string;
  status: 'done' | 'active';
  detail: string;
};

const promptChips = [
  'What should I study today?',
  'Create flashcards from my latest book',
  'Find my weakest concepts',
  'Build a path to become good at business',
];

const stopWords = new Set(['the', 'and', 'from', 'with', 'about', 'what', 'should', 'today', 'latest', 'book', 'my', 'me', 'a', 'to', 'of', 'in']);

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function getSourceText(document: DocumentFile) {
  return (document.contentData || '').replace(/^#.*$/gm, '').replace(/\s+/g, ' ').trim();
}

function getExtractableTerms(document: DocumentFile, vocabulary: VocabularyItem[]) {
  const text = getSourceText(document);
  const existing = new Set(vocabulary.map((item) => item.word.toLowerCase()));
  const candidates = tokenize(text).filter((token) => !existing.has(token));
  return Array.from(new Set(candidates)).slice(0, 3);
}

export const AutonomousHomeView: React.FC<AutonomousHomeViewProps> = ({
  userName,
  documents,
  vocabulary,
  userStats,
  settings,
  onNavigate,
  onSelectDocument,
  onUploadClick,
  onSaveFlashcard,
  onTrack,
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Good morning. I’m ready to turn your library into a learning plan.',
      meta: 'Learning OS · standing by',
    },
  ]);
  const [actions, setActions] = useState<AgentAction[]>([
    { id: 'memory', label: 'Checked your learning memory', status: 'done', detail: `${vocabulary.length} saved concepts · ${userStats.currentStreak || 0} day streak` },
    { id: 'library', label: 'Mapped your library', status: 'done', detail: `${documents.length} sources available to retrieve` },
  ]);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  const displayName = userName || settings?.userName || 'Learner';
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todayActivity = userStats.activityHistory?.[todayKey] || 0;
  const dailyGoal = userStats.dailyGoal || 10;
  const goalProgress = Math.min(100, Math.round((todayActivity / dailyGoal) * 100));
  const displayActivity = Math.min(todayActivity, dailyGoal);
  const dueCount = vocabulary.filter((item) => item.srs && item.srs.dueAt <= Date.now()).length;
  const masteredCount = vocabulary.filter((item) => item.srs?.state === 'review' && (item.srs.intervalDays || 0) >= 21).length;

  const searchableItems = useMemo(() => {
    return documents.map((document) => ({
      id: document.id,
      title: document.title || document.name,
      type: document.fileType === 'sample' ? 'Book' : document.fileType.toUpperCase(),
      detail: `${document.author || 'Personal source'} · ${document.language || 'Unknown language'}`,
      document,
      text: `${document.title || document.name} ${document.author || ''} ${document.contentData || ''}`.toLowerCase(),
    }));
  }, [documents]);

  const searchResults = useMemo(() => {
    const tokens = tokenize(query);
    if (!tokens.length) return [];
    return searchableItems
      .map((item) => ({ ...item, score: tokens.reduce((score, token) => score + (item.text.includes(token) ? 1 : 0), 0) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [query, searchableItems]);

  const latestSource = documents[0];
  const latestSourceText = latestSource ? getSourceText(latestSource) : '';
  const weakConcept = vocabulary.find((item) => item.srs?.state === 'learning' || item.srs?.state === 'relearning');
  const sourcePreview = showAllSources ? documents.slice(0, 6) : documents.slice(0, 3);

  const addMessage = (role: Message['role'], text: string, meta?: string, citations?: Message['citations']) => {
    setMessages((previous) => [...previous, { id: `${role}-${Date.now()}`, role, text, meta, citations }]);
  };

  const runCommand = (rawQuery: string) => {
    const normalized = rawQuery.trim();
    if (!normalized) return;
    setQuery('');
    addMessage('user', normalized);
    onTrack?.(`Asked the learning agent: ${normalized}`);

    const lower = normalized.toLowerCase();
    const source = latestSource || documents[0];

    if (lower.includes('flashcard') || lower.includes('flash card')) {
      if (!source || !onSaveFlashcard) {
        addMessage('assistant', 'I need a source with extractable text before I can create cards. Add a PDF, note, article, or book and I’ll build them from the actual content.', 'Action paused · missing source');
        return;
      }
      const terms = getExtractableTerms(source, vocabulary);
      if (!terms.length) {
        addMessage('assistant', `I searched ${source.title || source.name}, but every extractable term is already represented in your cards. I left your library unchanged.`, 'Verified · no duplicate cards created');
        return;
      }
      terms.forEach((term) => onSaveFlashcard({
        word: term,
        translation: `Key idea from ${source.title || source.name}`,
        definition: `Review this term in the context of ${source.title || source.name}.`,
        contextSentence: latestSourceText.slice(0, 180),
        sourceDocumentId: source.id,
        sourceDocumentName: source.title || source.name,
        language: source.language || settings?.targetLanguage || 'English',
      }));
      setActions((previous) => [
        ...previous,
        { id: `cards-${Date.now()}`, label: `Created ${terms.length} flashcards`, status: 'done', detail: `From ${source.title || source.name} · duplicates skipped` },
      ]);
      addMessage('assistant', `I created ${terms.length} new flashcards from ${source.title || source.name}. They’re saved to your study queue and ready for retrieval practice.`, 'Completed · verified against your library', [{ title: source.title || source.name, detail: 'Source text · extracted concepts' }]);
      return;
    }

    if (lower.includes('study') || lower.includes('review') || lower.includes('today')) {
      setActions((previous) => [
        ...previous,
        { id: `plan-${Date.now()}`, label: 'Built today’s adaptive session', status: 'done', detail: `${dueCount} due cards · ${weakConcept ? `targeting ${weakConcept.word}` : 'starting with active recall'}` },
      ]);
      addMessage('assistant', dueCount > 0
        ? `Your best next move is a ${Math.min(30, Math.max(10, dueCount * 3))}-minute retrieval session: review ${dueCount} due card${dueCount === 1 ? '' : 's'}, then explain one concept in your own words. I’ll adapt as you answer.`
        : 'You have no overdue cards, so I built a forward-moving session: learn one source concept, explain it without notes, then do a short application check.', 'Plan ready · based on current learning state');
      onNavigate?.('flashcards');
      return;
    }

    if (lower.includes('weak') || lower.includes('struggle') || lower.includes('understand')) {
      const response = weakConcept
        ? `Your clearest review signal is ${weakConcept.word}. It is still in ${weakConcept.srs?.state || 'learning'} state, so I’d use a short explanation followed by teach-back rather than another passive read.`
        : vocabulary.length > 0
          ? 'I don’t have enough mistake history to call a weakness yet. I can start measuring it as you review cards and answer open-ended questions.'
          : 'I don’t have enough learning history to detect a weakness yet. Add a source or start a study session and I’ll track understanding separately from exposure.';
      addMessage('assistant', response, 'Analysis · evidence threshold applied');
      setActions((previous) => [...previous, { id: `weakness-${Date.now()}`, label: 'Analyzed mastery signals', status: 'done', detail: weakConcept ? `Flagged ${weakConcept.word} for targeted review` : 'Need more retrieval evidence' }]);
      return;
    }

    if (lower.includes('teach') || lower.includes('explain')) {
      if (!source) {
        addMessage('assistant', 'I can teach from your library as soon as you add a source. Import a PDF, paste a note, or add a URL and I’ll explain it step by step.', 'Teaching paused · no source available');
        return;
      }
      const excerpt = latestSourceText ? latestSourceText.slice(0, 240) : 'This source is ready to explore in the reader.';
      addMessage('assistant', `Here’s the first layer from ${source.title || source.name}: ${excerpt}${latestSourceText.length > 240 ? '…' : ''} I’d follow this with one analogy and a teach-back question so we measure understanding, not just exposure.`, 'Teaching · source-grounded explanation', [{ title: source.title || source.name, detail: 'Opening excerpt · source text' }]);
      setActions((previous) => [...previous, { id: `teach-${Date.now()}`, label: `Started a lesson from ${source.title || source.name}`, status: 'done', detail: 'Source excerpt retrieved · teach-back queued' }]);
      return;
    }

    if (lower.includes('business') || lower.includes('path') || lower.includes('course')) {
      setActions((previous) => [...previous, { id: `path-${Date.now()}`, label: 'Drafted a competency path', status: 'done', detail: `${documents.length} sources checked · prerequisite order preserved` }]);
      addMessage('assistant', `I can build that path from your existing library first. The initial sequence is: foundations → customer understanding → positioning → acquisition → unit economics. Your next gap is the source coverage between what you already own and the skill you want.`, 'Curriculum sketch · library-first');
      return;
    }

    if (searchResults.length > 0) {
      addMessage('assistant', `I found ${searchResults.length} relevant source${searchResults.length === 1 ? '' : 's'} in your library. I ranked them by meaning overlap, not just title match.`, 'Library search · semantic-style ranking', searchResults.map((item) => ({ title: item.title, detail: item.detail })));
      setActions((previous) => [...previous, { id: `search-${Date.now()}`, label: 'Searched your personal library', status: 'done', detail: `${searchResults.length} sources matched · citations attached` }]);
      return;
    }

    addMessage('assistant', 'I can search your library, teach from a source, create cards, plan a review, or build a curriculum. Try asking for a concrete outcome and I’ll take the next safe action.', 'Ready · awaiting a learning objective');
  };

  return (
    <div className="min-h-full pb-16 text-[#20231f]">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#b6eeb8] bg-[#e8fbe9] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#315f38]"><Sparkles className="h-3.5 w-3.5" /> Autonomous learning OS</div>
          <h1 className="max-w-3xl font-['EB_Garamond','Georgia',serif] text-4xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl">Good morning, {displayName.split(' ')[0]}.<br /><span className="text-[#6f746e]">What will you understand today?</span></h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#70756e]">Your library is not a shelf. It is a living system of sources, concepts, practice, and memory. Ask for an outcome and I’ll turn it into the next best action.</p>
        </div>
        <button onClick={onUploadClick} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#20231f] px-5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]"><Upload className="h-4 w-4 text-[#a4f5a6]" /> Add a source</button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.55fr)]">
        <section className={`rounded-[30px] border bg-white p-4 shadow-[0_18px_50px_-36px_rgba(32,35,31,0.5)] transition-colors sm:p-6 ${isComposerFocused ? 'border-[#80d985] ring-4 ring-[#a4f5a6]/30' : 'border-[#d7dbd5]'}`}>
          <div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#737a71]"><BrainCircuit className="h-4 w-4 text-[#4c9b54]" /> Ask the agent</div><span className="hidden text-[10px] font-bold text-[#9a9e98] sm:inline-flex">⌘ K · natural language</span></div>
          <form onSubmit={(event) => { event.preventDefault(); runCommand(query); }} className="relative">
            <textarea value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setIsComposerFocused(true)} onBlur={() => setIsComposerFocused(false)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); runCommand(query); } }} placeholder="What do you want to learn, understand, review, or accomplish?" rows={4} className="w-full resize-none rounded-[22px] border border-[#e1e5df] bg-[#fafcf9] px-4 pb-16 pt-4 text-base leading-7 text-[#20231f] outline-none placeholder:text-[#a1a79f] sm:px-5 sm:text-lg" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between"><span className="hidden items-center gap-1.5 text-[10px] font-semibold text-[#989e96] sm:inline-flex"><Zap className="h-3.5 w-3.5" /> Reads memory · retrieves sources · verifies actions</span><button type="submit" aria-label="Send to agent" className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#a4f5a6] text-[#20231f] transition-transform hover:scale-105 active:scale-95"><ArrowUp className="h-5 w-5" /></button></div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">{promptChips.map((chip) => <button key={chip} onClick={() => runCommand(chip)} className="rounded-full border border-[#dce3da] bg-white px-3 py-2 text-left text-[11px] font-semibold text-[#596157] transition-colors hover:border-[#a4f5a6] hover:bg-[#f0fff0]">{chip}</button>)}</div>

          {messages.length > 1 && <div className="mt-6 space-y-3">
            {messages.slice(-4).map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[92%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-[#20231f] text-white' : 'bg-[#f1f6ef] text-[#3f473d]'}`}><p className="text-xs leading-5">{message.text}</p>{message.meta && <p className={`mt-2 text-[10px] font-bold ${message.role === 'user' ? 'text-[#b7c4b5]' : 'text-[#799279]'}`}>{message.meta}</p>}{message.citations && <div className="mt-3 space-y-1.5 border-t border-[#dbe7d9] pt-2">{message.citations.map((citation) => <div key={`${message.id}-${citation.title}`} className="flex items-center gap-2 text-[10px] font-semibold text-[#667764]"><BookOpen className="h-3 w-3 shrink-0" /><span className="truncate">{citation.title}</span><span className="shrink-0 text-[#9aa898]">· {citation.detail}</span></div>)}</div>}</div></div>)}
          </div>}

          <div className="mt-8 border-t border-[#edf0eb] pt-5">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#737a71]"><ListChecks className="h-4 w-4" /> Agent activity</div><span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#5f9865]"><span className="h-1.5 w-1.5 rounded-full bg-[#55b760]" /> Live state</span></div>
            <div className="space-y-3">{actions.slice(-4).map((action) => <div key={action.id} className="flex items-start gap-3"><div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${action.status === 'done' ? 'bg-[#e4f9e5] text-[#438b4b]' : 'bg-[#f1eee6] text-[#a88949]'}`}>{action.status === 'done' ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}</div><div className="min-w-0"><p className="text-xs font-bold text-[#333830]">{action.label}</p><p className="mt-0.5 text-[11px] leading-5 text-[#8a9188]">{action.detail}</p></div></div>)}</div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[28px] bg-[#20231f] p-5 text-[#f4f6f0] shadow-[0_18px_50px_-36px_rgba(32,35,31,0.8)]"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#b5c2b3]"><Gauge className="h-4 w-4 text-[#a4f5a6]" /> Today’s signal</div><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-[#cdd5ca]">{goalProgress}%</span></div><div className="mb-4 flex items-end gap-2"><span className="font-['EB_Garamond','Georgia',serif] text-5xl leading-none">{displayActivity}{todayActivity > dailyGoal ? '+' : ''}</span><span className="pb-1 text-xs text-[#aeb8aa]">of {dailyGoal} actions</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#a4f5a6] transition-all" style={{ width: `${goalProgress}%` }} /></div><p className="mt-4 text-xs leading-5 text-[#b7c0b5]">{dueCount > 0 ? `${dueCount} review${dueCount === 1 ? '' : 's'} waiting. Retrieval beats rereading.` : 'No overdue reviews. Keep the momentum with one active recall session.'}</p><button onClick={() => runCommand('What should I study today?')} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#a4f5a6]">Build my session <ChevronRight className="h-3.5 w-3.5" /></button></div>
          <div className="rounded-[28px] border border-[#d7dbd5] bg-[#f7f8f3] p-5"><div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#737a71]"><Network className="h-4 w-4 text-[#9b83f4]" /> Knowledge state</div><div className="grid grid-cols-2 gap-3"><div><p className="text-2xl font-black tracking-tight text-[#292d28]">{vocabulary.length}</p><p className="text-[10px] font-semibold text-[#858b82]">concepts saved</p></div><div><p className="text-2xl font-black tracking-tight text-[#292d28]">{masteredCount}</p><p className="text-[10px] font-semibold text-[#858b82]">mastered</p></div></div><div className="mt-5 border-t border-[#e2e6df] pt-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a06f5d]">Next signal</p><p className="mt-1 text-xs leading-5 text-[#62695f]">{weakConcept ? `Target ${weakConcept.word} with teach-back.` : vocabulary.length ? 'Collect more retrieval evidence to reveal a weakness.' : 'Start with a source and create your first learning trace.'}</p></div></div>
        </aside>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
        <section className="rounded-[28px] border border-[#d7dbd5] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#737a71]"><Library className="h-4 w-4 text-[#4c9b54]" /> Your learning world</div><p className="mt-1 text-xs text-[#91978f]">Sources the agent can read, connect, and cite.</p></div><button onClick={() => onNavigate?.('reader')} className="inline-flex items-center gap-1 text-xs font-bold text-[#4b744f]">Open library <ChevronRight className="h-3.5 w-3.5" /></button></div><div className="grid gap-3 sm:grid-cols-3">{sourcePreview.map((document) => <button key={document.id} onClick={() => onSelectDocument?.(document)} className="group rounded-2xl border border-[#e3e7e0] bg-[#fbfcfa] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#a4f5a6] hover:shadow-sm"><div className="mb-5 flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf9ed] text-[#4d9c55]"><BookOpen className="h-4 w-4" /></div><span className="text-[9px] font-black uppercase tracking-[0.13em] text-[#a0a69e]">{document.fileType === 'sample' ? 'book' : document.fileType}</span></div><p className="line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-5 text-[#343a33] group-hover:text-[#4c8a52]">{document.title || document.name}</p><p className="mt-2 truncate text-[10px] text-[#989e96]">{document.author || 'Personal source'}</p></button>)}{documents.length === 0 && <button onClick={onUploadClick} className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd8cc] bg-[#fbfcfa] text-center text-xs font-bold text-[#7d887a]"><Plus className="mb-2 h-5 w-5" />Add your first source</button>}</div>{documents.length > 3 && <button onClick={() => setShowAllSources((value) => !value)} className="mt-4 text-[11px] font-bold text-[#5b8060]">{showAllSources ? 'Show less' : `View ${documents.length - 3} more sources`}</button>}</section>
        <section className="rounded-[28px] border border-[#d7dbd5] bg-[#f1eee6] p-5 sm:p-6"><div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#737a71]"><Target className="h-4 w-4 text-[#b38a4b]" /> Suggested next move</div><div className="rounded-2xl bg-white/75 p-4"><p className="text-lg font-semibold leading-6 text-[#343832]">{weakConcept ? `Untangle “${weakConcept.word}”` : latestSource ? `Learn the core idea in “${latestSource.title || latestSource.name}”` : 'Give the agent something to work with'}</p><p className="mt-2 text-xs leading-5 text-[#777d74]">{weakConcept ? 'A short explanation, one analogy, then a teach-back question.' : latestSource ? 'I’ll extract the concepts, connect them to your memory, and turn the important ones into retrieval practice.' : 'Import a PDF, paste a note, or add a URL to begin building your knowledge system.'}</p><button onClick={() => weakConcept ? runCommand(`I don't understand ${weakConcept.word}`) : latestSource ? runCommand(`Teach me the core idea in ${latestSource.title || latestSource.name}`) : onUploadClick?.()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#20231f] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]">Take the next step <ArrowUp className="h-3.5 w-3.5 rotate-45 text-[#a4f5a6]" /></button></div><div className="mt-5 flex items-center gap-3 text-[10px] font-semibold text-[#858a82]"><MessageSquareText className="h-4 w-4 text-[#9a83e9]" /> Active learning is measured by what you can retrieve, not what you opened.</div></section>
      </div>

      {query && searchResults.length > 0 && <div className="mt-6 rounded-[28px] border border-[#d7dbd5] bg-white p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#737a71]"><Search className="h-4 w-4" /> Matching sources</div><button onClick={() => setQuery('')} className="text-[#9da49a] hover:text-[#424a40"><X className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2">{searchResults.map((result) => <button key={result.id} onClick={() => onSelectDocument?.(result.document)} className="flex items-center gap-3 rounded-2xl border border-[#e5e9e3] p-3 text-left hover:border-[#a4f5a6]"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#6e62c6]"><FileText className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-xs font-bold text-[#343a33]">{result.title}</p><p className="mt-1 truncate text-[10px] text-[#939b91]">{result.detail}</p></div></button>)}</div></div>}
    </div>
  );
};
