import BaseForageableEntity, { BaseForageableEntityOptions, ForageableItemDrop } from '../BaseForageableEntity';
import { SkillId } from '../../config';
import type GamePlayerEntity from '../../GamePlayerEntity';
import RawLogItem from '../../items/materials/RawLogItem';
import BaseLumberToolItem from '../../items/BaseLumberToolItem';

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

  public override interact(interactor: GamePlayerEntity): void {
    if (this.isBeingForaged) return;

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
    
    let speedBonus = 0;
    let yieldBonus = 0;
    
    if (isLumberTool) {
      // Get axe-specific bonuses
      speedBonus = equippedWeapon.choppingSpeedBonus || 0;
      yieldBonus = equippedWeapon.woodYieldBonus || 0;
      
      // Apply speed bonus by reducing chopping time
      const originalDuration = this.forageDurationMs;
      (this as any)._forageDurationMs = Math.floor(originalDuration * (1 - speedBonus));
      
      // Apply yield bonus by temporarily increasing drop quantities
      if (yieldBonus > 0) {
        this._applyYieldBonus(yieldBonus);
      }
    }

    // Use lumber skill instead of foraging
    const originalInteract = super.interact.bind(this);
    
    // Override the skill experience reward
    const originalAdjustSkill = interactor.gamePlayer.adjustSkillExperience.bind(interactor.gamePlayer);
    interactor.gamePlayer.adjustSkillExperience = (skillId, experience) => {
      if (skillId === SkillId.LUMBER) {
        // Award lumber experience instead
        originalAdjustSkill(SkillId.LUMBER, experience);
      } else {
        originalAdjustSkill(skillId, experience);
      }
    };

    // Set chopping animations
    interactor.setIsMovementDisabled(true);
    interactor.startModelOneshotAnimations(['foraging-transition']);
    interactor.playerController.idleLoopedAnimations = ['foraging-loop'];

    setTimeout(() => {
      if (!this.isSpawned) return;

      if (interactor.isSpawned) {
        interactor.setIsMovementDisabled(false);
        interactor.stopModelAnimations(['foraging-transition']);
        interactor.playerController.idleLoopedAnimations = ['idle-upper', 'idle-lower'];
      }

      if (!interactor.gamePlayer.isDead) {
        interactor.gamePlayer.adjustSkillExperience(SkillId.LUMBER, this._experienceReward);
        console.log(`ChoppableTreeEntity: Emitting CHOPPED event for ${this.name}`);
        interactor.gamePlayer.eventRouter.emit(BaseChoppableTreeEntityPlayerEvent.CHOPPED, { entity: this });
      }

      this.forageItems();
      this.despawn();
      
      // Restore original method
      interactor.gamePlayer.adjustSkillExperience = originalAdjustSkill;
    }, this.forageDurationMs);
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
