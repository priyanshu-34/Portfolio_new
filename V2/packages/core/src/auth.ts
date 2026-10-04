import {
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import { adminEmails, isFirebaseConfigured } from './env';

export type { User };

export function isAdmin(user: User | null): boolean {
  const email = user?.email?.toLowerCase();
  return Boolean(email && user?.emailVerified !== false && adminEmails.includes(email));
}

export function watchUser(cb: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth(), cb);
}

export async function signInWith(provider: 'google' | 'github'): Promise<User> {
  const p = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
  const cred = await signInWithPopup(auth(), p);
  return cred.user;
}

export function signOut(): Promise<void> {
  return fbSignOut(auth());
}
