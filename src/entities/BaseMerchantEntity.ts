import BaseEntity, { BaseEntityOptions } from './BaseEntity';
import { ItemUIDataHelper } from '../items/ItemUIDataHelper';
import { SkillId } from '../config';
import type { ItemClass } from '../items/BaseItem';
import type { BaseEntityDialogueOption } from './BaseEntity';
import type GamePlayerEntity from '../GamePlayerEntity';
import type ItemInventory from '../systems/ItemInventory';

export type BaseMerchantEntityOptions = {
  additionalDialogueOptions?: BaseEntityDialogueOption[];
  buyableItemClasses: ItemClass[];
  dialogueAvatarImageUri: string;
  dialogueTitle: string;
} & BaseEntityOptions;

export default class BaseMerchantEntity extends BaseEntity {
  public readonly buyableItemClasses: ItemClass[];

  public constructor(options: BaseMerchantEntityOptions) {
    super({
      ...options,
      dialogue: {
        avatarImageUri: options.dialogueAvatarImageUri,
        title: options.dialogueTitle,
        dialogue: {
          text: 'Welcome! How can I help you today?',
          options: [
            {
              text: `Buy items.`,
              onSelect: (interactor: GamePlayerEntity) => this.openBuyMenu(interactor),
              dismiss: true,
            },
            {
              text: `Sell items.`,
              onSelect: (interactor: GamePlayerEntity) => this.openSellMenu(interactor),
              dismiss: true,
            },
            ...(options.additionalDialogueOptions ?? []),
            {
              text: `I don't need anything.`,
              dismiss: true,
              pureExit: true,
            },
          ],
        }
      }
    });

    this.buyableItemClasses = options.buyableItemClasses;
  }

  public buyItem(interactor: GamePlayerEntity, buyableItemIndex: number, quantity: number): void {
    const itemClass = this.buyableItemClasses[buyableItemIndex];

    if (!itemClass?.buyPrice || quantity <= 0) {
      return; // TODO: Show error message - invalid item or quantity
    }

    const totalGoldCost = itemClass.buyPrice * quantity;
    const totalEmptySlots = interactor.gamePlayer.hotbar.totalEmptySlots + interactor.gamePlayer.backpack.totalEmptySlots;
    const slotsNeeded = itemClass.stackable ? 1 : quantity;

    if (totalEmptySlots < slotsNeeded) {
      return interactor.showNotification('Not enough inventory space.', 'error');
    }

    if (!interactor.adjustGold(-totalGoldCost)) {
      return interactor.showNotification('Not enough gold.', 'error');
    }

    // Create and add items based on stackability
    if (itemClass.stackable) {
      const boughtItem = itemClass.create({ quantity });
      interactor.gamePlayer.hotbar.addItem(boughtItem) || interactor.gamePlayer.backpack.addItem(boughtItem);
    } else {
      for (let i = 0; i < quantity; i++) {
        const boughtItem = itemClass.create();
        interactor.gamePlayer.hotbar.addItem(boughtItem) || interactor.gamePlayer.backpack.addItem(boughtItem);
      }
    }

    this._awardBarteringSkillExperience(interactor, totalGoldCost, true);
    interactor.showNotification(`Bought ${quantity} ${itemClass.name} for ${totalGoldCost.toLocaleString()} gold.`, 'success');
  }

  public openBuyMenu(interactor: GamePlayerEntity): void {
    interactor.setCurrentMerchantEntity(this);
    interactor.player.ui.sendData({
      type: 'toggleMerchant',
      mode: 'buy',
      merchantName: this.name,
      merchantTitle: this.dialogueRoot?.title,
      merchantAvatarUri: this.dialogueRoot?.avatarImageUri,
      buyableItems: this.buyableItemClasses.map((itemClass, index) => {
        return ItemUIDataHelper.getUIData(itemClass, {
          position: index,
          buyPrice: itemClass.buyPrice,
        });
      }),
    })
  }

  public openSellMenu(interactor: GamePlayerEntity): void {
    interactor.setCurrentMerchantEntity(this);
    interactor.player.ui.sendData({
      type: 'toggleMerchant',
      mode: 'sell',
      merchantName: this.name,
      merchantTitle: this.dialogueRoot?.title,
      merchantAvatarUri: this.dialogueRoot?.avatarImageUri,
    });
  }

  public sellItem(interactor: GamePlayerEntity, itemInventory: ItemInventory, itemIndex: number, quantity: number): void {
    const item = itemInventory.getItemAt(itemIndex);
   
    if (!item || quantity <= 0 || quantity > item.quantity) {
      return interactor.showNotification('Invalid item or quantity.', 'error');
    }

    if (item.sellPrice === 0) {
      return interactor.showNotification('Item is not sellable.', 'error');
    }

    const totalGoldEarned = item.sellPrice * quantity;
    const isSellingAll = quantity === item.quantity;

    if (isSellingAll) {
      // Remove item first to free slot, then add gold (guaranteed to work)
      itemInventory.removeItem(itemIndex);
      interactor.adjustGold(totalGoldEarned);
    } else {
      // For partial sales, try gold first (must stack with existing), then adjust quantity
      if (!interactor.adjustGold(totalGoldEarned)) {
        return interactor.showNotification('Your inventory seems full. You cannot receive any gold.', 'error');
      }

      itemInventory.adjustItemQuantity(itemIndex, -quantity);
    }

    this._awardBarteringSkillExperience(interactor, totalGoldEarned, false);
    interactor.showNotification(`Sold ${quantity} ${item.name} for ${totalGoldEarned.toLocaleString()} gold.`, 'success');
  }

  private _awardBarteringSkillExperience(interactor: GamePlayerEntity, transactionGoldAmount: number, isBuying: boolean): void {
    const baseExperience = Math.max(5, Math.sqrt(transactionGoldAmount) * 2);
    // Trading now awards lumber experience since this is a lumber-focused game
    interactor.adjustSkillExperience(SkillId.LUMBER, Math.floor(isBuying ? baseExperience : baseExperience * 0.7));
  }
}
