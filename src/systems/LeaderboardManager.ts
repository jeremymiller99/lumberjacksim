import { MinigameEvent, BaseMinigame } from './BaseMinigame';
import type GamePlayer from '../GamePlayer';
import type { LeaderboardData } from '../entities/LeaderboardEntity';
import { PlayerManager } from 'hytopia';

export type PlayerMonthlyStats = {
  playerId: string;
  playerName: string;
  goldEarned: number;
  logsMined: number;
  minigamesWon: number;
  xpGained: number;
  combinedScore: number;
};

export default class LeaderboardManager {
  private static _instance: LeaderboardManager | undefined;
  
  public static get instance(): LeaderboardManager {
    if (!this._instance) {
      this._instance = new LeaderboardManager();
    }
    return this._instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  public static setupGlobalTracking(): void {
    // This will be called from GameManager to set up event listeners
    console.log('[LeaderboardManager] Global tracking initialized');
  }

  public recordMinigameWin(gamePlayer: GamePlayer, minigame: BaseMinigame): void {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Update player stats
    gamePlayer.incrementMinigameWin(minigame.id, monthKey);
    
    console.log(`[LeaderboardManager] ${gamePlayer.player.username} won ${minigame.name}!`);
  }

  public async getCurrentMonthData(): Promise<LeaderboardData> {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      const playerStats = await this._getAllPlayerMonthlyStats(monthKey);
      
      return {
        goldLeaders: this._getTopPlayers(playerStats, 'goldEarned', 10),
        logsLeaders: this._getTopPlayers(playerStats, 'logsMined', 10),
        minigameLeaders: this._getTopPlayers(playerStats, 'minigamesWon', 10),
        xpLeaders: this._getTopPlayers(playerStats, 'xpGained', 10),
        combinedLeaders: this._getCombinedLeaders(playerStats, 10),
        monthYear: monthKey,
      };
    } catch (error) {
      console.error('[LeaderboardManager] Error getting monthly data:', error);
      return this._getEmptyLeaderboardData(monthKey);
    }
  }

  private async _getAllPlayerMonthlyStats(monthKey: string): Promise<PlayerMonthlyStats[]> {
    const stats: PlayerMonthlyStats[] = [];
    
    try {
      // Get all connected players and their persisted data using proper persistence methods
      const connectedPlayers = PlayerManager.instance.getConnectedPlayers();
      
      for (const player of connectedPlayers) {
        try {
          const persistedData = player.getPersistedData();
          
          if (persistedData && persistedData.monthlyStats && persistedData.monthlyStats[monthKey]) {
            const monthlyData = persistedData.monthlyStats[monthKey];
            
            const playerStats: PlayerMonthlyStats = {
              playerId: player.id,
              playerName: player.username,
              goldEarned: monthlyData.goldEarned || 0,
              logsMined: monthlyData.logsMined || 0,
              minigamesWon: monthlyData.minigamesWon || 0,
              xpGained: monthlyData.xpGained || 0,
              combinedScore: 0, // Will be calculated
            };
            
            // Calculate combined score (weighted)
            playerStats.combinedScore = this._calculateCombinedScore(playerStats);
            
            stats.push(playerStats);
          }
        } catch (error) {
          console.warn(`[LeaderboardManager] Error reading persisted data for player ${player.username}:`, error);
        }
      }
    } catch (error) {
      console.error('[LeaderboardManager] Error getting player data:', error);
    }
    
    return stats;
  }

  private _calculateCombinedScore(stats: PlayerMonthlyStats): number {
    // Weighted scoring system
    const goldWeight = 0.001;    // 1000 gold = 1 point
    const logsWeight = 0.1;      // 10 logs = 1 point  
    const minigameWeight = 5;    // 1 minigame = 5 points
    const xpWeight = 0.01;       // 100 xp = 1 point
    
    return Math.round(
      (stats.goldEarned * goldWeight) +
      (stats.logsMined * logsWeight) +
      (stats.minigamesWon * minigameWeight) +
      (stats.xpGained * xpWeight)
    );
  }

  private _getTopPlayers(
    playerStats: PlayerMonthlyStats[], 
    field: keyof Omit<PlayerMonthlyStats, 'playerId' | 'playerName' | 'combinedScore'>, 
    limit: number
  ): { name: string; value: number }[] {
    return playerStats
      .sort((a, b) => (b[field] as number) - (a[field] as number))
      .slice(0, limit)
      .map(player => ({
        name: player.playerName,
        value: player[field] as number,
      }));
  }

  private _getCombinedLeaders(playerStats: PlayerMonthlyStats[], limit: number): { name: string; score: number; breakdown: string }[] {
    return playerStats
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit)
      .map(player => ({
        name: player.playerName,
        score: player.combinedScore,
        breakdown: `G:${this._formatNumber(player.goldEarned)} L:${player.logsMined} M:${player.minigamesWon} X:${this._formatNumber(player.xpGained)}`,
      }));
  }

  private _formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  private _getEmptyLeaderboardData(monthKey: string): LeaderboardData {
    return {
      goldLeaders: [],
      logsLeaders: [],
      minigameLeaders: [],
      xpLeaders: [],
      combinedLeaders: [],
      monthYear: monthKey,
    };
  }

  public getPlayerMonthlyStats(gamePlayer: GamePlayer, year: number, month: number): PlayerMonthlyStats | null {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    // This would get a specific player's stats for a month
    // Implementation would be similar to _getAllPlayerMonthlyStats but for one player
    return null;
  }
}
