import { TrackListState } from './index';

// export type InterpolationTypeState = Pick<TrackListState, 'interpolationType'>;

export type SelectedLayer = Pick<TrackListState, 'selectedLayer'>;
export type SelectedBones = Pick<TrackListState, 'selectedBones'>;
export type SelectedProperties = Pick<TrackListState, 'selectedProperties'>;

export type LayerTrackList = Pick<TrackListState, 'layerTrackList'>;
export type BoneTrackList = Pick<TrackListState, 'boneTrackList'>;
export type PropertyTrackList = Pick<TrackListState, 'propertyTrackList'>;
