import BaseItem from './BaseItem';
import type { ItemOverrides } from './BaseItem';
import type { WearableSlot } from '../systems/Wearables';
import type { Entity, Vector3Like, QuaternionLike } from 'hytopia';
import BaseItemEntity from '../entities/BaseItemEntity';

export type WearableItemOverrides = ItemOverrides;

export default abstract class BaseWearableItem extends BaseItem {
  // Required static properties that wearable subclasses MUST implement
  static readonly wearableSlot: WearableSlot;
  
  // Optional static properties with defaults for wearables
  static readonly stackable: boolean = false; // Wearables are typically not stackable
  static readonly description: string = 'A cosmetic item that can be worn for style.';
  
  // Wearable-specific model properties (similar to heldModelUri for tools)
  static readonly wearableModelUri?: string; // 3D model when worn on player
  static readonly wearableModelScale?: number; // Scale of the worn model
  static readonly wearableModelTintColor?: string; // Optional tint color
  static readonly defaultRelativePositionAsWorn?: { x: number; y: number; z: number }; // Position relative to anchor
  static readonly defaultRelativeRotationAsWorn?: { x: number; y: number; z: number; w: number }; // Rotation relative to anchor
  
  // Simple factory method
  static create(overrides?: WearableItemOverrides): BaseWearableItem {
    const ItemClass = this as any;
    return new ItemClass(overrides);
  }

  static isWearableItem(item: BaseItem | typeof BaseItem): item is BaseWearableItem {
    return item instanceof BaseWearableItem || 
           (typeof item === 'function' && item.prototype instanceof BaseWearableItem);
  }

  // Instance properties (delegate to static)
  public get wearableSlot(): WearableSlot { 
    return (this.constructor as typeof BaseWearableItem).wearableSlot; 
  }
  
  public get wearableModelUri(): string | undefined {
    return (this.constructor as typeof BaseWearableItem).wearableModelUri;
  }
  
  public get wearableModelScale(): number | undefined {
    return (this.constructor as typeof BaseWearableItem).wearableModelScale;
  }
  
  public get wearableModelTintColor(): string | undefined {
    return (this.constructor as typeof BaseWearableItem).wearableModelTintColor;
  }
  
  public get defaultRelativePositionAsWorn(): { x: number; y: number; z: number } | undefined {
    return (this.constructor as typeof BaseWearableItem).defaultRelativePositionAsWorn;
  }
  
  public get defaultRelativeRotationAsWorn(): { x: number; y: number; z: number; w: number } | undefined {
    return (this.constructor as typeof BaseWearableItem).defaultRelativeRotationAsWorn;
  }
  
  // Method to spawn wearable model on player body (similar to spawnEntityAsHeld for tools)
  public spawnEntityAsWorn(parent: Entity, parentNodeName: string, relativePosition?: Vector3Like, relativeRotation?: QuaternionLike): void {
    if (!this.wearableModelUri) {
      return; // No model to spawn
    }
    
    // Use the same pattern as spawnEntityAsHeld from BaseItem
    if (!(this as any)._requireNotSpawned()) return;
    
    (this as any)._entity = new BaseItemEntity({
      item: this,
      name: this.name,
      modelUri: this.wearableModelUri,
      modelScale: this.wearableModelScale ?? 1.0,
      tintColor: this.wearableModelTintColor as any, // Cast to avoid type error for now
      parent: parent,
      parentNodeName: parentNodeName,
    });

    (this as any)._entity.spawn(
      parent.world!,
      relativePosition ?? this.defaultRelativePositionAsWorn ?? { x: 0, y: 0, z: 0 },
      relativeRotation ?? this.defaultRelativeRotationAsWorn,
    );
    
    // Call the same cleanup method as BaseItem
    (this as any)._afterSpawn();
  }
}
