import {
  BlockColliderOptions,
  Collider,
  ColliderShape,
  CollisionGroup,
  Entity,
  ErrorHandler,
  ModelEntityOptions,
  QuaternionLike,
  RigidBodyType,
  SceneUI,
  Vector3Like,
  World,
} from 'hytopia';

import type GameRegion from '../GameRegion';
import GamePlayerEntity from '../GamePlayerEntity';
import Levels from '../systems/Levels';

export type PortalEntityOptions = {
  delayS?: number;
  destinationRegion: GameRegion;
  destinationRegionFacingAngle?: number;
  destinationRegionPosition: Vector3Like;
  type?: 'normal' | 'boss' | 'invisible';
  label?: string;
  requiredLevel?: number;
} & ModelEntityOptions;

export default class PortalEntity extends Entity {
  public readonly delayS: number;
  public readonly destinationRegion: GameRegion;
  public readonly destinationRegionFacingAngle: number;
  public readonly destinationRegionPosition: Vector3Like;
  public readonly requiredLevel: number;
  private readonly _playerTimeouts = new Map<GamePlayerEntity, NodeJS.Timeout>();
  private _labelSceneUI: SceneUI | undefined;
  private _baseLabel: string;
  private _isInvisible: boolean = false;

  public constructor(options: PortalEntityOptions) {
    const isInvisible = options.type === 'invisible';
    const invisibleZOffset = isInvisible ? 0.5 : 0;
    const modelUri = options.modelUri ?? 'models/misc/selection-indicator.gltf';
    const modelScale = options.modelScale ?? (isInvisible ? 0.0001 : 2);
    // Compute collider as a 1x1 square footprint for invisible portals (with 2m height), otherwise from model
    let colliderShape = ColliderShape.BLOCK;
    let colliderHalfExtents = { x: 0.5, y: 1, z: 0.5 };
    if (!isInvisible) {
      const derived = Collider.optionsFromModelUri(modelUri, modelScale, ColliderShape.BLOCK) as BlockColliderOptions;
      derived.halfExtents!.x = Math.max(derived.halfExtents!.x, 0.5);
      derived.halfExtents!.y = Math.max(derived.halfExtents!.y, 1);
      derived.halfExtents!.z = Math.max(derived.halfExtents!.z, 0.5);
      colliderShape = derived.shape;
      colliderHalfExtents = derived.halfExtents!;
    }

    super({
      modelScale,
      modelUri,
      modelLoopedAnimations: [ 'idle' ],
      rigidBodyOptions: {
        type: RigidBodyType.FIXED,
        colliders: [
          {
            shape: colliderShape,
            halfExtents: colliderHalfExtents,
            collisionGroups: {
              belongsTo: [ CollisionGroup.ALL ],
              collidesWith: [ CollisionGroup.PLAYER ],
            },
            isSensor: true,
            relativePosition: { x: 0, y: 0, z: invisibleZOffset },
            onCollision: (other, started) => {
              if (!(other instanceof GamePlayerEntity)) return;

              if (started) {
                if (this.delayS > 0) {
                  other.showNotification(`This is a delayed portal! You'll be teleported in ${this.delayS} seconds. You must stay in the portal area.`, 'warning');
                  const timeout = setTimeout(() => this._teleportPlayer(other), this.delayS * 1000);
                  this._playerTimeouts.set(other, timeout);
                } else {
                  this._teleportPlayer(other);
                }
              } else {
                const timeout = this._playerTimeouts.get(other);

                if (timeout) {
                  clearTimeout(timeout);
                  this._playerTimeouts.delete(other);
                  other.showNotification('You exited the delayed portal. Please re-enter the portal again to be teleported.', 'warning');
                }
              }
            },
          },
        ],
      },
      tintColor: options.type === 'boss' ? { r: 255, g: 255, b: 0 } : undefined,
      ...options,
    });

    this._isInvisible = isInvisible;
    this.delayS = options.delayS ?? 0;
    this.destinationRegion = options.destinationRegion;
    this.destinationRegionFacingAngle = options.destinationRegionFacingAngle ?? 0;
    this.destinationRegionPosition = options.destinationRegionPosition;
    this.requiredLevel = options.requiredLevel ?? 1;
    this._baseLabel = options.label || this.destinationRegion.name;

    // Setup floating text label if provided
    if (options.label) {
      this._setupLabelUI(options.label);
    }
  }

  public override spawn(world: World, position: Vector3Like, rotation?: QuaternionLike): void {
    super.spawn(world, position, rotation);
    
    // Load the label UI after spawning
    if (this._labelSceneUI && this.world) {
      this._labelSceneUI.load(this.world);
    }
  }

  private _setupLabelUI(text: string): void {
    const yOffset = this._isInvisible ? 1.2 : (this.height / 2 + 1.5);
    const zOffset = this._isInvisible ? -0.05 : 0;
    this._labelSceneUI = new SceneUI({
      attachedToEntity: this,
      offset: { x: 0, y: yOffset, z: zOffset },
      templateId: 'portal-text',
      viewDistance: 15,
      state: {
        text: text,
      },
    });
  }

  public updateLabelForPlayer(player: GamePlayerEntity): void {
    if (!this._labelSceneUI) return;
    
    const playerLevel = Levels.getLevelFromExperience(player.globalExperience);
    let labelText = this._baseLabel;
    
    if (playerLevel < this.requiredLevel) {
      labelText += ` [LOCKED - Need Level ${this.requiredLevel}]`;
    } else {
      labelText += ` [UNLOCKED]`;
    }
    
    this._labelSceneUI.setState({
      text: labelText,
    });
  }

  private _teleportPlayer(player: GamePlayerEntity): void {
    if (player.isDead) {
      return;
    }

    // Check level requirement
    const playerLevel = Levels.getLevelFromExperience(player.globalExperience);
    if (playerLevel < this.requiredLevel) {
      player.showNotification(`You need to be level ${this.requiredLevel} to access ${this.destinationRegion.name}. You are currently level ${playerLevel}.`, 'error');
      this._playerTimeouts.delete(player);
      return;
    }

    player.joinRegion(this.destinationRegion, this.destinationRegionFacingAngle, this.destinationRegionPosition);

    this._playerTimeouts.delete(player);
  }
}
