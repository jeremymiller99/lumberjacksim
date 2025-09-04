import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type OakTreeMediumEntityOptions = {} & ChoppableTreeEntityOptions;

export default class OakTreeMediumEntity extends ChoppableTreeEntity {
  public constructor(options?: OakTreeMediumEntityOptions) {
    super({
      treeType: 'oak',
      maturity: 'mature',
      modelUri: 'models/environment/oak-tree-medium.gltf',
      modelScale: 1.0,
      name: 'Oak Tree',
      ...options,
    });
  }
}
