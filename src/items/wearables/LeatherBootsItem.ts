import BaseWearableItem from '../BaseWearableItem';

export default class LeatherBootsItem extends BaseWearableItem {
  static readonly id = 'leather_boots';
  static readonly displayName = 'Leather Boots';
  static readonly iconImageUri = 'models/players/Cosmetics/leather-armor-cosmetic/render/leatherarmor-foot.png';
  static readonly description = 'Well-worn leather boots that have traveled many miles. Reliable footwear for any terrain.';
  static readonly rarity = 'common';
  static readonly wearableSlot = 'boots';
  static readonly buyPrice = 45;
  static readonly sellPrice = 14;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-foot-left.gltf';
  static readonly dropModelScale = 0.3;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-foot-left.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: 0, z: 0 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
