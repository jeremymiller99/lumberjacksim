import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Materials (cursed wood might be valuable)
import RawLogItem from '../../../items/materials/RawLogItem';

// Dark/mysterious themed items
import LeatherHoodItem from '../../../items/wearables/LeatherHoodItem';
import NoblesCloakItem from '../../../items/wearables/NoblesCloakItem';
import GoldArmorCapeItem from '../../../items/wearables/GoldArmorCapeItem';
import GoldenAmuletItem from '../../../items/wearables/GoldenAmuletItem';
import SilverRingItem from '../../../items/wearables/SilverRingItem';

export default class DarkMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Cursed materials (higher price due to rarity)
        RawLogItem,             // 5 gold - cursed wood is more valuable
        
        // Dark aesthetic items
        LeatherHoodItem,        // 50 gold - mysterious hood
        NoblesCloakItem,        // 500 gold - dark noble's cloak
        GoldArmorCapeItem,      // 500 gold - intimidating cape
        
        // Mystical accessories
        GoldenAmuletItem,       // 400 gold - protective charm
        SilverRingItem,         // 300 gold - cursed ring
      ],
      dialogueAvatarImageUri: 'avatars/gravekeeper.png',
      dialogueTitle: 'Shadow Dealer',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Merchant Umbra',
      additionalDialogueOptions: [
        {
          text: `Why do you stay in this cursed place?`,
          nextDialogue: {
            text: `*whispers darkly* The curse doesn't affect me anymore... I've been here so long, I've become part of the shadows. The burnt wood here holds dark power, and my wares carry the essence of this realm. Perfect for those who embrace the darkness.`,
            options: [
              {
                text: `That's... unsettling.`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `Are your items cursed?`,
          nextDialogue: {
            text: `*chuckles mysteriously* Cursed? Or blessed with shadow magic? My cloaks hide you from prying eyes, my jewelry protects against dark forces. What some call cursed, others call powerful. The choice is yours, adventurer.`,
            options: [
              {
                text: `I'll... consider it.`,
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
