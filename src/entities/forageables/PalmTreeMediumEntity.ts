import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type PalmTreeMediumEntityOptions = {} & ChoppableTreeEntityOptions;

export default class PalmTreeMediumEntity extends ChoppableTreeEntity {
  public constructor(options?: PalmTreeMediumEntityOptions) {
    super({
      treeType: 'palm',
      maturity: 'mature',
      modelUri: 'models/environment/palm-3.gltf',
      modelScale: 1.1,
      name: 'Palm Tree',
      ...options,
    });
  }
}


