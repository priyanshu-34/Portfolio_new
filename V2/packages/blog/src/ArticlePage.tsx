import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, listPublishedPosts, safeUrl, siteUrl, useAsync, useAuth, useDocumentTitle, usePortfolio, type Post } from '@pf/core';
import { EmptyState, ExternalLink, Icon, PageLoading, PageShell, SiteLink } from '@pf/ui';
import { PostMeta } from './PostMeta';
import { ShareButtons, SharePanel } from './share';
import { sanitizePostHtml } from './sanitize';
import './blog.css';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const { admin, ready } = useAuth();
  // Wait for the auth session so the owner can open drafts by direct link.
  const { data: post, loading, error } = useAsync(() => (ready ? getPost(slug) : new Promise<null>(() => {})), [slug, ready, admin]);
  const more = useAsync(() => listPublishedPosts().catch(() => [] as Post[]));
  const portfolio = usePortfolio();
  const profile = portfolio.data?.data.profile;
  useDocumentTitle(post ? post.title : undefined);

  const html = useMemo(() => (post ? sanitizePostHtml(post.contentHtml) : ''), [post]);

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

  const url = siteUrl('blog', `/${post.slug}`);
  const others = (more.data ?? []).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <PageShell>
      <article className="article">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          <SiteLink site="blog" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--c-text-2)' }}>
            <Icon name="arrowLeft" />All writing
          </SiteLink>
          {admin && (
            <SiteLink site="blog" to={`/admin/edit/${post.slug}`} className="btn btn--outline btn--sm"><Icon name="pen" />Edit</SiteLink>
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
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        )}
        <SharePanel url={url} title={post.title} />
        {profile && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '24px 0', borderTop: '1px solid var(--c-border)' }}>
            <img src={profile.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: 999, objectFit: 'cover' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong style={{ fontWeight: 600 }}>Written by {profile.name}</strong>
              <span className="muted" style={{ fontSize: 15 }}>{profile.role} at {profile.company}. Writes about {profile.focus.join(', ')}.</span>
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
                <SiteLink key={p.slug} site="blog" to={`/${p.slug}`} className="card card--link" style={style}>{inner}</SiteLink>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}
