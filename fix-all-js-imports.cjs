const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace import ... from '... .js' with '... .ts'
      const updated = content.replace(/from ['"](\.[^'"]+)\.js['"]/g, "from '$1.ts'");
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log('Fixed imports in:', fullPath);
      }
    }
  }
}

walkDir('./src');
walkDir('./server.ts'); // if it's a file
if (fs.existsSync('server.ts')) {
  let content = fs.readFileSync('server.ts', 'utf8');
  const updated = content.replace(/from ['"](\.[^'"]+)\.js['"]/g, "from '$1.ts'");
  if (updated !== content) {
    fs.writeFileSync('server.ts', updated, 'utf8');
    console.log('Fixed imports in: server.ts');
  }
}
console.log('All .js import extensions fixed to .ts');
