import BaseWearableItem from '../BaseWearableItem';

export default class GoldenAmuletItem extends BaseWearableItem {
  static readonly id = 'golden_amulet';
  static readonly displayName = 'Golden Amulet';
  static readonly iconImageUri = 'icons/items/golden-amulet.png';
  static readonly description = 'A magnificent golden amulet that gleams with ancient power. Said to bring good fortune to its wearer.';
  static readonly rarity = 'rare';
  static readonly wearableSlot = 'necklace';
  static readonly buyPrice = 500;
  static readonly sellPrice = 150;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/items/golden-amulet.gltf';
  static readonly dropModelScale = 0.3;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/items/golden-amulet.gltf';
  static readonly wearableModelScale = 0.8;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: -0.2, z: 0.1 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
