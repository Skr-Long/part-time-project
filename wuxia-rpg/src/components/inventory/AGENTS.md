<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# components/inventory

## Purpose
Inventory display and item management.

## Key Files
| File | Description |
|------|-------------|
| `InventoryModal.tsx` | Full inventory panel with tabs and item list |
| `InventoryItem.tsx` | Individual item row with equip/use actions |

## For AI Agents

### Working In This Directory
- Items filtered by type tabs: all/weapon/armor/accessory/consumable/material
- `EQUIP_ITEM` action equips equippable items
- `USE_ITEM` action consumes consumable items
- `DROP_ITEM` action removes items from inventory

### Item Types
- `weapon`, `armor`, `accessory` - equippable
- `consumable` - usable once
- `material`, `quest` - non-usable

### Gold Display
Format: copper shown as "X铜", >=1000 shown as "X.X金"
