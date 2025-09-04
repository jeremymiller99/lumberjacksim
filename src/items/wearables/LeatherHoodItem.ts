import BaseWearableItem from '../BaseWearableItem';
import { Quaternion } from 'hytopia';

export default class LeatherHoodItem extends BaseWearableItem {
  static readonly id = 'leather_hood';
  static readonly displayName = 'Leather Hood';
  static readonly iconImageUri = 'models/players/Cosmetics/leather-armor-cosmetic/render/leatherarmor-head.png';
  static readonly description = 'A practical leather hood worn by seasoned adventurers. Provides a mysterious look while exploring the frontier.';
  static readonly rarity = 'common';
  static readonly wearableSlot = 'helmet';
  static readonly buyPrice = 50;
  static readonly sellPrice = 15;
  
  // 3D model when dropped
  static readonly dropModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-head.gltf';
  static readonly dropModelScale = 0.4;
  
  // 3D model when worn on player
  static readonly wearableModelUri = 'models/players/Cosmetics/leather-armor-cosmetic/export/leatherarmor-head.gltf';
  static readonly wearableModelScale = 1.0;
  static readonly defaultRelativePositionAsWorn = { x: 0, y: -0.9, z: 0 };
  static readonly defaultRelativeRotationAsWorn = { x: 0, y: 0, z: 0, w: 1 };
}
