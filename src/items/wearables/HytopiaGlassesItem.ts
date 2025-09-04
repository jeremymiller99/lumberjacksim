import BaseWearableItem from '../BaseWearableItem';

export default class HytopiaGlassesItem extends BaseWearableItem {
  static readonly id = 'hytopia_glasses';
  static readonly displayName = 'HYTOPIA Glasses';
  static readonly iconImageUri = 'models/players/Cosmetics/hytopia-glasses-cosmetic/export/glassesworlds.png';
  static readonly description = 'Stylish HYTOPIA glasses that showcase your connection to the metaverse. A symbol of status in the digital frontier.';
  static readonly rarity = 'rare';
  static readonly wearableSlot = 'accessory';
  static readonly buyPrice = 200;
  static readonly sellPrice = 75;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/hytopia-glasses-cosmetic/export/glasses-worlds.gltf';
  static readonly dropModelScale = 0.2;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/hytopia-glasses-cosmetic/export/glasses-worlds.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: -1, z: -0.05 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
