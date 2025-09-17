import GameRegion from '../../GameRegion';
// Import JSON via dynamic require to avoid tsconfig module issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hubMap = require('../../../assets/maps/HubMap.json');
import PortalEntity from '../../entities/PortalEntity';

// Merchant for the hub area
import GeneralMerchantEntity from './npcs/GeneralMerchantEntity';

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
    this._setupNPCs();
    // Future: portals can be spawned here once regions are available
  }

  private _setupNPCs(): void {
    // General merchant for basic starter gear
    (new GeneralMerchantEntity({ facingAngle: 0 })).spawn(this.world, { x: 5, y: 2, z: 56 });
    
    console.log('Hub: Spawned general merchant at (5, 2, 56)');
  }

  public spawnPortalTo(region: GameRegion, position: { x: number, y: number, z: number }, facingAngle: number = 0, portalTint: 'normal' | 'boss' = 'normal', label?: string, requiredLevel?: number) {
    const portal = new PortalEntity({
      destinationRegion: region,
      destinationRegionPosition: { x: 0, y: 2, z: 0 },
      destinationRegionFacingAngle: 0,
      type: portalTint,
      label: label,
      requiredLevel: requiredLevel,
    });

    portal.spawn(this.world, position);
  }
}


