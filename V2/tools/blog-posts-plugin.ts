/**
 * Vite plugin: turns Markdown files under content/blog into blog posts.
 *
 *   content/blog/<folder>/<slug>.md   → a post in <folder>
 *   content/blog/<folder>/_folder.md  → that folder's title/description/order
 *
 * Exposes `virtual:blog-posts` (metadata for every post and folder) and one
 * lazily loaded `virtual:blog-post/<slug>` module per post body (HTML rendered
 * at build time, so no Markdown parser ships to the browser).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, basename, resolve, sep } from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import type { Plugin } from 'vite';

interface Options {
  /** Absolute path of the content directory. */
  dir: string;
  /** Base URL for "Edit on GitHub" links, e.g. https://github.com/u/r/edit/main/V2/content/blog */
  editBase?: string;
}

interface RepoPost {
  slug: string;
  file: string;
  folder: string;
  meta: Record<string, unknown>;
  body: string;
}

const LIST_ID = 'virtual:blog-posts';
const POST_PREFIX = 'virtual:blog-post/';
const RESERVED = new Set(['admin', 'folders']);

const marked = new Marked({ gfm: true });

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name.endsWith('.md') ? [full] : [];
  });
}

const toPosix = (p: string) => p.split(sep).join('/');
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9/]+/g, '-').replace(/^-+|-+$/g, '');
const isRelative = (src: string) => !!src && !/^([a-z]+:|\/\/|\/|#|data:)/i.test(src);

function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function toMillis(value: unknown, file: string): number {
  const ms = value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (!Number.isFinite(ms)) throw new Error(`[blog] ${file}: front matter needs a valid "date" (e.g. 2026-10-05).`);
  return ms;
}

export function blogPosts({ dir, editBase }: Options): Plugin {
  let isProduction = false;

  function collect() {
    const files = walk(dir);
    const posts: RepoPost[] = [];
    const folders: { path: string; title?: string; description?: string; order?: number }[] = [];
    for (const file of files) {
      const rel = toPosix(relative(dir, file));
      const folder = toPosix(dirname(rel)) === '.' ? '' : slugify(toPosix(dirname(rel)));
      const name = basename(file, '.md');
      const { data, content } = matter(readFileSync(file, 'utf8'));
      if (name === '_folder') {
        folders.push({ path: folder, title: data.title, description: data.description ?? content.trim(), order: data.order });
        continue;
      }
      if (name.startsWith('_') || name.toLowerCase() === 'readme') continue;
      if (RESERVED.has(folder.split('/')[0])) throw new Error(`[blog] ${rel}: folder "${folder.split('/')[0]}" is reserved; rename the directory.`);
      const status = String(data.status ?? 'published');
      if (status === 'draft' && isProduction) continue;
      const slug = slugify(String(data.slug ?? name)).replace(/\//g, '-');
      if (!slug || RESERVED.has(slug)) throw new Error(`[blog] ${rel}: slug "${slug}" is empty or reserved.`);
      if (!data.title) throw new Error(`[blog] ${rel}: front matter needs a "title".`);
      posts.push({ slug, file, folder, meta: data, body: content });
    }
    const seen = new Map<string, string>();
    for (const p of posts) {
      const prev = seen.get(p.slug);
      if (prev) throw new Error(`[blog] Duplicate slug "${p.slug}" in ${prev} and ${p.file}.`);
      seen.set(p.slug, p.file);
    }
    return { posts, folders };
  }

  /** Imports for relative image paths so Vite bundles them; returns code + a resolver. */
  function assetImports(baseFile: string, srcs: string[], prefix: string) {
    const imports: string[] = [];
    const names = new Map<string, string>();
    srcs.forEach((src) => {
      if (names.has(src)) return;
      const abs = resolve(dirname(baseFile), decodeURI(src));
      if (!existsSync(abs)) throw new Error(`[blog] ${baseFile}: image not found: ${src}`);
      const id = `${prefix}${names.size}`;
      names.set(src, id);
      imports.push(`import ${id} from ${JSON.stringify(toPosix(abs))};`);
    });
    return { imports, names };
  }

  return {
    name: 'blog-posts',
    configResolved(config) {
      isProduction = config.command === 'build';
    },
    resolveId(id) {
      if (id === LIST_ID || id.startsWith(POST_PREFIX)) return `\0${id}`;
    },
    load(id) {
      if (id === `\0${LIST_ID}`) {
        const { posts, folders } = collect();
        const code: string[] = [];
        const list = posts.map((p, i) => {
          const m = p.meta;
          const cover = typeof m.cover === 'string' ? m.cover : '';
          let coverExpr = JSON.stringify(cover);
          if (isRelative(cover)) {
            const { imports, names } = assetImports(p.file, [cover], `cover${i}_`);
            code.push(...imports);
            coverExpr = names.get(cover)!;
          }
          const date = toMillis(m.date, toPosix(relative(dir, p.file)));
          const updated = m.updated ? toMillis(m.updated, p.file) : date;
          const html = marked.parse(p.body) as string;
          const fields = {
            slug: p.slug,
            source: 'repo',
            type: m.type === 'note' ? 'note' : 'article',
            status: ['draft', 'unlisted'].includes(String(m.status)) ? m.status : 'published',
            title: String(m.title),
            subtitle: String(m.subtitle ?? m.description ?? ''),
            tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
            folder: p.folder,
            order: typeof m.order === 'number' ? m.order : null,
            externalUrl: '',
            readMinutes: readingMinutes(html),
            createdAt: date,
            updatedAt: updated,
            publishedAt: date,
            editUrl: editBase ? `${editBase.replace(/\/$/, '')}/${toPosix(relative(dir, p.file))}` : '',
          };
          return `{ ...${JSON.stringify(fields)}, coverUrl: ${coverExpr} }`;
        });
        const loaders = posts.map((p) => `${JSON.stringify(p.slug)}: () => import(${JSON.stringify(POST_PREFIX + p.slug)})`);
        code.push(
          `export const repoPosts = [${list.join(',\n')}];`,
          `export const repoFolders = ${JSON.stringify(folders)};`,
          `export const repoLoaders = {${loaders.join(',\n')}};`,
        );
        return code.join('\n');
      }
      if (id.startsWith(`\0${POST_PREFIX}`)) {
        const slug = id.slice(POST_PREFIX.length + 1);
        const post = collect().posts.find((p) => p.slug === slug);
        if (!post) return 'export default "";';
        let html = marked.parse(post.body) as string;
        const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]).filter(isRelative);
        const { imports, names } = assetImports(post.file, srcs, 'img');
        const parts: string[] = [];
        for (const [src, name] of names) {
          const token = `__BLOG_IMG_${name}__`;
          html = html.split(`src="${src}"`).join(`src="${token}"`);
          parts.push(`.split(${JSON.stringify(token)}).join(${name})`);
        }
        return `${imports.join('\n')}\nexport default ${JSON.stringify(html)}${parts.join('')};`;
      }
    },
    configureServer(server) {
      server.watcher.add(dir);
      const reload = (file: string) => {
        if (!file.startsWith(dir)) return;
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', reload);
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },
  };
}
