import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type SnowTreeSmallEntityOptions = {} & ChoppableTreeEntityOptions;

export default class SnowTreeSmallEntity extends ChoppableTreeEntity {
  public constructor(options?: SnowTreeSmallEntityOptions) {
    super({
      treeType: 'snow',
      maturity: 'young',
      modelUri: 'models/environment/snowy-fir-tree-small.gltf',
      modelScale: 1.0,
      name: 'Young Snowy Fir',
      ...options,
    });
  }
}


