import {
  Audio,
  Collider,
  ColliderShape,
  CollisionGroup,
  BlockType,
  Entity,
  ErrorHandler,
  Player,
  PlayerEvent,
  World,
  WorldManager,
  WorldOptions,
  Vector3Like,
  Quaternion,
  RgbColor,
} from 'hytopia';

import GamePlayer from './GamePlayer';
import GamePlayerEntity from './GamePlayerEntity';

const DEFAULT_MAX_AMBIENT_LIGHT_INTENSITY = 1.5;
const DEFAULT_MAX_DIRECTIONAL_LIGHT_INTENSITY = 3.25;
const DEFAULT_MIN_AMBIENT_LIGHT_INTENSITY = 0.5;
const DEFAULT_MIN_DIRECTIONAL_LIGHT_INTENSITY = 0.4;

export enum GameRegionPlayerEvent {
  REACHED = 'GameRegion.REACHED',
}

export type GameRegionPlayerEventPayloads = {
  [GameRegionPlayerEvent.REACHED]: { regionId: string };
}

export type GameRegionRespawnOverride = {
  regionId: string,
  facingAngle: number,
  spawnPoint: Vector3Like,
}

export type GameRegionOptions = {
  id: string,
  ambientAudioUri?: string,
  ambientAudioVolume?: number,
  maxAmbientLightIntensity?: number,
  maxDirectionalLightIntensity?: number,
  minAmbientLightIntensity?: number,
  minDirectionalLightIntensity?: number,
  respawnOverride?: GameRegionRespawnOverride,
  spawnFacingAngle?: number,
  spawnPoint?: Vector3Like,
} & Omit<WorldOptions, 'id'>;

export default class GameRegion {
  private _id: string;
  private _ambientAudio: Audio | undefined;
  private _baseFogColor: RgbColor | undefined;
  private _isSetup: boolean = false;
  private _maxAmbientLightIntensity: number;
  private _maxDirectionalLightIntensity: number;
  private _minAmbientLightIntensity: number;
  private _minDirectionalLightIntensity: number;
  private _playerCount: number = 0;
  private _respawnOverride: GameRegionRespawnOverride | undefined;
  private _spawnFacingAngle: number;
  private _spawnPoint: Vector3Like;

  private readonly _world: World;

  public constructor(options: GameRegionOptions) {
    const { id, ...regionOptions } = options;

    this._id = id;
    this._ambientAudio = regionOptions.ambientAudioUri ? new Audio({
      uri: regionOptions.ambientAudioUri,
      volume: regionOptions.ambientAudioVolume ?? 0.05,
      loop: true,
    }) : undefined;

    this._baseFogColor = regionOptions.fogColor;
    this._maxAmbientLightIntensity = regionOptions.maxAmbientLightIntensity ?? DEFAULT_MAX_AMBIENT_LIGHT_INTENSITY;
    this._maxDirectionalLightIntensity = regionOptions.maxDirectionalLightIntensity ?? DEFAULT_MAX_DIRECTIONAL_LIGHT_INTENSITY;
    this._minAmbientLightIntensity = regionOptions.minAmbientLightIntensity ?? DEFAULT_MIN_AMBIENT_LIGHT_INTENSITY;
    this._minDirectionalLightIntensity = regionOptions.minDirectionalLightIntensity ?? DEFAULT_MIN_DIRECTIONAL_LIGHT_INTENSITY;
    this._respawnOverride = regionOptions.respawnOverride;
    this._spawnFacingAngle = regionOptions.spawnFacingAngle ?? 0;
    this._spawnPoint = regionOptions.spawnPoint ?? { x: 0, y: 10, z: 0 };
    
    this._world = WorldManager.instance.createWorld(regionOptions);
    this._world.stop(); // Keep it in stopped state, when a player joins the world, we'll start it.
    this._world.on(PlayerEvent.JOINED_WORLD, ({ player }) => this.onPlayerJoin(player));
    this._world.on(PlayerEvent.LEFT_WORLD, ({ player }) => this.onPlayerLeave(player));
    this._world.on(PlayerEvent.RECONNECTED_WORLD, ({ player }) => this.onPlayerReconnected(player));
    
    // temp
    // this._world.simulation.enableDebugRendering(true);
    // this._world.simulation.enableDebugRaycasting(true);

    this.setup();
  }

  public get id(): string { return this._id; }
  public get baseFogColor(): RgbColor | undefined { return this._baseFogColor; }
  public get maxAmbientLightIntensity(): number { return this._maxAmbientLightIntensity; }
  public get maxDirectionalLightIntensity(): number { return this._maxDirectionalLightIntensity; }
  public get minAmbientLightIntensity(): number { return this._minAmbientLightIntensity; }
  public get minDirectionalLightIntensity(): number { return this._minDirectionalLightIntensity; }
  public get name(): string { return this._world.name; }
  public get respawnOverride(): GameRegionRespawnOverride | undefined { return this._respawnOverride; }
  public get spawnFacingAngle(): number { return this._spawnFacingAngle; }
  public get spawnPoint(): Vector3Like { return this._spawnPoint; }
  public get world(): World { return this._world; }

  protected setup(): void { // intended to be overridden by subclasses
    if (this._isSetup) {
      return ErrorHandler.warning(`GameRegion.setup(): ${this.name} already setup.`);
    }

    if (this._ambientAudio) {
      this._ambientAudio.play(this._world);
    }

    new Collider({ // Out of world collider
      shape: ColliderShape.BLOCK,
      collisionGroups: {
        belongsTo: [ CollisionGroup.ALL ],
        collidesWith: [ CollisionGroup.ENTITY, CollisionGroup.PLAYER ],
      },
      halfExtents: { x: 500, y : 32, z: 500 },
      isSensor: true,
      relativePosition: { x: 0, y: -64, z: 0 },
      onCollision: this.onEntityOutOfWorld,
      simulation: this._world.simulation, // setting this auto adds collider to simulation upon instantiation.
    });

    this._isSetup = true;
  }

  protected onEntityOutOfWorld(other: BlockType | Entity, started: boolean) {
    if (!started) return;

    if (other instanceof GamePlayerEntity) {
      other.setPosition(other.gamePlayer.respawnPoint); // move them to respawn point
      return other.takeDamage(other.maxHealth); // kill player
    }

    if (other instanceof Entity) {
      return other.despawn();
    }
  }

  protected onPlayerJoin(player: Player) {
    const gamePlayer = GamePlayer.getOrCreate(player);
    
    // Set the current region for the player
    gamePlayer.setCurrentRegion(this);
    
    // Get the region spawn point if set by a portal or something else, otherwise use the default region spawn point.
    const spawnPoint = gamePlayer.currentRegionSpawnPoint ?? this._spawnPoint;
    const spawnFacingAngle = gamePlayer.currentRegionSpawnFacingAngle ?? this._spawnFacingAngle;
    const gamePlayerEntity = new GamePlayerEntity(gamePlayer);

    gamePlayerEntity.spawn(this._world, spawnPoint, Quaternion.fromEuler(0, spawnFacingAngle, 0));
    
    // Make the camera look at the correct spawn facing angle.
    // Calculate look direction based on facing angle (identity direction is -z, consistent with threejs)
    const facingAngleRad = spawnFacingAngle * Math.PI / 180;  
    player.camera.lookAtPosition({
      x: spawnPoint.x - Math.sin(facingAngleRad),
      y: spawnPoint.y,
      z: spawnPoint.z - Math.cos(facingAngleRad),
    });

    // Emit the reached event to the player's event router.
    gamePlayer.eventRouter.emit(GameRegionPlayerEvent.REACHED, { regionId: this._id });

    this._playerCount++;

    // Only run the region physics & ticking if a player is in the region.
    if (this._playerCount === 1) {
      this._world.start();
    }
  }

  protected onPlayerLeave(player: Player) {
    // We assume the player left the game on region leave, we do all cleanup here.
    // If they didn't, there's no downside and their player object will be reinitialized 
    // when they rejoin this or another rejoin before their connection times out.
    // If this causes issues in the future, we should move .remove to the actualy
    // Player closed connection event.
    const gamePlayer = GamePlayer.getOrCreate(player);
    gamePlayer.save(); // Final save before player leaves
    GamePlayer.remove(player);

    this._playerCount--;

    // Stop the region physics & ticking if no players are in the region.
    if (this._playerCount <= 0) {
      this._world.stop();
    }
  }

  // The RECONNECTED_WORLD even is only emitted by the engine when the player disconnects and
  // reconnects to the game with a known connectionId before the close connection timeout finishes
  // which gives them 5 second window to reconnect after disconnecting. This event will fire such
  // as if a player unintentionally refreshes the page, if their browser crashes but restarts quickly
  // with the same connectionId in the URL, etc.
  // The HYTOPIA SDK handles resynchronization of all persisted state back to the player client such as
  // their entity, scene ui states, etc, but anything that uses ephemeral state (Such as UI) we need
  // to handle reloading for them manually here.
  protected onPlayerReconnected(player: Player) { 
    const gamePlayer = GamePlayer.getOrCreate(player);
    gamePlayer.onPlayerReconnected();
  }
}
