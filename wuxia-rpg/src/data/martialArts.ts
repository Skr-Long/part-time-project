import type { MartialArt } from '../types';

export const MARTIAL_ARTS: MartialArt[] = [
  // 內功 (Internal)
  {
    id: 'basic-qi',
    nameCN: '吐纳法',
    descriptionCN: '最基本的呼吸吐纳之法，可调息养气。',
    type: 'internal',
    level: 1,
    insightRequired: 1,
    learningChanceBase: 90,
    effects: [
      { type: 'heal', value: 10, application: 'instant' },
    ],
  },
  {
    id: 'iron-cloth',
    nameCN: '金鐘罩',
    descriptionCN: '傳說中的護體神功，刀槍不入。',
    type: 'internal',
    level: 5,
    insightRequired: 5,
    learningChanceBase: 60,
    effects: [
      { type: 'buff', value: 20, scalingAttribute: 'physique', scalingPercent: 5, duration: 3, application: 'temporary' },
    ],
  },
  {
    id: 'nine-turns',
    nameCN: '九轉玄陽功',
    descriptionCN: '高深內功，陽剛霸道，威力驚人。',
    type: 'internal',
    level: 10,
    insightRequired: 8,
    learningChanceBase: 30,
    prerequisiteSkills: ['iron-cloth'],
    effects: [
      { type: 'damage', value: 30, scalingAttribute: 'strength', scalingPercent: 10, application: 'instant' },
      { type: 'heal', value: 15, application: 'instant' },
    ],
  },

  // 外功 (External)
  {
    id: 'iron-fist',
    nameCN: '鐵砂掌',
    descriptionCN: '手掌如鐵，開碑裂石。',
    type: 'external',
    level: 1,
    insightRequired: 1,
    learningChanceBase: 85,
    effects: [
      { type: 'damage', value: 15, scalingAttribute: 'strength', scalingPercent: 5, application: 'instant' },
    ],
  },
  {
    id: 'tiger-fist',
    nameCN: '虎形拳',
    descriptionCN: '剛猛虎拳，勢如猛虎下山。',
    type: 'external',
    level: 3,
    insightRequired: 3,
    learningChanceBase: 70,
    prerequisiteSkills: ['iron-fist'],
    effects: [
      { type: 'damage', value: 25, scalingAttribute: 'strength', scalingPercent: 8, application: 'instant' },
    ],
  },
  {
    id: 'dragon-fist',
    nameCN: '龍形步',
    descriptionCN: '龍形虎勢，變化莫測。',
    type: 'external',
    level: 7,
    insightRequired: 6,
    learningChanceBase: 45,
    prerequisiteSkills: ['tiger-fist'],
    effects: [
      { type: 'damage', value: 40, scalingAttribute: 'agility', scalingPercent: 10, application: 'instant' },
      { type: 'debuff', value: 10, scalingAttribute: 'agility', scalingPercent: 5, duration: 2, application: 'temporary' },
    ],
  },

  // 兵器 (Weapon)
  {
    id: 'sword-qi',
    nameCN: '劍氣術',
    descriptionCN: '以氣馭劍，劍氣縱橫。',
    type: 'weapon',
    level: 2,
    insightRequired: 2,
    learningChanceBase: 75,
    effects: [
      { type: 'damage', value: 20, scalingAttribute: 'strength', scalingPercent: 7, application: 'instant' },
    ],
  },
  {
    id: 'blade-dance',
    nameCN: '刀法要論',
    descriptionCN: '刀如猛虎，橫掃千軍。',
    type: 'weapon',
    level: 4,
    insightRequired: 4,
    learningChanceBase: 65,
    effects: [
      { type: 'damage', value: 30, scalingAttribute: 'strength', scalingPercent: 8, application: 'instant' },
    ],
  },
  {
    id: 'spear-stance',
    nameCN: '霸王槍法',
    descriptionCN: '霸氣十足的槍法，一往無前。',
    type: 'weapon',
    level: 8,
    insightRequired: 7,
    learningChanceBase: 40,
    prerequisiteSkills: ['blade-dance'],
    effects: [
      { type: 'damage', value: 50, scalingAttribute: 'strength', scalingPercent: 12, application: 'instant' },
    ],
  },

  // 特殊 (Special)
  {
    id: 'light-step',
    nameCN: '輕功水上漂',
    descriptionCN: '傳說中的極致輕功，踏雪無痕。',
    type: 'special',
    level: 3,
    insightRequired: 4,
    learningChanceBase: 50,
    effects: [
      { type: 'buff', value: 30, scalingAttribute: 'agility', scalingPercent: 15, duration: 3, application: 'temporary' },
    ],
  },
  {
    id: 'heal-palm',
    nameCN: '療傷掌',
    descriptionCN: '以內力療傷，妙手回春。',
    type: 'special',
    level: 6,
    insightRequired: 6,
    learningChanceBase: 35,
    prerequisiteSkills: ['basic-qi'],
    effects: [
      { type: 'heal', value: 40, scalingAttribute: 'constitution', scalingPercent: 10, application: 'instant' },
    ],
  },
  {
    id: 'one-finger',
    nameCN: '一陽指',
    descriptionCN: '段氏絕學，指可碎金。',
    type: 'special',
    level: 10,
    insightRequired: 9,
    learningChanceBase: 20,
    prerequisiteSkills: ['nine-turns', 'dragon-fist'],
    effects: [
      { type: 'damage', value: 80, scalingAttribute: 'insight', scalingPercent: 15, application: 'instant' },
      { type: 'debuff', value: 20, duration: 2, application: 'temporary' },
    ],
  },
];

export function getMartialArt(id: string): MartialArt | undefined {
  return MARTIAL_ARTS.find(m => m.id === id);
}

export function getMartialArtsByType(type: MartialArt['type']): MartialArt[] {
  return MARTIAL_ARTS.filter(m => m.type === type);
}

export function getAvailableMartialArts(playerInsight: number, knownTechniqueIds: string[]): MartialArt[] {
  return MARTIAL_ARTS.filter(m => {
    if (m.insightRequired > playerInsight) return false;
    if (knownTechniqueIds.includes(m.id)) return false;
    if (m.prerequisiteSkills) {
      return m.prerequisiteSkills.every(pre => knownTechniqueIds.includes(pre));
    }
    return true;
  });
}
