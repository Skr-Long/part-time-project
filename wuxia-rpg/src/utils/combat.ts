// ============================================
// Wuxia RPG - Combat Calculation Utilities
// ============================================

import type { Attributes, CombatStats, Enemy } from '../types';
import { calculatePassiveBonuses } from '../data/martialArts';

/**
 * Calculate combat stats from attributes and level, including martial arts passive bonuses
 */
export function calculateCombatStats(
  attributes: Attributes,
  level: number,
  knownTechniques: string[] = []
): CombatStats {
  const bonuses = calculatePassiveBonuses(knownTechniques);

  const effectiveAttributes = { ...attributes };
  (Object.keys(bonuses.attributeBonuses) as Array<keyof Attributes>).forEach(attr => {
    effectiveAttributes[attr] = (effectiveAttributes[attr] || 0) + (bonuses.attributeBonuses[attr] || 0);
  });

  const { constitution, strength, physique, agility, insight, luck } = effectiveAttributes;

  let maxHP = 100 + constitution * 10 + level * 5;
  let attack = 10 + strength * 5 + level * 2;
  let defense = 5 + physique * 3 + level * 1;
  let speed = 10 + agility * 2 + level * 1;
  let maxEnergy = 50 + level * 10 + insight * 5;
  let critChance = Math.max(0, luck) * 0.5;

  if (bonuses.combatBonuses.maxHP) maxHP += bonuses.combatBonuses.maxHP;
  if (bonuses.combatBonuses.attack) attack += bonuses.combatBonuses.attack;
  if (bonuses.combatBonuses.defense) defense += bonuses.combatBonuses.defense;
  if (bonuses.combatBonuses.speed) speed += bonuses.combatBonuses.speed;
  if (bonuses.combatBonuses.maxEnergy) maxEnergy += bonuses.combatBonuses.maxEnergy;
  if (bonuses.combatBonuses.critChance) critChance += bonuses.combatBonuses.critChance;

  return {
    maxHP,
    currentHP: maxHP,
    maxEnergy,
    currentEnergy: maxEnergy,
    attack,
    defense,
    speed,
    critChance: Math.min(100, critChance),
  };
}

/**
 * Calculate damage with defense reduction and critical hits
 */
export function calculateDamage(
  attacker: CombatStats,
  defender: CombatStats,
  baseDamage: number
): { damage: number; isCritical: boolean } {
  // Base damage with defense reduction
  const defenseReduction = defender.defense / (defender.defense + 100);
  let damage = baseDamage * (1 - defenseReduction);

  // Random ±10%浮动
  const floatFactor = 0.9 + Math.random() * 0.2;
  damage *= floatFactor;

  // Check for critical hit
  const isCritical = Math.random() * 100 < attacker.critChance;
  if (isCritical) {
    damage *= 2;
  }

  return {
    damage: Math.floor(damage),
    isCritical,
  };
}

/**
 * Calculate experience required for next level
 */
export function calculateExpToNextLevel(level: number): number {
  return 100 * level * level;
}

/**
 * Scale enemy attributes based on player level and zone
 * 
 * 优化缩放机制：
 * - 敌人有基础等级范围，让玩家能够感受到成长
 * - 当玩家等级高于敌人基础等级时，敌人属性增长放缓
 * - 当玩家等级低于敌人基础等级时，敌人有轻微的等级惩罚
 */
export function scaleEnemyAttributes(enemy: Enemy, playerLevel: number): Enemy {
  const enemyBaseLevel = enemy.level;
  const levelDiff = playerLevel - enemyBaseLevel;

  let levelFactor: number;
  if (levelDiff >= 0) {
    levelFactor = 1 + levelDiff * 0.03;
  } else {
    levelFactor = Math.max(0.7, 1 + levelDiff * 0.05);
  }

  const zoneFactor = 1 + (enemy.zone - 1) * 0.1;

  const scale = (value: number): number => Math.max(1, Math.floor(value * levelFactor * zoneFactor));

  return {
    ...enemy,
    attributes: {
      constitution: scale(enemy.attributes.constitution),
      strength: scale(enemy.attributes.strength),
      physique: scale(enemy.attributes.physique),
      agility: scale(enemy.attributes.agility),
      insight: scale(enemy.attributes.insight),
      luck: scale(enemy.attributes.luck),
    },
    maxEnergy: scale(enemy.maxEnergy),
  };
}

/**
 * Use internal energy for martial arts
 */
export function useInternalEnergy(
  current: number,
  cost: number
): { newEnergy: number; success: boolean } {
  if (current < cost) {
    return { newEnergy: current, success: false };
  }
  return { newEnergy: current - cost, success: true };
}

/**
 * Regenerate energy with cap at max
 */
export function regenerateEnergy(current: number, max: number, amount: number): number {
  return Math.min(current + amount, max);
}

/**
 * Update speed bar, cap at 100
 */
export function updateSpeedBar(current: number, speed: number): number {
  return Math.min(current + speed / 10, 100);
}