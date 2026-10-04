import { Navigate, useParams } from 'react-router-dom';
import { getPost, knownFolders, listPublishedPosts, postPath, sitePath, useAsync, useAuth } from '@pf/core';
import { PageLoading, PageShell, NotFound } from '@pf/ui';
import { ArticlePage } from './ArticlePage';
import { FolderPage } from './FolderPage';

/**
 * Resolves /blog/<...path>:
 *   /blog/<folder>/<slug> and /blog/<slug> → the post (redirects to its
 *   canonical address if the folder in the URL is wrong or outdated);
 *   /blog/<folder>                         → the folder page.
 */
export function BlogPathPage() {
  const raw = (useParams()['*'] ?? '').replace(/^\/+|\/+$/g, '');
  // Old folder links: /blog/folders/<path>
  const path = raw.startsWith('folders/') ? raw.slice('folders/'.length) : raw;
  const parts = path.split('/').filter(Boolean);
  const slug = parts[parts.length - 1] ?? '';
  const prefix = parts.slice(0, -1).join('/');
  const { ready, admin } = useAuth();

  const resolved = useAsync(async () => {
    const [post, published] = await Promise.all([getPost(slug).catch(() => null), listPublishedPosts()]);
    const isFolder = knownFolders(published).some((f) => f.path === path);
    return { post, isFolder, path };
  }, [path, ready, admin]);

  if (path !== raw) return <Navigate to={sitePath('blog', `/${path}`)} replace />;
  // Ignore results resolved for a previous URL (they arrive one render late).
  if (resolved.loading || !resolved.data || resolved.data.path !== path) return <PageShell><PageLoading /></PageShell>;
  const { post, isFolder } = resolved.data;

  if (post && (post.folder ?? '') === prefix) return <ArticlePage slug={slug} />;
  if (isFolder) return <FolderPage path={path} />;
  if (post) return <Navigate to={sitePath('blog', postPath(post))} replace />;
  return <NotFound />;
}
