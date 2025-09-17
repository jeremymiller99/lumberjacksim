import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type BurntTreeSmallEntityOptions = {} & ChoppableTreeEntityOptions;

export default class BurntTreeSmallEntity extends ChoppableTreeEntity {
  public constructor(options?: BurntTreeSmallEntityOptions) {
    super({
      treeType: 'burnt',
      maturity: 'young',
      modelUri: 'models/environment/burnt-tree-small.gltf',
      modelScale: 0.95,
      name: 'Young Burnt Tree',
      ...options,
    });
  }
}


