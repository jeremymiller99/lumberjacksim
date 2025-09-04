import BaseWearableItem from '../BaseWearableItem';

export default class SilverRingItem extends BaseWearableItem {
  static readonly id = 'silver_ring';
  static readonly displayName = 'Silver Ring';
  static readonly iconImageUri = 'icons/items/silver-ring.png';
  static readonly description = 'An elegant silver ring with intricate engravings. A symbol of status and refinement.';
  static readonly rarity = 'unusual';
  static readonly wearableSlot = 'ring';
  static readonly buyPrice = 200;
  static readonly sellPrice = 60;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/items/silver-ring.gltf';
  static readonly dropModelScale = 0.2;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/items/silver-ring.gltf';
  static readonly wearableModelScale = 0.6;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: 0, z: 0 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
