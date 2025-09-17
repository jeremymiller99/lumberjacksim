import { BaseMinigame, MinigameEvent } from './BaseMinigame';
import BeeMinigame from './BeeMinigame';
import type GamePlayerEntity from '../GamePlayerEntity';

export type MinigameType = 'bee' | 'fishing' | 'lockpicking' | 'crafting_timing';

export type MinigameConfig = {
  type: MinigameType;
  chance: number; // 0-1 probability of triggering
  rewards?: any; // Specific rewards for this context
}

export default class MinigameManager {
  private static _activeMinigames: Map<string, BaseMinigame> = new Map();
  
  public static startMinigame(player: GamePlayerEntity, type: MinigameType, options?: any): BaseMinigame | null {
    // Check if player already has an active minigame
    const existingMinigame = this._activeMinigames.get(player.gamePlayer.player.id);
    if (existingMinigame) {
      existingMinigame.cancel();
    }
    
    let minigame: BaseMinigame | null = null;
    
    switch (type) {
      case 'bee':
        const countdownSeconds = options?.useCountdown ? 3 : 0;
        minigame = options?.rewards ? new BeeMinigame(options.rewards, countdownSeconds) : BeeMinigame.createForTreeChopping();
        break;
      // Add more minigame types here in the future
      default:
        console.warn(`Unknown minigame type: ${type}`);
        return null;
    }
    
    if (minigame) {
      // Set up event listeners
      minigame.eventRouter.on(MinigameEvent.COMPLETED, () => {
        this._activeMinigames.delete(player.gamePlayer.player.id);
      });
      
      minigame.eventRouter.on(MinigameEvent.FAILED, () => {
        this._activeMinigames.delete(player.gamePlayer.player.id);
      });
      
      minigame.eventRouter.on(MinigameEvent.CANCELLED, () => {
        this._activeMinigames.delete(player.gamePlayer.player.id);
      });
      
      // Store the active minigame
      this._activeMinigames.set(player.gamePlayer.player.id, minigame);
      
      // Start the minigame
      minigame.start(player);
    }
    
    return minigame;
  }
  
  public static getActiveMinigame(playerId: string): BaseMinigame | null {
    return this._activeMinigames.get(playerId) || null;
  }
  
  public static handleUIInput(playerId: string, inputData: any): void {
    const minigame = this._activeMinigames.get(playerId);
    if (minigame) {
      minigame.handleUIInput(inputData);
    }
  }
  
  public static cancelMinigame(playerId: string): void {
    const minigame = this._activeMinigames.get(playerId);
    if (minigame) {
      minigame.cancel();
    }
  }
  
  public static shouldTriggerMinigame(config: MinigameConfig): boolean {
    return Math.random() < config.chance;
  }
  
  // Helper method to create minigame configs for different scenarios
  public static createBeeMinigameConfig(chance: number = 0.2): MinigameConfig {
    return {
      type: 'bee',
      chance
    };
  }
}
