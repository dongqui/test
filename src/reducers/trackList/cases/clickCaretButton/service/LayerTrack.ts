import { LayerTrack } from 'types/TP/track';
import { ClickLayerCaretButton } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { StateUpdate } from 'reducers/trackList/classes';
import { LayerTrackList } from 'reducers/trackList/types';

import { Service } from './index';
import { Repository } from '../repository';

class BoneTrackService extends StateUpdate implements Service {
  private readonly payload: ClickLayerCaretButton;
  private readonly repository: Repository;

  constructor(state: TrackListState, payload: ClickLayerCaretButton, repository: Repository) {
    super(state);
    this.payload = payload;
    this.repository = repository;
  }

  public findTrackIndex = (): number => {
    const { layerTrackList } = this.state;
    const { trackId } = this.payload;
    const trackIndex = layerTrackList.findIndex((layerTrack) => layerTrack.trackId === trackId);
    return trackIndex;
  };

  public updateTrackList = (index: number): LayerTrackList => {
    const { isPointedDownCaret } = this.payload;
    const layerTrackList = this.repository.toggleIsPointedDownCaret(index, isPointedDownCaret);
    return { layerTrackList: layerTrackList as LayerTrack[] };
  };

  public updateTrackListState = (trackList: LayerTrackList): TrackListState => {
    return this.updateState(trackList);
  };
}

export default BoneTrackService;
