import { SkillId } from '../../config';
import type GamePlayer from '../../GamePlayer';
import type GamePlayerEntity from '../../GamePlayerEntity';
import OptimizedBaseQuest from '../OptimizedBaseQuest';
import { BaseChoppableTreeEntityPlayerEvent } from '../../entities/forageables/ChoppableTreeEntity';
import type { BaseChoppableTreeEntityPlayerEventPayloads } from '../../entities/forageables/ChoppableTreeEntity';

import LumberMerchantEntity from '../../regions/forest1/npcs/LumberMerchantEntity';
import LearnToSellQuest from './LearnToSellQuest';

export default class FirstChopQuest extends OptimizedBaseQuest {
  static readonly id = 'first-chop';
  static readonly displayName = 'Your First Tree';
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
    // Optimized completion dialogue using helper method
    OptimizedBaseQuest.createCompletionDialogue(
      LumberMerchantEntity,
      `I just chopped down my first tree! What now?`,
      `Perfect attitude! The lumber business is simple: chop trees, collect wood, sell it for gold, and upgrade your tools to chop bigger trees. You've already mastered step one - now let's work on the rest!`,
      this.id,
      'talk-to-merchant',
      (interactor: GamePlayerEntity) => {
        return interactor.gamePlayer.questLog.isQuestActive(this.id) &&
               interactor.gamePlayer.questLog.isQuestObjectiveCompleted(this.id, 'chop-first-tree');
      },
      LearnToSellQuest
    )
  ];

  public static availableForPlayer(gamePlayer: GamePlayer): boolean {
    // This quest should auto-start for new players
    return true;
  }

  public static setupForPlayer(gamePlayer: GamePlayer): () => void {
    // Performance optimization: Direct event handling for better performance
    const chopListener = (payload: BaseChoppableTreeEntityPlayerEventPayloads[BaseChoppableTreeEntityPlayerEvent.CHOPPED]) => {
      if (!gamePlayer.questLog.isQuestActive(this.id)) return;
      
      console.log('FirstChopQuest: Tree chopped, updating objective progress');
      gamePlayer.questLog.adjustObjectiveProgress(this.id, 'chop-first-tree', 1);
    };

    console.log('FirstChopQuest: Setting up CHOPPED event listener for', gamePlayer.player.id);
    gamePlayer.eventRouter.on(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);

    return () => {
      console.log('FirstChopQuest: Cleaning up CHOPPED event listener');
      gamePlayer.eventRouter.off(BaseChoppableTreeEntityPlayerEvent.CHOPPED, chopListener);
    };
  }
}
