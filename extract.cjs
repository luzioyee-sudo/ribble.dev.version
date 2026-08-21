const fs = require('fs');
const code = fs.readFileSync('fetched.js', 'utf8');
const match = code.match(/sourceMappingURL=data:application\/json;base64,(.+)$/);
if (match) {
  const map = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  console.log(map.sourcesContent[0]);
} else {
  console.log("No source map found");
}
