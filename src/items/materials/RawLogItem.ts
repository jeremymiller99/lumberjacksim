import BaseItem from '../BaseItem';

export default class RawLogItem extends BaseItem {
  static readonly id = 'raw_log';
  static readonly displayName = 'Raw Log';
  static readonly iconImageUri = 'icons/items/wood.png';
  static readonly description = 'A freshly cut log from a tree. Can be processed into planks at a sawmill.';
  static readonly rarity = 'common';
  static readonly stackable = true;
  static readonly sellPrice = 5;
  static readonly buyPrice = 8;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/forageables/fallen-log.gltf';
  static readonly dropModelScale = 0.3;
}
