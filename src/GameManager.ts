import { Player, PlayerManager, World } from 'hytopia';
import GameClock from './GameClock';
import GamePlayer from './GamePlayer';
import ItemRegistry from './items/ItemRegistry';
import type GameRegion from './GameRegion';

// Only lumber-related region
import Forest1Region from './regions/forest1/Forest1Region';
import HubRegion from './regions/Hub/HubRegion';

export default class GameManager {
  public static readonly instance = new GameManager();

  private _regions: Map<string, GameRegion> = new Map();
  private _startRegion: GameRegion;

  public constructor() {
    PlayerManager.instance.worldSelectionHandler = this._selectWorldForPlayer;
  }

  public get startRegion(): GameRegion { return this._startRegion; }

  public getRegion(id: string): GameRegion | undefined {
    return this._regions.get(id);
  }

  public async loadItems(): Promise<void> {
    console.log('Loading minimal lumber items...');
    await this.loadLumberItems();
  }

  public async loadQuests(): Promise<void> {
    console.log('Loading tutorial quests for lumber game...');
    const QuestRegistry = (await import('./quests/QuestRegistry')).default;
    await QuestRegistry.initializeQuests();
  }

  private async loadLumberItems(): Promise<void> {
    const ItemRegistry = (await import('./items/ItemRegistry')).default;
    
    // Only load the 5 essential items: 3 axes + wood + gold
    const GoldItem = (await import('./items/general/GoldItem')).default;
    const RawLogItem = (await import('./items/materials/RawLogItem')).default;
    const RustyAxeItem = (await import('./items/axes/RustyAxeItem')).default;
    const IronAxeItem = (await import('./items/axes/IronAxeItem')).default;
    const GoldAxeItem = (await import('./items/axes/GoldAxeItem')).default;

    const essentialItems = [
      GoldItem,
      RawLogItem,
      RustyAxeItem,
      GoldAxeItem,
      IronAxeItem
    ];

    let loadedCount = 0;
    for (const ItemClass of essentialItems) {
      try {
        ItemRegistry.registerItem(ItemClass);
        loadedCount++;
      } catch (error) {
        console.warn(`Failed to load item: ${ItemClass.id}`, error);
      }
    }

    console.log(`Loaded ${loadedCount} lumber items`);
  }

  public loadRegions(): void {
    const hubRegion = new HubRegion();
    this._regions.set(hubRegion.id, hubRegion);
    GameClock.instance.addRegionClockCycle(hubRegion);

    const forest1Region = new Forest1Region();
    this._regions.set(forest1Region.id, forest1Region);
    GameClock.instance.addRegionClockCycle(forest1Region);

    // Spawn a portal in hub that leads to forest 1
    hubRegion.spawnPortalTo(forest1Region, { x: 2, y: 2, z: -4 });

    this._startRegion = hubRegion;

    console.log('GameManager: Loaded Hub region (start) and Forest1 region');
  }

  private _selectWorldForPlayer = async (player: Player): Promise<World | undefined> => {
    GamePlayer.getOrCreate(player);
    // Always start players in the configured start region (hub)
    return this._startRegion.world;
  }
}
