import produce from 'immer';
import { TrackListState } from 'reducers/trackList';
import { SelectedLayer } from 'reducers/trackList/types';
import { Repository } from './index';

class LayerTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  private findLayerIndex = (layerId: string) => {
    return this.state.layerTrackList.findIndex((layer) => layer.layerId === layerId);
  };

  private updateLayerTrackList = (layer: SelectedLayer) => {
    const { selectedLayer, layerTrackList } = this.state;
    const currentLayerIndex = this.findLayerIndex(selectedLayer);
    const nextLayerIndex = this.findLayerIndex(layer.selectedLayer);
    return produce(layerTrackList, (draft) => {
      draft[currentLayerIndex].isSelected = false;
      draft[nextLayerIndex].isSelected = true;
    });
  };

  public updateTrackList = (layer: SelectedLayer) => {
    const layerTrackList = this.updateLayerTrackList(layer);
    return { layerTrackList };
  };

  public updateTrackListState = (params: Partial<TrackListState>) => {
    return Object.assign({}, this.state, params);
  };
}

export default LayerTrackRepository;
