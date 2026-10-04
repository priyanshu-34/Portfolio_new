import { describe, expect, it } from 'vitest';
import { buildFolders, folderTitle, normalizeFolder, postPath, sortInFolder } from '../src/folders';
import type { Post } from '../src/types';

const post = (slug: string, folder: string, publishedAt: number, order: number | null = null) =>
  ({ slug, folder, publishedAt, updatedAt: publishedAt, order }) as Post;

describe('folders', () => {
  it('titles and normalises folder paths', () => {
    expect(folderTitle('system-design/low-level-design')).toBe('Low level design');
    expect(normalizeFolder(' Low Level Design / Caching/ ')).toBe('low-level-design/caching');
    expect(normalizeFolder('')).toBe('');
  });

  it('builds folders with counts, parents and repo metadata', () => {
    const folders = buildFolders(
      [post('a', 'system-design/caching', 1), post('b', 'lld', 2), post('c', 'lld', 3), post('d', '', 4)],
      [{ path: 'lld', title: 'Low-level design', order: 1 }],
    );
    expect(folders.map((f) => [f.path, f.title, f.count])).toEqual([
      ['lld', 'Low-level design', 2],
      ['system-design/caching', 'Caching', 1],
      ['system-design', 'System design', 0],
    ]);
  });

  it('builds post URLs from the folder', () => {
    expect(postPath({ slug: 'parking-lot', folder: '' })).toBe('/parking-lot');
    expect(postPath({ slug: 'parking-lot', folder: 'low-level-design' })).toBe('/low-level-design/parking-lot');
    expect(postPath({ slug: 'lru', folder: 'system-design/caching' })).toBe('/system-design/caching/lru');
    expect(normalizeFolder('Admin/x')).toBe('admin-posts/x');
  });

  it('orders posts in a folder by explicit order, then date', () => {
    const sorted = sortInFolder([post('late', 'x', 30), post('second', 'x', 50, 2), post('first', 'x', 99, 1), post('early', 'x', 10)]);
    expect(sorted.map((p) => p.slug)).toEqual(['first', 'second', 'early', 'late']);
  });
});
