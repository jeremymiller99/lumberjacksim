import { Entity, ModelEntityOptions, SceneUI, Vector3Like, World } from 'hytopia';

export type LeaderboardData = {
  goldLeaders: { name: string; value: number }[];
  logsLeaders: { name: string; value: number }[];
  minigameLeaders: { name: string; value: number }[];
  xpLeaders: { name: string; value: number }[];
  combinedLeaders: { name: string; score: number; breakdown: string }[];
  monthYear: string;
};

export type LeaderboardEntityOptions = {
  updateIntervalMs?: number;
  boardType?: 'gold' | 'logs' | 'xp' | 'minigames' | 'overall';
  title?: string;
  size?: 'mini' | 'large';
} & ModelEntityOptions;

export default class LeaderboardEntity extends Entity {
  private _leaderboardSceneUI: SceneUI;
  private _updateInterval: NodeJS.Timeout | null = null;
  private _data: LeaderboardData;
  private _boardType: string;
  private _title: string;
  private _size: string;
  private _entityY: number = 0;

  public constructor(options: LeaderboardEntityOptions = {}) {
    super({
      modelUri: 'models/misc/selection-indicator.gltf',
      modelScale: 0.0001, // Invisible model
      ...options,
    });

    this._boardType = options.boardType || 'overall';
    this._title = options.title || 'Leaderboard';
    this._size = options.size || 'large';

    // Initialize with empty data
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    this._data = {
      goldLeaders: [],
      logsLeaders: [],
      minigameLeaders: [],
      xpLeaders: [],
      combinedLeaders: [],
      monthYear,
    };
    
    // Don't create SceneUI here - wait until we know the spawn position
    
    // Auto-update every 60 seconds if specified
    if (options.updateIntervalMs) {
      this._updateInterval = setInterval(() => {
        this.refreshLeaderboard();
      }, options.updateIntervalMs);
    }
  }

  private _setupLeaderboardUI(): void {
    const templateId = this._size === 'large' ? 'single-leaderboard-large' : 'single-leaderboard-mini';
    
    // Calculate absolute position based on entity position
    const absolutePosition = {
      x: this.position.x,
      y: this.position.y + 2, // 2 blocks above the entity
      z: this.position.z
    };
    
    console.log(`[LeaderboardEntity] Creating SceneUI at absolute position:`, absolutePosition);
    
    this._leaderboardSceneUI = new SceneUI({
      position: absolutePosition, // Use absolute positioning instead of entity attachment
      templateId,
      viewDistance: 25, // Visible from 25 blocks away
      state: {
        title: this._title,
        boardType: this._boardType,
        size: this._size,
        data: this._getRelevantData(),
      },
    });
  }

  public override spawn(world: World, position: Vector3Like, rotation?: any): void {
    // Store the Y position before spawning
    this._entityY = position.y;
    
    console.log(`[LeaderboardEntity] Spawning ${this._boardType} leaderboard at Y=${position.y}, will display at Y=${position.y + 2}`);
    
    super.spawn(world, position, rotation);
    
    // Wait a frame for the entity to be properly positioned, then create SceneUI
    setTimeout(() => {
      this._setupLeaderboardUI();
      
      if (this._leaderboardSceneUI) {
        this._leaderboardSceneUI.load(world);
      }
    }, 100); // Small delay to ensure entity is positioned
  }

  public override despawn(): void {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
    super.despawn();
  }

  private _getRelevantData(): any {
    switch (this._boardType) {
      case 'gold':
        return this._data.goldLeaders;
      case 'logs':
        return this._data.logsLeaders;
      case 'xp':
        return this._data.xpLeaders;
      case 'minigames':
        return this._data.minigameLeaders;
      case 'overall':
        return this._data.combinedLeaders;
      default:
        return [];
    }
  }

  public updateLeaderboard(data: LeaderboardData): void {
    this._data = data;
    
    if (this._leaderboardSceneUI) {
      this._leaderboardSceneUI.setState({
        title: this._title,
        boardType: this._boardType,
        size: this._size,
        data: this._getRelevantData(),
      });
    }
  }

  public async refreshLeaderboard(): Promise<void> {
    try {
      // Import LeaderboardManager dynamically to avoid circular imports
      const LeaderboardManagerModule = await import('../systems/LeaderboardManager');
      const LeaderboardManager = LeaderboardManagerModule.default;
      const data = await LeaderboardManager.instance.getCurrentMonthData();
      this.updateLeaderboard(data);
      
      // Only reload SceneUI if it exists, don't recreate it
      if (this.world && this._leaderboardSceneUI) {
        this._leaderboardSceneUI.load(this.world);
      }
      
      console.log(`[LeaderboardEntity] Refreshed ${this._boardType} leaderboard data`);
    } catch (error) {
      console.error(`[LeaderboardEntity] Failed to refresh ${this._boardType} leaderboard:`, error);
    }
  }
}
