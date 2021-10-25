import { KeyframesState } from './index';

export type KeyframesUnion =
  | Pick<KeyframesState, 'layerKeyframes'>
  | Pick<KeyframesState, 'boneKeyframes'>
  | Pick<KeyframesState, 'transformKeyframes'>;
export type AllKeyframes = Pick<
  KeyframesState,
  'layerKeyframes' | 'boneKeyframes' | 'transformKeyframes'
>;

export type SelectedKeyframesUnion =
  | Pick<KeyframesState, 'selectedLayerKeyframes'>
  | Pick<KeyframesState, 'selectedBoneKeyframes'>
  | Pick<KeyframesState, 'selectedTransformKeyframes'>;
export type AllSelectedKeyframes = Pick<
  KeyframesState,
  'selectedLayerKeyframes' | 'selectedBoneKeyframes' | 'selectedTransformKeyframes'
>;
