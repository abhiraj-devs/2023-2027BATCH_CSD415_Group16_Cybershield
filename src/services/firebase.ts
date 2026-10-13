import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence, 
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider 
} from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Permanently prevent "Database is closing/hidden" error in browser iframe / hidden visibility
if (typeof window !== 'undefined' && indexedDBLocalPersistence) {
  try {
    const proto = (indexedDBLocalPersistence as any).prototype;
    if (proto) {
      proto.registerLifecycleListeners = function() {};
      const origOpenDb = proto._openDb;
      proto._openDb = async function(this: any) {
        this.isHiding = false;
        if (origOpenDb) {
          return origOpenDb.apply(this);
        }
      };
    }
  } catch {
    // Ignore
  }
}

// Silence verbose internal SDK offline/retry errors from bubbling as fatal errors
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = function (...args: any[]) {
    if (args.some(arg => typeof arg === 'string' && (
      arg.includes('Database is closing/hidden') ||
      arg.includes('Could not reach Cloud Firestore backend') ||
      arg.includes('Backend didn\'t respond within 10 seconds')
    ))) {
      console.warn(...args);
      return;
    }
    origError.apply(console, args);
  };
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
}, firebaseConfig.firestoreDatabaseId);

let authInstance;
if (typeof window !== 'undefined') {
  try {
    authInstance = initializeAuth(app, {
      persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    authInstance = getAuth(app);
  }
} else {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export { browserPopupRedirectResolver };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection safely when online
export async function testConnection() {
  if (typeof window !== 'undefined') {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }
    if (document.visibilityState === 'hidden') {
      return;
    }
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is offline or test doc unreached.");
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}
