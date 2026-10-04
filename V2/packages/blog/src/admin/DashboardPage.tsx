import { useState } from 'react';
import { deletePost, formatDate, safeUrl, listAllPosts, siteUrl, useAsync, useDocumentTitle, usePortfolio, writePortfolio, invalidatePortfolio, type Post, type PostStatus } from '@pf/core';
import { EmptyState, Icon, SiteLink, copyText, useToast } from '@pf/ui';
import { AdminBar } from './AdminShell';
import { MediumDialog } from './MediumDialog';

type Filter = 'all' | PostStatus | 'medium';

const STATUS_PILL: Record<PostStatus, string> = { published: 'pill--success', draft: 'pill--attention', unlisted: 'pill--neutral' };
const STATUS_LABEL: Record<PostStatus, string> = { published: 'Published', draft: 'Draft', unlisted: 'Unlisted' };
const TYPE_LABEL = { article: 'Article', note: 'Note', medium: 'Medium link' } as const;
const isRepo = (p: Post) => p.source === 'repo';

export function DashboardPage() {
  const posts = useAsync(listAllPosts);
  const portfolio = usePortfolio();
  const [filter, setFilter] = useState<Filter>('all');
  const [mediumOpen, setMediumOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toast, show] = useToast();
  useDocumentTitle('Posts — Writing admin');

  const all = posts.data ?? [];
  const count = (f: Filter) => (f === 'all' ? all.length : f === 'medium' ? all.filter((p) => p.type === 'medium').length : all.filter((p) => p.type !== 'medium' && p.status === f).length);
  const visible = all.filter((p) => filter === 'all' || (filter === 'medium' ? p.type === 'medium' : p.type !== 'medium' && p.status === filter));

  async function remove(post: Post) {
    if (!window.confirm(`Delete “${post.title}”? This can't be undone.`)) return;
    try {
      await deletePost(post.slug);
      show('Post deleted');
      posts.reload();
    } catch {
      show('Could not delete the post');
    }
  }

  async function seed() {
    if (!window.confirm('Replace the portfolio content in Firestore with the version in the code?')) return;
    setSeeding(true);
    try {
      await writePortfolio();
      invalidatePortfolio();
      show('Starter content saved to Firestore');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      show(`Could not save: ${(e as Error).message}`);
    } finally {
      setSeeding(false);
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
    { key: 'unlisted', label: 'Unlisted' },
    { key: 'medium', label: 'Medium' },
  ];

  return (
    <>
      <AdminBar />
      <main className="admin-main">
        {portfolio.data.source === 'fallback' && (
          <p className="notice notice--warn">Couldn't reach Firestore for portfolio content; visitors see the last saved copy.</p>
        )}
        {portfolio.data.source === 'firestore' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost btn--sm" disabled={seeding} onClick={seed} title="Overwrite the portfolio content in Firestore with the version in the code (packages/core/src/seed.ts)">
              <Icon name="refresh" />{seeding ? 'Syncing…' : 'Sync portfolio content from code'}
            </button>
          </div>
        )}
        {portfolio.data.source === 'seed' && !portfolio.loading && (
          <div className="notice notice--info" style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span>Portfolio content is coming from the bundled starter data, not Firestore yet.</span>
            <button type="button" className="btn btn--secondary btn--sm" disabled={seeding} onClick={seed}>{seeding ? 'Saving…' : 'Import starter content'}</button>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 600 }}>Posts</h1>
            <span className="muted" style={{ fontSize: 14 }}>Write, edit and share your posts. Attach Medium posts to list them alongside.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--secondary" onClick={() => setMediumOpen(true)}>Attach Medium post</button>
            <SiteLink site="blog" to="/admin/new" className="btn btn--primary"><Icon name="plus" />New post</SiteLink>
          </div>
        </div>
        <div className="tabs" role="tablist" aria-label="Filter posts" style={{ borderBottom: '1px solid var(--c-border)' }}>
          {filters.map((f) => (
            <button key={f.key} type="button" role="tab" className="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}<span className="tab__count">{count(f.key)}</span>
            </button>
          ))}
        </div>
        {posts.loading ? (
          <p className="muted" aria-busy="true">Loading posts…</p>
        ) : posts.error ? (
          <div className="notice notice--error" role="alert">
            Couldn't load posts ({posts.error.message.replace(/\.$/, '')}). Check that the rules in <code>firestore.rules</code> are deployed.
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={all.length === 0 ? 'No posts yet' : 'Nothing here'}
            body={all.length === 0 ? 'Write your first post or attach one from Medium.' : 'No posts match this filter.'}
            action={all.length === 0 ? <SiteLink site="blog" to="/admin/new" className="btn btn--primary"><Icon name="plus" />New post</SiteLink> : undefined}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '44%' }}>Title</th>
                  <th scope="col">Type</th>
                  <th scope="col">Folder</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((post) => (
                  <tr key={post.slug}>
                    <td>
                      {isRepo(post) ? (
                        <SiteLink site="blog" to={`/${post.slug}`} className="table__title">{post.title}</SiteLink>
                      ) : post.type === 'medium' ? (
                        <a href={safeUrl(post.externalUrl) || '#'} target="_blank" rel="noopener noreferrer" className="table__title">{post.title}</a>
                      ) : (
                        <SiteLink site="blog" to={`/admin/edit/${post.slug}`} className="table__title">{post.title || 'Untitled'}</SiteLink>
                      )}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {TYPE_LABEL[post.type]}
                        {isRepo(post) && <span className="badge" style={{ border: '1px solid var(--c-text-3)', color: 'var(--c-text-2)' }} title="Markdown file in the repo">Repo</span>}
                      </span>
                    </td>
                    <td>{post.folder || '—'}</td>
                    <td><span className={`pill ${STATUS_PILL[post.status]}`}>{post.type === 'medium' && post.status === 'published' ? 'Listed' : STATUS_LABEL[post.status]}</span></td>
                    <td>{formatDate(post.updatedAt)}</td>
                    <td>
                      <div className="table__actions">
                        {isRepo(post) && post.editUrl && <a href={post.editUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">Edit on GitHub</a>}
                        {!isRepo(post) && post.type !== 'medium' && <SiteLink site="blog" to={`/admin/edit/${post.slug}`} className="btn btn--ghost btn--sm">Edit</SiteLink>}
                        {post.status !== 'draft' && (
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={async () => show((await copyText(post.type === 'medium' ? safeUrl(post.externalUrl) : siteUrl('blog', `/${post.slug}`))) ? 'Link copied' : 'Could not copy')}
                          >
                            Copy link
                          </button>
                        )}
                        {!isRepo(post) && (
                          <button type="button" className="btn btn--ghost btn--icon btn--sm" aria-label={`Delete ${post.title}`} onClick={() => remove(post)}>
                            <Icon name="trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {mediumOpen && (
        <MediumDialog
          existing={all}
          onClose={() => setMediumOpen(false)}
          onAttached={() => {
            show('Medium post attached');
            posts.reload();
          }}
        />
      )}
      {toast}
    </>
  );
}
