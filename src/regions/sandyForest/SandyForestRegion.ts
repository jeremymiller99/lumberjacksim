import GameRegion from '../../GameRegion';
import Spawner from '../../systems/Spawner';

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
    this._setupLumberTrees();
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
      spawnIntervalMs: 8000,
      world: this.world,
    });

    treeSpawner.start(true);
    console.log('SandyForest: Started palm tree spawning across 64x64 area');
  }
}


