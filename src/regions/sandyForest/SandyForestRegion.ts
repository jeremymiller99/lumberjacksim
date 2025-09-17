import GameRegion from '../../GameRegion';
import Spawner from '../../systems/Spawner';
import PortalEntity from '../../entities/PortalEntity';
import GameManager from '../../GameManager';

// Merchant for the desert area
import DesertMerchantEntity from './npcs/DesertMerchantEntity';

import PalmTreeSmallEntity from '../../entities/forageables/PalmTreeSmallEntity';
import PalmTreeMediumEntity from '../../entities/forageables/PalmTreeMediumEntity';
import PalmTreeBigEntity from '../../entities/forageables/PalmTreeBigEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mapJson = require('../../../assets/maps/SandForest.json');

export default class SandyForestRegion extends GameRegion {
  public constructor() {
    super({
      id: 'sandyForest',
      name: 'Sandy Forest',
      map: mapJson,
      skyboxUri: 'skyboxes/sunset',
      spawnPoint: { x: 0, y: 2, z: 0 },
      ambientAudioUri: 'audio/music/hytopia-main-theme.mp3',
      respawnOverride: {
        regionId: 'sandyForest',
        facingAngle: 0,
        spawnPoint: { x: 0, y: 2, z: 0 },
      },
    });
  }

  protected override setup(): void {
    super.setup();
    this._setupNPCs();
    this._setupLumberTrees();
    this._setupPortals();
  }

  private _setupNPCs(): void {
    // Desert merchant for survival gear and accessories
    (new DesertMerchantEntity({ facingAngle: 180 })).spawn(this.world, { x: -3, y: 2, z: -5 });
    
    console.log('SandyForest: Spawned desert merchant at (-3, 2, -5)');
  }

  private _setupLumberTrees(): void {
    const treeSpawner = new Spawner({
      groundCheckDistance: 3,
      maxSpawns: 25,
      spawnables: [
        { entityConstructor: PalmTreeSmallEntity, weight: 9 },
        { entityConstructor: PalmTreeMediumEntity, weight: 5 },
        { entityConstructor: PalmTreeBigEntity, weight: 2 },
      ],
      spawnRegions: [
        {
          min: { x: -30, y: 1, z: -30 },
          max: { x: 30, y: 5, z: 30 },
          weight: 1,
        }
      ],
      spawnIntervalMs: 4000, // 4 seconds for faster tree regeneration
      world: this.world,
    });

    treeSpawner.start(true);
    console.log('SandyForest: Started palm tree spawning across 64x64 area');
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
      
      console.log('SandyForest: Spawned return portal to Hub at (5, 1, 0)');
    } else {
      console.warn('SandyForest: Could not find hub region for return portal');
    }
  }
}


