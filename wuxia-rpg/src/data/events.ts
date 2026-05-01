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
  {
    id: 'ruined-temple-hermit',
    nameCN: '破庙隐者',
    descriptionCN: '你在破庙中发现一位白发苍苍的老者正在打坐。他似乎在此隐居多年。',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'ruined-temple', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 3 },
      { type: 'modifyAttribute', attribute: 'physique', value: 2 },
    ],
    rewards: { exp: 300, gold: 0 },
  },
  {
    id: 'broken-statue-secret',
    nameCN: '石像秘密',
    descriptionCN: '你仔细观察残破的佛像，发现佛像的眼睛似乎可以转动。转动之后，佛像背后出现了一个暗格！',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'ruined-temple', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'gainItem', item: { id: 'jade-stone', name: 'Jade Stone', nameCN: '玉石', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Precious jade stone', descriptionCN: '珍贵的玉石', stackable: true, quantity: 5 } },
      { type: 'gainItem', item: { id: 'spirit-essence', name: 'Spirit Essence', nameCN: '灵韵精华', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Essence containing spiritual energy', descriptionCN: '蕴含灵气的精华', stackable: true, quantity: 2 } },
      { type: 'gainGold', amount: 500 },
    ],
    rewards: { exp: 200, gold: 200 },
  },
  {
    id: 'underground-cellar-discovery',
    nameCN: '地窖发现',
    descriptionCN: '你进入地窖，发现这里竟然是一个地下练功房！墙上刻着一些武学图谱...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'ruined-temple', minVisits: 4 },
    prerequisiteEvents: ['broken-statue-secret'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'strength', value: 2 },
      { type: 'modifyAttribute', attribute: 'agility', value: 2 },
    ],
    rewards: { exp: 250, gold: 0 },
  },
  {
    id: 'waterfall-cave-recluse',
    nameCN: '水帘洞隐士',
    descriptionCN: '你穿过瀑布，发现洞中竟然有人居住！一位白发老者正在练剑，剑法精妙绝伦...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'waterfall-cave', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'agility', value: 3 },
      { type: 'modifyAttribute', attribute: 'insight', value: 2 },
    ],
    rewards: { exp: 350, gold: 100 },
  },
  {
    id: 'graveyard-ghost-story',
    nameCN: '乱葬岗异事',
    descriptionCN: '你在乱葬岗中听到一阵奇怪的声音，似乎有人在低语...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'graveyard', minVisits: 1 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '循声探索',
        cost: {},
        result: {
          success: true,
          message: '你发现声音来自一座古老的墓碑前，墓碑下压着一本泛黄的书籍...',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 150 },
        },
      },
      {
        text: '快速离开',
        cost: {},
        result: {
          success: true,
          message: '你感到一阵寒意，决定不再停留，快步离开。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },
  {
    id: 'ancient-tomb-jade-room',
    nameCN: '古墓玉室',
    descriptionCN: '你进入玉室，发现这里果然是墓主人的寝室。玉床上放着一个精美的玉匣...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'ancient-tomb', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'gainItem', item: { id: 'spirit-essence', name: 'Spirit Essence', nameCN: '灵韵精华', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Essence containing spiritual energy', descriptionCN: '蕴含灵气的精华', stackable: true, quantity: 5 } },
      { type: 'gainItem', item: { id: 'jade-stone', name: 'Jade Stone', nameCN: '玉石', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Precious jade stone', descriptionCN: '珍贵的玉石', stackable: true, quantity: 10 } },
      { type: 'gainGold', amount: 1000 },
    ],
    rewards: { exp: 400, gold: 500 },
  },
  {
    id: 'secret-passage-martial-art',
    nameCN: '秘道武学',
    descriptionCN: '你沿着秘道深入，发现墙壁上刻满了武学秘籍。这似乎是一位前辈高人留下的...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'ancient-tomb', minVisits: 3 },
    prerequisiteEvents: ['ancient-tomb-jade-room'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'constitution', value: 3 },
      { type: 'modifyAttribute', attribute: 'physique', value: 3 },
      { type: 'modifyAttribute', attribute: 'strength', value: 2 },
    ],
    rewards: { exp: 500, gold: 0 },
  },
  {
    id: 'peach-garden-encounter',
    nameCN: '桃花园奇遇',
    descriptionCN: '你在桃花园中漫步，落英缤纷，美不胜收。忽然，你发现一位白衣女子正在树下弹琴...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'river-island', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 3 },
      { type: 'modifyAttribute', attribute: 'agility', value: 2 },
      { type: 'modifyAttribute', attribute: 'luck', value: 2 },
    ],
    rewards: { exp: 350, gold: 200 },
  },
  {
    id: 'stone-maze-puzzle',
    nameCN: '石阵奥秘',
    descriptionCN: '你仔细研究石阵，发现其中蕴含着高深的武学原理。经过一番苦思冥想，你似乎领悟了什么...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'river-island', minVisits: 3 },
    prerequisiteEvents: ['peach-garden-encounter'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 4 },
      { type: 'modifyAttribute', attribute: 'physique', value: 3 },
    ],
    rewards: { exp: 450, gold: 0 },
  },
  {
    id: 'bandit-treasure-room',
    nameCN: '山贼宝库',
    descriptionCN: '你找到了山贼的宝库！里面堆满了金银珠宝...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'bandit-lair', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'gainGold', amount: 1000 },
      { type: 'gainItem', item: { id: 'jade-stone', name: 'Jade Stone', nameCN: '玉石', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Precious jade stone', descriptionCN: '珍贵的玉石', stackable: true, quantity: 8 } },
      { type: 'gainItem', item: { id: 'silver-ore', name: 'Silver Ore', nameCN: '银矿石', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Silver ore', descriptionCN: '银矿石', stackable: true, quantity: 15 } },
    ],
    rewards: { exp: 300, gold: 500 },
  },
  {
    id: 'poison-valley-herbs',
    nameCN: '毒谷灵药',
    descriptionCN: '你在万毒谷中发现了许多珍稀的药草，虽然有毒，但也有极高的药用价值...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'poison-valley', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'gainItem', item: { id: 'spirit-essence', name: 'Spirit Essence', nameCN: '灵韵精华', type: 'material', effects: { maxHPBonus: 0, attackBonus: 0, defenseBonus: 0, speedBonus: 0 }, description: 'Essence containing spiritual energy', descriptionCN: '蕴含灵气的精华', stackable: true, quantity: 3 } },
    ],
    rewards: { exp: 100, gold: 0 },
  },
  {
    id: 'evil-valley-meeting',
    nameCN: '恶人谷遭遇',
    descriptionCN: '你在恶人谷中遇到了几位奇人异士，他们虽然被称为恶人，但似乎也有自己的故事...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'evil-valley', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 3 },
      { type: 'modifyAttribute', attribute: 'agility', value: 2 },
      { type: 'modifyAttribute', attribute: 'luck', value: 2 },
    ],
    rewards: { exp: 400, gold: 300 },
  },
  {
    id: 'black-wind-mountain-boss',
    nameCN: '黑风山寨主',
    descriptionCN: '你深入黑风山，遇到了山贼的大头领！他手持一把大刀，气势汹汹...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'black-wind-mountain', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'evildoer' },
    ],
    rewards: { exp: 300, gold: 500 },
  },
  {
    id: 'south-road-traveler',
    nameCN: '南驿道旅人',
    descriptionCN: '你在南驿道上遇到一位受伤的旅人，他似乎被贼人袭击了...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'south-road', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '出手相助',
        cost: {},
        result: {
          success: true,
          message: '你为旅人包扎伤口，他感激不尽，告诉你一些江湖秘闻作为回报。',
          effects: [
            { type: 'modifyAttribute', attribute: 'luck', value: 2 },
          ],
          rewards: { exp: 80, gold: 50 },
        },
      },
      {
        text: '匆匆离去',
        cost: {},
        result: {
          success: true,
          message: '你担心是陷阱，决定不多停留，继续赶路。',
          effects: [],
          rewards: { exp: 5 },
        },
      },
    ],
  },
  {
    id: 'ferry-inn-rumor',
    nameCN: '渡头客栈消息',
    descriptionCN: '你在渡头客栈休息时，听到旁边桌的客人在谈论江湖上的大事...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'river-crossing', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 1 },
    ],
    rewards: { exp: 50, gold: 0 },
  },
  {
    id: 'shaolin-encounter',
    nameCN: '少林奇遇',
    descriptionCN: '你在少林寺中表现虔诚，玄慈方丈决定亲自指点你一二。',
    type: 'story',
    triggerCondition: { type: 'location', locationId: 'city-shaolin', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'constitution', value: 3 },
      { type: 'modifyAttribute', attribute: 'physique', value: 3 },
      { type: 'modifyAttribute', attribute: 'strength', value: 2 },
    ],
    rewards: { exp: 500, gold: 0 },
  },
  {
    id: 'wudang-enlightenment',
    nameCN: '武当悟道',
    descriptionCN: '张真人见你根骨不凡，与你论道三日。你从中领悟了太极武学的真谛...',
    type: 'story',
    triggerCondition: { type: 'location', locationId: 'city-wudang', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 4 },
      { type: 'modifyAttribute', attribute: 'agility', value: 3 },
      { type: 'modifyAttribute', attribute: 'physique', value: 2 },
    ],
    rewards: { exp: 600, gold: 0 },
  },
  {
    id: 'huashan-sword-lesson',
    nameCN: '华山剑法',
    descriptionCN: '岳掌门见你剑法基础扎实，决定传授你华山派的精妙剑法...',
    type: 'story',
    triggerCondition: { type: 'location', locationId: 'city-huashan', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'modifyAttribute', attribute: 'agility', value: 3 },
      { type: 'modifyAttribute', attribute: 'strength', value: 3 },
      { type: 'modifyAttribute', attribute: 'insight', value: 2 },
    ],
    rewards: { exp: 550, gold: 0 },
  },
  {
    id: 'xiangyang-inn-meeting',
    nameCN: '悦来客栈相遇',
    descriptionCN: '你在悦来客栈中遇到一位豪爽的侠客，他请你喝酒，与你畅谈江湖事...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'city-xiangyang', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'modifyAttribute', attribute: 'insight', value: 2 },
      { type: 'modifyAttribute', attribute: 'luck', value: 1 },
    ],
    rewards: { exp: 150, gold: 100 },
  },
  {
    id: 'luoyang-antique-find',
    nameCN: '洛阳古玩',
    descriptionCN: '你在洛阳城的聚宝斋中闲逛，发现一件看似普通的古玩，仔细端详后发现其中大有文章...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-luoyang', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    choices: [
      {
        text: '花500铜钱买下',
        cost: { gold: 500 },
        result: {
          success: true,
          message: '你打开古玩，发现里面藏着一份武学秘籍！',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 5 },
            { type: 'modifyAttribute', attribute: 'strength', value: 2 },
          ],
          rewards: { exp: 400 },
        },
      },
      {
        text: '只看不买',
        cost: {},
        result: {
          success: true,
          message: '你觉得价格太贵，决定再看看其他东西。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },
  {
    id: 'cave-monster-encounter',
    nameCN: '洞府妖兽',
    descriptionCN: '你深入幽冥洞府，突然听到一阵低沉的咆哮声...一头巨大的妖兽从黑暗中冲出！',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'cave', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'cave-monster' },
    ],
    rewards: { exp: 200, gold: 300 },
  },
  {
    id: 'black-wind-boss-fight',
    nameCN: '黑风寨主',
    descriptionCN: '你深入黑风山腹地，终于找到了山贼大寨！大寨主手持大刀王手持一柄沉重的大刀，身后站在你面前...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'bandit-lair', minVisits: 2 },
    prerequisiteEvents: ['black-wind-mountain-boss'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'black-wind-boss' },
    ],
    rewards: { exp: 350, gold: 600 },
  },
  {
    id: 'poison-valley-boss-fight',
    nameCN: '万毒谷主',
    descriptionCN: '你在万毒谷深处，遇到了万毒谷主！他手持毒术精通各种剧毒，杀人于无形...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'poison-valley', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'poison-valley-boss' },
    ],
    rewards: { exp: 400, gold: 500 },
  },
  {
    id: 'evil-valley-leader-fight',
    nameCN: '恶人谷主',
    descriptionCN: '你在恶人谷中名声渐起，终于引起了谷主的注意。他决定亲自出手，试试你的斤两...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'evil-valley', minVisits: 4 },
    prerequisiteEvents: ['evil-valley-meeting'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'evil-valley-leader' },
    ],
    rewards: { exp: 450, gold: 700 },
  },
  {
    id: 'ancient-tomb-boss-fight',
    nameCN: '古墓危机',
    descriptionCN: '你在古墓深处，惊动了千年尸王！它从玉棺中破棺而出，誓要将你化为僵尸...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'ancient-tomb', minVisits: 4 },
    prerequisiteEvents: ['secret-passage-martial-art'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'jiangshi-king' },
    ],
    rewards: { exp: 500, gold: 800 },
  },
  {
    id: 'blood-sect-master-fight',
    nameCN: '血神教主',
    descriptionCN: '你追踪血神教的踪迹，终于找到了教主的藏身处。一场生死之战即将开始...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'evil-valley', minVisits: 5 },
    prerequisiteEvents: ['evil-valley-leader-fight'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'blood-sect-master' },
    ],
    rewards: { exp: 600, gold: 1000 },
  },
  {
    id: 'waterfall-cave-master-hermit-challenge',
    nameCN: '隐士考验',
    descriptionCN: '水帘洞的白发老者见你武功精进，决定亲自出手考验你的实力...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'waterfall-cave', minVisits: 4 },
    prerequisiteEvents: ['waterfall-cave-recluse'],
    isExclusive: true,
    exclusiveWith: [],
    actions: [
      { type: 'startCombat', enemyId: 'demon-cult-elder' },
    ],
    rewards: { exp: 400, gold: 500 },
  },

  {
    id: 'temple-scripture-enlightenment',
    nameCN: '藏经阁顿悟',
    descriptionCN: '你在藏经阁中研读一本泛黄的古籍，突然，一段文字仿佛活了过来，在你脑海中浮现出一幅幅武学图谱...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'temple', minVisits: 3 },
    prerequisiteEvents: ['monk-blessing'],
    isExclusive: true,
    choices: [
      {
        text: '静心领悟（需要悟性7+）',
        cost: {},
        result: {
          success: true,
          message: '你闭目沉思，将古籍中的文字与自身武学融会贯通。突然，你感觉体内真气流转方式发生了变化...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'iron-skin' },
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 200 },
        },
      },
      {
        text: '抄录一份带走',
        cost: {},
        result: {
          success: true,
          message: '你将古籍中的重要内容抄录下来，准备日后再慢慢研究。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 50 },
        },
      },
    ],
  },

  {
    id: 'forest-martial-art-scroll',
    nameCN: '林间秘籍',
    descriptionCN: '你在森林深处发现一个被藤蔓覆盖的石洞，洞内石桌上放着一个落满灰尘的木匣...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'deep-forest', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 5 },
    },
    choices: [
      {
        text: '打开木匣查看',
        cost: {},
        result: {
          success: true,
          message: '木匣中放着一本泛黄的秘籍，封面上写着「猛虎拳法」四个大字。翻开细看，招招狠辣，气势磅礴...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'tiger-claw' },
          ],
          rewards: { exp: 150, gold: 50 },
        },
      },
      {
        text: '小心检查是否有机关',
        cost: {},
        result: {
          success: true,
          message: '你仔细检查木匣，发现没有机关。打开后，里面除了秘籍，还藏着一小包银子...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'tiger-claw' },
            { type: 'gainGold', amount: 100 },
          ],
          rewards: { exp: 180, gold: 100 },
        },
      },
    ],
  },

  {
    id: 'cave-shadow-art-learning',
    nameCN: '暗影传承',
    descriptionCN: '幽冥洞府深处，墙壁上刻满了诡异的图谱。这些图谱似乎在描绘一种诡异的身法...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'cave', minVisits: 4 },
    prerequisiteEvents: ['cave-treasure'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { agility: 6, insight: 6 },
    },
    choices: [
      {
        text: '尝试领悟身法',
        cost: {},
        result: {
          success: true,
          message: '你仔细观察墙上的图谱，发现这些动作虽然诡异，但却蕴含着极高的闪避技巧。经过一番苦思，你终于领悟了其中的奥妙...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'ling-bo' },
            { type: 'modifyAttribute', attribute: 'agility', value: 2 },
          ],
          rewards: { exp: 250 },
        },
      },
      {
        text: '感觉太过凶险，放弃',
        cost: {},
        result: {
          success: true,
          message: '你觉得这些图谱太过诡异，似乎隐藏着某种危险，决定不再深究。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'ruined-temple-hermit-teaching',
    nameCN: '隐者授艺',
    descriptionCN: '破庙中的白发老者睁开眼睛，深深地看了你一眼。「年轻人，你与我有缘，我且问你，何为武学？」',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'ruined-temple', minVisits: 3 },
    prerequisiteEvents: ['ruined-temple-hermit'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 7 },
    },
    choices: [
      {
        text: '武学是用来锄强扶弱的',
        cost: {},
        result: {
          success: true,
          message: '老者微微点头：「说得好。武学之道，首重武德。你有此心，便有资格学我这套功夫。」说罢，老者开始为你讲解一套高深的内功心法...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'iron-skin' },
            { type: 'modifyAttribute', attribute: 'physique', value: 2 },
          ],
          rewards: { exp: 300 },
        },
      },
      {
        text: '武学是用来变强自保的',
        cost: {},
        result: {
          success: true,
          message: '老者叹了口气：「自保固然重要，但武学的真意远不止于此。罢了，你既与我武学无缘，我便传你一些防身之术吧。」',
          effects: [
            { type: 'modifyAttribute', attribute: 'strength', value: 1 },
            { type: 'modifyAttribute', attribute: 'defense', value: 1 },
          ],
          rewards: { exp: 100 },
        },
      },
      {
        text: '晚辈不知，请前辈指点',
        cost: {},
        result: {
          success: true,
          message: '老者露出欣慰的笑容：「不知为不知，是知也。年轻人，你有这份谦逊之心，将来必成大器。今日，我便将毕生所学倾囊相授...」',
          effects: [
            { type: 'learnTechnique', techniqueId: 'iron-skin' },
            { type: 'modifyAttribute', attribute: 'insight', value: 3 },
            { type: 'modifyAttribute', attribute: 'physique', value: 2 },
          ],
          rewards: { exp: 400 },
        },
      },
    ],
  },

  {
    id: 'graveyard-ancient-book',
    nameCN: '古墓遗书',
    descriptionCN: '你在一座古老的墓碑前发现了一个石匣，打开后里面是一本残破的书籍，封面上写着「化骨绵掌」四个字...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'graveyard', minVisits: 2 },
    prerequisiteEvents: ['graveyard-ghost-story'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 6, physique: 5 },
    },
    choices: [
      {
        text: '仔细研读秘籍',
        cost: {},
        result: {
          success: true,
          message: '这本秘籍虽然残破，但核心招式依然完整。「化骨绵掌」看似轻柔，实则刚劲暗藏，中者筋骨俱断。经过一番苦练，你终于掌握了这套掌法的入门技巧...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'tiger-claw' },
            { type: 'modifyAttribute', attribute: 'strength', value: 2 },
          ],
          rewards: { exp: 200 },
        },
      },
      {
        text: '感觉太过阴毒，不适合学习',
        cost: {},
        result: {
          success: true,
          message: '你觉得这套掌法太过阴狠，有伤天和，决定不学习。但你从中学到了一些发力技巧，也算是有所收获。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 50 },
        },
      },
    ],
  },

  {
    id: 'poison-valley-antidote-learning',
    nameCN: '毒经领悟',
    descriptionCN: '你在万毒谷深处发现一个隐秘的石室，室内石壁上刻满了各种毒物的图案和解毒之法...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'poison-valley', minVisits: 3 },
    prerequisiteEvents: ['poison-valley-herbs'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 7, constitution: 6 },
    },
    choices: [
      {
        text: '仔细研究石壁上的内容',
        cost: {},
        result: {
          success: true,
          message: '石壁上记载的不仅是毒物知识，更蕴含了一套以毒攻毒的武学原理。你从中领悟到了内功修炼的新法门...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'nine-yang' },
            { type: 'modifyAttribute', attribute: 'constitution', value: 3 },
          ],
          rewards: { exp: 350 },
        },
      },
      {
        text: '只记录解毒方法',
        cost: {},
        result: {
          success: true,
          message: '你将石壁上的解毒方法记录下来，这些知识日后必有大用。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
            { type: 'modifyAttribute', attribute: 'constitution', value: 1 },
          ],
          rewards: { exp: 100 },
        },
      },
    ],
  },

  {
    id: 'peach-garden-female-teaching',
    nameCN: '琴音悟道',
    descriptionCN: '白衣女子的琴声越来越急，忽然间，你感觉琴声中似乎蕴含着某种武学道理...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'river-island', minVisits: 3 },
    prerequisiteEvents: ['peach-garden-encounter'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 8, agility: 6 },
    },
    choices: [
      {
        text: '静心聆听，领悟琴中音',
        cost: {},
        result: {
          success: true,
          message: '你闭目聆听，感觉自己仿佛化作了音符，在琴弦间跳跃。琴音忽快忽慢，忽高忽低，你从中领悟了一套以音律入武的身法...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'ling-bo' },
            { type: 'modifyAttribute', attribute: 'agility', value: 3 },
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 400 },
        },
      },
      {
        text: '上前与女子交谈',
        cost: {},
        result: {
          success: true,
          message: '女子停止弹琴，转过头来看你。她的目光清澈如水，仿佛能看透你的心思。「你终于来了。」她微微一笑，「我等你很久了。」说罢，她开始为你讲解桃花岛的武学精义...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'ling-bo' },
            { type: 'modifyAttribute', attribute: 'insight', value: 3 },
          ],
          rewards: { exp: 350, gold: 200 },
        },
      },
    ],
  },

  {
    id: 'stone-maze-enlightenment',
    nameCN: '石阵悟太极',
    descriptionCN: '你站在石阵中央，感受着四周巨石的排列。忽然间，你感觉这些巨石的位置似乎暗合某种天道循环之理...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'river-island', minVisits: 4 },
    prerequisiteEvents: ['stone-maze-puzzle'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 9, physique: 7 },
    },
    choices: [
      {
        text: '以石阵为师，感悟天道',
        cost: {},
        result: {
          success: true,
          message: '你在石阵中静坐三日，感受着石阵的阴阳变化、生克之理。终于，你明白了：刚不可久，柔不可守，阴阳相济，方为太极。一套以柔克刚、以静制动的内功心法在你心中成型...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'nine-yin' },
            { type: 'modifyAttribute', attribute: 'insight', value: 4 },
            { type: 'modifyAttribute', attribute: 'physique', value: 3 },
          ],
          rewards: { exp: 500 },
        },
      },
      {
        text: '尝试找出破阵之法',
        cost: {},
        result: {
          success: true,
          message: '你仔细研究石阵，发现了其中的一些规律。虽然未能完全领悟石阵的真谛，但也学到了不少东西。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
            { type: 'modifyAttribute', attribute: 'agility', value: 1 },
          ],
          rewards: { exp: 150 },
        },
      },
    ],
  },

  {
    id: 'ancient-tomb-jade-girl-encounter',
    nameCN: '玉室佳人',
    descriptionCN: '你进入玉室，发现玉床上并非空无一物，而是坐着一位白衣女子，她似乎已经在此等待了很久...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'ancient-tomb', minVisits: 3 },
    prerequisiteEvents: ['ancient-tomb-jade-room'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 8, physique: 8 },
    },
    choices: [
      {
        text: '恭敬地行礼，询问女子身份',
        cost: {},
        result: {
          success: true,
          message: '女子缓缓睁开眼睛，看着你微微一笑。「你终于来了。我是古墓派的守护者，在此等待有缘人已百年。你既来了，便是有缘。我且问你，你愿学古墓派的武学吗？」',
          effects: [
            { type: 'learnTechnique', techniqueId: 'nine-yin' },
            { type: 'modifyAttribute', attribute: 'insight', value: 3 },
            { type: 'modifyAttribute', attribute: 'agility', value: 2 },
          ],
          rewards: { exp: 450 },
        },
      },
      {
        text: '保持警惕，观察女子的动作',
        cost: {},
        result: {
          success: true,
          message: '女子似乎看穿了你的心思，轻轻叹了口气。「罢了，你既无心学，我也不勉强。但你既入我古墓，便是有缘，送你一场造化吧。」说罢，她玉手轻挥，一股柔和的内力注入你的体内...',
          effects: [
            { type: 'modifyAttribute', attribute: 'constitution', value: 3 },
            { type: 'modifyAttribute', attribute: 'physique', value: 2 },
          ],
          rewards: { exp: 300, gold: 300 },
        },
      },
    ],
  },

  {
    id: 'evil-valley-oddity-teaching',
    nameCN: '恶人谷奇遇',
    descriptionCN: '几位奇人异士围着你上下打量，其中一人说道：「这小子根骨不错，不知有没有资格学我们的功夫？」',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'evil-valley', minVisits: 3 },
    prerequisiteEvents: ['evil-valley-meeting'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 7, luck: 5 },
    },
    choices: [
      {
        text: '恳请各位前辈赐教',
        cost: {},
        result: {
          success: true,
          message: '几位奇人异士相视一笑，开始轮流为你讲解武学。他们的武学路子虽然各不相同，却都精妙无比。你博采众长，领悟了一套独特的内功心法...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'bei-ming' },
            { type: 'modifyAttribute', attribute: 'insight', value: 3 },
            { type: 'modifyAttribute', attribute: 'luck', value: 2 },
          ],
          rewards: { exp: 400 },
        },
      },
      {
        text: '表示只想与他们交朋友',
        cost: {},
        result: {
          success: true,
          message: '几位奇人异士愣了一下，随即哈哈大笑。「有意思！很久没有人敢这么跟我们说话了。好，从今以后，你就是我们的朋友！」他们开始与你分享江湖上的奇闻轶事，让你获益良多...',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
            { type: 'modifyAttribute', attribute: 'luck', value: 3 },
          ],
          rewards: { exp: 200, gold: 200 },
        },
      },
    ],
  },

  {
    id: 'shaolin-advanced-learning',
    nameCN: '少林藏经',
    descriptionCN: '玄慈方丈带你来到藏经阁深处，这里收藏着少林寺最上乘的武学典籍...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-shaolin', minVisits: 4 },
    prerequisiteEvents: ['shaolin-encounter'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 9, physique: 10 },
    },
    choices: [
      {
        text: '恳请方丈传授上乘武学',
        cost: {},
        result: {
          success: true,
          message: '玄慈方丈点点头：「你与我少林有缘，今日我便传你《易筋经》的入门心法。此经能易筋洗髓，脱胎换骨，是我少林的镇寺之宝。你要好生修习，不可用来作恶。」',
          effects: [
            { type: 'learnTechnique', techniqueId: 'yi-jin' },
            { type: 'modifyAttribute', attribute: 'constitution', value: 4 },
            { type: 'modifyAttribute', attribute: 'physique', value: 3 },
          ],
          rewards: { exp: 600 },
        },
      },
      {
        text: '表示只想研读基础典籍',
        cost: {},
        result: {
          success: true,
          message: '玄慈方丈微微一笑：「基础扎实，方能攀登高峰。你有这份心性，难得。」他指点你研读了一些基础但极为重要的武学理论，让你受益匪浅。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 3 },
            { type: 'modifyAttribute', attribute: 'physique', value: 2 },
          ],
          rewards: { exp: 300 },
        },
      },
    ],
  },

  {
    id: 'wudang-taoist-enlightenment',
    nameCN: '武当悟道',
    descriptionCN: '张真人带你来到武当山的最高峰，让你眺望云海，感受天地之道...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-wudang', minVisits: 4 },
    prerequisiteEvents: ['wudang-enlightenment'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 10, agility: 8 },
    },
    choices: [
      {
        text: '静坐感悟，与天地合一',
        cost: {},
        result: {
          success: true,
          message: '你静坐云端，感受着云海的起伏、山风的吹拂。忽然间，你感觉自己与天地融为了一体。云动，风动，心动？不，是万物皆在道中。一套以道入武的太极功夫在你心中自然成型...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'qian-kun' },
            { type: 'modifyAttribute', attribute: 'insight', value: 5 },
            { type: 'modifyAttribute', attribute: 'agility', value: 3 },
            { type: 'modifyAttribute', attribute: 'physique', value: 3 },
          ],
          rewards: { exp: 700 },
        },
      },
      {
        text: '向张真人请教太极真谛',
        cost: {},
        result: {
          success: true,
          message: '张真人微微一笑，开始为你讲解太极的精义。「太极者，无极而生，动静之机，阴阳之母也...」随着他的讲解，你感觉一扇武学的大门在你面前缓缓打开...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'qian-kun' },
            { type: 'modifyAttribute', attribute: 'insight', value: 4 },
            { type: 'modifyAttribute', attribute: 'physique', value: 2 },
          ],
          rewards: { exp: 550 },
        },
      },
    ],
  },

  {
    id: 'huashan-sword-mastery',
    nameCN: '华山剑境',
    descriptionCN: '岳掌门带你来到华山的思过崖，崖上刻满了历代华山掌门的剑法心得...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-huashan', minVisits: 4 },
    prerequisiteEvents: ['huashan-sword-lesson'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 9, agility: 10, strength: 8 },
    },
    choices: [
      {
        text: '仔细研读崖上剑法',
        cost: {},
        result: {
          success: true,
          message: '你逐字逐句研读崖上的剑法心得，感觉自己的剑法境界在不断提升。从基础招式到剑意，再到剑心，你逐渐领悟了华山剑法的真谛——料敌先机，后发制人...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'du-gu' },
            { type: 'modifyAttribute', attribute: 'agility', value: 4 },
            { type: 'modifyAttribute', attribute: 'strength', value: 3 },
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 600 },
        },
      },
      {
        text: '请求岳掌门亲自指点',
        cost: {},
        result: {
          success: true,
          message: '岳掌门点点头，提起一柄木剑开始为你演示。他的剑法看似平平无奇，但每一招都蕴含着无穷的后招。「看好了，这招「白云出岫」可以这样变...」在他的指点下，你对剑法的理解突飞猛进...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'du-gu' },
            { type: 'modifyAttribute', attribute: 'agility', value: 3 },
            { type: 'modifyAttribute', attribute: 'insight', value: 3 },
          ],
          rewards: { exp: 500 },
        },
      },
    ],
  },

  {
    id: 'luoyang-antique-secret',
    nameCN: '古玩密藏',
    descriptionCN: '你在聚宝斋中闲逛，忽然注意到一件看似普通的古玩，它的底座似乎可以旋转...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-luoyang', minVisits: 3 },
    prerequisiteEvents: ['luoyang-antique-find'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 8, luck: 6 },
    },
    choices: [
      {
        text: '尝试旋转底座（需要800铜钱）',
        cost: { gold: 800 },
        result: {
          success: true,
          message: '底座旋转一周后，古玩的顶盖缓缓打开，里面藏着一个羊皮卷轴！展开一看，上面绘制着一套精妙的指法图谱——「一阳指」！',
          effects: [
            { type: 'learnTechnique', techniqueId: 'one-finger' },
            { type: 'modifyAttribute', attribute: 'insight', value: 3 },
          ],
          rewards: { exp: 450 },
        },
      },
      {
        text: '先向掌柜询问这件古玩的来历',
        cost: {},
        result: {
          success: true,
          message: '掌柜叹了口气：「这件古玩是我从一个破落贵族手上收来的，据说是什么大理段氏的遗物，但我研究了很久也没发现什么特别。你要是喜欢，500铜钱拿去。」',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 50 },
        },
      },
    ],
  },

  {
    id: 'village-martial-training',
    nameCN: '镇武馆切磋',
    descriptionCN: '武馆馆主看着你，微微一笑：「年轻人，想要切磋武艺？先赢了我再说。」',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'village', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '接受挑战',
        cost: {},
        result: {
          success: true,
          message: '你与馆主展开一场激烈的切磋。馆主的武功扎实稳重，招招都是根基功夫。一番较量后，你虽然略逊一筹，但从中学到了很多实战经验...',
          effects: [
            { type: 'modifyAttribute', attribute: 'strength', value: 1 },
            { type: 'modifyAttribute', attribute: 'physique', value: 1 },
          ],
          rewards: { exp: 80 },
        },
      },
      {
        text: '表示只想请教基础',
        cost: {},
        result: {
          success: true,
          message: '馆主点点头：「基础扎实，才能走得更远。好，我便教你一些扎马步、打木桩的基础功夫。」在他的指点下，你的根基更加稳固了。',
          effects: [
            { type: 'modifyAttribute', attribute: 'physique', value: 2 },
          ],
          rewards: { exp: 50 },
        },
      },
    ],
  },

  {
    id: 'south-road-traveler-reward',
    nameCN: '旅人报恩',
    descriptionCN: '你再次在南驿道遇到那位旅人，他看起来已经完全康复了。「恩公！终于又见到你了！」',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'south-road', minVisits: 4 },
    prerequisiteEvents: ['south-road-traveler'],
    isExclusive: true,
    choices: [
      {
        text: '询问他的情况',
        cost: {},
        result: {
          success: true,
          message: '旅人感激地说道：「恩公，那日多亏了你，我才能捡回一条命。实不相瞒，我是洛阳城的镖师，那日护送一批宝物遭到贼人袭击。这些宝物对我而言已经无用，但对恩公这样的江湖人士可能有些帮助。」说罢，他递给你一本武学秘籍和一些银两...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'iron-skin' },
            { type: 'gainGold', amount: 300 },
          ],
          rewards: { exp: 200, gold: 300 },
        },
      },
      {
        text: '表示只是举手之劳',
        cost: {},
        result: {
          success: true,
          message: '旅人见你推辞，更加敬佩：「恩公高义，在下佩服！既然如此，我便告诉你一个消息——前方破庙中隐居着一位高人，他可能愿意指点有缘人一二。」',
          effects: [
            { type: 'modifyAttribute', attribute: 'luck', value: 2 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 150 },
        },
      },
    ],
  },

  {
    id: 'blacksmith-master-teaching',
    nameCN: '铁匠心得',
    descriptionCN: '王铁匠停下手中的活计，看着你说道：「年轻人，我看你经常来我这铁匠铺，是对打铁感兴趣，还是对武学感兴趣？」',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'village', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '对武学感兴趣',
        cost: {},
        result: {
          success: true,
          message: '王铁匠哈哈大笑：「好！不瞒你说，我年轻时也是江湖中人，后来厌倦了打打杀杀，才在这里开了这家铁匠铺。武学之道，一力降十会。我这有一套「铁砂掌」的入门心法，你若是感兴趣，便拿去练练。」',
          effects: [
            { type: 'learnTechnique', techniqueId: 'iron-palm' },
            { type: 'modifyAttribute', attribute: 'strength', value: 1 },
          ],
          rewards: { exp: 100 },
        },
      },
      {
        text: '对打铁感兴趣',
        cost: {},
        result: {
          success: true,
          message: '王铁匠满意地点点头：「好！现在的年轻人很少有愿意学手艺的了。来，我教你一些打铁的基本技巧。记住，打铁如练武，同样需要腰马合一、心静如水。」',
          effects: [
            { type: 'modifyAttribute', attribute: 'strength', value: 2 },
            { type: 'modifyAttribute', attribute: 'constitution', value: 1 },
          ],
          rewards: { exp: 60 },
        },
      },
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
