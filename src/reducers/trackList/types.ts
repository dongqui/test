import { TrackListState } from './index';

export type InterpolationTypeState = Pick<TrackListState, 'interpolationType'>;

export type SelectedLayer = Pick<TrackListState, 'selectedLayer'>;
export type SelectedBones = Pick<TrackListState, 'selectedBones'>;
export type SelectedTransforms = Pick<TrackListState, 'selectedTransforms'>;

export type LayerTrackList = Pick<TrackListState, 'layerTrackList'>;
export type BoneTrackList = Pick<TrackListState, 'boneTrackList'>;
export type TrnasformTrackList = Pick<TrackListState, 'transformTrackList'>;
