import { SkillId } from '../config';
import BaseEntity from '../entities/BaseEntity';
import type { BaseEntityDialogueOption } from '../entities/BaseEntity';
import type GamePlayer from '../GamePlayer';
import type GamePlayerEntity from '../GamePlayerEntity';
import type { ItemClass } from '../items/BaseItem';
import BaseQuest from './BaseQuest';
import type { QuestReward, QuestObjective, QuestNpcDialogueInteraction } from './BaseQuest';

/**
 * Performance-optimized base quest class that provides common functionality
 * and reduces code duplication across quest implementations.
 */
export default abstract class OptimizedBaseQuest extends BaseQuest {
  
  /**
   * Creates a standardized dialogue interaction for item transactions
   */
  protected static createItemTransactionDialogue(
    npcClass: typeof BaseEntity,
    text: string,
    responseText: string,
    transaction: {
      removeItems?: { itemClass: ItemClass; quantity: number }[];
      addItems?: { itemClass: ItemClass; quantity: number }[];
      addCurrency?: number;
    },
    questId: string,
    objectiveId: string,
    enabledCondition: (interactor: GamePlayerEntity) => boolean,
    successCallback?: (interactor: GamePlayerEntity) => void
  ): QuestNpcDialogueInteraction {
    return {
      npcClass,
      dialogueOption: {
        text,
        nextDialogue: {
          text: responseText,
          options: [
            {
              text: 'Understood.',
              dismiss: true,
              pureExit: true,
            }
          ]
        },
        onSelect: (interactor: GamePlayerEntity) => {
          let success = true;
          
          // Handle item removal
          if (transaction.removeItems) {
            for (const { itemClass, quantity } of transaction.removeItems) {
              if (!interactor.gamePlayer.removeHeldItem(itemClass, quantity)) {
                interactor.showNotification(`Not enough items!`, 'error');
                success = false;
                break;
              }
            }
          }
          
          // Handle item addition if removal was successful
          if (success && transaction.addItems) {
            for (const { itemClass, quantity } of transaction.addItems) {
              if (!interactor.gamePlayer.addHeldItem(itemClass, quantity)) {
                // Rollback removals if addition fails
                if (transaction.removeItems) {
                  for (const { itemClass: rollbackClass, quantity: rollbackQuantity } of transaction.removeItems) {
                    interactor.gamePlayer.addHeldItem(rollbackClass, rollbackQuantity);
                  }
                }
                interactor.showNotification('Inventory full!', 'error');
                success = false;
                break;
              }
            }
          }
          
          // Handle currency addition if previous operations were successful
          if (success && transaction.addCurrency) {
            interactor.gamePlayer.adjustGold(transaction.addCurrency);
          }
          
          if (success) {
            interactor.gamePlayer.questLog.adjustObjectiveProgress(questId, objectiveId, 1);
            successCallback?.(interactor);
          }
        }
      },
      enabledForInteractor: enabledCondition
    };
  }

  /**
   * Creates a standardized dialogue interaction for quest completion
   */
  protected static createCompletionDialogue(
    npcClass: typeof BaseEntity,
    text: string,
    responseText: string,
    questId: string,
    objectiveId: string,
    enabledCondition: (interactor: GamePlayerEntity) => boolean,
    nextQuestClass?: typeof BaseQuest
  ): QuestNpcDialogueInteraction {
    return {
      npcClass,
      dialogueOption: {
        text,
        nextDialogue: {
          text: responseText,
          options: [
            {
              text: 'Thank you!',
              dismiss: true,
              pureExit: true,
            }
          ]
        },
        onSelect: (interactor: GamePlayerEntity) => {
          interactor.gamePlayer.questLog.adjustObjectiveProgress(questId, objectiveId, 1);
          interactor.gamePlayer.questLog.completeQuest(questId);
          
          if (nextQuestClass) {
            interactor.gamePlayer.questLog.startQuest(nextQuestClass);
          }
        }
      },
      enabledForInteractor: enabledCondition
    };
  }

  /**
   * Creates a standardized event listener setup for tree chopping quests
   */
  protected static createTreeChoppingSetup(
    questId: string,
    objectiveId: string,
    progressPerChop: number = 1,
    itemRequirement?: ItemClass
  ): (gamePlayer: GamePlayer) => () => void {
    return (gamePlayer: GamePlayer): () => void => {
      const chopListener = () => {
        if (!gamePlayer.questLog.isQuestActive(questId)) return;
        
        if (itemRequirement && !gamePlayer.hasHeldItem(itemRequirement, 1)) {
          return;
        }
        
        gamePlayer.questLog.adjustObjectiveProgress(questId, objectiveId, progressPerChop);
      };

      console.log(`${questId}: Setting up tree chopping listener`);
      // Use string event name to avoid import issues
      gamePlayer.eventRouter.on('tree-chopped', chopListener);

      return () => {
        console.log(`${questId}: Cleaning up tree chopping listener`);
        gamePlayer.eventRouter.off('tree-chopped', chopListener);
      };
    };
  }

  /**
   * Creates a standardized event listener setup for inventory-based objectives
   */
  protected static createInventoryTrackingSetup(
    questId: string,
    objectives: Array<{
      objectiveId: string;
      itemClass: ItemClass;
      targetQuantity: number;
    }>
  ): (gamePlayer: GamePlayer) => () => void {
    return (gamePlayer: GamePlayer): () => void => {
      const inventoryListener = () => {
        if (!gamePlayer.questLog.isQuestActive(questId)) return;
        
        for (const { objectiveId, itemClass, targetQuantity } of objectives) {
          const currentQuantity = gamePlayer.getHeldItemQuantity(itemClass);
          if (currentQuantity >= targetQuantity) {
            gamePlayer.questLog.adjustObjectiveProgress(questId, objectiveId, targetQuantity);
          }
        }
      };

      console.log(`${questId}: Setting up inventory tracking listeners`);
      
      // Use event-driven approach if available, otherwise fall back to polling
      if (gamePlayer.eventRouter.listenerCount('inventoryChanged') !== undefined) {
        gamePlayer.eventRouter.on('inventoryChanged', inventoryListener);
        
        return () => {
          console.log(`${questId}: Cleaning up inventory tracking listeners`);
          gamePlayer.eventRouter.off('inventoryChanged', inventoryListener);
        };
      } else {
        // Fallback polling with reduced frequency
        const interval = setInterval(inventoryListener, 3000) as any;
        
        return () => {
          console.log(`${questId}: Cleaning up inventory tracking interval`);
          clearInterval(interval);
        };
      }
    };
  }

  /**
   * Utility method to check if player has required items for a quest objective
   */
  protected static hasRequiredItems(
    gamePlayer: GamePlayer, 
    requirements: { itemClass: ItemClass; quantity: number }[]
  ): boolean {
    return requirements.every(({ itemClass, quantity }) => 
      gamePlayer.hasHeldItem(itemClass, quantity)
    );
  }

  /**
   * Utility method to create standard quest objectives
   */
  protected static createObjective(
    id: string,
    name: string,
    description: string,
    target: number = 1
  ): QuestObjective {
    return { id, name, description, target };
  }

  /**
   * Utility method to create standard quest rewards
   */
  protected static createReward(
    items?: { itemClass: ItemClass; quantity: number }[],
    skillExperience?: { skillId: SkillId; amount: number }[],
    currency?: number
  ): QuestReward {
    return { items, skillExperience, currency };
  }
}
