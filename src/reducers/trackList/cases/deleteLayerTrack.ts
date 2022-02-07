import produce from 'immer';

import { LayerTrack, PlaskLayerIdentifier } from 'types/TP/track';
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

function deleteLayerTrack(state: TrackListState, payload: PlaskLayerIdentifier) {
  const layerTrackList = updateLayerTrackList(state, payload.name);
  return updateState(state, { layerTrackList });
}

export default deleteLayerTrack;
