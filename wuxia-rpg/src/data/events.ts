import type { GameEvent, EquipmentItem } from '../types';

export const EVENTS: GameEvent[] = [
  {
    id: 'first-combat',
    nameCN: '初战山贼',
    descriptionCN: '你在山间小路遭遇了一伙山贼，这是你江湖路上的第一战。',
    type: 'story',
    triggerCondition: { type: 'location', locationId: 'mountain-path', minVisits: 1 },
    isExclusive: true,
    exclusiveWith: ['first-battle-win', 'first-battle-lose'],
    actions: [
      { type: 'startCombat', enemyId: 'mountain-bandit' },
    ],
    rewards: { exp: 50, gold: 30 },
  },
  {
    id: 'first-battle-win',
    nameCN: '初战告捷',
    descriptionCN: '你成功击败了山贼，江湖之路正式开启。',
    type: 'story',
    triggerCondition: { type: 'combat', enemyId: 'mountain-bandit', result: 'victory' },
    isExclusive: true,
    exclusiveWith: ['first-combat', 'first-battle-lose'],
    actions: [],
    rewards: { exp: 100, gold: 50 },
  },
  {
    id: 'monk-blessing',
    nameCN: '禅师开悟',
    descriptionCN: '静心大师见你根骨不凡，决定指点你一二。',
    type: 'story',
    triggerCondition: { type: 'location', locationId: 'temple', minVisits: 1 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 1 },
    ],
    rewards: { exp: 80 },
  },
  {
    id: 'temple-light-step',
    nameCN: '禅师传功',
    descriptionCN: '静心大师对你的虔诚印象深刻，决定传授轻功绝学。',
    type: 'story',
    triggerCondition: { type: 'location', locationId: 'temple', minVisits: 2 },
    prerequisiteEvents: ['monk-blessing'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'learnTechnique', techniqueId: 'ling-bo' },
    ],
    rewards: { exp: 150 },
  },
  {
    id: 'cave-treasure',
    nameCN: '洞中奇遇',
    descriptionCN: '幽冥洞府中似乎藏着什么秘密...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'cave', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: ['cave-danger'],
    actions: [
      { type: 'gainItem', item: { id: 'shadow-essence', name: 'Shadow Essence', nameCN: '幽冥精华', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Shadow essence', descriptionCN: '蕴含幽暗之力的精华', stackable: true, quantity: 1 } },
      { type: 'gainItem', item: { id: 'steel-sword', name: 'Steel Sword', nameCN: '精钢剑', type: 'weapon', effects: { attackBonus: 15, defenseBonus: 0, maxHPBonus: 0, speedBonus: 0 }, description: 'Steel sword', descriptionCN: '锋利的精钢长剑', equipEffects: { attackBonus: 15, defenseBonus: 0, maxHPBonus: 0, speedBonus: 0 }, requiredLevel: 3, stackable: false, quantity: 1 } as EquipmentItem },
    ],
    rewards: { exp: 150, gold: 100 },
  },
  {
    id: 'wolf-pack',
    nameCN: '狼群袭击',
    descriptionCN: '一群恶狼盯上了你！',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'deep-forest', minVisits: 1 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'startCombat', enemyId: 'wolf' },
    ],
    rewards: { exp: 40, gold: 15 },
  },
  {
    id: 'bandit-hideout',
    nameCN: '山贼窝点',
    descriptionCN: '你发现了山贼的秘密窝点！',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'forest', minVisits: 3 },
    prerequisiteEvents: ['first-battle-win'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'gainItem', item: { id: 'bandit-booty', name: 'Bandit Booty', nameCN: '山贼赃物', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Bandit booty', descriptionCN: '山贼藏匿的财物', stackable: true, quantity: 1 } },
      { type: 'gainGold', amount: 200 },
    ],
    rewards: { exp: 120, gold: 250 },
  },
  {
    id: 'forest-herbs',
    nameCN: '采药奇遇',
    descriptionCN: '你在森林中发现了一片珍贵的药草。',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'forest', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'gainItem', item: { id: 'green-herb', name: 'Green Herb', nameCN: '青叶草', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Green herb', descriptionCN: '可用于炼药的草本', stackable: true, quantity: 3 } },
    ],
    rewards: { exp: 20, gold: 0 },
  },
  {
    id: 'temple-donation',
    nameCN: '寺庙捐赠',
    descriptionCN: '你向寺庙捐赠了一些香火钱。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'temple' },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '捐赠50铜钱',
        cost: { gold: 50 },
        result: {
          success: true,
          message: '静心大师微笑点头，为你祈福。',
          effects: [
            { type: 'modifyAttribute', attribute: 'luck', value: 1 },
          ],
          rewards: { exp: 30 },
        },
      },
      {
        text: '捐赠200铜钱',
        cost: { gold: 200 },
        result: {
          success: true,
          message: '大师对你的虔诚印象深刻，传授你高深功法。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
            { type: 'learnTechnique', techniqueId: 'ling-bo' },
          ],
          rewards: { exp: 100 },
        },
      },
      {
        text: '不捐赠，默默离开',
        cost: {},
        result: {
          success: true,
          message: '你默默参观后离开。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },
  {
    id: 'village-shop',
    nameCN: '平安镇商铺',
    descriptionCN: '小镇上的商铺有新到的货物。',
    type: 'shop',
    triggerCondition: { type: 'location', locationId: 'village' },
    prerequisiteEvents: [],
    isExclusive: false,
    shopItems: [
      { id: 'herb-1', nameCN: '金创药', price: 25, type: 'consumable', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, descriptionCN: '基础伤药', stackable: true, quantity: 5 },
      { id: 'herb-2', nameCN: '续命丹', price: 100, type: 'consumable', effects: { maxHPBonus: 20, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, descriptionCN: '回复50HP并永久增加HP上限', stackable: true, quantity: 2 },
      { id: 'iron-dagger', nameCN: '铁匕首', price: 80, type: 'weapon', effects: { attackBonus: 8, defenseBonus: 0, maxHPBonus: 0, speedBonus: 0 }, descriptionCN: '基础武器', stackable: false, quantity: 1 },
    ],
  },
];

export function getEvent(id: string): GameEvent | undefined {
  return EVENTS.find(e => e.id === id);
}

export function getEventsByLocation(locationId: string): GameEvent[] {
  return EVENTS.filter(e =>
    e.triggerCondition.type === 'location' && e.triggerCondition.locationId === locationId
  );
}
