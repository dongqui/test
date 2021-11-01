import produce from 'immer';

import { LayerTrack } from 'types/TP/track';
import { TrackListState } from 'reducers/trackList';

import { Repository } from './index';

class LayerTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  public toggleIsPointedDownCaret = (trackIndex: number, isPointedDown: boolean): LayerTrack[] => {
    return produce(this.state.layerTrackList, (draft) => {
      draft[trackIndex].isPointedDownCaret = isPointedDown;
    });
  };
}

export default LayerTrackRepository;
