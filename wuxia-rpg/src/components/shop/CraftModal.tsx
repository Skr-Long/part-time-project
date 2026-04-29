import { useState } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import type { CraftRecipe, EquipmentItem, InventoryItem } from '../../types';
import { CRAFT_RECIPES, getItem, getEquipment } from '../../data/items';
import { canCraftItem, craftItem as executeCraft, formatItemEffects } from '../../utils/equipment';
import { EQUIPMENT_RARITY_INFO } from '../../types';

function formatGold(copper: number): string {
  if (copper >= 1000) {
    return `${(copper / 1000).toFixed(1)} 金`;
  }
  return `${copper} 铜`;
}

const ITEM_TYPE_ICONS: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  consumable: '🧪',
  material: '📦',
  quest: '📜',
};

interface CraftResultModalProps {
  result: {
    success: boolean;
    item?: EquipmentItem;
    message: string;
  };
  onClose: () => void;
}

function CraftResultModal({ result, onClose }: CraftResultModalProps) {
  const item = result.item;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md flex flex-col rounded-lg shadow-2xl border-2 p-6"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: result.success ? '#4a7c59' : '#dc2626',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">{result.success ? '✨' : '❌'}</div>
          <h3 
            className="text-xl font-serif mb-2" 
            style={{ color: result.success ? '#4a7c59' : '#dc2626' }}
          >
            {result.success ? '打造成功！' : '打造失败'}
          </h3>
          <p className="mb-4" style={{ color: '#4a4a4a' }}>{result.message}</p>
          
          {item && (
            <div 
              className="p-4 rounded-lg mb-4"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderColor: EQUIPMENT_RARITY_INFO[item.rarity]?.color || '#7a7a7a',
                borderWidth: '2px',
                borderStyle: 'solid',
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{ITEM_TYPE_ICONS[item.type] || '📦'}</span>
                <div>
                  <div 
                    className="text-lg font-serif"
                    style={{ color: EQUIPMENT_RARITY_INFO[item.rarity]?.color || '#7a7a7a' }}
                  >
                    {item.nameCN}
                  </div>
                  <div className="text-sm" style={{ color: '#7a7a7a' }}>
                    【{EQUIPMENT_RARITY_INFO[item.rarity]?.nameCN || '普通'}】
                  </div>
                </div>
              </div>
              
              {item.equipEffects && (
                <div className="mt-3 flex flex-wrap gap-1 justify-center">
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
              
              {item.specialEffects && item.specialEffects.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs mb-1" style={{ color: '#7c3aed' }}>特殊效果：</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {item.specialEffects.map((effect, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}
                        title={effect.descriptionCN}
                      >
                        【{effect.nameCN}】
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#1a1a1a', color: '#f5f0e6' }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

interface RecipeCardProps {
  recipe: CraftRecipe;
  playerLevel: number;
  blacksmithLevel: number;
  playerGold: number;
  inventory: InventoryItem[];
  onCraft: (recipe: CraftRecipe) => void;
}

function RecipeCard({ recipe, playerLevel, blacksmithLevel, playerGold, inventory, onCraft }: RecipeCardProps) {
  const baseItem = getEquipment(recipe.baseItemId);
  const { canCraft, reason } = canCraftItem(recipe, inventory, playerGold, playerLevel, blacksmithLevel);
  const [isHovered, setIsHovered] = useState(false);

  if (!baseItem) return null;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: isHovered ? 'rgba(232, 224, 208, 0.9)' : 'rgba(232, 224, 208, 0.6)',
        borderColor: canCraft ? 'rgba(74, 124, 89, 0.3)' : 'rgba(220, 38, 38, 0.3)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{ITEM_TYPE_ICONS[baseItem.type] || '📦'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif" style={{ color: '#1a1a1a' }}>{recipe.nameCN}</span>
            {baseItem.requiredLevel > 1 && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)', color: '#c9a227' }}>
                需要等级 {baseItem.requiredLevel}
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: '#7a7a7a' }}>{recipe.descriptionCN}</p>
          
          <div className="mt-2">
            <div className="text-xs mb-1" style={{ color: '#4a4a4a' }}>基础属性：</div>
            <div className="flex flex-wrap gap-1">
              {formatItemEffects(baseItem.equipEffects).map((text, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)', color: '#4a7c59' }}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
          
          {baseItem.specialEffects && baseItem.specialEffects.length > 0 && (
            <div className="mt-2">
              <div className="text-xs mb-1" style={{ color: '#7c3aed' }}>可能获得特效：</div>
              <div className="flex flex-wrap gap-1">
                {baseItem.specialEffects.map((effect, idx) => (
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
            </div>
          )}
          
          <div className="mt-3">
            <div className="text-xs mb-1" style={{ color: '#4a4a4a' }}>所需材料：</div>
            <div className="flex flex-wrap gap-2">
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{ 
                  backgroundColor: playerGold >= recipe.cost ? 'rgba(201, 162, 39, 0.1)' : 'rgba(220, 38, 38, 0.1)', 
                  color: playerGold >= recipe.cost ? '#c9a227' : '#dc2626' 
                }}
              >
                💰 {formatGold(recipe.cost)}
              </span>
              {recipe.materials.map((material, idx) => {
                const materialItem = getItem(material.itemId);
                const inventoryCount = inventory.find(i => i.id === material.itemId)?.quantity || 0;
                const hasEnough = inventoryCount >= material.quantity;
                return (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: hasEnough ? 'rgba(74, 124, 89, 0.1)' : 'rgba(220, 38, 38, 0.1)', 
                      color: hasEnough ? '#4a7c59' : '#dc2626' 
                    }}
                  >
                    {ITEM_TYPE_ICONS[materialItem?.type || 'material'] || '📦'} {materialItem?.nameCN || material.itemId} x{material.quantity} ({inventoryCount}/{material.quantity})
                  </span>
                );
              })}
            </div>
          </div>
          
          {!canCraft && reason && (
            <div className="mt-2 text-xs" style={{ color: '#dc2626' }}>
              ⚠️ {reason}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onCraft(recipe)}
          disabled={!canCraft}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: canCraft ? '#4a7c59' : '#9ca3af',
            color: '#fff',
            cursor: canCraft ? 'pointer' : 'not-allowed',
          }}
        >
          开始打造
        </button>
      </div>
    </div>
  );
}

export default function CraftModal() {
  const dispatch = useGameDispatch();
  const player = useGameSelector(state => state.player);
  const playerLevel = player.level;
  const blacksmithLevel = player.professions.blacksmith?.level || 1;
  const playerGold = player.gold;
  const inventory = player.inventory;
  
  const [activeTab, setActiveTab] = useState<'all' | 'weapon' | 'armor' | 'accessory'>('all');
  const [craftResult, setCraftResult] = useState<{ success: boolean; item?: EquipmentItem; message: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleCraft = (recipe: CraftRecipe) => {
    const { canCraft, reason } = canCraftItem(recipe, inventory, playerGold, playerLevel, blacksmithLevel);
    
    if (!canCraft) {
      showNotification(reason || '无法打造');
      return;
    }

    const result = executeCraft(recipe.id, playerLevel, blacksmithLevel);
    
    if (result.success && result.item) {
      dispatch({ type: 'CRAFT_ITEM', payload: { recipeId: recipe.id } });
    }
    
    setCraftResult({
      success: result.success,
      item: result.item,
      message: result.message,
    });
  };

  const filteredRecipes = CRAFT_RECIPES.filter(recipe => {
    const baseItem = getEquipment(recipe.baseItemId);
    if (!baseItem) return false;
    
    if (activeTab === 'all') return true;
    return baseItem.type === activeTab;
  });

  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'weapon' as const, label: '武器' },
    { key: 'armor' as const, label: '防具' },
    { key: 'accessory' as const, label: '饰品' },
  ];

  return (
    <>
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
              <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>⚒️ 铁匠铺 - 打造装备</h2>
              <p className="text-sm" style={{ color: '#7a7a7a' }}>铁匠等级: {blacksmithLevel} | 提示: 铁匠等级越高，越有可能打造出高品质装备</p>
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
              style={{ backgroundColor: '#dc2626', color: '#fff' }}
            >
              {notification}
            </div>
          )}

          {/* Tabs */}
          <div 
            className="flex gap-1 p-3 border-b overflow-x-auto flex-shrink-0" 
            style={{ 
              borderColor: 'rgba(122, 122, 122, 0.2)',
              backgroundColor: 'rgba(26, 26, 26, 0.03)',
              minHeight: '50px',
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 text-sm rounded transition-colors whitespace-nowrap"
                style={
                  activeTab === tab.key
                    ? { backgroundColor: '#1a1a1a', color: '#f5f0e6', minHeight: '32px' }
                    : { backgroundColor: 'rgba(232, 224, 208, 0.8)', color: '#4a4a4a', minHeight: '32px' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Recipe List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#7a7a7a' }}>暂无可用配方</div>
            ) : (
              filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  playerLevel={playerLevel}
                  blacksmithLevel={blacksmithLevel}
                  playerGold={playerGold}
                  inventory={inventory}
                  onCraft={handleCraft}
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

      {/* Craft Result Modal */}
      {craftResult && (
        <CraftResultModal
          result={craftResult}
          onClose={() => setCraftResult(null)}
        />
      )}
    </>
  );
}
