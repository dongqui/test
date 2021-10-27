import { KeyframesState } from './index';

export type LayerKeyframes = Pick<KeyframesState, 'layerKeyframes'>;
export type BoneKeyframes = Pick<KeyframesState, 'boneKeyframes'>;
export type TransformKeyframes = Pick<KeyframesState, 'transformKeyframes'>;
export type KeyframesUnion =
  | Pick<KeyframesState, 'layerKeyframes'>
  | Pick<KeyframesState, 'boneKeyframes'>
  | Pick<KeyframesState, 'transformKeyframes'>;
export type AllKeyframes = Pick<
  KeyframesState,
  'layerKeyframes' | 'boneKeyframes' | 'transformKeyframes'
>;

export type SelectedLayerKeyframes = Pick<KeyframesState, 'selectedLayerKeyframes'>;
export type SelectedBoneKeyframes = Pick<KeyframesState, 'selectedBoneKeyframes'>;
export type SelectedTransformKeyframes = Pick<KeyframesState, 'selectedTransformKeyframes'>;
export type SelectedKeyframesUnion =
  | Pick<KeyframesState, 'selectedLayerKeyframes'>
  | Pick<KeyframesState, 'selectedBoneKeyframes'>
  | Pick<KeyframesState, 'selectedTransformKeyframes'>;
export type AllSelectedKeyframes = Pick<
  KeyframesState,
  'selectedLayerKeyframes' | 'selectedBoneKeyframes' | 'selectedTransformKeyframes'
>;
