import produce from 'immer';
import { TrackListState } from 'reducers/trackList';
import { Repository } from './index';

class LayerTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  private findLayerIndex = (layerId: string) => {
    return this.state.layerTrackList.findIndex((layer) => layer.layerId === layerId);
  };

  public updateIsSelected = (layerId: string) => {
    const { selectedLayer, layerTrackList } = this.state;
    const currentLayerIndex = this.findLayerIndex(selectedLayer);
    const nextLayerIndex = this.findLayerIndex(layerId);
    return produce(layerTrackList, (draft) => {
      draft[currentLayerIndex].isSelected = false;
      draft[nextLayerIndex].isSelected = true;
    });
  };
}

export default LayerTrackRepository;
