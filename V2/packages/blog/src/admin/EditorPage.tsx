import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { RESERVED_SLUGS, getPost, postExists, readingMinutes, savePost, sitePath, siteUrl, slugify, uploadImage, useDocumentTitle, type Post, type PostStatus, type PostType } from '@pf/core';
import { Icon, PageLoading, SiteLink, useToast, type IconName } from '@pf/ui';
import { AdminBar } from './AdminShell';
import { PublishedDialog } from './PublishedDialog';
import { PostBody } from '../PostBody';
import { LANGUAGES, normalizeLanguage } from '../code';

const lowlight = createLowlight(common);
let lastLanguage = 'typescript';
import '../blog.css';

const EMPTY: Post = {
  slug: '',
  type: 'article',
  status: 'draft',
  title: '',
  subtitle: '',
  coverUrl: '',
  contentHtml: '',
  tags: [],
  externalUrl: '',
  readMinutes: 1,
  createdAt: 0,
  updatedAt: 0,
  publishedAt: null,
};

export function EditorPage() {
  const { slug } = useParams();
  const [initial, setInitial] = useState<Post | null>(slug ? null : EMPTY);
  const [session, setSession] = useState(0);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let alive = true;
    setMissing(false);
    if (!slug) {
      setInitial(EMPTY);
      setSession((n) => n + 1);
      return;
    }
    setInitial(null);
    getPost(slug).then(
      (p) => {
        if (!alive) return;
        if (p) {
          setInitial(p);
          setSession((n) => n + 1);
        } else setMissing(true);
      },
      () => alive && setMissing(true),
    );
    return () => {
      alive = false;
    };
  }, [slug]);

  if (missing) {
    return (
      <>
        <AdminBar />
        <main className="admin-main"><div className="empty"><h3>Post not found</h3><SiteLink site="blog" to="/admin" className="btn btn--primary">Back to posts</SiteLink></div></main>
      </>
    );
  }
  if (!initial) return <PageLoading />;
  return <PostEditor key={session} initial={initial} />;
}

function AutoTextarea({ className, value, onChange, placeholder, label, onEnter }: { className: string; value: string; onChange: (v: string) => void; placeholder: string; label: string; onEnter?: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      aria-label={label}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onEnter?.();
        }
      }}
    />
  );
}

function PostEditor({ initial }: { initial: Post }) {
  const [post, setPost] = useState<Post>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [published, setPublished] = useState<Post | null>(null);
  const [preview, setPreview] = useState(false);
  const [visibility, setVisibility] = useState<Exclude<PostStatus, 'draft'>>(initial.status === 'unlisted' ? 'unlisted' : 'published');
  const [tagDraft, setTagDraft] = useState('');
  const [toast, show] = useToast();
  const savedSlug = useRef(initial.slug);
  const savingRef = useRef(false);
  /** Bumped on every edit, so a save only clears "dirty" if nothing changed meanwhile. */
  const version = useRef(0);
  const touch = () => {
    version.current += 1;
    setDirty(true);
  };
  useDocumentTitle(`${post.title || 'New post'} — Editor`);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true }, codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight, HTMLAttributes: { spellcheck: 'false' } }),
      Image,
      Placeholder.configure({ placeholder: 'Tell your story…' }),
    ],
    content: initial.contentHtml,
    onUpdate: () => touch(),
    editorProps: { attributes: { class: 'prose tiptap', 'aria-label': 'Post body' } },
  });

  /** Enter in the title or subtitle continues writing at the top of the body. */
  const focusBody = () => {
    if (!editor || editor.isDestroyed) return;
    editor.view.dom.focus();
    editor.commands.setTextSelection(1);
  };

  const update = (patch: Partial<Post>) => {
    setPost((p) => {
      const next = { ...p, ...patch };
      if (patch.title !== undefined && !slugTouched) next.slug = slugify(patch.title);
      return next;
    });
    touch();
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function save(status: PostStatus) {
    if (!editor || savingRef.current) return;
    setError('');
    const title = post.title.trim();
    if (!title) {
      setError('Add a title before saving.');
      return;
    }
    let slug = slugify(post.slug || title);
    if (!slug) {
      setError('The URL needs at least one letter or number.');
      return;
    }
    if (RESERVED_SLUGS.includes(slug)) {
      setError(`/${slug} is reserved. Choose a different URL.`);
      return;
    }
    savingRef.current = true;
    const startVersion = version.current;
    setSaving(true);
    try {
      if (slug !== savedSlug.current && (await postExists(slug))) {
        if (slugTouched) {
          setError(`Another post already uses /${slug}. Choose a different URL.`);
          return;
        }
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
      const html = editor.getHTML();
      const saved = await savePost(
        { ...post, title, slug, status, contentHtml: html === '<p></p>' ? '' : html, readMinutes: readingMinutes(html) },
        savedSlug.current || undefined,
      );
      const slugChanged = savedSlug.current !== saved.slug;
      savedSlug.current = saved.slug;
      // Keep anything typed while the save was in flight; take only server-side fields.
      setPost((p) => ({ ...p, slug: saved.slug, status: saved.status, createdAt: saved.createdAt, updatedAt: saved.updatedAt, publishedAt: saved.publishedAt, readMinutes: saved.readMinutes }));
      setSlugTouched(true);
      setDirty(version.current !== startVersion);
      if (status === 'draft') show('Draft saved');
      else setPublished(saved);
      // Update the address bar without remounting the editor (a reload then opens this post).
      if (slugChanged) window.history.replaceState(window.history.state, '', sitePath('blog', `/admin/edit/${saved.slug}`));
    } catch (e) {
      setError(`Couldn't save: ${(e as Error).message}`);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save(post.status === 'draft' ? 'draft' : visibility);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function onCoverFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      show('Uploading cover…');
      update({ coverUrl: await uploadImage(file) });
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}. Paste an image URL instead.`);
    }
  }

  function addTags(raw: string) {
    const next = [...post.tags];
    for (const t of raw.split(',').map((x) => x.trim()).filter(Boolean)) {
      if (!next.includes(t) && next.length < 8) next.push(t);
    }
    if (next.length !== post.tags.length) update({ tags: next });
  }

  function addTag() {
    addTags(tagDraft);
    setTagDraft('');
  }

  function onTagChange(value: string) {
    if (!value.includes(',')) {
      setTagDraft(value);
      return;
    }
    const parts = value.split(',');
    const rest = parts.pop() ?? '';
    addTags(parts.join(','));
    setTagDraft(rest);
  }

  function onTagKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagDraft && post.tags.length) {
      update({ tags: post.tags.slice(0, -1) });
    }
  }

  const statusLabel = post.status === 'draft' ? 'Draft' : post.status === 'unlisted' ? 'Unlisted' : 'Published';
  const statusPill = post.status === 'draft' ? 'pill--attention' : post.status === 'unlisted' ? 'pill--neutral' : 'pill--success';
  const isLive = post.status !== 'draft';

  return (
    <>
      <AdminBar
        left={
          <>
            <SiteLink site="blog" to="/admin" className="btn btn--ghost btn--icon btn--sm" aria-label="Back to posts"><Icon name="arrowLeft" size={18} /></SiteLink>
            <strong className="admin-bar__hide-sm" style={{ fontSize: 14, fontWeight: 600 }}>{savedSlug.current ? 'Edit post' : 'New post'}</strong>
            <span className={`pill ${statusPill}`}>{statusLabel}</span>
            <span className="muted admin-bar__hide-sm" style={{ fontSize: 13 }} aria-live="polite">{saving ? 'Saving…' : dirty ? 'Unsaved changes' : savedSlug.current ? 'All changes saved' : ''}</span>
          </>
        }
        right={
          <>
            <button type="button" className="btn btn--ghost btn--sm" aria-pressed={preview} onClick={() => setPreview((v) => !v)}>
              <Icon name={preview ? 'pen' : 'eye'} />{preview ? 'Edit' : 'Preview'}
            </button>
            {!isLive && <button type="button" className="btn btn--outline btn--sm" disabled={saving} onClick={() => save('draft')}>Save draft</button>}
            {isLive && <button type="button" className="btn btn--outline btn--sm admin-bar__hide-sm" disabled={saving} onClick={() => save('draft')}>Unpublish</button>}
            <button type="button" className="btn btn--primary btn--sm" style={{ height: 36 }} disabled={saving} onClick={() => save(visibility)}>
              {isLive ? 'Update' : 'Publish'}
            </button>
          </>
        }
      />
      <div className="editor-layout">
        <main className="editor-main">
          <div className="editor-col">
            {error && <p className="notice notice--error" role="alert">{error}</p>}
            {post.coverUrl ? (
              <div className="cover-preview">
                <img src={post.coverUrl} alt="Cover" />
                {!preview && (
                  <div className="cover-preview__actions">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => update({ coverUrl: '' })}>Remove cover</button>
                  </div>
                )}
              </div>
            ) : (
              !preview && (
                <label className="cover-drop">
                  <Icon name="image" size={22} strokeWidth={1.8} />
                  Add a cover image
                  <input type="file" accept="image/*" className="sr-only" onChange={onCoverFile} />
                </label>
              )
            )}
            {preview ? (
              <>
                <h1 className="article__title">{post.title || 'Untitled'}</h1>
                {post.subtitle && <p className="article__sub">{post.subtitle}</p>}
              </>
            ) : (
              <>
                <AutoTextarea className="title-input" label="Title" placeholder="Title" value={post.title} onChange={(v) => update({ title: v })} onEnter={focusBody} />
                <AutoTextarea className="sub-input" label="Subtitle" placeholder="Add a subtitle (optional)" value={post.subtitle} onChange={(v) => update({ subtitle: v })} onEnter={focusBody} />
              </>
            )}
            {editor && !preview && <Toolbar editor={editor} onError={setError} />}
            <div style={{ display: preview ? 'none' : 'block' }}>
              <EditorContent editor={editor} />
            </div>
            {preview && editor && <PostBody html={editor.getHTML()} />}
          </div>
        </main>

        <aside className="editor-panel" aria-label="Post settings">
          <strong style={{ fontSize: 16, fontWeight: 600 }}>Post settings</strong>
          <div className="field">
            <span className="field__label" id="type-label">Type</span>
            <div className="segmented" role="radiogroup" aria-labelledby="type-label">
              {(['article', 'note'] as PostType[]).map((t) => (
                <button key={t} type="button" role="radio" aria-checked={post.type === t} onClick={() => update({ type: t })}>
                  {t === 'article' ? 'Article' : 'Note'}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="tag-input">Tags</label>
            <div className="chips-input">
              {post.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                  <button type="button" className="chip-x" aria-label={`Remove ${t}`} onClick={() => update({ tags: post.tags.filter((x) => x !== t) })}>×</button>
                </span>
              ))}
              <input id="tag-input" placeholder={post.tags.length ? '' : 'Add tag, press Enter'} value={tagDraft} onChange={(e) => onTagChange(e.target.value)} onKeyDown={onTagKey} onBlur={addTag} />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="slug-input">URL</label>
            <div style={{ display: 'flex', height: 40, border: '1px solid var(--c-border)', borderRadius: 4, background: '#fff', overflow: 'hidden' }}>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: 'var(--c-surface)', borderRight: '1px solid var(--c-border)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-text-2)' }}>{sitePath('blog', '/')}{sitePath('blog', '/').endsWith('/') ? '' : '/'}</span>
              <input
                id="slug-input"
                style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', padding: '0 10px', fontFamily: 'var(--font-mono)', fontSize: 12 }}
                value={post.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') });
                }}
                onBlur={() => update({ slug: slugify(post.slug) })}
              />
            </div>
            {isLive && <span className="field__hint">Changing the URL breaks links you've already shared.</span>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="cover-url">Cover image URL</label>
            <input id="cover-url" className="input" type="url" placeholder="https://…" value={post.coverUrl} onChange={(e) => update({ coverUrl: e.target.value })} />
          </div>
          <div className="field" role="radiogroup" aria-label="Visibility when published">
            <span className="field__label">Visibility when published</span>
            <label className="radio-card">
              <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 14, fontWeight: 500 }}>Public</span><span className="field__hint">Listed on your Writing page</span></span>
              <input type="radio" name="visibility" value="published" checked={visibility === 'published'} onChange={() => { setVisibility('published'); touch(); }} />
            </label>
            <label className="radio-card">
              <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 14, fontWeight: 500 }}>Unlisted</span><span className="field__hint">Only people with the link</span></span>
              <input type="radio" name="visibility" value="unlisted" checked={visibility === 'unlisted'} onChange={() => { setVisibility('unlisted'); touch(); }} />
            </label>
          </div>
          {isLive && (
            <a href={siteUrl('blog', `/${post.slug}`)} target="_blank" rel="noopener noreferrer" className="btn btn--outline">View live post <Icon name="external" /></a>
          )}
          <p className="field__hint">Tip: press ⌘S / Ctrl+S to save.</p>
        </aside>
      </div>
      {published && <PublishedDialog post={published} onClose={() => setPublished(null)} />}
      {toast}
    </>
  );
}

function Toolbar({ editor, onError }: { editor: Editor; onError: (msg: string) => void }) {
  const [, force] = useState(0);
  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    editor.on('selectionUpdate', rerender);
    editor.on('transaction', rerender);
    return () => {
      editor.off('selectionUpdate', rerender);
      editor.off('transaction', rerender);
    };
  }, [editor]);
  const fileRef = useRef<HTMLInputElement>(null);
  const chain = () => editor.chain().focus();

  const buttons: ({ key: string; label: string; icon?: IconName; text?: string; active?: boolean; run: () => void } | 'sep')[] = [
    { key: 'h2', label: 'Heading', text: 'H2', active: editor.isActive('heading', { level: 2 }), run: () => chain().toggleHeading({ level: 2 }).run() },
    { key: 'h3', label: 'Subheading', text: 'H3', active: editor.isActive('heading', { level: 3 }), run: () => chain().toggleHeading({ level: 3 }).run() },
    'sep',
    { key: 'b', label: 'Bold', text: 'B', active: editor.isActive('bold'), run: () => chain().toggleBold().run() },
    { key: 'i', label: 'Italic', text: 'I', active: editor.isActive('italic'), run: () => chain().toggleItalic().run() },
    { key: 'code', label: 'Inline code', text: '</>', active: editor.isActive('code'), run: () => chain().toggleCode().run() },
    {
      key: 'link',
      label: 'Link',
      icon: 'link',
      active: editor.isActive('link'),
      run: () => {
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link URL', prev ?? 'https://');
        if (url === null) return;
        if (!url) chain().extendMarkRange('link').unsetLink().run();
        else chain().extendMarkRange('link').setLink({ href: url }).run();
      },
    },
    'sep',
    { key: 'ul', label: 'Bulleted list', icon: 'list', active: editor.isActive('bulletList'), run: () => chain().toggleBulletList().run() },
    { key: 'ol', label: 'Numbered list', icon: 'listOrdered', active: editor.isActive('orderedList'), run: () => chain().toggleOrderedList().run() },
    { key: 'quote', label: 'Quote', icon: 'quote', active: editor.isActive('blockquote'), run: () => chain().toggleBlockquote().run() },
    { key: 'pre', label: 'Code block', icon: 'code', active: editor.isActive('codeBlock'), run: () => chain().toggleCodeBlock({ language: lastLanguage }).run() },
    { key: 'img', label: 'Image', icon: 'image', run: () => fileRef.current?.click() },
    { key: 'hr', label: 'Divider', text: '—', run: () => chain().setHorizontalRule().run() },
  ];

  async function onImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const src = await uploadImage(file);
      chain().setImage({ src, alt: file.name }).run();
    } catch (err) {
      const url = window.prompt(`Upload failed (${(err as Error).message}). Paste an image URL instead:`);
      if (url) chain().setImage({ src: url }).run();
      else onError('Image upload failed.');
    }
  }

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      {buttons.map((b, i) =>
        b === 'sep' ? (
          <span key={`sep-${i}`} className="toolbar__sep" aria-hidden="true" />
        ) : (
          <button key={b.key} type="button" className="toolbar__btn" aria-label={b.label} title={b.label} aria-pressed={b.active ?? undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={b.run}
            style={b.key === 'i' ? { fontStyle: 'italic' } : b.key === 'code' ? { fontFamily: 'var(--font-mono)', fontSize: 12 } : undefined}>
            {b.icon ? <Icon name={b.icon} /> : b.text}
          </button>
        ),
      )}
      {editor.isActive('codeBlock') && (
        <>
          <span className="toolbar__sep" aria-hidden="true" />
          <label className="sr-only" htmlFor="code-lang">Code language</label>
          <select
            id="code-lang"
            className="toolbar__select"
            value={normalizeLanguage(editor.getAttributes('codeBlock').language) || ''}
            onChange={(e) => {
              const language = e.target.value || null;
              if (language) lastLanguage = language;
              chain().updateAttributes('codeBlock', { language }).run();
            }}
          >
            <option value="">Auto-detect</option>
            {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onImage} />
    </div>
  );
}
