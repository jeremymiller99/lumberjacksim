import BaseEntity, { BaseEntityOptions } from './BaseEntity';
import { SkillId } from '../config';
import type { ItemClass } from '../items/BaseItem';
import type GamePlayerEntity from '../GamePlayerEntity';
import { SceneUI } from 'hytopia';

export enum BaseForageableEntityPlayerEvent {
  FORAGED = 'BaseForageableEntity.FORAGED',
}

export type BaseForageableEntityPlayerEventPayloads = {
  [BaseForageableEntityPlayerEvent.FORAGED]: { entity: BaseForageableEntity };
}

export type ForageableItemDrop = {
  itemClass: ItemClass;
  maxQuantity?: number;
  minQuantity?: number;
  weight: number;
  quantity?: number;
}

export type BaseForageableEntityOptions = {
  forageDurationMs: number;
  itemDrops: ForageableItemDrop[];
  maxDropsPerForage?: number;
  experienceReward?: number;
} & BaseEntityOptions;

export default class BaseForageableEntity extends BaseEntity {
  private _forageDurationMs: number;
  private _itemDrops: ForageableItemDrop[];
  private _totalDropWeight: number = 0;
  private _maxDropsPerForage: number;
  private _isBeingForaged: boolean = false;
  private _isFalling: boolean = false;
  private _experienceReward: number;
  private _currentProgressInterval?: NodeJS.Timeout;
  private _currentForageTimeout?: NodeJS.Timeout;
  private _currentInteractor?: GamePlayerEntity;
  private _lastProgressBucket: number = -1;
  private _choppingProgressSceneUI?: SceneUI;

  public constructor(options: BaseForageableEntityOptions) {
    super({
      interactActionText: 'Press "E" to forage',
      nameplateViewDistnace: 10,
      ...options,
    });

    this._forageDurationMs = options.forageDurationMs;
    this._itemDrops = options.itemDrops;
    this._totalDropWeight = this._itemDrops.reduce((sum, drop) => sum + drop.weight, 0);
    this._maxDropsPerForage = options.maxDropsPerForage ?? 1;
    this._experienceReward = options.experienceReward ?? 1;
  }

  protected override setupNameplateUI(): void {
    this._nameplateSceneUI = new SceneUI({
      attachedToEntity: this,
      offset: { x: 0, y: 0, z: 0 },
      templateId: 'entity-nameplate',
      viewDistance: this._nameplateViewDistance,
      state: {
        name: this.name,
        className: this.constructor.name,
        health: this.health,
        interactable: this.isInteractable,
        interactActionText: this.interactActionText,
        maxHealth: this.maxHealth,
        type: this._nameplateType,
      },
    });
  }

  public get forageDurationMs(): number { return this._forageDurationMs; }
  public get itemDrops(): ForageableItemDrop[] { return this._itemDrops; }
  public get maxDropsPerForage(): number { return this._maxDropsPerForage; }
  public get isBeingForaged(): boolean { return this._isBeingForaged; }
  public get isFalling(): boolean { return this._isFalling; }

  private _cleanupForaging(): void {
    if (this._currentProgressInterval) {
      clearInterval(this._currentProgressInterval);
      this._currentProgressInterval = undefined;
    }
    
    if (this._currentForageTimeout) {
      clearTimeout(this._currentForageTimeout);
      this._currentForageTimeout = undefined;
    }

    // Clean up tree chopping SceneUI if it exists
    if (this._choppingProgressSceneUI) {
      this._choppingProgressSceneUI.unload();
      this._choppingProgressSceneUI = undefined;
    }

    // Restore the original nameplate state
    if (this._nameplateSceneUI) {
      this._nameplateSceneUI.setState({
        name: this.name,
        health: this.health,
        maxHealth: this.maxHealth,
        interactable: this.isInteractable,
        interactActionText: this.interactActionText,
      });
    }

    if (this._currentInteractor) {
      this._currentInteractor.setIsMovementDisabled(false);
      this._currentInteractor.stopModelAnimations([ 'foraging-transition' ]);
      this._currentInteractor.playerController.idleLoopedAnimations = [ 'idle-upper', 'idle-lower' ];
      this._currentInteractor = undefined;
    }

    this._isBeingForaged = false;
    this._lastProgressBucket = -1;
  }

  public override despawn(): void {
    this._cleanupForaging();
    super.despawn();
  }

  public forageItems(): void {
    if (!this.world || !this._itemDrops || this._itemDrops.length === 0) return;

    const maxDrops = Math.floor(Math.random() * this._maxDropsPerForage) + 1;

    for (let i = 0; i < maxDrops; i++) {
      const selectedDrop = this._selectRandomDrop();
      if (!selectedDrop) continue;

      const quantity = this._calculateDropQuantity(selectedDrop);
      const item = selectedDrop.itemClass.create({ quantity });
      item.spawnEntityAsEjectedDrop(this.world, this.position);
    }
  }

  public override interact(interactor: GamePlayerEntity): void {
    if (this._isBeingForaged) return;

    this._isBeingForaged = true;
    this._currentInteractor = interactor;
    this._lastProgressBucket = -1;
    interactor.setIsMovementDisabled(true);
    interactor.startModelOneshotAnimations([ 'foraging-transition' ]);
    interactor.playerController.idleLoopedAnimations = [ 'foraging-loop' ]; // player controller stops all looped animations atm for its state, so we set the idle looped animations instead.

    // Show progress on the existing nameplate by updating its health bar
    const progressText = this.name.includes('Tree') ? 'Chopping...' : 'Foraging...';
    const isTree = this.name.includes('Tree');
    
    if (isTree) {
      // Create a separate SceneUI for tree chopping progress
      this._choppingProgressSceneUI = new SceneUI({
        attachedToEntity: this,
        offset: { x: 0, y: -0.5, z: 0 },
        templateId: 'entity-nameplate',
        viewDistance: this._nameplateViewDistance,
        state: {
          name: progressText,
          className: this.constructor.name,
          health: 0, // Start with 0 progress
          maxHealth: 100, // Max progress is 100%
          interactable: false, // Hide interact text during chopping
          type: this._nameplateType,
        },
      });
      if (this.world) {
        this._choppingProgressSceneUI.load(this.world);
      }
      
      // Hide the original nameplate during chopping
      if (this._nameplateSceneUI) {
        this._nameplateSceneUI.setState({
          name: '',
          health: 0,
          maxHealth: 0,
          interactable: false,
        });
      }
    } else {
      // Update the existing nameplate to show progress for non-tree forageables
      if (this._nameplateSceneUI) {
        this._nameplateSceneUI.setState({
          name: progressText,
          health: 0, // Start with 0 progress
          maxHealth: 100, // Max progress is 100%
          interactable: false, // Hide interact text during chopping
        });
      }
    }

    // Progress tracking
    const startTime = performance.now();
    const updateInterval = 100; // Update every 100ms for smooth progress
    
    this._currentProgressInterval = setInterval(() => {
      const progressUI = isTree ? this._choppingProgressSceneUI : this._nameplateSceneUI;
      if (!this.isSpawned || !interactor.isSpawned || !progressUI) {
        this._cleanupForaging();
        return;
      }

      const elapsed = performance.now() - startTime;
      const progress = Math.min((elapsed / this._forageDurationMs) * 100, 100);
      const pct = Math.round(progress);

      // Update the appropriate UI's health bar to show progress
      progressUI.setState({
        name: progressText,
        health: pct,  // Use rounded percentage instead of raw progress decimal
        maxHealth: 100
      });

      // Progress tracking for internal use (notifications removed to reduce spam)
      const bucket = Math.floor(pct / 25);
      if (bucket !== this._lastProgressBucket) {
        this._lastProgressBucket = bucket;
        // Removed percentage notifications to reduce spam
      }

      if (progress >= 100) {
        if (this._currentProgressInterval) {
          clearInterval(this._currentProgressInterval);
          this._currentProgressInterval = undefined;
        }
      }
    }, updateInterval);

    this._currentForageTimeout = setTimeout(() => {
      if (!this.isSpawned) {
        this._cleanupForaging();
        return;
      }

      // Clean up player state immediately
      if (interactor.isSpawned) {
        interactor.setIsMovementDisabled(false);
        interactor.stopModelAnimations([ 'foraging-transition' ]);
        interactor.playerController.idleLoopedAnimations = [ 'idle-upper', 'idle-lower' ];
      }

      // Award experience and emit events
      if (!interactor.gamePlayer.isDead) {
        interactor.gamePlayer.adjustSkillExperience(SkillId.LUMBER, this._experienceReward);
        
        console.log(`BaseForageableEntity: Emitting FORAGED event for ${this.name}`);
        interactor.gamePlayer.eventRouter.emit(BaseForageableEntityPlayerEvent.FORAGED, { entity: this });
      }

      // Drop items
      this.forageItems();
      
      // Reset internal state
      this._isBeingForaged = false;
      this._lastProgressBucket = -1;
      this._currentInteractor = undefined;
      
      // Clear any remaining intervals/timeouts
      if (this._currentProgressInterval) {
        clearInterval(this._currentProgressInterval);
        this._currentProgressInterval = undefined;
      }
      
      // Start tree falling animation (this will handle all UI cleanup to prevent popup bug)
      this._startFallingAnimation();
    }, this._forageDurationMs);
  }

  private _startFallingAnimation(): void {
    if (!this.world) {
      // If no world, just despawn immediately
      this.despawn();
      return;
    }

    // Set falling state to prevent further interaction
    this._isFalling = true;

    // Immediately hide any remaining UI elements to prevent popup bug
    if (this._choppingProgressSceneUI) {
      this._choppingProgressSceneUI.unload();
      this._choppingProgressSceneUI = undefined;
    }
    
    // Hide the original nameplate during falling animation
    if (this._nameplateSceneUI) {
      this._nameplateSceneUI.setState({
        name: '',
        health: 0,
        maxHealth: 0,
        interactable: false,
        experienceGain: undefined
      });
    }

    // Enable rotations on all axes so the tree can actually fall over
    // By default, BaseEntity disables X and Z rotations, preventing falling
    this.setEnabledRotations({ x: true, y: true, z: true });
    
    // Simple tree fall animation - just tip over in one direction
    // Pick a simple direction: forward, backward, left, or right
    const directions = [
      { x: 1.5, y: 0, z: 0 },   // Tip forward
      { x: -1.5, y: 0, z: 0 },  // Tip backward  
      { x: 0, y: 0, z: 1.5 },   // Tip left
      { x: 0, y: 0, z: -1.5 }   // Tip right
    ];
    
    const fallDirection = directions[Math.floor(Math.random() * directions.length)];
    
    // Apply a gentle angular velocity to make the tree tip over
    this.setAngularVelocity(fallDirection);

    // Despawn after animation completes
    setTimeout(() => {
      this.despawn();
    }, 1200); // 1.2 seconds for the fall animation
  }

  private _calculateDropQuantity(drop: ForageableItemDrop): number {
    const min = drop.minQuantity ?? 1;
    const max = drop.maxQuantity ?? 1;
    return drop.quantity ?? Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private _selectRandomDrop(): ForageableItemDrop | null {
    if (this._totalDropWeight <= 0) return null;

    const random = Math.random() * this._totalDropWeight;
    let cumulativeWeight = 0;

    for (const drop of this._itemDrops) {
      cumulativeWeight += drop.weight;
      if (random < cumulativeWeight) {
        return drop;
      }
    }

    return null;
  }
}
