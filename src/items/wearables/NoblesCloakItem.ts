import BaseWearableItem from '../BaseWearableItem';

export default class NoblesCloakItem extends BaseWearableItem {
  static readonly id = 'nobles_cloak';
  static readonly displayName = 'Noble\'s Cloak';
  static readonly iconImageUri = 'icons/items/nobles-cloak.png';
  static readonly description = 'A luxurious cloak worn by nobility. Made from the finest materials and adorned with gold thread.';
  static readonly rarity = 'epic';
  static readonly wearableSlot = 'cloak';
  static readonly buyPrice = 800;
  static readonly sellPrice = 240;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/items/nobles-cloak.gltf';
  static readonly dropModelScale = 0.5;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/items/nobles-cloak.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: 0, z: -0.1 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
