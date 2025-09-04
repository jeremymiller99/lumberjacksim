import BaseItem, { ItemOverrides } from './BaseItem';
import GamePlayerEntity from '../GamePlayerEntity';
import ChoppableTreeEntity from '../entities/forageables/ChoppableTreeEntity';
import type { Vector3Like } from 'hytopia';

export type LumberToolBonuses = {
  choppingSpeedBonus?: number; // Percentage reduction in chopping time (0.25 = 25% faster)
  woodYieldBonus?: number; // Percentage increase in wood drops (0.15 = 15% more wood)
  durabilityBonus?: number; // For future durability system
}

export type LumberToolOverrides = {
  bonuses?: LumberToolBonuses;
} & ItemOverrides;

export default abstract class BaseLumberToolItem extends BaseItem {
  // Required static properties that tool subclasses MUST implement
  static readonly choppingSpeedBonus?: number;
  static readonly woodYieldBonus?: number;
  static readonly durabilityBonus?: number;

  // Simple factory method
  static create(overrides?: LumberToolOverrides): BaseLumberToolItem {
    const ItemClass = this as any;
    return new ItemClass(overrides);
  }

  static isLumberToolItem(item: BaseItem | typeof BaseItem): item is BaseLumberToolItem {
    if (typeof item === 'function') {
      return BaseLumberToolItem.prototype.isPrototypeOf(item.prototype);
    }

    return item instanceof BaseLumberToolItem;
  }

  // Instance properties (delegate to static or use overrides)
  public get choppingSpeedBonus(): number { 
    return this._bonuses?.choppingSpeedBonus ?? (this.constructor as typeof BaseLumberToolItem).choppingSpeedBonus ?? 0; 
  }
  public get woodYieldBonus(): number { 
    return this._bonuses?.woodYieldBonus ?? (this.constructor as typeof BaseLumberToolItem).woodYieldBonus ?? 0; 
  }
  public get durabilityBonus(): number { 
    return this._bonuses?.durabilityBonus ?? (this.constructor as typeof BaseLumberToolItem).durabilityBonus ?? 0; 
  }

  // Instance-specific properties that can be overridden
  private readonly _bonuses?: LumberToolBonuses;
  private _lastUsedAtMs: number = 0;
  private _usageCooldownMs: number = 100; // Prevent spam clicking

  public constructor(overrides?: LumberToolOverrides) {
    super(overrides);
    this._bonuses = overrides?.bonuses;
  }

  public get canUse(): boolean { 
    return performance.now() >= this._lastUsedAtMs + this._usageCooldownMs; 
  }

  public override clone(overrides?: LumberToolOverrides): BaseLumberToolItem {
    const ToolClass = this.constructor as any;
    return new ToolClass({
      quantity: this.quantity,
      bonuses: this._bonuses,
      ...overrides,
    });
  }

  public override useMouseLeft(): void {
    // Disabled - use E key instead
  }

  public override useMouseRight(): void {
    // Disabled - use E key instead
  }

  public override interact(playerEntity: GamePlayerEntity): void {
    // Make E key work the same as mouse 1 for chopping
    this.performChoppingAction();
  }

  public performChoppingAction(): void {
    if (!this.entity?.parent || !this.canUse) {
      return;
    }

    const playerEntity = this.entity.parent as GamePlayerEntity;
    
    // Play chopping animation
    playerEntity.startModelOneshotAnimations(['foraging-transition']);
    
    // Find nearest tree to chop
    const nearbyTree = this.findNearestChoppableTree(playerEntity);
    
    if (nearbyTree) {
      // Interact with the tree (this will use the tool's bonuses)
      nearbyTree.interact(playerEntity);
    } else {
      // Show notification if no tree is nearby
      playerEntity.showNotification('No tree nearby to chop!', 'error');
    }

    this._lastUsedAtMs = performance.now();
  }

  protected findNearestChoppableTree(playerEntity: GamePlayerEntity): ChoppableTreeEntity | undefined {
    if (!playerEntity.world) return undefined;
    if (!playerEntity.world.entityManager) return undefined;
    if (!playerEntity.world.entityManager.entities) return undefined;

    const playerPosition = playerEntity.position;
    const searchRadius = 3; // 3 blocks reach
    let nearestTree: ChoppableTreeEntity | undefined;
    let nearestDistance = Infinity;

    // Search for nearby choppable trees
    for (const entity of playerEntity.world.entityManager.entities.values()) {
      if (entity instanceof ChoppableTreeEntity) {
        const distance = this.calculateDistance(playerPosition, entity.position);
        if (distance <= searchRadius && distance < nearestDistance) {
          nearestTree = entity;
          nearestDistance = distance;
        }
      }
    }

    return nearestTree;
  }

  protected calculateDistance(pos1: Vector3Like, pos2: Vector3Like): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Helper method to get tool quality for UI/feedback
  public getToolQuality(): 'basic' | 'good' | 'excellent' {
    const totalBonus = this.choppingSpeedBonus + this.woodYieldBonus;
    if (totalBonus >= 0.6) return 'excellent';
    if (totalBonus >= 0.3) return 'good';
    return 'basic';
  }
}


