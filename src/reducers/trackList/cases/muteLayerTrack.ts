import produce from 'immer';

import { LayerTrack, PlaskLayerIdentifier } from 'types/TP/track';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, payload: PlaskLayerIdentifier): LayerTrack[] {
  const { name } = payload;
  const layerIndex = state.layerTrackList.findIndex((layer) => layer.trackName === name);
  return produce(state.layerTrackList, (draft) => {
    draft[layerIndex].isMuted = !draft[layerIndex].isMuted;
  });
}

function muteLayerTrack(state: TrackListState, payload: PlaskLayerIdentifier) {
  const layerTrackList = updateLayerTrackList(state, payload);
  return updateState(state, { layerTrackList });
}

export default muteLayerTrack;
