import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type PalmTreeSmallEntityOptions = {} & ChoppableTreeEntityOptions;

export default class PalmTreeSmallEntity extends ChoppableTreeEntity {
  public constructor(options?: PalmTreeSmallEntityOptions) {
    super({
      treeType: 'palm',
      maturity: 'young',
      modelUri: 'models/environment/palm-1.gltf',
      modelScale: 0.9,
      name: 'Young Palm Tree',
      ...options,
    });
  }
}


