import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type BurntTreeMediumEntityOptions = {} & ChoppableTreeEntityOptions;

export default class BurntTreeMediumEntity extends ChoppableTreeEntity {
  public constructor(options?: BurntTreeMediumEntityOptions) {
    super({
      treeType: 'burnt',
      maturity: 'mature',
      modelUri: 'models/environment/burnt-tree-medium.gltf',
      modelScale: 1.05,
      name: 'Burnt Tree',
      ...options,
    });
  }
}


