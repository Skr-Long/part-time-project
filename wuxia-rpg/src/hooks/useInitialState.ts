import type { GameState, PlayerState, Location, CombatState, UIState, MetaState, InventoryItem } from '../types';
import { calculateCombatStats } from '../utils/combat';
import { loadGlobalSettings } from './useSaveLoad';
import { getItem } from '../data/items';

const STORAGE_KEY = 'wuxia_rpg_game_state';

function createInitialInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];
  
  const addItem = (itemId: string, quantity: number) => {
    const item = getItem(itemId);
    if (item) {
      items.push({ ...item, quantity });
    }
  };

  addItem('iron-ore', 20);
  addItem('steel-ingot', 10);
  addItem('wolf-skin', 15);
  addItem('jade-stone', 5);
  addItem('silver-ore', 5);
  addItem('health-potion', 5);
  
  return items;
}

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
    gold: 1000,
    attributes,
    combatStats,
    inventory: createInitialInventory(),
    equipment: { weapon: null, armor: null, accessory: null },
    professions: { blacksmith: null, herbalist: null, merchant: null },
    knownTechniques: initialTechniques,
    techniqueLevels: [
      { techniqueId: 'basic-breathing', level: 1, exp: 0, expToNext: 100 },
      { techniqueId: 'iron-palm', level: 1, exp: 0, expToNext: 100 },
    ],
    visitedLocations: [],
    exploredLocations: [],
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
    position: { x: 300, y: 200 },
    restCost: 50,
    restHealPercent: 1.0,
    subLocations: [
      {
        id: 'village-inn',
        nameCN: '平安客栈',
        type: 'inn',
        descriptionCN: '镇上唯一的客栈，提供食宿服务。',
        icon: '🏨',
        restCost: 30,
        interactions: [
          { type: 'rest', label: '休息', description: '恢复生命和内力' },
          { type: 'talk', label: '打听消息', description: '向掌柜打听江湖消息' },
        ],
      },
      {
        id: 'village-blacksmith',
        nameCN: '王铁匠铺',
        type: 'blacksmith',
        descriptionCN: '王师傅的铁匠铺，可以打造和修理武器装备。',
        icon: '⚒️',
        shopInventory: [
          { itemId: 'iron-sword', price: 80, quantity: 5 },
          { itemId: 'iron-dagger', price: 60, quantity: 5 },
          { itemId: 'leather-armor', price: 100, quantity: 3 },
          { itemId: 'jade-ring', price: 120, quantity: 2 },
          { itemId: 'iron-ore', price: 10, quantity: 20 },
          { itemId: 'steel-ingot', price: 50, quantity: 10 },
          { itemId: 'wolf-skin', price: 15, quantity: 15 },
        ],
        interactions: [
          { type: 'shop', label: '购买装备', description: '查看铁匠铺的商品' },
          { type: 'craft', label: '打造装备', description: '使用材料打造装备' },
          { type: 'talk', label: '闲聊', description: '与王师傅聊天' },
        ],
      },
      {
        id: 'village-martial',
        nameCN: '镇武馆',
        type: 'martial_hall',
        descriptionCN: '小镇的武馆，传授基础武学。',
        icon: '🥋',
        interactions: [
          { type: 'train', label: '切磋武艺', description: '与馆主切磋，提升技巧' },
          { type: 'talk', label: '请教武学', description: '请教武学问题' },
        ],
      },
      {
        id: 'village-shop',
        nameCN: '杂货铺',
        type: 'shop',
        descriptionCN: '李掌柜的杂货铺，售卖各种日用品。',
        icon: '🏪',
        shopInventory: [
          { itemId: 'health-potion', price: 30, quantity: 10 },
          { itemId: 'greater-health-potion', price: 80, quantity: 5 },
          { itemId: 'energy-potion', price: 35, quantity: 8 },
          { itemId: 'antidote', price: 40, quantity: 6 },
          { itemId: 'jade-stone', price: 80, quantity: 5 },
          { itemId: 'silver-ore', price: 30, quantity: 10 },
        ],
        interactions: [
          { type: 'shop', label: '购买物品', description: '查看杂货铺的商品' },
        ],
      },
      {
        id: 'village-clinic',
        nameCN: '药铺',
        type: 'clinic',
        descriptionCN: '张大夫的药铺，售卖药材和丹丸。',
        icon: '🏥',
        shopInventory: [
          { itemId: 'health-potion', price: 25, quantity: 15 },
          { itemId: 'greater-health-potion', price: 70, quantity: 8 },
          { itemId: 'energy-potion', price: 30, quantity: 10 },
          { itemId: 'antidote', price: 35, quantity: 10 },
          { itemId: 'spirit-essence', price: 250, quantity: 2 },
        ],
        interactions: [
          { type: 'heal', label: '看病', description: '让张大夫诊断治疗' },
          { type: 'shop', label: '购买丹药', description: '购买药材和丹丸' },
        ],
      },
    ],
  },
  {
    id: 'forest',
    nameCN: '迷雾森林',
    descriptionCN: '一片被薄雾笼罩的密林，幽暗潮湿，偶有兽吼声传来。',
    type: 'wilderness',
    zone: 1,
    connections: ['village', 'deep-forest'],
    locationType: 'encounter',
    position: { x: 180, y: 200 },
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
    position: { x: 420, y: 200 },
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
    position: { x: 80, y: 200 },
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
    position: { x: 80, y: 80 },
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
    position: { x: 420, y: 80 },
    character: {
      id: 'monk-master',
      nameCN: '静心大师',
      descriptionCN: '一位慈眉善目的老僧，武学修为深不可测。',
      interactions: [
        { type: 'talk', label: '对话', description: '与静心大师交谈' },
        { type: 'train', label: '请教武学', description: '向大师请教武学问题' },
        { type: 'quest', label: '接受任务', description: '看看大师有没有任务托付' },
      ],
    },
    subLocations: [
      {
        id: 'temple-hall',
        nameCN: '大雄宝殿',
        type: 'temple',
        descriptionCN: '寺庙的主殿，供奉着佛像。',
        icon: '⛩️',
        interactions: [
          { type: 'talk', label: '上香祈福', description: '上香祈福，可能获得好运' },
        ],
      },
      {
        id: 'temple-martial',
        nameCN: '藏经阁',
        type: 'martial_hall',
        descriptionCN: '收藏武学典籍的阁楼。',
        icon: '📚',
        interactions: [
          { type: 'train', label: '研读武学', description: '研读藏经阁中的武学典籍' },
        ],
      },
    ],
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
