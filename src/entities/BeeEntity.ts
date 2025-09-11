import {
  Entity,
  EntityOptions,
  RigidBodyType,
  Vector3Like,
  World,
} from 'hytopia';

export type BeeEntityOptions = {
  swarmCenter?: Vector3Like;
  swarmRadius?: number;
  flySpeed?: number;
  despawnAfterMs?: number;
} & EntityOptions;

export default class BeeEntity extends Entity {
  private _swarmCenter: Vector3Like;
  private _swarmRadius: number;
  private _despawnTimeout: NodeJS.Timeout | null = null;
  private _movementInterval: NodeJS.Timeout | null = null;
  private _currentAngle: number = Math.random() * Math.PI * 2;
  private _verticalOffset: number = Math.random() * 2 - 1; // Random height variation
  private _speed: number = 0.02;

  public constructor(options: BeeEntityOptions = {}) {
    super({
      name: 'Bee',
      modelUri: 'models/environment/Farm/bee-adult.gltf',
      modelScale: 0.5,
      modelLoopedAnimations: ['fly'], // Assume the bee model has a fly animation
      // Use default rigid body settings for smooth physics-based movement
      ...options,
    });

    this._swarmCenter = options.swarmCenter || { x: 0, y: 1, z: 0 };
    this._swarmRadius = options.swarmRadius || 3;
    this._speed = (options.flySpeed || 2) * 0.01; // Convert flySpeed to angular velocity

    // Auto-despawn after specified time (default 10 seconds)
    const despawnTime = options.despawnAfterMs || 10000;
    this._despawnTimeout = setTimeout(() => {
      this.despawn();
    }, despawnTime);
  }

  public override spawn(world: World, position: Vector3Like): void {
    super.spawn(world, position);
    this._startSwarmingBehavior();
  }

  public override despawn(): void {
    this._cleanupTimeouts();
    super.despawn();
  }

  private _startSwarmingBehavior(): void {
    this._updateMovement();
  }

  private _updateMovement(): void {
    if (!this.world) return;

    // Smooth circular movement with variable height
    this._currentAngle += this._speed;
    
    // Add some randomness to the radius for more natural movement
    const radiusVariation = Math.sin(this._currentAngle * 3) * 0.5;
    const distance = this._swarmRadius + radiusVariation;
    
    // Calculate new position with smooth height variation
    const x = this._swarmCenter.x + Math.cos(this._currentAngle) * distance;
    const y = this._swarmCenter.y + this._verticalOffset + Math.sin(this._currentAngle * 2) * 0.3;
    const z = this._swarmCenter.z + Math.sin(this._currentAngle) * distance;

    // Use smooth movement instead of direct position setting
    this.setLinearVelocity({
      x: (x - this.position.x) * 5, // Smooth interpolation
      y: (y - this.position.y) * 5,
      z: (z - this.position.z) * 5
    });

    // Continue movement at 60 FPS for smooth animation
    this._movementInterval = setTimeout(() => {
      this._updateMovement();
    }, 16); // ~60 FPS
  }

  private _cleanupTimeouts(): void {
    if (this._despawnTimeout) {
      clearTimeout(this._despawnTimeout);
      this._despawnTimeout = null;
    }
    if (this._movementInterval) {
      clearTimeout(this._movementInterval);
      this._movementInterval = null;
    }
  }

  public updateSwarmCenter(newCenter: Vector3Like): void {
    this._swarmCenter = newCenter;
  }
}
