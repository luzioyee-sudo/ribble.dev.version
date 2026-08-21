import { db } from '../lib/firebase';
import { disableNetwork, setLogLevel } from 'firebase/firestore';

let isQuotaExceeded = false;
let isInterceptorSetup = false;

export function isFirestoreQuotaExceeded(): boolean {
  return isQuotaExceeded;
}

export function markFirestoreQuotaExceeded(): void {
  if (!isQuotaExceeded) {
    isQuotaExceeded = true;
    
    // Silence internal firebase logs
    try {
      setLogLevel('silent');
    } catch (e) {
      // ignore
    }

    console.warn('[Firestore Quota Tracker] Free daily write quota is currently exceeded. Skipping subsequent Firestore write requests for this session.');
    
    // Disable Firestore network to prevent the SDK from repeatedly retrying
    // and spamming "resource-exhausted" errors in the console.
    if (db) {
      disableNetwork(db).catch(err => {
        // ignore
      });
    }
  }
}

export function handleFirestoreError(err: any, context = 'Firestore'): void {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('resource-exhausted') || msg.includes('Quota limit exceeded') || err?.code === 'resource-exhausted') {
    markFirestoreQuotaExceeded();
  } else if (!msg.includes('closing') && !msg.includes('hidden') && !msg.includes('offline') && !msg.includes('failed to get document')) {
    console.warn(`[${context}] Notice:`, msg);
  }
}

export function setupFirestoreQuotaInterceptor(): void {
  if (isInterceptorSetup || typeof console === 'undefined') return;
  isInterceptorSetup = true;

  const intercept = (originalFn: any) => {
    return function (...args: any[]) {
      const stringifiedArgs = args.map(a => typeof a === 'string' ? a : (a instanceof Error ? a.message : JSON.stringify(a))).join(' ');
      
      if (
        stringifiedArgs.includes('resource-exhausted') || 
        stringifiedArgs.includes('Quota limit exceeded')
      ) {
        markFirestoreQuotaExceeded();
        return; 
      }
      
      originalFn.apply(console, args);
    };
  };

  console.error = intercept(console.error);
  console.warn = intercept(console.warn);
  console.log = intercept(console.log);
}

