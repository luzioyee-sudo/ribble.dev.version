const fs = require('fs');

let content = fs.readFileSync('src/components/MyLearningView.tsx', 'utf8');
content = content.replace(/vocab: parseInt, docs: parseInt/g, "vocab: number, docs: number");
content = content.replace(/Object.entries\(aggregatedStats.langStats\).map\(\(\[langName, stats\]\) => \(/g, "Object.entries(aggregatedStats.langStats).map(([langName, stats]: [string, any]) => (");

fs.writeFileSync('src/components/MyLearningView.tsx', content);
console.log('Fixed typescript in MyLearningView');
