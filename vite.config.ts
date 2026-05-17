import { defineConfig } from 'vite';
import pkg from './package.json';

// Em CI (GitHub Actions) o jogo é servido de /jogo-dungeon-of-echoes/game/
// Em dev local usa a raiz normalmente
const base = process.env.GITHUB_ACTIONS
  ? '/jogo-dungeon-of-echoes/game/'
  : '/';

export default defineConfig({
  base,
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
