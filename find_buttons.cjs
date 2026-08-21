const fs = require('fs');
const glob = require('glob'); // Need to install? or just read dir.
const files = fs.readdirSync('src/components');
files.forEach(file => {
  if(file.endsWith('.tsx')) {
    const content = fs.readFileSync('src/components/' + file, 'utf8');
    const buttons = content.match(/<button/g);
    if(buttons && buttons.length >= 6) {
      console.log(file, buttons.length);
    }
  }
});
