import { EventRouter } from 'hytopia';
import type GamePlayerEntity from '../GamePlayerEntity';
import type { ItemClass } from '../items/BaseItem';

export enum MinigameEvent {
  STARTED = 'Minigame.STARTED',
  COMPLETED = 'Minigame.COMPLETED',
  FAILED = 'Minigame.FAILED',
  CANCELLED = 'Minigame.CANCELLED'
}

export type MinigameEventPayloads = {
  [MinigameEvent.STARTED]: { minigame: BaseMinigame };
  [MinigameEvent.COMPLETED]: { minigame: BaseMinigame; rewards: MinigameReward[] };
  [MinigameEvent.FAILED]: { minigame: BaseMinigame };
  [MinigameEvent.CANCELLED]: { minigame: BaseMinigame };
}

export type MinigameReward = {
  itemClass: ItemClass;
  quantity: number;
}

export type MinigameOptions = {
  id: string;
  name: string;
  description: string;
  durationMs: number;
  rewards: MinigameReward[];
  failureConsequence?: 'lose_rewards' | 'lose_progress' | 'none';
  countdownSeconds?: number;
}

export abstract class BaseMinigame {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly durationMs: number;
  public readonly rewards: MinigameReward[];
  public readonly failureConsequence: 'lose_rewards' | 'lose_progress' | 'none';
  public readonly countdownSeconds: number;
  
  protected _eventRouter: EventRouter = new EventRouter();
  protected _isActive: boolean = false;
  protected _isCompleted: boolean = false;
  protected _player: GamePlayerEntity | null = null;
  protected _startTime: number = 0;
  protected _countdownTimeout: NodeJS.Timeout | null = null;
  
  public constructor(options: MinigameOptions) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.durationMs = options.durationMs;
    this.rewards = options.rewards;
    this.failureConsequence = options.failureConsequence ?? 'lose_rewards';
    this.countdownSeconds = options.countdownSeconds ?? 0;
  }
  
  public get isActive(): boolean { return this._isActive; }
  public get isCompleted(): boolean { return this._isCompleted; }
  public get player(): GamePlayerEntity | null { return this._player; }
  public get eventRouter(): EventRouter { return this._eventRouter; }
  
  public start(player: GamePlayerEntity): void {
    if (this._isActive) {
      throw new Error(`Minigame ${this.id} is already active`);
    }
    
    this._player = player;
    this._isActive = true;
    this._isCompleted = false;
    
    // Open the minigame UI
    this._openUI();
    
    // If countdown is enabled, start countdown first
    if (this.countdownSeconds > 0) {
      this._startCountdown();
    } else {
      this._startMinigameLogic();
    }
    
    this._eventRouter.emit(MinigameEvent.STARTED, { minigame: this });
  }
  
  public complete(): void {
    if (!this._isActive || this._isCompleted) return;
    
    this._isCompleted = true;
    this._isActive = false;
    
    // Close the UI
    this._closeUI();
    
    // Award rewards
    this._awardRewards();
    
    this._onComplete();
    
    this._eventRouter.emit(MinigameEvent.COMPLETED, { minigame: this, rewards: this.rewards });
  }
  
  public fail(): void {
    if (!this._isActive || this._isCompleted) return;
    
    this._isActive = false;
    
    // Close the UI
    this._closeUI();
    
    // Handle failure consequences
    this._handleFailure();
    
    this._onFail();
    
    this._eventRouter.emit(MinigameEvent.FAILED, { minigame: this });
  }
  
  public cancel(): void {
    if (!this._isActive) return;
    
    this._isActive = false;
    
    // Clean up countdown timeout
    if (this._countdownTimeout) {
      clearTimeout(this._countdownTimeout);
      this._countdownTimeout = null;
    }
    
    // Close the UI
    this._closeUI();
    
    this._onCancel();
    
    this._eventRouter.emit(MinigameEvent.CANCELLED, { minigame: this });
  }
  
  protected _startCountdown(): void {
    if (!this._player) return;
    
    // Send countdown start to UI
    this._player.gamePlayer.player.ui.sendData({
      type: 'startCountdown',
      minigameId: this.id,
      countdownSeconds: this.countdownSeconds
    });
    
    // After countdown finishes, start the actual minigame
    this._countdownTimeout = setTimeout(() => {
      this._startMinigameLogic();
    }, this.countdownSeconds * 1000);
  }
  
  protected _startMinigameLogic(): void {
    // Add a small delay to ensure UI is fully loaded and visible
    setTimeout(() => {
      this._startTime = performance.now();
      
      // Start the minigame logic
      this._onStart();
    }, 100); // 100ms delay to ensure UI is ready
  }

  protected _openUI(): void {
    if (!this._player) return;
    
    this._player.gamePlayer.player.ui.sendData({
      type: 'openMinigame',
      minigameId: this.id,
      name: this.name,
      description: this.description,
      durationMs: this.durationMs,
      countdownSeconds: this.countdownSeconds,
      gameData: this._getGameData()
    });
    
    // Unlock pointer for UI interaction
    this._player.gamePlayer.player.ui.lockPointer(false);
  }
  
  protected _closeUI(): void {
    if (!this._player) return;
    
    this._player.gamePlayer.player.ui.sendData({
      type: 'closeMinigame',
      minigameId: this.id
    });
    
    // Re-lock pointer
    this._player.gamePlayer.player.ui.lockPointer(true);
  }
  
  protected _awardRewards(): void {
    if (!this._player) return;
    
    for (const reward of this.rewards) {
      if (!this._player.gamePlayer.addHeldItem(reward.itemClass, reward.quantity)) {
        // If inventory is full, drop the item
        const item = reward.itemClass.create({ quantity: reward.quantity });
        item.spawnEntityAsEjectedDrop(this._player.world!, this._player.position, this._player.directionFromRotation);
      }
    }
    
    this._player.showNotification(`Minigame completed! Received rewards.`, 'success');
  }
  
  protected _handleFailure(): void {
    if (!this._player) return;
    
    switch (this.failureConsequence) {
      case 'lose_rewards':
        this._player.showNotification(`Minigame failed! No rewards received.`, 'error');
        break;
      case 'lose_progress':
        // This would be handled by the calling system (e.g., tree chopping)
        this._player.showNotification(`Minigame failed! Progress lost.`, 'error');
        break;
      case 'none':
        this._player.showNotification(`Minigame failed, but no penalty.`, 'warning');
        break;
    }
  }
  
  // Abstract methods that subclasses must implement
  protected abstract _onStart(): void;
  protected abstract _onComplete(): void;
  protected abstract _onFail(): void;
  protected abstract _onCancel(): void;
  protected abstract _getGameData(): any;
  
  // Method for handling UI input from the client
  public handleUIInput(inputData: any): void {
    if (!this._isActive) return;
    this._onUIInput(inputData);
  }
  
  protected abstract _onUIInput(inputData: any): void;
}
