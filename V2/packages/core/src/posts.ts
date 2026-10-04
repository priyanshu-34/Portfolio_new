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
import { repoFolders, repoLoaders, repoPosts } from 'virtual:blog-posts';
import { buildFolders } from './folders';
import type { Folder, Post } from './types';

/** Slugs that collide with blog routes. */
export const RESERVED_SLUGS = ['admin', 'folders'];

/** Markdown posts committed under content/blog. */
const repoPublished = () => repoPosts.filter((p) => p.status === 'published');
const repoBySlug = (slug: string) => repoPosts.find((p) => p.slug === slug);

const postsCol = () => collection(db(), SITE_ROOT, 'posts');

const newestFirst = (a: Post, b: Post) => (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt);

function toPost(slug: string, data: Record<string, unknown>): Post {
  return {
    slug,
    source: 'firestore',
    folder: '',
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

async function firestorePublished(): Promise<Post[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(query(postsCol(), where('status', '==', 'published')));
    return snap.docs.map((d) => toPost(d.id, d.data()));
  } catch (err) {
    // Visitors see repo posts rather than an error; the cause is logged.
    console.warn('[posts] Could not load posts from Firestore.', err);
    return [];
  }
}

/** Posts listed on the public Writing page: repo Markdown + Firestore, newest first. */
export async function listPublishedPosts(): Promise<Post[]> {
  const remote = await firestorePublished();
  const repoSlugs = new Set(repoPosts.map((p) => p.slug));
  return [...repoPublished(), ...remote.filter((p) => !repoSlugs.has(p.slug))].sort(newestFirst);
}

/** Folders that contain published posts (plus any described in the repo). */
export async function listFolders(posts?: Post[]): Promise<Folder[]> {
  const list = posts ?? (await listPublishedPosts());
  return buildFolders(list, repoFolders).filter((f) => f.count > 0 || list.some((p) => p.folder?.startsWith(`${f.path}/`)));
}

/** Folder metadata for the editor's suggestions, including empty repo folders. */
export function knownFolders(posts: Post[]): Folder[] {
  return buildFolders(posts, repoFolders);
}

/** Every post including drafts (admin only): Firestore posts plus repo posts. */
export async function listAllPosts(): Promise<Post[]> {
  const snap = await getDocs(postsCol());
  const remote = snap.docs.map((d) => toPost(d.id, d.data()));
  return [...repoPosts, ...remote].sort((a, b) => b.updatedAt - a.updatedAt);
}

/** A post by slug; repo posts win, their HTML is loaded on demand. */
export async function getPost(slug: string): Promise<Post | null> {
  const repo = repoBySlug(slug);
  if (repo) {
    const html = (await repoLoaders[slug]?.())?.default ?? '';
    return { ...repo, contentHtml: html };
  }
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(postsCol(), slug));
  return snap.exists() ? toPost(snap.id, snap.data()) : null;
}

/** Whether a slug is taken by a Firestore post or a repo post. */
export async function postExists(slug: string): Promise<boolean> {
  if (repoBySlug(slug)) return true;
  const snap = await getDoc(doc(postsCol(), slug));
  return snap.exists();
}

export function isRepoPost(slug: string): boolean {
  return Boolean(repoBySlug(slug));
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
  // Firestore stores only its own fields.
  const { slug, source: _source, editUrl: _editUrl, ...data } = saved;
  void _source;
  void _editUrl;
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
