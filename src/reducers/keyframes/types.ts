import { KeyframesState } from './index';

export type LayerKeyframes = Pick<KeyframesState, 'layerTrack'>;
export type BoneKeyframes = Pick<KeyframesState, 'boneTrackList'>;
export type PropertyKeyframes = Pick<KeyframesState, 'propertyTrackList'>;
export type KeyframesUnion =
  | Pick<KeyframesState, 'layerTrack'>
  | Pick<KeyframesState, 'boneTrackList'>
  | Pick<KeyframesState, 'propertyTrackList'>;
export type AllKeyframes = Pick<
  KeyframesState,
  'layerTrack' | 'boneTrackList' | 'propertyTrackList'
>;

export type SelectedLayerKeyframes = Pick<KeyframesState, 'selectedLayerKeyframes'>;
export type SelectedBoneKeyframes = Pick<KeyframesState, 'selectedBoneKeyframes'>;
export type SelectedPropertyKeyframes = Pick<KeyframesState, 'selectedPropertyKeyframes'>;
export type SelectedKeyframesUnion =
  | Pick<KeyframesState, 'selectedLayerKeyframes'>
  | Pick<KeyframesState, 'selectedBoneKeyframes'>
  | Pick<KeyframesState, 'selectedPropertyKeyframes'>;
export type AllSelectedKeyframes = Pick<
  KeyframesState,
  'selectedLayerKeyframes' | 'selectedBoneKeyframes' | 'selectedPropertyKeyframes'
>;
