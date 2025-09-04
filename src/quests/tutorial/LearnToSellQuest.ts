import { SkillId } from '../../config';
import type GamePlayer from '../../GamePlayer';
import type GamePlayerEntity from '../../GamePlayerEntity';
import OptimizedBaseQuest from '../OptimizedBaseQuest';
import { BaseChoppableTreeEntityPlayerEvent } from '../../entities/forageables/ChoppableTreeEntity';
import type { BaseChoppableTreeEntityPlayerEventPayloads } from '../../entities/forageables/ChoppableTreeEntity';

import LumberMerchantEntity from '../../regions/forest1/npcs/LumberMerchantEntity';
import RawLogItem from '../../items/materials/RawLogItem';
import GoldItem from '../../items/general/GoldItem';
import UpgradeAxeQuest from './UpgradeAxeQuest';

export default class LearnToSellQuest extends OptimizedBaseQuest {
  static readonly id = 'learn-to-sell';
  static readonly displayName = 'Learning the Trade';
  static readonly description = `Now that you've chopped your first tree, it's time to turn that wood into gold! Sell your Raw Logs to Lumber Merchant Oakley.`;

  static readonly reward = OptimizedBaseQuest.createReward(
    [{ itemClass: GoldItem, quantity: 25 }], // Bonus gold on top of the sale
    [{ skillId: SkillId.LUMBER, amount: 75 }]
  );

  static readonly objectives = [
    OptimizedBaseQuest.createObjective(
      'collect-wood',
      'Collect 5 Raw Logs',
      'Chop more trees to collect 5 Raw Logs. Each tree drops multiple logs.',
      5
    ),
    OptimizedBaseQuest.createObjective(
      'sell-wood',
      'Sell Wood to the Merchant',
      'Sell at least 3 Raw Logs to Lumber Merchant Oakley to learn how trading works.',
      3
    ),
    OptimizedBaseQuest.createObjective(
      'talk-about-tools',
      'Ask About Better Tools',
      'Ask Lumber Merchant Oakley about upgrading your tools.'
    )
  ];

  static readonly dialogueInteractions = [
    // Optimized selling dialogue using helper method
    OptimizedBaseQuest.createItemTransactionDialogue(
      LumberMerchantEntity,
      `I'd like to sell some wood.`,
      `Excellent! I can see you're getting the hang of the lumber trade. You've successfully sold your wood - that's the core of this business right there!`,
      {
        removeItems: [{ itemClass: RawLogItem, quantity: 3 }],
        addItems: [{ itemClass: GoldItem, quantity: 15 }] // 3 logs * 5 gold each
      },
      this.id,
      'sell-wood',
      (interactor: GamePlayerEntity) => {
        return interactor.gamePlayer.questLog.isQuestActive(this.id) &&
               interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'collect-wood') &&
               !interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'sell-wood') &&
               interactor.gamePlayer.hasHeldItem(RawLogItem, 3);
      },
      (interactor: GamePlayerEntity) => {
        interactor.showNotification(`Sold 3 Raw Logs for 15 gold!`, 'success');
      }
    ),

    // Optimized completion dialogue using helper method
    OptimizedBaseQuest.createCompletionDialogue(
      LumberMerchantEntity,
      `What tools do you recommend for chopping more efficiently?`,
      `A Wood Axe makes you 25% faster at chopping and increases your wood yield. Plus, you'll look more professional! Once you save up, I'd definitely recommend upgrading. Good tools pay for themselves quickly in this business.`,
      this.id,
      'talk-about-tools',
      (interactor: GamePlayerEntity) => {
        return interactor.gamePlayer.questLog.isQuestActive(this.id) &&
               interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'sell-wood');
      },
      UpgradeAxeQuest
    )
  ];

  public static setupForPlayer(gamePlayer: GamePlayer): () => void {
    // Performance optimization: Direct event handling for better performance
    const chopListener = (payload: BaseChoppableTreeEntityPlayerEventPayloads[BaseChoppableTreeEntityPlayerEvent.CHOPPED]) => {
      if (!gamePlayer.questLog.isQuestActive(this.id)) return;
      
      console.log('LearnToSellQuest: Tree chopped, updating collect-wood objective');
      // Each tree gives multiple logs, so we'll estimate 3 logs per tree
      gamePlayer.questLog.adjustObjectiveProgress(this.id, 'collect-wood', 3);
    };

    // Performance optimization: Use optimized inventory tracking for wood collection
    const inventorySetup = OptimizedBaseQuest.createInventoryTrackingSetup(
      this.id,
      [{ objectiveId: 'collect-wood', itemClass: RawLogItem, targetQuantity: 5 }]
    );

    console.log('LearnToSellQuest: Setting up event listeners for', gamePlayer.player.id);
    gamePlayer.eventRouter.on(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);
    const inventoryCleanup = inventorySetup(gamePlayer);

    return () => {
      console.log('LearnToSellQuest: Cleaning up event listeners');
      gamePlayer.eventRouter.off(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);
      inventoryCleanup();
    };
  }
}
