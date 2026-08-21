const fs = require('fs');
let content = fs.readFileSync('src/server/lexiconService.ts', 'utf8');
content = content.replace("import {", "import type {");
fs.writeFileSync('src/server/lexiconService.ts', content);
console.log('Fixed lexiconService.ts type imports');
