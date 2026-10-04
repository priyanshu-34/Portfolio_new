import type { ReactNode } from 'react';
import { folderPath, folderTitle, postPath, safeUrl, type Folder, type Post } from '@pf/core';
import { ExternalLink, Icon, SiteLink } from '@pf/ui';
import { PostMeta } from './PostMeta';

export function PostLink({ post, className, children }: { post: Post; className?: string; children: ReactNode }) {
  return post.type === 'medium' ? (
    <ExternalLink href={safeUrl(post.externalUrl) || '#'} className={className}>{children}</ExternalLink>
  ) : (
    <SiteLink site="blog" to={postPath(post)} className={className}>{children}</SiteLink>
  );
}

export function FolderChip({ path, folders }: { path: string; folders?: Folder[] }) {
  const title = folders?.find((f) => f.path === path)?.title ?? folderTitle(path);
  return (
    <SiteLink site="blog" to={folderPath(path)} className="tag folder-chip">
      <Icon name="folder" size={12} />
      {title}
    </SiteLink>
  );
}

export function PostRow({ post, folders, index, hideFolder }: { post: Post; folders?: Folder[]; index?: number; hideFolder?: boolean }) {
  return (
    <article className="post-row">
      {index !== undefined && <span className="post-row__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
      <div className="post-row__body">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          {!hideFolder && post.folder && <FolderChip path={post.folder} folders={folders} />}
          <PostMeta post={post} />
        </div>
        <h3 className="post-row__title"><PostLink post={post}>{post.title}</PostLink></h3>
        {post.subtitle && <p className="muted" style={{ fontSize: 15 }}>{post.subtitle}</p>}
      </div>
      {post.coverUrl && <img className="post-row__thumb" src={post.coverUrl} alt="" loading="lazy" />}
    </article>
  );
}

export function FolderCard({ folder, posts }: { folder: Folder; posts: Post[] }) {
  const inside = posts.filter((p) => p.folder === folder.path || p.folder?.startsWith(`${folder.path}/`)).length;
  return (
    <SiteLink site="blog" to={folderPath(folder.path)} className="card card--link folder-card">
      <span className="icon-tile" style={{ width: 40, height: 40 }}><Icon name="folder" size={20} strokeWidth={1.8} /></span>
      <span className="folder-card__title">{folder.title}</span>
      {folder.description && <span className="muted folder-card__desc">{folder.description}</span>}
      <span className="folder-card__count">{inside} {inside === 1 ? 'post' : 'posts'} <Icon name="arrowRight" size={14} /></span>
    </SiteLink>
  );
}
