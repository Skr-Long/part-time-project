// ============================================
// Wuxia RPG - Combat Service
// 统一处理战斗逻辑、伤害计算、速度管理和战斗状态
// ============================================

import type { 
  Attributes, 
  CombatStats, 
  CombatStatsType, 
  Enemy, 
  CombatLogEntry, 
  CombatRewards,
  EquipmentSlots,
  AttributeModifier
} from '../types';
import { attributeService } from './AttributeService';
import { getMartialArt, calculatePassiveBonuses } from '../data/martialArts';

export interface CombatParticipant {
  id: string;
  name: string;
  attributes: Attributes;
  combatStats: CombatStats;
  equipment?: EquipmentSlots;
  knownTechniques?: string[];
  techniqueLevels?: Array<{ techniqueId: string; level: number; exp: number; expToNext: number }>;
  modifiers: AttributeModifier[];
  speedBar: number;
  isDefending: boolean;
}

export interface CombatSkill {
  id: string;
  name: string;
  icon: string;
  speedCost: number;
  effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'defense';
  value: number;
  description: string;
  type: 'internal' | 'external' | 'weapon' | 'special';
  scalingAttribute?: keyof Attributes;
  scalingPercent?: number;
  duration?: number;
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isBlocked: boolean;
  blockedAmount: number;
}

export interface CombatActionResult {
  success: boolean;
  logEntry?: CombatLogEntry;
  targetHPChange: number;
  selfHPChange?: number;
  newModifiers?: AttributeModifier[];
}

export interface CombatState {
  isActive: boolean;
  player: CombatParticipant;
  enemy: CombatParticipant;
  turn: number;
  combatLog: CombatLogEntry[];
  isPlayerTurn: boolean;
  rewards: CombatRewards | null;
  isVictory: boolean | null;
}

export class CombatService {
  private static instance: CombatService;

  private constructor() {}

  static getInstance(): CombatService {
    if (!CombatService.instance) {
      CombatService.instance = new CombatService();
    }
    return CombatService.instance;
  }

  computeEnemyCombatStats(enemy: Enemy): CombatStatsType {
    const { attributes, level } = enemy;
    return {
      maxHP: 100 + attributes.constitution * 10 + level * 5,
      attack: 10 + attributes.strength * 5 + level * 2,
      defense: 5 + attributes.physique * 3 + level * 1,
      speed: 10 + attributes.agility * 2 + level * 1,
      maxEnergy: 50 + level * 10 + attributes.insight * 5,
      critChance: Math.max(0, attributes.luck) * 0.5,
    };
  }

  createEnemyParticipant(enemy: Enemy, playerLevel: number): CombatParticipant {
    const scaledEnemy = this.scaleEnemyAttributes(enemy, playerLevel);
    const stats = this.computeEnemyCombatStats(scaledEnemy);
    
    return {
      id: enemy.id,
      name: enemy.nameCN,
      attributes: scaledEnemy.attributes,
      combatStats: {
        ...stats,
        currentHP: stats.maxHP,
        currentEnergy: stats.maxEnergy,
      },
      modifiers: [],
      speedBar: 0,
      isDefending: false,
    };
  }

  createPlayerParticipant(
    attributes: Attributes,
    level: number,
    equipment: EquipmentSlots,
    knownTechniques: string[],
    techniqueLevels: Array<{ techniqueId: string; level: number; exp: number; expToNext: number }>,
    currentHP: number,
    currentEnergy: number
  ): CombatParticipant {
    const bonuses = calculatePassiveBonuses(knownTechniques);
    
    const effectiveAttributes = { ...attributes };
    (Object.keys(bonuses.attributeBonuses) as Array<keyof Attributes>).forEach(attr => {
      effectiveAttributes[attr] = (effectiveAttributes[attr] || 0) + (bonuses.attributeBonuses[attr] || 0);
    });

    const baseStats = attributeService.calculateBaseCombatStats(effectiveAttributes, level);
    
    let maxHP = baseStats.maxHP + (bonuses.combatBonuses.maxHP || 0);
    let attack = baseStats.attack + (bonuses.combatBonuses.attack || 0);
    let defense = baseStats.defense + (bonuses.combatBonuses.defense || 0);
    let speed = baseStats.speed + (bonuses.combatBonuses.speed || 0);
    let maxEnergy = baseStats.maxEnergy + (bonuses.combatBonuses.maxEnergy || 0);
    let critChance = baseStats.critChance + (bonuses.combatBonuses.critChance || 0);

    if (equipment.weapon?.effects.attackBonus) {
      attack += equipment.weapon.effects.attackBonus;
    }
    if (equipment.armor?.effects.defenseBonus) {
      defense += equipment.armor.effects.defenseBonus;
    }
    if (equipment.armor?.effects.speedBonus) {
      speed += equipment.armor.effects.speedBonus;
    }
    if (equipment.armor?.effects.maxHPBonus) {
      maxHP += equipment.armor.effects.maxHPBonus;
    }

    return {
      id: 'player',
      name: '玩家',
      attributes: effectiveAttributes,
      combatStats: {
        maxHP,
        currentHP: Math.min(currentHP, maxHP),
        maxEnergy,
        currentEnergy: Math.min(currentEnergy, maxEnergy),
        attack,
        defense,
        speed,
        critChance: Math.min(100, critChance),
      },
      equipment,
      knownTechniques,
      techniqueLevels,
      modifiers: [],
      speedBar: 0,
      isDefending: false,
    };
  }

  scaleEnemyAttributes(enemy: Enemy, playerLevel: number): Enemy {
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

  calculateDamage(
    attacker: CombatStats,
    defender: CombatStats,
    baseDamage: number,
    defenderIsDefending: boolean = false
  ): DamageResult {
    let finalDefense = defender.defense;
    let blockedAmount = 0;

    if (defenderIsDefending) {
      const defenseBonus = Math.floor(defender.defense * 0.5);
      finalDefense = Math.floor(defender.defense * 1.5);
      blockedAmount = defenseBonus;
    }

    const defenseReduction = finalDefense / (finalDefense + 100);
    let damage = baseDamage * (1 - defenseReduction);

    const floatFactor = 0.9 + Math.random() * 0.2;
    damage *= floatFactor;

    const isCritical = Math.random() * 100 < attacker.critChance;
    if (isCritical) {
      damage *= 2;
    }

    return {
      damage: Math.floor(damage),
      isCritical,
      isBlocked: defenderIsDefending,
      blockedAmount,
    };
  }

  getAvailableSkills(participant: CombatParticipant): CombatSkill[] {
    const skills: CombatSkill[] = [];
    
    if (!participant.knownTechniques || !participant.techniqueLevels) {
      return skills;
    }

    participant.knownTechniques.forEach(techId => {
      const tech = getMartialArt(techId);
      if (!tech) return;
      
      const techLevel = participant.techniqueLevels?.find(t => t.techniqueId === techId);
      const levelBonus = techLevel ? (techLevel.level - 1) * 2 : 0;
      
      tech.effects.forEach(effect => {
        if (['damage', 'heal', 'buff', 'debuff', 'defense'].includes(effect.type)) {
          const baseValue = effect.value + (
            effect.scalingAttribute 
              ? Math.floor((participant.attributes[effect.scalingAttribute] - 5) * (effect.scalingPercent || 0) / 10) 
              : 0
          );
          
          skills.push({
            id: `${tech.id}-${effect.type}`,
            name: tech.nameCN,
            icon: tech.type === 'internal' ? '🧘' : tech.type === 'external' ? '👊' : tech.type === 'weapon' ? '⚔️' : '✨',
            speedCost: 30 + (tech.level * 5),
            effectType: effect.type as 'damage' | 'heal' | 'buff' | 'debuff' | 'defense',
            value: baseValue + levelBonus,
            description: tech.lore,
            type: tech.type,
            scalingAttribute: effect.scalingAttribute,
            scalingPercent: effect.scalingPercent,
            duration: effect.duration,
          });
        }
      });
    });
    
    return skills;
  }

  executePlayerAttack(
    player: CombatParticipant,
    enemy: CombatParticipant
  ): CombatActionResult {
    const baseDamage = player.combatStats.attack;
    
    const damageResult = this.calculateDamage(
      player.combatStats,
      enemy.combatStats,
      baseDamage,
      enemy.isDefending
    );

    let actionText = `⚔️ 你身形一闪！发动攻击！造成 ${damageResult.damage} 点伤害`;
    if (damageResult.isCritical) {
      actionText += ' 💥 暴击! 致命一击!';
    }
    if (damageResult.isBlocked) {
      actionText += ` (减免 ${damageResult.blockedAmount} 点)`;
    }
    actionText += '！💪';

    const logEntry: CombatLogEntry = {
      timestamp: Date.now(),
      type: 'damage',
      source: 'player',
      value: damageResult.damage,
      text: actionText,
      color: 'text-jade',
    };

    return {
      success: true,
      logEntry,
      targetHPChange: -damageResult.damage,
    };
  }

  executePlayerSkill(
    player: CombatParticipant,
    enemy: CombatParticipant,
    skill: CombatSkill
  ): CombatActionResult {
    if (skill.effectType === 'heal') {
      const healAmount = skill.value;
      const logEntry: CombatLogEntry = {
        timestamp: Date.now(),
        type: 'heal',
        source: 'player',
        value: healAmount,
        text: `${skill.icon} 你双手合十，气运丹田！施展「${skill.name}」！恢复 ${healAmount} 点气血！✨ 感觉好多了！`,
        color: 'text-jade',
      };

      return {
        success: true,
        logEntry,
        targetHPChange: 0,
        selfHPChange: healAmount,
      };
    }

    const baseDamage = skill.value + Math.floor(player.combatStats.attack * 0.5);
    
    const attackerStats: CombatStats = {
      ...player.combatStats,
      attack: baseDamage,
    };

    const damageResult = this.calculateDamage(
      attackerStats,
      enemy.combatStats,
      baseDamage,
      enemy.isDefending
    );

    let actionText = `${skill.icon} 你大喝一声！施展「${skill.name}」！造成 ${damageResult.damage} 点伤害`;
    if (damageResult.isCritical) {
      actionText += ' 💥 暴击! 石破天惊!';
    }
    if (damageResult.isBlocked) {
      actionText += ` (减免 ${damageResult.blockedAmount} 点)`;
    }
    actionText += '！💪';

    const logEntry: CombatLogEntry = {
      timestamp: Date.now(),
      type: 'damage',
      source: 'player',
      value: damageResult.damage,
      text: actionText,
      color: 'text-jade',
    };

    return {
      success: true,
      logEntry,
      targetHPChange: -damageResult.damage,
    };
  }

  executeEnemyAttack(
    enemy: CombatParticipant,
    player: CombatParticipant
  ): CombatActionResult {
    const baseDamage = enemy.combatStats.attack;
    
    const damageResult = this.calculateDamage(
      enemy.combatStats,
      player.combatStats,
      baseDamage,
      player.isDefending
    );

    let actionText = `👹 ${enemy.name} 张牙舞爪扑过来！对你造成 ${damageResult.damage} 点伤害！`;
    if (damageResult.isCritical) {
      actionText += ' 💥 暴击! 一击必杀!';
    }
    if (damageResult.isBlocked) {
      actionText += ` (防御姿态)`;
    }
    actionText += ' 😱';

    const logEntry: CombatLogEntry = {
      timestamp: Date.now(),
      type: 'damage',
      source: 'enemy',
      value: damageResult.damage,
      text: actionText,
      color: 'text-red-600',
    };

    return {
      success: true,
      logEntry,
      targetHPChange: -damageResult.damage,
    };
  }

  updateSpeedBar(
    participant: CombatParticipant,
    deltaTime: number,
    speedMultiplier: number = 1
  ): number {
    let speedRate = (participant.combatStats.speed / 100) * speedMultiplier;
    
    if (participant.isDefending) {
      speedRate *= 0.7;
    }

    const increment = speedRate * deltaTime;
    return Math.min(100, participant.speedBar + increment);
  }

  canAct(participant: CombatParticipant): boolean {
    return participant.speedBar >= 100;
  }

  canUseSkill(participant: CombatParticipant, skill: CombatSkill): boolean {
    return participant.speedBar >= skill.speedCost;
  }

  resetSpeedBar(participant: CombatParticipant): CombatParticipant {
    return {
      ...participant,
      speedBar: 0,
    };
  }

  toggleDefend(participant: CombatParticipant): { participant: CombatParticipant; logEntry: CombatLogEntry } {
    const newIsDefending = !participant.isDefending;
    
    const logEntry: CombatLogEntry = {
      timestamp: Date.now(),
      type: 'info',
      source: 'player',
      value: 0,
      text: newIsDefending 
        ? `🛡️ 你双掌护胸！进入防御姿态！(防御减免 ${Math.floor(participant.combatStats.defense * 0.5)} 点，速度槽积累减半) 💪`
        : '🛡️ 你收起盾牌！取消了防御姿态！😎',
      color: 'text-jade',
    };

    return {
      participant: {
        ...participant,
        isDefending: newIsDefending,
      },
      logEntry,
    };
  }

  attemptFlee(successRate: number = 0.6): { success: boolean; logEntry: CombatLogEntry } {
    const success = Math.random() < successRate;
    
    const logEntry: CombatLogEntry = {
      timestamp: Date.now(),
      type: 'info',
      source: 'player',
      value: 0,
      text: success 
        ? '🏃 你身形一晃！成功逃离了战斗！🎉 溜之大吉！'
        : '🏃 你转身想跑！但逃跑失败！敌人挡住了你的去路！😱 跑不掉了！',
      color: success ? 'text-jade' : 'text-red-600',
    };

    return { success, logEntry };
  }

  createCombatLogEntry(
    text: string,
    type: CombatLogEntry['type'] = 'info',
    source: CombatLogEntry['source'] = 'player',
    value: number = 0,
    color: string = 'text-ink-gray'
  ): CombatLogEntry {
    return {
      timestamp: Date.now(),
      type,
      source,
      value,
      text,
      color,
    };
  }

  isCombatOver(player: CombatParticipant, enemy: CombatParticipant): { isOver: boolean; isVictory: boolean | null } {
    const playerHP = player.combatStats.currentHP;
    const enemyHP = enemy.combatStats.currentHP;

    if (playerHP <= 0 && enemyHP <= 0) {
      return { isOver: true, isVictory: null };
    }
    if (enemyHP <= 0) {
      return { isOver: true, isVictory: true };
    }
    if (playerHP <= 0) {
      return { isOver: true, isVictory: false };
    }
    return { isOver: false, isVictory: null };
  }

  calculateExpToNextLevel(level: number): number {
    return 100 * level * level;
  }

  useInternalEnergy(current: number, cost: number): { newEnergy: number; success: boolean } {
    if (current < cost) {
      return { newEnergy: current, success: false };
    }
    return { newEnergy: current - cost, success: true };
  }

  regenerateEnergy(current: number, max: number, amount: number): number {
    return Math.min(current + amount, max);
  }
}

export const combatService = CombatService.getInstance();
