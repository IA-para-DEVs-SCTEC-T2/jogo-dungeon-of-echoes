/**
 * PlayerMetrics.ts — Coleta e análise de métricas de desempenho do jogador
 * Fase 5: IA Adaptativa
 *
 * Responsabilidade única: rastrear o que o jogador fez e calcular
 * um score de performance normalizado entre -100 e +100.
 */

export class PlayerMetrics {
  // ─── Métricas acumuladas ─────────────────────────────────────────────────
  turnsSurvived: number  = 0;
  damageDealt:   number  = 0;
  damageTaken:   number  = 0;
  enemiesKilled: number  = 0;
  itemsUsed:     number  = 0;
  deaths:        number  = 0;

  // ─── Janela deslizante (últimos N turnos para adaptação rápida) ──────────
  private readonly _windowSize = 20;
  private _recentDamageDealt: number[] = [];
  private _recentDamageTaken: number[] = [];

  // ─── Registro de eventos ─────────────────────────────────────────────────

  recordTurn(): void {
    this.turnsSurvived++;
  }

  recordDamageDealt(amount: number): void {
    this.damageDealt += amount;
    this._recentDamageDealt.push(amount);
    if (this._recentDamageDealt.length > this._windowSize) {
      this._recentDamageDealt.shift();
    }
  }

  recordDamageTaken(amount: number): void {
    this.damageTaken += amount;
    this._recentDamageTaken.push(amount);
    if (this._recentDamageTaken.length > this._windowSize) {
      this._recentDamageTaken.shift();
    }
  }

  recordEnemyKilled(): void {
    this.enemiesKilled++;
  }

  recordItemUsed(): void {
    this.itemsUsed++;
  }

  recordDeath(): void {
    this.deaths++;
  }

  // ─── Score de performance ────────────────────────────────────────────────

  /**
   * Calcula score de performance baseado nas métricas acumuladas.
   * Fórmula: (damageDealt * 1.2) - (damageTaken * 1.0) + (enemiesKilled * 5) + (turnsSurvived * 0.5)
   * Normalizado para o range -100 → +100.
   */
  getPerformanceScore(): number {
    const raw =
      this.damageDealt   * 1.2 +
      this.enemiesKilled * 5.0 +
      this.turnsSurvived * 0.5 -
      this.damageTaken   * 1.0 -
      this.deaths        * 20.0;

    // Normalizar: clamp entre -100 e +100
    return Math.max(-100, Math.min(100, raw / 10));
  }

  /**
   * Score baseado apenas na janela recente (últimos N turnos).
   * Mais responsivo para adaptação em tempo real.
   */
  getRecentPerformanceScore(): number {
    const recentDealt = this._recentDamageDealt.reduce((a, b) => a + b, 0);
    const recentTaken = this._recentDamageTaken.reduce((a, b) => a + b, 0);
    const raw = recentDealt * 1.2 - recentTaken * 1.0;
    return Math.max(-100, Math.min(100, raw / 5));
  }

  /**
   * Reseta métricas para nova sessão.
   */
  reset(): void {
    this.turnsSurvived  = 0;
    this.damageDealt    = 0;
    this.damageTaken    = 0;
    this.enemiesKilled  = 0;
    this.itemsUsed      = 0;
    this.deaths         = 0;
    this._recentDamageDealt = [];
    this._recentDamageTaken = [];
  }
}
