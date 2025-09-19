import { Quaternion } from 'hytopia';
import BaseLumberToolItem from '../BaseLumberToolItem';

export default class IronAxeItem extends BaseLumberToolItem {
  // Required static properties
  static readonly id = 'iron_axe';
  static readonly displayName = 'Iron Axe';
  static readonly iconImageUri = 'models/players/Cosmetics/iron-axe-cosmetic/export/ironaxe.png';
  
  // Axe-specific properties
  static readonly description = 'A sharp iron axe with excellent cutting power. Reduces tree chopping time by 50% and increases wood yield significantly.';
  static readonly rarity = 'unusual';
  static readonly stackable = false;
  static readonly heldModelUri = 'models/players/Cosmetics/iron-axe-cosmetic/export/ironaxe.gltf';
  static readonly heldModelScale = 0.7;
  static readonly defaultRelativeRotationAsChild = Quaternion.fromEuler(0, 0, 0);
  static readonly defaultRelativePositionAsChild = { x: -0.2, y: -0.25, z: -0.1};
  static readonly buyPrice = 75;
  static readonly sellPrice = 25;
  
  // Lumber-specific bonuses (better than wood axe)
  static readonly choppingSpeedBonus = 0.50; // 50% faster chopping
  static readonly woodYieldBonus = 0.25; // 25% more wood drops
}
