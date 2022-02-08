import produce from 'immer';

import { DeleteLayerTrack } from 'actions/trackList';
import { LayerTrack } from 'types/TP/track';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, payload: DeleteLayerTrack): LayerTrack[] {
  const layerIndex = state.layerTrackList.findIndex((layer) => layer.trackId === payload.id);
  return produce(state.layerTrackList, (draft) => {
    draft.splice(layerIndex, 1);
  });
}

function deleteLayerTrack(state: TrackListState, payload: DeleteLayerTrack) {
  const layerTrackList = updateLayerTrackList(state, payload);
  return updateState(state, { layerTrackList });
}

export default deleteLayerTrack;
