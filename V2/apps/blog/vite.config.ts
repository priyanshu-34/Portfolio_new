import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { blogPosts } from '../../tools/blog-posts-plugin.ts';
import { fileURLToPath } from 'node:url';

const root = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * The blog served from the root of its own subdomain. Links to the other
 * sites use VITE_SITE_PORTFOLIO_URL / VITE_SITE_PROJECTS_URL; in dev they
 * default to the main host on :5180.
 */
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, root('../..'), 'VITE_'), ...process.env };
  const dev = mode === 'development';
  const defaults: Record<string, string> = { PORTFOLIO: 'http://localhost:5180', PROJECTS: 'http://localhost:5180/projects' };
  const url = (key: string) => {
    const value = env[`VITE_SITE_${key}_URL`] || (dev ? defaults[key] : '');
    if (!value) throw new Error(`apps/blog: set VITE_SITE_${key}_URL so links to the ${key.toLowerCase()} site work.`);
    return value;
  };
  return {
    plugins: [react(), blogPosts({ dir: root('../../content/blog'), editBase: 'https://github.com/priyanshu-34/Portfolio_new/edit/main/V2/content/blog' })],
    envDir: root('../..'),
    publicDir: root('../../packages/ui/public'),
    define: {
      'import.meta.env.VITE_SITE_BLOG_BASE': JSON.stringify('/'),
      'import.meta.env.VITE_SITE_PORTFOLIO_URL': JSON.stringify(url('PORTFOLIO')),
      'import.meta.env.VITE_SITE_PROJECTS_URL': JSON.stringify(url('PROJECTS')),
    },
  };
});
