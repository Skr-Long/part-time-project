// ============================================
// Wuxia RPG - Combat Calculation Utilities
// ============================================

import type { Attributes, CombatStats, Enemy } from '../types';
import { calculateCombatStats as calculateCombatStatsFromAttributes } from './attributes';

/**
 * Calculate combat stats from attributes and level
 * @deprecated Use calculateCombatStats from src/utils/attributes.ts instead
 */
export function calculateCombatStats(attributes: Attributes, level: number): CombatStats {
  return calculateCombatStatsFromAttributes(attributes, level);
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
