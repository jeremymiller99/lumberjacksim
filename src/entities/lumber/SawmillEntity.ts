import BaseCraftingEntity, { BaseCraftingEntityOptions, CraftingRecipe } from '../BaseCraftingEntity';
import { SkillId } from '../../config';
import RawLogItem from '../../items/materials/RawLogItem';

export type SawmillEntityOptions = {
  tier?: 'basic';
} & Omit<BaseCraftingEntityOptions, 'craftingRecipes' | 'dialogueAvatarImageUri' | 'dialogueTitle'>;

export default class SawmillEntity extends BaseCraftingEntity {
  public constructor(options?: SawmillEntityOptions) {
    const recipes: CraftingRecipe[] = [
      // Simple recipe: 2 Raw Logs -> 1 Raw Log + some gold value
      // This is just for show - the real value is selling raw logs directly
    ];
    
    super({
      ...options,
      craftingRecipes: recipes,
      dialogueAvatarImageUri: 'avatars/merchant.png',
      dialogueTitle: 'Basic Sawmill',
      modelUri: 'models/environment/Dungeon/wooden-table.gltf',
      modelScale: 1.2,
      name: 'Basic Sawmill',
      interactActionText: 'Press "E" to use sawmill',
      additionalDialogueOptions: [
        {
          text: `What can this sawmill do?`,
          nextDialogue: {
            text: `This sawmill is mostly decorative. You're better off selling your raw logs directly to merchants for gold!`,
            options: [
              {
                text: `Thanks for the tip!`,
                dismiss: true,
                pureExit: true,
              },
            ]
          }
        },
      ],
    });
  }

  protected override _awardCraftingSkillExperience(interactor: any, craftedItemClass: any): void {
    const experience = 2;
    interactor.gamePlayer.adjustSkillExperience(SkillId.LUMBER, experience);
  }
}
