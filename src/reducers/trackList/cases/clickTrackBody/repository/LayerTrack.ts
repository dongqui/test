import produce from 'immer';
import { TrackListState } from 'reducers/trackList';
import { Repository } from './index';

class LayerTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  private findLayerIndex = (trackId: string) => {
    return this.state.layerTrackList.findIndex((layer) => layer.trackId === trackId);
  };

  public updateIsSelected = (trackId: string) => {
    const { selectedLayer, layerTrackList } = this.state;
    const currentLayerIndex = this.findLayerIndex(selectedLayer);
    const nextLayerIndex = this.findLayerIndex(trackId);
    return produce(layerTrackList, (draft) => {
      draft[currentLayerIndex].isSelected = false;
      draft[nextLayerIndex].isSelected = true;
    });
  };
}

export default LayerTrackRepository;
