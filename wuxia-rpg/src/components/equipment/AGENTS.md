<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# components/equipment

## Purpose
Equipment display and management components.

## Key Files
| File | Description |
|------|-------------|
| `EquipmentModal.tsx` | Full equipment panel showing all slots and stat bonuses |
| `EquipmentSlot.tsx` | Individual equipment slot (weapon/armor/accessory) |

## For AI Agents

### Working In This Directory
- Equipment slots: weapon (⚔️), armor (🛡️), accessory (💍)
- `UNEQUIP_ITEM` action removes item from slot and returns to inventory
- Stat bonuses calculated from `equipment.weapon?.effects`, `equipment.armor?.effects`, `equipment.accessory?.effects`
- Total attack = strength + weapon.attackBonus
- Total defense = physique + armor.defenseBonus

### Component Props
```typescript
// EquipmentSlot
{ slot: 'weapon'|'armor'|'accessory', item: EquipmentItem | null }

// EquipmentModal
(no props - reads from context)
```
