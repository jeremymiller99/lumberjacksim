import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Tools - Cursed-specialized
import CursedAxeItem from '../../../items/axes/CursedAxeItem';

export default class DarkMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Cursed Specialty
        CursedAxeItem,          // 200 gold - shadow-forged axe for cursed wood
      ],
      dialogueAvatarImageUri: 'avatars/gravekeeper.png',
      dialogueTitle: 'Shadow Axe Dealer',
      idleAnimations: [ 'idle' ],
      modelUri: 'models/npcs/merchant.gltf',
      modelScale: 0.75,
      name: 'Axe Merchant Umbra',
      additionalDialogueOptions: [
        {
          text: `Buy Cursed (Dead) Farm Upgrade (10,000 gold)` ,
          isSelectable: (interactor) => interactor.gamePlayer.ownsHouse && interactor.gamePlayer.houseLevel >= 2 && !interactor.gamePlayer.farmCursedUnlocked,
          onSelect: (interactor) => {
            const cost = 10000;
            if (!interactor.adjustGold(-cost)) {
              interactor.showNotification('Not enough gold for Cursed Farm upgrade. (10,000)', 'error');
              return;
            }
            interactor.gamePlayer.unlockCursedFarm();
            interactor.showNotification('Cursed (Dead) Farm unlocked at your house!', 'success');
            const GameManager = require('../../../GameManager').default;
            const houseRegion = GameManager.instance.getOrCreatePlayerHouseRegion(interactor.gamePlayer.player.id, interactor.gamePlayer.player.username);
            houseRegion.syncAfkFarming(interactor.gamePlayer);
          },
          dismiss: false,
        },
        {
          text: `Why do you stay in this cursed place?`,
          nextDialogue: {
            text: `*whispers darkly* The curse doesn't affect me anymore... I've been here so long, I've become part of the shadows. The cursed wood here is unique - harder than normal timber. My axes are the only tools that can properly harvest it.`,
            options: [
              {
                text: `That's... interesting.`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
        {
          text: `Are your axes cursed?`,
          nextDialogue: {
            text: `*chuckles mysteriously* My Cursed Axe is imbued with shadow magic - the only tool that truly masters cursed wood. 45% faster chopping and the best yields you'll find. What some fear, others find profitable.`,
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
