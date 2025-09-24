import GameRegion from '../../GameRegion';
import GameManager from '../../GameManager';
import PortalEntity from '../../entities/PortalEntity';
import { Player } from 'hytopia';
import BarrierGroup from '../../entities/BarrierGroup';
import AfkTreeEntity from '../../entities/afk/AfkTreeEntity';
import AfkChestEntity from '../../entities/afk/AfkChestEntity';
import OakLogItem from '../../items/materials/OakLogItem';
import PalmLogItem from '../../items/materials/PalmLogItem';
import SnowLogItem from '../../items/materials/SnowLogItem';
import CursedLogItem from '../../items/materials/CursedLogItem';

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

    this._setupAfkFarming();
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

    // Offline catch-up: compute elapsed time and prefill chests proportionally
    try {
      const persisted: any = (gp as any).player.getPersistedData?.() ?? {};
      const nowMs = Date.now();
      const lastHouseVisitMs = persisted.lastHouseVisitMs ?? nowMs;
      const effectiveMs = Math.max(0, nowMs - lastHouseVisitMs);

      // Find chests we spawned (by name suffix) and apply catch-up per linked tree slot
      const entityManager: any = (this.world as any).entityManager;
      const spawnedChests: AfkChestEntity[] = [];
      const spawnedTrees: AfkTreeEntity[] = [];
      if (entityManager?.entities) {
        for (const entity of entityManager.entities.values()) {
          if (entity instanceof AfkChestEntity) spawnedChests.push(entity);
          if (entity instanceof AfkTreeEntity) spawnedTrees.push(entity);
        }
      }

      // Sort by Z to align with our creation order (left->right)
      spawnedChests.sort((a, b) => a.position.z - b.position.z);
      spawnedTrees.sort((a, b) => a.position.z - b.position.z);

      for (let i = 0; i < Math.min(spawnedChests.length, spawnedTrees.length); i++) {
        const chest = spawnedChests[i];
        const tree = spawnedTrees[i];
        const cycles = Math.floor(effectiveMs / tree.growthDurationMs);
        if (cycles <= 0) continue;

        // Deterministic yields per spec
        // Map by item id: oak -> 3, snow -> 2, palm -> 2, cursed(dead) -> 1
        const id = (tree.yieldItem as any).id as string;
        const perCycle = id === 'oak_log' ? 3 : id === 'snow_log' ? 2 : id === 'palm_log' ? 2 : 1;
        const totalYield = Math.min(chest.capacity, Math.floor(cycles * perCycle));
        chest.add(totalYield);
      }

      // Save updated timestamp immediately
      const newPersisted = { ...(persisted || {}), lastHouseVisitMs: nowMs };
      (gp as any).player.setPersistedData?.({ ...(gp as any)._serialize?.() ?? {}, ...newPersisted });
    } catch {}
  }

  private _setupAfkFarming(): void {
    // Positions sourced from HouseMap.json entities for chests and trees
    // Chests at z: 4.5, 1.5, -0.5, -3.5 around x ~ -10.525, y ~ 1.4
    const chestPositions = [
      { x: -10.525000008940697, y: 1.4000000052154065, z: 4.500000002607703 },
      { x: -10.525000008940697, y: 1.4000000052154065, z: 1.5000000026077032 },
      { x: -10.525000008940697, y: 1.4000000052154065, z: -0.49999999739229684 },
      { x: -10.525000008940697, y: 1.4000000052154065, z: -3.4999999973922966 },
    ];

    // Left-to-right (by z): oak, snow, palm, dead
    const treeData = [
      { pos: { x: -11.524137371185104, y: 2.6500000000000012, z: 4.493749021909581 }, modelUri: 'models/environment/oak-tree-big.gltf', item: OakLogItem, growthMs: 12000, yield: 3 },
      { pos: { x: -11.524137371185104, y: 2.5368411636009824, z: 1.5480916005215205 }, modelUri: 'models/environment/snowy-fir-tree-big.gltf', item: SnowLogItem, growthMs: 16000, yield: 2 },
      { pos: { x: -11.524137371185104, y: 2.5368411636009824, z: -0.5480916005215205 }, modelUri: 'models/environment/palm-1.gltf', item: PalmLogItem, growthMs: 20000, yield: 2 },
      { pos: { x: -11.372523403815045, y: 2.3267373674781755, z: -3.3060530512396302 }, modelUri: 'models/environment/dead-tree-big.gltf', item: CursedLogItem, growthMs: 30000, yield: 1 },
    ];

    // Spawn chests first (labels derive from itemClass.displayName)
    const chests: AfkChestEntity[] = chestPositions.map((p, index) => {
      const assignedItemClass = (treeData[index]?.item) ?? OakLogItem;
      const chest = new AfkChestEntity({
        itemClass: assignedItemClass,
        modelUri: 'models/environment/chest-blocky-wood.gltf',
        modelScale: 1,
        name: `${assignedItemClass.displayName} Chest`,
        facingAngle: -90,
        capacity: 100,
      });
      chest.spawn(this.world, p);
      return chest;
    });

    // Pair each tree to the nearest chest (simple index mapping)
    treeData.forEach((t, index) => {
      const chest = chests[index % chests.length];
      const tree = new AfkTreeEntity({
        modelUri: t.modelUri,
        minScale: 0.1,
        maxScale: 0.3,
        growthDurationMs: t.growthMs,
        yieldItemClass: t.item,
        yieldMin: t.yield,
        yieldMax: t.yield,
        name: 'AFK Tree',
      });
      tree.linkChest(chest);
      tree.spawn(this.world, t.pos);
    });
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

  protected override onPlayerLeave(player: Player): void {
    super.onPlayerLeave(player);
    if (player.id !== this.ownerPlayerId) return;

    try {
      // Stamp last house visit on leave
      const GamePlayer = require('../../GamePlayer').default;
      const gp = GamePlayer.getOrCreate(player);
      const persisted: any = (gp as any).player.getPersistedData?.() ?? {};
      const nowMs = Date.now();
      const newPersisted = { ...(persisted || {}), lastHouseVisitMs: nowMs };
      (gp as any).player.setPersistedData?.({ ...(gp as any)._serialize?.() ?? {}, ...newPersisted });
    } catch {}
  }
}


