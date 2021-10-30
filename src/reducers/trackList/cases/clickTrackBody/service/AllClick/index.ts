import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedProperties } from 'reducers/trackList/types';

interface Parmas {
  state?: TrackListState;
  payload?: ClickTrackBody;
}

export type SelectedTracks = SelectedBones & SelectedProperties;

export interface AllClick {
  clickSelectAll(payload: Parmas): SelectedTracks;

  clickUnselectAll(payload: Parmas): SelectedTracks;
}
