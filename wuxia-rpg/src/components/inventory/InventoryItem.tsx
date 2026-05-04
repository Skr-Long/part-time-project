import { useState } from 'react';
import type { InventoryItem as InventoryItemType, EquipmentItem } from '../../types';
import { useGameDispatch, useGameSelector } from '../../contexts/GameContext';
import { checkEquipmentRequirements, formatItemEffects } from '../../utils/equipment';
import { getEquipment } from '../../data/items';
import { EQUIPMENT_RARITY_INFO } from '../../types';

const ITEM_TYPE_ICONS: Record<InventoryItemType['type'], string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  consumable: '🧪',
  material: '📦',
  quest: '📜',
};

const ITEM_TYPE_LABELS: Record<InventoryItemType['type'], string> = {
  weapon: '武器',
  armor: '防具',
  accessory: '饰品',
  consumable: '消耗品',
  material: '材料',
  quest: '任务物品',
};

interface InventoryItemProps {
  item: InventoryItemType;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function isEquippable(item: InventoryItemType): item is EquipmentItem {
  return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
}

export default function InventoryItem({ item, selectionMode = false, isSelected = false, onSelect }: InventoryItemProps) {
  const dispatch = useGameDispatch();
  const equipment = useGameSelector(state => state.player.equipment);
  const playerLevel = useGameSelector(state => state.player.level);
  const playerAttributes = useGameSelector(state => state.player.attributes);
  const knownTechniques = useGameSelector(state => state.player.knownTechniques);
  
  const isConsumable = item.type === 'consumable';
  const [isHovered, setIsHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const equipItem = isEquippable(item) ? item : null;
  const equipmentItem = equipItem ? getEquipment(item.id) : null;
  
  const slot = equipItem ? (equipItem.type as 'weapon' | 'armor' | 'accessory') : null;
  
  function isSameEquipment(a: EquipmentItem | null, b: EquipmentItem | null): boolean {
    if (!a || !b) return false;
    if (a.uniqueId && b.uniqueId) return a.uniqueId === b.uniqueId;
    return a.id === b.id;
  }
  
  const isCurrentlyEquipped = slot && isSameEquipment(equipment[slot], equipItem);
  
  const equipCheck = equipItem && equipmentItem 
    ? checkEquipmentRequirements(equipmentItem, playerLevel, playerAttributes, knownTechniques)
    : { canEquip: true, failedRequirements: [] };

  const handleEquip = () => {
    if (!equipItem) return;
    const equipPayload: { itemId: string; uniqueId?: string } = { itemId: item.id };
    if (equipItem.uniqueId) {
      equipPayload.uniqueId = equipItem.uniqueId;
    }
    dispatch({ type: 'EQUIP_ITEM', payload: equipPayload });
  };

  const handleUnequip = () => {
    if (!slot) return;
    dispatch({ type: 'UNEQUIP_ITEM', payload: { slot } });
  };

  const handleUse = () => {
    dispatch({ type: 'USE_ITEM', payload: { itemId: item.id } });
  };

  const handleDecompose = () => {
    if (!equipItem || isCurrentlyEquipped) return;
    const decomposePayload: { itemId: string; uniqueId?: string } = { itemId: item.id };
    if (equipItem.uniqueId) {
      decomposePayload.uniqueId = equipItem.uniqueId;
    }
    dispatch({ type: 'DECOMPOSE_ITEM', payload: decomposePayload });
  };

  const getRarityColor = (equip?: EquipmentItem) => {
    if (!equip || !('rarity' in equip)) return '#1a1a1a';
    return EQUIPMENT_RARITY_INFO[equip.rarity]?.color || '#1a1a1a';
  };

  const getRarityBadge = (equip?: EquipmentItem) => {
    if (!equip || !('rarity' in equip)) return null;
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

  return (
    <div
      className="flex flex-col gap-2 p-3 rounded border"
      style={{
        backgroundColor: isSelected 
          ? 'rgba(74, 124, 89, 0.15)' 
          : isHovered ? 'rgba(232, 224, 208, 0.8)' : 'rgba(232, 224, 208, 0.5)',
        borderColor: isSelected 
          ? 'rgba(74, 124, 89, 0.6)' 
          : isCurrentlyEquipped ? 'rgba(74, 124, 89, 0.5)' : 'rgba(122, 122, 122, 0.2)',
        borderWidth: isSelected || isCurrentlyEquipped ? '2px' : '1px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {selectionMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-5 h-5 cursor-pointer"
            style={{ accentColor: '#4a7c59' }}
          />
        )}
        <span className="text-2xl">{ITEM_TYPE_ICONS[item.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span 
              className="font-serif truncate" 
              style={{ color: getRarityColor(equipItem || undefined) }}
            >
              {item.nameCN}
            </span>
            {getRarityBadge(equipItem || undefined)}
            {item.stackable && item.quantity > 1 && (
              <span className="text-sm" style={{ color: '#7a7a7a' }}>x{item.quantity}</span>
            )}
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
            {equipItem && (
              <button 
                className="ml-2 text-xs underline cursor-pointer"
                style={{ color: '#4a7c59' }}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '收起详情' : '查看详情'}
              </button>
            )}
          </span>
        </div>
        <div className="flex gap-2">
          {equipItem && isCurrentlyEquipped && (
            <button
              onClick={handleUnequip}
              className="px-3 py-1 text-sm rounded border transition-colors"
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderColor: '#fecaca',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fecaca';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
              }}
            >
              卸下
            </button>
          )}
          {equipItem && !isCurrentlyEquipped && (
            <button
              onClick={handleEquip}
              disabled={!equipCheck.canEquip}
              className="px-3 py-1 text-sm rounded border transition-colors"
              style={{
                backgroundColor: equipCheck.canEquip ? 'rgba(74, 124, 89, 0.1)' : '#e5e7eb',
                color: equipCheck.canEquip ? '#4a7c59' : '#9ca3af',
                borderColor: equipCheck.canEquip ? 'rgba(74, 124, 89, 0.3)' : '#e5e7eb',
                cursor: equipCheck.canEquip ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (equipCheck.canEquip) {
                  e.currentTarget.style.backgroundColor = 'rgba(74, 124, 89, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (equipCheck.canEquip) {
                  e.currentTarget.style.backgroundColor = 'rgba(74, 124, 89, 0.1)';
                }
              }}
              title={!equipCheck.canEquip ? equipCheck.failedRequirements.join('、') : undefined}
            >
              {equipCheck.canEquip ? '穿戴' : '条件不足'}
            </button>
          )}
          {equipItem && !isCurrentlyEquipped && !selectionMode && (
            <button
              onClick={handleDecompose}
              className="px-3 py-1 text-sm rounded border transition-colors"
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: '#dc2626',
                borderColor: 'rgba(220, 38, 38, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
              }}
            >
              分解
            </button>
          )}
          {isConsumable && (
            <button
              onClick={handleUse}
              className="px-3 py-1 text-sm rounded border transition-colors"
              style={{
                backgroundColor: 'rgba(201, 162, 39, 0.1)',
                color: '#c9a227',
                borderColor: 'rgba(201, 162, 39, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(201, 162, 39, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(201, 162, 39, 0.1)';
              }}
            >
              使用
            </button>
          )}
        </div>
      </div>

      {expanded && equipItem && (
        <div 
          className="pt-3 mt-1 border-t"
          style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}
        >
          {equipItem.descriptionCN && (
            <p className="text-sm mb-2" style={{ color: '#4a4a4a' }}>
              {equipItem.descriptionCN}
            </p>
          )}

          {equipItem.equipEffects && formatItemEffects(equipItem.equipEffects).length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-bold" style={{ color: '#7a7a7a' }}>属性加成：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formatItemEffects(equipItem.equipEffects).map((text, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)', color: '#4a7c59' }}
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {equipItem.requirements && equipItem.requirements.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-bold" style={{ color: '#7a7a7a' }}>穿戴要求：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {equipItem.requirements.map((req, idx) => {
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

          {equipItem.specialEffects && equipItem.specialEffects.length > 0 && (
            <div>
              <span className="text-xs font-bold" style={{ color: '#7a7a7a' }}>特殊效果：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {equipItem.specialEffects.map((effect, idx) => (
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
}
