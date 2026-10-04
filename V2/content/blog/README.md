# Writing posts as Markdown

Every `.md` file here becomes a post on the site when it's pushed to `main`
(Netlify rebuilds; no Firestore needed). Posts written in the admin and posts
from these files show up together.

## Folders

The directory is the folder: `low-level-design/parking-lot.md` is listed under
**Low-level design** at `/blog/folders/low-level-design`. Nest folders freely
(`system-design/caching/lru.md`). Add a `_folder.md` to a directory to give it a
title, description and order:

```md
---
title: Low-level design
order: 1
---
Object-oriented design problems, worked through with code.
```

Post URLs are `/blog/<slug>` regardless of folder, so moving a file between
folders doesn't break links you've shared.

## A post

```md
---
title: Designing a parking lot
subtitle: Classes, responsibilities and the trade-offs between them.
date: 2026-10-05          # required
tags: [lld, oop, typescript]
cover: ./parking-lot.png  # optional; relative to this file, or an https:// URL
order: 1                  # optional; position inside its folder
slug: parking-lot         # optional; defaults to the file name
type: article             # article | note
status: published         # published | unlisted | draft (drafts only show in local dev)
---

Write normal Markdown here. Code blocks get syntax highlighting:

```ts
class ParkingLot { /* ... */ }
```

Images next to the file work too: ![Class diagram](./diagram.png)
```

Files starting with `_` (other than `_folder.md`) and this README are ignored.
The build fails with a clear message if a post is missing `title` or `date`, a
slug is duplicated, or a referenced image doesn't exist.
