import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSelector, useGameDispatch } from '../hooks/useGame';
import { HPBar } from '../components/ui/HPBar';
import { getMartialArt } from '../data/martialArts';

interface CombatSkill {
  id: string;
  name: string;
  icon: string;
  speedCost: number;
  damage: number;
  heal?: number;
  description: string;
}

export function CombatScreen() {
  const dispatch = useGameDispatch();
  const combat = useGameSelector(s => s.combat);
  const player = useGameSelector(s => s.player);

  const [playerSpeed, setPlayerSpeed] = useState(0);
  const [enemySpeed, setEnemySpeed] = useState(0);
  const [isDefending, setIsDefending] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const { enemy, enemyCurrentHP, combatLog } = combat;

  // 获取玩家可用技能
  const getAvailableSkills = useCallback((): CombatSkill[] => {
    const skills: CombatSkill[] = [];
    player.knownTechniques.forEach(techId => {
      const tech = getMartialArt(techId);
      if (!tech) return;
      tech.effects.forEach(effect => {
        if (effect.type === 'damage' || effect.type === 'heal') {
          const baseDamage = effect.value + (effect.scalingAttribute ? Math.floor((player.attributes[effect.scalingAttribute] - 5) * (effect.scalingPercent || 0) / 10) : 0);
          skills.push({
            id: `${tech.id}-${effect.type}`,
            name: tech.nameCN,
            icon: tech.type === 'internal' ? '🧘' : tech.type === 'external' ? '👊' : tech.type === 'weapon' ? '⚔️' : '✨',
            speedCost: 30 + (tech.level * 5),
            damage: effect.type === 'damage' ? baseDamage : 0,
            heal: effect.type === 'heal' ? baseDamage : undefined,
            description: tech.descriptionCN,
          });
        }
      });
    });
    return skills;
  }, [player.knownTechniques, player.attributes]);

  // 重置速度条到0
  const resetPlayerSpeed = useCallback(() => {
    setPlayerSpeed(0);
    setIsDefending(false);
  }, []);

  // 执行玩家动作
  const executePlayerAction = useCallback((action: { type: 'attack' | 'skill' | 'defend'; skill?: CombatSkill }) => {
    if (!enemy) return;

    if (action.type === 'defend') {
      setIsDefending(true);
      dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: '🛡️ 你进入防御姿态！', damage: 0 } });
      resetPlayerSpeed();
      return;
    }

    const baseDamage = action.type === 'attack'
      ? player.attributes.strength + (player.equipment.weapon?.effects.attackBonus || 0)
      : action.skill?.damage || 0;

    const defense = enemy.baseDefense;
    const critChance = (player.attributes.luck + 5) / 100;
    const isCrit = Math.random() < critChance;
    let damage = Math.max(1, baseDamage - defense);
    if (isCrit) damage = Math.floor(damage * 1.5);

    if (action.type === 'skill' && action.skill) {
      dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: `${action.skill.icon} 你施展了「${action.skill.name}」！造成 ${damage} 点伤害${isCrit ? ' (暴击!)' : ''}！`, damage } });
    } else {
      dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: `⚔️ 你发动攻击！造成 ${damage} 点伤害${isCrit ? ' (暴击!)' : ''}！`, damage } });
    }

    resetPlayerSpeed();
  }, [enemy, player, dispatch, resetPlayerSpeed]);

  // 执行敌人攻击
  const executeEnemyAttack = useCallback(() => {
    if (!enemy) return;
    const baseDamage = enemy.baseAttack;
    const defense = player.attributes.physique + (player.equipment.armor?.effects.defenseBonus || 0);
    let damage = Math.max(1, baseDamage - Math.floor(defense / 2));
    if (isDefending) damage = Math.floor(damage * 0.5);
    dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: `🩸 ${enemy.nameCN} 发动攻击！对你造成 ${damage} 点伤害！`, damage: -damage } });
    setEnemySpeed(0);
    setIsDefending(false);
  }, [enemy, player, isDefending, dispatch]);

  // 速度条循环
  useEffect(() => {
    if (!enemy) return;

    const tickRate = 50;
    const playerRate = player.attributes.agility / 100;
    const enemyRate = enemy.baseSpeed / 100;

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
  }, [enemy, player.attributes.agility, executeEnemyAttack]);

  const canAct = playerSpeed >= 100;
  const availableSkills = getAvailableSkills();

  const handleAction = (type: 'attack' | 'skill' | 'defend', skill?: CombatSkill) => {
    if (!canAct) return;

    if (type === 'defend') {
      executePlayerAction({ type: 'defend' });
      return;
    }

    if (type === 'attack') {
      executePlayerAction({ type: 'attack' });
      return;
    }

    if (type === 'skill' && skill) {
      executePlayerAction({ type: 'skill', skill });
    }
  };

  const handleFlee = () => {
    if (Math.random() < 0.6) {
      dispatch({ type: 'END_COMBAT', payload: { victory: false } });
    } else {
      dispatch({ type: 'EXECUTE_COMBAT_ACTION', payload: { action: '🏃 逃跑失败！', damage: 0 } });
      resetPlayerSpeed();
    }
  };

  // 结束战斗检查
  useEffect(() => {
    if (enemyCurrentHP <= 0) {
      dispatch({ type: 'END_COMBAT', payload: { victory: true, rewards: { exp: enemy?.expReward || 0, gold: Math.floor(Math.random() * 100), items: [] } } });
    }
  }, [enemyCurrentHP, enemy, dispatch]);

  if (!enemy) return <div className="p-8 text-center">战斗加载中...</div>;

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#f5f0e6' }}>
      {/* 顶部：双方属性对比 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 左侧：敌人属性 */}
          <div className="p-4 bg-white/90 rounded-lg shadow-lg" style={{ borderWidth: '2px', borderColor: '#8b0000' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-bold" style={{ color: '#8b0000' }}>{enemy.nameCN}</span>
                <span className="ml-2 text-sm px-2 py-0.5 rounded" style={{ backgroundColor: '#8b0000', color: '#fff' }}>等级 {enemy.level}</span>
              </div>
              <span className="text-2xl">👹</span>
            </div>
            <HPBar current={enemyCurrentHP} max={enemy.baseHP} label="气血" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>攻击</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{enemy.baseAttack}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>防御</span>
                <span className="font-bold" style={{ color: '#2563eb' }}>{enemy.baseDefense}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>速度</span>
                <span className="font-bold" style={{ color: '#16a34a' }}>{enemy.baseSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>气血</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{enemy.baseHP}</span>
              </div>
            </div>
          </div>

          {/* 右侧：玩家属性 */}
          <div className="p-4 bg-white/90 rounded-lg shadow-lg" style={{ borderWidth: '2px', borderColor: '#1e40af' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-bold" style={{ color: '#1e40af' }}>{player.name}</span>
                <span className="ml-2 text-sm px-2 py-0.5 rounded" style={{ backgroundColor: '#1e40af', color: '#fff' }}>等级 {player.level}</span>
              </div>
              <span className="text-2xl">🧑</span>
            </div>
            <HPBar current={player.currentHP} max={player.maxHP} label="气血" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>攻击</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{player.attributes.strength + (player.equipment.weapon?.effects.attackBonus || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>防御</span>
                <span className="font-bold" style={{ color: '#2563eb' }}>{player.attributes.physique + (player.equipment.armor?.effects.defenseBonus || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>速度</span>
                <span className="font-bold" style={{ color: '#16a34a' }}>{player.attributes.agility}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a7a7a' }}>气血</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>{player.maxHP}</span>
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

      {/* 中间：速度条对比 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/80 rounded-lg shadow">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: '#7a7a7a' }}>你的速度</span>
              <span className="font-bold" style={{ color: '#1e40af' }}>{Math.round(playerSpeed)}%</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div className="h-full transition-all duration-100" style={{ width: `${playerSpeed}%`, backgroundColor: '#1e40af' }} />
            </div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg shadow">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: '#7a7a7a' }}>{enemy.nameCN}速度</span>
              <span className="font-bold" style={{ color: '#8b0000' }}>{Math.round(enemySpeed)}%</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div className="h-full transition-all duration-100" style={{ width: `${enemySpeed}%`, backgroundColor: '#8b0000' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 战斗日志 */}
      <div className="max-w-6xl mx-auto mb-4 p-4 bg-white/80 rounded-lg shadow max-h-40 overflow-y-auto" style={{ borderWidth: '1px', borderColor: '#d1d5db' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>战斗日志</h3>
        {combatLog.slice(-10).map((entry, i) => (
          <p key={i} className="text-sm py-0.5" style={{ color: entry.color === 'text-red-600' ? '#dc2626' : entry.color === 'text-jade' ? '#16a34a' : '#4a4a4a' }}>{entry.text}</p>
        ))}
      </div>

      {/* 技能列表 */}
      <div className="max-w-6xl mx-auto mb-4">
        <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>武学技能</h3>
        <div className="flex flex-wrap gap-2">
          {availableSkills.length === 0 ? (
            <span className="text-sm px-3 py-2 rounded" style={{ backgroundColor: 'rgba(122, 122, 122, 0.1)', color: '#7a7a7a' }}>暂无已学技能</span>
          ) : (
            availableSkills.map(skill => {
              const canUse = playerSpeed >= skill.speedCost;
              return (
                <button
                  key={skill.id}
                  onClick={() => handleAction('skill', skill)}
                  disabled={!canUse}
                  className="px-3 py-2 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: canUse ? 'rgba(30, 64, 175, 0.1)' : 'rgba(122, 122, 122, 0.1)',
                    borderColor: canUse ? '#1e40af' : '#d1d5db',
                    color: canUse ? '#1e40af' : '#9ca3af',
                    opacity: canUse ? 1 : 0.6,
                  }}
                >
                  <span className="text-lg mr-1">{skill.icon}</span>
                  <span className="font-serif">{skill.name}</span>
                  <span className="text-xs ml-1">({skill.speedCost}速)</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 动作按钮 */}
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
            }}
          >
            ⚔️ 普通攻击
          </button>
          <button
            onClick={() => handleAction('defend')}
            disabled={!canAct}
            className="px-8 py-4 rounded-lg border-2 transition-all text-lg font-serif shadow"
            style={{
              borderColor: canAct ? '#16a34a' : '#d1d5db',
              color: canAct ? '#16a34a' : '#9ca3af',
              backgroundColor: canAct ? 'rgba(22, 163, 74, 0.1)' : 'rgba(122, 122, 122, 0.1)',
              opacity: canAct ? 1 : 0.6,
            }}
          >
            🛡️ 防御
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
    </div>
  );
}
