import type { Folder, Post } from './types';

/** First folder segments that would collide with blog routes. */
export const RESERVED_FOLDERS = ['admin', 'folders'];

/** Path of a post inside the blog: /<folder>/<slug>, or /<slug> at the root. */
export function postPath(post: { slug: string; folder?: string | null }): string {
  return post.folder ? `/${post.folder}/${post.slug}` : `/${post.slug}`;
}

/** Path of a folder page inside the blog. */
export function folderPath(path: string): string {
  return `/${path}`;
}

/** "low-level-design" → "Low-level design" */
export function folderTitle(path: string): string {
  const last = path.split('/').pop() ?? path;
  const words = last.replace(/-/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Normalises a folder typed by hand: "Low Level Design/" → "low-level-design". */
export function normalizeFolder(input: string): string {
  const parts = input
    .toLowerCase()
    .split('/')
    .map((part) => part.trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean);
  if (parts[0] && RESERVED_FOLDERS.includes(parts[0])) parts[0] = `${parts[0]}-posts`;
  return parts.join('/');
}

/** Folders from repo metadata plus every folder that has posts, with counts. */
export function buildFolders(posts: Post[], meta: { path: string; title?: string; description?: string; order?: number }[]): Folder[] {
  const map = new Map<string, Folder>();
  const ensure = (path: string) => {
    if (!path) return;
    const parts = path.split('/');
    for (let i = 1; i <= parts.length; i++) {
      const p = parts.slice(0, i).join('/');
      if (!map.has(p)) map.set(p, { path: p, title: folderTitle(p), description: '', order: null, count: 0 });
    }
  };
  for (const m of meta) {
    if (!m.path) continue;
    ensure(m.path);
    const f = map.get(m.path)!;
    if (m.title) f.title = m.title;
    if (m.description) f.description = m.description;
    if (typeof m.order === 'number') f.order = m.order;
  }
  for (const post of posts) {
    if (!post.folder) continue;
    ensure(post.folder);
    map.get(post.folder)!.count += 1;
  }
  return [...map.values()].sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
}

/** Posts inside a folder: explicit order first, then oldest → newest (reading order). */
export function sortInFolder(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || (a.publishedAt ?? a.updatedAt) - (b.publishedAt ?? b.updatedAt),
  );
}
