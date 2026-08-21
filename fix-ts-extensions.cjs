const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Match `from './...'` or `from '../...'` without extension (.ts or .js)
  // e.g., import { X } from './foo'; -> import { X } from './foo.ts';
  const updated = content.replace(/from ['"](\.[^'"]+)(?<!\.ts)(?<!\.js)(?<!\.json)['"]/g, "from '$1.ts'");
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Added .ts to imports in:', filePath);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (file.endsWith('.ts')) {
      processFile(full);
    }
  }
}

walk('./src/server');
walk('./src/data');
walk('./src/db');
walk('./src/middleware');
if (fs.existsSync('server.ts')) {
  processFile('server.ts');
}
console.log('Finished adding .ts extensions');
