import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';

export default function StatsModal() {
  const dispatch = useGameDispatch();
  const player = useGameSelector(state => state.player);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const totalAttack = player.attributes.strength + (player.equipment.weapon?.effects.attackBonus || 0);
  const totalDefense = player.attributes.physique + (player.equipment.armor?.effects.defenseBonus || 0);
  const totalAgility = player.attributes.agility + (player.equipment.accessory?.effects.speedBonus || 0);

  const expPercent = Math.min(100, (player.exp / player.expToNext) * 100);

  const getAttributeDescription = (attr: string) => {
    switch (attr) {
      case 'insight': return '影响功法学习速度和功法等级提升速度';
      case 'constitution': return '影响气血上限 (100 + 体质 x 10)';
      case 'strength': return '影响攻击力';
      case 'agility': return '影响速度条增长速度';
      case 'physique': return '影响防御力和防御减免效果';
      case 'luck': return '影响暴击率和物品掉落率';
      default: return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-md flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>角色属性</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif text-lg" style={{ color: '#1a1a1a' }}>{player.name}</span>
              <span className="px-3 py-1 rounded text-sm font-bold" style={{ backgroundColor: '#1e40af', color: '#fff' }}>
                等级 {player.level}
              </span>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: '#7a7a7a' }}>经验值</span>
                <span className="font-bold" style={{ color: '#4a7c59' }}>{player.exp} / {player.expToNext}</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                <div 
                  className="h-full transition-all duration-300" 
                  style={{ 
                    width: `${expPercent}%`, 
                    backgroundColor: '#4a7c59' 
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-serif font-bold mb-3" style={{ color: '#1a1a1a' }}>基础属性</h3>
            <div className="space-y-3">
              {[
                { key: 'insight' as const, label: '悟性', icon: '🧠', value: player.attributes.insight, color: '#8b5cf6' },
                { key: 'constitution' as const, label: '体质', icon: '❤️', value: player.attributes.constitution, color: '#dc2626' },
                { key: 'strength' as const, label: '力量', icon: '💪', value: player.attributes.strength, color: '#f59e0b' },
                { key: 'agility' as const, label: '敏捷', icon: '⚡', value: player.attributes.agility, color: '#16a34a' },
                { key: 'physique' as const, label: '根骨', icon: '🛡️', value: player.attributes.physique, color: '#2563eb' },
                { key: 'luck' as const, label: '福缘', icon: '🍀', value: player.attributes.luck, color: '#c9a227' },
              ].map(attr => (
                <div key={attr.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{attr.icon}</span>
                      <span className="font-medium" style={{ color: '#1a1a1a' }}>{attr.label}</span>
                    </div>
                    <span className="font-bold text-lg" style={{ color: attr.color }}>{attr.value}</span>
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    {getAttributeDescription(attr.key)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-serif font-bold mb-3" style={{ color: '#1a1a1a' }}>战斗属性</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                <div className="text-xs mb-1" style={{ color: '#7a7a7a' }}>攻击</div>
                <div className="font-bold text-lg" style={{ color: '#dc2626' }}>{totalAttack}</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                <div className="text-xs mb-1" style={{ color: '#7a7a7a' }}>防御</div>
                <div className="font-bold text-lg" style={{ color: '#2563eb' }}>{totalDefense}</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}>
                <div className="text-xs mb-1" style={{ color: '#7a7a7a' }}>速度</div>
                <div className="font-bold text-lg" style={{ color: '#16a34a' }}>{totalAgility}</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
                <div className="text-xs mb-1" style={{ color: '#7a7a7a' }}>银两</div>
                <div className="font-bold text-lg" style={{ color: '#c9a227' }}>{player.gold}</div>
              </div>
            </div>
            <div className="mt-3 p-2 rounded" style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7a7a' }}>气血上限</div>
              <div className="font-bold text-lg" style={{ color: '#1e40af' }}>{player.combatStats.maxHP}</div>
              <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                (100 + 体质 {player.attributes.constitution} x 10 = {100 + player.attributes.constitution * 10})
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-serif font-bold mb-3" style={{ color: '#1a1a1a' }}>防御减免说明</h3>
            <div className="text-sm space-y-2" style={{ color: '#4a4a4a' }}>
              <p>• 主动防御时，可额外减免 <span className="font-bold" style={{ color: '#16a34a' }}>根骨 x 0.5</span> 点伤害</p>
              <p>• 你当前的防御减免：<span className="font-bold" style={{ color: '#16a34a' }}>{Math.floor(totalDefense * 0.5)}</span> 点</p>
              <p>• 防御可随时使用，不需要等待速度条</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
