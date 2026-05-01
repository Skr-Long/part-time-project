import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import EquipmentSlot from './EquipmentSlot';

export default function EquipmentModal() {
  const dispatch = useGameDispatch();
  const equipment = useGameSelector(state => state.player.equipment);
  const attributes = useGameSelector(state => state.player.attributes);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleUnequipAll = () => {
    dispatch({ type: 'UNEQUIP_ALL_ITEMS' });
  };

  const hasAnyEquipment = equipment.weapon !== null || equipment.armor !== null || equipment.accessory !== null;

  const totalAttack = attributes.strength + (equipment.weapon?.effects.attackBonus || 0);
  const totalDefense = attributes.physique + (equipment.armor?.effects.defenseBonus || 0);
  const speedBonus = attributes.agility + (equipment.accessory?.effects.speedBonus || 0);
  const hpBonus = (equipment.weapon?.effects.maxHPBonus || 0) +
    (equipment.armor?.effects.maxHPBonus || 0) +
    (equipment.accessory?.effects.maxHPBonus || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-md flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>装备</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        {/* Equipment Slots */}
        <div className="p-4 space-y-3">
          <EquipmentSlot slot="weapon" item={equipment.weapon} />
          <EquipmentSlot slot="armor" item={equipment.armor} />
          <EquipmentSlot slot="accessory" item={equipment.accessory} />
          
          {hasAnyEquipment && (
            <button
              onClick={handleUnequipAll}
              className="w-full px-4 py-2 text-sm rounded-lg border transition-colors"
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderColor: '#fecaca',
                cursor: 'pointer',
              }}
            >
              一键卸下全部装备
            </button>
          )}
        </div>

        {/* Stat Bonuses */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)', backgroundColor: 'rgba(26, 26, 26, 0.05)' }}>
          <h3 className="text-sm mb-3" style={{ color: '#4a4a4a' }}>属性加成</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>总攻击</span>
              <span className="font-serif" style={{ color: '#dc2626' }}>{totalAttack}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>总防御</span>
              <span className="font-serif" style={{ color: '#2563eb' }}>{totalDefense}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>速度加成</span>
              <span className="font-serif" style={{ color: '#16a34a' }}>{speedBonus}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>HP加成</span>
              <span className="font-serif" style={{ color: '#4a7c59' }}>{hpBonus > 0 ? `+${hpBonus}` : '0'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
