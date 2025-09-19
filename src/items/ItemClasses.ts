// Item list including cosmetic wearables
import RawLogItem from './materials/RawLogItem';

// Regional wood types
import OakLogItem from './materials/OakLogItem';
import PalmLogItem from './materials/PalmLogItem';
import PineLogItem from './materials/PineLogItem';
import CursedLogItem from './materials/CursedLogItem';

// Basic axes
import RustyAxeItem from './axes/RustyAxeItem';
import IronAxeItem from './axes/IronAxeItem';
import GoldAxeItem from './axes/GoldAxeItem';

// Regional specialized axes
import PalmAxeItem from './axes/PalmAxeItem';
import CursedAxeItem from './axes/CursedAxeItem';

// Cosmetic Wearables (keeping only essential ones)
import AdventurerHoodItem from './wearables/LeatherHoodItem';
import AdventurerTunicItem from './wearables/LeatherTunicItem';
import AdventurerGlovesItem from './wearables/LeatherGlovesItem';
import AdventurerLeggingsItem from './wearables/LeatherLeggingsItem';
import AdventurerBootsItem from './wearables/LeatherBootsItem';
import GoldenAmuletItem from './wearables/GoldenAmuletItem';
import StrawHatItem from './wearables/StrawHatItem';
import SilverRingItem from './wearables/SilverRingItem';
import NoblesCloakItem from './wearables/NoblesCloakItem';

export default [
  // Wood & Materials
  RawLogItem,
  OakLogItem,
  PalmLogItem,
  PineLogItem,
  CursedLogItem,
  
  // Basic Axes (progression: Rusty -> Iron -> Gold)
  RustyAxeItem,        // Starter axe - works on young & mature trees (slow on mature)
  IronAxeItem,         // Oak forest axe - works on all oak trees
  GoldAxeItem,         // Golden halberd - works on all pine trees
  
  // Regional Specialized Axes
  PalmAxeItem,         // Desert axe - works on all palm trees  
  CursedAxeItem,       // Shadow axe - required for all cursed trees
  
  // Cosmetic Wearables (essential ones only)
  AdventurerHoodItem,
  AdventurerTunicItem,
  AdventurerGlovesItem,
  AdventurerLeggingsItem,
  AdventurerBootsItem,
  GoldenAmuletItem,
  StrawHatItem,
  SilverRingItem,
  NoblesCloakItem,
];
