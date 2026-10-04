/**
 * Site map.
 *
 * - VITE_SITE_<KEY>_BASE: where an app that hosts the site mounts it
 *   (defaults: portfolio "/", projects "/projects", blog "/blog").
 * - VITE_SITE_<KEY>_URL: full URL of the site when a *different* app serves
 *   it, e.g. "https://blog.example.com" or "https://example.com/projects".
 *
 * Today one host serves everything under path prefixes. To move the blog to
 * its own subdomain, build apps/blog (it mounts the blog at "/") and set
 * VITE_SITE_BLOG_URL in the other apps — no code changes.
 */
export type SiteKey = 'portfolio' | 'projects' | 'blog';

interface SiteConfig {
  /** Mount path inside an app that hosts the site. */
  basePath: string;
  /** Full URL when another app serves the site ('' = same app). */
  url: string;
}

const env = import.meta.env;

function normalizeBase(base: string): string {
  const b = '/' + base.replace(/^\/+|\/+$/g, '');
  return b === '/' ? '/' : b;
}

function read(key: SiteKey, defaultBase: string): SiteConfig {
  const upper = key.toUpperCase();
  return {
    basePath: normalizeBase(String(env[`VITE_SITE_${upper}_BASE`] ?? defaultBase)),
    url: String(env[`VITE_SITE_${upper}_URL`] ?? '').replace(/\/+$/, ''),
  };
}

export const SITES: Record<SiteKey, SiteConfig> = {
  portfolio: read('portfolio', '/'),
  projects: read('projects', '/projects'),
  blog: read('blog', '/blog'),
};

let hosted: SiteKey[] = ['portfolio', 'projects', 'blog'];

/** Called once by each app to declare which sites it mounts. */
export function setHostedSites(keys: SiteKey[]) {
  hosted = keys;
}

function currentOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/** True when this app serves the site, so links can use client-side routing. */
export function isHosted(site: SiteKey): boolean {
  if (!hosted.includes(site)) return false;
  const { url } = SITES[site];
  if (!url) return true;
  try {
    return new URL(url).origin === currentOrigin();
  } catch {
    return false;
  }
}

function join(base: string, path: string): string {
  const [p, hash] = path.split('#');
  const clean = p.replace(/^\/+/, '');
  const joined = base === '/' || base === '' ? `/${clean}` : clean ? `${base}/${clean}` : base;
  return hash !== undefined ? `${joined}#${hash}` : joined;
}

/** Path of a page on a site this app hosts. */
export function sitePath(site: SiteKey, path = '/'): string {
  return join(SITES[site].basePath, path);
}

/** Absolute URL of a page on any site, for sharing and cross-site links. */
export function siteUrl(site: SiteKey, path = '/'): string {
  if (isHosted(site)) return currentOrigin() + sitePath(site, path);
  const { url } = SITES[site];
  if (!url) return currentOrigin() + sitePath(site, path);
  const u = new URL(url);
  return u.origin + join(normalizeBase(u.pathname), path);
}
