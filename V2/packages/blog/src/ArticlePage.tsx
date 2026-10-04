import { folderPath as folderUrl, folderTitle, getPost, postPath, knownFolders, listPublishedPosts, safeUrl, siteUrl, sortInFolder, useAsync, useAuth, useDocumentTitle, usePortfolio, type Post } from '@pf/core';
import { EmptyState, ExternalLink, Icon, PageLoading, PageShell, SiteLink } from '@pf/ui';
import { PostMeta } from './PostMeta';
import { ShareButtons, SharePanel } from './share';
import { PostBody } from './PostBody';
import './blog.css';

export function ArticlePage({ slug }: { slug: string }) {
  const { admin, ready } = useAuth();
  // Wait for the auth session so the owner can open drafts by direct link.
  const { data: post, loading, error } = useAsync(() => (ready ? getPost(slug) : new Promise<null>(() => {})), [slug, ready, admin]);
  const more = useAsync(() => listPublishedPosts().catch(() => [] as Post[]));
  const portfolio = usePortfolio();
  const profile = portfolio.data?.data.profile;
  useDocumentTitle(post ? post.title : undefined);


  if (loading || !ready) return <PageShell><PageLoading /></PageShell>;
  const visible = post && (post.status !== 'draft' || admin);
  if (error || !visible) {
    return (
      <PageShell>
        <div className="container" style={{ paddingTop: 80 }}>
          <EmptyState
            title="Post not found"
            body="It may have been unpublished or the link is mistyped."
            action={<SiteLink site="blog" to="/" className="btn btn--primary">All writing</SiteLink>}
          />
        </div>
      </PageShell>
    );
  }

  const url = siteUrl('blog', postPath(post));
  const published = more.data ?? [];
  const folderPath = post.folder ?? '';
  const allFolders = knownFolders(published);
  const titleOf = (p: string) => allFolders.find((f) => f.path === p)?.title ?? folderTitle(p);
  const folderName = folderPath ? titleOf(folderPath) : '';
  const crumbs = folderPath ? folderPath.split('/').map((_, i, parts) => ({ path: parts.slice(0, i + 1).join('/'), title: titleOf(parts.slice(0, i + 1).join('/')) })) : [];
  const siblings = folderPath ? sortInFolder(published.filter((p) => p.folder === folderPath)) : [];
  const at = siblings.findIndex((p) => p.slug === post.slug);
  const prev = at > 0 ? siblings[at - 1] : undefined;
  const next = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : undefined;
  const others = published.filter((p) => p.slug !== post.slug && p.folder !== folderPath).slice(0, 3);

  return (
    <PageShell>
      <article className="article">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
            <SiteLink site="blog" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--c-text-2)' }}>
              <Icon name="arrowLeft" />All writing
            </SiteLink>
            {crumbs.map((c) => (
              <span key={c.path} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden="true" style={{ color: 'var(--c-text-4)' }}>/</span>
                <SiteLink site="blog" to={folderUrl(c.path)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="folder" size={14} />{c.title}
                </SiteLink>
              </span>
            ))}
          </nav>
          {admin && post.source !== 'repo' && (
            <SiteLink site="blog" to={`/admin/edit/${post.slug}`} className="btn btn--outline btn--sm"><Icon name="pen" />Edit</SiteLink>
          )}
          {admin && post.source === 'repo' && post.editUrl && (
            <ExternalLink href={post.editUrl} className="btn btn--outline btn--sm"><Icon name="github" />Edit on GitHub</ExternalLink>
          )}
        </div>
        {post.status !== 'published' && (
          <p className="notice notice--warn">{post.status === 'draft' ? 'Draft — only you can see this.' : 'Unlisted — only people with the link can see this.'}</p>
        )}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <h1 className="article__title">{post.title}</h1>
        {post.subtitle && <p className="article__sub">{post.subtitle}</p>}
        <div className="byline">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {profile && <img src={profile.avatarUrl} alt="" />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <strong style={{ fontWeight: 600, fontSize: 15 }}>{profile?.name}</strong>
              <PostMeta post={post} />
            </div>
          </div>
          <ShareButtons url={url} title={post.title} />
        </div>
        {post.coverUrl && <img className="article__cover" src={post.coverUrl} alt="" />}
        {post.type === 'medium' ? (
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <p className="muted">This post was published on Medium.</p>
            <ExternalLink href={safeUrl(post.externalUrl) || '#'} className="btn btn--primary">Read on Medium <Icon name="external" /></ExternalLink>
          </div>
        ) : (
          <PostBody html={post.contentHtml} />
        )}
        {(prev || next) && (
          <nav aria-label={`More in ${folderName}`} className="folder-nav">
            {prev ? (
              <SiteLink site="blog" to={postPath(prev)} className="card card--link">
                <span className="folder-nav__label">← Previous in {folderName}</span>
                <span className="folder-nav__title">{prev.title}</span>
              </SiteLink>
            ) : <span />}
            {next && (
              <SiteLink site="blog" to={postPath(next)} className="card card--link" style={{ textAlign: 'right' }}>
                <span className="folder-nav__label">Next in {folderName} →</span>
                <span className="folder-nav__title">{next.title}</span>
              </SiteLink>
            )}
          </nav>
        )}
        <SharePanel url={url} title={post.title} />
        {profile && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '24px 0', borderTop: '1px solid var(--c-border)' }}>
            <img src={profile.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: 999, objectFit: 'cover' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong style={{ fontWeight: 600 }}>Written by {profile.name}</strong>
              <span className="muted" style={{ fontSize: 15 }}>{profile.role} at {profile.company}. Writes about {profile.focus.slice(0, 3).join(', ')}.</span>
              <SiteLink site="portfolio" to="/" style={{ fontSize: 14, fontWeight: 600, padding: '8px 0' }}>About me</SiteLink>
            </div>
          </div>
        )}
      </article>
      {others.length > 0 && (
        <section className="container" style={{ paddingTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>More writing</h2>
          <div className="posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 24 }}>
            {others.map((p) => {
              const inner = (
                <>
                  <PostMeta post={p} />
                  <span style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>{p.title}</span>
                </>
              );
              const style = { padding: 24, gap: 10 };
              return p.type === 'medium' ? (
                <ExternalLink key={p.slug} href={safeUrl(p.externalUrl) || '#'} className="card card--link" style={style}>{inner}</ExternalLink>
              ) : (
                <SiteLink key={p.slug} site="blog" to={postPath(p)} className="card card--link" style={style}>{inner}</SiteLink>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}
