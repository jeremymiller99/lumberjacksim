import BaseEntity, { BaseEntityOptions } from '../BaseEntity';
import { Collider, ColliderShape, CollisionGroup, ModelEntityOptions, SceneUI, Vector3Like } from 'hytopia';
import type { ItemClass } from '../../items/BaseItem';
import type GamePlayerEntity from '../../GamePlayerEntity';

export type AfkChestEntityOptions = {
  itemClass: ItemClass; // The single item this chest holds
  labelOffset?: Vector3Like;
  capacity?: number; // Max items stored in chest
} & ModelEntityOptions & Omit<BaseEntityOptions, 'interactActionText'>;

export default class AfkChestEntity extends BaseEntity {
  public readonly itemClass: ItemClass;
  private _quantity: number = 0;
  private _capacity: number;
  private _labelSceneUI: SceneUI | undefined;

  public constructor(options: AfkChestEntityOptions) {
    const modelUri = options.modelUri ?? 'models/environment/chest-blocky-wood.gltf';
    const modelScale = options.modelScale ?? 1;

    super({
      ...options,
      modelUri,
      modelScale,
      interactActionText: 'Press "E" to collect',
      rigidBodyOptions: {
        type: 'fixed' as any,
        colliders: [
          // Derive collider from model to make it interactable via raycast
          Collider.optionsFromModelUri(modelUri, modelScale, ColliderShape.BLOCK)
        ],
      },
      name: options.name ?? 'Supply Chest',
    });

    this.itemClass = options.itemClass;
    this._capacity = options.capacity ?? 100;

    this._labelSceneUI = new SceneUI({
      attachedToEntity: this,
      offset: options.labelOffset ?? { x: 0, y: 1.2, z: 0 },
      templateId: 'portal-text',
      viewDistance: 12,
      state: { text: this._buildLabelText() },
    });
  }

  public get quantity(): number { return this._quantity; }

  public add(quantity: number): void {
    if (quantity <= 0) return;
    this._quantity = Math.min(this._capacity, this._quantity + quantity);
    this._syncLabel();
  }

  public setQuantity(quantity: number): void {
    this._quantity = Math.max(0, Math.min(this._capacity, Math.floor(quantity)));
    this._syncLabel();
  }

  public get capacity(): number { return this._capacity; }

  public takeAll(interactor: GamePlayerEntity): void {
    if (this._quantity <= 0) {
      interactor.showNotification('Chest is empty.', 'warning');
      return;
    }

    const success = interactor.gamePlayer.addHeldItem(this.itemClass, this._quantity);
    if (!success) {
      interactor.showNotification('Not enough inventory space.', 'error');
      return;
    }

    interactor.showNotification(`Collected ${this._quantity} ${this.itemClass.name}.`, 'success');
    this._quantity = 0;
    this._syncLabel();
  }

  public override spawn(world: any, position: any, rotation?: any): void {
    super.spawn(world, position, rotation);
    if (this._labelSceneUI) this._labelSceneUI.load(this.world!);
  }

  public override despawn(): void {
    try { this._labelSceneUI?.unload(); } catch {}
    super.despawn();
  }

  public override interact(interactor: GamePlayerEntity): void {
    this.takeAll(interactor);
  }

  private _buildLabelText(): string {
    return `${this.itemClass.displayName}: ${this._quantity}`;
  }

  private _syncLabel(): void {
    if (!this._labelSceneUI) return;
    this._labelSceneUI.setState({ text: this._buildLabelText() });
  }
}


