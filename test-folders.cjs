const fs = require('fs');
let content = fs.readFileSync('src/utils/sampleDocs.ts', 'utf8');
const foldersRegex = /export const INITIAL_FOLDERS: Folder\[\] = \[([\s\S]*?)\];/;
const match = content.match(foldersRegex);
if (match) {
  let code = match[0];
  code = code.replace(/id: 'folder-favorites',/g, "id: 'folder-favorites',\n    language: 'English',");
  code = code.replace(/id: 'folder-spanish',/g, "id: 'folder-spanish',\n    language: 'Spanish',");
  code = code.replace(/id: 'folder-french',/g, "id: 'folder-french',\n    language: 'French',");
  content = content.replace(foldersRegex, code);
  fs.writeFileSync('src/utils/sampleDocs.ts', content);
  console.log('Fixed initial folders');
} else {
  console.log('Folders not found');
}
