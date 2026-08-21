const fs = require('fs');
let content = fs.readFileSync('src/utils/sampleDocs.ts', 'utf8');

const decksRegex = /export const INITIAL_DECKS: Deck\[\] = \[([\s\S]*?)\];/;
const decksMatch = content.match(decksRegex);
if (decksMatch) {
  let decksCode = decksMatch[0];
  // Add language property if missing
  decksCode = decksCode.replace(/id: 'deck-hello',/g, "id: 'deck-hello',\n    language: 'English',");
  decksCode = decksCode.replace(/id: 'deck-new',/g, "id: 'deck-new',\n    language: 'English',");
  content = content.replace(decksRegex, decksCode);
}

fs.writeFileSync('src/utils/sampleDocs.ts', content);
console.log('Fixed initial decks language tags');
