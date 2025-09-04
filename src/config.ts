/**
 * Skills System
 */

export type Skill = {
  id: SkillId;
  name: string;
  description: string;
  iconAssetUri: string;
}

export enum SkillId {
  LUMBER = 'lumber',
}

export const skills: Skill[] = [
  {
    id: SkillId.LUMBER,
    name: 'Lumber',
    description: 'Chop down trees and process wood to gain XP.<br/><br/>Increases chopping speed, wood yield, and unlocks advanced lumber processing.',
    iconAssetUri: 'icons/skills/lumber.png'
  }
]
