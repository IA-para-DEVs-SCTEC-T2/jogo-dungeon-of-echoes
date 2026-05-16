import * as Phaser from 'phaser';
import { SPRITES, DEV_CONFIG } from '../utils/constants';
import { FLOOR_ATLAS, OBJECT_ATLAS, NPC_ATLAS } from '../config/sprites-config';
import { ENEMY_DEFS, CATEGORY_TEXTURE_KEYS, buildAnimKey } from '../config/enemies.config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const base = 'assets/dawnlike';

    // ── Assets controlados por sprites-config.ts ──────────────────────────────
    // Carrega automaticamente todos os spritesheets dos atlases, deduplicando
    // por textureKey. Para adicionar um novo arquivo basta editar o config.
    const loaded = new Set<string>();

    const loadDef = (textureKey: string, subfolder: string, imageFile: string): void => {
      if (loaded.has(textureKey)) return;
      this.load.spritesheet(textureKey, `${base}/${subfolder}/${imageFile}`, {
        frameWidth: 16,
        frameHeight: 16,
      });
      loaded.add(textureKey);
    };

    for (const def of Object.values(FLOOR_ATLAS)) {
      loadDef(def.textureKey, def.subfolder, def.imageFile);
    }
    for (const def of Object.values(OBJECT_ATLAS)) {
      loadDef(def.textureKey, def.subfolder, def.imageFile);
    }
    for (const def of Object.values(NPC_ATLAS)) {
      loadDef(def.textureKey, def.subfolder, def.imageFile);
    }

    // ── Assets fixos (parede, personagens, itens) ─────────────────────────────
    // Estes não pertencem a biomas e permanecem hardcoded aqui intencionalmente.
    this.load.spritesheet(SPRITES.WALL,    `${base}/Objects/Wall.png`,           { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet(SPRITES.PLAYER,  `${base}/Characters/Player0.png`,     { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet(SPRITES.ENEMY,   `${base}/Characters/Undead0.png`,     { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet(SPRITES.POTION,  `${base}/Items/Potion.png`,           { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet(SPRITES.MONEY,   `${base}/Items/Money.png`,            { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet(SPRITES.PLATINO, `${base}/Characters/Reptile0.png`,    { frameWidth: 16, frameHeight: 16 });

    // ── Spritesheets de inimigos (pares DawnLike *0/*1) ───────────────────────
    // Cada categoria usa dois arquivos: o frame-0 (base) e o frame-1 (alternativo).
    // 'humanoid0' já está carregado via NPC_ATLAS; 'undead' (Undead0) via SPRITES.ENEMY.
    // Carregamos apenas os que ainda não existem para evitar loads duplicados.
    this._loadEnemySpritesheets(base, loaded);

    // Assets necessários para o mapa TMX da cidade
    this.load.spritesheet('floor',  `${base}/Objects/Floor.png`,           { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pit0',   `${base}/Objects/Pit0.png`,            { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('door0',  `${base}/Objects/Door0.png`,           { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('decor0', `${base}/Objects/Decor0.png`,          { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chest0', `${base}/Items/Chest0.png`,            { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('quad0',  `${base}/Characters/Quadraped0.png`,   { frameWidth: 16, frameHeight: 16 });

    // Efeitos de magia
    this.load.spritesheet('effect0', `${base}/Objects/Effect0.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('effect1', `${base}/Objects/Effect1.png`, { frameWidth: 16, frameHeight: 16 });

    this.load.image('game_bg', 'assets/game_bg.png');

    this._setupLoadingBar();
  }

  create(): void {
    this._registerSpellAnims();
    this._registerEnemyAnims();

    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'Dungeon of Echoes', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.time.delayedCall(200, () => {
      this.scene.start(DEV_CONFIG.devMode ? 'GameScene' : 'MainMenuScene');
    });
  }

  /**
   * Carrega os spritesheets de inimigos (pares DawnLike *0/*1).
   * Usa o set `loaded` do preload para deduplicar — mesma lógica dos atlases.
   *
   * Chaves já presentes antes desta chamada (NÃO são recarregadas):
   *   'undead'     → Undead0.png   (carregado como SPRITES.ENEMY)
   *   'humanoid0'  → Humanoid0.png (carregado via NPC_ATLAS)
   */
  private _loadEnemySpritesheets(base: string, loaded: Set<string>): void {
    const frameConfig = { frameWidth: 16, frameHeight: 16 };
    const chars = `${base}/Characters`;

    // Pares a carregar: [textureKey, arquivo].
    // 'undead' (Undead0) e 'humanoid0' já foram carregados acima; apenas adicionamos
    // as chaves padronizadas que ainda faltam.
    const pairs: Array<[string, string]> = [
      ['pest0',     'Pest0.png'],
      ['pest1',     'Pest1.png'],
      ['misc0',     'Misc0.png'],
      ['misc1',     'Misc1.png'],
      ['reptile0',  'Reptile0.png'],
      ['reptile1',  'Reptile1.png'],
      ['undead1',   'Undead1.png'],   // Undead0 já existe como 'undead'
      ['humanoid1', 'Humanoid1.png'], // Humanoid0 já existe como 'humanoid0'
      ['demon0',    'Demon0.png'],
      ['demon1',    'Demon1.png'],
    ];

    for (const [key, file] of pairs) {
      if (loaded.has(key)) continue;
      this.load.spritesheet(key, `${chars}/${file}`, frameConfig);
      loaded.add(key);
    }

    if (import.meta.env.DEV) {
      console.log(`[BootScene] Spritesheets de inimigos registrados: ${pairs.map(p => p[0]).join(', ')}`);
    }
  }

  /**
   * Registra globalmente as animações de inimigos no AnimationManager do Phaser.
   * Deve ser chamado em create() — uma única vez por sessão de jogo.
   *
   * Estratégia ping-pong DawnLike:
   *   Frame A → { key: '{categoria}0', frame: N }
   *   Frame B → { key: '{categoria}1', frame: N }
   *   O mesmo índice N representa o mesmo inimigo nos dois arquivos.
   *
   * Apenas cria animações para os inimigos definidos em ENEMY_DEFS (~15 entradas),
   * evitando explosão combinatória. Idempotente por verificação prévia de existência.
   */
  private _registerEnemyAnims(): void {
    // Wrapper idempotente (mesma assinatura do _registerSpellAnims)
    const safe = (
      key:     string,
      frames:  Phaser.Types.Animations.AnimationFrame[],
      rate:    number,
      repeat:  number,
    ): void => {
      if (this.anims.exists(key)) return;
      this.anims.create({ key, frames, frameRate: rate, repeat });
    };

    let registered = 0;

    for (const def of ENEMY_DEFS) {
      const [tex0, tex1] = CATEGORY_TEXTURE_KEYS[def.category];
      const animKey = buildAnimKey(def.category, def.frameIndex);

      safe(
        animKey,
        [
          { key: tex0, frame: def.frameIndex },
          { key: tex1, frame: def.frameIndex },
        ],
        2,   // frameRate: lento, adequado para turn-based
        -1,  // repeat: infinito
      );

      registered++;
    }

    if (import.meta.env.DEV) {
      console.log(`[BootScene] Animações de inimigos registradas: ${registered}`);
    }
  }

  private _registerSpellAnims(): void {
    // Effect0.png: 20 colunas × N linhas @ 16px
    // Linha 0 (frames 0-19): fogo; linha 1 (20-39): gelo; linha 2 (40-59): raio/arcano
    // Effect1.png: linha 0 (0-19): vento/verde
    // Os índices exatos dependem do atlas — ajustar após inspeção visual se necessário.
    const safe = (key: string, texture: string, start: number, end: number, rate: number, repeat: number) => {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(texture, { start, end }),
          frameRate: rate,
          repeat,
        });
      }
    };

    safe('spell_fire_fly',    'effect0', 0,  3,  10, -1);
    safe('spell_fire_impact', 'effect0', 4,  7,  14,  0);
    safe('spell_ice_fly',     'effect0', 20, 23,  8, -1);
    safe('spell_ice_impact',  'effect0', 24, 27, 14,  0);
    safe('spell_wind_fly',    'effect1', 0,  3,  12, -1);
    safe('spell_wind_impact', 'effect1', 4,  7,  14,  0);
  }

  private _setupLoadingBar(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2 + 60;

    const bg  = this.add.rectangle(cx, cy, 300, 16, 0x222222).setOrigin(0.5);
    const bar = this.add.rectangle(cx - 150, cy, 0, 14, 0x00aaff).setOrigin(0, 0.5);

    this.add
      .text(cx, cy - 24, 'Carregando assets...', {
        fontSize: '13px',
        color: '#888888',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.setSize(298 * value, 14);
    });

    this.load.on('complete', () => {
      bg.destroy();
      bar.destroy();
    });
  }
}
