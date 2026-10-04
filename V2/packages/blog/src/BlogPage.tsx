import { useMemo, useState, type FormEvent } from 'react';
import { listFolders, listPublishedPosts, subscribe, useAsync, useDocumentTitle, usePortfolio } from '@pf/core';
import { EmptyState, ExternalLink, Icon, PageShell, Skeleton, SiteLink } from '@pf/ui';
import { PostMeta } from './PostMeta';
import { FolderCard, PostLink, PostRow } from './PostList';
import './blog.css';

type Filter = 'all' | 'article' | 'note' | 'medium';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'article', label: 'Articles' },
  { key: 'note', label: 'Notes' },
  { key: 'medium', label: 'From Medium' },
];

export function BlogPage() {
  const posts = useAsync(listPublishedPosts);
  const folders = useAsync(() => listFolders(posts.data ?? []), [posts.data]);
  const topFolders = (folders.data ?? []).filter((f) => !f.path.includes('/'));
  const portfolio = usePortfolio();
  const medium = portfolio.data?.data.profile.socials.medium;
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  useDocumentTitle('Writing — Priyanshu Singh');

  const all = posts.data ?? [];
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: all.length, article: 0, note: 0, medium: 0 };
    for (const p of all) c[p.type] += 1;
    return c;
  }, [all]);
  const topics = useMemo(() => {
    const freq = new Map<string, number>();
    for (const p of all) for (const t of p.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);
  }, [all]);

  const q = query.trim().toLowerCase();
  const visible = all.filter(
    (p) =>
      (filter === 'all' || p.type === filter) &&
      (!topic || p.tags.includes(topic)) &&
      (!q || `${p.title} ${p.subtitle} ${p.tags.join(' ')}`.toLowerCase().includes(q)),
  );
  const isDefaultView = filter === 'all' && !topic && !q;
  const [featured, ...rest] = visible;

  return (
    <PageShell footerExtra={<SiteLink site="blog" to="/admin">Admin</SiteLink>}>
      <section className="blog-hero">
        <div className="container blog-hero__inner">
          <span className="eyebrow">Writing</span>
          <h1 className="blog-hero__title">Notes on distributed systems, agents and the bugs in between.</h1>
          <p className="muted" style={{ fontSize: 18, maxWidth: 640 }}>Technical deep-dives, short notes and posts I've published on Medium — all in one place.</p>
          <div className="blog-hero__bar">
            <div className="tabs" role="tablist" aria-label="Filter posts">
              {FILTERS.map((f) => (
                <button key={f.key} type="button" role="tab" className="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}>
                  {f.label}<span className="tab__count">{counts[f.key]}</span>
                </button>
              ))}
            </div>
            <label className="search">
              <Icon name="search" />
              <span className="sr-only">Search posts</span>
              <input type="search" placeholder="Search posts" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
        </div>
      </section>

      <div className="container blog-layout">
        <div className="blog-main">
          {posts.loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-busy="true" aria-label="Loading posts">
              <Skeleton height={280} />
              <Skeleton height={20} width="60%" />
              <Skeleton height={20} width="45%" />
            </div>
          ) : posts.error ? (
            <EmptyState title="Couldn't load posts" body="Please refresh the page in a moment." />
          ) : visible.length === 0 ? (
            <EmptyState
              title={all.length === 0 ? 'No posts yet' : 'No posts match'}
              body={all.length === 0 ? 'The first one is being written.' : 'Try another filter or search term.'}
              action={all.length === 0 && medium ? <ExternalLink href={medium} className="btn btn--outline">Read on Medium <Icon name="external" /></ExternalLink> : undefined}
            />
          ) : (
            <>
              {isDefaultView && featured && (
                <PostLink post={featured} className="card feature-post">
                  <div className="feature-post__cover">
                    {featured.coverUrl ? <img src={featured.coverUrl} alt="" /> : <span>{featured.tags[0] ?? 'Featured'}</span>}
                  </div>
                  <div className="feature-post__body">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge--primary">Latest</span>
                      <PostMeta post={featured} />
                    </div>
                    <h2 style={{ fontSize: 28, lineHeight: 1.25, fontWeight: 600 }}>{featured.title}</h2>
                    {featured.subtitle && <p className="muted">{featured.subtitle}</p>}
                  </div>
                </PostLink>
              )}
              {isDefaultView && topFolders.length > 0 && (
                <section aria-labelledby="folders-title" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h2 id="folders-title" className="label-caps">Folders</h2>
                  <div className="folder-grid">
                    {topFolders.map((f) => <FolderCard key={f.path} folder={f} posts={all} />)}
                  </div>
                </section>
              )}
              <div>
                {isDefaultView && topFolders.length > 0 && rest.length > 0 && <h2 className="label-caps" style={{ marginBottom: 4 }}>All posts</h2>}
                {(isDefaultView ? rest : visible).map((post) => <PostRow key={post.slug} post={post} folders={folders.data} />)}
              </div>
            </>
          )}
        </div>

        <aside className="blog-aside" aria-label="More">
          {topics.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="label-caps">Topics</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topics.map((t) => (
                  <button key={t} type="button" className={`tag tag--lg${topic === t ? ' tag--active' : ''}`} aria-pressed={topic === t} style={{ cursor: 'pointer' }} onClick={() => setTopic(topic === t ? null : t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <SubscribeBox />
          {medium && (
            <ExternalLink href={medium} className="card card--link" style={{ padding: '16px 20px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ fontWeight: 600, fontSize: 15 }}>Also on Medium</strong>
                <span className="muted" style={{ fontSize: 13 }}>{medium.replace(/^https?:\/\/(www\.)?medium\.com\//, '')}</span>
              </span>
              <Icon name="external" size={18} />
            </ExternalLink>
          )}
        </aside>
      </div>
    </PageShell>
  );
}

function SubscribeBox() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState('saving');
    try {
      await subscribe(email);
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  }
  return (
    <form className="subscribe" onSubmit={onSubmit}>
      <strong style={{ fontWeight: 600 }}>Get new posts by email</strong>
      <span className="muted" style={{ fontSize: 14 }}>No spam. Unsubscribe any time.</span>
      <div className="field">
        <label htmlFor="subscribe-email" className="field__label">Email</label>
        <input id="subscribe-email" className="input" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit" className="btn btn--primary" disabled={state === 'saving'}>{state === 'saving' ? 'Subscribing…' : 'Subscribe'}</button>
      {state === 'done' && <p role="status" className="notice notice--success">You're on the list.</p>}
      {state === 'error' && <p role="alert" className="notice notice--error">Couldn't subscribe right now. Please try again later.</p>}
    </form>
  );
}
