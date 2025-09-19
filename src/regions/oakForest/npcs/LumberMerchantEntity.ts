import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

import IronAxeItem from '../../../items/axes/IronAxeItem';
import StrawHatItem from '../../../items/wearables/StrawHatItem';


export default class LumberMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Essential Tools
        IronAxeItem,         // Iron axe (75 gold) - upgrade from starting rusty axe
        
        // Protective Gear
        StrawHatItem,        // Bee repellent hat (50 gold) - protects from bee encounters
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
            text: `I've set up shop here in the oak forest to help lumberjacks upgrade their equipment! I sell quality iron axes to replace those rusty starter tools, and more importantly - straw hats that keep the bees away!`,
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
          text: `Tell me about bee encounters.`,
          nextDialogue: {
            text: `Ah, the oak forest bees! They're attracted to the vibrations of tree chopping and can be quite aggressive. My straw hats have a natural scent that repels them completely - no more bee encounters while you're wearing one!`,
            options: [
              {
                text: `That sounds very useful!`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `What do you sell?`,
          nextDialogue: {
            text: `I have two essential items: Iron Axes for 75 gold - a major upgrade from rusty axes with 50% faster chopping and better yields. And Straw Hats for 50 gold - they completely prevent bee encounters in the oak forest!`,
            options: [
              {
                text: `I'll take a look at your goods.`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `Any tips for lumberjacks?`,
          nextDialogue: {
            text: `Definitely! Upgrade from that rusty axe as soon as you can - the iron axe makes a huge difference. And if you're tired of dealing with bees, invest in a straw hat. Trust me, it's worth every gold piece!`,
            options: [
              {
                text: `Thanks for the advice!`,
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



