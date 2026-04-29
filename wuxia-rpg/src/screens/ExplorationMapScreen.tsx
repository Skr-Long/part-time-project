import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../hooks/useGame';
import { DEFAULT_LOCATIONS } from '../hooks/useInitialState';
import { ENEMIES } from '../data/enemies';
import { HPBar } from '../components/ui/HPBar';
import { CurrencyDisplay } from '../components/ui/CurrencyDisplay';
import { getScaledEnemy } from '../data/enemies';
import type { Location, SubLocation, CharacterInteraction } from '../types';

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

function getSubLocationTypeIcon(type: string): string {
  switch (type) {
    case 'inn': return '🏨';
    case 'blacksmith': return '⚒️';
    case 'martial_hall': return '🥋';
    case 'shop': return '🏪';
    case 'clinic': return '🏥';
    case 'tavern': return '🍺';
    case 'stable': return '🐴';
    case 'temple': return '⛩️';
    default: return '📍';
  }
}

function getInteractionIcon(type: string): string {
  switch (type) {
    case 'talk': return '💬';
    case 'shop': return '🛒';
    case 'quest': return '📜';
    case 'train': return '⚔️';
    case 'heal': return '💊';
    case 'rest': return '😴';
    default: return '👆';
  }
}

export function ExplorationMapScreen() {
  const dispatch = useGameDispatch();
  const currentLocation = useGameSelector(s => s.location);
  const player = useGameSelector(s => s.player);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState<SubLocation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const visitedLocationIds = player.visitedLocations || [];

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleLocationClick = (location: Location) => {
    const isAccessible = currentLocation?.connections.includes(location.id);
    const isCurrent = currentLocation?.id === location.id;
    const isVisited = visitedLocationIds.includes(location.id) || location.id === 'village';
    
    if (isCurrent) return;
    if (!isAccessible) {
      showNotification('此地点不连通，无法直接前往');
      return;
    }

    if (!isVisited) {
      showNotification(`发现新地点：${location.nameCN}！`);
    }

    dispatch({ type: 'MOVE_TO_LOCATION', payload: { locationId: location.id } });
    setSelectedSubLocation(null);
  };

  const handleRest = () => {
    if (!currentLocation) return;
    if (player.gold >= (currentLocation.restCost || 50)) {
      dispatch({ type: 'MODIFY_GOLD', payload: { amount: -(currentLocation.restCost || 50) } });
      dispatch({ type: 'REST_AT_LOCATION' });
      showNotification('休息完毕，生命已恢复！');
    } else {
      showNotification('铜钱不足，无法休息');
    }
  };

  const handleExplore = () => {
    if (!currentLocation?.encounterPool || currentLocation.encounterPool.length === 0) {
      showNotification('此处没有可以探索的内容');
      return;
    }
    const chance = (currentLocation.encounterChance || 30) * (1 + (player.attributes.luck + 5) / 50);
    if (Math.random() * 100 > chance) {
      showNotification('四处查看了一番，没有发现什么特别的...');
      return;
    }
    const enemyId = currentLocation.encounterPool[Math.floor(Math.random() * currentLocation.encounterPool.length)];
    const enemy = getScaledEnemy(enemyId, player.level);
    dispatch({ type: 'START_COMBAT', payload: { enemy } });
  };

  const handleInteraction = (interaction: CharacterInteraction, source: 'character' | 'subLocation') => {
    switch (interaction.type) {
      case 'rest':
        const subLoc = selectedSubLocation;
        const cost = subLoc?.restCost || currentLocation?.restCost || 30;
        if (player.gold >= cost) {
          dispatch({ type: 'MODIFY_GOLD', payload: { amount: -cost } });
          dispatch({ type: 'REST_AT_LOCATION' });
          showNotification('休息完毕，生命已恢复！');
        } else {
          showNotification('铜钱不足，无法休息');
        }
        break;
      case 'talk':
        showNotification(`与${currentLocation?.character?.nameCN || 'NPC'}交谈中...`);
        break;
      case 'train':
        showNotification('开始切磋武艺...');
        dispatch({ type: 'ADD_EXP', payload: { amount: 10 } });
        break;
      case 'heal':
        if (player.gold >= 20) {
          dispatch({ type: 'MODIFY_GOLD', payload: { amount: -20 } });
          dispatch({ type: 'REST_AT_LOCATION' });
          showNotification('大夫为你诊断治疗，生命已恢复！');
        } else {
          showNotification('铜钱不足，无法治疗');
        }
        break;
      case 'shop':
        showNotification('打开商店...');
        break;
      case 'quest':
        showNotification('查看任务中...');
        break;
      default:
        showNotification(`执行: ${interaction.label}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f5f0e6' }}>
      {notification && (
        <div
          className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-lg shadow-2xl animate-fade-in"
          style={{
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(26, 26, 26, 0.9)',
            color: '#f5f0e6',
            border: '1px solid #c9a227',
          }}
        >
          {notification}
        </div>
      )}

      <div 
        className="w-1/2 border-r overflow-hidden flex flex-col"
        style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.02)' }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>🗺️ 江湖地图</h2>
          <p className="text-sm mt-1" style={{ color: '#7a7a7a' }}>点击已探索的地点移动，悬停查看详情</p>
        </div>
        
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
          <svg 
            width="500" 
            height="300" 
            viewBox="0 0 500 300"
            className="max-w-full max-h-full"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
              </filter>
            </defs>

            {DEFAULT_LOCATIONS.map(loc => {
              return loc.connections.map(connId => {
                const conn = DEFAULT_LOCATIONS.find(l => l.id === connId);
                if (!conn || loc.id > connId) return null;
                
                const locIsVisited = visitedLocationIds.includes(loc.id) || loc.id === 'village';
                const connIsVisited = visitedLocationIds.includes(conn.id) || conn.id === 'village';
                const bothVisited = locIsVisited && connIsVisited;
                
                const x1 = loc.position.x;
                const y1 = loc.position.y;
                const x2 = conn.position.x;
                const y2 = conn.position.y;
                
                return (
                  <g key={`${loc.id}-${connId}`}>
                    {bothVisited ? (
                      <>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#c9a227"
                          strokeWidth="3"
                          strokeDasharray="8,4"
                          opacity="0.8"
                        />
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#fbbf24"
                          strokeWidth="1"
                          strokeDasharray="8,4"
                        />
                      </>
                    ) : (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#d1d5db"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        opacity="0.5"
                      />
                    )}
                  </g>
                );
              });
            })}

            {DEFAULT_LOCATIONS.map(location => {
              const isVisited = visitedLocationIds.includes(location.id) || location.id === 'village';
              const isCurrent = currentLocation?.id === location.id;
              const isConnected = currentLocation?.connections.includes(location.id);
              const isHovered = hoveredLocation?.id === location.id;
              const color = getLocationTypeColor(location.type);
              
              const radius = isCurrent ? 32 : (isHovered ? 30 : 26);
              const canClick = isConnected && !isCurrent;
              
              return (
                <g 
                  key={location.id}
                  transform={`translate(${location.position.x}, ${location.position.y})`}
                  style={{ cursor: canClick ? 'pointer' : 'default' }}
                  onMouseEnter={() => setHoveredLocation(location)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => handleLocationClick(location)}
                >
                  {isCurrent && (
                    <>
                      <circle
                        r={radius + 12}
                        fill="none"
                        stroke="#c9a227"
                        strokeWidth="2"
                        opacity="0.3"
                        filter="url(#glow)"
                      >
                        <animate
                          attributeName="r"
                          values={`${radius + 8};${radius + 16};${radius + 8}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0.2;0.5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        r={radius + 6}
                        fill="none"
                        stroke="#c9a227"
                        strokeWidth="3"
                        opacity="0.6"
                      />
                    </>
                  )}
                  
                  {isHovered && (
                    <circle
                      r={radius + 4}
                      fill={color}
                      opacity="0.2"
                    />
                  )}

                  {isVisited ? (
                    <>
                      <circle
                        r={radius}
                        fill={isCurrent ? '#fef3c7' : '#fff'}
                        stroke={isCurrent ? '#c9a227' : (isConnected ? color : '#9ca3af')}
                        strokeWidth={isCurrent ? 4 : 2}
                        filter="url(#shadow)"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="22"
                        y="-2"
                      >
                        {getLocationTypeIcon(location.type)}
                      </text>
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={radius + 16}
                        fontSize="12"
                        fontWeight={isCurrent ? 'bold' : 'normal'}
                        fill={isCurrent ? '#92400e' : '#4a4a4a'}
                      >
                        {location.nameCN}
                      </text>
                      {isCurrent && (
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          y={radius + 30}
                          fontSize="10"
                          fill="#c9a227"
                          fontWeight="bold"
                        >
                          当前位置
                        </text>
                      )}
                      {canClick && (
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          y={radius + 30}
                          fontSize="9"
                          fill="#4a7c59"
                        >
                          点击前往
                        </text>
                      )}
                    </>
                  ) : (
                    <>
                      <circle
                        r={radius}
                        fill="#e5e7eb"
                        stroke="#d1d5db"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="18"
                        opacity="0.5"
                      >
                        ❓
                      </text>
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={radius + 16}
                        fontSize="10"
                        fill="#9ca3af"
                      >
                        未探索
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {hoveredLocation && (
            <div
              className="absolute z-10 p-3 rounded-lg shadow-xl border"
              style={{
                left: Math.min(Math.max(hoveredLocation.position.x + 40, 10), 350),
                top: Math.min(Math.max(hoveredLocation.position.y - 60, 10), 200),
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderColor: getLocationTypeColor(hoveredLocation.type),
                borderWidth: '2px',
                minWidth: '200px',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getLocationTypeIcon(hoveredLocation.type)}</span>
                <div>
                  <span className="font-serif font-bold" style={{ color: '#1a1a1a' }}>
                    {visitedLocationIds.includes(hoveredLocation.id) || hoveredLocation.id === 'village' 
                      ? hoveredLocation.nameCN 
                      : '???'}
                  </span>
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: getLocationTypeColor(hoveredLocation.type) + '20',
                      color: getLocationTypeColor(hoveredLocation.type),
                    }}
                  >
                    {getLocationTypeLabel(hoveredLocation.type)}
                  </span>
                </div>
              </div>
              
              {(visitedLocationIds.includes(hoveredLocation.id) || hoveredLocation.id === 'village') && (
                <>
                  <p className="text-xs mb-2" style={{ color: '#7a7a7a' }}>
                    {hoveredLocation.descriptionCN}
                  </p>
                  
                  {hoveredLocation.subLocations && hoveredLocation.subLocations.length > 0 && (
                    <div className="mb-2 p-2 rounded text-xs" style={{ backgroundColor: 'rgba(74, 124, 89, 0.05)' }}>
                      <span className="font-bold" style={{ color: '#4a7c59' }}>📍 地点: </span>
                      <span style={{ color: '#4a4a4a' }}>
                        {hoveredLocation.subLocations.map(s => s.nameCN).join('、')}
                      </span>
                    </div>
                  )}
                  
                  {hoveredLocation.character && (
                    <div className="mb-2 p-2 rounded text-xs" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
                      <span className="font-bold" style={{ color: '#c9a227' }}>👤 人物: </span>
                      <span style={{ color: '#4a4a4a' }}>{hoveredLocation.character.nameCN}</span>
                    </div>
                  )}
                  
                  {hoveredLocation.encounterPool && hoveredLocation.encounterPool.length > 0 && (
                    <div className="p-2 rounded text-xs" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                      <span className="font-bold" style={{ color: '#dc2626' }}>👹 敌人: </span>
                      <span style={{ color: '#4a4a4a' }}>
                        {hoveredLocation.encounterPool.map(id => ENEMIES[id]?.nameCN || '???').join('、')}
                      </span>
                    </div>
                  )}
                  
                  {currentLocation?.connections.includes(hoveredLocation.id) && currentLocation.id !== hoveredLocation.id && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
                      <span className="text-xs font-bold" style={{ color: '#4a7c59' }}>💡 点击可前往此地点</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t flex justify-center gap-4 text-xs" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <div className="flex items-center gap-1">
            <span style={{ color: '#16a34a' }}>●</span>
            <span style={{ color: '#7a7a7a' }}>村庄</span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: '#65a30d' }}>●</span>
            <span style={{ color: '#7a7a7a' }}>野外</span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: '#dc2626' }}>●</span>
            <span style={{ color: '#7a7a7a' }}>地宫</span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: '#8b5cf6' }}>●</span>
            <span style={{ color: '#7a7a7a' }}>城市</span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: '#c9a227' }}>◉</span>
            <span style={{ color: '#7a7a7a' }}>当前位置</span>
          </div>
        </div>
      </div>

      <div className="w-1/2 overflow-y-auto flex flex-col">
        {currentLocation ? (
          <>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{getLocationTypeIcon(currentLocation.type)}</span>
                <div>
                  <h2 className="text-2xl font-serif" style={{ color: '#1a1a1a' }}>{currentLocation.nameCN}</h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: getLocationTypeColor(currentLocation.type) + '20',
                      color: getLocationTypeColor(currentLocation.type),
                    }}
                  >
                    {getLocationTypeLabel(currentLocation.type)} · 区域 {currentLocation.zone}
                  </span>
                </div>
              </div>
              <p style={{ color: '#4a4a4a' }}>{currentLocation.descriptionCN}</p>
            </div>

            <div className="p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
              <HPBar current={player.combatStats.currentHP} max={player.combatStats.maxHP} />
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)' }}>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>等级</div>
                  <div className="font-bold" style={{ color: '#1e40af' }}>Lv.{player.level}</div>
                </div>
                <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>经验</div>
                  <div className="font-bold" style={{ color: '#c9a227' }}>{player.exp}/{player.expToNext}</div>
                </div>
                <div className="p-2 rounded text-center">
                  <CurrencyDisplay copper={player.gold} />
                </div>
              </div>
            </div>

            {currentLocation.subLocations && currentLocation.subLocations.length > 0 && (
              <div className="p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#7a7a7a' }}>📍 可前往的地点</h3>
                <div className="grid grid-cols-2 gap-2">
                  {currentLocation.subLocations.map(subLoc => (
                    <button
                      key={subLoc.id}
                      onClick={() => setSelectedSubLocation(selectedSubLocation?.id === subLoc.id ? null : subLoc)}
                      className="p-3 rounded-lg transition-all text-left"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: selectedSubLocation?.id === subLoc.id ? '#c9a227' : 'rgba(122, 122, 122, 0.3)',
                        backgroundColor: selectedSubLocation?.id === subLoc.id ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{subLoc.icon}</span>
                        <div>
                          <div className="font-bold" style={{ color: '#1a1a1a' }}>{subLoc.nameCN}</div>
                          <div className="text-xs" style={{ color: '#7a7a7a' }}>{subLoc.descriptionCN}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedSubLocation && (
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(201, 162, 39, 0.05)', border: '1px solid rgba(201, 162, 39, 0.3)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{selectedSubLocation.icon}</span>
                      <div>
                        <h4 className="font-bold" style={{ color: '#c9a227' }}>{selectedSubLocation.nameCN}</h4>
                        <p className="text-xs" style={{ color: '#7a7a7a' }}>{selectedSubLocation.descriptionCN}</p>
                      </div>
                    </div>
                    
                    {selectedSubLocation.interactions && selectedSubLocation.interactions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubLocation.interactions.map((interaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleInteraction(interaction, 'subLocation')}
                            disabled={interaction.disabled}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            style={{
                              backgroundColor: interaction.disabled ? '#e5e7eb' : '#1a1a1a',
                              color: interaction.disabled ? '#9ca3af' : '#f5f0e6',
                              cursor: interaction.disabled ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <span>{getInteractionIcon(interaction.type)}</span>
                            <span>{interaction.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentLocation.character && (
              <div className="p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#7a7a7a' }}>👤 此地点的人物</h3>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    borderColor: 'rgba(201, 162, 39, 0.5)',
                    borderWidth: '2px',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">🧙</span>
                    <div>
                      <p className="font-bold text-lg" style={{ color: '#c9a227' }}>{currentLocation.character.nameCN}</p>
                      <p className="text-sm" style={{ color: '#4a4a4a' }}>{currentLocation.character.descriptionCN}</p>
                    </div>
                  </div>
                  
                  {currentLocation.character.interactions && currentLocation.character.interactions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentLocation.character.interactions.map((interaction, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleInteraction(interaction, 'character')}
                          disabled={interaction.disabled}
                          className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          style={{
                            backgroundColor: interaction.disabled ? '#e5e7eb' : '#c9a227',
                            color: interaction.disabled ? '#9ca3af' : '#fff',
                            cursor: interaction.disabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <span>{getInteractionIcon(interaction.type)}</span>
                          <span>{interaction.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 flex-1">
              <div className="flex flex-col gap-3">
                {currentLocation.locationType === 'rest' && (
                  <button
                    onClick={handleRest}
                    disabled={player.gold < (currentLocation.restCost || 50)}
                    className="w-full px-6 py-4 rounded-lg transition-colors text-lg font-serif flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: player.gold < (currentLocation.restCost || 50) ? '#9ca3af' : '#4a7c59',
                      color: '#fff',
                      opacity: player.gold < (currentLocation.restCost || 50) ? 0.5 : 1,
                      cursor: player.gold < (currentLocation.restCost || 50) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span>🛏️</span>
                    <span>休息恢复 (消耗 {currentLocation.restCost || 50} 铜钱)</span>
                  </button>
                )}
                
                {currentLocation.locationType === 'encounter' && (
                  <button
                    onClick={handleExplore}
                    className="w-full px-6 py-4 rounded-lg transition-colors text-lg font-serif flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: '#f5f0e6',
                    }}
                  >
                    <span>🔍</span>
                    <span>探索 (可能遭遇敌人)</span>
                  </button>
                )}

                {currentLocation.encounterPool && currentLocation.encounterPool.length > 0 && (
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', borderColor: 'rgba(220, 38, 38, 0.2)' }}>
                    <h4 className="text-sm font-bold mb-2" style={{ color: '#dc2626' }}>👹 此区域可能遇到的敌人:</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentLocation.encounterPool.map(enemyId => {
                        const enemy = ENEMIES[enemyId];
                        const encountered = player.monsterBook.find(m => m.enemyId === enemyId)?.encountered;
                        return (
                          <span
                            key={enemyId}
                            className="text-sm px-3 py-1 rounded"
                            style={{
                              backgroundColor: encountered ? 'rgba(220, 38, 38, 0.1)' : 'rgba(122, 122, 122, 0.1)',
                              color: encountered ? '#dc2626' : '#9ca3af',
                            }}
                          >
                            {encountered ? enemy?.nameCN : '???'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center" style={{ color: '#7a7a7a' }}>
              <span className="text-4xl">📍</span>
              <p className="mt-2">选择一个地点开始探索</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
