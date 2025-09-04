import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type OakTreeBigEntityOptions = {} & ChoppableTreeEntityOptions;

export default class OakTreeBigEntity extends ChoppableTreeEntity {
  public constructor(options?: OakTreeBigEntityOptions) {
    super({
      treeType: 'oak',
      maturity: 'ancient',
      modelUri: 'models/environment/oak-tree-big.gltf',
      modelScale: 1.0,
      name: 'Ancient Oak Tree',
      ...options,
    });
  }
}
