import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  addDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { SITE_ROOT, isFirebaseConfigured } from './env';
import type { Post } from './types';

/** Slugs that collide with blog routes. */
export const RESERVED_SLUGS = ['admin'];

const postsCol = () => collection(db(), SITE_ROOT, 'posts');

const newestFirst = (a: Post, b: Post) => (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt);

function toPost(slug: string, data: Record<string, unknown>): Post {
  return {
    slug,
    type: 'article',
    status: 'draft',
    title: '',
    subtitle: '',
    coverUrl: '',
    contentHtml: '',
    tags: [],
    externalUrl: '',
    readMinutes: 1,
    createdAt: 0,
    updatedAt: 0,
    publishedAt: null,
    ...data,
  } as Post;
}

/** Posts listed on the public Writing page. */
export async function listPublishedPosts(): Promise<Post[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(query(postsCol(), where('status', '==', 'published')));
    return snap.docs.map((d) => toPost(d.id, d.data())).sort(newestFirst);
  } catch (err) {
    // Visitors see an empty list rather than an error; the cause is logged.
    console.warn('[posts] Could not load posts.', err);
    return [];
  }
}

/** Every post including drafts (admin only). */
export async function listAllPosts(): Promise<Post[]> {
  const snap = await getDocs(postsCol());
  return snap.docs.map((d) => toPost(d.id, d.data())).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(postsCol(), slug));
  return snap.exists() ? toPost(snap.id, snap.data()) : null;
}

export async function postExists(slug: string): Promise<boolean> {
  const snap = await getDoc(doc(postsCol(), slug));
  return snap.exists();
}

/**
 * Saves a post under its slug. When the slug changed, the old document is
 * removed so links never point at two copies.
 */
export async function savePost(post: Post, previousSlug?: string): Promise<Post> {
  const now = Date.now();
  const saved: Post = {
    ...post,
    createdAt: post.createdAt || now,
    updatedAt: now,
    publishedAt: post.status === 'draft' ? post.publishedAt : post.publishedAt ?? now,
  };
  const { slug, ...data } = saved;
  if (previousSlug && previousSlug !== slug) {
    const batch = writeBatch(db());
    batch.set(doc(postsCol(), slug), data);
    batch.delete(doc(postsCol(), previousSlug));
    await batch.commit();
  } else {
    await setDoc(doc(postsCol(), slug), data);
  }
  return saved;
}

export async function deletePost(slug: string): Promise<void> {
  await deleteDoc(doc(postsCol(), slug));
}

/** Stores a newsletter sign-up. Anyone may create; only the owner can read. */
export async function subscribe(email: string): Promise<void> {
  await addDoc(collection(db(), SITE_ROOT, 'subscribers'), { email: email.trim().toLowerCase(), createdAt: serverTimestamp() });
}
