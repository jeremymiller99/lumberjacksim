import BaseWearableItem from '../BaseWearableItem';

export default class AdventurerGlovesItem extends BaseWearableItem {
  static readonly id = 'adventurer_gloves';
  static readonly displayName = 'Adventurer Gloves';
  static readonly iconImageUri = 'models/players/Cosmetics/leather-armor-cosmetic/render/leatherarmor-hand.png';
  static readonly description = 'Durable leather gloves that protect hands while maintaining dexterity. Perfect for handling tools and climbing.';
  static readonly rarity = 'common';
  static readonly wearableSlot = 'gloves';
  static readonly buyPrice = 40;
  static readonly sellPrice = 12;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-hand-left.gltf';
  static readonly dropModelScale = 0.3;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-hand-left.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: 0, z: 0 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
