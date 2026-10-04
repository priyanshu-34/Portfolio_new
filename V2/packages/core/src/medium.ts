export interface MediumItem {
  title: string;
  /** Full post HTML from the feed. */
  contentHtml: string;
  link: string;
  subtitle: string;
  image: string;
  publishedAt: number;
  tags: string[];
}

/**
 * Reads a Medium profile's public RSS feed. Medium does not send CORS headers,
 * so the feed is fetched through the public rss2json converter.
 */
import { safeUrl } from './url';

export async function fetchMediumFeed(username: string): Promise<MediumItem[]> {
  const handle = username.replace(/^@/, '');
  const feed = encodeURIComponent(`https://medium.com/feed/@${handle}`);
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feed}`);
  if (!res.ok) throw new Error(`Medium feed request failed (${res.status})`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error(json.message || 'Medium feed unavailable');
  return (json.items as Record<string, unknown>[]).map((item) => {
    const html = String(item.description ?? item.content ?? '');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    // Medium's feed appends a tracking pixel to every post; skip it.
    const img = String(item.thumbnail || imgs.find((src) => !src.includes('/_/stat')) || '');
    return {
      title: String(item.title ?? ''),
      contentHtml: String(item.content ?? ''),
      link: safeUrl(String(item.link ?? '').split('?')[0], { httpsOnly: true }),
      subtitle: text.slice(0, 180) + (text.length > 180 ? '…' : ''),
      image: safeUrl(img, { httpsOnly: true }),
      publishedAt: Date.parse(String(item.pubDate ?? '').replace(' ', 'T') + 'Z') || Date.now(),
      tags: Array.isArray(item.categories) ? (item.categories as string[]).slice(0, 5) : [],
    };
  }).filter((item) => item.link);
}

export interface ImportedArticle {
  title: string;
  subtitle: string;
  coverUrl: string;
  contentHtml: string;
}

/**
 * Turns a Medium feed post into article fields for this site: the leading
 * title heading, cover figure and italic dek become title, cover and
 * subtitle; headings shift to the site's levels; code keeps its line breaks;
 * Medium's tracking pixel is dropped; a link back to the original is added.
 */
export function mediumToArticle(item: MediumItem): ImportedArticle {
  const doc = new DOMParser().parseFromString(`<body>${item.contentHtml}</body>`, 'text/html');
  const body = doc.body;
  const firstElement = () => body.firstElementChild;

  let title = item.title.replace(/…$/, '');
  const head = firstElement();
  if (head && /^H[1-4]$/.test(head.tagName)) {
    title = head.textContent?.trim() || title;
    head.remove();
  }

  let coverUrl = item.image;
  const fig = firstElement();
  if (fig?.tagName === 'FIGURE') {
    coverUrl = safeUrl(fig.querySelector('img')?.getAttribute('src'), { httpsOnly: true }) || coverUrl;
    fig.remove();
  }

  let subtitle = '';
  const dek = firstElement();
  if (dek?.tagName === 'P' && dek.children.length === 1 && dek.firstElementChild?.tagName === 'EM' && dek.textContent?.trim() === dek.firstElementChild.textContent?.trim()) {
    subtitle = dek.textContent?.trim() ?? '';
    dek.remove();
  }

  body.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? '';
    if (src.includes('/_/stat') || !safeUrl(src, { httpsOnly: true })) img.remove();
  });
  // Medium uses h3/h4 for sections; this site uses h2/h3.
  body.querySelectorAll('h3, h4').forEach((h) => {
    const next = doc.createElement(h.tagName === 'H3' ? 'h2' : 'h3');
    next.innerHTML = h.innerHTML;
    h.replaceWith(next);
  });
  body.querySelectorAll('pre').forEach((pre) => {
    const text = pre.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    const tmp = doc.createElement('div');
    tmp.innerHTML = text;
    const code = doc.createElement('code');
    code.textContent = tmp.textContent ?? '';
    pre.replaceChildren(code);
  });
  body.querySelectorAll('figure').forEach((f) => f.querySelector('img') ? f.replaceWith(...[...f.querySelectorAll('img')]) : f.remove());

  const link = safeUrl(item.link, { httpsOnly: true });
  if (link) {
    body.insertAdjacentHTML('beforeend', `<hr><p><em>Originally published on <a href="${link}" target="_blank" rel="noopener noreferrer">Medium</a>.</em></p>`);
  }
  const dekText = subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : item.subtitle;
  return { title, subtitle: dekText, coverUrl, contentHtml: body.innerHTML.trim() };
}

export function mediumHandle(url: string | undefined): string {
  return url?.match(/medium\.com\/(@[^/?#]+)/)?.[1] ?? '';
}
