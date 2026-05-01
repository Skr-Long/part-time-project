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
    freeAttributePoints: 0,
    combatStats,
    inventory: createInitialInventory(),
    equipment: { weapon: null, armor: null, accessory: null },
    professions: { blacksmith: null, herbalist: null, merchant: null },
    knownTechniques: initialTechniques,
    techniqueLevels: [
      { techniqueId: 'basic-breathing', level: 1, exp: 0, expToNext: 100 },
      { techniqueId: 'iron-palm', level: 1, exp: 0, expToNext: 100 },
    ],
    visitedLocations: ['village'],
    exploredLocations: ['village'],
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
    connections: ['forest', 'mountain-path', 'south-road'],
    locationType: 'rest',
    position: { x: 400, y: 260 },
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
    connections: ['village', 'deep-forest', 'poison-valley'],
    locationType: 'encounter',
    position: { x: 260, y: 190 },
    encounterPool: ['wolf', 'wild-boar', 'bandit'],
    encounterChance: 30,
    requirements: {
      minLevel: 1,
    },
  },
  {
    id: 'mountain-path',
    nameCN: '铁山小路',
    descriptionCN: '蜿蜒崎岖的山路，碎石遍布，通往高山之巅。',
    type: 'wilderness',
    zone: 1,
    connections: ['village', 'temple', 'black-wind-mountain'],
    locationType: 'encounter',
    position: { x: 540, y: 190 },
    encounterPool: ['mountain-bandit', 'wild-bear', 'thug'],
    encounterChance: 25,
    requirements: {
      minLevel: 1,
    },
  },
  {
    id: 'south-road',
    nameCN: '南驿道',
    descriptionCN: '通往南方的官道，行人稀少，偶尔有商队经过。',
    type: 'wilderness',
    zone: 1,
    connections: ['village', 'ruined-temple', 'river-crossing'],
    locationType: 'encounter',
    position: { x: 400, y: 360 },
    encounterPool: ['thug', 'debt-collector', 'snake'],
    encounterChance: 25,
    requirements: {
      minLevel: 1,
    },
  },
  {
    id: 'deep-forest',
    nameCN: '幽暗密林',
    descriptionCN: '森林深处，古木参天，光线难以穿透。',
    type: 'wilderness',
    zone: 2,
    connections: ['forest', 'cave', 'waterfall-cave'],
    locationType: 'encounter',
    position: { x: 160, y: 220 },
    encounterPool: ['wolf', 'shadow-beast', 'giant-wolf', 'snake'],
    encounterChance: 40,
    requirements: {
      minLevel: 3,
    },
  },
  {
    id: 'cave',
    nameCN: '幽冥洞府',
    descriptionCN: '阴森的山洞，寒气逼人，传说有妖兽盘踞。',
    type: 'dungeon',
    zone: 2,
    connections: ['deep-forest'],
    locationType: 'encounter',
    position: { x: 100, y: 160 },
    encounterPool: ['cave-spider', 'shadow-beast', 'pickpocket'],
    encounterChance: 50,
    requirements: {
      minLevel: 5,
    },
    subLocations: [
      {
        id: 'secret-chamber',
        nameCN: '密室',
        type: 'tavern',
        descriptionCN: '洞府深处似乎藏着一个密室。',
        icon: '🚪',
        interactions: [
          { type: 'talk', label: '探索密室', description: '仔细查看密室中的东西' },
        ],
      },
    ],
  },
  {
    id: 'waterfall-cave',
    nameCN: '水帘洞',
    descriptionCN: '隐藏在瀑布后面的神秘洞穴，传说有高人在此隐居。',
    type: 'dungeon',
    zone: 2,
    connections: ['deep-forest'],
    locationType: 'encounter',
    position: { x: 120, y: 120 },
    encounterPool: ['mountain-ape', 'shadow-beast'],
    encounterChance: 35,
    requirements: {
      minLevel: 6,
    },
  },
  {
    id: 'temple',
    nameCN: '古刹禅寺',
    descriptionCN: '古老的寺庙，梵音袅袅，僧人们在此修行。',
    type: 'city',
    zone: 2,
    connections: ['mountain-path', 'shaolin-route'],
    locationType: 'character',
    position: { x: 480, y: 120 },
    requirements: {
      minLevel: 5,
    },
    character: {
      id: 'monk-master',
      nameCN: '静心大师',
      descriptionCN: '一位慈眉善目的老僧，武学修为深不可测。',
      interactions: [
        { type: 'talk', label: '对话', description: '与静心大师交谈', dialogId: 'monk-master-dialog' },
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
  {
    id: 'poison-valley',
    nameCN: '万毒谷',
    descriptionCN: '一个毒物横行的山谷，各种奇花异草和毒虫在此生长。',
    type: 'dungeon',
    zone: 2,
    connections: ['forest', 'evil-valley'],
    locationType: 'encounter',
    position: { x: 180, y: 140 },
    encounterPool: ['snake', 'scorpion-king', 'poison-master'],
    encounterChance: 45,
    requirements: {
      minLevel: 6,
      requiredAttributes: { constitution: 6 },
    },
  },
  {
    id: 'black-wind-mountain',
    nameCN: '黑风山',
    descriptionCN: '一座常年被黑雾笼罩的山峰，山贼在此聚众为寇。',
    type: 'wilderness',
    zone: 2,
    connections: ['mountain-path', 'bandit-lair'],
    locationType: 'encounter',
    position: { x: 580, y: 200 },
    encounterPool: ['bandit', 'mountain-bandit', 'rogue-disciple', 'evildoer'],
    encounterChance: 40,
    requirements: {
      minLevel: 6,
    },
  },
  {
    id: 'bandit-lair',
    nameCN: '山贼老巢',
    descriptionCN: '黑风山深处的山贼巢穴，戒备森严。',
    type: 'dungeon',
    zone: 3,
    connections: ['black-wind-mountain'],
    locationType: 'encounter',
    position: { x: 620, y: 160 },
    encounterPool: ['mountain-bandit', 'evildoer', 'assassin'],
    encounterChance: 55,
    requirements: {
      minLevel: 8,
    },
    subLocations: [
      {
        id: 'treasure-room',
        nameCN: '宝库',
        type: 'tavern',
        descriptionCN: '山贼存放宝物的地方。',
        icon: '💰',
        interactions: [
          { type: 'talk', label: '搜查宝库', description: '仔细看看有什么宝物' },
        ],
      },
    ],
  },
  {
    id: 'ruined-temple',
    nameCN: '破庙',
    descriptionCN: '一座废弃多年的古庙，断壁残垣，偶尔有流浪者在此歇脚。',
    type: 'special',
    zone: 2,
    connections: ['south-road', 'graveyard'],
    locationType: 'encounter',
    position: { x: 280, y: 380 },
    encounterPool: ['thug', 'pickpocket', 'rogue-disciple'],
    encounterChance: 30,
    requirements: {
      minLevel: 5,
    },
    subLocations: [
      {
        id: 'broken-statue',
        nameCN: '残破石像',
        type: 'temple',
        descriptionCN: '庙中有一尊残破的佛像，似乎有些蹊跷。',
        icon: '🗿',
        interactions: [
          { type: 'talk', label: '仔细查看', description: '观察石像的细节' },
        ],
      },
      {
        id: 'underground-cellar',
        nameCN: '地下地窖',
        type: 'tavern',
        descriptionCN: '佛像后面似乎有一个暗门通往地下。',
        icon: '🚪',
        interactions: [
          { type: 'talk', label: '探索地窖', description: '进入地窖查看' },
        ],
      },
    ],
  },
  {
    id: 'river-crossing',
    nameCN: '渡口',
    descriptionCN: '大河边上的渡口，有船夫在此载客过河。',
    type: 'village',
    zone: 2,
    connections: ['south-road', 'river-island', 'city-xiangyang'],
    locationType: 'rest',
    position: { x: 520, y: 370 },
    restCost: 60,
    restHealPercent: 0.8,
    requirements: {
      minLevel: 5,
    },
    subLocations: [
      {
        id: 'ferry-inn',
        nameCN: '渡头客栈',
        type: 'inn',
        descriptionCN: '渡口边的小客栈，供过客歇脚。',
        icon: '🏨',
        restCost: 40,
        interactions: [
          { type: 'rest', label: '休息', description: '恢复生命和内力' },
          { type: 'talk', label: '打听消息', description: '听听来往客商的见闻' },
        ],
      },
    ],
  },
  {
    id: 'graveyard',
    nameCN: '乱葬岗',
    descriptionCN: '一片荒废的坟地，阴气森森，夜晚常有异象。',
    type: 'dungeon',
    zone: 3,
    connections: ['ruined-temple', 'ancient-tomb'],
    locationType: 'encounter',
    position: { x: 180, y: 420 },
    encounterPool: ['jiangshi', 'evildoer', 'pickpocket'],
    encounterChance: 45,
    requirements: {
      minLevel: 8,
      requiredAttributes: { physique: 6 },
    },
  },
  {
    id: 'ancient-tomb',
    nameCN: '古墓',
    descriptionCN: '一座年代久远的古墓，墓道幽深，机关重重。',
    type: 'dungeon',
    zone: 4,
    connections: ['graveyard'],
    locationType: 'encounter',
    position: { x: 140, y: 400 },
    encounterPool: ['jiangshi', 'jiangshi-king', 'blood-sect-disciple'],
    encounterChance: 60,
    requirements: {
      minLevel: 12,
      requiredAttributes: { agility: 8, physique: 8 },
    },
    subLocations: [
      {
        id: 'jade-chamber',
        nameCN: '玉室',
        type: 'tavern',
        descriptionCN: '古墓深处的一间玉室，似乎是墓主人的寝室。',
        icon: '💎',
        interactions: [
          { type: 'talk', label: '仔细搜索', description: '看看有什么陪葬品' },
        ],
      },
      {
        id: 'secret-passage',
        nameCN: '秘道',
        type: 'tavern',
        descriptionCN: '玉室中似乎有一条通往更深地下的秘道。',
        icon: '🕳️',
        interactions: [
          { type: 'talk', label: '进入秘道', description: '探索秘道深处' },
        ],
      },
    ],
  },
  {
    id: 'evil-valley',
    nameCN: '恶人谷',
    descriptionCN: '传说中天下恶人聚集之地，进去容易出来难。',
    type: 'wilderness',
    zone: 3,
    connections: ['poison-valley', 'city-luoyang'],
    locationType: 'encounter',
    position: { x: 220, y: 100 },
    encounterPool: ['evildoer', 'assassin', 'blood-sect-disciple'],
    encounterChance: 50,
    requirements: {
      minLevel: 10,
    },
  },
  {
    id: 'river-island',
    nameCN: '桃花岛',
    descriptionCN: '河中央的一座小岛，岛上开满桃花，宛如仙境。',
    type: 'special',
    zone: 3,
    connections: ['river-crossing'],
    locationType: 'encounter',
    position: { x: 580, y: 440 },
    encounterPool: ['flower-thief', 'rogue-disciple', 'assassin'],
    encounterChance: 25,
    requirements: {
      minLevel: 8,
      requiredAttributes: { insight: 8 },
    },
    subLocations: [
      {
        id: 'peach-garden',
        nameCN: '桃花园',
        type: 'tavern',
        descriptionCN: '岛上的一片桃花园，落英缤纷。',
        icon: '🌸',
        interactions: [
          { type: 'talk', label: '漫步赏花', description: '在桃花园中漫步' },
        ],
      },
      {
        id: 'stone-maze',
        nameCN: '石阵',
        type: 'tavern',
        descriptionCN: '岛的深处有一座用巨石布置的阵法，奥妙无穷。',
        icon: '🪨',
        interactions: [
          { type: 'talk', label: '尝试破阵', description: '钻研石阵的奥秘' },
        ],
      },
    ],
  },
  {
    id: 'shaolin-route',
    nameCN: '少林山道',
    descriptionCN: '通往少林寺的盘山古道，沿途风景壮丽。',
    type: 'wilderness',
    zone: 3,
    connections: ['temple', 'city-shaolin'],
    locationType: 'encounter',
    position: { x: 520, y: 100 },
    encounterPool: ['mountain-bandit', 'mountain-ape', 'rogue-disciple'],
    encounterChance: 30,
    requirements: {
      minLevel: 8,
    },
  },
  {
    id: 'city-xiangyang',
    nameCN: '襄阳城',
    descriptionCN: '一座繁华的大城，商贾云集，武林人士常在此聚集。',
    type: 'city',
    zone: 3,
    connections: ['river-crossing', 'city-luoyang', 'huashan-route'],
    locationType: 'rest',
    position: { x: 660, y: 320 },
    restCost: 100,
    restHealPercent: 1.0,
    requirements: {
      minLevel: 8,
    },
    subLocations: [
      {
        id: 'xiangyang-inn',
        nameCN: '悦来客栈',
        type: 'inn',
        descriptionCN: '襄阳城最大的客栈，也是武林人士汇聚之地。',
        icon: '🏨',
        restCost: 80,
        interactions: [
          { type: 'rest', label: '休息', description: '恢复生命和内力' },
          { type: 'talk', label: '打听消息', description: '听听江湖上的最新消息' },
        ],
      },
      {
        id: 'xiangyang-blacksmith',
        nameCN: '神兵阁',
        type: 'blacksmith',
        descriptionCN: '襄阳城有名的铁匠铺，打造的兵器远近闻名。',
        icon: '⚒️',
        shopInventory: [
          { itemId: 'steel-sword', price: 200, quantity: 3 },
          { itemId: 'iron-spear', price: 250, quantity: 2 },
          { itemId: 'steel-armor', price: 350, quantity: 2 },
          { itemId: 'steel-ingot', price: 60, quantity: 15 },
          { itemId: 'black-iron-ore', price: 150, quantity: 5 },
        ],
        interactions: [
          { type: 'shop', label: '购买装备', description: '查看神兵阁的商品' },
          { type: 'craft', label: '打造装备', description: '使用材料打造装备' },
        ],
      },
      {
        id: 'xiangyang-martial',
        nameCN: '襄阳武馆',
        type: 'martial_hall',
        descriptionCN: '襄阳城的大武馆，馆主是一位退隐的武林高手。',
        icon: '🥋',
        interactions: [
          { type: 'train', label: '切磋武艺', description: '与武馆弟子切磋' },
          { type: 'talk', label: '请教武学', description: '向馆主请教' },
        ],
      },
      {
        id: 'xiangyang-clinic',
        nameCN: '回春堂',
        type: 'clinic',
        descriptionCN: '襄阳城有名的药铺，医术精湛。',
        icon: '🏥',
        shopInventory: [
          { itemId: 'health-potion', price: 30, quantity: 20 },
          { itemId: 'greater-health-potion', price: 80, quantity: 10 },
          { itemId: 'energy-potion', price: 35, quantity: 15 },
          { itemId: 'antidote', price: 40, quantity: 12 },
          { itemId: 'spirit-essence', price: 280, quantity: 3 },
        ],
        interactions: [
          { type: 'heal', label: '看病', description: '让大夫诊断治疗' },
          { type: 'shop', label: '购买丹药', description: '购买药材和丹丸' },
        ],
      },
    ],
  },
  {
    id: 'city-luoyang',
    nameCN: '洛阳城',
    descriptionCN: '古都洛阳，繁华无比，是中原武林的核心地带。',
    type: 'city',
    zone: 4,
    connections: ['city-xiangyang', 'evil-valley', 'wudang-route'],
    locationType: 'rest',
    position: { x: 340, y: 80 },
    restCost: 150,
    restHealPercent: 1.0,
    requirements: {
      minLevel: 12,
    },
    subLocations: [
      {
        id: 'luoyang-inn',
        nameCN: '龙门客栈',
        type: 'inn',
        descriptionCN: '洛阳城最豪华的客栈，三教九流汇聚于此。',
        icon: '🏨',
        restCost: 100,
        interactions: [
          { type: 'rest', label: '休息', description: '恢复生命和内力' },
          { type: 'talk', label: '打听消息', description: '探听江湖秘闻' },
        ],
      },
      {
        id: 'luoyang-shop',
        nameCN: '聚宝斋',
        type: 'shop',
        descriptionCN: '洛阳城最大的古玩珠宝店，奇珍异宝应有尽有。',
        icon: '🏪',
        shopInventory: [
          { itemId: 'jade-stone', price: 100, quantity: 10 },
          { itemId: 'silver-ore', price: 40, quantity: 20 },
          { itemId: 'spirit-essence', price: 300, quantity: 5 },
        ],
        interactions: [
          { type: 'shop', label: '购买物品', description: '查看聚宝斋的商品' },
        ],
      },
    ],
  },
  {
    id: 'city-shaolin',
    nameCN: '少林寺',
    descriptionCN: '天下武功出少林，千年古刹，武学圣地。',
    type: 'city',
    zone: 4,
    connections: ['shaolin-route'],
    locationType: 'character',
    position: { x: 600, y: 80 },
    requirements: {
      minLevel: 12,
      requiredAttributes: { physique: 10 },
    },
    character: {
      id: 'shaolin-master',
      nameCN: '玄慈方丈',
      descriptionCN: '少林寺方丈，德高望重，武功深不可测。',
      interactions: [
        { type: 'talk', label: '对话', description: '与方丈交谈', dialogId: 'shaolin-master-dialog' },
        { type: 'train', label: '请教武学', description: '向方丈请教少林武学' },
        { type: 'quest', label: '接受任务', description: '看看寺中有何任务' },
      ],
    },
    subLocations: [
      {
        id: 'shaolin-hall',
        nameCN: '大雄宝殿',
        type: 'temple',
        descriptionCN: '少林寺的主殿，庄严肃穆。',
        icon: '⛩️',
        interactions: [
          { type: 'talk', label: '上香祈福', description: '上香祈福' },
        ],
      },
      {
        id: 'shaolin-library',
        nameCN: '藏经阁',
        type: 'martial_hall',
        descriptionCN: '少林寺收藏武学典籍的重地。',
        icon: '📚',
        interactions: [
          { type: 'train', label: '研读武学', description: '研读少林武学典籍' },
        ],
      },
    ],
  },
  {
    id: 'huashan-route',
    nameCN: '华山山道',
    descriptionCN: '通往华山的险峻山路，西岳华山以险著称。',
    type: 'wilderness',
    zone: 4,
    connections: ['city-xiangyang', 'city-huashan'],
    locationType: 'encounter',
    position: { x: 700, y: 340 },
    encounterPool: ['assassin', 'evildoer', 'blood-sect-disciple'],
    encounterChance: 35,
    requirements: {
      minLevel: 12,
    },
  },
  {
    id: 'wudang-route',
    nameCN: '武当山道',
    descriptionCN: '通往武当山的古道，仙气缭绕。',
    type: 'wilderness',
    zone: 4,
    connections: ['city-luoyang', 'city-wudang'],
    locationType: 'encounter',
    position: { x: 300, y: 60 },
    encounterPool: ['demon-cult-elder', 'blood-sect-disciple', 'assassin'],
    encounterChance: 40,
    requirements: {
      minLevel: 12,
    },
  },
  {
    id: 'city-huashan',
    nameCN: '华山派',
    descriptionCN: '五岳剑派之一，华山派以剑法精妙著称。',
    type: 'city',
    zone: 4,
    connections: ['huashan-route'],
    locationType: 'character',
    position: { x: 720, y: 380 },
    requirements: {
      minLevel: 15,
      requiredAttributes: { agility: 10 },
    },
    character: {
      id: 'huashan-master',
      nameCN: '岳掌门',
      descriptionCN: '华山派掌门，剑法通神，为人正直。',
      interactions: [
        { type: 'talk', label: '对话', description: '与掌门交谈', dialogId: 'huashan-master-dialog' },
        { type: 'train', label: '请教剑法', description: '请教研习华山剑法' },
      ],
    },
  },
  {
    id: 'city-wudang',
    nameCN: '武当山',
    descriptionCN: '道教圣地，武当派以太极功夫闻名天下。',
    type: 'city',
    zone: 4,
    connections: ['wudang-route'],
    locationType: 'character',
    position: { x: 260, y: 80 },
    requirements: {
      minLevel: 15,
      requiredAttributes: { insight: 12 },
    },
    character: {
      id: 'wudang-master',
      nameCN: '张真人',
      descriptionCN: '武当派创始人，太极宗师，仙风道骨。',
      interactions: [
        { type: 'talk', label: '对话', description: '与张真人交谈', dialogId: 'wudang-master-dialog' },
        { type: 'train', label: '请教武学', description: '请教武当太极武学' },
      ],
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
    exploreLogs: [],
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
