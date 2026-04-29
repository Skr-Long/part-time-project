import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import type { ShopListing, EquipmentRarity } from '../../types';
import { getItem, getEquipment } from '../../data/items';
import { EQUIPMENT_RARITY_INFO } from '../../types';
import { formatItemEffects } from '../../utils/equipment';

type TabType = 'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'weapon', label: '武器' },
  { key: 'armor', label: '防具' },
  { key: 'accessory', label: '饰品' },
  { key: 'consumable', label: '消耗品' },
  { key: 'material', label: '材料' },
];

const ITEM_TYPE_ICONS: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  consumable: '🧪',
  material: '📦',
  quest: '📜',
};

function formatGold(copper: number): string {
  if (copper >= 1000) {
    return `${(copper / 1000).toFixed(1)} 金`;
  }
  return `${copper} 铜`;
}

function getRarityColor(rarity?: EquipmentRarity): string {
  if (!rarity) return '#7a7a7a';
  return EQUIPMENT_RARITY_INFO[rarity]?.color || '#7a7a7a';
}

function getRarityName(rarity?: EquipmentRarity): string {
  if (!rarity) return '';
  return EQUIPMENT_RARITY_INFO[rarity]?.nameCN || '';
}

interface ShopItemProps {
  listing: ShopListing;
  onPurchase: (itemId: string, price: number) => void;
  playerGold: number;
}

function ShopItem({ listing, onPurchase, playerGold }: ShopItemProps) {
  const item = getItem(listing.itemId);
  const equipment = getEquipment(listing.itemId);
  const [isHovered, setIsHovered] = useState(false);

  if (!item) return null;

  const canAfford = playerGold >= listing.price;
  const effects = equipment?.equipEffects || item.effects;
  const effectTexts = formatItemEffects(effects);

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
      <span className="text-2xl">{ITEM_TYPE_ICONS[item.type] || '📦'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className="font-serif truncate" 
            style={{ color: getRarityColor(equipment?.rarity) }}
          >
            {item.nameCN}
          </span>
          {equipment?.rarity && equipment.rarity !== 'common' && (
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${getRarityColor(equipment.rarity)}20`,
                color: getRarityColor(equipment.rarity),
              }}
            >
              {getRarityName(equipment.rarity)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'rgba(122, 122, 122, 0.7)' }}>
            {item.descriptionCN}
          </span>
        </div>
        {effectTexts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {effectTexts.map((text, idx) => (
              <span 
                key={idx}
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)', color: '#4a7c59' }}
              >
                {text}
              </span>
            ))}
          </div>
        )}
        {equipment?.requirements && equipment.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {equipment.requirements.map((req, idx) => (
              <span 
                key={idx}
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
              >
                需要：{req.descriptionCN}
              </span>
            ))}
          </div>
        )}
        {equipment?.specialEffects && equipment.specialEffects.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {equipment.specialEffects.map((effect, idx) => (
              <span 
                key={idx}
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}
                title={effect.descriptionCN}
              >
                【{effect.nameCN}】
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-serif" style={{ color: '#c9a227' }}>{formatGold(listing.price)}</span>
        <span className="text-xs" style={{ color: '#7a7a7a' }}>库存: {listing.quantity}</span>
        <button
          onClick={() => onPurchase(listing.itemId, listing.price)}
          disabled={!canAfford || listing.quantity <= 0}
          className="px-3 py-1 text-sm rounded border transition-colors"
          style={{
            backgroundColor: canAfford && listing.quantity > 0 ? 'rgba(74, 124, 89, 0.1)' : '#e5e7eb',
            color: canAfford && listing.quantity > 0 ? '#4a7c59' : '#9ca3af',
            borderColor: canAfford && listing.quantity > 0 ? 'rgba(74, 124, 89, 0.3)' : '#e5e7eb',
            cursor: canAfford && listing.quantity > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          购买
        </button>
      </div>
    </div>
  );
}

interface ShopModalProps {
  shopInventory: ShopListing[];
  shopName: string;
}

export default function ShopModal({ shopInventory, shopName }: ShopModalProps) {
  const dispatch = useGameDispatch();
  const playerGold = useGameSelector(state => state.player.gold);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const handlePurchase = (itemId: string, price: number) => {
    if (playerGold < price) {
      showNotification('铜钱不足！');
      return;
    }

    dispatch({ type: 'PURCHASE_ITEM', payload: { itemId, price } });
    const item = getItem(itemId);
    showNotification(`购买了 ${item?.nameCN || itemId}！`);
  };

  const filteredItems = shopInventory.filter((listing: ShopListing) => {
    const item = getItem(listing.itemId);
    if (!item) return false;
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <div>
            <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>{shopName}</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div 
            className="absolute top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-10"
            style={{ backgroundColor: '#4a7c59', color: '#fff' }}
          >
            {notification}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b overflow-x-auto" style={{ borderColor: 'rgba(122, 122, 122, 0.2)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap"
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
            <div className="text-center py-8" style={{ color: '#7a7a7a' }}>暂无商品</div>
          ) : (
            filteredItems.map((listing, idx) => (
              <ShopItem 
                key={`${listing.itemId}-${idx}`} 
                listing={listing} 
                onPurchase={handlePurchase}
                playerGold={playerGold}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#4a4a4a' }}>持有金币</span>
            <span className="text-lg font-serif" style={{ color: '#c9a227' }}>{formatGold(playerGold)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
