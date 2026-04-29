import type { InventoryItem, EquipmentItem, EquipmentSpecialEffect, CraftRecipe } from '../types';

export const SPECIAL_EFFECTS: Record<string, EquipmentSpecialEffect> = {
  'life-steal-basic': {
    id: 'life-steal-basic',
    nameCN: '吸血',
    descriptionCN: '攻击时有10%概率吸取伤害的10%作为生命',
    type: 'combat_trigger',
    triggerCondition: 'on_attack',
    effects: [{ type: 'lifesteal', value: 10, valueType: 'percent' }],
  },
  'life-steal-advanced': {
    id: 'life-steal-advanced',
    nameCN: '噬魂',
    descriptionCN: '攻击时有15%概率吸取伤害的20%作为生命',
    type: 'combat_trigger',
    triggerCondition: 'on_attack',
    effects: [{ type: 'lifesteal', value: 20, valueType: 'percent' }],
  },
  'crit-bonus-basic': {
    id: 'crit-bonus-basic',
    nameCN: '锐利',
    descriptionCN: '暴击率+5%',
    type: 'passive',
    effects: [{ type: 'critical_bonus', value: 5, valueType: 'percent' }],
  },
  'crit-bonus-advanced': {
    id: 'crit-bonus-advanced',
    nameCN: '致命',
    descriptionCN: '暴击率+10%，暴击伤害+50%',
    type: 'passive',
    effects: [
      { type: 'critical_bonus', value: 10, valueType: 'percent' },
      { type: 'damage_bonus', value: 50, valueType: 'percent' },
    ],
  },
  'heal-on-hit': {
    id: 'heal-on-hit',
    nameCN: '回春',
    descriptionCN: '被攻击时有20%概率恢复最大生命值的5%',
    type: 'combat_trigger',
    triggerCondition: 'on_defend',
    effects: [{ type: 'heal_on_hit', value: 5, valueType: 'percent' }],
  },
  'attack-bonus-passive': {
    id: 'attack-bonus-passive',
    nameCN: '勇猛',
    descriptionCN: '攻击力+15%',
    type: 'passive',
    effects: [{ type: 'combat_bonus', combatStat: 'attack', value: 15, valueType: 'percent' }],
  },
  'defense-bonus-passive': {
    id: 'defense-bonus-passive',
    nameCN: '坚韧',
    descriptionCN: '防御力+20%',
    type: 'passive',
    effects: [{ type: 'combat_bonus', combatStat: 'defense', value: 20, valueType: 'percent' }],
  },
  'speed-bonus-passive': {
    id: 'speed-bonus-passive',
    nameCN: '疾风',
    descriptionCN: '速度+15%',
    type: 'passive',
    effects: [{ type: 'combat_bonus', combatStat: 'speed', value: 15, valueType: 'percent' }],
  },
  'hp-bonus-passive': {
    id: 'hp-bonus-passive',
    nameCN: '血气',
    descriptionCN: '最大生命值+15%',
    type: 'passive',
    effects: [{ type: 'combat_bonus', combatStat: 'maxHP', value: 15, valueType: 'percent' }],
  },
  'energy-bonus-passive': {
    id: 'energy-bonus-passive',
    nameCN: '灵韵',
    descriptionCN: '最大内力+20%',
    type: 'passive',
    effects: [{ type: 'combat_bonus', combatStat: 'maxEnergy', value: 20, valueType: 'percent' }],
  },
};

function createEquipment(
  id: string,
  name: string,
  nameCN: string,
  type: 'weapon' | 'armor' | 'accessory',
  rarity: EquipmentItem['rarity'],
  baseEffects: EquipmentItem['equipEffects'],
  requiredLevel: number,
  requirements: EquipmentItem['requirements'] = [],
  specialEffects: EquipmentItem['specialEffects'] = [],
  descriptionCN: string,
  value: number
): EquipmentItem {
  const multiplier = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0,
  }[rarity];

  const scaledEffects: EquipmentItem['equipEffects'] = {
    attackBonus: baseEffects.attackBonus ? Math.floor(baseEffects.attackBonus * multiplier) : undefined,
    defenseBonus: baseEffects.defenseBonus ? Math.floor(baseEffects.defenseBonus * multiplier) : undefined,
    speedBonus: baseEffects.speedBonus ? Math.floor(baseEffects.speedBonus * multiplier) : undefined,
    maxHPBonus: baseEffects.maxHPBonus ? Math.floor(baseEffects.maxHPBonus * multiplier) : undefined,
    maxEnergyBonus: baseEffects.maxEnergyBonus ? Math.floor(baseEffects.maxEnergyBonus * multiplier) : undefined,
    critChanceBonus: baseEffects.critChanceBonus ? Math.floor(baseEffects.critChanceBonus * multiplier) : undefined,
    attributeBonus: baseEffects.attributeBonus,
  };

  return {
    id,
    name,
    nameCN,
    type,
    quantity: 1,
    description: name,
    descriptionCN,
    effects: {},
    stackable: false,
    value,
    rarity,
    equipEffects: scaledEffects,
    requiredLevel,
    requirements: [
      { type: 'level', value: requiredLevel, descriptionCN: `等级 ${requiredLevel}` },
      ...requirements,
    ],
    specialEffects,
    craftable: true,
  };
}

export const WEAPONS: Record<string, EquipmentItem> = {
  'wooden-sword': createEquipment(
    'wooden-sword', 'Wooden Sword', '木剑', 'weapon', 'common',
    { attackBonus: 3 }, 1, [], [],
    '一把普通的木剑，适合新手练习', 10
  ),
  'iron-sword': createEquipment(
    'iron-sword', 'Iron Sword', '铁剑', 'weapon', 'common',
    { attackBonus: 8 }, 1, [], [],
    '一把普通的铁剑', 50
  ),
  'iron-dagger': createEquipment(
    'iron-dagger', 'Iron Dagger', '铁匕首', 'weapon', 'common',
    { attackBonus: 6, speedBonus: 3 }, 1, [], [],
    '轻便的铁匕首，适合快速攻击', 40
  ),
  'steel-sword': createEquipment(
    'steel-sword', 'Steel Sword', '钢剑', 'weapon', 'uncommon',
    { attackBonus: 15 }, 3,
    [{ type: 'attribute', attribute: 'strength', value: 6, descriptionCN: '力量 6' }],
    [],
    '一把精钢打造的利剑', 150
  ),
  'iron-spear': createEquipment(
    'iron-spear', 'Iron Spear', '铁枪', 'weapon', 'uncommon',
    { attackBonus: 18, speedBonus: -2 }, 4,
    [{ type: 'attribute', attribute: 'strength', value: 8, descriptionCN: '力量 8' }],
    [],
    '沉重的铁枪，攻击力强但速度较慢', 180
  ),
  'jade-blade': createEquipment(
    'jade-blade', 'Jade Blade', '玉剑', 'weapon', 'rare',
    { attackBonus: 25, speedBonus: 5, critChanceBonus: 3 }, 8,
    [{ type: 'attribute', attribute: 'strength', value: 10, descriptionCN: '力量 10' }],
    [SPECIAL_EFFECTS['crit-bonus-basic']],
    '镶嵌玉石的宝剑，蕴含灵气', 500
  ),
  'flame-blade': createEquipment(
    'flame-blade', 'Flame Blade', '烈焰刀', 'weapon', 'rare',
    { attackBonus: 30, critChanceBonus: 5 }, 10,
    [
      { type: 'attribute', attribute: 'strength', value: 12, descriptionCN: '力量 12' },
      { type: 'attribute', attribute: 'physique', value: 8, descriptionCN: '根骨 8' },
    ],
    [SPECIAL_EFFECTS['attack-bonus-passive']],
    '刀身泛着红光，攻击附带火焰之力', 600
  ),
  'shadow-blade': createEquipment(
    'shadow-blade', 'Shadow Blade', '暗影剑', 'weapon', 'epic',
    { attackBonus: 45, speedBonus: 10, critChanceBonus: 8 }, 15,
    [
      { type: 'attribute', attribute: 'strength', value: 15, descriptionCN: '力量 15' },
      { type: 'attribute', attribute: 'agility', value: 12, descriptionCN: '敏捷 12' },
    ],
    [SPECIAL_EFFECTS['life-steal-basic'], SPECIAL_EFFECTS['crit-bonus-advanced']],
    '传说中的暗影剑，剑身如墨，吸血噬魂', 2000
  ),
  'dragon-sword': createEquipment(
    'dragon-sword', 'Dragon Sword', '屠龙剑', 'weapon', 'legendary',
    { attackBonus: 80, speedBonus: 15, critChanceBonus: 12, maxHPBonus: 50 }, 25,
    [
      { type: 'attribute', attribute: 'strength', value: 20, descriptionCN: '力量 20' },
      { type: 'attribute', attribute: 'agility', value: 15, descriptionCN: '敏捷 15' },
      { type: 'attribute', attribute: 'physique', value: 15, descriptionCN: '根骨 15' },
    ],
    [SPECIAL_EFFECTS['life-steal-advanced'], SPECIAL_EFFECTS['crit-bonus-advanced'], SPECIAL_EFFECTS['attack-bonus-passive']],
    '传说中的神兵利器，曾斩杀恶龙，剑身泛着龙气', 10000
  ),
};

export const ARMORS: Record<string, EquipmentItem> = {
  'cloth-armor': createEquipment(
    'cloth-armor', 'Cloth Armor', '布衣', 'armor', 'common',
    { defenseBonus: 2, maxHPBonus: 10 }, 1, [], [],
    '普通的布衣，提供基本防护', 20
  ),
  'leather-armor': createEquipment(
    'leather-armor', 'Leather Armor', '皮甲', 'armor', 'common',
    { defenseBonus: 5, maxHPBonus: 20 }, 1, [], [],
    '基础的皮甲', 60
  ),
  'iron-armor': createEquipment(
    'iron-armor', 'Iron Armor', '铁甲', 'armor', 'uncommon',
    { defenseBonus: 12, maxHPBonus: 40, speedBonus: -3 }, 3,
    [{ type: 'attribute', attribute: 'physique', value: 6, descriptionCN: '根骨 6' }],
    [],
    '厚重的铁甲，防御力强但影响速度', 180
  ),
  'steel-armor': createEquipment(
    'steel-armor', 'Steel Armor', '钢甲', 'armor', 'uncommon',
    { defenseBonus: 18, maxHPBonus: 60, speedBonus: -2 }, 5,
    [{ type: 'attribute', attribute: 'physique', value: 8, descriptionCN: '根骨 8' }],
    [],
    '精钢打造的铠甲', 250
  ),
  'chain-mail': createEquipment(
    'chain-mail', 'Chain Mail', '锁子甲', 'armor', 'rare',
    { defenseBonus: 25, maxHPBonus: 80 }, 8,
    [
      { type: 'attribute', attribute: 'physique', value: 10, descriptionCN: '根骨 10' },
      { type: 'attribute', attribute: 'constitution', value: 8, descriptionCN: '体质 8' },
    ],
    [SPECIAL_EFFECTS['defense-bonus-passive']],
    '由无数铁环连接而成，轻便且防护良好', 600
  ),
  'jade-armor': createEquipment(
    'jade-armor', 'Jade Armor', '玉甲', 'armor', 'rare',
    { defenseBonus: 22, maxHPBonus: 100, maxEnergyBonus: 30 }, 10,
    [
      { type: 'attribute', attribute: 'physique', value: 12, descriptionCN: '根骨 12' },
      { type: 'attribute', attribute: 'insight', value: 8, descriptionCN: '悟性 8' },
    ],
    [SPECIAL_EFFECTS['energy-bonus-passive']],
    '镶嵌玉石的宝甲，蕴含灵气，可增强内力', 700
  ),
  'black-iron-armor': createEquipment(
    'black-iron-armor', 'Black Iron Armor', '玄铁甲', 'armor', 'epic',
    { defenseBonus: 40, maxHPBonus: 150, speedBonus: 5 }, 18,
    [
      { type: 'attribute', attribute: 'physique', value: 15, descriptionCN: '根骨 15' },
      { type: 'attribute', attribute: 'constitution', value: 12, descriptionCN: '体质 12' },
      { type: 'attribute', attribute: 'strength', value: 10, descriptionCN: '力量 10' },
    ],
    [SPECIAL_EFFECTS['defense-bonus-passive'], SPECIAL_EFFECTS['hp-bonus-passive']],
    '由千年玄铁打造，坚不可摧，且蕴含神秘力量', 2500
  ),
  'dragon-scale-armor': createEquipment(
    'dragon-scale-armor', 'Dragon Scale Armor', '龙鳞甲', 'armor', 'legendary',
    { defenseBonus: 70, maxHPBonus: 300, maxEnergyBonus: 100, speedBonus: 10 }, 30,
    [
      { type: 'attribute', attribute: 'physique', value: 20, descriptionCN: '根骨 20' },
      { type: 'attribute', attribute: 'constitution', value: 18, descriptionCN: '体质 18' },
      { type: 'attribute', attribute: 'strength', value: 15, descriptionCN: '力量 15' },
      { type: 'attribute', attribute: 'insight', value: 12, descriptionCN: '悟性 12' },
    ],
    [SPECIAL_EFFECTS['heal-on-hit'], SPECIAL_EFFECTS['defense-bonus-passive'], SPECIAL_EFFECTS['hp-bonus-passive']],
    '传说由龙鳞打造的神甲，刀枪不入，水火不侵', 12000
  ),
};

export const ACCESSORIES: Record<string, EquipmentItem> = {
  'copper-ring': createEquipment(
    'copper-ring', 'Copper Ring', '铜戒指', 'accessory', 'common',
    { speedBonus: 2, maxHPBonus: 10 }, 1, [], [],
    '普通的铜戒指', 15
  ),
  'jade-ring': createEquipment(
    'jade-ring', 'Jade Ring', '玉佩', 'accessory', 'common',
    { speedBonus: 5, maxHPBonus: 25 }, 2, [], [],
    '蕴含灵气的玉佩', 80
  ),
  'silver-necklace': createEquipment(
    'silver-necklace', 'Silver Necklace', '银项链', 'accessory', 'uncommon',
    { speedBonus: 8, maxHPBonus: 40, critChanceBonus: 2 }, 5,
    [{ type: 'attribute', attribute: 'agility', value: 6, descriptionCN: '敏捷 6' }],
    [],
    '精美的银项链，能提升反应速度', 200
  ),
  'amulet-of-power': createEquipment(
    'amulet-of-power', 'Amulet of Power', '力量护符', 'accessory', 'rare',
    { attackBonus: 12, defenseBonus: 8, maxHPBonus: 60 }, 8,
    [
      { type: 'attribute', attribute: 'strength', value: 8, descriptionCN: '力量 8' },
      { type: 'attribute', attribute: 'physique', value: 8, descriptionCN: '根骨 8' },
    ],
    [SPECIAL_EFFECTS['attack-bonus-passive']],
    '蕴含力量的护符，能增强攻防', 500
  ),
  'swift-boots': createEquipment(
    'swift-boots', 'Swift Boots', '疾风靴', 'accessory', 'rare',
    { speedBonus: 15, maxHPBonus: 30 }, 10,
    [{ type: 'attribute', attribute: 'agility', value: 10, descriptionCN: '敏捷 10' }],
    [SPECIAL_EFFECTS['speed-bonus-passive']],
    '施展轻功时如疾风般迅速', 550
  ),
  'spirit-pendant': createEquipment(
    'spirit-pendant', 'Spirit Pendant', '灵韵坠', 'accessory', 'epic',
    { maxEnergyBonus: 80, speedBonus: 10, maxHPBonus: 80 }, 15,
    [
      { type: 'attribute', attribute: 'insight', value: 12, descriptionCN: '悟性 12' },
      { type: 'attribute', attribute: 'agility', value: 10, descriptionCN: '敏捷 10' },
    ],
    [SPECIAL_EFFECTS['energy-bonus-passive'], SPECIAL_EFFECTS['speed-bonus-passive']],
    '蕴含天地灵气的吊坠，能大幅提升内力', 2000
  ),
  'luck-charm': createEquipment(
    'luck-charm', 'Luck Charm', '幸运符', 'accessory', 'epic',
    { critChanceBonus: 10, maxHPBonus: 50, speedBonus: 8 }, 18,
    [
      { type: 'attribute', attribute: 'luck', value: 8, descriptionCN: '幸运 8' },
      { type: 'attribute', attribute: 'agility', value: 10, descriptionCN: '敏捷 10' },
    ],
    [SPECIAL_EFFECTS['crit-bonus-advanced'], SPECIAL_EFFECTS['hp-bonus-passive']],
    '传说能带来好运的符咒', 2200
  ),
  'heavenly-pearl': createEquipment(
    'heavenly-pearl', 'Heavenly Pearl', '天珠', 'accessory', 'legendary',
    { maxHPBonus: 200, maxEnergyBonus: 150, speedBonus: 20, critChanceBonus: 15, attackBonus: 20, defenseBonus: 20 }, 30,
    [
      { type: 'attribute', attribute: 'insight', value: 18, descriptionCN: '悟性 18' },
      { type: 'attribute', attribute: 'agility', value: 15, descriptionCN: '敏捷 15' },
      { type: 'attribute', attribute: 'luck', value: 12, descriptionCN: '幸运 12' },
    ],
    [SPECIAL_EFFECTS['life-steal-advanced'], SPECIAL_EFFECTS['crit-bonus-advanced'], SPECIAL_EFFECTS['hp-bonus-passive'], SPECIAL_EFFECTS['energy-bonus-passive']],
    '传说中来自天界的宝珠，蕴含无尽神力', 15000
  ),
};

export const CONSUMABLES: Record<string, InventoryItem> = {
  'health-potion': {
    id: 'health-potion', name: 'Health Potion', nameCN: '疗伤药',
    type: 'consumable', quantity: 1,
    description: 'Restores 30 HP', descriptionCN: '恢复30点气血',
    effects: { attackBonus: 30 }, stackable: true, value: 20,
  },
  'greater-health-potion': {
    id: 'greater-health-potion', name: 'Greater Health Potion', nameCN: '大疗伤药',
    type: 'consumable', quantity: 1,
    description: 'Restores 80 HP', descriptionCN: '恢复80点气血',
    effects: { attackBonus: 80 }, stackable: true, value: 60,
  },
  'energy-potion': {
    id: 'energy-potion', name: 'Energy Potion', nameCN: '内力丹',
    type: 'consumable', quantity: 1,
    description: 'Restores 30 Energy', descriptionCN: '恢复30点内力',
    effects: { maxEnergyBonus: 30 }, stackable: true, value: 25,
  },
  'antidote': {
    id: 'antidote', name: 'Antidote', nameCN: '解毒丹',
    type: 'consumable', quantity: 1,
    description: 'Cures poison', descriptionCN: '解除中毒状态',
    effects: {}, stackable: true, value: 30,
  },
};

export const MATERIALS: Record<string, InventoryItem> = {
  'wolf-skin': {
    id: 'wolf-skin', name: 'Wolf Skin', nameCN: '狼皮',
    type: 'material', quantity: 1,
    description: 'Wolf skin for crafting', descriptionCN: '可用于制皮的狼皮',
    effects: {}, stackable: true, value: 10,
  },
  'iron-ore': {
    id: 'iron-ore', name: 'Iron Ore', nameCN: '铁矿石',
    type: 'material', quantity: 1,
    description: 'Raw iron ore', descriptionCN: '未提炼的铁矿石',
    effects: {}, stackable: true, value: 5,
  },
  'steel-ingot': {
    id: 'steel-ingot', name: 'Steel Ingot', nameCN: '钢锭',
    type: 'material', quantity: 1,
    description: 'Refined steel', descriptionCN: '精炼钢材',
    effects: {}, stackable: true, value: 30,
  },
  'black-iron-ore': {
    id: 'black-iron-ore', name: 'Black Iron Ore', nameCN: '玄铁矿石',
    type: 'material', quantity: 1,
    description: 'Rare black iron ore', descriptionCN: '稀有的玄铁矿石',
    effects: {}, stackable: true, value: 100,
  },
  'jade-stone': {
    id: 'jade-stone', name: 'Jade Stone', nameCN: '玉石',
    type: 'material', quantity: 1,
    description: 'Precious jade stone', descriptionCN: '珍贵的玉石',
    effects: {}, stackable: true, value: 50,
  },
  'silver-ore': {
    id: 'silver-ore', name: 'Silver Ore', nameCN: '银矿石',
    type: 'material', quantity: 1,
    description: 'Silver ore', descriptionCN: '银矿石',
    effects: {}, stackable: true, value: 20,
  },
  'spirit-essence': {
    id: 'spirit-essence', name: 'Spirit Essence', nameCN: '灵韵精华',
    type: 'material', quantity: 1,
    description: 'Essence containing spiritual energy', descriptionCN: '蕴含灵气的精华',
    effects: {}, stackable: true, value: 200,
  },
  'dragon-scale': {
    id: 'dragon-scale', name: 'Dragon Scale', nameCN: '龙鳞',
    type: 'material', quantity: 1,
    description: 'Legendary dragon scale', descriptionCN: '传说中的龙鳞',
    effects: {}, stackable: true, value: 1000,
  },
};

export const ITEMS: Record<string, InventoryItem | EquipmentItem> = {
  ...WEAPONS,
  ...ARMORS,
  ...ACCESSORIES,
  ...CONSUMABLES,
  ...MATERIALS,
};

export function getItem(itemId: string): InventoryItem | EquipmentItem | undefined {
  return ITEMS[itemId];
}

export function getEquipment(itemId: string): EquipmentItem | undefined {
  const item = ITEMS[itemId];
  if (item && ['weapon', 'armor', 'accessory'].includes(item.type)) {
    return item as EquipmentItem;
  }
  return undefined;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: 'craft-wooden-sword',
    nameCN: '木剑',
    baseItemId: 'wooden-sword',
    cost: 10,
    materials: [{ itemId: 'iron-ore', quantity: 1 }],
    requiredLevel: 1,
    requiredBlacksmithLevel: 1,
    descriptionCN: '打造一把普通的木剑',
  },
  {
    id: 'craft-iron-sword',
    nameCN: '铁剑',
    baseItemId: 'iron-sword',
    cost: 50,
    materials: [{ itemId: 'iron-ore', quantity: 3 }],
    requiredLevel: 1,
    requiredBlacksmithLevel: 1,
    descriptionCN: '打造一把普通的铁剑',
  },
  {
    id: 'craft-iron-dagger',
    nameCN: '铁匕首',
    baseItemId: 'iron-dagger',
    cost: 40,
    materials: [{ itemId: 'iron-ore', quantity: 2 }],
    requiredLevel: 1,
    requiredBlacksmithLevel: 1,
    descriptionCN: '打造一把轻便的铁匕首',
  },
  {
    id: 'craft-leather-armor',
    nameCN: '皮甲',
    baseItemId: 'leather-armor',
    cost: 60,
    materials: [{ itemId: 'wolf-skin', quantity: 3 }],
    requiredLevel: 1,
    requiredBlacksmithLevel: 1,
    descriptionCN: '打造一套基础皮甲',
  },
  {
    id: 'craft-copper-ring',
    nameCN: '铜戒指',
    baseItemId: 'copper-ring',
    cost: 15,
    materials: [{ itemId: 'iron-ore', quantity: 1 }],
    requiredLevel: 1,
    requiredBlacksmithLevel: 1,
    descriptionCN: '打造一枚普通的铜戒指',
  },
  {
    id: 'craft-steel-sword',
    nameCN: '钢剑',
    baseItemId: 'steel-sword',
    cost: 150,
    materials: [{ itemId: 'steel-ingot', quantity: 3 }],
    requiredLevel: 3,
    requiredBlacksmithLevel: 2,
    descriptionCN: '打造一把精钢利剑',
  },
  {
    id: 'craft-iron-spear',
    nameCN: '铁枪',
    baseItemId: 'iron-spear',
    cost: 180,
    materials: [{ itemId: 'steel-ingot', quantity: 4 }],
    requiredLevel: 4,
    requiredBlacksmithLevel: 2,
    descriptionCN: '打造一把沉重的铁枪',
  },
  {
    id: 'craft-iron-armor',
    nameCN: '铁甲',
    baseItemId: 'iron-armor',
    cost: 180,
    materials: [{ itemId: 'steel-ingot', quantity: 4 }],
    requiredLevel: 3,
    requiredBlacksmithLevel: 2,
    descriptionCN: '打造一套厚重的铁甲',
  },
  {
    id: 'craft-steel-armor',
    nameCN: '钢甲',
    baseItemId: 'steel-armor',
    cost: 250,
    materials: [{ itemId: 'steel-ingot', quantity: 6 }],
    requiredLevel: 5,
    requiredBlacksmithLevel: 3,
    descriptionCN: '打造一套精钢铠甲',
  },
  {
    id: 'craft-silver-necklace',
    nameCN: '银项链',
    baseItemId: 'silver-necklace',
    cost: 200,
    materials: [
      { itemId: 'silver-ore', quantity: 3 },
      { itemId: 'jade-stone', quantity: 1 },
    ],
    requiredLevel: 5,
    requiredBlacksmithLevel: 2,
    descriptionCN: '打造一条精美的银项链',
  },
  {
    id: 'craft-jade-blade',
    nameCN: '玉剑',
    baseItemId: 'jade-blade',
    cost: 500,
    materials: [
      { itemId: 'steel-ingot', quantity: 5 },
      { itemId: 'jade-stone', quantity: 3 },
    ],
    requiredLevel: 8,
    requiredBlacksmithLevel: 4,
    descriptionCN: '打造一把镶嵌玉石的宝剑',
  },
  {
    id: 'craft-flame-blade',
    nameCN: '烈焰刀',
    baseItemId: 'flame-blade',
    cost: 600,
    materials: [
      { itemId: 'steel-ingot', quantity: 8 },
      { itemId: 'spirit-essence', quantity: 2 },
    ],
    requiredLevel: 10,
    requiredBlacksmithLevel: 4,
    descriptionCN: '打造一把蕴含火焰之力的宝刀',
  },
  {
    id: 'craft-chain-mail',
    nameCN: '锁子甲',
    baseItemId: 'chain-mail',
    cost: 600,
    materials: [
      { itemId: 'steel-ingot', quantity: 10 },
      { itemId: 'wolf-skin', quantity: 5 },
    ],
    requiredLevel: 8,
    requiredBlacksmithLevel: 4,
    descriptionCN: '打造一套轻便且防护良好的锁子甲',
  },
  {
    id: 'craft-jade-armor',
    nameCN: '玉甲',
    baseItemId: 'jade-armor',
    cost: 700,
    materials: [
      { itemId: 'steel-ingot', quantity: 6 },
      { itemId: 'jade-stone', quantity: 5 },
      { itemId: 'spirit-essence', quantity: 1 },
    ],
    requiredLevel: 10,
    requiredBlacksmithLevel: 5,
    descriptionCN: '打造一套镶嵌玉石的宝甲',
  },
  {
    id: 'craft-amulet-of-power',
    nameCN: '力量护符',
    baseItemId: 'amulet-of-power',
    cost: 500,
    materials: [
      { itemId: 'silver-ore', quantity: 5 },
      { itemId: 'jade-stone', quantity: 2 },
      { itemId: 'spirit-essence', quantity: 1 },
    ],
    requiredLevel: 8,
    requiredBlacksmithLevel: 4,
    descriptionCN: '打造一个蕴含力量的护符',
  },
  {
    id: 'craft-swift-boots',
    nameCN: '疾风靴',
    baseItemId: 'swift-boots',
    cost: 550,
    materials: [
      { itemId: 'wolf-skin', quantity: 8 },
      { itemId: 'silver-ore', quantity: 3 },
      { itemId: 'spirit-essence', quantity: 1 },
    ],
    requiredLevel: 10,
    requiredBlacksmithLevel: 4,
    descriptionCN: '打造一双能提升轻功的疾风靴',
  },
];

export function getCraftRecipe(recipeId: string): CraftRecipe | undefined {
  return CRAFT_RECIPES.find(r => r.id === recipeId);
}

export function getCraftRecipesByLevel(playerLevel: number, blacksmithLevel: number = 1): CraftRecipe[] {
  return CRAFT_RECIPES.filter(r => 
    r.requiredLevel <= playerLevel && r.requiredBlacksmithLevel <= blacksmithLevel
  );
}
