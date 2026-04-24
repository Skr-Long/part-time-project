import type { Profession, ProfessionType, ProfessionBenefit } from '../types';

export const PROFESSIONS: Record<ProfessionType, Profession> = {
  blacksmith: {
    id: 'blacksmith',
    nameCN: '铁匠',
    descriptionCN: '锻造兵器防具的专家',
    level: 1,
    exp: 0,
    expToNext: 100,
    benefits: [
      { type: 'craft_discount', value: 5, description: '锻造费用降低5%' },
      { type: 'weapon_bonus', value: 3, description: '锻造兵器攻击+3' },
    ],
  },
  herbalist: {
    id: 'herbalist',
    nameCN: '药师',
    descriptionCN: '精通炼药之术',
    level: 1,
    exp: 0,
    expToNext: 100,
    benefits: [
      { type: 'potion_effect', value: 10, description: '药水效果+10%' },
      { type: 'herb_discount', value: 5, description: '草药价格-5%' },
    ],
  },
  merchant: {
    id: 'merchant',
    nameCN: '商人',
    descriptionCN: '买卖商品的行家',
    level: 1,
    exp: 0,
    expToNext: 100,
    benefits: [
      { type: 'buy_discount', value: 5, description: '商店购买-5%' },
      { type: 'sell_bonus', value: 10, description: '物品出售+10%' },
    ],
  },
};

export function getProfession(id: ProfessionType): Profession {
  return PROFESSIONS[id];
}

export function getProfessionBenefits(type: ProfessionType): ProfessionBenefit[] {
  const profession = PROFESSIONS[type];
  if (!profession) return [];
  return profession.benefits;
}

export function canLearnProfession(playerLevel: number, professionType: ProfessionType): boolean {
  if (professionType === 'merchant') return playerLevel >= 1;
  if (professionType === 'blacksmith' || professionType === 'herbalist') return playerLevel >= 3;
  return false;
}

export function getCraftRecipes(professionType: ProfessionType): CraftRecipe[] {
  const recipes: Record<ProfessionType, CraftRecipe[]> = {
    blacksmith: [
      { id: 'craft-iron-dagger', nameCN: '铁匕首', cost: 30, result: { id: 'iron-dagger', nameCN: '铁匕首', type: 'weapon', effects: { attackBonus: 8, defenseBonus: 0, maxHPBonus: 0, speedBonus: 0 }, descriptionCN: '普通铁制匕首', equipEffects: { attackBonus: 8, defenseBonus: 0, maxHPBonus: 0, speedBonus: 0 }, requiredLevel: 1, stackable: false, quantity: 1 }, requiredLevel: 1 },
      { id: 'craft-leather-armor', nameCN: '皮甲', cost: 50, result: { id: 'leather-armor', nameCN: '皮甲', type: 'armor', effects: { attackBonus: 0, defenseBonus: 5, maxHPBonus: 0, speedBonus: 0 }, descriptionCN: '基础皮甲', equipEffects: { attackBonus: 0, defenseBonus: 5, maxHPBonus: 0, speedBonus: 0 }, requiredLevel: 1, stackable: false, quantity: 1 }, requiredLevel: 1 },
      { id: 'craft-steel-sword', nameCN: '钢剑', cost: 100, result: { id: 'steel-sword', nameCN: '钢剑', type: 'weapon', effects: { attackBonus: 15, defenseBonus: 0, maxHPBonus: 0, speedBonus: 0 }, descriptionCN: '精钢长剑', equipEffects: { attackBonus: 15, defenseBonus: 0, maxHPBonus: 0, speedBonus: 0 }, requiredLevel: 3, stackable: false, quantity: 1 }, requiredLevel: 3 },
    ],
    herbalist: [
      { id: 'craft-health-potion', nameCN: '疗伤药', cost: 20, result: { id: 'health-potion', nameCN: '疗伤药', type: 'consumable', effects: { maxHPBonus: 0, attackBonus: 30, defenseBonus: 0, speedBonus: 0 }, descriptionCN: '恢复30HP', stackable: true, quantity: 1 }, requiredLevel: 1 },
      { id: 'craft-greater-health-potion', nameCN: '大疗伤药', cost: 60, result: { id: 'greater-health-potion', nameCN: '大疗伤药', type: 'consumable', effects: { maxHPBonus: 0, attackBonus: 80, defenseBonus: 0, speedBonus: 0 }, descriptionCN: '恢复80HP', stackable: true, quantity: 1 }, requiredLevel: 2 },
    ],
    merchant: [],
  };
  return recipes[professionType] || [];
}

export interface CraftRecipe {
  id: string;
  nameCN: string;
  cost: number;
  result: {
    id: string;
    nameCN: string;
    type: 'weapon' | 'armor' | 'accessory' | 'consumable';
    effects: { attackBonus?: number; defenseBonus?: number; maxHPBonus?: number; speedBonus?: number };
    descriptionCN: string;
    equipEffects?: { attackBonus?: number; defenseBonus?: number; maxHPBonus?: number; speedBonus?: number };
    requiredLevel?: number;
    stackable: boolean;
    quantity: number;
  };
  requiredLevel: number;
}
