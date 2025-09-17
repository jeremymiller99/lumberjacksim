import GameRegion from '../../GameRegion';
// Import JSON via dynamic require to avoid tsconfig module issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hubMap = require('../../../assets/maps/HubMap.json');
import PortalEntity from '../../entities/PortalEntity';

export default class HubRegion extends GameRegion {
  public constructor() {
    super({
      id: 'hub',
      name: 'Hub',
      map: hubMap,
      skyboxUri: 'skyboxes/partly-cloudy',
      spawnPoint: { x: 5, y: 2, z: 5 },
      ambientAudioUri: 'audio/music/hytopia-main-theme.mp3',
      respawnOverride: {
        regionId: 'hub',
        facingAngle: 0,
        spawnPoint: { x: 5, y: 2, z: 5 },
      },
    });
  }

  protected override setup(): void {
    super.setup();
    // Future: portals can be spawned here once regions are available
  }

  public spawnPortalTo(region: GameRegion, position: { x: number, y: number, z: number }, facingAngle: number = 0, portalTint: 'normal' | 'boss' = 'normal') {
    const portal = new PortalEntity({
      destinationRegion: region,
      destinationRegionPosition: { x: 0, y: 2, z: 0 },
      destinationRegionFacingAngle: 0,
      type: portalTint,
    });

    portal.spawn(this.world, position);
  }
}


