import produce from 'immer';

import { LayerTrack, PlaskLayerIdentifier } from 'types/TP/track';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, layerTrack: LayerTrack): LayerTrack[] {
  return produce(state.layerTrackList, (draft) => {
    draft.push(layerTrack);
  });
}

function setNewLayerTrack(newLayer: PlaskLayerIdentifier): LayerTrack {
  return {
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: false,
    trackName: newLayer.name,
    trackType: 'layer',
    trackNumber: -1,
    trackId: newLayer.id,
  };
}

function addLayerTrack(state: TrackListState, payload: PlaskLayerIdentifier) {
  const newLayerTrack = setNewLayerTrack(payload);
  const layerTrackList = updateLayerTrackList(state, newLayerTrack);
  return updateState(state, { layerTrackList });
}

export default addLayerTrack;
