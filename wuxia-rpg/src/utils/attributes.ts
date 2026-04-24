import type { Attributes, CombatStats, CombatStatsType } from '../types';

export interface AttributeEffect {
  stat: string;
  statCN: string;
  formula: string;
  description: string;
}

export interface AttributeInfo {
  key: keyof Attributes;
  label: string;
  labelCN: string;
  min: number;
  max: number;
  effects: AttributeEffect[];
  description: string;
}

export const ATTRIBUTE_INFO: AttributeInfo[] = [
  {
    key: 'insight',
    label: 'insight',
    labelCN: '悟性',
    min: 1,
    max: 10,
    description: '影响内功上限和战斗后技能经验获取',
    effects: [
      {
        stat: 'maxEnergy',
        statCN: '内功上限',
        formula: '50 + 等级 × 10 + 悟性 × 5',
        description: '每点悟性增加5点内功上限'
      },
      {
        stat: 'skillExpBonus',
        statCN: '技能经验加成',
        formula: '战斗经验 × (悟性 / 10)',
        description: '每点悟性增加10%的战斗后技能经验加成'
      }
    ]
  },
  {
    key: 'constitution',
    label: 'constitution',
    labelCN: '体质',
    min: 1,
    max: 10,
    description: '影响最大生命值',
    effects: [
      {
        stat: 'maxHP',
        statCN: '最大生命值',
        formula: '100 + 体质 × 10 + 等级 × 5',
        description: '每点体质增加10点最大生命值'
      }
    ]
  },
  {
    key: 'strength',
    label: 'strength',
    labelCN: '力量',
    min: 1,
    max: 10,
    description: '影响攻击力',
    effects: [
      {
        stat: 'attack',
        statCN: '攻击力',
        formula: '10 + 力量 × 5 + 等级 × 2',
        description: '每点力量增加5点攻击力'
      }
    ]
  },
  {
    key: 'agility',
    label: 'agility',
    labelCN: '敏捷',
    min: 1,
    max: 10,
    description: '影响战斗速度',
    effects: [
      {
        stat: 'speed',
        statCN: '速度',
        formula: '10 + 敏捷 × 2 + 等级 × 1',
        description: '每点敏捷增加2点速度，影响战斗行动顺序'
      }
    ]
  },
  {
    key: 'physique',
    label: 'physique',
    labelCN: '根骨',
    min: 1,
    max: 10,
    description: '影响防御力、技能熟练度提升速度和悟性增益',
    effects: [
      {
        stat: 'defense',
        statCN: '防御力',
        formula: '5 + 根骨 × 3 + 等级 × 1',
        description: '每点根骨增加3点防御力'
      },
      {
        stat: 'skillProficiencyBonus',
        statCN: '技能熟练度加成',
        formula: '基础熟练度 × (1 + 根骨 × 0.1)',
        description: '每点根骨增加10%的技能熟练度获取速度'
      },
      {
        stat: 'insightBonus',
        statCN: '悟性增益',
        formula: '有效悟性 = 悟性 + 根骨 × 0.5',
        description: '每点根骨额外增加0.5点有效悟性'
      }
    ]
  },
  {
    key: 'luck',
    label: 'luck',
    labelCN: '幸运',
    min: -5,
    max: 10,
    description: '影响暴击率和随机事件触发概率',
    effects: [
      {
        stat: 'critChance',
        statCN: '暴击率',
        formula: 'max(0, 幸运) × 0.5%',
        description: '每点幸运增加0.5%的暴击率'
      },
      {
        stat: 'eventChance',
        statCN: '事件触发',
        formula: '幸运影响稀有事件触发概率',
        description: '高幸运增加遇到稀有事件和宝物的概率'
      }
    ]
  }
];

export const TOTAL_ATTRIBUTE_POINTS = 30;

export function getAttributeInfo(key: keyof Attributes): AttributeInfo | undefined {
  return ATTRIBUTE_INFO.find(info => info.key === key);
}

export function getAttributeLabelCN(key: keyof Attributes): string {
  return getAttributeInfo(key)?.labelCN || key;
}

export function getEffectiveInsight(attributes: Attributes): number {
  const { insight, physique } = attributes;
  return insight + physique * 0.5;
}

export function getSkillProficiencyMultiplier(attributes: Attributes): number {
  return 1 + attributes.physique * 0.1;
}

export function getSkillExpBonusMultiplier(attributes: Attributes): number {
  const effectiveInsight = getEffectiveInsight(attributes);
  return 1 + effectiveInsight / 10;
}

export function calculateBaseCombatStats(attributes: Attributes, level: number): CombatStatsType {
  const { constitution, strength, physique, agility, luck } = attributes;
  const effectiveInsight = getEffectiveInsight(attributes);

  const maxHP = 100 + constitution * 10 + level * 5;
  const attack = 10 + strength * 5 + level * 2;
  const defense = 5 + physique * 3 + level * 1;
  const speed = 10 + agility * 2 + level * 1;
  const maxEnergy = 50 + level * 10 + Math.floor(effectiveInsight * 5);
  const critChance = Math.max(0, luck) * 0.5;

  return {
    maxHP,
    attack,
    defense,
    speed,
    maxEnergy,
    critChance,
  };
}

export function calculateCombatStats(attributes: Attributes, level: number): CombatStats {
  const base = calculateBaseCombatStats(attributes, level);
  return {
    ...base,
    currentHP: base.maxHP,
    currentEnergy: base.maxEnergy,
  };
}

export function generateRandomAttributes(): Attributes {
  const attributes: Attributes = {
    insight: 5,
    constitution: 5,
    strength: 5,
    agility: 5,
    physique: 5,
    luck: 5,
  };

  const keys = Object.keys(attributes) as (keyof Attributes)[];
  let remainingPoints = 0;

  for (const key of keys) {
    const info = getAttributeInfo(key);
    if (!info) continue;

    const minPoints = Math.max(info.min, 1);
    const maxAdditional = info.max - minPoints;
    const randomAdd = Math.floor(Math.random() * (maxAdditional + 1));

    attributes[key] = minPoints + randomAdd;
    remainingPoints += randomAdd;
  }

  let pointsToDistribute = TOTAL_ATTRIBUTE_POINTS - Object.values(attributes).reduce((a, b) => a + b, 0);

  while (pointsToDistribute > 0) {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const info = getAttributeInfo(randomKey);
    if (!info) continue;

    if (attributes[randomKey] < info.max) {
      attributes[randomKey]++;
      pointsToDistribute--;
    }
  }

  while (pointsToDistribute < 0) {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const info = getAttributeInfo(randomKey);
    if (!info) continue;

    if (attributes[randomKey] > info.min) {
      attributes[randomKey]--;
      pointsToDistribute++;
    }
  }

  return attributes;
}

export function isValidAttributeDistribution(attributes: Attributes): boolean {
  const totalUsed = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  
  for (const key of Object.keys(attributes) as (keyof Attributes)[]) {
    const info = getAttributeInfo(key);
    if (!info) continue;
    if (attributes[key] < info.min || attributes[key] > info.max) {
      return false;
    }
  }
  
  return totalUsed === TOTAL_ATTRIBUTE_POINTS;
}

export function getCombatStatsDisplay(stats: CombatStatsType): { key: string; label: string; value: number; icon: string }[] {
  return [
    { key: 'maxHP', label: '生命值', value: stats.maxHP, icon: '❤️' },
    { key: 'maxEnergy', label: '内功值', value: stats.maxEnergy, icon: '💫' },
    { key: 'attack', label: '攻击力', value: stats.attack, icon: '⚔️' },
    { key: 'defense', label: '防御力', value: stats.defense, icon: '🛡️' },
    { key: 'speed', label: '速度', value: stats.speed, icon: '💨' },
    { key: 'critChance', label: '暴击率', value: stats.critChance, icon: '🎯' },
  ];
}
