import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { blogPosts } from '../../tools/blog-posts-plugin.ts';
import { fileURLToPath } from 'node:url';

const root = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react(), blogPosts({ dir: root('../../content/blog'), editBase: 'https://github.com/priyanshu-34/Portfolio_new/edit/main/V2/content/blog' })],
  // One .env at the V2 root is shared by every app.
  envDir: root('../..'),
  // Images used by every site live in the shared UI package.
  publicDir: root('../../packages/ui/public'),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase';
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run\/router)\//.test(id)) return 'react';
        },
      },
    },
  },
});
