import BaseWearableItem from '../BaseWearableItem';

export default class AvatarsGlassesItem extends BaseWearableItem {
  static readonly id = 'glasses';
  static readonly displayName = 'Glasses';
  static readonly iconImageUri = 'models/players/Cosmetics/avatars-glasses-cosmetic/export/glassesavatars.png';
  static readonly description = 'Stylish Avatar glasses that add a touch of modern flair to any outfit. Perfect for the tech-savvy adventurer.';
  static readonly rarity = 'common';
  static readonly wearableSlot = 'accessory';
  static readonly buyPrice = 80;
  static readonly sellPrice = 25;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/avatars-glasses-cosmetic/export/glasses-avatars.gltf';
  static readonly dropModelScale = 0.15;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/avatars-glasses-cosmetic/export/glasses-avatars.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: -1, z: -0.05 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
