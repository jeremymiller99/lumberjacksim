import { ColliderShape, CollisionGroup, Entity, ModelEntityOptions, RigidBodyType, SceneUI, Vector3Like } from 'hytopia';

type BarrierEntityOptions = {
  halfExtents?: { x: number, y: number, z: number };
} & ModelEntityOptions;

export default class BarrierEntity extends Entity {
  private _labelSceneUI: SceneUI | undefined;

  public constructor(options: BarrierEntityOptions = {}) {
    super({
      modelUri: options.modelUri ?? 'models/misc/selection-indicator.gltf',
      modelScale: options.modelScale ?? 0.0001, // effectively invisible
      rigidBodyOptions: {
        type: RigidBodyType.FIXED,
        colliders: [
          {
            shape: ColliderShape.BLOCK,
            halfExtents: options.halfExtents ?? { x: 0.5, y: 0.5, z: 0.5 },
            collisionGroups: {
              belongsTo: [ CollisionGroup.ALL ],
              collidesWith: [ CollisionGroup.PLAYER, CollisionGroup.ENTITY ],
            },
            isSensor: false,
          },
        ],
      },
      ...options,
    });
  }

  public markAsLevelGate(labelText?: string, labelOffset?: Vector3Like): void {
    this._labelSceneUI = new SceneUI({
      attachedToEntity: this,
      offset: labelOffset ?? { x: 0, y: 1.2, z: 0 },
      templateId: 'portal-text',
      viewDistance: 12,
      state: { text: labelText ?? 'Buy level 2 upgrade to access this area' },
    });
  }

  public override spawn(world: any, position: any, rotation?: any): void {
    super.spawn(world, position, rotation);
    if (this._labelSceneUI && this.world) {
      this._labelSceneUI.load(this.world);
    }
  }

}


