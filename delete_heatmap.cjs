const fs = require('fs');
let content = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

const regexHeatmap = /\{\/\* Heatmap \/ Intensity Section \*\/\}[\s\S]*?(?=\{\/\* Content Layout splits into Cards on Left and Visual Chart on Right \*\/|\/\/ 5\. Prepare Main Line Chart Data)/;
content = content.replace(regexHeatmap, '');

const regexLogic = /\/\/ 4\. Generate the last N days of activity for Intensity Heatmap[\s\S]*?(?=\/\/ 5\. Prepare Main Line Chart Data)/;
content = content.replace(regexLogic, '');

fs.writeFileSync('src/components/HomeView.tsx', content);
