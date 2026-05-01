import { useState, useCallback } from 'react';
import { useGameSelector, useGameDispatch } from '../hooks/useGame';
import { DEFAULT_LOCATIONS } from '../hooks/useInitialState';
import { ENEMIES } from '../data/enemies';
import { HPBar } from '../components/ui/HPBar';
import { CurrencyDisplay } from '../components/ui/CurrencyDisplay';
import { getScaledEnemy } from '../data/enemies';
import { getEventsByLocation } from '../data/events';
import type { Location, SubLocation, CharacterInteraction, EventRequirements } from '../types';

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

function getInteractionIcon(type: string): string {
  switch (type) {
    case 'talk': return '💬';
    case 'shop': return '🛒';
    case 'craft': return '⚒️';
    case 'quest': return '📜';
    case 'train': return '⚔️';
    case 'heal': return '💊';
    case 'rest': return '😴';
    default: return '👆';
  }
}

const MAP_VIEWBOX_WIDTH = 800;
const MAP_VIEWBOX_HEIGHT = 500;

export function ExplorationMapScreen() {
  const dispatch = useGameDispatch();
  const currentLocation = useGameSelector(s => s.location);
  const player = useGameSelector(s => s.player);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState<SubLocation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

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
    
    if (!isAccessible && !isVisited) {
      showNotification('此地点未探索，无法直接前往');
      return;
    }

    const { canAccess, reason } = checkRequirements(location.requirements);
    if (!canAccess) {
      showNotification(`无法前往${location.nameCN}：${reason}`);
      return;
    }

    if (!isVisited) {
      showNotification(`发现新地点：${location.nameCN}！`);
    } else if (!isAccessible) {
      showNotification(`传送至：${location.nameCN}`);
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

  const handleDirectCombat = (enemyId: string) => {
    const enemy = getScaledEnemy(enemyId, player.level);
    dispatch({ type: 'START_COMBAT', payload: { enemy } });
  };

  const checkRequirements = (requirements: EventRequirements | undefined): { canAccess: boolean; reason: string } => {
    if (!requirements) return { canAccess: true, reason: '' };
    
    if (requirements.minLevel && player.level < requirements.minLevel) {
      return { canAccess: false, reason: `需要等级 ${requirements.minLevel}` };
    }
    
    if (requirements.maxLevel && player.level > requirements.maxLevel) {
      return { canAccess: false, reason: `等级不能超过 ${requirements.maxLevel}` };
    }
    
    if (requirements.requiredAttributes) {
      for (const [attr, value] of Object.entries(requirements.requiredAttributes)) {
        if (player.attributes[attr as keyof typeof player.attributes] < (value as number)) {
          const attrLabels: Record<string, string> = {
            insight: '悟性', constitution: '体质', strength: '力量',
            agility: '敏捷', physique: '根骨', luck: '福缘',
          };
          return { canAccess: false, reason: `需要 ${attrLabels[attr] || attr} ${value}` };
        }
      }
    }
    
    if (requirements.notCompletedEvents) {
      for (const eventId of requirements.notCompletedEvents) {
        if (player.completedEvents.includes(eventId)) {
          return { canAccess: false, reason: '已完成相关事件' };
        }
      }
    }
    
    return { canAccess: true, reason: '' };
  };

  const handleExplore = () => {
    if (!currentLocation) return;

    const locationEvents = getEventsByLocation(currentLocation.id);
    
    const availableEvents = locationEvents.filter(event => {
      if (event.isExclusive && player.completedEvents.includes(event.id)) {
        return false;
      }
      
      if (event.prerequisiteEvents) {
        for (const prereq of event.prerequisiteEvents) {
          if (!player.completedEvents.includes(prereq)) {
            return false;
          }
        }
      }
      
      const { canAccess } = checkRequirements({
        minLevel: event.triggerCondition.minVisits ? undefined : undefined,
        ...event,
      } as EventRequirements);
      
      return canAccess;
    });

    const baseEventChance = 30;
    const luckBonus = (player.attributes.luck + 5) / 50;
    const eventChance = baseEventChance * (1 + luckBonus);
    
    if (Math.random() * 100 > eventChance) {
      showNotification('四处查看了一番，没有发现什么特别的...');
      return;
    }

    if (availableEvents.length === 0) {
      showNotification('此地似乎没有什么特别的事情发生...');
      return;
    }

    const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    if (selectedEvent.requirements) {
      const { canAccess, reason } = checkRequirements(selectedEvent.requirements);
      if (!canAccess) {
        showNotification(`无法触发此事件：${reason}`);
        return;
      }
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `🎭 触发事件：${selectedEvent.nameCN}` } });
    
    if (selectedEvent.actions && selectedEvent.actions.length > 0) {
      for (const action of selectedEvent.actions) {
        switch (action.type) {
          case 'startCombat':
            if (action.enemyId) {
              const enemy = getScaledEnemy(action.enemyId, player.level);
              dispatch({ type: 'START_COMBAT', payload: { enemy } });
            }
            break;
          case 'modifyAttribute':
            if (action.attribute && action.value !== undefined) {
              dispatch({ 
                type: 'UPDATE_ATTRIBUTE', 
                payload: { 
                  attribute: action.attribute, 
                  value: player.attributes[action.attribute] + action.value 
                } 
              });
            }
            break;
          case 'learnTechnique':
            if (action.techniqueId && !player.knownTechniques.includes(action.techniqueId)) {
              dispatch({ type: 'LEARN_TECHNIQUE', payload: { techniqueId: action.techniqueId } });
              showNotification(`学会了新武学！`);
            }
            break;
          case 'gainItem':
            if (action.item) {
              dispatch({ type: 'GAIN_ITEM', payload: { item: action.item } });
            }
            break;
          case 'gainGold':
            if (action.amount !== undefined) {
              dispatch({ type: 'MODIFY_GOLD', payload: { amount: action.amount } });
            }
            break;
        }
      }
    }

    if (selectedEvent.rewards) {
      if (selectedEvent.rewards.exp) {
        dispatch({ type: 'ADD_EXP', payload: { amount: selectedEvent.rewards.exp } });
      }
      if (selectedEvent.rewards.gold) {
        dispatch({ type: 'MODIFY_GOLD', payload: { amount: selectedEvent.rewards.gold } });
      }
    }

    if (selectedEvent.isExclusive) {
      dispatch({ type: 'COMPLETE_EVENT', payload: { eventId: selectedEvent.id } });
    }

    showNotification(`✨ ${selectedEvent.descriptionCN}`);
  };

  const handleInteraction = (interaction: CharacterInteraction) => {
    if (interaction.dialogId) {
      dispatch({
        type: 'OPEN_MODAL',
        payload: {
          modalType: 'dialog',
          data: {
            dialogId: interaction.dialogId,
            characterName: currentLocation?.character?.nameCN || 'NPC',
          },
        },
      });
      return;
    }
    
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
        const shopInventory = selectedSubLocation?.shopInventory || currentLocation?.character?.shopInventory;
        if (shopInventory && shopInventory.length > 0) {
          dispatch({ 
            type: 'OPEN_MODAL', 
            payload: { 
              modalType: 'shop', 
              data: { 
                shopInventory, 
                shopName: selectedSubLocation?.nameCN || currentLocation?.character?.nameCN || '商店' 
              } 
            } 
          });
        } else {
          showNotification('此商店暂无商品');
        }
        break;
      case 'craft':
        dispatch({ type: 'OPEN_MODAL', payload: { modalType: 'craft' } });
        break;
      case 'quest':
        showNotification('查看任务中...');
        break;
      default:
        showNotification(`执行: ${interaction.label}`);
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
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
        className="w-3/5 border-r overflow-hidden flex flex-col"
        style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.02)' }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <div>
            <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>🗺️ 江湖地图</h2>
            <p className="text-sm mt-1" style={{ color: '#7a7a7a' }}>点击已探索地点可传送，鼠标拖拽平移，滚轮缩放</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(prev => Math.min(2, prev + 0.2))}
              className="w-8 h-8 rounded flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(26, 26, 26, 0.1)', color: '#4a4a4a' }}
            >
              +
            </button>
            <span className="text-sm" style={{ color: '#7a7a7a' }}>{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
              className="w-8 h-8 rounded flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(26, 26, 26, 0.1)', color: '#4a4a4a' }}
            >
              −
            </button>
            <button
              onClick={resetView}
              className="ml-2 px-3 py-1 rounded text-sm"
              style={{ backgroundColor: 'rgba(201, 162, 39, 0.2)', color: '#c9a227' }}
            >
              重置
            </button>
          </div>
        </div>
        
        <div 
          className="flex-1 relative overflow-hidden flex items-center justify-center p-4 cursor-grab"
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`}
            className="max-w-full max-h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
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
              
              const radius = isCurrent ? 28 : (isHovered ? 26 : 22);
              const canClick = (isConnected || isVisited) && !isCurrent;
              
              return (
                <g 
                  key={location.id}
                  transform={`translate(${location.position.x}, ${location.position.y})`}
                  style={{ cursor: canClick ? 'pointer' : (isPanning ? 'grabbing' : 'grab') }}
                  onMouseEnter={(e) => { e.stopPropagation(); setHoveredLocation(location); }}
                  onMouseLeave={(e) => { e.stopPropagation(); setHoveredLocation(null); }}
                  onClick={(e) => { e.stopPropagation(); handleLocationClick(location); }}
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
                        stroke={isCurrent ? '#c9a227' : (isConnected ? color : (isVisited ? color : '#9ca3af'))}
                        strokeWidth={isCurrent ? 4 : 2}
                        filter="url(#shadow)"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="18"
                        y="-2"
                      >
                        {getLocationTypeIcon(location.type)}
                      </text>
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={radius + 14}
                        fontSize="11"
                        fontWeight={isCurrent ? 'bold' : 'normal'}
                        fill={isCurrent ? '#92400e' : '#4a4a4a'}
                      >
                        {location.nameCN}
                      </text>
                      {isCurrent && (
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          y={radius + 26}
                          fontSize="8"
                          fill="#c9a227"
                          fontWeight="bold"
                        >
                          当前位置
                        </text>
                      )}
                      {canClick && !isConnected && (
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          y={radius + 26}
                          fontSize="8"
                          fill="#8b5cf6"
                        >
                          已探索
                        </text>
                      )}
                      {canClick && isConnected && (
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          y={radius + 26}
                          fontSize="8"
                          fill="#4a7c59"
                        >
                          相邻
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
                        fontSize="16"
                        opacity="0.5"
                      >
                        ❓
                      </text>
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={radius + 14}
                        fontSize="9"
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
                left: '50%',
                top: '10%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderColor: getLocationTypeColor(hoveredLocation.type),
                borderWidth: '2px',
                minWidth: '250px',
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
                  
                  {currentLocation?.id !== hoveredLocation.id && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
                      {currentLocation?.connections.includes(hoveredLocation.id) && (
                        <span className="text-xs font-bold" style={{ color: '#4a7c59' }}>💡 此地点与当前位置相邻</span>
                      )}
                      {!currentLocation?.connections.includes(hoveredLocation.id) && visitedLocationIds.includes(hoveredLocation.id) && (
                        <span className="text-xs font-bold" style={{ color: '#8b5cf6' }}>💡 点击可传送至此地点</span>
                      )}
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

      <div className="w-2/5 overflow-y-auto flex flex-col">
        {currentLocation ? (
          <>
            <div className="p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getLocationTypeIcon(currentLocation.type)}</span>
                <div>
                  <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>{currentLocation.nameCN}</h2>
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
              <p className="text-sm" style={{ color: '#4a4a4a' }}>{currentLocation.descriptionCN}</p>
            </div>

            <div className="p-3 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
              <HPBar current={player.combatStats.currentHP} max={player.combatStats.maxHP} />
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)' }}>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>等级</div>
                  <div className="font-bold" style={{ color: '#1e40af' }}>Lv.{player.level}</div>
                </div>
                <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>经验</div>
                  <div className="font-bold text-xs" style={{ color: '#c9a227' }}>{player.exp}/{player.expToNext}</div>
                </div>
                <div className="p-2 rounded text-center">
                  <CurrencyDisplay copper={player.gold} />
                </div>
              </div>
            </div>

            {currentLocation.subLocations && currentLocation.subLocations.length > 0 && (
              <div className="p-3 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7a7a7a' }}>📍 可前往的地点</h3>
                <div className="grid grid-cols-2 gap-2">
                  {currentLocation.subLocations.map(subLoc => (
                    <button
                      key={subLoc.id}
                      onClick={() => setSelectedSubLocation(selectedSubLocation?.id === subLoc.id ? null : subLoc)}
                      className="p-2 rounded-lg transition-all text-left"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: selectedSubLocation?.id === subLoc.id ? '#c9a227' : 'rgba(122, 122, 122, 0.3)',
                        backgroundColor: selectedSubLocation?.id === subLoc.id ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{subLoc.icon}</span>
                        <div>
                          <div className="font-bold text-sm" style={{ color: '#1a1a1a' }}>{subLoc.nameCN}</div>
                          <div className="text-xs" style={{ color: '#7a7a7a' }}>{subLoc.descriptionCN}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedSubLocation && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(201, 162, 39, 0.05)', border: '1px solid rgba(201, 162, 39, 0.3)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{selectedSubLocation.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: '#c9a227' }}>{selectedSubLocation.nameCN}</h4>
                        <p className="text-xs" style={{ color: '#7a7a7a' }}>{selectedSubLocation.descriptionCN}</p>
                      </div>
                    </div>
                    
                    {selectedSubLocation.interactions && selectedSubLocation.interactions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubLocation.interactions.map((interaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleInteraction(interaction)}
                            disabled={interaction.disabled}
                            className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm"
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
              <div className="p-3 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7a7a7a' }}>👤 此地点的人物</h3>
                <div 
                  className="p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    borderColor: 'rgba(201, 162, 39, 0.5)',
                    borderWidth: '2px',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🧙</span>
                    <div>
                      <p className="font-bold" style={{ color: '#c9a227' }}>{currentLocation.character.nameCN}</p>
                      <p className="text-xs" style={{ color: '#4a4a4a' }}>{currentLocation.character.descriptionCN}</p>
                    </div>
                  </div>
                  
                  {currentLocation.character.interactions && currentLocation.character.interactions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentLocation.character.interactions.map((interaction, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleInteraction(interaction)}
                          disabled={interaction.disabled}
                          className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm"
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

            <div className="p-3 flex-1">
              <div className="flex flex-col gap-3">
                {currentLocation.locationType === 'rest' && (
                  <button
                    onClick={handleRest}
                    disabled={player.gold < (currentLocation.restCost || 50)}
                    className="w-full px-4 py-3 rounded-lg transition-colors text-base font-serif flex items-center justify-center gap-2"
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
                  <>
                    {currentLocation.encounterPool && currentLocation.encounterPool.length > 0 && (
                      <div className="p-3 rounded-lg border" style={{ backgroundColor: 'rgba(220, 38, 38, 0.03)', borderColor: 'rgba(220, 38, 38, 0.3)' }}>
                        <h4 className="text-sm font-bold mb-2" style={{ color: '#dc2626' }}>⚔️ 可挑战的敌人</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentLocation.encounterPool.map(enemyId => {
                            const enemy = ENEMIES[enemyId];
                            const encountered = player.monsterBook.find(m => m.enemyId === enemyId)?.encountered;
                            const defeated = (player.monsterBook.find(m => m.enemyId === enemyId)?.defeated || 0) > 0;
                            
                            return (
                              <button
                                key={enemyId}
                                onClick={() => handleDirectCombat(enemyId)}
                                className="px-3 py-2 rounded-lg transition-all flex items-center gap-1 text-sm"
                                style={{
                                  backgroundColor: defeated ? '#16a34a' : (encountered ? '#dc2626' : '#9ca3af'),
                                  color: '#fff',
                                  cursor: 'pointer',
                                }}
                              >
                                <span>👹</span>
                                <span>{enemy?.nameCN}</span>
                                {defeated && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleExplore}
                      className="w-full px-4 py-3 rounded-lg transition-colors text-base font-serif flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: '#8b5cf6',
                        color: '#fff',
                      }}
                    >
                      <span>🔍</span>
                      <span>探索 (触发事件或奇遇)</span>
                    </button>
                  </>
                )}

                {currentLocation.encounterPool && currentLocation.encounterPool.length > 0 && (
                  <div className="p-3 rounded-lg border" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', borderColor: 'rgba(220, 38, 38, 0.2)' }}>
                    <h4 className="text-xs font-bold mb-2" style={{ color: '#dc2626' }}>📖 图鉴进度</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentLocation.encounterPool.map(enemyId => {
                        const enemy = ENEMIES[enemyId];
                        const entry = player.monsterBook.find(m => m.enemyId === enemyId);
                        const encountered = entry?.encountered;
                        const defeated = (entry?.defeated || 0) > 0;
                        return (
                          <span
                            key={enemyId}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: encountered ? (defeated ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)') : 'rgba(122, 122, 122, 0.1)',
                              color: encountered ? (defeated ? '#16a34a' : '#dc2626') : '#9ca3af',
                            }}
                          >
                            {encountered ? enemy?.nameCN : '???'}
                            {defeated && ' ✓'}
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
