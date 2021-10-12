import { ClickLayerTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedLayer } from 'reducers/trackList/types';

import { LayerTrackLeftClick } from './LeftClick';
import { Service } from './index';
import { Repository } from '../repository';

class LayerTrackService implements Service {
  private readonly state: TrackListState;
  private readonly payload: ClickLayerTrackBody;
  private readonly repository: Repository;

  constructor(state: TrackListState, payload: ClickLayerTrackBody, repository: Repository) {
    this.state = state;
    this.payload = payload;
    this.repository = repository;
  }

  public selectClickType = () => {
    const { payload } = this;
    const { clickLeft } = new LayerTrackLeftClick();
    return clickLeft({ payload });
  };

  public updateState = (selectedTracks: SelectedLayer) => {
    const { updateTrackListState, updateTrackList } = this.repository;
    const trackList = updateTrackList(selectedTracks);
    return updateTrackListState({ ...trackList, ...selectedTracks });
  };
}

export default LayerTrackService;
