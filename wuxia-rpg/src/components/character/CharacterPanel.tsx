import { useState, useMemo } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import type { EquipmentItem, InventoryItem as InventoryItemType, EquipmentSlots, Attributes } from '../../types';
import { checkEquipmentRequirements, formatItemEffects, getTotalEquipmentEffects } from '../../utils/equipment';
import { calculateBaseCombatStats, ATTRIBUTE_INFO } from '../../utils/attributes';
import { calculatePassiveBonuses } from '../../data/martialArts';
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

const ATTR_LABELS: Record<string, string> = {
  insight: '悟性',
  constitution: '体质',
  strength: '力量',
  agility: '敏捷',
  physique: '根骨',
  luck: '福缘',
};

const ATTR_ICONS: Record<string, string> = {
  insight: '🧠',
  constitution: '❤️',
  strength: '💪',
  agility: '⚡',
  physique: '🛡️',
  luck: '🍀',
};

const ATTR_COLORS: Record<string, string> = {
  insight: '#8b5cf6',
  constitution: '#dc2626',
  strength: '#f59e0b',
  agility: '#16a34a',
  physique: '#2563eb',
  luck: '#c9a227',
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

interface AttributeBreakdown {
  base: number;
  martialArtsBonus: number;
  equipmentBonus: number;
  total: number;
}

interface CombatStatBreakdown {
  baseFromAttrs: number;
  martialArtsBonus: number;
  equipmentBonus: number;
  total: number;
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
  const [showAttributeHelp, setShowAttributeHelp] = useState(false);
  const [showCombatStatHelp, setShowCombatStatHelp] = useState(false);

  const martialArtsBonuses = useMemo(() => {
    return calculatePassiveBonuses(player.knownTechniques);
  }, [player.knownTechniques]);

  const equipmentEffects = useMemo(() => {
    return getTotalEquipmentEffects(player.equipment);
  }, [player.equipment]);

  const effectiveAttributes = useMemo((): Record<keyof Attributes, AttributeBreakdown> => {
    const result: Partial<Record<keyof Attributes, AttributeBreakdown>> = {};
    const attrs: Array<keyof Attributes> = ['insight', 'constitution', 'strength', 'agility', 'physique', 'luck'];
    
    attrs.forEach(attr => {
      const base = player.attributes[attr];
      const martialArtsBonus = martialArtsBonuses.attributeBonuses[attr] || 0;
      const equipmentBonus = equipmentEffects.attributeBonus?.[attr] || 0;
      
      result[attr] = {
        base,
        martialArtsBonus,
        equipmentBonus,
        total: base + martialArtsBonus + equipmentBonus,
      };
    });
    
    return result as Record<keyof Attributes, AttributeBreakdown>;
  }, [player.attributes, martialArtsBonuses, equipmentEffects]);

  const baseStats = useMemo(() => {
    const attrsForCalc = {
      insight: effectiveAttributes.insight.total,
      constitution: effectiveAttributes.constitution.total,
      strength: effectiveAttributes.strength.total,
      agility: effectiveAttributes.agility.total,
      physique: effectiveAttributes.physique.total,
      luck: effectiveAttributes.luck.total,
    };
    return calculateBaseCombatStats(attrsForCalc, player.level);
  }, [effectiveAttributes, player.level]);

  const combatStatBreakdown = useMemo((): Record<StatKey, CombatStatBreakdown> => {
    const mapping: Array<{ 
      key: StatKey; 
      baseKey: keyof typeof baseStats;
      martialArtsKey: keyof typeof martialArtsBonuses.combatBonuses;
      equipmentKey: keyof Pick<typeof equipmentEffects, 'attackBonus' | 'defenseBonus' | 'speedBonus' | 'maxHPBonus' | 'maxEnergyBonus' | 'critChanceBonus'>;
    }> = [
      { key: 'maxHP', baseKey: 'maxHP', martialArtsKey: 'maxHP', equipmentKey: 'maxHPBonus' },
      { key: 'attack', baseKey: 'attack', martialArtsKey: 'attack', equipmentKey: 'attackBonus' },
      { key: 'defense', baseKey: 'defense', martialArtsKey: 'defense', equipmentKey: 'defenseBonus' },
      { key: 'speed', baseKey: 'speed', martialArtsKey: 'speed', equipmentKey: 'speedBonus' },
      { key: 'maxEnergy', baseKey: 'maxEnergy', martialArtsKey: 'maxEnergy', equipmentKey: 'maxEnergyBonus' },
      { key: 'critChance', baseKey: 'critChance', martialArtsKey: 'critChance', equipmentKey: 'critChanceBonus' },
    ];

    const result: Partial<Record<StatKey, CombatStatBreakdown>> = {};
    
    mapping.forEach(({ key, baseKey, martialArtsKey, equipmentKey }) => {
      const baseFromAttrs = baseStats[baseKey];
      const martialArtsBonus = martialArtsBonuses.combatBonuses[martialArtsKey] || 0;
      const equipmentBonus = equipmentEffects[equipmentKey] || 0;
      
      result[key] = {
        baseFromAttrs,
        martialArtsBonus,
        equipmentBonus,
        total: baseFromAttrs + martialArtsBonus + equipmentBonus,
      };
    });
    
    return result as Record<StatKey, CombatStatBreakdown>;
  }, [baseStats, martialArtsBonuses, equipmentEffects]);

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

  const handleAllocateAttribute = (attr: keyof Attributes) => {
    dispatch({ type: 'ALLOCATE_ATTRIBUTE_POINT', payload: { attribute: attr } });
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

  const renderAttributeRow = (attr: keyof Attributes) => {
    const breakdown = effectiveAttributes[attr];
    const hasFreePoints = player.freeAttributePoints > 0;
    const isMaxed = player.attributes[attr] >= 10;
    const canAllocate = hasFreePoints && !isMaxed;

    return (
      <div 
        key={attr}
        className="flex items-center justify-between py-1.5 px-2 rounded text-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{ATTR_ICONS[attr]}</span>
          <span style={{ color: '#7a7a7a' }}>{ATTR_LABELS[attr]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold" style={{ color: ATTR_COLORS[attr] }}>
            {breakdown.total}
          </span>
          <div className="flex items-center text-xs">
            <span style={{ color: '#4a4a4a' }}>(</span>
            <span style={{ color: '#1a1a1a' }}>{breakdown.base}</span>
            {breakdown.martialArtsBonus > 0 && (
              <span style={{ color: '#8b5cf6' }}>+{breakdown.martialArtsBonus}</span>
            )}
            {breakdown.equipmentBonus > 0 && (
              <span style={{ color: '#4a7c59' }}>+{breakdown.equipmentBonus}</span>
            )}
            <span style={{ color: '#4a4a4a' }}>)</span>
          </div>
          {hasFreePoints && (
            <button
              onClick={() => handleAllocateAttribute(attr)}
              disabled={!canAllocate}
              className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold transition-colors"
              style={{
                backgroundColor: canAllocate ? 'rgba(74, 124, 89, 0.15)' : 'rgba(122, 122, 122, 0.1)',
                color: canAllocate ? '#4a7c59' : '#9ca3af',
                cursor: canAllocate ? 'pointer' : 'not-allowed',
              }}
              title={isMaxed ? '该属性已达到上限' : '分配属性点'}
            >
              +
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCombatStatRow = (
    label: string, 
    icon: string, 
    key: StatKey,
    comparison?: StatsComparison | null
  ) => {
    const breakdown = combatStatBreakdown[key];
    
    if (!comparison) {
      return (
        <div className="flex items-center justify-between py-2 px-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <div className="flex items-center gap-2">
            <span>{icon}</span>
            <span style={{ color: '#4a4a4a' }}>{label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold" style={{ color: '#1a1a1a' }}>{breakdown.total}</span>
            <div className="flex items-center text-xs">
              <span style={{ color: '#4a4a4a' }}>(</span>
              <span style={{ color: '#1a1a1a' }}>{breakdown.baseFromAttrs}</span>
              {breakdown.martialArtsBonus > 0 && (
                <span style={{ color: '#8b5cf6' }}>+{breakdown.martialArtsBonus}</span>
              )}
              {breakdown.equipmentBonus > 0 && (
                <span style={{ color: '#4a7c59' }}>+{breakdown.equipmentBonus}</span>
              )}
              <span style={{ color: '#4a4a4a' }}>)</span>
            </div>
          </div>
        </div>
      );
    }

    const comp = comparison;
    const hasDiff = comp && comp.diff !== 0;
    const isPositive = hasDiff && comp.diff > 0;

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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>角色</h2>
            {player.freeAttributePoints > 0 && (
              <span 
                className="px-2 py-0.5 rounded text-sm font-bold"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                自由属性点: {player.freeAttributePoints}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="w-72 p-4 border-r overflow-y-auto" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
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
              <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                下次升级获得 5 点自由属性点
              </div>
            </div>

            {player.freeAttributePoints > 0 && (
              <div 
                className="mb-4 p-3 rounded border"
                style={{ 
                  backgroundColor: 'rgba(220, 38, 38, 0.05)',
                  borderColor: 'rgba(220, 38, 38, 0.3)',
                }}
              >
                <div className="text-sm font-bold mb-2" style={{ color: '#dc2626' }}>
                  ⚠️ 剩余 {player.freeAttributePoints} 点属性点未分配
                </div>
                <div className="text-xs" style={{ color: '#7a7a7a' }}>
                  点击属性右侧的 + 按钮进行分配
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm" style={{ color: '#1a1a1a' }}>基础属性</h3>
                  <button
                    onClick={() => setShowAttributeHelp(true)}
                    className="w-4 h-4 flex items-center justify-center rounded-full text-xs font-bold transition-colors"
                    style={{ 
                      backgroundColor: 'rgba(122, 122, 122, 0.2)', 
                      color: '#7a7a7a' 
                    }}
                    title="查看属性说明"
                  >
                    ?
                  </button>
                </div>
                <div className="flex gap-3 text-xs">
                  <span style={{ color: '#7a7a7a' }}>
                    <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#1a1a1a' }}></span>
                    基础值
                  </span>
                  <span style={{ color: '#7a7a7a' }}>
                    <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#8b5cf6' }}></span>
                    武学
                  </span>
                  <span style={{ color: '#7a7a7a' }}>
                    <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#4a7c59' }}></span>
                    装备
                  </span>
                </div>
              </div>
              {(['insight', 'constitution', 'strength', 'agility', 'physique', 'luck'] as const).map(attr => (
                renderAttributeRow(attr)
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-sm" style={{ color: '#1a1a1a' }}>
                  战斗属性
                  {previewItem && (
                    <span className="ml-2 text-xs font-normal" style={{ color: '#4a7c59' }}>
                      (预览模式)
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowCombatStatHelp(true)}
                  className="w-4 h-4 flex items-center justify-center rounded-full text-xs font-bold transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(122, 122, 122, 0.2)', 
                    color: '#7a7a7a' 
                  }}
                  title="查看战斗属性说明"
                >
                  ?
                </button>
              </div>
              {renderCombatStatRow('生命值', '❤️', 'maxHP', statComparisons?.maxHP || null)}
              {renderCombatStatRow('内功值', '💫', 'maxEnergy', statComparisons?.maxEnergy || null)}
              {renderCombatStatRow('攻击力', '⚔️', 'attack', statComparisons?.attack || null)}
              {renderCombatStatRow('防御力', '🛡️', 'defense', statComparisons?.defense || null)}
              {renderCombatStatRow('速度', '💨', 'speed', statComparisons?.speed || null)}
              {renderCombatStatRow('暴击率', '🎯', 'critChance', statComparisons?.critChance || null)}
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

      {showAttributeHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowAttributeHelp(false)}
        >
          <div
            className="w-full max-w-lg flex flex-col rounded-lg shadow-2xl border-2 max-h-96"
            style={{
              backgroundColor: '#e8e0d0',
              borderColor: 'rgba(122, 122, 122, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
              <h3 className="text-lg font-serif font-bold" style={{ color: '#1a1a1a' }}>基础属性说明</h3>
              <button
                onClick={() => setShowAttributeHelp(false)}
                className="w-6 h-6 flex items-center justify-center"
                style={{ color: '#7a7a7a' }}
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="space-y-4">
                {ATTRIBUTE_INFO.map(attr => (
                  <div key={attr.key}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{ATTR_ICONS[attr.key]}</span>
                      <span className="font-serif font-bold" style={{ color: ATTR_COLORS[attr.key] }}>
                        {attr.labelCN}
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: '#4a4a4a' }}>
                      {attr.description}
                    </p>
                    <div className="pl-4 space-y-1">
                      {attr.effects.map((effect, idx) => (
                        <div key={idx} className="text-xs" style={{ color: '#7a7a7a' }}>
                          <span className="font-medium" style={{ color: '#1a1a1a' }}>{effect.statCN}：</span>
                          <span>{effect.description}</span>
                          <div className="mt-0.5 pl-2" style={{ color: '#7a7a7a' }}>
                            计算公式：<code style={{ backgroundColor: 'rgba(122, 122, 122, 0.1)', padding: '1px 4px', borderRadius: '2px' }}>
                              {effect.formula}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCombatStatHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowCombatStatHelp(false)}
        >
          <div
            className="w-full max-w-md flex flex-col rounded-lg shadow-2xl border-2"
            style={{
              backgroundColor: '#e8e0d0',
              borderColor: 'rgba(122, 122, 122, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
              <h3 className="text-lg font-serif font-bold" style={{ color: '#1a1a1a' }}>战斗属性说明</h3>
              <button
                onClick={() => setShowCombatStatHelp(false)}
                className="w-6 h-6 flex items-center justify-center"
                style={{ color: '#7a7a7a' }}
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm" style={{ color: '#4a4a4a' }}>
                <p className="mb-2 font-bold" style={{ color: '#1a1a1a' }}>属性组成：</p>
                <p className="text-xs mb-1">
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>总值</span> = 基础值（属性+等级） + 武学加成 + 装备加成
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">❤️ 生命值</span>
                  <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                    公式：100 + 体质 × 10 + 等级 × 5
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    表示角色的存活能力，生命值为0时角色死亡
                  </div>
                </div>
                <div>
                  <span className="font-medium">💫 内功值</span>
                  <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                    公式：50 + 等级 × 10 + 有效悟性 × 5
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    使用武学技能需要消耗内功值
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    有效悟性 = 悟性 + 根骨 × 0.5
                  </div>
                </div>
                <div>
                  <span className="font-medium">⚔️ 攻击力</span>
                  <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                    公式：10 + 力量 × 5 + 等级 × 2
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    影响对敌人造成的伤害
                  </div>
                </div>
                <div>
                  <span className="font-medium">🛡️ 防御力</span>
                  <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                    公式：5 + 根骨 × 3 + 等级 × 1
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    减少受到的伤害
                  </div>
                </div>
                <div>
                  <span className="font-medium">💨 速度</span>
                  <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                    公式：10 + 敏捷 × 2 + 等级 × 1
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    决定战斗中的行动顺序，速度越快越先行动
                  </div>
                </div>
                <div>
                  <span className="font-medium">🎯 暴击率</span>
                  <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                    公式：max(0, 幸运) × 0.5%
                  </div>
                  <div className="text-xs" style={{ color: '#7a7a7a' }}>
                    暴击时造成双倍伤害
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
