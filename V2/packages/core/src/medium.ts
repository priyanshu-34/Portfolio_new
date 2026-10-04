export interface MediumItem {
  title: string;
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
      link: safeUrl(String(item.link ?? '').split('?')[0], { httpsOnly: true }),
      subtitle: text.slice(0, 180) + (text.length > 180 ? '…' : ''),
      image: safeUrl(img, { httpsOnly: true }),
      publishedAt: Date.parse(String(item.pubDate ?? '').replace(' ', 'T') + 'Z') || Date.now(),
      tags: Array.isArray(item.categories) ? (item.categories as string[]).slice(0, 5) : [],
    };
  }).filter((item) => item.link);
}

export function mediumHandle(url: string | undefined): string {
  return url?.match(/medium\.com\/(@[^/?#]+)/)?.[1] ?? '';
}
