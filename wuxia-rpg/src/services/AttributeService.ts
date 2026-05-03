// ============================================
// Wuxia RPG - Attribute Service
// 统一处理属性计算、修饰符管理和战斗属性派生
// ============================================

import type { Attributes, CombatStats, CombatStatsType } from '../types';
import { ATTRIBUTE_INFO, TOTAL_ATTRIBUTE_POINTS } from '../utils/attributes';

export interface AttributeModifier {
  id: string;
  source: string;
  type: 'add' | 'multiply' | 'override';
  attribute?: keyof Attributes;
  combatStat?: keyof CombatStatsType;
  value: number;
  duration?: number;
  stackable?: boolean;
}

export interface CalculationContext {
  level: number;
  baseAttributes: Attributes;
  modifiers: AttributeModifier[];
}

export interface EffectiveStats {
  attributes: Attributes;
  combatStats: CombatStatsType;
  appliedModifiers: AttributeModifier[];
}

export class AttributeService {
  private static instance: AttributeService;

  private constructor() {}

  static getInstance(): AttributeService {
    if (!AttributeService.instance) {
      AttributeService.instance = new AttributeService();
    }
    return AttributeService.instance;
  }

  getAttributeInfo(key: keyof Attributes) {
    return ATTRIBUTE_INFO.find(info => info.key === key);
  }

  getAttributeLabelCN(key: keyof Attributes): string {
    return this.getAttributeInfo(key)?.labelCN || key;
  }

  getTotalAttributePoints(): number {
    return TOTAL_ATTRIBUTE_POINTS;
  }

  isValidAttributeDistribution(attributes: Attributes): boolean {
    const totalUsed = Object.values(attributes).reduce((sum, val) => sum + val, 0);
    
    for (const key of Object.keys(attributes) as (keyof Attributes)[]) {
      const info = this.getAttributeInfo(key);
      if (!info) continue;
      if (attributes[key] < info.min || attributes[key] > info.max) {
        return false;
      }
    }
    
    return totalUsed === TOTAL_ATTRIBUTE_POINTS;
  }

  generateRandomAttributes(): Attributes {
    const attributes: Attributes = {
      insight: 1,
      constitution: 1,
      strength: 1,
      agility: 1,
      physique: 1,
      luck: 1,
    };

    const keys = Object.keys(attributes) as (keyof Attributes)[];
    
    let pointsToDistribute = TOTAL_ATTRIBUTE_POINTS - 6;

    for (const key of keys) {
      attributes[key] += 2;
      pointsToDistribute -= 2;
    }

    while (pointsToDistribute > 0) {
      const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
      
      for (const key of shuffledKeys) {
        if (pointsToDistribute <= 0) break;
        
        const info = this.getAttributeInfo(key);
        if (!info) continue;
        
        const maxAdd = Math.min(info.max - attributes[key], pointsToDistribute);
        if (maxAdd <= 0) continue;
        
        const addAmount = Math.min(Math.floor(Math.random() * 3) + 1, maxAdd);
        attributes[key] += addAmount;
        pointsToDistribute -= addAmount;
      }
    }

    return attributes;
  }

  getEffectiveInsight(attributes: Attributes): number {
    const { insight, physique } = attributes;
    return insight + physique * 0.5;
  }

  getSkillProficiencyMultiplier(attributes: Attributes): number {
    return 1 + attributes.physique * 0.1;
  }

  getSkillExpBonusMultiplier(attributes: Attributes): number {
    const effectiveInsight = this.getEffectiveInsight(attributes);
    return 1 + effectiveInsight / 10;
  }

  calculateBaseCombatStats(attributes: Attributes, level: number): CombatStatsType {
    const { constitution, strength, physique, agility, luck } = attributes;
    const effectiveInsight = this.getEffectiveInsight(attributes);

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

  calculateCombatStats(attributes: Attributes, level: number): CombatStats {
    const base = this.calculateBaseCombatStats(attributes, level);
    return {
      ...base,
      currentHP: base.maxHP,
      currentEnergy: base.maxEnergy,
    };
  }

  applyAttributeModifiers(
    baseAttributes: Attributes,
    modifiers: AttributeModifier[]
  ): Attributes {
    const result: Attributes = { ...baseAttributes };
    
    const addModifiers = modifiers.filter(m => m.type === 'add' && m.attribute);
    const multiplyModifiers = modifiers.filter(m => m.type === 'multiply' && m.attribute);
    const overrideModifiers = modifiers.filter(m => m.type === 'override' && m.attribute);

    for (const mod of overrideModifiers) {
      if (mod.attribute) {
        result[mod.attribute] = mod.value;
      }
    }

    for (const mod of multiplyModifiers) {
      if (mod.attribute) {
        result[mod.attribute] = Math.floor(result[mod.attribute] * mod.value);
      }
    }

    for (const mod of addModifiers) {
      if (mod.attribute) {
        result[mod.attribute] += mod.value;
      }
    }

    return result;
  }

  applyCombatStatModifiers(
    baseStats: CombatStatsType,
    modifiers: AttributeModifier[]
  ): CombatStatsType {
    const result: CombatStatsType = { ...baseStats };
    
    const addModifiers = modifiers.filter(m => m.type === 'add' && m.combatStat);
    const multiplyModifiers = modifiers.filter(m => m.type === 'multiply' && m.combatStat);
    const overrideModifiers = modifiers.filter(m => m.type === 'override' && m.combatStat);

    for (const mod of overrideModifiers) {
      if (mod.combatStat) {
        result[mod.combatStat] = mod.value;
      }
    }

    for (const mod of multiplyModifiers) {
      if (mod.combatStat) {
        result[mod.combatStat] = Math.floor(result[mod.combatStat] * mod.value);
      }
    }

    for (const mod of addModifiers) {
      if (mod.combatStat) {
        result[mod.combatStat] += mod.value;
      }
    }

    if (result.critChance !== undefined) {
      result.critChance = Math.min(100, Math.max(0, result.critChance));
    }

    return result;
  }

  calculateEffectiveStats(context: CalculationContext): EffectiveStats {
    const { level, baseAttributes, modifiers } = context;

    const effectiveAttributes = this.applyAttributeModifiers(baseAttributes, modifiers);
    const baseCombatStats = this.calculateBaseCombatStats(effectiveAttributes, level);
    const effectiveCombatStats = this.applyCombatStatModifiers(baseCombatStats, modifiers);

    return {
      attributes: effectiveAttributes,
      combatStats: effectiveCombatStats,
      appliedModifiers: modifiers,
    };
  }

  createModifier(options: Omit<AttributeModifier, 'id'> & { id?: string }): AttributeModifier {
    return {
      id: options.id || `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: options.source,
      type: options.type,
      attribute: options.attribute,
      combatStat: options.combatStat,
      value: options.value,
      duration: options.duration,
      stackable: options.stackable ?? false,
    };
  }

  mergeModifiers(modifiers: AttributeModifier[]): AttributeModifier[] {
    const nonStackable: Record<string, AttributeModifier> = {};
    const stackable: AttributeModifier[] = [];

    for (const mod of modifiers) {
      if (mod.stackable) {
        stackable.push(mod);
      } else {
        const key = `${mod.source}_${mod.attribute || mod.combatStat}_${mod.type}`;
        if (!nonStackable[key] || (mod.duration !== undefined && nonStackable[key].duration !== undefined && mod.duration > nonStackable[key].duration!)) {
          nonStackable[key] = mod;
        }
      }
    }

    return [...Object.values(nonStackable), ...stackable];
  }

  getCombatStatsDisplay(stats: CombatStatsType): { key: string; label: string; value: number; icon: string }[] {
    return [
      { key: 'maxHP', label: '生命值', value: stats.maxHP, icon: '❤️' },
      { key: 'maxEnergy', label: '内功值', value: stats.maxEnergy, icon: '💫' },
      { key: 'attack', label: '攻击力', value: stats.attack, icon: '⚔️' },
      { key: 'defense', label: '防御力', value: stats.defense, icon: '🛡️' },
      { key: 'speed', label: '速度', value: stats.speed, icon: '💨' },
      { key: 'critChance', label: '暴击率', value: stats.critChance, icon: '🎯' },
    ];
  }
}

export const attributeService = AttributeService.getInstance();
