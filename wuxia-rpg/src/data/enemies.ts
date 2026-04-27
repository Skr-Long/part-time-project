import type { Enemy } from '../types';
import { scaleEnemyAttributes } from '../utils/combat';

export const ENEMIES: Record<string, Enemy> = {
  wolf: {
    id: 'wolf', nameCN: '野狼', descriptionCN: '丛林中的野狼，凶猛异常',
    level: 1, zone: 1,
    attributes: { constitution: 2, strength: 2, physique: 1, agility: 1, insight: 2, luck: 2 },
    maxEnergy: 30,
    expReward: 15, goldReward: { min: 5, max: 20 }, lootTable: []
  },
  bandit: {
    id: 'bandit', nameCN: '山贼', descriptionCN: '占山为王的匪徒',
    level: 2, zone: 1,
    attributes: { constitution: 3, strength: 3, physique: 2, agility: 1, insight: 2, luck: 2 },
    maxEnergy: 45,
    expReward: 25, goldReward: { min: 10, max: 40 }, lootTable: []
  },
  mountainBandit: {
    id: 'mountain-bandit', nameCN: '高山贼', descriptionCN: '盘踞高山的匪首',
    level: 3, zone: 2,
    attributes: { constitution: 4, strength: 4, physique: 3, agility: 2, insight: 2, luck: 2 },
    maxEnergy: 60,
    expReward: 40, goldReward: { min: 20, max: 60 }, lootTable: []
  },
  shadowBeast: {
    id: 'shadow-beast', nameCN: '幽冥兽', descriptionCN: '幽暗密林中的妖兽',
    level: 4, zone: 2,
    attributes: { constitution: 5, strength: 5, physique: 4, agility: 3, insight: 2, luck: 2 },
    maxEnergy: 75,
    expReward: 60, goldReward: { min: 30, max: 80 }, lootTable: []
  },
  caveSpider: {
    id: 'cave-spider', nameCN: '洞穴蜘蛛', descriptionCN: '幽冥洞府中的毒蜘蛛',
    level: 3, zone: 2,
    attributes: { constitution: 3, strength: 4, physique: 2, agility: 3, insight: 2, luck: 2 },
    maxEnergy: 55,
    expReward: 45, goldReward: { min: 25, max: 70 }, lootTable: []
  },
  templeGuard: {
    id: 'temple-guard', nameCN: '寺院护卫', descriptionCN: '古刹禅寺的武僧',
    level: 5, zone: 2,
    attributes: { constitution: 6, strength: 5, physique: 5, agility: 2, insight: 3, luck: 2 },
    maxEnergy: 95,
    expReward: 80, goldReward: { min: 40, max: 100 }, lootTable: []
  },
};

export function getScaledEnemy(enemyId: string, playerLevel: number): Enemy {
  const base = ENEMIES[enemyId];
  if (!base) throw new Error(`Enemy ${enemyId} not found`);
  return scaleEnemyAttributes(base, playerLevel);
}
