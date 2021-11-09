import { ClickLayerCaretButton, ClickBoneCaretButton } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';

import LayerTrackService from './service/LayerTrack';
import LayerTrackRepository from './repository/LayerTrack';

import BoneTrackService from './service/BoneTrack';
import BoneTrackRepository from './repository/BoneTrack';

export const layerKeyframeConfig = (state: TrackListState, payload: ClickLayerCaretButton) => {
  const repository = new LayerTrackRepository(state);
  const service = new LayerTrackService(state, payload, repository);
  const trackIndex = service.findTrackIndex();
  const trackList = service.updateTrackList(trackIndex);
  return service.updateTrackListState(trackList);
};

export const boneKeyframeConfig = (state: TrackListState, payload: ClickBoneCaretButton) => {
  const repository = new BoneTrackRepository(state);
  const service = new BoneTrackService(state, payload, repository);
  const trackIndex = service.findTrackIndex();
  const trackList = service.updateTrackList(trackIndex);
  return service.updateTrackListState(trackList);
};
