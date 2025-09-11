import BaseForageableEntity, { BaseForageableEntityOptions, ForageableItemDrop } from '../BaseForageableEntity';
import { SkillId } from '../../config';
import type GamePlayerEntity from '../../GamePlayerEntity';
import RawLogItem from '../../items/materials/RawLogItem';
import BaseLumberToolItem from '../../items/BaseLumberToolItem';
import MinigameManager from '../../systems/MinigameManager';
import { MinigameEvent } from '../../systems/BaseMinigame';
import BeeEntity from '../BeeEntity';

export enum BaseChoppableTreeEntityPlayerEvent {
  CHOPPED = 'BaseChoppableTreeEntity.CHOPPED',
}

export type BaseChoppableTreeEntityPlayerEventPayloads = {
  [BaseChoppableTreeEntityPlayerEvent.CHOPPED]: { entity: ChoppableTreeEntity };
}

export type ChoppableTreeEntityOptions = {
  treeType?: 'oak' | 'pine' | 'birch';
  maturity?: 'young' | 'mature' | 'ancient';
} & Omit<BaseForageableEntityOptions, 'itemDrops' | 'forageDurationMs'>;

export default class ChoppableTreeEntity extends BaseForageableEntity {
  private _treeType: string;
  private _maturity: string;
  private _hasActiveBees: boolean = false;
  private _spawnedBees: BeeEntity[] = [];
  private _playerCooldowns: Map<string, number> = new Map(); // Track cooldowns per player
  private _beeEncounterInProgress: boolean = false; // Prevent interaction during bee encounter setup

  public constructor(options: ChoppableTreeEntityOptions) {
    const treeType = options.treeType ?? 'oak';
    const maturity = options.maturity ?? 'mature';
    
    // Define drops based on tree maturity - only Raw Logs now
    const itemDrops: ForageableItemDrop[] = ChoppableTreeEntity._getTreeDrops(maturity);
    
    // Set chopping duration based on maturity
    const forageDurationMs = ChoppableTreeEntity._getChoppingDuration(maturity);
    
    super({
      interactActionText: 'Press "E" to chop',
      nameplateViewDistnace: 15,
      ...options,
      itemDrops,
      forageDurationMs,
      maxDropsPerForage: maturity === 'ancient' ? 4 : maturity === 'mature' ? 3 : 2,
      experienceReward: maturity === 'ancient' ? 15 : maturity === 'mature' ? 10 : 5,
    });

    this._treeType = treeType;
    this._maturity = maturity;
  }

  public get treeType(): string { return this._treeType; }
  public get maturity(): string { return this._maturity; }

  private _isPlayerOnCooldown(playerId: string): boolean {
    const cooldownEnd = this._playerCooldowns.get(playerId);
    if (!cooldownEnd) return false;
    
    const now = Date.now();
    if (now >= cooldownEnd) {
      this._playerCooldowns.delete(playerId);
      return false;
    }
    return true;
  }

  private _setCooldownForPlayer(playerId: string, durationMs: number = 30000): void {
    const cooldownEnd = Date.now() + durationMs;
    this._playerCooldowns.set(playerId, cooldownEnd);
  }

  private _getRemainingCooldown(playerId: string): number {
    const cooldownEnd = this._playerCooldowns.get(playerId);
    if (!cooldownEnd) return 0;
    
    const remaining = cooldownEnd - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
  }

  public override interact(interactor: GamePlayerEntity): void {
    if (this.isBeingForaged) return;

    // Prevent interaction during bee encounter setup
    if (this._beeEncounterInProgress) {
      return interactor.showNotification('🐝 Bees are emerging! Wait for them to settle.', 'warning');
    }

    // Check if player is on cooldown
    const playerId = interactor.gamePlayer.player.id;
    if (this._isPlayerOnCooldown(playerId)) {
      const remainingSeconds = this._getRemainingCooldown(playerId);
      return interactor.showNotification(`🐝 The bees are still agitated! Wait ${remainingSeconds}s before trying again.`, 'error');
    }

    // Check if player has an axe equipped
    const equippedWeapon = interactor.gamePlayer.hotbar.selectedItem;
    const isLumberTool = equippedWeapon && BaseLumberToolItem.isLumberToolItem(equippedWeapon);
    
    // Tool requirements for different tree maturities
    if (this._maturity === 'mature' && !isLumberTool) {
      return interactor.showNotification(`You need an axe to chop down mature trees!`, 'error');
    }
    
    if (this._maturity === 'ancient') {
      if (!isLumberTool) {
        return interactor.showNotification(`You need an axe to chop down ancient trees!`, 'error');
      }
      
      // Ancient trees specifically require gold axe
      const isGoldAxe = equippedWeapon && (equippedWeapon.constructor as any).id === 'gold_axe';
      if (!isGoldAxe) {
        return interactor.showNotification(`Ancient trees can only be chopped down with a Gold Axe!`, 'error');
      }
    }
    
    // Check for bee encounter (1/3 chance) only if bees aren't already active
    const hasBeehive = !this._hasActiveBees && Math.random() < 0.33;
    
    if (hasBeehive) {
      this._triggerBeeEncounter(interactor);
    } else {
      // Apply tool bonuses and proceed with normal chopping
      this._applyToolBonuses(isLumberTool, equippedWeapon);
      this._handleNormalChopping(interactor);
    }
  }
  
  private _triggerBeeEncounter(interactor: GamePlayerEntity): void {
    // Mark that bees are now active and encounter is in progress
    this._hasActiveBees = true;
    this._beeEncounterInProgress = true;
    
    // Show notification about bees
    interactor.showNotification('🐝 Angry bees emerge from the tree! You must calm them first!', 'warning');
    
    // Spawn bees around the tree
    this._spawnBees();
    
    // Wait 3 seconds to let players see the bees swarming before starting minigame
    setTimeout(() => {
      // Only start minigame if tree still exists and bees are still active
      if (this.world && this._hasActiveBees) {
        this._startBeeMinigame(interactor);
      }
    }, 3000);
  }
  
  private _spawnBees(): void {
    if (!this.world) return;
    
    console.log('ChoppableTreeEntity: Spawning bees around tree at position:', this.position);
    
    // Clear any existing bees
    this._despawnExistingBees();
    
    // Spawn several bee entities that swarm around the tree
    const beeCount = 5 + Math.floor(Math.random() * 3); // 5-7 bees
    const swarmCenter = {
      x: this.position.x,
      y: this.position.y, // Swarm at mid-tree height
      z: this.position.z
    };
    
    for (let i = 0; i < beeCount; i++) {
      const beeEntity = new BeeEntity({
        swarmCenter,
        swarmRadius: 3, // More controlled swarm radius
        flySpeed: 2, // Gentler speed for smoother swarming
        despawnAfterMs: 30000, // Bees stay longer since they're part of gameplay
      });
      
      // Spawn bees at consistent aerial positions around the tree
      const angle = (i / beeCount) * Math.PI * 2 + Math.random() * 0.3;
      const distance = 2 + Math.random() * 1.0; // Reduced randomness in distance
      const beeSpawnPos = {
        x: swarmCenter.x + Math.cos(angle) * distance,
        y: swarmCenter.y, // Use the same height as swarm center
        z: swarmCenter.z + Math.sin(angle) * distance
      };
      
      console.log(`ChoppableTreeEntity: Spawning bee ${i + 1}/${beeCount} at aerial position:`, beeSpawnPos);
      beeEntity.spawn(this.world, beeSpawnPos);
      this._spawnedBees.push(beeEntity);
    }
  }
  
  private _startBeeMinigame(interactor: GamePlayerEntity): void {
    // Clear the encounter in progress flag since minigame is starting
    this._beeEncounterInProgress = false;
    
    // Get current tool bonuses for rewards
    const equippedWeapon = interactor.gamePlayer.hotbar.selectedItem;
    const yieldBonus = (equippedWeapon && BaseLumberToolItem.isLumberToolItem(equippedWeapon)) 
      ? (equippedWeapon.woodYieldBonus || 0) : 0;
    
    // Calculate wood quantity with bonuses
    const baseLogQuantity = this._maturity === 'ancient' ? 8 : this._maturity === 'mature' ? 5 : 3;
    const finalLogQuantity = Math.floor(baseLogQuantity * (1 + yieldBonus));
    
    // Create minigame rewards
    const rewards = [
      {
        itemClass: RawLogItem,
        quantity: finalLogQuantity
      }
    ];
    
    // Start the bee minigame (no countdown)
    const minigame = MinigameManager.startMinigame(interactor, 'bee', { rewards, useCountdown: false });
    
    if (minigame) {
      // Set up event listeners for minigame completion
      minigame.eventRouter.on(MinigameEvent.COMPLETED, () => {
        this._onBeeMinigameCompleted(interactor);
      });
      
      minigame.eventRouter.on(MinigameEvent.FAILED, () => {
        this._onBeeMinigameFailed(interactor);
      });
      
      minigame.eventRouter.on(MinigameEvent.CANCELLED, () => {
        this._onBeeMinigameFailed(interactor);
      });
    } else {
      // Fallback if minigame failed to start
      this._onBeeMinigameFailed(interactor);
    }
  }
  
  private _onBeeMinigameCompleted(interactor: GamePlayerEntity): void {
    // Clear any cooldown for this player since they succeeded
    const playerId = interactor.gamePlayer.player.id;
    this._playerCooldowns.delete(playerId);
    
    // Bees are calmed, remove them
    this._despawnExistingBees();
    this._hasActiveBees = false;
    this._beeEncounterInProgress = false;
    
    interactor.showNotification('🐝 You calmed the bees! Now you can chop the tree.', 'success');
    
    // Now proceed with normal tree chopping
    const equippedWeapon = interactor.gamePlayer.hotbar.selectedItem;
    const isLumberTool = equippedWeapon && BaseLumberToolItem.isLumberToolItem(equippedWeapon);
    this._applyToolBonuses(isLumberTool, equippedWeapon);
    this._handleNormalChopping(interactor);
  }
  
  private _onBeeMinigameFailed(interactor: GamePlayerEntity): void {
    // Set cooldown for this player
    const playerId = interactor.gamePlayer.player.id;
    this._setCooldownForPlayer(playerId, 30000); // 30 second cooldown
    
    interactor.showNotification('💔 The bees are furious! They need time to calm down before you can try again.', 'error');
    
    // Despawn bees and reset bee state
    this._despawnExistingBees();
    this._hasActiveBees = false;
    this._beeEncounterInProgress = false;
  }
  
  private _despawnExistingBees(): void {
    for (const bee of this._spawnedBees) {
      if (bee.world) {
        bee.despawn();
      }
    }
    this._spawnedBees = [];
  }
  
  private _applyToolBonuses(isLumberTool: boolean, equippedWeapon: any): void {
    if (isLumberTool) {
      // Get axe-specific bonuses
      const speedBonus = equippedWeapon.choppingSpeedBonus || 0;
      const yieldBonus = equippedWeapon.woodYieldBonus || 0;
      
      // Apply speed bonus by reducing chopping time
      const originalDuration = this.forageDurationMs;
      (this as any)._forageDurationMs = Math.floor(originalDuration * (1 - speedBonus));
      
      // Apply yield bonus by temporarily increasing drop quantities
      if (yieldBonus > 0) {
        this._applyYieldBonus(yieldBonus);
      }
    }
  }
  
  private _handleNormalChopping(interactor: GamePlayerEntity): void {
    // Original chopping logic using the base class
    super.interact(interactor);
  }
  
  public override despawn(): void {
    // Clean up bees when tree is despawned
    this._despawnExistingBees();
    // Clear all player cooldowns when tree despawns
    this._playerCooldowns.clear();
    // Reset encounter state
    this._hasActiveBees = false;
    this._beeEncounterInProgress = false;
    super.despawn();
  }

  private static _getTreeDrops(maturity: string): ForageableItemDrop[] {
    // Simplified: Only drop Raw Logs, more for bigger trees
    const logQuantity = maturity === 'ancient' ? 8 : maturity === 'mature' ? 5 : 3;
    
    return [{
      itemClass: RawLogItem,
      minQuantity: Math.floor(logQuantity * 0.8),
      maxQuantity: logQuantity,
      weight: 100,
    }];
  }

  private static _getChoppingDuration(maturity: string): number {
    switch (maturity) {
      case 'young': return 2000;   // 2 seconds
      case 'mature': return 4000;  // 4 seconds  
      case 'ancient': return 6000; // 6 seconds
      default: return 4000;
    }
  }

  private _applyYieldBonus(yieldBonus: number): void {
    // Temporarily increase the max quantity of drops
    const originalDrops = [...this.itemDrops];
    
    for (const drop of this.itemDrops) {
      const bonusQuantity = Math.ceil((drop.maxQuantity || 1) * yieldBonus);
      drop.maxQuantity = (drop.maxQuantity || 1) + bonusQuantity;
      if (drop.minQuantity) {
        drop.minQuantity = Math.min(drop.minQuantity, drop.maxQuantity);
      }
    }
    
    // Restore original drops after foraging completes
    setTimeout(() => {
      for (let i = 0; i < originalDrops.length; i++) {
        if (this.itemDrops[i]) {
          this.itemDrops[i].maxQuantity = originalDrops[i].maxQuantity;
          this.itemDrops[i].minQuantity = originalDrops[i].minQuantity;
        }
      }
    }, this.forageDurationMs + 100);
  }
}
