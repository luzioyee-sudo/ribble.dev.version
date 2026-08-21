const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `sanitizedAutoSyncData[\`profiles.\${currentLangKey}\`] = {
            documents: sanitizedDocsForSync,
            vocabulary,
            highlights,
            annotations,
            stickyNotes,
            folders,
            decks,
            userStats
          };`;

const replacement = `sanitizedAutoSyncData[\`profiles.\${currentLangKey}\`] = sanitizeForFirestore({
            documents: sanitizedDocsForSync,
            vocabulary,
            highlights,
            annotations,
            stickyNotes,
            folders,
            decks,
            userStats
          });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed');
