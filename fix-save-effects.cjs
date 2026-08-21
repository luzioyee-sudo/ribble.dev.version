const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /useEffect\(\(\) => \{\n\s*if \(activeUserId !== loadedUserIdRef\.current \|\| settings\.targetLanguage !== loadedTargetLangRef\.current\) return;\n\s*storage\.save([A-Za-z]+)\(([A-Za-z]+), activeUserId, settings\.targetLanguage\);\n\s*\}, \[[A-Za-z]+, activeUserId, settings\.targetLanguage\]\);/g;

content = content.replace(regex, (match, p1, p2) => {
  return `useEffect(() => {
    if (activeUserId !== loadedUserIdRef.current || settings.targetLanguage !== loadedTargetLangRef.current) return;
    storage.save${p1}(${p2}, activeUserId, settings.targetLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [${p2}]);`;
});

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed save effects');
