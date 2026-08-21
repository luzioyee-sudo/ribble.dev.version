const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const docFilterTarget = `.filter(d => !d.language || d.language.toLowerCase().trim() === cleanLang || d.language.toLowerCase().trim() === 'target');`;
// We want to force assign the language if it's missing, but we can't do that safely here.
// But wait, what if we just use exact matching, and let !d.language drop?
// If we drop !d.language, the user loses their old un-tagged flashcards!
// So we keep !d.language but we need to assign it to a language when they login.
