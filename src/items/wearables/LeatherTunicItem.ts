import BaseWearableItem from '../BaseWearableItem';

export default class LeatherTunicItem extends BaseWearableItem {
  static readonly id = 'Leather_Tunic';
  static readonly displayName = 'Leather Tunic';
  static readonly iconImageUri = 'models/players/Cosmetics/leather-armor-cosmetic/render/leatherarmor-torso.png';
  static readonly description = 'A sturdy leather tunic favored by frontier explorers. Comfortable and stylish for long journeys.';
  static readonly rarity = 'common';
  static readonly wearableSlot = 'armor';
  static readonly buyPrice = 75;
  static readonly sellPrice = 25;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-torso.gltf';
  static readonly dropModelScale = 0.4;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-torso.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: -1, z: 0 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
