import GameRegion from '../../GameRegion';
import { Player } from 'hytopia';
// Import JSON via dynamic require to avoid tsconfig module issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hubMap = require('../../../assets/maps/HubMap.json');
import PortalEntity from '../../entities/PortalEntity';
import LeaderboardEntity from '../../entities/LeaderboardEntity';

// Merchant for the hub area
import GeneralMerchantEntity from './npcs/GeneralMerchantEntity';

export default class HubRegion extends GameRegion {
  private _leaderboards: LeaderboardEntity[] = [];

  public constructor() {
    super({
      id: 'hub',
      name: 'Hub',
      map: hubMap,
      skyboxUri: 'skyboxes/partly-cloudy',
      spawnPoint: { x: 5, y: 2, z: 5 },
      ambientAudioUri: 'audio/music/hytopia-main-theme.mp3',
      respawnOverride: {
        regionId: 'hub',
        facingAngle: 0,
        spawnPoint: { x: 5, y: 2, z: 5 },
      },
    });
  }

  protected override setup(): void {
    super.setup();
    this._setupNPCs();
    this._setupLeaderboard();
    // Future: portals can be spawned here once regions are available
  }

  private _setupNPCs(): void {
    // General merchant for basic starter gear
    (new GeneralMerchantEntity({ facingAngle: 0 })).spawn(this.world, { x: 5, y: 2, z: 56 });
    
    console.log('Hub: Spawned general merchant at (5, 2, 56)');
  }

  private _setupLeaderboard(): void {
    // Ensure leaderboards array is initialized
    if (!this._leaderboards) {
      this._leaderboards = [];
    }
    
    // Create 5 separate leaderboards: gold, logs, OVERALL, xp, minigames
    const baseY = 6; // 5 blocks higher than before (was 4)
    const baseZ = 58; // Behind merchant
    const spacing = 6; // Space between leaderboards
    
    // Gold leaderboard (leftmost)
    const goldBoard = new LeaderboardEntity({
      updateIntervalMs: 60000,
      boardType: 'gold',
      title: '💰 Most Gold',
      size: 'mini'
    });
    goldBoard.spawn(this.world, { x: 5 - (spacing * 2), y: baseY, z: baseZ });
    this._leaderboards.push(goldBoard);
    
    // Logs leaderboard
    const logsBoard = new LeaderboardEntity({
      updateIntervalMs: 60000,
      boardType: 'logs',
      title: '🪵 Most Logs',
      size: 'mini'
    });
    logsBoard.spawn(this.world, { x: 5 - spacing, y: baseY, z: baseZ });
    this._leaderboards.push(logsBoard);
    
    // Overall leaderboard (center, larger)
    const overallBoard = new LeaderboardEntity({
      updateIntervalMs: 60000,
      boardType: 'overall',
      title: '👑 Overall Champions',
      size: 'large'
    });
    overallBoard.spawn(this.world, { x: 5, y: baseY, z: baseZ });
    this._leaderboards.push(overallBoard);
    
    // XP leaderboard
    const xpBoard = new LeaderboardEntity({
      updateIntervalMs: 60000,
      boardType: 'xp',
      title: '⭐ Most XP',
      size: 'mini'
    });
    xpBoard.spawn(this.world, { x: 5 + spacing, y: baseY, z: baseZ });
    this._leaderboards.push(xpBoard);
    
    // Minigames leaderboard (renamed to "mobs defeated")
    const mobsBoard = new LeaderboardEntity({
      updateIntervalMs: 60000,
      boardType: 'minigames',
      title: '⚔️ Mobs Defeated',
      size: 'mini'
    });
    mobsBoard.spawn(this.world, { x: 5 + (spacing * 2), y: baseY, z: baseZ });
    this._leaderboards.push(mobsBoard);
    
    // Initial refresh for all boards
    this._refreshAllLeaderboards();
    
    console.log('Hub: Spawned 5 separate leaderboards at height', baseY, 'behind merchant');
  }

  protected override onPlayerJoin(player: Player): void {
    super.onPlayerJoin(player);
    
    // Refresh leaderboards when player joins hub to ensure they're visible
    this._refreshAllLeaderboards();
    console.log(`[HubRegion] Player ${player.username} joined, refreshed leaderboards`);
  }

  private _refreshAllLeaderboards(): void {
    if (!this._leaderboards) {
      console.warn('[HubRegion] Leaderboards array not initialized');
      return;
    }
    
    this._leaderboards.forEach(leaderboard => {
      if (leaderboard) {
        leaderboard.refreshLeaderboard();
      }
    });
  }

  public spawnPortalTo(region: GameRegion, position: { x: number, y: number, z: number }, facingAngle: number = 0, portalTint: 'normal' | 'boss' = 'normal', label?: string, requiredLevel?: number) {
    const portal = new PortalEntity({
      destinationRegion: region,
      destinationRegionPosition: { x: 0, y: 2, z: 0 },
      destinationRegionFacingAngle: 0,
      type: portalTint,
      label: label,
      requiredLevel: requiredLevel,
    });

    portal.spawn(this.world, position);
  }
}


