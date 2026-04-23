import type { Enemy } from '../types';

export const ENEMIES: Record<string, Enemy> = {
  wolf: {
    id: 'wolf', nameCN: '野狼', descriptionCN: '丛林中的野狼，凶猛异常',
    level: 1, zone: 1, baseHP: 30, baseAttack: 8, baseDefense: 2, baseSpeed: 12,
    expReward: 15, goldReward: { min: 5, max: 20 }, lootTable: []
  },
  bandit: {
    id: 'bandit', nameCN: '山贼', descriptionCN: '占山为王的匪徒',
    level: 2, zone: 1, baseHP: 45, baseAttack: 12, baseDefense: 5, baseSpeed: 10,
    expReward: 25, goldReward: { min: 10, max: 40 }, lootTable: []
  },
  mountainBandit: {
    id: 'mountain-bandit', nameCN: '高山贼', descriptionCN: '盘踞高山的匪首',
    level: 3, zone: 2, baseHP: 60, baseAttack: 15, baseDefense: 8, baseSpeed: 8,
    expReward: 40, goldReward: { min: 20, max: 60 }, lootTable: []
  },
  shadowBeast: {
    id: 'shadow-beast', nameCN: '幽冥兽', descriptionCN: '幽暗密林中的妖兽',
    level: 4, zone: 2, baseHP: 80, baseAttack: 20, baseDefense: 10, baseSpeed: 15,
    expReward: 60, goldReward: { min: 30, max: 80 }, lootTable: []
  },
  caveSpider: {
    id: 'cave-spider', nameCN: '洞穴蜘蛛', descriptionCN: '幽冥洞府中的毒蜘蛛',
    level: 3, zone: 2, baseHP: 50, baseAttack: 18, baseDefense: 6, baseSpeed: 12,
    expReward: 45, goldReward: { min: 25, max: 70 }, lootTable: []
  },
  templeGuard: {
    id: 'temple-guard', nameCN: '寺院护卫', descriptionCN: '古刹禅寺的武僧',
    level: 5, zone: 2, baseHP: 100, baseAttack: 22, baseDefense: 15, baseSpeed: 10,
    expReward: 80, goldReward: { min: 40, max: 100 }, lootTable: []
  },
};

export function getScaledEnemy(enemyId: string, playerLevel: number, _zone: number): Enemy {
  const base = ENEMIES[enemyId];
  if (!base) throw new Error(`Enemy ${enemyId} not found`);
  const diff = playerLevel - base.level;
  const scale = 1 + diff * 0.1;
  return {
    ...base,
    level: playerLevel,
    baseHP: Math.floor(base.baseHP * scale),
    baseAttack: Math.floor(base.baseAttack * scale),
    baseDefense: Math.floor(base.baseDefense * scale),
    expReward: Math.floor(base.expReward * scale),
    goldReward: {
      min: Math.floor(base.goldReward.min * scale),
      max: Math.floor(base.goldReward.max * scale),
    },
  };
}
