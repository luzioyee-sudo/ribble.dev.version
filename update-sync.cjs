const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStart = `// 2. Sync to Firestore & Supabase (if logged in)
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);`;

const targetEnd = `// Background sync to Supabase
          const isSupabaseConfigured = !!getSupabase();
          if (isSupabaseConfigured) {
            await syncToSupabase(currentUser.uid, sanitizedAutoSyncData as any);
          }`;

const newContent = `// 2. Sync to Firestore & Supabase (if logged in)
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const targetName = settings.userName || currentUser.displayName || 'Primary Learner';
          const targetEmail = currentUser.email || settings.userEmail || '';
          const targetLang = settings.targetLanguage || 'English';
          const currentLangKey = targetLang.toLowerCase().trim().replace(/\\s+/g, '_');
          
          const sanitizedAutoSyncData = sanitizeForFirestore({
            id: currentUser.uid,
            name: targetName,
            email: targetEmail,
            role: activeAccount?.role || 'Student',
            status: activeAccount?.status || 'Active',
            joinedAt: activeAccount?.joinedAt || new Date().toISOString().split('T')[0],
            wordsLearned: vocabulary.length,
            lastLogin: new Date().toISOString(),
            targetLanguage: targetLang,
            totalTimeSpent: activeAccount?.totalTimeSpent || '0s',
            sessionCount: activeAccount?.sessionCount || 1,
            settings,
            migrated: true,
            lastSynced: Date.now()
          });
          
          sanitizedAutoSyncData[\`profiles.\${currentLangKey}\`] = {
            documents: sanitizedDocsForSync,
            vocabulary,
            highlights,
            annotations,
            stickyNotes,
            folders,
            decks,
            userStats
          };

          if (!isFirestoreQuotaExceeded()) {
            await updateDoc(docRef, sanitizedAutoSyncData).catch(err => {
               if (err.code === 'not-found') return setDoc(docRef, sanitizedAutoSyncData, { merge: true });
               return handleFirestoreError(err, 'AppAutoSync');
            });
          }

          // Background sync to Supabase
          const isSupabaseConfigured = !!getSupabase();
          if (isSupabaseConfigured) {
            await syncToSupabase(currentUser.uid, sanitizedAutoSyncData as any);
          }`;

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd) + targetEnd.length;

if (startIndex === -1 || content.indexOf(targetEnd) === -1) {
  console.log('Targets not found');
  process.exit(1);
}

content = content.substring(0, startIndex) + newContent + content.substring(endIndex);
fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx sync updated successfully');
