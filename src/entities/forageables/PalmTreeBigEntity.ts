import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type PalmTreeBigEntityOptions = {} & ChoppableTreeEntityOptions;

export default class PalmTreeBigEntity extends ChoppableTreeEntity {
  public constructor(options?: PalmTreeBigEntityOptions) {
    super({
      treeType: 'palm',
      maturity: 'ancient',
      modelUri: 'models/environment/palm-5.gltf',
      modelScale: 1.2,
      name: 'Ancient Palm Tree',
      ...options,
    });
  }
}


