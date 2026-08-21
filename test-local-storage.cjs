// To fix the issue permanently without losing data:
// When the app loads the state for a target language, any item missing a language
// property should be *assigned* to that language and saved immediately.
// If it's already assigned to a DIFFERENT language, it gets dropped from this view.
// Let's modify the filter logic in App.tsx to do this assignment!
const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFilters = `    const loadedDocs = storage.getDocuments(activeUserId, targetLang).filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang || d.language.toLowerCase().trim() === 'target');
    setDocuments(loadedDocs);
    
    setHighlights(storage.getHighlights(activeUserId, targetLang));
    setAnnotations(storage.getAnnotations(activeUserId, targetLang));
    setStickyNotes(storage.getStickyNotes(activeUserId, targetLang));

    const loadedFolders = storage.getFolders(activeUserId, targetLang).filter(f => !f.language || f.language.toLowerCase().trim() === cleanLang || f.language.toLowerCase().trim() === 'target');
    setFolders(loadedFolders.length > 0 ? loadedFolders : INITIAL_FOLDERS.filter(f => !f.language || f.language.toLowerCase().trim() === cleanLang));

    const loadedDecks = storage.getDecks(activeUserId, targetLang).filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang || d.language.toLowerCase().trim() === 'target');
    setDecks(loadedDecks.length > 0 ? loadedDecks : INITIAL_DECKS.filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang));

    const loadedVocab = storage.getVocabulary(activeUserId, targetLang).filter(v => !v.language || v.language.toLowerCase().trim() === cleanLang || v.language.toLowerCase().trim() === 'target');
    setVocabulary(loadedVocab);`;

const repFilters = `    // Process Documents
    const rawDocs = storage.getDocuments(activeUserId, targetLang);
    const validDocs = rawDocs.filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang || d.language.toLowerCase().trim() === 'target').map(d => ({...d, language: d.language || targetLang}));
    setDocuments(validDocs);
    
    setHighlights(storage.getHighlights(activeUserId, targetLang));
    setAnnotations(storage.getAnnotations(activeUserId, targetLang));
    setStickyNotes(storage.getStickyNotes(activeUserId, targetLang));

    // Process Folders
    const rawFolders = storage.getFolders(activeUserId, targetLang);
    const validFolders = rawFolders.filter(f => !f.language || f.language.toLowerCase().trim() === cleanLang || f.language.toLowerCase().trim() === 'target').map(f => ({...f, language: f.language || targetLang}));
    setFolders(validFolders.length > 0 ? validFolders : INITIAL_FOLDERS.map(f => ({...f, language: f.language || targetLang})));

    // Process Decks
    const rawDecks = storage.getDecks(activeUserId, targetLang);
    const validDecks = rawDecks.filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang || d.language.toLowerCase().trim() === 'target').map(d => ({...d, language: d.language || targetLang}));
    setDecks(validDecks.length > 0 ? validDecks : INITIAL_DECKS.map(d => ({...d, language: d.language || targetLang})));

    // Process Vocabulary
    const rawVocab = storage.getVocabulary(activeUserId, targetLang);
    const validVocab = rawVocab.filter(v => !v.language || v.language.toLowerCase().trim() === cleanLang || v.language.toLowerCase().trim() === 'target').map(v => ({...v, language: v.language || targetLang}));
    setVocabulary(validVocab);`;

content = content.replace(targetFilters, repFilters);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed undefined language assignment leaks');
