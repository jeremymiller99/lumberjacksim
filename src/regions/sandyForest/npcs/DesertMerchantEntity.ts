import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Tools - Palm-specialized
import PalmAxeItem from '../../../items/axes/PalmAxeItem';

export default class DesertMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Desert Specialty
        PalmAxeItem,            // 75 gold - heat-forged axe optimized for palm trees
      ],
      dialogueAvatarImageUri: 'avatars/merchant.png',
      dialogueTitle: 'Desert Axe Trader',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Axe Merchant Sahara',
      additionalDialogueOptions: [
        {
          text: `Why do you trade in the desert?`,
          nextDialogue: {
            text: `The desert may be harsh, but it's rich with opportunities! Palm trees here grow strong and tough, requiring quality axes to harvest. I specialize in providing the best lumber tools for desert conditions.`,
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
          text: `What's special about your axes?`,
          nextDialogue: {
            text: `My axes are specially tested for desert conditions! Standard axes work, but my Palm Axe is heat-forged specifically for palm trees - 35% faster chopping and better yields! The desert heat makes palm wood tough, so specialized tools make all the difference.`,
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
