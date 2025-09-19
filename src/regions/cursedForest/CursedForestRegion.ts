import GameRegion from '../../GameRegion';
import Spawner from '../../systems/Spawner';
import PortalEntity from '../../entities/PortalEntity';
import GameManager from '../../GameManager';

// Merchant for the cursed area
import DarkMerchantEntity from './npcs/DarkMerchantEntity';

import BurntTreeSmallEntity from '../../entities/forageables/BurntTreeSmallEntity';
import BurntTreeMediumEntity from '../../entities/forageables/BurntTreeMediumEntity';
import BurntTreeBigEntity from '../../entities/forageables/BurntTreeBigEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mapJson = require('../../../assets/maps/CursedForest.json');

export default class CursedForestRegion extends GameRegion {
  public constructor() {
    super({
      id: 'cursedForest',
      name: 'Cursed Forest',
      map: mapJson,
      skyboxUri: 'skyboxes/black',
      spawnPoint: { x: 0, y: 2, z: 0 },
      ambientAudioUri: 'audio/music/hytopia-main-theme.mp3',
      respawnOverride: {
        regionId: 'cursedForest',
        facingAngle: 0,
        spawnPoint: { x: 0, y: 2, z: 0 },
      },
    });
  }

  protected override setup(): void {
    super.setup();
    this._setupNPCs();
    this._setupBurntTrees();
    this._setupPortals();
  }

  private _setupNPCs(): void {
    // Dark merchant for mysterious wares and cursed materials
    (new DarkMerchantEntity({ facingAngle: 180 })).spawn(this.world, { x: -2, y: 2, z: 4 });
    
    console.log('CursedForest: Spawned dark merchant at (-2, 2, 4)');
  }

  private _setupBurntTrees(): void {
    const treeSpawner = new Spawner({
      groundCheckDistance: 3,
      maxSpawns: 30,
      spawnables: [
        { entityConstructor: BurntTreeSmallEntity, weight: 8 },
        { entityConstructor: BurntTreeMediumEntity, weight: 5 },
        { entityConstructor: BurntTreeBigEntity, weight: 2 },
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
    console.log('CursedForest: Started burnt tree spawning across 64x64 area');
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
      
      console.log('CursedForest: Spawned return portal to Hub at (5, 1, 0)');
    } else {
      console.warn('CursedForest: Could not find hub region for return portal');
    }
  }
}


