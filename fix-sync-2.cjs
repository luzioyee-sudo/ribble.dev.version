const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `sanitizedData[\`profiles.\${currentLangKey}\`] = {
              documents: activeMergedDocs,
              vocabulary: activeMergedVocab,
              highlights: activeMergedHighlights,
              annotations: activeMergedAnnotations,
              stickyNotes: activeMergedNotes,
              folders: activeMergedFolders,
              decks: activeMergedDecks,
              userStats: activeMergedStats
            };`;

const replacement = `sanitizedData[\`profiles.\${currentLangKey}\`] = sanitizeForFirestore({
              documents: activeMergedDocs,
              vocabulary: activeMergedVocab,
              highlights: activeMergedHighlights,
              annotations: activeMergedAnnotations,
              stickyNotes: activeMergedNotes,
              folders: activeMergedFolders,
              decks: activeMergedDecks,
              userStats: activeMergedStats
            });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed');
