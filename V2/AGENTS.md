# Portfolio V2 — guide for AI agents

Personal site of Priyanshu Singh (backend engineer): portfolio, projects and a
blog. Live at https://priyans34.in (Netlify, deploys on every push to `main`).
Everything lives in this `V2/` folder; the repo root holds the old site — don't touch it.

## Stack and layout

React 18 + Vite + TypeScript, npm workspaces. Content in Firebase (Firestore,
Auth) plus Markdown files in the repo.

```
apps/web/          host: portfolio (/), projects (/projects), blog (/blog)
apps/blog/         the blog alone, for a future blog subdomain
packages/core/     data access (Firestore + repo posts), types, seed content, site URLs
packages/ui/       design tokens, shared components, shared images (public/)
packages/portfolio/  home page
packages/projects/   project list + case studies
packages/blog/       writing pages, sharing, owner-only admin (/blog/admin)
content/blog/        Markdown blog posts  ← see "Blog posts" below
tools/blog-posts-plugin.ts   Vite plugin that turns content/blog into posts
firebase/            Firestore/Storage rules templates (+ base rules of a shared app)
```

## Commands (run in V2/)

```bash
npm run dev          # http://localhost:5180
npm run typecheck
npm test             # vitest
npm run build        # also validates every Markdown post
```

Before calling work done: `npm run typecheck && npm test && npm run build` must pass.

## Conventions

- Design system: Contentstack Personalize tokens in `packages/ui/src/styles.css`
  (purple `#6c5ce7`, blue-grey neutrals, Inter + IBM Plex Mono, 4/6/8px radii,
  1px borders, no gradients, no emoji). Reuse existing classes before adding CSS.
- Links between sites go through `SiteLink` / `siteUrl()` / `sitePath()` from
  `@pf/core` — never hard-code `/blog/...` or `/projects/...`. Post links use
  `postPath(post)`; folder links use `folderPath(path)`.
- Portfolio content (profile, experience, awards, skills, projects) is in
  `packages/core/src/seed.ts`. The live site reads Firestore, so after changing
  it the owner must click **Sync portfolio content from code** in `/blog/admin`.
  Say so when you change seed.ts.
- Never commit `.env` or generated `firebase/*.rules`. Firebase web config is
  public by design; real secrets must never enter the repo.
- Don't deploy Firebase rules or push to `main` unless the user asks. The
  Firebase project is shared with another app: rules are merged into
  `firebase/base.firestore.rules` by `npm run rules` — never deploy a file that
  drops that app's rules.

## Blog posts

Two sources, shown together on the site:
1. **Admin** — written in the browser at `/blog/admin`, stored in Firestore.
2. **Markdown** — files in `content/blog/`, published by pushing to `main`.

For creating, editing or moving Markdown posts, follow the `write-blog-post`
skill (`.claude/skills/write-blog-post/SKILL.md` at the repo root). Rules in brief:

- The directory is the folder, and the URL follows it:
  `content/blog/low-level-design/parking-lot.md` → `/blog/low-level-design/parking-lot`;
  a file directly in `content/blog/` → `/blog/<slug>`; folder page → `/blog/<folder>`.
- Front matter: `title` and `date` (YYYY-MM-DD) are required. Optional:
  `subtitle`, `tags`, `cover`, `order`, `slug`, `type` (article|note),
  `status` (published|unlisted|draft), `updated`.
- Slug = file name (or `slug:`), lowercase-hyphenated, unique across the whole
  blog (including admin posts). `admin` and `folders` are reserved as slugs and
  as top-level folder names.
- `_folder.md` in a directory sets that folder's `title`, `order` and
  description (the body). Other `_*` files and `README.md` are ignored.
- Code fences need a language (` ```ts `) for correct highlighting.
- Full reference: `content/blog/README.md`.
