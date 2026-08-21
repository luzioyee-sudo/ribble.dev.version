const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    const targetLang = currentSettings.targetLanguage;
    setUserStats(storage.getUserStats(activeUserId, targetLang));
    setDocuments(storage.getDocuments(activeUserId, targetLang));
    setHighlights(storage.getHighlights(activeUserId, targetLang));
    setAnnotations(storage.getAnnotations(activeUserId, targetLang));
    setStickyNotes(storage.getStickyNotes(activeUserId, targetLang));

    const loadedFolders = storage.getFolders(activeUserId, targetLang);
    setFolders(loadedFolders.length > 0 ? loadedFolders : INITIAL_FOLDERS);

    const loadedDecks = storage.getDecks(activeUserId, targetLang);
    setDecks(loadedDecks.length > 0 ? loadedDecks : INITIAL_DECKS);

    setVocabulary(storage.getVocabulary(activeUserId, targetLang));`;

const replacement = `    const targetLang = currentSettings.targetLanguage || 'English';
    const cleanLang = targetLang.toLowerCase().trim();
    
    setUserStats(storage.getUserStats(activeUserId, targetLang));
    
    // Auto-cleanup leaks from race conditions
    const loadedDocs = storage.getDocuments(activeUserId, targetLang).filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang || d.language.toLowerCase().trim() === 'target');
    setDocuments(loadedDocs);
    
    setHighlights(storage.getHighlights(activeUserId, targetLang));
    setAnnotations(storage.getAnnotations(activeUserId, targetLang));
    setStickyNotes(storage.getStickyNotes(activeUserId, targetLang));

    const loadedFolders = storage.getFolders(activeUserId, targetLang);
    setFolders(loadedFolders.length > 0 ? loadedFolders : INITIAL_FOLDERS);

    const loadedDecks = storage.getDecks(activeUserId, targetLang).filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang || d.language.toLowerCase().trim() === 'target');
    setDecks(loadedDecks.length > 0 ? loadedDecks : INITIAL_DECKS);

    const loadedVocab = storage.getVocabulary(activeUserId, targetLang).filter(v => !v.language || v.language.toLowerCase().trim() === cleanLang || v.language.toLowerCase().trim() === 'target');
    setVocabulary(loadedVocab);`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed memory leak reload logic');
