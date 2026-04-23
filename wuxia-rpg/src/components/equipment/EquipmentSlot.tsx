import type { EquipmentSlots } from '../../types';
import { useGameDispatch } from '../../contexts/GameContext';

type SlotKey = keyof EquipmentSlots;
type SlotType = 'weapon' | 'armor' | 'accessory';

const SLOT_INFO: Record<SlotType, { name: string; icon: string }> = {
  weapon: { name: '武器', icon: '⚔️' },
  armor: { name: '防具', icon: '🛡️' },
  accessory: { name: '饰品', icon: '💍' },
};

interface EquipmentSlotProps {
  slot: SlotKey;
  item: EquipmentSlots[SlotKey];
}

export default function EquipmentSlot({ slot, item }: EquipmentSlotProps) {
  const dispatch = useGameDispatch();

  const handleUnequip = () => {
    dispatch({ type: 'UNEQUIP_ITEM', payload: { slot } });
  };

  return (
    <div
      className="flex items-center gap-3 p-4 rounded border"
      style={{
        backgroundColor: 'rgba(232, 224, 208, 0.5)',
        borderColor: 'rgba(122, 122, 122, 0.2)',
      }}
    >
      <span className="text-2xl">{SLOT_INFO[slot as SlotType].icon}</span>
      <div className="flex-1">
        <span className="text-sm" style={{ color: '#7a7a7a' }}>{SLOT_INFO[slot as SlotType].name}</span>
        {item ? (
          <div className="font-serif" style={{ color: '#1a1a1a' }}>{item.nameCN}</div>
        ) : (
          <div style={{ color: 'rgba(122, 122, 122, 0.5)', fontStyle: 'italic' }}>未装备</div>
        )}
      </div>
      {item && (
        <button
          onClick={handleUnequip}
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
  );
}
