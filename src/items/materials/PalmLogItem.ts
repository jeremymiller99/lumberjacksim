import BaseItem from '../BaseItem';

export default class PalmLogItem extends BaseItem {
  static readonly id = 'palm_log';
  static readonly displayName = 'Palm Log';
  static readonly iconImageUri = 'icons/items/wood.png';
  static readonly description = 'A resilient palm log from the desert. Heat-hardened wood with unique properties.';
  static readonly rarity = 'unusual';
  static readonly stackable = true;
  static readonly sellPrice = 12;
  static readonly buyPrice = 18;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/forageables/fallen-log.gltf';
  static readonly dropModelScale = 0.3;
}
