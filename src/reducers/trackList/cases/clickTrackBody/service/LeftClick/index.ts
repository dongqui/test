import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedLayer, SelectedBones, SelectedProperties } from 'reducers/trackList/types';

interface Parmas {
  state?: TrackListState;
  payload?: ClickTrackBody;
}

export interface LeftClick {
  clickLeft(parmas: Parmas): SelectedLayer | (SelectedBones & SelectedProperties);
}
