import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import { DEFAULT_LOCATIONS } from '../../hooks/useInitialState';
import { ENEMIES } from '../../data/enemies';

type TabType = 'map' | 'characters' | 'monsters';

function getLocationTypeIcon(type: string): string {
  switch (type) {
    case 'city': return '🏛️';
    case 'village': return '🏘️';
    case 'wilderness': return '🌲';
    case 'dungeon': return '🕳️';
    case 'special': return '⭐';
    default: return '📍';
  }
}

function getLocationTypeLabel(type: string): string {
  switch (type) {
    case 'city': return '城市';
    case 'village': return '村庄';
    case 'wilderness': return '野外';
    case 'dungeon': return '地宫';
    case 'special': return '特殊';
    default: return '地点';
  }
}

function getLocationTypeColor(type: string): string {
  switch (type) {
    case 'city': return '#8b5cf6';
    case 'village': return '#16a34a';
    case 'wilderness': return '#65a30d';
    case 'dungeon': return '#dc2626';
    case 'special': return '#c9a227';
    default: return '#7a7a7a';
  }
}

export default function OverviewModal() {
  const dispatch = useGameDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const player = useGameSelector(state => state.player);
  const currentLocation = useGameSelector(state => state.location);
  const monsterBook = useGameSelector(state => state.player.monsterBook);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleMove = (locId: string) => {
    dispatch({ type: 'MOVE_TO_LOCATION', payload: { locationId: locId } });
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'map', label: '地图总览', icon: '🗺️' },
    { id: 'characters', label: '人物图鉴', icon: '👥' },
    { id: 'monsters', label: '怪物图鉴', icon: '👹' },
  ];

  const visitedLocationIds = player.visitedLocations || [];

  const characterLocations = DEFAULT_LOCATIONS.filter(loc => loc.character);

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
        className="w-full max-w-2xl flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
          maxHeight: '85vh',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
            <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        <div className="flex border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 px-4 transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: activeTab === tab.id ? 'rgba(201, 162, 39, 0.2)' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #c9a227' : '2px solid transparent',
                color: activeTab === tab.id ? '#c9a227' : '#7a7a7a',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              }}
            >
              <span>{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#7a7a7a' }}>已探索</span>
                  <span className="font-bold" style={{ color: '#4a7c59' }}>
                    {visitedLocationIds.length} / {DEFAULT_LOCATIONS.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {DEFAULT_LOCATIONS.map(location => {
                  const isVisited = visitedLocationIds.includes(location.id) || location.id === 'village';
                  const isCurrent = currentLocation?.id === location.id;
                  const connectedLocations = DEFAULT_LOCATIONS.filter(l => location.connections.includes(l.id));

                  return (
                    <div
                      key={location.id}
                      className="p-4 rounded-lg border transition-all"
                      style={{
                        backgroundColor: isVisited ? 'rgba(255, 255, 255, 0.8)' : 'rgba(122, 122, 122, 0.1)',
                        borderColor: isCurrent ? '#c9a227' : (isVisited ? 'rgba(122, 122, 122, 0.3)' : '#d1d5db'),
                        borderWidth: isCurrent ? '2px' : '1px',
                        opacity: isVisited ? 1 : 0.6,
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{isVisited ? getLocationTypeIcon(location.type) : '❓'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="font-serif font-bold"
                                style={{ color: isVisited ? '#1a1a1a' : '#7a7a7a' }}
                              >
                                {isVisited ? location.nameCN : '未探索的地点'}
                              </span>
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: getLocationTypeColor(location.type) + '20',
                                  color: getLocationTypeColor(location.type),
                                }}
                              >
                                {getLocationTypeLabel(location.type)}
                              </span>
                              {isCurrent && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded font-bold"
                                  style={{ backgroundColor: '#c9a227', color: '#fff' }}
                                >
                                  当前位置
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isVisited && (
                        <>
                          <p className="text-sm mb-3" style={{ color: '#4a4a4a' }}>
                            {location.descriptionCN}
                          </p>

                          {connectedLocations.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs mb-2" style={{ color: '#7a7a7a' }}>
                                可前往:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {connectedLocations.map(conn => {
                                  const connVisited = visitedLocationIds.includes(conn.id);
                                  return (
                                    <button
                                      key={conn.id}
                                      onClick={() => connVisited && handleMove(conn.id)}
                                      disabled={!connVisited}
                                      className="text-sm px-3 py-1 rounded transition-colors"
                                      style={{
                                        backgroundColor: connVisited ? 'rgba(26, 26, 26, 0.1)' : 'rgba(122, 122, 122, 0.1)',
                                        color: connVisited ? '#1a1a1a' : '#9ca3af',
                                        cursor: connVisited ? 'pointer' : 'not-allowed',
                                      }}
                                    >
                                      {connVisited ? conn.nameCN : '???'}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {location.character && (
                            <div
                              className="p-2 rounded text-sm"
                              style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)', border: '1px solid rgba(201, 162, 39, 0.3)' }}
                            >
                              <span className="font-bold" style={{ color: '#c9a227' }}>👤 人物: </span>
                              <span style={{ color: '#4a4a4a' }}>{location.character.nameCN}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="space-y-3">
              {characterLocations.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#7a7a7a' }}>
                  <span className="text-4xl">👤</span>
                  <p className="mt-2">暂无人物图鉴</p>
                </div>
              ) : (
                characterLocations.map(loc => {
                  const char = loc.character!;
                  const isVisited = visitedLocationIds.includes(loc.id) || loc.id === 'village';

                  return (
                    <div
                      key={char.id}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: isVisited ? 'rgba(255, 255, 255, 0.8)' : 'rgba(122, 122, 122, 0.1)',
                        borderColor: isVisited ? 'rgba(201, 162, 39, 0.5)' : '#d1d5db',
                        opacity: isVisited ? 1 : 0.6,
                      }}
                    >
                      {isVisited ? (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🧙</span>
                            <div>
                              <span className="font-serif font-bold text-lg" style={{ color: '#c9a227' }}>
                                {char.nameCN}
                              </span>
                              <div className="text-xs" style={{ color: '#7a7a7a' }}>
                                所在地: {loc.nameCN}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm" style={{ color: '#4a4a4a' }}>
                            {char.descriptionCN}
                          </p>
                          {char.shopInventory && char.shopInventory.length > 0 && (
                            <div
                              className="mt-2 p-2 rounded text-xs"
                              style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)', color: '#4a7c59' }}
                            >
                              🏪 商人 - 可在此处购买物品
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center py-4">
                          <div className="text-center">
                            <span className="text-4xl">❓</span>
                            <p className="mt-2" style={{ color: '#7a7a7a' }}>未发现的人物</p>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>探索更多地点来解锁</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'monsters' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 0, 0, 0.1)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#7a7a7a' }}>已发现</span>
                  <span className="font-bold" style={{ color: '#8b0000' }}>
                    {monsterBook.filter(m => m.encountered).length} / {allEnemies.length}
                  </span>
                </div>
              </div>

              {allEnemies.map(enemy => {
                const info = getEncounteredInfo(enemy.id);
                const isEncountered = info?.encountered || false;
                const isDefeated = (info?.defeated || 0) > 0;

                return (
                  <div
                    key={enemy.id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: isEncountered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(122, 122, 122, 0.1)',
                      borderColor: isEncountered
                        ? isDefeated
                          ? '#16a34a'
                          : '#f59e0b'
                        : '#d1d5db',
                      opacity: isEncountered ? 1 : 0.6,
                    }}
                  >
                    {isEncountered ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">👹</span>
                            <div>
                              <span className="font-serif font-bold" style={{ color: '#1a1a1a' }}>
                                {enemy.nameCN}
                              </span>
                              <span
                                className="ml-2 text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: '#8b0000', color: '#fff' }}
                              >
                                等级 {info?.levelSeen || enemy.level}
                              </span>
                            </div>
                          </div>
                          {isDefeated && (
                            <span
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{ backgroundColor: '#16a34a', color: '#fff' }}
                            >
                              已击败 {info?.defeated} 次
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-2" style={{ color: '#4a4a4a' }}>
                          {enemy.descriptionCN}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div
                            className="p-1.5 rounded"
                            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                          >
                            <span style={{ color: '#7a7a7a' }}>攻击</span>
                            <span className="ml-1 font-bold" style={{ color: '#dc2626' }}>
                              {10 + enemy.attributes.strength * 5 + enemy.level * 2}
                            </span>
                          </div>
                          <div
                            className="p-1.5 rounded"
                            style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
                          >
                            <span style={{ color: '#7a7a7a' }}>防御</span>
                            <span className="ml-1 font-bold" style={{ color: '#2563eb' }}>
                              {5 + enemy.attributes.physique * 3 + enemy.level * 1}
                            </span>
                          </div>
                          <div
                            className="p-1.5 rounded"
                            style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                          >
                            <span style={{ color: '#7a7a7a' }}>速度</span>
                            <span className="ml-1 font-bold" style={{ color: '#16a34a' }}>
                              {10 + enemy.attributes.agility * 2 + enemy.level * 1}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs" style={{ color: '#7a7a7a' }}>
                          经验奖励:{' '}
                          <span className="font-bold" style={{ color: '#4a7c59' }}>
                            {enemy.expReward}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                          <span className="text-4xl">❓</span>
                          <p className="mt-2" style={{ color: '#7a7a7a' }}>未发现的怪物</p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>探索更多地点来解锁</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
