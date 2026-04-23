// ============================================
// Wuxia RPG - Combat Calculation Utilities
// ============================================

import type { Attributes, CombatStats, Enemy } from '../types';

/**
 * Calculate combat stats from attributes and level
 */
export function calculateCombatStats(attributes: Attributes, level: number): CombatStats {
  const { constitution, strength, physique, agility, insight, luck } = attributes;

  const maxHP = 100 + (constitution - 1) * 20 + level * 5;
  const attack = 10 + (strength - 1) * 5 + level * 2;
  const defense = 5 + (physique - 1) * 3 + level * 1;
  const speed = 10 + (agility - 1) * 2 + level * 1;
  const maxEnergy = 50 + level * 10 + insight * 5;
  const critChance = Math.max(0, luck) * 0.5;

  return {
    maxHP,
    currentHP: maxHP,
    maxEnergy,
    currentEnergy: maxEnergy,
    attack,
    defense,
    speed,
    critChance,
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
 */
export function scaleEnemyAttributes(enemy: Enemy, playerLevel: number): Enemy {
  const levelFactor = 1 + (playerLevel - 1) * 0.1;
  const zoneFactor = 1 + (enemy.zone - 1) * 0.15;

  const scale = (value: number): number => Math.floor(value * levelFactor * zoneFactor);

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
