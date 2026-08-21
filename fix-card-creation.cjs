const fs = require('fs');

let content = fs.readFileSync('src/components/CreateFlashcardModal.tsx', 'utf8');

const targetLangRegex = /language: selectedDeck\?.language \|\| 'French',/g;
content = content.replace(targetLangRegex, "language: settings?.targetLanguage || selectedDeck?.language || 'French',");

fs.writeFileSync('src/components/CreateFlashcardModal.tsx', content);
console.log('Fixed card creation language');
