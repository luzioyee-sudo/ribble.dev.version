const fs = require('fs');

let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

const target = `{/* 1. Home / Dashboard */}`;
const replacement = `{/* My Learning */}
          <button
            onClick={() => setActiveView('mylearning')}
            className={\`flex items-center gap-2.5 p-2.5 rounded-2xl transition-all cursor-pointer text-start \${
              isCollapsed ? 'justify-center' : 'px-3.5'
            } \${
              activeView === 'mylearning'
                ? 'text-[#222222] bg-[#A4F5A6] font-bold shadow-xs'
                : 'text-[#222222]/80 hover:text-[#222222] hover:bg-[#D0D2CF]/40'
            }\`}
            title={t.navMyLearning || 'My Learning'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            {!isCollapsed && <span className="text-xs truncate">{t.navMyLearning || 'My Learning'}</span>}
          </button>

          {/* 1. Home / Dashboard */}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Header.tsx', content);
console.log('Added My Learning to nav');
