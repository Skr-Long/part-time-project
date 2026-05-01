import { useGameDispatch, useGameSelector } from '../../contexts/GameContext';
import { getMartialArt } from '../../data/martialArts';
import { getScaledEnemy } from '../../data/enemies';
import type { InventoryItem, Attributes, GameState } from '../../types';

interface AttributeReward {
  attribute: keyof Attributes;
  value: number;
}

interface EventRewardModalData {
  eventName: string;
  eventDescription: string;
  message?: string;
  exp?: number;
  gold?: number;
  techniques?: string[];
  items?: InventoryItem[];
  attributes?: AttributeReward[];
  hasCombat?: boolean;
  enemyId?: string;
}

interface EventRewardModalProps {
  data: EventRewardModalData;
  onClose: () => void;
}

const attrLabels: Record<keyof Attributes, string> = {
  insight: '悟性',
  constitution: '体质',
  strength: '力量',
  agility: '敏捷',
  physique: '根骨',
  luck: '福缘',
};

export default function EventRewardModal({ data, onClose }: EventRewardModalProps) {
  const dispatch = useGameDispatch();
  const player = useGameSelector((state: GameState) => state.player);

  const hasRewards = data.exp || data.gold || (data.techniques && data.techniques.length > 0) || (data.items && data.items.length > 0) || (data.attributes && data.attributes.length > 0);

  const handleContinue = () => {
    if (data.hasCombat && data.enemyId) {
      const enemy = getScaledEnemy(data.enemyId, player.level);
      dispatch({ type: 'START_COMBAT', payload: { enemy } });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.85)' }}
    >
      <div
        className="w-full max-w-md bg-white/95 rounded-xl shadow-2xl p-8 text-center"
        style={{ borderWidth: '3px', borderColor: '#c9a227' }}
      >
        <div className="text-5xl mb-4">🎁</div>
        <h2 className="text-2xl font-serif font-bold mb-2" style={{ color: '#c9a227' }}>
          {data.eventName}
        </h2>
        <p className="text-sm mb-4" style={{ color: '#7a7a7a' }}>
          {data.eventDescription}
        </p>

        {data.message && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 240, 230, 0.8)' }}>
            <p className="text-sm" style={{ color: '#4a4a4a', lineHeight: 1.6 }}>
              {data.message}
            </p>
          </div>
        )}

        {hasRewards && (
          <>
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
              <h3 className="font-bold mb-3" style={{ color: '#1a1a1a' }}>获得奖励</h3>
              <div className="space-y-3 text-left">
                {data.exp && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2" style={{ color: '#7a7a7a' }}>
                      <span>✨</span> 经验值
                    </span>
                    <span className="font-bold" style={{ color: '#c9a227' }}>+{data.exp}</span>
                  </div>
                )}
                {data.gold && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2" style={{ color: '#7a7a7a' }}>
                      <span>💰</span> 铜钱
                    </span>
                    <span className="font-bold" style={{ color: '#c9a227' }}>+{data.gold}</span>
                  </div>
                )}
              </div>
            </div>

            {data.techniques && data.techniques.length > 0 && (
              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <h3 className="font-bold mb-3" style={{ color: '#1a1a1a' }}>
                  📜 学会新武学
                </h3>
                <div className="space-y-2">
                  {data.techniques.map(techId => {
                    const tech = getMartialArt(techId);
                    if (!tech) return null;
                    const typeIcon = tech.type === 'internal' ? '🧘' : tech.type === 'weapon' ? '⚔️' : tech.type === 'special' ? '✨' : '👊';
                    return (
                      <div key={techId} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold" style={{ color: '#8b5cf6' }}>
                            {typeIcon} {tech.nameCN}
                          </span>
                          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                            {tech.type === 'internal' ? '内功' : tech.type === 'weapon' ? '兵器' : tech.type === 'special' ? '特殊' : '外功'}
                          </span>
                        </div>
                        <p className="text-xs mt-2" style={{ color: '#7a7a7a' }}>
                          需要悟性 {tech.insightRequired} | 等级 {tech.level}
                        </p>
                        {tech.passiveEffects.length > 0 && (
                          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
                            <p className="text-xs" style={{ color: '#4a7c59' }}>
                              {tech.passiveEffects.map(e => e.description).join(' | ')}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.items && data.items.length > 0 && (
              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <h3 className="font-bold mb-3" style={{ color: '#1a1a1a' }}>
                  🎒 获得物品
                </h3>
                <div className="space-y-2">
                  {data.items.map((item, idx) => {
                    const typeIcon = item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : item.type === 'accessory' ? '💍' : item.type === 'consumable' ? '🧪' : '📦';
                    return (
                      <div key={idx} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                        <span style={{ color: '#4a4a4a' }}>
                          {typeIcon} {item.nameCN} {item.quantity > 1 && `x${item.quantity}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.attributes && data.attributes.length > 0 && (
              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                <h3 className="font-bold mb-3" style={{ color: '#1a1a1a' }}>
                  ⬆️ 属性提升
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {data.attributes.map((attr, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                      <span style={{ color: '#7a7a7a' }}>{attrLabels[attr.attribute]}</span>
                      <span className="font-bold" style={{ color: '#f97316' }}>
                        {attr.value > 0 ? '+' : ''}{attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)' }}>
          <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>当前状态</h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>等级</span>
              <span className="font-bold" style={{ color: '#1e40af' }}>{player.level}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>悟性</span>
              <span className="font-bold" style={{ color: '#8b5cf6' }}>{player.attributes.insight}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: '#7a7a7a' }}>经验进度</span>
              <span className="font-bold" style={{ color: '#4a7c59' }}>{player.exp} / {player.expToNext}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (player.exp / player.expToNext) * 100)}%`,
                  backgroundColor: '#4a7c59'
                }}
              />
            </div>
          </div>
        </div>

        {data.hasCombat && data.enemyId ? (
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-lg font-serif text-lg shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#dc2626', color: '#fff' }}
          >
            ⚔️ 进入战斗
          </button>
        ) : (
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-lg font-serif text-lg shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#c9a227', color: '#fff' }}
          >
            继续探索
          </button>
        )}
      </div>
    </div>
  );
}

export type { EventRewardModalData, AttributeReward };
