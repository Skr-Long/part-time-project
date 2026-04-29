import { useState, useMemo } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import type { EquipmentItem, InventoryItem as InventoryItemType, EquipmentSlots } from '../../types';
import { checkEquipmentRequirements, formatItemEffects, getTotalEquipmentEffects } from '../../utils/equipment';
import { calculateBaseCombatStats } from '../../utils/attributes';
import { EQUIPMENT_RARITY_INFO } from '../../types';

const SLOT_INFO: Record<'weapon' | 'armor' | 'accessory', { name: string; icon: string }> = {
  weapon: { name: '武器', icon: '⚔️' },
  armor: { name: '防具', icon: '🛡️' },
  accessory: { name: '饰品', icon: '💍' },
};

const ITEM_TYPE_LABELS: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: '饰品',
};

interface StatsComparison {
  base: number;
  withCurrentEquip: number;
  withNewEquip: number;
  diff: number;
}

interface StatsComparisons {
  maxHP: StatsComparison;
  attack: StatsComparison;
  defense: StatsComparison;
  speed: StatsComparison;
  maxEnergy: StatsComparison;
  critChance: StatsComparison;
}

type StatKey = keyof StatsComparisons;

function isEquippable(item: InventoryItemType): item is EquipmentItem {
  return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
}

function calculateStatsWithEquipment(
  baseStats: ReturnType<typeof calculateBaseCombatStats>,
  equipment: EquipmentSlots,
  previewItem?: EquipmentItem
): { maxHP: number; attack: number; defense: number; speed: number; maxEnergy: number; critChance: number } {
  let effects = getTotalEquipmentEffects(equipment);
  
  if (previewItem) {
    const slot = previewItem.type as 'weapon' | 'armor' | 'accessory';
    const currentItem = equipment[slot];
    
    let newEffects = { ...effects };
    
    if (currentItem) {
      const currentItemEffects = currentItem.equipEffects;
      if (currentItemEffects.attackBonus) newEffects.attackBonus = (newEffects.attackBonus || 0) - currentItemEffects.attackBonus;
      if (currentItemEffects.defenseBonus) newEffects.defenseBonus = (newEffects.defenseBonus || 0) - currentItemEffects.defenseBonus;
      if (currentItemEffects.speedBonus) newEffects.speedBonus = (newEffects.speedBonus || 0) - currentItemEffects.speedBonus;
      if (currentItemEffects.maxHPBonus) newEffects.maxHPBonus = (newEffects.maxHPBonus || 0) - currentItemEffects.maxHPBonus;
      if (currentItemEffects.maxEnergyBonus) newEffects.maxEnergyBonus = (newEffects.maxEnergyBonus || 0) - currentItemEffects.maxEnergyBonus;
      if (currentItemEffects.critChanceBonus) newEffects.critChanceBonus = (newEffects.critChanceBonus || 0) - currentItemEffects.critChanceBonus;
    }
    
    const newItemEffects = previewItem.equipEffects;
    if (newItemEffects.attackBonus) newEffects.attackBonus = (newEffects.attackBonus || 0) + newItemEffects.attackBonus;
    if (newItemEffects.defenseBonus) newEffects.defenseBonus = (newEffects.defenseBonus || 0) + newItemEffects.defenseBonus;
    if (newItemEffects.speedBonus) newEffects.speedBonus = (newEffects.speedBonus || 0) + newItemEffects.speedBonus;
    if (newItemEffects.maxHPBonus) newEffects.maxHPBonus = (newEffects.maxHPBonus || 0) + newItemEffects.maxHPBonus;
    if (newItemEffects.maxEnergyBonus) newEffects.maxEnergyBonus = (newEffects.maxEnergyBonus || 0) + newItemEffects.maxEnergyBonus;
    if (newItemEffects.critChanceBonus) newEffects.critChanceBonus = (newEffects.critChanceBonus || 0) + newItemEffects.critChanceBonus;
    
    effects = newEffects;
  }
  
  return {
    maxHP: baseStats.maxHP + (effects.maxHPBonus || 0),
    attack: baseStats.attack + (effects.attackBonus || 0),
    defense: baseStats.defense + (effects.defenseBonus || 0),
    speed: baseStats.speed + (effects.speedBonus || 0),
    maxEnergy: baseStats.maxEnergy + (effects.maxEnergyBonus || 0),
    critChance: baseStats.critChance + (effects.critChanceBonus || 0),
  };
}

export default function CharacterPanel() {
  const dispatch = useGameDispatch();
  const player = useGameSelector(state => state.player);
  const [activeTab, setActiveTab] = useState<'weapon' | 'armor' | 'accessory' | 'all'>('all');
  const [previewItem, setPreviewItem] = useState<EquipmentItem | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const baseStats = useMemo(() => {
    return calculateBaseCombatStats(player.attributes, player.level);
  }, [player.attributes, player.level]);

  const currentStats = useMemo(() => {
    return calculateStatsWithEquipment(baseStats, player.equipment);
  }, [baseStats, player.equipment]);

  const previewStats = useMemo(() => {
    if (!previewItem) return null;
    return calculateStatsWithEquipment(baseStats, player.equipment, previewItem);
  }, [baseStats, player.equipment, previewItem]);

  const statComparisons = useMemo((): StatsComparisons | null => {
    if (!previewStats) return null;
    return {
      maxHP: {
        base: baseStats.maxHP,
        withCurrentEquip: currentStats.maxHP,
        withNewEquip: previewStats.maxHP,
        diff: previewStats.maxHP - currentStats.maxHP,
      },
      attack: {
        base: baseStats.attack,
        withCurrentEquip: currentStats.attack,
        withNewEquip: previewStats.attack,
        diff: previewStats.attack - currentStats.attack,
      },
      defense: {
        base: baseStats.defense,
        withCurrentEquip: currentStats.defense,
        withNewEquip: previewStats.defense,
        diff: previewStats.defense - currentStats.defense,
      },
      speed: {
        base: baseStats.speed,
        withCurrentEquip: currentStats.speed,
        withNewEquip: previewStats.speed,
        diff: previewStats.speed - currentStats.speed,
      },
      maxEnergy: {
        base: baseStats.maxEnergy,
        withCurrentEquip: currentStats.maxEnergy,
        withNewEquip: previewStats.maxEnergy,
        diff: previewStats.maxEnergy - currentStats.maxEnergy,
      },
      critChance: {
        base: baseStats.critChance,
        withCurrentEquip: currentStats.critChance,
        withNewEquip: previewStats.critChance,
        diff: previewStats.critChance - currentStats.critChance,
      },
    };
  }, [baseStats, currentStats, previewStats]);

  const equippableItems = useMemo(() => {
    return player.inventory.filter(item => isEquippable(item)) as EquipmentItem[];
  }, [player.inventory]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return equippableItems;
    return equippableItems.filter(item => item.type === activeTab);
  }, [equippableItems, activeTab]);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleEquip = (item: EquipmentItem) => {
    dispatch({ type: 'EQUIP_ITEM', payload: { itemId: item.id } });
    setPreviewItem(null);
  };

  const handleUnequip = (slot: 'weapon' | 'armor' | 'accessory') => {
    dispatch({ type: 'UNEQUIP_ITEM', payload: { slot } });
  };

  const getEquipCheck = (item: EquipmentItem) => {
    return checkEquipmentRequirements(
      item,
      player.level,
      player.attributes,
      player.knownTechniques
    );
  };

  const getRarityColor = (equip: EquipmentItem) => {
    return EQUIPMENT_RARITY_INFO[equip.rarity]?.color || '#1a1a1a';
  };

  const getRarityBadge = (equip: EquipmentItem) => {
    const rarityInfo = EQUIPMENT_RARITY_INFO[equip.rarity];
    if (!rarityInfo || equip.rarity === 'common') return null;
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded"
        style={{ 
          backgroundColor: `${rarityInfo.color}20`,
          color: rarityInfo.color,
        }}
      >
        {rarityInfo.nameCN}
      </span>
    );
  };

  const renderStatRow = (
    label: string, 
    icon: string, 
    key: StatKey,
    comparison: StatsComparison | null
  ) => {
    if (!comparison) {
      return (
        <div className="flex items-center justify-between py-2 px-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <div className="flex items-center gap-2">
            <span>{icon}</span>
            <span style={{ color: '#4a4a4a' }}>{label}</span>
          </div>
          <span className="font-bold" style={{ color: '#1a1a1a' }}>{currentStats[key]}</span>
        </div>
      );
    }

    const comp = comparison;
    const hasDiff = comp.diff !== 0;
    const isPositive = comp.diff > 0;

    return (
      <div className="flex items-center justify-between py-2 px-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span style={{ color: '#4a4a4a' }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: '#1a1a1a', textDecoration: hasDiff ? 'line-through' : 'none' }}>
            {comp.withCurrentEquip}
          </span>
          {hasDiff && (
            <span className="font-bold" style={{ color: isPositive ? '#16a34a' : '#dc2626' }}>
              {isPositive ? '+' : ''}{comp.withNewEquip}
              <span className="ml-1 text-xs">({isPositive ? '+' : ''}{comp.diff})</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-5xl flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>角色</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="w-64 p-4 border-r overflow-y-auto" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🧑</div>
              <div className="font-serif text-lg font-bold" style={{ color: '#1a1a1a' }}>{player.name}</div>
              <span 
                className="inline-block px-3 py-1 rounded text-sm font-bold mt-1"
                style={{ backgroundColor: '#1e40af', color: '#fff' }}
              >
                等级 {player.level}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: '#7a7a7a' }}>经验值</span>
                <span className="font-bold" style={{ color: '#4a7c59' }}>{player.exp} / {player.expToNext}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                <div 
                  className="h-full transition-all duration-300" 
                  style={{ 
                    width: `${Math.min(100, (player.exp / player.expToNext) * 100)}%`, 
                    backgroundColor: '#4a7c59' 
                  }} 
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h3 className="font-serif font-bold text-sm" style={{ color: '#1a1a1a' }}>基础属性</h3>
              {[
                { key: 'insight' as const, label: '悟性', icon: '🧠', color: '#8b5cf6' },
                { key: 'constitution' as const, label: '体质', icon: '❤️', color: '#dc2626' },
                { key: 'strength' as const, label: '力量', icon: '💪', color: '#f59e0b' },
                { key: 'agility' as const, label: '敏捷', icon: '⚡', color: '#16a34a' },
                { key: 'physique' as const, label: '根骨', icon: '🛡️', color: '#2563eb' },
                { key: 'luck' as const, label: '福缘', icon: '🍀', color: '#c9a227' },
              ].map(attr => (
                <div key={attr.key} className="flex items-center justify-between py-1 px-2 rounded text-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{attr.icon}</span>
                    <span style={{ color: '#7a7a7a' }}>{attr.label}</span>
                  </div>
                  <span className="font-bold" style={{ color: attr.color }}>{player.attributes[attr.key]}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-sm" style={{ color: '#1a1a1a' }}>
                战斗属性
                {previewItem && (
                  <span className="ml-2 text-xs font-normal" style={{ color: '#4a7c59' }}>
                    (预览模式)
                  </span>
                )}
              </h3>
              {renderStatRow('生命值', '❤️', 'maxHP', statComparisons?.maxHP || null)}
              {renderStatRow('内功值', '💫', 'maxEnergy', statComparisons?.maxEnergy || null)}
              {renderStatRow('攻击力', '⚔️', 'attack', statComparisons?.attack || null)}
              {renderStatRow('防御力', '🛡️', 'defense', statComparisons?.defense || null)}
              {renderStatRow('速度', '💨', 'speed', statComparisons?.speed || null)}
              {renderStatRow('暴击率', '🎯', 'critChance', statComparisons?.critChance || null)}
            </div>
          </div>

          <div className="w-72 p-4 border-r overflow-y-auto" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
            <h3 className="font-serif font-bold mb-3" style={{ color: '#1a1a1a' }}>当前装备</h3>
            
            <div className="space-y-3">
              {(['weapon', 'armor', 'accessory'] as const).map(slot => {
                const item = player.equipment[slot];
                const slotInfo = SLOT_INFO[slot];
                const isPreviewingThisSlot = previewItem?.type === slot;
                
                return (
                  <div
                    key={slot}
                    className="flex items-center gap-3 p-3 rounded border transition-colors"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      borderColor: isPreviewingThisSlot ? 'rgba(74, 124, 89, 0.5)' : 'rgba(122, 122, 122, 0.2)',
                      boxShadow: isPreviewingThisSlot ? '0 0 0 2px rgba(74, 124, 89, 0.3)' : 'none',
                    }}
                  >
                    <span className="text-2xl">{slotInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs" style={{ color: '#7a7a7a' }}>{slotInfo.name}</span>
                      {item ? (
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span 
                              className="font-serif truncate"
                              style={{ color: getRarityColor(item) }}
                            >
                              {item.nameCN}
                            </span>
                            {getRarityBadge(item)}
                          </div>
                          {formatItemEffects(item.equipEffects).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formatItemEffects(item.equipEffects).map((text, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs px-1.5 py-0.5 rounded"
                                  style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)', color: '#4a7c59' }}
                                >
                                  {text}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: 'rgba(122, 122, 122, 0.5)', fontStyle: 'italic' }}>未装备</div>
                      )}
                    </div>
                    {item && (
                      <button
                        onClick={() => handleUnequip(slot)}
                        className="px-2 py-1 text-xs rounded border transition-colors"
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          borderColor: '#fecaca',
                        }}
                      >
                        卸下
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {previewItem && (
              <div 
                className="mt-4 p-3 rounded border"
                style={{ 
                  backgroundColor: 'rgba(74, 124, 89, 0.05)',
                  borderColor: 'rgba(74, 124, 89, 0.3)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold" style={{ color: '#4a7c59' }}>预览装备</span>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="text-xs"
                    style={{ color: '#7a7a7a' }}
                  >
                    取消预览
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>{SLOT_INFO[previewItem.type as 'weapon' | 'armor' | 'accessory'].icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-serif"
                        style={{ color: getRarityColor(previewItem) }}
                      >
                        {previewItem.nameCN}
                      </span>
                      {getRarityBadge(previewItem)}
                    </div>
                  </div>
                </div>
                {statComparisons && (
                  <div className="mt-2">
                    <div className="text-xs font-bold mb-1" style={{ color: '#7a7a7a' }}>属性变化：</div>
                    {Object.entries(statComparisons)
                      .filter(([_, comp]) => comp.diff !== 0)
                      .map(([key, comp]) => {
                        const labels: Record<string, string> = {
                          maxHP: '生命值',
                          attack: '攻击力',
                          defense: '防御力',
                          speed: '速度',
                          maxEnergy: '内功值',
                          critChance: '暴击率',
                        };
                        return (
                          <div key={key} className="flex justify-between text-xs">
                            <span style={{ color: '#7a7a7a' }}>{labels[key] || key}</span>
                            <span style={{ color: comp.diff > 0 ? '#16a34a' : '#dc2626' }}>
                              {comp.diff > 0 ? '+' : ''}{comp.diff}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
                <button
                  onClick={() => handleEquip(previewItem)}
                  disabled={!getEquipCheck(previewItem).canEquip}
                  className="w-full mt-3 py-2 text-sm rounded border transition-colors"
                  style={{
                    backgroundColor: getEquipCheck(previewItem).canEquip ? 'rgba(74, 124, 89, 0.1)' : '#e5e7eb',
                    color: getEquipCheck(previewItem).canEquip ? '#4a7c59' : '#9ca3af',
                    borderColor: getEquipCheck(previewItem).canEquip ? 'rgba(74, 124, 89, 0.3)' : '#e5e7eb',
                    cursor: getEquipCheck(previewItem).canEquip ? 'pointer' : 'not-allowed',
                  }}
                >
                  {getEquipCheck(previewItem).canEquip ? '装备' : `条件不足：${getEquipCheck(previewItem).failedRequirements.join('、')}`}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold" style={{ color: '#1a1a1a' }}>背包装备</h3>
              <div className="flex gap-1">
                {([
                  { key: 'all' as const, label: '全部' },
                  { key: 'weapon' as const, label: '武器' },
                  { key: 'armor' as const, label: '防具' },
                  { key: 'accessory' as const, label: '饰品' },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPreviewItem(null);
                    }}
                    className="px-2.5 py-1 text-xs rounded transition-colors"
                    style={
                      activeTab === tab.key
                        ? { backgroundColor: '#1a1a1a', color: '#f5f0e6' }
                        : { backgroundColor: 'transparent', color: '#4a4a4a' }
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#7a7a7a' }}>
                暂无可用装备
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => {
                  const equipCheck = getEquipCheck(item);
                  const slot = item.type as 'weapon' | 'armor' | 'accessory';
                  const isCurrentlyEquipped = player.equipment[slot]?.id === item.id;
                  const isPreviewing = previewItem?.id === item.id;
                  const isExpanded = expandedItem === item.id;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 p-3 rounded border cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isPreviewing ? 'rgba(74, 124, 89, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                        borderColor: isCurrentlyEquipped 
                          ? 'rgba(74, 124, 89, 0.5)' 
                          : isPreviewing 
                            ? 'rgba(74, 124, 89, 0.3)' 
                            : 'rgba(122, 122, 122, 0.2)',
                        boxShadow: isPreviewing ? '0 0 0 2px rgba(74, 124, 89, 0.3)' : 'none',
                      }}
                      onClick={() => {
                        if (isPreviewing) {
                          setPreviewItem(null);
                        } else {
                          setPreviewItem(item);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{SLOT_INFO[slot].icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span 
                              className="font-serif truncate"
                              style={{ color: getRarityColor(item) }}
                            >
                              {item.nameCN}
                            </span>
                            {getRarityBadge(item)}
                            {isCurrentlyEquipped && (
                              <span 
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: 'rgba(74, 124, 89, 0.15)', color: '#4a7c59' }}
                              >
                                已装备
                              </span>
                            )}
                          </div>
                          <span className="text-xs" style={{ color: 'rgba(122, 122, 122, 0.7)' }}>
                            {ITEM_TYPE_LABELS[item.type]}
                            <button 
                              className="ml-2 text-xs underline cursor-pointer"
                              style={{ color: '#4a7c59' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedItem(isExpanded ? null : item.id);
                              }}
                            >
                              {isExpanded ? '收起详情' : '查看详情'}
                            </button>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!isCurrentlyEquipped && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquip(item);
                              }}
                              disabled={!equipCheck.canEquip}
                              className="px-3 py-1 text-sm rounded border transition-colors"
                              style={{
                                backgroundColor: equipCheck.canEquip ? 'rgba(74, 124, 89, 0.1)' : '#e5e7eb',
                                color: equipCheck.canEquip ? '#4a7c59' : '#9ca3af',
                                borderColor: equipCheck.canEquip ? 'rgba(74, 124, 89, 0.3)' : '#e5e7eb',
                                cursor: equipCheck.canEquip ? 'pointer' : 'not-allowed',
                              }}
                            >
                              {equipCheck.canEquip ? '穿戴' : '条件不足'}
                            </button>
                          )}
                          {isCurrentlyEquipped && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnequip(slot);
                              }}
                              className="px-3 py-1 text-sm rounded border transition-colors"
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                borderColor: '#fecaca',
                              }}
                            >
                              卸下
                            </button>
                          )}
                        </div>
                      </div>

                      {formatItemEffects(item.equipEffects).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formatItemEffects(item.equipEffects).map((text, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)', color: '#4a7c59' }}
                            >
                              {text}
                            </span>
                          ))}
                        </div>
                      )}

                      {isExpanded && (
                        <div 
                          className="pt-3 mt-1 border-t"
                          style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}
                        >
                          {item.descriptionCN && (
                            <p className="text-sm mb-2" style={{ color: '#4a4a4a' }}>
                              {item.descriptionCN}
                            </p>
                          )}

                          {item.requirements && item.requirements.length > 0 && (
                            <div className="mb-2">
                              <span className="text-xs font-bold" style={{ color: '#7a7a7a' }}>穿戴要求：</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.requirements.map((req, idx) => {
                                  const isFailed = equipCheck.failedRequirements.includes(req.descriptionCN);
                                  return (
                                    <span 
                                      key={idx}
                                      className="text-xs px-2 py-1 rounded"
                                      style={{ 
                                        backgroundColor: isFailed ? 'rgba(220, 38, 38, 0.1)' : 'rgba(122, 122, 122, 0.1)', 
                                        color: isFailed ? '#dc2626' : '#7a7a7a' 
                                      }}
                                    >
                                      {isFailed ? '✕ ' : '✓ '}{req.descriptionCN}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {item.specialEffects && item.specialEffects.length > 0 && (
                            <div>
                              <span className="text-xs font-bold" style={{ color: '#7a7a7a' }}>特殊效果：</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.specialEffects.map((effect, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-xs px-2 py-1 rounded"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}
                                    title={effect.descriptionCN}
                                  >
                                    【{effect.nameCN}】{effect.descriptionCN}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
    </div>
  );
}
