import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Tools
import IronAxeItem from '../../../items/axes/IronAxeItem';

// Desert-themed wearables and accessories
import StrawHatItem from '../../../items/wearables/StrawHatItem';
import GlassesItem from '../../../items/wearables/GlassesItem';
import HytopiaGlassesItem from '../../../items/wearables/HytopiaGlassesItem';
import SilverRingItem from '../../../items/wearables/SilverRingItem';
import GoldenAmuletItem from '../../../items/wearables/GoldenAmuletItem';

export default class DesertMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Mid-tier tools
        IronAxeItem,            // 150 gold - good for palm trees
        
        // Desert survival gear
        StrawHatItem,           // 120 gold - sun protection
        GlassesItem,            // 80 gold - eye protection
        HytopiaGlassesItem,     // 200 gold - premium eyewear
        
        // Jewelry and accessories
        SilverRingItem,         // 300 gold - elegant accessory
        GoldenAmuletItem,       // 400 gold - valuable jewelry
      ],
      dialogueAvatarImageUri: 'avatars/merchant.png',
      dialogueTitle: 'Desert Trader',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Merchant Sahara',
      additionalDialogueOptions: [
        {
          text: `Why do you trade in the desert?`,
          nextDialogue: {
            text: `The desert may be harsh, but it's rich with opportunities! Palm trees here grow strong, and travelers always need proper sun protection. My specialty is desert survival gear and fine accessories for those who can afford them.`,
            options: [
              {
                text: `Smart business strategy!`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `What's special about your wares?`,
          nextDialogue: {
            text: `My straw hats and glasses aren't just fashion - they're essential for desert survival! And for the discerning adventurer, I carry the finest jewelry and premium eyewear. Quality goods for quality adventurers!`,
            options: [
              {
                text: `I'll keep that in mind.`,
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
