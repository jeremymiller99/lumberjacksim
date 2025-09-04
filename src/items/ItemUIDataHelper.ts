import BaseItem, { ItemRarity } from './BaseItem';
import BaseLumberToolItem from './BaseLumberToolItem';

export type ItemUIData = {
  name: string;
  description: string;
  iconImageUri: string;
  buyPrice?: number;
  sellPrice?: number;
  quantity?: number;
  position?: number;
  rarity?: ItemRarity;
  statsHeader?: string;
  statTexts?: string[];
  type?: string; // UI update type
  // Lumber tool specific
  choppingSpeedBonus?: number;
  woodYieldBonus?: number;
}

export type ItemUIDataOverrides = {
  position?: number;
  buyPrice?: number;
  sellPrice?: number;
  quantity?: number;
  type?: string;
}

export class ItemUIDataHelper {
  static getUIData(itemInstanceOrClass: BaseItem | typeof BaseItem, overrides?: ItemUIDataOverrides): ItemUIData {
    const uiData: ItemUIData = {
      name: itemInstanceOrClass.name,
      description: itemInstanceOrClass.description,
      iconImageUri: itemInstanceOrClass.iconImageUri,
      rarity: itemInstanceOrClass.rarity,
      ...overrides,
    };

    // Add lumber tool-specific properties if item is a lumber tool
    if (BaseLumberToolItem.isLumberToolItem(itemInstanceOrClass)) {
      if (itemInstanceOrClass.choppingSpeedBonus > 0) {
        uiData.choppingSpeedBonus = itemInstanceOrClass.choppingSpeedBonus;
      }
      if (itemInstanceOrClass.woodYieldBonus > 0) {
        uiData.woodYieldBonus = itemInstanceOrClass.woodYieldBonus;
      }
    }

    if (itemInstanceOrClass.statsHeader) {
      uiData.statsHeader = itemInstanceOrClass.statsHeader;
    }

    if (itemInstanceOrClass.statTexts.length > 0) {
      uiData.statTexts = itemInstanceOrClass.statTexts;
    }

    return uiData;
  }
} 
