import GameRegion from '../../GameRegion';
import Spawner from '../../systems/Spawner';

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
    this._setupBurntTrees();
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
          min: { x: -30, y: 1, z: -30 },
          max: { x: 30, y: 5, z: 30 },
          weight: 1,
        }
      ],
      spawnIntervalMs: 8000,
      world: this.world,
    });

    treeSpawner.start(true);
    console.log('CursedForest: Started burnt tree spawning across 64x64 area');
  }
}


