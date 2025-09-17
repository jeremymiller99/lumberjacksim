import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type SnowTreeMediumEntityOptions = {} & ChoppableTreeEntityOptions;

export default class SnowTreeMediumEntity extends ChoppableTreeEntity {
  public constructor(options?: SnowTreeMediumEntityOptions) {
    super({
      treeType: 'snow',
      maturity: 'mature',
      modelUri: 'models/environment/snowy-fir-tree-medium.gltf',
      modelScale: 1.1,
      name: 'Snowy Fir',
      ...options,
    });
  }
}


