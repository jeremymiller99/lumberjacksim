import BaseWearableItem from '../BaseWearableItem';

export default class GoldArmorCapeItem extends BaseWearableItem {
  static readonly id = 'gold_armor_cape';
  static readonly displayName = 'Gold Armor Cape';
  static readonly iconImageUri = 'models/players/Cosmetics/gold-armor-cosmetic/render/goldarmor-cape.png';
  static readonly description = 'An exquisite golden cape crafted from the finest materials. Worn by nobility and wealthy merchants to display their status.';
  static readonly rarity = 'epic';
  static readonly wearableSlot = 'armor';
  static readonly buyPrice = 500;
  static readonly sellPrice = 180;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/gold-armor-cosmetic/export/goldarmor-cape-back.gltf';
  static readonly dropModelScale = 0.5;
  
  // 3D model when worn on player (cloaks attach to chest/back)
  static readonly wearableModelUri = 'models/players/Cosmetics/gold-armor-cosmetic/export/goldarmor-cape-back.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: -1, z: 0.05 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
