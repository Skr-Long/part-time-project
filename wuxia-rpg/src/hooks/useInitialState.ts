import type { GameState, PlayerState, Location, CombatState, UIState, MetaState } from '../types';
import { calculateCombatStats } from '../utils/combat';
import { loadGlobalSettings } from './useSaveLoad';

const STORAGE_KEY = 'wuxia_rpg_game_state';

function createInitialPlayer(): PlayerState {
  const attributes = {
    insight: 5,
    constitution: 5,
    strength: 5,
    agility: 5,
    physique: 5,
    luck: 5,
  };
  const initialTechniques = ['basic-breathing', 'iron-palm'];
  const combatStats = calculateCombatStats(attributes, 1, initialTechniques);
  return {
    id: 'player-1',
    name: '江湖新人',
    level: 1,
    exp: 0,
    expToNext: 100,
    gold: 0,
    attributes,
    combatStats,
    inventory: [],
    equipment: { weapon: null, armor: null, accessory: null },
    professions: { blacksmith: null, herbalist: null, merchant: null },
    knownTechniques: initialTechniques,
    techniqueLevels: [
      { techniqueId: 'basic-breathing', level: 1, exp: 0, expToNext: 100 },
      { techniqueId: 'iron-palm', level: 1, exp: 0, expToNext: 100 },
    ],
    visitedLocations: [],
    completedEvents: [],
    monsterBook: [],
  };
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'village',
    nameCN: '平安镇',
    descriptionCN: '一个宁静的小镇，青瓦白墙，炊烟袅袅。镇民们过着平淡的生活。',
    type: 'village',
    zone: 1,
    connections: ['forest', 'mountain-path'],
    locationType: 'rest',
    restCost: 50,
    restHealPercent: 1.0,
  },
  {
    id: 'forest',
    nameCN: '迷雾森林',
    descriptionCN: '一片被薄雾笼罩的密林，幽暗潮湿，偶有兽吼声传来。',
    type: 'wilderness',
    zone: 1,
    connections: ['village', 'deep-forest'],
    locationType: 'encounter',
    encounterPool: ['wolf', 'bandit'],
    encounterChance: 30,
  },
  {
    id: 'mountain-path',
    nameCN: '铁山小路',
    descriptionCN: '蜿蜒崎岖的山路，碎石遍布，通往高山之巅。',
    type: 'wilderness',
    zone: 1,
    connections: ['village', 'temple'],
    locationType: 'encounter',
    encounterPool: ['mountain-bandit'],
    encounterChance: 25,
  },
  {
    id: 'deep-forest',
    nameCN: '幽暗密林',
    descriptionCN: '森林深处，古木参天，光线难以穿透。',
    type: 'wilderness',
    zone: 2,
    connections: ['forest', 'cave'],
    locationType: 'encounter',
    encounterPool: ['wolf', 'shadow-beast'],
    encounterChance: 40,
  },
  {
    id: 'cave',
    nameCN: '幽冥洞府',
    descriptionCN: '阴森的山洞，寒气逼人，传说有妖兽盘踞。',
    type: 'dungeon',
    zone: 2,
    connections: ['deep-forest'],
    locationType: 'encounter',
    encounterPool: ['cave-spider', 'shadow-beast'],
    encounterChance: 50,
  },
  {
    id: 'temple',
    nameCN: '古刹禅寺',
    descriptionCN: '古老的寺庙，梵音袅袅，僧人们在此修行。',
    type: 'city',
    zone: 2,
    connections: ['mountain-path'],
    locationType: 'character',
    character: {
      id: 'monk-master',
      nameCN: '静心大师',
      descriptionCN: '一位慈眉善目的老僧，武学修为深不可测。',
    },
  },
];

export { DEFAULT_LOCATIONS };

function createInitialCombatState(): CombatState {
  return {
    isActive: false,
    enemy: null,
    enemyCurrentHP: 0,
    playerSpeedBar: 0,
    enemySpeedBar: 0,
    combatLog: [],
    isPlayerTurn: true,
    combatRewards: null,
  };
}

function createInitialUIState(): UIState {
  return {
    gamePhase: 'title',
    currentLocationId: null,
    notifications: [],
    modals: { type: null },
  };
}

function createInitialMetaState(): MetaState {
  const globalSettings = loadGlobalSettings();
  return {
    version: '1.0.0',
    lastSaved: null,
    settings: { 
      autoSave: true, 
      combatSpeedMultiplier: 0.5,
      ...globalSettings,
    },
  };
}

export function getInitialGameState(): GameState {
  return {
    player: createInitialPlayer(),
    location: DEFAULT_LOCATIONS[0],
    combat: createInitialCombatState(),
    events: new Map(),
    professions: { blacksmith: null, herbalist: null, merchant: null },
    martialArts: new Map(),
    ui: createInitialUIState(),
    meta: createInitialMetaState(),
  };
}

export { STORAGE_KEY };
