import GameRegion from '../../GameRegion';
import Spawner from '../../systems/Spawner';
// import PortalEntity from '../../entities/PortalEntity'; // Not needed for lumber test

// Merchant for the forest area
import LumberMerchantEntity from './npcs/LumberMerchantEntity';

// Lumber entities for testing
import OakTreeSmallEntity from '../../entities/forageables/OakTreeSmallEntity';
import OakTreeMediumEntity from '../../entities/forageables/OakTreeMediumEntity';
import OakTreeBigEntity from '../../entities/forageables/OakTreeBigEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testMap = require('../../../assets/maps/OakForest.json');

export default class OakForestRegion extends GameRegion {
  public constructor() {
    super({
      id: 'oakForest',
      name: 'Oak Forest',
      map: testMap,
      skyboxUri: 'skyboxes/partly-cloudy',
      spawnPoint: { x: 0, y: 2, z: 0 }, // Center of 64x64 map, just above grass
      ambientAudioUri: 'audio/music/hytopia-main-theme.mp3',
      respawnOverride: {
        regionId: 'oakForest',
        facingAngle: 0,
        spawnPoint: { x: 0, y: 2, z: 0 }, // Same safe respawn point
      },
    });
  }

  protected override setup(): void {
    super.setup();

    this._setupNPCs();
    this._setupLumberTrees();
    // this._setupPortals(); // Disabled for lumber testing
  }

  private _setupNPCs(): void {
    // Merchant for buying/selling tools and wearables
    (new LumberMerchantEntity({ facingAngle: 180 })).spawn(this.world, { x: 0, y: 2, z: -5 });
    
    console.log('OakForest: Spawned merchant at (0, 2, -5)');
  }

  // Portal setup disabled for lumber testing
  // private _setupPortals(): void {
  //   const stalkhavenPortal = new PortalEntity({
  //     destinationRegionId: 'stalkhaven',
  //     destinationRegionPosition: { x: 32, y: 2, z: 1 },
  //     destinationRegionFacingAngle: 90,
  //     modelScale: 2,
  //   });
  //   
  //   stalkhavenPortal.spawn(this.world, { x: -6, y: 9.5, z: -31 });
  // }

  private _setupLumberTrees(): void {
    const treeSpawner = new Spawner({
      groundCheckDistance: 3,
      maxSpawns: 25, // Good amount for 64x64 area
      spawnables: [
        { entityConstructor: OakTreeSmallEntity, weight: 10 }, // Lots of small trees
        { entityConstructor: OakTreeMediumEntity, weight: 5 },  // Medium trees
        { entityConstructor: OakTreeBigEntity, weight: 2 },     // Few big trees
      ],
      spawnRegions: [
        {
          min: { x: -30, y: 1, z: -30 },   // Cover most of 64x64 map
          max: { x: 30, y: 5, z: 30 },     // Leave small border, reasonable height
          weight: 1,
        }
      ],
      spawnIntervalMs: 8000, // 8 seconds respawn for testing
      world: this.world,
    });

    treeSpawner.start(true);
    console.log('OakForest: Started tree spawning across 64x64 grass area');
  }
}


