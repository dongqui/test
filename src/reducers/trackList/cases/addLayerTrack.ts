import produce from 'immer';

import { LayerTrack } from 'types/TP_New/track';
import { AddLayerTrack } from 'actions/trackList';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, layerTrack: LayerTrack): LayerTrack[] {
  return produce(state.layerTrackList, (draft) => {
    draft.push(layerTrack);
  });
}

function setNewLayerTrack(trackName: string): LayerTrack {
  return {
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: false,
    trackName,
    layerId: trackName,
  };
}

function addLayerTrack(state: TrackListState, payload: AddLayerTrack) {
  const newLayerTrack = setNewLayerTrack(payload.trackName);
  const layerTrackList = updateLayerTrackList(state, newLayerTrack);
  return updateState(state, { layerTrackList });
}

export default addLayerTrack;
