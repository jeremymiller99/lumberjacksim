import QuestRegistry from '../quests/QuestRegistry';
import type BaseQuest from '../quests/BaseQuest';
import type GamePlayer from '../GamePlayer';
import type BaseEntity from '../entities/BaseEntity';
import type { PlayerQuestState } from '../quests/BaseQuest';
import { ItemUIDataHelper } from '../items/ItemUIDataHelper';

export type SerializedQuestLogData = {
  quests: PlayerQuestState[];
};

export default class QuestLog {
  private _entityAlertClasses = new Set<typeof BaseEntity>();
  private _owner: GamePlayer;
  private _questStates = new Map<string, PlayerQuestState>();
  
  // Performance optimization: Cache frequently accessed data
  private _questClassCache = new Map<string, typeof BaseQuest>();
  private _objectiveCache = new Map<string, { [objectiveId: string]: any }>();
  
  // Performance optimization: Throttle UI updates
  private _uiUpdateQueue = new Set<string>();
  private _uiUpdateTimeout: number | null = null;

  public constructor(owner: GamePlayer) {
    this._owner = owner;
  }

  public get owner(): GamePlayer { return this._owner; }
  
  public get activeQuests(): PlayerQuestState[] { 
    return Array.from(this._questStates.values()).filter(quest => quest.state === 'active');
  }

  public adjustObjectiveProgress(questId: string, objectiveId: string, adjustAmount: number): boolean {
    console.log(`QuestLog: Adjusting objective progress for ${questId}.${objectiveId} by ${adjustAmount}`);
    
    const questState = this._questStates.get(questId);
    if (!questState || questState.state !== 'active') {
      console.log(`QuestLog: Quest ${questId} not found or not active`);
      return false;
    }

    // Performance optimization: Use cached quest class lookup
    const questClass = this._getCachedQuestClass(questId);
    if (!questClass) {
      console.log(`QuestLog: Quest class ${questId} not found`);
      return false;
    }

    // Performance optimization: Use cached objective lookup
    const objective = this._getCachedObjective(questId, objectiveId, questClass);
    if (!objective) {
      console.log(`QuestLog: Objective ${objectiveId} not found in quest ${questId}`);
      return false;
    }

    const currentProgress = questState.objectiveProgress[objectiveId] || 0;
    if (currentProgress >= objective.target) {
      console.log(`QuestLog: Objective ${objectiveId} already completed`);
      return false; // Already completed
    }

    questState.objectiveProgress[objectiveId] = currentProgress + adjustAmount;
    console.log(`QuestLog: Updated ${questId}.${objectiveId} progress to ${questState.objectiveProgress[objectiveId]}/${objective.target}`);

    if (questState.objectiveProgress[objectiveId] >= objective.target) {
      console.log(`QuestLog: Objective ${objective.name} completed!`);
      this._owner.showNotification(`Completed objective: ${objective.name}.`, 'complete');
    }

    // Performance optimization: Batch UI updates
    this._queueUIUpdate(questId);
    this.updateEntityAlerts();

    this._owner.save();

    return true;
  }

  public startQuest(questClass: typeof BaseQuest): boolean {
    if (!questClass.id || this._questStates.has(questClass.id)) {
      return false;
    }

    const questState: PlayerQuestState = {
      questId: questClass.id,
      state: 'active',
      objectiveProgress: Object.fromEntries(questClass.objectives.map(obj => [obj.id, 0])),
      completionCleanup: questClass.setupForPlayer(this._owner),
    };

    this._questStates.set(questClass.id, questState);


    this.syncUIUpdate(questClass.id);
    this._owner.showNotification(`Started quest: ${questClass.name}. See quests for more details.`, 'new');

    this._owner.save();

    this.updateEntityAlerts();

    return true;
  }

  public updateEntityAlerts(): void {
    if (!this._owner.currentEntity) return;

    const shouldShowEntityClasses = new Set<typeof BaseEntity>();

    // Performance optimization: Only check active quests for entity alerts
    const activeQuestIds = Array.from(this._questStates.keys()).filter(questId => 
      this._questStates.get(questId)?.state === 'active'
    );

    for (const questId of activeQuestIds) {
      const questClass = this._getCachedQuestClass(questId);
      if (!questClass) continue;

      for (const dialogueInteraction of questClass.dialogueInteractions) {
        if (dialogueInteraction.enabledForInteractor(this._owner.currentEntity)) {
          shouldShowEntityClasses.add(dialogueInteraction.npcClass);
        }
      }
    }

    // Add new alerts
    for (const entityClass of shouldShowEntityClasses) {
      if (!this._entityAlertClasses.has(entityClass)) {
        this._owner.addEntityAlert(entityClass);
        this._entityAlertClasses.add(entityClass);
      }
    }

    // Remove alerts that are no longer needed
    for (const entityClass of this._entityAlertClasses) {
      if (!shouldShowEntityClasses.has(entityClass)) {
        this._owner.removeEntityAlert(entityClass);
        this._entityAlertClasses.delete(entityClass);
      }
    }
  }

  public completeQuest(questId: string): boolean {
    const questClass = QuestRegistry.getQuestClass(questId);
    const questState = this._questStates.get(questId);

    if (!questClass || !questState || questState.state !== 'active' || !questClass.rewardCompletionForPlayer(this._owner)) {
      return false;
    }

    questState.state = 'completed';
    questState.completionCleanup?.();
    
    // Performance optimization: Clear completed quest from caches to free memory
    this._clearQuestFromCache(questId);
    
    this.syncUIUpdate(questId);
    this._owner.showNotification(`Completed quest: ${questClass.name}.`, 'success');

    this.updateEntityAlerts();

    return true;
  }

  public getQuestState(questId: string): PlayerQuestState | undefined {
    return this._questStates.get(questId);
  }

  public hasQuest(questId: string): boolean {
    return this._questStates.has(questId);
  }

  public isQuestActive(questId: string): boolean {
    return this._questStates.get(questId)?.state === 'active';
  }

  public isQuestCompleted(questId: string): boolean {
    return this._questStates.get(questId)?.state === 'completed';
  }

  public isQuestObjectiveCompleted(questId: string, objectiveId: string): boolean {
    const questState = this._questStates.get(questId);
    if (!questState || questState.state !== 'active') return false;

    // Performance optimization: Use cached lookups
    const questClass = this._getCachedQuestClass(questId);
    if (!questClass) return false;

    const objective = this._getCachedObjective(questId, objectiveId, questClass);
    if (!objective) return false;

    return (questState.objectiveProgress[objectiveId] || 0) >= objective.target;
  }

  public serialize(): SerializedQuestLogData {
    const quests = Array.from(this._questStates.values());
    return { quests };
  }

  public syncUI(): void {
    for (const [ questId ] of this._questStates) {
      this.syncUIUpdate(questId);
    }
  }

  public syncUIUpdate(questId: string): void {
    const questClass = this._getCachedQuestClass(questId);
    const questState = this._questStates.get(questId);

    if (!questClass || !questState) return;

    this._owner.player.ui.sendData({
      type: 'questUpdate',
      id: questId,
      name: questClass.name,
      description: questClass.description,
      objectives: questClass.objectives,
      reward: {
        items: questClass.reward.items?.map(item => ItemUIDataHelper.getUIData(item.itemClass, { quantity: item.quantity })),
        skillExperience: questClass.reward.skillExperience,
      },
      state: questState
    });
  }

  // Performance optimization: Cache management methods
  private _getCachedQuestClass(questId: string): typeof BaseQuest | undefined {
    if (this._questClassCache.has(questId)) {
      return this._questClassCache.get(questId);
    }
    
    const questClass = QuestRegistry.getQuestClass(questId);
    if (questClass) {
      this._questClassCache.set(questId, questClass);
    }
    return questClass;
  }

  private _getCachedObjective(questId: string, objectiveId: string, questClass: typeof BaseQuest): any {
    const cacheKey = `${questId}-${objectiveId}`;
    if (this._objectiveCache.has(cacheKey)) {
      return this._objectiveCache.get(cacheKey);
    }
    
    const objective = questClass.objectives.find(o => o.id === objectiveId);
    if (objective) {
      this._objectiveCache.set(cacheKey, objective);
    }
    return objective;
  }

  // Performance optimization: Batched UI updates
  private _queueUIUpdate(questId: string): void {
    this._uiUpdateQueue.add(questId);
    
    if (this._uiUpdateTimeout) {
      clearTimeout(this._uiUpdateTimeout);
    }
    
    this._uiUpdateTimeout = setTimeout(() => {
      for (const queuedQuestId of this._uiUpdateQueue) {
        this.syncUIUpdate(queuedQuestId);
      }
      this._uiUpdateQueue.clear();
      this._uiUpdateTimeout = null;
    }, 50) as any; // Batch updates over 50ms window
  }

  // Performance optimization: Memory management
  private _clearQuestFromCache(questId: string): void {
    this._questClassCache.delete(questId);
    
    // Clear objective cache entries for this quest
    const keysToDelete: string[] = [];
    for (const cacheKey of this._objectiveCache.keys()) {
      if (cacheKey.startsWith(`${questId}-`)) {
        keysToDelete.push(cacheKey);
      }
    }
    keysToDelete.forEach(key => this._objectiveCache.delete(key));
  }

  // Performance optimization: Periodic cache cleanup to prevent memory leaks
  private _performCacheCleanup(): void {
    const activeQuestIds = new Set(
      Array.from(this._questStates.keys()).filter(questId => 
        this._questStates.get(questId)?.state === 'active'
      )
    );

    // Clean quest class cache
    for (const questId of this._questClassCache.keys()) {
      if (!activeQuestIds.has(questId)) {
        this._questClassCache.delete(questId);
      }
    }

    // Clean objective cache
    for (const cacheKey of this._objectiveCache.keys()) {
      const questId = cacheKey.split('-')[0];
      if (!activeQuestIds.has(questId)) {
        this._objectiveCache.delete(cacheKey);
      }
    }

    console.log(`QuestLog: Cache cleanup completed. Active quests: ${activeQuestIds.size}`);
  }

  // Performance optimization: Initialize periodic cleanup
  public startPeriodicCleanup(): void {
    // Clean cache every 5 minutes to prevent memory leaks
    setInterval(() => this._performCacheCleanup(), 300000) as any;
  }

  public loadFromSerializedData(serializedQuestLogData: SerializedQuestLogData): boolean {
    try {
      const { quests } = serializedQuestLogData;
      
      // Clear existing quest states and alert classes
      this._entityAlertClasses.clear();
      this._questStates.clear();
      
      // Load quests
      for (const questState of quests) {
        const questClass = QuestRegistry.getQuestClass(questState.questId);
        
        if (!questState.questId || !questState.state || !questClass) continue;
        if (questState.state !== 'active' && questState.state !== 'completed') continue;
        
        // Load quest state
        this._questStates.set(questState.questId, {
          questId: questState.questId,
          state: questState.state,
          objectiveProgress: questState.objectiveProgress || {},
          completionCleanup: questClass.setupForPlayer(this._owner),
        });
      }

      return true;
    } catch {
      return false;
    }
  }
}
