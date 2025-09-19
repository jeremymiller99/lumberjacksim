import BaseItem from '../BaseItem';

export default class CursedLogItem extends BaseItem {
  static readonly id = 'cursed_log';
  static readonly displayName = 'Cursed Log';
  static readonly iconImageUri = 'icons/items/wood.png';
  static readonly description = 'A dark log from the cursed forest. Imbued with shadow magic and incredibly valuable.';
  static readonly rarity = 'epic';
  static readonly stackable = true;
  static readonly sellPrice = 20;
  static readonly buyPrice = 30;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/forageables/fallen-log.gltf';
  static readonly dropModelScale = 0.3;
}
