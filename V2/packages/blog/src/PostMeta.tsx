import { formatDate, type Post } from '@pf/core';
import { Icon } from '@pf/ui';

export function TypeBadge({ post }: { post: Post }) {
  if (post.type === 'medium') {
    return (
      <span className="tag" style={{ borderColor: 'var(--c-text)', fontWeight: 600 }}>
        Medium <Icon name="external" size={12} />
      </span>
    );
  }
  return <span className="tag">{post.type === 'note' ? 'Note' : 'Article'}</span>;
}

export function PostMeta({ post }: { post: Post }) {
  const date = formatDate(post.publishedAt ?? post.updatedAt);
  return (
    <div className="post-meta">
      <TypeBadge post={post} />
      {post.type !== 'medium' && <span>· {post.readMinutes} min read</span>}
      {date && <span>· {date}</span>}
    </div>
  );
}
