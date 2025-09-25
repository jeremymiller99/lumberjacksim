import BaseMerchantEntity from '../../../entities/BaseMerchantEntity';
import GameManager from '../../../GameManager';
import type { BaseMerchantEntityOptions } from '../../../entities/BaseMerchantEntity';

// Basic tools
import RustyAxeItem from '../../../items/axes/RustyAxeItem';

// Hub specialty wearables
import StrawHatItem from '../../../items/wearables/StrawHatItem';
import GlassesItem from '../../../items/wearables/GlassesItem';
import HytopiaGlassesItem from '../../../items/wearables/HytopiaGlassesItem';
import GoldArmorCapeItem from '../../../items/wearables/GoldArmorCapeItem';
import OakLogItem from '../../../items/materials/OakLogItem';
import SnowLogItem from '../../../items/materials/SnowLogItem';
import PalmLogItem from '../../../items/materials/PalmLogItem';
import CursedLogItem from '../../../items/materials/CursedLogItem';

export default class GeneralMerchantEntity extends BaseMerchantEntity {
  public constructor(options?: Partial<BaseMerchantEntityOptions>) {
    super({
      buyableItemClasses: [
        // Basic starter tools
        RustyAxeItem,           // 25 gold - starter axe
        
        // Buy/sell wood (sellables will appear in sell menu regardless)
        OakLogItem,
        SnowLogItem,
        PalmLogItem,
        CursedLogItem,

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
          text: `Buy Oak Farm Upgrade (2,000 gold)` ,
          isSelectable: (interactor) => interactor.gamePlayer.ownsHouse && interactor.gamePlayer.houseLevel >= 2 && !interactor.gamePlayer.farmOakUnlocked,
          onSelect: (interactor) => {
            const cost = 2000;
            if (!interactor.adjustGold(-cost)) {
              interactor.player.ui.sendData({
                type: 'dialogue',
                avatarImageUri: 'avatars/merchant.png',
                name: 'Merchant Hubbert',
                title: 'Hub Trader',
                text: 'Not enough gold for Oak Farm upgrade. You need 2,000 gold.',
                options: [ { text: 'Close', dismiss: true, pureExit: true } ]
              });
              return;
            }
            interactor.gamePlayer.unlockOakFarm();
            interactor.showNotification('Oak Farm unlocked at your house!', 'success');
            // If house region exists, sync immediately
            const houseRegion = GameManager.instance.getOrCreatePlayerHouseRegion(interactor.gamePlayer.player.id, interactor.gamePlayer.player.username);
            houseRegion.syncAfkFarming(interactor.gamePlayer);
          },
          dismiss: false,
        },
        {
          text: `Buy upgrades.`,
          nextDialogue: {
            text: `Upgrades available:`,
            options: [
              {
                text: `Buy House (20,000 gold)` ,
                isSelectable: (interactor) => !interactor.gamePlayer.ownsHouse,
                onSelect: (interactor) => {
                  const cost = 20000;
                  if (!interactor.adjustGold(-cost)) {
                    // Show a dialogue message instead of closing UI abruptly
                    interactor.player.ui.sendData({
                      type: 'dialogue',
                      avatarImageUri: 'avatars/merchant.png',
                      name: 'Merchant Hubbert',
                      title: 'Hub Trader',
                      text: 'Not enough gold for house upgrade. You need 20,000 gold.',
                      options: [ { text: 'Close', dismiss: true, pureExit: true } ]
                    });
                    return;
                  }
                  interactor.gamePlayer.grantHouseOwnership();
                  interactor.gamePlayer.setHouseLevel(1);
                  // Show success dialogue prompting to press F
                  interactor.player.ui.sendData({
                    type: 'dialogue',
                    avatarImageUri: 'avatars/merchant.png',
                    name: 'Merchant Hubbert',
                    title: 'Hub Trader',
                    text: 'House purchased! Press F to teleport to your house.',
                    options: [ { text: 'Close', dismiss: true, pureExit: true } ]
                  });
                },
                dismiss: false,
              },
              {
                text: `Upgrade House to Level 2 (30,000 gold)`,
                isSelectable: (interactor) => interactor.gamePlayer.ownsHouse && interactor.gamePlayer.houseLevel === 1,
                onSelect: (interactor) => {
                  const cost = 30000;
                  if (!interactor.adjustGold(-cost)) {
                    interactor.player.ui.sendData({
                      type: 'dialogue',
                      avatarImageUri: 'avatars/merchant.png',
                      name: 'Merchant Hubbert',
                      title: 'Hub Trader',
                      text: 'Not enough gold for level 2 house upgrade. You need 30,000 gold.',
                      options: [ { text: 'Close', dismiss: true, pureExit: true } ]
                    });
                    return;
                  }
                  interactor.gamePlayer.setHouseLevel(2);
                  interactor.player.ui.sendData({
                    type: 'dialogue',
                    avatarImageUri: 'avatars/merchant.png',
                    name: 'Merchant Hubbert',
                    title: 'Hub Trader',
                    text: 'Your house was upgraded to level 2! Upstairs and yard are now accessible.',
                    options: [ { text: 'Close', dismiss: true, pureExit: true } ]
                  });
                },
                dismiss: false,
              },
              {
                text: `Upgrade House to Level 3 (50,000 gold)`,
                isSelectable: (interactor) => interactor.gamePlayer.ownsHouse && interactor.gamePlayer.houseLevel === 2,
                onSelect: (interactor) => {
                  const cost = 50000;
                  if (!interactor.adjustGold(-cost)) {
                    interactor.player.ui.sendData({
                      type: 'dialogue',
                      avatarImageUri: 'avatars/merchant.png',
                      name: 'Merchant Hubbert',
                      title: 'Hub Trader',
                      text: 'Not enough gold for level 3 house upgrade. You need 50,000 gold.',
                      options: [ { text: 'Close', dismiss: true, pureExit: true } ]
                    });
                    return;
                  }
                  interactor.gamePlayer.setHouseLevel(3);
                  interactor.player.ui.sendData({
                    type: 'dialogue',
                    avatarImageUri: 'avatars/merchant.png',
                    name: 'Merchant Hubbert',
                    title: 'Hub Trader',
                    text: 'Your house was upgraded to level 3! New areas are now accessible.',
                    options: [ { text: 'Close', dismiss: true, pureExit: true } ]
                  });
                },
                dismiss: false,
              },
            ],
          },
        },
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
