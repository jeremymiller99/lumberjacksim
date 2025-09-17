import {
  BlockColliderOptions,
  Collider,
  ColliderShape,
  CollisionGroup,
  Entity,
  ErrorHandler,
  ModelEntityOptions,
  RigidBodyType,
  Vector3Like
} from 'hytopia';

import type GameRegion from '../GameRegion';
import GamePlayerEntity from '../GamePlayerEntity';

export type PortalEntityOptions = {
  delayS?: number;
  destinationRegion: GameRegion;
  destinationRegionFacingAngle?: number;
  destinationRegionPosition: Vector3Like;
  type?: 'normal' | 'boss';
} & ModelEntityOptions;

export default class PortalEntity extends Entity {
  public readonly delayS: number;
  public readonly destinationRegion: GameRegion;
  public readonly destinationRegionFacingAngle: number;
  public readonly destinationRegionPosition: Vector3Like;
  private readonly _playerTimeouts = new Map<GamePlayerEntity, NodeJS.Timeout>();

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
  }

  private _teleportPlayer(player: GamePlayerEntity): void {
    if (player.isDead) {
      return;
    }

    player.joinRegion(this.destinationRegion, this.destinationRegionFacingAngle, this.destinationRegionPosition);

    this._playerTimeouts.delete(player);
  }
}
