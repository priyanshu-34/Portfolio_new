---
name: write-blog-post
description: Create, edit, move or delete a Markdown blog post (or a folder of posts) in V2/content/blog for priyans34.in. Use whenever the user asks to write, draft, add, publish, convert or reorganise a blog post or blog folder as a file in the repo — e.g. "write a post on LRU caches in low-level-design", "add a system-design folder", "move this post", "turn these notes into a blog".
---

# Write a Markdown blog post

Posts in `V2/content/blog/` are rendered into the site at build time by
`V2/tools/blog-posts-plugin.ts` and go live when `main` is pushed (Netlify).
They appear alongside posts written in the browser admin (Firestore).

## 1. Decide where it goes

| Want | File | URL |
| --- | --- | --- |
| No folder | `V2/content/blog/<slug>.md` | `/blog/<slug>` |
| In a folder | `V2/content/blog/<folder>/<slug>.md` | `/blog/<folder>/<slug>` |
| Nested | `V2/content/blog/<a>/<b>/<slug>.md` | `/blog/<a>/<b>/<slug>` |

- Folder and file names: lowercase, words joined by `-` (`low-level-design`).
- Look at existing folders first (`ls -R V2/content/blog`) and reuse one when the
  topic fits. If the user names a folder, use it.
- `admin` and `folders` are reserved — never use them as a slug or top-level folder.

## 2. Check the slug is free

The slug (file name without `.md`, or `slug:` in front matter) must be unique
across the whole blog:

```bash
cd V2
find content/blog -name '*.md' ! -name '_*' ! -name 'README.md' -exec basename {} .md \; | sort   # slugs from file names
grep -rn '^slug:' content/blog --exclude=README.md                                                                  # overridden slugs
```

Posts written in the admin live in Firestore and can't be listed from here. If a
duplicate is possible (common topic, e.g. `intro`), make the slug specific
(`lru-cache-design`). A clash with a repo post fails the build.

## 3. Create the folder (only if new)

Add `V2/content/blog/<folder>/_folder.md`:

```md
---
title: Low-level design
order: 1
---
One or two sentences describing what this folder covers.
```

`order` sorts folder cards (lower first). The body is the description.

## 4. Write the post

```md
---
title: Designing an LRU cache
subtitle: One sentence that sells the post.
date: 2026-10-05
tags: [lld, caching, typescript]
order: 3
---

Opening paragraph: the problem and why it matters.

## Section heading

Body text…

```ts
class LRUCache<K, V> { /* … */ }
```
```

Front matter:

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Shown as the H1 — don't repeat it as `#` in the body. |
| `date` | yes | `YYYY-MM-DD`. Use today's date for a new post unless told otherwise. |
| `subtitle` | no | One line under the title and in listings (`description` also works). |
| `tags` | no | 2–5 lowercase tags. |
| `order` | no | Position inside its folder; posts without it follow, oldest first. Set it for series. |
| `cover` | no | `./image.png` next to the file, or an `https://` URL. |
| `slug` | no | Only to override the file name. |
| `type` | no | `article` (default) or `note` for short posts. |
| `status` | no | `published` (default), `unlisted` (link-only), `draft` (local dev only, never deployed). |
| `updated` | no | `YYYY-MM-DD` of a significant revision. |

Writing rules:
- Start body headings at `##` (the title is the H1). Use `###` below that.
- Every code fence needs a language: `ts`, `js`, `cpp`, `c`, `java`, `python`,
  `go`, `rust`, `bash`, `json`, `yaml`, `sql`, `html`, `css`, `markdown`, `text`.
- Images: put files next to the post and reference them relatively
  (`![Class diagram](./lru-diagram.png)`), always with alt text. Missing files fail the build.
- Write in the owner's voice: first person, practical, concise. Don't invent
  results, numbers or employer details — ask, or leave a clearly marked TODO
  and tell the user.
- GitHub-flavoured Markdown works: tables, task lists, strikethrough, autolinks.

## 5. Verify

```bash
cd V2 && npm run build
```

The build fails with a `[blog]` message for a missing `title`/`date`, a
duplicate or reserved slug, a reserved folder, or a missing image. To preview,
run `npm run dev` and open `http://localhost:5180/blog/<folder>/<slug>`
(drafts show here too).

## 6. Hand off

Tell the user the file path and the URL it will have
(`https://priyans34.in/blog/<folder>/<slug>`). Commit or push only if they ask;
pushing to `main` deploys it.

## Editing, moving, deleting

- **Edit**: change the file; bump `updated:` for meaningful changes.
- **Move to another folder**: move the file (`git mv`). The old URL redirects to
  the new one automatically, so shared links keep working. Keep the slug unless asked.
- **Rename the slug**: changes the URL and breaks old links — warn the user first.
- **Delete**: remove the file (and its images). Remove `_folder.md` only if the
  folder is now empty.
- Posts written in the browser admin are in Firestore, not here — edit those at
  `https://priyans34.in/blog/admin`.
