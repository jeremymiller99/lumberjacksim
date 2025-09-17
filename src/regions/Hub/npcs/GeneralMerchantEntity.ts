import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Basic tools and materials
import RustyAxeItem from '../../../items/axes/RustyAxeItem';
import RawLogItem from '../../../items/materials/RawLogItem';

// Basic wearables - starter gear
import LeatherHoodItem from '../../../items/wearables/LeatherHoodItem';
import LeatherTunicItem from '../../../items/wearables/LeatherTunicItem';
import LeatherGlovesItem from '../../../items/wearables/LeatherGlovesItem';
import LeatherLeggingsItem from '../../../items/wearables/LeatherLeggingsItem';
import LeatherBootsItem from '../../../items/wearables/LeatherBootsItem';

export default class GeneralMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Basic starter tools
        RustyAxeItem,           // 25 gold - starter axe
        
        // Materials
        RawLogItem,             // 2 gold - basic material
        
        // Basic adventurer gear set
        LeatherHoodItem,        // 50 gold
        LeatherTunicItem,       // 75 gold
        LeatherGlovesItem,      // 40 gold
        LeatherLeggingsItem,    // 60 gold
        LeatherBootsItem,       // 45 gold
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
            text: `Welcome to the Hub! This is the central trading post where adventurers from all regions come to trade. I sell basic starter gear and materials. For specialized equipment, you'll want to visit the merchants in other regions.`,
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
            text: `If you're just starting out, grab a Rusty Axe and some basic leather armor. The axe will let you chop young trees, and the armor will keep you protected. Once you've earned some gold, visit the specialized merchants in other regions!`,
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
