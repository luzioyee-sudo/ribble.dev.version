const fs = require('fs');
let content = fs.readFileSync('src/data/masterLexicon.ts', 'utf8');
content = content.replace("import { LexicalEntry } from '../types/lexicon.ts';", "");
content = content.replace("export const INITIAL_MASTER_LEXICON: LexicalEntry[] = [", "export const INITIAL_MASTER_LEXICON: any[] = [");
fs.writeFileSync('src/data/masterLexicon.ts', content);
console.log('Fixed masterLexicon.ts');
