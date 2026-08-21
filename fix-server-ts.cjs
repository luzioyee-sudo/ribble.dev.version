const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace('./src/server/pronunciationService', './src/server/pronunciationService.ts');
content = content.replace('./src/server/lexiconService', './src/server/lexiconService.ts');

fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts imports to .ts');
