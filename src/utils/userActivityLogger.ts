import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { ActivityRecord, UserAccount } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

import { isFirestoreQuotaExceeded, markFirestoreQuotaExceeded } from './firestoreQuotaTracker';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  
  if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota limit exceeded')) {
    markFirestoreQuotaExceeded();
    return;
  }
  
  if (errMsg.includes('closing') || errMsg.includes('hidden') || errMsg.includes('offline') || errMsg.includes('failed to get document')) {
    console.warn('Firestore background operation notice:', JSON.stringify(errInfo));
    return;
  }
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export const UserActivityLogger = {
  /**
   * Log an activity record directly to Firestore sub-collection and update user overview.
   */
  logEvent: async (log: ActivityRecord, userId: string, userMeta?: Partial<UserAccount>): Promise<boolean> => {
    if (!userId || isFirestoreQuotaExceeded()) return false;
    const currentFirebaseUser = auth.currentUser;
    // Check if user is authenticated and delegate actual security enforcement to firestore.rules
    const canWrite = !!currentFirebaseUser;

    if (canWrite) {
      const logPath = `users/${userId}/activityLogs/${log.id}`;
      try {
        const logDocRef = doc(db, 'users', userId, 'activityLogs', log.id);
        const { id, syncedToCloud, ...logPayload } = log; // Exclude id and local flag from document fields
        await setDoc(logDocRef, logPayload);

        // Update user parent document summary if metadata provided
        if (userMeta) {
          const userDocRef = doc(db, 'users', userId);
          const updatePayload: any = {
            lastLogin: 'Just now',
            lastSynced: new Date().toISOString(),
          };
          if (userMeta.totalTimeSpent) updatePayload.totalTimeSpent = userMeta.totalTimeSpent;
          if (typeof userMeta.wordsLearned === 'number') updatePayload.wordsLearned = userMeta.wordsLearned;
          if (userMeta.name) updatePayload.name = userMeta.name;
          if (userMeta.email) updatePayload.email = userMeta.email;
          if (userMeta.targetLanguage) updatePayload.targetLanguage = userMeta.targetLanguage;
          if (userMeta.role) updatePayload.role = userMeta.role;
          if (userMeta.status) updatePayload.status = userMeta.status;
          if (userMeta.joinedAt) updatePayload.joinedAt = userMeta.joinedAt;

          await setDoc(userDocRef, updatePayload, { merge: true });
        }
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, logPath);
        return false;
      }
    }
    return false;
  },

  /**
   * Fetch activity logs from Firestore for a specific user.
   */
  fetchUserLogs: async (userId: string, maxLogs: number = 200): Promise<ActivityRecord[]> => {
    if (!userId) return [];
    const path = `users/${userId}/activityLogs`;
    try {
      const colRef = collection(db, 'users', userId, 'activityLogs');
      const q = query(colRef, limit(maxLogs));
      const snapshot = await getDocs(q);
      const logs: ActivityRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          timestamp: data.timestamp || '',
          dateLabel: data.dateLabel || '',
          section: data.section || 'Bilingual Reader',
          action: data.action || '',
          duration: data.duration || '0s',
          device: data.device || 'Browser',
          location: data.location || 'Active App Session',
          type: data.type || 'navigation',
        });
      });
      // Sort logs by timestamp descending
      return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },
};

