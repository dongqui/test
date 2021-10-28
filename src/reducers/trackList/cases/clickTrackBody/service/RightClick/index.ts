import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';

interface Parmas {
  state?: TrackListState;
  payload?: ClickTrackBody;
}

export type SelectedTracks = SelectedBones & SelectedTransforms;

export interface RightClick {
  clickRightSelectedTrack(params: Parmas): SelectedTracks;

  clickRightNotSelectedTrack(params: Parmas): SelectedTracks;
}
