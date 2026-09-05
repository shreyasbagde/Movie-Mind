import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// User-provided configuration merged with applet configuration
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyDmISeyB7XEg9Vgk2Yk5_QKY3M4ha9d0nc",
  authDomain: firebaseAppletConfig.authDomain || "movie-mind-ac388.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "movie-mind-ac388",
  storageBucket: firebaseAppletConfig.storageBucket || "movie-mind-ac388.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "296868721417",
  appId: firebaseAppletConfig.appId || "1:296868721417:web:6a91c38d4ef75eb30a99d8",
  measurementId: firebaseAppletConfig.measurementId || "G-H42HVGW4JD",
};

// Initialize Firebase app singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore database
export const firestoreDatabaseId = firebaseAppletConfig.firestoreDatabaseId || '(default)';

let firestoreInstance: Firestore;
try {
  firestoreInstance =
    firestoreDatabaseId && firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firestoreDatabaseId)
      : getFirestore(app);
} catch (e) {
  console.warn('Falling back to default Firestore instance', e);
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;

// Initialize Analytics conditionally (safely handled for iframes)
export const initAnalytics = async () => {
  try {
    if (typeof window !== 'undefined' && (await isAnalyticsSupported())) {
      return getAnalytics(app);
    }
  } catch (err) {
    console.debug('Firebase analytics not available in current environment:', err);
  }
  return null;
};

// Execute analytics initialization
initAnalytics();

// Firestore error handling specification per Firebase integration skill
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Security / Operation Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Re-export common Firebase modules
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
};

export type { FirebaseUser };
