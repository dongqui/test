import produce from 'immer';

import { MuteLayerTrack } from 'actions/trackList';
import { LayerTrack } from 'types/TP/track';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, payload: MuteLayerTrack): LayerTrack[] {
  const layerIndex = state.layerTrackList.findIndex((layer) => layer.trackId === payload.id);
  return produce(state.layerTrackList, (draft) => {
    draft[layerIndex].isMuted = !draft[layerIndex].isMuted;
  });
}

function muteLayerTrack(state: TrackListState, payload: MuteLayerTrack) {
  const layerTrackList = updateLayerTrackList(state, payload);
  return updateState(state, { layerTrackList });
}

export default muteLayerTrack;
