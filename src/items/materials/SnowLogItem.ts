import BaseItem from '../BaseItem';

export default class SnowLogItem extends BaseItem {
  static readonly id = 'snow_log';
  static readonly displayName = 'Snow Log';
  static readonly iconImageUri = 'icons/items/wood.png';
  static readonly description = 'A frost-hardened log from the snow forest. Dense winter wood with excellent durability.';
  static readonly rarity = 'rare';
  static readonly stackable = true;
  static readonly sellPrice = 15;
  static readonly buyPrice = 22;
  
  static readonly dropModelUri = 'models/forageables/fallen-log.gltf';
  static readonly dropModelScale = 0.3;
}


