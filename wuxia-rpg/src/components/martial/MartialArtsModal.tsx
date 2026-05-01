import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import {
  getAvailableMartialArts,
  getVisibleMartialArts,
  getMartialArt,
  calculatePassiveBonuses
} from '../../data/martialArts';
import type { MartialArt } from '../../types';

type TabType = 'all' | 'internal' | 'external' | 'weapon' | 'special';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📚' },
  { key: 'internal', label: '内功', icon: '🧘' },
  { key: 'external', label: '外功', icon: '👊' },
  { key: 'weapon', label: '兵器', icon: '⚔️' },
  { key: 'special', label: '特殊', icon: '✨' },
];

const TYPE_ICONS: Record<MartialArt['type'], string> = {
  internal: '🧘',
  external: '👊',
  weapon: '⚔️',
  special: '✨',
};

const TYPE_NAMES: Record<MartialArt['type'], string> = {
  internal: '内功',
  external: '外功',
  weapon: '兵器',
  special: '特殊',
};

const SOURCE_TYPE_NAMES: Record<string, string> = {
  initial: '初始',
  event: '奇遇',
  purchase: '购买',
  insight: '领悟',
};

interface MartialArtCardProps {
  art: MartialArt;
  isKnown: boolean;
  canLearn: boolean;
  isLocked: boolean;
  lockedReason: string;
  onLearn: (art: MartialArt) => void;
  techniqueLevel: number;
}

function MartialArtCard({
  art,
  isKnown,
  canLearn,
  isLocked,
  lockedReason,
  onLearn,
  techniqueLevel
}: MartialArtCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayLevel = isKnown && techniqueLevel > 0 ? techniqueLevel : art.level;

  const getEffectDisplay = (effect: MartialArt['effects'][0]): string => {
    const attrNames: Record<string, string> = {
      strength: '力量',
      agility: '敏捷',
      physique: '根骨',
      constitution: '体质',
      insight: '悟性',
      luck: '运气',
    };

    const typeNames: Record<string, string> = {
      damage: '伤害',
      heal: '治疗',
      buff: '增益',
      debuff: '减益',
      defense: '防御',
    };

    let base = `${typeNames[effect.type]}: ${effect.value}`;
    if (effect.scalingAttribute && effect.scalingPercent) {
      base += ` + ${attrNames[effect.scalingAttribute] || effect.scalingAttribute}×${effect.scalingPercent}%`;
    }
    if (effect.duration) {
      base += ` (${effect.duration}回合)`;
    }
    return base;
  };

  return (
    <div
      className="rounded border cursor-pointer transition-all"
      style={{
        backgroundColor: isKnown ? 'rgba(74, 124, 89, 0.1)' : 'rgba(232, 224, 208, 0.5)',
        borderColor: isExpanded ? '#4a7c59' : 'rgba(122, 122, 122, 0.2)',
        opacity: isLocked ? 0.6 : 1,
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{TYPE_ICONS[art.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-medium" style={{ color: '#1a1a1a' }}>{art.nameCN}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'rgba(122, 122, 122, 0.2)',
                  color: '#4a4a4a',
                }}
              >
                {TYPE_NAMES[art.type]}
              </span>
              {isKnown && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#4a7c59', color: '#fff' }}
                >
                  已学会
                </span>
              )}
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: art.source.type === 'initial' ? 'rgba(74, 124, 89, 0.2)' :
                    art.source.type === 'event' ? 'rgba(59, 130, 246, 0.2)' :
                    art.source.type === 'purchase' ? 'rgba(201, 162, 39, 0.2)' :
                    'rgba(139, 92, 246, 0.2)',
                  color: art.source.type === 'initial' ? '#4a7c59' :
                    art.source.type === 'event' ? '#3b82f6' :
                    art.source.type === 'purchase' ? '#c9a227' :
                    '#8b5cf6',
                }}
              >
                {SOURCE_TYPE_NAMES[art.source.type]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: '#7a7a7a' }}>
              <span>等级 {displayLevel}{isKnown && techniqueLevel > art.level && <span style={{ color: '#4a7c59' }}> (+{techniqueLevel - art.level})</span>}</span>
              <span>悟性 {art.insightRequired}</span>
              <span>成功率 {art.learningChanceBase}%</span>
            </div>
          </div>
          <span
            className="text-lg transition-transform"
            style={{
              color: '#7a7a7a',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </span>
        </div>

        {!isExpanded && (
          <div className="mt-2 text-sm" style={{ color: '#4a4a4a' }}>
            点击查看详情
          </div>
        )}

        {isExpanded && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1" style={{ color: '#4a7c59' }}>武学简介</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#4a4a4a' }}>
                  {art.lore}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1" style={{ color: '#4a7c59' }}>主动效果</h4>
                <div className="space-y-1">
                  {art.effects.map((effect, idx) => (
                    <div
                      key={idx}
                      className="text-sm px-2 py-1 rounded"
                      style={{
                        backgroundColor: effect.type === 'heal' ? 'rgba(74, 124, 89, 0.1)' :
                          effect.type === 'damage' ? 'rgba(220, 38, 38, 0.05)' :
                          'rgba(122, 122, 122, 0.1)',
                        color: effect.type === 'heal' ? '#4a7c59' :
                          effect.type === 'damage' ? '#dc2626' :
                          '#4a4a4a',
                      }}
                    >
                      {getEffectDisplay(effect)}
                    </div>
                  ))}
                </div>
              </div>

              {art.passiveEffects.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1" style={{ color: '#8b5cf6' }}>被动效果</h4>
                  <div className="flex flex-wrap gap-2">
                    {art.passiveEffects.map((effect, idx) => {
                      const levelBonus = isKnown && techniqueLevel > art.level 
                        ? Math.floor(effect.value * (techniqueLevel - art.level) * 0.1)
                        : 0;
                      const actualValue = effect.value + levelBonus;
                      
                      let displayText = effect.description;
                      if (isKnown && levelBonus > 0) {
                        displayText = effect.description.replace(`+${effect.value}`, `+${actualValue}`);
                      }
                      
                      return (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            color: '#8b5cf6',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                          }}
                        >
                          {displayText}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-1" style={{ color: '#c9a227' }}>获取方式</h4>
                <p className="text-sm" style={{ color: '#4a4a4a' }}>
                  {art.source.description}
                  {art.source.price && ` (价格: ${art.source.price}铜钱)`}
                  {art.source.minInsight && ` (最低悟性: ${art.source.minInsight})`}
                </p>
              </div>

              {art.prerequisiteSkills && art.prerequisiteSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1" style={{ color: '#7a7a7a' }}>前置武学</h4>
                  <div className="flex flex-wrap gap-2">
                    {art.prerequisiteSkills.map((preId, idx) => {
                      const preArt = getMartialArt(preId);
                      return (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(122, 122, 122, 0.15)',
                            color: '#4a4a4a',
                          }}
                        >
                          {preArt?.nameCN || preId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isKnown && (
                <div
                  className="pt-2 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canLearn ? (
                    <button
                      onClick={() => onLearn(art)}
                      className="px-4 py-2 text-sm rounded border transition-colors font-medium"
                      style={{
                        backgroundColor: '#c9a227',
                        color: '#1a1a1a',
                        borderColor: 'rgba(201, 162, 39, 0.5)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                        e.currentTarget.style.color = '#f5f0e6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#c9a227';
                        e.currentTarget.style.color = '#1a1a1a';
                      }}
                    >
                      尝试学习
                    </button>
                  ) : (
                    <span className="text-sm px-3 py-2 rounded" style={{ color: '#7a7a7a', backgroundColor: 'rgba(122, 122, 122, 0.1)' }}>
                      {lockedReason}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MartialArtsModal() {
  const dispatch = useGameDispatch();
  const player = useGameSelector(state => state.player);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [learningResult, setLearningResult] = useState<{ success: boolean; name: string } | null>(null);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
    setLearningResult(null);
  };

  const knownIds = player.knownTechniques;
  const visibleArts = getVisibleMartialArts(
    player.attributes.insight,
    knownIds,
    player.completedEvents
  );
  const availableArts = getAvailableMartialArts(
    player.attributes.insight,
    knownIds,
    player.completedEvents,
    player.gold
  );

  const filteredArts = activeTab === 'all'
    ? visibleArts
    : visibleArts.filter(m => m.type === activeTab);

  const getLockedReason = (art: MartialArt): string => {
    if (knownIds.includes(art.id)) return '';

    if (art.insightRequired > player.attributes.insight) {
      return `悟性不足 (需要${art.insightRequired}, 当前${player.attributes.insight})`;
    }

    if (art.prerequisiteSkills && !art.prerequisiteSkills.every(pre => knownIds.includes(pre))) {
      const missing = art.prerequisiteSkills.filter(pre => !knownIds.includes(pre));
      return `需要先学会: ${missing.map(id => getMartialArt(id)?.nameCN || id).join(', ')}`;
    }

    if (art.source.type === 'event' && art.source.eventId && !player.completedEvents.includes(art.source.eventId)) {
      return '需要完成特定事件';
    }

    if (art.source.type === 'purchase' && art.source.price && player.gold < art.source.price) {
      return `金币不足 (需要${art.source.price}, 当前${player.gold})`;
    }

    if (art.source.type === 'insight' && art.source.minInsight && player.attributes.insight < art.source.minInsight) {
      return `悟性不足无法领悟 (需要${art.source.minInsight})`;
    }

    return '条件未满足';
  };

  const handleLearn = (martialArt: MartialArt) => {
    const successChance = Math.min(95, martialArt.learningChanceBase + (player.attributes.insight - martialArt.insightRequired) * 5);
    const roll = Math.random() * 100;
    const success = roll < successChance;

    if (success) {
      dispatch({ type: 'LEARN_TECHNIQUE', payload: { techniqueId: martialArt.id } });
    }

    setLearningResult({ success, name: martialArt.nameCN });
    setTimeout(() => setLearningResult(null), 2500);
  };

  const totalBonuses = calculatePassiveBonuses(knownIds);
  const hasBonuses = Object.keys(totalBonuses.attributeBonuses).length > 0 ||
    Object.keys(totalBonuses.combatBonuses).length > 0 ||
    totalBonuses.hpRegen > 0 ||
    totalBonuses.energyRegen > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>武学秘籍</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors rounded hover:bg-gray-200"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        {learningResult && (
          <div
            className="p-3 text-center font-serif"
            style={{
              backgroundColor: learningResult.success ? 'rgba(74, 124, 89, 0.2)' : 'rgba(220, 38, 38, 0.2)',
              color: learningResult.success ? '#4a7c59' : '#dc2626',
            }}
          >
            {learningResult.success
              ? `🎉 成功学会了「${learningResult.name}」！`
              : `😔 「${learningResult.name}」学习失败，再试一次吧...`}
          </div>
        )}

        {hasBonuses && (
          <div
            className="p-3 border-b"
            style={{
              borderColor: 'rgba(122, 122, 122, 0.2)',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
            }}
          >
            <h4 className="text-xs font-medium mb-2" style={{ color: '#8b5cf6' }}>当前被动加成</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(totalBonuses.attributeBonuses).map(([attr, value]) => {
                const attrNames: Record<string, string> = {
                  strength: '力量', agility: '敏捷', physique: '根骨',
                  constitution: '体质', insight: '悟性', luck: '运气',
                };
                return (
                  <span key={attr} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    {attrNames[attr]}+{value}
                  </span>
                );
              })}
              {Object.entries(totalBonuses.combatBonuses).map(([stat, value]) => {
                const statNames: Record<string, string> = {
                  maxHP: '生命上限', maxEnergy: '内力上限',
                  attack: '攻击', defense: '防御', speed: '速度', critChance: '暴击',
                };
                return (
                  <span key={stat} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)', color: '#4a7c59' }}>
                    {statNames[stat]}+{value}
                  </span>
                );
              })}
              {totalBonuses.hpRegen > 0 && (
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', color: '#dc2626' }}>
                  回血+{totalBonuses.hpRegen}/回合
                </span>
              )}
              {totalBonuses.energyRegen > 0 && (
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  回内+{totalBonuses.energyRegen}/回合
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-1 p-2 border-b overflow-x-auto" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap flex items-center gap-1"
              style={
                activeTab === tab.key
                  ? { backgroundColor: '#1a1a1a', color: '#f5f0e6' }
                  : { backgroundColor: 'transparent', color: '#4a4a4a' }
              }
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredArts.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#7a7a7a' }}>
              <div className="text-4xl mb-2">📚</div>
              <div className="font-serif">暂无可见的武学秘籍</div>
              <div className="text-sm mt-1">探索江湖、提升悟性，或完成特定事件来解锁更多武学</div>
            </div>
          ) : (
            filteredArts.map(art => {
              const isKnown = knownIds.includes(art.id);
              const isAvailable = availableArts.some(a => a.id === art.id);
              const canLearn = !isKnown && isAvailable;
              const isLocked = !isKnown && !isAvailable;
              const techniqueLevel = player.techniqueLevels.find(tl => tl.techniqueId === art.id)?.level || 0;

              return (
                <MartialArtCard
                  key={art.id}
                  art={art}
                  isKnown={isKnown}
                  canLearn={canLearn}
                  isLocked={isLocked}
                  lockedReason={getLockedReason(art)}
                  onLearn={handleLearn}
                  techniqueLevel={techniqueLevel}
                />
              );
            })
          )}
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.05)' }}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span style={{ color: '#7a7a7a' }}>悟性: </span>
                <span className="font-serif" style={{ color: '#8b5cf6' }}>{player.attributes.insight}</span>
              </div>
              <div>
                <span style={{ color: '#7a7a7a' }}>已学会: </span>
                <span className="font-serif" style={{ color: '#4a7c59' }}>{knownIds.length}/{visibleArts.length}</span>
              </div>
              <div>
                <span style={{ color: '#7a7a7a' }}>金币: </span>
                <span className="font-serif" style={{ color: '#c9a227' }}>{player.gold}</span>
              </div>
            </div>
            <div className="text-xs" style={{ color: '#7a7a7a' }}>
              点击武学卡片查看详情
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}