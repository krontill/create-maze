import { defineConfig } from 'vite';
import { resolve } from 'path';

const pagesBase = process.env.GITHUB_ACTIONS ? '/maze-builder/' : '/';

export default defineConfig({
  base: pagesBase,
  root: 'sandbox',
  build: {
    outDir: resolve('dist-sandbox'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'sandbox/index.html'),
        compare: resolve(__dirname, 'sandbox/compare.html'),
        visualizer: resolve(__dirname, 'sandbox/visualizer.html'),
        formats: resolve(__dirname, 'sandbox/formats.html'),
        game: resolve(__dirname, 'sandbox/game.html'),
      },
    },
  },
});
