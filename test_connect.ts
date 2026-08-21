import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer, memoryLocalCache, memoryLruGarbageCollector } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
});

const db = initializeFirestore(app, {
  localCache: memoryLocalCache({ garbageCollector: memoryLruGarbageCollector() }),
  experimentalForceLongPolling: true,
}, config.firestoreDatabaseId);

console.log('Testing connection to:', config.projectId);
console.log('Database:', config.firestoreDatabaseId);

async function run() {
  try {
    console.log('Attempting to fetch document...');
    const snap = await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('SUCCESS! Reached Firestore backend.');
  } catch (error) {
    console.error('FAILED to reach Firestore backend:');
    console.error(error);
    process.exit(1);
  }
}

run();
