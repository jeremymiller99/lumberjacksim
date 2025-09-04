import BaseWearableItem from '../BaseWearableItem';

export default class StrawHatItem extends BaseWearableItem {
  static readonly id = 'straw_hat';
  static readonly displayName = 'Straw Hat';
  static readonly iconImageUri = 'models/players/Cosmetics/summer-straw-hat-head-cosmetic/export/summerstrawhat.png';
  static readonly description = 'A wide-brimmed straw hat perfect for shielding eyes from the sun during long expeditions. Favored by seasoned explorers.';
  static readonly rarity = 'unusual';
  static readonly wearableSlot = 'helmet';
  static readonly buyPrice = 120;
  static readonly sellPrice = 40;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/summer-straw-hat-head-cosmetic/export/summerstrawhat.gltf';
  static readonly dropModelScale = 0.4;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/summer-straw-hat-head-cosmetic/export/summerstrawhat.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: -0.9, z: 0 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
