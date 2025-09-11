import { BaseMinigame, MinigameOptions } from './BaseMinigame';
import RawLogItem from '../items/materials/RawLogItem';

export type BeeMinigameData = {
  bees: BeeData[];
  timeRemaining: number;
  hearts: number;
  maxHearts: number;
  player: PlayerData;
  gameWidth: number;
  gameHeight: number;
  survived: boolean;
}

export type BeeData = {
  id: string;
  x: number; // Position as percentage of game area (0-100)
  y: number; // Position as percentage of game area (0-100)
  targetX: number; // Target position (player location when bee was spawned)
  targetY: number;
  speed: number; // Speed towards target (percentage per second)
  size: number; // Size in pixels
  hasHitPlayer: boolean;
  spawnTime: number;
  lastUpdateTime: number; // For smooth time-based movement
}

export type PlayerData = {
  x: number; // Position as percentage (50 = center)
  y: number; // Position as percentage (50 = center)
  size: number; // Size in pixels
}

export default class BeeMinigame extends BaseMinigame {
  private _gameData: BeeMinigameData;
  private _updateInterval: NodeJS.Timeout | null = null;
  private _beeSpawnInterval: NodeJS.Timeout | null = null;
  private _maxHearts: number = 3;
  private _gameWidth: number = 800; // Game area width in pixels
  private _gameHeight: number = 400; // Game area height in pixels
  private _beeSpawnRate: number = 1200; // Spawn a bee every 1200ms (slower spawn rate)
  private _nextBeeId: number = 0;
  
  public constructor(rewards: MinigameOptions['rewards'], countdownSeconds?: number) {
    super({
      id: 'bee_minigame',
      name: 'Calm the Bees',
      description: 'Click on the angry bees before they reach you! You have 3 hearts. Survive for 10 seconds!',
      durationMs: 10000, // 10 seconds
      rewards,
      failureConsequence: 'lose_rewards',
      countdownSeconds: countdownSeconds ?? 0 // No countdown by default
    });
    
    this._gameData = {
      bees: [],
      timeRemaining: this.durationMs,
      hearts: this._maxHearts,
      maxHearts: this._maxHearts,
      player: {
        x: 50, // Start in center
        y: 50, // Start in center
        size: 40
      },
      gameWidth: this._gameWidth,
      gameHeight: this._gameHeight,
      survived: false
    };
  }
  
  protected _onStart(): void {
    // Reset player position to center
    this._gameData.player.x = 50;
    this._gameData.player.y = 50;
    
    // Start the game update loop
    this._startUpdateLoop();
    
    // Start spawning bees
    this._startBeeSpawning();
  }
  
  protected _onComplete(): void {
    this._stopUpdateLoop();
    this._stopBeeSpawning();
  }
  
  protected _onFail(): void {
    this._stopUpdateLoop();
    this._stopBeeSpawning();
  }
  
  protected _onCancel(): void {
    this._stopUpdateLoop();
    this._stopBeeSpawning();
  }
  
  protected _getGameData(): BeeMinigameData {
    return { ...this._gameData };
  }
  
  protected _onUIInput(inputData: any): void {
    if (inputData.type === 'beeClick') {
      this._handleBeeClick(inputData.beeId);
    }
  }
  
  private _handleBeeClick(beeId: string): void {
    const bee = this._gameData.bees.find(b => b.id === beeId);
    if (!bee || bee.hasHitPlayer) return;
    
    // Remove the clicked bee
    bee.hasHitPlayer = true;
    
    // Visual feedback
    this._player?.showNotification(`Bee eliminated! 🐝💥`, 'success');
  }
  
  private _startUpdateLoop(): void {
    const updateIntervalMs = 33; // Update ~30 times per second for smoother movement
    
    this._updateInterval = setInterval(() => {
      this._updateGame();
      this._sendGameUpdate();
    }, updateIntervalMs);
  }
  
  private _stopUpdateLoop(): void {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }
  
  private _startBeeSpawning(): void {
    this._beeSpawnInterval = setInterval(() => {
      this._spawnBee();
    }, this._beeSpawnRate);
  }
  
  private _stopBeeSpawning(): void {
    if (this._beeSpawnInterval) {
      clearInterval(this._beeSpawnInterval);
      this._beeSpawnInterval = null;
    }
  }
  
  private _spawnBee(): void {
    if (!this._isActive) return;
    
    // Spawn bee from random edge of screen
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let x: number, y: number;
    
    switch (edge) {
      case 0: // Top
        x = Math.random() * 100;
        y = -5;
        break;
      case 1: // Right
        x = 105;
        y = Math.random() * 100;
        break;
      case 2: // Bottom
        x = Math.random() * 100;
        y = 105;
        break;
      case 3: // Left
        x = -5;
        y = Math.random() * 100;
        break;
      default:
        x = 0;
        y = 0;
    }
    
    const now = performance.now();
    const bee: BeeData = {
      id: `bee_${this._nextBeeId++}`,
      x,
      y,
      targetX: 50, // Always target center
      targetY: 50, // Always target center
      speed: 15 + Math.random() * 10, // Speed between 15-25 percentage points per second
      size: 30 + Math.random() * 15, // Size between 30 and 45 pixels
      hasHitPlayer: false,
      spawnTime: now,
      lastUpdateTime: now
    };
    
    this._gameData.bees.push(bee);
  }
  
  private _updateGame(): void {
    if (!this._isActive) return;
    
    // Update time remaining
    const elapsed = performance.now() - this._startTime;
    this._gameData.timeRemaining = Math.max(0, this.durationMs - elapsed);
    
    // Check if time is up - WIN CONDITION!
    if (this._gameData.timeRemaining <= 0) {
      this._gameData.survived = true;
      this.complete();
      return;
    }
    
    // Check lose condition
    if (this._gameData.hearts <= 0) {
      this.fail();
      return;
    }
    
    const now = performance.now();
    
    // Update bee positions and check collisions
    this._gameData.bees = this._gameData.bees.filter(bee => {
      if (bee.hasHitPlayer) return false; // Remove clicked/eliminated bees
      
      // Calculate time delta for smooth movement
      const deltaTime = (now - bee.lastUpdateTime) / 1000; // Convert to seconds
      bee.lastUpdateTime = now;
      
      // Move bee towards the center (player position) with time-based movement
      const deltaX = this._gameData.player.x - bee.x;
      const deltaY = this._gameData.player.y - bee.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 0.5) {
        // Calculate movement for this frame based on time
        const moveDistance = bee.speed * deltaTime;
        const normalizedX = deltaX / distance;
        const normalizedY = deltaY / distance;
        
        // Move towards center smoothly
        bee.x += normalizedX * moveDistance;
        bee.y += normalizedY * moveDistance;
      }
      
      // Check collision with player (bee reached center)
      const playerDistance = Math.sqrt(
        Math.pow(bee.x - this._gameData.player.x, 2) + 
        Math.pow(bee.y - this._gameData.player.y, 2)
      );
      
      // Collision detection - bee reached the player (more forgiving collision)
      const collisionDistance = (bee.size + this._gameData.player.size) / 25; // More forgiving collision
      
      if (playerDistance < collisionDistance) {
        this._gameData.hearts--;
        
        // Show damage feedback
        this._player?.showNotification(`💔 A bee reached you! ${this._gameData.hearts} hearts left!`, 'error');
        
        return false; // Remove this bee
      }
      
      // Remove bees that are off screen (shouldn't happen but safety check)
      if (bee.x < -10 || bee.x > 110 || bee.y < -10 || bee.y > 110) {
        return false;
      }
      
      return true; // Keep this bee
    });
  }
  
  private _sendGameUpdate(): void {
    if (!this._player) return;
    
    this._player.gamePlayer.player.ui.sendData({
      type: 'minigameUpdate',
      minigameId: this.id,
      gameData: this._getGameData()
    });
  }
  
  
  // Static factory method for easy creation
  public static createForTreeChopping(woodQuantity: number = 3): BeeMinigame {
    const rewards = [
      {
        itemClass: RawLogItem,
        quantity: woodQuantity
      }
    ];
    
    return new BeeMinigame(rewards);
  }
}
