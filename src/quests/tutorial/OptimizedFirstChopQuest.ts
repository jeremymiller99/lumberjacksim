import { SkillId } from '../../config';
import type GamePlayer from '../../GamePlayer';
import OptimizedBaseQuest from '../OptimizedBaseQuest';
import { BaseChoppableTreeEntityPlayerEvent } from '../../entities/forageables/ChoppableTreeEntity';
import type { BaseChoppableTreeEntityPlayerEventPayloads } from '../../entities/forageables/ChoppableTreeEntity';
import LumberMerchantEntity from '../../regions/forest1/npcs/LumberMerchantEntity';
import LearnToSellQuest from './LearnToSellQuest';

/**
 * Optimized version of FirstChopQuest using the new OptimizedBaseQuest
 * Demonstrates reduced code duplication and improved performance
 */
export default class OptimizedFirstChopQuest extends OptimizedBaseQuest {
  static readonly id = 'first-chop-optimized';
  static readonly displayName = 'Your First Tree (Optimized)';
  static readonly description = `Welcome to the lumber business! Let's start with the basics - chop down your first tree to get some wood.`;

  static readonly reward = OptimizedBaseQuest.createReward(
    undefined, // No item rewards
    [{ skillId: SkillId.LUMBER, amount: 50 }]
  );

  static readonly objectives = [
    OptimizedBaseQuest.createObjective(
      'chop-first-tree',
      'Chop Down 1 Tree',
      'Find a tree and chop it down. Look for the small oak trees scattered around the area.'
    ),
    OptimizedBaseQuest.createObjective(
      'talk-to-merchant',
      'Talk to Lumber Merchant Oakley',
      'Speak with Lumber Merchant Oakley to learn about the lumber trade.'
    )
  ];

  static readonly dialogueInteractions = [
    OptimizedBaseQuest.createCompletionDialogue(
      LumberMerchantEntity,
      `I chopped down my first tree!`,
      `Excellent work! You're getting the hang of this lumber business. That tree you chopped will provide valuable wood that you can sell. Keep practicing and you'll become a master lumberjack in no time!`,
      this.id,
      'talk-to-merchant',
      (interactor) => {
        return interactor.gamePlayer.questLog.isQuestActive(this.id) &&
               interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'chop-first-tree') &&
               !interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'talk-to-merchant');
      },
      LearnToSellQuest
    )
  ];

  public static setupForPlayer(gamePlayer: GamePlayer): () => void {
    // Use the optimized tree chopping setup
    const chopListener = (payload: BaseChoppableTreeEntityPlayerEventPayloads[BaseChoppableTreeEntityPlayerEvent.CHOPPED]) => {
      if (gamePlayer.questLog.isQuestActive(this.id)) {
        console.log('OptimizedFirstChopQuest: Tree chopped, updating objective');
        gamePlayer.questLog.adjustObjectiveProgress(this.id, 'chop-first-tree', 1);
      }
    };

    console.log('OptimizedFirstChopQuest: Setting up CHOPPED event listener for', gamePlayer.player.id);
    gamePlayer.eventRouter.on(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);

    return () => {
      console.log('OptimizedFirstChopQuest: Cleaning up CHOPPED event listener');
      gamePlayer.eventRouter.off(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);
    };
  }
}
