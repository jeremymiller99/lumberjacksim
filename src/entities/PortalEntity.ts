import {
  BlockColliderOptions,
  Collider,
  ColliderShape,
  CollisionGroup,
  Entity,
  ErrorHandler,
  ModelEntityOptions,
  RigidBodyType,
  SceneUI,
  Vector3Like
} from 'hytopia';

import type GameRegion from '../GameRegion';
import GamePlayerEntity from '../GamePlayerEntity';
import Levels from '../systems/Levels';

export type PortalEntityOptions = {
  delayS?: number;
  destinationRegion: GameRegion;
  destinationRegionFacingAngle?: number;
  destinationRegionPosition: Vector3Like;
  type?: 'normal' | 'boss';
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

  public constructor(options: PortalEntityOptions) {
    const modelUri = options.modelUri ?? 'models/misc/selection-indicator.gltf';
    const colliderOptions = Collider.optionsFromModelUri(modelUri, options.modelScale ?? 1, ColliderShape.BLOCK) as BlockColliderOptions;
    colliderOptions.halfExtents!.x = Math.max(colliderOptions.halfExtents!.x, 0.5);

    super({
      modelScale: options.modelScale ?? 2,
      modelUri,
      modelLoopedAnimations: [ 'idle' ],
      rigidBodyOptions: {
        type: RigidBodyType.FIXED,
        colliders: [
          {
            ...colliderOptions,
            collisionGroups: {
              belongsTo: [ CollisionGroup.ALL ],
              collidesWith: [ CollisionGroup.PLAYER ],
            },
            isSensor: true,
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

  public override spawn(...args: any[]): void {
    super.spawn(...args);
    
    // Load the label UI after spawning
    if (this._labelSceneUI && this.world) {
      this._labelSceneUI.load(this.world);
    }
  }

  private _setupLabelUI(text: string): void {
    this._labelSceneUI = new SceneUI({
      attachedToEntity: this,
      offset: { x: 0, y: this.height / 2 + 1.5, z: 0 },
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
