import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeForFirestore } from './sanitize';
import { isFirestoreQuotaExceeded, handleFirestoreError } from './firestoreQuotaTracker';

export interface QueuedSyncItem {
  id: string;
  type: 'PROGRESS_SYNC' | 'DOC_SAVE' | 'VOCAB_ADD' | 'DECK_SAVE' | 'ANNOTATION_SAVE';
  payload: any;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = 'lingoflow_offline_queue_v1';
type SyncStatusCallback = (status: { isOnline: boolean; pendingCount: number; isSyncing: boolean; lastSyncedAt?: number }) => void;

class OfflineSyncQueueManager {
  private queue: QueuedSyncItem[] = [];
  private listeners: Set<SyncStatusCallback> = new Set();
  private isSyncing = false;
  private lastSyncedAt?: number;

  constructor() {
    this.loadQueueFromStorage();
    this.setupListeners();
  }

  private loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load offline sync queue from storage:', err);
      this.queue = [];
    }
  }

  private saveQueueToStorage() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.warn('Failed to save offline sync queue to storage:', err);
    }
    this.notifyListeners();
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[OfflineSync] Connection restored! Processing queued items...');
      this.notifyListeners();
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineSync] Network offline. Queueing future updates locally.');
      this.notifyListeners();
    });

    if ('navigator' in window && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PROCESS_OFFLINE_QUEUE') {
          this.processOfflineQueue();
        }
      });
    }
  }

  public getIsOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public addToQueue(type: QueuedSyncItem['type'], payload: any) {
    const item: QueuedSyncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: Date.now(),
    };

    // If a full progress sync is queued, merge or replace older full sync items to prevent redundant requests
    if (type === 'PROGRESS_SYNC') {
      this.queue = this.queue.filter(q => q.type !== 'PROGRESS_SYNC');
    }

    this.queue.push(item);
    this.saveQueueToStorage();

    // If online, attempt immediate sync
    if (this.getIsOnline() && !this.isSyncing) {
      this.processOfflineQueue();
    }
  }

  public async processOfflineQueue(userId?: string, onBatchSuccess?: () => void) {
    if (this.queue.length === 0 || this.isSyncing || !this.getIsOnline()) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    const uid = userId || auth.currentUser?.uid || 'usr-1';
    console.log(`[OfflineSync] Processing ${this.queue.length} items for user: ${uid}`);

    try {
      const currentQueue = [...this.queue];

      for (const item of currentQueue) {
        try {
          if (item.type === 'PROGRESS_SYNC' || item.type === 'DOC_SAVE') {
            const sanitized = sanitizeForFirestore(item.payload);

            // 1. Sync to server API
            await fetch('/api/progress/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sanitized),
            }).catch(() => {});

            // 2. Sync to Firestore if authenticated user
            if (auth.currentUser && !isFirestoreQuotaExceeded()) {
              const userDocRef = doc(db, 'users', auth.currentUser.uid);
              await setDoc(userDocRef, sanitized, { merge: true }).catch((err: any) => {
                handleFirestoreError(err, 'OfflineSync');
              });
            }
          }

          // Remove item from queue upon successful processing
          this.queue = this.queue.filter(q => q.id !== item.id);
          this.saveQueueToStorage();
        } catch (itemErr) {
          console.warn('[OfflineSync] Failed to process single sync item:', item.id, itemErr);
          // Break loop on network failure, retain remaining items in queue
          break;
        }
      }

      this.lastSyncedAt = Date.now();
      if (onBatchSuccess) onBatchSuccess();
    } catch (err) {
      console.error('[OfflineSync] Queue processing error:', err);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueueToStorage();
  }

  public subscribe(callback: SyncStatusCallback): () => void {
    this.listeners.add(callback);
    // Send immediate initial state
    callback({
      isOnline: this.getIsOnline(),
      pendingCount: this.getPendingCount(),
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
    });

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const state = {
      isOnline: this.getIsOnline(),
      pendingCount: this.getPendingCount(),
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
    };
    this.listeners.forEach((callback) => callback(state));
  }
}

export const offlineSyncManager = new OfflineSyncQueueManager();
