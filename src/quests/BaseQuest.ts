import { SkillId } from '../config';
import BaseEntity from '../entities/BaseEntity';
import type { BaseEntityDialogueOption } from '../entities/BaseEntity';
import type GamePlayer from '../GamePlayer';
import type GamePlayerEntity from '../GamePlayerEntity';
import type { ItemClass } from '../items/BaseItem';

export type QuestState = 'active' | 'completed';

export type QuestReward = {
  items?: { itemClass: ItemClass; quantity: number }[];
  skillExperience?: { skillId: SkillId; amount: number }[];
  currency?: number;
}

export type QuestObjective = {
  id: string;
  name: string;
  description: string;
  target: number;
}

export type QuestNpcDialogueInteraction = {
  npcClass: typeof BaseEntity;
  dialogueOption: BaseEntityDialogueOption;
  enabledForInteractor: (interactor: GamePlayerEntity) => boolean;
}

// Player's progress on a specific quest - simplified to just track progress
export type PlayerQuestState = {
  questId: string;
  state: QuestState;
  objectiveProgress: { [objectiveId: string]: number };
  completionCleanup?: () => void;
}

// Static quest definition class
export default abstract class BaseQuest {
  public static readonly id: string;
  public static readonly name: string;
  public static readonly description: string;
  public static readonly objectives: QuestObjective[] = [];
  public static readonly reward: QuestReward;
  public static readonly dialogueInteractions: QuestNpcDialogueInteraction[] = [];

  public static availableForPlayer(player: GamePlayer): boolean {
    return true; // Override in subclasses for requirements
  }

  public static setupForPlayer(gamePlayer: GamePlayer): () => void {
    // Override in subclasses to set up event listeners, etc
    // Returns a cleanup function that will be called when the quest is completed
    return () => {};
  }

  public static rewardCompletionForPlayer(gamePlayer: GamePlayer): boolean {
    if (!gamePlayer.questLog.isQuestActive(this.id)) {
      return false;
    }

    if (this.reward.items) {
      const requiredInventorySlots = this.reward.items.length;
      const availableSlots = gamePlayer.hotbar.totalEmptySlots + gamePlayer.backpack.totalEmptySlots;

      if (availableSlots < requiredInventorySlots) {
        gamePlayer.showNotification('Your inventory is too full to accept the quest rewards. Please clear some space and try again.', 'warning');
        return false;
      }

      for (const itemReward of this.reward.items) {
        gamePlayer.addHeldItem(itemReward.itemClass, itemReward.quantity);
      }
    }

    if (this.reward.skillExperience) {
      for (const expReward of this.reward.skillExperience) {
        gamePlayer.adjustSkillExperience(expReward.skillId, expReward.amount);
      }
    }

    if (this.reward.currency) {
      gamePlayer.adjustGold(this.reward.currency);
    }

    return true;
  }
}
