import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://coperlm.github.io',
  base: '/dairy',
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
