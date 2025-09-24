import GameRegion from '../../GameRegion';
import GameManager from '../../GameManager';
import PortalEntity from '../../entities/PortalEntity';
import { Player } from 'hytopia';
import BarrierGroup from '../../entities/BarrierGroup';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const houseMap = require('../../../assets/maps/HouseMap.json');

export default class PlayerHouseRegion extends GameRegion {
  public readonly ownerPlayerId: string;
  private _level2Barriers: BarrierGroup[] = [];
  private _level3Barrier: BarrierGroup | undefined;

  public constructor(ownerPlayerId: string, ownerPlayerName: string) {
    super({
      id: `house:${ownerPlayerId}`,
      name: `${ownerPlayerName} House`,
      map: houseMap,
      skyboxUri: 'skyboxes/partly-cloudy',
      spawnPoint: { x: 12, y: 2, z: 0 },
      ambientAudioUri: 'audio/music/hytopia-main-theme.mp3',
      respawnOverride: {
        regionId: `house:${ownerPlayerId}`,
        facingAngle: 0,
        spawnPoint: { x: 12, y: 2, z: 0 },
      },
    });

    this.ownerPlayerId = ownerPlayerId;
  }

  protected override setup(): void {
    super.setup();

    // Portal back to Hub at (14, 2, 0)
    const hub = GameManager.instance.getRegion('hub');
    if (!hub) return;

    const portal = new PortalEntity({
      destinationRegion: hub,
      destinationRegionPosition: hub.spawnPoint,
      destinationRegionFacingAngle: 0,
      type: 'invisible',
      label: 'Back to Hub',
    });

    portal.spawn(this.world, { x: 15, y: 1, z: 0.5 });
  }

  protected override onPlayerJoin(player: Player): void {
    super.onPlayerJoin(player);
    if (player.id !== this.ownerPlayerId) return;

    // Lazy import to avoid circular refs
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const GamePlayer = require('../../GamePlayer').default;
    const gp = GamePlayer.getOrCreate(player);
    this._syncLevel2Barriers(gp.houseLevel);
    this._syncLevel3Barrier(gp.houseLevel);
  }

  private _syncLevel2Barriers(houseLevel: number): void {
    if (houseLevel >= 2) {
      this._clearLevel2Barriers();
    } else {
      if (this._level2Barriers.length === 0) {
        this._spawnLevel2Barriers();
      }
    }
  }

  private _spawnLevel2Barriers(): void {
    const upstairsRailPositions = [] as { x: number, y: number, z: number }[];
    for (let x = 4; x <= 8; x++) {
      upstairsRailPositions.push({ x, y: 6, z: 4 });
      upstairsRailPositions.push({ x, y: 6, z: 5 });
    }
    const upstairsRail = new BarrierGroup({
      positions: upstairsRailPositions,
      label: 'Buy level 2 upgrade to access this area',
      labelOffset: { x: 6, y: 7.2, z: 4.5 },
    });
    upstairsRail.spawn(this.world, { x: 0, y: 0, z: 0 });
    this._level2Barriers.push(upstairsRail);

    const doorwayPositions = [] as { x: number, y: number, z: number }[];
    for (let y = 2; y <= 4; y++) {
      doorwayPositions.push({ x: 4, y, z: 0 });
    }
    const doorway = new BarrierGroup({
      positions: doorwayPositions,
      label: 'Buy level 2 upgrade to access this area',
      labelOffset: { x: 4, y: 4.2, z: 0 },
    });
    doorway.spawn(this.world, { x: 0, y: 0, z: 0 });
    this._level2Barriers.push(doorway);
  }

  private _clearLevel2Barriers(): void {
    for (const group of this._level2Barriers) {
      try { group.despawn(); } catch {}
    }
    this._level2Barriers = [];
  }

  private _syncLevel3Barrier(houseLevel: number): void {
    if (houseLevel >= 3) {
      this._clearLevel3Barrier();
    } else if (houseLevel >= 2) { // only appears after level 2, until 3 is purchased
      if (!this._level3Barrier) {
        this._spawnLevel3Barrier();
      }
    } else {
      this._clearLevel3Barrier();
    }
  }

  private _spawnLevel3Barrier(): void {
    if (this._level3Barrier) return;
    const positions = [] as { x: number, y: number, z: number }[];
    // (4,8,2)-(4,8,-1)
    for (let z = -1; z <= 2; z++) {
      positions.push({ x: 4, y: 8, z });
    }
    // (4,11,2)-(4,11,-1)
    for (let z = -1; z <= 2; z++) {
      positions.push({ x: 4, y: 11, z });
    }
    this._level3Barrier = new BarrierGroup({
      positions,
      label: 'Buy level 3 upgrade to access this area',
      labelOffset: { x: 4, y: 10, z: 0 },
    });
    this._level3Barrier.spawn(this.world, { x: 0, y: 0, z: 0 });
  }

  private _clearLevel3Barrier(): void {
    if (this._level3Barrier) {
      try { this._level3Barrier.despawn(); } catch {}
      this._level3Barrier = undefined;
    }
  }
}


