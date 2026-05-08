/**
 * config.ts — Configuração do AIService
 *
 * A API key vem de variável de ambiente (Vite).
 * Para configurar, crie um arquivo .env.local na raiz:
 *
 * VITE_AI_API_KEY=sua-chave-aqui
 *
 * ⚠️ IMPORTANTE: .env.local deve estar no .gitignore
 */

export const AI_CONFIG = {
  API_KEY: import.meta.env.VITE_AI_API_KEY || '',
  ENABLED: !!import.meta.env.VITE_AI_API_KEY,
} as const;
