import type { EquipmentItem, Attributes, CraftResult, CraftRecipe, ItemEffects, EquipmentSpecialEffect } from '../types';
import { EQUIPMENT_RARITY_INFO } from '../types';
import { getEquipment, getCraftRecipe, SPECIAL_EFFECTS } from '../data/items';

export function checkEquipmentRequirements(
  equipment: EquipmentItem,
  playerLevel: number,
  playerAttributes: Attributes,
  knownTechniques: string[]
): { canEquip: boolean; failedRequirements: string[] } {
  const failedRequirements: string[] = [];

  for (const req of equipment.requirements) {
    switch (req.type) {
      case 'level':
        if (playerLevel < req.value) {
          failedRequirements.push(req.descriptionCN);
        }
        break;
      case 'attribute':
        if (req.attribute && playerAttributes[req.attribute] < req.value) {
          failedRequirements.push(req.descriptionCN);
        }
        break;
      case 'technique':
        if (req.techniqueId && !knownTechniques.includes(req.techniqueId)) {
          failedRequirements.push(req.descriptionCN);
        }
        break;
      case 'profession':
        break;
    }
  }

  return {
    canEquip: failedRequirements.length === 0,
    failedRequirements,
  };
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getRandomRarity(blacksmithLevel: number = 1): EquipmentItem['rarity'] {
  const roll = Math.random() * 100;
  const baseChance = Math.min(blacksmithLevel * 3, 30);

  if (roll < 5 + baseChance * 0.5) return 'legendary';
  if (roll < 15 + baseChance) return 'epic';
  if (roll < 35 + baseChance * 1.5) return 'rare';
  if (roll < 60 + baseChance) return 'uncommon';
  return 'common';
}

function generateBonusEffects(rarity: EquipmentItem['rarity']): ItemEffects {
  const multiplier = EQUIPMENT_RARITY_INFO[rarity].bonusMultiplier;
  const effects: ItemEffects = {};
  const bonusCount = {
    common: 0,
    uncommon: Math.random() < 0.5 ? 1 : 0,
    rare: Math.floor(Math.random() * 2) + 1,
    epic: Math.floor(Math.random() * 2) + 2,
    legendary: Math.floor(Math.random() * 2) + 3,
  }[rarity];

  const possibleBonuses = [
    { key: 'attackBonus' as const, min: 2, max: 8 },
    { key: 'defenseBonus' as const, min: 2, max: 6 },
    { key: 'speedBonus' as const, min: 1, max: 5 },
    { key: 'maxHPBonus' as const, min: 10, max: 40 },
    { key: 'maxEnergyBonus' as const, min: 5, max: 20 },
    { key: 'critChanceBonus' as const, min: 1, max: 5 },
  ];

  const shuffled = [...possibleBonuses].sort(() => Math.random() - 0.5);

  for (let i = 0; i < bonusCount && i < shuffled.length; i++) {
    const bonus = shuffled[i];
    const baseValue = Math.floor(Math.random() * (bonus.max - bonus.min + 1)) + bonus.min;
    effects[bonus.key] = Math.floor(baseValue * multiplier);
  }

  return effects;
}

function generateSpecialEffects(rarity: EquipmentItem['rarity']): EquipmentSpecialEffect[] {
  const effects: EquipmentSpecialEffect[] = [];
  const chance = {
    common: 0,
    uncommon: 0.1,
    rare: 0.3,
    epic: 0.6,
    legendary: 1.0,
  }[rarity];

  if (Math.random() > chance) return effects;

  const effectCount: Record<EquipmentItem['rarity'], number> = {
    common: 0,
    uncommon: 1,
    rare: 1,
    epic: Math.random() < 0.5 ? 1 : 2,
    legendary: Math.random() < 0.3 ? 2 : 3,
  };
  const count = effectCount[rarity];

  const availableEffects = Object.values(SPECIAL_EFFECTS);
  const shuffled = [...availableEffects].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count && i < shuffled.length; i++) {
    effects.push(shuffled[i]);
  }

  return effects;
}

export function craftItem(
  recipeId: string,
  playerLevel: number,
  blacksmithLevel: number = 1
): CraftResult {
  const recipe = getCraftRecipe(recipeId);

  if (!recipe) {
    return {
      success: false,
      message: '打造配方不存在',
    };
  }

  if (playerLevel < recipe.requiredLevel) {
    return {
      success: false,
      message: `等级不足，需要等级 ${recipe.requiredLevel}`,
    };
  }

  if (blacksmithLevel < recipe.requiredBlacksmithLevel) {
    return {
      success: false,
      message: `铁匠等级不足，需要铁匠等级 ${recipe.requiredBlacksmithLevel}`,
    };
  }

  const baseItem = getEquipment(recipe.baseItemId);
  if (!baseItem) {
    return {
      success: false,
      message: '基础装备不存在',
    };
  }

  const randomRarity = getRandomRarity(blacksmithLevel);
  const bonusEffects = generateBonusEffects(randomRarity);
  const specialEffects = generateSpecialEffects(randomRarity);

  const finalEffects: ItemEffects = {
    ...baseItem.equipEffects,
  };

  Object.keys(bonusEffects).forEach(key => {
    const k = key as keyof ItemEffects;
    if (k === 'attributeBonus') {
      const bonusAttrs = bonusEffects.attributeBonus;
      if (bonusAttrs) {
        if (!finalEffects.attributeBonus) finalEffects.attributeBonus = {};
        Object.entries(bonusAttrs).forEach(([attrKey, value]) => {
          if (value !== undefined) {
            const typedKey = attrKey as keyof typeof bonusAttrs;
            finalEffects.attributeBonus![typedKey] = 
              (finalEffects.attributeBonus![typedKey] || 0) + value;
          }
        });
      }
    } else {
      const bonusValue = bonusEffects[k];
      if (bonusValue !== undefined && typeof bonusValue === 'number') {
        const currentValue = finalEffects[k];
        finalEffects[k] = ((typeof currentValue === 'number' ? currentValue : 0) + bonusValue) as typeof finalEffects[typeof k];
      }
    }
  });

  const craftedItem: EquipmentItem = {
    ...baseItem,
    uniqueId: generateUniqueId(),
    rarity: randomRarity,
    equipEffects: finalEffects,
    specialEffects: [...baseItem.specialEffects, ...specialEffects],
  };

  const bonusDesc = Object.entries(bonusEffects)
    .filter(([_, v]) => v !== undefined && v > 0)
    .map(([k, v]) => {
      const names: Record<string, string> = {
        attackBonus: '攻击',
        defenseBonus: '防御',
        speedBonus: '速度',
        maxHPBonus: '生命上限',
        maxEnergyBonus: '内力上限',
        critChanceBonus: '暴击率',
      };
      return `${names[k] || k}+${v}`;
    })
    .join('，');

  const specialDesc = specialEffects.length > 0
    ? `，获得特效：${specialEffects.map(e => e.nameCN).join('、')}`
    : '';

  return {
    success: true,
    item: craftedItem,
    message: `打造成功！获得${EQUIPMENT_RARITY_INFO[randomRarity].nameCN}${craftedItem.nameCN}${bonusDesc ? `，额外属性：${bonusDesc}` : ''}${specialDesc}`,
    bonusEffects,
    specialEffects,
  };
}

export function canCraftItem(
  recipe: CraftRecipe,
  inventory: { id: string; quantity: number }[],
  playerGold: number,
  playerLevel: number,
  blacksmithLevel: number = 1
): { canCraft: boolean; reason?: string } {
  if (playerLevel < recipe.requiredLevel) {
    return { canCraft: false, reason: `需要等级 ${recipe.requiredLevel}` };
  }

  if (blacksmithLevel < recipe.requiredBlacksmithLevel) {
    return { canCraft: false, reason: `需要铁匠等级 ${recipe.requiredBlacksmithLevel}` };
  }

  if (playerGold < recipe.cost) {
    return { canCraft: false, reason: `金币不足，需要 ${recipe.cost} 铜` };
  }

  for (const material of recipe.materials) {
    const inventoryItem = inventory.find(i => i.id === material.itemId);
    if (!inventoryItem || inventoryItem.quantity < material.quantity) {
      return { canCraft: false, reason: `材料不足：${material.itemId}` };
    }
  }

  return { canCraft: true };
}

export function getTotalEquipmentEffects(
  equipment: { weapon: EquipmentItem | null; armor: EquipmentItem | null; accessory: EquipmentItem | null }
): ItemEffects {
  const totalEffects: ItemEffects = {};

  const addEffects = (item: EquipmentItem | null) => {
    if (!item) return;
    const effects = item.equipEffects;
    if (effects.attackBonus) totalEffects.attackBonus = (totalEffects.attackBonus || 0) + effects.attackBonus;
    if (effects.defenseBonus) totalEffects.defenseBonus = (totalEffects.defenseBonus || 0) + effects.defenseBonus;
    if (effects.speedBonus) totalEffects.speedBonus = (totalEffects.speedBonus || 0) + effects.speedBonus;
    if (effects.maxHPBonus) totalEffects.maxHPBonus = (totalEffects.maxHPBonus || 0) + effects.maxHPBonus;
    if (effects.maxEnergyBonus) totalEffects.maxEnergyBonus = (totalEffects.maxEnergyBonus || 0) + effects.maxEnergyBonus;
    if (effects.critChanceBonus) totalEffects.critChanceBonus = (totalEffects.critChanceBonus || 0) + effects.critChanceBonus;
    if (effects.attributeBonus) {
      if (!totalEffects.attributeBonus) totalEffects.attributeBonus = {};
      Object.entries(effects.attributeBonus).forEach(([key, value]) => {
        if (value !== undefined) {
          totalEffects.attributeBonus![key as keyof typeof effects.attributeBonus] = 
            (totalEffects.attributeBonus![key as keyof typeof effects.attributeBonus] || 0) + value;
        }
      });
    }
  };

  addEffects(equipment.weapon);
  addEffects(equipment.armor);
  addEffects(equipment.accessory);

  return totalEffects;
}

export function getAllSpecialEffects(
  equipment: { weapon: EquipmentItem | null; armor: EquipmentItem | null; accessory: EquipmentItem | null }
): EquipmentSpecialEffect[] {
  const effects: EquipmentSpecialEffect[] = [];
  const addEffects = (item: EquipmentItem | null) => {
    if (item?.specialEffects) {
      effects.push(...item.specialEffects);
    }
  };
  addEffects(equipment.weapon);
  addEffects(equipment.armor);
  addEffects(equipment.accessory);
  return effects;
}

export function formatItemEffects(effects: ItemEffects): string[] {
  const parts: string[] = [];
  const effectNames: Record<string, string> = {
    attackBonus: '攻击',
    defenseBonus: '防御',
    speedBonus: '速度',
    maxHPBonus: '生命上限',
    maxEnergyBonus: '内力上限',
    critChanceBonus: '暴击率',
  };

  Object.entries(effects).forEach(([key, value]) => {
    if (key === 'attributeBonus') return;
    if (value !== undefined && value !== 0) {
      const sign = value > 0 ? '+' : '';
      parts.push(`${effectNames[key] || key}${sign}${value}`);
    }
  });

  if (effects.attributeBonus) {
    const attrNames: Record<string, string> = {
      insight: '悟性',
      constitution: '体质',
      strength: '力量',
      agility: '敏捷',
      physique: '根骨',
      luck: '幸运',
    };
    Object.entries(effects.attributeBonus).forEach(([key, value]) => {
      if (value !== undefined && value !== 0) {
        const sign = value > 0 ? '+' : '';
        parts.push(`${attrNames[key] || key}${sign}${value}`);
      }
    });
  }

  return parts;
}
