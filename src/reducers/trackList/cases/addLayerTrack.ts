import produce from 'immer';

import { AddLayerTrack } from 'actions/trackList';
import { LayerTrack } from 'types/TP/track';
import { TrackListState } from '../index';

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateLayerTrackList(state: TrackListState, layerTrack: LayerTrack): LayerTrack[] {
  return produce(state.layerTrackList, (draft) => {
    draft.push(layerTrack);
  });
}

function setNewLayerTrack(newLayer: AddLayerTrack): LayerTrack {
  return {
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: false,
    trackName: newLayer.name,
    trackType: 'layer',
    trackNumber: -1,
    trackId: newLayer.id,
    parentTrackNumber: -1,
  };
}

function addLayerTrack(state: TrackListState, payload: AddLayerTrack) {
  const newLayerTrack = setNewLayerTrack(payload);
  const layerTrackList = updateLayerTrackList(state, newLayerTrack);
  return updateState(state, { layerTrackList });
}

export default addLayerTrack;
