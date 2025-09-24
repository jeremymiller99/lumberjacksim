import GameRegion from '../../GameRegion';
import GameManager from '../../GameManager';
import PortalEntity from '../../entities/PortalEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const houseMap = require('../../../assets/maps/HouseMap.json');

export default class PlayerHouseRegion extends GameRegion {
  public readonly ownerPlayerId: string;

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
}


