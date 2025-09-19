import { Quaternion } from 'hytopia';
import BaseLumberToolItem from '../BaseLumberToolItem';

export default class CursedAxeItem extends BaseLumberToolItem {
  // Required static properties
  static readonly id = 'cursed_axe';
  static readonly displayName = 'Cursed Axe';
  static readonly iconImageUri = 'models/players/Cosmetics/gold-axe-cosmetic/export/goldaxe.png';
  
  // Axe-specific properties
  static readonly description = 'A shadow-forged axe imbued with dark magic. The only tool capable of harvesting cursed wood. Reduces chopping time by 45% and increases cursed wood yield by 25%.';
  static readonly rarity = 'legendary';
  static readonly stackable = false;
  static readonly heldModelUri = 'models/players/Cosmetics/gold-axe-cosmetic/export/goldaxe.gltf';
  static readonly heldModelScale = 0.7;
  static readonly defaultRelativeRotationAsChild = Quaternion.fromEuler(0, 0, 0);
  static readonly defaultRelativePositionAsChild = { x: -0.2, y: -0.25, z: -0.1};
  static readonly buyPrice = 200;
  static readonly sellPrice = 65;
  
  // Lumber-specific bonuses
  static readonly choppingSpeedBonus = 0.45; // 45% faster chopping
  static readonly woodYieldBonus = 0.25; // 25% more wood yield
}
