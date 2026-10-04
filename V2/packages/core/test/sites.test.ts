import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadSites(env: Record<string, string> = {}) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import('../src/sites');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('one host serving every site', () => {
  it('mounts sites under path prefixes', async () => {
    const { sitePath, isHosted } = await loadSites();
    expect(sitePath('portfolio', '/')).toBe('/');
    expect(sitePath('portfolio', '/#contact')).toBe('/#contact');
    expect(sitePath('projects', '/')).toBe('/projects');
    expect(sitePath('projects', '/hotel-com')).toBe('/projects/hotel-com');
    expect(sitePath('blog', '/admin/edit/x')).toBe('/blog/admin/edit/x');
    expect(isHosted('blog')).toBe(true);
  });

  it('normalises base paths written with or without slashes', async () => {
    const { sitePath } = await loadSites({ VITE_SITE_PROJECTS_BASE: 'work/' });
    expect(sitePath('projects', '/')).toBe('/work');
    expect(sitePath('projects', 'x')).toBe('/work/x');
  });
});

describe('blog moved to its own subdomain', () => {
  it('main host links to the blog subdomain root, not /blog', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.com' } });
    const { siteUrl, isHosted } = await loadSites({ VITE_SITE_BLOG_URL: 'https://blog.example.com/' });
    expect(isHosted('blog')).toBe(false);
    expect(siteUrl('blog', '/my-post')).toBe('https://blog.example.com/my-post');
    expect(siteUrl('projects', '/x')).toBe('https://example.com/projects/x');
  });

  it('blog app serves from the root and links back to the main host', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://blog.example.com' } });
    const { sitePath, siteUrl, isHosted, setHostedSites } = await loadSites({
      VITE_SITE_BLOG_BASE: '/',
      VITE_SITE_BLOG_URL: 'https://blog.example.com',
      VITE_SITE_PORTFOLIO_URL: 'https://example.com',
      VITE_SITE_PROJECTS_URL: 'https://example.com/projects',
    });
    setHostedSites(['blog']);
    expect(isHosted('blog')).toBe(true);
    expect(sitePath('blog', '/my-post')).toBe('/my-post');
    expect(siteUrl('blog', '/my-post')).toBe('https://blog.example.com/my-post');
    expect(isHosted('portfolio')).toBe(false);
    expect(siteUrl('portfolio', '/#experience')).toBe('https://example.com/#experience');
    expect(siteUrl('projects', '/hotel-com')).toBe('https://example.com/projects/hotel-com');
  });
});
