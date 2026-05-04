import { useState, useCallback } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import type { InventoryItem as InventoryItemType, EquipmentItem } from '../../types';
import InventoryItem from './InventoryItem';

interface SelectedItem {
  itemId: string;
  uniqueId?: string;
}

function getItemKey(item: InventoryItemType, index: number): string {
  const equipItem = item as EquipmentItem;
  if (equipItem.uniqueId) {
    return equipItem.uniqueId;
  }
  return `${item.id}-${index}`;
}

function getSelectedItem(item: InventoryItemType): SelectedItem {
  const equipItem = item as EquipmentItem;
  return {
    itemId: item.id,
    uniqueId: equipItem.uniqueId,
  };
}

function isItemSelected(item: InventoryItemType, selectedItems: SelectedItem[]): boolean {
  const equipItem = item as EquipmentItem;
  if (equipItem.uniqueId) {
    return selectedItems.some(s => s.uniqueId === equipItem.uniqueId);
  }
  return selectedItems.some(s => s.itemId === item.id && !s.uniqueId);
}

type TabType = 'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'weapon', label: '武器' },
  { key: 'armor', label: '防具' },
  { key: 'accessory', label: '饰品' },
  { key: 'consumable', label: '消耗品' },
  { key: 'material', label: '材料' },
];

function formatGold(copper: number): string {
  if (copper >= 1000) {
    return `${(copper / 1000).toFixed(1)} 金`;
  }
  return `${copper} 铜`;
}

export default function InventoryModal() {
  const dispatch = useGameDispatch();
  const inventory = useGameSelector(state => state.player.inventory);
  const equipment = useGameSelector(state => state.player.equipment);
  const gold = useGameSelector(state => state.player.gold);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const filteredItems = inventory.filter((item: InventoryItemType) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const toggleSelect = useCallback((item: InventoryItemType) => {
    const selected = getSelectedItem(item);
    setSelectedItems(prev => {
      const exists = prev.some(s => 
        s.uniqueId ? s.uniqueId === selected.uniqueId : s.itemId === selected.itemId
      );
      if (exists) {
        return prev.filter(s => 
          s.uniqueId ? s.uniqueId !== selected.uniqueId : s.itemId !== selected.itemId
        );
      }
      return [...prev, selected];
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const selectableItems = filteredItems.filter(item => {
      const isEquippable = ['weapon', 'armor', 'accessory'].includes(item.type);
      if (isEquippable) {
        const equipItem = item as EquipmentItem;
        const slot = equipItem.type as 'weapon' | 'armor' | 'accessory';
        const equipped = equipment[slot];
        if (equipped) {
          const isSame = equipped.uniqueId 
            ? equipped.uniqueId === equipItem.uniqueId 
            : equipped.id === equipItem.id;
          if (isSame) return false;
        }
      }
      return true;
    });

    if (selectedItems.length === selectableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(selectableItems.map(getSelectedItem));
    }
  }, [filteredItems, selectedItems, equipment]);

  const handleBatchDecompose = useCallback(() => {
    const equipmentItems = selectedItems.filter(s => {
      const item = inventory.find(i => {
        const equipItem = i as EquipmentItem;
        if (s.uniqueId) {
          return equipItem.uniqueId === s.uniqueId;
        }
        return i.id === s.itemId;
      });
      return item && ['weapon', 'armor', 'accessory'].includes(item.type);
    });

    if (equipmentItems.length > 0) {
      dispatch({ type: 'DECOMPOSE_ITEMS', payload: { items: equipmentItems } });
      setSelectedItems([]);
    }
  }, [selectedItems, inventory, dispatch]);

  const handleBatchSell = useCallback(() => {
    if (selectedItems.length > 0) {
      dispatch({ type: 'SELL_ITEMS', payload: { items: selectedItems } });
      setSelectedItems([]);
    }
  }, [selectedItems, dispatch]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    setSelectedItems([]);
  }, []);

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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>背包</h2>
            {selectionMode && (
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(74, 124, 89, 0.15)', color: '#4a7c59' }}>
                已选择 {selectedItems.length} 件
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {filteredItems.length > 0 && (
              <button
                onClick={toggleSelectionMode}
                className="px-3 py-1 text-sm rounded border transition-colors"
                style={{
                  backgroundColor: selectionMode ? 'rgba(74, 124, 89, 0.15)' : 'rgba(122, 122, 122, 0.1)',
                  color: selectionMode ? '#4a7c59' : '#4a4a4a',
                  borderColor: selectionMode ? 'rgba(74, 124, 89, 0.3)' : 'rgba(122, 122, 122, 0.2)',
                }}
              >
                {selectionMode ? '取消选择' : '批量操作'}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{ color: '#4a4a4a' }}
            >
              ✕
            </button>
          </div>
        </div>

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

        {/* Selection Toolbar */}
        {selectionMode && (
          <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.2)', backgroundColor: 'rgba(74, 124, 89, 0.05)' }}>
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1 text-sm rounded border transition-colors"
              style={{
                backgroundColor: 'rgba(74, 124, 89, 0.1)',
                color: '#4a7c59',
                borderColor: 'rgba(74, 124, 89, 0.3)',
              }}
            >
              {selectedItems.length === filteredItems.length ? '取消全选' : '全选'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleBatchDecompose}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 text-sm rounded border transition-colors"
                style={{
                  backgroundColor: selectedItems.length > 0 ? 'rgba(220, 38, 38, 0.1)' : '#e5e7eb',
                  color: selectedItems.length > 0 ? '#dc2626' : '#9ca3af',
                  borderColor: selectedItems.length > 0 ? 'rgba(220, 38, 38, 0.3)' : '#e5e7eb',
                  cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                批量分解
              </button>
              <button
                onClick={handleBatchSell}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 text-sm rounded border transition-colors"
                style={{
                  backgroundColor: selectedItems.length > 0 ? 'rgba(201, 162, 39, 0.1)' : '#e5e7eb',
                  color: selectedItems.length > 0 ? '#c9a227' : '#9ca3af',
                  borderColor: selectedItems.length > 0 ? 'rgba(201, 162, 39, 0.3)' : '#e5e7eb',
                  cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                批量出售
              </button>
            </div>
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#7a7a7a' }}>背包空空如也</div>
          ) : (
            filteredItems.map((item, index) => (
              <InventoryItem 
                key={getItemKey(item, index)} 
                item={item} 
                selectionMode={selectionMode}
                isSelected={isItemSelected(item, selectedItems)}
                onSelect={() => toggleSelect(item)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#4a4a4a' }}>持有金币</span>
            <span className="text-lg font-serif" style={{ color: '#c9a227' }}>{formatGold(gold)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
