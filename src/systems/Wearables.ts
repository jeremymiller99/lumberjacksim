import ItemInventory from './ItemInventory';
import type { SerializedItemInventoryData } from './ItemInventory';
import type GamePlayer from '../GamePlayer';
import type BaseItem from '../items/BaseItem';
import BaseWearableItem from '../items/BaseWearableItem';

export type WearableSlot = 'helmet' | 'armor' | 'gloves' | 'leggings' | 'boots' | 'accessory';

export const WEARABLE_SLOT_POSITIONS: Record<WearableSlot, number> = {
  helmet: 0,
  armor: 1,
  gloves: 2,
  leggings: 3,
  boots: 4,
  accessory: 5
};

export const WEARABLE_POSITION_SLOTS: Record<number, WearableSlot> = {
  0: 'helmet',
  1: 'armor',
  2: 'gloves',
  3: 'leggings',
  4: 'boots',
  5: 'accessory'
};

// Body anchor points for each wearable slot (using actual anchor names from player model)
// TEMP: Using torso-anchor for all to test if spawning works at all
export const WEARABLE_SLOT_ANCHORS: Record<WearableSlot, string> = {
  helmet: 'torso-anchor', // TEMP: Using torso for testing
  armor: 'torso-anchor', // Torso anchor for chest armor/clothing
  gloves: 'torso-anchor', // TEMP: Using torso for testing
  leggings: 'torso-anchor', // TEMP: Using torso for testing
  boots: 'torso-anchor', // TEMP: Using torso for testing
  accessory: 'torso-anchor' // TEMP: Using torso for testing
};

export default class Wearables extends ItemInventory {
  private _owner: GamePlayer;
  private _equippedItems: Map<WearableSlot, BaseWearableItem> = new Map();

  public constructor(owner: GamePlayer) {
    super(6, 3, 'wearables'); // 6 wearable slots, 3 wide grid
    this._owner = owner;
  }

  public get owner(): GamePlayer { return this._owner; }

  public getWearableAtSlot(slot: WearableSlot): BaseItem | null {
    const position = WEARABLE_SLOT_POSITIONS[slot];
    return this.getItemAt(position);
  }

  public setWearableAtSlot(slot: WearableSlot, item: BaseItem | null): boolean {
    const position = WEARABLE_SLOT_POSITIONS[slot];
    
    // Validate that the item belongs in this slot
    const wearableItem = item as any;
    if (item && wearableItem.wearableSlot !== slot) {
      return false;
    }
    
    // Remove existing item at position first
    const existingItem = this.getItemAt(position);
    if (existingItem) {
      this.removeItem(position);
    }
    
    // Add new item if provided
    if (item) {
      return this.addItem(item, position);
    }
    
    return true;
  }

  public override addItem(item: BaseItem, position?: number): boolean {
    // Validate that wearable items can only go in appropriate slots
    if (item instanceof BaseWearableItem) {
      const slot = this.getSlotForPosition(position!);
      
      if (slot && item.wearableSlot !== slot) {
        return false; // Item doesn't belong in this slot
      }
      
      // If no specific position provided, find the correct slot for this item
      if (position === undefined) {
        const correctPosition = WEARABLE_SLOT_POSITIONS[item.wearableSlot];
        return super.addItem(item, correctPosition);
      }
    }
    
    return super.addItem(item, position);
  }

  public getSlotForPosition(position: number): WearableSlot | null {
    return WEARABLE_POSITION_SLOTS[position] || null;
  }

  // For cosmetic items, damage reduction is 0, but we keep this method for future expansion
  public getReducedDamage(damage: number): number {
    // For now, cosmetic items provide no damage reduction
    // This can be expanded later if we add functional wearables
    return damage;
  }

  protected override onSlotChanged(position: number, item: BaseItem | null): void {
    this.syncUIUpdate(this._owner.player, position, item);
    
    // Handle 3D model spawning/despawning for wearables
    const slot = this.getSlotForPosition(position);
    if (slot && this._owner.currentEntity) {
      const anchorPoint = WEARABLE_SLOT_ANCHORS[slot];
      
      // Despawn any previously equipped item in this slot
      const previouslyEquipped = this._equippedItems.get(slot);
      if (previouslyEquipped) {
        previouslyEquipped.despawnEntity();
        this._equippedItems.delete(slot);
      }
      
      // If a new wearable item was equipped, spawn it
      if (item && item instanceof BaseWearableItem) {
        item.spawnEntityAsWorn(this._owner.currentEntity, anchorPoint);
        this._equippedItems.set(slot, item);
      }
    }
  }
  
  // Method to spawn all currently equipped wearables (called when player entity is created)
  public spawnAllEquippedWearables(): void {
    if (!this._owner.currentEntity) return;
    
    // Clear the equipped items map first (in case of reconnect)
    this._equippedItems.clear();
    
    for (const [slotName, position] of Object.entries(WEARABLE_SLOT_POSITIONS)) {
      const slot = slotName as WearableSlot;
      const item = this.getItemAt(position);
      if (item && item instanceof BaseWearableItem) {
        const anchorPoint = WEARABLE_SLOT_ANCHORS[slot];
        item.spawnEntityAsWorn(this._owner.currentEntity, anchorPoint);
        this._equippedItems.set(slot, item);
      }
    }
  }
  
  // Method to despawn all currently equipped wearables (called when player entity is despawned)
  public despawnAllEquippedWearables(): void {
    for (const [slot, item] of this._equippedItems) {
      if (item && item.entity) {
        item.despawnEntity();
      }
    }
    this._equippedItems.clear();
  }
}
