const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStart = `// Merge Cloud data with Local data so NO items are erased!
            const mergedDocs = mergeArraysById(cloudData.documents || [], localDocs);`;

const targetEnd = `// Sync merged data back to Supabase
            if (isSupabaseConfigured) {
              await syncToSupabase(firebaseUser.uid, sanitizedData as any);
            }`;

const newContent = `// Merge Cloud data with Local data so NO items are erased!
            const mergedSettings = { ...defaultSettings, ...localSettings, ...(cloudData.settings || {}) };
            if (firebaseUser.email) {
              mergedSettings.userEmail = firebaseUser.email;
            }
            if (firebaseUser.displayName && !mergedSettings.userName) {
              mergedSettings.userName = firebaseUser.displayName;
            }
            storage.saveSettings(mergedSettings, firebaseUser.uid);
            
            // Extract profiles logic
            const profiles = cloudData.profiles || {};
            const currentLangKey = (mergedSettings.targetLanguage || 'English').toLowerCase().trim().replace(/\\s+/g, '_');
            
            // Migrate legacy root data into the current active profile if not yet migrated
            if (!cloudData.migrated && cloudData.vocabulary) {
              if (!profiles[currentLangKey]) profiles[currentLangKey] = {};
              profiles[currentLangKey].documents = cloudData.documents || [];
              profiles[currentLangKey].vocabulary = cloudData.vocabulary || [];
              profiles[currentLangKey].highlights = cloudData.highlights || [];
              profiles[currentLangKey].annotations = cloudData.annotations || [];
              profiles[currentLangKey].stickyNotes = cloudData.stickyNotes || [];
              profiles[currentLangKey].folders = cloudData.folders || [];
              profiles[currentLangKey].decks = cloudData.decks || [];
              profiles[currentLangKey].userStats = cloudData.userStats || null;
            }
            
            // Process ALL profiles stored in cloud to ensure local storage has every language
            let activeMergedStats: any = null;
            let activeMergedDocs: any = null;
            let activeMergedVocab: any = null;
            let activeMergedHighlights: any = null;
            let activeMergedAnnotations: any = null;
            let activeMergedNotes: any = null;
            let activeMergedFolders: any = null;
            let activeMergedDecks: any = null;

            if (Object.keys(profiles).length === 0) {
               profiles[currentLangKey] = {};
            }

            Object.keys(profiles).forEach(langKey => {
              const pData = profiles[langKey];
              const lDocs = storage.getDocuments(firebaseUser.uid, langKey);
              const lVocab = storage.getVocabulary(firebaseUser.uid, langKey);
              const lHighlights = storage.getHighlights(firebaseUser.uid, langKey);
              const lAnnotations = storage.getAnnotations(firebaseUser.uid, langKey);
              const lNotes = storage.getStickyNotes(firebaseUser.uid, langKey);
              const lFolders = storage.getFolders(firebaseUser.uid, langKey);
              const lDecks = storage.getDecks(firebaseUser.uid, langKey);
              const lStats = storage.getUserStats(firebaseUser.uid, langKey);
              
              const mergedDocs = mergeArraysById(pData.documents || [], lDocs);
              const mergedVocab = mergeArraysById(pData.vocabulary || [], lVocab);
              const mergedHighlights = mergeArraysById(pData.highlights || [], lHighlights);
              const mergedAnnotations = mergeArraysById(pData.annotations || [], lAnnotations);
              const mergedNotes = mergeArraysById(pData.stickyNotes || [], lNotes);
              const mergedFolders = mergeArraysById(pData.folders || [], lFolders);
              const mergedDecks = mergeArraysById(pData.decks || [], lDecks);
              
              let history = (pData.userStats && pData.userStats.activityHistory) || lStats.activityHistory || {};
              if (Object.keys(history).length >= 50 || (pData.userStats && pData.userStats.currentStreak === 100)) {
                history = {};
              }
              const streak = calculateStreak(history, (pData.userStats && pData.userStats.dailyGoal) || 10);
              const mergedStats = {
                ...defaultUserStats,
                ...lStats,
                ...(pData.userStats || {}),
                currentStreak: streak,
                activityHistory: history
              };
              
              const finalFolders = mergedFolders.length > 0 ? mergedFolders : INITIAL_FOLDERS;
              const finalDecks = mergedDecks.length > 0 ? mergedDecks : INITIAL_DECKS;
              
              storage.saveDocuments(mergedDocs, firebaseUser.uid, langKey);
              storage.saveVocabulary(mergedVocab, firebaseUser.uid, langKey);
              storage.saveHighlights(mergedHighlights, firebaseUser.uid, langKey);
              storage.saveAnnotations(mergedAnnotations, firebaseUser.uid, langKey);
              storage.saveStickyNotes(mergedNotes, firebaseUser.uid, langKey);
              storage.saveFolders(finalFolders, firebaseUser.uid, langKey);
              storage.saveDecks(finalDecks, firebaseUser.uid, langKey);
              storage.saveUserStats(mergedStats, firebaseUser.uid, langKey);
              
              if (langKey === currentLangKey) {
                 activeMergedStats = mergedStats;
                 activeMergedDocs = mergedDocs;
                 activeMergedVocab = mergedVocab;
                 activeMergedHighlights = mergedHighlights;
                 activeMergedAnnotations = mergedAnnotations;
                 activeMergedNotes = mergedNotes;
                 activeMergedFolders = finalFolders;
                 activeMergedDecks = finalDecks;
              }
            });
            
            // For the active UI state, if it wasn't populated from cloud, load from local fallback
            if (!activeMergedDocs) {
               activeMergedDocs = localDocs;
               activeMergedVocab = localVocab;
               activeMergedHighlights = localHighlights;
               activeMergedAnnotations = localAnnotations;
               activeMergedNotes = localStickyNotes;
               activeMergedFolders = localFolders.length > 0 ? localFolders : INITIAL_FOLDERS;
               activeMergedDecks = localDecks.length > 0 ? localDecks : INITIAL_DECKS;
               activeMergedStats = localStats;
               
               storage.saveDocuments(activeMergedDocs, firebaseUser.uid, currentLangKey);
               storage.saveVocabulary(activeMergedVocab, firebaseUser.uid, currentLangKey);
               storage.saveHighlights(activeMergedHighlights, firebaseUser.uid, currentLangKey);
               storage.saveAnnotations(activeMergedAnnotations, firebaseUser.uid, currentLangKey);
               storage.saveStickyNotes(activeMergedNotes, firebaseUser.uid, currentLangKey);
               storage.saveFolders(activeMergedFolders, firebaseUser.uid, currentLangKey);
               storage.saveDecks(activeMergedDecks, firebaseUser.uid, currentLangKey);
               storage.saveUserStats(activeMergedStats, firebaseUser.uid, currentLangKey);
            }

            setSettings(mergedSettings);
            setUserStats(activeMergedStats);
            setDocuments(activeMergedDocs);
            setHighlights(activeMergedHighlights);
            setAnnotations(activeMergedAnnotations);
            setStickyNotes(activeMergedNotes);
            setFolders(activeMergedFolders);
            setDecks(activeMergedDecks);
            setVocabulary(activeMergedVocab);

            const sanitizedData = sanitizeForFirestore({
              id: firebaseUser.uid,
              name: mergedSettings.userName,
              email: mergedSettings.userEmail,
              role: activeAccount?.role || 'Student',
              status: activeAccount?.status || 'Active',
              joinedAt: activeAccount?.joinedAt || new Date().toISOString().split('T')[0],
              wordsLearned: activeMergedVocab.length,
              lastLogin: new Date().toISOString(),
              targetLanguage: mergedSettings.targetLanguage,
              totalTimeSpent: activeAccount?.totalTimeSpent || '0s',
              sessionCount: activeAccount?.sessionCount || 1,
              settings: mergedSettings,
              migrated: true,
              lastSynced: Date.now()
            });
            sanitizedData[\`profiles.\${currentLangKey}\`] = {
              documents: activeMergedDocs,
              vocabulary: activeMergedVocab,
              highlights: activeMergedHighlights,
              annotations: activeMergedAnnotations,
              stickyNotes: activeMergedNotes,
              folders: activeMergedFolders,
              decks: activeMergedDecks,
              userStats: activeMergedStats
            };

            // Update Firestore doc with merged items
            if (!isFirestoreQuotaExceeded()) {
              await updateDoc(docRef, sanitizedData).catch(err => {
                if (err.code === 'not-found') return setDoc(docRef, sanitizedData, { merge: true });
                return handleFirestoreError(err, 'AppMergeSync');
              });
            }

            // Sync merged data back to Supabase
            if (isSupabaseConfigured) {
              await syncToSupabase(firebaseUser.uid, sanitizedData as any);
            }`;

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd) + targetEnd.length;

if (startIndex === -1 || content.indexOf(targetEnd) === -1) {
  console.log('Targets not found');
  process.exit(1);
}

content = content.substring(0, startIndex) + newContent + content.substring(endIndex);
fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated successfully');
