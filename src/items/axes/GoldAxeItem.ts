import { Quaternion } from 'hytopia';
import BaseLumberToolItem from '../BaseLumberToolItem';

export default class GoldAxeItem extends BaseLumberToolItem {
  // Required static properties
  static readonly id = 'gold_axe';
  static readonly displayName = 'Gold Axe';
  static readonly iconImageUri = 'models/players/Cosmetics/golden-halberd-cosmetic/export/goldenhalberd.png';
  
  // Axe-specific properties
  static readonly description = 'A magnificent golden halberd that doubles as an axe. Reduces tree chopping time by 75% and increases wood yield significantly.';
  static readonly rarity = 'rare';
  static readonly stackable = false;
  static readonly heldModelUri = 'models/players/Cosmetics/golden-halberd-cosmetic/export/goldenhalberd.gltf';
  static readonly heldModelScale = 0.7;
  static readonly defaultRelativeRotationAsChild = Quaternion.fromEuler(0, 0, 0);
  static readonly defaultRelativePositionAsChild = { x: -0.2, y: -0.25, z: -0.1};
  static readonly buyPrice = 200;
  static readonly sellPrice = 75;
  
  // Lumber-specific bonuses (best axe)
  static readonly choppingSpeedBonus = 0.75; // 75% faster chopping
  static readonly woodYieldBonus = 0.50; // 50% more wood drops
}
