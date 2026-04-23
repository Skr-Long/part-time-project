import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import { ENEMIES } from '../../data/enemies';

export default function MonsterBookModal() {
  const dispatch = useGameDispatch();
  const monsterBook = useGameSelector(state => state.player.monsterBook);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const allEnemies = Object.values(ENEMIES);

  const getEncounteredInfo = (enemyId: string) => {
    return monsterBook.find(m => m.enemyId === enemyId) || null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-lg flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
          maxHeight: '80vh',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>怪物图鉴</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#7a7a7a' }}>已发现</span>
            <span className="font-bold" style={{ color: '#c9a227' }}>
              {monsterBook.filter(m => m.encountered).length} / {allEnemies.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allEnemies.map(enemy => {
            const info = getEncounteredInfo(enemy.id);
            const isEncountered = info?.encountered || false;
            const isDefeated = (info?.defeated || 0) > 0;

            return (
              <div 
                key={enemy.id}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: isEncountered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(122, 122, 122, 0.1)',
                  borderColor: isEncountered 
                    ? (isDefeated ? '#16a34a' : '#f59e0b') 
                    : '#d1d5db',
                  opacity: isEncountered ? 1 : 0.5,
                }}
              >
                {isEncountered ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👹</span>
                        <div>
                          <span className="font-serif font-bold" style={{ color: '#1a1a1a' }}>{enemy.nameCN}</span>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#8b0000', color: '#fff' }}>
                            等级 {info?.levelSeen || enemy.level}
                          </span>
                        </div>
                      </div>
                      {isDefeated && (
                        <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#16a34a', color: '#fff' }}>
                          已击败 {info?.defeated} 次
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: '#4a4a4a' }}>{enemy.descriptionCN}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="p-1.5 rounded" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                        <span style={{ color: '#7a7a7a' }}>攻击</span>
                        <span className="ml-1 font-bold" style={{ color: '#dc2626' }}>
                          {10 + enemy.attributes.strength * 5 + enemy.level * 2}
                        </span>
                      </div>
                      <div className="p-1.5 rounded" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                        <span style={{ color: '#7a7a7a' }}>防御</span>
                        <span className="ml-1 font-bold" style={{ color: '#2563eb' }}>
                          {5 + enemy.attributes.physique * 3 + enemy.level * 1}
                        </span>
                      </div>
                      <div className="p-1.5 rounded" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}>
                        <span style={{ color: '#7a7a7a' }}>速度</span>
                        <span className="ml-1 font-bold" style={{ color: '#16a34a' }}>
                          {10 + enemy.attributes.agility * 2 + enemy.level * 1}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs" style={{ color: '#7a7a7a' }}>
                      经验奖励: <span className="font-bold" style={{ color: '#4a7c59' }}>{enemy.expReward}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <span className="text-4xl">❓</span>
                      <p className="mt-2" style={{ color: '#7a7a7a' }}>未发现的怪物</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
