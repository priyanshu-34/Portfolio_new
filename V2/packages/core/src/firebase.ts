import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from './env';

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Fill in the VITE_FIREBASE_* variables.');
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export const db = (): Firestore => getFirestore(getApp());
export const auth = (): Auth => getAuth(getApp());
export const storage = (): FirebaseStorage => getStorage(getApp());
