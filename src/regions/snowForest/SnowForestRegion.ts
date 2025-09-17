import GameRegion from '../../GameRegion';
import Spawner from '../../systems/Spawner';

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
    this._setupSnowTrees();
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
          min: { x: -30, y: 1, z: -30 },
          max: { x: 30, y: 5, z: 30 },
          weight: 1,
        }
      ],
      spawnIntervalMs: 8000,
      world: this.world,
    });

    treeSpawner.start(true);
    console.log('SnowForest: Started snow tree spawning across 64x64 area');
  }
}


