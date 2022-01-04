import { LayerTrack } from 'types/TP/track';
import { ClickLayerTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { StateUpdate } from 'reducers/trackList/classes';
import { LayerTrackList, SelectedLayer } from 'reducers/trackList/types';

import LeftClick from './LeftClick/LayerTrack';
import { Service } from './index';
import { Repository } from '../repository';

class LayerTrackService extends StateUpdate implements Service {
  private readonly payload: ClickLayerTrackBody;
  private readonly repository: Repository;

  constructor(state: TrackListState, payload: ClickLayerTrackBody, repository: Repository) {
    super(state);
    this.payload = payload;
    this.repository = repository;
  }

  selectClickType = () => {
    const { payload } = this;
    const { clickLeft } = new LeftClick();
    return clickLeft({ payload });
  };

  updateTrackList = (selectedTrackList: SelectedLayer): LayerTrackList => {
    const { selectedLayer } = selectedTrackList;
    const layerTrackList = this.repository.updateIsSelected(selectedLayer);
    return { layerTrackList: layerTrackList as LayerTrack[] };
  };

  updateReducerState = (newValues: Partial<TrackListState>): TrackListState => {
    return this.updateState(newValues);
  };
}

export default LayerTrackService;
