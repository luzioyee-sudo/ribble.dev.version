const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(/export interface Folder {/g, "export interface Folder {\n  language?: string;");
fs.writeFileSync('src/types.ts', content);
console.log('Fixed Folder type');
