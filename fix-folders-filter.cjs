const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFolders = `    const loadedFolders = storage.getFolders(activeUserId, targetLang);
    setFolders(loadedFolders.length > 0 ? loadedFolders : INITIAL_FOLDERS);`;

const repFolders = `    const loadedFolders = storage.getFolders(activeUserId, targetLang).filter(f => !f.language || f.language.toLowerCase().trim() === cleanLang || f.language.toLowerCase().trim() === 'target');
    setFolders(loadedFolders.length > 0 ? loadedFolders : INITIAL_FOLDERS.filter(f => !f.language || f.language.toLowerCase().trim() === cleanLang));`;

content = content.replace(targetFolders, repFolders);

const targetDecks = `setDecks(loadedDecks.length > 0 ? loadedDecks : INITIAL_DECKS);`;
const repDecks = `setDecks(loadedDecks.length > 0 ? loadedDecks : INITIAL_DECKS.filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang));`;

content = content.replace(targetDecks, repDecks);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed initial fallback filters');
