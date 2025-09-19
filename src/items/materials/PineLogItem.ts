import BaseItem from '../BaseItem';

export default class PineLogItem extends BaseItem {
  static readonly id = 'pine_log';
  static readonly displayName = 'Pine Log';
  static readonly iconImageUri = 'icons/items/wood.png';
  static readonly description = 'A frost-hardened pine log from the snow forest. Dense winter wood with excellent durability.';
  static readonly rarity = 'rare';
  static readonly stackable = true;
  static readonly sellPrice = 15;
  static readonly buyPrice = 22;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/forageables/fallen-log.gltf';
  static readonly dropModelScale = 0.3;
}
