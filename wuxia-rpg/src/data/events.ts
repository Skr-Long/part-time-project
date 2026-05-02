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
            { type: 'modifyAttribute', attribute: 'physique', value: 1 },
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

  {
    id: 'shaolin-route-monk-encounter',
    nameCN: '少林僧人',
    descriptionCN: '你在少林山道上遇到一位年轻的僧人，他正背着一捆柴往山上走。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'shaolin-route', minVisits: 1 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '主动上前打招呼',
        cost: {},
        result: {
          success: true,
          message: '僧人转过身，双手合十：「阿弥陀佛，施主是要上少林寺吗？山路崎岖，还请小心。」他告诉你一些少林的规矩和注意事项，让你受益匪浅。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 50 },
        },
      },
      {
        text: '默默赶路，不打扰',
        cost: {},
        result: {
          success: true,
          message: '你点头示意，继续赶路。僧人也回了一礼，继续背柴上山。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'shaolin-route-bandit-attack',
    nameCN: '山道遇袭',
    descriptionCN: '你正在山路上行走，突然从路旁的树丛中跳出几个蒙面人！',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'shaolin-route', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'startCombat', enemyId: 'mountain-bandit' },
    ],
    rewards: { exp: 100, gold: 80 },
  },

  {
    id: 'shaolin-route-wounded-monk',
    nameCN: '受伤僧人',
    descriptionCN: '你在山道旁发现一位受伤的僧人，他靠在一棵大树下，神色痛苦。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'shaolin-route', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: true,
    choices: [
      {
        text: '上前查看伤势，出手相助',
        cost: {},
        result: {
          success: true,
          message: '僧人虚弱地睁开眼睛：「多谢施主...我被山贼所伤，若不是施主相救，恐怕今日就要圆寂于此。这是我少林的入门心法，施主若是不嫌弃，便拿去看看吧。」说罢，他从怀中取出一本小册子递给你。',
          effects: [
            { type: 'learnTechnique', techniqueId: 'iron-skin' },
            { type: 'modifyAttribute', attribute: 'luck', value: 2 },
          ],
          rewards: { exp: 200 },
        },
      },
      {
        text: '担心是陷阱，绕道而行',
        cost: {},
        result: {
          success: true,
          message: '你觉得此事有些蹊跷，决定不多停留，绕道而行。走了一段路后，你回头看了一眼，发现那僧人依然靠在树下，似乎真的受了伤。你心中有些愧疚，但也只能继续赶路。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'shaolin-route-martial-hint',
    nameCN: '石壁武学',
    descriptionCN: '你在一处石壁上发现了一些刻痕，仔细看去，似乎是某种剑法的招式图谱。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'shaolin-route', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 6 },
    },
    choices: [
      {
        text: '仔细研究石壁上的图谱',
        cost: {},
        result: {
          success: true,
          message: '你仔细观察石壁上的刻痕，发现这是少林「罗汉拳」的入门招式。虽然只是基础拳法，但其中蕴含的武学道理让你受益匪浅。经过一番苦思，你终于领悟了其中的精髓...',
          effects: [
            { type: 'modifyAttribute', attribute: 'strength', value: 2 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 150 },
        },
      },
      {
        text: '记下位置，日后再来',
        cost: {},
        result: {
          success: true,
          message: '你感觉现在的武学境界还不足以领悟石壁上的内容，决定先记下这个位置，等日后武功精进了再来研究。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 30 },
        },
      },
    ],
  },

  {
    id: 'huashan-route-sword-master-encounter',
    nameCN: '剑术高手',
    descriptionCN: '你在华山山道上遇到一位白衣剑客，他正在崖边练剑。剑光如练，招式精妙绝伦。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'huashan-route', minVisits: 1 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '静静观看，不敢打扰',
        cost: {},
        result: {
          success: true,
          message: '你站在一旁静静观看，剑客的一招一式都让你大开眼界。虽然只是远远观看，但你对剑法的理解又深了一层。',
          effects: [
            { type: 'modifyAttribute', attribute: 'agility', value: 1 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 80 },
        },
      },
      {
        text: '上前请教剑法',
        cost: {},
        result: {
          success: true,
          message: '剑客收剑回身，看着你微微一笑：「阁下也是剑道中人？看阁下的气度，似乎有些根基。也罢，我便指点你一二。」他为你讲解了一些剑法的基本要领，让你获益良多。',
          effects: [
            { type: 'modifyAttribute', attribute: 'agility', value: 2 },
          ],
          rewards: { exp: 120 },
        },
      },
    ],
  },

  {
    id: 'huashan-route-cliff-discovery',
    nameCN: '悬崖发现',
    descriptionCN: '你在一处悬崖边发现了一个隐蔽的山洞，洞口被藤蔓遮掩，若非仔细观察很难发现。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'huashan-route', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { luck: 5 },
    },
    choices: [
      {
        text: '进入山洞探索',
        cost: {},
        result: {
          success: true,
          message: '你拨开藤蔓，进入山洞。洞内虽然不大，但收拾得干干净净，似乎曾有人在此隐居。石桌上放着一个木匣，打开一看，里面是一本泛黄的剑谱和一些银两。',
          effects: [
            { type: 'modifyAttribute', attribute: 'agility', value: 2 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
            { type: 'gainGold', amount: 200 },
          ],
          rewards: { exp: 180, gold: 200 },
        },
      },
      {
        text: '感觉太过危险，放弃探索',
        cost: {},
        result: {
          success: true,
          message: '你觉得山洞位置太过险峻，万一里面有什么危险，后果不堪设想。决定不冒险，继续赶路。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'huashan-route-fog-challenge',
    nameCN: '迷雾困境',
    descriptionCN: '你在山道上行走，突然一阵浓雾涌来，周围的一切都变得模糊不清。你迷失了方向...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'huashan-route', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '冷静观察，寻找出路',
        cost: {},
        result: {
          success: true,
          message: '你强迫自己冷静下来，仔细观察周围的环境。凭着对地形的记忆和一些微弱的光线，你终于找到了正确的方向。经过这次考验，你的心性更加沉稳了。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
            { type: 'modifyAttribute', attribute: 'constitution', value: 1 },
          ],
          rewards: { exp: 100 },
        },
      },
      {
        text: '大声呼喊，寻求帮助',
        cost: {},
        result: {
          success: true,
          message: '你大声呼喊，希望有人能听到。过了一会儿，一位华山弟子听到了你的声音，指引你走出了迷雾。他告诉你，华山经常有这种迷雾，让你小心。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 50 },
        },
      },
    ],
  },

  {
    id: 'huashan-route-assassin-ambush',
    nameCN: '刺客伏击',
    descriptionCN: '你正在山路上行走，突然感觉一股凌厉的杀气从身后袭来！',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'huashan-route', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'startCombat', enemyId: 'assassin' },
    ],
    rewards: { exp: 150, gold: 120 },
  },

  {
    id: 'wudang-route-taoist-encounter',
    nameCN: '武当道士',
    descriptionCN: '你在武当山道上遇到一位青袍道士，他正坐在一块大石上闭目养神，看起来仙风道骨。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'wudang-route', minVisits: 1 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '恭敬地上前行礼',
        cost: {},
        result: {
          success: true,
          message: '道士缓缓睁开眼睛，看着你微微一笑：「施主有礼了。看施主的面相，是有仙缘之人。我且问你，何为道？」你与道士论道一番，虽然似懂非懂，但感觉心境开阔了不少。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 80 },
        },
      },
      {
        text: '默默走过，不打扰',
        cost: {},
        result: {
          success: true,
          message: '你轻轻走过，不打扰道士的清修。道士似乎感觉到了你的存在，微微颔首，继续闭目养神。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 30 },
        },
      },
    ],
  },

  {
    id: 'wudang-route-crane-observation',
    nameCN: '仙鹤观武',
    descriptionCN: '你在山道旁看到一只丹顶鹤，它正在一片空地上翩翩起舞。仔细看去，它的动作似乎暗合某种武学道理...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'wudang-route', minVisits: 2 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 7 },
    },
    choices: [
      {
        text: '静心观察，领悟其中道理',
        cost: {},
        result: {
          success: true,
          message: '你静静观察仙鹤的动作，发现它的每一个动作都蕴含着极高的武学智慧：展翅如剑，收翼如盾，进退有据，攻防一体。你越看越入迷，感觉自己的身法也在不知不觉中提升了...',
          effects: [
            { type: 'modifyAttribute', attribute: 'agility', value: 3 },
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 200 },
        },
      },
      {
        text: '觉得有趣，继续赶路',
        cost: {},
        result: {
          success: true,
          message: '你觉得仙鹤的舞姿很有趣，但并没有多想，继续赶路。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'wudang-route-meditation-spot',
    nameCN: '冥想圣地',
    descriptionCN: '你来到一处山间平台，这里云雾缭绕，松涛阵阵，令人心旷神怡。平台中央有一块平整的大石，似乎是专门用来打坐冥想的。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'wudang-route', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '在大石上打坐冥想',
        cost: {},
        result: {
          success: true,
          message: '你盘坐在大石上，闭目冥想。周围的一切似乎都安静了下来，只有风声和松涛声。渐渐地，你感觉自己的呼吸变得悠长而平稳，体内的真气也开始缓缓流转...不知过了多久，你睁开眼睛，感觉神清气爽，功力又有精进。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
            { type: 'modifyAttribute', attribute: 'physique', value: 1 },
            { type: 'modifyAttribute', attribute: 'constitution', value: 1 },
          ],
          rewards: { exp: 150 },
        },
      },
      {
        text: '欣赏风景，不做停留',
        cost: {},
        result: {
          success: true,
          message: '你欣赏了一番美景，感觉心情舒畅，继续赶路。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 30 },
        },
      },
    ],
  },

  {
    id: 'wudang-route-evildoer-encounter',
    nameCN: '魔道中人',
    descriptionCN: '你在山道上遇到一位面色阴鸷的黑衣人，他的气息阴冷而诡异。',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'wudang-route', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'startCombat', enemyId: 'evildoer' },
    ],
    rewards: { exp: 180, gold: 150 },
  },

  {
    id: 'village-inn-storyteller',
    nameCN: '评书先生',
    descriptionCN: '你在平安客栈中看到一位说书先生正在讲江湖故事，周围坐满了听众。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'village', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '坐下听书',
        cost: {},
        result: {
          success: true,
          message: '你找了个位置坐下，听评书先生讲述江湖上的奇闻轶事。他讲了「北乔峰南慕容」的传说，「东邪西毒南帝北丐中神通」的故事，还有「神雕大侠」的事迹。虽然这些故事真假难辨，但让你对江湖有了更多的了解。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
            { type: 'modifyAttribute', attribute: 'luck', value: 1 },
          ],
          rewards: { exp: 60 },
        },
      },
      {
        text: '向掌柜打听消息',
        cost: {},
        result: {
          success: true,
          message: '你走到柜台前，向掌柜打听最近的消息。掌柜告诉你，最近山贼活动频繁，让你路上小心；还说万毒谷最近有些异动，让你没事不要去那里。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 40 },
        },
      },
    ],
  },

  {
    id: 'village-clinic-healing',
    nameCN: '张大夫的考验',
    descriptionCN: '你走进药铺，发现张大夫正在皱眉沉思。「唉，这个病症...」他自言自语道。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'village', minVisits: 5 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '上前询问发生了什么',
        cost: {},
        result: {
          success: true,
          message: '张大夫抬起头，叹了口气：「是镇上的王阿婆，她得了一种怪病，我查遍了医书也找不到治疗方法。」你决定帮助张大夫一起研究。经过一番探讨，虽然没有找到根治之法，但你对人体经络有了更深的理解。',
          effects: [
            { type: 'modifyAttribute', attribute: 'constitution', value: 1 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 80 },
        },
      },
      {
        text: '购买丹药，不打扰',
        cost: {},
        result: {
          success: true,
          message: '你购买了一些常备丹药，没有打扰张大夫的沉思。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'forest-hidden-cave',
    nameCN: '隐秘洞穴',
    descriptionCN: '你在森林深处发现一个被藤蔓遮掩的洞穴入口。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'forest', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { luck: 4 },
    },
    choices: [
      {
        text: '进入洞穴探索',
        cost: {},
        result: {
          success: true,
          message: '你拨开藤蔓，进入洞穴。洞内比想象中要大，地上散落着一些骸骨和生锈的兵器。看来这里曾是某位江湖人士的隐居之地。在洞穴的最深处，你发现一个朽坏的木匣，里面是一本残破的内功心法和一些银两。',
          effects: [
            { type: 'modifyAttribute', attribute: 'physique', value: 1 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
            { type: 'gainGold', amount: 150 },
          ],
          rewards: { exp: 120, gold: 150 },
        },
      },
      {
        text: '觉得危险，放弃',
        cost: {},
        result: {
          success: true,
          message: '你觉得洞穴太过隐秘，可能有危险，决定不冒险。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'forest-elder-hermit',
    nameCN: '森林隐士',
    descriptionCN: '你在森林中遇到一位白发苍苍的老者，他正在一棵古树下钓鱼。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'forest', minVisits: 5 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { luck: 5 },
    },
    choices: [
      {
        text: '安静地坐在一旁观察',
        cost: {},
        result: {
          success: true,
          message: '你坐在一旁，静静观察老者钓鱼。他的动作悠然自得，看似随意，实则蕴含着极高的境界。渐渐地，你感觉自己的心境也变得平静下来。不知过了多久，老者收起钓竿，站起身来：「年轻人，你有心了。这是我年轻时偶然得到的一本秘籍，送给你吧。」',
          effects: [
            { type: 'learnTechnique', techniqueId: 'ling-bo' },
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 250 },
        },
      },
      {
        text: '上前搭话',
        cost: {},
        result: {
          success: true,
          message: '老者抬起头，看了你一眼：「年轻人，有事吗？」你与他交谈了一会儿，得知他是一位退隐的江湖人士。他给你讲了一些江湖上的道理，让你受益匪浅。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 100 },
        },
      },
    ],
  },

  {
    id: 'xiangyang-martial-contest',
    nameCN: '擂台比武',
    descriptionCN: '你在襄阳城的校场上看到一个擂台，上面挂着「以武会友」的横幅。周围聚集了不少江湖人士。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-xiangyang', minVisits: 3 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '上台挑战',
        cost: {},
        result: {
          success: true,
          message: '你纵身跃上台，向擂主拱手行礼。擂主是一位中年武师，手持大刀。「好，请赐教！」一场精彩的较量展开了。虽然最终你略逊一筹，但从中学到了很多实战经验。',
          effects: [
            { type: 'modifyAttribute', attribute: 'strength', value: 1 },
            { type: 'modifyAttribute', attribute: 'agility', value: 1 },
          ],
          rewards: { exp: 120 },
        },
      },
      {
        text: '在台下观看学习',
        cost: {},
        result: {
          success: true,
          message: '你站在台下，仔细观察台上的比武。各路高手各展所长，让你大开眼界。虽然没有亲自上场，但也学到了不少东西。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 80 },
        },
      },
    ],
  },

  {
    id: 'xiangyang-info-exchange',
    nameCN: '情报交换',
    descriptionCN: '你在悦来客栈的大堂里看到几位江湖人士正在高谈阔论。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-xiangyang', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '加入他们的讨论',
        cost: {},
        result: {
          success: true,
          message: '你加入讨论，与他们交换江湖情报。他们告诉你：少林寺最近在招收俗家弟子；恶人谷似乎有血神教的人出没；古墓最近也有些异动。这些信息让你对当前的江湖局势有了更清晰的了解。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
            { type: 'modifyAttribute', attribute: 'luck', value: 1 },
          ],
          rewards: { exp: 100 },
        },
      },
      {
        text: '在一旁静静聆听',
        cost: {},
        result: {
          success: true,
          message: '你坐在一旁，静静聆听他们的谈话。虽然没有参与讨论，但也获得了不少有用的信息。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 50 },
        },
      },
    ],
  },

  {
    id: 'luoyang-auction-event',
    nameCN: '拍卖大会',
    descriptionCN: '洛阳城的聚宝斋正在举办一场拍卖会，据说有不少珍品。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-luoyang', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '参加拍卖会',
        cost: {},
        result: {
          success: true,
          message: '你来到聚宝斋，拍卖会已经开始了。台上展示着各种奇珍异宝：千年人参、失传的武功秘籍、神兵利器...虽然你没有拍到什么东西，但见识了不少宝贝，眼界大开。',
          effects: [
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
            { type: 'modifyAttribute', attribute: 'luck', value: 1 },
          ],
          rewards: { exp: 80 },
        },
      },
      {
        text: '闲逛，不参加',
        cost: {},
        result: {
          success: true,
          message: '你在洛阳城的大街小巷闲逛，感受这座古都的繁华。',
          effects: [],
          rewards: { exp: 20 },
        },
      },
    ],
  },

  {
    id: 'luoyang-taoist-temple',
    nameCN: '道观求签',
    descriptionCN: '洛阳城中有一座著名的道观，香火鼎盛。据说在这里求签很灵验。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-luoyang', minVisits: 5 },
    prerequisiteEvents: [],
    isExclusive: false,
    choices: [
      {
        text: '进去求一支签',
        cost: { gold: 50 },
        result: {
          success: true,
          message: '你付了香火钱，在神像前虔诚地求了一支签。道士接过签文，看了看说道：「上上签！施主近日必有奇遇。记住，心存善念，自有天助。」你感觉心情舒畅，似乎真的有好运要降临。',
          effects: [
            { type: 'modifyAttribute', attribute: 'luck', value: 3 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 100 },
        },
      },
      {
        text: '不相信这些，离开',
        cost: {},
        result: {
          success: true,
          message: '你不相信这些迷信的东西，决定不进去。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'deep-forest-ancient-tree',
    nameCN: '千年古树',
    descriptionCN: '你在幽暗密林深处发现一棵巨大的古树，树干粗壮，需要十几人才能合抱。树上布满了青苔和藤蔓，显得古老而神秘。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'deep-forest', minVisits: 4 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 5 },
    },
    choices: [
      {
        text: '仔细观察古树',
        cost: {},
        result: {
          success: true,
          message: '你绕着古树仔细观察，发现树干上有一些奇异的刻痕。这些刻痕看似随意，实则暗合某种阵法原理。你越看越入迷，感觉自己对武学的理解又深了一层。突然，树洞中飞出一只白鸽，腿上绑着一个小竹筒。你取下竹筒，里面是一张泛黄的羊皮纸，上面绘制着一套轻功身法...',
          effects: [
            { type: 'learnTechnique', techniqueId: 'ling-bo' },
            { type: 'modifyAttribute', attribute: 'agility', value: 2 },
            { type: 'modifyAttribute', attribute: 'insight', value: 1 },
          ],
          rewards: { exp: 200 },
        },
      },
      {
        text: '感觉有些诡异，离开',
        cost: {},
        result: {
          success: true,
          message: '你感觉这棵古树太过诡异，决定不多停留，继续探索。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'deep-forest-shadow-creature',
    nameCN: '暗影生物',
    descriptionCN: '你在幽暗密林中行走，突然感觉被什么东西盯上了。周围的阴影似乎在蠕动...',
    type: 'encounter',
    triggerCondition: { type: 'location', locationId: 'deep-forest', minVisits: 5 },
    prerequisiteEvents: [],
    isExclusive: false,
    actions: [
      { type: 'startCombat', enemyId: 'shadow-beast' },
    ],
    rewards: { exp: 120, gold: 80 },
  },

  {
    id: 'gaibang-event',
    nameCN: '丐帮奇遇',
    descriptionCN: '你在襄阳城的街头遇到一位衣衫褴褛的乞丐，他虽然看起来落魄，但眼神中却透着一股威严。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'city-xiangyang', minVisits: 5 },
    prerequisiteEvents: ['xiangyang-info-exchange'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 6, luck: 5 },
    },
    choices: [
      {
        text: '恭敬地上前问候',
        cost: {},
        result: {
          success: true,
          message: '乞丐抬起头，深深地看了你一眼：「年轻人，你有礼了。看你面相，是有侠骨之人。我且问你，何为侠？」你沉吟片刻，答道：「侠之大者，为国为民。」乞丐闻言，眼中精光一闪：「好！说得好！既然你有此心，我便传你一套武功。」原来这乞丐竟是丐帮的九袋长老，他将《降龙十八掌》的入门心法传授于你。',
          effects: [
            { type: 'learnTechnique', techniqueId: 'dragon-subduing' },
            { type: 'modifyAttribute', attribute: 'strength', value: 3 },
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 400 },
        },
      },
      {
        text: '匆匆走过，不予理会',
        cost: {},
        result: {
          success: true,
          message: '你觉得这个乞丐有些奇怪，决定不多停留，继续赶路。走了一段路后，你回头看了一眼，发现那乞丐已经消失不见了。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'bian-guan-event',
    nameCN: '边关军营',
    descriptionCN: '你在前往洛阳的路上经过一处边关军营，军营门口有士兵把守。',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'south-road', minVisits: 5 },
    prerequisiteEvents: [],
    isExclusive: true,
    requirements: {
      requiredAttributes: { strength: 8, physique: 6 },
    },
    choices: [
      {
        text: '请求进入军营参观',
        cost: {},
        result: {
          success: true,
          message: '士兵打量了你一番，见你气度不凡，便让你进入了军营。你在军营中看到将士们操练，其中一位老将军正在演练一套枪法。这套枪法大开大合，如天马行空，攻守兼备。老将军看到你在一旁观看，便收枪走了过来：「年轻人，对枪法感兴趣？」你点头称是。老将军微微一笑：「这是老夫家传的杨家枪法，你若是有缘，便拿去练练吧。」',
          effects: [
            { type: 'learnTechnique', techniqueId: 'yang-jia' },
            { type: 'modifyAttribute', attribute: 'strength', value: 3 },
            { type: 'modifyAttribute', attribute: 'physique', value: 2 },
          ],
          rewards: { exp: 350 },
        },
      },
      {
        text: '觉得军营太过危险，绕道而行',
        cost: {},
        result: {
          success: true,
          message: '你觉得军营是是非之地，决定绕道而行，继续前往洛阳。',
          effects: [],
          rewards: { exp: 10 },
        },
      },
    ],
  },

  {
    id: 'taohua-event',
    nameCN: '桃花岛奇遇',
    descriptionCN: '你在湖心岛的桃花园中漫步，落英缤纷，美不胜收。忽然，你听到一阵奇怪的声音，似乎有人在自言自语...',
    type: 'choice',
    triggerCondition: { type: 'location', locationId: 'river-island', minVisits: 5 },
    prerequisiteEvents: ['peach-garden-encounter'],
    isExclusive: true,
    requirements: {
      requiredAttributes: { insight: 7, agility: 6 },
    },
    choices: [
      {
        text: '循声探索',
        cost: {},
        result: {
          success: true,
          message: '你循声走去，发现一位白发老者正在桃树下左右手各持一根树枝，正在练习一套奇怪的武功。他的左手使一套剑法，右手使一套掌法，两套武功截然不同，却又配合得天衣无缝。老者察觉到你的存在，收招笑道：「有意思！很久没有人能发现我在这里了。你看我这套功夫如何？」你答道：「这套功夫能一心二用，实在精妙。」老者哈哈大笑：「好眼光！这是我自创的左右互搏之术，你若是能一心二用，便学了去吧。」',
          effects: [
            { type: 'learnTechnique', techniqueId: 'double-fight' },
            { type: 'modifyAttribute', attribute: 'agility', value: 3 },
            { type: 'modifyAttribute', attribute: 'insight', value: 2 },
          ],
          rewards: { exp: 450 },
        },
      },
      {
        text: '感觉是高人，不打扰',
        cost: {},
        result: {
          success: true,
          message: '你感觉到那老者武功极高，决定不打扰他的清修，悄悄离开了。',
          effects: [],
          rewards: { exp: 10 },
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
