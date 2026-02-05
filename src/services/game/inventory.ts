/**
 * Inventory system - items, effects, and definitions
 */

import { generateId } from '../../utils/id';
import type { InventoryItem, ItemType } from '../../types/models';

/**
 * Item definition (template) - used for creation and drops
 */
export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  effect?: string; // heal:10, roll_bonus:2, modifier:strength:1
  description: string;
  defaultQuantity?: number;
  equipmentSlot?: 'weapon' | 'armor';
}

/**
 * Starting items available at character creation
 */
export const STARTING_ITEMS: ItemDefinition[] = [
  {
    id: 'healing_potion',
    name: 'Healing Potion',
    type: 'consumable',
    effect: 'heal:10',
    description: 'Restores 10 HP when used',
    defaultQuantity: 2,
  },
  {
    id: 'lesser_healing_potion',
    name: 'Lesser Healing Potion',
    type: 'consumable',
    effect: 'heal:5',
    description: 'Restores 5 HP when used',
    defaultQuantity: 3,
  },
  {
    id: 'rope',
    name: 'Rope (50ft)',
    type: 'equipment',
    effect: 'roll_bonus:1',
    description: '+1 to agility rolls when climbing or tying',
    defaultQuantity: 1,
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    type: 'equipment',
    effect: 'roll_bonus:1',
    description: '+1 to any roll (narrative luck)',
    defaultQuantity: 1,
  },
  {
    id: 'iron_rations',
    name: 'Iron Rations',
    type: 'consumable',
    description: 'One day of food. No mechanical effect.',
    defaultQuantity: 5,
  },
  {
    id: 'torch',
    name: 'Torch',
    type: 'consumable',
    description: 'Light source. No mechanical effect.',
    defaultQuantity: 3,
  },
  {
    id: 'thieves_tools',
    name: "Thieves' Tools",
    type: 'equipment',
    effect: 'roll_bonus:2',
    description: '+2 to agility rolls when picking locks or disarming traps',
    defaultQuantity: 1,
  },
  {
    id: 'shield',
    name: 'Shield',
    type: 'equipment',
    effect: 'roll_bonus:1',
    description: '+1 to agility rolls when defending',
    defaultQuantity: 1,
  },
  // Weapons
  {
    id: 'shortsword',
    name: 'Shortsword',
    type: 'equipment',
    effect: 'damage_bonus:2',
    equipmentSlot: 'weapon',
    description: '+2 to damage rolls in combat',
    defaultQuantity: 1,
  },
  {
    id: 'dagger',
    name: 'Dagger',
    type: 'equipment',
    effect: 'damage_bonus:1',
    equipmentSlot: 'weapon',
    description: '+1 to damage rolls',
    defaultQuantity: 1,
  },
  {
    id: 'staff',
    name: 'Staff',
    type: 'equipment',
    effect: 'damage_bonus:1',
    equipmentSlot: 'weapon',
    description: '+1 to damage rolls',
    defaultQuantity: 1,
  },
  // Armor
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: 'equipment',
    effect: 'damage_reduction:2',
    equipmentSlot: 'armor',
    description: 'Reduces incoming damage by 2',
    defaultQuantity: 1,
  },
  {
    id: 'chainmail',
    name: 'Chainmail',
    type: 'equipment',
    effect: 'damage_reduction:4',
    equipmentSlot: 'armor',
    description: 'Reduces incoming damage by 4',
    defaultQuantity: 1,
  },
];

/**
 * Items the AI can drop during gameplay
 */
export const DROPPABLE_ITEMS: ItemDefinition[] = [
  ...STARTING_ITEMS,
  {
    id: 'greater_healing_potion',
    name: 'Greater Healing Potion',
    type: 'consumable',
    effect: 'heal:20',
    description: 'Restores 20 HP when used',
    defaultQuantity: 1,
  },
  {
    id: 'magic_sword',
    name: 'Magic Sword',
    type: 'equipment',
    effect: 'roll_bonus:2,damage_bonus:3',
    equipmentSlot: 'weapon',
    description: '+2 to attack rolls, +3 to damage',
    defaultQuantity: 1,
  },
  {
    id: 'plate_armor',
    name: 'Plate Armor',
    type: 'equipment',
    effect: 'damage_reduction:6',
    equipmentSlot: 'armor',
    description: 'Heavy armor, reduces damage by 6',
    defaultQuantity: 1,
  },
  {
    id: 'amulet_protection',
    name: 'Amulet of Protection',
    type: 'equipment',
    effect: 'roll_bonus:1',
    description: '+1 to any defensive roll',
    defaultQuantity: 1,
  },
  {
    id: 'gold_coins',
    name: 'Gold Coins',
    type: 'other',
    description: 'Currency. Narrative use only.',
    defaultQuantity: 10,
  },
];

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return DROPPABLE_ITEMS.find((i) => i.id === itemId);
}

/**
 * Create an inventory item from definition
 */
export function createInventoryItem(
  itemId: string,
  quantity: number = 1
): InventoryItem | null {
  const def = getItemDefinition(itemId);
  if (!def) return null;

  const qty = quantity > 0 ? quantity : def.defaultQuantity ?? 1;

  return {
    id: generateId(),
    itemId: def.id,
    name: def.name,
    type: def.type,
    quantity: qty,
    effect: def.effect,
    description: def.description,
  };
}

/**
 * Parse effect string: "heal:10" -> { type: 'heal', value: 10 }
 */
export function parseItemEffect(effect: string): { type: string; value?: number; attr?: string } | null {
  if (!effect) return null;
  const [type, ...rest] = effect.split(':');
  if (type === 'heal') {
    return { type: 'heal', value: parseInt(rest[0], 10) };
  }
  if (type === 'roll_bonus') {
    return { type: 'roll_bonus', value: parseInt(rest[0], 10) };
  }
  if (type === 'modifier') {
    return { type: 'modifier', attr: rest[0], value: parseInt(rest[1], 10) };
  }
  if (type === 'damage_bonus') {
    return { type: 'damage_bonus', value: parseInt(rest[0], 10) };
  }
  if (type === 'damage_reduction') {
    return { type: 'damage_reduction', value: parseInt(rest[0], 10) };
  }
  return null;
}

/** Parse all effects from a comma-separated effect string */
export function parseAllEffects(effect: string): Array<{ type: string; value?: number; attr?: string }> {
  if (!effect) return [];
  return effect.split(',').map((e) => parseItemEffect(e.trim())).filter((p): p is NonNullable<typeof p> => p !== null);
}

/** Format equipment effects for display (e.g. "+2 damage", "-2 damage taken") */
export function formatEquipmentEffects(effect: string | undefined): string[] {
  if (!effect) return [];
  const results: string[] = [];
  for (const parsed of parseAllEffects(effect)) {
    if (parsed.type === 'damage_bonus' && parsed.value) {
      results.push(`+${parsed.value} damage`);
    } else if (parsed.type === 'damage_reduction' && parsed.value) {
      results.push(`-${parsed.value} damage taken`);
    } else if (parsed.type === 'roll_bonus' && parsed.value) {
      results.push(`+${parsed.value} to rolls`);
    } else if (parsed.type === 'modifier' && parsed.attr && parsed.value) {
      const attrName = parsed.attr.charAt(0).toUpperCase() + parsed.attr.slice(1);
      results.push(`+${parsed.value} ${attrName}`);
    }
  }
  return results;
}

/**
 * Get armor damage reduction from equipped armor
 */
export function getArmorDamageReduction(
  equippedArmorId: string | undefined,
  inventory: InventoryItem[] | undefined
): number {
  if (!equippedArmorId || !inventory) return 0;
  const item = inventory.find((i) => i.itemId === equippedArmorId);
  if (!item?.effect) return 0;
  for (const parsed of parseAllEffects(item.effect)) {
    if (parsed.type === 'damage_reduction' && parsed.value) return parsed.value;
  }
  return 0;
}

/**
 * Get weapon damage bonus (for when player deals damage - narrative use)
 */
export function getWeaponDamageBonus(
  equippedWeaponId: string | undefined,
  inventory: InventoryItem[] | undefined
): number {
  if (!equippedWeaponId || !inventory) return 0;
  const item = inventory.find((i) => i.itemId === equippedWeaponId);
  if (!item?.effect) return 0;
  for (const parsed of parseAllEffects(item.effect)) {
    if (parsed.type === 'damage_bonus' && parsed.value) return parsed.value;
  }
  return 0;
}

/**
 * Get roll bonus from equipment in inventory
 */
export function getEquipmentRollBonus(inventory: InventoryItem[] | undefined): number {
  if (!inventory) return 0;
  let bonus = 0;
  for (const item of inventory) {
    if (item.type === 'equipment' && item.effect) {
      for (const parsed of parseAllEffects(item.effect)) {
        if (parsed.type === 'roll_bonus' && parsed.value) bonus += parsed.value;
      }
    }
  }
  return Math.min(bonus, 5); // Cap at +5 from equipment
}
