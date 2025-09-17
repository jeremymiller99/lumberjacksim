import BaseQuest from '../BaseQuest';
import type { QuestObjective, QuestNpcDialogueInteraction } from '../BaseQuest';
import { SkillId } from '../../config';
import type GamePlayer from '../../GamePlayer';
import type GamePlayerEntity from '../../GamePlayerEntity';

// TODO: Import merchant events when they're implemented
// import { BaseMerchantEntityPlayerEvent } from '../../entities/BaseMerchantEntity';
import { BaseChoppableTreeEntityPlayerEvent } from '../../entities/forageables/ChoppableTreeEntity';
import type { BaseChoppableTreeEntityPlayerEventPayloads } from '../../entities/forageables/ChoppableTreeEntity';

import LumberMerchantEntity from '../../regions/oakForest/npcs/LumberMerchantEntity';
import RustyAxeItem from '../../items/axes/RustyAxeItem';
import RawLogItem from '../../items/materials/RawLogItem';
import GoldItem from '../../items/general/GoldItem';

export default class UpgradeAxeQuest extends BaseQuest {
  static readonly id = 'upgrade-axe';
  static readonly displayName = 'Professional Lumberjack';
  static readonly description = `Time to upgrade your equipment! Earn enough gold to buy a Rusty Axe and become a professional lumberjack.`;

  static readonly reward = {
    items: [
      { itemClass: GoldItem, quantity: 50 }, // Bonus gold to help with future purchases
    ],
    skillExperience: [
      { skillId: SkillId.LUMBER, amount: 150 },
    ],
  }

  static readonly objectives: QuestObjective[] = [
    {
      id: 'earn-gold',
      name: 'Earn 25 Gold',
      description: 'Chop trees and sell wood to earn 25 gold for your first Rusty Axe.',
      target: 25,
    },
    {
      id: 'buy-wood-axe',
      name: 'Buy a Rusty Axe',
      description: 'Purchase a Rusty Axe from Lumber Merchant Oakley.',
      target: 1,
    },
    {
      id: 'test-new-axe',
      name: 'Chop 3 Trees with Your New Axe',
      description: 'Test your new Rusty Axe by chopping down 3 trees. Notice how much faster it is!',
      target: 3,
    },
    {
      id: 'celebrate-success',
      name: 'Celebrate Your Success',
      description: 'Talk to Lumber Merchant Oakley about your progress.',
      target: 1,
    }
  ];

  static readonly dialogueInteractions: QuestNpcDialogueInteraction[] = [
    // Encourage to buy axe when they have enough gold
    {
      npcClass: LumberMerchantEntity,
      dialogueOption: {
        text: `I've earned enough gold for a Rusty Axe!`,
        nextDialogue: {
          text: `Excellent! You've proven you're serious about the lumber business. A Rusty Axe will transform your work - you'll chop 25% faster and be able to tackle Mature trees. This is your first step toward becoming a master lumberjack!`,
          options: [
            {
              text: `Let me buy that Rusty Axe!`,
              nextDialogue: {
                text: `Congratulations on your first major equipment upgrade! You're now equipped like a true professional. Go test it out on some trees - you'll feel the difference immediately!`,
                options: [
                  {
                    text: `I can't wait to try it out!`,
                    dismiss: true,
                    pureExit: true,
                  }
                ]
              },
              onSelect: (interactor: GamePlayerEntity) => {
                // Actually perform the purchase transaction
                const goldCost = RustyAxeItem.buyPrice || 25;
                const hasEnoughGold = interactor.gamePlayer.getHeldItemQuantity(GoldItem) >= goldCost;
                
                if (hasEnoughGold) {
                  // Remove gold and add axe
                  if (interactor.gamePlayer.removeHeldItem(GoldItem, goldCost)) {
                    if (interactor.gamePlayer.addHeldItem(RustyAxeItem, 1)) {
                      // Mark the axe purchase as complete
                      interactor.gamePlayer.questLog.adjustObjectiveProgress(this.id, 'buy-wood-axe', 1);
                      interactor.showNotification(`Purchased Rusty Axe for ${goldCost} gold!`, 'success');
                    } else {
                      // Failed to add axe (inventory full), refund gold
                      interactor.gamePlayer.addHeldItem(GoldItem, goldCost);
                      interactor.showNotification('Your inventory is full! Clear some space and try again.', 'error');
                    }
                  } else {
                    interactor.showNotification('Not enough gold for this purchase.', 'error');
                  }
                } else {
                  interactor.showNotification('You need more gold to buy this axe.', 'error');
                }
              }
            }
          ]
        },
      },
      enabledForInteractor: (interactor: GamePlayerEntity) => {
        return interactor.gamePlayer.questLog.isQuestActive(this.id) &&
               interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'earn-gold') &&
               !interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'buy-wood-axe') &&
               interactor.gamePlayer.getHeldItemQuantity(GoldItem) >= 25;
      }
    },

    // Celebrate completion
    {
      npcClass: LumberMerchantEntity,
      dialogueOption: {
        text: `This Rusty Axe is amazing! Chopping is so much faster now.`,
        nextDialogue: {
          text: `I knew you'd love it! You're no longer just swinging your fists at trees - you're a proper lumberjack now. Keep working hard, save up your gold, and eventually you can upgrade to even better tools. The Iron Axe and Gold Axe will open up whole new possibilities!`,
          options: [
            {
              text: `What's next for me?`,
              nextDialogue: {
                text: `The world is your forest! Keep chopping, keep selling, keep upgrading. Look for Mature and Ancient trees as you explore - they drop more wood but need better tools. Build your skills, build your wealth, and who knows how far you'll go in the lumber business!`,
                options: [
                  {
                    text: `Thank you for all the guidance!`,
                    dismiss: true,
                    pureExit: true,
                  }
                ]
              },
              onSelect: (interactor: GamePlayerEntity) => {
                interactor.gamePlayer.questLog.adjustObjectiveProgress(this.id, 'celebrate-success', 1);
                interactor.gamePlayer.questLog.completeQuest(this.id);
                // Tutorial complete - player is now ready for the main game!
              }
            }
          ],
        },
      },
      enabledForInteractor: (interactor: GamePlayerEntity) => {
        return interactor.gamePlayer.questLog.isQuestActive(this.id) &&
               interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'test-new-axe');
      }
    }
  ];

  public static setupForPlayer(gamePlayer: GamePlayer): () => void {
    // Track tree chopping with axe
    const chopListener = (payload: BaseChoppableTreeEntityPlayerEventPayloads[BaseChoppableTreeEntityPlayerEvent.CHOPPED]) => {
      if (gamePlayer.hasHeldItem(RustyAxeItem, 1)) {
        console.log('UpgradeAxeQuest: Tree chopped with axe, updating test-new-axe objective');
        gamePlayer.questLog.adjustObjectiveProgress(this.id, 'test-new-axe', 1);
      }
    };

    // Performance optimization: Event-driven gold tracking instead of polling
    const goldCheckListener = () => {
      if (gamePlayer.questLog.isQuestActive(this.id)) {
        const currentGold = gamePlayer.getHeldItemQuantity(GoldItem);
        if (currentGold >= 25 && !gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'earn-gold')) {
          gamePlayer.questLog.adjustObjectiveProgress(this.id, 'earn-gold', 25);
        }
      }
    };

    // Performance optimization: Event-driven axe acquisition tracking
    const inventoryChangeListener = () => {
      if (gamePlayer.questLog.isQuestActive(this.id)) {
        const hasRustyAxe = gamePlayer.hasHeldItem(RustyAxeItem, 1);
        if (hasRustyAxe && !gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'buy-wood-axe')) {
          console.log('UpgradeAxeQuest: Player has Rusty Axe, completing buy-wood-axe objective');
          gamePlayer.questLog.adjustObjectiveProgress(this.id, 'buy-wood-axe', 1);
        }
      }
    };

    console.log('UpgradeAxeQuest: Setting up event listeners for', gamePlayer.player.id);
    gamePlayer.eventRouter.on(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);
    
    // Performance optimization: Listen to inventory changes instead of polling
    // Note: These would need to be implemented in the GamePlayer class if not available
    if (gamePlayer.eventRouter.listenerCount('inventoryChanged') !== undefined) {
      gamePlayer.eventRouter.on('inventoryChanged', inventoryChangeListener);
      gamePlayer.eventRouter.on('goldChanged', goldCheckListener);
    } else {
      // Fallback to less frequent polling if inventory events aren't available
      const statusCheckInterval = setInterval(() => {
        goldCheckListener();
        inventoryChangeListener();
      }, 5000) as any; // Reduced frequency from 2s to 5s

      const cleanup = () => {
        console.log('UpgradeAxeQuest: Cleaning up listeners');
        gamePlayer.eventRouter.off(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);
        clearInterval(statusCheckInterval);
      };

      return cleanup;
    }

    const cleanup = () => {
      console.log('UpgradeAxeQuest: Cleaning up event listeners');
      gamePlayer.eventRouter.off(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);
      gamePlayer.eventRouter.off('inventoryChanged', inventoryChangeListener);
      gamePlayer.eventRouter.off('goldChanged', goldCheckListener);
    };

    return cleanup;
  }
}
