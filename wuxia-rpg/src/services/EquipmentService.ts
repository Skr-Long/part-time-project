// ============================================
// Wuxia RPG - Equipment Service
// 统一处理装备管理、效果计算和装备槽位
// ============================================

import type { 
  EquipmentItem, 
  EquipmentSlots, 
  InventoryItem,
  ItemEffects,
  AttributeModifier
} from '../types';
import { attributeService } from './AttributeService';

export type EquipmentSlotType = keyof EquipmentSlots;

export interface EquipResult {
  success: boolean;
  message: string;
  newEquipment?: EquipmentSlots;
  newInventory?: InventoryItem[];
  unequippedItem?: EquipmentItem;
}

export interface UnequipResult {
  success: boolean;
  message: string;
  newEquipment?: EquipmentSlots;
  newInventory?: InventoryItem[];
  unequippedItem?: EquipmentItem;
}

export interface EquipmentBonus {
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
  maxHPBonus: number;
  attributeBonuses: Partial<Record<keyof import('../types').Attributes, number>>;
}

export class EquipmentService {
  private static instance: EquipmentService;

  private readonly slotTypes: EquipmentSlotType[] = ['weapon', 'armor', 'accessory'];

  private constructor() {}

  static getInstance(): EquipmentService {
    if (!EquipmentService.instance) {
      EquipmentService.instance = new EquipmentService();
    }
    return EquipmentService.instance;
  }

  getSlotTypes(): EquipmentSlotType[] {
    return [...this.slotTypes];
  }

  getSlotForItemType(itemType: string): EquipmentSlotType | null {
    switch (itemType) {
      case 'weapon':
        return 'weapon';
      case 'armor':
        return 'armor';
      case 'accessory':
        return 'accessory';
      default:
        return null;
    }
  }

  isEquippable(item: InventoryItem): item is EquipmentItem {
    return ['weapon', 'armor', 'accessory'].includes(item.type);
  }

  canEquip(
    item: EquipmentItem,
    playerLevel: number,
    playerProfession?: string
  ): { canEquip: boolean; reason?: string } {
    if (item.requiredLevel && playerLevel < item.requiredLevel) {
      return { 
        canEquip: false, 
        reason: `需要等级 ${item.requiredLevel} 才能装备 ${item.nameCN}` 
      };
    }

    if (item.requiredProfession && playerProfession !== item.requiredProfession) {
      return { 
        canEquip: false, 
        reason: `需要 ${item.requiredProfession} 职业才能装备 ${item.nameCN}` 
      };
    }

    return { canEquip: true };
  }

  equipItem(
    itemId: string,
    inventory: InventoryItem[],
    equipment: EquipmentSlots,
    playerLevel: number = 1,
    playerProfession?: string
  ): EquipResult {
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
      return { 
        success: false, 
        message: '物品不在背包中' 
      };
    }

    const item = inventory[itemIndex];
    
    if (!this.isEquippable(item)) {
      return { 
        success: false, 
        message: `${item.nameCN} 不可装备` 
      };
    }

    const equipCheck = this.canEquip(item, playerLevel, playerProfession);
    if (!equipCheck.canEquip) {
      return { 
        success: false, 
        message: equipCheck.reason || '无法装备此物品' 
      };
    }

    const slot = this.getSlotForItemType(item.type);
    if (!slot) {
      return { 
        success: false, 
        message: '无效的装备类型' 
      };
    }

    const newInventory = [...inventory];
    const newEquipment = { ...equipment };
    let unequippedItem: EquipmentItem | undefined;

    if (newEquipment[slot]) {
      unequippedItem = newEquipment[slot]!;
      newInventory.push(unequippedItem);
    }

    newInventory.splice(itemIndex, 1);
    newEquipment[slot] = item;

    return {
      success: true,
      message: `成功装备 ${item.nameCN}`,
      newEquipment,
      newInventory,
      unequippedItem,
    };
  }

  unequipItem(
    slot: EquipmentSlotType,
    equipment: EquipmentSlots,
    inventory: InventoryItem[]
  ): UnequipResult {
    const item = equipment[slot];
    
    if (!item) {
      return { 
        success: false, 
        message: '该槽位没有装备' 
      };
    }

    const newEquipment = { ...equipment, [slot]: null };
    const newInventory = [...inventory, item];

    return {
      success: true,
      message: `成功卸下 ${item.nameCN}`,
      newEquipment,
      newInventory,
      unequippedItem: item,
    };
  }

  getEquippedItem(equipment: EquipmentSlots, slot: EquipmentSlotType): EquipmentItem | null {
    return equipment[slot];
  }

  getAllEquippedItems(equipment: EquipmentSlots): Array<{ slot: EquipmentSlotType; item: EquipmentItem }> {
    const items: Array<{ slot: EquipmentSlotType; item: EquipmentItem }> = [];
    
    for (const slot of this.slotTypes) {
      const item = equipment[slot];
      if (item) {
        items.push({ slot, item });
      }
    }
    
    return items;
  }

  calculateTotalBonus(equipment: EquipmentSlots): EquipmentBonus {
    const bonus: EquipmentBonus = {
      attackBonus: 0,
      defenseBonus: 0,
      speedBonus: 0,
      maxHPBonus: 0,
      attributeBonuses: {},
    };

    const equippedItems = this.getAllEquippedItems(equipment);
    
    for (const { item } of equippedItems) {
      this.applyItemEffectsToBonus(item.effects, bonus);
      
      if ('equipEffects' in item) {
        this.applyItemEffectsToBonus(item.equipEffects, bonus);
      }
    }

    return bonus;
  }

  private applyItemEffectsToBonus(effects: ItemEffects, bonus: EquipmentBonus): void {
    if (effects.attackBonus) {
      bonus.attackBonus += effects.attackBonus;
    }
    if (effects.defenseBonus) {
      bonus.defenseBonus += effects.defenseBonus;
    }
    if (effects.speedBonus) {
      bonus.speedBonus += effects.speedBonus;
    }
    if (effects.maxHPBonus) {
      bonus.maxHPBonus += effects.maxHPBonus;
    }
    if (effects.attributeBonus) {
      for (const [attr, value] of Object.entries(effects.attributeBonus)) {
        if (value !== undefined) {
          bonus.attributeBonuses[attr as keyof import('../types').Attributes] = 
            (bonus.attributeBonuses[attr as keyof import('../types').Attributes] || 0) + value;
        }
      }
    }
  }

  createModifiersFromEquipment(equipment: EquipmentSlots): AttributeModifier[] {
    const modifiers: AttributeModifier[] = [];
    const bonus = this.calculateTotalBonus(equipment);

    if (bonus.attackBonus !== 0) {
      modifiers.push(attributeService.createModifier({
        source: 'equipment',
        type: 'add',
        combatStat: 'attack',
        value: bonus.attackBonus,
        stackable: false,
      }));
    }

    if (bonus.defenseBonus !== 0) {
      modifiers.push(attributeService.createModifier({
        source: 'equipment',
        type: 'add',
        combatStat: 'defense',
        value: bonus.defenseBonus,
        stackable: false,
      }));
    }

    if (bonus.speedBonus !== 0) {
      modifiers.push(attributeService.createModifier({
        source: 'equipment',
        type: 'add',
        combatStat: 'speed',
        value: bonus.speedBonus,
        stackable: false,
      }));
    }

    if (bonus.maxHPBonus !== 0) {
      modifiers.push(attributeService.createModifier({
        source: 'equipment',
        type: 'add',
        combatStat: 'maxHP',
        value: bonus.maxHPBonus,
        stackable: false,
      }));
    }

    for (const [attr, value] of Object.entries(bonus.attributeBonuses)) {
      if (value !== undefined && value !== 0) {
        modifiers.push(attributeService.createModifier({
          source: 'equipment',
          type: 'add',
          attribute: attr as keyof import('../types').Attributes,
          value,
          stackable: false,
        }));
      }
    }

    return modifiers;
  }

  getSlotLabelCN(slot: EquipmentSlotType): string {
    switch (slot) {
      case 'weapon':
        return '武器';
      case 'armor':
        return '防具';
      case 'accessory':
        return '饰品';
      default:
        return slot;
    }
  }

  getSlotIcon(slot: EquipmentSlotType): string {
    switch (slot) {
      case 'weapon':
        return '⚔️';
      case 'armor':
        return '🛡️';
      case 'accessory':
        return '💍';
      default:
        return '📦';
    }
  }

  getEquipmentDisplay(equipment: EquipmentSlots): Array<{
    slot: EquipmentSlotType;
    slotLabel: string;
    slotIcon: string;
    item: EquipmentItem | null;
    bonusText: string;
  }> {
    return this.slotTypes.map(slot => {
      const item = equipment[slot];
      let bonusText = '';
      
      if (item) {
        const bonuses: string[] = [];
        if (item.effects.attackBonus) bonuses.push(`攻击+${item.effects.attackBonus}`);
        if (item.effects.defenseBonus) bonuses.push(`防御+${item.effects.defenseBonus}`);
        if (item.effects.speedBonus) bonuses.push(`速度+${item.effects.speedBonus}`);
        if (item.effects.maxHPBonus) bonuses.push(`气血+${item.effects.maxHPBonus}`);
        bonusText = bonuses.join('，');
      }

      return {
        slot,
        slotLabel: this.getSlotLabelCN(slot),
        slotIcon: this.getSlotIcon(slot),
        item,
        bonusText,
      };
    });
  }
}

export const equipmentService = EquipmentService.getInstance();
