import BaseItem from '../BaseItem';

export default class OakLogItem extends BaseItem {
  static readonly id = 'oak_log';
  static readonly displayName = 'Oak Log';
  static readonly iconImageUri = 'icons/items/wood.png';
  static readonly description = 'A sturdy oak log from the forest. High-quality wood perfect for crafting.';
  static readonly rarity = 'common';
  static readonly stackable = true;
  static readonly sellPrice = 8;
  static readonly buyPrice = 12;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/forageables/fallen-log.gltf';
  static readonly dropModelScale = 0.3;
}
