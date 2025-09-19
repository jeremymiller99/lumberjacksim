import GameRegion from '../../GameRegion';
import Spawner from '../../systems/Spawner';
import PortalEntity from '../../entities/PortalEntity';
import GameManager from '../../GameManager';

// Merchant for the winter area
import WinterMerchantEntity from './npcs/WinterMerchantEntity';

import SnowTreeSmallEntity from '../../entities/forageables/SnowTreeSmallEntity';
import SnowTreeMediumEntity from '../../entities/forageables/SnowTreeMediumEntity';
import SnowTreeBigEntity from '../../entities/forageables/SnowTreeBigEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mapJson = require('../../../assets/maps/SnowForest.json');

export default class SnowForestRegion extends GameRegion {
  public constructor() {
    super({
      id: 'snowForest',
      name: 'Snow Forest',
      map: mapJson,
      skyboxUri: 'skyboxes/black',
      spawnPoint: { x: 0, y: 2, z: 0 },
      ambientAudioUri: 'audio/music/hytopia-main-theme.mp3',
      respawnOverride: {
        regionId: 'snowForest',
        facingAngle: 0,
        spawnPoint: { x: 0, y: 2, z: 0 },
      },
    });
  }

  protected override setup(): void {
    super.setup();
    this._setupNPCs();
    this._setupSnowTrees();
    this._setupPortals();
  }

  private _setupNPCs(): void {
    // Winter merchant for premium gear and tools
    (new WinterMerchantEntity({ facingAngle: 180 })).spawn(this.world, { x: 3, y: 2, z: -5 });
    
    console.log('SnowForest: Spawned winter merchant at (3, 2, -5)');
  }

  private _setupSnowTrees(): void {
    const treeSpawner = new Spawner({
      groundCheckDistance: 3,
      maxSpawns: 30,
      spawnables: [
        { entityConstructor: SnowTreeSmallEntity, weight: 9 },
        { entityConstructor: SnowTreeMediumEntity, weight: 5 },
        { entityConstructor: SnowTreeBigEntity, weight: 2 },
      ],
      spawnRegions: [
        {
          min: { x: -30, y: 0.5, z: -30 },   // Lower baseplate
          max: { x: 30, y: 4.5, z: 30 },     // Lower baseplate
          weight: 1,
        }
      ],
      spawnIntervalMs: 4000, // 4 seconds for faster tree regeneration
      world: this.world,
    });

    treeSpawner.start(true);
    console.log('SnowForest: Started snow tree spawning across 64x64 area');
  }

  private _setupPortals(): void {
    // Get the hub region from GameManager
    const hubRegion = GameManager.instance.getRegion('hub');
    
    if (hubRegion) {
      const hubPortal = new PortalEntity({
        destinationRegion: hubRegion,
        destinationRegionPosition: { x: 5, y: 2, z: 5 }, // Hub spawn point
        destinationRegionFacingAngle: 0,
        label: 'Back to Hub',
      });
      
      // Place the portal at a good location near the spawn area
      hubPortal.spawn(this.world, { x: 5, y: 1, z: 0 });
      
      console.log('SnowForest: Spawned return portal to Hub at (5, 1, 0)');
    } else {
      console.warn('SnowForest: Could not find hub region for return portal');
    }
  }
}


