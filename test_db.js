import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

console.log('Testing Firestore connection for project:', config.projectId);
console.log('Database ID:', config.firestoreDatabaseId);

try {
  const app = initializeApp({
    projectId: config.projectId,
  });

  const db = getFirestore(config.firestoreDatabaseId);
  
  console.log('Attempting to fetch a document...');
  const collections = await db.listCollections();
  console.log('Successfully connected! Collections found:', collections.length);
  collections.forEach(col => console.log(' -', col.id));
} catch (error) {
  console.error('Firestore connection FAILED:');
  console.error(error);
  process.exit(1);
}
