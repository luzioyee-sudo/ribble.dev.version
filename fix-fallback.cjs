const fs = require('fs');

let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

const target = `    const fallbacks = [
      primaryKey
    ];`;

const replacement = `    // If we're loading a specific language, we MUST NOT fallback to root/legacy keys
    // because that merges French data into Spanish if Spanish is empty!
    const fallbacks = [
      primaryKey
    ];`;

content = content.replace(target, replacement);

fs.writeFileSync('src/utils/storage.ts', content);
console.log('Fixed storage isolation fallback logic');
