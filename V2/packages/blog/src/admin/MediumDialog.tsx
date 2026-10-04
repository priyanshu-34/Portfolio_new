import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMediumFeed, mediumHandle, mediumToArticle, postExists, readingMinutes, safeUrl, savePost, sitePath, slugify, usePortfolio, type MediumItem, type Post } from '@pf/core';
import { Dialog, Icon } from '@pf/ui';

function toPost(item: { title: string; link: string; subtitle: string; image: string; publishedAt: number; tags: string[] }): Post {
  return {
    slug: `medium-${slugify(item.title)}`,
    type: 'medium',
    status: 'published',
    title: item.title,
    subtitle: item.subtitle,
    coverUrl: item.image,
    contentHtml: '',
    tags: item.tags,
    externalUrl: item.link,
    readMinutes: 1,
    createdAt: 0,
    updatedAt: 0,
    publishedAt: item.publishedAt,
  };
}

export function MediumDialog({ existing, onClose, onAttached }: { existing: Post[]; onClose: () => void; onAttached: () => void }) {
  const { data } = usePortfolio();
  const handle = mediumHandle(data?.data.profile.socials.medium);
  const [items, setItems] = useState<MediumItem[] | null>(null);
  const [feedError, setFeedError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [manual, setManual] = useState({ link: '', title: '', subtitle: '', image: '' });
  const navigate = useNavigate();
  const attachedLinks = new Set(existing.filter((p) => p.type === 'medium').map((p) => p.externalUrl));
  const existingTitles = new Set(existing.filter((p) => p.type !== 'medium').map((p) => p.title.toLowerCase()));

  /** Copies the full Medium post into a native draft and opens it in the editor. */
  async function copyToSite(item: MediumItem) {
    setBusy(`copy:${item.link}`);
    setError('');
    try {
      const a = mediumToArticle(item);
      let slug = slugify(a.title);
      if (await postExists(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      const saved = await savePost({
        slug,
        type: 'article',
        status: 'draft',
        title: a.title,
        subtitle: a.subtitle,
        coverUrl: a.coverUrl,
        contentHtml: a.contentHtml,
        tags: item.tags.slice(0, 8),
        externalUrl: '',
        readMinutes: readingMinutes(a.contentHtml),
        createdAt: 0,
        updatedAt: 0,
        publishedAt: item.publishedAt,
      });
      navigate(sitePath('blog', `/admin/edit/${saved.slug}`));
    } catch (e) {
      setError((e as Error).message || 'Could not copy the post.');
      setBusy(null);
    }
  }

  useEffect(() => {
    if (!handle) return;
    fetchMediumFeed(handle).then(setItems, (e: Error) => setFeedError(e.message));
  }, [handle]);

  async function attach(item: MediumItem | typeof manual & { publishedAt?: number; tags?: string[] }) {
    setBusy(item.link);
    setError('');
    const link = safeUrl(item.link, { httpsOnly: true });
    if (!link) {
      setError('Enter an https:// link to the post.');
      setBusy(null);
      return;
    }
    try {
      const post = toPost({ publishedAt: Date.now(), tags: [], ...item, link, image: safeUrl(item.image, { httpsOnly: true }) });
      if (await postExists(post.slug)) post.slug = `${post.slug}-${Date.now().toString(36)}`;
      await savePost(post);
      onAttached();
    } catch (e) {
      setError((e as Error).message || 'Could not attach the post.');
    } finally {
      setBusy(null);
    }
  }

  function onManual(e: FormEvent) {
    e.preventDefault();
    attach(manual).then(() => setManual({ link: '', title: '', subtitle: '', image: '' }));
  }

  return (
    <Dialog title={<h2 style={{ fontSize: 20, fontWeight: 600 }}>Attach Medium posts</h2>} onClose={onClose} footer={<button type="button" className="btn btn--outline" onClick={onClose}>Done</button>}>
      <p className="muted" style={{ fontSize: 14 }}><strong>Copy to site</strong> brings the full post here as a draft you can edit and publish. <strong>Attach link</strong> lists it on your Writing page and opens it on Medium.</p>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {handle && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="label-caps">From {handle}</span>
          {!items && !feedError && <p className="muted" style={{ fontSize: 14, padding: '12px 0' }}>Loading your latest Medium posts…</p>}
          {feedError && <p className="notice notice--warn">Couldn't read your Medium feed ({feedError}). Add posts by link below.</p>}
          {items && items.length === 0 && <p className="muted" style={{ fontSize: 14 }}>No posts found on Medium.</p>}
          {items?.map((item) => {
            const done = attachedLinks.has(item.link);
            return (
              <div key={item.link} className="medium-item">
                {item.image ? <img src={item.image} alt="" /> : <span style={{ width: 56, height: 56, background: 'var(--c-surface)', borderRadius: 4, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{new Date(item.publishedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" className="btn btn--outline btn--sm" disabled={busy !== null || !item.contentHtml} title="Copy the full post to this site as a draft" onClick={() => copyToSite(item)}>
                    {busy === `copy:${item.link}` ? 'Copying…' : existingTitles.has(mediumToArticle(item).title.toLowerCase()) ? 'Copy again' : 'Copy to site'}
                  </button>
                  <button type="button" className="btn btn--secondary btn--sm" disabled={done || busy !== null} onClick={() => attach(item)}>
                    {done ? <><Icon name="check" />Attached</> : busy === item.link ? 'Attaching…' : 'Attach link'}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
      <form onSubmit={onManual} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8, borderTop: '1px solid var(--c-border)' }}>
        <span className="label-caps" style={{ paddingTop: 12 }}>Add by link</span>
        <div className="field">
          <label className="field__label" htmlFor="m-link">Medium URL</label>
          <input id="m-link" className="input" type="url" required placeholder="https://medium.com/@you/post-title" value={manual.link} onChange={(e) => setManual({ ...manual, link: e.target.value })} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="m-title">Title</label>
          <input id="m-title" className="input" required value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="m-sub">Subtitle (optional)</label>
          <input id="m-sub" className="input" value={manual.subtitle} onChange={(e) => setManual({ ...manual, subtitle: e.target.value })} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="m-img">Image URL (optional)</label>
          <input id="m-img" className="input" type="url" value={manual.image} onChange={(e) => setManual({ ...manual, image: e.target.value })} />
        </div>
        <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }} disabled={busy !== null}>Attach post</button>
      </form>
    </Dialog>
  );
}
