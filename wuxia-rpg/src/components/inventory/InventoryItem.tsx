import { useState } from 'react';
import type { InventoryItem as InventoryItemType } from '../../types';
import { useGameDispatch } from '../../contexts/GameContext';

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
}

export default function InventoryItem({ item }: InventoryItemProps) {
  const dispatch = useGameDispatch();
  const isEquippable = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
  const isConsumable = item.type === 'consumable';
  const [isHovered, setIsHovered] = useState(false);

  const handleEquip = () => {
    dispatch({ type: 'EQUIP_ITEM', payload: { itemId: item.id } });
  };

  const handleUse = () => {
    dispatch({ type: 'USE_ITEM', payload: { itemId: item.id } });
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded border"
      style={{
        backgroundColor: isHovered ? 'rgba(232, 224, 208, 0.8)' : 'rgba(232, 224, 208, 0.5)',
        borderColor: 'rgba(122, 122, 122, 0.2)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-2xl">{ITEM_TYPE_ICONS[item.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-serif truncate" style={{ color: '#1a1a1a' }}>{item.nameCN}</span>
          {item.stackable && item.quantity > 1 && (
            <span className="text-sm" style={{ color: '#7a7a7a' }}>x{item.quantity}</span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'rgba(122, 122, 122, 0.7)' }}>{ITEM_TYPE_LABELS[item.type]}</span>
      </div>
      <div className="flex gap-2">
        {isEquippable && (
          <button
            onClick={handleEquip}
            className="px-3 py-1 text-sm rounded border transition-colors"
            style={{
              backgroundColor: 'rgba(74, 124, 89, 0.1)',
              color: '#4a7c59',
              borderColor: 'rgba(74, 124, 89, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(74, 124, 89, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(74, 124, 89, 0.1)';
            }}
          >
            穿戴
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
  );
}
