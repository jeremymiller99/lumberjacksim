// Item list including cosmetic wearables
import GoldItem from './general/GoldItem';
import RawLogItem from './materials/RawLogItem';
import RustyAxeItem from './axes/RustyAxeItem';
import IronAxeItem from './axes/IronAxeItem';
import GoldAxeItem from './axes/GoldAxeItem';

// Cosmetic Wearables (keeping only essential ones)
import AdventurerHoodItem from './wearables/LeatherHoodItem';
import AdventurerTunicItem from './wearables/LeatherTunicItem';
import AdventurerGlovesItem from './wearables/LeatherGlovesItem';
import AdventurerLeggingsItem from './wearables/LeatherLeggingsItem';
import AdventurerBootsItem from './wearables/LeatherBootsItem';
import GoldenAmuletItem from './wearables/GoldenAmuletItem';
import ExplorerHatItem from './wearables/StrawHatItem';
import SilverRingItem from './wearables/SilverRingItem';
import NoblesCloakItem from './wearables/NoblesCloakItem';

export default [
  // Currency
  GoldItem,
  
  // Wood & Materials
  RawLogItem,
  
  // Axes (progression: Rusty -> Iron -> Gold)
  RustyAxeItem,
  IronAxeItem,
  GoldAxeItem,
  
  // Cosmetic Wearables (essential ones only)
  AdventurerHoodItem,
  AdventurerTunicItem,
  AdventurerGlovesItem,
  AdventurerLeggingsItem,
  AdventurerBootsItem,
  GoldenAmuletItem,
  ExplorerHatItem,
  SilverRingItem,
  NoblesCloakItem,
];
