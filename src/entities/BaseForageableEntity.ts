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
  private _experienceReward: number;
  private _currentProgressInterval?: NodeJS.Timeout;
  private _currentForageTimeout?: NodeJS.Timeout;
  private _currentInteractor?: GamePlayerEntity;
  private _lastProgressBucket: number = -1;

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

  public get forageDurationMs(): number { return this._forageDurationMs; }
  public get itemDrops(): ForageableItemDrop[] { return this._itemDrops; }
  public get maxDropsPerForage(): number { return this._maxDropsPerForage; }
  public get isBeingForaged(): boolean { return this._isBeingForaged; }

  private _cleanupForaging(): void {
    if (this._currentProgressInterval) {
      clearInterval(this._currentProgressInterval);
      this._currentProgressInterval = undefined;
    }
    
    if (this._currentForageTimeout) {
      clearTimeout(this._currentForageTimeout);
      this._currentForageTimeout = undefined;
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
    
    // Update the existing nameplate to show progress
    if (this._nameplateSceneUI) {
      this._nameplateSceneUI.setState({
        name: progressText,
        health: 0, // Start with 0 progress
        maxHealth: 100, // Max progress is 100%
        interactable: false, // Hide interact text during chopping
      });
    }

    // Progress tracking
    const startTime = performance.now();
    const updateInterval = 100; // Update every 100ms for smooth progress
    
    this._currentProgressInterval = setInterval(() => {
      if (!this.isSpawned || !interactor.isSpawned || !this._nameplateSceneUI) {
        this._cleanupForaging();
        return;
      }

      const elapsed = performance.now() - startTime;
      const progress = Math.min((elapsed / this._forageDurationMs) * 100, 100);
      const pct = Math.round(progress);

      // Update the existing nameplate's health bar to show progress
      this._nameplateSceneUI.setState({
        name: progressText,
        health: progress,
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

      if (interactor.isSpawned) {
        interactor.setIsMovementDisabled(false);
        interactor.stopModelAnimations([ 'foraging-transition' ]);
        interactor.playerController.idleLoopedAnimations = [ 'idle-upper', 'idle-lower' ];
      }

      if (!interactor.gamePlayer.isDead) {
        interactor.gamePlayer.adjustSkillExperience(SkillId.LUMBER, this._experienceReward);
        console.log(`BaseForageableEntity: Emitting FORAGED event for ${this.name}`);
        interactor.gamePlayer.eventRouter.emit(BaseForageableEntityPlayerEvent.FORAGED, { entity: this });
      }

      this.forageItems();
      this.despawn();
    }, this._forageDurationMs);
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
