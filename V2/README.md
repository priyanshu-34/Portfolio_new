# Portfolio V2

Portfolio, projects and a personal writing platform for Priyanshu Singh. React + Vite + TypeScript, content in Firebase (Firestore, Auth, Storage).

## Quick start

```bash
cd V2
npm install
npm run dev          # http://localhost:5180 — every site under one domain
npm run dev:blog     # http://localhost:5182 — the blog alone, as on its own subdomain
```

Other scripts: `npm run build`, `npm run typecheck`, `npm test`, `npm run rules`, `npm run deploy:rules`.

`V2/.env` holds the `VITE_FIREBASE_*` keys and `VITE_ADMIN_EMAIL` (see `.env.example`). It is git-ignored.

## Layout

```
V2/
  apps/
    web/        host that mounts portfolio + projects + blog  (/, /projects, /blog)
    blog/       host that mounts only the blog at /           (blog subdomain)
  packages/
    core/       Firebase access, data types, seed content, site/URL config, hooks
    ui/         design tokens + shared components, router helper, shared images (public/)
    portfolio/  home page
    projects/   project list + case studies
    blog/       writing list, articles, sharing, and the owner-only admin
  firebase/     Firestore + Storage rules templates
```

Each site is a package that exports its routes. An app is a few lines: `createSiteRouter([['blog', blogRoutes]])`.

## Moving a site to its own subdomain

Links never hard-code paths; they go through `SiteLink` / `siteUrl(site, path)` in `@pf/core`, driven by env:

| Variable | Meaning | Default |
| --- | --- | --- |
| `VITE_SITE_<KEY>_BASE` | path the site is mounted at in an app that hosts it | `/`, `/projects`, `/blog` |
| `VITE_SITE_<KEY>_URL` | full URL of the site when a different app serves it | empty (same app) |

`<KEY>` is `PORTFOLIO`, `PROJECTS` or `BLOG`. Example: once the blog lives on `blog.example.com`, the main app sets `VITE_SITE_BLOG_URL=https://blog.example.com` and every blog link points there; `apps/blog` mounts the blog at `/` and needs `VITE_SITE_PORTFOLIO_URL=https://example.com` and `VITE_SITE_PROJECTS_URL=https://example.com/projects` (its production build fails without them). To split projects out too, copy `apps/blog`, mount `projectsRoutes`, and set `VITE_SITE_PROJECTS_URL` in the other apps. Add each subdomain to Firebase Auth's authorized domains; the admin signs in separately on each origin.

## Data

Everything is stored under the Firestore document `sites/portfolio`, so it is isolated from any other app in the same Firebase project:

- `sites/portfolio` — profile, metrics, education
- `sites/portfolio/{experience,awards,skills,projects}/{id}`
- `sites/portfolio/posts/{slug}` — posts written in the admin (the slug is the document id); `status` is `draft | published | unlisted`; `type` is `article | note | medium`; `folder` groups posts
- `sites/portfolio/subscribers/{id}` — newsletter sign-ups
- Storage `sites/portfolio/uploads/*` — images from the editor

The site paints instantly from the last content the browser saw (or from the bundled resume content in `packages/core/src/seed.ts` on a first visit) and refreshes from Firestore. If Firestore is empty or unreachable it keeps showing the bundled content.

To load the resume content into Firestore: sign in at `/blog/admin` and click **Import starter content** (shown only while Firestore has no portfolio document).

## Writing from Markdown

Posts can also be Markdown files in `content/blog/**` — push to `main` and Netlify publishes them, no Firestore involved. Directories become folders and post URLs follow them (`content/blog/low-level-design/parking-lot.md` → `/blog/low-level-design/parking-lot`; root files → `/blog/<slug>`), and `_folder.md` sets a folder's title, description and order. Front matter, images and rules: [content/blog/README.md](content/blog/README.md). The build plugin is `tools/blog-posts-plugin.ts`.

## Writing (owner only)

- `/blog/admin/sign-in` — Google or GitHub sign-in; only emails in `VITE_ADMIN_EMAIL` get in (enforced by the Firestore/Storage rules, not just the UI).
- `/blog/admin` — posts table, attach Medium posts (reads your Medium RSS feed, or add by link), import starter content.
- `/blog/admin/new`, `/blog/admin/edit/:slug` — rich-text editor (headings, lists, quotes, code, images, links), tags, URL, cover image, public/unlisted, ⌘S to save.
- Readers can only share posts (copy link, LinkedIn, X, WhatsApp, email, native share) — no comments or likes.

## Firebase setup

1. In Firebase Console → Authentication, enable **Google** (and optionally **GitHub**) sign-in, and add your domains to *Authorized domains*.
2. `npm run rules` renders `firebase/firestore.rules` and `firebase/storage.rules` with your admin email. Because this Firebase project (`interview-dsa`) also serves the DSA app, its existing rules are kept in `firebase/base.firestore.rules` and the portfolio block is merged into them — deploying never removes the DSA app's rules. If you change the DSA app's rules, update that file too.
3. `npm run deploy:rules` deploys Firestore rules. Storage isn't enabled on the project yet; after enabling it, run `npm run deploy:storage-rules` (until then, cover images are added by URL).

## Deploy (Netlify)

`netlify.toml` builds `apps/web`. For a blog subdomain, add a second Netlify site from the same repo with base `V2`, command `npm run build:blog`, publish `apps/blog/dist`, and set `VITE_SITE_PORTFOLIO_URL` / `VITE_SITE_PROJECTS_URL` in its environment (and `VITE_SITE_BLOG_URL` on the main site).

Shared links show the site-wide title and image: the site is a single-page app, so per-post link previews would need prerendering or SSR.
