import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
