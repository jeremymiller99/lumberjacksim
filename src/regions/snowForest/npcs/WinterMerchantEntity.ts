import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Advanced tools
import GoldAxeItem from '../../../items/axes/GoldAxeItem';

// Winter gear and premium items
import LeatherBootsItem from '../../../items/wearables/LeatherBootsItem';
import LeatherGlovesItem from '../../../items/wearables/LeatherGlovesItem';
import NoblesCloakItem from '../../../items/wearables/NoblesCloakItem';
import GoldArmorCapeItem from '../../../items/wearables/GoldArmorCapeItem';

export default class WinterMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Premium tools
        GoldAxeItem,            // 200 gold - required for ancient trees
        
        // Winter survival gear
        LeatherBootsItem,       // 45 gold - warm feet
        LeatherGlovesItem,      // 40 gold - warm hands
        
        // Premium cloaks and capes
        NoblesCloakItem,        // 500 gold - prestigious cloak
        GoldArmorCapeItem,      // 500 gold - golden cape
      ],
      dialogueAvatarImageUri: 'avatars/merchant.png',
      dialogueTitle: 'Winter Trader',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Merchant Frost',
      additionalDialogueOptions: [
        {
          text: `How do you survive in this cold?`,
          nextDialogue: {
            text: `Years of experience, friend! The cold doesn't bother me anymore. I specialize in the finest winter gear and premium equipment. Only the best tools and warmest clothing make it through these frozen lands.`,
            options: [
              {
                text: `Impressive dedication!`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `Why are your prices so high?`,
          nextDialogue: {
            text: `Quality comes at a cost! My Gold Axes can cut through the toughest ancient trees, and my cloaks are crafted by the finest artisans. You're not just buying gear - you're investing in the best equipment money can buy.`,
            options: [
              {
                text: `I understand the value.`,
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
