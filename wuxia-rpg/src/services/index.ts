// ============================================
// Wuxia RPG - Services Index
// 统一导出所有服务层模块
// ============================================

import type { PlayerState } from '../types';
import type { CombatParticipant } from './CombatService';
import { combatService } from './CombatService';

export { AttributeService, attributeService } from './AttributeService';
export type { 
  AttributeModifier, 
  CalculationContext, 
  EffectiveStats 
} from './AttributeService';

export { CombatService, combatService } from './CombatService';
export type { 
  CombatParticipant, 
  CombatSkill, 
  DamageResult, 
  CombatActionResult,
  CombatState
} from './CombatService';

export { EquipmentService, equipmentService } from './EquipmentService';
export type { 
  EquipmentSlotType, 
  EquipResult, 
  UnequipResult, 
  EquipmentBonus 
} from './EquipmentService';

export { SkillService, skillService } from './SkillService';
export type { 
  SkillLearningContext, 
  LearningResult, 
  SkillLevelUpResult,
  PassiveBonuses
} from './SkillService';

export function combatParticipantFromState(player: PlayerState): CombatParticipant {
  return combatService.createPlayerParticipant(
    player.attributes,
    player.level,
    player.equipment,
    player.knownTechniques,
    player.techniqueLevels,
    player.combatStats.currentHP,
    player.combatStats.currentEnergy
  );
}
