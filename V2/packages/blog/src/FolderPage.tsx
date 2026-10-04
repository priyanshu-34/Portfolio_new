import { folderPath, folderTitle, knownFolders, listPublishedPosts, sortInFolder, useAsync, useDocumentTitle } from '@pf/core';
import { EmptyState, Icon, PageShell, Skeleton, SiteLink } from '@pf/ui';
import { FolderCard, PostRow } from './PostList';
import './blog.css';

export function FolderPage({ path }: { path: string }) {
  const posts = useAsync(listPublishedPosts);
  const all = posts.data ?? [];
  const folders = knownFolders(all);
  const folder = folders.find((f) => f.path === path);
  const title = folder?.title ?? folderTitle(path);
  useDocumentTitle(`${title} — Writing`);

  const inFolder = sortInFolder(all.filter((p) => p.folder === path));
  const children = folders.filter((f) => f.path.startsWith(`${path}/`) && !f.path.slice(path.length + 1).includes('/'));
  const crumbs = path.split('/').map((_, i, parts) => parts.slice(0, i + 1).join('/'));

  return (
    <PageShell>
      <section className="blog-hero">
        <div className="container blog-hero__inner" style={{ paddingBottom: 48 }}>
          <nav aria-label="Breadcrumb" className="crumbs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <SiteLink site="blog" to="/" style={{ fontWeight: 600, color: 'var(--c-text-2)' }}>Writing</SiteLink>
            {crumbs.map((c) => (
              <span key={c} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <span aria-hidden="true" style={{ color: 'var(--c-text-4)' }}>/</span>
                {c === path ? (
                  <span aria-current="page" style={{ fontWeight: 600 }}>{folders.find((f) => f.path === c)?.title ?? folderTitle(c)}</span>
                ) : (
                  <SiteLink site="blog" to={folderPath(c)} style={{ fontWeight: 600, color: 'var(--c-text-2)' }}>{folders.find((f) => f.path === c)?.title ?? folderTitle(c)}</SiteLink>
                )}
              </span>
            ))}
          </nav>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="folder" size={14} />Folder</span>
          <h1 className="blog-hero__title">{title}</h1>
          {folder?.description && <p className="muted" style={{ fontSize: 18, maxWidth: 680 }}>{folder.description}</p>}
          {!posts.loading && <span className="muted" style={{ fontSize: 14 }}>{inFolder.length} {inFolder.length === 1 ? 'post' : 'posts'}{children.length ? ` · ${children.length} sub-folder${children.length > 1 ? 's' : ''}` : ''}</span>}
        </div>
      </section>
      <div className="container" style={{ paddingTop: 48, display: 'flex', flexDirection: 'column', gap: 40 }}>
        {posts.loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-busy="true"><Skeleton height={20} width="60%" /><Skeleton height={20} width="45%" /></div>
        ) : inFolder.length === 0 && children.length === 0 ? (
          <EmptyState title="Nothing here yet" body="Posts in this folder will show up here." action={<SiteLink site="blog" to="/" className="btn btn--primary">All writing</SiteLink>} />
        ) : (
          <>
            {children.length > 0 && (
              <div className="folder-grid">
                {children.map((f) => <FolderCard key={f.path} folder={f} posts={all} />)}
              </div>
            )}
            {inFolder.length > 0 && (
              <div className="folder-posts">
                {inFolder.map((p, i) => <PostRow key={p.slug} post={p} index={i} hideFolder />)}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
