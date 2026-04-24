import type { InventoryItem, EquipmentItem } from '../types';

export const ITEMS: Record<string, InventoryItem | EquipmentItem> = {
  'iron-sword': {
    id: 'iron-sword', name: 'Iron Sword', nameCN: '铁剑', type: 'weapon',
    quantity: 1, description: 'A basic iron sword', descriptionCN: '一把普通的铁剑',
    effects: {}, equipEffects: { attackBonus: 5 }, requiredLevel: 1, stackable: false
  } as EquipmentItem,
  'steel-sword': {
    id: 'steel-sword', name: 'Steel Sword', nameCN: '钢剑', type: 'weapon',
    quantity: 1, description: 'A sturdy steel sword', descriptionCN: '一把精钢剑',
    effects: {}, equipEffects: { attackBonus: 10 }, requiredLevel: 3, stackable: false
  } as EquipmentItem,
  'leather-armor': {
    id: 'leather-armor', name: 'Leather Armor', nameCN: '皮甲', type: 'armor',
    quantity: 1, description: 'Basic leather armor', descriptionCN: '基础的皮甲',
    effects: {}, equipEffects: { defenseBonus: 3 }, requiredLevel: 1, stackable: false
  } as EquipmentItem,
  'iron-armor': {
    id: 'iron-armor', name: 'Iron Armor', nameCN: '铁甲', type: 'armor',
    quantity: 1, description: 'Heavy iron armor', descriptionCN: '厚重的铁甲',
    effects: {}, equipEffects: { defenseBonus: 8 }, requiredLevel: 3, stackable: false
  } as EquipmentItem,
  'jade-ring': {
    id: 'jade-ring', name: 'Jade Ring', nameCN: '玉佩', type: 'accessory',
    quantity: 1, description: 'A jade ring with spiritual energy', descriptionCN: '蕴含灵气的玉佩',
    effects: {}, equipEffects: { speedBonus: 3, maxHPBonus: 20 }, requiredLevel: 2, stackable: false
  } as EquipmentItem,
  'health-potion': {
    id: 'health-potion', name: 'Health Potion', nameCN: '疗伤药', type: 'consumable',
    quantity: 1, description: 'Restores 30 HP', descriptionCN: '恢复30点气血',
    effects: { attackBonus: 30 }, stackable: true
  },
  'greater-health-potion': {
    id: 'greater-health-potion', name: 'Greater Health Potion', nameCN: '大疗伤药', type: 'consumable',
    quantity: 1, description: 'Restores 80 HP', descriptionCN: '恢复80点气血',
    effects: { attackBonus: 80 }, stackable: true
  },
  'wolf-skin': {
    id: 'wolf-skin', name: 'Wolf Skin', nameCN: '狼皮', type: 'material',
    quantity: 1, description: 'Wolf skin for crafting', descriptionCN: '可用于制皮的狼皮',
    effects: {}, stackable: true
  },
  'iron-ore': {
    id: 'iron-ore', name: 'Iron Ore', nameCN: '铁矿石', type: 'material',
    quantity: 1, description: 'Raw iron ore', descriptionCN: '未提炼的铁矿石',
    effects: {}, stackable: true
  },
};

export function getItem(itemId: string): InventoryItem | EquipmentItem | undefined {
  return ITEMS[itemId];
}
