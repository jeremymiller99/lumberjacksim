import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type BurntTreeBigEntityOptions = {} & ChoppableTreeEntityOptions;

export default class BurntTreeBigEntity extends ChoppableTreeEntity {
  public constructor(options?: BurntTreeBigEntityOptions) {
    super({
      treeType: 'burnt',
      maturity: 'ancient',
      modelUri: 'models/environment/burnt-tree-big.gltf',
      modelScale: 1.15,
      name: 'Ancient Burnt Tree',
      ...options,
    });
  }
}


