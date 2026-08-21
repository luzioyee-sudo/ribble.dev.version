const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = `import { HomeView } from './components/HomeView';
import { MyLearningView } from './components/MyLearningView';`;

content = content.replace(`import { HomeView } from './components/HomeView';`, importStatement);

const renderTarget = `          {/* VIEW 1: HOME/DASHBOARD */}
          {activeView === 'home' && (`;

const renderReplacement = `          {/* VIEW 0.5: MY LEARNING */}
          {activeView === 'mylearning' && (
            <motion.div
              key="mylearning-view-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <MyLearningView
                 settings={settings}
                 userStats={userStats}
              />
            </motion.div>
          )}

          {/* VIEW 1: HOME/DASHBOARD */}
          {activeView === 'home' && (`;

content = content.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated with MyLearningView');
