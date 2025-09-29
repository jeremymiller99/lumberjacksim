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
  damageEvents: DamageEvent[];
}

export type DamageEvent = {
  x: number;
  y: number;
  timestamp: number;
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
  isDying: boolean; // Is bee in death animation
  deathStartTime?: number; // When death animation started
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
  private _beeSpawnRate: number = 600; // Spawn a bee every 600ms (swarm rate)
  private _nextBeeId: number = 0;
  
  public constructor(rewards: MinigameOptions['rewards'], countdownSeconds?: number) {
    super({
      id: 'bee_minigame',
      name: 'Calm the Bees',
      description: 'Swat the angry bee swarm! Click on bees or press SPACEBAR to swat the closest one. You have 3 hearts. Survive for 10 seconds!',
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
      survived: false,
      damageEvents: []
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
    } else if (inputData.type === 'spacebarSwat') {
      this._handleSpacebarSwat();
    }
  }
  
  private _handleBeeClick(beeId: string): void {
    const bee = this._gameData.bees.find(b => b.id === beeId);
    if (!bee || bee.hasHitPlayer || bee.isDying) return;
    
    // Start death animation for clicked bee
    this._killBee(bee);
  }

  private _handleSpacebarSwat(): void {
    // Find the closest bee to the player
    const aliveBees = this._gameData.bees.filter(b => !b.hasHitPlayer && !b.isDying);
    if (aliveBees.length === 0) return;

    let closestBee = aliveBees[0];
    let closestDistance = this._getDistanceToPlayer(closestBee);

    for (const bee of aliveBees) {
      const distance = this._getDistanceToPlayer(bee);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBee = bee;
      }
    }

    // Kill the closest bee
    this._killBee(closestBee);
  }

  private _getDistanceToPlayer(bee: BeeData): number {
    const deltaX = bee.x - this._gameData.player.x;
    const deltaY = bee.y - this._gameData.player.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  private _killBee(bee: BeeData): void {
    bee.isDying = true;
    bee.deathStartTime = performance.now();
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
      speed: 12 + Math.random() * 8, // Speed between 12-20 percentage points per second (faster swarm)
      size: 80 + Math.random() * 40, // Size between 80 and 120 pixels (much larger)
      hasHitPlayer: false,
      spawnTime: now,
      lastUpdateTime: now,
      isDying: false
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
      
      // Handle death animation
      if (bee.isDying) {
        if (!bee.deathStartTime) bee.deathStartTime = now;
        const deathDuration = 1000; // 1 second death animation
        const deathProgress = (now - bee.deathStartTime) / deathDuration;
        
        if (deathProgress >= 1) {
          return false; // Remove bee after death animation
        }
        
        // Make bee fall down during death animation
        bee.y += 50 * (now - bee.lastUpdateTime) / 1000; // Fall speed
        bee.lastUpdateTime = now;
        return true; // Keep bee during death animation
      }
      
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
        
        // Add damage event for particle effects
        this._gameData.damageEvents.push({
          x: this._gameData.player.x,
          y: this._gameData.player.y,
          timestamp: now
        });
        
        return false; // Remove this bee
      }
      
      // Remove bees that are off screen (shouldn't happen but safety check)
      if (bee.x < -10 || bee.x > 110 || bee.y < -10 || bee.y > 110) {
        return false;
      }
      
      return true; // Keep this bee
    });
    
    // Clean up old damage events (older than 2 seconds)
    this._gameData.damageEvents = this._gameData.damageEvents.filter(
      event => now - event.timestamp < 2000
    );
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
