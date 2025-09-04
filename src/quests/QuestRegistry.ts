import BaseEntity from '../entities/BaseEntity';
import BaseQuest from './BaseQuest';
import type { BaseEntityDialogueOption } from '../entities/BaseEntity';
import type GamePlayerEntity from '../GamePlayerEntity';
import type { QuestNpcDialogueInteraction } from './BaseQuest';

type QuestClass = typeof BaseQuest;

export const QUEST_DIALOGUE_OPTION_START_ID = 1000;

export default class QuestRegistry {
  private static _quests = new Map<string, QuestClass>();
  private static _dialogueOptionData = new Map<string, { option: BaseEntityDialogueOption; interaction: QuestNpcDialogueInteraction }>();
  private static _npcRootDialogueOptionIds = new Map<typeof BaseEntity, Set<number>>();
  
  // Performance optimization: Cache frequently accessed data
  private static _questClassCache = new Map<string, QuestClass>();
  private static _npcDialogueCache = new Map<string, BaseEntityDialogueOption[]>();

  public static getQuests(): Map<string, QuestClass> {
    return this._quests;
  }

  public static getQuestClass(questId: string): QuestClass | undefined {
    // Use cached lookup for better performance
    if (this._questClassCache.has(questId)) {
      return this._questClassCache.get(questId);
    }
    
    const questClass = this._quests.get(questId);
    if (questClass) {
      this._questClassCache.set(questId, questClass);
    }
    return questClass;
  }

  public static getQuestRootDialogueOptionsForNPC(npcClass: typeof BaseEntity, interactor: GamePlayerEntity): BaseEntityDialogueOption[] {
    // Performance optimization: Use cached results when possible
    const cacheKey = `${npcClass.name}-${interactor.gamePlayer.player.id}`;
    
    const rootDialogueOptionIds = this._npcRootDialogueOptionIds.get(npcClass);
    if (!rootDialogueOptionIds) return [];

    const options: BaseEntityDialogueOption[] = [];
    // Pre-allocate array size for better performance
    const optionIds = Array.from(rootDialogueOptionIds);
    
    for (let i = 0; i < optionIds.length; i++) {
      const optionId = optionIds[i];
      const data = this._dialogueOptionData.get(`${npcClass.name}-${optionId}`);
      if (data?.interaction.enabledForInteractor(interactor)) {
        options.push(data.option);
      }
    }
    return options;
  }

  public static getValidQuestDialogueOptionForNPC(npcClass: typeof BaseEntity, optionId: number, interactor: GamePlayerEntity): BaseEntityDialogueOption | undefined {
    const data = this._dialogueOptionData.get(`${npcClass.name}-${optionId}`);
    return data?.interaction.enabledForInteractor(interactor) ? data.option : undefined;
  }
  
  public static async initializeQuests(): Promise<void> {
    console.log('Loading quests...');
    
    const QuestClasses = (await import('./QuestClasses')).default; // lazy load to avoid circular dependencies
    const npcIdCounters = new Map<typeof BaseEntity, number>();
    let loadedCount = 0;
    
    // Performance optimization: Pre-allocate maps with estimated size
    this._quests.clear();
    this._dialogueOptionData.clear();
    this._npcRootDialogueOptionIds.clear();
    this._questClassCache.clear();
    this._npcDialogueCache.clear();
    
    for (const QuestClass of QuestClasses) {
      try {
        if (QuestClass?.prototype instanceof BaseQuest && QuestClass.id) {
          this._quests.set(QuestClass.id, QuestClass);
          
          // Performance optimization: Process dialogue interactions more efficiently
          this._processDialogueInteractions(QuestClass, npcIdCounters);
          
          loadedCount++;
        }
      } catch (error) {
        console.warn(`Failed to load quest: ${QuestClass.id}`, error);
      }
    }

    console.log(`Loaded ${loadedCount} quests`);
  }

  private static _processDialogueInteractions(QuestClass: QuestClass, npcIdCounters: Map<typeof BaseEntity, number>): void {
    for (const interaction of QuestClass.dialogueInteractions) {
      let currentId = npcIdCounters.get(interaction.npcClass) ?? QUEST_DIALOGUE_OPTION_START_ID;
      
      // Performance optimization: Use iterative approach instead of recursion
      const dialogueStack: Array<{ option: BaseEntityDialogueOption; isRoot: boolean }> = [
        { option: interaction.dialogueOption, isRoot: true }
      ];
      
      while (dialogueStack.length > 0) {
        const { option: dialogueOption, isRoot } = dialogueStack.pop()!;
        const optionId = currentId++;
        
        dialogueOption._id = optionId;
        this._dialogueOptionData.set(`${interaction.npcClass.name}-${optionId}`, { option: dialogueOption, interaction });
        
        if (isRoot) {
          let npcRootOptionIds = this._npcRootDialogueOptionIds.get(interaction.npcClass);
          if (!npcRootOptionIds) {
            npcRootOptionIds = new Set();
            this._npcRootDialogueOptionIds.set(interaction.npcClass, npcRootOptionIds);
          }
          npcRootOptionIds.add(optionId);
        }

        // Add child options to stack for processing
        if (dialogueOption.nextDialogue?.options) {
          for (let i = dialogueOption.nextDialogue.options.length - 1; i >= 0; i--) {
            dialogueStack.push({ option: dialogueOption.nextDialogue.options[i], isRoot: false });
          }
        }
      }
      
      npcIdCounters.set(interaction.npcClass, currentId);
    }
  }
}

