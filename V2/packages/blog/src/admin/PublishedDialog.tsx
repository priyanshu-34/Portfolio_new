import { siteUrl, type Post } from '@pf/core';
import { Dialog, Icon, SiteLink } from '@pf/ui';
import { SharePanel } from '../share';

export function PublishedDialog({ post, onClose }: { post: Post; onClose: () => void }) {
  const url = siteUrl('blog', `/${post.slug}`);
  return (
    <Dialog
      labelledBy="published-title"
      onClose={onClose}
      title={
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 999, background: 'var(--c-success-bg)', border: '1px solid var(--c-success)', color: 'var(--c-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={20} strokeWidth={2.2} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Your post is live</h2>
            <span className="muted" style={{ fontSize: 14 }}>
              {post.status === 'unlisted' ? 'Only people with the link can read it.' : "Anyone can read it, and it's listed on your Writing page."}
            </span>
          </div>
        </div>
      }
      footer={
        <>
          <SiteLink site="blog" to="/admin" className="btn btn--outline">Back to posts</SiteLink>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--primary">View post <Icon name="external" /></a>
        </>
      }
    >
      <SharePanel url={url} title={post.title} heading="Share it" />
    </Dialog>
  );
}
