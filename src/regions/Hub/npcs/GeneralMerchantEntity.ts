import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Basic tools
import RustyAxeItem from '../../../items/axes/RustyAxeItem';

// Hub specialty wearables
import StrawHatItem from '../../../items/wearables/StrawHatItem';
import GlassesItem from '../../../items/wearables/GlassesItem';
import HytopiaGlassesItem from '../../../items/wearables/HytopiaGlassesItem';
import GoldArmorCapeItem from '../../../items/wearables/GoldArmorCapeItem';

export default class GeneralMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Basic starter tools
        RustyAxeItem,           // 25 gold - starter axe
        
        // Hub specialty wearables  
        StrawHatItem,           // 50 gold - bee repellent hat
        GlassesItem,            // 80 gold - basic eyewear
        HytopiaGlassesItem,     // 200 gold - premium eyewear
        GoldArmorCapeItem,      // 500 gold - prestigious cape
      ],
      dialogueAvatarImageUri: 'avatars/merchant.png',
      dialogueTitle: 'Hub Trader',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Merchant Hubbert',
      additionalDialogueOptions: [
        {
          text: `Tell me about this place.`,
          nextDialogue: {
            text: `Welcome to the Hub! This is the central trading post where adventurers from all regions come to trade. I specialize in stylish accessories and premium wearables. For specialized lumber tools, visit the merchants in other regions.`,
            options: [
              {
                text: `Thanks for the info!`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `What should I buy first?`,
          nextDialogue: {
            text: `If you're just starting out, grab a Rusty Axe for chopping trees. For style and protection, try my Straw Hat or basic Glasses. Save up for the premium Hytopia Glasses or the legendary Gold Armor Cape once you've earned some gold!`,
            options: [
              {
                text: `Good advice, thanks!`,
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
