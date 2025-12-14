import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    server: {
      fs: {
        strict: false,
      },
    },
  },
});

