import type { MartialArt, Attributes, CombatStats } from '../types';

export const MARTIAL_ARTS: MartialArt[] = [
  // ==================== 内功（Internal Arts）====================
  // 基础内功
  {
    id: 'basic-breathing',
    nameCN: '基础吐纳法',
    type: 'internal',
    level: 1,
    insightRequired: 1,
    learningChanceBase: 95,
    lore: '这是江湖中最基础的呼吸吐纳之法，几乎每个初学武者都会。虽然简单，但持之以恒地练习，也能打下坚实的内功基础。据传此法源自道家养生之术，后被武者改良用于修炼内力。',
    effects: [
      { type: 'heal', value: 8, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'maxEnergy', value: 10, description: '内力上限+10' },
    ],
    source: {
      type: 'initial',
      description: '初入江湖时已掌握',
    },
  },
  {
    id: 'iron-skin',
    nameCN: '铁布衫',
    type: 'internal',
    level: 3,
    insightRequired: 3,
    learningChanceBase: 60,
    prerequisiteSkills: ['basic-breathing'],
    lore: '铁布衫是一门刚猛的护体内功，练至大成可刀枪不入。修炼者需每日以药汤浸泡身体，并配合特殊的呼吸法门，使内力遍布全身经脉，形成一层无形的护体罡气。此功源自少林外家功夫，后被江湖中人广为流传。',
    effects: [
      { type: 'buff', value: 15, scalingAttribute: 'physique', scalingPercent: 8, duration: 3, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'defense', value: 5, description: '防御+5' },
      { type: 'attribute_bonus', attribute: 'physique', value: 1, description: '根骨+1' },
    ],
    source: {
      type: 'event',
      description: '可从古刹禅寺奇遇中获得',
      eventId: 'temple-event',
    },
  },
  {
    id: 'nine-yang',
    nameCN: '九阳神功',
    type: 'internal',
    level: 8,
    insightRequired: 7,
    learningChanceBase: 35,
    prerequisiteSkills: ['iron-skin'],
    lore: '九阳神功源自《九阳真经》，是一门至刚至阳的无上内功。练成后内力自生速度奇快，无穷无尽，普通拳脚也能使出绝大攻击力。此功防御力无可匹敌，自动护体功能反弹外力攻击，成金刚不坏之躯。习者轻功身法胜过世上所有轻功精妙高手。更是疗伤圣典，百毒不侵，专门克破所有寒性和阴性内力。',
    effects: [
      { type: 'damage', value: 35, scalingAttribute: 'strength', scalingPercent: 12, application: 'instant' },
      { type: 'heal', value: 20, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'strength', value: 3, description: '力量+3' },
      { type: 'attribute_bonus', attribute: 'constitution', value: 2, description: '体质+2' },
      { type: 'combat_bonus', combatStat: 'maxEnergy', value: 50, description: '内力上限+50' },
      { type: 'hp_regen', value: 2, description: '每回合回复2点生命' },
    ],
    source: {
      type: 'insight',
      description: '悟性达到8点时，有机会在秘境中自行领悟',
      minInsight: 8,
    },
  },
  {
    id: 'nine-yin',
    nameCN: '九阴真经',
    type: 'internal',
    level: 9,
    insightRequired: 8,
    learningChanceBase: 30,
    prerequisiteSkills: ['nine-yang'],
    lore: '《九阴真经》是武学中的至高无上的宝典，所载是最精深的武功，学武之人只要学到了一点，就会称雄武林。真经上卷是内功，下卷是招式。内功讲究阴阳互济，以柔克刚。练成后天下武学皆附拾可用。此经源自北宋年间的黄裳，他通读道藏，领悟武学至理，编撰成此经。',
    effects: [
      { type: 'damage', value: 45, scalingAttribute: 'insight', scalingPercent: 15, application: 'instant' },
      { type: 'debuff', value: 15, scalingAttribute: 'agility', scalingPercent: 10, duration: 2, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'insight', value: 3, description: '悟性+3' },
      { type: 'attribute_bonus', attribute: 'agility', value: 2, description: '敏捷+2' },
      { type: 'combat_bonus', combatStat: 'critChance', value: 5, description: '暴击率+5%' },
      { type: 'energy_regen', value: 3, description: '每回合回复3点内力' },
    ],
    source: {
      type: 'insight',
      description: '悟性达到9点时，有机会在古书残卷中自行领悟',
      minInsight: 9,
    },
  },
  {
    id: 'yi-jin',
    nameCN: '易筋经',
    type: 'internal',
    level: 10,
    insightRequired: 9,
    learningChanceBase: 25,
    prerequisiteSkills: ['nine-yin'],
    lore: '《易筋经》为少林镇寺之宝，相传为达摩祖师所创。此经讲究"易筋洗髓"，能将普通人的筋骨改造成先天灵体。练成后内力深厚无比，且生生不息，无论受多重的内伤都能迅速恢复。此经最神奇之处在于能将内力转化为任何形式的攻击或防御，实乃武学中的至宝。',
    effects: [
      { type: 'heal', value: 50, scalingAttribute: 'constitution', scalingPercent: 15, application: 'instant' },
      { type: 'buff', value: 30, scalingAttribute: 'physique', scalingPercent: 15, duration: 4, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'constitution', value: 4, description: '体质+4' },
      { type: 'attribute_bonus', attribute: 'physique', value: 3, description: '根骨+3' },
      { type: 'combat_bonus', combatStat: 'maxHP', value: 100, description: '生命上限+100' },
      { type: 'hp_regen', value: 5, description: '每回合回复5点生命' },
      { type: 'energy_regen', value: 5, description: '每回合回复5点内力' },
    ],
    source: {
      type: 'event',
      description: '可从少林藏经阁的特殊事件中获得',
      eventId: 'shaolin-event',
    },
  },
  {
    id: 'bei-ming',
    nameCN: '北冥神功',
    type: 'internal',
    level: 7,
    insightRequired: 6,
    learningChanceBase: 40,
    prerequisiteSkills: ['basic-breathing'],
    lore: '北冥神功源自逍遥派，以"百川归海"之意，能吸取他人内力为己用。此功的要旨在于以己之虚，引彼之实，以柔克刚，以静制动。练成后，周身穴位会产生强大的吸力，只要接触到对手的身体，就能将其内力源源不断地吸过来。但此功也有极大风险，若吸来的内力不能及时消化，便会有走火入魔之虞。',
    effects: [
      { type: 'damage', value: 25, scalingAttribute: 'insight', scalingPercent: 10, application: 'instant' },
      { type: 'heal', value: 15, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'insight', value: 2, description: '悟性+2' },
      { type: 'combat_bonus', combatStat: 'maxEnergy', value: 40, description: '内力上限+40' },
      { type: 'energy_regen', value: 2, description: '每回合回复2点内力' },
    ],
    source: {
      type: 'purchase',
      description: '可从神秘商人处购得',
      price: 10000,
    },
  },

  // ==================== 外功（External Arts）====================
  {
    id: 'iron-palm',
    nameCN: '铁砂掌',
    type: 'external',
    level: 1,
    insightRequired: 1,
    learningChanceBase: 90,
    lore: '铁砂掌是一门刚猛的外家掌法，练习者需将双手插入铁砂中反复锻炼，日久后手掌坚硬如铁，一掌拍出威力惊人。此功虽然入门容易，但要练到大成却极难，需要忍受常人难以想象的痛苦。铁砂掌练成后，掌风凌厉，中者筋骨俱断。',
    effects: [
      { type: 'damage', value: 12, scalingAttribute: 'strength', scalingPercent: 5, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'attack', value: 3, description: '攻击+3' },
      { type: 'attribute_bonus', attribute: 'strength', value: 1, description: '力量+1' },
    ],
    source: {
      type: 'initial',
      description: '初入江湖时已掌握',
    },
  },
  {
    id: 'tiger-claw',
    nameCN: '虎爪绝户手',
    type: 'external',
    level: 3,
    insightRequired: 3,
    learningChanceBase: 70,
    prerequisiteSkills: ['iron-palm'],
    lore: '虎爪绝户手是武当派的一门狠辣武功，招招攻向敌人要害。此功模仿猛虎扑食之姿，手指弯曲如虎爪，一抓之下可裂金断石。虽然名为"绝户手"，但武当弟子若非万不得已，绝不轻易使用。此功的精髓在于快、准、狠，一旦出手便不留余地。',
    effects: [
      { type: 'damage', value: 22, scalingAttribute: 'strength', scalingPercent: 8, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'attack', value: 5, description: '攻击+5' },
      { type: 'attribute_bonus', attribute: 'strength', value: 2, description: '力量+2' },
      { type: 'combat_bonus', combatStat: 'defense', value: 2, description: '防御+2' },
    ],
    source: {
      type: 'event',
      description: '可从武当派相关事件中获得',
      eventId: 'wudang-event',
    },
  },
  {
    id: 'dragon-subduing',
    nameCN: '降龙十八掌',
    type: 'external',
    level: 8,
    insightRequired: 6,
    learningChanceBase: 45,
    prerequisiteSkills: ['tiger-claw'],
    lore: '降龙十八掌是丐帮的镇帮之宝，号称天下第一刚猛掌法。此掌法共有十八招，招式名称取自《周易》，如"亢龙有悔"、"飞龙在天"、"见龙在田"等。降龙十八掌的精髓在于"刚不可久，柔不可守"，刚柔并济，威力无穷。练成后一掌拍出，有龙吟虎啸之势，威力足以开山裂石。',
    effects: [
      { type: 'damage', value: 40, scalingAttribute: 'strength', scalingPercent: 15, application: 'instant' },
      { type: 'debuff', value: 10, scalingAttribute: 'physique', scalingPercent: 8, duration: 2, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'attack', value: 12, description: '攻击+12' },
      { type: 'attribute_bonus', attribute: 'strength', value: 3, description: '力量+3' },
      { type: 'attribute_bonus', attribute: 'physique', value: 2, description: '根骨+2' },
      { type: 'combat_bonus', combatStat: 'defense', value: 5, description: '防御+5' },
    ],
    source: {
      type: 'event',
      description: '可从丐帮长老的特殊事件中获得',
      eventId: 'gaibang-event',
    },
  },
  {
    id: 'dog-beating',
    nameCN: '打狗棒法',
    type: 'external',
    level: 5,
    insightRequired: 5,
    learningChanceBase: 55,
    prerequisiteSkills: ['tiger-claw'],
    lore: '打狗棒法是丐帮帮主的嫡传武功，共有三十六路，是丐帮的镇帮之宝。此棒法名字虽然陋俗，但变化精微，招术奇妙，实是古往今来武学中的一等功夫。棒法的精髓在于"以巧胜力"，看似轻描淡写的一棒，实则蕴含无穷变化。洪七公曾以打狗棒法与欧阳锋的蛤蟆功大战数日不分胜负。',
    effects: [
      { type: 'damage', value: 30, scalingAttribute: 'agility', scalingPercent: 10, application: 'instant' },
      { type: 'debuff', value: 15, scalingAttribute: 'agility', scalingPercent: 10, duration: 2, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'agility', value: 2, description: '敏捷+2' },
      { type: 'combat_bonus', combatStat: 'speed', value: 5, description: '速度+5' },
      { type: 'combat_bonus', combatStat: 'defense', value: 3, description: '防御+3' },
    ],
    source: {
      type: 'insight',
      description: '悟性达到6点时，有机会从丐帮遗迹中领悟',
      minInsight: 6,
    },
  },
  {
    id: 'qian-kun',
    nameCN: '乾坤大挪移',
    type: 'external',
    level: 9,
    insightRequired: 8,
    learningChanceBase: 35,
    prerequisiteSkills: ['dragon-subduing'],
    lore: '乾坤大挪移是明教的镇教之宝，源自波斯明教。此功的核心在于"借力打力"、"四两拨千斤"，能将敌人的攻击原封不动地反弹回去。练成乾坤大挪移后，敌人的招式在你眼中便无所遁形，你可以轻易看出其破绽所在。此功共有七层，历史上只有张无忌一人练到第七层。',
    effects: [
      { type: 'damage', value: 35, scalingAttribute: 'insight', scalingPercent: 12, application: 'instant' },
      { type: 'defense', value: 25, duration: 3, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'defense', value: 10, description: '防御+10' },
      { type: 'attribute_bonus', attribute: 'physique', value: 3, description: '根骨+3' },
      { type: 'combat_bonus', combatStat: 'maxHP', value: 50, description: '生命上限+50' },
    ],
    source: {
      type: 'insight',
      description: '悟性达到9点时，有机会在光明顶秘境中领悟',
      minInsight: 9,
    },
  },

  // ==================== 兵器（Weapon Arts）====================
  {
    id: 'du-gu',
    nameCN: '独孤九剑',
    type: 'weapon',
    level: 4,
    insightRequired: 4,
    learningChanceBase: 65,
    lore: '独孤九剑是剑魔独孤求败所创的剑法，以"无招胜有招"为最高境界。此剑法共有九式：总决式、破剑式、破刀式、破枪式、破鞭式、破索式、破掌式、破箭式、破气式。练成后，天下任何兵器、任何招式都可破之。令狐冲曾以此剑法，以一柄木剑败尽天下英雄。',
    effects: [
      { type: 'damage', value: 25, scalingAttribute: 'insight', scalingPercent: 8, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'attack', value: 8, description: '攻击+8' },
      { type: 'attribute_bonus', attribute: 'insight', value: 1, description: '悟性+1' },
    ],
    source: {
      type: 'event',
      description: '可从华山派思过崖事件中获得',
      eventId: 'huashan-event',
    },
  },
  {
    id: 'hu-jia',
    nameCN: '胡家刀法',
    type: 'weapon',
    level: 5,
    insightRequired: 4,
    learningChanceBase: 60,
    prerequisiteSkills: ['du-gu'],
    lore: '胡家刀法是明末大侠胡一刀的家传刀法，以刚猛、狠辣著称。此刀法共有三十六招，招招都是攻敌之所必救。胡一刀曾以此刀法与苗人凤大战数日不分胜负。胡家刀法的精髓在于"快、准、狠"，一刀既出，便如迅雷不及掩耳，令敌人无从闪避。',
    effects: [
      { type: 'damage', value: 32, scalingAttribute: 'strength', scalingPercent: 10, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'attack', value: 10, description: '攻击+10' },
      { type: 'attribute_bonus', attribute: 'strength', value: 2, description: '力量+2' },
      { type: 'combat_bonus', combatStat: 'defense', value: 3, description: '防御+3' },
    ],
    source: {
      type: 'purchase',
      description: '可从武馆购得',
      price: 5000,
    },
  },
  {
    id: 'yang-jia',
    nameCN: '杨家枪法',
    type: 'weapon',
    level: 7,
    insightRequired: 6,
    learningChanceBase: 50,
    prerequisiteSkills: ['hu-jia'],
    lore: '杨家枪法是北宋名将杨业所创，后经杨家世代传承改良，成为枪法中的翘楚。此枪法攻守兼备，招式大开大合，如天马行空。杨家枪法最著名的一招是"回马枪"，佯装败退，实则伺机反击，令敌人防不胜防。当年杨家将以此枪法镇守边关，辽兵闻风丧胆。',
    effects: [
      { type: 'damage', value: 40, scalingAttribute: 'strength', scalingPercent: 12, application: 'instant' },
      { type: 'buff', value: 15, scalingAttribute: 'agility', scalingPercent: 8, duration: 2, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'combat_bonus', combatStat: 'attack', value: 12, description: '攻击+12' },
      { type: 'attribute_bonus', attribute: 'strength', value: 2, description: '力量+2' },
      { type: 'attribute_bonus', attribute: 'physique', value: 2, description: '根骨+2' },
      { type: 'combat_bonus', combatStat: 'defense', value: 5, description: '防御+5' },
    ],
    source: {
      type: 'event',
      description: '可从边关军营的特殊事件中获得',
      eventId: 'bian-guan-event',
    },
  },

  // ==================== 特殊（Special Arts）====================
  {
    id: 'ling-bo',
    nameCN: '凌波微步',
    type: 'special',
    level: 4,
    insightRequired: 5,
    learningChanceBase: 55,
    lore: '凌波微步是逍遥派的轻功身法，取自曹植《洛神赋》中的"凌波微步，罗袜生尘"。此轻功以周易六十四卦为基础，踏出的每一步都暗合易理，看似杂乱无章，实则蕴含无穷变化。练成后，身形飘逸如仙，敌人的攻击往往落空。段誉曾以此轻功在万军之中来去自如。',
    effects: [
      { type: 'buff', value: 25, scalingAttribute: 'agility', scalingPercent: 15, duration: 3, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'agility', value: 3, description: '敏捷+3' },
      { type: 'combat_bonus', combatStat: 'speed', value: 8, description: '速度+8' },
      { type: 'combat_bonus', combatStat: 'critChance', value: 3, description: '暴击率+3%' },
    ],
    source: {
      type: 'event',
      description: '可从古刹禅寺静心大师传授',
      eventId: 'temple-light-step',
    },
  },
  {
    id: 'one-finger',
    nameCN: '一阳指',
    type: 'special',
    level: 7,
    insightRequired: 7,
    learningChanceBase: 40,
    prerequisiteSkills: ['basic-breathing'],
    lore: '一阳指是大理段氏的家传绝学，以指力隔空伤人。此功修炼难度极高，需要深厚的内力作为基础。练成后，手指射出的内力可透金穿石，远攻近取，无往不利。一阳指除了攻击之外，还有疗伤之效，以指力刺激穴位，可起死回生。当年一灯大师曾以此功为黄蓉疗伤。',
    effects: [
      { type: 'damage', value: 35, scalingAttribute: 'insight', scalingPercent: 12, application: 'instant' },
      { type: 'heal', value: 30, scalingAttribute: 'constitution', scalingPercent: 8, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'insight', value: 2, description: '悟性+2' },
      { type: 'combat_bonus', combatStat: 'maxEnergy', value: 30, description: '内力上限+30' },
      { type: 'hp_regen', value: 1, description: '每回合回复1点生命' },
    ],
    source: {
      type: 'insight',
      description: '悟性达到8点时，有机会在大理遗迹中领悟',
      minInsight: 8,
    },
  },
  {
    id: 'six-meridian',
    nameCN: '六脉神剑',
    type: 'special',
    level: 10,
    insightRequired: 10,
    learningChanceBase: 20,
    prerequisiteSkills: ['one-finger', 'nine-yang'],
    lore: '六脉神剑是大理段氏的最高武学，以六脉内力化作无形剑气，隔空伤人。此功需要极为深厚的内力作为基础，若非内功登峰造极之人，根本无法练成。六脉神剑共有六路剑法：少商剑、商阳剑、中冲剑、关冲剑、少冲剑、少泽剑。每一路剑法都有独特的威力，合在一起更是威力无穷。段誉曾以此剑法，在少室山大败慕容复。',
    effects: [
      { type: 'damage', value: 60, scalingAttribute: 'insight', scalingPercent: 20, application: 'instant' },
      { type: 'debuff', value: 25, duration: 3, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'insight', value: 4, description: '悟性+4' },
      { type: 'combat_bonus', combatStat: 'maxEnergy', value: 80, description: '内力上限+80' },
      { type: 'combat_bonus', combatStat: 'critChance', value: 8, description: '暴击率+8%' },
      { type: 'energy_regen', value: 4, description: '每回合回复4点内力' },
    ],
    source: {
      type: 'insight',
      description: '悟性达到10点时，有机会在天龙寺中领悟',
      minInsight: 10,
    },
  },
  {
    id: 'double-fight',
    nameCN: '左右互搏',
    type: 'special',
    level: 6,
    insightRequired: 4,
    learningChanceBase: 50,
    lore: '左右互搏是老顽童周伯通所创的奇功，能够一心二用，双手同时使出不同的武功。此功的奇妙之处在于，使用者的左右手可以同时施展两种完全不同的招式，令敌人防不胜防。但此功对心性要求极高，只有心思单纯、心无杂念之人才能练成。小龙女曾以此功，一人使出玉女素心剑法的双剑合璧。',
    effects: [
      { type: 'damage', value: 28, scalingAttribute: 'agility', scalingPercent: 10, application: 'instant' },
      { type: 'damage', value: 28, scalingAttribute: 'strength', scalingPercent: 10, application: 'instant' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'agility', value: 2, description: '敏捷+2' },
      { type: 'combat_bonus', combatStat: 'attack', value: 8, description: '攻击+8' },
    ],
    source: {
      type: 'event',
      description: '可从桃花岛事件中获得',
      eventId: 'taohua-event',
    },
  },
  {
    id: 'she-xing',
    nameCN: '葵花宝典',
    type: 'special',
    level: 9,
    insightRequired: 8,
    learningChanceBase: 30,
    prerequisiteSkills: ['ling-bo'],
    lore: '《葵花宝典》是武林中最神秘的武功秘籍，所载武功奇幻无比，但修炼代价也极为惨重。此功以快著称，练成后身形如鬼似魅，令人难以捉摸。东方不败曾以此功，以一己之力大战任我行、令狐冲、向问天三大高手而不落下风。但此功的修炼需要"自宫"，令无数英雄望而却步。',
    effects: [
      { type: 'damage', value: 50, scalingAttribute: 'agility', scalingPercent: 18, application: 'instant' },
      { type: 'buff', value: 30, scalingAttribute: 'agility', scalingPercent: 20, duration: 3, application: 'temporary' },
    ],
    passiveEffects: [
      { type: 'attribute_bonus', attribute: 'agility', value: 4, description: '敏捷+4' },
      { type: 'combat_bonus', combatStat: 'speed', value: 15, description: '速度+15' },
      { type: 'combat_bonus', combatStat: 'critChance', value: 10, description: '暴击率+10%' },
    ],
    source: {
      type: 'purchase',
      description: '可从神秘商人处以高价购得',
      price: 20000,
    },
  },
];

export function getMartialArt(id: string): MartialArt | undefined {
  return MARTIAL_ARTS.find(m => m.id === id);
}

export function getMartialArtsByType(type: MartialArt['type']): MartialArt[] {
  return MARTIAL_ARTS.filter(m => m.type === type);
}

export function getAvailableMartialArts(
  playerInsight: number,
  knownTechniqueIds: string[],
  completedEvents: string[],
  playerGold: number
): MartialArt[] {
  return MARTIAL_ARTS.filter(m => {
    if (m.insightRequired > playerInsight) return false;
    if (knownTechniqueIds.includes(m.id)) return false;
    if (m.prerequisiteSkills && !m.prerequisiteSkills.every(pre => knownTechniqueIds.includes(pre))) return false;

    switch (m.source.type) {
      case 'initial':
        return true;
      case 'event':
        if (m.source.eventId && !completedEvents.includes(m.source.eventId)) return false;
        return true;
      case 'purchase':
        if (m.source.price && playerGold < m.source.price) return false;
        return true;
      case 'insight':
        if (m.source.minInsight && playerInsight < m.source.minInsight) return false;
        return true;
      default:
        return false;
    }
  });
}

export function getVisibleMartialArts(
  playerInsight: number,
  knownTechniqueIds: string[],
  completedEvents: string[]
): MartialArt[] {
  return MARTIAL_ARTS.filter(m => {
    if (knownTechniqueIds.includes(m.id)) return true;

    if (m.source.type === 'initial') return true;

    if (m.source.type === 'event' && m.source.eventId && completedEvents.includes(m.source.eventId)) return true;

    if (m.source.type === 'insight' && m.source.minInsight && playerInsight >= m.source.minInsight) return true;

    if (m.source.type === 'purchase') return true;

    return false;
  });
}

export function calculatePassiveBonuses(
  knownTechniqueIds: string[]
): {
  attributeBonuses: Partial<Record<keyof Attributes, number>>;
  combatBonuses: Partial<Record<keyof Omit<CombatStats, 'currentHP' | 'currentEnergy'>, number>>;
  hpRegen: number;
  energyRegen: number;
} {
  const attributeBonuses: Partial<Record<keyof Attributes, number>> = {};
  const combatBonuses: Partial<Record<keyof Omit<CombatStats, 'currentHP' | 'currentEnergy'>, number>> = {};
  let hpRegen = 0;
  let energyRegen = 0;

  knownTechniqueIds.forEach(techId => {
    const art = getMartialArt(techId);
    if (!art) return;

    art.passiveEffects.forEach(effect => {
      switch (effect.type) {
        case 'attribute_bonus':
          if (effect.attribute) {
            attributeBonuses[effect.attribute] = (attributeBonuses[effect.attribute] || 0) + effect.value;
          }
          break;
        case 'combat_bonus':
          if (effect.combatStat) {
            combatBonuses[effect.combatStat] = (combatBonuses[effect.combatStat] || 0) + effect.value;
          }
          break;
        case 'hp_regen':
          hpRegen += effect.value;
          break;
        case 'energy_regen':
          energyRegen += effect.value;
          break;
      }
    });
  });

  return { attributeBonuses, combatBonuses, hpRegen, energyRegen };
}
