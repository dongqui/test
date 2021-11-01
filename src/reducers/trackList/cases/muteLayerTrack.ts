import produce from 'immer';

import { LayerTrack } from 'types/TP/track';
import { MuteLayerTrack } from 'actions/trackList';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, payload: MuteLayerTrack): LayerTrack[] {
  const { trackName, isMuted } = payload;
  const layerIndex = state.layerTrackList.findIndex((layer) => layer.trackName === trackName);
  return produce(state.layerTrackList, (draft) => {
    draft[layerIndex].isMuted = isMuted;
  });
}

function muteLayerTrack(state: TrackListState, payload: MuteLayerTrack) {
  const layerTrackList = updateLayerTrackList(state, payload);
  return updateState(state, { layerTrackList });
}

export default muteLayerTrack;
