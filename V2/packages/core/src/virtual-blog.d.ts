declare module 'virtual:blog-posts' {
  import type { Post } from './types';
  export const repoPosts: Post[];
  export const repoFolders: { path: string; title?: string; description?: string; order?: number }[];
  export const repoLoaders: Record<string, () => Promise<{ default: string }>>;
}
