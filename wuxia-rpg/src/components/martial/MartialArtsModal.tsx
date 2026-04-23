import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import { MARTIAL_ARTS, getAvailableMartialArts, getMartialArt } from '../../data/martialArts';
import type { MartialArt, TechniqueLevel } from '../../types';

type TabType = 'all' | 'internal' | 'external' | 'weapon' | 'special';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📚' },
  { key: 'internal', label: '內功', icon: '🧘' },
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
  internal: '內功',
  external: '外功',
  weapon: '兵器',
  special: '特殊',
};

const TYPE_COLORS: Record<MartialArt['type'], { bg: string; text: string; border: string }> = {
  internal: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' },
  external: { bg: 'rgba(30, 64, 175, 0.1)', text: '#1e40af', border: 'rgba(30, 64, 175, 0.3)' },
  weapon: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  special: { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
};

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
  const availableArts = getAvailableMartialArts(player.attributes.insight, knownIds);

  const getTechniqueLevel = (techId: string): TechniqueLevel | undefined => {
    return player.techniqueLevels.find(t => t.techniqueId === techId);
  };

  const filteredArts = activeTab === 'all'
    ? MARTIAL_ARTS.filter(m => knownIds.includes(m.id) || availableArts.some(a => a.id === m.id))
    : MARTIAL_ARTS.filter(m => m.type === activeTab);

  const groupedArts: Record<MartialArt['type'], MartialArt[]> = {
    internal: [],
    external: [],
    weapon: [],
    special: [],
  };

  filteredArts.forEach(art => {
    groupedArts[art.type].push(art);
  });

  const handleLearn = (martialArt: MartialArt) => {
    const successChance = martialArt.learningChanceBase + (player.attributes.insight - martialArt.insightRequired) * 5;
    const roll = Math.random() * 100;
    const success = roll < successChance;

    if (success) {
      dispatch({ type: 'LEARN_TECHNIQUE', payload: { techniqueId: martialArt.id } });
    }

    setLearningResult({ success, name: martialArt.nameCN });
    setTimeout(() => setLearningResult(null), 2000);
  };

  const renderMartialArtCard = (art: MartialArt) => {
    const isKnown = knownIds.includes(art.id);
    const isAvailable = availableArts.some(a => a.id === art.id);
    const canLearn = !isKnown && isAvailable;
    const techLevel = getTechniqueLevel(art.id);
    const colors = TYPE_COLORS[art.type];

    const expPercent = techLevel ? (techLevel.exp / techLevel.expToNext) * 100 : 0;

    const effectDescriptions = art.effects.map(effect => {
      if (effect.type === 'damage') {
        const baseValue = effect.value;
        const scaling = effect.scalingAttribute ? ` + ${effect.scalingAttribute}×${effect.scalingPercent}` : '';
        return `⚔️ 伤害 ${baseValue}${scaling}`;
      }
      if (effect.type === 'heal') {
        const baseValue = effect.value;
        const scaling = effect.scalingAttribute ? ` + ${effect.scalingAttribute}×${effect.scalingPercent}` : '';
        return `💚 治疗 ${baseValue}${scaling}`;
      }
      if (effect.type === 'buff') {
        return `⬆️ 增益 (${effect.duration}回合)`;
      }
      if (effect.type === 'debuff') {
        return `⬇️ 减益 (${effect.duration}回合)`;
      }
      return `${effect.type}`;
    }).join(' · ');

    return (
      <div
        key={art.id}
        className="p-4 rounded-lg border-2 mb-3 transition-all"
        style={{
          backgroundColor: isKnown ? colors.bg : 'rgba(232, 224, 208, 0.5)',
          borderColor: isKnown ? colors.border : 'rgba(122, 122, 122, 0.2)',
          boxShadow: isKnown ? `0 2px 8px ${colors.border}` : 'none',
        }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="text-3xl p-2 rounded-lg"
            style={{ backgroundColor: colors.bg }}
          >
            {TYPE_ICONS[art.type]}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-bold text-lg" style={{ color: colors.text }}>{art.nameCN}</span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                {TYPE_NAMES[art.type]}
              </span>
              {isKnown && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: '#4a7c59', color: '#fff' }}
                >
                  已学会
                </span>
              )}
            </div>

            <p className="text-sm mt-1" style={{ color: '#7a7a7a' }}>{art.descriptionCN}</p>

            <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#7a7a7a' }}>
              <span>秘籍等级 {art.level}</span>
              <span>悟性需求 {art.insightRequired}</span>
              <span>基础成功率 {art.learningChanceBase}%</span>
            </div>

            {isKnown && techLevel && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: colors.text, fontWeight: 'bold' }}>
                    等级 {techLevel.level}
                  </span>
                  <span style={{ color: '#7a7a7a' }}>
                    经验 {techLevel.exp} / {techLevel.expToNext}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(122, 122, 122, 0.2)' }}>
                  <div 
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ 
                      width: `${expPercent}%`, 
                      background: `linear-gradient(90deg, ${colors.text}, ${colors.text}cc)`
                    }} 
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                  💡 战斗中使用可获得经验（悟性 {player.attributes.insight}：经验加成 +{Math.floor(techLevel.expToNext * (player.attributes.insight / 100))}）
                </div>
              </div>
            )}

            {effectDescriptions && (
              <div className="mt-2 text-xs" style={{ color: '#4a4a4a' }}>
                效果：{effectDescriptions}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {canLearn && (
              <button
                onClick={() => handleLearn(art)}
                className="px-4 py-2 text-sm rounded-lg border transition-all font-bold"
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
                学习
              </button>
            )}
            {!isKnown && !isAvailable && (
              <div className="text-xs text-center" style={{ color: '#7a7a7a' }}>
                {art.prerequisiteSkills
                  ? (
                    <div>
                      <p>需先学:</p>
                      {art.prerequisiteSkills.map(id => {
                        const pre = getMartialArt(id);
                        const hasPre = knownIds.includes(id);
                        return (
                          <p key={id} style={{ color: hasPre ? '#4a7c59' : '#dc2626' }}>
                            {hasPre ? '✓' : '✗'} {pre?.nameCN || id}
                          </p>
                        );
                      })}
                    </div>
                  )
                  : <p>悟性不足</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGroup = (type: MartialArt['type']) => {
    const arts = groupedArts[type];
    if (arts.length === 0) return null;

    const colors = TYPE_COLORS[type];

    return (
      <div key={type} className="mb-4">
        <div 
          className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.bg }}
        >
          <span className="text-xl">{TYPE_ICONS[type]}</span>
          <span className="font-serif font-bold" style={{ color: colors.text }}>
            {TYPE_NAMES[type]}
          </span>
          <span className="text-xs" style={{ color: '#7a7a7a' }}>
            ({arts.filter(a => knownIds.includes(a.id)).length}/{arts.length} 已学会)
          </span>
        </div>
        {arts.map(art => renderMartialArtCard(art))}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-lg shadow-2xl border-2"
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
            className="w-8 h-8 flex items-center justify-center transition-colors"
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
            {learningResult.success ? `🎉 学会了「${learningResult.name}」！` : `「${learningResult.name}」学习失败...再试一次吧！`}
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

        <div className="flex-1 overflow-y-auto p-3">
          {filteredArts.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#7a7a7a' }}>
              <span className="text-4xl">📖</span>
              <p className="mt-2">暂无武学秘籍</p>
              <p className="text-sm mt-1">探索江湖，寻找更多秘籍吧！</p>
            </div>
          ) : activeTab === 'all' ? (
            <>
              {renderGroup('internal')}
              {renderGroup('external')}
              {renderGroup('weapon')}
              {renderGroup('special')}
            </>
          ) : (
            filteredArts.map(art => renderMartialArtCard(art))
          )}
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.05)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="text-sm" style={{ color: '#4a4a4a' }}>悟性</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-serif font-bold" style={{ color: '#8b5cf6' }}>{player.attributes.insight}</span>
              <span className="text-xs ml-2" style={{ color: '#7a7a7a' }}>
                (学习成功率 +{(player.attributes.insight - 5) * 5}% · 经验加成 +{Math.floor(100 * (player.attributes.insight / 100))}%)
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs" style={{ color: '#7a7a7a' }}>
            💡 悟性影响：学习成功率、功法等级提升速度、战斗后功法经验获得
          </div>
        </div>
      </div>
    </div>
  );
}
