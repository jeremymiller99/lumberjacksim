import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type OakTreeSmallEntityOptions = {} & ChoppableTreeEntityOptions;

export default class OakTreeSmallEntity extends ChoppableTreeEntity {
  public constructor(options?: OakTreeSmallEntityOptions) {
    super({
      treeType: 'oak',
      maturity: 'young',
      modelUri: 'models/environment/oak-tree-small.gltf',
      modelScale: 1.0,
      name: 'Young Oak Tree',
      ...options,
    });
  }
}
