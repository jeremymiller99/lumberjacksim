// Tutorial Quests - Lumber-focused starter area
import FirstChopQuest from './tutorial/FirstChopQuest';
import LearnToSellQuest from './tutorial/LearnToSellQuest';
import UpgradeAxeQuest from './tutorial/UpgradeAxeQuest';

// Other quests commented out for lumber-only game
// import WelcomeToStalkhavenQuest from './main/WelcomeToStalkhavenQuest';
// import ExploringStalkhavenQuest from './main/ExploringStalkhavenQuest';
// ... etc

export default [
  // Tutorial Quests - Lumber-focused starter area
  FirstChopQuest,
  LearnToSellQuest,
  UpgradeAxeQuest,

  // NOTE: Other quests disabled for lumber-only game as they reference non-existent items
  // TODO: Re-enable other quests when full item system is restored
];
