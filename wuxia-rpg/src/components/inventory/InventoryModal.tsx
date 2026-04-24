import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import type { InventoryItem as InventoryItemType } from '../../types';
import InventoryItem from './InventoryItem';

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
  const gold = useGameSelector(state => state.player.gold);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const filteredItems = inventory.filter((item: InventoryItemType) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

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
          <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>背包</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
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

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#7a7a7a' }}>背包空空如也</div>
          ) : (
            filteredItems.map(item => <InventoryItem key={item.id} item={item} />)
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
