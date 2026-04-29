import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSelector, useGameDispatch } from '../hooks/useGame';
import { HPBar } from '../components/ui/HPBar';
import { getMartialArt } from '../data/martialArts';
import { calculateDamage } from '../utils/combat';
import type { Enemy, CombatLogEntry, CombatStats } from '../types';

interface CombatSkill {
  id: string;
  name: string;
  icon: string;
  speedCost: number;
  effectType: 'damage' | 'heal';
  value: number;
  description: string;
  type: 'internal' | 'external' | 'weapon' | 'special';
}

function computeEnemyStats(enemy: Enemy) {
  const { attributes, level } = enemy;
  return {
    maxHP: 100 + attributes.constitution * 10 + level * 5,
    attack: 10 + attributes.strength * 5 + level * 2,
    defense: 5 + attributes.physique * 3 + level * 1,
    speed: 10 + attributes.agility * 2 + level * 1,
    maxEnergy: 50 + level * 10 + attributes.insight * 5,
  };
}

export function CombatScreen() {
  const dispatch = useGameDispatch();
  const combat = useGameSelector(s => s.combat);
  const player = useGameSelector(s => s.player);
  const combatSpeedMultiplier = useGameSelector(s => s.meta.settings.combatSpeedMultiplier) ?? 1;

  const [playerSpeed, setPlayerSpeed] = useState(0);
  const [enemySpeed, setEnemySpeed] = useState(0);
  const [isDefending, setIsDefending] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const logContainerRef = useRef<HTMLDivElement>(null);

  const { enemy, enemyCurrentHP, combatLog } = combat;

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog]);

  const getTechniqueLevel = useCallback((techId: string) => {
    return player.techniqueLevels.find(t => t.techniqueId === techId);
  }, [player.techniqueLevels]);

  const getAvailableSkills = useCallback((): CombatSkill[] => {
    const skills: CombatSkill[] = [];
    player.knownTechniques.forEach(techId => {
      const tech = getMartialArt(techId);
      if (!tech) return;
      const techLevel = getTechniqueLevel(techId);
      const levelBonus = techLevel ? (techLevel.level - 1) * 2 : 0;
      
      tech.effects.forEach(effect => {
        if (effect.type === 'damage' || effect.type === 'heal') {
          const baseValue = effect.value + (effect.scalingAttribute ? Math.floor((player.attributes[effect.scalingAttribute] - 5) * (effect.scalingPercent || 0) / 10) : 0);
          skills.push({
            id: `${tech.id}-${effect.type}`,
            name: tech.nameCN,
            icon: tech.type === 'internal' ? '🧘' : tech.type === 'external' ? '👊' : tech.type === 'weapon' ? '⚔️' : '✨',
            speedCost: 30 + (tech.level * 5),
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

  const playerStats: CombatStats = {
    ...player.combatStats,
    attack: player.combatStats.attack + (player.equipment.weapon?.effects.attackBonus || 0),
    defense: player.combatStats.defense + (player.equipment.armor?.effects.defenseBonus || 0),
    speed: player.combatStats.speed + (player.equipment.armor?.effects.speedBonus || 0),
    maxHP: player.combatStats.maxHP + (player.equipment.armor?.effects.maxHPBonus || 0),
  };

  const executePlayerAction = useCallback((action: { type: 'attack' | 'skill'; skill?: CombatSkill }) => {
    if (!enemy) return;

    const enemyStats = computeEnemyStats(enemy);
    const enemyCombatStats: CombatStats = {
      ...enemyStats,
      currentHP: enemyCurrentHP,
      currentEnergy: enemy.maxEnergy,
      critChance: Math.max(0, enemy.attributes.luck) * 0.5,
    };

    if (action.type === 'skill' && action.skill && action.skill.effectType === 'heal') {
      const skill = action.skill;
      const healAmount = skill.value;
      dispatch({ 
        type: 'EXECUTE_COMBAT_ACTION', 
        payload: { 
          action: `${skill.icon} 你施展了「${skill.name}」！恢复 ${healAmount} 点气血！`, 
          isHeal: true,
          healAmount 
        } 
      });
      resetPlayerSpeed();
      return;
    }

    const baseDamage = action.type === 'attack'
      ? playerStats.attack
      : (action.skill?.value || 0) + Math.floor(playerStats.attack * 0.5);

    const attackerStats: CombatStats = {
      ...playerStats,
      attack: baseDamage,
    };

    const { damage, isCritical: isCrit } = calculateDamage(attackerStats, enemyCombatStats, baseDamage);

    if (action.type === 'skill' && action.skill) {
      dispatch({ 
        type: 'EXECUTE_COMBAT_ACTION', 
        payload: { 
          action: `${action.skill.icon} 你施展了「${action.skill.name}」！造成 ${damage} 点伤害${isCrit ? ' (暴击!)' : ''}！`, 
          damage,
          isCrit
        } 
      });
    } else {
      dispatch({ 
        type: 'EXECUTE_COMBAT_ACTION', 
        payload: { 
          action: `⚔️ 你发动攻击！造成 ${damage} 点伤害${isCrit ? ' (暴击!)' : ''}！`, 
          damage,
          isCrit
        } 
      });
    }

    resetPlayerSpeed();
  }, [enemy, player, playerStats, enemyCurrentHP, dispatch, resetPlayerSpeed]);

  const executeEnemyAttack = useCallback(() => {
    if (!enemy) return;
    const enemyStats = computeEnemyStats(enemy);
    const enemyCombatStats: CombatStats = {
      ...enemyStats,
      currentHP: enemyCurrentHP,
      currentEnergy: enemy.maxEnergy,
      critChance: Math.max(0, enemy.attributes.luck) * 0.5,
    };

    let finalDefense = playerStats.defense;
    let defendMessage = '';
    
    if (isDefending) {
      finalDefense = Math.floor(playerStats.defense * 1.5);
      defendMessage = ` (防御姿态)`;
    }

    const defenderStats: CombatStats = {
      ...playerStats,
      defense: finalDefense,
    };

    const { damage, isCritical } = calculateDamage(enemyCombatStats, defenderStats, enemyStats.attack);
    const critMessage = isCritical ? ' (暴击!)' : '';
    
    dispatch({ 
      type: 'EXECUTE_COMBAT_ACTION', 
      payload: { 
        action: `🩸 ${enemy.nameCN} 发动攻击！对你造成 ${damage} 点伤害！${critMessage}${defendMessage}`, 
        damage: -damage 
      } 
    });
    setEnemySpeed(0);
  }, [enemy, playerStats, enemyCurrentHP, isDefending, dispatch]);

  useEffect(() => {
    if (!enemy) return;

    const enemyStats = computeEnemyStats(enemy);
    const tickRate = 50;
    const basePlayerRate = (playerStats.speed / 100) * combatSpeedMultiplier;
    const playerRate = isDefending ? basePlayerRate * 0.7 : basePlayerRate;
    const enemyRate = (enemyStats.speed / 100) * combatSpeedMultiplier;

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setPlayerSpeed(prev => {
        if (prev >= 100) return 100;
        const next = prev + (playerRate * delta);
        return Math.min(100, next);
      });

      setEnemySpeed(prev => {
        if (prev >= 100) {
          executeEnemyAttack();
          return 0;
        }
        const next = prev + (enemyRate * delta);
        if (next >= 100) {
          executeEnemyAttack();
          return 0;
        }
        return next;
      });
    }, tickRate);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enemy, playerStats.speed, executeEnemyAttack, isDefending, combatSpeedMultiplier]);

  const canAct = playerSpeed >= 100;
  const availableSkills = getAvailableSkills();

  const handleAction = (type: 'attack' | 'skill' | 'defend', skill?: CombatSkill) => {
    if (type === 'defend') {
      if (isDefending) {
        dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: '🛡️ 你取消了防御姿态！' } });
        setIsDefending(false);
      } else {
        setIsDefending(true);
        dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: `🛡️ 你进入防御姿态！(防御减免 ${Math.floor(playerStats.defense * 0.5)} 点，速度槽积累减半)` } });
      }
      return;
    }

    if (!canAct) return;

    if (type === 'attack') {
      executePlayerAction({ type: 'attack' });
      return;
    }

    if (type === 'skill' && skill) {
      executePlayerAction({ type: 'skill', skill });
    }
  };

  const handleFlee = () => {
    if (!canAct) return;
    
    if (Math.random() < 0.6) {
      dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: '🏃 你成功逃离了战斗！' } });
      setTimeout(() => {
        dispatch({ type: 'END_COMBAT', payload: { victory: false } });
      }, 500);
    } else {
      dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: '🏃 逃跑失败！敌人挡住了你的去路！' } });
      resetPlayerSpeed();
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

  const enemyStats = computeEnemyStats(enemy);
  const playerHP = player.combatStats.currentHP;
  const playerMaxHP = player.combatStats.maxHP;
  const playerEnergy = player.combatStats.currentEnergy;
  const playerMaxEnergy = player.combatStats.maxEnergy;

  const renderLogEntry = (entry: CombatLogEntry, index: number) => {
    let color = '#4a4a4a';
    let fontWeight = 'normal';
    
    if (entry.color === 'text-red-600') {
      color = '#dc2626';
    } else if (entry.color === 'text-jade') {
      color = '#16a34a';
    }

    const hasCrit = entry.text.includes('暴击');
    const isHeal = entry.text.includes('恢复');
    const isDefend = entry.text.includes('防御');
    
    if (hasCrit) {
      fontWeight = 'bold';
    }
    if (isHeal) {
      color = '#16a34a';
      fontWeight = 'bold';
    }
    if (isDefend) {
      color = '#16a34a';
    }

    return (
      <p 
        key={index} 
        className="text-sm py-0.5" 
        style={{ color, fontWeight }}
      >
        {entry.text}
      </p>
    );
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
                <span className="font-bold" style={{ color: '#dc2626' }}>{playerStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>防御</span>
                <span className="font-bold" style={{ color: '#2563eb' }}>{playerStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>速度</span>
                <span className="font-bold" style={{ color: '#16a34a' }}>
                  {playerStats.speed}
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

      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/80 rounded-lg shadow">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: '#7a7a7a' }}>{enemy.nameCN}速度</span>
              <span className="font-bold" style={{ color: '#8b0000' }}>{Math.round(enemySpeed)}%</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div className="h-full transition-all duration-100" style={{ width: `${enemySpeed}%`, backgroundColor: '#8b0000' }} />
            </div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg shadow">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: '#7a7a7a' }}>你的速度</span>
              <span className="font-bold" style={{ color: '#1e40af' }}>{Math.round(playerSpeed)}%</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div 
                className="h-full transition-all duration-100" 
                style={{ 
                  width: `${playerSpeed}%`, 
                  backgroundColor: isDefending ? '#f59e0b' : '#1e40af' 
                }} 
              />
            </div>
            {isDefending && (
              <div className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                ⚠️ 防御中：速度槽积累速率减半
              </div>
            )}
          </div>
        </div>
      </div>

      <div 
        ref={logContainerRef}
        className="max-w-6xl mx-auto mb-4 p-4 bg-white/80 rounded-lg shadow max-h-40 overflow-y-auto" 
        style={{ borderWidth: '1px', borderColor: '#d1d5db' }}
      >
        <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>战斗日志</h3>
        {combatLog.slice(-10).map((entry, i) => renderLogEntry(entry, i))}
      </div>

      <div className="max-w-6xl mx-auto mb-4">
        <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>武学技能</h3>
        <div className="flex flex-wrap gap-2">
          {availableSkills.length === 0 ? (
            <span className="text-sm px-3 py-2 rounded" style={{ backgroundColor: 'rgba(122, 122, 122, 0.1)', color: '#7a7a7a' }}>暂无已学技能</span>
          ) : (
            availableSkills.map(skill => {
              const canUse = playerSpeed >= skill.speedCost;
              const isHeal = skill.effectType === 'heal';
              const baseTechId = skill.id.split('-')[0];
              const techLevel = getTechniqueLevel(baseTechId);
              
              return (
                <button
                  key={skill.id}
                  onClick={() => handleAction('skill', skill)}
                  disabled={!canUse}
                  className="px-3 py-2 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: canUse 
                      ? (isHeal ? 'rgba(22, 163, 74, 0.15)' : (skill.type === 'internal' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 64, 175, 0.15)')) 
                      : 'rgba(122, 122, 122, 0.1)',
                    borderColor: canUse 
                      ? (isHeal ? '#16a34a' : (skill.type === 'internal' ? '#8b5cf6' : '#1e40af')) 
                      : '#d1d5db',
                    color: canUse 
                      ? (isHeal ? '#16a34a' : (skill.type === 'internal' ? '#8b5cf6' : '#1e40af')) 
                      : '#9ca3af',
                    opacity: canUse ? 1 : 0.6,
                    boxShadow: canUse ? `0 0 8px ${isHeal ? 'rgba(22, 163, 74, 0.4)' : (skill.type === 'internal' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(30, 64, 175, 0.4)')}` : 'none',
                    transform: canUse ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <span className="text-lg mr-1">{skill.icon}</span>
                  <span className="font-serif font-medium">{skill.name}</span>
                  {techLevel && techLevel.level > 1 && (
                    <span className="text-xs ml-1" style={{ color: '#f59e0b' }}>Lv.{techLevel.level}</span>
                  )}
                  <span className="text-xs ml-1">({skill.speedCost}速)</span>
                  {isHeal && <span className="text-xs ml-1" style={{ color: '#16a34a' }}>💚</span>}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => handleAction('attack')}
            disabled={!canAct}
            className="px-8 py-4 rounded-lg transition-all text-lg font-serif shadow"
            style={{
              backgroundColor: canAct ? '#1a1a1a' : '#9ca3af',
              color: '#f5f0e6',
              opacity: canAct ? 1 : 0.6,
              boxShadow: canAct ? '0 4px 12px rgba(26, 26, 26, 0.3)' : 'none',
            }}
          >
            ⚔️ 普通攻击
          </button>
          <button
            onClick={() => handleAction('defend')}
            className="px-8 py-4 rounded-lg border-2 transition-all text-lg font-serif shadow"
            style={{
              borderColor: '#16a34a',
              color: '#16a34a',
              backgroundColor: isDefending ? 'rgba(22, 163, 74, 0.3)' : 'rgba(22, 163, 74, 0.1)',
              boxShadow: isDefending ? '0 0 12px rgba(22, 163, 74, 0.5)' : '0 4px 12px rgba(22, 163, 74, 0.2)',
              transform: isDefending ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {isDefending ? '🛡️ 取消防御' : '🛡️ 防御'}
          </button>
          <button
            onClick={handleFlee}
            disabled={!canAct}
            className="px-8 py-4 rounded-lg border-2 transition-all text-lg font-serif shadow"
            style={{
              borderColor: canAct ? '#7a7a7a' : '#d1d5db',
              color: canAct ? '#7a7a7a' : '#9ca3af',
              backgroundColor: 'transparent',
              opacity: canAct ? 1 : 0.6,
            }}
          >
            🏃 逃跑
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="p-3 bg-white/60 rounded-lg text-sm" style={{ color: '#7a7a7a' }}>
          <p>💡 提示：防御可随时切换，无需等待速度条。防御期间速度槽积累减半，但受到伤害时额外减免 <span className="font-bold" style={{ color: '#16a34a' }}>根骨 × 0.5</span> 点伤害。</p>
        </div>
      </div>
    </div>
  );
}
