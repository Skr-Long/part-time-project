import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import { MARTIAL_ARTS, getAvailableMartialArts, getMartialArt } from '../../data/martialArts';
import type { MartialArt } from '../../types';

type TabType = 'all' | 'internal' | 'external' | 'weapon' | 'special';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'internal', label: '內功' },
  { key: 'external', label: '外功' },
  { key: 'weapon', label: '兵器' },
  { key: 'special', label: '特殊' },
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

  const filteredArts = activeTab === 'all'
    ? MARTIAL_ARTS.filter(m => knownIds.includes(m.id) || availableArts.some(a => a.id === m.id))
    : MARTIAL_ARTS.filter(m => m.type === activeTab);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>武学</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        {/* Learning Result */}
        {learningResult && (
          <div
            className="p-3 text-center font-serif"
            style={{
              backgroundColor: learningResult.success ? 'rgba(74, 124, 89, 0.2)' : 'rgba(220, 38, 38, 0.2)',
              color: learningResult.success ? '#4a7c59' : '#dc2626',
            }}
          >
            {learningResult.success ? `学会了${learningResult.name}！` : `${learningResult.name}学习失败...`}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b overflow-x-auto" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-1.5 text-sm rounded transition-colors"
              style={
                activeTab === tab.key
                  ? { backgroundColor: '#1a1a1a', color: '#f5f0e6' }
                  : { backgroundColor: '#e8e0d0', color: '#4a4a4a' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Martial Arts List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredArts.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#7a7a7a' }}>暂无武学</div>
          ) : (
            filteredArts.map(art => {
              const isKnown = knownIds.includes(art.id);
              const isAvailable = availableArts.some(a => a.id === art.id);
              const canLearn = !isKnown && isAvailable;

              return (
                <div
                  key={art.id}
                  className="p-3 rounded border"
                  style={{
                    backgroundColor: isKnown ? 'rgba(74, 124, 89, 0.1)' : 'rgba(232, 224, 208, 0.5)',
                    borderColor: 'rgba(122, 122, 122, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPE_ICONS[art.type]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif" style={{ color: '#1a1a1a' }}>{art.nameCN}</span>
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
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#7a7a7a' }}>{art.descriptionCN}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#7a7a7a' }}>
                        <span>等级 {art.level}</span>
                        <span>悟性需求 {art.insightRequired}</span>
                        <span>基础成功率 {art.learningChanceBase}%</span>
                      </div>
                    </div>
                    {canLearn && (
                      <button
                        onClick={() => handleLearn(art)}
                        className="px-3 py-1.5 text-sm rounded border transition-colors"
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
                      <span className="text-xs" style={{ color: '#7a7a7a' }}>
                        {art.prerequisiteSkills
                          ? `需先学: ${art.prerequisiteSkills.map(id => getMartialArt(id)?.nameCN).join(', ')}`
                          : '悟性不足'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer - Insight Info */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#4a4a4a' }}>悟性</span>
            <span className="text-lg font-serif" style={{ color: '#4a7c59' }}>{player.attributes.insight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
