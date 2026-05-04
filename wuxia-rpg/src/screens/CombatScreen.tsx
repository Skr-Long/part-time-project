import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameSelector, useGameDispatch } from '../hooks/useGame';
import { HPBar } from '../components/ui/HPBar';
import { getMartialArt } from '../data/martialArts';
import { combatService, combatParticipantFromState } from '../services';
import type { CombatLogEntry, CombatStats, GameAction } from '../types';

type MartialArtCategory = 'internal' | 'external' | 'weapon' | 'special';
type SkillCategory = MartialArtCategory | 'basic_actions';

interface CombatSkill {
  id: string;
  name: string;
  icon: string;
  speedCost: number;
  energyCost: number;
  effectType: 'damage' | 'heal' | 'defense' | 'flee';
  value: number;
  description: string;
  type: SkillCategory;
  isActive?: boolean;
}

const categoryLabels: Record<SkillCategory, { label: string; icon: string; color: string }> = {
  internal: { label: '内功', icon: '🧘', color: '#8b5cf6' },
  external: { label: '外功', icon: '👊', color: '#1e40af' },
  weapon: { label: '兵器', icon: '⚔️', color: '#dc2626' },
  special: { label: '特殊', icon: '✨', color: '#f59e0b' },
  basic_actions: { label: '基础', icon: '🎯', color: '#7a7a7a' },
};

export function CombatScreen() {
  const dispatch = useGameDispatch();
  const combat = useGameSelector(s => s.combat);
  const player = useGameSelector(s => s.player);
  const combatSpeedMultiplier = useGameSelector(s => s.meta.settings.combatSpeedMultiplier) ?? 1;

  const [playerSpeed, setPlayerSpeed] = useState(0);
  const [_enemySpeed, setEnemySpeed] = useState(0);
  const [isDefending, setIsDefending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('basic_actions');
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const logContainerRef = useRef<HTMLDivElement>(null);

  const enemyAttackingRef = useRef(false);
  const dispatchRef = useRef<React.Dispatch<GameAction>>(dispatch);
  const isInitializedRef = useRef(false);

  const { enemy, enemyCurrentHP, combatLog } = combat;

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const playerBaseStats = useMemo(() => {
    const participant = combatParticipantFromState(player);
    return {
      attack: participant.combatStats.attack,
      defense: participant.combatStats.defense,
      speed: participant.combatStats.speed,
      maxHP: participant.combatStats.maxHP,
      maxEnergy: participant.combatStats.maxEnergy,
      critChance: participant.combatStats.critChance,
    };
  }, [player]);

  const playerStateRef = useRef({
    baseStats: playerBaseStats,
    currentHP: player.combatStats.currentHP,
    currentEnergy: player.combatStats.currentEnergy,
    isDefending: isDefending,
    attributes: player.attributes,
  });

  useEffect(() => {
    playerStateRef.current = {
      baseStats: playerBaseStats,
      currentHP: player.combatStats.currentHP,
      currentEnergy: player.combatStats.currentEnergy,
      isDefending: isDefending,
      attributes: player.attributes,
    };
  }, [playerBaseStats, player.combatStats.currentHP, player.combatStats.currentEnergy, isDefending, player.attributes]);

  const enemyStateRef = useRef({
    enemy: enemy,
    enemyCurrentHP: enemyCurrentHP,
  });

  useEffect(() => {
    enemyStateRef.current = {
      enemy: enemy,
      enemyCurrentHP: enemyCurrentHP,
    };
  }, [enemy, enemyCurrentHP]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog]);

  const getTechniqueLevel = useCallback((techId: string) => {
    return player.techniqueLevels.find(t => t.techniqueId === techId);
  }, [player.techniqueLevels]);

  const getBasicSkills = useCallback((): CombatSkill[] => {
    const skills: CombatSkill[] = [
      {
        id: 'basic-attack',
        name: '普通攻击',
        icon: '⚔️',
        speedCost: 30,
        energyCost: 0,
        effectType: 'damage',
        value: 0,
        description: '基础攻击，不消耗内功',
        type: 'basic_actions',
      },
      {
        id: 'defend',
        name: isDefending ? '取消防御' : '防御姿态',
        icon: '🛡️',
        speedCost: 0,
        energyCost: 0,
        effectType: 'defense',
        value: 0,
        description: '进入/取消防御状态，防御时减免伤害但速度槽积累减半',
        type: 'basic_actions',
        isActive: isDefending,
      },
      {
        id: 'flee',
        name: '逃跑',
        icon: '🏃',
        speedCost: 50,
        energyCost: 0,
        effectType: 'flee',
        value: 0,
        description: '尝试逃离战斗，有一定概率失败',
        type: 'basic_actions',
      },
    ];
    return skills;
  }, [isDefending]);

  const getAvailableSkills = useCallback((): CombatSkill[] => {
    const skills: CombatSkill[] = [];
    player.knownTechniques.forEach(techId => {
      const tech = getMartialArt(techId);
      if (!tech) return;
      const techLevel = getTechniqueLevel(techId);
      const levelBonus = techLevel ? (techLevel.level - 1) * 2 : 0;
      
      const baseEnergyCost = tech.level * 3 + 5;
      
      tech.effects.forEach(effect => {
        if (effect.type === 'damage' || effect.type === 'heal') {
          const baseValue = effect.value + (effect.scalingAttribute ? Math.floor((player.attributes[effect.scalingAttribute] - 5) * (effect.scalingPercent || 0) / 10) : 0);
          skills.push({
            id: `${tech.id}-${effect.type}`,
            name: tech.nameCN,
            icon: tech.type === 'internal' ? '🧘' : tech.type === 'external' ? '👊' : tech.type === 'weapon' ? '⚔️' : '✨',
            speedCost: 30 + (tech.level * 5),
            energyCost: baseEnergyCost,
            effectType: effect.type as 'damage' | 'heal',
            value: baseValue + levelBonus,
            description: tech.lore,
            type: tech.type,
          });
        }
      });
    });
    return skills;
  }, [player.knownTechniques, player.attributes, getTechniqueLevel]);

  const resetPlayerSpeed = useCallback(() => {
    setPlayerSpeed(0);
  }, []);

  const executeEnemyAttackInternal = useCallback(() => {
    const { enemy: currentEnemy, enemyCurrentHP: currentEnemyHP } = enemyStateRef.current;
    const { baseStats, isDefending: currentIsDefending, currentHP, currentEnergy } = playerStateRef.current;
    const currentDispatch = dispatchRef.current;
    
    if (!currentEnemy) return;
    
    if (enemyAttackingRef.current) {
      return;
    }
    
    enemyAttackingRef.current = true;
    
    try {
      const enemyStats = combatService.computeEnemyCombatStats(currentEnemy);
      const enemyCombatStats: CombatStats = {
        ...enemyStats,
        currentHP: currentEnemyHP,
        currentEnergy: currentEnemy.maxEnergy,
      };

      let finalDefense = baseStats.defense;
      let defendMessage = '';
      
      if (currentIsDefending) {
        finalDefense = Math.floor(baseStats.defense * 1.5);
        defendMessage = ` (防御姿态)`;
      }

      const defenderStats: CombatStats = {
        maxHP: baseStats.maxHP,
        currentHP: currentHP,
        maxEnergy: baseStats.maxEnergy,
        currentEnergy: currentEnergy,
        attack: baseStats.attack,
        defense: finalDefense,
        speed: baseStats.speed,
        critChance: baseStats.critChance,
      };

      const damageResult = combatService.calculateDamage(
        enemyCombatStats,
        defenderStats,
        enemyStats.attack,
        currentIsDefending
      );
      
      const critMessage = damageResult.isCritical ? ' 💥 暴击! 一击必杀!' : '';
      
      currentDispatch({ 
        type: 'EXECUTE_COMBAT_ACTION', 
        payload: { 
          action: `👹 ${currentEnemy.nameCN} 张牙舞爪扑过来！对你造成 ${damageResult.damage} 点伤害！${critMessage}${defendMessage} 😱`, 
          damage: -damageResult.damage 
        } 
      });
    } finally {
      setTimeout(() => {
        enemyAttackingRef.current = false;
      }, 10);
    }
  }, []);

  const executePlayerAction = useCallback((action: { type: 'attack' | 'skill' | 'defend' | 'flee'; skill?: CombatSkill }) => {
    if (!enemy) return;

    if (action.type === 'defend') {
      if (isDefending) {
        dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: '🛡️ 你收起盾牌！取消了防御姿态！😎' } });
        setIsDefending(false);
      } else {
        setIsDefending(true);
        dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: `🛡️ 你双掌护胸！进入防御姿态！(防御减免 ${Math.floor(playerBaseStats.defense * 0.5)} 点，速度槽积累减半) 💪` } });
      }
      return;
    }

    if (action.type === 'flee') {
      const fleeResult = combatService.attemptFlee(0.6);
      dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: fleeResult.logEntry.text } });
      
      if (fleeResult.success) {
        setTimeout(() => {
          dispatch({ type: 'END_COMBAT', payload: { victory: false } });
        }, 500);
      } else {
        resetPlayerSpeed();
      }
      return;
    }

    const enemyStats = combatService.computeEnemyCombatStats(enemy);
    const enemyCombatStats: CombatStats = {
      ...enemyStats,
      currentHP: enemyCurrentHP,
      currentEnergy: enemy.maxEnergy,
    };

    if (action.type === 'skill' && action.skill && action.skill.effectType === 'heal') {
      const skill = action.skill;
      const healAmount = skill.value;
      
      if (skill.energyCost > 0) {
        dispatch({
          type: 'EXECUTE_COMBAT_ACTION',
          payload: {
            action: `${skill.icon} 你双手合十，气运丹田！消耗 ${skill.energyCost} 点内功，施展「${skill.name}」！恢复 ${healAmount} 点气血！✨ 感觉好多了！`,
            isHeal: true,
            healAmount
          }
        });
      } else {
        dispatch({
          type: 'EXECUTE_COMBAT_ACTION',
          payload: {
            action: `${skill.icon} 你双手合十，气运丹田！施展「${skill.name}」！恢复 ${healAmount} 点气血！✨ 感觉好多了！`,
            isHeal: true,
            healAmount
          }
        });
      }
      resetPlayerSpeed();
      return;
    }

    const baseDamage = action.type === 'attack'
      ? playerBaseStats.attack
      : (action.skill?.value || 0) + Math.floor(playerBaseStats.attack * 0.5);

    const attackerStats: CombatStats = {
      maxHP: playerBaseStats.maxHP,
      currentHP: player.combatStats.currentHP,
      maxEnergy: playerBaseStats.maxEnergy,
      currentEnergy: player.combatStats.currentEnergy,
      attack: baseDamage,
      defense: playerBaseStats.defense,
      speed: playerBaseStats.speed,
      critChance: playerBaseStats.critChance,
    };

    const damageResult = combatService.calculateDamage(
      attackerStats,
      enemyCombatStats,
      baseDamage,
      false
    );

    if (action.type === 'skill' && action.skill) {
      const critText = damageResult.isCritical ? ' 💥 暴击! 石破天惊!' : '';
      const skill = action.skill;
      
      if (skill.energyCost > 0) {
        dispatch({ 
          type: 'EXECUTE_COMBAT_ACTION', 
          payload: { 
            action: `${skill.icon} 你大喝一声！消耗 ${skill.energyCost} 点内功，施展「${skill.name}」！造成 ${damageResult.damage} 点伤害${critText}！💪`, 
            damage: damageResult.damage,
            isCrit: damageResult.isCritical
          } 
        });
      } else {
        dispatch({ 
          type: 'EXECUTE_COMBAT_ACTION', 
          payload: { 
            action: `${skill.icon} 你大喝一声！施展「${skill.name}」！造成 ${damageResult.damage} 点伤害${critText}！💪`, 
            damage: damageResult.damage,
            isCrit: damageResult.isCritical
          } 
        });
      }
    } else {
      const critText = damageResult.isCritical ? ' 💥 暴击! 致命一击!' : '';
      dispatch({ 
        type: 'EXECUTE_COMBAT_ACTION', 
        payload: { 
          action: `⚔️ 你身形一闪！发动攻击！造成 ${damageResult.damage} 点伤害${critText}！💪`, 
          damage: damageResult.damage,
          isCrit: damageResult.isCritical
        } 
      });
    }

    resetPlayerSpeed();
  }, [enemy, enemyCurrentHP, playerBaseStats, player.combatStats.currentHP, player.combatStats.currentEnergy, dispatch, resetPlayerSpeed, isDefending]);

  useEffect(() => {
    if (!enemy) return;

    if (!isInitializedRef.current) {
      lastTickRef.current = Date.now();
      enemyAttackingRef.current = false;
      isInitializedRef.current = true;
    }

    const enemyStats = combatService.computeEnemyCombatStats(enemy);
    const tickRate = 50;
    const basePlayerRate = (playerBaseStats.speed / 100) * combatSpeedMultiplier;
    const enemyRate = (enemyStats.speed / 100) * combatSpeedMultiplier;

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.min(now - lastTickRef.current, 100);
      lastTickRef.current = now;

      const currentIsDefending = playerStateRef.current.isDefending;
      const playerRate = currentIsDefending ? basePlayerRate * 0.7 : basePlayerRate;

      setPlayerSpeed(prev => {
        if (prev >= 100) return 100;
        const next = prev + (playerRate * delta);
        return Math.min(100, next);
      });

      setEnemySpeed(prev => {
        if (prev >= 100) {
          return 0;
        }
        const next = prev + (enemyRate * delta);
        if (next >= 100) {
          executeEnemyAttackInternal();
          return 0;
        }
        return next;
      });
    }, tickRate);

    return () => { 
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enemy, playerBaseStats.speed, combatSpeedMultiplier, executeEnemyAttackInternal]);

  const availableSkills = getAvailableSkills();
  const basicSkills = getBasicSkills();

  const availableCategories = useMemo(() => {
    const categories = new Set<SkillCategory>(['basic_actions']);
    availableSkills.forEach(skill => {
      categories.add(skill.type as SkillCategory);
    });
    return Array.from(categories);
  }, [availableSkills]);

  const currentCategorySkills = useMemo(() => {
    if (selectedCategory === 'basic_actions') {
      return basicSkills;
    }
    return availableSkills.filter(skill => skill.type === selectedCategory);
  }, [selectedCategory, basicSkills, availableSkills]);

  const canUseSkill = useCallback((skill: CombatSkill): boolean => {
    if (skill.effectType === 'defense') {
      return true;
    }
    const hasEnoughSpeed = playerSpeed >= skill.speedCost;
    const hasEnoughEnergy = player.combatStats.currentEnergy >= skill.energyCost;
    return hasEnoughSpeed && hasEnoughEnergy;
  }, [playerSpeed, player.combatStats.currentEnergy]);

  const handleSkillClick = (skill: CombatSkill) => {
    if (!canUseSkill(skill)) return;

    if (skill.effectType === 'defense') {
      executePlayerAction({ type: 'defend', skill });
    } else if (skill.effectType === 'flee') {
      executePlayerAction({ type: 'flee', skill });
    } else if (skill.id === 'basic-attack') {
      executePlayerAction({ type: 'attack' });
    } else {
      executePlayerAction({ type: 'skill', skill });
    }
  };

  useEffect(() => {
    if (enemyCurrentHP <= 0) {
      dispatch({ type: 'END_COMBAT', payload: { victory: true, rewards: { exp: enemy?.expReward || 0, gold: Math.floor(Math.random() * 100), items: [] } } });
    }
  }, [enemyCurrentHP, enemy, dispatch]);

  useEffect(() => {
    if (player.combatStats.currentHP <= 0) {
      dispatch({ type: 'END_COMBAT', payload: { victory: false } });
    }
  }, [player.combatStats.currentHP, dispatch]);

  if (!enemy) return <div className="p-8 text-center">战斗加载中...</div>;

  const enemyStats = combatService.computeEnemyCombatStats(enemy);
  const playerHP = player.combatStats.currentHP;
  const playerMaxHP = player.combatStats.maxHP;
  const playerEnergy = player.combatStats.currentEnergy;
  const playerMaxEnergy = player.combatStats.maxEnergy;

  const renderLogEntry = (entry: CombatLogEntry, index: number) => {
    const hasCrit = entry.text.includes('暴击');
    const isHeal = entry.type === 'heal';
    const isDamage = entry.type === 'damage';
    
    const valueColor = isHeal ? '#16a34a' : (isDamage && entry.value > 0 ? '#1e40af' : '#dc2626');
    const fontWeight = hasCrit || isHeal ? 'bold' : 'normal';

    let textParts: React.ReactNode[] = [];
    
    const numberRegex = /(\d+)/g;
    let match;
    let lastIndex = 0;
    
    while ((match = numberRegex.exec(entry.text)) !== null) {
      if (match.index > lastIndex) {
        textParts.push(
          <span key={`text-${lastIndex}`} style={{ color: '#1a1a1a' }}>
            {entry.text.slice(lastIndex, match.index)}
          </span>
        );
      }
      
      const isValueNumber = (isDamage || isHeal) && parseInt(match[1]) === Math.abs(entry.value);
      
      textParts.push(
        <span 
          key={`num-${match.index}`} 
          style={{ 
            color: isValueNumber ? valueColor : '#1a1a1a',
            fontWeight: isValueNumber ? fontWeight : 'normal'
          }}
        >
          {match[1]}
        </span>
      );
      
      lastIndex = match.index + match[1].length;
    }
    
    if (lastIndex < entry.text.length) {
      textParts.push(
        <span key={`text-${lastIndex}`} style={{ color: '#1a1a1a' }}>
          {entry.text.slice(lastIndex)}
        </span>
      );
    }

    return (
      <p 
        key={index} 
        className="text-sm py-0.5" 
        style={{ color: '#1a1a1a' }}
      >
        {textParts.length > 0 ? textParts : entry.text}
      </p>
    );
  };

  const getSkillButtonStyle = (skill: CombatSkill) => {
    const canUse = canUseSkill(skill);
    const categoryInfo = categoryLabels[skill.type];
    const isActive = skill.isActive;

    if (isActive) {
      return {
        backgroundColor: `${categoryInfo.color}`,
        borderColor: categoryInfo.color,
        color: '#ffffff',
        opacity: 1,
        boxShadow: `0 0 16px ${categoryInfo.color}`,
        transform: 'scale(1.05)',
        cursor: 'pointer' as const,
      };
    }

    if (!canUse) {
      return {
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        borderColor: '#d1d5db',
        color: '#9ca3af',
        opacity: 0.5,
        boxShadow: 'none',
        transform: 'scale(1)',
        cursor: 'not-allowed' as const,
      };
    }

    const isHeal = skill.effectType === 'heal';
    const bgColor = isHeal ? 'rgba(22, 163, 74, 0.15)' : `${categoryInfo.color}20`;
    const textColor = isHeal ? '#16a34a' : categoryInfo.color;

    return {
      backgroundColor: bgColor,
      borderColor: textColor,
      color: textColor,
      opacity: 1,
      boxShadow: `0 0 12px ${textColor}40`,
      transform: 'scale(1.02)',
      cursor: 'pointer' as const,
    };
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#f5f0e6' }}>
      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/90 rounded-lg shadow-lg" style={{ borderWidth: '2px', borderColor: '#8b0000' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-bold" style={{ color: '#8b0000', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{enemy.nameCN}</span>
                <span className="ml-2 text-sm px-2 py-0.5 rounded" style={{ backgroundColor: '#8b0000', color: '#fff' }}>等级 {enemy.level}</span>
              </div>
              <span className="text-2xl">👹</span>
            </div>
            <HPBar current={enemyCurrentHP} max={enemyStats.maxHP} label="气血" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>攻击</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{enemyStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>防御</span>
                <span className="font-bold" style={{ color: '#2563eb' }}>{enemyStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>速度</span>
                <span className="font-bold" style={{ color: '#16a34a' }}>{enemyStats.speed}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>气血</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{enemyStats.maxHP}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-lg shadow-lg" style={{ borderWidth: '2px', borderColor: '#1e40af' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-xl font-bold" style={{ color: '#1e40af', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{player.name}</span>
                  <span className="ml-2 text-sm px-2 py-0.5 rounded" style={{ backgroundColor: '#1e40af', color: '#fff' }}>等级 {player.level}</span>
                </div>
                {isDefending && (
                  <span className="px-2 py-1 rounded text-sm font-bold" style={{ backgroundColor: '#16a34a', color: '#fff' }}>
                    🛡️ 防御中
                  </span>
                )}
              </div>
              <span className="text-2xl">🧑</span>
            </div>
            <HPBar current={playerHP} max={playerMaxHP} label="气血" />
            <div className="mt-2">
              <HPBar current={playerEnergy} max={playerMaxEnergy} label="内功" type="energy" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>攻击</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{playerBaseStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>防御</span>
                <span className="font-bold" style={{ color: '#2563eb' }}>{playerBaseStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>速度</span>
                <span className="font-bold" style={{ color: '#16a34a' }}>
                  {playerBaseStats.speed}
                  {isDefending && <span className="ml-1" style={{ color: '#f59e0b' }}>(x0.7)</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>气血</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{playerMaxHP}</span>
              </div>
            </div>
            {player.equipment.weapon && (
              <div className="mt-2 text-xs" style={{ color: '#7a7a7a' }}>
                武器: {player.equipment.weapon.nameCN} (+{player.equipment.weapon.effects.attackBonus}攻击)
              </div>
            )}
            {player.equipment.armor && (
              <div className="text-xs" style={{ color: '#7a7a7a' }}>
                防具: {player.equipment.armor.nameCN} (+{player.equipment.armor.effects.defenseBonus}防御)
              </div>
            )}
          </div>
        </div>
      </div>

      <div 
        className="max-w-6xl mx-auto mb-4 p-4 bg-white/80 rounded-lg shadow" 
        style={{ borderWidth: '1px', borderColor: '#d1d5db' }}
      >
        <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>战斗日志</h3>
        <div 
          ref={logContainerRef}
          className="h-32 overflow-y-auto"
        >
          {combatLog.slice(-10).map((entry, i) => renderLogEntry(entry, i))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold" style={{ color: '#1a1a1a' }}>武学技能</h3>
          <div className="text-sm" style={{ color: '#7a7a7a' }}>
            内功: <span className="font-bold" style={{ color: '#8b5cf6' }}>{playerEnergy}</span> / {playerMaxEnergy}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {availableCategories.map((cat) => {
            const categoryInfo = categoryLabels[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                onMouseEnter={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-lg border-2 transition-all text-sm"
                style={{
                  backgroundColor: isSelected ? categoryInfo.color : 'transparent',
                  borderColor: categoryInfo.color,
                  color: isSelected ? '#ffffff' : categoryInfo.color,
                  boxShadow: isSelected ? `0 0 12px ${categoryInfo.color}40` : 'none',
                }}
              >
                <span className="mr-1">{categoryInfo.icon}</span>
                {categoryInfo.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {currentCategorySkills.length === 0 ? (
            <span className="text-sm px-3 py-2 rounded" style={{ backgroundColor: 'rgba(122, 122, 122, 0.1)', color: '#7a7a7a' }}>暂无技能</span>
          ) : (
            currentCategorySkills.map(skill => {
              const canUse = canUseSkill(skill);
              const baseTechId = skill.id.split('-')[0];
              const techLevel = getTechniqueLevel(baseTechId);
              const style = getSkillButtonStyle(skill);
              
              return (
                <button
                  key={skill.id}
                  onClick={() => handleSkillClick(skill)}
                  disabled={!canUse && skill.effectType !== 'defense'}
                  className="px-4 py-3 rounded-lg border-2 transition-all flex flex-col items-center min-w-24"
                  style={style}
                  title={skill.description}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-lg">{skill.icon}</span>
                    <span className="font-serif font-medium">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {techLevel && techLevel.level > 1 && (
                      <span style={{ color: style.color, opacity: 0.8 }}>Lv.{techLevel.level}</span>
                    )}
                    {skill.energyCost > 0 && (
                      <span style={{ color: style.color, opacity: 0.8 }}>💧{skill.energyCost}</span>
                    )}
                    {skill.effectType === 'heal' && <span>💚</span>}
                    {!canUse && skill.effectType !== 'defense' && (
                      <span style={{ color: '#f59e0b' }}>⚡</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="p-3 bg-white/60 rounded-lg text-sm" style={{ color: '#7a7a7a' }}>
          <p>💡 提示：防御可随时切换，无需等待速度槽。防御期间速度槽积累减半，但受到伤害时额外减免 <span className="font-bold" style={{ color: '#16a34a' }}>根骨 × 0.5</span> 点伤害。使用武学需要消耗内功，请合理分配内功使用。</p>
        </div>
      </div>
    </div>
  );
}
