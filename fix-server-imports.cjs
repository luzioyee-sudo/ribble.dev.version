const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace('./src/server/pronunciationService.js', './src/server/pronunciationService');
content = content.replace('./src/server/lexiconService.js', './src/server/lexiconService');

fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts imports');
