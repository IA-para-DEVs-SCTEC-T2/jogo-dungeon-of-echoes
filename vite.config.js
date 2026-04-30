/**
 * vite.config.js — Configuração do Vite
 * Build tool para desenvolvimento e produção.
 */

import { defineConfig } from 'vite';

export default defineConfig({
  // Servidor de desenvolvimento
  server: {
    port: 3000,
    open: true, // Abre o navegador automaticamente
  },

  // Build de produção
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },

  // Resolve para ES Modules
  resolve: {
    extensions: ['.js'],
  },
});
