import Phaser from 'phaser';
import { DungeonRenderer } from '../systems/DungeonRenderer';
import { DebugOverlayRenderer, DebugMode } from '../systems/DebugOverlayRenderer';
import { classifyGrid } from '../systems/SemanticClassifier';
import { themeForFloor } from '../config/dungeon-themes';
import { TILE_SIZE } from '../utils/constants';
import { MaskFrequencyLogger } from '../systems/MaskFrequencyLogger';

// Cena de teste determinística para validação visual do autotiling.
// Não usa DungeonGenerator — o grid é hardcoded para cobrir todos os casos críticos.
//
// Casos cobertos:
//   - Paredes retas horizontais e verticais
//   - Cantos externos (FACE_END_W / FACE_END_E)
//   - Cantos côncavos (INNER_NW / INNER_NE)
//   - Corredor de 1 tile horizontal
//   - Corredor de 1 tile vertical
//   - T-junction
//   - Sala aberta (sem paredes internas)
//   - Área VOID (parede profunda) vs WALL_EDGE
//
// Ativar: adicionar 'VisualRegressionScene' ao config de scenes em dev build.
// Toggle debug mode: teclas 1 (normal), 2 (semantic), 3 (variant), 4 (bitmask)

// 0 = WALL, 1 = FLOOR
const TEST_GRID: number[][] = [
  // Col: 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
  /*00*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /*01*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /*02*/ [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0],
  /*03*/ [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0],
  /*04*/ [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0],
  /*05*/ [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0],
  /*06*/ [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /*07*/ [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /*08*/ [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /*09*/ [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  /*10*/ [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  /*11*/ [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  /*12*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /*13*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /*14*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export class VisualRegressionScene extends Phaser.Scene {
  private _debugMode: DebugMode = 'off';
  private _tileObjects: Phaser.GameObjects.Image[] = [];
  private _logger = new MaskFrequencyLogger();
  private _modeText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'VisualRegressionScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x000000);
    this._buildScene();

    // Toggle debug modes: 1=normal, 2=semantic, 3=variant, 4=bitmask
    this.input.keyboard!.on('keydown-ONE',   () => this._setMode('off'));
    this.input.keyboard!.on('keydown-TWO',   () => this._setMode('semantic'));
    this.input.keyboard!.on('keydown-THREE', () => this._setMode('variant'));
    this.input.keyboard!.on('keydown-FOUR',  () => this._setMode('bitmask'));
    this.input.keyboard!.on('keydown-L',     () => this._logger.report());

    this._modeText = this.add.text(4, 4, '', { fontSize: '8px', color: '#ffff00' }).setDepth(100);
    this._updateModeText();
  }

  private _setMode(mode: DebugMode): void {
    this._debugMode = mode;
    this._buildScene();
    this._updateModeText();
    if (mode !== 'off') this._logger.report();
  }

  private _updateModeText(): void {
    this._modeText.setText(`Debug: ${this._debugMode} | 1=normal 2=semantic 3=variant 4=bitmask L=log`);
  }

  private _buildScene(): void {
    this._tileObjects.forEach(o => o.destroy());
    this._tileObjects = [];
    this._logger.reset();

    const sem = classifyGrid(TEST_GRID);
    let commands;

    if (this._debugMode !== 'off') {
      commands = new DebugOverlayRenderer(this._debugMode).buildCommands(TEST_GRID, sem);
    } else {
      const renderer = new DungeonRenderer();
      commands = renderer.buildCommands(TEST_GRID, themeForFloor(1), 1);
    }

    // Logger para mode 'off' (jogo normal)
    if (this._debugMode === 'off') {
      for (let y = 0; y < TEST_GRID.length; y++)
        for (let x = 0; x < TEST_GRID[0].length; x++)
          this._logger.record(TEST_GRID, sem, x, y);
    }

    for (const cmd of commands) {
      this._tileObjects.push(
        this.add.image(cmd.x, cmd.y, cmd.texture, cmd.frame).setDepth(cmd.depth),
      );
    }

    this.cameras.main.setBounds(0, 0, TEST_GRID[0].length * TILE_SIZE, TEST_GRID.length * TILE_SIZE);
    this.cameras.main.setZoom(4);
    this.cameras.main.centerOn(
      (TEST_GRID[0].length / 2) * TILE_SIZE,
      (TEST_GRID.length / 2) * TILE_SIZE,
    );
  }
}
