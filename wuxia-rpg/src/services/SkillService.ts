// ============================================
// Wuxia RPG - Skill Service
// 统一处理武学技能的学习、升级、效果计算
// ============================================

import type { 
  MartialArt, 
  Attributes, 
  CombatStats,
  AttributeModifier,
  TechniqueLevel
} from '../types';
import { MARTIAL_ARTS, getMartialArt, getAvailableMartialArts, getVisibleMartialArts } from '../data/martialArts';
import { attributeService } from './AttributeService';

export interface SkillLearningContext {
  playerInsight: number;
  playerPhysique: number;
  knownTechniqueIds: string[];
  completedEvents: string[];
  playerGold: number;
  playerLevel: number;
}

export interface LearningResult {
  success: boolean;
  message: string;
  newTechnique?: MartialArt;
  expCost?: number;
  goldCost?: number;
}

export interface SkillLevelUpResult {
  success: boolean;
  message: string;
  newLevel: number;
  newExp: number;
  newExpToNext: number;
  bonusEffects?: {
    attributeBonuses: Partial<Record<keyof Attributes, number>>;
    combatBonuses: Partial<Record<keyof Omit<CombatStats, 'currentHP' | 'currentEnergy'>, number>>;
  };
}

export interface PassiveBonuses {
  attributeBonuses: Partial<Record<keyof Attributes, number>>;
  combatBonuses: Partial<Record<keyof Omit<CombatStats, 'currentHP' | 'currentEnergy'>, number>>;
  hpRegen: number;
  energyRegen: number;
}

export class SkillService {
  private static instance: SkillService;

  private constructor() {}

  static getInstance(): SkillService {
    if (!SkillService.instance) {
      SkillService.instance = new SkillService();
    }
    return SkillService.instance;
  }

  getAllMartialArts(): MartialArt[] {
    return [...MARTIAL_ARTS];
  }

  getMartialArtById(id: string): MartialArt | undefined {
    return getMartialArt(id);
  }

  getMartialArtsByType(type: MartialArt['type']): MartialArt[] {
    return MARTIAL_ARTS.filter(m => m.type === type);
  }

  getAvailableSkills(context: SkillLearningContext): MartialArt[] {
    return getAvailableMartialArts(
      context.playerInsight,
      context.knownTechniqueIds,
      context.completedEvents,
      context.playerGold
    );
  }

  getVisibleSkills(context: Omit<SkillLearningContext, 'playerGold' | 'playerLevel'>): MartialArt[] {
    return getVisibleMartialArts(
      context.playerInsight,
      context.knownTechniqueIds,
      context.completedEvents
    );
  }

  canLearnSkill(skillId: string, context: SkillLearningContext): { canLearn: boolean; reason?: string } {
    const skill = this.getMartialArtById(skillId);
    
    if (!skill) {
      return { canLearn: false, reason: '技能不存在' };
    }

    if (context.knownTechniqueIds.includes(skillId)) {
      return { canLearn: false, reason: '已掌握此技能' };
    }

    if (skill.insightRequired > context.playerInsight) {
      return { 
        canLearn: false, 
        reason: `悟性不足，需要 ${skill.insightRequired} 点悟性` 
      };
    }

    if (skill.prerequisiteSkills && !skill.prerequisiteSkills.every(pre => context.knownTechniqueIds.includes(pre))) {
      const missing = skill.prerequisiteSkills.filter(pre => !context.knownTechniqueIds.includes(pre));
      const missingNames = missing.map(id => this.getMartialArtById(id)?.nameCN || id).join('、');
      return { 
        canLearn: false, 
        reason: `需要先掌握：${missingNames}` 
      };
    }

    switch (skill.source.type) {
      case 'event':
        if (skill.source.eventId && !context.completedEvents.includes(skill.source.eventId)) {
          return { canLearn: false, reason: '未完成相关事件' };
        }
        break;
      case 'purchase':
        if (skill.source.price && context.playerGold < skill.source.price) {
          return { canLearn: false, reason: `金币不足，需要 ${skill.source.price} 金币` };
        }
        break;
      case 'insight':
        if (skill.source.minInsight && context.playerInsight < skill.source.minInsight) {
          return { canLearn: false, reason: `需要 ${skill.source.minInsight} 点悟性才能领悟` };
        }
        break;
    }

    return { canLearn: true };
  }

  calculateLearningChance(skill: MartialArt, playerInsight: number, playerPhysique: number): number {
    let baseChance = skill.learningChanceBase;
    
    const insightBonus = (playerInsight - 5) * 2;
    baseChance += insightBonus;
    
    const physiqueBonus = (playerPhysique - 5) * 1;
    baseChance += physiqueBonus;

    return Math.min(95, Math.max(5, baseChance));
  }

  attemptLearnSkill(skillId: string, context: SkillLearningContext): LearningResult {
    const canLearnResult = this.canLearnSkill(skillId, context);
    
    if (!canLearnResult.canLearn) {
      return {
        success: false,
        message: canLearnResult.reason || '无法学习此技能',
      };
    }

    const skill = this.getMartialArtById(skillId)!;
    const learningChance = this.calculateLearningChance(skill, context.playerInsight, context.playerPhysique);
    const roll = Math.random() * 100;

    if (roll > learningChance) {
      return {
        success: false,
        message: `学习失败！领悟几率: ${Math.floor(learningChance)}%`,
      };
    }

    let goldCost = 0;
    if (skill.source.type === 'purchase' && skill.source.price) {
      goldCost = skill.source.price;
    }

    return {
      success: true,
      message: `成功学会「${skill.nameCN}」！`,
      newTechnique: skill,
      goldCost,
    };
  }

  getSkillLevel(techniqueId: string, techniqueLevels: TechniqueLevel[]): TechniqueLevel | undefined {
    return techniqueLevels.find(tl => tl.techniqueId === techniqueId);
  }

  getSkillLevelDisplay(techniqueId: string, techniqueLevels: TechniqueLevel[]): { level: number; exp: number; expToNext: number; progressPercent: number } {
    const level = this.getSkillLevel(techniqueId, techniqueLevels);
    
    if (!level) {
      return { level: 1, exp: 0, expToNext: 100, progressPercent: 0 };
    }

    const progressPercent = Math.min(100, (level.exp / level.expToNext) * 100);
    return {
      level: level.level,
      exp: level.exp,
      expToNext: level.expToNext,
      progressPercent,
    };
  }

  addSkillExp(
    techniqueId: string,
    techniqueLevels: TechniqueLevel[],
    expAmount: number,
    skillProficiencyMultiplier: number = 1
  ): { newLevels: TechniqueLevel[]; leveledUp: boolean; newLevel?: number } {
    const actualExp = Math.floor(expAmount * skillProficiencyMultiplier);
    
    let leveledUp = false;
    let newLevel: number | undefined;

    const newLevels = techniqueLevels.map(tl => {
      if (tl.techniqueId !== techniqueId) return tl;

      let newExp = tl.exp + actualExp;
      let currentLevel = tl.level;
      let currentExpToNext = tl.expToNext;

      while (newExp >= currentExpToNext) {
        newExp -= currentExpToNext;
        currentLevel++;
        currentExpToNext = Math.floor(currentExpToNext * 1.5);
        leveledUp = true;
        newLevel = currentLevel;
      }

      return {
        ...tl,
        exp: newExp,
        level: currentLevel,
        expToNext: currentExpToNext,
      };
    });

    return { newLevels, leveledUp, newLevel };
  }

  calculatePassiveBonuses(knownTechniqueIds: string[]): PassiveBonuses {
    const attributeBonuses: Partial<Record<keyof Attributes, number>> = {};
    const combatBonuses: Partial<Record<keyof Omit<CombatStats, 'currentHP' | 'currentEnergy'>, number>> = {};
    let hpRegen = 0;
    let energyRegen = 0;

    knownTechniqueIds.forEach(techId => {
      const art = this.getMartialArtById(techId);
      if (!art) return;

      art.passiveEffects.forEach(effect => {
        switch (effect.type) {
          case 'attribute_bonus':
            if (effect.attribute) {
              attributeBonuses[effect.attribute] = (attributeBonuses[effect.attribute] || 0) + effect.value;
            }
            break;
          case 'combat_bonus':
            if (effect.combatStat) {
              combatBonuses[effect.combatStat] = (combatBonuses[effect.combatStat] || 0) + effect.value;
            }
            break;
          case 'hp_regen':
            hpRegen += effect.value;
            break;
          case 'energy_regen':
            energyRegen += effect.value;
            break;
        }
      });
    });

    return { attributeBonuses, combatBonuses, hpRegen, energyRegen };
  }

  createModifiersFromSkills(knownTechniqueIds: string[]): AttributeModifier[] {
    const modifiers: AttributeModifier[] = [];
    const bonuses = this.calculatePassiveBonuses(knownTechniqueIds);

    for (const [attr, value] of Object.entries(bonuses.attributeBonuses)) {
      if (value !== undefined && value !== 0) {
        modifiers.push(attributeService.createModifier({
          source: 'skill',
          type: 'add',
          attribute: attr as keyof Attributes,
          value,
          stackable: false,
        }));
      }
    }

    for (const [stat, value] of Object.entries(bonuses.combatBonuses)) {
      if (value !== undefined && value !== 0) {
        modifiers.push(attributeService.createModifier({
          source: 'skill',
          type: 'add',
          combatStat: stat as keyof Omit<CombatStats, 'currentHP' | 'currentEnergy'>,
          value,
          stackable: false,
        }));
      }
    }

    return modifiers;
  }

  getSkillTypeLabelCN(type: MartialArt['type']): string {
    switch (type) {
      case 'internal':
        return '内功';
      case 'external':
        return '外功';
      case 'weapon':
        return '兵器';
      case 'special':
        return '特殊';
      default:
        return type;
    }
  }

  getSkillTypeIcon(type: MartialArt['type']): string {
    switch (type) {
      case 'internal':
        return '🧘';
      case 'external':
        return '👊';
      case 'weapon':
        return '⚔️';
      case 'special':
        return '✨';
      default:
        return '📜';
    }
  }

  getSkillDisplay(skill: MartialArt, techniqueLevels?: TechniqueLevel[]): {
    name: string;
    type: string;
    typeIcon: string;
    level: number;
    insightRequired: number;
    learningChance: number;
    effects: string[];
    passiveEffects: string[];
    source: string;
    prerequisiteSkills: string[];
  } {
    const effects: string[] = [];
    const passiveEffects: string[] = [];

    skill.effects.forEach(effect => {
      let effectText = '';
      switch (effect.type) {
        case 'damage':
          effectText = `伤害 ${effect.value}`;
          break;
        case 'heal':
          effectText = `治疗 ${effect.value}`;
          break;
        case 'buff':
          effectText = `增益 ${effect.value}`;
          break;
        case 'debuff':
          effectText = `减益 ${effect.value}`;
          break;
        case 'defense':
          effectText = `防御 ${effect.value}`;
          break;
      }
      if (effect.scalingAttribute) {
        effectText += ` (${effect.scalingAttribute}加成)`;
      }
      if (effect.duration) {
        effectText += ` 持续${effect.duration}回合`;
      }
      effects.push(effectText);
    });

    skill.passiveEffects.forEach(effect => {
      passiveEffects.push(effect.description);
    });

    const prerequisiteSkills = skill.prerequisiteSkills?.map(
      id => this.getMartialArtById(id)?.nameCN || id
    ) || [];

    let currentLevel = 1;
    if (techniqueLevels) {
      const levelInfo = this.getSkillLevel(skill.id, techniqueLevels);
      if (levelInfo) {
        currentLevel = levelInfo.level;
      }
    }

    return {
      name: skill.nameCN,
      type: this.getSkillTypeLabelCN(skill.type),
      typeIcon: this.getSkillTypeIcon(skill.type),
      level: currentLevel,
      insightRequired: skill.insightRequired,
      learningChance: skill.learningChanceBase,
      effects,
      passiveEffects,
      source: skill.source.description,
      prerequisiteSkills,
    };
  }
}

export const skillService = SkillService.getInstance();
