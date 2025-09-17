import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

import RustyAxeItem from '../../../items/axes/RustyAxeItem';
import IronAxeItem from '../../../items/axes/IronAxeItem';
import GoldAxeItem from '../../../items/axes/GoldAxeItem';

// Cosmetic Wearables
import LeatherHoodItem from '../../../items/wearables/LeatherHoodItem';
import LeatherTunicItem from '../../../items/wearables/LeatherTunicItem';
import LeatherGlovesItem from '../../../items/wearables/LeatherGlovesItem';
import LeatherLeggingsItem from '../../../items/wearables/LeatherLeggingsItem';
import LeatherBootsItem from '../../../items/wearables/LeatherBootsItem';
import HytopiaGlassesItem from '../../../items/wearables/HytopiaGlassesItem';
import GlassesItem from '../../../items/wearables/GlassesItem';
import StrawHatItem from '../../../items/wearables/StrawHatItem';
import GoldArmorCapeItem from '../../../items/wearables/GoldArmorCapeItem';

export default class LumberMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Lumber Tools
        RustyAxeItem,        // Basic axe (25 gold) - for mature trees
        IronAxeItem,       // Better axe (150 gold) - for mature trees
        GoldAxeItem,        // Advanced axe (200 gold) - required for ancient trees
        
        // Cosmetic Wearables - Basic Adventurer Set
        LeatherHoodItem,        // 50 gold
        LeatherTunicItem,       // 75 gold
        
        // Accessories
        GlassesItem,            // 80 gold (Common)
        HytopiaGlassesItem,          // 200 gold (Rare)
        
        // Premium Items
        StrawHatItem,           // 120 gold (Unusual)
        GoldArmorCapeItem,           // 500 gold (Epic)
      ],
      dialogueAvatarImageUri: 'avatars/merchant.png',
      dialogueTitle: 'Forest Merchant',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Merchant Oakley',
      additionalDialogueOptions: [
        {
          text: `What brings you to the forest?`,
          nextDialogue: {
            text: `I've set up shop here in the forest to buy lumber from adventurers and sell both the tools they need and some fine wearables! These woods are perfect for learning the lumber trade, and adventurers like to look good while working!`,
            options: [
              {
                text: `Sounds like good business.`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `Any tips for chopping trees?`,
          nextDialogue: {
            text: `Absolutely! Small trees can be chopped bare-handed, but you'll need tools for the bigger ones. Mature trees require at least a Rusty Axe, and Ancient trees need a Gold Axe specifically. Axes also make chopping much faster on all trees!`,
            options: [
              {
                text: `Thanks for the advice!`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `Tell me about your wearables.`,
          nextDialogue: {
            text: `I carry a fine selection of cosmetic items! The Adventurer set is perfect for newcomers - hood, tunic, gloves, leggings, and boots. For accessories, try a Silver Ring or save up for the Golden Amulet. The Noble's Cloak is my finest piece at 500 gold!`,
            options: [
              {
                text: `I'll take a look at your wares.`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `What are your prices?`,
          nextDialogue: {
            text: `Tools: Rusty Axe (25g), Iron Axe (150g), Gold Axe (200g). Wearables range from basic Adventurer gear (40-75g each) to premium items like the Explorer Hat (120g) and Noble's Cloak (500g). Something for every budget!`,
            options: [
              {
                text: `Good to know the prices.`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
      ],
      ...options,
    });
  }
}



