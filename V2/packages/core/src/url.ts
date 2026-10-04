/** Returns the URL if it is an absolute http(s) link, else ''. Blocks javascript: and friends. */
export function safeUrl(url: string | undefined | null, { httpsOnly = false } = {}): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' || (!httpsOnly && u.protocol === 'http:')) return u.toString();
  } catch {
    /* not absolute */
  }
  return '';
}
