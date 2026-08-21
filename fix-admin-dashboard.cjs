const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(/const vocabList = storage\.getVocabulary\(u\.id\);/g, "const vocabList = storage.getVocabulary(u.id, u.targetLanguage);");
content = content.replace(/const vocabList = storage\.getVocabulary\(uid\);/g, "const vocabList = storage.getVocabulary(uid, 'English'); // Fallback if no user object");
content = content.replace(/const vocabList = storage\.getVocabulary\(userIdToDeleteFrom\);/g, "const vocabList = storage.getVocabulary(userIdToDeleteFrom, 'English');");

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('Fixed admin dashboard');
