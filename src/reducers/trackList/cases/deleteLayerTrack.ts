import produce from 'immer';

import { LayerTrack } from 'types/TP_New/track';
import { DeleteLayerTrack } from 'actions/trackList';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, trackName: string): LayerTrack[] {
  const layerIndex = state.layerTrackList.findIndex((layer) => layer.trackName === trackName);
  return produce(state.layerTrackList, (draft) => {
    draft.splice(layerIndex, 1);
  });
}

function deleteLayerTrack(state: TrackListState, payload: DeleteLayerTrack) {
  const layerTrackList = updateLayerTrackList(state, payload.trackName);
  return updateState(state, { layerTrackList });
}

export default deleteLayerTrack;
