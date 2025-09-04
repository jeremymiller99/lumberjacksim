import BaseWearableItem from '../BaseWearableItem';

export default class LeatherLeggingsItem extends BaseWearableItem {
  static readonly id = 'leather_leggings';
  static readonly displayName = 'Leather Leggings';
  static readonly iconImageUri = 'models/players/Cosmetics/leather-armor-cosmetic/render/leatherarmor-leg.png';
  static readonly description = 'Flexible leather leggings designed for movement and comfort. Essential gear for any serious adventurer.';
  static readonly rarity = 'common';
  static readonly wearableSlot = 'leggings';
  static readonly buyPrice = 60;
  static readonly sellPrice = 18;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-leg-left.gltf';
  static readonly dropModelScale = 0.4;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-leg-left.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: 0, z: 0 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
