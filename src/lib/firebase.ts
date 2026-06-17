import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  inMemoryPersistence,
  initializeAuth 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const defaultFirebaseConfig = {
  apiKey: "AIzaSyB4rNZmGnIr6po4ZJxzq_wS_FeEE_Zq9tU",
  authDomain: "charged-axle-k8gvj.firebaseapp.com",
  projectId: "charged-axle-k8gvj",
  storageBucket: "charged-axle-k8gvj.firebasestorage.app",
  messagingSenderId: "160628866727",
  appId: "1:160628866727:web:621df029c0fd8db8e42582"
};

const firebaseConfig = {
  ...defaultFirebaseConfig,
  ...firebaseAppletConfig
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId || "ai-studio-fd37ee1a-6fab-4266-bcde-d885bf62752d");

// Check if we are in an iframe where storage access might be restricted
const isIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// Initialize auth with dependencies to avoid some environment-specific network errors
export const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, inMemoryPersistence],
  popupRedirectResolver: browserPopupRedirectResolver
});

export const googleProvider = new GoogleAuthProvider();

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
  }
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
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

