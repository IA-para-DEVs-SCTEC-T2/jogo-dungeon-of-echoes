// Configuração da área bônus (acessível em game(12,0) — TMX(7,-5) da cidade).
//
// Como usar:
//   - Coordenadas são "x,y" no grid desta área (base 0, canto superior esquerdo)
//   - forceGid: substitui o tile de chão padrão pelo GID informado
//   - walkable: false → bloqueia movimento nessa célula
//   - npcName / interaction → cria objeto interativo sem sprite NPC dedicado
//
// Dimensões: BONUS_W × BONUS_H tiles (veja constantes abaixo).
// Debug: ative DEBUG_SHOW_COORDINATES em BonusAreaRenderer para ver coords na tela.

import type { TileOverride } from './TileProperties';
import type { NPCInstanceDef } from '../types/town';

// Dimensões em tiles — pelo menos 25×19 para preencher a tela (800×600, zoom=2, tile=16)
export const BONUS_W = 30;
export const BONUS_H = 22;

// Posição de spawn do player ao entrar na área
export const BONUS_PLAYER_START_X = Math.floor(BONUS_W / 2);
export const BONUS_PLAYER_START_Y = BONUS_H - 2;

// Overrides de tile por coordenada "x,y" — mesma lógica do MANUAL_MAP_OVERRIDES da cidade,
// mas ISOLADO: nunca importe MANUAL_MAP_OVERRIDES aqui, nem importe BONUS_AREA_OVERRIDES em TileProperties.
export const BONUS_AREA_OVERRIDES: Record<string, TileOverride> = {
  // Exemplos — descomente e ajuste conforme necessário:
  // '5,5':  { forceGid: 1169, walkable: true },   // pedra no meio
  // '10,3': { walkable: false },                   // barreira invisível
  // '14,10': { npcName: 'Placa', interaction: { type: 'dialogue', message: 'Mensagem da placa' } },
  '12,7': { forceGid: 1177, walkable: true },
  '12,8': { forceGid: 1177, walkable: true },
  '12,9': { forceGid: 1177, walkable: true },
  '12,10': { forceGid: 1177, walkable: true },
  '13,6': { forceGid: 1197, walkable: true },
  '13,7': { forceGid: 1147, walkable: true },
  '13,8': { forceGid: 1168, walkable: true },
  '13,9': { forceGid: 1168, walkable: true },
  '13,10': { forceGid: 1189, walkable: true },
  '13,11': { forceGid: 1155, walkable: true },
  '14,6': { forceGid: 1197, walkable: true },
  '14,7': { forceGid: 1148, walkable: true },
  '14,8': { forceGid: 1169, walkable: true },
  '14,9': { forceGid: 1169, walkable: true },
  '14,10': { forceGid: 1190, walkable: true },
  '14,11': { forceGid: 1156, walkable: true },
  '14,12': { forceGid: 1177, walkable: true },
  '14,13': { forceGid: 1177, walkable: true },
  '14,14': { forceGid: 1177, walkable: true },
  '14,15': { forceGid: 1177, walkable: true },
  '14,16': { forceGid: 1177, walkable: true },
  '14,17': { forceGid: 1177, walkable: true },
  '14,18': { forceGid: 1177, walkable: true },
  '14,19': { forceGid: 1177, walkable: true },
  '14,20': { forceGid: 1177, walkable: true },
  '15,6': { forceGid: 1197, walkable: true },
  '15,7': { forceGid: 1148, walkable: true },
  '15,8': { forceGid: 1169, walkable: true },
  '15,9': { forceGid: 1169, walkable: true },
  '15,10': { forceGid: 1169, walkable: true },
  '15,11': { forceGid: 1171, walkable: true },
  '15,12': { forceGid: 1171, walkable: true },
  '15,13': { forceGid: 1171, walkable: true },
  '15,14': { forceGid: 1171, walkable: true },
  '15,15': { forceGid: 1171, walkable: true },
  '15,16': { forceGid: 1171, walkable: true },
  '15,17': { forceGid: 1171, walkable: true },
  '15,18': { forceGid: 1171, walkable: true },
  '15,19': { forceGid: 1171, walkable: true },
  '15,20': { forceGid: 1171, walkable: true },
  '16,6': { forceGid: 1197, walkable: true },
  '16,7': { forceGid: 1148, walkable: true },
  '16,8': { forceGid: 1169, walkable: true },
  '16,9': { forceGid: 1169, walkable: true },
  '16,10': { forceGid: 1190, walkable: true },
  '16,11': { forceGid: 1154, walkable: true },
  '16,12': { forceGid: 1175, walkable: true },
  '16,13': { forceGid: 1175, walkable: true },
  '16,14': { forceGid: 1175, walkable: true },
  '16,15': { forceGid: 1175, walkable: true },
  '16,16': { forceGid: 1175, walkable: true },
  '16,17': { forceGid: 1175, walkable: true },
  '16,18': { forceGid: 1175, walkable: true },
  '16,19': { forceGid: 1175, walkable: true },
  '16,20': { forceGid: 1175, walkable: true },
  '17,6': { forceGid: 1197, walkable: true },
  '17,7': { forceGid: 1149, walkable: true },
  '17,8': { forceGid: 1170, walkable: true },
  '17,9': { forceGid: 1170, walkable: true },
  '17,10': { forceGid: 1191, walkable: true },
  '17,11': { forceGid: 1155, walkable: true },
  '18,7': { forceGid: 1175, walkable: true },
  '18,8': { forceGid: 1175, walkable: true },
  '18,9': { forceGid: 1175, walkable: true },
  '18,10': { forceGid: 1175, walkable: true },
};

// NPCs fixos da área bônus
export const BONUS_AREA_NPCS: NPCInstanceDef[] = [
  {
    id:           'bonus-npc',
    gridX:        Math.floor(BONUS_W / 2),
    gridY:        Math.floor(BONUS_H / 2) - 2,
    sprite:       'humanoid0',
    frame:        0,
    name:         'Habitante',
    state:        'idle',
    interactRange: 2,
    interaction:  { type: 'dialogue', message: 'Seja bem vindo ao trabalho do grupo 7 - SC TEC' },
  },
];
