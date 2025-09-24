import { ColliderShape, CollisionGroup, Entity, ModelEntityOptions, RigidBodyType, SceneUI, Vector3Like, World } from 'hytopia';
import GamePlayerEntity from '../GamePlayerEntity';

export type BarrierGroupConfig = {
  positions: Vector3Like[];
  label?: string;
  labelOffset?: Vector3Like;
};

export default class BarrierGroup extends Entity {
  private _labelSceneUI: SceneUI | undefined;
  private _positions: Vector3Like[];

  public constructor(config: BarrierGroupConfig, options: ModelEntityOptions = {}) {
    const colliders = config.positions.map(pos => ({
      shape: ColliderShape.BLOCK,
      halfExtents: { x: 0.5, y: 0.5, z: 0.5 },
      collisionGroups: {
        belongsTo: [ CollisionGroup.ALL ],
        collidesWith: [ CollisionGroup.PLAYER, CollisionGroup.ENTITY ],
      },
      isSensor: false,
      relativePosition: { x: pos.x, y: pos.y, z: pos.z },
      onCollision: (other: any, started: boolean) => this._onCollision(other, started),
    }));

    super({
      modelUri: options.modelUri ?? 'models/misc/selection-indicator.gltf',
      modelScale: options.modelScale ?? 0.0001,
      rigidBodyOptions: {
        type: RigidBodyType.FIXED,
        colliders,
      },
      ...options,
    });

    this._positions = config.positions;

    if (config.label) {
      this._labelSceneUI = new SceneUI({
        attachedToEntity: this,
        offset: config.labelOffset ?? { x: 0, y: 1.2, z: 0 },
        templateId: 'portal-text',
        viewDistance: 15,
        state: { text: config.label },
      });
    }
  }

  public override spawn(world: World, position: Vector3Like, rotation?: any): void {
    super.spawn(world, position, rotation);
    if (this._labelSceneUI) this._labelSceneUI.load(world);
  }

  private _onCollision(other: any, started: boolean): void {
    // Intentionally no pop-up; label nearby conveys the info
    return;
  }
}


