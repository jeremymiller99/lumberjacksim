import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Tools - Gold axe only
import GoldAxeItem from '../../../items/axes/GoldAxeItem';

export default class WinterMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Premium lumber tools
        GoldAxeItem,            // 200 gold - golden halberd, works on all pine trees
      ],
      dialogueAvatarImageUri: 'avatars/merchant.png',
      dialogueTitle: 'Winter Axe Trader',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Axe Merchant Frost',
      additionalDialogueOptions: [
        {
          text: `How do you survive in this cold?`,
          nextDialogue: {
            text: `Years of experience, friend! The cold doesn't bother me anymore. I specialize in axes perfect for winter conditions - frozen wood is tough, so you need quality tools. My axes are tested in these very frozen lands!`,
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
          text: `Tell me about your axe.`,
          nextDialogue: {
            text: `I specialize in the Golden Halberd - it's the finest tool for pine wood! This isn't just any axe - it's a legendary halberd that cuts through the toughest frozen pine like butter. Perfect for serious winter lumberjacks who demand the best!`,
            options: [
              {
                text: `A halberd for chopping? Interesting!`,
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
