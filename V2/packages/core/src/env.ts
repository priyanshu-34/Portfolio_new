const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

/** Comma-separated list of emails allowed into the writing admin. */
export const adminEmails = String(env.VITE_ADMIN_EMAIL ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Every Firestore document of this site lives under this document, isolated from other apps in the project. */
export const SITE_ROOT = (env.VITE_FIRESTORE_ROOT as string | undefined) ?? 'sites/portfolio';
