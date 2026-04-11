// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://pixelverse.blog',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    mdx({
      extendMarkdownConfig: true,
    }),
    react(),
    tailwind(),
    // sitemap plugin temporarily disabled - will re-enable after route stabilization
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/data/**', '**/.git/**'],
      },
    },
    ssr: {
      // sandpack externalized by default - no longer needs noExternal
    },
  },
});
