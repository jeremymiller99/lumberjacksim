import { Player, PlayerManager, World } from 'hytopia';
import GameClock from './GameClock';
import GamePlayer from './GamePlayer';
import ItemRegistry from './items/ItemRegistry';
import type GameRegion from './GameRegion';

// Only lumber-related region
import OakForestRegion from './regions/oakForest/OakForestRegion';
import CursedForestRegion from './regions/cursedForest/CursedForestRegion';
import SandyForestRegion from './regions/sandyForest/SandyForestRegion';
import SnowForestRegion from './regions/snowForest/SnowForestRegion';
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
    
    // Only load the 4 essential items: 3 axes + wood
    const RawLogItem = (await import('./items/materials/RawLogItem')).default;
    const RustyAxeItem = (await import('./items/axes/RustyAxeItem')).default;
    const IronAxeItem = (await import('./items/axes/IronAxeItem')).default;
    const GoldAxeItem = (await import('./items/axes/GoldAxeItem')).default;

    const essentialItems = [
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

    const oakForestRegion = new OakForestRegion();
    this._regions.set(oakForestRegion.id, oakForestRegion);
    GameClock.instance.addRegionClockCycle(oakForestRegion);

    const cursedForestRegion = new CursedForestRegion();
    this._regions.set(cursedForestRegion.id, cursedForestRegion);
    GameClock.instance.addRegionClockCycle(cursedForestRegion);

    const sandyForestRegion = new SandyForestRegion();
    this._regions.set(sandyForestRegion.id, sandyForestRegion);
    GameClock.instance.addRegionClockCycle(sandyForestRegion);

    const snowForestRegion = new SnowForestRegion();
    this._regions.set(snowForestRegion.id, snowForestRegion);
    GameClock.instance.addRegionClockCycle(snowForestRegion);

    // Spawn portals in Hub to each region at specified coordinates with level requirements
    hubRegion.spawnPortalTo(oakForestRegion, { x: 13, y: 1, z: -5 }, 0, 'normal', 'Oak Forest (Level 1+)', 1); // Level 1+ (0+ effectively)
    hubRegion.spawnPortalTo(snowForestRegion, { x: -6, y: 1, z: -8 }, 0, 'normal', 'Snow Forest (Level 5+)', 5); // Level 5+
    hubRegion.spawnPortalTo(sandyForestRegion, { x: -8, y: 1, z: 18 }, 0, 'normal', 'Sandy Forest (Level 10+)', 10); // Level 10+
    hubRegion.spawnPortalTo(cursedForestRegion, { x: 15, y: 1, z: 17 }, 0, 'normal', 'Cursed Forest (Level 15+)', 15); // Level 15+

    this._startRegion = hubRegion;

    console.log('GameManager: Loaded Hub, OakForest, CursedForest, SandyForest, and SnowForest regions');
  }

  private _selectWorldForPlayer = async (player: Player): Promise<World | undefined> => {
    GamePlayer.getOrCreate(player);
    // Always start players in the configured start region (hub)
    return this._startRegion.world;
  }
}
