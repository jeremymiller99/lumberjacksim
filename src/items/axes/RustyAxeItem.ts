import { Quaternion } from 'hytopia';
import BaseLumberToolItem from '../BaseLumberToolItem';

export default class RustyAxeItem extends BaseLumberToolItem {
  // Required static properties
  static readonly id = 'rusty_axe';
  static readonly displayName = 'Rusty Axe';
  static readonly iconImageUri = 'models/players/Cosmetics/rusty-axe-cosmetic/export/rustyaxe.png';
  
  // Axe-specific properties
  static readonly description = 'A sturdy rusty axe perfect for chopping trees. Reduces tree chopping time by 25%.';
  static readonly rarity = 'common';
  static readonly stackable = false;
  static readonly heldModelUri = 'models/players/Cosmetics/rusty-axe-cosmetic/export/rustyaxe.gltf';
  static readonly heldModelScale = 0.7;
  static readonly defaultRelativeRotationAsChild = Quaternion.fromEuler(0, 0, 0);
  static readonly defaultRelativePositionAsChild = { x: -0.2, y: -0.25, z: -0.1};
  static readonly buyPrice = 25;
  static readonly sellPrice = 8;
  
  // Lumber-specific bonuses
  static readonly choppingSpeedBonus = 0.25; // 25% faster chopping
  static readonly woodYieldBonus = 0.0; // No yield bonus for basic axe
}
