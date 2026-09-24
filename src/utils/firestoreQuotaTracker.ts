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

  const safeExtractString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (val instanceof Error) return `${val.name} ${val.message} ${val.stack || ''}`;
    
    // Check common error / quota properties directly without circular JSON.stringify
    try {
      if (typeof val === 'object') {
        const parts: string[] = [];
        if (typeof val.message === 'string') parts.push(val.message);
        if (typeof val.code === 'string') parts.push(val.code);
        if (typeof val.status === 'string') parts.push(val.status);
        if (typeof val.error === 'string') parts.push(val.error);
        if (parts.length > 0) return parts.join(' ');
        
        // Circular-safe JSON stringify fallback
        const seen = new WeakSet();
        return JSON.stringify(val, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        });
      }
    } catch {
      return String(val);
    }
    return String(val);
  };

  const intercept = (originalFn: any) => {
    return function (...args: any[]) {
      try {
        const stringifiedArgs = args.map(safeExtractString).join(' ');
        
        if (
          stringifiedArgs.includes('resource-exhausted') || 
          stringifiedArgs.includes('Quota limit exceeded')
        ) {
          markFirestoreQuotaExceeded();
          return; 
        }
      } catch {
        // safety guard
      }
      
      originalFn.apply(console, args);
    };
  };

  console.error = intercept(console.error);
  console.warn = intercept(console.warn);
  console.log = intercept(console.log);
}

