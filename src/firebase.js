import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let emulatorsWired = false;

const wireEmulators = (auth, db) => {
  if (emulatorsWired) return;
  if (process.env.NEXT_PUBLIC_USE_EMULATOR !== '1') return;
  if (typeof window === 'undefined') return;
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  emulatorsWired = true;
};

export const getFirebaseApp = () => (getApps().length ? getApp() : initializeApp(firebaseConfig));

export const getFirebaseAuth = () => {
  const auth = getAuth(getFirebaseApp());
  const db = getFirestore(getFirebaseApp());
  wireEmulators(auth, db);
  return auth;
};

export const getFirebaseDb = () => {
  const db = getFirestore(getFirebaseApp());
  const auth = getAuth(getFirebaseApp());
  wireEmulators(auth, db);
  return db;
};
