import { Quaternion } from 'hytopia';
import BaseLumberToolItem from '../BaseLumberToolItem';

export default class PalmAxeItem extends BaseLumberToolItem {
  // Required static properties
  static readonly id = 'palm_axe';
  static readonly displayName = 'Palm Axe';
  static readonly iconImageUri = 'models/players/Cosmetics/iron-axe-cosmetic/export/ironaxe.png';
  
  // Axe-specific properties
  static readonly description = 'A desert-forged axe designed for palm trees. Heat-treated blade cuts through tough palm wood. Reduces chopping time by 35% and increases palm wood yield by 15%.';
  static readonly rarity = 'rare';
  static readonly stackable = false;
  static readonly heldModelUri = 'models/players/Cosmetics/iron-axe-cosmetic/export/ironaxe.gltf';
  static readonly heldModelScale = 0.7;
  static readonly defaultRelativeRotationAsChild = Quaternion.fromEuler(0, 0, 0);
  static readonly defaultRelativePositionAsChild = { x: -0.2, y: -0.25, z: -0.1};
  static readonly buyPrice = 75;
  static readonly sellPrice = 25;
  
  // Lumber-specific bonuses
  static readonly choppingSpeedBonus = 0.35; // 35% faster chopping
  static readonly woodYieldBonus = 0.15; // 15% more wood yield
}
