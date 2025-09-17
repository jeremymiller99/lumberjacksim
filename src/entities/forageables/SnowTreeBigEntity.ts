import ChoppableTreeEntity, { ChoppableTreeEntityOptions } from './ChoppableTreeEntity';

export type SnowTreeBigEntityOptions = {} & ChoppableTreeEntityOptions;

export default class SnowTreeBigEntity extends ChoppableTreeEntity {
  public constructor(options?: SnowTreeBigEntityOptions) {
    super({
      treeType: 'snow',
      maturity: 'ancient',
      modelUri: 'models/environment/snowy-fir-tree-big.gltf',
      modelScale: 1.2,
      name: 'Ancient Snowy Fir',
      ...options,
    });
  }
}


