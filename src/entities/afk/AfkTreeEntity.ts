import { Collider, ColliderShape, Entity, ModelEntityOptions, Quaternion, Vector3Like, World } from 'hytopia';
import type GamePlayerEntity from '../../GamePlayerEntity';
import AfkChestEntity from './AfkChestEntity';
import type { ItemClass } from '../../items/BaseItem';

export type AfkTreeEntityOptions = {
  modelUri: string;
  growthDurationMs?: number; // total time to reach full scale
  minScale?: number;
  maxScale?: number;
  yieldItemClass: ItemClass;
  yieldMin?: number;
  yieldMax?: number;
  linkedChest?: AfkChestEntity; // optional chest to deposit into
} & ModelEntityOptions;

export default class AfkTreeEntity extends Entity {
  private _growthDurationMs: number;
  private _minScale: number;
  private _maxScale: number;
  private _spawnedAtMs: number = performance.now();
  private _yieldItemClass: ItemClass;
  private _yieldMin: number;
  private _yieldMax: number;
  private _linkedChest: AfkChestEntity | undefined;
  private _lastTickMs: number = performance.now();
  // For offline catch-up (exposed as readonly getters)
  public get growthDurationMs(): number { return this._growthDurationMs; }
  public get minScale(): number { return this._minScale; }
  public get maxScale(): number { return this._maxScale; }
  public get yieldItem(): ItemClass { return this._yieldItemClass; }
  public get yieldMin(): number { return this._yieldMin; }
  public get yieldMax(): number { return this._yieldMax; }

  public constructor(options: AfkTreeEntityOptions) {
    const modelUri = options.modelUri;
    const minScale = options.minScale ?? 0.1;
    const maxScale = options.maxScale ?? 0.3;
    const growthDurationMs = options.growthDurationMs ?? 60000; // default 60s

    // Collider from model; not interactable, just decorative/growing
    super({
      ...options,
      modelUri,
      modelScale: minScale,
      rigidBodyOptions: {
        type: 'fixed' as any,
        colliders: [
          Collider.optionsFromModelUri(modelUri, minScale, ColliderShape.BLOCK)
        ],
      },
      name: options.name ?? 'Sapling',
    });

    this._growthDurationMs = growthDurationMs;
    this._minScale = minScale;
    this._maxScale = maxScale;
    this._yieldItemClass = options.yieldItemClass;
    this._yieldMin = Math.max(1, Math.floor(options.yieldMin ?? 3));
    this._yieldMax = Math.max(this._yieldMin, Math.floor(options.yieldMax ?? 5));
    this._linkedChest = options.linkedChest;
  }

  public linkChest(chest: AfkChestEntity): void {
    this._linkedChest = chest;
  }

  public override spawn(world: World, position: Vector3Like, rotation?: Quaternion): void {
    super.spawn(world, position, rotation);
    this._spawnedAtMs = performance.now();
    this._lastTickMs = this._spawnedAtMs;
    // Begin update loop via world's simulation tick callback if available
    this._scheduleTick();
  }

  private _scheduleTick(): void {
    // Fallback simple timer; region clocks are every 5s but we want smooth lerp
    setTimeout(() => this._onTick(), 100);
  }

  private _onTick(): void {
    if (!this.world) return; // despawned
    const now = performance.now();
    const t = Math.min(1, (now - this._spawnedAtMs) / this._growthDurationMs);
    const scale = this._minScale + (this._maxScale - this._minScale) * t;
    try { this.setModelScale(scale); } catch {}

    if (t >= 1) {
      this._harvest();
      // Reset for next growth cycle
      this._spawnedAtMs = now;
      this._lastTickMs = now;
      try { this.setModelScale(this._minScale); } catch {}
    }

    this._lastTickMs = now;
    this._scheduleTick();
  }

  private _harvest(): void {
    // Deterministic harvest: use configured min as quantity (min==max in our setup)
    const qty = this._yieldMin;
    if (this._linkedChest) {
      this._linkedChest.add(qty);
    }
  }

  // Trees are not interactable in AFK mode
  public interact(_: GamePlayerEntity): void {
    // no-op
  }
}


